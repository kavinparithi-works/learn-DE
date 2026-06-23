import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 1 - Computer Fundamentals', items: [
    { id: 'binary', label: 'Binary and Number Systems' },
    { id: 'cpu', label: 'CPU, Memory and Storage' },
    { id: 'os', label: 'Operating Systems' },
    { id: 'networking', label: 'Networking Basics' },
  ]},
  { title: 'Level 2 - Data Fundamentals', items: [
    { id: 'data-types', label: 'Data Types and Schemas' },
    { id: 'file-formats', label: 'File Formats: CSV, JSON, Parquet, Avro' },
    { id: 'medallion', label: 'Medallion Architecture' },
    { id: 'databases', label: 'Databases vs Data Warehouses vs Data Lakes' },
  ]},
]

export default function Foundations({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('binary')
  const sectionRefs = useRef<Record<string, HTMLElement>>({})

  const scrollTo = (id: string) => {
    setActiveId(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

        {/* BINARY */}
        <section id="binary" ref={el => { if (el) sectionRefs.current['binary'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Binary and Number Systems</h1>
            <p className="topic-desc">Everything in a computer is stored as 0s and 1s. Understanding binary is the foundation of understanding data storage, processing, and networking.</p>
          </div>

          <BinaryAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>Why Binary?</h3>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16 }}>
            Computers use binary because transistors - the physical switches inside a CPU - have exactly two states: ON (1) and OFF (0). This maps perfectly to Boolean logic (true/false) and electrical circuits.
          </p>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>1 byte = 8 bits.</strong> A bit is a single 0 or 1. A byte can represent 256 different values (2^8). All data - text, images, video - is just bytes.</div>
          </div>

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>Number Systems</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { name: 'Binary', base: 'Base 2', digits: '0-1', example: '1010 = 10' },
              { name: 'Octal', base: 'Base 8', digits: '0-7', example: '12 = 10' },
              { name: 'Decimal', base: 'Base 10', digits: '0-9', example: '10 = 10' },
              { name: 'Hexadecimal', base: 'Base 16', digits: '0-F', example: '0xA = 10' },
            ].map(ns => (
              <div key={ns.name} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>{ns.name}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>{ns.base} | Digits: {ns.digits}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', marginTop: 6, color: 'var(--blue-600)' }}>{ns.example}</div>
              </div>
            ))}
          </div>

          <CodeBlock lang="python">{`# Python number conversions
decimal = 42
print(bin(decimal))   # '0b101010'  - binary
print(oct(decimal))   # '0o52'      - octal
print(hex(decimal))   # '0x2a'      - hexadecimal

# Convert back to decimal
print(int('101010', 2))  # 42 from binary
print(int('2a', 16))     # 42 from hex

# Bit operations - crucial for data engineering masks and flags
a, b = 0b1100, 0b1010
print(a & b)   # AND  -> 0b1000 = 8
print(a | b)   # OR   -> 0b1110 = 14
print(a ^ b)   # XOR  -> 0b0110 = 6
print(a << 1)  # Left shift  -> 0b11000 = 24
print(a >> 1)  # Right shift -> 0b0110 = 6`}</CodeBlock>

          <Quiz topicId="binary" questions={[
            { question: "How many different values can 1 byte represent?", options: ["8", "16", "128", "256"], correct: 3 },
            { question: "What is the decimal value of binary 1010?", options: ["5", "8", "10", "12"], correct: 2 },
            { question: "In data engineering, why is hexadecimal commonly used for memory addresses?", options: ["It's faster to compute", "Each hex digit represents exactly 4 bits, making it compact", "It uses less storage", "Computers only understand hex"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('binary'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>
            Mark Complete ✓
          </button>
        </section>

        {/* CPU */}
        <section id="cpu" ref={el => { if (el) sectionRefs.current['cpu'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">CPU, Memory and Storage</h1>
            <p className="topic-desc">Understanding the hardware hierarchy directly impacts how you write efficient Spark jobs, tune memory settings, and diagnose performance issues.</p>
          </div>

          <CpuAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>The Memory Hierarchy</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {[
              { level: 'CPU Registers', speed: '< 1ns', size: 'Bytes', color: '#ef4444', desc: 'Fastest, inside CPU, holds current instruction data' },
              { level: 'L1/L2/L3 Cache', speed: '1-10ns', size: 'KB-MB', color: '#f97316', desc: 'SRAM, built into CPU, avoids slow RAM fetches (cache miss = 100x slower)' },
              { level: 'RAM (DRAM)', speed: '60-100ns', size: 'GB', color: '#f59e0b', desc: 'Working memory for active processes, volatile, Spark uses this heavily' },
              { level: 'NVMe SSD', speed: '50-100μs', size: 'TB', color: '#22c55e', desc: 'Local disk, fast but 1000x slower than RAM, Spark spills here' },
              { level: 'HDD / Network Storage', speed: '1-10ms', size: 'TB-PB', color: '#3b82f6', desc: 'ADLS Gen2, S3, Delta Lake live here - slowest tier' },
            ].map(m => (
              <div key={m.level} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'white' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                <div style={{ minWidth: 160, fontWeight: 700, fontSize: '.88rem' }}>{m.level}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', color: 'var(--blue-600)', minWidth: 80 }}>{m.speed}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', color: 'var(--purple-600)', minWidth: 60 }}>{m.size}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            ))}
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body"><strong>Spark and the memory hierarchy:</strong> Spark keeps RDDs in RAM for fast reuse. When executor memory is exhausted it spills to disk (NVMe) - 1000x slower. Always size your executor memory to avoid spills. Use <code>spark.executor.memory</code> and <code>spark.memory.fraction</code>.</div>
          </div>

          <CodeBlock lang="python">{`# Spark memory configuration - understanding hardware tiers
spark = SparkSession.builder \\
    .config("spark.executor.memory", "8g")       # Total executor memory (RAM)
    .config("spark.executor.cores", "4")          # CPU cores per executor
    .config("spark.memory.fraction", "0.6")       # 60% for execution+storage
    .config("spark.memory.storageFraction", "0.5")# 50% of above for RDD cache
    .config("spark.sql.shuffle.partitions", "200")# Shuffle output partitions
    .getOrCreate()

# Check if spilling is occurring
df.explain(True)  # Look for "Exchange" nodes (shuffles = network + disk I/O)`}</CodeBlock>

          <Quiz topicId="cpu" questions={[
            { question: "Why does a Spark cache miss hurt performance so much?", options: ["It re-runs the entire job", "Data must be fetched from disk (1000x slower than RAM)", "It causes a shuffle", "It increases network traffic"], correct: 1 },
            { question: "What is L1/L2 cache?", options: ["A Redis cache", "Fast SRAM built into the CPU to avoid slow RAM fetches", "A Spark cache layer", "A type of SSD"], correct: 1 },
            { question: "When Spark executor memory is exhausted, data spills to:", options: ["RAM on another node", "The JVM heap", "Local disk (NVMe/SSD)", "ADLS Gen2"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('cpu'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>
            Mark Complete ✓
          </button>
        </section>

        {/* OS */}
        <section id="os" ref={el => { if (el) sectionRefs.current['os'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Operating Systems</h1>
            <p className="topic-desc">Linux is the OS of cloud infrastructure. Every Databricks cluster, Azure VM, and Docker container runs Linux. You need to be comfortable in the terminal.</p>
          </div>

          <h3 style={{ marginBottom: 12 }}>Processes and Threads</h3>
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Process:</strong> Independent program with its own memory space. Spark executors are JVM processes.<br/>
              <strong>Thread:</strong> Lightweight unit of execution within a process. Python's GIL restricts to one thread at a time.
            </div>
          </div>

          <CodeBlock lang="bash">{`# Essential Linux commands for data engineers

# File system navigation
ls -la                    # list files with permissions
pwd                       # print working directory
find /data -name "*.parquet" -type f  # find Parquet files

# Process management
ps aux | grep spark       # show Spark processes
top -u databricks         # resource usage by user
kill -9 <pid>             # force kill a process

# File operations
cat file.csv | head -5    # preview first 5 lines
wc -l data.csv            # count lines
df -h                     # disk usage (human readable)
du -sh /tmp/*             # size of each item in /tmp

# Permissions (critical for ADLS mounts)
chmod 755 script.sh       # rwxr-xr-x
chown user:group file     # change owner

# Networking
curl -s https://api.example.com/data | python3 -m json.tool
wget https://files.example.com/dataset.csv
netstat -tlnp             # show listening ports
ss -s                     # socket statistics`}</CodeBlock>

          <Quiz topicId="os" questions={[
            { question: "What does chmod 755 set on a file?", options: ["Read-only for all", "rwxr-xr-x (owner can execute, others can read/execute)", "Full permissions for all users", "No permissions"], correct: 1 },
            { question: "In Linux, what is the difference between a process and a thread?", options: ["No difference", "Processes have separate memory space; threads share the parent process memory", "Threads are faster processes", "Processes are for I/O, threads for CPU"], correct: 1 },
            { question: "How do you count the number of lines in a CSV file on Linux?", options: ["ls -l file.csv", "wc -l file.csv", "cat -n file.csv", "head file.csv"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('os'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>
            Mark Complete ✓
          </button>
        </section>

        {/* NETWORKING */}
        <section id="networking" ref={el => { if (el) sectionRefs.current['networking'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 1 - Computer Fundamentals</div>
            <h1 className="topic-title">Networking Basics</h1>
            <p className="topic-desc">Data engineers work with networks constantly - reading from APIs, configuring VNets, setting up private endpoints, and troubleshooting connectivity issues.</p>
          </div>

          <NetworkAnimation />

          <h3 style={{ marginBottom: 12, marginTop: 24 }}>TCP/IP Stack</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
            {[
              { layer: 'Application (L7)', proto: 'HTTP, HTTPS, DNS, SFTP', color: '#8b5cf6' },
              { layer: 'Transport (L4)', proto: 'TCP (reliable), UDP (fast)', color: '#3b82f6' },
              { layer: 'Network (L3)', proto: 'IP, ICMP, routing', color: '#22c55e' },
              { layer: 'Data Link (L2)', proto: 'Ethernet, MAC addresses', color: '#f59e0b' },
              { layer: 'Physical (L1)', proto: 'Cables, fiber, WiFi signals', color: '#94a3b8' },
            ].map(l => (
              <div key={l.layer} style={{ display: 'flex', gap: 16, padding: '10px 16px', background: 'white', border: '1px solid var(--border)', borderLeft: `3px solid ${l.color}`, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '.88rem', minWidth: 160 }}>{l.layer}</div>
                <div style={{ fontSize: '.84rem', color: 'var(--text-3)' }}>{l.proto}</div>
              </div>
            ))}
          </div>

          <div className="callout callout-tip">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Azure VNet for Data Engineers:</strong> Use Private Endpoints to connect ADLS Gen2, Azure SQL, Key Vault without traffic going over the public internet. This is a security requirement in enterprise environments.</div>
          </div>

          <CodeBlock lang="python">{`# REST API calls - how data engineers ingest from APIs
import requests

# GET request with auth
response = requests.get(
    "https://api.example.com/v1/data",
    headers={"Authorization": "Bearer your_token"},
    params={"date": "2024-01-01", "limit": 1000},
    timeout=30
)
response.raise_for_status()  # raises on 4xx/5xx
data = response.json()

# POST request to trigger a pipeline
response = requests.post(
    "https://adf.azure.com/triggers/run",
    json={"parameter": "value"},
    headers={"Authorization": f"Bearer {token}"}
)

# Pagination pattern (most APIs)
all_records = []
page = 1
while True:
    r = requests.get(f"https://api.example.com/data?page={page}").json()
    all_records.extend(r["data"])
    if not r.get("has_more"):
        break
    page += 1`}</CodeBlock>

          <Quiz topicId="networking" questions={[
            { question: "What is the purpose of a Private Endpoint in Azure?", options: ["Speed up network traffic", "Connect Azure services without traffic going over the public internet", "Reduce cost", "Enable public access"], correct: 1 },
            { question: "Which protocol guarantees delivery order and error checking?", options: ["UDP", "TCP", "HTTP", "ICMP"], correct: 1 },
            { question: "In REST APIs, which HTTP method is used to retrieve data?", options: ["POST", "PUT", "GET", "PATCH"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('networking'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>
            Mark Complete ✓
          </button>
        </section>

        {/* DATA TYPES */}
        <section id="data-types" ref={el => { if (el) sectionRefs.current['data-types'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Data Types and Schemas</h1>
            <p className="topic-desc">Choosing the right data type directly impacts storage size, query performance, and correctness. A poorly typed schema can corrupt billions of rows.</p>
          </div>

          <CodeBlock lang="python">{`from pyspark.sql.types import *

# Explicit schema definition (always preferred over inferSchema=True)
schema = StructType([
    StructField("event_id",    LongType(),      nullable=False),
    StructField("user_id",     IntegerType(),   nullable=False),
    StructField("event_time",  TimestampType(), nullable=False),
    StructField("amount",      DecimalType(18,2),nullable=True),  # financial: use Decimal not Double!
    StructField("event_type",  StringType(),    nullable=False),
    StructField("metadata",    MapType(StringType(), StringType()), nullable=True),
    StructField("tags",        ArrayType(StringType()),             nullable=True),
])

df = spark.read.schema(schema).parquet("/data/events")

# Type casting
from pyspark.sql.functions import col, cast, to_timestamp
df = df.withColumn("amount", col("amount").cast(DecimalType(18, 2)))
df = df.withColumn("event_time", to_timestamp("event_time_str", "yyyy-MM-dd HH:mm:ss"))`}</CodeBlock>

          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body"><strong>Never use Double for financial data.</strong> Floating point imprecision: <code>0.1 + 0.2 = 0.30000000000000004</code>. Always use <code>DecimalType(precision, scale)</code> for money.</div>
          </div>

          <Quiz topicId="data-types" questions={[
            { question: "Why should you use DecimalType instead of DoubleType for financial amounts?", options: ["Decimal is faster", "Double has floating point imprecision errors", "Decimal uses less storage", "Double doesn't support negative numbers"], correct: 1 },
            { question: "What does nullable=False mean in a Spark schema?", options: ["The field can contain null", "The field cannot contain null values", "The field is optional", "The field type is inferred"], correct: 1 },
            { question: "Which Spark type would you use for a list of strings within a column?", options: ["StringType", "MapType", "ArrayType", "StructType"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('data-types'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>
            Mark Complete ✓
          </button>
        </section>

        {/* FILE FORMATS */}
        <section id="file-formats" ref={el => { if (el) sectionRefs.current['file-formats'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">File Formats: CSV, JSON, Parquet, Avro</h1>
            <p className="topic-desc">File format choice is one of the most impactful decisions in data engineering. The wrong format can make a query 100x slower.</p>
          </div>

          <FileFormatAnimation />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, margin: '24px 0' }}>
            {[
              { name: 'CSV', storage: 'Row', compress: 'None/Gzip', read: 'Slow', write: 'Fast', use: 'Source data, Excel exports', color: '#94a3b8' },
              { name: 'JSON', storage: 'Row', compress: 'None/Gzip', read: 'Slow', write: 'Fast', use: 'APIs, semi-structured', color: '#f59e0b' },
              { name: 'Parquet', storage: 'Columnar', compress: 'Snappy/Zstd', read: 'Very Fast', write: 'Medium', use: 'Analytics, Delta Lake', color: '#4f8ef7' },
              { name: 'Avro', storage: 'Row', compress: 'Snappy', read: 'Fast (streaming)', write: 'Fast', use: 'Event streaming, Kafka', color: '#8b5cf6' },
              { name: 'ORC', storage: 'Columnar', compress: 'Zlib/Snappy', read: 'Very Fast', write: 'Medium', use: 'Hive, legacy Hadoop', color: '#22c55e' },
              { name: 'Delta', storage: 'Columnar', compress: 'Snappy/Zstd', read: 'Very Fast', write: 'Fast', use: 'Lakehouse ACID tables', color: '#ef4444' },
            ].map(f => (
              <div key={f.name} style={{ background: 'white', border: '1px solid var(--border)', borderTop: `3px solid ${f.color}`, borderRadius: 'var(--radius-lg)', padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 8 }}>{f.name}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-3)', lineHeight: 1.8 }}>
                  <div><strong>Storage:</strong> {f.storage}</div>
                  <div><strong>Compression:</strong> {f.compress}</div>
                  <div><strong>Read:</strong> {f.read}</div>
                  <div><strong>Best for:</strong> {f.use}</div>
                </div>
              </div>
            ))}
          </div>

          <CodeBlock lang="python">{`# Reading different formats in Spark
df_csv     = spark.read.option("header", True).option("inferSchema", True).csv("/data/sales.csv")
df_json    = spark.read.json("/data/events/*.json")
df_parquet = spark.read.parquet("/data/warehouse/customers")
df_avro    = spark.read.format("avro").load("/data/events/kafka-topic")
df_delta   = spark.read.format("delta").load("/data/delta/orders")

# Writing with optimal settings
df.write \\
  .format("parquet") \\
  .option("compression", "snappy") \\
  .partitionBy("year", "month") \\
  .mode("overwrite") \\
  .save("/output/parquet")

# Why Parquet wins for analytics:
# SELECT SUM(amount) FROM sales WHERE year=2024
# Parquet: reads only 'amount' and 'year' columns = 2 columns
# CSV: reads ALL columns = 50 columns   -> 25x more I/O`}</CodeBlock>

          <Quiz topicId="file-formats" questions={[
            { question: "Why is Parquet preferred over CSV for analytical queries?", options: ["Parquet is human readable", "Parquet stores data in columns - analytical queries only read needed columns", "Parquet has no schema", "Parquet is compressed by default"], correct: 1 },
            { question: "Which format is best for Kafka event streaming?", options: ["CSV", "Parquet", "Avro", "JSON"], correct: 2 },
            { question: "What is the main advantage of columnar storage for aggregations?", options: ["Faster inserts", "Only the relevant columns are read from disk, reducing I/O", "Better compression for strings", "Simpler schema evolution"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('file-formats'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>
            Mark Complete ✓
          </button>
        </section>

        {/* MEDALLION */}
        <section id="medallion" ref={el => { if (el) sectionRefs.current['medallion'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Medallion Architecture</h1>
            <p className="topic-desc">The Medallion (Bronze/Silver/Gold) architecture is the standard pattern for modern data lakehouses. Every major cloud data platform uses this pattern.</p>
          </div>

          <MedallionAnimation />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20, marginTop: 24 }}>
            {[
              { tier: 'Bronze', icon: '🥉', color: '#cd7f32', bg: '#fff7ed', desc: 'Raw ingested data, no transformations. Append-only. Source of truth for replay. Keep forever.', formats: 'Parquet, Delta, JSON as-is', latency: 'Seconds to minutes' },
              { tier: 'Silver', icon: '🥈', color: '#94a3b8', bg: '#f8fafc', desc: 'Cleaned, validated, deduplicated data. Joins applied, types cast, nulls handled. Business entities.', formats: 'Delta tables', latency: 'Minutes to hours' },
              { tier: 'Gold', icon: '🥇', color: '#f59e0b', bg: '#fffbeb', desc: 'Business-ready aggregations and KPIs. Optimized for BI tools and ML features. Never modify upstream.', formats: 'Delta / Parquet', latency: 'Hours (batch) or minutes (streaming)' },
            ].map(t => (
              <div key={t.tier} style={{ background: t.bg, border: `1.5px solid ${t.color}40`, borderRadius: 'var(--radius-xl)', padding: 20 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: t.color, marginBottom: 8 }}>{t.tier}</div>
                <div style={{ fontSize: '.84rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 12 }}>{t.desc}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-4)' }}><strong>Formats:</strong> {t.formats}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-4)' }}><strong>Latency:</strong> {t.latency}</div>
              </div>
            ))}
          </div>

          <CodeBlock lang="python">{`# Medallion Architecture in PySpark/Delta

# BRONZE - Raw ingestion with Auto Loader (keeps original schema)
spark.readStream \\
  .format("cloudFiles") \\
  .option("cloudFiles.format", "json") \\
  .option("cloudFiles.schemaLocation", "/checkpoints/bronze/schema") \\
  .load("abfss://raw@storage.dfs.core.windows.net/events/") \\
  .writeStream \\
  .format("delta") \\
  .option("checkpointLocation", "/checkpoints/bronze") \\
  .outputMode("append") \\
  .table("bronze.events_raw")

# SILVER - Clean and validate
from pyspark.sql.functions import col, to_timestamp, when

df_silver = spark.readStream.table("bronze.events_raw") \\
  .filter(col("event_id").isNotNull()) \\
  .withColumn("event_time", to_timestamp("event_time_str")) \\
  .withColumn("amount", col("amount").cast("decimal(18,2)")) \\
  .dropDuplicates(["event_id"])

df_silver.writeStream \\
  .format("delta") \\
  .option("checkpointLocation", "/checkpoints/silver") \\
  .outputMode("append") \\
  .table("silver.events")

# GOLD - Business aggregations
spark.sql("""
  CREATE OR REPLACE TABLE gold.daily_revenue AS
  SELECT
    date_trunc('day', event_time) AS date,
    product_id,
    SUM(amount) AS total_revenue,
    COUNT(*) AS transaction_count
  FROM silver.events
  GROUP BY 1, 2
""")`}</CodeBlock>

          <Quiz topicId="medallion" questions={[
            { question: "In Medallion architecture, what should Bronze layer contain?", options: ["Cleaned and validated data", "Raw ingested data with no transformations", "Business-ready aggregations", "Only the latest snapshot"], correct: 1 },
            { question: "Why should you keep Bronze layer data forever?", options: ["It's the cheapest storage tier", "It's the source of truth for reprocessing if Silver/Gold logic is wrong", "It contains PII data", "Bronze is the fastest to query"], correct: 1 },
            { question: "What transformation happens at the Silver layer?", options: ["Aggregations and KPIs", "Raw ingestion only", "Cleaning, deduplication, type casting, joins", "ML feature engineering"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('medallion'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>
            Mark Complete ✓
          </button>
        </section>

        {/* DATABASES */}
        <section id="databases" ref={el => { if (el) sectionRefs.current['databases'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 2 - Data Fundamentals</div>
            <h1 className="topic-title">Databases vs Data Warehouses vs Data Lakes</h1>
            <p className="topic-desc">These are fundamentally different systems optimized for different workloads. Knowing when to use each is a core data engineering skill.</p>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Feature', 'OLTP Database', 'Data Warehouse', 'Data Lake', 'Lakehouse'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, fontSize: '.78rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Purpose', 'Transactional', 'Analytics', 'Storage', 'Analytics + ACID'],
                  ['Schema', 'Schema-on-write', 'Schema-on-write', 'Schema-on-read', 'Both'],
                  ['Data type', 'Structured', 'Structured', 'All types', 'All types'],
                  ['Scale', 'GBs-TBs', 'TBs-PBs', 'Unlimited', 'PBs'],
                  ['Azure example', 'Azure SQL DB', 'Synapse SQL', 'ADLS Gen2', 'Databricks/Delta'],
                  ['Query engine', 'SQL', 'SQL', 'Spark/Hive', 'Spark SQL'],
                  ['ACID', 'Yes', 'Partial', 'No', 'Yes (Delta)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '10px 14px', fontWeight: j === 0 ? 600 : 400, color: j === 0 ? 'var(--text-2)' : 'var(--text-3)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="callout callout-tip">
            <span className="callout-icon">✨</span>
            <div className="callout-body"><strong>The Lakehouse pattern (Delta Lake + Databricks)</strong> combines the best of data warehouses (ACID, SQL, performance) with data lakes (cheap storage, all data types, Spark). This is the dominant enterprise pattern in 2024-2025.</div>
          </div>

          <Quiz topicId="databases" questions={[
            { question: "What does OLTP stand for and what is it used for?", options: ["Online Transactional Processing - for operational systems like apps", "Online Text Processing - for NLP", "Output Layer Transaction Protocol - for ETL", "Online Table Partitioning - for warehouses"], correct: 0 },
            { question: "What is 'schema-on-read' in a data lake?", options: ["Schema is validated when writing", "Schema is applied when querying, not when storing data", "The schema is read from a catalog", "No schema is ever applied"], correct: 1 },
            { question: "What makes a Lakehouse different from a plain Data Lake?", options: ["Lakehouse is cheaper", "Lakehouse adds ACID transactions and schema enforcement on top of object storage", "Lakehouse only supports structured data", "Lakehouse is managed by cloud providers"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databases'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>
            Mark Complete ✓
          </button>
        </section>

      </main>
    </div>
  )
}

/* ---- ANIMATIONS ---- */
function BinaryAnimation() {
  return (
    <div style={{ background: 'var(--gray-900)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 24, overflow: 'hidden', position: 'relative' }}>
      <div style={{ color: '#4ade80', fontFamily: 'var(--font-mono)', fontSize: '.8rem', lineHeight: 2, opacity: .7 }}>
        {Array.from({ length: 4 }).map((_, row) => (
          <div key={row} style={{ animation: `fadeIn ${row * 0.3 + 0.3}s ease backwards` }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} style={{ marginRight: 2, color: Math.random() > 0.5 ? '#4ade80' : '#166534', opacity: Math.random() * 0.5 + 0.5 }}>
                {Math.random() > 0.5 ? '1' : '0'}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(0,0,0,.8)', padding: '12px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid #4ade8040' }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#4ade80', fontSize: '1.1rem', fontWeight: 700 }}>01001000 01100101 01101100 01101100 01101111</span>
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '.75rem', marginTop: 4 }}>= "Hello" in ASCII binary</div>
        </div>
      </div>
    </div>
  )
}

function CpuAnimation() {
  return (
    <svg viewBox="0 0 600 200" style={{ width: '100%', maxHeight: 200, borderRadius: 'var(--radius-xl)', background: 'var(--gray-50)', border: '1px solid var(--border)', marginBottom: 24 }}>
      {/* CPU */}
      <rect x="220" y="60" width="160" height="80" rx="8" fill="#1e293b" stroke="#4f8ef7" strokeWidth="2"/>
      <text x="300" y="96" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="700">CPU</text>
      <text x="300" y="112" textAnchor="middle" fill="#94a3b8" fontSize="10">4 cores</text>

      {/* L1 Cache */}
      <rect x="240" y="72" width="30" height="18" rx="3" fill="#ef4444" opacity=".8"/>
      <text x="255" y="85" textAnchor="middle" fill="white" fontSize="8">L1</text>

      {/* L2 Cache */}
      <rect x="278" y="72" width="30" height="18" rx="3" fill="#f97316" opacity=".8"/>
      <text x="293" y="85" textAnchor="middle" fill="white" fontSize="8">L2</text>

      {/* L3 Cache */}
      <rect x="316" y="72" width="30" height="18" rx="3" fill="#f59e0b" opacity=".8"/>
      <text x="331" y="85" textAnchor="middle" fill="white" fontSize="8">L3</text>

      {/* RAM */}
      <rect x="80" y="80" width="80" height="40" rx="6" fill="#3b82f6" opacity=".15" stroke="#3b82f6" strokeWidth="1.5"/>
      <text x="120" y="97" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="700">RAM</text>
      <text x="120" y="111" textAnchor="middle" fill="#94a3b8" fontSize="9">16 GB</text>

      {/* SSD */}
      <rect x="440" y="80" width="80" height="40" rx="6" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="480" y="97" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">NVMe SSD</text>
      <text x="480" y="111" textAnchor="middle" fill="#94a3b8" fontSize="9">1 TB</text>

      {/* Arrows */}
      <line x1="160" y1="100" x2="220" y2="100" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2">
        <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite"/>
      </line>
      <line x1="380" y1="100" x2="440" y2="100" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 2">
        <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.5s" repeatCount="indefinite"/>
      </line>

      {/* Labels */}
      <text x="190" y="90" textAnchor="middle" fill="#94a3b8" fontSize="9">60-100ns</text>
      <text x="410" y="90" textAnchor="middle" fill="#94a3b8" fontSize="9">50-100μs</text>
    </svg>
  )
}

function NetworkAnimation() {
  return (
    <svg viewBox="0 0 600 160" style={{ width: '100%', maxHeight: 160, borderRadius: 'var(--radius-xl)', background: 'var(--gray-50)', border: '1px solid var(--border)', marginBottom: 8 }}>
      {[
        { x: 60, label: 'Client', color: '#4f8ef7' },
        { x: 200, label: 'API Gateway', color: '#8b5cf6' },
        { x: 340, label: 'App Server', color: '#22c55e' },
        { x: 480, label: 'Database', color: '#f59e0b' },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy="80" r="28" fill="white" stroke={n.color} strokeWidth="2"/>
          <text x={n.x} y="84" textAnchor="middle" fill={n.color} fontSize="10" fontWeight="700">{n.label}</text>
        </g>
      ))}
      {[[60, 200], [200, 340], [340, 480]].map(([x1, x2], i) => (
        <g key={i}>
          <line x1={x1 + 28} y1="80" x2={x2 - 28} y2="80" stroke="#e2e8f0" strokeWidth="2"/>
          <circle r="5" fill="#4f8ef7">
            <animateMotion path={`M${x1 + 28},80 L${x2 - 28},80`} dur={`${1 + i * 0.3}s`} repeatCount="indefinite"/>
          </circle>
        </g>
      ))}
    </svg>
  )
}

function FileFormatAnimation() {
  const [active, setActive] = useState(0)
  const formats = ['CSV (Row)', 'Parquet (Column)']
  const rows = [
    ['id', 'name', 'amount', 'date', 'country'],
    ['1', 'Alice', '100', '2024-01', 'US'],
    ['2', 'Bob', '200', '2024-01', 'UK'],
    ['3', 'Carol', '150', '2024-02', 'US'],
  ]

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {formats.map((f, i) => (
          <button key={f} onClick={() => setActive(i)} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border)', background: active === i ? 'var(--blue-500)' : 'white', color: active === i ? 'white' : 'var(--text-2)', fontWeight: 600, fontSize: '.83rem', cursor: 'pointer' }}>{f}</button>
        ))}
      </div>
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} style={{ borderBottom: '1px solid var(--border)' }}>
                {row.map((cell, c) => (
                  <td key={c} style={{
                    padding: '8px 12px',
                    background: active === 0
                      ? (r === 0 ? 'var(--gray-50)' : 'white')
                      : (c === 2 ? '#eff6ff' : c === 0 ? 'var(--gray-50)' : 'white'),
                    fontWeight: (active === 0 && r === 0) || (active === 1 && c === 0) ? 700 : 400,
                    color: active === 1 && c === 2 ? 'var(--blue-700)' : 'var(--text-1)',
                    transition: 'background .3s',
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: '.8rem', color: 'var(--text-3)' }}>
        {active === 0 ? 'Row storage: SELECT amount reads all columns (all cells)' : 'Columnar: SELECT amount reads only the blue column (3x less I/O)'}
      </div>
    </div>
  )
}

function MedallionAnimation() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {[
        { label: 'Source', icon: '🔌', color: '#94a3b8', bg: '#f8fafc' },
        { label: 'Bronze\nRaw', icon: '🥉', color: '#cd7f32', bg: '#fff7ed' },
        { label: 'Silver\nClean', icon: '🥈', color: '#64748b', bg: '#f8fafc' },
        { label: 'Gold\nBiz Ready', icon: '🥇', color: '#f59e0b', bg: '#fffbeb' },
        { label: 'BI / ML', icon: '📊', color: '#8b5cf6', bg: '#faf5ff' },
      ].map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="animate-popin" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            padding: '14px 18px', background: n.bg, border: `1.5px solid ${n.color}60`,
            borderRadius: 'var(--radius-xl)', minWidth: 90, textAlign: 'center',
            animationDelay: `${i * 0.1}s`,
          }}>
            <div style={{ fontSize: '1.6rem' }}>{n.icon}</div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: n.color, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{n.label}</div>
          </div>
          {i < 4 && <div style={{ fontSize: '1.4rem', color: '#94a3b8', padding: '0 4px', animation: 'pulse 2s ease-in-out infinite' }}>→</div>}
        </div>
      ))}
    </div>
  )
}
