import { getAccountDetail, updateMyAccount } from "@/api/auth-api";
import { getComments } from "@/api/community-api";
import { useEffect, useState } from "react";
import { useAccount, useToken } from "@/stores/account-store";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { Camera, Shield, FileText, MessageCircle } from "lucide-react";

const API_BASE_URL = "http://192.168.0.20:8080";

export default function MyProfilePage() {
  const account = useAccount((s) => s.account);
  const token = useToken((s) => s.token);

  useAuthGuard();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [preview, setPreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [myPosts, setMyPosts] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!account?.accountId || !token) return;

    getAccountDetail(token, account.accountId).then((obj) => {
      setEmail(obj.email || "");
      setRole(obj.role || "");

      if (obj.profileImageUrl) {
        const url = obj.profileImageUrl.startsWith("http")
          ? obj.profileImageUrl
          : `${API_BASE_URL}${obj.profileImageUrl}`;
        setPreview(url);
      }
    });
  }, [account?.accountId, token]);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE_URL}/api/notices/myNotice`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(async (posts) => {
        setMyPosts(posts);

        const map = {};

        await Promise.all(
          posts.map(async (p) => {
            try {
              const comments = await getComments(token, p.noticeId);
              map[p.noticeId] = comments;
            } catch {
              map[p.noticeId] = [];
            }
          }),
        );

        setCommentsMap(map);
      })
      .finally(() => setLoadingPosts(false));
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageSave = async () => {
    if (!profileImage) return;

    const formData = new FormData();
    formData.append("profileImage", profileImage);

    await updateMyAccount(account.accountId, formData, token);
    alert("프로필 사진이 변경되었습니다");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-[280px_1fr] gap-10">
        <div className="bg-white rounded-xl border p-6 text-center">
          <div className="relative mx-auto w-32 h-32 mb-4">
            {preview && (
              <img
                src={preview}
                className="w-full h-full rounded-full object-cover border"
              />
            )}
            <label className="absolute bottom-1 right-1 bg-white border rounded-full p-2 cursor-pointer hover:bg-slate-100">
              <Camera size={16} />
              <input type="file" hidden onChange={handleImageChange} />
            </label>
          </div>

          {profileImage && (
            <button
              onClick={handleImageSave}
              className="w-full mt-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg"
            >
              사진 저장
            </button>
          )}

          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-4 border mt-6">
            <div>
              <p className="text-xs text-slate-400 font-semibold">EMAIL</p>
              <p className="font-medium">{email}</p>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-slate-400 font-semibold">ROLE</p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <Shield size={14} /> {role}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden flex flex-col">
          <div className="flex border-b">
            <button
              onClick={() =>
                (window.location.href = "/myInformation/myProfile")
              }
              className="px-8 py-4 text-slate-400 hover:text-slate-700"
            >
              계정 관리
            </button>
            <button className="px-8 py-4 font-semibold border-b-2 border-black">
              내가 쓴 글
            </button>
          </div>

          <div className="p-6 bg-slate-50 flex-1 overflow-y-auto">
            {loadingPosts && (
              <p className="text-sm text-slate-400">불러오는 중...</p>
            )}

            {!loadingPosts && myPosts.length === 0 && (
              <div className="text-center text-slate-400 py-20">
                작성한 글이 없습니다
              </div>
            )}

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
              {myPosts.map((post) => (
                <div key={post.noticeId} className="space-y-3">
                  <div
                    onClick={() =>
                      (window.location.href = `/community/${post.noticeId}`)
                    }
                    className="border rounded-2xl bg-white p-5 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex gap-3">
                      <div className="bg-sky-100 text-sky-600 p-2 rounded-lg">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-2">
                          {post.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(commentsMap[post.noticeId] || []).map((c) => (
                    <div
                      key={c.commentId}
                      className="border rounded-xl bg-white p-4 flex gap-3 cursor-pointer hover:bg-slate-50 transition"
                      onClick={() =>
                        (window.location.href = `/community/${post.noticeId}`)
                      }
                    >
                      <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                        <MessageCircle size={16} />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-slate-700 line-clamp-3">
                          {c.content}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {c.writerName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
