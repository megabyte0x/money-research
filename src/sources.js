export function isISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function indexSources(records) {
  if (!Array.isArray(records)) throw new Error('Sources must be an array');
  const byId = new Map();
  const urls = new Set();
  for (const record of records) {
    if (!record || !/^[a-z0-9-]+$/.test(record.id || '') || byId.has(record.id)) {
      throw new Error(`Invalid or duplicate source ID: ${record?.id}`);
    }
    let url;
    try { url = new URL(record.url); } catch { /* validated below */ }
    if (!record.publisher || !record.title || !record.sourceType ||
        url?.protocol !== 'https:' || !url.hostname || urls.has(url.href) ||
        !(record.publicationDate === null || isISODate(record.publicationDate)) || !isISODate(record.accessed) ||
        (record.publicationDate && record.publicationDate > record.accessed)) {
      throw new Error(`Incomplete or duplicate source: ${record.id}`);
    }
    byId.set(record.id, record);
    urls.add(url.href);
  }
  return byId;
}
