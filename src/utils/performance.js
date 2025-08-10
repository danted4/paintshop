export const throttle = (func, delay) => {
  let timeoutId
  let lastExecTime = 0
  return (...args) => {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const createOptimizedCanvas = (width, height) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', {
    alpha: true,
    willReadFrequently: false,
    desynchronized: true
  })
  
  canvas.width = width
  canvas.height = height
  
  // Optimize for high DPI displays
  const ratio = window.devicePixelRatio || 1
  if (ratio > 1) {
    canvas.width = width * ratio
    canvas.height = height * ratio
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    ctx.scale(ratio, ratio)
  }
  
  return { canvas, ctx }
}

export const compressImage = (canvas, maxWidth = 1920, maxHeight = 1080, quality = 0.9) => {
  if (canvas.width <= maxWidth && canvas.height <= maxHeight) {
    return canvas
  }
  
  const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height)
  const newWidth = canvas.width * ratio
  const newHeight = canvas.height * ratio
  
  const { canvas: compressedCanvas, ctx } = createOptimizedCanvas(newWidth, newHeight)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(canvas, 0, 0, newWidth, newHeight)
  
  return compressedCanvas
}

export const validateImageDimensions = (image, maxWidth = 4096, maxHeight = 4096) => {
  if (image.width > maxWidth || image.height > maxHeight) {
    throw new Error(`Image dimensions too large. Maximum size is ${maxWidth}x${maxHeight}px`)
  }
  return true
}

export const createImageThumbnail = (image, size = 200) => {
  const ratio = Math.min(size / image.width, size / image.height)
  const width = image.width * ratio
  const height = image.height * ratio
  
  const { canvas, ctx } = createOptimizedCanvas(width, height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, width, height)
  
  return canvas
}