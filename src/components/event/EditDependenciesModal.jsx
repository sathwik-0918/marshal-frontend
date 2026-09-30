import { useState } from 'react';
import { X } from 'lucide-react';
import Panel from '../primitives/Panel';
import Button from '../primitives/Button';
import ActivityPicker from './ActivityPicker';
import { useApi } from '../../hooks/useApi';

export default function EditDependenciesModal({ scheduleId, activity, onClose, onSaved }) {
  const apiFetch = useApi();
  const [selectedIds, setSelectedIds] = useState((activity.dependencies || []).map((d) => (typeof d === 'string' ? d : d._id)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/schedules/${scheduleId}/activities/${activity._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ dependencies: selectedIds }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <Panel className="w-full max-w-sm relative">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-mist hover:text-chalk"><X size={18} /></button>
        <h2 className="text-lg font-semibold mb-1">{activity.title}</h2>
        <p className="text-xs text-mist mb-4">Must not start before these finish</p>
        <ActivityPicker scheduleId={scheduleId} excludeId={activity._id} selectedIds={selectedIds} onChange={setSelectedIds} />
        {error && <p className="mt-2 text-sm text-critical">{error}</p>}
        <Button variant="primary" className="mt-4" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </Panel>
    </div>
  );
}