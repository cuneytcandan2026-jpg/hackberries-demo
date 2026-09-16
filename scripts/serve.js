/**
 * "What we serve" - the menu board.
 *
 * STATE MODEL
 * -----------
 * One `current` index decides the selected tab, the current card, the dots,
 * the counter and where the sliding indicator sits. How it changes depends on
 * the layout, and the markup is the same for both:
 *
 *  - Wide (64rem and up): the cards share one grid cell and only the current
 *    one is shown; the rest are inert. Pointing at a row of the board, or
 *    focusing it, selects it.
 *  - Narrow: the cards sit side by side in a scroll-snap deck. Scrolling the
 *    deck IS the selection, and tapping a chip scrolls the deck to its card.
 */
import { motion, whileVisible, finePointer, rafBatch } from './motion.js';

const WIDE = window.matchMedia('(min-width: 64rem)');

export function initServe() {
  const root = document.querySelector('[data-serve]');
  const index = root?.querySelector('[data-serve-index]');
  const deck = root?.querySelector('[data-serve-deck]');
  if (!root || !index || !deck) return () => {};

  const tabs = Array.from(index.querySelectorAll('[data-serve-tab]'));
  const cards = Array.from(deck.querySelectorAll('[data-serve-card]'));
  const dots = Array.from(root.querySelectorAll('[data-serve-dot]'));
  const elCount = root.querySelector('[data-serve-count]');
  if (!tabs.length || tabs.length !== cards.length) return () => {};

  const cleanups = [];
  const on = (el, type, fn, opts) => {
    if (!el) return;
    el.addEventListener(type, fn, opts);
    cleanups.push(() => el.removeEventListener(type, fn, opts));
  };

  const indicator = document.createElement('span');
  indicator.className = 'serve-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  index.prepend(indicator);

  let current = 0;
  let touched = false;
  let hinted = false;
  let intentTimer = null;
  let hintTimer = null;
  // While the deck is scrolled for the visitor, the cards it passes on the
  // way must not each become current in turn.
  let deckLockUntil = 0;

  const behavior = () => (motion.reduced ? 'auto' : 'smooth');

  const touch = () => {
    if (touched) return;
    touched = true;
    root.classList.add('is-touched');
  };

  /* ---- Placement ----------------------------------------------------------- */
  const placeIndicator = () => {
    const tab = tabs[current];
    indicator.style.setProperty('--x', `${tab.offsetLeft}px`);
    indicator.style.setProperty('--y', `${tab.offsetTop}px`);
    indicator.style.setProperty('--w', `${tab.offsetWidth}px`);
    indicator.style.setProperty('--h', `${tab.offsetHeight}px`);
  };

  // Scrolls the chip strip only, never the page: scrollIntoView would also
  // move the window to bring the strip into view.
  const keepChipInView = () => {
    if (WIDE.matches) return;
    const tab = tabs[current];
    const left = tab.offsetLeft - (index.clientWidth - tab.offsetWidth) / 2;
    index.scrollTo({ left: Math.max(0, left), behavior: behavior() });
  };

  const deckPad = () => parseFloat(getComputedStyle(deck).scrollPaddingInlineStart) || 0;

  const scrollDeckTo = (i, how = behavior()) => {
    if (WIDE.matches) return;
    deckLockUntil = performance.now() + (how === 'auto' ? 0 : 900);
    deck.scrollTo({ left: cards[i].offsetLeft - deckPad(), behavior: how });
  };

  const resetTilt = (card) => {
    const media = card.querySelector('.serve-media');
    media?.style.removeProperty('--mx');
    media?.style.removeProperty('--my');
  };

  /* ---- Render: one function, one source of truth -------------------------- */
  function render(next, { scrollDeck = false } = {}) {
    current = Math.max(0, Math.min(cards.length - 1, next));
    const wide = WIDE.matches;

    tabs.forEach((tab, i) => {
      const selected = i === current;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    cards.forEach((card, i) => {
      const isCurrent = i === current;
      card.classList.toggle('is-current', isCurrent);
      // Hidden cards on the board are out of reach; in the deck every card
      // is on screen or a swipe away, so all of them stay usable.
      card.inert = wide && !isCurrent;
      if (!isCurrent) resetTilt(card);
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-current', i === current));
    if (elCount) elCount.textContent = String(current + 1).padStart(2, '0');

    placeIndicator();
    keepChipInView();
    if (scrollDeck) scrollDeckTo(current);
  }

  const select = (i, opts) => {
    touch();
    render(i, opts);
  };

  /* ---- Tabs ---------------------------------------------------------------- */
  tabs.forEach((tab, i) => {
    on(tab, 'click', () => select(i, { scrollDeck: true }));

    on(tab, 'keydown', (event) => {
      const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let target = null;
      // From the tab that has focus, which pointing may have left behind the
      // selection.
      if (event.key in map) target = (i + map[event.key] + tabs.length) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      if (target === null) return;
      event.preventDefault();
      select(target, { scrollDeck: true });
      tabs[target].focus({ preventScroll: true });
    });

    // Pointing at a row of the board selects it, after a moment's intent so
    // a pointer crossing the board on its way elsewhere changes nothing.
    on(tab, 'pointerenter', (event) => {
      if (event.pointerType !== 'mouse' || !WIDE.matches || !finePointer.matches) return;
      clearTimeout(intentTimer);
      intentTimer = setTimeout(() => {
        if (i !== current) select(i);
      }, 90);
    });
    on(tab, 'pointerleave', () => clearTimeout(intentTimer));
  });

  /* ---- Deck ---------------------------------------------------------------- */
  const syncFromDeck = rafBatch(() => {
    if (WIDE.matches || performance.now() < deckLockUntil) return;
    const left = deck.scrollLeft + deckPad();
    let nearest = 0;
    let best = Infinity;
    cards.forEach((card, i) => {
      const d = Math.abs(card.offsetLeft - left);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    // At the very end the last card cannot reach the snap line.
    if (deck.scrollLeft + deck.clientWidth >= deck.scrollWidth - 2) nearest = cards.length - 1;
    if (nearest !== current) render(nearest);
  });
  on(deck, 'scroll', syncFromDeck, { passive: true });
  on(deck, 'scrollend', () => {
    deckLockUntil = 0;
    syncFromDeck();
  });
  on(deck, 'pointerdown', touch);
  on(deck, 'wheel', touch, { passive: true });

  /* ---- Second photograph --------------------------------------------------- */
  cards.forEach((card) => {
    const button = card.querySelector('[data-serve-swap]');
    on(button, 'click', () => {
      const flipped = !card.classList.contains('is-flipped');
      card.classList.toggle('is-flipped', flipped);
      button.setAttribute('aria-pressed', String(flipped));
      touch();
    });
  });

  /* ---- Pointer depth on the board ------------------------------------------ */
  // The photograph, the numeral and the print drift at different rates.
  on(deck, 'pointermove', (event) => {
    if (event.pointerType !== 'mouse' || motion.reduced || !WIDE.matches) return;
    const media = cards[current].querySelector('.serve-media');
    if (!media) return;
    const r = media.getBoundingClientRect();
    const fx = Math.max(-0.5, Math.min(0.5, (event.clientX - r.left) / r.width - 0.5));
    const fy = Math.max(-0.5, Math.min(0.5, (event.clientY - r.top) / r.height - 0.5));
    media.style.setProperty('--mx', (fx * -16).toFixed(2));
    media.style.setProperty('--my', (fy * -16).toFixed(2));
  });
  on(deck, 'pointerleave', () => resetTilt(cards[current]));

  /* ---- Layout changes ------------------------------------------------------- */
  const onLayout = () => {
    render(current);
    scrollDeckTo(current, 'auto');
  };
  WIDE.addEventListener('change', onLayout);
  cleanups.push(() => WIDE.removeEventListener('change', onLayout));

  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => placeIndicator()) : null;
  ro?.observe(index);

  /* ---- First sight ---------------------------------------------------------- */
  // A single nudge of the deck, the first time it is seen, to show it moves.
  const stopVisibility = whileVisible(deck, {
    onActive: () => {
      if (hinted || touched || motion.reduced || WIDE.matches) return;
      hinted = true;
      hintTimer = setTimeout(() => {
        root.classList.add('is-hinting');
        hintTimer = setTimeout(() => root.classList.remove('is-hinting'), 1100);
      }, 500);
    },
    onIdle: () => {},
  });

  const applyMotion = (reduced) => root.classList.toggle('is-live', !reduced);
  const offMotion = motion.onChange(applyMotion);
  applyMotion(motion.reduced);

  root.classList.add('is-ready');
  render(0);
  // Placed before transitions are switched on, so it does not fly in from 0.
  requestAnimationFrame(() => indicator.classList.add('is-measured'));

  return () => {
    cleanups.forEach((fn) => fn());
    clearTimeout(intentTimer);
    clearTimeout(hintTimer);
    syncFromDeck.cancel();
    ro?.disconnect();
    stopVisibility();
    offMotion();
    indicator.remove();
    cards.forEach((card) => { card.inert = false; });
    root.classList.remove('is-ready', 'is-live', 'is-touched', 'is-hinting');
  };
}
