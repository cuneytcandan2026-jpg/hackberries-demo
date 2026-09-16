/**
 * Motion preferences and scroll reveals.
 *
 * Reduced motion is honoured in JavaScript as well as CSS, and the preference
 * is tracked LIVE: turning it on mid-session immediately stops autoplay, the
 * pointer previews and the collage drag, without a reload.
 */

const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set();

export const motion = {
  get reduced() {
    return mql.matches;
  },
  /** Subscribe to preference changes. Returns an unsubscribe function. */
  onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

function applyPreference() {
  document.documentElement.dataset.motion = mql.matches ? 'reduced' : 'full';
  for (const fn of listeners) {
    try {
      fn(mql.matches);
    } catch (err) {
      console.error('[motion] listener failed', err);
    }
  }
}

// Safari < 14 only supports addListener.
if (typeof mql.addEventListener === 'function') {
  mql.addEventListener('change', applyPreference);
} else if (typeof mql.addListener === 'function') {
  mql.addListener(applyPreference);
}
applyPreference();

/* ==========================================================================
   Scroll reveals
   ========================================================================== */

/**
 * Reveals elements once, as they enter the lower part of the viewport.
 *
 * The hiding styles are gated behind `data-reveal-ready`, which is only set
 * here. If IntersectionObserver is missing or this module never runs, content
 * simply stays visible — it is never hidden by markup alone.
 *
 * The VARIANT (rise, drop, left, right, scale, wipe, fan) is declared in the
 * markup as the attribute's value and resolved entirely in motion.css. This
 * function's only extra job is to index each group's children, so the stylesheet
 * can stagger them without a stack of :nth-child rules. Three elements at most
 * are staggered — the cap lives in the CSS `min(var(--i), 3)`.
 */
export function initReveals(root = document) {
  const targets = root.querySelectorAll('[data-reveal], [data-reveal-group], [data-lines]');
  if (!targets.length) return () => {};

  if (!('IntersectionObserver' in window)) {
    return () => {};
  }

  /** Indexes children (or masked headline lines) for the CSS stagger. */
  const index = (el) => {
    if (el.hasAttribute('data-reveal-group')) {
      Array.from(el.children).forEach((child, i) => {
        child.style.setProperty('--i', String(i));
      });
    }
    if (el.hasAttribute('data-lines')) {
      el.querySelectorAll('.line').forEach((line, i) => {
        line.style.setProperty('--i', String(i));
      });
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    // Fires as the element reaches roughly the lower 82% of the viewport.
    { rootMargin: '0px 0px -18% 0px', threshold: 0.01 }
  );

  for (const el of targets) {
    index(el);
    el.dataset.revealReady = '';
    // Anything already on screen at load is revealed immediately rather than
    // fading in under the visitor's nose.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('is-revealed');
      continue;
    }
    observer.observe(el);
  }

  return () => observer.disconnect();
}

/**
 * True when the device has a real hovering pointer — the gate for every
 * pointer-driven enhancement (row previews, collage drag, panel hover swaps).
 * Returns the MediaQueryList so callers can subscribe to changes too.
 */
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/* ==========================================================================
   Shared helpers
   ========================================================================== */

/** requestAnimationFrame-batched callback; repeat calls in one frame collapse. */
export function rafBatch(fn) {
  let queued = false;
  let lastArgs = null;
  const runner = () => {
    queued = false;
    fn(...lastArgs);
  };
  const wrapped = (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(runner);
  };
  wrapped.cancel = () => {
    queued = false;
  };
  return wrapped;
}

/**
 * Pauses work when the element leaves the viewport or the tab is hidden.
 * Returns a teardown function that disconnects everything it created.
 */
export function whileVisible(element, { onActive, onIdle }) {
  let inView = false;
  let pageVisible = !document.hidden;
  let active = false;

  const sync = () => {
    const next = inView && pageVisible;
    if (next === active) return;
    active = next;
    (next ? onActive : onIdle)();
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      sync();
    },
    { threshold: 0.15 }
  );
  io.observe(element);

  const onVisibility = () => {
    pageVisible = !document.hidden;
    sync();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    if (active) onIdle();
  };
}

/** Focusable descendants, in document order. */
export function focusables(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),' +
      ' textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

/**
 * Traps Tab inside a container while a modal surface is open.
 * Returns a teardown function.
 */
export function trapFocus(container) {
  const onKeydown = (event) => {
    if (event.key !== 'Tab') return;
    const items = focusables(container);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', onKeydown);
  return () => container.removeEventListener('keydown', onKeydown);
}
