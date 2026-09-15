export const HOME_COPY = {
  eyebrow: 'An evidence-led guide · three research volumes',
  title: 'How money works—and why it changes.',
  lead: 'Explore gold, government currencies and Bitcoin through history, evidence and the trade-offs between saving, paying, pricing and settling.',
  description: 'An evidence-led research library on gold, post-1971 currencies and Bitcoin. Forty-four documents compare how money is issued, held, transferred and limited, with source locators and open editorial notices.',
  jobs: [
    ['Store of value', 'Carries purchasing power through time.'],
    ['Medium of exchange', 'Helps people pay for goods and services.'],
    ['Unit of account', 'States prices, wages and debts.'],
    ['Settlement asset', 'Discharges an obligation between parties or institutions.'],
  ],
  questions: [
    {
      href: '/gold/08-why-the-dollar-replaced-gold/',
      title: 'Why did gold lose its monetary role?',
      note: 'Convertibility, crisis and the dollar network · Vol. I',
    },
    {
      href: '/after/01-the-break-1971-1976/',
      title: 'What supports money today?',
      note: 'Institutions, bank liabilities and acceptance · Vol. II',
    },
    {
      href: '/bitcoin/02-what-bitcoin-solved-and-what-it-did-not/',
      title: 'What did Bitcoin solve?',
      note: 'Transfer rules, custody and remaining risks · Vol. III',
    },
  ],
  volumeQuestions: {
    gold: 'How did a metal become money and what role remains?',
    after: 'What changed when official gold conversion ended?',
    bitcoin: 'What did Bitcoin solve and what remains unsettled?',
  },
};

export const METHODS_COPY = {
  eyebrow: 'Research method',
  title: 'How this library is built and limited',
  description: 'Money Research explains its source selection, evidence statuses, correction practice, citation format and crawler policy. Names, roles and a public contact are omitted by preference; that is a trust limitation, not a completed attribution page.',
  sections: [
    {
      id: 'scope',
      title: 'What this library is',
      paragraphs: [
        'The library contains 44 research documents in three volumes: gold, the post-1971 monetary system, and Bitcoin. It presents their arguments while historical, legal and market claims remain under editorial review. Dated observations are not live figures, and a passing site build does not certify every chapter.',
        'Each volume has a source page. Some entries still need exact document and passage locations; follow the links on those pages to inspect the material behind a claim.',
      ],
    },
    {
      id: 'process',
      title: 'Research process and source selection',
      paragraphs: [
        'Topic chapters start from the supplied research notes. An evidence registry records sources, claims and dated observations. A claim is published as accepted only with a review state, at least one supporting locator, a reviewer label and a review date. Observations must match an accepted claim’s source and locator. Unverified or contradictory figures are withheld rather than averaged.',
        'Primary documents, official statistics and operator documentation are preferred for magnitudes, legal status and process descriptions. Staff papers and secondary accounts are labeled as such. Comparison cells appear only when an accepted claim and a reachable locator have been attached; empty cells are unknown here, not negative scores.',
      ],
    },
    {
      id: 'statuses',
      title: 'Evidence statuses and withheld material',
      paragraphs: [
        'Accepted means the stated assertion and scope have supporting locators in the registry. Review means the wording is still being checked. Withheld means the figure or chart is not shown because the dataset, denominator or source location is not ready. Historical-arc quantitative charts remain withheld. Timeline rows distinguish checked chapter sections, reviewed source-timeline fallbacks, and destinations still pending.',
        'Short chapter answers are editor-approved conceptual summaries. They are separate from evidence sign-off for every figure in the chapter body.',
      ],
    },
    {
      id: 'corrections',
      title: 'Corrections and updates',
      paragraphs: [
        'Substantive revisions should identify the affected chapter and passage so readers can distinguish updated claims from earlier wording. There is no public names, roles or corrections-contact page; that omission is a known trust limitation, not a substitute contact address.',
      ],
    },
    {
      id: 'citation',
      title: 'Preferred citation',
      paragraphs: [
        'Money Research, “[page title],” [canonical URL]. Use a verified publication or modification date when the page records one; otherwise cite the URL and the date you accessed it. Reuse terms have not been published because a license has not been clarified by the owner.',
      ],
    },
    {
      id: 'crawlers',
      title: 'Search crawlers and training crawlers',
      paragraphs: [
        'Published HTML on indexable canonical URLs is intended for ordinary web search crawlers, subject to robots.txt, X-Robots-Tag on raw Markdown and JSON, and the host access policy. Preview deployments stay protected.',
        'Access by model-training crawlers is not granted by the search-crawler allow rule and must not be inferred from it. This site does not add a second full-text corpus or bot-only claims.',
      ],
    },
  ],
  sourceLinks: [
    { href: '/gold/12-sources/', label: 'Gold source page →' },
    { href: '/after/13-sources/', label: 'After Gold source page →' },
    { href: '/bitcoin/16-sources/', label: 'Bitcoin source page →' },
  ],
};

export const SEARCH_COPY = {
  title: 'Search the research',
  description: 'Interactive search across Money Research chapters and glossary terms. Query pages are utilities and are not offered for indexing.',
};

export const NOT_FOUND_COPY = {
  title: 'Page not found',
  description: 'This address is not a Money Research page. The research library, volume hubs and methods page remain available from the homepage.',
};

export const DISCOVERY_COPY = {
  timeline: {
    title: 'A connected monetary timeline',
    description: 'Events from the gold, after-gold and Bitcoin volumes in one chronological view. Dates, quantities and some destinations remain under editorial review.',
  },
  takeaways: {
    title: 'Explore the short answers',
    description: 'Editor-approved chapter answers from Money Research, each kept in its own scope with evidence limits and links to the full chapter.',
  },
  mechanics: {
    title: 'How money is created and moved',
    description: 'Four stylised £100 transactions distinguishing a bank loan, an interbank payment, a new government bond and a central-bank asset purchase.',
  },
  compare: {
    title: 'Compare monetary arrangements by use',
    description: 'A qualitative comparison of gold, cash, bank deposits, Bitcoin and a dollar stablecoin. Claims appear only with accepted sources, scope and limits.',
  },
  arc: {
    title: 'Monetary arrangements overlap and change under pressure.',
    description: 'Eleven selected monetary arrangements from weighed metal to Bitcoin and dollar stablecoins, with scope limits and withheld quantitative charts.',
  },
  glossary: {
    title: 'Glossary',
    description: 'Definitions used across the Money Research volumes, with accepted cores, illustrations and links to related chapters where those have been reviewed.',
  },
};

export const VOLUME_COPY = {
  gold: {
    title: 'Gold',
    label: 'Vol. I · Gold',
    description: 'Gold volume hub: how a metal became money, how convertibility ended, and what 2026 prices and reserve shares can and cannot establish.',
  },
  after: {
    title: 'After Gold',
    label: 'Vol. II · After Gold',
    description: 'After Gold volume hub: floating currencies, oil shocks, crises, bank credit, payments innovation and reserve-access risk after 1971.',
  },
  bitcoin: {
    title: 'Bitcoin',
    label: 'Vol. III · Bitcoin',
    description: 'Bitcoin volume hub: independent validation, custody, country acts, supply rules and the evidence still required for saving, paying or institutional use.',
  },
};

export const CRAWLER_POLICY = {
  search: 'Published HTML on indexable canonical URLs is intended for ordinary web search crawlers, subject to robots.txt, X-Robots-Tag on supporting files, and the host access policy. Preview deployments remain protected.',
  training: 'Access by model-training crawlers is not granted by the search-crawler allow rule and is not inferred from it. Training access follows the host policy in force; this file does not add a separate training-only corpus or bot-only claims.',
};

export const CITATION_FORMAT = 'Money Research, “[page title],” [canonical URL]. Use the page’s verified dates when present; otherwise cite the URL and access date. Public names, roles and a contact address are omitted by preference.';
