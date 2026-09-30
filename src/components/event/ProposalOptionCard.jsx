import { useState } from 'react';
import { formatFieldLabel, formatFieldValue, formatShift } from '../../utils/formatChange';

const RISK_STYLES = {
  low: 'text-success bg-success/10',
  medium: 'text-warning bg-warning/10',
  high: 'text-critical bg-critical/10',
};
const COLLAPSED_COUNT = 4;

export default function ProposalOptionCard({ option, action }) {
  const [expanded, setExpanded] = useState(false);

  const byActivity = {};
  for (const c of option.changes || []) {
    if (!byActivity[c.activityId]) byActivity[c.activityId] = { title: c.activityTitle || 'Activity', fields: [] };
    byActivity[c.activityId].fields.push(c);
  }
  const entries = Object.entries(byActivity);
  const visible = expanded ? entries : entries.slice(0, COLLAPSED_COUNT);
  const warnings = option.checks?.warnings || [];
  const notes = option.checks?.notes || [];

  return (
    <li className="rounded-sm bg-panel-raised p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{option.description}</p>
        {option.risk && (
          <span className={`shrink-0 rounded-sm px-2 py-0.5 text-[11px] ${RISK_STYLES[option.risk] || ''}`}>
            {option.risk} risk
          </span>
        )}
      </div>

      <div className="mt-2 space-y-1.5">
        {visible.map(([activityId, { title, fields }]) => (
          <div key={activityId} className="text-sm">
            <p>{title}</p>
            {fields.map((c, i) => (
              <p key={i} className="ml-2 text-xs text-mist">
                {formatFieldLabel(c.field)}: {formatFieldValue(c.field, c.oldValue)} →{' '}
                <span className="text-chalk">{formatFieldValue(c.field, c.newValue)}</span>
                {c.field === 'scheduledStart' && <span> {formatShift(c.oldValue, c.newValue)}</span>}
              </p>
            ))}
          </div>
        ))}
        {entries.length > COLLAPSED_COUNT && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="text-xs text-mist hover:text-chalk">
            {expanded ? 'Show fewer' : `Show all ${entries.length} activities`}
          </button>
        )}
      </div>

      {option.checks &&
        (warnings.length === 0 ? (
          <p className="mt-2 text-xs text-success">✓ Checked against the schedule — no conflicts</p>
        ) : (
          warnings.map((w, i) => (
            <p key={i} className="mt-1 text-xs text-critical">⚠ {w}</p>
          ))
        ))}
      {notes.map((n, i) => (
        <p key={i} className="mt-1 text-xs text-mist">{n}</p>
      ))}
      {action}
    </li>
  );
}