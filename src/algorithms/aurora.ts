import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0;
let time = 0;

interface Ribbon {
  baseY: number;
  amplitude: number;
  frequency: number;
  speed: number;
  color: number[];
}

let ribbons: Ribbon[] = [];
let mouseInfluenceX = 0.5, mouseInfluenceY = 0.5;

const AURORA_COLORS = [
  [74, 222, 128],   // green
  [45, 212, 191],   // teal
  [168, 85, 247],   // purple
  [236, 72, 153],   // pink
  [34, 211, 238],   // cyan
  [129, 230, 100],  // lime
];

export const aurora: Algorithm = {
  name: 'Aurora',
  description: 'Northern lights — move your mouse to shift the ribbons',
  interactive: true,
  palette: { background: '#050510', colors: ['#4ade80', '#2dd4bf', '#a855f7'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    p.randomSeed(seed); p.noiseSeed(seed);
    time = 0;

    ribbons = [];
    const count = 5 + Math.floor(p.random(4));
    for (let i = 0; i < count; i++) {
      ribbons.push({
        baseY: h * (0.15 + i * 0.7 / count) + p.random(-30, 30),
        amplitude: p.random(30, 80),
        frequency: p.random(0.002, 0.006),
        speed: p.random(0.3, 0.8),
        color: AURORA_COLORS[i % AURORA_COLORS.length],
      });
    }

    p.background(5, 5, 16);
  },

  draw(p: p5) {
    // Semi-transparent background for trailing effect
    p.background(5, 5, 16, 15);
    time += 0.02;

    const yShift = (mouseInfluenceY - 0.5) * h * 0.3;
    const speedMult = 0.5 + mouseInfluenceX * 1.5;

    for (const ribbon of ribbons) {
      const [r, g, b] = ribbon.color;

      // Draw filled ribbon between two wave lines
      p.noStroke();
      p.fill(r, g, b, 12);

      p.beginShape();
      // Top edge
      for (let x = 0; x <= w; x += 4) {
        const noiseY = p.noise(x * 0.003, time * ribbon.speed * speedMult, ribbon.baseY * 0.01);
        const y = ribbon.baseY + yShift + Math.sin(x * ribbon.frequency + time * ribbon.speed * speedMult) * ribbon.amplitude * noiseY;
        p.vertex(x, y);
      }
      // Bottom edge (reverse)
      for (let x = w; x >= 0; x -= 4) {
        const noiseY = p.noise(x * 0.003, time * ribbon.speed * speedMult + 10, ribbon.baseY * 0.01);
        const y = ribbon.baseY + yShift + 40 + Math.sin(x * ribbon.frequency * 1.1 + time * ribbon.speed * speedMult + 1) * ribbon.amplitude * 0.6 * noiseY;
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);

      // Bright center line
      p.noFill();
      p.stroke(r, g, b, 60);
      p.strokeWeight(1);
      p.beginShape();
      for (let x = 0; x <= w; x += 4) {
        const noiseY = p.noise(x * 0.003, time * ribbon.speed * speedMult, ribbon.baseY * 0.01);
        const y = ribbon.baseY + yShift + 20 + Math.sin(x * ribbon.frequency + time * ribbon.speed * speedMult) * ribbon.amplitude * 0.8 * noiseY;
        p.vertex(x, y);
      }
      p.endShape();
    }
  },

  mouseMoved(_p: p5, mx: number, my: number) {
    mouseInfluenceX = mx / w;
    mouseInfluenceY = my / h;
  },

  resize(p: p5, width: number, height: number) {
    w = width; h = height;
  },
};
