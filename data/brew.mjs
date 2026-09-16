/**
 * "Bean to Brew" - copy and milestones for the scroll progress journey.
 *
 * SINGLE SOURCE OF TRUTH for the feature's words and for WHERE on the track
 * each real page section sits. tools/build-html.mjs renders these into the
 * header strip as data attributes; scripts/brew.js reads them back from the
 * DOM, so nothing here is duplicated in browser code.
 *
 * `at` is the position on the track (0-1) the bean reaches at the moment the
 * section arrives - NOT a raw page percentage. The script maps scroll offset
 * to track position piecewise between these anchors, so the bean passes each
 * landmark exactly as its section comes into view, however tall the sections
 * are at a given width. The final anchor (1.0) is the footer illustration
 * itself, measured live.
 *
 * Colours and timings live in styles/tokens.css (the --brew-* block).
 */

export const BREW_COPY = {
  cue: 'Keep scrolling. Something good is brewing.',
  caption: 'Your coffee break is getting closer.',
  headline: 'That’s your sign for a coffee break.',
  support: 'Come and find your favourite at Hackberries.',
  again: 'Brew again',
  beanLabel: 'Give the coffee bean a spin',
  progressLabel: 'Page progress',
};

/**
 * `icon`     - landmark illustration drawn on the track, or null for an
 *              anchor that only calibrates the mapping.
 * `mobile`   - whether the landmark is drawn below 48rem. Anchors still count
 *              for the mapping at every width; only the decoration is thinned.
 * `name`     - announced in the progress bar's value text.
 */
export const BREW_MILESTONES = [
  { id: 'favourites',   at: 0.22, icon: 'plate',  mobile: true,  name: 'Favourites' },
  { id: 'menu-preview', at: 0.31, icon: null,     mobile: false, name: 'What we serve' },
  { id: 'the-cafe',     at: 0.40, icon: 'leaf',   mobile: true,  name: 'The café' },
  { id: 'more-about',   at: 0.47, icon: null,     mobile: false, name: 'More about Hackberries' },
  { id: 'gallery',      at: 0.54, icon: 'swirl',  mobile: false, name: 'Gallery' },
  { id: 'visit',        at: 0.72, icon: null,     mobile: false, name: 'Visit us' },
];
