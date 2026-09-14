// Editorially reviewed event-to-section relationships. Keys are source-volume,
// display date and event label; a changed source row must be deliberately remapped.
// Unlisted events link to their source timeline, not a guessed chapter section.
export const TIMELINE_SECTION_REFS = Object.freeze({
  'after|15 Aug 1971|Nixon suspends gold convertibility, 10% import surcharge, price freeze': ['after', '01', 'what-actually-happened-on-15-august-1971'],
  'after|Dec 1971|Smithsonian Agreement: dollar to $38/oz, bands ±2.25%': ['after', '01', 'the-smithsonian-agreement-december-1971'],
  'after|Oct 1973|Yom Kippur War; OPEC embargo; oil quadruples': ['after', '01', 'the-oil-shock-forces-the-issue-1973-74'],
  'after|8 Jun 1974|US–Saudi Joint Commission established': ['after', '02', 'the-petrodollar-invoicing-and-recycling-not-redemption'],
  'after|26 Jun 1974|Herstatt Bank fails': ['after', '01', 'herstatt-and-the-birth-of-banking-rules-1974'],
  'after|Jan 1976|Jamaica Accords (in force Apr 1978)': ['after', '01', 'legalising-the-accident-the-jamaica-accords-1976'],
  'after|Aug–Oct 1979|Volcker appointed; 6 Oct reserve-targeting shift': ['after', '02', 'the-volcker-shock-1979-82'],
  'after|Aug 1982|Mexico announces it cannot pay': ['after', '03', 'the-latin-american-debt-crisis-1982-89'],
  'after|Sep 1985|Plaza Accord': ['after', '03', 'the-strong-dollar-and-the-plaza-accord-1985'],
  'after|19 Oct 1987|Black Monday, Dow −22.6%': ['after', '03', 'black-monday-19-october-1987'],
  'after|May 1997|Bank of England independence': ['after', '04', 'the-independence-wave'],
  'after|2 Jul 1997|Thai baht floats': ['after', '05', 'the-asian-financial-crisis-1997-98'],
  'after|Mar 2003|Iraq invaded': ['after', '06', '9-11-afghanistan-and-iraq-2001-21'],
  'after|15 Sep 2008|Lehman fails; AIG rescued; TARP (3 Oct); swap lines; China stimulus (Nov)': ['after', '07', 'the-crash-2007-09'],
  'after|31 Oct 2008|Bitcoin whitepaper published': ['bitcoin', '01', 'the-moment-of-birth'],
  'after|3 Jan 2009|Bitcoin genesis block mined': ['bitcoin', '01', 'the-moment-of-birth'],
  'after|Nov–Dec 2008|G20 leaders\' summit; QE1; Fed to zero (16 Dec)': ['after', '07', 'quantitative-easing-the-invention-of-a-new-instrument'],
  'after|24 Feb 2022|Russia invades Ukraine; ~$300 bn reserves frozen; SWIFT cut-offs': ['after', '09', 'the-weaponisation-of-reserves-and-the-return-of-gold-2022-26']
});

export function timelineReferenceKey(vol, date, event) {
  return `${vol}|${date}|${event}`;
}
