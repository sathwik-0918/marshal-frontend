import { Trash2 } from 'lucide-react';

export default function ReferenceEntryRow({ entry, onRemove }) {
  const isRecurring = entry.entry_type === 'recurring_weekly';
  return (
    <div className="flex items-start justify-between gap-2 rounded-sm border border-border p-2 text-sm">
      <div className="min-w-0">
        <p className="font-medium">{entry.title}</p>
        <p className="text-xs text-mist">
          {isRecurring
            ? `Every ${entry.weekday || '?'}${entry.start_time ? `, ${entry.start_time}-${entry.end_time || '?'}` : ''}`
            : `${entry.start_date || '?'} to ${entry.end_date || '?'}`}
          {entry.venue && ` · ${entry.venue}`}
        </p>
        {entry.description && <p className="text-xs text-mist mt-1">{entry.description}</p>}
        {entry.metadata?.length > 0 && <p className="text-[11px] text-mist mt-0.5">{entry.metadata.join(' · ')}</p>}
      </div>
      <button onClick={onRemove} aria-label="Remove" className="shrink-0 text-mist hover:text-critical">
        <Trash2 size={14} />
      </button>
    </div>
  );
}