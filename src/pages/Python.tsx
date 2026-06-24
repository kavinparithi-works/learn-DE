import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete, unmarkTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: (id?: string) => void; onUnmark: (id: string) => void; onSignInNeeded: () => void }

const SECTIONS = [
  { title: 'Level 5 - Python for DE', items: [
    { id: 'py-execution', label: 'Execution & GIL' },
    { id: 'py-types', label: 'Type System' },
    { id: 'py-structures', label: 'Data Structures' },
    { id: 'py-comprehensions', label: 'Comprehensions' },
    { id: 'py-functions', label: 'Functions' },
    { id: 'py-generators', label: 'Generators' },
    { id: 'py-decorators', label: 'Decorators' },
    { id: 'py-oop', label: 'OOP' },
    { id: 'py-context', label: 'Context Managers' },
    { id: 'py-errors', label: 'Error Handling' },
    { id: 'py-async', label: 'Async / asyncio' },
    { id: 'py-io', label: 'File I/O' },
    { id: 'py-regex', label: 'Regex' },
    { id: 'py-testing', label: 'pytest' },
    { id: 'py-packages', label: 'Packages' },
    { id: 'py-pandas', label: 'pandas' },
    { id: 'py-db', label: 'DB Connections' },
    { id: 'py-http', label: 'HTTP' },
    { id: 'py-linux', label: 'Shell Scripts' },
    { id: 'py-git', label: 'Git Deep Dive' },
  ]},
  { title: 'Advanced DE Python', items: [
    { id: 'py-pydantic', label: 'Pydantic' },
    { id: 'py-docker', label: 'Docker' },
    { id: 'py-k8s', label: 'Kubernetes' },
    { id: 'py-deequ', label: 'Data Quality' },
    { id: 'py-memory', label: 'Memory Profiling' },
  ]},
]

export default function Python({ completed, onComplete, onUnmark, onSignInNeeded }: Props) {
  const [activeId, setActiveId] = useState('py-execution')
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

        {/* ── py-execution ─────────────────────────────────────────────── */}
        <section id="py-execution" ref={el => { if (el) sectionRefs.current['py-execution'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Python Execution Model & the GIL</h1>
            <p className="topic-desc">Python's execution model is unique among mainstream languages. Understanding the GIL (Global Interpreter Lock) explains why Python threads don't parallelize CPU work, why data engineers default to multiprocessing or asyncio, and how PySpark bypasses these constraints entirely by running in the JVM.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "Explain the GIL and how it affects your pipelines"<br/>• "When would you use threading vs multiprocessing vs asyncio?"<br/>• "Why doesn't Python parallelize CPU work with threads?"<br/>• "How does PySpark avoid the GIL bottleneck?"<br/>• "What's the difference between concurrency and parallelism in Python?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate understand <em>why</em> the GIL exists and how to pick the right concurrency tool for the workload — or do they just know the definition?</div>
          </div>

          <p>The GIL is CPython's mutex that prevents multiple threads from executing Python bytecode simultaneously. The reason is historical: CPython's memory management (reference counting) is not thread-safe, so the GIL was the simplest fix. In production, this means that threading only helps for I/O-bound work — the GIL is released when a thread blocks on a network call or disk read, allowing another thread to run. For CPU-bound work like parsing 10 GB of JSON, you need <code>multiprocessing</code> which gives each process its own GIL. PySpark sidesteps the issue entirely — Python only drives the driver, while transformations execute in JVM workers on executors.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"The GIL serializes Python bytecode — one thread holds it at a time, even on 64-core machines."</td></tr>
              <tr><td>2</td><td>"For I/O-bound work I use <code>ThreadPoolExecutor</code> or <code>asyncio</code> — the GIL releases during blocking I/O."</td></tr>
              <tr><td>3</td><td>"For CPU-bound work I use <code>multiprocessing.Pool</code> — each process has its own interpreter and GIL."</td></tr>
              <tr><td>4</td><td>"In Spark, Python drives the driver only. Executors run JVM bytecode — the GIL is completely irrelevant."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Databricks:</strong> PySpark clusters run transformations in JVM workers on thousands of cores simultaneously — Python GIL affects only the driver process. A 200-node cluster processes 10 TB/hour while the Python driver uses &lt;1 CPU core.<br/><strong>Stripe:</strong> Uses asyncio + aiohttp for payment webhook ingestion pipelines, handling 80,000 concurrent API connections on 8 CPU cores — 10x more efficient than threading for this I/O-bound workload.<br/><strong>Airbnb:</strong> Batch ETL pipelines use <code>multiprocessing.Pool(cpu_count())</code> for parallel Parquet file validation — achieving 8x speedup on 8-core machines versus single-threaded processing.</div>
          </div>

          <GILDiagram />
          <PythonGilAnimation />

          <CodeBlock lang="python">{`import threading
import multiprocessing
import concurrent.futures
import asyncio
import time

# ── 1. I/O-bound: ThreadPoolExecutor (GIL released during I/O) ────────────
# Pattern: ingest files from ADLS, call REST APIs, query SQL concurrently
import urllib.request

def download_partition(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=30) as resp:
        return resp.read()

partition_urls = [
    "https://storage.blob.core.windows.net/raw/part-00000.parquet",
    "https://storage.blob.core.windows.net/raw/part-00001.parquet",
    "https://storage.blob.core.windows.net/raw/part-00002.parquet",
]

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(download_partition, u): u for u in partition_urls}
    for future in concurrent.futures.as_completed(futures):
        url = futures[future]
        try:
            data = future.result()
            print(f"Downloaded {len(data):,} bytes from {url}")
        except Exception as exc:
            print(f"Failed {url}: {exc}")

# ── 2. CPU-bound: multiprocessing (separate processes, no GIL) ────────────
# Pattern: parallel file parsing, JSON validation, hash computation
import hashlib, json

def validate_and_hash_file(filepath: str) -> dict:
    """Parse JSON lines file and compute SHA-256  -  CPU-heavy work."""
    with open(filepath, "rb") as f:
        raw = f.read()
    records = [json.loads(line) for line in raw.splitlines() if line.strip()]
    checksum = hashlib.sha256(raw).hexdigest()
    return {"file": filepath, "records": len(records), "sha256": checksum}

files = ["/data/raw/events_2024_01.jsonl", "/data/raw/events_2024_02.jsonl"]

with multiprocessing.Pool(processes=multiprocessing.cpu_count()) as pool:
    results = pool.map(validate_and_hash_file, files)

for r in results:
    print(f"{r['file']}: {r['records']} records, SHA256={r['sha256'][:12]}…")

# ── 3. asyncio: single-threaded cooperative async I/O ────────────────────
# Pattern: high-throughput API ingestion without spawning many threads
import aiohttp

async def fetch_page(session: aiohttp.ClientSession, url: str, page: int) -> list:
    async with session.get(url, params={"page": page, "size": 500}) as resp:
        resp.raise_for_status()
        payload = await resp.json()
        return payload["data"]

async def ingest_api(base_url: str, total_pages: int) -> list:
    all_records = []
    async with aiohttp.ClientSession(
        headers={"Authorization": "Bearer $TOKEN"},
        timeout=aiohttp.ClientTimeout(total=60),
    ) as session:
        tasks = [fetch_page(session, base_url, p) for p in range(1, total_pages + 1)]
        pages = await asyncio.gather(*tasks, return_exceptions=True)
        for page in pages:
            if isinstance(page, Exception):
                print(f"Page failed: {page}")
            else:
                all_records.extend(page)
    return all_records

# records = asyncio.run(ingest_api("https://api.example.com/events", total_pages=20))`}</CodeBlock>

          <CodeBlock lang="python">{`# ── Bytecode & .pyc files ────────────────────────────────────────────────
# Python compiles .py → bytecode (.pyc in __pycache__) before execution.
# The CPython interpreter (virtual machine) executes bytecode, not raw text.
import dis, sys

def transform_row(row: dict) -> dict:
    return {k: v.strip().lower() if isinstance(v, str) else v for k, v in row.items()}

# Inspect bytecode to understand what Python actually runs:
dis.dis(transform_row)
# >>> LOAD_FAST, BUILD_MAP, etc.  -  these are the instructions the GIL guards

print(f"Python {sys.version}")
print(f"CPython implementation: {sys.implementation.name}")  # cpython

# ── Free-threaded Python (3.13+, experimental) ──────────────────────────
# Python 3.13 ships an optional no-GIL build:
#   python3.13t  (the 't' suffix = free-threaded)
# Still experimental; most C extensions not yet compatible.
# For now, multiprocessing + asyncio remain the production patterns.`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"Python is slow because of the GIL"</td><td>"The GIL only serializes CPU-bound pure-Python code. I/O-bound workloads, asyncio, multiprocessing, and JVM-backed runtimes like Spark all sidestep it entirely."</td></tr>
              <tr><td>"I'd use threads to speed up my data processing"</td><td>"Threading gives concurrency for I/O but zero parallelism for CPU work. For a 10 GB JSON parse, multiprocessing.Pool(cpu_count()) gives near-linear speedup; threads would be serialized."</td></tr>
              <tr><td>"asyncio is faster than threading"</td><td>"asyncio is single-threaded cooperative concurrency — ideal for high-fan-out I/O like 1000 concurrent API calls. It doesn't parallelize CPU; it minimizes blocking time."</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-execution" questions={[
            { question: "A data engineer runs 8 threads to parse 8 large JSON files simultaneously on a 16-core machine. What actually happens at the CPU level?", options: ["All 8 threads execute Python bytecode in parallel — 8x speedup", "Threads take turns holding the GIL — CPU-bound bytecode is effectively serialized with no speedup", "Python automatically switches to multiprocessing when threads are CPU-bound", "The GIL only affects threads in the same module"], correct: 1 },
            { question: "You need to ingest 500 REST API endpoints concurrently. Which approach gives the best throughput per CPU core?", options: ["multiprocessing.Pool(500) — each process handles one URL", "asyncio.gather() with aiohttp — single thread, cooperative I/O concurrency", "threading.Thread × 500 — one thread per URL", "subprocess.run() in a loop — OS-level parallelism"], correct: 1 },
            { question: "In a PySpark job, a Python UDF processes each row. Where does the Python GIL bottleneck appear?", options: ["Nowhere — Spark's JVM bypasses the GIL entirely", "In the executor JVM process — the JVM also has a GIL", "In the Python UDF execution on each executor — data must serialize to Python, execute, then serialize back to JVM", "Only in the driver, never in executors"], correct: 2 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use <code>multiprocessing.Pool</code> for CPU-bound tasks like file parsing or hashing</li>
                <li>Use <code>asyncio</code> + <code>aiohttp</code> for high-concurrency API ingestion</li>
                <li>Use <code>ThreadPoolExecutor</code> for I/O-bound tasks like parallel file downloads</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use <code>threading</code> for CPU-heavy work — the GIL prevents real parallelism</li>
                <li>Spawn 500 threads for API calls — use asyncio + semaphore instead</li>
                <li>Assume free-threaded Python 3.13 is production-ready for all C extensions</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-execution')) { await unmarkTopicComplete('py-execution'); onUnmark('py-execution') } else { await markTopicComplete('py-execution'); onComplete('py-execution') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-execution') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-execution') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-types ──────────────────────────────────────────────────── */}
        <section id="py-types" ref={el => { if (el) sectionRefs.current['py-types'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Type System & Type Hints</h1>
            <p className="topic-desc">Python is dynamically typed at runtime but supports static type annotations checked by tools like mypy and Pyright. In production data pipelines, type hints are not optional  -  they prevent entire classes of bugs, make IDE auto-complete reliable, and serve as living documentation for schema contracts.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you enforce type safety in Python pipelines?"<br/>• "What's the difference between TypedDict, dataclass, and Pydantic?"<br/>• "Explain Protocol vs ABC — when would you use each?"<br/>• "Do Python type hints have runtime overhead?"<br/>• "How do you use generics in Python?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate understand the type system as a developer productivity and correctness tool — or do they think annotations are just documentation?</div>
          </div>

          <p>Type hints are zero-cost at runtime — Python's interpreter ignores them entirely. The reason they matter is that they enable static analysis tools like mypy and Pyright to catch type errors before the code ever runs. In production, a pipeline that mismatches a <code>str</code> for an <code>int</code> user_id will fail silently on row 1 or row 10 million. With strict mypy, that bug is caught in CI in milliseconds.</p>
          <p>The key distinctions: <strong>TypedDict</strong> gives named keys to plain dicts — ideal for JSON records. <strong>dataclass</strong> generates <code>__init__</code>/<code>__repr__</code>/<code>__eq__</code> — ideal for config objects. <strong>Protocol</strong> enables structural subtyping (duck typing with type safety) — any class with matching methods satisfies it without explicit inheritance.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"Type hints have zero runtime cost — they're erased before execution. The value is in mypy running in CI."</td></tr>
              <tr><td>2</td><td>"For dict-shaped records I use TypedDict — keys and types are statically checked. For config objects I use @dataclass."</td></tr>
              <tr><td>3</td><td>"Protocol gives structural subtyping — any class with matching methods satisfies it, no inheritance required."</td></tr>
              <tr><td>4</td><td>"I run mypy --strict in CI. Generics let me type PipelineResult[T] once and use it for any output type."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Uber:</strong> Runs mypy --strict on all Python data platform code. Caught 3,200+ type errors during migration from Python 2 to 3, preventing production incidents across 400+ pipelines.<br/><strong>Dropbox:</strong> Migrated 4 million lines of Python to typed annotations using mypy — reduced runtime TypeError crashes by 15% and sped up new engineer onboarding by eliminating "what type does this function return?" questions.<br/><strong>Netflix:</strong> Uses Pyright in VS Code for their Metaflow pipeline framework — type hints on @step decorators give engineers autocomplete and error detection when writing multi-step workflows.</div>
          </div>

          <TypeHintsDiagram />
          <TypeHintsAnimation />

          <CodeBlock lang="python">{`from __future__ import annotations
from typing import TypeVar, Generic, Callable, Literal, Union, Any
from typing import TypedDict, Protocol, overload
from collections.abc import Iterator, Sequence, Mapping
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

# ── Basic type hints ────────────────────────────────────────────────────
def read_parquet(
    path: str | Path,
    columns: list[str] | None = None,
    partition_filter: dict[str, str] | None = None,
) -> list[dict[str, Any]]:
    """Read a Parquet file and return rows as dicts."""
    import pyarrow.parquet as pq
    table = pq.read_table(str(path), columns=columns)
    return table.to_pydict()  # type: ignore[return-value]

# ── TypedDict: schema contracts for dict-based records ──────────────────
class RawEvent(TypedDict):
    event_id: str
    user_id: int
    event_type: str
    timestamp: str
    properties: dict[str, Any]

class EnrichedEvent(TypedDict):
    event_id: str
    user_id: int
    event_type: str
    occurred_at: datetime
    properties: dict[str, Any]
    user_country: str       # enriched field
    session_id: str | None  # may be absent

def enrich_event(raw: RawEvent, user_lookup: dict[int, str]) -> EnrichedEvent:
    return EnrichedEvent(
        event_id=raw["event_id"],
        user_id=raw["user_id"],
        event_type=raw["event_type"],
        occurred_at=datetime.fromisoformat(raw["timestamp"]),
        properties=raw["properties"],
        user_country=user_lookup.get(raw["user_id"], "unknown"),
        session_id=raw["properties"].get("session_id"),
    )

# ── dataclass: typed, auto-generated __init__/__repr__/__eq__ ──────────
@dataclass
class PipelineConfig:
    source_path: Path
    target_path: Path
    partition_cols: list[str]
    batch_size: int = 50_000
    overwrite: bool = False
    tags: dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        # Validate after construction
        if self.batch_size <= 0:
            raise ValueError(f"batch_size must be positive, got {self.batch_size}")
        self.source_path = Path(self.source_path)   # coerce str → Path
        self.target_path = Path(self.target_path)

@dataclass(frozen=True)          # immutable  -  safe as dict key or set member
class PartitionKey:
    year: int
    month: int
    region: str

    def to_path_fragment(self) -> str:
        return f"year={self.year}/month={self.month:02d}/region={self.region}"

# ── Protocol: structural subtyping ("duck typing" with type safety) ──────
class DataWriter(Protocol):
    """Any object with these methods satisfies DataWriter  -  no inheritance needed."""
    def write(self, records: list[dict[str, Any]], destination: str) -> int: ...
    def flush(self) -> None: ...

class DeltaWriter:
    def write(self, records: list[dict[str, Any]], destination: str) -> int:
        import pyarrow as pa, pyarrow.parquet as pq
        table = pa.Table.from_pylist(records)
        pq.write_to_dataset(table, destination, partition_cols=["year", "month"])
        return len(records)

    def flush(self) -> None:
        pass  # Delta handles commits atomically

def run_pipeline(config: PipelineConfig, writer: DataWriter) -> None:
    records = read_parquet(config.source_path)
    written = writer.write(records, str(config.target_path))
    writer.flush()
    print(f"Wrote {written:,} records to {config.target_path}")`}</CodeBlock>

          <CodeBlock lang="python">{`# ── Generics: reusable typed containers ─────────────────────────────────
from typing import TypeVar, Generic

T = TypeVar("T")
R = TypeVar("R")

class PipelineResult(Generic[T]):
    """Typed result monad  -  avoids returning (data, error) tuples."""
    def __init__(self, value: T | None, error: Exception | None = None) -> None:
        self._value = value
        self._error = error

    @classmethod
    def ok(cls, value: T) -> PipelineResult[T]:
        return cls(value)

    @classmethod
    def fail(cls, error: Exception) -> PipelineResult[T]:
        return cls(None, error)

    def unwrap(self) -> T:
        if self._error is not None:
            raise self._error
        assert self._value is not None
        return self._value

    def map(self, fn: Callable[[T], R]) -> PipelineResult[R]:
        if self._error:
            return PipelineResult.fail(self._error)
        return PipelineResult.ok(fn(self.unwrap()))

# ── Literal types: constrain string parameters ───────────────────────────
WriteMode = Literal["overwrite", "append", "merge", "error"]
FileFormat = Literal["parquet", "delta", "csv", "json"]

def write_dataset(
    df: Any,
    path: str,
    mode: WriteMode = "append",
    fmt: FileFormat = "delta",
) -> None:
    df.write.format(fmt).mode(mode).save(path)

# ── mypy usage (run in CI, not at runtime) ───────────────────────────────
# mypy src/ --strict --ignore-missing-imports
# Key flags:
#   --strict          → enables all optional checks
#   --disallow-any-explicit  → ban bare Any
#   --warn-return-any → warn when function returns Any
#   --no-implicit-optional → None must be explicit (x: str | None)

# pyproject.toml:
# [tool.mypy]
# python_version = "3.11"
# strict = true
# plugins = ["pydantic.mypy"]`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I add type hints for documentation"</td><td>"Type hints let mypy --strict catch mismatches in CI before runtime. A dict typed as TypedDict gets every key checked; bare dict[str, Any] catches nothing."</td></tr>
              <tr><td>"I use dataclass for everything"</td><td>"TypedDict for JSON records you pass around as dicts — keys stay interoperable with json.loads. Dataclass when you need methods, defaults, or frozen immutability."</td></tr>
              <tr><td>"Protocol is like an interface"</td><td>"Protocol uses structural subtyping — no inheritance needed. Any class with the right method signatures satisfies it, which is critical for dependency injection in pipelines."</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-types" questions={[
            { question: "You annotate a function 'def process(record: RawEvent) -> EnrichedEvent'. At runtime, what happens if you pass a plain dict instead of a RawEvent TypedDict?", options: ["Python raises TypeError immediately — TypedDict is enforced at runtime", "Nothing — Python ignores the annotation at runtime; only mypy/Pyright catch this statically", "The function silently converts the dict to RawEvent", "Python raises AttributeError when accessing TypedDict-specific keys"], correct: 1 },
            { question: "A Pipeline class doesn't inherit from DataSource but has all the same method signatures. Under Protocol-based typing, which statement is true?", options: ["Pipeline fails isinstance(pipeline, DataSource) check — Protocol requires inheritance for isinstance", "Pipeline satisfies DataSource Protocol structurally — no inheritance needed, only matching method signatures", "You must use @runtime_checkable on Protocol for static type checking to work", "Protocol only works if the class is defined after the Protocol"], correct: 1 },
            { question: "When should you prefer TypedDict over @dataclass for a pipeline record type?", options: ["Always — TypedDict is faster than dataclass", "When the data is frequently serialized to/from JSON and interop with dict-based APIs matters — TypedDict keeps it a plain dict; dataclass requires .asdict() conversion", "When you need __post_init__ validation logic", "TypedDict supports defaults; dataclass does not"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Run <code>mypy --strict</code> in CI on every PR</li>
                <li>Use TypedDict for JSON/dict records, dataclass for config objects</li>
                <li>Use Protocol for dependency injection instead of ABCs when possible</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use bare <code>dict[str, Any]</code> for record types — it catches nothing</li>
                <li>Skip <code>from __future__ import annotations</code> — causes slow imports from eager evaluation</li>
                <li>Annotate with <code>Any</code> to silence mypy — it defeats the purpose entirely</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-types')) { await unmarkTopicComplete('py-types'); onUnmark('py-types') } else { await markTopicComplete('py-types'); onComplete('py-types') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-types') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-types') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-structures ─────────────────────────────────────────────── */}
        <section id="py-structures" ref={el => { if (el) sectionRefs.current['py-structures'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Data Structures & Big-O</h1>
            <p className="topic-desc">Choosing the right data structure is a multiplier on pipeline performance. A membership test that costs O(n) in a list costs O(1) in a set. A priority queue implemented with a sorted list costs O(n log n) per insert; heapq costs O(log n). These differences dominate at pipeline scale.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "Walk me through the Big-O of Python's core data structures"<br/>• "How would you deduplicate 50 million records efficiently?"<br/>• "When would you use heapq instead of sorted()?"<br/>• "Explain defaultdict vs a regular dict"<br/>• "How would you find the top-100 values in a stream without sorting everything?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate match structure to problem (O(1) set for dedup, heapq for top-K), or do they default to list for everything?</div>
          </div>

          <p>In production, the wrong data structure is the most common cause of pipeline slowdowns that don't show up in small tests. The reason is that O(n) vs O(1) differences are invisible on 1,000 rows but catastrophic on 50 million. A deduplication check using <code>if record_id in seen_list</code> runs 50M operations each touching up to 50M items — O(n²) total. The same check with a set is O(n) total.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"For dedup and membership checks — set. O(1) average for add/in/remove."</td></tr>
              <tr><td>2</td><td>"For lookup enrichment joins — dict. O(1) get/set. I build it once from the dimension table."</td></tr>
              <tr><td>3</td><td>"For top-K over a stream — min-heap of size K with heapq. O(log K) per record."</td></tr>
              <tr><td>4</td><td>"For sliding windows and BFS queues — deque. O(1) at both ends; list.insert(0) is O(n)."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Meta:</strong> Ad impression deduplication pipeline uses Python sets to check 200M event IDs per hour — switching from list to set reduced the dedup stage from 4 hours to 8 minutes.<br/><strong>Spotify:</strong> Track play count aggregation uses Counter + heapq.nlargest() to compute top-1000 tracks per region in real time — O(n log 1000) vs O(n log n) for sorting all tracks.<br/><strong>Uber:</strong> Driver dispatch uses defaultdict(deque) for per-driver event windows — O(1) initialization eliminates the "if key not in dict" boilerplate that was causing KeyErrors in high-throughput event streams.</div>
          </div>

          <DataStructuresDiagram />
          <DataStructuresAnimation />
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'var(--gray-100)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-1)' }}>Structure</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--text-1)' }}>Access</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--text-1)' }}>Search</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--text-1)' }}>Insert</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--text-1)' }}>Delete</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-1)' }}>Best for</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'list', access: 'O(1)', search: 'O(n)', insert: 'O(1) tail', del: 'O(n)', use: 'Ordered sequences, iteration, append' },
                  { name: 'dict', access: 'O(1)', search: 'O(1)', insert: 'O(1)', del: 'O(1)', use: 'Key lookups, grouping, caches' },
                  { name: 'set', access: ' - ', search: 'O(1)', insert: 'O(1)', del: 'O(1)', use: 'Dedup, membership tests, set ops' },
                  { name: 'deque', access: 'O(1) ends', search: 'O(n)', insert: 'O(1) ends', del: 'O(1) ends', use: 'Queues, sliding windows, BFS' },
                  { name: 'heapq', access: 'O(1) min', search: 'O(n)', insert: 'O(log n)', del: 'O(log n)', use: 'Priority queues, top-K, merge' },
                ].map((row, i) => (
                  <tr key={row.name} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '7px 12px', fontWeight: 700, color: 'var(--blue-500)' }}>{row.name}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'center', color: 'var(--text-2)' }}>{row.access}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'center', color: 'var(--text-2)' }}>{row.search}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'center', color: 'var(--text-2)' }}>{row.insert}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'center', color: 'var(--text-2)' }}>{row.del}</td>
                    <td style={{ padding: '7px 12px', color: 'var(--text-3)', fontSize: '.78rem' }}>{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CodeBlock lang="python">{`from collections import deque, defaultdict, Counter, OrderedDict
import heapq
from typing import Any

# ── list: ordered buffer for pipeline batches ───────────────────────────
batch: list[dict[str, Any]] = []

def flush_to_delta(batch: list[dict], target: str) -> None:
    import pyarrow as pa, pyarrow.parquet as pq
    table = pa.Table.from_pylist(batch)
    pq.write_to_dataset(table, table_path=target, partition_cols=["date"])

for event in event_stream:
    batch.append(event)
    if len(batch) >= 10_000:
        flush_to_delta(batch, "/mnt/delta/events")
        batch.clear()   # O(1) clear vs re-creating the list

# ── dict: O(1) lookup  -  use for enrichment joins ────────────────────────
# Build lookup dict from a "small" dimension table (fits in driver memory)
import pandas as pd

dim_df = pd.read_parquet("/mnt/adls/dim_users.parquet", columns=["user_id", "country", "tier"])
user_lookup: dict[int, dict] = {
    row["user_id"]: {"country": row["country"], "tier": row["tier"]}
    for _, row in dim_df.iterrows()
}   # 10M rows → ~800 MB RAM but O(1) per lookup in the hot loop

def enrich(event: dict) -> dict:
    meta = user_lookup.get(event["user_id"], {"country": "unknown", "tier": "free"})
    return {**event, **meta}

# ── set: O(1) membership  -  dedup and existence checks ────────────────────
processed_ids: set[str] = set()

for record in incoming_records:
    if record["id"] in processed_ids:     # O(1)  -  not O(n) like a list
        continue
    processed_ids.add(record["id"])
    process(record)

# Set algebra for pipeline reconciliation:
expected = set(pd.read_csv("expected_ids.csv")["id"])
actual   = set(pd.read_parquet("output.parquet")["id"])
missing  = expected - actual          # in expected but not written
extra    = actual - expected          # written but not in expected
print(f"Missing: {len(missing)}, Extra: {len(extra)}")`}</CodeBlock>

          <CodeBlock lang="python">{`# ── deque: O(1) at both ends  -  sliding windows & work queues ────────────
from collections import deque

# Sliding window: keep last N events per user for anomaly detection
WINDOW = 100
user_event_windows: dict[int, deque] = defaultdict(lambda: deque(maxlen=WINDOW))

for event in stream:
    uid = event["user_id"]
    user_event_windows[uid].append(event["amount"])
    if len(user_event_windows[uid]) == WINDOW:
        avg = sum(user_event_windows[uid]) / WINDOW
        if event["amount"] > avg * 5:
            flag_anomaly(uid, event)

# ── heapq: O(log n) priority  -  top-K and merge sorted streams ───────────
import heapq

# Top-10 highest-revenue customers from a large stream
heap: list[tuple[float, int]] = []   # (revenue, customer_id)

for row in revenue_stream:
    heapq.heappush(heap, (row["revenue"], row["customer_id"]))
    if len(heap) > 10:
        heapq.heappop(heap)   # drop the smallest

top10 = sorted(heap, reverse=True)

# Merge N sorted partition files without loading all into memory:
import pyarrow.parquet as pq

def merge_sorted_partitions(paths: list[str], sort_col: str) -> list[dict]:
    readers = [pq.open_file(p).iter_batches(batch_size=1000) for p in paths]
    return list(heapq.merge(*readers, key=lambda row: row[sort_col]))

# ── defaultdict: auto-init missing keys ─────────────────────────────────
# Group pipeline errors by type without if-key-exists boilerplate
errors: defaultdict[str, list] = defaultdict(list)

for exc in pipeline_exceptions:
    errors[type(exc).__name__].append(str(exc))

for error_type, messages in errors.items():
    print(f"{error_type}: {len(messages)} occurrences")

# ── Counter: frequency analysis in one line ──────────────────────────────
from collections import Counter

event_types = Counter(e["event_type"] for e in events)
print(event_types.most_common(5))
# [('page_view', 42100), ('click', 18300), ('purchase', 4210), ...]

# Combine two counters (union of counts):
today_counts = Counter(today_events)
yesterday_counts = Counter(yesterday_events)
combined = today_counts + yesterday_counts`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I'd use a list and check if the ID is already in it"</td><td>"That's O(n) per check — O(n²) total on 50M records. A set gives O(1) average lookup. At 50M records the set approach runs in seconds; the list approach runs for hours."</td></tr>
              <tr><td>"I'd sort the stream and take the top 100"</td><td>"Sorting requires all data in memory and is O(n log n). A min-heap of size K gives O(n log K) with O(K) memory — heapq.nsmallest(100, stream) does this in one line."</td></tr>
              <tr><td>"defaultdict is just a convenience"</td><td>"It eliminates the if-key-not-in-dict guard that appears in every groupby operation. More importantly, it prevents KeyError race conditions in multi-step aggregations."</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-structures" questions={[
            { question: "A pipeline groups 50M events by user_id using a plain dict, checking 'if user_id not in d: d[user_id] = []' on every row. What is the asymptotic complexity of this grouping operation?", options: ["O(n²) — checking key existence in a dict is O(n)", "O(n) — dict key lookup is O(1) average, so total is O(n)", "O(n log n) — dict uses a sorted tree internally", "O(1) — dicts have constant-time access for all sizes"], correct: 1 },
            { question: "You're streaming 10M revenue records and need to return the top-50 highest-revenue customers without loading all records into memory first. What's the correct approach?", options: ["sorted(stream, key=lambda r: r['revenue'], reverse=True)[:50] — most readable", "heapq of size 50: push each record, pop smallest when size exceeds 50 — O(n log 50) time, O(50) memory", "Counter(r['customer_id'] for r in stream).most_common(50) — designed for frequency counting", "list.sort() then slice — sort is in-place and memory-efficient"], correct: 1 },
            { question: "What is the memory complexity of Python's deque(maxlen=1000) when used as a sliding window for anomaly detection over an infinite stream?", options: ["O(n) — grows with the number of records processed", "O(1) — deque with maxlen auto-evicts old items, maintaining constant size of 1000", "O(log n) — deque uses a balanced tree internally", "O(maxlen²) — each insertion copies the array"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use <code>set</code> for deduplication and membership checks — O(1)</li>
                <li>Use <code>heapq</code> for top-K problems — O(n log K) with O(K) memory</li>
                <li>Use <code>defaultdict(list)</code> for groupby aggregations</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Check membership with <code>if x in my_list</code> in hot loops — it's O(n)</li>
                <li>Sort a full stream to find top-K — use heapq instead</li>
                <li>Use <code>list.insert(0, item)</code> for queue operations — it's O(n); use deque</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-structures')) { await unmarkTopicComplete('py-structures'); onUnmark('py-structures') } else { await markTopicComplete('py-structures'); onComplete('py-structures') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-structures') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-structures') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-comprehensions ─────────────────────────────────────────── */}
        <section id="py-comprehensions" ref={el => { if (el) sectionRefs.current['py-comprehensions'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Comprehensions & Generators Intro</h1>
            <p className="topic-desc">Comprehensions are Python's most idiomatic feature for building collections. They're faster than equivalent for-loops because the iteration is implemented in C inside the interpreter. Generator expressions look identical but produce values lazily  -  critical when processing files or streams that don't fit in memory.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "What's the difference between a list comprehension and a generator expression?"<br/>• "How would you process a 20 GB file without running out of memory?"<br/>• "Why are list comprehensions faster than for-loops?"<br/>• "When would you use a generator vs a list?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate know when to materialize (list comp) vs stream lazily (generator), or do they use list comprehensions everywhere regardless of data size?</div>
          </div>

          <p>List comprehensions build the full collection in memory immediately — they're 30-40% faster than equivalent for-loops because the iteration loop runs in C. The reason generator expressions matter is different: they never build the collection at all. <code>sum(x['amount'] for x in iter_file(path))</code> processes a 20 GB file with O(1) memory because only one record lives in memory at a time.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"List comp when I need the full collection: passing to a function, slicing, indexing."</td></tr>
              <tr><td>2</td><td>"Generator expression when I'm immediately consuming: sum(), max(), writing row-by-row."</td></tr>
              <tr><td>3</td><td>"For large files I always use generators — O(1) memory regardless of file size."</td></tr>
              <tr><td>4</td><td>"List comps are ~30% faster than for-loops because the inner loop runs in C bytecode."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Google:</strong> BigQuery export processing pipelines use generator chaining to process 100 GB JSONL exports — <code>sum(row['revenue'] for row in iter_jsonl(path))</code> uses under 10 MB RAM regardless of export size.<br/><strong>Airbnb:</strong> Schema normalization pipeline uses dict comprehensions to rename 200+ column names in one expression: <code>{'{k: normalize(k) for k in df.columns}'}</code> — reduces 10 lines of loop boilerplate to one.<br/><strong>Netflix:</strong> Content analytics pipelines chain generator expressions for lazy ETL — no intermediate list allocations means 4x less peak memory on 50 GB daily event exports.</div>
          </div>

          <ComprehensionDiagram />
          <ComprehensionAnimation />

          <CodeBlock lang="python">{`# ── List comprehensions ─────────────────────────────────────────────────
# Transform and filter in one expression  -  cleaner than for+append
raw_paths = [
    "/mnt/raw/events_2024-01.jsonl",
    "/mnt/raw/events_2024-02.jsonl",
    "/mnt/raw/.DS_Store",            # junk file  -  filter out
    "/mnt/raw/events_2024-03.jsonl",
]

# Filter + transform: keep only .jsonl, extract filename stem
import os
valid_files = [
    os.path.basename(p).replace(".jsonl", "")
    for p in raw_paths
    if p.endswith(".jsonl")
]
# ['events_2024-01', 'events_2024-02', 'events_2024-03']

# Nested comprehension: flatten partitioned records from multiple tables
from pathlib import Path
import json

all_records = [
    record
    for partition_file in Path("/mnt/landing/orders").glob("**/*.jsonl")
    for record in map(json.loads, partition_file.read_text().splitlines())
    if record.get("status") != "cancelled"
]

# Comprehension with complex expression:
def normalize_col(name: str) -> str:
    return name.strip().lower().replace(" ", "_").replace("-", "_")

schema_map = {col: normalize_col(col) for col in raw_df.columns}
# {'User ID': 'user_id', 'Event-Type': 'event_type', ' Amount ': 'amount'}

renamed_df = raw_df.rename(columns=schema_map)

# ── Dict comprehensions ──────────────────────────────────────────────────
# Invert a lookup table (swap keys ↔ values)
country_code = {"US": "United States", "GB": "United Kingdom", "DE": "Germany"}
code_by_name  = {v: k for k, v in country_code.items()}

# Build partition stats from a list of row dicts:
import statistics
from collections import defaultdict

rows = load_rows("/mnt/silver/sales.parquet")
revenue_by_region: dict[str, float] = {
    region: sum(r["amount"] for r in group)
    for region, group in groupby_key(rows, "region").items()
}

# ── Set comprehensions ───────────────────────────────────────────────────
# Unique event types seen in today's load  -  for schema validation
seen_event_types: set[str] = {row["event_type"] for row in rows}

EXPECTED_EVENTS = {"page_view", "click", "purchase", "refund"}
unexpected = seen_event_types - EXPECTED_EVENTS
if unexpected:
    raise ValueError(f"Unexpected event types: {unexpected}")`}</CodeBlock>

          <CodeBlock lang="python">{`# ── Generator expressions: lazy evaluation ──────────────────────────────
import csv, gzip, json
from pathlib import Path

# Reading a 20 GB gzipped JSONL file  -  generator never loads it all into RAM
def iter_jsonl_gz(path: str):
    """Yield one parsed dict per line from a gzipped JSONL file."""
    with gzip.open(path, "rt", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)

# Aggregate with generator  -  only one record in memory at a time:
total_revenue = sum(
    row["amount"]
    for row in iter_jsonl_gz("/mnt/raw/transactions_2024.jsonl.gz")
    if row["currency"] == "USD" and row["status"] == "completed"
)

# Count lines in a huge file without reading into memory:
line_count = sum(1 for _ in open("/mnt/raw/bigfile.csv"))

# Generator pipeline  -  chain transformations lazily:
def parse_csv_rows(path: str):
    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        yield from reader   # yield from delegates to the inner iterator

def clean_row(row: dict) -> dict:
    return {k: v.strip() for k, v in row.items() if v.strip()}

def validate_row(row: dict) -> bool:
    return bool(row.get("user_id")) and bool(row.get("event_type"))

# Compose pipeline  -  nothing executes until we consume:
raw   = parse_csv_rows("/mnt/landing/events.csv")
clean = (clean_row(r) for r in raw)
valid = (r for r in clean if validate_row(r))

# Consume  -  only now does data flow through all stages:
BATCH_SIZE = 5_000
batch = []
for record in valid:
    batch.append(record)
    if len(batch) >= BATCH_SIZE:
        write_to_delta(batch, "/mnt/silver/events")
        batch.clear()
if batch:
    write_to_delta(batch, "/mnt/silver/events")   # flush remainder

# ── Performance: comprehension vs for-loop ───────────────────────────────
import timeit

# List comp: CPython executes the loop in C (faster bytecode path)
t_comp  = timeit.timeit("[x**2 for x in range(100_000)]", number=100)

# Equivalent for-loop: slower due to Python bytecode overhead per iteration
t_loop  = timeit.timeit(
    "result = []\nfor x in range(100_000):\n    result.append(x**2)",
    number=100
)

print(f"Comprehension: {t_comp:.3f}s  |  For-loop: {t_loop:.3f}s")
# Comprehension: 0.83s  |  For-loop: 1.21s  (~30 - 40% faster typical)

# Generator expression: no list allocation at all  -  best for aggregation
t_gen = timeit.timeit("sum(x**2 for x in range(100_000))", number=100)
# Slightly slower than list comp for sum() due to generator overhead,
# but uses O(1) memory vs O(n)  -  the right trade-off for large data.`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I use list comprehensions for everything — they're cleaner"</td><td>"List comp is right when I need the full result. For aggregations over large files I use generator expressions — same syntax, zero memory overhead, because nothing is materialized."</td></tr>
              <tr><td>"sum([x for x in large_file]) is fine"</td><td>"That allocates the entire file in RAM first. sum(x for x in large_file) is identical speed but O(1) memory — the generator feeds directly into sum() without building a list."</td></tr>
              <tr><td>"Generator expressions are slower"</td><td>"For aggregations they're faster because there's no list allocation. For random access they're inappropriate. The question is always: do I need the collection or just the aggregate?"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-comprehensions" questions={[
            { question: "A pipeline needs to compute total revenue from a 15 GB gzipped JSONL file. The machine has 8 GB RAM. Which code runs successfully?", options: ["total = sum([row['amount'] for row in iter_jsonl_gz(path)]) — list comp is optimized for sum()", "total = sum(row['amount'] for row in iter_jsonl_gz(path)) — generator never materializes the full list", "df = pd.read_json(path) then df['amount'].sum() — pandas reads in chunks automatically", "All three work identically — Python handles memory automatically"], correct: 1 },
            { question: "Why does [x**2 for x in range(1_000_000)] run about 30-40% faster than an equivalent for-loop with list.append()?", options: ["Python pre-compiles list comprehensions to native code", "The list comprehension's internal loop runs in C bytecode — each append in a Python for-loop requires a Python function call overhead per iteration", "List comprehensions use multiple CPU cores automatically", "CPython reserves memory for the full list upfront, avoiding reallocation"], correct: 1 },
            { question: "A set comprehension {row['user_id'] for row in events} and list comprehension [row['user_id'] for row in events] both iterate over the same data. What critical behavioral difference should a data engineer know?", options: ["Set comprehension is O(n log n); list comprehension is O(n)", "Set comprehension deduplicates automatically — it produces only unique user_ids; list comprehension preserves duplicates. Use set comp when you need distinct values.", "List comprehension preserves insertion order; set comprehension sorts the output", "They are identical — sets and lists have the same iteration semantics"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use generator expressions for <code>sum()</code>, <code>max()</code>, row-by-row writes</li>
                <li>Chain generators for lazy ETL pipelines with O(1) memory</li>
                <li>Use list comp only when you need random access or the full collection</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use list comp to feed directly into <code>for x in [...]</code> — use a generator</li>
                <li>Materialize gigabytes into a list just to aggregate it</li>
                <li>Nest comprehensions more than 2 levels deep — extract to a function</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-comprehensions')) { await unmarkTopicComplete('py-comprehensions'); onUnmark('py-comprehensions') } else { await markTopicComplete('py-comprehensions'); onComplete('py-comprehensions') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-comprehensions') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-comprehensions') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-functions" ref={el => { if (el) sectionRefs.current['py-functions'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Functions, args/kwargs, closures, functools</h1><p className="topic-desc">Python functions are first-class objects. Mastering args/kwargs, closures, functools.partial, and lru_cache is essential for building flexible, reusable pipeline components.</p></div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "What's the difference between *args and **kwargs?"<br/>• "Explain closures and when you'd use them in a pipeline"<br/>• "How does functools.lru_cache work?"<br/>• "What does functools.partial do and when is it useful?"<br/>• "Write a function that returns a validator for a given schema"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate use higher-order functions fluently (closures for factories, partial for specialization, lru_cache for memoization) — or do they copy-paste boilerplate for each variation?</div>
          </div>

          <p>Functions are first-class objects in Python — you can pass them, return them, and store them. In production, this enables powerful patterns: closures capture configuration at creation time (making <code>make_validator(schema)</code> return a reusable checker), <code>functools.partial</code> specializes general functions without subclassing, and <code>lru_cache</code> memoizes expensive DB lookups with zero boilerplate. The reason these matter is that they replace class hierarchies with simpler composable functions.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"*args captures extra positional args as a tuple; **kwargs captures keyword args as a dict."</td></tr>
              <tr><td>2</td><td>"Closures let me build factory functions — make_validator(schema) returns a function that closes over the schema."</td></tr>
              <tr><td>3</td><td>"functools.partial pre-fills arguments: write_raw = partial(write_to_gcs, bucket='raw-bucket')."</td></tr>
              <tr><td>4</td><td>"lru_cache(maxsize=1024) memoizes a function — same inputs return cached output. I use it for dimension lookups."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Stripe:</strong> Payment validation uses closure-based schema validators — <code>make_validator(schema)</code> is called once at startup per endpoint, returning a cached function that processes millions of requests/day without re-parsing the schema.<br/><strong>Databricks:</strong> Delta Lake Python API uses functools.partial extensively to create environment-specific write functions — <code>write_prod = partial(write_delta, env='prod', format='delta')</code> — reducing per-table boilerplate by 80%.<br/><strong>Google:</strong> BigQuery client wrapper uses lru_cache for schema lookups — fetching table schemas once and caching them reduces API calls from O(n queries) to O(unique tables) in batch pipelines.</div>
          </div>

          <FunctionsDiagram />
          <FunctoolsAnimation />
          <CodeBlock lang="python">{`from typing import Any, Callable
import functools

# *args and **kwargs - accept any positional/keyword arguments
def log_pipeline_step(step_name: str, *metrics, **metadata) -> None:
    """Log pipeline step with arbitrary metrics and metadata."""
    import logging
    logger = logging.getLogger(__name__)
    metrics_str = ", ".join(str(m) for m in metrics)
    meta_str = ", ".join(f"{k}={v}" for k, v in metadata.items())
    logger.info(f"[{step_name}] metrics=({metrics_str}) {meta_str}")

log_pipeline_step("ingest", 10_000, 0.98, source="s3", table="events", duration_ms=342)

# Keyword-only arguments (after *) - must be passed by name
def read_parquet(path: str, *, columns: list[str] | None = None,
                  filters: list | None = None, row_limit: int | None = None):
    import pyarrow.parquet as pq
    return pq.read_table(path, columns=columns, filters=filters).to_pandas()

df = read_parquet("s3://bucket/data.parquet", columns=["user_id", "amount"], row_limit=1000)

# Closures - function that captures outer scope variables
def make_validator(schema: dict[str, type]) -> Callable[[dict], bool]:
    """Returns a validator function that closes over the schema."""
    def validate(record: dict) -> bool:
        for field, expected_type in schema.items():
            if field not in record:
                raise ValueError(f"Missing field: {field}")
            if not isinstance(record[field], expected_type):
                raise TypeError(f"{field} expected {expected_type.__name__}")
        return True
    return validate  # validate closes over 'schema'

validate_event = make_validator({"user_id": int, "event_type": str, "ts": float})
validate_event({"user_id": 42, "event_type": "click", "ts": 1700000000.0})  # True

# functools.partial - pre-fill arguments to create specialized functions
import functools

def write_to_gcs(df, bucket: str, path: str, format: str = "parquet") -> None:
    df.to_parquet(f"gs://{bucket}/{path}")

# Specialized writers with bucket pre-filled
write_raw   = functools.partial(write_to_gcs, bucket="my-raw-bucket")
write_curated = functools.partial(write_to_gcs, bucket="my-curated-bucket", format="parquet")

write_raw(df, path="events/2024-01-01/data.parquet")
write_curated(df, path="orders/daily/2024-01-01.parquet")`}</CodeBlock>

          <CodeBlock lang="python">{`import functools
from typing import TypeVar

# lru_cache - memoize expensive lookups (dimension tables, configs)
@functools.lru_cache(maxsize=1024)
def get_customer_tier(customer_id: int) -> str:
    """Cached DB lookup - same customer_id returns cached result."""
    result = db.execute(
        "SELECT tier FROM customers WHERE id = %s", (customer_id,)
    ).fetchone()
    return result["tier"] if result else "unknown"

# Cache info: hits, misses, maxsize, currsize
print(get_customer_tier.cache_info())  # CacheInfo(hits=847, misses=153, ...)

# functools.reduce - fold a sequence into a single value
from functools import reduce

# Merge multiple DataFrames with reduce
import pandas as pd
dfs = [pd.read_parquet(p) for p in parquet_files]
merged = reduce(lambda left, right: pd.merge(left, right, on="id", how="inner"), dfs)

# Apply pipeline stages functionally
pipeline_stages = [clean_nulls, normalize_schema, add_audit_cols, deduplicate]
result = reduce(lambda df, fn: fn(df), pipeline_stages, raw_df)

# singledispatch - method overloading based on type
@functools.singledispatch
def serialize(obj) -> str:
    raise NotImplementedError(f"Cannot serialize {type(obj)}")

@serialize.register(dict)
def _(obj: dict) -> str:
    import json
    return json.dumps(obj)

@serialize.register(pd.DataFrame)
def _(obj: pd.DataFrame) -> str:
    return obj.to_csv(index=False)`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I create a new function for each pipeline variant"</td><td>"I use functools.partial to specialize a general function once: write_raw = partial(write_to_gcs, bucket='raw'). One general function, N specialized versions — no duplication."</td></tr>
              <tr><td>"I call the DB on every dimension lookup"</td><td>"I decorate the lookup function with @lru_cache(maxsize=10_000). First call hits the DB; subsequent calls with the same ID return instantly. cache_info() shows hit rate."</td></tr>
              <tr><td>"I use a class to hold shared state for validators"</td><td>"A closure is simpler: make_validator(schema) returns a validate() function that closes over schema. No class, no self, no __init__ — just a function that returns a function."</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-functions" questions={[
            { question: "A function uses @functools.lru_cache(maxsize=256). After 300 unique inputs are processed, what happens to the oldest cached results?", options: ["They raise a CacheOverflowError", "The cache evicts the least recently used entries when maxsize is exceeded — the 256 most recently used results are kept", "The cache silently doubles in size", "All cached results are cleared and rebuilt from scratch"], correct: 1 },
            { question: "You have: write_to_gcs(df, bucket, path, format='parquet'). You need 3 specialized writers for 3 different buckets. What's the correct approach?", options: ["Subclass a WriteBase class and override bucket in __init__", "Use functools.partial: write_raw = partial(write_to_gcs, bucket='raw-bucket') — creates a new callable with bucket pre-filled", "Create 3 lambda functions that call write_to_gcs with hardcoded bucket names", "Use global variables to configure the bucket before each call"], correct: 1 },
            { question: "What does a closure capture — and when does capture happen?", options: ["A closure captures variable values at the time it's called", "A closure captures the enclosing scope's variable bindings at definition time — if the outer variable changes later, the closure sees the latest value", "A closure creates a deep copy of all variables in scope", "Closures only capture variables that are explicitly passed as arguments"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use <code>functools.partial</code> to specialize general functions for specific environments</li>
                <li>Use <code>@lru_cache</code> for expensive dimension table lookups</li>
                <li>Use closures (factory functions) to capture configuration at creation time</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use mutable default arguments like <code>def fn(cache=[])</code> — shared across all calls</li>
                <li>Apply <code>@lru_cache</code> to functions with unhashable arguments (dicts, lists)</li>
                <li>Overuse <code>functools.reduce</code> when a simple for-loop is more readable</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-functions')) { await unmarkTopicComplete('py-functions'); onUnmark('py-functions') } else { await markTopicComplete('py-functions'); onComplete('py-functions') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-functions') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-functions') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-generators" ref={el => { if (el) sectionRefs.current['py-generators'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Generators &amp; itertools</h1><p className="topic-desc">Generators are the cornerstone of memory-efficient data pipelines in Python. itertools provides lazy, composable building blocks for data stream processing.</p></div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How would you stream records from S3 without loading everything into memory?"<br/>• "Explain the yield keyword and generator lifecycle"<br/>• "What does itertools.groupby require before you call it?"<br/>• "How do you compose multiple transformation steps lazily?"<br/>• "Difference between yield and yield from"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate understand that generators enable O(1) memory pipeline stages that compose lazily — not just that "yield makes a generator"?</div>
          </div>

          <p>A generator function suspends execution at each <code>yield</code> and resumes from that exact point on the next <code>next()</code> call. In production, this is the mechanism that lets you chain five transformation stages over a 50 GB S3 file using constant memory — each record flows through all stages one at a time, never building an intermediate list. The reason itertools matters is that it provides these lazy building blocks without you needing to write them: <code>chain</code>, <code>islice</code>, <code>groupby</code>, <code>batched</code> all compose naturally with generator pipelines.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"yield pauses the function and returns a value. next() resumes it from the same point."</td></tr>
              <tr><td>2</td><td>"yield from delegates to a sub-iterator — it flattens one level, great for streaming from multiple S3 objects."</td></tr>
              <tr><td>3</td><td>"I compose pipeline stages as generator functions: raw = read_jsonl(path); clean = (clean(r) for r in raw); valid = (r for r in clean if validate(r))."</td></tr>
              <tr><td>4</td><td>"itertools.groupby requires pre-sorted data — it only groups consecutive equal keys."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Airbnb:</strong> Listing data export pipeline uses generator-chained ETL to process 200M listing records from S3 — peak memory stays under 500 MB regardless of export size by never materializing intermediate stages.<br/><strong>Databricks:</strong> Custom log parser for 10 TB/day of Spark executor logs uses itertools.groupby on sorted log lines — groups errors by executor ID in one pass without loading all logs into a dict first.<br/><strong>Spotify:</strong> Playlist recommendation pipeline uses itertools.batched to group stream records into 500-row batches for Postgres bulk inserts — 40x faster than row-by-row inserts with minimal code change.</div>
          </div>

          <GeneratorDiagram />
          <GeneratorAnimation />
          <CodeBlock lang="python">{`from typing import Iterator, Generator
import itertools

# Generator function - yields values lazily
def stream_s3_records(bucket: str, prefix: str) -> Iterator[dict]:
    """Stream records from many S3 objects without loading all into memory."""
    import boto3, json
    s3 = boto3.client("s3")
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            response = s3.get_object(Bucket=bucket, Key=obj["Key"])
            for line in response["Body"].iter_lines():
                yield json.loads(line)

# Memory footprint: constant regardless of dataset size
for record in stream_s3_records("my-bucket", "events/2024/"):
    process(record)

# yield from - delegate to sub-generator (flattens one level)
def stream_all_sources(sources: list[str]) -> Iterator[dict]:
    for source in sources:
        yield from stream_s3_records("my-bucket", source)

# Generator with send() - two-way communication
def running_average() -> Generator[float, float, str]:
    """Coroutine: send values in, get running average back."""
    total, count = 0.0, 0
    while True:
        value = yield total / count if count else 0.0
        if value is None:
            return f"Final average: {total/count:.2f}"
        total += value
        count += 1

avg = running_average()
next(avg)          # prime the coroutine
avg.send(10.0)     # → 10.0
avg.send(20.0)     # → 15.0
avg.send(30.0)     # → 20.0

# Chaining generators into a pipeline (lazy, memory efficient)
def read_jsonl(path: str) -> Iterator[dict]:
    import gzip, json
    opener = gzip.open if path.endswith(".gz") else open
    with opener(path, "rt") as f:
        for line in f:
            yield json.loads(line.strip())

def filter_records(records: Iterator[dict], field: str, value) -> Iterator[dict]:
    return (r for r in records if r.get(field) == value)

def transform_record(records: Iterator[dict]) -> Iterator[dict]:
    for r in records:
        yield {**r, "amount_usd": r["amount"] / 100, "processed": True}

# Compose the pipeline - nothing runs until you consume it
pipeline = transform_record(
    filter_records(read_jsonl("events.jsonl.gz"), "type", "purchase")
)
for record in pipeline:
    load_to_db(record)`}</CodeBlock>

          <CodeBlock lang="python">{`import itertools
from collections import defaultdict

# itertools.chain - concatenate multiple iterables lazily
jan_records = stream_s3_records("bucket", "events/2024-01/")
feb_records = stream_s3_records("bucket", "events/2024-02/")
all_records = itertools.chain(jan_records, feb_records)

# itertools.islice - take first N records (useful for sampling/testing)
sample = list(itertools.islice(stream_s3_records("bucket", "events/"), 1000))

# itertools.groupby - group consecutive records by key (must be sorted first!)
sorted_events = sorted(events, key=lambda e: e["user_id"])
for user_id, user_events in itertools.groupby(sorted_events, key=lambda e: e["user_id"]):
    events_list = list(user_events)
    print(f"User {user_id}: {len(events_list)} events")

# itertools.batched (Python 3.12+) / manual batching for DB inserts
def batched(iterable, n: int):
    """Yield successive n-sized batches."""
    it = iter(iterable)
    while batch := list(itertools.islice(it, n)):
        yield batch

for batch in batched(stream_s3_records("bucket", "events/"), n=500):
    db.executemany("INSERT INTO events VALUES (%s, %s, %s)", batch)

# itertools.combinations / permutations - for feature engineering
columns = ["age", "income", "score"]
feature_pairs = list(itertools.combinations(columns, 2))
# [('age', 'income'), ('age', 'score'), ('income', 'score')]

# itertools.product - Cartesian product for parameter grids
regions = ["us-east", "eu-west", "ap-south"]
dates = pd.date_range("2024-01-01", "2024-01-07").strftime("%Y-%m-%d").tolist()
jobs = list(itertools.product(regions, dates))
# [('us-east', '2024-01-01'), ('us-east', '2024-01-02'), ...]

# itertools.accumulate - running totals
import operator
daily_sales = [1200, 850, 2100, 670, 1900]
cumulative = list(itertools.accumulate(daily_sales, operator.add))
# [1200, 2050, 4150, 4820, 6720]`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I return a list from my read function"</td><td>"For large datasets I always yield — the caller controls how much to buffer. A generator composes naturally: read() | filter() | transform() all stay lazy with O(1) memory each."</td></tr>
              <tr><td>"I use itertools.groupby like a SQL GROUP BY"</td><td>"groupby only groups consecutive equal keys — you must sort first. For unsorted data I use defaultdict(list) instead. Forgetting this is the #1 groupby bug in pipeline code."</td></tr>
              <tr><td>"yield from is just a for loop with yield"</td><td>"yield from is a proper delegation — it forwards send() and throw() into the sub-generator too, which matters for coroutine pipelines that use generator.send() for two-way communication."</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-generators" questions={[
            { question: "A generator pipeline: raw = read_s3(); clean = (clean(r) for r in raw); valid = (r for r in clean if validate(r)). When does any data actually flow through the pipeline?", options: ["When clean is defined — generator expressions execute immediately", "When valid is defined — the final expression triggers upstream evaluation", "When you consume valid in a for loop or pass it to list()/sum() — generators are lazy until consumed", "When read_s3() is called — S3 reads are always eager"], correct: 2 },
            { question: "itertools.groupby(sorted_records, key=lambda r: r['region']) — what happens if sorted_records is NOT sorted by region?", options: ["groupby raises a ValueError: data must be sorted", "groupby silently produces incorrect results — it only groups consecutive equal keys, so unsorted data creates multiple groups for the same key", "groupby automatically sorts the input before grouping", "groupby works correctly on unsorted data but is slower"], correct: 1 },
            { question: "What is the key behavioral difference between yield and yield from when delegating to a sub-generator?", options: ["They are identical — yield from is syntactic sugar for 'for x in sub: yield x'", "yield from also forwards .send() and .throw() calls into the sub-generator, enabling proper coroutine delegation — a plain for/yield loop cannot do this", "yield from is only valid inside async functions", "yield from materializes the sub-generator into a list before yielding"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use generator functions for streaming S3/GCS/ADLS records</li>
                <li>Sort before <code>itertools.groupby</code> — it only groups consecutive keys</li>
                <li>Use <code>itertools.batched</code> (3.12+) or manual batching for bulk DB inserts</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Materialize a generator with <code>list()</code> unless you actually need random access</li>
                <li>Call <code>itertools.groupby</code> on unsorted data — silent wrong results</li>
                <li>Use a generator where the caller needs to iterate it twice — generators are single-pass</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-generators')) { await unmarkTopicComplete('py-generators'); onUnmark('py-generators') } else { await markTopicComplete('py-generators'); onComplete('py-generators') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-generators') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-generators') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-decorators" ref={el => { if (el) sectionRefs.current['py-decorators'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Decorators</h1><p className="topic-desc">Decorators let you wrap functions with cross-cutting concerns (logging, retry, timing, caching) without modifying business logic. They are the backbone of clean, DRY pipeline code.</p></div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "Write a retry decorator with exponential backoff"<br/>• "What does @functools.wraps do and why is it important?"<br/>• "When stacking decorators, what order do they execute?"<br/>• "How would you implement a rate limiter as a decorator?"<br/>• "What's the advantage of a class-based decorator over a function-based one?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate understand the mechanics (wrapper pattern, @functools.wraps, stacking order) and can they write a production-quality retry decorator from scratch?</div>
          </div>

          <p>A decorator is syntactic sugar for <code>fetch_api = retry(timer(rate_limit(fetch_api)))</code>. In production, decorators are where cross-cutting concerns live: every API call gets retry with backoff, every expensive function gets timing, every external call gets rate limiting — without touching the business logic. The reason <code>@functools.wraps(func)</code> is non-negotiable is that without it, the wrapper replaces the original function's <code>__name__</code> and <code>__doc__</code>, which breaks logging, introspection, and pytest reporting.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"A decorator is a function that takes a function and returns a function. @functools.wraps copies metadata."</td></tr>
              <tr><td>2</td><td>"Stacking: @A @B @C applies bottom-up — C wraps func first, B wraps that, A wraps that. Execution order is A → B → C → func → C → B → A."</td></tr>
              <tr><td>3</td><td>"For parametrized decorators I need 3 levels: retry() returns a decorator, which returns a wrapper."</td></tr>
              <tr><td>4</td><td>"Class-based decorators maintain state across calls — useful for TTL caches and call counters."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Stripe:</strong> All payment API calls are wrapped with a @retry(max_attempts=3, backoff=2.0, exceptions=(ConnectionError, Timeout)) decorator — handles transient failures transparently with zero code duplication across 200+ API call sites.<br/><strong>Airflow:</strong> The @task decorator wraps Python functions as DAG tasks — it captures function metadata, handles XCom serialization, and injects execution context. Built on the same decorator mechanics.<br/><strong>Netflix:</strong> Rate-limiting decorators on all Chaos Monkey API calls prevent test-induced DDoS — a single @rate_limit(calls_per_second=10) decorator replaced 50+ manual time.sleep() calls across their reliability testing codebase.</div>
          </div>

          <DecoratorDiagram />
          <DecoratorAnimation />
          <CodeBlock lang="python">{`import functools, time, logging, threading
from typing import TypeVar, Callable, Any

F = TypeVar("F", bound=Callable[..., Any])
logger = logging.getLogger(__name__)

# Parametric retry decorator with exponential backoff
def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple[type[Exception], ...] = (Exception,),
) -> Callable[[F], F]:
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exc: Exception | None = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exc = e
                    wait = delay * (backoff ** (attempt - 1))
                    logger.warning(
                        f"{func.__name__} attempt {attempt}/{max_attempts} failed: {e}. "
                        f"Retrying in {wait:.1f}s..."
                    )
                    if attempt < max_attempts:
                        time.sleep(wait)
            raise last_exc  # type: ignore[misc]
        return wrapper  # type: ignore[return-value]
    return decorator

# Timer decorator
def timer(func: F) -> F:
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info(f"{func.__name__} completed in {elapsed:.3f}s")
        return result
    return wrapper  # type: ignore[return-value]

# Rate limiter (token bucket style) - for API calls
def rate_limit(calls_per_second: float) -> Callable[[F], F]:
    min_interval = 1.0 / calls_per_second
    lock = threading.Lock()
    last_call: list[float] = [0.0]

    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            with lock:
                elapsed = time.time() - last_call[0]
                if elapsed < min_interval:
                    time.sleep(min_interval - elapsed)
                last_call[0] = time.time()
            return func(*args, **kwargs)
        return wrapper  # type: ignore[return-value]
    return decorator

# Stacking decorators (applied bottom-up, executed top-down)
@retry(max_attempts=3, delay=2.0, exceptions=(ConnectionError, TimeoutError))
@timer
@rate_limit(calls_per_second=10.0)
def fetch_api_page(endpoint: str, page: int, token: str) -> dict:
    import httpx
    resp = httpx.get(
        endpoint,
        params={"page": page, "per_page": 100},
        headers={"Authorization": f"Bearer {token}"},
        timeout=30.0,
    )
    resp.raise_for_status()
    return resp.json()`}</CodeBlock>

          <CodeBlock lang="python">{`import functools
from dataclasses import dataclass

# Class-based decorator - maintains state across calls
class Memoize:
    """Decorator class with configurable TTL-based cache."""
    def __init__(self, ttl_seconds: float = 300.0):
        self.ttl = ttl_seconds
        self.cache: dict = {}
        self.timestamps: dict = {}

    def __call__(self, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))
            now = time.time()
            if key in self.cache and (now - self.timestamps[key]) < self.ttl:
                return self.cache[key]
            result = func(*args, **kwargs)
            self.cache[key] = result
            self.timestamps[key] = now
            return result
        wrapper.cache_clear = lambda: (self.cache.clear(), self.timestamps.clear())
        return wrapper

@Memoize(ttl_seconds=60.0)
def get_dimension_table(table_name: str) -> dict:
    """Refresh dimension lookup at most once per minute."""
    rows = db.execute(f"SELECT id, value FROM {table_name}").fetchall()
    return {row["id"]: row["value"] for row in rows}

# Decorator for schema validation at function boundary
def validate_input(**field_types):
    """Validate dict argument field types at runtime."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(record: dict, *args, **kwargs):
            for field, expected in field_types.items():
                if field not in record:
                    raise ValueError(f"Missing required field: {field}")
                if not isinstance(record[field], expected):
                    raise TypeError(
                        f"Field '{field}': expected {expected.__name__}, "
                        f"got {type(record[field]).__name__}"
                    )
            return func(record, *args, **kwargs)
        return wrapper
    return decorator

@validate_input(user_id=int, event_type=str, amount=float)
def process_event(record: dict) -> dict:
    return {**record, "amount_usd": record["amount"] / 100}`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I add retry logic inside the function"</td><td>"I use a parametrized @retry(max_attempts=3, backoff=2.0, exceptions=(ConnectionError,)) decorator. The retry logic lives once; all 50 API call functions get it with one line each."</td></tr>
              <tr><td>"I skip functools.wraps"</td><td>"Without @functools.wraps(func), the wrapper has __name__='wrapper' and no docstring. That breaks pytest output, logging, and any code that inspects function metadata."</td></tr>
              <tr><td>"@A @B @C — A runs first"</td><td>"Applied bottom-up: C wraps func, B wraps C's wrapper, A wraps B's wrapper. At call time execution enters A first, then B, then C, then the original function."</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-decorators" questions={[
            { question: "A decorator omits @functools.wraps(func). What is the observable consequence in a production pipeline?", options: ["The decorator runs twice on each call", "The wrapped function's __name__ becomes 'wrapper' — breaking structured logging that uses func.__name__, pytest reporting, and any introspection tools", "The decorator ignores exceptions thrown by the wrapped function", "functools.wraps is only needed for class-based decorators"], correct: 1 },
            { question: "Given @retry @timer @rate_limit def fetch_data(): ... — when fetch_data() is called, which decorator's code executes first?", options: ["rate_limit — innermost, closest to the original function", "timer — middle decorator always executes first", "retry — outermost decorator executes first at call time, last at return time", "All three execute simultaneously"], correct: 2 },
            { question: "You need a decorator that tracks the total number of calls to a function across the entire program lifetime. Which implementation is most appropriate?", options: ["A function-based decorator with a local variable inside the wrapper", "A class-based decorator using self.call_count as an instance variable — class maintains state across all invocations", "functools.lru_cache with maxsize=None", "A closure that captures a mutable default argument for the counter"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Always use <code>@functools.wraps(func)</code> in every decorator</li>
                <li>Use parametrized decorators for retry, timer, rate_limit with configurable values</li>
                <li>Use class-based decorators when you need state (TTL caches, call counters)</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Omit <code>@functools.wraps</code> — silent debugging pain</li>
                <li>Put business logic inside a decorator — decorators are for cross-cutting concerns only</li>
                <li>Stack more than 3-4 decorators — call overhead and debug complexity compound</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-decorators')) { await unmarkTopicComplete('py-decorators'); onUnmark('py-decorators') } else { await markTopicComplete('py-decorators'); onComplete('py-decorators') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-decorators') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-decorators') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-oop" ref={el => { if (el) sectionRefs.current['py-oop'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">OOP, ABC, Protocol, dataclasses, __slots__</h1><p className="topic-desc">Python's OOP supports multiple inheritance, abstract base classes, structural typing via Protocol, and zero-boilerplate value objects with dataclasses. Understanding MRO and __dunder__ methods is critical for building reusable DE frameworks.</p></div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "What's the difference between ABC and Protocol in Python?"<br/>• "When would you use @dataclass(frozen=True)?"<br/>• "What does __slots__ do and when does it matter?"<br/>• "Explain Python's MRO for multiple inheritance"<br/>• "Design a pluggable data source interface for a pipeline framework"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate reach for the right abstraction (ABC for shared behavior contracts, Protocol for dependency injection, dataclass for value objects) — or do they use class for everything?</div>
          </div>

          <p>In production pipeline frameworks, OOP is about choosing the right abstraction level. ABCs enforce that subclasses implement required methods at instantiation time — good for plugin architectures where you want a loud error if a method is missing. Protocol enables dependency injection without coupling: any class with matching methods satisfies the interface. Dataclasses eliminate <code>__init__</code> boilerplate for config and record objects. The reason <code>__slots__</code> matters is memory: at 10 million EventRecord objects in a pipeline, replacing <code>__dict__</code> with fixed slots saves ~400 MB of RAM.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"ABC for nominal typing — subclasses must inherit and implement abstract methods. Gets a TypeError at instantiation if they don't."</td></tr>
              <tr><td>2</td><td>"Protocol for structural typing — any class with the right methods satisfies it. No inheritance needed — great for dependency injection."</td></tr>
              <tr><td>3</td><td>"@dataclass for value objects: config, partition keys, records. frozen=True makes it immutable and hashable."</td></tr>
              <tr><td>4</td><td>"__slots__ replaces __dict__ with a fixed slot array — 40% less memory when creating millions of instances."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Apache Airflow:</strong> BaseOperator is an ABC that all 500+ operators inherit from — abstract execute() must be implemented, or instantiation raises TypeError. This pattern caught 200+ missing implementations during migration to Airflow 2.0.<br/><strong>dbt:</strong> Adapter classes use Protocol-style structural typing — any adapter implementing query()/execute()/get_columns() works with the core framework. Snowflake, BigQuery, Redshift adapters all satisfy the Protocol without a shared inheritance chain.<br/><strong>Uber:</strong> SparkJob dataclass with frozen=True serves as an immutable job specification — hashable, usable as dict keys for job deduplication, safe to pass across thread boundaries without defensive copies.</div>
          </div>

          <OOPDiagram />
          <OOPAnimation />
          <CodeBlock lang="python">{`from abc import ABC, abstractmethod
from typing import Protocol, runtime_checkable

# Abstract Base Class - nominal subtyping (must explicitly inherit)
class DataSource(ABC):
    """All data sources must implement read() and schema()."""

    @abstractmethod
    def read(self, path: str) -> "DataFrame": ...

    @abstractmethod
    def write(self, df: "DataFrame", path: str) -> None: ...

    @abstractmethod
    def schema(self) -> dict[str, str]: ...

    def validate(self, df: "DataFrame") -> bool:
        """Non-abstract: shared logic all subclasses can use."""
        return len(df) > 0

class S3ParquetSource(DataSource):
    def __init__(self, bucket: str, region: str = "us-east-1"):
        self.bucket = bucket
        self.region = region

    def read(self, path: str):
        import pyarrow.parquet as pq
        return pq.read_table(f"s3://{self.bucket}/{path}").to_pandas()

    def write(self, df, path: str):
        df.to_parquet(f"s3://{self.bucket}/{path}", index=False)

    def schema(self) -> dict[str, str]:
        return {"user_id": "int64", "event_type": "string", "ts": "timestamp"}

# Protocol - structural subtyping (duck typing with type safety)
@runtime_checkable
class Closeable(Protocol):
    def close(self) -> None: ...

class Connectable(Protocol):
    def connect(self, dsn: str) -> None: ...
    def close(self) -> None: ...
    def execute(self, sql: str, params=()) -> list: ...

def run_query(conn: Connectable, sql: str) -> list:
    """Works with any object that has connect/close/execute  -  no inheritance needed."""
    return conn.execute(sql)

# Multiple inheritance + MRO (Method Resolution Order)
class Loggable:
    def log(self, msg: str): print(f"[{self.__class__.__name__}] {msg}")

class Retryable:
    def with_retry(self, fn, attempts=3):
        for i in range(attempts):
            try: return fn()
            except Exception as e:
                if i == attempts - 1: raise
                self.log(f"Retry {i+1}: {e}")  # type: ignore

class RobustSource(S3ParquetSource, Loggable, Retryable):
    def read(self, path: str):
        self.log(f"Reading {path}")
        return self.with_retry(lambda: super().read(path))

# MRO determines method lookup order (C3 linearisation)
print(RobustSource.__mro__)
# (RobustSource, S3ParquetSource, DataSource, Loggable, Retryable, ABC, object)`}</CodeBlock>

          <CodeBlock lang="python">{`from dataclasses import dataclass, field, KW_ONLY
from typing import ClassVar

# Dataclass - auto-generates __init__, __repr__, __eq__
@dataclass
class PipelineConfig:
    source_path: str
    target_path: str
    partition_cols: list[str] = field(default_factory=list)
    batch_size: int = 10_000
    max_retries: int = 3
    _: KW_ONLY           # all remaining fields must be keyword-only
    dry_run: bool = False

    # ClassVar is NOT included in __init__
    VERSION: ClassVar[str] = "1.0.0"

    def __post_init__(self):
        if not self.source_path.startswith(("s3://", "abfss://", "gs://")):
            raise ValueError(f"source_path must use a cloud URI: {self.source_path}")
        if self.batch_size <= 0:
            raise ValueError("batch_size must be positive")

# frozen=True → immutable, hashable (usable as dict keys, set members)
@dataclass(frozen=True)
class PartitionKey:
    year: int
    month: int
    region: str

# __slots__ - skip __dict__, reduces memory by ~40% for many instances
@dataclass
class EventRecord:
    __slots__ = ("user_id", "event_type", "ts", "amount")
    user_id: int
    event_type: str
    ts: float
    amount: float

# Custom __dunder__ methods
class DataPipeline:
    def __init__(self, name: str, stages: list):
        self.name = name
        self.stages = stages

    def __repr__(self) -> str:
        return f"DataPipeline(name={self.name!r}, stages={len(self.stages)})"

    def __len__(self) -> int:
        return len(self.stages)

    def __iter__(self):
        return iter(self.stages)

    def __or__(self, other: "DataPipeline") -> "DataPipeline":
        """Pipe operator: pipeline1 | pipeline2 → merged pipeline."""
        return DataPipeline(
            name=f"{self.name}|{other.name}",
            stages=self.stages + other.stages,
        )

ingest   = DataPipeline("ingest", [read_s3, validate, normalize])
enrich   = DataPipeline("enrich", [join_dims, add_metrics])
full_etl = ingest | enrich   # DataPipeline(name='ingest|enrich', stages=6)`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I use ABC and Protocol interchangeably"</td><td>"ABC for plugin frameworks where you want an immediate TypeError if a subclass forgets to implement a method. Protocol for dependency injection — the class doesn't even know the Protocol exists."</td></tr>
              <tr><td>"I use @dataclass for everything"</td><td>"frozen=True when the object is a key, set member, or passes across threads — immutability and hashability are free. Regular dataclass for mutable config objects."</td></tr>
              <tr><td>"__slots__ is a micro-optimization"</td><td>"At 10 million EventRecord objects it saves 400+ MB of RAM. The __dict__ per instance costs 200-300 bytes. __slots__ replaces it with direct attribute storage — also 10-20% faster attribute access."</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-oop" questions={[
            { question: "A DataWriter Protocol defines write() and flush() methods. A class DeltaWriter implements both but does NOT inherit from DataWriter. When passed to run_pipeline(writer: DataWriter), what happens?", options: ["TypeError at runtime — DeltaWriter doesn't inherit DataWriter", "mypy accepts DeltaWriter as a valid DataWriter because Protocol uses structural subtyping — matching methods are enough", "Protocol requires @runtime_checkable to work at all", "DeltaWriter must call DataWriter.__init__() to register itself"], correct: 1 },
            { question: "You have @dataclass class PartitionKey: year: int; month: int; region: str. You want to use PartitionKey instances as dictionary keys. What's required?", options: ["Nothing — all dataclasses are hashable by default", "Add frozen=True — regular dataclasses have __eq__ but not __hash__; frozen=True makes them immutable and hashable", "Manually implement __hash__ and __eq__ methods", "Use NamedTuple instead — dataclasses cannot be dict keys"], correct: 1 },
            { question: "A pipeline creates 50 million EventRecord objects per day. You add __slots__ = ('user_id', 'event_type', 'ts', 'amount') to the class. What is the primary benefit?", options: ["__slots__ enables multiprocessing serialization of the objects", "Each instance no longer has a __dict__ — memory per instance drops ~40% from ~240 bytes to ~144 bytes, saving ~5 GB RAM at 50M objects", "__slots__ makes the class thread-safe", "__slots__ enables faster isinstance() checks"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use Protocol for dependency injection — decouples classes from framework code</li>
                <li>Add <code>frozen=True</code> to dataclasses used as dict keys or set members</li>
                <li>Use <code>__slots__</code> when creating millions of instances in pipelines</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use deep inheritance hierarchies — Python MRO becomes hard to reason about beyond 2 levels</li>
                <li>Define ABC methods without <code>@abstractmethod</code> — subclasses won't be forced to implement them</li>
                <li>Add <code>__slots__</code> to classes that use <code>__dict__</code>-dependent features like pickle</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-oop')) { await unmarkTopicComplete('py-oop'); onUnmark('py-oop') } else { await markTopicComplete('py-oop'); onComplete('py-oop') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-oop') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-oop') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-context" ref={el => { if (el) sectionRefs.current['py-context'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Context Managers</h1><p className="topic-desc">Context managers guarantee resource cleanup even when exceptions occur. __enter__/__exit__, contextlib.contextmanager, suppress, and ExitStack are essential for robust database connections, file handles, and distributed locks.</p></div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "What does __exit__ returning True mean?"<br/>• "Implement a context manager for a database transaction"<br/>• "When would you use contextlib.ExitStack?"<br/>• "What's the difference between a class-based and @contextmanager-based context manager?"<br/>• "How do you handle cleanup when the number of resources is determined at runtime?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate understand that context managers are about guaranteed cleanup — not just syntax sugar for try/finally — and can they implement one correctly?</div>
          </div>

          <p>Context managers are Python's solution to the "cleanup on exit" problem. In production, this means DB connections always close (even on exceptions), temp tables always drop, and file handles never leak. The reason <code>__exit__</code> returning <code>False</code> matters: it tells Python to re-raise the exception. Returning <code>True</code> silently swallows it — almost never what you want. <code>contextlib.suppress</code> is the correct way to intentionally ignore specific exceptions. <code>ExitStack</code> handles the critical case where you don't know how many resources to open until runtime.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"__enter__ acquires the resource and returns it. __exit__ releases it — always, even on exception."</td></tr>
              <tr><td>2</td><td>"__exit__ returning False (or None) re-raises any exception. Returning True silently suppresses it."</td></tr>
              <tr><td>3</td><td>"@contextmanager turns a generator with one yield into a context manager — the yield is the body of the with block."</td></tr>
              <tr><td>4</td><td>"ExitStack when the number of context managers is determined at runtime — dynamically opening N files for N partitions."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Airbnb:</strong> Database transaction context managers wrap every multi-table write in their pricing pipeline — on any exception, the transaction rolls back automatically. Before adoption, 12% of partial-write bugs were caused by missing rollback calls.<br/><strong>Uber:</strong> Distributed lock context managers for idempotency — with DistributedLock(run_id) ensures exactly one worker processes each partition. ExitStack manages N locks across N partitions in their batch job scheduler.<br/><strong>Databricks:</strong> Temp staging table context manager in their MERGE pipelines — @contextmanager creates the temp table, yields it, and drops it in the finally block. The DROP always fires even when MERGE raises a schema mismatch exception.</div>
          </div>

          <ContextManagerDiagram />
          <ContextManagerAnimation />
          <CodeBlock lang="python">{`from contextlib import contextmanager, suppress, ExitStack
import time, logging

logger = logging.getLogger(__name__)

# Class-based context manager
class DatabaseTransaction:
    """Wraps a DB connection in a transaction  -  auto-rollback on error."""
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.conn = None

    def __enter__(self):
        import psycopg2
        self.conn = psycopg2.connect(self.dsn)
        self.conn.autocommit = False
        logger.debug("Transaction started")
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()
            logger.debug("Transaction committed")
        else:
            self.conn.rollback()
            logger.warning(f"Transaction rolled back due to {exc_type.__name__}: {exc_val}")
        self.conn.close()
        return False  # re-raise exception if one occurred

DSN = "postgresql://user:pass@localhost:5432/warehouse"
with DatabaseTransaction(DSN) as conn:
    cursor = conn.cursor()
    cursor.execute("INSERT INTO events SELECT * FROM staging_events")
    cursor.execute("UPDATE pipeline_runs SET status='done' WHERE id = %s", (run_id,))
# Commits here; on exception, auto-rollbacks and re-raises

# Timer context manager
class Timer:
    def __enter__(self):
        self._start = time.perf_counter()
        return self

    def __exit__(self, *args):
        self.elapsed = time.perf_counter() - self._start
        logger.info(f"Block took {self.elapsed:.3f}s")
        return False

    @property
    def ms(self) -> float:
        return self.elapsed * 1000

with Timer() as t:
    df = pd.read_parquet("s3://bucket/large_table.parquet")
print(f"Read took {t.ms:.0f}ms")`}</CodeBlock>

          <CodeBlock lang="python">{`from contextlib import contextmanager, suppress, ExitStack
import tempfile, os

# @contextmanager - generator-based (simpler than class)
@contextmanager
def temp_staging_table(conn, table_name: str):
    """Creates a temp table, yields it, always drops it on exit."""
    conn.execute(f"CREATE TEMP TABLE {table_name} (LIKE events INCLUDING ALL)")
    logger.info(f"Created temp table {table_name}")
    try:
        yield table_name
    finally:
        conn.execute(f"DROP TABLE IF EXISTS {table_name}")
        logger.info(f"Dropped temp table {table_name}")

with DatabaseTransaction(DSN) as conn:
    with temp_staging_table(conn, "stg_events_20240101") as stg:
        conn.execute(f"COPY {stg} FROM '/tmp/events.csv' CSV HEADER")
        conn.execute(f"INSERT INTO events SELECT * FROM {stg} ON CONFLICT DO NOTHING")

# suppress - silently ignore specific exceptions
with suppress(FileNotFoundError):
    os.remove("/tmp/stale_lock_file")  # OK if it doesn't exist

# ExitStack - manage a dynamic number of context managers
def process_partition_files(file_paths: list[str]) -> None:
    """Open all files, process them together, close all on exit."""
    with ExitStack() as stack:
        handles = [
            stack.enter_context(open(path, "rt", encoding="utf-8"))
            for path in file_paths
        ]
        # All files guaranteed to close even if an exception occurs mid-way
        for lines in zip(*handles):
            process_aligned_lines(lines)

# Combining context managers for robust pipeline stages
@contextmanager
def pipeline_stage(name: str, conn):
    logger.info(f"Starting stage: {name}")
    start = time.perf_counter()
    try:
        yield
        elapsed = time.perf_counter() - start
        conn.execute(
            "INSERT INTO pipeline_log (stage, status, duration_ms) VALUES (%s, %s, %s)",
            (name, "success", int(elapsed * 1000))
        )
    except Exception as e:
        conn.execute(
            "INSERT INTO pipeline_log (stage, status, error) VALUES (%s, %s, %s)",
            (name, "failed", str(e))
        )
        raise`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"with open() automatically closes the file"</td><td>"with open() calls __enter__ which opens and returns the file, then __exit__ which calls file.close() — even if an exception is raised inside the block. It's try/finally without the boilerplate."</td></tr>
              <tr><td>"I use try/finally for cleanup"</td><td>"Context managers are composable and reusable — I implement __enter__/__exit__ once, then use with everywhere. For one-offs, @contextmanager with try/finally is cleaner."</td></tr>
              <tr><td>"ExitStack is for advanced use cases only"</td><td>"ExitStack is the right tool whenever the number of resources is dynamic — opening files for N partitions, or combining 3 locks where N isn't known until runtime."</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-context" questions={[
            { question: "A context manager's __exit__ method is called with exc_type=ValueError, exc_val=..., exc_tb=.... It returns None. What happens next?", options: ["The ValueError is silently discarded — returning None is equivalent to suppress", "The ValueError is re-raised — __exit__ must return True to suppress an exception; None/False lets it propagate", "The context manager retries the with block", "Python calls __exit__ again with exc_type=None"], correct: 1 },
            { question: "You need to open a variable number of partition files (determined at runtime) and process them together, guaranteeing all handles close even on exception. What's the correct tool?", options: ["Nested with statements — one per file", "contextlib.ExitStack — dynamically manages any number of context managers, all cleaned up together", "A try/finally with a list of file handles", "contextlib.suppress(IOError) around each open() call"], correct: 1 },
            { question: "In a @contextmanager generator, where should cleanup code (like dropping a temp table) be placed to guarantee it runs even when an exception occurs in the with block?", options: ["Before the yield statement", "In the except clause after the yield", "In a finally block after the yield — this guarantees execution regardless of exceptions", "After the yield statement with no exception handling"], correct: 2 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use <code>@contextmanager</code> with <code>finally</code> for guaranteed temp resource cleanup</li>
                <li>Use <code>contextlib.suppress</code> to intentionally ignore specific exceptions</li>
                <li>Use <code>ExitStack</code> when opening a dynamic number of resources</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Return <code>True</code> from <code>__exit__</code> unless you intentionally want to suppress exceptions</li>
                <li>Use bare <code>except: pass</code> instead of <code>contextlib.suppress</code></li>
                <li>Put multiple <code>yield</code> statements in a <code>@contextmanager</code> — it raises <code>RuntimeError</code></li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-context')) { await unmarkTopicComplete('py-context'); onUnmark('py-context') } else { await markTopicComplete('py-context'); onComplete('py-context') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-context') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-context') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-errors" ref={el => { if (el) sectionRefs.current['py-errors'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Error Handling, Custom Exceptions &amp; Logging</h1><p className="topic-desc">Robust pipelines need structured error handling with custom exception hierarchies, exception chaining (raise X from Y), and structured logging. structlog and Python's logging module are the standard tools.</p></div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How would you design a custom exception hierarchy for a data pipeline?"<br/>• "What does 'raise NewError from original_error' do?"<br/>• "When does the finally block NOT execute?"<br/>• "How do you add context to exceptions without losing the original traceback?"<br/>• "Explain structured logging vs print statements"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate design exception hierarchies that let callers catch at the right granularity — or do they raise bare Exception everywhere and log strings?</div>
          </div>

          <p>In production, exception handling is an API design problem. The reason custom hierarchies matter is that callers need to catch at different granularities: a DQ monitoring service catches <code>DataQualityError</code> specifically to route alerts; an orchestrator catches <code>PipelineError</code> broadly to mark the run failed; an outer framework catches <code>Exception</code> as a last resort. <code>raise NewError from e</code> is non-negotiable — it chains the original exception as <code>__cause__</code>, preserving the full traceback while adding context. Structured logging (JSON output with key-value fields) is what makes logs searchable in Datadog, CloudWatch, and Splunk.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"I build a hierarchy: PipelineError → DataQualityError, SchemaEvolutionError, UpstreamAPIError."</td></tr>
              <tr><td>2</td><td>"raise DataQualityError(...) from original_exc — chains the original as __cause__, preserving full traceback."</td></tr>
              <tr><td>3</td><td>"finally always runs — on success, on exception, even on SystemExit. The only exception is os._exit()."</td></tr>
              <tr><td>4</td><td>"Structured JSON logging: logger.info('pipeline_complete', rows=84321, table='fact_sales') — searchable fields in Datadog."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Airbnb:</strong> Custom exception hierarchy with 15+ exception types lets their pipeline observability system route alerts by type — DataQualityErrors go to the DQ Slack channel, SchemaErrors go to the platform team, UpstreamAPIErrors auto-retry with backoff.<br/><strong>Uber:</strong> All pipeline exceptions include structured context fields (pipeline_id, run_id, stage, rows_processed) — Datadog can filter by any field without parsing log strings. Reduced mean-time-to-debug from 45 minutes to 8 minutes.<br/><strong>Netflix:</strong> Uses structlog with bound context — each pipeline worker binds pipeline_id + run_id at startup. Every log line auto-includes these fields, enabling correlation across 10,000 concurrent pipeline runs.</div>
          </div>

          <ErrorsDiagram />
          <ErrorHierarchyAnimation />
          <CodeBlock lang="python">{`import logging
import sys
from typing import Optional

# Custom exception hierarchy for a data pipeline
class PipelineError(Exception):
    """Base class for all pipeline errors."""
    def __init__(self, message: str, stage: Optional[str] = None, **context):
        super().__init__(message)
        self.stage = stage
        self.context = context

    def __str__(self) -> str:
        ctx = ", ".join(f"{k}={v!r}" for k, v in self.context.items())
        base = super().__str__()
        return f"[{self.stage}] {base} | {ctx}" if self.stage else f"{base} | {ctx}"

class DataQualityError(PipelineError):
    """Raised when data fails validation rules."""

class SchemaEvolutionError(PipelineError):
    """Raised when source schema doesn't match expected schema."""

class UpstreamAPIError(PipelineError):
    """Raised when an upstream API returns an unexpected response."""

class IdempotencyError(PipelineError):
    """Raised when a pipeline run would produce duplicate results."""

# Exception chaining  -  preserve original cause
def load_config(path: str) -> dict:
    import json
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError as e:
        raise PipelineError(
            f"Config file not found: {path}",
            stage="init",
            config_path=path,
        ) from e  # chains original FileNotFoundError as __cause__
    except json.JSONDecodeError as e:
        raise PipelineError(
            f"Invalid JSON in config: {e.msg} at line {e.lineno}",
            stage="init",
        ) from e

# Catching by hierarchy
def run_pipeline(config_path: str):
    try:
        config = load_config(config_path)
        df = extract(config)
        df = transform(df)
        load(df)
    except DataQualityError as e:
        logger.error(f"DQ failure: {e}", extra={"stage": e.stage, **e.context})
        send_alert("dq_failure", str(e))
        raise  # re-raise for orchestrator to handle
    except PipelineError as e:
        logger.critical(f"Pipeline failed: {e}", exc_info=True)
        mark_run_failed(e)
        sys.exit(1)
    except Exception as e:
        logger.critical(f"Unexpected error: {e}", exc_info=True)
        raise PipelineError("Unexpected pipeline failure") from e`}</CodeBlock>

          <CodeBlock lang="python">{`import logging
import logging.handlers
import sys

# Production logging setup
def configure_logging(level: str = "INFO", json_output: bool = False) -> None:
    handlers: list[logging.Handler] = [logging.StreamHandler(sys.stdout)]

    if json_output:
        # JSON logging for cloud environments (Datadog, CloudWatch)
        try:
            import structlog
            structlog.configure(
                processors=[
                    structlog.stdlib.add_log_level,
                    structlog.stdlib.add_logger_name,
                    structlog.processors.TimeStamper(fmt="iso"),
                    structlog.processors.StackInfoRenderer(),
                    structlog.processors.format_exc_info,
                    structlog.processors.JSONRenderer(),
                ],
                wrapper_class=structlog.BoundLogger,
                context_class=dict,
                logger_factory=structlog.PrintLoggerFactory(),
            )
        except ImportError:
            formatter = logging.Formatter(
                '{"ts":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}'
            )
            handlers[0].setFormatter(formatter)

    logging.basicConfig(
        level=getattr(logging, level.upper()),
        handlers=handlers,
        force=True,
    )

# Contextual logging  -  bind pipeline context once, use everywhere
logger = logging.getLogger(__name__)

class PipelineLogger:
    """Wraps standard logger with pipeline context."""
    def __init__(self, pipeline_id: str, run_id: str):
        self._logger = logging.getLogger(pipeline_id)
        self._extra = {"pipeline_id": pipeline_id, "run_id": run_id}

    def info(self, msg: str, **kwargs):
        self._logger.info(msg, extra={**self._extra, **kwargs})

    def warning(self, msg: str, **kwargs):
        self._logger.warning(msg, extra={**self._extra, **kwargs})

    def error(self, msg: str, exc_info=False, **kwargs):
        self._logger.error(msg, exc_info=exc_info, extra={**self._extra, **kwargs})

    def audit(self, action: str, rows_affected: int, **kwargs):
        self._logger.info(
            f"AUDIT: {action}",
            extra={**self._extra, "rows_affected": rows_affected, **kwargs},
        )

# Usage
log = PipelineLogger(pipeline_id="sales_daily", run_id="2024-01-15T02:00:00")
log.info("Pipeline started", source="s3://bucket/sales/")
log.audit("load_complete", rows_affected=84_321, target_table="fact_sales")`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I wrap everything in try/except Exception to be safe"</td><td>"I catch the most specific exception type possible — bare except hides bugs silently"</td></tr>
              <tr><td>"I use print() for debugging errors"</td><td>"I use structured JSON logging with bound context — pipeline_id, run_id on every line, searchable in Datadog"</td></tr>
              <tr><td>"raise CustomError(str(e)) passes the message along"</td><td>"raise CustomError(...) from e chains __cause__ — full original traceback is preserved and visible in Sentry/Datadog"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-errors" questions={[
            { question: "raise DataQualityError('nulls in key column') from original_exc — what does the 'from original_exc' clause do?", options: ["It suppresses original_exc and only raises DataQualityError", "It logs original_exc to the default logger before raising", "It sets DataQualityError.__cause__ = original_exc, preserving the full original traceback in Sentry/Datadog", "It retries the operation that raised original_exc"], correct: 2 },
            { question: "Your pipeline catches DataQualityError and routes it to a DQ Slack channel, but a schema mismatch (SchemaEvolutionError) goes to the platform team. What hierarchy design enables this?", options: ["Both errors should extend builtins.ValueError for simplicity", "SchemaEvolutionError and DataQualityError both inherit PipelineError — callers choose catch granularity per their concern", "Use a single PipelineError with an error_type string field instead of subclasses", "Catch all errors as Exception and inspect the message string to route alerts"], correct: 1 },
            { question: "A try block raises RuntimeError. The except block raises ValueError. The finally block calls cleanup(). Which statement is true?", options: ["finally runs only if the except block succeeds without raising", "cleanup() never runs because ValueError was raised inside except", "finally always runs — cleanup() executes, then ValueError propagates as the active exception", "The original RuntimeError is re-raised; ValueError is silently discarded"], correct: 2 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Build exception hierarchies — PipelineError → DataQualityError, SchemaEvolutionError</li>
                <li>Use raise NewError(...) from original_exc to chain context</li>
                <li>Structured JSON logging with bound fields (pipeline_id, run_id, stage)</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Catch bare except: or except Exception: without re-raising or logging specifically</li>
                <li>Lose the original traceback with raise CustomError(str(e)) instead of raise ... from e</li>
                <li>Use print() or unstructured log strings that aren't searchable in production observability tools</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-errors')) { await unmarkTopicComplete('py-errors'); onUnmark('py-errors') } else { await markTopicComplete('py-errors'); onComplete('py-errors') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-errors') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-errors') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-async" ref={el => { if (el) sectionRefs.current['py-async'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Async Programming & asyncio</h1>
            <p className="topic-desc">asyncio enables high-throughput I/O-bound pipelines  -  concurrent API calls, database queries, and file operations on a single thread. async/await, gather, aiohttp, and asyncpg are the core primitives.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "What's the difference between concurrency and parallelism in Python?"<br/>• "When would you use asyncio.gather vs asyncio.create_task?"<br/>• "Why can't you use requests inside an async function?"<br/>• "How do you handle backpressure in async pipelines?"<br/>• "What is the event loop and when does it block?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate understand that async is cooperative concurrency on one thread — ideal for I/O-bound work — or do they confuse it with multi-threading or assume it speeds up CPU-bound code?</div>
          </div>

          <p>In production, asyncio unlocks throughput for I/O-bound pipelines. The reason it matters is that network I/O (API calls, DB queries) spends 95% of its time waiting — synchronous code wastes that time doing nothing. With asyncio.gather, you fire 100 API requests concurrently; they all wait simultaneously on one thread. The event loop blocks the moment you call any sync-blocking code (requests.get, time.sleep) — use aiohttp and asyncpg instead. asyncio.Semaphore is the throttle valve — without it, 1000 concurrent requests will overwhelm an API or exhaust DB connection pools.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"asyncio is cooperative concurrency — one thread, tasks voluntarily yield at await points. It's not parallelism."</td></tr>
              <tr><td>2</td><td>"asyncio.gather fires all coroutines concurrently — they all wait simultaneously. Sequential awaits waste I/O time."</td></tr>
              <tr><td>3</td><td>"Semaphore limits concurrency — Semaphore(50) caps concurrent requests to 50, preventing API rate-limit or connection exhaustion."</td></tr>
              <tr><td>4</td><td>"CPU-bound work? Use ProcessPoolExecutor via run_in_executor — async can offload CPU tasks without blocking the event loop."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Stripe:</strong> Async ingestion pipeline fetches from 200+ payment processors concurrently. asyncio.gather with Semaphore(50) enforces rate limits per processor. Reduced hourly ETL runtime from 4.2 minutes (sequential) to 18 seconds (concurrent).<br/><strong>Robinhood:</strong> Market data ingestion uses asyncpg connection pools — 20 concurrent DB writes vs sequential reduces latency from 800ms to under 60ms for end-of-day reconciliation batches.<br/><strong>Coinbase:</strong> Async streaming pipeline uses async generators to process WebSocket price feeds — yields records as they arrive rather than buffering everything, keeping memory flat at high throughput.</div>
          </div>

          <AsyncDiagram />
          <AsyncAnimation />
          <CodeBlock lang="python">{`import asyncio
import aiohttp
import asyncpg
from typing import AsyncIterator

# Async function basics
async def fetch_json(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
        resp.raise_for_status()
        return await resp.json()

# asyncio.gather - run coroutines concurrently (not sequentially)
async def ingest_all_endpoints(endpoints: list[str]) -> list[dict]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_json(session, url) for url in endpoints]
        # All requests fire concurrently; gather waits for all
        results = await asyncio.gather(*tasks, return_exceptions=True)

    records = []
    for url, result in zip(endpoints, results):
        if isinstance(result, Exception):
            logging.error(f"Failed {url}: {result}")
        else:
            records.append(result)
    return records

# Run with: asyncio.run(ingest_all_endpoints(urls))

# Semaphore - limit concurrency (avoid overwhelming APIs)
async def fetch_with_semaphore(
    session: aiohttp.ClientSession,
    url: str,
    sem: asyncio.Semaphore,
) -> dict:
    async with sem:  # only N concurrent requests at a time
        return await fetch_json(session, url)

async def ingest_paginated_api(base_url: str, total_pages: int) -> list[dict]:
    sem = asyncio.Semaphore(20)  # max 20 concurrent requests
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_with_semaphore(session, f"{base_url}?page={p}", sem)
            for p in range(1, total_pages + 1)
        ]
        pages = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for page in pages if isinstance(page, list) for r in page]

# asyncio.Queue - producer/consumer pattern for streaming pipelines
async def producer(queue: asyncio.Queue, urls: list[str]):
    async with aiohttp.ClientSession() as session:
        for url in urls:
            record = await fetch_json(session, url)
            await queue.put(record)
    await queue.put(None)  # sentinel to signal completion

async def consumer(queue: asyncio.Queue, db_pool):
    batch = []
    while True:
        record = await queue.get()
        if record is None:
            break
        batch.append(record)
        if len(batch) >= 500:
            await db_pool.executemany("INSERT INTO events VALUES ($1,$2,$3)", batch)
            batch.clear()
        queue.task_done()
    if batch:
        await db_pool.executemany("INSERT INTO events VALUES ($1,$2,$3)", batch)

async def run_pipeline(urls: list[str]):
    queue: asyncio.Queue = asyncio.Queue(maxsize=1000)
    pool = await asyncpg.create_pool("postgresql://user:pass@localhost/db", min_size=5)
    await asyncio.gather(producer(queue, urls), consumer(queue, pool))
    await pool.close()`}</CodeBlock>
          <CodeBlock lang="python">{`import asyncpg
import asyncio

# asyncpg - async PostgreSQL driver (faster than psycopg2 for async workloads)
async def bulk_load_records(records: list[dict]) -> int:
    pool = await asyncpg.create_pool(
        "postgresql://user:pass@localhost:5432/warehouse",
        min_size=2,
        max_size=10,
    )
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.executemany(
                "INSERT INTO events(user_id, type, ts, amount) VALUES($1,$2,$3,$4)"
                " ON CONFLICT (user_id, ts) DO NOTHING",
                [(r["user_id"], r["type"], r["ts"], r["amount"]) for r in records],
            )
    await pool.close()
    return len(records)

# Async generator - stream from DB without loading all rows
async def stream_large_table(
    pool: asyncpg.Pool,
    table: str,
    batch_size: int = 5000,
) -> AsyncIterator[list[dict]]:
    async with pool.acquire() as conn:
        async with conn.transaction():
            cursor = await conn.cursor(f"SELECT * FROM {table} ORDER BY id")
            while True:
                rows = await cursor.fetch(batch_size)
                if not rows:
                    break
                yield [dict(row) for row in rows]

async def export_to_parquet(table: str, output_path: str):
    import pandas as pd
    pool = await asyncpg.create_pool("postgresql://...")
    frames = []
    async for batch in stream_large_table(pool, table):
        frames.append(pd.DataFrame(batch))
    pd.concat(frames).to_parquet(output_path, index=False)
    await pool.close()

# asyncio.timeout (Python 3.11+)  -  cancel slow operations
async def fetch_with_timeout(url: str) -> dict | None:
    try:
        async with asyncio.timeout(10.0):
            async with aiohttp.ClientSession() as s:
                return await fetch_json(s, url)
    except TimeoutError:
        logging.warning(f"Timed out fetching {url}")
        return None`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"async/await makes my code run in parallel across multiple CPUs"</td><td>"asyncio is single-threaded cooperative concurrency — tasks yield at await points. For parallelism I use multiprocessing or ProcessPoolExecutor"</td></tr>
              <tr><td>"I use requests.get inside async functions"</td><td>"requests blocks the event loop — I use aiohttp or httpx[async]. Blocking calls freeze all concurrent tasks"</td></tr>
              <tr><td>"asyncio.gather runs everything at once — no limits needed"</td><td>"Without Semaphore, 1000 concurrent requests overwhelm APIs and exhaust DB pools. I wrap gather with Semaphore(50) for throttling"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-async" questions={[
            { question: "You have 200 API endpoints to fetch. Which pattern gets all results fastest while respecting a rate limit of 50 concurrent requests?", options: ["for url in endpoints: result = await fetch(url)  # sequential", "asyncio.gather(*[fetch(url) for url in endpoints]) with no semaphore", "sem = asyncio.Semaphore(50); asyncio.gather(*[bounded_fetch(sem, url) for url in endpoints])", "threading.ThreadPoolExecutor(max_workers=200) with requests.get"], correct: 2 },
            { question: "You call requests.get() inside an async function. What happens to your other concurrent tasks?", options: ["They continue running normally on other threads", "They are cancelled immediately", "The event loop blocks — all other coroutines freeze until requests.get() returns", "Python raises a RuntimeError automatically"], correct: 2 },
            { question: "asyncio vs multiprocessing — which workload fits each correctly?", options: ["asyncio for CPU-bound (NumPy transforms); multiprocessing for network I/O", "Both work equally well for both CPU and I/O workloads", "asyncio for I/O-bound (API calls, DB queries); multiprocessing for CPU-bound (data transforms, ML inference)", "multiprocessing for I/O because it uses multiple threads"], correct: 2 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use asyncio.gather with Semaphore for bounded concurrent requests</li>
                <li>Use aiohttp, httpx[async], asyncpg for async-native I/O libraries</li>
                <li>Use run_in_executor to offload CPU-bound work without blocking the event loop</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Call blocking libraries (requests, time.sleep, open()) inside async functions</li>
                <li>Assume async speeds up CPU-bound work — it only helps I/O-bound tasks</li>
                <li>Use asyncio.gather without Semaphore on external APIs — you'll hit rate limits and connection limits</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-async')) { await unmarkTopicComplete('py-async'); onUnmark('py-async') } else { await markTopicComplete('py-async'); onComplete('py-async') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-async') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-async') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-io" ref={el => { if (el) sectionRefs.current['py-io'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">File I/O, pathlib, CSV, JSON, YAML, TOML & Config</h1>
            <p className="topic-desc">Data engineers read and write files constantly. pathlib provides modern OS-agnostic path handling. Parsing CSV, JSON, YAML, TOML, and .env files correctly is fundamental for building configurable, portable pipeline code.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you handle large files that don't fit in memory?"<br/>• "What's the difference between pathlib and os.path?"<br/>• "How would you read a gzipped JSONL file efficiently?"<br/>• "Where should pipeline configuration live — YAML, TOML, or env vars?"<br/>• "Why use Path('/data') / 'subdir' instead of string concatenation?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate use pathlib fluently and process large files as streams rather than loading everything into memory — or do they concatenate paths as strings and read entire multi-GB files with read()?</div>
          </div>

          <p>In production, file I/O is about two things: correct path handling and memory-safe processing. The reason pathlib matters is that Path('/data') / 'subdir' / filename.with_suffix('.parquet') is OS-agnostic, composable, and IDE-completable. String concatenation breaks on Windows, loses context, and is error-prone. For large files, streaming is non-negotiable — read line-by-line or in chunks. A 50GB JSONL log file read with f.read() crashes your pod; read with for line in f processes it in constant memory. YAML and TOML for config, dotenv for secrets — never hardcode either.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"I use pathlib.Path — composable, OS-agnostic, with .stem, .suffix, .parent, .glob() built-in."</td></tr>
              <tr><td>2</td><td>"For large files: stream line-by-line. for line in gzip.open(path): — constant memory regardless of file size."</td></tr>
              <tr><td>3</td><td>"Config hierarchy: YAML/TOML for pipeline config, .env/Vault for secrets, never hardcode either."</td></tr>
              <tr><td>4</td><td>"Atomic writes: write to temp file, then Path.replace(dest) — no partial writes visible to downstream readers."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Spotify:</strong> Event log pipelines process 50GB+ JSONL files streamed line-by-line with gzip.open. Memory footprint stays under 50MB regardless of file size — pod OOMKill incidents dropped 90% after migrating from json.load(f) to streaming.<br/><strong>LinkedIn:</strong> pathlib.Path.glob('**/*.parquet') discovers daily partition files across date-sharded S3 mounts. Path.stem / .suffix extraction replaces fragile regex-based filename parsing.<br/><strong>Databricks:</strong> Pipeline configs stored in TOML (pyproject-compatible); secrets injected via environment variables at runtime. Separate config from secrets — enables config in Git, secrets in Vault.</div>
          </div>

          <FileIODiagram />
          <FileIOAnimation />
          <CodeBlock lang="python">{`from pathlib import Path
import json, csv, gzip, io

# pathlib - modern, OS-agnostic path handling
data_dir = Path("/data/pipeline")
raw_dir = data_dir / "raw"
processed_dir = data_dir / "processed"

# Create directories (no error if they exist)
processed_dir.mkdir(parents=True, exist_ok=True)

# Glob for files
parquet_files = sorted(raw_dir.glob("**/*.parquet"))
todays_csvs = list(raw_dir.glob("events_2024-01-15*.csv.gz"))

# Path operations
for p in parquet_files:
    print(p.stem)           # "events_2024-01-15" (no extension)
    print(p.suffix)         # ".parquet"
    print(p.parent)         # /data/pipeline/raw
    print(p.stat().st_size) # file size in bytes

# Rename processed files
for src in todays_csvs:
    dest = processed_dir / src.name
    src.rename(dest)

# Read/write JSON (newline-delimited JSONL for large datasets)
def read_jsonl(path: Path) -> list[dict]:
    opener = gzip.open if path.suffix == ".gz" else open
    with opener(path, "rt", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]

def write_jsonl(records: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    opener = gzip.open if str(path).endswith(".gz") else open
    with opener(path, "wt", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, default=str) + "\\n")

# CSV with DictReader/DictWriter
def read_csv_typed(path: Path, int_cols: list[str], float_cols: list[str]) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        records = []
        for row in reader:
            for col in int_cols:
                row[col] = int(row[col]) if row[col] else None
            for col in float_cols:
                row[col] = float(row[col]) if row[col] else None
            records.append(row)
    return records

def write_csv(records: list[dict], path: Path) -> None:
    if not records:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)`}</CodeBlock>
          <CodeBlock lang="python">{`import os
from pathlib import Path

# YAML config (pip install pyyaml)
def load_yaml_config(path: str | Path) -> dict:
    import yaml
    with open(path) as f:
        return yaml.safe_load(f)  # safe_load prevents arbitrary code execution

# Example pipeline_config.yaml:
# pipeline:
#   source: s3://my-bucket/raw/
#   target: abfss://container@storage.dfs.core.windows.net/processed/
#   batch_size: 10000
#   tables:
#     - orders
#     - customers

config = load_yaml_config("config/pipeline_config.yaml")
batch_size = config["pipeline"]["batch_size"]

# TOML config (Python 3.11+ built-in, or pip install tomli for older)
def load_toml_config(path: str | Path) -> dict:
    import sys
    if sys.version_info >= (3, 11):
        import tomllib
        with open(path, "rb") as f:
            return tomllib.load(f)
    else:
        import tomli
        with open(path, "rb") as f:
            return tomli.load(f)

# Environment variables + .env files (python-dotenv)
from dotenv import load_dotenv

load_dotenv(".env")  # loads KEY=VALUE from .env file into os.environ

DB_HOST     = os.environ["DB_HOST"]          # raises if missing
DB_PASSWORD = os.environ.get("DB_PASSWORD")  # returns None if missing
MAX_WORKERS = int(os.environ.get("MAX_WORKERS", "4"))

# configparser for .ini-style configs (legacy systems)
import configparser

config = configparser.ConfigParser()
config.read("airflow.cfg")
sql_alchemy_conn = config["database"]["sql_alchemy_conn"]

# Atomic file writes  -  write to temp then rename to avoid partial reads
import tempfile

def atomic_write_json(data: dict, path: Path) -> None:
    """Write JSON atomically  -  readers never see a partially written file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(".tmp")
    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
        tmp_path.rename(path)  # atomic on POSIX systems
    except Exception:
        tmp_path.unlink(missing_ok=True)
        raise`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I use os.path.join() to build paths"</td><td>"I use pathlib.Path — the / operator composes paths, .glob() discovers files, .stem/.suffix parse names. OS-agnostic and no string bugs"</td></tr>
              <tr><td>"I open the file and call f.read() to load it"</td><td>"For files over 100MB I stream line-by-line — for line in gzip.open(path): — constant memory regardless of file size"</td></tr>
              <tr><td>"I put config values in environment variables directly in the script"</td><td>"Config in YAML/TOML (version-controlled), secrets in .env or Vault (gitignored). Never hardcode — separation enables environment-specific deployments"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-io" questions={[
            { question: "Your pipeline reads a 40GB gzipped JSONL file. Which approach is memory-safe?", options: ["with gzip.open(path) as f: data = json.load(f)  # load all at once", "data = Path(path).read_bytes()  # read raw bytes", "with gzip.open(path, 'rt') as f: for line in f: record = json.loads(line)  # stream line-by-line", "pd.read_json(path, compression='gzip')  # pandas handles it"], correct: 2 },
            { question: "Why does yaml.safe_load() exist as a separate function from yaml.load()?", options: ["safe_load is 3x faster due to a C parser", "yaml.load() can deserialize arbitrary Python objects from YAML — an attacker can embed os.system('rm -rf /') in a config file", "safe_load supports YAML 1.2 spec; yaml.load() only supports YAML 1.1", "yaml.load() is deprecated in PyYAML 6+"], correct: 1 },
            { question: "Path('/data/raw') / 'events' / f'{date}.csv.gz' — what does the / operator return?", options: ["A string '/data/raw/events/2024-01-15.csv.gz'", "A pathlib.Path object with OS-appropriate separators, composable further and usable directly in open()", "A URL-encoded path safe for HTTP requests", "It raises TypeError — Path objects don't support division"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use pathlib.Path for all file path operations — composable, OS-agnostic</li>
                <li>Stream large files line-by-line to keep memory footprint constant</li>
                <li>Atomic writes: write to temp, then Path.replace(dest) for safe handoff</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Load entire large files into memory with f.read() or json.load(f)</li>
                <li>Use yaml.load() without Loader= argument — arbitrary code execution risk</li>
                <li>Hardcode paths or secrets in source code — use config files and env vars</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-io')) { await unmarkTopicComplete('py-io'); onUnmark('py-io') } else { await markTopicComplete('py-io'); onComplete('py-io') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-io') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-io') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-regex" ref={el => { if (el) sectionRefs.current['py-regex'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Regular Expressions (re module)</h1>
            <p className="topic-desc">Regular expressions are essential for parsing log files, extracting data from unstructured text, validating formats, and transforming messy strings in ETL pipelines.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you extract structured data from unstructured log files?"<br/>• "What's the difference between re.match and re.search?"<br/>• "Explain greedy vs non-greedy matching with an example"<br/>• "How do named capture groups improve regex maintainability?"<br/>• "When would you compile a regex vs use re.findall directly?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate compile regexes outside loops, use named groups for readability, and understand greedy vs non-greedy — or do they write unmaintainable one-liners that break on edge cases?</div>
          </div>

          <p>In production, regex is a parsing tool — not a parsing strategy for everything. The reason re.compile matters is performance: compiling once and reusing in a loop saves re-parsing the pattern on every iteration. Named groups ((?P&lt;name&gt;...)) transform a match object into a readable dict — critical when you're parsing 15-field log lines. Greedy vs non-greedy is a common bug: r"&lt;.*&gt;" matches from the first &lt; to the last &gt; in a line; r"&lt;.*?&gt;" stops at the first &gt;. For complex parsing (nested structures, context-dependent rules), use a proper parser like pyparsing or lark.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"re.compile() outside the loop — compiles the pattern once, reuses the compiled object in every iteration."</td></tr>
              <tr><td>2</td><td>"Named groups: (?P&lt;bucket&gt;[^/]+) — m.groupdict() gives you a readable dict instead of m.group(2)."</td></tr>
              <tr><td>3</td><td>"Non-greedy .*? — stops at the first match. Greedy .* — consumes as much as possible, causes over-matching bugs."</td></tr>
              <tr><td>4</td><td>"re.search anywhere in string; re.match only at the start; re.fullmatch requires the entire string to match."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Cloudflare:</strong> Log parsing pipeline processes 50M+ log lines/hour with compiled regexes. Named groups parse 12 fields per line into structured records — pattern compiled once at module load, reused across all workers. Switching from re.findall(pattern_str, ...) to compiled.findall() reduced CPU by 18%.<br/><strong>Palantir:</strong> Data quality pipeline validates 40+ field formats (email, phone, tax ID, date) with compiled regex validators. Pattern objects are module-level constants — no recompilation in hot paths.<br/><strong>GitHub:</strong> Webhook log parser extracts repo, event type, and user from structured log lines using named capture groups. m.groupdict() feeds directly into Datadog metrics tags without positional index bugs.</div>
          </div>

          <RegexDiagram />
          <RegexAnimation />
          <CodeBlock lang="python">{`import re

# Basic patterns  -  compile for reuse in loops
EMAIL_RE    = re.compile(r"[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}")
PHONE_RE    = re.compile(r"\\+?1?\\s*\\(?(\\d{3})\\)?[\\s.\\-]?(\\d{3})[\\s.\\-]?(\\d{4})")
ISO_DATE_RE = re.compile(r"(\\d{4})-(\\d{2})-(\\d{2})")
S3_URI_RE   = re.compile(r"s3://(?P<bucket>[^/]+)/(?P<key>.+)")

# Groups  -  extract specific parts
def parse_s3_uri(uri: str) -> tuple[str, str]:
    m = S3_URI_RE.match(uri)
    if not m:
        raise ValueError(f"Invalid S3 URI: {uri}")
    return m.group("bucket"), m.group("key")  # named groups

bucket, key = parse_s3_uri("s3://my-data-lake/events/2024/01/data.parquet")

# Extract all emails from a log dump
def extract_emails(text: str) -> list[str]:
    return EMAIL_RE.findall(text)

# Non-greedy matching  -  important for nested structures
# Greedy:     r"<.*>"   matches entire "<a>text</a>" as one match
# Non-greedy: r"<.*?>"  matches "<a>" then "</a>" separately
log_line = "2024-01-15T10:32:01Z [ERROR] user_id=42 msg='Invalid token for user@example.com'"
STRUCTURED_LOG_RE = re.compile(
    r"(?P<ts>\\d{4}-\\d{2}-\\d{2}T[\\d:]+Z)\\s+"
    r"\\[(?P<level>\\w+)\\]\\s+"
    r"user_id=(?P<user_id>\\d+)\\s+"
    r"msg='(?P<msg>.*?)'"  # non-greedy for msg
)

def parse_log_line(line: str) -> dict | None:
    m = STRUCTURED_LOG_RE.match(line)
    return m.groupdict() if m else None

parsed = parse_log_line(log_line)
# {'ts': '2024-01-15T10:32:01Z', 'level': 'ERROR', 'user_id': '42', 'msg': 'Invalid token for user@example.com'}`}</CodeBlock>
          <CodeBlock lang="python">{`import re

# Lookahead and lookbehind  -  assert context without consuming characters
PRICE_RE = re.compile(r"(?<=\\$)[\\d,]+\\.?\\d*")  # lookbehind: find number after $
prices = PRICE_RE.findall("Total: $1,234.56 and $89.00")
# ['1,234.56', '89.00']

WORD_BEFORE_ERROR = re.compile(r"\\w+(?=\\s+error)", re.IGNORECASE)  # lookahead

# Substitution  -  clean messy pipeline data
def normalize_phone(phone: str) -> str | None:
    """Normalize any phone format to +1XXXXXXXXXX."""
    digits = re.sub(r"\\D", "", phone)  # remove all non-digits
    if len(digits) == 10:
        return f"+1{digits}"
    elif len(digits) == 11 and digits[0] == "1":
        return f"+{digits}"
    return None

# re.sub with a function  -  complex replacements
TEMPLATE_VAR_RE = re.compile(r"\\{\\{(\\w+)\\}\\}")

def render_template(template: str, context: dict) -> str:
    def replacer(match: re.Match) -> str:
        key = match.group(1)
        return str(context.get(key, f"{{{{MISSING:{key}}}}}"))
    return TEMPLATE_VAR_RE.sub(replacer, template)

sql_template = "SELECT * FROM {{table}} WHERE date = '{{run_date}}' AND region = '{{region}}'"
sql = render_template(sql_template, {"table": "orders", "run_date": "2024-01-15", "region": "us-east"})

# Split with groups  -  keep delimiters
parts = re.split(r"(\\s*,\\s*)", "a, b,c ,  d")
# ['a', ', ', 'b', ',', 'c', ' ,', '  d']

# Multiline flag  -  ^ and $ match start/end of each line
LOG_BLOCK_RE = re.compile(r"^ERROR.*$", re.MULTILINE)
errors = LOG_BLOCK_RE.findall(multiline_log_text)

# Validate pipeline table names (prevent SQL injection)
TABLE_NAME_RE = re.compile(r"^[a-z][a-z0-9_]{0,62}$")
def validate_table_name(name: str) -> str:
    if not TABLE_NAME_RE.match(name):
        raise ValueError(f"Invalid table name: {name!r}")
    return name`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I write re.findall(r'pattern', text) inline each time"</td><td>"I compile module-level constants: EMAIL_RE = re.compile(r'...'). No re-parsing in hot paths, and the constant name documents intent"</td></tr>
              <tr><td>"I use .* to match anything between two delimiters"</td><td>"Greedy .* over-matches — it extends to the last delimiter. I use .*? (non-greedy) to stop at the first match"</td></tr>
              <tr><td>"m.group(1), m.group(2) extracts the fields"</td><td>"Named groups (?P&lt;name&gt;...) — m.groupdict() returns a readable dict. No off-by-one index bugs when fields reorder"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-regex" questions={[
            { question: "Pattern: r'&lt;.*&gt;' applied to '&lt;a href=\"x\"&gt;click&lt;/a&gt;'. What does it match?", options: ["'&lt;a href=\"x\"&gt;' only — stops at first closing &gt;", "'&lt;a href=\"x\"&gt;click&lt;/a&gt;' — greedy .* consumes everything up to the last &gt;", "Nothing — the pattern is invalid", "'click' — the content between tags"], correct: 1 },
            { question: "You parse 10M log lines in a loop. Which regex approach has lowest CPU overhead?", options: ["re.findall(r'pattern', line) — Python caches the last 512 compiled patterns automatically", "pattern = re.compile(r'pattern') at module level; pattern.findall(line) in the loop — compiled once, reused 10M times", "re.fullmatch(r'pattern', line) — fullmatch is faster than findall", "Compile inside the loop: re.compile(r'pattern').findall(line) — fresh compile is cleaner"], correct: 1 },
            { question: "re.match(r'\\d+', 'abc123') vs re.search(r'\\d+', 'abc123') — what does each return?", options: ["Both return a match object for '123'", "re.match returns None (digits not at start); re.search returns a match for '123' (found anywhere in string)", "re.match returns '123'; re.search returns None", "Both return None — digits appear after letters"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Compile regexes at module level as constants — reused across all calls</li>
                <li>Use named groups (?P&lt;field&gt;...) for readable, maintainable extraction</li>
                <li>Use non-greedy .*? for matching between delimiters</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Compile regexes inside loops — wasteful recompilation on every iteration</li>
                <li>Use .* (greedy) when you mean .*? (non-greedy) — causes over-matching bugs</li>
                <li>Use regex for HTML/XML parsing — use BeautifulSoup or lxml instead</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-regex')) { await unmarkTopicComplete('py-regex'); onUnmark('py-regex') } else { await markTopicComplete('py-regex'); onComplete('py-regex') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-regex') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-regex') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-testing" ref={el => { if (el) sectionRefs.current['py-testing'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Testing with pytest  -  fixtures, parametrize, mocking</h1>
            <p className="topic-desc">Quality data pipelines need automated tests. pytest fixtures provide reusable test setup, parametrize covers edge cases efficiently, and unittest.mock patches external dependencies so tests run without real DBs or APIs.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you test a pipeline that writes to a production database?"<br/>• "What's the difference between a fixture and a helper function in pytest?"<br/>• "How would you test 20 edge cases without writing 20 test functions?"<br/>• "What does @patch do and where should the patch target point?"<br/>• "When would you use a session-scoped fixture vs function-scoped?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate isolate external dependencies with mocks, use parametrize for comprehensive coverage, and structure fixtures to minimize test coupling — or do they write integration tests that require a live database to run?</div>
          </div>

          <p>In production, pipeline tests must run in CI without real databases, APIs, or cloud storage. The reason mocking matters is that @patch replaces the real dependency at call time — your pipeline function calls s3_client.put_object, the test intercepts that call and verifies it was called with the right arguments. Fixtures are dependency injection for tests: session-scoped fixtures (real DB connections, expensive setups) are created once per test session; function-scoped fixtures reset for each test, preventing state leakage. @pytest.mark.parametrize is how you test 20 edge cases (empty, null, duplicate, wrong type) with one test function.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"Fixtures inject reusable setup — @pytest.fixture(scope='session') for expensive setup (DB conn); default function scope resets per test."</td></tr>
              <tr><td>2</td><td>"@pytest.mark.parametrize — one test function, 20 input/expected pairs. Tests all edge cases without 20 duplicated functions."</td></tr>
              <tr><td>3</td><td>"@patch('pipeline.load.boto3.client') patches the boto3 import in the module under test. Patch where it's used, not where it's defined."</td></tr>
              <tr><td>4</td><td>"mock.assert_called_once_with(Bucket='data-lake', Key=expected_key) — verifies the function was called with correct arguments, not just called."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Airbnb:</strong> Data pipeline test suite runs 2,400 tests in 90 seconds using session-scoped test DB containers (pytest-docker). Zero real AWS calls — all S3/Glue interactions mocked. CI passes without cloud credentials.<br/><strong>DoorDash:</strong> @pytest.mark.parametrize tests order validation logic across 35 edge cases (null address, past timestamp, zero amount, duplicate order_id). Single parametrized test replaced 35 separate test functions.<br/><strong>Stripe:</strong> Payment pipeline mocks are strict — MagicMock(spec=boto3.client('s3')) ensures any unexpected method call raises AttributeError. Prevents tests from accidentally passing when code calls wrong methods.</div>
          </div>

          <TestingDiagram />
          <TestingAnimation />
          <CodeBlock lang="python">{`# tests/test_pipeline.py
import pytest
import pandas as pd
from unittest.mock import patch, MagicMock, call
from pathlib import Path

# The functions under test (from our pipeline module)
from pipeline.transform import normalize_events, validate_schema, deduplicate
from pipeline.load import write_to_postgres

# Fixtures - reusable test setup/teardown
@pytest.fixture
def sample_events_df() -> pd.DataFrame:
    """Create a minimal events DataFrame for testing."""
    return pd.DataFrame({
        "user_id": [1, 2, 2, 3],
        "event_type": ["click", "purchase", "purchase", "view"],
        "amount": [0.0, 99.99, 99.99, 0.0],
        "ts": ["2024-01-15T10:00:00", "2024-01-15T10:01:00",
               "2024-01-15T10:01:00", "2024-01-15T10:02:00"],
    })

@pytest.fixture
def expected_schema() -> dict[str, str]:
    return {"user_id": "int64", "event_type": "object", "amount": "float64"}

@pytest.fixture(scope="session")
def db_connection():
    """Session-scoped: one real DB connection for the entire test session."""
    import psycopg2
    conn = psycopg2.connect("postgresql://test:test@localhost:5432/test_db")
    yield conn
    conn.close()  # cleanup after all tests in session

# Basic tests
def test_normalize_events_adds_columns(sample_events_df):
    result = normalize_events(sample_events_df)
    assert "processed_at" in result.columns
    assert "amount_usd" in result.columns

def test_validate_schema_passes(sample_events_df, expected_schema):
    assert validate_schema(sample_events_df, expected_schema) is True

def test_validate_schema_fails_missing_column():
    df = pd.DataFrame({"user_id": [1]})  # missing event_type and amount
    with pytest.raises(ValueError, match="Missing columns"):
        validate_schema(df, {"user_id": "int64", "event_type": "object"})

def test_deduplicate_removes_duplicates(sample_events_df):
    result = deduplicate(sample_events_df, keys=["user_id", "ts"])
    assert len(result) == 3  # row 2 and 3 are duplicates on user_id+ts`}</CodeBlock>
          <CodeBlock lang="python">{`import pytest
from unittest.mock import patch, MagicMock, AsyncMock

# Parametrize - test multiple inputs with one test function
@pytest.mark.parametrize("amount,currency,expected_usd", [
    (100.0, "USD", 100.0),
    (100.0, "EUR", 110.0),   # assume 1.10 exchange rate
    (100.0, "GBP", 127.0),   # assume 1.27 exchange rate
    (0.0,   "USD", 0.0),
    (-50.0, "USD", -50.0),   # negative amounts (refunds)
])
def test_convert_to_usd(amount, currency, expected_usd):
    from pipeline.transform import convert_to_usd
    result = convert_to_usd(amount, currency, exchange_rates={"EUR": 1.10, "GBP": 1.27})
    assert abs(result - expected_usd) < 0.01

# Mocking - replace external dependencies with controlled fakes
@patch("pipeline.load.psycopg2.connect")
def test_write_to_postgres_executes_correct_sql(mock_connect):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_connect.return_value.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

    import pandas as pd
    df = pd.DataFrame({"id": [1, 2], "value": ["a", "b"]})
    write_to_postgres(df, table="events", dsn="postgresql://...")

    mock_cursor.executemany.assert_called_once()
    call_args = mock_cursor.executemany.call_args
    assert "INSERT INTO events" in call_args[0][0]

# Mocking HTTP calls
@patch("pipeline.http.httpx.get")
def test_fetch_api_handles_rate_limit(mock_get):
    mock_get.side_effect = [
        MagicMock(status_code=429, headers={"Retry-After": "1"}),
        MagicMock(status_code=200, json=lambda: {"data": [{"id": 1}]}),
    ]
    from pipeline.http import fetch_page
    result = fetch_page("https://api.example.com/events", page=1)
    assert result == [{"id": 1}]
    assert mock_get.call_count == 2  # retried after 429

# Async test with pytest-asyncio
@pytest.mark.asyncio
async def test_async_pipeline():
    with patch("pipeline.async_load.asyncpg.create_pool") as mock_pool_factory:
        mock_pool = AsyncMock()
        mock_pool_factory.return_value = mock_pool
        mock_conn = AsyncMock()
        mock_pool.acquire.return_value.__aenter__.return_value = mock_conn

        from pipeline.async_load import bulk_load_async
        await bulk_load_async([{"id": 1, "val": "x"}])
        mock_conn.executemany.assert_awaited_once()

# conftest.py - shared fixtures across test files
# (place in tests/ directory)`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I test by running the pipeline and checking the output manually"</td><td>"Each transform function has a parametrized test covering happy path, empty input, nulls, duplicates, and type errors — runs in CI with no external dependencies"</td></tr>
              <tr><td>"I patch the function where it's defined: @patch('boto3.client')"</td><td>"Patch where it's imported and used: @patch('pipeline.load.boto3.client') — patches the name in the module under test, not the source"</td></tr>
              <tr><td>"I create a new DB with test data before each test"</td><td>"Session-scoped fixture creates the test DB once per test run; function-scoped fixtures insert/rollback per test. Expensive setup amortized across the suite"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-testing" questions={[
            { question: "@patch('pipeline.loader.boto3.client') vs @patch('boto3.client') — which is correct and why?", options: ["@patch('boto3.client') — always patch at the source module where boto3 lives", "@patch('pipeline.loader.boto3.client') — patch where the name is used (imported into pipeline.loader), not where it's defined", "Both are equivalent — Python resolves them to the same object", "@patch is unnecessary — MagicMock() directly replaces boto3 in the test"], correct: 1 },
            { question: "You need to test validate_price() with inputs: -1, 0, 0.01, 999.99, 1000, None, 'abc'. What's the most maintainable approach?", options: ["Write 7 separate test functions, one per input", "@pytest.mark.parametrize('price,expected', [(-1, False), (0, False), ...]) — one test function, 7 parameterized cases", "Use a for loop inside the test function calling validate_price()", "Write one test with assert all([validate_price(x) == expected for x, expected in cases])"], correct: 1 },
            { question: "A session-scoped fixture vs a function-scoped fixture — which creates its resource once per test session vs once per test function?", options: ["function-scoped creates once per session; session-scoped resets per function", "Both create resources once and never clean up", "session-scoped creates the resource once for the entire test run; function-scoped creates/tears down for each individual test", "scope has no effect — pytest always creates a new fixture instance per test"], correct: 2 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Patch at the import site in the module under test, not at the definition site</li>
                <li>Use @pytest.mark.parametrize for edge cases — one function, many inputs</li>
                <li>Use session-scoped fixtures for expensive setup (DB containers, S3 mocks)</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Write tests that require real database connections or live API calls to pass</li>
                <li>Use MagicMock without spec= — spec ensures only real methods/attributes are called</li>
                <li>Skip testing edge cases (null, empty, wrong type) — pipelines break on real-world messy data</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-testing')) { await unmarkTopicComplete('py-testing'); onUnmark('py-testing') } else { await markTopicComplete('py-testing'); onComplete('py-testing') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-testing') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-testing') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-packages" ref={el => { if (el) sectionRefs.current['py-packages'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Package Management  -  pip, venv, poetry, pyproject.toml</h1>
            <p className="topic-desc">Reproducible Python environments are critical for data pipelines. Understanding virtual environments, pyproject.toml, poetry, and conda prevents the "works on my machine" problem and enables reliable CI/CD deployments.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you ensure reproducible builds across dev, staging, and production?"<br/>• "What's the difference between poetry.lock and requirements.txt?"<br/>• "Why pin exact package versions in production pipelines?"<br/>• "What problem does pyproject.toml solve over setup.py?"<br/>• "How would you manage Python version differences across team members?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate use lockfiles for reproducibility and separate dev from prod dependencies — or do they pip install randomly with no version pinning and wonder why prod breaks when a package releases a minor update?</div>
          </div>

          <p>In production, package management is a reliability problem. The reason exact version pinning matters is that pandas==2.1.4 installs the same bytes everywhere; pandas&gt;=2.0 installs 2.2.0 in March and breaks your pipeline when 2.2 changes a default. poetry.lock captures the full dependency graph (transitive dependencies included) — poetry install reproduces the exact environment byte-for-byte. pyproject.toml replaces setup.py, setup.cfg, and requirements.txt with one standard file (PEP 518/621). For Docker deployments: copy pyproject.toml + poetry.lock first, run poetry install --only=main, then copy source — this layer caches the install step unless dependencies change.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"Virtual environment per project — python -m venv .venv isolates dependencies. Never install into the system Python."</td></tr>
              <tr><td>2</td><td>"Pin exact versions in production: pandas==2.1.4 not pandas&gt;=2.0. Minor releases break pipelines on silent behavior changes."</td></tr>
              <tr><td>3</td><td>"poetry.lock — full transitive dependency graph pinned. poetry install --only=main for production; --with=dev for development."</td></tr>
              <tr><td>4</td><td>"pyproject.toml is the single config file: project metadata, dependencies, tool config (mypy, ruff, pytest) all in one place."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Netflix:</strong> All Python pipeline Docker images built from poetry.lock — same transitive dependency graph in every environment. Eliminated "works on my machine" incidents — 34 production breakages in 2022 from unpinned deps, 2 in 2023 after enforcing lockfiles.<br/><strong>Lyft:</strong> pyproject.toml with poetry groups: [tool.poetry.group.dev.dependencies] includes pytest, mypy, ruff. Production Docker images install --only=main — dev tools never ship to prod.<br/><strong>Snowflake:</strong> pip-compile generates a pinned requirements.txt from abstract requirements.in. requirements.in specifies ranges (pandas&gt;=2.0); pip-compile resolves and pins exact versions. Both files are committed to Git.</div>
          </div>

          <PackagesDiagram />
          <PackagesAnimation />
          <CodeBlock lang="bash">{`# Virtual environments  -  isolate project dependencies
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
.venv\\Scripts\\activate           # Windows

# pip basics
pip install pandas==2.1.4 pyarrow>=14.0
pip install -r requirements.txt
pip freeze > requirements.txt    # pin exact versions
pip list --outdated              # check for updates

# requirements.txt best practices for pipelines
# requirements.txt (production - pinned)
# pandas==2.1.4
# pyarrow==14.0.0
# psycopg2-binary==2.9.9
# python-dotenv==1.0.0

# requirements-dev.txt (dev only)
# -r requirements.txt
# pytest==7.4.4
# pytest-asyncio==0.23.2
# mypy==1.8.0
# ruff==0.1.9

# pip-tools for dependency management
pip install pip-tools
pip-compile requirements.in      # generates pinned requirements.txt from abstract deps
pip-sync requirements.txt        # install exactly what's in requirements.txt`}</CodeBlock>
          <CodeBlock lang="toml">{`# pyproject.toml  -  modern Python project config (PEP 518/621)
[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"

[tool.poetry]
name = "de-pipeline"
version = "1.0.0"
description = "Data Engineering Pipeline"
authors = ["Team <team@company.com>"]
python = "^3.11"

[tool.poetry.dependencies]
python = "^3.11"
pandas = "^2.1.4"
pyarrow = "^14.0"
psycopg2-binary = "^2.9.9"
aiohttp = "^3.9.1"
asyncpg = "^0.29.0"
python-dotenv = "^1.0.0"
pyyaml = "^6.0.1"
structlog = "^24.1.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.4"
pytest-asyncio = "^0.23.2"
mypy = "^1.8.0"
ruff = "^0.1.9"

[tool.ruff]
line-length = 100
select = ["E", "F", "I", "N", "UP"]

[tool.mypy]
python_version = "3.11"
strict = true
ignore_missing_imports = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]`}</CodeBlock>
          <CodeBlock lang="bash">{`# Poetry workflow
poetry new de-pipeline          # create project
poetry init                     # add pyproject.toml to existing project
poetry add pandas pyarrow       # add dependencies
poetry add --group dev pytest   # add dev dependency
poetry install                  # install all deps
poetry run python pipeline.py   # run in venv

# Poetry lock file  -  deterministic installs
poetry lock          # update poetry.lock from pyproject.toml
poetry install --no-root  # CI: install deps only (skip the package itself)

# conda  -  better for scientific libraries with C extensions
conda create -n pipeline python=3.11
conda activate pipeline
conda install -c conda-forge pandas pyarrow psycopg2
conda env export > environment.yml

# Docker for fully reproducible builds (eliminates env differences entirely)
# Dockerfile:
# FROM python:3.11-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# CMD ["python", "pipeline.py"]`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I install packages globally and use pip install in my Dockerfile"</td><td>"Virtual environment per project, lockfile committed to Git. Docker: COPY pyproject.toml poetry.lock → poetry install --only=main → COPY src/ — caches the install layer"</td></tr>
              <tr><td>"I add pandas to requirements.txt as pandas&gt;=1.0"</td><td>"Exact pin in production: pandas==2.1.4. Range specs mean different versions install on different machines — silent behavior changes break pipelines"</td></tr>
              <tr><td>"requirements.txt captures everything I pip installed"</td><td>"poetry.lock captures the full transitive graph — every dependency of every dependency, pinned. requirements.txt only captures what you explicitly installed"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-packages" questions={[
            { question: "Your pipeline works locally with pandas 2.1.4 but breaks in production. The Dockerfile has 'RUN pip install pandas>=2.0'. What happened?", options: ["Docker installs a different Python version by default", "pandas>=2.0 installed pandas 2.2.0 in production when it released — a minor version with a behavior change that broke your code", "pip install in Docker always fails without --no-cache-dir", "The pandas version isn't the issue — it must be a Python path problem"], correct: 1 },
            { question: "What does poetry.lock contain that requirements.txt from 'pip freeze' doesn't?", options: ["poetry.lock is faster to parse than requirements.txt", "poetry.lock pins the full transitive dependency graph with hashes for verification; pip freeze only captures directly installed packages, missing indirect dependencies", "poetry.lock includes development dependencies; pip freeze does not", "They contain identical information — poetry just formats it differently"], correct: 1 },
            { question: "pyproject.toml replaces which files from the old Python packaging ecosystem?", options: ["Only setup.py", "setup.py, setup.cfg, MANIFEST.in, and requirements.txt — one standard file for project metadata, dependencies, and tool config (PEP 518/621)", "Only requirements.txt and setup.cfg", "Only Makefile and tox.ini"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Pin exact versions in production — pandas==2.1.4 not pandas&gt;=2.0</li>
                <li>Commit poetry.lock or requirements.txt to Git for reproducible builds</li>
                <li>Separate dev deps from prod deps — don't ship pytest and mypy to production</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Install packages globally — always use a virtual environment per project</li>
                <li>Use range specifiers (&gt;=, ~=) for production dependencies without testing the range</li>
                <li>Ignore transitive dependencies — a minor update to a subdependency can break your pipeline</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-packages')) { await unmarkTopicComplete('py-packages'); onUnmark('py-packages') } else { await markTopicComplete('py-packages'); onComplete('py-packages') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-packages') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-packages') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-pandas" ref={el => { if (el) sectionRefs.current['py-pandas'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">pandas Deep Dive for Data Engineering</h1>
            <p className="topic-desc">pandas is the workhorse of Python-based data pipelines. Mastering dtype optimization, vectorized operations, groupby, merge, pivot_table, memory management, and chunked reading is essential for handling real-world datasets efficiently.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "A pandas operation on a 5GB CSV is running out of memory. How do you fix it?"<br/>• "Why is .apply() with a lambda slow compared to vectorized operations?"<br/>• "What's the difference between merge and join in pandas?"<br/>• "How do you reduce a DataFrame's memory footprint without changing data?"<br/>• "When would you use category dtype?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate reach for vectorized operations and dtype optimization by default — or do they write Python for-loops over DataFrame rows and wonder why their pipeline takes 2 hours on a 1M-row dataset?</div>
          </div>

          <p>In production, pandas performance is determined by three decisions made before you write a single transform: dtype selection, operation choice, and whether you read the full file or chunk it. The reason category dtype matters is that a column with 5 unique values stored as object uses the full string for every row — as category it's a 4-byte integer with a 5-entry lookup table. .apply() is a Python for-loop in disguise — it's 10-100x slower than vectorized column operations that run in C. For files larger than available RAM: pd.read_csv(chunksize=100_000) processes 100K rows at a time.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"Specify dtypes explicitly on read: event_type as category saves 90% memory vs object. Never let pandas infer dtypes on large files."</td></tr>
              <tr><td>2</td><td>"Vectorized arithmetic: df['rev'] = df['price'] * df['qty'] runs in C. .apply(lambda r: r.price*r.qty) is a Python loop — 100x slower."</td></tr>
              <tr><td>3</td><td>"Files larger than RAM: pd.read_csv(chunksize=100_000) — process, aggregate each chunk, concat results."</td></tr>
              <tr><td>4</td><td>"merge() is SQL JOIN — specify how='left'/'inner'/'right', validate='one_to_many' to catch unexpected duplicates."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Shopify:</strong> Order analytics pipeline reduced memory from 18GB to 4GB by switching 3 string columns to category dtype and 4 int64 columns to int32. Same data, 78% less memory, fits in a standard 8GB pod.<br/><strong>Instacart:</strong> Replaced .apply(lambda) in 12 pipeline transforms with vectorized operations. Daily pipeline runtime dropped from 3.2 hours to 11 minutes — vectorized pandas uses NumPy's SIMD instructions, .apply() uses a Python interpreter loop.<br/><strong>Wayfair:</strong> 50GB daily events file processed with chunksize=500_000 — each chunk filtered and aggregated, results concatenated. Eliminated OOMKill pod restarts that plagued the previous approach.</div>
          </div>

          <PandasDiagram />
          <PandasAnimation />
          <PythonMemoryAnimation />
          <CodeBlock lang="python">{`import pandas as pd
import numpy as np
from pathlib import Path

# Read with explicit dtypes  -  avoid pandas' expensive type inference
df = pd.read_csv("events.csv", dtype={
    "user_id":    "int32",      # int64 by default  -  int32 saves 50% memory
    "session_id": "string",     # nullable string (better than object for NA)
    "event_type": "category",   # 4-byte int per row vs full string  -  huge saving
    "amount":     "float32",    # 8 bytes → 4 bytes for financial data
}, parse_dates=["ts"], date_format="%Y-%m-%d %H:%M:%S")

# Check memory usage
print(df.memory_usage(deep=True).sum() / 1024**2, "MB")

# Chunked reading  -  process files that don't fit in RAM
def process_large_file(path: str, chunksize: int = 100_000) -> pd.DataFrame:
    results = []
    for chunk in pd.read_csv(path, chunksize=chunksize, dtype={"user_id": "int32"}):
        # Filter and aggregate each chunk
        filtered = chunk[chunk["event_type"] == "purchase"]
        aggregated = filtered.groupby("user_id")["amount"].sum()
        results.append(aggregated)
    return pd.concat(results).groupby(level=0).sum()

# Vectorized operations  -  NEVER use .apply() for arithmetic
# BAD:  df["revenue"] = df.apply(lambda r: r["price"] * r["quantity"], axis=1)
# GOOD: vectorized, runs in C
df["revenue"]      = df["price"] * df["quantity"]
df["discount_pct"] = (df["original_price"] - df["price"]) / df["original_price"] * 100
df["is_high_value"]= df["amount"] > df["amount"].quantile(0.95)

# String vectorization  -  .str accessor (runs in C, not Python loop)
df["email_domain"] = df["email"].str.split("@").str[1].str.lower()
df["clean_name"]   = df["name"].str.strip().str.title()
df["has_promo"]    = df["description"].str.contains(r"promo|discount", case=False, regex=True)

# Datetime vectorization
df["ts"] = pd.to_datetime(df["ts_str"])
df["date"]          = df["ts"].dt.date
df["hour"]          = df["ts"].dt.hour
df["day_of_week"]   = df["ts"].dt.day_name()
df["week"]          = df["ts"].dt.to_period("W")
df["days_since_reg"]= (df["ts"] - df["registration_date"]).dt.days`}</CodeBlock>
          <CodeBlock lang="python">{`import pandas as pd

# GroupBy  -  aggregation with named outputs
daily_summary = df.groupby(["region", pd.Grouper(key="ts", freq="D")]).agg(
    total_revenue   = ("amount",   "sum"),
    order_count     = ("order_id", "nunique"),
    avg_order_value = ("amount",   "mean"),
    p95_amount      = ("amount",   lambda x: x.quantile(0.95)),
).reset_index()

# GroupBy transform  -  broadcast aggregation back to original rows
df["user_total"]   = df.groupby("user_id")["amount"].transform("sum")
df["pct_of_total"] = df["amount"] / df["user_total"] * 100

# merge (JOIN equivalent)  -  explicit how= is safer than default inner
result = (
    pd.merge(orders, customers, on="customer_id", how="left", suffixes=("_ord", "_cust"))
    .merge(products, on="product_id", how="left")
    .merge(dim_date, left_on="order_date", right_on="date_key", how="left")
)

# pivot_table  -  create summary matrices
pivot = pd.pivot_table(
    df,
    values="revenue",
    index="region",
    columns="product_category",
    aggfunc="sum",
    fill_value=0,
    margins=True,       # add row/column totals
    margins_name="Total",
)

# When .apply() IS justified: row-wise logic with branching
def classify_order(row: pd.Series) -> str:
    if row["amount"] > 1000 and row["is_business"]:
        return "enterprise"
    elif row["amount"] > 100:
        return "standard"
    return "micro"

# Use vectorized alternative with np.select when possible
conditions = [
    (df["amount"] > 1000) & df["is_business"],
    df["amount"] > 100,
]
choices = ["enterprise", "standard"]
df["tier"] = np.select(conditions, choices, default="micro")

# Memory optimization  -  downcast after arithmetic
df["amount"]   = pd.to_numeric(df["amount"], downcast="float")
df["user_id"]  = pd.to_numeric(df["user_id"], downcast="integer")

# Write parquet with compression
df.to_parquet("output.parquet", engine="pyarrow", compression="snappy", index=False)`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I use df.apply(lambda row: row['price'] * row['qty'], axis=1)"</td><td>"Vectorized: df['rev'] = df['price'] * df['qty']. .apply() is a Python for-loop — 100x slower than NumPy C operations for arithmetic"</td></tr>
              <tr><td>"I read the whole file and filter after loading"</td><td>{"pd.read_csv(path, usecols=['user_id','amount'], dtype={'amount':'float32'}) — only load what you need. usecols + dtypes reduce memory 70-80% before a single transform"}</td></tr>
              <tr><td>"object dtype works fine for string columns"</td><td>"category dtype for low-cardinality strings (event_type, region, status). 90% memory reduction — stores ints + 5-entry lookup instead of full strings for every row"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-pandas" questions={[
            { question: "A 5GB events CSV has an event_type column with 8 unique values across 50M rows. What dtype reduces its memory footprint most?", options: ["str — Python native string type is most efficient", "object — pandas default for strings, optimized for arbitrary text", "category — stores 8 unique strings once + an integer code per row vs full string per row", "bytes — binary encoding of strings"], correct: 2 },
            { question: "df.apply(lambda row: row['price'] * row['qty'], axis=1) vs df['price'] * df['qty'] — what's the performance difference?", options: ["They're identical — pandas optimizes apply() automatically", "apply() is 2-3x faster because it uses multiprocessing", "Vectorized multiplication runs in C via NumPy; apply() runs a Python interpreter loop per row — 10-100x slower for arithmetic", "apply() with axis=1 is faster; apply() with axis=0 is slower"], correct: 2 },
            { question: "pd.merge(orders, customers, on='customer_id', how='left', validate='m:1') — what does validate='m:1' check?", options: ["That the merge key is of type int64 on both sides", "That each key in orders maps to at most one row in customers — raises MergeError if customers has duplicate customer_ids", "That the result has m times as many rows as customers", "That both DataFrames have the same number of columns"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Specify dtypes explicitly on read — category for low-cardinality strings, int32 for IDs</li>
                <li>Use vectorized column operations for arithmetic — avoid .apply() with Python lambdas</li>
                <li>Use chunksize for files larger than available RAM</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Let pandas infer dtypes on large files — inference reads the file twice and often guesses wrong</li>
                <li>Use .apply(lambda row: ..., axis=1) for arithmetic — it's a Python loop in disguise</li>
                <li>Load 50GB files fully into memory — use chunksize or switch to Polars/DuckDB</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-pandas')) { await unmarkTopicComplete('py-pandas'); onUnmark('py-pandas') } else { await markTopicComplete('py-pandas'); onComplete('py-pandas') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-pandas') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-pandas') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-db" ref={el => { if (el) sectionRefs.current['py-db'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Database Connections  -  psycopg2, SQLAlchemy, Connection Pooling</h1>
            <p className="topic-desc">Proper database connection management prevents connection leaks, ensures transactional integrity, and maximizes throughput. psycopg2 for direct Postgres, SQLAlchemy for ORM/abstraction, and connection pooling for high-concurrency workloads.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you prevent database connection leaks in a long-running pipeline?"<br/>• "What's the difference between execute() and execute_values() for bulk inserts?"<br/>• "How does connection pooling work and when do you need it?"<br/>• "What happens if you forget to commit a transaction in psycopg2?"<br/>• "When would you choose psycopg2 directly vs SQLAlchemy?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate manage connections with context managers, use bulk insert APIs, and understand connection pooling — or do they open connections per row, use executemany() for 100K records, and leave connections open on exceptions?</div>
          </div>

          <p>In production, database connections are expensive resources. The reason context managers matter is deterministic cleanup: the connection closes whether the operation succeeds or fails, even if an exception bypasses your cleanup code. execute_values() batches all rows into a single round-trip; executemany() sends one INSERT per row — for 100K records that's 100K round trips vs 1. Connection pools (psycopg2.pool.ThreadedConnectionPool) maintain a fixed pool of reusable connections — critical when your pipeline runs 20 concurrent workers, each needing a DB connection.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"Context manager for connections — commit on success, rollback on exception, close in finally. No connection leaks."</td></tr>
              <tr><td>2</td><td>"execute_values() for bulk inserts — one round trip for all rows. executemany() is one INSERT per row — 100x slower for large batches."</td></tr>
              <tr><td>3</td><td>"ON CONFLICT DO UPDATE for upserts — idempotent loads. Run the pipeline twice on the same data with no duplicates."</td></tr>
              <tr><td>4</td><td>"Connection pool for concurrent workers: ThreadedConnectionPool(minconn=2, maxconn=10) — acquire/release connections, never exhaust Postgres's limit."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Square:</strong> Payment reconciliation pipeline uses execute_values() to bulk-insert 500K records in 3 seconds vs 8 minutes with executemany(). Single round-trip: Postgres receives one 40MB INSERT statement vs 500K individual statements.<br/><strong>Twilio:</strong> Connection pool with maxconn=20 serves 50 concurrent pipeline workers — pool blocks when exhausted rather than opening new connections and exceeding Postgres's max_connections=100 limit.<br/><strong>PagerDuty:</strong> All pipeline inserts use ON CONFLICT DO UPDATE — pipelines are retried on failure with identical data. Idempotent writes mean 0 duplicate records despite retries, vs 10,000+ duplicates with plain INSERT.</div>
          </div>

          <DBConnectionDiagram />
          <DBConnectionAnimation />
          <CodeBlock lang="python">{`import psycopg2
import psycopg2.extras
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

DSN = "postgresql://pipeline:secret@db-host:5432/warehouse"

# Context manager for connections  -  always closes, rollbacks on error
@contextmanager
def get_connection(dsn: str = DSN):
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

# Bulk insert with execute_values (much faster than executemany)
def load_events_batch(records: list[dict]) -> int:
    sql = """
        INSERT INTO fact_events (user_id, event_type, amount, ts, region)
        VALUES %s
        ON CONFLICT (user_id, ts) DO UPDATE
            SET amount = EXCLUDED.amount,
                updated_at = NOW()
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                sql,
                [(r["user_id"], r["event_type"], r["amount"], r["ts"], r["region"])
                 for r in records],
                template=None,
                page_size=1000,
            )
            return cur.rowcount

# COPY FROM for maximum ingest throughput (fastest Postgres load method)
def bulk_copy_from_csv(filepath: str, table: str) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            with open(filepath, "r") as f:
                cur.copy_expert(
                    f"COPY {table} FROM STDIN WITH (FORMAT csv, HEADER true)",
                    f,
                )
            logger.info(f"COPY loaded {cur.rowcount} rows into {table}")

# DictCursor  -  rows as dicts instead of tuples
def fetch_dim_table(table: str) -> dict[int, dict]:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(f"SELECT * FROM {table}")
            rows = cur.fetchall()
    return {row["id"]: dict(row) for row in rows}`}</CodeBlock>
          <CodeBlock lang="python">{`from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import QueuePool
import pandas as pd

# SQLAlchemy engine with connection pool
engine = create_engine(
    "postgresql+psycopg2://pipeline:secret@db-host:5432/warehouse",
    poolclass=QueuePool,
    pool_size=10,         # maintain 10 persistent connections
    max_overflow=20,      # allow up to 20 extra connections under load
    pool_pre_ping=True,   # test connection health before use (avoids stale conn errors)
    pool_recycle=3600,    # recycle connections every hour
    echo=False,           # set True for SQL logging in dev
)

# Add event listeners for observability
@event.listens_for(engine, "connect")
def on_connect(dbapi_conn, connection_record):
    logger.debug("New DB connection established")

@event.listens_for(engine, "checkout")
def on_checkout(dbapi_conn, connection_record, connection_proxy):
    logger.debug("Connection checked out from pool")

# Use engine with pandas (very convenient for read/write)
def read_table_to_df(table: str, where: str | None = None) -> pd.DataFrame:
    query = f"SELECT * FROM {table}"
    if where:
        query += f" WHERE {where}"
    return pd.read_sql(query, engine)

def write_df_to_table(df: pd.DataFrame, table: str, if_exists: str = "append") -> None:
    df.to_sql(
        table,
        engine,
        if_exists=if_exists,
        index=False,
        method="multi",     # batch inserts
        chunksize=10_000,
    )

# Raw SQL with parameterized queries (prevent SQL injection)
def run_upsert(records: list[dict], table: str) -> int:
    sql = text(f"""
        INSERT INTO {table} (user_id, amount, ts)
        VALUES (:user_id, :amount, :ts)
        ON CONFLICT (user_id, ts) DO UPDATE
            SET amount = EXCLUDED.amount
    """)
    with engine.begin() as conn:   # engine.begin() = auto-commit transaction
        result = conn.execute(sql, records)
        return result.rowcount`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I use conn = psycopg2.connect() and close it in a try/finally"</td><td>"Context manager: @contextmanager def get_connection() — commits on success, rollbacks on exception, closes in finally. No way to leak a connection"</td></tr>
              <tr><td>"I use executemany() to insert a list of records"</td><td>"execute_values() sends all rows in a single round trip. executemany() is one INSERT per row — for 100K records that's 100K network round trips vs 1"</td></tr>
              <tr><td>{"I build SQL queries with f-strings: f'SELECT * FROM {table}'"}</td><td>"SQL injection vulnerability. Parameterized queries: text('SELECT * FROM events WHERE user_id = :uid').bindparams(uid=user_id). User input never touches the SQL string"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-db" questions={[
            { question: "execute_values(cur, sql, [(r1), (r2), ...]) vs executemany(cur, sql, [(r1), (r2), ...]) — what's the throughput difference for 100K rows?", options: ["executemany is faster — it uses psycopg2's C extension for batch execution", "execute_values sends all rows in one SQL statement; executemany sends 100K individual statements — execute_values is typically 50-100x faster for large batches", "They have identical performance — both use server-side prepared statements", "execute_values only works with COPY command, not INSERT"], correct: 1 },
            { question: "Your pipeline opens a psycopg2 connection at startup and never closes it. A network blip drops the connection after 4 hours. What happens to subsequent pipeline runs?", options: ["psycopg2 automatically reconnects — it detects the dead connection and creates a new one", "The pipeline fails with 'connection is closed' errors on every subsequent query until the process restarts", "Postgres sends a keepalive that restores the connection automatically", "The cursor retries the last failed query up to 3 times"], correct: 1 },
            { question: "When should you choose raw psycopg2 over SQLAlchemy Core for a data pipeline?", options: ["Always use SQLAlchemy — it's the standard and psycopg2 is deprecated", "Raw psycopg2 when you need maximum control and performance for bulk loads (execute_values, COPY); SQLAlchemy when you need cross-database portability, ORM relationships, or connection pool management", "psycopg2 only supports Python 2; use SQLAlchemy for Python 3", "SQLAlchemy Core is always slower than psycopg2 and should be avoided"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use context managers for connections — guaranteed commit/rollback/close</li>
                <li>Use execute_values() or COPY for bulk inserts — single round trip for all rows</li>
                <li>Use parameterized queries — never build SQL with string formatting</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Keep long-lived connections open without keepalive or reconnection logic</li>
                <li>Use executemany() for bulk inserts at scale — O(n) round trips</li>
                <li>Build SQL with f-strings or .format() — SQL injection risk and no type safety</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-db')) { await unmarkTopicComplete('py-db'); onUnmark('py-db') } else { await markTopicComplete('py-db'); onComplete('py-db') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-db') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-db') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-http" ref={el => { if (el) sectionRefs.current['py-http'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">HTTP Clients  -  requests, httpx, retry, pagination, rate limiting</h1>
            <p className="topic-desc">Data engineers constantly pull data from REST APIs. Handling pagination, rate limits, OAuth, retry with backoff, and session management correctly is critical for reliable API ingestion pipelines.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you handle a paginated API with 10,000+ pages of results?"<br/>• "What's the difference between requests.get() and a requests.Session()?"<br/>• "How do you implement exponential backoff for API retries?"<br/>• "What does HTTP 429 mean and how do you handle it automatically?"<br/>• "When would you use httpx instead of requests?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate use sessions for connection reuse, implement exponential backoff with jitter, respect rate limits, and handle pagination correctly — or do they call requests.get() in a bare loop that crashes on the first 429?</div>
          </div>

          <p>In production, API clients are reliability engineering. The reason sessions matter is TCP connection reuse — requests.Session() keeps the connection alive across calls; requests.get() opens a new TCP connection per request. Exponential backoff with jitter is required for retry logic: 2^attempt + random jitter prevents all retrying workers from slamming the API simultaneously (thundering herd). HTTP 429 (Too Many Requests) should read Retry-After header and sleep exactly that long. For async pipelines, httpx is the drop-in async replacement for requests.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"requests.Session() — reuses TCP connections, shares headers/auth across all calls. Always use a session, not bare requests.get()."</td></tr>
              <tr><td>2</td><td>"Exponential backoff: sleep(2**attempt + random.uniform(0,1)) — prevents thundering herd. Cap at ~60s max."</td></tr>
              <tr><td>3</td><td>"HTTP 429: read Retry-After header — sleep exactly that long. Retrying immediately on 429 just triggers more 429s."</td></tr>
              <tr><td>4</td><td>"Pagination: follow next_page token or offset until response has no next page. Generator pattern yields records as pages arrive."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>HubSpot:</strong> CRM data ingestion pipeline handles paginated Contact API — cursor-based pagination with generator yields 1000 records/page, 50 pages deep. Session with persistent auth header: zero re-auth overhead across 50 requests.<br/><strong>Salesforce:</strong> API rate limit is 15,000 calls/day. Pipeline uses token bucket rate limiter — 1 call per 5.76 seconds sustained. Exponential backoff with jitter on 429 responses: never exhausts daily limit despite retries.<br/><strong>Twitter/X:</strong> Academic Research API uses bearer token auth via session headers. Backoff decorator retries on 429/503/504 with 2^n + jitter delay — ingestion pipeline runs unattended for 8-hour historical pulls.</div>
          </div>

          <HTTPDiagram />
          <HTTPAnimation />
          <CodeBlock lang="python">{`import requests
import time
import logging
from urllib.parse import urljoin

logger = logging.getLogger(__name__)

class APIClient:
    """Reusable API client with session, retry, and rate limiting."""

    def __init__(
        self,
        base_url: str,
        api_key: str,
        max_retries: int = 3,
        rate_limit_rps: float = 10.0,
    ):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "de-pipeline/1.0",
        })
        self.max_retries = max_retries
        self._min_interval = 1.0 / rate_limit_rps
        self._last_call = 0.0

    def _rate_limit(self):
        elapsed = time.time() - self._last_call
        if elapsed < self._min_interval:
            time.sleep(self._min_interval - elapsed)
        self._last_call = time.time()

    def get(self, path: str, **params) -> dict:
        url = urljoin(self.base_url, path)
        last_exc = None
        for attempt in range(1, self.max_retries + 1):
            self._rate_limit()
            try:
                resp = self.session.get(url, params=params, timeout=30)
                if resp.status_code == 429:
                    wait = int(resp.headers.get("Retry-After", 60))
                    logger.warning(f"Rate limited. Waiting {wait}s...")
                    time.sleep(wait)
                    continue
                resp.raise_for_status()
                return resp.json()
            except (requests.ConnectionError, requests.Timeout) as e:
                last_exc = e
                wait = 2 ** attempt
                logger.warning(f"Attempt {attempt} failed: {e}. Retrying in {wait}s")
                time.sleep(wait)
        raise last_exc  # type: ignore

    def paginate(self, path: str, page_size: int = 100):
        """Yield all records across all pages."""
        page = 1
        while True:
            data = self.get(path, page=page, per_page=page_size)
            records = data.get("data", data.get("results", []))
            if not records:
                break
            yield from records
            if len(records) < page_size:
                break  # last page
            page += 1

# Usage
client = APIClient("https://api.salesplatform.com/v2/", api_key="sk-...")
all_orders = list(client.paginate("orders", page_size=500))`}</CodeBlock>
          <CodeBlock lang="python">{`import httpx
import asyncio
import time
from base64 import b64encode

# OAuth2 client credentials flow
class OAuthClient:
    def __init__(self, token_url: str, client_id: str, client_secret: str):
        self.token_url = token_url
        self.client_id = client_id
        self.client_secret = client_secret
        self._token: str | None = None
        self._expires_at: float = 0.0

    def get_token(self) -> str:
        if self._token and time.time() < self._expires_at - 60:
            return self._token  # reuse valid token (with 60s buffer)
        resp = requests.post(
            self.token_url,
            data={"grant_type": "client_credentials"},
            headers={
                "Authorization": "Basic " + b64encode(
                    f"{self.client_id}:{self.client_secret}".encode()
                ).decode()
            },
            timeout=15,
        )
        resp.raise_for_status()
        token_data = resp.json()
        self._token = token_data["access_token"]
        self._expires_at = time.time() + token_data.get("expires_in", 3600)
        return self._token

# httpx async client  -  for high-throughput concurrent API ingestion
async def fetch_all_pages_async(
    base_url: str,
    endpoints: list[str],
    max_concurrent: int = 20,
) -> dict[str, list]:
    results: dict[str, list] = {}
    sem = asyncio.Semaphore(max_concurrent)

    async def fetch_one(client: httpx.AsyncClient, endpoint: str):
        async with sem:
            resp = await client.get(endpoint, timeout=30.0)
            resp.raise_for_status()
            results[endpoint] = resp.json().get("data", [])

    async with httpx.AsyncClient(
        base_url=base_url,
        headers={"Authorization": f"Bearer {token}"},
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
    ) as client:
        await asyncio.gather(*[fetch_one(client, ep) for ep in endpoints])

    return results

# Cursor-based pagination (more reliable than page numbers for large datasets)
async def paginate_cursor(client: httpx.AsyncClient, url: str) -> list[dict]:
    all_records = []
    cursor = None
    while True:
        params = {"limit": 500}
        if cursor:
            params["cursor"] = cursor
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        all_records.extend(data["records"])
        cursor = data.get("next_cursor")
        if not cursor:
            break
    return all_records`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I call requests.get() for each API endpoint in a loop"</td><td>"requests.Session() reuses TCP connections — one handshake, all calls share it. Critical for 1000+ requests to the same host"</td></tr>
              <tr><td>"I retry on any error after 1 second"</td><td>"Exponential backoff with jitter: sleep(min(60, 2**attempt + random.uniform(0,1))). Jitter prevents thundering herd — all retrying workers desync"</td></tr>
              <tr><td>"I loop through page=1, page=2... until I get an empty result"</td><td>"Cursor-based pagination: follow next_cursor token from the response. Page numbers drift when records are inserted/deleted — cursors stay stable"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-http" questions={[
            { question: "Your pipeline makes 5,000 API calls to the same host. requests.get() vs requests.Session() — what's the key performance difference?", options: ["Session automatically parallelizes requests; requests.get() is sequential only", "requests.get() opens a new TCP connection per call; Session reuses connections via HTTP keep-alive — eliminates 5,000 TCP handshakes", "Session caches responses; requests.get() fetches fresh data every time", "They're identical — both use the same urllib3 connection pool"], correct: 1 },
            { question: "An API returns HTTP 429 with 'Retry-After: 30'. Your backoff logic computes 2^3 + jitter = 12 seconds. Which retry delay should your client use?", options: ["12 seconds — your computed backoff takes precedence", "The larger of 30 and your computed delay — always respect Retry-After as a minimum", "30 seconds — Retry-After always overrides your backoff computation", "0 seconds — 429 just means slow down slightly"], correct: 2 },
            { question: "Page-number pagination vs cursor-based pagination — which is safer for a high-churn dataset where records are inserted frequently?", options: ["Page-number is safer — simpler to implement and debug", "Cursor-based — a new record inserted on page 1 shifts all subsequent pages, causing duplicates/gaps with page numbers; cursors point to a stable position", "They're equivalent for all practical purposes", "Page-number is safer because it's stateless — each request is independent"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use requests.Session() for all API calls — TCP connection reuse, shared headers</li>
                <li>Implement exponential backoff with jitter — prevents thundering herd on retries</li>
                <li>Follow cursor-based pagination for high-churn datasets</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Retry immediately on failure — adds load to an already struggling API</li>
                <li>Ignore HTTP 429 Retry-After headers — they tell you exactly how long to wait</li>
                <li>Use bare requests.get() inside high-frequency loops — new TCP connection per call</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-http')) { await unmarkTopicComplete('py-http'); onUnmark('py-http') } else { await markTopicComplete('py-http'); onComplete('py-http') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-http') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-http') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-linux" ref={el => { if (el) sectionRefs.current['py-linux'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Linux & Shell Scripting for Data Engineers</h1>
            <p className="topic-desc">Data engineers work in Linux environments daily  -  managing file systems, scheduling jobs with cron, monitoring processes, piping data between commands, and writing robust shell scripts for pipeline orchestration.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "What does 'set -euo pipefail' do at the top of a shell script?"<br/>• "How do you run 4 pipeline scripts in parallel using shell?"<br/>• "How do you find all files modified in the last 24 hours and process them?"<br/>• "What is a cron expression for 'every weekday at 2:30 AM'?"<br/>• "How do you make a shell script send an alert on failure?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate write defensive scripts with set -euo pipefail, use trap for cleanup, and understand pipe chaining — or do they write scripts that silently continue after errors and leave temp files on failure?</div>
          </div>

          <p>In production, shell scripts are the glue between pipeline steps. The reason set -euo pipefail is the first line of every production script: -e exits on any command failure (no silent errors), -u treats unset variables as errors (no mysterious empty values), -o pipefail catches errors in pipes (grep | sort | awk — without pipefail, if grep fails, the exit code is awk's exit code). trap cleanup EXIT ensures your cleanup function runs whether the script succeeds, fails, or is killed with Ctrl+C. xargs -P 4 runs 4 parallel processes against a list of files — no Python needed for simple fan-out.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"set -euo pipefail at the top of every script — exits on error, catches unset vars and pipe failures."</td></tr>
              <tr><td>2</td><td>"trap cleanup EXIT — runs cleanup function on any exit (success, error, SIGTERM). Always leaves the system clean."</td></tr>
              <tr><td>3</td><td>"xargs -P 4 -I{} python3 process.py --file {} — fan-out to 4 parallel processes. Simple and effective for file processing."</td></tr>
              <tr><td>4</td><td>"Cron '30 2 * * 1-5' — 2:30 AM Monday-Friday. Use absolute paths in cron jobs — $PATH differs from your shell session."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Airflow at Uber:</strong> All pipeline entry-point shell scripts use set -euo pipefail. Before this standard, a misconfigured variable in 3 scripts caused pipelines to silently process empty datasets for 6 hours — no error, wrong output.<br/><strong>Confluent:</strong> ETL scripts use trap for atomic cleanup — temp files, lock files, and Slack notifications sent on abnormal exit. Engineers are paged on failure automatically without external monitoring for these shell-level failures.<br/><strong>Pinterest:</strong> xargs -P 8 fans out image processing across 8 parallel workers per host. Combined with find -mtime -1 for incremental discovery — only processes new files since last run.</div>
          </div>

          <LinuxScriptDiagram />
          <LinuxScriptAnimation />
          <CodeBlock lang="bash">{`#!/bin/bash
# Robust pipeline shell script
set -euo pipefail   # -e: exit on error, -u: error on unset vars, -o pipefail: catch pipe errors

readonly LOG_DIR="/var/log/pipelines"
readonly DATA_DIR="/data"
readonly DATE="\${1:-$(date +%Y-%m-%d)}"   # use arg or today's date
readonly LOG_FILE="\${LOG_DIR}/pipeline_\${DATE}.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] [$$] $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" | tee -a "$LOG_FILE" >&2
}

# Trap: run cleanup on exit (success or failure)
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Pipeline failed with exit code $exit_code"
        # Send alert (e.g., via curl to Slack webhook)
    fi
    log "Pipeline finished. Exit: $exit_code"
}
trap cleanup EXIT

log "Starting pipeline for date: $DATE"

# File system operations
ls -lh "\${DATA_DIR}/incoming/"           # list files with sizes
du -sh "\${DATA_DIR}/raw/"                # directory size
df -h /data                             # disk space check

# Find and process files
find "\${DATA_DIR}/incoming" -name "*.csv.gz" -newer "\${DATA_DIR}/last_run" -print0 \\
    | xargs -0 -P 4 -I{} bash -c 'python3 /opt/pipelines/ingest.py --file "$1"' _ {}
# -P 4: 4 parallel processes; -0: null-delimited (handles spaces in filenames)

# Pipe chaining  -  transform data without temp files
zcat "\${DATA_DIR}/events.jsonl.gz" \\
    | python3 /opt/pipelines/filter.py --type purchase \\
    | python3 /opt/pipelines/enrich.py \\
    | gzip > "\${DATA_DIR}/processed/purchases_\${DATE}.jsonl.gz"

# Check exit code of previous command
if [[ $? -ne 0 ]]; then
    log_error "Filter/enrich pipeline failed"
    exit 1
fi

# Cleanup old files (older than 30 days)
find "\${DATA_DIR}/archive" -name "*.parquet" -mtime +30 -delete
log "Cleaned up files older than 30 days"

# Cron job: run daily at 2 AM
# 0 2 * * * /opt/pipelines/run_daily.sh >> /var/log/pipelines/cron.log 2>&1`}</CodeBlock>
          <CodeBlock lang="bash">{`# Process management
ps aux | grep python3              # find running python processes
kill -TERM $(pgrep -f "pipeline.py")   # graceful shutdown
lsof -i :5432                     # what's using PostgreSQL port
netstat -tlnp | grep LISTEN       # all listening ports

# File permissions for pipeline security
chmod 750 /opt/pipelines/          # owner: rwx, group: r-x, others: none
chmod 640 /opt/pipelines/.env      # protect credentials
chown -R pipeline:dataeng /opt/pipelines/

# systemd service for persistent pipeline daemon
# /etc/systemd/system/de-pipeline.service:
# [Unit]
# Description=Data Engineering Pipeline
# After=network.target postgresql.service
#
# [Service]
# Type=simple
# User=pipeline
# WorkingDirectory=/opt/pipelines
# ExecStart=/opt/pipelines/.venv/bin/python pipeline.py
# Restart=on-failure
# RestartSec=30
# EnvironmentFile=/opt/pipelines/.env
#
# [Install]
# WantedBy=multi-user.target

# Manage the service
systemctl enable de-pipeline
systemctl start de-pipeline
systemctl status de-pipeline
journalctl -u de-pipeline -f      # follow logs

# Environment variables
export PIPELINE_ENV=production
export DB_HOST=db-prod.internal
source /opt/pipelines/.env         # load .env file in bash

# Useful pipeline monitoring commands
tail -f /var/log/pipelines/*.log   # follow all pipeline logs
grep -E "ERROR|CRITICAL" /var/log/pipelines/pipeline_2024-01-15.log
wc -l /data/processed/events_2024-01-15.jsonl   # count processed records`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I write bash scripts without any error handling"</td><td>"set -euo pipefail is always the first line. -e stops on any error, -u catches unset variables, -o pipefail catches errors inside pipes silently ignored otherwise"</td></tr>
              <tr><td>"I use a for loop to process files sequentially"</td><td>"find -name '*.csv' | xargs -P 8 -I{} python3 process.py {} — fans out to 8 parallel workers. 8x throughput with one line"</td></tr>
              <tr><td>"I write cleanup code at the end of the script"</td><td>"trap cleanup EXIT runs even if the script crashes or is killed. Code at the end of a script never runs on error — trap does"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-linux" questions={[
            { question: "A pipeline script runs: grep 'ERROR' app.log | sort | uniq -c. grep finds nothing and exits code 1. With 'set -o pipefail', what happens?", options: ["The script continues — grep exit code 1 means 'no matches', which is not an error", "The entire pipeline expression exits with grep's exit code 1, causing the script to terminate (with -e set)", "sort catches the failed pipe and outputs empty results", "uniq -c raises an exception when receiving empty input"], correct: 1 },
            { question: "cron expression '30 2 * * 1-5' — when does this job run?", options: ["Every 2 hours and 30 minutes, weekdays only", "At 2:30 AM every day of the week", "At 2:30 AM Monday through Friday only", "30 minutes after midnight, 5 days a week starting Monday"], correct: 2 },
            { question: "Your pipeline script creates a lock file /tmp/pipeline.lock to prevent concurrent runs. The script crashes mid-run. How do you guarantee the lock file is always deleted?", options: ["Use rm /tmp/pipeline.lock at the end of the script", "Use trap 'rm -f /tmp/pipeline.lock' EXIT — runs on any exit including crashes and SIGTERM", "Use a finally block in the shell script", "Cron automatically cleans up tmp files after each run"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Start every script with set -euo pipefail — prevents silent failures</li>
                <li>Use trap cleanup EXIT for guaranteed resource cleanup</li>
                <li>Use absolute paths in cron jobs — $PATH is minimal in cron's environment</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Write scripts without set -euo pipefail — errors continue silently</li>
                <li>Rely on cleanup code at the end of a script — it never runs if the script crashes</li>
                <li>Use relative paths in cron jobs — the working directory and PATH differ from your interactive shell</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-linux')) { await unmarkTopicComplete('py-linux'); onUnmark('py-linux') } else { await markTopicComplete('py-linux'); onComplete('py-linux') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-linux') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-linux') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-git" ref={el => { if (el) sectionRefs.current['py-git'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Git Deep Dive for Data Engineers</h1>
            <p className="topic-desc">Git is not just version control  -  it's the backbone of CI/CD, code review, and collaborative development. Data engineers need fluency in branching strategies, rebase vs merge, cherry-pick, bisect, hooks, and GitHub Actions for pipeline automation.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "What's the difference between git merge and git rebase?"<br/>• "How would you find which commit introduced a performance regression?"<br/>• "When would you use git cherry-pick?"<br/>• "What does interactive rebase allow you to do before opening a PR?"<br/>• "How do you set up a pre-commit hook to run linting?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate use rebase to maintain a clean linear history, know how to bisect a regression across 200 commits, and understand when cherry-pick is appropriate — or do they only know git add/commit/push and merge everything with a merge commit?</div>
          </div>

          <p>In production, Git discipline determines how fast your team can review, debug, and roll back changes. The reason rebase matters over merge is linear history — a merge creates a merge commit that muddies the log; rebase replays your commits on top of main, making git log read like a coherent story. git bisect binary-searches through commits to find the exact commit that introduced a bug — critical for regressions that appear after 200 commits. cherry-pick applies a specific commit (hotfix) to a different branch without bringing all other commits along.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"Feature branch off main, rebase origin/main before PR — linear history, no merge commits cluttering the log."</td></tr>
              <tr><td>2</td><td>"Interactive rebase: git rebase -i HEAD~N — squash fixup commits, reword message. Reviewers see clean logical commits, not 'WIP' noise."</td></tr>
              <tr><td>3</td><td>"git bisect start; git bisect bad HEAD; git bisect good v1.2.0 — binary search across commits to find the regression in O(log N) steps."</td></tr>
              <tr><td>4</td><td>"Pre-commit hooks (pre-commit framework): ruff, mypy, pytest fast tests run on every commit — never push broken code."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Airbnb:</strong> All data pipeline PRs require rebase before merge — no merge commits in main. git log --oneline reads as a clean feature history, making rollbacks and cherry-picks surgical rather than guesswork.<br/><strong>Meta:</strong> git bisect used to find pipeline performance regression in 200-commit range — binary search found the culprit in 8 steps (2^8=256). Would have taken days of manual investigation without bisect.<br/><strong>Databricks:</strong> pre-commit hooks run ruff (lint), mypy (types), and unit tests under 5 seconds on every commit. Broken code never reaches CI — engineers get instant feedback before push.</div>
          </div>

          <GitDiagram />
          <GitAnimation />
          <CodeBlock lang="bash">{`# Branching strategy: GitHub Flow for data engineering teams
# main → always deployable
# feature/xxx → short-lived feature branches
# hotfix/xxx → urgent production fixes

git checkout main && git pull origin main
git checkout -b feature/add-silver-transformations

# Work, commit often with semantic messages
git add src/transformations/silver.py tests/test_silver.py
git commit -m "feat(silver): add deduplication with window functions"
git add src/transformations/silver.py
git commit -m "fix(silver): handle null user_id in dedup key"
git commit -m "test(silver): add edge case for empty partition"

# Before PR: rebase to clean up commits and get latest main
git fetch origin
git rebase origin/main            # replay your commits on top of latest main
# If conflicts: git add <resolved_files> && git rebase --continue

# Interactive rebase  -  squash/reword commits before PR
git rebase -i HEAD~3
# In editor: pick/squash/reword/drop commits
# squash: merge into previous commit
# reword: edit commit message

# Push and create PR
git push origin feature/add-silver-transformations
gh pr create --title "feat(silver): add deduplication with window functions" \\
             --body "Adds SCD2-style dedup using row_number() partitioned by user_id+date"

# cherry-pick  -  apply specific commit to another branch (e.g., hotfix to main)
git checkout main
git cherry-pick abc1234           # apply commit abc1234 to main
git push origin main

# bisect  -  find which commit introduced a bug
git bisect start
git bisect bad HEAD               # current commit is bad
git bisect good v1.2.0            # this tag was good
# git bisect tests commits automatically:
git bisect run python -m pytest tests/test_silver.py -x  # automated bisect
git bisect reset                  # clean up after finding the bad commit`}</CodeBlock>
          <CodeBlock lang="yaml">{`# .github/workflows/pipeline-ci.yml
# GitHub Actions CI for data engineering pipelines

name: Pipeline CI

on:
  push:
    branches: [main, "feature/**"]
  pull_request:
    branches: [main]

env:
  PYTHON_VERSION: "3.11"

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: \${{ env.PYTHON_VERSION }}
          cache: pip

      - name: Install dev dependencies
        run: |
          pip install ruff mypy
          pip install -r requirements.txt

      - name: Lint with ruff
        run: ruff check src/ tests/

      - name: Type check with mypy
        run: mypy src/ --strict

  test:
    runs-on: ubuntu-latest
    needs: lint-and-type-check

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 5s

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: \${{ env.PYTHON_VERSION }}
          cache: pip

      - name: Install dependencies
        run: pip install -r requirements.txt -r requirements-dev.txt

      - name: Run tests
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: test
          DB_PASSWORD: test
          DB_NAME: test_db
        run: pytest tests/ -v --tb=short --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4`}</CodeBlock>
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I commit everything to main directly"</td><td>"Feature branches off main, rebased before PR. main is always deployable — no broken code ever touches it"</td></tr>
              <tr><td>"I use 'git log' to manually search for which commit broke things"</td><td>"git bisect: mark HEAD as bad, last known good as good. Git binary-searches 200 commits in 8 steps — finds the regression in minutes"</td></tr>
              <tr><td>"I merge main into my branch to get the latest changes"</td><td>"git rebase origin/main — replays my commits on top of latest main. Linear history, no merge commits, cherry-pick and rollback stay clean"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-git" questions={[
            { question: "You need to apply a critical fix (commit abc1234 from a hotfix branch) to main without merging the entire hotfix branch. Which command is correct?", options: ["git merge hotfix/fix-null-keys -- squash", "git cherry-pick abc1234 — applies just that commit's changes to the current branch", "git rebase --onto main hotfix/fix-null-keys", "git stash apply abc1234"], correct: 1 },
            { question: "git rebase origin/main vs git merge origin/main — what does each produce in your feature branch history?", options: ["rebase creates a merge commit; merge replays commits linearly", "merge creates a merge commit preserving both histories; rebase replays your feature commits on top of main — linear history, no merge commit", "They're identical — both update your branch with the latest main changes", "rebase is for shared branches; merge is for feature branches"], correct: 1 },
            { question: "git bisect start; git bisect bad HEAD; git bisect good v1.5.0. There are 256 commits between v1.5.0 and HEAD. How many git bisect steps to find the regression?", options: ["256 steps — git tests each commit sequentially", "8 steps — binary search halves the range each step: 2^8 = 256", "1 step — git analyzes the diff automatically", "Depends on how many files were changed in each commit"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Rebase feature branches onto main before PRs — linear history, clean log</li>
                <li>Use git bisect to find regressions — O(log N) steps not O(N)</li>
                <li>Use pre-commit hooks to enforce lint/type checks before every commit</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Force-push to shared branches — rewrites history other engineers have pulled</li>
                <li>Commit directly to main without a PR — no code review, no CI gate</li>
                <li>Mix merge and rebase strategies on the same branch — causes duplicated commits</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-git')) { await unmarkTopicComplete('py-git'); onUnmark('py-git') } else { await markTopicComplete('py-git'); onComplete('py-git') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-git') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-git') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-pydantic ───────────────────────────────────────────────── */}
        <section id="py-pydantic" ref={el => { if (el) sectionRefs.current['py-pydantic'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Pydantic Data Validation</h1>
            <p className="topic-desc">Pydantic v2 is the standard library for data validation in Python data engineering. Built on Rust (via pydantic-core), it validates data at the boundary between untrusted inputs and your pipeline logic  -  parsing JSON API responses, validating pipeline configs, and enforcing schema contracts at runtime. Pydantic models serve as living documentation for your data contracts.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you validate API response data before it enters your pipeline?"<br/>• "What's the difference between @field_validator and @model_validator in Pydantic v2?"<br/>• "How do you use Pydantic for pipeline configuration management?"<br/>• "What happens when a Pydantic model receives an invalid field — does it raise immediately or collect all errors?"<br/>• "How is Pydantic v2 different from v1?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate use Pydantic as the validation boundary between untrusted external data and pipeline logic — or do they manually check types inline with isinstance() scattered throughout the pipeline?</div>
          </div>

          <p>In production, Pydantic is a data contract enforcement layer. The reason it matters is that external data (API responses, user uploads, config files) is untrusted. A Pydantic model defines what the data must look like — and validation happens automatically at the boundary when you instantiate the model. A ValidationError collects all errors across all fields and raises once, not field by field. @field_validator adds custom logic per field; @model_validator runs after all fields parse and validates cross-field invariants. BaseSettings loads config from environment variables automatically — perfect for 12-factor app config.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"Pydantic validates at the boundary — EventRecord(data) coerces types and raises ValidationError with all field errors at once."</td></tr>
              <tr><td>2</td><td>"Field constraints: Annotated[float, Field(gt=0, le=1_000_000)] — validates range at parse time, not in application logic."</td></tr>
              <tr><td>3</td><td>"@field_validator('amount') for per-field logic; @model_validator(mode='after') for cross-field rules (end_date &gt; start_date)."</td></tr>
              <tr><td>4</td><td>"BaseSettings for pipeline config — automatically reads from env vars, .env files, with type coercion. No manual os.environ.get()."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>FastAPI (used by Netflix, Uber, Microsoft):</strong> All request/response bodies are Pydantic models — validation, coercion, and OpenAPI schema generation happen automatically. Zero manual validation code.<br/><strong>Robinhood:</strong> Pydantic models define the data contract between upstream API responses and the warehouse ingestion pipeline. 847 schema violations caught per day at the boundary before bad data enters the warehouse.<br/><strong>Stripe:</strong> BaseSettings loads 40+ pipeline config values from environment variables with type coercion and required field validation. Missing config raises ValidationError at startup, not mid-run when it would corrupt partial data.</div>
          </div>

          <PydanticDiagram />
          <PydanticAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Pydantic v2 vs v1:</strong> v2 (2023+) rewrites the core in Rust  -  5-50x faster than v1. Key API changes: <code>@validator</code> → <code>@field_validator</code>, <code>@root_validator</code> → <code>@model_validator</code>, <code>.dict()</code> → <code>.model_dump()</code>, <code>.json()</code> → <code>.model_dump_json()</code>. Always use v2 for new projects.</div>
          </div>

          <CodeBlock lang="python">{`# ── Pydantic v2: data validation for data engineering ─────────────────────────
from pydantic import BaseModel, Field, field_validator, model_validator, computed_field
from pydantic import ValidationError
from pydantic_settings import BaseSettings
from datetime import datetime
from typing import Annotated, Literal
from enum import Enum

# ── 1. Basic BaseModel ────────────────────────────────────────────────────────
class EventRecord(BaseModel):
    event_id: str
    user_id: int
    event_type: str
    amount: float
    event_ts: datetime          # auto-parsed from ISO string or epoch
    currency: str = "USD"       # default value
    tags: list[str] = []

# Pydantic parses and validates on instantiation
event = EventRecord(
    event_id="EVT-001",
    user_id=42,
    event_type="purchase",
    amount=99.99,
    event_ts="2024-01-15T10:30:00",  # string → datetime automatically
)
print(event.model_dump())   # → dict
print(event.model_dump_json())  # → JSON string

# Validation errors are structured (great for pipeline error reporting)
try:
    bad = EventRecord(event_id="EVT-002", user_id="not-an-int", event_type="click",
                      amount=-5, event_ts="not-a-date")
except ValidationError as e:
    print(e.error_count())   # 2
    for err in e.errors():
        print(f"  {err['loc']}: {err['msg']}")

# ── 2. Field constraints ──────────────────────────────────────────────────────
class OrderRecord(BaseModel):
    order_id: Annotated[str, Field(pattern=r"^ORD-\d{6}$", description="Order ID in ORD-XXXXXX format")]
    amount: Annotated[float, Field(gt=0, lt=1_000_000, description="Order amount in USD")]
    discount_pct: Annotated[float, Field(ge=0.0, le=1.0)] = 0.0
    items: Annotated[list[str], Field(min_length=1, max_length=100)]
    status: Literal["pending", "confirmed", "shipped", "delivered", "cancelled"]
    priority: Annotated[int, Field(ge=1, le=5)] = 3

# ── 3. field_validator: custom field-level validation ────────────────────────
class PipelineEvent(BaseModel):
    event_id: str
    user_id: int
    event_ts: datetime
    region: str
    amount: float

    @field_validator("event_ts")
    @classmethod
    def event_ts_not_future(cls, v: datetime) -> datetime:
        if v > datetime.utcnow():
            raise ValueError(f"event_ts {v} is in the future  -  likely a clock skew issue")
        return v

    @field_validator("region")
    @classmethod
    def region_must_be_valid(cls, v: str) -> str:
        valid = {"us-east-1", "eu-west-1", "ap-southeast-1"}
        if v not in valid:
            raise ValueError(f"region must be one of {valid}, got {v!r}")
        return v

    @field_validator("amount", mode="before")
    @classmethod
    def amount_coerce_str(cls, v) -> float:
        # Accept string amounts from legacy systems: "$ 99.99" → 99.99
        if isinstance(v, str):
            cleaned = v.replace("$", "").replace(",", "").strip()
            return float(cleaned)
        return v

# ── 4. model_validator: cross-field validation ────────────────────────────────
class DateRangeConfig(BaseModel):
    start_date: datetime
    end_date: datetime
    max_range_days: int = 90

    @model_validator(mode="after")
    def end_after_start(self) -> "DateRangeConfig":
        if self.end_date <= self.start_date:
            raise ValueError(f"end_date must be after start_date")
        delta = (self.end_date - self.start_date).days
        if delta > self.max_range_days:
            raise ValueError(f"Date range {delta} days exceeds max {self.max_range_days} days")
        return self

# ── 5. computed_field: derived properties ─────────────────────────────────────
class SalesRecord(BaseModel):
    unit_price: float
    quantity: int
    discount_pct: float = 0.0

    @computed_field
    @property
    def total_amount(self) -> float:
        return self.unit_price * self.quantity * (1 - self.discount_pct)

    @computed_field
    @property
    def is_bulk_order(self) -> bool:
        return self.quantity >= 100

rec = SalesRecord(unit_price=9.99, quantity=150, discount_pct=0.1)
print(rec.total_amount)    # 1348.65
print(rec.is_bulk_order)   # True
print(rec.model_dump())    # includes computed fields`}</CodeBlock>

          <CodeBlock lang="python">{`# ── 6. Nested models ─────────────────────────────────────────────────────────
from pydantic import BaseModel, Field
from typing import Optional

class Address(BaseModel):
    street: str
    city: str
    country: str = Field(pattern=r"^[A-Z]{2}$")  # ISO 2-letter country code

class Customer(BaseModel):
    customer_id: int
    name: str
    email: str
    billing_address: Address
    shipping_address: Optional[Address] = None  # None → same as billing

    @model_validator(mode="after")
    def default_shipping(self) -> "Customer":
        if self.shipping_address is None:
            self.shipping_address = self.billing_address
        return self

# Nested parsing from dict/JSON
customer = Customer(
    customer_id=42,
    name="Alice",
    email="alice@example.com",
    billing_address={"street": "123 Main St", "city": "Seattle", "country": "US"}
)

# ── 7. Parsing API responses in pipelines ────────────────────────────────────
import httpx
from typing import Any

class APIResponse(BaseModel):
    status: Literal["ok", "error"]
    data: list[EventRecord]
    total: int
    page: int
    page_size: int

def fetch_events(api_url: str, token: str, page: int) -> list[EventRecord]:
    resp = httpx.get(
        api_url,
        params={"page": page, "size": 500},
        headers={"Authorization": f"Bearer {token}"},
        timeout=30.0,
    )
    resp.raise_for_status()
    parsed = APIResponse.model_validate(resp.json())  # validates full response structure
    if parsed.status != "ok":
        raise ValueError(f"API returned error status")
    return parsed.data  # list of validated EventRecord instances

# ── 8. BaseSettings: config from environment variables ────────────────────────
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class PipelineSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",           # load from .env file if present
        env_prefix="PIPELINE_",    # all vars prefixed: PIPELINE_DB_HOST, etc.
        case_sensitive=False,
    )

    db_host: str
    db_port: int = 5432
    db_name: str
    db_user: str
    db_password: str
    s3_bucket: str
    batch_size: int = Field(default=10_000, gt=0, le=1_000_000)
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    output_path: Path = Path("/tmp/output")

    @field_validator("db_password")
    @classmethod
    def mask_password_in_repr(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

# Settings auto-populated from environment:
#   PIPELINE_DB_HOST=prod-db.internal
#   PIPELINE_DB_NAME=warehouse
#   PIPELINE_S3_BUCKET=my-data-bucket
settings = PipelineSettings()
print(f"Connecting to {settings.db_host}:{settings.db_port}/{settings.db_name}")

# ── 9. Validating a list of records from a pipeline stage ────────────────────
from pydantic import TypeAdapter

# TypeAdapter: validate without a model class (useful for list[SomeModel])
adapter = TypeAdapter(list[EventRecord])

raw_json = '[{"event_id":"E1","user_id":1,"event_type":"click","amount":0,"event_ts":"2024-01-15T10:00:00"}]'
events = adapter.validate_json(raw_json)

# Batch validate with error collection (don't fail on first error)
valid_records = []
invalid_records = []
for raw_record in raw_batch:
    try:
        valid_records.append(EventRecord.model_validate(raw_record))
    except ValidationError as e:
        invalid_records.append({"record": raw_record, "errors": e.errors()})`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I validate API responses with if/isinstance() checks scattered in my pipeline"</td><td>"Pydantic model at the boundary: EventRecord.model_validate(api_response) — coerces types, validates all fields, raises ValidationError with all failures at once"</td></tr>
              <tr><td>"I use @validator on fields in Pydantic v2"</td><td>"v2 uses @field_validator for single fields and @model_validator(mode='after') for cross-field rules. @validator is v1 API — causes warnings and deprecation errors"</td></tr>
              <tr><td>"I read config with os.environ.get('DB_HOST', 'localhost')"</td><td>"BaseSettings with Pydantic — class PipelineConfig(BaseSettings): db_host: str. Reads from env, validates types, raises ValidationError at startup if required config is missing"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-pydantic" questions={[
            { question: "A Pydantic model has 5 fields, 3 of which fail validation in a single call. What does Pydantic raise?", options: ["3 separate ValidationErrors, one per field, raised sequentially", "A single ValidationError containing all 3 field errors — you get all failures at once, not just the first", "A TypeError — Pydantic only raises TypeError for wrong Python types", "Nothing — Pydantic sets invalid fields to None by default"], correct: 1 },
            { question: "class PipelineConfig(BaseSettings): db_host: str — the DB_HOST environment variable is not set. What happens when the class is instantiated?", options: ["db_host defaults to an empty string ''", "ValidationError is raised at instantiation — db_host is required with no default", "Python raises KeyError when accessing config.db_host", "The field is skipped and excluded from config.model_dump()"], correct: 1 },
            { question: "@field_validator('amount') vs @model_validator(mode='after') — which is the right choice for validating that end_date > start_date?", options: ["@field_validator('end_date') — run validation when end_date is parsed", "@model_validator(mode='after') — runs after all fields are set, so both start_date and end_date are available for comparison", "@field_validator('start_date', 'end_date') with multiple field names", "@model_validator(mode='before') — runs before type coercion so dates are still strings"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Validate at the boundary — parse and validate untrusted data immediately on entry</li>
                <li>Use Field constraints for range, pattern, and length — not in application logic</li>
                <li>Use BaseSettings for pipeline config — type-safe, env-var backed, validated at startup</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use Pydantic v1 decorators (@validator, @root_validator) in new code — they're deprecated in v2</li>
                <li>Validate data deep inside pipeline logic — validate at the entry point, trust internally</li>
                <li>Silently ignore ValidationError — log all errors with structured context before failing</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-pydantic')) { await unmarkTopicComplete('py-pydantic'); onUnmark('py-pydantic') } else { await markTopicComplete('py-pydantic'); onComplete('py-pydantic') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-pydantic') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-pydantic') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-docker ─────────────────────────────────────────────────── */}
        <section id="py-docker" ref={el => { if (el) sectionRefs.current['py-docker'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Docker for Data Engineering</h1>
            <p className="topic-desc">Docker solves the "works on my machine" problem by packaging your pipeline code, dependencies, and runtime into a portable, reproducible image. For data engineers, Docker is essential for local development stacks, CI/CD pipelines, containerized Spark applications, and deploying Airflow, dbt, and other DE tools consistently across environments.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you minimize a Docker image size for a data pipeline?"<br/>• "What is a multi-stage Docker build and when do you use it?"<br/>• "Why should pipeline containers not run as root?"<br/>• "How does layer caching work and how do you optimize Dockerfile layer order?"<br/>• "How do you pass secrets into a Docker container without baking them into the image?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate use multi-stage builds, optimize layer caching by copying requirements before code, and run containers as non-root — or do they write a single FROM python:3.11 stage that ships gcc, g++, and build tools to production?</div>
          </div>

          <p>In production, Docker image design is a performance and security problem. The reason multi-stage builds matter: the builder stage installs gcc, g++, and libpq-dev (needed to compile psycopg2) — but those build tools should never ship to production. The runtime stage copies only the compiled packages from builder, resulting in a 600MB builder image producing a 180MB production image. Layer caching: COPY requirements.txt; RUN pip install; COPY src/ — this order caches the expensive pip install step as long as requirements.txt doesn't change. Never run pipeline containers as root — a container escape vulnerability in root context compromises the host.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"Multi-stage build: builder stage installs build tools + deps, runtime stage copies only the packages. 60-80% smaller final image."</td></tr>
              <tr><td>2</td><td>"Layer caching: COPY requirements.txt → RUN pip install → COPY src/. pip install only re-runs when requirements.txt changes."</td></tr>
              <tr><td>3</td><td>"Non-root user: RUN useradd appuser; USER appuser. Container escape with root = host compromise."</td></tr>
              <tr><td>4</td><td>"Secrets via environment variables at runtime — never COPY .env or ARG secrets that bake into image layers (visible in docker history)."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Lyft:</strong> Multi-stage Dockerfiles reduced pipeline image sizes from 2.1GB to 380MB. Kubernetes pod cold-start time dropped from 4 minutes to 45 seconds — critical for burst-scale Spark executors.<br/><strong>DoorDash:</strong> Layer caching optimization (requirements.txt before code COPY) cut CI build time from 8 minutes to 90 seconds for unchanged dependency stages — 5x faster iteration cycle.<br/><strong>Slack:</strong> All data pipeline containers run as non-root (uid 1001). Security audit requirement — passing container escape CVE simulation required non-root to contain the blast radius.</div>
          </div>

          <DockerPyDiagram />
          <DockerPyAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Multi-stage builds:</strong> Use a builder stage to install dependencies (including build tools like gcc), then copy only the necessary artifacts to a slim runtime stage. This reduces final image size by 60-80%  -  critical for fast image pulls in CI/CD and Kubernetes pod startup times.</div>
          </div>

          <CodeBlock lang="python">{`# ── Dockerfile for a PySpark data engineering application ────────────────────

# ─────────────────────────────────────────────
# STAGE 1: builder  -  install Python dependencies
# ─────────────────────────────────────────────
FROM python:3.11-slim AS builder

# Install system build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirements first (layer caching  -  only re-runs on requirements change)
COPY requirements.txt .

# Install to a target directory (for clean copy to runtime stage)
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --target=/app/packages -r requirements.txt

# ─────────────────────────────────────────────
# STAGE 2: runtime  -  slim final image
# ─────────────────────────────────────────────
FROM python:3.11-slim AS runtime

# Install only runtime system deps (not build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jre-headless \   # Required for PySpark
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for security (never run data pipelines as root)
RUN groupadd --gid 1001 appgroup && useradd --uid 1001 --gid 1001 --no-create-home appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /app/packages /app/packages

# Set PYTHONPATH to include our installed packages
ENV PYTHONPATH="/app/packages:/app/src"
ENV JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
ENV PYSPARK_PYTHON="python3"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy application source
COPY --chown=appuser:appgroup src/ ./src/
COPY --chown=appuser:appgroup config/ ./config/

# Switch to non-root user
USER appuser

EXPOSE 4040    # Spark UI

# ENTRYPOINT is the fixed command; CMD provides default arguments (can be overridden)
ENTRYPOINT ["python", "-m", "src.pipeline"]
CMD ["--env", "prod", "--date", "today"]`}</CodeBlock>

          <CodeBlock lang="yaml">{`# ── docker-compose.yml: local DE development stack ───────────────────────────
version: "3.9"

services:
  # ── Apache Airflow (webserver + scheduler + worker) ──────────────────────
  airflow-webserver:
    image: apache/airflow:2.9.0-python3.11
    container_name: airflow-webserver
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@postgres:5432/airflow
      AIRFLOW__CORE__FERNET_KEY: "\${FERNET_KEY}"
      AIRFLOW__WEBSERVER__SECRET_KEY: "\${SECRET_KEY}"
      AIRFLOW__CORE__LOAD_EXAMPLES: "false"
    env_file:
      - .env          # load secrets from .env file (never commit .env to git)
    volumes:
      - ./dags:/opt/airflow/dags           # mount DAGs for hot-reload in dev
      - ./plugins:/opt/airflow/plugins
      - airflow-logs:/opt/airflow/logs
    ports:
      - "8080:8080"   # Airflow UI
    command: webserver
    networks:
      - de-network

  airflow-scheduler:
    image: apache/airflow:2.9.0-python3.11
    container_name: airflow-scheduler
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@postgres:5432/airflow
    volumes:
      - ./dags:/opt/airflow/dags
      - airflow-logs:/opt/airflow/logs
    command: scheduler
    networks:
      - de-network

  # ── PostgreSQL (Airflow metadata DB + pipeline target) ────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: airflow
      POSTGRES_PASSWORD: airflow
      POSTGRES_DB: airflow
    volumes:
      - postgres-data:/var/lib/postgresql/data     # named volume for persistence
      - ./init-scripts:/docker-entrypoint-initdb.d  # run SQL on first start
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U airflow"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - de-network

  # ── Spark (master + 2 workers) ────────────────────────────────────────────
  spark-master:
    image: bitnami/spark:3.5
    container_name: spark-master
    environment:
      SPARK_MODE: master
      SPARK_RPC_AUTHENTICATION_ENABLED: "no"
    ports:
      - "8181:8080"   # Spark Master UI (avoid conflict with Airflow on 8080)
      - "7077:7077"   # Spark master port for worker registration
    networks:
      - de-network

  spark-worker:
    image: bitnami/spark:3.5
    deploy:
      replicas: 2     # spin up 2 workers
    environment:
      SPARK_MODE: worker
      SPARK_MASTER_URL: spark://spark-master:7077
      SPARK_WORKER_MEMORY: 2G
      SPARK_WORKER_CORES: "2"
    depends_on:
      - spark-master
    networks:
      - de-network

volumes:
  postgres-data:
  airflow-logs:

networks:
  de-network:
    driver: bridge`}</CodeBlock>

          <CodeBlock lang="bash">{`# ── Docker CLI commands for data engineering ─────────────────────────────────

# Build the image (tag with registry/repo:version)
docker build -t my-pipeline:1.0.0 .

# Build with build args (e.g., inject git SHA)
docker build --build-arg GIT_SHA=$(git rev-parse --short HEAD) -t my-pipeline:$(git rev-parse --short HEAD) .

# Run the container with resource limits
docker run \
  --rm \                          # auto-remove on exit
  --name pipeline-run-001 \
  --memory="4g" \                 # memory limit
  --cpus="2.0" \                  # CPU limit
  --env-file .env \               # load secrets from .env
  -v /data/input:/app/input:ro \  # mount input (read-only)
  -v /data/output:/app/output \   # mount output (read-write)
  -e PIPELINE_DATE=2024-01-15 \
  my-pipeline:1.0.0 \
  --env prod --date 2024-01-15

# Docker Compose commands
docker compose up -d              # start all services in background
docker compose logs -f airflow-scheduler  # follow scheduler logs
docker compose exec postgres psql -U airflow  # shell into postgres
docker compose down -v            # stop + remove containers and volumes

# Check container resource usage
docker stats --no-stream

# .dockerignore  -  keep images small and avoid leaking secrets
cat .dockerignore
# .git
# .env
# __pycache__
# *.pyc
# *.pyo
# .pytest_cache
# tests/
# docs/
# *.egg-info
# .venv
# dist/`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I use FROM python:3.11 and install everything in one RUN"</td><td>"Multi-stage: builder installs gcc + psycopg2-binary; runtime copies /app/packages. Production image has no build tools — 600MB → 180MB"</td></tr>
              <tr><td>"I copy my whole project first, then install requirements"</td><td>"COPY requirements.txt first, pip install, then COPY src/. Docker only re-runs pip install when requirements.txt changes — code changes don't invalidate the dependency layer"</td></tr>
              <tr><td>"I run the container as root because it's simpler"</td><td>"USER appuser — always non-root. Container escape vulnerabilities with root = host compromise. Security policy at most orgs prohibits root containers in prod"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-docker" questions={[
            { question: "Your Dockerfile has: COPY . .; RUN pip install -r requirements.txt. You change one line in main.py. Which layers rebuild?", options: ["Only the changed file — Docker detects the diff and rebuilds minimally", "COPY . . and everything after — COPY . . cache is invalidated by any file change, forcing pip install to re-run every time", "Only RUN pip install — Docker tracks requirements.txt separately from other files", "No layers rebuild — Docker uses the cached layers for unchanged commands"], correct: 1 },
            { question: "What is the security risk of running a data pipeline container as root (uid 0)?", options: ["Root containers are rejected by Docker Hub — they fail to push", "A container escape vulnerability gives the attacker root access on the host machine — non-root limits blast radius to container-scoped permissions", "Root containers cannot access bind-mounted volumes from the host", "Root containers use twice the memory due to Linux kernel privilege overhead"], correct: 1 },
            { question: "ENTRYPOINT ['python', 'pipeline.py'] and CMD ['--date', '2024-01-15'] — what happens when you run 'docker run myimage --date 2024-01-16'?", options: ["--date 2024-01-16 replaces the entire command including ENTRYPOINT", "The container runs python pipeline.py --date 2024-01-16 — CMD arguments are overridden, ENTRYPOINT is preserved", "--date 2024-01-16 is appended to CMD, running with both dates", "ENTRYPOINT is ignored and only --date 2024-01-16 runs"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Multi-stage builds — compile in builder, ship only runtime artifacts</li>
                <li>Optimize layer order: requirements.txt → pip install → source code</li>
                <li>Run as non-root user (uid 1001) — security requirement for production</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>COPY source code before requirements.txt — every code change forces full pip reinstall</li>
                <li>Bake secrets into images with ARG or ENV — visible in docker history and image layers</li>
                <li>Ship build tools (gcc, g++, make) in production images — bloats size and increases attack surface</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-docker')) { await unmarkTopicComplete('py-docker'); onUnmark('py-docker') } else { await markTopicComplete('py-docker'); onComplete('py-docker') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-docker') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-docker') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-k8s ────────────────────────────────────────────────────── */}
        <section id="py-k8s" ref={el => { if (el) sectionRefs.current['py-k8s'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Kubernetes for Data Engineering</h1>
            <p className="topic-desc">Kubernetes (K8s) is the production standard for running containerized data workloads at scale. For data engineers, the key use cases are: running Spark on Kubernetes (driver + executor pods), using KubernetesPodOperator in Airflow for isolated task execution, and deploying data services (APIs, dbt, Flink) with automatic scaling and self-healing.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "What's the difference between a Pod, Job, and CronJob in Kubernetes?"<br/>• "Why do you set both resource requests and limits — what happens if you only set one?"<br/>• "How do you pass secrets into a K8s pod without hardcoding them?"<br/>• "What is a readinessProbe and why does it matter for pipeline services?"<br/>• "How does Spark on Kubernetes differ from Spark on YARN?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate understand the difference between resource requests (scheduling) and limits (enforcement), and know how K8s Jobs vs CronJobs model batch pipeline runs — or do they think of Kubernetes as "just Docker but more complicated"?</div>
          </div>

          <p>In production, Kubernetes data engineering is resource management and workload isolation. The reason requests matter: K8s uses requests for bin-packing decisions — without requests, K8s schedules pods on any node and they fight for resources. Without limits, a runaway Spark executor consumes all memory and OOMKills other workloads on the node. K8s Job (not Pod) is the correct abstraction for batch pipelines: restartPolicy: OnFailure automatically retries failed pods; a bare Pod with restartPolicy: Never leaves you debugging why your ETL silently didn't retry. Secrets are injected via secretKeyRef — never hardcoded in YAML.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"Requests for scheduling guarantee, limits for OOMKill protection. Set both — without requests K8s can't bin-pack; without limits one runaway job starves the node."</td></tr>
              <tr><td>2</td><td>"K8s Job for batch pipelines — restartPolicy: OnFailure retries. CronJob wraps Job with a cron schedule. Never use bare Pod for batch."</td></tr>
              <tr><td>3</td><td>"Secrets via secretKeyRef — K8s API serves the secret at pod startup. Never hardcode passwords in YAML (committed to Git)."</td></tr>
              <tr><td>4</td><td>"KubernetesPodOperator in Airflow: each task runs in its own pod — isolated dependencies, separate resource limits, no Airflow worker memory leaks."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Spotify:</strong> Spark pipelines run as K8s Jobs on dedicated node pools with resource limits. Executor memory limit: 8Gi — OOMKill before starving co-located dbt pods. Job-level parallelism=50 fan-out for partition processing.<br/><strong>Shopify:</strong> KubernetesPodOperator for all Airflow pipeline tasks. Each task runs in its own pod with isolated pip environment — dependency conflicts between ETL tasks eliminated completely.<br/><strong>LinkedIn:</strong> CronJob YAML for hourly metrics pipelines — K8s manages the schedule, retries, and history. schedule: '0 * * * *' replaces fragile cron entries that can silently stop running.</div>
          </div>

          <K8sDiagram />
          <K8sAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Resource requests vs limits:</strong> Requests are what K8s uses for scheduling (guaranteed capacity). Limits are the hard cap (exceeding CPU is throttled; exceeding memory triggers OOMKill). Always set both  -  without requests, K8s cannot bin-pack pods; without limits, a runaway Spark job can starve other workloads on the node.</div>
          </div>

          <CodeBlock lang="yaml">{`# ── Core Kubernetes concepts for data engineering ────────────────────────────

# ── 1. Pod: smallest deployable unit ─────────────────────────────────────────
apiVersion: v1
kind: Pod
metadata:
  name: dbt-run-pod
  namespace: data-pipelines
  labels:
    app: dbt
    team: data-engineering
spec:
  restartPolicy: Never    # for batch jobs  -  don't restart on completion
  containers:
    - name: dbt
      image: my-registry/dbt-pipeline:1.0.0
      command: ["dbt", "run", "--profiles-dir", "/config"]
      resources:
        requests:
          memory: "2Gi"
          cpu: "500m"     # 500 millicores = 0.5 CPU
        limits:
          memory: "4Gi"
          cpu: "2000m"    # 2 CPUs max
      env:
        - name: DBT_TARGET
          value: "prod"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials    # reference a K8s Secret
              key: password
      volumeMounts:
        - name: dbt-profiles
          mountPath: /config
          readOnly: true
        - name: output-data
          mountPath: /app/output
  volumes:
    - name: dbt-profiles
      configMap:
        name: dbt-profiles-config    # non-sensitive config
    - name: output-data
      persistentVolumeClaim:
        claimName: pipeline-output-pvc

---
# ── 2. ConfigMap: non-sensitive configuration ─────────────────────────────────
apiVersion: v1
kind: ConfigMap
metadata:
  name: dbt-profiles-config
  namespace: data-pipelines
data:
  profiles.yml: |
    my_project:
      target: "{{ env_var('DBT_TARGET') }}"
      outputs:
        prod:
          type: snowflake
          account: myaccount.us-east-1
          database: PROD_DB
          schema: analytics
          warehouse: COMPUTE_WH
          role: DBT_ROLE

---
# ── 3. Secret: sensitive config (base64-encoded in etcd) ──────────────────────
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: data-pipelines
type: Opaque
data:
  password: cGFzc3dvcmQxMjM=   # base64("password123")  -  use Sealed Secrets in prod
  username: ZGF0YV91c2Vy

---
# ── 4. PersistentVolumeClaim: request storage ─────────────────────────────────
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pipeline-output-pvc
  namespace: data-pipelines
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: standard-ssd
  resources:
    requests:
      storage: 100Gi

---
# ── 5. Job: run-to-completion workload ────────────────────────────────────────
apiVersion: batch/v1
kind: Job
metadata:
  name: daily-etl-2024-01-15
  namespace: data-pipelines
spec:
  backoffLimit: 3           # retry up to 3 times on failure
  ttlSecondsAfterFinished: 86400  # auto-delete after 24h
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: etl-job
          image: my-registry/etl-pipeline:1.2.0
          args: ["--date", "2024-01-15", "--env", "prod"]
          resources:
            requests: { memory: "8Gi", cpu: "2000m" }
            limits: { memory: "16Gi", cpu: "4000m" }`}</CodeBlock>

          <CodeBlock lang="python">{`# ── Running Spark on Kubernetes ───────────────────────────────────────────────
# spark-submit with K8s master  -  Spark creates driver pod, then executor pods dynamically

# spark-submit command (run from CI/CD or Airflow)
spark_submit_cmd = """
spark-submit \\
  --master k8s://https://my-k8s-cluster:6443 \\
  --deploy-mode cluster \\
  --name my-spark-job \\
  --conf spark.kubernetes.namespace=spark-jobs \\
  --conf spark.kubernetes.container.image=my-registry/spark-app:1.0.0 \\
  --conf spark.kubernetes.authenticate.driver.serviceAccountName=spark \\
  --conf spark.executor.instances=4 \\
  --conf spark.executor.memory=4g \\
  --conf spark.executor.cores=2 \\
  --conf spark.driver.memory=2g \\
  --conf spark.dynamicAllocation.enabled=true \\
  --conf spark.dynamicAllocation.shuffleTracking.enabled=true \\
  --conf spark.dynamicAllocation.minExecutors=2 \\
  --conf spark.dynamicAllocation.maxExecutors=20 \\
  --conf spark.kubernetes.executor.request.cores=1 \\
  --conf spark.kubernetes.executor.limit.cores=2 \\
  local:///app/src/pipeline.py --date 2024-01-15
"""

# ── KubernetesPodOperator in Airflow ──────────────────────────────────────────
from airflow import DAG
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator
from kubernetes.client import models as k8s
from datetime import datetime, timedelta

with DAG(
    dag_id="daily_etl_pipeline",
    start_date=datetime(2024, 1, 1),
    schedule_interval="0 2 * * *",
    catchup=False,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=5)},
) as dag:

    run_etl = KubernetesPodOperator(
        task_id="run_etl_job",
        name="etl-pod",
        namespace="data-pipelines",
        image="my-registry/etl-pipeline:{{ var.value.etl_image_tag }}",
        cmds=["python", "-m", "src.pipeline"],
        arguments=["--date", "{{ ds }}", "--env", "prod"],
        env_vars={
            "PIPELINE_DATE": "{{ ds }}",
            "LOG_LEVEL": "INFO",
        },
        secrets=[
            k8s.V1EnvVar(
                name="DB_PASSWORD",
                value_from=k8s.V1EnvVarSource(
                    secret_key_ref=k8s.V1SecretKeySelector(name="db-creds", key="password")
                )
            )
        ],
        container_resources=k8s.V1ResourceRequirements(
            requests={"memory": "4Gi", "cpu": "1000m"},
            limits={"memory": "8Gi", "cpu": "2000m"},
        ),
        is_delete_operator_pod=True,   # clean up pod after completion
        get_logs=True,                 # stream pod logs to Airflow task logs
        in_cluster=True,               # operator runs inside the K8s cluster
        startup_timeout_seconds=300,
    )

# ── kubectl essential commands for data engineers ─────────────────────────────
# List pods in namespace
# kubectl get pods -n data-pipelines

# Follow logs of a running pipeline pod
# kubectl logs -f pod/etl-pod-abc123 -n data-pipelines

# Exec into a pod for debugging
# kubectl exec -it pod/etl-pod-abc123 -n data-pipelines -- /bin/bash

# Describe a pod (events, resource usage, errors)
# kubectl describe pod etl-pod-abc123 -n data-pipelines

# Apply a manifest
# kubectl apply -f k8s/job-daily-etl.yaml

# Check resource usage (requires metrics-server)
# kubectl top pods -n data-pipelines
# kubectl top nodes

# Delete completed jobs
# kubectl delete jobs --field-selector status.successful=1 -n data-pipelines`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I deploy pipelines as bare Pods with restartPolicy: Never"</td><td>"K8s Job with restartPolicy: OnFailure — Job controller retries failed pods automatically. CronJob for scheduled pipelines — K8s manages schedule, history, and retries"</td></tr>
              <tr><td>"I don't set resource limits because I'm not sure how much the pipeline needs"</td><td>"Always set requests and limits. Requests for scheduling guarantee (K8s won't place pod on a node with less). Limits for isolation — a runaway job OOMKills only itself, not neighbor pods"</td></tr>
              <tr><td>"I hardcode the DB password in the YAML env block"</td><td>"secretKeyRef — K8s Secret injected at pod startup. YAML is committed to Git; secrets should never appear in YAML or environment block inline values"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-k8s" questions={[
            { question: "A K8s pod has memory request: 4Gi and memory limit: 8Gi. The pipeline consumes 9Gi. What does Kubernetes do?", options: ["The pod is evicted gracefully and rescheduled on a node with more memory", "The container is OOMKilled — Linux kernel terminates the process because it exceeded the memory limit", "The memory limit is automatically increased to match actual usage", "K8s throttles memory access to stay at the 8Gi limit"], correct: 1 },
            { question: "K8s Job vs a bare Pod for a batch data pipeline — what critical operational behavior does Job add?", options: ["Job provides a built-in web UI for monitoring pipeline progress", "Job tracks completion and retry policy — restartPolicy: OnFailure retries failed pods; completions/parallelism controls fan-out. A bare Pod with restartPolicy: Never just stops", "Job is faster because it uses a separate scheduler than regular pods", "Job automatically scales based on CPU utilization via HPA"], correct: 1 },
            { question: "Airflow KubernetesPodOperator vs PythonOperator — a pipeline task requires psycopg2==2.9.9 but the Airflow worker has psycopg2==2.8.0. Which operator handles this without reinstalling on the Airflow worker?", options: ["PythonOperator — set the PYTHONPATH environment variable to override the version", "Neither — dependency conflicts require rebuilding the Airflow worker image", "KubernetesPodOperator — the task runs in its own container with its own psycopg2==2.9.9 image, isolated from the Airflow worker environment", "PythonOperator with a virtualenv_callable wrapper resolves the conflict automatically"], correct: 2 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use K8s Job for batch pipelines — automatic retry, completion tracking</li>
                <li>Set both resource requests and limits — scheduling + OOMKill protection</li>
                <li>Inject secrets via secretKeyRef — never hardcode in YAML</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Run batch pipeline logic in bare Pods — no retry, no completion tracking</li>
                <li>Set limits without requests or requests without limits — incomplete resource spec</li>
                <li>Hardcode credentials in YAML or ConfigMap — committed to Git, visible in etcd</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-k8s')) { await unmarkTopicComplete('py-k8s'); onUnmark('py-k8s') } else { await markTopicComplete('py-k8s'); onComplete('py-k8s') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-k8s') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-k8s') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-deequ ──────────────────────────────────────────────────── */}
        <section id="py-deequ" ref={el => { if (el) sectionRefs.current['py-deequ'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Data Quality with Deequ + Great Expectations</h1>
            <p className="topic-desc">Data quality (DQ) validation is a critical gate in production data pipelines. Amazon Deequ (open source, Spark-native) and Great Expectations (Python-native, multi-engine) are the two leading frameworks. They let you define constraints on your data, run them as part of your pipeline, and fail fast when data violates your contracts  -  before bad data reaches downstream consumers.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "How do you prevent bad data from reaching downstream consumers?"<br/>• "What's the difference between Deequ and Great Expectations?"<br/>• "How would you define a data quality check for a primary key constraint?"<br/>• "What does 'fail fast' mean in the context of data pipelines?"<br/>• "How do you handle DQ failures — quarantine, alert, or stop the pipeline?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate design DQ as a pipeline gate that fails early before bad data propagates — or do they check data quality as an afterthought in a separate monitoring job hours after bad data has already reached the data warehouse?</div>
          </div>

          <p>In production, data quality is a pipeline architecture decision. The reason fail-fast DQ matters: a 2% null rate in order_id discovered in the Silver layer costs an hour of cleanup; the same error discovered in the Gold layer (after 6 downstream joins) costs a day of backfill plus executive escalation. Deequ's VerificationSuite runs as a Spark job — it computes column statistics in one pass and evaluates all constraints at once. CheckLevel.Error stops the pipeline; CheckLevel.Warning allows it to continue with an alert. Great Expectations adds profiling-based expectation generation and HTML documentation.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"DQ as a pipeline gate — run checks before writing to Silver/Gold layers. Fail the pipeline, quarantine bad records, alert the on-call."</td></tr>
              <tr><td>2</td><td>"Deequ: VerificationSuite computes all metrics in one Spark pass. isComplete, isUnique, hasMin/Max — declarative constraints on column stats."</td></tr>
              <tr><td>3</td><td>"CheckLevel.Error fails the pipeline; CheckLevel.Warning continues with an alert. Design for the SLA — which failures are blocking vs advisory?"</td></tr>
              <tr><td>4</td><td>"Great Expectations: multi-engine, works on Pandas/Spark/SQL. Expectation suite = named, versioned set of checks. HTML docs from validation runs."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Amazon (Deequ origin):</strong> Deequ was built at Amazon to validate product catalog data — 3 billion items. VerificationSuite runs checks on 100M+ row Spark DataFrames in minutes as a native Spark job. Used in 100+ internal pipelines.<br/><strong>Airbnb:</strong> Great Expectations integrated into Airflow DAGs as a DQ gate. expectation suites version-controlled in Git — schema evolution tracked via expectation diffs in PRs. 5,000+ expectations across 200+ tables.<br/><strong>Intuit:</strong> DQ framework quarantines failed records to a DQ_REJECT table with failure reason and timestamp. Pipeline continues with valid records, operations team reviews rejects daily. Zero silent bad data in Gold layer since adoption.</div>
          </div>

          <DataQualityPyDiagram />
          <DataQualityPyAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>DQ framework comparison:</strong> Deequ = Spark-native, Scala/Python API, deep Spark integration (runs as a Spark job). Great Expectations = Python-native, multi-engine (Pandas/Spark/SQL), rich HTML docs, built for CI/CD. Soda = SQL-first, cloud-native. dbt tests = embedded in dbt models. For large-scale Spark pipelines, Deequ. For multi-engine platforms, Great Expectations.</div>
          </div>

          <CodeBlock lang="python">{`# ── Amazon Deequ: data quality on Spark ──────────────────────────────────────
# pip install pydeequ
from pyspark.sql import SparkSession
import pydeequ
from pydeequ.checks import Check, CheckLevel
from pydeequ.verification import VerificationSuite, VerificationResult
from pydeequ.analyzers import AnalysisRunner, Completeness, Uniqueness, Mean, Minimum, Maximum

spark = SparkSession.builder \
    .appName("DataQuality") \
    .config("spark.jars.packages", pydeequ.deequ_maven_coord) \
    .getOrCreate()

df = spark.read.parquet("s3://warehouse/silver/orders/")

# ── 1. VerificationSuite: define and run checks ───────────────────────────────
check = Check(spark, CheckLevel.Error, "OrdersDataQuality")

verification_result = VerificationSuite(spark) \
    .onData(df) \
    .addCheck(
        check
        # Completeness: no nulls in critical fields
        .isComplete("order_id")
        .isComplete("customer_id")
        .isComplete("order_date")
        # Uniqueness: order_id must be a primary key
        .isUnique("order_id")
        # Non-negative values
        .isNonNegative("amount")
        .isNonNegative("quantity")
        # Range checks
        .hasMin("amount", lambda val: val >= 0.01, "Amount must be at least 1 cent")
        .hasMax("amount", lambda val: val <= 100_000, "Amount must not exceed 100k")
        # Completeness with threshold: at least 99% of rows have email
        .hasCompleteness("email", lambda pct: pct >= 0.99, "Email completeness < 99%")
        # Uniqueness with threshold: order_id must be 100% unique
        .hasUniqueness("order_id", lambda uniq: uniq == 1.0, "order_id is not unique")
        # Custom SQL constraint
        .satisfies(
            "amount > 0 AND quantity > 0",
            "positive_financials",
            lambda frac: frac >= 1.0   # 100% of rows must satisfy
        )
        # Enum check: status must be one of known values
        .isContainedIn("status", ["pending", "confirmed", "shipped", "delivered", "cancelled"])
        # Pattern check: order_id matches ORD-XXXXXX
        .containsURL("website_url")
    ) \
    .run()

# ── 2. Inspect results ────────────────────────────────────────────────────────
result_df = VerificationResult.checkResultsAsDataFrame(spark, verification_result)
result_df.show(truncate=False)

# Overall status: SUCCESS or ERROR
if verification_result.status == "Error":
    failed = result_df.filter("check_status = 'Error'")
    failed.show(truncate=False)
    raise ValueError(f"Data quality checks failed! See above for details.")

# ── 3. Analyzers: compute metrics without pass/fail ──────────────────────────
analysis_result = AnalysisRunner(spark) \
    .onData(df) \
    .addAnalyzer(Completeness("email")) \
    .addAnalyzer(Uniqueness(["order_id"])) \
    .addAnalyzer(Mean("amount")) \
    .addAnalyzer(Minimum("amount")) \
    .addAnalyzer(Maximum("amount")) \
    .run()

metrics_df = analysis_result.allMetrics()
metrics_df.show(truncate=False)

# ── 4. Constraint suggestions (automatic DQ rule generation) ──────────────────
from pydeequ.suggestions import ConstraintSuggestionRunner, DEFAULT_RULES

suggestions = ConstraintSuggestionRunner(spark) \
    .onData(df) \
    .addConstraintRules(DEFAULT_RULES) \
    .run()

# Print auto-generated Deequ constraints from data profiling
for s in suggestions["constraint_suggestions"]:
    print(f"Column: {s['column_name']}, Suggestion: {s['description']}")
    print(f"  Code: {s['code_for_constraint']}")`}</CodeBlock>

          <CodeBlock lang="python">{`# ── Great Expectations: multi-engine data validation ─────────────────────────
# pip install great-expectations
import great_expectations as gx
from great_expectations.core.batch import RuntimeBatchRequest
import pandas as pd

# ── 1. Create/load a DataContext ──────────────────────────────────────────────
context = gx.get_context()  # reads great_expectations.yml in current dir

# ── 2. Define expectations on a Pandas DataFrame ─────────────────────────────
df = pd.read_parquet("s3://warehouse/silver/orders/sample.parquet")

# Create a batch and validator
validator = context.sources.pandas_default.read_dataframe(
    dataframe=df,
    asset_name="orders",
)

# Define expectations
validator.expect_column_to_exist("order_id")
validator.expect_column_values_to_not_be_null("order_id")
validator.expect_column_values_to_be_unique("order_id")
validator.expect_column_values_to_not_be_null("customer_id")
validator.expect_column_values_to_be_between("amount", min_value=0.01, max_value=100_000)
validator.expect_column_values_to_be_in_set(
    "status",
    value_set=["pending", "confirmed", "shipped", "delivered", "cancelled"]
)
validator.expect_column_value_lengths_to_be_between("order_id", min_value=8, max_value=20)
validator.expect_column_values_to_match_regex("order_id", r"^ORD-\d{6}$")
validator.expect_column_mean_to_be_between("amount", min_value=10.0, max_value=5000.0)
validator.expect_table_row_count_to_be_between(min_value=1, max_value=10_000_000)

# Save the ExpectationSuite
validator.save_expectation_suite(discard_failed_expectations=False)

# ── 3. Run a Checkpoint (validates + generates DataDocs HTML report) ──────────
checkpoint_result = context.run_checkpoint(
    checkpoint_name="orders_daily_checkpoint",
    validations=[{"batch_request": {"datasource_name": "orders_source"}}],
)

if not checkpoint_result.success:
    raise ValueError("Great Expectations checkpoint failed  -  see DataDocs for details")

# Generate and open DataDocs (HTML report)
context.open_data_docs()
# Opens browser: http://localhost:8100/local_site/index.html

# ── 4. Using GE in a production Airflow DAG ───────────────────────────────────
from airflow.decorators import task

@task
def validate_data_quality(execution_date: str) -> None:
    import great_expectations as gx
    context = gx.get_context(context_root_dir="/opt/airflow/great_expectations")
    result = context.run_checkpoint(
        checkpoint_name="daily_orders_checkpoint",
        batch_request={"runtime_parameters": {"path": f"s3://warehouse/silver/orders/dt={execution_date}/"}},
    )
    if not result.success:
        failed_expectations = [
            str(v)
            for v in result.list_validation_results()
            if not v.success
        ]
        raise ValueError(f"DQ validation failed: {failed_expectations}")

# ── 5. Framework comparison table ────────────────────────────────────────────
# | Feature              | Deequ         | Great Expectations | Soda     | dbt tests  |
# |----------------------|---------------|--------------------|----------|------------|
# | Engine               | Spark         | Pandas/Spark/SQL   | SQL      | SQL (dbt)  |
# | Language             | Python/Scala  | Python             | YAML/SQL | YAML/SQL   |
# | HTML Reports         | No            | Yes (DataDocs)     | Yes      | No         |
# | CI/CD Integration    | Good          | Excellent          | Good     | Excellent  |
# | Constraint Suggestions| Yes          | No                 | No       | No         |
# | Cloud Metadata Store | S3 metrics    | Various backends   | Soda Cloud| dbt Cloud  |
# | Best For             | Large-scale   | Multi-engine       | SQL DW   | dbt projects|
# |                      | Spark DQ      | data platforms     | validation|            |`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I check data quality with a few assert statements at the end of the pipeline"</td><td>"DQ gate before Silver write: VerificationSuite runs all constraints in one Spark pass. CheckLevel.Error fails the pipeline before bad data propagates downstream"</td></tr>
              <tr><td>"I use Great Expectations for everything"</td><td>"Deequ for large-scale Spark pipelines — it's a native Spark job. Great Expectations for multi-engine platforms (Pandas/SQL). Pick based on your execution engine"</td></tr>
              <tr><td>"I alert the team when DQ checks fail and they fix it manually"</td><td>"Quarantine pattern: valid records proceed, failed records go to DQ_REJECT table with failure reason + timestamp. Pipeline continues; ops team reviews rejects"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-deequ" questions={[
            { question: "Your orders pipeline DQ check finds 0.8% null order_ids (within SLA tolerance) and 12% null discount_codes (expected — not all orders have discounts). How should CheckLevel be configured for each?", options: ["Both CheckLevel.Error — any null in any field is unacceptable", "order_id: CheckLevel.Error (primary key must be 100% complete); discount_code: CheckLevel.Warning (high null rate is expected — alert but don't block)", "Both CheckLevel.Warning — blocking pipelines for DQ is too disruptive", "Neither — null rate checks belong in monitoring dashboards, not pipeline code"], correct: 1 },
            { question: "Deequ vs Great Expectations — you're running DQ on a 500M row Spark DataFrame. Which framework is more appropriate and why?", options: ["Great Expectations — it has better documentation and a larger community", "Deequ — it runs natively as a Spark job, computing column statistics in one distributed pass. Great Expectations running against Spark adds serialization overhead", "They have identical performance on Spark DataFrames", "Neither — DQ on 500M rows should use SQL assertions in the data warehouse"], correct: 1 },
            { question: "What is the 'fail fast' principle in DQ pipeline design?", options: ["Pipelines should complete as quickly as possible even with bad data", "DQ checks run before writing to downstream layers — fail the pipeline early so bad data doesn't propagate through Bronze→Silver→Gold and corrupt downstream consumers", "Pipeline errors should immediately restart the pipeline without alerting", "DQ should only run in development, not production, to avoid latency"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Run DQ checks as a pipeline gate before writing to Silver/Gold layers</li>
                <li>Use CheckLevel.Error for primary keys and critical fields; CheckLevel.Warning for advisory metrics</li>
                <li>Quarantine bad records with failure reason — pipeline continues, rejects are reviewable</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Run DQ checks after writing to the data warehouse — bad data has already propagated</li>
                <li>Use assert statements for production DQ — no threshold support, no reporting, no audit trail</li>
                <li>Fail the entire pipeline for advisory DQ issues (high null rate in optional fields) — use CheckLevel.Warning instead</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-deequ')) { await unmarkTopicComplete('py-deequ'); onUnmark('py-deequ') } else { await markTopicComplete('py-deequ'); onComplete('py-deequ') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-deequ') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-deequ') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-memory ─────────────────────────────────────────────────── */}
        <section id="py-memory" ref={el => { if (el) sectionRefs.current['py-memory'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Python Memory Profiling</h1>
            <p className="topic-desc">Memory bugs in data pipelines are insidious  -  a pipeline that works on 100 MB of data crashes on 10 GB. Python's built-in tracemalloc, the memory_profiler library, and objgraph give you progressively deeper visibility into what is consuming memory. Mastering memory-efficient patterns (streaming, generators, chunked reads, explicit deletion) is what separates production-grade DE code from fragile notebook scripts.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>• "Your pipeline OOMKills on large datasets. How do you diagnose and fix it?"<br/>• "What is tracemalloc and how do you use it?"<br/>• "How do Python generators help with memory efficiency?"<br/>• "What's the difference between a pandas view and a copy — and why does it matter for memory?"<br/>• "How do you detect a memory leak in a long-running pipeline?"</div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>Does the candidate know how to profile memory usage to find the specific line causing OOMKill, and apply streaming/generator patterns to fix it — or do they just "add more memory to the pod" without understanding the root cause?</div>
          </div>

          <p>In production, memory OOMKills are a pipeline architecture problem, not a hardware problem. The reason tracemalloc matters is that it tells you exactly which line allocated the most memory — not a guess. Take a snapshot before and after a batch iteration: the delta shows what's accumulating. Generators solve memory growth by yielding one record at a time rather than materializing the full list. pd.read_csv(chunksize=) keeps memory flat for large files. Explicit del + gc.collect() releases large intermediate DataFrames that Python's refcount hasn't freed yet.</p>

          <table>
            <thead><tr><th>Step</th><th>What to say / do</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>"tracemalloc: start(), run the suspect code, take_snapshot().statistics('lineno') — shows which file/line holds the most memory."</td></tr>
              <tr><td>2</td><td>"Compare snapshots across loop iterations — growing delta = memory leak. The leaked objects accumulate between iterations."</td></tr>
              <tr><td>3</td><td>"Fix: generators instead of lists, chunksize reading, explicit del df_intermediate; gc.collect() after large allocations."</td></tr>
              <tr><td>4</td><td>"Pandas Copy-on-Write (v2+): df[condition] creates a copy. Chain transforms with .assign() to minimize intermediate DataFrame copies."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/><strong>Uber:</strong> Batch pipeline OOMKilling at 8GB (pod limit 8Gi). tracemalloc identified a list comprehension accumulating all intermediate transform results in memory. Replacing with a generator reduced peak memory from 8GB to 340MB — 24x reduction on the same dataset.<br/><strong>Airbnb:</strong> Long-running pipeline worker developed a memory leak — RSS grew 50MB per hour. objgraph.show_growth() identified unclosed SQLAlchemy connection objects being held in a global cache. Fixed in one PR with explicit connection.close() in finally block.<br/><strong>Snowflake Python SDK:</strong> Customer pipeline: tracemalloc snapshot comparison between batch iterations showed 200MB accumulating per iteration. Root cause: appending to a growing list instead of yielding from a generator. Migration to generator pattern: flat memory regardless of batch count.</div>
          </div>

          <MemoryProfileDiagram />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Pandas copies vs views:</strong> Operations like <code>df[df['col'] &gt; 0]</code> and <code>df.loc[...]</code> may return a view (no copy) or a copy (doubled memory). After Pandas 2.0 with Copy-on-Write (CoW), assignments always create copies. Use <code>df.query()</code>, <code>df.assign()</code> and chain transformations to minimise intermediate copies. For very large data, use chunked reads with <code>pd.read_csv(chunksize=N)</code>.</div>
          </div>

          <CodeBlock lang="python">{`# ── tracemalloc: built-in memory tracing ─────────────────────────────────────
import tracemalloc
import linecache

# ── 1. Basic: find top memory consumers ──────────────────────────────────────
tracemalloc.start()

# ... run your pipeline code here ...
import pandas as pd
df = pd.read_parquet("s3://warehouse/silver/orders/large_partition.parquet")
df_filtered = df[df["amount"] > 0]          # may create a copy
df_enriched = df_filtered.assign(           # assign creates a new DataFrame
    amount_usd=df_filtered["amount"] / 100
)

snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics("lineno")

print("=== Top 10 memory consumers ===")
for stat in top_stats[:10]:
    print(f"{stat}")
# Output: pipeline.py:12: size=245.3 MiB, count=3, average=81.8 MiB

# ── 2. Compare snapshots: find memory leak between two points ─────────────────
tracemalloc.start()

snapshot1 = tracemalloc.take_snapshot()

# Run one iteration of your pipeline
process_batch(get_next_batch())

snapshot2 = tracemalloc.take_snapshot()

# Show what was allocated between snapshot1 and snapshot2
top_stats = snapshot2.compare_to(snapshot1, "lineno")
print("=== Memory delta ===")
for stat in top_stats[:5]:
    print(f"{stat}")
# net_allocated_MiB shows what grew  -  hints at leaks

# ── 3. Filter to just your application code ───────────────────────────────────
filters = [
    tracemalloc.Filter(True, "*/src/pipeline.py"),    # include your code
    tracemalloc.Filter(False, "<frozen importlib*>"),  # exclude stdlib internals
    tracemalloc.Filter(False, "<unknown>"),
]
filtered_stats = snapshot.filter_traces(filters).statistics("lineno")
for stat in filtered_stats[:10]:
    frame = stat.traceback[0]
    print(f"  {frame.filename}:{frame.lineno}: {stat.size / 1024 / 1024:.2f} MiB")`}</CodeBlock>

          <CodeBlock lang="python">{`# ── memory_profiler: line-by-line memory usage ───────────────────────────────
# pip install memory-profiler psutil
from memory_profiler import profile
import pandas as pd

@profile  # adds per-line MiB delta to the output
def load_and_process_orders(path: str) -> pd.DataFrame:
    # Line 1: read full Parquet file
    df = pd.read_parquet(path)                            # +245 MiB

    # Line 2: filter  -  may create a copy (pre-CoW)
    df_active = df[df["status"] == "confirmed"]           # +122 MiB (copy)

    # Line 3: original df still referenced → both in memory
    df_enriched = df_active.assign(
        discount_ratio=df_active["discount"] / df_active["amount"]
    )                                                      # +62 MiB

    # Release intermediate DataFrames early
    del df, df_active                                     # -367 MiB freed
    import gc
    gc.collect()

    return df_enriched

# Run to see output:
# Line 12: 245.3 MiB  +245.3 MiB  df = pd.read_parquet(path)
# Line 15: 367.4 MiB  +122.1 MiB  df_active = df[df["status"] == "confirmed"]
# ...

# ── mprof: time-series memory profiling ──────────────────────────────────────
# Run from CLI:
# mprof run python pipeline.py
# mprof plot                   → opens matplotlib chart of RSS over time
# mprof run --include-children python -m spark_job  → include child processes

# ── objgraph: find reference cycles ──────────────────────────────────────────
# pip install objgraph
import objgraph

# Show the 10 most common types in memory
objgraph.show_most_common_types(limit=10)
# dict      3421
# list      2847
# function  1200
# DataFrame   42

# Find what's holding a reference to a large object (prevents GC)
objgraph.show_backrefs(large_df, max_depth=3, filename="backrefs.png")

# Count growth between two points (memory leak detection)
objgraph.get_leaking_objects()

# ── Common DE memory anti-patterns and fixes ──────────────────────────────────
import pandas as pd

# ❌ ANTI-PATTERN 1: reading an entire large file into memory
df = pd.read_csv("s3://bucket/large_events.csv")  # 50 GB → OOM

# ✅ FIX: chunked reading
chunk_size = 100_000
result_chunks = []
for chunk in pd.read_csv("s3://bucket/large_events.csv", chunksize=chunk_size):
    processed = chunk[chunk["amount"] > 0].assign(amount_usd=chunk["amount"] / 100)
    result_chunks.append(processed)
    del chunk  # free each chunk after processing
final_df = pd.concat(result_chunks, ignore_index=True)

# ❌ ANTI-PATTERN 2: accumulating all records in a list
all_records = []
for file in parquet_files:
    all_records.extend(pd.read_parquet(file).to_dict("records"))  # explodes memory

# ✅ FIX: process and write each file immediately
for file in parquet_files:
    df = pd.read_parquet(file)
    write_to_delta(df)
    del df
    import gc; gc.collect()

# ❌ ANTI-PATTERN 3: retaining large intermediate DataFrames in long-running code
def run_pipeline():
    raw = extract()          # 4 GB
    validated = validate(raw)  # another 4 GB  -  raw still referenced!
    transformed = transform(validated)
    # raw and validated are still in memory while transform runs → 12 GB peak

# ✅ FIX: explicit deletion of intermediate results
def run_pipeline():
    raw = extract()
    validated = validate(raw)
    del raw; import gc; gc.collect()          # free 4 GB before transform
    transformed = transform(validated)
    del validated; gc.collect()               # free 4 GB before load
    load(transformed)

# ── Best practice: use generators instead of lists for large pipelines ─────────
def iter_records(parquet_files: list[str]):
    """Stream records from multiple files without loading all into memory."""
    for f in parquet_files:
        df = pd.read_parquet(f)
        yield from df.itertuples(index=False)  # one row at a time
        del df

total = sum(row.amount for row in iter_records(parquet_files))  # O(1) memory`}</CodeBlock>

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"The pod keeps OOMKilling, I'll just bump the memory limit to 16Gi"</td><td>"tracemalloc first — take snapshots before and after the suspect code, find the specific line. Fix the root cause (generator vs list, chunksize vs full read) before scaling resources"</td></tr>
              <tr><td>"I build the full results list and return it"</td><td>"yield instead of append/return. Generators keep memory flat — caller consumes one record at a time rather than all N records in memory simultaneously"</td></tr>
              <tr><td>"Python's garbage collector handles memory automatically"</td><td>"Reference cycles aren't freed by refcounting — gc.collect() after del large_df forces collection. Critical in long-running workers processing thousands of batches"</td></tr>
            </tbody>
          </table>

          <Quiz topicId="py-memory" questions={[
            { question: "tracemalloc.take_snapshot().compare_to(snapshot1, 'lineno') in a pipeline loop shows 200MB growing each iteration. What does this mean?", options: ["The pipeline is processing 200MB more data each iteration — expected behavior", "Python's garbage collector is deferred and will clean up at the end", "An object allocated at a specific source line is not being released between iterations — this is a memory leak pattern", "tracemalloc's overhead itself consumes 200MB per snapshot"], correct: 2 },
            { question: "A function returns list(process(record) for record in load_all_records()). load_all_records() loads 10M records into memory. How do you fix the memory profile?", options: ["Use a ThreadPoolExecutor — parallel processing reduces peak memory", "Make load_all_records() a generator (yield instead of return/append) and the caller iterates lazily — memory stays flat regardless of record count", "Use pd.read_csv(chunksize=10_000) — this applies to all Python iterables", "Use __slots__ on the record object to reduce per-object memory overhead"], correct: 1 },
            { question: "A long-running pipeline worker processes batches in a loop. After 500 batches, RSS is 4GB but the current batch is only 10MB. What should you do?", options: ["Restart the worker every 500 batches using a cron job", "Use objgraph.show_growth() to find which object types are accumulating, then fix the root cause (unclosed connections, growing caches, reference cycles)", "Increase the pod memory limit to 8Gi — this is expected behavior for long-running workers", "Use sys.getsizeof() on each batch to identify the largest objects"], correct: 1 },
          ]} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Profile with tracemalloc before adding memory — fix root cause, not symptoms</li>
                <li>Use generators for large sequences — yield keeps memory flat regardless of count</li>
                <li>del large_df; gc.collect() after large intermediate allocations in long-running loops</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Blindly increase pod memory limits without profiling the root cause</li>
                <li>Build large lists when a generator would do — list materializes all items, generator yields one at a time</li>
                <li>Ignore growing RSS in long-running workers — memory leaks compound over thousands of batches</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('py-memory')) { await unmarkTopicComplete('py-memory'); onUnmark('py-memory') } else { await markTopicComplete('py-memory'); onComplete('py-memory') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('py-memory') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-memory') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

      </main>
    </div>
  )
}

// ─────────────────────────────────────────────── PYTHON DIAGRAM COMPONENTS ──

function GILDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">GIL — Global Interpreter Lock</text>
        {['Thread 1','Thread 2','Thread 3'].map((t,i)=>(
          <g key={t}>
            <rect x="10" y={20+i*22} width="80" height="16" rx="3" fill="#4f8ef7" opacity=".2" stroke="#4f8ef7" strokeWidth="1"/>
            <text x="50" y={32+i*22} fontSize="8" fill="#4f8ef7" textAnchor="middle">{t}</text>
            {[0,1,2,3,4].map(s=>(
              <rect key={s} x={100+s*72} y={20+i*22} width={s===i*2%5?60:20} height="16" rx="2"
                fill={s===i*2%5?'#22c55e':'#ef4444'} opacity={s===i*2%5?.4:.12}/>
            ))}
          </g>
        ))}
        <text x="100" y="82" fontSize="7.5" fill="#22c55e">Green = holds GIL (runs Python bytecode)</text>
        <text x="260" y="82" fontSize="7.5" fill="#ef4444">Red = waiting for GIL</text>
      </svg>
    </div>
  )
}

function TypeHintsDiagram() {
  const hints = [
    {code:'x: int = 42',type:'int',color:'#4f8ef7'},
    {code:'name: str = "hi"',type:'str',color:'#22c55e'},
    {code:'flag: bool = True',type:'bool',color:'#f59e0b'},
    {code:'items: list[int]',type:'list[int]',color:'#8b5cf6'},
    {code:'data: dict[str,Any]',type:'dict',color:'#ef4444'},
    {code:'result: Optional[int]',type:'int|None',color:'#ec4899'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 100" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Type Hints — Static Annotations</text>
        {hints.map((h,i)=>(
          <g key={h.code}>
            <rect x={4+(i%3)*158} y={18+Math.floor(i/3)*38} width="150" height="30" rx="4" fill={h.color} opacity=".1" stroke={h.color} strokeWidth="1.2"/>
            <text x={14+(i%3)*158} y={32+Math.floor(i/3)*38} fontSize="8.5" fontFamily="monospace" fill="#1e293b">{h.code}</text>
            <text x={14+(i%3)*158} y={43+Math.floor(i/3)*38} fontSize="8" fill={h.color}>type: {h.type}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DataStructuresDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 85" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Python Data Structures Comparison</text>
        {[
          {name:'list',props:'ordered, mutable, dupes ok',ops:'O(1) append, O(n) search',color:'#4f8ef7'},
          {name:'dict',props:'key→value, insertion-ordered',ops:'O(1) get/set/del',color:'#22c55e'},
          {name:'set',props:'unordered, unique values only',ops:'O(1) add/remove/in',color:'#8b5cf6'},
          {name:'tuple',props:'ordered, immutable',ops:'O(1) index, hashable',color:'#f59e0b'},
        ].map((s,i)=>(
          <g key={s.name}>
            <rect x={4+i*118} y="18" width="112" height="52" rx="5" fill={s.color} opacity=".1" stroke={s.color} strokeWidth="1.2"/>
            <text x={60+i*118} y="32" fontSize="10" fontWeight="800" fill={s.color} textAnchor="middle">{s.name}</text>
            <text x={60+i*118} y="44" fontSize="7" fill="#475569" textAnchor="middle">{s.props}</text>
            <text x={60+i*118} y="56" fontSize="7.5" fontWeight="600" fill="#1e293b" textAnchor="middle">{s.ops}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function ComprehensionDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Comprehensions — Compact Iteration</text>
        {[
          {label:'List',code:'[x*2 for x in range(5)]',result:'[0,2,4,6,8]',color:'#4f8ef7'},
          {label:'Dict',code:'{k:v for k,v in d.items()}',result:'{k:v, ...}',color:'#22c55e'},
          {label:'Set',code:'{x%3 for x in range(6)}',result:'{0,1,2}',color:'#8b5cf6'},
          {label:'Generator',code:'(x**2 for x in data)',result:'lazy iterator',color:'#f59e0b'},
        ].map((c,i)=>(
          <g key={c.label}>
            <rect x={4+(i%2)*238} y={18+Math.floor(i/2)*34} width="228" height="26" rx="4" fill={c.color} opacity=".1" stroke={c.color} strokeWidth="1.2"/>
            <text x={14+(i%2)*238} y={29+Math.floor(i/2)*34} fontSize="8.5" fontWeight="700" fill={c.color}>{c.label}:  </text>
            <text x={60+(i%2)*238} y={29+Math.floor(i/2)*34} fontSize="8.5" fontFamily="monospace" fill="#1e293b">{c.code}</text>
            <text x={14+(i%2)*238} y={40+Math.floor(i/2)*34} fontSize="8" fill="#475569">→ {c.result}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function FunctionsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">functools — Higher-Order Tools</text>
        {[
          {fn:'partial(f, arg)',desc:'Pre-fill arguments → new fn',color:'#4f8ef7'},
          {fn:'reduce(f, seq)',desc:'Left-fold sequence to 1 value',color:'#22c55e'},
          {fn:'lru_cache(maxsize)',desc:'Memoize fn results (in-memory)',color:'#8b5cf6'},
          {fn:'wraps(fn)',desc:'Preserve metadata in decorators',color:'#f59e0b'},
          {fn:'total_ordering',desc:'Auto-fill comparison methods',color:'#ef4444'},
          {fn:'cache',desc:'lru_cache with no size limit',color:'#ec4899'},
        ].map((f,i)=>(
          <g key={f.fn}>
            <rect x={4+(i%3)*158} y={18+Math.floor(i/3)*34} width="150" height="26" rx="4" fill={f.color} opacity=".1" stroke={f.color} strokeWidth="1.1"/>
            <text x={14+(i%3)*158} y={30+Math.floor(i/3)*34} fontSize="8.5" fontWeight="700" fontFamily="monospace" fill={f.color}>{f.fn}</text>
            <text x={14+(i%3)*158} y={40+Math.floor(i/3)*34} fontSize="7.5" fill="#475569">{f.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function GeneratorDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Generator — Lazy Evaluation</text>
        <text x="4" y="26" fontSize="8.5" fill="#64748b">next() pulls one value at a time — no full list in memory</text>
        {[0,1,2,3,4].map(i=>(
          <g key={i}>
            <rect x={10+i*84} y="34" width="72" height="24" rx="4" fill={i===2?'#22c55e':'#4f8ef7'} opacity={i===2?.35:.1} stroke={i===2?'#22c55e':'#4f8ef7'} strokeWidth={i===2?2:1}/>
            <text x={46+i*84} y="43" fontSize="8" fill="#64748b" textAnchor="middle">item {i}</text>
            <text x={46+i*84} y="53" fontSize="9" fontWeight="700" fill={i===2?'#22c55e':'#1e293b'} textAnchor="middle">{i===2?'← here':'yield'}</text>
            {i<4&&<polygon points={`${82+i*84},46 ${90+i*84},42 ${90+i*84},50`} fill="#94a3b8"/>}
          </g>
        ))}
        <text x="4" y="76" fontSize="8" fill="#64748b">Regular list: all items in RAM at once. Generator: one at a time.</text>
      </svg>
    </div>
  )
}

function DecoratorDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 440 100" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Decorator Pattern</text>
        <rect x="10" y="20" width="140" height="36" rx="5" fill="#4f8ef7" opacity=".15" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="80" y="35" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">@decorator</text>
        <text x="80" y="48" fontSize="8" fill="#475569" textAnchor="middle">def my_func(): ...</text>
        <polygon points="155,38 165,34 165,42" fill="#f59e0b"/>
        <rect x="170" y="20" width="130" height="36" rx="5" fill="#8b5cf6" opacity=".15" stroke="#8b5cf6" strokeWidth="1.5"/>
        <text x="235" y="33" fontSize="8.5" fill="#8b5cf6" textAnchor="middle">wrapper()</text>
        <text x="235" y="46" fontSize="7.5" fill="#475569" textAnchor="middle">calls original fn + adds logic</text>
        <polygon points="305,38 315,34 315,42" fill="#22c55e"/>
        <rect x="320" y="20" width="110" height="36" rx="5" fill="#22c55e" opacity=".12" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="375" y="33" fontSize="8.5" fill="#22c55e" textAnchor="middle">my_func()</text>
        <text x="375" y="46" fontSize="7.5" fill="#475569" textAnchor="middle">= decorated fn</text>
        <text x="4" y="72" fontSize="8" fill="#64748b">Use cases: logging, timing, retry, auth, caching, rate-limiting</text>
      </svg>
    </div>
  )
}

function OOPDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 110" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">OOP — Class Hierarchy + Dunder Methods</text>
        <rect x="175" y="18" width="130" height="20" rx="4" fill="#4f8ef7" opacity=".2" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="240" y="32" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">class BaseIngester</text>
        {[
          {name:'class CSVIngester',x:60,color:'#22c55e'},
          {name:'class ParquetIngester',x:230,color:'#f59e0b'},
          {name:'class JSONIngester',x:380,color:'#8b5cf6'},
        ].map((c)=>(
          <g key={c.name}>
            <line x1="240" y1="38" x2={c.x+65} y2="54" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2"/>
            <rect x={c.x} y="54" width="130" height="18" rx="4" fill={c.color} opacity=".15" stroke={c.color} strokeWidth="1.2"/>
            <text x={c.x+65} y="67" fontSize="8" fontWeight="600" fill={c.color} textAnchor="middle">{c.name}</text>
          </g>
        ))}
        <text x="4" y="86" fontSize="8" fill="#64748b">Dunder methods: __init__ __repr__ __len__ __getitem__ __enter__ __exit__</text>
        <text x="4" y="98" fontSize="8" fill="#94a3b8">@dataclass auto-generates __init__, __repr__, __eq__ from field annotations</text>
      </svg>
    </div>
  )
}

function ContextManagerDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 440 85" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Context Manager — with Statement Lifecycle</text>
        {[
          {label:'__enter__',desc:'Acquire resource',color:'#22c55e'},
          {label:'body executes',desc:'Use resource safely',color:'#4f8ef7'},
          {label:'__exit__',desc:'Release (even on exception)',color:'#ef4444'},
        ].map((s,i)=>(
          <g key={s.label}>
            <rect x={10+i*140} y="20" width="128" height="42" rx="5" fill={s.color} opacity=".12" stroke={s.color} strokeWidth="1.5"/>
            <text x={74+i*140} y="36" fontSize="9" fontWeight="700" fill={s.color} textAnchor="middle">{s.label}</text>
            <text x={74+i*140} y="50" fontSize="8" fill="#475569" textAnchor="middle">{s.desc}</text>
            {i<2&&<polygon points={`${140+i*140},41 ${148+i*140},37 ${148+i*140},45`} fill={s.color} opacity=".6"/>}
          </g>
        ))}
        <text x="4" y="76" fontSize="8" fill="#64748b">with open(f) as fh: / with conn: / with tempfile.TemporaryDirectory() as d:</text>
      </svg>
    </div>
  )
}

function ErrorsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 100" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Exception Hierarchy</text>
        <rect x="190" y="18" width="100" height="16" rx="3" fill="#ef4444" opacity=".2" stroke="#ef4444" strokeWidth="1.5"/>
        <text x="240" y="30" fontSize="8.5" fontWeight="700" fill="#ef4444" textAnchor="middle">BaseException</text>
        {[{label:'Exception',x:90,color:'#f59e0b'},{label:'SystemExit',x:240,color:'#8b5cf6'},{label:'KeyboardInterrupt',x:390,color:'#64748b'}].map((e)=>(
          <g key={e.label}>
            <line x1="240" y1="34" x2={e.x} y2="50" stroke="#94a3b8" strokeWidth="1"/>
            <rect x={e.x-50} y="50" width="100" height="14" rx="3" fill={e.color} opacity=".15" stroke={e.color} strokeWidth="1"/>
            <text x={e.x} y="61" fontSize="7.5" fill={e.color} textAnchor="middle">{e.label}</text>
          </g>
        ))}
        {[{label:'ValueError',x:30},{label:'TypeError',x:90},{label:'IOError',x:150}].map((e)=>(
          <g key={e.label}>
            <line x1="90" y1="64" x2={e.x} y2="78" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 1"/>
            <rect x={e.x-32} y="78" width="64" height="13" rx="2" fill="#f59e0b" opacity=".12"/>
            <text x={e.x} y="88" fontSize="7" fill="#64748b" textAnchor="middle">{e.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function AsyncDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">async/await — Event Loop Concurrency</text>
        <text x="4" y="26" fontSize="8.5" fill="#64748b">Single thread, multiple coroutines suspended at I/O boundaries</text>
        {['fetch_url_1','fetch_url_2','fetch_url_3'].map((t,i)=>(
          <g key={t}>
            <text x="10" y={42+i*16} fontSize="8" fill="#475569">{t}</text>
            {[0,1,2,3,4,5].map(s=>(
              <rect key={s} x={90+s*58} y={34+i*16} width="52" height="12" rx="2"
                fill={s%2===i%2?'#4f8ef7':'#e2e8f0'} opacity={s%2===i%2?.4:.3}/>
            ))}
          </g>
        ))}
        <text x="4" y="82" fontSize="8" fill="#22c55e">Blue = running   Gray = awaiting I/O (yields control back to event loop)</text>
      </svg>
    </div>
  )
}

function FileIODiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">File I/O Modes and Paths</text>
        {[
          {mode:'r',desc:'Read text',color:'#4f8ef7'},
          {mode:'w',desc:'Write (truncate)',color:'#ef4444'},
          {mode:'a',desc:'Append',color:'#f59e0b'},
          {mode:'rb',desc:'Read binary',color:'#8b5cf6'},
          {mode:'r+',desc:'Read + write',color:'#22c55e'},
          {mode:'x',desc:'Create (fail if exists)',color:'#ec4899'},
        ].map((m,i)=>(
          <g key={m.mode}>
            <rect x={4+i*74} y="18" width="68" height="44" rx="5" fill={m.color} opacity=".12" stroke={m.color} strokeWidth="1.2"/>
            <text x={38+i*74} y="35" fontSize="12" fontWeight="800" fontFamily="monospace" fill={m.color} textAnchor="middle">'{m.mode}'</text>
            <text x={38+i*74} y="52" fontSize="7.5" fill="#475569" textAnchor="middle">{m.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function RegexDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Regex — Pattern Anatomy</text>
        <text x="4" y="26" fontSize="10" fontFamily="monospace" fill="#1e293b">^(\d{4})-(\d{2})-(\d{2})$</text>
        {[
          {pat:'^',desc:'start of string',color:'#ef4444',x:4},
          {pat:'(\\d{4})',desc:'4 digits (group 1)',color:'#4f8ef7',x:70},
          {pat:'-',desc:'literal dash',color:'#64748b',x:200},
          {pat:'(\\d{2})',desc:'2 digits (group 2)',color:'#22c55e',x:240},
          {pat:'$',desc:'end of string',color:'#ef4444',x:370},
        ].map((p)=>(
          <g key={p.pat+p.x}>
            <line x1={p.x+10} y1="30" x2={p.x+10} y2="42" stroke={p.color} strokeWidth="1.2" strokeDasharray="2 1"/>
            <rect x={p.x} y="42" width="80" height="18" rx="3" fill={p.color} opacity=".12" stroke={p.color} strokeWidth="1"/>
            <text x={p.x+40} y="55" fontSize="7.5" fill={p.color} textAnchor="middle">{p.desc}</text>
          </g>
        ))}
        <text x="4" y="76" fontSize="8" fill="#64748b">Methods: re.match() re.search() re.findall() re.sub() re.compile()</text>
      </svg>
    </div>
  )
}

function TestingDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Testing Pyramid</text>
        {[
          {label:'E2E Tests',width:120,y:18,color:'#ef4444',desc:'few, slow, high confidence'},
          {label:'Integration Tests',width:200,y:36,color:'#f59e0b',desc:'some, medium speed'},
          {label:'Unit Tests',width:300,y:54,color:'#22c55e',desc:'many, fast, cheap'},
        ].map(t=>(
          <g key={t.label}>
            <rect x={(460-t.width)/2} y={t.y} width={t.width} height="16" rx="3" fill={t.color} opacity=".2" stroke={t.color} strokeWidth="1.5"/>
            <text x="230" y={t.y+11} fontSize="8.5" fontWeight="700" fill={t.color} textAnchor="middle">{t.label}</text>
            <text x="235" y={t.y+11} fontSize="7.5" fill="#64748b" textAnchor="start" style={{display:'none'}}>{t.desc}</text>
          </g>
        ))}
        <text x="4" y="74" fontSize="8" fill="#64748b">pytest: fixtures, parametrize, monkeypatch — mock.patch for external I/O</text>
      </svg>
    </div>
  )
}

function PackagesDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Package Management Landscape</text>
        {[
          {tool:'pip',desc:'Standard installer\n(PyPI packages)',color:'#4f8ef7'},
          {tool:'venv / uv',desc:'Virtual environment\nisolation',color:'#22c55e'},
          {tool:'poetry',desc:'Dependency groups +\nlock file',color:'#8b5cf6'},
          {tool:'conda',desc:'Binary packages +\nnon-Python deps',color:'#f59e0b'},
        ].map((p,i)=>(
          <g key={p.tool}>
            <rect x={4+i*114} y="18" width="108" height="48" rx="5" fill={p.color} opacity=".12" stroke={p.color} strokeWidth="1.2"/>
            <text x={58+i*114} y="33" fontSize="10" fontWeight="700" fill={p.color} textAnchor="middle">{p.tool}</text>
            {p.desc.split('\n').map((d,j)=><text key={j} x={58+i*114} y={46+j*12} fontSize="7.5" fill="#475569" textAnchor="middle">{d}</text>)}
          </g>
        ))}
      </svg>
    </div>
  )
}

function PandasDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 85" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">pandas — Core Operations</text>
        {[
          {op:'read_csv/parquet',desc:'Ingestion with dtypes',color:'#4f8ef7'},
          {op:'groupby().agg()',desc:'Split-Apply-Combine',color:'#22c55e'},
          {op:'merge()',desc:'SQL-style joins',color:'#8b5cf6'},
          {op:'pivot_table()',desc:'Aggregate + reshape',color:'#f59e0b'},
          {op:'to_parquet()',desc:'Write columnar output',color:'#ef4444'},
          {op:'query()',desc:'Filter (evaluates expr)',color:'#ec4899'},
        ].map((o,i)=>(
          <g key={o.op}>
            <rect x={4+(i%3)*156} y={18+Math.floor(i/3)*34} width="148" height="26" rx="4" fill={o.color} opacity=".1" stroke={o.color} strokeWidth="1.1"/>
            <text x={14+(i%3)*156} y={30+Math.floor(i/3)*34} fontSize="8.5" fontWeight="700" fontFamily="monospace" fill={o.color}>{o.op}</text>
            <text x={14+(i%3)*156} y={40+Math.floor(i/3)*34} fontSize="7.5" fill="#475569">{o.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function MemoryProfileDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Memory Profiling Tools</text>
        {[
          {tool:'tracemalloc',desc:'Built-in — trace allocs by file/line',color:'#4f8ef7'},
          {tool:'memory_profiler',desc:'@profile decorator — line-by-line MB',color:'#22c55e'},
          {tool:'objgraph',desc:'Object counts + reference graph',color:'#8b5cf6'},
          {tool:'sys.getsizeof',desc:'Object shallow size in bytes',color:'#f59e0b'},
        ].map((t,i)=>(
          <g key={t.tool}>
            <rect x={4+(i%2)*230} y={18+Math.floor(i/2)*30} width="220" height="22" rx="4" fill={t.color} opacity=".1" stroke={t.color} strokeWidth="1.1"/>
            <text x={14+(i%2)*230} y={28+Math.floor(i/2)*30} fontSize="9" fontWeight="700" fontFamily="monospace" fill={t.color}>{t.tool}</text>
            <text x={14+(i%2)*230} y={37+Math.floor(i/2)*30} fontSize="7.5" fill="#475569">{t.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DBConnectionDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 95" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">DB Connection Layers</text>
        {[
          {name:'Application',color:'#4f8ef7',y:18},
          {name:'ORM / SQLAlchemy',color:'#8b5cf6',y:36},
          {name:'DB-API 2.0 Driver (psycopg2 / pyodbc)',color:'#f59e0b',y:54},
          {name:'Database Server (Postgres / Snowflake)',color:'#22c55e',y:72},
        ].map(l=>(
          <g key={l.name}>
            <rect x="10" y={l.y} width="440" height="15" rx="3" fill={l.color} opacity=".15" stroke={l.color} strokeWidth="1"/>
            <text x="16" y={l.y+11} fontSize="8.5" fontWeight="600" fill="#1e293b">{l.name}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function HTTPDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">HTTP Request / Response Cycle</text>
        <rect x="10" y="20" width="80" height="44" rx="5" fill="#4f8ef7" opacity=".18" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="50" y="46" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Client</text>
        <text x="50" y="57" fontSize="7.5" fill="#475569" textAnchor="middle">requests</text>
        <line x1="90" y1="36" x2="200" y2="36" stroke="#22c55e" strokeWidth="2"/>
        <polygon points="196,32 204,36 196,40" fill="#22c55e"/>
        <text x="145" y="30" fontSize="8" fill="#22c55e" textAnchor="middle">GET /api/data</text>
        <rect x="205" y="20" width="80" height="44" rx="5" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="245" y="46" fontSize="9" fontWeight="700" fill="#22c55e" textAnchor="middle">Server</text>
        <text x="245" y="57" fontSize="7.5" fill="#475569" textAnchor="middle">REST API</text>
        <line x1="205" y1="54" x2="95" y2="54" stroke="#f59e0b" strokeWidth="2"/>
        <polygon points="99,50 91,54 99,58" fill="#f59e0b"/>
        <text x="150" y="66" fontSize="8" fill="#f59e0b" textAnchor="middle">200 OK + JSON body</text>
        <text x="310" y="32" fontSize="8" fill="#64748b">Status codes:</text>
        {['2xx OK','3xx Redirect','4xx Client err','5xx Server err'].map((s,i)=>(
          <text key={s} x="310" y={44+i*10} fontSize="7.5" fill={i===0?'#22c55e':i===1?'#f59e0b':i===2?'#ef4444':'#8b5cf6'}>{s}</text>
        ))}
      </svg>
    </div>
  )
}

function LinuxScriptDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Linux — Pipe & Redirect</text>
        {['cat data.csv','grep "ERROR"','awk \'{print $3}\'','sort','uniq -c','sort -rn'].map((cmd,i)=>(
          <g key={cmd}>
            <rect x={4+i*74} y="20" width="68" height="24" rx="3" fill="#1e293b" opacity=".08" stroke="#475569" strokeWidth="1"/>
            <text x={38+i*74} y="35" fontSize="8" fontFamily="monospace" fill="#1e293b" textAnchor="middle">{cmd}</text>
            {i<5&&<polygon points={`${72+i*74},32 ${76+i*74},28 ${76+i*74},36`} fill="#4f8ef7"/>}
          </g>
        ))}
        <text x="4" y="62" fontSize="8" fill="#64748b">Pipeline: stdout of each command feeds stdin of next via |</text>
        <text x="4" y="74" fontSize="8" fill="#94a3b8">Redirect: &gt; overwrite, &gt;&gt; append, 2&gt;&amp;1 combine stderr+stdout</text>
      </svg>
    </div>
  )
}

function GitDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 85" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Git Data Flow</text>
        {[
          {label:'Working Dir',color:'#4f8ef7',x:10},
          {label:'Index / Stage',color:'#f59e0b',x:130},
          {label:'Local Repo',color:'#22c55e',x:250},
          {label:'Remote (GitHub)',color:'#8b5cf6',x:360},
        ].map(s=>(
          <g key={s.label}>
            <rect x={s.x} y="18" width="108" height="36" rx="5" fill={s.color} opacity=".15" stroke={s.color} strokeWidth="1.5"/>
            <text x={s.x+54} y="40" fontSize="8.5" fontWeight="700" fill={s.color} textAnchor="middle">{s.label}</text>
          </g>
        ))}
        {[{cmd:'git add',x1:118,x2:130},{cmd:'git commit',x1:238,x2:250},{cmd:'git push',x1:358,x2:360}].map(a=>(
          <g key={a.cmd}>
            <polygon points={`${a.x1},38 ${a.x2-4},34 ${a.x2-4},42`} fill="#64748b"/>
            <text x={(a.x1+a.x2)/2} y="55" fontSize="7" fill="#64748b" textAnchor="middle">{a.cmd}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function PydanticDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Pydantic — Validation Pipeline</text>
        <rect x="10" y="20" width="90" height="36" rx="5" fill="#64748b" opacity=".15" stroke="#64748b" strokeWidth="1.5"/>
        <text x="55" y="33" fontSize="9" fontWeight="700" fill="#64748b" textAnchor="middle">Raw Input</text>
        <text x="55" y="48" fontSize="7.5" fill="#475569" textAnchor="middle">dict / JSON</text>
        <polygon points="102,38 110,34 110,42" fill="#f59e0b"/>
        <rect x="112" y="20" width="120" height="36" rx="5" fill="#f59e0b" opacity=".15" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="172" y="33" fontSize="9" fontWeight="700" fill="#f59e0b" textAnchor="middle">Pydantic Model</text>
        <text x="172" y="48" fontSize="7.5" fill="#475569" textAnchor="middle">validate + coerce types</text>
        <polygon points="234,38 242,34 242,42" fill="#22c55e"/>
        <rect x="244" y="20" width="100" height="36" rx="5" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="294" y="33" fontSize="9" fontWeight="700" fill="#22c55e" textAnchor="middle">Valid Object</text>
        <text x="294" y="48" fontSize="7.5" fill="#475569" textAnchor="middle">typed attrs</text>
        <polygon points="124,38 116,38" fill="none"/>
        <text x="350" y="30" fontSize="8" fill="#ef4444">Validation</text>
        <text x="350" y="42" fontSize="8" fill="#ef4444">Error</text>
        <text x="350" y="54" fontSize="7.5" fill="#64748b">(if bad input)</text>
        <line x1="172" y1="56" x2="350" y2="60" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2"/>
        <text x="4" y="78" fontSize="8" fill="#64748b">v2: model_validator, field_validator, model_serializer — fastest Python validator</text>
      </svg>
    </div>
  )
}

function DockerPyDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 95" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Docker — Image Layers</text>
        {[
          {label:'FROM python:3.12-slim',color:'#1e293b',opacity:'.12'},
          {label:'RUN pip install -r requirements.txt',color:'#4f8ef7',opacity:'.15'},
          {label:'COPY src/ /app/src/',color:'#8b5cf6',opacity:'.15'},
          {label:'CMD ["python", "-m", "pipeline"]',color:'#22c55e',opacity:'.2'},
        ].map((l,i)=>(
          <g key={l.label}>
            <rect x="10" y={18+i*17} width="440" height="14" rx="2" fill={l.color} opacity={l.opacity} stroke={l.color} strokeWidth="1"/>
            <text x="16" y={29+i*17} fontSize="8.5" fontFamily="monospace" fill="#1e293b">{l.label}</text>
            <text x="436" y={29+i*17} fontSize="7.5" fill="#94a3b8" textAnchor="end">layer {i+1}</text>
          </g>
        ))}
        <text x="4" y="88" fontSize="8" fill="#64748b">Each instruction = one immutable layer. Docker caches unchanged layers → fast rebuilds.</text>
      </svg>
    </div>
  )
}

function K8sDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 110" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Kubernetes Object Hierarchy</text>
        <rect x="160" y="18" width="140" height="18" rx="4" fill="#4f8ef7" opacity=".2" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="230" y="31" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Cluster</text>
        <line x1="230" y1="36" x2="230" y2="46" stroke="#4f8ef7" strokeWidth="1"/>
        <rect x="150" y="46" width="160" height="16" rx="3" fill="#8b5cf6" opacity=".18" stroke="#8b5cf6" strokeWidth="1.2"/>
        <text x="230" y="58" fontSize="9" fontWeight="700" fill="#8b5cf6" textAnchor="middle">Namespace</text>
        {[{label:'Deployment',x:60},{label:'Service',x:210},{label:'ConfigMap',x:360}].map(o=>(
          <g key={o.label}>
            <line x1="230" y1="62" x2={o.x+50} y2="74" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 1"/>
            <rect x={o.x} y="74" width="100" height="14" rx="3" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1"/>
            <text x={o.x+50} y="84" fontSize="8" fill="#22c55e" textAnchor="middle">{o.label}</text>
          </g>
        ))}
        <text x="4" y="105" fontSize="8" fill="#64748b">Pod = one or more containers. ReplicaSet = desired pod count. Deployment = rolling update controller.</text>
      </svg>
    </div>
  )
}

function DataQualityPyDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Data Quality — Validation Layers</text>
        {[
          {tool:'Great Expectations',desc:'Expectation suites + data docs',color:'#4f8ef7'},
          {tool:'Deequ (PySpark)',desc:'Column-level constraints at scale',color:'#8b5cf6'},
          {tool:'Soda Core',desc:'YAML-defined checks + alerting',color:'#22c55e'},
          {tool:'Pandera',desc:'pandas DataFrame schema validation',color:'#f59e0b'},
        ].map((t,i)=>(
          <g key={t.tool}>
            <rect x={4+(i%2)*228} y={18+Math.floor(i/2)*28} width="218" height="22" rx="4" fill={t.color} opacity=".12" stroke={t.color} strokeWidth="1.1"/>
            <text x={14+(i%2)*228} y={27+Math.floor(i/2)*28} fontSize="8.5" fontWeight="700" fill={t.color}>{t.tool}</text>
            <text x={14+(i%2)*228} y={37+Math.floor(i/2)*28} fontSize="7.5" fill="#475569">{t.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function TypeHintsAnimation() {
  const [mode, setMode] = useState<'runtime'|'static'>('static')
  const checks = [
    { name:'def read_parquet(path: str)', pass:true, err:'' },
    { name:'def enrich(event: RawEvent)', pass:true, err:'' },
    { name:"user_id: int = 'abc'", pass:mode==='runtime', err:"mypy: str is not assignable to int" },
    { name:"write_dataset(mode='bad')", pass:mode==='runtime', err:"mypy: Literal error — not in ['overwrite','append']" },
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Python Type Hints — Static vs Runtime</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['static','runtime'] as const).map(m => (
            <button key={m} onClick={()=>setMode(m)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:'.8rem', background:mode===m?'#4f8ef7':'var(--surface-3)', color:mode===m?'white':'var(--text-secondary)' }}>{m==='static'?'mypy check':'runtime'}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {checks.map(c => (
          <div key={c.name} style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${c.pass?'#4ade80':'#f87171'}`, background:c.pass?'#f0fdf4':'#fef2f2', display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ fontSize:'.9rem' }}>{c.pass?'✓':'✗'}</span>
            <div>
              <code style={{ fontSize:'.8rem', color:'#1e293b' }}>{c.name}</code>
              {!c.pass && <div style={{ fontSize:'.72rem', color:'#ef4444', marginTop:2 }}>{c.err}</div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, fontSize:'.73rem', color:'var(--text-secondary)' }}>
        {mode==='static' ? '💡 mypy catches type errors at check time — zero runtime overhead' : '⚠️ At runtime Python ignores annotations — type errors silently pass'}
      </div>
    </div>
  )
}

function DataStructuresAnimation() {
  const [active, setActive] = useState<string|null>(null)
  const structures = [
    { name:'list', ops:[{op:'access',big:'O(1)'},{op:'search',big:'O(n)'},{op:'append',big:'O(1)'},{op:'insert mid',big:'O(n)'}], color:'#4f8ef7' },
    { name:'dict', ops:[{op:'get',big:'O(1)'},{op:'set',big:'O(1)'},{op:'delete',big:'O(1)'},{op:'iterate',big:'O(n)'}], color:'#8b5cf6' },
    { name:'set', ops:[{op:'add',big:'O(1)'},{op:'in',big:'O(1)'},{op:'union',big:'O(n)'},{op:'diff',big:'O(n)'}], color:'#22c55e' },
    { name:'heapq', ops:[{op:'push',big:'O(log n)'},{op:'pop',big:'O(log n)'},{op:'peek',big:'O(1)'},{op:'build',big:'O(n)'}], color:'#f59e0b' },
    { name:'deque', ops:[{op:'appendleft',big:'O(1)'},{op:'popleft',big:'O(1)'},{op:'access',big:'O(n)'},{op:'rotate',big:'O(k)'}], color:'#ec4899' },
  ]
  const sel = structures.find(s=>s.name===active)
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Python Data Structures — Click to see Big-O complexity</div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
        {structures.map(s => (
          <button key={s.name} onClick={()=>setActive(active===s.name?null:s.name)} style={{ padding:'6px 16px', borderRadius:20, border:`2px solid ${active===s.name?s.color:'var(--border)'}`, background:active===s.name?s.color:'white', color:active===s.name?'white':'#1e293b', fontWeight:700, cursor:'pointer', fontFamily:'monospace', fontSize:'.85rem', transition:'all .2s' }}>{s.name}</button>
        ))}
      </div>
      {sel && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, animation:'fadeIn .3s ease' }}>
          {sel.ops.map(o => (
            <div key={o.op} style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${sel.color}33`, background:`${sel.color}11`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <code style={{ fontSize:'.8rem', color:'#1e293b' }}>{o.op}</code>
              <span style={{ fontWeight:800, color:sel.color, fontFamily:'monospace', fontSize:'.85rem' }}>{o.big}</span>
            </div>
          ))}
        </div>
      )}
      {!sel && <div style={{ textAlign:'center', color:'var(--text-secondary)', fontSize:'.85rem', padding:16 }}>Click a structure above</div>}
    </div>
  )
}

function ComprehensionAnimation() {
  const [type, setType] = useState<'list'|'gen'>('list')
  const n = 100000
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>List Comp vs Generator — Memory Comparison</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['list','gen'] as const).map(t => (
            <button key={t} onClick={()=>setType(t)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:'.8rem', background:type===t?'#4f8ef7':'var(--surface-3)', color:type===t?'white':'var(--text-secondary)' }}>{t==='list'?'[x for x]':'(x for x)'}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{ padding:14, borderRadius:10, border:`2px solid ${type==='list'?'#ef4444':'var(--border)'}`, background:type==='list'?'#fef2f2':'white' }}>
          <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:'.85rem', color:type==='list'?'#ef4444':'#64748b', marginBottom:8 }}>[x**2 for x in range({n.toLocaleString()})]</div>
          <div style={{ fontSize:'.8rem' }}><span style={{ color:'#ef4444', fontWeight:700 }}>~{(n*28/1024/1024).toFixed(1)} MB</span> allocated</div>
          <div style={{ marginTop:6, height:8, background:'#fee2e2', borderRadius:4 }}><div style={{ height:'100%', width:'100%', background:'#ef4444', borderRadius:4, transition:'all .5s' }}/></div>
          <div style={{ fontSize:'.72rem', marginTop:6, color:'#64748b' }}>Full list in RAM before first item used</div>
        </div>
        <div style={{ padding:14, borderRadius:10, border:`2px solid ${type==='gen'?'#22c55e':'var(--border)'}`, background:type==='gen'?'#f0fdf4':'white' }}>
          <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:'.85rem', color:type==='gen'?'#16a34a':'#64748b', marginBottom:8 }}>(x**2 for x in range({n.toLocaleString()}))</div>
          <div style={{ fontSize:'.8rem' }}><span style={{ color:'#16a34a', fontWeight:700 }}>~120 bytes</span> (constant)</div>
          <div style={{ marginTop:6, height:8, background:'#dcfce7', borderRadius:4 }}><div style={{ height:'100%', width:'0.03%', background:'#22c55e', borderRadius:4, transition:'all .5s' }}/></div>
          <div style={{ fontSize:'.72rem', marginTop:6, color:'#64748b' }}>Yields one item at a time — O(1) memory</div>
        </div>
      </div>
    </div>
  )
}

function FunctoolsAnimation() {
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const inputs = [1,2,1,3,2,1,4]
  const [step, setStep] = useState(0)
  const hit = useRef<Record<number,boolean>>({})
  const handleStep = () => {
    if (step >= inputs.length) return
    const arg = inputs[step]
    if (hit.current[arg]) setHits(h=>h+1); else { setMisses(m=>m+1); hit.current[arg]=true }
    setStep(s=>s+1)
  }
  const reset = () => { setStep(0); setHits(0); setMisses(0); hit.current={} }
  const total = hits+misses||1
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>functools.lru_cache — Cache Hit/Miss Demo</div>
      <div style={{ fontFamily:'monospace', fontSize:'.8rem', marginBottom:14, background:'#f8fafc', padding:10, borderRadius:8 }}>
        <span style={{ color:'#8b5cf6' }}>@lru_cache</span>(maxsize=3)<br/>
        def get_tier(customer_id) → str: ...
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
        {inputs.slice(0,step).map((v,i) => (
          <span key={i} style={{ padding:'3px 10px', borderRadius:14, fontFamily:'monospace', fontSize:'.8rem', background:step>1&&inputs.slice(0,i).includes(v)?'#f0fdf4':'#eff6ff', border:`1px solid ${step>1&&inputs.slice(0,i).includes(v)?'#4ade80':'#93c5fd'}`, color:step>1&&inputs.slice(0,i).includes(v)?'#16a34a':'#3b82f6' }}>{step>1&&inputs.slice(0,i).includes(v)?'HIT':'MISS'} ({v})</span>
        ))}
      </div>
      <div style={{ display:'flex', gap:16, marginBottom:12 }}>
        <div style={{ flex:1, textAlign:'center', padding:10, borderRadius:8, background:'#f0fdf4', border:'1px solid #4ade80' }}>
          <div style={{ fontSize:'1.4rem', fontWeight:900, color:'#16a34a' }}>{hits}</div>
          <div style={{ fontSize:'.72rem', color:'#64748b' }}>Cache Hits</div>
        </div>
        <div style={{ flex:1, textAlign:'center', padding:10, borderRadius:8, background:'#eff6ff', border:'1px solid #93c5fd' }}>
          <div style={{ fontSize:'1.4rem', fontWeight:900, color:'#3b82f6' }}>{misses}</div>
          <div style={{ fontSize:'.72rem', color:'#64748b' }}>DB Calls</div>
        </div>
        <div style={{ flex:1, textAlign:'center', padding:10, borderRadius:8, background:'#faf5ff', border:'1px solid #c4b5fd' }}>
          <div style={{ fontSize:'1.4rem', fontWeight:900, color:'#8b5cf6' }}>{Math.round(hits/total*100)}%</div>
          <div style={{ fontSize:'.72rem', color:'#64748b' }}>Hit Rate</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={handleStep} disabled={step>=inputs.length} style={{ flex:1, padding:'8px 0', borderRadius:8, border:'none', background:step>=inputs.length?'#e2e8f0':'#4f8ef7', color:step>=inputs.length?'#94a3b8':'white', cursor:step>=inputs.length?'default':'pointer', fontWeight:700, fontSize:'.85rem' }}>Call get_tier({inputs[step]??'—'})</button>
        <button onClick={reset} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontSize:'.85rem' }}>Reset</button>
      </div>
    </div>
  )
}

function GeneratorAnimation() {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const maxStep = 6
  useEffect(() => {
    if (!running) return
    if (step >= maxStep) { setRunning(false); return }
    const t = setTimeout(() => setStep(s=>s+1), 700)
    return () => clearTimeout(t)
  }, [running, step])
  const stages = ['read_jsonl()', 'filter(type="purchase")', 'transform()', 'batch(n=500)', 'write_delta()', 'commit']
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Generator Pipeline — Lazy Data Flow (O(1) memory per stage)</div>
      <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:16, overflowX:'auto' }}>
        {stages.map((s,i) => (
          <div key={s} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ padding:'8px 10px', borderRadius:8, border:`2px solid ${i<step?'#22c55e':i===step?'#4f8ef7':'var(--border)'}`, background:i<step?'#f0fdf4':i===step?'#eff6ff':'white', fontSize:'.72rem', fontFamily:'monospace', fontWeight:700, color:i<step?'#16a34a':i===step?'#3b82f6':'#94a3b8', minWidth:90, textAlign:'center', transition:'all .4s', whiteSpace:'nowrap' }}>
              {i<step?'✓ ':i===step?'▶ ':''}{s}
            </div>
            {i<stages.length-1 && <div style={{ width:18, height:2, background:i<step?'#22c55e':'#e2e8f0', transition:'background .4s', flexShrink:0 }}/>}
          </div>
        ))}
      </div>
      <div style={{ fontSize:'.78rem', color:'var(--text-secondary)', marginBottom:12, height:32 }}>
        {step===0 && 'No data loaded yet — generator is lazy'}
        {step===1 && '📂 Reading first record from disk...'}
        {step===2 && '🔍 Filtering: only purchase events pass through'}
        {step===3 && '⚙️ Transforming: normalize fields, add audit cols'}
        {step===4 && '📦 Batching 500 records before write'}
        {step===5 && '💾 Writing batch to Delta table'}
        {step>=6 && '✅ Pipeline complete — constant memory throughout!'}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={()=>{setStep(0);setRunning(true)}} style={{ flex:1, padding:'8px 0', borderRadius:8, border:'none', background:'#4f8ef7', color:'white', cursor:'pointer', fontWeight:700, fontSize:'.85rem' }}>▶ Run Pipeline</button>
        <button onClick={()=>{setStep(0);setRunning(false)}} style={{ padding:'8px 14px', borderRadius:8, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontSize:'.85rem' }}>Reset</button>
      </div>
    </div>
  )
}

function DecoratorAnimation() {
  const layers = [
    { name:'@retry(max=3)', color:'#f59e0b', desc:'1st applied outermost wrapper — catches exceptions, retries' },
    { name:'@timer', color:'#8b5cf6', desc:'2nd — wraps retry wrapper, measures total wall time' },
    { name:'@rate_limit(10/s)', color:'#22c55e', desc:'3rd — innermost, throttles calls before hitting the function' },
    { name:'fetch_api_page()', color:'#4f8ef7', desc:'Core function — executes last, inside all wrappers' },
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Decorator Stack — Application vs Execution Order</div>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ fontSize:'.78rem', color:'var(--text-secondary)', marginBottom:8 }}>Applied bottom→up (decorators wrap inside out):</div>
          {layers.map((l,i) => (
            <div key={l.name} style={{ padding:`${8+i*4}px ${10+i*8}px`, marginBottom:4, borderRadius:8, border:`2px solid ${l.color}44`, background:`${l.color}11`, fontFamily:'monospace', fontSize:'.8rem', fontWeight:700, color:l.color }}>{l.name}</div>
          ))}
        </div>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ fontSize:'.78rem', color:'var(--text-secondary)', marginBottom:8 }}>Call execution order:</div>
          {[layers[0],layers[1],layers[2],layers[3],layers[2],layers[1],layers[0]].map((l,i) => (
            <div key={i} style={{ fontSize:'.75rem', padding:'4px 10px', marginBottom:3, borderRadius:6, background:`${l.color}15`, borderLeft:`3px solid ${l.color}`, color:'#1e293b' }}>
              {i<4?'→ enter':'← exit'} {l.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OOPAnimation() {
  const [mode, setMode] = useState<'abc'|'protocol'>('abc')
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>ABC vs Protocol — Typing Approaches</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['abc','protocol'] as const).map(m => (
            <button key={m} onClick={()=>setMode(m)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:'.8rem', background:mode===m?'#4f8ef7':'var(--surface-3)', color:mode===m?'white':'var(--text-secondary)' }}>{m.toUpperCase()}</button>
          ))}
        </div>
      </div>
      {mode==='abc' ? (
        <div>
          <div style={{ fontSize:'.82rem', marginBottom:10, color:'var(--text-secondary)' }}>Nominal typing — must explicitly inherit</div>
          {[{cls:'S3Source',ok:true,note:'inherits DataSource ✓'},{cls:'AzureSource',ok:true,note:'inherits DataSource ✓'},{cls:'LocalWriter',ok:false,note:'does NOT inherit → isinstance fails'}].map(r=>(
            <div key={r.cls} style={{ display:'flex', justifyContent:'space-between', padding:'7px 12px', marginBottom:6, borderRadius:8, border:`1px solid ${r.ok?'#4ade80':'#f87171'}`, background:r.ok?'#f0fdf4':'#fef2f2' }}>
              <code style={{ fontSize:'.82rem' }}>{r.cls}</code>
              <span style={{ fontSize:'.75rem', color:r.ok?'#16a34a':'#ef4444' }}>{r.note}</span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ fontSize:'.82rem', marginBottom:10, color:'var(--text-secondary)' }}>Structural typing — any class with matching methods works</div>
          {[{cls:'S3Source',ok:true,note:'has .read() .write() .schema() ✓'},{cls:'AzureSource',ok:true,note:'has .read() .write() .schema() ✓'},{cls:'LocalWriter',ok:true,note:'has the right methods → satisfies Protocol ✓'}].map(r=>(
            <div key={r.cls} style={{ display:'flex', justifyContent:'space-between', padding:'7px 12px', marginBottom:6, borderRadius:8, border:'1px solid #4ade80', background:'#f0fdf4' }}>
              <code style={{ fontSize:'.82rem' }}>{r.cls}</code>
              <span style={{ fontSize:'.75rem', color:'#16a34a' }}>{r.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ContextManagerAnimation() {
  const [mode, setMode] = useState<'with'|'without'>('with')
  const [step, setStep] = useState(0)
  const steps = mode==='with'
    ? ['open file handle','read data','process records','[exception thrown!]','__exit__ called → file closed','exception re-raised']
    : ['open file handle','read data','process records','[exception thrown!]','FILE HANDLE LEAKED ⚠️','exception propagates']
  useEffect(()=>{
    setStep(0)
    const t = setInterval(()=>setStep(s=>s<steps.length-1?s+1:s),700)
    return ()=>clearInterval(t)
  },[mode])
  const colors = ['#22c55e','#4f8ef7','#8b5cf6','#ef4444',mode==='with'?'#22c55e':'#ef4444','#f59e0b']
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Context Manager — Resource Safety</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['with','without'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:'.8rem', background:mode===m?'#4f8ef7':'var(--surface-3)', color:mode===m?'white':'var(--text-secondary)' }}>{m==='with'?'with statement':'no context mgr'}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {steps.slice(0,step+1).map((s,i)=>(
          <div key={s} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${colors[i]}44`, background:`${colors[i]}11`, display:'flex', alignItems:'center', gap:8, animation:'fadeIn .3s ease' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:colors[i], display:'inline-block', flexShrink:0 }}/>
            <span style={{ fontSize:'.8rem', fontWeight:600, color:'#1e293b' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorHierarchyAnimation() {
  const [selected, setSelected] = useState<string|null>(null)
  const flat = [
    {name:'Exception',level:0,color:'#64748b'},{name:'PipelineError',level:1,color:'#8b5cf6'},
    {name:'DataQualityError',level:2,color:'#ef4444'},{name:'SchemaEvolutionError',level:2,color:'#f59e0b'},
    {name:'UpstreamAPIError',level:2,color:'#f97316'},{name:'ValueError',level:1,color:'#64748b'},{name:'KeyError',level:1,color:'#64748b'},
  ]
  const info: Record<string,string> = {
    DataQualityError:'Catch specifically → send DQ alert, skip batch',
    SchemaEvolutionError:'Catches as PipelineError → log + halt pipeline',
    UpstreamAPIError:'Catches as PipelineError → retry or alert',
    ValueError:'Generic — caught last resort by except Exception',
    PipelineError:'Catches self + all subclasses',
    Exception:'Catches everything above',
  }
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Exception Hierarchy — Click an exception</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {flat.map(e=>(
          <div key={e.name} onClick={()=>setSelected(selected===e.name?null:e.name)} style={{ marginLeft:e.level*20, padding:'7px 14px', borderRadius:8, border:`1.5px solid ${selected===e.name?e.color:'var(--border)'}`, background:selected===e.name?`${e.color}15`:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'all .2s' }}>
            <span style={{ fontFamily:'monospace', fontSize:'.82rem', fontWeight:700, color:e.color }}>{e.name}</span>
            {e.level>0&&<span style={{ fontSize:'.68rem', color:'var(--text-secondary)' }}>↳ inherits</span>}
          </div>
        ))}
      </div>
      {selected&&info[selected]&&(
        <div style={{ marginTop:10, padding:'8px 14px', borderRadius:8, background:'#f8fafc', border:'1px solid var(--border)', fontSize:'.8rem', color:'#1e293b' }}>
          <strong>{selected}:</strong> {info[selected]}
        </div>
      )}
    </div>
  )
}

function FileIOAnimation() {
  const [op, setOp] = useState('glob')
  const ops: Record<string,{code:string,result:string}> = {
    glob:{code:"sorted(raw_dir.glob('**/*.parquet'))",result:"/data/raw/2024/01/part-00.parquet\n/data/raw/2024/02/part-00.parquet\n/data/raw/2024/03/part-00.parquet"},
    stem:{code:"Path('/data/raw/events_2024-01.jsonl.gz').stem",result:"events_2024-01.jsonl"},
    suffix:{code:"Path('/data/raw/events_2024-01.jsonl.gz').suffix",result:".gz"},
    parent:{code:"Path('/data/raw/events.parquet').parent",result:"/data/raw"},
    mkdir:{code:"processed_dir.mkdir(parents=True, exist_ok=True)",result:"Directory created (no error if exists)"},
    atomic:{code:"tmp.rename(final_path)  # atomic on POSIX",result:"File visible atomically — readers never see partial write"},
  }
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>pathlib Operations</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {Object.keys(ops).map(o=>(
          <button key={o} onClick={()=>setOp(o)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:'.78rem', background:op===o?'#4f8ef7':'var(--surface-3)', color:op===o?'white':'var(--text-secondary)' }}>{o}</button>
        ))}
      </div>
      <div style={{ background:'#1e293b', borderRadius:8, padding:12, marginBottom:10 }}>
        <code style={{ color:'#7dd3fc', fontSize:'.82rem' }}>{ops[op].code}</code>
      </div>
      <div style={{ background:'#f0fdf4', border:'1px solid #4ade80', borderRadius:8, padding:10 }}>
        <pre style={{ margin:0, fontSize:'.78rem', color:'#166534', whiteSpace:'pre-wrap' }}>{ops[op].result}</pre>
      </div>
    </div>
  )
}

function RegexAnimation() {
  const [input, setInput] = useState('Call me at (415) 555-0182 or email hello@example.com by 2024-03-15')
  const patterns = [
    { name:'Email', regex:/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, color:'#8b5cf6' },
    { name:'Phone', regex:/\+?1?\s*\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/g, color:'#22c55e' },
    { name:'Date', regex:/\d{4}-\d{2}-\d{2}/g, color:'#f59e0b' },
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Regex Live Tester</div>
      <textarea value={input} onChange={e=>setInput(e.target.value)} rows={3} style={{ width:'100%', padding:10, borderRadius:8, border:'1.5px solid var(--border)', fontFamily:'monospace', fontSize:'.82rem', resize:'vertical', boxSizing:'border-box', marginBottom:12 }}/>
      {patterns.map(p=>{
        const matches = input.match(p.regex)||[]
        return (
          <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <span style={{ minWidth:50, padding:'3px 10px', borderRadius:14, background:`${p.color}22`, color:p.color, fontWeight:700, fontSize:'.75rem', textAlign:'center' }}>{p.name}</span>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {matches.length>0 ? matches.map((m,i)=>(
                <span key={i} style={{ padding:'2px 8px', borderRadius:12, background:`${p.color}15`, border:`1px solid ${p.color}44`, fontFamily:'monospace', fontSize:'.78rem', color:p.color }}>{m}</span>
              )) : <span style={{ fontSize:'.75rem', color:'#94a3b8' }}>no matches</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TestingAnimation() {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const tests = [
    { name:'test_normalize_adds_columns', result:'pass', ms:12 },
    { name:'test_validate_schema_passes', result:'pass', ms:8 },
    { name:'test_validate_schema_fails', result:'pass', ms:6 },
    { name:'test_deduplicate_removes_dups', result:'pass', ms:15 },
    { name:'test_convert_to_usd[USD]', result:'pass', ms:5 },
    { name:'test_convert_to_usd[EUR]', result:'pass', ms:5 },
    { name:'test_write_to_postgres_sql', result:'pass', ms:20 },
    { name:'test_fetch_api_handles_429', result:'fail', ms:34, error:'AssertionError: expected 2 calls, got 1' },
  ]
  useEffect(()=>{
    if(!running) return
    if(progress>=tests.length){setRunning(false);setDone(true);return}
    const t = setTimeout(()=>setProgress(p=>p+1),300)
    return()=>clearTimeout(t)
  },[running,progress])
  const run = ()=>{setProgress(0);setDone(false);setRunning(true)}
  const passed = tests.slice(0,progress).filter(t=>t.result==='pass').length
  const failed = tests.slice(0,progress).filter(t=>t.result==='fail').length
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>pytest Test Runner Simulation</div>
      <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12, maxHeight:220, overflowY:'auto' }}>
        {tests.slice(0,progress).map(t=>(
          <div key={t.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 10px', borderRadius:6, background:t.result==='pass'?'#f0fdf4':'#fef2f2', border:`1px solid ${t.result==='pass'?'#4ade80':'#f87171'}`, animation:'fadeIn .2s ease' }}>
            <span style={{ fontFamily:'monospace', fontSize:'.75rem', color:'#1e293b' }}>{t.name}</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:'.68rem', color:'#94a3b8' }}>{t.ms}ms</span>
              <span style={{ fontSize:'.8rem', fontWeight:700, color:t.result==='pass'?'#16a34a':'#ef4444' }}>{t.result==='pass'?'PASS':'FAIL'}</span>
            </div>
          </div>
        ))}
        {done&&failed>0&&<div style={{ padding:'6px 10px', borderRadius:6, background:'#fef2f2', border:'1px solid #f87171', fontSize:'.72rem', color:'#ef4444' }}>✗ {tests.find(t=>t.result==='fail')?.error}</div>}
      </div>
      {(running||done) && (
        <div style={{ display:'flex', gap:12, marginBottom:10 }}>
          <span style={{ color:'#16a34a', fontWeight:700, fontSize:'.85rem' }}>✓ {passed} passed</span>
          {failed>0&&<span style={{ color:'#ef4444', fontWeight:700, fontSize:'.85rem' }}>✗ {failed} failed</span>}
        </div>
      )}
      <button onClick={run} style={{ width:'100%', padding:'8px 0', borderRadius:8, border:'none', background:running?'#e2e8f0':'#4f8ef7', color:running?'#94a3b8':'white', cursor:running?'default':'pointer', fontWeight:700, fontSize:'.85rem' }}>{running?`Running... ${progress}/${tests.length}`:'▶ Run Tests'}</button>
    </div>
  )
}

function PackagesAnimation() {
  const [view, setView] = useState<'venv'|'poetry'>('venv')
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Package Isolation</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['venv','poetry'] as const).map(m=>(
            <button key={m} onClick={()=>setView(m)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:'.78rem', background:view===m?'#4f8ef7':'var(--surface-3)', color:view===m?'white':'var(--text-secondary)' }}>{m}</button>
          ))}
        </div>
      </div>
      {view==='venv' ? (
        <div style={{ display:'flex', gap:10 }}>
          {[{proj:'pipeline_a',pkgs:['pandas 1.5','pyarrow 12']},{proj:'pipeline_b',pkgs:['pandas 2.1','pyarrow 14']},{proj:'system',pkgs:['python 3.11','pip']}].map(v=>(
            <div key={v.proj} style={{ flex:1, padding:12, borderRadius:10, border:'2px solid var(--border)', background:'white' }}>
              <div style={{ fontWeight:700, fontSize:'.78rem', color:'#1e293b', marginBottom:8 }}>{v.proj==='system'?'🌐':'📦'} {v.proj}</div>
              {v.pkgs.map(p=><div key={p} style={{ padding:'3px 8px', marginBottom:4, borderRadius:6, background:v.proj==='system'?'#f1f5f9':'#eff6ff', fontSize:'.73rem', fontFamily:'monospace', color:'#475569' }}>{p}</div>)}
              {v.proj!=='system'&&<div style={{ fontSize:'.65rem', color:'#4f8ef7', marginTop:6 }}>isolated .venv/</div>}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {[{step:'pyproject.toml',desc:'Declare abstract deps (pandas ^2.1)'},{step:'poetry.lock',desc:'Pinned exact versions (pandas==2.1.4)'},{step:'poetry install',desc:'Install exactly what lock file says'},{step:'poetry add pandas',desc:'Resolve + update lock atomically'}].map(s=>(
            <div key={s.step} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
              <code style={{ padding:'3px 10px', borderRadius:20, background:'#4f8ef7', color:'white', fontSize:'.72rem', fontWeight:700, whiteSpace:'nowrap' }}>{s.step}</code>
              <span style={{ fontSize:'.78rem', color:'var(--text-secondary)', paddingTop:3 }}>{s.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PandasAnimation() {
  const [op, setOp] = useState('read')
  const data = [
    {user_id:1,event:'click',amount:0},{user_id:2,event:'purchase',amount:99.99},{user_id:2,event:'purchase',amount:99.99},{user_id:3,event:'view',amount:0},
  ]
  const ops: Record<string,{label:string,rows:object[]}> = {
    read:{label:'pd.read_parquet()',rows:data},
    filter:{label:"df[df.event=='purchase']",rows:data.filter(r=>r.event==='purchase')},
    dedup:{label:'df.drop_duplicates()',rows:[data[0],data[1],data[3]]},
    groupby:{label:"df.groupby('user_id').amount.sum()",rows:[{user_id:1,amount:0},{user_id:2,amount:199.98},{user_id:3,amount:0}]},
  }
  const result = ops[op].rows
  const cols = result.length>0?Object.keys(result[0]):[]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>pandas DataFrame Operations</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {Object.entries(ops).map(([k,v])=>(
          <button key={k} onClick={()=>setOp(k)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:'.78rem', background:op===k?'#4f8ef7':'var(--surface-3)', color:op===k?'white':'var(--text-secondary)' }}>{v.label}</button>
        ))}
      </div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.8rem', fontFamily:'monospace' }}>
          <thead><tr>{cols.map(c=><th key={c} style={{ padding:'6px 12px', background:'#1e293b', color:'white', textAlign:'left', fontWeight:700 }}>{c}</th>)}</tr></thead>
          <tbody>{result.map((r,i)=><tr key={i} style={{ background:i%2===0?'white':'#f8fafc' }}>{cols.map(c=><td key={c} style={{ padding:'5px 12px', borderBottom:'1px solid var(--border)' }}>{(r as Record<string,unknown>)[c] as string}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div style={{ marginTop:8, fontSize:'.73rem', color:'var(--text-secondary)' }}>{result.length} rows</div>
    </div>
  )
}

function DBConnectionAnimation() {
  const [active, setActive] = useState(0)
  useEffect(()=>{
    const t = setInterval(()=>setActive(a=>(a+1)%3),1200)
    return()=>clearInterval(t)
  },[])
  const pool = Array.from({length:5},(_,i)=>i)
  const workers = ['Worker A','Worker B','Worker C']
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>DB Connection Pool</div>
      <div style={{ display:'flex', gap:8, marginBottom:16, justifyContent:'center' }}>
        {pool.map(i=>(
          <div key={i} style={{ width:40, height:40, borderRadius:8, border:`2px solid ${i<3?'#4f8ef7':'var(--border)'}`, background:i===active?'#4f8ef7':i<3?'#eff6ff':'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:700, color:i===active?'white':i<3?'#3b82f6':'#94a3b8', transition:'all .5s' }}>{i<3?'IN USE':'IDLE'}</div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {workers.map((w,i)=>(
          <div key={w} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 12px', borderRadius:8, border:`1px solid ${i===active?'#4f8ef7':'var(--border)'}`, background:i===active?'#eff6ff':'white', transition:'all .5s' }}>
            <span style={{ fontSize:'.78rem', fontWeight:700, flex:1 }}>{w}</span>
            <span style={{ fontSize:'.72rem', color:i===active?'#3b82f6':'#94a3b8', fontFamily:'monospace' }}>{i===active?'⚡ executing query':'⏳ waiting for conn'}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, fontSize:'.73rem', color:'var(--text-secondary)' }}>Pool size: 5 · 3 workers share connections — no connection per-thread</div>
    </div>
  )
}

function HTTPAnimation() {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const steps = [
    {label:'Session created', color:'#4f8ef7'},
    {label:'GET /events?page=1', color:'#8b5cf6'},
    {label:'200 OK + 500 records', color:'#22c55e'},
    {label:'429 Too Many Requests', color:'#f59e0b'},
    {label:'Wait Retry-After: 1s', color:'#f97316'},
    {label:'GET /events?page=1 (retry)', color:'#8b5cf6'},
    {label:'200 OK + 500 records', color:'#22c55e'},
    {label:'Session closed', color:'#64748b'},
  ]
  useEffect(()=>{
    if(!running)return
    if(step>=steps.length){setRunning(false);return}
    const t = setTimeout(()=>setStep(s=>s+1),600)
    return()=>clearTimeout(t)
  },[running,step])
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>HTTP Request Lifecycle with Retry</div>
      <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12, minHeight:160 }}>
        {steps.slice(0,step).map((s,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px', borderRadius:6, border:`1px solid ${s.color}44`, background:`${s.color}11`, animation:'fadeIn .3s ease' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:s.color, flexShrink:0 }}/>
            <span style={{ fontFamily:'monospace', fontSize:'.78rem', color:'#1e293b' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <button onClick={()=>{setStep(0);setRunning(true)}} style={{ width:'100%', padding:'8px 0', borderRadius:8, border:'none', background:running?'#e2e8f0':'#4f8ef7', color:running?'#94a3b8':'white', cursor:running?'default':'pointer', fontWeight:700, fontSize:'.85rem' }}>{running?'Running...':'▶ Simulate Request'}</button>
    </div>
  )
}

function LinuxScriptAnimation() {
  const [cmd, setCmd] = useState(0)
  const commands = [
    {input:'import subprocess; result = subprocess.run(["ls","-la"], capture_output=True, text=True)', output:'total 48\ndrwxr-xr-x 8 de de 4096 Jan 15 10:32 .\n-rw-r--r-- 1 de de 1024 Jan 15 10:30 pipeline.py\n-rw-r--r-- 1 de de 4096 Jan 15 09:00 config.yaml'},
    {input:'subprocess.run(["gzip","-k","events.jsonl"], check=True)', output:'events.jsonl.gz created (check=True raises on nonzero exit)'},
    {input:'os.environ.get("PIPELINE_ENV", "dev")', output:'"prod"'},
    {input:'shutil.copy2("output.parquet", "/mnt/archive/2024-01-15.parquet")', output:'Copied with metadata preserved'},
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Python Shell / subprocess Demos</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {['ls -la','gzip','os.environ','shutil.copy2'].map((c,i)=>(
          <button key={c} onClick={()=>setCmd(i)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:'.78rem', background:cmd===i?'#4f8ef7':'var(--surface-3)', color:cmd===i?'white':'var(--text-secondary)' }}>{c}</button>
        ))}
      </div>
      <div style={{ background:'#1e293b', borderRadius:8, padding:12, marginBottom:8 }}>
        <code style={{ color:'#7dd3fc', fontSize:'.78rem', wordBreak:'break-all' }}>{commands[cmd].input}</code>
      </div>
      <div style={{ background:'#0f172a', borderRadius:8, padding:12 }}>
        <pre style={{ margin:0, color:'#4ade80', fontSize:'.78rem', whiteSpace:'pre-wrap' }}>{commands[cmd].output}</pre>
      </div>
    </div>
  )
}

function GitAnimation() {
  const [step, setStep] = useState<'working'|'staged'|'committed'|'pushed'>('working')
  const steps = ['working','staged','committed','pushed'] as const
  const idx = steps.indexOf(step)
  const zones = [
    {name:'Working Tree',desc:'Modified files — not tracked',active:idx===0,color:'#f59e0b'},
    {name:'Staging Area',desc:'git add → queued for commit',active:idx===1,color:'#8b5cf6'},
    {name:'Local Repo',desc:'git commit → permanent snapshot',active:idx===2,color:'#4f8ef7'},
    {name:'Remote (GitHub)',desc:'git push → shared with team',active:idx===3,color:'#22c55e'},
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Git Data Flow — Step through</div>
      <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:16, overflowX:'auto' }}>
        {zones.map((z,i)=>(
          <div key={z.name} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ padding:'10px 14px', borderRadius:8, border:`2px solid ${z.active?z.color:'var(--border)'}`, background:z.active?`${z.color}15`:'white', minWidth:110, textAlign:'center', transition:'all .3s' }}>
              <div style={{ fontWeight:700, fontSize:'.78rem', color:z.active?z.color:'#94a3b8' }}>{z.name}</div>
              <div style={{ fontSize:'.65rem', color:'#94a3b8', marginTop:3 }}>{z.desc}</div>
            </div>
            {i<zones.length-1&&<div style={{ width:20, height:2, background:idx>i?zones[i+1].color:'#e2e8f0', transition:'background .3s', flexShrink:0 }}/>}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {(['working','staged','committed','pushed'] as const).map((s,i)=>(
          <button key={s} onClick={()=>setStep(s)} disabled={idx>=i&&s!==steps[0]} style={{ flex:1, padding:'7px 0', borderRadius:8, border:'none', background:step===s?'#4f8ef7':idx>=i?'#e2e8f0':'var(--surface-3)', color:step===s?'white':idx>=i?'#64748b':'var(--text-secondary)', cursor:'pointer', fontWeight:600, fontSize:'.78rem' }}>{['Start','git add','git commit','git push'][i]}</button>
        ))}
      </div>
    </div>
  )
}

function PydanticAnimation() {
  const [mode, setMode] = useState<'valid'|'invalid'>('valid')
  const valid = {user_id:42,event_type:'click',amount:99.99,timestamp:'2024-01-15T10:00:00'}
  const invalid = {user_id:'not-an-int',event_type:'click',amount:-5,timestamp:'bad-date'}
  const errors = [
    "user_id: Input should be a valid integer",
    "amount: Input should be greater than 0",
    "timestamp: Input should be a valid datetime",
  ]
  const data = mode==='valid'?valid:invalid
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Pydantic Validation</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['valid','invalid'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:'.8rem', background:mode===m?'#4f8ef7':'var(--surface-3)', color:mode===m?'white':'var(--text-secondary)' }}>{m} data</button>
          ))}
        </div>
      </div>
      <div style={{ background:'#1e293b', borderRadius:8, padding:12, marginBottom:10 }}>
        <pre style={{ margin:0, color:'#7dd3fc', fontSize:'.78rem' }}>{JSON.stringify(data,null,2)}</pre>
      </div>
      {mode==='valid' ? (
        <div style={{ padding:12, borderRadius:8, background:'#f0fdf4', border:'1px solid #4ade80', fontSize:'.82rem', color:'#16a34a', fontWeight:700 }}>✓ EventModel validated successfully</div>
      ) : (
        <div style={{ padding:12, borderRadius:8, background:'#fef2f2', border:'1px solid #f87171' }}>
          <div style={{ fontWeight:700, fontSize:'.82rem', color:'#ef4444', marginBottom:8 }}>✗ ValidationError: 3 errors</div>
          {errors.map(e=><div key={e} style={{ fontSize:'.75rem', color:'#b91c1c', marginBottom:4 }}>• {e}</div>)}
        </div>
      )}
    </div>
  )
}

function DockerPyAnimation() {
  const [phase, setPhase] = useState<'build'|'run'|'push'>('build')
  const layers = ['FROM python:3.11-slim','COPY requirements.txt .','RUN pip install -r requirements.txt','COPY pipeline/ /app/pipeline/','ENTRYPOINT ["python","-m","pipeline"]']
  const containers = ['pipeline_a (running)','pipeline_b (running)','pipeline_c (exited 0)']
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Docker Image & Container</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['build','run','push'] as const).map(p=>(
            <button key={p} onClick={()=>setPhase(p)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:'.8rem', background:phase===p?'#4f8ef7':'var(--surface-3)', color:phase===p?'white':'var(--text-secondary)' }}>{p}</button>
          ))}
        </div>
      </div>
      {phase==='build'&&(
        <div>
          {layers.map((l,i)=>(
            <div key={l} style={{ padding:'6px 12px', marginBottom:4, borderRadius:6, border:'1px solid #4f8ef744', background:'#eff6ff', fontFamily:'monospace', fontSize:'.78rem', color:'#1e4c8c' }}>Layer {i+1}: {l}</div>
          ))}
          <div style={{ marginTop:8, fontSize:'.73rem', color:'var(--text-secondary)' }}>Each RUN/COPY creates a cached layer — unchanged layers reuse cache</div>
        </div>
      )}
      {phase==='run'&&(
        <div>
          {containers.map((c)=>(
            <div key={c} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', marginBottom:6, borderRadius:8, border:`1px solid ${c.includes('exited')?'#e2e8f0':'#4ade80'}`, background:c.includes('exited')?'#f8fafc':'#f0fdf4' }}>
              <code style={{ fontSize:'.8rem' }}>{c}</code>
              <span style={{ fontSize:'.72rem', color:c.includes('exited')?'#94a3b8':'#16a34a' }}>{c.includes('exited')?'done':'▶ running'}</span>
            </div>
          ))}
        </div>
      )}
      {phase==='push'&&(
        <div>
          {['Tag: acr.azurecr.io/pipeline:latest','Tag: acr.azurecr.io/pipeline:v1.2.3','Push layer cache (only changed layers)','Digest: sha256:a1b2c3…'].map(s=>(
            <div key={s} style={{ padding:'6px 12px', marginBottom:4, borderRadius:6, background:'#f0fdf4', border:'1px solid #4ade8044', fontSize:'.78rem', color:'#166534' }}>✓ {s}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function K8sAnimation() {
  const [replicas, setReplicas] = useState(2)
  const pods = Array.from({length:5},(_,i)=>i)
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Kubernetes Deployment — Pod Scaling</div>
      <div style={{ display:'flex', gap:4, marginBottom:16, justifyContent:'center' }}>
        {pods.map(i=>(
          <div key={i} style={{ width:52, height:52, borderRadius:10, border:`2px solid ${i<replicas?'#4f8ef7':'#e2e8f0'}`, background:i<replicas?'#eff6ff':'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', transition:'all .5s' }}>
            <div style={{ fontSize:'.65rem', fontWeight:700, color:i<replicas?'#3b82f6':'#94a3b8' }}>pod-{i+1}</div>
            <div style={{ fontSize:'.55rem', color:i<replicas?'#22c55e':'#94a3b8', marginTop:2 }}>{i<replicas?'Running':'Pending'}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
        <span style={{ fontSize:'.82rem', fontWeight:700 }}>replicas: {replicas}</span>
        <input type="range" min={1} max={5} value={replicas} onChange={e=>setReplicas(+e.target.value)} style={{ flex:1, accentColor:'#4f8ef7' }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {[{k:'Desired',v:replicas},{k:'Ready',v:replicas},{k:'Available',v:replicas},{k:'Strategy',v:'RollingUpdate'}].map(r=>(
          <div key={r.k} style={{ padding:'6px 12px', borderRadius:8, background:'white', border:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:'.78rem', color:'var(--text-secondary)' }}>{r.k}</span>
            <span style={{ fontSize:'.78rem', fontWeight:700, color:'#1e293b', fontFamily:'monospace' }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataQualityPyAnimation() {
  const [run, setRun] = useState(false)
  const [progress, setProgress] = useState(0)
  const checks = [
    {name:'isComplete(user_id)',result:'pass',pct:100},
    {name:'isComplete(event_type)',result:'pass',pct:100},
    {name:'isNonNegative(amount)',result:'fail',pct:94,note:'6% rows have amount < 0'},
    {name:'isUnique(event_id)',result:'pass',pct:100},
    {name:'isContainedIn(status,["ok","fail","pending"])',result:'fail',pct:97,note:'3% unknown status values'},
    {name:'hasSize >= 1000',result:'pass',pct:100},
  ]
  useEffect(()=>{
    if(!run)return
    if(progress>=checks.length){setRun(false);return}
    const t = setTimeout(()=>setProgress(p=>p+1),400)
    return()=>clearTimeout(t)
  },[run,progress])
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>PyDeequ Data Quality Checks</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
        {checks.slice(0,progress).map(c=>(
          <div key={c.name} style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${c.result==='pass'?'#4ade80':'#f87171'}`, background:c.result==='pass'?'#f0fdf4':'#fef2f2', display:'flex', justifyContent:'space-between', alignItems:'center', animation:'fadeIn .3s ease' }}>
            <code style={{ fontSize:'.75rem', color:'#1e293b' }}>{c.name}</code>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {c.note&&<span style={{ fontSize:'.68rem', color:'#ef4444' }}>{c.note}</span>}
              <span style={{ fontWeight:700, fontSize:'.78rem', color:c.result==='pass'?'#16a34a':'#ef4444' }}>{c.result.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
      <button onClick={()=>{setProgress(0);setRun(true)}} style={{ width:'100%', padding:'8px 0', borderRadius:8, border:'none', background:run?'#e2e8f0':'#4f8ef7', color:run?'#94a3b8':'white', cursor:run?'default':'pointer', fontWeight:700, fontSize:'.85rem' }}>{run?`Running checks... ${progress}/${checks.length}`:'▶ Run DQ Checks'}</button>
    </div>
  )
}

function PythonGilAnimation() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 800)
    return () => clearInterval(t)
  }, [])

  const threads = ['Thread 1 (I/O)', 'Thread 2 (CPU)', 'Thread 3 (CPU)']
  const active = tick % 3

  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, fontSize: '.9rem' }}>CPython GIL  -  Only 1 thread executes Python bytecode at a time</div>
      <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginBottom: 16 }}>Even with 3 threads, CPU work is serialized. I/O releases the GIL allowing other threads to run.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {threads.map((t, i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ minWidth: 120, fontSize: '.8rem', fontWeight: 600 }}>{t}</div>
            <div style={{ flex: 1, height: 28, background: 'white', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                background: i === active ? (i === 0 ? '#22c55e' : '#4f8ef7') : '#e2e8f0',
                width: i === active ? '100%' : '12%',
                transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', alignItems: 'center', paddingLeft: 10,
              }}>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: i === active ? 'white' : '#94a3b8', whiteSpace: 'nowrap' }}>
                  {i === active ? '▶ GIL acquired  -  executing' : '⏸ Waiting for GIL'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--text-4)' }}>
        💡 Use <strong>multiprocessing</strong> for CPU-bound work (bypasses GIL) · <strong>asyncio</strong> for I/O-bound work (single-threaded, cooperative)
      </div>
    </div>
  )
}

function PythonMemoryAnimation() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => (n + 1) % 4), 1200)
    return () => clearInterval(t)
  }, [])

  const objects = [
    { name: 'df: DataFrame', refcount: tick < 2 ? 2 : 1, size: '128 MB', alive: true },
    { name: 'chunk: DataFrame', refcount: tick === 1 ? 1 : 0, size: '10 MB', alive: tick === 1 },
    { name: 'config: dict', refcount: 3, size: '< 1 KB', alive: true },
    { name: 'stale_ref', refcount: tick > 2 ? 0 : 1, size: '2 MB', alive: tick <= 2 },
  ]

  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, fontSize: '.9rem' }}>CPython Memory Model  -  Reference Counting Garbage Collection</div>
      <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginBottom: 16 }}>Objects are freed immediately when refcount hits 0. Cyclic references require the cyclic GC.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {objects.map((obj) => (
          <div key={obj.name} style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: `1px solid ${obj.alive ? (obj.refcount === 0 ? '#f87171' : '#4ade80') : '#e2e8f0'}`,
            background: obj.alive ? (obj.refcount === 0 ? '#fef2f2' : '#f0fdf4') : '#f8fafc',
            opacity: obj.alive ? 1 : 0.4,
            transition: 'all 0.5s ease',
          }}>
            <div style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: 4 }}>{obj.name}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>size: {obj.size}</div>
            <div style={{ fontSize: '.75rem', marginTop: 4, fontWeight: 600, color: obj.refcount === 0 ? '#ef4444' : '#16a34a' }}>
              refcount: {obj.refcount} {obj.refcount === 0 ? '→ GC freed ♻' : '→ alive'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AsyncAnimation() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 600)
    return () => clearInterval(t)
  }, [])

  const tasks = [
    { name: 'fetch /orders (API)', phases: ['waiting', 'io', 'io', 'done', 'done', 'done'] },
    { name: 'fetch /customers (API)', phases: ['waiting', 'waiting', 'io', 'io', 'done', 'done'] },
    { name: 'query postgres (DB)', phases: ['io', 'io', 'io', 'waiting', 'done', 'done'] },
    { name: 'write S3 (I/O)', phases: ['waiting', 'waiting', 'waiting', 'io', 'io', 'done'] },
  ]

  const phase = tick % 6

  const phaseColor: Record<string, string> = {
    waiting: '#e2e8f0',
    io: '#818cf8',
    done: '#4ade80',
  }
  const phaseLabel: Record<string, string> = {
    waiting: '⏳ Waiting',
    io: '⚡ I/O Running',
    done: '✓ Done',
  }

  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, fontSize: '.9rem' }}>asyncio Event Loop  -  Single Thread, Concurrent I/O</div>
      <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginBottom: 16 }}>Event loop switches between tasks when they await I/O  -  no threads, no GIL contention.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map((task) => {
          const currentPhase = task.phases[phase]
          return (
            <div key={task.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ minWidth: 180, fontSize: '.78rem', fontWeight: 600 }}>{task.name}</div>
              <div style={{
                flex: 1, height: 26, borderRadius: 4, overflow: 'hidden',
                background: phaseColor[currentPhase],
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', paddingLeft: 10,
                transition: 'background 0.4s ease',
              }}>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: currentPhase === 'waiting' ? '#94a3b8' : 'white' }}>
                  {phaseLabel[currentPhase]}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--text-4)' }}>
        💡 All 4 tasks run on <strong>1 thread</strong>  -  asyncio.gather() fires them concurrently, event loop resumes each when I/O completes
      </div>
    </div>
  )
}
