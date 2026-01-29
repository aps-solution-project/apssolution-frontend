import { deleteNotice, getNotice } from "@/api/notice-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useToken } from "@/stores/account-store";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@radix-ui/react-avatar";
import { SquarePen, List } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const { noticeId } = router.query;
  const [notice, setNotice] = useState(null);
  const { token } = useToken();
  const { account } = useAccount();
  const [isWriter, setIsWriter] = useState(false);

  useEffect(() => {
    if (!noticeId || !token) return;
    getNotice(token, noticeId).then((obj) => {
      setNotice(obj);
      if (account.id === obj.writer.id) {
        setIsWriter(true);
      }
    });
  }, [noticeId, token]);

  if (!notice) return null;

  function handleDelete(e) {
    e.preventDefault();
    if (!confirm("정말로 공지사항을 삭제하시겠습니까?")) return;
    console.log("Delete notice:", noticeId);
    deleteNotice(token, noticeId).then(() => {
      window.alert("공지사항이 성공적으로 삭제되었습니다.");
      router.push("/notice/announcements");
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/notice/announcements")}
        >
          <List className="h-4 w-4" /> 목록으로
        </Button>

        {isWriter && (
          <Button
            variant="outline"
            onClick={handleDelete}
            className="bg-red-500 text-white"
          >
            삭제
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle className="text-2xl">{notice.title}</CardTitle>
            {isWriter && (
              <Button
                variant="outline"
                onClick={() => router.push(`/notice/${noticeId}/edit`)}
              >
                <SquarePen />
              </Button>
            )}
          </div>

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
      {/* 첨부 파일 섹션 */}
      <Card className="mt-4">
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-semibold flex items-center">
            첨부 파일 ({notice.attachments ? notice.attachments.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notice.attachments && notice.attachments.length > 0 ? (
            notice.attachments.map((file, index) => {
              const downloadUrl = `http://192.168.0.20:8080/api/notices/files/download?path=${encodeURIComponent(
                file.fileUrl.replace("/apssolution/notices/", ""),
              )}`;

              return (
                <div
                  key={index}
                  className="flex items-center p-2 rounded-md border bg-muted/50"
                >
                  <span className="text-blue-500 mr-2">📎</span>
                  <a
                    href={downloadUrl}
                    className="text-sm font-medium hover:underline text-blue-600 truncate flex-1"
                  >
                    {file.fileName}
                  </a>
                </div>
              );
            })
          ) : (
            // 파일이 없을 때 보여줄 안내 문구
            <div className="text-center py-4 text-sm text-gray-400 italic">
              첨부된 파일이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
      {/* <div>
        {notice.attachments.length > 0 && (
          <div>
            {notice.attachments.map((file, index) => (
              <div key={index} className="mb-2">
                <a
                  href={`http://192.168.0.20:8080/api/notices/files/download?path=${file.fileUrl.replace("/apssolution/notices/", "")}`}
                >
                  {file.fileName} - 다운로드 수정중({file.fileUrl})
                </a>
              </div>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
}
