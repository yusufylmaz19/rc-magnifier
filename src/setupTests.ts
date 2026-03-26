import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock getBoundingClientRect for all elements
const mockRect: DOMRect = {
  x: 0,
  y: 0,
  width: 400,
  height: 300,
  top: 0,
  left: 0,
  right: 400,
  bottom: 300,
  toJSON: () => ({}),
};

Element.prototype.getBoundingClientRect = vi.fn(() => mockRect);

// Mock window scroll offsets
Object.defineProperty(window, 'pageXOffset', { value: 0, writable: true });
Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
