import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, serverTimestamp, increment } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAH3xQ74P7tGMNueJmOw1ty_ucufffa7VU",
  authDomain: "pyspark-sql-courses.firebaseapp.com",
  projectId: "pyspark-sql-courses",
  storageBucket: "pyspark-sql-courses.firebasestorage.app",
  messagingSenderId: "253980650849",
  appId: "1:253980650849:web:8c60f55f59122de49d6920"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

export async function signInGoogle() {
  if (auth.currentUser) await fbSignOut(auth)
  return signInWithPopup(auth, googleProvider)
}

export async function signInEmail(email: string, password: string) {
  if (auth.currentUser) await fbSignOut(auth)

  try {
    return await signInWithEmailAndPassword(auth, email, password)
  } catch (signInErr: unknown) {
    const code = (signInErr as { code?: string }).code

    if (code === 'auth/user-not-found') {
      return createUserWithEmailAndPassword(auth, email, password)
    }

    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      // Try creating — if email already in use it means account exists with Google
      try {
        return await createUserWithEmailAndPassword(auth, email, password)
      } catch (createErr: unknown) {
        const createCode = (createErr as { code?: string }).code
        if (createCode === 'auth/email-already-in-use') {
          // Account exists but password sign-in failed → must be Google-only
          const err: any = new Error('GOOGLE_ONLY')
          err.code = 'auth/google-only'
          throw err
        }
        throw createErr
      }
    }

    if (code === 'auth/email-already-in-use') {
      return await signInWithEmailAndPassword(auth, email, password)
    }

    throw signInErr
  }
}

export function signOut() {
  return fbSignOut(auth)
}

export async function markTopicComplete(topicId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Not signed in')
  await setDoc(
    doc(db, 'users', user.uid, 'progress', topicId),
    { status: 'completed', completedAt: serverTimestamp() },
    { merge: true }
  )
  await setDoc(doc(db, 'users', user.uid), { totalXP: increment(50) }, { merge: true })
}

export async function unmarkTopicComplete(topicId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Not signed in')
  await setDoc(
    doc(db, 'users', user.uid, 'progress', topicId),
    { status: 'incomplete' },
    { merge: true }
  )
  await setDoc(doc(db, 'users', user.uid), { totalXP: increment(-50) }, { merge: true })
}

export async function saveQuizScore(topicId: string, score: number, total: number) {
  const user = auth.currentUser
  if (!user) return
  const pct = Math.round((score / total) * 100)
  await setDoc(
    doc(db, 'users', user.uid, 'progress', topicId),
    { quizBestScore: pct, quizAttempts: increment(1) },
    { merge: true }
  )
  await setDoc(doc(db, 'users', user.uid), { totalXP: increment(score * 10) }, { merge: true })
  if (pct >= 80) await markTopicComplete(topicId)
}

export async function loadProgress(uid: string): Promise<Set<string>> {
  const snap = await getDocs(collection(db, 'users', uid, 'progress'))
  const completed = new Set<string>()
  snap.forEach(d => { if (d.data().status === 'completed') completed.add(d.id) })
  return completed
}

export async function updateStreak(uid: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  const data = snap.data() || {}
  const lastDate: string = data.lastStudyDate || ''
  const streak: number = data.currentStreak || 0
  const newStreak = lastDate === today ? streak : lastDate === yesterday ? streak + 1 : 1
  await setDoc(ref, { currentStreak: newStreak, lastStudyDate: today }, { merge: true })
  return newStreak
}
