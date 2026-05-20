import Link from "next/link";
import { auth } from "@/lib/auth";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main>
        {/* ── Hero ── */}
        <section className="py-24 md:py-36 border-b border-border">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="text-xs font-semibold text-brand">AI-Powered Fashion Studio</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-extrabold uppercase leading-tight max-w-3xl mx-auto">
              Dress for your <span className="text-brand">colours.</span><br />
              Try before you buy.
            </h1>

            <p className="text-lg text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed">
              Discover your personal colour season and virtually try on any outfit —
              powered by AI, all from one place.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <Link href={session ? "/try-on" : "/register"} className="btn-brand px-8 py-3 text-base">
                Try On Now →
              </Link>
              <Link href={session ? "/color-analysis" : "/register"} className="btn-outline px-8 py-3 text-base">
                Color Analysis
              </Link>
            </div>
          </div>
        </section>

        {/* ── Season palette strip ── */}
        <section className="py-10 border-b border-border overflow-hidden bg-surface/40">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mb-6">12 colour seasons detected by AI</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Bright Spring", colors: ["#ff4040", "#ffe000", "#00bfff"] },
                { label: "True Spring",   colors: ["#ffd700", "#90ee90", "#ffa07a"] },
                { label: "Light Spring",  colors: ["#ffb6c1", "#ffe4e1", "#87ceeb"] },
                { label: "Light Summer",  colors: ["#add8e6", "#dda0dd", "#f08080"] },
                { label: "True Summer",   colors: ["#4682b4", "#bc8f8f", "#8fbc8f"] },
                { label: "Soft Summer",   colors: ["#808080", "#c0c0c0", "#008080"] },
                { label: "Soft Autumn",   colors: ["#8b4513", "#cd853f", "#808000"] },
                { label: "True Autumn",   colors: ["#ff4500", "#8b6914", "#228b22"] },
                { label: "Deep Autumn",   colors: ["#4a2c17", "#8b4513", "#006400"] },
                { label: "Deep Winter",   colors: ["#111111", "#a9a9a9", "#00008b"] },
                { label: "True Winter",   colors: ["#000000", "#ffffff", "#ff0000"] },
                { label: "Bright Winter", colors: ["#0000ff", "#ff0000", "#ffffff"] },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-card border border-border shadow-sm">
                  <div className="flex gap-1">
                    {s.colors.map((c) => (
                      <div key={c} className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Two powerful tools</p>
              <h2 className="font-display text-4xl font-extrabold uppercase">What we offer</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Virtual Try-On */}
              <div className="card-soft p-8 flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center mb-6">
                  <svg className="w-5 h-5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Feature 01</span>
                <h3 className="text-2xl font-bold text-foreground mb-3">Virtual Try-On</h3>
                <p className="text-muted-foreground leading-7 flex-1 text-sm">
                  Upload your photo and any garment. Our AI places the clothing on you with
                  realistic fit and lighting — no changing room needed.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground mb-8">
                  {["Upload body photo + garment image", "AI generates realistic try-on in ~30s", "Download and save your favourite looks"].map((s) => (
                    <li key={s} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
                <Link href={session ? "/try-on" : "/register"} className="btn-dark self-start">
                  Try it now →
                </Link>
              </div>

              {/* Color Analysis */}
              <div className="card-soft p-8 flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-brand/15 flex items-center justify-center mb-6">
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Feature 02</span>
                <h3 className="text-2xl font-bold text-foreground mb-3">Color Analysis</h3>
                <p className="text-muted-foreground leading-7 flex-1 text-sm">
                  Discover your personal colour season using 12-season colour theory. Get a
                  curated palette and Myntra shopping recommendations tailored to you.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground mb-8">
                  {["Upload a clear face photo", "AI detects your colour season", "Shop your palette directly on Myntra"].map((s) => (
                    <li key={s} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
                <Link href={session ? "/color-analysis" : "/register"} className="btn-brand self-start">
                  Analyse now →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-16 border-y border-border bg-surface/40">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Colour seasons", value: "12" },
                { label: "Processing time", value: "< 30s" },
                { label: "Image formats", value: "3" },
                { label: "Cost", value: "Free" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-4xl font-extrabold text-foreground">{stat.value}</p>
                  <p className="mt-2 text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Simple process</p>
              <h2 className="font-display text-4xl font-extrabold uppercase">How it works</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { step: "01", title: "Create an account", body: "Sign up for free in seconds — no credit card required." },
                { step: "02", title: "Upload your photos", body: "Add a body photo for Try-On, or a face photo for Color Analysis." },
                { step: "03", title: "Get your results", body: "Download your try-on or shop your personalised colour palette on Myntra." },
              ].map((item) => (
                <div key={item.step} className="card-soft p-8">
                  <p className="font-display text-5xl font-extrabold text-brand/20 mb-4 leading-none">{item.step}</p>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-6">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 border-t border-border">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="font-display text-5xl font-extrabold uppercase mb-4">Ready to start?</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
              Create a free account and start styling smarter today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn-brand px-10 py-3.5 text-base">
                Get started free →
              </Link>
              <Link href="/login" className="btn-outline px-10 py-3.5 text-base">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
