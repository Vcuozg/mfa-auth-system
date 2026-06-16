"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return null;
        }
        if (r.status === 403) {
          window.location.href = "/dashboard";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setUsers(d.users || []);
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
          { h: "/login-logs", l: "📋 Lịch sử đăng nhập" },
          { h: "/admin/users", l: "👥 Quản lý người dùng", a: true },
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-white mb-1">
            Quản lý người dùng
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            {users.length} người dùng đã đăng ký
          </p>
          <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    "Email",
                    "Vai trò",
                    "MFA",
                    "Sai mật khẩu",
                    "Trạng thái",
                    "Ngày tạo",
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
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/3 transition">
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium border ${u.role === "ADMIN" ? "bg-violet-500/15 text-violet-400 border-violet-500/20" : "bg-slate-500/15 text-slate-400 border-slate-500/20"}`}
                      >
                        {u.role === "ADMIN" ? "Quản trị" : "Người dùng"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium border ${u.mfa_enabled ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}`}
                      >
                        {u.mfa_enabled ? "Đã bật" : "Chưa bật"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {u.failed_attempts}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium border ${u.locked_until ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"}`}
                      >
                        {u.locked_until ? "Bị khóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
