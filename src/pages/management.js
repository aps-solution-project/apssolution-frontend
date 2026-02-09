import { Loader2, MoreHorizontal, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { createAccount, deleteAccount, getAllAccounts } from "@/api/auth-api";
import AdminProfileEditModal from "@/components/layout/modal/adminProfileSetting";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";

export default function ManagementPage() {
  useAuthGuard();

  const token = useToken((state) => state.token);
  const loginAccount = useAccount((state) => state.account);
  if (!loginAccount) return null;

  const isAdmin = loginAccount.role === "ADMIN";

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [target, setTarget] = useState({});

  const [newAccount, setNewAccount] = useState({
    name: "",
    email: "",
    role: "WORKER",
  });

  /* =========================
     컬럼 정의
  ========================= */

  const roleColor = {
    ADMIN: "bg-red-500/10 text-red-600",
    PLANNER: "bg-blue-500/10 text-blue-600",
    WORKER: "bg-emerald-500/10 text-emerald-600",
  };

  const columns = [
    {
      accessorKey: "accountId",
      header: "사원번호",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("accountId")}</span>
      ),
    },
    {
      accessorKey: "accountName",
      header: "이름",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("accountName")}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "권한",
      cell: ({ row }) => {
        const role = row.getValue("role");
        return (
          <Badge variant="outline" className={roleColor[role]}>
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "accountEmail",
      header: "이메일",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("accountEmail")}
        </span>
      ),
    },
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
      header: "상태",
      cell: ({ row }) =>
        row.getValue("resignedAt") ? (
          <Badge variant="secondary">퇴직 | {row.getValue("resignedAt")}</Badge>
        ) : (
          <Badge className="bg-emerald-500/10 text-emerald-600">재직중</Badge>
        ),
    },
    {
      id: "option",
      header: "",
      cell: ({ row }) => {
        const account = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>관리</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => {
                  setProfileOpen(true);
                  setTarget({
                    id: account.accountId,
                    name: account.accountName,
                    email: account.accountEmail,
                    role: account.role,
                    workedAt: account.workedAt,
                    resignedAt: account.resignedAt,
                    profileImageUrl: account.profileImageUrl,
                  });
                }}
              >
                상세 정보
              </DropdownMenuItem>

              {!account.resignedAt && isAdmin && (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
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

  /* =========================
     데이터 로딩
  ========================= */

  useEffect(() => {
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

  /* =========================
     이벤트
  ========================= */

  const handleSave = async () => {
    if (!isAdmin) return alert("ADMIN만 가능합니다.");

    setIsSaving(true);
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
        "사원 계정이 생성되었습니다.\n임시 비밀번호는 이메일로 발송되었습니다.",
      );

      setIsAdding(false);
      setNewAccount({ name: "", email: "", role: "WORKER" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (accountId) => {
    if (!isAdmin) return alert("ADMIN만 가능합니다.");
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

  /* =========================
     렌더링
  ========================= */

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">사원 관리</h2>
          <p className="text-sm text-muted-foreground">
            사원 계정 생성 및 권한 관리
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsAdding(true)}>+ 사원 추가</Button>
        )}
      </div>

      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="사원번호 검색"
          className="pl-8"
          value={table.getColumn("accountId")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("accountId")?.setFilterValue(e.target.value)
          }
        />
      </div>

      <AdminProfileEditModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        account={target}
      />

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
                    <option value="PLANNER">PLANNER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="이메일"
                    value={newAccount.email}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, email: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          저장 중...
                        </span>
                      ) : (
                        "저장"
                      )}
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
              <TableRow
                key={row.id}
                className={row.original.resignedAt ? "opacity-60" : ""}
              >
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
    </div>
  );
}
