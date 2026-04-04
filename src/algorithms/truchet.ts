import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const truchet: Algorithm = {
  name: 'Truchet',
  description: 'Quarter-circle tiles — random arcs flowing into connected curves',
  palette: { background: '#006060', colors: ['#ffffff', '#00a0a0', '#e0f8f8'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    const cellSize = Math.max(20, Math.floor(Math.min(w, h) / 22));
    const cols = Math.ceil(w / cellSize) + 1;
    const rows = Math.ceil(h / cellSize) + 1;

    const teal = p.color(0, 96, 96);
    const bg2 = p.color(0, 72, 72);
    p.background(teal);

    p.noFill();
    p.strokeWeight(2.5);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellSize;
        const y = row * cellSize;
        const cs = cellSize;

        // Noise-driven tile bias for organic clustering
        const n = p.noise(col * 0.25, row * 0.25);
        const variant = n > 0.5 ? 0 : 1;

        // Background fill alternating subtle
        p.noStroke();
        p.fill(col % 2 === row % 2 ? teal : bg2);
        p.rect(x, y, cs, cs);

        p.noFill();

        // White arcs
        p.stroke(255, 255, 255, 200);
        p.strokeWeight(2.5);
        if (variant === 0) {
          // Arc bottom-left corner and top-right corner
          p.arc(x, y + cs, cs / 2, cs / 2, -p.HALF_PI, 0);
          p.arc(x + cs, y, cs / 2, cs / 2, p.PI, p.PI + p.HALF_PI);
        } else {
          // Arc top-left corner and bottom-right corner
          p.arc(x, y, cs / 2, cs / 2, 0, p.HALF_PI);
          p.arc(x + cs, y + cs, cs / 2, cs / 2, p.PI + p.HALF_PI, p.TWO_PI);
        }

        // Accent thin line overlay
        p.stroke(180, 240, 240, 60);
        p.strokeWeight(0.8);
        if (variant === 0) {
          p.arc(x, y + cs, cs * 0.7, cs * 0.7, -p.HALF_PI, 0);
          p.arc(x + cs, y, cs * 0.7, cs * 0.7, p.PI, p.PI + p.HALF_PI);
        } else {
          p.arc(x, y, cs * 0.7, cs * 0.7, 0, p.HALF_PI);
          p.arc(x + cs, y + cs, cs * 0.7, cs * 0.7, p.PI + p.HALF_PI, p.TWO_PI);
        }
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    truchet.setup(p, currentSeed, width, height);
  },
};
