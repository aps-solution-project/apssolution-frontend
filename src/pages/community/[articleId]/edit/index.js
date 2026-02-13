import { editWorkerPost, getPostDetail } from "@/api/community-api";
import CommunityForm from "@/components/community/community-form";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";
import { ChevronLeft, PenLine, X } from "lucide-react"; // 아이콘 추가
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CommunityEditPage() {
  useAuthGuard();
  const router = useRouter();
  const loginAccount = useAccount((state) => state.account);
  const { articleId } = router.query;
  const token = useToken((state) => state.token);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (
      !router.isReady ||
      !articleId ||
      articleId === "undefined" ||
      !token ||
      loginAccount?.role === "ADMIN" ||
      loginAccount?.role === "PLANNER"
    )
      return;

    getPostDetail(token, articleId)
      .then((post) => {
        if (post) {
          setTitle(post.title || "");
          setContent(post.content || "");
          setFiles(post.attachments || []);
        }
      })
      .catch((e) => {
        console.error("데이터 로드 에러:", e);
        alert("게시글을 불러오지 못했습니다.");
      });
  }, [router.isReady, articleId, token, loginAccount?.role]);

  if (loginAccount?.role === "ADMIN" || loginAccount?.role === "PLANNER") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <X className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">접근 권한 제한</h2>
        <p className="text-slate-500 font-medium text-center">
          사원게시판 페이지는 사원(WORKER) 전용 구역입니다.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="rounded-xl"
        >
          메인으로 돌아가기
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      if (files && files.length > 0) {
        files.forEach((file) => {
          if (file instanceof File) {
            formData.append("attachments", file);
          }
        });
      }

      // 3. API 호출
      const res = await editWorkerPost(token, articleId, formData);

      if (res) {
        alert("게시글이 수정되었습니다.");
        router.push(`/community/${articleId}`);
      }
    } catch (err) {
      console.error("수정 API 에러:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    // 1. 부모 배경색 차단을 위한 min-h-full bg-white -m-8 적용
    <div className="min-h-full bg-white -m-8 p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* 상단 헤더: 뒤로가기 버튼과 페이지 제목 결합 */}
        <header className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-800 -ml-2 gap-1"
          >
            <ChevronLeft size={18} />
            <span className="font-bold">이전으로</span>
          </Button>
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <PenLine size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                Edit Mode
              </p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                게시글 수정
              </h1>
            </div>
          </div>
          <div className="h-1 w-20 bg-indigo-600 rounded-full" />{" "}
          {/* 포인트 강조선 */}
        </header>

        {/* 폼 영역: CommunityForm 내부 스타일은 유지하되 감싸는 여백 최적화 */}
        <section className="bg-slate-50/30 p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <CommunityForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            files={files}
            setFiles={setFiles}
            onSubmit={handleSave}
            submitText="수정 내용 저장하기"
            onCancel={() => router.back()}
          />
        </section>

        <footer className="text-center pb-10">
          <p className="text-xs text-slate-300 font-medium">
            게시글 수정 시 작성 일시는 변경되지 않으며, 수정 표시가 남을 수
            있습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}
