import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 7 - Apache Spark', items: [
    { id: 'spark-arch', label: 'Spark Architecture and DAG' },
    { id: 'spark-partitions', label: 'Partitions and Shuffles' },
    { id: 'spark-memory', label: 'Memory Management and Tuning' },
    { id: 'spark-df', label: 'DataFrame API and Optimizations' },
    { id: 'spark-udfs', label: 'UDFs vs Built-ins' },
    { id: 'spark-streaming', label: 'Structured Streaming' },
    { id: 'spark-aqe', label: 'Catalyst, AQE, and Tungsten' },
  ]},
]

export default function Spark({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('spark-arch')
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

        <section id="spark-arch" ref={el => { if (el) sectionRefs.current['spark-arch'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark</div>
            <h1 className="topic-title">Spark Architecture and DAG</h1>
            <p className="topic-desc">Spark's architecture is master-worker. The Driver coordinates; Executors compute. Every Spark job creates a DAG (Directed Acyclic Graph) that the Catalyst optimizer transforms into an efficient physical plan.</p>
          </div>
          <SparkArchAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Lazy evaluation:</strong> Spark transformations (map, filter, join) build the DAG but don't execute. Only ACTIONS (count, collect, write, show) trigger actual computation. This enables Catalyst to optimize the full plan before executing.
            </div>
          </div>
          <CodeBlock lang="python">{`# Spark Architecture concepts in code

# 1. DAG visualization
df = spark.read.parquet("/data/events")        # transformation - adds to DAG
df2 = df.filter(df.amount > 100)               # transformation - lazy
df3 = df2.groupBy("user_id").sum("amount")     # transformation - lazy
df3.explain(True)                              # show physical plan WITHOUT executing

# 2. Stages and tasks
# Wide transformations (require shuffle) = new stage boundary
# Narrow transformations (map/filter) = same stage
df_joined = large_df.join(small_df, "id", "inner")  # wide -> new stage
df_filtered = df.filter(df.amount > 0)              # narrow -> same stage

# 3. Actions trigger execution
count = df3.count()         # action - executes DAG
df3.write.parquet("/output") # action - executes DAG
df3.show(10)                 # action - partial DAG execution

# 4. Caching to avoid recomputation
df.cache()                   # store in memory (best for repeated use)
df.persist(StorageLevel.DISK_ONLY)  # spill to disk

spark.sparkContext.setJobDescription("Gold layer aggregation")  # name in Spark UI`}</CodeBlock>
          <Quiz topicId="spark-arch" questions={[
            { question: "What is lazy evaluation in Spark?", options: ["Spark is slow", "Transformations build a DAG but don't execute until an action is called", "Spark waits for all data before processing", "Caching is deferred"], correct: 1 },
            { question: "What creates a new stage boundary in Spark?", options: ["filter() operations", "Wide transformations like join() and groupBy() that require a shuffle", "count() actions", "Reading from ADLS"], correct: 1 },
            { question: "What is the Spark Driver's role?", options: ["Execute tasks on data", "Coordinate the job - create DAG, schedule tasks to executors, collect results", "Store data in memory", "Manage cluster nodes"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('spark-arch'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="spark-partitions" ref={el => { if (el) sectionRefs.current['spark-partitions'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark</div>
            <h1 className="topic-title">Partitions and Shuffles</h1>
            <p className="topic-desc">Partitioning is how Spark distributes data across executors. Shuffles (moving data between nodes) are the most expensive operation in Spark - minimize them.</p>
          </div>
          <CodeBlock lang="python">{`# Partitioning rules of thumb
# - Default: spark.sql.shuffle.partitions = 200 (often too many/few)
# - Target: 100-200MB per partition
# - Formula: total_data_size / target_partition_size

total_gb = 40  # 40GB dataset
target_mb = 128
num_partitions = int((total_gb * 1024) / target_mb)  # = 320

spark.conf.set("spark.sql.shuffle.partitions", num_partitions)

# Repartition vs Coalesce
df.repartition(320)           # full shuffle, use when INCREASING partitions
df.coalesce(10)               # no shuffle (merge), use when DECREASING for write
df.repartition("country")     # repartition by column (for partition pruning)

# Data skew - one partition has 80% of data
# Detect skew:
df.groupBy(spark_partition_id()).count().orderBy("count", ascending=False).show(5)

# Fix skew with salting
import pyspark.sql.functions as F
skewed_df = skewed_df.withColumn("salt", (F.rand() * 10).cast("int"))
other_df  = other_df.withColumn("salt", F.explode(F.array(*[F.lit(i) for i in range(10)])))

joined = skewed_df.join(other_df, ["id", "salt"]).drop("salt")

# AQE auto skew join handling (Spark 3.x)
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")`}</CodeBlock>
          <Quiz topicId="spark-partitions" questions={[
            { question: "What is the recommended partition size in Spark?", options: ["1MB", "10MB", "100-200MB", "1GB"], correct: 2 },
            { question: "When should you use coalesce() instead of repartition()?", options: ["When increasing partition count", "When decreasing partition count - coalesce avoids a full shuffle", "Never - repartition is always better", "When joining two DataFrames"], correct: 1 },
            { question: "What is data skew in Spark?", options: ["Corrupted data", "Uneven data distribution where one partition has significantly more data than others", "A network error", "Too many partitions"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('spark-partitions'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="spark-memory" ref={el => { if (el) sectionRefs.current['spark-memory'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark</div>
            <h1 className="topic-title">Memory Management and Tuning</h1>
          </div>
          <CodeBlock lang="python">{`# Spark memory model
# spark.executor.memory = total executor memory (e.g., 8g)
#   - 300MB reserved overhead (JVM, OS)
#   - usableMemory = total - overhead
#   - spark.memory.fraction (0.6) * usable = Spark memory pool
#     - Execution memory (joins, aggregations, shuffles)
#     - Storage memory (cached RDDs/DataFrames)
#   - 0.4 * usable = User memory (UDFs, Python objects)

# Recommended baseline config
spark = SparkSession.builder \\
    .config("spark.executor.memory",       "8g")
    .config("spark.executor.cores",        "4")
    .config("spark.executor.memoryOverhead","2g")  # for Python/PySpark workers
    .config("spark.memory.fraction",       "0.8")
    .config("spark.memory.storageFraction","0.3")
    .config("spark.sql.shuffle.partitions","auto")  # AQE manages this
    .getOrCreate()

# Detect memory issues
# 1. OOM: increase spark.executor.memory or reduce partition size
# 2. GC overhead: look for "GC overhead limit exceeded" in logs
# 3. Spill: check Spark UI -> Stages -> Shuffle Write (spill means disk I/O)

# Broadcast join - broadcast small table to avoid shuffle
from pyspark.sql.functions import broadcast
result = large_df.join(broadcast(small_df), "key")
# spark.sql.autoBroadcastJoinThreshold = 10MB (default)`}</CodeBlock>
          <Quiz topicId="spark-memory" questions={[
            { question: "What happens when Spark runs out of executor memory?", options: ["Job fails immediately", "Data spills to disk (NVMe), ~1000x slower than memory operations", "Spark requests more memory", "Tasks are killed"], correct: 1 },
            { question: "When should you use a broadcast join?", options: ["For all joins", "When one table is small enough to fit in executor memory (< autoBroadcastJoinThreshold)", "When tables are the same size", "When joining more than 2 tables"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('spark-memory'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="spark-df" ref={el => { if (el) sectionRefs.current['spark-df'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark</div>
            <h1 className="topic-title">DataFrame API and Optimizations</h1>
          </div>
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Core transformations
df = spark.read.format("delta").table("silver.events")

result = df \\
    .filter(F.col("event_time") >= "2024-01-01") \\
    .withColumn("hour", F.hour("event_time")) \\
    .withColumn("revenue", F.col("quantity") * F.col("price")) \\
    .withColumn("is_mobile", F.col("platform").isin("ios", "android").cast("boolean")) \\
    .withColumn("full_name", F.concat_ws(" ", "first_name", "last_name")) \\
    .dropDuplicates(["event_id"]) \\
    .na.fill({"amount": 0, "status": "unknown"})

# Window functions
w = Window.partitionBy("user_id").orderBy("event_time")
df = df.withColumn("prev_event", F.lag("event_type", 1).over(w)) \\
       .withColumn("running_total", F.sum("amount").over(w.rowsBetween(Window.unboundedPreceding, 0)))

# MERGE (upsert) with Delta
from delta.tables import DeltaTable
target = DeltaTable.forName(spark, "silver.users")
target.alias("t").merge(
    updates_df.alias("s"), "t.user_id = s.user_id"
).whenMatchedUpdateAll() \\
 .whenNotMatchedInsertAll() \\
 .execute()

# Avoid common pitfalls
# 1. Don't use collect() on large DataFrames (brings to driver memory)
# 2. Don't use Python UDFs for simple transformations (use built-in F.*)
# 3. Avoid iterative row-by-row processing (use vectorized operations)
# 4. Select only needed columns early to reduce data movement`}</CodeBlock>
          <Quiz topicId="spark-df" questions={[
            { question: "Why should you avoid collect() on large DataFrames?", options: ["It creates a shuffle", "It brings all data to the driver's memory, causing OOM", "It's deprecated", "It disables lazy evaluation"], correct: 1 },
            { question: "What does dropDuplicates(['event_id']) do?", options: ["Drops ALL duplicate rows", "Keeps only one row per unique event_id value", "Removes null event_ids", "Sorts by event_id"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('spark-df'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="spark-udfs" ref={el => { if (el) sectionRefs.current['spark-udfs'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark</div>
            <h1 className="topic-title">UDFs vs Built-in Functions</h1>
          </div>
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body"><strong>Python UDFs are slow.</strong> They serialize each row, send to Python worker (serialization overhead + GIL), get result, deserialize back. Always use built-in F.* functions. Only use UDFs for logic that truly can't be expressed with built-ins.</div>
          </div>
          <CodeBlock lang="python">{`from pyspark.sql import functions as F

# SLOW: Python UDF - row-by-row Python serialization
from pyspark.sql.functions import udf
from pyspark.sql.types import StringType

@udf(returnType=StringType())
def categorize_slow(amount):
    if amount > 1000: return "high"
    elif amount > 100: return "medium"
    return "low"

df.withColumn("category", categorize_slow(F.col("amount")))  # SLOW!

# FAST: Built-in functions - JVM, no serialization
df.withColumn("category",
    F.when(F.col("amount") > 1000, "high")
     .when(F.col("amount") > 100, "medium")
     .otherwise("low")
)  # 10-100x faster

# When you MUST use a UDF: use Pandas UDF (vectorized)
from pyspark.sql.functions import pandas_udf
import pandas as pd

@pandas_udf(StringType())
def classify_text_fast(s: pd.Series) -> pd.Series:
    """Vectorized - receives a chunk as pandas Series, not row-by-row."""
    return s.str.lower().str.replace(r'[^a-z ]', '', regex=True)

df.withColumn("clean_text", classify_text_fast(F.col("description")))`}</CodeBlock>
          <Quiz topicId="spark-udfs" questions={[
            { question: "Why are Python UDFs slow in PySpark?", options: ["They use recursion", "Each row is serialized, sent to Python process, deserialized - massive overhead", "They don't support null values", "They run on the driver not executors"], correct: 1 },
            { question: "What is a Pandas UDF and why is it faster than a regular UDF?", options: ["A UDF that uses pandas syntax", "A vectorized UDF that receives a pandas Series (batch) instead of individual rows", "A UDF that runs in parallel", "A UDF that avoids the GIL"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('spark-udfs'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="spark-streaming" ref={el => { if (el) sectionRefs.current['spark-streaming'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark</div>
            <h1 className="topic-title">Structured Streaming</h1>
          </div>
          <CodeBlock lang="python">{`# Structured Streaming = continuous batch processing on a stream

# Read from Event Hub / Kafka
stream = spark.readStream \\
    .format("eventhubs") \\
    .options(**eventhub_conf) \\
    .load()

# Stateful aggregation with watermark
# Watermark: how late data is allowed to arrive
from pyspark.sql.functions import window, col

result = stream \\
    .withWatermark("event_time", "10 minutes") \\  # allow 10min late data
    .groupBy(
        window("event_time", "5 minutes"),         # 5-minute tumbling window
        col("product_id")
    ) \\
    .agg(F.sum("amount").alias("revenue"), F.count("*").alias("events"))

# Output modes:
# - append: only new rows (stateless or after watermark)
# - update: only changed rows since last trigger
# - complete: all rows every trigger (small result sets only)

result.writeStream \\
    .format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "/checkpoints/streaming-revenue") \\
    .trigger(processingTime="1 minute") \\  # micro-batch every 1 min
    .table("gold.revenue_5min")

# Checkpointing saves: current offsets, state store
# If job restarts, it resumes from last checkpoint (exactly-once semantics)`}</CodeBlock>
          <Quiz topicId="spark-streaming" questions={[
            { question: "What is a watermark in Structured Streaming?", options: ["A data quality check", "A threshold that tells Spark how late data is allowed to arrive before being dropped", "A checkpoint file", "A trigger interval"], correct: 1 },
            { question: "What does checkpointing provide in Structured Streaming?", options: ["Faster processing", "Exactly-once semantics - job can resume from where it left off after failure", "Reduced memory usage", "Better partitioning"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('spark-streaming'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="spark-aqe" ref={el => { if (el) sectionRefs.current['spark-aqe'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark</div>
            <h1 className="topic-title">Catalyst Optimizer, AQE, and Tungsten</h1>
          </div>
          <CodeBlock lang="python">{`# Catalyst Optimizer: SQL/DataFrame -> Logical Plan -> Physical Plan
# Phases:
# 1. Analysis: resolve column names, types
# 2. Logical Optimization: predicate pushdown, column pruning, constant folding
# 3. Physical Planning: choose join strategies (broadcast vs sort-merge vs hash)
# 4. Code Generation (Tungsten): generate JVM bytecode

# Predicate pushdown - Catalyst pushes filters to data source
df.filter(col("date") == "2024-01").show()  # reads only 2024-01 partition

# Column pruning - Catalyst removes unneeded columns early
df.select("id", "amount").groupBy("id").sum("amount")  # only reads id + amount

# AQE (Adaptive Query Execution) - Spark 3.x
spark.conf.set("spark.sql.adaptive.enabled", "true")
# AQE changes the plan at RUNTIME based on actual data statistics:
# 1. Coalesces shuffle partitions (200 -> actual needed count)
# 2. Converts sort-merge join to broadcast if one side is small
# 3. Handles skewed partitions by splitting them

# Tungsten: off-heap memory, cache-aware algorithms, whole-stage code gen
spark.conf.set("spark.sql.codegen.wholeStage", "true")  # default true

# Check if a join uses broadcast
df_result.explain(True)  # look for "BroadcastHashJoin" in physical plan`}</CodeBlock>
          <Quiz topicId="spark-aqe" questions={[
            { question: "What is predicate pushdown in Catalyst?", options: ["Pushing data down to workers", "Catalyst moves filter conditions to execute at the data source, reducing data read", "A shuffle optimization", "Pushing Python code to JVM"], correct: 1 },
            { question: "What does AQE (Adaptive Query Execution) do?", options: ["Improves Python UDF performance", "Modifies the physical query plan at runtime based on actual shuffle statistics", "Reduces storage costs", "Manages executor memory"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('spark-aqe'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

      </main>
    </div>
  )
}

function SparkArchAnimation() {
  return (
    <svg viewBox="0 0 600 180" style={{ width: '100%', maxHeight: 180, borderRadius: 'var(--radius-xl)', background: '#fff7ed', border: '1px solid #fed7aa', marginBottom: 24 }}>
      {/* Driver */}
      <rect x="20" y="40" width="100" height="100" rx="8" fill="white" stroke="#f97316" strokeWidth="2"/>
      <text x="70" y="70" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="700">DRIVER</text>
      <text x="70" y="85" textAnchor="middle" fill="#94a3b8" fontSize="8">SparkContext</text>
      <text x="70" y="100" textAnchor="middle" fill="#94a3b8" fontSize="8">DAG Scheduler</text>
      <text x="70" y="115" textAnchor="middle" fill="#94a3b8" fontSize="8">Task Scheduler</text>

      {/* Cluster Manager */}
      <rect x="220" y="60" width="120" height="60" rx="8" fill="white" stroke="#8b5cf6" strokeWidth="2"/>
      <text x="280" y="85" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontWeight="700">CLUSTER MGR</text>
      <text x="280" y="100" textAnchor="middle" fill="#94a3b8" fontSize="8">Spark/YARN/K8s</text>

      {/* Executors */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={430} y={20 + i * 50} width={120} height={40} rx="6" fill="white" stroke="#22c55e" strokeWidth="1.5"/>
          <text x={490} y={36 + i * 50} textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">Executor {i + 1}</text>
          <text x={490} y={50 + i * 50} textAnchor="middle" fill="#94a3b8" fontSize="8">Tasks | Cache</text>
        </g>
      ))}

      {/* Arrows */}
      <line x1="120" y1="90" x2="220" y2="90" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 2">
        <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite"/>
      </line>
      {[0, 1, 2].map(i => (
        <line key={i} x1="340" y1="90" x2="430" y2={40 + i * 50} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 2">
          <animate attributeName="stroke-dashoffset" from="0" to="-10" dur={`${0.8 + i * 0.2}s`} repeatCount="indefinite"/>
        </line>
      ))}
    </svg>
  )
}
