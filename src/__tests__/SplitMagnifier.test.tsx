import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SplitMagnifier from '../SplitMagnifier';

describe('SplitMagnifier', () => {
  const defaultProps = {
    src: '/demo.jpeg',
    alt: 'Test image',
  };

  describe('Rendering', () => {
    it('renders the image with correct src and alt', () => {
      render(<SplitMagnifier {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', defaultProps.src);
      expect(img).toHaveAttribute('alt', defaultProps.alt);
    });

    it('applies custom className', () => {
      const { container } = render(<SplitMagnifier {...defaultProps} className="my-split" />);
      expect(container.firstChild).toHaveClass('my-split');
    });

    it('does not show split panel initially', () => {
      const { container } = render(<SplitMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      // Only the left panel (with img) should be visible, no zoomed right panel
      expect(wrapper.childNodes.length).toBe(1);
    });
  });

  describe('Split Ratio', () => {
    it('applies default splitRatio of 0.5', () => {
      const { container } = render(<SplitMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      const leftPanel = wrapper.childNodes[0] as HTMLElement;
      expect(leftPanel.style.width).toBe('50%');
    });

    it('applies custom splitRatio', () => {
      const { container } = render(<SplitMagnifier {...defaultProps} splitRatio={0.3} />);
      const wrapper = container.firstChild as HTMLElement;
      const leftPanel = wrapper.childNodes[0] as HTMLElement;
      expect(leftPanel.style.width).toBe('30%');
    });
  });

  describe('Mouse Interaction', () => {
    it('shows zoomed panel on pointer move', async () => {
      const user = userEvent.setup();
      const { container } = render(<SplitMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      const leftPanel = wrapper.childNodes[0] as HTMLElement;

      await user.pointer({ target: leftPanel, coords: { clientX: 200, clientY: 150 } });

      // After move, a zoomed panel and crosshair overlay should appear
      expect(wrapper.childNodes.length).toBeGreaterThan(1);
    });

    it('hides zoomed panel on pointer leave', async () => {
      const user = userEvent.setup();
      const { container } = render(<SplitMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      const leftPanel = wrapper.childNodes[0] as HTMLElement;

      await user.pointer({ target: leftPanel, coords: { clientX: 200, clientY: 150 } });
      expect(wrapper.childNodes.length).toBeGreaterThan(1);

      await user.unhover(leftPanel);
      await waitFor(() => {
        expect(wrapper.childNodes.length).toBe(1);
      });
    });
  });

  describe('Wheel Zoom', () => {
    it('handles wheel event for zooming', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SplitMagnifier {...defaultProps} zoomFactor={2} minZoom={1} maxZoom={5} />
      );
      const wrapper = container.firstChild as HTMLElement;
      const leftPanel = wrapper.childNodes[0] as HTMLElement;

      await user.pointer({ target: leftPanel, coords: { clientX: 200, clientY: 150 } });
      fireEvent.wheel(leftPanel, { deltaY: -100, clientX: 200, clientY: 150 });

      // Zoomed panel should still be visible
      expect(wrapper.childNodes.length).toBeGreaterThan(1);
    });
  });

  describe('LargeSrc', () => {
    it('uses largeSrc for zoomed panel background', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SplitMagnifier {...defaultProps} largeSrc="https://example.com/large.jpg" />
      );
      const wrapper = container.firstChild as HTMLElement;
      const leftPanel = wrapper.childNodes[0] as HTMLElement;

      await user.pointer({ target: leftPanel, coords: { clientX: 200, clientY: 150 } });

      // The zoomed panel is the second child of the wrapper
      const zoomedPanel = wrapper.childNodes[1] as HTMLElement;
      expect(zoomedPanel.style.backgroundImage).toContain('large.jpg');
    });
  });
});
