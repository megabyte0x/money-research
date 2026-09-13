const FILE_REFS = /(\bfiles?\s+\d{2}(?:(?:,|\s+and)\s+\d{2})*)/gi;

export function shortTitle(record) {
  if (record.num === '00') return 'Directory / reading order';
  return record.title.replace(/^\d+\s+—\s+/, '').split(/[:(]/)[0].trim();
}

export function referenceSegments(text, vol, byVolumeNumber) {
  return text.split(FILE_REFS).flatMap(part => {
    if (!/^files?\s+\d{2}/i.test(part)) return [{ type: 'text', text: part }];
    const numbers = [...part.matchAll(/\d{2}/g)].map(match => match[0]);
    return numbers.flatMap((number, index) => {
      const record = byVolumeNumber.get(`${vol}/${number}`);
      if (!record) throw new Error(`Unresolved file ${number} in ${vol}`);
      const separator = index === 0 ? [] : [{ type: 'text', text: index === numbers.length - 1 ? ' and ' : ', ' }];
      return [...separator, { type: 'ref', text: `“${shortTitle(record)}”`, record }];
    });
  });
}
