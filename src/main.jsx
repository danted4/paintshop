import { render } from 'preact'
import { App } from './app.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>, 
  document.getElementById('app')
)