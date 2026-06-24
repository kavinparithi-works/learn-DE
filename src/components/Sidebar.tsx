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
  '#a5b4fc','#c4b5fd','#f9a8d4','#fcd34d',
  '#86efac','#67e8f9','#fed7aa','#fca5a5',
]

export default function Sidebar({ sections, activeId, completed, onItemClick }: Props) {
  const allItems = sections.flatMap(s => s.items)
  const totalTopics = allItems.length
  const doneCount = allItems.filter(i => completed.has(i.id)).length
  const pct = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0

  const r = 30, cx = 38, cy = 38
  const circumference = 2 * Math.PI * r

  return (
    <aside className="sidebar">

      {/* ── Progress ring ── */}
      <div className="sidebar-progress">
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:12 }}>
          <div style={{ position:'relative', width:76, height:76 }}>
            <svg viewBox="0 0 76 76" width="76" height="76" style={{ display:'block' }}>
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a5b4fc" />
                  <stop offset="50%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#f9a8d4" />
                </linearGradient>
              </defs>
              {/* Track */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5.5" />
              {/* Progress arc */}
              <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct / 100)}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{
                  transition:'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)',
                  filter:'drop-shadow(0 0 5px rgba(165,180,252,.6))',
                }}
              />
              {/* Center text */}
              <text
                x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                fill="white" fontWeight="900" fontSize="13.5"
                fontFamily="var(--font-display, sans-serif)"
                style={{ letterSpacing:'-.03em' }}
              >
                {pct}%
              </text>
            </svg>
          </div>
          <div className="sidebar-progress-label" style={{ marginTop:8 }}>Your Progress</div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div className="sidebar-progress-text">{doneCount} of {totalTopics} topics done</div>
        </div>

        {pct > 0 && pct < 100 && (
          <div style={{ marginTop:9, fontSize:'.66rem', color:'rgba(255,255,255,.22)', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ color:'#fcd34d' }}>●</span>
            {totalTopics - doneCount} topics remaining
          </div>
        )}
        {pct === 100 && (
          <div style={{ marginTop:9, fontSize:'.73rem', fontWeight:800, color:'#86efac', display:'flex', alignItems:'center', gap:6 }}>
            🏆 All complete!
          </div>
        )}
      </div>

      {/* ── Sections ── */}
      {sections.map((section, si) => {
        const color = section.color ?? SECTION_COLORS[si % SECTION_COLORS.length]
        const sectionDone = section.items.filter(i => completed.has(i.id)).length
        const sectionPct = section.items.length > 0 ? (sectionDone / section.items.length) * 100 : 0

        return (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title" style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{
                width:6, height:6, borderRadius:'50%', flexShrink:0,
                background:color, boxShadow:`0 0 7px ${color}`,
              }} />
              <span style={{ flex:1 }}>{section.title}</span>
              <span style={{
                fontSize:'.58rem', fontWeight:900,
                color: sectionDone === section.items.length ? '#86efac' : 'rgba(255,255,255,.2)',
              }}>
                {sectionDone}/{section.items.length}
              </span>
            </div>

            {/* Section mini progress */}
            <div style={{ height:2, borderRadius:2, background:'rgba(255,255,255,.06)', marginBottom:5, overflow:'hidden' }}>
              <div style={{
                height:'100%', width:`${sectionPct}%`,
                background:color, borderRadius:2,
                transition:'width 800ms ease',
                boxShadow:`0 0 6px ${color}88`,
              }} />
            </div>

            {section.items.map(item => (
              <button
                key={item.id}
                className={`sidebar-item${activeId === item.id ? ' active' : ''}${completed.has(item.id) ? ' completed' : ''}`}
                onClick={() => onItemClick(item.id)}
                style={{
                  borderLeft: activeId === item.id ? `2px solid ${color}` : '2px solid transparent',
                }}
              >
                <div className={`sidebar-check${completed.has(item.id) ? ' sidebar-check-anim' : ''}`}>
                  {completed.has(item.id) ? '✓' : ''}
                </div>
                <span style={{ flex:1 }}>{item.label}</span>
                {activeId === item.id && (
                  <span style={{
                    width:4, height:4, borderRadius:'50%', flexShrink:0,
                    background:color, boxShadow:`0 0 8px ${color}`,
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
