import { Link } from 'react-router-dom'

interface Props {
  completed: Set<string>
}

const LEVELS = [
  {
    num: '01', title: 'Computer & Data Fundamentals',
    desc: 'Binary, CPU, OS, networking, file formats, Parquet, Avro, Medallion architecture.',
    tags: ['Binary', 'CPU Cache', 'Parquet', 'Medallion'],
    hours: '20+ hrs', path: '/foundations', id: 'foundations',
    gradient: 'linear-gradient(135deg,#4f8ef7,#818cf8)',
    glow: 'rgba(79,142,247,.25)',
    accent: '#4f8ef7',
  },
  {
    num: '02', title: 'SQL — Fundamentals to Mastery',
    desc: 'SELECT, JOINs with animated Venn diagrams, window functions, CTEs, query optimization.',
    tags: ['JOINs', 'Window Functions', 'CTEs', 'Optimization'],
    hours: '50+ hrs', path: '/sql', id: 'sql',
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
    glow: 'rgba(245,158,11,.22)',
    accent: '#f59e0b',
  },
  {
    num: '03', title: 'Python for Data Engineering',
    desc: 'Python internals, OOP, Pydantic v2, async, Docker, Kubernetes, Deequ, pandas.',
    tags: ['pandas', 'GIL', 'Pydantic', 'Docker'],
    hours: '60+ hrs', path: '/python', id: 'python',
    gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
    glow: 'rgba(59,130,246,.22)',
    accent: '#3b82f6',
  },
  {
    num: '04', title: 'Cloud & Azure Deep Dive',
    desc: 'ADLS Gen2, ADF, Synapse, Databricks, Event Hub, Key Vault, VNet, private endpoints.',
    tags: ['ADLS Gen2', 'ADF', 'Event Hub', 'Key Vault'],
    hours: '80+ hrs', path: '/azure', id: 'azure',
    gradient: 'linear-gradient(135deg,#0078d4,#00bcf2)',
    glow: 'rgba(0,120,212,.22)',
    accent: '#0078d4',
  },
  {
    num: '05', title: 'Apache Spark & PySpark Mastery',
    desc: 'Catalyst optimizer, DAG, shuffles, DataFrames, UDFs, Kafka, Structured Streaming, AQE.',
    tags: ['Catalyst', 'Shuffles', 'Kafka', 'AQE'],
    hours: '80+ hrs', path: '/spark', id: 'spark',
    gradient: 'linear-gradient(135deg,#f97316,#ec4899)',
    glow: 'rgba(249,115,22,.22)',
    accent: '#f97316',
  },
  {
    num: '06', title: 'Delta Lake + Databricks + Unity Catalog',
    desc: 'ACID transactions, MERGE, time travel, DLT pipelines, Unity Catalog, Iceberg, Hudi.',
    tags: ['Delta ACID', 'DLT', 'Unity Catalog', 'Iceberg'],
    hours: '100+ hrs', path: '/delta', id: 'delta',
    gradient: 'linear-gradient(135deg,#ef4444,#f97316)',
    glow: 'rgba(239,68,68,.22)',
    accent: '#ef4444',
  },
  {
    num: '07', title: 'Production Data Engineering',
    desc: 'System design, data mesh, CI/CD, Terraform, dbt, Data Vault 2.0, SCD types 1–6.',
    tags: ['System Design', 'CI/CD', 'Data Vault', 'SCD'],
    hours: '80+ hrs', path: '/production', id: 'production',
    gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    glow: 'rgba(139,92,246,.22)',
    accent: '#8b5cf6',
  },
  {
    num: '08', title: 'Apache Airflow + Orchestration',
    desc: 'DAGs, TaskFlow API, sensors, Kubernetes executor, CI/CD for pipelines.',
    tags: ['DAGs', 'TaskFlow', 'KubernetesPodOperator', 'Sensors'],
    hours: '40+ hrs', path: '/airflow', id: 'airflow',
    gradient: 'linear-gradient(135deg,#00ad46,#06b6d4)',
    glow: 'rgba(0,173,70,.22)',
    accent: '#00ad46',
  },
  {
    num: '✓', title: 'Interview Prep + Certifications',
    desc: '105 curated questions across SQL, PySpark, Azure, System Design, Behavioral.',
    tags: ['SQL', 'PySpark', 'Azure', 'System Design'],
    hours: '105 Questions', path: '/interview', id: 'interview',
    gradient: 'linear-gradient(135deg,#4f8ef7,#8b5cf6,#ec4899)',
    glow: 'rgba(139,92,246,.25)',
    accent: '#8b5cf6',
  },
]

const STATS = [
  { n: '10', l: 'Learning Levels', icon: '🎯', grad: 'linear-gradient(135deg,#eff6ff,#faf5ff)' },
  { n: '105', l: 'Interview Questions', icon: '🧠', grad: 'linear-gradient(135deg,#faf5ff,#fdf2f8)' },
  { n: '60+', l: 'Animations', icon: '🎬', grad: 'linear-gradient(135deg,#f0fdf4,#ecfeff)' },
  { n: '500+', l: 'Hours of Content', icon: '⏱', grad: 'linear-gradient(135deg,#fffbeb,#fff7ed)' },
]

const FEATURES = [
  ['🎬', 'Auto-Playing Animations', 'Every concept has animated SVG illustrations — CPU pipelines, JOIN Venn diagrams, Spark DAGs, Delta transaction logs.', '#eff6ff', '#bfdbfe'],
  ['🧠', 'Knowledge Quizzes', 'Quiz after every topic with instant feedback. Firebase tracks your score, XP, and progress across sessions.', '#faf5ff', '#ddd6fe'],
  ['🔥', 'Streak Tracking', 'Daily study streaks tracked in Firebase. XP awarded for completing topics and quizzes. Stay consistent.', '#fffbeb', '#fde68a'],
  ['🔐', 'Google Sign-In', 'Sign in with Google or email. Progress synced across all your devices via Firebase Firestore.', '#f0fdf4', '#bbf7d0'],
  ['📋', 'Copy Code Blocks', 'Every code example has a one-click copy button. Fira Code ligatures for maximum readability.', '#ecfeff', '#a5f3fc'],
  ['🏆', 'Cert-Ready Content', 'Covers DP-203, Databricks Professional, and AZ-900. Aligned with what companies actually interview for.', '#fff7ed', '#fed7aa'],
]

export default function Home({ completed }: Props) {
  return (
    <div style={{ marginTop: 'var(--topbar-h)' }}>
      {/* ── HERO ─────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg,#0f172a 0%,#1a1040 35%,#0f2040 70%,#0f172a 100%)',
        padding: '100px 48px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG orbs */}
        <div style={{ position:'absolute',top:-80,left:'15%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,.18) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-60,right:'10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(79,142,247,.15) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:'20%',right:'20%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(236,72,153,.1) 0%,transparent 70%)',pointerEvents:'none' }} />

        <div className="animate-fadein" style={{ position:'relative',zIndex:1 }}>
          <div style={{
            display:'inline-flex',alignItems:'center',gap:8,
            padding:'6px 18px',borderRadius:'9999px',
            background:'rgba(255,255,255,.06)',
            border:'1px solid rgba(255,255,255,.12)',
            fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.7)',
            textTransform:'uppercase',letterSpacing:'.08em',
            marginBottom:28,backdropFilter:'blur(8px)',
          }}>
            🎓 Data Engineering Learning Platform
          </div>

          <h1 style={{
            fontSize:'clamp(2.2rem,5.5vw,3.8rem)',
            fontWeight:900,letterSpacing:'-.04em',lineHeight:1.1,
            marginBottom:20,
            background:'linear-gradient(135deg,#ffffff 0%,#93c5fd 40%,#c4b5fd 70%,#f9a8d4 100%)',
            backgroundSize:'200% 200%',
            animation:'gradientShift 5s ease infinite',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
            fontFamily:'var(--font-display)',
          }}>
            From Zero to Senior<br />Azure Data Engineer
          </h1>

          <p style={{
            fontSize:'1.08rem',color:'rgba(255,255,255,.6)',
            maxWidth:580,margin:'0 auto 40px',lineHeight:1.75,
            fontFamily:'var(--font-sans)',
          }}>
            Master SQL, Python, Apache Spark, Delta Lake, Databricks, Azure, and Airflow
            with animations, quizzes, and real-world production content.
          </p>

          <div style={{ display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:56 }}>
            <Link to="/foundations" style={{
              padding:'14px 32px',borderRadius:'9999px',
              background:'linear-gradient(135deg,#4f8ef7,#8b5cf6,#ec4899)',
              backgroundSize:'200% 200%',
              animation:'gradientShift 4s ease infinite',
              color:'white',fontSize:'1rem',fontWeight:700,
              textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,
              boxShadow:'0 4px 28px rgba(139,92,246,.45)',
              letterSpacing:'-.01em',fontFamily:'var(--font-display)',
            }}>▶ Start Learning</Link>
            <Link to="/interview" style={{
              padding:'14px 32px',borderRadius:'9999px',
              background:'rgba(255,255,255,.08)',
              color:'rgba(255,255,255,.85)',fontSize:'1rem',fontWeight:600,
              border:'1.5px solid rgba(255,255,255,.15)',textDecoration:'none',
              display:'inline-flex',alignItems:'center',gap:8,
              backdropFilter:'blur(8px)',
              transition:'all 200ms ease',
              fontFamily:'var(--font-display)',
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.14)';(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,.3)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.08)';(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,.15)'}}
            >📋 Interview Prep</Link>
          </div>

          {/* Pipeline animation */}
          <PipelineDemo />

          {/* Stats row */}
          <div style={{ display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap',marginTop:52 }}>
            {STATS.map(s => (
              <div key={s.l} className="animate-popin" style={{
                textAlign:'center',padding:'14px 24px',
                background:'rgba(255,255,255,.07)',
                border:'1px solid rgba(255,255,255,.1)',
                borderRadius:'var(--radius-xl)',
                backdropFilter:'blur(8px)',
                minWidth:110,
              }}>
                <div style={{ fontSize:'1.4rem',marginBottom:4 }}>{s.icon}</div>
                <div style={{
                  fontFamily:'var(--font-display)',fontSize:'1.9rem',fontWeight:900,
                  color:'#fff',letterSpacing:'-.03em',lineHeight:1.1,
                }}>{s.n}</div>
                <div style={{ fontSize:'.72rem',color:'rgba(255,255,255,.5)',fontWeight:600,marginTop:4,textTransform:'uppercase',letterSpacing:'.06em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEVEL CARDS ─────────────────────── */}
      <section style={{ padding:'80px 48px',background:'var(--bg)' }}>
        <div style={{ textAlign:'center',marginBottom:56 }}>
          <div style={{
            display:'inline-flex',alignItems:'center',gap:6,
            padding:'5px 16px',borderRadius:'9999px',
            background:'linear-gradient(135deg,var(--blue-50),var(--purple-50))',
            border:'1px solid var(--blue-100)',
            fontSize:'.75rem',fontWeight:800,color:'var(--blue-700)',
            textTransform:'uppercase',letterSpacing:'.08em',
            marginBottom:16,
          }}>🗺 Your Learning Path</div>
          <h2 style={{
            fontSize:'clamp(1.7rem,3.5vw,2.4rem)',marginBottom:12,
            background:'linear-gradient(135deg,var(--text-1),var(--purple-600))',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
          }}>From Zero to Production-Ready</h2>
          <p style={{ color:'var(--text-3)',maxWidth:540,margin:'0 auto',fontSize:'.97rem',lineHeight:1.7 }}>
            A structured curriculum from computer fundamentals to Databricks Professional certification.
          </p>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',
          gap:20,maxWidth:1160,margin:'0 auto',
        }}>
          {LEVELS.map((lv, i) => (
            <Link
              key={lv.id}
              to={lv.path}
              className="animate-slidein"
              style={{
                background:'var(--bg-card)',borderRadius:'var(--radius-2xl)',
                border:'1.5px solid var(--border)',overflow:'hidden',
                textDecoration:'none',display:'block',
                transition:'all 260ms ease',
                animationDelay:`${i * 0.045}s`,
                position:'relative',
              }}
              onMouseEnter={e=>{
                const el = e.currentTarget as HTMLElement
                el.style.transform='translateY(-6px)'
                el.style.boxShadow=`0 20px 48px ${lv.glow},0 6px 16px rgba(0,0,0,.08)`
                el.style.borderColor='transparent'
              }}
              onMouseLeave={e=>{
                const el = e.currentTarget as HTMLElement
                el.style.transform=''
                el.style.boxShadow=''
                el.style.borderColor=''
              }}
            >
              {/* Gradient top bar */}
              <div style={{ height:5,background:lv.gradient }} />

              {/* Completion shimmer */}
              {completed.has(lv.id) && (
                <div style={{
                  position:'absolute',inset:0,
                  background:`radial-gradient(ellipse at 50% 0%,${lv.glow} 0%,transparent 65%)`,
                  pointerEvents:'none',zIndex:0,
                }} />
              )}

              <div style={{ padding:'24px 24px 20px',position:'relative',zIndex:1 }}>
                {/* Level badge */}
                <div style={{
                  display:'inline-flex',alignItems:'center',justifyContent:'center',
                  width:40,height:40,borderRadius:'var(--radius-lg)',
                  background:lv.gradient,color:'white',
                  fontFamily:'var(--font-display)',fontSize:'.85rem',fontWeight:900,
                  marginBottom:16,
                  boxShadow:`0 4px 16px ${lv.glow}`,
                }}>{lv.num}</div>

                <div style={{
                  fontFamily:'var(--font-display)',fontSize:'1.08rem',fontWeight:800,
                  marginBottom:8,color:'var(--text-1)',letterSpacing:'-.02em',
                  lineHeight:1.25,
                }}>{lv.title}</div>

                <div style={{
                  fontSize:'.84rem',color:'var(--text-3)',lineHeight:1.65,marginBottom:18,
                }}>{lv.desc}</div>

                {/* Tags */}
                <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:18 }}>
                  {lv.tags.map(t => (
                    <span key={t} style={{
                      padding:'3px 11px',borderRadius:'9999px',
                      background:'var(--gray-100)',color:'var(--gray-600)',
                      fontSize:'.7rem',fontWeight:700,letterSpacing:'.01em',
                      border:'1px solid var(--gray-200)',
                    }}>{t}</span>
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ fontSize:'.75rem',color:'var(--text-4)',fontWeight:600,whiteSpace:'nowrap' }}>
                    ⏱ {lv.hours}
                  </span>
                  <div style={{ flex:1,height:5,background:'var(--gray-100)',borderRadius:3,overflow:'hidden' }}>
                    <div style={{
                      height:'100%',background:lv.gradient,borderRadius:3,
                      width:completed.has(lv.id)?'100%':'0%',
                      transition:'width 1.2s ease',
                      boxShadow:completed.has(lv.id)?`0 0 8px ${lv.glow}`:'none',
                    }} />
                  </div>
                  {completed.has(lv.id) && (
                    <span style={{ fontSize:'.72rem',color:lv.accent,fontWeight:800 }}>✓</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────── */}
      <section style={{
        background:'linear-gradient(160deg,#0f172a 0%,#1a1040 50%,#0f2040 100%)',
        padding:'80px 48px',
      }}>
        <div style={{ textAlign:'center',marginBottom:52 }}>
          <div style={{
            display:'inline-flex',gap:6,alignItems:'center',
            padding:'5px 16px',borderRadius:'9999px',
            background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)',
            fontSize:'.74rem',fontWeight:800,color:'rgba(255,255,255,.6)',
            textTransform:'uppercase',letterSpacing:'.08em',marginBottom:16,
          }}>⚡ Platform Features</div>
          <h2 style={{
            fontSize:'clamp(1.7rem,3.5vw,2.4rem)',marginBottom:12,color:'#fff',
            fontFamily:'var(--font-display)',letterSpacing:'-.03em',
          }}>Built for Engineers Who Learn by Doing</h2>
          <p style={{ color:'rgba(255,255,255,.5)',fontSize:'.97rem' }}>
            Everything you need to go from notebook to production pipeline.
          </p>
        </div>

        <div style={{
          display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',
          gap:18,maxWidth:1100,margin:'0 auto',
        }}>
          {FEATURES.map(([icon, title, desc, bg, border], i) => (
            <div key={String(title)} className="animate-slidein" style={{
              background:`linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.03))`,
              borderRadius:'var(--radius-xl)',
              border:'1px solid rgba(255,255,255,.08)',
              padding:'24px',
              animationDelay:`${i * 0.05}s`,
              transition:'all 240ms ease',
              backdropFilter:'blur(8px)',
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.09)';(e.currentTarget as HTMLElement).style.transform='translateY(-3px)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.03))';(e.currentTarget as HTMLElement).style.transform=''}}
            >
              <div style={{
                width:44,height:44,borderRadius:'var(--radius-lg)',
                background:`linear-gradient(135deg,${bg},${border})`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:'1.35rem',marginBottom:16,
              }}>{icon}</div>
              <div style={{
                fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:800,
                marginBottom:8,color:'#fff',letterSpacing:'-.02em',
              }}>{title}</div>
              <div style={{ fontSize:'.84rem',color:'rgba(255,255,255,.5)',lineHeight:1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer style={{
        background:'#080e1a',
        borderTop:'1px solid rgba(255,255,255,.06)',
        padding:'44px 48px',textAlign:'center',
      }}>
        <div style={{
          display:'flex',gap:6,justifyContent:'center',marginBottom:20,flexWrap:'wrap',
        }}>
          {[
            ['Foundations','/foundations','#4f8ef7'],
            ['SQL','/sql','#f59e0b'],
            ['Python','/python','#3b82f6'],
            ['Azure','/azure','#0078d4'],
            ['Spark','/spark','#f97316'],
            ['Delta Lake','/delta','#ef4444'],
            ['Airflow','/airflow','#00ad46'],
            ['Production','/production','#8b5cf6'],
            ['Interview','/interview','#ec4899'],
          ].map(([l,p,c]) => (
            <Link key={p} to={p} style={{
              color:c,padding:'5px 14px',borderRadius:'9999px',
              border:`1px solid ${c}30`,background:`${c}10`,
              fontSize:'.8rem',fontWeight:700,textDecoration:'none',
              transition:'all 180ms ease',
              fontFamily:'var(--font-sans)',
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`${c}20`}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=`${c}10`}}
            >{l}</Link>
          ))}
        </div>
        <p style={{ color:'rgba(255,255,255,.25)',fontSize:'.82rem',lineHeight:1.8 }}>
          © 2026 LearnWithMe — Data Engineering Learning Platform<br/>
          Built with React + TypeScript + Firebase + GitHub Pages
        </p>
      </footer>
    </div>
  )
}

function PipelineDemo() {
  const nodes = [
    { icon:'🔌', label:'Source Systems', color:'#bfdbfe' },
    { icon:'☁', label:'Ingest ADF', color:'#ddd6fe' },
    { icon:'🥉', label:'Bronze Raw', color:'#fde68a' },
    { icon:'⚡', label:'Spark Transform', color:'#bbf7d0' },
    { icon:'🥇', label:'Gold Delta', color:'#fed7aa' },
  ]

  return (
    <div style={{
      display:'flex',alignItems:'center',justifyContent:'center',
      flexWrap:'wrap',gap:0,padding:'24px 0 8px',
    }}>
      {nodes.map((n, i) => (
        <div key={i} style={{ display:'flex',alignItems:'center' }}>
          <div className="animate-popin" style={{
            display:'flex',flexDirection:'column',alignItems:'center',gap:8,
            padding:'14px 18px',
            background:`rgba(255,255,255,.07)`,
            border:`1.5px solid ${n.color}50`,
            borderRadius:'var(--radius-xl)',minWidth:94,
            backdropFilter:'blur(8px)',
            animationDelay:`${i * 0.1}s`,
            transition:'all 200ms ease',
          }}>
            <div style={{ fontSize:'1.6rem' }}>{n.icon}</div>
            <div style={{
              fontSize:'.68rem',fontWeight:700,color:'rgba(255,255,255,.75)',
              textAlign:'center',lineHeight:1.3,
              fontFamily:'var(--font-sans)',
            }}>{n.label}</div>
          </div>
          {i < nodes.length - 1 && (
            <div style={{
              width:32,textAlign:'center',
              color:'rgba(255,255,255,.3)',fontSize:'1rem',
              animation:'pulse 2s ease-in-out infinite',
              animationDelay:`${i * 0.15}s`,
            }}>→</div>
          )}
        </div>
      ))}
    </div>
  )
}
