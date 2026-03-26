import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import React from 'react';
import GridMagnifier from '../GridMagnifier';

describe('GridMagnifier', () => {
  const defaultProps = {
    src: '/demo.jpeg',
    alt: 'Test image',
  };

  describe('Rendering', () => {
    it('renders the image with correct src and alt', () => {
      render(<GridMagnifier {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', defaultProps.src);
      expect(img).toHaveAttribute('alt', defaultProps.alt);
    });

    it('applies custom className', () => {
      const { container } = render(<GridMagnifier {...defaultProps} className="my-grid" />);
      expect(container.firstChild).toHaveClass('my-grid');
    });

    it('does not show grid cells initially', () => {
      const { container } = render(<GridMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      // Only the image wrapper should be visible
      expect(wrapper.childNodes.length).toBe(1);
    });
  });

  describe('Mouse Interaction', () => {
    it('shows grid cells on mouse move', () => {
      const { container } = render(<GridMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      const imgWrapper = wrapper.childNodes[0] as HTMLElement;

      fireEvent.mouseMove(imgWrapper, { clientX: 200, clientY: 150 });

      // After mouse move, grid panel should appear
      expect(wrapper.childNodes.length).toBeGreaterThan(1);
    });

    it('hides grid cells on mouse leave', () => {
      const { container } = render(<GridMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      const imgWrapper = wrapper.childNodes[0] as HTMLElement;

      fireEvent.mouseMove(imgWrapper, { clientX: 200, clientY: 150 });
      expect(wrapper.childNodes.length).toBeGreaterThan(1);

      fireEvent.mouseLeave(imgWrapper);
      expect(wrapper.childNodes.length).toBe(1);
    });
  });

  describe('Levels', () => {
    it('renders correct number of grid cells based on default levels', () => {
      const { container } = render(<GridMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      const imgWrapper = wrapper.childNodes[0] as HTMLElement;

      fireEvent.mouseMove(imgWrapper, { clientX: 200, clientY: 150 });

      const gridContainer = wrapper.childNodes[1] as HTMLElement;
      // Default levels = [1.5, 2, 3, 4] → 4 cells
      expect(gridContainer.childNodes.length).toBe(4);
    });

    it('renders correct number of cells for custom levels', () => {
      const { container } = render(
        <GridMagnifier {...defaultProps} levels={[2, 4, 6]} />
      );
      const wrapper = container.firstChild as HTMLElement;
      const imgWrapper = wrapper.childNodes[0] as HTMLElement;

      fireEvent.mouseMove(imgWrapper, { clientX: 200, clientY: 150 });

      const gridContainer = wrapper.childNodes[1] as HTMLElement;
      expect(gridContainer.childNodes.length).toBe(3);
    });

    it('displays zoom level labels in grid cells', () => {
      const { container } = render(
        <GridMagnifier {...defaultProps} levels={[2, 4]} />
      );
      const wrapper = container.firstChild as HTMLElement;
      const imgWrapper = wrapper.childNodes[0] as HTMLElement;

      fireEvent.mouseMove(imgWrapper, { clientX: 200, clientY: 150 });

      expect(screen.getByText('2x')).toBeInTheDocument();
      expect(screen.getByText('4x')).toBeInTheDocument();
    });
  });

  describe('Position', () => {
    it('uses column layout for bottom position (default)', () => {
      const { container } = render(<GridMagnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.flexDirection).toBe('column');
    });

    it('uses column-reverse layout for top position', () => {
      const { container } = render(<GridMagnifier {...defaultProps} position="top" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.flexDirection).toBe('column-reverse');
    });

    it('uses row layout for right position', () => {
      const { container } = render(<GridMagnifier {...defaultProps} position="right" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.flexDirection).toBe('row');
    });

    it('uses row-reverse layout for left position', () => {
      const { container } = render(<GridMagnifier {...defaultProps} position="left" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.flexDirection).toBe('row-reverse');
    });
  });

  describe('LargeSrc', () => {
    it('uses largeSrc for grid cell backgrounds', () => {
      const { container } = render(
        <GridMagnifier {...defaultProps} largeSrc="https://example.com/large.jpg" levels={[2]} />
      );
      const wrapper = container.firstChild as HTMLElement;
      const imgWrapper = wrapper.childNodes[0] as HTMLElement;

      fireEvent.mouseMove(imgWrapper, { clientX: 200, clientY: 150 });

      const gridContainer = wrapper.childNodes[1] as HTMLElement;
      const cell = gridContainer.childNodes[0] as HTMLElement;
      expect(cell.style.backgroundImage).toContain('large.jpg');
    });
  });
});
