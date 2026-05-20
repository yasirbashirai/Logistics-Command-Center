"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/today";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(next);
        router.refresh();
      } else {
        setError("Wrong password");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <form onSubmit={submit} className="card p-6 w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-lg bg-brand-gradient flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-brand-fg" />
          </div>
          <h1 className="text-xl font-bold">Logistics Command Center</h1>
          <p className="text-sm text-fg-muted mt-1">Enter password to continue</p>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input"
        />
        {error && (
          <div className="flex items-center gap-2 text-xs text-danger">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </div>
        )}
        <button type="submit" disabled={pending || !password} className="btn-brand w-full justify-center">
          {pending ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
