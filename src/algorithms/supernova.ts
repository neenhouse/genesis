import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let phase = 0;
const TOTAL_FRAMES = 240;

interface Debris {
  x: number; y: number;
  vx: number; vy: number;
  r: number; g: number; b: number;
  size: number;
  decay: number;
}

interface Ring {
  radius: number;
  speed: number;
  r: number; g: number; b: number;
  width: number;
}

let debris: Debris[] = [];
let rings: Ring[] = [];
let cx = 0, cy = 0;

export const supernova: Algorithm = {
  name: 'Supernova',
  description: 'Supernova explosion — central flash with expanding shockwave rings and debris, fades over time',
  palette: { background: '#000000', colors: ['#ffffff', '#4080ff', '#ff4020'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    phase = 0;
    cx = w / 2; cy = h / 2;
    p.background(0);

    // Scatter stars in background
    for (let i = 0; i < 200; i++) {
      const sx = p.random(w);
      const sy = p.random(h);
      const sb = Math.floor(p.random(80, 200));
      p.stroke(sb, sb, sb + 20);
      p.strokeWeight(p.random() < 0.1 ? 1.5 : 0.5);
      p.point(sx, sy);
    }

    // Shockwave rings
    rings = [];
    const ringColors = [
      [255, 255, 255], [200, 220, 255], [100, 160, 255],
      [60, 100, 220], [200, 80, 40], [255, 120, 60],
    ];
    for (let i = 0; i < 6; i++) {
      const col = ringColors[i % ringColors.length];
      rings.push({
        radius: 0,
        speed: 1.8 + i * 0.6 + p.random(0.4),
        r: col[0], g: col[1], b: col[2],
        width: 3 - i * 0.3,
      });
    }

    // Debris particles
    debris = [];
    const debrisCount = 120 + Math.floor(p.random(80));
    for (let i = 0; i < debrisCount; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(1.5, 6.0);
      const warm = p.random() > 0.5;
      debris.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: warm ? 255 : Math.floor(p.random(100, 200)),
        g: Math.floor(p.random(60, 180)),
        b: warm ? Math.floor(p.random(40)) : 255,
        size: 1 + p.random(2.5),
        decay: p.random(0.97, 0.995),
      });
    }
  },

  draw(p: p5) {
    phase++;
    const t = Math.min(phase / TOTAL_FRAMES, 1.0);
    const fadeOut = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;

    // Fade to dark space
    p.fill(0, 0, 0, 18);
    p.noStroke();
    p.rect(0, 0, w, h);

    // Central flash
    if (t < 0.15) {
      const flashT = t / 0.15;
      const flashR = Math.min(w, h) * 0.5 * Math.sin(flashT * p.PI);
      for (let i = 8; i >= 1; i--) {
        const alpha = (9 - i) * 12 * (1 - flashT * 0.5) * fadeOut;
        p.noStroke();
        p.fill(255, 255, 240, alpha);
        p.ellipse(cx, cy, flashR * (i / 4), flashR * (i / 4));
      }
    }

    // Central bright core
    const coreR = Math.min(w, h) * 0.02 * (1 - t * 0.8);
    if (coreR > 1) {
      const alpha = 255 * fadeOut;
      p.noStroke();
      p.fill(255, 255, 240, alpha);
      p.ellipse(cx, cy, coreR * 2, coreR * 2);
      p.fill(255, 220, 180, alpha * 0.5);
      p.ellipse(cx, cy, coreR * 4, coreR * 4);
    }

    // Shockwave rings
    for (const ring of rings) {
      ring.radius += ring.speed;
      const ringAlpha = Math.max(0, 200 * fadeOut * (1 - ring.radius / (Math.max(w, h) * 0.8)));
      if (ringAlpha > 1) {
        p.noFill();
        p.stroke(ring.r, ring.g, ring.b, ringAlpha);
        p.strokeWeight(Math.max(0.5, ring.width * (1 - t * 0.6)));
        p.ellipse(cx, cy, ring.radius * 2, ring.radius * 2);
      }
    }

    // Debris
    p.noStroke();
    for (const d of debris) {
      d.x += d.vx;
      d.y += d.vy;
      d.vx *= d.decay;
      d.vy *= d.decay;
      const dAlpha = 200 * fadeOut * Math.max(0, 1 - phase / (TOTAL_FRAMES * 0.9));
      p.fill(d.r, d.g, d.b, dAlpha);
      p.ellipse(d.x, d.y, d.size, d.size);
    }

    if (phase >= TOTAL_FRAMES) {
      phase = 0;
      for (const ring of rings) ring.radius = 0;
      for (const d of debris) { d.x = cx; d.y = cy; }
    }
  },

  resize(p: p5, width: number, height: number) {
    supernova.setup(p, currentSeed, width, height);
    p.loop();
  },
};
