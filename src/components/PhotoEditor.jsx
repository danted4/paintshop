import { useRef, useEffect, useCallback, useImperativeHandle } from 'preact/hooks'
import { forwardRef } from 'preact/compat'
import { debounce } from '../utils/performance'
import { createErrorHandler, withErrorBoundary } from '../utils/errorHandler'
import './PhotoEditor.css'

const PhotoEditor = forwardRef(({
  image,
  onCanvasUpdate,
  onError,
  canvasSize = { width: 800, height: 600 },
  zoom = 1,
  controls,
  setControls,
  onResetFilters,
  onRotateImage,
  onFlipImage,
  onScale,
  onApplyCrop,
  onCancelCrop,
  onUndo,
  onRedo,
  crop,
  setCrop,
  isDragging,
  setIsDragging,
  dragStart,
  setDragStart,
  rotation,
  setRotation,
  scale,
  setScale,
  undoStack,
  setUndoStack,
  redoStack,
  setRedoStack
}, ref) => {
  // Expose imperative methods for App to call
  useImperativeHandle(ref, () => ({
    flipImage,
    applyCrop,
    undo,
    redo
  }))
  const canvasRef = useRef()
  const originalImageRef = useRef()
  // All state is now lifted to App and passed as props
  
  const errorHandler = createErrorHandler(onError)
  // ...existing code...

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (image) {
        canvas.width = image.width
        canvas.height = image.height
        originalImageRef.current = image
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0)
      } else {
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        originalImageRef.current = null
      }
      saveCanvasState()
    }
  }, [image, canvasSize])

  const debouncedApplyFilters = useCallback(
    debounce(() => {
      try {
        applyFilters()
      } catch (error) {
        errorHandler(error, 'Filter Application')
      }
    }, 100),
    [controls, rotation, scale]
  )

  useEffect(() => {
    debouncedApplyFilters()
  }, [controls, rotation, scale, debouncedApplyFilters])

  const saveCanvasState = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const imageData = canvas.toDataURL()
      setUndoStack(prev => [...prev, imageData].slice(-20))
      setRedoStack([])
      onCanvasUpdate?.(canvas)
    }
  }

  const applyFilters = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (!originalImageRef.current) {
      // For blank canvas, just fill with white
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }
    
    // Apply transformations
    ctx.save()
    
    if (rotation !== 0 || scale !== 1) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scale, scale)
      ctx.translate(-centerX, -centerY)
    }
    
    // Apply filters
    const filterString = [
      `brightness(${controls.brightness}%)`,
      `contrast(${controls.contrast}%)`,
      `saturate(${controls.saturation}%)`,
      `blur(${controls.blur}px)`,
      `hue-rotate(${controls.hue}deg)`
    ].join(' ')
    
    ctx.filter = filterString
    ctx.drawImage(originalImageRef.current, 0, 0)
    
    ctx.restore()
    ctx.filter = 'none'
  }


  // Crop handlers for canvas events
  const handleStartCrop = (e) => startCrop(e)
  const handleUpdateCrop = (e) => updateCrop(e)
  const handleFinishCrop = () => finishCrop()

  const flipImage = (direction) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!originalImageRef.current) return

    // Create a temp canvas to flip the original image only
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')

    tempCtx.save()
    if (direction === 'horizontal') {
      tempCtx.translate(tempCanvas.width, 0)
      tempCtx.scale(-1, 1)
    } else {
      tempCtx.translate(0, tempCanvas.height)
      tempCtx.scale(1, -1)
    }
    tempCtx.drawImage(originalImageRef.current, 0, 0)
    tempCtx.restore()

    // Update original image reference with flipped result
    const flippedImage = new window.Image()
    flippedImage.onload = () => {
      originalImageRef.current = flippedImage
      applyFilters()
      saveCanvasState()
    }
    flippedImage.src = tempCanvas.toDataURL()
  }

  const startCrop = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    // Use unscaled mouse position relative to canvas
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom
    setIsDragging(true)
    setDragStart({ x, y })
    setCrop({
      x,
      y,
      width: 0,
      height: 0,
      active: true
    })
  }

  const updateCrop = (e) => {
    if (!isDragging) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const currentX = (e.clientX - rect.left) / zoom
    const currentY = (e.clientY - rect.top) / zoom
    setCrop(prev => ({
      ...prev,
      width: currentX - dragStart.x,
      height: currentY - dragStart.y
    }))
  }

  const finishCrop = () => {
    setIsDragging(false)
    
    if (Math.abs(crop.width) < 10 || Math.abs(crop.height) < 10) {
      setCrop(prev => ({ ...prev, active: false }))
      return
    }
  }

  const applyCrop = () => {
    if (!crop.active) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    const cropX = Math.min(crop.x, crop.x + crop.width)
    const cropY = Math.min(crop.y, crop.y + crop.height)
    const cropWidth = Math.abs(crop.width)
    const cropHeight = Math.abs(crop.height)
    
    const imageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight)
    
    canvas.width = cropWidth
    canvas.height = cropHeight
    
    ctx.putImageData(imageData, 0, 0)
    
    // Update original image reference
    const croppedImage = new Image()
    croppedImage.onload = () => {
      originalImageRef.current = croppedImage
      setCrop(prev => ({ ...prev, active: false }))
      saveCanvasState()
    }
    croppedImage.src = canvas.toDataURL()
  }

  const cancelCrop = () => {
    setCrop(prev => ({ ...prev, active: false }))
  }

  const undo = () => {
    if (undoStack.length > 1) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      const currentState = undoStack[undoStack.length - 1]
      const previousState = undoStack[undoStack.length - 2]
      
      setRedoStack(prev => [...prev, currentState])
      setUndoStack(prev => prev.slice(0, -1))
      
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        originalImageRef.current = img
        onCanvasUpdate?.(canvas)
      }
      img.src = previousState
    }
  }

  const redo = () => {
    if (redoStack.length > 0) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      const stateToRestore = redoStack[redoStack.length - 1]
      setUndoStack(prev => [...prev, stateToRestore])
      setRedoStack(prev => prev.slice(0, -1))
      
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        originalImageRef.current = img
        onCanvasUpdate?.(canvas)
      }
      img.src = stateToRestore
    }
  }
// Only render canvas and notification
  return (
    <div className="photo-editor">
      {!image && (
        <div className="no-image-message">
          <p>📷 Load an image to use photo editing features</p>
        </div>
      )}
      {image && (
        <div className="canvas-container">
          <div
            className="canvas-wrapper"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleStartCrop}
              onMouseMove={handleUpdateCrop}
              onMouseUp={handleFinishCrop}
              className="photo-canvas"
            />
            {crop.active && (
              <div
                className="crop-overlay"
                style={{
                  left: `${Math.min(crop.x, crop.x + crop.width)}px`,
                  top: `${Math.min(crop.y, crop.y + crop.height)}px`,
                  width: `${Math.abs(crop.width)}px`,
                  height: `${Math.abs(crop.height)}px`
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
})

// Controls subcomponent for sidebar
const PhotoControls = ({
  controls,
  setControls,
  onResetFilters,
  onRotateImage,
  onFlipImage,
  onScale,
  onApplyCrop,
  onCancelCrop,
  onUndo,
  onRedo,
  crop
}) => (
  <div className="photo-controls-panel sidebar-photo-controls">
    <div className="filter-controls">
      <label>Brightness
        <input type="range" min="0" max="200" value={controls.brightness} onInput={e => setControls(c => ({ ...c, brightness: parseInt(e.target.value) }))} />
      </label>
      <label>Contrast
        <input type="range" min="0" max="200" value={controls.contrast} onInput={e => setControls(c => ({ ...c, contrast: parseInt(e.target.value) }))} />
      </label>
      <label>Saturation
        <input type="range" min="0" max="200" value={controls.saturation} onInput={e => setControls(c => ({ ...c, saturation: parseInt(e.target.value) }))} />
      </label>
      <label>Blur
        <input type="range" min="0" max="20" value={controls.blur} onInput={e => setControls(c => ({ ...c, blur: parseInt(e.target.value) }))} />
      </label>
      <label>Hue
        <input type="range" min="-180" max="180" value={controls.hue} onInput={e => setControls(c => ({ ...c, hue: parseInt(e.target.value) }))} />
      </label>
      <button onClick={() => setControls({ brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0 })}>Reset Filters</button>
    </div>
    <div className="transform-controls">
      <button onClick={() => onRotateImage(90)}>Rotate +90°</button>
      <button onClick={() => onRotateImage(-90)}>Rotate -90°</button>
      <button onClick={() => onFlipImage('horizontal')}>Flip Horizontal</button>
      <button onClick={() => onFlipImage('vertical')}>Flip Vertical</button>
      <button onClick={() => onScale('out')}>Scale -</button>
      <button onClick={() => onScale('in')}>Scale +</button>
    </div>
    <div className="crop-controls">
      <button onClick={onApplyCrop} disabled={!crop.active}>Apply Crop</button>
      <button onClick={onCancelCrop} disabled={!crop.active}>Cancel Crop</button>
    </div>
    <div className="history-controls">
      <button onClick={onUndo}>Undo</button>
      <button onClick={onRedo}>Redo</button>
    </div>
  </div>
)

export { PhotoEditor, PhotoControls }