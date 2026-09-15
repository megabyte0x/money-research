# Ownership and starting state

Started from local commit `7c9939c` on 15 September 2026. Before dispatch, `IMPLEMENTATION-STATUS.md` was modified and `plans/`, `public/content/sources.json`, and `src/sources.js` were untracked. Preserve these files; no clean/reset is authorized by this handoff.

The coordinator holds the shared-file lease listed in `plans/README.md`, including the source/claim/observation registries and build/model files. Package 02 edits Gold volume prose, 03 edits After Gold volume prose, and 04 edits Bitcoin volume prose. Their timeline Markdown and all generated files are excluded. Each editor owns `workstreams/<id>/` and hands proposed registry changes to the coordinator. Package 04 returned its prose lease after handoff; package 05 now owns the three timeline Markdown files, event-ID registry, `src/timeline.js` and `src/timeline-references.js`.

`public/content/` is the active editorial content source. `project/` and the sibling research volumes are provenance snapshots. Stable manifest IDs, routes, and aliases remain intact; archival text must not overwrite edited public chapters.

After package 02 returned its prose lease, the coordinator made scoped Gold 02/09/12 observation-token substitutions to connect the accepted WGC category/revision records. The underlying qualified wording and H2s remain in the editor packet. Manifest metadata is refreshed at the merge step.

After Gold 09 deliberately renames its first H2 from “The pandemic response: the largest money creation in history” to “Pandemic fiscal spending and central-bank balance sheets.” The old `the-pandemic-response-the-largest-money-creation-in-history` section ID is preserved as a manifest `sectionAliases` anchor to the new `pandemic-fiscal-spending-and-central-bank-balance-sheets` heading in React and static HTML. No in-repository direct link to the old ID was found; external copied URLs remain possible, so the alias is retained.
