"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ImageUpload } from "@/components/image-upload";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bodyImage, setBodyImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [bodyPreview, setBodyPreview] = useState("");
  const [garmentPreview, setGarmentPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
          <p className="text-lg">Loading your studio...</p>
        </div>
      </div>
    );
  }

  const handleBodyImageSelect = (file: File) => {
    setBodyImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setBodyPreview(reader.result as string);
    reader.readAsDataURL(file);
    setError("");
  };

  const handleGarmentImageSelect = (file: File) => {
    setGarmentImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setGarmentPreview(reader.result as string);
    reader.readAsDataURL(file);
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
      setResult({
        id: tryOnJson.data.id,
        status: tryOnJson.data.status,
        createdAt: tryOnJson.data.createdAt,
      });
      await pollTryOnResult(tryOnJson.data.id);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const pollTryOnResult = async (id: string) => {
    setIsPolling(true);
    try {
      const maxAttempts = 12;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
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
    setBodyPreview("");
    setGarmentPreview("");
    setError("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.25),_transparent_25%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-2xl font-black tracking-tight">Virtual Try-On</span>
            </Link>
            <p className="mt-2 text-sm text-slate-300/80">Create your next outfit preview in minutes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden rounded-3xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 sm:inline-flex">
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {error && (
          <div className="mb-8 rounded-[2rem] border border-rose-400/30 bg-rose-500/10 p-6 text-rose-100 shadow-xl">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1fr_400px] mb-8">
          <div className="rounded-[2rem] glass premium-shadow p-8">
            <div className="mb-8 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 border border-cyan-500/20">AI Virtual Try-On</span>
              <h1 className="text-5xl font-black tracking-tight gradient-text">Upload, generate, and preview your outfit in real time.</h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300/80">
                Use our AI studio to blend your photo with any garment image and get a photorealistic preview you can download or save.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl glass p-6 border border-white/10 premium-shadow">
                <p className="text-sm text-slate-300">Recommended</p>
                <p className="mt-3 text-2xl font-semibold gradient-text">Front-facing photos</p>
              </div>
              <div className="rounded-3xl glass p-6 border border-white/10 premium-shadow">
                <p className="text-sm text-slate-300">Best results</p>
                <p className="mt-3 text-2xl font-semibold gradient-text">Clear lighting</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] glass premium-shadow p-6">
              <h2 className="text-xl font-bold gradient-text">Session summary</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl glass p-5 border border-white/10 premium-shadow">
                  <p className="text-sm text-slate-300">Images uploaded</p>
                  <p className="mt-3 text-3xl font-bold gradient-text">{bodyImage || garmentImage ? 2 : 0}</p>
                </div>
                <div className="rounded-3xl glass p-5 border border-white/10 premium-shadow">
                  <p className="text-sm text-slate-300">AI status</p>
                  <p className="mt-3 text-3xl font-bold gradient-text">{isPolling ? "Processing" : result ? result.status : "Ready"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] glass premium-shadow p-6">
              <h2 className="text-xl font-bold gradient-text">Need help?</h2>
              <p className="mt-3 text-slate-300 leading-7">Upload your photo and garment, then press "Generate" to see an instant preview. You can download the result once processing completes.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2 mb-8">
          <div className="rounded-[2rem] glass premium-shadow p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-200 border border-cyan-500/20">
                <span className="text-xl">1</span>
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">Upload your body photo</h3>
                <p className="text-sm text-slate-300">Choose a full-body front photo for the best fit.</p>
              </div>
            </div>
            <ImageUpload label="Body photo" accept="image/*" preview={bodyPreview} onImageSelect={handleBodyImageSelect} />
          </div>

          <div className="rounded-[2rem] glass premium-shadow p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-pink-500/10 text-pink-200 border border-pink-500/20">
                <span className="text-xl">2</span>
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">Upload your garment</h3>
                <p className="text-sm text-slate-300">Any clothing item works: shirt, dress, jacket, or top.</p>
              </div>
            </div>
            <ImageUpload label="Garment image" accept="image/*" preview={garmentPreview} onImageSelect={handleGarmentImageSelect} />
          </div>
        </div>

        <div className="mb-10 rounded-[2rem] glass premium-shadow p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Finalize your preview</h2>
              <p className="mt-2 text-slate-300">Generate a polished virtual try-on image once both uploads are ready.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleGenerateTryOn}
                disabled={loading || !bodyImage || !garmentImage}
                className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-7 py-4 text-base font-black text-white premium-shadow transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate Preview"}
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-3xl glass px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10 border border-white/10"
              >
                Reset
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">Processing usually completes in under 30 seconds.</p>
        </div>

        {result && (
          <div className="rounded-[2rem] glass premium-shadow p-8 overflow-hidden">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-black gradient-text">Try-On Result</h2>
                <p className="mt-2 text-slate-300">
                  {result.status === "completed"
                    ? "Your virtual try-on preview is ready."
                    : result.status === "processing"
                    ? "Your image is being generated. This can take a few moments."
                    : result.status === "pending"
                    ? "Try-on request submitted. Waiting for processing to start."
                    : "Checking the latest status for your result."}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Status: <span className="font-semibold text-white">{result.status}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
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
                          a.download = `try-on-result-${result.id}.jpg`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (err) {
                          setError("Failed to download image");
                        }
                      }}
                      className="rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-black text-slate-950 premium-shadow transition hover:scale-105"
                    >
                      Download
                    </button>
                    <Link href="/history" className="rounded-3xl glass px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 border border-white/10">
                      View History
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (result.status !== "completed") {
                        setError("Please wait until the result is ready to download.");
                      }
                    }}
                    className="rounded-3xl glass px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 border border-white/10"
                  >
                    {result.status === "completed" ? "Download" : "Waiting..."}
                  </button>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] glass p-4 premium-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 pointer-events-none" />
              <div className="relative h-[28rem] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center bg-slate-950/80">
                {result.status === "completed" && result.resultUrl ? (
                  <Image
                    src={result.resultUrl}
                    alt="Try-on result"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center px-8">
                    <div className="h-20 w-20 rounded-full border-4 border-cyan-500/40 border-t-white animate-spin" />
                    <p className="text-lg font-semibold text-white">Generating your preview...</p>
                    <p className="max-w-md text-sm text-slate-400">
                      Your virtual try-on is processing in the background. This may take a minute depending on model load.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
