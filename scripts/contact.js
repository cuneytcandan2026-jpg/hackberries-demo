/**
 * Contact pop-up: "Book a table", "Send a message" and "Private hire".
 *
 * The markup is complete without this script (tools/build-html.mjs): every
 * trigger is a real link to contact.html#<tab>, and on that page the forms
 * are shown inline and post straight to Web3Forms. This layer adds:
 *
 *   - a native modal <dialog>, opened on the right tab by any
 *     [data-contact-open] link on the page (focus trap, Escape and the
 *     inert background come from the platform, not from here);
 *   - an ARIA tablist with arrow-key movement;
 *   - validation messages written into each field's own error slot;
 *   - table times limited to the chosen day's listed hours;
 *   - name, email and phone kept in step across the three forms;
 *   - an in-place submission to Web3Forms, with a clear success state.
 */

const TABS = ['book', 'message', 'private-hire'];

const MISSING = {
  name: 'Please add your name.',
  email: 'Please add your email address.',
  phone: 'Please add a phone number, so the café can reach you.',
  date: 'Please choose a date.',
  time: 'Please choose a time.',
  guests: 'Please add the number of guests.',
  topic: 'Please choose what it is about.',
  message: 'Please write a message.',
  occasion: 'Please choose an occasion.',
  time_of_day: 'Please choose a time of day.',
};

const LABEL_OF = (control) =>
  (control.labels?.[0]?.textContent || control.name).replace(/\*/g, '').trim().toLowerCase();

/** "2026-09-20" -> "Sunday 20 September". Parsed as a local date, not UTC. */
function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

/** "2026-09-19" -> "Saturday". */
function weekdayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long' });
}

/** Today as yyyy-mm-dd in the visitor's own time zone. */
function isoToday(offsetDays = 0) {
  const t = new Date();
  t.setDate(t.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

const minutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export function initContact() {
  const dialog = document.getElementById('contact-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return () => {};

  const tablist = dialog.querySelector('[role="tablist"]');
  const tabs = [...dialog.querySelectorAll('[data-contact-tab]')];
  const panels = [...dialog.querySelectorAll('[data-contact-panel]')];
  const forms = [...dialog.querySelectorAll('[data-contact-form]')];
  const endpoint = dialog.dataset.endpoint || '';
  const phone = dialog.dataset.phone || '';
  const hireFrom = Number(dialog.dataset.hireFrom) || 12;
  const lastSlot = Number(dialog.dataset.lastSlot) || 0;
  let hours = [];
  try { hours = JSON.parse(dialog.dataset.hours || '[]'); } catch { /* no time filtering */ }

  const cleanups = [];
  const on = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts);
    cleanups.push(() => el.removeEventListener(type, fn, opts));
  };

  // With the script running, the forms validate themselves, so the browser's
  // own bubbles are switched off in favour of messages inside the layout.
  forms.forEach((f) => { f.noValidate = true; });

  /* ---- Tabs ------------------------------------------------------------ */
  let current = 'book';

  const select = (id, { focusTab = false } = {}) => {
    if (!TABS.includes(id)) id = 'book';
    current = id;
    tabs.forEach((tab, i) => {
      const active = tab.dataset.contactTab === id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) {
        tablist.style.setProperty('--tab-i', String(i));
        if (focusTab) tab.focus();
      }
    });
    panels.forEach((p) => { p.hidden = p.dataset.contactPanel !== id; });
  };

  tabs.forEach((tab) => on(tab, 'click', () => select(tab.dataset.contactTab)));
  on(tablist, 'keydown', (event) => {
    const i = TABS.indexOf(current);
    const moves = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = (moves[event.key] + TABS.length) % TABS.length;
    select(TABS[next], { focusTab: true });
  });

  /* ---- Open / close ---------------------------------------------------- */
  const open = (tab) => {
    select(tab);
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('has-contact-open');
    // Land on the first field of the chosen form, not the close button, so a
    // keyboard user can start typing straight away. On a phone this would
    // throw the keyboard up over the tabs, so touch devices keep the default.
    if (window.matchMedia('(hover: hover)').matches) {
      const panel = panels.find((p) => !p.hidden);
      const first = panel?.querySelector('.contact-form:not([hidden]) .cf-input');
      first?.focus({ preventScroll: true });
    }
  };
  const close = () => dialog.close();

  on(dialog, 'close', () => {
    document.documentElement.classList.remove('has-contact-open');
  });

  // A hairline under the sticky heading, only once there is something under it.
  const sheet = dialog.querySelector('.contact-sheet');
  if (sheet) {
    on(sheet, 'scroll', () => sheet.classList.toggle('is-scrolled', sheet.scrollTop > 4), { passive: true });
  }

  on(document, 'click', (event) => {
    const trigger = event.target.closest('[data-contact-open]');
    if (trigger) {
      event.preventDefault();
      open(trigger.dataset.contactOpen);
      return;
    }
    if (event.target.closest('[data-contact-close]') && dialog.contains(event.target)) {
      close();
    }
  });

  // A press that starts AND ends on the backdrop closes the dialog. Checking
  // both ends means dragging a text selection out of a field never does.
  let downOnBackdrop = false;
  on(dialog, 'pointerdown', (event) => { downOnBackdrop = event.target === dialog; });
  on(dialog, 'click', (event) => {
    if (downOnBackdrop && event.target === dialog) close();
    downOnBackdrop = false;
  });

  // "Party of 12 or more? Ask about private hire" - carries the details over.
  dialog.querySelectorAll('[data-contact-switch]').forEach((link) => {
    on(link, 'click', (event) => {
      event.preventDefault();
      const from = link.closest('form');
      const to = dialog.querySelector(`[data-contact-form="${link.dataset.contactSwitch}"]`);
      const date = from?.elements.date?.value;
      const guests = from?.elements.guests?.value;
      if (to && date && !to.elements.date.value) to.elements.date.value = date;
      if (to && guests && !to.elements.guests.value) to.elements.guests.value = guests;
      select(link.dataset.contactSwitch, { focusTab: true });
    });
  });

  /* ---- Shared details -------------------------------------------------- */
  // Typing your name in one form fills it into the others, unless you have
  // already typed something different there.
  on(dialog, 'input', (event) => {
    const key = event.target.dataset?.share;
    if (!key) return;
    dialog.querySelectorAll(`[data-share="${key}"]`).forEach((other) => {
      if (other === event.target) return;
      if (!other.value || other.dataset.mirrored === 'true') {
        other.value = event.target.value;
        other.dataset.mirrored = 'true';
      }
    });
    event.target.dataset.mirrored = 'false';
  });

  /* ---- Dates and times ------------------------------------------------- */
  dialog.querySelectorAll('[data-date]').forEach((input) => {
    input.min = isoToday();
    input.max = isoToday(365);
  });

  /** The [opens, closes] minutes for a yyyy-mm-dd date, or null if closed. */
  const hoursFor = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y) return undefined;
    const dow = new Date(y, m - 1, d).getDay();
    const group = hours.find(([days]) => days.includes(dow));
    return group ? [minutes(group[1]), minutes(group[2])] : null;
  };

  /** Every time slot each select was built with, so a date can narrow the
      list and a later date widen it again. */
  const allSlots = new WeakMap();

  /** Lists only the slots inside that day's hours. The options are removed,
      not hidden: iOS Safari's picker ignores `hidden` on <option>. Returns the
      label of a chosen time it had to clear (so the change can be explained),
      else ''. */
  const syncTimes = (form) => {
    const date = form.elements.date;
    const time = form.elements.time;
    if (!date || !time || !hours.length) return '';
    if (!allSlots.has(time)) {
      allSlots.set(time, Array.from(time.options).filter((option) => option.value));
    }
    const range = hoursFor(date.value);
    const chosen = time.value;
    const chosenLabel = time.selectedOptions[0]?.textContent.trim() || '';
    const slots = allSlots.get(time).filter((option) => {
      const t = minutes(option.value);
      return range === undefined || (range && t >= range[0] && t <= range[1] - lastSlot);
    });
    const placeholder = Array.from(time.options).filter((option) => !option.value);
    time.replaceChildren(...placeholder, ...slots);
    if (chosen && !slots.some((option) => option.value === chosen)) {
      time.value = '';
      return chosenLabel;
    }
    time.value = chosen;
    return '';
  };

  /* ---- Validation ------------------------------------------------------ */
  const messageFor = (control) => {
    const v = control.validity;
    const label = LABEL_OF(control);
    const form = control.form;

    if (v.valueMissing) return MISSING[control.name] || `Please fill in ${label}.`;
    if (v.typeMismatch && control.type === 'email') return 'That email address does not look quite right.';
    if (v.patternMismatch && control.type === 'tel') return 'Please enter a full phone number, e.g. 07700 900000.';
    if (v.tooShort) return `A little more detail, please (at least ${control.minLength} characters).`;
    if (control.name === 'guests') {
      if (v.rangeOverflow && form.dataset.contactForm === 'book') {
        return `For ${hireFrom} or more, please use the private hire form.`;
      }
      if (v.rangeUnderflow && form.dataset.contactForm === 'private-hire' && Number(control.value) >= 1) {
        return `Private hire starts at ${hireFrom} guests. For a smaller group, request a table instead.`;
      }
      if (v.rangeUnderflow || v.stepMismatch || v.badInput) return 'Please enter a whole number of guests.';
      if (v.rangeOverflow) return `That is more than we can seat — call ${phone} to talk it through.`;
    }
    if (control.type === 'date') {
      if (v.rangeUnderflow) return 'Please choose today or a later date.';
      if (v.rangeOverflow || v.badInput) return 'Please choose a date within the next year.';
      if (hours.length && hoursFor(control.value) === null) return 'The café is closed that day.';
    }
    if (control.name === 'time' && control.selectedOptions[0]?.disabled) {
      return 'The café is not taking tables at that time on that day.';
    }
    return control.validationMessage;
  };

  const check = (control) => {
    if (!control.willValidate) return true;
    // Custom rules that the constraint API cannot express on its own.
    control.setCustomValidity('');
    if (control.type === 'date' && control.value && hours.length && hoursFor(control.value) === null) {
      control.setCustomValidity('closed');
    }
    const valid = control.checkValidity();
    const slot = document.getElementById(`${control.id}-err`);
    control.setAttribute('aria-invalid', String(!valid));
    if (slot) {
      slot.textContent = valid ? '' : messageFor(control);
      slot.hidden = valid;
    }
    return valid;
  };

  const controls = (form) => [...form.querySelectorAll('.cf-input')];

  forms.forEach((form) => {
    // Errors appear once a field has been left, then update while typing.
    on(form, 'focusout', (event) => {
      if (event.target.matches?.('.cf-input') && (event.target.value || event.target.dataset.touched)) {
        event.target.dataset.touched = 'true';
        check(event.target);
      }
    });
    on(form, 'input', (event) => {
      if (event.target.dataset?.touched || event.target.getAttribute('aria-invalid') === 'true') check(event.target);
    });
    on(form, 'change', (event) => {
      if (event.target.matches?.('[data-date]')) {
        const cleared = syncTimes(form);
        check(event.target);
        const time = form.elements.time;
        // A time picked before the date can fall outside that day's hours.
        // Say so now, rather than leaving an empty field to find on submit.
        if (cleared && hoursFor(event.target.value)) {
          time.dataset.touched = 'true';
          check(time);
          const slot = document.getElementById(`${time.id}-err`);
          if (slot) slot.textContent = `${cleared} is not available on ${weekdayOf(event.target.value)}s. Please choose another time.`;
        } else if (time?.dataset.touched) check(time);
      }
      if (event.target.tagName === 'SELECT') {
        event.target.dataset.touched = 'true';
        check(event.target);
      }
    });
    on(form, 'submit', (event) => submit(event, form));
  });

  /* ---- Submission ------------------------------------------------------ */
  const summary = (form) => {
    const f = form.elements;
    const first = (f.name?.value || '').trim().split(/\s+/)[0];
    const thanks = first ? `Thank you, ${first}. ` : 'Thank you. ';
    switch (form.dataset.contactForm) {
      case 'book': {
        const n = Number(f.guests.value);
        const time = f.time.selectedOptions[0]?.textContent.trim();
        return `${thanks}Your request for ${n} ${n === 1 ? 'guest' : 'guests'} on ${prettyDate(f.date.value)} at ${time} is with the café. It is not confirmed until they get back to you at ${f.email.value}.`;
      }
      case 'private-hire':
        return `${thanks}Your ${f.occasion.value.toLowerCase()} enquiry for ${prettyDate(f.date.value)} is with the café. They will reply to ${f.email.value} to talk through what is possible.`;
      default:
        return `${thanks}Your message is with the café and they will reply to ${f.email.value}.`;
    }
  };

  const showDone = (form, text) => {
    const done = form.parentElement.querySelector('[data-contact-done]');
    if (!done) return;
    done.querySelector('[data-done-text]').textContent = text;
    form.hidden = true;
    done.hidden = false;
    done.focus();
    dialog.querySelector('.contact-sheet')?.scrollTo({ top: 0 });
  };

  const setBusy = (form, busy) => {
    const button = form.querySelector('.cf-submit');
    const label = form.querySelector('[data-submit-label]');
    if (!button || !label) return;
    if (busy) label.dataset.idle = label.textContent;
    label.textContent = busy ? 'Sending…' : (label.dataset.idle || label.textContent);
    button.disabled = busy;
    button.setAttribute('aria-busy', String(busy));
  };

  async function submit(event, form) {
    event.preventDefault();
    const alert = form.querySelector('[data-contact-alert]');
    alert.hidden = true;

    const invalid = controls(form).filter((c) => { c.dataset.touched = 'true'; return !check(c); });
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    const text = summary(form);

    if (!endpoint) {
      showDone(form, `${text} (Preview: this form is not connected yet, so nothing was actually sent.)`);
      return;
    }

    setBusy(form, true);
    try {
      // Web3Forms wants JSON, not multipart form data: an unchecked checkbox
      // (the honeypot) is simply absent from FormData, which is exactly the
      // "not a bot" case, so Object.fromEntries needs nothing extra for it.
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.success === false) {
        throw new Error(body.message || `status ${response.status}`);
      }
      showDone(form, text);
    } catch (error) {
      console.error('[hackberries] contact form failed', error);
      alert.textContent = `Sorry, that did not go through. Please try again, or call the café on ${phone}.`;
      alert.hidden = false;
    } finally {
      setBusy(form, false);
    }
  }

  /** Back from the success state to an empty form - keeping who you are. */
  const again = (panel) => {
    const form = panel.querySelector('form');
    const done = panel.querySelector('[data-contact-done]');
    if (!form || !done || done.hidden) return false;
    const keep = ['name', 'email', 'phone'].map((k) => [k, form.elements[k]?.value]);
    form.reset();
    keep.forEach(([k, v]) => { if (form.elements[k]) form.elements[k].value = v || ''; });
    controls(form).forEach((c) => {
      delete c.dataset.touched;
      c.removeAttribute('aria-invalid');
      const slot = document.getElementById(`${c.id}-err`);
      if (slot) { slot.hidden = true; slot.textContent = ''; }
    });
    syncTimes(form);
    done.hidden = true;
    form.hidden = false;
    return true;
  };

  dialog.querySelectorAll('[data-contact-again]').forEach((button) => {
    on(button, 'click', () => {
      const panel = button.closest('[data-contact-panel]');
      if (again(panel)) panel.querySelector('.cf-input')?.focus();
    });
  });
  // A sent form is not waiting for you the next time the pop-up opens.
  on(dialog, 'close', () => panels.forEach(again));

  /* ---- Start ----------------------------------------------------------- */
  select('book');

  // contact.html#private-hire (or #book, #message) opens straight onto that
  // form, so a shared link lands where it was meant to.
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (TABS.includes(id) && document.body.classList.contains('is-contact-page')) open(id);
  };
  fromHash();
  on(window, 'hashchange', fromHash);

  return () => {
    if (dialog.open) dialog.close();
    cleanups.forEach((fn) => fn());
  };
}
