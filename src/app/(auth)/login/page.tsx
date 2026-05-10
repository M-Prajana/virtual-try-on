"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50/60 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-300/30 dark:bg-indigo-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-300/25 dark:bg-purple-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-100/30 via-purple-100/25 to-indigo-100/30 dark:from-pink-900/10 dark:via-purple-900/10 dark:to-indigo-900/10 rounded-full blur-3xl"></div>
        {/* Floating decorative elements */}
        <div className="absolute top-32 right-32 w-16 h-16 bg-gradient-to-br from-emerald-400/50 to-teal-500/50 rounded-2xl rotate-45 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-rose-400/50 to-pink-500/50 rounded-full animate-pulse"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Enhanced Main Card */}
        <div className="glass p-8 rounded-[2rem] premium-shadow border border-white/10 bg-white/10 dark:bg-gray-900/70">
          {/* Enhanced Logo/Title Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Welcome Back
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
              Sign in to continue your fashion journey
            </p>
          </div>

          {/* Enhanced Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50/90 to-rose-50/90 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur-xl border-2 border-red-200/60 dark:border-red-800/60 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-800 dark:text-red-200">Sign In Failed</p>
                  <p className="text-base text-red-700 dark:text-red-300 mt-1 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Enhanced Email Field */}
            <div className="relative group">
              <label
                htmlFor="email"
                className={`absolute left-6 transition-all duration-300 pointer-events-none text-lg font-semibold ${
                  focusedField === "email" || email
                    ? "top-3 text-sm text-indigo-600 dark:text-indigo-400 scale-90"
                    : "top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400"
                }`}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                required
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                placeholder=""
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-500 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            {/* Enhanced Password Field */}
            <div className="relative group">
              <label
                htmlFor="password"
                className={`absolute left-6 transition-all duration-300 pointer-events-none text-lg font-semibold ${
                  focusedField === "password" || password
                    ? "top-3 text-sm text-indigo-600 dark:text-indigo-400 scale-90"
                    : "top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400"
                }`}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                required
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                placeholder=""
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-500 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Enhanced Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-white/10 dark:hover:bg-gray-800 transition-all duration-300"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white font-semibold text-lg shadow-xl transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Continue to Dashboard</span>
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </div>

              {/* Enhanced Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          {/* Enhanced Social Login Divider */}
          <div className="mt-10 mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-300/60 dark:border-gray-600/60"></div>
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-6 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Enhanced Social Login Buttons */}
          <div className="grid grid-cols-2 gap-6">
            <button className="group flex items-center justify-center gap-4 p-5 bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-3xl hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-gray-800/40 hover:scale-105 hover:-translate-y-1">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Google</span>
            </button>

            <button className="group flex items-center justify-center gap-4 p-5 bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200/60 dark:border-gray-600/60 rounded-3xl hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-gray-800/40 hover:scale-105 hover:-translate-y-1">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Twitter</span>
            </button>
          </div>

          {/* Enhanced Sign Up Link */}
          <div className="mt-10 text-center">
            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
              New to Virtual Try-On?{" "}
              <Link
                href="/register"
                className="inline-flex rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
              >
                Create your account
              </Link>
            </p>
          </div>

          {/* Enhanced Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>

        {/* Enhanced Footer Text */}
        <div className="mt-10 text-center">
          <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
