import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const [step, setStep] = useState("register"); // "register" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await base44.auth.verifyOtp({ email, otpCode: otp });
      base44.auth.setToken(access_token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid code");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try { await base44.auth.resendOtp(email); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl" aria-hidden="true">🌌</span>
          <h1 className="text-2xl font-bold text-white mt-3">GalaxiaStarCommunicators</h1>
          <p className="text-white/40 text-sm mt-1">{step === "otp" ? "Verify your email" : "Create your account"}</p>
        </div>
        <div className="bg-[#111122] rounded-2xl p-6 border border-white/5 space-y-4">
          {error && <div role="alert" className="bg-red-500/10 text-red-400 text-sm rounded-lg p-3 border border-red-500/20">{error}</div>}
          {step === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div><Label htmlFor="reg-email" className="text-white/60 text-xs">Email</Label><Input id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" aria-label="Email address" className="bg-white/5 border-white/10 text-white mt-1" required /></div>
              <div><Label htmlFor="reg-password" className="text-white/60 text-xs">Password</Label><Input id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" aria-label="Password" className="bg-white/5 border-white/10 text-white mt-1" required /></div>
              <div><Label htmlFor="reg-confirm" className="text-white/60 text-xs">Confirm Password</Label><Input id="reg-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" aria-label="Confirm password" className="bg-white/5 border-white/10 text-white mt-1" required /></div>
              <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">{loading ? "Creating..." : "Create Account"}</Button>
              <Button type="button" variant="outline" onClick={() => base44.auth.loginWithProvider("google", "/")} className="w-full border-white/10 text-white/80 hover:bg-white/5">Continue with Google</Button>
              <p className="text-center text-xs text-white/40">Already have an account? <Link to="/login" className="text-indigo-400">Sign in</Link></p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-white/50 text-sm">We sent a code to <span className="text-white">{email}</span></p>
              <div><Label htmlFor="reg-otp" className="text-white/60 text-xs">Verification Code</Label><Input id="reg-otp" value={otp} onChange={(e) => setOtp(e.target.value)} aria-label="Verification code" className="bg-white/5 border-white/10 text-white mt-1 text-center tracking-widest" required autoFocus /></div>
              <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">{loading ? "Verifying..." : "Verify"}</Button>
              <button type="button" onClick={handleResend} className="text-indigo-400 text-xs w-full text-center hover:text-indigo-300">Resend code</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
