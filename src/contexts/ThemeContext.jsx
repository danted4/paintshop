import { createContext } from 'preact'
import { useContext, useState, useEffect } from 'preact/hooks'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, fallback to system preference
    const saved = localStorage.getItem('paintshop-theme')
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved
    }
    return 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState('light')

  // Get system theme preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Update resolved theme when theme changes or system preference changes
  useEffect(() => {
    const updateResolvedTheme = () => {
      const newResolvedTheme = theme === 'system' ? getSystemTheme() : theme
      setResolvedTheme(newResolvedTheme)
      
      // Update document class
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(newResolvedTheme)
      
      // Update document attribute for CSS
      document.documentElement.setAttribute('data-theme', newResolvedTheme)
    }

    updateResolvedTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('paintshop-theme', theme)
  }, [theme])

  const setThemeMode = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setTheme(newTheme)
    }
  }

  const value = {
    theme,
    resolvedTheme,
    setTheme: setThemeMode,
    toggleTheme: () => {
      setThemeMode(resolvedTheme === 'light' ? 'dark' : 'light')
    }
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}