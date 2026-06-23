import { useState } from 'react'

interface Props {
  lang?: string
  language?: string
  children?: string
  code?: string
}

export default function CodeBlock({ lang, language, children, code }: Props) {
  const displayLang = lang ?? language ?? 'python'
  const content = children ?? code ?? ''
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-lang">{displayLang}</span>
        <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre><code>{content.trim()}</code></pre>
    </div>
  )
}
