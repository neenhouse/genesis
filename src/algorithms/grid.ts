import type p5 from 'p5';
import type { Algorithm } from './types';

let currentSeed = 0;
let done = false;

const CELL = 28;

export const grid: Algorithm = {
  name: 'Grid',
  description: 'Op-art grid — shapes rotate and scale by distance from center for 3D bulge illusion',
  palette: {
    background: '#ffffff',
    colors: ['#000000', '#ffffff'],
  },

  setup(p: p5, seed: number, _width: number, _height: number) {
    currentSeed = seed;
    done = false;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(255);
    p.noLoop();
  },

  draw(p: p5) {
    if (done) return;
    const w = p.width, h = p.height;
    const cx = w / 2, cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    p.background(255);
    p.noStroke();

    const cols = Math.ceil(w / CELL) + 2;
    const rows = Math.ceil(h / CELL) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const x = col * CELL + CELL * 0.5;
        const y = row * CELL + CELL * 0.5;
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const t = dist / maxDist; // 0=center, 1=edge

        // bulge: shapes are large and rotated near center, small at edge
        const scale = p.map(Math.pow(1 - t, 1.8), 0, 1, 0.18, 0.88);
        const rotation = p.map(t, 0, 1, Math.PI * 0.25, 0);
        const size = CELL * scale;

        p.push();
        p.translate(x, y);
        p.rotate(rotation);

        // alternate fill per checkerboard
        const checker = (row + col) % 2 === 0;
        p.fill(checker ? 0 : 255);

        // shape: square but rounded at center, sharper at edge
        const cornerRadius = size * p.map(t, 0, 1, 0.45, 0.0);
        p.rect(-size * 0.5, -size * 0.5, size, size, cornerRadius);

        // inner contrast mark for depth
        if (t < 0.55) {
          p.fill(checker ? 255 : 0, 180);
          const inner = size * 0.28;
          p.rotate(Math.PI * 0.25);
          p.rect(-inner * 0.5, -inner * 0.5, inner, inner, inner * 0.3);
        }
        p.pop();
      }
    }
    done = true;
  },

  resize(p: p5, width: number, height: number) {
    grid.setup(p, currentSeed, width, height);
    p.loop();
  },
};
