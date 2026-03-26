import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import React from 'react';
import FullscreenMagnifier from '../FullscreenMagnifier';

describe('FullscreenMagnifier', () => {
  const defaultProps = {
    src: '/demo.jpeg',
    alt: 'Test image',
  };

  // Mock window.innerWidth for isMobile detection
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
  });

  describe('Rendering', () => {
    it('renders the image with correct src and alt', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', defaultProps.src);
      expect(img).toHaveAttribute('alt', defaultProps.alt);
    });

    it('renders the trigger button', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      expect(screen.getByText('🔍 Zoom')).toBeInTheDocument();
    });

    it('renders custom trigger text', () => {
      render(<FullscreenMagnifier {...defaultProps} triggerText="Open Zoom" />);
      expect(screen.getByText('Open Zoom')).toBeInTheDocument();
    });

    it('does not show modal initially', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      expect(screen.queryByText('✕')).not.toBeInTheDocument();
    });
  });

  describe('Modal Open/Close', () => {
    it('opens modal when trigger button is clicked', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));
      expect(screen.getByText('✕')).toBeInTheDocument();

      fireEvent.click(screen.getByText('✕'));
      expect(screen.queryByText('✕')).not.toBeInTheDocument();
    });
  });

  describe('Zoom Toggle', () => {
    it('shows zoom off button by default when modal opens', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));
      expect(screen.getByText('🔍 Zoom Off')).toBeInTheDocument();
    });

    it('toggles zoom on/off', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      // Initially zoom is off
      expect(screen.getByText('🔍 Zoom Off')).toBeInTheDocument();

      // Click to toggle zoom on
      fireEvent.click(screen.getByText('🔍 Zoom Off'));
      expect(screen.getByText('🔍 Zoom On')).toBeInTheDocument();
    });

    it('uses custom zoom on/off text', () => {
      render(
        <FullscreenMagnifier {...defaultProps} zoomOnText="Yakınlaştır" zoomOffText="Uzaklaştır" />
      );
      fireEvent.click(screen.getByText('🔍 Zoom'));
      expect(screen.getByText('🔍 Uzaklaştır')).toBeInTheDocument();

      fireEvent.click(screen.getByText('🔍 Uzaklaştır'));
      expect(screen.getByText('🔍 Yakınlaştır')).toBeInTheDocument();
    });
  });

  describe('Rotation', () => {
    it('renders rotate buttons in modal', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      expect(screen.getByText('Rotate ↺')).toBeInTheDocument();
      expect(screen.getByText('Rotate ↻')).toBeInTheDocument();
    });

    it('uses custom rotate text', () => {
      render(<FullscreenMagnifier {...defaultProps} rotateText="Döndür" />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      expect(screen.getByText('Döndür ↺')).toBeInTheDocument();
      expect(screen.getByText('Döndür ↻')).toBeInTheDocument();
    });
  });

  describe('Flip', () => {
    it('renders flip buttons in modal', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      expect(screen.getByText('Flip X')).toBeInTheDocument();
      expect(screen.getByText('Flip Y')).toBeInTheDocument();
    });

    it('uses custom flip text', () => {
      render(<FullscreenMagnifier {...defaultProps} flipText="Çevir" />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      expect(screen.getByText('Çevir X')).toBeInTheDocument();
      expect(screen.getByText('Çevir Y')).toBeInTheDocument();
    });
  });

  describe('Reset', () => {
    it('renders reset button in modal', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('uses custom reset text', () => {
      render(<FullscreenMagnifier {...defaultProps} resetText="Sıfırla" />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      expect(screen.getByText('Sıfırla')).toBeInTheDocument();
    });

    it('resets zoom state when reset is clicked', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      // Enable zoom first
      fireEvent.click(screen.getByText('🔍 Zoom Off'));
      expect(screen.getByText('🔍 Zoom On')).toBeInTheDocument();

      // Click reset
      fireEvent.click(screen.getByText('Reset'));

      // Zoom should be off after reset
      expect(screen.getByText('🔍 Zoom Off')).toBeInTheDocument();
    });
  });

  describe('Hint Text', () => {
    it('shows activate zoom hint when zoom is off', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      expect(screen.getByText('Click "Zoom Off" button to activate zoom')).toBeInTheDocument();
    });

    it('shows exploration hint when zoom is on', () => {
      render(<FullscreenMagnifier {...defaultProps} />);
      fireEvent.click(screen.getByText('🔍 Zoom'));

      fireEvent.click(screen.getByText('🔍 Zoom Off'));
      expect(screen.getByText('Move mouse to explore, scroll to zoom')).toBeInTheDocument();
    });

    it('uses custom hint text', () => {
      render(
        <FullscreenMagnifier
          {...defaultProps}
          hintText="Keşfet"
          activateZoomHint="Zoom'u aç"
        />
      );
      fireEvent.click(screen.getByText('🔍 Zoom'));
      expect(screen.getByText("Zoom'u aç")).toBeInTheDocument();

      fireEvent.click(screen.getByText('🔍 Zoom Off'));
      expect(screen.getByText('Keşfet')).toBeInTheDocument();
    });
  });

  describe('Custom Dimensions', () => {
    it('renders with custom width and height', () => {
      render(<FullscreenMagnifier {...defaultProps} width={600} height={400} />);
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ width: '600px', height: '400px' });
    });
  });
});
