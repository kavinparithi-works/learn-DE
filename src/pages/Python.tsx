import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete, unmarkTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: (id?: string) => void; onUnmark: (id: string) => void }

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

export default function Python({ completed, onComplete, onUnmark }: Props) {
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

          <PythonGilAnimation />

          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>The GIL in one sentence:</strong> CPython's Global Interpreter Lock allows only ONE thread to execute Python bytecode at a time  -  even on multi-core machines. Threads help for I/O-bound work (network, disk) because the GIL is released during blocking I/O. For CPU-bound work (parsing, hashing, computation) you need <code>multiprocessing</code> or offload to a compiled extension. PySpark runs transformations in the JVM  -  the GIL is irrelevant to Spark's distributed execution.
            </div>
          </div>

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

          <Quiz topicId="py-execution" questions={[
            { question: "The Python GIL means that even on a 16-core machine, CPython threads can:", options: ["Execute Python bytecode fully in parallel across all cores", "Execute only one thread's Python bytecode at a time", "Execute I/O and CPU code in parallel simultaneously", "Never be used  -  only processes are allowed"], correct: 1 },
            { question: "For a CPU-bound pipeline task (e.g., parsing 10 GB of JSON files), the correct Python parallelism tool is:", options: ["threading.Thread  -  fastest for all tasks", "asyncio.gather  -  best for computation", "multiprocessing.Pool  -  bypasses the GIL with separate processes", "concurrent.futures.ThreadPoolExecutor  -  releases the GIL for CPU work"], correct: 2 },
            { question: "Why does PySpark not suffer from Python's GIL during data transformations?", options: ["PySpark uses PyPy which has no GIL", "PySpark automatically disables the GIL at startup", "Spark transformations execute in the JVM (Java/Scala workers)  -  Python only drives the driver logic", "PySpark uses asyncio internally"], correct: 2 },
          ]} />
          <button onClick={async () => { if (completed.has('py-execution')) { await unmarkTopicComplete('py-execution'); onUnmark('py-execution') } else { await markTopicComplete('py-execution'); onComplete('py-execution') } }} className={`complete-btn-inline${completed.has('py-execution') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-execution') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-types ──────────────────────────────────────────────────── */}
        <section id="py-types" ref={el => { if (el) sectionRefs.current['py-types'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Type System & Type Hints</h1>
            <p className="topic-desc">Python is dynamically typed at runtime but supports static type annotations checked by tools like mypy and Pyright. In production data pipelines, type hints are not optional  -  they prevent entire classes of bugs, make IDE auto-complete reliable, and serve as living documentation for schema contracts.</p>
          </div>

          <TypeHintsAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Type hints are zero-cost at runtime.</strong> Python ignores annotations during execution  -  they exist purely for static analysis tools (mypy, Pyright, Ruff) and IDEs. Use <code>from __future__ import annotations</code> at the top of files to make all annotations lazy strings (faster import, allows forward references).
            </div>
          </div>

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

          <Quiz topicId="py-types" questions={[
            { question: "In Python, type hints like 'def fn(x: int) -> str' are:", options: ["Enforced at runtime  -  TypeError raised if violated", "Purely for static analysis tools (mypy/Pyright) and IDEs  -  ignored at runtime", "Compiled to C checks for performance", "Only valid in Python 3.12+"], correct: 1 },
            { question: "Which typing construct is best for defining the exact shape of a dictionary (like a JSON schema) with static checking?", options: ["dict[str, Any]  -  most flexible", "TypedDict  -  key names and value types are statically checked", "dataclass  -  required for dict-like objects", "NamedTuple  -  always use instead of TypedDict"], correct: 1 },
            { question: "A Protocol in Python's typing system enables:", options: ["Multiple inheritance without MRO issues", "Structural subtyping  -  any class with matching methods satisfies the Protocol, no explicit inheritance needed", "Runtime interface enforcement like Java interfaces", "Abstract method enforcement identical to ABC"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-types')) { await unmarkTopicComplete('py-types'); onUnmark('py-types') } else { await markTopicComplete('py-types'); onComplete('py-types') } }} className={`complete-btn-inline${completed.has('py-types') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-types') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-structures ─────────────────────────────────────────────── */}
        <section id="py-structures" ref={el => { if (el) sectionRefs.current['py-structures'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Data Structures & Big-O</h1>
            <p className="topic-desc">Choosing the right data structure is a multiplier on pipeline performance. A membership test that costs O(n) in a list costs O(1) in a set. A priority queue implemented with a sorted list costs O(n log n) per insert; heapq costs O(log n). These differences dominate at pipeline scale.</p>
          </div>

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

          <Quiz topicId="py-structures" questions={[
            { question: "You need to check whether a user_id has already been processed (deduplication in a pipeline loop with 50M records). Which structure gives O(1) lookup?", options: ["list  -  simple and readable", "set  -  O(1) average-case hash lookup", "sorted list with bisect  -  O(log n)", "tuple  -  immutable so faster"], correct: 1 },
            { question: "You need to maintain the top-100 highest-value orders seen so far in a streaming pipeline without sorting the entire stream. The right structure is:", options: ["A sorted list  -  always O(1) access", "heapq (min-heap of size 100)  -  O(log 100) per insert, O(1) peek at min", "Counter.most_common()  -  designed for top-K", "deque(maxlen=100)  -  automatically evicts old items"], correct: 1 },
            { question: "collections.defaultdict(list) vs a plain dict: what problem does defaultdict solve?", options: ["defaultdict is faster for all operations", "defaultdict auto-initialises missing keys with the factory value, eliminating if-key-not-in-dict boilerplate", "defaultdict allows non-hashable keys", "defaultdict is thread-safe; plain dict is not"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-structures')) { await unmarkTopicComplete('py-structures'); onUnmark('py-structures') } else { await markTopicComplete('py-structures'); onComplete('py-structures') } }} className={`complete-btn-inline${completed.has('py-structures') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-structures') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-comprehensions ─────────────────────────────────────────── */}
        <section id="py-comprehensions" ref={el => { if (el) sectionRefs.current['py-comprehensions'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Comprehensions & Generators Intro</h1>
            <p className="topic-desc">Comprehensions are Python's most idiomatic feature for building collections. They're faster than equivalent for-loops because the iteration is implemented in C inside the interpreter. Generator expressions look identical but produce values lazily  -  critical when processing files or streams that don't fit in memory.</p>
          </div>

          <ComprehensionAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Rule of thumb:</strong> Use a <em>list comprehension</em> when you need the full collection in memory (e.g., passing to a function). Use a <em>generator expression</em> when you're immediately iterating or aggregating (e.g., <code>sum()</code>, <code>max()</code>, writing to a file row-by-row). Never use a list comprehension just to feed it into <code>for x in [...]</code>.
            </div>
          </div>

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

          <Quiz topicId="py-comprehensions" questions={[
            { question: "You need to compute the sum of a column across a 10 GB JSONL file that doesn't fit in RAM. Which approach is correct?", options: ["[row['amount'] for row in iter_file(path)] then sum()  -  fast because list comp is optimised", "sum(row['amount'] for row in iter_file(path))  -  generator expression never materialises the full list", "pd.read_json(path)['amount'].sum()  -  pandas always handles large files efficiently", "map(lambda r: r['amount'], iter_file(path)) then sum()  -  map is lazy so identical"], correct: 1 },
            { question: "A list comprehension is generally faster than an equivalent for-loop + append because:", options: ["The Python interpreter optimises list comps with multi-threading", "The iteration loop executes in C within CPython, avoiding per-iteration Python bytecode overhead", "List comps are compiled to native machine code at parse time", "CPython pre-allocates the list at a fixed size to avoid reallocation"], correct: 1 },
            { question: "What is the key difference between [x*2 for x in data] and (x*2 for x in data)?", options: ["Brackets vs parentheses is purely stylistic  -  behaviour is identical", "The list comprehension builds the full list in memory immediately; the generator expression yields values one at a time lazily", "Generator expressions are always faster than list comprehensions", "List comprehensions support filtering with if; generator expressions do not"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-comprehensions')) { await unmarkTopicComplete('py-comprehensions'); onUnmark('py-comprehensions') } else { await markTopicComplete('py-comprehensions'); onComplete('py-comprehensions') } }} className={`complete-btn-inline${completed.has('py-comprehensions') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-comprehensions') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-functions" ref={el => { if (el) sectionRefs.current['py-functions'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Functions, args/kwargs, closures, functools</h1><p className="topic-desc">Python functions are first-class objects. Mastering args/kwargs, closures, functools.partial, and lru_cache is essential for building flexible, reusable pipeline components.</p></div>
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

          <Quiz topicId="py-functions" questions={[
            { question: "What is the difference between *args and **kwargs?", options: ["*args captures keyword args; **kwargs captures positional args", "*args captures extra positional args as a tuple; **kwargs captures extra keyword args as a dict", "*args and **kwargs are identical", "*args is for integers; **kwargs is for strings"], correct: 1 },
            { question: "What does functools.lru_cache do?", options: ["Runs functions in parallel", "Memoizes function results  -  returns cached output for repeated identical inputs", "Converts a function to a generator", "Adds retry logic to a function"], correct: 1 },
            { question: "What does functools.partial do?", options: ["Partially evaluates a function and returns a generator", "Creates a new function with some arguments pre-filled", "Splits a function into multiple steps", "Makes a function thread-safe"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-functions')) { await unmarkTopicComplete('py-functions'); onUnmark('py-functions') } else { await markTopicComplete('py-functions'); onComplete('py-functions') } }} className={`complete-btn-inline${completed.has('py-functions') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-functions') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-generators" ref={el => { if (el) sectionRefs.current['py-generators'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Generators &amp; itertools</h1><p className="topic-desc">Generators are the cornerstone of memory-efficient data pipelines in Python. itertools provides lazy, composable building blocks for data stream processing.</p></div>
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

          <Quiz topicId="py-generators" questions={[
            { question: "Why are generator functions preferred over returning a list for large dataset streaming?", options: ["Generators are always faster", "Generators yield one item at a time using O(1) memory; returning a list requires O(n) memory for the full dataset", "Generators run in parallel automatically", "Generators bypass the GIL"], correct: 1 },
            { question: "What does itertools.islice do?", options: ["Slices a list in place", "Lazily takes the first N items from any iterator without consuming the rest", "Creates a slice object for numpy arrays", "Splits an iterator into N equal parts"], correct: 1 },
            { question: "What requirement must be met before using itertools.groupby to group records?", options: ["Records must be stored in a dict", "Records must be sorted by the grouping key first  -  groupby only groups consecutive equal keys", "Records must be unique", "itertools.groupby has no requirements"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-generators')) { await unmarkTopicComplete('py-generators'); onUnmark('py-generators') } else { await markTopicComplete('py-generators'); onComplete('py-generators') } }} className={`complete-btn-inline${completed.has('py-generators') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-generators') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-decorators" ref={el => { if (el) sectionRefs.current['py-decorators'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Decorators</h1><p className="topic-desc">Decorators let you wrap functions with cross-cutting concerns (logging, retry, timing, caching) without modifying business logic. They are the backbone of clean, DRY pipeline code.</p></div>
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

          <Quiz topicId="py-decorators" questions={[
            { question: "Why is @functools.wraps(func) important when writing decorators?", options: ["It speeds up the wrapped function", "It copies the original function's __name__, __doc__, and __module__ to the wrapper  -  without it, introspection and debugging break", "It makes the decorator re-entrant", "It enables the decorator to accept arguments"], correct: 1 },
            { question: "When decorators are stacked as @A @B @C def func(), in what order are they applied?", options: ["A first, then B, then C (top to bottom)", "C first, then B, then A (bottom to top  -  C wraps func, B wraps that, A wraps that)", "All three are applied simultaneously", "Order depends on function signature"], correct: 1 },
            { question: "What advantage does a class-based decorator have over a function-based decorator?", options: ["Class decorators are faster", "Class decorators can maintain state (instance variables) across multiple calls", "Class decorators don't need functools.wraps", "Class decorators can decorate classes but not functions"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-decorators')) { await unmarkTopicComplete('py-decorators'); onUnmark('py-decorators') } else { await markTopicComplete('py-decorators'); onComplete('py-decorators') } }} className={`complete-btn-inline${completed.has('py-decorators') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-decorators') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-oop" ref={el => { if (el) sectionRefs.current['py-oop'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">OOP, ABC, Protocol, dataclasses, __slots__</h1><p className="topic-desc">Python's OOP supports multiple inheritance, abstract base classes, structural typing via Protocol, and zero-boilerplate value objects with dataclasses. Understanding MRO and __dunder__ methods is critical for building reusable DE frameworks.</p></div>
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

          <Quiz topicId="py-oop" questions={[
            { question: "What is the difference between ABC (Abstract Base Class) and Protocol in Python?", options: ["They are identical", "ABC requires explicit inheritance (nominal typing); Protocol uses structural/duck typing  -  any class with the right methods satisfies it", "Protocol requires explicit inheritance; ABC uses duck typing", "ABC is faster; Protocol is for type checking only"], correct: 1 },
            { question: "What does @dataclass(frozen=True) do?", options: ["Prevents the dataclass from being serialized", "Makes the dataclass immutable and hashable (raises FrozenInstanceError on assignment)", "Freezes all class variables to their defaults", "Prevents subclassing"], correct: 1 },
            { question: "What is the purpose of __slots__ in a dataclass?", options: ["Enables multiple inheritance", "Replaces __dict__ with a fixed-size slot array, reducing per-instance memory by ~40%  -  important when creating millions of record objects", "Allows the class to be used as a context manager", "Enables the class to be iterated"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-oop')) { await unmarkTopicComplete('py-oop'); onUnmark('py-oop') } else { await markTopicComplete('py-oop'); onComplete('py-oop') } }} className={`complete-btn-inline${completed.has('py-oop') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-oop') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-context" ref={el => { if (el) sectionRefs.current['py-context'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Context Managers</h1><p className="topic-desc">Context managers guarantee resource cleanup even when exceptions occur. __enter__/__exit__, contextlib.contextmanager, suppress, and ExitStack are essential for robust database connections, file handles, and distributed locks.</p></div>
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

          <Quiz topicId="py-context" questions={[
            { question: "What does __exit__ returning False (or None) mean in a context manager?", options: ["The context manager failed", "The exception (if any) is re-raised after __exit__ runs  -  returning True would suppress it", "The resource was not released", "The context manager will retry"], correct: 1 },
            { question: "What is the advantage of @contextlib.contextmanager over writing a full class?", options: ["It is always faster", "It lets you write a context manager as a generator function with a single yield  -  much less boilerplate", "It supports async operations automatically", "It allows multiple yields"], correct: 1 },
            { question: "When should you use contextlib.ExitStack?", options: ["When you need to suppress all exceptions", "When the number of context managers to open is determined at runtime  -  ExitStack manages an arbitrary dynamic list of them", "When you need nested transactions", "When context managers don't have __exit__"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-context')) { await unmarkTopicComplete('py-context'); onUnmark('py-context') } else { await markTopicComplete('py-context'); onComplete('py-context') } }} className={`complete-btn-inline${completed.has('py-context') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-context') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-errors" ref={el => { if (el) sectionRefs.current['py-errors'] = el }} className="topic-section">
          <div className="topic-header"><div className="topic-eyebrow">Level 5 - Python for Data Engineering</div><h1 className="topic-title">Error Handling, Custom Exceptions &amp; Logging</h1><p className="topic-desc">Robust pipelines need structured error handling with custom exception hierarchies, exception chaining (raise X from Y), and structured logging. structlog and Python's logging module are the standard tools.</p></div>
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

          <Quiz topicId="py-errors" questions={[
            { question: "What is the purpose of 'raise NewException from original_exception' in Python?", options: ["It suppresses the original exception", "It raises a new exception while explicitly chaining the original as __cause__, preserving the full error context", "It logs both exceptions", "It retries the operation after the original exception"], correct: 1 },
            { question: "Why define a custom exception hierarchy (e.g. DataQualityError inheriting PipelineError) instead of using generic Exception?", options: ["Custom exceptions are always faster", "A hierarchy allows callers to catch at different granularities  -  catch DataQualityError for DQ issues, PipelineError for any pipeline failure, Exception as last resort", "Python requires custom exceptions for logging", "Generic exceptions cannot be re-raised"], correct: 1 },
            { question: "When does the finally block execute in a try/except/finally?", options: ["Only when no exception is raised", "Only when an exception is raised", "Always  -  whether an exception was raised, caught, or not raised at all", "Only after the except block completes"], correct: 2 },
          ]} />
          <button onClick={async () => { if (completed.has('py-errors')) { await unmarkTopicComplete('py-errors'); onUnmark('py-errors') } else { await markTopicComplete('py-errors'); onComplete('py-errors') } }} className={`complete-btn-inline${completed.has('py-errors') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-errors') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-async" ref={el => { if (el) sectionRefs.current['py-async'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Async Programming & asyncio</h1>
            <p className="topic-desc">asyncio enables high-throughput I/O-bound pipelines  -  concurrent API calls, database queries, and file operations on a single thread. async/await, gather, aiohttp, and asyncpg are the core primitives.</p>
          </div>
          <div className="callout callout-info"><span className="callout-icon">💡</span><div className="callout-body"><strong>Concurrency vs Parallelism:</strong> asyncio is single-threaded cooperative concurrency  -  ideal for I/O-bound work (network, DB). For CPU-bound work, use multiprocessing or concurrent.futures.ProcessPoolExecutor instead.</div></div>
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
          <Quiz topicId="py-async" questions={[
            { question: "What does asyncio.gather() do?", options: ["Runs coroutines sequentially one by one", "Runs multiple coroutines concurrently on the event loop and waits for all to finish", "Creates a thread pool for async tasks", "Converts async functions to synchronous ones"], correct: 1 },
            { question: "Why use asyncio.Semaphore when making concurrent API requests?", options: ["To make requests sequential", "To cap the number of concurrent requests  -  prevents overwhelming the API server with too many simultaneous connections", "To retry failed requests automatically", "To add authentication headers"], correct: 1 },
            { question: "What is the difference between asyncio concurrency and multiprocessing?", options: ["asyncio uses multiple CPU cores; multiprocessing uses one", "asyncio is single-threaded cooperative concurrency for I/O-bound tasks; multiprocessing spawns separate processes for CPU-bound work", "asyncio is faster for all workloads", "multiprocessing is for I/O; asyncio is for CPU tasks"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-async')) { await unmarkTopicComplete('py-async'); onUnmark('py-async') } else { await markTopicComplete('py-async'); onComplete('py-async') } }} className={`complete-btn-inline${completed.has('py-async') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-async') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-io" ref={el => { if (el) sectionRefs.current['py-io'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">File I/O, pathlib, CSV, JSON, YAML, TOML & Config</h1>
            <p className="topic-desc">Data engineers read and write files constantly. pathlib provides modern OS-agnostic path handling. Parsing CSV, JSON, YAML, TOML, and .env files correctly is fundamental for building configurable, portable pipeline code.</p>
          </div>
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
          <Quiz topicId="py-io" questions={[
            { question: "Why use yaml.safe_load() instead of yaml.load() for config files?", options: ["safe_load is faster", "yaml.load() can execute arbitrary Python code embedded in YAML; safe_load restricts to safe types only", "safe_load supports more YAML features", "yaml.load() is deprecated"], correct: 1 },
            { question: "What advantage does pathlib.Path have over os.path string manipulation?", options: ["pathlib is faster than os.path", "pathlib provides an object-oriented API with / operator for joining, .stem/.suffix/.parent properties, and cross-platform path handling", "pathlib supports cloud paths natively", "pathlib paths are immutable"], correct: 1 },
            { question: "Why use load_dotenv() for environment variables in pipelines?", options: ["It encrypts environment variables", "It loads key=value pairs from a .env file into os.environ, enabling local development without setting system env vars  -  the .env file is gitignored", "It validates environment variable types", "It synchronizes env vars across machines"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-io')) { await unmarkTopicComplete('py-io'); onUnmark('py-io') } else { await markTopicComplete('py-io'); onComplete('py-io') } }} className={`complete-btn-inline${completed.has('py-io') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-io') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-regex" ref={el => { if (el) sectionRefs.current['py-regex'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Regular Expressions (re module)</h1>
            <p className="topic-desc">Regular expressions are essential for parsing log files, extracting data from unstructured text, validating formats, and transforming messy strings in ETL pipelines.</p>
          </div>
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
          <Quiz topicId="py-regex" questions={[
            { question: "What is the difference between re.match() and re.search()?", options: ["They are identical", "re.match() only matches at the beginning of the string; re.search() scans the entire string for a match", "re.search() is faster than re.match()", "re.match() returns all matches; re.search() returns the first only"], correct: 1 },
            { question: "Why use re.compile() when applying a pattern inside a loop?", options: ["compile() makes the pattern case-insensitive", "Compiled patterns are parsed once and reused  -  avoids re-parsing the regex string on every iteration", "compile() is required for group extraction", "compile() enables multiline matching"], correct: 1 },
            { question: "What does the non-greedy quantifier *? do differently from *?", options: ["*? matches zero occurrences; * matches one or more", "*? matches as few characters as possible; * is greedy and matches as many as possible", "*? is case-insensitive; * is case-sensitive", "They are identical"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-regex')) { await unmarkTopicComplete('py-regex'); onUnmark('py-regex') } else { await markTopicComplete('py-regex'); onComplete('py-regex') } }} className={`complete-btn-inline${completed.has('py-regex') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-regex') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-testing" ref={el => { if (el) sectionRefs.current['py-testing'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Testing with pytest  -  fixtures, parametrize, mocking</h1>
            <p className="topic-desc">Quality data pipelines need automated tests. pytest fixtures provide reusable test setup, parametrize covers edge cases efficiently, and unittest.mock patches external dependencies so tests run without real DBs or APIs.</p>
          </div>
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
          <Quiz topicId="py-testing" questions={[
            { question: "What is a pytest fixture and why use it?", options: ["A hard-coded test value", "A reusable setup/teardown function that pytest injects into test functions  -  enables DRY test code and proper resource cleanup", "A test assertion helper", "A way to skip tests conditionally"], correct: 1 },
            { question: "What does @pytest.mark.parametrize do?", options: ["Marks a test as expected to fail", "Runs the same test function with multiple different input/output combinations  -  reduces duplicate test code", "Skips the test in CI", "Runs tests in parallel"], correct: 1 },
            { question: "When mocking with unittest.mock.patch, what does the mock replace?", options: ["The test function itself", "The named object in the module under test for the duration of the test, then restores the original", "All functions in the test file", "Only the return value of the patched function"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-testing')) { await unmarkTopicComplete('py-testing'); onUnmark('py-testing') } else { await markTopicComplete('py-testing'); onComplete('py-testing') } }} className={`complete-btn-inline${completed.has('py-testing') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-testing') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-packages" ref={el => { if (el) sectionRefs.current['py-packages'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Package Management  -  pip, venv, poetry, pyproject.toml</h1>
            <p className="topic-desc">Reproducible Python environments are critical for data pipelines. Understanding virtual environments, pyproject.toml, poetry, and conda prevents the "works on my machine" problem and enables reliable CI/CD deployments.</p>
          </div>
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
          <Quiz topicId="py-packages" questions={[
            { question: "What is the purpose of a virtual environment in Python?", options: ["To run Python faster", "To isolate project dependencies from the system Python and other projects  -  prevents version conflicts", "To enable async programming", "To compile Python to bytecode"], correct: 1 },
            { question: "What does 'pip freeze > requirements.txt' do and when should you use it?", options: ["Installs packages from requirements.txt", "Saves a snapshot of all currently installed packages with exact versions  -  use before committing to pin a reproducible environment", "Updates all packages to latest versions", "Checks for conflicting dependencies"], correct: 1 },
            { question: "What advantage does poetry have over plain pip + requirements.txt?", options: ["poetry is faster at installing packages", "poetry manages a lock file with transitive dependencies, handles virtual environments automatically, and separates dev/prod dependency groups in pyproject.toml", "poetry supports conda packages", "poetry automatically publishes to PyPI"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-packages')) { await unmarkTopicComplete('py-packages'); onUnmark('py-packages') } else { await markTopicComplete('py-packages'); onComplete('py-packages') } }} className={`complete-btn-inline${completed.has('py-packages') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-packages') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-pandas" ref={el => { if (el) sectionRefs.current['py-pandas'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">pandas Deep Dive for Data Engineering</h1>
            <p className="topic-desc">pandas is the workhorse of Python-based data pipelines. Mastering dtype optimization, vectorized operations, groupby, merge, pivot_table, memory management, and chunked reading is essential for handling real-world datasets efficiently.</p>
          </div>
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
          <Quiz topicId="py-pandas" questions={[
            { question: "Why use dtype='category' for a column like event_type in pandas?", options: ["It enables sorting", "It stores unique string values once and uses integer codes internally  -  reduces memory from O(n strings) to O(unique strings + n ints)", "It speeds up merge operations", "It enables SQL-style queries"], correct: 1 },
            { question: "What is the key reason to avoid df.apply(lambda row: ..., axis=1) for arithmetic?", options: ["apply() has a bug with lambda functions", "apply() runs a Python function per row in a Python loop  -  vectorized pandas/numpy ops run in C and are 10-100x faster", "apply() doesn't support arithmetic", "apply() produces incorrect results with float columns"], correct: 1 },
            { question: "What does pd.read_csv(path, chunksize=100_000) return?", options: ["A DataFrame with the first 100,000 rows", "A TextFileReader iterator that yields DataFrames of 100,000 rows at a time  -  enables processing files larger than RAM", "A list of 100,000 DataFrames", "An error if the file has more than 100,000 rows"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-pandas')) { await unmarkTopicComplete('py-pandas'); onUnmark('py-pandas') } else { await markTopicComplete('py-pandas'); onComplete('py-pandas') } }} className={`complete-btn-inline${completed.has('py-pandas') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-pandas') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-db" ref={el => { if (el) sectionRefs.current['py-db'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Database Connections  -  psycopg2, SQLAlchemy, Connection Pooling</h1>
            <p className="topic-desc">Proper database connection management prevents connection leaks, ensures transactional integrity, and maximizes throughput. psycopg2 for direct Postgres, SQLAlchemy for ORM/abstraction, and connection pooling for high-concurrency workloads.</p>
          </div>
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
          <Quiz topicId="py-db" questions={[
            { question: "What is the advantage of psycopg2.extras.execute_values over executemany?", options: ["execute_values is the standard API; executemany is deprecated", "execute_values sends all rows in one or few SQL statements; executemany sends one statement per row  -  execute_values is typically 10-100x faster for bulk loads", "execute_values supports transactions; executemany does not", "execute_values works with any database; executemany is PostgreSQL-only"], correct: 1 },
            { question: "What does pool_pre_ping=True do in SQLAlchemy?", options: ["Pings the DB to measure latency before each query", "Tests each connection for liveness before checking it out from the pool  -  prevents 'connection already closed' errors after network drops", "Limits the number of connections to the pool size", "Enables connection compression"], correct: 1 },
            { question: "Why use parameterized queries (text() with :param) instead of string formatting for SQL?", options: ["Parameterized queries are faster", "String formatting creates SQL injection vulnerabilities  -  parameterized queries safely escape user input", "Parameterized queries support more SQL features", "String formatting doesn't work with SQLAlchemy"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-db')) { await unmarkTopicComplete('py-db'); onUnmark('py-db') } else { await markTopicComplete('py-db'); onComplete('py-db') } }} className={`complete-btn-inline${completed.has('py-db') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-db') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-http" ref={el => { if (el) sectionRefs.current['py-http'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">HTTP Clients  -  requests, httpx, retry, pagination, rate limiting</h1>
            <p className="topic-desc">Data engineers constantly pull data from REST APIs. Handling pagination, rate limits, OAuth, retry with backoff, and session management correctly is critical for reliable API ingestion pipelines.</p>
          </div>
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
          <Quiz topicId="py-http" questions={[
            { question: "Why use a requests.Session() instead of requests.get() for repeated API calls?", options: ["Session is asynchronous; requests.get is synchronous", "Session reuses TCP connections (keep-alive), shares headers/cookies across requests, and manages cookies  -  much more efficient for many calls to the same host", "Session automatically handles retries", "requests.get() doesn't support authentication"], correct: 1 },
            { question: "What is cursor-based pagination and when is it preferred over page-number pagination?", options: ["Cursor pagination uses a database cursor", "Cursor pagination uses an opaque pointer to the next page position  -  it handles insertions/deletions correctly and is preferred for large, frequently-updated datasets where page numbers can skip or duplicate records", "Cursor pagination is faster for small datasets", "Page-number pagination always returns duplicate records"], correct: 1 },
            { question: "What HTTP status code indicates rate limiting and how should your client handle it?", options: ["404  -  retry immediately", "429 Too Many Requests  -  read the Retry-After header and sleep for that duration before retrying", "500  -  switch to a different endpoint", "401  -  refresh the OAuth token"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-http')) { await unmarkTopicComplete('py-http'); onUnmark('py-http') } else { await markTopicComplete('py-http'); onComplete('py-http') } }} className={`complete-btn-inline${completed.has('py-http') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-http') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-linux" ref={el => { if (el) sectionRefs.current['py-linux'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Linux & Shell Scripting for Data Engineers</h1>
            <p className="topic-desc">Data engineers work in Linux environments daily  -  managing file systems, scheduling jobs with cron, monitoring processes, piping data between commands, and writing robust shell scripts for pipeline orchestration.</p>
          </div>
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
          <Quiz topicId="py-linux" questions={[
            { question: "What does 'set -euo pipefail' do at the top of a bash script?", options: ["Sets environment variables", "-e exits on any error, -u treats unset variables as errors, -o pipefail catches errors in pipes  -  together they prevent silent failures", "Sets file permissions", "Enables debug output"], correct: 1 },
            { question: "What does 'xargs -P 4' do in a shell pipeline?", options: ["Limits file size to 4MB", "Runs up to 4 parallel processes of the given command  -  enables parallel file processing", "Sets process priority to 4", "Retries failed commands 4 times"], correct: 1 },
            { question: "Why use 'trap cleanup EXIT' in a shell script?", options: ["It logs all commands", "It registers a function to run when the script exits  -  whether normally or due to an error  -  ensuring cleanup always happens", "It prevents the script from exiting on errors", "It sends an exit signal to child processes"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-linux')) { await unmarkTopicComplete('py-linux'); onUnmark('py-linux') } else { await markTopicComplete('py-linux'); onComplete('py-linux') } }} className={`complete-btn-inline${completed.has('py-linux') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-linux') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        <section id="py-git" ref={el => { if (el) sectionRefs.current['py-git'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Git Deep Dive for Data Engineers</h1>
            <p className="topic-desc">Git is not just version control  -  it's the backbone of CI/CD, code review, and collaborative development. Data engineers need fluency in branching strategies, rebase vs merge, cherry-pick, bisect, hooks, and GitHub Actions for pipeline automation.</p>
          </div>
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
          <Quiz topicId="py-git" questions={[
            { question: "What is the difference between git rebase and git merge when integrating feature branches?", options: ["They are identical", "merge creates a merge commit preserving branch history; rebase replays your commits on top of the target branch creating a linear history  -  rebase is cleaner but rewrites commit hashes", "rebase is safer for shared branches; merge rewrites history", "merge is faster; rebase is more accurate"], correct: 1 },
            { question: "When should you use git cherry-pick?", options: ["When you want to merge entire branches", "When you need to apply a specific commit (e.g., a hotfix) to another branch without merging all commits from the source branch", "When you want to undo a commit", "When bisecting to find a bug"], correct: 1 },
            { question: "What does 'git bisect run <test-command>' do?", options: ["Runs tests on the current branch only", "Automates the bisect process  -  git checks out commits and runs the test command; the exit code (0=good, non-zero=bad) tells git which direction to bisect until the offending commit is found", "Bisects the codebase into modules for parallel testing", "Runs all commits in parallel"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-git')) { await unmarkTopicComplete('py-git'); onUnmark('py-git') } else { await markTopicComplete('py-git'); onComplete('py-git') } }} className={`complete-btn-inline${completed.has('py-git') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-git') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-pydantic ───────────────────────────────────────────────── */}
        <section id="py-pydantic" ref={el => { if (el) sectionRefs.current['py-pydantic'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Pydantic Data Validation</h1>
            <p className="topic-desc">Pydantic v2 is the standard library for data validation in Python data engineering. Built on Rust (via pydantic-core), it validates data at the boundary between untrusted inputs and your pipeline logic  -  parsing JSON API responses, validating pipeline configs, and enforcing schema contracts at runtime. Pydantic models serve as living documentation for your data contracts.</p>
          </div>
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

          <Quiz topicId="py-pydantic" questions={[
            { question: "In Pydantic v2, which decorator replaced the v1 @root_validator for cross-field validation that runs after all fields are set?", options: ["@field_validator(mode='all')", "@model_validator(mode='after')", "@cross_validator", "@validator(always=True)"], correct: 1 },
            { question: "What is the primary purpose of BaseSettings in pydantic-settings?", options: ["Validate JSON schemas at runtime", "Load and validate configuration from environment variables and .env files with type checking and defaults", "Store Pydantic models in a settings registry", "Configure Pydantic's validation behavior globally"], correct: 1 },
            { question: "When using Field(gt=0, lt=1_000_000) on a float field, what does 'gt' enforce?", options: ["The value must be greater than or equal to 0 (inclusive lower bound)", "The value must be strictly greater than 0 (exclusive lower bound  -  0.0 would fail validation)", "The value must be a positive integer", "The field is globally typed (gt = global type)"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-pydantic')) { await unmarkTopicComplete('py-pydantic'); onUnmark('py-pydantic') } else { await markTopicComplete('py-pydantic'); onComplete('py-pydantic') } }} className={`complete-btn-inline${completed.has('py-pydantic') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-pydantic') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-docker ─────────────────────────────────────────────────── */}
        <section id="py-docker" ref={el => { if (el) sectionRefs.current['py-docker'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Docker for Data Engineering</h1>
            <p className="topic-desc">Docker solves the "works on my machine" problem by packaging your pipeline code, dependencies, and runtime into a portable, reproducible image. For data engineers, Docker is essential for local development stacks, CI/CD pipelines, containerized Spark applications, and deploying Airflow, dbt, and other DE tools consistently across environments.</p>
          </div>
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

          <Quiz topicId="py-docker" questions={[
            { question: "Why should you use a multi-stage Docker build for a PySpark application?", options: ["Multi-stage builds allow parallel compilation of Python files", "The builder stage installs build tools and compiles dependencies; the runtime stage copies only the final artifacts  -  producing a much smaller final image without gcc, g++, and other build tools", "Multi-stage builds are required for Docker Compose", "Multi-stage builds enable hot-reloading in development"], correct: 1 },
            { question: "What is the difference between ENTRYPOINT and CMD in a Dockerfile?", options: ["They are identical  -  CMD is just an alias for ENTRYPOINT", "ENTRYPOINT defines the fixed executable that always runs; CMD provides default arguments that can be overridden at docker run time without replacing the entrypoint", "CMD runs at build time; ENTRYPOINT runs at container start", "ENTRYPOINT is for scripts; CMD is for binary executables only"], correct: 1 },
            { question: "Why should you run container processes as a non-root user in data pipelines?", options: ["Root containers are slower due to kernel overhead", "If the container is compromised or a pipeline bug escapes the container, a non-root user limits the blast radius  -  root would have full host privileges", "Docker requires non-root for bind mounts to work", "Non-root users have access to more memory"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-docker')) { await unmarkTopicComplete('py-docker'); onUnmark('py-docker') } else { await markTopicComplete('py-docker'); onComplete('py-docker') } }} className={`complete-btn-inline${completed.has('py-docker') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-docker') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-k8s ────────────────────────────────────────────────────── */}
        <section id="py-k8s" ref={el => { if (el) sectionRefs.current['py-k8s'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Kubernetes for Data Engineering</h1>
            <p className="topic-desc">Kubernetes (K8s) is the production standard for running containerized data workloads at scale. For data engineers, the key use cases are: running Spark on Kubernetes (driver + executor pods), using KubernetesPodOperator in Airflow for isolated task execution, and deploying data services (APIs, dbt, Flink) with automatic scaling and self-healing.</p>
          </div>
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

          <Quiz topicId="py-k8s" questions={[
            { question: "What is the difference between resource requests and resource limits in Kubernetes?", options: ["They are identical  -  requests and limits must always be equal", "Requests are the guaranteed allocation used for pod scheduling; limits are the hard cap  -  exceeding CPU causes throttling, exceeding memory causes OOMKill", "Limits are set by the cluster admin; requests are set by the developer", "Requests apply to memory only; limits apply to CPU only"], correct: 1 },
            { question: "When running Spark on Kubernetes, what role do executor pods play?", options: ["They run the Spark UI and store job history", "They are dynamically created by the driver pod to perform distributed computation; they are destroyed when the job finishes", "They are permanent pods that must be pre-provisioned before spark-submit", "They store shuffle data in persistent volumes only"], correct: 1 },
            { question: "What is the main advantage of using KubernetesPodOperator in Airflow over PythonOperator?", options: ["KubernetesPodOperator is always faster", "Each task runs in an isolated container with its own image, dependencies, and resource limits  -  preventing dependency conflicts between tasks and enabling fine-grained resource control", "KubernetesPodOperator has built-in retry logic that PythonOperator lacks", "KubernetesPodOperator automatically parallelizes tasks across nodes"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-k8s')) { await unmarkTopicComplete('py-k8s'); onUnmark('py-k8s') } else { await markTopicComplete('py-k8s'); onComplete('py-k8s') } }} className={`complete-btn-inline${completed.has('py-k8s') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-k8s') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-deequ ──────────────────────────────────────────────────── */}
        <section id="py-deequ" ref={el => { if (el) sectionRefs.current['py-deequ'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Data Quality with Deequ + Great Expectations</h1>
            <p className="topic-desc">Data quality (DQ) validation is a critical gate in production data pipelines. Amazon Deequ (open source, Spark-native) and Great Expectations (Python-native, multi-engine) are the two leading frameworks. They let you define constraints on your data, run them as part of your pipeline, and fail fast when data violates your contracts  -  before bad data reaches downstream consumers.</p>
          </div>
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

          <Quiz topicId="py-deequ" questions={[
            { question: "In Amazon Deequ, what is the difference between a Check and an Analyzer?", options: ["They are identical  -  Analyzers are just named Checks", "A Check defines a pass/fail constraint (e.g., isComplete, isUnique) that produces SUCCESS/ERROR; an Analyzer computes a metric (e.g., Completeness, Mean) without a pass/fail threshold", "Analyzers run on Pandas; Checks run on Spark", "Checks run during writes; Analyzers run during reads"], correct: 1 },
            { question: "What is Deequ's constraint suggestions feature and when would you use it?", options: ["It suggests SQL indexes for faster queries", "It profiles the data and auto-generates Deequ constraint code based on observed statistics  -  useful when onboarding a new dataset with no existing DQ rules", "It suggests schema changes to reduce data size", "It suggests partition strategies based on cardinality"], correct: 1 },
            { question: "What does Great Expectations DataDocs provide that raw validation results do not?", options: ["Faster validation execution", "A human-readable HTML report showing expectation definitions, validation results, and historical trends  -  useful for stakeholder communication and debugging", "Automatic data remediation", "Streaming validation in real-time"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-deequ')) { await unmarkTopicComplete('py-deequ'); onUnmark('py-deequ') } else { await markTopicComplete('py-deequ'); onComplete('py-deequ') } }} className={`complete-btn-inline${completed.has('py-deequ') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-deequ') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── py-memory ─────────────────────────────────────────────────── */}
        <section id="py-memory" ref={el => { if (el) sectionRefs.current['py-memory'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Advanced DE Python</div>
            <h1 className="topic-title">Python Memory Profiling</h1>
            <p className="topic-desc">Memory bugs in data pipelines are insidious  -  a pipeline that works on 100 MB of data crashes on 10 GB. Python's built-in tracemalloc, the memory_profiler library, and objgraph give you progressively deeper visibility into what is consuming memory. Mastering memory-efficient patterns (streaming, generators, chunked reads, explicit deletion) is what separates production-grade DE code from fragile notebook scripts.</p>
          </div>

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

          <Quiz topicId="py-memory" questions={[
            { question: "What does tracemalloc.take_snapshot().compare_to(earlier_snapshot, 'lineno') reveal?", options: ["The total memory used by the Python process at that moment", "The net memory allocated between the two snapshots broken down by source line  -  useful for identifying memory leaks in iterative pipeline code", "The time elapsed between the two snapshots", "The CPU usage per line of code"], correct: 1 },
            { question: "A Pandas pipeline processing a 10 GB CSV hits OOM. Which approach fixes this with minimal code change?", options: ["Switch to PyPy  -  it has a more efficient garbage collector", "Use pd.read_csv(path, chunksize=N) to process the file in chunks, processing and writing each chunk before reading the next", "Increase Python recursion limit with sys.setrecursionlimit()", "Use multiprocessing to read the file in parallel  -  each process uses less memory"], correct: 1 },
            { question: "In a long-running Python pipeline, why should you explicitly call 'del large_df' followed by 'gc.collect()' after you are done with a large DataFrame?", options: ["del is required before a variable can be reassigned", "CPython's reference counting frees objects immediately on del; gc.collect() handles reference cycles that reference counting alone cannot detect  -  together they ensure memory is returned to the OS promptly rather than waiting for the next GC cycle", "gc.collect() compresses memory to reduce fragmentation", "This is required for thread safety in multi-threaded pipelines"], correct: 1 },
          ]} />
          <button onClick={async () => { if (completed.has('py-memory')) { await unmarkTopicComplete('py-memory'); onUnmark('py-memory') } else { await markTopicComplete('py-memory'); onComplete('py-memory') } }} className={`complete-btn-inline${completed.has('py-memory') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('py-memory') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

      </main>
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
