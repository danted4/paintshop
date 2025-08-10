import { useState, useRef, useEffect, useCallback } from 'preact/hooks'
import { debounce } from '../utils/performance'
import { createErrorHandler, withErrorBoundary } from '../utils/errorHandler'
import './PhotoEditor.css'

export function PhotoEditor({ image, onCanvasUpdate, onError, canvasSize = { width: 800, height: 600 }, zoom = 1 }) {
  const canvasRef = useRef()
  const originalImageRef = useRef()
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0
  })
  
  const errorHandler = createErrorHandler(onError)
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    active: false
  })
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

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
    [filters, rotation, scale]
  )

  useEffect(() => {
    debouncedApplyFilters()
  }, [filters, rotation, scale, debouncedApplyFilters])

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
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `blur(${filters.blur}px)`,
      `hue-rotate(${filters.hue}deg)`
    ].join(' ')
    
    ctx.filter = filterString
    ctx.drawImage(originalImageRef.current, 0, 0)
    
    ctx.restore()
    ctx.filter = 'none'
  }

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hue: 0
    })
    setRotation(0)
    setScale(1)
  }

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const rotateImage = (degrees) => {
    setRotation(prev => (prev + degrees) % 360)
  }

  const flipImage = (direction) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    ctx.save()
    
    if (direction === 'horizontal') {
      ctx.scale(-1, 1)
      ctx.drawImage(canvas, -canvas.width, 0)
    } else {
      ctx.scale(1, -1)
      ctx.drawImage(canvas, 0, -canvas.height)
    }
    
    ctx.restore()
    
    // Update original image reference with flipped result
    const flippedImage = new Image()
    flippedImage.onload = () => {
      originalImageRef.current = flippedImage
      applyFilters()
      saveCanvasState()
    }
    flippedImage.src = canvas.toDataURL()
  }

  const startCrop = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
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

  return (
    <div className="photo-editor">
      {!image && (
        <div className="no-image-message">
          <p>📷 Load an image to use photo editing features</p>
        </div>
      )}
      <div className="canvas-container">
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            onMouseDown={startCrop}
            onMouseMove={updateCrop}
            onMouseUp={finishCrop}
            className="photo-canvas"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          />
          {crop.active && (
            <div
              className="crop-overlay"
              style={{
                left: `${Math.min(crop.x, crop.x + crop.width) * zoom}px`,
                top: `${Math.min(crop.y, crop.y + crop.height) * zoom}px`,
                width: `${Math.abs(crop.width) * zoom}px`,
                height: `${Math.abs(crop.height) * zoom}px`,
                transform: `scale(1)`,
                transformOrigin: 'top left'
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}