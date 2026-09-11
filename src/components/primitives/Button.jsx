/**
 * Button — one component, three intents. No "arrow →" suffixes,
 * no all-caps. Labels say exactly what happens: "Approve", not "Submit".
 *
 * Amber (primary) is spent deliberately — one primary button per
 * screen, for the one action that matters most.
 */
export default function Button({
  children,
  variant = 'secondary', // 'primary' | 'secondary' | 'ghost' | 'critical'
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
  };

  const variants = {
    primary: 'bg-amber text-ink hover:brightness-110 active:brightness-95',
    secondary: 'bg-transparent text-chalk border border-border hover:border-mist',
    ghost: 'bg-transparent text-mist hover:text-chalk',
    critical: 'bg-transparent text-critical border border-critical/40 hover:bg-critical/10',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}