import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

// Isometric projection helpers
function isoX(gx: number, gz: number, cs: number): number {
  return (gx - gz) * cs;
}
function isoY(gx: number, gy: number, gz: number, cs: number): number {
  return (gx + gz) * cs * 0.5 - gy;
}

function heightColor(p: p5, t: number): [number, number, number] {
  if (t > 0.82) return [250, 250, 255];         // snow
  if (t > 0.65) return [160, 148, 130];          // rock
  if (t > 0.42) return [86, 120, 60];            // forest
  if (t > 0.28) return [105, 145, 70];           // grass
  if (t > 0.18) return [195, 180, 130];          // sand
  return [65, 100, 155];                          // water
}

export const terrain: Algorithm = {
  name: 'Terrain',
  description: 'Isometric heightmap — noise-generated landscape in layered slices',
  palette: { background: '#87ceeb', colors: ['#567838', '#a09482', '#fafaff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    const gridSize = 48;
    const cs = Math.floor(Math.min(w, h) / gridSize) + 2;
    const maxH = cs * 12;
    const noiseScale = p.random(0.04, 0.09);
    const noiseOff = p.random(200);

    // Sky
    p.background(135, 206, 235);

    // Build height grid
    const heights: number[][] = [];
    for (let z = 0; z < gridSize; z++) {
      heights[z] = [];
      for (let x = 0; x < gridSize; x++) {
        const n = p.noise(x * noiseScale + noiseOff, z * noiseScale + noiseOff);
        heights[z][x] = n;
      }
    }

    // Render back-to-front
    const cx = w / 2;
    const cy = h * 0.25;

    for (let z = gridSize - 1; z >= 0; z--) {
      for (let x = gridSize - 1; x >= 0; x--) {
        const t = heights[z][x];
        const gy = t * maxH;
        const [r, g, b] = heightColor(p, t);

        const px0 = cx + isoX(x, z, cs);
        const py0 = cy + isoY(x, gy, z, cs);
        const px1 = cx + isoX(x + 1, z, cs);
        const py1 = cy + isoY(x + 1, gy, z, cs);
        const px2 = cx + isoX(x + 1, z + 1, cs);
        const py2 = cy + isoY(x + 1, gy, z + 1, cs);
        const px3 = cx + isoX(x, z + 1, cs);
        const py3 = cy + isoY(x, gy, z + 1, cs);

        // Top face
        p.noStroke();
        p.fill(r, g, b);
        p.beginShape();
        p.vertex(px0, py0); p.vertex(px1, py1);
        p.vertex(px2, py2); p.vertex(px3, py3);
        p.endShape(p.CLOSE);

        // Left face (darker)
        const groundL = cy + isoY(x, 0, z + 1, cs);
        p.fill(r * 0.6, g * 0.6, b * 0.6);
        p.beginShape();
        p.vertex(px3, py3); p.vertex(px2, py2);
        p.vertex(cx + isoX(x + 1, z + 1, cs), groundL + (cy + isoY(x + 1, 0, z + 1, cs) - groundL));
        p.vertex(cx + isoX(x, z + 1, cs), groundL);
        p.endShape(p.CLOSE);

        // Edge line
        p.stroke(r * 0.4, g * 0.4, b * 0.4, 60);
        p.strokeWeight(0.5);
        p.noFill();
        p.beginShape();
        p.vertex(px0, py0); p.vertex(px1, py1);
        p.vertex(px2, py2); p.vertex(px3, py3);
        p.endShape(p.CLOSE);
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    terrain.setup(p, currentSeed, width, height);
  },
};
