const textField = value => typeof value === 'string' && value.trim() && value.length <= 600;

export function indexArticleMetadata(rows, manifest, blocks) {
  if (!Array.isArray(rows)) throw new Error('Article metadata must be an array');
  const byId = new Map(manifest.map(record => [record.id, record]));
  const published = {};
  for (const row of rows) {
    if (!row || row.status !== 'approved' || !byId.has(row.id) || published[row.id]) {
      throw new Error(`Invalid or duplicate article metadata: ${row?.id}`);
    }
    const record = byId.get(row.id);
    if (/timeline|glossary|sources|readme/.test(record.slug)) throw new Error(`Reference article cannot have topic metadata: ${row.id}`);
    const summary = row.summary || {};
    if (!textField(summary.answer) || !textField(summary.question) ||
        !Array.isArray(summary.takeaways) || summary.takeaways.length < 3 ||
        summary.takeaways.length > 5 || !summary.takeaways.every(textField) ||
        !(summary.evidenceAndUncertainty || (summary.evidence && summary.uncertainty)) ||
        (summary.evidence && !textField(summary.evidence)) ||
        (summary.uncertainty && !textField(summary.uncertainty)) ||
        (summary.evidenceAndUncertainty && (typeof summary.evidenceAndUncertainty !== 'string' ||
          !summary.evidenceAndUncertainty.trim() || summary.evidenceAndUncertainty.length > 1400))) {
      throw new Error(`Invalid chapter summary: ${row.id}`);
    }
    const steps = row.nextSteps || [];
    if (!Array.isArray(steps) || steps.length > 2) throw new Error(`Invalid next steps: ${row.id}`);
    const seen = new Set();
    const nextSteps = steps.map(step => {
      const target = byId.get(step.targetArticleId);
      if (!target || target.id === row.id || !textField(step.kind) || !textField(step.reason) || seen.has(target.id)) {
        throw new Error(`Invalid next step: ${row.id}`);
      }
      seen.add(target.id);
      const section = step.targetSectionId || null;
      const targetBlocks = blocks[`${target.slug}@${target.vol}`] || [];
      if (section && !targetBlocks.some(block => block.id === section)) {
        throw new Error(`Missing next-step section: ${row.id} → ${target.id}#${section}`);
      }
      return { kind: step.kind, reason: step.reason, targetArticleId: target.id, targetSectionId: section };
    });
    const citations = Array.isArray(row.citations) ? row.citations.map(item => {
      if (!item || typeof item.claimId !== 'string' || !/^[A-Za-z][A-Za-z0-9-]*$/.test(item.claimId)) {
        throw new Error(`Invalid answer citation: ${row.id}`);
      }
      return { claimId: item.claimId };
    }) : [];
    published[row.id] = { summary, nextSteps, citations };
  }
  return published;
}
