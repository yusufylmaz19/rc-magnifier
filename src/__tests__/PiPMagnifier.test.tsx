import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import React from 'react';
import PiPMagnifier from '../PiPMagnifier';

describe('PiPMagnifier', () => {
  const defaultProps = {
    src: '/demo.jpeg',
    alt: 'Test image',
  };

  describe('Rendering', () => {
    it('renders the image with correct src and alt', () => {
      render(<PiPMagnifier {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', defaultProps.src);
      expect(img).toHaveAttribute('alt', defaultProps.alt);
    });

    it('renders with default dimensions', () => {
      render(<PiPMagnifier {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ width: '100%', height: 'auto' });
    });

    it('applies custom className', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} className="my-pip" />);
      expect(container.firstChild).toHaveClass('my-pip');
    });

    it('does not show PiP panel initially', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} />);
      const children = container.firstChild!.childNodes;
      expect(children.length).toBe(1); // Only img
    });
  });

  describe('Mouse Interaction', () => {
    it('shows PiP panel on mouse move', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });

      expect(wrapper.childNodes.length).toBeGreaterThan(1);
    });

    it('hides PiP panel on mouse leave', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });
      expect(wrapper.childNodes.length).toBeGreaterThan(1);

      fireEvent.mouseLeave(wrapper);
      expect(wrapper.childNodes.length).toBe(1);
    });

    it('hides PiP panel when mouse moves outside image bounds', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      // Move inside first
      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });
      expect(wrapper.childNodes.length).toBeGreaterThan(1);

      // Move to negative coordinates (outside image)
      fireEvent.mouseMove(wrapper, { clientX: -10, clientY: -10 });
      expect(wrapper.childNodes.length).toBe(1);
    });
  });

  describe('PiP Position', () => {
    it('positions PiP at bottom-right by default', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });

      const pip = wrapper.childNodes[1] as HTMLElement;
      expect(pip.style.bottom).toBe('10px');
      expect(pip.style.right).toBe('10px');
    });

    it('positions PiP at top-left', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} pipPosition="top-left" />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });

      const pip = wrapper.childNodes[1] as HTMLElement;
      expect(pip.style.top).toBe('10px');
      expect(pip.style.left).toBe('10px');
    });

    it('positions PiP at top-right', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} pipPosition="top-right" />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });

      const pip = wrapper.childNodes[1] as HTMLElement;
      expect(pip.style.top).toBe('10px');
      expect(pip.style.right).toBe('10px');
    });

    it('positions PiP at bottom-left', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} pipPosition="bottom-left" />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });

      const pip = wrapper.childNodes[1] as HTMLElement;
      expect(pip.style.bottom).toBe('10px');
      expect(pip.style.left).toBe('10px');
    });
  });

  describe('PiP Size', () => {
    it('uses default pipSize of 200', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });

      const pip = wrapper.childNodes[1] as HTMLElement;
      expect(pip.style.width).toBe('200px');
      expect(pip.style.height).toBe('200px');
    });

    it('applies custom pipSize', () => {
      const { container } = render(<PiPMagnifier {...defaultProps} pipSize={300} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });

      const pip = wrapper.childNodes[1] as HTMLElement;
      expect(pip.style.width).toBe('300px');
      expect(pip.style.height).toBe('300px');
    });
  });

  describe('Wheel Zoom', () => {
    it('handles wheel event for zooming', () => {
      const { container } = render(
        <PiPMagnifier {...defaultProps} zoomFactor={2} minZoom={1} maxZoom={5} />
      );
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });
      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150 });

      // PiP should still be visible after zoom
      expect(wrapper.childNodes.length).toBeGreaterThan(1);
    });
  });

  describe('LargeSrc', () => {
    it('uses largeSrc for background image when provided', () => {
      const { container } = render(
        <PiPMagnifier {...defaultProps} largeSrc="https://example.com/large.jpg" />
      );
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 150 });

      const pip = wrapper.childNodes[1] as HTMLElement;
      expect(pip.style.backgroundImage).toContain('large.jpg');
    });
  });
});
