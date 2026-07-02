/**
 * Ambient "curve learning" hero animation.
 *
 * A single continuous RBF-regression curve is fit — once, synchronously, via
 * a plain training loop, not per animation frame — to a scattered stream of
 * points sampled from one smooth target function that's defined over the
 * whole (unbounded) x-axis. On mount, the points fade in and the curve draws
 * itself outward from the center of the view. Once revealed, the whole
 * thing pans continuously sideways forever, lazily extending (and training)
 * new domain just ahead of the leading edge and pruning what scrolls past
 * the trailing edge. No external libraries — plain TypeScript + Canvas 2D.
 * Respects `prefers-reduced-motion`.
 */

interface Point {
  x: number; // position along the (unbounded) virtual x-axis
  y: number;
}

const UNIT_PX = 90; // canvas px per domain-unit
const SIGMA = 0.8; // width of each RBF basis function, in domain-units (wider = smoother, less overfit)
const CENTER_SPACING = 0.6; // spacing between RBF centers, in domain-units (fewer centers = less capacity to chase noise)
const L2_LAMBDA = 0.04; // weight decay: keeps the fit from bending to pass through every point
const POINT_SPACING_BASE = 0.9; // average spacing between points, in domain-units
const POINT_SPACING_JITTER = 0.5;
const LEARNING_RATE = 0.5;
const INITIAL_TRAIN_ITERS = 450; // synchronous warm-up fit on mount
const EXTEND_TRAIN_ITERS = 140; // synchronous fit whenever new domain is generated
const SCROLL_PX_PER_SEC = 47.3; // constant leftward pan speed (30% faster than the previous 36.4)
const BUFFER_UNITS = 5; // how far ahead of the visible edge to keep pre-fitted
const EXTEND_CHUNK_UNITS = 8; // overshoot past what's needed so extension is a rare, chunky event
const PAD_Y = 14; // vertical padding in css pixels
const POINTS_FADE_MS = 450; // intro: points fading in
const CURVE_REVEAL_DELAY_MS = 250; // intro: curve reveal starts slightly after points
const CURVE_REVEAL_MS = 900; // intro: curve drawing outward from center

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** RBF feature value for input x against a set of centers (with a leading bias term). */
function features(x: number, centers: number[]): number[] {
  const phi = [1]; // bias
  for (const c of centers) {
    phi.push(Math.exp(-((x - c) ** 2) / (2 * SIGMA * SIGMA)));
  }
  return phi;
}

function predict(weights: number[], centers: number[], x: number): number {
  const phi = features(x, centers);
  let sum = 0;
  for (let i = 0; i < weights.length; i++) sum += weights[i] * phi[i];
  return sum;
}

/** One batch gradient-descent step over all points (MSE loss). */
function trainStep(weights: number[], centers: number[], points: Point[]): void {
  if (points.length === 0) return;
  const grad = new Array(weights.length).fill(0);
  for (const p of points) {
    const phi = features(p.x, centers);
    let pred = 0;
    for (let i = 0; i < weights.length; i++) pred += weights[i] * phi[i];
    const err = pred - p.y;
    for (let i = 0; i < weights.length; i++) grad[i] += (2 / points.length) * err * phi[i];
  }
  // L2 weight decay (skip the bias term) so the curve stays smooth instead of
  // bending to pass exactly through every noisy point.
  for (let i = 1; i < weights.length; i++) grad[i] += L2_LAMBDA * weights[i];
  for (let i = 0; i < weights.length; i++) weights[i] -= LEARNING_RATE * grad[i];
}

/** One smooth target function, defined over the whole real line. */
function makeTarget(): (x: number) => number {
  const a = 0.3 + Math.random() * 0.4;
  const b = 1 + Math.random() * 2.5;
  const c = Math.random() * Math.PI * 2;
  const d = 0.15 + Math.random() * 0.3;
  const e = 2 + Math.random() * 2;
  return (x: number) => {
    const v = 0.5 + a * Math.sin(b * Math.PI * x + c) * 0.6 + d * Math.cos(e * x + c) * 0.4;
    return clamp(v, 0.05, 0.95);
  };
}

interface Theme {
  curve: string;
  point: string;
  pointRing: string;
}

function readTheme(): Theme {
  const isDark = document.documentElement.classList.contains('dark');
  const accent =
    getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() ||
    (isDark ? '#3ec7b0' : '#0f9d8a');
  return {
    curve: accent,
    point: isDark ? '#e4e4e7' : '#27272a',
    pointRing: isDark ? 'rgba(9,9,11,0.9)' : 'rgba(255,255,255,0.95)',
  };
}

export function mountLearningCurve(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const target = makeTarget();
  let theme = readTheme();
  let width = 0;
  let height = 0;
  let originX = 0; // screen px where virtual x = scrollX is drawn
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let points: Point[] = [];
  let centers: number[] = [];
  let weights: number[] = [0];
  let minKnownX = 0;
  let maxKnownX = 0;
  let scrollX = 0; // current center of view, in domain-units

  const toPy = (y: number) => height - PAD_Y - y * (height - 2 * PAD_Y);
  const toPx = (x: number) => (x - scrollX) * UNIT_PX + originX;

  function extendRight(targetMaxX: number): void {
    if (targetMaxX <= maxKnownX) return;
    // Overshoot past the target so this only has to run occasionally, not every frame.
    const goalX = targetMaxX + EXTEND_CHUNK_UNITS;
    let x = maxKnownX;
    while (x < goalX) {
      x += POINT_SPACING_BASE + Math.random() * POINT_SPACING_JITTER;
      points.push({ x, y: clamp(target(x) + (Math.random() - 0.5) * 0.12, 0.03, 0.97) });
    }
    let c = maxKnownX;
    while (c < goalX) {
      c += CENTER_SPACING;
      centers.push(c);
      weights.push(0.5);
    }
    maxKnownX = goalX;
  }

  function extendLeft(targetMinX: number): void {
    if (targetMinX >= minKnownX) return;
    const goalX = targetMinX - EXTEND_CHUNK_UNITS;
    let x = minKnownX;
    while (x > goalX) {
      x -= POINT_SPACING_BASE + Math.random() * POINT_SPACING_JITTER;
      points.push({ x, y: clamp(target(x) + (Math.random() - 0.5) * 0.12, 0.03, 0.97) });
    }
    let c = minKnownX;
    while (c > goalX) {
      c -= CENTER_SPACING;
      centers.push(c);
      weights.push(0.5);
    }
    minKnownX = goalX;
  }

  function pruneBefore(minKeepX: number): void {
    if (minKeepX <= minKnownX) return;
    points = points.filter((p) => p.x >= minKeepX);
    const keepIdx: number[] = [];
    for (let i = 0; i < centers.length; i++) if (centers[i] >= minKeepX) keepIdx.push(i);
    centers = keepIdx.map((i) => centers[i]);
    weights = [weights[0], ...keepIdx.map((i) => weights[i + 1])];
    minKnownX = minKeepX;
  }

  function train(iterations: number): void {
    for (let s = 0; s < iterations; s++) trainStep(weights, centers, points);
  }

  function draw(pointOpacity: number, curveRadiusUnits: number | null): void {
    ctx!.clearRect(0, 0, width, height);

    if (curveRadiusUnits !== null && curveRadiusUnits > 0) {
      // The curve never reaches past the middle of the view — it trails
      // behind the current fit point, while points keep streaming in from
      // the right ahead of it, still unfitted.
      const loX = Math.max(minKnownX, scrollX - curveRadiusUnits);
      const hiX = Math.min(maxKnownX, scrollX);
      const stepPx = 4; // sample roughly every 4 css px
      ctx!.lineJoin = 'round';
      ctx!.lineCap = 'round';
      ctx!.beginPath();
      let started = false;
      for (let px = toPx(loX); px <= toPx(hiX); px += stepPx) {
        const x = scrollX + (px - originX) / UNIT_PX;
        const y = clamp(predict(weights, centers, x), -0.15, 1.15);
        const py = toPy(y);
        if (!started) {
          ctx!.moveTo(px, py);
          started = true;
        } else {
          ctx!.lineTo(px, py);
        }
      }
      // Cheap faux-glow: a couple of wide, translucent under-strokes instead
      // of ctx.shadowBlur, which forces a full-canvas blur pass every frame
      // and was the main source of animation jank.
      ctx!.strokeStyle = theme.curve;
      ctx!.globalAlpha = 0.12;
      ctx!.lineWidth = 6;
      ctx!.stroke();
      ctx!.globalAlpha = 1;
      ctx!.lineWidth = 2;
      ctx!.stroke();
    }

    if (pointOpacity > 0) {
      ctx!.globalAlpha = pointOpacity;
      for (const p of points) {
        const px = toPx(p.x);
        if (px < -10 || px > width + 10) continue;
        const py = toPy(p.y);
        ctx!.beginPath();
        ctx!.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx!.fillStyle = theme.pointRing;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(px, py, 3, 0, Math.PI * 2);
        ctx!.fillStyle = theme.point;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }
  }

  function ensureCoverage(): void {
    const halfWidthUnits = width / 2 / UNIT_PX;
    extendLeft(scrollX - halfWidthUnits - BUFFER_UNITS);
    extendRight(scrollX + halfWidthUnits + BUFFER_UNITS);
    pruneBefore(scrollX - halfWidthUnits - BUFFER_UNITS * 2);
  }

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    originX = width / 2;
    // Setting width/height clears the canvas bitmap, even to the same value —
    // ResizeObserver fires once right after `.observe()`, so this must repaint.
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const grew = ensureCoverageGrew();
    if (grew) train(EXTEND_TRAIN_ITERS);
    draw(introDone ? 1 : 0, introDone ? width / 2 / UNIT_PX + 1 : 0);
  }

  function ensureCoverageGrew(): boolean {
    const before = points.length;
    ensureCoverage();
    return points.length !== before;
  }

  // ---- intro: points fade in, then the curve draws outward from center ----
  let raf = 0;
  let introStart = 0;
  let introDone = reduceMotion;
  let lastTime = 0;

  function frame(now: DOMHighResTimeStamp): void {
    if (!introDone) {
      if (!introStart) introStart = now;
      const elapsed = now - introStart;
      const pointOpacity = clamp(elapsed / POINTS_FADE_MS, 0, 1);
      const curveT = clamp((elapsed - CURVE_REVEAL_DELAY_MS) / CURVE_REVEAL_MS, 0, 1);
      const eased = 1 - (1 - curveT) ** 3;
      const maxRadius = width / 2 / UNIT_PX + BUFFER_UNITS / 2;
      draw(pointOpacity, eased * maxRadius);
      if (elapsed >= CURVE_REVEAL_DELAY_MS + CURVE_REVEAL_MS) introDone = true;
      raf = requestAnimationFrame(frame);
      return;
    }

    const dt = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    scrollX += (SCROLL_PX_PER_SEC / UNIT_PX) * dt;
    if (ensureCoverageGrew()) train(EXTEND_TRAIN_ITERS);
    draw(1, width / 2 / UNIT_PX + 1);
    raf = requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);

  // Re-read colours when the theme toggles.
  const mo = new MutationObserver(() => {
    theme = readTheme();
    draw(introDone || reduceMotion ? 1 : 0, width / 2 / UNIT_PX + 1);
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  resize();
  train(INITIAL_TRAIN_ITERS);

  if (reduceMotion) {
    draw(1, width / 2 / UNIT_PX + 1);
  } else {
    raf = requestAnimationFrame(frame);
  }

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    mo.disconnect();
  };
}
