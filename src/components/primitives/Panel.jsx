/**
 * Panel — the base surface everything sits on. Deliberately plain:
 * a 1px border, not a soft drop-shadow, because "identical rounded
 * card with grey shadow" is the single most common generic-dashboard
 * tell. emphasis=true is for the ONE block per screen that matters most.
 */
export default function Panel({ children, emphasis = false, className = '' }) {
  const base = 'rounded-md p-5 bg-panel border';
  const border = emphasis ? 'border-amber/40' : 'border-border';

  return <div className={`${base} ${border} ${className}`}>{children}</div>;
}