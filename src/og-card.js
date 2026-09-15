// The sharing-card content and visual language live here so the build renderer
// and the page-metadata resolver agree on exactly what a card represents.
export const OG_CARD_WIDTH = 1200;
export const OG_CARD_HEIGHT = 630;
export const OG_CARD_TEMPLATE_VERSION = 'title-card-v3';
export const OG_CARD_FONT_FAMILY = 'IBM Plex Sans';
export const OG_CARD_DOMAIN = 'goldtozcash.vercel.app';

const VOLUME_NAME = { gold: 'Gold', after: 'After Gold', bitcoin: 'Bitcoin' };
const VOLUME_ROMAN = { gold: 'I', after: 'II', bitcoin: 'III' };

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
  if (page.kind === 'home') return 'How money works—and why it changes';
  return withoutSiteSuffix(page.headline || page.title) || 'Money Research';
}

export function cardVolumeLabel(page) {
  if (!page.vol || !VOLUME_NAME[page.vol]) return '';
  return `Volume ${VOLUME_ROMAN[page.vol]} · ${VOLUME_NAME[page.vol]}`;
}

export function cardAlt(page) {
  const title = cardTitle(page);
  const volume = cardVolumeLabel(page);
  return `${volume ? `${volume} — ` : ''}${title}. Money Research sharing card.`;
}

export function ogCardDefinition(page) {
  return {
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
  const titleSize = cardTitleFontSize(card.title);
  return {
    type: 'div',
    props: {
      style: {
        width: `${OG_CARD_WIDTH}px`,
        height: `${OG_CARD_HEIGHT}px`,
        display: 'flex',
        position: 'relative',
        padding: '66px 84px 58px',
        boxSizing: 'border-box',
        backgroundColor: '#121211',
        color: '#f6f4ee',
        fontFamily: OG_CARD_FONT_FAMILY,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', position: 'absolute', top: 66, left: 84, alignItems: 'center', gap: 18, color: '#d5b46c' },
            children: [
              { type: 'div', props: { style: { display: 'flex', width: '54px', height: '4px', backgroundColor: '#d5b46c' } } },
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
            style: {
              display: 'flex',
              position: 'absolute',
              top: 154,
              left: 84,
              width: 1032,
              height: 300,
              alignItems: 'center',
              fontSize: `${titleSize}px`,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              overflow: 'hidden',
            },
            children: card.title,
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', position: 'absolute', left: 84, bottom: 58, flexDirection: 'column', gap: 9, color: '#b7b3a9' },
            children: [
              card.volume
                ? {
                  type: 'div',
                  props: {
                    style: { display: 'flex', fontSize: '18px', fontWeight: 600, letterSpacing: '0.04em' },
                    children: card.volume,
                  },
                }
                : null,
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: '17px', fontWeight: 600, letterSpacing: '0.04em' },
                  children: OG_CARD_DOMAIN,
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  };
}
