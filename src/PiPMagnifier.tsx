import React, { useRef, useState, useEffect } from 'react';
import type { PiPMagnifierProps } from './types';

const PiPMagnifier: React.FC<PiPMagnifierProps> = ({
  src, largeSrc, width = '100%', height = 'auto',
  zoomFactor = 3, minZoom = 1, maxZoom = 10, pipSize = 200,
  pipPosition = 'bottom-right',
  borderColor = '#fff', alt = '', className, style,
  lensSize, lensShape = 'square',
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentZoom, setCurrentZoom] = useState(zoomFactor);
  const [relPos, setRelPos] = useState({ x: 0, y: 0, visible: false });

  useEffect(() => {
    setCurrentZoom(zoomFactor);
  }, [zoomFactor]);

  const rect = imgRef.current?.getBoundingClientRect();
  const imgW = rect ? rect.width * currentZoom : 0;
  const imgH = rect ? rect.height * currentZoom : 0;
  const half = pipSize / 2;
  const bgX = rect ? -(relPos.x * rect.width * currentZoom - half) : 0;
  const bgY = rect ? -(relPos.y * rect.height * currentZoom - half) : 0;

  const handleMove = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return;
    const r = img.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) { 
      setRelPos(p => ({ ...p, visible: false })); 
      return; 
    }
    setRelPos({
      x: x / r.width,
      y: y / r.height,
      visible: true,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = currentZoom + (e.deltaY < 0 ? 0.5 : -0.5);
    setCurrentZoom(Math.max(minZoom, Math.min(newZoom, maxZoom)));
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
      onPointerMove={onPointerMove}
      onPointerLeave={() => setRelPos(p => ({ ...p, visible: false }))}
      onWheel={handleWheel}>
      <img ref={imgRef} src={src} alt={alt}
        style={{ width, height, display: 'block' }} draggable={false} />
      {relPos.visible && lensSize && (
        <div style={{
          position: 'absolute',
          left: relPos.x * (rect?.width || 0) - lensSize / 2,
          top: relPos.y * (rect?.height || 0) - lensSize / 2,
          width: lensSize,
          height: lensSize,
          border: `1px solid ${borderColor}`,
          borderRadius: lensShape === 'circle' ? '50%' : '2px',
          pointerEvents: 'none',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          zIndex: 10,
        }} />
      )}
      {relPos.visible && (
        <div style={{
          position: 'absolute', ...pipPos[pipPosition],
          width: pipSize, height: pipSize,
          borderRadius: '8px',
          border: `3px solid ${borderColor}`,
          backgroundImage: `url(${bgSrc})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${imgW}px ${imgH}px`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
          imageRendering: 'high-quality' as any,
        }} />
      )}
    </div>
  );
};

export default PiPMagnifier;