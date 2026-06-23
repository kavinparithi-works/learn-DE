import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface Props {
  children: React.ReactNode
}

export default function PageTransition({ children }: Props) {
  const location = useLocation()
  const [phase, setPhase] = useState<'idle' | 'out' | 'enter'>('idle')
  const [content, setContent] = useState(children)
  const [showBar, setShowBar] = useState(false)

  useEffect(() => {
    setPhase('out')
    setShowBar(true)
    const t1 = setTimeout(() => {
      setContent(children)
      setPhase('enter')
    }, 180)
    const t2 = setTimeout(() => {
      setPhase('idle')
      setShowBar(false)
    }, 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  useEffect(() => {
    if (phase === 'idle') setContent(children)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children])

  const wrapStyle: React.CSSProperties = {
    opacity: phase === 'out' ? 0 : 1,
    transform: phase === 'out' ? 'translateY(10px)' : 'translateY(0)',
    transition: phase === 'out'
      ? 'opacity 180ms ease, transform 180ms ease'
      : 'opacity 300ms cubic-bezier(.22,1,.36,1), transform 300ms cubic-bezier(.22,1,.36,1)',
  }

  return (
    <>
      {showBar && <div className="nav-progress" />}
      <div style={wrapStyle} className={phase === 'enter' ? 'page-enter-active' : undefined}>
        {content}
      </div>
    </>
  )
}
