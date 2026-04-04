import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const ripple: Algorithm = {
  name: 'Ripple',
  description: 'Concentric circle packing — nested rings with organic displacement',
  palette: { background: '#1c1714', colors: ['#f5e6d0', '#a08060', '#3d2b1f'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(28, 23, 20);

    const centerCount = 8 + Math.floor(p.random(8));

    for (let c = 0; c < centerCount; c++) {
      const cx = p.random(w * 0.1, w * 0.9);
      const cy = p.random(h * 0.1, h * 0.9);
      const maxR = p.random(60, Math.min(w, h) * 0.25);
      const ringSpacing = p.random(4, 10);
      const ringCount = Math.floor(maxR / ringSpacing);

      for (let r = 0; r < ringCount; r++) {
        const radius = (r + 1) * ringSpacing;
        const brightness = p.map(r, 0, ringCount, 245, 60);
        const alpha = p.map(r, 0, ringCount, 180, 40);

        p.noFill();
        p.stroke(brightness, brightness * 0.85, brightness * 0.7, alpha);
        p.strokeWeight(1 + p.noise(c, r * 0.1) * 1.5);

        // Draw circle with noise displacement
        p.beginShape();
        const steps = 80;
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * p.TWO_PI;
          const noiseVal = p.noise(
            cx * 0.005 + Math.cos(angle) * 0.5,
            cy * 0.005 + Math.sin(angle) * 0.5,
            r * 0.1 + seed * 0.01
          );
          const displacement = (noiseVal - 0.5) * radius * 0.3;
          const x = cx + Math.cos(angle) * (radius + displacement);
          const y = cy + Math.sin(angle) * (radius + displacement);
          p.curveVertex(x, y);
        }
        p.endShape(p.CLOSE);
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    ripple.setup(p, currentSeed, width, height);
    p.loop();
  },
};
