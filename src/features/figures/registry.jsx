import React from 'react';
import { Figure, Sequence, Periods, Columns, Pairs, Layers, Scopes, reveal } from './kit.jsx';

// One figure per page at most, placed beside the passage it explains.
// Figures are conceptual: every label restates the chapter's own wording, dates or
// protocol rules. They add no new figures, so the evidence rules for charts still apply.
//
// Placement: `section` is the h2 id the figure belongs to (null = before the first h2);
// `after` is a substring of the block after which to insert it (default: first block).

const sec = id => '#' + id;

function GoldOrigin() {
  return <Figure vol="gold" label="Figure · origin" title="From star to streambed: why gold was found so early"
    note="Summarises the current scientific consensus as described in this chapter; the cosmic origin is an inference, not a settled count.">
    <Sequence items={[
      { title: 'Forged in violent stellar events', text: 'Mostly neutron-star mergers, possibly some supernovae; ordinary stars cannot make it.' },
      { title: 'Sinks, then arrives again', text: 'Earth’s original gold sank into the iron core; reachable gold is thought to be a later meteoritic delivery.' },
      { title: 'Lode gold', text: 'Locked in quartz veins where hot mineral-rich water cooled. It has to be dug and crushed.' },
      { title: 'Placer gold', text: 'Eroded into streams as dust, flakes and nuggets. A pan or basket is enough; no smelting needed.' },
    ]} />
  </Figure>;
}

function GoldStages() {
  return <Figure vol="gold" label="Figure · four stages" title="From weighed metal to stamped coin"
    note="Dates are approximate; the date of the earliest coins is debated.">
    <Sequence items={[
      { date: 'c. 3000–650 BCE', title: 'Metal by weight', text: 'Rings, bars, dust and cut silver, weighed on a scale and tested for purity.', href: sec('stage-one-metal-by-weight-c-3000-650-bce') },
      { date: 'c. 650–550 BCE', title: 'The stamped coin', text: 'Lydian electrum with an issuer’s mark: less weighing, but uncertain gold content.', href: sec('stage-two-the-invention-of-the-coin-c-650-550-bce') },
      { date: 'c. 550 BCE', title: 'Gold split from silver', text: 'Croesus refines electrum into separate gold and silver issues.', href: sec('stage-three-croesus-separates-gold-from-silver-c-550-bce') },
      { date: '550–300 BCE', title: 'Coinage spreads', text: 'Persian darics, Greek silver, Macedonian gold; later India and China.', href: sec('stage-four-coinage-spreads-550-300-bce') },
    ]} />
  </Figure>;
}

function Gresham() {
  return <Figure vol="gold" label="Figure · Gresham’s law" title="Why a fixed mint ratio kept failing"
    note="Mechanism and US examples as given in this chapter; exact statutory locators are still being attached.">
    <Sequence items={[
      { title: 'The mint fixes a legal ratio', text: 'e.g. 15 ounces of silver to 1 of gold.' },
      { title: 'The market ratio moves', text: 'New mines and shifting trade change what each metal is worth.' },
      { title: 'The undervalued metal leaves', text: 'Worth more as bullion abroad than as coin at home, it is exported or melted.' },
      { title: 'The overvalued metal circulates', text: '“Bad money drives out good.”' },
    ]} />
    <div className="fig-split" style={{ marginTop: 18 }}>
      <div className="fig-panel" {...reveal(5)}><h4>United States, 1792 · 15:1</h4><p>The legal ratio undervalued gold.</p><ul><li>Gold coins disappeared from circulation.</li><li><b>Effectively on silver.</b></li></ul></div>
      <div className="fig-panel is-acc" {...reveal(6)}><h4>United States, 1834 · 16:1</h4><p>The legal ratio overvalued gold.</p><ul><li>After the Californian discoveries of 1848, silver coins disappeared.</li><li><b>Effectively on gold.</b></li></ul></div>
    </div>
  </Figure>;
}

function GoldSettings() {
  const rows = [
    ['Egypt', 'c. 3000–30 BCE', -3000, -30, 'egypt-c-3000-30-bce'],
    ['Mesopotamia and the Levant', 'c. 3000–500 BCE', -3000, -500, 'mesopotamia-and-the-levant-c-3000-500-bce'],
    ['Lydia and Persia', 'c. 650–330 BCE', -650, -330, 'lydia-and-persia-c-650-330-bce'],
    ['Greece and the Hellenistic world', 'c. 600–30 BCE', -600, -30, 'greece-and-the-hellenistic-world-c-600-30-bce'],
    ['Rome', 'c. 300 BCE–476 CE', -300, 476, 'rome-c-300-bce-476-ce'],
    ['Byzantium', '330–1453', 330, 1453, 'byzantium-330-1453'],
    ['Islamic caliphate', '7th–13th centuries', 600, 1300, 'the-islamic-caliphate-7th-13th-centuries'],
    ['West Africa: Ghana, Mali, Songhai', '8th–16th centuries', 700, 1600, 'west-africa-ghana-mali-and-songhai-8th-16th-centuries'],
    ['Medieval Europe', 'c. 500–1500', 500, 1500, 'medieval-europe-c-500-1500'],
    ['India', 'c. 600 BCE–1947', -600, 1947, 'india-c-600-bce-1947'],
    ['China', 'c. 1000 BCE–1935', -1000, 1935, 'china-c-1000-bce-1935'],
    ['Spain and the Americas', '1492–1800', 1492, 1800, 'spain-and-the-americas-1492-1800'],
    ['Japan', '1600–1870', 1600, 1870, 'japan-1600-1870'],
  ];
  return <Figure vol="gold" label="Figure · periods" title="Thirteen settings across five thousand years"
    note="Each bar is the period its section covers, not the lifespan of a state. Many start dates are approximate.">
    <Periods scale={[[-3000, 0], [2000, 1]]}
      ticks={[[-3000, '3000 BCE'], [-1000, '1000 BCE'], [0, '1 CE'], [1000, '1000'], [2000, '2000']]}
      rows={rows.map(([label, range, start, end, id]) => ({ label, range, start, end, href: sec(id) }))} />
  </Figure>;
}

function GoldStandardEra() {
  return <Figure vol="gold" label="Figure · phases" title="The gold standard era in six phases"
    note="Bars follow this chapter’s section headings. 1717 and 1971 are single events.">
    <Periods scale={[[1700, 0], [1975, 1]]}
      ticks={[[1700, '1700'], [1750, '1750'], [1800, '1800'], [1850, '1850'], [1900, '1900'], [1950, '1950']]}
      rows={[
        { label: 'Newton’s mint rate', range: '1717', start: 1716, end: 1719, href: sec('newton-s-accident-1717') },
        { label: 'The gold rushes', range: '1848–1900', start: 1848, end: 1900, href: sec('the-gold-rushes-1848-1900') },
        { label: 'Classical gold standard', range: '1871–1914', start: 1871, end: 1914, href: sec('the-classical-gold-standard-1871-1914') },
        { label: 'The wars break it', range: '1914–1944', start: 1914, end: 1944, href: sec('the-wars-break-it-1914-1944') },
        { label: 'Bretton Woods', range: '1944–1971', start: 1944, end: 1971, href: sec('bretton-woods-1944-1971') },
        { label: 'The Nixon shock', range: '15 August 1971', start: 1970, end: 1973, href: sec('the-nixon-shock-15-august-1971') },
      ]} />
  </Figure>;
}

function DollarProxy() {
  return <Figure vol="gold" label="Figure · before and after" title="What tied currencies together, before and after 1971"
    note="Simplified. Conversion at $35 was open to foreign monetary authorities only. The IMF’s Second Amendment (1978) abolished the official gold price; it did not stop central banks holding gold.">
    <div className="fig-split">
      <div className="fig-panel" {...reveal(0)}>
        <h4>Bretton Woods · 1944–1971</h4>
        <div className="fig-chain">
          <div className="fig-box is-acc">Gold<small>official anchor</small></div>
          <div className="fig-arrow is-up">$35 per fine ounce, for foreign monetary authorities</div>
          <div className="fig-box">US dollar<small>also held as reserves</small></div>
          <div className="fig-arrow is-up">adjustable parities within IMF margins</div>
          <div className="fig-box">Other currencies</div>
        </div>
      </div>
      <div className="fig-panel" {...reveal(1)}>
        <h4>After 1973 · floating</h4>
        <div className="fig-chain">
          <div className="fig-box is-dash">Gold<small>a reserve asset; no official conversion price</small></div>
          <div className="fig-arrow is-cut">convertibility suspended 15 August 1971</div>
          <div className="fig-box">US dollar<small>central to reserves, invoicing, banking and payments</small></div>
          <div className="fig-arrow is-both"><i />market rates; members may choose pegs or floats</div>
          <div className="fig-box">Other currencies</div>
        </div>
      </div>
    </div>
  </Figure>;
}

function TheBreak() {
  return <Figure vol="after" label="Figure · sequence" title="From the closed gold window to legal floating"
    note="Dates as given in this chapter. The sequence does not prove a single cause.">
    <Sequence items={[
      { date: '15 Aug 1971', title: 'Gold window closed', text: 'Official dollar–gold conversion suspended.', href: sec('what-actually-happened-on-15-august-1971') },
      { date: 'Dec 1971', title: 'Smithsonian', text: 'Realignment; official price $38; bands widen to ±2.25%.', href: sec('the-smithsonian-agreement-december-1971') },
      { date: 'Apr 1972', title: 'European “snake”', text: 'Narrower bands among Community currencies.', href: sec('europe-tries-to-keep-fixed-rates-among-itself') },
      { date: 'Feb–Mar 1973', title: 'Major currencies float', text: 'A second devaluation, then widespread floating.' },
      { date: 'Jan 1976', title: 'Jamaica', text: 'IMF members agree to legalise chosen arrangements.', href: sec('legalising-the-accident-the-jamaica-accords-1976') },
      { date: '1 Apr 1978', title: 'Second Amendment', text: 'In force: gold removed as the IMF’s common denominator.' },
    ]} />
  </Figure>;
}

function Recycling() {
  const steps = [
    ['Oil importers', 'pay for oil, commonly invoiced in dollars'],
    ['Oil exporters', 'deposit or invest part of their receipts'],
    ['Banks and dollar assets', 'lend part of those funds'],
    ['Importing countries', 'borrow, and buy more oil'],
  ];
  return <Figure vol="after" label="Figure · recycling loop" title="Petrodollars: invoicing and recycling, not redemption"
    note="Amounts and channels need a period-specific dataset; this shows the circuit, not its size.">
    <div className="fig-loop" role="img" aria-label={'A loop: ' + steps.map(s => s[0] + ' ' + s[1]).join(', then ') + ', back to the start.'}>
      <div className="fig-loop-ring" aria-hidden="true"><i className="is-top" /><i className="is-right" /><i className="is-bottom" /><i className="is-left" /></div>
      {steps.map(([who, what], i) => <div key={who} className={`fig-loop-node fig-loop-${i}`} {...reveal(i + 1)}><strong>{who}</strong><span>{what}</span></div>)}
      <div className="fig-loop-center" {...reveal(6)}>Unlike Bretton Woods gold, <b>no fixed quantity of oil</b> could be claimed from the US issuer for a dollar.</div>
    </div>
  </Figure>;
}

function Trilemma() {
  return <Figure vol="after" label="Figure · the trilemma" title="The impossible trinity: any two, not all three"
    note="A rough consensus drawn from the 1990s crises, as this chapter describes it; real regimes sit between the corners.">
    <svg className="fig-svg-narrow" viewBox="-10 0 420 336" role="img" aria-label="Triangle with corners fixed exchange rate, free capital movement and independent monetary policy. Gold standard: fixed rate and free capital, giving up independent policy. Large economies after 1971: free capital and independent policy, giving up fixed rates. Fixed rates with independent policy require capital controls. The 1990s crisis countries tried to keep all three.">
      <polygon className="s-fg fig-draw" pathLength="1" points="200,44 60,256 340,256" />
      <g className="fig-pop" style={{ '--i': 3 }}><circle className="f-acc" cx="200" cy="44" r="5" /><text x="200" y="26" textAnchor="middle" fontSize="12.5" className="t-acc">Fixed exchange rate</text></g>
      <g className="fig-pop" style={{ '--i': 4 }}><circle className="f-acc" cx="60" cy="256" r="5" /><text x="60" y="278" textAnchor="middle" fontSize="12.5" className="t-acc">Free capital</text><text x="60" y="293" textAnchor="middle" fontSize="12.5" className="t-acc">movement</text></g>
      <g className="fig-pop" style={{ '--i': 5 }}><circle className="f-acc" cx="340" cy="256" r="5" /><text x="340" y="278" textAnchor="middle" fontSize="12.5" className="t-acc">Independent</text><text x="340" y="293" textAnchor="middle" fontSize="12.5" className="t-acc">monetary policy</text></g>
      <g className="fig-pop" style={{ '--i': 8 }}>
        <text x="118" y="146" textAnchor="end" fontSize="11.5">Gold standard</text>
        <text x="118" y="161" textAnchor="end" fontSize="10" className="t-mut">gave up policy</text>
        <text x="282" y="146" fontSize="11.5">Capital controls</text>
        <text x="282" y="161" fontSize="10" className="t-mut">gave up free capital</text>
        <text x="200" y="316" textAnchor="middle" fontSize="11.5">Large economies after 1971</text>
        <text x="200" y="331" textAnchor="middle" fontSize="10" className="t-mut">gave up fixed rates</text>
      </g>
      <g className="fig-pop" style={{ '--i': 11 }}>
        <circle cx="200" cy="186" r="40" className="s-acc" strokeDasharray="3 3" />
        <text x="200" y="183" textAnchor="middle" fontSize="10.5" className="t-acc">all three?</text>
        <text x="200" y="197" textAnchor="middle" fontSize="9.5" className="t-mut">1990s crises</text>
      </g>
    </svg>
  </Figure>;
}

function Dematerialised() {
  return <Figure vol="after" label="Figure · six innovations" title="Six innovations, six different kinds of claim"
    note="Parallel developments, not a shared cause: the legal promise behind a claim and the technology that moves it are separate questions.">
    <Sequence items={[
      { date: '1972–2000', title: 'Derivatives', text: 'Hedging the currency risk that floating rates changed.', href: sec('managing-the-new-risks-derivatives-1972-2000') },
      { date: '1973–2023', title: 'Swift to real-time', text: 'A message is not itself a transfer of funds.', href: sec('moving-money-from-swift-to-real-time-payments-1973-2023') },
      { date: '2003–04', title: 'Gold ETFs', text: 'A security linked to vaulted gold.', href: sec('financialising-gold-the-etf-2003-04') },
      { date: '2008', title: 'Bitcoin', text: 'Money without an issuer.', href: sec('money-without-an-issuer-bitcoin-2008') },
      { date: '2014', title: 'Stablecoins', text: 'Private tokens tracking the dollar.', href: sec('the-digital-dollar-by-accident-stablecoins-2014') },
      { date: '2020', title: 'CBDCs', text: 'The state’s answer.', href: sec('the-state-s-answer-central-bank-digital-currencies-2020') },
    ]} />
  </Figure>;
}

function Halvings() {
  const epochs = [['2009', 50], ['Nov 2012', 25], ['Jul 2016', 12.5], ['May 2020', 6.25], ['Apr 2024', 3.125]];
  const W = 420, H = 210, x0 = 34, y0 = 170, top = 22, step = (W - x0 - 46) / epochs.length;
  const y = v => y0 - (v / 50) * (y0 - top);
  const path = epochs.map(([, v], i) => `${i ? 'L' : 'M'}${x0 + i * step},${y(v)} H${x0 + (i + 1) * step}`).join(' ');
  return <Figure vol="bitcoin" label="Figure · issuance rule" title="The subsidy halves every 210,000 blocks"
    note="New coins permitted per block under the validity rules. Scheduled issuance approaches 21 million; actual issued and spendable supply are different measures.">
    <svg className="fig-svg-narrow" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={'Block subsidy: ' + epochs.map(([d, v]) => `${v} BTC from ${d}`).join(', ') + ', halving toward zero.'}>
      <line className="s-rule" x1={x0} y1={y0} x2={W - 10} y2={y0} />
      <line className="s-rule" x1={x0} y1={top - 6} x2={x0} y2={y0} />
      {epochs.map(([d, v], i) => <rect key={d} className="fig-halving-bar" style={{ '--i': i + 2 }} x={x0 + i * step + 1} y={y(v)} width={step - 2} height={y0 - y(v)} />)}
      <path d={path} className="s-acc fig-draw" pathLength="1" strokeWidth="2" />
      <path d={`M${x0 + epochs.length * step},${y(1.5625)} H${W - 12}`} className="s-acc fig-pop" strokeDasharray="3 4" style={{ '--i': 8 }} />
      {epochs.map(([d, v], i) => <g key={'l' + d} className="fig-pop" style={{ '--i': i + 3 }}>
        <text x={x0 + i * step + step / 2} y={Math.min(y(v) - 7, y0 - 18)} textAnchor="middle" fontSize="12" className="t-acc">{v}</text>
        <text x={x0 + i * step + step / 2} y={y0 + 16} textAnchor="middle" fontSize="10" className="t-mut">{d}</text>
      </g>)}
      <text x={x0 - 6} y={top + 2} textAnchor="end" fontSize="9" className="t-mut">BTC</text>
      <text x={W - 12} y={y(1.5625) - 8} textAnchor="end" fontSize="9.5" className="t-mut fig-pop" style={{ '--i': 9 }}>→ 0</text>
    </svg>
  </Figure>;
}

function Scorecard() {
  const item = (text, id) => ({ text, href: sec(id) });
  return <Figure vol="bitcoin" label="Figure · scorecard" title="Bitcoin’s claims, tested against use"
    note="Grouped exactly as this chapter groups them. Each item links to its paragraph’s section.">
    <Columns groups={[
      { label: 'Solved and demonstrated', tone: 'strong', items: ['Settlement without a central operator', 'Auditable issuance rules', 'Resistance to account-level freezing', 'Cross-border transfer without a correspondent-bank message', 'A portable bearer asset, with practical limits'].map(t => item(t, 'solved-and-demonstrated')) },
      { label: 'In principle, not in practice', tone: 'mid', items: ['Cheap remittances', 'Inflation protection', 'Financial inclusion', 'Payments'].map(t => item(t, 'solved-in-principle-not-in-practice')) },
      { label: 'Not solved', tone: 'weak', items: ['Price stability', 'Reversibility and consumer protection', 'Credit', 'Custody', 'Scale'].map(t => item(t, 'not-solved')) },
    ]} />
  </Figure>;
}

function AdoptionForms() {
  return <Figure vol="bitcoin" label="Figure · four meanings" title="Four different things a state’s “adoption” can mean"
    note="Examples from this chapter’s summary table. None of these by itself makes Bitcoin a national unit of account.">
    <Columns groups={[
      { label: 'Payments law', tone: 'strong', sub: 'Require or permit Bitcoin payments', items: [{ text: 'El Salvador', note: '2021 mandatory acceptance → 2025 voluntary' }, { text: 'Central African Republic', note: 'reported 2022–23 experiment, ended' }] },
      { label: 'Public asset', tone: 'strong', sub: 'Hold it on a public balance sheet', items: [{ text: 'United States', note: 'reserve of finally forfeited bitcoin, 2025' }, { text: 'Czech central bank', note: 'test portfolio outside reserves' }] },
      { label: 'Mining', tone: 'mid', sub: 'Produce it with state-linked capacity', items: [{ text: 'Bhutan', note: 'state-linked mining, documented 2023' }] },
      { label: 'Regulation', tone: 'weak', sub: 'License private services around it', items: [{ text: 'Japan', note: 'private market; proposed tax changes' }] },
    ]} />
  </Figure>;
}

function LegalTenderGap() {
  return <Figure vol="bitcoin" label="Figure · difficulty" title="What is still missing, from easiest to hardest"
    note="Order follows this chapter’s conclusion. El Salvador changed the first layer by statute twice, in 2021 and 2025.">
    <Layers taper={false} layers={[
      { label: 'Can be changed by statute', text: 'Tax, accounting and acceptance rules.', tag: 'law', tone: 'weak' },
      { label: 'Can be built', text: 'Payment infrastructure and custody.', tag: 'investment, time', tone: 'mid' },
      { label: 'Cannot be legislated', text: 'Price stability, an elastic credit system, and a population that chooses to use it.', tag: 'law alone cannot', tone: 'strong' },
    ]} />
  </Figure>;
}

function Control() {
  return <Figure vol="bitcoin" label="Figure · control" title="Who controls the rules is not who controls the market"
    note="Coin ownership gives no vote over protocol validity; ownership and infrastructure can give influence over flows and access.">
    <div className="fig-split">
      <div className="fig-panel is-acc" {...reveal(0)}>
        <h4>The rules</h4>
        <p>Issuance schedule; what counts as a valid block. Checked independently by each validating node.</p>
        <ul>
          <li><b>Validating node</b>: rejects blocks that break the rules it runs.</li>
          <li><b>Developer</b>: proposes code; cannot make another node install it.</li>
          <li><b>Miner</b>: selects transactions; cannot force nodes to accept invalid issuance.</li>
        </ul>
      </div>
      <div className="fig-panel" {...reveal(1)}>
        <h4>The market</h4>
        <p>Dollar prices, trading liquidity, custody and block construction. Concentrated intermediaries.</p>
        <ul>
          <li><b>Exchanges and market makers</b>: prices and liquidity.</li>
          <li><b>Custodians and fund trusts</b>: hold keys for other people’s coins.</li>
          <li><b>Mining pools</b>: choose block templates and can delay inclusion.</li>
        </ul>
      </div>
    </div>
  </Figure>;
}

function Defects() {
  const d = (text, id, note) => ({ text, href: sec(id), note });
  return <Figure vol="bitcoin" label="Figure · ten defects" title="The ten defects, sorted by this chapter’s own labels"
    note="Analytical categories, not a ranked list of permanent impossibilities.">
    <Columns groups={[
      { label: 'Being fixed', tone: 'weak', items: [d('Legal and regulatory perimeter', '1-legal-and-regulatory-perimeter-being-fixed', 'being fixed'), d('Tax and accounting', '2-tax-and-accounting-partly-fixed', 'partly fixed')] },
      { label: 'Mitigated', tone: 'mid', items: [d('Scalability', '3-scalability-mitigated-not-solved', 'mitigated, not solved'), d('Custody, irreversibility and physical risk', '4-custody-irreversibility-and-physical-risk-structural-with-', 'structural, with mitigations')] },
      { label: 'Structural', tone: 'strong', items: [d('Concentration', '5-concentration-structural-and-worsening', 'and worsening'), d('Energy and the security budget', '6-energy-and-the-security-budget-structural-and-worsening', 'and worsening'), d('Governance and technical risk', '7-governance-and-technical-risk-structural'), d('Unit-of-account failure', '8-unit-of-account-failure-structural'), d('Volatility', '9-volatility-structural'), d('The macro objections', '10-the-macro-objections-structural')] },
    ]} />
  </Figure>;
}

function OldCrises() {
  const rows = [
    ['Custodians', 'Bank runs of 1907 and 1930–33', '1-custodians-the-bank-run-without-a-central-bank-analogue-19'],
    ['Leverage', '1929 margin loans; 1987; LTCM 1998', '2-leverage-the-margin-cascade-analogue-1929-margin-loans-198'],
    ['Treasury companies', 'The leveraged investment trusts of 1929', '3-treasury-companies-the-leveraged-investment-trust-analogue'],
    ['Stablecoins', 'Reserve Primary Fund 2008; wildcat banks 1837–62', '4-stablecoins-the-money-market-run-analogue-reserve-primary-'],
    ['Deflation', '1929–33', '5-deflation-the-1930s-in-a-fixed-supply-economy-analogue-192'],
    ['Contagion into banks', '2008 shadow banking', '6-contagion-into-the-banking-system-analogue-2008-shadow-ban'],
    ['Sovereign and concentration risk', 'Central-bank gold sales; the 1960s gold pool', '7-sovereign-and-concentration-risk-analogue-central-bank-gol'],
    ['Mining and security shocks', 'The 1970s oil shock', '8-mining-and-security-shocks-analogue-the-1970s-oil-shock-fo'],
    ['Technical black swans', 'No analogue: the cap is a software promise', '9-technical-black-swans-no-analogue-the-cap-is-a-software-pr', true],
  ];
  return <Figure vol="bitcoin" label="Figure · analogues" title="Nine mechanisms and the crises they echo"
    note="Conditional analogies of mechanism. They do not establish that any named crisis has recurred, or will.">
    <Pairs left="Bitcoin-era mechanism" right="Historical analogue" rows={rows.map(([a, b, id, none]) => ({ a, b, href: sec(id), none }))} />
  </Figure>;
}

function Shielded() {
  return <Figure vol="zcash" label="Figure · shielded payment" title="Checking a rule without publishing the data behind it"
    note="Conditional on correct cryptography and implementation. Transparent components, transfers between pools and wallet behaviour can still leak information.">
    <div className="fig-chain">
      <div className="fig-box" {...reveal(0)}>Sender’s wallet<small>controls spendable records called notes</small></div>
      <div className="fig-arrow" {...reveal(1)}>a payment consumes notes and creates new ones</div>
      <div className="fig-row" style={{ '--cols': 3 }}>
        <div className="fig-box is-acc" {...reveal(2)}>Nullifiers<small>mark spent notes, so they cannot be spent twice</small></div>
        <div className="fig-box is-acc" {...reveal(3)}>Note commitments<small>record new notes without publishing their contents</small></div>
        <div className="fig-box is-acc" {...reveal(4)}>Proof<small>shows the transaction satisfies the rules</small></div>
      </div>
      <div className="fig-arrow" {...reveal(5)}>the network checks the proof and records the transaction</div>
    </div>
    <div className="fig-split" style={{ marginTop: 4 }}>
      <div className="fig-panel" {...reveal(6)}><h4>An observer still sees</h4><ul><li>That a transaction happened</li><li>Its public structure, fees and any public value movements</li><li>Its position in the chain</li></ul></div>
      <div className="fig-panel is-acc" {...reveal(7)}><h4>Can stay private in a shielded pool</h4><ul><li>Who paid whom</li><li>How much</li><li>The note contents, readable by the recipient with private key material</li></ul></div>
    </div>
  </Figure>;
}

function ZecScales() {
  return <Figure vol="zcash" label="Figure · four scales" title="Can ZEC be a unit of account? It depends on the scale"
    note="Not a binary between “viable for everyone” and “impossible forever”. Each wider ring needs much stronger evidence.">
    <Scopes items={[
      { title: 'One contract', verdict: 'Possible where permitted', text: 'Parties choose an amount of ZEC and settle under applicable law.' },
      { title: 'A community or sector', verdict: 'Conceivable today', text: 'Needs naturally matched ZEC revenues and costs.' },
      { title: 'A national economy', verdict: 'Logically possible', text: 'Requires extensive institutional change and evidence of readiness.' },
      { title: 'The world’s dominant unit', verdict: 'Thought experiment', text: 'The least supported claim: coordination across trade, credit and fiscal systems.' },
    ]} />
  </Figure>;
}

function ZecLayers() {
  return <Figure vol="zcash" label="Figure · layers" title="A cap on the base is not a cap on the claims above it"
    note="Thought-experiment layers from this chapter. How far the upper layers can expand depends on the institutions a society allows.">
    <Layers layers={[
      { label: 'Loans, bonds and other debts in ZEC', text: 'Promises to repay ZEC later, plus leverage and derivatives.', tag: 'not capped', tone: 'weak' },
      { label: 'Balances promising ZEC', text: 'A bank or payment-service claim: a claim on an institution.', tag: 'not capped', tone: 'mid' },
      { label: 'Native ZEC', text: 'Base settlement money under its holder’s keys.', tag: 'capped issuance', tone: 'strong' },
    ]} />
  </Figure>;
}

function IdeasSequence() {
  return <Figure vol="zcash" label="Figure · a sequence of ideas" title="What each stage contributes"
    note="A history of ideas, not a forecast of replacements: gold, fiat, Bitcoin and Zcash coexist today.">
    <Sequence items={[
      { title: 'Gold', text: 'Durable value, physical scarcity, settlement without an issuer’s promise.' },
      { title: 'Fiat', text: 'Sovereign denomination, bank credit and discretionary response.' },
      { title: 'Bitcoin', text: 'Digital bearer settlement and constrained issuance without a central account keeper.' },
      { title: 'Zcash', text: 'Confidential verification of payment information.' },
    ]} />
  </Figure>;
}

function HarborPath() {
  const s = (title, id, text) => ({ title, text, href: sec(id) });
  return <Figure vol="zcash" label="Figure · constructed scenario" title="Harbor’s staged path, with a gate before expansion"
    note="Harbor is invented. Any stage can take years, stay limited or stop, and there is a published exit path at every step.">
    <Sequence vertical items={[
      s('1 · Set the terms before moving balances', 'step-1-set-the-terms-before-moving-balances', 'Voluntary contracts, clear separation of coins, custody and investments.'),
      s('2 · Acquire resources openly', 'step-2-acquire-resources-without-pretending-conversion-is-fr', 'Bought or borrowed ZEC, with reported costs.'),
      s('3 · Create a complete small spending circuit', 'step-3-create-a-complete-small-spending-circuit', 'Employers, suppliers and merchants who keep receipts in ZEC.'),
      s('4 · Match contractual units', 'step-4-match-contractual-units-not-only-payment-methods', 'What is owed in ZEC, not only paid in it.'),
      s('5 · Separate payment custody from term finance', 'step-5-build-payment-custody-and-term-finance', 'Fully reserved payments; investors bear lending risk.'),
      s('6 · Fiscal denomination with matched funding', 'step-6-introduce-fiscal-denomination-with-matched-funding', 'Selected taxes and spending in ZEC, with a defined reserve.'),
      s('7 · Convert legacy contracts by agreement', 'step-7-handle-legacy-contracts-by-explicit-agreement', 'Redenomination does not recapitalise anyone.'),
      s('8 · Gate: expand only after observable performance', 'step-8-expand-only-after-observable-performance', 'Repeat demand, durability and household welfare tested.'),
      s('9 · Broader domestic adoption, then international', 'step-9-broader-domestic-adoption-then-international-coordina', 'Only if results remain favourable.'),
    ]} />
  </Figure>;
}

function EvidencePipeline() {
  return <Figure label="Figure · evidence path" title="How a claim reaches the page"
    note="Statuses as defined below. An empty comparison cell means “not yet sourced”, not a negative score.">
    <div className="fig-chain">
      <div className="fig-box" {...reveal(0)}>Source<small>primary documents, official statistics, operator documentation preferred</small></div>
      <div className="fig-arrow" {...reveal(1)}>a specific assertion and its scope</div>
      <div className="fig-box" {...reveal(2)}>Claim in the evidence registry<small>needs a supporting locator, a reviewer label and a review date</small></div>
      <div className="fig-arrow" {...reveal(3)}>dated figures must match an accepted claim’s source and locator</div>
      <div className="fig-row" style={{ '--cols': 3 }}>
        <div className="fig-box is-acc" {...reveal(4)}>Accepted<small>published with its locator</small></div>
        <div className="fig-box" {...reveal(5)}>Review<small>wording still being checked</small></div>
        <div className="fig-box is-dash" {...reveal(6)}>Withheld<small>dataset, denominator or locator not ready</small></div>
      </div>
    </div>
  </Figure>;
}

export function MechanicsTiers() {
  return <Figure label="Figure · whose promise" title="Three tiers of promises, one transaction at a time"
    note="Stylised UK frame, as in the four examples below. Arrows show who can hold whose liability.">
    <div className="fig-chain">
      <div className="fig-row" style={{ '--cols': 2 }}>
        <div className="fig-box is-acc" {...reveal(0)}>Central bank<small>owes reserves to eligible institutions</small></div>
        <div className="fig-box is-dash" {...reveal(1)}>Government<small>owes bonds to whoever holds them</small></div>
      </div>
      <div className="fig-arrow is-both" {...reveal(2)}><i />banks hold reserves and settle with each other in them</div>
      <div className="fig-box" {...reveal(3)}>Commercial banks<small>owe deposits to their customers</small></div>
      <div className="fig-arrow is-both" {...reveal(4)}><i />customers pay and borrow in deposits; they cannot spend reserves directly</div>
      <div className="fig-box" {...reveal(5)}>Households, firms and funds</div>
    </div>
  </Figure>;
}

export function HomeCoexistence() {
  return <Figure label="Figure · overlap" title="Each new money arrived beside the old ones"
    note="Time axis compressed. Bars show when each arrangement operates, not its size or share.">
    <Periods scale={[[-3000, 0], [1700, 0.42], [1971, 0.68], [2009, 0.84], [2026, 1]]}
      ticks={[[-3000, 'c. 3000 BCE'], [1717, '1717'], [1971, '1971'], [2009, '2009'], [2026, '2026']]}
      rows={[
        { label: 'Gold and silver as money', range: 'weighed, then coined; still held as reserves', start: -3000, end: 2026, open: true, color: '#b8862f', href: '/gold/' },
        { label: 'Currencies linked to gold', range: '1717–1971', start: 1717, end: 1971, color: 'color-mix(in srgb,#b8862f 55%,var(--bg))', href: '/gold/07-the-gold-standard-era-1717-1971/' },
        { label: 'Fiat money after the gold window', range: 'since 1971', start: 1971, end: 2026, open: true, color: '#487b91', href: '/after/' },
        { label: 'Bitcoin', range: 'since 2009', start: 2009, end: 2026, open: true, color: '#c4732f', href: '/bitcoin/' },
        { label: 'Zcash', range: 'since 2016', start: 2016, end: 2026, open: true, color: '#7a63b6', href: '/zcash/' },
      ]} />
  </Figure>;
}

export function MethodsFigure() { return <EvidencePipeline />; }

export const ARTICLE_FIGURES = {
  'gold-01': { section: 'cosmic-and-geological-origin', after: 'Placer', Component: GoldOrigin },
  'gold-03': { section: null, Component: GoldStages },
  'gold-05': { section: 'bimetallism-the-fixed-ratio-and-why-it-kept-failing', after: 'Gresham', Component: Gresham },
  'gold-06': { section: null, Component: GoldSettings },
  'gold-07': { section: null, Component: GoldStandardEra },
  'gold-08': { section: 'step-one-the-dollar-becomes-gold-s-proxy-1944-1971', Component: DollarProxy },
  'after-01': { section: null, Component: TheBreak },
  'after-02': { section: 'the-petrodollar-invoicing-and-recycling-not-redemption', after: 'recycled', Component: Recycling },
  'after-05': { section: 'brazil-and-argentina-1999-2002', after: 'impossible trinity', Component: Trilemma },
  'after-08': { section: null, Component: Dematerialised },
  'bitcoin-01': { section: 'what-the-design-actually-is', after: 'subsidy', Component: Halvings },
  'bitcoin-02': { section: 'the-claim-tested-against-use', Component: Scorecard },
  'bitcoin-04': { section: 'four-forms-of-adoption', Component: AdoptionForms },
  'bitcoin-06': { section: 'what-is-still-missing-in-order-of-difficulty', Component: LegalTenderGap },
  'bitcoin-09': { section: 'two-different-kinds-of-control', Component: Control },
  'bitcoin-11': { section: 'sorting-the-defects', Component: Defects },
  'bitcoin-12': { section: 'the-thesis', Component: OldCrises },
  'zcash-02': { section: 'a-plain-language-model-of-a-shielded-payment', after: 'Commitments', Component: Shielded },
  'zcash-05': { section: 'four-answers-at-four-scales', Component: ZecScales },
  'zcash-06': { section: 'the-monetary-base-is-only-one-layer', after: 'Inference', Component: ZecLayers },
  'zcash-08': { section: 'the-sequence-has-two-meanings', after: 'Gold illustrates', Component: IdeasSequence },
  'zcash-10': { section: 'a-staged-adoption-path', Component: HarborPath },
};
