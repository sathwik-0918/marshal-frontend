import Panel from '../primitives/Panel';
import StatusBadge from '../primitives/StatusBadge';
import { formatTime } from '../../utils/scheduleTime';

/**
 * Renders ONE card per currently-live activity — deliberately not
 * a single "current activity" block. Two things live in two venues
 * at once shows two cards side by side, because that's the actual
 * state of the event, not an edge case to hide.
 */
export default function LiveNowSection({ activities }) {
  if (activities.length === 0) {
    return (
      <Panel>
        <p className="text-sm text-mist">Nothing live right now — check what's next below.</p>
      </Panel>
    );
  }

  return (
    <div className={`grid gap-4 ${activities.length > 1 ? 'md:grid-cols-2' : ''}`}>
      {activities.map((activity) => (
        <Panel key={activity.id} emphasis>
          <div className="flex items-center justify-between">
            <StatusBadge status={activity.status === 'scheduled' ? 'in_progress' : activity.status} />
            {activity.isMine && <span className="text-[11px] text-mist">On your schedule</span>}
          </div>
          <h3 className="mt-3 text-lg font-semibold">{activity.title}</h3>
          <p className="mt-1 text-sm text-mist">
            {activity.venue} · started {formatTime(activity.scheduledStart)}
          </p>
        </Panel>
      ))}
    </div>
  );
}