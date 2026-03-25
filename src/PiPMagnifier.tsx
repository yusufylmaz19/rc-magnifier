import React, { useRef, useState } from 'react';
import type { PiPMagnifierProps } from './types';

const PiPMagnifier: React.FC<PiPMagnifierProps> = ({
  src, largeSrc, width = '100%', height = 'auto',
  zoomFactor = 3, minZoom = 1, maxZoom = 10, pipSize = 200,
  pipPosition = 'bottom-right',
  borderColor = '#fff', alt = '', className, style,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState({ bgX: 0, bgY: 0, imgW: 0, imgH: 0, visible: false });
  const [currentZoom, setCurrentZoom] = useState(zoomFactor);

  const handleMove = (clientX: number, clientY: number, zoom: number) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) { setState(p => ({ ...p, visible: false })); return; }
    const half = pipSize / 2;
    setState({
      bgX: -(x * zoom - half),
      bgY: -(y * zoom - half),
      imgW: rect.width * zoom,
      imgH: rect.height * zoom,
      visible: true,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY, currentZoom);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = currentZoom + (e.deltaY < 0 ? 0.5 : -0.5);
    const clampedZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));
    setCurrentZoom(clampedZoom);
    if (state.visible) {
      handleMove(e.clientX, e.clientY, clampedZoom);
    }
  };

  const pipPos: Record<string, React.CSSProperties> = {
    'top-left':     { top: 10, left: 10 },
    'top-right':    { top: 10, right: 10 },
    'bottom-left':  { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  };

  const bgSrc = largeSrc || src;

  return (
    <div className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setState(p => ({ ...p, visible: false }))}
      onWheel={handleWheel}>
      <img ref={imgRef} src={src} alt={alt}
        style={{ width, height, display: 'block' }} draggable={false} />
      {state.visible && (
        <div style={{
          position: 'absolute', ...pipPos[pipPosition],
          width: pipSize, height: pipSize,
          borderRadius: '8px',
          border: `3px solid ${borderColor}`,
          backgroundImage: `url(${bgSrc})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${state.imgW}px ${state.imgH}px`,
          backgroundPosition: `${state.bgX}px ${state.bgY}px`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
          imageRendering: 'high-quality' as any,
        }} />
      )}
    </div>
  );
};

export default PiPMagnifier;