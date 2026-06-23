import { useState } from 'react'

interface Props {
  lang?: string
  language?: string
  children?: string
  code?: string
}

const LANG_ICONS: Record<string, string> = {
  python: '🐍', sql: '🗃', bash: '⚡', shell: '⚡', yaml: '📄', json: '{}',
  typescript: '📘', javascript: '🟨', ts: '📘', js: '🟨',
  scala: '⚙', java: '☕', hcl: '🏗', terraform: '🏗',
  dockerfile: '🐳', docker: '🐳', text: '📝', xml: '📰',
}

const LANG_COLORS: Record<string, [string, string]> = {
  python:     ['#3b82f6', '#06b6d4'],
  sql:        ['#f59e0b', '#f97316'],
  bash:       ['#8b5cf6', '#ec4899'],
  shell:      ['#8b5cf6', '#ec4899'],
  yaml:       ['#22c55e', '#06b6d4'],
  json:       ['#f97316', '#ec4899'],
  typescript: ['#3b82f6', '#8b5cf6'],
  javascript: ['#f59e0b', '#f97316'],
  scala:      ['#ef4444', '#f97316'],
  hcl:        ['#8b5cf6', '#06b6d4'],
  terraform:  ['#8b5cf6', '#06b6d4'],
}

export default function CodeBlock({ lang, language, children, code }: Props) {
  const displayLang = (lang ?? language ?? 'python').toLowerCase()
  const content = children ?? code ?? ''
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const icon = LANG_ICONS[displayLang] ?? '◈'
  const [c1, c2] = LANG_COLORS[displayLang] ?? ['#4f8ef7', '#8b5cf6']

  return (
    <div className="code-block">
      <div className="code-block-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '.85rem' }}>{icon}</span>
          <span className="code-lang" style={{
            background: `linear-gradient(135deg,${c1},${c2})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>{displayLang.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5, opacity: .45 }}>
            {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
              <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
            ))}
          </div>
          <button
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? '✓ Copied!' : '⎘ Copy'}
          </button>
        </div>
      </div>
      <pre><code>{content.trim()}</code></pre>
    </div>
  )
}
