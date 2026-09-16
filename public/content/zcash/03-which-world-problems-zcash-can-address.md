# 03 — Which World Problems Can Zcash Address?

## Evaluate mechanisms, not slogans

The following assessment is an **inference** from Zcash's verified capabilities and the monetary mechanisms in the preceding research. “Can help” means there is a plausible mechanism; it does not mean a population-level benefit has been measured.

| Problem | Connection to earlier systems | Zcash contribution | What remains |
|---|---|---|---|
| Public exposure of payments | Bitcoin's transparent ledger makes activity available for continuing analysis | Compatible shielded payments conceal key transaction details from public observers | Counterparties, devices, network metadata, and service providers can still disclose information |
| Centralised financial surveillance | Digital fiat concentrates records at payment providers | Direct shielded settlement can reduce the records held by a common intermediary | Exchanges and custodial applications may retain extensive records |
| Transaction-history discrimination | Transparent coin histories can influence commercial acceptance | Shielding can reduce the information used to distinguish otherwise equivalent units | A venue can reject all shielded-origin deposits or a customer's identity |
| Dependence on a bank's permission | Bank transfers depend on account access and provider decisions | A holder with keys and network access can initiate a native transfer | Legal constraints, censorship pressure, connectivity, fees, and mining remain |
| Physical transport and assay | Gold needs storage, authentication, and physical movement | Digital transfer and validation avoid moving bullion | Key management and software replace some physical risks |
| Discretionary base-money issuance | Fiat issuers can expand the base under their rules | ZEC has a protocol-defined issuance constraint | Demand-driven losses, broad-credit expansion, and rule changes remain possible |
| Expensive cross-border payments | Multiple intermediaries and conversions can add cost | Direct settlement may remove some processing stages | Entry/exit spreads, liquidity, identity checks, taxes, and recipients' needs determine total cost |
| Commercial secrecy | Public ledgers expose suppliers, wage patterns, or customer flows | Shielding makes confidential digital commerce more practical | Business systems and the other party still know the deal |
| Financial exclusion | Account eligibility and geography can block participation | Self-custody avoids requiring a conventional bank account for native transfers | Devices, literacy, safe custody, accessible interfaces, and cash conversion may be binding |
| Inflation and unstable living costs | Can arise from monetary policy, supply shocks, and expectations | Limits one source of base issuance discretion | Does not stabilise the food, rent, or energy price of ZEC |
| Debt and banking crises | Promises can exceed liquid assets under gold, fiat, or crypto | Self-custodied native ZEC is not a bank deposit | ZEC lenders and custodians can still fail; private ledgers may complicate oversight |
| War, poverty, corruption, climate shocks | Allocation, production, coercion, and institutions matter | Could protect some lawful payments and reduce some data exposure | Does not abolish conflict, create resources, distribute income fairly, or verify honest procurement |

The technical basis and qualifications are in [02](/zcash/02-what-zcash-is-and-what-is-live/), [04](/zcash/04-privacy-fungibility-and-the-unique-case/), and [09](/zcash/09-zcash-specific-risks-and-governance/). Banking mechanisms are in [06](/zcash/06-fixed-supply-credit-and-crisis-management/).

## Where the practical case is strongest

### Confidential payroll and business payments

A company may want workers to receive wages without publishing the payroll to competitors, criminals, or other employees. A transparent chain can make repeated payment relationships observable. Shielded settlement offers a plausible improvement.

But two payroll contracts are economically different:

1. **“You earn $2,000, paid in ZEC at payday's rate.”** The wage unit is dollars. Exchange-rate exposure arises during acquisition, transmission, and holding.
2. **“You earn 20 ZEC a month.”** The wage unit is ZEC. The employee bears the changing fiat and goods value of that wage unless their expenses are also ZEC-denominated or separately protected.

These are invented contract examples. The first can demonstrate demand for Zcash without demonstrating demand for a ZEC economy. A useful adoption study must record both the settlement asset and the contractual unit.

### Confidential donations and sensitive personal purchases

Shielding can reduce public exposure of donor-recipient links or sensitive purchases. This may matter for association, medical privacy, or commercial confidentiality. However, a recipient may keep records, publish acknowledgements, or leak data. The protocol cannot force confidentiality outside its own transaction system.

### Independent settlement between parties who distrust shared intermediaries

Two firms may prefer a bearer settlement asset over claims on an unfamiliar bank. Native ZEC can transfer without both parties opening accounts at the same provider. Whether it is preferable depends on available liquidity, settlement confidence, volatility, and the value they attach to privacy.

This is an economic trade-off, not a recommendation to bypass legal controls. A payment network's technical reach and the legal eligibility of a transaction are separate questions.

## Why low fees do not settle the remittance question

Consider a purely illustrative transfer worth 200 units of local purchasing power. A chain fee of 0.02 units says little about the final result if acquisition costs 2%, cash-out costs 3%, and the receiver loses another 1% to an adverse rate movement. Conversely, a well-connected corridor with direct ZEC spending could avoid some conversion costs.

A fair comparison therefore measures:

- Total received purchasing power after every fee and spread.
- Time from the sender funding the payment to the recipient being able to spend it.
- Rejected, delayed, and failed payments.
- Privacy exposure across the complete route.
- Custody and exchange-rate risks during the route.

The relevant comparator is the best service actually available to that user, including local instant-payment systems. An expensive international bank transfer is not representative of all fiat payments.

## Privacy has both private and social effects

Financial privacy can protect bargaining power and prevent unwanted exposure. The same capability can make some investigations and public audits more difficult. It is inconsistent to count all privacy benefits as technological achievements while dismissing all oversight costs as merely political obstruction.

A workable system would need proportionate disclosure rules, good business records, judicial procedures, and public-sector accountability. It need not publish every individual's transactions to everyone. But it must explain how obligations are enforced when parties dispute them. See [07](/zcash/07-adoption-and-the-current-institutional-system/) and the hypothetical arrangement in [10](/zcash/10-hypothesis-a-world-ready-for-zec/).

## Problems a change of money does not remove

Zcash does not eliminate real scarcity. If a harvest fails, food can become more expensive in ZEC even with perfectly enforced supply rules. If creditors financed unproductive projects, they can lose value. If a government spends more real resources than its economy can sustain, changing the currency does not eliminate that constraint.

It also does not ensure equitable initial ownership. A transition that sharply increases demand can enrich existing holders while making entry harder for later users. Political willingness to adopt ZEC would still need to address distribution, consent, and access.

## Key takeaways

Zcash directly addresses a particular design problem: public validation need not expose the full payment history. It can also support independent bearer settlement. Its broader economic benefits depend on the complete user journey and the institutions around it; inflation stability, sustainable credit, peace, and fair distribution do not follow from shielding.
