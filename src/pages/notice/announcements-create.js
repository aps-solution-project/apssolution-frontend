import { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Editor from "@/components/ui/editor";

export default function AnnouncementsCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    console.log({ title, content });
    router.push("/notice/announcements");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">공지사항 작성</h1>

      <Card>
        <CardHeader>
          <CardTitle>공지 작성</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="공지 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Editor value={content} onChange={setContent} />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
