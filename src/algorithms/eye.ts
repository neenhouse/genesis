import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const PALETTE_IRIS = [
  [[180, 100, 30], [220, 160, 40], [200, 130, 20]],   // amber
  [[40, 120, 60],  [70, 180, 90],  [30, 100, 50]],    // green
  [[30, 80, 180],  [60, 130, 220], [20, 60, 160]],    // blue
];

export const eye: Algorithm = {
  name: 'Eye',
  description: 'Generative iris — radial fibers, color bands, crypts, and furrows',
  palette: { background: '#ffffff', colors: ['#b4641e', '#4ade80', '#3b82f6'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(255);

    const cx = w / 2;
    const cy = h / 2;
    const eyeR = Math.min(w, h) * 0.44;
    const irisR = eyeR * 0.72;
    const pupilR = irisR * (0.28 + p.random(0.12));
    const paletteIdx = Math.floor(p.random(3));
    const [darkC, midC, lightC] = PALETTE_IRIS[paletteIdx];

    // Sclera
    p.noStroke();
    p.fill(252, 250, 245);
    p.ellipse(cx, cy, eyeR * 2, eyeR * 1.45);

    // Clip mask via drawing order — iris base
    p.fill(darkC[0], darkC[1], darkC[2]);
    p.circle(cx, cy, irisR * 2);

    // Color bands
    const bandCount = 4 + Math.floor(p.random(4));
    for (let b = 0; b < bandCount; b++) {
      const t = b / bandCount;
      const r = irisR * (0.35 + t * 0.6);
      const alpha = 40 + Math.floor(p.random(60));
      const c = b % 2 === 0 ? midC : lightC;
      p.noFill();
      p.stroke(c[0], c[1], c[2], alpha);
      p.strokeWeight(irisR * 0.04);
      p.circle(cx, cy, r * 2);
    }

    // Radial fibers
    const fibers = 120 + Math.floor(p.random(80));
    p.strokeWeight(0.7);
    for (let i = 0; i < fibers; i++) {
      const angle = (i / fibers) * p.TWO_PI + p.noise(i * 0.3) * 0.3;
      const noise = p.noise(i * 0.1, 42) * 0.5 + 0.5;
      const innerR = pupilR + (irisR - pupilR) * 0.05;
      const outerR = pupilR + (irisR - pupilR) * (0.6 + noise * 0.4);
      const c = noise > 0.6 ? lightC : midC;
      p.stroke(c[0], c[1], c[2], 60 + noise * 80);
      const cos = Math.cos(angle), sin = Math.sin(angle);
      p.line(cx + cos * innerR, cy + sin * innerR, cx + cos * outerR, cy + sin * outerR);
    }

    // Crypts (dark spots)
    const crypts = 8 + Math.floor(p.random(12));
    p.noStroke();
    for (let i = 0; i < crypts; i++) {
      const angle = p.random(p.TWO_PI);
      const r = pupilR + (irisR - pupilR) * p.random(0.2, 0.75);
      const cx2 = cx + Math.cos(angle) * r;
      const cy2 = cy + Math.sin(angle) * r;
      const cr = irisR * p.random(0.03, 0.07);
      p.fill(darkC[0] * 0.5, darkC[1] * 0.5, darkC[2] * 0.5, 140);
      p.ellipse(cx2, cy2, cr * 2, cr * 1.4);
    }

    // Limbal ring
    p.noFill();
    p.stroke(30, 25, 20, 180);
    p.strokeWeight(irisR * 0.06);
    p.circle(cx, cy, irisR * 2);

    // Pupil
    p.noStroke();
    p.fill(12, 10, 12);
    p.circle(cx, cy, pupilR * 2);
    // Pupil specular
    p.fill(255, 255, 255, 200);
    p.ellipse(cx + pupilR * 0.3, cy - pupilR * 0.35, pupilR * 0.28, pupilR * 0.2);
    p.fill(255, 255, 255, 80);
    p.ellipse(cx - pupilR * 0.25, cy + pupilR * 0.3, pupilR * 0.15, pupilR * 0.12);

    // Eyelid vignette mask
    p.noStroke();
    p.fill(255);
    p.beginShape();
    p.vertex(0, 0); p.vertex(w, 0); p.vertex(w, h); p.vertex(0, h);
    // Cut eye-shaped hole via overdraw on background color
    p.endShape();
    // Top eyelid shadow
    for (let i = 0; i < 5; i++) {
      const t = i / 5;
      p.fill(200, 190, 185, 30);
      p.ellipse(cx, cy - eyeR * 0.1, eyeR * 2.1, eyeR * 1.55 - t * 10);
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    eye.setup(p, currentSeed, width, height);
  },
};
