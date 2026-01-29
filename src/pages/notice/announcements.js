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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-end gap-3">
          <h1 className="text-2xl font-bold">공지사항</h1>
          <span className="text-sm font-medium text-muted-foreground pb-1">
            전체{" "}
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-[140px]">작성자</TableHead>
            <TableHead className="w-[160px]">작성일</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {notices.map((notice) => (
            <TableRow
              key={notice.id}
              className="cursor-pointer hover:bg-muted"
              onClick={() => router.push(`/notice/${notice.id}`)}
            >
              <TableCell>{notice.id}</TableCell>
              <TableCell className="font-medium">{notice.title}</TableCell>
              <TableCell>{notice.writer.id}</TableCell>
              <TableCell>
                <span>{notice.createdAt.split("T")[0]}</span>
              </TableCell>
            </TableRow>
          ))}

          {notices.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                등록된 공지사항이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
