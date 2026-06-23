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

// ── Token colours ──────────────────────────────────────────────────────────
const C = {
  comment:   '#6a9955',   // green
  keyword:   '#c586c0',   // magenta/purple
  builtin:   '#dcdcaa',   // yellow (built-in functions)
  string:    '#ce9178',   // orange-red strings
  number:    '#b5cea8',   // light green numbers
  type:      '#4ec9b0',   // teal – type names / classes
  operator:  '#d4d4d4',   // light grey operators
  func:      '#dcdcaa',   // yellow function calls
  sqlkw:     '#569cd6',   // blue SQL keywords
  sqltype:   '#4ec9b0',   // teal SQL types
  sqlfunc:   '#dcdcaa',   // yellow SQL functions
  plain:     '#d4d4d4',   // default bright-ish white
  key:       '#9cdcfe',   // light blue – variable names / keys
  decorator: '#c586c0',   // purple decorators
  bash_cmd:  '#4ec9b0',   // teal bash commands
}

// ── Language-specific tokenizers ──────────────────────────────────────────

type Token = { text: string; color: string }

function tokenizePython(line: string): Token[] {
  const keywords = /\b(def|class|return|import|from|as|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|finally|raise|with|yield|async|await|pass|break|continue|lambda|global|nonlocal|del)\b/g
  const builtins = /\b(print|len|range|type|isinstance|int|str|float|list|dict|tuple|set|bool|open|zip|map|filter|sorted|enumerate|sum|min|max|abs|round|hasattr|getattr|setattr|input|super|vars|dir|repr|any|all|next|iter|id|hash|hex|bin|oct|format|staticmethod|classmethod|property)\b/g
  const types_cls = /\b([A-Z][A-Za-z0-9_]*)\b/g
  const decorators = /(^|\s)(@\w+)/g
  const strings = /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\n]*"|'[^'\n]*')/g
  const numbers = /\b(\d+\.?\d*|0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g
  const comments = /(#.*$)/

  return tokenizeLine(line, [
    { re: comments,   color: C.comment,   flags: '' },
    { re: strings,    color: C.string,    flags: 'g' },
    { re: decorators, color: C.decorator, flags: 'g', group: 2 },
    { re: keywords,   color: C.keyword,   flags: 'g' },
    { re: builtins,   color: C.builtin,   flags: 'g' },
    { re: types_cls,  color: C.type,      flags: 'g' },
    { re: numbers,    color: C.number,    flags: 'g' },
  ])
}

function tokenizeSQL(line: string): Token[] {
  const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|ON|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|TRUNCATE|INDEX|VIEW|WITH|AS|UNION|INTERSECT|EXCEPT|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|ASC|DESC|BY|PARTITION|OVER|ROWS|RANGE|BETWEEN|UNBOUNDED|PRECEDING|FOLLOWING|CURRENT|ROW|RECURSIVE|MERGE|MATCHED|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|CONSTRAINT|UNIQUE|CHECK|MATERIALIZED|REPLACE|EXPLAIN|ANALYZE|VACUUM|GRANT|REVOKE|BEGIN|COMMIT|ROLLBACK|TRANSACTION|SAVEPOINT|TRIGGER|PROCEDURE|FUNCTION|RETURNS|LANGUAGE|DECLARE|DO)\b/gi
  const types = /\b(INT|INTEGER|BIGINT|SMALLINT|FLOAT|DOUBLE|DECIMAL|NUMERIC|VARCHAR|CHAR|TEXT|BOOLEAN|BOOL|DATE|TIME|TIMESTAMP|TIMESTAMPTZ|INTERVAL|JSON|JSONB|ARRAY|UUID|SERIAL|BYTEA|BINARY|BLOB|CLOB|NVARCHAR)\b/gi
  const funcs = /\b(COUNT|SUM|AVG|MIN|MAX|COALESCE|NULLIF|IFNULL|NVL|CAST|CONVERT|DATE_TRUNC|DATE_PART|EXTRACT|TO_DATE|TO_TIMESTAMP|TO_CHAR|UPPER|LOWER|TRIM|LTRIM|RTRIM|SUBSTRING|SUBSTR|REPLACE|SPLIT_PART|CONCAT|LENGTH|LEN|CHARINDEX|POSITION|REGEXP_REPLACE|REGEXP_EXTRACT|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTILE|PERCENT_RANK|CUME_DIST|LISTAGG|STRING_AGG|ARRAY_AGG|JSON_EXTRACT|ISNULL|IIF|DATEDIFF|DATEADD|GETDATE|NOW|CURRENT_DATE|CURRENT_TIMESTAMP|FLOOR|CEIL|ROUND|ABS|POWER|SQRT|MOD|GENERATE_SERIES|UNNEST|FLATTEN)\b/gi
  const strings = /('[^']*'|"[^"]*")/g
  const numbers = /\b(\d+\.?\d*)\b/g
  const comments = /(--.*$|\/\*[\s\S]*?\*\/)/

  return tokenizeLine(line, [
    { re: comments, color: C.comment,  flags: '' },
    { re: strings,  color: C.string,   flags: 'g' },
    { re: keywords, color: C.sqlkw,    flags: 'gi' },
    { re: types,    color: C.sqltype,  flags: 'gi' },
    { re: funcs,    color: C.sqlfunc,  flags: 'gi' },
    { re: numbers,  color: C.number,   flags: 'g' },
  ])
}

function tokenizeBash(line: string): Token[] {
  const commands = /\b(echo|cd|ls|mkdir|rm|cp|mv|cat|grep|find|sed|awk|chmod|chown|sudo|apt|pip|python|python3|npm|node|git|docker|kubectl|curl|wget|export|source|alias|unset|set|read|printf|exec|kill|ps|top|df|du|which|type|env|pwd|exit|return|local|declare|readonly|shift|getopts|trap|wait|jobs|fg|bg|nohup|screen|tmux|ssh|scp|rsync|tar|gzip|zcat|cut|sort|uniq|wc|head|tail|tee|xargs|date|sleep|true|false|test)\b/g
  const flags = /(?<=\s)(-{1,2}[\w-]+)/g
  const strings = /("[^"]*"|'[^']*')/g
  const numbers = /\b(\d+)\b/g
  const comments = /(#.*$)/
  const vars = /(\$\{?[\w]+\}?|\$\(.*?\))/g

  return tokenizeLine(line, [
    { re: comments, color: C.comment,  flags: '' },
    { re: strings,  color: C.string,   flags: 'g' },
    { re: vars,     color: C.key,      flags: 'g' },
    { re: commands, color: C.bash_cmd, flags: 'g' },
    { re: flags,    color: C.keyword,  flags: 'g' },
    { re: numbers,  color: C.number,   flags: 'g' },
  ])
}

function tokenizeJSON(line: string): Token[] {
  const keys    = /("[\w\s-]+")\s*:/g
  const strings = /:\s*("[^"]*")/g
  const numbers = /:\s*(-?\d+\.?\d*)/g
  const bools   = /\b(true|false|null)\b/g

  return tokenizeLine(line, [
    { re: keys,    color: C.key,     flags: 'g' },
    { re: strings, color: C.string,  flags: 'g' },
    { re: numbers, color: C.number,  flags: 'g' },
    { re: bools,   color: C.keyword, flags: 'g' },
  ])
}

function tokenizeYAML(line: string): Token[] {
  const keys     = /^(\s*[\w-]+)\s*:/gm
  const strings  = /:\s*("[^"]*"|'[^']*')/g
  const comments = /(#.*$)/
  const bools    = /\b(true|false|null|yes|no)\b/g
  const numbers  = /:\s*(-?\d+\.?\d*)/g

  return tokenizeLine(line, [
    { re: comments, color: C.comment, flags: '' },
    { re: keys,     color: C.key,     flags: 'g' },
    { re: strings,  color: C.string,  flags: 'g' },
    { re: bools,    color: C.keyword, flags: 'g' },
    { re: numbers,  color: C.number,  flags: 'g' },
  ])
}

// ── Core tokenizer engine ─────────────────────────────────────────────────

interface Rule { re: RegExp; color: string; flags?: string; group?: number }

function tokenizeLine(text: string, rules: Rule[]): Token[] {
  // Build a map of char-index → color by scanning each rule
  const colors = new Array(text.length).fill(C.plain)

  for (const rule of rules) {
    const re = new RegExp(rule.re.source, rule.re.flags || rule.flags || 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const matchText = rule.group != null ? (m[rule.group] ?? '') : m[0]
      const start = rule.group != null ? (m.index + (m[0].indexOf(matchText))) : m.index
      for (let i = start; i < start + matchText.length; i++) {
        if (i < colors.length) colors[i] = rule.color
      }
      if (re.lastIndex === m.index) re.lastIndex++
    }
  }

  // Collapse runs of same color into Token spans
  const tokens: Token[] = []
  let i = 0
  while (i < text.length) {
    const col = colors[i]
    let j = i + 1
    while (j < text.length && colors[j] === col) j++
    tokens.push({ text: text.slice(i, j), color: col })
    i = j
  }
  return tokens
}

function getTokenizer(lang: string) {
  switch (lang) {
    case 'python': case 'py': return tokenizePython
    case 'sql':               return tokenizeSQL
    case 'bash': case 'shell': return tokenizeBash
    case 'json':              return tokenizeJSON
    case 'yaml': case 'yml':  return tokenizeYAML
    default:                  return null
  }
}

// ── Highlighted code renderer ─────────────────────────────────────────────

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const tokenizer = getTokenizer(lang)
  if (!tokenizer) {
    return <code style={{ color: C.plain }}>{code}</code>
  }

  const lines = code.split('\n')
  return (
    <code>
      {lines.map((line, li) => {
        const tokens = tokenizer(line)
        return (
          <span key={li} style={{ display: 'block' }}>
            {tokens.map((tok, ti) => (
              <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
            ))}
            {li < lines.length - 1 ? '' : null}
          </span>
        )
      })}
    </code>
  )
}

// ── Main Component ────────────────────────────────────────────────────────

export default function CodeBlock({ lang, language, children, code }: Props) {
  const displayLang = (lang ?? language ?? 'python').toLowerCase()
  const content = (children ?? code ?? '').trim()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
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
      <pre><HighlightedCode code={content} lang={displayLang} /></pre>
    </div>
  )
}
