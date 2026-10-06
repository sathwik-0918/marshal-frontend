import { useMemo } from 'react';

export default function ExamTimetableView({ activities }) {
  const byDate = useMemo(() => {
    const groups = {};
    activities.forEach((a) => {
      const d = new Date(a.scheduledStart);
      const dateKey = d.toISOString().slice(0, 10);
      const timeKey = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      if (!groups[dateKey]) groups[dateKey] = {};
      if (!groups[dateKey][timeKey]) groups[dateKey][timeKey] = { activities: [], start: d };
      groups[dateKey][timeKey].activities.push(a);
    });
    return groups;
  }, [activities]);

  const sortedDates = Object.keys(byDate).sort();
  const now = new Date();

  if (sortedDates.length === 0) return <p className="text-sm text-mist">No exam sessions found.</p>;

  return (
    <div>
      <style>{`
        @keyframes marshalPulseGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(227,167,46,0.6), 0 0 12px 2px rgba(227,167,46,0.25); }
          50% { box-shadow: 0 0 0 1px rgba(227,167,46,0.9), 0 0 20px 6px rgba(227,167,46,0.45); }
        }
        .marshal-current-slot { animation: marshalPulseGlow 2.4s ease-in-out infinite; }
      `}</style>

      <div className="space-y-5">
        {sortedDates.map((dateKey) => {
          const dateObj = new Date(`${dateKey}T00:00:00`);
          const isToday = dateObj.toDateString() === now.toDateString();
          const sessions = Object.entries(byDate[dateKey]).sort((a, b) => a[1].start - b[1].start);

          return (
            <div key={dateKey}>
              <h3 className={`mb-2 text-sm font-medium ${isToday ? 'text-amber' : 'text-mist'}`}>
                {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                {isToday && <span className="ml-2 text-[10px]">TODAY</span>}
              </h3>
              <div className="space-y-2">
                {sessions.map(([timeKey, session]) => {
                  const durationMin = session.activities[0]?.durationMinutes || 120;
                  const end = new Date(session.start.getTime() + durationMin * 60000);
                  const isCurrent = now >= session.start && now < end;
                  return (
                    <div key={timeKey} className={`rounded-md border p-3 ${isCurrent ? 'marshal-current-slot border-amber bg-amber/10' : 'border-border bg-panel-raised'}`}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-xs text-mist">{timeKey}</p>
                        {isCurrent && <span className="text-[10px] font-medium text-amber">NOW</span>}
                      </div>
                      <div className="space-y-1">
                        {session.activities.map((a) => (
                          <p key={a._id} className="text-sm">{a.title}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}