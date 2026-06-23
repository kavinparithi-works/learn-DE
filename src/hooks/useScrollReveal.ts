import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Use a single class toggle — no inline style mutations at all.
    // CSS handles opacity/transform entirely via .sr-hidden and .sr-reveal.
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('.topic-section')
    )

    // Mark all hidden via class (not inline style — avoids layout thrashing)
    sections.forEach(el => {
      el.classList.remove('sr-reveal')
      el.classList.add('sr-hidden')
    })

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          el.classList.remove('sr-hidden')
          el.classList.add('sr-reveal')
          obs.unobserve(el)
        })
      },
      // Higher threshold = fires later = less janky during fast scroll
      { threshold: 0.05, rootMargin: '0px 0px -16px 0px' }
    )

    // Small delay so the page-enter transition completes first
    const t = setTimeout(() => {
      sections.forEach((el, idx) => {
        const rect = el.getBoundingClientRect()
        // Already visible on load — stagger them, no delay for off-screen
        el.style.animationDelay = rect.top < window.innerHeight
          ? `${Math.min(idx * 40, 200)}ms`  // cap stagger at 200ms max
          : '0ms'
        obs.observe(el)
      })
    }, 120)

    return () => {
      clearTimeout(t)
      obs.disconnect()
      // Clean up classes on unmount
      sections.forEach(el => {
        el.classList.remove('sr-hidden', 'sr-reveal')
        el.style.animationDelay = ''
      })
    }
  }, [pathname])
}
