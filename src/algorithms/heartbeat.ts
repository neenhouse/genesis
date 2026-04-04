import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let time = 0;

interface Trace {
  yCenter: number;
  phase: number;
  speed: number;
  amplitude: number;
  noiseOffset: number;
  color: [number, number, number];
}

let traces: Trace[] = [];
const HISTORY = 600;
const buffers: Float32Array[] = [];
let bufHead = 0;

function pqrst(t: number, noise: number): number {
  // Simplified PQRST waveform
  const cycle = t % 1.0;
  let v = 0;
  // P wave
  const p = Math.exp(-Math.pow((cycle - 0.12) / 0.04, 2)) * (0.15 + noise * 0.05);
  // Q dip
  const q = -Math.exp(-Math.pow((cycle - 0.22) / 0.015, 2)) * 0.1;
  // R spike
  const r = Math.exp(-Math.pow((cycle - 0.26) / 0.018, 2)) * (0.9 + noise * 0.2);
  // S dip
  const s = -Math.exp(-Math.pow((cycle - 0.31) / 0.02, 2)) * 0.25;
  // T wave
  const tWave = Math.exp(-Math.pow((cycle - 0.47) / 0.07, 2)) * (0.28 + noise * 0.08);
  v = p + q + r + s + tWave;
  // Baseline wander from noise
  v += (noise - 0.5) * 0.04;
  return v;
}

export const heartbeat: Algorithm = {
  name: 'Heartbeat',
  description: 'ECG monitor with scrolling PQRST traces and noise variation per beat',
  palette: { background: '#000d00', colors: ['#00ff41', '#00cc33', '#008822'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    time = 0; bufHead = 0;

    const traceCount = 1 + Math.floor(p.random(3));
    traces = [];
    for (let i = 0; i < traceCount; i++) {
      traces.push({
        yCenter: h * ((i + 0.5) / traceCount),
        phase: p.random(1),
        speed: 0.9 + p.random(0.3),
        amplitude: (h / traceCount) * 0.35,
        noiseOffset: p.random(100),
        color: i === 0 ? [0, 255, 65] : i === 1 ? [0, 204, 51] : [0, 136, 34],
      });
    }

    // Init ring buffers
    buffers.length = 0;
    for (let i = 0; i < traces.length; i++) {
      buffers.push(new Float32Array(HISTORY));
    }

    p.background(0, 13, 0);
    p.strokeWeight(1.5);
    p.noFill();
  },

  draw(p: p5) {
    time += 0.022;

    // Scroll: darken old frame slightly then draw new column
    p.noStroke();
    p.fill(0, 13, 0, 28);
    p.rect(0, 0, w, h);

    // Grid lines
    p.stroke(0, 80, 0, 40);
    p.strokeWeight(0.5);
    const gridX = w / 10, gridY = h / 8;
    for (let x = 0; x < w; x += gridX) { p.line(x, 0, x, h); }
    for (let y = 0; y < h; y += gridY) { p.line(0, y, w, y); }

    const scrollX = (time * 80) % w;

    for (let t = 0; t < traces.length; t++) {
      const trace = traces[t];
      const [r, g, b] = trace.color;

      // Erase leading edge
      p.noStroke();
      p.fill(0, 13, 0);
      p.rect(scrollX, trace.yCenter - trace.amplitude * 1.4, 18, trace.amplitude * 2.8);

      // Write new sample into ring buffer
      const cycleT = (time * trace.speed + trace.phase);
      const noiseVal = p.noise(cycleT * 0.3 + trace.noiseOffset);
      const sample = pqrst(cycleT, noiseVal);
      const bufIdx = Math.floor(scrollX / w * HISTORY) % HISTORY;
      buffers[t][bufIdx] = sample;

      // Draw visible trace
      p.noFill();
      p.stroke(r, g, b, 200);
      p.strokeWeight(1.8);
      p.beginShape();
      for (let xi = 0; xi < w - 18; xi += 2) {
        const histIdx = Math.floor(((xi + scrollX + 18) % w) / w * HISTORY) % HISTORY;
        const val = buffers[t][histIdx];
        const px = (xi + 1);
        const py = trace.yCenter - val * trace.amplitude;
        p.vertex(px, py);
      }
      p.endShape();

      // Bright tip dot
      const tipVal = buffers[t][bufIdx];
      p.noStroke();
      p.fill(r, g, b, 240);
      p.circle(scrollX, trace.yCenter - tipVal * trace.amplitude, 4);
    }
  },

  resize(p: p5, width: number, height: number) {
    heartbeat.setup(p, currentSeed, width, height);
    p.loop();
  },
};
