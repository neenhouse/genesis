import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let time = 0;

// Velocity field for advection
let vx: Float32Array;
let vy: Float32Array;
const STEP = 3;

let dragX = -1, dragY = -1, prevDragX = -1, prevDragY = -1;

export const fluid: Algorithm = {
  name: 'Fluid',
  description: 'Fluid simulation — drag to inject swirls and mix colors',
  interactive: true,
  palette: { background: '#ffffff', colors: ['#e63946', '#f4a261', '#457b9d', '#2a9d8f'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    time = 0;

    const cols = Math.ceil(w / STEP);
    const rows = Math.ceil(h / STEP);
    vx = new Float32Array(cols * rows);
    vy = new Float32Array(cols * rows);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i;
        vx[idx] = (p.noise(i * 0.05, j * 0.05, 0) - 0.5) * 2;
        vy[idx] = (p.noise(i * 0.05, j * 0.05, 10) - 0.5) * 2;
      }
    }

    p.background(255);
    p.colorMode(p.RGB);
    p.noStroke();
  },

  draw(p: p5) {
    time += 0.008;
    p.background(255, 255, 255, 18);
    p.colorMode(p.RGB);
    p.noStroke();

    const blobs = [
      { x: w * 0.25 + Math.cos(time * 0.7) * w * 0.2, y: h * 0.3 + Math.sin(time * 0.5) * h * 0.15, r: 230, g: 57, b: 70 },
      { x: w * 0.7  + Math.sin(time * 0.4) * w * 0.18, y: h * 0.6 + Math.cos(time * 0.6) * h * 0.18, r: 244, g: 162, b: 97 },
      { x: w * 0.5  + Math.cos(time * 0.9 + 1) * w * 0.22, y: h * 0.5 + Math.sin(time * 0.8) * h * 0.2, r: 69, g: 123, b: 157 },
      { x: w * 0.15 + Math.sin(time * 0.3 + 2) * w * 0.1, y: h * 0.75 + Math.cos(time * 0.5 + 1) * h * 0.12, r: 42, g: 157, b: 143 },
    ];

    // Inject drag velocity into the field
    if (dragX >= 0 && prevDragX >= 0) {
      const dvx = (dragX - prevDragX) * 0.5;
      const dvy = (dragY - prevDragY) * 0.5;
      const ci = Math.floor(dragX / STEP);
      const cj = Math.floor(dragY / STEP);
      const cols2 = Math.ceil(w / STEP);
      const radius = 8;
      for (let dj = -radius; dj <= radius; dj++) {
        for (let di = -radius; di <= radius; di++) {
          const ni = ci + di, nj = cj + dj;
          if (ni < 0 || ni >= cols2 || nj < 0 || nj >= Math.ceil(h / STEP)) continue;
          const dist = Math.sqrt(di * di + dj * dj);
          if (dist > radius) continue;
          const falloff = 1 - dist / radius;
          const idx2 = nj * cols2 + ni;
          vx[idx2] += dvx * falloff;
          vy[idx2] += dvy * falloff;
        }
      }
    }
    prevDragX = dragX; prevDragY = dragY;
    dragX = -1; dragY = -1;

    const cols = Math.ceil(w / STEP);
    for (const blob of blobs) {
      const spread = Math.min(w, h) * 0.18;
      const x0 = Math.max(0, Math.floor((blob.x - spread) / STEP));
      const x1 = Math.min(cols - 1, Math.ceil((blob.x + spread) / STEP));
      const y0 = Math.max(0, Math.floor((blob.y - spread) / STEP));
      const y1 = Math.min(Math.ceil(h / STEP) - 1, Math.ceil((blob.y + spread) / STEP));

      for (let j = y0; j <= y1; j++) {
        for (let i = x0; i <= x1; i++) {
          const px = i * STEP;
          const py = j * STEP;
          const idx = j * cols + i;
          const ax = px + vx[idx] * 18 * p.noise(i * 0.04, j * 0.04, time * 0.5);
          const ay = py + vy[idx] * 18 * p.noise(i * 0.04 + 5, j * 0.04 + 5, time * 0.5);
          const d = Math.hypot(ax - blob.x, ay - blob.y);
          const alpha = Math.max(0, 1 - d / spread) * 90;
          if (alpha < 1) continue;
          p.fill(blob.r, blob.g, blob.b, alpha);
          p.rect(px, py, STEP, STEP);
        }
      }
    }
  },

  mouseDragged(_p: p5, mx: number, my: number) {
    dragX = mx; dragY = my;
  },

  resize(p: p5, width: number, height: number) {
    fluid.setup(p, currentSeed, width, height);
    p.loop();
  },
};
