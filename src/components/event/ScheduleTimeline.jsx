import { Users, GitBranch } from 'lucide-react';
import StatusBadge from '../primitives/StatusBadge';
import { formatTime, getCurrentActivities } from '../../utils/scheduleTime';

export default function ScheduleTimeline({ activities, canEdit, onManageStakeholders, onManageDependencies }) {
  const sorted = [...activities].sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart));
  const currentIds = new Set(getCurrentActivities(activities).map((a) => a._id));

  return (
    <div className="rounded-md border border-border bg-panel divide-y divide-border">
      {sorted.map((activity) => {
        const isLive = currentIds.has(activity._id);
        const isPast = activity.status === 'completed' || activity.status === 'cancelled';

        return (
          <div
            key={activity._id}
            className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 ${isPast ? 'opacity-50' : ''} ${isLive ? 'bg-panel-raised' : ''}`}
          >
            <span className="w-14 shrink-0 text-sm text-mist font-mono">{formatTime(activity.scheduledStart)}</span>
            {/* min-w-0 is what lets truncate actually work inside a flex
                child - without it the box refuses to shrink below its
                content's natural width and the title just overflows. */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{activity.title}</p>
              <p className="truncate text-xs text-mist">{activity.venue}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {canEdit && (
                <>
                  <button onClick={() => onManageStakeholders(activity)} aria-label="Manage participants" className="text-mist hover:text-chalk">
                    <Users size={16} />
                  </button>
                  <button onClick={() => onManageDependencies(activity)} aria-label="Manage dependencies" className="text-mist hover:text-chalk">
                    <GitBranch size={16} />
                  </button>
                </>
              )}
              <StatusBadge status={isLive ? 'in_progress' : activity.status} />
            </div>
          </div>
        );
      })}
    </div>
  );
}