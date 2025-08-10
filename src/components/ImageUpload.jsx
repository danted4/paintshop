import { useState, useRef } from 'preact/hooks'
import { validateFileSize, validateImageType, createErrorHandler, withErrorBoundary, AppError } from '../utils/errorHandler'
import { validateImageDimensions } from '../utils/performance'
import './ImageUpload.css'

export function ImageUpload({ onImageLoad, onError }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef()

  const errorHandler = createErrorHandler(onError)

  const loadImage = withErrorBoundary(async (file) => {
    try {
      validateFileSize(file)
      validateImageType(file)
    } catch (error) {
      errorHandler(error, 'File Validation')
      return
    }

    setIsLoading(true)
    
    try {
      const imageData = await readFileAsDataURL(file)
      const img = await loadImageFromDataURL(imageData)
      
      validateImageDimensions(img)
      
      setIsLoading(false)
      onImageLoad?.(img, file)
      
    } catch (error) {
      setIsLoading(false)
      errorHandler(error, 'Image Loading')
    }
  }, errorHandler)

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new AppError('Failed to read file. Please try again.'))
      reader.readAsDataURL(file)
    })
  }

  const loadImageFromDataURL = (dataURL) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new AppError('Invalid image file. Please try another file.'))
      img.src = dataURL
    })
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      loadImage(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      loadImage(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-upload">
      <div 
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading image...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <h3>Upload an Image</h3>
            <p>Drag and drop an image here, or click to select</p>
            <p className="supported-formats">Supports: JPEG, PNG, GIF, WebP (max 10MB)</p>
          </div>
        )}
      </div>
    </div>
  )
}