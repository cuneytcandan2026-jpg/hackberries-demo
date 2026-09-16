/**
 * "Find your favourite" - the photograph slats.
 *
 * STATE MODEL
 * -----------
 * A single `index` governs the open slat, the card text, the counter and the
 * progress segments. Every render reads that one value and writes all of
 * them, so rapid clicking cannot desynchronise text from imagery.
 *
 * Autoplay has no timer of its own. The current segment's fill is a CSS
 * animation lasting `--fav-dwell`; its `animationend` advances the showcase.
 * Pausing the animation therefore pauses the showcase, and what the progress
 * bars show is always exactly how long is left.
 */
import { SHOWCASE, PHOTOS } from '../data/media.mjs';
import { motion, whileVisible, finePointer } from './motion.js';

const PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4h4v16H7zM13 4h4v16h-4z"/></svg>';

export function initShowcase() {
  const root = document.querySelector('[data-showcase]');
  const rail = root?.querySelector('[data-fav-rail]');
  if (!root || !rail) return () => {};

  const slats = Array.from(root.querySelectorAll('[data-showcase-index]'));
  const layers = Array.from(root.querySelectorAll('[data-showcase-layer]'));
  const segs = Array.from(root.querySelectorAll('[data-fav-seg]'));
  const wash = root.querySelector('[data-stage-wash]');
  const readout = root.querySelector('#sc-readout');
  const elTitle = root.querySelector('[data-sc-title]');
  const elText = root.querySelector('[data-sc-text]');
  const elMenuName = root.querySelector('[data-sc-menuname]');
  const elAlt = root.querySelector('[data-sc-alt]');
  const elLink = root.querySelector('[data-sc-link]');
  const elCount = root.querySelector('[data-sc-count]');
  const roll = root.querySelector('[data-fav-roll]');
  const btnPrev = root.querySelector('[data-showcase-prev]');
  const btnNext = root.querySelector('[data-showcase-next]');
  const btnPlay = root.querySelector('[data-showcase-play]');
  const playIcon = root.querySelector('[data-play-icon]');
  const playLabel = root.querySelector('[data-play-label]');
  const ring = root.querySelector('.fav-play-ring circle');
  const cursor = root.querySelector('[data-fav-cursor]');

  if (!slats.length || slats.length !== SHOWCASE.length) return () => {};

  const cleanups = [];
  const on = (el, type, fn, opts) => {
    if (!el) return;
    el.addEventListener(type, fn, opts);
    cleanups.push(() => el.removeEventListener(type, fn, opts));
  };

  const count = SHOWCASE.length;
  const wrap = (i) => ((i % count) + count) % count;

  let index = 0;
  let playing = false;
  let paused = false;
  let started = false;
  let swapTimer = null;
  let ghostTimer = null;

  /* ---- The clock --------------------------------------------------------- */
  // Restarting a CSS animation on the same element needs a style flush in
  // between; a slat or segment that newly matches restarts by itself.
  const restart = (el) => {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  };
  const restartClock = () => {
    restart(segs[index]?.firstElementChild);
    restart(slats[index].querySelector('.fav-bar i'));
    restart(ring);
  };

  /* ---- Counter ----------------------------------------------------------- */
  function rollCount(text, direction) {
    if (!elCount || elCount.textContent === text) return;
    if (motion.reduced || !direction || !roll) {
      elCount.textContent = text;
      return;
    }
    roll.querySelectorAll('.fav-count-ghost').forEach((g) => g.remove());
    const ghost = document.createElement('span');
    ghost.className = 'fav-count-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = elCount.textContent;
    roll.append(ghost);
    elCount.textContent = text;
    roll.dataset.dir = direction > 0 ? 'fwd' : 'back';
    roll.classList.remove('is-rolling');
    void roll.offsetWidth;
    roll.classList.add('is-rolling');
    clearTimeout(ghostTimer);
    ghostTimer = setTimeout(() => {
      ghost.remove();
      roll.classList.remove('is-rolling');
    }, 560);
  }

  /* ---- Render: one function, one source of truth ------------------------ */
  function render(next, direction) {
    const previous = index;
    index = wrap(next);
    if (index === previous && direction !== 0) return;

    const item = SHOWCASE[index];
    const photo = PHOTOS[item.photo];

    slats.forEach((slat, i) => {
      const open = i === index;
      slat.setAttribute('aria-selected', String(open));
      slat.tabIndex = open ? 0 : -1;
      if (!open) {
        slat.style.removeProperty('--px');
        slat.style.removeProperty('--py');
      }
    });
    layers.forEach((img, i) => img.classList.toggle('is-shown', i === index));
    segs.forEach((seg, i) => {
      seg.classList.toggle('is-done', i < index);
      seg.classList.toggle('is-current', i === index);
    });

    readout?.setAttribute('aria-labelledby', `sc-tab-${item.id}`);
    wash?.style.setProperty('--wash', photo.placeholder);
    rollCount(String(index + 1).padStart(2, '0'), direction);
    if (playing) restartClock();

    const write = () => {
      if (elMenuName) elMenuName.textContent = item.menuName;
      if (elTitle) elTitle.textContent = item.title;
      if (elText) elText.textContent = item.text;
      if (elAlt) elAlt.textContent = photo.alt;
      if (elLink && item.href) elLink.setAttribute('href', item.href);
      root.classList.remove('is-swapping');
    };

    clearTimeout(swapTimer);
    if (motion.reduced || !direction) {
      write();
    } else {
      root.classList.add('is-swapping');
      swapTimer = setTimeout(write, 150);
    }
  }

  /* ---- Autoplay --------------------------------------------------------- */
  function syncPaused() {
    root.classList.toggle('is-paused', playing && paused);
  }

  function setPlaying(want) {
    // Autoplay never runs under reduced motion.
    playing = want && !motion.reduced;
    root.classList.toggle('is-playing', playing);
    btnPlay?.setAttribute('aria-pressed', String(playing));
    // A dish announced every five seconds would drown a screen reader out.
    readout?.setAttribute('aria-live', playing ? 'off' : 'polite');
    if (playLabel) playLabel.textContent = playing ? 'Pause showcase' : 'Play showcase';
    if (playIcon) playIcon.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
    if (playing) restartClock();
    syncPaused();
  }

  const setPaused = (want) => {
    if (paused === want) return;
    paused = want;
    syncPaused();
  };

  on(root, 'animationend', (event) => {
    if (!playing || event.animationName !== 'fav-fill') return;
    if (event.target !== segs[index]?.firstElementChild) return;
    render(index + 1, 1);
  });

  /* ---- Selection --------------------------------------------------------- */
  let suppressClick = false;

  function select(next, direction) {
    started = true;
    if (playing) setPlaying(false);
    render(next, direction);
  }

  slats.forEach((slat, i) => {
    on(slat, 'click', () => {
      if (suppressClick) return;
      // Clicking the open photograph is a sign of interest: autoplay stops.
      if (i === index) {
        started = true;
        if (playing) setPlaying(false);
        return;
      }
      select(i, i > index ? 1 : -1);
      hideCursor();
    });
    // Roving tabindex, per the tablist pattern.
    on(slat, 'keydown', (event) => {
      const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let target = null;
      let direction = 0;
      if (event.key in map) {
        direction = map[event.key];
        target = index + direction;
      } else if (event.key === 'Home') {
        target = 0;
        direction = -1;
      } else if (event.key === 'End') {
        target = count - 1;
        direction = 1;
      }
      if (target === null) return;
      event.preventDefault();
      select(target, direction);
      slats[index].focus();
    });
  });

  on(btnPrev, 'click', () => select(index - 1, -1));
  on(btnNext, 'click', () => select(index + 1, 1));
  on(btnPlay, 'click', () => {
    started = true;
    setPlaying(!playing);
  });

  /* ---- Pausing ------------------------------------------------------------ */
  // Scoped to the photographs and the text, never the controls: pausing on
  // the whole card would pause the showcase the instant Play was pressed.
  const pauseZones = [rail, readout].filter(Boolean);
  const inPauseZone = (node) => node instanceof Node && pauseZones.some((z) => z.contains(node));
  pauseZones.forEach((zone) => {
    on(zone, 'mouseenter', () => setPaused(true));
    on(zone, 'mouseleave', () => setPaused(false));
  });
  on(root, 'focusin', (event) => { if (inPauseZone(event.target)) setPaused(true); });
  on(root, 'focusout', (event) => { if (!inPauseZone(event.relatedTarget)) setPaused(false); });

  /* ---- Pointer: follow label, parallax and glare -------------------------- */
  let rafId = 0;
  let cx = 0;
  let cy = 0;
  let tx = 0;
  let ty = 0;
  let cursorOn = false;

  const tick = () => {
    cx += (tx - cx) * 0.22;
    cy += (ty - cy) * 0.22;
    if (cursor) cursor.style.translate = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
    rafId = Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(tick) : 0;
  };

  function showCursor(want) {
    if (!cursor || cursorOn === want) return;
    if (want) {
      cx = tx;
      cy = ty;
      cursor.style.translate = `${cx}px ${cy}px`;
    }
    cursorOn = want;
    cursor.classList.toggle('is-on', want);
  }
  function hideCursor() { showCursor(false); }

  on(rail, 'pointermove', (event) => {
    if (event.pointerType !== 'mouse' || motion.reduced || !finePointer.matches) return;
    const box = root.getBoundingClientRect();
    tx = event.clientX - box.left;
    ty = event.clientY - box.top;

    const slat = event.target.closest('.fav-slat');
    const open = slat?.getAttribute('aria-selected') === 'true';
    showCursor(Boolean(slat) && !open);

    if (slat && open) {
      const r = slat.getBoundingClientRect();
      const fx = (event.clientX - r.left) / r.width;
      const fy = (event.clientY - r.top) / r.height;
      slat.style.setProperty('--px', ((0.5 - fx) * 18).toFixed(2));
      slat.style.setProperty('--py', ((0.5 - fy) * 18).toFixed(2));
      slat.style.setProperty('--gx', `${(fx * 100).toFixed(1)}%`);
      slat.style.setProperty('--gy', `${(fy * 100).toFixed(1)}%`);
    }
    if (!rafId) rafId = requestAnimationFrame(tick);
  });
  on(rail, 'pointerleave', () => {
    hideCursor();
    slats.forEach((s) => {
      s.style.removeProperty('--px');
      s.style.removeProperty('--py');
    });
  });

  /* ---- Swipe ------------------------------------------------------------- */
  // Horizontal only, touch and pen only. Vertical gestures stay page scroll.
  let startX = null;
  let startY = null;
  on(rail, 'pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    startX = event.clientX;
    startY = event.clientY;
  });
  on(rail, 'pointerup', (event) => {
    if (startX == null) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      // The tap that ends a swipe must not also open the slat under it.
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 60);
      select(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }
  });
  on(rail, 'pointercancel', () => { startX = null; });

  /* ---- Visibility and preferences ---------------------------------------- */
  // Autoplay starts by itself the first time the section is seen, unless the
  // visitor has already chosen a dish or asked for less motion.
  const stopVisibility = whileVisible(root, {
    onActive: () => {
      if (!started) {
        started = true;
        setPlaying(true);
      }
      setPaused(false);
    },
    onIdle: () => setPaused(true),
  });

  const applyMotion = (reduced) => {
    root.classList.toggle('is-live', !reduced);
    if (reduced) {
      if (playing) setPlaying(false);
      hideCursor();
    }
  };
  const offMotion = motion.onChange(applyMotion);
  applyMotion(motion.reduced);

  render(0, 0);

  return () => {
    cleanups.forEach((fn) => fn());
    clearTimeout(swapTimer);
    clearTimeout(ghostTimer);
    cancelAnimationFrame(rafId);
    stopVisibility();
    offMotion();
    root.classList.remove('is-playing', 'is-paused', 'is-live', 'is-swapping');
  };
}
