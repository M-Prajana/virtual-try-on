"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
      } else {
        router.push("/login?registered=true");
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
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Have an account?{" "}
          <span className="font-semibold text-foreground underline underline-offset-4">Sign in</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 mb-5">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-xs font-semibold text-brand">Free forever</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="text-muted-foreground mt-2 text-sm">Start styling smarter with AI-powered fashion tools.</p>
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
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input
                  id="name" name="name" type="text"
                  value={formData.name} onChange={handleChange} required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15 transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input
                  id="email" name="email" type="email"
                  value={formData.email} onChange={handleChange} required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15 transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input
                  id="password" name="password" type="password"
                  value={formData.password} onChange={handleChange} required
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15 transition-all"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password"
                  value={formData.confirmPassword} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-brand w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-foreground hover:text-brand transition-colors underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
