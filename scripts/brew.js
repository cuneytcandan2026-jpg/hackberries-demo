/**
 * "Bean to Brew" - scroll journey and footer reveal.
 *
 * Two parts, one module, one teardown:
 *
 * 1. THE STRIP. Scroll offset is mapped to a track position piecewise between
 *    the real sections (data-brew-anchor in the markup, from data/brew.mjs),
 *    so the bean reaches each landmark as its section arrives. The bean does
 *    not jump to that value: it follows it on a critically damped spring,
 *    which gives a natural settle when scrolling stops, a smooth reversal
 *    when scrolling back up, and a velocity to derive lean and squash from.
 *    The rAF loop only runs while the bean is catching up or hopping; at rest
 *    the page does no per-frame work at all.
 *
 * 2. THE REVEAL. When the footer illustration itself is at least 40% on
 *    screen (IntersectionObserver on the drawing, not a page percentage), the
 *    bean leaves the strip, flies down into the footer cup and the CSS
 *    sequence in styles/brew.css brews it. Once per page visit; afterwards the
 *    cup stays full and "Brew again" replays only the drawing.
 *
 * The page's scrolling is never touched: passive listeners, no
 * preventDefault, no scroll snapping, nothing gated on the animation.
 */
import { motion, rafBatch } from './motion.js';
import { beanSVG, FOOTER_CUP_GEOMETRY } from './brew-art.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Numeric value of a --brew-* token ("420ms" -> 420, "190" -> 190). */
function token(name, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function initBrew() {
  const strip = document.getElementById('brew-strip');
  const track = document.getElementById('brew-track');
  const slot = document.getElementById('brew-bean-slot');
  const beanButton = document.getElementById('brew-bean');
  const miniCup = document.getElementById('brew-mini-cup');
  const progressbar = document.getElementById('brew-progress');
  const art = document.getElementById('brew-art');
  const again = document.getElementById('brew-again');
  if (!strip || !track || !slot || !beanButton) return () => {};

  const hopEl = slot.querySelector('.brew-bean-hop');
  const leanEl = slot.querySelector('.brew-bean-lean');
  const rollEl = slot.querySelector('.brew-bean-roll');

  const T = {
    spring: token('--brew-spring', 190),
    hop: token('--brew-hop', 420),
    hopHeight: token('--brew-hop-height', 9),
    intro: token('--brew-intro', 900),
    flight: token('--brew-flight', 950),
    total: token('--brew-total', 3900),
  };

  const marks = Array.from(strip.querySelectorAll('[data-brew-anchor]')).map((el) => ({
    el,
    at: parseFloat(el.dataset.at),
    name: el.dataset.name || '',
    section: document.getElementById(el.dataset.brewAnchor),
    drawn: !el.classList.contains('brew-anchor'),
    passed: false,
  }));

  let reduced = motion.reduced;
  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
    return id;
  };

  /* ==========================================================================
     Measuring: scroll offset -> track position
     ========================================================================== */
  let anchors = [{ y: 0, at: 0 }, { y: 1, at: 1 }];
  let trackW = 0;
  let radius = 12;

  const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  function measure() {
    const vh = window.innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);

    // A section "arrives" when its top reaches 45% of the viewport.
    const points = [{ y: 0, at: 0 }];
    for (const m of marks) {
      if (m.section) points.push({ y: docTop(m.section) - vh * 0.45, at: m.at });
    }
    // The destination is the footer drawing, centred a little below middle -
    // or the bottom of the page, if the page cannot scroll that far.
    let endY = max;
    if (art) {
      const r = art.getBoundingClientRect();
      endY = Math.min(max, r.top + window.scrollY + r.height * 0.5 - vh * 0.55);
    }
    points.push({ y: endY, at: 1 });

    // Strictly increasing, and the end must stay reachable.
    for (let i = 1; i < points.length; i += 1) {
      points[i].y = Math.max(points[i].y, points[i - 1].y + 1);
    }
    const last = points.length - 1;
    points[last].y = Math.min(points[last].y, max);
    for (let i = last - 1; i >= 0; i -= 1) {
      points[i].y = Math.min(points[i].y, points[i + 1].y - 1);
    }
    points[0].y = Math.min(points[0].y, 0);

    anchors = points;
    trackW = track.clientWidth;
    radius = Math.max(4, rollEl.offsetWidth / 2);
  }

  function mapScroll(y) {
    if (y <= anchors[0].y) return 0;
    for (let i = 1; i < anchors.length; i += 1) {
      const a = anchors[i - 1];
      const b = anchors[i];
      if (y <= b.y) return a.at + ((y - a.y) / (b.y - a.y)) * (b.at - a.at);
    }
    return 1;
  }

  /* ==========================================================================
     The bean
     ========================================================================== */
  let target = 0;
  let pos = 0;
  let vel = 0;
  let raf = 0;
  let lastFrame = 0;
  let hopStart = -1;
  let stage = '1';
  let state = 'idle'; // idle | flying | brewing | brewed

  const readTarget = () => {
    // While the mobile menu is open the body is position:fixed and scrollY
    // reads 0. The bean should not roll home behind the panel.
    if (document.body.style.position === 'fixed') return target;
    return clamp(mapScroll(window.scrollY), 0, 1);
  };

  function paint(now) {
    const x = pos * trackW;
    slot.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    strip.style.setProperty('--brew-p', pos.toFixed(4));

    if (reduced) {
      rollEl.style.transform = '';
      leanEl.style.transform = '';
      hopEl.style.transform = '';
    } else {
      // Rolling without slipping: distance travelled over the bean's radius.
      rollEl.style.transform = `rotate(${((x / radius) * 57.2958).toFixed(1)}deg)`;
      const vpx = vel * trackW;
      const squash = Math.min(0.14, Math.abs(vpx) / 2400);
      const lean = clamp(vpx / 130, -12, 12);
      leanEl.style.transform =
        `rotate(${lean.toFixed(2)}deg) scale(${(1 + squash).toFixed(3)}, ${(1 - squash * 0.75).toFixed(3)})`;
      const u = hopStart >= 0 ? (now - hopStart) / T.hop : 1;
      hopEl.style.transform = u < 1
        ? `translateY(${(-Math.sin(Math.PI * u) * T.hopHeight).toFixed(2)}px)`
        : '';
      if (u >= 1) hopStart = -1;
    }

    // Stage three draws the steam above the waiting cup as the bean nears it.
    strip.style.setProperty('--brew-steam-off', (1 - clamp((pos - 0.55) / 0.3, 0, 1)).toFixed(3));
    strip.style.setProperty('--brew-steam-off-2', (1 - clamp((pos - 0.7) / 0.2, 0, 1)).toFixed(3));

    const nextStage = pos < 0.2 ? '1' : pos < 0.55 ? '2' : pos < 0.85 ? '3' : '4';
    if (nextStage !== stage) {
      stage = nextStage;
      strip.dataset.stage = stage;
    }
    strip.classList.toggle('is-cupped', state === 'brewed' && pos > 0.97);
  }

  function crossings(prev, now, allowResponses) {
    const forward = pos > prev;
    for (const m of marks) {
      if (!m.drawn) continue;
      const passed = pos >= m.at - 0.004;
      if (passed === m.passed) continue;
      m.passed = passed;
      m.el.classList.toggle('is-passed', passed);
      // Hidden on this breakpoint (mobile shows fewer landmarks): no response.
      if (!passed || !forward || !allowResponses || m.el.offsetParent === null) continue;
      m.el.classList.remove('is-hit');
      void m.el.offsetWidth; // restart the one-shot animation
      m.el.classList.add('is-hit');
      later(() => m.el.classList.remove('is-hit'), 800);
      if (hopStart < 0) hopStart = now;
    }
    if (allowResponses && forward && prev < 0.995 && pos >= 0.995 && miniCup) {
      miniCup.classList.remove('is-catch');
      void miniCup.offsetWidth;
      miniCup.classList.add('is-catch');
      later(() => miniCup.classList.remove('is-catch'), 600);
    }
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min(1 / 30, lastFrame ? (now - lastFrame) / 1000 : 1 / 60);
    lastFrame = now;
    const prev = pos;

    if (reduced) {
      pos = target;
      vel = 0;
    } else {
      const k = T.spring;
      const c = 2 * Math.sqrt(k); // critically damped: no overshoot past the truth
      vel += (k * (target - pos) - c * vel) * dt;
      pos += vel * dt;
      if (Math.abs(target - pos) < 0.0004 && Math.abs(vel) < 0.003) {
        pos = target;
        vel = 0;
      }
    }

    crossings(prev, now, !reduced);
    paint(now);

    if (pos !== target || vel !== 0 || hopStart >= 0) {
      raf = requestAnimationFrame(frame);
    } else {
      lastFrame = 0;
    }
  }

  const run = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
  };

  /** Jump straight to the truth, with no travel and no landmark responses. */
  function snap() {
    target = readTarget();
    const prev = pos;
    pos = target;
    vel = 0;
    hopStart = -1;
    crossings(prev, performance.now(), false);
    paint(performance.now());
  }

  /* ---- Assistive tech: coarse, silent progress ---------------------------- */
  let lastValueText = '';
  function describe() {
    const pct = Math.round((target * 100) / 5) * 5;
    let where = 'top of the page';
    for (const m of marks) if (target >= m.at - 0.01) where = m.name;
    if (target >= 0.999) where = 'the footer';
    const text = `${pct}%, ${where}`;
    if (text === lastValueText || !progressbar) return;
    lastValueText = text;
    progressbar.setAttribute('aria-valuenow', String(pct));
    progressbar.setAttribute('aria-valuetext', text);
  }

  /* ---- Listeners ---------------------------------------------------------- */
  const onScroll = () => {
    target = readTarget();
    describe();
    run();
  };

  const remeasure = rafBatch(() => {
    measure();
    target = readTarget();
    describe();
    // Width changed: the bean stays at the same fraction, repainted at once.
    paint(performance.now());
    run();
  });

  const onVisibility = () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastFrame = 0;
    } else {
      snap();
    }
  };

  const onBean = () => {
    // Play only. The progress value is deliberately untouched.
    beanButton.classList.remove('is-spinning');
    void beanButton.offsetWidth;
    beanButton.classList.add('is-spinning');
    later(() => beanButton.classList.remove('is-spinning'), 760);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', remeasure, { passive: true });
  window.addEventListener('load', remeasure);
  document.addEventListener('visibilitychange', onVisibility);
  beanButton.addEventListener('click', onBean);
  document.fonts?.ready?.then(remeasure).catch(() => {});

  // Late-loading images and the reveal system change the page height.
  let bodyObserver = null;
  if ('ResizeObserver' in window) {
    bodyObserver = new ResizeObserver(() => remeasure());
    bodyObserver.observe(document.body);
  }

  measure();
  snap(); // a reload halfway down starts where the reader is, not at zero
  describe();

  if (!reduced && window.scrollY < 40) {
    strip.classList.add('is-intro');
    later(() => strip.classList.remove('is-intro'), T.intro + 900);
  }

  /* ==========================================================================
     The footer reveal
     ========================================================================== */
  let flyer = null;
  let flightRaf = 0;
  let artObserver = null;

  function setAgainBusy(busy) {
    if (!again) return;
    again.setAttribute('aria-disabled', String(busy));
  }

  function finish() {
    state = 'brewed';
    if (art) art.dataset.state = 'brewed';
    strip.classList.remove('is-flying');
    strip.classList.add('is-brewed');
    paint(performance.now());
    if (!again) return;
    setAgainBusy(false);
    if (reduced) {
      again.hidden = true;
      return;
    }
    if (again.hidden) {
      again.hidden = false;
      again.classList.add('is-arriving');
      later(() => again.classList.remove('is-arriving'), 600);
    }
    art.classList.add('is-fresh');
    later(() => art.classList.remove('is-fresh'), 11000);
  }

  function brew() {
    state = 'brewing';
    setAgainBusy(true);
    art.classList.remove('is-fresh');
    art.dataset.state = 'empty';
    void art.offsetWidth; // commit the empty cup so the sequence restarts
    art.dataset.state = 'brewing';
    later(finish, T.total);
  }

  function endFlight() {
    if (flightRaf) cancelAnimationFrame(flightRaf);
    flightRaf = 0;
    flyer?.remove();
    flyer = null;
  }

  function fly() {
    state = 'flying';
    snap();

    const drawing = art.querySelector('svg');
    const from = beanButton.getBoundingClientRect();
    const startSize = rollEl.getBoundingClientRect().width || 30;

    flyer = document.createElement('span');
    flyer.className = 'brew-flyer';
    flyer.setAttribute('aria-hidden', 'true');
    flyer.innerHTML = beanSVG('flyer');
    document.body.append(flyer);
    strip.classList.add('is-flying');

    const G = FOOTER_CUP_GEOMETRY;
    const t0 = performance.now();
    const sx = from.left + from.width / 2;
    const sy = from.top + from.height / 2;

    const step = (now) => {
      flightRaf = 0;
      const u = clamp((now - t0) / T.flight, 0, 1);
      const e = easeInOutCubic(u);
      // The target is re-read every frame, so scrolling mid-flight is fine.
      const r = drawing.getBoundingClientRect();
      const unit = r.width / G.viewBox;
      const ex = r.left + G.dropCentre.x * unit;
      const ey = r.top + G.dropCentre.y * unit;
      // One arc: a small lift out of the strip, then down into the cup.
      const cx = sx + (ex - sx) * 0.35;
      const cy = Math.max(8, sy - 70);
      const x = (1 - e) ** 2 * sx + 2 * (1 - e) * e * cx + e * e * ex;
      const y = (1 - e) ** 2 * sy + 2 * (1 - e) * e * cy + e * e * ey;
      const size = startSize + (G.dropSize * unit - startSize) * e;
      flyer.style.transform =
        `translate3d(${(x - 16).toFixed(1)}px, ${(y - 16).toFixed(1)}px, 0) rotate(${(e * 720).toFixed(1)}deg) scale(${(size / 32).toFixed(3)})`;

      if (u < 1) {
        flightRaf = requestAnimationFrame(step);
      } else {
        endFlight();
        strip.classList.remove('is-flying');
        strip.classList.add('is-brewed');
        brew();
      }
    };
    flightRaf = requestAnimationFrame(step);
  }

  const onAgain = () => {
    if (state !== 'brewed' || reduced) return;
    brew();
  };

  if (art) {
    // The markup ships the finished cup for no-JS visitors. Under reduced
    // motion that is exactly what is wanted; otherwise empty it for the brew.
    art.dataset.state = reduced ? 'brewed' : 'empty';
    artObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.4 || state !== 'idle') return;
        if (reduced) {
          finish();
        } else if (document.hidden) {
          brew();
        } else {
          fly();
        }
      },
      { threshold: [0, 0.4, 0.7, 1] }
    );
    artObserver.observe(art);
    again?.addEventListener('click', onAgain);
  }

  /* ---- A preference change mid-session ------------------------------------ */
  const offMotion = motion.onChange((isReduced) => {
    reduced = isReduced;
    if (isReduced) {
      endFlight();
      strip.classList.remove('is-intro', 'is-flying');
      if (state === 'flying' || state === 'brewing') finish();
      if (state === 'brewed' && again) again.hidden = true;
      if (state === 'idle' && art) art.dataset.state = 'brewed';
    } else if (state === 'brewed' && again) {
      again.hidden = false;
    } else if (state === 'idle' && art) {
      art.dataset.state = 'empty';
    }
    snap();
  });

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', remeasure);
    window.removeEventListener('load', remeasure);
    document.removeEventListener('visibilitychange', onVisibility);
    beanButton.removeEventListener('click', onBean);
    again?.removeEventListener('click', onAgain);
    bodyObserver?.disconnect();
    artObserver?.disconnect();
    offMotion();
    remeasure.cancel();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    endFlight();
    for (const id of timers) clearTimeout(id);
    timers.clear();
  };
}
