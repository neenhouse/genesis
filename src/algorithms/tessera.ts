import type p5 from 'p5';
import type { Algorithm } from './types';

interface Site { x: number; y: number; vx: number; vy: number; color: number[]; }

let sites: Site[] = [];
let w = 0, h = 0;
const SITE_COUNT = 40;
const JEWELS = [
  [16, 185, 129], [220, 38, 38], [59, 130, 246],
  [168, 85, 247], [245, 158, 11], [236, 72, 153],
];

export const tessera: Algorithm = {
  name: 'Tessera',
  description: 'Voronoi tessellation — stained-glass cells that drift and recolor',
  palette: { background: '#0a0a0a', colors: ['#10b981', '#dc2626', '#3b82f6'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    p.randomSeed(seed); p.noiseSeed(seed);
    sites = [];
    for (let i = 0; i < SITE_COUNT; i++) {
      const jewel = JEWELS[Math.floor(p.random(JEWELS.length))];
      sites.push({ x: p.random(w), y: p.random(h), vx: p.random(-0.3, 0.3), vy: p.random(-0.3, 0.3), color: jewel });
    }
    p.background(10, 10, 10);
    p.pixelDensity(1);
  },

  draw(p: p5) {
    p.loadPixels();
    const step = 2;
    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w; px += step) {
        let minDist = Infinity, secondDist = Infinity, closest = 0;
        for (let i = 0; i < sites.length; i++) {
          const dist = (px - sites[i].x) ** 2 + (py - sites[i].y) ** 2;
          if (dist < minDist) { secondDist = minDist; minDist = dist; closest = i; }
          else if (dist < secondDist) { secondDist = dist; }
        }
        const edge = Math.sqrt(secondDist) - Math.sqrt(minDist);
        const [r, g, b] = sites[closest].color;

        for (let dy = 0; dy < step && py + dy < h; dy++) {
          for (let dx = 0; dx < step && px + dx < w; dx++) {
            const idx = 4 * ((py + dy) * w + (px + dx));
            if (edge < 2) { p.pixels[idx] = 30; p.pixels[idx+1] = 30; p.pixels[idx+2] = 30; }
            else {
              const bright = Math.min(1, edge / 20) * 0.6 + 0.4;
              p.pixels[idx] = r * bright; p.pixels[idx+1] = g * bright; p.pixels[idx+2] = b * bright;
            }
            p.pixels[idx+3] = 255;
          }
        }
      }
    }
    p.updatePixels();

    for (const site of sites) {
      site.x += site.vx; site.y += site.vy;
      if (site.x < 0 || site.x > w) site.vx *= -1;
      if (site.y < 0 || site.y > h) site.vy *= -1;
      site.x = Math.max(0, Math.min(w, site.x));
      site.y = Math.max(0, Math.min(h, site.y));
    }
  },

  resize(p: p5, width: number, height: number) { w = width; h = height; },
};
