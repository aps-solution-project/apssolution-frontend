import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateMyAccount,
  changeMyPassword,
  getAccountDetail,
} from "@/api/auth-api";
import { useAccount, useToken } from "@/stores/account-store";

const API_HOST = "http://192.168.0.17:8080";

export default function ProfileEditModal({ open, onOpenChange, account }) {
  const token = useToken((s) => s.token);
  const setAccount = useAccount((s) => s.setAccount);

  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !account?.accountId) return;

    const fetchDetail = async () => {
      try {
        const detail = await getAccountDetail(account.accountId, token);

        setEmail(detail.email ?? "");

        setPreview(
          detail.profileImageUrl
            ? `${API_HOST}${detail.profileImageUrl}`
            : null,
        );

        setAccount(detail);
      } catch (e) {
        console.error("사원 상세 조회 실패:", e);
      }
    };

    fetchDetail();
  }, [open, account?.accountId]);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  const emailChanged = email !== account?.email || profileImage !== null;

  const passwordValid = newPw.length >= 8 && newPw === newPwConfirm;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    if (!emailValid) return alert("이메일 형식이 올바르지 않습니다");

    try {
      setLoading(true);

      const payload = {
        email,
        ...(profileImage && { profileImage }),
      };

      const updated = await updateMyAccount(account.accountId, payload, token);

      setAccount(updated);
      onOpenChange(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPw) return alert("기존 비밀번호를 입력하세요");
    if (!passwordValid) return alert("비밀번호는 8자 이상이고 일치해야 합니다");

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
      alert("비밀번호가 변경되었습니다");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = `
    h-8 rounded-lg
    border-0 shadow-none
    bg-slate-100
    hover:bg-slate-200
    focus:bg-slate-200
    outline-none ring-0
    transition text-sm
  `;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-4 space-y-4 bg-white shadow-lg border text-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            프로필 설정
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground">
            이메일과 프로필 이미지를 변경할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 shadow">
            {preview ? (
              <img
                src={preview}
                className="w-full h-full object-cover"
                alt="profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                No Image
              </div>
            )}
          </div>

          <label className="cursor-pointer text-xs px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 transition">
            사진 변경
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-1">
          <p className="font-medium text-xs">이메일</p>
          <Input
            className={inputStyle}
            value={email}
            placeholder="이메일 입력"
            onChange={(e) => setEmail(e.target.value)}
          />
          {!emailValid && (
            <p className="text-[10px] text-red-500">
              이메일 형식이 올바르지 않습니다
            </p>
          )}
        </div>

        <Button
          disabled={!emailChanged || !emailValid || loading}
          className="w-full h-9 rounded-lg bg-black disabled:opacity-40"
          onClick={handleProfileSave}
        >
          저장
        </Button>

        <div className="border-t pt-3 space-y-2">
          <p className="font-medium text-xs">비밀번호 변경</p>

          <Input
            className={inputStyle}
            type="password"
            placeholder="기존 비밀번호"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
          />
          <Input
            className={inputStyle}
            type="password"
            placeholder="새 비밀번호"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          <Input
            className={inputStyle}
            type="password"
            placeholder="새 비밀번호 확인"
            value={newPwConfirm}
            onChange={(e) => setNewPwConfirm(e.target.value)}
          />

          <Button
            disabled={!passwordValid || loading}
            className="w-full h-9 rounded-lg bg-indigo-500 text-white disabled:opacity-40"
            onClick={handlePasswordChange}
          >
            변경
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
