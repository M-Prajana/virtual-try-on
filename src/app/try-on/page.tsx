"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ImageUpload } from "@/components/image-upload";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

interface TryOnResult {
  id: string;
  resultUrl?: string;
  status: string;
  createdAt: string;
  bodyImageId?: string;
  garmentImageId?: string;
  bodyImage?: { imageUrl: string };
  garmentImage?: { imageUrl: string };
}

export default function TryOnPage() {
  const { status } = useSession();
  const router = useRouter();
  const [bodyImage, setBodyImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [resetKey, setResetKey] = useState(0);

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

  const handleBodyImageSelect = (file: File) => {
    setBodyImage(file);
    setError("");
  };

  const handleGarmentImageSelect = (file: File) => {
    setGarmentImage(file);
    setError("");
  };

  const handleGenerateTryOn = async () => {
    if (!bodyImage || !garmentImage) {
      setError("Please upload both a body photo and a garment image.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const formBody = new FormData();
      formBody.append("image", bodyImage);
      const bodyResponse = await fetch("/api/upload/body", { method: "POST", body: formBody });
      if (!bodyResponse.ok) throw new Error("Failed to upload body image");
      const bodyData = await bodyResponse.json();

      const formGarment = new FormData();
      formGarment.append("image", garmentImage);
      const garmentResponse = await fetch("/api/upload/garment", { method: "POST", body: formGarment });
      if (!garmentResponse.ok) throw new Error("Failed to upload garment image");
      const garmentData = await garmentResponse.json();

      const tryOnResponse = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyImageId: bodyData.data.id, garmentImageId: garmentData.data.id }),
      });
      if (!tryOnResponse.ok) throw new Error("Failed to generate try-on");
      const tryOnJson = await tryOnResponse.json();
      setResult({ id: tryOnJson.data.id, status: tryOnJson.data.status, createdAt: tryOnJson.data.createdAt });
      await pollTryOnResult(tryOnJson.data.id);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const pollTryOnResult = async (id: string) => {
    setIsPolling(true);
    try {
      for (let attempt = 0; attempt < 12; attempt++) {
        const statusResponse = await fetch(`/api/try-on/${id}`);
        const statusJson = await statusResponse.json();
        if (!statusResponse.ok) throw new Error(statusJson.error || "Unable to check status");
        setResult(statusJson.data);
        if (statusJson.data.status === "completed") break;
        if (statusJson.data.status === "failed") throw new Error("Try-on processing failed.");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (err: any) {
      setError(err.message || "Unable to fetch result status.");
    } finally {
      setIsPolling(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBodyImage(null);
    setGarmentImage(null);
    setError("");
    setResult(null);
    setResetKey((k) => k + 1);
  };

  const bothUploaded = bodyImage && garmentImage;

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
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Flux 1.0 VTON</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Virtual Try-On Studio</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Upload a body photo and a garment image — our AI generates a realistic try-on in under 30 seconds.
            </p>
          </div>

          {/* Upload section */}
          <div className="card-soft p-6 mb-5">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Body photo */}
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Your body photo</p>
                    <p className="text-xs text-muted-foreground">Full-body, front-facing</p>
                  </div>
                </div>
                <ImageUpload
                  key={`body-${resetKey}`}
                  label="Body Photo"
                  accept="image/*"
                  compact
                  onImageSelect={handleBodyImageSelect}
                />
              </div>

              {/* Garment */}
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Garment image</p>
                    <p className="text-xs text-muted-foreground">Any clothing item works</p>
                  </div>
                </div>
                <ImageUpload
                  key={`garment-${resetKey}`}
                  label="Garment"
                  accept="image/*"
                  compact
                  onImageSelect={handleGarmentImageSelect}
                />
              </div>
            </div>

            {/* Tips strip */}
            <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-x-6 gap-y-2">
              {[
                "Front-facing pose works best",
                "Good lighting improves accuracy",
                "You can drag images from Myntra",
              ].map((tip) => (
                <div key={tip} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleGenerateTryOn}
              disabled={loading || !bothUploaded}
              className="btn-dark flex-1 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  {isPolling ? "Generating your look…" : "Uploading images…"}
                </span>
              ) : (
                "Generate Try-On Preview →"
              )}
            </button>
            {(bodyImage || garmentImage || result) && (
              <button onClick={handleReset} className="btn-outline px-8 py-3.5">
                Reset
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Status indicator */}
          {loading && (
            <div className="mb-6 rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Processing your try-on</p>
                <p className="text-xs text-muted-foreground">This usually takes 20–30 seconds. Hang tight!</p>
              </div>
            </div>
          )}

          {/* Result section */}
          {result && (
            <div className="card-soft p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Result</p>
                  <h2 className="text-2xl font-bold text-foreground">Your Try-On Preview</h2>
                </div>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  result.status === "completed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-surface text-muted-foreground"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${result.status === "completed" ? "bg-green-500" : "bg-amber-400 animate-pulse"}`} />
                  {result.status === "completed" ? "Complete" : result.status === "processing" ? "Processing" : "Pending"}
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                {/* Result image */}
                <div className="rounded-xl border border-border bg-surface overflow-hidden">
                  <div className="relative h-[480px]">
                    {result.status === "completed" && result.resultUrl ? (
                      <Image src={result.resultUrl} alt="Try-on result" fill className="object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-border border-t-brand animate-spin" />
                        <div className="text-center">
                          <p className="font-semibold text-foreground">Generating your preview</p>
                          <p className="text-sm text-muted-foreground mt-1">Result will appear here shortly</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Side panel */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Details</p>
                    <p className="text-xs text-muted-foreground leading-5">
                      {result.status === "completed"
                        ? "Your virtual try-on is ready. Download it or view your full history."
                        : "Processing your image. This takes around 20–30 seconds using the Flux VTON model."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Try-On ID</p>
                    <p className="text-xs font-mono text-foreground break-all">{result.id}</p>
                  </div>

                  <div className="space-y-2">
                    {result.status === "completed" && result.resultUrl ? (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(result.resultUrl!);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `try-on-${result.id}.jpg`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch {
                              setError("Failed to download image");
                            }
                          }}
                          className="btn-dark w-full py-2.5"
                        >
                          Download Image
                        </button>
                        <Link href="/history" className="btn-outline w-full py-2.5 justify-center">
                          View History
                        </Link>
                      </>
                    ) : (
                      <div className="w-full py-2.5 rounded-full border border-border bg-surface text-muted-foreground text-sm font-medium text-center">
                        Waiting for result…
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
