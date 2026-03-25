export interface BaseMagnifierProps {
  src: string;
  largeSrc?: string;
  width?: number | string;
  height?: number | string;
  zoomFactor?: number;
  minZoom?: number;
  maxZoom?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Default
export interface MagnifierProps extends BaseMagnifierProps {
  lensSize?: number;
  lensShape?: 'circle' | 'square';
  borderColor?: string;
  borderWidth?: number;
  position?: 'follow' | 'left' | 'right' | 'top' | 'bottom';
}

// Split view
export interface SplitMagnifierProps extends BaseMagnifierProps {
  splitRatio?: number; // 0-1 arası, default 0.5
}

// Picture in picture
export interface PiPMagnifierProps extends BaseMagnifierProps {
  pipSize?: number;
  pipPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  borderColor?: string;
}

// Grid
export interface GridMagnifierProps extends BaseMagnifierProps {
  levels?: number[];
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Fullscreen
export interface FullscreenMagnifierProps extends BaseMagnifierProps {
  triggerText?: string;
  hintText?: string;
  initialRotation?: number;
  initialFlipX?: boolean;
  initialFlipY?: boolean;
  allowZoom?: boolean;
  zoomOnText?: string;
  zoomOffText?: string;
  resetText?: string;
  rotateText?: string;
  flipText?: string;
  activateZoomHint?: string;
}