import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Plus } from 'lucide-react';
import AppShell from '../layouts/AppShell';
import Panel from '../components/primitives/Panel';
import Button from '../components/primitives/Button';
import LiveNowSection from '../components/event/LiveNowSection';
import UpcomingList from '../components/event/UpcomingList';
import ScheduleTimeline from '../components/event/ScheduleTimeline';
import PrivateAccessGate from '../components/event/PrivateAccessGate';
import CreateActivityModal from '../components/event/CreateActivityModal';
import { useApi } from '../hooks/useApi';
import { getCurrentActivities, getUpcomingActivities } from '../utils/scheduleTime';
import ChatPanel from '../components/event/ChatPanel';
import PendingProposals from '../components/event/PendingProposals';

export default function EventPage() {
  const { eventId } = useParams();
  const apiFetch = useApi();

  const [schedule, setSchedule] = useState(null);
  const [activities, setActivities] = useState([]);
  const [viewerRole, setViewerRole] = useState(null);
  const [viewerId, setViewerId] = useState(null);
  const [status, setStatus] = useState('loading');
  const [accessCode, setAccessCode] = useState(null);
  const [attemptedCode, setAttemptedCode] = useState(false);
  const [view, setView] = useState('event');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus('loading');
      try {
        const query = accessCode ? `?accessCode=${encodeURIComponent(accessCode)}` : '';
        const scheduleRes = await apiFetch(`/api/schedules/${eventId}${query}`);
        const activitiesRes = await apiFetch(`/api/schedules/${eventId}/activities${query}`);
        if (cancelled) return;
        setSchedule(scheduleRes.schedule);
        setViewerRole(scheduleRes.viewerRole);
        setViewerId(scheduleRes.viewerId);
        setActivities(activitiesRes);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setStatus(err.status === 403 ? 'denied' : 'error');
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, accessCode, refreshTick]);

  const liveNow = useMemo(() => getCurrentActivities(activities), [activities]);
  const upcoming = useMemo(() => getUpcomingActivities(activities), [activities]);
  const isMember = Boolean(viewerRole);
  const canEdit = viewerRole === 'owner' || viewerRole === 'manager'; // mirrors backend's requireRole('manager') floor exactly
  const visibleActivities = useMemo(
    () => (view === 'mine' ? activities.filter((a) => a.stakeholders?.some((s) => s.userId === viewerId)) : activities),
    [view, activities, viewerId]
  );

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center bg-ink text-mist text-sm">Loading...</div>;
  }
  if (status === 'denied') {
    return <PrivateAccessGate showError={attemptedCode} onSubmitCode={(code) => { setAttemptedCode(true); setAccessCode(code); }} />;
  }
  if (status === 'error') {
    return <div className="flex h-screen items-center justify-center bg-ink text-mist text-sm">Couldn't load this event. It may not exist, or the server may be unreachable.</div>;
  }

  return (
    <AppShell
      topBarContent={
        <>
          <div>
            <h1 className="text-sm font-semibold">{schedule.name}</h1>
            <p className="text-xs text-mist">{schedule.status} · {schedule.location}</p>
          </div>
          {isMember ? <Button variant="primary" size="sm">Report a problem</Button> : <span className="text-xs text-mist">Public view</span>}
        </>
      }
      inspector={
        <div className="space-y-4">
          <Panel>
            <h3 className="text-sm font-medium text-mist mb-3">Event details</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><MapPin size={14} className="text-mist" /> {schedule.location || 'No location set'}</p>
              <p className="flex items-center gap-2"><Calendar size={14} className="text-mist" /> {schedule.status}</p>
            </div>
          </Panel>
          {!isMember && <Panel><p className="text-sm text-mist">Sign in to see your personal schedule, get notified of changes, and message MARSHAL directly.</p></Panel>}
        </div>
      }
      onChatClick={isMember ? () => setChatOpen(true) : undefined}
    >
      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-sm font-medium text-mist">Happening now</h2>
          <LiveNowSection activities={liveNow} viewerId={viewerId} />
        </section>

        <PendingProposals scheduleId={eventId} canDecide={canEdit} onDecided={() => setRefreshTick((t) => t + 1)} />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1"><UpcomingList activities={upcoming} /></div>
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              {isMember ? (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant={view === 'event' ? 'primary' : 'secondary'} onClick={() => setView('event')}>Event schedule</Button>
                  <Button size="sm" variant={view === 'mine' ? 'primary' : 'secondary'} onClick={() => setView('mine')}>My schedule</Button>
                </div>
              ) : <div />}
              {canEdit && (
                <Button size="sm" variant="secondary" onClick={() => setShowAddActivity(true)}>
                  <Plus size={14} /> Add activity
                </Button>
              )}
            </div>
            <ScheduleTimeline activities={isMember ? visibleActivities : activities} />
          </div>
        </section>
      </div>

      {showAddActivity && (
        <CreateActivityModal
          scheduleId={eventId}
          onClose={() => setShowAddActivity(false)}
          onCreated={(newActivity) => {
            setActivities((prev) => [...prev, newActivity]);
            setShowAddActivity(false);
          }}
        />
      )}
      {chatOpen && <ChatPanel scheduleId={eventId} onClose={() => setChatOpen(false)} />}
    </AppShell>
  );
}