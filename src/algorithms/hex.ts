import type p5 from 'p5';
import type { Algorithm } from './types';

let currentSeed = 0;
let done = false;

const EARTH: [number, number, number][] = [
  [139, 90, 43],   // sienna
  [180, 120, 60],  // tan
  [80, 110, 60],   // olive green
  [60, 80, 100],   // steel blue
  [120, 60, 80],   // muted burgundy
  [100, 130, 80],  // sage
  [160, 100, 50],  // warm ochre
  [50, 70, 90],    // slate
];

function hexCorner(cx: number, cy: number, size: number, i: number): [number, number] {
  const angle = (Math.PI / 180) * (60 * i - 30);
  return [cx + size * Math.cos(angle), cy + size * Math.sin(angle)];
}

function drawHex(p: p5, cx: number, cy: number, size: number, col: [number, number, number], pattern: number) {
  p.push();
  p.translate(cx, cy);
  const [r, g, b] = col;

  p.fill(r, g, b);
  p.stroke(20, 20, 25);
  p.strokeWeight(1);
  p.beginShape();
  for (let i = 0; i < 6; i++) {
    const [hx, hy] = hexCorner(0, 0, size, i);
    p.vertex(hx, hy);
  }
  p.endShape(p.CLOSE);

  // inner decoration
  const iR = r * 0.6, iG = g * 0.6, iB = b * 0.6;
  if (pattern === 1) {
    // concentric hex
    p.noFill(); p.stroke(iR, iG, iB, 180); p.strokeWeight(1);
    for (let s = size * 0.65; s > size * 0.2; s -= size * 0.18) {
      p.beginShape();
      for (let i = 0; i < 6; i++) {
        const [hx, hy] = hexCorner(0, 0, s, i);
        p.vertex(hx, hy);
      }
      p.endShape(p.CLOSE);
    }
  } else if (pattern === 2) {
    // center dot
    p.noStroke();
    p.fill(iR, iG, iB, 200);
    p.ellipse(0, 0, size * 0.4, size * 0.4);
    p.fill(r * 1.3 > 255 ? 255 : r * 1.3, g * 1.3 > 255 ? 255 : g * 1.3, b * 1.3 > 255 ? 255 : b * 1.3, 160);
    p.ellipse(0, 0, size * 0.15, size * 0.15);
  }
  // pattern 0 = empty (just fill)
  p.pop();
}

export const hex: Algorithm = {
  name: 'Hex',
  description: 'Hexagonal grid with noise-driven earth-tone colors and inner patterns',
  palette: {
    background: '#141820',
    colors: ['#8b5a2b', '#b47832', '#50603c', '#3c4f64'],
  },

  setup(p: p5, seed: number, width: number, height: number) {
    currentSeed = seed;
    done = false;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(20, 24, 32);
    p.noLoop(); // static — draw everything in one shot in draw()
  },

  draw(p: p5) {
    if (done) return;
    const w = p.width, h = p.height;
    const size = Math.min(w, h) * 0.055;
    const colW = size * Math.sqrt(3);
    const rowH = size * 1.5;

    const cols = Math.ceil(w / colW) + 2;
    const rows = Math.ceil(h / rowH) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const cx = col * colW + (row % 2) * colW * 0.5;
        const cy = row * rowH;
        const nx = cx / w, ny = cy / h;
        const n = p.noise(nx * 3.5, ny * 3.5);
        const colorIdx = Math.floor(n * EARTH.length);
        const col2 = EARTH[colorIdx % EARTH.length];
        const patternN = p.noise(nx * 5, ny * 5 + 10);
        const pattern = patternN < 0.35 ? 0 : patternN < 0.7 ? 1 : 2;
        drawHex(p, cx, cy, size * 0.92, col2, pattern);
      }
    }
    done = true;
  },

  resize(p: p5, width: number, height: number) {
    hex.setup(p, currentSeed, width, height);
    p.loop();
  },
};
