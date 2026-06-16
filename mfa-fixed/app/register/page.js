"use client";
import { useState } from "react";

const rules = [
  { label: "Ít nhất 8 ký tự", test: (p) => p.length >= 8 },
  { label: "Có chữ hoa (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Có chữ số (0-9)", test: (p) => /[0-9]/.test(p) },
  {
    label: "Có ký tự đặc biệt (!@#...)",
    test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
  },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [msgOk, setMsgOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = rules.filter((r) => r.test(password)).length;

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    setMsgOk(res.ok);
    setMessage(data.message);
    if (res.ok)
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
  }

  const strengthColor =
    ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-400"][
      strength - 1
    ] || "bg-slate-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 mb-4 shadow-lg shadow-violet-500/25">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">Tạo tài khoản</h1>
          <p className="text-slate-400 text-sm mt-1">
            Thiết lập tài khoản MFA bảo mật của bạn
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-violet-500/60 transition text-sm"
                type="email"
                placeholder="ban@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Mật khẩu
              </label>
              <input
                className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-violet-500/60 transition text-sm"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColor : "bg-white/10"}`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {rules.map((r) => (
                      <div
                        key={r.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${r.test(password) ? "text-emerald-400" : "text-slate-500"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${r.test(password) ? "bg-emerald-400" : "bg-slate-600"}`}
                        />
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              disabled={loading || strength < 4}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-violet-500/20 disabled:opacity-40 text-sm"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>
          {message && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${msgOk ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}
            >
              {message}
            </div>
          )}
        </div>
        <p className="text-center text-slate-500 text-sm mt-5">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            className="text-violet-400 hover:text-violet-300 font-medium transition"
          >
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
