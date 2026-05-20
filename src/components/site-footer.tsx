import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-12 mt-20 bg-background">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <span className="font-display text-xl font-extrabold tracking-tighter">
          GLAM<span className="text-brand">.AI</span>
        </span>
        <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Link href="#" className="hover:text-brand transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-brand transition-colors">Terms</Link>
          <Link href="#" className="hover:text-brand transition-colors">API</Link>
          <Link href="#" className="hover:text-brand transition-colors">Contact</Link>
        </div>
        <p className="text-[11px] text-muted-foreground">© 2026 GLAM.AI Studio</p>
      </div>
    </footer>
  );
}
