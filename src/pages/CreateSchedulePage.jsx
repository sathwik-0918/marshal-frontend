import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import Panel from '../components/primitives/Panel';
import Button from '../components/primitives/Button';
import { useApi } from '../hooks/useApi';

const CATEGORIES = ['tournament', 'fest', 'campaign', 'project', 'meeting', 'personal', 'other'];
const VISIBILITIES = ['public', 'private', 'unlisted'];
const inputClass = 'w-full rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm text-chalk';
const labelClass = 'block text-xs text-mist mb-1.5';

export default function CreateSchedulePage() {
  const navigate = useNavigate();
  const apiFetch = useApi();

  const [form, setForm] = useState({
    name: '', description: '', category: 'other', visibility: 'private', startDate: '', endDate: '', location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date must be after the start date.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiFetch('/api/schedules', { method: 'POST', body: JSON.stringify(form) });
      navigate(`/events/${created._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <AppShell topBarContent={<h1 className="text-sm font-semibold">New schedule</h1>}>
      <Panel className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input required className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Visibility</label>
              <select className={inputClass} value={form.visibility} onChange={(e) => update('visibility', e.target.value)}>
                {VISIBILITIES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start date</label>
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input className={inputClass} value={form.location} onChange={(e) => update('location', e.target.value)} />
          </div>
          {error && <p className="text-sm text-critical">{error}</p>}
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create schedule'}
          </Button>
        </form>
      </Panel>
    </AppShell>
  );
}