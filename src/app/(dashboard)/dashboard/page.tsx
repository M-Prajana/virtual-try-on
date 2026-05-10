"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardStats {
  totalTryOns: number;
  totalBodyImages: number;
  totalGarmentImages: number;
  totalFavorites: number;
}

interface TryOnResult {
  id: string;
  resultImageUrl: string;
  status: string;
  createdAt: string;
  isFavorite: boolean;
  bodyImage: {
    imageUrl: string;
  };
  garmentImage: {
    imageUrl: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTryOns, setRecentTryOns] = useState<TryOnResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch("/api/dashboard/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent try-ons
      const tryOnsResponse = await fetch("/api/try-on");
      if (tryOnsResponse.ok) {
        const tryOnsData = await tryOnsResponse.json();
        setRecentTryOns(tryOnsData.slice(0, 6)); // Show only 6 most recent
      }
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (tryOnId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        // Remove from favorites
        await fetch(`/api/favorites/${tryOnId}`, {
          method: "DELETE",
        });
      } else {
        // Add to favorites
        await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tryOnResultId: tryOnId }),
        });
      }
      
      // Refresh data
      fetchDashboardData();
    } catch (err) {
      setError("Failed to update favorites");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-8">
      <header className="glass p-6 rounded-[2rem] border border-white/10 bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
              <h1 className="text-5xl font-black gradient-text">Virtual Try-On</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Your dashboard for outfit previews, favorites, and quick style insights.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/try-on"
              className="inline-flex items-center justify-center rounded-3xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-amber-300 transition"
            >
              Start Try-On
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="glass p-6 rounded-2xl premium-shadow border border-white/10 hover:scale-[1.02] transition mb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">April</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m2-4h.01M12 18.5a6.5 6.5 0 116.5-6.5 6.507 6.507 0 01-6.5 6.5z" />
                  </svg>
                  Due in 3 days
                </div>
              </div>
              <h2 className="mt-6 text-5xl font-extrabold text-slate-950 dark:text-white">
                {stats?.totalTryOns ?? 0} Try-Ons
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Your most recent outfit previews are ready. Review, save, or create a fresh look with one tap.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/try-on"
                className="inline-flex items-center justify-center rounded-3xl bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-amber-300 transition"
              >
                Try now
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
              >
                View history
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="glass p-6 rounded-2xl premium-shadow border border-white/10 hover:scale-[1.02] transition">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Try-Ons</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{stats?.totalTryOns ?? 0}</p>
          </div>
          <div className="glass p-6 rounded-2xl premium-shadow border border-white/10 hover:scale-[1.02] transition">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Body Images</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{stats?.totalBodyImages ?? 0}</p>
          </div>
          <div className="glass p-6 rounded-2xl premium-shadow border border-white/10 hover:scale-[1.02] transition">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Garment Images</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{stats?.totalGarmentImages ?? 0}</p>
          </div>
          <div className="glass p-6 rounded-2xl premium-shadow border border-white/10 hover:scale-[1.02] transition">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Favorites</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{stats?.totalFavorites ?? 0}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="glass p-6 rounded-2xl premium-shadow border border-white/10 hover:scale-[1.02] transition">
            <div className="flex items-center justify-between gap-6 mb-5">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Latest Try-Ons</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">A quick glance at your most recent results</p>
              </div>
              <Link href="/history" className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-amber-500 hover:bg-white/20 transition">
                View all
              </Link>
            </div>
            {recentTryOns.length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">No try-ons yet. Start your first virtual outfit today.</p>
                <Link
                  href="/try-on"
                  className="mt-6 inline-flex items-center justify-center rounded-3xl bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-amber-300 transition"
                >
                  Try now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTryOns.slice(0, 3).map((tryOn) => (
                  <div key={tryOn.id} className="flex items-center gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-semibold">
                      {tryOn.status === 'completed' ? '✓' : '…'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950 dark:text-white">{new Date(tryOn.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Status: {tryOn.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass p-6 rounded-2xl premium-shadow border border-white/10 hover:scale-[1.02] transition">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Notifications</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Recent updates about your results</p>
              </div>
              <Link href="/history" className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-amber-500 hover:bg-white/20 transition">
                See all
              </Link>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-10 w-10 flex-shrink-0 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">Your latest try-on is ready</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Download your newest outfit preview and share it with friends.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-10 w-10 flex-shrink-0 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">Favorites updated</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">One of your saved looks is trending among your recommendations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
