import { getNotice } from "@/api/notice-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToken } from "@/stores/account-store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const { noticeId } = router.query;
  const [notice, setNotice] = useState(null);
  const { token } = useToken();

  useEffect(() => {
    if (!noticeId || !token) return;

    getNotice(token, noticeId).then((obj) => {
      setNotice(obj);
    });
  }, [noticeId, token]);

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
            <Avatar className="size-15 h-10 mr-2 inline-block">
              <AvatarImage
                src={"http://192.168.0.20:8080" + notice.writer.profileImageUrl}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            작성자 - {notice.writer.name} ·{" "}
            <span>
              {new Date(notice.createdAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </CardHeader>

        <CardContent>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: notice.content }}
          />
        </CardContent>
      </Card>
      <div>
        {notice.attachments.length > 0 && (
          <div>
            {notice.attachments.map((file, index) => (
              <div key={index} className="mb-2">
                <a
                  href={`http://192.168.0.20:8080/api/notices/files/download?path=${file.fileUrl.replace("/apssolution/notices/", "")}`}
                >
                  {file.fileName} - 다운로드({file.fileUrl})
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
