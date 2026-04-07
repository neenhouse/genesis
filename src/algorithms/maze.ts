import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

let cols: number, rows: number;
let cellSize: number;
let visited: boolean[][];
let stack: [number, number][];
let current: [number, number] | null;
// walls[r][c] = [top, right, bottom, left]
let walls: boolean[][][];
let done: boolean;

function validCell(c: number, r: number) { return c >= 0 && c < cols && r >= 0 && r < rows; }

function unvisitedNeighbors(c: number, r: number): [number, number][] {
  const dirs: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  return dirs
    .map(([dc, dr]) => [c + dc, r + dr] as [number, number])
    .filter(([nc, nr]) => validCell(nc, nr) && !visited[nr][nc]);
}

function removeWall(c: number, r: number, nc: number, nr: number) {
  const dc = nc - c, dr = nr - r;
  if (dr === -1) { walls[r][c][0] = false; walls[nr][nc][2] = false; }
  else if (dc === 1) { walls[r][c][1] = false; walls[nr][nc][3] = false; }
  else if (dr === 1) { walls[r][c][2] = false; walls[nr][nc][0] = false; }
  else if (dc === -1) { walls[r][c][3] = false; walls[nr][nc][1] = false; }
}

export const maze: Algorithm = {
  name: 'Maze',
  description: 'Recursive backtracker — maze carved cell by cell with a glowing frontier',
  palette: { background: '#0d0d0d', colors: ['#00e5ff', '#1a2a2a', '#ffffff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    done = false;

    cellSize = Math.max(10, Math.floor(Math.min(w, h) / 40));
    cols = Math.floor(w / cellSize);
    rows = Math.floor(h / cellSize);

    visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    walls = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => [true, true, true, true])
    );
    stack = [];
    current = [0, 0];
    visited[0][0] = true;
    stack.push([0, 0]);

    p.background(13, 13, 13);
  },

  draw(p: p5) {
    if (done) return;

    const stepsPerFrame = Math.max(1, Math.floor((cols * rows) / 200));

    for (let s = 0; s < stepsPerFrame; s++) {
      if (!current) { done = true; break; }
      const [c, r] = current;
      const neighbors = unvisitedNeighbors(c, r);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(p.random(neighbors.length))];
        stack.push(current);
        removeWall(c, r, next[0], next[1]);
        visited[next[1]][next[0]] = true;
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      } else {
        current = null;
      }
    }

    // Redraw all cells
    p.background(13, 13, 13);
    const ox = Math.floor((w - cols * cellSize) / 2);
    const oy = Math.floor((h - rows * cellSize) / 2);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ox + c * cellSize;
        const y = oy + r * cellSize;

        if (visited[r][c]) {
          p.noStroke(); p.fill(20, 36, 36);
          p.rect(x, y, cellSize, cellSize);
        }

        p.stroke(60, 70, 70); p.strokeWeight(1);
        const ws = walls[r][c];
        if (ws[0]) p.line(x, y, x + cellSize, y);
        if (ws[1]) p.line(x + cellSize, y, x + cellSize, y + cellSize);
        if (ws[2]) p.line(x, y + cellSize, x + cellSize, y + cellSize);
        if (ws[3]) p.line(x, y, x, y + cellSize);
      }
    }

    // Draw stack path accent
    p.noStroke();
    p.fill(0, 180, 220, 40);
    for (const [sc, sr] of stack) {
      p.rect(ox + sc * cellSize + 1, oy + sr * cellSize + 1, cellSize - 2, cellSize - 2);
    }

    // Highlight current cell
    if (current) {
      p.fill(0, 229, 255, 200);
      p.rect(ox + current[0] * cellSize + 2, oy + current[1] * cellSize + 2, cellSize - 4, cellSize - 4);
    }
  },

  resize(p: p5, width: number, height: number) {
    maze.setup(p, currentSeed, width, height);
    p.loop();
  },
};
