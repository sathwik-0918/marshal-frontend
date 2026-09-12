import Panel from '../primitives/Panel';
import { formatTime } from '../../utils/scheduleTime';

export default function UpcomingList({ activities }) {
  return (
    <Panel>
      <h3 className="text-sm font-medium text-mist mb-3">Next up</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-mist">Nothing scheduled after this.</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-xs text-mist">{activity.venue}</p>
              </div>
              <span className="text-xs text-mist">{formatTime(activity.scheduledStart)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}