import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

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
    num: '02', title: 'SQL  -  Fundamentals to Mastery',
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
    desc: 'System design, data mesh, CI/CD, Terraform, dbt, Data Vault 2.0, SCD types 1 - 6.',
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
  ['🎬', 'Auto-Playing Animations', 'Every concept has animated SVG illustrations  -  CPU pipelines, JOIN Venn diagrams, Spark DAGs, Delta transaction logs.', '#eff6ff', '#bfdbfe'],
  ['🧠', 'Knowledge Quizzes', 'Quiz after every topic with instant feedback. Firebase tracks your score, XP, and progress across sessions.', '#faf5ff', '#ddd6fe'],
  ['🔥', 'Streak Tracking', 'Daily study streaks tracked in Firebase. XP awarded for completing topics and quizzes. Stay consistent.', '#fffbeb', '#fde68a'],
  ['🔐', 'Google Sign-In', 'Sign in with Google or email. Progress synced across all your devices via Firebase Firestore.', '#f0fdf4', '#bbf7d0'],
  ['📋', 'Copy Code Blocks', 'Every code example has a one-click copy button. Fira Code ligatures for maximum readability.', '#ecfeff', '#a5f3fc'],
  ['🏆', 'Cert-Ready Content', 'Covers DP-203, Databricks Professional, and AZ-900. Aligned with what companies actually interview for.', '#fff7ed', '#fed7aa'],
]

const FOOTER_LINKS = [
  ['Foundations','/foundations','#4f8ef7'],
  ['SQL','/sql','#f59e0b'],
  ['Python','/python','#3b82f6'],
  ['Azure','/azure','#0078d4'],
  ['Spark','/spark','#f97316'],
  ['Delta Lake','/delta','#ef4444'],
  ['Airflow','/airflow','#00ad46'],
  ['Production','/production','#8b5cf6'],
  ['Interview','/interview','#ec4899'],
]

const HERO_STARS = [
  { top:'15%', left:'8%',  size:2,   delay:0   },
  { top:'25%', left:'92%', size:3,   delay:.5  },
  { top:'70%', left:'5%',  size:2,   delay:1   },
  { top:'60%', left:'88%', size:2.5, delay:1.5 },
  { top:'40%', left:'18%', size:1.5, delay:.8  },
  { top:'80%', left:'75%', size:2,   delay:.3  },
  { top:'10%', left:'55%', size:1.5, delay:1.2 },
  { top:'50%', left:'82%', size:2,   delay:.7  },
]

/* ── Animated developer signature ── */
function DevSignature() {
  const [hovered, setHovered] = useState(false)
  const [particles, setParticles] = useState<{id:number;x:number;y:number;color:string;size:number}[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // Burst particles on hover entry
  const spawnParticles = () => {
    const colors = ['#4f8ef7','#8b5cf6','#ec4899','#f59e0b','#22c55e','#06b6d4']
    const pts = Array.from({length: 12}, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[i % colors.length],
      size: 3 + Math.random() * 4,
    }))
    setParticles(pts)
    setTimeout(() => setParticles([]), 900)
  }

  const handleEnter = () => { setHovered(true); spawnParticles() }
  const handleLeave = () => { setHovered(false) }

  return (
    <div
      style={{ perspective: 900, display:'inline-block' }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div style={{
        position:'relative',
        display:'inline-flex', alignItems:'center', gap:16,
        padding:'14px 28px',
        borderRadius:20,
        background: hovered
          ? 'linear-gradient(135deg,rgba(79,142,247,.18),rgba(139,92,246,.22),rgba(236,72,153,.14))'
          : 'linear-gradient(135deg,rgba(79,142,247,.07),rgba(139,92,246,.09))',
        border: hovered
          ? '1px solid rgba(139,92,246,.55)'
          : '1px solid rgba(139,92,246,.2)',
        backdropFilter:'blur(16px)',
        boxShadow: hovered
          ? '0 0 0 1px rgba(139,92,246,.15), 0 8px 48px rgba(99,102,241,.28), 0 0 60px rgba(139,92,246,.12)'
          : '0 4px 24px rgba(99,102,241,.08)',
        transform: hovered ? 'translateY(-5px) scale(1.035)' : 'translateY(0) scale(1)',
        transition:'all .45s cubic-bezier(.22,1,.36,1)',
        cursor:'default',
        overflow:'hidden',
      }}>

        {/* Burst particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
            width:p.size, height:p.size, borderRadius:'50%',
            background:p.color, pointerEvents:'none',
            animation:'particleBurst .85s ease-out forwards',
          }}/>
        ))}

        {/* Shimmer sweep on hover */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(105deg,transparent 30%,rgba(255,255,255,.07) 50%,transparent 70%)',
          backgroundSize:'200% 100%',
          backgroundPosition: hovered ? '0% 0%' : '200% 0%',
          transition:'background-position .7s ease',
          borderRadius:20, pointerEvents:'none',
        }}/>

        {/* Avatar — morphs from K initial to emoji on hover */}
        <div style={{
          width:48, height:48, borderRadius:'50%', flexShrink:0,
          background: hovered
            ? 'linear-gradient(135deg,#ec4899,#8b5cf6,#4f8ef7)'
            : 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: hovered ? '1.5rem' : '1.05rem',
          fontWeight:900, color:'white',
          fontFamily: hovered ? 'inherit' : 'var(--font-mono)',
          boxShadow: hovered
            ? '0 0 0 3px rgba(139,92,246,.3), 0 0 28px rgba(139,92,246,.55)'
            : '0 0 16px rgba(79,142,247,.4)',
          transform: hovered ? 'rotate(360deg) scale(1.12)' : 'rotate(0deg) scale(1)',
          transition:'all .6s cubic-bezier(.34,1.56,.64,1)',
        }}>
          {hovered ? '⚡' : 'K'}
        </div>

        {/* Text block */}
        <div style={{ textAlign:'left', position:'relative' }}>
          <div style={{
            fontSize:'.72rem', fontWeight:800, letterSpacing:'.1em',
            textTransform:'uppercase',
            background:'linear-gradient(135deg,#93c5fd,#c4b5fd)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            fontFamily:'var(--font-display)',
            opacity: hovered ? 1 : 0.7,
            transition:'opacity .3s ease',
          }}>
            {hovered ? '⚡ Built with passion' : 'Crafted by'}
          </div>

          {/* Name — always fully visible */}
          <div style={{
            fontSize:'1.05rem', fontWeight:900, letterSpacing:'-.03em',
            fontFamily:'var(--font-display)',
            color: hovered ? '#f9a8d4' : 'rgba(255,255,255,.92)',
            transition:'color .4s ease',
          }}>
            Kavin Parithi Sivasamy
          </div>

          <div style={{
            fontSize:'.72rem', color:'rgba(255,255,255,.45)',
            fontFamily:'var(--font-sans)', letterSpacing:'.02em',
            marginTop:3,
          }}>
            Data Engineer
          </div>
        </div>

        {/* LinkedIn — appears on hover */}
        <a
          href="https://www.linkedin.com/in/kavinparithi"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'7px 16px', borderRadius:999,
            background:'rgba(10,102,194,.3)',
            border:'1px solid rgba(10,102,194,.5)',
            color:'#7dd3fc', fontSize:'.75rem', fontWeight:700,
            textDecoration:'none',
            fontFamily:'var(--font-sans)',
            opacity: 1,
            transform: hovered ? 'scale(1.05) translateX(0)' : 'scale(1) translateX(0)',
            transition:'all .4s cubic-bezier(.34,1.56,.64,1)',
            pointerEvents: 'auto',
            flexShrink:0,
          }}
          onClick={e => e.stopPropagation()}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Connect
        </a>
      </div>
    </div>
  )
}

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

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        }} />

        {/* Star dots */}
        {HERO_STARS.map((star, i) => (
          <div key={i} style={{
            position: 'absolute', top: star.top, left: star.left,
            width: star.size, height: star.size, borderRadius: '50%',
            background: 'white', pointerEvents: 'none',
            opacity: 0.7,
            boxShadow: `0 0 ${star.size * 3}px white`,
          }} />
        ))}

        <div className="animate-fadein" style={{ position:'relative',zIndex:1 }}>
          {/* Hero badge with pulsing ring */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
            {/* Pulsing ring behind badge */}
            <div style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '9999px',
              border: '1.5px solid rgba(139,92,246,.5)',
              opacity: 0.5,
              pointerEvents: 'none',
            }} />
            <div style={{
              display:'inline-flex',alignItems:'center',gap:8,
              padding:'6px 18px',borderRadius:'9999px',
              background:'rgba(255,255,255,.06)',
              border:'1px solid rgba(255,255,255,.12)',
              fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.7)',
              textTransform:'uppercase',letterSpacing:'.08em',
              backdropFilter:'blur(8px)',
            }}>
              🎓 Data Engineering Learning Platform
            </div>
          </div>

          <h1 style={{
            fontSize:'clamp(2.2rem,5.5vw,3.8rem)',
            fontWeight:900,letterSpacing:'-.04em',lineHeight:1.1,
            marginBottom:20,
            background:'linear-gradient(135deg,#ffffff 0%,#93c5fd 40%,#c4b5fd 70%,#f9a8d4 100%)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
            fontFamily:'var(--font-display)',
          }}>
            From Zero to Senior<br />Azure Data Engineer
          </h1>

          {/* Creator byline */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:10,
            marginBottom:28, marginTop:4,
          }}>
            <div style={{ height:1, width:40, background:'linear-gradient(90deg,transparent,rgba(255,255,255,.25))' }}/>
            <a
              href="https://www.linkedin.com/in/kavinparithi"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:'inline-flex', alignItems:'center', gap:7,
                textDecoration:'none',
                fontFamily:'var(--font-display)',
                fontSize:'clamp(.85rem,2vw,1rem)',
                fontWeight:800,
                letterSpacing:'-.01em',
                background:'linear-gradient(135deg,#93c5fd 0%,#c4b5fd 50%,#f9a8d4 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                transition:'filter .25s ease',
              }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.filter='brightness(1.25) drop-shadow(0 0 12px rgba(196,181,253,.6))'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.filter='none'}
            >
              <span style={{
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                width:26, height:26, borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
                fontSize:'.78rem', fontWeight:900, color:'white',
                WebkitTextFillColor:'white',
                boxShadow:'0 0 14px rgba(139,92,246,.55)',
              }}>K</span>
              Kavin Parithi Sivasamy
            </a>
            <div style={{ height:1, width:40, background:'linear-gradient(90deg,rgba(255,255,255,.25),transparent)' }}/>
          </div>

          {/* Hero punch quote */}
          <div style={{
            maxWidth:620, margin:'0 auto 40px',
            padding:'22px 32px',
            borderRadius:18,
            background:'linear-gradient(135deg,rgba(79,142,247,.08),rgba(139,92,246,.1),rgba(236,72,153,.07))',
            border:'1px solid rgba(139,92,246,.22)',
            backdropFilter:'blur(12px)',
            position:'relative', overflow:'hidden',
          }}>
            {/* decorative quote mark */}
            <div style={{
              position:'absolute', top:-10, left:20,
              fontSize:'8rem', lineHeight:1,
              color:'rgba(139,92,246,.12)',
              fontFamily:'Georgia, serif',
              fontWeight:900,
              pointerEvents:'none', userSelect:'none',
            }}>"</div>

            <p style={{
              margin:0,
              fontSize:'clamp(1rem,2.2vw,1.18rem)',
              fontWeight:700,
              fontFamily:'var(--font-display)',
              lineHeight:1.65,
              letterSpacing:'-.01em',
              color:'rgba(255,255,255,.88)',
              position:'relative', zIndex:1,
            }}>
              Built by a{' '}
              <span style={{
                background:'linear-gradient(135deg,#f9a8d4,#c4b5fd)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>Data Engineer</span>
              , powered by AI —{' '}
              <span style={{ color:'rgba(255,255,255,.55)', fontWeight:500 }}>for every person who dares to dream of becoming one.</span>
            </p>

            <p style={{
              margin:'14px 0 0',
              fontSize:'.88rem',
              fontFamily:'var(--font-sans)',
              color:'rgba(255,255,255,.4)',
              lineHeight:1.7,
              position:'relative', zIndex:1,
            }}>
              You don't need a perfect background. You need the right roadmap. This is yours.
            </p>
          </div>

          <div style={{ display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:56 }}>
            <button
              onClick={() => document.getElementById('learning-path')?.scrollIntoView({ behavior:'smooth' })}
              style={{
                padding:'14px 32px',borderRadius:'9999px',
                background:'linear-gradient(135deg,#4f8ef7,#8b5cf6,#ec4899)',
                color:'white',fontSize:'1rem',fontWeight:700,
                border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8,
                boxShadow:'0 4px 28px rgba(139,92,246,.45)',
                letterSpacing:'-.01em',fontFamily:'var(--font-display)',
              }}
            >▶ Start Learning</button>
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
            {STATS.map((s, i) => (
              <div key={s.l} className="animate-popin" style={{
                textAlign:'center',padding:'14px 24px',
                background:'rgba(255,255,255,.07)',
                border:'1px solid rgba(255,255,255,.1)',
                borderRadius:'var(--radius-xl)',
                backdropFilter:'blur(8px)',
                minWidth:110,
                animation:'countUp 0.4s ease backwards',
                animationDelay:`${i * 0.1}s`,
              }}>
                <div style={{ fontSize:'1.4rem',marginBottom:4 }}>{s.icon}</div>
                <div style={{
                  fontFamily:'var(--font-display)',fontSize:'1.9rem',fontWeight:900,
                  letterSpacing:'-.03em',lineHeight:1.1,
                  background:'linear-gradient(135deg,#ffffff 0%,#93c5fd 100%)',
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                }}>{s.n}</div>
                <div style={{ fontSize:'.72rem',color:'rgba(255,255,255,.5)',fontWeight:600,marginTop:4,textTransform:'uppercase',letterSpacing:'.06em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEVEL CARDS ─────────────────────── */}
      <section id="learning-path" style={{ padding:'80px 48px',background:'var(--bg)' }}>
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
            <LevelCard key={lv.id} lv={lv} i={i} completed={completed} />
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
            <FeatureCard key={String(title)} icon={icon} title={title} desc={desc} bg={bg} border={border} i={i} />
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer style={{
        background:'#080e1a',
        borderTop:'1px solid rgba(255,255,255,.06)',
        padding:'52px 48px 40px',
        textAlign:'center',
      }}>
        {/* Gradient top border line */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg,transparent,#4f8ef7,#8b5cf6,#ec4899,transparent)',
          marginBottom: 40,
        }} />

        {/* Watermark logo */}
        <div style={{ marginBottom: 24, opacity: 0.15 }}>
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
            <path d="M20 3L35.5885 12V28L20 37L4.41154 28V12L20 3Z" fill="url(#footerGrad)" />
            <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="14" x2="24" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
            <line x1="24" y1="14" x2="16" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
            <circle cx="20" cy="20" r="4" fill="white" />
            <circle cx="28" cy="20" r="2.5" fill="white" fillOpacity="0.9"/>
            <circle cx="14" cy="13" r="2" fill="white" fillOpacity="0.8"/>
            <circle cx="14" cy="27" r="2" fill="white" fillOpacity="0.8"/>
            <defs>
              <linearGradient id="footerGrad" x1="4" y1="3" x2="36" y2="37" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4f8ef7"/>
                <stop offset=".5" stopColor="#8b5cf6"/>
                <stop offset="1" stopColor="#ec4899"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: '.9rem',
          color: 'rgba(255,255,255,.35)',
          marginBottom: 28,
          letterSpacing: '.01em',
        }}>
          Built with ❤️ for the Data Engineering community
        </p>

        <div style={{
          display:'flex',gap:10,justifyContent:'center',marginBottom:28,flexWrap:'wrap',
        }}>
          {FOOTER_LINKS.map(([l, p, c]) => (
            <Link key={p} to={p} style={{
              color: c,
              padding: '6px 16px',
              borderRadius: '9999px',
              border: `1px solid ${c}30`,
              background: `${c}10`,
              fontSize: '.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 180ms ease',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '.01em',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${c}22`; (e.currentTarget as HTMLElement).style.borderColor = `${c}55` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${c}10`; (e.currentTarget as HTMLElement).style.borderColor = `${c}30` }}
            >{l}</Link>
          ))}
        </div>

        <p style={{ color:'rgba(255,255,255,.18)',fontSize:'.78rem',lineHeight:2,marginBottom:28 }}>
          © 2026 learnDE · Data Engineering Learning Platform · Built with React + TypeScript + Firebase
        </p>

        {/* Developer signature */}
        <DevSignature />
      </footer>

      {/* Keyframe injection for glowPulse and pulse */}
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes particleBurst {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(calc((var(--rx,1) - 0.5) * 80px), calc((var(--ry,1) - 0.5) * 80px)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

/* ── Level Card (extracted to support hover state on arrow) ── */
function LevelCard({ lv, i, completed }: {
  lv: typeof LEVELS[number]
  i: number
  completed: Set<string>
}) {
  const isDone = completed.has(lv.id)

  return (
    <Link
      to={lv.path}
      data-color={lv.accent}
      className="animate-slidein"
      style={{
        background:'var(--bg-card)',borderRadius:'var(--radius-2xl)',
        border:'1.5px solid var(--border)',overflow:'hidden',
        textDecoration:'none',display:'block',
        transition:'all 260ms ease',
        animationDelay:`${i * 0.045}s`,
        position:'relative',
        cursor:'pointer',
      }}
      onMouseEnter={e=>{
        const el = e.currentTarget as HTMLElement
        el.style.transform='translateY(-6px)'
        el.style.boxShadow=`0 20px 48px ${lv.glow},0 6px 16px rgba(0,0,0,.08)`
        el.style.borderColor='transparent'
        // shimmer on top bar
        const bar = el.querySelector('.level-top-bar') as HTMLElement | null
        if (bar) bar.style.backgroundPosition='200% center'
        // slide-in arrow
        const arrow = el.querySelector('.level-arrow') as HTMLElement | null
        if (arrow) { arrow.style.opacity='1'; arrow.style.transform='translateX(0)' }
      }}
      onMouseLeave={e=>{
        const el = e.currentTarget as HTMLElement
        el.style.transform=''
        el.style.boxShadow=''
        el.style.borderColor=''
        const bar = el.querySelector('.level-top-bar') as HTMLElement | null
        if (bar) bar.style.backgroundPosition='0% center'
        const arrow = el.querySelector('.level-arrow') as HTMLElement | null
        if (arrow) { arrow.style.opacity='0'; arrow.style.transform='translateX(-6px)' }
      }}
    >
      {/* Gradient top bar — 6px with shimmer sweep */}
      <div
        className="level-top-bar"
        style={{
          height:6,
          background:`${lv.gradient}, linear-gradient(90deg,transparent 0%,rgba(255,255,255,.45) 50%,transparent 100%)`,
          backgroundSize:'200% 100%',
          backgroundPosition:'0% center',
          transition:'background-position 600ms ease',
        }}
      />

      {/* Radial glow always visible at 40% */}
      <div style={{
        position:'absolute',inset:0,
        background:`radial-gradient(ellipse at 50% 0%,${lv.glow} 0%,transparent 65%)`,
        opacity:0.4,
        pointerEvents:'none',zIndex:0,
      }} />

      {/* Completed: Done badge top-right */}
      {isDone && (
        <div style={{
          position:'absolute',top:16,right:16,
          background:'linear-gradient(135deg,#22c55e,#16a34a)',
          color:'white',fontSize:'.68rem',fontWeight:800,
          padding:'3px 10px',borderRadius:'9999px',
          letterSpacing:'.03em',zIndex:2,
          boxShadow:'0 2px 8px rgba(34,197,94,.4)',
        }}>✓ Done</div>
      )}

      <div style={{ padding:'24px 24px 20px',position:'relative',zIndex:1 }}>
        {/* Level badge — 44x44, checkmark if done */}
        <div style={{
          display:'inline-flex',alignItems:'center',justifyContent:'center',
          width:44,height:44,borderRadius:'var(--radius-lg)',
          background: isDone ? 'linear-gradient(135deg,#22c55e,#16a34a)' : lv.gradient,
          color:'white',
          fontFamily:'var(--font-display)',fontSize:'.85rem',fontWeight:900,
          marginBottom:16,
          boxShadow: isDone
            ? '0 4px 20px rgba(34,197,94,.4), 0 2px 8px rgba(0,0,0,.2)'
            : `0 4px 20px ${lv.glow}, 0 2px 8px rgba(0,0,0,.2)`,
        }}>{isDone ? '✓' : lv.num}</div>

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

        {/* Progress bar row + arrow */}
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <span style={{ fontSize:'.75rem',color:'var(--text-4)',fontWeight:600,whiteSpace:'nowrap' }}>
            ⏱ {lv.hours}
          </span>
          <div style={{ flex:1,height:5,background:'var(--gray-100)',borderRadius:3,overflow:'hidden' }}>
            <div style={{
              height:'100%',background:lv.gradient,borderRadius:3,
              width:isDone?'100%':'0%',
              transition:'width 1.2s ease',
              boxShadow:isDone?`0 0 8px ${lv.glow}`:'none',
            }} />
          </div>
          {isDone && (
            <span style={{ fontSize:'.72rem',color:lv.accent,fontWeight:800 }}>✓</span>
          )}
          {/* Arrow that slides in on hover */}
          <span
            className="level-arrow"
            style={{
              fontSize:'.9rem',color:lv.accent,fontWeight:800,
              opacity:0,
              transform:'translateX(-6px)',
              transition:'opacity 220ms ease, transform 220ms ease',
              display:'inline-block',
              lineHeight:1,
            }}
          >→</span>
        </div>
      </div>
    </Link>
  )
}

/* ── Feature Card (extracted to support icon hover state) ── */
function FeatureCard({ icon, title, desc, bg, border, i }: {
  icon: string
  title: string
  desc: string
  bg: string
  border: string
  i: number
}) {
  return (
    <div
      className="animate-slidein"
      style={{
        background:`linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.03))`,
        borderRadius:'var(--radius-xl)',
        border:'1px solid rgba(255,255,255,.08)',
        padding:'24px',
        animationDelay:`${i * 0.05}s`,
        transition:'all 240ms ease',
        backdropFilter:'blur(8px)',
      }}
      onMouseEnter={e=>{
        const el = e.currentTarget as HTMLElement
        el.style.background='rgba(255,255,255,.09)'
        el.style.transform='translateY(-3px)'
        const iconEl = el.querySelector('.feature-icon') as HTMLElement | null
        if (iconEl) iconEl.style.transform='scale(1.15) rotate(-5deg)'
      }}
      onMouseLeave={e=>{
        const el = e.currentTarget as HTMLElement
        el.style.background='linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.03))'
        el.style.transform=''
        const iconEl = el.querySelector('.feature-icon') as HTMLElement | null
        if (iconEl) iconEl.style.transform=''
      }}
    >
      <div
        className="feature-icon"
        style={{
          width:44,height:44,borderRadius:'var(--radius-lg)',
          background:`linear-gradient(135deg,${bg},${border})`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'1.35rem',marginBottom:16,
          transition:'transform 250ms ease',
        }}
      >{icon}</div>
      <div style={{
        fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:800,
        marginBottom:8,color:'#fff',letterSpacing:'-.02em',
      }}>{title}</div>
      <div style={{ fontSize:'.84rem',color:'rgba(255,255,255,.5)',lineHeight:1.7 }}>{desc}</div>
    </div>
  )
}

/* ── Pipeline SVG Demo ── */
function PipelineDemo() {
  const nodes = [
    { icon:'🔌', label:'Source Systems',  grad:['#3b5fc0','#4f8ef7'], x:50  },
    { icon:'☁',  label:'Ingest ADF',      grad:['#6d3fc0','#818cf8'], x:190 },
    { icon:'🥉', label:'Bronze Raw',      grad:['#b45309','#f59e0b'], x:330 },
    { icon:'⚡', label:'Spark Transform', grad:['#166534','#22c55e'], x:470 },
    { icon:'🥇', label:'Gold Delta',      grad:['#9a3412','#f97316'], x:610 },
  ]

  const nodeW = 90
  const nodeH = 70
  const nodeRx = 12
  const cy = 60

  return (
    <div style={{ padding:'24px 0 8px', maxWidth:700, margin:'0 auto', width:'100%' }}>
      <svg
        viewBox="0 0 700 120"
        width="100%"
        style={{ maxWidth:700, display:'block', margin:'0 auto', overflow:'visible' }}
        aria-label="Data pipeline diagram"
      >
        <defs>
          {nodes.map((n, i) => (
            <linearGradient key={`grad${i}`} id={`nodeGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={n.grad[0]} />
              <stop offset="100%" stopColor={n.grad[1]} />
            </linearGradient>
          ))}

          {/* Connector line gradient */}
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f8ef7" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Connector lines between nodes */}
        {nodes.slice(0,-1).map((_n, i) => {
          const lineX1 = nodes[i].x + nodeW
          const lineX2 = nodes[i+1].x
          return (
            <g key={`conn${i}`}>
              {/* Dashed animated line */}
              <line
                x1={lineX1} y1={cy}
                x2={lineX2} y2={cy}
                stroke="url(#lineGrad)"
                strokeWidth="2"
                strokeDasharray="6 4"
                style={{
                  animation:`dashFlow 1.4s linear infinite`,
                  animationDelay:`${i * 0.28}s`,
                }}
              />
              {/* Flowing dot along the connector */}
              <circle r="4" fill="#c4b5fd" opacity="0.9">
                <animateMotion
                  dur="1.4s"
                  repeatCount="indefinite"
                  begin={`${i * 0.28}s`}
                >
                  <mpath xlinkHref={`#connPath${i}`} />
                </animateMotion>
              </circle>
              {/* Hidden path for animateMotion */}
              <path
                id={`connPath${i}`}
                d={`M ${lineX1} ${cy} L ${lineX2} ${cy}`}
                fill="none"
                stroke="none"
              />
            </g>
          )
        })}

        {/* Node rects + labels */}
        {nodes.map((n, i) => (
          <g key={`node${i}`} style={{ animation:`fadeInUp 0.4s ease backwards`, animationDelay:`${i * 0.09}s` }}>
            {/* Drop shadow filter inline */}
            <rect
              x={n.x} y={cy - nodeH / 2}
              width={nodeW} height={nodeH}
              rx={nodeRx} ry={nodeRx}
              fill={`url(#nodeGrad${i})`}
              opacity="0.92"
              filter="drop-shadow(0 4px 12px rgba(0,0,0,0.35))"
            />
            {/* Subtle inner border */}
            <rect
              x={n.x} y={cy - nodeH / 2}
              width={nodeW} height={nodeH}
              rx={nodeRx} ry={nodeRx}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
            {/* Emoji */}
            <text
              x={n.x + nodeW / 2} y={cy - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="22"
            >{n.icon}</text>
            {/* Label — two lines if needed */}
            {n.label.split(' ').length > 1 ? (
              <>
                <text
                  x={n.x + nodeW / 2} y={cy + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="rgba(255,255,255,0.9)"
                  fontFamily="var(--font-sans, sans-serif)"
                >{n.label.split(' ').slice(0, Math.ceil(n.label.split(' ').length / 2)).join(' ')}</text>
                <text
                  x={n.x + nodeW / 2} y={cy + 25}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="rgba(255,255,255,0.9)"
                  fontFamily="var(--font-sans, sans-serif)"
                >{n.label.split(' ').slice(Math.ceil(n.label.split(' ').length / 2)).join(' ')}</text>
              </>
            ) : (
              <text
                x={n.x + nodeW / 2} y={cy + 19}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="rgba(255,255,255,0.9)"
                fontFamily="var(--font-sans, sans-serif)"
              >{n.label}</text>
            )}
          </g>
        ))}

        <style>{`
          @keyframes dashFlow {
            from { stroke-dashoffset: 0; }
            to   { stroke-dashoffset: -20; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes countUp {
            from { opacity: 0; transform: translateY(10px) scale(0.92); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </svg>
    </div>
  )
}
