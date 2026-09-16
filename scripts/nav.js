/**
 * Header menu panel, header scroll state, desktop dock and mobile utility strip.
 */
import { trapFocus, focusables, rafBatch } from './motion.js';

/* ==========================================================================
   Header: over-the-hero state + scroll progress
   --------------------------------------------------------------------------
   Both are enhancements on top of a header that is already correct without
   them. The solid bar is the CSS default, so a failure here leaves a readable
   header rather than cream text on a cream ground.
   ========================================================================== */
export function initHeader() {
  const header = document.getElementById('site-header');
  const sentinel = document.getElementById('header-sentinel');
  const progress = document.getElementById('header-progress');
  if (!header) return () => {};

  /* ---- Transparent over the hero ---- */
  // Opt-in per page: only a page whose first section is dark can carry it.
  const wantsOver = document.body.dataset.headerMode === 'over';
  let gate = null;

  if (wantsOver && sentinel && 'IntersectionObserver' in window) {
    header.classList.add('is-over');
    gate = new IntersectionObserver(
      ([entry]) => header.classList.toggle('is-over', entry.isIntersecting),
      { threshold: 0 }
    );
    gate.observe(sentinel);
  }

  /* ---- Scroll progress ---- */
  // One custom property write per frame at most, and nothing is read from
  // layout inside the scroll handler beyond the two scroll offsets.
  let offScroll = null;
  if (progress) {
    const paint = rafBatch(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      progress.style.setProperty('--progress', ratio.toFixed(4));
    });
    const onScroll = () => paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();
    offScroll = () => {
      paint.cancel();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }

  /* ---- Preview banner height ---- */
  // The hero fills one screen LESS the banner above it, so its scroll cue
  // lands on the fold. The banner wraps differently at every width, so it is
  // measured rather than guessed; without this the hero is simply 100svh.
  const bar = document.querySelector('.preview-bar');
  let barObserver = null;
  let barFrame = 0;
  if (bar && 'ResizeObserver' in window) {
    let last = -1;
    // The write is deferred a frame and skipped when unchanged. Resizing the
    // hero can toggle the page scrollbar, which re-wraps the banner; writing
    // inside the observer callback turned that into a ResizeObserver loop
    // error in WebKit.
    barObserver = new ResizeObserver(([entry]) => {
      const h = Math.round(entry.borderBoxSize?.[0]?.blockSize ?? bar.offsetHeight);
      if (h === last) return;
      cancelAnimationFrame(barFrame);
      barFrame = requestAnimationFrame(() => {
        last = h;
        document.documentElement.style.setProperty('--preview-h', `${h}px`);
      });
    });
    barObserver.observe(bar);
  }

  return () => {
    gate?.disconnect();
    offScroll?.();
    barObserver?.disconnect();
    cancelAnimationFrame(barFrame);
    header.classList.remove('is-over');
  };
}

/* ==========================================================================
   Header hours: today's LISTED hours
   --------------------------------------------------------------------------
   The static markup says only what is true every day ("Open daily · until
   5pm"). This swaps in today's schedule, in the café's own time zone, so a
   visitor abroad or up after midnight still sees the right day.

   Deliberately a schedule, never a status: the hours are unconfirmed (see
   BUSINESS.hours.liveStatus), so nothing here ever says "open now" or
   "closed", and a bank holiday cannot make it lie.
   ========================================================================== */
export function initHours() {
  const el = document.getElementById('header-hours');
  const text = el?.querySelector('[data-hours-text]');
  if (!el || !text) return () => {};

  let groups;
  try {
    groups = JSON.parse(el.dataset.hours || '[]');
  } catch {
    return () => {};
  }

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const paint = () => {
    const short = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/London' })
      .format(new Date());
    const today = DAYS.indexOf(short);
    const group = groups.find(([days]) => days.includes(today));
    if (group) text.textContent = `Open today · ${group[1]}–${group[2]}`;
  };
  paint();

  // A tab left open overnight rolls over to the new day's hours.
  const timer = setInterval(paint, 10 * 60 * 1000);
  return () => clearInterval(timer);
}

/* ==========================================================================
   Mobile menu panel
   ========================================================================== */
export function initMenuPanel() {
  const toggle = document.getElementById('menu-toggle');
  const panel = document.getElementById('nav-panel');
  const close = document.getElementById('nav-close');
  if (!toggle || !panel) return () => {};

  let releaseTrap = null;
  let open = false;
  let scrollLock = 0;

  const setOpen = (next) => {
    if (next === open) return;
    open = next;
    toggle.setAttribute('aria-expanded', String(next));

    if (next) {
      panel.hidden = false;
      // Background content must not scroll or be reachable behind the modal.
      scrollLock = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollLock}px`;
      document.body.style.insetInline = '0';
      // Everything outside the panel is hidden from assistive tech.
      for (const el of document.body.children) {
        if (el !== panel && !el.hasAttribute('aria-hidden')) {
          el.setAttribute('data-nav-inert', '');
          el.setAttribute('aria-hidden', 'true');
          if ('inert' in HTMLElement.prototype) el.inert = true;
        }
      }
      releaseTrap = trapFocus(panel);
      (focusables(panel)[0] || panel).focus();
    } else {
      panel.hidden = true;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.insetInline = '';
      window.scrollTo(0, scrollLock);
      for (const el of document.querySelectorAll('[data-nav-inert]')) {
        el.removeAttribute('data-nav-inert');
        el.removeAttribute('aria-hidden');
        if ('inert' in HTMLElement.prototype) el.inert = false;
      }
      releaseTrap?.();
      releaseTrap = null;
      // Focus returns to the control that opened the panel.
      toggle.focus();
    }
  };

  const onToggle = () => setOpen(!open);
  const onClose = () => setOpen(false);
  const onKeydown = (event) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    }
  };
  // Following a link inside the panel should also close it.
  const onPanelClick = (event) => {
    if (event.target.closest('a')) setOpen(false);
  };
  // A resize into desktop width must not leave the body scroll-locked.
  const desktop = window.matchMedia('(min-width: 64rem)');
  const onBreakpoint = () => {
    if (desktop.matches && open) setOpen(false);
  };

  toggle.addEventListener('click', onToggle);
  close?.addEventListener('click', onClose);
  document.addEventListener('keydown', onKeydown);
  panel.addEventListener('click', onPanelClick);
  desktop.addEventListener('change', onBreakpoint);

  return () => {
    setOpen(false);
    toggle.removeEventListener('click', onToggle);
    close?.removeEventListener('click', onClose);
    document.removeEventListener('keydown', onKeydown);
    panel.removeEventListener('click', onPanelClick);
    desktop.removeEventListener('change', onBreakpoint);
  };
}

/* ==========================================================================
   Dock + utility strip
   --------------------------------------------------------------------------
   Both appear once the hero has been scrolled past, so neither competes with
   the hero CTAs. Only one is ever displayed at a given width (CSS decides).
   ========================================================================== */
export function initDock() {
  const dock = document.getElementById('dock');
  const strip = document.getElementById('utility-strip');
  const hero = document.querySelector('.hero');
  const footer = document.querySelector('.site-footer');
  if (!hero || (!dock && !strip)) return () => {};

  /**
   * Two independent conditions decide visibility, and BOTH are held as state
   * rather than applied directly by their observers. An earlier version had
   * the footer observer remove the class on its own, which meant scrolling
   * down to the footer and back up left the dock hidden for good: the hero
   * observer never fired again because the hero's intersection had not
   * changed. Deriving the result from state fixes that class of bug.
   */
  let pastHero = false;
  let atFooter = false;

  /* ---- Active section indicator ----------------------------------------
     One fresh-green pill slides between destinations. Its geometry is
     measured from the active link with offsetLeft/offsetWidth, which are
     relative to the dock itself (the dock is the nearest positioned
     ancestor), so there is no getBoundingClientRect maths and no dependence
     on the page's scroll position.

     The pill is decorative. aria-current and the visible dot are set
     regardless, and `.has-indicator` is only added once a measurement has
     actually succeeded — until then the CSS fallback paints the active link
     itself, so the state is never invisible. */
  const indicator = dock?.querySelector('.dock-indicator') || null;
  const links = dock ? Array.from(dock.querySelectorAll('[data-dock-link]')) : [];
  let activeLink = null;

  const placeIndicator = rafBatch(() => {
    if (!indicator || !dock) return;
    if (!activeLink) {
      dock.classList.remove('has-indicator');
      return;
    }
    // Zero width means the dock is still display:none at this breakpoint.
    const w = activeLink.offsetWidth;
    if (!w) return;
    indicator.style.setProperty('--dock-x', `${activeLink.offsetLeft}px`);
    indicator.style.setProperty('--dock-w', `${w}px`);
    dock.classList.add('has-indicator');
  });

  const setActive = (id) => {
    let next = null;
    for (const a of links) {
      const on = id != null && a.dataset.dockLink === id;
      a.setAttribute('aria-current', on ? 'true' : 'false');
      if (on) next = a;
    }
    if (next === activeLink) return;
    activeLink = next;
    placeIndicator();
  };

  const sync = () => {
    // The dock steps aside over the footer so it can never cover contact
    // details. The mobile strip stays: the footer reserves space for it.
    dock?.classList.toggle('is-visible', pastHero && !atFooter);
    strip?.classList.toggle('is-visible', pastHero);
    // The dock may have been display:none when the indicator was last
    // measured, in which case there was nothing to measure. Try again now.
    placeIndicator();
  };

  const gate = new IntersectionObserver(
    ([entry]) => {
      pastHero = !entry.isIntersecting;
      sync();
    },
    { rootMargin: '-45% 0px 0px 0px' }
  );
  gate.observe(hero);

  let footerObserver = null;
  if (footer) {
    footerObserver = new IntersectionObserver(
      ([entry]) => {
        atFooter = entry.isIntersecting;
        sync();
      },
      { threshold: 0.12 }
    );
    footerObserver.observe(footer);
  }

  const sections = links
    .map((a) => document.getElementById(a.dataset.dockLink))
    .filter(Boolean);

  let sectionObserver = null;
  if (sections.length) {
    const visible = new Map();
    sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId = null;
        let best = 0;
        for (const [id, ratio] of visible) {
          if (ratio > best) {
            best = ratio;
            bestId = id;
          }
        }
        setActive(bestId);
      },
      { threshold: [0, 0.2, 0.5, 0.8], rootMargin: `-${Math.round(window.innerHeight * 0.3)}px 0px -35% 0px` }
    );
    for (const s of sections) sectionObserver.observe(s);
  }

  // The dock's own width changes with the viewport, so the pill is remeasured
  // on resize rather than kept at a stale offset.
  const onResize = () => placeIndicator();
  window.addEventListener('resize', onResize, { passive: true });

  return () => {
    gate.disconnect();
    footerObserver?.disconnect();
    sectionObserver?.disconnect();
    window.removeEventListener('resize', onResize);
    placeIndicator.cancel();
    dock?.classList.remove('has-indicator');
    pastHero = false;
    atFooter = false;
    sync();
  };
}
