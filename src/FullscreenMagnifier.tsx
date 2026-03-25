import React, { useRef, useState } from 'react';
import type { FullscreenMagnifierProps } from './types';

const FullscreenMagnifier: React.FC<FullscreenMagnifierProps> = ({
  src, largeSrc, width = '100%', height = 'auto',
  zoomFactor = 3, minZoom = 1, maxZoom = 10, triggerText = '🔍 Büyüt',
  alt = '', className, style,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ bgX: 0, bgY: 0, imgW: 0, imgH: 0 });
  const [currentZoom, setCurrentZoom] = useState(zoomFactor);

  const handleMove = (clientX: number, clientY: number, zoom: number) => {
    const overlay = document.getElementById('fs-overlay');
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const img = imgRef.current;
    if (!img) return;
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    setPos({
      bgX: -(x * scaleX * zoom - rect.width / 2),
      bgY: -(y * scaleY * zoom - rect.height / 2),
      imgW: img.naturalWidth * zoom,
      imgH: img.naturalHeight * zoom,
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
    handleMove(e.clientX, e.clientY, clampedZoom);
  };

  const popupSrc = largeSrc || src;

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <img ref={imgRef} src={src} alt={alt}
        style={{ width, height, display: 'block' }} draggable={false} />
      <button onClick={() => setOpen(true)} style={{
        position: 'absolute', bottom: 10, right: 10,
        padding: '6px 12px', borderRadius: 6,
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        border: 'none', cursor: 'pointer', fontSize: 13,
      }}>{triggerText}</button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <button onClick={() => setOpen(false)} style={{
            position: 'absolute', top: 20, right: 24,
            background: 'none', border: 'none', color: '#fff',
            fontSize: 28, cursor: 'pointer',
          }}>✕</button>
          <div id="fs-overlay"
            onMouseMove={onMouseMove}
            onWheel={handleWheel}
            style={{
              width: '80vw', height: '80vh',
              backgroundImage: `url(${popupSrc})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: pos.imgW ? `${pos.imgW}px ${pos.imgH}px` : 'contain',
              backgroundPosition: pos.imgW ? `${pos.bgX}px ${pos.bgY}px` : 'center',
              cursor: 'crosshair', borderRadius: 12,
              imageRendering: 'high-quality' as any,
            }} />
          <p style={{ color: '#888', marginTop: 12, fontSize: 13 }}>
            fareyi gezdirerek incele, tekerlek ile yakınlaştır/uzaklaştır
          </p>
        </div>
      )}
    </div>
  );
};

export default FullscreenMagnifier;