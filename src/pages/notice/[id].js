import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!id) return;

    setNotice({
      id,
      title: "시스템 점검 안내",
      writer_id: "admin01",
      created_at: "2026-01-20",
      content: `
        <p>안녕하세요.</p>
        <p><strong>시스템 점검</strong>으로 인해 서비스가 일시 중단됩니다.</p>
        <ul>
          <li>일시: 1월 25일 02:00~04:00</li>
          <li>영향: 전체 서비스</li>
        </ul>
      `,
    });
  }, [id]);

  if (!notice) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        ← 목록으로
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{notice.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            작성자 {notice.writer_id} ·{" "}
            {new Date(notice.created_at).toLocaleDateString()}
          </p>
        </CardHeader>

        <CardContent>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: notice.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
