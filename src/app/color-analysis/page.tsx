"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

interface AnalysisResult {
  season: string;
  temperature: string;
  depth: string;
  chroma: string;
  myntra_url: string;
  palette: [number, number, number][];
  detected_colors: [number, number, number][];
}

function toHex(rgb: number[]): string {
  return "#" + rgb.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

const SEASON_DESCRIPTIONS: Record<string, string> = {
  "Bright Spring": "You shine in vivid, clear colours with warm undertones — think coral, sunny yellow, and bright aqua.",
  "True Spring": "Warm, golden and fresh — ivory, peach, coral and warm greens suit you best.",
  "Light Spring": "Delicate, warm and light — your best shades are soft peach, light warm pink, and sky blue.",
  "Light Summer": "Cool and soft — your palette is muted pastels: lavender, soft blue, rose and dusty pink.",
  "True Summer": "Cool, soft and muted — dusty rose, soft periwinkle, mauve and slate blue are your shades.",
  "Soft Summer": "Muted and cool — blend taupe, dusty blue, soft grey and rose for the most flattering looks.",
  "Soft Autumn": "Muted and warm — think camel, warm beige, olive and terracotta.",
  "True Autumn": "Rich and warm — burnt orange, mustard, olive and warm brown are your power colours.",
  "Deep Autumn": "Deep, warm and intense — dark chocolate, forest green and deep burgundy are your signature.",
  "Deep Winter": "High contrast and cool — jet black, charcoal and deep burgundy make your features pop.",
  "True Winter": "Pure and cool — pure white, black, icy blue and jewel tones are your best bet.",
  "Bright Winter": "Cool and vivid — electric blue, bright red and pure white give you that striking look.",
};

export default function ColorAnalysisPage() {
  const { status } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-border border-t-brand animate-spin" />
      </div>
    );
  }

  const handleFile = (file: File) => {
    setImage(file);
    setError("");
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("image", image);
      const res = await fetch("/api/color-analysis", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analysis failed");
      setResult(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview("");
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main className="py-10">
        <div className="mx-auto max-w-5xl px-6">

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand">AI-Powered</span>
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">12-Season Theory</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Color Analysis</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Upload a clear photo of yourself — we detect your colour season and recommend shades that suit you best.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Upload panel */}
            <div className="card-soft p-6 flex flex-col gap-5">
              <h2 className="text-base font-bold uppercase tracking-wider text-foreground">Your Photo</h2>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />

              {!preview ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-all duration-200 ${
                    dragActive ? "border-brand bg-brand/5 scale-[1.01]" : "border-border bg-surface/50 hover:border-brand/50 hover:bg-surface"
                  }`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${dragActive ? "bg-brand/15 text-brand" : "bg-surface text-muted-foreground"}`}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground text-sm">Click to upload <span className="text-muted-foreground font-normal">or drag & drop</span></p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — up to 10 MB</p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
                  <div className="aspect-[3/4] relative">
                    <img src={preview} alt="Your photo" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Photo loaded
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      type="button"
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-xl border border-border hover:bg-white transition-colors shadow-sm"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!image || loading}
                  className="btn-brand flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Analyzing…
                    </span>
                  ) : "Analyze Colors →"}
                </button>
                {result && (
                  <Link href="/try-on" className="btn-outline py-3 px-5">
                    Try-On →
                  </Link>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Tips */}
              <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Tips for best results</p>
                {[
                  "Front-facing photo in natural light",
                  "No sunglasses, hats, or heavy filters",
                  "Face clearly visible and unobstructed",
                ].map((tip) => (
                  <div key={tip} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            {/* Results panel */}
            <div className="card-soft p-6 flex flex-col gap-5">
              <h2 className="text-base font-bold uppercase tracking-wider text-foreground">Your Color Season</h2>

              {!result ? (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[24rem] gap-4 text-center">
                  <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-surface">
                    <svg className="w-8 h-8 opacity-30 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">No analysis yet</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">Upload a photo and click Analyze to discover your colour season.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">

                  {/* Season headline */}
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Your season</p>
                    <p className="font-display text-3xl font-extrabold uppercase text-foreground">{result.season}</p>
                    <p className="mt-3 text-sm text-muted-foreground leading-6">
                      {SEASON_DESCRIPTIONS[result.season] ?? "A unique colour season that suits your natural colouring."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">{result.temperature}</span>
                      <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">{result.depth}</span>
                      <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">{result.chroma} Chroma</span>
                    </div>
                  </div>

                  {/* Recommended palette */}
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Recommended palette</p>
                    <div className="flex gap-3">
                      {result.palette.map((color, i) => (
                        <div key={i} className="flex-1 text-center">
                          <div
                            className="h-12 rounded-xl border border-black/10 shadow-sm"
                            style={{ backgroundColor: toHex(color) }}
                          />
                          <p className="mt-1.5 text-[9px] font-mono text-muted-foreground">{toHex(color)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detected face colours */}
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Detected from your photo</p>
                    <div className="flex flex-wrap gap-2">
                      {result.detected_colors.map((color, i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: toHex(color) }}
                          title={toHex(color)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-2 pt-1">
                    <a
                      href={result.myntra_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-dark justify-center py-3"
                    >
                      Shop your palette on Myntra →
                    </a>
                    <Link href="/try-on" className="btn-outline justify-center py-3">
                      Use this photo for Virtual Try-On →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
