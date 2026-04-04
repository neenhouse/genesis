import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const origami: Algorithm = {
  name: 'Origami',
  description: 'Flat-folded crease pattern — triangulated grid with mountain/valley fold coloring',
  palette: { background: '#f8f6f0', colors: ['#ffffff', '#e8e4d8', '#c8c4b4', '#a8a498'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    p.background(248, 246, 240);

    const cols = 10 + Math.floor(p.random(8));
    const rows = Math.floor(cols * (h / w));
    const cellW = w / cols;
    const cellH = h / rows;
    const noiseScale = p.random(0.08, 0.18);

    // Build vertex grid with slight noise displacement
    const pts: Array<Array<{ x: number; y: number }>> = [];
    for (let row = 0; row <= rows; row++) {
      pts.push([]);
      for (let col = 0; col <= cols; col++) {
        const nx = p.noise(col * noiseScale, row * noiseScale) - 0.5;
        const ny = p.noise(col * noiseScale + 100, row * noiseScale + 100) - 0.5;
        const jitter = Math.min(cellW, cellH) * 0.28;
        // Edge vertices stay on boundary
        const onEdge = col === 0 || col === cols || row === 0 || row === rows;
        pts[row].push({
          x: col * cellW + (onEdge ? 0 : nx * jitter),
          y: row * cellH + (onEdge ? 0 : ny * jitter),
        });
      }
    }

    // Draw triangulated cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tl = pts[row][col];
        const tr = pts[row][col + 1];
        const bl = pts[row + 1][col];
        const br = pts[row + 1][col + 1];

        // Each cell splits into 2 triangles; noise decides diagonal direction
        const diag = p.noise(col * noiseScale + 50, row * noiseScale + 50) > 0.5;

        // Fold type: mountain (light) or valley (shadow)
        const fold1 = p.noise(col * 0.3 + seed * 0.001, row * 0.3) > 0.5;
        const fold2 = p.noise(col * 0.3 + 20, row * 0.3 + 20 + seed * 0.001) > 0.5;

        const shadow = 30;
        const base = 245;

        p.strokeWeight(0.5);
        p.stroke(160, 156, 140, 120);

        if (diag) {
          // TL-BR diagonal
          p.fill(base - (fold1 ? shadow : 0), base - (fold1 ? shadow * 0.8 : 0), base - (fold1 ? shadow * 0.5 : 0));
          p.triangle(tl.x, tl.y, tr.x, tr.y, br.x, br.y);
          p.fill(base - (fold2 ? shadow : 0), base - (fold2 ? shadow * 0.8 : 0), base - (fold2 ? shadow * 0.5 : 0));
          p.triangle(tl.x, tl.y, bl.x, bl.y, br.x, br.y);
        } else {
          // TR-BL diagonal
          p.fill(base - (fold1 ? shadow : 0), base - (fold1 ? shadow * 0.8 : 0), base - (fold1 ? shadow * 0.5 : 0));
          p.triangle(tl.x, tl.y, tr.x, tr.y, bl.x, bl.y);
          p.fill(base - (fold2 ? shadow : 0), base - (fold2 ? shadow * 0.8 : 0), base - (fold2 ? shadow * 0.5 : 0));
          p.triangle(tr.x, tr.y, br.x, br.y, bl.x, bl.y);
        }
      }
    }

    // Crease lines overlay
    p.stroke(140, 136, 124, 80);
    p.strokeWeight(0.4);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tl = pts[row][col];
        const tr = pts[row][col + 1];
        const bl = pts[row + 1][col];
        const br = pts[row + 1][col + 1];
        const diag = p.noise(col * noiseScale + 50, row * noiseScale + 50) > 0.5;
        if (diag) { p.line(tl.x, tl.y, br.x, br.y); }
        else { p.line(tr.x, tr.y, bl.x, bl.y); }
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {
    // Static
  },

  resize(p: p5, width: number, height: number) {
    origami.setup(p, currentSeed, width, height);
    p.loop();
  },
};
