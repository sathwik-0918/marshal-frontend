import { useState, useMemo, Fragment } from 'react';
import { parseMetadata, WEEKDAY_ORDER, TODAY_WEEKDAY } from '../../utils/referenceEntry';

const ROW_HEIGHT = 72;
const BREAK_HEIGHT = 30;
const HEADER_HEIGHT = 40;
const TIME_COL_WIDTH = 64;
const MIN_DAY_WIDTH = 120;

function toMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = String(hhmm).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function formatMinutes(min) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

// Rows are the atomic intervals between every start/end boundary that some
// session actually covers; a gap between two covered intervals (lunch)
// becomes a thin break row. A session spanning several intervals is ONE
// block placed across those rows - never repeated per row.
function buildLayout(entries) {
  const parsed = entries
    .map((e) => ({ ...e, _start: toMinutes(e.startTime), _end: toMinutes(e.endTime) }))
    .filter((e) => e._start !== null && e.weekday);
  if (parsed.length === 0) return null;

  const lengths = parsed.filter((e) => e._end !== null && e._end > e._start).map((e) => e._end - e._start);
  const fallbackLength = lengths.length ? Math.min(...lengths) : 50;
  const items = parsed.map((e) => ({ ...e, _end: e._end !== null && e._end > e._start ? e._end : e._start + fallbackLength }));

  const boundaries = [...new Set(items.flatMap((e) => [e._start, e._end]))].sort((a, b) => a - b);
  const slots = [];
  for (let i = 0; i < boundaries.length - 1; i += 1) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (items.some((it) => it._start <= start && it._end >= end)) slots.push({ start, end, type: 'slot' });
  }

  const rows = [];
  slots.forEach((slot, idx) => {
    if (idx > 0 && slots[idx - 1].end < slot.start) rows.push({ start: slots[idx - 1].end, end: slot.start, type: 'break' });
    rows.push(slot);
  });

  const placed = {};
  let hidden = 0;
  [...items].sort((a, b) => a._start - b._start || a._end - b._end).forEach((it) => {
    const list = (placed[it.weekday] = placed[it.weekday] || []);
    if (list.some((p) => it._start < p._end && p._start < it._end)) { hidden += 1; return; }
    list.push(it);
  });

  return { rows, placed, hidden };
}

function computeNowTop(rows, nowMin) {
  let top = HEADER_HEIGHT;
  for (const r of rows) {
    const h = r.type === 'break' ? BREAK_HEIGHT : ROW_HEIGHT;
    if (nowMin >= r.start && nowMin < r.end) return top + ((nowMin - r.start) / (r.end - r.start)) * h;
    top += h;
  }
  return null;
}

export default function TimetableGrid({ entries, onCellClick }) {
  const withMeta = useMemo(() => entries.map((e) => ({ ...e, meta: parseMetadata(e.metadata) })), [entries]);
  const sections = useMemo(() => [...new Set(withMeta.map((e) => e.meta.section).filter(Boolean))].sort(), [withMeta]);
  const [selectedSection, setSelectedSection] = useState(null);
  const activeSection = sections.includes(selectedSection) ? selectedSection : sections[0] || null;

  const visible = useMemo(
    () => (activeSection ? withMeta.filter((e) => e.meta.section === activeSection) : withMeta),
    [withMeta, activeSection]
  );
  const layout = useMemo(() => buildLayout(visible), [visible]);
  const days = WEEKDAY_ORDER.filter((d) => visible.some((e) => e.weekday === d));

  if (!layout || days.length === 0) {
    return <p className="text-sm text-mist">No weekly time slots found to display.</p>;
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayIdx = days.indexOf(TODAY_WEEKDAY);
  const nowTop = todayIdx !== -1 ? computeNowTop(layout.rows, nowMinutes) : null;
  const rowTemplate = [`${HEADER_HEIGHT}px`, ...layout.rows.map((r) => (r.type === 'break' ? `${BREAK_HEIGHT}px` : `${ROW_HEIGHT}px`))].join(' ');

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
        <select value={activeSection || ''} onChange={(e) => setSelectedSection(e.target.value)} className="mb-3 rounded-sm border border-border bg-panel-raised px-2 py-1 text-sm">
          {sections.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      )}
      {layout.hidden > 0 && (
        <p className="mb-2 text-[11px] text-warning">{layout.hidden} overlapping entr{layout.hidden === 1 ? 'y is' : 'ies are'} hidden - use the section selector or fix the overlap.</p>
      )}

      <div className="overflow-x-auto rounded-md border border-border">
        <div className="relative" style={{ minWidth: TIME_COL_WIDTH + days.length * MIN_DAY_WIDTH }}>
          <div className="grid" style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${days.length}, minmax(0, 1fr))`, gridTemplateRows: rowTemplate }}>
            <div style={{ gridRow: 1, gridColumn: 1 }} className="border-b border-r border-border bg-panel" />
            {days.map((day, di) => (
              <div key={day} style={{ gridRow: 1, gridColumn: di + 2 }} className={`flex items-center justify-center border-b border-border text-xs font-medium ${day === TODAY_WEEKDAY ? 'bg-amber/10 text-amber' : 'bg-panel text-mist'}`}>
                {day.slice(0, 3)}
              </div>
            ))}

            {layout.rows.map((row, ri) => (
              <Fragment key={`row-${ri}`}>
                <div style={{ gridRow: ri + 2, gridColumn: 1 }} className="flex items-start justify-end border-b border-r border-border bg-panel px-1.5 py-1 text-[10px] text-mist">
                  {row.type === 'break' ? 'Break' : formatMinutes(row.start)}
                </div>
                {days.map((day, di) => (
                  <div key={`bg-${ri}-${di}`} style={{ gridRow: ri + 2, gridColumn: di + 2 }} className={`border-b border-r border-border/60 ${row.type === 'break' ? 'bg-panel/40' : day === TODAY_WEEKDAY ? 'bg-amber/5' : ''}`} />
                ))}
              </Fragment>
            ))}

            {days.flatMap((day, di) =>
              (layout.placed[day] || []).map((it) => {
                const rs = layout.rows.findIndex((r) => r.type === 'slot' && r.start === it._start);
                const re = layout.rows.findIndex((r) => r.type === 'slot' && r.end === it._end);
                if (rs === -1 || re === -1 || re < rs) return null;
                const current = day === TODAY_WEEKDAY && nowMinutes >= it._start && nowMinutes < it._end;
                const past = day === TODAY_WEEKDAY && nowMinutes >= it._end;
                return (
                  <div key={it._id || `${day}-${it._start}-${it.title}`} style={{ gridRow: `${rs + 2} / ${re + 3}`, gridColumn: di + 2 }} className="p-1.5">
                    <div
                      onClick={onCellClick ? () => onCellClick(it) : undefined}
                      className={`h-full overflow-hidden rounded-sm p-1.5 text-[11px] leading-tight ${onCellClick ? 'cursor-pointer hover:ring-1 hover:ring-amber/50' : ''} ${
                        current ? 'marshal-current-slot bg-amber/15 border border-amber text-chalk'
                          : past ? 'bg-panel-raised/50 text-mist opacity-50' : 'bg-panel-raised text-chalk'
                      }`}
                    >
                      <p className="font-medium truncate">{it.title}</p>
                      {re > rs && <p className="text-[10px] text-mist">{formatMinutes(it._start)}–{formatMinutes(it._end)}</p>}
                      {it.meta.faculty && <p className="truncate text-mist">{it.meta.faculty}</p>}
                      {it.venue && <p className="truncate text-mist">{it.venue}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {nowTop !== null && (
            <div
              className="pointer-events-none absolute h-0.5 bg-amber shadow-[0_0_6px_1px_rgba(227,167,46,0.8)]"
              style={{
                top: nowTop,
                left: `calc(${TIME_COL_WIDTH}px + ${todayIdx} * ((100% - ${TIME_COL_WIDTH}px) / ${days.length}))`,
                width: `calc((100% - ${TIME_COL_WIDTH}px) / ${days.length})`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}