import { useState, useEffect, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';

export default function ActivityPicker({ scheduleId, excludeId, selectedIds, onChange }) {
  const apiFetch = useApi();
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    apiFetch(`/api/schedules/${scheduleId}/activities`).then(setActivities).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  const filtered = useMemo(
    () => activities.filter((a) => a._id !== excludeId && a.title.toLowerCase().includes(filter.toLowerCase())),
    [activities, filter, excludeId]
  );

  function toggle(activityId) {
    onChange(selectedIds.includes(activityId) ? selectedIds.filter((id) => id !== activityId) : [...selectedIds, activityId]);
  }

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search activities..."
        className="w-full rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm mb-2"
      />
      <div className="max-h-40 overflow-y-auto space-y-1">
        {filtered.length === 0 && <p className="text-xs text-mist px-1">No other activities on this schedule yet.</p>}
        {filtered.map((a) => (
          <label key={a._id} className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-panel-raised cursor-pointer">
            <input type="checkbox" checked={selectedIds.includes(a._id)} onChange={() => toggle(a._id)} />
            {a.title} <span className="text-xs text-mist">({a.venue})</span>
          </label>
        ))}
      </div>
    </div>
  );
}