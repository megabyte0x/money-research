# Accepted-source reachability spot check — 15 September 2026

The current accepted registry has 37 publisher URLs. This check covers eight high-priority newly accepted URLs, not all 37 or every locator. It used the read-only web open tool; two URLs also had an in-app browser check. Network/browser failures do not disprove an editorial claim, but make the cited page inaccessible by that route.

| Source ID | URL/open result | Locator result / action |
|---|---|---|
| `imf-fry-cr-2001-007` | Automated web open: HTTP 403. In-app browser loaded the URL but showed a blank document/body. | Country Report 01/07 para. 7 and Figure 1 note 2 not reader-verifiable in these tools. Find a publisher-hosted accessible copy or mark the link's reachability limitation. |
| `rosstat-russia-cpi-1991-2011` | Automated web open: HTTP 502. In-app browser: `ERR_CERT_AUTHORITY_INVALID`; the security warning was not bypassed. | Russian December/December 1992 index cell not reader-verifiable through these tools. Find an official accessible mirror/table or state the link limitation. |
| `imf-pam45-gold-second-amendment` | Automated web open: HTTP 403. | Chapter II text not reader-verifiable by web fetch. Current IMF Articles remain an accessible companion source, but have narrower coverage. |
| `ustreasury-fy2025-afr-argentina` | Treasury FY2025 Agency Financial Report PDF opened; 222 PDF pages. | Financial Section **printed p. 136 / PDF page 136** was exposed by automated text extraction. |
| `pcaob-por-investor-advisory-2023` | PCAOB HTML opened. | Investor Advisory title and staff-versus-Board disclaimer visible at lines 93–101; procedural/reserve limitations visible at 102–110. |
| `boe-payment-settlement-uk` | Bank of England HTML opened. | Customer payment versus provider settlement at lines 17–26; later net-settlement/FPS sections available. |
| `usmint-coinage-act-1792` | U.S. Mint HTML opened. | Coinage Act §9 denomination list available on the page. |
| `bitcoin-dev-block-chain-guide` | Bitcoin Developer Guide HTML opened. | Block validation and coinbase sections available on the page. |

The previous seven-source review is in `ACCEPTED-SOURCE-URL-CHECK.md`. A complete current 37-URL check and exact-locator inspection remains outstanding; it must not be represented as completed by this bounded pass.
