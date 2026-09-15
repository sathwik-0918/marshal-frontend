import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { MapPin, Calendar } from 'lucide-react';
import AppShell from '../layouts/AppShell';
import Panel from '../components/primitives/Panel';
import Button from '../components/primitives/Button';
import LiveNowSection from '../components/event/LiveNowSection';
import UpcomingList from '../components/event/UpcomingList';
import ScheduleTimeline from '../components/event/ScheduleTimeline';
import PrivateAccessGate from '../components/event/PrivateAccessGate';
import { generateMockEvent } from '../data/mockEventData';
import { getCurrentActivities, getUpcomingActivities } from '../utils/scheduleTime';
import { resolveEventAccess } from '../utils/eventAccess';

export default function EventPage() {
  const { eventId } = useParams();
  const { isLoaded, isSignedIn } = useAuth(); // optional here — never redirects

  const [event] = useState(() => generateMockEvent(eventId));
  const [enteredCode, setEnteredCode] = useState(null);
  const [view, setView] = useState('event');

  const access = useMemo(
    () =>
      resolveEventAccess({
        schedule: event,
        isSignedIn,
        isMember: event.viewerIsMember,
        enteredCode,
      }),
    [event, isSignedIn, enteredCode]
  );

  const liveNow = useMemo(() => getCurrentActivities(event.activities), [event]);
  const upcoming = useMemo(() => getUpcomingActivities(event.activities), [event]);
  const visibleActivities = useMemo(
    () => (view === 'mine' ? event.activities.filter((a) => a.isMine) : event.activities),
    [view, event]
  );

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center bg-ink text-mist text-sm">Loading...</div>;
  }

  if (!access.granted) {
    return <PrivateAccessGate onSubmitCode={setEnteredCode} />;
  }

  const isMember = access.level === 'member';

  return (
    <AppShell
      topBarContent={
        <>
          <div>
            <h1 className="text-sm font-semibold">{event.name}</h1>
            <p className="text-xs text-mist">{event.dayLabel} · Live</p>
          </div>
          {isMember ? (
            <Button variant="primary" size="sm">Report a problem</Button>
          ) : (
            <span className="text-xs text-mist">Public view</span>
          )}
        </>
      }
      inspector={
        <div className="space-y-4">
          <Panel>
            <h3 className="text-sm font-medium text-mist mb-3">Event details</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><MapPin size={14} className="text-mist" /> {event.location}</p>
              <p className="flex items-center gap-2"><Calendar size={14} className="text-mist" /> {event.dayLabel}</p>
            </div>
          </Panel>
          {!isMember && (
            <Panel>
              <p className="text-sm text-mist">
                Sign in to see your personal schedule, get notified of changes, and message MARSHAL directly.
              </p>
            </Panel>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-sm font-medium text-mist">Happening now</h2>
          <LiveNowSection activities={liveNow} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <UpcomingList activities={upcoming} />
          </div>
          <div className="md:col-span-2">
            {isMember && (
              <div className="mb-3 flex items-center gap-2">
                <Button size="sm" variant={view === 'event' ? 'primary' : 'secondary'} onClick={() => setView('event')}>Event schedule</Button>
                <Button size="sm" variant={view === 'mine' ? 'primary' : 'secondary'} onClick={() => setView('mine')}>My schedule</Button>
              </div>
            )}
            <ScheduleTimeline activities={isMember ? visibleActivities : event.activities} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}