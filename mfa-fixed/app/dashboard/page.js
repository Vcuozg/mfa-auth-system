"use client";
import { useEffect, useState } from "react";

const statusLabel = {
  LOGIN_SUCCESS: "Đăng nhập thành công",
  OTP_SUCCESS: "Xác thực OTP thành công",
  PASSWORD_SUCCESS_MFA_REQUIRED: "Cần xác thực OTP",
  FAILED_PASSWORD: "Sai mật khẩu",
  FAILED_OTP: "Sai mã OTP",
  ACCOUNT_LOCKED: "Tài khoản bị khóa",
};
const statusStyle = {
  LOGIN_SUCCESS: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  OTP_SUCCESS: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  PASSWORD_SUCCESS_MFA_REQUIRED:
    "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  FAILED_PASSWORD: "bg-red-500/15 text-red-400 border-red-500/20",
  FAILED_OTP: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  ACCOUNT_LOCKED: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function DashboardPage() {
  const [logs, setLogs] = useState([]);
  const [security, setSecurity] = useState(null);

  useEffect(() => {
    fetch("/api/login-logs", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) window.location.href = "/login";
        return r.json();
      })
      .then((d) => setLogs(d.logs || []));
    fetch("/api/security", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSecurity(d.user));
  }, []);

  function logout() {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(
      () => {
        window.location.href = "/login";
      },
    );
  }

  const isLocked =
    security?.locked_until && new Date(security.locked_until) > new Date();

  const navItems = [
    { h: "/dashboard", l: "🏠 Tổng quan", a: true },
    { h: "/security", l: "🛡️ Bảo mật" },
    { h: "/login-logs", l: "📋 Lịch sử đăng nhập" },
    ...(security?.role === "ADMIN"
      ? [{ h: "/admin/users", l: "👥 Quản lý người dùng" }]
      : []),
    { h: "/settings", l: "⚙️ Cài đặt" },
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
        {navItems.map((n) => (
          <a
            key={n.h}
            href={n.h}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${n.a ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            {n.l}
          </a>
        ))}
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-slate-500 truncate">{security?.email}</p>
            <p className="text-xs text-slate-600">
              {security?.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white">
              Bảng điều khiển bảo mật
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Theo dõi trạng thái bảo mật và hoạt động xác thực
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Trạng thái xác thực",
                value: "Đã bảo vệ",
                color: "text-emerald-400",
              },
              {
                label: "Xác thực 2 lớp",
                value: security?.mfa_enabled ? "Đã bật" : "Chưa bật",
                color: security?.mfa_enabled ? "text-blue-400" : "text-red-400",
              },
              {
                label: "Phiên làm việc",
                value: "httpOnly Cookie",
                color: "text-violet-400",
              },
              {
                label: "Tài khoản",
                value: isLocked ? "Đang bị khóa" : "Hoạt động",
                color: isLocked ? "text-red-400" : "text-emerald-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/8 rounded-2xl p-4"
              >
                <p className="text-slate-400 text-xs mb-2">{s.label}</p>
                <p className={`text-base font-semibold ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h2 className="text-white font-medium mb-4 text-sm">
                Danh sách bảo mật
              </h2>
              <ul className="space-y-2.5">
                {[
                  "Mã hóa mật khẩu bcrypt (cost 10)",
                  "JWT trong httpOnly cookie — chống XSS",
                  "Mã bí mật MFA mã hóa AES-256-GCM",
                  "Giới hạn tần suất đăng nhập & OTP",
                  "Khóa tài khoản sau 5 lần sai",
                  "Chống tấn công phát lại TOTP",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-slate-300 text-sm"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h2 className="text-white font-medium mb-4 text-sm">
                Thao tác nhanh
              </h2>
              <div className="space-y-3">
                {[
                  {
                    h: "/setup-mfa",
                    l: "Cài đặt MFA",
                    c: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400",
                  },
                  {
                    h: "/verify-otp",
                    l: "Xác thực OTP",
                    c: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400",
                  },
                  {
                    h: "/settings",
                    l: "Đổi mật khẩu",
                    c: "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300",
                  },
                ].map((btn) => (
                  <a
                    key={btn.h}
                    href={btn.h}
                    className={`flex items-center justify-between w-full border rounded-xl px-4 py-3 transition group ${btn.c}`}
                  >
                    <span className="text-sm font-medium">{btn.l}</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-0.5 transition"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
            <h2 className="text-white font-medium mb-4 text-sm">
              Hoạt động đăng nhập gần đây
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Email", "Trạng thái", "Địa chỉ IP", "Thời gian"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-2 pr-4"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.slice(0, 8).map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 pr-4 text-slate-300 truncate max-w-[140px] text-xs">
                        {log.user?.email}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusStyle[log.status] || "bg-slate-500/15 text-slate-400 border-slate-500/20"}`}
                        >
                          {statusLabel[log.status] || log.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-500 font-mono text-xs">
                        {log.ip_address}
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        {new Date(log.login_time).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-600 text-xs"
                      >
                        Chưa có hoạt động nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
