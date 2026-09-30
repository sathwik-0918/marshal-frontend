import { useState } from 'react';
import { X } from 'lucide-react';
import Panel from '../primitives/Panel';
import Button from '../primitives/Button';
import { useApi } from '../../hooks/useApi';
import MemberPicker from './MemberPicker';
import ActivityPicker from './ActivityPicker';

const ACTIVITY_TYPES = ['session', 'match', 'workshop', 'ceremony', 'meeting'];
const PRIORITIES = ['low', 'medium', 'high'];
const inputClass = 'w-full rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm text-chalk';
const labelClass = 'block text-xs text-mist mb-1.5';

export default function CreateActivityModal({ scheduleId, onClose, onCreated }) {
  const apiFetch = useApi();
  const [form, setForm] = useState({
    title: '', activityType: 'session', scheduledStart: '', durationMinutes: 30, venue: '', requiredResources: '', description: '', priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [stakeholderIds, setStakeholderIds] = useState([]);
  const [dependencyIds, setDependencyIds] = useState([]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await apiFetch(`/api/schedules/${scheduleId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          durationMinutes: Number(form.durationMinutes),
          scheduledStart: new Date(form.scheduledStart).toISOString(),
          stakeholders: stakeholderIds.map((id) => ({ userId: id, stakeholderRole: 'participant' })),
          dependencies: dependencyIds,
          requiredResources: form.requiredResources.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <Panel className="w-full max-w-md relative">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-mist hover:text-chalk">
          <X size={18} />
        </button>
        <h2 className="text-lg font-semibold mb-4">Add activity</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Title *</label>
            <input required className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={form.activityType} onChange={(e) => update('activityType', e.target.value)}>
                {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select className={inputClass} value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Starts *</label>
              <input required type="datetime-local" className={inputClass} value={form.scheduledStart} onChange={(e) => update('scheduledStart', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Duration (min) *</label>
              <input required type="number" min="1" className={inputClass} value={form.durationMinutes} onChange={(e) => update('durationMinutes', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Venue *</label>
            <input required className={inputClass} value={form.venue} onChange={(e) => update('venue', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Required resources (optional)</label>
            <input className={inputClass} placeholder="e.g. Professor Ravi, Projector A" value={form.requiredResources} onChange={(e) => update('requiredResources', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Participants</label>
            <MemberPicker scheduleId={scheduleId} selectedIds={stakeholderIds} onChange={setStakeholderIds} />
          </div>
          <div>
            <label className={labelClass}>Depends on (optional)</label>
            <ActivityPicker scheduleId={scheduleId} selectedIds={dependencyIds} onChange={setDependencyIds} />
          </div>
          {error && <p className="text-sm text-critical">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Adding…' : 'Add activity'}</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}