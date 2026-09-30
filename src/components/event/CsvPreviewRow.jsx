import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const inputClass = 'w-full rounded-sm border border-border bg-ink px-2 py-1 text-xs text-chalk';

export function validateRowClientSide(row) {
  const errors = [];
  if (!row.title.trim()) errors.push('Missing title');
  if (!row.venue.trim()) errors.push('Missing venue');
  if (!row.scheduledStart.trim()) errors.push('Missing start time');
  else if (Number.isNaN(new Date(row.scheduledStart).getTime())) errors.push('Invalid date/time');
  if (!row.durationMinutes || Number(row.durationMinutes) <= 0) errors.push('Duration must be positive');
  return errors;
}

export default function CsvPreviewRow({ row, onChange, onRemove }) {
  const liveErrors = validateRowClientSide(row);
  const valid = liveErrors.length === 0;

  function update(field, value) {
    onChange({ ...row, [field]: value });
  }

  return (
    <div className={`rounded-sm border p-2 ${valid ? 'border-border' : 'border-critical/50'}`}>
      <div className="flex items-start gap-2">
        <div className="mt-1.5 shrink-0">
          {valid ? <CheckCircle2 size={14} className="text-success" /> : <AlertTriangle size={14} className="text-critical" />}
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <input className={inputClass} value={row.title} onChange={(e) => update('title', e.target.value)} placeholder="Title" />
          <input className={inputClass} value={row.venue} onChange={(e) => update('venue', e.target.value)} placeholder="Venue" />
          <input className={inputClass} value={row.activityType} onChange={(e) => update('activityType', e.target.value)} placeholder="Type" />
          <input className={inputClass} type="number" min="1" value={row.durationMinutes} onChange={(e) => update('durationMinutes', e.target.value)} placeholder="Duration (min)" />
          <input className={`${inputClass} sm:col-span-2`} type="datetime-local" value={row.scheduledStart?.slice(0, 16) || ''} onChange={(e) => update('scheduledStart', e.target.value)} />
          <input className={`${inputClass} sm:col-span-2`} value={row.participantEmails} onChange={(e) => update('participantEmails', e.target.value)} placeholder="Participant emails, semicolon-separated" />
          <input className={`${inputClass} sm:col-span-2`} value={row.requiredResources} onChange={(e) => update('requiredResources', e.target.value)} placeholder="Required resources, semicolon-separated" />
        </div>
        <button onClick={onRemove} aria-label="Remove row" className="mt-1 shrink-0 text-mist hover:text-critical">
          <Trash2 size={14} />
        </button>
      </div>
      {row.emailSummary && <p className="ml-6 mt-1 text-[11px] text-mist">{row.emailSummary}</p>}
      {liveErrors.map((e, i) => <p key={i} className="ml-6 mt-1 text-[11px] text-critical">{e}</p>)}
      {(row.warnings || []).map((w, i) => <p key={i} className="ml-6 mt-1 text-[11px] text-warning">{w}</p>)}
    </div>
  );
}