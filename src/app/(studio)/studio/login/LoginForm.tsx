"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/studio/ui/Card";
import { Button } from "@/components/studio/ui/Button";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Invalid email or password.");
        setBusy(false);
        return;
      }
      router.push("/studio");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-studio-ink-2">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 px-3 rounded-lg border border-studio-border bg-studio-panel text-sm focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none"
              placeholder="you@cbtbank.co.tz"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-studio-ink-2">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 px-3 rounded-lg border border-studio-border bg-studio-panel text-sm focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none"
            />
          </label>
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <Button variant="primary" size="lg" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-xs text-studio-ink-3">
            Forgot your password?{" "}
            <a href="/admin/forgot" className="text-cb-navy hover:text-cb-green underline">
              Reset via Payload
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
