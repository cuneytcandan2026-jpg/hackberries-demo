/**
 * Homepage entry point.
 *
 * Every init function returns its own teardown. They are collected here so the
 * page can be torn down cleanly, and so a failure in one enhancement can never
 * take the rest of the page with it.
 */
import { motion, initReveals } from './motion.js';
import { initMenuPanel, initDock, initHeader, initHours } from './nav.js';
import { initShowcase } from './showcase.js';
import { initAtmosphere } from './atmosphere.js';
import { initRowPreviews } from './editorial.js';
import { initServe } from './serve.js';
import { initLightbox, initCollageDrag } from './gallery.js';
import { initMap } from './visit.js';
import { initBrew } from './brew.js';
import { initContact } from './contact.js';

const teardowns = [];

/** Runs one enhancement in isolation; a thrown error is logged, not fatal. */
function mount(name, fn) {
  try {
    const off = fn();
    if (typeof off === 'function') teardowns.push(off);
  } catch (error) {
    console.error(`[hackberries] "${name}" failed to start`, error);
  }
}

/* ==========================================================================
   Hero intro
   --------------------------------------------------------------------------
   `data-hero-ready` is what activates the hiding styles, and it is only ever
   set here. If this script does not run, the hero renders fully visible.
   ========================================================================== */
function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return () => {};

  hero.dataset.heroReady = '';
  // Two frames: one to let the attribute apply the start state, one to release.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => hero.classList.add('is-in'));
  });

  // Safety net: if anything stalls, the hero is shown regardless.
  const failsafe = setTimeout(() => hero.classList.add('is-in'), 1200);
  return () => clearTimeout(failsafe);
}

/* ==========================================================================
   "A little coffee break"
   ========================================================================== */
function initCoffeeBreak() {
  const button = document.getElementById('coffee-btn');
  const clearBtn = document.getElementById('coffee-clear');
  const field = document.getElementById('bean-field');
  const status = document.getElementById('coffee-status');
  if (!button || !field) return () => {};

  let cleanup = null;
  let busy = false;

  const reset = () => {
    cleanup?.();
    cleanup = null;
    clearBtn?.setAttribute('hidden', '');
    if (status) status.textContent = '';
  };

  const onClick = async () => {
    if (busy) return;

    // Under reduced motion this stays a calm, static acknowledgement.
    if (motion.reduced) {
      if (status) status.textContent = 'Put the kettle on. ☕';
      return;
    }

    busy = true;
    try {
      const { runCoffeeBreak } = await import('./coffee-break.js');
      cleanup?.();
      cleanup = runCoffeeBreak({
        field,
        onDone: () => { busy = false; },
      });
      clearBtn?.removeAttribute('hidden');
      if (status) status.textContent = 'Beans everywhere. Sorry.';
    } catch (error) {
      // A failed optional feature must not break anything else.
      console.error('[hackberries] coffee break unavailable', error);
      if (status) status.textContent = 'Put the kettle on. ☕';
      busy = false;
    }
  };

  const onClear = () => { reset(); busy = false; button.focus(); };
  const offMotion = motion.onChange((reduced) => { if (reduced) reset(); });

  button.addEventListener('click', onClick);
  clearBtn?.addEventListener('click', onClear);

  return () => {
    reset();
    offMotion();
    button.removeEventListener('click', onClick);
    clearBtn?.removeEventListener('click', onClear);
  };
}

/* ==========================================================================
   Boot
   ========================================================================== */
mount('hero', initHero);
mount('reveals', () => initReveals());
mount('header', initHeader);
mount('hours', initHours);
mount('menu panel', initMenuPanel);
mount('dock', initDock);
mount('showcase', initShowcase);
mount('atmosphere', initAtmosphere);
mount('row previews', initRowPreviews);
mount('what we serve', initServe);
mount('lightbox', initLightbox);
mount('collage drag', initCollageDrag);
mount('map', initMap);
mount('coffee break', initCoffeeBreak);
mount('bean to brew', initBrew);
mount('contact', initContact);

// Clean teardown on navigation away, so nothing is left running in bfcache.
window.addEventListener('pagehide', () => {
  while (teardowns.length) {
    try {
      teardowns.pop()();
    } catch {
      /* teardown is best-effort */
    }
  }
});
