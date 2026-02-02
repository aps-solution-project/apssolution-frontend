import {
  changeMyPassword,
  getAccountDetail,
  updateMyAccount,
} from "@/api/auth-api";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useToken } from "@/stores/account-store";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Pencil, Shield, Check, X } from "lucide-react";

const API_BASE_URL = "http://192.168.0.20:8080";

export default function MyProfilePage() {
  const account = useAccount((s) => s.account);
  const setAccount = useAccount((s) => s.setAccount);
  const token = useToken((s) => s.token);

  useAuthGuard();

  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [readOnlyData, setReadOnlyData] = useState({
    accountId: "",
    name: "",
    role: "",
    workedAt: "",
  });

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");

  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  const passwordValid = newPw.length >= 6 && newPw === newPwConfirm;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    if (!emailValid) return alert("이메일 형식이 올바르지 않습니다");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("email", email);
      if (profileImage) formData.append("profileImage", profileImage);

      await updateMyAccount(account.accountId, formData, token);
      const updated = await getAccountDetail(token, account.accountId);
      setAccount(updated);

      alert("프로필이 수정되었습니다");

      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPw || !passwordValid) return;

    try {
      setLoading(true);
      await changeMyPassword(
        account.accountId,
        { oldPw, newPw, newPwConfirm },
        token,
      );

      setOldPw("");
      setNewPw("");
      setNewPwConfirm("");
      setEditingPassword(false);
      alert("비밀번호 변경 완료");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!account?.accountId || !token) return;

    getAccountDetail(token, account.accountId).then((obj) => {
      setEmail(obj.email || "");
      setReadOnlyData({
        accountId: obj.accountId || "",
        name: obj.name || "",
        role: obj.role || "",
        workedAt: obj.workedAt || "",
      });

      if (obj.profileImageUrl) {
        const url = obj.profileImageUrl.startsWith("http")
          ? obj.profileImageUrl
          : `${API_BASE_URL}${obj.profileImageUrl}`;
        setPreview(url);
      }
    });
  }, [account?.accountId, token]);

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-[280px_1fr] gap-10">
        <div className="bg-white rounded-lg border shadow-sm p-6 text-center">
          <div className="relative mx-auto w-32 h-32 mb-4">
            {preview && (
              <img
                src={preview}
                className="w-full h-full rounded-full object-cover border"
              />
            )}
            <label className="absolute bottom-1 right-1 bg-white border rounded-full p-2 shadow cursor-pointer">
              <Camera size={16} />
              <input type="file" hidden onChange={handleImageChange} />
            </label>
          </div>

          <h2 className="font-bold text-lg mb-4">{readOnlyData.name}</h2>

          <div className="bg-slate-50 rounded-lg p-4 text-left space-y-4 border">
            <div>
              <p className="text-xs text-slate-400 font-semibold">EMAIL</p>
              <p className="font-medium">{email}</p>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-slate-400 font-semibold">ROLE</p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <Shield size={14} /> {readOnlyData.role}
              </div>
            </div>
          </div>

          {profileImage && (
            <Button
              onClick={handleProfileSave}
              disabled={loading}
              className="w-full mt-6 bg-sky-500 hover:bg-sky-600 cursor-pointer"
            >
              저장하기
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button className="px-8 py-4 font-semibold border-b-2 border-black">
              계정 관리
            </button>
            <button
              onClick={() => (window.location.href = "/myInformation/myPosts")}
              className="px-8 py-4 text-slate-400 hover:text-slate-700"
            >
              내가 쓴 글
            </button>
          </div>

          <div className="p-10">
            <h3 className="text-xl font-bold mb-1">기본 정보</h3>
            <p className="text-sm text-slate-400 mb-6">
              계정의 기본 정보를 확인하고 수정할 수 있습니다.
            </p>

            <div className="border rounded-lg overflow-hidden">
              <Row label="사원번호" value={readOnlyData.accountId} />

              <Row label="이름" value={readOnlyData.name} />

              <Row
                label="이메일"
                value={
                  editingEmail ? (
                    <div className="flex gap-2">
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button
                        size="icon"
                        onClick={handleProfileSave}
                        disabled={!emailValid || loading}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingEmail(false)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    email
                  )
                }
                onEdit={() => setEditingEmail(true)}
                editable={!editingEmail}
              />

              <Row
                label="권한"
                value={
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md font-semibold">
                    {readOnlyData.role}
                  </span>
                }
              />

              <Row
                label="비밀번호"
                value={"********"}
                onEdit={() => setEditingPassword(!editingPassword)}
              />

              {editingPassword && (
                <div className="px-6 py-8 border-t bg-slate-50/50 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 max-w-sm space-y-3">
                      <Input
                        type="password"
                        placeholder="현재 비밀번호"
                        value={oldPw}
                        onChange={(e) => setOldPw(e.target.value)}
                        className="h-10 bg-white"
                      />
                      <Input
                        type="password"
                        placeholder="새 비밀번호"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="h-10 bg-white"
                      />
                      <Input
                        type="password"
                        placeholder="새 비밀번호 확인"
                        value={newPwConfirm}
                        onChange={(e) => setNewPwConfirm(e.target.value)}
                        className="h-10 bg-white"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700">
                          비밀번호 변경 안내
                        </h4>
                        <ul className="text-xs text-slate-500 space-y-1.5">
                          <li className="flex items-center gap-2">
                            <div
                              className={`w-1 h-1 rounded-full ${newPw.length >= 6 ? "bg-green-500" : "bg-slate-300"}`}
                            />
                            최소 6자 이상의 안전한 비밀번호를 입력하세요.
                          </li>
                          <li className="flex items-center gap-2">
                            <div
                              className={`w-1 h-1 rounded-full ${newPw && newPw === newPwConfirm ? "bg-green-500" : "bg-slate-300"}`}
                            />
                            새 비밀번호와 확인 입력이 일치해야 합니다.
                          </li>
                        </ul>
                      </div>

                      <div className="flex justify-end gap-2 mt-6 md:mt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPassword(false)}
                          className="hover:bg-slate-200 px-4 py-5"
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          disabled={!passwordValid || loading}
                          onClick={handlePasswordChange}
                          className="bg-sky-500 hover:bg-sky-600 px-4 py-5"
                        >
                          {loading ? "처리 중..." : "변경 저장"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Row label="근무 시작일" value={readOnlyData.workedAt || "-"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, onEdit, editable = true }) {
  return (
    <div className="flex border-b last:border-b-0">
      <div className="w-48 bg-slate-50 px-6 py-4 font-semibold text-sm text-slate-600">
        {label}
      </div>
      <div className="flex-1 px-6 py-4 flex items-center justify-between">
        <div>{value}</div>
        {onEdit && editable && (
          <Pencil
            size={16}
            className="text-slate-400 cursor-pointer hover:text-blue-500"
            onClick={onEdit}
          />
        )}
      </div>
    </div>
  );
}
