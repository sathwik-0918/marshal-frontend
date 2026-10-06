export function parseMetadata(metadataArray) {
  const result = {};
  (metadataArray || []).forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    result[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim();
  });
  return result;
}

export const WEEKDAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MEAL_ORDER = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
export const TODAY_WEEKDAY = WEEKDAY_ORDER[(new Date().getDay() + 6) % 7]; // getDay(): 0=Sun -> Monday-first index