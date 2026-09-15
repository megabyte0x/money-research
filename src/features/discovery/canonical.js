// Deliberately chosen cross-volume cores for duplicate glossary IDs. Dated facts,
// jurisdictional outcomes and named-issuer notes remain under evidence review.
export const canonicalProposals = [
  { id: 'fiat-money', term: 'Fiat money', aliases: ['fiat currency'], topics: ['money basics', 'monetary rules'],
    definition: 'A state-issued currency or monetary unit without a fixed legal promise to redeem it for a specified commodity weight. Its use depends on law, tax obligations, payment systems and confidence; an issuer may still hold commodity reserves.',
    example: 'A currency can be fiat even when its central bank holds gold reserves.', related: ['legal-tender', 'unit-of-account'], chapters: ['gold-08', 'after-01'],
    sources: ['gold-11', 'after-12'], note: 'Gold-11 and corrected After-12 agree on absence of a fixed commodity redemption promise and permit reserve assets. This core applies to a state-issued monetary unit, not every bank deposit or private token lacking a gold promise; country transition dates and value theories remain separate notes.' },
  { id: 'legal-tender', term: 'Legal tender', aliases: ['legal tender status'], topics: ['law', 'money basics'],
    definition: 'A legal status for discharging specified monetary debts. Its effects, exceptions and scope depend on jurisdiction; it does not itself require every seller to accept the currency before a sale.',
    example: 'Debt discharge and acceptance for a new purchase are separate questions.', related: ['fiat-money', 'unit-of-account'], chapters: ['gold-08', 'bitcoin-06'],
    sources: ['gold-11', 'bitcoin-15'], note: 'Bitcoin-06 locates the El Salvador amendment in Decree 199 arts. 1–8 and the IMF interpretation in Country Report 25/58 para. 27 n.18. Keep that jurisdiction/date-specific case outside the general definition.' },
  { id: 'petrodollar', term: 'Petrodollar', aliases: ['petrodollar recycling'], topics: ['dollar', 'reserves'],
    definition: 'Dollar receipts from oil exports, and sometimes the investment or lending of some of those receipts. The term does not imply a dollar-for-oil redemption right or that every oil sale uses dollars.',
    example: 'Oil-export receipts invested in dollar assets are one form of petrodollar recycling.', related: ['fiat-money'], chapters: ['gold-08', 'after-02'],
    sources: ['gold-11', 'after-12'], note: 'The 1974 commission and 1975 invoicing descriptions have scoped GAO pp. 1–2 and Federal Reserve staff-memo pp. 1–2 locators in Gold-08/After-02. Neither source quantifies all private oil transactions or total recycling.' },
  { id: 'triffin-dilemma', term: 'Triffin dilemma', aliases: ['Triffin problem'], topics: ['dollar', 'monetary rules'],
    definition: 'A tension in the Bretton Woods dollar–gold arrangement: more foreign official dollar claims held as reserves could add international liquidity while straining confidence in official gold conversion. Extending the idea to another reserve arrangement is an interpretation, not an inevitable law.',
    example: 'Under Bretton Woods, foreign official dollar claims could grow relative to gold available for official conversion.', related: ['fiat-money'], chapters: ['gold-07', 'gold-08', 'bitcoin-07'],
    sources: ['gold-11', 'bitcoin-15'], note: 'Corrected Gold-07 and Bitcoin-15 describe a conditional official-reserve Bretton Woods mechanism. The example is a possibility, not a measured claims-to-gold comparison; a specified Bitcoin-backed issuer is only an analogy. Trade deficits and runs are not universal or inevitable, and historical stock totals remain withheld.' },
  { id: 'unit-of-account', term: 'Unit of account', aliases: ['accounting unit'], topics: ['money basics'],
    definition: 'A unit used to state prices, wages, debts or taxes in a specified arrangement. It is distinct from what people hand over in payment and what they hold as an asset.',
    example: 'A shop may price in one currency while accepting another for payment.', related: ['legal-tender', 'fiat-money'], chapters: ['gold-04', 'bitcoin-07'],
    sources: ['gold-11', 'bitcoin-15'], note: 'The shop example is hypothetical and may be constrained by law or contract. Corrected Bitcoin-15/06/07 distinguish native contract and price denomination from a Bitcoin payment converted at a dollar price; actual native-use extent remains empirical, not a universal never claim.' },
  { id: 'genius-act', term: 'GENIUS Act', aliases: [], topics: ['law', 'safeguards'],
    definition: 'An enacted US federal law establishing a framework for specified payment stablecoins and permitted issuers, including reserve, reporting and redemption-policy requirements. Its operative timing depends on section 20 and implementing rules.',
    example: 'Whether a named issuer falls under the law is a separate legal question.', related: ['stablecoin', 'legal-tender'], chapters: ['bitcoin-11'],
    sources: ['after-12', 'bitcoin-15', 'bitcoin-16'], note: 'Corrected After-12 and Bitcoin-15 now agree on Public Law 119-27 §§2(22)–(23), 4(a)(1)/(3)/(10), 7(e) and 20 for scope, reserves, reporting, insurance and conditional timing; Bitcoin-16 lists the GPO primary text. Current effectiveness, implementing rules across primary regulators and named issuer approval/compliance remain open.' },
  { id: 'stablecoin', term: 'Stablecoin', aliases: ['stable coin'], topics: ['payments', 'safeguards'],
    definition: 'A token designed to maintain a target value relative to a currency or other asset. Designs, reserves, holders’ rights and redemption mechanisms differ; the label alone does not establish one-for-one redemption for every holder.',
    example: 'An asset-backed token and an algorithmic token can share a target price while carrying different risks.', related: ['genius-act', 'unit-of-account'], chapters: ['after-08', 'bitcoin-02', 'bitcoin-11'],
    sources: ['after-12', 'bitcoin-15'], note: 'After-12 and corrected Bitcoin-15/12 now agree on a target-value category with distinct asset-backed and algorithmic mechanisms, located in BIS 2022 ch. III. Named issuer rights/reserves and dated market totals still need separate accepted records.' },
];

// Coordinator publication decision after scoped copy reviews in packages 02–04,
// package 08's exact conflict matrix and the accepted enacted-statute source.
export const acceptedCanonicalIds = Object.freeze([
  'fiat-money', 'legal-tender', 'petrodollar', 'triffin-dilemma',
  'unit-of-account', 'genius-act', 'stablecoin'
]);

export function canonicalGlossary(glossary) {
  const proposals = new Map(canonicalProposals.map(term => [term.id, term]));
  const accepted = new Set(acceptedCanonicalIds);
  const byId = new Map();
  for (const term of glossary) {
    const prior = byId.get(term.id);
    if (!prior) byId.set(term.id, { ...term, sources: [term.vol] });
    else prior.sources.push(term.vol);
  }
  return [...byId.values()].map(term => {
    const proposal = proposals.get(term.id);
    return proposal && accepted.has(term.id) ? { ...term, ...proposal, def: proposal.definition, review: 'accepted' } :
      { ...term, definition: term.def, aliases: [], example: '', related: [], chapters: [], topics: [], review: 'source-only' };
  }).sort((a, b) => a.term.localeCompare(b.term));
}
