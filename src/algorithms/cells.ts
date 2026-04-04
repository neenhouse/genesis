import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Cell {
  x: number; y: number;
  r: number;
  hue: number;
  nucleusR: number;
  nucleusOff: { x: number; y: number };
  organelles: { ox: number; oy: number; or: number }[];
  deform: number[];
}

export const cells: Algorithm = {
  name: 'Cells',
  description: 'Biological cell microscopy — packed irregular cells with membranes, nuclei, and organelles',
  palette: { background: '#f0e8f0', colors: ['#e0a0c0', '#c060a0', '#8040a0'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(240, 232, 240);

    const cellCount = 18 + Math.floor(p.random(14));
    const cells: Cell[] = [];
    const maxR = Math.min(w, h) * 0.12;

    // Place cells with simple separation
    for (let attempt = 0; attempt < cellCount * 12; attempt++) {
      const x = p.random(maxR, w - maxR);
      const y = p.random(maxR, h - maxR);
      const r = maxR * p.random(0.45, 1.0);
      let ok = true;
      for (const c of cells) {
        if (Math.hypot(x - c.x, y - c.y) < r + c.r + 2) { ok = false; break; }
      }
      if (ok) {
        const deform: number[] = [];
        const deformSteps = 16;
        for (let d = 0; d < deformSteps; d++) deform.push(p.random(0.82, 1.12));

        const orgCount = Math.floor(p.random(3, 8));
        const organelles: { ox: number; oy: number; or: number }[] = [];
        for (let o = 0; o < orgCount; o++) {
          const oa = p.random(p.TWO_PI);
          const od = r * p.random(0.1, 0.55);
          organelles.push({ ox: Math.cos(oa) * od, oy: Math.sin(oa) * od, or: r * p.random(0.06, 0.14) });
        }

        cells.push({
          x, y, r,
          hue: Math.floor(p.random(3)),
          nucleusR: r * p.random(0.28, 0.42),
          nucleusOff: { x: p.random(-r * 0.1, r * 0.1), y: p.random(-r * 0.1, r * 0.1) },
          deform,
          organelles,
        });
        if (cells.length >= cellCount) break;
      }
    }

    const palettes = [
      { body: [240, 180, 200], membrane: [180, 100, 140], nucleus: [140, 60, 120], organelle: [200, 130, 170] },
      { body: [220, 190, 230], membrane: [150, 80, 180], nucleus: [100, 40, 150], organelle: [180, 140, 200] },
      { body: [255, 200, 210], membrane: [200, 120, 140], nucleus: [160, 70, 100], organelle: [220, 160, 180] },
    ];

    for (const cell of cells) {
      const pal = palettes[cell.hue % palettes.length];
      const deformSteps = cell.deform.length;

      // Cell body
      p.fill(pal.body[0], pal.body[1], pal.body[2], 200);
      p.stroke(pal.membrane[0], pal.membrane[1], pal.membrane[2], 180);
      p.strokeWeight(1.5);
      p.beginShape();
      for (let d = 0; d < deformSteps; d++) {
        const angle = (d / deformSteps) * p.TWO_PI;
        const r2 = cell.r * cell.deform[d];
        p.curveVertex(cell.x + Math.cos(angle) * r2, cell.y + Math.sin(angle) * r2);
      }
      // Close with first 3 vertices
      for (let d = 0; d < 3; d++) {
        const angle = (d / deformSteps) * p.TWO_PI;
        const r2 = cell.r * cell.deform[d];
        p.curveVertex(cell.x + Math.cos(angle) * r2, cell.y + Math.sin(angle) * r2);
      }
      p.endShape(p.CLOSE);

      // Organelles
      p.noStroke();
      for (const org of cell.organelles) {
        p.fill(pal.organelle[0], pal.organelle[1], pal.organelle[2], 160);
        p.ellipse(cell.x + org.ox, cell.y + org.oy, org.or * 2, org.or * 1.4);
      }

      // Nucleus
      p.fill(pal.nucleus[0], pal.nucleus[1], pal.nucleus[2], 200);
      p.stroke(pal.nucleus[0] - 20, pal.nucleus[1] - 20, pal.nucleus[2] - 20, 160);
      p.strokeWeight(1);
      p.ellipse(cell.x + cell.nucleusOff.x, cell.y + cell.nucleusOff.y, cell.nucleusR * 2, cell.nucleusR * 1.7);

      // Nucleolus
      p.noStroke();
      p.fill(pal.nucleus[0] + 40, pal.nucleus[1] + 20, pal.nucleus[2] + 30, 220);
      p.ellipse(cell.x + cell.nucleusOff.x, cell.y + cell.nucleusOff.y, cell.nucleusR * 0.5, cell.nucleusR * 0.5);
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    cells.setup(p, currentSeed, width, height);
  },
};
