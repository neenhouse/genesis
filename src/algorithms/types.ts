import type p5 from 'p5';

export interface AlgorithmPalette {
  background: string;
  colors: string[];
}

export interface Algorithm {
  name: string;
  description: string;
  palette: AlgorithmPalette;
  setup(p: p5, seed: number, width: number, height: number): void;
  draw(p: p5): void;
  resize?(p: p5, width: number, height: number): void;
}
