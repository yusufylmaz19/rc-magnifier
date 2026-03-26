import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Magnifier from '../Magnifier';

describe('Magnifier', () => {
  const defaultProps = {
    src: '/demo.jpeg',
    alt: 'Test image',
  };

  describe('Rendering', () => {
    it('renders the image with correct src and alt', () => {
      render(<Magnifier {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', defaultProps.src);
      expect(img).toHaveAttribute('alt', defaultProps.alt);
    });

    it('renders with default dimensions', () => {
      render(<Magnifier {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ width: '100%', height: 'auto' });
    });

    it('renders with custom width and height', () => {
      render(<Magnifier {...defaultProps} width={500} height={300} />);
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ width: '500px', height: '300px' });
    });

    it('applies custom className', () => {
      const { container } = render(<Magnifier {...defaultProps} className="my-magnifier" />);
      expect(container.firstChild).toHaveClass('my-magnifier');
    });

    it('applies custom style', () => {
      const customStyle = { margin: '10px' };
      const { container } = render(<Magnifier {...defaultProps} style={customStyle} />);
      expect(container.firstChild).toHaveStyle({ margin: '10px' });
    });

    it('sets image as not draggable', () => {
      render(<Magnifier {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('draggable', 'false');
    });

    it('does not show lens initially', () => {
      const { container } = render(<Magnifier {...defaultProps} />);
      const children = container.firstChild!.childNodes;
      // Only the img should be rendered, no lens div
      expect(children.length).toBe(1);
    });
  });

  describe('Mouse Interaction', () => {
    it('shows lens on pointer move', async () => {
      const user = userEvent.setup();
      const { container } = render(<Magnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      await user.pointer({ target: wrapper, coords: { clientX: 200, clientY: 150 } });

      // After move, a lens div should appear
      expect(wrapper.childNodes.length).toBeGreaterThan(1);
    });

    it('hides lens on pointer leave', async () => {
      const user = userEvent.setup();
      const { container } = render(<Magnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      await user.pointer({ target: wrapper, coords: { clientX: 200, clientY: 150 } });
      expect(wrapper.childNodes.length).toBeGreaterThan(1);

      await user.unhover(wrapper);
      await waitFor(() => {
        expect(wrapper.childNodes.length).toBe(1);
      });
    });
  });

  describe('Touch Interaction', () => {
    it('shows lens on touch move', () => {
      const { container } = render(<Magnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.touchMove(wrapper, {
        touches: [{ clientX: 200, clientY: 150 }],
      });

      expect(wrapper.childNodes.length).toBeGreaterThan(1);
    });

    it('hides lens on touch end', () => {
      const { container } = render(<Magnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.touchMove(wrapper, {
        touches: [{ clientX: 200, clientY: 150 }],
      });
      fireEvent.touchEnd(wrapper);

      expect(wrapper.childNodes.length).toBe(1);
    });
  });

  describe('Wheel Zoom', () => {
    it('handles wheel event for zooming', () => {
      const { container } = render(
        <Magnifier {...defaultProps} zoomFactor={2} minZoom={1} maxZoom={5} />
      );
      const wrapper = container.firstChild as HTMLElement;

      // First show the lens
      fireEvent.pointerMove(wrapper, { clientX: 200, clientY: 150 });
      const lensBefore = wrapper.querySelector('div[style]') as HTMLElement;

      // Zoom in with wheel
      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150 });

      // Lens should still be visible after zoom
      expect(wrapper.childNodes.length).toBeGreaterThan(1);
    });
  });

  describe('Lens Configuration', () => {
    it('applies circle lens shape by default', () => {
      const { container } = render(<Magnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.pointerMove(wrapper, { clientX: 200, clientY: 150 });

      const lens = wrapper.childNodes[1] as HTMLElement;
      expect(lens.style.borderRadius).toBe('50%');
    });

    it('applies square lens shape', () => {
      const { container } = render(<Magnifier {...defaultProps} lensShape="square" />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.pointerMove(wrapper, { clientX: 200, clientY: 150 });

      const lens = wrapper.childNodes[1] as HTMLElement;
      expect(lens.style.borderRadius).toBe('6px');
    });

    it('applies custom border color and width', () => {
      const { container } = render(
        <Magnifier {...defaultProps} borderColor="#ff0000" borderWidth={5} />
      );
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.pointerMove(wrapper, { clientX: 200, clientY: 150 });

      const lens = wrapper.childNodes[1] as HTMLElement;
      expect(lens).toHaveStyle({
        borderColor: '#ff0000',
        borderWidth: '5px',
      });
    });

    it('applies custom lens size', () => {
      const { container } = render(<Magnifier {...defaultProps} lensSize={200} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.pointerMove(wrapper, { clientX: 200, clientY: 150 });

      const lens = wrapper.childNodes[1] as HTMLElement;
      expect(lens.style.width).toBe('200px');
      expect(lens.style.height).toBe('200px');
    });
  });

  describe('Position Modes', () => {
    it('renders lens inline for follow position', () => {
      const { container } = render(<Magnifier {...defaultProps} position="follow" />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.pointerMove(wrapper, { clientX: 200, clientY: 150 });

      // For follow mode, lens is inside the container (not a portal)
      expect(wrapper.childNodes.length).toBeGreaterThan(1);
    });

    it('uses portal for non-follow positions', () => {
      const { container } = render(<Magnifier {...defaultProps} position="right" />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.pointerMove(wrapper, { clientX: 200, clientY: 150 });

      // For non-follow, lens is rendered via portal to document.body
      // The wrapper should still have only 1 child (img), lens goes to body
      const portalLens = document.body.querySelector('div[style*="background-image"]');
      expect(portalLens).not.toBeNull();
    });
  });

  describe('LargeSrc', () => {
    it('uses largeSrc for background image when provided', () => {
      const { container } = render(
        <Magnifier {...defaultProps} largeSrc="https://example.com/large.jpg" />
      );
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.pointerMove(wrapper, { clientX: 200, clientY: 150 });

      const lens = wrapper.childNodes[1] as HTMLElement;
      expect(lens.style.backgroundImage).toContain('large.jpg');
    });

    it('uses src as fallback when largeSrc is not provided', () => {
      const { container } = render(<Magnifier {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      fireEvent.pointerMove(wrapper, { clientX: 200, clientY: 150 });

      const lens = wrapper.childNodes[1] as HTMLElement;
      expect(lens.style.backgroundImage).toContain('demo.jpeg');
    });
  });
});
