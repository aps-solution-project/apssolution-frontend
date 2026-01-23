import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Search } from "lucide-react";

import { getAllAccounts, deleteAccount } from "@/api/auth-api";
import { useToken } from "@/stores/account-store";

const columns = [
  {
    accessorKey: "accountId",
    header: "사원번호",
  },
  {
    accessorKey: "accountName",
    header: "이름",
  },
  {
    accessorKey: "role",
    header: "권한",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("role")}</span>
    ),
  },
  {
    accessorKey: "accountEmail",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        이메일 <ArrowUpDown />
      </Button>
    ),
  },
  {
    accessorKey: "workedAt",
    header: "입사일",
    cell: ({ row }) => {
      const date = row.getValue("workedAt");
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "resignedAt",
    header: "퇴사일자",
    cell: ({ row }) => {
      const date = row.getValue("resignedAt");
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    id: "option",
    header: "옵션",
    cell: ({ row }) => {
      const account = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>옵션</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => account.onResign(account.id)}
            >
              퇴사 처리
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ManagementPage() {
  const token = useToken((state) => state.token);

  const [data, setData] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);

  const handleResign = async (accountId) => {
    if (!confirm("정말 퇴사 처리하시겠습니까?")) return;

    try {
      await deleteAccount(accountId, token);
      setData((prev) =>
        prev.map((item) =>
          item.id === accountId
            ? { ...item, resignedAt: new Date().toISOString() }
            : item,
        ),
      );
    } catch (error) {
      alert(error.message);
    }
  };

  React.useEffect(() => {
    if (!token) return;

    const fetchAccounts = async () => {
      try {
        const res = await getAllAccounts(token);
        setData(
          res.accounts.map((account) => ({
            ...account,
            onResign: handleResign,
          })),
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchAccounts();
  }, [token]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!token) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <div className="relative">
          <Input
            placeholder="사원번호 검색"
            value={table.getColumn("accountId")?.getFilterValue() ?? ""}
            onChange={(e) =>
              table.getColumn("accountId")?.setFilterValue(e.target.value)
            }
            className="w-55 pl-8 pr-3 text-sm text-right"
          />
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  사원 정보가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
