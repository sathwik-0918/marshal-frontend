import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import Panel from '../components/primitives/Panel';
import Button from '../components/primitives/Button';
import CsvPreviewRow, { validateRowClientSide } from '../components/event/CsvPreviewRow';
import ReferenceEntryRow from '../components/event/ReferenceEntryRow';
import ScheduleTypeGuide from '../components/event/ScheduleTypeGuide';
import GenerateTimetablePanel from '../components/event/GenerateTimetablePanel';
import { useApi } from '../hooks/useApi';

const CATEGORIES = ['tournament', 'fest', 'campaign', 'project', 'meeting', 'personal', 'other'];
const VISIBILITIES = ['public', 'private', 'unlisted'];
const inputClass = 'w-full rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm text-chalk';
const labelClass = 'block text-xs text-mist mb-1.5';

export default function CreateSchedulePage() {
  const navigate = useNavigate();
  const apiFetch = useApi();
  const [mode, setMode] = useState('manual'); // 'manual' | 'file' | 'document' | 'generate'

  const [form, setForm] = useState({ name: '', description: '', category: 'other', visibility: 'private', startDate: '', endDate: '', location: '' });
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [fileStep, setFileStep] = useState('select');
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [referenceEntries, setReferenceEntries] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [detectedScheduleType, setDetectedScheduleType] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [orgContext, setOrgContext] = useState({});
  const [reviewCursor, setReviewCursor] = useState(0);

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
      const endpoint = mode === 'document' ? 'from-file/preview-document' : 'from-file/preview';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/schedules/${endpoint}`, {
        method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Preview failed');
      setRows(data.rows);
      setReferenceEntries(data.referenceEntries || []);
      setDetectedScheduleType(data.detectedScheduleType || '');
      setAdditionalNotes(data.additionalNotes || '');
      setOrgContext(data.orgContext || {});
      setForm((f) => ({ ...f, startDate: f.startDate || data.suggested?.startDate || '', endDate: f.endDate || data.suggested?.endDate || '' }));
      setFileStep('preview');
    } catch (err) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  }

  const validCount = rows.filter((r) => validateRowClientSide(r).length === 0).length;
  const hasAnythingToImport = validCount > 0 || referenceEntries.length > 0;

  const issues = [
    ...rows.flatMap((r, i) => [
      ...validateRowClientSide(r).map((msg) => ({ id: `row-${i}`, severity: 'error', msg })),
      ...(r.warnings || []).map((msg) => ({ id: `row-${i}`, severity: 'warning', msg })),
    ]),
    ...referenceEntries.flatMap((e, i) => [
      ...(e.errors || []).map((msg) => ({ id: `ref-${i}`, severity: 'error', msg })),
      ...(e.warnings || []).map((msg) => ({ id: `ref-${i}`, severity: 'warning', msg })),
    ]),
  ];
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  function reviewNext() {
    if (issues.length === 0) return;
    const target = issues[reviewCursor % issues.length];
    const el = document.getElementById(target.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('marshal-review-highlight');
      setTimeout(() => el.classList.remove('marshal-review-highlight'), 1600);
    }
    setReviewCursor((c) => c + 1);
  }

  async function handleFileConfirm() {
    setError(null);
    if (!form.name.trim()) { setError('Give this schedule a name before creating it.'); return; }
    setSubmitting(true);
    try {
      const created = await apiFetch('/api/schedules/from-file/confirm', {
        method: 'POST',
        body: JSON.stringify({ ...form, rows, referenceEntries, additionalNotes, detectedScheduleType, orgContext }),
      });
      navigate(`/events/${created.schedule._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  function resetFileState() {
    setFile(null); setRows([]); setReferenceEntries([]); setDetectedScheduleType(''); setAdditionalNotes(''); setOrgContext({}); setFileStep('select');
  }

  return (
    <AppShell topBarContent={<h1 className="text-sm font-semibold">New schedule</h1>}>
      <div className="max-w-2xl">
        <style>{`
          @keyframes marshalReviewPulse { 0%, 100% { box-shadow: 0 0 0 2px rgba(227,72,72,0.7); } 50% { box-shadow: 0 0 0 2px rgba(227,72,72,0.2); } }
          .marshal-review-highlight { animation: marshalReviewPulse 0.5s ease-in-out 2; }
        `}</style>

        <div className="mb-4 flex gap-2">
          <Button size="sm" variant={mode === 'manual' ? 'primary' : 'secondary'} onClick={() => { setMode('manual'); resetFileState(); }}>Create manually</Button>
          <Button size="sm" variant={mode === 'file' ? 'primary' : 'secondary'} onClick={() => { setMode('file'); resetFileState(); }}>Create from CSV</Button>
          <Button size="sm" variant={mode === 'document' ? 'primary' : 'secondary'} onClick={() => { setMode('document'); resetFileState(); }}>Import existing schedule</Button>
          <Button size="sm" variant={mode === 'generate' ? 'primary' : 'secondary'} onClick={() => { setMode('generate'); resetFileState(); }}>Create from requirements</Button>
        </div>

        {mode === 'manual' && (
          <Panel>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div><label className={labelClass}>Name *</label><input required className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
              <div><label className={labelClass}>Description</label><textarea className={inputClass} rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Category</label><select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className={labelClass}>Visibility</label><select className={inputClass} value={form.visibility} onChange={(e) => update('visibility', e.target.value)}>{VISIBILITIES.map((v) => <option key={v} value={v}>{v}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Start date</label><input type="date" className={inputClass} value={form.startDate} onChange={(e) => update('startDate', e.target.value)} /></div>
                <div><label className={labelClass}>End date</label><input type="date" className={inputClass} value={form.endDate} onChange={(e) => update('endDate', e.target.value)} /></div>
              </div>
              <div><label className={labelClass}>Location</label><input className={inputClass} value={form.location} onChange={(e) => update('location', e.target.value)} /></div>
              {error && <p className="text-sm text-critical">{error}</p>}
              <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create schedule'}</Button>
            </form>
          </Panel>
        )}

        {mode === 'generate' && (
          <Panel>
            <h2 className="text-sm font-medium mb-3">Schedule name</h2>
            <input className={inputClass + ' mb-4'} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. CSM-III-C Weekly Timetable" />
            <GenerateTimetablePanel form={form} onCreated={(id) => navigate(`/events/${id}`)} />
          </Panel>
        )}

        {(mode === 'file' || mode === 'document') && fileStep === 'select' && (
          <Panel>
            {mode === 'document' && <ScheduleTypeGuide />}
            <p className="text-xs text-mist mb-3">
              {mode === 'file'
                ? 'CSV columns: title, activityType, scheduledStart, durationMinutes, venue, description, participantEmails (semicolon-separated), requiredResources (semicolon-separated)'
                : 'Upload a MARSHAL-template CSV for an instant, reliable import, or a PDF/TXT/Markdown document to have it read and extracted. Use UNDEFINED for anything genuinely unknown.'}
            </p>
            <input type="file" accept={mode === 'file' ? '.csv' : '.pdf,.txt,.md,.csv'} onChange={(e) => setFile(e.target.files[0])} className="text-sm mb-3" />
            {error && <p className="text-sm text-critical mb-3">{error}</p>}
            <Button variant="primary" onClick={handlePreview} disabled={!file || previewLoading}>{previewLoading ? 'Reading…' : 'Preview'}</Button>
          </Panel>
        )}

        {(mode === 'file' || mode === 'document') && fileStep === 'preview' && (
          <Panel>
            {detectedScheduleType && <div className="mb-3 rounded-sm bg-panel-raised px-3 py-2 text-sm">Detected: <span className="font-medium">{detectedScheduleType}</span></div>}
            {(orgContext.orgName || orgContext.department || orgContext.academicTerm || orgContext.location) && (
              <div className="mb-4 rounded-sm bg-panel-raised px-3 py-2 text-xs text-mist">
                {[orgContext.orgName, orgContext.department, orgContext.academicTerm, orgContext.location].filter(Boolean).join(' · ')}
              </div>
            )}

            {(errorCount > 0 || warningCount > 0) && (
              <button onClick={reviewNext} className="mb-3 flex w-full items-center justify-between rounded-sm border border-warning/40 bg-warning/10 px-3 py-2 text-sm hover:bg-warning/20">
                <span>
                  {errorCount > 0 && <span className="text-critical font-medium">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
                  {errorCount > 0 && warningCount > 0 && ' · '}
                  {warningCount > 0 && <span className="text-warning">{warningCount} incomplete field{warningCount !== 1 ? 's' : ''}</span>}
                </span>
                <span className="underline text-mist">Click to review</span>
              </button>
            )}

            <h2 className="text-sm font-medium mb-3">Schedule details</h2>
            <div className="space-y-3 mb-5">
              <div><label className={labelClass}>Name *</label><input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. VBIT Cultural Fest 2026" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Category</label><select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className={labelClass}>Visibility</label><select className={inputClass} value={form.visibility} onChange={(e) => update('visibility', e.target.value)}>{VISIBILITIES.map((v) => <option key={v} value={v}>{v}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Start date</label><input type="date" className={inputClass} value={form.startDate} onChange={(e) => update('startDate', e.target.value)} /></div>
                <div><label className={labelClass}>End date</label><input type="date" className={inputClass} value={form.endDate} onChange={(e) => update('endDate', e.target.value)} /></div>
              </div>
            </div>

            {rows.length > 0 && (
              <>
                <h2 className="text-sm font-medium mb-1">Activities ({validCount} of {rows.length} ready)</h2>
                <div className="space-y-2 mb-4 max-h-[30vh] overflow-y-auto">
                  {rows.map((row, i) => (
                    <CsvPreviewRow key={i} id={`row-${i}`} row={row}
                      onChange={(updated) => setRows((prev) => prev.map((r, idx) => (idx === i ? updated : r)))}
                      onRemove={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} />
                  ))}
                </div>
              </>
            )}

            {referenceEntries.length > 0 && (
              <>
                <h2 className="text-sm font-medium mb-1">Reference entries ({referenceEntries.length} found)</h2>
                <div className="space-y-2 mb-4 max-h-[30vh] overflow-y-auto">
                  {referenceEntries.map((entry, i) => (
                    <ReferenceEntryRow key={i} id={`ref-${i}`} entry={entry}
                      onRemove={() => setReferenceEntries((prev) => prev.filter((_, idx) => idx !== i))} />
                  ))}
                </div>
              </>
            )}

            {mode === 'document' && (
              <div className="mb-4">
                <label className={labelClass}>Rules & notes (saved as searchable knowledge)</label>
                <textarea className={inputClass} rows={4} value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="Nothing extracted" />
              </div>
            )}

            {error && <p className="text-sm text-critical mb-3">{error}</p>}
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleFileConfirm} disabled={submitting || !hasAnythingToImport}>{submitting ? 'Creating…' : 'Create schedule'}</Button>
              <Button variant="secondary" onClick={() => setFileStep('select')} disabled={submitting}>Back</Button>
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}