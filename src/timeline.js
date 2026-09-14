// Date ordering is intentionally conservative: a range sorts at its first stated
// year, BCE years are negative, and an unknown month sorts before dated entries
// in the same year. Precision stays visible in the original display date.
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

export function eventYear(date) {
  const text = date.replace(/[*_]/g, '');
  const century = text.match(/(\d+)(?:st|nd|rd|th)\s*(?:[–-]\s*\d+(?:st|nd|rd|th))?\s*c(?:entury|\.)/i);
  const rawYear = century ? (+century[1] - 1) * 100 + 50 : +(text.match(/\b\d{4}\b/) || text.match(/\d{1,4}/) || [0])[0];
  return /BCE/i.test(text) ? -rawYear : rawYear;
}

export function eventSortValue(date) {
  const year = eventYear(date);
  if (year < 0) return year;
  const month = MONTHS[date.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)?.[1]?.toLowerCase()] || 0;
  const day = +(date.match(/^\s*(\d{1,2})\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)?.[1] || 0);
  const approximatePart = !month && /^\s*late\b/i.test(date) ? 0.75 : 0;
  return year + (month ? month / 13 + day / 420 : approximatePart);
}

// Only these pairs have been editorially reviewed as the same event.
// The IDs, unlike dates and prose, survive source-text corrections.
export const SHARED_EVENT_PAIRS = Object.freeze([
  ['evt-gold-0071', 'evt-after-0002'], // Nixon suspends dollar-gold convertibility
  ['evt-gold-0072', 'evt-after-0114'], // major currencies float in March 1973
  ['evt-gold-0073', 'evt-after-0009'], // US–Saudi economic-cooperation commission
  ['evt-gold-0075', 'evt-after-0014'], // Jamaica Accords
  ['evt-gold-0076', 'evt-after-0021'], // January 1980 gold-price peak
]);
const SHARED_EVENT_KEYS = new Map(SHARED_EVENT_PAIRS.flatMap(([first, second]) =>
  [[first, first], [second, first]]));

export function sharedEventId(eventId) {
  return SHARED_EVENT_KEYS.get(eventId) || null;
}

export function mergeSharedEvents(events) {
  const merged = new Map();
  for (const event of events) {
    const groupKey = sharedEventId(event.id) || event.id;
    if (!merged.has(groupKey)) merged.set(groupKey, { ...event, sources: [event.vol], refs: [...event.refs] });
    else {
      const current = merged.get(groupKey);
      if (!current.sources.includes(event.vol)) current.sources.push(event.vol);
      for (const ref of event.refs) if (!current.refs.some(r => r.href === ref.href)) current.refs.push(ref);
      current.sort = Math.min(current.sort, event.sort);
    }
  }
  return [...merged.values()].sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
}
