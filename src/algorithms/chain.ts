import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const chain: Algorithm = {
  name: 'Chain',
  description: 'Chain mail — interlocking rings with shading that gives a 3D appearance',
  palette: { background: '#1a1c22', colors: ['#c8cdd8', '#8a9ab0', '#e4e8f0'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(26, 28, 34);

    const ringR = Math.max(10, Math.min(w, h) * 0.038);
    const ringStroke = ringR * 0.32;
    const colSpacing = ringR * 1.6;
    const rowSpacing = ringR * 1.0;

    const cols = Math.ceil(w / colSpacing) + 2;
    const rows = Math.ceil(h / rowSpacing) + 2;
    const offX = ((w - (cols - 1) * colSpacing) / 2);
    const offY = ((h - (rows - 1) * rowSpacing) / 2);

    // Draw horizontal rings first (behind), then vertical (in front)
    for (let pass = 0; pass < 2; pass++) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const isHorizontal = (col + row) % 2 === 0;
          if (pass === 0 && !isHorizontal) continue;
          if (pass === 1 && isHorizontal) continue;

          const cx = offX + col * colSpacing + (row % 2 === 1 ? colSpacing * 0.5 : 0);
          const cy = offY + row * rowSpacing;

          // Light direction: top-left
          const lightAngle = -p.QUARTER_PI;
          const lightX = Math.cos(lightAngle);
          const lightY = Math.sin(lightAngle);

          p.noFill();
          // Shadow pass
          p.stroke(15, 17, 22, 200);
          p.strokeWeight(ringStroke + 2);
          if (isHorizontal) {
            p.ellipse(cx + 1.5, cy + 1.5, ringR * 2.2, ringR * 1.0);
          } else {
            p.ellipse(cx + 1.5, cy + 1.5, ringR * 1.0, ringR * 2.2);
          }

          // Main ring with gradient-like effect via arc segments
          const segments = 32;
          for (let i = 0; i < segments; i++) {
            const a1 = (i / segments) * p.TWO_PI;
            const a2 = ((i + 1) / segments) * p.TWO_PI;
            const midA = (a1 + a2) * 0.5;
            const nx = Math.cos(midA);
            const ny = Math.sin(midA);
            const dot = nx * lightX + ny * lightY;
            const brightness = 140 + dot * 95;
            p.stroke(brightness, brightness + 8, brightness + 18);
            p.strokeWeight(ringStroke);

            if (isHorizontal) {
              p.arc(cx, cy, ringR * 2.2, ringR * 1.0, a1, a2);
            } else {
              p.arc(cx, cy, ringR * 1.0, ringR * 2.2, a1, a2);
            }
          }

          // Inner highlight
          p.stroke(220, 228, 240, 60);
          p.strokeWeight(ringStroke * 0.3);
          if (isHorizontal) {
            p.arc(cx, cy, ringR * 1.6, ringR * 0.55, p.PI + 0.4, p.TWO_PI - 0.4);
          } else {
            p.arc(cx, cy, ringR * 0.55, ringR * 1.6, p.PI + 0.4, p.TWO_PI - 0.4);
          }
        }
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    chain.setup(p, currentSeed, width, height);
  },
};
