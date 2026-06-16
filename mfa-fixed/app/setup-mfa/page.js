"use client";
import { useState } from "react";

export default function SetupMFAPage() {
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSetup(e) {
    e.preventDefault();
    setLoading(true); setMessage("");
    const res = await fetch("/api/auth/setup-mfa", {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({}),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.message);
    if (res.ok && data.qrCode) setQrCode(data.qrCode);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/3 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg shadow-blue-500/25">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">Setup authenticator</h1>
          <p className="text-slate-400 text-sm mt-1">Link your Google Authenticator app</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          {!qrCode ? (
            <>
              <div className="space-y-3 mb-5">
                {["Install Google Authenticator or Authy", "Tap + and choose Scan QR code", "Come back and scan the code below"].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-slate-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleSetup} disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 text-sm">
                {loading ? "Generating..." : "Generate QR Code"}
              </button>
              {message && <p className="mt-3 text-center text-red-400 text-sm">{message}</p>}
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-slate-300 text-sm">Scan this with your authenticator app</p>
              <div className="bg-white rounded-2xl p-3 inline-block">
                <img src={qrCode} alt="QR Code" className="w-44 h-44" />
              </div>
              <a href="/verify-otp"
                className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
                Enter verification code →
              </a>
            </div>
          )}
        </div>

        <p className="text-center mt-5">
          <a href="/dashboard" className="text-slate-400 hover:text-white text-sm transition">← Back to dashboard</a>
        </p>
      </div>
    </div>
  );
}
