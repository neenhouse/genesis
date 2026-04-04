import type p5 from 'p5';
import type { Algorithm } from './types';

let currentSeed = 0;

interface Tube {
  pts: { x: number; y: number }[];
  col: [number, number, number];
}

let tubes: Tube[] = [];

const NEON_COLORS: [number, number, number][] = [
  [255, 20, 147],   // hot pink
  [0, 255, 255],    // cyan
  [255, 0, 200],    // magenta
  [50, 200, 255],   // electric blue
  [180, 255, 50],   // neon yellow-green
];

function buildTubes(p: p5, w: number, h: number) {
  tubes = [];
  const count = 5 + Math.floor(p.random(4));
  for (let i = 0; i < count; i++) {
    const pts: { x: number; y: number }[] = [];
    let x = p.random(w * 0.1, w * 0.9);
    let y = p.random(h * 0.1, h * 0.9);
    const steps = 4 + Math.floor(p.random(5));
    pts.push({ x, y });
    for (let s = 0; s < steps; s++) {
      x += p.random(-w * 0.22, w * 0.22);
      y += p.random(-h * 0.22, h * 0.22);
      x = p.constrain(x, w * 0.05, w * 0.95);
      y = p.constrain(y, h * 0.05, h * 0.95);
      pts.push({ x, y });
    }
    const col = NEON_COLORS[Math.floor(p.random(NEON_COLORS.length))];
    tubes.push({ pts, col });
  }
}

function drawTube(p: p5, tube: Tube) {
  const passes = [
    { weight: 22, alpha: 30 },
    { weight: 14, alpha: 50 },
    { weight: 8, alpha: 100 },
    { weight: 4, alpha: 180 },
    { weight: 1.5, alpha: 255 },
  ];
  const [r, g, b] = tube.col;
  for (const pass of passes) {
    p.stroke(r, g, b, pass.alpha);
    p.strokeWeight(pass.weight);
    p.noFill();
    p.beginShape();
    for (const pt of tube.pts) p.curveVertex(pt.x, pt.y);
    p.endShape();
  }
  // bright core
  p.stroke(255, 255, 255, 200);
  p.strokeWeight(0.8);
  p.beginShape();
  for (const pt of tube.pts) p.curveVertex(pt.x, pt.y);
  p.endShape();
}

export const neon: Algorithm = {
  name: 'Neon',
  description: 'Neon tube signs with multi-pass glow on dark brick',
  palette: {
    background: '#0d0810',
    colors: ['#ff1493', '#00ffff', '#ff00c8', '#32c8ff'],
  },

  setup(p: p5, seed: number, width: number, height: number) {
    currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    buildTubes(p, width, height);
    p.background(13, 8, 16);
    // faint brick texture
    p.stroke(30, 20, 35, 80);
    p.strokeWeight(1);
    const brickH = 18, brickW = 36;
    for (let row = 0; row * brickH < height; row++) {
      const offset = (row % 2) * brickW * 0.5;
      for (let col = -1; col * brickW < width + brickW; col++) {
        const bx = col * brickW + offset;
        const by = row * brickH;
        p.line(bx, by, bx + brickW, by);
        p.line(bx, by, bx, by + brickH);
      }
    }
    for (const tube of tubes) drawTube(p, tube);
  },

  draw(p: p5) {
    p.noLoop();
  },

  resize(p: p5, width: number, height: number) {
    neon.setup(p, currentSeed, width, height);
    p.loop();
  },
};
