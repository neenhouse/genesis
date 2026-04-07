import { describe, it, expect } from 'vitest';
import { algorithms } from './index';

describe('algorithms registry', () => {
  it('exports at least one algorithm', () => {
    expect(algorithms.length).toBeGreaterThan(0);
  });

  it('every algorithm has a name and description', () => {
    for (const algo of algorithms) {
      expect(algo.name, `missing name`).toBeTruthy();
      expect(algo.description, `${algo.name}: missing description`).toBeTruthy();
    }
  });

  it('every algorithm has a valid palette', () => {
    for (const algo of algorithms) {
      expect(algo.palette, `${algo.name}: missing palette`).toBeDefined();
      expect(algo.palette.background, `${algo.name}: missing background`).toBeTruthy();
      expect(Array.isArray(algo.palette.colors), `${algo.name}: colors must be array`).toBe(true);
      expect(algo.palette.colors.length, `${algo.name}: colors must not be empty`).toBeGreaterThan(
        0,
      );
    }
  });

  it('every algorithm exports setup and draw functions', () => {
    for (const algo of algorithms) {
      expect(typeof algo.setup, `${algo.name}: setup must be a function`).toBe('function');
      expect(typeof algo.draw, `${algo.name}: draw must be a function`).toBe('function');
    }
  });

  it('all algorithm names are unique', () => {
    const names = algorithms.map((a) => a.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('all palette backgrounds are valid CSS hex colors', () => {
    const hexColor = /^#[0-9a-fA-F]{3,8}$/;
    for (const algo of algorithms) {
      expect(
        hexColor.test(algo.palette.background),
        `${algo.name}: background "${algo.palette.background}" is not a valid hex color`,
      ).toBe(true);
    }
  });
});
