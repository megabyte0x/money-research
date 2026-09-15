# 10 — Release validation and maintenance workflow

**Scope:** remaining T02/T04/T05/T06; F07 workflow. Start only after all content and implementation edits from packages 00–09 are complete and integrated. Do not run a baseline or partial QA during editing. Own test creation and execution deferred by all other packages.

## Ownership
Own dedicated quality tests/reports, browser-check artifacts and `workstreams/10/`. Obtain coordinator leases for `scripts/prerender.mjs`, package scripts/dependencies, deployment config or shared route code. Feature owners fix their UI; avoid competing edits to App or global CSS.

## Entry condition and execution

Wait for the coordinator's full editing handoff, regenerate metadata and outputs, then run one consolidated build/test/browser/accessibility/performance pass. Collect deferred cases from every package and add meaningful tests here. Report failures together, assign fixes to file owners, and rerun only affected checks after fixes. Do not send agents back through repetitive whole-suite checks for each content edit.

## Tasks
1. Make the standard verification command cover all relevant suites: currently `npm test` names only `tests/content.test.mjs`, while search/reference/mechanics/arc/static tests live separately. Ensure build-output checks run after a fresh build. Add durable CI/check documentation through the coordinator.
2. Exercise all 44 direct article destinations and aliases structurally; manually exercise representative direct loads, legacy `#/volume/slug/section`, `?section=`, copied section links, browser Back, search filter/empty-state URLs and no-JavaScript content. Verify static and hydrated content agree.
3. Validate title/description uniqueness, canonical/OG URLs and social images. Implement missing social-image metadata/assets under an agreed lease. Check actual deployed responses and social fetch behavior when a preview is available; report indexing evidence separately from sitemap validity.
4. Validate generated links and source-registry locators/URLs. Classify unavailable external sources for editorial follow-up without treating a network failure as proof of falsity. Validate allowed URL schemes and safe rendered content in the build/render paths.
5. Test home, article, search, timeline, glossary, comparison and mechanics at 320/390/768 px and desktop, both themes. Check keyboard order, visible focus, menus/contents, popovers, headings, local table scrolling, reduced motion and chart alternatives. Use automated checks plus manual screen-reader/keyboard review; consult current official accessibility criteria at execution time.
6. Measure representative routes with a repeatable lab setup: device/network/cache state, route, tool version and metrics. Investigate initial generated-index transfer and all-views bundle cost based on measurements. Preserve original target LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at field p75; lab results cannot establish field p75 or real-world INP.
7. Implement minimal privacy-conscious measurement for path use, search success/no-result counts, citations and comparison use. Do not log raw search text or selected passages. Document event fields, retention/owner and use an appropriate deployment mechanism; external service/account choices can remain a specifically identified dependency.
8. Complete corrections intake fields, triage/severity, ownership, revision history and dated-data maintenance cadence. Obtain verified attribution through 00. Prepare and run five real moderated comprehension/discovery sessions when participants are available; record outcomes without substituting simulated users.

## Done when
Deliver `workstreams/10/HANDOFF.md` plus a gate matrix mapping every original acceptance target to actual evidence, failure or unavailable external input. Tests and lab results are reproducible; defects go back to named owners and are retested after fixes. No production promotion or full-compliance claim follows automatically from a passing build.
