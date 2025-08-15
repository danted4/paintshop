import { useState, useRef, useEffect, useCallback } from 'preact/hooks'
import { Toolbar } from './Toolbar'
import { throttle, createOptimizedCanvas } from '../utils/performance'
import { createErrorHandler, withErrorBoundary } from '../utils/errorHandler'
import './PaintCanvas.css'

import { forwardRef, useImperativeHandle } from 'preact/compat'

export const PaintCanvas = forwardRef(function PaintCanvas({ 
  image, 
  onCanvasUpdate, 
  onError, 
  canvasSize = { width: 800, height: 600 },
  tool = 'brush',
  brushSize = 5,
  color = '#000000',
  zoom = 1,
  onUndoRedoUpdate
}, ref) {
  useImperativeHandle(ref, () => ({
    undo,
    redo,
    clearCanvas
  }))
  const canvasRef = useRef()
  const [isDrawing, setIsDrawing] = useState(false)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [startPos, setStartPos] = useState(null)
  const [tempCanvas, setTempCanvas] = useState(null)
  const [isAddingText, setIsAddingText] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState(null)

  const errorHandler = createErrorHandler(onError)

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

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (image) {
        canvas.width = image.width
        canvas.height = image.height
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0)
      } else {
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      
      saveCanvasState()
    }
  }, [image, canvasSize])

  const saveCanvasState = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const imageData = canvas.toDataURL()
      const newUndoStack = [...undoStack, imageData].slice(-20)
      setUndoStack(newUndoStack)
      setRedoStack([])
      onCanvasUpdate?.(canvas)
      onUndoRedoUpdate?.(newUndoStack, [])
    }
  }

const undo = () => {
  if (undoStack.length > 1) {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const currentState = undoStack[undoStack.length - 1]
    const previousState = undoStack[undoStack.length - 2]
    const newRedoStack = [...redoStack, currentState]
    const newUndoStack = undoStack.slice(0, -1)
    setRedoStack(newRedoStack)
    setUndoStack(newUndoStack)
    onUndoRedoUpdate?.(newUndoStack, newRedoStack)
    const img = new window.Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
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
    const newUndoStack = [...undoStack, stateToRestore]
    const newRedoStack = redoStack.slice(0, -1)
    setUndoStack(newUndoStack)
    setRedoStack(newRedoStack)
    onUndoRedoUpdate?.(newUndoStack, newRedoStack)
    const img = new window.Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      onCanvasUpdate?.(canvas)
    }
    img.src = stateToRestore
  }
}

  const getMousePos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    }
  }

  const floodFill = (ctx, x, y, fillColor, targetColor) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const data = imageData.data
    const stack = [[Math.floor(x), Math.floor(y)]]
    const visited = new Set()
    
    const colorMatch = (pixel) => {
      const r = data[pixel]
      const g = data[pixel + 1]
      const b = data[pixel + 2]
      const a = data[pixel + 3]
      
      return r === targetColor.r && g === targetColor.g && 
             b === targetColor.b && a === targetColor.a
    }
    
    const fillR = parseInt(fillColor.substr(1, 2), 16)
    const fillG = parseInt(fillColor.substr(3, 2), 16)
    const fillB = parseInt(fillColor.substr(5, 2), 16)
    
    while (stack.length > 0) {
      const [px, py] = stack.pop()
      const key = `${px},${py}`
      
      if (visited.has(key) || px < 0 || px >= ctx.canvas.width || 
          py < 0 || py >= ctx.canvas.height) continue
      
      visited.add(key)
      const pixelIndex = (py * ctx.canvas.width + px) * 4
      
      if (!colorMatch(pixelIndex)) continue
      
      data[pixelIndex] = fillR
      data[pixelIndex + 1] = fillG
      data[pixelIndex + 2] = fillB
      data[pixelIndex + 3] = 255
      
      stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1])
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  const startDrawing = (e) => {
    // Don't start drawing if we're currently adding text
    if (isAddingText) {
      return
    }
    
    const pos = getMousePos(e)
    setIsDrawing(true)
    setStartPos(pos)
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (tool === 'fill') {
      const imageData = ctx.getImageData(pos.x, pos.y, 1, 1)
      const targetColor = {
        r: imageData.data[0],
        g: imageData.data[1],
        b: imageData.data[2],
        a: imageData.data[3]
      }
      
      floodFill(ctx, pos.x, pos.y, color, targetColor)
      saveCanvasState()
      setIsDrawing(false)
      return
    }
    
    if (tool === 'text') {
      setTextPosition(pos)
      setIsAddingText(true)
      setIsDrawing(false)
      return
    }
    
    if (['rectangle', 'ellipse', 'line'].includes(tool)) {
      const tempCanvasEl = document.createElement('canvas')
      tempCanvasEl.width = canvas.width
      tempCanvasEl.height = canvas.height
      const tempCtx = tempCanvasEl.getContext('2d')
      tempCtx.drawImage(canvas, 0, 0)
      setTempCanvas(tempCanvasEl)
      return
    }
    
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (tool === 'pencil') {
      ctx.globalAlpha = 1
    } else {
      ctx.globalAlpha = tool === 'eraser' ? 1 : 0.8
    }
    
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const drawInternal = useCallback((e) => {
    if (!isDrawing) return
    
    try {
      const pos = getMousePos(e)
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (['rectangle', 'ellipse', 'line'].includes(tool)) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(tempCanvas, 0, 0)
        
        ctx.strokeStyle = color
        ctx.lineWidth = brushSize
        ctx.globalCompositeOperation = 'source-over'
        
        if (tool === 'rectangle') {
          const width = pos.x - startPos.x
          const height = pos.y - startPos.y
          ctx.strokeRect(startPos.x, startPos.y, width, height)
        } else if (tool === 'ellipse') {
          const radiusX = Math.abs(pos.x - startPos.x)
          const radiusY = Math.abs(pos.y - startPos.y)
          const centerX = (startPos.x + pos.x) / 2
          const centerY = (startPos.y + pos.y) / 2
          
          ctx.beginPath()
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
          ctx.stroke()
        } else if (tool === 'line') {
          ctx.beginPath()
          ctx.moveTo(startPos.x, startPos.y)
          ctx.lineTo(pos.x, pos.y)
          ctx.stroke()
        }
        return
      }
      
      if (['brush', 'pencil', 'eraser'].includes(tool)) {
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      }
    } catch (error) {
      errorHandler(error, 'Drawing')
    }
  }, [isDrawing, tool, color, brushSize, startPos, tempCanvas])

  const draw = useCallback(throttle(drawInternal, 16), [drawInternal]) // ~60fps

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setTempCanvas(null)
      saveCanvasState()
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (image) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    
    saveCanvasState()
  }

  const addText = (text) => {
    if (!text.trim() || !textPosition) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = color
    ctx.font = `${brushSize * 4}px Arial, sans-serif`
    ctx.textBaseline = 'top'
    
    ctx.fillText(text, textPosition.x, textPosition.y)
    
    setIsAddingText(false)
    setTextInput('')
    setTextPosition(null)
    saveCanvasState()
  }

  const cancelText = () => {
    setIsAddingText(false)
    setTextInput('')
    setTextPosition(null)
  }

  return (
    <div className="paint-canvas">
      <div className="canvas-container">
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="paint-canvas-element"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          />
          {isAddingText && (
            <div 
              className="text-input-overlay"
              style={{
                position: 'absolute',
                left: `${textPosition.x * zoom}px`,
                top: `${textPosition.y * zoom}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left'
              }}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addText(textInput)
                  } else if (e.key === 'Escape') {
                    cancelText()
                  }
                }}
                onBlur={() => {
                  // Small delay to prevent canvas click from interfering
                  setTimeout(() => {
                    if (textInput.trim()) {
                      addText(textInput)
                    } else {
                      cancelText()
                    }
                  }, 10)
                }}
                autoFocus
                placeholder="Type your text..."
                style={{
                  fontSize: `${brushSize * 4}px`,
                  color: color,
                  background: 'transparent',
                  border: '2px dashed #999',
                  outline: 'none',
                  padding: '2px',
                  fontFamily: 'Arial, sans-serif',
                  minWidth: '100px'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})