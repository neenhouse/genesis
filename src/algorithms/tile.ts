import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

// Draw a single star-and-cross Islamic tile cell centered at (cx, cy) with size s
function drawTileCell(p: p5, cx: number, cy: number, s: number) {
  const r = s / 2;
  const points = 8;
  const outerR = r * 0.96;
  const innerR = r * 0.44;

  // Background cross/square in gold
  p.fill(212, 160, 40, 200);
  p.noStroke();
  p.beginShape();
  for (let i = 0; i < points; i++) {
    const outerAngle = (i / points) * Math.PI * 2 - Math.PI / 8;
    const innerAngle = outerAngle + Math.PI / points;
    p.vertex(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR);
    p.vertex(cx + Math.cos(innerAngle) * innerR, cy + Math.sin(innerAngle) * innerR);
  }
  p.endShape(p.CLOSE);

  // Inner 8-pointed star in turquoise
  const starOuter = r * 0.60;
  const starInner = r * 0.26;
  p.fill(32, 178, 170, 230);
  p.beginShape();
  for (let i = 0; i < points; i++) {
    const outerAngle = (i / points) * Math.PI * 2 - Math.PI / 8;
    const innerAngle = outerAngle + Math.PI / points;
    p.vertex(cx + Math.cos(outerAngle) * starOuter, cy + Math.sin(outerAngle) * starOuter);
    p.vertex(cx + Math.cos(innerAngle) * starInner, cy + Math.sin(innerAngle) * starInner);
  }
  p.endShape(p.CLOSE);

  // Center dot white
  p.fill(240, 240, 235, 200);
  p.ellipse(cx, cy, r * 0.22, r * 0.22);

  // Outline lines
  p.stroke(240, 240, 235, 100);
  p.strokeWeight(0.8);
  p.noFill();
  p.beginShape();
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 8;
    p.vertex(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
  }
  p.endShape(p.CLOSE);
}

export const tile: Algorithm = {
  name: 'Tile',
  description: 'Islamic geometric tile pattern — star-and-cross motif with precise mathematical construction',
  palette: { background: '#0a1a3a', colors: ['#20b2aa', '#d4a028', '#f0f0eb'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    const CELL = 80;
    const cols = Math.ceil(w / CELL) + 1;
    const rows = Math.ceil(h / CELL) + 1;

    p.background(10, 26, 58);

    // Subtle grid lines
    p.stroke(20, 60, 100, 80);
    p.strokeWeight(0.5);
    for (let col = 0; col <= cols; col++) {
      p.line(col * CELL, 0, col * CELL, h);
    }
    for (let row = 0; row <= rows; row++) {
      p.line(0, row * CELL, w, row * CELL);
    }

    // Draw tiles in a grid
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const cx = col * CELL + CELL / 2;
        const cy = row * CELL + CELL / 2;
        drawTileCell(p, cx, cy, CELL * 0.92);
      }
    }

    // Connecting cross-fill diamonds at intersections
    p.fill(180, 120, 30, 160);
    p.noStroke();
    for (let col = 0; col <= cols; col++) {
      for (let row = 0; row <= rows; row++) {
        const ix = col * CELL;
        const iy = row * CELL;
        const d = CELL * 0.18;
        p.beginShape();
        p.vertex(ix, iy - d);
        p.vertex(ix + d, iy);
        p.vertex(ix, iy + d);
        p.vertex(ix - d, iy);
        p.endShape(p.CLOSE);
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {
    // static
  },

  resize(p: p5, width: number, height: number) {
    tile.setup(p, currentSeed, width, height);
    p.loop();
  },
};
