"use client";
import { useEffect, useState } from "react";

const rules = [
  { label: "Ít nhất 8 ký tự", test: (p) => p.length >= 8 },
  { label: "Có chữ hoa (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Có chữ số (0-9)", test: (p) => /[0-9]/.test(p) },
  {
    label: "Có ký tự đặc biệt",
    test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
  },
];

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [message, setMessage] = useState("");
  const [msgOk, setMsgOk] = useState(false);

  useEffect(() => {
    fetch("/api/security", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) window.location.href = "/login";
        return r.json();
      })
      .then((d) => setUser(d.user));
  }, []);

  async function changePassword(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
    });
    const data = await res.json();
    setMsgOk(res.ok);
    setMessage(data.message);
    if (res.ok) {
      setOldPw("");
      setNewPw("");
    }
  }

  async function disableMFA() {
    if (!confirm("Tắt xác thực 2 lớp? Tài khoản của bạn sẽ kém an toàn hơn."))
      return;
    const res = await fetch("/api/auth/disable-mfa", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) window.location.reload();
  }

  function logout() {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(
      () => {
        window.location.href = "/login";
      },
    );
  }

  const strength = rules.filter((r) => r.test(newPw)).length;
  const strengthColor =
    ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-400"][
      strength - 1
    ] || "bg-white/10";

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      <aside className="w-64 shrink-0 border-r border-white/5 flex flex-col p-4 gap-1">
        <div className="flex items-center gap-2.5 px-3 py-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Hệ thống MFA</span>
        </div>
        {[
          { h: "/dashboard", l: "🏠 Tổng quan" },
          { h: "/security", l: "🛡️ Bảo mật" },
          { h: "/login-logs", l: "📋 Lịch sử đăng nhập" },
          { h: "/settings", l: "⚙️ Cài đặt", a: true },
        ].map((n) => (
          <a
            key={n.h}
            href={n.h}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${n.a ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            {n.l}
          </a>
        ))}
        <div className="mt-auto pt-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-semibold text-white mb-1">Cài đặt</h1>
          <p className="text-slate-400 text-sm mb-8">
            Quản lý bảo mật tài khoản của bạn
          </p>

          <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-4">
            <h2 className="text-white font-medium text-sm mb-4">
              Thông tin tài khoản
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Email</span>
                <span className="text-white text-sm">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Xác thực 2 lớp</span>
                <span
                  className={`text-sm font-medium ${user?.mfa_enabled ? "text-emerald-400" : "text-red-400"}`}
                >
                  {user?.mfa_enabled ? "Đã bật" : "Chưa bật"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">
                  Số lần đăng nhập sai
                </span>
                <span
                  className={`text-sm ${user?.failed_attempts > 0 ? "text-red-400" : "text-slate-300"}`}
                >
                  {user?.failed_attempts ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-4">
            <h2 className="text-white font-medium text-sm mb-4">
              Đổi mật khẩu
            </h2>
            <form onSubmit={changePassword} className="space-y-3">
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500/60 transition text-sm"
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                required
              />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500/60 transition text-sm"
                type="password"
                placeholder="Mật khẩu mới"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
              />
              {newPw && (
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColor : "bg-white/10"}`}
                    />
                  ))}
                </div>
              )}
              <button className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium py-3 rounded-xl transition text-sm">
                Cập nhật mật khẩu
              </button>
            </form>
            {message && (
              <div
                className={`mt-3 rounded-xl px-4 py-3 text-sm ${msgOk ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}
              >
                {message}
              </div>
            )}
          </div>

          <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5">
            <h2 className="text-red-400 font-medium text-sm mb-1">
              Vùng nguy hiểm
            </h2>
            <p className="text-slate-500 text-xs mb-4">
              Thao tác này sẽ xóa bảo vệ MFA của bạn
            </p>
            <button
              onClick={disableMFA}
              className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium py-3 rounded-xl transition text-sm"
            >
              Tắt xác thực 2 lớp
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
