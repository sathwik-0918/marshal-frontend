import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Bell, X } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

// Renders nothing for a signed-out viewer — this button sits in AppShell,
// which also renders for anonymous public-schedule viewers, so the
// auth check has to live here rather than assuming AppShell's caller
// always has a session.
export default function NotificationBell() {
  const { isLoaded, isSignedIn } = useAuth();
  const apiFetch = useApi();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    apiFetch('/api/notifications').then(setNotifications).catch(() => {});
  }, [isSignedIn]);

  if (!isLoaded || !isSignedIn) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    setOpen(true);
    if (unreadCount > 0) {
      await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <>
      <button
        aria-label="Notifications"
        onClick={handleOpen}
        className="relative flex h-11 w-11 items-center justify-center rounded-sm text-mist transition-colors hover:bg-panel hover:text-chalk"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber" />}
      </button>

      {open && (
        // Centered overlay rather than an anchored dropdown — this
        // button renders in both the desktop side rail and the mobile
        // bottom bar, two very different positions, and a fixed
        // anchor point would need separate handling for each.
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 px-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-md border border-border bg-panel shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Notifications</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-mist hover:text-chalk">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-mist">Nothing yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="border-b border-border px-4 py-3 text-sm last:border-0">{n.message}</div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}