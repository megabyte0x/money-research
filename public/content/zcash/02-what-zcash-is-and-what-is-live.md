# 02 — What Zcash Is, and What Is Actually Live

**Evidence snapshot: 15 September 2026.** Specification pages are living documents. Implementation evidence takes precedence over a stale marketing page or an unupdated proposal label.

## Network, currency, and technology are different things

**Zcash** is a public cryptocurrency network. **ZEC** is its native monetary unit. **Zero-knowledge proofs** are a class of cryptographic techniques used within it and elsewhere. Success for zero-knowledge technology does not imply adoption of ZEC, just as widespread use of encryption does not establish a particular currency.

The 2014 Zerocash paper developed a system in which payment validity could be checked without publicly revealing origin, destination, and transferred amount. Zcash subsequently launched its own chain in October 2016. Existing BTC was not automatically converted into ZEC, and ZEC is not a redeemable claim on BTC. [Z01](/sources/#sources-zcash-z01), [Z02](/sources/#sources-zcash-z02)

## A plain-language model of a shielded payment

A wallet controls spendable records, called **notes**. A payment consumes notes and creates new ones. Commitments let the network record hidden information without publishing its contents; nullifiers let it reject repeated spending. A proof demonstrates that the transaction satisfies the relevant rules. The recipient uses private key material to discover and read incoming notes.

The essential separation is between *checking a rule* and *publishing the private data used to satisfy it*. It remains conditional on correct cryptography and implementation. A faulty proof circuit can accept a statement that should fail.

A shielded transaction is not invisible. An observer still sees a transaction, its public structure, fees or public value movements as applicable, and its position in the chain. Transparent components and transfers between value pools reveal information that a payment entirely within a compatible shielded pool may conceal. Wallet behaviour and network observation add further leakage. [Z07](/sources/#sources-zcash-z07), [Z17](/sources/#sources-zcash-z17)

## Supply and consensus

The existing monetary design uses a roughly 21-million-ZEC upper limit, subdivided into 100 million zatoshis per ZEC, with scheduled subsidy halvings. The familiar post-2024 schedule uses a 1.5625 ZEC gross block subsidy and a 75-second target interval. Those are protocol parameters, not guaranteed wall-clock production. [Z03](/sources/#sources-zcash-z03)

Zcash remains a proof-of-work network in the deployment evidence checked here. Crosslink is a proposed hybrid proof-of-work/proof-of-stake addition, not a basis for asserting that current ZEC already earns protocol staking yield. [Z23](/sources/#sources-zcash-z23)

“The same cap as Bitcoin” does not mean the same demand, liquidity, purchasing power, security expenditure, distribution, or monetary history. Nor does it mean the cap is independent of software correctness and continued agreement about valid rules.

## The shielded generations

| Generation or upgrade | What the evidence establishes | Important limit |
|---|---|---|
| Sprout | Initial shielded system associated with the 2016 launch | Historical proving setup and later security remediation matter |
| Sapling | Earlier major improvement in shielded usability and proving requirements | Do not describe every old pool as having modern setup assumptions |
| Orchard / NU5 | Activated 31 May 2022; introduced the Halo 2 shielded protocol and Unified Addresses | Removing a trusted setup does not remove circuit bugs |
| NU6.2 | June 2026 emergency remediation of an Orchard soundness vulnerability | No known exploit is weaker than proof that exploitation never occurred |
| Ironwood / NU6.3 | July 2026 new shielded pool using the Orchard protocol; changed rules for the old Orchard pool | Migration can reveal public pool-crossing amounts; wallet support matters |

Sources: [Z04](/sources/#sources-zcash-z04), [Z11](/sources/#sources-zcash-z11), [Z15](/sources/#sources-zcash-z15), [Z31](/sources/#sources-zcash-z31), [Z33](/sources/#sources-zcash-z33).

### Why the 2026 changes are material

Shielded Labs reports discovery on 29 May 2026 of a flaw that could create counterfeit claims inside Orchard, and explicitly says historical non-exploitation cannot be proved from that pool's private contents. The emergency upgrade fixed the vulnerable rules. Ironwood then introduced a new pool and restricted entry and cross-address activity in the old one. A dated Foundation engineering report confirms NU6.3 went live. [Z12](/sources/#sources-zcash-z12), [Z15](/sources/#sources-zcash-z15), [Z16](/sources/#sources-zcash-z16)

This volume does not repeat the overly strong claim that a nonnegative public pool balance proves no counterfeit private notes ever existed. See [09](/zcash/09-zcash-specific-risks-and-governance/) for the difference between containing supply risk and establishing the absence of hidden claims.

### What quantum recoverability means

ZIP 2005 changes note construction to make a future recovery path possible. It explicitly says this alone does **not** make Zcash secure against quantum adversaries. A future recovery protocol remains a separate design and deployment problem. “Quantum recoverable” and “fully post-quantum money” must not be used interchangeably. [Z18](/sources/#sources-zcash-z18)

## Viewing authority and spending authority

Viewing keys can grant observation without spending power. Incoming and full viewing authority have different scopes, and the relevant pool and wallet implementation matter. A full viewing key is not proof that the owner disclosed every account, every off-chain liability, or their real-world identity. The Sapling-specific guarantees in ZIP 310 should not be carelessly applied to every later protocol. [Z05](/sources/#sources-zcash-z05), [Z06](/sources/#sources-zcash-z06)

This separation is useful for accounting and treasury controls. It is not an automatic tax-compliance system, a global identity registry, or a revocable permission system for data already disclosed.

## Funding is part of the system

NU6.1 introduced a model allocating 8% of subsidy to community grants and 12% to a coinholder-controlled funding arrangement; the allocation is part of issuance, not a 20% deduction from users' payments. Its deployment, detailed consensus funding rules, and governance proposal are separate documents. The funding chapter examines this distinction and the role of multisignature administrators. [Z20](/sources/#sources-zcash-z20), [Z21](/sources/#sources-zcash-z21), [Z22](/sources/#sources-zcash-z22)

## What should not be assumed to exist

- Unlimited global throughput simply because succinct proofs are possible.
- Finality guaranteed after one block.
- An automatic ZEC purchasing-power stabiliser.
- A complete post-quantum security stack.
- A native, generally deployed shielded stablecoin market merely because shielded assets have been developed on testnets.
- Every advertised wallet feature being available across Ironwood, hardware signing, mobile platforms, and institutional custody.

Crosslink, the Network Sustainability Mechanism, and shielded assets are discussed as proposals or development work where activation was not established. [Z23](/sources/#sources-zcash-z23), [Z24](/sources/#sources-zcash-z24), [Z25](/sources/#sources-zcash-z25), [Z26](/sources/#sources-zcash-z26)

## Key takeaways

The current case for Zcash must account for Ironwood, the 2026 vulnerability, and the migration from zcashd to Zebra. Its design supports private verification; it does not by itself provide stable purchasing power, universal payment capacity, or immunity from software risk.
