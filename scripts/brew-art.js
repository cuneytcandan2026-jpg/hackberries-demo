/**
 * "Bean to Brew" illustrations.
 *
 * Pure string builders with no DOM access, so the SAME drawings are rendered
 * into static HTML by tools/build-html.mjs and created at runtime by
 * scripts/brew.js (the bean that flies down into the footer cup). One
 * illustration style: soft porcelain, roasted-brown bean, grass-green accents.
 *
 * Every drawing is decorative (aria-hidden) and coloured entirely from the
 * --brew-* tokens in styles/tokens.css via classes in styles/brew.css, so a
 * palette change never means editing path data. Gradient stops use inline
 * `style` because `stop-color` as a presentation attribute cannot read var().
 *
 * `p` is an id prefix: each SVG that defines gradients or clip paths must use
 * a unique one, because ids are document-global.
 */

const stop = (offset, token) =>
  `<stop offset="${offset}" style="stop-color:var(${token})"/>`;

/* ==========================================================================
   Bean
   ========================================================================== */
function beanDefs(p) {
  return `<radialGradient id="${p}-bean" cx="0.36" cy="0.3" r="0.82">
      ${stop(0, '--brew-bean-hi')}${stop(0.52, '--brew-bean')}${stop(1, '--brew-bean-deep')}
    </radialGradient>`;
}

/** The bean's shapes on a 32x32 grid, leaning like a bean at rest. */
function beanShapes(p) {
  return `<g transform="rotate(-32 16 16)">
      <ellipse class="bean-shade" cx="16.6" cy="17" rx="10.4" ry="13.4"/>
      <ellipse class="bean-body" cx="16" cy="16" rx="10.4" ry="13.4" fill="url(#${p}-bean)"/>
      <path class="bean-crease" d="M16.7 3.3c-3.7 3.4-4 8-.9 12.6 3 4.7 2.7 9.2-.7 13"/>
      <path class="bean-crease-hi" d="M18.3 5c-2.7 3.1-2.8 7-.3 10.9 2.5 3.9 2.3 7.6-.1 10.8"/>
      <ellipse class="bean-shine" cx="11.2" cy="10.2" rx="2.2" ry="4.3" transform="rotate(14 11.2 10.2)"/>
    </g>`;
}

export function beanSVG(p, className = 'bean-svg') {
  return `<svg class="${className}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <defs>${beanDefs(p)}</defs>
    ${beanShapes(p)}
  </svg>`;
}

/* ==========================================================================
   Track furniture: the sprout at the start, landmarks, the waiting cup
   ========================================================================== */
export function sproutSVG() {
  return `<svg class="sprout-svg" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path class="sprout-stem" d="M10 19.5V11"/>
    <g class="sprout-leaf sprout-left">
      <path d="M10 12.4C5.6 12.8 3 9.8 3.2 5.8c4.2 0 6.8 2.5 6.8 6.6z"/>
      <path class="sprout-vein" d="M9.6 12 5 7.4"/>
    </g>
    <g class="sprout-leaf sprout-right">
      <path d="M10 10.8c.2-4.2 3.1-6.9 7.1-6.8.2 4-2.5 6.9-7.1 6.8z"/>
      <path class="sprout-vein" d="m10.4 10.4 4.8-4.6"/>
    </g>
  </svg>`;
}

const LANDMARKS = {
  // Food: a plate with a little domed bun on it.
  plate: `<ellipse class="lm-fill" cx="10" cy="13" rx="8.6" ry="3.4"/>
    <ellipse class="lm-inner" cx="10" cy="12.6" rx="5.2" ry="1.9"/>
    <path class="lm-food" d="M6.3 12.2c.3-2.9 1.9-4.4 3.7-4.4s3.4 1.5 3.7 4.4z"/>
    <path class="lm-line lm-draw" pathLength="1" d="M8.4 6c-.8-.9-.2-1.8.4-2.3M11.4 6c-.8-.9-.2-1.8.4-2.3"/>`,
  // The café: a leaf that unfolds.
  leaf: `<g class="lm-unfold">
      <path class="lm-fill" d="M3.6 16.4C3.1 9 8 3.9 16.4 3.6c.5 7.9-4.9 13.2-12.8 12.8z"/>
      <path class="lm-line lm-draw" pathLength="1" d="M4.2 15.8 13.6 6.4M8 12l-.4-3.4M11 9l3 .2"/>
    </g>`,
  // The gallery / the room: a coffee swirl seen from above.
  swirl: `<circle class="lm-fill" cx="10" cy="10" r="7.6"/>
    <path class="lm-line lm-draw" pathLength="1"
          d="M10 10.3c0-1.1 1.4-1.5 2.1-.6 1 1.1.1 2.9-1.5 3.1-2.1.2-3.5-1.8-3-3.7.6-2.4 3.6-3.4 5.6-2"/>`,
};

export function landmarkSVG(icon) {
  return `<svg class="lm-svg lm-${icon}" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    ${LANDMARKS[icon] || ''}
  </svg>`;
}

/** The small cup waiting at the end of the track. */
export function miniCupSVG() {
  return `<svg class="mini-cup-svg" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
    <path class="mini-steam" pathLength="1" d="M15.4 10.6c-2.4-1.9-.6-4 .8-5.2 1.5-1.3 1.6-3 .3-4.4"/>
    <path class="mini-steam mini-steam-2" pathLength="1" d="M20.4 10.8c-2-1.6-.5-3.4.7-4.4 1.2-1.1 1.3-2.5.2-3.7"/>
    <ellipse class="mini-saucer" cx="17" cy="31.2" rx="14.5" ry="2.7"/>
    <path class="mini-handle" d="M26.6 18.2c3.8-.7 5.1 2.7 3.2 5.1-1 1.3-2.7 1.7-4.4 1.7"/>
    <path class="mini-body" d="M5.8 14.6h22.4c0 7.8-2.6 14.9-8.8 15.4h-4.8C8.4 29.5 5.8 22.4 5.8 14.6z"/>
    <path class="mini-band" d="M6.1 19.6h21.8c-.2 1.3-.4 2.4-.7 3.4H6.8c-.3-1-.5-2.1-.7-3.4z"/>
    <ellipse class="mini-rim" cx="17" cy="14.6" rx="11.2" ry="3.1"/>
    <ellipse class="mini-inside" cx="17" cy="14.8" rx="9.4" ry="2.2"/>
    <ellipse class="mini-coffee" cx="17" cy="15" rx="8.8" ry="1.9"/>
  </svg>`;
}

/* ==========================================================================
   The footer cup
   --------------------------------------------------------------------------
   Drawn back to front: green disc and sprigs, saucer, handle, porcelain body
   with its green band, rim, empty interior, then the coffee (clipped to the
   mouth), then the falling bean (clipped so it vanishes INTO the cup), then
   steam. Every animated part has its own class; the sequence itself lives in
   styles/brew.css and is keyed off data-state on the wrapper.
   ========================================================================== */
function rosetta() {
  // A leaf-shaped latte-art pattern: nested chevrons along a pulled-through
  // stem, largest at the root. Built on a flat plane, then squashed onto the
  // surface ellipse by the parent group's transform.
  const xs = [-30, -20, -10, 0, 9, 17];
  const hs = [19, 19, 17, 14, 10.5, 6.5];
  const layers = xs.map((x, i) =>
    `<path class="bc-art-line" pathLength="1" style="--k:${i}" d="M${x - 3} ${-hs[i]}Q${x + 9} 0 ${x - 3} ${hs[i]}"/>`
  ).join('');
  // A soft foam body under the ridges, so the pattern reads as a leaf.
  const foam = '<path class="bc-art-foam" d="M-40 0C-36-26 6-28 30 0 6 28-36 26-40 0z"/>';
  return `${foam}${layers}<path class="bc-art-line bc-art-stem" pathLength="1" style="--k:6" d="M-36 0H27"/>`;
}

export function footerCupSVG(p = 'fc') {
  return `<svg class="brew-cup-svg" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
  <defs>
    ${beanDefs(p)}
    <linearGradient id="${p}-porcelain" x1="0" x2="1" y1="0" y2="0">
      ${stop(0, '--brew-porcelain-shade')}${stop(0.34, '--brew-porcelain')}${stop(0.7, '--brew-porcelain')}${stop(1, '--brew-porcelain-shade')}
    </linearGradient>
    <radialGradient id="${p}-crema" cx="0.46" cy="0.42" r="0.62">
      ${stop(0, '--brew-crema-hi')}${stop(0.55, '--brew-crema')}${stop(1, '--brew-coffee')}
    </radialGradient>
    <clipPath id="${p}-inside"><ellipse cx="120" cy="99" rx="56" ry="16.5"/></clipPath>
    <clipPath id="${p}-mouth">
      <rect x="0" y="0" width="240" height="99"/>
      <ellipse cx="120" cy="99" rx="56" ry="16.5"/>
    </clipPath>
    <clipPath id="${p}-body">
      <path d="M56 98h128c0 52-14 96-50 102h-28c-36-6-50-50-50-102z"/>
    </clipPath>
  </defs>

  <g class="bc-backdrop">
    <circle class="bc-disc" cx="120" cy="126" r="104"/>
    <circle class="bc-disc-ring" cx="120" cy="126" r="92"/>
    <g class="bc-sprig bc-sprig-left">
      <path class="bc-sprig-stem" d="M34 176c10-22 22-40 40-54"/>
      <path class="bc-sprig-leaf" d="M44 156c-12-2-18-12-16-24 12 1 18 11 16 24z"/>
      <path class="bc-sprig-leaf" d="M58 138c-2-12 5-21 17-24 2 12-5 21-17 24z"/>
    </g>
    <g class="bc-sprig bc-sprig-right">
      <path class="bc-sprig-stem" d="M214 150c-8-18-20-30-36-38"/>
      <path class="bc-sprig-leaf" d="M204 134c12-4 16-15 12-26-12 3-16 14-12 26z"/>
    </g>
  </g>

  <g class="bc-cup">
    <ellipse class="bc-shadow" cx="120" cy="212" rx="90" ry="12"/>
    <ellipse class="bc-saucer" cx="120" cy="204" rx="92" ry="17"/>
    <ellipse class="bc-saucer-in" cx="120" cy="201" rx="54" ry="8.5"/>
    <path class="bc-handle" d="M178 116c26-8 40 10 32 30-6 15-22 20-38 20"/>
    <path class="bc-body" fill="url(#${p}-porcelain)" d="M56 98h128c0 52-14 96-50 102h-28c-36-6-50-50-50-102z"/>
    <g clip-path="url(#${p}-body)">
      <rect class="bc-band" x="40" y="134" width="160" height="13"/>
      <rect class="bc-band-thin" x="40" y="152" width="160" height="3"/>
    </g>
    <ellipse class="bc-rim" cx="120" cy="98" rx="64" ry="20"/>
    <ellipse class="bc-inside" cx="120" cy="99" rx="56" ry="16.5"/>

    <g clip-path="url(#${p}-inside)">
      <g class="bc-coffee">
        <ellipse class="bc-surface" cx="120" cy="100" rx="56" ry="16.5" fill="url(#${p}-crema)"/>
        <g transform="translate(118 100) scale(1 0.6)">
          <g class="bc-art">${rosetta()}</g>
        </g>
      </g>
      <ellipse class="bc-splash" cx="120" cy="101" rx="22" ry="6"/>
    </g>

    <g clip-path="url(#${p}-mouth)">
      <g class="bc-drop">
        <g transform="translate(96 14) scale(1.5)">${beanShapes(p)}</g>
      </g>
    </g>
  </g>

  <g class="bc-steam">
    <path class="bc-steam-line" style="--k:0" pathLength="1" d="M98 76c-10-10-2-20 4-26 7-7 6-16-2-24"/>
    <path class="bc-steam-line" style="--k:1" pathLength="1" d="M122 70c-9-12 1-22 7-28 6-7 4-17-3-26"/>
    <path class="bc-steam-line" style="--k:2" pathLength="1" d="M145 78c-8-9-1-17 4-22 6-6 5-13-1-19"/>
  </g>
</svg>`;
}

/** Geometry the flight needs to hand the bean over to the footer drawing. */
export const FOOTER_CUP_GEOMETRY = {
  viewBox: 240,
  // Centre and height, in viewBox units, of the falling bean's start pose.
  dropCentre: { x: 120, y: 38 },
  dropSize: 48,
};
