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
];

export type { Algorithm } from './types';
