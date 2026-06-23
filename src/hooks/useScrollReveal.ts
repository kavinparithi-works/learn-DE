import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('.topic-section')
    )

    // Reset all sections to hidden before observing
    sections.forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(32px)'
      el.classList.remove('sr-reveal')
    })

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          // Clear inline hidden state so animation can run
          el.style.opacity = ''
          el.style.transform = ''
          el.classList.add('sr-reveal')
          // After animation finishes, remove class so hover transforms work freely
          el.addEventListener('animationend', () => {
            el.classList.remove('sr-reveal')
          }, { once: true })
          obs.unobserve(el)
        })
      },
      { threshold: 0.07, rootMargin: '0px 0px -24px 0px' }
    )

    // Delay slightly so page-enter transition finishes first
    const t = setTimeout(() => {
      sections.forEach((el, idx) => {
        // Sections already in viewport on load get a staggered cascade
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight) {
          el.style.animationDelay = `${idx * 55}ms`
        } else {
          el.style.animationDelay = '0ms'
        }
        obs.observe(el)
      })
    }, 160)

    return () => {
      clearTimeout(t)
      obs.disconnect()
    }
  }, [pathname])
}
