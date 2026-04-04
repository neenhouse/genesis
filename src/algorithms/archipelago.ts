import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let done = false;
let py = 0;
const STEP = 2;

// Height thresholds
const T_OCEAN_DEEP = 0.38;
const T_OCEAN_SHALLOW = 0.46;
const T_BEACH = 0.50;
const T_LOWLAND = 0.60;
const T_HIGHLAND = 0.73;
const T_MOUNTAIN = 0.86;

function heightToColor(t: number): [number, number, number] {
  if (t < T_OCEAN_DEEP)    return [18, 58, 120];
  if (t < T_OCEAN_SHALLOW) { const s = (t - T_OCEAN_DEEP) / (T_OCEAN_SHALLOW - T_OCEAN_DEEP); return [Math.round(18 + s * 26), Math.round(58 + s * 50), Math.round(120 + s * 55)]; }
  if (t < T_BEACH)         { const s = (t - T_OCEAN_SHALLOW) / (T_BEACH - T_OCEAN_SHALLOW); return [Math.round(44 + s * 190), Math.round(108 + s * 115), Math.round(175 - s * 90)]; }
  if (t < T_LOWLAND)       { const s = (t - T_BEACH) / (T_LOWLAND - T_BEACH); return [Math.round(80 - s * 20), Math.round(160 - s * 15), Math.round(60 - s * 10)]; }
  if (t < T_HIGHLAND)      { const s = (t - T_LOWLAND) / (T_HIGHLAND - T_LOWLAND); return [Math.round(60 - s * 30), Math.round(145 - s * 40), Math.round(50 + s * 20)]; }
  if (t < T_MOUNTAIN)      { const s = (t - T_HIGHLAND) / (T_MOUNTAIN - T_HIGHLAND); return [Math.round(90 + s * 100), Math.round(80 + s * 90), Math.round(70 + s * 80)]; }
  return [230, 235, 240];
}

export const archipelago: Algorithm = {
  name: 'Archipelago',
  description: 'Noise-based island chain from above — ocean, beach, land, and peaks',
  palette: { background: '#12387a', colors: ['#3b82c4', '#d4b896', '#4a9650', '#e8edf0'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    done = false; py = 0;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(18, 56, 120);
    p.noStroke();
    p.pixelDensity(1);
  },

  draw(p: p5) {
    if (done) { p.noLoop(); return; }

    const rowsPerFrame = 10;
    const offsetX = p.random(1000);
    const offsetY = p.random(1000);

    for (let row = 0; row < rowsPerFrame && py < h; row++, py += STEP) {
      for (let x = 0; x < w; x += STEP) {
        const nx = x / w;
        const ny = py / h;

        // Multi-octave noise for terrain
        let t = 0;
        t += p.noise(nx * 3 + offsetX, ny * 3 + offsetY) * 0.5;
        t += p.noise(nx * 6 + offsetX, ny * 6 + offsetY) * 0.25;
        t += p.noise(nx * 12 + offsetX, ny * 12 + offsetY) * 0.125;
        t += p.noise(nx * 24 + offsetX, ny * 24 + offsetY) * 0.0625;
        t /= 0.9375;

        // Distance from center falloff to create finite islands
        const dx = (nx - 0.5) * 2;
        const dy = (ny - 0.5) * 2;
        const falloff = 1 - Math.sqrt(dx * dx * 0.7 + dy * dy * 0.7);
        t = t * 0.6 + falloff * 0.4;

        const [r, g, b] = heightToColor(t);
        p.fill(r, g, b);
        p.rect(x, py, STEP, STEP);
      }
    }

    if (py >= h) done = true;
  },

  resize(p: p5, width: number, height: number) {
    archipelago.setup(p, currentSeed, width, height);
    p.loop();
  },
};
