import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { User } from 'firebase/auth'
import { signOut } from '../lib/firebase'

const NAV_LINKS = [
  ['Foundations', '/foundations'],
  ['SQL', '/sql'],
  ['Python', '/python'],
  ['Azure', '/azure'],
  ['Spark', '/spark'],
  ['Delta Lake', '/delta'],
  ['Airflow', '/airflow'],
  ['Production', '/production'],
  ['Interview', '/interview'],
]

interface Props {
  user: User | null
  streak: number
  onSignInClick: () => void
}

export default function Topbar({ user, streak, onSignInClick }: Props) {
  const [signingOut, setSigningOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)


  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  return (
    <header className="topbar">
      <NavLink to="/" className="topbar-logo" style={{ textDecoration: 'none' }}>
        <div className="topbar-logo-icon">L</div>
        LearnWithMe
      </NavLink>

      <nav className="topbar-nav">
        {NAV_LINKS.map(([label, path]) => (
          <NavLink key={path} to={path}
            className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}
            style={{ textDecoration: 'none' }}>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="topbar-mobile-nav" style={{ position: 'relative' }}>
        <button className="topbar-mobile-btn" onClick={() => setMobileOpen(o => !o)}>
          ☰ Menu
        </button>
        {mobileOpen && (
          <div className="topbar-mobile-dropdown">
            {NAV_LINKS.map(([label, path]) => (
              <NavLink key={path} to={path}
                className={({ isActive }) => isActive ? 'active' : ''}
                style={{ textDecoration: 'none' }}
                onClick={() => setMobileOpen(false)}>
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-right">
        <div className="streak-badge">
          <span>🔥</span>
          <span>{streak} day streak</span>
        </div>

        {user ? (
          <div className="user-pill visible">
            <div className="user-avatar">
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="user-name">
              {user.displayName || user.email?.split('@')[0] || 'User'}
            </span>
            <button
              onClick={handleSignOut}
              style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: '11px', marginLeft: '2px' }}
            >
              {signingOut ? '...' : 'Sign out'}
            </button>
          </div>
        ) : (
          <button className="btn-signin" onClick={onSignInClick}>Sign In</button>
        )}
      </div>
    </header>
  )
}
