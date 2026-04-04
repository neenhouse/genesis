import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const SPECTRUM = [
  [255, 0, 0],
  [255, 80, 0],
  [255, 165, 0],
  [255, 240, 0],
  [0, 220, 0],
  [0, 120, 255],
  [80, 0, 200],
  [160, 0, 220],
];

export const prism: Algorithm = {
  name: 'Prism',
  description: 'White beam enters a prism and splits into rainbow spectrum bands via refraction',
  palette: { background: '#000000', colors: ['#ff0000', '#ffaa00', '#00dd00', '#0088ff', '#9900cc'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.noLoop();

    p.background(0);

    const cx = w * 0.38;
    const cy = h * 0.5;
    const triSize = Math.min(w, h) * 0.18;

    // Incoming white beam
    const beamY = cy;
    const beamStartX = 0;
    const beamEndX = cx - triSize * 0.9;
    p.strokeWeight(Math.max(2, Math.min(w, h) * 0.006));
    p.stroke(255, 255, 255, 200);
    p.line(beamStartX, beamY, beamEndX, beamY);

    // Soft glow on beam
    for (let g = 3; g > 0; g--) {
      p.stroke(255, 255, 255, 30 / g);
      p.strokeWeight((Math.min(w, h) * 0.006) * (g + 1));
      p.line(beamStartX, beamY, beamEndX, beamY);
    }

    // Prism triangle
    p.fill(30, 60, 80, 200);
    p.stroke(120, 200, 255, 180);
    p.strokeWeight(1.5);
    p.beginShape();
    p.vertex(cx, cy - triSize);
    p.vertex(cx - triSize, cy + triSize * 0.5);
    p.vertex(cx + triSize, cy + triSize * 0.5);
    p.endShape(p.CLOSE);

    // Dispersed spectrum bands emanating from prism's right face
    const exitX = cx + triSize * 0.9;
    const exitY = cy + triSize * 0.1;
    const bandCount = SPECTRUM.length;
    const spreadAngle = 0.55; // total angular spread in radians

    for (let i = 0; i < bandCount; i++) {
      const t = i / (bandCount - 1);
      const angle = -spreadAngle / 2 + t * spreadAngle;
      const [r, g, b] = SPECTRUM[i];

      // Each band is drawn as a fanning shape
      const bandLen = w * (0.55 + t * 0.05);
      const thickness = (Math.min(w, h) * 0.018) + 4;

      const ex = exitX + Math.cos(angle) * bandLen;
      const ey = exitY + Math.sin(angle) * bandLen;

      // Glow layers
      for (let gl = 3; gl > 0; gl--) {
        p.stroke(r, g, b, 18 * gl);
        p.strokeWeight(thickness * gl * 0.7);
        p.line(exitX, exitY, ex, ey);
      }

      // Core bright line
      p.stroke(r, g, b, 200);
      p.strokeWeight(Math.max(1.5, thickness * 0.35));
      p.line(exitX, exitY, ex, ey);
    }

    // Internal refraction glint inside prism
    p.noStroke();
    for (let i = 0; i < bandCount; i++) {
      const t = i / (bandCount - 1);
      const [r, g, b] = SPECTRUM[i];
      const ix = cx - triSize * 0.15 + t * triSize * 0.3;
      const iy = cy - triSize * 0.05 + t * triSize * 0.2;
      p.fill(r, g, b, 60);
      p.ellipse(ix, iy, triSize * 0.12, triSize * 0.04);
    }
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    prism.setup(p, currentSeed, width, height);
    p.noLoop();
  },
};
