import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Topbar from './components/Topbar'
import AuthModal from './components/AuthModal'
import PageTransition from './components/PageTransition'
import { useAuth } from './hooks/useAuth'
import { useScrollReveal } from './hooks/useScrollReveal'
import Home from './pages/Home'
import Foundations from './pages/Foundations'
import SQL from './pages/SQL'
import Python from './pages/Python'
import Azure from './pages/Azure'
import Spark from './pages/Spark'
import Delta from './pages/Delta'
import Production from './pages/Production'
import Interview from './pages/Interview'
import Airflow from './pages/Airflow'
import './styles/globals.css'

function AppRoutes({ completed, refreshProgress }: { completed: Set<string>; refreshProgress: (id?: string) => void }) {
  const location = useLocation()
  useScrollReveal()
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Home completed={completed} />} />
        <Route path="/foundations" element={<Foundations completed={completed} onComplete={refreshProgress} />} />
        <Route path="/sql"         element={<SQL         completed={completed} onComplete={refreshProgress} />} />
        <Route path="/python"      element={<Python      completed={completed} onComplete={refreshProgress} />} />
        <Route path="/azure"       element={<Azure       completed={completed} onComplete={refreshProgress} />} />
        <Route path="/spark"       element={<Spark       completed={completed} onComplete={refreshProgress} />} />
        <Route path="/delta"       element={<Delta       completed={completed} onComplete={refreshProgress} />} />
        <Route path="/production"  element={<Production  completed={completed} onComplete={refreshProgress} />} />
        <Route path="/interview"   element={<Interview   completed={completed} />} />
        <Route path="/airflow"     element={<Airflow     completed={completed} onComplete={refreshProgress} />} />
      </Routes>
    </PageTransition>
  )
}

export default function App() {
  const { user, streak, completed, refreshProgress } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <BrowserRouter basename="/learn-DE">
      <Topbar user={user} streak={streak} onSignInClick={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <AppRoutes completed={completed} refreshProgress={refreshProgress} />
    </BrowserRouter>
  )
}
