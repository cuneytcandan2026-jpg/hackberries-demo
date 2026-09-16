/**
 * Editorial row enhancements: the bounded pointer-following preview.
 *
 * The preview is decorative. It is `aria-hidden`, cannot receive pointer
 * events, sits behind the copy, and never carries information that is not
 * already in the row's text.
 */
import { motion, rafBatch } from './motion.js';

/* ==========================================================================
   Pointer-following row previews
   ========================================================================== */
export function initRowPreviews() {
  const rows = Array.from(document.querySelectorAll('[data-row]'));
  if (!rows.length) return () => {};

  // Fine pointer only. Touch and reduced motion get the static thumbnail that
  // is already in the markup.
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const teardowns = [];
  let wired = false;

  function wire() {
    if (wired) return;
    wired = true;

    for (const row of rows) {
      const preview = row.querySelector('[data-row-preview]');
      if (!preview) continue;

      // Mild interpolation towards the pointer: the preview lags by roughly
      // 150ms, which reads as weight rather than lateness.
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let tilt = 0;
      let frame = null;
      let active = false;

      const tick = () => {
        const prevX = currentX;
        currentX += (targetX - currentX) * 0.16;
        currentY += (targetY - currentY) * 0.16;

        // The print leans into the direction of travel. The lean is derived
        // from the frame-to-frame delta, eased towards zero so it settles
        // upright the moment the pointer stops, and clamped hard so a fast
        // flick can never spin it.
        const velocity = currentX - prevX;
        tilt += (Math.max(-7, Math.min(7, velocity * 0.5)) - tilt) * 0.12;

        preview.style.setProperty('--px', `${currentX.toFixed(1)}px`);
        preview.style.setProperty('--py', `${currentY.toFixed(1)}px`);
        preview.style.setProperty('--pv', `${tilt.toFixed(2)}deg`);
        if (active) frame = requestAnimationFrame(tick);
      };

      // Pointer position is only READ here; all writing happens in the frame
      // callback above, so the move handler stays cheap.
      const onMove = rafBatch((clientX, clientY) => {
        const rect = row.getBoundingClientRect();
        const pw = preview.offsetWidth;
        const ph = preview.offsetHeight;
        // Offset from the pointer so it never sits directly under the cursor.
        const rawX = clientX - rect.left + 28;
        const rawY = clientY - rect.top - ph / 2;
        // Bounded to the row on both axes.
        targetX = Math.min(Math.max(rawX, 8), Math.max(rect.width - pw - 8, 8));
        targetY = Math.min(Math.max(rawY, -ph * 0.25), Math.max(rect.height - ph * 0.75, 0));
      });

      const onPointerMove = (event) => {
        if (event.pointerType !== 'mouse') return;
        onMove(event.clientX, event.clientY);
      };

      const onEnter = (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        if (motion.reduced) return;
        active = true;
        // Start where the pointer is, so it does not fly in from the corner.
        const rect = row.getBoundingClientRect();
        currentX = event.clientX - rect.left + 28;
        currentY = event.clientY - rect.top - preview.offsetHeight / 2;
        targetX = currentX;
        targetY = currentY;
        row.classList.add('is-previewing');
        if (frame == null) frame = requestAnimationFrame(tick);
      };

      const onLeave = () => {
        active = false;
        row.classList.remove('is-previewing');
        if (frame != null) cancelAnimationFrame(frame);
        frame = null;
        tilt = 0;
        preview.style.setProperty('--pv', '0deg');
        onMove.cancel();
      };

      row.addEventListener('pointerenter', onEnter);
      row.addEventListener('pointermove', onPointerMove);
      row.addEventListener('pointerleave', onLeave);

      teardowns.push(() => {
        onLeave();
        row.removeEventListener('pointerenter', onEnter);
        row.removeEventListener('pointermove', onPointerMove);
        row.removeEventListener('pointerleave', onLeave);
      });
    }
  }

  function unwire() {
    while (teardowns.length) teardowns.pop()();
    wired = false;
  }

  const sync = () => {
    if (fine.matches && !motion.reduced) wire();
    else unwire();
  };

  fine.addEventListener('change', sync);
  const offMotion = motion.onChange(sync);
  sync();

  return () => {
    unwire();
    fine.removeEventListener('change', sync);
    offMotion();
  };
}
