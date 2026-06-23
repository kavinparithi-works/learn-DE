import { useState } from 'react'
import { signInGoogle, signInEmail } from '../lib/firebase'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AuthModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInGoogle()
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async () => {
    if (!email || !password) { setError('Enter email and password'); return }
    setLoading(true)
    setError('')
    try {
      await signInEmail(email, password)
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Welcome back</div>
        <div className="modal-sub">Sign in to track progress and streaks.</div>

        <button className="modal-btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8h11.7C34.2 33 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/>
          </svg>
          Continue with Google
        </button>

        <div className="modal-divider">or</div>
        <div className="modal-error">{error}</div>
        <input className="modal-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}/>
        <input className="modal-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>
        <button className="modal-btn-primary" onClick={handleEmail} disabled={loading}>
          {loading ? 'Please wait...' : 'Sign In / Create Account'}
        </button>
      </div>
    </div>
  )
}
