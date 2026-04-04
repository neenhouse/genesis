import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let frameCount = 0;
const SYMMETRY = 6;

interface Shard {
  r1: number; angle1: number;
  r2: number; angle2: number;
  r3: number; angle3: number;
  col: number[];
}

let shards: Shard[] = [];

const JEWEL = [
  [220, 50, 100],   // ruby
  [60, 180, 220],   // sapphire
  [50, 200, 120],   // emerald
  [190, 80, 220],   // amethyst
  [240, 170, 40],   // topaz
  [240, 90, 50],    // garnet
  [100, 220, 200],  // aquamarine
];

function drawSector(p: p5, s: Shard) {
  const [r, g, b] = s.col;
  const slice = p.TWO_PI / SYMMETRY;
  for (let i = 0; i < SYMMETRY; i++) {
    p.push();
    p.rotate(i * slice);
    // draw original
    p.fill(r, g, b, 160);
    p.noStroke();
    p.triangle(
      Math.cos(s.angle1) * s.r1, Math.sin(s.angle1) * s.r1,
      Math.cos(s.angle2) * s.r2, Math.sin(s.angle2) * s.r2,
      Math.cos(s.angle3) * s.r3, Math.sin(s.angle3) * s.r3,
    );
    // mirror
    p.scale(1, -1);
    p.fill(r, g, b, 100);
    p.triangle(
      Math.cos(s.angle1) * s.r1, Math.sin(s.angle1) * s.r1,
      Math.cos(s.angle2) * s.r2, Math.sin(s.angle2) * s.r2,
      Math.cos(s.angle3) * s.r3, Math.sin(s.angle3) * s.r3,
    );
    p.pop();
  }
}

export const kaleidoscope: Algorithm = {
  name: 'Kaleidoscope',
  description: '6-fold symmetric reflections — jewel-toned shards spinning in the dark',
  palette: { background: '#000010', colors: ['#dc3264', '#3cb4dc', '#32c878'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    frameCount = 0;
    shards = [];
    p.background(0, 0, 16);
  },

  draw(p: p5) {
    frameCount++;
    // Add a new shard every few frames
    if (frameCount % 4 === 0) {
      const maxR = Math.min(w, h) * 0.48;
      const slice = p.TWO_PI / SYMMETRY;
      shards.push({
        r1: p.random(10, maxR), angle1: p.random(0, slice),
        r2: p.random(10, maxR), angle2: p.random(0, slice),
        r3: p.random(10, maxR), angle3: p.random(0, slice),
        col: JEWEL[Math.floor(p.random(JEWEL.length))],
      });
      if (shards.length > 200) shards.shift();
    }

    // Slowly rotate the whole scene
    p.background(0, 0, 16, 18);
    p.push();
    p.translate(w / 2, h / 2);
    p.rotate(frameCount * 0.004);
    for (const s of shards) drawSector(p, s);
    // Central glow
    p.noStroke();
    p.fill(255, 255, 255, 30);
    p.circle(0, 0, 18);
    p.pop();
  },

  resize(p: p5, width: number, height: number) {
    kaleidoscope.setup(p, currentSeed, width, height);
    p.loop();
  },
};
