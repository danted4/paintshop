import { useTheme } from '../contexts/ThemeContext'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }

  return (
    <div className="theme-toggle">
      <select 
        value={theme} 
        onChange={handleThemeChange}
        className="theme-select"
        title="Theme selection"
      >
        <option value="system">🌓 System</option>
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
      </select>
      <div className="tooltip">
        Theme: {theme === 'system' ? `System (${resolvedTheme})` : theme}
      </div>
    </div>
  )
}