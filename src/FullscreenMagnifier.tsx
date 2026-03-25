import React, { useRef, useState, useEffect } from 'react';
import type { FullscreenMagnifierProps } from './types';

const FullscreenMagnifier: React.FC<FullscreenMagnifierProps> = ({
  src, largeSrc, width = '100%', height = 'auto',
  zoomFactor = 3, minZoom = 1, maxZoom = 10, triggerText = '🔍 Zoom',
  hintText = 'Move mouse to explore, scroll to zoom',
  initialRotation = 0, initialFlipX = false, initialFlipY = false,
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

    // Inverse Transformation for Mouse Coordinates
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
        }}>
          <button onClick={() => setOpen(false)} style={{
            position: 'absolute', top: 20, right: 24,
            background: 'none', border: 'none', color: '#fff',
            fontSize: 28, cursor: 'pointer',
          }}>✕</button>

          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 12,
              transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div id="fs-overlay"
              onMouseMove={onMouseMove}
              onWheel={handleWheel}
              style={{
                width: '80vw', height: '80vh',
                backgroundImage: `url(${popupSrc})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: (isZoomActive && pos.imgW) ? `${pos.imgW}px ${pos.imgH}px` : 'contain',
                backgroundPosition: (isZoomActive && pos.imgW) ? `${pos.bgX}px ${pos.bgY}px` : 'center',
                cursor: isZoomActive ? 'crosshair' : 'default',
                imageRendering: 'high-quality' as any,
              }} />
          </div>

          <div style={{
            marginTop: 24, display: 'flex', gap: 12, alignItems: 'center',
            background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: 30,
            backdropFilter: 'blur(10px)',
          }}>
            <button
              onClick={() => setIsZoomActive(!isZoomActive)}
              style={{ ...btnStyle, background: isZoomActive ? 'rgba(255,255,255,0.2)' : 'none', color: isZoomActive ? '#fff' : '#888' }}
            >
              {isZoomActive ? '🔍 Zoom On' : '🔍 Zoom Off'}
            </button>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
            <button onClick={() => setRotation(r => r - 90)} style={btnStyle}>↺ Rotate</button>
            <button onClick={() => setRotation(r => r + 90)} style={btnStyle}>Rotate ↻</button>
            <button onClick={() => setFlipX(!flipX)} style={btnStyle}>Flip X</button>
            <button onClick={() => setFlipY(!flipY)} style={btnStyle}>Flip Y</button>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
            <button onClick={reset} style={{ ...btnStyle, color: '#ff4d4d' }}>Reset</button>
          </div>

          <p style={{ color: '#666', marginTop: 16, fontSize: 13, letterSpacing: 0.5 }}>
            {isZoomActive ? hintText : 'Click "Zoom Off" button to activate zoom'}
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
