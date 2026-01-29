import { getAccountDetail, updateEmployeeAccount } from "@/api/auth-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToken } from "@/stores/account-store";
import { useEffect, useMemo, useState } from "react";

export default function AdminProfileEditModal({ open, onOpenChange, account }) {
  console.log("account:", account);
  console.log("accountId:", account?.accountId);

  const token = useToken((s) => s.token);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [workedAt, setWorkedAt] = useState("");

  const [profileUrl, setProfileUrl] = useState(null);

  const [loading, setLoading] = useState(false);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  const handleSave = async () => {
    if (!emailValid) return alert("이메일 형식이 올바르지 않습니다");

    try {
      setLoading(true);

      const payload = {
        name,
        email,
        role,
        workedAt,
      };

      await updateEmployeeAccount(account.id, payload, token);

      onOpenChange(false);
    } catch (e) {
      alert(e.message || "직원 정보 수정 실패");
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

  useEffect(() => {
    if (!account?.id || !token || !open) return;

    getAccountDetail(token, account.id).then((obj) => {
      setName(obj.name || "");
      setRole(obj.role || "");
      setEmail(obj.email || "");
      setWorkedAt(obj.workedAt?.slice(0, 10) || "");

      if (obj.profileImageUrl) {
        setProfileUrl(
          obj.profileImageUrl.startsWith("http")
            ? obj.profileImageUrl
            : `http://192.168.0.20:8080${obj.profileImageUrl}`,
        );
      } else {
        setProfileUrl(null);
      }
    });
  }, [account, token, open]);

  if (!open || !account?.id) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-70 rounded-br-lg p-9 space-y-2 bg-stone-50 shadow border text-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            직원 정보 수정
          </DialogTitle>
          <DialogDescription>기본 정보만 수정 가능합니다.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 shadow">
            {profileUrl ? (
              <img
                src={profileUrl}
                className="w-full h-full object-cover"
                alt="profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                No Image
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="font-medium text-xs">이름</p>
          <Input
            className={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <p className="font-medium text-xs">권한</p>
          <select
            className={`${inputStyle} w-full px-2`}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">선택</option>
            <option value="ADMIN">ADMIN</option>
            <option value="WORKER">WORKER</option>
            <option value="PLANNER">PLANNER</option>
          </select>
        </div>

        <div>
          <p className="font-medium text-xs">이메일</p>
          <Input
            className={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!emailValid && (
            <p className="text-[10px] text-red-500">
              이메일 형식이 올바르지 않습니다
            </p>
          )}
        </div>

        <div>
          <p className="font-medium text-xs">입사일자</p>
          <Input
            type="date"
            className={inputStyle}
            value={workedAt}
            onChange={(e) => setWorkedAt(e.target.value)}
          />
        </div>

        <Button
          disabled={!emailValid || loading}
          className="w-full h-9 rounded-lg bg-black disabled:opacity-40"
          onClick={handleSave}
        >
          {loading ? "저장 중..." : "저장"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
