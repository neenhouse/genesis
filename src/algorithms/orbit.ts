import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0;
let a = 0, b = 0, c = 0, d = 0;
let points: Float32Array;
let pointIdx = 0;
const POINTS_PER_FRAME = 50000;
const MAX_POINTS = 2000000;

export const orbit: Algorithm = {
  name: 'Orbit',
  description: 'Strange attractors — chaotic orbits revealing hidden structure',
  palette: { background: '#000000', colors: ['#39ff14', '#a855f7', '#22d3ee'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    p.randomSeed(seed); p.noiseSeed(seed);
    a = p.random(-2, 2); b = p.random(-2, 2);
    c = p.random(-2, 2); d = p.random(-2, 2);
    points = new Float32Array(MAX_POINTS * 2);
    pointIdx = 0;

    let x = 0.1, y = 0.1;
    for (let i = 0; i < MAX_POINTS; i++) {
      const nx = Math.sin(a * y) + c * Math.cos(a * x);
      const ny = Math.sin(b * x) + d * Math.cos(b * y);
      x = nx; y = ny;
      points[i * 2] = x; points[i * 2 + 1] = y;
    }
    p.background(0);
    p.pixelDensity(1);
  },

  draw(p: p5) {
    if (pointIdx >= MAX_POINTS) { p.noLoop(); return; }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const end = Math.min(pointIdx + POINTS_PER_FRAME, MAX_POINTS);
    for (let i = 0; i < Math.min(end, 100000); i++) {
      const x = points[i * 2], y = points[i * 2 + 1];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
    const margin = 0.1;
    const scale = Math.min(w * (1 - margin * 2) / rangeX, h * (1 - margin * 2) / rangeY);
    const offsetX = w / 2 - (minX + rangeX / 2) * scale;
    const offsetY = h / 2 - (minY + rangeY / 2) * scale;

    p.loadPixels();
    for (let i = pointIdx; i < end; i++) {
      const px = Math.floor(points[i * 2] * scale + offsetX);
      const py = Math.floor(points[i * 2 + 1] * scale + offsetY);
      if (px >= 0 && px < w && py >= 0 && py < h) {
        const idx = 4 * (py * w + px);
        const t = i / MAX_POINTS;
        p.pixels[idx] = Math.min(255, p.pixels[idx] + (57 * (1-t) + 168 * t) * 0.3);
        p.pixels[idx+1] = Math.min(255, p.pixels[idx+1] + (255 * (1-t) + 85 * t) * 0.3);
        p.pixels[idx+2] = Math.min(255, p.pixels[idx+2] + (20 * (1-t) + 247 * t) * 0.3);
        p.pixels[idx+3] = 255;
      }
    }
    p.updatePixels();
    pointIdx = end;
  },

  resize(p: p5, width: number, height: number) { w = width; h = height; },
};
