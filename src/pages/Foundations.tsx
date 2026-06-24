import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete, unmarkTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: (id?: string) => void; onUnmark: (id: string) => void }

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

export default function Foundations({ completed, onComplete, onUnmark }: Props) {
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

          <Quiz topicId="binary" questions={[
            {
              question: "What is the decimal value of the binary number 10110101?",
              options: ["181", "165", "171", "185"],
              correct: 0,
              explanation: "128+32+16+4+1 = 181"
            },
            {
              question: "In two's complement, how is -5 represented in 8 bits?",
              options: ["10000101", "11111010", "11111011", "10000100"],
              correct: 2,
              explanation: "Invert 00000101 → 11111010, then add 1 → 11111011"
            },
            {
              question: "Why should you never store currency as a floating-point number?",
              options: [
                "Floats are too slow for financial calculations",
                "Floats cannot represent numbers larger than 1000",
                "Most decimal fractions cannot be represented exactly in binary floating point, causing rounding errors",
                "Databases don't support float columns"
              ],
              correct: 2,
              explanation: "IEEE 754 cannot represent most decimal fractions exactly, leading to cumulative rounding errors"
            },
          ]} />

          <button
            onClick={async () => { if (completed.has('binary')) { await unmarkTopicComplete('binary'); onUnmark('binary') } else { await markTopicComplete('binary'); onComplete('binary') } }}
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

          <Quiz topicId="cpu" questions={[
            {
              question: "What is the primary purpose of the CPU's L1 cache?",
              options: [
                "Store the operating system kernel",
                "Hold frequently accessed data close to the execution units to avoid slow RAM accesses",
                "Buffer data being written to disk",
                "Store the program's source code"
              ],
              correct: 1,
              explanation: "L1 cache is on-die, ~1 ns latency, and holds the hottest data to avoid 60 ns RAM round trips"
            },
            {
              question: "Why do columnar formats like Parquet perform better for aggregations than row-oriented formats?",
              options: [
                "Parquet files are always smaller than CSV",
                "Columnar storage places a single column's values contiguously, maximising CPU cache reuse during scans",
                "Parquet uses a faster compression algorithm",
                "Row formats require more network bandwidth"
              ],
              correct: 1,
              explanation: "Cache locality: when scanning column A, all of column A fits in cache  -  no wasted bytes from columns B, C, D"
            },
            {
              question: "Hyper-threading presents two logical cores per physical core. What is the main benefit?",
              options: [
                "It doubles the number of ALUs available",
                "It doubles the clock speed",
                "It allows one thread to use execution units while another thread is stalled on a memory access",
                "It prevents cache misses entirely"
              ],
              correct: 2,
              explanation: "HT hides memory latency by keeping the execution units busy with a second thread while the first waits for data"
            },
          ]} />

          <button
            onClick={async () => { if (completed.has('cpu')) { await unmarkTopicComplete('cpu'); onUnmark('cpu') } else { await markTopicComplete('cpu'); onComplete('cpu') } }}
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

          <Quiz topicId="memory" questions={[
            {
              question: "Why does hitting swap space (page file) cause dramatic performance degradation?",
              options: [
                "Swap uses a different memory bus",
                "The CPU must switch to kernel mode to access swap",
                "Swap is on disk, which is ~80,000x slower than RAM  -  a page fault stalls the process for ~5 ms",
                "Swap only supports 32-bit addresses"
              ],
              correct: 2,
              explanation: "A page fault requires reading from disk (~5 ms) vs RAM (~60 ns)  -  about 80,000x slower"
            },
            {
              question: "A Spark job using Python UDFs is much slower than one using native SQL functions. The main memory reason is:",
              options: [
                "Python UDFs use the stack instead of the heap",
                "Each Python UDF call creates a full Python object with reference counting overhead; native SQL stays in JVM heap with raw arrays",
                "Python uses mark-and-sweep GC which is slower",
                "Python UDFs require more CPU registers"
              ],
              correct: 1,
              explanation: "Python object overhead (~28 bytes per int) and serialisation between JVM and Python processes is the bottleneck"
            },
            {
              question: "Converting a Pandas string column with many repeated values to 'category' dtype reduces memory because:",
              options: [
                "Category dtype compresses strings using gzip",
                "Category dtype stores an integer code per row and a single dictionary of unique values, instead of a full string per row",
                "Category dtype uses SRAM instead of DRAM",
                "Category dtype disables garbage collection for that column"
              ],
              correct: 1,
              explanation: "Like an enum/dictionary encoding  -  store an int8 code (1 byte) instead of the full string per row"
            },
          ]} />

          <button
            onClick={async () => { if (completed.has('memory')) { await unmarkTopicComplete('memory'); onUnmark('memory') } else { await markTopicComplete('memory'); onComplete('memory') } }}
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

          <Quiz topicId="storage" questions={[
            {
              question: "Why is sequential I/O so much faster than random I/O on HDDs?",
              options: [
                "Sequential I/O uses a different storage bus",
                "Sequential blocks are read without mechanical seek time or rotational latency  -  the head moves once and sweeps continuously",
                "HDDs cache sequential reads in SRAM",
                "The OS allocates more memory for sequential operations"
              ],
              correct: 1,
              explanation: "Each random I/O requires a seek (~5 ms) + rotational wait (~4 ms) = ~9 ms; sequential reads eliminate most of this"
            },
            {
              question: "A data engineer needs to store 10 years of raw clickstream logs cheaply. No real-time access needed. Which storage type is most cost-effective?",
              options: [
                "NVMe SSD  -  fastest access for future queries",
                "RAID 10 array of SSDs  -  maximum redundancy",
                "HDD-based cold storage or cloud archival (S3 Glacier)  -  cheapest $/GB for rarely accessed data",
                "In-memory storage  -  eliminates disk I/O entirely"
              ],
              correct: 2,
              explanation: "Cold/archival tiers are 10 - 100x cheaper per GB than hot SSD storage for data accessed infrequently"
            },
            {
              question: "NVMe is significantly faster than SATA SSD primarily because:",
              options: [
                "NVMe uses a different type of NAND flash",
                "NVMe drives spin faster than SATA drives",
                "NVMe communicates over the PCIe bus which provides direct high-bandwidth lanes to the CPU, bypassing the SATA controller bottleneck",
                "NVMe has larger cache chips"
              ],
              correct: 2,
              explanation: "SATA was designed for HDDs (600 MB/s ceiling); PCIe 4.0 x4 provides ~7 GB/s  -  the bus, not the flash, was the bottleneck"
            },
          ]} />

          <button
            onClick={async () => { if (completed.has('storage')) { await unmarkTopicComplete('storage'); onUnmark('storage') } else { await markTopicComplete('storage'); onComplete('storage') } }}
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

          <Quiz topicId="os" questions={[
            { question: "What is the main reason Python threads don't achieve true CPU parallelism?", options: ["Python threads are too slow", "The Global Interpreter Lock (GIL) allows only one thread to execute Python bytecode at a time", "Python doesn't support threads", "Threads require kernel mode"], correct: 1 },
            { question: "Which scheduling algorithm does Linux use by default?", options: ["Round Robin", "Priority Scheduling", "Completely Fair Scheduler (CFS)", "First-Come-First-Served"], correct: 2 },
            { question: "When should you use asyncio coroutines instead of threads?", options: ["CPU-bound computations", "When you need true parallelism", "For I/O-bound tasks like API calls and database queries", "For spawning child processes"], correct: 2 },
          ]} />
          <button onClick={async () => { if (completed.has('os')) { await unmarkTopicComplete('os'); onUnmark('os') } else { await markTopicComplete('os'); onComplete('os') } }} className={`complete-btn-inline${completed.has('os') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('os') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="linux" questions={[
            { question: "What does 'set -euo pipefail' do in a bash script?", options: ["Sets environment variables", "Makes the script exit on errors, treat unset variables as errors, and propagate pipe failures", "Enables verbose mode", "Sets file permissions"], correct: 1 },
            { question: "Which command counts the number of occurrences of each unique line in a sorted file?", options: ["wc -l file", "sort file | uniq -c", "grep -c file", "awk '{count[$0]++}' file"], correct: 1 },
            { question: "What is stored in /proc/meminfo?", options: ["Memory configuration files", "Virtual filesystem showing live kernel memory statistics", "RAM hardware specs", "Swap file configuration"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('linux')) { await unmarkTopicComplete('linux'); onUnmark('linux') } else { await markTopicComplete('linux'); onComplete('linux') } }} className={`complete-btn-inline${completed.has('linux') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('linux') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="networking" questions={[
            { question: "What happens during the TCP three-way handshake?", options: ["Data is compressed and sent", "SYN → SYN-ACK → ACK establishes connection before data is sent", "TLS certificates are exchanged", "DNS resolves the IP address"], correct: 1 },
            { question: "What is CIDR notation 10.0.1.0/24?", options: ["An IP address with 24 bits of host portion", "A subnet with 256 addresses where the first 24 bits are the network prefix", "A VLAN tag", "An IPv6 prefix"], correct: 1 },
            { question: "What is the key difference between bandwidth and throughput?", options: ["They are the same thing", "Bandwidth is theoretical maximum capacity; throughput is actual data transferred per second (always ≤ bandwidth)", "Throughput measures latency, bandwidth measures speed", "Bandwidth is for downloads, throughput for uploads"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('networking')) { await unmarkTopicComplete('networking'); onUnmark('networking') } else { await markTopicComplete('networking'); onComplete('networking') } }} className={`complete-btn-inline${completed.has('networking') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('networking') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="docker" questions={[
            { question: "What is the difference between ENTRYPOINT and CMD in a Dockerfile?", options: ["They are identical", "ENTRYPOINT defines the executable that always runs; CMD provides default arguments that can be overridden at runtime", "CMD is for environment variables, ENTRYPOINT is for ports", "ENTRYPOINT is deprecated, use CMD instead"], correct: 1 },
            { question: "What happens to data written inside a container when it stops?", options: ["It is saved to the image", "It persists in the container layer forever", "It is lost unless stored in a volume or bind mount", "It is synced to Docker Hub"], correct: 2 },
            { question: "What is a multi-stage Docker build used for?", options: ["Running multiple services in one container", "Keeping the final image small by separating build dependencies from runtime", "Building on multiple architectures simultaneously", "Caching build layers"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('docker')) { await unmarkTopicComplete('docker'); onUnmark('docker') } else { await markTopicComplete('docker'); onComplete('docker') } }} className={`complete-btn-inline${completed.has('docker') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('docker') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="data-types" questions={[
            { question: "Why should you use DecimalType(18,2) instead of DoubleType for financial amounts?", options: ["Decimal is faster to compute", "DoubleType uses IEEE 754 floating point which cannot represent all decimal fractions exactly  -  0.1 + 0.2 ≠ 0.3", "Decimal uses less storage", "DoubleType doesn't support negative numbers"], correct: 1 },
            { question: "What is type widening vs narrowing?", options: ["Widening adds columns, narrowing removes them", "Widening converts to a larger type (safe, no data loss); narrowing converts to a smaller type (unsafe, may truncate)", "Widening is for strings, narrowing for numbers", "They refer to schema evolution in Parquet"], correct: 1 },
            { question: "What is the best practice for storing timestamps in a data lakehouse?", options: ["Store in local timezone of the source system", "Store in UTC always; convert to local only at display time", "Store as Unix epoch strings", "Store in the timezone of the data warehouse region"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('data-types')) { await unmarkTopicComplete('data-types'); onUnmark('data-types') } else { await markTopicComplete('data-types'); onComplete('data-types') } }} className={`complete-btn-inline${completed.has('data-types') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('data-types') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="file-formats" questions={[
            { question: "Why is Parquet significantly faster than CSV for analytical queries that touch only 3 of 50 columns?", options: ["Parquet is compressed, CSV is not", "Parquet stores data column-by-column  -  the query reads only the 3 needed columns, skipping 94% of the file's I/O", "Parquet has a better index", "Parquet files are cached automatically"], correct: 1 },
            { question: "What is dictionary encoding in Parquet and when does it help most?", options: ["It compresses column names", "It stores unique values once and replaces repeated values with integer indexes  -  most effective for low-cardinality columns like country, status, category", "It encodes the schema in a dictionary", "It deduplicates row groups"], correct: 1 },
            { question: "Why is Avro preferred over Parquet for Kafka streaming?", options: ["Avro is a columnar format", "Avro is row-oriented making it efficient for writing individual events, and supports schema evolution via registry", "Avro has better compression", "Parquet doesn't support streaming"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('file-formats')) { await unmarkTopicComplete('file-formats'); onUnmark('file-formats') } else { await markTopicComplete('file-formats'); onComplete('file-formats') } }} className={`complete-btn-inline${completed.has('file-formats') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('file-formats') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="compression" questions={[
            { question: "Why is Snappy the most common compression codec for Parquet in Spark?", options: ["It has the highest compression ratio", "It balances fast compression/decompression speed with reasonable ratio  -  minimises CPU overhead during queries", "It is the only splittable codec", "It is the only codec supported by Delta Lake"], correct: 1 },
            { question: "What does 'splittable' mean for a compressed file and why does it matter?", options: ["The file can be decompressed in parallel blocks, allowing multiple Spark tasks to read different parts simultaneously", "The file can be split across multiple disks", "The file supports partial writes", "It means the file has multiple compression levels"], correct: 0 },
            { question: "When would you choose Zstd over Snappy for Parquet files?", options: ["For real-time streaming where decompression speed is critical", "For Gold/archive layers where storage cost matters and you can afford slightly more CPU", "For CSV files on HDFS", "When Snappy is not available"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('compression')) { await unmarkTopicComplete('compression'); onUnmark('compression') } else { await markTopicComplete('compression'); onComplete('compression') } }} className={`complete-btn-inline${completed.has('compression') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('compression') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="serialization" questions={[
            { question: "What does 'backward compatible' schema evolution mean in Avro?", options: ["Old consumers can read new data", "New consumers can read old data written with the previous schema", "The schema can be changed without any constraints", "Consumers and producers must be upgraded together"], correct: 1 },
            { question: "Why is Avro preferred over JSON for Kafka events in enterprise systems?", options: ["Avro is human-readable like JSON", "Avro is binary (smaller, faster), enforces a schema via registry, and supports full schema evolution compatibility checks", "Avro supports more data types", "JSON doesn't support nested objects"], correct: 1 },
            { question: "What is the safest schema evolution change you can make to a 'full compatible' Avro schema?", options: ["Rename an existing field", "Remove a required field", "Add a new optional field with a default value", "Change a field's type from int to string"], correct: 2 },
          ]} />
          <button onClick={async () => { if (completed.has('serialization')) { await unmarkTopicComplete('serialization'); onUnmark('serialization') } else { await markTopicComplete('serialization'); onComplete('serialization') } }} className={`complete-btn-inline${completed.has('serialization') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('serialization') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="databases" questions={[
            { question: "Why is a column-oriented database faster for analytical queries like SUM(revenue)?", options: ["It stores less data overall", "All values for a column are stored contiguously  -  the query reads only the revenue column, skipping all other columns", "It uses better compression", "Analytical queries run in parallel automatically"], correct: 1 },
            { question: "Which database type is best suited for storing ML embeddings and performing semantic similarity search?", options: ["OLTP relational database", "Key-value store like Redis", "Vector database like Pinecone or pgvector", "Column-family database like Cassandra"], correct: 2 },
            { question: "What is the main tradeoff of NoSQL databases compared to relational OLTP databases?", options: ["NoSQL is always faster", "NoSQL sacrifices ACID transactions and complex joins for horizontal scalability and schema flexibility", "NoSQL stores less data", "NoSQL requires more storage"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('databases')) { await unmarkTopicComplete('databases'); onUnmark('databases') } else { await markTopicComplete('databases'); onComplete('databases') } }} className={`complete-btn-inline${completed.has('databases') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('databases') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="data-warehouse" questions={[
            { question: "What is the difference between a surrogate key and a natural key?", options: ["They are the same thing", "A surrogate key is system-generated (e.g., IDENTITY/SEQUENCE); a natural key is the business identifier from the source system (e.g., customer_id='CUST001')", "Natural keys are always integers", "Surrogate keys come from the source system"], correct: 1 },
            { question: "In SCD Type 2, how do you identify the current record for a customer?", options: ["The record with the highest surrogate key", "Using is_current = TRUE or WHERE effective_end IS NULL", "The record with the most recent effective_start date", "All records are current in SCD Type 2"], correct: 1 },
            { question: "Why is a star schema preferred over a snowflake schema for Power BI / BI tools?", options: ["Star schemas use less storage", "Star schemas require fewer joins  -  BI tools generate SQL with one level of joins, which is faster and easier to optimise", "Snowflake schemas don't support date dimensions", "Star schemas have better compression"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('data-warehouse')) { await unmarkTopicComplete('data-warehouse'); onUnmark('data-warehouse') } else { await markTopicComplete('data-warehouse'); onComplete('data-warehouse') } }} className={`complete-btn-inline${completed.has('data-warehouse') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('data-warehouse') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="medallion" questions={[
            { question: "Why is Bronze append-only and kept forever?", options: ["Bronze is the cheapest storage layer", "Bronze is the source of truth  -  if Silver/Gold transformation logic has bugs, you can replay/reprocess from Bronze without re-ingesting from source systems", "Bronze tables are too large to delete", "Bronze data is never read after ingestion"], correct: 1 },
            { question: "What type of data transformation should NOT happen in Bronze?", options: ["Adding ingestion metadata columns", "Recording the source file name", "Type casting, deduplication, and joins to lookup tables", "Appending new records as they arrive"], correct: 2 },
            { question: "When should you use a materialised Gold table instead of a view?", options: ["Always  -  views are never used in Gold", "When the aggregation is expensive and many BI users query the same data  -  pre-computation saves repeated compute costs", "Only when using Parquet instead of Delta", "When the source data changes every second"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('medallion')) { await unmarkTopicComplete('medallion'); onUnmark('medallion') } else { await markTopicComplete('medallion'); onComplete('medallion') } }} className={`complete-btn-inline${completed.has('medallion') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('medallion') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="data-quality" questions={[
            { question: "What is the 'quarantine pattern' in data quality?", options: ["Deleting bad records immediately", "Routing failed DQ records to a separate table/queue for investigation and reprocessing rather than silently dropping them", "Encrypting PII data at rest", "Running DQ checks in a separate environment"], correct: 1 },
            { question: "Which data quality dimension checks that data is available when it should be?", options: ["Accuracy", "Uniqueness", "Timeliness", "Validity"], correct: 2 },
            { question: "What is a key advantage of Deequ over Great Expectations for large-scale data engineering?", options: ["Deequ generates better HTML reports", "Deequ is built natively on Spark so DQ checks run distributed across the cluster without converting to Pandas", "Deequ supports more check types", "Deequ integrates with more orchestrators"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('data-quality')) { await unmarkTopicComplete('data-quality'); onUnmark('data-quality') } else { await markTopicComplete('data-quality'); onComplete('data-quality') } }} className={`complete-btn-inline${completed.has('data-quality') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('data-quality') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="data-governance" questions={[
            { question: "What is data lineage and why is it important?", options: ["A list of all databases in the organisation", "A record of where data came from and how it was transformed  -  essential for debugging data issues and assessing impact of schema changes", "The history of schema changes to a table", "A graph of all data consumers"], correct: 1 },
            { question: "Under GDPR's Right to Erasure, what must a data engineer implement?", options: ["Delete the user's account from the operational database only", "Delete all PII for a user across all systems (Bronze, Silver, Gold, backups) when requested, with audit trail", "Anonymise the data by removing the name field", "Archive the data to cold storage"], correct: 1 },
            { question: "What is the difference between pseudonymisation and anonymisation?", options: ["They are the same thing", "Pseudonymisation replaces identifiers with tokens while retaining re-linkability via a key; anonymisation is irreversible  -  re-identification is impossible", "Anonymisation uses hashing, pseudonymisation uses encryption", "Pseudonymisation is stronger than anonymisation"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('data-governance')) { await unmarkTopicComplete('data-governance'); onUnmark('data-governance') } else { await markTopicComplete('data-governance'); onComplete('data-governance') } }} className={`complete-btn-inline${completed.has('data-governance') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('data-governance') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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

          <Quiz topicId="batch-vs-streaming" questions={[
            { question: "What is the main disadvantage of Lambda Architecture compared to Kappa Architecture?", options: ["Lambda is more expensive", "Lambda requires maintaining two separate codebases (batch and streaming) implementing the same business logic", "Lambda doesn't support real-time processing", "Lambda uses more storage"], correct: 1 },
            { question: "What is a watermark in Spark Structured Streaming?", options: ["A data quality check", "A threshold that defines how long to wait for late-arriving data before closing a time window", "A checkpoint for fault tolerance", "A trigger interval"], correct: 1 },
            { question: "When is batch processing the better choice over streaming?", options: ["Always  -  streaming is too complex", "When latency requirements are hourly or daily, data volumes are large, and simplicity/reprocessability are valued over low latency", "When the data source is Kafka", "When you need exactly-once semantics"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('batch-vs-streaming')) { await unmarkTopicComplete('batch-vs-streaming'); onUnmark('batch-vs-streaming') } else { await markTopicComplete('batch-vs-streaming'); onComplete('batch-vs-streaming') } }} className={`complete-btn-inline${completed.has('batch-vs-streaming') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('batch-vs-streaming') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
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
        <defs>
          <linearGradient id="binGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8"/>
            <stop offset="100%" stopColor="#a78bfa"/>
          </linearGradient>
        </defs>
        <text x="10" y="18" fontSize="11" fontWeight="700" fill="#f0f4ff">1 byte = 8 bits</text>
        {[0,1,2,3,4,5,6,7].map(i=>(
          <g key={i}>
            <rect x={10+i*62} y={24} width={54} height={28} rx="5" fill={i<4?'rgba(99,102,241,.2)':'rgba(139,92,246,.2)'} stroke={i<4?'#818cf8':'#a78bfa'} strokeWidth="1.5"/>
            <text x={37+i*62} y={42} fontSize="13" fontWeight="700" fill={i<4?'#818cf8':'#a78bfa'} textAnchor="middle">b{7-i}</text>
          </g>
        ))}
        <text x="10" y="72" fontSize="9" fill="#8896b3">Bit position (b7=MSB … b0=LSB)</text>
        <text x="10" y="92" fontSize="10" fontWeight="700" fill="#c5cfe8">Common values:</text>
        <rect x="10" y="98" width="540" height="16" rx="3" fill="rgba(30,34,65,.8)"/>
        {['Binary','Hex','Decimal'].map((h,i)=><text key={h} x={10+i*185} y="110" fontSize="9" fontWeight="700" fill="#c5cfe8">{h}</text>)}
        {rows.map((r,i)=>(
          <g key={r.dec}>
            <rect x="10" y={116+i*11} width="540" height="10" rx="2" fill={i%2===0?'rgba(22,26,50,.5)':'rgba(15,17,35,.3)'}/>
            <text x="10" y={124+i*11} fontSize="9" fontFamily="monospace" fill="#c5cfe8">{r.bin}</text>
            <text x="195" y={124+i*11} fontSize="9" fontFamily="monospace" fill="#a78bfa">{r.hex}</text>
            <text x="380" y={124+i*11} fontSize="9" fill="#c5cfe8">{r.dec}</text>
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
        <text x="8" y="12" fontSize="11" fontWeight="700" fill="#f0f4ff">Memory Hierarchy — Latency Pyramid</text>
        {layers.map((l,i)=>{
          const w=80+i*55; const x=(480-w)/2; const top=y; y+=l.h+5
          return (
            <g key={l.label}>
              <rect x={x} y={top+16} width={w} height={l.h} rx="4" fill={l.color} opacity=".18" stroke={l.color} strokeWidth="1.5"/>
              <text x={240} y={top+16+l.h/2+4} fontSize="10" fontWeight="700" fill={l.color} textAnchor="middle">{l.label}</text>
              <text x={x+w+6} y={top+16+l.h/2+4} fontSize="8" fill="#8896b3">{l.sub}</text>
            </g>
          )
        })}
        <text x="8" y="198" fontSize="8" fill="#4d5f7a">Faster + smaller ↑    Slower + larger ↓</text>
      </svg>
    </div>
  )
}

function MemoryDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 160" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Stack vs Heap Memory</text>
        {/* Stack */}
        <rect x="20" y="22" width="190" height="130" rx="6" fill="rgba(99,102,241,.08)" stroke="#818cf8" strokeWidth="1.5"/>
        <text x="115" y="36" fontSize="10" fontWeight="700" fill="#818cf8" textAnchor="middle">STACK</text>
        <text x="115" y="47" fontSize="8" fill="#8896b3" textAnchor="middle">Fixed size · LIFO · Fast</text>
        {['main() frame','fn() frame','inner() frame'].map((f,i)=>(
          <g key={f}>
            <rect x="30" y={55+i*28} width="170" height="22" rx="3" fill="rgba(99,102,241,.2)" stroke="#818cf8" strokeWidth="1"/>
            <text x="115" y={70+i*28} fontSize="9" fill="#c5cfe8" textAnchor="middle">{f}</text>
          </g>
        ))}
        <text x="115" y="148" fontSize="8" fill="#818cf8" textAnchor="middle">← grows down</text>
        {/* Heap */}
        <rect x="270" y="22" width="190" height="130" rx="6" fill="rgba(74,222,128,.08)" stroke="#4ade80" strokeWidth="1.5"/>
        <text x="365" y="36" fontSize="10" fontWeight="700" fill="#4ade80" textAnchor="middle">HEAP</text>
        <text x="365" y="47" fontSize="8" fill="#8896b3" textAnchor="middle">Dynamic · GC-managed · Flexible</text>
        {[{l:'Object A',x:280,y:55,w:80,h:20},{l:'List[1,2,3]',x:350,y:60,w:90,h:22},{l:'Dict{}',x:285,y:88,w:60,h:20},{l:'String',x:360,y:95,w:70,h:18}].map(o=>(
          <g key={o.l}>
            <rect x={o.x} y={o.y} width={o.w} height={o.h} rx="3" fill="rgba(74,222,128,.2)" stroke="#4ade80" strokeWidth="1"/>
            <text x={o.x+o.w/2} y={o.y+o.h/2+4} fontSize="8" fill="#c5cfe8" textAnchor="middle">{o.l}</text>
          </g>
        ))}
        <text x="365" y="148" fontSize="8" fill="#4ade80" textAnchor="middle">grows up →</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Storage Hierarchy</text>
        {tiers.map((t,i)=>(
          <g key={t.label}>
            <rect x="8" y={20+i*24} width="220" height="18" rx="3" fill={t.color} opacity=".18" stroke={t.color} strokeWidth="1.2"/>
            <text x="118" y={33+i*24} fontSize="9" fontWeight="600" fill="#f0f4ff" textAnchor="middle">{t.label}</text>
            <text x="240" y={33+i*24} fontSize="9" fill="#8896b3">{t.cap}</text>
            <text x="340" y={33+i*24} fontSize="9" fontFamily="monospace" fill={t.color}>{t.speed}</text>
          </g>
        ))}
        <text x="8" y="170" fontSize="8" fill="#4d5f7a">← Faster / smaller / more expensive  →  Slower / larger / cheaper</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Operating System Layers</text>
        {layers.map((l,i)=>(
          <g key={l.label}>
            <rect x="20" y={20+i*26} width="460" height="20" rx="4" fill={l.color} opacity=".18" stroke={l.color} strokeWidth="1.5"/>
            <text x="250" y={34+i*26} fontSize="9" fontWeight="600" fill="#f0f4ff" textAnchor="middle">{l.label}</text>
          </g>
        ))}
        <line x1="250" y1="115" x2="250" y2="125" stroke="#4d5f7a" strokeWidth="1" markerEnd="url(#arr)"/>
        <text x="250" y="136" fontSize="8" fill="#4d5f7a" textAnchor="middle">syscall crosses user↔kernel boundary</text>
      </svg>
    </div>
  )
}

function LinuxDiagram() {
  const cmds = ['ls -la','grep "\\.py"','sort','head -10']
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 80" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Linux Pipe Pipeline</text>
        {cmds.map((c,i)=>(
          <g key={c}>
            <rect x={10+i*125} y="22" width="110" height="32" rx="6" fill="rgba(15,17,35,.9)" stroke="#818cf8" strokeWidth="1.5"/>
            <text x={65+i*125} y="42" fontSize="10" fontFamily="monospace" fill="#a5f3fc" textAnchor="middle">{c}</text>
            {i<cmds.length-1&&<>
              <line x1={120+i*125} y1="38" x2={135+i*125} y2="38" stroke="#818cf8" strokeWidth="2"/>
              <polygon points={`${135+i*125},34 ${135+i*125},42 ${142+i*125},38`} fill="#818cf8"/>
              <text x={128+i*125} y="30" fontSize="8" fill="#fcd34d" textAnchor="middle">|</text>
            </>}
          </g>
        ))}
        <text x="8" y="75" fontSize="8" fill="#8896b3">stdout of each command pipes to stdin of the next</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">TCP/IP Network Layers</text>
        {layers.map((l,i)=>(
          <g key={l.n}>
            <rect x="20" y={20+i*26} width="340" height="20" rx="4" fill={l.color} opacity=".18" stroke={l.color} strokeWidth="1.5"/>
            <text x="30" y={34+i*26} fontSize="9" fontWeight="700" fill={l.color}>{l.n}</text>
            <text x="160" y={34+i*26} fontSize="8" fill="#8896b3">{l.ex}</text>
          </g>
        ))}
        <text x="380" y="35" fontSize="9" fill="#818cf8" fontWeight="700">Send</text>
        <line x1="390" y1="40" x2="390" y2="112" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 2"/>
        <polygon points="386,108 394,108 390,116" fill="#818cf8"/>
        <text x="410" y="35" fontSize="9" fill="#4ade80" fontWeight="700">Receive</text>
        <line x1="460" y1="116" x2="460" y2="40" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="4 2"/>
        <polygon points="456,44 464,44 460,36" fill="#4ade80"/>
        <text x="8" y="126" fontSize="8" fill="#4d5f7a">Each layer adds/removes headers (encapsulation / decapsulation)</text>
      </svg>
    </div>
  )
}

function DockerDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 155" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Container Isolation</text>
        {/* Container A */}
        <rect x="15" y="22" width="200" height="72" rx="6" fill="rgba(99,102,241,.1)" stroke="#818cf8" strokeWidth="1.5"/>
        <text x="115" y="36" fontSize="9" fontWeight="700" fill="#818cf8" textAnchor="middle">Container A</text>
        {['App Code','Libraries','Python 3.11 Runtime'].map((l,i)=><rect key={l} x="25" y={40+i*16} width="180" height="12" rx="2" fill="rgba(99,102,241,.25)" stroke="#818cf8" strokeWidth=".8"><title>{l}</title></rect>)}
        {['App Code','Libraries','Python 3.11 Runtime'].map((l,i)=><text key={l+'-t'} x="115" y={50+i*16} fontSize="8" fill="#c5cfe8" textAnchor="middle">{l}</text>)}
        {/* Container B */}
        <rect x="285" y="22" width="200" height="72" rx="6" fill="rgba(167,139,250,.1)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="385" y="36" fontSize="9" fontWeight="700" fill="#a78bfa" textAnchor="middle">Container B</text>
        {['App Code','Deps','Node 20 Runtime'].map((l,i)=><rect key={l} x="295" y={40+i*16} width="180" height="12" rx="2" fill="rgba(167,139,250,.25)" stroke="#a78bfa" strokeWidth=".8"/>)}
        {['App Code','Deps','Node 20 Runtime'].map((l,i)=><text key={l+'-t'} x="385" y={50+i*16} fontSize="8" fill="#c5cfe8" textAnchor="middle">{l}</text>)}
        {/* Docker Engine */}
        <rect x="15" y="100" width="470" height="22" rx="4" fill="rgba(251,191,36,.18)" stroke="#fbbf24" strokeWidth="1.5"/>
        <text x="250" y="115" fontSize="9" fontWeight="700" fill="#fbbf24" textAnchor="middle">Docker Engine (container runtime)</text>
        {/* Host OS */}
        <rect x="15" y="128" width="470" height="18" rx="4" fill="rgba(74,222,128,.18)" stroke="#4ade80" strokeWidth="1.5"/>
        <text x="250" y="141" fontSize="9" fontWeight="700" fill="#4ade80" textAnchor="middle">Host OS Kernel + Hardware</text>
      </svg>
    </div>
  )
}

function DataTypesDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 140" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Python Type Hierarchy</text>
        <rect x="195" y="22" width="110" height="18" rx="4" fill="rgba(240,244,255,.1)" stroke="#c5cfe8" strokeWidth="1.2"/>
        <text x="250" y="34" fontSize="9" fontWeight="700" fill="#f0f4ff" textAnchor="middle">object</text>
        {/* Primitives */}
        {['int','float','bool','str','bytes','None'].map((t,i)=>{
          const x=10+i*82; const y=58
          return (<g key={t}>
            <line x1="250" y1="40" x2={x+35} y2={y} stroke="#818cf8" strokeWidth="1" strokeDasharray="3 2"/>
            <rect x={x} y={y} width="72" height="16" rx="3" fill="rgba(99,102,241,.2)" stroke="#818cf8" strokeWidth="1"/>
            <text x={x+36} y={y+11} fontSize="9" fontFamily="monospace" fill="#c5cfe8" textAnchor="middle">{t}</text>
          </g>)
        })}
        {/* Collections */}
        {['list','dict','set','tuple'].map((t,i)=>{
          const x=60+i*100; const y=92
          return (<g key={t}>
            <line x1="250" y1="40" x2={x+40} y2={y} stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 2"/>
            <rect x={x} y={y} width="80" height="16" rx="3" fill="rgba(167,139,250,.2)" stroke="#a78bfa" strokeWidth="1"/>
            <text x={x+40} y={y+11} fontSize="9" fontFamily="monospace" fill="#c5cfe8" textAnchor="middle">{t}</text>
          </g>)
        })}
        <text x="8" y="128" fontSize="8" fill="#818cf8">— Primitives (immutable)</text>
        <text x="160" y="128" fontSize="8" fill="#a78bfa">— Collections (mutable except tuple)</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">File Format Comparison</text>
        {fmts.map((f,i)=>(
          <g key={f.name}>
            <rect x="8" y={20+i*34} width="50" height="26" rx="4" fill={f.color} opacity=".2" stroke={f.color} strokeWidth="1.5"/>
            <text x="33" y={37+i*34} fontSize="10" fontWeight="700" fill={f.color} textAnchor="middle">{f.name}</text>
            <text x="66" y={31+i*34} fontSize="8.5" fill="#8896b3">{f.desc}</text>
            <text x="66" y={43+i*34} fontSize="8" fill="#4ade80">✓ {f.pros}</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Compression Algorithms</text>
        {[
          {name:'Snappy',ratio:'2–3×',speed:'Fastest',use:'Default Parquet/Spark',color:'#818cf8'},
          {name:'Gzip',ratio:'4–6×',speed:'Slow compress, fast decomp',use:'Cold storage, HTTP',color:'#a78bfa'},
          {name:'Zstd',ratio:'3–5×',speed:'Fast+best ratio',use:'Parquet recommended',color:'#4ade80'},
          {name:'LZ4',ratio:'2–3×',speed:'Extremely fast',use:'Shuffle files, cache',color:'#fbbf24'},
        ].map((c,i)=>(
          <g key={c.name}>
            <rect x="8" y={20+i*22} width="60" height="16" rx="3" fill={c.color} opacity=".18" stroke={c.color} strokeWidth="1.2"/>
            <text x="38" y={32+i*22} fontSize="9" fontWeight="700" fill={c.color} textAnchor="middle">{c.name}</text>
            <text x="76" y={32+i*22} fontSize="8.5" fill="#c5cfe8">ratio: {c.ratio}</text>
            <text x="200" y={32+i*22} fontSize="8.5" fill="#8896b3">speed: {c.speed}</text>
            <text x="390" y={32+i*22} fontSize="8.5" fill="#8896b3">use: {c.use}</text>
          </g>
        ))}
        <text x="8" y="115" fontSize="8" fill="#4d5f7a">Trade-off: higher ratio ↔ slower compression speed</text>
      </svg>
    </div>
  )
}

function SerializationDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 100" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Serialization Flow</text>
        {/* Object */}
        <rect x="10" y="22" width="90" height="40" rx="6" fill="rgba(99,102,241,.15)" stroke="#818cf8" strokeWidth="1.5"/>
        <text x="55" y="38" fontSize="9" fontWeight="700" fill="#818cf8" textAnchor="middle">Python Object</text>
        <text x="55" y="52" fontSize="8" fill="#8896b3" textAnchor="middle">{'{id:1, name:"x"}'}</text>
        {/* Serialize arrow */}
        <line x1="100" y1="42" x2="150" y2="42" stroke="#fbbf24" strokeWidth="2"/>
        <polygon points="147,38 155,42 147,46" fill="#fbbf24"/>
        <text x="125" y="36" fontSize="8" fill="#fbbf24" textAnchor="middle">serialize</text>
        {/* Bytes */}
        <rect x="155" y="22" width="100" height="40" rx="6" fill="rgba(251,191,36,.15)" stroke="#fbbf24" strokeWidth="1.5"/>
        <text x="205" y="38" fontSize="9" fontWeight="700" fill="#fbbf24" textAnchor="middle">Bytes on wire</text>
        <text x="205" y="52" fontSize="8" fontFamily="monospace" fill="#8896b3" textAnchor="middle">0x00 0x01 0xF3…</text>
        {/* Deserialize arrow */}
        <line x1="255" y1="42" x2="305" y2="42" stroke="#4ade80" strokeWidth="2"/>
        <polygon points="302,38 310,42 302,46" fill="#4ade80"/>
        <text x="280" y="36" fontSize="8" fill="#4ade80" textAnchor="middle">deserialize</text>
        {/* Target Object */}
        <rect x="310" y="22" width="90" height="40" rx="6" fill="rgba(74,222,128,.15)" stroke="#4ade80" strokeWidth="1.5"/>
        <text x="355" y="38" fontSize="9" fontWeight="700" fill="#4ade80" textAnchor="middle">Target Object</text>
        <text x="355" y="52" fontSize="8" fill="#8896b3" textAnchor="middle">Java / Go / Spark</text>
        {/* Format labels */}
        {['Avro','Protobuf','JSON','Parquet'].map((f,i)=>(
          <g key={f}>
            <rect x={410+i*0} y={22+i*18} width="50" height="13" rx="3" fill="rgba(167,139,250,.15)" stroke="#a78bfa" strokeWidth="1"/>
            <text x="435" y={32+i*18} fontSize="8" fill="#a78bfa" textAnchor="middle">{f}</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">OLTP vs OLAP vs HTAP</text>
        {/* OLTP */}
        <circle cx="130" cy="75" r="55" fill="rgba(99,102,241,.12)" stroke="#818cf8" strokeWidth="2"/>
        <text x="130" y="55" fontSize="10" fontWeight="700" fill="#818cf8" textAnchor="middle">OLTP</text>
        <text x="130" y="68" fontSize="8" fill="#c5cfe8" textAnchor="middle">Many small writes</text>
        <text x="130" y="79" fontSize="8" fill="#c5cfe8" textAnchor="middle">Normalized</text>
        <text x="130" y="90" fontSize="8" fill="#c5cfe8" textAnchor="middle">Transactional</text>
        {/* OLAP */}
        <circle cx="370" cy="75" r="55" fill="rgba(167,139,250,.12)" stroke="#a78bfa" strokeWidth="2"/>
        <text x="370" y="55" fontSize="10" fontWeight="700" fill="#a78bfa" textAnchor="middle">OLAP</text>
        <text x="370" y="68" fontSize="8" fill="#c5cfe8" textAnchor="middle">Few large reads</text>
        <text x="370" y="79" fontSize="8" fill="#c5cfe8" textAnchor="middle">Denormalized</text>
        <text x="370" y="90" fontSize="8" fill="#c5cfe8" textAnchor="middle">Analytical</text>
        {/* HTAP overlap */}
        <text x="250" y="72" fontSize="9" fontWeight="700" fill="#fbbf24" textAnchor="middle">HTAP</text>
        <text x="250" y="84" fontSize="7.5" fill="#fcd34d" textAnchor="middle">both</text>
        <text x="8" y="126" fontSize="8" fill="#4d5f7a">HTAP = Hybrid Transactional/Analytical (e.g. Databricks, Snowflake)</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Medallion Architecture Flow</text>
        {layers.map((l,i)=>(
          <g key={l.label}>
            <rect x="8" y={20+i*27} width="340" height="20" rx="4" fill={l.color} opacity=".18" stroke={l.color} strokeWidth="1.5"/>
            <text x="178" y={34+i*27} fontSize="9" fontWeight="600" fill="#f0f4ff" textAnchor="middle">{l.label}</text>
            <text x="356" y={34+i*27} fontSize="8" fill="#8896b3">{l.sub}</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Medallion Zones + DQ Gates</text>
        {zones.map((z,i)=>(
          <g key={z.label}>
            <rect x={10+i*162} y="22" width="148" height="70" rx="6" fill={z.color} opacity=".12" stroke={z.color} strokeWidth="1.5"/>
            <text x={84+i*162} y="38" fontSize="11" fontWeight="800" fill={z.color} textAnchor="middle">{z.label}</text>
            <text x={84+i*162} y="52" fontSize="7.5" fill="#c5cfe8" textAnchor="middle">{z.sub}</text>
            <rect x={18+i*162} y="60" width="132" height="26" rx="3" fill={z.color} opacity=".15" stroke={z.color} strokeWidth="1"/>
            <text x={84+i*162} y="70" fontSize="7" fill="#f0f4ff" textAnchor="middle">DQ gate:</text>
            <text x={84+i*162} y="82" fontSize="7" fill="#c5cfe8" textAnchor="middle">{z.rules}</text>
            {i<zones.length-1&&<>
              <polygon points={`158+${i*162},57 166+${i*162},57 162+${i*162},65`} fill={z.color} opacity=".5"/>
            </>}
          </g>
        ))}
        <text x="8" y="125" fontSize="8" fill="#4d5f7a">Arrows with gates — failed DQ → dead-letter queue, not dropped silently</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Data Quality Dimensions</text>
        <circle cx="280" cy="75" r="28" fill="rgba(99,102,241,.12)" stroke="#818cf8" strokeWidth="1"/>
        <text x="280" y="72" fontSize="8" fontWeight="700" fill="#f0f4ff" textAnchor="middle">DQ</text>
        <text x="280" y="83" fontSize="7" fill="#8896b3" textAnchor="middle">Framework</text>
        {dims.map(d=>(
          <g key={d.label}>
            <line x1="280" y1="75" x2={d.x} y2={d.y+10} stroke={d.color} strokeWidth="1" strokeDasharray="3 2" opacity=".6"/>
            <rect x={d.x-55} y={d.y} width="110" height="28" rx="6" fill={d.color} opacity=".15" stroke={d.color} strokeWidth="1.5"/>
            <text x={d.x} y={d.y+12} fontSize="8.5" fontWeight="700" fill={d.color} textAnchor="middle">{d.label}</text>
            <text x={d.x} y={d.y+23} fontSize="7.5" fill="#c5cfe8" textAnchor="middle">{d.desc}</text>
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
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Data Governance Hierarchy</text>
        {/* Council */}
        <rect x="175" y="20" width="150" height="22" rx="5" fill="rgba(99,102,241,.2)" stroke="#818cf8" strokeWidth="1.5"/>
        <text x="250" y="35" fontSize="9" fontWeight="700" fill="#818cf8" textAnchor="middle">Data Governance Council</text>
        {/* Stewards */}
        <line x1="250" y1="42" x2="250" y2="55" stroke="#818cf8" strokeWidth="1.2"/>
        <rect x="125" y="55" width="250" height="20" rx="4" fill="rgba(167,139,250,.18)" stroke="#a78bfa" strokeWidth="1.2"/>
        <text x="250" y="68" fontSize="9" fontWeight="600" fill="#a78bfa" textAnchor="middle">Data Stewards (domain leads)</text>
        {/* Owners */}
        <line x1="250" y1="75" x2="250" y2="88" stroke="#a78bfa" strokeWidth="1.2"/>
        {['Data Owners','Platform Owners'].map((o,i)=>(
          <g key={o}>
            <rect x={90+i*185} y="88" width="160" height="18" rx="4" fill="rgba(251,191,36,.18)" stroke="#fbbf24" strokeWidth="1.2"/>
            <text x={170+i*185} y="100" fontSize="8.5" fontWeight="600" fill="#fbbf24" textAnchor="middle">{o}</text>
            <line x1="250" y1="88" x2={170+i*185} y2="88" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 2"/>
          </g>
        ))}
        {/* Users */}
        <line x1="250" y1="106" x2="250" y2="118" stroke="#fbbf24" strokeWidth="1.2"/>
        <rect x="90" y="118" width="320" height="18" rx="4" fill="rgba(74,222,128,.15)" stroke="#4ade80" strokeWidth="1.2"/>
        <text x="250" y="130" fontSize="8.5" fontWeight="600" fill="#4ade80" textAnchor="middle">Data Consumers (analysts, scientists, engineers)</text>
        <text x="8" y="146" fontSize="8" fill="#4d5f7a">Policies flow top-down; access requests flow bottom-up</text>
      </svg>
    </div>
  )
}

function BatchStreamDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 520 130" width="100%" style={{display:'block'}}>
        <text x="8" y="14" fontSize="11" fontWeight="700" fill="#f0f4ff">Batch vs Streaming Processing</text>
        {/* Batch */}
        <text x="8" y="30" fontSize="9" fontWeight="700" fill="#818cf8">BATCH</text>
        {[0,1,2,3,4,5].map(i=>(
          <g key={i}>
            <rect x={8+i*40} y="34" width="34" height="18" rx="2" fill="rgba(99,102,241,.2)" stroke="#818cf8" strokeWidth="1"/>
            <text x={25+i*40} y="47" fontSize="7" fill="#c5cfe8" textAnchor="middle">t={i}</text>
          </g>
        ))}
        <rect x="8" y="58" width="232" height="14" rx="3" fill="rgba(99,102,241,.3)" stroke="#818cf8" strokeWidth="1.5"/>
        <text x="124" y="68" fontSize="8" fontWeight="700" fill="#818cf8" textAnchor="middle">Process entire batch at midnight</text>
        <text x="8" y="82" fontSize="7.5" fill="#8896b3">Latency: hours   Throughput: very high   Cost: efficient</text>
        {/* Streaming */}
        <text x="8" y="98" fontSize="9" fontWeight="700" fill="#4ade80">STREAMING</text>
        {[0,1,2,3,4,5,6,7].map(i=>(
          <g key={i}>
            <rect x={8+i*30} y="102" width="24" height="14" rx="2" fill="rgba(74,222,128,.1)" stroke="#4ade80" strokeWidth="1" opacity={0.4+i*0.075}/>
            <polygon points={`${37+i*30},109 ${33+i*30},105 ${33+i*30},113`} fill="#4ade80" opacity=".6"/>
          </g>
        ))}
        <text x="8" y="126" fontSize="7.5" fill="#8896b3">Latency: ms–sec   Each event processed individually   Always-on</text>
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

    const pastelColors = ['rgba(165,180,252,', 'rgba(196,181,253,', 'rgba(167,243,208,', 'rgba(253,230,138,', 'rgba(249,168,212,']

    const draw = () => {
      ctx.clearRect(0, 0, 600, 120)
      ctx.fillStyle = '#04060f'
      ctx.fillRect(0, 0, 600, 120)

      ctx.font = '13px monospace'
      chars.forEach((c, idx) => {
        c.y += c.speed
        if (c.y > 120) { c.y = 0; c.x = Math.random() * 600; c.val = Math.random() > 0.5 ? '1' : '0' }
        const col = pastelColors[idx % pastelColors.length]
        ctx.fillStyle = `${col}${c.opacity})`
        ctx.fillText(c.val, c.x, c.y)
      })

      // Draw "Hello" in ASCII binary in the centre
      ctx.fillStyle = 'rgba(99,102,241,0.15)'
      ctx.fillRect(0, 38, 600, 44)
      ctx.font = 'bold 15px monospace'
      ctx.fillStyle = '#a5b4fc'
      const textW = ctx.measureText(bitsFlat).width
      ctx.fillText(bitsFlat, (600 - textW) / 2, 66)

      ctx.font = '11px monospace'
      ctx.fillStyle = 'rgba(197,207,232,0.5)'
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
    <div className="anim-wrap" style={{ margin: '20px 0', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--border)', overflowX: 'auto' }}>
      <svg viewBox="0 0 640 260" style={{ width: '100%', maxWidth: 640, display: 'block' }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#818cf8" />
          </marker>
          <style>{`
            @keyframes dash { to { stroke-dashoffset: -20; } }
            .flow { stroke-dasharray: 6 4; animation: dash 1s linear infinite; }
            .flow2 { stroke-dasharray: 6 4; animation: dash 1.5s linear infinite; }
            .flow3 { stroke-dasharray: 6 4; animation: dash 2s linear infinite; }
          `}</style>
        </defs>

        {/* CPU die */}
        <rect x="200" y="80" width="240" height="120" rx="10" fill="rgba(15,17,35,.9)" stroke="#818cf8" strokeWidth="2" />
        <text x="320" y="100" textAnchor="middle" fill="#00e87a" fontSize="11" fontWeight="700">CPU</text>

        {/* L1 cache */}
        <rect x="215" y="108" width="60" height="28" rx="4" fill="rgba(99,102,241,.1)" stroke="#818cf8" strokeWidth="1.5" />
        <text x="245" y="124" textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="600">L1 ~1ns</text>
        <text x="245" y="134" textAnchor="middle" fill="#a5b4fc" fontSize="8">32 KB</text>

        {/* L2 cache */}
        <rect x="290" y="108" width="60" height="28" rx="4" fill="rgba(167,139,250,.1)" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="320" y="124" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">L2 ~4ns</text>
        <text x="320" y="134" textAnchor="middle" fill="#c4b5fd" fontSize="8">256 KB</text>

        {/* L3 cache */}
        <rect x="365" y="108" width="60" height="28" rx="4" fill="rgba(196,181,253,.1)" stroke="#c4b5fd" strokeWidth="1.5" />
        <text x="395" y="124" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="600">L3 ~10ns</text>
        <text x="395" y="134" textAnchor="middle" fill="#ddd6fe" fontSize="8">8 - 32 MB</text>

        {/* ALU */}
        <rect x="215" y="150" width="80" height="34" rx="4" fill="rgba(74,222,128,.08)" stroke="#4ade80" strokeWidth="1.5" />
        <text x="255" y="168" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">ALU</text>
        <text x="255" y="178" textAnchor="middle" fill="#86efac" fontSize="8">Arithmetic</text>

        {/* CU */}
        <rect x="310" y="150" width="80" height="34" rx="4" fill="rgba(251,191,36,.08)" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="350" y="168" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">Control Unit</text>
        <text x="350" y="178" textAnchor="middle" fill="#fcd34d" fontSize="8">Fetch/Decode</text>

        {/* RAM */}
        <rect x="30" y="100" width="100" height="50" rx="6" fill="rgba(99,102,241,.1)" stroke="#818cf8" strokeWidth="1.5" />
        <text x="80" y="123" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="700">RAM</text>
        <text x="80" y="136" textAnchor="middle" fill="#818cf8" fontSize="8">16 - 64 GB • ~60ns</text>

        {/* SSD */}
        <rect x="510" y="80" width="110" height="40" rx="6" fill="rgba(251,191,36,.08)" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="565" y="98" textAnchor="middle" fill="#fcd34d" fontSize="10" fontWeight="700">NVMe SSD</text>
        <text x="565" y="110" textAnchor="middle" fill="#fbbf24" fontSize="8">~7 GB/s • ~20µs</text>

        {/* HDD */}
        <rect x="510" y="140" width="110" height="40" rx="6" fill="rgba(248,113,113,.08)" stroke="#f87171" strokeWidth="1.5" />
        <text x="565" y="158" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="700">HDD</text>
        <text x="565" y="170" textAnchor="middle" fill="#f87171" fontSize="8">~150 MB/s • ~5ms</text>

        {/* Arrows: RAM ↔ CPU */}
        <line x1="130" y1="120" x2="198" y2="150" stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#arrow)" className="flow" />
        <line x1="198" y1="145" x2="130" y2="118" stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#arrow)" className="flow" />

        {/* Arrows: CPU → SSD */}
        <line x1="442" y1="120" x2="508" y2="100" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrow)" className="flow2" />

        {/* Arrows: CPU → HDD */}
        <line x1="442" y1="165" x2="508" y2="160" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#arrow)" className="flow3" />

        {/* Labels */}
        <text x="320" y="248" textAnchor="middle" fill="#4d5f7a" fontSize="9">Arrows show data flow  -  animated dashes indicate active transfers</text>
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
    <svg viewBox="0 0 640 160" className="anim-wrap" style={{ display:'block', width: '100%', maxWidth:700, maxHeight: 160, borderRadius: 'var(--radius-xl)', background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: 16 }}>
      {[
        { x: 60,  label: 'Client',     color: '#818cf8' },
        { x: 200, label: 'DNS',        color: '#a78bfa' },
        { x: 340, label: 'API GW',     color: '#4ade80' },
        { x: 480, label: 'App Server', color: '#fbbf24' },
        { x: 590, label: 'DB',         color: '#f87171' },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy="80" r="26" fill="rgba(22,26,50,.9)" stroke={n.color} strokeWidth="2"/>
          <text x={n.x} y="84" textAnchor="middle" fill={n.color} fontSize="9" fontWeight="700">{n.label}</text>
        </g>
      ))}
      {([[60,200],[200,340],[340,480],[480,590]] as [number,number][]).map(([x1,x2], i) => (
        <g key={i}>
          <line x1={x1+26} y1="80" x2={x2-26} y2="80" stroke="rgba(99,102,241,.3)" strokeWidth="2"/>
          <circle r="5" fill="#818cf8" opacity="0.9">
            <animateMotion path={`M${x1+26},80 L${x2-26},80`} dur={`${0.8 + i*0.2}s`} repeatCount="indefinite"/>
          </circle>
        </g>
      ))}
      <text x="320" y="148" textAnchor="middle" fill="#4d5f7a" fontSize="9">TCP/IP packet flow through OSI layers 1 - 7</text>
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
          <button key={f} onClick={() => setActive(i)} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${active===i?'#818cf8':'rgba(99,102,241,.3)'}`, background: active === i ? '#818cf8' : 'transparent', color: active === i ? 'white' : 'var(--text-2)', fontWeight: 600, fontSize: '.83rem', cursor: 'pointer' }}>{f}</button>
        ))}
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} style={{ borderBottom: '1px solid rgba(99,102,241,.15)' }}>
                {row.map((cell, c) => {
                  const isHighlighted = active === 0 ? r > 0 : c === 3
                  const isHeader = r === 0
                  return (
                    <td key={c} style={{
                      padding: '8px 12px',
                      background: isHighlighted ? 'rgba(99,102,241,.18)' : isHeader ? 'rgba(30,34,65,.8)' : 'transparent',
                      fontWeight: isHeader || (active === 1 && c === 3) ? 700 : 400,
                      color: isHighlighted && active === 1 ? '#818cf8' : 'var(--text-2)',
                      transition: 'background .3s',
                    }}>{cell}</td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: '.8rem', color: 'var(--text-2)' }}>
        {active === 0
          ? 'Row storage: SELECT SUM(amount) must read all 5 columns (highlighted rows = full row scan)'
          : 'Columnar: SELECT SUM(amount) reads only the amount column (highlighted)  -  80% less I/O'}
      </div>
    </div>
  )
}

function ParquetInternalsAnimation() {
  return (
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '.9rem', color: 'var(--text-1)' }}>Parquet File Structure</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* File level */}
        <div style={{ background: 'rgba(15,17,35,.9)', color: '#8896b3', borderRadius: 8, padding: '8px 14px', fontSize: '.8rem', fontFamily: 'monospace', border: '1px solid rgba(99,102,241,.2)' }}>
          📄 orders.parquet (file header + footer with metadata)
        </div>
        {/* Row groups */}
        {[
          { label: 'Row Group 0 (rows 0 - 131072, ~128MB)', cols: ['id: INT64', 'name: BINARY (dict)', 'amount: DOUBLE', 'ts: INT64 (delta)'] },
          { label: 'Row Group 1 (rows 131073 - 262144, ~128MB)', cols: ['id: INT64', 'name: BINARY (dict)', 'amount: DOUBLE', 'ts: INT64 (delta)'] },
        ].map((rg, i) => (
          <div key={i} style={{ marginLeft: 20, background: 'rgba(22,26,50,.85)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: '#818cf8', fontWeight: 700, marginBottom: 8 }}>📦 {rg.label}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rg.cols.map(col => (
                <div key={col} style={{ background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.35)', borderRadius: 6, padding: '4px 10px', fontSize: '.74rem', fontFamily: 'monospace', color: '#a5b4fc' }}>
                  🗂 {col}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: '.72rem', color: 'var(--text-3)' }}>Each column chunk → Pages (1MB) → encoded + compressed independently</div>
          </div>
        ))}
        <div style={{ marginLeft: 20, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 8, padding: '8px 14px', fontSize: '.75rem', color: '#4ade80', fontFamily: 'monospace' }}>
          📋 Footer: schema, row group offsets, column stats (min/max), bloom filters
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
        Column stats in footer enable <strong style={{color:'#c5cfe8'}}>predicate pushdown</strong>: if WHERE amount &gt; 1000 and max(amount) in row group = 500, the entire row group is skipped.
      </div>
    </div>
  )
}

function MedallionAnimation() {
  return (
    <div className="anim-wrap" style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      {[
        { label: 'Source\nSystem', icon: '🔌', color: '#8896b3', bg: 'rgba(15,17,35,.8)' },
        { label: 'Bronze\nRaw', icon: '🥉', color: '#fbbf24', bg: 'rgba(251,191,36,.08)' },
        { label: 'Silver\nClean', icon: '🥈', color: '#818cf8', bg: 'rgba(99,102,241,.1)' },
        { label: 'Gold\nBiz Ready', icon: '🥇', color: '#fbbf24', bg: 'rgba(251,191,36,.1)' },
        { label: 'BI / ML\nConsumers', icon: '📊', color: '#a78bfa', bg: 'rgba(167,139,250,.1)' },
      ].map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 18px', background: n.bg, border: `1.5px solid ${n.color}60`, borderRadius: 'var(--radius-xl)', minWidth: 90, textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem' }}>{n.icon}</div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: n.color, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{n.label}</div>
          </div>
          {i < 4 && <div style={{ fontSize: '1.4rem', color: '#4d5f7a', padding: '0 4px' }}>→</div>}
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
              <rect x="30" y={s.y} width="200" height="40" rx="8" fill={step === i ? s.color : 'rgba(22,26,50,.85)'} stroke={s.color} strokeWidth={step === i ? 2.5 : 1.5} />
              <text x="130" y={s.y + 24} textAnchor="middle" fill={step === i ? '#04060f' : s.color} fontSize="11" fontWeight="700">{s.label}</text>
              {i < 3 && <path d="M130,0 L125,10 L135,10 Z" transform={`translate(0,${s.y+40})`} fill={s.color} opacity="0.7"/>}
            </g>
          ))}
          <rect x="270" y="10" width="230" height="240" rx="12" fill="rgba(22,26,50,.85)" stroke="var(--border)" strokeWidth="1.5"/>
          <text x="385" y="35" textAnchor="middle" fill="#c5cfe8" fontSize="11" fontWeight="700">{steps[step].label}</text>
          <foreignObject x="280" y="45" width="210" height="180">
            <div style={{ fontSize: '.78rem', color: '#8896b3', lineHeight: 1.6, padding: '0 4px' }}>{steps[step].desc}</div>
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
        <div style={{ background: 'rgba(15,17,35,.9)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 6 }}>Equivalent payload as JSON:</div>
          <pre style={{ margin: 0, fontSize: '.72rem', color: '#c5cfe8', lineHeight: 1.5, overflowX: 'auto' }}>{example}</pre>
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
          <div style={{ background: 'rgba(15,17,35,.9)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Typical response time</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: t.color, fontSize: '.95rem' }}>{t.time}</div>
          </div>
          <div style={{ background: 'rgba(15,17,35,.9)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Data scanned</div>
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
    <div className="anim-wrap" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 16, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '.9rem', color: 'var(--text-1)' }}>Data Lineage — where does data come from?</div>
      <svg viewBox="0 0 640 240" style={{ width: '100%', maxWidth: 640, display: 'block' }}>
        <defs>
          <marker id="gov-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#4d5f7a" />
          </marker>
          <style>{`@keyframes gov-dash { to { stroke-dashoffset: -18; } } .gov-flow { stroke-dasharray: 5 3; animation: gov-dash 1.2s linear infinite; }`}</style>
        </defs>
        {edges.map(([a, b], i) => {
          const na = getNode(a), nb = getNode(b)
          return <line key={i} x1={na.x+40} y1={na.y} x2={nb.x-40} y2={nb.y} stroke="#4d5f7a" strokeWidth="1.5" markerEnd="url(#gov-arrow)" className="gov-flow"/>
        })}
        {nodes.map((n, i) => (
          <g key={i}>
            <rect x={n.x-40} y={n.y-20} width={80} height={40} rx="8" fill="rgba(22,26,50,.9)" stroke={n.color} strokeWidth="1.5"/>
            <text x={n.x} y={n.y+2} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="700" style={{ whiteSpace: 'pre-line' }}>{n.label.split('\n')[0]}</text>
            <text x={n.x} y={n.y+13} textAnchor="middle" fill={n.color} fontSize="8" opacity="0.8">{n.label.split('\n')[1]}</text>
          </g>
        ))}
        <text x="320" y="228" textAnchor="middle" fill="#4d5f7a" fontSize="9">Unity Catalog tracks every transformation — click any table to see its full lineage</text>
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
                <div key={i} style={{ width: 36, height: 28, borderRadius: 6, background: done ? '#818cf8' : 'rgba(30,34,65,.8)', border: `1px solid ${done ? '#818cf8' : 'rgba(99,102,241,.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontFamily: 'monospace', color: done ? '#04060f' : '#8896b3', transition: 'background .3s' }}>e{i}</div>
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
                <div key={i} style={{ width: 40, height: 32, borderRadius: 6, background: active ? '#4ade80' : 'rgba(30,34,65,.8)', border: `1px solid ${active ? '#4ade80' : 'rgba(74,222,128,.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontFamily: 'monospace', color: active ? '#04060f' : '#8896b3', transition: 'background .1s' }}>e{(tick-streamEvents.length+i+1)%100}</div>
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
    <svg viewBox="0 0 600 280" className="anim-wrap" style={{ display:'block', width: '100%', maxWidth:700, maxHeight: 260, borderRadius: 'var(--radius-xl)', background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: 16 }}>
      {/* Lines from fact to dims */}
      {dims.map((d, i) => (
        <line key={i} x1={cx} y1={cy} x2={d.x} y2={d.y} stroke="rgba(99,102,241,.3)" strokeWidth="1.5" strokeDasharray="4 2"/>
      ))}
      {/* Fact table */}
      <rect x={cx-60} y={cy-30} width={120} height={60} rx="8" fill="rgba(15,17,35,.9)" stroke="#818cf8" strokeWidth="2"/>
      <text x={cx} y={cy-8} textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="700">fact_sales</text>
      <text x={cx} y={cy+8} textAnchor="middle" fill="#8896b3" fontSize="8">quantity, revenue</text>
      <text x={cx} y={cy+20} textAnchor="middle" fill="#8896b3" fontSize="8">date_sk, customer_sk...</text>
      {/* Dim tables */}
      {dims.map((d, i) => (
        <g key={i}>
          <rect x={d.x-50} y={d.y-18} width={100} height={36} rx="6" fill="rgba(22,26,50,.9)" stroke={d.color} strokeWidth="1.5"/>
          <text x={d.x} y={d.y+5} textAnchor="middle" fill={d.color} fontSize="10" fontWeight="700">{d.label}</text>
        </g>
      ))}
      <text x={300} y={270} textAnchor="middle" fill="#4d5f7a" fontSize="9">Star Schema: fact_sales surrounded by 5 dimension tables</text>
    </svg>
  )
}
