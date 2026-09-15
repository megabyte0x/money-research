// Discovery metadata is keyed by stable manifest IDs. No view guesses a role
// from a slug or a leading file number.
const REFERENCE_IDS = new Map([
  ...Object.entries({
    gold: { timeline: '10', glossary: '11', sources: '12' },
    after: { timeline: '11', glossary: '12', sources: '13' },
    bitcoin: { timeline: '14', glossary: '15', sources: '16' },
    zcash: { timeline: '15', glossary: '16', sources: '17' },
  }).flatMap(([vol, refs]) => [
    [`${vol}-00`, 'directory'],
    [`${vol}-${refs.timeline}`, 'timeline'],
    [`${vol}-${refs.glossary}`, 'glossary'],
    [`${vol}-${refs.sources}`, 'sources'],
  ]),
  ['after-10', 'reference'],
  ['zcash-18', 'reference'],
]);

const TOPICS = {
  'gold-01': ['metal', 'origins'], 'gold-02': ['history', 'origins'],
  'gold-03': ['money basics', 'history'], 'gold-04': ['money basics', 'value'],
  'gold-05': ['monetary rules', 'history'], 'gold-06': ['history', 'institutions'],
  'gold-07': ['monetary rules', 'crises'], 'gold-08': ['dollar', 'monetary rules'],
  'gold-09': ['value', 'reserves'],
  'after-01': ['1971', 'monetary rules'], 'after-02': ['inflation', 'dollar'],
  'after-03': ['crises', 'dollar'], 'after-04': ['currency', 'institutions'],
  'after-05': ['crises', 'globalization'], 'after-06': ['war', 'institutions'],
  'after-07': ['crises', 'money creation'], 'after-08': ['payments', 'money basics'],
  'after-09': ['inflation', 'reserves'],
  'bitcoin-01': ['origins', 'monetary rules'], 'bitcoin-02': ['payments', 'value'],
  'bitcoin-03': ['adoption', 'value'], 'bitcoin-04': ['adoption', 'law'],
  'bitcoin-05': ['comparison', 'monetary rules'], 'bitcoin-06': ['law', 'institutions'],
  'bitcoin-07': ['monetary rules', 'money basics'], 'bitcoin-08': ['comparison', 'value'],
  'bitcoin-09': ['control', 'institutions'], 'bitcoin-10': ['institutions', 'adoption'],
  'bitcoin-11': ['crises', 'payments'], 'bitcoin-12': ['crises', 'safeguards'],
  'bitcoin-13': ['comparison', 'money basics'],
  'zcash-01': ['history', 'money basics'], 'zcash-02': ['payments', 'privacy'],
  'zcash-03': ['payments', 'adoption'], 'zcash-04': ['privacy', 'value'],
  'zcash-05': ['unit of account', 'adoption'], 'zcash-06': ['money basics', 'crises'],
  'zcash-07': ['adoption', 'law'], 'zcash-08': ['adoption', 'monetary rules'],
  'zcash-09': ['comparison', 'history'], 'zcash-10': ['safeguards', 'institutions'],
  'zcash-11': ['adoption', 'institutions'], 'zcash-12': ['adoption', 'money basics'],
  'zcash-13': ['crises', 'safeguards'], 'zcash-14': ['adoption', 'research'],
};

export function contentRole(article) {
  return REFERENCE_IDS.get(article.id) || 'topic';
}

export function shortTitle(article) {
  return article.title.replace(/^\d+\s+—\s+/, '').replace(/\s+—\s+Research Directory$/, '');
}

export function researchCatalog(manifest) {
  return manifest.map(article => ({
    article, id: article.id, role: contentRole(article), title: shortTitle(article),
    topics: TOPICS[article.id] || [], mins: Math.max(1, Math.round(article.words / 230)),
  }));
}

// This is a browseable set of editor-approved chapter answers, not a new
// cross-volume conclusion. The shared metadata owns the editorial status.
export function approvedSummaryCatalog(manifest, articleMetadata) {
  // Raw registry arrays carry an explicit editorial status. The generated
  // content model has already enforced it and publishes an ID-keyed object
  // with only { summary, nextSteps }.
  const raw = Array.isArray(articleMetadata);
  const byId = raw
    ? new Map(articleMetadata.filter(record => record?.status === 'approved' && record.id).map(record => [record.id, record]))
    : new Map(Object.entries(articleMetadata || {}).filter(([, record]) =>
      record && typeof record === 'object' && Array.isArray(record.nextSteps) &&
      (record.status === undefined || record.status === 'approved')));
  return researchCatalog(manifest).flatMap(row => {
    const record = byId.get(row.id);
    const summary = record?.summary;
    if (!summary?.answer) return [];
    return [{ ...row, summary }];
  });
}

// Topic chapters with an actual takeaway section are eligible, including
// Bitcoin 10–13. Editors still decide which summaries can be published.
export function takeawayCandidates(manifest, blocks) {
  return researchCatalog(manifest).filter(item => item.role === 'topic' &&
    (blocks[item.article.slug + '@' + item.article.vol] || []).some(block =>
      block.type === 'h2' && /takeaways?|conclusion/i.test(block.text)));
}

const PATHS = [
  {
    id: 'money-basics', title: 'Money basics',
    outcome: 'Distinguish a unit of account, a payment medium and an asset people hold.',
    steps: ['gold-03', 'gold-04', 'after-08', 'bitcoin-02'],
    branches: [{ id: 'bitcoin-07', why: 'Explore what it would take to denominate an economy in bitcoin.' }],
  },
  {
    id: 'why-1971-mattered', title: 'Why 1971 mattered',
    outcome: 'Trace the break in official gold conversion and the rules that followed.',
    steps: ['gold-07', 'gold-08', 'after-01', 'after-02'],
    branches: [{ id: 'after-07', why: 'Continue to crisis response and quantitative easing.' }],
  },
  {
    id: 'gold-versus-bitcoin', title: 'Gold versus Bitcoin',
    outcome: 'Compare monetary roles and the limits of each proposed standard.',
    steps: ['gold-04', 'gold-09', 'bitcoin-08', 'bitcoin-13'],
    branches: [{ id: 'bitcoin-07', why: 'Examine the supply and denomination question in more detail.' }],
  },
  {
    id: 'who-controls-money', title: 'Who controls money',
    outcome: 'Identify where rule changes, custody and monetary discretion sit.',
    steps: ['gold-06', 'after-07', 'bitcoin-01', 'bitcoin-09'],
    branches: [{ id: 'bitcoin-10', why: 'See the choices available to large economies.' }],
  },
  {
    id: 'crises-and-safeguards', title: 'Crises and safeguards',
    outcome: 'Compare crisis mechanisms and the institutions that may contain them.',
    steps: ['gold-07', 'after-03', 'after-07', 'bitcoin-12'],
    branches: [{ id: 'bitcoin-11', why: 'Review the barriers to Bitcoin as a global currency.' }],
  },
];

export function learningPaths(manifest) {
  const byId = new Map(manifest.map(article => [article.id, article]));
  return PATHS.map(path => {
    const stepArticles = path.steps.map(id => byId.get(id));
    const branchArticles = path.branches.map(branch => byId.get(branch.id));
    if ([...stepArticles, ...branchArticles].some(article => !article)) {
      throw new Error(`Path ${path.id} refers to a missing article`);
    }
    return {
      ...path,
      minutes: Math.max(1, Math.round(stepArticles.reduce((sum, article) => sum + article.words, 0) / 230)),
      steps: stepArticles,
      branches: path.branches.map((branch, i) => ({ ...branch, article: branchArticles[i] })),
    };
  });
}
