import { Link } from 'react-router-dom'

interface Props {
  completed: Set<string>
}

const LEVELS = [
  { num: '1-2', title: 'Computer + Data Fundamentals', desc: 'Binary, CPU, OS, networking, file formats, Parquet, Avro, Medallion architecture.', tags: ['Binary', 'CPU Cache', 'Parquet', 'Medallion'], hours: '20+ hrs', color: '#4f8ef7', path: '/foundations', id: 'foundations' },
  { num: '3-4', title: 'SQL - Fundamentals to Mastery', desc: 'SELECT, WHERE, JOINs with animated Venn diagrams, window functions, CTEs, query optimization.', tags: ['JOINs', 'Window Functions', 'CTEs', 'Optimization'], hours: '50+ hrs', color: '#f59e0b', path: '/sql', id: 'sql' },
  { num: '5',   title: 'Python for Data Engineering', desc: 'Python execution model, data structures, OOP, pandas, generators, Linux, Git.', tags: ['pandas', 'GIL', 'Generators', 'Linux', 'Git'], hours: '60+ hrs', color: '#3b82f6', path: '/python', id: 'python' },
  { num: '6',   title: 'Cloud and Azure Fundamentals', desc: 'Azure regions, ADLS Gen2, ADF, Cosmos DB, Event Hub, Key Vault, VNet, private endpoints.', tags: ['ADLS Gen2', 'ADF', 'Event Hub', 'Key Vault'], hours: '80+ hrs', color: '#0078d4', path: '/azure', id: 'azure' },
  { num: '7',   title: 'Apache Spark and PySpark Mastery', desc: 'Catalyst optimizer, DAG, partitions, shuffles, DataFrames, UDFs, Structured Streaming, AQE.', tags: ['Catalyst', 'Shuffles', 'Streaming', 'AQE'], hours: '80+ hrs', color: '#f97316', path: '/spark', id: 'spark' },
  { num: '8',   title: 'Delta Lake + Databricks + Unity Catalog', desc: 'Transaction log, ACID, MERGE, time travel, DLT pipelines, Unity Catalog, Lakeflow.', tags: ['Delta ACID', 'DLT', 'Unity Catalog', 'Auto Loader'], hours: '100+ hrs', color: '#ef4444', path: '/delta', id: 'delta' },
  { num: '9',   title: 'Production Data Engineering', desc: 'System design, data mesh, CI/CD with GitHub Actions, Terraform, observability, cost optimization.', tags: ['System Design', 'CI/CD', 'Terraform', 'Observability'], hours: '80+ hrs', color: '#8b5cf6', path: '/production', id: 'production' },
  { num: '✓',  title: 'Interview Prep + Certifications', desc: '100+ curated questions across SQL, PySpark, Azure, System Design, Behavioral, and Scenario.', tags: ['SQL', 'PySpark', 'Azure', 'System Design'], hours: '105 Questions', color: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', path: '/interview', id: 'interview' },
]

export default function Home({ completed }: Props) {
  return (
    <div style={{ marginTop: 'var(--topbar-h)' }}>
      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg,#eff6ff 0%,#faf5ff 50%,#f0fdf4 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 48px 64px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 'var(--radius-full)',
          background: 'white', border: '1px solid var(--border)',
          fontSize: '.78rem', fontWeight: 700, color: 'var(--text-3)',
          textTransform: 'uppercase', letterSpacing: '.06em',
          marginBottom: 20, boxShadow: 'var(--shadow-sm)',
        }}>
          🎓 Data Engineering Learning Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem,5vw,3.2rem)',
          background: 'linear-gradient(135deg,#1e293b 0%,#4f8ef7 50%,#8b5cf6 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: 16,
        }}>
          From Zero to Senior<br />Azure Data Engineer
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-3)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Master Computer Fundamentals, SQL, Python, Apache Spark, Delta Lake, Azure, and Databricks with animations, quizzes, and real-world content.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link to="/foundations" style={{
            padding: '12px 28px', borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg,var(--blue-500),var(--purple-500))',
            color: 'white', fontSize: '.95rem', fontWeight: 700,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: 'var(--shadow-blue)',
          }}>▶ Start Learning</Link>
          <Link to="/interview" style={{
            padding: '12px 28px', borderRadius: 'var(--radius-full)',
            background: 'white', color: 'var(--text-1)',
            fontSize: '.95rem', fontWeight: 600,
            border: '1.5px solid var(--border)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>📋 Interview Prep</Link>
        </div>

        {/* Pipeline animation */}
        <PipelineDemo />

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40 }}>
          {[['9', 'Learning Levels'], ['100+', 'Interview Questions'], ['50+', 'Animations'], ['400+', 'Hours of Content']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>{n}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-3)', fontWeight: 500, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LEVEL CARDS */}
      <section style={{ padding: '64px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>Your Learning Path</h2>
          <p style={{ color: 'var(--text-3)', maxWidth: 520, margin: '0 auto' }}>
            A structured curriculum from zero to Databricks Professional certification ready.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          {LEVELS.map((lv, i) => (
            <Link
              key={lv.id}
              to={lv.path}
              className="animate-slidein"
              style={{
                background: 'white', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)', overflow: 'hidden',
                textDecoration: 'none', display: 'block',
                transition: 'all var(--transition)',
                animationDelay: `${i * 0.05}s`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
            >
              <div style={{ height: 5, background: lv.color }} />
              <div style={{ padding: '22px 22px 20px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 'var(--radius-lg)',
                  background: lv.color, color: 'white',
                  fontFamily: 'var(--font-display)', fontSize: '.88rem', fontWeight: 800,
                  marginBottom: 14,
                }}>{lv.num}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>{lv.title}</div>
                <div style={{ fontSize: '.84rem', color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 16 }}>{lv.desc}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {lv.tags.map(t => (
                    <span key={t} style={{
                      padding: '3px 10px', borderRadius: 'var(--radius-full)',
                      background: 'var(--gray-100)', color: 'var(--gray-600)',
                      fontSize: '.72rem', fontWeight: 600,
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '.78rem', color: 'var(--text-4)' }}>🕐 {lv.hours}</span>
                  <div style={{ flex: 1, height: 4, background: 'var(--gray-100)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: lv.color, borderRadius: 2, width: completed.has(lv.id) ? '100%' : '0%', transition: 'width 1s ease' }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'var(--gray-50)', borderTop: '1px solid var(--border)', padding: '64px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>Platform Features</h2>
          <p style={{ color: 'var(--text-3)' }}>Built for engineers who learn by doing.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {[
            ['🎬', 'Auto-Playing Animations', 'Every concept has animated SVG illustrations. CPU pipelines, JOIN Venn diagrams, Spark DAGs, Delta transaction logs.'],
            ['🧠', 'Knowledge Quizzes', 'Quiz after every topic with instant feedback. Green for correct, red for wrong. Firebase tracks your score and progress.'],
            ['🔥', 'Streak Tracking', 'Daily study streaks tracked in Firebase. XP awarded for completing topics and quizzes. Stay consistent.'],
            ['🔐', 'Google Sign-In', 'Sign in with Google or email. Progress synced across devices via Firebase Firestore.'],
            ['📋', 'Copy Code Blocks', 'Every code example has a one-click copy button. JetBrains Mono font for maximum readability.'],
            ['🏆', 'Cert-Ready Content', 'Covers DP-203, Databricks Professional, and AZ-900 objectives. Aligned with what companies actually interview for.'],
          ].map(([icon, title, desc], i) => (
            <div key={title} className="animate-slidein" style={{
              background: 'white', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)', padding: 24,
              animationDelay: `${i * 0.05}s`,
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '.95rem', fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: '.84rem', color: 'var(--text-3)', lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--gray-900)', color: '#94a3b8', padding: '40px 48px', textAlign: 'center', fontSize: '.85rem' }}>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          {[['Foundations','/foundations'],['SQL','/sql'],['Python','/python'],['Azure','/azure'],['Spark','/spark'],['Delta Lake','/delta'],['Production','/production'],['Interview','/interview']].map(([l,p]) => (
            <Link key={p} to={p} style={{ color: '#60a5fa' }}>{l}</Link>
          ))}
        </div>
        <p>© 2026 LearnWithMe - Data Engineering Platform. Built with React + Firebase + GitHub Pages.</p>
      </footer>
    </div>
  )
}

function PipelineDemo() {
  const nodes = [
    { icon: '🔌', label: 'Source Systems' },
    { icon: '☕', label: 'Ingest ADF/Event Hub' },
    { icon: '🥉', label: 'Bronze Raw Layer' },
    { icon: '⚡', label: 'Spark Transform' },
    { icon: '🥇', label: 'Gold Delta Lake' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0, padding: '32px 0' }}>
      {nodes.map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="animate-popin" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '16px 20px', background: 'white',
            border: `1.5px solid ${['#bfdbfe','#d8b4fe','#fde68a','#bbf7d0','#fed7aa'][i]}`,
            borderRadius: 'var(--radius-xl)', minWidth: 100,
            boxShadow: 'var(--shadow-sm)',
            animationDelay: `${i * 0.1}s`,
          }}>
            <div style={{ fontSize: '1.8rem' }}>{n.icon}</div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-2)', textAlign: 'center' }}>{n.label}</div>
          </div>
          {i < nodes.length - 1 && (
            <div style={{ fontSize: '1.4rem', color: 'var(--blue-400)', padding: '0 4px', animation: 'pulse 2s ease-in-out infinite' }}>→</div>
          )}
        </div>
      ))}
    </div>
  )
}
