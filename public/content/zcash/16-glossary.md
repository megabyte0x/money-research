# 16 — Glossary

## Monetary and institutional terms

**Unit of account:** the unit used to form and compare prices and obligations. A fiat amount automatically converted to ZEC remains fiat-denominated.

**Unit of economy:** informal wording used in the request; this volume interprets it as a commonly used unit of account supported by payments, credit, budgets, and tax systems.

**Medium of exchange:** something accepted in payment.

**Store of value:** an asset held to carry purchasing power forward; the term does not guarantee stable value or positive returns.

**Settlement asset:** the asset used to discharge obligations between parties or institutions.

**Monetary base:** foundational money used for settlement in a specified regime; native ZEC in the hypothetical ZEC standard.

**Broad money:** a defined aggregate including selected monetary liabilities such as deposits. Definitions depend on the system being measured.

**Bearer asset:** an asset whose practical transfer or control depends on possession or control of the relevant instrument or keys. Legal ownership can still be disputed.

**Native ZEC:** the cryptocurrency governed by Zcash's consensus rules; distinguish it from a custodian's promise or a wrapped claim.

**Custodial claim:** a liability of a service provider to the user, even if the interface displays a cryptocurrency balance.

**Fully reserved payment account:** a payment promise matched by reserves under specified custody and legal rules; it is not automatically immune to theft, fraud, or outages.

**Fractional-reserve banking:** immediately redeemable liabilities can exceed immediately available settlement reserves.

**Liquidity:** ability to obtain or deliver a needed asset promptly without intolerable loss.

**Solvency:** assets are sufficient to meet liabilities under the applicable valuation and legal framework.

**Lender of last resort:** an emergency liquidity provider. Under a native-ZEC standard its own available base assets and borrowing capacity are finite.

**Currency mismatch:** revenues or assets are in a different unit from costs or obligations.

**Maturity mismatch:** funding can be withdrawn or falls due before the corresponding assets generate cash.

**Redenomination:** changing the unit in which obligations are expressed. It does not repair an asset shortfall by itself.

**Peg:** a commitment or mechanism aimed at a specified exchange value against another asset or unit.

**Backing:** assets held against a promise. Always specify redemption rights, reserve quality, custody, and coverage.

**Legal tender:** a jurisdiction-specific legal status affecting payment or debt discharge; it does not necessarily compel new sales or determine the tax unit.

**Seigniorage:** benefits associated with issuing money; the exact mechanism differs between coinage, central-bank liabilities, and cryptocurrency rewards.

**Inflation:** increase in a specified price index over a stated period. Growth in coin supply is a different measure.

**Debt deflation:** a mechanism in which falling prices and incomes increase the real burden of fixed nominal debts and can amplify distress.

**Velocity:** expenditure flow divided by a specified money stock over a defined period; not a permanently fixed physical property of a coin.

**Natural hedge:** matching revenues and expenses in the same unit or with offsetting sensitivities.

**Indexation:** linking an obligation to a price index, currency, or other reference; the reference then performs part of the measuring function.

**Gresham's law:** a mechanism involving monetary instruments valued at an imposed ratio inconsistent with market values; not a general rule that people always spend their least-favoured asset.

## Privacy and protocol terms

**Zero-knowledge proof:** a cryptographic method for establishing a statement's validity without revealing the protected information used to establish it, within a specified construction and security model.

**Soundness:** assurance that a proof system does not accept false statements except with the bounded probability allowed by its security model. Implementation bugs can undermine it.

**Shielded note:** a private spendable record in a Zcash shielded protocol.

**Commitment:** a cryptographic representation that binds to information while concealing it under the relevant assumptions.

**Nullifier:** information used to prevent a shielded note from being spent again without publicly exposing the note's ordinary transaction history.

**Value pool:** an accounting domain for a particular set of Zcash funds or transaction rules.

**Turnstile:** public accounting and constraints on movement into and out of pools; it does not by itself reveal every hidden claim.

**Viewing key:** key material that provides specified observation capabilities without spending authority. Scope and guarantees depend on the protocol and type of key.

**Selective disclosure:** revealing chosen information to specified parties. It does not guarantee that previously revealed data can be revoked or that all undisclosed obligations are absent.

**Fungibility:** equivalence of units. Protocol treatment and actual commercial acceptance are related but different.

**Anonymity set:** the set of plausible alternatives an observer cannot distinguish under a stated model. A pool balance is not an anonymity-set population count.

**Trusted setup:** a parameter-generation process whose security depends on specified assumptions about participants and secret material. Its removal does not remove every other assumption.

**Halo 2:** the proving technology used in the Orchard-protocol generation; see [02](/zcash/02-what-zcash-is-and-what-is-live/) for deployment context.

**Orchard protocol versus Orchard pool:** the cryptographic protocol and a particular pool using it are not identical concepts. Ironwood also uses the Orchard protocol with its applicable rules.

**Ironwood:** the pool introduced with NU6.3; its migration and recoverability properties require precise qualifications.

**Quantum recoverability:** preparation for a possible future recovery process; it is not equivalent to full present post-quantum security.

**Proof of work:** consensus based on computational work and agreed validation rules; confirmation confidence is conditional rather than absolute.

**Finality:** the confidence or guarantee, under stated assumptions, that settled history will not be replaced. Different consensus mechanisms provide different forms.

**ZIP:** Zcash Improvement Proposal. A document's header status does not alone prove a feature's deployment.

**PCZT:** partially created Zcash transaction; intermediate representations may expose more information than the final transaction.

**Crosslink:** proposed hybrid-consensus work; no current-mainnet guarantee is assumed in this research.

**NSM:** proposed Network Sustainability Mechanism; changes funding and issuance handling, not a consumer-price stabilisation rule.

**ZSA:** Zcash Shielded Asset, a development effort to support additional assets. A token denominated in dollars does not make ZEC the unit of account.

## Research terms

**Evidence:** sourced observation or document content, limited to what the source actually supports.

**Inference:** reasoning from observations and assumptions.

**Hypothesis:** a testable proposed explanation or possible arrangement; the political-readiness system here is explicitly invented.

**Illustration:** fabricated numbers used to demonstrate a mechanism.

**Falsification criterion:** an observation that would contradict a hypothesis or materially weaken its stated conditions.
