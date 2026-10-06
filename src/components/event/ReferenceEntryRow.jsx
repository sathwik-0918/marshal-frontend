import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ReferenceEntryRow({ entry, onRemove, id }) {
  const isRecurring = entry.entry_type === 'recurring_weekly';
  const hasErrors = (entry.errors || []).length > 0;
  const valid = entry.valid !== false && !hasErrors;

  return (
    <div id={id} className={`rounded-sm border p-2 text-sm ${valid ? 'border-border' : 'border-critical/50'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="mt-0.5 shrink-0">
          {valid ? <CheckCircle2 size={14} className="text-success" /> : <AlertTriangle size={14} className="text-critical" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{entry.title}</p>
          <p className="text-xs text-mist">
            {isRecurring
              ? `Every ${entry.weekday || '?'}${entry.start_time ? `, ${entry.start_time}-${entry.end_time || '?'}` : ''}`
              : `${entry.start_date || '?'} to ${entry.end_date || '?'}`}
            {entry.venue && ` · ${entry.venue}`}
          </p>
          {entry.description && <p className="text-xs text-mist mt-1">{entry.description}</p>}
          {entry.metadata?.length > 0 && <p className="text-[11px] text-mist mt-0.5">{entry.metadata.join(' · ')}</p>}
          {(entry.errors || []).map((e, i) => <p key={i} className="mt-1 text-[11px] text-critical">{e}</p>)}
          {(entry.warnings || []).map((w, i) => <p key={i} className="mt-1 text-[11px] text-warning">{w}</p>)}
        </div>
        <button onClick={onRemove} aria-label="Remove" className="shrink-0 text-mist hover:text-critical">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}