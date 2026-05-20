"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const FILTERS = ["All", "Favorites"] as const;
type Filter = (typeof FILTERS)[number];

interface TryOnResult {
  id: string;
  resultUrl?: string;
  status: string;
  createdAt: string;
  isFavorite: boolean;
  bodyImage: { imageUrl: string };
  garmentImage: { imageUrl: string };
}

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tryOns, setTryOns] = useState<TryOnResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<Filter>("All");

  useEffect(() => {
    if (status === "authenticated") fetchTryOns();
  }, [status, active]);

  const fetchTryOns = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = active === "Favorites" ? "/api/favorites" : "/api/try-on";
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to load try-ons");
      const data = await response.json();
      setTryOns(data.data || data || []);
    } catch {
      setError("An error occurred while loading your history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string | undefined, tryOnId: string) => {
    if (!imageUrl) { setError("No image available to download."); return; }
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `try-on-${tryOnId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError("Failed to download image.");
    }
  };

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Archive</p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">History</h1>
              <p className="text-muted-foreground mt-1">Every look you&apos;ve ever generated.</p>
            </div>
            <div className="flex items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActive(f)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    active === f
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full border-4 border-border border-t-brand animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading your history...</p>
              </div>
            </div>
          ) : tryOns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
              <svg className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-bold text-foreground">No results yet</p>
              <p className="text-sm text-muted-foreground mt-2">Generate your first virtual try-on to see it here.</p>
              <Link href="/try-on" className="btn-brand mt-6 py-3 px-7 text-sm">
                Create Try-On →
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-5">
                {tryOns.length} {tryOns.length === 1 ? "result" : "results"} · sorted newest first
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tryOns.map((tryOn, i) => {
                  const previewUrl = tryOn.resultUrl || tryOn.bodyImage?.imageUrl || tryOn.garmentImage?.imageUrl;
                  return (
                    <div key={tryOn.id} className="group">
                      <div className="relative aspect-[3/4] rounded-xl bg-surface overflow-hidden border border-border">
                        {previewUrl ? (
                          <Image
                            src={previewUrl}
                            alt={`Try-on ${i + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-400"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No preview
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                        {/* Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-mono uppercase bg-background/90 text-foreground px-2 py-0.5 rounded-md">
                            #{i + 1}
                          </span>
                        </div>

                        {/* Status */}
                        {tryOn.status === "completed" && (
                          <div className="absolute top-2.5 right-2.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
                          </div>
                        )}

                        {/* Action buttons (on hover) */}
                        <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => previewUrl && window.open(previewUrl, "_blank")}
                            className="flex-1 bg-white/95 text-foreground text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition hover:bg-white"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(previewUrl, tryOn.id)}
                            className="flex-1 bg-brand text-brand-foreground text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition hover:bg-brand-hover"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground">Look {i + 1}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          tryOn.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : tryOn.status === "failed"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-surface text-muted-foreground"
                        }`}>
                          {tryOn.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
