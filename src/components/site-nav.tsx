"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Studio", to: "/try-on" },
  { label: "Colors", to: "/color-analysis" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "History", to: "/history" },
];

export function SiteNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-xl font-extrabold tracking-tighter shrink-0">
            GLAM<span className="text-brand">.AI</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthed ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn-outline text-sm py-2 px-5"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full">
                Login
              </Link>
              <Link href="/register" className="btn-brand py-2 px-5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
