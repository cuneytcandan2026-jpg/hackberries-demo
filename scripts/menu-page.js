/**
 * Menu page entry point.
 *
 * Everything here is an enhancement. Without JavaScript the whole menu is
 * rendered and visible, the course bar and side guide are plain anchor links,
 * and the add-ons panel is a native <details>. The search field and (V)
 * toggle ship hidden and only appear once they are wired.
 */
import { initReveals, rafBatch } from './motion.js';
import { initMenuPanel, initHeader, initHours } from './nav.js';
import { initContact } from './contact.js';

function mount(name, fn) {
  try {
    return fn() || (() => {});
  } catch (error) {
    console.error(`[hackberries] "${name}" failed to start`, error);
    return () => {};
  }
}

const root = document.documentElement;

/** Lower-case, accents stripped, dotless i folded, so "gozleme" finds "gözleme". */
const norm = (s) => String(s)
  .normalize('NFD')
  .replace(/\p{M}/gu, '')
  .replace(/ı/g, 'i')
  .toLowerCase()
  .replace(/&/g, ' and ');

/** Top of the reading area: below the header (unless tucked) and the course bar. */
function readingLine() {
  const bar = document.getElementById('m-bar');
  const header = document.getElementById('site-header');
  const barH = bar ? bar.getBoundingClientRect().height : 0;
  const headerH = header && !root.classList.contains('is-header-tucked') ? header.getBoundingClientRect().height : 0;
  return headerH + barH;
}

/* ==========================================================================
   Search and the (V) toggle
   ========================================================================== */
function initMenuFilter() {
  const tools = document.querySelector('.m-tools');
  const bar = document.getElementById('m-bar');
  const input = document.getElementById('m-q');
  const toggle = document.getElementById('m-search-toggle');
  const veg = document.getElementById('m-veg');
  const status = document.getElementById('m-status');
  const clear = document.getElementById('m-clear');
  const empty = document.getElementById('m-empty');
  const main = document.querySelector('.m-main');
  if (!tools || !bar || !input || !veg || !main) return () => {};

  const sections = Array.from(main.querySelectorAll('.m-section'));
  const courses = Array.from(main.querySelectorAll('.m-course'));
  const units = [];
  for (const section of sections) {
    const heading = section.querySelector('h3, .m-addons-name')?.textContent || '';
    for (const el of section.querySelectorAll('[data-item]')) {
      units.push({
        el,
        section,
        veg: el.hasAttribute('data-v'),
        text: norm(`${el.textContent} ${heading}`),
      });
    }
  }
  if (!units.length) return () => {};

  const details = Array.from(main.querySelectorAll('details'));
  const openedByFilter = new Set();
  tools.hidden = false;

  let query = '';
  let vegOnly = false;

  const apply = () => {
    const tokens = norm(query).split(/\s+/).filter(Boolean);
    const filtering = tokens.length > 0 || vegOnly;
    let shown = 0;

    for (const u of units) {
      const on = (!vegOnly || u.veg) && tokens.every((t) => u.text.includes(t));
      u.el.hidden = !on;
      if (on) shown += 1;
    }
    for (const section of sections) {
      section.hidden = filtering && !section.querySelector('[data-item]:not([hidden])');
    }
    for (const course of courses) {
      course.hidden = filtering && !course.querySelector('.m-section:not([hidden])');
    }
    // A match inside the folded add-ons panel has to be visible to count.
    for (const d of details) {
      const hasMatch = filtering && !d.closest('.m-section').hidden;
      if (hasMatch && !d.open) {
        d.open = true;
        openedByFilter.add(d);
      } else if (!filtering && openedByFilter.has(d)) {
        d.open = false;
        openedByFilter.delete(d);
      }
    }

    document.body.classList.toggle('is-filtering', filtering);
    if (clear) clear.hidden = !filtering;
    if (empty) empty.hidden = !filtering || shown > 0;
    if (status) {
      if (!filtering) {
        status.textContent = '';
      } else {
        // "3 items marked (V) match “egg”"
        status.textContent = [
          `${shown} ${shown === 1 ? 'item' : 'items'}`,
          vegOnly ? 'marked (V)' : '',
          tokens.length ? `${shown === 1 ? 'matches' : 'match'} “${query.trim()}”` : '',
        ].filter(Boolean).join(' ');
      }
    }
  };

  // Results start at the top of the menu; if the reader is further down, bring
  // the first result into view rather than leaving them on blank space.
  const toResults = () => {
    const results = document.getElementById('m-results');
    if (!results) return;
    const top = results.getBoundingClientRect().top;
    if (top < readingLine() || top > window.innerHeight * 0.6) {
      const y = window.scrollY + top - readingLine() - 12;
      window.scrollTo({ top: Math.max(y, 0), behavior: 'auto' });
    }
  };

  let typing = 0;
  const onInput = () => {
    query = input.value;
    apply();
    clearTimeout(typing);
    typing = setTimeout(toResults, 250);
  };

  const setSearching = (on) => {
    bar.classList.toggle('is-searching', on);
    toggle?.setAttribute('aria-expanded', String(on));
    toggle?.setAttribute('aria-label', on ? 'Close search' : 'Search the menu');
    if (on) {
      input.focus();
    } else if (input.value) {
      input.value = '';
      query = '';
      apply();
    }
  };

  const onToggle = () => {
    const opening = !bar.classList.contains('is-searching');
    setSearching(opening);
    if (!opening) toggle.focus();
  };

  const onKey = (event) => {
    if (event.key === 'Escape') {
      if (input.value) {
        input.value = '';
        query = '';
        apply();
      } else if (bar.classList.contains('is-searching')) {
        setSearching(false);
        toggle?.focus();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      toResults();
    }
  };

  const onVeg = () => {
    vegOnly = !vegOnly;
    veg.setAttribute('aria-pressed', String(vegOnly));
    apply();
    toResults();
  };

  const onClear = () => {
    input.value = '';
    query = '';
    vegOnly = false;
    veg.setAttribute('aria-pressed', 'false');
    apply();
    if (bar.classList.contains('is-searching')) setSearching(false);
    (getComputedStyle(input).display !== 'none' && input.offsetParent ? input : veg).focus();
  };

  // Following a link to something the filter has hidden clears the filter first.
  const onJump = (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !document.body.classList.contains('is-filtering')) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = id && document.getElementById(id);
    if (target && (target.hidden || target.closest('[hidden]'))) onClear();
  };

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKey);
  toggle?.addEventListener('click', onToggle);
  veg.addEventListener('click', onVeg);
  clear?.addEventListener('click', onClear);
  document.addEventListener('click', onJump, true);

  // A query restored by the browser (back/forward) is applied straight away.
  if (input.value) {
    query = input.value;
    apply();
  }

  return () => {
    clearTimeout(typing);
    input.removeEventListener('input', onInput);
    input.removeEventListener('keydown', onKey);
    toggle?.removeEventListener('click', onToggle);
    veg.removeEventListener('click', onVeg);
    clear?.removeEventListener('click', onClear);
    document.removeEventListener('click', onJump, true);
    for (const u of units) u.el.hidden = false;
    for (const el of [...sections, ...courses]) el.hidden = false;
    document.body.classList.remove('is-filtering');
    tools.hidden = true;
  };
}

/* ==========================================================================
   Scroll-spy: the course bar and side guide follow the reader
   ========================================================================== */
function initSpy() {
  const courses = Array.from(document.querySelectorAll('.m-course'));
  const links = Array.from(document.querySelectorAll('[data-spy]'));
  const toc = document.querySelector('.m-toc');
  const barList = document.querySelector('.m-bar-courses ul');
  if (!courses.length || !links.length) return () => {};

  const byKey = new Map();
  for (const a of links) {
    const key = a.dataset.spy;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(a);
  }
  toc?.classList.add('is-live');

  let current = { course: null, section: null };

  const lastAbove = (els, line) => {
    let hit = null;
    for (const el of els) {
      if (el.hidden) continue;
      if (el.getBoundingClientRect().top - line <= 0) hit = el;
      else break;
    }
    return hit;
  };

  const paint = rafBatch(() => {
    const line = readingLine() + 24;
    const course = lastAbove(courses, line);
    const section = course ? lastAbove(Array.from(course.querySelectorAll('.m-section')), line) : null;
    const next = { course: course?.id || null, section: section?.id || null };
    if (next.course === current.course && next.section === current.section) return;

    for (const a of links) a.removeAttribute('aria-current');
    for (const key of [next.course, next.section]) {
      for (const a of byKey.get(key) || []) a.setAttribute('aria-current', 'true');
    }
    for (const li of document.querySelectorAll('.m-toc-course')) {
      li.classList.toggle('is-current', `course-${li.dataset.course}` === next.course);
    }

    // Keep the active course visible in the bar's sideways scroller.
    if (barList && next.course !== current.course) {
      const active = barList.querySelector(`[data-spy="${next.course}"]`);
      if (active && barList.scrollWidth > barList.clientWidth) {
        const left = active.offsetLeft - (barList.clientWidth - active.offsetWidth) / 2;
        barList.scrollTo({ left: Math.max(left, 0), behavior: 'smooth' });
      }
    }

    // And the active section visible in the side guide.
    const tocLink = next.section && toc?.querySelector(`[data-spy="${next.section}"]`);
    const scroller = toc?.closest('.m-aside-inner');
    if (tocLink && scroller && scroller.scrollHeight > scroller.clientHeight) {
      const r = tocLink.getBoundingClientRect();
      const s = scroller.getBoundingClientRect();
      if (r.top < s.top || r.bottom > s.bottom) {
        scroller.scrollTop += r.top - s.top - s.height / 3;
      }
    }

    current = next;
  });

  const onScroll = () => paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Filtering changes what is above the line without any scrolling.
  const mo = new MutationObserver(onScroll);
  mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  paint();

  return () => {
    paint.cancel();
    mo.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    toc?.classList.remove('is-live');
    for (const a of links) a.removeAttribute('aria-current');
  };
}

/* ==========================================================================
   Tucking header
   --------------------------------------------------------------------------
   Once the course bar is stuck under the header, reading down slides the
   header away so the menu gets the room; scrolling up brings it back.
   ========================================================================== */
function initTuck() {
  const header = document.getElementById('site-header');
  const bar = document.getElementById('m-bar');
  const sentinel = document.getElementById('m-bar-sentinel');
  if (!header || !bar || !sentinel || !('IntersectionObserver' in window)) return () => {};

  let stuck = false;
  let lastY = window.scrollY;

  const setTucked = (on) => root.classList.toggle('is-header-tucked', on && stuck);

  const io = new IntersectionObserver(([entry]) => {
    // The sentinel sits right above the bar: once it has gone up past the
    // header, the bar is pinned.
    stuck = !entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight / 2;
    bar.classList.toggle('is-stuck', stuck);
    if (!stuck) setTucked(false);
  }, { rootMargin: `-${Math.round(header.getBoundingClientRect().height) + 1}px 0px 0px 0px` });
  io.observe(sentinel);

  const headerBusy = () => header.contains(document.activeElement)
    || document.getElementById('nav-panel')?.hidden === false;

  const onScroll = rafBatch(() => {
    const y = window.scrollY;
    const delta = y - lastY;
    if (Math.abs(delta) < 6) return;
    lastY = y;
    if (headerBusy()) return setTucked(false);
    setTucked(delta > 0);
  });
  const scroll = () => onScroll();

  // An in-page jump further down tucks the header before the scroll starts,
  // so the target lands directly under the course bar.
  const onClick = (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.closest('#nav-panel')) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;
    const below = target.getBoundingClientRect().top > readingLine();
    stuck = stuck || below;
    setTucked(below);
  };

  const onFocus = () => setTucked(false);

  window.addEventListener('scroll', scroll, { passive: true });
  document.addEventListener('click', onClick);
  header.addEventListener('focusin', onFocus);

  return () => {
    io.disconnect();
    onScroll.cancel();
    window.removeEventListener('scroll', scroll);
    document.removeEventListener('click', onClick);
    header.removeEventListener('focusin', onFocus);
    root.classList.remove('is-header-tucked');
    bar.classList.remove('is-stuck');
  };
}

const teardowns = [
  mount('header', initHeader),
  mount('hours', initHours),
  mount('reveals', () => initReveals()),
  mount('menu panel', initMenuPanel),
  mount('menu filter', initMenuFilter),
  mount('scroll-spy', initSpy),
  mount('header tuck', initTuck),
  mount('contact', initContact),
];

window.addEventListener('pagehide', () => {
  while (teardowns.length) {
    try {
      teardowns.pop()();
    } catch {
      /* best effort */
    }
  }
});
