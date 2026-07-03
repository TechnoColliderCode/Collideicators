import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken: token, newPassword: password });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Reset failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🌌</span>
          <h1 className="text-2xl font-bold text-white mt-3">New Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#111122] rounded-2xl p-6 border border-white/5 space-y-4">
          {error && <div className="bg-red-500/10 text-red-400 text-sm rounded-lg p-3 border border-red-500/20">{error}</div>}
          <div><Label className="text-white/60 text-xs">New Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="bg-white/5 border-white/10 text-white mt-1" required /></div>
          <div><Label className="text-white/60 text-xs">Confirm Password</Label><Input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" className="bg-white/5 border-white/10 text-white mt-1" required /></div>
          <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">{loading ? "Resetting..." : "Reset Password"}</Button>
        </form>
      </div>
    </div>
  );
}
