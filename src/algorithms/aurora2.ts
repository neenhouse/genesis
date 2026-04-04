import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let time = 0;
let stars: Array<{ x: number; y: number; r: number; bright: number }> = [];

interface Curtain {
  baseX: number;
  sway: number;
  freq: number;
  speed: number;
  color: [number, number, number];
  alpha: number;
}
let curtains: Curtain[] = [];

const CURTAIN_COLORS: Array<[number, number, number]> = [
  [74, 222, 128],   // green
  [134, 85, 247],   // purple
  [45, 212, 191],   // teal
  [168, 85, 247],   // violet
  [52, 211, 153],   // emerald
];

export const aurora2: Algorithm = {
  name: 'Aurora 2',
  description: 'Vertical aurora curtains — drapes of light hang from the top and sway',
  palette: { background: '#02060f', colors: ['#4ade80', '#a855f7', '#2dd4bf'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    time = 0;

    // Starfield
    stars = [];
    const starCount = 180 + Math.floor(p.random(120));
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: p.random(w),
        y: p.random(h * 0.85),
        r: p.random(0.5, 2.2),
        bright: p.random(120, 255),
      });
    }

    // Curtains — vertical columns hanging from top
    curtains = [];
    const count = 5 + Math.floor(p.random(5));
    for (let i = 0; i < count; i++) {
      curtains.push({
        baseX: w * (0.05 + (i / count) * 0.9) + p.random(-w * 0.05, w * 0.05),
        sway: p.random(20, 70),
        freq: p.random(0.003, 0.009),
        speed: p.random(0.25, 0.7),
        color: CURTAIN_COLORS[i % CURTAIN_COLORS.length],
        alpha: p.random(0.55, 1.0),
      });
    }
  },

  draw(p: p5) {
    p.background(2, 6, 15);
    time += 0.016;

    // Stars
    p.noStroke();
    for (const s of stars) {
      const twinkle = 0.7 + 0.3 * Math.sin(time * 2 + s.x * 0.1);
      p.fill(s.bright * twinkle, s.bright * twinkle, s.bright * twinkle, 200);
      p.circle(s.x, s.y, s.r);
    }

    p.noStroke();
    // Draw each curtain as vertical strips of color
    const stripW = 3;
    for (const c of curtains) {
      const [r, g, b] = c.color;
      const halfW = Math.min(w, h) * 0.06;

      for (let xi = -halfW; xi < halfW; xi += stripW) {
        const edgeFade = 1 - Math.pow(Math.abs(xi) / halfW, 1.6);
        const xBase = c.baseX + xi;

        for (let y = 0; y < h; y += 2) {
          // Sway side-to-side using noise
          const sway = c.sway * p.noise(y * c.freq, time * c.speed, xBase * 0.001);
          const x = xBase + sway;
          // Length falloff: curtains fade out before hitting bottom
          const lengthFade = Math.pow(Math.max(0, 1 - y / (h * 0.85)), 0.4);
          // Ray-like brightness variation along the column
          const ray = p.noise(y * 0.015, time * 0.4 + xBase * 0.002) * 0.8 + 0.2;
          const a = edgeFade * lengthFade * ray * c.alpha * 55;
          if (a < 1) continue;
          p.fill(r, g, b, a);
          p.rect(x, y, stripW, 2);
        }
      }
    }
  },

  resize(p: p5, width: number, height: number) {
    aurora2.setup(p, currentSeed, width, height);
    p.loop();
  },
};
