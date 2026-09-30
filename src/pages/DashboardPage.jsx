import { useState, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import Panel from '../components/primitives/Panel';
import StatusBadge from '../components/primitives/StatusBadge';
import { useApi } from '../hooks/useApi';

// Schedule.status ('draft'/'live'/'completed'/'archived') uses a
// different vocabulary than Activity.status, which is what
// StatusBadge was actually built for — translate rather than pass
// 'live' straight through and get the wrong badge silently.
const SCHEDULE_STATUS_BADGE = { live: 'in_progress', draft: 'scheduled', completed: 'completed', archived: 'cancelled' };

export default function DashboardPage() {
  const { user } = useUser();
  const apiFetch = useApi();
  const [schedules, setSchedules] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/users/resolve-invites', { method: 'POST' }).catch(() => {});
    apiFetch('/api/schedules/mine')
      .then((data) => {
        if (cancelled) return;
        setSchedules(data);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell
      topBarContent={
        <>
          <div>
            <h1 className="text-sm font-semibold">Good to see you, {user?.firstName ?? 'there'}</h1>
            <p className="text-xs text-mist">Your schedules</p>
          </div>
          <Link to="/schedules/new" className="text-xs text-mist hover:text-chalk transition-colors">+ New schedule</Link>
          <SignOutButton>
            <button className="text-xs text-mist hover:text-chalk transition-colors">Sign out</button>
          </SignOutButton>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {status === 'loading' && <Panel><p className="text-sm text-mist">Loading your schedules...</p></Panel>}
        {status === 'error' && <Panel><p className="text-sm text-critical">Couldn't load your schedules. Is the backend running?</p></Panel>}
        {status === 'ready' && schedules.length === 0 && (
          <Panel><p className="text-sm text-mist">You're not part of any schedules yet.</p></Panel>
        )}
        {status === 'ready' && schedules.map((s) => (
          <Link key={s._id} to={`/events/${s._id}`}>
            <Panel emphasis className="hover:border-amber/70 transition-colors cursor-pointer">
              <StatusBadge status={SCHEDULE_STATUS_BADGE[s.status] ?? 'scheduled'} />
              <h2 className="mt-3 text-lg font-semibold">{s.name}</h2>
              <p className="text-sm text-mist mt-1">{s.location || 'No location set'}</p>
            </Panel>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}