"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

interface DashboardStats {
  totalTryOns: number;
  completedTryOns: number;
  failedTryOns: number;
  favorites: number;
  bodyImages: number;
  garmentImages: number;
}

interface TryOnResult {
  id: string;
  resultUrl?: string;
  status: string;
  createdAt: string;
  isFavorite: boolean;
  bodyImage: { imageUrl: string };
  garmentImage: { imageUrl: string };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTryOns, setRecentTryOns] = useState<TryOnResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  useEffect(() => {
    if (status === "authenticated") fetchDashboardData();
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tryOnsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/try-on"),
      ]);
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.data || null);
      }
      if (tryOnsRes.ok) {
        const d = await tryOnsRes.json();
        setRecentTryOns(d.data || []);
      }
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-border border-t-brand animate-spin" />
      </div>
    );
  }

  const firstName = (session?.user?.name || "there").split(" ")[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-6">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Overview</p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Hey, {firstName} 👋</h1>
              <p className="text-muted-foreground mt-1">Here&apos;s everything happening in your studio.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/color-analysis" className="btn-outline py-2.5 px-5 text-sm">
                Color Analysis
              </Link>
              <Link href="/try-on" className="btn-brand py-2.5 px-5 text-sm">
                New Try-On →
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Try-Ons", value: stats?.totalTryOns ?? 0, sub: `${stats?.completedTryOns ?? 0} completed` },
              { label: "Favorites", value: stats?.favorites ?? 0, sub: "Saved looks" },
              { label: "Body Images", value: stats?.bodyImages ?? 0, sub: "Uploaded" },
              { label: "Garments", value: stats?.garmentImages ?? 0, sub: "Uploaded" },
            ].map((s) => (
              <div key={s.label} className="card-soft p-5">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">{s.label}</p>
                <p className="font-display text-4xl font-extrabold tabular-nums text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

            {/* Recent try-ons */}
            <div className="card-soft p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-foreground">Latest Try-Ons</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Your most recent results</p>
                </div>
                <Link href="/history" className="text-[11px] font-bold uppercase tracking-widest text-brand hover:text-brand-hover transition-colors">
                  View all →
                </Link>
              </div>

              {recentTryOns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3 rounded-xl border border-dashed border-border bg-surface/50">
                  <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-foreground">No try-ons yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Generate your first look to see it here.</p>
                  </div>
                  <Link href="/try-on" className="btn-brand mt-2 py-2 px-5 text-sm">
                    Start now →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {recentTryOns.slice(0, 6).map((tryOn, i) => {
                    const previewUrl = tryOn.resultUrl || tryOn.bodyImage?.imageUrl || tryOn.garmentImage?.imageUrl;
                    return (
                      <div key={tryOn.id} className="group">
                        <div className="aspect-[3/4] rounded-xl bg-surface relative overflow-hidden border border-border">
                          {previewUrl ? (
                            <Image src={previewUrl} alt={`Look ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <svg className="w-6 h-6 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 text-[10px] font-mono uppercase bg-background/90 text-foreground px-2 py-0.5 rounded-md">
                            #{i + 1}
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">Look {i + 1}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="space-y-4">
              <div className="card-soft p-5">
                <h2 className="text-base font-bold uppercase tracking-wider text-foreground mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { label: "New Virtual Try-On", href: "/try-on", accent: true },
                    { label: "Color Analysis", href: "/color-analysis", accent: false },
                    { label: "View History", href: "/history", accent: false },
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`flex items-center justify-between w-full px-5 py-3 rounded-full text-sm font-semibold transition-all ${
                        action.accent
                          ? "bg-gradient-to-r from-brand to-rose-500 text-white shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-0.5"
                          : "bg-surface border border-border text-foreground hover:border-foreground/30 hover:bg-background"
                      }`}
                    >
                      {action.label}
                      <span>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="card-soft p-5">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Session</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Logged in as</span>
                    <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">{session?.user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
