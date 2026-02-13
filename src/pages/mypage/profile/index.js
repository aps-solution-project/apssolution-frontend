import {
  changeMyPassword,
  getAccountDetail,
  updateMyAccount,
} from "@/api/auth-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";
import {
  Calendar,
  Camera,
  Check,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Shield,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080`;

const ROLE_STYLE = {
  ADMIN: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-500",
    border: "border-amber-300",
    gradient: "from-amber-400 to-orange-400",
  },
  PLANNER: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
    border: "border-blue-300",
    gradient: "from-blue-400 to-indigo-500",
  },
  WORKER: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    border: "border-emerald-300",
    gradient: "from-emerald-400 to-teal-500",
  },
};

export default function MyProfilePage() {
  const account = useAccount((s) => s.account);
  const setAccount = useAccount((s) => s.setAccount);
  const token = useToken((s) => s.token);
  const router = useRouter();

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
  const roleStyle = ROLE_STYLE[readOnlyData.role] || ROLE_STYLE.WORKER;

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
      changeMyPassword(
        account.accountId,
        { oldPw, newPw, newPwConfirm },
        token,
      ).then((obj) => {
        if (!obj.success) {
          window.alert(obj.message);
          window.location.reload();
        } else {
          alert("비밀번호 변경 완료");
          window.location.reload();
        }
        setOldPw("");
        setNewPw("");
        setNewPwConfirm("");
        setEditingPassword(false);
      });
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
    <div className="min-h-full p-4 md:p-8">
      {/* ✅ items-stretch로 양쪽 카드 높이 동기화 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-stretch">
        {/* ── 왼쪽 프로필 카드 ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* 커버 배너 */}
          <div
            className={`h-28 bg-gradient-to-br ${roleStyle.gradient} relative`}
          >
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* 아바타 */}
          <div className="relative -mt-14 flex justify-center">
            <div className="relative group">
              <Avatar className="h-28 w-28 ring-4 ring-white shadow-lg">
                <AvatarImage
                  src={preview}
                  alt={readOnlyData.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-slate-200">
                  <Loader2 size={32} className="text-slate-400" />
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                <Camera size={20} className="text-white" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* 이름 + 역할 */}
          <div className="text-center pt-4 pb-2 px-6">
            <h2 className="text-xl font-bold text-slate-900">
              {readOnlyData.name}
            </h2>
            <div className="flex justify-center mt-3">
              <span
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                  text-xs font-bold tracking-wider uppercase border
                  ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}
                `}
              >
                <span className={`w-2 h-2 rounded-full ${roleStyle.dot}`} />
                {readOnlyData.role}
              </span>
            </div>
          </div>

          {/* 정보 카드 */}
          <div className="mx-5 mt-4 rounded-xl bg-slate-50 border border-slate-100 divide-y divide-slate-100">
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <Mail size={16} className="text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  Email
                </p>
                <p className="text-sm text-slate-700 font-medium truncate">
                  {email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <Calendar size={16} className="text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  근무 시작일
                </p>
                <p className="text-sm text-slate-700 font-medium">
                  {readOnlyData.workedAt || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ flex-1로 남은 공간 채움 + 이미지 저장 버튼은 하단 고정 */}
          <div className="flex-1" />
          {profileImage && (
            <div className="px-5 pb-5">
              <Button
                onClick={handleProfileSave}
                disabled={loading}
                className={`w-full rounded-xl bg-gradient-to-r ${roleStyle.gradient} hover:opacity-90 text-white h-11 text-sm font-semibold shadow-md cursor-pointer`}
              >
                {loading ? "저장 중..." : "프로필 이미지 저장"}
              </Button>
            </div>
          )}
          {!profileImage && <div className="pb-5" />}
        </div>

        {/* ── 오른쪽 상세 영역 ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* 탭 */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button className="px-8 py-5 text-sm font-bold text-slate-800 border-b-2 border-slate-800 bg-white -mb-px rounded-t-lg">
              계정 관리
            </button>
            <button
              onClick={() => router.push("/mypage/article")}
              className="px-8 py-5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              내가 쓴 글
            </button>
          </div>

          <div className="p-6 md:p-10 flex-1">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900">기본 정보</h3>
              <p className="text-sm text-slate-400 mt-1">
                계정의 기본 정보를 확인하고 수정할 수 있습니다.
              </p>
            </div>

            {/* ✅ 근무 시작일 제거 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <InfoRow
                icon={<User size={16} />}
                label="사원번호"
                value={
                  <span className="font-mono text-slate-700">
                    {readOnlyData.accountId}
                  </span>
                }
              />
              <InfoRow
                icon={<User size={16} />}
                label="이름"
                value={
                  <span className="font-semibold text-slate-800">
                    {readOnlyData.name}
                  </span>
                }
              />
              <InfoRow
                icon={<Mail size={16} />}
                label="이메일"
                value={
                  editingEmail ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-9 rounded-lg text-sm max-w-xs"
                      />
                      <Button
                        size="icon"
                        onClick={handleProfileSave}
                        disabled={!emailValid || loading}
                        className="h-9 w-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingEmail(false)}
                        className="h-9 w-9 rounded-lg"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-slate-700">{email}</span>
                  )
                }
                onEdit={() => setEditingEmail(true)}
                editable={!editingEmail}
              />
              <InfoRow
                icon={<Shield size={16} />}
                label="권한"
                value={
                  <span
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                      text-xs font-bold tracking-wider border
                      ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}
                    `}
                  >
                    <span className={`w-2 h-2 rounded-full ${roleStyle.dot}`} />
                    {readOnlyData.role}
                  </span>
                }
              />
              <InfoRow
                icon={<KeyRound size={16} />}
                label="비밀번호"
                value={
                  <span className="text-slate-400 tracking-[0.2em] text-lg">
                    ••••••••
                  </span>
                }
                onEdit={() => setEditingPassword(!editingPassword)}
              />

              {editingPassword && (
                <div className="px-6 py-8 bg-gradient-to-b from-slate-50 to-white animate-in fade-in slide-in-from-top-2 duration-300">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <KeyRound size={14} className="text-slate-500" />
                    비밀번호 변경
                  </h4>
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 max-w-md space-y-3">
                      <Input
                        type="password"
                        placeholder="현재 비밀번호"
                        value={oldPw}
                        onChange={(e) => setOldPw(e.target.value)}
                        className="h-11 rounded-lg bg-white text-sm border-slate-200"
                      />
                      <Input
                        type="password"
                        placeholder="새 비밀번호"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="h-11 rounded-lg bg-white text-sm border-slate-200"
                      />
                      <Input
                        type="password"
                        placeholder="새 비밀번호 확인"
                        value={newPwConfirm}
                        onChange={(e) => setNewPwConfirm(e.target.value)}
                        className="h-11 rounded-lg bg-white text-sm border-slate-200"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          변경 조건
                        </p>
                        <PwRule
                          passed={newPw.length >= 6}
                          text="최소 6자 이상"
                        />
                        <PwRule
                          passed={newPw && newPw === newPwConfirm}
                          text="비밀번호 확인 일치"
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setEditingPassword(false)}
                          className="rounded-lg px-6 h-11 text-sm cursor-pointer"
                        >
                          취소
                        </Button>
                        <Button
                          disabled={!passwordValid || loading}
                          onClick={handlePasswordChange}
                          className="rounded-lg px-6 h-11 bg-slate-800 hover:bg-slate-900 text-sm font-semibold cursor-pointer"
                        >
                          {loading ? "처리 중..." : "변경 저장"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, onEdit, editable = true }) {
  return (
    <div className="group flex items-center px-6 py-5 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-center gap-3 w-40 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </div>
      <div className="flex-1 text-sm font-medium">{value}</div>
      {onEdit && editable && (
        <Pencil
          size={15}
          className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-blue-500 transition-all shrink-0 ml-4"
          onClick={onEdit}
        />
      )}
    </div>
  );
}

function PwRule({ passed, text }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
          passed ? "bg-emerald-100" : "bg-slate-100"
        }`}
      >
        {passed ? (
          <Check size={12} className="text-emerald-600" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        )}
      </div>
      <span
        className={`text-sm ${passed ? "text-emerald-600 font-medium" : "text-slate-400"}`}
      >
        {text}
      </span>
    </div>
  );
}
