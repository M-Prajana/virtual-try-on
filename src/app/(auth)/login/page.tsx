"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tighter">
          GLAM<span className="text-brand">.AI</span>
        </Link>
        <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          No account?{" "}
          <span className="font-semibold text-foreground underline underline-offset-4">Sign up free</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to continue your fashion journey.</p>
          </div>

          <div className="card-soft p-8">
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 dark:bg-red-950/30 dark:border-red-900/40">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15 transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-dark w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In →"
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                New to GLAM.AI?{" "}
                <Link href="/register" className="font-semibold text-foreground hover:text-brand transition-colors underline underline-offset-4">
                  Create a free account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
