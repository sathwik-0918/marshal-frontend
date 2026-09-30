import { useState, useEffect, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';

export default function MemberPicker({ scheduleId, selectedIds, onChange }) {
  const apiFetch = useApi();
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    apiFetch(`/api/schedules/${scheduleId}/members`).then((data) => setMembers(data.members)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  const filtered = useMemo(
    () => members.filter((m) => m.userId?.name?.toLowerCase().includes(filter.toLowerCase())),
    [members, filter]
  );

  function toggle(userId) {
    onChange(selectedIds.includes(userId) ? selectedIds.filter((id) => id !== userId) : [...selectedIds, userId]);
  }

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search schedule members..."
        className="w-full rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm mb-2"
      />
      <div className="max-h-40 overflow-y-auto space-y-1">
        {filtered.length === 0 && <p className="text-xs text-mist px-1">No members match — add them via People first.</p>}
        {filtered.map((m) => (
          <label key={m.userId._id} className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-panel-raised cursor-pointer">
            <input type="checkbox" checked={selectedIds.includes(m.userId._id)} onChange={() => toggle(m.userId._id)} />
            {m.userId.name} <span className="text-xs text-mist">({m.role})</span>
          </label>
        ))}
      </div>
    </div>
  );
}