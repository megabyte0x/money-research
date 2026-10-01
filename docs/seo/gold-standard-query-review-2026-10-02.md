# docs(seo): prepare a source-backed answer for the gold-standard query

Status: owner approved on 2 October 2026 and implemented locally. Subsequently deployed after explicit production approval; see `deployment-2026-10-02.md`. The proposal below records the approved scope; see `implementation-2026-10-02.md` for verification.

## Search evidence and intended page

Search Console's 28-day Web (text) report, filtered to the exact query `why gold standard ended`, attributes four impressions, zero clicks and average position 76 to one page:

https://goldtozcash.vercel.app/gold/07-the-gold-standard-era-1717-1971/

The visible page table contained no other landing page for this filter. Evidence: `gsc-gold-ending-landing-page-2026-10-02.txt`. This does not establish search volume, a stable rank or keyword cannibalization.

Improve this existing chapter rather than creating a competing keyword variant. Its current approved opening question is “Which gold standards existed, and what changed in 1971?” Its answer identifies different systems but leaves the causal question to later sections. The current text discusses 1931, Roosevelt's gold restrictions and Nixon's suspension; a clearer opening can help readers distinguish them.

## Proposed opening for review

Question: **Why did the gold standard end?**

Gold standards ended at different times under different pressures. In Britain, a run on sterling drained reserves before suspension in September 1931. In the United States, a banking crisis and gold outflows preceded Roosevelt's 1933 suspension of domestic dollar–gold conversion. In 1971, Nixon suspended official conversion for foreign governments amid pressure on US gold reserves and inflation. These were different promises and policy decisions, not one worldwide event.

| Arrangement | What ended | Evidence to link beside the answer |
| --- | --- | --- |
| Britain's restored gold standard | Sterling's gold link was suspended in September 1931 after a confidence crisis and reserve losses | Bank of England history, 1931 entry |
| US domestic conversion | Roosevelt's 1933 measures halted conversion of currency and deposits into gold; this is distinct from subsequent international arrangements | Federal Reserve History, Roosevelt's Gold Program, first policy phase |
| Bretton Woods official conversion | Nixon announced suspension of dollar conversion on 15 August 1971; foreign governments could no longer obtain gold for dollars | Nixon's speech and Federal Reserve History's account of the gold window |

The table would precede the existing chapter contents. Retain every existing section ID and historical explanation. Include links to the existing After Gold 01 chapter for subsequent exchange-rate and IMF changes and Gold 08 for continuing dollar use. Do not imply that reserve gold vanished, that every gold-linked contract ended, or that 1971 ended ordinary US gold-coin redemption for the first time.

## Source checks

- [Bank of England, History](https://www.bankofengland.co.uk/about/history), entry “1931 — Gold standard suspended”: identifies September 1931, loss of sterling confidence and reserve losses. Read directly on 2 October.
- [Federal Reserve History, Roosevelt's Gold Program](https://www.federalreservehistory.org/essays/roosevelts-gold-program), paragraphs on the 1933 crisis and first policy phase: distinguishes domestic/external gold drains, suspension and conversion prohibitions. Institutional historical analysis, written as of 22 November 2013; not a contemporaneous legal instrument. Read directly on 2 October.
- [Richard Nixon, address of 15 August 1971](https://www.presidency.ucsb.edu/documents/address-the-nation-outlining-new-economic-policy-the-challenge-peace), paragraph directing Treasury Secretary Connally to suspend dollar conversion: contemporaneous announcement, not independent evidence that the policy achieved its stated aims. Read directly on 2 October.
- [Federal Reserve History, Nixon Ends Convertibility](https://www.federalreservehistory.org/essays/gold-convertibility-ends), opening discussion and paragraphs on the 15 August announcement: supports the foreign-government scope and reported gold-run/inflation context. Institutional historical analysis, written as of 22 November 2013. Do not import its broader inevitability or current-account-deficit interpretation into the proposed answer. Read directly on 2 October.
- The National Archives result for its 20 September 1931 Treasury statement was found, but opening it returned HTTP 403. Do not claim that full document was read or use it as the sole evidentiary basis.

The new UK/1933 source relationships must enter the source and claim registry through the project's editorial process before being labeled accepted. This draft does not modify accepted claims or review dates. Exact legal instruments are needed for any more detailed account of statutory powers or exceptions.

## Implementation and validation after approval

Update the existing Gold 07 summary and insert the scoped, linked comparison in its opening body; preserve canonical URL, heading aliases and older deep links. Keep visible evidence and JSON-LD citations consistent with accepted scopes. Review the generated title/description so truncation does not erase the different conversion promises. Refresh derived word counts and heading metadata only after accepting the edit.

Verify the generated static chapter and React rendering contain the same answer, date/scope distinctions and citations. Check existing source-validation, chapter-link, SEO and build-output tests. Recheck live responses only after an authorized deployment. No new sitemap submission is required for an unchanged canonical URL.

Evaluate subsequent per-query impressions, relevant clicks and average position over comparable windows, while accounting for tiny samples and reporting delays. A ranking change cannot be attributed solely to this edit without further evidence.

The owner approved both this wording and the visible chapter-citation proposal on 2 October 2026. New scoped records now identify the direct source check and owner approval. Production deployment was subsequently explicitly authorized and completed; the original rejection is resolved.
