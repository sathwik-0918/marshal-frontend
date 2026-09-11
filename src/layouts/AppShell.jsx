import { LayoutGrid, Calendar, Bell, MessageCircle, User } from 'lucide-react';

/**
 * AppShell — the one layout every operational screen renders inside.
 * Desktop: nav rail + top bar + content (+ optional inspector panel).
 * Mobile: top bar + content + bottom nav + floating MARSHAL action —
 * a real redesign for small screens, not the desktop layout shrunk down.
 */
export default function AppShell({ topBarContent, children, inspector }) {
  const navItems = [
    { icon: LayoutGrid, label: 'Overview' },
    { icon: Calendar, label: 'Schedule' },
    { icon: Bell, label: 'Alerts' },
    { icon: User, label: 'Account' },
  ];

  return (
    <div className="flex h-screen bg-ink text-chalk">
      <nav className="hidden md:flex w-16 flex-col items-center gap-1 border-r border-border py-4">
        <div className="mb-4 h-8 w-8 rounded-sm bg-amber" />
        {navItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-mist transition-colors hover:bg-panel hover:text-chalk"
          >
            <Icon size={20} />
          </button>
        ))}
      </nav>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          {topBarContent}
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5">
            {children}
          </main>

          {inspector && (
            <aside className="hidden lg:block w-80 border-l border-border overflow-y-auto p-5">
              {inspector}
            </aside>
          )}
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-border bg-panel py-2">
        {navItems.map(({ icon: Icon, label }) => (
          <button key={label} aria-label={label} className="flex flex-col items-center gap-1 px-3 py-1 text-mist">
            <Icon size={20} />
            <span className="text-[11px]">{label}</span>
          </button>
        ))}
      </nav>

      <button
        aria-label="Open MARSHAL chat"
        className="fixed bottom-20 right-5 md:bottom-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber text-ink shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
}