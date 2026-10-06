import { useState, useMemo, Fragment } from 'react';
import { parseMetadata, WEEKDAY_ORDER, TODAY_WEEKDAY } from '../../utils/referenceEntry';

const ROW_HEIGHT = 72;
const TIME_COL_WIDTH = 64;

function toMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export default function TimetableGrid({ entries }) {
  const withMeta = useMemo(() => entries.map((e) => ({ ...e, meta: parseMetadata(e.metadata) })), [entries]);
  const sections = useMemo(() => [...new Set(withMeta.map((e) => e.meta.section).filter(Boolean))].sort(), [withMeta]);
  const [selectedSection, setSelectedSection] = useState(sections[0] || null);

  const visible = selectedSection ? withMeta.filter((e) => e.meta.section === selectedSection) : withMeta;
  const days = WEEKDAY_ORDER.filter((d) => visible.some((e) => e.weekday === d));
  const slots = useMemo(() => {
    const seen = new Map();
    visible.forEach((e) => { if (e.startTime) seen.set(`${e.startTime}-${e.endTime}`, { start: e.startTime, end: e.endTime }); });
    return [...seen.values()].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [visible]);

  if (slots.length === 0 || days.length === 0) {
    return <p className="text-sm text-mist">No weekly time slots found to display.</p>;
  }

  const gridStart = toMinutes(slots[0].start);
  const gridEnd = toMinutes(slots[slots.length - 1].end);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayIndex = days.indexOf(TODAY_WEEKDAY);
  const showNowLine = todayIndex !== -1 && nowMinutes >= gridStart && nowMinutes <= gridEnd;
  const nowTop = showNowLine ? ((nowMinutes - gridStart) / (gridEnd - gridStart)) * (slots.length * ROW_HEIGHT) : 0;

  const findEntry = (day, slot) => visible.find((e) => e.weekday === day && e.startTime === slot.start);
  const isCurrent = (day, slot) => day === TODAY_WEEKDAY && nowMinutes >= toMinutes(slot.start) && nowMinutes < toMinutes(slot.end);
  const isPast = (day, slot) => day === TODAY_WEEKDAY && nowMinutes >= toMinutes(slot.end);

  return (
    <div>
      <style>{`
        @keyframes marshalPulseGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(227,167,46,0.6), 0 0 12px 2px rgba(227,167,46,0.25); }
          50% { box-shadow: 0 0 0 1px rgba(227,167,46,0.9), 0 0 20px 6px rgba(227,167,46,0.45); }
        }
        .marshal-current-slot { animation: marshalPulseGlow 2.4s ease-in-out infinite; }
      `}</style>

      {sections.length > 1 && (
        <select value={selectedSection || ''} onChange={(e) => setSelectedSection(e.target.value)} className="mb-3 rounded-sm border border-border bg-panel-raised px-2 py-1 text-sm">
          {sections.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      )}

      <div className="relative overflow-x-auto rounded-md border border-border">
        <div className="grid" style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${days.length}, minmax(120px, 1fr))` }}>
          <div className="border-b border-r border-border bg-panel p-2" />
          {days.map((day) => (
            <div key={day} className={`border-b border-border p-2 text-center text-xs font-medium ${day === TODAY_WEEKDAY ? 'bg-amber/10 text-amber' : 'bg-panel text-mist'}`}>
              {day.slice(0, 3)}
            </div>
          ))}
          {slots.map((slot, i) => (
            <Fragment key={`row-${i}`}>
              <div className="flex items-start justify-end border-r border-border bg-panel px-1.5 py-1 text-[10px] text-mist" style={{ height: ROW_HEIGHT }}>
                {slot.start}
              </div>
              {days.map((day) => {
                const entry = findEntry(day, slot);
                return (
                  <div key={`${day}-${i}`} className={`border-b border-r border-border/60 p-1.5 ${day === TODAY_WEEKDAY ? 'bg-amber/5' : ''}`} style={{ height: ROW_HEIGHT }}>
                    {entry && (
                      <div className={`h-full rounded-sm p-1.5 text-[11px] leading-tight ${
                        isCurrent(day, slot) ? 'marshal-current-slot bg-amber/15 border border-amber text-chalk'
                          : isPast(day, slot) ? 'bg-panel-raised/50 text-mist opacity-50' : 'bg-panel-raised text-chalk'
                      }`}>
                        <p className="font-medium truncate">{entry.title}</p>
                        {entry.meta.faculty && <p className="truncate text-mist">{entry.meta.faculty}</p>}
                        {entry.venue && <p className="truncate text-mist">{entry.venue}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>

        {showNowLine && (
          <div
            className="pointer-events-none absolute h-0.5 bg-amber shadow-[0_0_6px_1px_rgba(227,167,46,0.8)]"
            style={{
              top: `${ROW_HEIGHT + nowTop}px`,
              left: `calc(${TIME_COL_WIDTH}px + ${todayIndex} * ((100% - ${TIME_COL_WIDTH}px) / ${days.length}))`,
              width: `calc((100% - ${TIME_COL_WIDTH}px) / ${days.length})`,
            }}
          />
        )}
      </div>
    </div>
  );
}