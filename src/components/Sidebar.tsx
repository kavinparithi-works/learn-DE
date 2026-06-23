interface SidebarItem {
  id: string
  label: string
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

interface Props {
  sections: SidebarSection[]
  activeId: string
  completed: Set<string>
  totalTopics: number
  onItemClick: (id: string) => void
}

export default function Sidebar({ sections, activeId, completed, totalTopics, onItemClick }: Props) {
  const doneCount = sections.flatMap(s => s.items).filter(i => completed.has(i.id)).length

  const pct = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0

  return (
    <aside className="sidebar">
      <div className="sidebar-progress">
        <div className="sidebar-progress-label">Your Progress</div>
        <div className="sidebar-progress-bar">
          <div className="sidebar-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="sidebar-progress-text">{doneCount} of {totalTopics} topics</div>
      </div>

      {sections.map(section => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-section-title">{section.title}</div>
          {section.items.map(item => (
            <button
              key={item.id}
              className={`sidebar-item${activeId === item.id ? ' active' : ''}${completed.has(item.id) ? ' completed' : ''}`}
              onClick={() => onItemClick(item.id)}
            >
              <div className="sidebar-check">{completed.has(item.id) ? '✓' : ''}</div>
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}
