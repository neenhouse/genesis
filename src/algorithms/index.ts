import type { Algorithm } from './types';
import { murmuration } from './murmuration';
import { erosion } from './erosion';
import { tessera } from './tessera';
import { drift } from './drift';
import { lattice } from './lattice';
import { pulse } from './pulse';
import { orbit } from './orbit';
import { bloom } from './bloom';
import { signal } from './signal';
import { cascade } from './cascade';

export const algorithms: Algorithm[] = [
  murmuration,
  erosion,
  tessera,
  drift,
  lattice,
  pulse,
  orbit,
  bloom,
  signal,
  cascade,
];

export type { Algorithm } from './types';
