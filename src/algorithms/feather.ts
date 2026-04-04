import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

function drawBarb(
  p: p5,
  rachisX: number, rachisY: number,
  angle: number, length: number,
  side: number, // -1 left, 1 right
  depth: number,
) {
  if (depth > 1 || length < 2) return;

  const endX = rachisX + Math.cos(angle + side * 0.35) * length;
  const endY = rachisY + Math.sin(angle + side * 0.35) * length;

  p.line(rachisX, rachisY, endX, endY);

  // Barbules
  if (depth === 0) {
    const barbuleLen = length * 0.35;
    const barbuleCount = Math.floor(length / 4);
    for (let i = 1; i <= barbuleCount; i++) {
      const t = i / (barbuleCount + 1);
      const bx = rachisX + (endX - rachisX) * t;
      const by = rachisY + (endY - rachisY) * t;
      drawBarb(p, bx, by, angle + side * 0.35, barbuleLen, side, 1);
    }
  }
}

export const feather: Algorithm = {
  name: 'Feather',
  description: 'Generative peacock feather — rachis with branching barbs and barbules',
  palette: { background: '#0a0f1a', colors: ['#00b4d8', '#48cae4', '#90e0ef', '#caf0f8', '#d4a017'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    p.background(10, 15, 26);

    const cx = w / 2;
    const baseY = h * 0.92;
    const tipY = h * 0.06;
    const rachisLen = baseY - tipY;
    const barbCount = 40 + Math.floor(p.random(20));
    const curlFactor = p.random(-0.004, 0.004);

    // Rachis
    p.strokeWeight(2.5);
    p.stroke(212, 160, 23, 220);
    p.noFill();
    p.beginShape();
    for (let i = 0; i <= rachisLen; i += 3) {
      const curl = curlFactor * i * i;
      p.vertex(cx + curl * w * 0.1, baseY - i);
    }
    p.endShape();

    // Barbs
    for (let i = 0; i < barbCount; i++) {
      const t = i / barbCount;
      const yi = baseY - t * rachisLen;
      const xi = cx + curlFactor * (t * rachisLen) * (t * rachisLen) * w * 0.1;
      const barbLen = p.map(t, 0, 1, w * 0.04, w * 0.18) * (1 - Math.pow(t - 0.5, 2) * 1.5);
      const upAngle = -Math.PI / 2;

      const nv = p.noise(i * 0.12, seed * 0.001);
      const wobble = (nv - 0.5) * 0.25;

      // Color gradient: gold at base → teal → blue toward tip
      const r = p.lerp(212, 0, t * 1.1);
      const g = p.lerp(160, 180, t);
      const b = p.lerp(23, 216, t * 1.2);

      p.stroke(r, g, b, 180);
      p.strokeWeight(0.8);

      for (const side of [-1, 1]) {
        drawBarb(p, xi, yi, upAngle + wobble, barbLen, side, 0);
      }
    }

    // Eye spot at tip
    const tipX = cx + curlFactor * rachisLen * rachisLen * w * 0.1;
    p.noStroke();
    p.fill(0, 60, 80, 200);
    p.ellipse(tipX, tipY + h * 0.03, w * 0.07, w * 0.09);
    p.fill(0, 180, 216, 180);
    p.ellipse(tipX, tipY + h * 0.03, w * 0.045, w * 0.055);
    p.fill(72, 202, 228, 220);
    p.ellipse(tipX, tipY + h * 0.03, w * 0.022, w * 0.028);
    p.fill(202, 240, 248, 240);
    p.ellipse(tipX, tipY + h * 0.03, w * 0.008, w * 0.01);

    p.noLoop();
  },

  draw(_p: p5) {
    // Static
  },

  resize(p: p5, width: number, height: number) {
    feather.setup(p, currentSeed, width, height);
    p.loop();
  },
};
