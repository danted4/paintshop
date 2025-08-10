export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

export const ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  INVALID_IMAGE: 'INVALID_IMAGE',
  CANVAS_ERROR: 'CANVAS_ERROR',
  MEMORY_ERROR: 'MEMORY_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
}

export const createErrorHandler = (onError) => {
  return (error, context = '') => {
    console.error(`[${context}] Error:`, error)
    
    let userMessage = 'An unexpected error occurred.'
    
    if (error instanceof AppError) {
      userMessage = error.message
    } else if (error.name === 'QuotaExceededError') {
      userMessage = 'Not enough memory available. Try using a smaller image.'
    } else if (error.message.includes('canvas')) {
      userMessage = 'Canvas operation failed. Please try again.'
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      userMessage = 'Network error. Please check your connection and try again.'
    }
    
    onError(userMessage)
  }
}

export const withErrorBoundary = (asyncFunction, errorHandler) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args)
    } catch (error) {
      errorHandler(error, asyncFunction.name)
      throw error
    }
  }
}

export const validateFileSize = (file, maxSize = 10 * 1024 * 1024) => {
  if (file.size > maxSize) {
    throw new AppError(
      `File size too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`,
      ERROR_CODES.FILE_TOO_LARGE,
      { fileSize: file.size, maxSize }
    )
  }
}

export const validateImageType = (file) => {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!supportedTypes.includes(file.type)) {
    throw new AppError(
      'Unsupported file format. Please use JPEG, PNG, GIF, or WebP.',
      ERROR_CODES.UNSUPPORTED_FORMAT,
      { fileType: file.type, supportedTypes }
    )
  }
}

export const logError = (error, context = '') => {
  const errorData = {
    message: error.message,
    code: error.code || 'UNKNOWN',
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  // In a real app, you would send this to a logging service
  console.error('Error logged:', errorData)
}