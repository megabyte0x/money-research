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
  return year + month / 13 + day / 420;
}

// Only these shared events have been editorially identified as the same event.
// Do not merge rows just because dates or keywords happen to match.
export function sharedEventId(year, event) {
  const text = event.toLowerCase();
  if (year === 1971 && /nixon/.test(text) && /gold (window|convertibility)/.test(text)) return 'nixon-gold-window-1971';
  if (year === 1973 && /major currencies float/.test(text)) return 'major-currencies-float-1973';
  if (year === 1976 && /jamaica accords/.test(text)) return 'jamaica-accords-1976';
  if (year === 1980 && /gold peaks at \$850/.test(text)) return 'gold-peak-1980';
  if (year === 2026 && /gold peaks? (?:at |~)?(?:about )?\$5,590/.test(text)) return 'gold-peak-2026';
  return null;
}

export function mergeSharedEvents(events) {
  const merged = new Map();
  for (const event of events) {
    const id = sharedEventId(event.year, event.eventText) || event.id;
    if (!merged.has(id)) merged.set(id, { ...event, id, sources: [event.vol], refs: [...event.refs] });
    else {
      const current = merged.get(id);
      if (!current.sources.includes(event.vol)) current.sources.push(event.vol);
      for (const ref of event.refs) if (!current.refs.some(r => r.href === ref.href)) current.refs.push(ref);
      current.sort = Math.min(current.sort, event.sort);
    }
  }
  return [...merged.values()].sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
}
