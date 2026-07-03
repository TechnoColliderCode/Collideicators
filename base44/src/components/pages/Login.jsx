import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid credentials");
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl" aria-hidden="true">🌌</span>
          <h1 className="text-2xl font-bold text-white mt-3">GalaxiaStarCommunicators</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#111122] rounded-2xl p-6 border border-white/5 space-y-4">
          {error && <div role="alert" className="bg-red-500/10 text-red-400 text-sm rounded-lg p-3 border border-red-500/20">{error}</div>}
          <div>
            <Label htmlFor="login-email" className="text-white/60 text-xs">Email</Label>
            <Input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" aria-label="Email address" className="bg-white/5 border-white/10 text-white mt-1" required />
          </div>
          <div>
            <Label htmlFor="login-password" className="text-white/60 text-xs">Password</Label>
            <Input id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" aria-label="Password" className="bg-white/5 border-white/10 text-white mt-1" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full border-white/10 text-white/80 hover:bg-white/5">
            Continue with Google
          </Button>
          <div className="flex justify-between text-xs">
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Create account</Link>
            <Link to="/forgot-password" className="text-white/40 hover:text-white/60">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
