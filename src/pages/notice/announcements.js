import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AnnouncementsPage() {
  const router = useRouter();
  const [notices, setNotices] = useState([]);

  // 임시 데이터 (API 붙이면 제거)
  useEffect(() => {
    setNotices([
      {
        id: 1,
        title: "시스템 점검 안내",
        writer_id: "admin01",
        created_at: "2026-01-20",
      },
      {
        id: 2,
        title: "설 연휴 운영 일정 공지",
        writer_id: "admin02",
        created_at: "2026-01-18",
      },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">공지사항</h1>
        <Button onClick={() => router.push("/notice/announcements-create")}>
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
              <TableCell>{notice.writer_id}</TableCell>
              <TableCell>
                {new Date(notice.created_at).toLocaleDateString()}
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
