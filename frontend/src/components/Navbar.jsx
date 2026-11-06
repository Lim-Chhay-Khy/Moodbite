import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

// `matches` lists the paths that should highlight each link, so
// "Discover" stays highlighted on every page of the question flow.
// Login comes back in Stage 4.
const LINKS = [
  { label: 'Home', to: '/', matches: ['/'] },
  {
    label: 'Discover',
    to: '/mood',
    matches: ['/mood', '/preferences', '/choice', '/recommendations', '/recipe', '/restaurants'],
  },
  { label: 'Favorites', to: '/favorites', matches: ['/favorites'] },
  { label: 'About', to: '/about', matches: ['/about'] },
]

function isActive(link, pathname) {
  if (link.to === '/') return pathname === '/'
  return link.matches.some((path) => pathname.startsWith(path))
}

export default function Navbar() {
  const location = useLocation()

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          MoodBite
        </Link>
        <nav className="navbar__links">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`navbar__link${isActive(link, location.pathname) ? ' navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
