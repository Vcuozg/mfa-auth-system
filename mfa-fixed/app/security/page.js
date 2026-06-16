"use client";
import { useEffect, useState } from "react";

export default function SecurityPage() {
  const [security, setSecurity] = useState(null);
  useEffect(() => {
    fetch("/api/security", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setSecurity(d.user);
      });
  }, []);

  const isLocked =
    security?.locked_until && new Date(security.locked_until) > new Date();

  const checks = [
    { label: "Mã hóa mật khẩu bcrypt", detail: "Cost factor 10", ok: true },
    {
      label: "JWT trong httpOnly cookie",
      detail: "Bảo vệ chống tấn công XSS",
      ok: true,
    },
    { label: "Mã bí mật MFA được mã hóa", detail: "AES-256-GCM", ok: true },
    {
      label: "Chống tấn công brute-force",
      detail: "Sai 5 lần → khóa 15 phút",
      ok: true,
    },
    {
      label: "Giới hạn tần suất OTP",
      detail: "Dùng chung bộ đếm với mật khẩu",
      ok: true,
    },
    {
      label: "Chống tấn công phát lại",
      detail: "Token đã dùng bị vô hiệu hóa",
      ok: true,
    },
    {
      label: "Xác thực JWT ở middleware",
      detail: "Kiểm tra trên mọi request",
      ok: true,
    },
    {
      label: "Nhật ký đăng nhập",
      detail: "Ghi lại IP, trình duyệt, trạng thái",
      ok: true,
    },
    { label: "Xác thực hai lớp (MFA)", ok: security?.mfa_enabled },
    { label: "Trạng thái tài khoản", ok: !isLocked },
  ];

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
          { h: "/security", l: "🛡️ Bảo mật", a: true },
          { h: "/login-logs", l: "📋 Lịch sử đăng nhập" },
          { h: "/settings", l: "⚙️ Cài đặt" },
        ].map((n) => (
          <a
            key={n.h}
            href={n.h}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${n.a ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            {n.l}
          </a>
        ))}
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-white mb-1">Bảo mật</h1>
          <p className="text-slate-400 text-sm mb-8">
            Trạng thái bảo vệ tài khoản —{" "}
            <span className="text-white">{security?.email}</span>
          </p>
          <div className="bg-white/5 border border-white/8 rounded-2xl divide-y divide-white/5">
            {checks.map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-white text-sm font-medium">{c.label}</p>
                  {c.detail && (
                    <p className="text-slate-500 text-xs mt-0.5">{c.detail}</p>
                  )}
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${c.ok ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${c.ok ? "bg-emerald-400" : "bg-red-400"}`}
                  />
                  {c.ok ? "An toàn" : "Rủi ro"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
