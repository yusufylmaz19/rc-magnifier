import { useState } from 'react'
import './App.css'
import { 
  Magnifier, 
  PiPMagnifier, 
  SplitMagnifier, 
  GridMagnifier, 
  FullscreenMagnifier 
} from '../../src'

type MagnifierType = 'Magnifier' | 'PiPMagnifier' | 'SplitMagnifier' | 'GridMagnifier' | 'FullscreenMagnifier';

function App() {
  const [activeType, setActiveType] = useState<MagnifierType>('Magnifier');
  const [zoomFactor, setZoomFactor] = useState(3);
  const [lensSize, setLensSize] = useState(150);
  const [lensShape, setLensShape] = useState<'circle' | 'square'>('circle');
  const [magnifierPosition, setMagnifierPosition] = useState<'follow' | 'left' | 'right' | 'top' | 'bottom'>('follow');
  const [pipPosition, setPipPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [splitRatio, setSplitRatio] = useState(0.5);

  const imgSrc = '/demo.jpeg';

  const renderMagnifier = () => {
    switch (activeType) {
      case 'Magnifier':
        return (
          <Magnifier 
            src={imgSrc} 
            zoomFactor={zoomFactor} 
            lensSize={lensSize} 
            lensShape={lensShape} 
            position={magnifierPosition}
            width={500}
          />
        );
      case 'PiPMagnifier':
        return (
          <PiPMagnifier 
            src={imgSrc} 
            zoomFactor={zoomFactor} 
            pipSize={lensSize + 50} 
            pipPosition={pipPosition}
            width={500}
          />
        );
      case 'SplitMagnifier':
        return (
          <SplitMagnifier 
            src={imgSrc} 
            zoomFactor={zoomFactor} 
            splitRatio={splitRatio}
            width={500}
          />
        );
      case 'GridMagnifier':
        return (
          <GridMagnifier 
            src={imgSrc} 
            levels={[1.5, 2, 4, 8]}
            width={500}
          />
        );
      case 'FullscreenMagnifier':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <FullscreenMagnifier 
              src={imgSrc} 
              zoomFactor={zoomFactor}
              width={400}
            />
            <p style={{ color: '#64748b', fontWeight: 500 }}>Click the button on the image to open fullscreen mode</p>
          </div>
        );
    }
  };

  return (
    <div className="demo-container">
      <header>
        <h1>rc-magnifier</h1>
        <p className="subtitle">Extensible and high-performance image zooming library for React</p>
      </header>

      <div className="tabs">
        {(['Magnifier', 'PiPMagnifier', 'SplitMagnifier', 'GridMagnifier', 'FullscreenMagnifier'] as MagnifierType[]).map(type => (
          <button 
            key={type}
            className={`tab-btn ${activeType === type ? 'active' : ''}`}
            onClick={() => setActiveType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="showcase">
        <div className="preview-area">
          {renderMagnifier()}
        </div>

        <div className="controls-area">
          <h2>Controls</h2>
          
          <div className="control-group">
            <label>Zoom Factor: {zoomFactor.toFixed(1)}x</label>
            <input 
              type="range" min="1" max="10" step="0.5" 
              value={zoomFactor} 
              onChange={(e) => setZoomFactor(parseFloat(e.target.value))} 
            />
          </div>

          {activeType === 'Magnifier' && (
            <>
              <div className="control-group">
                <label>Position</label>
                <select value={magnifierPosition} onChange={(e) => setMagnifierPosition(e.target.value as any)}>
                  <option value="follow">Follow Cursor</option>
                  <option value="left">Left Panel</option>
                  <option value="right">Right Panel</option>
                  <option value="top">Top Panel</option>
                  <option value="bottom">Bottom Panel</option>
                </select>
              </div>
              <div className="control-group">
                <label>Lens Size: {lensSize}px</label>
                <input 
                  type="range" min="50" max="300" step="10" 
                  value={lensSize} 
                  onChange={(e) => setLensSize(parseInt(e.target.value))} 
                />
              </div>
              {magnifierPosition === 'follow' && (
                <div className="control-group">
                  <label>Lens Shape</label>
                  <select value={lensShape} onChange={(e) => setLensShape(e.target.value as any)}>
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                  </select>
                </div>
              )}
            </>
          )}

          {activeType === 'PiPMagnifier' && (
            <div className="control-group">
              <label>PiP Position</label>
              <select value={pipPosition} onChange={(e) => setPipPosition(e.target.value as any)}>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
          )}

          {activeType === 'SplitMagnifier' && (
            <div className="control-group">
              <label>Split Ratio: {splitRatio.toFixed(2)}</label>
              <input 
                type="range" min="0.1" max="0.9" step="0.05" 
                value={splitRatio} 
                onChange={(e) => setSplitRatio(parseFloat(e.target.value))} 
              />
            </div>
          )}

          <div className="description">
            <h3>Component Details</h3>
            <p>
              {activeType === 'Magnifier' && "A classic glass-like magnification effect. Supports 'follow cursor' or fixed panel positioning (left, right, top, bottom)."}
              {activeType === 'PiPMagnifier' && "Picture-in-Picture mode shows the zoomed area in a fixed corner window, pinned to the main image."}
              {activeType === 'SplitMagnifier' && "Comparison mode that splits the image space into a navigator and a zoom result panel."}
              {activeType === 'GridMagnifier' && "Static grid mode showing multiple pre-defined magnification levels simultaneously."}
              {activeType === 'FullscreenMagnifier' && "A powerful modal-based tool for inspection, rotation, and flipping."}
            </p>
          </div>
        </div>
      </div>

      <footer>
        <p>Built with React + Vite | MIT Licensed</p>
        <p>Install with <code>npm install rc-magnifier</code></p>
      </footer>
    </div>
  )
}

export default App
