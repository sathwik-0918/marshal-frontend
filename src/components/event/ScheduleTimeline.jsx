import StatusBadge from '../primitives/StatusBadge';
import { formatTime, getCurrentActivities } from '../../utils/scheduleTime';

export default function ScheduleTimeline({ activities }) {
  const sorted = [...activities].sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart));
  const currentIds = new Set(getCurrentActivities(activities).map((a) => a.id));

  return (
    <div className="rounded-md border border-border bg-panel divide-y divide-border">
      {sorted.map((activity) => {
        const isLive = currentIds.has(activity.id);
        const isPast = activity.status === 'completed' || activity.status === 'cancelled';

        return (
          <div
            key={activity.id}
            className={`flex items-center justify-between px-4 py-3 ${isPast ? 'opacity-50' : ''} ${isLive ? 'bg-panel-raised' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-mist font-mono">{formatTime(activity.scheduledStart)}</span>
              <div>
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-mist">{activity.venue}</p>
              </div>
            </div>
            <StatusBadge status={isLive ? 'in_progress' : activity.status} />
          </div>
        );
      })}
    </div>
  );
}