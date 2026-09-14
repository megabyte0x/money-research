const TOKEN = /\{\{obs:([a-z0-9-]+)\}\}/g;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function indexObservations(records) {
  if (!Array.isArray(records)) throw new Error('Observations must be an array');
  const byId = new Map();
  for (const record of records) {
    if (!record || !/^[a-z0-9-]+$/.test(record.id || '') || byId.has(record.id)) {
      throw new Error(`Invalid or duplicate observation ID: ${record?.id}`);
    }
    if (!Number.isFinite(record.value) || !record.unit || !record.denominator ||
        !ISO_DATE.test(record.period) || !record.scope || !record.method ||
        !record.sourceLocator || !/^https:\/\//.test(record.source || '') ||
        !ISO_DATE.test(record.sourcePublicationDate) || !ISO_DATE.test(record.accessed) ||
        !record.uncertainty || !record.claimId || !Number.isInteger(record.revision) || record.revision < 1 ||
        !['verified against publisher table', 'verified against publisher document'].includes(record.verification)) {
      throw new Error(`Incomplete or unverified observation: ${record.id}`);
    }
    byId.set(record.id, record);
  }
  return byId;
}

export function resolveObservations(source, byId) {
  const result = source.replace(TOKEN, (_, id) => {
    const record = byId.get(id);
    if (!record) throw new Error(`Unknown observation: ${id}`);
    return record.value.toLocaleString('en-US');
  });
  if (result.includes('{{obs:')) throw new Error('Malformed observation token');
  return result;
}
