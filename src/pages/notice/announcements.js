import { getNotices } from "@/api/notice-api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToken } from "@/stores/account-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/use-authGuard";

export default function AnnouncementsPage() {
  useAuthGuard();
  const router = useRouter();
  const [notices, setNotices] = useState([]);
  const { token } = useToken();
  // 임시 데이터 (API 붙이면 제거)
  useEffect(() => {
    if (!token) return;
    getNotices(token).then((obj) => {
      setNotices(obj.notices);
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-white -m-8 p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-end gap-3">
          <h1 className="text-2xl font-bold text-slate-800">공지사항</h1>
          <span className="text-sm font-medium text-muted-foreground pb-1">
            전체
            <span className="text-blue-600 font-bold">{notices.length}</span>건
          </span>
        </div>
        <Button
          className="bg-indigo-900 hover:bg-indigo-500 text-white cursor-pointer"
          onClick={() => router.push("/notice/announcements-create")}
        >
          공지 작성
        </Button>
      </div>

      <div className="rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[80px] font-bold text-slate-600">
                ID
              </TableHead>
              <TableHead className="font-bold text-slate-600">제목</TableHead>
              <TableHead className="w-[140px] font-bold text-slate-600">
                작성자
              </TableHead>
              <TableHead className="w-[160px] font-bold text-slate-600">
                작성일
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {notices.map((notice) => (
              <TableRow
                key={notice.id}
                className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                onClick={() => router.push(`/notice/${notice.id}`)}
              >
                <TableCell lassName="font-mono text-slate-500">
                  {notice.id}
                </TableCell>
                <TableCell className="font-semibold text-slate-700">
                  {notice.title}
                </TableCell>
                <TableCell className="text-slate-600">
                  {notice.writer.id}
                </TableCell>
                <TableCell className="text-slate-500">
                  <span>{notice.createdAt.split("T")[0]}</span>
                </TableCell>
              </TableRow>
            ))}

            {notices.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-slate-400"
                >
                  등록된 공지사항이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
