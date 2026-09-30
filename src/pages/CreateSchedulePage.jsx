import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import Panel from '../components/primitives/Panel';
import Button from '../components/primitives/Button';
import CsvPreviewRow, { validateRowClientSide } from '../components/event/CsvPreviewRow';
import { useApi } from '../hooks/useApi';

const CATEGORIES = ['tournament', 'fest', 'campaign', 'project', 'meeting', 'personal', 'other'];
const VISIBILITIES = ['public', 'private', 'unlisted'];
const inputClass = 'w-full rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm text-chalk';
const labelClass = 'block text-xs text-mist mb-1.5';

export default function CreateSchedulePage() {
  const navigate = useNavigate();
  const apiFetch = useApi();
  const [mode, setMode] = useState('manual'); // 'manual' | 'file'

  const [form, setForm] = useState({
    name: '', description: '', category: 'other', visibility: 'private', startDate: '', endDate: '', location: '',
  });
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [fileStep, setFileStep] = useState('select'); // 'select' | 'preview'
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function handleManualSubmit(e) {
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

  async function handlePreview() {
    if (!file) return;
    setPreviewLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/schedules/from-file/preview`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Preview failed');
      setRows(data.rows);
      setForm((f) => ({
        ...f,
        startDate: f.startDate || data.suggested.startDate || '',
        endDate: f.endDate || data.suggested.endDate || '',
      }));
      setFileStep('preview');
    } catch (err) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  }

  const validCount = rows.filter((r) => validateRowClientSide(r).length === 0).length;

  async function handleFileConfirm() {
    setError(null);
    if (!form.name.trim()) {
      setError('Give this schedule a name before creating it.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await apiFetch('/api/schedules/from-file/confirm', {
        method: 'POST',
        body: JSON.stringify({ ...form, rows }),
      });
      navigate(`/events/${created.schedule._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <AppShell topBarContent={<h1 className="text-sm font-semibold">New schedule</h1>}>
      <div className="max-w-2xl">
        <div className="mb-4 flex gap-2">
          <Button size="sm" variant={mode === 'manual' ? 'primary' : 'secondary'} onClick={() => setMode('manual')}>Create manually</Button>
          <Button size="sm" variant={mode === 'file' ? 'primary' : 'secondary'} onClick={() => setMode('file')}>Create from file</Button>
        </div>

        {mode === 'manual' && (
          <Panel>
            <form onSubmit={handleManualSubmit} className="space-y-4">
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
        )}

        {mode === 'file' && fileStep === 'select' && (
          <Panel>
            <p className="text-xs text-mist mb-3">
              CSV columns: title, activityType, scheduledStart, durationMinutes, venue, description, participantEmails (semicolon-separated), requiredResources (semicolon-separated)
            </p>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="text-sm mb-3" />
            {error && <p className="text-sm text-critical mb-3">{error}</p>}
            <Button variant="primary" onClick={handlePreview} disabled={!file || previewLoading}>
              {previewLoading ? 'Reading file...' : 'Preview'}
            </Button>
          </Panel>
        )}

        {mode === 'file' && fileStep === 'preview' && (
          <Panel>
            <h2 className="text-sm font-medium mb-3">Schedule details</h2>
            <div className="space-y-3 mb-5">
              <div>
                <label className={labelClass}>Name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. VBIT Cultural Fest 2026" />
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
              <p className="text-[11px] text-mist">Dates were pre-filled from the earliest and latest activity in your file — adjust if needed.</p>
            </div>

            <h2 className="text-sm font-medium mb-1">Activities ({validCount} of {rows.length} ready)</h2>
            <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
              {rows.map((row, i) => (
                <CsvPreviewRow
                  key={i}
                  row={row}
                  onChange={(updated) => setRows((prev) => prev.map((r, idx) => (idx === i ? updated : r)))}
                  onRemove={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>

            {error && <p className="text-sm text-critical mb-3">{error}</p>}
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleFileConfirm} disabled={submitting || validCount === 0}>
                {submitting ? 'Creating…' : `Create schedule with ${validCount} activit${validCount === 1 ? 'y' : 'ies'}`}
              </Button>
              <Button variant="secondary" onClick={() => setFileStep('select')} disabled={submitting}>Back</Button>
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}