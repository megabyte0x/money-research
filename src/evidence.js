import { indexSources, isISODate } from './sources.js';

const ID = /^[A-Za-z][A-Za-z0-9-]*$/;
const TYPES = new Set(['fact', 'estimate', 'interpretation', 'scenario']);
const STATES = new Set(['accepted', 'withheld', 'review']);

export function indexClaims(records, bySourceId, articleIds = null) {
  if (!Array.isArray(records)) throw new Error('Claims must be an array');
  const byId = new Map();
  for (const claim of records) {
    if (!claim || !ID.test(claim.id || '') || byId.has(claim.id)) {
      throw new Error(`Invalid or duplicate claim ID: ${claim?.id}`);
    }
    if (!claim.assertion || !TYPES.has(claim.assertionType) || !claim.scope ||
        !STATES.has(claim.reviewState) || !Array.isArray(claim.supporting) ||
        !Array.isArray(claim.contrary) || !Array.isArray(claim.articleIds) ||
        !Array.isArray(claim.views) || !Number.isInteger(claim.revision) || claim.revision < 1) {
      throw new Error(`Incomplete claim: ${claim.id}`);
    }
    for (const locator of [...claim.supporting, ...claim.contrary]) {
      if (!bySourceId.has(locator?.sourceId) || !locator.locator?.trim()) {
        throw new Error(`Unresolved source locator in claim: ${claim.id}`);
      }
    }
    if (claim.reviewState === 'accepted' && (!claim.supporting.length || !claim.reviewedBy?.trim() || !isISODate(claim.reviewedAt))) {
      throw new Error(`Unverified published claim: ${claim.id}`);
    }
    if (articleIds) for (const id of claim.articleIds) {
      if (!articleIds.has(id)) throw new Error(`Unknown dependent article in claim ${claim.id}: ${id}`);
    }
    byId.set(claim.id, claim);
  }
  return byId;
}

export function createEvidenceIndex(sources, claims, observations, articleIds = null) {
  const bySourceId = indexSources(sources);
  const byClaimId = indexClaims(claims, bySourceId, articleIds);
  for (const observation of observations) {
    const source = bySourceId.get(observation.sourceId);
    const claim = byClaimId.get(observation.claimId);
    if (!source || source.url !== observation.source ||
        source.publicationDate !== observation.sourcePublicationDate ||
        source.accessed !== observation.accessed) {
      throw new Error(`Unresolved or inconsistent observation source: ${observation.id}`);
    }
    if (!claim || claim.reviewState !== 'accepted' ||
        !claim.supporting.some(item => item.sourceId === observation.sourceId && item.locator === observation.sourceLocator)) {
      throw new Error(`Unverified observation claim: ${observation.id}`);
    }
  }
  return {
    sources: Object.fromEntries(bySourceId),
    claims: Object.fromEntries([...byClaimId].filter(([, claim]) => claim.reviewState === 'accepted')),
  };
}
