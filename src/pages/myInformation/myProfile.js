import {
  changeMyPassword,
  getAccountDetail,
  updateMyAccount,
} from "@/api/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToken } from "@/stores/account-store";
import { useEffect, useMemo, useState } from "react";

export default function MyProfileSection({ account, setAccount }) {
  const token = useToken((s) => s.token);

  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
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
    reader.readAsDataURL(file);
    reader.onload = () => setPreview(reader.result);
  };

  const loadAccount = async () => {
    const obj = await getAccountDetail(token, account.accountId);
    setEmail(obj.email || "");

    if (obj.profileImageUrl) {
      setPreview(
        obj.profileImageUrl.startsWith("http")
          ? obj.profileImageUrl
          : `http://192.168.0.20:8080${obj.profileImageUrl}`,
      );
    } else {
      setPreview(null);
    }

    setProfileImage(null);
  };

  useEffect(() => {
    if (!account?.accountId || !token) return;
    loadAccount();
  }, [account, token]);

  const handleProfileSave = async () => {
    if (!emailValid) return alert("이메일 형식이 올바르지 않습니다");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("email", email);
      if (profileImage) formData.append("profileImage", profileImage);

      await updateMyAccount(account.accountId, formData, token);

      await loadAccount();
      alert("프로필이 수정되었습니다");
    } catch (e) {
      alert(e.message || "프로필 수정 실패");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPw) return alert("기존 비밀번호 입력");

    if (!passwordValid) return alert("비밀번호는 6자 이상이며 일치해야 합니다");

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
      alert("비밀번호 변경 완료");
    } catch (e) {
      alert(e.message || "비밀번호 변경 실패");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = `
    h-9 rounded-lg bg-slate-100 border-0
    hover:bg-slate-200 focus:bg-slate-200
    transition text-sm
  `;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
      <div className="relative rounded-[36px] p-10 shadow-xl bg-gradient-to-br from-rose-50 via-white to-indigo-50">
        <div className="flex items-center gap-8">
          <div className="w-36 h-36 rounded-full overflow-hidden shadow-2xl ring-4 ring-white">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-200" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {account?.name || "My Profile"}
            </h2>
            <p className="text-gray-500 text-sm">{email}</p>

            <label className="inline-block mt-3 cursor-pointer text-sm px-5 py-2 rounded-full bg-white shadow hover:shadow-md transition">
              사진 변경
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-10 shadow-lg space-y-6 max-w-xl">
        <div>
          <p className="text-xs font-medium mb-2 text-gray-500">Email</p>
          <Input
            className="h-12 rounded-full bg-slate-100 border-0 shadow-inner focus:bg-white transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!emailValid && (
            <p className="text-[11px] text-rose-500 mt-1">
              이메일 형식이 올바르지 않습니다
            </p>
          )}
        </div>

        <Button
          disabled={loading || !emailValid}
          className="w-full h-12 rounded-full bg-black text-white hover:bg-neutral-800 shadow-md"
          onClick={handleProfileSave}
        >
          변경사항 저장
        </Button>
      </div>

      <div className="bg-white rounded-[32px] p-10 shadow-lg space-y-5 max-w-xl">
        <p className="font-semibold text-sm text-gray-700">비밀번호 변경</p>

        <Input
          className="h-12 rounded-full bg-slate-100 border-0 shadow-inner"
          type="password"
          placeholder="기존 비밀번호"
          value={oldPw}
          onChange={(e) => setOldPw(e.target.value)}
        />
        <Input
          className="h-12 rounded-full bg-slate-100 border-0 shadow-inner"
          type="password"
          placeholder="새 비밀번호"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
        />
        <Input
          className="h-12 rounded-full bg-slate-100 border-0 shadow-inner"
          type="password"
          placeholder="새 비밀번호 확인"
          value={newPwConfirm}
          onChange={(e) => setNewPwConfirm(e.target.value)}
        />

        <Button
          disabled={!passwordValid || loading}
          className="w-full h-12 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-md"
          onClick={handlePasswordChange}
        >
          비밀번호 변경
        </Button>
      </div>
    </div>
  );
}
