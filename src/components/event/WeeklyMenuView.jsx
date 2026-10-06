import { useState } from 'react';
import { parseMetadata, WEEKDAY_ORDER, MEAL_ORDER, TODAY_WEEKDAY } from '../../utils/referenceEntry';

// Presentational only - for highlighting which meal card glows "NOW".
// Not authoritative data; the document itself states no exact times.
const MEAL_WINDOWS = { Breakfast: [360, 600], Lunch: [720, 900], Snacks: [960, 1080], Dinner: [1140, 1320] };

export default function WeeklyMenuView({ entries }) {
  const [selectedDay, setSelectedDay] = useState(TODAY_WEEKDAY);
  const days = WEEKDAY_ORDER.filter((d) => entries.some((e) => e.weekday === d));
  const dayEntries = entries
    .filter((e) => e.weekday === selectedDay)
    .map((e) => ({ ...e, meta: parseMetadata(e.metadata) }))
    .sort((a, b) => MEAL_ORDER.indexOf(a.title) - MEAL_ORDER.indexOf(b.title));
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return (
    <div>
      <style>{`
        @keyframes marshalPulseGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(227,167,46,0.6), 0 0 12px 2px rgba(227,167,46,0.25); }
          50% { box-shadow: 0 0 0 1px rgba(227,167,46,0.9), 0 0 20px 6px rgba(227,167,46,0.45); }
        }
        .marshal-current-slot { animation: marshalPulseGlow 2.4s ease-in-out infinite; }
      `}</style>

      <div className="mb-3 flex gap-1 overflow-x-auto">
        {days.map((day) => (
          <button key={day} onClick={() => setSelectedDay(day)} className={`shrink-0 rounded-sm px-3 py-1.5 text-xs ${selectedDay === day ? 'bg-amber text-ink' : 'bg-panel-raised text-mist hover:text-chalk'}`}>
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dayEntries.map((entry) => {
          const window = MEAL_WINDOWS[entry.title];
          const isCurrent = selectedDay === TODAY_WEEKDAY && window && nowMin >= window[0] && nowMin < window[1];
          const items = (entry.meta.menu || entry.description || '').split(',').map((s) => s.trim()).filter(Boolean);
          return (
            <div key={entry._id} className={`rounded-md p-3 ${isCurrent ? 'marshal-current-slot bg-amber/10 border border-amber' : 'bg-panel-raised border border-border'}`}>
              <div className="mb-1.5 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{entry.title}</h3>
                {isCurrent && <span className="text-[10px] font-medium text-amber">NOW</span>}
              </div>
              {items.length > 0 ? (
                <ul className="space-y-0.5 text-xs text-mist">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
              ) : <p className="text-xs text-mist">Not listed in the uploaded document.</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}