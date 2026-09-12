import { useState, useMemo } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import AppShell from '../layouts/AppShell';
import Panel from '../components/primitives/Panel';
import Button from '../components/primitives/Button';
import LiveNowSection from '../components/event/LiveNowSection';
import UpcomingList from '../components/event/UpcomingList';
import ScheduleTimeline from '../components/event/ScheduleTimeline';
import { generateMockEvent } from '../data/mockEventData';
import { getCurrentActivities, getUpcomingActivities } from '../utils/scheduleTime';

export default function EventPage() {
  // Mock data for now — Phase 3's real Express routes don't exist yet.
  // Swapping this for a real fetch later means this component's shape
  // doesn't change, only where `event` comes from.
  const [event] = useState(() => generateMockEvent());
  const [view, setView] = useState('event'); // 'event' | 'mine'

  const liveNow = useMemo(() => getCurrentActivities(event.activities), [event]);
  const upcoming = useMemo(() => getUpcomingActivities(event.activities), [event]);
  const visibleActivities = useMemo(
    () => (view === 'mine' ? event.activities.filter((a) => a.isMine) : event.activities),
    [view, event]
  );

  return (
    <AppShell
      topBarContent={
        <>
          <div>
            <h1 className="text-sm font-semibold">{event.name}</h1>
            <p className="text-xs text-mist">{event.dayLabel} · Live</p>
          </div>
          <Button variant="primary" size="sm">Report a problem</Button>
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
            <div className="mb-3 flex items-center gap-2">
              <Button size="sm" variant={view === 'event' ? 'primary' : 'secondary'} onClick={() => setView('event')}>
                Event schedule
              </Button>
              <Button size="sm" variant={view === 'mine' ? 'primary' : 'secondary'} onClick={() => setView('mine')}>
                My schedule
              </Button>
            </div>
            <ScheduleTimeline activities={visibleActivities} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}