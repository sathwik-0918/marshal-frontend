/**
 * StatusBadge — maps activity status to the status color family.
 * The ONLY place these colors get used — never decoratively
 * elsewhere, so red always means the same thing everywhere.
 */
const STATUS_MAP = {
  scheduled: { label: 'Scheduled', color: 'text-mist', bg: 'bg-mist/10' },
  in_progress: { label: 'Live now', color: 'text-amber', bg: 'bg-amber-dim' },
  delayed: { label: 'Delayed', color: 'text-warning', bg: 'bg-warning/10' },
  completed: { label: 'Completed', color: 'text-success', bg: 'bg-success/10' },
  cancelled: { label: 'Cancelled', color: 'text-critical', bg: 'bg-critical/10' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.scheduled;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}>
      {status === 'in_progress' && (
        <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
      )}
      {config.label}
    </span>
  );
}