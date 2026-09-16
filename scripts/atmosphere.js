/**
 * Atmosphere photo stack.
 *
 * Selecting a label brings its print to the front. The stack order is derived
 * from a single active index, so the three prints can never end up in an
 * inconsistent arrangement.
 *
 * Hover only *previews*; the committed selection changes on click, focus or
 * keyboard, so the information is never hover-only.
 */
import { ATMOSPHERE } from '../data/media.mjs';

const ORDER = ['front', 'mid', 'back'];

export function initAtmosphere() {
  const root = document.querySelector('.atmos-grid');
  const stack = document.querySelector('[data-atmos-stack]');
  if (!root || !stack) return () => {};

  const labels = Array.from(root.querySelectorAll('[data-atmos-index]'));
  const prints = Array.from(stack.querySelectorAll('[data-atmos-print]'));
  const caption = stack.querySelector('[data-atmos-caption]');
  const readout = root.querySelector('[data-atmos-text]');
  if (!labels.length || !prints.length) return () => {};

  let index = 0;
  let swapTimer = null;

  function paint(active) {
    prints.forEach((print, i) => {
      // Distance from the active item decides depth: active is always front.
      const depth = (i - active + prints.length) % prints.length;
      print.dataset.state = ORDER[Math.min(depth, ORDER.length - 1)];
    });
  }

  function select(next, { commit = true } = {}) {
    const n = ((next % ATMOSPHERE.length) + ATMOSPHERE.length) % ATMOSPHERE.length;
    paint(n);
    if (!commit) return;

    index = n;
    const item = ATMOSPHERE[index];

    labels.forEach((l, i) => {
      const on = i === index;
      l.setAttribute('aria-selected', String(on));
      l.tabIndex = on ? 0 : -1;
    });
    readout?.setAttribute('aria-labelledby', `at-tab-${item.id}`);
    if (caption) caption.textContent = item.label;

    clearTimeout(swapTimer);
    if (readout) {
      readout.classList.add('is-swapping');
      swapTimer = setTimeout(() => {
        readout.textContent = item.text;
        readout.classList.remove('is-swapping');
      }, 180);
    }
  }

  const onClick = (event) => select(Number(event.currentTarget.dataset.atmosIndex));
  // Hovering a label previews its photograph but does not commit the change.
  const onHover = (event) => paint(Number(event.currentTarget.dataset.atmosIndex));
  const onLeave = () => paint(index);
  const onKeydown = (event) => {
    const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(event.key in map)) return;
    event.preventDefault();
    const next = index + map[event.key];
    select(next);
    labels[index].focus();
  };
  // Keyboard focus commits, so keyboard users get the same result as a click.
  const onFocus = (event) => select(Number(event.currentTarget.dataset.atmosIndex));

  labels.forEach((l) => {
    l.addEventListener('click', onClick);
    l.addEventListener('mouseenter', onHover);
    l.addEventListener('mouseleave', onLeave);
    l.addEventListener('keydown', onKeydown);
    l.addEventListener('focus', onFocus);
  });

  select(0);

  return () => {
    clearTimeout(swapTimer);
    labels.forEach((l) => {
      l.removeEventListener('click', onClick);
      l.removeEventListener('mouseenter', onHover);
      l.removeEventListener('mouseleave', onLeave);
      l.removeEventListener('keydown', onKeydown);
      l.removeEventListener('focus', onFocus);
    });
  };
}
