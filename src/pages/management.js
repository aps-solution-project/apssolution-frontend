import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal } from "lucide-react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { getAllAccounts, deleteAccount, createAccount } from "@/api/auth-api";
import { useToken, useAccount } from "@/stores/account-store";

const columns = [
  { accessorKey: "accountId", header: "사원번호" },
  { accessorKey: "accountName", header: "이름" },
  { accessorKey: "role", header: "권한" },
  { accessorKey: "accountEmail", header: "이메일" },
  {
    accessorKey: "workedAt",
    header: "입사일",
    cell: ({ row }) =>
      row.getValue("workedAt")
        ? new Date(row.getValue("workedAt")).toLocaleDateString()
        : "-",
  },
  {
    accessorKey: "resignedAt",
    header: "퇴사일",
    cell: ({ row }) =>
      row.getValue("resignedAt")
        ? new Date(row.getValue("resignedAt")).toLocaleDateString()
        : "-",
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
            <DropdownMenuItem onClick={() => alert("상세 정보 준비중")}>
              상세 정보
            </DropdownMenuItem>
            {!account.resignedAt && (
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => account.onDelete(account.accountId)}
              >
                퇴사 처리
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ManagementPage() {
  const token = useToken((state) => state.token);
  const loginAccount = useAccount((state) => state.account);

  if (!loginAccount) return null;
  const isAdmin = loginAccount.role === "ADMIN";

  const [data, setData] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [isAdding, setIsAdding] = React.useState(false);

  const [newAccount, setNewAccount] = React.useState({
    name: "",
    email: "",
    role: "WORKER",
  });

  React.useEffect(() => {
    if (!token) return;

    const fetchAccounts = async () => {
      const res = await getAllAccounts(token);
      setData(
        res.accounts.map((a) => ({
          ...a,
          onDelete: handleDelete,
        })),
      );
    };

    fetchAccounts();
  }, [token]);

  const handleSave = async () => {
    if (!isAdmin) {
      alert("ADMIN만 가능합니다.");
      return;
    }

    try {
      const res = await createAccount(
        {
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.role,
        },
        token,
      );

      setData((prev) => [{ ...res, onDelete: handleDelete }, ...prev]);

      alert(
        "사원 계정이 생성되었습니다.\n임시 비밀번호는 입력한 이메일로 발송되었습니다.",
      );

      setIsAdding(false);
      setNewAccount({
        name: "",
        email: "",
        role: "WORKER",
      });
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (accountId) => {
    if (!isAdmin) {
      alert("ADMIN만 가능합니다.");
      return;
    }
    if (!confirm("정말 퇴사 처리하시겠습니까?")) return;

    await deleteAccount(accountId, token);

    setData((prev) =>
      prev.map((item) =>
        item.accountId === accountId
          ? { ...item, resignedAt: new Date().toISOString() }
          : item,
      ),
    );
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="relative">
          <Input
            placeholder="사원번호 검색"
            value={table.getColumn("accountId")?.getFilterValue() ?? ""}
            onChange={(e) =>
              table.getColumn("accountId")?.setFilterValue(e.target.value)
            }
            className="pl-8"
          />
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
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
            {isAdding && (
              <TableRow className="bg-muted/50">
                <TableCell className="text-muted-foreground">
                  자동 생성
                </TableCell>

                <TableCell>
                  <Input
                    placeholder="사원 이름"
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, name: e.target.value })
                    }
                  />
                </TableCell>

                <TableCell>
                  <select
                    className="border rounded px-2 py-1"
                    value={newAccount.role}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, role: e.target.value })
                    }
                  >
                    <option value="WORKER">WORKER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </TableCell>

                <TableCell>
                  <Input
                    placeholder="이메일 (ex: example@naver.com)"
                    value={newAccount.email}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, email: e.target.value })
                    }
                  />
                </TableCell>

                <TableCell className="text-muted-foreground">
                  자동 설정
                </TableCell>

                <TableCell>-</TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                    >
                      취소
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={() => setIsAdding(true)}>
          + 사원 추가하기
        </Button>
      </div>
    </div>
  );
}
