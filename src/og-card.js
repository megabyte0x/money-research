// The sharing-card content and visual language live here so the build renderer
// and the page-metadata resolver agree on exactly what a card represents.
import { SITE } from './site-config.js';

export const OG_CARD_WIDTH = 1200;
export const OG_CARD_HEIGHT = 630;
export const OG_CARD_TEMPLATE_VERSION = 'minimal-card-v4';
export const OG_CARD_FONT_FAMILY = 'IBM Plex Sans';
export const OG_CARD_DOMAIN = new URL(SITE.origin).hostname;

const VOLUME_NAME = { gold: 'Gold', after: 'After Gold', bitcoin: 'Bitcoin', zcash: 'Zcash' };
const VOLUME_ROMAN = { gold: 'I', after: 'II', bitcoin: 'III', zcash: 'IV' };

// These are editorial shortenings for the only headings that cannot remain
// legible within the card's three-line safe area. They preserve the question
// and scope of their visible page headings.
const EDITORIAL_SHORT_TITLES = {
  'bitcoin-07': 'If Bitcoin Were the Unit of the Economy',
  'bitcoin-10': 'The Path for Large Economies: From Here to a Bitcoin Reserve or Standard',
};

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function withoutSiteSuffix(value) {
  return cleanText(value)
    .replace(/^Money Research\s+·\s+/, '')
    .replace(/\s+·\s+Money Research$/, '')
    .replace(/\.$/, '');
}

export function cardTitle(page) {
  if (page.record?.id && EDITORIAL_SHORT_TITLES[page.record.id]) {
    return EDITORIAL_SHORT_TITLES[page.record.id];
  }
  if (page.kind === 'home') return 'Gold to Zcash.';
  return withoutSiteSuffix(page.headline || page.title) || 'Money Research';
}

export function cardVolumeLabel(page) {
  if (!page.vol || !VOLUME_NAME[page.vol]) return '';
  return `Volume ${VOLUME_ROMAN[page.vol]} · ${VOLUME_NAME[page.vol]}`;
}

export function cardAlt(page) {
  if (page.kind === 'home') return 'Gold to Zcash. How money works. Why it changes. Money Research.';
  const title = cardTitle(page);
  const volume = cardVolumeLabel(page);
  return `${volume ? `${volume} — ` : ''}${title}. Money Research sharing card.`;
}

export function ogCardDefinition(page) {
  return {
    kind: page.kind,
    title: cardTitle(page),
    volume: cardVolumeLabel(page),
    alt: cardAlt(page),
    templateVersion: OG_CARD_TEMPLATE_VERSION,
  };
}

export function cardTitleFontSize(title) {
  const length = cleanText(title).length;
  if (length <= 52) return 76;
  if (length <= 84) return 64;
  if (length <= 116) return 54;
  return 43;
}

// A plain Satori element tree: no browser, remote assets, or generated art is
// involved in producing the final PNG.
export function ogCardTree(card) {
  const home = card.kind === 'home';
  const titleSize = home ? 120 : cardTitleFontSize(card.title);
  return {
    type: 'div',
    props: {
      style: {
        width: `${OG_CARD_WIDTH}px`,
        height: `${OG_CARD_HEIGHT}px`,
        display: 'flex',
        position: 'relative',
        padding: '64px 76px 90px',
        boxSizing: 'border-box',
        backgroundColor: '#121211',
        color: '#f6f4ee',
        fontFamily: OG_CARD_FONT_FAMILY,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', position: 'absolute', top: 64, left: 76, alignItems: 'center', gap: 16, color: '#d5b46c' },
            children: [
              { type: 'div', props: { style: { display: 'flex', width: '40px', height: '3px', backgroundColor: '#d5b46c' } } },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: '20px', fontWeight: 600, letterSpacing: '0.12em' },
                  children: 'MONEY RESEARCH',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', position: 'absolute', top: 64, right: 76, fontSize: 22, color: '#c6c2b8' },
            children: OG_CARD_DOMAIN,
          },
        },
        card.volume ? {
          type: 'div',
          props: {
            style: { display: 'flex', position: 'absolute', top: 144, left: 76, fontSize: 20, letterSpacing: '0.08em', color: '#b7b3a9' },
            children: card.volume,
          },
        } : null,
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              position: 'absolute',
              top: 200,
              left: 76,
              width: 1048,
              height: home ? 140 : 260,
              alignItems: 'center',
              gap: home ? 24 : 0,
              fontSize: `${titleSize}px`,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
            },
            children: home ? [
              { type: 'span', props: { children: 'Gold to' } },
              { type: 'span', props: { style: { color: '#d5b46c' }, children: 'Zcash.' } },
            ] : card.title,
          },
        },
        home ? {
          type: 'div',
          props: {
            style: { display: 'flex', position: 'absolute', top: 354, left: 76, fontSize: 32, color: '#c6c2b8' },
            children: 'How money works. Why it changes.',
          },
        } : null,
      ].filter(Boolean),
    },
  };
}
