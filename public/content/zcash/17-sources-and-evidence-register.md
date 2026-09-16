# Sources and Evidence Register

**Research cutoff and access date: 15 September 2026.** Source identifiers in the other chapters link here. Sources are predominantly original research, protocol specifications, project engineering reports, statutes, and institutional publications. This is a critical synthesis, not an endorsement of a project or an investment recommendation.

## How to read the evidence

Protocol specifications describe intended rules. A dated deployment announcement and engineering report establish stronger evidence of activation than a proposal alone. Developer reports provide first-party incident evidence, but cannot independently establish the absence of an undiscovered exploit. Institutional papers describe their authors' analysis; working papers do not necessarily represent official policy.

The invented society, institutional design, adoption thresholds, and numerical stress tests in chapters 10–12 are the author's **hypotheses and illustrations**. Sources inform their constraints; no source is presented as documenting those fictional events. Legal material is jurisdiction-specific and distinguishes enacted rules, application dates, and international recommendations.

Most sources were inspected through live web retrieval. Where retrieval was restricted, official indexed excerpts or a primary-source alternative were used; material cases are identified below. No original transaction census, cryptographic audit, market-depth study, or household survey was performed.

## Zcash: foundations, implemented rules, and privacy

## Z01

**Ben-Sasson et al., Zerocash (2014).** [Paper and publication information](https://zerocash-project.org/paper); [extended paper](https://zerocash-project.org/media/pdf/zerocash-extended-20140518.pdf).

Supports the foundational use of zero-knowledge proofs for private decentralized payments. It describes the original research system, not every feature, assumption, or performance characteristic of the current Zcash network.

## Z02

**Electric Coin Company, launch history (2016).** [Zcash launch and roadmap](https://electriccoin.co/blog/zcash-launch-and-roadmap/); [post-launch founders' reward account](https://electriccoin.co/blog/founders-reward-transfers/).

The roadmap announced the launch plan; the retrospective confirms the October 2016 launch context. Used for historical chronology and the distinction between Zcash and Bitcoin, not current wallet guidance.

## Z03

**Zcash, monetary parameters.** [What are the economics of Zcash?](https://z.cash/learn/what-are-the-economics-of-zcash/); [protocol specification](https://zips.z.cash/protocol/protocol.pdf).

Supports the approximately 21 million issuance limit, subdivision, block timing, and subsidy framework. The economics page contains funding language that lags NU6.1; funding claims here instead use Z20–Z22 and Z32. The retrieved specification edition is not used to establish the latest upgrade's activation.

## Z04

**Zcash, NU5 deployment.** [NU5 upgrade](https://z.cash/upgrade/nu5/).

Supports the May 2022 activation of Orchard and Halo 2, and the introduction of unified addresses. Removing the Orchard trusted-setup requirement does not eliminate implementation, cryptographic, endpoint, or monetary risk.

## Z05

**ZIP 316, Unified Addresses and Unified Viewing Keys.** [Specification](https://zips.z.cash/zip-0316).

Supports address composition and viewing authority. Receiver selection and the information a particular key reveals matter. A viewing key is not proof that a person or institution has disclosed every address, asset, or liability.

## Z06

**ZIP 310, Security Properties of Sapling Viewing Keys.** [Specification](https://zips.z.cash/zip-0310).

Used for distinctions between incoming and broader viewing authority. Its guarantees concern Sapling and specific key arrangements; they should not be transferred indiscriminately to every pool or wallet.

## Z07

**ZIP 315, Best Practices for Wallet Implementations.** [Specification](https://zips.z.cash/zip-0315).

Supports discussion of public amounts, shielding patterns, wallet behavior, and privacy limitations. Recommended practices are not evidence that all deployed wallets implement them, nor a guarantee against traffic analysis or endpoint compromise.

## Z08

**ZIP 317, Proportional Transfer Fee Mechanism.** [Specification](https://zips.z.cash/zip-0317); [repository text](https://github.com/zcash/zips/blob/main/zips/zip-0317.rst).

Supports the conventional fee based on logical actions: a 5,000-zatoshi marginal fee and two grace actions in the relevant rules. A conventional minimum is not a guarantee of every transaction's total fee, execution time, or economic cost.

## Z09

**Kappos et al., An Empirical Analysis of Anonymity in Zcash (USENIX Security 2018).** [Research paper](https://www.usenix.org/conference/usenixsecurity18/presentation/kappos).

Historical empirical evidence that usage patterns and public metadata can reduce effective privacy. The study is not a demonstration that current Orchard or Ironwood cryptography is broken, and its numerical results are not treated as current anonymity estimates.

## Z10

**Electric Coin Company, Turnstile Enforcement Against Counterfeiting (22 March 2019).** [Technical explanation](https://electriccoin.co/blog/turnstile-enforcement-against-counterfeiting/).

Supports the distinction between publicly tracked pool flows and hidden note claims. A pool balance constraint can restrict aggregate withdrawals without proving every hidden claim valid. It does not by itself establish the absence of historical counterfeiting.

## Zcash: 2026 security response and migration

## Z11

**ZIP 257, Deployment of the NU6.2 Network Upgrade.** [Deployment specification](https://zips.z.cash/zip-0257).

Records activation at block 3,364,600 on 3 June 2026. Used for formal deployment chronology; incident announcements can carry earlier publication dates or reflect stages of the emergency response.

## Z12

**Shielded Labs, The Orchard Counterfeiting Vulnerability (4 June 2026).** [Incident account](https://shieldedlabs.net/the-orchard-counterfeiting-vulnerability/).

Describes discovery, the potential to create invalid hidden value, and the limits of proving non-exploitation retrospectively. This supports a statement about vulnerability and uncertainty, not an assertion that counterfeiting actually occurred.

## Z13

**Zcash Open Development Lab, Orchard Vulnerability Successfully Remediated (June 2026).** [Response report](https://zodl.com/orchard-vulnerability-successfully-remediated/).

First-party account of coordinated repair and the absence of observed unauthorized value creation. “No evidence found” is distinguished from proof that no hidden exploit ever happened. For exact activation use Z11; for the residual uncertainty also read Z12.

## Z14

**Shielded Labs, Ironwood: Verifying the Soundness of Zcash's Circulating Supply (6 June 2026).** [Design rationale](https://shieldedlabs.net/ironwood-verifying-the-soundness-of-zcashs-circulating-supply/).

Explains the proposed new-pool migration and the assurance problem it addresses. This initial proposal alone does not prove deployment or provide an independently completed audit of all outstanding claims.

## Z15

**ZIP 258, Deployment of the NU6.3 Network Upgrade.** [Specification](https://zips.z.cash/zip-0258).

Describes Ironwood and restrictions on the old Orchard pool, including the distinction between prohibited new inflows and permitted change in migration transactions. The inspected header still says Draft; activation is corroborated by Z16 and Z33.

## Z16

**Zcash Foundation, Engineering Update: 27 July–9 August 2026 (11 August 2026).** [Engineering report](https://forum.zcashcommunity.com/t/zf-engineering-update-27th-july-to-9th-august-2026/56966).

Reports NU6.3 operating on mainnet and subsequent Zebra work. This is a dated report from a separate ecosystem organization, useful for corroborating deployment. It is not an external cryptographic or monetary audit.

## Z17

**ZIP 318, Wallet Behavior for Shielded Pool Migration.** [Specification](https://zips.z.cash/zip-0318).

Supports migration privacy discussion: amount and timing correlations, transaction construction, and wallet workflow. Publication of mitigation guidance does not establish consistent implementation across all users and services.

## Z18

**ZIP 2005, Quantum Recoverability.** [Specification](https://zips.z.cash/zip-2005).

Distinguishes recovery preparation from complete post-quantum security. The inspected proposal outlines a future recovery protocol rather than supplying a complete operational recovery system. Ironwood deployment must not be paraphrased as immunity to quantum attacks.

## Z19

**Zcash, zcashd Deprecation.** [Operational notice](https://z.cash/support/zcashd-deprecation/).

Identifies the July 2026 halt and migration requirements. Supports the operational distinction between historical zcashd instructions and the current Zebra-based network, not a claim that migrating custody or service infrastructure is automatic.

## Zcash: governance, proposals, and operations

## Z20

**ZIP 214, Consensus Rules for a Zcash Development Fund.** [Specification and revisions](https://zips.z.cash/zip-0214).

Supports subsidy allocation rules and their changes across upgrades. Percentages refer to newly issued block subsidy, not a tax on every user's transaction value or a percentage of existing supply.

## Z21

**ZIP 271, Deferred Development Fund Lockbox Disbursement.** [Specification](https://zips.z.cash/zip-0271).

Supports the specified lockbox disbursement mechanism and named 2-of-3 key arrangement. This is distinct from complete control over consensus, ordinary users' funds, or the legal administration of every subsequent grant.

## Z22

**ZIP 1016, Community and Coinholder Funding Model.** [Governance proposal](https://zips.z.cash/zip-1016).

Describes the 8%/12% funding design and associated governance. The inspected status remains Proposed and some process details remain open. Actual subsidy deployment is checked against Z20 and Z32; not every institutional provision is assumed completed.

## Z23

**Shielded Labs, Crosslink.** [Project description](https://shieldedlabs.net/crosslink/); [incentivized feature-network announcement](https://forum.zcashcommunity.com/t/crosslink-incentivized-feature-net/55210).

Evidence of a proposed hybrid proof-of-work/proof-of-stake finality design and experimental development. It is not evidence that the Zcash mainnet currently uses Crosslink or that its promised economic and finality properties have been demonstrated at national scale.

## Z24

**ZIP 233, Network Sustainability Mechanism.** [Draft specification](https://zips.z.cash/zip-0233).

Supports discussion of proposed removal and later reissuance accounting within the supply constraint. The contemplated mechanism is not an activated discretionary central bank or a rule that stabilizes consumer purchasing power.

## Z25

**ZIP 234, revised issuance mechanism within the sustainability proposal.** [Draft specification](https://zips.z.cash/zip-0234).

Read alongside ZIP 233 and its related proposal package. Supports analysis of proposed issuance smoothing; unresolved activation details mean the package must not be described as current mainnet monetary policy.

## Z26

**QEDIT, OrchardZSA Finalization (December 2025–February 2026 updates).** [Development reports](https://forum.zcashcommunity.com/t/orchardzsa-finalization/53732).

Reports progress toward shielded assets and test-network implementation. These reports do not establish mainnet activation. The hypothetical stable-value instrument discussed in this volume is therefore an alternative design, not a claim that a particular production asset exists today.

## Z27

**Electric Coin Company, A Look Back: NU5 and Network Sandblasting (7 December 2023).** [Engineering retrospective](https://electriccoin.co/blog/a-look-back-nu5-and-network-sandblasting/).

Supports the history of transaction load, wallet synchronization problems, and engineering responses. It is a developer retrospective, not a current independent throughput benchmark or proof that all future congestion attacks have been solved.

## Z28

**Zcash Open Development Lab.** [Organization and team](https://zodl.com/about/); [Zodl wallet ecosystem entry](https://z.cash/ecosystem/zodl-wallet/).

Supports current organization and wallet context. Team continuity does not automatically establish legal succession to every ECC obligation. Provider-reported adoption or wallet activity is not treated as an independent measure of ZEC-denominated economic production.

## Z29

**ZIP 374, Partially Created Zcash Transactions.** [Specification](https://zips.z.cash/zip-0374).

Supports the separation of transaction-building roles, proving, and authorization, together with associated information exposure. Moving a role to a service provider may disclose sensitive information even when it does not confer spending authority.

## Z30

**Zallet, Threat Model.** [Security documentation](https://zcash.github.io/zallet/security/threat-model.html).

Supports the distinction between encrypted spending keys and potentially exposed wallet history or viewing material. This is documentation for a particular implementation, not a universal statement about every Zcash wallet's storage design.

## Z31

**Electric Coin Company, Zcash Counterfeiting Vulnerability Successfully Remediated (5 February 2019).** [Historical incident disclosure](https://electriccoin.co/blog/zcash-counterfeiting-vulnerability-successfully-remediated/).

Documents the 2018 discovery and repair of a Sprout counterfeiting vulnerability, disclosed after remediation. It is a separate incident from the 2026 Orchard vulnerability. Absence of known exploitation is not converted into certainty of non-exploitation.

## Z32

**Zcash, NU6.1 deployment.** [Upgrade record](https://z.cash/upgrade/nu6-1/).

Records activation on 24 November 2025 at block 3,146,400 and the associated funding changes. Used to reconcile older economics-page descriptions and governance proposal headers with the deployed upgrade.

## Z33

**Zcash, Ironwood / NU6.3 deployment.** [Upgrade record](https://z.cash/upgrade/nu6-3/).

Records activation on 28 July 2026 at block 3,428,143. Together with the Foundation engineering report, this establishes stronger activation evidence than the still-Draft header on ZIP 258. It does not validate unrelated proposals merely listed elsewhere in the ZIP index.

## Money, adoption, law, and comparison systems

## M01

**Bank of England, Money Creation in the Modern Economy (2014).** [Article](https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy); [PDF](https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/2014/money-creation-in-the-modern-economy.pdf).

Explains bank lending and deposit creation. Used to distinguish monetary base, bank liabilities, reserves, and credit. Applying those distinctions to a hypothetical ZEC banking system is this volume's analysis, not a Bank of England proposal.

## M02

**Warren E. Weber, A Bitcoin Standard: Lessons from the Gold Standard, Bank of Canada Staff Working Paper 2016-14.** [Paper](https://www.bankofcanada.ca/2016/03/staff-working-paper-2016-14/).

Analyzes a hypothetical Bitcoin standard, including price adjustment and limited lender-of-last-resort capacity. Conclusions depend on the model and assumptions. It is neither an impossibility theorem for cryptocurrency money nor a central-bank endorsement of adopting it.

## M03

**Casas, Díez, Gopinath and Gourinchas, Dominant Currency Paradigm, IMF Working Paper 2017/264.** [Paper](https://www.imf.org/en/publications/wp/issues/2017/11/22/dominant-currency-paradigm-a-new-model-for-small-open-economies-45431).

Supports the importance of invoicing conventions and international price-setting networks. Persistence of a dominant unit is an economic coordination problem; it does not establish that the present dominant currency can never change.

## M04

**Alvarez, Argente and Van Patten, Are Cryptocurrencies Currencies? Bitcoin as Legal Tender in El Salvador, NBER Working Paper 29968 (2022, revised).** [Research record](https://www.nber.org/papers/w29968); [primary research PDF](https://www.nber.org/system/files/working_papers/w29968/revisions/w29968.rev0.pdf).

Empirical evidence on use, persistence, and adoption barriers. The landing page restricted direct retrieval; indexed research excerpts and the paper record informed this synthesis. Findings concern El Salvador's Bitcoin experiment, not a controlled comparison proving Zcash would perform better.

## M05

**IMF, Elements of Effective Policies for Crypto Assets (23 February 2023).** [Executive Board discussion](https://www.imf.org/en/news/articles/2023/02/23/pr2351-imf-executive-board-discusses-elements-of-effective-policies-for-crypto-assets); [policy paper](https://www.imf.org/en/publications/policy-papers/issues/2023/02/23/elements-of-effective-policies-for-crypto-assets-530092).

Supports the present institutional resistance to giving crypto assets official-currency or legal-tender status. IMF policy advice is not itself a globally binding prohibition on holding, transacting in, or privately denominating contracts in ZEC.

## M06

**US Internal Revenue Service, Digital Assets.** [Tax guidance](https://www.irs.gov/filing/digital-assets).

Supports US federal treatment of digital assets as property and related recordkeeping consequences. This is a US example of transactional friction; it is not a universal tax rule or a finding that every ZEC transaction creates a taxable gain.

## M07

**Basel Committee, SCO60: Cryptoasset Exposures, effective international framework from 1 January 2026.** [Standard](https://www.bis.org/committees/bcbs/basel-framework/standard/sco/60/inforce/2026-01-01/published/2024-11-27).

Supports discussion of stringent bank capital treatment for Group 2b exposures and Group 2 exposure thresholds. Classification and the bank's actual position matter. International implementation dates must be distinguished from enacted rules and supervisory application in each jurisdiction.

## M08

**European Union, Regulation (EU) 2024/1624, especially Articles 79 and 90.** [Official regulation](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32024R1624).

Article 79 concerns anonymous accounts and accounts allowing transaction obfuscation at regulated institutions, including through anonymity-enhancing coins; Article 90 gives the general 10 July 2027 application date. Official indexed excerpts were inspected because direct retrieval encountered an access challenge. This is not described as a blanket prohibition on all private self-custody.

## M09

**European Securities and Markets Authority, MiCA Article 76.** [Interactive rulebook](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-76-operation-trading-platform-crypto).

Paragraph 3 restricts admission of assets with inbuilt anonymisation unless the operator can identify holders and transaction history. This is a rule for relevant trading platforms, not a universal finding that every use or ownership of ZEC is unlawful.

## M10

**FATF, Seventh Targeted Update on Virtual Assets and VASPs (16 July 2026).** [Update](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/targeted-updated-virtualassets-vasps-2026.html).

Supports the current direction of international AML oversight, Travel Rule implementation, and remaining implementation gaps. FATF standards and assessments must be distinguished from national statutes and the controls a particular service must implement.

## M11

**European Central Bank, proposed digital euro privacy.** [Privacy design](https://www.ecb.europa.eu/euro/digital_euro/features/privacy/html/index.en.html); [FAQ](https://www.ecb.europa.eu/euro/digital_euro/faqs/html/ecb.faq_digital_euro.en.html).

Supports the comparison with planned offline privacy and the distinction between public access and intermediary visibility. These are design and preparation materials; the volume does not present the digital euro as already available for universal everyday use.

## M12

**Monero, Tail Emission.** [Protocol explanation](https://www.getmonero.org/resources/moneropedia/tail-emission.html).

Supports the comparison between Zcash's capped issuance and Monero's continuing tail emission. It is not a complete comparative security or privacy audit, nor evidence that one emission rule necessarily produces superior monetary stability.

## M13

**Bitcoin Developer Guide, Payment Processing.** [Developer documentation](https://developer.bitcoin.org/devguide/payment_processing.html).

Supports distinctions between payment receipt, confirmations, settlement risk, and fiat-priced orders converted into BTC. An order paid with a cryptocurrency need not be economically priced in that cryptocurrency.

## M14

**Federal Reserve History, The Great Inflation.** [Historical account](https://www.federalreservehistory.org/essays/great-inflation).

Dates the episode to 1965–1982 and discusses multiple causes. Used to correct the inference that all subsequent inflation or monetary instability began with the 1971 suspension of dollar-gold convertibility.

## M15

**El Salvador, Ley Bitcoin, consolidated text including Decree 199 of January 2025.** [Official legal text](https://www.jurisprudencia.gob.sv/DocumentosBoveda/R/2/2020-2029/2021/06/1080B6.HTML?embedded=true).

The amendment retained legal-tender wording while making private acceptance voluntary and changing the state's role. It did not repeal the entire law. Legal designation, voluntary payment acceptance, and economy-wide BTC denomination remain distinct questions.

## M16

**IFRS Interpretations Committee, Holdings of Cryptocurrencies (June 2019).** [Agenda decision](https://www.ifrs.org/content/dam/ifrs/supporting-implementation/agenda-decisions/2019/holdings-of-cryptocurrencies-june-2019.pdf).

For the cryptocurrency holdings considered, explains IAS 2 in applicable ordinary-course sale situations and IAS 38 otherwise. This is not an assertion that every digital instrument or every national accounting system must use identical treatment.

## M18

**Fedi, federation-based payment and custody description.** [Provider information](https://www.fedi.xyz/).

Used to identify an alternative combining private payment interfaces with federation custody and Bitcoin backing. Product statements establish a comparison category; they are not an independent audit of guardian trust, solvency, or deployed privacy guarantees.

## Reconciliations that materially affect the conclusion

1. **Mainnet versus proposal:** NU6.3 has dated activation evidence even though some ZIP labels lag. Crosslink, the sustainability package, and shielded assets are not promoted to deployed status by association.
2. **Supply rules versus supply assurance:** an issuance cap and public pool balances do not independently prove the validity of every hidden note. The 2026 incident makes this distinction material.
3. **Privacy versus complete secrecy:** proof privacy is only one layer. Counterparties, viewing permissions, public crossings, timing, network metadata, custody, and compromised devices can still matter.
4. **Private settlement versus a new measuring unit:** a merchant converting a dollar invoice into ZEC has adopted a payment method. That observation alone does not establish ZEC price formation.
5. **International rules versus local law:** Basel and FATF frameworks, EU application dates, US tax treatment, and El Salvador's statute have different scopes.
6. **Scenario design versus prediction:** political willingness is stipulated in chapter 10. Stable purchasing power, sound credit, complete privacy, and successful adoption are not stipulated as already achieved.

## Local foundations

The [prior-document coverage map](/zcash/14-prior-document-coverage/) links all 44 original files. Two additional local editorial records were consulted: [Editorial change register](../editorial-change-register.md) and [Editorial sources](../money-research/EDITORIAL-SOURCES.md). They identify corrections to carry forward; they are not substitutes for the primary sources above.
