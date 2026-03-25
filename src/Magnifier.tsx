import React, { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { MagnifierProps } from './types';

const Magnifier: React.FC<MagnifierProps> = ({
  src, width = '100%', height = 'auto',
  zoomFactor = 2.5, lensSize = 120,
  lensShape = 'circle', borderColor = '#fff',
  borderWidth = 3, className, style, alt = '',
  position = 'follow',
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    x: 0, y: 0, visible: false,
    bgX: 0, bgY: 0, imgW: 0, imgH: 0,
    relX: 0, relY: 0,
  });

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const half = lensSize / 2;

    let x = clientX - rect.left;
    let y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setState(p => ({ ...p, visible: false }));
      return;
    }

    const cx = Math.max(half, Math.min(rect.width - half, x));
    const cy = Math.max(half, Math.min(rect.height - half, y));

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const bgX = -(cx * scaleX * zoomFactor - half);
    const bgY = -(cy * scaleY * zoomFactor - half);

    setState({
      x: cx - half, y: cy - half, visible: true,
      bgX, bgY,
      imgW: img.naturalWidth * zoomFactor,
      imgH: img.naturalHeight * zoomFactor,
      relX: x / rect.width,
      relY: y / rect.height,
    });
  }, [lensSize, zoomFactor]);

  const getPanelStyle = (): React.CSSProperties => {
    const img = imgRef.current;
    const base: React.CSSProperties = {
      backgroundImage: `url(${src})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${state.imgW}px ${state.imgH}px`,
      backgroundPosition: `${state.bgX}px ${state.bgY}px`,
      border: `${borderWidth}px solid ${borderColor}`,
      pointerEvents: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    };

    if (position === 'follow') {
      return {
        ...base,
        position: 'absolute',
        left: state.x, top: state.y,
        width: lensSize, height: lensSize,
        borderRadius: lensShape === 'circle' ? '50%' : '6px',
      };
    }

    const containerNode = containerRef.current;
    if (!containerNode) return { ...base };

    const rect = containerNode.getBoundingClientRect();
    const panelSize = lensSize * 1.5;
    const scrollX = typeof window !== 'undefined' ? window.pageXOffset : 0;
    const scrollY = typeof window !== 'undefined' ? window.pageYOffset : 0;

    const positions: Record<string, React.CSSProperties> = {
      right:  { position: 'absolute', left: rect.right + scrollX + 12, top: rect.top + scrollY + rect.height / 2, transform: 'translateY(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
      left:   { position: 'absolute', left: rect.left + scrollX - panelSize - 12, top: rect.top + scrollY + rect.height / 2, transform: 'translateY(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
      top:    { position: 'absolute', top: rect.top + scrollY - panelSize - 12, left: rect.left + scrollX + rect.width / 2, transform: 'translateX(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
      bottom: { position: 'absolute', top: rect.bottom + scrollY + 12, left: rect.left + scrollX + rect.width / 2, transform: 'translateX(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
    };

    return { ...base, borderRadius: '8px', ...positions[position] };
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onMouseMove={e => handleMove(e.clientX, e.clientY)}
      onMouseLeave={() => setState(p => ({ ...p, visible: false }))}
      onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); }}
      onTouchEnd={() => setState(p => ({ ...p, visible: false }))}
    >
      <img ref={imgRef} src={src} alt={alt}
        style={{ width, height, display: 'block' }} draggable={false} />
      {state.visible && position === 'follow' && <div style={getPanelStyle()} />}
      {state.visible && position !== 'follow' && typeof document !== 'undefined' && createPortal(<div style={getPanelStyle()} />, document.body)}
    </div>
  );
};

export default Magnifier;