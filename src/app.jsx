import { useState, useEffect } from 'preact/hooks'
import { ImageUpload } from './components/ImageUpload'
import { PaintCanvas } from './components/PaintCanvas'
import { PhotoEditor } from './components/PhotoEditor'
import { ModeToggle } from './components/ModeToggle'
import { ExportButton } from './components/ExportButton'
import { CanvasSettings } from './components/CanvasSettings'
import { HelpModal } from './components/HelpModal'
import { PaintToolsSidebar } from './components/PaintToolsSidebar'
import './app.css'

export function App() {
  const [image, setImage] = useState(null)
  const [mode, setMode] = useState('paint')
  const [currentCanvas, setCurrentCanvas] = useState(null)
  const [error, setError] = useState(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showCanvasSettings, setShowCanvasSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isLoading, setIsLoading] = useState(false)
  
  // Paint tool states
  const [tool, setTool] = useState('brush')
  const [brushSize, setBrushSize] = useState(5)
  const [color, setColor] = useState('#000000')
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [zoom, setZoom] = useState(1)
  
  const tools = {
    brush: 'brush',
    pencil: 'pencil',
    eraser: 'eraser',
    fill: 'fill',
    rectangle: 'rectangle',
    ellipse: 'ellipse',
    line: 'line',
    text: 'text'
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1))
  }

  const handleZoomReset = () => {
    setZoom(1)
  }

  const handleImageLoad = (loadedImage, file) => {
    setIsLoading(true)
    setTimeout(() => {
      setImage(loadedImage)
      setError(null)
      setShowImageUpload(false)
      setCanvasSize({ width: loadedImage.width, height: loadedImage.height })
      setIsLoading(false)
      console.log('Image loaded:', file.name, `${loadedImage.width}x${loadedImage.height}`)
    }, 100) // Small delay to show loading state
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setTimeout(() => setError(null), 5000)
  }

  const handleCanvasUpdate = (canvas) => {
    setCurrentCanvas(canvas)
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
  }

  const handleNewCanvas = (size = null) => {
    setIsLoading(true)
    setTimeout(() => {
      setImage(null)
      setCurrentCanvas(null)
      setMode('paint')
      setShowImageUpload(false)
      setShowCanvasSettings(false)
      if (size) {
        setCanvasSize(size)
      }
      setIsLoading(false)
    }, 100)
  }

  const handleLoadImage = () => {
    setShowImageUpload(true)
  }

  const handleShowCanvasSettings = () => {
    setShowCanvasSettings(true)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            handleShowCanvasSettings()
            break
          case 'o':
            e.preventDefault()
            handleLoadImage()
            break
          case 's':
            e.preventDefault()
            // Export functionality is handled by ExportButton
            break
        }
      }
      
      if (e.key === 'Escape') {
        if (showImageUpload) {
          setShowImageUpload(false)
        } else if (showCanvasSettings) {
          setShowCanvasSettings(false)
        } else if (showHelp) {
          setShowHelp(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageUpload, showCanvasSettings, showHelp])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="app-logo">🎨</div>
            <div className="header-title">
              <h1>PaintShop</h1>
              <p>Paint & Photo Editor</p>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="icon-btn"
              onClick={() => setShowHelp(true)}
            >
              ❓
              <div className="tooltip">Help & Shortcuts</div>
            </button>
            <ExportButton canvas={currentCanvas} />
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="error-close">✕</button>
        </div>
      )}

      <main className="app-main">
        {showImageUpload ? (
          <div className="welcome-screen">
            <div className="upload-header">
              <button 
                className="back-btn"
                onClick={() => setShowImageUpload(false)}
                title="Back to canvas"
              >
                ← Back to Canvas
              </button>
            </div>
            <ImageUpload 
              onImageLoad={handleImageLoad}
              onError={handleError}
            />
          </div>
        ) : (
          <div className="editor-screen">
            <div className="editor-sidebar">
              <div className="sidebar-section">
                <h3>Mode</h3>
                <div className="mode-toggle-compact">
                  <button 
                    className={`mode-btn-compact ${mode === 'paint' ? 'active' : ''}`}
                    onClick={() => handleModeChange('paint')}
                  >
                    🎨 Paint
                  </button>
                  <button 
                    className={`mode-btn-compact ${mode === 'photo' ? 'active' : ''}`}
                    onClick={() => handleModeChange('photo')}
                  >
                    🖼️ Photo
                  </button>
                </div>
              </div>
              
              <div className="sidebar-section">
                <h3>Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="action-btn load-image-btn"
                    onClick={handleLoadImage}
                    title="Load image from file"
                  >
                    📁 Load Image
                  </button>
                  <button 
                    className="action-btn new-canvas-btn"
                    onClick={handleShowCanvasSettings}
                    title="New blank canvas"
                  >
                    📄 New Canvas
                  </button>
                </div>
              </div>

              <div className="sidebar-section">
                <h3>View</h3>
                <div className="zoom-controls">
                  <div className="zoom-info">
                    <span>Zoom: {Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="zoom-buttons">
                    <button 
                      className="action-btn zoom-btn"
                      onClick={handleZoomOut}
                      title="Zoom out"
                    >
                      🔍- Zoom Out
                    </button>
                    <button 
                      className="action-btn zoom-btn"
                      onClick={handleZoomReset}
                      title="Reset zoom"
                    >
                      🎯 Reset
                    </button>
                    <button 
                      className="action-btn zoom-btn"
                      onClick={handleZoomIn}
                      title="Zoom in"
                    >
                      🔍+ Zoom In
                    </button>
                  </div>
                </div>
              </div>
              
              {mode === 'paint' && (
                <div className="sidebar-section">
                  <h3>Tools</h3>
                  <PaintToolsSidebar
                    tool={tool}
                    onToolChange={setTool}
                    brushSize={brushSize}
                    onBrushSizeChange={setBrushSize}
                    color={color}
                    onColorChange={setColor}
                    onUndo={() => {}}
                    onRedo={() => {}}
                    onClear={() => {}}
                    canUndo={undoStack.length > 1}
                    canRedo={redoStack.length > 0}
                    tools={tools}
                  />
                </div>
              )}
              
              {mode === 'photo' && image && (
                <div className="sidebar-section">
                  <h3>Photo Controls</h3>
                  <div className="photo-controls-compact">
                    <p>Photo editing controls will be here</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="editor-container">
              {mode === 'paint' ? (
                <PaintCanvas
                  image={image}
                  onCanvasUpdate={handleCanvasUpdate}
                  onError={handleError}
                  canvasSize={canvasSize}
                  tool={tool}
                  brushSize={brushSize}
                  color={color}
                  zoom={zoom}
                  onUndoRedoUpdate={(undo, redo) => {
                    setUndoStack(undo)
                    setRedoStack(redo)
                  }}
                />
              ) : (
                <PhotoEditor
                  image={image}
                  onCanvasUpdate={handleCanvasUpdate}
                  onError={handleError}
                  canvasSize={canvasSize}
                  zoom={zoom}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {showCanvasSettings && (
        <CanvasSettings
          currentSize={canvasSize}
          onCreateCanvas={handleNewCanvas}
          onCancel={() => setShowCanvasSettings(false)}
        />
      )}

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}