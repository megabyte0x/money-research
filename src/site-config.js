// Production origin, slash convention, social assets, and metadata field
// definitions. Publication/indexability lives with the route registry.
// Domain decision (15 September 2026): keep the current live origin until a
// different permanent domain is recorded. Search Console / Bing ownership and
// SERP volume data were not available in this environment.

export const SITE = {
  origin: 'https://money-research-iota.vercel.app',
  trailingSlash: true,
  language: 'en',
  name: 'Money Research',
  tagline: 'How money works—and why it changes',
  socialImagePath: '/social-preview.png',
  socialImageWidth: 1200,
  socialImageHeight: 630,
  socialImageAlt: 'Money Research: an evidence-led guide to gold, government currencies and Bitcoin',
};

export const METADATA_FIELDS = {
  title: 'Document title; unique per canonical URL',
  description: 'Specific search description from approved answers or page copy; qualifications are not truncated',
  canonicalPath: 'Absolute-path canonical with trailing slash',
  indexable: 'Whether the canonical URL may appear in the sitemap and initial robots index',
  robots: 'Initial-response robots directive',
  socialType: 'Open Graph type: article for chapters, website for hubs and directories',
  socialImage: 'Absolute URL of the 1200×630 preview',
  pageType: 'home | hub | chapter | methods | glossary | discovery | search | error',
  datePublished: 'Included only when a verified publication date exists',
  dateModified: 'Included only for a documented substantive change, never the build date',
};

export function absoluteUrl(path) {
  const origin = SITE.origin.replace(/\/$/, '');
  if (!path || path === '/') return `${origin}/`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (/\.[a-z0-9]+$/i.test(normalized) || normalized.endsWith('/')) return origin + normalized;
  return `${origin}${normalized}/`;
}

export function socialImageUrl() {
  return SITE.origin.replace(/\/$/, '') + SITE.socialImagePath;
}
