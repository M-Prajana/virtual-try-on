import Link from "next/link";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="glass p-10 rounded-[3rem] max-w-7xl mx-auto px-4 py-10 premium-shadow">
        <header className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 shadow-2xl shadow-indigo-500/20">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Virtual Try-On</p>
              <h1 className="text-6xl font-black tracking-tight gradient-text">Fashion try-on that feels effortless.</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ThemeToggle />
            <div className="hidden sm:inline-flex items-center gap-3 rounded-full bg-white/90 dark:bg-slate-900/90 px-4 py-2 shadow-lg border border-slate-200 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-300">Experience AI styling</span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr] mb-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l1.176 3.618h3.806l-3.076 2.236 1.176 3.618L12 9.236 8.918 11.472l1.176-3.618L6.999 5.618h3.806L12 2z" /></svg>
                Newly redesigned for smarter styling
              </span>
            </div>

            <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white mb-6">Try on clothes virtually, faster and more beautifully than ever.</h2>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 mb-8">
              Upload your photo and garment image, then let our AI generate a realistic outfit preview. Perfect for fashion shoppers, influencers, and anyone who wants a better fit before buying.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <p className="text-2xl font-semibold">Fast</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Lightning quick AI generation.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <p className="text-2xl font-semibold">Accurate</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Realistic fit and lighting every time.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <p className="text-2xl font-semibold">Private</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Images deleted after processing.</p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="glass p-7 rounded-[2rem] premium-shadow border border-white/10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Monthly Plan</p>
                  <p className="mt-3 text-4xl font-black text-white">$29</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                  Popular
                </span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 leading-relaxed mb-6">Unlimited try-ons, HD download, priority rendering, and private image handling.</p>
              <Link href={session ? "/try-on" : "/register"} className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-indigo-500/20 transition hover:scale-105">
                {session ? "Start Creating" : "Create Account"}
              </Link>
            </div>

            <div className="glass p-6 rounded-[2rem] premium-shadow border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Quick actions</h3>
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Featured</p>
                  <p className="mt-2 font-semibold text-slate-950 dark:text-white">Try on the latest collections</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Secure</p>
                  <p className="mt-2 font-semibold text-slate-950 dark:text-white">Private image processing</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { title: "Realistic Results", description: "AI adapts shape, texture, and shadow precisely.", icon: "🪄" },
            { title: "Instant Preview", description: "See your outfit in seconds without changing clothes.", icon: "⚡" },
            { title: "HD Quality", description: "Export sharp images ideal for social sharing.", icon: "📸" },
            { title: "Always Private", description: "Images are removed after each session.", icon: "🔒" },
          ].map((item) => (
              <div key={item.title} className="glass p-6 rounded-[2rem] premium-shadow border border-white/10 hover:scale-[1.02] transition">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-700 text-xl">
                  {item.icon}
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="glass p-6 rounded-[2rem] premium-shadow border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Activity summary</h2>
              <p className="text-sm text-slate-300">A clean overview of what you can do next.</p>
            </div>
            <Link href={session ? "/dashboard" : "/login"} className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-100 hover:bg-white/20 transition">
              {session ? "Open dashboard" : "Sign in"}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Try-On Results</p>
              <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Instant</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Favorites</p>
              <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Saved</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Privacy</p>
              <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Protected</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Support</p>
              <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">24/7</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
