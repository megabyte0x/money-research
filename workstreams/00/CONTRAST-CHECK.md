# Color-token contrast spot check · 15 September 2026

The current [W3C WCAG 2.2 Contrast (Minimum) criterion](https://www.w3.org/TR/WCAG22/#contrast-minimum) gives 4.5:1 for ordinary text and 3:1 for large text at AA. I calculated relative-luminance contrast for the site's primary and muted color tokens against its base and soft backgrounds. This is a token-pair check, not a formal page-wide accessibility audit.

| Theme / token pair | Calculated ratio after change |
|---|---:|
| Light primary `#1c1a16` / base `#f6f3ec` | 15.68:1 |
| Light muted `#69645a` / base `#f6f3ec` | 5.31:1 |
| Light muted / soft `#ebe6da` | 4.72:1 |
| Light muted / mark `#f3e7b9` | 4.74:1 |
| Dark primary `#e6e1d5` / base `#161511` | 14.00:1 |
| Dark muted `#8f897c` / base `#161511` | 5.25:1 |
| Dark muted / soft `#1f1d17` | 4.84:1 |

The previous light muted color `#6f6a60` measured 4.32:1 on soft and 4.34:1 on mark, so the coordinator darkened it to `#69645a`. The 320/390/768 px light-theme browser spot checks were made before the token change; repeat visual inspection at a stable build. Other component-specific colors, focus outlines, disabled text, background images, real antialiasing and full keyboard/screen-reader behavior remain for package 10 review.
