export function formatFieldLabel(field) {
  if (field === 'venue') return 'Venue';
  if (field === 'scheduledStart') return 'Time';
  if (field === 'status') return 'Status';
  return field;
}

export function formatFieldValue(field, value) {
  if (field === 'scheduledStart' && value) {
    return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  return value || '—';
}

export function formatShift(oldValue, newValue) {
  const diff = Math.round((new Date(newValue) - new Date(oldValue)) / 60000);
  if (!Number.isFinite(diff) || diff === 0) return '';
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const text = h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m} min`;
  return `(${diff > 0 ? '+' : '-'}${text})`;
}