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

export default function LoginLogsPage() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    fetch("/api/login-logs", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setLogs(d.logs || []);
      });
  }, []);

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
          { h: "/login-logs", l: "📋 Lịch sử đăng nhập", a: true },
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold text-white mb-1">
            Lịch sử đăng nhập
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            {logs.length} sự kiện xác thực
          </p>
          <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    "Email",
                    "Trạng thái",
                    "Địa chỉ IP",
                    "Trình duyệt",
                    "Thời gian",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/3 transition">
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {log.user?.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${statusStyle[log.status] || "bg-slate-500/15 text-slate-400 border-slate-500/20"}`}
                      >
                        {statusLabel[log.status] || log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                      {log.ip_address}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[200px] truncate">
                      {log.user_agent}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(log.login_time).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-slate-600"
                    >
                      Chưa có lịch sử đăng nhập
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
