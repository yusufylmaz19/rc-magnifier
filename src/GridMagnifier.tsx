import React, { useRef, useState } from 'react';
import type { GridMagnifierProps } from './types';

const GridMagnifier: React.FC<GridMagnifierProps> = ({
  src, largeSrc, width = '100%', height = 'auto',
  levels = [1.5, 2, 3, 4], alt = '', className, style,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5, visible: false });

  const handleMove = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    if (x < 0 || y < 0 || x > 1 || y > 1) { setPos(p => ({ ...p, visible: false })); return; }
    setPos({ x, y, visible: true });
  };

  const cellSize = 120;

  return (
    <div className={className} style={{ display: 'inline-block', ...style }}>
      <div style={{ position: 'relative', display: 'inline-block' }}
        onMouseMove={e => handleMove(e.clientX, e.clientY)}
        onMouseLeave={() => setPos(p => ({ ...p, visible: false }))}>
        <img ref={imgRef} src={src} alt={alt}
          style={{ width, height, display: 'block' }} draggable={false} />
      </div>

      {pos.visible && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(2, ${cellSize}px)`,
          gap: 4, marginTop: 8,
        }}>
          {levels.map((zoom, i) => {
            const img = imgRef.current;
            if (!img) return null;
            const rect = img.getBoundingClientRect();
            const half = cellSize / 2;
            const bgX = -(pos.x * img.naturalWidth * zoom - half);
            const bgY = -(pos.y * img.naturalHeight * zoom - half);
            const bgSrc = largeSrc || src;
            return (
              <div key={i} style={{
                width: cellSize, height: cellSize,
                backgroundImage: `url(${bgSrc})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${img.naturalWidth * zoom}px ${img.naturalHeight * zoom}px`,
                backgroundPosition: `${bgX}px ${bgY}px`,
                borderRadius: 6,
                border: '2px solid #ccc',
                position: 'relative',
                imageRendering: 'high-quality' as any,
              }}>
                <span style={{
                  position: 'absolute', bottom: 4, right: 6,
                  fontSize: 11, color: '#fff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                }}>{zoom}x</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GridMagnifier;