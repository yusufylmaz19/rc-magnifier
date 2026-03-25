import React, { useRef, useState } from 'react';
import type { PiPMagnifierProps } from './types';

const PiPMagnifier: React.FC<PiPMagnifierProps> = ({
  src, width = '100%', height = 'auto',
  zoomFactor = 3, pipSize = 200,
  pipPosition = 'bottom-right',
  borderColor = '#fff', alt = '', className, style,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState({ bgX: 0, bgY: 0, imgW: 0, imgH: 0, visible: false });

  const handleMove = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) { setState(p => ({ ...p, visible: false })); return; }
    const half = pipSize / 2;
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    setState({
      bgX: -(x * scaleX * zoomFactor - half),
      bgY: -(y * scaleY * zoomFactor - half),
      imgW: img.naturalWidth * zoomFactor,
      imgH: img.naturalHeight * zoomFactor,
      visible: true,
    });
  };

  const pipPos: Record<string, React.CSSProperties> = {
    'top-left':     { top: 10, left: 10 },
    'top-right':    { top: 10, right: 10 },
    'bottom-left':  { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  };

  return (
    <div className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onMouseMove={e => handleMove(e.clientX, e.clientY)}
      onMouseLeave={() => setState(p => ({ ...p, visible: false }))}>
      <img ref={imgRef} src={src} alt={alt}
        style={{ width, height, display: 'block' }} draggable={false} />
      {state.visible && (
        <div style={{
          position: 'absolute', ...pipPos[pipPosition],
          width: pipSize, height: pipSize,
          borderRadius: '8px',
          border: `3px solid ${borderColor}`,
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${state.imgW}px ${state.imgH}px`,
          backgroundPosition: `${state.bgX}px ${state.bgY}px`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
};

export default PiPMagnifier;