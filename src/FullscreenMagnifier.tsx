import React, { useRef, useState, useEffect } from 'react';
import type { FullscreenMagnifierProps } from './types';

const FullscreenMagnifier: React.FC<FullscreenMagnifierProps> = ({
  src, largeSrc, width = '100%', height = 'auto',
  zoomFactor = 3, minZoom = 1, maxZoom = 10, triggerText = '🔍 Zoom',
  hintText = 'Move mouse to explore, scroll to zoom',
  initialRotation = 0, initialFlipX = false, initialFlipY = false,
  zoomOnText = 'Zoom On',
  zoomOffText = 'Zoom Off',
  resetText = 'Reset',
  rotateText = 'Rotate',
  flipText = 'Flip',
  activateZoomHint = 'Click "Zoom Off" button to activate zoom',
  alt = '', className, style,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ bgX: 0, bgY: 0, imgW: 0, imgH: 0 });
  const [currentZoom, setCurrentZoom] = useState(zoomFactor);
  const [rotation, setRotation] = useState(initialRotation);
  const [flipX, setFlipX] = useState(initialFlipX);
  const [flipY, setFlipY] = useState(initialFlipY);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setRotation(initialRotation);
    setFlipX(initialFlipX);
    setFlipY(initialFlipY);
  }, [initialRotation, initialFlipX, initialFlipY]);

  const handleMove = (clientX: number, clientY: number, zoom: number, rot: number, fx: boolean, fy: boolean) => {
    if (!isZoomActive) return;
    const overlay = document.getElementById('fs-overlay');
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();

    // Normal coordinate relative to overlay center
    let x = clientX - (rect.left + rect.width / 2);
    let y = clientY - (rect.top + rect.height / 2);

    // Inverse Transformation for Mouse/Touch Coordinates
    if (fx) x = -x;
    if (fy) y = -y;

    const rad = (-rot * Math.PI) / 180;
    const rx = x * Math.cos(rad) - y * Math.sin(rad);
    const ry = x * Math.sin(rad) + y * Math.cos(rad);

    const finalX = rx + rect.width / 2;
    const finalY = ry + rect.height / 2;

    const img = imgRef.current;
    if (!img) return;

    const overlayRatio = rect.width / rect.height;
    const is90 = Math.abs(rot % 180) === 90;
    const imgW = is90 ? img.naturalHeight : img.naturalWidth;
    const imgH = is90 ? img.naturalWidth : img.naturalHeight;
    const imgRatio = imgW / imgH;

    let baseW, baseH;
    if (imgRatio > overlayRatio) {
      baseW = rect.width;
      baseH = rect.width / imgRatio;
    } else {
      baseH = rect.height;
      baseW = rect.height * imgRatio;
    }

    const imgLeft = (rect.width - baseW) / 2;
    const imgTop = (rect.height - baseH) / 2;

    const clampedX = Math.max(0, Math.min(finalX - imgLeft, baseW));
    const clampedY = Math.max(0, Math.min(finalY - imgTop, baseH));

    setPos({
      bgX: -(clampedX * zoom - rect.width / 2),
      bgY: -(clampedY * zoom - rect.height / 2),
      imgW: baseW * zoom,
      imgH: baseH * zoom,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY, currentZoom, rotation, flipX, flipY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY, currentZoom, rotation, flipX, flipY);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isZoomActive) return;
    e.preventDefault();
    const newZoom = currentZoom + (e.deltaY < 0 ? 0.5 : -0.5);
    const clampedZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));
    setCurrentZoom(clampedZoom);
    handleMove(e.clientX, e.clientY, clampedZoom, rotation, flipX, flipY);
  };

  const reset = () => {
    setRotation(initialRotation);
    setFlipX(initialFlipX);
    setFlipY(initialFlipY);
    setCurrentZoom(zoomFactor);
    setIsZoomActive(false);
  };

  const popupSrc = largeSrc || src;

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <img ref={imgRef} src={src} alt={alt}
        style={{ width, height, display: 'block' }} draggable={false} />
      <button onClick={() => { setOpen(true); setIsZoomActive(false); }} style={{
        position: 'absolute', bottom: 10, right: 10,
        padding: '6px 12px', borderRadius: 6,
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        border: 'none', cursor: 'pointer', fontSize: 13,
      }}>{triggerText}</button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: isMobile ? '20px' : '0',
        }}>
          <button onClick={() => setOpen(false)} style={{
            position: 'absolute', top: isMobile ? 10 : 20, right: isMobile ? 10 : 24,
            background: 'none', border: 'none', color: '#fff',
            fontSize: isMobile ? 24 : 28, cursor: 'pointer',
          }}>✕</button>

          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 12,
              transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              width: isMobile ? '95vw' : '80vw',
              height: isMobile ? '50vh' : '80vh',
            }}
          >
            <div id="fs-overlay"
              onMouseMove={onMouseMove}
              onTouchMove={onTouchMove}
              onWheel={handleWheel}
              style={{
                width: '100%', height: '100%',
                backgroundImage: `url(${popupSrc})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: (isZoomActive && pos.imgW) ? `${pos.imgW}px ${pos.imgH}px` : 'contain',
                backgroundPosition: (isZoomActive && pos.imgW) ? `${pos.bgX}px ${pos.bgY}px` : 'center',
                cursor: isZoomActive ? 'crosshair' : 'default',
                imageRendering: 'high-quality' as any,
              }} />
          </div>

          <div style={{
            marginTop: isMobile ? 16 : 24,
            display: 'flex',
            gap: isMobile ? 8 : 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            background: 'rgba(255,255,255,0.1)',
            padding: isMobile ? '8px 12px' : '10px 20px',
            borderRadius: 30,
            backdropFilter: 'blur(10px)',
            maxWidth: '90vw',
          }}>
            <button
              onClick={() => setIsZoomActive(!isZoomActive)}
              style={{
                ...btnStyle,
                fontSize: isMobile ? 11 : 13,
                background: isZoomActive ? 'rgba(255,255,255,0.2)' : 'none',
                color: isZoomActive ? '#fff' : '#888'
              }}
            >
              {isZoomActive ? `🔍 ${zoomOnText}` : `🔍 ${zoomOffText}`}
            </button>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', display: isMobile ? 'none' : 'block' }} />
            <button onClick={() => setRotation(r => r - 90)} style={{ ...btnStyle, fontSize: isMobile ? 11 : 13 }}>{rotateText} ↺</button>
            <button onClick={() => setRotation(r => r + 90)} style={{ ...btnStyle, fontSize: isMobile ? 11 : 13 }}>{rotateText} ↻</button>
            <button onClick={() => setFlipX(!flipX)} style={{ ...btnStyle, fontSize: isMobile ? 11 : 13 }}>{flipText} X</button>
            <button onClick={() => setFlipY(!flipY)} style={{ ...btnStyle, fontSize: isMobile ? 11 : 13 }}>{flipText} Y</button>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', display: isMobile ? 'none' : 'block' }} />
            <button onClick={reset} style={{ ...btnStyle, color: '#ff4d4d', fontSize: isMobile ? 11 : 13 }}>{resetText}</button>
          </div>

          <p style={{
            color: '#666',
            marginTop: 16,
            fontSize: isMobile ? 11 : 13,
            letterSpacing: 0.5,
            textAlign: 'center',
            padding: '0 20px'
          }}>
            {isZoomActive ? hintText : activateZoomHint}
          </p>
        </div>
      )}
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#fff',
  cursor: 'pointer', fontSize: 13, fontWeight: 500,
  padding: '6px 10px', borderRadius: 4,
};

export default FullscreenMagnifier;
