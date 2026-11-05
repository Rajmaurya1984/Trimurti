import { useId, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { NAV_MENU, PROJECT } from '../../data/project.js'
import './VerticalBracketMenu.css'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const menuButton = useRef(null)
  return <header className="tm-header">
    {menuOpen && <button type="button" className="tm-menu-backdrop" aria-label="Close navigation menu" tabIndex={-1} onClick={() => setMenuOpen(false)} />}
    <div className={'menu-fixed-wrapper' + (menuOpen ? ' is-menu-open' : '')}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false)
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' && menuOpen) {
          event.preventDefault()
          event.stopPropagation()
          setMenuOpen(false)
          menuButton.current?.focus()
        }
      }}>
      <button ref={menuButton} type="button" className="tm-mobile-menu-toggle"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen} aria-controls={menuId}
        onClick={() => setMenuOpen(open => !open)}>
        <span className="tm-menu-icon" aria-hidden="true"><i /><i /><i /></span>
      </button>
      <nav id={menuId} aria-label="Main navigation" className="bracket-micro-nav">
        <ul className="nav-links-list">
          {NAV_MENU.map(item => <li key={item.to}>
            <NavLink onClick={() => setMenuOpen(false)} end={item.to === '/'} to={item.to}
              className={({ isActive }) => `nav-item-link${isActive ? ' current-active' : ''}`}>
              {item.label}
            </NavLink>
          </li>)}
        </ul>
      </nav>
    </div>
    <Link to="/" className="tm-brand" aria-label={PROJECT.name + ' home'}>
      {PROJECT.logo ? <img src={PROJECT.logo} alt={PROJECT.name} /> : <span>{PROJECT.name}<small>AN ADDRESS BEYOND ARRIVAL</small></span>}
    </Link>
  </header>
}