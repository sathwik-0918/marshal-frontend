import { X } from 'lucide-react';
import Panel from '../primitives/Panel';
import Button from '../primitives/Button';
import MemberPicker from './MemberPicker';
import { useApi } from '../../hooks/useApi';
import { useState } from 'react';

export default function EditStakeholdersModal({ scheduleId, activity, onClose, onSaved }) {
  const apiFetch = useApi();
  const currentIds = activity.stakeholders.map((s) => s.userId);
  const [selectedIds, setSelectedIds] = useState(currentIds);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const toAdd = selectedIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !selectedIds.includes(id));
    try {
      for (const id of toAdd) {
        await apiFetch(`/api/schedules/${scheduleId}/activities/${activity._id}/stakeholders`, { method: 'PATCH', body: JSON.stringify({ addUserId: id }) });
      }
      for (const id of toRemove) {
        await apiFetch(`/api/schedules/${scheduleId}/activities/${activity._id}/stakeholders`, { method: 'PATCH', body: JSON.stringify({ removeUserId: id }) });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <Panel className="w-full max-w-sm relative">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-mist hover:text-chalk"><X size={18} /></button>
        <h2 className="text-lg font-semibold mb-1">{activity.title}</h2>
        <p className="text-xs text-mist mb-4">Manage participants</p>
        <MemberPicker scheduleId={scheduleId} selectedIds={selectedIds} onChange={setSelectedIds} />
        <Button variant="primary" className="mt-4" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </Panel>
    </div>
  );
}