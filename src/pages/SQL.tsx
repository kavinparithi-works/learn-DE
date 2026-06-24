import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete, unmarkTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: (id?: string) => void; onUnmark: (id: string) => void; onSignInNeeded: () => void }

const SECTIONS = [
  { title: 'Level 3  -  SQL Foundations', items: [
    { id: 'sql-select',   label: 'SELECT Basics' },
    { id: 'sql-distinct', label: 'DISTINCT' },
    { id: 'sql-nulls',    label: 'NULL Handling' },
    { id: 'sql-case',     label: 'CASE WHEN' },
    { id: 'sql-strings',  label: 'String Functions' },
    { id: 'sql-dates',    label: 'Date & Time' },
    { id: 'sql-agg',      label: 'Aggregations' },
    { id: 'sql-groupby',  label: 'GROUP BY' },
  ]},
  { title: 'Level 4  -  SQL Intermediate', items: [
    { id: 'sql-joins',      label: 'JOINs' },
    { id: 'sql-antijoin',   label: 'Anti / Semi JOINs' },
    { id: 'sql-subqueries', label: 'Subqueries' },
    { id: 'sql-setops',     label: 'SET Ops' },
    { id: 'sql-cte',        label: 'CTEs' },
    { id: 'sql-window',     label: 'Window Functions' },
    { id: 'sql-frames',     label: 'Window Frames' },
  ]},
  { title: 'Level 5  -  SQL Mastery', items: [
    { id: 'sql-pivot',         label: 'PIVOT' },
    { id: 'sql-json',          label: 'JSON in SQL' },
    { id: 'sql-dml',           label: 'DML' },
    { id: 'sql-ddl',           label: 'DDL' },
    { id: 'sql-views',         label: 'Views' },
    { id: 'sql-transactions',  label: 'Transactions' },
    { id: 'sql-normalization', label: 'Normalization' },
    { id: 'sql-indexes',       label: 'Indexes' },
    { id: 'sql-execution',     label: 'EXPLAIN Plans' },
    { id: 'sql-patterns',      label: 'SQL Patterns' },
    { id: 'sql-performance',   label: 'Performance' },
  ]},
]

// ─── Animated Venn Diagram ───────────────────────────────────────────────────
const JOIN_TYPES = [
  { label: 'INNER JOIN',       left: false, overlap: true,  right: false, sql: 'SELECT * FROM orders o\nINNER JOIN customers c ON o.customer_id = c.id' },
  { label: 'LEFT JOIN',        left: true,  overlap: true,  right: false, sql: 'SELECT * FROM orders o\nLEFT JOIN customers c ON o.customer_id = c.id' },
  { label: 'RIGHT JOIN',       left: false, overlap: true,  right: true,  sql: 'SELECT * FROM orders o\nRIGHT JOIN customers c ON o.customer_id = c.id' },
  { label: 'FULL OUTER JOIN',  left: true,  overlap: true,  right: true,  sql: 'SELECT * FROM orders o\nFULL OUTER JOIN customers c ON o.customer_id = c.id' },
  { label: 'LEFT ANTI JOIN',   left: true,  overlap: false, right: false, sql: 'SELECT * FROM orders o\nLEFT JOIN customers c ON o.customer_id = c.id\nWHERE c.id IS NULL' },
]

function JoinVennDiagram() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const jt = JOIN_TYPES[idx]

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIdx(i => (i + 1) % JOIN_TYPES.length), 2500)
    return () => clearInterval(t)
  }, [paused])

  return (
    <div className="venn-container" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {JOIN_TYPES.map((j, i) => (
          <button key={j.label} onClick={() => { setIdx(i); setPaused(true) }}
            style={{ padding: '4px 12px', borderRadius: '999px', border: `2px solid ${i === idx ? '#6366f1' : '#e2e8f0'}`,
              background: i === idx ? '#6366f1' : 'white', color: i === idx ? 'white' : '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>
            {j.label}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 300 160" width="300" height="160" style={{ margin: '0 auto', display: 'block' }}>
        <circle cx="110" cy="80" r="60" fill={jt.left ? '#818cf880' : '#e2e8f040'} stroke="#6366f1" strokeWidth="2" />
        <circle cx="190" cy="80" r="60" fill={jt.right ? '#34d39980' : '#e2e8f040'} stroke="#10b981" strokeWidth="2" />
        {jt.overlap && (
          <ellipse cx="150" cy="80" rx="28" ry="48" fill="#f59e0b80" />
        )}
        <text x="85"  y="84" textAnchor="middle" fontSize="11" fill="#4338ca" fontWeight="600">Orders</text>
        <text x="215" y="84" textAnchor="middle" fontSize="11" fill="#059669" fontWeight="600">Customers</text>
      </svg>
      <div style={{ marginTop: '0.75rem', background: '#1e293b', borderRadius: '8px', padding: '12px', textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#e2e8f0', maxWidth: '420px', margin: '0.75rem auto 0' }}>
        {jt.sql}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────── SQL DIAGRAM COMPONENTS ──

function SelectOrderDiagram() {
  const steps = [
    {n:'1','label':'FROM / JOIN','color':'#4f8ef7'},
    {n:'2','label':'WHERE','color':'#8b5cf6'},
    {n:'3','label':'GROUP BY','color':'#f59e0b'},
    {n:'4','label':'HAVING','color':'#ef4444'},
    {n:'5','label':'SELECT','color':'#22c55e'},
    {n:'6','label':'DISTINCT','color':'#ec4899'},
    {n:'7','label':'ORDER BY','color':'#06b6d4'},
    {n:'8','label':'LIMIT / OFFSET','color':'#64748b'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 50" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">SQL Logical Execution Order</text>
        {steps.map((s,i)=>(
          <g key={s.n}>
            <rect x={4+i*64} y="18" width="58" height="24" rx="5" fill={s.color} opacity=".18" stroke={s.color} strokeWidth="1.5"/>
            <text x={33+i*64} y="27" fontSize="7.5" fontWeight="700" fill={s.color} textAnchor="middle">{s.n}</text>
            <text x={33+i*64} y="37" fontSize="7" fill="#1e293b" textAnchor="middle">{s.label}</text>
            {i<steps.length-1&&<polygon points={`${62+i*64},30 ${62+i*64},26 ${67+i*64},30`} fill={s.color} opacity=".7"/>}
          </g>
        ))}
      </svg>
    </div>
  )
}

function DistinctDiagram() {
  const before = ['NY','NY','CA','TX','CA','NY','TX']
  const after = ['NY','CA','TX']
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 400 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">DISTINCT — Remove Duplicates</text>
        {before.map((v,i)=>(
          <g key={i}>
            <rect x={4+i*36} y="18" width="30" height="20" rx="3" fill={after.includes(v)&&before.indexOf(v)===i?'#4f8ef7':'#ef4444'} opacity=".18" stroke={after.includes(v)&&before.indexOf(v)===i?'#4f8ef7':'#ef4444'} strokeWidth="1"/>
            <text x={19+i*36} y="32" fontSize="9" fill="#1e293b" textAnchor="middle">{v}</text>
          </g>
        ))}
        <text x="4" y="55" fontSize="8" fill="#ef4444">Red = duplicate removed</text>
        <text x="4" y="68" fontSize="8" fill="#64748b">After DISTINCT:</text>
        {after.map((v,i)=>(
          <g key={v}>
            <rect x={90+i*40} y="58" width="34" height="18" rx="3" fill="#4f8ef7" opacity=".18" stroke="#4f8ef7" strokeWidth="1.2"/>
            <text x={107+i*40} y="71" fontSize="9" fill="#1e293b" textAnchor="middle">{v}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function NullsDiagram() {
  const rows = [
    {a:'TRUE',b:'NULL',and:'NULL',or:'TRUE'},
    {a:'FALSE',b:'NULL',and:'FALSE',or:'NULL'},
    {a:'NULL',b:'NULL',and:'NULL',or:'NULL'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 400 95" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Three-Valued Logic with NULL</text>
        {['A','B','A AND B','A OR B'].map((h,i)=><text key={h} x={10+i*95} y="26" fontSize="9" fontWeight="700" fill="#475569">{h}</text>)}
        <line x1="4" y1="30" x2="396" y2="30" stroke="#e2e8f0" strokeWidth="1"/>
        {rows.map((r,ri)=>(
          <g key={ri}>
            {[r.a,r.b,r.and,r.or].map((v,ci)=>(
              <text key={ci} x={10+ci*95} y={44+ri*17} fontSize="9" fontFamily="monospace"
                fill={v==='NULL'?'#ef4444':v==='TRUE'?'#16a34a':'#64748b'}>{v}</text>
            ))}
          </g>
        ))}
        <text x="4" y="90" fontSize="8" fill="#94a3b8">NULL = unknown — always use IS NULL / IS NOT NULL, never = NULL</text>
      </svg>
    </div>
  )
}

function CaseDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 110" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">CASE Expression — Decision Tree</text>
        <rect x="195" y="18" width="90" height="20" rx="4" fill="#4f8ef7" opacity=".18" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="240" y="32" fontSize="9" fill="#1e293b" textAnchor="middle">CASE input</text>
        {[{cond:'score >= 90',val:"'A'",x:80,color:'#22c55e'},{cond:'score >= 70',val:"'B'",x:240,color:'#f59e0b'},{cond:'ELSE',val:"'F'",x:390,color:'#ef4444'}].map(b=>(
          <g key={b.cond}>
            <line x1="240" y1="38" x2={b.x} y2="58" stroke="#94a3b8" strokeWidth="1"/>
            <rect x={b.x-55} y="58" width="110" height="18" rx="4" fill={b.color} opacity=".18" stroke={b.color} strokeWidth="1.2"/>
            <text x={b.x} y="65" fontSize="7.5" fill="#64748b" textAnchor="middle">{b.cond}</text>
            <text x={b.x} y="73" fontSize="8" fontWeight="700" fill={b.color} textAnchor="middle">→ {b.val}</text>
            <rect x={b.x-30} y="82" width="60" height="16" rx="3" fill={b.color} opacity=".25" stroke={b.color} strokeWidth="1"/>
            <text x={b.x} y="93" fontSize="9" fontWeight="700" fill={b.color} textAnchor="middle">{b.val}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function StringsDiagram() {
  const ops = [
    {fn:'UPPER()',input:'"hello"',out:'"HELLO"',color:'#4f8ef7'},
    {fn:'TRIM()',input:'"  hi  "',out:'"hi"',color:'#8b5cf6'},
    {fn:'LENGTH()',input:'"data"',out:'4',color:'#22c55e'},
    {fn:'REPLACE()',input:'"a-b","−","_"',out:'"a_b"',color:'#f59e0b'},
    {fn:'SUBSTRING(1,3)',input:'"pipeline"',out:'"pip"',color:'#ef4444'},
    {fn:'CONCAT()',input:'"foo","bar"',out:'"foobar"',color:'#ec4899'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 115" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">String Functions</text>
        {ops.map((o,i)=>(
          <g key={o.fn}>
            <rect x={4+(i%3)*172} y={18+Math.floor(i/3)*44} width="165" height="36" rx="5" fill={o.color} opacity=".1" stroke={o.color} strokeWidth="1.2"/>
            <text x={12+(i%3)*172} y={34+Math.floor(i/3)*44} fontSize="9" fontWeight="700" fontFamily="monospace" fill={o.color}>{o.fn}</text>
            <text x={12+(i%3)*172} y={46+Math.floor(i/3)*44} fontSize="8" fill="#64748b">{o.input} → <tspan fontWeight="700" fill="#1e293b">{o.out}</tspan></text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DatesDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 100" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Date Functions</text>
        {[
          {fn:'DATE_TRUNC("month", d)',input:'2024-07-15',out:'2024-07-01',color:'#4f8ef7'},
          {fn:'EXTRACT(YEAR FROM d)',input:'2024-07-15',out:'2024',color:'#8b5cf6'},
          {fn:'DATEDIFF(d1, d2)',input:'2024-01-15, 2024-01-01',out:'14 days',color:'#22c55e'},
          {fn:'DATE_FORMAT(d, "MM/dd")',input:'2024-07-15',out:'"07/15"',color:'#f59e0b'},
          {fn:'CURRENT_DATE()',input:'(no input)',out:'today\'s date',color:'#ef4444'},
          {fn:'ADD_MONTHS(d, 3)',input:'2024-01-15',out:'2024-04-15',color:'#ec4899'},
        ].map((o,i)=>(
          <g key={o.fn}>
            <rect x={4+(i%3)*172} y={18+Math.floor(i/3)*38} width="165" height="30" rx="4" fill={o.color} opacity=".1" stroke={o.color} strokeWidth="1.1"/>
            <text x={12+(i%3)*172} y={32+Math.floor(i/3)*38} fontSize="8.5" fontWeight="700" fontFamily="monospace" fill={o.color}>{o.fn}</text>
            <text x={12+(i%3)*172} y={43+Math.floor(i/3)*38} fontSize="7.5" fill="#64748b">{o.input} → <tspan fontWeight="700" fill="#1e293b">{o.out}</tspan></text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function AggDiagram() {
  const vals = [100,200,null,300,150]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 110" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Aggregate Functions</text>
        {vals.map((v,i)=>(
          <g key={i}>
            <rect x={4+i*50} y="18" width="44" height="22" rx="3" fill={v===null?'#ef4444':'#4f8ef7'} opacity=".18" stroke={v===null?'#ef4444':'#4f8ef7'} strokeWidth="1"/>
            <text x={26+i*50} y="33" fontSize="10" fill={v===null?'#ef4444':'#1e293b'} textAnchor="middle">{v===null?'NULL':v}</text>
          </g>
        ))}
        <text x="4" y="55" fontSize="8" fill="#ef4444">NULL is ignored by SUM/AVG/MIN/MAX but counted by COUNT(*)</text>
        {[
          {fn:'COUNT(*)',result:'5',color:'#4f8ef7'},
          {fn:'COUNT(col)',result:'4',color:'#8b5cf6'},
          {fn:'SUM',result:'750',color:'#22c55e'},
          {fn:'AVG',result:'187.5',color:'#f59e0b'},
          {fn:'MIN',result:'100',color:'#ef4444'},
          {fn:'MAX',result:'300',color:'#ec4899'},
        ].map((a,i)=>(
          <g key={a.fn}>
            <rect x={4+i*78} y="62" width="72" height="20" rx="3" fill={a.color} opacity=".15" stroke={a.color} strokeWidth="1"/>
            <text x={40+i*78} y="70" fontSize="7.5" fontWeight="700" fill={a.color} textAnchor="middle">{a.fn}</text>
            <text x={40+i*78} y="79" fontSize="9" fontWeight="800" fill="#1e293b" textAnchor="middle">{a.result}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function GroupByDiagram() {
  const rows = [{r:'NY',amt:100},{r:'CA',amt:200},{r:'NY',amt:150},{r:'CA',amt:300},{r:'TX',amt:250}]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 440 100" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">GROUP BY — Bucket → Aggregate</text>
        {rows.map((r,i)=>(
          <g key={i}>
            <rect x={4+i*52} y="18" width="46" height="22" rx="3" fill={r.r==='NY'?'#4f8ef7':r.r==='CA'?'#8b5cf6':'#22c55e'} opacity=".18" stroke={r.r==='NY'?'#4f8ef7':r.r==='CA'?'#8b5cf6':'#22c55e'} strokeWidth="1"/>
            <text x={27+i*52} y="27" fontSize="8" fill="#64748b" textAnchor="middle">{r.r}</text>
            <text x={27+i*52} y="36" fontSize="9" fontWeight="700" fill="#1e293b" textAnchor="middle">{r.amt}</text>
          </g>
        ))}
        <text x="4" y="56" fontSize="8" fill="#94a3b8">↓ GROUP BY region → SUM(amount)</text>
        {[{r:'NY',sum:250,color:'#4f8ef7'},{r:'CA',sum:500,color:'#8b5cf6'},{r:'TX',sum:250,color:'#22c55e'}].map((g,i)=>(
          <g key={g.r}>
            <rect x={4+i*100} y="62" width="90" height="26" rx="4" fill={g.color} opacity=".2" stroke={g.color} strokeWidth="1.5"/>
            <text x={49+i*100} y="72" fontSize="9" fontWeight="700" fill={g.color} textAnchor="middle">{g.r}</text>
            <text x={49+i*100} y="83" fontSize="10" fontWeight="800" fill="#1e293b" textAnchor="middle">SUM={g.sum}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function JoinsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 100" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">SQL JOIN Types</text>
        {[
          {type:'INNER',lFill:'#4f8ef7',rFill:'#4f8ef7',oFill:'#4f8ef7',lOp:.08,rOp:.08,oOp:.5,x:30},
          {type:'LEFT',lFill:'#22c55e',rFill:'#22c55e',oFill:'#22c55e',lOp:.5,rOp:.08,oOp:.5,x:150},
          {type:'RIGHT',lFill:'#f59e0b',rFill:'#f59e0b',oFill:'#f59e0b',lOp:.08,rOp:.5,oOp:.5,x:270},
          {type:'FULL',lFill:'#8b5cf6',rFill:'#8b5cf6',oFill:'#8b5cf6',lOp:.5,rOp:.5,oOp:.5,x:390},
        ].map(j=>(
          <g key={j.type}>
            <ellipse cx={j.x+26} cy="60" rx="26" ry="22" fill={j.lFill} opacity={j.lOp} stroke={j.lFill} strokeWidth="1.5"/>
            <ellipse cx={j.x+46} cy="60" rx="26" ry="22" fill={j.rFill} opacity={j.rOp} stroke={j.rFill} strokeWidth="1.5"/>
            <text x={j.x+36} y="96" fontSize="8" fontWeight="700" fill={j.lFill} textAnchor="middle">{j.type}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function AntiJoinDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 380 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Anti-Join — Rows in A NOT IN B</text>
        <ellipse cx="120" cy="52" rx="55" ry="32" fill="#ef4444" opacity=".25" stroke="#ef4444" strokeWidth="2"/>
        <text x="90" y="48" fontSize="9" fontWeight="700" fill="#ef4444">Table A</text>
        <text x="90" y="60" fontSize="7.5" fill="#475569">unmatched rows</text>
        <ellipse cx="220" cy="52" rx="55" ry="32" fill="#4f8ef7" opacity=".1" stroke="#4f8ef7" strokeWidth="1.5" strokeDasharray="4 2"/>
        <text x="230" y="52" fontSize="9" fill="#4f8ef7">Table B</text>
        <text x="230" y="62" fontSize="7" fill="#94a3b8">(excluded)</text>
        <text x="4" y="86" fontSize="8" fill="#64748b">Result: rows from A where the join key has NO match in B</text>
      </svg>
    </div>
  )
}

function SubqueriesDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 440 110" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Subquery Nesting</text>
        <rect x="10" y="20" width="420" height="80" rx="6" fill="#4f8ef7" opacity=".06" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="20" y="35" fontSize="8.5" fontFamily="monospace" fill="#4f8ef7">SELECT * FROM (</text>
        <rect x="40" y="40" width="350" height="44" rx="5" fill="#8b5cf6" opacity=".1" stroke="#8b5cf6" strokeWidth="1.2"/>
        <text x="52" y="55" fontSize="8.5" fontFamily="monospace" fill="#8b5cf6">  SELECT region, SUM(amount) FROM (</text>
        <rect x="70" y="60" width="290" height="18" rx="4" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1"/>
        <text x="82" y="72" fontSize="8" fontFamily="monospace" fill="#22c55e">    SELECT * FROM raw_events WHERE dt = '2024'</text>
        <text x="52" y="84" fontSize="8.5" fontFamily="monospace" fill="#8b5cf6">  ) t GROUP BY region</text>
        <text x="20" y="96" fontSize="8.5" fontFamily="monospace" fill="#4f8ef7">) outer WHERE sum_amount &gt; 1000</text>
      </svg>
    </div>
  )
}

function SetOpsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Set Operations</text>
        {[
          {op:'UNION ALL',desc:'Stack A + B (keep dups)',color:'#4f8ef7',x:10},
          {op:'UNION',desc:'Stack A + B (dedup)',color:'#8b5cf6',x:170},
          {op:'INTERSECT',desc:'Rows in both A and B',color:'#22c55e',x:330},
        ].map(s=>(
          <g key={s.op}>
            <rect x={s.x} y="20" width="150" height="56" rx="6" fill={s.color} opacity=".1" stroke={s.color} strokeWidth="1.5"/>
            <text x={s.x+75} y="36" fontSize="9" fontWeight="700" fill={s.color} textAnchor="middle">{s.op}</text>
            <text x={s.x+75} y="50" fontSize="7.5" fill="#475569" textAnchor="middle">{s.desc}</text>
            <text x={s.x+75} y="66" fontSize="7.5" fill="#94a3b8" textAnchor="middle">Must have same columns</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function CTEDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 85" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">CTE Chain — WITH Clauses</text>
        {[
          {name:'raw',query:'SELECT * FROM events',color:'#4f8ef7',x:10},
          {name:'cleaned',query:'SELECT … FROM raw WHERE …',color:'#8b5cf6',x:170},
          {name:'agg',query:'SELECT … FROM cleaned GROUP BY …',color:'#22c55e',x:340},
        ].map((c,i)=>(
          <g key={c.name}>
            <rect x={c.x} y="20" width="150" height="52" rx="5" fill={c.color} opacity=".12" stroke={c.color} strokeWidth="1.5"/>
            <text x={c.x+10} y="34" fontSize="8" fontWeight="700" fill={c.color}>WITH {c.name} AS (</text>
            <text x={c.x+10} y="48" fontSize="7.5" fill="#475569">{c.query}</text>
            <text x={c.x+10} y="62" fontSize="8" fill={c.color}>)</text>
            {i<2&&<polygon points={`${c.x+155},46 ${c.x+163},42 ${c.x+163},50`} fill={c.color} opacity=".7"/>}
          </g>
        ))}
      </svg>
    </div>
  )
}

function WindowFuncDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 105" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Window Function Structure</text>
        {['user_1 | 100','user_1 | 200','user_2 | 150','user_2 | 300','user_2 | 50'].map((r,i)=>(
          <g key={i}>
            <rect x="10" y={18+i*14} width="150" height="12" rx="2" fill={i<2?'#4f8ef7':'#8b5cf6'} opacity={.12+i*.04}/>
            <text x="16" y={28+i*14} fontSize="8" fontFamily="monospace" fill="#1e293b">{r}</text>
          </g>
        ))}
        <rect x="8" y="16" width="154" height="28" rx="3" fill="none" stroke="#4f8ef7" strokeWidth="2" strokeDasharray="4 2"/>
        <text x="168" y="28" fontSize="7.5" fill="#4f8ef7">PARTITION BY user</text>
        <rect x="8" y="44" width="154" height="42" rx="3" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 2"/>
        <text x="168" y="58" fontSize="7.5" fill="#8b5cf6">partition 2</text>
        <text x="200" y="76" fontSize="8" fill="#f59e0b">ORDER BY amount DESC</text>
        <text x="4" y="96" fontSize="8" fill="#64748b">fn() OVER (PARTITION BY col ORDER BY col ROWS BETWEEN …)</text>
      </svg>
    </div>
  )
}

function FramesDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 440 110" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Window Frames — ROWS BETWEEN</text>
        {[10,20,30,40,50].map((v,i)=>(
          <g key={i}>
            <rect x={10+i*72} y="20" width="60" height="36" rx="4" fill={i===2?'#f59e0b':i===1||i===3?'#4f8ef7':'#e2e8f0'} opacity={i===2?'.35':i===1||i===3?'.2':'.15'} stroke={i===2?'#f59e0b':i===1||i===3?'#4f8ef7':'#94a3b8'} strokeWidth={i===2?2:1}/>
            <text x={40+i*72} y="35" fontSize="9" fill="#1e293b" textAnchor="middle">row {i+1}</text>
            <text x={40+i*72} y="47" fontSize="10" fontWeight="700" fill="#1e293b" textAnchor="middle">{v}</text>
          </g>
        ))}
        <rect x="82" y="18" width="204" height="40" rx="4" fill="none" stroke="#4f8ef7" strokeWidth="2" strokeDasharray="5 2"/>
        <text x="184" y="72" fontSize="8" fill="#4f8ef7" textAnchor="middle">ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING</text>
        <text x="40+72*2" y="85" fontSize="8" fill="#f59e0b" textAnchor="middle">CURRENT ROW</text>
        <text x="4" y="104" fontSize="7.5" fill="#64748b">Frame = rows included in each calculation relative to current row</text>
      </svg>
    </div>
  )
}

function PivotDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 105" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">PIVOT — Rows to Columns</text>
        {/* Before */}
        <text x="10" y="26" fontSize="8.5" fontWeight="700" fill="#64748b">Before:</text>
        {[['region','year','sales'],['NY','2023','100'],['NY','2024','150'],['CA','2023','200'],['CA','2024','250']].map((r,i)=>(
          <g key={i}>
            {r.map((c,j)=>(
              <g key={j}>
                <rect x={10+j*55} y={30+i*12} width="52" height="11" rx="1" fill={i===0?'#1e293b':'white'} opacity={i===0?.8:.9}/>
                <text x={36+j*55} y={39+i*12} fontSize="7.5" fill={i===0?'white':'#1e293b'} textAnchor="middle">{c}</text>
              </g>
            ))}
          </g>
        ))}
        <polygon points="190,60 200,55 200,65" fill="#f59e0b"/>
        <text x="206" y="63" fontSize="8" fill="#f59e0b">PIVOT</text>
        {/* After */}
        {[['region','2023','2024'],['NY','100','150'],['CA','200','250']].map((r,i)=>(
          <g key={i}>
            {r.map((c,j)=>(
              <g key={j}>
                <rect x={250+j*68} y={30+i*16} width="64" height="13" rx="1" fill={i===0?'#1e293b':'white'} opacity={i===0?.8:.9}/>
                <text x={282+j*68} y={41+i*16} fontSize="8" fill={i===0?'white':'#1e293b'} textAnchor="middle">{c}</text>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  )
}

function JSONSQLDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 115" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">JSON — Nested Document Tree</text>
        <rect x="10" y="20" width="440" height="86" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
        <text x="20" y="36" fontSize="8.5" fontFamily="monospace" fill="#f59e0b">{'{'}</text>
        <text x="30" y="50" fontSize="8.5" fontFamily="monospace" fill="#4f8ef7">  "order_id": <tspan fill="#22c55e">1</tspan>,</text>
        <text x="30" y="63" fontSize="8.5" fontFamily="monospace" fill="#4f8ef7">  "customer": {'{'}<tspan fill="#8b5cf6">"id": 42, "name": "Alice"</tspan>{'}'}</text>
        <text x="30" y="76" fontSize="8.5" fontFamily="monospace" fill="#4f8ef7">  "items": [{'{'}<tspan fill="#ef4444">"sku":"A","qty":2</tspan>{'}'}, {'{'}<tspan fill="#ef4444">"sku":"B","qty":1</tspan>{'}'}]</text>
        <text x="20" y="90" fontSize="8.5" fontFamily="monospace" fill="#f59e0b">{'}'}</text>
        <text x="4" y="111" fontSize="8" fill="#64748b">Access: order:customer.name  order:items[0].sku  (Spark) or -&gt;&gt; (Postgres)</text>
      </svg>
    </div>
  )
}

function DMLDiagram() {
  const ops = [
    {op:'INSERT',desc:'Add new rows',color:'#22c55e',icon:'+'},
    {op:'UPDATE',desc:'Modify existing rows',color:'#f59e0b',icon:'✎'},
    {op:'DELETE',desc:'Remove rows',color:'#ef4444',icon:'✕'},
    {op:'MERGE',desc:'Upsert: insert+update+delete in one',color:'#8b5cf6',icon:'⇄'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 70" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">DML Operations</text>
        {ops.map((o,i)=>(
          <g key={o.op}>
            <rect x={4+i*113} y="18" width="108" height="42" rx="6" fill={o.color} opacity=".12" stroke={o.color} strokeWidth="1.5"/>
            <text x={58+i*113} y="35" fontSize="14" fill={o.color} textAnchor="middle">{o.icon}</text>
            <text x={58+i*113} y="48" fontSize="9" fontWeight="700" fill={o.color} textAnchor="middle">{o.op}</text>
            <text x={58+i*113} y="58" fontSize="7.5" fill="#475569" textAnchor="middle">{o.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DDLDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 110" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">DDL Object Hierarchy</text>
        <rect x="175" y="20" width="110" height="18" rx="4" fill="#1e293b" opacity=".08" stroke="#1e293b" strokeWidth="1.2"/>
        <text x="230" y="33" fontSize="9" fontWeight="700" fill="#1e293b" textAnchor="middle">Database / Catalog</text>
        <line x1="230" y1="38" x2="230" y2="50" stroke="#4f8ef7" strokeWidth="1.2"/>
        <rect x="155" y="50" width="150" height="18" rx="4" fill="#4f8ef7" opacity=".15" stroke="#4f8ef7" strokeWidth="1.2"/>
        <text x="230" y="63" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Schema / Namespace</text>
        <line x1="230" y1="68" x2="230" y2="80" stroke="#8b5cf6" strokeWidth="1.2"/>
        {['Table','View','Index','Function'].map((o,i)=>(
          <g key={o}>
            <rect x={10+i*110} y="80" width="98" height="18" rx="4" fill="#8b5cf6" opacity=".12" stroke="#8b5cf6" strokeWidth="1"/>
            <text x={59+i*110} y="93" fontSize="8.5" fill="#8b5cf6" textAnchor="middle">{o}</text>
            <line x1="230" y1="80" x2={59+i*110} y2="80" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 2"/>
          </g>
        ))}
      </svg>
    </div>
  )
}

function ViewsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 440 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Views — Stored Query, Not Data</text>
        <rect x="10" y="20" width="100" height="50" rx="5" fill="#4f8ef7" opacity=".15" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="60" y="38" fontSize="8.5" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Base Table</text>
        <text x="60" y="50" fontSize="7.5" fill="#475569" textAnchor="middle">raw_orders</text>
        <text x="60" y="60" fontSize="7.5" fill="#94a3b8" textAnchor="middle">1M rows</text>
        <line x1="110" y1="45" x2="150" y2="45" stroke="#f59e0b" strokeWidth="2"/>
        <polygon points="147,41 155,45 147,49" fill="#f59e0b"/>
        <rect x="155" y="28" width="120" height="34" rx="5" fill="#f59e0b" opacity=".15" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 2"/>
        <text x="215" y="43" fontSize="8.5" fontWeight="700" fill="#f59e0b" textAnchor="middle">VIEW: active_orders</text>
        <text x="215" y="55" fontSize="7.5" fill="#475569" textAnchor="middle">WHERE status='active'</text>
        <line x1="275" y1="45" x2="315" y2="45" stroke="#22c55e" strokeWidth="2"/>
        <polygon points="312,41 320,45 312,49" fill="#22c55e"/>
        <rect x="320" y="28" width="110" height="34" rx="5" fill="#22c55e" opacity=".12" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="375" y="43" fontSize="8.5" fontWeight="700" fill="#22c55e" textAnchor="middle">Query runs</text>
        <text x="375" y="55" fontSize="7.5" fill="#475569" textAnchor="middle">on base table</text>
        <text x="4" y="86" fontSize="8" fill="#64748b">Materialized view = results stored; regular view = query rewritten at runtime</text>
      </svg>
    </div>
  )
}

function TransactionsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Transaction Lifecycle</text>
        {['BEGIN','op 1','op 2','op 3','COMMIT'].map((s,i)=>(
          <g key={s}>
            <rect x={10+i*88} y="20" width="76" height="28" rx="5" fill={s==='BEGIN'?'#4f8ef7':s==='COMMIT'?'#22c55e':'#f8fafc'} opacity={s==='BEGIN'||s==='COMMIT'?.25:.8} stroke={s==='BEGIN'?'#4f8ef7':s==='COMMIT'?'#22c55e':'#e2e8f0'} strokeWidth="1.5"/>
            <text x={48+i*88} y="38" fontSize="9" fontWeight="700" fill={s==='BEGIN'?'#4f8ef7':s==='COMMIT'?'#22c55e':'#475569'} textAnchor="middle">{s}</text>
            {i<4&&<line x1={86+i*88} y1="34" x2={98+i*88} y2="34" stroke="#22c55e" strokeWidth="1.5"/>}
            {i<4&&<polygon points={`${95+i*88},30 ${103+i*88},34 ${95+i*88},38`} fill="#22c55e"/>}
          </g>
        ))}
        <text x="10" y="62" fontSize="8" fill="#22c55e">Success path: all ops succeed → COMMIT persists atomically</text>
        <text x="10" y="75" fontSize="8" fill="#ef4444">Failure path: any op fails → ROLLBACK undoes all ops</text>
      </svg>
    </div>
  )
}

function NormalizationDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Normalization — 1NF → 2NF → 3NF</text>
        {[
          {label:'1NF',desc:'Atomic values\nNo repeating groups',color:'#f59e0b',x:10},
          {label:'2NF',desc:'No partial dependencies\non composite key',color:'#4f8ef7',x:175},
          {label:'3NF',desc:'No transitive deps\nbetween non-key cols',color:'#22c55e',x:340},
        ].map((n,i)=>(
          <g key={n.label}>
            <rect x={n.x} y="20" width="150" height="55" rx="6" fill={n.color} opacity=".12" stroke={n.color} strokeWidth="1.5"/>
            <text x={n.x+75} y="36" fontSize="11" fontWeight="800" fill={n.color} textAnchor="middle">{n.label}</text>
            {n.desc.split('\n').map((d,j)=><text key={j} x={n.x+75} y={50+j*14} fontSize="7.5" fill="#475569" textAnchor="middle">{d}</text>)}
            {i<2&&<polygon points={`${n.x+155},47 ${n.x+163},43 ${n.x+163},51`} fill={n.color} opacity=".7"/>}
          </g>
        ))}
      </svg>
    </div>
  )
}

function IndexesDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 115" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">B-Tree Index Structure</text>
        {/* Root */}
        <rect x="175" y="18" width="110" height="20" rx="4" fill="#4f8ef7" opacity=".25" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="230" y="32" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Root [50 | 150]</text>
        {/* Branch nodes */}
        {[{label:'Branch [20|40]',x:80},{label:'Branch [80|120]',x:230},{label:'Branch [200|250]',x:360}].map((b)=>(
          <g key={b.label}>
            <line x1="230" y1="38" x2={b.x+55} y2="55" stroke="#4f8ef7" strokeWidth="1" strokeDasharray="3 2"/>
            <rect x={b.x} y="55" width="110" height="18" rx="3" fill="#8b5cf6" opacity=".18" stroke="#8b5cf6" strokeWidth="1.2"/>
            <text x={b.x+55} y="67" fontSize="8" fill="#8b5cf6" textAnchor="middle">{b.label}</text>
          </g>
        ))}
        {/* Leaf nodes */}
        <text x="4" y="90" fontSize="8" fill="#64748b">Leaf nodes → row pointers (heap tuples)</text>
        {[10,20,30,40,50,60,70].map((v,i)=>(
          <g key={v}>
            <rect x={4+i*62} y="95" width="56" height="14" rx="2" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1"/>
            <text x={32+i*62} y="106" fontSize="7.5" fontFamily="monospace" fill="#1e293b" textAnchor="middle">key={v}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function ExecutionPlanDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 440 120" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Query Execution Plan Tree</text>
        {[
          {label:'Result',cost:'cost=0',x:175,y:18,color:'#22c55e'},
          {label:'Sort (order_date)',cost:'cost=520',x:175,y:46,color:'#4f8ef7'},
          {label:'Hash Aggregate',cost:'cost=480',x:175,y:74,color:'#8b5cf6'},
          {label:'Hash Join',cost:'cost=320',x:175,y:100,color:'#f59e0b'},
        ].map((n,i)=>(
          <g key={n.label}>
            <rect x={n.x} y={n.y} width="150" height="18" rx="4" fill={n.color} opacity=".18" stroke={n.color} strokeWidth="1.2"/>
            <text x={n.x+75} y={n.y+11} fontSize="8.5" fontWeight="600" fill="#1e293b" textAnchor="middle">{n.label}</text>
            <text x={n.x+148} y={n.y+11} fontSize="7.5" fill="#64748b">{n.cost}</text>
            {i<3&&<line x1={n.x+75} y1={n.y+18} x2={n.x+75} y2={n.y+28} stroke={n.color} strokeWidth="1" strokeDasharray="3 2"/>}
          </g>
        ))}
        {[{label:'Seq Scan orders',x:60},{label:'Index Scan users',x:310}].map(s=>(
          <g key={s.label}>
            <rect x={s.x} y="100" width="120" height="15" rx="3" fill="#ef4444" opacity=".15" stroke="#ef4444" strokeWidth="1"/>
            <text x={s.x+60} y="111" fontSize="7.5" fill="#ef4444" textAnchor="middle">{s.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function PatternsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 100" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">SCD Type 2 — Row Lifecycle</text>
        {[['id','name','city','valid_from','valid_to','current'],['1','Alice','NY','2022-01-01','2024-03-15','false'],['2','Alice','Boston','2024-03-15','9999-12-31','true']].map((r,i)=>(
          <g key={i}>
            {r.map((c,j)=>(
              <g key={j}>
                <rect x={4+j*78} y={16+i*22} width="74" height="18" rx="2" fill={i===0?'#1e293b':i===2?'#22c55e':'#f8fafc'} opacity={i===0?.8:i===2?.18:.9}/>
                <text x={41+j*78} y={29+i*22} fontSize="7.5" fontFamily="monospace" fill={i===0?'white':i===1?'#94a3b8':'#1e293b'} textAnchor="middle">{c}</text>
              </g>
            ))}
          </g>
        ))}
        <text x="4" y="78" fontSize="8" fill="#94a3b8">Row 1 closed (valid_to set) when Alice moved. Row 2 is current.</text>
        <text x="4" y="90" fontSize="8" fill="#64748b">Surrogate key (sk) + natural key + validity dates = full history</text>
      </svg>
    </div>
  )
}

function PerformanceSQLDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Scan Strategies — Cost Comparison</text>
        {[
          {label:'Sequential Scan',pages:'all 1000 pages',cost:'High',color:'#ef4444'},
          {label:'Index Scan',pages:'3–10 pages via B-tree',cost:'Low',color:'#22c55e'},
          {label:'Bitmap Heap Scan',pages:'batch of index pages',cost:'Medium',color:'#f59e0b'},
        ].map((s,i)=>(
          <g key={s.label}>
            <rect x="8" y={18+i*18} width="200" height="14" rx="3" fill={s.color} opacity=".15" stroke={s.color} strokeWidth="1.2"/>
            <text x="14" y={29+i*18} fontSize="8.5" fontWeight="600" fill="#1e293b">{s.label}</text>
            <text x="215" y={29+i*18} fontSize="8" fill="#64748b">{s.pages}</text>
            <text x="415" y={29+i*18} fontSize="8.5" fontWeight="700" fill={s.color} textAnchor="end">Cost: {s.cost}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ─── Strings animation ───────────────────────────────────────────────────────
function StringsAnimation() {
  const [input, setInput] = useState('  Hello World  ')
  const ops = [
    { name:'TRIM', fn: (s:string) => s.trim() },
    { name:'UPPER', fn: (s:string) => s.toUpperCase() },
    { name:'LOWER', fn: (s:string) => s.toLowerCase() },
    { name:'LENGTH', fn: (s:string) => String(s.length) },
    { name:'LEFT(5)', fn: (s:string) => s.slice(0,5) },
    { name:'REPLACE(" ","_")', fn: (s:string) => s.replaceAll(' ','_') },
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>String Function Live Demo</div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <label style={{ fontSize:'.85rem', color:'var(--text-secondary)' }}>Input:</label>
        <input value={input} onChange={e=>setInput(e.target.value)} style={{ flex:1, padding:'6px 10px', borderRadius:8, border:'1.5px solid var(--border)', fontFamily:'monospace', fontSize:'.88rem' }} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:8 }}>
        {ops.map(op => (
          <div key={op.name} style={{ padding:'8px 12px', background:'white', border:'1px solid var(--border)', borderRadius:8 }}>
            <div style={{ fontFamily:'monospace', fontSize:'.72rem', color:'#4f8ef7', marginBottom:4 }}>{op.name}</div>
            <div style={{ fontFamily:'monospace', fontWeight:700, color:'#1e293b', fontSize:'.82rem', wordBreak:'break-all' }}>"{op.fn(input)}"</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Date animation ───────────────────────────────────────────────────────────
function DateAnimation() {
  const [date, setDate] = useState('2024-07-15 14:30:00')
  const ops = [
    { name:"DATE_TRUNC('month')", fn: (s:string) => { const d=new Date(s); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01` } },
    { name:"DATE_TRUNC('year')", fn: (s:string) => `${new Date(s).getFullYear()}-01-01` },
    { name:"EXTRACT(YEAR)", fn: (s:string) => String(new Date(s).getFullYear()) },
    { name:"EXTRACT(MONTH)", fn: (s:string) => String(new Date(s).getMonth()+1) },
    { name:"EXTRACT(DOW)", fn: (s:string) => String(new Date(s).getDay()) },
    { name:"TO_DATE", fn: (s:string) => s.split(' ')[0] },
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Date Function Live Demo</div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <label style={{ fontSize:'.85rem', color:'var(--text-secondary)' }}>Timestamp:</label>
        <input value={date} onChange={e=>setDate(e.target.value)} style={{ flex:1, padding:'6px 10px', borderRadius:8, border:'1.5px solid var(--border)', fontFamily:'monospace', fontSize:'.88rem' }} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:8 }}>
        {ops.map(op => { let result=''; try { result=op.fn(date) } catch { result='(invalid)' } return (
          <div key={op.name} style={{ padding:'8px 12px', background:'white', border:'1px solid var(--border)', borderRadius:8 }}>
            <div style={{ fontFamily:'monospace', fontSize:'.72rem', color:'#8b5cf6', marginBottom:4 }}>{op.name}</div>
            <div style={{ fontFamily:'monospace', fontWeight:700, color:'#1e293b', fontSize:'.85rem' }}>{result}</div>
          </div>
        )})}
      </div>
    </div>
  )
}

// ─── Aggregation animation ─────────────────────────────────────────────────────
function AggAnimation() {
  const data = [100, 200, null, 150, 300, null, 250]
  const noNulls = data.filter((v): v is number => v !== null)
  const results = [
    { fn:'COUNT(*)', val: data.length, note:'includes NULLs' },
    { fn:'COUNT(amount)', val: noNulls.length, note:'ignores NULLs' },
    { fn:'SUM(amount)', val: noNulls.reduce((s,v)=>s+v,0), note:'' },
    { fn:'AVG(amount)', val: Math.round(noNulls.reduce((s,v)=>s+v,0)/noNulls.length), note:'ignores NULLs' },
    { fn:'MIN(amount)', val: Math.min(...noNulls), note:'' },
    { fn:'MAX(amount)', val: Math.max(...noNulls), note:'' },
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Aggregate Functions with NULLs</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {data.map((v,i) => (
          <div key={i} style={{ padding:'5px 10px', borderRadius:6, background:v===null?'#fef2f2':'white', border:`1px solid ${v===null?'#fecaca':'var(--border)'}`, fontFamily:'monospace', fontSize:'.82rem', color:v===null?'#ef4444':'#1e293b' }}>{v===null?'NULL':v}</div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:8 }}>
        {results.map(r => (
          <div key={r.fn} style={{ padding:'8px 12px', background:'white', border:'1px solid var(--border)', borderRadius:8 }}>
            <div style={{ fontFamily:'monospace', fontSize:'.72rem', color:'#22c55e', marginBottom:4 }}>{r.fn}</div>
            <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:'1rem', color:'#1e293b' }}>{r.val}</div>
            {r.note && <div style={{ fontSize:'.68rem', color:'#f59e0b', marginTop:4 }}>{r.note}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SELECT logical order ────────────────────────────────────────────────────
function SelectOrderAnimation() {
  const [step, setStep] = useState(-1)
  const steps = [
    { clause: 'FROM', color: '#94a3b8', desc: 'Load the table(s) into memory' },
    { clause: 'JOIN', color: '#8b5cf6', desc: 'Combine with related tables' },
    { clause: 'WHERE', color: '#ef4444', desc: 'Filter rows before grouping' },
    { clause: 'GROUP BY', color: '#f59e0b', desc: 'Collapse rows into groups' },
    { clause: 'HAVING', color: '#f97316', desc: 'Filter groups after aggregation' },
    { clause: 'SELECT', color: '#22c55e', desc: 'Compute output columns (aliases defined here)' },
    { clause: 'ORDER BY', color: '#4f8ef7', desc: 'Sort the result set' },
    { clause: 'LIMIT', color: '#06b6d4', desc: 'Restrict number of rows returned' },
  ]
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % steps.length), 900)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>SQL Logical Processing Order</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', background: i === step ? s.color : 'white', color: i === step ? '#fff' : 'var(--text-muted)', border: `1.5px solid ${i <= step ? s.color : 'var(--border)'}`, fontFamily: 'monospace', fontWeight: 700, fontSize: '.82rem', transition: 'all .2s' }}>
            {i + 1}. {s.clause}
          </div>
        ))}
      </div>
      {step >= 0 && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: `${steps[step].color}18`, border: `1px solid ${steps[step].color}40`, fontFamily: 'monospace', fontSize: '.85rem', color: steps[step].color }}>
          {steps[step].clause}: {steps[step].desc}
        </div>
      )}
      <div style={{ marginTop: 10, fontSize: '.75rem', color: 'var(--text-muted)' }}>⚠️ SELECT is step 6 — you cannot reference a SELECT alias in WHERE</div>
    </div>
  )
}

// ─── DISTINCT animation ───────────────────────────────────────────────────────
function DistinctAnimation() {
  const rows = [
    { id: 1, customer: 'Alice', category: 'Electronics' },
    { id: 2, customer: 'Bob',   category: 'Clothing' },
    { id: 3, customer: 'Alice', category: 'Electronics' },
    { id: 4, customer: 'Carol', category: 'Books' },
    { id: 5, customer: 'Bob',   category: 'Electronics' },
  ]
  const [mode, setMode] = useState<'all'|'distinct'>('all')
  const displayed = mode === 'all' ? rows : rows.filter((r, i, arr) => arr.findIndex(x => x.customer === r.customer && x.category === r.category) === i)
  const dupes = rows.length - displayed.length
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {(['all', 'distinct'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: '5px 16px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${m === 'all' ? '#94a3b8' : '#22c55e'}`, background: mode === m ? (m === 'all' ? '#94a3b8' : '#22c55e') : 'transparent', color: mode === m ? '#fff' : (m === 'all' ? '#94a3b8' : '#22c55e'), fontWeight: 600, fontSize: '.82rem', cursor: 'pointer' }}>{m === 'all' ? 'All rows' : 'DISTINCT customer, category'}</button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
        <thead><tr style={{ background: 'var(--surface-3)' }}>{['id','customer','category'].map(h => <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontWeight: 700 }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map(r => {
            const hidden = mode === 'distinct' && displayed.findIndex(d => d.id === r.id) === -1
            return (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', opacity: hidden ? 0.2 : 1, background: hidden ? '#fef2f2' : 'white', transition: 'opacity .3s' }}>
                <td style={{ padding: '7px 12px' }}>{r.id}</td>
                <td style={{ padding: '7px 12px', fontWeight: 600 }}>{r.customer}</td>
                <td style={{ padding: '7px 12px' }}>{r.category}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {mode === 'distinct' && <div style={{ marginTop: 8, fontSize: '.78rem', color: '#ef4444' }}>Removed {dupes} duplicate row(s) — row 3 (Alice/Electronics) is a dup of row 1</div>}
    </div>
  )
}

// ─── NULL handling animation ──────────────────────────────────────────────────
function NullAnimation() {
  const rows = [
    { id: 1, amount: 100, discount: 10 },
    { id: 2, amount: 200, discount: null },
    { id: 3, amount:  50, discount: null },
    { id: 4, amount: 150, discount: 20 },
  ]
  const [fn, setFn] = useState<'raw'|'coalesce'|'count'>('raw')
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {([['raw','Raw NULLs'],['coalesce','COALESCE(discount,0)'],['count','COUNT(*) vs COUNT(discount)']] as const).map(([k,l]) => (
          <button key={k} onClick={() => setFn(k)} style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${fn===k?'#f59e0b':'var(--border)'}`, background: fn===k?'#f59e0b':'white', color: fn===k?'#fff':'var(--text-secondary)', fontWeight: 600, fontSize: '.78rem', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {fn !== 'count' ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
          <thead><tr style={{ background: 'var(--surface-3)' }}>{['id','amount',fn==='raw'?'discount':'COALESCE(discount,0)'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontWeight:700 }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: r.discount === null && fn==='raw' ? '#fef2f2' : 'white' }}>
                <td style={{ padding:'7px 12px' }}>{r.id}</td>
                <td style={{ padding:'7px 12px' }}>{r.amount}</td>
                <td style={{ padding:'7px 12px', color: r.discount === null ? '#ef4444' : 'inherit', fontWeight: r.discount === null ? 700 : 400 }}>
                  {fn==='raw' ? (r.discount === null ? 'NULL' : r.discount) : (r.discount ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['COUNT(*)', rows.length, 'Counts ALL rows including NULLs', '#22c55e'],['COUNT(discount)', rows.filter(r=>r.discount!==null).length, 'Ignores NULL rows', '#4f8ef7']].map(([name,val,note,color]) => (
            <div key={String(name)} style={{ padding:'12px 16px', background:'white', border:`1.5px solid ${color}40`, borderRadius:8, textAlign:'center' }}>
              <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:'1.1rem', color: String(color) }}>{String(val)}</div>
              <div style={{ fontFamily:'monospace', fontSize:'.78rem', color:'var(--text-secondary)', marginTop:4 }}>{String(name)}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text-muted)', marginTop:6, lineHeight:1.4 }}>{String(note)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── CASE WHEN animation ──────────────────────────────────────────────────────
function CaseAnimation() {
  const amounts = [30, 120, 600, 2500]
  const bucket = (a: number) => a < 50 ? { label:'Small', color:'#94a3b8' } : a < 200 ? { label:'Medium', color:'#22c55e' } : a < 1000 ? { label:'Large', color:'#f59e0b' } : { label:'Enterprise', color:'#8b5cf6' }
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>CASE WHEN — value bucketing</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {amounts.map(a => {
          const b = bucket(a)
          return (
            <div key={a} style={{ flex: '1 1 120px', padding: '12px 14px', background: `${b.color}18`, border: `1.5px solid ${b.color}`, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: b.color }}>${a}</div>
              <div style={{ marginTop: 6, fontWeight: 700, color: b.color, fontSize: '.82rem' }}>→ {b.label}</div>
            </div>
          )
        })}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--text-secondary)', background: '#0d1117', borderRadius: 8, padding: '10px 14px', lineHeight: 1.8 }}>
        <span style={{ color: '#4f8ef7' }}>CASE</span>{'\n'}
        {'  '}<span style={{ color: '#f59e0b' }}>WHEN</span> amount {'<'} 50   <span style={{ color: '#f59e0b' }}>THEN</span> <span style={{ color: '#22c55e' }}>'Small'</span>{'\n'}
        {'  '}<span style={{ color: '#f59e0b' }}>WHEN</span> amount {'<'} 200  <span style={{ color: '#f59e0b' }}>THEN</span> <span style={{ color: '#22c55e' }}>'Medium'</span>{'\n'}
        {'  '}<span style={{ color: '#f59e0b' }}>WHEN</span> amount {'<'} 1000 <span style={{ color: '#f59e0b' }}>THEN</span> <span style={{ color: '#22c55e' }}>'Large'</span>{'\n'}
        {'  '}<span style={{ color: '#f59e0b' }}>ELSE</span> <span style={{ color: '#22c55e' }}>'Enterprise'</span>{'\n'}
        <span style={{ color: '#4f8ef7' }}>END</span>
      </div>
    </div>
  )
}

// ─── GROUP BY / ROLLUP animation ──────────────────────────────────────────────
function GroupByAnimation() {
  const data = [
    { region:'EU', cat:'Electronics', rev:300 },
    { region:'EU', cat:'Clothing',    rev:150 },
    { region:'US', cat:'Electronics', rev:500 },
    { region:'US', cat:'Clothing',    rev:200 },
  ]
  const [mode, setMode] = useState<'group'|'rollup'>('group')
  const grouped = data.map(r => ({ ...r }))
  const rollup = [
    ...data,
    { region:'EU', cat:'(subtotal)', rev: data.filter(r=>r.region==='EU').reduce((s,r)=>s+r.rev,0) },
    { region:'US', cat:'(subtotal)', rev: data.filter(r=>r.region==='US').reduce((s,r)=>s+r.rev,0) },
    { region:'(grand)', cat:'(total)', rev: data.reduce((s,r)=>s+r.rev,0) },
  ]
  const rows = mode === 'group' ? grouped : rollup
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {([['group','GROUP BY'],['rollup','GROUP BY ROLLUP']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setMode(k)} style={{ padding:'5px 16px', borderRadius:'var(--radius-full)', border:`1.5px solid ${k==='group'?'#4f8ef7':'#8b5cf6'}`, background:mode===k?(k==='group'?'#4f8ef7':'#8b5cf6'):'transparent', color:mode===k?'#fff':(k==='group'?'#4f8ef7':'#8b5cf6'), fontWeight:600, fontSize:'.82rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
        <thead><tr style={{ background:'var(--surface-3)' }}>{['region','category','revenue'].map(h=><th key={h} style={{ padding:'7px 12px', textAlign:'left', fontWeight:700 }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r,i) => {
            const isSubtotal = 'cat' in r && (r.cat === '(subtotal)' || r.cat === '(total)')
            return (
              <tr key={i} style={{ borderBottom:'1px solid var(--border)', background: isSubtotal ? '#faf5ff' : 'white', fontWeight: isSubtotal ? 700 : 400 }}>
                <td style={{ padding:'7px 12px', color: isSubtotal ? '#8b5cf6' : 'inherit' }}>{r.region}</td>
                <td style={{ padding:'7px 12px', color: isSubtotal ? '#8b5cf6' : 'inherit' }}>{r.cat}</td>
                <td style={{ padding:'7px 12px', fontFamily:'monospace', color: isSubtotal ? '#8b5cf6' : 'inherit' }}>{r.rev}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {mode === 'rollup' && <div style={{ marginTop:8, fontSize:'.75rem', color:'#8b5cf6' }}>Purple rows = subtotals/grand total added by ROLLUP automatically</div>}
    </div>
  )
}

// ─── Anti/Semi join animation ─────────────────────────────────────────────────
function AntiSemiAnimation() {
  const customers = [{ id:1,name:'Alice' },{ id:2,name:'Bob' },{ id:3,name:'Carol' },{ id:4,name:'Dave' }]
  const orders = [{ id:101,customerId:1 },{ id:102,customerId:2 },{ id:103,customerId:2 }]
  const [mode, setMode] = useState<'semi'|'anti'>('semi')
  const matched = new Set(orders.map(o => o.customerId))
  const result = mode === 'semi' ? customers.filter(c => matched.has(c.id)) : customers.filter(c => !matched.has(c.id))
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {([['semi','SEMI JOIN (EXISTS)'],['anti','ANTI JOIN (NOT EXISTS)']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setMode(k)} style={{ padding:'5px 14px', borderRadius:'var(--radius-full)', border:`1.5px solid ${k==='semi'?'#22c55e':'#ef4444'}`, background:mode===k?(k==='semi'?'#22c55e':'#ef4444'):'transparent', color:mode===k?'#fff':(k==='semi'?'#22c55e':'#ef4444'), fontWeight:600, fontSize:'.82rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:16, alignItems:'start' }}>
        <div>
          <div style={{ fontWeight:700, fontSize:'.78rem', color:'var(--text-muted)', marginBottom:8 }}>customers</div>
          {customers.map(c => {
            const inResult = result.some(r => r.id === c.id)
            return <div key={c.id} style={{ padding:'6px 10px', borderRadius:6, background:inResult?(mode==='semi'?'#f0fdf4':'#fff5f5'):mode==='semi'?'#f8fafc':'#f0fdf4', border:`1px solid ${inResult?(mode==='semi'?'#22c55e':'#ef4444'):'var(--border)'}`, marginBottom:4, fontSize:'.82rem', opacity: inResult ? 1 : 0.4, transition:'all .3s' }}>{c.id}: {c.name}</div>
          })}
        </div>
        <div style={{ fontSize:'1.5rem', color:'var(--text-muted)', paddingTop:28 }}>{mode==='semi'?'✓':'✗'}</div>
        <div>
          <div style={{ fontWeight:700, fontSize:'.78rem', color:'var(--text-muted)', marginBottom:8 }}>orders</div>
          {orders.map(o => <div key={o.id} style={{ padding:'6px 10px', borderRadius:6, background:'white', border:'1px solid var(--border)', marginBottom:4, fontSize:'.82rem' }}>order {o.id} (cust {o.customerId})</div>)}
        </div>
      </div>
      <div style={{ marginTop:10, fontSize:'.78rem', color:mode==='semi'?'#22c55e':'#ef4444' }}>
        {mode==='semi' ? 'Customers Alice & Bob have orders → returned (columns from customers only)' : 'Carol & Dave have NO orders → anti-join returns them'}
      </div>
    </div>
  )
}

// ─── Subquery vs CTE animation ────────────────────────────────────────────────
function SubqueryCTEAnimation() {
  const [view, setView] = useState<'sub'|'cte'>('sub')
  return (
    <div className="anim-wrap" style={{ background:'#0d1117', border:'1px solid #30363d', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {([['sub','Subquery (nested)'],['cte','CTE (named)']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setView(k)} style={{ padding:'5px 14px', borderRadius:'var(--radius-full)', border:`1.5px solid ${k==='sub'?'#f59e0b':'#22c55e'}`, background:view===k?(k==='sub'?'#f59e0b':'#22c55e'):'transparent', color:view===k?'#fff':(k==='sub'?'#f59e0b':'#22c55e'), fontWeight:600, fontSize:'.8rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <pre style={{ margin:0, fontFamily:'monospace', fontSize:'.78rem', lineHeight:1.8, color:'#e6edf3', whiteSpace:'pre-wrap' }}>
        {view === 'sub' ? (
          <><span style={{ color:'#8b949e' }}>{/* Hard to read: nested subqueries */}</span>
{`SELECT dept, avg_sal
FROM (
    SELECT department AS dept,
           AVG(salary) AS avg_sal
    FROM employees
    GROUP BY department
) dept_stats
WHERE avg_sal > 80000;`}</>
        ) : (
          <><span style={{ color:'#8b949e' }}>{/* Easy to read: named steps */}</span>
{`WITH dept_stats AS (
    SELECT department AS dept,
           AVG(salary) AS avg_sal
    FROM employees
    GROUP BY department
)
SELECT dept, avg_sal
FROM dept_stats
WHERE avg_sal > 80000;`}</>
        )}
      </pre>
    </div>
  )
}

// ─── SET ops animation ────────────────────────────────────────────────────────
function SetOpsAnimation() {
  const setA = ['alice@x.com','bob@x.com','carol@x.com']
  const setB = ['bob@x.com','carol@x.com','dave@x.com']
  const [op, setOp] = useState<'union'|'unionall'|'intersect'|'except'>('union')
  const results: Record<string, string[]> = {
    union:     [...new Set([...setA,...setB])],
    unionall:  [...setA,...setB],
    intersect: setA.filter(e => setB.includes(e)),
    except:    setA.filter(e => !setB.includes(e)),
  }
  const result = results[op]
  const color = { union:'#4f8ef7', unionall:'#8b5cf6', intersect:'#22c55e', except:'#ef4444' }[op]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {([['union','UNION'],['unionall','UNION ALL'],['intersect','INTERSECT'],['except','EXCEPT']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setOp(k)} style={{ padding:'4px 12px', borderRadius:'var(--radius-full)', border:`1.5px solid ${op===k?color:'var(--border)'}`, background:op===k?color:'white', color:op===k?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.78rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        {[['Query A (subscribers)', setA, '#4f8ef7'],['Query B (customers)', setB, '#22c55e'],['Result', result, color]].map(([title, rows, c]) => (
          <div key={String(title)}>
            <div style={{ fontWeight:700, fontSize:'.75rem', color:String(c), marginBottom:8 }}>{String(title)}</div>
            {(rows as string[]).map((e,i) => <div key={i} style={{ padding:'5px 8px', borderRadius:5, background:'white', border:`1px solid ${String(c)}40`, marginBottom:4, fontSize:'.72rem', fontFamily:'monospace' }}>{e}</div>)}
            {title === 'Result' && <div style={{ marginTop:6, fontSize:'.7rem', color:'var(--text-muted)' }}>{op==='unionall'?`${result.length} rows (dupes kept)`:op==='union'?`${result.length} unique rows`:op==='intersect'?`${result.length} in both`:`${result.length} in A not B`}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Window function animation ────────────────────────────────────────────────
function WindowAnimation() {
  const orders = [
    { id:1, cust:'Alice', amt:100 },
    { id:2, cust:'Alice', amt:200 },
    { id:3, cust:'Bob',   amt: 50 },
    { id:4, cust:'Bob',   amt:150 },
    { id:5, cust:'Alice', amt:300 },
  ]
  const [fn, setFn] = useState<'rownum'|'rank'|'sum'>('rownum')
  const withFn = orders.map((o,_i, arr) => {
    const partitioned = arr.filter(x => x.cust === o.cust).sort((a,b)=>a.amt-b.amt)
    const idx = partitioned.findIndex(x => x.id === o.id)
    const runningSum = partitioned.slice(0,idx+1).reduce((s,x)=>s+x.amt,0)
    const sortedAll = [...arr].sort((a,b)=>b.amt-a.amt)
    const rankIdx = sortedAll.findIndex(x => x.id === o.id)
    return { ...o, rownum: idx+1, rank: rankIdx+1, sum: runningSum }
  })
  const col = fn === 'rownum' ? 'ROW_NUMBER() per customer' : fn === 'rank' ? 'RANK() by amount DESC (all)' : 'SUM(amt) running per customer'
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Window Functions — live result</div>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {([['rownum','ROW_NUMBER'],['rank','RANK'],['sum','Running SUM']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setFn(k)} style={{ padding:'5px 14px', borderRadius:'var(--radius-full)', border:`1.5px solid ${fn===k?'#6366f1':'var(--border)'}`, background:fn===k?'#6366f1':'white', color:fn===k?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.8rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
        <thead><tr style={{ background:'var(--surface-3)' }}>{['id','customer','amount',col].map(h=><th key={h} style={{ padding:'7px 12px', textAlign:'left', fontWeight:700, fontSize:'.75rem' }}>{h}</th>)}</tr></thead>
        <tbody>
          {withFn.map(r => (
            <tr key={r.id} style={{ borderBottom:'1px solid var(--border)' }}>
              <td style={{ padding:'7px 12px' }}>{r.id}</td>
              <td style={{ padding:'7px 12px', fontWeight:600, color:r.cust==='Alice'?'#4f8ef7':'#22c55e' }}>{r.cust}</td>
              <td style={{ padding:'7px 12px', fontFamily:'monospace' }}>{r.amt}</td>
              <td style={{ padding:'7px 12px', fontFamily:'monospace', fontWeight:700, color:'#6366f1' }}>{fn==='rownum'?r.rownum:fn==='rank'?r.rank:r.sum}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Window frame animation ───────────────────────────────────────────────────
function FrameAnimation() {
  const days = [10,25,30,20,40,35,50,45,60,55]
  const [frame, setFrame] = useState<'running'|'rolling3'|'full'>('running')
  const getVal = (i: number) => {
    if (frame === 'running') return days.slice(0,i+1).reduce((s,v)=>s+v,0)
    if (frame === 'rolling3') return Math.round(days.slice(Math.max(0,i-2),i+1).reduce((s,v)=>s+v,0)/Math.min(3,i+1))
    return Math.round(days.reduce((s,v)=>s+v,0)/days.length)
  }
  const [hover, setHover] = useState(-1)
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Window Frame Visualizer</div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {([['running','Running total (UNBOUNDED PRECEDING)'],['rolling3','3-day rolling avg (2 PRECEDING)'],['full','Full partition avg']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setFrame(k)} style={{ padding:'4px 12px', borderRadius:'var(--radius-full)', border:`1.5px solid ${frame===k?'#4f8ef7':'var(--border)'}`, background:frame===k?'#4f8ef7':'white', color:frame===k?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.75rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'flex', gap:4, alignItems:'flex-end', height:90 }}>
        {days.map((v,i) => {
          const maxV = Math.max(...days)
          const wval = getVal(i)
          const inWindow = frame==='rolling3' ? (hover>=0 && i>=hover-2 && i<=hover) : hover>=0 && i<=hover
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(-1)}>
              <div style={{ fontSize:'.62rem', color:'#6366f1', fontFamily:'monospace' }}>{hover===i?wval:''}</div>
              <div style={{ width:'100%', background:inWindow?'#6366f180':hover===i?'#6366f1':'#e2e8f0', borderRadius:'3px 3px 0 0', height:`${(v/maxV)*60}px`, transition:'background .15s' }} />
              <div style={{ fontSize:'.65rem', color:'var(--text-muted)' }}>d{i+1}</div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop:8, fontSize:'.75rem', color:'var(--text-secondary)' }}>Hover a bar to see the window value. Purple = rows included in window.</div>
    </div>
  )
}

// ─── CTE animation ────────────────────────────────────────────────────────────
function CTEAnimation() {
  const [step, setStep] = useState(0)
  const steps = [
    { name:'completed_orders', color:'#4f8ef7', desc:'Step 1: aggregate orders per customer', rows:[{k:'Alice',v:1500},{k:'Bob',v:800},{k:'Carol',v:3200}] },
    { name:'customer_segments', color:'#8b5cf6', desc:'Step 2: apply segment rules from step 1', rows:[{k:'Alice',v:'Regular'},{k:'Bob',v:'New'},{k:'Carol',v:'VIP'}] },
    { name:'final SELECT', color:'#22c55e', desc:'Step 3: aggregate by segment', rows:[{k:'New',v:1},{k:'Regular',v:1},{k:'VIP',v:1}] },
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>CTE — step-by-step data flow</div>
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {steps.map((s,i) => <button key={i} onClick={()=>setStep(i)} style={{ padding:'4px 12px', borderRadius:'var(--radius-full)', border:`1.5px solid ${step===i?s.color:'var(--border)'}`, background:step===i?s.color:'white', color:step===i?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.78rem', cursor:'pointer' }}>{s.name}</button>)}
      </div>
      <div style={{ padding:'12px 16px', background:'white', border:`1.5px solid ${steps[step].color}`, borderRadius:10 }}>
        <div style={{ fontFamily:'monospace', fontWeight:700, color:steps[step].color, marginBottom:10 }}>WITH {steps[step].name} AS (...)</div>
        <div style={{ fontSize:'.75rem', color:'var(--text-secondary)', marginBottom:10 }}>{steps[step].desc}</div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.8rem' }}>
          <tbody>{steps[step].rows.map((r,i) => <tr key={i}><td style={{ padding:'5px 10px', borderBottom:'1px solid var(--border)' }}>{r.k}</td><td style={{ padding:'5px 10px', borderBottom:'1px solid var(--border)', fontFamily:'monospace', color:steps[step].color, fontWeight:700 }}>{r.v}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

// ─── PIVOT animation ──────────────────────────────────────────────────────────
function PivotAnimation() {
  const long = [
    { customer:'Alice', category:'Electronics', amount:300 },
    { customer:'Alice', category:'Clothing',    amount:150 },
    { customer:'Bob',   category:'Electronics', amount:200 },
    { customer:'Bob',   category:'Books',       amount: 50 },
    { customer:'Carol', category:'Clothing',    amount:400 },
  ]
  const wide = [
    { customer:'Alice', Electronics:300, Clothing:150, Books:0 },
    { customer:'Bob',   Electronics:200, Clothing:0,   Books:50 },
    { customer:'Carol', Electronics:0,   Clothing:400, Books:0  },
  ]
  const [pivoted, setPivoted] = useState(false)
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>PIVOT — long to wide</div>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        <button onClick={()=>setPivoted(false)} style={{ padding:'5px 16px', borderRadius:'var(--radius-full)', border:`1.5px solid ${!pivoted?'#ef4444':'var(--border)'}`, background:!pivoted?'#ef4444':'white', color:!pivoted?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.82rem', cursor:'pointer' }}>Long (before)</button>
        <button onClick={()=>setPivoted(true)} style={{ padding:'5px 16px', borderRadius:'var(--radius-full)', border:`1.5px solid ${pivoted?'#22c55e':'var(--border)'}`, background:pivoted?'#22c55e':'white', color:pivoted?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.82rem', cursor:'pointer' }}>Wide (after PIVOT)</button>
      </div>
      {!pivoted ? (
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
          <thead><tr style={{ background:'var(--surface-3)' }}>{['customer','category','amount'].map(h=><th key={h} style={{ padding:'7px 12px', textAlign:'left', fontWeight:700 }}>{h}</th>)}</tr></thead>
          <tbody>{long.map((r,i) => <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'7px 12px' }}>{r.customer}</td><td style={{ padding:'7px 12px', color:'#4f8ef7' }}>{r.category}</td><td style={{ padding:'7px 12px', fontFamily:'monospace' }}>{r.amount}</td></tr>)}</tbody>
        </table>
      ) : (
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
          <thead><tr style={{ background:'var(--surface-3)' }}>{['customer','Electronics','Clothing','Books'].map(h=><th key={h} style={{ padding:'7px 12px', textAlign:'left', fontWeight:700 }}>{h}</th>)}</tr></thead>
          <tbody>{wide.map((r,i) => <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'7px 12px', fontWeight:700 }}>{r.customer}</td>{[r.Electronics,r.Clothing,r.Books].map((v,j) => <td key={j} style={{ padding:'7px 12px', fontFamily:'monospace', color:v>0?'#22c55e':'#94a3b8' }}>{v}</td>)}</tr>)}</tbody>
        </table>
      )}
    </div>
  )
}

// ─── Transaction animation ─────────────────────────────────────────────────────
function TransactionAnimation() {
  const [state, setState] = useState<'idle'|'running'|'committed'|'rolledback'>('idle')
  const steps = ['BEGIN', 'UPDATE accounts SET bal=bal-100 WHERE id=1', 'UPDATE accounts SET bal=bal+100 WHERE id=2', 'COMMIT / ROLLBACK']
  const [currentStep, setCurrentStep] = useState(-1)
  const start = () => {
    setState('running'); setCurrentStep(0)
    setTimeout(()=>setCurrentStep(1),700)
    setTimeout(()=>setCurrentStep(2),1400)
    setTimeout(()=>setCurrentStep(3),2000)
  }
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>ACID Transaction — transfer $100</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
        {steps.map((s,i) => (
          <div key={i} style={{ padding:'8px 14px', borderRadius:8, background:currentStep>=i?'#1e293b':'white', border:`1.5px solid ${currentStep>=i?'#22c55e':'var(--border)'}`, fontFamily:'monospace', fontSize:'.82rem', color:currentStep>=i?'#22c55e':'var(--text-secondary)', transition:'all .3s' }}>
            {currentStep>=i?'✓ ':'  '}{s}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={start} disabled={state==='running'} style={{ padding:'6px 20px', borderRadius:'var(--radius-full)', border:'1.5px solid #22c55e', background:state==='running'?'#94a3b8':'#22c55e', color:'white', fontWeight:700, fontSize:'.82rem', cursor:state==='running'?'not-allowed':'pointer' }}>▶ Run Transaction</button>
        <button onClick={()=>{setState('rolledback');setCurrentStep(3)}} style={{ padding:'6px 20px', borderRadius:'var(--radius-full)', border:'1.5px solid #ef4444', background:'#ef4444', color:'white', fontWeight:700, fontSize:'.82rem', cursor:'pointer' }}>✗ Rollback</button>
        <button onClick={()=>{setState('idle');setCurrentStep(-1)}} style={{ padding:'6px 14px', borderRadius:'var(--radius-full)', border:'1.5px solid var(--border)', background:'white', color:'var(--text-secondary)', fontWeight:600, fontSize:'.82rem', cursor:'pointer' }}>Reset</button>
      </div>
      {currentStep===3 && state!=='rolledback' && <div style={{ marginTop:8, fontSize:'.8rem', color:'#22c55e', fontWeight:700 }}>✓ COMMIT — both updates visible atomically</div>}
      {state==='rolledback' && <div style={{ marginTop:8, fontSize:'.8rem', color:'#ef4444', fontWeight:700 }}>✗ ROLLBACK — neither update applied. Balances unchanged.</div>}
    </div>
  )
}

// ─── DDL animation ─────────────────────────────────────────────────────────────
function DDLAnimation() {
  const [op, setOp] = useState<'create'|'alter'|'drop'>('create')
  const sqls = {
    create: `CREATE TABLE orders (
  order_id   BIGINT       NOT NULL,
  customer_id INT         NOT NULL,
  amount     DECIMAL(18,2),
  status     VARCHAR(20)  DEFAULT 'pending',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id)
);`,
    alter: `-- Add a column
ALTER TABLE orders ADD COLUMN discount DECIMAL(10,2);

-- Rename a column (PostgreSQL / Spark)
ALTER TABLE orders RENAME COLUMN status TO order_status;

-- Change data type
ALTER TABLE orders ALTER COLUMN amount TYPE DECIMAL(20,4);

-- Add an index
CREATE INDEX idx_orders_customer ON orders(customer_id);`,
    drop: `-- Drop with safety check
DROP TABLE IF EXISTS orders_staging;

-- Truncate (delete all rows, keep structure)
TRUNCATE TABLE orders_staging;

-- Drop column
ALTER TABLE orders DROP COLUMN IF EXISTS old_field;`,
  }
  return (
    <div className="anim-wrap" style={{ background:'#0d1117', border:'1px solid #30363d', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {([['create','CREATE'],['alter','ALTER'],['drop','DROP']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setOp(k)} style={{ padding:'5px 16px', borderRadius:'var(--radius-full)', border:`1.5px solid ${op===k?'#4f8ef7':'#30363d'}`, background:op===k?'#4f8ef7':'#161b22', color:'#e6edf3', fontWeight:600, fontSize:'.82rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <pre style={{ margin:0, fontFamily:'monospace', fontSize:'.78rem', color:'#e6edf3', whiteSpace:'pre-wrap', lineHeight:1.8 }}>{sqls[op]}</pre>
    </div>
  )
}

// ─── Views animation ──────────────────────────────────────────────────────────
function ViewsAnimation() {
  const [type, setType] = useState<'view'|'mat'>('view')
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {([['view','View (virtual)'],['mat','Materialized View']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setType(k)} style={{ padding:'5px 16px', borderRadius:'var(--radius-full)', border:`1.5px solid ${type===k?'#8b5cf6':'var(--border)'}`, background:type===k?'#8b5cf6':'white', color:type===k?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.82rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {[
          { label:'Storage', view:'None — query re-executes each time', mat:'Physical table — stored on disk' },
          { label:'Freshness', view:'Always current', mat:'Stale until refreshed (REFRESH MATERIALIZED VIEW)' },
          { label:'Speed', view:'As fast as underlying query', mat:'Sub-second (pre-computed)' },
          { label:'Use when', view:'Data changes frequently, simplicity matters', mat:'Expensive aggregation, many users query same data' },
        ].map(r => (
          <div key={r.label} style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px' }}>
            <div style={{ fontSize:'.72rem', color:'var(--text-muted)', marginBottom:4 }}>{r.label}</div>
            <div style={{ fontSize:'.82rem', color:type==='view'?'#4f8ef7':'#8b5cf6', fontWeight:500 }}>{type==='view'?r.view:r.mat}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── DML animation ────────────────────────────────────────────────────────────
function DMLAnimation() {
  const [op, setOp] = useState<'insert'|'update'|'delete'|'merge'>('insert')
  const before = [{ id:1,status:'pending',amt:100 },{ id:2,status:'shipped',amt:200 },{ id:3,status:'pending',amt:50 }]
  const after: Record<string, typeof before> = {
    insert: [...before, { id:4, status:'pending', amt:300 }],
    update: before.map(r => r.status==='pending' ? { ...r, status:'processing' } : r),
    delete: before.filter(r => r.status !== 'pending'),
    merge:  [...before.map(r => r.id===1?{...r,amt:150}:r), { id:4,status:'new',amt:300 }],
  }
  const [show, setShow] = useState<'before'|'after'>('before')
  const rows = show === 'before' ? before : after[op]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {([['insert','INSERT'],['update','UPDATE'],['delete','DELETE'],['merge','MERGE']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>{setOp(k);setShow('before')}} style={{ padding:'4px 12px', borderRadius:'var(--radius-full)', border:`1.5px solid ${op===k?'#22c55e':'var(--border)'}`, background:op===k?'#22c55e':'white', color:op===k?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.78rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {(['before','after'] as const).map(s => <button key={s} onClick={()=>setShow(s)} style={{ padding:'4px 14px', borderRadius:'var(--radius-full)', border:`1.5px solid ${show===s?'#4f8ef7':'var(--border)'}`, background:show===s?'#4f8ef7':'white', color:show===s?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.78rem', cursor:'pointer' }}>{s === 'before' ? 'Before' : `After ${op.toUpperCase()}`}</button>)}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
        <thead><tr style={{ background:'var(--surface-3)' }}>{['id','status','amount'].map(h=><th key={h} style={{ padding:'7px 12px', textAlign:'left', fontWeight:700 }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r,i) => {
            const isNew = show==='after' && !before.some(b=>b.id===r.id)
            const isChanged = show==='after' && before.some(b=>b.id===r.id && (b.status!==r.status||b.amt!==r.amt))
            return <tr key={i} style={{ borderBottom:'1px solid var(--border)', background:isNew?'#f0fdf4':isChanged?'#fefce8':'white' }}><td style={{ padding:'7px 12px' }}>{r.id}</td><td style={{ padding:'7px 12px', color:isChanged?'#f59e0b':isNew?'#22c55e':'inherit' }}>{r.status}</td><td style={{ padding:'7px 12px', fontFamily:'monospace', color:isChanged?'#f59e0b':isNew?'#22c55e':'inherit' }}>{r.amt}</td></tr>
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── SQL Patterns animation ───────────────────────────────────────────────────
function SQLPatternsAnimation() {
  const patterns = [
    { name:'Top-N per group', desc:'ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC)', use:'Best-selling product per category' },
    { name:'Running total', desc:'SUM(amount) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING)', use:'Cumulative revenue over time' },
    { name:'Gap detection', desc:'LAG(date)+1 ≠ date → gap found', use:'Missing dates in time-series' },
    { name:'Dedup (latest)', desc:'ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) = 1', use:'Keep latest record per key' },
    { name:'Date spine join', desc:'LEFT JOIN calendar ON date BETWEEN start AND end', use:'Fill in days with no events as 0' },
  ]
  const [active, setActive] = useState(0)
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Common SQL Patterns</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
        {patterns.map((p,i) => <button key={i} onClick={()=>setActive(i)} style={{ padding:'8px 14px', borderRadius:8, border:`1.5px solid ${active===i?'#6366f1':'var(--border)'}`, background:active===i?'#6366f1':'white', color:active===i?'#fff':'var(--text-secondary)', fontWeight:active===i?700:400, fontSize:'.83rem', cursor:'pointer', textAlign:'left' }}>{p.name}</button>)}
      </div>
      <div style={{ padding:'12px 16px', background:'#0d1117', borderRadius:10, border:'1px solid #30363d' }}>
        <div style={{ fontFamily:'monospace', fontSize:'.82rem', color:'#a5b4fc', marginBottom:8 }}>{patterns[active].desc}</div>
        <div style={{ fontSize:'.78rem', color:'#64748b' }}>Use case: {patterns[active].use}</div>
      </div>
    </div>
  )
}

// ─── EXPLAIN / execution plan animation ──────────────────────────────────────
function ExplainAnimation() {
  const [plan, setPlan] = useState<'bad'|'good'>('bad')
  const nodes = {
    bad: [
      { op:'Full Table Scan', table:'orders (50M rows)', cost:'HIGH', color:'#ef4444' },
      { op:'Hash Join', table:'+ customers', cost:'HIGH', color:'#f59e0b' },
      { op:'Sort', table:'ORDER BY amount DESC', cost:'MED', color:'#f59e0b' },
      { op:'Limit', table:'TOP 10', cost:'LOW', color:'#22c55e' },
    ],
    good: [
      { op:'Index Seek', table:'orders.idx_customer_date', cost:'LOW', color:'#22c55e' },
      { op:'Nested Loop Join', table:'+ customers (small)', cost:'LOW', color:'#22c55e' },
      { op:'Top N Sort', table:'ORDER BY amount DESC LIMIT 10', cost:'LOW', color:'#22c55e' },
    ],
  }
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>EXPLAIN Plan — before & after optimization</div>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {([['bad','Unoptimized'],['good','Optimized']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setPlan(k)} style={{ padding:'5px 16px', borderRadius:'var(--radius-full)', border:`1.5px solid ${plan===k?'#4f8ef7':'var(--border)'}`, background:plan===k?'#4f8ef7':'white', color:plan===k?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.82rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {nodes[plan].map((n,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'white', border:`1.5px solid ${n.color}40`, borderLeft:`3px solid ${n.color}`, borderRadius:8 }}>
            <div style={{ fontFamily:'monospace', fontWeight:700, color:n.color, minWidth:120, fontSize:'.82rem' }}>{n.op}</div>
            <div style={{ flex:1, fontSize:'.8rem', color:'var(--text-secondary)' }}>{n.table}</div>
            <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:'.78rem', color:n.color }}>{n.cost}</div>
          </div>
        ))}
      </div>
      {plan==='bad' && <div style={{ marginTop:8, fontSize:'.75rem', color:'#ef4444' }}>Full scan on 50M rows → add index on customer_id + date</div>}
      {plan==='good' && <div style={{ marginTop:8, fontSize:'.75rem', color:'#22c55e' }}>Index seek reads only matching rows → 1000× faster</div>}
    </div>
  )
}

// ─── Performance anti-patterns animation ──────────────────────────────────────
function PerformanceAnimation() {
  const patterns = [
    { bad:"WHERE YEAR(order_date) = 2024", good:"WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'", issue:'Function wraps column → non-sargable, no index' },
    { bad:"SELECT * FROM orders JOIN customers ...", good:"SELECT o.id, o.amt, c.name FROM orders o JOIN customers c ...", issue:'SELECT * reads all columns including unneeded ones' },
    { bad:"WHERE id NOT IN (SELECT customer_id FROM orders)", good:"WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)", issue:'NOT IN returns 0 rows if subquery has any NULL' },
    { bad:"SELECT DISTINCT a, b FROM big_table", good:"SELECT a, b FROM big_table GROUP BY a, b HAVING COUNT(*) = 1", issue:'DISTINCT triggers full sort or hash on all selected columns' },
  ]
  const [active, setActive] = useState(0)
  const p = patterns[active]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Performance Anti-patterns</div>
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {patterns.map((_,i) => <button key={i} onClick={()=>setActive(i)} style={{ padding:'4px 12px', borderRadius:'var(--radius-full)', border:`1.5px solid ${active===i?'#ef4444':'var(--border)'}`, background:active===i?'#ef4444':'white', color:active===i?'#fff':'var(--text-secondary)', fontWeight:600, fontSize:'.78rem', cursor:'pointer' }}>#{i+1}</button>)}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px' }}>
          <div style={{ fontSize:'.72rem', color:'#ef4444', fontWeight:700, marginBottom:4 }}>✗ Anti-pattern</div>
          <code style={{ fontSize:'.82rem', color:'#991b1b' }}>{p.bad}</code>
        </div>
        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'10px 14px' }}>
          <div style={{ fontSize:'.72rem', color:'#22c55e', fontWeight:700, marginBottom:4 }}>✓ Better</div>
          <code style={{ fontSize:'.82rem', color:'#166534' }}>{p.good}</code>
        </div>
        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'8px 12px', fontSize:'.78rem', color:'#92400e' }}>⚠️ {p.issue}</div>
      </div>
    </div>
  )
}

// ─── JSON in SQL animation ────────────────────────────────────────────────────
function JSONSQLAnimation() {
  const [step, setStep] = useState<'raw'|'extract'|'parsed'>('raw')
  return (
    <div className="anim-wrap" style={{ background:'#0d1117', border:'1px solid #30363d', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {([['raw','Raw JSON column'],['extract','GET_JSON_OBJECT'],['parsed','from_json() struct']] as const).map(([k,l]) => (
          <button key={k} onClick={()=>setStep(k)} style={{ padding:'4px 12px', borderRadius:'var(--radius-full)', border:`1.5px solid ${step===k?'#f59e0b':'#30363d'}`, background:step===k?'#f59e0b':'#161b22', color:'#e6edf3', fontWeight:600, fontSize:'.78rem', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      {step === 'raw' && <pre style={{ margin:0, fontFamily:'monospace', fontSize:'.78rem', color:'#e6edf3', lineHeight:1.8 }}>{`-- JSON stored as STRING column
SELECT event_data FROM events LIMIT 1;

-- event_data value:
{"user_id": 42, "action": "purchase",
 "item": {"sku": "ABC123", "price": 99.99},
 "tags": ["sale", "electronics"]}`}</pre>}
      {step === 'extract' && <pre style={{ margin:0, fontFamily:'monospace', fontSize:'.78rem', color:'#e6edf3', lineHeight:1.8 }}>{`-- Extract scalar values (Spark SQL)
SELECT
    GET_JSON_OBJECT(event_data, '$.user_id')       AS user_id,
    GET_JSON_OBJECT(event_data, '$.action')        AS action,
    GET_JSON_OBJECT(event_data, '$.item.price')    AS price,
    JSON_ARRAY_LENGTH(event_data, '$.tags')        AS tag_count
FROM events;`}</pre>}
      {step === 'parsed' && <pre style={{ margin:0, fontFamily:'monospace', fontSize:'.78rem', color:'#e6edf3', lineHeight:1.8 }}>{`-- Parse to struct (Spark SQL) — strongly typed
FROM_JSON(event_data, 'user_id INT, action STRING,
  item STRUCT<sku:STRING, price:DOUBLE>,
  tags ARRAY<STRING>') AS e

-- Then access with dot notation:
SELECT e.user_id, e.item.price, e.tags[0] FROM ...`}</pre>}
    </div>
  )
}

// ─── Index Animation ─────────────────────────────────────────────────────────
function IndexAnimation() {
  const [mode, setMode] = useState<'full' | 'btree'>('full')
  const rows = ['row 1', 'row 2', 'row 3', 'row 4', 'row 5', 'row 6', 'row 7', 'row 8']
  const highlighted = mode === 'btree' ? [2] : rows.map((_, i) => i)

  return (
    <div className="anim-wrap" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
        {(['full', 'btree'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: mode === m ? '#6366f1' : '#e2e8f0', color: mode === m ? 'white' : '#475569', cursor: 'pointer' }}>
            {m === 'full' ? 'Full Table Scan' : 'B-Tree Index Scan'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ width: '64px', height: '40px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600,
            background: highlighted.includes(i) ? '#6366f1' : '#f1f5f9', color: highlighted.includes(i) ? 'white' : '#94a3b8',
            transition: 'all 0.4s ease', border: `2px solid ${highlighted.includes(i) ? '#4f46e5' : '#e2e8f0'}` }}>
            {r}
          </div>
        ))}
      </div>
      <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
        {mode === 'full' ? 'Full scan: reads every row (O(n))' : 'Index scan: jumps directly to matching row (O(log n))'}
      </p>
    </div>
  )
}

// ─── Normalization Animation ──────────────────────────────────────────────────
function NormalizationAnimation() {
  const [step, setStep] = useState(0)
  const steps = [
    { label: 'Denormalized (0NF)', color: '#ef4444', rows: ['1 | Alice | alice@x.com | Laptop, Mouse | Electronics, Electronics'] },
    { label: '1NF  -  Atomic Values', color: '#f59e0b', rows: ['1 | Alice | alice@x.com | Laptop | Electronics', '1 | Alice | alice@x.com | Mouse | Electronics'] },
    { label: '2NF  -  Remove Partial Dependencies', color: '#3b82f6', rows: ['Orders: 1 | 1 | Laptop', 'Customers: 1 | Alice | alice@x.com'] },
    { label: '3NF  -  Remove Transitive Dependencies', color: '#10b981', rows: ['Customers: 1 | Alice | 1', 'Emails: 1 | alice@x.com', 'Orders: 1 | 1 | Laptop'] },
  ]
  const s = steps[step]
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {steps.map((st, i) => (
          <button key={i} onClick={() => setStep(i)}
            style={{ padding: '4px 12px', borderRadius: '8px', border: `2px solid ${i === step ? st.color : '#e2e8f0'}`, background: i === step ? st.color : 'white', color: i === step ? 'white' : '#64748b', cursor: 'pointer', fontSize: '0.78rem' }}>
            {st.label}
          </button>
        ))}
      </div>
      <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#e2e8f0', textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
        {s.rows.map((r, i) => <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #334155' }}>{r}</div>)}
      </div>
    </div>
  )
}


export default function SQL({ completed, onComplete, onUnmark, onSignInNeeded }: Props) {
  const [activeId, setActiveId] = useState('sql-select')
  const sectionRefs = useRef<Record<string, HTMLElement>>({})

  const scrollTo = (id: string) => {
    setActiveId(id)
    const el = sectionRefs.current[id]
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.remove('section-flash')
    requestAnimationFrame(() => el.classList.add('section-flash'))
    setTimeout(() => el.classList.remove('section-flash'), 600)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) })
    }, { rootMargin: '-20% 0px -60% 0px' })
    Object.values(sectionRefs.current).forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const totalTopics = SECTIONS.flatMap(s => s.items).length
  const ref = (id: string) => (el: HTMLElement | null) => { if (el) sectionRefs.current[id] = el }

  return (
    <div className="page-with-sidebar">
      <Sidebar sections={SECTIONS} activeId={activeId} completed={completed} totalTopics={totalTopics} onItemClick={scrollTo} />
      <main className="main-content">

        {/* ── SELECT ── */}
        <section id="sql-select" ref={ref('sql-select')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>SELECT, WHERE, ORDER BY, LIMIT</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"Walk me through the logical execution order of a SQL query."</li>
                <li>"Why can't you reference a SELECT alias in a WHERE clause?"</li>
                <li>"How would you paginate through 10 million rows efficiently?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate understand logical processing order or just memorize syntax? The hidden rubric: can they explain why aliases don't work in WHERE, and do they know the difference between filtering before vs after aggregation?</p>
            </div>
          </div>
          <p>SELECT is the foundation of SQL — it specifies which columns to return, while FROM, WHERE, ORDER BY and LIMIT control what data is fetched and how. In production, you should always list columns explicitly rather than using SELECT * because schema changes can silently break downstream pipelines. The reason is that SQL's logical processing order (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT) means SELECT aliases are not available during WHERE evaluation — a common gotcha that trips up junior engineers in live coding rounds.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"SQL processes FROM first, then filters with WHERE, groups with GROUP BY, filters groups with HAVING, then finally computes SELECT columns."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"That's why you can't use a SELECT alias in WHERE — the alias doesn't exist yet at filter time."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"In production I always name columns explicitly, use LIMIT with OFFSET for pagination, and push filters as early as possible for performance."</td></tr>
            </tbody>
          </table>
          <SelectOrderDiagram />
          <SelectOrderAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Airbnb, all analytical queries against the 500M+ listings events table are required to include an explicit partition filter on event_date to avoid full scans. At Netflix, the data platform enforces column-level lineage by banning SELECT * in Gold-layer transformations. Snowflake's query optimizer uses the logical order to push predicates down before joins, making WHERE clause placement critical for query cost.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Basic SELECT with filtering and sorting
SELECT
    order_id,
    customer_id,
    order_date,
    total_amount,
    status,
    ROUND(total_amount * 0.1, 2)  AS tax
FROM   orders
WHERE  status = 'completed'
  AND  order_date >= '2024-01-01'
  AND  total_amount BETWEEN 100 AND 5000
ORDER BY order_date DESC, total_amount DESC
LIMIT  20 OFFSET 0;   -- page 1

-- Using expressions in SELECT
SELECT
    customer_id,
    UPPER(first_name) || ' ' || UPPER(last_name)  AS full_name,
    DATEDIFF('day', created_at, CURRENT_DATE)      AS days_since_signup,
    CASE WHEN is_premium THEN 'Premium' ELSE 'Free' END AS tier
FROM customers
WHERE is_active = TRUE;

-- Filtering with IN and LIKE
SELECT * FROM pipeline_runs
WHERE  status IN ('failed', 'timeout')
  AND  pipeline_name LIKE 'ingest_%'
ORDER BY started_at DESC;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"SELECT * is easier to write and gets all the data."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I always list columns explicitly — SELECT * breaks column pruning on Parquet and silently includes new schema columns in downstream joins."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-select" questions={[
            { question: "In SQL's logical processing order, when is the SELECT clause evaluated?", options: ['First, before FROM', 'After FROM and WHERE, before ORDER BY', 'After ORDER BY', 'At the same time as WHERE'], correct: 1, explanation: "SELECT is evaluated after FROM, JOIN, WHERE, GROUP BY, and HAVING — which is why you cannot reference a SELECT alias in the WHERE clause." },
            { question: "Which clause filters rows AFTER aggregation?", options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], correct: 1 },
            { question: "What does OFFSET 20 LIMIT 10 return?", options: ['First 10 rows', 'Rows 1-20', 'Rows 21-30', 'Last 10 rows'], correct: 2 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>List columns explicitly in SELECT</li><li>Push filters into WHERE as early as possible</li><li>Use LIMIT/OFFSET or keyset pagination for large result sets</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use SELECT * in production pipelines</li><li>Reference SELECT aliases in WHERE or HAVING</li><li>Sort before filtering (waste of compute)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-select') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-select')) { await unmarkTopicComplete('sql-select'); onUnmark('sql-select') } else { await markTopicComplete('sql-select'); onComplete('sql-select') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-select') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── DISTINCT ── */}
        <section id="sql-distinct" ref={ref('sql-distinct')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>DISTINCT and Deduplication</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How do you deduplicate a table and keep only the most recent record per ID?"</li>
                <li>"What is the difference between COUNT(DISTINCT col) and COUNT(col)?"</li>
                <li>"When would you use ROW_NUMBER() instead of DISTINCT?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know that DISTINCT operates on the full row, not a single column? The hidden test: can they explain why ROW_NUMBER() is superior for deduplication when you need to control which duplicate survives?</p>
            </div>
          </div>
          <p>DISTINCT removes duplicate rows from a result set by hashing or sorting all selected columns together. In production, DISTINCT on large tables is expensive — it forces a global sort or hash across every selected column. The reason is that real deduplication problems require preserving a specific record (e.g., the latest, the highest-value), which DISTINCT cannot do — it keeps an arbitrary row. Window functions like ROW_NUMBER() give you full control over which duplicate to keep.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"DISTINCT applies to the entire selected row — so SELECT DISTINCT a, b deduplicates on the (a, b) combination, not just a."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"For production dedup I prefer ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) because it lets me choose which duplicate survives."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"In Spark SQL / Snowflake I use QUALIFY to filter the window result inline without a subquery wrapper."</td></tr>
            </tbody>
          </table>
          <DistinctDiagram />
          <DistinctAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Databricks, Bronze-to-Silver pipeline deduplication uses ROW_NUMBER() with Delta MERGE to handle late-arriving records — DISTINCT would silently drop the newer version. At LinkedIn, event dedup in the Kafka-to-Hive pipeline uses QUALIFY ROW_NUMBER() = 1 on Spark 3.3+ to process 2B+ daily events. Spotify's Flink-to-BigQuery pipeline uses COUNT(DISTINCT user_id) as a streaming approximate-count metric that differs from COUNT(user_id) by up to 40% on repeated listens.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Basic DISTINCT
SELECT DISTINCT customer_id FROM orders;

-- DISTINCT on multiple columns (combination must be unique)
SELECT DISTINCT customer_id, product_category FROM orders;

-- COUNT DISTINCT: how many unique customers?
SELECT COUNT(DISTINCT customer_id) AS unique_customers FROM orders;

-- Better dedup: keep the latest row per customer using ROW_NUMBER
WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn
  FROM customers_raw
)
SELECT * FROM ranked WHERE rn = 1;

-- Dedup in Spark SQL with QUALIFY (Snowflake / Spark 3.3+)
SELECT * FROM customers_raw
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd use SELECT DISTINCT to remove duplicates."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY updated_at DESC) so I can deterministically choose which version survives — DISTINCT picks arbitrarily and can't handle this."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-distinct" questions={[
            { question: "SELECT DISTINCT a, b returns rows where:", options: ['Column a is unique', 'Column b is unique', 'The combination of (a, b) is unique', 'Either a or b is unique'], correct: 2 },
            { question: "Why is ROW_NUMBER() preferred over DISTINCT for deduplication?", options: ['It is faster', 'It lets you choose which duplicate to keep based on ordering', 'It works without GROUP BY', 'DISTINCT does not work on large tables'], correct: 1 },
            { question: "COUNT(DISTINCT col) vs COUNT(col) - what is the difference?", options: ['No difference', 'COUNT(DISTINCT col) counts only non-NULL unique values', 'COUNT(col) also counts NULLs', 'DISTINCT applies before WHERE'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use ROW_NUMBER() to control which duplicate survives</li><li>Use QUALIFY in Spark/Snowflake for cleaner dedup</li><li>Deduplicate at source ingestion, not at query time</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use DISTINCT on wide tables (expensive sort/hash)</li><li>Assume DISTINCT keeps a deterministic row</li><li>Use DISTINCT as a lazy fix for bad join logic</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-distinct') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-distinct')) { await unmarkTopicComplete('sql-distinct'); onUnmark('sql-distinct') } else { await markTopicComplete('sql-distinct'); onComplete('sql-distinct') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-distinct') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── NULLS ── */}
        <section id="sql-nulls" ref={ref('sql-nulls')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>NULL Handling</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is the result of NULL = NULL in SQL?"</li>
                <li>"How do you avoid division by zero in SQL?"</li>
                <li>"What happens to NULL values in a GROUP BY or JOIN?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate understand three-valued logic (TRUE/FALSE/UNKNOWN) or just memorize IS NULL syntax? The real test: can they predict what NOT IN returns when the subquery contains NULLs, and do they know that AVG silently ignores NULLs?</p>
            </div>
          </div>
          <p>NULL represents the absence of a value — it is not zero, not empty string, not false. In production, NULL propagation is one of the most common sources of silent data bugs: NULL in a NOT IN subquery makes the entire result empty, NULL in a JOIN key means the row never matches, and NULL in AVG silently changes the denominator. The reason is that SQL uses three-valued logic — any comparison with NULL yields UNKNOWN, which is treated as FALSE in WHERE and HAVING clauses.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"NULL is unknown — col = NULL always returns UNKNOWN, never TRUE. Always use IS NULL / IS NOT NULL."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"COALESCE handles defaults, NULLIF prevents division by zero, and COUNT(*) vs COUNT(col) differ when NULLs are present."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"The dangerous case: NOT IN with a subquery — if the subquery returns any NULL, the whole NOT IN returns 0 rows."</td></tr>
            </tbody>
          </table>
          <NullsDiagram />
          <NullAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Stripe, payment analytics pipelines use COALESCE(discount_amount, 0) on every nullable column before aggregation to prevent silent revenue undercounting — a NULL discount treated as missing would inflate average order values. At Meta, data quality checks for NULL rates in user_id foreign keys are automated; a NULL rate above 0.01% on a join key triggers a pipeline alert. Google's BigQuery enforces REQUIRED fields at the schema level for fact table keys, eliminating NULL join surprises at scale.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- NULL comparisons
SELECT * FROM orders WHERE discount IS NULL;       -- correct
SELECT * FROM orders WHERE discount = NULL;        -- always empty!

-- COALESCE: return first non-NULL value
SELECT
    order_id,
    COALESCE(discount, 0)         AS discount,
    COALESCE(notes, 'No notes')   AS notes
FROM orders;

-- NULLIF: return NULL if two values are equal (avoid division by zero)
SELECT
    revenue / NULLIF(orders_count, 0) AS avg_order_value
FROM daily_metrics;

-- NULL in aggregations: COUNT(*) vs COUNT(col)
SELECT
    COUNT(*)             AS total_rows,         -- includes NULLs
    COUNT(discount)      AS rows_with_discount, -- ignores NULLs
    AVG(discount)        AS avg_discount,        -- ignores NULLs
    SUM(COALESCE(discount, 0)) AS total_discount -- treat NULL as 0
FROM orders;

-- NULL in JOIN: rows with NULL keys never match
SELECT o.order_id, c.name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id   -- NULL customer_id rows appear with NULL name

-- NVL (Oracle/Spark), IFNULL (MySQL), ISNULL (SQL Server) equivalents
SELECT IFNULL(discount, 0) FROM orders;          -- MySQL
SELECT NVL(discount, 0)    FROM orders;          -- Oracle / Spark SQL`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"NULL just means missing data, I use IS NULL to check for it."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"NULL uses three-valued logic — comparisons return UNKNOWN, which propagates into NOT IN subqueries and can silently zero out results. I wrap nullable aggregation inputs in COALESCE and replace NOT IN with NOT EXISTS."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-nulls" questions={[
            { question: "What does WHERE col = NULL return?", options: ['Rows where col is NULL', 'An error', 'No rows (always empty result)', 'All rows'], correct: 2, explanation: 'NULL comparisons return UNKNOWN. Use IS NULL instead.' },
            { question: "COALESCE(NULL, NULL, 5, 3) returns:", options: ['NULL', '5', '3', '0'], correct: 1 },
            { question: "Which aggregate function does NOT ignore NULLs by default?", options: ['SUM(col)', 'AVG(col)', 'COUNT(*)', 'MAX(col)'], correct: 2, explanation: 'COUNT(*) counts all rows including those with NULLs. COUNT(col) ignores NULLs.' },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use IS NULL / IS NOT NULL for comparisons</li><li>Wrap nullable columns in COALESCE before aggregating</li><li>Use NOT EXISTS instead of NOT IN when subquery may have NULLs</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use col = NULL or col != NULL</li><li>Use NOT IN when the subquery may return NULLs</li><li>Assume AVG treats NULL as 0</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-nulls') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-nulls')) { await unmarkTopicComplete('sql-nulls'); onUnmark('sql-nulls') } else { await markTopicComplete('sql-nulls'); onComplete('sql-nulls') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-nulls') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── CASE ── */}
        <section id="sql-case" ref={ref('sql-case')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>CASE WHEN Expressions</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How would you count completed vs failed pipeline runs in a single query?"</li>
                <li>"What is conditional aggregation and when would you use it?"</li>
                <li>"What does CASE WHEN return if no condition matches and there is no ELSE?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know how to use CASE inside aggregate functions (conditional aggregation) or only in SELECT columns? The real signal: can they replace multiple GROUP BY queries with a single CASE + SUM pattern, which is what senior engineers do in BI-layer queries?</p>
            </div>
          </div>
          <p>CASE WHEN is SQL's conditional expression — it works like an if/else inside any clause: SELECT, WHERE, ORDER BY, or inside an aggregate function. In production, the most powerful pattern is conditional aggregation: SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) — this pivots row-level flags into columns without requiring PIVOT syntax. The reason is that conditional aggregation runs in a single scan pass whereas multiple queries require separate table scans, making it 3–10x faster on large tables.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"CASE evaluates conditions top-to-bottom and returns the first match. Without ELSE it returns NULL."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"The most useful pattern is conditional aggregation: SUM(CASE WHEN flag = 'X' THEN amount ELSE 0 END) — one scan, multiple metrics."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"I use CASE in ORDER BY for custom sort priority and in GROUP BY for custom bucketing."</td></tr>
            </tbody>
          </table>
          <CaseDiagram />
          <CaseAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Uber, driver earnings reports use conditional aggregation — SUM(CASE WHEN trip_type='surge' THEN fare END) — to break down revenue by surge vs standard in a single GROUP BY query across 50M+ weekly trips. At Shopify, merchant dashboard SQL uses CASE WHEN to bucket order sizes into Small/Medium/Large/Enterprise tiers directly in the GROUP BY clause. Twitter/X uses CASE inside COUNT to track engagement types (likes, retweets, replies) in one aggregation scan per time window.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Searched CASE WHEN
SELECT
    order_id,
    total_amount,
    CASE
        WHEN total_amount < 50   THEN 'Small'
        WHEN total_amount < 200  THEN 'Medium'
        WHEN total_amount < 1000 THEN 'Large'
        ELSE 'Enterprise'
    END AS order_size
FROM orders;

-- Simple CASE (value comparison)
SELECT
    status,
    CASE status
        WHEN 'completed' THEN 'green'
        WHEN 'failed'    THEN 'red'
        WHEN 'pending'   THEN 'yellow'
        ELSE 'grey'
    END AS color_code
FROM pipeline_runs;

-- CASE inside aggregation (conditional aggregation)
SELECT
    product_category,
    COUNT(*) AS total_orders,
    SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) AS completed_revenue,
    SUM(CASE WHEN status = 'refunded'  THEN total_amount ELSE 0 END) AS refunded_revenue,
    AVG(CASE WHEN channel = 'mobile'   THEN total_amount END)        AS avg_mobile_order
FROM orders
GROUP BY product_category;

-- CASE in ORDER BY for custom sort
SELECT * FROM tasks
ORDER BY
    CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high'     THEN 2
        WHEN 'medium'   THEN 3
        ELSE 4
    END;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd write a separate query for each status and UNION the results."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use conditional aggregation — SUM(CASE WHEN ...) — to compute multiple slices in one scan. It's more efficient than separate queries or UNION ALL and works across all SQL engines."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-case" questions={[
            { question: "In a CASE WHEN expression, what happens if no WHEN condition matches and there is no ELSE?", options: ['An error is raised', 'The row is excluded', 'NULL is returned', '0 is returned'], correct: 2 },
            { question: "SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) is an example of:", options: ['A subquery', 'Conditional aggregation', 'A window function', 'A pivot'], correct: 1 },
            { question: "Which CASE form is more flexible for complex conditions?", options: ['Simple CASE (CASE col WHEN val THEN...)', 'Searched CASE (CASE WHEN condition THEN...)', 'Both are equally flexible', 'Neither; use IF()'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use CASE inside SUM/COUNT for conditional aggregation</li><li>Always include ELSE to handle unexpected values</li><li>Use CASE in ORDER BY for custom sort priority</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Omit ELSE when NULL would break downstream logic</li><li>Use multiple queries where one CASE aggregation works</li><li>Nest CASE more than 2 levels deep (use a lookup table)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-case') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-case')) { await unmarkTopicComplete('sql-case'); onUnmark('sql-case') } else { await markTopicComplete('sql-case'); onComplete('sql-case') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-case') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── STRINGS ── */}
        <section id="sql-strings" ref={ref('sql-strings')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>String Functions</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How would you extract the domain from an email address column?"</li>
                <li>"Why does LIKE '%pattern' prevent index usage?"</li>
                <li>"How do you parse a delimited string in Spark SQL vs PostgreSQL?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know platform-specific string functions (SPLIT_PART in PG vs SPLIT in Spark) or only the basics? The hidden test: can they explain why a leading wildcard in LIKE breaks index scans, which is a common performance issue in production logs tables?</p>
            </div>
          </div>
          <p>String manipulation is essential for data cleaning, standardization, and parsing in ETL pipelines. Different SQL dialects use slightly different function names — SPLIT_PART in PostgreSQL vs SPLIT in Spark SQL, CHARINDEX in SQL Server vs POSITION in standard SQL. In production, string cleaning happens at the Silver layer: trim whitespace, normalize case, extract substrings. The reason is that raw data from APIs and user inputs is inconsistently formatted, and downstream aggregations on messy strings produce incorrect groupings (e.g., "NY" vs "ny" counted as separate regions).</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Core string functions: UPPER/LOWER for normalization, TRIM for whitespace, SUBSTRING/LEFT/RIGHT for extraction, CONCAT or || for joining."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"For parsing: SPLIT_PART in PostgreSQL (1-indexed), SPLIT in Spark (0-indexed array), REGEXP_EXTRACT for complex patterns."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"LIKE 'abc%' can use an index; LIKE '%abc' cannot — the leading wildcard forces a full scan."</td></tr>
            </tbody>
          </table>
          <StringsDiagram />
          <StringsAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Netflix, content metadata pipelines use REGEXP_REPLACE to strip non-ASCII characters from show titles before loading into search indexes — raw titles from 30+ regional partners have inconsistent special characters. At LinkedIn, the member profile Silver layer uses LOWER(TRIM(email)) as the canonical join key because source systems inconsistently capitalize email addresses, causing ~2% duplicate member records. At Airbnb, listing description parsing uses SPLIT_PART to extract amenity tags from pipe-delimited strings ingested from hosts.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Case manipulation
SELECT UPPER('hello'), LOWER('WORLD'), INITCAP('john doe');
-- hello -> HELLO, WORLD -> world, john doe -> John Doe

-- Length and trimming
SELECT
    LENGTH('  hello  '),       -- 9 (with spaces)
    TRIM('  hello  '),         -- 'hello'
    LTRIM('  hello  '),        -- 'hello  '
    RTRIM('  hello  '),        -- '  hello'
    LENGTH(TRIM(email))        -- cleaned length
FROM customers;

-- Substring extraction
SELECT
    SUBSTRING(phone, 1, 3)            AS area_code,    -- first 3 chars
    SUBSTR(email, POSITION('@' IN email) + 1) AS domain,  -- after @
    LEFT(order_id, 4)                  AS prefix,
    RIGHT(order_id, 6)                 AS suffix
FROM orders;

-- Concatenation
SELECT
    first_name || ' ' || last_name     AS full_name,    -- standard SQL
    CONCAT(first_name, ' ', last_name) AS full_name2,   -- MySQL/Spark
    CONCAT_WS(', ', city, state, zip)  AS address       -- with separator
FROM customers;

-- Replace and translate
SELECT
    REPLACE(phone, '-', '')            AS clean_phone,
    REGEXP_REPLACE(text, '[^a-zA-Z0-9 ]', '') AS alphanum_only
FROM raw_data;

-- Split and parse delimited strings
SELECT
    SPLIT_PART('2024-01-15', '-', 1)   AS year,   -- '2024' (PostgreSQL)
    SPLIT_PART('2024-01-15', '-', 2)   AS month,  -- '01'
    SPLIT('2024-01-15', '-')[0]        AS year2   -- Spark SQL (0-indexed)
FROM (SELECT '2024-01-15' AS d) t;

-- Pattern matching
SELECT * FROM products WHERE name LIKE 'iphone%';        -- starts with
SELECT * FROM events  WHERE url LIKE '%/checkout%';      -- contains
SELECT * FROM logs    WHERE message RLIKE '^ERROR.*timeout'; -- regex

-- Position / index of substring
SELECT POSITION('.' IN email) AS dot_pos FROM customers;
SELECT CHARINDEX('.', email)   AS dot_pos FROM customers; -- SQL Server`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use LIKE '%keyword%' to search for text anywhere in a column."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"A leading wildcard in LIKE prevents B-tree index usage — for full-text search I'd use a full-text index or store normalized lowercase. For prefix-only matches I keep the wildcard at the end."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-strings" questions={[
            { question: "SPLIT_PART('a,b,c', ',', 2) returns:", options: ["'a'", "'b'", "'c'", "',b,'"], correct: 1 },
            { question: "Which function removes whitespace from both ends of a string?", options: ['CLEAN()', 'STRIP()', 'TRIM()', 'REMOVE()'], correct: 2 },
            { question: "LIKE 'abc%' will use an index but LIKE '%abc' will not. Why?", options: ['% at start prevents index range scan', 'LIKE never uses indexes', 'Only REGEXP uses indexes', 'Trailing % is not supported'], correct: 0 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Normalize strings (LOWER + TRIM) at the Silver layer</li><li>Use REGEXP_REPLACE for complex cleaning patterns</li><li>Use prefix LIKE (abc%) to keep index eligibility</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use LOWER(col) in a WHERE predicate on an indexed column</li><li>Use leading-wildcard LIKE on large tables</li><li>Join on raw string keys without normalizing case first</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-strings') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-strings')) { await unmarkTopicComplete('sql-strings'); onUnmark('sql-strings') } else { await markTopicComplete('sql-strings'); onComplete('sql-strings') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-strings') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── DATES ── */}
        <section id="sql-dates" ref={ref('sql-dates')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>Date / Time Functions</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How do you group events into weekly or monthly buckets?"</li>
                <li>"Why is WHERE YEAR(created_at) = 2024 a performance anti-pattern?"</li>
                <li>"How do you handle timezone conversion for a global user base?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know that DATE_TRUNC preserves year context while EXTRACT(MONTH) loses it, and that function wraps on date columns break index scans? The hidden test: can they write a correct date range predicate that is both sargable and timezone-aware?</p>
            </div>
          </div>
          <p>Date and time handling is core to data engineering — event timestamps, partition filters, time-series aggregations, and SLA calculations all require mastery of date functions. In production, always store timestamps in UTC and convert to local time at query time, and use DATE_TRUNC for period bucketing rather than extracting year/month separately. The reason is that EXTRACT(MONTH FROM ts) loses the year context, so December 2023 and December 2024 appear in the same bucket — a classic silent bug in time-series reports.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"For grouping into time buckets I use DATE_TRUNC — it returns the start of the period so GROUP BY works correctly across years."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"YEAR(col) = 2024 is non-sargable — I write WHERE col BETWEEN '2024-01-01' AND '2024-12-31' to keep the index."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"All timestamps are stored in UTC. I convert to local time at query time using CONVERT_TIMEZONE (Snowflake) or AT TIME ZONE (PostgreSQL)."</td></tr>
            </tbody>
          </table>
          <DatesDiagram />
          <DateAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Stripe, all payment timestamps are stored as UTC epoch and converted to merchant-local time at query time using CONVERT_TIMEZONE — serving merchants in 46 countries with different DST rules. At Databricks, Delta Lake tables are partitioned by DATE_TRUNC('day', event_time) as a STRING column so Spark partition pruning eliminates up to 99% of files on date-filtered queries. Google's BigQuery data warehouse uses DATE_TRUNC('week', date, MONDAY) to align weekly cohorts with business calendar, avoiding the Sunday-start default that confused European reporting.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Current date and time
SELECT CURRENT_DATE, CURRENT_TIMESTAMP, NOW();

-- Date arithmetic
SELECT
    order_date + INTERVAL '7 days'     AS due_date,
    order_date - INTERVAL '1 month'    AS prev_month_same_day,
    DATEDIFF('day', order_date, CURRENT_DATE) AS days_ago  -- Spark/Snowflake
    -- DATE_DIFF(CURRENT_DATE, order_date, DAY)             -- BigQuery
FROM orders;

-- Truncate to period (great for GROUP BY time buckets)
SELECT
    DATE_TRUNC('month', event_time)    AS month,
    DATE_TRUNC('week',  event_time)    AS week,
    DATE_TRUNC('hour',  event_time)    AS hour,
    COUNT(*)                            AS events
FROM events
GROUP BY 1 ORDER BY 1;

-- Extract parts
SELECT
    EXTRACT(YEAR  FROM order_date)     AS yr,
    EXTRACT(MONTH FROM order_date)     AS mo,
    EXTRACT(DOW   FROM order_date)     AS day_of_week,  -- 0=Sun in PG
    EXTRACT(EPOCH FROM event_time)     AS unix_ts
FROM orders;

-- Format and parse
SELECT
    TO_CHAR(order_date, 'YYYY-MM-DD')    AS formatted,   -- PostgreSQL
    DATE_FORMAT(order_date, '%Y-%m-%d')  AS formatted,   -- MySQL
    DATE_FORMAT(order_date, 'yyyy-MM-dd') AS formatted,  -- Spark SQL
    TO_DATE('2024-01-15', 'yyyy-MM-dd')  AS parsed       -- Spark SQL
FROM orders;

-- Timezone handling
SELECT
    event_time AT TIME ZONE 'UTC' AT TIME ZONE 'US/Eastern' AS local_time,
    CONVERT_TIMEZONE('UTC', 'US/Eastern', event_time)       AS local_time  -- Snowflake
FROM events;

-- Business day calculations (Spark SQL + Python fallback)
-- Days between two dates excluding weekends (use a calendar dim table)
SELECT COUNT(*) AS business_days
FROM calendar_dim
WHERE cal_date BETWEEN start_date AND end_date
  AND is_business_day = TRUE;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I extract the month with MONTH(date) and group by that."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use DATE_TRUNC('month', date) — it returns 2024-01-01 so GROUP BY works correctly across years. EXTRACT(MONTH) loses the year and merges all Januaries together."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-dates" questions={[
            { question: "Which function is best for grouping events into monthly buckets?", options: ['EXTRACT(MONTH FROM ts)', "DATE_TRUNC('month', ts)", 'MONTH(ts)', "TO_CHAR(ts, 'MM')"], correct: 1, explanation: "DATE_TRUNC returns the start of the period (e.g., 2024-01-01), which is better for GROUP BY than EXTRACT which loses year context." },
            { question: "Why is YEAR(created_at) = 2024 a performance anti-pattern?", options: ['YEAR() is deprecated', 'It prevents the query optimizer from using an index on created_at', 'It returns incorrect results', 'YEAR() is not standard SQL'], correct: 1 },
            { question: "DATEDIFF('day', '2024-01-01', '2024-01-15') returns:", options: ['14', '15', '-14', '1'], correct: 0 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use DATE_TRUNC for GROUP BY time buckets</li><li>Store all timestamps in UTC, convert at query time</li><li>Use range predicates (BETWEEN) instead of function wraps for index use</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use YEAR(col) = N or MONTH(col) = N in WHERE (non-sargable)</li><li>Group by EXTRACT(MONTH) without year (cross-year bug)</li><li>Store timestamps in local time (DST ambiguity)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-dates') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-dates')) { await unmarkTopicComplete('sql-dates'); onUnmark('sql-dates') } else { await markTopicComplete('sql-dates'); onComplete('sql-dates') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-dates') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── AGGREGATIONS ── */}
        <section id="sql-agg" ref={ref('sql-agg')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>Aggregations</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is the difference between PERCENTILE_CONT and PERCENTILE_DISC?"</li>
                <li>"How does AVG handle NULL values — does it include them in the denominator?"</li>
                <li>"How would you compute p95 latency in SQL?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know the full range of aggregate functions including statistical ones, or just COUNT/SUM/AVG? The key signal: understanding that AVG silently ignores NULLs, that PERCENTILE_CONT interpolates (returns a value that may not exist in the data), and that FILTER clause is cleaner than CASE WHEN for conditional aggregation in modern SQL.</p>
            </div>
          </div>
          <p>Aggregate functions collapse multiple rows into a single summary value. Standard aggregates (COUNT, SUM, AVG, MIN, MAX) are available in all SQL engines. Statistical aggregates (STDDEV, PERCENTILE_CONT, PERCENTILE_DISC) vary by platform but are essential for SLA and latency analysis. In production, AVG silently ignores NULLs — this means AVG(discount) measures the average discount among orders that have one, not among all orders. The reason is that including NULL in the denominator would change the metric's semantic meaning, but you must be explicit about this choice.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"All aggregates except COUNT(*) ignore NULLs. COUNT(*) counts rows; COUNT(col) counts non-NULL values."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"For percentiles: PERCENTILE_CONT(0.95) interpolates — may return a value not in the data; PERCENTILE_DISC returns the actual nearest data point."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"The FILTER clause (SQL:2003) is cleaner than CASE WHEN for conditional aggregation: COUNT(*) FILTER (WHERE status='failed')."</td></tr>
            </tbody>
          </table>
          <AggDiagram />
          <AggAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Spotify, streaming latency SLAs use PERCENTILE_CONT(0.99) on response_time_ms to track p99 latency — a 300ms p99 threshold triggers an incident. At Meta, ads reporting uses COUNT(*) FILTER (WHERE click_type='paid') and COUNT(*) FILTER (WHERE click_type='organic') in a single scan to compute CTR breakdowns across 10B+ daily events. Snowflake's APPROX_PERCENTILE function using HyperLogLog is used at scale where exact percentiles are too expensive on 100M+ row tables.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Standard aggregations
SELECT
    COUNT(*)                               AS total_orders,
    COUNT(DISTINCT customer_id)            AS unique_customers,
    SUM(total_amount)                      AS gross_revenue,
    AVG(total_amount)                      AS avg_order_value,
    MIN(order_date)                        AS first_order,
    MAX(order_date)                        AS last_order,
    SUM(total_amount) / COUNT(DISTINCT customer_id) AS revenue_per_customer
FROM orders
WHERE status = 'completed';

-- Statistical aggregates
SELECT
    STDDEV(response_time_ms)               AS stddev_latency,
    VARIANCE(response_time_ms)             AS variance_latency,
    PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY response_time_ms) AS p50,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) AS p95,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) AS p99,
    PERCENTILE_DISC(0.5)  WITHIN GROUP (ORDER BY response_time_ms) AS median_actual
FROM api_logs;

-- Collecting values into arrays / strings
SELECT
    customer_id,
    ARRAY_AGG(product_id ORDER BY order_date) AS product_sequence,  -- PostgreSQL
    STRING_AGG(product_name, ', ')             AS products_list,     -- PostgreSQL
    COLLECT_LIST(product_id)                   AS product_sequence   -- Spark SQL
FROM order_items
GROUP BY customer_id;

-- Filter within aggregation (SQL:2003 FILTER clause)
SELECT
    COUNT(*) FILTER (WHERE status = 'completed')  AS completed,
    COUNT(*) FILTER (WHERE status = 'failed')     AS failed,
    AVG(duration_ms) FILTER (WHERE status = 'completed') AS avg_success_duration
FROM pipeline_runs;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"AVG gives the average of all values including zeros."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"AVG ignores NULLs — so if 30% of rows have NULL discount, AVG(discount) is the mean of the 70% that have one. I use AVG(COALESCE(discount, 0)) when I want NULLs treated as zero."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-agg" questions={[
            { question: "PERCENTILE_CONT(0.5) vs PERCENTILE_DISC(0.5) - what is the key difference?", options: ['CONT is faster', 'CONT returns an interpolated value; DISC returns an actual data point', 'DISC works on strings; CONT on numbers', 'They are identical'], correct: 1 },
            { question: "AVG(col) where col has NULLs - what happens?", options: ['Returns NULL', 'Treats NULL as 0', 'Calculates average ignoring NULLs', 'Raises an error'], correct: 2 },
            { question: "COUNT(*) vs COUNT(col) - when do they give different results?", options: ['Never - they are identical', 'When col contains NULL values', 'When col has duplicates', 'Only on large tables'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use FILTER clause for conditional counts (cleaner than CASE WHEN)</li><li>Use PERCENTILE_CONT for SLA latency analysis (p95, p99)</li><li>Be explicit about NULL treatment in AVG with COALESCE</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Assume AVG includes NULL rows in its denominator</li><li>Use COUNT(col) when you mean COUNT(*)</li><li>Confuse PERCENTILE_CONT (interpolated) with PERCENTILE_DISC (actual)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-agg') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-agg')) { await unmarkTopicComplete('sql-agg'); onUnmark('sql-agg') } else { await markTopicComplete('sql-agg'); onComplete('sql-agg') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-agg') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── GROUP BY ── */}
        <section id="sql-groupby" ref={ref('sql-groupby')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>GROUP BY, HAVING, ROLLUP, CUBE, GROUPING SETS</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How do you produce subtotals and a grand total in a single query?"</li>
                <li>"What is the difference between WHERE and HAVING?"</li>
                <li>"How many grouping levels does ROLLUP(a, b, c) produce?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know the difference between WHERE (pre-aggregation) and HAVING (post-aggregation), and can they use advanced grouping extensions like ROLLUP to replace multiple UNION ALL queries? The senior signal: knowing that ROLLUP(a,b,c) produces 4 levels, not 3.</p>
            </div>
          </div>
          <p>GROUP BY collapses rows sharing the same key into aggregation groups. HAVING filters groups after aggregation — WHERE cannot reference aggregate results. In production, ROLLUP and CUBE replace multiple UNION ALL queries for multi-level reporting: a single GROUP BY ROLLUP(year, month) produces year-month detail, year subtotals, and grand total in one pass. The reason is that UNION ALL requires multiple table scans while ROLLUP achieves the same in a single scan, reducing both compute time and cost.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"WHERE filters rows before grouping; HAVING filters groups after. You cannot use aggregate functions in WHERE."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"ROLLUP(a,b,c) produces 4 levels: (a,b,c), (a,b), (a), and () — each adds one more NULL representing a subtotal."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Use GROUPING(col) to distinguish NULL-as-subtotal from NULL-as-data in ROLLUP results."</td></tr>
            </tbody>
          </table>
          <GroupByDiagram />
          <GroupByAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Uber, weekly driver earnings reports use GROUP BY ROLLUP(city, product_type) to produce city-level, product-level, and global totals in one query — previously 3 separate UNION ALL queries taking 3x longer. At Google, BigQuery billing dashboards use GROUPING SETS to generate separate rollup dimensions for project, service, and region without a full CUBE which would produce too many empty combinations. Netflix uses HAVING COUNT(*) {'>'}= 100 to filter out low-volume cohorts from cohort analysis, preventing statistical noise from distorting trends.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- GROUP BY with HAVING
SELECT
    customer_id,
    COUNT(*)        AS order_count,
    SUM(amount)     AS total_spent
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY customer_id
HAVING COUNT(*) >= 3           -- only customers with 3+ orders
   AND SUM(amount) > 500
ORDER BY total_spent DESC;

-- ROLLUP: hierarchy subtotals (year > month > day)
SELECT
    EXTRACT(YEAR  FROM order_date) AS yr,
    EXTRACT(MONTH FROM order_date) AS mo,
    SUM(amount)                    AS revenue
FROM orders
GROUP BY ROLLUP (
    EXTRACT(YEAR FROM order_date),
    EXTRACT(MONTH FROM order_date)
);
-- Produces: (yr, mo), (yr, NULL=subtotal), (NULL, NULL=grand total)

-- CUBE: all combinations
SELECT region, product_category, SUM(revenue) AS total
FROM sales
GROUP BY CUBE (region, product_category);
-- Produces: (region, cat), (region, NULL), (NULL, cat), (NULL, NULL)

-- GROUPING SETS: explicit control
SELECT region, product_category, channel, SUM(revenue)
FROM sales
GROUP BY GROUPING SETS (
    (region, product_category),
    (region, channel),
    (region),
    ()                          -- grand total
);

-- GROUPING() function to distinguish NULL subtotal from NULL data
SELECT
    GROUPING(region) AS is_region_subtotal,
    region,
    SUM(revenue)
FROM sales
GROUP BY ROLLUP (region);`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd write separate queries for each level and UNION ALL them for subtotals."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use GROUP BY ROLLUP — it produces (a,b), (a), and () grand total in one scan pass, which is more efficient than UNION ALL and ensures consistent subtotals."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-groupby" questions={[
            { question: "GROUP BY ROLLUP(a, b, c) produces how many grouping levels?", options: ['3', '4', '7', '8'], correct: 1 },
            { question: "Can you use a WHERE clause to filter aggregated results?", options: ['Yes', 'No, use HAVING instead', 'Yes, if you use a subquery', 'Only with GROUP BY'], correct: 1 },
            { question: "What does GROUPING(col) return in a ROLLUP query?", options: ['The group value', '1 if the column is in a subtotal row, 0 otherwise', 'The count of rows in the group', 'NULL'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use ROLLUP for hierarchical subtotals in reporting</li><li>Filter on aggregate results with HAVING, not WHERE</li><li>Use GROUPING() to distinguish subtotal NULLs from data NULLs</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use WHERE to filter on aggregated results (use HAVING)</li><li>Use CUBE when only a subset of combinations is needed (use GROUPING SETS)</li><li>Forget GROUPING() when NULLs can appear as both data and subtotals</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-groupby') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-groupby')) { await unmarkTopicComplete('sql-groupby'); onUnmark('sql-groupby') } else { await markTopicComplete('sql-groupby'); onComplete('sql-groupby') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-groupby') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>


        {/* ── JOINS ── */}
        <section id="sql-joins" ref={ref('sql-joins')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>JOINs (Animated Venn Diagrams)</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is the difference between INNER JOIN and LEFT JOIN?"</li>
                <li>"How many rows does a CROSS JOIN between a 100-row and 50-row table produce?"</li>
                <li>"What is a LATERAL JOIN and when would you use it?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know when LEFT JOIN returns more rows than INNER JOIN, and can they identify fan-out bugs where an ORDER has multiple items causing row duplication? The real test: can they use a CROSS JOIN with a date spine to fill gaps in time-series data?</p>
            </div>
          </div>
          <p>JOINs combine rows from two or more tables based on a matching condition. INNER JOIN returns only rows that match in both tables; LEFT JOIN returns all rows from the left table plus any matches from the right. In production, the most common bug is a fan-out: joining orders to order_items inflates the row count if an order has multiple items, causing SUM(order.amount) to be overcounted. The reason is that the join multiplies each order row by the number of matching item rows before aggregation happens.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"INNER = matching rows only. LEFT = all left rows + matches. FULL OUTER = all rows from both. CROSS = Cartesian product (m × n rows)."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Watch for fan-out: if the right table has multiple rows per join key, the left table row gets duplicated — always check row counts after joins."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"LATERAL JOIN is a correlated subquery in the FROM clause — useful for 'top N per group' or 'latest event per user' without a window function."</td></tr>
            </tbody>
          </table>
          <JoinsDiagram />
          <JoinVennDiagram />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Airbnb, the booking funnel analysis uses LEFT JOIN between search_events and booking_events on session_id — the LEFT ensures unbooked searches are counted as conversion failures, not silently excluded. At Databricks, Delta Live Table pipelines use CROSS JOIN with a date_spine table to fill missing days with 0-revenue rows before computing trailing averages, preventing sparse-data artifacts. LinkedIn uses LATERAL JOIN in PostgreSQL to efficiently fetch the last 5 posts per member in the feed ranking pipeline without scanning the full posts table.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- INNER JOIN: only matching rows
SELECT o.order_id, c.name, o.total_amount
FROM   orders o
INNER JOIN customers c ON o.customer_id = c.id;

-- LEFT JOIN: all orders even those with no customer record
SELECT o.order_id, c.name, o.total_amount
FROM   orders o
LEFT  JOIN customers c ON o.customer_id = c.id;

-- FULL OUTER JOIN: all rows from both tables
SELECT COALESCE(o.order_id, 'NO ORDER')  AS order_id,
       COALESCE(c.name,     'NO CUSTOMER') AS customer_name
FROM   orders o
FULL OUTER JOIN customers c ON o.customer_id = c.id;

-- CROSS JOIN: every combination (Cartesian)
SELECT d.date_val, p.product_id
FROM   date_spine d
CROSS  JOIN products p;   -- useful for filling gaps in time-series

-- SELF JOIN: find orders in same month for same customer
SELECT a.order_id, b.order_id AS other_order
FROM   orders a
JOIN   orders b
  ON   a.customer_id = b.customer_id
  AND  DATE_TRUNC('month', a.order_date) = DATE_TRUNC('month', b.order_date)
  AND  a.order_id < b.order_id;   -- avoid duplicates

-- LATERAL JOIN (correlated subquery as join)
SELECT c.customer_id, latest.order_id, latest.order_date
FROM   customers c
CROSS  JOIN LATERAL (
    SELECT order_id, order_date
    FROM   orders
    WHERE  customer_id = c.customer_id
    ORDER  BY order_date DESC
    LIMIT  1
) latest;   -- supported in PostgreSQL, BigQuery

-- Multi-table join
SELECT o.order_id, c.name, p.product_name, oi.quantity
FROM   orders o
JOIN   customers   c  ON o.customer_id = c.id
JOIN   order_items oi ON o.order_id    = oi.order_id
JOIN   products    p  ON oi.product_id = p.id
WHERE  o.status = 'completed';`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'll join orders to items and then sum the amount."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd aggregate items first in a subquery before joining to orders to prevent fan-out — otherwise each order row is duplicated by its item count, overcounting SUM(amount)."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-joins" questions={[
            { question: "A LEFT JOIN returns NULL values for right-table columns when:", options: ['The left table has NULLs', 'No matching row exists in the right table', 'The join column is not indexed', 'Both tables have NULLs'], correct: 1 },
            { question: "CROSS JOIN between a 100-row and 50-row table produces:", options: ['100 rows', '50 rows', '150 rows', '5000 rows'], correct: 3 },
            { question: "What is a LATERAL JOIN used for?", options: ['Joining to the same table', 'A correlated subquery that references outer query columns in FROM', 'Parallel joins for performance', 'Joining three tables'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Check row counts after each join to detect fan-out</li><li>Use LEFT JOIN when you need all rows from the driving table</li><li>Pre-aggregate one side before joining when a one-to-many relationship exists</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Join without verifying cardinality (can silently duplicate rows)</li><li>Use RIGHT JOIN (rewrite as LEFT JOIN with tables swapped)</li><li>Use CROSS JOIN without a filter or intentional Cartesian purpose</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-joins') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-joins')) { await unmarkTopicComplete('sql-joins'); onUnmark('sql-joins') } else { await markTopicComplete('sql-joins'); onComplete('sql-joins') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-joins') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── ANTI-JOINS ── */}
        <section id="sql-antijoin" ref={ref('sql-antijoin')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>Anti-joins and Semi-joins</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"Find all customers who have never placed an order."</li>
                <li>"What happens to NOT IN when the subquery returns NULL values?"</li>
                <li>"What is the difference between a semi-join and an anti-join?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know the NULL trap in NOT IN, or will they write a query that silently returns zero rows in production when the subquery contains NULLs? The senior signal: defaulting to NOT EXISTS instead of NOT IN, and understanding that EXISTS short-circuits on the first match.</p>
            </div>
          </div>
          <p>A semi-join returns rows from the left table where a match exists in the right table — without including right-table columns. An anti-join is the opposite: rows where no match exists. These patterns power incremental load logic and data quality checks. In production, NOT IN is dangerous because if the subquery returns even one NULL, three-valued logic causes the entire NOT IN to return UNKNOWN for every row, producing an empty result. The reason is that SQL cannot determine whether the value is "not in a list that includes an unknown value."</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Semi-join: WHERE EXISTS — returns left table rows that have at least one match in the right table."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Anti-join: WHERE NOT EXISTS — returns rows with no match. This is safer than NOT IN because it handles NULLs correctly."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"NOT IN with a subquery that can return NULL produces zero results — always add WHERE col IS NOT NULL inside the subquery, or use NOT EXISTS."</td></tr>
            </tbody>
          </table>
          <AntiJoinDiagram />
          <AntiSemiAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Google, BigQuery incremental pipeline jobs use NOT EXISTS to find source records with no corresponding target row — this is the anti-join pattern for Change Data Capture. At Meta, data quality checks use NOT EXISTS to find user_id values in the events table that have no matching record in the dim_users table (orphaned events), catching upstream join key issues before they reach dashboards. At Stripe, the reconciliation pipeline uses LEFT JOIN + IS NULL anti-join to find payment attempts with no matching charge record, flagging potential double-charge scenarios.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- SEMI-JOIN: orders that have at least one item (3 equivalent forms)

-- Form 1: EXISTS (most readable, good optimizer support)
SELECT o.* FROM orders o
WHERE EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.order_id
);

-- Form 2: IN (simple but can be slow with NULLs in subquery)
SELECT * FROM orders WHERE order_id IN (SELECT order_id FROM order_items);

-- Form 3: INNER JOIN + DISTINCT
SELECT DISTINCT o.* FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id;

-- ANTI-JOIN: customers who have never placed an order (3 forms)

-- Form 1: NOT EXISTS (recommended  -  handles NULLs correctly)
SELECT c.* FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);

-- Form 2: LEFT JOIN + IS NULL
SELECT c.* FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.order_id IS NULL;

-- Form 3: NOT IN (DANGER: if subquery returns any NULL, result is empty!)
SELECT * FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL);
-- Must add IS NOT NULL guard when using NOT IN

-- Practical: find pipeline_runs with no corresponding data quality check
SELECT r.run_id, r.pipeline_name, r.started_at
FROM pipeline_runs r
WHERE NOT EXISTS (
    SELECT 1 FROM dq_checks dq WHERE dq.run_id = r.run_id
)
AND r.status = 'completed';`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd use WHERE id NOT IN (SELECT customer_id FROM orders)."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use NOT EXISTS — it handles NULLs correctly and short-circuits on first match. NOT IN returns zero rows if the subquery contains any NULL due to three-valued logic."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-antijoin" questions={[
            { question: "Why is NOT IN dangerous when the subquery can return NULLs?", options: ['It is slow', 'If any subquery value is NULL, the entire NOT IN returns no rows', 'It causes a syntax error', 'NOT IN does not support subqueries'], correct: 1 },
            { question: "Which anti-join pattern is generally recommended for correctness and performance?", options: ['NOT IN', 'LEFT JOIN WHERE right IS NULL', 'NOT EXISTS', 'EXCEPT'], correct: 2 },
            { question: "A semi-join returns columns from:", options: ['Both tables', 'Only the right table', 'Only the left table', 'A derived table'], correct: 2 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use NOT EXISTS for anti-joins (null-safe and efficient)</li><li>Use EXISTS for semi-joins (short-circuits on first match)</li><li>Add IS NOT NULL guard if you must use NOT IN</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use NOT IN without verifying the subquery is NULL-free</li><li>Return right-table columns in a semi-join result</li><li>Use EXCEPT as an anti-join substitute (different semantics)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-antijoin') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-antijoin')) { await unmarkTopicComplete('sql-antijoin'); onUnmark('sql-antijoin') } else { await markTopicComplete('sql-antijoin'); onComplete('sql-antijoin') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-antijoin') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── SUBQUERIES ── */}
        <section id="sql-subqueries" ref={ref('sql-subqueries')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>Subqueries (scalar, correlated, EXISTS)</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is a correlated subquery and when is it slow?"</li>
                <li>"What happens if a scalar subquery returns more than one row?"</li>
                <li>"When would you use a subquery instead of a CTE?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate understand that a correlated subquery re-executes for every outer row, making it O(n) on the outer table size? The senior signal: knowing when to replace a correlated subquery with a LEFT JOIN + GROUP BY for better performance.</p>
            </div>
          </div>
          <p>A subquery is a SELECT nested inside another query. Scalar subqueries return exactly one value and can appear in SELECT or WHERE. Derived tables (inline views) in FROM act like temporary tables. Correlated subqueries reference the outer query — they re-execute once per outer row, which is O(n) on large tables. In production, correlated subqueries that compute per-customer order counts should be replaced with a LEFT JOIN + GROUP BY, which executes in one pass. The reason is that a correlated subquery on a 10M-row customers table executes the inner query 10M times.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Scalar subquery: returns one value, used in SELECT or WHERE. Throws a runtime error if it returns more than one row."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Correlated subquery references the outer query — re-executes once per outer row. Replace with LEFT JOIN + GROUP BY for large tables."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"EXISTS is the most efficient form — it stops scanning after the first match, unlike IN which evaluates the full subquery."</td></tr>
            </tbody>
          </table>
          <SubqueriesDiagram />
          <SubqueryCTEAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Shopify, a merchant analytics query originally used a correlated subquery to compute each merchant's last order date — it ran in 45 seconds on 20M merchants. Replacing it with a LEFT JOIN + GROUP BY pre-aggregation reduced runtime to 2 seconds. At Netflix, EXISTS subqueries are used in content licensing checks — checking whether a show is licensed in a given region stops at the first license record found, making it efficient even with millions of license rows. Databricks recommends replacing correlated subqueries with broadcast joins for Spark workloads where the inner table fits in memory.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Scalar subquery in SELECT
SELECT
    order_id,
    total_amount,
    (SELECT AVG(total_amount) FROM orders) AS overall_avg,
    total_amount - (SELECT AVG(total_amount) FROM orders) AS diff_from_avg
FROM orders;

-- Scalar subquery in WHERE
SELECT * FROM orders
WHERE total_amount > (SELECT AVG(total_amount) FROM orders WHERE status = 'completed');

-- Derived table (inline view) in FROM
SELECT dept, avg_salary
FROM (
    SELECT department AS dept, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
) dept_stats
WHERE avg_salary > 80000;

-- Correlated subquery (executes once per outer row  -  potentially slow)
SELECT c.customer_id, c.name,
    (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count,
    (SELECT MAX(order_date) FROM orders o WHERE o.customer_id = c.id) AS last_order
FROM customers c;
-- Better alternative: use LEFT JOIN + GROUP BY

-- EXISTS (stops scanning as soon as first match found)
SELECT * FROM products p
WHERE EXISTS (
    SELECT 1 FROM order_items oi
    WHERE oi.product_id = p.id
      AND oi.order_date >= CURRENT_DATE - INTERVAL '30 days'
);

-- Subquery in FROM for ranking
SELECT customer_id, revenue, revenue_rank
FROM (
    SELECT
        customer_id,
        SUM(amount) AS revenue,
        RANK() OVER (ORDER BY SUM(amount) DESC) AS revenue_rank
    FROM orders
    GROUP BY customer_id
) ranked
WHERE revenue_rank <= 10;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I put a subquery in SELECT to get each customer's order count."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"A correlated subquery in SELECT re-executes for every row — O(n) cost. I pre-aggregate orders into a CTE, then LEFT JOIN customers to it — one scan instead of n scans."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-subqueries" questions={[
            { question: "What makes a subquery 'correlated'?", options: ['It uses a JOIN', 'It references columns from the outer query', 'It is in the FROM clause', 'It returns multiple rows'], correct: 1 },
            { question: "Why is EXISTS often faster than IN for large subqueries?", options: ['EXISTS uses indexes; IN does not', 'EXISTS short-circuits after finding the first match', 'IN requires sorting', 'EXISTS is evaluated once for the whole query'], correct: 1 },
            { question: "A scalar subquery that returns more than one row will:", options: ['Return the first row', 'Raise a runtime error', 'Return NULL', 'Sum the values'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Replace correlated subqueries with LEFT JOIN + GROUP BY</li><li>Use EXISTS for existence checks (short-circuits)</li><li>Use derived tables in FROM to pre-filter before joining</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use correlated subqueries on large outer tables (O(n) cost)</li><li>Use scalar subqueries when they might return multiple rows</li><li>Nest subqueries more than 2 levels (use CTEs for readability)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-subqueries') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-subqueries')) { await unmarkTopicComplete('sql-subqueries'); onUnmark('sql-subqueries') } else { await markTopicComplete('sql-subqueries'); onComplete('sql-subqueries') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-subqueries') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── SET OPS ── */}
        <section id="sql-setops" ref={ref('sql-setops')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>SET Operations (UNION, INTERSECT, EXCEPT)</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is the difference between UNION and UNION ALL, and which is faster?"</li>
                <li>"How would you find rows that exist in one table but not another?"</li>
                <li>"What constraints must be satisfied for two queries to be combined with UNION?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate always reach for UNION ALL (preferred in data engineering) or default to UNION which triggers an expensive deduplication? The real test: can they use EXCEPT for data reconciliation — finding rows in a source system not yet loaded into the target?</p>
            </div>
          </div>
          <p>Set operations combine result sets from two or more queries with compatible column signatures. UNION ALL stacks rows from both queries and is preferred in data engineering because it requires no deduplication. UNION deduplicates — it sorts or hashes all rows, which is expensive. In production, EXCEPT is used for data reconciliation: finding rows in the source that are missing from the target, which is exactly the incremental load check pattern. The reason UNION ALL is preferred is that most pipeline data is already deduplicated at the source, so the extra sort cost of UNION is wasted work.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"UNION ALL stacks rows, keeps duplicates, no extra work. UNION deduplicates — adds a sort/hash step. I always use UNION ALL unless deduplication is explicitly needed."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"INTERSECT finds rows in both queries; EXCEPT finds rows in the first not in the second. Both deduplicate implicitly."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Column count and compatible types must match. ORDER BY only applies to the final combined result."</td></tr>
            </tbody>
          </table>
          <SetOpsDiagram />
          <SetOpsAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Spotify, the playlist events pipeline uses UNION ALL to stack web, mobile, and desktop event tables before aggregating — three separate sources unified in one query. At Airbnb, data reconciliation jobs run nightly using EXCEPT to find booking records in the source PostgreSQL database not yet propagated to the Hive data warehouse, flagging replication lag beyond 2 hours. Snowflake uses EXCEPT in automated data quality testing to validate that no rows are lost between Bronze and Silver layer transformations.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- UNION ALL (keeps duplicates, faster  -  preferred in data engineering)
SELECT customer_id, 'web'    AS channel, amount FROM web_orders
UNION ALL
SELECT customer_id, 'mobile' AS channel, amount FROM mobile_orders
UNION ALL
SELECT customer_id, 'store'  AS channel, amount FROM store_orders;

-- UNION (removes duplicates  -  sorts/hashes all rows)
SELECT email FROM newsletter_subscribers
UNION
SELECT email FROM customers;   -- unique emails across both

-- INTERSECT: emails in BOTH lists
SELECT email FROM newsletter_subscribers
INTERSECT
SELECT email FROM customers;

-- EXCEPT: subscribers who are NOT customers
SELECT email FROM newsletter_subscribers
EXCEPT
SELECT email FROM customers;

-- Data reconciliation: find rows in source not in target
SELECT id, hash_value FROM source_system
EXCEPT
SELECT id, hash_value FROM target_system;

-- Rules: column count and types must match
-- ORDER BY only at the very end of the final query
SELECT order_id, amount FROM orders_2023
UNION ALL
SELECT order_id, amount FROM orders_2024
ORDER BY order_id;   -- applies to combined result`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use UNION to combine the two tables."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use UNION ALL — it's faster because it skips the deduplication sort. I only use UNION when I explicitly need dedup, which is rare in pipeline work."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-setops" questions={[
            { question: "UNION vs UNION ALL - which is faster and why?", options: ['UNION, because it deduplicates', 'UNION ALL, because it skips the deduplication step', 'They have identical performance', 'UNION ALL is slower due to extra rows'], correct: 1 },
            { question: "What must be true for two queries to be combined with UNION?", options: ['Same table', 'Same number of columns with compatible data types', 'Same WHERE clause', 'Same ORDER BY'], correct: 1 },
            { question: "EXCEPT returns:", options: ['Rows in both queries', 'Rows in the first query not in the second', 'Rows in the second query not in the first', 'All rows from both queries'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Default to UNION ALL in ETL pipelines</li><li>Use EXCEPT for data reconciliation between source and target</li><li>Put ORDER BY only at the very end of the combined query</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use UNION when UNION ALL would suffice (wasteful sort)</li><li>Mix column types or counts in SET operations</li><li>Add ORDER BY in individual query arms (only valid at end)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-setops') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-setops')) { await unmarkTopicComplete('sql-setops'); onUnmark('sql-setops') } else { await markTopicComplete('sql-setops'); onComplete('sql-setops') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-setops') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── CTEs ── */}
        <section id="sql-cte" ref={ref('sql-cte')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>CTEs (Common Table Expressions)</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How would you rewrite a deeply nested subquery to be more readable?"</li>
                <li>"How do you traverse a hierarchical org chart in SQL?"</li>
                <li>"Are CTEs always materialized or might they be inlined?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know that CTEs in most engines are not guaranteed to be materialized — they may be inlined and re-executed per reference? The senior signal: using recursive CTEs for hierarchy traversal or date spine generation, and knowing when to use a temp table instead for guaranteed single execution.</p>
            </div>
          </div>
          <p>CTEs (WITH clauses) name subqueries so they can be referenced by name in the same query. They improve readability by breaking complex logic into named steps. In production, CTEs are the primary refactoring tool for deeply nested subqueries — each WITH clause becomes a self-documenting pipeline stage. The reason they are preferred over nested subqueries is maintainability: when a CTE needs to change, you update one named block rather than hunting through 5 levels of nesting. Recursive CTEs enable traversal of hierarchical data like org charts and bill-of-materials.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"CTEs make complex queries readable by breaking them into named, sequential steps — each WITH block is like a named pipe stage."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Recursive CTE: anchor query runs once (base case), then the recursive part joins back to itself, adding depth until no new rows are produced."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"CTEs may not be materialized — if referenced twice, the engine may execute them twice. Use a temp table for guaranteed single execution."</td></tr>
            </tbody>
          </table>
          <CTEDiagram />
          <CTEAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At LinkedIn, the data platform style guide mandates CTEs over nested subqueries for all Hive SQL queries exceeding 30 lines — it reduced code review time by ~40% due to improved readability. At Google, BigQuery's materialized CTEs (WITH MATERIALIZED) are used in analytics pipelines where a CTE is referenced 3+ times to avoid re-execution. Meta uses recursive CTEs in Presto to traverse the 50-level deep product category hierarchy in the ads catalog for spend aggregation.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Basic CTE: clean up a complex subquery chain
WITH
completed_orders AS (
    SELECT customer_id, SUM(amount) AS total, COUNT(*) AS cnt
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
),
customer_segments AS (
    SELECT
        customer_id,
        total,
        CASE
            WHEN total >= 10000 THEN 'VIP'
            WHEN total >= 1000  THEN 'Regular'
            ELSE 'New'
        END AS segment
    FROM completed_orders
)
SELECT segment, COUNT(*) AS customers, AVG(total) AS avg_spend
FROM customer_segments
GROUP BY segment;

-- Multiple CTEs (comma-separated)
WITH
raw AS (SELECT * FROM events WHERE event_date = CURRENT_DATE),
deduped AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY ingested_at DESC) AS rn
    FROM raw
),
clean AS (SELECT * FROM deduped WHERE rn = 1)
SELECT COUNT(*) FROM clean;

-- RECURSIVE CTE: traverse org hierarchy
WITH RECURSIVE org_tree AS (
    -- Base case: top-level managers
    SELECT employee_id, name, manager_id, 0 AS depth, name AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive case: direct reports
    SELECT e.employee_id, e.name, e.manager_id,
           ot.depth + 1,
           ot.path || ' > ' || e.name
    FROM employees e
    JOIN org_tree ot ON e.manager_id = ot.employee_id
)
SELECT * FROM org_tree ORDER BY path;

-- Recursive CTE: generate a date spine
WITH RECURSIVE date_spine AS (
    SELECT DATE '2024-01-01' AS d
    UNION ALL
    SELECT d + INTERVAL '1 day'
    FROM date_spine
    WHERE d < DATE '2024-12-31'
)
SELECT d FROM date_spine;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd write a subquery inside another subquery to do this in steps."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I refactor to CTEs — each WITH block is a named, reviewable pipeline stage. For hierarchical traversal I use a recursive CTE with a base-case anchor and a recursive join back to itself."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-cte" questions={[
            { question: "What is the key difference between a CTE and a subquery in terms of readability?", options: ['CTEs are always faster', 'CTEs are named and reusable within the query, making complex logic readable', 'Subqueries cannot be used in FROM', 'CTEs are always materialized'], correct: 1 },
            { question: "What are the two parts of a recursive CTE?", options: ['SELECT and FROM', 'Base case (anchor) and recursive case', 'WITH and WHERE', 'UNION and INTERSECT'], correct: 1 },
            { question: "Can a CTE be referenced multiple times in the same query?", options: ['No - it executes once only', 'Yes - and each reference may re-execute the CTE unless materialized', 'Yes - and it is always cached', 'Only if declared PERSISTENT'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use CTEs to name and document each pipeline step</li><li>Use recursive CTEs for hierarchy traversal and date spine generation</li><li>Use temp tables when a CTE is referenced multiple times and must execute once</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Assume CTEs are always materialized (they may be inlined)</li><li>Reference expensive CTEs multiple times without materializing</li><li>Omit cycle protection in recursive CTEs (can loop infinitely)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-cte') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-cte')) { await unmarkTopicComplete('sql-cte'); onUnmark('sql-cte') } else { await markTopicComplete('sql-cte'); onComplete('sql-cte') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-cte') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>


        {/* ── WINDOW FUNCTIONS ── */}
        <section id="sql-window" ref={ref('sql-window')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>Window Functions</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is the difference between ROW_NUMBER, RANK, and DENSE_RANK?"</li>
                <li>"How would you compute a running total and a 7-day rolling average?"</li>
                <li>"At what stage in SQL execution are window functions evaluated?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know that window functions are evaluated after WHERE/GROUP BY/HAVING but before ORDER BY — making them unavailable in WHERE? The senior signal: understanding PARTITION BY as defining the group boundary, and that LAST_VALUE requires a full-frame specification to work correctly.</p>
            </div>
          </div>
          <p>Window functions compute a value across a set of rows related to the current row, without collapsing them into a single row (unlike GROUP BY). They use an OVER() clause specifying PARTITION BY (group boundary), ORDER BY (sort within partition), and an optional frame. In production, window functions replace multiple self-joins for running totals, rank-within-group, and lag/lead comparisons. The reason they are preferred is that a single window function scan replaces what would otherwise require a self-join that re-reads the full table multiple times.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Window functions run after WHERE/HAVING on the full result set. PARTITION BY groups, ORDER BY defines sort, the frame defines the row range."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"ROW_NUMBER: always unique. RANK: ties share rank, gaps after. DENSE_RANK: ties share rank, no gaps. For 10,10,8: RANK=1,1,3; DENSE_RANK=1,1,2."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"LAST_VALUE needs ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING — without it, the default frame only goes to CURRENT ROW."</td></tr>
            </tbody>
          </table>
          <WindowFuncDiagram />
          <WindowAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Uber, driver incentive eligibility uses ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY trip_date DESC) to identify the most recent 7 trips per driver — replacing a correlated subquery that took 10 minutes to run across 500M trips. At Stripe, payment dispute analysis uses LAG(payment_date) to compute time-between-payments per customer, flagging accounts with unusually short intervals. Netflix uses NTILE(10) to segment subscribers into viewing-frequency deciles for content recommendation model training.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Ranking functions
SELECT
    customer_id,
    order_date,
    amount,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date)   AS order_seq,
    RANK()        OVER (ORDER BY amount DESC)                           AS amount_rank,
    DENSE_RANK()  OVER (ORDER BY amount DESC)                           AS dense_rank,
    NTILE(4)      OVER (ORDER BY amount DESC)                           AS quartile,
    PERCENT_RANK() OVER (ORDER BY amount)                               AS pct_rank
FROM orders;

-- ROW_NUMBER vs RANK vs DENSE_RANK for values 100, 90, 90, 80:
-- ROW_NUMBER:  1, 2, 3, 4  (always unique)
-- RANK:        1, 2, 2, 4  (gaps after ties)
-- DENSE_RANK:  1, 2, 2, 3  (no gaps)

-- Lag and Lead: access adjacent rows
SELECT
    customer_id,
    order_date,
    amount,
    LAG(amount)  OVER (PARTITION BY customer_id ORDER BY order_date)     AS prev_order_amt,
    LEAD(amount) OVER (PARTITION BY customer_id ORDER BY order_date)     AS next_order_amt,
    LAG(order_date, 1, '2000-01-01') OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_order_date,
    amount - LAG(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS change_from_prev
FROM orders;

-- First/Last value
SELECT
    order_id, customer_id, amount,
    FIRST_VALUE(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS first_order_amt,
    LAST_VALUE(amount)  OVER (
        PARTITION BY customer_id ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS last_order_amt   -- note: need full frame for LAST_VALUE
FROM orders;

-- Running total and running average
SELECT
    order_date,
    amount,
    SUM(amount)  OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_total,
    AVG(amount)  OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_avg,
    COUNT(*)     OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_count
FROM orders;

-- Top N per group (most common window pattern)
SELECT * FROM (
    SELECT
        product_category,
        product_id,
        revenue,
        ROW_NUMBER() OVER (PARTITION BY product_category ORDER BY revenue DESC) AS rn
    FROM product_revenue
) t WHERE rn <= 3;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"RANK and ROW_NUMBER both give a sequence number to each row."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"ROW_NUMBER is always unique. RANK assigns the same number to ties and skips the next rank. DENSE_RANK assigns same to ties but never skips — I use ROW_NUMBER for dedup, DENSE_RANK when I need a compact sequence."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-window" questions={[
            { question: "RANK() vs DENSE_RANK() - for values 10, 10, 8 what does DENSE_RANK() return?", options: ['1, 1, 3', '1, 1, 2', '1, 2, 3', '2, 2, 3'], correct: 1 },
            { question: "What does LAG(col, 1) return for the first row in a partition?", options: ['The last row value', '0', 'NULL', 'An error'], correct: 2 },
            { question: "Window functions are evaluated at which stage?", options: ['Before WHERE', 'After WHERE, during GROUP BY', 'After SELECT, before ORDER BY', 'After HAVING, when computing SELECT expressions'], correct: 3 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use ROW_NUMBER for deduplication (unique per partition)</li><li>Specify full frame for LAST_VALUE explicitly</li><li>Use PARTITION BY to reset the window per logical group</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use window functions in WHERE (not available at that stage)</li><li>Rely on LAST_VALUE without specifying full-partition frame</li><li>Omit ORDER BY in OVER() for ranking functions (undefined behavior)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-window') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-window')) { await unmarkTopicComplete('sql-window'); onUnmark('sql-window') } else { await markTopicComplete('sql-window'); onComplete('sql-window') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-window') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── WINDOW FRAMES ── */}
        <section id="sql-frames" ref={ref('sql-frames')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>Window Frames</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is the difference between ROWS and RANGE frame modes?"</li>
                <li>"What is the default window frame when ORDER BY is specified in OVER()?"</li>
                <li>"How do you compute a 7-day rolling average using window frames?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know the default frame (RANGE UNBOUNDED PRECEDING to CURRENT ROW) and that ROWS vs RANGE behaves differently when there are ties? The real test: can they write a 7-day rolling average that includes exactly 7 calendar days using RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW?</p>
            </div>
          </div>
          <p>Window frames define which rows are included in each calculation relative to the current row. ROWS mode counts physical rows (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW = exactly 7 rows). RANGE mode operates on logical values (RANGE BETWEEN INTERVAL '7 days' PRECEDING = all rows within the last 7 days by date value, which may be more than 7 rows). In production, the default frame when ORDER BY is present is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — this is a cumulative sum, not a rolling one. The reason this surprises developers is that ROWS and RANGE produce identical results when there are no ties, but diverge silently when ties exist.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"ROWS counts physical rows; RANGE uses ORDER BY value offsets. When dates have duplicates, RANGE includes all same-date rows in the window."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Default frame with ORDER BY is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — a cumulative total. For a rolling window I explicitly specify ROWS BETWEEN N PRECEDING AND CURRENT ROW."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"For a monthly reset running total: PARTITION BY DATE_TRUNC('month', date) ORDER BY date ROWS UNBOUNDED PRECEDING."</td></tr>
            </tbody>
          </table>
          <FramesDiagram />
          <FrameAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Databricks, Delta Live Table streaming aggregations use RANGE BETWEEN INTERVAL '7 days' PRECEDING to compute weekly rolling revenue — ROWS mode would give wrong results when multiple events share the same timestamp (common in batch-loaded data). At Snowflake, financial reporting uses ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for month-to-date running totals that reset each month via PARTITION BY DATE_TRUNC('month', date). Spotify uses ROWS BETWEEN 29 PRECEDING AND CURRENT ROW for 30-day rolling play counts in their recommendation feature store.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- 7-day rolling average (ROWS mode: exactly 7 preceding rows)
SELECT
    event_date,
    daily_revenue,
    AVG(daily_revenue) OVER (
        ORDER BY event_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg
FROM daily_metrics;

-- RANGE mode: includes all rows with same date
SELECT
    event_date,
    daily_revenue,
    SUM(daily_revenue) OVER (
        ORDER BY event_date
        RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW
    ) AS rolling_7d_sum
FROM daily_metrics;

-- Full partition aggregate (does not collapse rows)
SELECT
    customer_id, order_date, amount,
    SUM(amount) OVER (PARTITION BY customer_id) AS customer_total,  -- full partition
    amount / SUM(amount) OVER (PARTITION BY customer_id) AS pct_of_total
FROM orders;

-- Monthly running total that resets each month
SELECT
    order_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY DATE_TRUNC('month', order_date)
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS monthly_running_total
FROM orders;

-- Frame options summary:
-- ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -> running total
-- ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING          -> centered 5-row window
-- ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING  -> reverse running
-- ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING -> full partition`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'll use SUM OVER (ORDER BY date) for a rolling total."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"Without an explicit frame, ORDER BY in OVER() defaults to RANGE UNBOUNDED PRECEDING — that's cumulative. For a 7-day rolling window I specify ROWS BETWEEN 6 PRECEDING AND CURRENT ROW to include exactly 7 rows."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-frames" questions={[
            { question: "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW always includes exactly 7 rows. RANGE BETWEEN 6 PRECEDING AND CURRENT ROW:", options: ['Always includes exactly 7 rows', 'Includes rows within 6 units of ORDER BY value - could be more than 7', 'Includes all rows in the partition', 'Includes rows from 6 rows back to end of partition'], correct: 1 },
            { question: "What is the default frame when ORDER BY is specified in OVER()?", options: ['ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING', 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING', 'No default - you must specify the frame'], correct: 1 },
            { question: "To compute a 30-day rolling sum, which frame would you use?", options: ['RANGE BETWEEN 30 PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 29 PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 30 PRECEDING AND 1 FOLLOWING', 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Always specify frame explicitly when writing rolling aggregations</li><li>Use RANGE BETWEEN INTERVAL for calendar-based windows</li><li>Use PARTITION BY to reset frames per month or category</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Rely on default frame without understanding it is cumulative</li><li>Use ROWS mode when multiple rows share the same ORDER BY value</li><li>Forget ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING for LAST_VALUE</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-frames') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-frames')) { await unmarkTopicComplete('sql-frames'); onUnmark('sql-frames') } else { await markTopicComplete('sql-frames'); onComplete('sql-frames') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-frames') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── PIVOT ── */}
        <section id="sql-pivot" ref={ref('sql-pivot')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>PIVOT and UNPIVOT</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How would you convert rows into columns in SQL without using a native PIVOT?"</li>
                <li>"What is the difference between PIVOT and conditional aggregation?"</li>
                <li>"How would you unpivot a wide table back into a long format?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know how to write portable conditional aggregation (CASE + SUM) as a PIVOT alternative, or only native PIVOT syntax which is not universally supported? The senior signal: knowing when to UNPIVOT wide BI tables back to long format for Spark ML pipelines.</p>
            </div>
          </div>
          <p>PIVOT transforms unique row values into columns, and UNPIVOT reverses this. Native PIVOT syntax exists in SQL Server, Snowflake, and Spark SQL but not in PostgreSQL or BigQuery. In production, conditional aggregation (SUM + CASE WHEN) is the portable PIVOT pattern that works across all engines. The reason is that native PIVOT requires listing column values statically, while conditional aggregation is explicit, readable, and engine-agnostic — preferred in data platforms that serve multiple SQL dialects.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"PIVOT rotates rows to columns. The portable way is conditional aggregation: SUM(CASE WHEN category='X' THEN amount END) AS X."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Native PIVOT syntax (Snowflake/Spark) is cleaner but requires knowing all column values at query-write time."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"UNPIVOT converts wide tables back to long — use UNION ALL of one SELECT per column as the portable approach."</td></tr>
            </tbody>
          </table>
          <PivotDiagram />
          <PivotAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Shopify, merchant reporting uses conditional aggregation PIVOT to produce one column per product category — written portably so the same SQL runs on both PostgreSQL (OLTP) and Snowflake (analytics). At Meta, wide feature tables for the ads ML model use UNPIVOT to convert 500+ feature columns back to long format before ingesting into the training pipeline. Airbnb uses Spark SQL PIVOT to produce weekly heatmaps (days × hours) for host availability patterns from long-format calendar events.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Conditional aggregation PIVOT (portable, works everywhere)
SELECT
    customer_id,
    SUM(CASE WHEN product_category = 'Electronics'  THEN amount ELSE 0 END) AS electronics,
    SUM(CASE WHEN product_category = 'Clothing'     THEN amount ELSE 0 END) AS clothing,
    SUM(CASE WHEN product_category = 'Books'        THEN amount ELSE 0 END) AS books,
    SUM(CASE WHEN product_category = 'Home'         THEN amount ELSE 0 END) AS home
FROM orders
GROUP BY customer_id;

-- Native PIVOT (SQL Server / Snowflake)
SELECT * FROM (
    SELECT customer_id, product_category, amount FROM orders
) src
PIVOT (
    SUM(amount)
    FOR product_category IN ('Electronics', 'Clothing', 'Books', 'Home')
) pvt;

-- Spark SQL PIVOT
SELECT * FROM (
    SELECT customer_id, product_category, amount FROM orders
)
PIVOT (
    SUM(amount) AS total
    FOR product_category IN ('Electronics', 'Clothing', 'Books')
);

-- UNPIVOT: wide to long (portable version)
SELECT customer_id, 'electronics' AS category, electronics AS amount FROM pivoted_orders WHERE electronics IS NOT NULL
UNION ALL
SELECT customer_id, 'clothing',   clothing   FROM pivoted_orders WHERE clothing   IS NOT NULL
UNION ALL
SELECT customer_id, 'books',      books      FROM pivoted_orders WHERE books      IS NOT NULL;

-- Native UNPIVOT (SQL Server)
SELECT customer_id, category, amount
FROM pivoted_orders
UNPIVOT (amount FOR category IN (electronics, clothing, books)) unpvt;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd use the PIVOT keyword to rotate the rows."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use conditional aggregation — SUM(CASE WHEN cat='X' THEN amount END) — because it's portable across all engines. Native PIVOT syntax varies by platform and requires static column enumeration."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-pivot" questions={[
            { question: "What does a PIVOT operation do to data?", options: ['Filters columns', 'Rotates unique row values into columns', 'Sorts by multiple columns', 'Transposes all rows to columns'], correct: 1 },
            { question: "Conditional aggregation (CASE + SUM) is preferred over native PIVOT because:", options: ['It is faster', 'It is portable across all SQL engines', 'It supports more column types', 'Native PIVOT has bugs'], correct: 1 },
            { question: "UNPIVOT converts:", options: ['NULL values to 0', 'Wide tables (many columns) to long tables (many rows)', 'Long tables to wide tables', 'Rows to JSON'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use conditional aggregation for portable PIVOT</li><li>UNPIVOT wide feature tables before ML ingestion</li><li>Use native PIVOT only when the engine is fixed (Snowflake/Spark)</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use native PIVOT when writing cross-platform SQL</li><li>Forget ELSE 0 in CASE WHEN (NULL ruins SUM totals)</li><li>Manually write UNPIVOT for 100+ columns (use dynamic SQL)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-pivot') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-pivot')) { await unmarkTopicComplete('sql-pivot'); onUnmark('sql-pivot') } else { await markTopicComplete('sql-pivot'); onComplete('sql-pivot') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-pivot') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── JSON ── */}
        <section id="sql-json" ref={ref('sql-json')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>JSON in SQL</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How do you parse a JSON string column into typed fields in Spark SQL?"</li>
                <li>"How would you explode a JSON array column into multiple rows?"</li>
                <li>"What is the difference between from_json() and get_json_object()?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know the difference between get_json_object (scalar extraction, string output) and from_json (schema-aware struct conversion)? The real test: can they explode a JSON array column into rows using explode(from_json(...)) in Spark SQL — a pattern used in every event streaming pipeline?</p>
            </div>
          </div>
          <p>Modern data platforms ingest JSON as raw string columns and require SQL to parse, extract, and expand the nested structure. In production, from_json() with an explicit schema is preferred over get_json_object() because it is type-safe and enables Spark's Catalyst optimizer to push predicates into the struct. The reason is that get_json_object returns strings — requiring explicit casts — while from_json produces a typed struct that downstream aggregations can use directly without casting overhead.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"In Spark SQL I use from_json(col, schema) to parse JSON strings into typed structs, then access fields with dot notation."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"To expand JSON arrays into rows: explode(from_json(col, 'ARRAY&lt;STRUCT&lt;...&gt;&gt;')) — one row per array element."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"In PostgreSQL I use -&gt;&gt; for text extraction and jsonb_array_elements for array expansion. In BigQuery: JSON_EXTRACT_SCALAR."</td></tr>
            </tbody>
          </table>
          <JSONSQLDiagram />
          <JSONSQLAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Stripe, the payment webhook events pipeline uses from_json() with a versioned schema registry to parse 500M+ daily JSON events from Kafka — schema evolution is handled via StructType merging. At Twitter/X, the timeline events pipeline uses explode(from_json(impressions_array, 'ARRAY&lt;STRUCT&lt;tweet_id:STRING,score:DOUBLE&gt;&gt;')) to expand each user's impression list into individual rows for CTR analysis. LinkedIn uses PostgreSQL JSONB operators (-&gt;&gt;, @&gt;) for real-time profile section queries where the data model has optional fields stored as JSON.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Spark SQL: parse JSON string column
SELECT
    event_id,
    from_json(payload, 'STRUCT<user_id:STRING, action:STRING, ts:TIMESTAMP>') AS parsed,
    get_json_object(payload, '$.user_id')  AS user_id,
    get_json_object(payload, '$.action')   AS action
FROM raw_events;

-- Explode JSON array into rows (Spark SQL)
SELECT
    event_id,
    explode(from_json(items_json, 'ARRAY<STRUCT<id:STRING, qty:INT>>')) AS item
FROM orders_raw;

-- Then access struct fields
SELECT event_id, item.id, item.qty
FROM (
    SELECT event_id,
           explode(from_json(items_json, 'ARRAY<STRUCT<id:STRING, qty:INT>>')) AS item
    FROM orders_raw
);

-- PostgreSQL JSON operators
SELECT
    data->>'user_id'                   AS user_id,       -- text
    (data->'metadata'->>'source')       AS source,       -- nested
    data->'tags'->>0                    AS first_tag,    -- array element
    jsonb_array_elements_text(data->'tags') AS tag       -- expand array
FROM events;

-- BigQuery JSON
SELECT
    JSON_EXTRACT_SCALAR(payload, '$.user_id')    AS user_id,
    JSON_EXTRACT(payload, '$.metadata')          AS metadata_json,
    JSON_EXTRACT_SCALAR(payload, '$.items[0].id') AS first_item_id
FROM raw_events;

-- Convert to JSON
SELECT to_json(struct(order_id, customer_id, amount)) AS json_row FROM orders; -- Spark
SELECT row_to_json(t) FROM orders t;  -- PostgreSQL`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd use get_json_object to pull out the fields I need."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use from_json() with an explicit schema — it produces typed structs that work with Catalyst optimizer pushdowns. get_json_object returns strings requiring casts, and misses schema evolution benefits."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-json" questions={[
            { question: "In Spark SQL, which function converts a JSON string column to a struct?", options: ['parse_json()', 'json_decode()', 'from_json()', 'json_extract()'], correct: 2 },
            { question: "get_json_object(col, '$.a.b') extracts:", options: ['Top-level key a', 'Key b nested under key a', 'Array element at position b', 'All keys'], correct: 1 },
            { question: "To expand a JSON array column into multiple rows in Spark SQL, you use:", options: ['PIVOT', 'UNNEST', 'explode(from_json(...))', 'CROSS JOIN JSON_TABLE'], correct: 2 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use from_json() with explicit schema for type safety in Spark</li><li>Use explode() to expand JSON arrays into rows</li><li>Version your JSON schemas alongside your pipeline code</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Store deeply nested JSON without flattening in the Silver layer</li><li>Use get_json_object when from_json gives typed access</li><li>Parse JSON in Gold layer (push parsing to Bronze/Silver)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-json') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-json')) { await unmarkTopicComplete('sql-json'); onUnmark('sql-json') } else { await markTopicComplete('sql-json'); onComplete('sql-json') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-json') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── DML ── */}
        <section id="sql-dml" ref={ref('sql-dml')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>DML (INSERT, UPDATE, DELETE, MERGE)</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How would you implement an upsert in PostgreSQL vs Databricks Delta?"</li>
                <li>"What does MERGE's WHEN NOT MATCHED BY SOURCE clause do?"</li>
                <li>"What is the difference between DELETE and TRUNCATE?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know the MERGE statement and can they distinguish when to use INSERT ON CONFLICT (PostgreSQL upsert) vs Delta MERGE? The senior signal: understanding that DELETE is row-level logged while TRUNCATE is minimally logged, and knowing that MERGE on Delta Lake supports the WHEN NOT MATCHED BY SOURCE delete clause.</p>
            </div>
          </div>
          <p>DML (Data Manipulation Language) modifies the data in tables: INSERT adds rows, UPDATE modifies rows, DELETE removes rows, and MERGE combines all three in a single atomic operation. In production, MERGE is the most powerful and most error-prone — the WHEN NOT MATCHED BY SOURCE clause deletes rows from the target that no longer exist in the source, enabling full sync semantics. The reason MERGE is preferred over separate INSERT/UPDATE/DELETE steps is atomicity — all changes apply as a single transaction, preventing partial updates that corrupt data quality.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"INSERT for new rows. UPDATE for changing existing rows. DELETE for removing rows with a condition. TRUNCATE for removing ALL rows fast."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"PostgreSQL upsert: INSERT ON CONFLICT (key) DO UPDATE SET. Databricks: MERGE INTO target USING source ON key WHEN MATCHED UPDATE WHEN NOT MATCHED INSERT."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"DELETE is fully row-level logged (can roll back, supports WHERE). TRUNCATE deallocates pages — much faster but cannot be filtered."</td></tr>
            </tbody>
          </table>
          <DMLDiagram />
          <DMLAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Databricks, the Silver layer customer dimension uses MERGE INTO with WHEN NOT MATCHED BY SOURCE DELETE to keep the Delta table in sync with the source CRM — removing churned customers automatically. At Snowflake, the product catalog refresh job runs an hourly MERGE that processes 50K source rows against a 10M-row target table, with matched-update checking updated_at to skip unchanged rows. Google's Cloud Spanner uses DML MERGE semantics via mutations for cross-shard upserts in the ads serving layer, guaranteeing consistency without a global lock.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- INSERT variants
INSERT INTO orders (customer_id, amount, status) VALUES (1, 99.99, 'pending');

-- INSERT from SELECT (load from staging)
INSERT INTO orders_clean
SELECT order_id, customer_id, ROUND(amount, 2), status, CURRENT_TIMESTAMP
FROM orders_staging
WHERE amount > 0;

-- INSERT ... ON CONFLICT (PostgreSQL upsert)
INSERT INTO customers (id, email, name, updated_at)
VALUES (1, 'alice@x.com', 'Alice', NOW())
ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = EXCLUDED.name,
    updated_at = EXCLUDED.updated_at;

-- UPDATE with FROM (PostgreSQL / Spark not supported natively)
UPDATE orders o
SET status = 'completed', completed_at = NOW()
FROM shipments s
WHERE o.order_id = s.order_id
  AND s.delivered_at IS NOT NULL;

-- DELETE with subquery
DELETE FROM orders_staging
WHERE order_id IN (
    SELECT order_id FROM orders WHERE status = 'completed'
);

-- MERGE (ANSI SQL:2003  -  supported in Databricks/Snowflake/SQL Server)
MERGE INTO customers_target AS t
USING customers_source AS s
ON t.customer_id = s.customer_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN
    UPDATE SET t.email = s.email, t.name = s.name, t.updated_at = s.updated_at
WHEN NOT MATCHED BY TARGET THEN
    INSERT (customer_id, email, name, created_at, updated_at)
    VALUES (s.customer_id, s.email, s.name, s.created_at, s.updated_at)
WHEN NOT MATCHED BY SOURCE THEN
    DELETE;   -- remove rows no longer in source (Delta Lake specific)

-- Delta Lake MERGE (PySpark API)
-- from delta.tables import DeltaTable
-- DeltaTable.forName(spark, "customers") \\
--   .alias("t").merge(source.alias("s"), "t.id = s.id") \\
--   .whenMatchedUpdateAll() \\
--   .whenNotMatchedInsertAll() \\
--   .execute()`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd check if the row exists, then insert or update separately."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I use MERGE — it's atomic, handles matched/not-matched in one statement. For PostgreSQL I use INSERT ON CONFLICT; for Delta Lake I use the MERGE API with whenMatchedUpdateAll() and whenNotMatchedInsertAll()."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-dml" questions={[
            { question: "What does MERGE's WHEN NOT MATCHED BY SOURCE clause do?", options: ['Inserts new rows', 'Updates rows not in source', 'Deletes target rows that have no matching source row', 'Does nothing'], correct: 2 },
            { question: "INSERT INTO ... ON CONFLICT (id) DO UPDATE is a PostgreSQL pattern for:", options: ['Conditional insert', 'Upsert (insert or update)', 'Bulk insert', 'Insert with validation'], correct: 1 },
            { question: "DELETE with a subquery vs TRUNCATE - key difference:", options: ['TRUNCATE is logged; DELETE is not', 'DELETE removes specific rows and is fully logged; TRUNCATE removes all rows and is minimally logged', 'DELETE is faster than TRUNCATE', 'TRUNCATE supports WHERE clauses'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use MERGE for atomic upsert + delete in one pass</li><li>Use TRUNCATE to fast-reset staging tables between loads</li><li>Add a condition to WHEN MATCHED UPDATE to skip unchanged rows</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Do separate SELECT-then-INSERT/UPDATE outside a transaction</li><li>Use TRUNCATE when you need to preserve some rows (use DELETE WHERE)</li><li>Run MERGE without a unique join key (causes duplicate matches)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-dml') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-dml')) { await unmarkTopicComplete('sql-dml'); onUnmark('sql-dml') } else { await markTopicComplete('sql-dml'); onComplete('sql-dml') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-dml') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>


        {/* ── DDL ── */}
        <section id="sql-ddl" ref={ref('sql-ddl')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>DDL (CREATE, ALTER, DROP)</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is the difference between TRUNCATE and DELETE FROM?"</li>
                <li>"How would you add a column to a live production table safely?"</li>
                <li>"What is CTAS and when would you use it?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know that ALTER TABLE ADD COLUMN can lock a large production table in some databases, causing downtime? The senior signal: awareness of online DDL options, the difference between TRUNCATE (page deallocation) and DELETE (row-level), and how Delta Lake DDL differs from traditional SQL DDL.</p>
            </div>
          </div>
          <p>DDL (Data Definition Language) defines the structure of database objects: tables, views, indexes, and schemas. CREATE TABLE with proper constraints (NOT NULL, CHECK, FOREIGN KEY) enforces data quality at the database level. In production, ALTER TABLE operations on large tables require care — adding a NOT NULL column without a default causes a full table rewrite on PostgreSQL. The reason is that every existing row must be updated to store the new column's value, locking the table for reads and writes during the operation on traditional databases.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"CREATE TABLE with constraints (NOT NULL, CHECK, FK) to enforce data quality at schema level. CTAS for creating tables from query results."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"ALTER TABLE in production: add nullable columns first, backfill, then add NOT NULL constraint — avoids table lock."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"TRUNCATE is fast (deallocates pages, minimally logged). DELETE is row-level logged, supports WHERE. DROP TABLE is permanent — always use IF EXISTS."</td></tr>
            </tbody>
          </table>
          <DDLDiagram />
          <DDLAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Netflix, schema migrations on the MySQL billing tables use the pt-online-schema-change tool because ALTER TABLE on a 2B-row table takes 6+ hours with a full lock. At Airbnb, DDL changes on Hive tables are deployed through a migration service that runs CTAS-rename-drop to swap tables atomically without downtime. Meta uses Delta Lake TBLPROPERTIES DDL to set autoOptimize and autoCompact on high-write tables, reducing small-file problems in the Bronze layer without manual OPTIMIZE runs.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- CREATE TABLE with constraints
CREATE TABLE orders (
    order_id      BIGINT       PRIMARY KEY,
    customer_id   BIGINT       NOT NULL REFERENCES customers(id),
    order_date    DATE         NOT NULL DEFAULT CURRENT_DATE,
    amount        DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    status        VARCHAR(20)  NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','completed','failed','refunded')),
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CTAS: create table from query result
CREATE TABLE orders_summary AS
SELECT customer_id, COUNT(*) AS cnt, SUM(amount) AS total
FROM orders GROUP BY customer_id;

-- CREATE OR REPLACE (Databricks, Snowflake)
CREATE OR REPLACE TABLE gold.customer_metrics AS
SELECT customer_id, COUNT(*) cnt, SUM(amount) total FROM orders GROUP BY 1;

-- ALTER TABLE: add/drop/rename columns
ALTER TABLE orders ADD COLUMN channel VARCHAR(50);
ALTER TABLE orders DROP COLUMN legacy_field;
ALTER TABLE orders RENAME COLUMN amt TO amount;
ALTER TABLE orders ALTER COLUMN amount TYPE DECIMAL(14,2);  -- PostgreSQL

-- Adding constraints
ALTER TABLE orders ADD CONSTRAINT chk_positive_amount CHECK (amount > 0);
ALTER TABLE orders ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id);

-- DROP with safety check
DROP TABLE IF EXISTS orders_temp;
DROP VIEW  IF EXISTS v_active_customers;

-- TRUNCATE: fast all-rows delete (cannot WHERE)
TRUNCATE TABLE orders_staging;
TRUNCATE TABLE orders_staging RESTART IDENTITY;  -- also reset sequences

-- Delta Lake DDL
CREATE TABLE IF NOT EXISTS silver.orders (
    order_id STRING, customer_id STRING, amount DOUBLE, status STRING, order_date DATE
) USING DELTA
PARTITIONED BY (order_date)
LOCATION 'abfss://silver@datalake.dfs.core.windows.net/orders'
TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true');`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd just run ALTER TABLE to add the new column."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"On a live table I'd add it nullable first to avoid a table rewrite, backfill values in batches, then add the NOT NULL constraint — using online DDL tooling if the table is large."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-ddl" questions={[
            { question: "TRUNCATE vs DELETE FROM - which is faster and why?", options: ['DELETE, because it processes rows individually', 'TRUNCATE, because it deallocates data pages without row-level logging', 'They have identical performance', 'TRUNCATE is slower on large tables'], correct: 1 },
            { question: "CREATE TABLE AS SELECT (CTAS) creates a table:", options: ['With no data', 'With the structure and data from the SELECT query', 'With only the structure (schema) of the SELECT', 'As a view, not a real table'], correct: 1 },
            { question: "ALTER TABLE ADD COLUMN in a live production table may cause:", options: ['An error if the table has data', 'A table lock (downtime) on some databases', 'All existing rows to be deleted', 'The column to be filled with random data'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Add nullable columns first, then backfill, then add constraints</li><li>Use CREATE OR REPLACE for idempotent pipeline DDL</li><li>Always use IF EXISTS on DROP to avoid errors in CI/CD</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Run ALTER TABLE ADD NOT NULL on large production tables without online DDL</li><li>Use DROP TABLE without IF EXISTS in scripts</li><li>Use TRUNCATE when you need row-level control or rollback</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-ddl') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-ddl')) { await unmarkTopicComplete('sql-ddl'); onUnmark('sql-ddl') } else { await markTopicComplete('sql-ddl'); onComplete('sql-ddl') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-ddl') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── VIEWS ── */}
        <section id="sql-views" ref={ref('sql-views')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Views and Materialized Views</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is the difference between a view and a materialized view?"</li>
                <li>"When would you choose a materialized view over a regular view?"</li>
                <li>"How do you refresh a materialized view without locking reads?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know that regular views execute the underlying query every time they are queried, while materialized views store the result? The real test: can they explain the trade-off between freshness and query speed, and do they know that REFRESH MATERIALIZED VIEW CONCURRENTLY requires a unique index?</p>
            </div>
          </div>
          <p>A view is a stored query — it has no physical data and re-executes against the base tables every time it is queried. A materialized view stores the query result physically and must be explicitly refreshed. In production, materialized views are used for expensive aggregations that many users query simultaneously — a dashboard reading a materialized view gets sub-second response vs 30 seconds for the live query. The reason they trade freshness for speed is that the pre-computation cost is paid once at refresh time, not once per user query.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Regular view: stored query, no data. Executes every time. Always fresh."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Materialized view: stores results physically. Fast reads. Stale until refreshed."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"REFRESH CONCURRENTLY avoids read locks but needs a unique index. Standard REFRESH blocks reads during the refresh."</td></tr>
            </tbody>
          </table>
          <ViewsDiagram />
          <ViewsAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Google, BigQuery materialized views are used on the ads analytics dataset to pre-aggregate impression counts by campaign — 500M+ raw rows reduced to 10K aggregate rows, serving the dashboard in under 100ms. At Shopify, PostgreSQL materialized views on the merchant revenue summary are refreshed every 15 minutes via a cron job using REFRESH MATERIALIZED VIEW CONCURRENTLY to avoid blocking merchant dashboard reads. Uber creates Gold-layer Delta Live Tables as the "view" equivalent in their lakehouse — a managed transformation that auto-refreshes on source data updates.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Regular view (no data stored)
CREATE OR REPLACE VIEW v_active_customers AS
SELECT
    c.id, c.name, c.email,
    COUNT(o.order_id)  AS order_count,
    SUM(o.amount)      AS lifetime_value,
    MAX(o.order_date)  AS last_order_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.email;

-- Query the view like a table
SELECT * FROM v_active_customers WHERE lifetime_value > 1000 ORDER BY lifetime_value DESC;

-- Updatable views (simple views can support INSERT/UPDATE)
CREATE VIEW v_pending_orders AS
SELECT order_id, customer_id, amount FROM orders WHERE status = 'pending';
-- UPDATE v_pending_orders SET amount = 99 WHERE order_id = 1; -- works if simple

-- Materialized view (PostgreSQL)
CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT
    DATE_TRUNC('day', order_date)  AS day,
    SUM(amount)                     AS revenue,
    COUNT(DISTINCT customer_id)     AS unique_customers
FROM orders
WHERE status = 'completed'
GROUP BY 1;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW mv_daily_revenue;                    -- blocks reads
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_revenue;       -- no lock, needs unique index

-- Create index on materialized view for fast queries
CREATE UNIQUE INDEX ON mv_daily_revenue (day);

-- Databricks: equivalent via scheduled CTAS or Delta Live Tables
-- Gold layer view
CREATE OR REPLACE VIEW gold.v_customer_360 AS
SELECT ... FROM silver.customers JOIN silver.orders USING (customer_id);`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"A view is like a saved query that you can query like a table."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"A regular view re-executes the query every call — no perf benefit. For expensive aggregations I use a materialized view with a scheduled refresh and CONCURRENTLY option to avoid blocking reads."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-views" questions={[
            { question: "What is the key difference between a view and a materialized view?", options: ['Views can be updated; materialized views cannot', 'Materialized views store data physically; regular views execute the query at runtime', 'Views are faster than materialized views', 'Materialized views always stay up to date automatically'], correct: 1 },
            { question: "When should you prefer a materialized view over a regular view?", options: ['When the underlying data changes every second', 'When the query is expensive and slight staleness is acceptable', 'When the table has fewer than 1000 rows', 'When you need row-level security'], correct: 1 },
            { question: "REFRESH MATERIALIZED VIEW CONCURRENTLY requires:", options: ['A superuser role', 'A unique index on the materialized view', 'No active transactions', 'PostgreSQL 14+'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use materialized views for expensive aggregations read by many users</li><li>Create a unique index before using REFRESH CONCURRENTLY</li><li>Schedule refreshes during low-traffic windows</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use a materialized view when data must always be current</li><li>Query a materialized view for real-time transactional checks</li><li>Run REFRESH without CONCURRENTLY on views serving live dashboards</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-views') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-views')) { await unmarkTopicComplete('sql-views'); onUnmark('sql-views') } else { await markTopicComplete('sql-views'); onComplete('sql-views') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-views') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── TRANSACTIONS ── */}
        <section id="sql-transactions" ref={ref('sql-transactions')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Transactions and ACID</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"Explain ACID and what each property means."</li>
                <li>"What is a dirty read and which isolation level prevents it?"</li>
                <li>"What is a phantom read and how is it different from a non-repeatable read?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know the four isolation levels and which anomaly each prevents? The hidden test: can they distinguish a phantom read (new rows appearing) from a non-repeatable read (same row changing value), and do they know that READ COMMITTED prevents dirty reads but not non-repeatable reads?</p>
            </div>
          </div>
          <p>Transactions group multiple SQL operations into a single atomic unit — either all succeed (COMMIT) or all fail (ROLLBACK). ACID properties define the guarantees: Atomicity (all-or-nothing), Consistency (constraints maintained), Isolation (concurrent transactions appear sequential), Durability (committed data survives crashes). In production, the choice of isolation level is a performance-correctness trade-off: SERIALIZABLE is fully correct but expensive due to locking; READ COMMITTED is the default in PostgreSQL and SQL Server — it prevents dirty reads but allows phantom reads. The reason most production systems use READ COMMITTED is that higher isolation levels increase lock contention and reduce throughput.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"ACID: Atomicity=all-or-nothing. Consistency=constraints. Isolation=concurrent txns appear sequential. Durability=committed survives crash."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Isolation levels: READ UNCOMMITTED allows dirty reads. READ COMMITTED (default) prevents them. REPEATABLE READ also prevents non-repeatable reads. SERIALIZABLE prevents all including phantom reads."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Phantom read: new rows appear between two identical SELECTs in one transaction. Non-repeatable read: same row's value changes between two reads."</td></tr>
            </tbody>
          </table>
          <TransactionsDiagram />
          <TransactionAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Stripe, payment processing uses SERIALIZABLE isolation for the payment attempt + charge creation transaction to prevent double-charges when concurrent retries hit the same endpoint — the extra locking cost is acceptable for financial correctness. At LinkedIn, the member connections table uses READ COMMITTED for read-heavy feed queries (performance) but REPEATABLE READ for connection graph writes (correctness). Databricks Delta Lake uses Optimistic Concurrency Control (OCC) as its ACID implementation — writers check for conflicts at commit time rather than holding locks, enabling high-throughput concurrent writes.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Basic transaction
BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;
    -- If any error: ROLLBACK
COMMIT;

-- Transaction with error handling (PostgreSQL)
BEGIN;
    INSERT INTO orders (customer_id, amount) VALUES (1, 99.99);
    UPDATE inventory SET qty = qty - 1 WHERE product_id = 42;
    -- SAVEPOINT before risky operation
    SAVEPOINT before_notification;
    INSERT INTO notifications (customer_id, message) VALUES (1, 'Order placed');
    -- If notification fails, roll back only to savepoint
    RELEASE SAVEPOINT before_notification;
COMMIT;

-- Isolation levels and the anomalies they prevent
-- READ UNCOMMITTED: dirty reads allowed (see uncommitted changes)
-- READ COMMITTED:   no dirty reads (default in PostgreSQL, SQL Server)
-- REPEATABLE READ:  no dirty reads, no non-repeatable reads
-- SERIALIZABLE:     no dirty reads, no non-repeatable reads, no phantom reads

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
    SELECT COUNT(*) FROM orders WHERE status = 'pending';
    -- With SERIALIZABLE, concurrent INSERT of pending order will be blocked
COMMIT;

-- Concurrency anomalies:
-- Dirty read: reading uncommitted data from another transaction
-- Non-repeatable read: same SELECT returns different values in same transaction
-- Phantom read: new rows appear in same query within same transaction

-- Locking: explicit locks (use sparingly)
BEGIN;
    SELECT * FROM orders WHERE status = 'pending' FOR UPDATE;  -- row lock
    UPDATE orders SET status = 'processing' WHERE status = 'pending';
COMMIT;

-- Deadlock prevention: always acquire locks in the same order
-- and keep transactions short`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"ACID means the database is reliable and won't lose data."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"ACID: Atomicity ensures all-or-nothing. Isolation controls what concurrent transactions can see — READ COMMITTED prevents dirty reads but allows phantom reads; SERIALIZABLE prevents all anomalies at the cost of throughput."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-transactions" questions={[
            { question: "Which ACID property ensures a transaction is either fully applied or fully rolled back?", options: ['Consistency', 'Isolation', 'Atomicity', 'Durability'], correct: 2 },
            { question: "READ COMMITTED isolation level prevents which anomaly?", options: ['Phantom reads', 'Non-repeatable reads', 'Dirty reads', 'Lost updates'], correct: 2 },
            { question: "A phantom read occurs when:", options: ['A row changes value between two reads in the same transaction', 'Uncommitted data is read', 'New rows appear in the same query within the same transaction', 'A transaction is rolled back'], correct: 2 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Keep transactions as short as possible to reduce lock contention</li><li>Acquire locks in a consistent order to prevent deadlocks</li><li>Use SAVEPOINT for partial rollback within a transaction</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Hold transactions open across network calls or user input</li><li>Use SERIALIZABLE for all queries (massive throughput hit)</li><li>Ignore deadlock risks when locking multiple rows in different orders</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-transactions') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-transactions')) { await unmarkTopicComplete('sql-transactions'); onUnmark('sql-transactions') } else { await markTopicComplete('sql-transactions'); onComplete('sql-transactions') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-transactions') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── NORMALIZATION ── */}
        <section id="sql-normalization" ref={ref('sql-normalization')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Normalization (1NF, 2NF, 3NF)</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"Explain the difference between 1NF, 2NF, and 3NF."</li>
                <li>"Why are data warehouses intentionally denormalized?"</li>
                <li>"What is a transitive dependency and how do you eliminate it?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate understand when to normalize vs denormalize, and can they explain why OLAP systems intentionally violate 3NF? The senior signal: articulating the star schema trade-off — redundant data in dimension tables enables single-join queries that are faster for analytics than fully normalized 3NF schemas.</p>
            </div>
          </div>
          <p>Normalization organizes relational schemas to eliminate redundancy and data anomalies. 1NF requires atomic column values; 2NF eliminates partial dependencies on composite keys; 3NF eliminates transitive dependencies between non-key columns. In production, OLTP systems use 3NF to minimize update anomalies, but data warehouses are intentionally denormalized into star or snowflake schemas. The reason is that JOIN performance matters most in analytics — a single JOIN from fact to dimension is faster than the 4+ JOINs required by a fully normalized schema, and columnar storage engines like Parquet make redundancy cheap.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"1NF: atomic values, no arrays. 2NF: no partial dependency (non-key col depends on whole composite key). 3NF: no transitive dependency (non-key col depending on another non-key)."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Data warehouses intentionally denormalize into star schema — fact table joins to pre-joined dimension tables — to reduce JOINs in analytical queries."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Transitive dependency example: zip_code → city → state. Fix: separate into a ZipCodes(zip, city, state) lookup table."</td></tr>
            </tbody>
          </table>
          <NormalizationDiagram />
          <NormalizationAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Meta, the OLTP user profile database is normalized to 3NF to prevent update anomalies — changing a user's email in one place updates it everywhere. But the analytics warehouse uses a denormalized star schema: dim_user has pre-joined demographics, location, and preferences so ad targeting queries need only one JOIN. Snowflake's recommended architecture for Gold layer tables is intentional denormalization — wide tables with all dimensions flattened — because columnar storage compresses repeated values efficiently, making redundancy nearly free. At Airbnb, the data model team documented their evolution from 3NF normalized OLTP to a denormalized Kimball-style star schema as their analytics volume grew past 1 billion booking events.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- 1NF: Each column holds atomic (indivisible) values, no repeating groups
-- VIOLATION: products column contains 'Laptop,Mouse' (multi-valued)
-- FIX: one row per product

-- 2NF: 1NF + no partial dependencies (non-key columns depend on the WHOLE key)
-- Example: composite key (order_id, product_id)
-- VIOLATION: product_name depends only on product_id (partial dependency)
-- FIX: move product_name to a Products table

-- 3NF: 2NF + no transitive dependencies (non-key col depends on another non-key col)
-- Example: zip_code -> city -> state
-- VIOLATION: city and state depend on zip_code (transitive)
-- FIX: create a ZipCodes(zip, city, state) table

-- BCNF: Every determinant is a candidate key (stronger than 3NF)

-- Denormalized star schema (data warehouse  -  intentional)
-- Fact table: orders_fact(order_id, customer_key, product_key, date_key, amount)
-- Dim tables: dim_customer, dim_product, dim_date
-- Trade-off: redundant data in dims, but fast single-join queries

-- When to denormalize in data engineering:
-- Gold layer tables for BI: pre-join dimensions to reduce query complexity
-- Parquet column pruning: wide flat tables let engines skip irrelevant columns
-- Aggregated rollup tables: pre-computed summaries for dashboards`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"You should always normalize your database to 3NF."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"OLTP systems use 3NF to prevent update anomalies. But data warehouses intentionally denormalize into star schemas — the redundancy is worth it because dimension JOINs collapse from 4+ to 1, and columnar Parquet compresses repeated strings efficiently."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-normalization" questions={[
            { question: "1NF requires that each column contains:", options: ['Only integers', 'Atomic (indivisible) values - no arrays or repeated groups', 'A primary key', 'Non-null values'], correct: 1 },
            { question: "In a data warehouse (OLAP), tables are typically:", options: ['In 3NF', 'In BCNF', 'Intentionally denormalized (star/snowflake schema)', 'Not normalized at all'], correct: 2 },
            { question: "A transitive dependency means:", options: ['A column depends on the primary key via another non-key column', 'Two columns share the same value', 'A foreign key references another table', 'A column can be NULL'], correct: 0 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use 3NF for OLTP systems to avoid update anomalies</li><li>Intentionally denormalize Gold-layer tables for analytics performance</li><li>Document denormalization decisions (why, which columns)</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Normalize OLAP tables to 3NF (defeats the purpose of dimensional modeling)</li><li>Store multi-valued data in a single column (violates 1NF)</li><li>Denormalize OLTP tables without measuring the trade-off</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-normalization') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-normalization')) { await unmarkTopicComplete('sql-normalization'); onUnmark('sql-normalization') } else { await markTopicComplete('sql-normalization'); onComplete('sql-normalization') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-normalization') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── INDEXES ── */}
        <section id="sql-indexes" ref={ref('sql-indexes')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Indexes and Query Planning</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"What is a covering index and how does it differ from a regular index?"</li>
                <li>"For a composite index on (a, b, c), which queries can and cannot use it?"</li>
                <li>"Why does WHERE YEAR(created_at) = 2024 prevent index usage?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate understand the leading-column rule for composite indexes, and can they explain why function-wrapped columns are non-sargable? The real test: can they describe a covering index (index-only scan) and explain how it eliminates table heap access entirely?</p>
            </div>
          </div>
          <p>Indexes are B-tree (or hash) data structures that allow the database to locate rows without scanning the entire table. A covering index includes all columns needed by a query, enabling an index-only scan without touching the table heap. In production, the leading-column rule is critical: a composite index on (status, order_date) supports WHERE status = 'X' but not WHERE order_date = 'Y' alone. The reason is that B-tree traversal starts at the leftmost key — skipping the leading column makes the sorted structure useless as a lookup structure.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"B-tree index supports equality and range. Composite index: only queries that include the leading column(s) can use it."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Covering index: includes all SELECT + WHERE columns so the engine reads only the index, never the table (index-only scan)."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Non-sargable predicates: YEAR(col) = N, LOWER(col) = 'x', col + 1 = 5, LIKE '%pattern'. Replace with range predicates to keep indexes."</td></tr>
            </tbody>
          </table>
          <IndexesDiagram />
          <IndexAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Spotify, a covering index on (user_id, track_id, listened_at) reduced the listening history query from 800ms to 12ms by eliminating table heap access — the index itself contained all needed columns. At Netflix, a composite index on (content_id, region, start_date) for the licensing table uses the leading-column rule: queries always filter by content_id first, then optionally narrow by region. Stripe discovered that WHERE status = 'failed' on the payments table had only 0.1% selectivity, causing the optimizer to prefer a full scan — they switched to a partial index on (created_at) WHERE status = 'failed' which is 100x smaller.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- B-tree index (default): equality and range queries
CREATE INDEX idx_orders_date ON orders (order_date);
CREATE INDEX idx_orders_customer ON orders (customer_id);

-- Composite index: column order matters for query matching
CREATE INDEX idx_orders_status_date ON orders (status, order_date);
-- Supports: WHERE status = 'completed' AND order_date > '2024-01-01'
-- Supports: WHERE status = 'completed'   (leading column)
-- Does NOT help: WHERE order_date > '2024-01-01' (skips leading column)

-- Covering index: includes all query columns (no table lookup)
CREATE INDEX idx_orders_covering ON orders (customer_id, order_date) INCLUDE (amount, status);
-- A query SELECT order_date, amount, status WHERE customer_id = 1 is satisfied entirely from index

-- Partial index: only indexes relevant rows (smaller, faster)
CREATE INDEX idx_pending_orders ON orders (order_date) WHERE status = 'pending';

-- Unique index: enforces uniqueness AND serves as index
CREATE UNIQUE INDEX idx_customers_email ON customers (email);

-- Hash index: equality only (fast for =, useless for <, >, BETWEEN)
CREATE INDEX idx_order_hash ON orders USING HASH (order_id);

-- Check which index a query uses
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE customer_id = 42;
-- Look for: Index Scan / Bitmap Index Scan vs Seq Scan

-- When indexes are NOT used:
-- 1. Function on indexed column: WHERE YEAR(order_date) = 2024 (use range instead)
-- 2. Implicit type cast: WHERE customer_id = '42' (int vs varchar)
-- 3. LIKE with leading wildcard: WHERE name LIKE '%smith'
-- 4. NOT IN / NOT LIKE / != (often forces full scan)
-- 5. Very low selectivity: WHERE status IN ('active','inactive') on 2-value column
-- 6. Small tables (optimizer chooses seq scan anyway)`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd add an index on the column I'm filtering."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd design a covering index that includes all SELECT and WHERE columns to enable index-only scans — eliminating table heap access. I'd also verify selectivity to confirm the optimizer will choose it over a full scan."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-indexes" questions={[
            { question: "A covering index means:", options: ['The index covers the entire table', 'The index contains all columns needed by the query, eliminating the table lookup', 'An index with a WHERE clause', 'An index that spans multiple tables'], correct: 1 },
            { question: "For a composite index on (a, b, c), which query CANNOT use this index?", options: ['WHERE a = 1 AND b = 2', 'WHERE a = 1', 'WHERE b = 2', 'WHERE a = 1 AND b = 2 AND c = 3'], correct: 2 },
            { question: "Why does WHERE YEAR(created_at) = 2024 prevent index usage?", options: ['YEAR() is not a standard function', 'The function wraps the indexed column, making it non-sargable', 'The index does not support date columns', 'YEAR() always triggers a full table scan by design'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Design covering indexes for hot analytical queries</li><li>Use partial indexes for high-selectivity subsets (status='failed')</li><li>Put the most selective column first in composite indexes</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Wrap indexed columns in functions in WHERE clauses</li><li>Index every column (write overhead and storage cost)</li><li>Skip the leading column in a composite index predicate</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-indexes') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-indexes')) { await unmarkTopicComplete('sql-indexes'); onUnmark('sql-indexes') } else { await markTopicComplete('sql-indexes'); onComplete('sql-indexes') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-indexes') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>


        {/* ── EXECUTION PLANS ── */}
        <section id="sql-execution" ref={ref('sql-execution')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Query Execution Plans (EXPLAIN)</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How do you find out why a query is slow?"</li>
                <li>"What does a Seq Scan vs an Index Scan mean in an EXPLAIN output?"</li>
                <li>"What does the cost estimate in EXPLAIN represent, and can you trust it?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate know how to read an EXPLAIN output and identify the expensive nodes? The senior signal: distinguishing estimated cost from actual runtime rows (EXPLAIN ANALYZE), understanding that a Seq Scan is not always wrong (small tables, high-percentage-return queries), and knowing how to force or prevent index use when the optimizer makes the wrong choice.</p>
            </div>
          </div>
          <p>EXPLAIN shows the query execution plan the optimizer chose — the sequence of operations (scans, joins, sorts) and their estimated cost. EXPLAIN ANALYZE actually runs the query and shows real row counts alongside estimates, revealing whether the optimizer's statistics are stale. In production, a Hash Join with a large estimated row count that actually returns millions of rows often means statistics are out of date. The reason to run ANALYZE (statistics update) before EXPLAIN on new data is that the optimizer's cost model depends on column statistics — histogram, null fraction, distinct values — which go stale after large inserts.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"EXPLAIN shows estimated plan. EXPLAIN ANALYZE shows actual runtime. Look at the nodes with the highest actual time — that's where to optimize."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Seq Scan: reads every row. Fine for small tables or high-percentage returns. Bad for selective filters on large tables — suggests missing index."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Large row-count estimate vs actual mismatch = stale statistics. Fix: ANALYZE the table to update histogram data."</td></tr>
            </tbody>
          </table>
          <ExecutionPlanDiagram />
          <ExplainAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Databricks, SQL analysts run EXPLAIN COST on Delta Lake queries to see physical plan nodes (FileScan, HashAggregate, BroadcastHashJoin) and identify which stage has the highest total task time. At Google, BigQuery's query execution details panel shows slot-milliseconds per stage — the equivalent of EXPLAIN ANALYZE — and teams use it to find that the GROUP BY stage is the bottleneck because shuffle (data movement) is the most expensive operation at scale. Snowflake's Query Profile provides a DAG of operations with time-per-node percentages — Snowflake engineers look for nodes with {'>'}30% of total time as optimization targets.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- EXPLAIN: show the optimizer's plan (estimated)
EXPLAIN SELECT * FROM orders WHERE customer_id = 42;
-- Output:
-- Index Scan using idx_orders_customer on orders  (cost=0.43..8.45 rows=1 width=64)
--   Index Cond: (customer_id = 42)

-- EXPLAIN ANALYZE: run the query and show actual vs estimated
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.order_id, c.name, o.amount
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_date >= '2024-01-01'
ORDER BY o.amount DESC;

-- Key nodes to understand:
-- Seq Scan       = full table scan (bad for large selective queries)
-- Index Scan     = B-tree lookup (good for selective queries)
-- Bitmap Scan    = multi-row index lookups combined (medium selectivity)
-- Hash Join      = build hash table from smaller table, probe with larger (most common)
-- Nested Loop    = for each row in outer, scan inner (good for small outer)
-- Merge Join     = sort both sides, scan in order (good for pre-sorted data)
-- Sort           = expensive if on disk (sort_mem exceeded)
-- Hash Aggregate = GROUP BY using hash table in memory

-- Actual vs Estimated rows: spot stale statistics
-- "rows=10000" (estimated) vs "rows=1" (actual) = statistics outdated
ANALYZE orders;  -- update statistics manually

-- Force / prevent index use (PostgreSQL)
SET enable_seqscan = OFF;  -- force index usage for testing
SET enable_hashjoin = OFF;  -- force merge join

-- Databricks / Spark SQL
EXPLAIN COST SELECT * FROM gold.orders WHERE customer_id = 42;
-- Shows: physical plan, estimated row count, data size, partition count

-- Snowflake: view query profile in UI or
SELECT query_id, total_elapsed_time, bytes_scanned FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY()) LIMIT 10;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd run EXPLAIN to see if it's using an index."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd run EXPLAIN ANALYZE to get actual row counts alongside estimates. If estimated rows are far off actual, I'd run ANALYZE to refresh statistics. Then I'd look at the highest-time node — that's the bottleneck to optimize."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-execution" questions={[
            { question: "What does EXPLAIN ANALYZE do differently from plain EXPLAIN?", options: ['It only shows the plan without executing the query', 'It actually executes the query and shows actual row counts and timing', 'It updates query statistics', 'It forces the optimizer to choose the best plan'], correct: 1 },
            { question: "A large mismatch between estimated and actual row counts in EXPLAIN ANALYZE suggests:", options: ['The query has a bug', 'Statistics are stale — run ANALYZE to update them', 'The index is corrupted', 'The query is using too much memory'], correct: 1 },
            { question: "A Seq Scan in the execution plan means:", options: ['The query has no WHERE clause', 'The database read every row in the table', 'The index was not created correctly', 'The table is too small for an index'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use EXPLAIN ANALYZE (not just EXPLAIN) to see actual row counts</li><li>Run ANALYZE after large data loads to refresh statistics</li><li>Focus on the highest-time node in the plan, not the root cost estimate</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Assume a Seq Scan is always wrong (small tables, high-return queries prefer it)</li><li>Trust the cost estimate without comparing to actual row counts</li><li>Disable nodes (SET enable_seqscan=OFF) in production</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-execution') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-execution')) { await unmarkTopicComplete('sql-execution'); onUnmark('sql-execution') } else { await markTopicComplete('sql-execution'); onComplete('sql-execution') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-execution') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── SQL PATTERNS ── */}
        <section id="sql-patterns" ref={ref('sql-patterns')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Advanced SQL Patterns</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"How would you deduplicate rows keeping the most recent per user?"</li>
                <li>"Write a running total that resets at the start of each month."</li>
                <li>"How do you perform a gap-and-islands analysis on session data?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate have a toolkit of repeatable SQL patterns for common data engineering problems? The senior signal: knowing the ROW_NUMBER dedup pattern by heart, the "gaps and islands" trick using ROW_NUMBER subtraction, and the SUM(SUM()) pattern for a cumulative sum over time periods — these appear in almost every data engineering take-home.</p>
            </div>
          </div>
          <p>Advanced SQL patterns are repeatable templates for common data problems. Deduplication with ROW_NUMBER keeps the latest record per key without a subquery join. The "gaps and islands" pattern uses ROW_NUMBER subtraction to group consecutive rows of the same state into sessions. The running total with reset uses a window function partitioned by period. In production, these patterns replace hundreds of lines of Python with single SQL expressions. The reason they appear in interviews is that they test whether a candidate thinks in sets (SQL-native) vs loops (procedural).</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Dedup: ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC) — keep rows where rn=1."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Gaps and islands: row_number() - row_number() OVER (PARTITION BY state ORDER BY ts) gives a stable group ID for consecutive same-state rows."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Running total with reset: SUM(amount) OVER (PARTITION BY DATE_TRUNC('month',date) ORDER BY date)."</td></tr>
            </tbody>
          </table>
          <PatternsDiagram />
          <SQLPatternsAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Uber, the dedup pattern (ROW_NUMBER + filter rn=1) is used in every Bronze-to-Silver transformation in their Medallion pipeline to handle late-arriving duplicate event records. Airbnb uses the gaps-and-islands technique to compute host "availability streaks" — how many consecutive available days a listing has — which feeds into ranking models. At LinkedIn, the pattern of QUALIFY ROW_NUMBER() = 1 (Snowflake syntax) in SELECT queries eliminates the outer SELECT wrapper, making the dedup step 30% faster than a CTE-based approach for their member activity deduplication job.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Pattern 1: Deduplication — keep latest record per user
WITH deduped AS (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) AS rn
    FROM events
)
SELECT * FROM deduped WHERE rn = 1;

-- Snowflake shortcut: QUALIFY
SELECT * FROM events
QUALIFY ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) = 1;

-- Pattern 2: Running total that resets each month
SELECT
    sale_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY DATE_TRUNC('month', sale_date)
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total_this_month
FROM sales;

-- Pattern 3: Gaps and Islands — group consecutive same-state rows
WITH flagged AS (
    SELECT *,
        ROW_NUMBER() OVER (ORDER BY ts) -
        ROW_NUMBER() OVER (PARTITION BY status ORDER BY ts) AS island_id
    FROM session_events
)
SELECT status, MIN(ts) AS island_start, MAX(ts) AS island_end, COUNT(*) AS events
FROM flagged
GROUP BY status, island_id
ORDER BY island_start;

-- Pattern 4: N consecutive days streak
WITH daily AS (
    SELECT user_id, activity_date,
        activity_date - INTERVAL '1 day' * ROW_NUMBER() OVER (
            PARTITION BY user_id ORDER BY activity_date
        ) AS grp
    FROM user_activity
)
SELECT user_id, grp, COUNT(*) AS streak_length, MIN(activity_date), MAX(activity_date)
FROM daily GROUP BY 1, 2;

-- Pattern 5: Ratio-to-total
SELECT
    product_id,
    revenue,
    revenue / SUM(revenue) OVER () AS pct_of_total
FROM product_revenue;

-- Pattern 6: First / Last value per group
SELECT DISTINCT
    customer_id,
    FIRST_VALUE(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS first_order,
    LAST_VALUE(order_date)  OVER (PARTITION BY customer_id ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)  AS last_order
FROM orders;`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd use GROUP BY MAX(updated_at) and then join back to get the full row."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC) inside a CTE, then filter rn=1. Single pass through the data, no self-join needed."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-patterns" questions={[
            { question: "To deduplicate rows and keep the most recent per user, the cleanest pattern is:", options: ['GROUP BY user_id, MAX(updated_at)', 'Self-join on MAX(updated_at)', 'ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) and filter rn=1', 'DISTINCT ON (user_id) without ordering'], correct: 1 },
            { question: "The gaps-and-islands technique groups consecutive rows by:", options: ['Using LEAD/LAG to detect state changes and CASE to label groups', 'Subtracting two ROW_NUMBER() values to get a stable group ID', 'Using a recursive CTE to walk through rows', 'Sorting by state and using DENSE_RANK()'], correct: 1 },
            { question: "To compute a running total that resets at the start of each month:", options: ['Use a CASE WHEN DATE_TRUNC changes', 'Partition the window function by DATE_TRUNC("month", date)', 'Use a recursive CTE to accumulate monthly totals', 'Join to a calendar table'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Learn the dedup, gaps-and-islands, and running-total patterns by heart</li><li>Use QUALIFY in Snowflake/BigQuery to avoid outer CTE wrapper</li><li>Think in sets: one SQL expression over a loop</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use a GROUP BY + self-join for dedup (two scans vs one)</li><li>Write procedural row-by-row Python when SQL can do it in one pass</li><li>Forget ROWS BETWEEN clause on LAST_VALUE (it defaults to current row)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-patterns') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-patterns')) { await unmarkTopicComplete('sql-patterns'); onUnmark('sql-patterns') } else { await markTopicComplete('sql-patterns'); onComplete('sql-patterns') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-patterns') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── PERFORMANCE ── */}
        <section id="sql-performance" ref={ref('sql-performance')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Query Performance Tuning</h2></div>
          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              <ul style={{marginTop:8,marginBottom:0}}>
                <li>"Walk me through how you'd tune a slow query in production."</li>
                <li>"What are the most common causes of slow SQL queries?"</li>
                <li>"How does partitioning improve query performance in a data warehouse?"</li>
              </ul>
            </div>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Actually Want</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>Does the candidate have a structured diagnostic process, or do they just "add an index"? The senior signal: a systematic approach — profile first (EXPLAIN ANALYZE), identify the bottleneck type (I/O vs compute vs network), then apply the fix: index, partition pruning, CTE materialization, or query rewrite. Can they articulate why SELECT * kills column-pruning in a Parquet-based warehouse?</p>
            </div>
          </div>
          <p>Query performance tuning is a systematic process: measure, identify the bottleneck, apply the targeted fix, and verify improvement. The most common production bottlenecks are full table scans on selective queries (missing index), SELECT * on wide Parquet tables (reads all columns), cartesian joins from missing join conditions, and correlated subqueries that re-execute per row. In production, the reason SELECT * is especially harmful in columnar warehouses (BigQuery, Snowflake, Databricks) is that it bypasses column pruning — the engine reads all column files from storage even when the query only needs three of sixty columns, multiplying I/O cost by 20x.</p>
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>60-Second Framework</h3>
          <table>
            <thead><tr style={{background:'var(--surface-2)'}}><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',width:40}}>Step</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)'}}>What to Say</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>1</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"Measure: EXPLAIN ANALYZE to find the slowest node. Never tune before profiling."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>2</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"I/O bottleneck: add index, use covering index, partition pruning. Compute bottleneck: rewrite correlated subquery as a JOIN, move aggregation earlier."</td></tr>
              <tr><td style={{padding:'8px 12px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>3</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>"In columnar warehouses: SELECT only needed columns, filter on partition column, avoid functions on partition columns, broadcast small tables."</td></tr>
            </tbody>
          </table>
          <PerformanceSQLDiagram />
          <PerformanceAnimation />
          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              <p style={{margin:'6px 0 0',lineHeight:1.7}}>At Netflix, a dashboard query on the content viewing table went from 45s to 2.1s after three changes: replacing SELECT * with five specific columns (column pruning in Parquet), adding a WHERE partition_date filter (partition pruning eliminates 360/365 partitions), and replacing a correlated subquery with a JOIN. At Google BigQuery, the team's performance checklist requires partitioned tables on query-time filter columns and clustering on GROUP BY columns — reducing bytes scanned by 80%+ on typical analytics queries. Databricks performance engineers use the AQE (Adaptive Query Execution) explain output to confirm that small-to-large join broadcast thresholds are correctly detected, avoiding 10GB shuffle operations.</p>
            </div>
          </div>
          <CodeBlock language="sql" code={`-- Anti-pattern 1: SELECT * in columnar warehouse (reads all columns)
-- BAD:
SELECT * FROM gold.events WHERE event_date = '2024-06-01';
-- GOOD: name only needed columns
SELECT user_id, event_type, session_id FROM gold.events WHERE event_date = '2024-06-01';

-- Anti-pattern 2: No partition filter (full table scan across all partitions)
-- BAD: reads 3 years of data to find 1 day
SELECT user_id FROM events WHERE DATE(created_at) = '2024-06-01';
-- GOOD: filter on partition column directly
SELECT user_id FROM events WHERE event_date = '2024-06-01';

-- Anti-pattern 3: Function on indexed / partition column (disables pruning)
-- BAD:
SELECT * FROM orders WHERE YEAR(order_date) = 2024;
-- GOOD:
SELECT * FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31';

-- Anti-pattern 4: Correlated subquery (runs once per outer row)
-- BAD:
SELECT customer_id, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS cnt
FROM customers c;
-- GOOD: pre-aggregate with JOIN
SELECT c.customer_id, COALESCE(o.cnt, 0) AS cnt
FROM customers c
LEFT JOIN (SELECT customer_id, COUNT(*) cnt FROM orders GROUP BY 1) o
    ON c.id = o.customer_id;

-- Anti-pattern 5: Implicit cartesian join (missing join condition)
-- BAD:
SELECT * FROM orders, customers WHERE orders.amount > 100;  -- every order × every customer
-- GOOD:
SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id WHERE orders.amount > 100;

-- Optimization checklist:
-- 1. EXPLAIN ANALYZE → find highest-cost node
-- 2. Add index on high-selectivity filter columns
-- 3. Replace SELECT * with named columns
-- 4. Add partition column to WHERE clause
-- 5. Replace correlated subqueries with JOIN + aggregation
-- 6. Move filters as early as possible (push predicates into CTEs)
-- 7. Use LIMIT during development (avoid full scans for testing)
-- 8. Run ANALYZE after large data loads to refresh statistics`} />
          <h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'24px 0 10px'}}>Junior vs Senior Phrasing</h3>
          <table>
            <thead><tr><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#ef4444'}}>Junior Says</th><th style={{padding:'9px 12px',textAlign:'left',borderBottom:'2px solid var(--border)',color:'#22c55e'}}>Senior Says</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"I'd add an index to make it faster."</td><td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>"First I'd run EXPLAIN ANALYZE to find the bottleneck. If it's I/O from a missing index I add a covering index. If it's a correlated subquery I rewrite to a JOIN. In a columnar warehouse I check for SELECT * and missing partition filters first — those are the biggest wins."</td></tr>
            </tbody>
          </table>
          <Quiz topicId="sql-performance" questions={[
            { question: "Why is SELECT * especially harmful in columnar warehouses like BigQuery or Snowflake?", options: ['It causes syntax errors in some dialects', 'It bypasses column pruning, forcing the engine to read all column files from storage', 'It generates a cartesian join', 'It is slower only when the table has more than 1M rows'], correct: 1 },
            { question: "A correlated subquery runs:", options: ['Once for the whole query', 'Once per row in the outer query (very expensive)', 'Only when the outer query returns results', 'Faster than a JOIN on indexed columns'], correct: 1 },
            { question: "The first step in tuning a slow SQL query should be:", options: ['Add an index to the filter column', 'Rewrite the query using CTEs', 'Run EXPLAIN ANALYZE to find the bottleneck', 'Increase database memory allocation'], correct: 1 },
          ]} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,margin:'20px 0'}}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Profile first with EXPLAIN ANALYZE before making changes</li><li>Replace correlated subqueries with JOIN + pre-aggregation</li><li>Always filter on partition columns in columnar warehouses</li></ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don&#39;t</strong>
              <ul style={{marginTop:8,paddingLeft:18}}><li>Use SELECT * in production queries on wide Parquet tables</li><li>Wrap partition/indexed columns in functions in WHERE clauses</li><li>Tune without measuring (add indexes blindly)</li></ul>
            </div>
          </div>
          <button className={`complete-btn${completed.has('sql-performance') ? ' complete-btn-done' : ''}`} onClick={async () => { try { if (completed.has('sql-performance')) { await unmarkTopicComplete('sql-performance'); onUnmark('sql-performance') } else { await markTopicComplete('sql-performance'); onComplete('sql-performance') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}>{completed.has('sql-performance') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

      </main>
    </div>
  )
}
