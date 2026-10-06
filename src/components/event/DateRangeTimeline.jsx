export default function DateRangeTimeline({ entries }) {
  const today = new Date();
  const sorted = [...entries].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  function fmt(dateValue) {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return 'Date not confirmed';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="space-y-2">
      {sorted.map((entry) => {
        const start = new Date(entry.startDate);
        const end = new Date(entry.endDate);
        const validRange = !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime());
        const isCurrent = validRange && today >= start && today <= end;
        const isPast = validRange && today > end;
        return (
          <div key={entry._id} className={`rounded-md border p-3 ${isCurrent ? 'border-amber bg-amber/10' : isPast ? 'border-border opacity-50' : 'border-border bg-panel-raised'}`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">{entry.title}</h3>
              {isCurrent && <span className="shrink-0 text-[10px] font-medium text-amber">CURRENT</span>}
            </div>
            <p className="text-xs text-mist mt-0.5">{fmt(entry.startDate)} – {fmt(entry.endDate)}</p>
          </div>
        );
      })}
    </div>
  );
}