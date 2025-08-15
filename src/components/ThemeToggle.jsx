import { useTheme } from '../contexts/ThemeContext'
import './ThemeToggle.css'

export function ThemeToggle({ mobileMode = false }) {
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
        <option value="system">{mobileMode ? '🌓' : '🌓 System'}</option>
        <option value="light">{mobileMode ? '☀️' : '☀️ Light'}</option>
        <option value="dark">{mobileMode ? '🌙' : '🌙 Dark'}</option>
      </select>
      <div className="tooltip">
        Theme: {theme === 'system' ? `System (${resolvedTheme})` : theme}
      </div>
    </div>
  )
}