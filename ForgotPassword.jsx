import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await base44.auth.resetPasswordRequest(email); } catch {}
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🌌</span>
          <h1 className="text-2xl font-bold text-white mt-3">Reset Password</h1>
        </div>
        <div className="bg-[#111122] rounded-2xl p-6 border border-white/5 space-y-4">
          {sent ? (
            <div className="text-center space-y-3">
              <p className="text-white/60 text-sm">If an account exists with that email, you'll receive a reset link.</p>
              <Link to="/login" className="text-indigo-400 text-sm hover:text-indigo-300">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label className="text-white/60 text-xs">Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="bg-white/5 border-white/10 text-white mt-1" required /></div>
              <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">{loading ? "Sending..." : "Send Reset Link"}</Button>
              <p className="text-center text-xs"><Link to="/login" className="text-white/40 hover:text-white/60">Back to sign in</Link></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
