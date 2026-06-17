"use client";

import { useEffect, useRef, useState } from "react";

export default function VerifyOTPPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);

  const inputs = useRef([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("mfa_email");

    if (saved) {
      setEmail(saved);
      setHasEmail(true);
    }

    inputs.current[0]?.focus();
  }, []);

  function handleChange(index, e) {
    const value = e.target.value.replace(/\D/g, "");

    const next = [...otp];

    if (!value) {
      next[index] = "";
      setOtp(next);
      return;
    }

    next[index] = value.slice(-1);
    setOtp(next);

    if (index < 5) {
      setTimeout(() => {
        inputs.current[index + 1]?.focus();
      }, 0);
    }
  }

  function handleKeyDown(index, e) {
    if (e.key !== "Backspace") return;

    const next = [...otp];

    if (next[index]) {
      next[index] = "";
      setOtp(next);
      return;
    }

    if (index > 0) {
      setTimeout(() => {
        inputs.current[index - 1]?.focus();
      }, 0);
    }
  }

  function handlePaste(e) {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const next = ["", "", "", "", "", ""];

    pasted.split("").forEach((char, idx) => {
      next[idx] = char;
    });

    setOtp(next);

    setTimeout(() => {
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }, 0);
  }

  async function handleVerify(e) {
    e.preventDefault();

    const token = otp.join("");

    if (token.length !== 6) {
      setMessage("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Mã OTP không hợp lệ");
        return;
      }

      sessionStorage.removeItem("mfa_email");
      window.location.href = "/dashboard";
    } catch {
      setMessage("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/25">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-white">
            Xác thực hai bước
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Nhập mã 6 số từ ứng dụng xác thực của bạn
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleVerify} className="space-y-5">
            {!hasEmail && (
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email
                </label>

                <input
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500/60 transition text-sm"
                  type="email"
                  placeholder="ban@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-3">
                Mã xác thực
              </label>

              <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-12 text-center text-white text-lg font-bold bg-white/5 border border-white/10 rounded-xl outline-none focus:border-emerald-500/60 focus:bg-white/10 transition"
                  />
                ))}
              </div>
            </div>

            <button
              disabled={loading || otp.join("").length < 6}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 text-sm"
            >
              {loading ? "Đang xác thực..." : "Xác nhận mã"}
            </button>
          </form>

          {message && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{message}</p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          <a
            href="/login"
            className="text-slate-400 hover:text-white transition"
          >
            ← Quay lại đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
