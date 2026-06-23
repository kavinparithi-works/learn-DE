import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 5 - Python for DE', items: [
    { id: 'py-execution', label: 'Python Execution Model and GIL' },
    { id: 'py-structures', label: 'Data Structures and Comprehensions' },
    { id: 'py-functions', label: 'Functions, Generators, Decorators' },
    { id: 'py-oop', label: 'OOP and Design Patterns' },
    { id: 'py-errors', label: 'Error Handling and Logging' },
    { id: 'py-pandas', label: 'pandas for Data Engineering' },
    { id: 'py-linux', label: 'Linux and Shell Scripting' },
    { id: 'py-git', label: 'Git for Data Engineers' },
  ]},
]

export default function Python({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('py-execution')
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

        <section id="py-execution" ref={el => { if (el) sectionRefs.current['py-execution'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Python Execution Model and the GIL</h1>
            <p className="topic-desc">Python's execution model is unique. Understanding the GIL (Global Interpreter Lock) explains why Python uses multiprocessing for CPU-bound tasks and how PySpark bypasses this limitation entirely.</p>
          </div>

          <PythonGilAnimation />

          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body"><strong>The GIL:</strong> CPython's Global Interpreter Lock allows only ONE thread to execute Python bytecode at a time. Threads are useful for I/O-bound work (network, disk) but NOT CPU-bound (parsing, computation). PySpark runs in the JVM - the GIL doesn't apply to Spark's distributed execution.</div>
          </div>

          <CodeBlock lang="python">{`import threading, multiprocessing, concurrent.futures
import time

# I/O-bound: threads work fine (GIL released during I/O)
def fetch_url(url):
    import urllib.request
    return urllib.request.urlopen(url).read()

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
    results = list(ex.map(fetch_url, urls))  # parallel I/O

# CPU-bound: use multiprocessing (bypasses GIL, separate processes)
def compute_heavy(n):
    return sum(i * i for i in range(n))

with multiprocessing.Pool(processes=4) as pool:
    results = pool.map(compute_heavy, [10**7, 10**7, 10**7, 10**7])

# asyncio: single-threaded async I/O (event loop)
import asyncio, aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.json()

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)

asyncio.run(main())`}</CodeBlock>

          <Quiz topicId="py-execution" questions={[
            { question: "What is the Python GIL?", options: ["A garbage collector", "A lock that prevents multiple threads from executing Python bytecode simultaneously", "A network interface", "A type system"], correct: 1 },
            { question: "For CPU-bound tasks in Python, you should use:", options: ["threading", "asyncio", "multiprocessing", "coroutines"], correct: 2 },
            { question: "Why does PySpark not suffer from Python's GIL?", options: ["PySpark uses PyPy", "Spark computations run in the JVM (Java/Scala), not CPython", "PySpark disables the GIL", "PySpark uses asyncio"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('py-execution'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="py-structures" ref={el => { if (el) sectionRefs.current['py-structures'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Data Structures and Comprehensions</h1>
          </div>
          <CodeBlock lang="python">{`# List - ordered, mutable, O(1) append, O(n) search
events = ['click', 'view', 'purchase']
events.append('refund')

# Dict - key-value, O(1) lookup (hash table)
user = {'id': 1, 'name': 'Alice', 'active': True}
user.get('email', 'unknown')  # safe get with default

# Set - unique values, O(1) membership check
unique_users = {row['user_id'] for row in events_df}
active_users = set(df_active['user_id'].tolist())
new_users = active_users - existing_users  # set difference

# Tuple - immutable, useful as dict keys or namedtuples
from collections import namedtuple
Record = namedtuple('Record', ['id', 'value', 'ts'])

# Comprehensions - Pythonic and fast
squares = [x**2 for x in range(1000)]
even_map = {x: x**2 for x in range(100) if x % 2 == 0}

# defaultdict - auto-creates missing keys
from collections import defaultdict
word_count = defaultdict(int)
for word in text.split(): word_count[word] += 1

# Counter - frequency counting
from collections import Counter
top10 = Counter(words).most_common(10)

# deque - efficient queue (O(1) both ends vs list's O(n) front pop)
from collections import deque
queue = deque(maxlen=1000)  # sliding window`}</CodeBlock>
          <Quiz topicId="py-structures" questions={[
            { question: "What is the time complexity of dictionary key lookup in Python?", options: ["O(n)", "O(log n)", "O(1) average case (hash table)", "O(n log n)"], correct: 2 },
            { question: "Why use a set instead of a list for membership testing?", options: ["Sets are ordered", "Sets use O(1) hash lookup vs O(n) linear scan for lists", "Sets allow duplicates", "Sets are smaller in memory"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('py-structures'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="py-functions" ref={el => { if (el) sectionRefs.current['py-functions'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Functions, Generators, and Decorators</h1>
          </div>
          <CodeBlock lang="python">{`# Generators - lazy evaluation, memory-efficient for large datasets
def read_large_csv(filepath, chunksize=10_000):
    """Yields chunks of a large file without loading all into memory."""
    import pandas as pd
    for chunk in pd.read_csv(filepath, chunksize=chunksize):
        yield chunk

for chunk in read_large_csv('/data/10gb_file.csv'):
    process(chunk)  # only chunksize rows in memory at once

# Generator expression (lazy list comprehension)
total = sum(row['amount'] for row in db.query("SELECT amount FROM orders"))

# Decorators - wrap functions without modifying them
import functools, time, logging

def retry(max_attempts=3, delay=1):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1: raise
                    time.sleep(delay * (2 ** attempt))  # exponential backoff
        return wrapper
    return decorator

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        t = time.perf_counter()
        result = func(*args, **kwargs)
        logging.info(f"{func.__name__} took {time.perf_counter()-t:.2f}s")
        return result
    return wrapper

@retry(max_attempts=3)
@timer
def fetch_api_data(endpoint: str) -> dict:
    import requests
    return requests.get(endpoint, timeout=10).json()`}</CodeBlock>
          <Quiz topicId="py-functions" questions={[
            { question: "What is the key advantage of Python generators for large datasets?", options: ["They are faster", "They produce values lazily - only one item in memory at a time", "They run in parallel", "They avoid the GIL"], correct: 1 },
            { question: "What does @functools.wraps(func) do in a decorator?", options: ["Speeds up the function", "Preserves the original function's name and docstring metadata", "Adds type checking", "Makes the function a generator"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('py-functions'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="py-oop" ref={el => { if (el) sectionRefs.current['py-oop'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">OOP and Design Patterns</h1>
          </div>
          <CodeBlock lang="python">{`from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Protocol

# Abstract base class - forces subclasses to implement interface
class DataSource(ABC):
    @abstractmethod
    def read(self, path: str): ...
    @abstractmethod
    def write(self, df, path: str): ...

class AzureDataLakeSource(DataSource):
    def __init__(self, storage_account: str, access_key: str):
        self.account = storage_account
        self.key = access_key

    def read(self, path: str):
        from pyspark.sql import SparkSession
        return SparkSession.getActiveSession().read.parquet(path)

    def write(self, df, path: str):
        df.write.format("delta").mode("overwrite").save(path)

# Dataclass - clean value objects (no boilerplate)
@dataclass
class PipelineConfig:
    source_path: str
    target_path: str
    partition_cols: list[str]
    batch_size: int = 10_000

# Context manager - resource management
class DatabaseConnection:
    def __enter__(self):
        self.conn = connect_to_db()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
        return False  # don't suppress exceptions

with DatabaseConnection() as conn:
    conn.execute("SELECT 1")`}</CodeBlock>
          <Quiz topicId="py-oop" questions={[
            { question: "What is the purpose of an abstract base class in Python?", options: ["Improve performance", "Force subclasses to implement required methods (interface contract)", "Enable multiple inheritance", "Auto-generate __init__ methods"], correct: 1 },
            { question: "What does __exit__ return True mean in a context manager?", options: ["The resource was released", "Suppress any exception that occurred in the with block", "The connection is still open", "Exit immediately"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('py-oop'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="py-errors" ref={el => { if (el) sectionRefs.current['py-errors'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Error Handling and Logging</h1>
          </div>
          <CodeBlock lang="python">{`import logging, sys
from typing import Optional

# Structured logging for data pipelines
logging.basicConfig(
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    level=logging.INFO,
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Custom exceptions for domain errors
class PipelineError(Exception): pass
class DataQualityError(PipelineError): pass
class SchemaEvolutionError(PipelineError): pass

def process_batch(df, batch_id: int):
    logger.info(f"Processing batch {batch_id} with {df.count()} rows")
    try:
        null_count = df.filter(df['key'].isNull()).count()
        if null_count > 0:
            raise DataQualityError(f"Batch {batch_id}: {null_count} null keys")
        result = transform(df)
        logger.info(f"Batch {batch_id} complete")
        return result
    except DataQualityError:
        logger.error(f"DQ failure batch {batch_id}", exc_info=True)
        raise
    except Exception as e:
        logger.critical(f"Unexpected error batch {batch_id}: {e}", exc_info=True)
        raise PipelineError(f"Batch {batch_id} failed") from e
    finally:
        logger.debug(f"Batch {batch_id} cleanup complete")`}</CodeBlock>
          <Quiz topicId="py-errors" questions={[
            { question: "What does raise X from Y do in Python?", options: ["Raises X and suppresses Y", "Raises X and chains it to Y (exception context)", "Reraises Y", "Logs Y and raises X"], correct: 1 },
            { question: "When does the finally block execute?", options: ["Only on success", "Only on exception", "Always, whether exception occurred or not", "Only if the except block runs"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('py-errors'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="py-pandas" ref={el => { if (el) sectionRefs.current['py-pandas'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">pandas for Data Engineering</h1>
          </div>
          <CodeBlock lang="python">{`import pandas as pd
import numpy as np

# Read with explicit dtypes (avoid inferSchema guessing wrong)
df = pd.read_csv('data.csv', dtype={
    'user_id': 'int32',
    'amount': 'float64',
    'status': 'category'   # saves memory for low-cardinality strings
})

# Vectorized operations (fast, avoid row-by-row loops)
df['revenue'] = df['price'] * df['quantity']
df['date'] = pd.to_datetime(df['date_str'])
df['month'] = df['date'].dt.to_period('M')

# GroupBy + aggregation
summary = df.groupby(['region', 'month']).agg(
    total_revenue=('amount', 'sum'),
    order_count=('order_id', 'count'),
    avg_amount=('amount', 'mean')
).reset_index()

# merge (JOIN equivalent)
result = pd.merge(orders, customers, on='customer_id', how='left')

# Apply with progress (use sparingly - slow on large dfs)
from tqdm import tqdm
tqdm.pandas()
df['category'] = df['description'].progress_apply(classify_text)

# Convert to Spark (when data outgrows pandas)
spark_df = spark.createDataFrame(df)
# Or use Arrow-optimized conversion
spark.conf.set("spark.sql.execution.arrow.pyspark.enabled", "true")
spark_df = spark.createDataFrame(df)`}</CodeBlock>
          <Quiz topicId="py-pandas" questions={[
            { question: "Why should you specify dtype when reading CSV with pandas?", options: ["Faster file reading", "Prevents incorrect type inference (e.g., numeric IDs read as floats)", "Required by the API", "Enables parallel reading"], correct: 1 },
            { question: "What pandas dtype saves memory for low-cardinality string columns?", options: ["object", "string", "category", "varchar"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('py-pandas'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="py-linux" ref={el => { if (el) sectionRefs.current['py-linux'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Linux and Shell Scripting</h1>
          </div>
          <CodeBlock lang="bash">{`#!/bin/bash
set -euo pipefail  # exit on error, unset vars, pipe failures

# Data pipeline shell script
LOG_DIR="/var/log/pipelines"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/pipeline_$DATE.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

log "Starting pipeline for $DATE"

# Process files in parallel
process_file() {
    local f="$1"
    python3 ingest.py --file "$f" >> "$LOG_FILE" 2>&1
    log "Processed: $f"
}
export -f process_file log LOG_FILE

ls /data/incoming/*.parquet | xargs -P 4 -I{} bash -c 'process_file "$@"' _ {}

# Cleanup files older than 30 days
find /data/archive -name "*.parquet" -mtime +30 -delete

log "Pipeline complete"

# Cron: run daily at 2 AM
# 0 2 * * * /opt/pipelines/run_daily.sh`}</CodeBlock>
          <Quiz topicId="py-linux" questions={[
            { question: "What does 'set -euo pipefail' do in a bash script?", options: ["Sets environment variables", "Exit on error (-e), error on unset variables (-u), catch pipe failures (-o pipefail)", "Enables debug mode", "Sets file permissions"], correct: 1 },
            { question: "How do you run 4 shell commands in parallel with xargs?", options: ["xargs --parallel 4", "xargs -P 4", "xargs -t 4", "parallel 4 xargs"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('py-linux'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="py-git" ref={el => { if (el) sectionRefs.current['py-git'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 5 - Python for Data Engineering</div>
            <h1 className="topic-title">Git for Data Engineers</h1>
          </div>
          <CodeBlock lang="bash">{`# Core git workflow for data engineering teams
git init && git remote add origin https://github.com/org/de-pipeline.git

# Feature branch workflow
git checkout -b feature/add-silver-layer
git add src/transformations/silver.py tests/test_silver.py
git commit -m "feat: add silver layer transformation with deduplication"
git push origin feature/add-silver-layer

# Fixing mistakes
git reset --soft HEAD~1   # undo last commit, keep changes staged
git reset --hard HEAD~1   # undo last commit AND changes (destructive!)
git revert abc123          # create new commit that undoes abc123 (safe for main)

# Stash work in progress
git stash push -m "WIP: refactoring pipeline config"
git stash pop

# Interactive rebase to clean up commits before PR
git rebase -i HEAD~3       # squash/edit last 3 commits

# Useful aliases for data engineers
git log --oneline --graph --all    # visual branch history
git diff HEAD src/                 # what changed in src/ since last commit
git blame src/pipeline.py          # who changed each line and when

# .gitignore for data projects
# .env, credentials.json, *.parquet, /data/raw/, __pycache__/`}</CodeBlock>
          <Quiz topicId="py-git" questions={[
            { question: "What is the difference between git reset --soft and --hard?", options: ["No difference", "--soft undoes commit but keeps changes staged; --hard discards changes entirely", "--hard is safer", "--soft only works on branches"], correct: 1 },
            { question: "Why use git revert instead of git reset on a shared branch?", options: ["revert is faster", "revert creates a new commit undoing changes (safe); reset rewrites history (dangerous for shared branches)", "revert keeps the branch name", "reset cannot undo merges"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('py-git'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

      </main>
    </div>
  )
}

function PythonGilAnimation() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 800)
    return () => clearInterval(t)
  }, [])

  const threads = ['Thread 1', 'Thread 2', 'Thread 3']
  const active = tick % 3

  return (
    <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '.9rem' }}>CPython GIL - Only 1 thread executes at a time</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {threads.map((t, i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ minWidth: 80, fontSize: '.8rem', fontWeight: 600 }}>{t}</div>
            <div style={{ flex: 1, height: 24, background: 'white', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                background: i === active ? '#4f8ef7' : '#e2e8f0',
                width: i === active ? '100%' : '0%',
                transition: 'all 0.4s ease',
                display: 'flex', alignItems: 'center', paddingLeft: 8,
              }}>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: i === active ? 'white' : 'var(--text-4)' }}>
                  {i === active ? '▶ Running (GIL acquired)' : 'Waiting for GIL'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
