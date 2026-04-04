import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

// Dune sand colors
const SAND_COLORS = [
  [235, 215, 155],
  [220, 195, 120],
  [200, 170, 90],
  [185, 150, 70],
  [165, 130, 55],
];
const SHADOW_COLOR = [90, 70, 110];
const SKY_TOP = [145, 195, 235];
const SKY_HORIZON = [225, 200, 170];

export const dunes: Algorithm = {
  name: 'Dunes',
  description: 'Layered sine-wave dune landscape with sand highlights and purple shadows on gradient sky',
  palette: { background: '#91c3eb', colors: ['#ebdba0', '#c8a850', '#5a4680'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.noLoop();

    // Sky gradient
    for (let y = 0; y < h * 0.55; y++) {
      const t = y / (h * 0.55);
      const r = p.lerp(SKY_TOP[0], SKY_HORIZON[0], t);
      const g = p.lerp(SKY_TOP[1], SKY_HORIZON[1], t);
      const b = p.lerp(SKY_TOP[2], SKY_HORIZON[2], t);
      p.stroke(r, g, b);
      p.strokeWeight(1.5);
      p.line(0, y, w, y);
    }

    const layerCount = SAND_COLORS.length;

    for (let li = layerCount - 1; li >= 0; li--) {
      const t = li / (layerCount - 1);
      const baseY = h * (0.42 + t * 0.45);
      const [sr, sg, sb] = SAND_COLORS[li];

      // Generate dune profile: sum of sine waves with noise offsets
      const xStep = 2;
      const points: { x: number; y: number }[] = [];

      for (let x = 0; x <= w; x += xStep) {
        const nx = x / w;
        // Multiple sine frequencies for natural shape
        const amp1 = h * (0.09 + p.noise(li * 5, 0) * 0.08);
        const amp2 = h * (0.04 + p.noise(li * 5, 1) * 0.04);
        const freq1 = 1.2 + p.noise(li * 5, 2) * 1.8;
        const freq2 = 2.5 + p.noise(li * 5, 3) * 3;
        const phase1 = p.noise(li * 5, 4) * p.TWO_PI;
        const phase2 = p.noise(li * 5, 5) * p.TWO_PI;
        const noiseShift = (p.noise(nx * 2.5, li * 0.8) - 0.5) * h * 0.04;

        const y = baseY
          + Math.sin(nx * p.TWO_PI * freq1 + phase1) * amp1
          + Math.sin(nx * p.TWO_PI * freq2 + phase2) * amp2
          + noiseShift;
        points.push({ x, y });
      }

      // Fill dune body
      p.noStroke();
      p.fill(sr, sg, sb);
      p.beginShape();
      for (const pt of points) p.vertex(pt.x, pt.y);
      p.vertex(w, h); p.vertex(0, h);
      p.endShape(p.CLOSE);

      // Shadow band (the lee side of dune — below the crest)
      p.fill(SHADOW_COLOR[0], SHADOW_COLOR[1], SHADOW_COLOR[2], 55 + li * 15);
      p.beginShape();
      for (const pt of points) p.vertex(pt.x, pt.y + h * 0.025);
      p.vertex(w, h); p.vertex(0, h);
      p.endShape(p.CLOSE);

      // Highlight strip along crest
      p.stroke(Math.min(255, sr + 35), Math.min(255, sg + 30), Math.min(255, sb + 20), 180);
      p.strokeWeight(Math.max(1, h * 0.003));
      p.noFill();
      p.beginShape();
      for (const pt of points) p.vertex(pt.x, pt.y);
      p.endShape();
    }
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    dunes.setup(p, currentSeed, width, height);
    p.noLoop();
  },
};
