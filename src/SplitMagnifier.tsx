import React, { useRef, useState } from "react";
import type { SplitMagnifierProps } from "./types";

const SplitMagnifier: React.FC<SplitMagnifierProps> = ({
  src,
  largeSrc,
  width = "100%",
  zoomFactor = 2.5,
  minZoom = 1,
  maxZoom = 10,
  splitRatio = 0.5,
  alt = "",
  className,
  style,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5, visible: false });
  const [currentZoom, setCurrentZoom] = useState(zoomFactor);

  const handleMove = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    if (x < 0 || y < 0 || x > 1 || y > 1) {
      setPos((p) => ({ ...p, visible: false }));
      return;
    }
    setPos({ x, y, visible: true });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = currentZoom + (e.deltaY < 0 ? 0.5 : -0.5);
    setCurrentZoom(Math.max(minZoom, Math.min(newZoom, maxZoom)));
  };

  const img = imgRef.current;
  const rect = img ? img.getBoundingClientRect() : null;

  const bgX = img && rect
    ? -(pos.x * rect.width * currentZoom - (rect.width * splitRatio) / 2)
    : 0;
  const bgY = img && rect
    ? -(pos.y * rect.height * currentZoom - rect.height / 2)
    : 0;
  const bgW = img && rect ? rect.width * currentZoom : 0;
  const bgH = img && rect ? rect.height * currentZoom : 0;

  const bgSrc = largeSrc || src;

  return (
    <div className={className} style={{ display: "inline-flex", ...style }}>
      {/* Sol: orijinal */}
      <div
        style={{
          position: "relative",
          width: `${splitRatio * 100}%`,
          overflow: "hidden",
        }}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseLeave={() => setPos((p) => ({ ...p, visible: false }))}
        onWheel={handleWheel}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          style={{ width: `${100 / splitRatio}%`, display: "block" }}
          draggable={false}
        />
        {pos.visible && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              cursor: "crosshair",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
                transform: "translate(-50%, -50%)",
                width: 60,
                height: 60,
                border: "2px solid white",
                borderRadius: "4px",
                pointerEvents: "none",
              }}
            />
          </div>
        )}
      </div>
      {/* Sağ: zoom */}
      {pos.visible && (
        <div
          style={{
            width: `${(1 - splitRatio) * 100}%`,
            backgroundImage: `url(${bgSrc})`,
            backgroundColor: "#111",
            backgroundRepeat: "no-repeat",
            backgroundSize: `${bgW}px ${bgH}px`,
            backgroundPosition: `${bgX}px ${bgY}px`,
            imageRendering: "high-quality" as any,
          }}
        />
      )}
    </div>
  );
};

export default SplitMagnifier;
