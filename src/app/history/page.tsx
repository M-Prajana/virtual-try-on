"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

interface TryOnResult {
  id: string;
  resultUrl: string;
  status: string;
  createdAt: string;
  isFavorite: boolean;
  bodyImage: { imageUrl: string };
  garmentImage: { imageUrl: string };
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tryOns, setTryOns] = useState<TryOnResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    if (status === "authenticated") {
      fetchTryOns();
    }
  }, [status, filter]);

  const fetchTryOns = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = filter === "favorites" ? "/api/favorites" : "/api/try-on";
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to load try-ons");
      const data = await response.json();
      setTryOns(data.data || data);
    } catch {
      setError("An error occurred while loading try-ons.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (tryOnId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await fetch(`/api/favorites/${tryOnId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tryOnResultId: tryOnId }),
        });
      }
      fetchTryOns();
    } catch {
      setError("Failed to update favorites.");
    }
  };

  const handleDownload = async (imageUrl: string, tryOnId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `try-on-result-${tryOnId}.jpg`;
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-950 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Your closet</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Saved try-ons and favorites</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Explore your past virtual outfit previews, bookmark favorites, and download your best looks.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/try-on" className="rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500">
              New Try-On
            </Link>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-3xl px-5 py-3 text-sm font-semibold transition premium-shadow ${filter === "all" ? "glass gradient-text border border-white/20" : "glass text-slate-700 dark:text-slate-200 border border-white/10 hover:bg-white/10"}`}
          >
            All Try-Ons
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`rounded-3xl px-5 py-3 text-sm font-semibold transition premium-shadow ${filter === "favorites" ? "glass gradient-text border border-white/20" : "glass text-slate-700 dark:text-slate-200 border border-white/10 hover:bg-white/10"}`}
          >
            Favorites
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-[2rem] glass premium-shadow">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
              <p className="text-sm text-slate-300">Loading your history...</p>
            </div>
          </div>
        ) : tryOns.length === 0 ? (
          <div className="rounded-[2rem] glass p-12 text-center premium-shadow">
            <p className="text-slate-400">No results yet.</p>
            <p className="mt-4 text-xl font-semibold gradient-text">Start your first virtual try-on.</p>
            <Link href="/try-on" className="mt-6 inline-flex rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white premium-shadow transition hover:scale-105">
              Create try-on
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {tryOns.map((tryOn) => (
              <div key={tryOn.id} className="overflow-hidden rounded-[2rem] glass premium-shadow transition hover:-translate-y-2 hover:scale-[1.02] border border-white/10">
                <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                  {tryOn.resultUrl ? (
                    <Image src={tryOn.resultUrl} alt="Try-on result" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                        <p className="text-sm">Processing...</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => toggleFavorite(tryOn.id, tryOn.isFavorite)}
                    className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full glass text-slate-950 dark:text-slate-100 premium-shadow transition hover:scale-110"
                  >
                    <svg className={`w-6 h-6 ${tryOn.isFavorite ? "fill-pink-500 text-pink-500" : "text-slate-400"}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="rounded-full glass px-3 py-1 text-xs font-semibold gradient-text border border-white/20">{tryOn.status}</p>
                    <span className="text-xs text-slate-400">{new Date(tryOn.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-3xl glass p-3 border border-white/10">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Body</p>
                      <div className="relative mt-3 h-24 overflow-hidden rounded-3xl border border-white/10">
                        <Image src={tryOn.bodyImage.imageUrl} alt="Body preview" fill className="object-cover" />
                      </div>
                    </div>
                    <div className="rounded-3xl glass p-3 border border-white/10">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Garment</p>
                      <div className="relative mt-3 h-24 overflow-hidden rounded-3xl border border-white/10">
                        <Image src={tryOn.garmentImage.imageUrl} alt="Garment preview" fill className="object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => tryOn.resultUrl && handleDownload(tryOn.resultUrl, tryOn.id)}
                      disabled={!tryOn.resultUrl}
                      className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white premium-shadow transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Download
                    </button>
                    <Link href="/try-on" className="rounded-3xl glass px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-white/10 transition hover:bg-white/10">
                      New try-on
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
