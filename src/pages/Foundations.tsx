import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete, unmarkTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: (id?: string) => void; onUnmark: (id: string) => void; onSignInNeeded: () => void }

const SECTIONS = [
  { title: 'Level 1 - Computer Fundamentals', items: [
    { id: 'binary', label: 'Binary & Numbers' },
    { id: 'cpu', label: 'CPU Architecture' },
    { id: 'memory', label: 'Memory' },
    { id: 'storage', label: 'Storage' },
    { id: 'os', label: 'OS Basics' },
    { id: 'linux', label: 'Linux' },
    { id: 'networking', label: 'Networking' },
    { id: 'docker', label: 'Docker' },
  ]},
  { title: 'Level 2 - Data Fundamentals', items: [
    { id: 'data-types', label: 'Data Types and Schemas' },
    { id: 'file-formats', label: 'File Formats' },
    { id: 'compression', label: 'Compression' },
    { id: 'serialization', label: 'Serialization' },
    { id: 'databases', label: 'Databases' },
    { id: 'data-warehouse', label: 'Data Warehouses' },
    { id: 'medallion', label: 'Medallion Architecture' },
    { id: 'data-quality', label: 'Data Quality' },
    { id: 'data-governance', label: 'Data Governance' },
    { id: 'batch-vs-streaming', label: 'Batch vs Stream' },
  ]},
]

export default function Foundations({ completed, onComplete, onUnmark, onSignInNeeded }: Props) {
  const [activeId, setActiveId] = useState('binary')
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
    }, { rootMargin: '-30% 0px -60% 0px' })
    Object.values(sectionRefs.current).forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const totalTopics = SECTIONS.flatMap(s => s.items).length

  return (
    <div className="page-with-sidebar">
      <Sidebar sections={SECTIONS} activeId={activeId} completed={completed} totalTopics={totalTopics} onItemClick={scrollTo} />
      <main className="main-content">

        {/* ─────────────────────────────────────────────────────────── BINARY */}
        <section id="binary" ref={el => { if (el) sectionRefs.current['binary'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Binary and Number Systems</h1>
            <p className="topic-desc">
              Everything a computer stores or processes  -  integers, floats, text, images, instructions  -  is ultimately
              a sequence of 0s and 1s. Understanding why, and how different number systems relate, is the foundation
              every engineer needs before touching a data pipeline.
            </p>
          </div>

          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            A transistor is a tiny electronic switch. It is either conducting current (<strong>on = 1</strong>) or not
            (<strong>off = 0</strong>). Modern CPUs pack billions of transistors onto a chip the size of a fingernail.
            Because a transistor reliably represents exactly two states, and because noise, heat, and manufacturing
            variation make more-than-two states impractical at scale, <em>binary</em> became the universal language of
            computing. Every piece of data you will ever work with  -  a Parquet file, a Kafka message, a database
            index  -  is stored as patterns of these two states.
          </p>

          <BinaryDiagram />
          <BinaryAnimation />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, margin: '24px 0' }}>
            {[
              { base: 'Binary', radix: 2, digits: '0 - 1', example: '1010 = 10', note: 'Native to hardware. Each digit is one bit.' },
              { base: 'Octal', radix: 8, digits: '0 - 7', example: '12 = 10', note: 'Groups of 3 bits. Used in Unix file permissions (chmod 755).' },
              { base: 'Decimal', radix: 10, digits: '0 - 9', example: '10 = 10', note: 'Human-friendly. Every position is a power of 10.' },
              { base: 'Hexadecimal', radix: 16, digits: '0 - 9, A - F', example: '0xA = 10', note: 'Groups of 4 bits. Used in memory addresses, colour codes, hashes.' },
            ].map(ns => (
              <div key={ns.base} className="card card-info">
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{ns.base} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '.85rem' }}>base {ns.radix}</span></div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>Digits: {ns.digits}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '.9rem', background: 'rgba(99,102,241,.07)', borderRadius: 6, padding: '4px 8px', marginBottom: 8, color: '#4338ca' }}>{ns.example}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ns.note}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '28px 0 10px' }}>Signed Integers: Two's Complement</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 12 }}>
            How does a computer store <strong>negative numbers</strong> using only 0s and 1s? The answer is
            <em> two's complement</em>. In an 8-bit signed integer, the most significant bit is the <em>sign bit</em>:
            0 means positive, 1 means negative. The value <code>-1</code> is stored as <code>11111111</code> in 8 bits.
          </p>
          <p style={{ lineHeight: 1.8, marginBottom: 12 }}>
            <strong>How to compute two's complement of a number:</strong>
          </p>
          <ol style={{ lineHeight: 2, paddingLeft: 24, marginBottom: 16 }}>
            <li>Write the positive value in binary (e.g. <code>+1</code> → <code>00000001</code>).</li>
            <li>Invert all bits (flip every 0 to 1 and vice versa): <code>11111110</code>.</li>
            <li>Add 1 to the result: <code>11111110 + 1 = 11111111</code>. That is <code>-1</code>.</li>
          </ol>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            This scheme is elegant because the same addition hardware works for both positive and negative numbers
             -  no special cases needed. An 8-bit signed integer can represent −128 to +127; an unsigned 8-bit integer
            can represent 0 to 255.
          </p>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '28px 0 10px' }}>IEEE 754 Floating-Point</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 12 }}>
            Real numbers like 3.14 cannot be stored exactly in a fixed number of bits. IEEE 754 uses three fields
            packed into 32 bits (single precision) or 64 bits (double precision):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '12px 0 20px' }}>
            {[
              { name: 'Sign bit', bits: '1 bit', desc: '0 = positive, 1 = negative' },
              { name: 'Exponent', bits: '8 bits (32-bit)', desc: 'Biased by 127. Controls the magnitude (scale).' },
              { name: 'Mantissa', bits: '23 bits (32-bit)', desc: 'Fractional significand. Encodes the precision.' },
            ].map(f => (
              <div key={f.name} className="card">
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{f.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '.82rem', color: 'var(--accent)', marginBottom: 6 }}>{f.bits}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            The value is computed as: <code>(-1)^sign × 1.mantissa × 2^(exponent−127)</code>. This lets floats
            cover an enormous range (±3.4 × 10^38 for 32-bit), but at the cost of precision  -  most decimal fractions
            are rounded to the nearest representable value.
          </p>

          <CodeBlock lang="python">{`# ── Number system conversions ─────────────────────────────────────────────
n = 255
print(bin(n))    # '0b11111111'
print(oct(n))    # '0o377'
print(hex(n))    # '0xff'

# Parse from any base
print(int('ff', 16))   # 255
print(int('377', 8))   # 255
print(int('11111111', 2))  # 255

# ── Bitwise operations ────────────────────────────────────────────────────
a, b = 0b1100, 0b1010   # 12 and 10
print(bin(a & b))   # AND  → 0b1000  (8)
print(bin(a | b))   # OR   → 0b1110  (14)
print(bin(a ^ b))   # XOR  → 0b0110  (6)
print(bin(~a))      # NOT  → -0b1101 (-13, two's complement)
print(bin(a << 1))  # left shift  → 0b11000 (24, multiply by 2)
print(bin(a >> 1))  # right shift → 0b110   (6,  divide by 2)

# Bit flags are common in data engineering (permissions, bitmask columns)
READ    = 0b001  # 1
WRITE   = 0b010  # 2
EXECUTE = 0b100  # 4
perms = READ | WRITE   # 3
print(bool(perms & READ))    # True   -  has read
print(bool(perms & EXECUTE)) # False  -  no execute

# ── Two's complement manually ──────────────────────────────────────────────
def twos_complement(n, bits=8):
    if n >= 0:
        return format(n, f'0{bits}b')
    return format((1 << bits) + n, f'0{bits}b')

print(twos_complement(-1))   # 11111111
print(twos_complement(-128)) # 10000000
print(twos_complement(127))  # 01111111

# ── Floating-point precision pitfall ──────────────────────────────────────
print(0.1 + 0.2)          # 0.30000000000000004  ← NOT 0.3!
print(0.1 + 0.2 == 0.3)   # False
import math
print(math.isclose(0.1 + 0.2, 0.3))  # True  -  use this for comparisons

import struct
# See the raw IEEE 754 bytes of a float
print(struct.pack('>f', 3.14).hex())  # '4048f5c3'`}</CodeBlock>

          <div style={{ background: 'var(--warning-bg, #2d2000)', border: '1px solid var(--warning-border, #7a5500)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', margin: '20px 0', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <strong>Floating-point precision in data pipelines</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>
                Never use <code>float</code> or <code>DOUBLE</code> for monetary values. Use <code>DECIMAL</code> /
                <code>NUMERIC</code> in SQL or Python's <code>decimal.Decimal</code>. Accumulating rounding errors
                across billions of transactions will cause reconciliation nightmares. Also be careful when joining
                tables on float columns  -  <code>0.1 + 0.2 ≠ 0.3</code> means equality checks silently miss rows.
              </p>
            </div>
          </div>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"Explain how negative numbers are stored in memory"</li>
              <li>"Why does 0.1 + 0.2 not equal 0.3 in Python?"</li>
              <li>"What is the difference between FLOAT and DECIMAL — when would you use each?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>They want to know you understand that all data is ultimately bits, and that data type choices have real consequences: float vs decimal for money, integer overflow on large IDs, timezone bugs from naive timestamps. They are not testing your ability to convert binary by hand — they are checking that you think about correctness at the storage level.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Identify the constraint</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Binary uses two states because transistors are reliable switches — on or off"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Show the consequence</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"IEEE 754 floats can't represent most decimals exactly — 0.1 + 0.2 = 0.30000000000000004"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Apply to your work</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"So I always use DECIMAL(18,2) for money in Spark schemas and SQL DDL"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Stripe stores all monetary amounts as integers (cents) to avoid floating-point issues entirely. Netflix encodes video quality scores as bit flags inside a TINYINT column to save space in their recommendation engine feature store. At LinkedIn, a pipeline bug using FLOAT instead of DECIMAL caused a $0.02 per-transaction rounding error that compounded to a $1.2M reconciliation issue over one quarter.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I know binary is base-2 and computers use it"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"Binary maps directly to transistor states. For me the practical impact is: floats are approximate so I use DECIMAL for money, and I size integer columns by expected max value — BIGINT for event IDs, INT for most foreign keys"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use DECIMAL(18,2) for all monetary values</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use BIGINT for epoch millisecond timestamps</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use math.isclose() for float comparisons in Python</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use FLOAT or DOUBLE for financial amounts</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Assume 0.1 + 0.2 == 0.3 in any language</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Ignore integer overflow risk on large tables</div>
            </div>
          </div>

          <Quiz topicId="binary" questions={[
    {
      question: "A data engineer stores product prices as DOUBLE in a Delta table. After 10 million transactions, the finance team reports a $0.03 discrepancy per row. What is the root cause?",
      options: [
              "Delta Lake has a known float precision bug",
              "DOUBLE uses IEEE 754 which cannot represent most decimal fractions exactly — rounding errors accumulate across rows",
              "The ETL pipeline rounded incorrectly",
              "DOUBLE only supports 7 significant digits"
      ],
      correct: 1,
      explanation: "IEEE 754 double precision cannot represent values like 0.1 exactly in binary — use DECIMAL(18,2) for money"
    },
    {
      question: "What is the two's complement binary representation of -3 in 8 bits?",
      options: [
              "10000011",
              "11111100",
              "11111101",
              "10000100"
      ],
      correct: 2,
      explanation: "Invert 00000011 → 11111100, add 1 → 11111101"
    },
    {
      question: "Which Python expression correctly checks if two floating-point values are equal within a small tolerance?",
      options: [
              "a == b",
              "abs(a - b) == 0",
              "math.isclose(a, b)",
              "round(a, 10) == round(b, 10)"
      ],
      correct: 2,
      explanation: "math.isclose() uses relative and absolute tolerance, the standard way to compare floats"
    },
          ]} />

          <button
            onClick={async () => { try { if (completed.has('binary')) { await unmarkTopicComplete('binary'); onUnmark('binary') } else { await markTopicComplete('binary'); onComplete('binary') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}
            className={`complete-btn-inline${completed.has('binary') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}
          >{completed.has('binary') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ──────────────────────────────────────────────────────────────── CPU */}
        <section id="cpu" ref={el => { if (el) sectionRefs.current['cpu'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">CPU Architecture</h1>
            <p className="topic-desc">
              Understanding how a CPU executes instructions  -  and where it spends time waiting  -  helps you write
              data pipelines that are orders of magnitude faster without changing your algorithm.
            </p>
          </div>

          <CPUDiagram />
          <CpuAnimation />

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '28px 0 10px' }}>Core Components</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { name: 'ALU', full: 'Arithmetic Logic Unit', desc: 'Executes all arithmetic (add, multiply) and logical (AND, OR, compare) operations. This is where your SQL aggregations actually happen.' },
              { name: 'CU', full: 'Control Unit', desc: 'Fetches instructions from memory, decodes them, and orchestrates the ALU, registers, and memory bus. The conductor of the CPU orchestra.' },
              { name: 'Registers', full: 'On-chip storage', desc: 'Tiny, ultra-fast storage (32 or 64 bits each) directly on the CPU die. There are typically 16 - 32 general-purpose registers. Fastest storage that exists.' },
            ].map(c => (
              <div key={c.name} className="card card-info">
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: '.82rem', color: '#4338ca', marginBottom: 8, fontWeight: 600 }}>{c.full}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>Fetch - Decode - Execute Cycle</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            Every instruction your Python or SQL query becomes goes through this cycle billions of times per second:
          </p>
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, flexWrap: 'wrap' }}>
            {['1. Fetch  -  CU reads the next instruction from memory (via the program counter)', '2. Decode  -  CU interprets the opcode to determine what operation to perform', '3. Execute  -  ALU performs the operation; result is written to a register or memory'].map((step, i) => (
              <div key={i} style={{ flex: '1 1 200px', background: i % 2 === 0 ? 'var(--surface-2)' : 'var(--surface-3)', padding: '14px 18px', borderRadius: 8, margin: 4, fontSize: '.88rem', lineHeight: 1.6 }}>
                {step}
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>Clock Speed, Cores, and Hyper-Threading</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            <strong>Clock speed</strong> (GHz) counts how many cycles per second the CPU runs  -  more cycles means more
            instructions per second, all else being equal. <strong>Multiple cores</strong> allow true parallel
            execution; a 16-core CPU can genuinely run 16 instruction streams simultaneously.
            <strong> Hyper-threading</strong> (Intel) / SMT (AMD) lets each physical core present two <em>logical</em>
            cores to the OS by sharing execution units between two threads  -  useful when one thread is stalled on
            a memory access. <strong>SIMD</strong> (Single Instruction Multiple Data) instructions like AVX-512 apply
            one operation to 8 doubles at once  -  this is how columnar engines like DuckDB and Apache Arrow achieve
            their speed on aggregations.
          </p>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>Cache Hierarchy  -  Why Data Locality Matters</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 14 }}>
            The CPU is orders of magnitude faster than RAM. To bridge this gap, CPUs have layers of progressively
            larger but slower cache memory. A cache miss  -  when data is not in the cache and must be fetched from
            a lower level  -  can stall the CPU for tens or hundreds of nanoseconds. Columnar storage formats like
            Parquet are fast partly because they pack the same column's values together, maximising cache reuse
            during aggregations.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Level', 'Typical Size', 'Latency', 'Where'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['L1 Cache', '32 KB / core', '~1 ns', 'On each core'],
                  ['L2 Cache', '256 KB / core', '~4 ns', 'On each core'],
                  ['L3 Cache', '8 - 32 MB shared', '~10 ns', 'Shared across cores'],
                  ['RAM', '16 - 512 GB', '~60 ns', 'On the motherboard (DIMM slots)'],
                  ['NVMe SSD', '1 - 4 TB', '~50 µs', 'PCIe slot or M.2'],
                  ['HDD', '1 - 20 TB', '~5 ms', 'SATA or SAS bay'],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-1)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '9px 14px', borderBottom: '1px solid var(--border)', fontFamily: j === 0 ? 'monospace' : 'inherit', fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>Branch Prediction</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            Modern CPUs speculatively execute code <em>before</em> knowing the outcome of a branch (if/else). If the
            prediction is wrong, the CPU must flush the pipeline and re-execute  -  wasting ~15 cycles. This is why
            data engineers sometimes see better performance with branchless code (e.g., using
            <code> CASE WHEN</code> with arithmetic instead of nested <code>IF</code>). It also underlies the infamous
            Spectre and Meltdown CPU vulnerabilities.
          </p>

          <CodeBlock lang="python">{`# ── CPU-aware data engineering ─────────────────────────────────────────────
import os, multiprocessing

# Always size your thread/process pool to physical cores, not logical
cpu_count = multiprocessing.cpu_count()
print(f"Logical CPUs: {cpu_count}")

# In PySpark, set parallelism based on available cores
# spark.conf.set("spark.default.parallelism", str(cpu_count * 2))

# ── NumPy uses SIMD under the hood ─────────────────────────────────────────
import numpy as np

# This single line uses AVX vectorisation on modern CPUs:
arr = np.arange(10_000_000, dtype=np.float64)
result = arr.sum()   # ~10 ms  -  SIMD adds 4 doubles per clock cycle

# A pure Python loop doing the same:
# total = sum(arr)   # ~500 ms  -  no SIMD, no cache prefetch

# ── Measure cache effects ──────────────────────────────────────────────────
import time

# Row-major access (cache friendly  -  reads contiguous memory)
matrix = [[0] * 1000 for _ in range(1000)]
t = time.perf_counter()
for i in range(1000):
    for j in range(1000):
        matrix[i][j] += 1
print(f"Row-major: {time.perf_counter() - t:.3f}s")

# Column-major access (cache unfriendly  -  jumps 1000 elements each step)
t = time.perf_counter()
for j in range(1000):
    for i in range(1000):
        matrix[i][j] += 1
print(f"Col-major: {time.perf_counter() - t:.3f}s")
# Column-major will be noticeably slower due to cache misses`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"Why is columnar storage faster for analytics?"</li>
              <li>"Explain cache misses and how they affect your pipelines"</li>
              <li>"How do you decide the parallelism setting for a Spark job?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>They want evidence that you connect hardware behaviour to pipeline performance decisions. Can you explain why DuckDB is 10x faster than Pandas on aggregations? Why does Parquet outperform CSV for SELECT queries? The answer traces back to CPU cache locality and SIMD. You don't need assembly-level knowledge — you need the reasoning chain from hardware to architectural choice.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Name the bottleneck</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"CPUs stall waiting for data — L1 cache hit is 1ns, RAM is 60ns, 60x slower"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Connect to storage format</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Columnar formats like Parquet pack one column together — the whole column fits in cache during a scan"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Apply to tuning</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"So I set spark.default.parallelism to 2x physical cores, not logical, to avoid context-switch overhead"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>DuckDB achieves 10-100x faster aggregations than Pandas on the same hardware by using SIMD (AVX-512) to process 8 doubles per clock cycle. Netflix's recommendation engine moved from row-based feature storage to columnar Arrow format and reduced feature serving latency by 40%. At Databricks, Photon (the native vectorised engine) exploits CPU vector instructions — the same principle explains why it outperforms standard Spark on GROUP BY queries.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"More cores is always better for Spark"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"Parallelism depends on the workload. CPU-bound stages benefit from physical cores; I/O-bound stages can over-provision. I set spark.default.parallelism to 2x physical cores and tune from there — and I use columnar formats to keep data cache-hot during scans"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Set Spark parallelism based on physical core count</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use columnar formats (Parquet/Delta) for analytical queries</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use NumPy/Arrow arrays instead of Python lists for bulk data</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Set thread pools larger than logical CPU count for CPU-bound work</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use Python UDFs when native Spark SQL functions exist</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Ignore cache effects when choosing data structures</div>
            </div>
          </div>

          <Quiz topicId="cpu" questions={[
    {
      question: "A Spark job running GROUP BY on a CSV file is 8x slower than the same query on a Parquet file with the same data. The most likely hardware-level reason is:",
      options: [
              "Parquet files are always smaller",
              "Parquet's columnar layout keeps the scanned column contiguous in memory — maximising CPU cache hits and enabling SIMD processing; CSV reads all columns into cache even when only one is needed",
              "Parquet uses faster compression",
              "CSV requires more network bandwidth"
      ],
      correct: 1,
      explanation: "Cache locality: columnar formats let the CPU prefetch and process a single column without cache pollution from other columns"
    },
    {
      question: "You have a 16-core (32 logical with hyperthreading) machine. A CPU-bound Python data processing script uses multiprocessing.Pool. What pool size gives best throughput?",
      options: [
              "32 — match logical CPUs",
              "16 — match physical cores",
              "64 — maximize concurrency",
              "8 — leave headroom for OS"
      ],
      correct: 1,
      explanation: "CPU-bound work: hyperthreading helps I/O-bound work, not CPU-bound. Use physical core count to avoid contention"
    },
    {
      question: "Branch prediction misses cost ~15 CPU cycles each. Which coding pattern is most likely to trigger frequent branch mispredictions in a data pipeline?",
      options: [
              "Using columnar aggregations in Spark SQL",
              "Iterating over a randomly-ordered boolean array with if/else logic on each element",
              "Reading a Parquet file with predicate pushdown",
              "Sorting a DataFrame before writing"
      ],
      correct: 1,
      explanation: "Random boolean data gives the CPU no predictable pattern to learn — nearly 50% miss rate; sorted or low-cardinality data is much more predictable"
    },
          ]} />

          <button
            onClick={async () => { try { if (completed.has('cpu')) { await unmarkTopicComplete('cpu'); onUnmark('cpu') } else { await markTopicComplete('cpu'); onComplete('cpu') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}
            className={`complete-btn-inline${completed.has('cpu') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}
          >{completed.has('cpu') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─────────────────────────────────────────────────────────── MEMORY */}
        <section id="memory" ref={el => { if (el) sectionRefs.current['memory'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Memory Deep Dive</h1>
            <p className="topic-desc">
              RAM is the working space of every program. Understanding how memory is allocated, accessed, and
              reclaimed explains why Spark jobs OOM, why Python can be slow, and how to tune JVM heap settings.
            </p>
          </div>

          <MemoryDiagram />
          <MemoryHierarchyAnimation />

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '28px 0 10px' }}>DRAM vs SRAM</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { name: 'SRAM (Static RAM)', points: ['Uses 6 transistors per bit  -  no refresh needed', 'Extremely fast (~1 - 4 ns)', 'Very expensive  -  used for CPU caches (L1/L2/L3)', 'Holds state as long as power is supplied'] },
              { name: 'DRAM (Dynamic RAM)', points: ['Uses 1 transistor + 1 capacitor per bit', 'Must be electrically refreshed thousands of times/second', 'Much cheaper  -  used for main memory (16/32/64 GB)', '~60 ns latency; bandwidth ~50 GB/s (DDR5)'] },
            ].map(t => (
              <div key={t.name} className="card">
                <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.name}</div>
                <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 2 }}>
                  {t.points.map((p, i) => <li key={i} style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>Virtual Memory and Paging</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            The OS gives every process the illusion that it has the entire address space to itself (e.g., 0 to 2^64 − 1
            on a 64-bit system). This is <em>virtual memory</em>. Behind the scenes the OS maps virtual pages (usually
            4 KB each) to physical RAM frames via a <em>page table</em>. When a process accesses a virtual address that
            is not currently in physical RAM, a <strong>page fault</strong> occurs: the OS pauses the process, loads the
            required page from disk (swap space / page file), updates the page table, and resumes execution. This is
            enormously expensive (~5 ms) compared to a normal memory access (~60 ns)  -  roughly 80,000× slower. When
            a Spark executor or Pandas DataFrame exceeds available RAM and starts hitting swap, performance collapses.
          </p>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>Stack vs Heap</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { name: 'Stack', color: 'var(--accent)', points: ['LIFO structure managed automatically by the CPU', 'Stores local variables, function call frames', 'Allocation/deallocation is O(1)  -  just move the stack pointer', 'Fixed size (usually 1 - 8 MB per thread); stack overflow = crash', 'Lives for the duration of the function call'] },
              { name: 'Heap', color: 'var(--warning-color, #f59e0b)', points: ['Unstructured pool of free memory', 'Stores objects, arrays, all dynamically-sized data', 'Allocation (malloc/new) is slower; fragmentation is a concern', 'Can grow to use all available RAM', 'Must be explicitly freed or managed by a garbage collector'] },
            ].map(t => (
              <div key={t.name} className={t.name === 'Stack' ? 'card card-info' : 'card card-warning'}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.name}</div>
                <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 2 }}>
                  {t.points.map((p, i) => <li key={i} style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>Garbage Collection</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 12 }}>
            Most high-level languages (Python, Java/Scala, Go) automatically reclaim heap memory via a garbage
            collector (GC). Understanding the GC strategy is critical for data engineers tuning Spark (JVM) or
            optimising Python memory usage.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
            {[
              { name: 'Reference Counting', lang: 'Python (CPython)', desc: 'Each object tracks how many references point to it. When count → 0, memory is freed immediately. Cycles (A → B → A) require a separate cycle detector.' },
              { name: 'Mark-and-Sweep', lang: 'Go, older JVMs', desc: 'GC traverses all live objects from roots (mark phase), then sweeps unreachable objects. Can cause "stop-the-world" pauses.' },
              { name: 'Generational GC', lang: 'JVM (G1/ZGC), Python 3', desc: 'Most objects die young. GC divides heap into generations (young/old). Frequently collects the young generation cheaply; rarely collects old objects. Reduces pause times.' },
            ].map(g => (
              <div key={g.name} className="card card-success">
                <div style={{ fontWeight: 700, marginBottom: 3 }}>{g.name}</div>
                <div style={{ fontSize: '.78rem', fontFamily: 'monospace', color: '#166534', marginBottom: 8, fontWeight: 600 }}>{g.lang}</div>
                <div style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{g.desc}</div>
              </div>
            ))}
          </div>

          <CodeBlock lang="python">{`# ── Memory sizes of common objects ────────────────────────────────────────
import sys

print(sys.getsizeof(42))          # 28 bytes   -  Python int has overhead!
print(sys.getsizeof(3.14))        # 24 bytes
print(sys.getsizeof("hello"))     # 54 bytes   -  str includes length + hash
print(sys.getsizeof([1, 2, 3]))   # 88 bytes   -  list has per-element pointers

# Python objects are expensive. A list of 1M integers = ~8 MB (pointers)
# + 28 MB (the int objects themselves) = 36 MB for what could be 8 MB in C.

import numpy as np
arr = np.arange(1_000_000, dtype=np.int64)
print(arr.nbytes)  # 8,000,000 bytes = 8 MB  -  no Python object overhead

# ── Garbage collection controls ────────────────────────────────────────────
import gc

gc.disable()   # Disable automatic GC (useful in tight loops)
# ... do allocation-heavy work ...
gc.collect()   # Force a full collection
gc.enable()

# Check reference count (CPython only)
import ctypes
x = [1, 2, 3]
ref_id = id(x)
print(sys.getrefcount(x))  # Usually n+1 because getrefcount holds a ref

# ── Memory profiling with tracemalloc ──────────────────────────────────────
import tracemalloc

tracemalloc.start()
data = [i ** 2 for i in range(100_000)]
snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')
for stat in top_stats[:3]:
    print(stat)

# ── pandas memory reduction tips ──────────────────────────────────────────
import pandas as pd
df = pd.DataFrame({'id': range(100_000), 'status': ['active'] * 100_000})
print(df.memory_usage(deep=True).sum())  # ~5.6 MB

df['id'] = df['id'].astype('int32')          # int64 → int32: half the memory
df['status'] = df['status'].astype('category')  # repeated strings → category
print(df.memory_usage(deep=True).sum())  # ~0.5 MB  -  10x smaller!`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"A Spark job is hitting OOM — how do you diagnose and fix it?"</li>
              <li>"Why is a Python list of 1 million integers much larger than a NumPy array of the same values?"</li>
              <li>"Explain the difference between stack and heap memory"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>They want to see that you can debug memory problems systematically, not just throw more RAM at them. Can you explain JVM heap tuning for Spark executors? Do you understand why Pandas DataFrames are memory-hungry? Do you know the difference between off-heap and on-heap memory in Spark? These are daily engineering decisions, not academic questions.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Identify what is consuming memory</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Python objects have 28-byte overhead each — 1M ints = 28 MB, vs 8 MB in NumPy"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Explain the allocation model</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Heap is for dynamic objects managed by GC; stack is fixed-size per-thread for local variables"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Tune accordingly</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"For Spark OOM: increase executor memory, use Tungsten off-heap, or reduce partition size to avoid shuffle spill"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Uber's data platform team reduced Spark executor OOM incidents by 60% by switching from Python UDFs (which serialize data between JVM and Python heap) to Pandas UDFs with Apache Arrow (zero-copy memory transfer). Pinterest moved from Pandas to Polars for in-memory transformations and cut RAM usage by 3x because Polars uses a contiguous Arrow memory layout instead of Python object references. At Shopify, enabling Spark's off-heap memory (spark.memory.offHeap.enabled) reduced GC pause times from 8 seconds to under 200ms on their Gold aggregation jobs.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"Just add more memory to fix OOM errors"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I first diagnose what's consuming memory: Python object overhead, JVM heap fragmentation, shuffle spill, or broadcast variable size. Then I apply the right fix — Arrow-based UDFs, smaller partitions, off-heap memory, or schema optimization like downcast int64 to int32"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use NumPy arrays or Polars instead of Python lists for bulk numeric data</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Downcast integer columns (int64→int32) when range allows</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use category dtype for low-cardinality string columns in Pandas</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use Python UDFs in Spark when native functions exist</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Load entire datasets into Pandas on a driver node</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Ignore GC pause metrics in Spark executor logs</div>
            </div>
          </div>

          <Quiz topicId="memory" questions={[
    {
      question: "A Spark executor with 8GB of memory is writing a 500MB shuffle and then doing a 6GB aggregation. It hits OOM. What is the most targeted fix?",
      options: [
              "Increase driver memory",
              "Increase executor memory to 16GB or reduce partition count to shrink per-partition memory footprint, because shuffle + execution memory compete in the same unified memory pool",
              "Disable garbage collection",
              "Use a smaller cluster"
      ],
      correct: 1,
      explanation: "Spark unified memory pool splits between execution and storage — large shuffles and large aggregations competing causes OOM; increase executor memory or reduce partition size"
    },
    {
      question: "Why does converting a Pandas string column to category dtype reduce memory usage dramatically?",
      options: [
              "Category dtype applies gzip compression to strings",
              "Category dtype stores unique strings once in a dictionary and replaces each row value with a small integer index — like dictionary encoding in Parquet",
              "Category dtype removes duplicate rows",
              "Category dtype uses SRAM instead of heap"
      ],
      correct: 1,
      explanation: "Like dictionary encoding: 1M rows of 'active'/'inactive' go from ~50MB (full strings) to ~1MB (int8 codes + 2-string dict)"
    },
    {
      question: "Python's CPython uses reference counting for garbage collection. What is the main weakness of this approach?",
      options: [
              "It is too slow for any production use",
              "It cannot collect reference cycles (A → B → A) without a separate cycle detector, meaning circular references leak memory until the cycle GC runs",
              "It requires stop-the-world pauses longer than JVM GC",
              "It only works for integers, not objects"
      ],
      correct: 1,
      explanation: "Reference counting immediately frees objects when count hits 0, but circular references keep counts above 0 forever — Python has a separate cycle detector for this"
    },
          ]} />

          <button
            onClick={async () => { try { if (completed.has('memory')) { await unmarkTopicComplete('memory'); onUnmark('memory') } else { await markTopicComplete('memory'); onComplete('memory') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}
            className={`complete-btn-inline${completed.has('memory') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}
          >{completed.has('memory') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─────────────────────────────────────────────────────────── STORAGE */}
        <section id="storage" ref={el => { if (el) sectionRefs.current['storage'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Storage Systems</h1>
            <p className="topic-desc">
              From spinning hard drives to cloud object stores, storage technology shapes every architectural
              decision in data engineering  -  from file format choice to pipeline throughput.
            </p>
          </div>

          <StorageDiagram />
          <StorageAnimation />

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 10px' }}>HDD  -  Hard Disk Drives</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            HDDs store data on <strong>spinning magnetic platters</strong>. A read/write head on an actuator arm must
            physically move to the correct track (<em>seek time</em>, ~2 - 10 ms) and then wait for the disk to rotate
            the target sector underneath it (<em>rotational latency</em>, ~2 - 8 ms at 7200 RPM). This mechanical motion
            makes random I/O extremely expensive. Sequential I/O is much better because the head sweeps continuously
            along a track. HDDs are the cheapest $/GB storage and are still used for archival and cold data tiers.
          </p>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>SSD  -  Solid State Drives</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            SSDs use <strong>NAND flash memory</strong>  -  no moving parts. Data is stored as electrical charge in
            floating-gate transistors. Because there is no mechanical seek, random I/O latency drops to ~100 µs
            (SATA SSD). <strong>Wear leveling</strong> is the controller algorithm that distributes writes evenly
            across all cells to extend drive lifetime  -  flash cells wear out after ~3,000 - 100,000 program/erase cycles
            depending on the NAND type (TLC, MLC, SLC).
          </p>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>NVMe  -  Non-Volatile Memory Express</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            NVMe drives use the <strong>PCIe bus</strong> instead of the older SATA bus, which was originally designed
            for spinning drives and became the bottleneck for fast flash. PCIe provides multiple lanes of high-speed
            serial communication directly to the CPU, cutting latency to ~20 µs and pushing sequential bandwidth to
            7 GB/s on PCIe 4.0  -  over 12× faster than SATA SSD. Modern cloud machines (AWS i3/i4i) use NVMe
            instance storage for Spark shuffle and temp data.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Type', 'Random IOPS', 'Sequential Bandwidth', 'Latency', 'Best For'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['HDD 7200 RPM', '100 - 200 IOPS', '~150 MB/s', '5 - 10 ms', 'Archival, cold storage'],
                  ['SATA SSD', '~100K IOPS', '~550 MB/s', '~100 µs', 'OS drives, general purpose'],
                  ['NVMe PCIe 4.0', '~500K IOPS', '~7 GB/s', '~20 µs', 'Spark shuffle, databases, hot data'],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-1)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '9px 14px', borderBottom: '1px solid var(--border)', fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>RAID Levels</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 14 }}>
            RAID (Redundant Array of Independent Disks) combines multiple physical drives into a logical volume for
            performance and/or redundancy. Understanding RAID helps when designing on-prem storage for databases or
            Hadoop clusters, and the same concepts appear in distributed storage systems.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { level: 'RAID 0', name: 'Striping', note: 'No redundancy', desc: 'Data split across all drives. Maximum performance; if any drive fails, all data is lost.' },
              { level: 'RAID 1', name: 'Mirroring', note: '50% capacity', desc: 'Data written identically to two drives. Survives one drive failure. Simple and reliable.' },
              { level: 'RAID 5', name: 'Stripe + Parity', note: 'N−1 capacity', desc: 'Parity distributed across all drives. Survives one failure; needs ≥3 drives.' },
              { level: 'RAID 6', name: 'Dual Parity', note: 'N−2 capacity', desc: 'Like RAID 5 but two independent parity blocks. Survives two simultaneous drive failures.' },
              { level: 'RAID 10', name: 'Stripe of Mirrors', note: '50% capacity', desc: 'Combines RAID 1+0. High performance and redundancy. Needs ≥4 drives. Favoured for databases.' },
            ].map(r => (
              <div key={r.level} className="card card-dark">
                <div style={{ fontWeight: 700, fontFamily: 'monospace', marginBottom: 2, color: '#93c5fd' }}>{r.level}</div>
                <div style={{ fontSize: '.82rem', color: '#a5b4fc', marginBottom: 4 }}>{r.name}  -  {r.note}</div>
                <div style={{ fontSize: '.82rem', color: '#94a3b8', lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>File Systems</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { name: 'NTFS', os: 'Windows', desc: 'Journaled FS; supports ACLs, encryption, compression. Max file size 16 EB. Standard for Windows data pipelines.' },
              { name: 'ext4', os: 'Linux', desc: 'Most common Linux FS. Journaled, supports files up to 16 TB. Default on Ubuntu/RHEL data engineering VMs.' },
              { name: 'HDFS', os: 'Distributed', desc: 'Hadoop Distributed File System. Splits files into 128 MB blocks replicated 3× across a cluster. Designed for high-throughput sequential reads of very large files.' },
            ].map(fs => (
              <div key={fs.name} className="card card-info">
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{fs.name}</div>
                <div style={{ fontSize: '.78rem', fontFamily: 'monospace', color: '#4338ca', marginBottom: 8, fontWeight: 600 }}>{fs.os}</div>
                <div style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{fs.desc}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '24px 0 10px' }}>Sequential vs Random I/O</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            <strong>Sequential I/O</strong> reads/writes consecutive blocks  -  the OS and drive can predict the next
            block and prefetch it. On HDDs this is critical (the head doesn't need to seek). On SSDs and NVMe the gap
            is smaller but still significant because of read-ahead buffers and OS page cache.
            <strong> Random I/O</strong> accesses scattered sectors  -  each requires a new seek on HDD, and even on
            SSDs/NVMe the controller must service independent requests. This is why columnar formats (Parquet, ORC)
            dramatically outperform row formats (CSV) for analytical queries that only read a few columns out of
            hundreds  -  they enable sequential I/O on just the needed column chunks.
          </p>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>Key Metrics: IOPS, Throughput, Latency</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { metric: 'IOPS', full: 'I/O Operations Per Second', desc: 'Count of read/write operations per second. Critical for transactional databases (many small random reads/writes).' },
              { metric: 'Throughput', full: 'MB/s or GB/s', desc: 'Total data volume transferred per second. Critical for analytics and ETL pipelines moving large files.' },
              { metric: 'Latency', full: 'µs or ms per operation', desc: 'Time from request to completion. Critical for interactive queries and real-time pipelines where user/system waits.' },
            ].map(m => (
              <div key={m.metric} className="card card-warning">
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{m.metric}</div>
                <div style={{ fontSize: '.78rem', color: '#92400e', marginBottom: 8, fontWeight: 600 }}>{m.full}</div>
                <div style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            ))}
          </div>

          <CodeBlock lang="bash">{`# ── Check disk info on Linux ──────────────────────────────────────────────
lsblk -o NAME,SIZE,TYPE,ROTA,MOUNTPOINT
# ROTA=1 → spinning HDD; ROTA=0 → SSD/NVMe

# Check NVMe drives specifically
ls /dev/nvme*

# ── Benchmark sequential read throughput ──────────────────────────────────
# dd: read 4 GB of zeros sequentially, measure throughput
dd if=/dev/zero of=/tmp/testfile bs=1M count=4096 oflag=direct
# oflag=direct bypasses the OS page cache for a true disk measurement

# Read it back
dd if=/tmp/testfile of=/dev/null bs=1M iflag=direct

# ── fio: more accurate I/O benchmark ─────────────────────────────────────
# Random read IOPS (4K blocks  -  typical database workload)
fio --name=randread --ioengine=libaio --iodepth=32 \
    --rw=randread --bs=4k --size=1G --numjobs=4 --runtime=60 \
    --group_reporting

# Sequential write throughput (1M blocks  -  ETL workload)
fio --name=seqwrite --ioengine=libaio --iodepth=1 \
    --rw=write --bs=1M --size=4G --numjobs=1 --runtime=60 \
    --group_reporting

# ── Python: check if disk is SSD or HDD ───────────────────────────────────
# On Linux, read the rotational flag
with open('/sys/block/sda/queue/rotational') as f:
    is_hdd = f.read().strip() == '1'
print("HDD" if is_hdd else "SSD/NVMe")

# ── Disk usage ──────────────────────────────────────────────────────────
df -h          # human-readable disk free space
du -sh /data/* # size of each item in /data`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"Why does reading a Parquet file column skip most of the disk I/O?"</li>
              <li>"What is the difference between IOPS and throughput — when does each matter?"</li>
              <li>"How would you design storage for a 10PB cold archive vs a real-time serving layer?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>They want to see that you make storage decisions based on access patterns, not just size. Sequential vs random I/O, NVMe vs HDD for Spark shuffle, object storage for cold data vs SSD for hot serving — these are architectural trade-offs that cost real money. They also check whether you understand why columnar formats and partition pruning exist at all: they're storage access pattern optimisations.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Characterise the access pattern</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Is it sequential scans (analytics) or random point lookups (OLTP)?"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Match storage to pattern</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Sequential analytics → columnar format on object storage; random lookups → NVMe SSD or in-memory cache"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Quantify the tradeoff</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"HDD: $20/TB but 5ms latency; NVMe: $200/TB but 20µs — 250x faster for shuffle-heavy Spark jobs"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Databricks recommends NVMe instance storage (AWS i3/i4i, Azure L-series) for Spark shuffle because shuffle IOPS on NVMe is 5-10x higher than EBS gp3. Netflix stores 60+ days of viewing history in S3 (object storage, sequential reads) and uses ElastiCache (memory) for the last 24h of activity for real-time recommendations. Cloudflare uses NVMe RAID arrays for their analytics pipeline ingest layer, pushing 40 GB/s sustained sequential write throughput per node.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"We store data in S3 because it's cheap"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"S3 is optimised for high-throughput sequential reads of large objects — perfect for Parquet files in a data lake. For Spark shuffle I'd use NVMe instance storage to get 500K IOPS instead of 16K on gp2 EBS. The access pattern determines the storage tier — not just cost"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Match storage tier to access pattern (hot/warm/cold)</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use NVMe instance storage for Spark shuffle on cloud VMs</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Partition Parquet files to enable sequential column scans</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Store hot serving data in cold object storage</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use HDD-backed storage for shuffle-intensive Spark jobs</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Ignore the difference between IOPS and throughput when sizing storage</div>
            </div>
          </div>

          <Quiz topicId="storage" questions={[
    {
      question: "A Databricks job spends 70% of its time on shuffle. You are choosing between gp2 EBS (16K IOPS) and NVMe instance storage (500K IOPS) at similar cost. Which should you choose and why?",
      options: [
              "gp2 EBS — it is more reliable",
              "NVMe instance storage — shuffle is random small I/O where IOPS is the bottleneck, not sequential throughput, so 31x more IOPS directly reduces shuffle time",
              "It does not matter — Spark caches shuffle data in RAM",
              "gp2 EBS — NVMe is too expensive"
      ],
      correct: 1,
      explanation: "Spark shuffle is small random reads/writes — IOPS-bound. NVMe's 500K IOPS vs EBS gp2's 16K is a 31x difference that directly maps to shuffle performance"
    },
    {
      question: "You have a 500GB Parquet table with 200 columns. A query reads only 3 columns. How much data does Spark physically read from storage compared to a row-oriented CSV of the same data?",
      options: [
              "The same — Spark reads entire files regardless of column selection",
              "Approximately 3/200 = 1.5% of the data — only the 3 column chunks are read from each row group; the other 197 columns are skipped entirely",
              "About 50% less — Parquet is compressed",
              "It depends on the partition scheme"
      ],
      correct: 1,
      explanation: "Columnar storage enables column pruning: each column's data is stored separately, so a 3-column query on a 200-column table reads ~1.5% of the physical bytes"
    },
    {
      question: "What is the key advantage of RAID 10 over RAID 5 for a database server?",
      options: [
              "RAID 10 uses less storage capacity",
              "RAID 10 combines striping and mirroring — it can survive multiple simultaneous drive failures (one per mirrored pair) and has no write penalty, unlike RAID 5's parity calculation overhead",
              "RAID 10 has better compression",
              "RAID 10 requires fewer disks"
      ],
      correct: 1,
      explanation: "RAID 5 has a write penalty (must read-modify-write parity block). RAID 10 mirrors data directly — high write performance and better fault tolerance for databases"
    },
          ]} />

          <button
            onClick={async () => { try { if (completed.has('storage')) { await unmarkTopicComplete('storage'); onUnmark('storage') } else { await markTopicComplete('storage'); onComplete('storage') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }}
            className={`complete-btn-inline${completed.has('storage') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}
          >{completed.has('storage') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* OS */}
        <section id="os" ref={el => { if (el) sectionRefs.current['os'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Operating Systems</h1>
            <p className="topic-desc">The OS is the software layer between hardware and applications. Every Databricks cluster, Azure VM, and Docker container runs Linux. Understanding processes, scheduling, and IPC is essential for debugging distributed systems.</p>
          </div>

          <OSDiagram />
          <OSAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Kernel vs User Space</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
            The OS is split into two protection rings. The <strong>kernel space</strong> runs privileged code that can access hardware directly (CPU, memory, disks, network). The <strong>user space</strong> is where your applications run. To access hardware, user programs make <strong>system calls</strong> (syscalls)  -  like read(), write(), fork(), socket()  -  which cross the kernel boundary. Context switching between user and kernel mode has overhead (~1-5μs).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { name: 'Process', icon: '🔲', desc: 'Independent program with its own memory space (virtual address space). Spark executors are JVM processes. Creating a process (fork) is expensive  -  copies entire memory space.' },
              { name: 'Thread', icon: '🧵', desc: 'Lightweight execution unit within a process. Shares memory with other threads. Python GIL limits true parallelism  -  only one thread runs Python bytecode at a time.' },
              { name: 'Coroutine', icon: '⚡', desc: 'Cooperative multitasking within a single thread. Python asyncio uses coroutines for non-blocking I/O. Zero context-switch overhead. Great for API calls and network I/O.' },
            ].map(item => (
              <div key={item.name} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.name}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>Scheduling Algorithms</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {[
              { name: 'Round Robin', desc: 'Each process gets equal CPU time slice (quantum ~10ms). Fair but ignores priority. Used in basic systems.' },
              { name: 'Priority Scheduling', desc: 'Higher priority processes run first. Risk of starvation for low-priority tasks. Used in real-time systems.' },
              { name: 'CFS (Completely Fair Scheduler)', desc: 'Linux default. Uses a red-black tree ordered by "virtual runtime". Tracks how much CPU each task has used and gives CPU to the most-deprived task. Balances fairness and throughput.' },
            ].map(s => (
              <div key={s.name} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '.88rem', minWidth: 200 }}>{s.name}</div>
                <div style={{ fontSize: '.84rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>Inter-Process Communication (IPC)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { name: 'Pipes', desc: 'One-directional byte stream. `cmd1 | cmd2` in shell. Fast for parent-child processes.' },
              { name: 'Sockets', desc: 'Network or Unix domain. Spark driver ↔ executor communication. TCP/IP or local socket.' },
              { name: 'Shared Memory', desc: 'Fastest IPC  -  processes map the same physical memory. No data copying. Requires synchronization.' },
              { name: 'Message Queues', desc: 'OS-level FIFO queues. Kafka borrows this concept. Decouples sender from receiver.' },
            ].map(ipc => (
              <div key={ipc.name} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 6 }}>{ipc.name}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ipc.desc}</div>
              </div>
            ))}
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Context switching overhead:</strong> When the OS switches between processes/threads it must save the full CPU state (registers, stack pointer, program counter)  -  takes ~1-10μs. With 200 Spark tasks on 8 cores, the OS is constantly context-switching. Minimize threads and use async I/O where possible.</div>
          </div>

          <CodeBlock lang="python">{`import os, threading, asyncio, multiprocessing

# Processes  -  separate memory, true parallelism (bypasses Python GIL)
def worker(n):
    return sum(range(n))

with multiprocessing.Pool(4) as pool:
    results = pool.map(worker, [10_000_000] * 4)

# Threads  -  shared memory, GIL limits CPU parallelism but good for I/O
import threading
threads = [threading.Thread(target=worker, args=(1000,)) for _ in range(4)]
[t.start() for t in threads]
[t.join() for t in threads]

# Coroutines  -  single-threaded, cooperative, great for async I/O
async def fetch(url):
    # non-blocking: yields control while waiting for network
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.json()

async def main():
    urls = ["https://api.example.com/data"] * 100
    tasks = [fetch(u) for u in urls]
    results = await asyncio.gather(*tasks)  # 100 concurrent requests, 1 thread

asyncio.run(main())`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"Explain the difference between a process and a thread — when would you use each in a data pipeline?"</li>
              <li>"Why does Python have the GIL and how does it affect your ETL jobs?"</li>
              <li>"What happens at the OS level when a Spark executor runs out of memory?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>They want to see that you understand the concurrency model of the tools you use. Python's GIL means threads don't help CPU-bound work — you need multiprocessing or async for I/O. Spark executors are JVM processes, not threads. Understanding process isolation, system calls, and scheduling explains why certain Spark configurations cause resource contention. This is the knowledge that separates engineers who can tune distributed systems from those who just add more nodes.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Identify workload type</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"CPU-bound (computation) or I/O-bound (network, disk)?"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Match concurrency model</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"CPU-bound: multiprocessing (bypasses GIL); I/O-bound: asyncio or threads"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Apply to distributed context</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Spark executors are JVM processes — true parallelism. Python UDFs inside Spark spawn a separate Python process per core, causing serialisation overhead"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Airflow uses separate OS processes per task (not threads) to isolate failures — if one task crashes its process, the scheduler continues. LinkedIn's Gobblin ingestion framework uses thread pools for I/O-bound API calls but process pools for CPU-bound schema inference. At Databricks, the Photon engine bypasses the JVM and makes direct system calls to Linux io_uring for async disk I/O, achieving near-hardware-limit throughput on NVMe.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"Python is slow because of the GIL"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"The GIL prevents true CPU parallelism with threads, but it doesn't affect I/O-bound tasks where threads are fine. For CPU-bound work I use multiprocessing or move computation into Spark's JVM layer. For I/O-bound work like API ingestion, asyncio gives me 100 concurrent requests on a single thread with zero context-switch overhead"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use multiprocessing for CPU-bound Python tasks</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use asyncio for I/O-bound work (API calls, DB queries)</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use Spark's native functions instead of Python UDFs for compute-heavy transformations</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use Python threading for CPU-bound parallelism — the GIL blocks it</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Spawn more threads than available CPU cores for CPU-bound work</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Run Python UDFs in Spark when native SQL alternatives exist</div>
            </div>
          </div>

          <Quiz topicId="os" questions={[
    {
      question: "An Airflow DAG has 20 parallel tasks running Python scripts. Each script imports pandas and reads a 500MB CSV. The scheduler VM has 8 CPU cores. What is the most likely bottleneck?",
      options: [
              "Python GIL prevents any parallel execution",
              "Memory — 20 processes each loading 500MB CSV into RAM simultaneously may exhaust available memory, causing OOM kills or heavy swapping",
              "The OS scheduler can only run 8 tasks at once",
              "Airflow worker processes share the GIL"
      ],
      correct: 1,
      explanation: "20 processes × 500MB each = 10GB RAM minimum. The CPU cores can context-switch between processes fine, but RAM exhaustion causes swap and OOM kills"
    },
    {
      question: "Why does using asyncio for 100 simultaneous API calls in Python use less resources than using 100 threads?",
      options: [
              "asyncio bypasses the network stack",
              "asyncio multiplexes all 100 requests on a single OS thread using cooperative yielding — no thread stack allocation (8MB each), no OS context switching, no GIL contention",
              "asyncio compresses HTTP requests",
              "asyncio uses a separate process per request"
      ],
      correct: 1,
      explanation: "100 threads = 100 OS stacks + context switches. asyncio = 1 thread + event loop that yields at every await, enabling thousands of concurrent I/O operations"
    },
    {
      question: "The Linux CFS (Completely Fair Scheduler) uses 'virtual runtime' to decide which process gets CPU next. What does this mean practically for your data pipelines?",
      options: [
              "All processes get exactly equal CPU time regardless of priority",
              "The process that has received the least CPU time relative to its weight runs next — CPU-hungry jobs don't starve other processes, and short-lived tasks get low-latency scheduling",
              "CFS only applies to real-time tasks",
              "CFS is only relevant for single-core machines"
      ],
      correct: 1,
      explanation: "CFS tracks vruntime per task — the most 'deprived' task runs next, providing fairness while still allowing nice-value-based priority weights"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('os')) { await unmarkTopicComplete('os'); onUnmark('os') } else { await markTopicComplete('os'); onComplete('os') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('os') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('os') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* LINUX */}
        <section id="linux" ref={el => { if (el) sectionRefs.current['linux'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Linux for Data Engineers</h1>
            <p className="topic-desc">Linux powers every cloud VM, container, and Databricks cluster. Being fluent in the terminal is a force-multiplier  -  you can diagnose issues, automate workflows, and understand system behaviour that GUIs hide.</p>
          </div>

          <LinuxDiagram />
          <LinuxAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>File System Hierarchy</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 24 }}>
            {[
              { path: '/etc', desc: 'System configuration files. /etc/hosts, /etc/fstab, /etc/cron.d' },
              { path: '/var', desc: 'Variable data  -  logs (/var/log), databases, spool files, temp state' },
              { path: '/tmp', desc: 'Temporary files, cleared on reboot. Spark uses this for spills' },
              { path: '/opt', desc: 'Optional/third-party software. Databricks installs libraries here' },
              { path: '/proc', desc: 'Virtual FS  -  kernel state. /proc/meminfo, /proc/cpuinfo, /proc/{pid}' },
              { path: '/home', desc: 'User home directories. ~/.bashrc, ~/.ssh/authorized_keys' },
              { path: '/usr', desc: 'User programs: /usr/bin, /usr/lib, /usr/local' },
              { path: '/dev', desc: 'Device files  -  /dev/sda (disk), /dev/null, /dev/urandom' },
            ].map(d => (
              <div key={d.path} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--blue-600)', marginBottom: 4, fontSize: '.9rem' }}>{d.path}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>File Permissions</h3>
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>rwxrwxrwx</strong> = owner/group/others. r=4, w=2, x=1. Octal 755 = rwxr-xr-x.<br/>
              <code>chmod 755 script.sh</code>  -  owner can execute; group/others can read+execute<br/>
              <code>chmod 644 config.env</code>  -  owner read+write; others read-only<br/>
              <code>chown user:group file</code>  -  change owner and group
            </div>
          </div>

          <CodeBlock lang="bash">{`# ── FILE SYSTEM ──────────────────────────────────────────
ls -la /data                     # list with permissions, sizes, dates
find /data -name "*.parquet" -mtime -1   # parquet files modified in last 24h
find /tmp -size +100M -type f    # files larger than 100MB
du -sh /var/log/*                # disk usage per log file
df -h                            # disk free (human readable)

# ── PERMISSIONS ──────────────────────────────────────────
chmod 755 pipeline.sh            # rwxr-xr-x
chmod -R 644 /data/configs/      # recursive: rw-r--r--
chown databricks:databricks /mnt/data  # change owner

# ── PROCESS MANAGEMENT ───────────────────────────────────
ps aux | grep spark              # find Spark processes
top -b -n1 | head -20            # snapshot of top processes
htop                             # interactive process viewer
kill -9 <pid>                    # force kill
nice -n 10 python slow_job.py   # run at lower CPU priority
nohup python job.py &            # run in background, immune to hangup

# ── TEXT PROCESSING (the data engineer's toolkit) ────────
cat data.csv | head -5           # first 5 lines
wc -l data.csv                   # count lines (rows)
cut -d',' -f1,3 data.csv         # extract columns 1 and 3
sort -t',' -k2 data.csv          # sort by column 2
sort data.csv | uniq -c | sort -rn  # count unique values, sorted
grep -E "ERROR|WARN" app.log     # filter log lines
grep -c "ERROR" app.log          # count error lines
awk -F',' '{sum+=$3} END{print sum}' data.csv  # sum column 3
sed 's/old_value/new_value/g' data.csv  # find and replace
xargs -I{} echo "Processing {}"  # apply command to each input line
tee output.log                   # write to stdout AND file simultaneously

# ── NETWORKING ───────────────────────────────────────────
curl -sI https://api.example.com     # check HTTP headers
wget -q -O data.json https://api.example.com/data
ss -tlnp                             # show listening TCP ports
netstat -i                           # network interface stats

# ── SYSTEMD / CRON ───────────────────────────────────────
systemctl status spark               # check service status
systemctl start|stop|restart spark   # manage service
journalctl -u spark -n 100           # last 100 log lines for service
crontab -e                           # edit cron jobs
# 0 2 * * * /opt/pipelines/daily.sh  # run at 2am every day`}</CodeBlock>

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>Shell Scripting Best Practices</h3>
          <CodeBlock lang="bash" code={`#!/usr/bin/env bash
set -euo pipefail   # exit on error, unset variable = error, pipe fails propagate
IFS=\$'\\n\\t'       # safer word splitting

# Variables
DATA_DIR="/mnt/adls/raw"
DATE=\$(date +%Y-%m-%d)
LOGFILE="/var/log/pipeline_\${DATE}.log"

# Functions
log() { echo "[\$(date +%T)] \$*" | tee -a "\$LOGFILE"; }
die() { log "ERROR: \$*"; exit 1; }

# Check dependencies
command -v python3 &>/dev/null || die "python3 not found"

# Process files
log "Starting pipeline for \$DATE"
for file in "\${DATA_DIR}"/*.csv; do
    [[ -f "\$file" ]] || continue
    log "Processing: \$file"
    python3 process.py "\$file" || die "Failed on \$file"
done
log "Pipeline complete"`} />

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"Walk me through how you'd diagnose a slow pipeline on a Linux server"</li>
              <li>"What does 'set -euo pipefail' do and why is it important?"</li>
              <li>"How do you find which process is consuming the most memory on a Linux machine?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Linux proficiency is a force multiplier for data engineers. They want to see you can navigate a production server, diagnose issues from logs, profile resource usage with standard tools, and write reliable bash scripts. You will be asked to debug pipelines on cloud VMs, read Airflow task logs, configure cron jobs, and investigate disk usage on HDFS nodes. Terminal fluency separates engineers who wait for a UI from engineers who can diagnose anything.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Check resources first</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"top / htop for CPU; free -h for memory; df -h for disk; iotop for I/O"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Narrow to the process</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"ps aux | grep spark to find PIDs; lsof -p PID to see open files; strace -p PID for syscalls"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Fix and automate</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Script the fix with set -euo pipefail; add to cron or systemd; log with tee"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>At Netflix, on-call engineers use a standard Linux triage runbook: first check /proc/meminfo and free -h for swap usage, then iotop to identify I/O-bound processes, then journalctl -u servicename to read structured logs. Databricks cluster init scripts are bash scripts that run on every node — misconfigured scripts without set -e have caused silent half-initialised clusters. LinkedIn's Kafka brokers use ulimit -n 1000000 in their systemd unit files to raise the open file descriptor limit — a common production gotcha for high-throughput brokers.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I use the terminal sometimes but prefer the UI"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I'm comfortable with the full Linux toolkit for production diagnosis: awk/sed/grep for log analysis, iotop/top for resource profiling, ss/netstat for network debugging. I write bash scripts with set -euo pipefail as standard — it prevents half-executed pipelines from silently corrupting data"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Start bash scripts with set -euo pipefail</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use journalctl and /var/log for structured log analysis</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use iotop/top/free to profile resource usage before optimising</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Write bash scripts without error handling (no set -e)</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use root for running data pipelines — create a service account</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Hardcode passwords in scripts — use environment variables or secret managers</div>
            </div>
          </div>

          <Quiz topicId="linux" questions={[
    {
      question: "A nightly bash pipeline script runs 10 steps. Step 4 fails silently (non-zero exit code) but the script continues and corrupts downstream tables. What single line at the top of the script would have prevented this?",
      options: [
              "#!/bin/bash",
              "set -euo pipefail",
              "trap 'exit 1' ERR",
              "set -x"
      ],
      correct: 1,
      explanation: "set -e exits on any command failure; -u treats unset variables as errors; -o pipefail makes pipe failures propagate — together they prevent silent failures"
    },
    {
      question: "You need to find all Parquet files larger than 1GB modified in the last 7 days under /mnt/datalake. Which command does this?",
      options: [
              "ls -la /mnt/datalake/*.parquet",
              "find /mnt/datalake -name '*.parquet' -size +1G -mtime -7",
              "du -sh /mnt/datalake/*.parquet | grep G",
              "grep -r parquet /mnt/datalake"
      ],
      correct: 1,
      explanation: "find with -name for pattern, -size +1G for size filter, and -mtime -7 for modification time within 7 days"
    },
    {
      question: "A Spark job writes Parquet files to /data/output/ as user 'spark'. The downstream Airflow task (running as user 'airflow') cannot read them. What is the likely cause and fix?",
      options: [
              "Parquet files are encrypted by default",
              "File permissions: spark wrote files as mode 600 (owner-only read). Fix: chmod 644 on the files, or run both as the same user, or add airflow to the spark group with chmod 640",
              "Airflow cannot read Parquet files directly",
              "The files are still being written"
      ],
      correct: 1,
      explanation: "Linux file permissions: 600 = rw------- means only owner can read. chmod 644 (rw-r--r--) or group permissions with chown/chmod g+r fix this"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('linux')) { await unmarkTopicComplete('linux'); onUnmark('linux') } else { await markTopicComplete('linux'); onComplete('linux') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('linux') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('linux') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* NETWORKING */}
        <section id="networking" ref={el => { if (el) sectionRefs.current['networking'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Networking</h1>
            <p className="topic-desc">Data engineers work with networks constantly  -  ingesting from APIs, configuring VNets, setting up private endpoints, and troubleshooting latency. Understanding the full networking stack helps you diagnose issues and design secure architectures.</p>
          </div>

          <NetworkingDiagram />
          <NetworkAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 16 }}>OSI Model  -  All 7 Layers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
            {[
              { layer: '7 - Application', proto: 'HTTP, HTTPS, DNS, FTP, SMTP, Kafka', color: '#8b5cf6', use: 'Your data pipelines, APIs, Kafka consumers live here' },
              { layer: '6 - Presentation', proto: 'TLS/SSL, JSON, Parquet encoding', color: '#a78bfa', use: 'Encryption, serialization, compression happen here' },
              { layer: '5 - Session', proto: 'RPC, NetBIOS, PPTP', color: '#6366f1', use: 'Manages sessions between applications' },
              { layer: '4 - Transport', proto: 'TCP (reliable), UDP (fast)', color: '#3b82f6', use: 'TCP: guaranteed delivery, ordering, retransmit. UDP: fast, lossy.' },
              { layer: '3 - Network', proto: 'IP, ICMP, BGP, OSPF', color: '#22c55e', use: 'IP addressing, routing between networks, CIDR subnets' },
              { layer: '2 - Data Link', proto: 'Ethernet, MAC, ARP, VLANs', color: '#f59e0b', use: 'Frames between devices on same network segment' },
              { layer: '1 - Physical', proto: 'Copper, Fiber, WiFi, 5G', color: '#94a3b8', use: 'Actual bits on wire  -  bandwidth is physical layer capacity' },
            ].map(l => (
              <div key={l.layer} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'white', border: '1px solid var(--border)', borderLeft: `3px solid ${l.color}`, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '.85rem', minWidth: 180, color: l.color }}>{l.layer}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--text-secondary)', minWidth: 200 }}>{l.proto}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{l.use}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>TCP vs UDP</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>TCP  -  Transmission Control Protocol</div>
              <ul style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
                <li>Three-way handshake (SYN → SYN-ACK → ACK)</li>
                <li>Guaranteed delivery and ordering</li>
                <li>Congestion control and flow control</li>
                <li>Higher overhead  -  each packet acknowledged</li>
                <li>Use for: HTTP, Kafka, database connections</li>
              </ul>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 8 }}>UDP  -  User Datagram Protocol</div>
              <ul style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
                <li>No handshake  -  fire and forget</li>
                <li>No delivery guarantee or ordering</li>
                <li>Lower overhead, lower latency</li>
                <li>Application handles reliability if needed</li>
                <li>Use for: DNS, video streaming, IoT telemetry</li>
              </ul>
            </div>
          </div>

          <h3 style={{ marginBottom: 12 }}>IP Addressing and CIDR</h3>
          <CodeBlock lang="bash">{`# CIDR Notation: IP_address/prefix_length
10.0.0.0/8      # 16,777,216 addresses (class A, private)
172.16.0.0/12   # 1,048,576 addresses (class B, private)
192.168.0.0/16  # 65,536 addresses (class C, private)
10.0.1.0/24     # 256 addresses (typical VNet subnet)
10.0.1.0/28     # 16 addresses (small subnet)

# Azure VNet example
# VNet: 10.0.0.0/16 (65536 addresses)
#   Subnet-DataEngineering: 10.0.1.0/24  (256 addresses)
#   Subnet-Databricks-Public: 10.0.2.0/24
#   Subnet-Databricks-Private: 10.0.3.0/24
#   Subnet-AzureSQL: 10.0.4.0/28  (16 addresses, small = secure)

# DNS resolution flow:
# 1. Browser checks local cache
# 2. OS checks /etc/hosts
# 3. Recursive resolver (ISP or 8.8.8.8)
# 4. Root nameserver → TLD nameserver → Authoritative nameserver
# 5. Returns IP address, cached with TTL`}</CodeBlock>

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>HTTP/HTTPS, TLS, HTTP/2, HTTP/3</h3>
          <CodeBlock lang="python">{`# TLS Handshake (simplified):
# 1. Client Hello  -  supported TLS versions, cipher suites, random
# 2. Server Hello  -  chosen cipher, certificate, random
# 3. Key Exchange  -  client verifies cert, derives session keys
# 4. Finished  -  both sides send encrypted Finished message
# ~2 round trips before first byte of data. HTTP/2 reduces this.

# HTTP/2 improvements over HTTP/1.1:
# - Multiplexing: multiple requests on one TCP connection (no head-of-line blocking)
# - Header compression (HPACK)
# - Server push
# - Binary framing instead of text

# HTTP/3 (QUIC):
# - Built on UDP instead of TCP
# - Connection migration (WiFi → LTE without reconnect)
# - 0-RTT reconnection
# - Built-in TLS 1.3

import requests

# REST API patterns for data ingestion
session = requests.Session()
session.headers.update({"Authorization": "Bearer token", "Content-Type": "application/json"})

# Retry with backoff
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
retry = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
session.mount("https://", HTTPAdapter(max_retries=retry))

# Pagination
def paginate(url):
    all_data = []
    while url:
        r = session.get(url).json()
        all_data.extend(r["data"])
        url = r.get("next_page_url")  # None when done
    return all_data`}</CodeBlock>

          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body"><strong>Bandwidth vs Throughput vs Latency:</strong><br/>
              <strong>Bandwidth</strong>  -  maximum capacity of the link (e.g., 10 Gbps NIC).<br/>
              <strong>Throughput</strong>  -  actual data transferred per second (always ≤ bandwidth, reduced by overhead).<br/>
              <strong>Latency</strong>  -  time for one packet to travel from source to destination. High latency kills small I/O  -  even a fast network feels slow with many round trips.
            </div>
          </div>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"A microservice is failing to connect to your database — how do you diagnose it?"</li>
              <li>"Explain the difference between a VNet, subnet, and private endpoint in Azure"</li>
              <li>"Why does low latency matter more than high bandwidth for a database connection?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Data engineers configure VNets, private endpoints, and service endpoints daily in cloud environments. They want to see you can troubleshoot network connectivity issues — not just at the HTTP level, but down to DNS, TCP handshakes, and firewall rules. Understanding latency vs bandwidth also explains architectural decisions: why you colocate compute with storage in the same AZ, why you use connection pooling for databases, and why streaming requires low-latency networks while batch tolerates high-latency links.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Isolate the layer</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Is it DNS (name not resolving), TCP (connection refused/timeout), or HTTP (4xx/5xx)?"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Test each layer</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"nslookup → nc -zv host port → curl -v URL to walk the stack"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Fix architecturally</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Private endpoint = no public internet; NSG = firewall rules; CIDR planning = subnet isolation"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Azure Databricks uses VNet injection so cluster traffic stays on private subnets — without it, all cluster-to-ADLS traffic traverses the public internet. Stripe's data platform uses AWS PrivateLink for all internal service-to-service calls, eliminating cross-AZ traffic costs. LinkedIn configures TCP keepalive (SO_KEEPALIVE) on all Kafka producer connections to detect dead connections within 60 seconds instead of the default 2 hours — critical for maintaining throughput on long-lived producer connections.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I set up the connection string and it connected"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I design network connectivity with private endpoints by default — no public internet traffic between compute and storage. I use NSGs to allow only required ports and source IPs, CIDR subnets sized to the service (/28 for private endpoints, /24 for compute), and I test connectivity at each OSI layer before assuming the application layer is at fault"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use private endpoints for Azure SQL, ADLS, Event Hub in production</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Plan CIDR subnets before deployment — changes are disruptive later</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Test connectivity with nc / curl / nslookup before blaming application code</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Allow 0.0.0.0/0 inbound on any production NSG rule</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Assume DNS resolution is instant — add TTL-aware caching</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Mix dev and prod subnets in the same VNet without NSG isolation</div>
            </div>
          </div>

          <Quiz topicId="networking" questions={[
    {
      question: "A Spark job connecting to Azure SQL Database fails with 'Connection timed out' after 30 seconds. DNS resolves correctly. Which layer is the problem and what should you check?",
      options: [
              "Layer 7 (Application) — check connection string format",
              "Layer 4 (Transport) — TCP connection is being dropped. Check: NSG inbound rules on the SQL subnet, Azure SQL firewall rules, and whether a private endpoint is configured and the DNS CNAME points to it",
              "Layer 3 (Network) — IP routing issue in the VNet",
              "Layer 1 (Physical) — network cable unplugged"
      ],
      correct: 1,
      explanation: "DNS working but TCP timing out points to a firewall (NSG/SQL firewall) blocking the TCP SYN. Check NSG rules and SQL server firewall allow rules"
    },
    {
      question: "What is the difference between a VNet service endpoint and a private endpoint for Azure Storage?",
      options: [
              "They are identical",
              "Service endpoint routes traffic over the Azure backbone but the storage still has a public IP; private endpoint assigns a private IP in your VNet — traffic never leaves the private network and the public endpoint can be disabled",
              "Private endpoint is faster than service endpoint",
              "Service endpoints support more Azure services"
      ],
      correct: 1,
      explanation: "Service endpoint: traffic stays on Azure backbone but storage is still internet-addressable. Private endpoint: NIC with private IP in your subnet — true private connectivity with no public exposure"
    },
    {
      question: "A data pipeline makes 10,000 short database queries per second, each taking 1ms of compute but 5ms of network round-trip. Halving latency to 2.5ms would have what effect?",
      options: [
              "No effect — compute time dominates",
              "Throughput increases from 10K to ~17K QPS — latency dominates total time (5ms of 6ms total), so halving it reduces total query time by ~42%",
              "Throughput doubles exactly",
              "Network latency only matters for large data transfers"
      ],
      correct: 1,
      explanation: "When latency dominates query time, reducing latency directly increases throughput. 10K QPS at 6ms total → at 3.5ms total = 28.5K QPS theoretical max"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('networking')) { await unmarkTopicComplete('networking'); onUnmark('networking') } else { await markTopicComplete('networking'); onComplete('networking') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('networking') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('networking') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* DOCKER */}
        <section id="docker" ref={el => { if (el) sectionRefs.current['docker'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Docker and Containers</h1>
            <p className="topic-desc">Docker packages your code, dependencies, and runtime into a portable container. Every modern data pipeline runs in containers  -  Airflow workers, dbt runs, Spark executors on Kubernetes. Containers are lightweight VMs without the overhead.</p>
          </div>

          <DockerDiagram />
          <DockerAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Images vs Containers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>Image (Blueprint)</div>
              <p style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                Read-only template built from a Dockerfile. Consists of immutable layers stacked on a base image. Stored in a registry (Docker Hub, Azure Container Registry). Images are versioned with tags (myapp:1.2.3).
              </p>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 8 }}>Container (Running Instance)</div>
              <p style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                A running instance of an image with a writable layer on top. Ephemeral  -  data written inside is lost when the container stops (unless using a volume). Multiple containers can run from the same image simultaneously.
              </p>
            </div>
          </div>

          <h3 style={{ marginBottom: 12 }}>Dockerfile</h3>
          <CodeBlock lang="dockerfile">{`# Multi-stage build  -  keeps final image small
# Stage 1: Build dependencies
FROM python:3.11-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Final image (no build tools, no cache)
FROM python:3.11-slim
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Add non-root user (security best practice)
RUN useradd --create-home appuser
USER appuser

# Copy application code
COPY --chown=appuser:appuser src/ ./src/

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    LOG_LEVEL=INFO

# ENTRYPOINT = always runs (not overrideable easily)
# CMD = default args (can be overridden at docker run)
ENTRYPOINT ["python", "-m", "src.pipeline"]
CMD ["--date", "today"]

# docker build -t my-pipeline:1.0 .
# docker run -e DB_CONN="..." my-pipeline:1.0 --date 2024-01-15`}</CodeBlock>

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>Docker Compose</h3>
          <CodeBlock lang="yaml">{`# docker-compose.yml  -  local development environment
version: "3.9"
services:
  airflow-webserver:
    image: apache/airflow:2.8.0
    depends_on:
      - postgres
      - redis
    ports:
      - "8080:8080"
    environment:
      AIRFLOW__CORE__EXECUTOR: CeleryExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@postgres/airflow
    volumes:
      - ./dags:/opt/airflow/dags        # mount local dags folder
      - ./logs:/opt/airflow/logs
    networks:
      - airflow-net
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 4G

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: airflow
      POSTGRES_PASSWORD: airflow
      POSTGRES_DB: airflow
    volumes:
      - postgres-data:/var/lib/postgresql/data  # named volume = persists
    networks:
      - airflow-net

  redis:
    image: redis:7-alpine
    networks:
      - airflow-net

volumes:
  postgres-data:   # persists between container restarts

networks:
  airflow-net:
    driver: bridge`}</CodeBlock>

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>Container Networking and Volumes</h3>
          <CodeBlock lang="bash">{`# Container networking modes
docker run --network host myapp      # share host network (fastest, less isolated)
docker run --network bridge myapp    # default: isolated network, NAT to host
docker run --network none myapp      # completely isolated, no network

# Volumes  -  persistent data outside containers
docker volume create my-data
docker run -v my-data:/data myapp          # named volume (managed by Docker)
docker run -v /host/path:/container/path myapp  # bind mount (maps host dir)
docker run --tmpfs /tmp myapp              # in-memory tmpfs

# Environment variables (never hardcode secrets in images)
docker run -e DB_PASSWORD=secret myapp     # inline (avoid in prod)
docker run --env-file .env myapp           # from file (add .env to .gitignore!)

# Resource limits
docker run --memory 4g --cpus 2.0 myapp

# Inspect and debug
docker logs -f myapp          # follow container logs
docker exec -it myapp bash    # get a shell inside container
docker inspect myapp          # full container config as JSON
docker stats                  # live CPU/memory usage
docker system prune -af       # clean up stopped containers, images, volumes`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"What is the difference between a Docker image and a container?"</li>
              <li>"How do you ensure a container cannot access secrets stored in the image?"</li>
              <li>"Walk me through how you'd containerise a Python Spark job for Kubernetes"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>They want to confirm you can build production-grade container images: multi-stage builds for size, non-root users for security, proper layer ordering for cache efficiency, and externalized config via environment variables. They also check whether you understand orchestration context — Airflow runs DAGs in Docker containers, Databricks uses Docker init scripts, and Kubernetes is the standard for deploying Spark. Container knowledge is table stakes for modern data engineering.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Describe the isolation model</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Image is the immutable blueprint; container is a running instance with a writable layer on top"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Explain the security model</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Non-root user, no secrets in ENV or layers, read-only filesystem where possible"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Connect to your workflow</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Multi-stage build keeps image under 200MB; I pin base image versions for reproducibility; volumes for persistent data"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Airflow 2.x uses the KubernetesExecutor which spins up one Docker container per task — complete isolation with defined resource limits. Spark on Kubernetes (spark-submit --master k8s://) packages the driver and executor as Docker images, enabling reproducible environments across dev/staging/prod. LinkedIn's Gobblin runs each ingestion job as a Docker container on Kubernetes, using multi-stage builds to keep final images under 150MB — critical for fast cold starts when scaling from 0.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I write a Dockerfile and it builds"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I use multi-stage builds to keep production images small, pin base image versions for reproducibility, run as a non-root user, and never bake secrets into the image — they come from environment variables or a secret manager at runtime. I size memory and CPU limits based on profiling, not guessing"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use multi-stage builds to keep images small</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Pin base image versions (python:3.11.9-slim not python:latest)</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Run containers as non-root users</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Store secrets, passwords or API keys in ENV instructions or image layers</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use latest tag in production — it breaks reproducibility</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Run containers as root in production</div>
            </div>
          </div>

          <Quiz topicId="docker" questions={[
    {
      question: "A Dockerfile has RUN pip install -r requirements.txt before COPY src/ ./src/. A developer changes only a Python source file. What happens on the next docker build?",
      options: [
              "All layers rebuild from scratch",
              "Only the COPY src/ layer and subsequent layers rebuild — pip install layer is cached because requirements.txt did not change",
              "The image refuses to build",
              "pip install runs again because Docker cannot detect changes"
      ],
      correct: 1,
      explanation: "Docker layer cache: if inputs to a layer haven't changed, it uses the cached layer. Putting pip install before copying source code is a best practice that saves minutes on every rebuild"
    },
    {
      question: "You need to pass a database password to a container at runtime without storing it in the image. What is the correct approach?",
      options: [
              "Add ENV DB_PASSWORD=secret in the Dockerfile",
              "Pass via --env-file .env at docker run time, or mount from a secrets manager (Vault, AWS Secrets Manager, Azure Key Vault) as environment variable or file",
              "Hardcode it in the application config file inside the image",
              "Store it in a Docker volume"
      ],
      correct: 1,
      explanation: "Secrets in Dockerfile ENV or layers are visible via docker inspect and docker history. Runtime injection via --env-file or secret manager keeps them out of the image entirely"
    },
    {
      question: "A containerised Python pipeline writes processed data to /app/output/ inside the container. After the container exits and is removed, where is the data?",
      options: [
              "Saved to the Docker image automatically",
              "Gone — container's writable layer is deleted when the container is removed unless a volume or bind mount was used",
              "In the Docker registry",
              "In /var/lib/docker on the host"
      ],
      correct: 1,
      explanation: "Containers are ephemeral — the writable layer is destroyed with docker rm. Use volumes (-v myvolume:/app/output) or bind mounts (-v /host/path:/app/output) for persistent data"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('docker')) { await unmarkTopicComplete('docker'); onUnmark('docker') } else { await markTopicComplete('docker'); onComplete('docker') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('docker') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('docker') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* DATA TYPES */}
        <section id="data-types" ref={el => { if (el) sectionRefs.current['data-types'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Data Types and Schemas</h1>
            <p className="topic-desc">Choosing the right data type directly impacts storage size, query performance, and correctness. A poorly typed schema can silently corrupt billions of rows  -  decimal precision errors in financial data, timezone bugs in timestamps, integer overflow in large IDs.</p>
          </div>

          <DataTypesDiagram />
          <DataTypesAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Primitive Data Types</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.83rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Type', 'Bytes', 'Range / Notes', 'Spark Type', 'When to Use'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, fontSize: '.78rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['TINYINT', '1', '-128 to 127', 'ByteType', 'Flags, small status codes'],
                  ['SMALLINT', '2', '-32,768 to 32,767', 'ShortType', 'Age, year'],
                  ['INT', '4', '-2.1B to 2.1B', 'IntegerType', 'Most integer IDs'],
                  ['BIGINT', '8', '-9.2 quintillion', 'LongType', 'Event IDs, epoch ms timestamps'],
                  ['FLOAT', '4', '~7 decimal digits', 'FloatType', 'ML features (not money!)'],
                  ['DOUBLE', '8', '~15 decimal digits', 'DoubleType', 'Coordinates (not money!)'],
                  ['DECIMAL(p,s)', 'variable', 'Exact precision p, scale s', 'DecimalType(18,2)', 'Financial amounts  -  always'],
                  ['STRING', 'variable', 'UTF-8 unicode', 'StringType', 'Text, names, codes'],
                  ['BOOLEAN', '1 bit', 'true / false', 'BooleanType', 'Flags, is_active'],
                  ['DATE', '4', 'Year-month-day', 'DateType', 'Partition key, business date'],
                  ['TIMESTAMP', '8', 'Microseconds since epoch', 'TimestampType', 'Event times  -  store UTC'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '8px 12px', fontFamily: j < 2 ? 'monospace' : 'inherit', color: j === 0 ? 'var(--blue-700)' : 'var(--text-secondary)', fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: 12 }}>Complex Types</h3>
          <CodeBlock lang="python">{`from pyspark.sql.types import *

# Complex types for nested data
schema = StructType([
    StructField("order_id",   LongType(),      nullable=False),
    StructField("customer",   StructType([     # nested struct
        StructField("id",   IntegerType()),
        StructField("name", StringType()),
        StructField("tier", StringType()),
    ]),                                        nullable=False),
    StructField("items",      ArrayType(       # array of structs
        StructType([
            StructField("sku",      StringType()),
            StructField("quantity", IntegerType()),
            StructField("price",    DecimalType(10, 2)),
        ])
    ),                                         nullable=True),
    StructField("metadata",   MapType(StringType(), StringType()), nullable=True),
])

# Type widening vs narrowing
# Widening (safe): INT → BIGINT → DOUBLE  (no data loss)
# Narrowing (unsafe): DOUBLE → INT  (truncates decimals, possible overflow)
df = df.withColumn("amount", col("amount").cast(DecimalType(18, 2)))  # explicit cast`}</CodeBlock>

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>Timezone Handling for Timestamps</h3>
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body"><strong>Always store timestamps in UTC.</strong> Convert to local timezone only at display time. Spark's <code>TimestampType</code> is in UTC internally. Use <code>from_utc_timestamp()</code> to convert for reporting, never store local times in your lakehouse.</div>
          </div>
          <CodeBlock lang="python">{`from pyspark.sql.functions import *

# Epoch time → timestamp
df = df.withColumn("ts", to_timestamp(col("epoch_ms") / 1000))

# Parse string timestamps with format
df = df.withColumn("ts", to_timestamp("ts_str", "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"))

# Convert UTC → local for reporting only
df = df.withColumn("ts_london", from_utc_timestamp("ts", "Europe/London"))
df = df.withColumn("ts_ny",     from_utc_timestamp("ts", "America/New_York"))

# Date arithmetic
df = df.withColumn("date",        to_date("ts"))
df = df.withColumn("year",        year("ts"))
df = df.withColumn("month",       month("ts"))
df = df.withColumn("week",        weekofyear("ts"))
df = df.withColumn("7d_ago",      date_sub("date", 7))
df = df.withColumn("days_since",  datediff(current_date(), "date"))`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"Why did your pipeline produce incorrect financial totals?"</li>
              <li>"A join between two tables is silently dropping rows — what data type issue might cause this?"</li>
              <li>"How do you handle timezone-aware timestamps across multiple source systems?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Data type bugs are among the most expensive in production — they are silent and cumulative. They want to see you default to DECIMAL for money, BIGINT for large IDs, and UTC timestamps for all event times. They also look for schema evolution awareness: can you add a nullable column without breaking existing readers? Do you understand what happens when Spark infers schema from JSON and gets it wrong? Type discipline at ingestion prevents cascading correctness issues downstream.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Choose by semantic meaning</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Money → DECIMAL(18,2); event time → TIMESTAMP UTC; flags → BOOLEAN or TINYINT"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Consider storage efficiency</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Downcast where safe: country code → STRING(2) not VARCHAR(255); age → TINYINT not INT"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Plan for evolution</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"New columns must be nullable with defaults; never change a column's type in place — add new column, backfill, swap"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Stripe stores all money amounts as integers (smallest currency unit, e.g. cents) with a separate currency code column — completely eliminating floating-point issues. Airbnb's data platform team wrote a schema enforcement layer that rejects Parquet files where inferred types differ from the registered schema — catching float-for-decimal bugs before they reach Silver. At Booking.com, a naive timestamp without timezone caused a daylight-saving-time bug that double-counted 1 hour of bookings every March and October for two years.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I just use STRING for everything to avoid type errors"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"Using STRING for everything defers type errors to query time and destroys compression efficiency. I define explicit schemas at ingestion, use DECIMAL for money, BIGINT for large IDs, and enforce UTC for all timestamps. Schema-on-write catches type mismatches early when they're cheapest to fix"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Declare explicit schemas at ingestion — never rely on inference</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use DECIMAL(18,2) for all monetary amounts</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Store all timestamps in UTC; convert at display time only</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use DOUBLE or FLOAT for financial values</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Let Spark infer schema from JSON/CSV in production pipelines</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Store local-timezone timestamps in a lakehouse</div>
            </div>
          </div>

          <Quiz topicId="data-types" questions={[
    {
      question: "A Spark job joins fact_orders (order_id: BIGINT) with dim_customer (order_id: INT). The join silently produces fewer rows than expected. What is happening?",
      options: [
              "Spark cannot join different integer types",
              "BIGINT values above 2.1 billion overflow INT silently in some SQL engines — IDs that exceed INT range have no matching key in dim_customer, causing rows to be dropped without error",
              "INT and BIGINT use different encoding in Parquet",
              "The join requires explicit CAST to be valid"
      ],
      correct: 1,
      explanation: "INT max is 2,147,483,647. Order IDs above this value cannot be stored in INT — they either error or wrap, breaking the join. Always use BIGINT for IDs that may grow large"
    },
    {
      question: "You are ingesting JSON events from an API that sometimes omits the 'amount' field. What is the safest Spark schema definition for this field?",
      options: [
              "StructField('amount', DoubleType(), nullable=False)",
              "StructField('amount', DecimalType(18,2), nullable=True) — decimal for precision, nullable to handle missing field",
              "StructField('amount', StringType(), nullable=False)",
              "Let Spark infer the type from the JSON"
      ],
      correct: 1,
      explanation: "DECIMAL for money precision; nullable=True handles missing fields; never use DoubleType for money or infer schema in production"
    },
    {
      question: "A Gold table aggregates daily revenue. The source Silver table stores timestamps in 'America/New_York' timezone. At 2am on a DST change, some events are counted twice. What is the fix?",
      options: [
              "Use a different aggregation function",
              "Store all timestamps in UTC in Silver — convert to local timezone only in Gold reporting views. UTC has no DST transitions",
              "Add a deduplication step based on event_id",
              "Use DATE instead of TIMESTAMP"
      ],
      correct: 1,
      explanation: "Local timezones with DST create ambiguous hours (1am–2am occur twice during fall-back). UTC is monotonic with no ambiguity — always store UTC, convert at display time"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('data-types')) { await unmarkTopicComplete('data-types'); onUnmark('data-types') } else { await markTopicComplete('data-types'); onComplete('data-types') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('data-types') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('data-types') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* FILE FORMATS */}
        <section id="file-formats" ref={el => { if (el) sectionRefs.current['file-formats'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">File Formats Deep Dive</h1>
            <p className="topic-desc">File format choice is one of the highest-leverage decisions in data engineering. The wrong format can make a query 100x slower or double your storage costs. Understanding the internals of Parquet  -  the dominant analytical format  -  is essential.</p>
          </div>

          <FileFormatsDiagram />
          <FileFormatAnimation />
          <ParquetInternalsAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 16 }}>Format Comparison</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Format', 'Storage', 'Splittable', 'Schema Evo', 'Compression', 'Best For'].map(h => (
                    <th key={h} style={{ padding: '9px 11px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, fontSize: '.75rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['CSV', 'Row', 'Yes (by line)', 'None', 'Gzip/bz2', 'Source files, Excel exports, interchange'],
                  ['JSON', 'Row', 'Newline-delimited only', 'Flexible', 'Gzip', 'APIs, semi-structured, configs'],
                  ['Parquet', 'Columnar', 'Yes (row groups)', 'Add/remove cols', 'Snappy/Zstd/Gzip', 'Analytics, Delta Lake, Spark'],
                  ['Avro', 'Row', 'Yes (blocks)', 'Full (w/ registry)', 'Snappy/Deflate', 'Kafka streaming, schema registry'],
                  ['ORC', 'Columnar', 'Yes (stripes)', 'Add/remove cols', 'Zlib/Snappy/Zstd', 'Hive, legacy Hadoop'],
                  ['Delta Lake', 'Columnar + TXN log', 'Yes', 'Full ACID', 'Snappy/Zstd', 'Lakehouse ACID tables, CDC'],
                  ['Iceberg', 'Columnar + metadata', 'Yes', 'Full ACID', 'Snappy/Zstd', 'Multi-engine lakehouse'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '8px 11px', fontWeight: j === 0 ? 700 : 400, color: j === 0 ? 'var(--blue-700)' : 'var(--text-secondary)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: 12 }}>Parquet Internals</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
            Parquet is a columnar format with a hierarchical structure: <strong>File → Row Groups → Column Chunks → Pages</strong>. A row group is typically 128MB - 1GB. Within each row group, data for each column is stored together (column chunk), then split into pages (1MB default) for fine-grained compression and encoding.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { name: 'Dictionary Encoding', desc: 'Low-cardinality columns (country, status): store unique values once, use integer index. 10x smaller for repeated strings.' },
              { name: 'Run-Length Encoding (RLE)', desc: 'Repeated values stored as (value, count). 1,1,1,1,1 → (1, 5). Great for sorted data or boolean flags.' },
              { name: 'Delta Encoding', desc: 'Store differences instead of absolute values. Timestamps: store first value, then deltas. Reduces bits per value.' },
              { name: 'Bit-Packing', desc: 'Values that fit in fewer bits are packed. If max value is 100, use 7 bits instead of 32. Parquet chooses encoding per page.' },
            ].map(enc => (
              <div key={enc.name} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 6 }}>{enc.name}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{enc.desc}</div>
              </div>
            ))}
          </div>

          <CodeBlock lang="python">{`# Reading and writing Parquet optimally
from pyspark.sql.functions import col

# Write with optimal settings for analytics
df.write \
  .format("parquet") \
  .option("compression", "snappy")    \  # fast compression, good ratio
  .option("parquet.block.size", str(128 * 1024 * 1024))  # 128MB row groups
  .partitionBy("year", "month")       \  # partition pruning on queries
  .sortBy("customer_id")              \  # data skipping within row groups
  .mode("overwrite") \
  .save("/mnt/data/sales")

# Reading with column pruning and predicate pushdown
df = spark.read.parquet("/mnt/data/sales") \
    .select("customer_id", "amount", "date") \  # only reads 3 columns
    .filter(col("year") == 2024)               # pushed down to file scan

# Check Parquet metadata
import pyarrow.parquet as pq
pf = pq.read_metadata("/path/to/file.parquet")
print(pf.num_rows, pf.num_row_groups, pf.serialized_size)
for i in range(pf.num_row_groups):
    rg = pf.row_group(i)
    print(f"Row group {i}: {rg.num_rows} rows, {rg.total_byte_size} bytes")`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"Why would you choose Parquet over CSV for a 500GB analytics table?"</li>
              <li>"Explain what predicate pushdown and column pruning mean in Parquet"</li>
              <li>"When would you use Avro instead of Parquet for a Kafka topic?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>File format choice directly impacts query performance, storage cost, and pipeline architecture. They want to hear you explain why columnar formats win for analytics (column pruning, cache locality, compression ratios on homogeneous data), why row formats win for streaming (write one record at a time efficiently), and why the Parquet row-group/column-chunk/page hierarchy enables data skipping. This is fundamental lakehouse knowledge.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>State the access pattern</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Analytics scanning few columns of many rows → columnar (Parquet/ORC)"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Explain the mechanism</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Parquet reads only the requested column chunks — 3 of 200 columns = 1.5% of I/O"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Add the operational consideration</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Plus predicate pushdown on min/max stats skips entire row groups — no scan needed"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Netflix migrated their viewing history store from JSON to Parquet and reduced storage by 87% while cutting query times by 10x — primarily due to columnar compression and column pruning. Twitter (now X) uses Parquet with Snappy for their ad analytics pipeline, scanning 3 of 80 columns per query and achieving 95% I/O reduction. At Confluent, Avro with Schema Registry is mandatory for all Kafka topics — schema evolution compatibility checks prevent consumer outages when producers add new fields.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"We use Parquet because everyone else does"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"Parquet is right for analytics because it stores each column separately — a query on 3 of 200 columns reads 1.5% of the file. Row groups with min/max statistics enable predicate pushdown — the query engine skips entire 128MB chunks without decompressing them. For streaming I'd use Avro with schema registry since writing one event at a time is efficient in row format"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use Parquet for analytical workloads with selective column access</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use Avro with Schema Registry for Kafka event streaming</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Sort data within Parquet files on commonly-filtered columns to enable data skipping</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use CSV or JSON for large analytical tables in production</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Let Spark write tiny Parquet files — compact to 128-512MB row groups</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use Parquet for Kafka events — it is not designed for streaming writes</div>
            </div>
          </div>

          <Quiz topicId="file-formats" questions={[
            { question: "A 10TB CSV file on S3 is queried by Athena: SELECT COUNT(*) WHERE country='US'. With Parquet partitioned by country, the same query takes 2 seconds instead of 45 minutes. The reason is:", options: ["Parquet has better compression", "Partition pruning reads only the country=US partition; column pruning skips all other columns; row-group stats may skip entire groups", "Parquet indexes every value", "Athena has a Parquet cache"], correct: 1, explanation: "Partition pruning + column pruning + predicate pushdown = 3 independent layers of I/O reduction" },
            { question: "Parquet uses dictionary encoding for a 'status' column with values ['active','inactive','pending'] across 100M rows. It stores:", options: ["100M copies of the strings", "3 unique strings once in a dictionary + 100M 1-2 byte integer indexes", "The column as a bloom filter", "The column as RLE pairs"], correct: 1, explanation: "Dictionary: 3 strings x ~8 bytes = 24 bytes + 100M x 1 byte index = ~100 MB vs ~800 MB raw strings" },
            { question: "Why is Avro row-oriented format preferred over Parquet for Kafka event streaming?", options: ["Avro is smaller than Parquet", "Avro serializes one complete record at a time enabling efficient single-event writes; Parquet requires accumulating rows into column chunks before writing", "Avro has built-in Kafka support", "Parquet doesn't support streaming"], correct: 1, explanation: "Row-oriented formats write individual events efficiently; columnar requires batching which adds latency" },
          ]} />
          <button onClick={async () => { try { if (completed.has('file-formats')) { await unmarkTopicComplete('file-formats'); onUnmark('file-formats') } else { await markTopicComplete('file-formats'); onComplete('file-formats') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('file-formats') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('file-formats') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* COMPRESSION */}
        <section id="compression" ref={el => { if (el) sectionRefs.current['compression'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Compression Algorithms</h1>
            <p className="topic-desc">Compression reduces storage costs and speeds up I/O  -  especially important when reading from object storage like ADLS or S3. Understanding the speed vs ratio tradeoffs helps you choose the right codec for each layer of the medallion architecture.</p>
          </div>

          <CompressionDiagram />
          <CompressionAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Codec Comparison</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.83rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Codec', 'Speed', 'Ratio', 'CPU', 'Splittable', 'Best Use Case'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, fontSize: '.75rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Snappy', '⚡⚡⚡ Very fast', '~2x', 'Low', 'No (block)', 'Parquet/ORC in Spark  -  default choice, fast decompression'],
                  ['LZ4', '⚡⚡⚡ Fastest', '~2x', 'Very low', 'No', 'Real-time streaming, Kafka compression'],
                  ['Zstd', '⚡⚡ Fast', '~3x', 'Medium', 'No', 'Parquet Gold layer  -  better ratio than Snappy, still fast'],
                  ['Gzip', '⚡ Slow', '~4x', 'High', 'No', 'CSV/JSON cold archive, HTTP response compression'],
                  ['Bzip2', '🐌 Very slow', '~5x', 'Very high', 'Yes!', 'HDFS splits  -  only splittable codec for text files'],
                  ['Deflate', '⚡ Slow', '~3.5x', 'High', 'No', 'Avro default, ZIP files'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '8px 12px', fontWeight: j === 0 ? 700 : 400, color: j === 0 ? 'var(--blue-700)' : 'var(--text-secondary)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Splittability matters for HDFS/Spark:</strong> Snappy and Gzip files cannot be split  -  Spark reads the whole file with one task. Use Parquet/ORC (internally splittable by row group) or Bzip2 for splittable text files. For Delta Lake, use Snappy or Zstd  -  row groups handle splitting.</div>
          </div>

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>Parquet Encoding Algorithms (Column-Level)</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
            Parquet applies encoding <em>before</em> block compression. Encoding exploits data patterns; compression removes remaining redundancy. The combination is powerful.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { name: 'Run-Length Encoding (RLE)', example: '[A,A,A,B,B] → [(A,3),(B,2)]', use: 'Boolean columns, sorted/partitioned data, low-cardinality after sort' },
              { name: 'Dictionary Encoding', example: '[UK,US,UK,DE] → dict:{UK:0,US:1,DE:2}, data:[0,1,0,2]', use: 'String columns with < ~10K unique values (status, country, category)' },
              { name: 'Delta Encoding', example: '[1000, 1001, 1003, 1006] → [1000, +1, +2, +3]', use: 'Monotonically increasing IDs, sorted timestamps  -  very compact deltas' },
              { name: 'Bit-Packing', example: 'Values 0-7 use 3 bits instead of 32 bits', use: 'Integer columns with small range  -  auto-applied when beneficial' },
            ].map(enc => (
              <div key={enc.name} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 6 }}>{enc.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '.75rem', background: 'var(--gray-50)', borderRadius: 4, padding: '4px 8px', marginBottom: 8, wordBreak: 'break-all' }}>{enc.example}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{enc.use}</div>
              </div>
            ))}
          </div>

          <CodeBlock lang="python">{`# Compression in Spark
df.write.format("parquet").option("compression", "snappy").save(path)   # default, fast
df.write.format("parquet").option("compression", "zstd").save(path)    # better ratio
df.write.format("parquet").option("compression", "gzip").save(path)    # slowest, best ratio
df.write.format("parquet").option("compression", "none").save(path)    # no compression

# Zstd with compression level (1=fastest, 22=best ratio, default=3)
spark.conf.set("spark.sql.parquet.compression.codec", "zstd")
spark.conf.set("parquet.zstd.compression.level", "6")

# For Kafka (LZ4 is fastest for streaming)
# producer config: compression.type=lz4
# Snappy is also common: compression.type=snappy

# Comparing compression ratios empirically
import os
path_snappy = "/tmp/test_snappy"
path_zstd   = "/tmp/test_zstd"
df.write.format("parquet").option("compression","snappy").mode("overwrite").save(path_snappy)
df.write.format("parquet").option("compression","zstd").mode("overwrite").save(path_zstd)

def folder_size(path):
    total = 0
    for f in os.listdir(path):
        total += os.path.getsize(os.path.join(path, f))
    return total / (1024**2)  # MB

print(f"Snappy: {folder_size(path_snappy):.1f} MB")
print(f"Zstd:   {folder_size(path_zstd):.1f} MB")`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"What compression codec do you use for Parquet and why?"</li>
              <li>"A Spark job with Gzip-compressed CSV files only uses 1 executor core per file — why?"</li>
              <li>"When would you choose Zstd over Snappy for a Delta table?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>They want to see you make data-driven compression choices, not just pick defaults. The key insight is that splittability determines parallelism: a 10GB Gzip CSV cannot be split so Spark reads it on one core. Parquet avoids this because row groups are independently compressed and splittable. The speed-vs-ratio tradeoff (Snappy vs Zstd) is a daily decision: hot Bronze data favors fast decompression; cold Gold archives favor higher ratio. This knowledge directly saves compute costs.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>State the tradeoff axis</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Speed vs ratio: Snappy is 500MB/s decompress but 2x ratio; Zstd is 200MB/s but 3x ratio"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Apply splittability rule</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Never use Gzip/Snappy for raw text files in HDFS/Spark — they are not splittable. Parquet row groups are splittable regardless of codec"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Match to data layer</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Bronze/Silver: Snappy for fast reads; Gold archive: Zstd for cost; Kafka: LZ4 for lowest latency"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Meta (Facebook) uses Zstd at compression level 3 for all their cold Hive/Spark tables, saving an estimated 30% storage versus Snappy with only 15% CPU overhead increase. Cloudflare processes 50 million events/second with LZ4 compression on Kafka — LZ4's sub-millisecond decompression latency fits within their 10ms end-to-end streaming SLA where Gzip's 50ms would not. Netflix A/B tested Snappy vs Zstd on their Gold recommendation tables and found Zstd level 3 reduced storage 40% with query times within 5% of Snappy.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I use Snappy because it's the default"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"Snappy is a good default for hot query paths — fast decompression matters more than ratio when the same data is queried frequently. For cold Gold archives I switch to Zstd level 3 or 6 — same query performance but 30-40% smaller files. For Kafka I use LZ4 — it has the lowest per-message CPU overhead which adds up at millions of messages per second"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use Snappy or Zstd for Parquet/Delta tables</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use LZ4 for high-throughput Kafka topics</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use Zstd for cold/archive data where storage cost matters more than CPU</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Compress CSV/JSON files with Gzip for Spark input — they cannot be split</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use Bzip2 for anything except when you specifically need splittable text files</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Leave Parquet files uncompressed in production — you lose 2-4x storage savings</div>
            </div>
          </div>

          <Quiz topicId="compression" questions={[
    {
      question: "A 100GB CSV file is compressed with Gzip (non-splittable). You read it with Spark on a 20-core cluster. How many Spark tasks will read this file and what is the performance implication?",
      options: [
              "20 tasks — Spark splits the file across all cores",
              "1 task — Gzip files cannot be split, so the entire file is read by a single task regardless of cluster size. 19 cores sit idle during the read phase",
              "100 tasks — one per GB",
              "It depends on the number of partitions"
      ],
      correct: 1,
      explanation: "Gzip is not splittable — Spark cannot know where block boundaries are without decompressing from the start. Use Parquet (internally splittable by row group) or Bzip2 for splittable compressed text"
    },
    {
      question: "You are choosing compression for a Delta table that holds 6 months of raw Bronze events (50TB, queried rarely, retained for replay). Which codec and why?",
      options: [
              "Snappy — it is the default and most compatible",
              "Zstd level 6 — higher compression ratio (3-4x vs 2x for Snappy) reduces storage cost by 30-40% for cold data where CPU overhead on infrequent reads is acceptable",
              "LZ4 — fastest for streaming",
              "No compression — simplifies debugging"
      ],
      correct: 1,
      explanation: "Cold data optimises for storage cost over read speed. Zstd level 6 gives ~3.5x compression vs Snappy's ~2x, cutting 50TB to ~14TB vs ~25TB — significant cost savings for rarely-read archives"
    },
    {
      question: "Parquet uses both encoding (dictionary, RLE, delta) AND block compression (Snappy, Zstd). In what order are they applied, and why does this matter?",
      options: [
              "Compression first, then encoding — compression is faster",
              "Encoding first, then compression — encoding exploits data patterns to reduce entropy first; the resulting encoded bytes are then compressed further. Encoding can reduce data 10x before compression even starts",
              "They are applied simultaneously",
              "Only one is applied depending on the column type"
      ],
      correct: 1,
      explanation: "Encoding (dictionary, RLE, delta) exploits semantic patterns in the data. Compression then finds remaining byte-level redundancy. Applying encoding first means compression operates on more uniform, lower-entropy input — better ratios overall"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('compression')) { await unmarkTopicComplete('compression'); onUnmark('compression') } else { await markTopicComplete('compression'); onComplete('compression') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('compression') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('compression') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* SERIALIZATION */}
        <section id="serialization" ref={el => { if (el) sectionRefs.current['serialization'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Serialization Formats</h1>
            <p className="topic-desc">Serialization converts in-memory objects to bytes for transmission or storage. The format you choose affects schema evolution flexibility, performance, and compatibility between producers and consumers  -  critical for event streaming and microservice integration.</p>
          </div>

          <SerializationDiagram />
          <SerializationAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Format Comparison</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.83rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Format', 'Type', 'Schema', 'Size', 'Speed', 'Schema Evolution', 'Best For'].map(h => (
                    <th key={h} style={{ padding: '9px 11px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, fontSize: '.73rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['JSON', 'Text', 'None', 'Large', 'Slow', 'Very flexible (no checks)', 'REST APIs, configs, human-readable data'],
                  ['Avro', 'Binary', 'Required (.avsc)', 'Small', 'Fast', 'Full (backward/forward)', 'Kafka events, schema registry'],
                  ['Protobuf', 'Binary', 'Required (.proto)', 'Smallest', 'Fastest', 'Forward/backward w/ rules', 'gRPC, microservices, mobile'],
                  ['Thrift', 'Binary', 'Required (.thrift)', 'Small', 'Fast', 'Forward/backward', 'Internal services (Facebook origin)'],
                  ['MessagePack', 'Binary', 'None', 'Small', 'Fast', 'None', 'JSON replacement when size matters'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '8px 11px', fontWeight: j === 0 ? 700 : 400, color: j === 0 ? 'var(--blue-700)' : 'var(--text-secondary)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: 12 }}>Schema Evolution Compatibility</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { name: 'Backward Compatible', color: '#22c55e', bg: '#f0fdf4', desc: 'New schema can read data written with old schema. Safe to upgrade consumers first. Old fields deleted are given defaults.' },
              { name: 'Forward Compatible', color: '#3b82f6', bg: '#eff6ff', desc: 'Old schema can read data written with new schema. Unknown fields are ignored. Safe to upgrade producers first.' },
              { name: 'Full Compatible', color: '#8b5cf6', bg: '#faf5ff', desc: 'Both backward AND forward compatible. Most restrictive  -  only add optional fields, never remove or rename. Best for Kafka topics.' },
              { name: 'Breaking Change', color: '#ef4444', bg: '#fef2f2', desc: 'Renaming or removing required fields, changing type. Requires coordinating all producers and consumers simultaneously.' },
            ].map(c => (
              <div key={c.name} style={{ background: c.bg, border: `1px solid ${c.color}40`, borderRadius: 'var(--radius-md)', padding: 14 }}>
                <div style={{ fontWeight: 700, color: c.color, marginBottom: 8, fontSize: '.88rem' }}>{c.name}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>Avro with Schema Registry (Kafka / Event Hub)</h3>
          <CodeBlock lang="python">{`# Avro schema definition (.avsc)
schema_str = """
{
  "type": "record",
  "name": "OrderEvent",
  "namespace": "com.company.events",
  "fields": [
    {"name": "order_id",    "type": "long"},
    {"name": "customer_id", "type": "int"},
    {"name": "amount",      "type": {"type": "bytes", "logicalType": "decimal", "precision": 18, "scale": 2}},
    {"name": "status",      "type": "string"},
    {"name": "created_at",  "type": {"type": "long", "logicalType": "timestamp-millis"}},
    {"name": "metadata",    "type": ["null", {"type": "map", "values": "string"}], "default": null}
  ]
}
"""

# Confluent Schema Registry with Kafka
from confluent_kafka import Producer
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer

schema_registry_conf = {'url': 'https://schema-registry:8081'}
schema_registry_client = SchemaRegistryClient(schema_registry_conf)
avro_serializer = AvroSerializer(schema_registry_client, schema_str)

producer = Producer({'bootstrap.servers': 'kafka:9092'})
producer.produce(
    topic='orders',
    key=str(order_id),
    value=avro_serializer({'order_id': 123, 'amount': 99.99, ...}, SerializationContext('orders', MessageField.VALUE))
)

# Schema evolution rule: only ADD optional fields with defaults
# Bad (breaking): rename "amount" → "total_amount"
# Good (backward): add {"name": "discount", "type": ["null", "double"], "default": null}`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"A Kafka consumer fails to deserialise a message after a producer deployed a new schema — how do you prevent this?"</li>
              <li>"What is the difference between backward and forward schema compatibility?"</li>
              <li>"Why is Avro smaller and faster than JSON for event streaming?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Schema evolution is the central challenge in event-driven architectures. They want to confirm you use a schema registry to enforce compatibility rules — not just documentation or verbal agreements between teams. They also want to see you understand the binary format advantage: Avro removes field names from every message (they are in the schema), so a 50-field event shrinks from 2KB JSON to 200 bytes Avro. For high-throughput Kafka topics, this directly cuts broker storage and network bandwidth costs.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>State the format tradeoff</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"JSON is human-readable but large and schema-less; Avro is binary, schema-enforced, and 5-10x smaller"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Explain the evolution model</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Backward: new schema reads old data (add optional fields); Forward: old schema reads new data (unknown fields ignored)"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Apply the registry pattern</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Schema Registry enforces compatibility rules before a producer can register a new schema — breaking changes are caught at deploy time, not runtime"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Confluent's Schema Registry is used by Uber for all 4,000+ Kafka topics — a producer cannot publish to a topic with a schema that violates the topic's registered compatibility setting. This catches breaking changes before they reach consumers. LinkedIn invented Avro specifically for their internal messaging system and open-sourced it — their Kafka topics process 7 trillion messages per day, and the binary format vs JSON saves an estimated 60% network bandwidth. Netflix uses Protobuf for gRPC inter-service calls where latency is critical — Protobuf serialization is 3-10x faster than JSON.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"We use JSON for Kafka because it's easy to read"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"JSON works for prototyping but in production I use Avro with Schema Registry. Binary serialization is 5-10x smaller and faster. More importantly, the registry enforces backward compatibility — a producer can't deploy a breaking schema change without coordination. I configure topics as FULL_TRANSITIVE compatibility so both old and new consumers can always read any message"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use Avro + Schema Registry for production Kafka topics</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Configure FULL_TRANSITIVE compatibility for shared event streams</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Only add optional fields with defaults when evolving schemas</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use JSON for high-throughput Kafka topics — it is 5-10x larger</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Rename or remove fields from a production schema without a migration plan</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Rely on verbal agreements for schema evolution — use a registry</div>
            </div>
          </div>

          <Quiz topicId="serialization" questions={[
            { question: "A team removes a required Avro field under 'FULL' compatibility mode in Confluent Schema Registry. This change is:", options: ["Allowed -- consumers use the default value", "REJECTED -- removing a required field breaks backward compatibility; new consumers cannot read old data without defaults", "Allowed if the field has a default", "Requires a major version bump only"], correct: 1, explanation: "FULL = backward AND forward compatible; removing required fields breaks backward compat" },
            { question: "Protobuf fields are identified by field numbers, not names. The consequence for schema evolution is:", options: ["Field names can never change", "Field names can be freely renamed without breaking consumers -- consumers decode by field number, not name", "Field numbers must be sequential", "Protobuf doesn't support schema evolution"], correct: 1, explanation: "Protobuf wire format uses varint-encoded field numbers; name is just metadata in the .proto file" },
            { question: "JSON uses 186 bytes to serialize a 4-field order event. Protobuf uses 28 bytes. For 1 billion Kafka messages/day, the daily storage saving is approximately:", options: ["158 GB saved", "140 GB saved", "1.6 TB saved", "16 GB saved"], correct: 0, explanation: "(186-28) bytes x 1B = 158 GB/day saved; over a month ~4.7 TB -- significant at scale" },
          ]} />
          <button onClick={async () => { try { if (completed.has('serialization')) { await unmarkTopicComplete('serialization'); onUnmark('serialization') } else { await markTopicComplete('serialization'); onComplete('serialization') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('serialization') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('serialization') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* DATABASES */}
        <section id="databases" ref={el => { if (el) sectionRefs.current['databases'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Database Types</h1>
            <p className="topic-desc">There is no single best database  -  each type is optimised for different access patterns. Knowing which database to use for which problem is a core data engineering skill. Using the wrong database type is one of the most expensive architectural mistakes.</p>
          </div>

          <DatabasesDiagram />
          <DatabasesAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>OLTP vs OLAP</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ fontWeight: 800, color: '#1d4ed8', marginBottom: 10, fontSize: '1rem' }}>OLTP  -  Online Transactional Processing</div>
              <ul style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 2, margin: 0, paddingLeft: 18 }}>
                <li>Row-oriented storage (fast single-row reads/writes)</li>
                <li>Optimised for INSERT/UPDATE/DELETE on single rows</li>
                <li>High concurrency, many short transactions</li>
                <li>Normalised schema (3NF) to avoid update anomalies</li>
                <li>Examples: Azure SQL DB, PostgreSQL, MySQL, Cosmos DB</li>
                <li>Use for: operational apps, order management, user profiles</li>
              </ul>
            </div>
            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ fontWeight: 800, color: '#7c3aed', marginBottom: 10, fontSize: '1rem' }}>OLAP  -  Online Analytical Processing</div>
              <ul style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 2, margin: 0, paddingLeft: 18 }}>
                <li>Column-oriented storage (fast aggregate scans)</li>
                <li>Optimised for SELECT with GROUP BY, aggregations</li>
                <li>Few concurrent queries but very large scans</li>
                <li>Denormalised star/snowflake schema for read performance</li>
                <li>Examples: Databricks, Synapse Analytics, BigQuery, Redshift</li>
                <li>Use for: BI reports, KPI dashboards, ad-hoc analytics</li>
              </ul>
            </div>
          </div>

          <h3 style={{ marginBottom: 12 }}>NoSQL Database Types</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { type: 'Document DB', icon: '📄', example: 'MongoDB, Cosmos DB (NoSQL API)', desc: 'Stores JSON-like documents. Flexible schema. Great for semi-structured data, user profiles, product catalogs. Query by any field.' },
              { type: 'Key-Value Store', icon: '🔑', example: 'Redis, Azure Cache, DynamoDB', desc: 'Simplest: key → value. Extremely fast lookups. Ideal for caching, session state, feature flags, rate limiting.' },
              { type: 'Column-Family', icon: '📊', example: 'Apache Cassandra, HBase', desc: 'Wide-column. Each row can have different columns. Optimised for time-series writes and reads by partition key. Scales to PBs.' },
              { type: 'Graph DB', icon: '🕸️', example: 'Neo4j, Amazon Neptune', desc: 'Nodes and edges with properties. Traversal queries (shortest path, friend-of-friend). Ideal for fraud detection, recommendation engines.' },
              { type: 'Time-Series DB', icon: '📈', example: 'InfluxDB, TimescaleDB, Azure Data Explorer', desc: 'Optimised for time-indexed data. Built-in downsampling, retention policies. IoT sensor data, metrics, logs.' },
              { type: 'Vector DB', icon: '🧠', example: 'Pinecone, Weaviate, pgvector', desc: 'Stores high-dimensional embeddings. ANN (Approximate Nearest Neighbour) search. Semantic search, RAG for LLMs, recommendation.' },
            ].map(db => (
              <div key={db.type} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{db.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 4 }}>{db.type}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '.73rem', color: 'var(--blue-600)', marginBottom: 8 }}>{db.example}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{db.desc}</div>
              </div>
            ))}
          </div>

          <CodeBlock lang="python">{`# OLTP: single row operations (Azure SQL / PostgreSQL)
import pyodbc
conn = pyodbc.connect("DRIVER={ODBC Driver 17 for SQL Server};SERVER=...")
cursor = conn.cursor()
cursor.execute("UPDATE orders SET status='shipped' WHERE order_id=?", (12345,))
conn.commit()

# OLAP: aggregation query (Databricks / Synapse)
df = spark.sql("""
    SELECT
        date_trunc('month', order_date) AS month,
        product_category,
        SUM(revenue)          AS total_revenue,
        COUNT(DISTINCT customer_id) AS unique_customers
    FROM gold.fact_orders
    WHERE order_date >= '2024-01-01'
    GROUP BY 1, 2
    ORDER BY 1, 3 DESC
""")

# Key-Value (Redis) - caching API responses
import redis
r = redis.Redis(host='localhost')
cached = r.get(f"customer:{customer_id}")
if not cached:
    data = fetch_from_db(customer_id)
    r.setex(f"customer:{customer_id}", 300, json.dumps(data))  # TTL 5 min

# Vector DB (semantic search for RAG)
import pinecone
index = pinecone.Index("product-embeddings")
results = index.query(vector=query_embedding, top_k=10, include_metadata=True)`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"When would you use Cassandra vs PostgreSQL vs BigQuery for a given problem?"</li>
              <li>"Explain why you can't use a JOIN in Cassandra the same way you do in PostgreSQL"</li>
              <li>"A startup wants to store ML embeddings for semantic search — what database would you recommend?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Database selection is one of the most consequential architectural decisions. They want to see you match access patterns to database capabilities — not just list database names. OLTP vs OLAP is the first cut. Then: Do you need horizontal scale for writes (Cassandra/DynamoDB)? Fast point lookups (Redis)? Flexible schema (MongoDB)? Time-series (InfluxDB)? Semantic search (vector DB)? The worst answer is 'use PostgreSQL for everything' — the second worst is 'it depends' without explaining what it depends on.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Define the access pattern</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"How many reads/writes per second? Point lookups or scans? Structured or semi-structured?"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Apply the CAP tradeoff</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Cassandra: AP (available, partition-tolerant, eventual consistency); PostgreSQL: CP (consistent, partition-tolerant)"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Match to use case</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Time-series metrics → InfluxDB/ADX; ML embeddings → vector DB; caching → Redis; ACID transactions → PostgreSQL"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Netflix uses Apache Cassandra for their viewing history service — it handles 50 million writes per day across globally distributed datacenters because Cassandra's eventual consistency and horizontal write scaling is perfect for append-heavy event data. Instagram uses PostgreSQL for their OLTP workload (user profiles, follow graph) and BigQuery for analytics. Airbnb uses Pinecone as their vector database for listing similarity search — returning the 10 most similar listings to a given search embedding in under 10ms at scale.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I use PostgreSQL for the database"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"The database choice follows the access pattern. For transactional writes with ACID guarantees I'd use PostgreSQL or Azure SQL. For high-throughput time-series I'd use InfluxDB or Azure Data Explorer. For caching with sub-millisecond reads I'd use Redis. For analytical scans over billions of rows I'd use BigQuery or Databricks — row-oriented OLTP databases scan extremely slowly for aggregations"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Choose databases based on access pattern, not familiarity</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use Redis for caching to reduce load on OLTP databases</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use a time-series DB (InfluxDB/ADX) for IoT/metrics workloads</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Run analytical GROUP BY queries on an OLTP PostgreSQL database in production</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use a relational DB for ML embedding similarity search</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use a document DB when you need complex multi-table joins</div>
            </div>
          </div>

          <Quiz topicId="databases" questions={[
    {
      question: "A pipeline needs to write 500,000 IoT sensor readings per second across 10,000 devices globally and serve time-range queries like 'last 24h of readings for device X'. Which database is best suited?",
      options: [
              "PostgreSQL with a timescaledb extension on a single large server",
              "A distributed time-series database (InfluxDB, TimescaleDB, Azure Data Explorer) — designed for high-frequency time-indexed writes, automatic downsampling, and retention policies. Cassandra works too for this volume",
              "Redis — fastest reads",
              "BigQuery — most scalable"
      ],
      correct: 1,
      explanation: "Time-series DBs have specialised storage engines optimised for time-ordered writes (LSM trees) and time-range reads. They also handle downsampling (keep 1-minute aggregates, drop per-second data after 30 days) automatically"
    },
    {
      question: "You are building a recommendation engine. For each product, you have a 768-dimensional embedding vector from a transformer model. You need to find the 10 most similar products to a given query embedding in under 20ms. Which database type do you use?",
      options: [
              "PostgreSQL with a JSON column storing the embedding array",
              "A vector database (Pinecone, Weaviate, pgvector) that uses Approximate Nearest Neighbour (ANN) indexing — exact nearest-neighbour search over 768 dimensions at scale requires specialised index structures (HNSW, IVF)",
              "Cassandra — optimised for high-throughput writes",
              "Redis — sub-millisecond reads"
      ],
      correct: 1,
      explanation: "ANN indexes (HNSW, IVF-PQ) reduce similarity search from O(N) brute force to O(log N). At 10M products, brute force takes seconds; HNSW takes milliseconds"
    },
    {
      question: "An OLTP PostgreSQL table has 500 million rows. An analyst runs SELECT region, SUM(revenue) FROM orders GROUP BY region and it takes 45 minutes. What is the root cause?",
      options: [
              "PostgreSQL does not support GROUP BY on large tables",
              "PostgreSQL is row-oriented — it must read all 500M rows (all columns) from disk to compute the aggregation. An OLAP columnar store (BigQuery, Synapse, Redshift) would read only the region and revenue columns, taking seconds",
              "The query is missing an index",
              "PostgreSQL's query planner chose the wrong join strategy"
      ],
      correct: 1,
      explanation: "Row-oriented storage reads full rows even for single-column aggregations. Columnar OLAP engines read only the 2 needed columns out of potentially 50+ — 96% less I/O"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('databases')) { await unmarkTopicComplete('databases'); onUnmark('databases') } else { await markTopicComplete('databases'); onComplete('databases') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('databases') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('databases') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* DATA WAREHOUSE */}
        <section id="data-warehouse" ref={el => { if (el) sectionRefs.current['data-warehouse'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Data Warehouse Concepts</h1>
            <p className="topic-desc">Data warehouse modelling is about organising historical business data for fast analytical queries. Star schemas, SCDs, and surrogate keys are the vocabulary of every enterprise data warehouse and lakehouse Gold layer.</p>
          </div>

          <DataWarehouseDiagram />
          <StarSchemaAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 16 }}>Star vs Snowflake Schema</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#d97706', marginBottom: 8 }}>Star Schema</div>
              <ul style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
                <li>One central fact table surrounded by denormalised dimension tables</li>
                <li>Dimensions are flat  -  no further joins needed</li>
                <li>Faster queries (fewer joins)</li>
                <li>More storage (repeated dimension data)</li>
                <li>Best for: BI tools, ad-hoc analytics, Power BI</li>
              </ul>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 8 }}>Snowflake Schema</div>
              <ul style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
                <li>Dimension tables further normalised into sub-dimensions</li>
                <li>e.g., dim_product → dim_category → dim_department</li>
                <li>Slower queries (more joins)</li>
                <li>Less storage (no repeated data)</li>
                <li>Best for: DWH with strict data governance</li>
              </ul>
            </div>
          </div>

          <h3 style={{ marginBottom: 12 }}>Slowly Changing Dimensions (SCD) Types</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {[
              { type: 'SCD Type 0', color: '#94a3b8', title: 'Fixed  -  No Change', desc: 'Original value kept forever. Example: birth date. The attribute never changes.' },
              { type: 'SCD Type 1', color: '#f59e0b', title: 'Overwrite  -  No History', desc: 'New value overwrites old. No history kept. Example: correcting a typo in a name. Simple but destroys history.' },
              { type: 'SCD Type 2', color: '#22c55e', title: 'New Row  -  Full History', desc: 'New row inserted for each change with effective_start, effective_end dates and is_current flag. Most common. Example: customer address changes. Enables point-in-time reporting.' },
              { type: 'SCD Type 3', color: '#3b82f6', title: 'Add Column  -  Limited History', desc: 'Add "previous_value" column. Only keeps one historical value. Example: current_region + previous_region. Simple but limited.' },
              { type: 'SCD Type 4', color: '#8b5cf6', title: 'History Table  -  Separate', desc: 'Keep current in main table, full history in a separate history table. Fast current reads, full history available.' },
              { type: 'SCD Type 6', color: '#ef4444', title: 'Hybrid (1+2+3)', desc: 'Combines Type 1 (overwrite), Type 2 (new row), Type 3 (add column). Has is_current flag, effective dates, AND current_value column updated on all rows for that key.' },
            ].map(scd => (
              <div key={scd.type} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'white', border: '1px solid var(--border)', borderLeft: `3px solid ${scd.color}`, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '.85rem', minWidth: 120, color: scd.color }}>{scd.type}</div>
                <div style={{ fontWeight: 600, fontSize: '.85rem', minWidth: 220 }}>{scd.title}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{scd.desc}</div>
              </div>
            ))}
          </div>

          <CodeBlock lang="sql">{`-- Star Schema: Fact and Dimension tables
-- FACT TABLE: one row per business event, foreign keys to dimensions
CREATE TABLE gold.fact_sales (
    sale_sk          BIGINT NOT NULL,       -- surrogate key (auto-generated)
    date_sk          INT NOT NULL,          -- FK to dim_date
    customer_sk      BIGINT NOT NULL,       -- FK to dim_customer
    product_sk       INT NOT NULL,          -- FK to dim_product
    store_sk         INT NOT NULL,          -- FK to dim_store
    -- Measures (additive)
    quantity         INT,
    unit_price       DECIMAL(10,2),
    discount_amount  DECIMAL(10,2),
    net_revenue      DECIMAL(18,2),         -- calculated = quantity * unit_price - discount
    -- Degenerate dimensions (no separate table needed)
    invoice_number   VARCHAR(20),
    PRIMARY KEY (sale_sk)
);

-- DIMENSION TABLE with SCD Type 2
CREATE TABLE gold.dim_customer (
    customer_sk      BIGINT NOT NULL,       -- surrogate key (use IDENTITY/SEQUENCE)
    customer_nk      VARCHAR(50) NOT NULL,  -- natural key (source system ID)
    customer_name    VARCHAR(200),
    email            VARCHAR(200),
    city             VARCHAR(100),
    country          VARCHAR(100),
    tier             VARCHAR(20),           -- 'Gold', 'Silver', 'Bronze'
    -- SCD Type 2 metadata
    effective_start  DATE NOT NULL,
    effective_end    DATE,                  -- NULL means current
    is_current       BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (customer_sk)
);

-- Conformed date dimension (reused across all fact tables)
CREATE TABLE gold.dim_date (
    date_sk       INT PRIMARY KEY,          -- YYYYMMDD as integer
    full_date     DATE,
    year          SMALLINT,
    quarter       TINYINT,
    month         TINYINT,
    month_name    VARCHAR(10),
    week          TINYINT,
    day_of_week   TINYINT,
    is_weekend    BOOLEAN,
    is_holiday    BOOLEAN
);

-- Typical star schema query
SELECT
    d.year, d.month_name,
    c.country, c.tier,
    SUM(f.net_revenue)  AS total_revenue,
    COUNT(*)            AS transaction_count
FROM gold.fact_sales f
JOIN gold.dim_date     d ON f.date_sk = d.date_sk
JOIN gold.dim_customer c ON f.customer_sk = c.customer_sk AND c.is_current = TRUE
JOIN gold.dim_product  p ON f.product_sk = p.product_sk
WHERE d.year = 2024
GROUP BY 1,2,3,4
ORDER BY 1,2,5 DESC;`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"Explain the difference between a fact table and a dimension table"</li>
              <li>"A customer changes their address — how do you handle this in SCD Type 2?"</li>
              <li>"Why do we use surrogate keys instead of natural keys in a data warehouse?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Data warehouse modelling is the core of analytics engineering. They want to see you think in star schemas instinctively — fact tables for measurable events, dimension tables for context. They check whether you know SCD Type 2 cold: the effective_start/effective_end/is_current pattern for tracking historical changes. They also look for understanding of why surrogate keys exist: natural keys from source systems change, can be NULL, and span multiple source systems — surrogate keys are stable, unique, and system-generated.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Identify fact vs dimension</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Fact: one row per business event (sale, click, payment); Dimension: one row per business entity (customer, product, date)"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Apply SCD pattern</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Attribute changes over time → SCD Type 2: new row with effective dates and is_current flag"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Connect measures to dimensions</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Fact table holds foreign keys to all dimensions + additive measures (amount, quantity, duration)"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Amazon Redshift's best practice guide mandates star schemas for BI workloads — their query planner is optimised for one fact + N dimension joins. Snowflake's sample TPC-DS benchmark database uses a star schema with a 24-billion-row fact table and 7 dimension tables. At Capital One, their data warehouse uses SCD Type 2 for all customer dimension attributes — regulators require point-in-time accuracy: 'what was this customer's credit score when they applied in March 2022?' requires accurate historical records.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I put all the data in one big table"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"For analytics I use a star schema: a central fact table with one row per business event, foreign keys to conformed dimension tables, and only additive measures in the fact table. Historical changes to customer attributes use SCD Type 2 — new row with effective_start, effective_end, and is_current — so I can accurately answer 'what was this customer's tier when they made this purchase?'"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use surrogate keys (IDENTITY/SEQUENCE) for all dimension primary keys</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Implement SCD Type 2 for attributes that change and where history matters</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Include a conformed dim_date in every star schema</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use natural keys (source system IDs) as warehouse primary keys</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use SCD Type 1 when regulatory/audit requirements exist — it destroys history</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Denormalise fact tables with repeated dimension attributes — use foreign keys instead</div>
            </div>
          </div>

          <Quiz topicId="data-warehouse" questions={[
    {
      question: "A customer 'Alice' (customer_nk='C001') changes her tier from 'Silver' to 'Gold' on 2024-06-15. You are implementing SCD Type 2. Which SQL operation correctly handles this?",
      options: [
              "UPDATE dim_customer SET tier='Gold' WHERE customer_nk='C001'",
              "UPDATE dim_customer SET effective_end='2024-06-14', is_current=FALSE WHERE customer_nk='C001' AND is_current=TRUE; then INSERT a new row with tier='Gold', effective_start='2024-06-15', effective_end=NULL, is_current=TRUE",
              "DELETE and re-INSERT the customer row",
              "Add a new column 'previous_tier' and set it to 'Silver'"
      ],
      correct: 1,
      explanation: "SCD Type 2: close the old record (set effective_end and is_current=FALSE), insert a new record for the new value. This preserves complete history for point-in-time queries"
    },
    {
      question: "A fact_sales table has 50 billion rows with a date_sk column (INT, FK to dim_date). An analyst queries revenue for Q1 2024 only. What is the most effective physical optimisation for this query?",
      options: [
              "Create an index on date_sk",
              "Partition the fact table by year/month — Spark/SQL can prune all partitions outside Q1 2024, reading only 3 months instead of the entire 50B-row table",
              "Add a materialized view for Q1",
              "Increase executor memory"
      ],
      correct: 1,
      explanation: "Partition pruning on date is the most powerful optimisation for time-range queries on fact tables — it reduces I/O from the full table to just the relevant partitions"
    },
    {
      question: "Why should measures in a fact table be additive rather than non-additive?",
      options: [
              "Additive measures compress better in Parquet",
              "Additive measures (SUM, COUNT) can be aggregated across any combination of dimensions without recalculation. Non-additive measures like ratios or averages produce incorrect results when summed — they must be recalculated from the base additive components",
              "Non-additive measures require more storage",
              "BI tools only support additive measures"
      ],
      correct: 1,
      explanation: "Example: average_order_value = total_revenue / order_count. Both are additive; the ratio is not. Store total_revenue and order_count in the fact table; compute the ratio at query time"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('data-warehouse')) { await unmarkTopicComplete('data-warehouse'); onUnmark('data-warehouse') } else { await markTopicComplete('data-warehouse'); onComplete('data-warehouse') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('data-warehouse') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('data-warehouse') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* MEDALLION */}
        <section id="medallion" ref={el => { if (el) sectionRefs.current['medallion'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Medallion Architecture</h1>
            <p className="topic-desc">The Medallion (Bronze/Silver/Gold) architecture is the standard pattern for modern data lakehouses. It organises data into quality tiers, each with clear responsibilities. Understanding what belongs in each layer  -  and why  -  is a daily decision for data engineers.</p>
          </div>

          <MedallionDiagram />
          <MedallionAnimation />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginTop: 20, marginBottom: 24 }}>
            {[
              { tier: 'Bronze', icon: '🥉', color: '#cd7f32', bg: '#fff7ed',
                responsibilities: ['Raw ingested data  -  no transformations', 'Append-only (never delete or update)', 'Source of truth for replaying pipelines', 'Keep forever  -  cheapest storage tier', 'Capture schema and ingestion metadata', 'Auto Loader / Event Hub streaming'],
                formats: 'Parquet, Delta, JSON as-is', latency: 'Seconds to minutes' },
              { tier: 'Silver', icon: '🥈', color: '#64748b', bg: '#f8fafc',
                responsibilities: ['Cleaned and validated data', 'Deduplication (drop duplicate events)', 'Type casting and null handling', 'Joins to reference/lookup tables', 'SCD Type 2 for slowly changing entities', 'Consistent naming conventions applied'],
                formats: 'Delta tables', latency: 'Minutes to hours' },
              { tier: 'Gold', icon: '🥇', color: '#f59e0b', bg: '#fffbeb',
                responsibilities: ['Business-ready aggregations and KPIs', 'Optimised for BI tools and dashboards', 'ML feature tables', 'One table per business question', 'Never modify Silver/Bronze from here', 'Materialised or views depending on SLA'],
                formats: 'Delta / Parquet', latency: 'Hours (batch) or minutes (streaming)' },
            ].map(t => (
              <div key={t.tier} style={{ background: t.bg, border: `1.5px solid ${t.color}40`, borderRadius: 'var(--radius-xl)', padding: 20 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: t.color, marginBottom: 10 }}>{t.tier}</div>
                <ul style={{ fontSize: '.8rem', color: 'var(--text-secondary)', lineHeight: 1.8, margin: '0 0 12px 0', paddingLeft: 16 }}>
                  {t.responsibilities.map(r => <li key={r}>{r}</li>)}
                </ul>
                <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}><strong>Formats:</strong> {t.formats}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}><strong>Latency:</strong> {t.latency}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>Views vs Materialised Tables</h3>
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Views</strong>  -  no physical storage, query executed on every read. Use for Gold when data changes frequently and freshness &lt; latency matters, or when the underlying Silver is fast enough.<br/><br/>
              <strong>Materialised tables / CTAS</strong>  -  physical storage, pre-computed. Use when: (1) queries are slow and many users hit the same aggregation, (2) you need sub-second BI response times, (3) complex joins that are expensive to recompute.
            </div>
          </div>

          <CodeBlock lang="python">{`# ─── BRONZE: Auto Loader streaming ingestion ─────────────────────────────────
(spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/checkpoints/bronze/schema")
    .option("cloudFiles.inferColumnTypes", "true")
    .load("abfss://raw@storage.dfs.core.windows.net/orders/")
    .withColumn("_ingested_at", current_timestamp())
    .withColumn("_source_file", input_file_name())
    .writeStream
    .format("delta")
    .option("checkpointLocation", "/checkpoints/bronze/orders")
    .outputMode("append")
    .trigger(availableNow=True)   # process all available, then stop
    .table("bronze.orders_raw"))

# ─── SILVER: Clean, deduplicate, type-cast ────────────────────────────────────
from delta.tables import DeltaTable

df_silver = (spark.readStream.table("bronze.orders_raw")
    .filter(col("order_id").isNotNull())
    .filter(col("amount") > 0)
    .withColumn("order_time", to_timestamp("order_time_str"))
    .withColumn("amount", col("amount").cast(DecimalType(18, 2)))
    .dropDuplicates(["order_id"]))

# MERGE for idempotent upsert (handle late-arriving bronze duplicates)
def upsert_to_silver(microBatchDF, batchId):
    DeltaTable.forName(spark, "silver.orders").alias("target").merge(
        microBatchDF.alias("source"),
        "target.order_id = source.order_id"
    ).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()

df_silver.writeStream.foreachBatch(upsert_to_silver).option("checkpointLocation", "/checkpoints/silver/orders").start()

# ─── GOLD: Business aggregation ──────────────────────────────────────────────
spark.sql("""
    CREATE OR REPLACE TABLE gold.daily_revenue AS
    SELECT
        to_date(order_time) AS order_date,
        customer_tier,
        country,
        SUM(amount)         AS total_revenue,
        COUNT(*)            AS order_count,
        COUNT(DISTINCT customer_id) AS unique_customers,
        AVG(amount)         AS avg_order_value
    FROM silver.orders o
    JOIN silver.dim_customer c ON o.customer_id = c.customer_id AND c.is_current
    GROUP BY 1, 2, 3
""")`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"Why is Bronze append-only and kept forever?"</li>
              <li>"What transformations belong in Silver vs Gold?"</li>
              <li>"A Silver table has a bug in the deduplication logic — how do you fix it without re-ingesting from source?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>The Medallion architecture is the default lakehouse pattern at companies using Databricks, Azure Synapse, or Delta Lake. They want to hear you articulate the purpose of each layer: Bronze is a durable, immutable record of what arrived; Silver is cleaned and conformed; Gold is business-ready. They check whether you know the replay pattern — the reason Bronze is never modified is so you can always reprocess Silver and Gold by replaying Bronze when transformation logic changes.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Define each tier's contract</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Bronze: raw as-received, append-only, schema preserved; Silver: validated, typed, deduplicated; Gold: aggregated, business-ready"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Explain the replay pattern</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"When Silver logic changes, replay Bronze → Silver → Gold without re-ingesting from source"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Connect to MERGE semantics</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Silver uses MERGE (upsert) to handle late-arriving Bronze duplicates idempotently"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Databricks' reference architecture for enterprise lakehouses uses exactly the Bronze/Silver/Gold pattern with Delta Lake at each layer. The Medallion architecture is also used at Condé Nast (processing 2 billion clickstream events daily), where Bronze stores raw Kafka events in Delta, Silver applies deduplication and PII masking, and Gold provides aggregated engagement metrics for editorial teams. At Microsoft, the Azure Synapse Analytics documentation explicitly recommends this pattern for all new data platform implementations.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"We clean the data in the ingestion step"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I keep Bronze raw and append-only because it's the source of truth for replaying the pipeline. If I clean in Bronze, a future bug fix requires re-ingesting from the source system — expensive and sometimes impossible. Silver applies all cleaning: types, deduplication, null handling. Gold is business-ready aggregations only. This separation means any layer can be reprocessed independently"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Keep Bronze append-only and never modify after ingestion</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use MERGE/upsert in Silver to handle late-arriving duplicates</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Make each layer independently reprocessable from the layer below</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Apply transformations or filtering in Bronze — it should be raw</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Delete rows from Bronze even for GDPR — use a tombstone/delete pattern</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Mix Bronze, Silver, and Gold tables in the same database schema</div>
            </div>
          </div>

          <Quiz topicId="medallion" questions={[
    {
      question: "A Silver job has a bug: it incorrectly filters out orders with status='refunded' during cleaning. This has been running for 6 months. How do you fix Gold without calling the source API again?",
      options: [
              "Accept the data loss — you cannot recover without the source API",
              "Fix the Silver transformation logic, delete and reprocess Silver from Bronze (which is intact and append-only), then reprocess Gold from the corrected Silver — Bronze is your source of truth for exactly this scenario",
              "Add the missing records manually",
              "Use Bronze data directly in Gold until Silver is fixed"
      ],
      correct: 1,
      explanation: "Bronze as immutable source of truth enables full reprocessing. Fix logic, replay Bronze → Silver → Gold. This is the primary architectural justification for never modifying Bronze"
    },
    {
      question: "Why does Silver use MERGE (upsert) rather than INSERT for writing to Delta tables?",
      options: [
              "MERGE is faster than INSERT for small datasets",
              "Bronze may deliver the same event multiple times (duplicate messages from Kafka, retried Auto Loader loads). MERGE deduplicates by matching on the natural key — idempotent processing means running Silver twice produces the same result",
              "INSERT does not work with Delta Lake",
              "MERGE applies SCD Type 2 automatically"
      ],
      correct: 1,
      explanation: "Idempotency: MERGE on order_id means re-running Silver on the same Bronze data updates existing records instead of creating duplicates. Critical for fault-tolerant pipeline design"
    },
    {
      question: "A Gold table serves a Power BI dashboard used by 500 analysts running the same 5 queries. Should this be a view over Silver or a materialised Delta table? Why?",
      options: [
              "Always a view — views are simpler to maintain",
              "A materialised Delta table — 500 analysts hitting the same complex aggregation as a view would recompute the query 500 times simultaneously, consuming massive compute. Pre-materialise the aggregation once, update on a schedule, and serve the pre-computed result to all 500 users",
              "It depends only on the query complexity",
              "Views automatically cache in Databricks"
      ],
      correct: 1,
      explanation: "High fan-out (many users, same query) is the primary signal to materialise. Views re-execute on every read; materialised tables execute once and serve many reads from pre-computed storage"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('medallion')) { await unmarkTopicComplete('medallion'); onUnmark('medallion') } else { await markTopicComplete('medallion'); onComplete('medallion') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('medallion') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('medallion') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* DATA QUALITY */}
        <section id="data-quality" ref={el => { if (el) sectionRefs.current['data-quality'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Data Quality</h1>
            <p className="topic-desc">Bad data is worse than no data  -  it silently corrupts decisions. Data quality is not a one-time fix; it is an ongoing operational discipline. Every production pipeline should have DQ checks at every layer boundary.</p>
          </div>

          <DataQualityDiagram />
          <DataQualityAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Six Dimensions of Data Quality</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { dim: 'Completeness', icon: '✅', color: '#22c55e', desc: 'Are all required fields populated? No unexpected NULLs. Example: order_id must never be null.' },
              { dim: 'Accuracy', icon: '🎯', color: '#3b82f6', desc: 'Does the data correctly reflect reality? Amount is positive, email contains @, date is valid.' },
              { dim: 'Consistency', icon: '🔗', color: '#8b5cf6', desc: 'Does data agree across systems? Customer count in CRM matches the DWH. No conflicting values.' },
              { dim: 'Timeliness', icon: '⏱️', color: '#f59e0b', desc: 'Is data available when needed? SLA: Bronze within 5 min of event, Gold by 7am daily.' },
              { dim: 'Uniqueness', icon: '🔑', color: '#ef4444', desc: 'No duplicate records. One customer per customer_id. Deduplication needed in Silver layer.' },
              { dim: 'Validity', icon: '📋', color: '#06b6d4', desc: 'Does data conform to defined rules? Country is ISO 3166 code, status in allowed set, amount ≥ 0.' },
            ].map(d => (
              <div key={d.dim} style={{ background: 'white', border: '1px solid var(--border)', borderLeft: `3px solid ${d.color}`, borderRadius: 'var(--radius-md)', padding: 14 }}>
                <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{d.icon}</div>
                <div style={{ fontWeight: 700, color: d.color, marginBottom: 6, fontSize: '.9rem' }}>{d.dim}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{d.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>DQ Frameworks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {[
              { name: 'Great Expectations', lang: 'Python', desc: 'Open-source. Define "expectations" (assertions about data). Generates HTML data docs. Integrates with Airflow, dbt, Spark.' },
              { name: 'Deequ (AWS)', lang: 'Scala/Python', desc: 'Built on Spark. Designed for very large datasets. Constraint verification, anomaly detection, column profiles. Open-sourced by Amazon.' },
              { name: 'Soda Core', lang: 'Python', desc: 'YAML-based DQ checks. Soda Cloud for monitoring. Integrates with dbt and Airflow. Simple to configure for non-engineers.' },
              { name: 'dbt Tests', lang: 'SQL', desc: 'Built into dbt. not_null, unique, accepted_values, relationships checks. Runs as part of dbt build. Simple but powerful.' },
            ].map(fw => (
              <div key={fw.name} style={{ display: 'flex', gap: 14, padding: '12px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, minWidth: 180, fontSize: '.88rem' }}>{fw.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--blue-600)', minWidth: 100 }}>{fw.lang}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{fw.desc}</div>
              </div>
            ))}
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body"><strong>Quarantine pattern:</strong> Failed records should NOT be silently dropped. Send them to a dead letter queue (DLQ) or quarantine table for investigation and reprocessing. Silently dropping bad data hides systematic upstream problems.</div>
          </div>

          <CodeBlock lang="python">{`# Great Expectations  -  define and run DQ checks
import great_expectations as ge

df_ge = ge.from_pandas(df.toPandas())  # or use Spark connector

# Define expectations
df_ge.expect_column_values_to_not_be_null("order_id")
df_ge.expect_column_values_to_be_between("amount", min_value=0, max_value=1_000_000)
df_ge.expect_column_values_to_be_in_set("status", ["pending","processing","shipped","delivered","cancelled"])
df_ge.expect_column_values_to_match_regex("email", r"^[^@]+@[^@]+\.[^@]+$")
df_ge.expect_column_to_exist("customer_id")
df_ge.expect_column_values_to_be_unique("order_id")

results = df_ge.validate()
if not results["success"]:
    raise ValueError(f"DQ checks failed: {results}")

# Deequ  -  Spark-native DQ at scale
from pydeequ.checks import Check, CheckLevel
from pydeequ.verification import VerificationSuite, VerificationResult

check = (Check(spark, CheckLevel.Error, "Silver DQ")
    .isComplete("order_id")
    .isUnique("order_id")
    .isNonNegative("amount")
    .isContainedIn("status", ["pending","shipped","delivered"])
    .hasCompleteness("customer_id", lambda c: c >= 0.99)  # 99% non-null
    .hasApproxCountDistinct("customer_id", lambda n: n > 1000))

result = VerificationSuite(spark).onData(df).addCheck(check).run()
df_result = VerificationResult.checkResultsAsDataFrame(spark, result)

# Quarantine pattern: split good and bad records
good = df.filter(col("order_id").isNotNull() & (col("amount") >= 0))
bad  = df.filter(col("order_id").isNull()  | (col("amount") < 0))
bad.withColumn("quarantine_reason", lit("null order_id or negative amount")) \
   .write.format("delta").mode("append").saveAsTable("quarantine.orders")
good.write.format("delta").mode("append").saveAsTable("silver.orders")`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"How do you implement data quality checks in a production Spark pipeline?"</li>
              <li>"A downstream BI report is showing incorrect numbers — how do you investigate?"</li>
              <li>"What is the quarantine pattern and why is it better than dropping bad records?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>They want to see that data quality is built into your pipeline architecture, not bolted on after an incident. Do you have automated checks at each layer boundary? Do you alert on DQ failures before the business notices? Do you route bad records to quarantine rather than dropping them silently? They also check whether you know the six dimensions of DQ (completeness, accuracy, consistency, timeliness, uniqueness, validity) — framing an answer in these terms signals seniority.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Name the dimension</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Is this a completeness issue (nulls), uniqueness issue (duplicates), or validity issue (out-of-range values)?"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Instrument the check</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Great Expectations expectation, Deequ constraint, or dbt test — whatever integrates with your orchestrator"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Define the failure mode</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Critical checks halt the pipeline; warnings go to monitoring; all failures go to a DLQ/quarantine table, never dropped"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Netflix uses automated data quality monitors that track 200+ metrics per table — row count anomaly detection, null rate trends, and cardinality drift. An alert fires if row count drops more than 15% from the 7-day moving average. LinkedIn's data quality platform (DataHub) runs DQ checks on every table write and blocks promotion from Silver to Gold if any critical check fails. At Airbnb, the Minerva metrics platform validates that computed metrics match within 0.1% of a separately computed reference value before publishing to dashboards.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I check for nulls and duplicates manually when something looks wrong"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I implement DQ checks at every layer boundary: completeness checks on required fields, uniqueness checks on natural keys, range checks on numeric values, and referential integrity checks against dimension tables. Failed records go to a quarantine table with a reason code — never dropped silently. I monitor DQ metrics in Grafana and page on-call if the null rate on order_id exceeds 0.01%"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Run automated DQ checks at every Bronze-to-Silver and Silver-to-Gold boundary</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Route failed records to a quarantine/dead-letter table with reason codes</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Monitor DQ metrics over time to detect drift (gradual degradation)</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Drop bad records silently — it hides systematic upstream problems</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Only run DQ checks manually after a business incident</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use the same DQ thresholds for all columns — critical columns need stricter rules</div>
            </div>
          </div>

          <Quiz topicId="data-quality" questions={[
    {
      question: "A Silver pipeline runs daily and the order_id null rate has gradually increased from 0.01% to 3% over 30 days. Nobody noticed until a Gold report was wrong. What DQ process failure occurred?",
      options: [
              "The DQ check thresholds were too strict",
              "No trend monitoring — a static threshold check (is null rate &lt; 5%?) would pass at 3%, but a trend-based alert (null rate increased 30x in 30 days) would have fired on day 5 when it crossed 0.1%",
              "Great Expectations was not installed",
              "The pipeline was running too frequently"
      ],
      correct: 1,
      explanation: "Point-in-time checks miss gradual drift. Add trend monitoring: alert if a metric changes by more than X% from its rolling 7-day average — catches slow degradation before it becomes a business incident"
    },
    {
      question: "You implement a DQ check: expect_column_values_to_be_between('amount', 0, 1000000). A batch has 0.003% of rows with amount=-0.01 (refund reversal bug). Should the pipeline halt or continue?",
      options: [
              "Always halt on any DQ failure",
              "It depends on the defined severity: a 0.003% failure rate might be WARNING (continue, quarantine bad rows, alert) rather than ERROR (halt). Critical pipelines halt on any failure; analytical pipelines often continue with quarantine",
              "Always continue — small failure rates are acceptable",
              "Delete the failing rows and continue"
      ],
      correct: 1,
      explanation: "DQ check severity is a business decision: 0.003% bad rows in a revenue report might warrant quarantine + alert, not a full pipeline halt. Define ERROR vs WARNING thresholds per column based on business impact"
    },
    {
      question: "What is the key advantage of Deequ over running DQ checks in Pandas for a 10TB Silver table?",
      options: [
              "Deequ has more check types than Pandas",
              "Deequ runs distributed on the Spark cluster — checks execute as Spark jobs across all partitions simultaneously. Converting 10TB to Pandas would require a single machine with 10TB+ RAM, which is impossible",
              "Deequ automatically fixes data quality issues",
              "Deequ integrates with more BI tools"
      ],
      correct: 1,
      explanation: "Scale is the key: Pandas operates on a single machine's memory; Deequ distributes checks across the entire Spark cluster. For TB-scale data, only distributed DQ frameworks work"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('data-quality')) { await unmarkTopicComplete('data-quality'); onUnmark('data-quality') } else { await markTopicComplete('data-quality'); onComplete('data-quality') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('data-quality') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('data-quality') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* DATA GOVERNANCE */}
        <section id="data-governance" ref={el => { if (el) sectionRefs.current['data-governance'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Data Governance</h1>
            <p className="topic-desc">Data governance is the framework of policies, roles, and processes that ensure data is trustworthy, secure, and compliant. As a data engineer, you implement governance  -  cataloguing assets, enforcing lineage, masking PII, and building the infrastructure for regulatory compliance.</p>
          </div>

          <DataGovernanceDiagram />
          <DataGovernanceAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Core Components</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { name: 'Data Catalog', icon: '📚', desc: 'Searchable inventory of all data assets  -  tables, columns, owners, descriptions, tags. Azure Purview / Unity Catalog / Apache Atlas. Enables data discovery.' },
              { name: 'Data Lineage', icon: '🔀', desc: 'Tracks the origin and transformation of data. Which pipeline created this table? Which source fed it? Essential for impact analysis and debugging.' },
              { name: 'Data Stewardship', icon: '👤', desc: 'Human accountability for data quality and governance. Data owners define policies; stewards enforce them. Critical for compliance.' },
              { name: 'Metadata Management', icon: '🏷️', desc: 'Technical metadata (schema, size, stats) + business metadata (description, owner, sensitivity level). Unity Catalog centralises this in Databricks.' },
              { name: 'PII Classification', icon: '🔒', desc: 'Identify columns containing PII: name, email, SSN, DOB, IP address, location. Tag in catalog, restrict access, apply masking.' },
              { name: 'Access Control', icon: '🛡️', desc: 'Column-level and row-level security. Unity Catalog grants/revokes. Role-based access control (RBAC). Principle of least privilege.' },
            ].map(c => (
              <div key={c.name} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 6 }}>{c.name}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>GDPR and CCPA Implications for Data Engineers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {[
              { rule: 'Right to Erasure (GDPR Art. 17)', impl: 'Must delete all PII for a user on request. In Delta Lake: use DELETE + VACUUM. In append-only Bronze: use Delta\'s GDPR delete pattern with tombstone records.' },
              { rule: 'Data Minimisation', impl: 'Only collect/store data needed for declared purpose. Don\'t ingest unnecessary columns. Enforce at ingestion layer.' },
              { rule: 'Purpose Limitation', impl: 'Tag each dataset with processing purpose in catalog. Prevent use for undeclared purposes via access controls.' },
              { rule: 'Data Retention', impl: 'Define retention policies per dataset. Automate deletion after retention period. Log all retention actions for audit trail.' },
              { rule: 'Cross-Border Transfers', impl: 'Ensure EU citizen data stays in EU regions (Azure West Europe / North Europe). Use data residency configs in Azure Purview.' },
            ].map(r => (
              <div key={r.rule} style={{ display: 'flex', gap: 14, padding: '12px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--blue-700)', minWidth: 260, flexShrink: 0 }}>{r.rule}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.impl}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>Data Masking Strategies</h3>
          <CodeBlock lang="python">{`from pyspark.sql.functions import *

# 1. NULLIFICATION  -  replace with NULL (most aggressive)
df = df.withColumn("ssn", lit(None).cast("string"))

# 2. PSEUDONYMISATION  -  replace with consistent hash (re-linkable with key)
df = df.withColumn("customer_id_masked", sha2(concat(col("customer_id"), lit("SECRET_SALT")), 256))

# 3. TOKENISATION  -  replace with random token, store mapping in separate secure vault
# Real value: john.doe@example.com → Token: TKN-8f4a2b91

# 4. DATA MASKING  -  partial visibility
df = df.withColumn("email_masked",
    concat(substring("email", 1, 3), lit("***@***"), substring_index("email", ".", -1)))
# john.doe@example.com → joh***@***.com

# 5. GENERALISATION  -  reduce precision
df = df.withColumn("age_range",
    when(col("age") < 18, "<18")
    .when(col("age") < 30, "18-29")
    .when(col("age") < 50, "30-49")
    .otherwise("50+"))
df = df.withColumn("city", lit(None))  # replace exact location with NULL
df = df.withColumn("country", col("country"))  # keep country only

# Unity Catalog  -  column masking policy (Databricks)
spark.sql("""
    CREATE OR REPLACE FUNCTION mask_email(email STRING)
    RETURNS STRING
    RETURN CASE WHEN is_account_group_member('pii_readers') THEN email
                ELSE concat(left(email, 3), '***@***.', split(email, '\\.')[size(split(email, '\\.'))-1])
           END;

    ALTER TABLE silver.customers
    ALTER COLUMN email SET MASK mask_email;
""")`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"How would you implement GDPR's right to erasure in a Delta Lake environment?"</li>
              <li>"What is data lineage and how does it help with debugging?"</li>
              <li>"A new dataset contains PII — what governance steps do you take before it enters your lakehouse?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Data governance has moved from a compliance checkbox to a core engineering responsibility. They want to see you understand that governance is implemented in code: Unity Catalog for access control, Delta Lake VACUUM for GDPR deletion, column masking functions for PII, and data lineage captured by your orchestration tool. They also check whether you know the difference between pseudonymisation (reversible with key) and anonymisation (irreversible) — relevant for GDPR compliance assessments.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Classify first</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Tag every column with sensitivity level (PII, PCI, public) before writing to the catalog"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Enforce at the platform layer</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Unity Catalog column masking, row filters, and RBAC — not just application-level checks"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Build GDPR operations</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Right to erasure: DELETE + VACUUM in Delta; audit log of all delete operations; test quarterly"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Databricks Unity Catalog implements column-level security using masking policies — non-PII-readers see joh***@***.com instead of john@example.com with zero application code changes. At ING Bank, every new table ingested into their Azure Data Lake requires a completed Data Protection Impact Assessment (DPIA) before the pipeline can be promoted to production — enforced via a catalog registration step in their CI/CD pipeline. LinkedIn's DataHub tracks complete column-level lineage across 400,000 dataset assets, enabling engineers to answer 'who consumes this column?' before making a schema change.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"We mask PII in the application layer"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"Application-layer masking breaks when someone queries the table directly. I implement governance at the platform layer: Unity Catalog column masking policies so non-privileged roles never see raw PII regardless of query tool. I track lineage through the catalog so I know which Gold tables consume a given Silver column before I change it. For GDPR deletion I use Delta's DELETE + VACUUM with a documented SLA and audit trail"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Classify PII columns in the data catalog before ingestion</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use platform-layer access control (Unity Catalog) not application-layer only</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Document and test GDPR deletion procedures quarterly</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Assume application-layer masking is sufficient — direct SQL bypasses it</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Store PII in Bronze without classification and masking in Silver</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Conflate pseudonymisation with anonymisation — they have different GDPR implications</div>
            </div>
          </div>

          <Quiz topicId="data-governance" questions={[
    {
      question: "Under GDPR Article 17 (Right to Erasure), a user requests deletion of all their data. Your pipeline stores data in: Bronze (Delta, append-only), Silver (Delta, with MERGE), Gold (Delta, aggregated). What must you do?",
      options: [
              "Delete from Silver and Gold only — Bronze is append-only and cannot be modified",
              "Delete from all three layers: Silver and Gold with DELETE statements + VACUUM; Bronze with a deletion vector or replacing the affected files + VACUUM. Document and audit every deletion with timestamp",
              "Delete from Gold only — this is the user-facing layer",
              "Anonymise the data in Bronze instead of deleting it"
      ],
      correct: 1,
      explanation: "GDPR requires deletion across ALL systems holding the data, including Bronze. Delta Lake supports this via DELETE + VACUUM (which physically removes the files after the retention period). Using Delta's Change Data Feed or deletion vectors makes this more efficient"
    },
    {
      question: "A data engineer builds a column masking function in Unity Catalog that shows full email to 'pii_readers' group and masked email to others. An analyst with no special permissions runs SELECT email FROM silver.customers. What do they see?",
      options: [
              "An error — they cannot query the table",
              "The full email — masking only works in the application layer",
              "The masked email (e.g. joh***@***.com) — Unity Catalog applies the masking function transparently at query execution time regardless of the query tool used",
              "NULL — masked columns always return NULL"
      ],
      correct: 2,
      explanation: "Unity Catalog column masking is enforced at the SQL execution layer — it applies to all queries regardless of tool (SQL Editor, Tableau, Python, REST API). This is why platform-layer governance is stronger than application-layer"
    },
    {
      question: "What is the difference between data lineage and data cataloguing?",
      options: [
              "They are the same thing",
              "A data catalog inventories assets (what tables exist, their schemas, owners, descriptions). Data lineage tracks the transformation graph (table B was derived from table A by pipeline X on date Y). Lineage answers 'where did this data come from and who consumes it?'; the catalog answers 'what data assets exist and what do they mean?'",
              "Lineage is for GDPR, cataloguing is for BI",
              "Cataloguing is automated, lineage requires manual documentation"
      ],
      correct: 1,
      explanation: "Catalog = inventory (what exists). Lineage = provenance graph (where it came from and where it flows). Both are needed: catalog for discovery, lineage for impact analysis and debugging"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('data-governance')) { await unmarkTopicComplete('data-governance'); onUnmark('data-governance') } else { await markTopicComplete('data-governance'); onComplete('data-governance') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('data-governance') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('data-governance') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* BATCH VS STREAMING */}
        <section id="batch-vs-streaming" ref={el => { if (el) sectionRefs.current['batch-vs-streaming'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Batch vs Streaming</h1>
            <p className="topic-desc">Batch and streaming are two fundamentally different processing paradigms, each with distinct tradeoffs. Most enterprise data platforms use both. Knowing when to choose each  -  and how they combine  -  is essential architectural knowledge.</p>
          </div>

          <BatchStreamDiagram />
          <BatchStreamAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Side-by-Side Comparison</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: 18 }}>
              <div style={{ fontWeight: 800, color: '#1d4ed8', marginBottom: 10, fontSize: '1rem' }}>Batch Processing</div>
              <ul style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 2, margin: 0, paddingLeft: 18 }}>
                <li>Processes a bounded dataset at scheduled intervals</li>
                <li>Latency: minutes to hours (typically nightly)</li>
                <li>High throughput  -  optimised for large volumes</li>
                <li>Simple to reason about  -  no partial state</li>
                <li>Easy to rerun / reprocess on failure</li>
                <li>Tools: Spark, dbt, ADF Copy Activity, SQL jobs</li>
                <li>Use for: daily reports, DWH loads, ML training</li>
              </ul>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: 18 }}>
              <div style={{ fontWeight: 800, color: '#15803d', marginBottom: 10, fontSize: '1rem' }}>Streaming Processing</div>
              <ul style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 2, margin: 0, paddingLeft: 18 }}>
                <li>Processes unbounded data as it arrives</li>
                <li>Latency: milliseconds to seconds</li>
                <li>Lower throughput per unit time (smaller batches)</li>
                <li>More complex  -  handles late data, ordering, state</li>
                <li>Checkpoints enable fault tolerance</li>
                <li>Tools: Spark Structured Streaming, Flink, Kafka Streams</li>
                <li>Use for: fraud detection, real-time dashboards, alerts</li>
              </ul>
            </div>
          </div>

          <h3 style={{ marginBottom: 12 }}>Architectural Patterns</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 8 }}>Lambda Architecture</div>
              <p style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                Two parallel processing paths: <strong>Batch layer</strong> (reprocesses all historical data, high accuracy) + <strong>Speed layer</strong> (processes recent data with low latency). A <strong>serving layer</strong> merges both. Downside: you maintain two codebases for the same logic. Now largely superseded.
              </p>
              <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--text-muted)', background: 'var(--gray-50)', borderRadius: 6, padding: '8px 12px' }}>
                Source → [Batch: Spark → DWH] + [Speed: Kafka → Redis] → Serving Layer merges both
              </div>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 8 }}>Kappa Architecture</div>
              <p style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                Single processing path  -  streaming only. Reprocessing is done by replaying the event log (Kafka retention). Same code for real-time and historical. Simpler to maintain. Requires durable, replayable event store.
              </p>
              <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--text-muted)', background: 'var(--gray-50)', borderRadius: 6, padding: '8px 12px' }}>
                Source → Kafka (durable, replayable) → Spark Structured Streaming → Delta Lake (Medallion)
              </div>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 8 }}>Micro-Batch (Spark Structured Streaming default)</div>
              <p style={{ fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                Processes data in small batches every few seconds to minutes. Not true streaming (not record-by-record) but achieves near-real-time latency with batch semantics. Simpler exactly-once guarantees. Databricks Auto Loader uses this pattern.
              </p>
              <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--text-muted)', background: 'var(--gray-50)', borderRadius: 6, padding: '8px 12px' }}>
                trigger(processingTime='30 seconds')  -  process every 30s micro-batch
              </div>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Latency vs Throughput tradeoff:</strong> Streaming achieves low latency by processing small amounts of data frequently  -  but each processing cycle has fixed overhead (checkpoint, shuffle). Batch amortises this overhead over millions of rows  -  far higher throughput per CPU cycle. The right choice depends on your SLA: if you need data in &lt;60 seconds, stream. If hourly is fine, batch is simpler and cheaper.
            </div>
          </div>

          <CodeBlock lang="python">{`# ─── BATCH: Spark job (runs once, processes bounded dataset) ─────────────────
from pyspark.sql import SparkSession
from pyspark.sql.functions import *

spark = SparkSession.builder.appName("DailyRevenue").getOrCreate()

df = (spark.read.format("delta").table("silver.orders")
      .filter(col("order_date") == current_date() - 1)   # yesterday
      .groupBy("customer_tier", "country")
      .agg(sum("amount").alias("revenue"), count("*").alias("orders"))
      .withColumn("processed_at", current_timestamp()))

df.write.format("delta").mode("overwrite") \
    .option("replaceWhere", f"order_date = '{yesterday}'") \
    .saveAsTable("gold.daily_revenue")

# ─── STREAMING: Spark Structured Streaming (runs continuously) ───────────────
from pyspark.sql.functions import window

stream_df = (spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "kafka:9092")
    .option("subscribe", "orders")
    .option("startingOffsets", "latest")
    .load()
    .select(from_json(col("value").cast("string"), order_schema).alias("data"))
    .select("data.*")
    .withColumn("event_time", to_timestamp("event_time_str")))

# Windowed aggregation with watermark (handles late data up to 10 minutes late)
windowed = (stream_df
    .withWatermark("event_time", "10 minutes")   # drop data > 10 min late
    .groupBy(
        window("event_time", "5 minutes"),        # 5-minute tumbling windows
        "country"
    )
    .agg(sum("amount").alias("revenue_5min"), count("*").alias("order_count")))

(windowed.writeStream
    .format("delta")
    .outputMode("append")                         # only emit completed windows
    .option("checkpointLocation", "/checkpoints/streaming/revenue")
    .trigger(processingTime="30 seconds")         # micro-batch every 30s
    .table("gold.revenue_realtime"))

# ─── availableNow=True: process all backlog then stop (batch-mode streaming) ──
(spark.readStream.table("bronze.orders")
    .writeStream.format("delta")
    .option("checkpointLocation", "/checkpoints/silver/orders")
    .trigger(availableNow=True)   # idiomatic replacement for batch jobs in Databricks
    .table("silver.orders"))`}</CodeBlock>

          
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Interview Triggers</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>"When would you choose streaming over batch for a data pipeline?"</li>
              <li>"Explain watermarks in Spark Structured Streaming"</li>
              <li>"What is the main operational complexity that Lambda Architecture introduces?"</li>
              </ul>
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>What Interviewers Actually Want</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>They want to see that you make the batch vs streaming decision based on latency requirements and complexity tolerance — not because 'streaming is modern'. Batch is simpler, cheaper, and easier to reprocess. Streaming adds state management, watermarks, late data handling, and checkpoint maintenance. The right answer usually involves micro-batch (Databricks availableNow trigger) for most 'near real-time' use cases, reserving true streaming for genuine sub-minute SLAs. They also check whether you know the Kappa architecture argument: one streaming codebase is simpler to maintain than Lambda's two.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>60-Second Framework</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: 40 }}>Step</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>What to Say</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Example</th>
                </tr>
              </thead>
              <tbody>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>1</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Ask the latency requirement</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"What is the maximum acceptable data delay? &lt;1 minute → streaming; &lt;1 hour → micro-batch; daily → batch"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>2</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>State the complexity tradeoff</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Streaming adds: watermarks for late data, stateful operations, checkpoint management, exactly-once semantics"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>3</td>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Recommend the simplest sufficient solution</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>"Databricks availableNow trigger gives near-real-time with batch semantics — often the right choice over full streaming"</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div className="callout callout-example">
            <span className="callout-icon">🏭</span>
            <div className="callout-body">
              <strong>In Production</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.7, fontSize: '.9rem' }}>Netflix uses Kafka + Flink for their real-time viewing analytics (updating play count within 30 seconds) but uses batch Spark for their daily recommendation model training — they chose streaming where latency mattered and batch where it didn't. Uber's surge pricing engine uses Spark Structured Streaming with 10-second micro-batches to aggregate ride requests by geohash — true streaming was not needed since 10-second latency was sufficient. LinkedIn's Kappa architecture for activity feeds uses Kafka as the durable log and Samza (stream processor) as the single processing engine for both real-time and historical reprocessing.</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '24px 0 10px' }}>Junior vs Senior Phrasing</h3>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Junior Says</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>Senior Says</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"We should use streaming because it's faster"</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>"I start by asking what the latency SLA is. If the business needs data within 30 seconds, we need streaming. If hourly is fine, micro-batch or batch is simpler, cheaper, and easier to debug. Streaming adds real complexity: watermarks for late data, stateful aggregations, checkpoint recovery. I'll only introduce that complexity when the latency requirement justifies it"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>Do</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use batch when hourly or daily latency is acceptable — it is simpler</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Use Databricks availableNow trigger as a middle ground (near-real-time with batch semantics)</div>
              <div className="card card-success" style={{ fontSize: ".85rem" }}>✅ Set watermarks to handle late-arriving data in streaming jobs</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>Don't</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Use streaming just because it sounds more modern or impressive</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Build Lambda Architecture (dual batch + streaming codebases) when Kappa (single streaming) suffices</div>
              <div className="card card-warning" style={{ fontSize: ".85rem" }}>❌ Ignore late data handling in streaming — it silently drops events that arrive after window close</div>
            </div>
          </div>

          <Quiz topicId="batch-vs-streaming" questions={[
    {
      question: "A fraud detection system needs to flag suspicious transactions within 45 seconds of the transaction occurring. Which architecture best meets this requirement?",
      options: [
              "Nightly batch job — simpler and cheaper",
              "Spark Structured Streaming with a 30-second micro-batch trigger consuming from Kafka — 30-second processing + 15-second buffer fits the 45-second SLA with low operational complexity",
              "Lambda Architecture with both batch and streaming",
              "Store-and-forward batch running every 5 minutes"
      ],
      correct: 1,
      explanation: "45-second SLA requires streaming or micro-batch. 30-second trigger provides results within 30-60 seconds of event arrival. Lambda adds unnecessary complexity when a single streaming path suffices"
    },
    {
      question: "A Spark Structured Streaming job groups events by 5-minute windows. An event arrives 12 minutes late (after the window should have closed). You have set withWatermark('event_time', '10 minutes'). What happens to this event?",
      options: [
              "The event is processed and included in the window",
              "The event is dropped — it arrived more than 10 minutes after the watermark, so the window has been finalised and evicted from state. The watermark controls how long late data is accepted",
              "The event opens a new window",
              "The event is stored in quarantine"
      ],
      correct: 1,
      explanation: "Watermark = how long to wait for late data. Event 12 minutes late with 10-minute watermark: the window is already closed and state evicted. The event is dropped. Set watermark based on your late-arrival SLA"
    },
    {
      question: "What is the primary operational advantage of Kappa Architecture over Lambda Architecture?",
      options: [
              "Kappa is always faster than Lambda",
              "Kappa uses a single processing codebase (streaming only) — Lambda requires maintaining two separate implementations of the same business logic (batch layer + speed layer), doubling the surface area for bugs, tests, and deployments",
              "Kappa uses less storage",
              "Lambda does not support exactly-once semantics"
      ],
      correct: 1,
      explanation: "Lambda's main cost is code duplication: the same transformation logic must be written and maintained in both the batch layer (Spark batch) and speed layer (Kafka Streams/Flink). Kappa eliminates this by using a replayable event log (Kafka) as the single source for both real-time and historical processing"
    },
          ]} />
          <button onClick={async () => { try { if (completed.has('batch-vs-streaming')) { await unmarkTopicComplete('batch-vs-streaming'); onUnmark('batch-vs-streaming') } else { await markTopicComplete('batch-vs-streaming'); onComplete('batch-vs-streaming') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('batch-vs-streaming') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('batch-vs-streaming') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────── DIAGRAM COMPONENTS

function BinaryDiagram() {
  const rows = [{bin:'00000000',hex:'00',dec:'0'},{bin:'00000001',hex:'01',dec:'1'},{bin:'01111111',hex:'7F',dec:'127'},{bin:'11111111',hex:'FF',dec:'255'}]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 560 160" width="100%" style={{display:'block'}}>
        <text x="10" y="18" fontSize="11" fontWeight="700" fill="#1e293b">1 byte = 8 bits</text>
        {[0,1,2,3,4,5,6,7].map(i=>(
          <g key={i}>
            <rect x={10+i*62} y={24} width={54} height={28} rx="5" fill={i<4?'#4f8ef7':'#8b5cf6'} opacity=".15" stroke={i<4?'#4f8ef7':'#8b5cf6'} strokeWidth="1.5"/>
            <text x={37+i*62} y={42} fontSize="13" fontWeight="700" fill={i<4?'#4f8ef7':'#8b5cf6'} textAnchor="middle">b{7-i}</text>
          </g>
        ))}
        <text x="10" y="72" fontSize="9" fill="#64748b">Bit position (b7=MSB … b0=LSB)</text>
        <text x="10" y="92" fontSize="10" fontWeight="700" fill="#1e293b">Common values:</text>
        <rect x="10" y="98" width="540" height="16" rx="3" fill="#f1f5f9"/>
        {['Binary','Hex','Decimal'].map((h,i)=><text key={h} x={10+i*185} y="110" fontSize="9" fontWeight="700" fill="#475569">{h}</text>)}
        {rows.map((r,i)=>(
          <g key={r.dec}>
            <rect x="10" y={116+i*11} width="540" height="10" rx="2" fill={i%2===0?'#f8fafc':'white'}/>
            <text x="10" y={124+i*11} fontSize="9" fontFamily="monospace" fill="#1e293b">{r.bin}</text>
            <text x="195" y={124+i*11} fontSize="9" fontFamily="monospace" fill="#8b5cf6">{r.hex}</text>
            <text x="380" y={124+i*11} fontSize="9" fill="#1e293b">{r.dec}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function CPUDiagram() {
  const layers = [
    {label:'CPU Registers',sub:'~10 bytes · 0.3 ns',color:'#ef4444',h:22},
    {label:'L1 Cache',sub:'32–64 KB · 1 ns',color:'#f59e0b',h:22},
    {label:'L2 Cache',sub:'256 KB–1 MB · 5 ns',color:'#4f8ef7',h:22},
    {label:'L3 Cache',sub:'4–32 MB · 10 ns',color:'#8b5cf6',h:22},
    {label:'RAM (DRAM)',sub:'8–64 GB · 60–100 ns',color:'#22c55e',h:22},
    {label:'SSD / NVMe',sub:'256 GB–4 TB · 100 µs',color:'#64748b',h:22},
  ]
  let y = 10
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 205" width="100%" style={{display:'block'}}>
        <text x="8" y="12" fontSize="11" fontWeight="700" fill="#1e293b">Memory Hierarchy — Latency Pyramid</text>
        {layers.map((l,i)=>{
          const w=80+i*55; const x=(480-w)/2; const top=y; y+=l.h+5
          return (
            <g key={l.label}>
              <rect x={x} y={top+16} width={w} height={l.h} rx="4" fill={l.color} opacity=".18" stroke={l.color} strokeWidth="1.5"/>
              <text x={240} y={top+16+l.h/2+4} fontSize="10" fontWeight="700" fill={l.color} textAnchor="middle">{l.label}</text>
              <text x={x+w+6} y={top+16+l.h/2+4} fontSize="8" fill="#64748b">{l.sub}</text>
            </g>
          )
        })}
        <text x="8" y="198" fontSize="8" fill="#94a3b8">Faster + smaller ↑    Slower + larger ↓</text>
      </svg>
    </div>
  )
}

function MemoryDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 160" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Stack vs Heap Memory</text>
        {/* Stack */}
        <rect x="20" y="22" width="190" height="130" rx="6" fill="#4f8ef7" opacity=".08" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="115" y="36" fontSize="10" fontWeight="700" fill="#4f8ef7" textAnchor="middle">STACK</text>
        <text x="115" y="47" fontSize="8" fill="#64748b" textAnchor="middle">Fixed size · LIFO · Fast</text>
        {['main() frame','fn() frame','inner() frame'].map((f,i)=>(
          <g key={f}>
            <rect x="30" y={55+i*28} width="170" height="22" rx="3" fill="#4f8ef7" opacity={0.15+i*0.1} stroke="#4f8ef7" strokeWidth="1"/>
            <text x="115" y={70+i*28} fontSize="9" fill="#1e293b" textAnchor="middle">{f}</text>
          </g>
        ))}
        <text x="115" y="148" fontSize="8" fill="#4f8ef7" textAnchor="middle">← grows down</text>
        {/* Heap */}
        <rect x="270" y="22" width="190" height="130" rx="6" fill="#22c55e" opacity=".08" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="365" y="36" fontSize="10" fontWeight="700" fill="#22c55e" textAnchor="middle">HEAP</text>
        <text x="365" y="47" fontSize="8" fill="#64748b" textAnchor="middle">Dynamic · GC-managed · Flexible</text>
        {[{l:'Object A',x:280,y:55,w:80,h:20},{l:'List[1,2,3]',x:350,y:60,w:90,h:22},{l:'Dict{}',x:285,y:88,w:60,h:20},{l:'String',x:360,y:95,w:70,h:18}].map(o=>(
          <g key={o.l}>
            <rect x={o.x} y={o.y} width={o.w} height={o.h} rx="3" fill="#22c55e" opacity=".2" stroke="#22c55e" strokeWidth="1"/>
            <text x={o.x+o.w/2} y={o.y+o.h/2+4} fontSize="8" fill="#1e293b" textAnchor="middle">{o.l}</text>
          </g>
        ))}
        <text x="365" y="148" fontSize="8" fill="#22c55e" textAnchor="middle">grows up →</text>
      </svg>
    </div>
  )
}

function StorageDiagram() {
  const tiers = [
    {label:'CPU Registers',cap:'Bytes',speed:'0.3 ns',color:'#ef4444'},
    {label:'CPU Cache (L1-L3)',cap:'KB–MB',speed:'1–40 ns',color:'#f59e0b'},
    {label:'RAM',cap:'GB',speed:'100 ns',color:'#4f8ef7'},
    {label:'NVMe SSD',cap:'TB',speed:'100 µs',color:'#8b5cf6'},
    {label:'HDD',cap:'TB',speed:'5–10 ms',color:'#22c55e'},
    {label:'Cloud Object Store',cap:'Unlimited',speed:'100–200 ms',color:'#64748b'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 175" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Storage Hierarchy</text>
        {tiers.map((t,i)=>(
          <g key={t.label}>
            <rect x="8" y={20+i*24} width="220" height="18" rx="3" fill={t.color} opacity=".18" stroke={t.color} strokeWidth="1.2"/>
            <text x="118" y={33+i*24} fontSize="9" fontWeight="600" fill="#1e293b" textAnchor="middle">{t.label}</text>
            <text x="240" y={33+i*24} fontSize="9" fill="#64748b">{t.cap}</text>
            <text x="340" y={33+i*24} fontSize="9" fontFamily="monospace" fill={t.color}>{t.speed}</text>
          </g>
        ))}
        <text x="8" y="170" fontSize="8" fill="#94a3b8">← Faster / smaller / more expensive  →  Slower / larger / cheaper</text>
      </svg>
    </div>
  )
}

function OSDiagram() {
  const layers = [
    {label:'User Programs (Python, Java, bash)',color:'#4f8ef7'},
    {label:'System Call Interface (open, read, write, fork…)',color:'#8b5cf6'},
    {label:'Kernel (process/memory/file/network mgmt)',color:'#f59e0b'},
    {label:'Hardware (CPU, RAM, Disk, NIC)',color:'#22c55e'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 140" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Operating System Layers</text>
        {layers.map((l,i)=>(
          <g key={l.label}>
            <rect x="20" y={20+i*26} width="460" height="20" rx="4" fill={l.color} opacity=".18" stroke={l.color} strokeWidth="1.5"/>
            <text x="250" y={34+i*26} fontSize="9" fontWeight="600" fill="#1e293b" textAnchor="middle">{l.label}</text>
          </g>
        ))}
        <line x1="250" y1="115" x2="250" y2="125" stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arr)"/>
        <text x="250" y="136" fontSize="8" fill="#94a3b8" textAnchor="middle">syscall crosses user↔kernel boundary</text>
      </svg>
    </div>
  )
}

function LinuxDiagram() {
  const cmds = ['ls -la','grep "\\.py"','sort','head -10']
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 80" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Linux Pipe Pipeline</text>
        {cmds.map((c,i)=>(
          <g key={c}>
            <rect x={10+i*125} y="22" width="110" height="32" rx="6" fill="#1e293b" stroke="#4f8ef7" strokeWidth="1.5"/>
            <text x={65+i*125} y="42" fontSize="10" fontFamily="monospace" fill="#a5f3fc" textAnchor="middle">{c}</text>
            {i<cmds.length-1&&<>
              <line x1={120+i*125} y1="38" x2={135+i*125} y2="38" stroke="#4f8ef7" strokeWidth="2"/>
              <polygon points={`${135+i*125},34 ${135+i*125},42 ${142+i*125},38`} fill="#4f8ef7"/>
              <text x={128+i*125} y="30" fontSize="8" fill="#f59e0b" textAnchor="middle">|</text>
            </>}
          </g>
        ))}
        <text x="8" y="75" fontSize="8" fill="#64748b">stdout of each command pipes to stdin of the next</text>
      </svg>
    </div>
  )
}

function NetworkingDiagram() {
  const layers = [
    {n:'Application',ex:'HTTP, gRPC, S3 API',color:'#4f8ef7'},
    {n:'Transport',ex:'TCP (reliable), UDP (fast)',color:'#8b5cf6'},
    {n:'Network',ex:'IP addressing, routing',color:'#f59e0b'},
    {n:'Link / Physical',ex:'Ethernet, Wi-Fi, frames',color:'#22c55e'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 130" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">TCP/IP Network Layers</text>
        {layers.map((l,i)=>(
          <g key={l.n}>
            <rect x="20" y={20+i*26} width="340" height="20" rx="4" fill={l.color} opacity=".18" stroke={l.color} strokeWidth="1.5"/>
            <text x="30" y={34+i*26} fontSize="9" fontWeight="700" fill={l.color}>{l.n}</text>
            <text x="160" y={34+i*26} fontSize="8" fill="#64748b">{l.ex}</text>
          </g>
        ))}
        <text x="380" y="35" fontSize="9" fill="#4f8ef7" fontWeight="700">Send</text>
        <line x1="390" y1="40" x2="390" y2="112" stroke="#4f8ef7" strokeWidth="1.5" strokeDasharray="4 2"/>
        <polygon points="386,108 394,108 390,116" fill="#4f8ef7"/>
        <text x="410" y="35" fontSize="9" fill="#22c55e" fontWeight="700">Receive</text>
        <line x1="460" y1="116" x2="460" y2="40" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2"/>
        <polygon points="456,44 464,44 460,36" fill="#22c55e"/>
        <text x="8" y="126" fontSize="8" fill="#94a3b8">Each layer adds/removes headers (encapsulation / decapsulation)</text>
      </svg>
    </div>
  )
}

function DockerDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 155" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Container Isolation</text>
        {/* Container A */}
        <rect x="15" y="22" width="200" height="72" rx="6" fill="#4f8ef7" opacity=".1" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="115" y="36" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Container A</text>
        {['App Code','Libraries','Python 3.11 Runtime'].map((l,i)=><rect key={l} x="25" y={40+i*16} width="180" height="12" rx="2" fill="#4f8ef7" opacity=".25" stroke="#4f8ef7" strokeWidth=".8"><title>{l}</title></rect>)}
        {['App Code','Libraries','Python 3.11 Runtime'].map((l,i)=><text key={l+'-t'} x="115" y={50+i*16} fontSize="8" fill="#1e293b" textAnchor="middle">{l}</text>)}
        {/* Container B */}
        <rect x="285" y="22" width="200" height="72" rx="6" fill="#8b5cf6" opacity=".1" stroke="#8b5cf6" strokeWidth="1.5"/>
        <text x="385" y="36" fontSize="9" fontWeight="700" fill="#8b5cf6" textAnchor="middle">Container B</text>
        {['App Code','Deps','Node 20 Runtime'].map((l,i)=><rect key={l} x="295" y={40+i*16} width="180" height="12" rx="2" fill="#8b5cf6" opacity=".25" stroke="#8b5cf6" strokeWidth=".8"/>)}
        {['App Code','Deps','Node 20 Runtime'].map((l,i)=><text key={l+'-t'} x="385" y={50+i*16} fontSize="8" fill="#1e293b" textAnchor="middle">{l}</text>)}
        {/* Docker Engine */}
        <rect x="15" y="100" width="470" height="22" rx="4" fill="#f59e0b" opacity=".18" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="250" y="115" fontSize="9" fontWeight="700" fill="#f59e0b" textAnchor="middle">Docker Engine (container runtime)</text>
        {/* Host OS */}
        <rect x="15" y="128" width="470" height="18" rx="4" fill="#22c55e" opacity=".18" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="250" y="141" fontSize="9" fontWeight="700" fill="#22c55e" textAnchor="middle">Host OS Kernel + Hardware</text>
      </svg>
    </div>
  )
}

function DataTypesDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 140" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Python Type Hierarchy</text>
        <rect x="195" y="22" width="110" height="18" rx="4" fill="#1e293b" opacity=".08" stroke="#1e293b" strokeWidth="1.2"/>
        <text x="250" y="34" fontSize="9" fontWeight="700" fill="#1e293b" textAnchor="middle">object</text>
        {/* Primitives */}
        {['int','float','bool','str','bytes','None'].map((t,i)=>{
          const x=10+i*82; const y=58
          return (<g key={t}>
            <line x1="250" y1="40" x2={x+35} y2={y} stroke="#4f8ef7" strokeWidth="1" strokeDasharray="3 2"/>
            <rect x={x} y={y} width="72" height="16" rx="3" fill="#4f8ef7" opacity=".15" stroke="#4f8ef7" strokeWidth="1"/>
            <text x={x+36} y={y+11} fontSize="9" fontFamily="monospace" fill="#1e293b" textAnchor="middle">{t}</text>
          </g>)
        })}
        {/* Collections */}
        {['list','dict','set','tuple'].map((t,i)=>{
          const x=60+i*100; const y=92
          return (<g key={t}>
            <line x1="250" y1="40" x2={x+40} y2={y} stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 2"/>
            <rect x={x} y={y} width="80" height="16" rx="3" fill="#8b5cf6" opacity=".15" stroke="#8b5cf6" strokeWidth="1"/>
            <text x={x+40} y={y+11} fontSize="9" fontFamily="monospace" fill="#1e293b" textAnchor="middle">{t}</text>
          </g>)
        })}
        <text x="8" y="128" fontSize="8" fill="#4f8ef7">— Primitives (immutable)</text>
        <text x="160" y="128" fontSize="8" fill="#8b5cf6">— Collections (mutable except tuple)</text>
      </svg>
    </div>
  )
}

function FileFormatsDiagram() {
  const fmts = [
    {name:'CSV',desc:'Text · row-oriented · no schema · splittable',pros:'Human-readable, universal',cons:'No types, slow for analytics',color:'#f59e0b'},
    {name:'JSON',desc:'Text · nested · self-describing',pros:'Flexible schema, web-native',cons:'Verbose, slow to parse',color:'#4f8ef7'},
    {name:'Parquet',desc:'Binary · columnar · schema-embedded',pros:'Fast analytics, compression',cons:'Not human-readable',color:'#22c55e'},
    {name:'Delta',desc:'Parquet + transaction log',pros:'ACID, time travel, schema enforce',cons:'Needs Delta-aware reader',color:'#8b5cf6'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 160" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">File Format Comparison</text>
        {fmts.map((f,i)=>(
          <g key={f.name}>
            <rect x="8" y={20+i*34} width="50" height="26" rx="4" fill={f.color} opacity=".2" stroke={f.color} strokeWidth="1.5"/>
            <text x="33" y={37+i*34} fontSize="10" fontWeight="700" fill={f.color} textAnchor="middle">{f.name}</text>
            <text x="66" y={31+i*34} fontSize="8.5" fill="#64748b">{f.desc}</text>
            <text x="66" y={43+i*34} fontSize="8" fill="#16a34a">✓ {f.pros}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function CompressionDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 120" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Compression Algorithms</text>
        {[
          {name:'Snappy',ratio:'2–3×',speed:'Fastest',use:'Default Parquet/Spark',color:'#4f8ef7'},
          {name:'Gzip',ratio:'4–6×',speed:'Slow compress, fast decomp',use:'Cold storage, HTTP',color:'#8b5cf6'},
          {name:'Zstd',ratio:'3–5×',speed:'Fast+best ratio',use:'Parquet recommended',color:'#22c55e'},
          {name:'LZ4',ratio:'2–3×',speed:'Extremely fast',use:'Shuffle files, cache',color:'#f59e0b'},
        ].map((c,i)=>(
          <g key={c.name}>
            <rect x="8" y={20+i*22} width="60" height="16" rx="3" fill={c.color} opacity=".18" stroke={c.color} strokeWidth="1.2"/>
            <text x="38" y={32+i*22} fontSize="9" fontWeight="700" fill={c.color} textAnchor="middle">{c.name}</text>
            <text x="76" y={32+i*22} fontSize="8.5" fill="#1e293b">ratio: {c.ratio}</text>
            <text x="200" y={32+i*22} fontSize="8.5" fill="#64748b">speed: {c.speed}</text>
            <text x="390" y={32+i*22} fontSize="8.5" fill="#475569">use: {c.use}</text>
          </g>
        ))}
        <text x="8" y="115" fontSize="8" fill="#94a3b8">Trade-off: higher ratio ↔ slower compression speed</text>
      </svg>
    </div>
  )
}

function SerializationDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 100" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Serialization Flow</text>
        {/* Object */}
        <rect x="10" y="22" width="90" height="40" rx="6" fill="#4f8ef7" opacity=".15" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="55" y="38" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Python Object</text>
        <text x="55" y="52" fontSize="8" fill="#64748b" textAnchor="middle">{'{id:1, name:"x"}'}</text>
        {/* Serialize arrow */}
        <line x1="100" y1="42" x2="150" y2="42" stroke="#f59e0b" strokeWidth="2"/>
        <polygon points="147,38 155,42 147,46" fill="#f59e0b"/>
        <text x="125" y="36" fontSize="8" fill="#f59e0b" textAnchor="middle">serialize</text>
        {/* Bytes */}
        <rect x="155" y="22" width="100" height="40" rx="6" fill="#f59e0b" opacity=".15" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="205" y="38" fontSize="9" fontWeight="700" fill="#f59e0b" textAnchor="middle">Bytes on wire</text>
        <text x="205" y="52" fontSize="8" fontFamily="monospace" fill="#64748b" textAnchor="middle">0x00 0x01 0xF3…</text>
        {/* Deserialize arrow */}
        <line x1="255" y1="42" x2="305" y2="42" stroke="#22c55e" strokeWidth="2"/>
        <polygon points="302,38 310,42 302,46" fill="#22c55e"/>
        <text x="280" y="36" fontSize="8" fill="#22c55e" textAnchor="middle">deserialize</text>
        {/* Target Object */}
        <rect x="310" y="22" width="90" height="40" rx="6" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="355" y="38" fontSize="9" fontWeight="700" fill="#22c55e" textAnchor="middle">Target Object</text>
        <text x="355" y="52" fontSize="8" fill="#64748b" textAnchor="middle">Java / Go / Spark</text>
        {/* Format labels */}
        {['Avro','Protobuf','JSON','Parquet'].map((f,i)=>(
          <g key={f}>
            <rect x={410+i*0} y={22+i*18} width="50" height="13" rx="3" fill="#8b5cf6" opacity=".15" stroke="#8b5cf6" strokeWidth="1"/>
            <text x="435" y={32+i*18} fontSize="8" fill="#8b5cf6" textAnchor="middle">{f}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DatabasesDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 130" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">OLTP vs OLAP vs HTAP</text>
        {/* OLTP */}
        <circle cx="130" cy="75" r="55" fill="#4f8ef7" opacity=".12" stroke="#4f8ef7" strokeWidth="2"/>
        <text x="130" y="55" fontSize="10" fontWeight="700" fill="#4f8ef7" textAnchor="middle">OLTP</text>
        <text x="130" y="68" fontSize="8" fill="#475569" textAnchor="middle">Many small writes</text>
        <text x="130" y="79" fontSize="8" fill="#475569" textAnchor="middle">Normalized</text>
        <text x="130" y="90" fontSize="8" fill="#475569" textAnchor="middle">Transactional</text>
        {/* OLAP */}
        <circle cx="370" cy="75" r="55" fill="#8b5cf6" opacity=".12" stroke="#8b5cf6" strokeWidth="2"/>
        <text x="370" y="55" fontSize="10" fontWeight="700" fill="#8b5cf6" textAnchor="middle">OLAP</text>
        <text x="370" y="68" fontSize="8" fill="#475569" textAnchor="middle">Few large reads</text>
        <text x="370" y="79" fontSize="8" fill="#475569" textAnchor="middle">Denormalized</text>
        <text x="370" y="90" fontSize="8" fill="#475569" textAnchor="middle">Analytical</text>
        {/* HTAP overlap */}
        <text x="250" y="72" fontSize="9" fontWeight="700" fill="#f59e0b" textAnchor="middle">HTAP</text>
        <text x="250" y="84" fontSize="7.5" fill="#92400e" textAnchor="middle">both</text>
        <text x="8" y="126" fontSize="8" fill="#94a3b8">HTAP = Hybrid Transactional/Analytical (e.g. Databricks, Snowflake)</text>
      </svg>
    </div>
  )
}

function DataWarehouseDiagram() {
  const layers = [
    {label:'Source Systems',sub:'CRM, ERP, APIs, Files, Streams',color:'#64748b',rows:'raw events'},
    {label:'Bronze / Raw',sub:'Immutable, schema-on-read',color:'#f59e0b',rows:'billions of rows'},
    {label:'Silver / Cleaned',sub:'Deduplicated, typed, joined',color:'#4f8ef7',rows:'millions of rows'},
    {label:'Gold / Aggregated',sub:'Business KPIs, star schema',color:'#22c55e',rows:'thousands of rows'},
    {label:'BI / ML Consumers',sub:'Dashboards, models, reports',color:'#8b5cf6',rows:'queries'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 160" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Medallion Architecture Flow</text>
        {layers.map((l,i)=>(
          <g key={l.label}>
            <rect x="8" y={20+i*27} width="340" height="20" rx="4" fill={l.color} opacity=".18" stroke={l.color} strokeWidth="1.5"/>
            <text x="178" y={34+i*27} fontSize="9" fontWeight="600" fill="#1e293b" textAnchor="middle">{l.label}</text>
            <text x="356" y={34+i*27} fontSize="8" fill="#64748b">{l.sub}</text>
            <text x="490" y={34+i*27} fontSize="8" fill={l.color} textAnchor="end">{l.rows}</text>
            {i<layers.length-1&&<polygon points={`12,${40+i*27} 20,${40+i*27} 16,${47+i*27}`} fill={l.color} opacity=".6"/>}
          </g>
        ))}
      </svg>
    </div>
  )
}

function MedallionDiagram() {
  const zones = [
    {label:'Bronze',sub:'Raw ingest — immutable copy of source',rules:'No DQ gates — accept everything',color:'#f59e0b'},
    {label:'Silver',sub:'Clean, deduplicate, type-cast, join',rules:'NOT NULL, unique key, valid ranges',color:'#4f8ef7'},
    {label:'Gold',sub:'Business aggregations, KPIs',rules:'Schema match, row count vs yesterday ±20%',color:'#22c55e'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 130" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Medallion Zones + DQ Gates</text>
        {zones.map((z,i)=>(
          <g key={z.label}>
            <rect x={10+i*162} y="22" width="148" height="70" rx="6" fill={z.color} opacity=".12" stroke={z.color} strokeWidth="1.5"/>
            <text x={84+i*162} y="38" fontSize="11" fontWeight="800" fill={z.color} textAnchor="middle">{z.label}</text>
            <text x={84+i*162} y="52" fontSize="7.5" fill="#475569" textAnchor="middle">{z.sub}</text>
            <rect x={18+i*162} y="60" width="132" height="26" rx="3" fill={z.color} opacity=".15" stroke={z.color} strokeWidth="1"/>
            <text x={84+i*162} y="70" fontSize="7" fill="#1e293b" textAnchor="middle">DQ gate:</text>
            <text x={84+i*162} y="82" fontSize="7" fill="#1e293b" textAnchor="middle">{z.rules}</text>
            {i<zones.length-1&&<>
              <polygon points={`158+${i*162},57 166+${i*162},57 162+${i*162},65`} fill={z.color} opacity=".5"/>
            </>}
          </g>
        ))}
        <text x="8" y="125" fontSize="8" fill="#94a3b8">Arrows with gates — failed DQ → dead-letter queue, not dropped silently</text>
      </svg>
    </div>
  )
}

function DataQualityDiagram() {
  const dims = [
    {label:'Completeness',desc:'No missing values',color:'#4f8ef7',x:120,y:30},
    {label:'Accuracy',desc:'Correct values',color:'#22c55e',x:300,y:30},
    {label:'Consistency',desc:'Same across systems',color:'#8b5cf6',x:480,y:30},
    {label:'Timeliness',desc:'Fresh data',color:'#f59e0b',x:120,y:110},
    {label:'Uniqueness',desc:'No duplicates',color:'#ef4444',x:300,y:110},
    {label:'Validity',desc:'Conforms to rules',color:'#ec4899',x:480,y:110},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 560 150" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Data Quality Dimensions</text>
        <circle cx="280" cy="75" r="28" fill="#1e293b" opacity=".06" stroke="#1e293b" strokeWidth="1"/>
        <text x="280" y="72" fontSize="8" fontWeight="700" fill="#1e293b" textAnchor="middle">DQ</text>
        <text x="280" y="83" fontSize="7" fill="#64748b" textAnchor="middle">Framework</text>
        {dims.map(d=>(
          <g key={d.label}>
            <line x1="280" y1="75" x2={d.x} y2={d.y+10} stroke={d.color} strokeWidth="1" strokeDasharray="3 2" opacity=".6"/>
            <rect x={d.x-55} y={d.y} width="110" height="28" rx="6" fill={d.color} opacity=".15" stroke={d.color} strokeWidth="1.5"/>
            <text x={d.x} y={d.y+12} fontSize="8.5" fontWeight="700" fill={d.color} textAnchor="middle">{d.label}</text>
            <text x={d.x} y={d.y+23} fontSize="7.5" fill="#475569" textAnchor="middle">{d.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DataGovernanceDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 150" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Data Governance Hierarchy</text>
        {/* Council */}
        <rect x="175" y="20" width="150" height="22" rx="5" fill="#4f8ef7" opacity=".2" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="250" y="35" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Data Governance Council</text>
        {/* Stewards */}
        <line x1="250" y1="42" x2="250" y2="55" stroke="#4f8ef7" strokeWidth="1.2"/>
        <rect x="125" y="55" width="250" height="20" rx="4" fill="#8b5cf6" opacity=".18" stroke="#8b5cf6" strokeWidth="1.2"/>
        <text x="250" y="68" fontSize="9" fontWeight="600" fill="#8b5cf6" textAnchor="middle">Data Stewards (domain leads)</text>
        {/* Owners */}
        <line x1="250" y1="75" x2="250" y2="88" stroke="#8b5cf6" strokeWidth="1.2"/>
        {['Data Owners','Platform Owners'].map((o,i)=>(
          <g key={o}>
            <rect x={90+i*185} y="88" width="160" height="18" rx="4" fill="#f59e0b" opacity=".18" stroke="#f59e0b" strokeWidth="1.2"/>
            <text x={170+i*185} y="100" fontSize="8.5" fontWeight="600" fill="#f59e0b" textAnchor="middle">{o}</text>
            <line x1="250" y1="88" x2={170+i*185} y2="88" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2"/>
          </g>
        ))}
        {/* Users */}
        <line x1="250" y1="106" x2="250" y2="118" stroke="#f59e0b" strokeWidth="1.2"/>
        <rect x="90" y="118" width="320" height="18" rx="4" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1.2"/>
        <text x="250" y="130" fontSize="8.5" fontWeight="600" fill="#22c55e" textAnchor="middle">Data Consumers (analysts, scientists, engineers)</text>
        <text x="8" y="146" fontSize="8" fill="#94a3b8">Policies flow top-down; access requests flow bottom-up</text>
      </svg>
    </div>
  )
}

function BatchStreamDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 130" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#1e293b">Batch vs Streaming Processing</text>
        {/* Batch */}
        <text x="8" y="30" fontSize="9" fontWeight="700" fill="#4f8ef7">BATCH</text>
        {[0,1,2,3,4,5].map(i=>(
          <g key={i}>
            <rect x={8+i*40} y="34" width="34" height="18" rx="2" fill="#4f8ef7" opacity=".2" stroke="#4f8ef7" strokeWidth="1"/>
            <text x={25+i*40} y="47" fontSize="7" fill="#475569" textAnchor="middle">t={i}</text>
          </g>
        ))}
        <rect x="8" y="58" width="232" height="14" rx="3" fill="#4f8ef7" opacity=".3" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="124" y="68" fontSize="8" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Process entire batch at midnight</text>
        <text x="8" y="82" fontSize="7.5" fill="#64748b">Latency: hours   Throughput: very high   Cost: efficient</text>
        {/* Streaming */}
        <text x="8" y="98" fontSize="9" fontWeight="700" fill="#22c55e">STREAMING</text>
        {[0,1,2,3,4,5,6,7].map(i=>(
          <g key={i}>
            <rect x={8+i*30} y="102" width="24" height="14" rx="2" fill="#22c55e" opacity={0.1+i*0.1} stroke="#22c55e" strokeWidth="1"/>
            <polygon points={`${37+i*30},109 ${33+i*30},105 ${33+i*30},113`} fill="#22c55e" opacity=".6"/>
          </g>
        ))}
        <text x="8" y="126" fontSize="7.5" fill="#64748b">Latency: ms–sec   Each event processed individually   Always-on</text>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────── ANIMATION COMPONENTS

function BinaryAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const hello = 'Hello'
    const bits: string[] = []
    for (const ch of hello) {
      bits.push(ch.charCodeAt(0).toString(2).padStart(8, '0'))
    }
    const bitsFlat = bits.join(' ')

    const chars: { x: number; y: number; val: string; opacity: number; speed: number }[] = []
    for (let i = 0; i < 80; i++) {
      chars.push({
        x: Math.random() * 600,
        y: Math.random() * 120,
        val: Math.random() > 0.5 ? '1' : '0',
        opacity: Math.random() * 0.5 + 0.15,
        speed: Math.random() * 0.4 + 0.1,
      })
    }

    let frame = 0
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, 600, 120)
      ctx.fillStyle = '#0d0d0d'
      ctx.fillRect(0, 0, 600, 120)

      ctx.font = '13px monospace'
      chars.forEach(c => {
        c.y += c.speed
        if (c.y > 120) { c.y = 0; c.x = Math.random() * 600; c.val = Math.random() > 0.5 ? '1' : '0' }
        ctx.fillStyle = `rgba(0,200,100,${c.opacity})`
        ctx.fillText(c.val, c.x, c.y)
      })

      // Draw "Hello" in ASCII binary in the centre
      ctx.fillStyle = 'rgba(0,200,100,0.18)'
      ctx.fillRect(0, 38, 600, 44)
      ctx.font = 'bold 15px monospace'
      ctx.fillStyle = '#00e87a'
      const textW = ctx.measureText(bitsFlat).width
      ctx.fillText(bitsFlat, (600 - textW) / 2, 66)

      ctx.font = '11px monospace'
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.fillText(`"Hello" in ASCII binary`, 10, 108)

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="anim-wrap" style={{ margin: '20px 0', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <canvas ref={canvasRef} width={600} height={120} style={{ display: 'block', width: '100%', height: 120 }} />
    </div>
  )
}

function CpuAnimation() {
  return (
    <div className="anim-wrap" style={{ margin: '20px 0', background: '#0d1117', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--border)', overflowX: 'auto' }}>
      <svg viewBox="0 0 640 260" style={{ width: '100%', maxWidth: 640, display: 'block' }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#00e87a" />
          </marker>
          <style>{`
            @keyframes dash { to { stroke-dashoffset: -20; } }
            .flow { stroke-dasharray: 6 4; animation: dash 1s linear infinite; }
            .flow2 { stroke-dasharray: 6 4; animation: dash 1.5s linear infinite; }
            .flow3 { stroke-dasharray: 6 4; animation: dash 2s linear infinite; }
          `}</style>
        </defs>

        {/* CPU die */}
        <rect x="200" y="80" width="240" height="120" rx="10" fill="#1a2a1a" stroke="#00e87a" strokeWidth="2" />
        <text x="320" y="100" textAnchor="middle" fill="#00e87a" fontSize="11" fontWeight="700">CPU</text>

        {/* L1 cache */}
        <rect x="215" y="108" width="60" height="28" rx="4" fill="#0d2d0d" stroke="#00cc66" strokeWidth="1.5" />
        <text x="245" y="124" textAnchor="middle" fill="#00cc66" fontSize="9" fontWeight="600">L1 ~1ns</text>
        <text x="245" y="134" textAnchor="middle" fill="#009944" fontSize="8">32 KB</text>

        {/* L2 cache */}
        <rect x="290" y="108" width="60" height="28" rx="4" fill="#0d2d0d" stroke="#22c55e" strokeWidth="1.5" />
        <text x="320" y="124" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">L2 ~4ns</text>
        <text x="320" y="134" textAnchor="middle" fill="#16a34a" fontSize="8">256 KB</text>

        {/* L3 cache */}
        <rect x="365" y="108" width="60" height="28" rx="4" fill="#0d2d0d" stroke="#4ade80" strokeWidth="1.5" />
        <text x="395" y="124" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">L3 ~10ns</text>
        <text x="395" y="134" textAnchor="middle" fill="#22c55e" fontSize="8">8 - 32 MB</text>

        {/* ALU */}
        <rect x="215" y="150" width="80" height="34" rx="4" fill="#1a1a2d" stroke="#6366f1" strokeWidth="1.5" />
        <text x="255" y="168" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontWeight="600">ALU</text>
        <text x="255" y="178" textAnchor="middle" fill="#6366f1" fontSize="8">Arithmetic</text>

        {/* CU */}
        <rect x="310" y="150" width="80" height="34" rx="4" fill="#1a1a2d" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="350" y="168" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="600">Control Unit</text>
        <text x="350" y="178" textAnchor="middle" fill="#f59e0b" fontSize="8">Fetch/Decode</text>

        {/* RAM */}
        <rect x="30" y="100" width="100" height="50" rx="6" fill="#1a1a2a" stroke="#818cf8" strokeWidth="1.5" />
        <text x="80" y="123" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="700">RAM</text>
        <text x="80" y="136" textAnchor="middle" fill="#818cf8" fontSize="8">16 - 64 GB • ~60ns</text>

        {/* SSD */}
        <rect x="510" y="80" width="110" height="40" rx="6" fill="#1a1a1a" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="565" y="98" textAnchor="middle" fill="#fcd34d" fontSize="10" fontWeight="700">NVMe SSD</text>
        <text x="565" y="110" textAnchor="middle" fill="#f59e0b" fontSize="8">~7 GB/s • ~20µs</text>

        {/* HDD */}
        <rect x="510" y="140" width="110" height="40" rx="6" fill="#1a1a1a" stroke="#ef4444" strokeWidth="1.5" />
        <text x="565" y="158" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="700">HDD</text>
        <text x="565" y="170" textAnchor="middle" fill="#ef4444" fontSize="8">~150 MB/s • ~5ms</text>

        {/* Arrows: RAM ↔ CPU */}
        <line x1="130" y1="120" x2="198" y2="150" stroke="#00e87a" strokeWidth="1.5" markerEnd="url(#arrow)" className="flow" />
        <line x1="198" y1="145" x2="130" y2="118" stroke="#00e87a" strokeWidth="1.5" markerEnd="url(#arrow)" className="flow" />

        {/* Arrows: CPU → SSD */}
        <line x1="442" y1="120" x2="508" y2="100" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow)" className="flow2" />

        {/* Arrows: CPU → HDD */}
        <line x1="442" y1="165" x2="508" y2="160" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow)" className="flow3" />

        {/* Labels */}
        <text x="320" y="248" textAnchor="middle" fill="#666" fontSize="9">Arrows show data flow  -  animated dashes indicate active transfers</text>
      </svg>
    </div>
  )
}

function MemoryHierarchyAnimation() {
  const levels = [
    { name: 'L1 Cache', speed: '~1 ns', size: '32 KB', barPct: 3, color: '#00e87a' },
    { name: 'L2 Cache', speed: '~4 ns', size: '256 KB', barPct: 6, color: '#22c55e' },
    { name: 'L3 Cache', speed: '~10 ns', size: '8 - 32 MB', barPct: 11, color: '#4ade80' },
    { name: 'RAM (DRAM)', speed: '~60 ns', size: '16 - 64 GB', barPct: 30, color: '#818cf8' },
    { name: 'NVMe SSD', speed: '~20 µs', size: '1 - 4 TB', barPct: 58, color: '#f59e0b' },
    { name: 'SATA SSD', speed: '~100 µs', size: '1 - 4 TB', barPct: 72, color: '#fb923c' },
    { name: 'HDD', speed: '~5 ms', size: '1 - 20 TB', barPct: 100, color: '#ef4444' },
  ]

  return (
    <div className="anim-wrap" style={{ margin: '20px 0', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', border: '1px solid var(--border)' }}>
      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '.95rem' }}>Memory Hierarchy  -  Relative Latency (log scale visualised)</div>
      {levels.map(l => (
        <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 90, fontSize: '.8rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{l.name}</div>
          <div style={{ flex: 1, background: 'var(--surface-3)', borderRadius: 4, height: 18, overflow: 'hidden' }}>
            <div style={{
              width: `${l.barPct}%`,
              height: '100%',
              background: l.color,
              borderRadius: 4,
              transition: 'width 0.5s ease',
              opacity: 0.85,
            }} />
          </div>
          <div style={{ width: 70, fontSize: '.78rem', fontFamily: 'monospace', color: l.color, flexShrink: 0 }}>{l.speed}</div>
          <div style={{ width: 60, fontSize: '.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{l.size}</div>
        </div>
      ))}
      <div style={{ marginTop: 10, fontSize: '.75rem', color: 'var(--text-muted)' }}>
        Bars are proportional on a compressed scale  -  actual latency span is 5,000,000× from L1 to HDD.
        Fast = short bar, green. Slow = long bar, red.
      </div>
    </div>
  )
}

function NetworkAnimation() {
  return (
    <svg viewBox="0 0 640 160" className="anim-wrap" style={{ display:'block', width: '100%', maxWidth:700, maxHeight: 160, borderRadius: 'var(--radius-xl)', background: 'var(--gray-50)', border: '1px solid var(--border)', marginBottom: 16 }}>
      {[
        { x: 60,  label: 'Client',     color: '#4f8ef7' },
        { x: 200, label: 'DNS',        color: '#8b5cf6' },
        { x: 340, label: 'API GW',     color: '#22c55e' },
        { x: 480, label: 'App Server', color: '#f59e0b' },
        { x: 590, label: 'DB',         color: '#ef4444' },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy="80" r="26" fill="white" stroke={n.color} strokeWidth="2"/>
          <text x={n.x} y="84" textAnchor="middle" fill={n.color} fontSize="9" fontWeight="700">{n.label}</text>
        </g>
      ))}
      {([[60,200],[200,340],[340,480],[480,590]] as [number,number][]).map(([x1,x2], i) => (
        <g key={i}>
          <line x1={x1+26} y1="80" x2={x2-26} y2="80" stroke="#e2e8f0" strokeWidth="2"/>
          <circle r="5" fill="#4f8ef7" opacity="0.8">
            <animateMotion path={`M${x1+26},80 L${x2-26},80`} dur={`${0.8 + i*0.2}s`} repeatCount="indefinite"/>
          </circle>
        </g>
      ))}
      <text x="320" y="148" textAnchor="middle" fill="#94a3b8" fontSize="9">TCP/IP packet flow through OSI layers 1 - 7</text>
    </svg>
  )
}

function FileFormatAnimation() {
  const [active, setActive] = useState(0)
  const formats = ['CSV (Row-oriented)', 'Parquet (Columnar)']
  const rows = [
    ['id', 'name', 'country', 'amount', 'category'],
    ['1', 'Alice', 'US', '100.00', 'Electronics'],
    ['2', 'Bob', 'UK', '200.00', 'Clothing'],
    ['3', 'Carol', 'DE', '150.00', 'Electronics'],
    ['4', 'Dave', 'US', '300.00', 'Food'],
  ]
  return (
    <div className="anim-wrap" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {formats.map((f, i) => (
          <button key={f} onClick={() => setActive(i)} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border)', background: active === i ? 'var(--blue-500)' : 'white', color: active === i ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '.83rem', cursor: 'pointer' }}>{f}</button>
        ))}
      </div>
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} style={{ borderBottom: '1px solid var(--border)' }}>
                {row.map((cell, c) => {
                  const isHighlighted = active === 0 ? r > 0 : c === 3
                  const isHeader = r === 0
                  return (
                    <td key={c} style={{
                      padding: '8px 12px',
                      background: isHighlighted ? '#dbeafe' : isHeader ? 'var(--gray-50)' : 'white',
                      fontWeight: isHeader || (active === 1 && c === 3) ? 700 : 400,
                      color: isHighlighted && active === 1 ? '#1d4ed8' : 'var(--text-primary)',
                      transition: 'background .3s',
                    }}>{cell}</td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: '.8rem', color: 'var(--text-secondary)' }}>
        {active === 0
          ? 'Row storage: SELECT SUM(amount) must read all 5 columns (highlighted rows = full row scan)'
          : 'Columnar: SELECT SUM(amount) reads only the amount column (highlighted)  -  80% less I/O'}
      </div>
    </div>
  )
}

function ParquetInternalsAnimation() {
  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '.9rem' }}>Parquet File Structure</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* File level */}
        <div style={{ background: '#1e293b', color: '#94a3b8', borderRadius: 8, padding: '8px 14px', fontSize: '.8rem', fontFamily: 'monospace' }}>
          📄 orders.parquet (file header + footer with metadata)
        </div>
        {/* Row groups */}
        {[
          { label: 'Row Group 0 (rows 0 - 131072, ~128MB)', cols: ['id: INT64', 'name: BINARY (dict)', 'amount: DOUBLE', 'ts: INT64 (delta)'] },
          { label: 'Row Group 1 (rows 131073 - 262144, ~128MB)', cols: ['id: INT64', 'name: BINARY (dict)', 'amount: DOUBLE', 'ts: INT64 (delta)'] },
        ].map((rg, i) => (
          <div key={i} style={{ marginLeft: 20, background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: '#6366f1', fontWeight: 700, marginBottom: 8 }}>📦 {rg.label}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rg.cols.map(col => (
                <div key={col} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', fontSize: '.74rem', fontFamily: 'monospace', color: '#1d4ed8' }}>
                  🗂 {col}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: '.72rem', color: 'var(--text-muted)' }}>Each column chunk → Pages (1MB) → encoded + compressed independently</div>
          </div>
        ))}
        <div style={{ marginLeft: 20, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 14px', fontSize: '.75rem', color: '#15803d', fontFamily: 'monospace' }}>
          📋 Footer: schema, row group offsets, column stats (min/max), bloom filters
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--text-muted)' }}>
        Column stats in footer enable <strong>predicate pushdown</strong>: if WHERE amount &gt; 1000 and max(amount) in row group = 500, the entire row group is skipped.
      </div>
    </div>
  )
}

function MedallionAnimation() {
  return (
    <div className="anim-wrap" style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      {[
        { label: 'Source\nSystem', icon: '🔌', color: '#94a3b8', bg: '#f8fafc' },
        { label: 'Bronze\nRaw', icon: '🥉', color: '#cd7f32', bg: '#fff7ed' },
        { label: 'Silver\nClean', icon: '🥈', color: '#64748b', bg: '#f8fafc' },
        { label: 'Gold\nBiz Ready', icon: '🥇', color: '#f59e0b', bg: '#fffbeb' },
        { label: 'BI / ML\nConsumers', icon: '📊', color: '#8b5cf6', bg: '#faf5ff' },
      ].map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 18px', background: n.bg, border: `1.5px solid ${n.color}60`, borderRadius: 'var(--radius-xl)', minWidth: 90, textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem' }}>{n.icon}</div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: n.color, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{n.label}</div>
          </div>
          {i < 4 && <div style={{ fontSize: '1.4rem', color: '#94a3b8', padding: '0 4px' }}>→</div>}
        </div>
      ))}
    </div>
  )
}

function StorageAnimation() {
  const [active, setActive] = useState<'hdd'|'ssd'|'nvme'>('hdd')
  const types = [
    { key: 'hdd' as const, label: 'HDD', color: '#ef4444', latency: '5–10 ms', iops: '~200', bw: '150 MB/s' },
    { key: 'ssd' as const, label: 'SATA SSD', color: '#f59e0b', latency: '~100 µs', iops: '~100K', bw: '550 MB/s' },
    { key: 'nvme' as const, label: 'NVMe', color: '#22c55e', latency: '~20 µs', iops: '~500K', bw: '7 GB/s' },
  ]
  const t = types.find(x => x.key === active)!
  const bars = { hdd: 8, ssd: 40, nvme: 100 }
  return (
    <div className="anim-wrap" style={{ background: '#0d1117', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {types.map(tp => (
          <button key={tp.key} onClick={() => setActive(tp.key)} style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${tp.color}`, background: active === tp.key ? tp.color : 'transparent', color: active === tp.key ? '#fff' : tp.color, fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' }}>{tp.label}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[['Latency', t.latency], ['IOPS', t.iops], ['Bandwidth', t.bw]].map(([k, v]) => (
          <div key={k} style={{ background: '#1a1a2d', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 4 }}>{k}</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: t.color, fontSize: '.95rem' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#111', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 8 }}>Relative throughput</div>
        <div style={{ background: '#1a1a1a', borderRadius: 4, height: 20, overflow: 'hidden' }}>
          <div style={{ width: `${bars[active]}%`, height: '100%', background: `linear-gradient(90deg, ${t.color}88, ${t.color})`, borderRadius: 4, transition: 'width .5s ease' }} />
        </div>
        {active === 'hdd' && <div style={{ marginTop: 8, fontSize: '.75rem', color: '#64748b' }}>Mechanical: spinning platter + actuator arm seek = ms-level latency</div>}
        {active === 'ssd' && <div style={{ marginTop: 8, fontSize: '.75rem', color: '#64748b' }}>NAND flash: no moving parts, but SATA bus caps at 600 MB/s</div>}
        {active === 'nvme' && <div style={{ marginTop: 8, fontSize: '.75rem', color: '#64748b' }}>PCIe direct path to CPU: no SATA bottleneck, 7+ GB/s</div>}
      </div>
    </div>
  )
}

function OSAnimation() {
  const [step, setStep] = useState(0)
  const steps = [
    { label: 'User App', desc: 'Your Python/Spark process runs in user space', color: '#4f8ef7', y: 20 },
    { label: 'System Call', desc: 'App calls read() → crosses kernel boundary (~1-5µs overhead)', color: '#8b5cf6', y: 80 },
    { label: 'Kernel', desc: 'Kernel handles privileged operation: accesses hardware, manages memory', color: '#22c55e', y: 140 },
    { label: 'Hardware', desc: 'Physical device (disk/network) performs the actual I/O', color: '#f59e0b', y: 200 },
  ]
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>User Space → Kernel Space → Hardware</div>
      <div style={{ position: 'relative' }}>
        <svg viewBox="0 0 520 260" style={{ width: '100%', display: 'block' }}>
          {steps.map((s, i) => (
            <g key={i} onClick={() => setStep(i)} style={{ cursor: 'pointer' }}>
              <rect x="30" y={s.y} width="200" height="40" rx="8" fill={step === i ? s.color : 'white'} stroke={s.color} strokeWidth={step === i ? 2.5 : 1.5} />
              <text x="130" y={s.y + 24} textAnchor="middle" fill={step === i ? 'white' : s.color} fontSize="11" fontWeight="700">{s.label}</text>
              {i < 3 && <path d="M130,0 L125,10 L135,10 Z" transform={`translate(0,${s.y+40})`} fill={s.color} opacity="0.7"/>}
            </g>
          ))}
          <rect x="270" y="10" width="230" height="240" rx="12" fill="white" stroke="var(--border)" strokeWidth="1.5"/>
          <text x="385" y="35" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="700">{steps[step].label}</text>
          <foreignObject x="280" y="45" width="210" height="180">
            <div style={{ fontSize: '.78rem', color: '#475569', lineHeight: 1.6, padding: '0 4px' }}>{steps[step].desc}</div>
          </foreignObject>
        </svg>
      </div>
      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Click each layer to see what happens there</div>
    </div>
  )
}

function LinuxAnimation() {
  const [cmd, setCmd] = useState(0)
  const cmds = [
    { input: 'ps aux | grep spark', output: 'root  1234  45.2  12.1  SparkSubmit --master yarn\nroot  1235  32.1   8.4  CoarseGrainedExecutor', desc: 'List Spark processes with CPU/mem %' },
    { input: 'df -h', output: 'Filesystem      Size  Used  Avail  Use%  Mounted\n/dev/nvme0n1p1  500G  340G  160G   68%  /\n/dev/sdb1       10T    2T    8T    20%  /data', desc: 'Show disk free space in human-readable format' },
    { input: "awk -F',' '{sum+=$3} END{print sum}' sales.csv", output: '4782341.50\n\n# Summed column 3 across all rows without loading into memory', desc: 'Sum a CSV column with awk — no Python needed' },
    { input: "grep -c 'ERROR' app.log", output: '247\n\n# Found 247 ERROR lines out of millions', desc: 'Count ERROR occurrences in a log file' },
  ]
  const c = cmds[cmd]
  return (
    <div className="anim-wrap" style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 'var(--radius-xl)', padding: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {cmds.map((_, i) => (
          <button key={i} onClick={() => setCmd(i)} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid #30363d', background: cmd === i ? '#238636' : '#161b22', color: cmd === i ? '#fff' : '#8b949e', fontSize: '.75rem', cursor: 'pointer' }}>cmd {i+1}</button>
        ))}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>
        <div style={{ color: '#7c3aed', marginBottom: 4 }}>$ {c.input}</div>
        <div style={{ color: '#22c55e', marginBottom: 8, whiteSpace: 'pre-line' }}>{c.output}</div>
        <div style={{ color: '#8b949e', fontSize: '.75rem', borderTop: '1px solid #30363d', paddingTop: 8 }}>▶ {c.desc}</div>
      </div>
    </div>
  )
}

function DockerAnimation() {
  const [view, setView] = useState<'layers'|'lifecycle'>('layers')
  const layers = [
    { label: 'Writable Container Layer', color: '#22c55e', bg: '#052e16', note: 'ephemeral — lost on stop' },
    { label: 'COPY src/ ./src/', color: '#4f8ef7', bg: '#0f172a', note: 'your app code' },
    { label: 'RUN pip install ...', color: '#8b5cf6', bg: '#1a0a2e', note: 'dependencies (cached)' },
    { label: 'FROM python:3.11-slim', color: '#f59e0b', bg: '#1c1100', note: 'base image (shared across images)' },
  ]
  const lifecycle = [
    { step: 'docker pull', color: '#4f8ef7', desc: 'Pull image from registry (Docker Hub / ACR)' },
    { step: 'docker run', color: '#22c55e', desc: 'Create container from image + start process' },
    { step: 'running', color: '#22c55e', desc: 'Container executing — writable layer active' },
    { step: 'docker stop', color: '#f59e0b', desc: 'SIGTERM sent, process exits gracefully' },
    { step: 'stopped', color: '#64748b', desc: 'Container stopped — writable layer preserved' },
    { step: 'docker rm', color: '#ef4444', desc: 'Container removed — writable layer deleted' },
  ]
  return (
    <div className="anim-wrap" style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['layers', 'lifecycle'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding: '5px 16px', borderRadius: 'var(--radius-full)', border: '1.5px solid #30363d', background: view === v ? '#238636' : '#161b22', color: '#e6edf3', fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' }}>{v === 'layers' ? 'Image Layers' : 'Container Lifecycle'}</button>
        ))}
      </div>
      {view === 'layers' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {layers.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: l.bg, border: `1px solid ${l.color}40`, borderRadius: 8 }}>
              <div style={{ fontFamily: 'monospace', fontSize: '.82rem', color: l.color, flex: 1 }}>{l.label}</div>
              <div style={{ fontSize: '.72rem', color: '#8b949e' }}>{l.note}</div>
            </div>
          ))}
          <div style={{ fontSize: '.75rem', color: '#8b949e', marginTop: 8 }}>Each instruction = one cached layer. Only changed layers are rebuilt on re-build.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lifecycle.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 100, fontFamily: 'monospace', fontSize: '.82rem', color: s.color, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              {i < lifecycle.length - 1 && <div style={{ fontSize: '.8rem', color: '#30363d' }}>▼</div>}
              <div style={{ fontSize: '.78rem', color: '#8b949e' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DataTypesAnimation() {
  const [val, setVal] = useState(42)
  const types = [
    { name: 'TINYINT', bytes: 1, min: -128, max: 127, color: '#22c55e' },
    { name: 'SMALLINT', bytes: 2, min: -32768, max: 32767, color: '#4f8ef7' },
    { name: 'INT', bytes: 4, min: -2147483648, max: 2147483647, color: '#8b5cf6' },
    { name: 'BIGINT', bytes: 8, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER, color: '#f59e0b' },
  ]
  const fits = types.filter(t => val >= t.min && val <= t.max)
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>Integer Type Chooser</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>Value:</label>
        <input type="number" value={val} onChange={e => setVal(Number(e.target.value))} style={{ width: 140, padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'monospace', fontSize: '.9rem' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 10 }}>
        {types.map(t => {
          const ok = val >= t.min && val <= t.max
          return (
            <div key={t.name} style={{ padding: '10px 14px', borderRadius: 8, background: ok ? `${t.color}15` : 'var(--surface-3)', border: `1.5px solid ${ok ? t.color : 'var(--border)'}`, opacity: ok ? 1 : 0.5 }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: ok ? t.color : 'var(--text-muted)', fontSize: '.88rem' }}>{t.name}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{t.bytes} bytes</div>
              <div style={{ fontSize: '.72rem', color: ok ? t.color : 'var(--text-muted)', marginTop: 2 }}>{ok ? '✓ fits' : '✗ overflow'}</div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: '.78rem', color: 'var(--text-secondary)' }}>
        {fits.length > 0 ? `Use ${fits[0].name} (${fits[0].bytes} bytes) — smallest type that fits saves storage.` : 'Value overflows all integer types — use DECIMAL or DOUBLE.'}
      </div>
    </div>
  )
}

function CompressionAnimation() {
  const [codec, setCodec] = useState<'snappy'|'zstd'|'gzip'>('snappy')
  const codecs = {
    snappy: { label: 'Snappy', ratio: 2.0, speed: 100, color: '#22c55e' },
    zstd:   { label: 'Zstd',   ratio: 3.0, speed: 70,  color: '#4f8ef7' },
    gzip:   { label: 'Gzip',   ratio: 4.0, speed: 30,  color: '#f59e0b' },
  }
  const original = 100
  const c = codecs[codec]
  const compressed = (original / c.ratio).toFixed(1)
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>Compression Codec Tradeoffs</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(Object.entries(codecs) as [keyof typeof codecs, typeof codecs.snappy][]).map(([k, v]) => (
          <button key={k} onClick={() => setCodec(k)} style={{ padding: '5px 16px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${v.color}`, background: codec === k ? v.color : 'transparent', color: codec === k ? '#fff' : v.color, fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' }}>{v.label}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Storage size (100 MB original)</div>
          <div style={{ background: 'var(--surface-3)', borderRadius: 6, height: 20, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${(Number(compressed)/original)*100}%`, height: '100%', background: c.color, borderRadius: 6, transition: 'width .4s ease' }} />
          </div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: c.color }}>{compressed} MB ({c.ratio}x ratio)</div>
        </div>
        <div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Decompression speed (relative)</div>
          <div style={{ background: 'var(--surface-3)', borderRadius: 6, height: 20, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${c.speed}%`, height: '100%', background: c.color, borderRadius: 6, transition: 'width .4s ease' }} />
          </div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: c.color }}>{c.speed}% of max speed</div>
        </div>
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {codec === 'snappy' && 'Best for: Parquet in Spark pipelines. Fast decompression keeps CPU free for actual computation.'}
        {codec === 'zstd' && 'Best for: Gold layer archives. Better ratio than Snappy with acceptable CPU overhead.'}
        {codec === 'gzip' && 'Best for: Cold archival CSV/JSON. Best ratio but slowest — not ideal for hot query paths.'}
      </div>
    </div>
  )
}

function SerializationAnimation() {
  const [fmt, setFmt] = useState<'json'|'avro'|'proto'>('json')
  const formats = {
    json:  { label: 'JSON',     color: '#f59e0b', size: 186, time: 100, schema: false },
    avro:  { label: 'Avro',     color: '#4f8ef7', size:  42, time:  25, schema: true  },
    proto: { label: 'Protobuf', color: '#22c55e', size:  28, time:  15, schema: true  },
  }
  const example = `{
  "order_id": 12345,
  "customer": "Alice",
  "amount": 99.99,
  "status": "shipped"
}`
  const f = formats[fmt]
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>Serialization Format Comparison</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(Object.entries(formats) as [keyof typeof formats, typeof formats.json][]).map(([k, v]) => (
          <button key={k} onClick={() => setFmt(k)} style={{ padding: '5px 16px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${v.color}`, background: fmt === k ? v.color : 'transparent', color: fmt === k ? '#fff' : v.color, fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' }}>{v.label}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Message size (bytes)</div>
          <div style={{ background: 'var(--surface-3)', borderRadius: 6, height: 20, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${(f.size/186)*100}%`, height: '100%', background: f.color, borderRadius: 6, transition: 'width .4s ease' }} />
          </div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: f.color }}>{f.size} bytes</div>
        </div>
        <div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Serialization time (relative)</div>
          <div style={{ background: 'var(--surface-3)', borderRadius: 6, height: 20, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${f.time}%`, height: '100%', background: f.color, borderRadius: 6, transition: 'width .4s ease' }} />
          </div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: f.color }}>{f.time}% of JSON time</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>Equivalent payload as JSON:</div>
          <pre style={{ margin: 0, fontSize: '.72rem', color: '#1e293b', lineHeight: 1.5, overflowX: 'auto' }}>{example}</pre>
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: '.72rem', color: '#8b949e', marginBottom: 6 }}>Stored as {fmt === 'json' ? 'human-readable text' : 'compact binary'}:</div>
          <div style={{ fontFamily: 'monospace', fontSize: '.72rem', color: f.color, lineHeight: 1.6 }}>
            {fmt === 'json' && '7b 22 6f 72 64 65 72 5f 69 64 22 3a 31 32 33 34 35 2c 22 63 75...'}
            {fmt === 'avro' && '00 00 00 00 01 d2 0a 41 6c 69 63 65 71 47 ae 47 4e 53 c0 3f 00...'}
            {fmt === 'proto' && '08 b9 60 12 05 41 6c 69 63 65 1d d7 a3 c6 42 2a 07 73 68 69 70...'}
          </div>
          <div style={{ marginTop: 8, fontSize: '.7rem', color: '#8b949e' }}>
            {f.schema ? '✓ Schema required (registered separately)' : '✗ Schema embedded in every message'}
          </div>
        </div>
      </div>
    </div>
  )
}

function DatabasesAnimation() {
  const [db, setDb] = useState<'oltp'|'olap'|'redis'|'vector'>('oltp')
  const types = {
    oltp:   { label: 'OLTP', color: '#4f8ef7', query: "UPDATE orders SET status='shipped'\nWHERE order_id = 12345;", time: '~2 ms', rows: '1 row', use: 'Transactional app: fast point reads/writes' },
    olap:   { label: 'OLAP', color: '#8b5cf6', query: 'SELECT country, SUM(revenue)\nFROM fact_sales\nGROUP BY country\nORDER BY 2 DESC;', time: '~4 sec', rows: '50M rows scanned', use: 'Analytics: aggregate over billions of rows' },
    redis:  { label: 'Cache', color: '#ef4444', query: 'GET customer:12345\n\n# Returns cached JSON\n# in ~0.1ms', time: '~0.1 ms', rows: 'in-memory', use: 'Key-value cache: sub-millisecond lookups' },
    vector: { label: 'Vector', color: '#22c55e', query: 'index.query(\n  vector=embedding,\n  top_k=10\n)\n# ANN similarity search', time: '~10 ms', rows: 'embedding space', use: 'Semantic search / RAG: nearest neighbours' },
  }
  const t = types[db]
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>Database Types — Access Patterns</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(Object.entries(types) as [keyof typeof types, typeof types.oltp][]).map(([k, v]) => (
          <button key={k} onClick={() => setDb(k)} style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${v.color}`, background: db === k ? v.color : 'transparent', color: db === k ? '#fff' : v.color, fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' }}>{v.label}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#0d1117', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: '.72rem', color: '#8b949e', marginBottom: 8 }}>Example query:</div>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '.78rem', color: t.color, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{t.query}</pre>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Typical response time</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: t.color, fontSize: '.95rem' }}>{t.time}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Data scanned</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: t.color, fontSize: '.95rem' }}>{t.rows}</div>
          </div>
          <div style={{ background: `${t.color}12`, border: `1px solid ${t.color}40`, borderRadius: 8, padding: '10px 14px', fontSize: '.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.use}</div>
        </div>
      </div>
    </div>
  )
}

function DataQualityAnimation() {
  const [dim, setDim] = useState(0)
  const dims = [
    { name: 'Completeness', icon: '✅', color: '#22c55e', check: "df.filter(col('order_id').isNull()).count()", good: '0 nulls', bad: '12,847 nulls!', goodMsg: 'All order_ids populated', badMsg: 'Missing 12,847 order_ids → quarantine' },
    { name: 'Uniqueness', icon: '🔑', color: '#ef4444', check: "df.groupBy('order_id').count().filter('count > 1')", good: '0 duplicates', bad: '3,241 dupes!', goodMsg: 'No duplicate order_ids', badMsg: '3,241 duplicate orders → dedup' },
    { name: 'Validity', icon: '📋', color: '#4f8ef7', check: "df.filter(col('amount') < 0).count()", good: '0 negatives', bad: '891 negatives!', goodMsg: 'All amounts ≥ 0', badMsg: '891 negative amounts → investigate' },
    { name: 'Timeliness', icon: '⏱️', color: '#f59e0b', check: "max_lag_minutes = (now - max(event_time)) / 60", good: 'lag: 3 min', bad: 'lag: 87 min!', goodMsg: 'Data arriving within SLA (5 min)', badMsg: 'Pipeline delayed — alert triggered' },
  ]
  const d = dims[dim]
  const [show, setShow] = useState<'good'|'bad'>('good')
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>DQ Check Simulator</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {dims.map((dd, i) => (
          <button key={i} onClick={() => setDim(i)} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${dd.color}`, background: dim === i ? dd.color : 'transparent', color: dim === i ? '#fff' : dd.color, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer' }}>{dd.icon} {dd.name}</button>
        ))}
      </div>
      <div style={{ background: '#0d1117', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontFamily: 'monospace', fontSize: '.8rem', color: '#4f8ef7' }}>
        {d.check}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {(['good', 'bad'] as const).map(s => (
          <button key={s} onClick={() => setShow(s)} style={{ flex: 1, padding: '6px', borderRadius: 8, border: `1.5px solid ${s === 'good' ? '#22c55e' : '#ef4444'}`, background: show === s ? (s === 'good' ? '#22c55e' : '#ef4444') : 'transparent', color: show === s ? '#fff' : (s === 'good' ? '#22c55e' : '#ef4444'), fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' }}>{s === 'good' ? '✓ Pass' : '✗ Fail'}</button>
        ))}
      </div>
      <div style={{ padding: '12px 14px', borderRadius: 8, background: show === 'good' ? '#052e16' : '#450a0a', border: `1px solid ${show === 'good' ? '#22c55e' : '#ef4444'}40` }}>
        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: show === 'good' ? '#22c55e' : '#ef4444', fontSize: '.88rem', marginBottom: 4 }}>{show === 'good' ? d.good : d.bad}</div>
        <div style={{ fontSize: '.78rem', color: '#94a3b8' }}>{show === 'good' ? d.goodMsg : d.badMsg}</div>
      </div>
    </div>
  )
}

function DataGovernanceAnimation() {
  const nodes = [
    { id: 'source', label: 'CRM\nSource', x: 60,  y: 100, color: '#94a3b8' },
    { id: 'bronze', label: 'Bronze\nRaw',   x: 200, y: 60,  color: '#cd7f32' },
    { id: 'silver', label: 'Silver\nClean', x: 340, y: 60,  color: '#64748b' },
    { id: 'gold',   label: 'Gold\nKPIs',   x: 480, y: 60,  color: '#f59e0b' },
    { id: 'bi',     label: 'Power BI\nReport', x: 560, y: 160, color: '#8b5cf6' },
    { id: 'mask',   label: 'PII\nMasked',  x: 340, y: 170, color: '#ef4444' },
  ]
  const edges = [
    ['source','bronze'], ['bronze','silver'], ['silver','gold'], ['gold','bi'], ['silver','mask'],
  ] as [string,string][]
  const getNode = (id: string) => nodes.find(n => n.id === id)!
  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 16, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '.9rem' }}>Data Lineage — where does data come from?</div>
      <svg viewBox="0 0 640 240" style={{ width: '100%', maxWidth: 640, display: 'block' }}>
        <defs>
          <marker id="gov-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
          </marker>
          <style>{`@keyframes gov-dash { to { stroke-dashoffset: -18; } } .gov-flow { stroke-dasharray: 5 3; animation: gov-dash 1.2s linear infinite; }`}</style>
        </defs>
        {edges.map(([a, b], i) => {
          const na = getNode(a), nb = getNode(b)
          return <line key={i} x1={na.x+40} y1={na.y} x2={nb.x-40} y2={nb.y} stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#gov-arrow)" className="gov-flow"/>
        })}
        {nodes.map((n, i) => (
          <g key={i}>
            <rect x={n.x-40} y={n.y-20} width={80} height={40} rx="8" fill="white" stroke={n.color} strokeWidth="1.5"/>
            <text x={n.x} y={n.y+2} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="700" style={{ whiteSpace: 'pre-line' }}>{n.label.split('\n')[0]}</text>
            <text x={n.x} y={n.y+13} textAnchor="middle" fill={n.color} fontSize="8" opacity="0.8">{n.label.split('\n')[1]}</text>
          </g>
        ))}
        <text x="320" y="228" textAnchor="middle" fill="#94a3b8" fontSize="9">Unity Catalog tracks every transformation — click any table to see its full lineage</text>
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 8, marginTop: 8 }}>
        {[
          { label: 'PII columns tagged', color: '#ef4444' },
          { label: 'Access logged in Unity Catalog', color: '#4f8ef7' },
          { label: 'GDPR delete propagates all layers', color: '#22c55e' },
        ].map((b, i) => (
          <div key={i} style={{ padding: '6px 10px', borderRadius: 6, background: `${b.color}12`, border: `1px solid ${b.color}40`, fontSize: '.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: b.color, fontWeight: 700 }}>■ </span>{b.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function BatchStreamAnimation() {
  const [mode, setMode] = useState<'batch'|'stream'>('batch')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 800)
    return () => clearInterval(id)
  }, [])
  const batchEvents = Array.from({ length: 12 }, (_, i) => i)
  const streamEvents = Array.from({ length: 4 }, (_, i) => i)
  const batchProcessed = mode === 'batch' ? Math.floor(tick / 6) % 3 : -1
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>Batch vs Streaming Data Flow</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['batch', 'stream'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: '5px 20px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${m === 'batch' ? '#4f8ef7' : '#22c55e'}`, background: mode === m ? (m === 'batch' ? '#4f8ef7' : '#22c55e') : 'transparent', color: mode === m ? '#fff' : (m === 'batch' ? '#4f8ef7' : '#22c55e'), fontWeight: 600, fontSize: '.85rem', cursor: 'pointer' }}>{m === 'batch' ? 'Batch (nightly)' : 'Streaming (real-time)'}</button>
        ))}
      </div>
      {mode === 'batch' ? (
        <div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {batchEvents.map(i => {
              const group = Math.floor(i / 4)
              const done = group < batchProcessed
              return (
                <div key={i} style={{ width: 36, height: 28, borderRadius: 6, background: done ? '#4f8ef7' : '#e2e8f0', border: `1px solid ${done ? '#3b82f6' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontFamily: 'monospace', color: done ? 'white' : '#64748b', transition: 'background .3s' }}>e{i}</div>
              )
            })}
          </div>
          <div style={{ fontSize: '.8rem', color: '#4f8ef7' }}>Processing {batchProcessed > 0 ? `${batchProcessed*4} events` : '...'} — waits to accumulate ALL events then processes in bulk</div>
          <div style={{ marginTop: 6, fontSize: '.75rem', color: 'var(--text-secondary)' }}>Latency: hours | Throughput: very high | Simplicity: easy</div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
            {streamEvents.map(i => {
              const active = tick % 4 === i
              return (
                <div key={i} style={{ width: 40, height: 32, borderRadius: 6, background: active ? '#22c55e' : '#e2e8f0', border: `1px solid ${active ? '#16a34a' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontFamily: 'monospace', color: active ? 'white' : '#64748b', transition: 'background .1s' }}>e{(tick-streamEvents.length+i+1)%100}</div>
              )
            })}
            <div style={{ marginLeft: 8, fontSize: '.7rem', color: '#22c55e', fontFamily: 'monospace' }}>→ Kafka → Spark</div>
            <div style={{ background: '#052e16', border: '1px solid #22c55e', borderRadius: 6, padding: '4px 10px', fontSize: '.7rem', color: '#22c55e', fontFamily: 'monospace' }}>Delta Gold updated</div>
          </div>
          <div style={{ fontSize: '.8rem', color: '#22c55e' }}>Processing event-by-event as they arrive — millisecond latency</div>
          <div style={{ marginTop: 6, fontSize: '.75rem', color: 'var(--text-secondary)' }}>Latency: ms–seconds | Throughput: lower | Complexity: higher</div>
        </div>
      )}
    </div>
  )
}

function StarSchemaAnimation() {
  const cx = 300, cy = 120
  const dims = [
    { label: 'dim_date', x: 300, y: 20, color: '#3b82f6' },
    { label: 'dim_customer', x: 500, y: 100, color: '#8b5cf6' },
    { label: 'dim_product', x: 460, y: 220, color: '#22c55e' },
    { label: 'dim_store', x: 140, y: 220, color: '#f59e0b' },
    { label: 'dim_promo', x: 100, y: 100, color: '#ef4444' },
  ]
  return (
    <svg viewBox="0 0 600 280" className="anim-wrap" style={{ display:'block', width: '100%', maxWidth:700, maxHeight: 260, borderRadius: 'var(--radius-xl)', background: 'var(--gray-50)', border: '1px solid var(--border)', marginBottom: 16 }}>
      {/* Lines from fact to dims */}
      {dims.map((d, i) => (
        <line key={i} x1={cx} y1={cy} x2={d.x} y2={d.y} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 2"/>
      ))}
      {/* Fact table */}
      <rect x={cx-60} y={cy-30} width={120} height={60} rx="8" fill="#1e293b" stroke="#4f8ef7" strokeWidth="2"/>
      <text x={cx} y={cy-8} textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="700">fact_sales</text>
      <text x={cx} y={cy+8} textAnchor="middle" fill="#94a3b8" fontSize="8">quantity, revenue</text>
      <text x={cx} y={cy+20} textAnchor="middle" fill="#94a3b8" fontSize="8">date_sk, customer_sk...</text>
      {/* Dim tables */}
      {dims.map((d, i) => (
        <g key={i}>
          <rect x={d.x-50} y={d.y-18} width={100} height={36} rx="6" fill="white" stroke={d.color} strokeWidth="1.5"/>
          <text x={d.x} y={d.y+5} textAnchor="middle" fill={d.color} fontSize="10" fontWeight="700">{d.label}</text>
        </g>
      ))}
      <text x={300} y={270} textAnchor="middle" fill="#94a3b8" fontSize="9">Star Schema: fact_sales surrounded by 5 dimension tables</text>
    </svg>
  )
}
