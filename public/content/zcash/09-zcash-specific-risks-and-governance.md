# 09 — Zcash-Specific Risks, Governance, and Future Changes

**Evidence snapshot: 15 September 2026.** This chapter is particularly important because the current security picture differs materially from pre-2026 descriptions.

## 1. Supply integrity and the 2026 Orchard vulnerability

The public record includes a May 2026 discovery, temporary restrictions, an emergency circuit fix, and a subsequent migration design. The formal deployment record gives NU6.2 activation at block 3,364,600 on 3 June 2026. Some response posts mix earlier remediation milestones with final activation; the deployment record is used for the chronology. [Z11](/sources/#sources-zcash-z11), [Z13](/sources/#sources-zcash-z13)

Shielded Labs states that the vulnerable circuit could have allowed counterfeit private claims inside Orchard and that non-exploitation cannot be cryptographically established from the hidden contents. ZODL reports no evidence of exploitation or unauthorised value creation. These statements can coexist: **absence of evidence is not mathematical proof of absence**. [Z12](/sources/#sources-zcash-z12), [Z13](/sources/#sources-zcash-z13)

### What a turnstile proves—and what it does not

A shielded pool's public accounting tracks net value entering and leaving. Rules can reject outflows that would make its balance negative. That limits how much value an affected pool can export into the rest of the system. It does not necessarily let observers sum every hidden note and prove that all private claims are legitimate. The older turnstile explanation explicitly discusses the risk that some holders cannot withdraw if available public pool balance is insufficient. [Z10](/sources/#sources-zcash-z10)

**Illustration:** suppose a pool has 1,000 ZEC of legitimate publicly tracked value. A hypothetical bug creates another 500 ZEC of hidden claims. A boundary rule can still allow only 1,000 ZEC of aggregate net exit. If counterfeit claims exit first, honest claimants could encounter an exhausted boundary. A still-positive pool balance earlier in this process would not prove that every hidden claim was valid.

This illustration explains containment versus claimant fairness. It is **not** evidence that this happened on Zcash.

Ironwood provides a new accounting boundary and constrains activity in the old Orchard pool. Migration strengthens the ability to reason about circulating value under the new rules, but partial migration is not proof that every remaining legacy claim is legitimate. See the original rationale, deployment rules, and migration specification. [Z14](/sources/#sources-zcash-z14), [Z15](/sources/#sources-zcash-z15), [Z17](/sources/#sources-zcash-z17)

### Why this matters for money

People choosing an accounting unit need confidence in more than the announced cap. They need confidence that the implementation enforces the rules and that a failure has a credible response. An emergency pause can protect users from further harm while interrupting payments. A national economy would require continuity arrangements for such an event.

Formal verification and independent review can improve assurance. They establish properties within a model and scope; they do not prove every dependency, wallet, operating system, or future change free of defects.

## 2. Privacy through migrations and everyday wallets

Migrating between pools can expose public amounts and correlations. ZIP 318 explicitly treats transfer unlinkability, timing, balance leakage, and holdings concentration as design concerns. It is therefore misleading to describe every migration as automatically indistinguishable from an ordinary same-pool private payment. [Z17](/sources/#sources-zcash-z17)

A separate operational problem is that private data can leave the chain through signing and proving workflows. ZIP 374 notes that partially created transactions can carry sensitive information and that delegating proving can reveal note contents to the prover. [Z29](/sources/#sources-zcash-z29)

The current Zallet threat model also distinguishes protected spending keys from plaintext history and viewing keys in its database. That is a specific wallet design, not a statement about every wallet. [Z30](/sources/#sources-zcash-z30)

**Inference:** scalable institutional adoption needs privacy reviews of the complete workflow, including backups, accounting exports, remote services, and employee access—not only a review of the on-chain proof.

## 3. Governance and development finance

Zcash has several sources of influence: developers write software; node operators choose software; miners select and order valid transactions; wallet and exchange operators affect access; fund administrators and voters direct resources. None should be simplified into “the company controls the money” or “nobody has meaningful influence.”

NU6.1's funding rules distinguish an 8% community-grants stream and a 12% coinholder-controlled arrangement. ZIP 271 specifies a one-time lockbox disbursement to a 2-of-3 multisignature arrangement involving ZF, ECC, and Shielded Labs. ZIP 1016 separately describes grant decisions, veto conditions, and the independence of protocol adoption from funding decisions. Legal and organisational implementation should not be inferred solely from the proposed process text. [Z20](/sources/#sources-zcash-z20), [Z21](/sources/#sources-zcash-z21), [Z22](/sources/#sources-zcash-z22)

ZODL's emergence from the former ECC team shows why organisation names, employment, fund rights, and code maintenance must be distinguished. The existence of a new company does not itself establish a change to every legacy agreement or signing key. [Z28](/sources/#sources-zcash-z28)

**Economic questions:** Who funds maintenance when ZEC's price falls? Can large holders dominate grant decisions? How are conflicts disclosed? Is cryptographic expertise distributed enough to avoid dependence on a few people? Does growth make upgrades safer through funding or harder through coordination costs?

## 4. Mining, fees, and the security budget

Under the current checked proof-of-work design, miner resources depend on subsidy and fees valued at what miners can purchase with them. Halving a subsidy does not mechanically halve all security, because prices, fees, costs, difficulty, and competition change. But a shrinking subsidy requires an explanation of future funding.

ZIP 317 specifies a conventional fee based on logical actions, including a 5,000-zatoshi marginal fee and two grace actions in the checked calculation. A minimum conventional two-action fee is therefore 10,000 zatoshis, or 0.0001 ZEC. This is not a universal end-to-end payment price or an inclusion guarantee. [Z08](/sources/#sources-zcash-z08)

Low current fees are helpful to users but do not by themselves establish a long-run security budget. Development funding and consensus security also compete for some of the same issuance resources.

Mining concentration should be measured by pool share, independent underlying operators, hardware supply, geography, and time window. Hash rates from different algorithms cannot be directly compared as if one numeric hash-rate ratio measured attack cost. This research does not invent a current concentration percentage.

### Energy and physical infrastructure

**Inference from the proof-of-work design:** a larger ZEC economy would still depend on electricity, mining equipment, connectivity, and geographically distributed infrastructure. Its environmental cost would depend on energy sources, equipment turnover, and the activity it displaces. This research has not measured those quantities; transaction count alone is not a sufficient basis for assigning an energy footprint to each payment.

Political willingness would not eliminate energy shortages or competition for equipment. A change to hybrid consensus would require its own security, concentration, and resource assessment rather than an assumption that a proposed upgrade resolves all these trade-offs.

## 5. Scaling and operational resilience

Zcash's historical sandblasting episode produced serious wallet performance problems after NU5, according to ECC's retrospective. Network validity and usable wallet performance are different measures. [Z27](/sources/#sources-zcash-z27)

The zcashd deprecation and Zebra migration add an integration burden for services. The published support page records the old implementation's end-of-support halt before NU6.3. A new implementation can improve maintainability while raising questions about shared dependencies and implementation diversity. [Z19](/sources/#sources-zcash-z19)

Global readiness would require measured payment completion, sync time, storage growth, fees under sustained load, restore performance, and redundancy across realistic devices. A faster block target or succinct proof does not independently establish global retail capacity.

## 6. Quantum threats and proposed upgrades

ZIP 2005 is a preparatory recoverability design; its future recovery protocol is not fully specified and it does not make the current system fully quantum-secure. Long-term holders and payment users have different risks, and forced migration can create access and distribution problems. [Z18](/sources/#sources-zcash-z18)

| Development | Potential purpose | What must not be claimed today |
|---|---|---|
| Crosslink | Add hybrid-consensus finality and staking-related functions | That current mainnet ZEC already has these guarantees |
| Network Sustainability Mechanism | Remove funds from circulation and reintroduce them through revised issuance | That it stabilises purchasing power or has verified activation here |
| Zcash Shielded Assets | Support assets beyond native ZEC | That a deployed sovereign-quality stablecoin system already exists |

Sources: [Z23](/sources/#sources-zcash-z23), [Z24](/sources/#sources-zcash-z24), [Z25](/sources/#sources-zcash-z25), [Z26](/sources/#sources-zcash-z26). These proposals can change monetary incentives. Future approval would require a fresh assessment rather than assuming the current economic conclusions remain unchanged.

## 7. Ownership and distribution are partly unobservable

Shielding makes precise beneficial-ownership analysis difficult. A large visible pool is not one owner; many addresses are not necessarily many people. Exchange holdings may represent many customers, while one person may use many accounts.

The resulting uncertainty matters for market liquidity, governance participation, inequality, and a national acquisition programme. It is a cost of limited observability, not proof of either egalitarian distribution or secret concentration.

## Key takeaways

Zcash offers meaningful privacy engineering and a history of active security response. Its economic assessment must also include hidden-claim audit limits, migration leakage, funding governance, implementation dependencies, and unfinished proposals. A viable unit of account would need to survive these operational realities, not merely advertise desirable protocol properties.
