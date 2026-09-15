// Date ordering is intentionally conservative: a range sorts at its first stated
// year, BCE years are negative, and an unknown month sorts before dated entries
// in the same year. Precision stays visible in the original display date.
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

// Historical signed years are used here: 1 BCE is -1 and 1 CE is +1.
// There is no year zero. These are bounds for sorting, not asserted event dates.
export function eventDateRange(displayDate) {
  const date = displayDate.replace(/[*_]/g, '').trim();
  const bce = /\bBCE\b/i.test(date);
  const approximate = /^(?:c\.|~|late\b)/i.test(date);
  const century = date.match(/(\d+)(?:st|nd|rd|th)\s*(?:[–-]\s*(\d+)(?:st|nd|rd|th))?\s*(?:c\.|century)/i);
  if (century) {
    const first = +century[1], last = +(century[2] || century[1]);
    return bce
      ? { start: -last * 100, end: -(first - 1) * 100 - 1, precision: 'century', approximate: true }
      : { start: (first - 1) * 100 + 1, end: last * 100, precision: 'century', approximate: true };
  }
  const years = [...date.matchAll(/\b\d{4}(?=s\b|\b)/g)].map(match => +match[0]);
  const firstYear = years[0] || +(date.match(/\b\d{1,4}\b/) || [0])[0];
  const shortEnd = date.match(/(?:\d{4}|\d{4}s)\s*[–-]\s*(\d{2})(?!\d)/);
  const secondYear = years[1] || (shortEnd ? Math.floor(firstYear / 100) * 100 + +shortEnd[1] : firstYear);
  const startYear = bce ? -firstYear : firstYear;
  const decadeEnd = /\d{4}s\s*[–-]\s*\d{4}s\b/.test(date) ? 9 : 0;
  const endYear = bce ? -secondYear : secondYear + decadeEnd;
  const monthNames = [...date.matchAll(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/gi)]
    .map(match => MONTHS[match[1].toLowerCase()]);
  const firstMonth = monthNames[0] || null;
  const lastMonth = monthNames.at(-1) || null;
  const day = date.match(/^(\d{1,2})(?:[–-](\d{1,2}))?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);
  const firstDay = day ? +day[1] : null;
  const lastDay = day ? +(day[2] || day[1]) : null;
  const precision = firstDay ? 'day' : firstMonth ? 'month' : /Q[1-4]\b/i.test(date) ? 'quarter' : /\d{4}s\b/.test(date) ? 'decade' : 'year';
  const quarter = +(date.match(/Q([1-4])\b/i) || [0, 0])[1];
  return {
    start: Math.min(startYear, endYear), end: Math.max(startYear, endYear),
    startMonth: firstMonth || (quarter ? quarter * 3 - 2 : null),
    endMonth: lastMonth || (quarter ? quarter * 3 : null),
    startDay: firstDay, endDay: lastDay,
    precision, approximate: approximate || precision === 'decade'
  };
}

export function eventYear(date) {
  const text = date.replace(/[*_]/g, '');
  const century = text.match(/(\d+)(?:st|nd|rd|th)\s*(?:[–-]\s*\d+(?:st|nd|rd|th))?\s*c(?:entury|\.)/i);
  if (century) {
    const midpoint = (+century[1] - 1) * 100 + 50;
    return /BCE/i.test(text) ? -midpoint : midpoint;
  }
  return eventDateRange(text).start;
}

export function eventSortValue(date) {
  const range = eventDateRange(date);
  const year = range.start;
  if (year < 0) return year;
  const month = range.startMonth || 0;
  const day = range.startDay || 0;
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
  ['evt-gold-0074', 'evt-after-0125'], // US private gold-ownership restrictions end
  ['evt-after-0071', 'evt-bitcoin-0001'], // Lehman Brothers bankruptcy
  ['evt-after-0072', 'evt-bitcoin-0002'], // Bitcoin whitepaper publication
  ['evt-after-0073', 'evt-bitcoin-0003'], // Bitcoin genesis block
  ['evt-gold-0079', 'evt-after-0159'], // first Central Bank Gold Agreement, September 1999
  ['evt-gold-0078', 'evt-after-0158'], // UK gold-auction series, July 1999–March 2002
  ['evt-gold-0085', 'evt-after-0104'], // WGC USD-series 29 January 2026 gold record
  ['evt-gold-0085', 'evt-bitcoin-0084'], // same record in Bitcoin source lane
  ['evt-gold-0083', 'evt-after-0094'], // WGC 2022–24 official-sector net-demand series
  ['evt-after-0181', 'evt-bitcoin-0103'], // Ethereum mainnet launch, 30 July 2015
  ['evt-after-0090', 'evt-bitcoin-0035'], // El Salvador 2021 Bitcoin Law takes effect
  ['evt-after-0098', 'evt-bitcoin-0053'], // SEC spot-Bitcoin ETP approval, 10 January 2024
  ['evt-after-0100', 'evt-bitcoin-0065'], // El Salvador Decree 199, January 2025
  ['evt-after-0202', 'evt-bitcoin-0067'], // US Strategic Bitcoin Reserve executive order, March 2025
  ['evt-after-0207', 'evt-bitcoin-0074'], // GENIUS Act enactment, July 2025
  ['evt-after-0106', 'evt-bitcoin-0086'], // 28 February 2026 Iran conflict starts
  ['evt-after-0108', 'evt-bitcoin-0088'], // 7–8 April 2026 announced ceasefire
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
