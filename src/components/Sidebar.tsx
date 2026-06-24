interface SidebarItem {
  id: string
  label: string
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
  color?: string
}

interface Props {
  sections: SidebarSection[]
  activeId: string
  completed: Set<string>
  totalTopics?: number
  onItemClick: (id: string) => void
}

const SECTION_COLORS = [
  '#4f8ef7','#8b5cf6','#ec4899','#f59e0b',
  '#22c55e','#06b6d4','#f97316','#ef4444',
]

export default function Sidebar({ sections, activeId, completed, onItemClick }: Props) {
  const allItems = sections.flatMap(s => s.items)
  const totalTopics = allItems.length
  const doneCount = allItems.filter(i => completed.has(i.id)).length
  const pct = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0

  // Circular arc progress
  const r = 28
  const cx = 36
  const cy = 36
  const circumference = 2 * Math.PI * r

  return (
    <aside className="sidebar">
      {/* Progress */}
      <div className="sidebar-progress">
        {/* Circular arc indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            <svg viewBox="0 0 72 72" width="72" height="72" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4f8ef7" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="5"
              />
              {/* Foreground arc */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct / 100)}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }}
              />
              {/* Center percentage text */}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontWeight="800"
                fontSize="13"
                fontFamily="var(--font-display, sans-serif)"
              >
                {pct}%
              </text>
            </svg>
          </div>
          <div className="sidebar-progress-label" style={{ marginTop: 6 }}>Your Progress</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sidebar-progress-text">{doneCount} of {totalTopics} topics</div>
        </div>
        {pct > 0 && pct < 100 && (
          <div style={{
            marginTop: 10, fontSize: '.7rem', color: 'rgba(255,255,255,.3)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ color: '#f59e0b' }}>●</span>
            {totalTopics - doneCount} topics remaining
          </div>
        )}
        {pct === 100 && (
          <div style={{
            marginTop: 10, fontSize: '.75rem', fontWeight: 700,
            color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            🏆 Section complete!
          </div>
        )}
      </div>

      {/* Sections */}
      {sections.map((section, si) => {
        const color = section.color ?? SECTION_COLORS[si % SECTION_COLORS.length]
        const sectionDone = section.items.filter(i => completed.has(i.id)).length
        return (
          <div key={section.title} className="sidebar-section" style={{ overflow: 'hidden' }}>
            <div className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: color, boxShadow: `0 0 6px ${color}80`,
              }} />
              <span style={{ flex: 1 }}>{section.title}</span>
              <span style={{
                fontSize: '.62rem', fontWeight: 800,
                color: sectionDone === section.items.length ? '#4ade80' : 'rgba(255,255,255,.25)',
              }}>
                {sectionDone}/{section.items.length}
              </span>
            </div>
            {/* Mini progress bar under section title */}
            <div style={{
              height: 3,
              borderRadius: 2,
              background: 'rgba(255,255,255,.08)',
              marginBottom: 6,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(sectionDone / section.items.length) * 100}%`,
                background: color,
                borderRadius: 2,
                transition: 'width 800ms ease',
              }} />
            </div>
            {section.items.map(item => (
              <button
                key={item.id}
                className={`sidebar-item${activeId === item.id ? ' active' : ''}${completed.has(item.id) ? ' completed' : ''}`}
                onClick={() => onItemClick(item.id)}
                style={{
                  position: 'relative',
                  borderLeft: activeId === item.id ? `3px solid ${color}` : '3px solid transparent',
                }}
              >
                <div className={`sidebar-check${completed.has(item.id) ? ' sidebar-check-anim' : ''}`}>
                  {completed.has(item.id) ? '✓' : ''}
                </div>
                <span style={{ flex: 1 }}>{item.label}</span>
                {activeId === item.id && (
                  <span style={{
                    width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
                    background: color, boxShadow: `0 0 8px ${color}`,
                  }} />
                )}
              </button>
            ))}
          </div>
        )
      })}
    </aside>
  )
}
