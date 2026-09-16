/**
 * Contact page entry point.
 *
 * The page itself is static. The option cards are links to #book, #message
 * and #private-hire; scripts/contact.js turns them into triggers for the
 * pop-up, and without it the forms are shown in the page.
 */
import { initReveals } from './motion.js';
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

const teardowns = [
  mount('header', initHeader),
  mount('hours', initHours),
  mount('reveals', () => initReveals()),
  mount('menu panel', initMenuPanel),
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
