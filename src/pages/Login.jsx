import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/api/auth-api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const user = await loginUser(id, pw);
      router.push("/main");
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
            <h2 className="text-xl font-bold tracking-tight text-gray-800">
              로그인
            </h2>
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
                type="text"
                placeholder="사원번호를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full border-b border-gray-300 bg-transparent pb-3 text-sm outline-none
                           focus:border-violet-500 focus:ring-0 placeholder:text-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full border-b border-gray-300 bg-transparent pb-3 text-sm outline-none
                           focus:border-violet-500 focus:ring-0 placeholder:text-gray-300"
                required
              />
            </div>

            {error && <p className="text-xs text-red-500 mt-4">{error}</p>}

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500
                py-3 text-sm font-semibold text-white shadow-md
                hover:brightness-120 cursor-pointer"
            >
              로그인
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            문제가 있으면 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
