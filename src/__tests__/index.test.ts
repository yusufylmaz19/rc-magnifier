import { describe, it, expect } from 'vitest';
import {
  Magnifier,
  SplitMagnifier,
  PiPMagnifier,
  GridMagnifier,
  FullscreenMagnifier,
} from '../index';

describe('index exports', () => {
  it('exports Magnifier component', () => {
    expect(Magnifier).toBeDefined();
    expect(typeof Magnifier).toBe('function');
  });

  it('exports SplitMagnifier component', () => {
    expect(SplitMagnifier).toBeDefined();
    expect(typeof SplitMagnifier).toBe('function');
  });

  it('exports PiPMagnifier component', () => {
    expect(PiPMagnifier).toBeDefined();
    expect(typeof PiPMagnifier).toBe('function');
  });

  it('exports GridMagnifier component', () => {
    expect(GridMagnifier).toBeDefined();
    expect(typeof GridMagnifier).toBe('function');
  });

  it('exports FullscreenMagnifier component', () => {
    expect(FullscreenMagnifier).toBeDefined();
    expect(typeof FullscreenMagnifier).toBe('function');
  });
});
