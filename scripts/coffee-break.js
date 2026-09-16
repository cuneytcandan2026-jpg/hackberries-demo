/**
 * "A little coffee break" - the optional signature extra.
 *
 * Deliberately activated by a button, never automatic. A small number of
 * illustrated coffee beans fall into a bounded decorative strip inside the
 * footer, settle, and can be cleared.
 *
 * Constraints held here:
 *   - 10 beans on desktop, 6 on narrow screens.
 *   - The canvas layer is aria-hidden and pointer-events: none, so it cannot
 *     cover or intercept any link, label or control.
 *   - The strip sits below the footer columns, so nothing important is hidden.
 *   - Disabled entirely under reduced motion, with a calm static message.
 *   - Everything (canvas, RAF, listeners) is torn down when cleared or done.
 *
 * This module is loaded lazily, only when the button is first pressed, so it
 * costs the homepage nothing.
 */

const GRAVITY = 1500;      // px per second squared
const RESTITUTION = 0.32;  // energy kept on bounce
const FRICTION = 0.86;
const MAX_MS = 9000;       // hard stop, so nothing runs forever

export function runCoffeeBreak({ field, onDone }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = field.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) {
    onDone?.();
    return () => {};
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext('2d');

  // No 2D context (rare, but possible): fail quietly, keep the site working.
  if (!ctx) {
    onDone?.();
    return () => {};
  }
  ctx.scale(dpr, dpr);
  field.replaceChildren(canvas);

  const count = rect.width < 560 ? 6 : 10;
  const beans = Array.from({ length: count }, (_, i) => ({
    x: rect.width * (0.12 + 0.76 * ((i + 0.5) / count)) + (Math.random() - 0.5) * 24,
    y: -30 - Math.random() * 90,
    vx: (Math.random() - 0.5) * 70,
    vy: 0,
    r: 9 + Math.random() * 4,
    a: Math.random() * Math.PI,
    va: (Math.random() - 0.5) * 5,
    hue: Math.random() < 0.35 ? '#8E3210' : '#4A2B18',
  }));

  function drawBean(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.a);
    ctx.fillStyle = b.hue;
    ctx.beginPath();
    ctx.ellipse(0, 0, b.r, b.r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    // The seam.
    ctx.strokeStyle = 'rgba(247, 243, 234, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-b.r * 0.72, 0);
    ctx.quadraticCurveTo(0, b.r * 0.32, b.r * 0.72, 0);
    ctx.stroke();
    ctx.restore();
  }

  let raf = null;
  let last = performance.now();
  let elapsed = 0;
  let stopped = false;

  function frame(now) {
    if (stopped) return;
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    elapsed += dt * 1000;

    ctx.clearRect(0, 0, rect.width, rect.height);

    let moving = false;
    const floor = rect.height - 6;

    for (const b of beans) {
      b.vy += GRAVITY * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.a += b.va * dt;

      if (b.y + b.r > floor) {
        b.y = floor - b.r;
        b.vy *= -RESTITUTION;
        b.vx *= FRICTION;
        b.va *= FRICTION;
        if (Math.abs(b.vy) < 26) b.vy = 0;
      }
      // Walls.
      if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * RESTITUTION; }
      if (b.x + b.r > rect.width) { b.x = rect.width - b.r; b.vx = -Math.abs(b.vx) * RESTITUTION; }

      if (Math.abs(b.vy) > 4 || Math.abs(b.vx) > 4) moving = true;
      drawBean(b);
    }

    if (!moving || elapsed > MAX_MS) {
      // Settled: stop the loop but leave the beans drawn where they landed.
      stopped = true;
      raf = null;
      onDone?.();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

  return function cleanup() {
    stopped = true;
    if (raf != null) cancelAnimationFrame(raf);
    raf = null;
    field.replaceChildren();
  };
}
