import { Link } from 'react-router-dom';
import { LayoutGrid, Calendar, MessageCircle, User } from 'lucide-react';
import NotificationBell from '../components/layout/NotificationBell';

export default function AppShell({ topBarContent, children, inspector, onChatClick }) {
  const navItems = [
    { icon: LayoutGrid, label: 'Overview' },
    { icon: Calendar, label: 'Schedule' },
  ];
  const trailingNavItems = [
    { icon: User, label: 'Account' },
  ];

  return (
    <div className="flex h-screen bg-ink text-chalk">
      <nav className="hidden md:flex w-16 flex-col items-center gap-1 border-r border-border py-4">
        <Link to="/app" className="mb-4 h-8 w-8 rounded-sm bg-amber block" aria-label="Home" />
        {navItems.map(({ icon: Icon, label }) => (
          <button key={label} aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-sm text-mist transition-colors hover:bg-panel hover:text-chalk">
            <Icon size={20} />
          </button>
        ))}
        <NotificationBell />
        {trailingNavItems.map(({ icon: Icon, label }) => (
          <button key={label} aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-sm text-mist transition-colors hover:bg-panel hover:text-chalk">
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
            {/* Same inspector content, rendered inline below md and lg, so the
                768-1024px gap doesn't lose it entirely - just deduped by
                viewport via Tailwind's responsive visibility, not two
                separate copies of the underlying data. */}
            {inspector && <div className="lg:hidden mb-5">{inspector}</div>}
            {children}
          </main>
          {inspector && (
            <aside className="hidden lg:block w-80 border-l border-border overflow-y-auto p-5">
              {inspector}
            </aside>
          )}
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-border bg-panel pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <Link to="/app" aria-label="Home" className="flex flex-col items-center gap-1 px-3 py-1 text-mist">
          <div className="h-5 w-5 rounded-sm bg-amber" />
          <span className="text-[11px]">Home</span>
        </Link>
        {navItems.map(({ icon: Icon, label }) => (
          <button key={label} aria-label={label} className="flex flex-col items-center gap-1 px-3 py-1 text-mist">
            <Icon size={20} />
            <span className="text-[11px]">{label}</span>
          </button>
        ))}
        <NotificationBell />
        {trailingNavItems.map(({ icon: Icon, label }) => (
          <button key={label} aria-label={label} className="flex flex-col items-center gap-1 px-3 py-1 text-mist">
            <Icon size={20} />
            <span className="text-[11px]">{label}</span>
          </button>
        ))}
      </nav>

      {onChatClick && (
        <button
          aria-label="Open MARSHAL chat"
          onClick={onChatClick}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 md:bottom-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber text-ink shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle size={22} />
        </button>
      )}
    </div>
  );
}