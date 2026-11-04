import { Link, NavLink } from 'react-router-dom'
import { NAV_MENU, PROJECT } from '../../data/project.js'
import './VerticalBracketMenu.css'

export default function SiteHeader() {
  return <header className="tm-header">
    <div className="menu-fixed-wrapper">
      <nav id="tm-navigation" aria-label="Main navigation" className="bracket-micro-nav">
        <ul className="nav-links-list">
          {NAV_MENU.map(item => <li key={item.to}>
            <NavLink end={item.to === '/'} to={item.to}
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