import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import { auth, loadProgress, updateStreak } from '../lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    return auth.onAuthStateChanged(async u => {
      setUser(u)
      setLoading(false)
      if (u) {
        const prog = await loadProgress(u.uid)
        setCompleted(prog)
        const s = await updateStreak(u.uid)
        setStreak(s)
      }
    })
  }, [])

  const refreshProgress = async () => {
    if (auth.currentUser) {
      const prog = await loadProgress(auth.currentUser.uid)
      setCompleted(prog)
    }
  }

  return { user, loading, completed, streak, refreshProgress }
}
