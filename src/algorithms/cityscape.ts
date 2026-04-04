import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Building {
  x: number; bw: number; bh: number;
  windows: { wx: number; wy: number; lit: boolean }[];
}

const WINDOW_COLORS: [number, number, number][] = [
  [255, 230, 150],   // warm yellow
  [255, 200, 100],   // amber
  [220, 240, 255],   // cold blue-white
  [255, 245, 180],   // cream
];

export const cityscape: Algorithm = {
  name: 'Cityscape',
  description: 'Generative city skyline — random buildings with lit windows against a star-filled night sky',
  palette: { background: '#0b1327', colors: ['#ffd896', '#ffc864', '#ddf0ff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    const skylineBase = h * 0.65;
    const buildings: Building[] = [];

    // Generate buildings
    let bx = 0;
    while (bx < w + 20) {
      const bw = p.random(28, 70);
      const bh = p.random(h * 0.12, h * 0.55);
      const windows: { wx: number; wy: number; lit: boolean }[] = [];
      const winW = 6, winH = 8, gapX = 10, gapY = 12;
      for (let wc = gapX; wc < bw - winW - 4; wc += gapX) {
        for (let wr = gapY; wr < bh - winH - 4; wr += gapY) {
          windows.push({ wx: wc, wy: wr, lit: p.random() < 0.55 });
        }
      }
      buildings.push({ x: bx, bw, bh, windows });
      bx += bw + p.random(2, 6);
    }

    // Sky gradient
    for (let y = 0; y < skylineBase; y++) {
      const t = y / skylineBase;
      const r = p.lerp(6, 18, t);
      const g = p.lerp(10, 28, t);
      const bl = p.lerp(28, 55, t);
      p.stroke(r, g, bl);
      p.line(0, y, w, y);
    }

    // Stars
    p.noStroke();
    const starCount = Math.floor(w * skylineBase / 800);
    for (let i = 0; i < starCount; i++) {
      const sx = p.random(w);
      const sy = p.random(skylineBase * 0.9);
      const brightness = p.random(120, 255);
      const size = p.random() < 0.03 ? p.random(1.5, 2.5) : p.random(0.5, 1.5);
      p.fill(brightness, brightness, p.random(brightness * 0.9, brightness));
      p.ellipse(sx, sy, size, size);
    }

    // Ground
    p.noStroke();
    p.fill(10, 15, 30);
    p.rect(0, skylineBase, w, h - skylineBase);

    // Draw buildings (back to front by height)
    buildings.sort((a, b) => a.bh - b.bh);
    for (const bld of buildings) {
      const top = skylineBase - bld.bh;
      // Building body — dark silhouette with slight city glow at top
      p.noStroke();
      const grayVal = p.random(18, 35);
      p.fill(grayVal, grayVal + 4, grayVal + 10);
      p.rect(bld.x, top, bld.bw, bld.bh);

      // Rooftop detail
      p.fill(grayVal + 6, grayVal + 10, grayVal + 18);
      p.rect(bld.x + bld.bw * 0.3, top - 6, bld.bw * 0.12, 8);

      // Windows
      for (const win of bld.windows) {
        if (win.lit) {
          const col = WINDOW_COLORS[Math.floor(p.random(WINDOW_COLORS.length))];
          p.fill(col[0], col[1], col[2], p.random(160, 240));
          p.rect(bld.x + win.wx, top + win.wy, 6, 8);
          // Soft glow
          p.fill(col[0], col[1], col[2], 25);
          p.rect(bld.x + win.wx - 2, top + win.wy - 2, 10, 12);
        } else {
          p.fill(20, 24, 40, 200);
          p.rect(bld.x + win.wx, top + win.wy, 6, 8);
        }
      }
    }

    // Reflection in ground
    p.noStroke();
    for (const bld of buildings) {
      for (const win of bld.windows) {
        if (win.lit) {
          const col = WINDOW_COLORS[Math.floor(p.random(WINDOW_COLORS.length))];
          const wy = skylineBase - bld.bh + win.wy;
          const reflY = skylineBase + (skylineBase - wy) * 0.15;
          p.fill(col[0], col[1], col[2], 20);
          p.ellipse(bld.x + win.wx + 3, reflY, 8, 3);
        }
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {
    // static
  },

  resize(p: p5, width: number, height: number) {
    cityscape.setup(p, currentSeed, width, height);
    p.loop();
  },
};
