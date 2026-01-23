import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/api/auth-api";
import { useAccount, useToken } from "@/stores/account-store";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const token = useToken((state) => state.token);
  const setToken = useToken((state) => state.setToken);
  const setAccount = useAccount((state) => state.setAccount);

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (token) {
      router.replace("/scenarios");
    }
  }, [token, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const user = await loginUser(id, pw);

      setToken(user.token);
      setAccount({
        id: user.accountId,
        name: user.accountName,
        role: user.role,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/images/login-bp-01-01.jpg')] bg-cover bg-center">
      <div className="min-h-screen flex items-center">
        <div className="ml-70 w-90 rounded-xl bg-white/90 px-8 py-13">
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800">로그인</h2>
            <p className="mt-2 text-xs text-gray-500">
              사원번호와 비밀번호를 입력해주세요.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                사원번호
              </label>
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full border-b pb-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full border-b pb-3 text-sm outline-none"
                required
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-md hover:brightness-120 disabled:opacity-60"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
