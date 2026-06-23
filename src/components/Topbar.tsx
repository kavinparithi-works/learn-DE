import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { User } from 'firebase/auth'
import { signOut } from '../lib/firebase'

const NAV_LINKS = [
  { label: 'Foundations', path: '/foundations', color: '#4f8ef7', dot: '#bfdbfe' },
  { label: 'SQL',         path: '/sql',         color: '#f59e0b', dot: '#fde68a' },
  { label: 'Python',      path: '/python',      color: '#3b82f6', dot: '#bfdbfe' },
  { label: 'Azure',       path: '/azure',       color: '#0078d4', dot: '#bae6fd' },
  { label: 'Spark',       path: '/spark',       color: '#f97316', dot: '#fed7aa' },
  { label: 'Delta Lake',  path: '/delta',       color: '#ef4444', dot: '#fecaca' },
  { label: 'Airflow',     path: '/airflow',     color: '#00ad46', dot: '#bbf7d0' },
  { label: 'Production',  path: '/production',  color: '#8b5cf6', dot: '#ddd6fe' },
  { label: 'Interview',   path: '/interview',   color: '#ec4899', dot: '#fbcfe8' },
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
        {NAV_LINKS.map(({ label, path, color, dot }) => (
          <NavLink key={path} to={path}
            className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <span style={{ display:'flex',alignItems:'center',gap:5 }}>
                <span style={{
                  width:7,height:7,borderRadius:'50%',flexShrink:0,
                  background: isActive ? color : dot,
                  boxShadow: isActive ? `0 0 6px ${color}80` : 'none',
                  transition:'all 180ms ease',
                }} />
                <span style={{ color: isActive ? color : undefined }}>{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mobile */}
      <div className="topbar-mobile-nav" style={{ position: 'relative' }}>
        <button className="topbar-mobile-btn" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? '✕' : '☰'} Menu
        </button>
        {mobileOpen && (
          <div className="topbar-mobile-dropdown">
            {NAV_LINKS.map(({ label, path, color }) => (
              <NavLink key={path} to={path}
                className={({ isActive }) => isActive ? 'active' : ''}
                style={{ textDecoration: 'none' }}
                onClick={() => setMobileOpen(false)}
              >
                {({ isActive }) => (
                  <span style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{
                      width:8,height:8,borderRadius:'50%',
                      background:color,
                      boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                      flexShrink:0,
                    }} />
                    {label}
                  </span>
                )}
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
              style={{
                background:'none',border:'none',color:'var(--text-4)',
                cursor:'pointer',fontSize:'11px',marginLeft:'2px',
                fontFamily:'var(--font-sans)',
              }}
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
