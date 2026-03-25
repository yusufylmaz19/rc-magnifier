import React, { useRef, useState } from "react";
import type { SplitMagnifierProps } from "./types";

const SplitMagnifier: React.FC<SplitMagnifierProps> = ({
  src,
  width = "100%",
  zoomFactor = 2.5,
  splitRatio = 0.5,
  alt = "",
  className,
  style,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5, visible: false });

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

  const img = imgRef.current;
  const bgX = img
    ? -(
        pos.x * img.naturalWidth * zoomFactor -
        (img.getBoundingClientRect().width * splitRatio) / 2
      )
    : 0;
  const bgY = img
    ? -(
        pos.y * img.naturalHeight * zoomFactor -
        img.getBoundingClientRect().height / 2
      )
    : 0;
  const bgW = img ? img.naturalWidth * zoomFactor : 0;
  const bgH = img ? img.naturalHeight * zoomFactor : 0;

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
            backgroundImage: `url(${src})`,
            backgroundColor: "#111",
            backgroundRepeat: "no-repeat",
            backgroundSize: `${bgW}px ${bgH}px`,
            backgroundPosition: `${bgX}px ${bgY}px`,
          }}
        />
      )}
    </div>
  );
};

export default SplitMagnifier;
