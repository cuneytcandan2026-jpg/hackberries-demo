/**
 * "Life at Hackberries" - lightbox and the optional collage drag.
 *
 * The lightbox is the primary experience and works everywhere: every print is
 * a real button, with keyboard access, previous/next controls and captions.
 *
 * Dragging is a desktop-only decoration layered on top. It applies a bounded
 * transform offset to a print that is otherwise positioned by CSS grid, so
 * the initial layout stays deterministic at every breakpoint and resizing can
 * never strand a photograph outside the gallery.
 */
import { GALLERY, PHOTOS } from '../data/media.mjs';
import { motion, trapFocus } from './motion.js';

/* ==========================================================================
   Lightbox
   ========================================================================== */
export function initLightbox() {
  const box = document.getElementById('lightbox');
  const openers = Array.from(document.querySelectorAll('[data-lightbox-open]'));
  if (!box || !openers.length) return () => {};

  const img = box.querySelector('[data-lb-img]');
  const caption = box.querySelector('[data-lb-caption]');
  const counter = box.querySelector('[data-lb-index]');
  const btnClose = document.getElementById('lb-close');
  const btnPrev = document.getElementById('lb-prev');
  const btnNext = document.getElementById('lb-next');

  let index = 0;
  let open = false;
  let opener = null;
  let releaseTrap = null;
  let scrollLock = 0;

  function show(next) {
    index = ((next % GALLERY.length) + GALLERY.length) % GALLERY.length;
    const item = GALLERY[index];
    const photo = PHOTOS[item.photo];
    // Full-size viewing uses the largest derivative available for the photo.
    const source = openers[index].querySelector('img');
    const best = source?.currentSrc || source?.src || '';
    img.src = best.replace(/-(\d+)\.(jpg|webp)$/, (m, w, ext) => `-${Math.max(Number(w), 600)}.${ext}`);
    img.alt = photo.alt;
    if (caption) caption.textContent = photo.alt;
    if (counter) counter.textContent = String(index + 1);
  }

  function setOpen(next, from) {
    if (next === open) return;
    open = next;

    if (next) {
      opener = from || document.activeElement;
      box.hidden = false;
      scrollLock = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollLock}px`;
      document.body.style.insetInline = '0';
      releaseTrap = trapFocus(box);
      btnClose?.focus();
    } else {
      box.hidden = true;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.insetInline = '';
      window.scrollTo(0, scrollLock);
      releaseTrap?.();
      releaseTrap = null;
      opener?.focus();
      opener = null;
    }
  }

  const onOpen = (event) => {
    const i = Number(event.currentTarget.dataset.lightboxOpen);
    show(i);
    setOpen(true, event.currentTarget);
  };
  const onClose = () => setOpen(false);
  const onPrev = () => show(index - 1);
  const onNext = () => show(index + 1);
  const onKeydown = (event) => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
  };
  // A click on the backdrop closes; a click on the photo itself does not.
  const onBackdrop = (event) => {
    if (event.target === box || event.target.classList.contains('lightbox-stage')) {
      setOpen(false);
    }
  };
  // If a photo fails to load, say so rather than showing a broken icon.
  const onError = () => {
    if (caption) caption.textContent = 'This photograph could not be loaded.';
  };

  openers.forEach((o) => o.addEventListener('click', onOpen));
  btnClose?.addEventListener('click', onClose);
  btnPrev?.addEventListener('click', onPrev);
  btnNext?.addEventListener('click', onNext);
  document.addEventListener('keydown', onKeydown);
  box.addEventListener('click', onBackdrop);
  img?.addEventListener('error', onError);

  return () => {
    setOpen(false);
    openers.forEach((o) => o.removeEventListener('click', onOpen));
    btnClose?.removeEventListener('click', onClose);
    btnPrev?.removeEventListener('click', onPrev);
    btnNext?.removeEventListener('click', onNext);
    document.removeEventListener('keydown', onKeydown);
    box.removeEventListener('click', onBackdrop);
    img?.removeEventListener('error', onError);
  };
}

/* ==========================================================================
   Collage drag (optional decoration)
   ========================================================================== */
export function initCollageDrag() {
  const collage = document.getElementById('collage');
  const reset = document.getElementById('collage-reset');
  if (!collage) return () => {};

  // Desktop, fine pointer, full motion only.
  const eligible = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 64rem)');
  const prints = Array.from(collage.querySelectorAll('[data-print]'));

  let wired = false;
  let dragging = null;
  let topZ = 10;
  const offsets = new Map();

  function apply(print) {
    const off = offsets.get(print) || { x: 0, y: 0 };
    print.style.setProperty('--dx', `${off.x}px`);
    print.style.setProperty('--dy', `${off.y}px`);
  }

  /** Clamp so a print can never leave the collage box. */
  function clamp(print, x, y) {
    const box = collage.getBoundingClientRect();
    const rect = print.getBoundingClientRect();
    const off = offsets.get(print) || { x: 0, y: 0 };
    // Where the print sits with no offset applied.
    const baseLeft = rect.left - off.x;
    const baseTop = rect.top - off.y;
    const minX = box.left - baseLeft;
    const maxX = box.right - rect.width - baseLeft;
    const minY = box.top - baseTop;
    const maxY = box.bottom - rect.height - baseTop;
    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  }

  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const print = event.currentTarget;
    // A plain click must still open the lightbox, so the drag only begins
    // once the pointer has actually travelled.
    dragging = {
      print,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...(offsets.get(print) || { x: 0, y: 0 }) },
      moved: false,
      pointerId: event.pointerId,
    };
    bindDragWindow(true);
  };

  const onPointerMove = (event) => {
    if (!dragging || event.pointerId !== dragging.pointerId) return;

    // If the button was released somewhere we never heard about (the pointer
    // left the window, another element stole capture), end the drag rather
    // than carrying on following the cursor.
    if (event.buttons === 0) {
      endDrag(event);
      return;
    }

    const dx = event.clientX - dragging.startX;
    const dy = event.clientY - dragging.startY;

    if (!dragging.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      dragging.moved = true;
      dragging.print.classList.add('is-dragging');
      dragging.print.style.zIndex = String(++topZ);
      try {
        dragging.print.setPointerCapture(dragging.pointerId);
      } catch {
        // Capture is an optimisation; the window listeners below are the
        // guarantee that the drag still ends correctly.
      }
    }

    const next = clamp(dragging.print, dragging.origin.x + dx, dragging.origin.y + dy);
    offsets.set(dragging.print, next);
    apply(dragging.print);
    reset?.removeAttribute('hidden');
  };

  /**
   * Window-level listeners, added ONLY while a drag is actually in progress
   * and removed as soon as it ends. Pointer capture alone is not reliable
   * (Firefox drops it when the pointer leaves the viewport), which left the
   * drag running after the button was released. These are mouse-only and
   * never preventDefault a scroll, so page scrolling is untouched.
   */
  function bindDragWindow(on) {
    const fn = on ? window.addEventListener : window.removeEventListener;
    fn.call(window, 'pointermove', onPointerMove);
    fn.call(window, 'pointerup', endDrag);
    fn.call(window, 'pointercancel', endDrag);
    fn.call(window, 'blur', endDrag);
  }

  function endDrag(event) {
    if (!dragging) return;
    const { print, moved, pointerId } = dragging;
    dragging = null;
    bindDragWindow(false);
    if (!moved) return;

    print.classList.remove('is-dragging');
    try {
      if (print.hasPointerCapture?.(pointerId)) print.releasePointerCapture(pointerId);
    } catch { /* already released */ }

    // Brief low-energy settle, then re-clamp in case the layout moved.
    print.classList.add('is-settling');
    const current = offsets.get(print) || { x: 0, y: 0 };
    const settled = clamp(print, current.x, current.y);
    offsets.set(print, settled);
    apply(print);
    setTimeout(() => print.classList.remove('is-settling'), 540);

    // Suppress the click that would otherwise open the lightbox.
    const swallow = (e) => { e.preventDefault(); e.stopPropagation(); };
    print.addEventListener('click', swallow, { capture: true, once: true });
    event?.preventDefault();
  }

  // Firefox starts a native HTML5 image drag on pointerdown, which cancels
  // the pointer event stream and silently kills the collage drag. Suppress it.
  const onDragStart = (event) => event.preventDefault();

  const onResize = () => {
    // Bounds change with the viewport: pull every print back inside.
    for (const [print, off] of offsets) {
      const next = clamp(print, off.x, off.y);
      offsets.set(print, next);
      apply(print);
    }
  };

  const onReset = () => {
    for (const print of offsets.keys()) {
      offsets.set(print, { x: 0, y: 0 });
      print.classList.add('is-settling');
      print.style.zIndex = '';
      apply(print);
      setTimeout(() => print.classList.remove('is-settling'), 540);
    }
    offsets.clear();
    reset?.setAttribute('hidden', '');
    reset?.blur();
  };

  function wire() {
    if (wired) return;
    wired = true;
    collage.classList.add('is-draggable');
    // Only advertise dragging when it is actually available.
    document.getElementById('collage-hint')?.style.removeProperty('display');
    for (const print of prints) {
      print.addEventListener('pointerdown', onPointerDown);
      print.addEventListener('dragstart', onDragStart);
    }
    window.addEventListener('resize', onResize);
    reset?.addEventListener('click', onReset);
  }

  function unwire() {
    if (!wired) return;
    wired = false;
    endDrag();
    bindDragWindow(false);
    collage.classList.remove('is-draggable');
    const hint = document.getElementById('collage-hint');
    if (hint) hint.style.display = 'none';
    onReset();
    for (const print of prints) {
      print.removeEventListener('pointerdown', onPointerDown);
      print.removeEventListener('dragstart', onDragStart);
    }
    window.removeEventListener('resize', onResize);
    reset?.removeEventListener('click', onReset);
  }

  const sync = () => {
    if (eligible.matches && !motion.reduced) wire();
    else unwire();
  };

  eligible.addEventListener('change', sync);
  const offMotion = motion.onChange(sync);
  sync();

  return () => {
    unwire();
    eligible.removeEventListener('change', sync);
    offMotion();
  };
}
