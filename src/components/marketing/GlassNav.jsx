import { Link } from 'react-router-dom';

export default function GlassNav() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex w-[min(92%,860px)] items-center justify-between rounded-lg border border-white/10 bg-panel/60 backdrop-blur-xl px-5 py-3 shadow-xl">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-sm bg-amber" />
        <span className="text-sm font-semibold tracking-tight">MARSHAL</span>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-sm text-mist">
        <a href="#discover" className="hover:text-chalk transition-colors">Find an event</a>
        <a href="#how" className="hover:text-chalk transition-colors">How it works</a>
      </div>

      <Link
        to="/sign-in"
        className="rounded-sm bg-chalk px-4 py-1.5 text-sm font-medium text-ink hover:brightness-90 transition"
      >
        Sign in
      </Link>
    </nav>
  );
}