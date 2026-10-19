export const HOME_COPY = {
  eyebrow: 'Gold → fiat → Bitcoin → Zcash',
  title: 'How money works—and why it keeps changing.',
  seoTitle: 'Gold, Fiat, Bitcoin & Zcash: How Money Works',
  socialTitle: 'Gold to Zcash',
  socialDescription: 'How money works, why it changes, and the trade-offs of gold, fiat, Bitcoin and Zcash.',
  lead: 'In many societies, money long meant weighed or stamped metal. Then governments tied their currencies to gold. On 15 August 1971 the United States closed the “gold window”, and the dollar stopped being convertible into gold—even for foreign governments. Bitcoin, launched after the 2008 crisis, offered money with no central issuer; Zcash added private payments. This library follows that story—and shows where each new money worked, and where it didn’t.',
  description: 'Explore gold, fiat money, Bitcoin and Zcash: how each system works, why money changes, and what it trades off. 58 documents with sources.',
  primaryCta: { href: '/arc/', label: 'Start the story' },
  secondaryCta: { href: '/gold/', label: 'or begin with Volume I, Gold' },
  journey: [
    {
      vol: 'gold', step: '01', label: 'Gold', href: '/gold/',
      title: 'How a metal became money',
      text: 'From ornament and weighed metal to stamped coins and the gold standards.',
    },
    {
      vol: 'after', step: '02', label: 'After Gold', href: '/after/',
      title: '1971: the gold promise breaks',
      text: 'Nixon closes the gold window, currencies float, and money rests on law and institutions.',
    },
    {
      vol: 'bitcoin', step: '03', label: 'Bitcoin', href: '/bitcoin/',
      title: 'Money without an issuer',
      text: 'What Bitcoin solved, how it is used, and what happened when countries adopted it.',
    },
    {
      vol: 'zcash', step: '04', label: 'Zcash', href: '/zcash/',
      title: 'Private digital cash',
      text: 'Payments that can be verified without publishing who paid whom, or how much.',
    },
  ],
  jobs: [
    ['Store of value', 'Keeps buying power over time.'],
    ['Medium of exchange', 'Pays for goods and services.'],
    ['Unit of account', 'States prices, wages and debts.'],
    ['Settlement asset', 'Settles debts between people, banks and governments.'],
  ],
  jobsNote: 'No money has to do all four jobs. To compare two kinds, ask what you actually hold, who owes you, and who controls the transfer.',
  faq: [
    {
      id: 'what-is-fiat-money',
      question: 'What is fiat money?',
      answer: 'Fiat money is a state-issued currency with no fixed legal promise to redeem it for a set weight of gold or any other commodity. People use it because of law, tax obligations, payment systems and confidence. Its issuer may still hold gold reserves.',
      href: '/glossary/#fiat-money',
      linkLabel: 'Glossary: fiat money',
    },
    {
      id: 'why-did-the-gold-standard-end',
      question: 'Why did the gold standard end?',
      answer: 'It ended in stages, not in one moment. Britain suspended gold conversion in September 1931 after a run on sterling drained its reserves. The United States suspended domestic dollar–gold conversion in 1933 after a banking crisis and gold outflows. On 15 August 1971 President Nixon closed the gold window, ending official conversion of foreign governments’ dollars at $35 an ounce.',
      href: '/gold/07-the-gold-standard-era-1717-1971/',
      linkLabel: 'Read: The Gold Standard Era, 1717–1971',
    },
    {
      id: 'did-bitcoin-legal-tender-work',
      question: 'Did making Bitcoin legal tender work in El Salvador?',
      answer: 'El Salvador’s 2021 Bitcoin Law required Bitcoin to be accepted alongside the US dollar. After the IMF urged it to narrow Bitcoin’s role, Decree 199 (January 2025) made private acceptance voluntary and ended Bitcoin tax payments. The law still says “curso legal”, but the IMF says it no longer has the essential features of legal tender. Whether payments, inclusion or public finances improved has not been shown with comparable measures.',
      href: '/bitcoin/04-countries-that-adopted-bitcoin-and-what-happened/',
      linkLabel: 'Read: Countries that adopted Bitcoin',
    },
    {
      id: 'what-is-zcash',
      question: 'What is Zcash, and where does it fit?',
      answer: 'Zcash is a public cryptocurrency network launched in October 2016; ZEC is its native unit. Shielded payments can be checked as valid without publicly revealing sender, recipient or amount—a real gain over a fully transparent ledger. Privacy alone does not make ZEC a unit for prices, wages or debts, and whether a ZEC economy could work is unproven.',
      href: '/zcash/02-what-zcash-is-and-what-is-live/',
      linkLabel: 'Read: What Zcash is, and what is live',
    },
  ],
  questions: [
    {
      href: '/gold/08-why-the-dollar-replaced-gold/',
      title: 'Why did the dollar outlast gold?',
      note: 'Reserves, trade, banks and oil · Gold, Chapter 8',
    },
    {
      href: '/after/01-the-break-1971-1976/',
      title: 'What changed when the gold window closed?',
      note: 'The Nixon shock and floating rates · After Gold, Chapter 1',
    },
    {
      href: '/bitcoin/02-what-bitcoin-solved-and-what-it-did-not/',
      title: 'What did Bitcoin actually solve?',
      note: 'Self-custody, validation and what’s still risky · Bitcoin, Chapter 2',
    },
    {
      href: '/zcash/02-what-zcash-is-and-what-is-live/',
      title: 'What does private digital cash change?',
      note: 'Shielded payments and what is live today · Zcash, Chapter 2',
    },
  ],
  compare: 'Cash is a promise from its issuer. A bank balance is a claim on your bank. Physical gold is an asset someone has to store. Self-custodied Bitcoin is only as safe as your keys. An exchange balance or a stablecoin adds one more company you have to trust.',
  evidence: 'Every chapter cites its sources. When a figure can’t yet be tied to an exact source, we leave it out rather than guess.',
  volumeQuestions: {
    gold: 'How did a metal become money, and what role does it still play?',
    after: 'What changed when the dollar’s link to gold ended in 1971?',
    bitcoin: 'What did Bitcoin solve, and where did adoption work or fail?',
    zcash: 'What can private ZEC payments do, and what is still unproven?',
  },
};

export const METHODS_COPY = {
  eyebrow: 'Research method',
  title: 'How this library is built and limited',
  description: 'How Money Research selects sources, records evidence, handles corrections and should be cited.',
  sections: [
    {
      id: 'scope',
      title: 'What this library is',
      paragraphs: [
        'The library contains 58 research documents in four volumes: gold, the post-1971 monetary system, Bitcoin and Zcash. Each chapter opens with a short answer and cites its sources. Dated observations are point-in-time figures, not live data.',
        'The shared Sources page brings together the four volume bibliographies. Some entries still need exact document and passage locations; inspect the linked material behind a claim.',
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
        'Accepted means the stated assertion and scope have supporting locators in the registry. Review means the wording is still being checked. Withheld means the figure or chart is not shown because the dataset, denominator or source location is not ready. Historical-arc quantitative charts remain withheld while their datasets are checked, and comparison cells without an accepted claim are shown as “not yet sourced”. Timeline rows link either to a checked chapter section or, where no chapter section has been checked, to the volume’s own source timeline; a row whose destination has not been reviewed says so.',
        'Short chapter answers are editor-approved conceptual summaries. They are separate from evidence sign-off for every figure in the chapter body. Chapter pages for which no short answer has been approved open with the chapter’s own first paragraph instead.',
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
      id: 'analytics',
      title: 'Analytics and privacy',
      paragraphs: [
        'Cloudflare Web Analytics measures visits, page views, referring sites and page performance, including Core Web Vitals. It does not use analytics cookies or track individual visitors across sites. Browser privacy tools and network failures can prevent measurements, so these reports are not a complete visitor count.',
        'Search Console separately reports Google search visibility and indexing. A page appearing in this library or its sitemap does not mean Google has indexed it.',
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
    { href: '/sources/', label: 'Sources and further reading →' },
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
    seoTitle: 'Timeline of money: from gold and coins to 1971, Bitcoin and Zcash',
    description: 'A timeline of money from the first gold objects to coins, the gold standard, the 1971 Nixon shock, Bitcoin and Zcash, linked to the chapters.',
    intro: 'Trace the moments that shaped money—from early coins and the gold standards to the 1971 Nixon shock, floating currencies, Bitcoin and Zcash—in one chronology.',
  },
  takeaways: {
    title: 'Explore the short answers',
    seoTitle: 'Short answers on gold, fiat money and Bitcoin, chapter by chapter',
    description: 'Short, sourced answers to the core question of each chapter: gold, the end of the gold standard, fiat currencies, Bitcoin and its adoption.',
    meta: 'Short answers from each chapter',
    intro: 'Each chapter starts from one question. Here are the short answers in one place; open a chapter for the full story and its sources.',
  },
  mechanics: {
    title: 'How money is created and moved',
    seoTitle: 'How banks create money: loans, payments, bonds and QE explained',
    description: 'How banks create money: four £100 examples showing a bank loan, an interbank payment, a new government bond and a QE asset purchase.',
  },
  compare: {
    title: 'Compare monetary arrangements by use',
    seoTitle: 'Gold vs cash vs bank deposits vs Bitcoin vs stablecoins',
    description: 'Gold vs cash vs bank deposits vs Bitcoin vs a dollar stablecoin: what each does for saving and paying, with sources, scope and limits.',
    lead: 'Pick a use and whose point of view you care about. Every filled cell is backed by a named source, with its scope and limits. An empty cell means we haven’t sourced that case yet—not that the answer is “no”.',
    pending: 'Not yet sourced',
    pendingNote: 'We haven’t attached a sourced claim for this use and point of view yet.',
  },
  arc: {
    title: 'Money keeps changing—usually under pressure.',
    seoTitle: 'History of money: from weighed metal to gold, fiat and Bitcoin',
    description: 'A short history of money in eleven stages: weighed metal, coins, the gold standard, Bretton Woods, the 1971 break, floating fiat currencies and Bitcoin.',
    eyebrow: 'History · eleven stages',
    intro: 'Traders in the ancient Near East weighed silver. Rulers stamped coins. Nations defined their currencies in gold. In 1971 official dollar–gold conversion ended, and since 2008 Bitcoin and dollar stablecoins have grown up alongside government money. Here are eleven stages in that story: what anchored money, who held power, what changed—and what we can’t say for sure. The stages overlap, and each covers particular places, not the whole world.',
  },
  glossary: {
    title: 'Glossary',
    seoTitle: 'Money glossary: fiat, gold standard, legal tender, Bitcoin, Zcash',
    description: 'Plain definitions of money terms used across the library: fiat money, the gold standard, legal tender, Bretton Woods, Bitcoin, Zcash and more.',
  },
  sources: {
    title: 'Sources and further reading',
    description: 'Combined bibliography and source locators from the Gold, After Gold, Bitcoin and Zcash research volumes.',
  },
};

export const VOLUME_COPY = {
  gold: {
    title: 'Gold',
    label: 'Vol. I · Gold',
    seoTitle: 'Gold as money: from the first coins to the gold standard',
    description: 'How gold became money: from ornament and weighed metal to coins, the gold standard and its end, plus what gold prices and reserves show in 2026.',
    intro: 'How did a metal become money? This volume follows gold from ornament and ritual to weighed metal, stamped coins and the gold standards—then asks why official gold conversion ended and what role gold still plays.',
  },
  after: {
    title: 'After Gold',
    label: 'Vol. II · After Gold',
    seoTitle: 'After the gold standard: fiat money from 1971 to 2026',
    description: 'Fiat money after 1971: the Nixon shock, floating currencies, oil shocks and inflation, debt and currency crises, QE, and reserve risk in the 2020s.',
    intro: 'On 15 August 1971 the United States stopped converting foreign governments’ dollars into gold. This volume follows what came next: floating currencies, oil shocks and inflation, debt and currency crises, the 2008 crash and QE, and the pandemic and sanctions of the 2020s.',
  },
  bitcoin: {
    title: 'Bitcoin',
    label: 'Vol. III · Bitcoin',
    seoTitle: 'Bitcoin as money: what it solved and where adoption failed',
    description: 'Bitcoin as money: what it solved, how it is used, El Salvador and other national adoptions, supply rules, and what still blocks everyday use.',
    intro: 'After the 2008 crisis, Bitcoin let anyone verify issuance and transfers without a central ledger operator. This volume asks what that actually solved, how Bitcoin is used, what happened when El Salvador and the Central African Republic adopted it, and what still stands in the way of it becoming everyday money.',
  },
  zcash: {
    title: 'Zcash',
    label: 'Vol. IV · Zcash',
    seoTitle: 'Zcash and private money: what ZEC can and cannot do',
    description: 'Zcash explained: shielded private payments, what is live in 2026, whether ZEC could price goods and wages, and the risks and open questions.',
    intro: 'Zcash adds privacy to digital cash: suitable shielded payments can be verified without putting who paid whom, and how much, on a public ledger. This volume asks what is live today, which problems that solves, whether ZEC could ever price goods and wages, and what could go wrong.',
  },
};

export const CRAWLER_POLICY = {
  search: 'Published HTML on indexable canonical URLs is intended for ordinary web search crawlers, subject to robots.txt, X-Robots-Tag on supporting files, and the host access policy. Preview deployments remain protected.',
  training: 'Access by model-training crawlers is not granted by the search-crawler allow rule and is not inferred from it. Training access follows the host policy in force; this file does not add a separate training-only corpus or bot-only claims.',
};

export const CITATION_FORMAT = 'Money Research, “[page title],” [canonical URL]. Use the page’s verified dates when present; otherwise cite the URL and access date. Public names, roles and a contact address are omitted by preference.';
