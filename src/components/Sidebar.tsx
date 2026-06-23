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

  return (
    <aside className="sidebar">
      {/* Progress */}
      <div className="sidebar-progress">
        <div className="sidebar-progress-label">Your Progress</div>
        <div className="sidebar-progress-bar">
          <div className="sidebar-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div className="sidebar-progress-text">{doneCount} of {totalTopics} topics</div>
          <div style={{
            fontSize:'.7rem',fontWeight:800,
            color: pct === 100 ? '#4ade80' : 'rgba(255,255,255,.4)',
          }}>{pct}%</div>
        </div>
        {pct > 0 && pct < 100 && (
          <div style={{
            marginTop:10,fontSize:'.7rem',color:'rgba(255,255,255,.3)',
            display:'flex',alignItems:'center',gap:4,
          }}>
            <span style={{ color:'#f59e0b' }}>●</span>
            {totalTopics - doneCount} topics remaining
          </div>
        )}
        {pct === 100 && (
          <div style={{
            marginTop:10,fontSize:'.75rem',fontWeight:700,
            color:'#4ade80',display:'flex',alignItems:'center',gap:5,
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
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title" style={{ display:'flex',alignItems:'center',gap:6 }}>
              <span style={{
                width:8,height:8,borderRadius:'50%',flexShrink:0,
                background:color,boxShadow:`0 0 6px ${color}80`,
              }} />
              <span style={{ flex:1 }}>{section.title}</span>
              <span style={{
                fontSize:'.62rem',fontWeight:800,
                color: sectionDone === section.items.length ? '#4ade80' : 'rgba(255,255,255,.25)',
              }}>
                {sectionDone}/{section.items.length}
              </span>
            </div>
            {section.items.map(item => (
              <button
                key={item.id}
                className={`sidebar-item${activeId === item.id ? ' active' : ''}${completed.has(item.id) ? ' completed' : ''}`}
                onClick={() => onItemClick(item.id)}
              >
                <div className="sidebar-check">
                  {completed.has(item.id) ? '✓' : ''}
                </div>
                <span style={{ flex:1 }}>{item.label}</span>
                {activeId === item.id && (
                  <span style={{
                    width:4,height:4,borderRadius:'50%',flexShrink:0,
                    background:color,boxShadow:`0 0 8px ${color}`,
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
