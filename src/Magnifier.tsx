import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { MagnifierProps } from './types';

const Magnifier: React.FC<MagnifierProps> = ({
  src, largeSrc, width = '100%', height = 'auto',
  zoomFactor = 2.5, minZoom = 1, maxZoom = 10, lensSize = 120,
  lensShape = 'circle', borderColor = '#fff',
  borderWidth = 3, className, style, alt = '',
  position = 'follow',
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentZoom, setCurrentZoom] = useState(zoomFactor);
  const [state, setState] = useState({
    x: 0, y: 0, visible: false,
    bgX: 0, bgY: 0, imgW: 0, imgH: 0,
    relX: 0, relY: 0,
  });

  useEffect(() => {
    setCurrentZoom(zoomFactor);
  }, [zoomFactor]);

  const rect = imgRef.current?.getBoundingClientRect();
  const imgW = rect ? rect.width * currentZoom : 0;
  const imgH = rect ? rect.height * currentZoom : 0;

  let bgX = 0;
  let bgY = 0;
  let cx = state.relX * (rect?.width || 0);
  let cy = state.relY * (rect?.height || 0);
  const half = lensSize / 2;

  if (position === 'follow') {
    bgX = -(cx * currentZoom - half);
    bgY = -(cy * currentZoom - half);
  } else {
    const panelSize = lensSize * 1.5;
    const maxBgX = imgW - panelSize;
    bgX = maxBgX > 0 ? -(state.relX * maxBgX) : (panelSize - imgW) / 2;

    const maxBgY = imgH - panelSize;
    bgY = maxBgY > 0 ? -(state.relY * maxBgY) : (panelSize - imgH) / 2;
  }

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return;
    const r = img.getBoundingClientRect();

    let x = clientX - r.left;
    let y = clientY - r.top;

    if (position !== 'follow') {
      if (x < 0 || y < 0 || x > r.width || y > r.height) {
        setState(p => ({ ...p, visible: false }));
        return;
      }
    }

    setState(p => ({
      ...p,
      relX: x / r.width,
      relY: y / r.height,
      visible: true,
    }));
  }, [position]);

  const onPointerMove = (e: React.PointerEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = currentZoom + (e.deltaY < 0 ? 0.5 : -0.5);
    const clampedZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));
    setCurrentZoom(clampedZoom);
  };

  const getPanelStyle = (): React.CSSProperties => {
    const bgSrc = largeSrc || src;
    const base: React.CSSProperties = {
      backgroundImage: `url(${bgSrc})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${imgW}px ${imgH}px`,
      backgroundPosition: `${bgX}px ${bgY}px`,
      border: `${borderWidth}px solid ${borderColor}`,
      pointerEvents: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      imageRendering: 'high-quality' as any,
    };

    if (position === 'follow') {
      return {
        ...base,
        position: 'absolute',
        left: cx - half, top: cy - half,
        width: lensSize, height: lensSize,
        borderRadius: lensShape === 'circle' ? '50%' : '6px',
        zIndex: 9999,
      };
    }

    const containerNode = containerRef.current;
    if (!containerNode) return { ...base };

    const r = containerNode.getBoundingClientRect();
    const panelSize = lensSize * 1.5;
    const scrollX = typeof window !== 'undefined' ? window.pageXOffset : 0;
    const scrollY = typeof window !== 'undefined' ? window.pageYOffset : 0;

    const positions: Record<string, React.CSSProperties> = {
      right: { position: 'absolute', left: r.right + scrollX + 12, top: r.top + scrollY + r.height / 2, transform: 'translateY(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
      left: { position: 'absolute', left: r.left + scrollX - panelSize - 12, top: r.top + scrollY + r.height / 2, transform: 'translateY(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
      top: { position: 'absolute', top: r.top + scrollY - panelSize - 12, left: r.left + scrollX + r.width / 2, transform: 'translateX(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
      bottom: { position: 'absolute', top: r.bottom + scrollY + 12, left: r.left + scrollX + r.width / 2, transform: 'translateX(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
    };

    return { ...base, borderRadius: '8px', ...positions[position] };
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', overflow: 'visible', ...style }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setState(p => ({ ...p, visible: false }))}
      onTouchMove={onTouchMove}
      onTouchEnd={() => setState(p => ({ ...p, visible: false }))}
      onWheel={handleWheel}
    >
      <img ref={imgRef} src={src} alt={alt}
        style={{ width, height, display: 'block' }} draggable={false} />
      {state.visible && position === 'follow' && <div style={getPanelStyle()} />}
      {state.visible && position !== 'follow' && typeof document !== 'undefined' && createPortal(<div style={getPanelStyle()} />, document.body)}
    </div>
  );
};

export default Magnifier;