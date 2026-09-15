# Isolated local-preview HTTP observation — 15 September 2026

This is a **loopback HTTP/server observation**, not a browser paint or Core Web Vitals trace. Chrome DevTools MCP (`navigate_page`/`performance_start_trace`) was not available, and the computer-use browser inventory had no browser surface for an independent tab. Chromium and Playwright binaries were present locally but were not used for computer/browser interaction. No FCP, LCP, CLS, TBT, Speed Index or interaction delay was captured. Field p75 and INP remain unavailable.

## Setup and reproducibility

- Output: current built `dist` served by a separate `npm run preview -- --host 127.0.0.1 --port 4174 --strictPort` process; the root's preview tab was not touched. Vite 5.4.21, Node v26.8.2, curl 8.22.0.
- Client: curl on the same machine to `127.0.0.1:4174`, five separate requests per URL, one after another. Every request sent `Cache-Control: no-cache` and discarded the body after measuring it. The preview returned `Cache-Control: no-cache`, a content length and no `Content-Encoding` even when offered gzip/Brotli for the content index. Browser cache, OS file-cache state and connection reuse beyond curl's process lifetime were not controlled.
- Viewport/device: not applicable to curl. Network: unrestricted loopback, no latency/bandwidth throttling. This does not model mobile networks or browser rendering.
- Local output changed during preliminary header inspection: a first index HEAD response was 687,358 bytes; by the measured samples a build had replaced it with a 729,252-byte file. The samples below all saw the later 729,252-byte index. Repeat against a frozen build for a release lab comparison.

Reproduce each sample with:

```sh
curl --silent --show-error --output /dev/null --header 'Cache-Control: no-cache' \
  --write-out '%{http_code}\t%{time_starttransfer}\t%{time_total}\t%{size_download}\n' \
  'http://127.0.0.1:4174/bitcoin/02-what-bitcoin-solved-and-what-it-did-not/'
```

The command reports status, curl time to first response byte, curl total download time (seconds) and downloaded bytes. Repeat five times per URL; raw samples are in `perf-http-samples.tsv`.

| Requested URL | Response | Bytes | Median curl first byte | Median curl total |
|---|---:|---:|---:|---:|
| `/` Home shell | 200 | 1,588 | 1.083 ms | 1.118 ms |
| `/bitcoin/02-what-bitcoin-solved-and-what-it-did-not/` direct chapter HTML | 200 | 18,048 | 1.063 ms | 1.093 ms |
| `/#/search?q=triffin` | 200 | 1,588 | 0.667 ms | 0.698 ms |
| `/#/timeline` connected timeline | 200 | 1,588 | 0.404 ms | 0.417 ms |
| `/content/index.json` | 200 | 729,252 | 0.469 ms | 1.565 ms |
| `/assets/index-DA_X4SYd.js` | 200 | 244,378 | 0.831 ms | 1.282 ms |
| `/assets/index-CehYUwef.css` | 200 | 17,084 | 0.849 ms | 0.881 ms |

The `#` fragment is not sent in HTTP. Search and connected Timeline therefore fetch the same 1,588-byte Home shell; their different curl times reflect small loopback variation, **not** route-specific search/timeline readiness. Their hydrated render, content-index parse, JS execution, font loading and layout are unmeasured. A direct chapter sends a distinct static HTML path; no-JavaScript chapter content is present, but hydration timing is unmeasured. The sub-2 ms loopback totals cannot be compared to LCP ≤2.5 s, field INP ≤200 ms or CLS ≤0.1.

## Payload-size facts

The measured preview served the 729,252-byte content index, 244,378-byte JS bundle and 17,084-byte CSS bundle uncompressed. Local *offline* compression of these exact files at gzip `-9` / Brotli quality `11` gave, respectively: index 227,980 / 161,795 bytes; JS 77,155 / 67,078 bytes; CSS 3,701 / 3,174 bytes. Those are reproducible file-size calculations, **not delivered transfer sizes** or evidence that the deployed host applies either encoding. The index includes shared content for all views; whether its load or parsing materially delays real navigation requires a browser trace with stated device/network/cache conditions.

The next performance gate is a browser trace for Home, a direct chapter, Search and connected Timeline at a controlled viewport/device/network/cache, reporting actual FCP/LCP/CLS and interaction delay if the tool captures them. Field p75 LCP/INP/CLS needs deployed traffic evidence; local lab observations cannot substitute for it.
