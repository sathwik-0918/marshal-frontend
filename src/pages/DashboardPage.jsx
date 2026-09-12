import { useUser, SignOutButton } from '@clerk/clerk-react';
import AppShell from '../layouts/AppShell';
import Panel from '../components/primitives/Panel';
import Button from '../components/primitives/Button';
import StatusBadge from '../components/primitives/StatusBadge';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <AppShell
      topBarContent={
        <>
          <div>
            <h1 className="text-sm font-semibold">
              Good to see you, {user?.firstName ?? 'there'}
            </h1>
            <p className="text-xs text-mist">VBIT Cultural Fest 2026 · Day 6 of 10</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm">Report a problem</Button>
            <SignOutButton>
              <button className="text-xs text-mist hover:text-chalk transition-colors">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/app/events/vbit-fest-2026" className="md:col-span-2">
          <Panel emphasis className="hover:border-amber/70 transition-colors cursor-pointer">
            <StatusBadge status="in_progress" />
            <h2 className="mt-3 text-lg font-semibold">VBIT Cultural Fest 2026</h2>
            <p className="text-sm text-mist mt-1">Day 6 of 10 · Open the live event page →</p>
          </Panel>
        </Link>
        <Panel>
          <h3 className="text-sm font-medium text-mist mb-2">Next up</h3>
          <p className="text-sm">Poster Review — 6:00 PM</p>
        </Panel>
      </div>
    </AppShell>
  );
}