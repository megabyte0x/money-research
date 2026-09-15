# 04 — Privacy, Fungibility, and the Distinctive Case for Zcash

## The property that matters

The case is not simply that Zcash is digital, divisible, portable, scarce, or open to direct ownership. Bitcoin shares much of that design space. The distinctive combination is **a native bearer asset, protocol-level shielded settlement, and separation of viewing from spending authority**.

These properties can make a currency more usable in ordinary commerce. They cannot independently determine what one ZEC purchases.

## Privacy is not merely secrecy about identity

Different information can matter in different situations:

| Information | Why it matters economically |
|---|---|
| Who paid whom | Can reveal suppliers, customer relationships, memberships, and associations |
| Amount paid | Can reveal wages, margins, negotiating positions, or purchase scale |
| Repeated transaction links | Can allow observers to assemble a financial profile over time |
| The holder's balance | Can increase fraud, extortion, or commercial targeting risk |
| Timing and network origin | Can connect otherwise private activity to a known person or event |

Shielded payments address some ledger-level disclosures. They do not solve every row under every threat model. A compromised phone can reveal information before encryption or after decryption. Public pool-crossing amounts can be distinctive. The counterparty knows its own transaction. An exchange can know a customer's acquisition and withdrawal activity.

The 2018 Kappos et al. study showed how usage patterns could reduce anonymity in the then-deployed Zcash system. That is evidence about historical usage and a general warning about metadata, **not** a measured break of Ironwood in 2026. Current migration guidance independently recognises amount and timing leakage. [Z09](/sources/#sources-zcash-z09), [Z17](/sources/#sources-zcash-z17)

## Fungibility: two different promises

**Protocol fungibility** means valid units of a given denomination are treated equivalently by the rules. **Commercial fungibility** means counterparties actually accept them on equivalent terms.

Shielding can improve the second by concealing histories that might otherwise lead to differential treatment. It cannot compel an exchange, merchant, or state to accept a coin or customer. A rule excluding all shielded-origin transfers would impede commercial fungibility even where individual shielded histories cannot be followed.

The inference is therefore conditional: privacy can reduce one basis for discrimination; it does not guarantee universal acceptance or erase legal claims against a person.

## Selective disclosure is useful, but narrower than it sounds

A firm may separate observation and spending: an accountant observes activity, while signing authority remains elsewhere. A customer may disclose evidence of a particular payment in a supported workflow. These are useful ingredients for confidential accounting. [Z05](/sources/#sources-zcash-z05), [Z06](/sources/#sources-zcash-z06)

Three limits are critical:

1. **Completeness:** observing one wallet does not prove that a company has revealed all wallets, liabilities, side agreements, or borrowed reserves.
2. **Scope:** a broad viewing key may reveal more than a single invoice. Avoid describing it as a perfectly granular, time-limited audit permission.
3. **Persistence:** once someone receives readable information, the sender cannot cryptographically make them forget it. Later changes of keys do not erase old disclosures.

A payment proof demonstrates payment facts under the relevant scheme. It does not prove the goods existed, the invoice was fair, or the payment had a lawful purpose. Public verification of monetary validity and public accountability of institutions require different evidence.

## What is unique, and what is shared?

| Arrangement | Relevant advantage | Trade-off or alternative route |
|---|---|---|
| Native shielded ZEC | Confidential bearer settlement without a mandatory payment custodian | Volatile goods value, technical complexity, ecosystem and access constraints |
| Bitcoin base layer | Open settlement and straightforward public transaction inspection | Transaction graph is public; additional privacy mechanisms change the comparison |
| Bitcoin through a federated e-cash service | Can offer private, convenient user payments | User holds a claim on a federation; custody and redemption depend on that arrangement |
| Monero | Another native privacy-oriented cryptocurrency | Different privacy engineering and issuance choices; fixed cap is not universal among privacy coins |
| Physical fiat cash | Familiar denomination and in-person privacy without an online ledger | Physical transport, loss, and remote-payment limitations |
| Privacy-oriented digital fiat design | Can combine an established accounting unit with stronger payment privacy | Relies on its issuer, legal framework, and actual implementation |
| Hypothetical shielded dollar or basket token | Could let Zcash-related infrastructure serve stable-denomination payments | Token-holder has different monetary or redemption risks; its unit is not automatically ZEC |

For concrete alternatives, Monero documents continuing tail issuance, Fedi describes federation-based custody and private e-cash, and the ECB describes proposed digital-euro privacy including offline functionality. These are different designs and implementation statuses, not interchangeable guarantees. [M11](/sources/#sources-zcash-m11), [M12](/sources/#sources-zcash-m12), [M18](/sources/#sources-zcash-m18)

Consequently, “only Zcash can provide financial privacy” is too strong. The harder comparative claim is that enough users prefer **Zcash's particular combination** of privacy, bearer ownership, economic rules, infrastructure, and governance to use and hold its native unit.

## How privacy could help ZEC denomination

The proposed causal chain is:

1. Shielding reduces a meaningful cost of doing business.
2. Firms repeatedly transact through Zcash.
3. Some retain working balances because immediate conversion is unnecessary or costly.
4. Suppliers and workers increasingly accept ZEC-denominated obligations.
5. A larger share of firms' costs and revenues match in ZEC.
6. Firms can set ZEC prices without continuously referencing an outside currency.

This is a **hypothesis**, not an observed universal sequence. It can stop at any stage. Users may value private settlement yet sell ZEC immediately, or choose a stable-denomination privacy service instead. High payment velocity can support considerable activity with small average working balances; payment growth does not mechanically imply proportionate price appreciation.

## The privacy and public-accountability tension

A society can legitimately want confidential households and auditable public institutions. A ZEC economy could use private citizen payments alongside published government budgets, independently verified accounts, and targeted disclosures. This is a choice about institutions and access rights, not a requirement that every public expenditure use a transparent address.

The design fails if secrecy becomes a substitute for reconciling accounts, or if auditing becomes routine disclosure of everybody's complete financial life.

## Key takeaways

Zcash offers a distinctive package rather than an exclusive monopoly on privacy. Its strongest unit-of-account argument is that confidentiality could enable sustained commerce in ZEC. The missing link is evidence that payment demand becomes persistent native denomination rather than brief use of a settlement asset.
