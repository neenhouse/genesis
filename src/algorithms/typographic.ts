import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const CHARS = ['A', 'B', 'E', 'F', 'H', 'I', 'K', 'M', 'N', 'O', 'R', 'S', 'T', 'W', 'X', '#', '@', '&', '%', '0', '8'];

export const typographic: Algorithm = {
  name: 'Typographic',
  description: 'Characters at noise-driven sizes form abstract light and dark patterns',
  palette: { background: '#f5f0ea', colors: ['#1a1614', '#4a3f38', '#8c7b72'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(245, 240, 234);

    const baseSize = Math.max(8, Math.min(w, h) * 0.028);
    const cols = Math.ceil(w / baseSize) + 1;
    const rows = Math.ceil(h / baseSize) + 1;
    const noiseScale = 0.06 + p.random(0.08);
    const charSet = CHARS.slice(0, 8 + Math.floor(p.random(13)));
    const offsetX = p.random(100);
    const offsetY = p.random(100);
    const useWeight = p.random() > 0.5;

    p.textAlign(p.CENTER, p.CENTER);
    p.noStroke();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const nx = col * noiseScale + offsetX;
        const ny = row * noiseScale + offsetY;

        const n1 = p.noise(nx, ny);
        const n2 = p.noise(nx * 2.3 + 50, ny * 2.3 + 50);
        const combined = n1 * 0.65 + n2 * 0.35;

        const size = baseSize * (0.3 + combined * 1.4);
        const darkness = Math.pow(1 - combined, 1.4);
        const gray = Math.round(darkness * 180 + 10);
        const alpha = 80 + Math.round(darkness * 170);

        const charIdx = Math.floor(p.noise(nx + 200, ny + 200) * charSet.length);
        const ch = charSet[charIdx % charSet.length];

        const x = col * baseSize + (useWeight ? p.noise(nx + 300, ny + 300) - 0.5 : 0) * baseSize * 0.3;
        const y = row * baseSize + (useWeight ? p.noise(nx + 400, ny + 400) - 0.5 : 0) * baseSize * 0.3;

        p.fill(gray, gray - 5, gray - 8, alpha);
        p.textSize(size);
        p.text(ch, x, y);
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    typographic.setup(p, currentSeed, width, height);
  },
};
