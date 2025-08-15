import './HamburgerMenu.css'

export function HamburgerMenu({ isOpen, onToggle }) {
  return (
    <button 
      className={`hamburger-menu ${isOpen ? 'open' : ''}`}
      onClick={onToggle}
      aria-label="Toggle sidebar menu"
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  )
}