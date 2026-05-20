"use client";

import { useState, useRef } from "react";
import { validateImageFile, formatFileSize } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  label: string;
  accept?: string;
  maxSize?: number;
  preview?: string;
  compact?: boolean;
}

export function ImageUpload({
  onImageSelect,
  label,
  accept = "image/jpeg,image/png,image/webp",
  maxSize = 10 * 1024 * 1024,
  preview,
  compact = false,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>(preview || "");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError("");
    setIsLoading(true);
    const validation = validateImageFile(file, maxSize);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      setIsLoading(false);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleUrlDrop = async (imageUrl: string) => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
      if (!res.ok) throw new Error("Could not load image from that URL.");
      const blob = await res.blob();
      const ext = blob.type.split("/")[1] || "jpg";
      const file = new File([blob], `dragged-image.${ext}`, { type: blob.type });
      handleFile(file);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not load that image. Try saving it to your device first."
      );
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
      return;
    }
    if (e.dataTransfer.items) {
      for (const item of Array.from(e.dataTransfer.items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) { handleFile(file); return; }
        }
      }
    }
    const uriList = e.dataTransfer.getData("text/uri-list");
    const plain = e.dataTransfer.getData("text/plain");
    const html = e.dataTransfer.getData("text/html");
    let imageUrl = uriList || plain || "";
    if (!imageUrl && html) {
      const match = html.match(/src="([^"]+)"/);
      if (match) imageUrl = match[1];
    }
    if (imageUrl && imageUrl.startsWith("http")) handleUrlDrop(imageUrl);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleClick = () => inputRef.current?.click();

  const handleRemove = () => {
    setPreviewUrl("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={handleChange} />

      {compact ? (
        previewUrl ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface">
            <div className="relative w-14 h-[68px] rounded-lg overflow-hidden border border-border shrink-0 bg-background">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Ready to process</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleClick}
                type="button"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-surface transition-colors text-foreground"
              >
                Change
              </button>
              <button
                onClick={handleRemove}
                type="button"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors text-muted-foreground"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 h-40 ${
              dragActive
                ? "border-brand bg-brand/5 scale-[1.01]"
                : "border-border bg-card hover:border-brand/50 hover:bg-surface/60"
            } ${error ? "border-destructive/50 bg-destructive/5" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Processing...</p>
              </div>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${dragActive ? "bg-brand/15 text-brand" : "bg-surface text-muted-foreground"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Click or drag & drop</p>
                </div>
              </>
            )}
          </div>
        )
      ) : (
        !previewUrl ? (
          <div
            className={`group relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
              dragActive ? "border-brand bg-brand/5 scale-[1.01]" : "border-border bg-card hover:border-brand/50 hover:bg-surface/50"
            } ${error ? "border-destructive/50 bg-destructive/5" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className="p-10 text-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-border border-t-foreground rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Processing image...</p>
                </div>
              ) : (
                <>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-colors ${dragActive ? "bg-brand/15 text-brand" : "bg-surface text-muted-foreground group-hover:text-brand group-hover:bg-brand/10"}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    Click to upload <span className="text-muted-foreground font-normal">or drag & drop</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WEBP — up to {formatFileSize(maxSize)}</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="relative group rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
            <div className="aspect-square relative bg-surface">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Ready
                </div>
              </div>
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleClick} type="button" title="Change image" className="p-2 bg-white/90 rounded-xl shadow-sm hover:bg-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={handleRemove} type="button" title="Remove image" className="p-2 bg-red-500/90 text-white rounded-xl shadow-sm hover:bg-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-border bg-surface/40 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Image uploaded</p>
              <p className="text-xs text-muted-foreground">Hover to change or remove</p>
            </div>
          </div>
        )
      )}

      {error && (
        <div className="mt-3 p-3 rounded-xl border border-destructive/30 bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
