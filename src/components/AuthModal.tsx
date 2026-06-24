import { useState } from 'react'
import { signInGoogle, signInEmail } from '../lib/firebase'

interface Props {
  open: boolean
  onClose: () => void
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':     return 'Incorrect password. Please try again.'
    case 'auth/google-only':            return 'This email is linked to Google. Use "Continue with Google" to sign in.'
    case 'auth/user-not-found':         return 'No account found with this email. Try creating one.'
    case 'auth/email-already-in-use':   return 'An account already exists with this email. Try signing in.'
    case 'auth/invalid-email':          return 'Please enter a valid email address.'
    case 'auth/weak-password':          return 'Password must be at least 6 characters.'
    case 'auth/too-many-requests':      return 'Too many attempts. Please wait a few minutes and try again.'
    case 'auth/network-request-failed': return 'Network error. Check your connection and try again.'
    case 'auth/popup-closed-by-user':   return 'Sign-in popup was closed. Please try again.'
    case 'auth/cancelled-popup-request': return ''
    default:                            return 'Something went wrong. Please try again.'
  }
}

export default function AuthModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = (t: 'signin' | 'signup') => {
    setTab(t)
    setError('')
    setEmail('')
    setPassword('')
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInGoogle()
      onClose()
    } catch (e: any) {
      const msg = friendlyError(e.code)
      if (msg) setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')
    try {
      await signInEmail(email, password)
      onClose()
    } catch (e: any) {
      setError(friendlyError(e.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`modal-overlay${open ? ' open' : ''}`}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-title">{tab === 'signin' ? 'Welcome back' : 'Create account'}</div>
        <div className="modal-sub">
          {tab === 'signin' ? 'Sign in to track progress and streaks.' : 'Join to track your learning journey.'}
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          background: 'rgba(99,102,241,.07)', borderRadius: 12, padding: 4,
        }}>
          {(['signin', 'signup'] as const).map(t => (
            <button
              key={t}
              onClick={() => reset(t)}
              style={{
                flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                borderRadius: 9, fontFamily: 'var(--font-sans)', fontWeight: 700,
                fontSize: '.83rem', transition: 'all .18s ease',
                background: tab === t ? 'white' : 'transparent',
                color: tab === t ? '#4f46e5' : '#7068a0',
                boxShadow: tab === t ? '0 1px 6px rgba(99,102,241,.15)' : 'none',
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <button className="modal-btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8h11.7C34.2 33 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/>
          </svg>
          Continue with Google
        </button>

        <div className="modal-divider">or</div>
        <div className="modal-error">{error}</div>

        <input
          className="modal-input" type="email" placeholder="Email address"
          value={email} onChange={e => { setEmail(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleEmail()}
        />
        <input
          className="modal-input" type="password" placeholder="Password (min 6 characters)"
          value={password} onChange={e => { setPassword(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleEmail()}
        />

        <button className="modal-btn-primary" onClick={handleEmail} disabled={loading}>
          {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        <div style={{
          textAlign: 'center', marginTop: 14,
          fontSize: '.78rem', color: '#7068a0',
        }}>
          {tab === 'signin' ? (
            <>Don't have an account?{' '}
              <button onClick={() => reset('signup')} style={{
                background: 'none', border: 'none', color: '#6366f1',
                cursor: 'pointer', fontWeight: 700, fontSize: 'inherit',
                fontFamily: 'var(--font-sans)',
              }}>Sign up</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => reset('signin')} style={{
                background: 'none', border: 'none', color: '#6366f1',
                cursor: 'pointer', fontWeight: 700, fontSize: 'inherit',
                fontFamily: 'var(--font-sans)',
              }}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
