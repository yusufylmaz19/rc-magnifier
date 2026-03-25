import React, { useRef, useState, useCallback } from 'react';
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

  const handleMove = useCallback((clientX: number, clientY: number, zoom: number) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();

    let x = clientX - rect.left;
    let y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setState(p => ({ ...p, visible: false }));
      return;
    }

    const imgW = img.naturalWidth * zoom;
    const imgH = img.naturalHeight * zoom;

    let bgX = 0;
    let bgY = 0;
    let cx = x;
    let cy = y;
    const half = lensSize / 2;

    if (position === 'follow') {
      const clampX = rect.width > lensSize ? Math.max(half, Math.min(rect.width - half, x)) : rect.width / 2;
      const clampY = rect.height > lensSize ? Math.max(half, Math.min(rect.height - half, y)) : rect.height / 2;

      cx = clampX;
      cy = clampY;

      const scaleX = img.naturalWidth / rect.width;
      const scaleY = img.naturalHeight / rect.height;
      bgX = -(cx * scaleX * zoom - half);
      bgY = -(cy * scaleY * zoom - half);
    } else {
      const panelSize = lensSize * 1.5;
      const relX = x / rect.width;
      const relY = y / rect.height;

      const maxBgX = imgW - panelSize;
      bgX = maxBgX > 0 ? -(relX * maxBgX) : (panelSize - imgW) / 2;

      const maxBgY = imgH - panelSize;
      bgY = maxBgY > 0 ? -(relY * maxBgY) : (panelSize - imgH) / 2;
    }

    setState({
      x: cx - half, y: cy - half, visible: true,
      bgX, bgY,
      imgW,
      imgH,
      relX: x / rect.width,
      relY: y / rect.height,
    });
  }, [lensSize, position]);

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY, currentZoom);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY, currentZoom);
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

  const getPanelStyle = (): React.CSSProperties => {
    const img = imgRef.current;
    const bgSrc = largeSrc || src;
    const base: React.CSSProperties = {
      backgroundImage: `url(${bgSrc})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${state.imgW}px ${state.imgH}px`,
      backgroundPosition: `${state.bgX}px ${state.bgY}px`,
      border: `${borderWidth}px solid ${borderColor}`,
      pointerEvents: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      imageRendering: 'high-quality' as any,
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
      right: { position: 'absolute', left: rect.right + scrollX + 12, top: rect.top + scrollY + rect.height / 2, transform: 'translateY(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
      left: { position: 'absolute', left: rect.left + scrollX - panelSize - 12, top: rect.top + scrollY + rect.height / 2, transform: 'translateY(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
      top: { position: 'absolute', top: rect.top + scrollY - panelSize - 12, left: rect.left + scrollX + rect.width / 2, transform: 'translateX(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
      bottom: { position: 'absolute', top: rect.bottom + scrollY + 12, left: rect.left + scrollX + rect.width / 2, transform: 'translateX(-50%)', width: panelSize, height: panelSize, zIndex: 9999 },
    };

    return { ...base, borderRadius: '8px', ...positions[position] };
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setState(p => ({ ...p, visible: false }))}
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