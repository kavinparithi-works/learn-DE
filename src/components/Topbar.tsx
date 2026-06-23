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
        <div className="topbar-logo-mark" aria-hidden="true">
          <svg className="topbar-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Hexagon base */}
            <path className="logo-hex" d="M20 3L35.5885 12V28L20 37L4.41154 28V12L20 3Z" fill="url(#lgrd)" />
            {/* Data flow lines */}
            <line className="logo-line logo-line-1" x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line className="logo-line logo-line-2" x1="16" y1="14" x2="24" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
            <line className="logo-line logo-line-3" x1="24" y1="14" x2="16" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
            {/* Center node */}
            <circle className="logo-node" cx="20" cy="20" r="4" fill="white" />
            {/* Orbit dots */}
            <circle className="logo-orbit-dot logo-orbit-a" cx="28" cy="20" r="2.5" fill="white" fillOpacity="0.9"/>
            <circle className="logo-orbit-dot logo-orbit-b" cx="14" cy="13" r="2" fill="white" fillOpacity="0.8"/>
            <circle className="logo-orbit-dot logo-orbit-c" cx="14" cy="27" r="2" fill="white" fillOpacity="0.8"/>
            <defs>
              <linearGradient id="lgrd" x1="4" y1="3" x2="36" y2="37" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4f8ef7"/>
                <stop offset=".5" stopColor="#8b5cf6"/>
                <stop offset="1" stopColor="#ec4899"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="topbar-logo-text">
          <span className="topbar-logo-brand">learn</span><span className="topbar-logo-accent">DE</span>
          <span className="topbar-logo-tagline">Data Engineering</span>
        </div>
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
