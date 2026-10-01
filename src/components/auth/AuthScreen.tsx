import { useState } from "react";
import type { FormEvent } from "react";
import type { AuthResult } from "../../data/localStore";

interface AuthScreenProps {
  onLogin: (identifier: string, password: string) => AuthResult;
  onRegister: (username: string, email: string, password: string) => AuthResult;
  onResetDemo: () => void;
}

export function AuthScreen({ onLogin, onRegister, onResetDemo }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError("");
    setPassword("");
    setConfirm("");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (mode === "login") {
      const result = onLogin(identifier, password);
      if (!result.ok) {
        setError(result.error ?? "Could not log in.");
      }
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const result = onRegister(username, identifier, password);
    if (!result.ok) {
      setError(result.error ?? "Could not create the account.");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-heading">
        <div className="auth-logo" aria-hidden="true">
          GSC
        </div>
        <h1 id="auth-heading">{mode === "login" ? "Welcome back!" : "Create an account"}</h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "We're so excited to see you again!"
            : "Join Galaxia Star Communicators"}
        </p>

        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </label>
          )}
          <label>
            {mode === "login" ? "Email or Username" : "Email"}
            <input
              type={mode === "login" ? "text" : "email"}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete={mode === "login" ? "username" : "email"}
              autoFocus={mode === "login"}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </label>
          {mode === "register" && (
            <label>
              Confirm Password
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="auth-submit">
            {mode === "login" ? "Log In" : "Continue"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? (
            <>
              Need an account?{" "}
              <button type="button" onClick={() => switchMode("register")}>
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("login")}>
                Log In
              </button>
            </>
          )}
        </p>

        <button type="button" className="auth-reset" onClick={onResetDemo}>
          Reset demo data
        </button>
      </section>
    </main>
  );
}
