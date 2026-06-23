import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete, unmarkTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: (id?: string) => void; onUnmark: (id: string) => void }

const SECTIONS = [
  { title: 'Level 7 - Apache Spark + PySpark', items: [
    { id: 'spark-arch',             label: 'Architecture' },
    { id: 'spark-dag',              label: 'DAG & Tasks' },
    { id: 'spark-lazy',             label: 'Lazy Eval' },
    { id: 'spark-rdd',              label: 'RDD vs DataFrame' },
    { id: 'spark-reading',          label: 'Reading Data' },
    { id: 'spark-writing',          label: 'Writing Data' },
    { id: 'spark-transforms',       label: 'Transformations' },
    { id: 'spark-functions',        label: 'Built-in Functions' },
    { id: 'spark-window',           label: 'Window Functions' },
    { id: 'spark-joins',            label: 'Join Strategies' },
    { id: 'spark-partitions',       label: 'Partitioning' },
    { id: 'spark-skew',             label: 'Data Skew' },
    { id: 'spark-memory',           label: 'Memory Mgmt' },
    { id: 'spark-cache',            label: 'Caching' },
    { id: 'spark-broadcast',        label: 'Broadcast Vars' },
    { id: 'spark-udfs',             label: 'UDFs' },
    { id: 'spark-sql',              label: 'Spark SQL' },
    { id: 'spark-streaming',        label: 'Streaming' },
    { id: 'spark-streaming-state',  label: 'Stateful Stream' },
    { id: 'spark-catalyst',         label: 'Catalyst' },
    { id: 'spark-aqe',              label: 'AQE' },
    { id: 'spark-tungsten',         label: 'Tungsten' },
    { id: 'spark-config',           label: 'Perf Config' },
    { id: 'spark-ui',               label: 'Spark UI' },
    { id: 'spark-delta',            label: 'Spark + Delta' },
  ]},
  { title: 'Kafka + Streaming Internals', items: [
    { id: 'kafka-arch',         label: 'Kafka Arch' },
    { id: 'kafka-python',       label: 'Kafka Python API' },
    { id: 'kafka-eos',          label: 'Kafka EOS' },
    { id: 'kafka-connect',      label: 'Kafka Connect' },
    { id: 'kafka-schema',       label: 'Schema Registry' },
    { id: 'kafka-vs-eventhub',  label: 'Kafka vs Event Hub' },
  ]},
]

const MC_BTN = (done: boolean) => ({
  marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)',
  background: done ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'var(--green-500)',
  color: 'white', border: 'none',
  fontWeight: 700, cursor: 'pointer', fontSize: '.84rem'
}) as const

export default function Spark({ completed, onComplete, onUnmark }: Props) {
  const [activeId, setActiveId] = useState('spark-arch')
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
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) }) },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    Object.values(sectionRefs.current).forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const totalTopics = SECTIONS.flatMap(s => s.items).length
  const ref = (id: string) => (el: HTMLElement | null) => { if (el) sectionRefs.current[id] = el }
  const mc = (id: string) => async () => { if (completed.has(id)) { await unmarkTopicComplete(id); onUnmark(id) } else { await markTopicComplete(id); onComplete(id) } }

  return (
    <div className="page-with-sidebar">
      <Sidebar sections={SECTIONS} activeId={activeId} completed={completed} totalTopics={totalTopics} onItemClick={scrollTo} />
      <main className="main-content">

        {/* ─── SPARK ARCHITECTURE ─────────────────────────────────────────── */}
        <section id="spark-arch" ref={ref('spark-arch')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Spark Architecture</h1>
            <p className="topic-desc">
              Spark is a distributed compute engine built on a master-worker model. The <strong>Driver</strong> is the JVM process that hosts your application, creates the SparkContext/SparkSession, builds the logical plan, and coordinates execution. <strong>Executors</strong> are JVM processes on worker nodes that run tasks and cache data. A <strong>Cluster Manager</strong> (Standalone, YARN, or Kubernetes) allocates resources. Understanding this hierarchy is essential for debugging OOM errors, task failures, and performance tuning.
            </p>
          </div>
          <SparkArchAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>SparkSession vs SparkContext:</strong> SparkContext (pre-2.0) is the low-level entry point to the cluster. SparkSession (2.0+) wraps it and adds DataFrame/SQL support. Always use <code>SparkSession.builder</code>. Access the underlying context via <code>spark.sparkContext</code> when you need RDD operations or broadcast variables.
            </div>
          </div>
          <CodeBlock lang="python">{`from pyspark.sql import SparkSession

# Production-grade SparkSession creation (spark-submit sets most via --conf)
spark = SparkSession.builder \
    .appName("gold_layer_aggregation") \
    .config("spark.executor.memory",          "8g") \
    .config("spark.executor.cores",           "4") \
    .config("spark.executor.instances",       "10") \
    .config("spark.driver.memory",            "4g") \
    .config("spark.sql.adaptive.enabled",     "true") \
    .config("spark.sql.shuffle.partitions",   "auto") \
    .enableHiveSupport() \
    .getOrCreate()

sc = spark.sparkContext          # underlying SparkContext
sc.setLogLevel("WARN")          # reduce noise in logs
sc.setJobDescription("Agg daily revenue")  # visible in Spark UI

# Inspect cluster topology
print(f"App ID  : {sc.applicationId}")
print(f"Master  : {sc.master}")           # local[*], yarn, k8s://...
print(f"Executor memory: {spark.conf.get('spark.executor.memory')}")

# spark-submit example (production)
# spark-submit \\
#   --master yarn \\
#   --deploy-mode cluster \\          # driver runs on cluster node
#   --num-executors 20 \\
#   --executor-memory 8g \\
#   --executor-cores 4 \\
#   --driver-memory 4g \\
#   --conf spark.sql.adaptive.enabled=true \\
#   --conf spark.dynamicAllocation.enabled=true \\
#   --conf spark.dynamicAllocation.maxExecutors=50 \\
#   my_pipeline.py

# Kubernetes deploy mode
# spark-submit \\
#   --master k8s://https://<k8s-api-server> \\
#   --deploy-mode cluster \\
#   --conf spark.kubernetes.container.image=my-registry/spark:3.5 \\
#   --conf spark.kubernetes.namespace=spark-jobs \\
#   my_pipeline.py`}
          </CodeBlock>
          <Quiz topicId="spark-arch" questions={[
            {
              question: "What is the Driver's primary role in a Spark application?",
              options: [
                "Execute shuffle operations between worker nodes",
                "Host the SparkSession, build the DAG, schedule tasks to executors, and collect results",
                "Manage cluster resources and executor allocation",
                "Store cached DataFrames in memory"
              ],
              correct: 1
            },
            {
              question: "What is the difference between --deploy-mode client and --deploy-mode cluster in spark-submit?",
              options: [
                "Client mode is faster; cluster mode uses more memory",
                "In client mode the Driver runs on the submitting machine; in cluster mode the Driver runs on a cluster node  -  cluster mode is preferred for production so the driver isn't lost if the submitting shell dies",
                "Client mode supports YARN; cluster mode supports Kubernetes only",
                "There is no functional difference"
              ],
              correct: 1
            },
            {
              question: "Which cluster manager is native to Spark and requires no additional infrastructure?",
              options: ["YARN", "Kubernetes", "Mesos", "Spark Standalone mode"],
              correct: 3
            },
          ]} />
          <button onClick={mc('spark-arch')} style={MC_BTN(completed.has('spark-arch'))}>{completed.has('spark-arch') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── DAG, STAGES, TASKS ─────────────────────────────────────────── */}
        <section id="spark-dag" ref={ref('spark-dag')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">DAG, Stages, and Tasks</h1>
            <p className="topic-desc">
              Every Spark job is represented as a Directed Acyclic Graph (DAG) of stages. <strong>Narrow transformations</strong> (map, filter, withColumn) pipeline within a stage  -  each partition is processed independently with no data movement. <strong>Wide transformations</strong> (groupBy, join, repartition) require a <strong>shuffle</strong>  -  data is written to disk, transferred across the network, and re-read  -  creating a new stage boundary. Each stage is divided into <strong>tasks</strong>, one per partition, and tasks are serialized and sent to executor slots.
            </p>
          </div>
          <DagAnimation />
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Shuffles are expensive.</strong> They write all data to disk, transfer it over the network, and read it back. Every wide transformation creates one. Minimise shuffles by: filtering early, broadcasting small tables, using partition-aware operations, and enabling AQE.
            </div>
          </div>
          <CodeBlock lang="python">{`from pyspark.sql import functions as F

# ── Narrow transformations (same stage, no shuffle) ──────────────────
df = spark.read.parquet("/data/silver/events")     # Stage 0 begins
df2 = df.filter(F.col("event_date") >= "2024-01-01")  # narrow
df3 = df2.withColumn("revenue", F.col("qty") * F.col("price"))  # narrow
df4 = df3.select("user_id", "event_date", "revenue")  # narrow (column pruning)

# ── Wide transformation → Stage boundary (shuffle written to disk) ───
agg = df4.groupBy("user_id", "event_date") \    # WIDE → new Stage
          .agg(F.sum("revenue").alias("daily_rev"),
               F.count("*").alias("events"))

# ── Another wide transformation → another Stage boundary ────────────
ranked = agg.join(                               # WIDE → new Stage
    spark.table("dim.users").select("user_id", "tier"),
    "user_id", "left"
)

# Understand the physical plan BEFORE running
ranked.explain(extended=True)
# Look for: Exchange (= shuffle), Sort, BroadcastHashJoin, SortMergeJoin

# How tasks are created:
# - 1 task per INPUT partition in a stage
# - After a shuffle: spark.sql.shuffle.partitions tasks in the next stage
# - With AQE: Spark coalesces empty/small shuffle partitions automatically

# Task serialization: Spark serialises the task closure (lambda + captured vars)
# Pitfall: capturing a large object in a closure → sent to ALL tasks
huge_lookup = load_large_dict()   # BAD if used inside a map transformation
# Fix: use a broadcast variable instead (shared once per executor)
bc = sc.broadcast(huge_lookup)
df.rdd.map(lambda row: bc.value.get(row.key))

# Read the DAG in Spark UI: Jobs → click a Job → see Stage graph
# Stages in blue = completed, orange = running, grey = skipped (cached)`}
          </CodeBlock>
          <Quiz topicId="spark-dag" questions={[
            {
              question: "What causes a new stage boundary in a Spark DAG?",
              options: [
                "Any transformation (filter, select, withColumn)",
                "A wide transformation that requires a shuffle (groupBy, join, repartition, distinct)",
                "Reading a new file",
                "Calling explain()"
              ],
              correct: 1
            },
            {
              question: "How many tasks does Spark create per stage?",
              options: [
                "One task per executor",
                "One task per input partition in that stage",
                "One task per column in the DataFrame",
                "Always spark.sql.shuffle.partitions tasks"
              ],
              correct: 1
            },
            {
              question: "Why is capturing a large Python dict inside a transformation closure a problem?",
              options: [
                "Python dicts are not serializable",
                "The dict is serialized and sent to every individual task, not shared  -  use a broadcast variable instead",
                "It disables lazy evaluation",
                "It causes a shuffle"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-dag')} style={MC_BTN(completed.has('spark-dag'))}>{completed.has('spark-dag') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── LAZY EVALUATION ────────────────────────────────────────────── */}
        <section id="spark-lazy" ref={ref('spark-lazy')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Lazy Evaluation and the Execution Model</h1>
            <p className="topic-desc">
              Spark does <em>nothing</em> when you call a transformation. It records the operation in the logical plan. Only when you call an <strong>action</strong> (count, collect, show, write, save) does Spark hand the full logical plan to Catalyst for optimization, generate a physical plan, and execute. This lazy model enables optimizations impossible in eager systems: Catalyst can push filters down to the data source, prune columns before reading, reorder joins, and fold constants  -  all because it sees the <em>complete</em> query before touching any data.
            </p>
          </div>
          <LazyEvalAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Lineage for fault tolerance:</strong> Because transformations are recorded as a DAG of operations (lineage), if an executor dies mid-job, Spark can recompute only the lost partitions by replaying the lineage  -  no need for full data replication like Hadoop MapReduce's HDFS replication strategy.
            </div>
          </div>
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
import time

# ── Transformations are LAZY  -  zero computation happens here ─────────
df = spark.read.parquet("/data/silver/transactions")   # no I/O yet
df2 = df.filter(F.col("amount") > 1000)               # no compute
df3 = df2.withColumn("tax", F.col("amount") * 0.2)    # no compute
df4 = df3.groupBy("merchant_id").agg(
    F.sum("amount").alias("total"),
    F.count("*").alias("txn_count")
)                                                       # still nothing!

# ── Actions TRIGGER execution of the full DAG ────────────────────────
t0 = time.time()
total_merchants = df4.count()          # ACTION → Catalyst optimises → executes
print(f"Merchants: {total_merchants}, took {time.time()-t0:.1f}s")

df4.show(20)                           # ACTION → re-executes the full DAG!
# ↑ This is a COMMON MISTAKE  -  df4 is recomputed from scratch

# Fix: cache before multiple actions
df4.cache()
df4.count()   # first action  -  computes AND caches
df4.show(20)  # served from cache, fast

# ── Common actions ───────────────────────────────────────────────────
df.count()                    # triggers full scan
df.collect()                  # returns List[Row] to driver  -  CAREFUL on large DFs
df.take(100)                  # first 100 rows to driver (no sort guarantee)
df.first()                    # equivalent to take(1)[0]
df.show(20, truncate=False)   # prints to stdout
df.write.format("delta").mode("overwrite").save("/output/path")  # write action
df.foreach(lambda row: print(row))  # custom side-effect per row

# ── explain() shows plan WITHOUT executing ───────────────────────────
df4.explain(True)
# Output sections:
#   == Parsed Logical Plan ==       (raw AST)
#   == Analyzed Logical Plan ==     (column names resolved)
#   == Optimized Logical Plan ==    (Catalyst applied rules: pushdown, pruning)
#   == Physical Plan ==             (join strategies, exchange/shuffle details)

# ── Lineage recovery example ─────────────────────────────────────────
# If an executor holding partition 7 of df3 dies, Spark re-reads the
# source parquet, re-applies filter, re-applies withColumn for partition 7 only.
# With cache(), Spark can recover from the cached level instead of source.`}
          </CodeBlock>
          <Quiz topicId="spark-lazy" questions={[
            {
              question: "You call df.filter(...).groupBy(...).agg(...).show() then immediately df.filter(...).groupBy(...).agg(...).count(). How many times is the full DAG executed?",
              options: [
                "Once  -  Spark caches automatically",
                "Twice  -  each action re-executes the entire DAG from scratch unless you cache",
                "Zero  -  show() is not an action",
                "Depends on spark.sql.adaptive.enabled"
              ],
              correct: 1
            },
            {
              question: "What advantage does lazy evaluation give Catalyst over an eager execution model?",
              options: [
                "It reduces driver memory usage",
                "Catalyst sees the complete query plan before executing, enabling cross-operation optimisations like filter pushdown and join reordering",
                "It enables parallel reads from ADLS",
                "It prevents OOM errors automatically"
              ],
              correct: 1
            },
            {
              question: "How does Spark recover a lost partition without full data replication (unlike HDFS)?",
              options: [
                "It reads a backup copy from ADLS",
                "It replays the transformation lineage to recompute only the lost partitions",
                "It asks another executor for a copy",
                "It aborts the job and restarts"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-lazy')} style={MC_BTN(completed.has('spark-lazy'))}>{completed.has('spark-lazy') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── RDD vs DataFrame vs Dataset ────────────────────────────────── */}
        <section id="spark-rdd" ref={ref('spark-rdd')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">RDDs vs DataFrames vs Datasets</h1>
            <p className="topic-desc">
              Spark has three abstraction layers. <strong>RDDs</strong> (Resilient Distributed Datasets) are the low-level API  -  typed, unstructured partitions of JVM objects with no schema. <strong>DataFrames</strong> are distributed tables with a named schema, optimised by Catalyst and Tungsten  -  the right choice for 95% of work. <strong>Datasets</strong> are typed DataFrames available only in Scala/Java (Python has no Dataset API  -  PySpark DataFrames behave like untyped Datasets[Row]). In practice: always use DataFrames; drop to RDD only when you need low-level partition-level control unavailable in the DataFrame API.
            </p>
          </div>
          <RDDAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, LongType, DoubleType

# ── RDD API  -  avoid unless necessary ────────────────────────────────
rdd = sc.textFile("/data/raw/access_logs/*.log")         # RDD[str]
parsed = rdd.map(lambda line: line.split("\t")) \
            .filter(lambda fields: len(fields) >= 5) \
            .map(lambda f: (f[2], float(f[4])))          # RDD[(str, float)]
result_rdd = parsed.reduceByKey(lambda a, b: a + b)      # RDD[(str, sum)]
result_rdd.take(10)

# Problems with RDD:
# 1. No schema → no Catalyst optimisation
# 2. Java/Python serialisation overhead for every operation
# 3. No columnar storage → no Tungsten optimisations
# 4. Verbose API

# ── DataFrame API  -  preferred ────────────────────────────────────────
# Explicit schema (always prefer over inferSchema=True in production)
schema = StructType([
    StructField("user_id",    LongType(),   nullable=False),
    StructField("event_type", StringType(), nullable=True),
    StructField("amount",     DoubleType(), nullable=True),
    StructField("ts",         StringType(), nullable=True),
])

df = spark.read.schema(schema).json("/data/raw/events/")

# Same logic as RDD above  -  but Catalyst optimises it
result_df = df \
    .filter(F.col("amount").isNotNull()) \
    .groupBy("user_id") \
    .agg(F.sum("amount").alias("total_spend"))

# DataFrame → RDD: convert when you need partition-level iteration
# (e.g., writing to a legacy system row-by-row)
def process_partition(rows):
    conn = get_db_connection()  # create once per partition
    for row in rows:
        conn.insert(row.user_id, row.total_spend)
    conn.close()

result_df.rdd.foreachPartition(process_partition)

# ── When to use RDD ───────────────────────────────────────────────────
# 1. Unstructured data with no schema (raw text, binary)
# 2. Partition-level operations (foreachPartition for connection pooling)
# 3. Complex custom serialization
# 4. Legacy PySpark 1.x code migration

# ── Dataset API (Scala only, shown for awareness) ─────────────────────
# case class Event(userId: Long, amount: Double)
# val ds: Dataset[Event] = spark.read.parquet(...).as[Event]
# → compile-time type safety + Catalyst optimisation`}
          </CodeBlock>
          <Quiz topicId="spark-rdd" questions={[
            {
              question: "Why do DataFrames outperform RDDs for most workloads?",
              options: [
                "DataFrames are always cached in memory",
                "DataFrames have a schema, enabling Catalyst query optimisation and Tungsten's columnar, off-heap execution  -  RDDs bypass both",
                "DataFrames use more executor cores",
                "DataFrames avoid network shuffles"
              ],
              correct: 1
            },
            {
              question: "When is foreachPartition on an RDD a legitimate use case?",
              options: [
                "When you want to filter data",
                "When you need to open a connection (DB, API) once per partition rather than once per row  -  amortises connection overhead",
                "When the DataFrame API is unavailable",
                "When you need to broadcast a variable"
              ],
              correct: 1
            },
            {
              question: "Is the Dataset API available in PySpark?",
              options: [
                "Yes, via pyspark.sql.Dataset",
                "No  -  Datasets are a Scala/Java API only. PySpark DataFrames are effectively untyped Dataset[Row]",
                "Yes, but only in Spark 3.x",
                "Yes, via spark.createDataset()"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-rdd')} style={MC_BTN(completed.has('spark-rdd'))}>{completed.has('spark-rdd') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── READING DATA ───────────────────────────────────────────────── */}
        <section id="spark-reading" ref={ref('spark-reading')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Reading Data</h1>
            <p className="topic-desc">
              Spark can read from virtually any source. Understanding format-specific options  -  especially <code>inferSchema</code> vs explicit schema, <code>header</code>, <code>multiLine</code>, and predicate pushdown support  -  is critical for building reliable ingestion pipelines. Always define schemas explicitly in production; <code>inferSchema=True</code> triggers a full scan just to determine types.
            </p>
          </div>
          <ReadingAnimation />
          <CodeBlock lang="python">{`from pyspark.sql.types import *
from pyspark.sql import functions as F

# ── CSV ──────────────────────────────────────────────────────────────
schema_csv = StructType([
    StructField("order_id",    LongType(),   False),
    StructField("customer_id", IntegerType(), True),
    StructField("amount",      DoubleType(), True),
    StructField("status",      StringType(), True),
    StructField("created_at",  TimestampType(), True),
])
df_csv = spark.read \
    .format("csv") \
    .schema(schema_csv) \
    .option("header",          "true") \
    .option("sep",             ",") \
    .option("quote",           '"') \
    .option("escape",          '"') \
    .option("nullValue",       "NULL") \
    .option("timestampFormat", "yyyy-MM-dd HH:mm:ss") \
    .option("mode",            "DROPMALFORMED") \  # or PERMISSIVE / FAILFAST
    .load("abfss://raw@myaccount.dfs.core.windows.net/orders/*.csv")

# ── JSON ─────────────────────────────────────────────────────────────
df_json = spark.read \
    .format("json") \
    .option("multiLine",    "true") \    # for pretty-printed JSON files
    .option("allowComments","true") \
    .option("mode",         "PERMISSIVE") \
    .schema(schema_json) \
    .load("/data/raw/events/*.json")

# ── Parquet (columnar, best for analytics) ───────────────────────────
df_parquet = spark.read \
    .format("parquet") \
    .option("mergeSchema", "true") \     # handles schema evolution across files
    .load("/data/silver/transactions/")
# Parquet supports predicate pushdown (filters applied at file level)
# and column pruning (only requested columns read from disk)

# ── ORC ──────────────────────────────────────────────────────────────
df_orc = spark.read.format("orc").load("/data/hive/warehouse/orders/")

# ── Avro ─────────────────────────────────────────────────────────────
df_avro = spark.read.format("avro").load("/data/kafka-dump/events/")

# ── Delta ────────────────────────────────────────────────────────────
df_delta = spark.read.format("delta").load("/data/delta/orders/")
# Or via Unity Catalog:
df_delta2 = spark.table("catalog.silver.orders")
# Time travel:
df_v5 = spark.read.format("delta").option("versionAsOf", 5).load("/data/delta/orders/")
df_ts  = spark.read.format("delta").option("timestampAsOf", "2024-06-01").load("/data/delta/orders/")

# ── JDBC ─────────────────────────────────────────────────────────────
df_jdbc = spark.read \
    .format("jdbc") \
    .option("url",          "jdbc:sqlserver://myserver.database.windows.net:1433;databaseName=mydb") \
    .option("dbtable",      "(SELECT * FROM orders WHERE status='PENDING') AS t") \
    .option("user",         dbutils.secrets.get("kv", "sql-user")) \
    .option("password",     dbutils.secrets.get("kv", "sql-pass")) \
    .option("driver",       "com.microsoft.sqlserver.jdbc.SQLServerDriver") \
    .option("numPartitions","10") \          # parallelism
    .option("partitionColumn","order_id") \  # column to split on
    .option("lowerBound",   "1") \
    .option("upperBound",   "10000000") \
    .load()

# ── Kafka (Structured Streaming, also batch) ─────────────────────────
df_kafka = spark.read \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "broker1:9092,broker2:9092") \
    .option("subscribe",               "topic.orders") \
    .option("startingOffsets",         "earliest") \
    .option("endingOffsets",           "latest") \
    .load()

# Kafka value is binary  -  deserialise:
df_events = df_kafka.select(
    F.col("key").cast("string").alias("key"),
    F.from_json(F.col("value").cast("string"), schema_json).alias("data"),
    F.col("timestamp").alias("kafka_ts")
).select("key", "data.*", "kafka_ts")`}
          </CodeBlock>
          <Quiz topicId="spark-reading" questions={[
            {
              question: "Why should you always define an explicit schema rather than using inferSchema=True in production?",
              options: [
                "inferSchema doesn't work with Parquet",
                "inferSchema triggers a full scan of all data just to determine column types  -  wasting time and money on every job run",
                "inferSchema causes type errors",
                "Explicit schema uses less memory"
              ],
              correct: 1
            },
            {
              question: "What does option('mode', 'DROPMALFORMED') do when reading CSV?",
              options: [
                "Drops all rows with null values",
                "Silently drops rows that cannot be parsed against the schema, rather than failing the job",
                "Drops duplicate rows",
                "Skips the header row"
              ],
              correct: 1
            },
            {
              question: "For a JDBC read with numPartitions=10, partitionColumn='order_id', lowerBound=1, upperBound=10M  -  how does Spark parallelise the read?",
              options: [
                "It reads the full table then splits into 10 partitions in memory",
                "Spark issues 10 parallel SQL queries each covering a range of order_id values  -  one per Spark partition",
                "It reads one row at a time from 10 connections",
                "Parallelism is determined by the database, not Spark"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-reading')} style={MC_BTN(completed.has('spark-reading'))}>{completed.has('spark-reading') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── WRITING DATA ───────────────────────────────────────────────── */}
        <section id="spark-writing" ref={ref('spark-writing')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Writing Data</h1>
            <p className="topic-desc">
              Writing is an action  -  it triggers the full DAG. Key decisions: format (Parquet/Delta for analytics, CSV/JSON for interchange), <strong>save mode</strong> (append/overwrite/ignore/errorIfExists), and <strong>physical layout</strong> (partitionBy for read pruning, bucketBy+sortBy for join optimisation). The number of output files equals the number of active partitions at write time  -  control this with coalesce or repartition before writing.
            </p>
          </div>
          <WritingAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F

# ── Save modes ───────────────────────────────────────────────────────
# append          → add new files, never touch existing
# overwrite       → delete ALL existing data, write new (atomic on Delta)
# ignore          → no-op if data already exists
# errorIfExists   → raise error if data already exists (default)

df.write \
  .format("parquet") \
  .mode("overwrite") \
  .save("/data/silver/orders/")

# ── partitionBy  -  hive-style directory partitioning ──────────────────
# Creates: /data/silver/events/event_date=2024-01-01/part-00000.parquet
# → Spark skips entire directories on read when filter matches partition col
df.write \
  .format("delta") \
  .mode("append") \
  .partitionBy("event_date", "region") \
  .option("replaceWhere", "event_date >= '2024-01-01'") \  # partial overwrite
  .save("/data/delta/events/")

# ── bucketBy  -  pre-shuffle for joins ─────────────────────────────────
# Both tables bucketed on the same key with the same bucket count
# → Spark can skip the shuffle entirely during joins (co-located)
# Requires Hive metastore (saveAsTable, not save)
df.write \
  .format("parquet") \
  .bucketBy(64, "user_id") \
  .sortBy("user_id") \
  .mode("overwrite") \
  .saveAsTable("silver.events_bucketed")

# ── Control output file count ─────────────────────────────────────────
# Too many small files → metadata overhead, slow reads
# Too few large files → poor parallelism

# Reduce to N files before writing (no shuffle):
df.coalesce(10).write.format("parquet").mode("overwrite").save("/output/")

# Repartition + write gives exactly N files with even distribution:
df.repartition(20).write.format("delta").mode("overwrite").save("/output/")

# ── Compression ──────────────────────────────────────────────────────
df.write \
  .format("parquet") \
  .option("compression", "snappy") \   # snappy (default), gzip, zstd, lz4
  .mode("overwrite") \
  .save("/output/compressed/")
# zstd gives best compression ratio; snappy gives best read speed

# ── Writing to JDBC ──────────────────────────────────────────────────
df.write \
  .format("jdbc") \
  .option("url",      "jdbc:postgresql://host:5432/mydb") \
  .option("dbtable",  "staging.orders") \
  .option("user",     "user") \
  .option("password", "pass") \
  .option("batchsize","10000") \    # rows per INSERT batch
  .mode("append") \
  .save()

# ── Writing to Kafka ─────────────────────────────────────────────────
df.select(
    F.col("order_id").cast("string").alias("key"),
    F.to_json(F.struct("*")).alias("value")
).write \
  .format("kafka") \
  .option("kafka.bootstrap.servers", "broker1:9092") \
  .option("topic", "output.orders") \
  .save()`}
          </CodeBlock>
          <Quiz topicId="spark-writing" questions={[
            {
              question: "What does partitionBy('event_date') do to the physical storage?",
              options: [
                "Sorts data by event_date within each file",
                "Creates a directory per event_date value  -  Spark can skip entire directories when filtering by that column (partition pruning)",
                "Splits each file into date-based chunks",
                "Creates a Z-order index on event_date"
              ],
              correct: 1
            },
            {
              question: "When does bucketBy improve query performance?",
              options: [
                "When writing compressed files",
                "When two tables are bucketed on the same key with the same bucket count  -  Spark can skip the shuffle entirely during joins",
                "When writing to ADLS",
                "When using append mode"
              ],
              correct: 1
            },
            {
              question: "You have a 1TB DataFrame and want to write it as 100 Parquet files. You call coalesce(100). What is the risk?",
              options: [
                "coalesce fails for files > 100GB",
                "coalesce doesn't shuffle, so partitions may be very uneven  -  some files much larger than others. Use repartition(100) for even distribution",
                "It creates 200 files instead",
                "There is no risk  -  coalesce is always safe"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-writing')} style={MC_BTN(completed.has('spark-writing'))}>{completed.has('spark-writing') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── CORE TRANSFORMATIONS ───────────────────────────────────────── */}
        <section id="spark-transforms" ref={ref('spark-transforms')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Core Transformations</h1>
            <p className="topic-desc">
              The DataFrame API provides a rich transformation vocabulary. Mastering these  -  and knowing which require shuffles  -  separates efficient pipelines from slow ones. All of the following are lazy transformations; nothing executes until an action is called.
            </p>
          </div>
          <TransformsAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark.sql.types import DecimalType

df = spark.table("silver.transactions")

# ── Column selection & projection ─────────────────────────────────────
df.select("txn_id", "amount", "ts")
df.select(F.col("amount").alias("revenue"), "*")   # keep all + add alias
df.drop("internal_field", "debug_col")             # remove columns

# ── Filtering ─────────────────────────────────────────────────────────
df.filter(F.col("amount") > 100)
df.where("status = 'COMPLETED' AND amount IS NOT NULL")  # SQL string syntax
df.filter(F.col("region").isin("EU", "APAC"))
df.filter(F.col("tags").contains("premium"))

# ── Adding / modifying columns ────────────────────────────────────────
df.withColumn("tax",      F.col("amount") * 0.2)
df.withColumn("amount",   F.col("amount").cast(DecimalType(18, 2)))  # overwrite
df.withColumnRenamed("ts", "event_time")
df.withColumns({"net": F.col("amount") - F.col("fee"),              # Spark 3.3+
                "gross": F.col("amount") + F.col("tax")})

# ── Aggregations ──────────────────────────────────────────────────────
df.groupBy("merchant_id", "event_date") \
  .agg(
    F.sum("amount").alias("total_revenue"),
    F.count("*").alias("txn_count"),
    F.countDistinct("user_id").alias("unique_users"),
    F.avg("amount").alias("avg_ticket"),
    F.max("amount").alias("max_txn"),
    F.min("amount").alias("min_txn"),
    F.percentile_approx("amount", 0.95).alias("p95_amount"),
    F.first("status", ignorenulls=True).alias("first_status"),
  )

# ── Sorting ───────────────────────────────────────────────────────────
df.orderBy("event_date", F.col("amount").desc())
df.sortWithinPartitions("user_id")   # sort within partition, no shuffle

# ── Deduplication ─────────────────────────────────────────────────────
df.distinct()                            # all columns
df.dropDuplicates(["txn_id"])            # subset  -  keeps first occurrence
df.dropDuplicates(["user_id", "event_date"])

# ── Set operations ────────────────────────────────────────────────────
df1.union(df2)             # stacks by position (column names ignored)
df1.unionByName(df2)       # stacks by column name (handles column reorder)
df1.unionByName(df2, allowMissingColumns=True)   # Spark 3.1+  -  fills missing with null
df1.intersect(df2)         # rows in both (needs same schema)
df1.except_(df2)           # rows in df1 not in df2

# ── Joins ─────────────────────────────────────────────────────────────
# join types: inner, left, right, full, left_semi, left_anti, cross
df.join(dim_users, "user_id", "left")                         # equi-join
df.join(dim_users, df["user_id"] == dim_users["uid"], "inner") # different names
df.join(dim_users, ["user_id", "region"], "inner")            # composite key
df.crossJoin(dim_country)                                     # cartesian

# ── Limits ────────────────────────────────────────────────────────────
df.limit(1000)    # returns first 1000 rows (non-deterministic order without sort)

# ── Null handling ─────────────────────────────────────────────────────
df.na.fill({"amount": 0.0, "status": "UNKNOWN"})
df.na.drop(how="any", subset=["txn_id", "user_id"])  # drop if any key col is null
df.na.replace({"PENDING": "IN_PROGRESS"}, subset=["status"])`}
          </CodeBlock>
          <Quiz topicId="spark-transforms" questions={[
            {
              question: "What is the difference between union() and unionByName()?",
              options: [
                "union() is faster; unionByName() handles duplicates",
                "union() stacks by column position (risky if schemas differ); unionByName() matches by column name regardless of order",
                "They are identical in Spark 3.x",
                "union() requires a shuffle; unionByName() does not"
              ],
              correct: 1
            },
            {
              question: "You need only rows in df_new that don't exist in df_existing (by order_id). Which operation?",
              options: [
                "df_new.except_(df_existing)",
                "df_new.join(df_existing, 'order_id', 'left_anti')  -  returns only rows from the left that have NO match on the right",
                "df_new.intersect(df_existing)",
                "df_new.filter(~df_new.order_id.isin(df_existing.order_id))"
              ],
              correct: 1
            },
            {
              question: "What does sortWithinPartitions() do that orderBy() does not?",
              options: [
                "sortWithinPartitions sorts globally across all data",
                "sortWithinPartitions sorts data within each partition without a shuffle  -  useful for file-level locality before writing",
                "sortWithinPartitions uses less memory",
                "They are equivalent"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-transforms')} style={MC_BTN(completed.has('spark-transforms'))}>{completed.has('spark-transforms') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── BUILT-IN FUNCTIONS ─────────────────────────────────────────── */}
        <section id="spark-functions" ref={ref('spark-functions')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Built-in Functions Deep Dive</h1>
            <p className="topic-desc">
              <code>pyspark.sql.functions</code> contains 300+ functions that run entirely in the JVM  -  no Python serialisation. Always prefer these over Python UDFs. Categories: string, date/time, array, map, struct, JSON, aggregate, and conditional.
            </p>
          </div>
          <FunctionsAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark.sql.types import MapType, StringType, ArrayType, LongType

df = spark.table("silver.events")

# ── String functions ──────────────────────────────────────────────────
df.withColumn("full_name",    F.concat_ws(" ", "first_name", "last_name"))
df.withColumn("clean_email",  F.lower(F.trim(F.col("email"))))
df.withColumn("phone_digits", F.regexp_replace("phone", r"[^0-9]", ""))
df.withColumn("domain",       F.regexp_extract("email", r"@(.+)$", 1))
df.withColumn("parts",        F.split("full_name", " "))     # → ArrayType
df.withColumn("first_name",   F.split("full_name", " ")[0])
df.withColumn("code_sub",     F.substring("code", 1, 3))
df.withColumn("padded",       F.lpad(F.col("id").cast("string"), 10, "0"))
df.withColumn("masked",       F.overlay("card_num", F.lit("****"), 9, 4))
df.withColumn("like_match",   F.col("name").like("John%"))
df.withColumn("soundex",      F.soundex("name"))  # fuzzy name matching

# ── Date & timestamp functions ────────────────────────────────────────
df.withColumn("event_date",   F.to_date("event_ts", "yyyy-MM-dd HH:mm:ss"))
df.withColumn("event_ts2",    F.to_timestamp("ts_str", "yyyy-MM-dd'T'HH:mm:ss"))
df.withColumn("month_start",  F.date_trunc("month", "event_ts"))
df.withColumn("week_start",   F.date_trunc("week",  "event_ts"))
df.withColumn("next_day",     F.date_add("event_date", 1))
df.withColumn("age_days",     F.datediff(F.current_date(), "birth_date"))
df.withColumn("age_months",   F.months_between(F.current_date(), "birth_date"))
df.withColumn("year",         F.year("event_ts"))
df.withColumn("month",        F.month("event_ts"))
df.withColumn("day_of_week",  F.dayofweek("event_ts"))  # 1=Sunday
df.withColumn("hour",         F.hour("event_ts"))
df.withColumn("unix_ts",      F.unix_timestamp("event_ts"))
df.withColumn("from_unix",    F.from_unixtime(F.col("epoch_ms") / 1000))

# ── Array functions ───────────────────────────────────────────────────
df.withColumn("exploded",     F.explode("tags"))          # one row per array element
df.withColumn("exploded_opt", F.explode_outer("tags"))    # keeps nulls (outer)
df.withColumn("posexploded",  F.posexplode("tags"))       # adds position column
df.withColumn("flat",         F.flatten("nested_array"))  # [[a,b],[c]] → [a,b,c]
df.withColumn("has_vip",      F.array_contains("tags", "vip"))
df.withColumn("tag_count",    F.size("tags"))
df.withColumn("distinct_tags",F.array_distinct("tags"))
df.withColumn("sorted_tags",  F.array_sort("tags"))
df.withColumn("joined_tags",  F.array_join("tags", ","))
# Higher-order: transform / filter / aggregate (Spark 3.1+)
df.withColumn("upper_tags",   F.transform("tags", lambda x: F.upper(x)))
df.withColumn("long_tags",    F.filter("tags", lambda x: F.length(x) > 5))
df.withColumn("tag_lens",     F.aggregate("tags", F.lit(0),
                                           lambda acc, x: acc + F.length(x)))

# ── Map functions ─────────────────────────────────────────────────────
df.withColumn("prop_keys",    F.map_keys("properties"))
df.withColumn("prop_vals",    F.map_values("properties"))
df.withColumn("platform",     F.col("properties")["platform"])
df.withColumn("enriched",     F.map_concat("props1", "props2"))

# ── JSON functions ────────────────────────────────────────────────────
json_schema = "STRUCT<event:STRING, value:DOUBLE, tags:ARRAY<STRING>>"
df.withColumn("parsed",       F.from_json("payload", json_schema))
df.withColumn("serialized",   F.to_json(F.struct("user_id", "amount")))
df.withColumn("event_type",   F.get_json_object("payload", "$.event.type"))
df.withColumn("schema_of",    F.schema_of_json(df.select("payload").first()[0]))

# ── Conditional functions ─────────────────────────────────────────────
df.withColumn("tier",
    F.when(F.col("spend") > 10000, "platinum")
     .when(F.col("spend") > 1000,  "gold")
     .when(F.col("spend") > 100,   "silver")
     .otherwise("bronze"))

df.withColumn("val",          F.coalesce("col_a", "col_b", F.lit(0)))  # first non-null
df.withColumn("nvl_val",      F.expr("nvl(amount, 0)"))                # SQL-style
df.withColumn("nullif_val",   F.nullif("status", F.lit("N/A")))        # null if equal

# ── Aggregate functions ────────────────────────────────────────────────
df.groupBy("user_id").agg(
    F.collect_list("product_id").alias("all_products"),    # ordered list with dups
    F.collect_set("category").alias("unique_categories"), # set, no dups
    F.struct("ts", "amount").alias("latest"),              # struct aggregation
)`}
          </CodeBlock>
          <Quiz topicId="spark-functions" questions={[
            {
              question: "What is the difference between explode() and explode_outer()?",
              options: [
                "explode_outer is faster",
                "explode drops rows where the array is null or empty; explode_outer keeps them as a single null row  -  critical to avoid losing data",
                "explode_outer works on maps; explode works on arrays",
                "They are identical"
              ],
              correct: 1
            },
            {
              question: "You have a JSON column 'payload' and need to extract $.user.id. Which function?",
              options: [
                "F.json_extract('payload', 'user.id')",
                "F.get_json_object('payload', '$.user.id')  -  extracts a single value using JSONPath",
                "F.from_json('payload', schema).user.id  -  you must parse the full schema first",
                "F.col('payload.user.id')"
              ],
              correct: 1
            },
            {
              question: "coalesce() vs when().otherwise()  -  when should you prefer coalesce()?",
              options: [
                "Always prefer when/otherwise",
                "Use coalesce() when you want the first non-null value from a list of columns  -  it's more concise. Use when/otherwise for conditional logic based on values, not nullability",
                "coalesce() only works with numeric columns",
                "They are interchangeable"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-functions')} style={MC_BTN(completed.has('spark-functions'))}>{completed.has('spark-functions') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── WINDOW FUNCTIONS ───────────────────────────────────────────── */}
        <section id="spark-window" ref={ref('spark-window')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">PySpark Window Functions</h1>
            <p className="topic-desc">
              Window functions compute a result for each row based on a <em>window</em> of related rows  -  without collapsing rows like groupBy does. They are indispensable for sessionisation, running totals, lag/lead comparisons, rankings, and SCD Type 2 logic. Every window function requires a <code>Window</code> spec defining partition, order, and optional frame bounds.
            </p>
          </div>
          <WindowAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark.sql.window import Window

df = spark.table("silver.transactions")

# ── Basic window spec ─────────────────────────────────────────────────
w_user = Window.partitionBy("user_id").orderBy("ts")

# ── Ranking functions ─────────────────────────────────────────────────
df.withColumn("rank",        F.rank().over(w_user))         # 1,2,2,4 (gaps)
df.withColumn("dense_rank",  F.dense_rank().over(w_user))   # 1,2,2,3 (no gaps)
df.withColumn("row_number",  F.row_number().over(w_user))   # 1,2,3,4 (unique)
df.withColumn("ntile_4",     F.ntile(4).over(w_user))       # quartile bucket
df.withColumn("pct_rank",    F.percent_rank().over(w_user)) # 0.0 to 1.0

# ── Deduplicate keeping latest (row_number pattern) ───────────────────
from pyspark.sql.functions import row_number
deduped = df \
    .withColumn("rn", F.row_number().over(
        Window.partitionBy("order_id").orderBy(F.col("updated_at").desc())
    )) \
    .filter(F.col("rn") == 1) \
    .drop("rn")

# ── Lag / Lead ────────────────────────────────────────────────────────
df.withColumn("prev_amount",  F.lag("amount", 1).over(w_user))
df.withColumn("next_amount",  F.lead("amount", 1).over(w_user))
df.withColumn("prev_status",  F.lag("status", 1, "NONE").over(w_user))  # default val

# ── Running aggregates (unbounded preceding → current row) ───────────
w_running = Window.partitionBy("user_id").orderBy("ts") \
                  .rowsBetween(Window.unboundedPreceding, Window.currentRow)
df.withColumn("running_total",  F.sum("amount").over(w_running))
df.withColumn("running_count",  F.count("*").over(w_running))
df.withColumn("running_avg",    F.avg("amount").over(w_running))

# ── Rolling window (last 7 days using rangeBetween) ──────────────────
# rangeBetween operates on values, not row counts
# Need the orderBy column to be numeric (epoch seconds or long)
df2 = df.withColumn("ts_epoch", F.unix_timestamp("ts"))
w_7d = Window.partitionBy("user_id") \
             .orderBy("ts_epoch") \
             .rangeBetween(-7 * 86400, 0)   # 7 days in seconds
df2.withColumn("rolling_7d_sum", F.sum("amount").over(w_7d))

# ── Full partition aggregation (no frame = entire partition) ─────────
w_partition = Window.partitionBy("merchant_id")
df.withColumn("merchant_total",  F.sum("amount").over(w_partition))
df.withColumn("pct_of_merchant", F.col("amount") / F.sum("amount").over(w_partition))

# ── First/Last value ─────────────────────────────────────────────────
df.withColumn("first_order",  F.first("amount", ignorenulls=True).over(w_running))
df.withColumn("last_status",  F.last("status",  ignorenulls=True).over(
    Window.partitionBy("user_id").orderBy("ts")
           .rowsBetween(Window.unboundedPreceding, Window.currentRow)))

# ── SCD Type 2 active flag ────────────────────────────────────────────
w_scd = Window.partitionBy("customer_id").orderBy(F.col("effective_from").desc())
df_scd = df_history \
    .withColumn("rn", F.row_number().over(w_scd)) \
    .withColumn("is_current", F.col("rn") == 1) \
    .drop("rn")`}
          </CodeBlock>
          <Quiz topicId="spark-window" questions={[
            {
              question: "What is the difference between rank() and row_number() window functions?",
              options: [
                "rank() is faster",
                "row_number() always produces unique sequential integers; rank() assigns the same rank to ties and skips the next rank (1,2,2,4). Use row_number() for deduplication.",
                "They are identical",
                "rank() works only with numeric columns"
              ],
              correct: 1
            },
            {
              question: "What is the difference between rowsBetween() and rangeBetween() in window specs?",
              options: [
                "They are the same thing",
                "rowsBetween counts physical rows relative to current; rangeBetween operates on the numeric value of the orderBy column  -  enabling time-range windows like 'last 7 days'",
                "rangeBetween is deprecated in Spark 3.x",
                "rowsBetween requires a partition key; rangeBetween does not"
              ],
              correct: 1
            },
            {
              question: "How would you keep only the most recent record per order_id from a CDC (change data capture) stream?",
              options: [
                "df.distinct()",
                "Use row_number() over Window.partitionBy('order_id').orderBy(col('updated_at').desc()), then filter rn == 1",
                "df.dropDuplicates(['order_id'])",
                "Use rank() and filter rank == 1"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-window')} style={MC_BTN(completed.has('spark-window'))}>{completed.has('spark-window') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── JOIN STRATEGIES ────────────────────────────────────────────── */}
        <section id="spark-joins" ref={ref('spark-joins')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Join Strategies</h1>
            <p className="topic-desc">
              Spark has four physical join implementations. The right one is chosen automatically (or forced with hints). Understanding when each is used  -  and when to force one  -  is critical for avoiding shuffles and handling skew.
            </p>
          </div>
          <JoinStrategiesAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Join strategy priority:</strong> BroadcastHashJoin (if one side ≤ autoBroadcastJoinThreshold, default 10MB) → ShuffleHashJoin (one side fits in executor memory) → SortMergeJoin (general-purpose, both sides shuffled and sorted) → CartesianJoin (no join key, explicit only).
            </div>
          </div>
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark.sql.functions import broadcast

# ── 1. Broadcast Hash Join (BHJ) ──────────────────────────────────────
# Best for: large_df JOIN small_df (small < 10MB by default)
# Mechanism: broadcast small table to ALL executors → no shuffle on either side
# Config: spark.sql.autoBroadcastJoinThreshold = 10MB (set to -1 to disable)

spark.conf.set("spark.sql.autoBroadcastJoinThreshold", str(50 * 1024 * 1024))  # 50MB

# Spark chooses BHJ automatically if small_df is below threshold.
# Force it with hint:
result = large_df.join(broadcast(dim_country), "country_code", "left")

# In SQL:
spark.sql("""
    SELECT /*+ BROADCAST(d) */ t.*, d.country_name
    FROM silver.transactions t
    JOIN dim.country d ON t.country_code = d.code
""")

# ── 2. Sort-Merge Join (SMJ) ───────────────────────────────────────────
# Best for: two large tables
# Mechanism: both sides shuffled by join key, then sorted, then merged
# Creates 2 shuffle stages  -  expensive but correct for any data size

# Spark chooses SMJ when BHJ isn't applicable.
# Force with hint:
result = df1.hint("merge").join(df2, "id")

# ── 3. Shuffle Hash Join (SHJ) ────────────────────────────────────────
# Best for: one side fits in executor memory, want to avoid sort overhead
# Mechanism: shuffle both sides, build hash table from smaller side
# Force: df1.hint("shuffle_hash").join(df2, "id")

# ── 4. Cartesian (Cross) Join ─────────────────────────────────────────
# Use with extreme care  -  row count = left × right
df1.crossJoin(df2)
df1.hint("cartesian").join(df2)

# ── Diagnosing join strategy in explain() ─────────────────────────────
result.explain()
# Look for:
#   BroadcastHashJoin      → BHJ (no shuffle needed for small side)
#   SortMergeJoin          → SMJ (shuffle + sort on both sides)
#   ShuffledHashJoin       → SHJ (shuffle + hash build)
#   BroadcastNestedLoopJoin → fallback when no equi-join condition

# ── Skew join hints (Spark 3.x) ───────────────────────────────────────
# When one key has disproportionate rows, it causes stragglers
result = skewed_df.hint("skew", "user_id").join(other_df, "user_id")
# Spark splits the skewed partition into smaller sub-partitions and duplicates
# the matching rows from the other side.
# With AQE: automatic (spark.sql.adaptive.skewJoin.enabled=true)

# ── Range join (inequality join) ──────────────────────────────────────
# Spark 3.3+ range join optimisation via hint
result = events.hint("range_join", 86400).join(  # 86400 = 1 day in seconds
    intervals,
    (events.ts >= intervals.start_ts) & (events.ts < intervals.end_ts)
)`}
          </CodeBlock>
          <Quiz topicId="spark-joins" questions={[
            {
              question: "A Sort-Merge Join creates how many shuffle stages?",
              options: [
                "Zero  -  SMJ avoids shuffles",
                "One  -  only the smaller table is shuffled",
                "Two  -  both sides are shuffled by the join key, then sorted",
                "Depends on spark.sql.shuffle.partitions"
              ],
              correct: 2
            },
            {
              question: "Your job joins a 500GB fact table with a 8MB lookup table and is running slowly. What is the most impactful optimisation?",
              options: [
                "Increase spark.sql.shuffle.partitions",
                "Force a Broadcast Hash Join on the 8MB table  -  eliminates the shuffle on both sides entirely",
                "Repartition the fact table",
                "Enable AQE"
              ],
              correct: 1
            },
            {
              question: "When does Spark automatically choose a BroadcastHashJoin?",
              options: [
                "Always for dimension tables",
                "When one side of the join is estimated to be below spark.sql.autoBroadcastJoinThreshold (default 10MB)",
                "When both tables have the same schema",
                "When partitionBy matches the join key"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-joins')} style={MC_BTN(completed.has('spark-joins'))}>{completed.has('spark-joins') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── PARTITIONING DEEP DIVE ──────────────────────────────────────── */}
        <section id="spark-partitions" ref={ref('spark-partitions')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Partitioning Deep Dive</h1>
            <p className="topic-desc">
              Partitioning determines parallelism, shuffle size, and output file layout. There are two distinct concepts: <strong>in-memory partitions</strong> (how Spark distributes the DataFrame across executor cores) and <strong>physical/storage partitions</strong> (how files are organized on disk via <code>partitionBy</code> on write). Getting both right is the difference between a 10-minute and a 2-hour job.
            </p>
          </div>
          <PartitionsAnimation />
          <ShuffleAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F

# ── In-memory partition count ─────────────────────────────────────────
df.rdd.getNumPartitions()   # current partition count

# Initial partitions when reading files:
# Parquet/Delta: typically 1 partition per 128MB file split
# After a shuffle: spark.sql.shuffle.partitions (default 200, auto with AQE)

# ── repartition() vs coalesce() ───────────────────────────────────────
# repartition(n)         → full shuffle, even distribution, INCREASES or DECREASES
# repartition(n, "col")  → hash-partition by column (good before joins/groupBy on same col)
# coalesce(n)            → no shuffle, merges partitions, only DECREASES

# Choose based on goal:
df.repartition(200)               # even distribution before heavy transformation
df.repartition(200, "user_id")    # co-locate user data (avoids later shuffle)
df.coalesce(10)                   # reduce before writing (avoid 200 tiny files)

# ── Optimal partition count calculation ───────────────────────────────
# Rule: aim for 128-200MB per partition
# Too few → long individual tasks, underutilised cores
# Too many → scheduling overhead, many tiny files

# total_gb = 100, target = 128MB
num_partitions = int((100 * 1024) / 128)  # = 800

spark.conf.set("spark.sql.shuffle.partitions", num_partitions)

# With AQE (Spark 3.x)  -  just set auto:
spark.conf.set("spark.sql.adaptive.enabled",                    "true")
spark.conf.set("spark.sql.shuffle.partitions",                  "auto")
spark.conf.set("spark.sql.adaptive.coalescePartitions.initialPartitionNum", "500")
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes","128mb")

# ── Physical (storage) partitioning ──────────────────────────────────
# partitionBy creates hive-style directories: /path/col=value/
# Read with partition filter → Spark skips unneeded directories entirely

# Write with partition columns:
df.write.format("delta") \
  .partitionBy("event_year", "event_month") \
  .mode("overwrite") \
  .save("/data/delta/events/")

# Partition pruning on read (Catalyst pushes filter to file listing):
df_jan = spark.read.format("delta").load("/data/delta/events/") \
              .filter("event_year = 2024 AND event_month = 1")
# → only reads files under event_year=2024/event_month=1/

# ── Dynamic Partition Pruning (DPP)  -  Spark 3.x ──────────────────────
# When joining a fact table partitioned by date_id with a dim table filtered by date:
# DPP pushes the dimension filter to prune fact table partitions at runtime
spark.conf.set("spark.sql.optimizer.dynamicPartitionPruning.enabled", "true")

fact.join(
    dim_date.filter(F.col("fiscal_year") == 2024),
    "date_id"
)
# DPP: Spark first evaluates dim_date.filter, gets list of date_ids,
# then uses them to prune fact table partitions before the join.

# ── Partition column cardinality rules ────────────────────────────────
# Good partition columns: date, region, status (low-medium cardinality)
# Bad partition columns: user_id, order_id (millions of partitions → too many files)

# ── Check partition sizes ─────────────────────────────────────────────
from pyspark.sql.functions import spark_partition_id
df.withColumn("pid", spark_partition_id()) \
  .groupBy("pid").count() \
  .orderBy(F.col("count").desc()) \
  .show(20)   # diagnose skew`}
          </CodeBlock>
          <Quiz topicId="spark-partitions" questions={[
            {
              question: "You have 100GB of data and spark.sql.shuffle.partitions=200. After a groupBy shuffle, how large is each partition approximately?",
              options: [
                "100MB per partition (optimal)",
                "512MB per partition  -  200 is often far too few for 100GB; aim for 128-200MB per partition requiring ~500-800 partitions",
                "200MB per partition",
                "It depends on the join type"
              ],
              correct: 1
            },
            {
              question: "What is Dynamic Partition Pruning (DPP)?",
              options: [
                "Automatically removing empty partitions after a write",
                "Spark evaluates a dimension filter at runtime and uses the result to prune fact table partitions before a join  -  reducing data scanned",
                "Coalescing shuffle partitions with AQE",
                "Removing duplicate partitions from Delta tables"
              ],
              correct: 1
            },
            {
              question: "Why is user_id a bad physical partition column for a Delta table?",
              options: [
                "user_id is not sortable",
                "High cardinality (millions of users) creates millions of tiny directories  -  metadata overhead explodes and reads become slow",
                "Delta doesn't support string partition columns",
                "It causes shuffle skew"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-partitions')} style={MC_BTN(completed.has('spark-partitions'))}>{completed.has('spark-partitions') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── DATA SKEW ──────────────────────────────────────────────────── */}
        <section id="spark-skew" ref={ref('spark-skew')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Data Skew</h1>
            <p className="topic-desc">
              Data skew occurs when one or a few partition keys have significantly more rows than others. The result: 99% of tasks finish in 30 seconds, but 1 task runs for 30 minutes because it has 80% of the data. This single task becomes the bottleneck. Detection, salting, and AQE's automatic skew handling are the three tools to fix it.
            </p>
          </div>
          <SkewAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark.sql.functions import spark_partition_id

# ── Step 1: Detect skew ───────────────────────────────────────────────

# Method A: Check partition sizes before a shuffle
df.withColumn("pid", spark_partition_id()) \
  .groupBy("pid").count() \
  .orderBy(F.col("count").desc()) \
  .show(10)
# If max_count >> median_count → skew exists

# Method B: Profile the key distribution
df.groupBy("merchant_id") \
  .count() \
  .orderBy(F.col("count").desc()) \
  .show(10)
# Top 10 merchants with 60% of rows → skewed join key

# Method C: Spark UI
# Go to: Jobs → click a stage → Task Metrics
# Sort by "Duration"  -  if one task takes 10x longer → skew
# Also check "Input Size" column for uneven partition sizes

# ── Step 2a: Fix with salting (manual) ───────────────────────────────
# Use when: joining a fact table on a skewed key (e.g., merchant_id)
# Technique: add a random salt to spread the skewed key across N partitions

SALT_FACTOR = 10  # number of virtual partitions per skewed key

# On the larger (skewed) side: add random salt 0..9
skewed_df = large_fact.withColumn(
    "salt", (F.rand() * SALT_FACTOR).cast("int")
)

# On the smaller side: explode salt to match all possible values
dim_df_salted = dim_merchant.withColumn(
    "salt", F.explode(F.array([F.lit(i) for i in range(SALT_FACTOR)]))
)

# Join on composite key (original_key + salt)
result = skewed_df.join(
    dim_df_salted,
    on=["merchant_id", "salt"],
    how="inner"
).drop("salt")

# ── Step 2b: AQE automatic skew handling (Spark 3.x) ─────────────────
spark.conf.set("spark.sql.adaptive.enabled",                    "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled",           "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor",       "5")   # 5x median
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "256mb")

# AQE detects skewed partitions AFTER the first shuffle and splits them,
# then duplicates matching partitions from the other side.
# No code changes needed  -  just enable AQE.

# ── Step 2c: Skew hint (Spark 3.x) ───────────────────────────────────
result = large_df.hint("skew", "merchant_id") \
                 .join(dim_df, "merchant_id", "inner")

# ── Step 3: Null key skew ─────────────────────────────────────────────
# Nulls all hash to the same partition  -  a common hidden skew source
# Fix: filter nulls before the join, handle separately
non_null = df.filter(F.col("user_id").isNotNull())
null_rows = df.filter(F.col("user_id").isNull()) \
              .withColumn("fallback_col", F.lit("UNKNOWN"))

result = non_null.join(dim_user, "user_id", "left") \
                 .unionByName(null_rows, allowMissingColumns=True)`}
          </CodeBlock>
          <Quiz topicId="spark-skew" questions={[
            {
              question: "How do you identify data skew in the Spark UI?",
              options: [
                "Check the DAG visualization for red stages",
                "Navigate to a Stage's Task Metrics  -  look for one task with dramatically longer Duration and larger Input Size than the median",
                "Look at the executor memory graph",
                "Check the driver logs for 'skew' warnings"
              ],
              correct: 1
            },
            {
              question: "What does the salting technique do to fix skew on a join?",
              options: [
                "Removes null keys before the join",
                "Adds a random integer (0..N) to the skewed key on the large side, and explodes the small side N times  -  distributing the hot key across N partitions",
                "Broadcasts the skewed table",
                "Repartitions both tables by the join key"
              ],
              correct: 1
            },
            {
              question: "How does AQE's skew join handling differ from manual salting?",
              options: [
                "AQE uses random salting internally",
                "AQE detects and splits skewed partitions at runtime after observing actual shuffle statistics  -  no code changes needed, but it only works on Sort-Merge joins",
                "AQE broadcasts the skewed partitions",
                "AQE is less effective than manual salting"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-skew')} style={MC_BTN(completed.has('spark-skew'))}>{completed.has('spark-skew') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── MEMORY MANAGEMENT ──────────────────────────────────────────── */}
        <section id="spark-memory" ref={ref('spark-memory')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Memory Management</h1>
            <p className="topic-desc">
              Spark's <strong>Unified Memory Model</strong> (since Spark 1.6) divides executor memory into pools that dynamically borrow from each other. Understanding this model is essential for diagnosing OOM errors, GC pressure, and spill-to-disk  -  the top three causes of slow Spark jobs.
            </p>
          </div>
          <MemoryAnimation />
          <CodeBlock lang="python">{`# ── Executor memory breakdown ─────────────────────────────────────────
#
#  spark.executor.memory = 8g
#  ┌─────────────────────────────────────────────┐
#  │  Reserved memory: 300MB (JVM, OS overhead)  │
#  ├─────────────────────────────────────────────┤
#  │  Usable = 8g - 300MB ≈ 7.7g                 │
#  │  ┌─────────────────────────────────────────┐ │
#  │  │ spark.memory.fraction = 0.6             │ │
#  │  │ Spark Memory Pool = 7.7 * 0.6 ≈ 4.6g   │ │
#  │  │  ┌──────────────────────────────────┐   │ │
#  │  │  │ Execution Memory (joins/agg/sort) │   │ │
#  │  │  │ ← borrows from Storage if free   │   │ │
#  │  │  ├──────────────────────────────────┤   │ │
#  │  │  │ Storage Memory (cache/broadcast) │   │ │
#  │  │  │ spark.memory.storageFraction=0.5 │   │ │
#  │  │  └──────────────────────────────────┘   │ │
#  │  └─────────────────────────────────────────┘ │
#  │  User Memory (UDFs, Python objs) ≈ 3.1g      │
#  └─────────────────────────────────────────────┘
#
#  memoryOverhead (separate): spark.executor.memoryOverhead = max(0.1*executor.memory, 384m)
#  For PySpark: add extra for Python workers (spark.executor.pyspark.memory)

# ── Recommended production config ─────────────────────────────────────
spark_conf = {
    "spark.executor.memory":            "8g",
    "spark.executor.cores":             "4",
    "spark.executor.memoryOverhead":    "2g",     # for Python workers + Netty
    "spark.driver.memory":              "4g",
    "spark.driver.maxResultSize":       "2g",     # limit collect() result size
    "spark.memory.fraction":            "0.8",    # increase Spark pool
    "spark.memory.storageFraction":     "0.3",    # less for cache, more for execution
    "spark.executor.pyspark.memory":    "1g",     # Python worker heap
    "spark.sql.shuffle.partitions":     "auto",
}

# ── Diagnosing OOM ────────────────────────────────────────────────────
# "Java heap space" → increase spark.executor.memory
# "GC overhead limit exceeded" → executor spending > 98% time in GC
#   Fix: increase memory, reduce partition size, avoid large UDF objects
# "Container killed by YARN for exceeding memory limits"
#   Fix: increase spark.executor.memoryOverhead (Python/native memory)

# ── Spill to disk ─────────────────────────────────────────────────────
# When execution memory fills, Spark spills shuffle data to local disk
# Detect: Spark UI → Stage → Shuffle Write + Spill (Memory/Disk) columns
# Fix options:
#   1. More executor memory
#   2. Fewer records per partition (more shuffle partitions)
#   3. Broadcast small side to eliminate shuffle entirely
#   4. Filter earlier in the pipeline

# ── Off-heap memory (advanced) ───────────────────────────────────────
spark.conf.set("spark.memory.offHeap.enabled",  "true")
spark.conf.set("spark.memory.offHeap.size",      "4g")
# Off-heap bypasses JVM GC  -  useful for caching large DataFrames
# Reduces GC pressure significantly for cache-heavy workloads`}
          </CodeBlock>
          <Quiz topicId="spark-memory" questions={[
            {
              question: "An executor with 8g memory shows 'Container killed by YARN for exceeding memory limits'  -  what config should you increase?",
              options: [
                "spark.executor.memory",
                "spark.executor.memoryOverhead  -  this controls off-JVM memory (Python workers, Netty, native libraries) which is where YARN limit breaches typically occur",
                "spark.memory.fraction",
                "spark.driver.memory"
              ],
              correct: 1
            },
            {
              question: "In the Unified Memory Model, what happens when Execution Memory needs more space but Storage Memory is full?",
              options: [
                "The job fails with OOM",
                "Execution can evict cached data from Storage Memory (Storage is not fully protected)  -  cached DataFrames may be partially evicted",
                "Execution spills to disk immediately",
                "Storage Memory cannot be borrowed"
              ],
              correct: 1
            },
            {
              question: "How do you detect shuffle spill in the Spark UI?",
              options: [
                "Check executor memory usage graph",
                "Go to Stages → click a stage → look at 'Shuffle Spill (Memory)' and 'Shuffle Spill (Disk)' columns in the task metrics table",
                "Check the driver logs for 'SPILL' keyword",
                "Look at the DAG for yellow stage nodes"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-memory')} style={MC_BTN(completed.has('spark-memory'))}>{completed.has('spark-memory') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── CACHING ────────────────────────────────────────────────────── */}
        <section id="spark-cache" ref={ref('spark-cache')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Caching and Persistence</h1>
            <p className="topic-desc">
              Caching stores computed results so subsequent actions don't recompute from scratch. The <strong>wrong</strong> use of caching wastes memory and can slow jobs. Cache only when a DataFrame is used in multiple downstream actions and computing it is more expensive than the memory cost.
            </p>
          </div>
          <CacheAnimation />
          <CodeBlock lang="python">{`from pyspark import StorageLevel

# ── When to cache ─────────────────────────────────────────────────────
# GOOD: DataFrame reused in multiple actions (training split, iterative algorithms)
# BAD:  DataFrame used only once (wastes memory + incurs caching overhead)
# BAD:  Caching very large DataFrames that don't fit in memory (thrashing)

# ── cache() vs persist() ──────────────────────────────────────────────
df.cache()                                  # shortcut for MEMORY_AND_DISK
df.persist()                                # same as cache()
df.persist(StorageLevel.MEMORY_ONLY)        # evict if memory full (not resilient)
df.persist(StorageLevel.MEMORY_AND_DISK)    # spill to disk if memory full (default)
df.persist(StorageLevel.DISK_ONLY)          # always disk (slow, but always available)
df.persist(StorageLevel.MEMORY_ONLY_2)      # replicate on 2 nodes (resilient)
df.persist(StorageLevel.MEMORY_AND_DISK_2)  # replicate on 2 nodes + disk fallback
df.persist(StorageLevel.OFF_HEAP)           # off-heap, avoids GC pressure

# ── Cache is lazy too ─────────────────────────────────────────────────
df.cache()    # registers intent to cache  -  nothing is stored yet
df.count()    # FIRST action materialises and caches the DataFrame
df.show()     # served from cache

# Force eager caching:
df = df.cache()
df.count()    # materialise immediately

# ── Always unpersist when done ────────────────────────────────────────
df.unpersist()             # removes from cache (blocking=True to wait)
df.unpersist(blocking=True)

# ── Checkpointing vs caching ──────────────────────────────────────────
# Cache:       in-memory/disk, lineage kept, re-computable if evicted
# Checkpoint:  writes to reliable storage (HDFS/ADLS), lineage TRUNCATED
# Use checkpoint for: iterative ML algorithms (break lineage after N iterations)
#                     very long lineage chains (avoids stack overflow in driver)

sc.setCheckpointDir("abfss://checkpoints@myaccount.dfs.core.windows.net/spark/")
df.checkpoint()             # writes to checkpoint dir, returns new DF with no lineage

# ── Named caching (catalog) ───────────────────────────────────────────
df.createOrReplaceTempView("my_view")
spark.catalog.cacheTable("my_view")
spark.catalog.uncacheTable("my_view")

# ── Production caching pattern for Gold layer pipelines ──────────────
# Pattern: cache Silver output, run multiple Gold aggregations

silver_df = spark.table("silver.events") \
    .filter(F.col("event_date") >= "2024-01-01") \
    .withColumn("revenue", F.col("qty") * F.col("price")) \
    .persist(StorageLevel.MEMORY_AND_DISK)

# Materialise (first action)
total_rows = silver_df.count()
print(f"Processing {total_rows:,} events")

# Multiple Gold aggregations  -  all hit cache:
gold_daily     = silver_df.groupBy("event_date", "merchant_id").agg(...)
gold_weekly    = silver_df.groupBy(F.date_trunc("week", "event_date")).agg(...)
gold_geography = silver_df.groupBy("country", "region").agg(...)

gold_daily.write.format("delta").mode("overwrite").saveAsTable("gold.daily_revenue")
gold_weekly.write.format("delta").mode("overwrite").saveAsTable("gold.weekly_revenue")
gold_geography.write.format("delta").mode("overwrite").saveAsTable("gold.geo_revenue")

silver_df.unpersist()   # free memory`}
          </CodeBlock>
          <Quiz topicId="spark-cache" questions={[
            {
              question: "What is the difference between cache() and checkpoint()?",
              options: [
                "checkpoint() is faster than cache()",
                "cache() stores in memory/disk and keeps lineage; checkpoint() writes to reliable storage and TRUNCATES lineage  -  use checkpoint to break long lineage chains in iterative algorithms",
                "They are identical",
                "cache() works on RDDs; checkpoint() works on DataFrames"
              ],
              correct: 1
            },
            {
              question: "You call df.cache() then df.filter(...).count(). Is df cached after this?",
              options: [
                "Yes  -  cache() stores data immediately",
                "No  -  cache() is lazy. The first action that uses df (count here) materialises and caches it. But df.filter() creates a new DataFrame  -  df itself was never triggered as an action",
                "Yes, but only the filtered result",
                "No  -  filter() clears the cache"
              ],
              correct: 1
            },
            {
              question: "When is MEMORY_AND_DISK preferred over MEMORY_ONLY?",
              options: [
                "When you want faster cache access",
                "When the cached DataFrame might not fully fit in memory  -  MEMORY_AND_DISK spills to disk rather than evicting and recomputing, which is safer for large DataFrames",
                "MEMORY_ONLY is always preferred",
                "When using PySpark (Python serialisation)"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-cache')} style={MC_BTN(completed.has('spark-cache'))}>{completed.has('spark-cache') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── BROADCAST VARIABLES & ACCUMULATORS ─────────────────────────── */}
        <section id="spark-broadcast" ref={ref('spark-broadcast')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Broadcast Variables and Accumulators</h1>
            <p className="topic-desc">
              <strong>Broadcast variables</strong> efficiently distribute a read-only value to every executor once  -  instead of serialising it into every task closure. <strong>Accumulators</strong> are write-only counters/sums that executors update and the driver reads  -  the only safe way to collect per-task metrics without breaking lazy evaluation.
            </p>
          </div>
          <BroadcastAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark import AccumulatorParam

# ── Broadcast variables ───────────────────────────────────────────────
# Problem: using a large dict inside a map() sends it to EVERY task
lookup = load_country_codes()   # e.g., {"US": "United States", ...}  -  5MB dict

# BAD: dict captured in closure  -  serialised + sent with every task
df.rdd.map(lambda row: (row.id, lookup[row.country]))  # 5MB * 800 tasks = 4GB network

# GOOD: broadcast once per executor (~20 executors = 100MB total)
bc_lookup = sc.broadcast(lookup)
df.rdd.map(lambda row: (row.id, bc_lookup.value[row.country]))  # bc_lookup.value to access

# Broadcast in DataFrame API (for joins):
from pyspark.sql.functions import broadcast
result = large_df.join(broadcast(small_dim), "key")

# Size limits:
# Broadcast via join hint: spark.sql.autoBroadcastJoinThreshold (default 10MB)
# sc.broadcast(): practical limit ~2GB (driver must hold it + serialize)
# For very large lookups (>100MB): use Delta table + partition pruning instead

# Unpickling broadcast variables:
bc_lookup.unpersist()    # remove from executor memory when done
bc_lookup.destroy()      # remove from driver + executors permanently

# Broadcast in UDFs (common production pattern):
@udf(returnType=StringType())
def enrich_country(code):
    return bc_lookup.value.get(code, "UNKNOWN")

df.withColumn("country_name", enrich_country(F.col("country_code")))

# ── Accumulators ──────────────────────────────────────────────────────
# Built-in accumulator types: LongAccumulator, DoubleAccumulator, CollectionAccumulator

# Count records that failed validation:
bad_records = sc.accumulator(0)
malformed_rows = sc.accumulator(0)

def validate_and_parse(row):
    global bad_records, malformed_rows
    try:
        if row.amount < 0:
            bad_records.add(1)
            return None
        return row
    except Exception:
        malformed_rows.add(1)
        return None

# IMPORTANT: accumulators only guaranteed accurate after an ACTION completes
# In transformations, Spark may re-execute tasks (speculative execution, retries)
# → accumulator may be incremented multiple times for the same task
result_rdd = df.rdd.map(validate_and_parse).filter(lambda x: x is not None)
result_rdd.count()  # action  -  triggers execution

print(f"Bad records: {bad_records.value}")
print(f"Malformed:   {malformed_rows.value}")

# Custom accumulator:
class SetAccumulatorParam(AccumulatorParam):
    def zero(self, v): return set()
    def addInPlace(self, a, b): return a | b

unique_errors = sc.accumulator(set(), SetAccumulatorParam())
df.rdd.foreach(lambda row: unique_errors.add({row.error_code}) if row.error_code else None)
print(unique_errors.value)   # set of all error codes seen`}
          </CodeBlock>
          <Quiz topicId="spark-broadcast" questions={[
            {
              question: "Why should you use sc.broadcast() instead of capturing a large dict in a closure?",
              options: [
                "Closures don't support dicts",
                "A closure dict is serialised into every task (800 tasks × 5MB = 4GB of network traffic); broadcast sends it once per executor (~20 × 5MB = 100MB)",
                "Broadcast variables are faster to access",
                "Closures cause OOM on the driver"
              ],
              correct: 1
            },
            {
              question: "Why might an accumulator show a higher count than expected?",
              options: [
                "Accumulators are thread-unsafe",
                "Spark may re-execute tasks due to speculation or retries  -  each re-execution increments the accumulator again. Counts are only reliable after a successful action with no re-runs.",
                "The driver doesn't receive updates from all executors",
                "Accumulators only work in batch mode"
              ],
              correct: 1
            },
            {
              question: "What is the practical size limit for a broadcast variable used in sc.broadcast()?",
              options: [
                "10MB  -  same as autoBroadcastJoinThreshold",
                "Around 2GB in practice  -  the driver must serialise the entire value, and executors must deserialise it. For larger lookups, use a Delta table with partition pruning.",
                "Unlimited  -  Spark streams it to executors",
                "100MB  -  determined by spark.executor.memory"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-broadcast')} style={MC_BTN(completed.has('spark-broadcast'))}>{completed.has('spark-broadcast') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── UDFs ───────────────────────────────────────────────────────── */}
        <section id="spark-udfs" ref={ref('spark-udfs')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">UDFs and Pandas UDFs</h1>
            <p className="topic-desc">
              Python UDFs are the single biggest performance trap in PySpark. Every row crosses the JVM-Python boundary  -  serialised, sent via socket, deserialized, processed, re-serialised. <strong>Always exhaust built-in functions first.</strong> When you genuinely need custom logic, use Pandas UDFs (vectorised) which process entire column batches via Apache Arrow  -  10-100x faster than row UDFs.
            </p>
          </div>
          <UDFAnimation />
          <div className="callout callout-warning">
            <span className="callout-icon">⚠️</span>
            <div className="callout-body">
              <strong>Python UDF checklist before writing one:</strong> Can you use when/otherwise? F.regexp_replace? F.expr()? spark.sql()? F.aggregate() on arrays? If yes to any  -  use built-ins. Only write a UDF if the logic genuinely requires Python libraries (scikit-learn, spaCy, etc.).
            </div>
          </div>
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark.sql.functions import udf, pandas_udf, PandasUDFType
from pyspark.sql.types import StringType, DoubleType, ArrayType, LongType
import pandas as pd

# ── Row-level Python UDF (SLOW) ───────────────────────────────────────
@udf(returnType=StringType())
def categorize_spend(amount):
    """BAD: row-by-row JVM→Python serialisation overhead."""
    if amount is None: return "unknown"
    if amount > 10000: return "whale"
    if amount > 1000:  return "high"
    return "low"

df.withColumn("tier", categorize_spend(F.col("amount")))  # avoid

# BETTER: replace with built-ins (zero serialisation):
df.withColumn("tier",
    F.when(F.col("amount").isNull(),   "unknown")
     .when(F.col("amount") > 10000,   "whale")
     .when(F.col("amount") > 1000,    "high")
     .otherwise("low"))

# ── Pandas UDF  -  Scalar (vectorised, Arrow transport) ────────────────
# Receives a pd.Series, returns a pd.Series  -  entire batch at once
@pandas_udf(StringType())
def clean_text(s: pd.Series) -> pd.Series:
    """Good for: regex, NLP preprocessing, ML inference on batches."""
    return (s.fillna("")
             .str.lower()
             .str.replace(r"[^a-z0-9 ]", "", regex=True)
             .str.strip())

df.withColumn("clean_desc", clean_text(F.col("description")))

# ── Pandas UDF  -  Scalar Iterator (session connection reuse) ──────────
# Receives an Iterator[pd.Series]  -  open connection once per partition
from typing import Iterator
@pandas_udf(StringType())
def score_with_model(batch_iter: Iterator[pd.Series]) -> Iterator[pd.Series]:
    import joblib
    model = joblib.load("/models/classifier.pkl")   # load ONCE per partition
    for batch in batch_iter:
        predictions = model.predict(batch.values.reshape(-1, 1))
        yield pd.Series(predictions)

df.withColumn("score", score_with_model(F.col("feature")))

# ── Pandas UDF  -  Grouped Map (COGROUPED, returns full DataFrame) ─────
# Use for: custom aggregations, group-level ML, sessionisation
from pyspark.sql.functions import pandas_udf
from pyspark.sql.types import StructType, StructField, LongType, DoubleType

output_schema = StructType([
    StructField("user_id",     LongType(),   True),
    StructField("session_id",  LongType(),   True),
    StructField("session_start", DoubleType(), True),
])

@pandas_udf(output_schema, PandasUDFType.GROUPED_MAP)
def sessionise(pdf: pd.DataFrame) -> pd.DataFrame:
    """Assigns session IDs: new session if gap > 30 min."""
    pdf = pdf.sort_values("ts")
    pdf["gap"] = pdf["ts"].diff().dt.total_seconds().fillna(0)
    pdf["new_session"] = (pdf["gap"] > 1800).cumsum()
    pdf["session_id"] = pdf["user_id"].astype(str) + "_" + pdf["new_session"].astype(str)
    return pdf[["user_id", "session_id", "ts"]].rename(columns={"ts": "session_start"})

df.groupBy("user_id").apply(sessionise)

# ── SQL UDFs (registered to SparkSession catalog) ────────────────────
# Usable in spark.sql() queries and SQL strings
spark.udf.register("clean_text_sql", clean_text)
spark.sql("SELECT clean_text_sql(description) as clean FROM silver.events")

# ── Pandas UDFs with multiple input columns ──────────────────────────
@pandas_udf(DoubleType())
def weighted_score(amount: pd.Series, weight: pd.Series) -> pd.Series:
    return amount * weight / weight.sum()

df.withColumn("score", weighted_score(F.col("amount"), F.col("weight")))`}
          </CodeBlock>
          <Quiz topicId="spark-udfs" questions={[
            {
              question: "What makes Python row UDFs slow in PySpark?",
              options: [
                "They run on the driver instead of executors",
                "Each row is serialised in the JVM, sent over a socket to a Python worker process, processed, then the result is serialised back  -  the JVM-Python boundary crossing is orders of magnitude slower than JVM-native built-ins",
                "Python UDFs can't be parallelised",
                "They disable predicate pushdown"
              ],
              correct: 1
            },
            {
              question: "When should you use a Scalar Iterator Pandas UDF over a regular Scalar Pandas UDF?",
              options: [
                "When the output is larger than the input",
                "When the UDF needs to load a heavy resource (ML model, DB connection) once per partition  -  the iterator pattern loads it once and processes all batches in that partition",
                "When the input has nulls",
                "When processing arrays"
              ],
              correct: 1
            },
            {
              question: "What does spark.udf.register() enable?",
              options: [
                "It makes the UDF faster by registering it with Catalyst",
                "It makes the UDF callable by name in spark.sql() queries and SQL strings  -  without needing to use the Python column API",
                "It caches the UDF output",
                "It converts a Python UDF to a Pandas UDF automatically"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-udfs')} style={MC_BTN(completed.has('spark-udfs'))}>{completed.has('spark-udfs') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── SPARK SQL ──────────────────────────────────────────────────── */}
        <section id="spark-sql" ref={ref('spark-sql')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Spark SQL</h1>
            <p className="topic-desc">
              Spark SQL lets you write ANSI SQL that runs on the same engine as the DataFrame API  -  both compile to the same logical plan. You can freely mix SQL and DataFrame API in the same job, referencing the same data. Views are the bridge between the two worlds.
            </p>
          </div>
          <SparkSQLAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F

# ── spark.sql()  -  run ANSI SQL directly ──────────────────────────────
result = spark.sql("""
    SELECT
        merchant_id,
        date_trunc('month', event_ts)   AS month,
        SUM(amount)                     AS revenue,
        COUNT(DISTINCT user_id)         AS unique_buyers,
        PERCENTILE_APPROX(amount, 0.95) AS p95_ticket
    FROM silver.transactions
    WHERE status = 'COMPLETED'
      AND event_ts >= '2024-01-01'
    GROUP BY 1, 2
    HAVING SUM(amount) > 10000
    ORDER BY month, revenue DESC
""")

# ── createOrReplaceTempView  -  session-scoped, not shared ─────────────
# DataFrames → SQL-queryable view (lives in SparkSession only)
df.createOrReplaceTempView("transactions_filtered")
spark.sql("SELECT COUNT(*) FROM transactions_filtered").show()

# Clean up to free metadata:
spark.catalog.dropTempView("transactions_filtered")

# ── createGlobalTempView  -  shared across SparkSessions ───────────────
df.createGlobalTempView("shared_events")
# Access with global_temp prefix:
spark.sql("SELECT * FROM global_temp.shared_events LIMIT 10")
# Useful for sharing data between notebooks in the same Spark application

# ── Mixing SQL and DataFrame API ──────────────────────────────────────
# Pattern: heavy aggregation in SQL, post-processing in DataFrame API
base = spark.sql("""
    SELECT user_id, SUM(amount) AS total, COUNT(*) AS cnt
    FROM silver.transactions
    GROUP BY user_id
""")

# Continue with DataFrame API (uses same Catalyst engine):
result = base \
    .withColumn("avg_ticket", F.col("total") / F.col("cnt")) \
    .filter(F.col("total") > 1000) \
    .join(spark.table("dim.users"), "user_id", "left")

# ── DDL and DML via SQL ───────────────────────────────────────────────
spark.sql("""
    CREATE TABLE IF NOT EXISTS gold.merchant_monthly (
        merchant_id  BIGINT     NOT NULL,
        month        DATE       NOT NULL,
        revenue      DECIMAL(18,2),
        unique_buyers INT
    )
    USING DELTA
    PARTITIONED BY (month)
    LOCATION 'abfss://gold@myaccount.dfs.core.windows.net/merchant_monthly'
""")

spark.sql("""
    INSERT OVERWRITE gold.merchant_monthly
    PARTITION (month = '2024-01-01')
    SELECT merchant_id, SUM(amount), COUNT(DISTINCT user_id)
    FROM silver.transactions
    WHERE date_trunc('month', event_ts) = '2024-01-01'
    GROUP BY 1
""")

# ── MERGE via SQL ─────────────────────────────────────────────────────
spark.sql("""
    MERGE INTO silver.customers AS target
    USING (
        SELECT * FROM staging.customer_updates
    ) AS source
    ON target.customer_id = source.customer_id
    WHEN MATCHED AND source.updated_at > target.updated_at THEN
        UPDATE SET *
    WHEN NOT MATCHED THEN
        INSERT *
    WHEN NOT MATCHED BY SOURCE AND target.created_at < '2020-01-01' THEN
        DELETE
""")

# ── SQL hints ─────────────────────────────────────────────────────────
spark.sql("""
    SELECT /*+ BROADCAST(d), REPARTITION(200) */
           t.user_id, d.tier, SUM(t.amount) AS total
    FROM silver.transactions t
    JOIN dim.user_tiers d ON t.user_id = d.user_id
    GROUP BY 1, 2
""")`}
          </CodeBlock>
          <Quiz topicId="spark-sql" questions={[
            {
              question: "What is the difference between createOrReplaceTempView and createGlobalTempView?",
              options: [
                "TempView is faster; GlobalTempView persists to disk",
                "TempView is scoped to the current SparkSession and disappears when the session ends; GlobalTempView is accessible from other SparkSessions in the same application via global_temp prefix",
                "GlobalTempView supports DDL; TempView does not",
                "TempView writes to the Hive metastore"
              ],
              correct: 1
            },
            {
              question: "Do spark.sql() queries and DataFrame API operations use the same underlying execution engine?",
              options: [
                "No  -  spark.sql() uses a different SQL parser and engine",
                "Yes  -  both compile to the same logical plan and go through Catalyst optimisation and Tungsten execution. You can freely mix them in the same job.",
                "Only in Spark 3.x",
                "Only when using Unity Catalog"
              ],
              correct: 1
            },
            {
              question: "How do you pass a SQL hint to force a broadcast join inside spark.sql()?",
              options: [
                "spark.conf.set('spark.sql.autoBroadcastJoinThreshold', ...)",
                "Use the /*+ BROADCAST(table_alias) */ hint syntax inside the SELECT statement",
                "Call F.broadcast() before spark.sql()",
                "SQL hints are not supported  -  use the DataFrame API"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-sql')} style={MC_BTN(completed.has('spark-sql'))}>{completed.has('spark-sql') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── STRUCTURED STREAMING ───────────────────────────────────────── */}
        <section id="spark-streaming" ref={ref('spark-streaming')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Structured Streaming</h1>
            <p className="topic-desc">
              Structured Streaming treats a stream as an unbounded table that grows over time. Each micro-batch (or continuous trigger) appends new rows. You write the same DataFrame API you know from batch  -  Spark handles checkpointing, offsets, watermarks, and exactly-once semantics automatically.
            </p>
          </div>
          <StreamingAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F

# ── Sources ───────────────────────────────────────────────────────────

# Kafka source:
raw_stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "broker1:9092,broker2:9092") \
    .option("subscribe",               "topic.transactions") \
    .option("startingOffsets",         "latest") \
    .option("kafka.group.id",          "spark-etl-consumer") \
    .option("maxOffsetsPerTrigger",    "100000") \   # back-pressure control
    .load()

# Event Hub source (Azure):
eh_conf = {
    "eventhubs.connectionString": sc._jvm.org.apache.spark.eventhubs \
        .EventHubsUtils.encrypt(dbutils.secrets.get("kv", "eh-conn-str")),
    "eventhubs.maxEventsPerTrigger": 10000,
}
raw_stream = spark.readStream.format("eventhubs").options(**eh_conf).load()

# File (Auto Loader  -  Delta/Databricks, preferred for file ingestion):
raw_stream = spark.readStream \
    .format("cloudFiles") \
    .option("cloudFiles.format",       "json") \
    .option("cloudFiles.schemaLocation","/checkpoints/schema/events") \
    .load("abfss://raw@account.dfs.core.windows.net/events/")

# Delta table source:
raw_stream = spark.readStream \
    .format("delta") \
    .option("ignoreChanges", "false") \
    .table("bronze.raw_events")

# ── Parsing + transformations ─────────────────────────────────────────
event_schema = "STRUCT<txn_id:LONG, user_id:LONG, amount:DOUBLE, ts:TIMESTAMP>"

parsed = raw_stream.select(
    F.from_json(F.col("value").cast("string"), event_schema).alias("e"),
    F.col("timestamp").alias("kafka_ts")
).select("e.*", "kafka_ts")

# ── Watermark for late data handling ─────────────────────────────────
# Watermark = event_time - allowed_lateness
# Spark discards state for windows older than (max event time - watermark delay)
windowed = parsed \
    .withWatermark("ts", "10 minutes") \
    .groupBy(
        F.window("ts", "5 minutes"),         # 5-min tumbling window
        F.col("user_id")
    ) \
    .agg(
        F.sum("amount").alias("window_spend"),
        F.count("*").alias("txn_count")
    )

# ── Output modes ──────────────────────────────────────────────────────
# append:   only emit rows where state is finalised (after watermark)
# update:   emit rows that changed since last trigger (no delete support)
# complete: re-emit ALL result rows every trigger (only for small aggregates)

# ── Sinks ─────────────────────────────────────────────────────────────

# Delta sink (append mode):
query = windowed.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "/checkpoints/streaming/txn-windows") \
    .trigger(processingTime="1 minute") \   # micro-batch every 1 min
    .table("silver.txn_windows")

# Kafka sink:
parsed.select(
    F.col("txn_id").cast("string").alias("key"),
    F.to_json(F.struct("*")).alias("value")
).writeStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "broker1:9092") \
    .option("topic",                   "output.enriched") \
    .option("checkpointLocation",      "/checkpoints/kafka-sink") \
    .start()

# ── Triggers ─────────────────────────────────────────────────────────
# processingTime="1 minute"    → micro-batch every 1 min (most common)
# once=True                    → process all available data, then stop (deprecated 3.3)
# availableNow=True            → process all available, then stop (Spark 3.3+)
# continuous="1 second"        → low-latency continuous processing (experimental)

# ── foreachBatch  -  run arbitrary code per micro-batch ────────────────
def upsert_to_delta(micro_batch_df, batch_id):
    from delta.tables import DeltaTable
    target = DeltaTable.forName(spark, "silver.users")
    target.alias("t").merge(
        micro_batch_df.alias("s"), "t.user_id = s.user_id"
    ).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()

parsed.writeStream \
    .foreachBatch(upsert_to_delta) \
    .option("checkpointLocation", "/checkpoints/upsert") \
    .trigger(processingTime="2 minutes") \
    .start()

# ── Monitor streaming queries ─────────────────────────────────────────
for q in spark.streams.active:
    print(q.name, q.lastProgress["numInputRows"], q.lastProgress["processedRowsPerSecond"])`}
          </CodeBlock>
          <Quiz topicId="spark-streaming" questions={[
            {
              question: "What is a watermark in Structured Streaming and what does it control?",
              options: [
                "The maximum number of rows per micro-batch",
                "The threshold for how late data is allowed to arrive  -  Spark keeps state for a window open until (max_seen_event_time - watermark_delay), then finalises it and discards state",
                "The checkpoint interval",
                "The size of the Kafka consumer group"
              ],
              correct: 1
            },
            {
              question: "When should you use foreachBatch instead of a native sink?",
              options: [
                "For better performance",
                "When you need to run arbitrary code per micro-batch  -  like a MERGE/upsert into Delta, writing to multiple sinks, or applying idempotent custom logic that native sinks don't support",
                "When processing Kafka streams",
                "When using append output mode"
              ],
              correct: 1
            },
            {
              question: "What is the difference between trigger(once=True) and trigger(availableNow=True)?",
              options: [
                "They are identical",
                "once=True processes one micro-batch (may miss data); availableNow=True (Spark 3.3+) processes ALL available data as of start time across multiple micro-batches  -  preferred for scheduled incremental loads",
                "availableNow is faster",
                "once=True is for Kafka; availableNow is for Delta"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-streaming')} style={MC_BTN(completed.has('spark-streaming'))}>{completed.has('spark-streaming') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── STATEFUL STREAMING ─────────────────────────────────────────── */}
        <section id="spark-streaming-state" ref={ref('spark-streaming-state')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Stateful Streaming</h1>
            <p className="topic-desc">
              Structured Streaming stores state across micro-batches in an in-memory <strong>state store</strong> (RocksDB or HDFS-backed). Stateful operations include windowed aggregations, deduplication, and the advanced APIs <code>mapGroupsWithState</code> / <code>flatMapGroupsWithState</code> for fully custom per-group state machines.
            </p>
          </div>
          <StatefulStreamingAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F
from pyspark.sql.streaming.state import GroupState, GroupStateTimeout

# ── Streaming deduplication ───────────────────────────────────────────
# Spark keeps a set of seen keys in the state store
# Watermark bounds state store size (keys older than watermark are purged)
deduped = parsed \
    .withWatermark("ts", "1 hour") \
    .dropDuplicates(["txn_id", "ts"])   # ts must be within watermark window

# Write deduplicated stream:
deduped.writeStream \
    .format("delta") \
    .option("checkpointLocation", "/checkpoints/dedup") \
    .outputMode("append") \
    .table("silver.transactions_deduped")

# ── Stateful aggregation with watermark ──────────────────────────────
# State is kept per (user_id, window) until window is finalised by watermark
session_stats = parsed \
    .withWatermark("ts", "30 minutes") \
    .groupBy(F.window("ts", "10 minutes", "5 minutes"),   # sliding window
             F.col("user_id")) \
    .agg(F.sum("amount").alias("spend"),
         F.count("*").alias("events"))

# ── mapGroupsWithState (Scala/Java only, Python via applyInPandasWithState) ─
# Python equivalent: applyInPandasWithState (Spark 3.4+)
from pyspark.sql.types import StructType, StructField, LongType, StringType, DoubleType

# State schema: track user session
state_schema = StructType([
    StructField("session_id",    StringType(), True),
    StructField("session_start", DoubleType(), True),
    StructField("total_spend",   DoubleType(), True),
    StructField("last_seen",     DoubleType(), True),
])

# Output schema: emit completed sessions
output_schema = StructType([
    StructField("user_id",      LongType(),   True),
    StructField("session_id",   StringType(), True),
    StructField("session_spend",DoubleType(), True),
    StructField("duration_sec", DoubleType(), True),
])

def update_sessions(key, pdf_iter, state: GroupState):
    """Called per group (user_id) per micro-batch."""
    import uuid, time
    user_id = key[0]

    if state.hasTimedOut:
        # Session expired  -  emit final session
        s = state.get
        yield pd.DataFrame([{
            "user_id": user_id, "session_id": s["session_id"],
            "session_spend": s["total_spend"],
            "duration_sec": s["last_seen"] - s["session_start"]
        }])
        state.remove()
        return

    for pdf in pdf_iter:
        for _, row in pdf.iterrows():
            ts = row["ts"].timestamp()
            if not state.exists:
                state.update({"session_id": str(uuid.uuid4()),
                              "session_start": ts, "total_spend": row["amount"], "last_seen": ts})
            else:
                s = state.get
                if ts - s["last_seen"] > 1800:    # 30-min inactivity = new session
                    yield pd.DataFrame([{...}])   # emit old session
                    state.update({"session_id": str(uuid.uuid4()), "session_start": ts,
                                  "total_spend": row["amount"], "last_seen": ts})
                else:
                    state.update({**s, "total_spend": s["total_spend"] + row["amount"], "last_seen": ts})

    state.setTimeoutDuration(1800 * 1000)   # 30-min TTL

# Apply stateful function:
sessions = parsed \
    .groupBy("user_id") \
    .applyInPandasWithState(
        update_sessions,
        outputStructType=output_schema,
        stateStructType=state_schema,
        outputMode="append",
        timeoutConf=GroupStateTimeout.ProcessingTimeTimeout,
    )

# ── RocksDB state store (Spark 3.2+) ─────────────────────────────────
# Default: in-memory HDFS state (limited to executor memory)
# RocksDB: disk-backed, handles much larger state
spark.conf.set("spark.sql.streaming.stateStore.providerClass",
               "org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider")`}
          </CodeBlock>
          <Quiz topicId="spark-streaming-state" questions={[
            {
              question: "Why must streaming deduplication always be paired with a watermark?",
              options: [
                "Without a watermark, deduplication doesn't work",
                "Without a watermark, Spark must keep ALL seen keys in state forever  -  the state store grows unboundedly and eventually OOMs. The watermark bounds state to only the recent window.",
                "Watermarks improve deduplication accuracy",
                "Watermarks enable parallel state updates"
              ],
              correct: 1
            },
            {
              question: "What is the advantage of the RocksDB state store over the default in-memory state store?",
              options: [
                "Faster reads",
                "RocksDB is disk-backed and can handle state much larger than executor memory  -  critical for long-running streams with high-cardinality keys",
                "It automatically cleans up expired state",
                "It supports custom state schemas"
              ],
              correct: 1
            },
            {
              question: "What triggers a GroupState timeout in applyInPandasWithState?",
              options: [
                "The watermark passing the group's event time",
                "When no new data arrives for the group within the TTL set by state.setTimeoutDuration()  -  Spark calls the function with state.hasTimedOut=True so you can emit a final result and remove state",
                "When the state store exceeds memory",
                "When the streaming query is stopped"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-streaming-state')} style={MC_BTN(completed.has('spark-streaming-state'))}>{completed.has('spark-streaming-state') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── CATALYST OPTIMIZER ─────────────────────────────────────────── */}
        <section id="spark-catalyst" ref={ref('spark-catalyst')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Catalyst Optimizer</h1>
            <p className="topic-desc">
              Catalyst is Spark SQL's query optimizer. It transforms your logical query plan through four phases before execution. Understanding what Catalyst does automatically helps you write plans that Catalyst can optimise further  -  and diagnose plans where it can't.
            </p>
          </div>
          <CatalystAnimation />
          <CodeBlock lang="python">{`from pyspark.sql import functions as F

# ── 4 phases of Catalyst ──────────────────────────────────────────────
#
# 1. ANALYSIS
#    - Resolve column names against catalog (unknown column → AnalysisException)
#    - Resolve data types
#    - Expand * into actual column list
#
# 2. LOGICAL OPTIMIZATION (rule-based)
#    - Predicate pushdown:    filter pushed to data source / before join
#    - Column pruning:        drop columns not used downstream
#    - Constant folding:      1 + 1 → 2 at plan time
#    - Filter reordering:     cheaper filters first
#    - Subquery elimination:  convert correlated subqueries to joins
#    - Null propagation:      null + x → null (avoid null checks in UDFs)
#
# 3. PHYSICAL PLANNING (cost-based)
#    - Choose join strategy (BHJ vs SMJ vs SHJ) based on table stats
#    - Choose sort order for SMJ
#    - Cost model uses column statistics from ANALYZE TABLE
#
# 4. CODE GENERATION (Tungsten)
#    - Generate JVM bytecode for the physical plan
#    - Whole-stage code gen fuses multiple operators into one tight loop

# ── Read the query plan ───────────────────────────────────────────────
df = spark.table("silver.transactions") \
    .filter(F.col("status") == "COMPLETED") \
    .filter(F.col("amount") > 100) \
    .join(spark.table("dim.users").select("user_id", "tier"), "user_id") \
    .groupBy("tier") \
    .agg(F.sum("amount").alias("total"))

# Full plan with all 4 phases:
df.explain(extended=True)
# Or just physical plan:
df.explain()

# Example physical plan output interpretation:
# == Physical Plan ==
# *(3) HashAggregate(keys=[tier], functions=[sum(amount)])          ← Stage 3
# +- Exchange hashpartitioning(tier#12, 200)                       ← SHUFFLE
#    +- *(2) HashAggregate(keys=[tier], functions=[partial_sum(..)])← Stage 2 (partial agg)
#       +- *(2) Project [tier, amount]                              ← column pruning (Catalyst)
#          +- *(2) BroadcastHashJoin [user_id], [user_id]           ← BHJ chosen (dim.users is small)
#             :- *(2) Filter (status = 'COMPLETED') AND (amount > 100) ← predicate pushdown
#             :  +- *(2) ColumnarToRow
#             :     +- FileScan parquet [user_id,status,amount]     ← only reads 3 cols (pruning!)
#             +- BroadcastExchange HashedRelationBroadcastMode([user_id])
#                +- *(1) Project [user_id, tier]                    ← dim pruned to 2 cols
#                   +- *(1) FileScan parquet [user_id,tier]

# Key things to look for:
# *(N)           = whole-stage code gen active for this operator
# Exchange       = shuffle (expensive)
# BroadcastHashJoin vs SortMergeJoin
# FileScan with column list = column pruning working
# Filter before Join = predicate pushdown working

# ── Help Catalyst with statistics ────────────────────────────────────
# Without statistics, Catalyst can't make cost-based decisions
spark.sql("ANALYZE TABLE silver.transactions COMPUTE STATISTICS FOR ALL COLUMNS")
# Now Catalyst knows cardinality, min/max, null count → better join planning

# ── Force Catalyst rules for debugging ───────────────────────────────
spark.conf.set("spark.sql.optimizer.excludedRules",
               "org.apache.spark.sql.catalyst.optimizer.PushDownPredicates")
# ^ Disables predicate pushdown  -  only for debugging!`}
          </CodeBlock>
          <Quiz topicId="spark-catalyst" questions={[
            {
              question: "What does 'predicate pushdown' mean in Catalyst?",
              options: [
                "Pushing filter conditions to execute earlier in the query plan  -  ideally at the data source level so fewer rows are read from disk",
                "Converting WHERE clauses to HAVING clauses",
                "Reordering predicates for readability",
                "Caching filter results"
              ],
              correct: 0
            },
            {
              question: "In explain() output, what does '*(2)' before an operator indicate?",
              options: [
                "The operator runs on Stage 2",
                "Whole-stage code generation is active  -  this operator and adjacent *(2) operators are fused into a single generated JVM method for maximum performance",
                "The operator uses 2 CPU cores",
                "The operator has been replicated twice for fault tolerance"
              ],
              correct: 1
            },
            {
              question: "How do you give Catalyst the statistics it needs for cost-based join planning?",
              options: [
                "Catalyst collects statistics automatically from Parquet metadata",
                "Run ANALYZE TABLE ... COMPUTE STATISTICS FOR ALL COLUMNS  -  this populates column-level statistics (cardinality, min/max, nulls) that the cost-based optimizer uses to choose join strategies",
                "Enable spark.sql.cbo.enabled=true (no data scan needed)",
                "Use DataFrame.cache() before joins"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-catalyst')} style={MC_BTN(completed.has('spark-catalyst'))}>{completed.has('spark-catalyst') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── AQE ────────────────────────────────────────────────────────── */}
        <section id="spark-aqe" ref={ref('spark-aqe')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">AQE (Adaptive Query Execution)</h1>
            <p className="topic-desc">
              AQE (Spark 3.0+) re-optimises the physical plan at runtime using <em>actual</em> shuffle statistics  -  not estimates. It solves three of the hardest Spark tuning problems automatically: too many shuffle partitions, suboptimal join strategies, and data skew. Enabled by default in Spark 3.2+.
            </p>
          </div>
          <AQEAnimation />
          <CodeBlock lang="python">{`# ── Enable AQE ───────────────────────────────────────────────────────
spark.conf.set("spark.sql.adaptive.enabled", "true")          # default true in 3.2+
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")  # default true
spark.conf.set("spark.sql.adaptive.skewJoin.enabled",           "true")  # default true

# ── Feature 1: Coalesce Shuffle Partitions ────────────────────────────
# Problem: You set shuffle.partitions=500 for a large job.
#          After the shuffle, 450 of 500 partitions are tiny (< 1MB).
#          500 small tasks = massive scheduling overhead.
# AQE fix: After shuffle map stage completes, AQE reads actual partition sizes
#          and coalesces consecutive small partitions into larger ones.
#          The 500 output partitions → maybe 80 meaningful partitions.

spark.conf.set("spark.sql.shuffle.partitions",                  "auto")   # let AQE manage
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes","128mb")  # target size
spark.conf.set("spark.sql.adaptive.coalescePartitions.initialPartitionNum","500")  # starting point

# ── Feature 2: Convert Sort-Merge Join to Broadcast Join ─────────────
# Problem: At plan time, Catalyst estimated table B was too large to broadcast.
#          After the shuffle, actual data for table B is only 3MB.
# AQE fix: After the first stage, AQE sees table B's actual size = 3MB
#          → switches from SortMergeJoin to BroadcastHashJoin at runtime.
#          This eliminates the second shuffle entirely.

spark.conf.set("spark.sql.adaptive.autoBroadcastJoinThreshold", "30mb")   # override for AQE

# ── Feature 3: Skew Join Splitting ────────────────────────────────────
# Problem: One reducer partition has 10GB of data; others have ~50MB.
#          The 10GB task is a straggler that blocks the whole stage.
# AQE fix: AQE splits the skewed partition into N sub-partitions,
#          duplicates the corresponding other-side partitions, and runs
#          N smaller tasks instead of 1 huge one.

spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor",           "5")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "256mb")

# ── Reading AQE plans in explain() ───────────────────────────────────
# Before AQE: explain() shows static plan
# After execution: AQE plans visible in Spark UI → SQL → query detail
# Look for:
#   - "AdaptiveSparkPlan" as root node
#   - "== Final Plan ==" vs "== Initial Plan =="
#   - BroadcastHashJoin where SMJ was in initial plan → AQE converted it

df = spark.table("large_fact").join(spark.table("medium_dim"), "key")
df.explain()                    # initial static plan
df.count()                      # execute
# Check Spark UI → SQL tab → click the query → see AQE-modified plan

# ── AQE with Dynamic Partition Pruning ───────────────────────────────
# AQE + DPP work together: AQE handles partition count; DPP handles data skip
spark.conf.set("spark.sql.optimizer.dynamicPartitionPruning.enabled", "true")

# ── Disable AQE for specific queries (testing/debugging) ─────────────
with spark.conf as c:
    c.set("spark.sql.adaptive.enabled", "false")
    df.explain()    # see static plan without AQE
    c.set("spark.sql.adaptive.enabled", "true")

# ── AQE limitations ───────────────────────────────────────────────────
# - Only applies AFTER a shuffle  -  first stage always uses static plan
# - Doesn't help with single-stage (no-shuffle) jobs
# - Skew join only works on Sort-Merge joins, not Shuffle Hash joins`}
          </CodeBlock>
          <Quiz topicId="spark-aqe" questions={[
            {
              question: "How does AQE coalesce shuffle partitions differently from setting spark.sql.shuffle.partitions to a fixed value?",
              options: [
                "AQE uses random partition assignment",
                "AQE reads actual partition sizes after the shuffle completes and merges consecutive small partitions  -  it adapts to the real data volume rather than a pre-set estimate",
                "AQE coalesces are lossless; fixed partitions can lose data",
                "They are equivalent with spark.sql.shuffle.partitions=auto"
              ],
              correct: 1
            },
            {
              question: "AQE converts a Sort-Merge Join to a Broadcast Hash Join at runtime. What condition triggers this?",
              options: [
                "When both tables are under 10MB",
                "When the actual shuffle output of one side is smaller than spark.sql.adaptive.autoBroadcastJoinThreshold  -  measured after the map stage, not estimated at planning time",
                "When the query has been running for more than 5 minutes",
                "When AQE detects skew on the join key"
              ],
              correct: 1
            },
            {
              question: "AQE skew join splitting only works on which join type?",
              options: [
                "Broadcast Hash Joins",
                "Sort-Merge Joins  -  AQE splits the skewed partition and duplicates the corresponding other-side partitions. Broadcast joins don't need skew handling since the broadcast side is replicated to all executors already.",
                "Shuffle Hash Joins",
                "All join types"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-aqe')} style={MC_BTN(completed.has('spark-aqe'))}>{completed.has('spark-aqe') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── TUNGSTEN ───────────────────────────────────────────────────── */}
        <section id="spark-tungsten" ref={ref('spark-tungsten')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Tungsten Engine</h1>
            <p className="topic-desc">
              Tungsten is Spark's physical execution engine, introduced in Spark 1.4. It bypasses JVM object overheads and GC through three innovations: <strong>off-heap binary memory</strong> (UnsafeRow format), <strong>cache-aware algorithms</strong> (data accessed sequentially, not by pointer chasing), and <strong>whole-stage code generation</strong> (fusing operators into a single generated JVM method that the JIT can optimise fully).
            </p>
          </div>
          <TungstenAnimation />
          <CodeBlock lang="python">{`# ── Tungsten's 3 pillars ─────────────────────────────────────────────

# 1. UnsafeRow (off-heap binary format)
#    Traditional Java objects:
#      - Each field is a heap object with 16-byte header
#      - Object references → pointer chasing → cache misses
#    UnsafeRow:
#      - Compact binary layout: nulls bitmap + fixed-size fields + variable data
#      - Stored off-heap: bypasses GC entirely
#      - No serialisation needed to shuffle: the binary format IS the wire format
#      - Significantly reduces memory footprint and GC pause time

# 2. Cache-aware algorithms
#    Hash aggregation:
#      - In-memory hash table with compact binary keys
#      - Accesses memory sequentially → CPU cache friendly
#    Sort:
#      - Cache-aware sorting on binary data (not Java objects)
#      - Avoids pointer-chasing during comparisons

# 3. Whole-stage code generation (WholeStageCodeGen)
#    Traditional Volcano iterator model: each operator calls next() on child
#      - Method call overhead per row
#      - JIT can't optimise across operator boundaries
#    Whole-stage codegen:
#      - Fuses adjacent operators into ONE generated Java class
#      - Single tight loop over data (JIT-friendly)
#      - No virtual dispatch, direct variable access

# ── Enabling and verifying ────────────────────────────────────────────
spark.conf.set("spark.sql.codegen.wholeStage",         "true")   # default true
spark.conf.set("spark.sql.codegen.fallback",           "true")   # fallback if codegen fails
spark.conf.set("spark.sql.codegen.maxFields",          "100")    # max fields for codegen
spark.conf.set("spark.sql.codegen.factoryMode",        "CODEGEN_ONLY")  # debug: force codegen

# Verify in explain():
df.explain()
# *(N) prefix = this operator IS covered by whole-stage codegen
# Operators WITHOUT * = interpreted (fallback mode  -  check why)

# ── When codegen is disabled (fallback cases) ─────────────────────────
# 1. Python UDFs  -  can't generate JVM code for Python functions
#    → This is another reason to avoid Python UDFs (breaks codegen chain)
# 2. Too many fields (> spark.sql.codegen.maxFields)
# 3. Complex expressions that trigger codegen bugs (rare)
# 4. Some join types (BroadcastNestedLoopJoin)

# Check if codegen is being bypassed:
spark.sql("SET spark.sql.codegen.wholeStage").show()

# ── Inspecting generated code (advanced debugging) ────────────────────
# Enable to log generated code:
spark.conf.set("spark.sql.codegen.logging.maxLines", "1000")
# Then look for "Generated class" in executor logs

# ── Tungsten memory in practice ───────────────────────────────────────
# UnsafeRow memory usage vs Java objects:
# Java String("hello"):  ~48 bytes (object header + char array + length)
# UnsafeRow VARCHAR:     5 bytes (length prefix + bytes)
# 100M rows × (Java: 200 bytes/row) = 19GB
# 100M rows × (UnsafeRow: 40 bytes/row) = 3.7GB → 5x more rows fit in cache

# Off-heap config (bypasses JVM heap for cache operations):
spark.conf.set("spark.memory.offHeap.enabled", "true")
spark.conf.set("spark.memory.offHeap.size",    "8g")
# Off-heap = no GC pauses for cached data (GC only touches on-heap references)`}
          </CodeBlock>
          <Quiz topicId="spark-tungsten" questions={[
            {
              question: "Why do Python UDFs break whole-stage code generation?",
              options: [
                "Python UDFs use too much memory",
                "Whole-stage codegen generates a single JVM method fusing adjacent operators. A Python UDF introduces a JVM→Python boundary  -  Catalyst can't generate JVM code for Python logic, so the codegen chain is broken at that point.",
                "Python UDFs are executed on the driver",
                "Codegen doesn't support string types, which UDFs often return"
              ],
              correct: 1
            },
            {
              question: "What is UnsafeRow and why is it more efficient than regular Java objects?",
              options: [
                "UnsafeRow bypasses Spark's type system for faster processing",
                "UnsafeRow is a compact binary representation stored off-heap  -  it avoids JVM object overhead (16-byte headers, pointer indirection), reduces memory footprint 5-10x, and bypasses GC entirely since it's off-heap",
                "UnsafeRow is a mutable DataFrame for in-place updates",
                "UnsafeRow skips null checks for faster computation"
              ],
              correct: 1
            },
            {
              question: "What is the Volcano iterator model and what problem did whole-stage codegen solve?",
              options: [
                "An older shuffle algorithm replaced in Spark 2.0",
                "The Volcano model has each operator calling next() on its child per row  -  causing virtual method dispatch overhead and preventing JIT optimization across operators. Codegen fuses adjacent operators into one tight generated loop that JIT can optimize holistically.",
                "A memory model that caused OOM errors",
                "A join strategy superseded by Sort-Merge Join"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-tungsten')} style={MC_BTN(completed.has('spark-tungsten'))}>{completed.has('spark-tungsten') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── PERFORMANCE CONFIG ─────────────────────────────────────────── */}
        <section id="spark-config" ref={ref('spark-config')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Performance Configuration Reference</h1>
            <p className="topic-desc">
              A practical reference for the configurations that matter most in production Spark jobs. These are the knobs you'll actually tune  -  not an exhaustive list of every property.
            </p>
          </div>
          <ConfigAnimation />
          <CodeBlock lang="python">{`# ── Production baseline configuration ────────────────────────────────
spark = SparkSession.builder \
    .appName("production_etl") \
    .config("spark.executor.memory",                        "8g") \
    .config("spark.executor.cores",                         "4") \
    .config("spark.executor.instances",                     "20") \   # static allocation
    .config("spark.executor.memoryOverhead",                "2g") \   # off-JVM (Python, Netty)
    .config("spark.driver.memory",                          "4g") \
    .config("spark.driver.maxResultSize",                   "2g") \
    .config("spark.sql.shuffle.partitions",                 "auto") \ # AQE manages
    .config("spark.sql.adaptive.enabled",                   "true") \
    .config("spark.sql.adaptive.coalescePartitions.enabled","true") \
    .config("spark.sql.adaptive.skewJoin.enabled",          "true") \
    .config("spark.sql.adaptive.advisoryPartitionSizeInBytes","128mb") \
    .config("spark.sql.autoBroadcastJoinThreshold",         str(50*1024*1024)) \  # 50MB
    .config("spark.memory.fraction",                        "0.8") \
    .config("spark.memory.storageFraction",                 "0.3") \
    .config("spark.serializer",                             "org.apache.spark.serializer.KryoSerializer") \
    .config("spark.sql.codegen.wholeStage",                 "true") \
    .config("spark.sql.files.maxPartitionBytes",            str(128*1024*1024)) \  # 128MB per partition
    .config("spark.sql.files.openCostInBytes",              str(4*1024*1024)) \   # 4MB small file merge
    .getOrCreate()

# ── Dynamic allocation (scale up/down based on load) ─────────────────
spark.conf.set("spark.dynamicAllocation.enabled",           "true")
spark.conf.set("spark.dynamicAllocation.minExecutors",      "2")
spark.conf.set("spark.dynamicAllocation.maxExecutors",      "100")
spark.conf.set("spark.dynamicAllocation.initialExecutors",  "10")
spark.conf.set("spark.dynamicAllocation.executorIdleTimeout","60s")  # release idle executors
# Requires shuffle tracking (Spark 3.x):
spark.conf.set("spark.dynamicAllocation.shuffleTracking.enabled", "true")

# ── Speculative execution (retry slow tasks) ──────────────────────────
spark.conf.set("spark.speculation",                         "true")
spark.conf.set("spark.speculation.multiplier",              "1.5")    # task 1.5x slower than median → speculate
spark.conf.set("spark.speculation.quantile",                "0.75")   # wait for 75% tasks done first

# ── I/O optimisations ─────────────────────────────────────────────────
spark.conf.set("spark.sql.parquet.compression.codec",       "snappy")
spark.conf.set("spark.sql.parquet.mergeSchema",             "false")  # faster reads if schemas match
spark.conf.set("spark.sql.parquet.filterPushdown",          "true")   # pushdown to Parquet reader
spark.conf.set("spark.sql.orc.filterPushdown",              "true")
spark.conf.set("spark.hadoop.mapreduce.fileoutputcommitter.algorithm.version", "2")  # faster commits

# ── Network / shuffle ─────────────────────────────────────────────────
spark.conf.set("spark.shuffle.compress",                    "true")
spark.conf.set("spark.shuffle.spill.compress",              "true")
spark.conf.set("spark.reducer.maxSizeInFlight",             "96m")    # shuffle fetch buffer
spark.conf.set("spark.shuffle.io.maxRetries",               "10")
spark.conf.set("spark.shuffle.io.retryWait",                "30s")

# ── Executor sizing rule of thumb ─────────────────────────────────────
# - 4-5 cores per executor (> 5 cores = too much HDFS contention)
# - 4-8GB RAM per core (16-32GB executor)
# - Leave 1 core and 1GB per node for OS/other processes
# Example: 10 node cluster, 16 cores/64GB each:
#   Per node: 15 cores usable, 60GB usable
#   3 executors per node: 5 cores × 20GB each
#   Total: 30 executors × 5 cores × 20GB`}
          </CodeBlock>
          <Quiz topicId="spark-config" questions={[
            {
              question: "Why is more than 5 executor cores per executor not recommended?",
              options: [
                "Spark can't schedule more than 5 cores per executor",
                "With >5 cores, HDFS/ADLS concurrent access from one JVM causes throughput degradation  -  each core opens its own stream and the storage system is overwhelmed",
                "More cores increase GC pause time linearly",
                "Dynamic allocation only supports up to 5 cores"
              ],
              correct: 1
            },
            {
              question: "What does spark.speculation do?",
              options: [
                "Estimates partition sizes before executing",
                "When a task is significantly slower than the median for its stage (multiplier × median), Spark launches a duplicate speculative task on another executor  -  whichever finishes first wins",
                "Pre-fetches data for upcoming stages",
                "Predicts which stages will cause OOM"
              ],
              correct: 1
            },
            {
              question: "What is the difference between dynamic allocation and static executor allocation?",
              options: [
                "Dynamic allocation is always better",
                "Static: fixed number of executors for the job's lifetime. Dynamic: Spark requests/releases executors based on workload  -  cost-efficient for bursty jobs but adds latency for executor provisioning",
                "Dynamic allocation requires YARN; static works with K8s",
                "They are identical with spark.executor.instances set"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-config')} style={MC_BTN(completed.has('spark-config'))}>{completed.has('spark-config') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── SPARK UI ───────────────────────────────────────────────────── */}
        <section id="spark-ui" ref={ref('spark-ui')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Spark UI Navigation</h1>
            <p className="topic-desc">
              The Spark UI (port 4040 by default) is the primary tool for diagnosing slow jobs. Knowing <em>exactly</em> where to look for GC time, spill, skew, and excessive shuffle is the difference between guessing at a fix and knowing the root cause.
            </p>
          </div>
          <SparkUiAnimation />
          <CodeBlock lang="python">{`# ── Spark UI navigation guide ─────────────────────────────────────────
#
# URL: http://driver-host:4040  (or :4041, :4042 for concurrent apps)
# On Databricks: Compute → cluster → Spark UI
#
# ── JOBS tab ──────────────────────────────────────────────────────────
# - Shows one row per ACTION (count, write, show, collect)
# - Each job has a DAG Visualization (click "DAG Visualization")
# - Skipped stages = data served from cache (good!)
# - Failed stages = expand to see error message
#
# ── STAGES tab ────────────────────────────────────────────────────────
# - Shows each stage with aggregated metrics
# Key columns:
#   Input Size/Records   → data read from storage
#   Shuffle Read         → data received from previous stage
#   Shuffle Write        → data sent to next stage
#   Shuffle Spill (Disk) → data spilled to local disk (BAD  -  needs more memory or fewer records/partition)
#   Duration             → total wall time for the stage
# - Sort by Duration descending to find the slowest stage
#
# ── TASKS (click a Stage) ─────────────────────────────────────────────
# - Shows one row per task
# Key columns:
#   Duration             → sort descending, look for stragglers (skew!)
#   Input Size           → should be ~equal across tasks (check for skew)
#   GC Time              → > 10% of Duration = GC problem (need more memory)
#   Shuffle Spill (Disk) → >0 = spilling (reduce partition size)
#   Peak Execution Memory
# - Click the "Event Timeline" at top to visualise executor utilisation
#
# ── SQL tab ───────────────────────────────────────────────────────────
# - Shows the physical plan with timing overlaid
# - Each plan node shows: rows processed, time, bytes
# - Look for: FileScan (how many files/bytes read)
#             Exchange (= shuffle  -  shows shuffle bytes)
#             BroadcastHashJoin vs SortMergeJoin
#             Photon nodes (on Databricks)
#
# ── STORAGE tab ───────────────────────────────────────────────────────
# - Shows cached RDDs/DataFrames
# - Fraction cached (< 100% = not enough memory, evictions happening)
# - Size in memory vs on disk
#
# ── EXECUTORS tab ─────────────────────────────────────────────────────
# - Per-executor: cores, memory used, GC time, task count
# - Look for: one executor with 10x more tasks → uneven work distribution
# - Blacklisted executors = node failures
#
# ── Practical debugging workflow ─────────────────────────────────────

import time

spark.sparkContext.setJobDescription("Debug: daily revenue aggregation")

# 1. Run the job with timing:
t0 = time.time()
df_result.write.format("delta").mode("overwrite").save("/output/debug/")
print(f"Job took: {time.time() - t0:.1f}s")

# 2. Check Spark UI → Jobs → find the job → DAG visualization
# 3. Identify slowest stage (most time in STAGES tab)
# 4. Click the stage → Tasks → sort by Duration
#    - All tasks similar duration? → not skew
#    - One task 10x longer? → data skew on the shuffle key
#    - High GC time? → increase executor memory
#    - Shuffle Spill > 0? → reduce partition size or increase memory

# 5. Check SQL tab → physical plan
#    - Is BHJ used where you expected? (check autoBroadcastJoinThreshold)
#    - Is predicate pushdown working? (filter before FileScan in plan)
#    - How many bytes in FileScan? (partition pruning working?)

# 6. Add logging for your own metrics:
spark.sparkContext.setLocalProperty("callSite.short", "gold_daily_revenue")
spark.conf.set("spark.job.description", "Gold: daily revenue by merchant")`}
          </CodeBlock>
          <Quiz topicId="spark-ui" questions={[
            {
              question: "In the Spark UI Stages tab, you see 'Shuffle Spill (Disk) = 45 GB'. What does this tell you and how do you fix it?",
              options: [
                "45GB was written to Delta  -  this is normal",
                "Shuffle data that couldn't fit in execution memory was spilled to local disk. Fix: increase spark.executor.memory, increase spark.sql.shuffle.partitions to reduce data per partition, or broadcast the smaller side to eliminate the shuffle",
                "The output files are 45GB  -  reduce with coalesce",
                "45GB of cached data was evicted  -  increase storage memory fraction"
              ],
              correct: 1
            },
            {
              question: "In the Tasks view of a stage, you see one task took 45 minutes while 199 other tasks took 30 seconds each. What is the root cause and fix?",
              options: [
                "The executor hosting that task is overloaded  -  fix with dynamic allocation",
                "Data skew: one shuffle partition has disproportionately more data. Fix: enable AQE skew join handling, use salting, or filter null keys before the join",
                "GC pressure  -  increase executor memory",
                "The task is reading from a cold ADLS partition"
              ],
              correct: 1
            },
            {
              question: "You see 'Skipped' stages in the Spark UI Jobs DAG. What does this mean?",
              options: [
                "Those stages failed and were skipped",
                "The DataFrame for those stages was cached  -  Spark served the data from cache and didn't need to recompute those stages. This is the expected behaviour when caching correctly.",
                "AQE eliminated those stages",
                "Those stages had no data to process"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-ui')} style={MC_BTN(completed.has('spark-ui'))}>{completed.has('spark-ui') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── SPARK + DELTA LAKE ─────────────────────────────────────────── */}
        <section id="spark-delta" ref={ref('spark-delta')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 7 - Apache Spark + PySpark</div>
            <h1 className="topic-title">Spark + Delta Lake Integration</h1>
            <p className="topic-desc">
              Delta Lake integrates deeply with Spark, adding ACID transactions, schema enforcement, time travel, and the MERGE API on top of Parquet files. In Databricks, Delta is the default table format. Understanding the Spark-side API for Delta is essential for production data engineering.
            </p>
          </div>
          <DeltaAnimation />
          <CodeBlock lang="python">{`from delta.tables import DeltaTable
from pyspark.sql import functions as F

# ── Reading Delta ─────────────────────────────────────────────────────
# By path:
df = spark.read.format("delta").load("/data/delta/orders/")
# By catalog table (Unity Catalog):
df = spark.table("catalog.silver.orders")
# Time travel by version:
df_v10 = spark.read.format("delta").option("versionAsOf", 10).load("/data/delta/orders/")
# Time travel by timestamp:
df_yesterday = spark.read.format("delta") \
    .option("timestampAsOf", "2024-06-01T00:00:00") \
    .load("/data/delta/orders/")

# ── Writing Delta ─────────────────────────────────────────────────────
# Simple write:
df.write.format("delta").mode("overwrite").save("/data/delta/orders/")
# Or saveAsTable (registers in Hive/Unity Catalog):
df.write.format("delta").mode("overwrite").saveAsTable("silver.orders")

# Partial overwrite using replaceWhere:
df_jan.write.format("delta") \
    .mode("overwrite") \
    .option("replaceWhere", "event_date >= '2024-01-01' AND event_date < '2024-02-01'") \
    .save("/data/delta/events/")

# ── MERGE (upsert) API ────────────────────────────────────────────────
target = DeltaTable.forName(spark, "silver.orders")

target.alias("t").merge(
    source=updates_df.alias("s"),
    condition="t.order_id = s.order_id"
) \
.whenMatchedUpdate(
    condition="s.updated_at > t.updated_at",
    set={"status": "s.status", "amount": "s.amount", "updated_at": "s.updated_at"}
) \
.whenNotMatchedInsert(
    values={"order_id": "s.order_id", "status": "s.status",
            "amount": "s.amount", "created_at": "s.created_at", "updated_at": "s.updated_at"}
) \
.whenNotMatchedBySourceDelete(   # Delta 2.0+ / DBR 12.2+
    condition="t.status = 'CANCELLED' AND t.updated_at < '2023-01-01'"
) \
.execute()

# MERGE in Structured Streaming (foreachBatch):
def merge_micro_batch(micro_df, batch_id):
    """Idempotent upsert  -  safe to re-run on failure."""
    target = DeltaTable.forName(spark, "silver.orders")
    target.alias("t").merge(
        micro_df.dropDuplicates(["order_id"]).alias("s"),
        "t.order_id = s.order_id"
    ).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()

stream.writeStream.foreachBatch(merge_micro_batch) \
    .option("checkpointLocation", "/checkpoints/orders-merge") \
    .trigger(processingTime="2 minutes") \
    .start()

# ── Schema evolution ──────────────────────────────────────────────────
# Fail on schema change (default):
df.write.format("delta").mode("append").save("/path/")  # fails if new column

# Allow schema evolution:
df.write.format("delta").mode("append") \
    .option("mergeSchema", "true") \   # new columns added to table schema
    .save("/path/")

# Force overwrite schema:
df.write.format("delta").mode("overwrite") \
    .option("overwriteSchema", "true") \
    .save("/path/")

# ── Delta Lake table operations ───────────────────────────────────────
dt = DeltaTable.forName(spark, "silver.orders")

# History:
dt.history().select("version", "timestamp", "operation", "operationMetrics").show(10)

# Restore to previous version:
dt.restoreToVersion(5)
dt.restoreToTimestamp("2024-06-01")

# OPTIMIZE + Z-ORDER (in PySpark  -  Databricks/Delta OSS 2.0+):
spark.sql("OPTIMIZE silver.orders ZORDER BY (customer_id, order_date)")
spark.sql("VACUUM silver.orders RETAIN 168 HOURS")  # delete files > 7 days old

# ── Change Data Feed ──────────────────────────────────────────────────
spark.sql("ALTER TABLE silver.orders SET TBLPROPERTIES (delta.enableChangeDataFeed = true)")

# Read incremental changes:
changes = spark.read.format("delta") \
    .option("readChangeFeed",  "true") \
    .option("startingVersion", "10") \
    .table("silver.orders")
# _change_type: insert / update_preimage / update_postimage / delete`}
          </CodeBlock>
          <Quiz topicId="spark-delta" questions={[
            {
              question: "What does the 'replaceWhere' option in a Delta write do?",
              options: [
                "Overwrites only rows matching the condition (like an in-place update)",
                "Atomically replaces only the partitions matching the predicate with new data  -  other partitions are untouched. This is a safe partial overwrite that avoids rewriting the entire table.",
                "Filters out rows matching the condition before writing",
                "Creates a new partition for rows matching the condition"
              ],
              correct: 1
            },
            {
              question: "Why is dropDuplicates(['order_id']) important inside a foreachBatch MERGE function?",
              options: [
                "MERGE fails with duplicate source keys",
                "The micro-batch may contain multiple updates for the same order_id (e.g., two Kafka messages). Without deduplication, MERGE throws a non-deterministic update error because it can't decide which source row wins.",
                "It improves MERGE performance",
                "Delta requires unique rows in append mode"
              ],
              correct: 1
            },
            {
              question: "What information does Delta Lake's Change Data Feed expose?",
              options: [
                "The transaction log in JSON format",
                "Each row change with a _change_type column: insert, update_preimage (before), update_postimage (after), or delete  -  enables downstream incremental processing without full table scans",
                "Schema changes only",
                "VACUUM and OPTIMIZE operation history"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('spark-delta')} style={MC_BTN(completed.has('spark-delta'))}>{completed.has('spark-delta') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── KAFKA ARCHITECTURE ─────────────────────────────────────────── */}
        <section id="kafka-arch" ref={ref('kafka-arch')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Kafka + Streaming Internals</div>
            <h1 className="topic-title">Kafka Architecture (Brokers, Partitions, ISR)</h1>
            <p className="topic-desc">
              Apache Kafka is a distributed commit log  -  an append-only, ordered, immutable sequence of records. A Kafka <strong>cluster</strong> is formed by multiple <strong>brokers</strong> (servers). <strong>Topics</strong> are logical channels divided into <strong>partitions</strong>. Each partition is an ordered, immutable log replicated across brokers. The <strong>leader</strong> partition handles all reads and writes; <strong>ISR (In-Sync Replicas)</strong> are the set of replicas caught up with the leader. If the leader fails, a new leader is elected from the ISR. Historically Kafka used ZooKeeper for cluster metadata  -  from Kafka 3.3+ the <strong>KRaft</strong> mode replaces ZooKeeper with a built-in Raft consensus protocol. <strong>Consumer groups</strong> allow horizontal scaling: each partition is consumed by exactly one consumer per group. <strong>Offsets</strong> track the consumer's position in each partition. Retention can be time-based (<code>retention.ms</code>), size-based (<code>retention.bytes</code>), or log compaction (keeps only the latest value per key  -  ideal for changelog topics).
            </p>
          </div>
          <KafkaArchAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Partition count is permanent:</strong> You can increase partitions after creation but never decrease them without recreating the topic. Plan partition count carefully  -  more partitions = more parallelism but also more overhead. A common rule: partitions ≈ max desired consumer instances.
            </div>
          </div>
          <CodeBlock lang="python">{`# ── Key Kafka configuration parameters ────────────────────────────────
# Topic-level:
# replication.factor        = 3       # copies of each partition across brokers
# min.insync.replicas       = 2       # min ISR for acks=all to succeed
# retention.ms              = 604800000  # 7 days (default)
# retention.bytes           = -1      # unlimited (per-partition)
# cleanup.policy            = delete  # 'delete' or 'compact'
# max.message.bytes         = 1048576 # 1 MB default

# ── Create topic via Kafka CLI ─────────────────────────────────────────
# kafka-topics.sh --bootstrap-server broker:9092 \\
#   --create --topic orders \\
#   --partitions 12 \\
#   --replication-factor 3 \\
#   --config retention.ms=604800000 \\
#   --config min.insync.replicas=2

# ── Consumer group concepts ────────────────────────────────────────────
# Group of 3 consumers, topic with 12 partitions:
#   Consumer A → partitions 0,1,2,3
#   Consumer B → partitions 4,5,6,7
#   Consumer C → partitions 8,9,10,11
# If Consumer A dies → its partitions rebalanced to B and C (rebalance)
# More consumers than partitions → some consumers idle

# ── Log compaction (for CDC / changelog topics) ────────────────────────
# cleanup.policy=compact: Kafka retains only the LATEST record per key.
# Deleted records use a tombstone (null value).
# Use case: database change events, config updates, user profile changes.
# kafka-configs.sh --bootstrap-server broker:9092 \\
#   --entity-type topics --entity-name user-profiles \\
#   --alter --add-config cleanup.policy=compact

# ── KRaft mode (Kafka 3.3+, ZooKeeper replacement) ────────────────────
# Built-in Raft consensus  -  no ZooKeeper cluster needed.
# Benefits: simpler ops, faster startup, 10x more partitions per cluster.
# Migration: kafka-storage.sh format --cluster-id <UUID> --config server.properties`}
          </CodeBlock>
          <Quiz topicId="kafka-arch" questions={[
            {
              question: "What is the ISR (In-Sync Replicas) in Kafka?",
              options: [
                "The set of consumer groups that are actively reading a topic",
                "The set of replicas that are fully caught up with the leader partition. When the leader fails, a new leader is elected from the ISR. min.insync.replicas controls the minimum ISR size required for a produce to succeed with acks=all.",
                "The index of offsets stored on each broker",
                "The list of brokers running in KRaft mode"
              ],
              correct: 1
            },
            {
              question: "In a consumer group with 3 consumers and a topic with 12 partitions, what happens when one consumer crashes?",
              options: [
                "The 12 partitions pause until the consumer restarts",
                "A group rebalance is triggered  -  the crashed consumer's partitions are redistributed among the remaining 2 consumers. Processing resumes from the last committed offset.",
                "Kafka replays all messages from the beginning",
                "The other consumers skip the crashed consumer's partitions"
              ],
              correct: 1
            },
            {
              question: "What is log compaction and when should you use it?",
              options: [
                "Gzip compression applied to Kafka partition files",
                "A retention policy (cleanup.policy=compact) that keeps only the latest record per key. Use it for changelog topics (CDC, user state, config) where you need a full current snapshot but not full history.",
                "A process that merges small partition segments into larger files",
                "Reducing partition count to save disk space"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('kafka-arch')} style={MC_BTN(completed.has('kafka-arch'))}>{completed.has('kafka-arch') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── KAFKA PYTHON API ────────────────────────────────────────────── */}
        <section id="kafka-python" ref={ref('kafka-python')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Kafka + Streaming Internals</div>
            <h1 className="topic-title">Kafka Python Producer / Consumer API</h1>
            <p className="topic-desc">
              The <strong>confluent-kafka</strong> Python library is the production-grade client for Kafka (based on librdkafka). The <strong>Producer</strong> sends messages asynchronously  -  configure <code>bootstrap.servers</code>, <code>acks='all'</code> for durability, and <code>enable.idempotence=True</code> for safe retries. A <strong>delivery report callback</strong> confirms each message was committed. The <strong>Consumer</strong> joins a consumer group via <code>group.id</code>, sets <code>auto.offset.reset='earliest'</code> to start from the beginning, and uses <code>enable.auto.commit=False</code> with manual commits  -  offsets are committed only after successful processing, preventing data loss on crashes.
            </p>
          </div>
          <KafkaPythonAnimation />
          <CodeBlock lang="python">{`from confluent_kafka import Producer, Consumer, KafkaError, KafkaException
import json

# ── Producer ──────────────────────────────────────────────────────────
producer_conf = {
    'bootstrap.servers':    'broker1:9092,broker2:9092,broker3:9092',
    'acks':                 'all',            # wait for all ISR acknowledgements
    'enable.idempotence':   True,             # deduplicates retried produces
    'retries':              5,
    'max.in.flight.requests.per.connection': 1,
    'compression.type':     'snappy',
    'linger.ms':            5,
    'batch.size':           65536,
}

producer = Producer(producer_conf)

def delivery_report(err, msg):
    if err is not None:
        print(f"Delivery failed for {msg.key()}: {err}")
    else:
        print(f"Delivered → topic={msg.topic()} partition={msg.partition()} offset={msg.offset()}")

orders = [
    {'order_id': 'ord-001', 'amount': 99.99,  'customer_id': 'cust-42'},
    {'order_id': 'ord-002', 'amount': 149.50, 'customer_id': 'cust-17'},
]

for order in orders:
    producer.produce(
        topic    = 'orders',
        key      = order['order_id'].encode('utf-8'),
        value    = json.dumps(order).encode('utf-8'),
        callback = delivery_report,
    )
    producer.poll(0)   # trigger delivery report callbacks (non-blocking)

producer.flush()   # wait for all in-flight messages to be delivered

# ── Consumer ──────────────────────────────────────────────────────────
consumer_conf = {
    'bootstrap.servers':    'broker1:9092,broker2:9092',
    'group.id':             'orders-processor-v1',
    'auto.offset.reset':    'earliest',
    'enable.auto.commit':   False,        # CRITICAL: manual commit after processing
    'max.poll.interval.ms': 300000,
    'session.timeout.ms':   30000,
}

consumer = Consumer(consumer_conf)
consumer.subscribe(['orders'])

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            raise KafkaException(msg.error())

        order = json.loads(msg.value().decode('utf-8'))
        print(f"Processing order: {order['order_id']}")

        # Commit AFTER successful processing  -  prevents data loss on crash
        consumer.commit(message=msg, asynchronous=False)

except KeyboardInterrupt:
    pass
finally:
    consumer.close()`}
          </CodeBlock>
          <Quiz topicId="kafka-python" questions={[
            {
              question: "Why use enable.auto.commit=False with manual commits in a Kafka consumer?",
              options: [
                "Auto-commit is faster and should always be enabled",
                "Auto-commit advances the offset on a timer regardless of whether processing succeeded. If the consumer crashes after auto-commit but before processing completes, the message is lost. Manual commit after processing ensures at-least-once delivery.",
                "Auto-commit doesn't work with the confluent-kafka library",
                "Manual commit reduces Kafka broker load"
              ],
              correct: 1
            },
            {
              question: "What does enable.idempotence=True do on the Kafka Producer?",
              options: [
                "Prevents sending duplicate keys to the same topic",
                "Assigns each producer a unique Producer ID and sequence number per partition. If the broker receives a duplicate (e.g., after a retry on network timeout), it deduplicates it using the sequence number  -  ensuring exactly-once delivery at the producer level.",
                "Compresses messages to reduce duplication",
                "Ensures messages are delivered in alphabetical order"
              ],
              correct: 1
            },
            {
              question: "What is the purpose of the delivery report callback in the Producer?",
              options: [
                "It filters messages before they are sent to the broker",
                "It is called asynchronously for each message after the broker acknowledges or rejects it  -  allowing you to log failures, trigger retries, or update metrics. Without it you have no visibility into whether produces succeeded.",
                "It compresses the message payload",
                "It controls which partition the message is sent to"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('kafka-python')} style={MC_BTN(completed.has('kafka-python'))}>{completed.has('kafka-python') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── KAFKA EXACTLY-ONCE SEMANTICS ───────────────────────────────── */}
        <section id="kafka-eos" ref={ref('kafka-eos')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Kafka + Streaming Internals</div>
            <h1 className="topic-title">Kafka Exactly-Once Semantics</h1>
            <p className="topic-desc">
              Exactly-once processing requires three things: <strong>idempotent source reads</strong> (re-reading from offset doesn't create duplicates), <strong>idempotent transformations</strong> (running the same computation twice produces the same result), and <strong>atomic sink writes</strong> (writes either fully succeed or fully fail). In Kafka, <strong>idempotent producers</strong> use a Producer ID + per-partition sequence number to deduplicate retried sends. <strong>Transactions</strong> extend this: <code>begin_transaction</code> → produce messages → <code>commit_transaction</code> (or <code>abort_transaction</code>) atomically across multiple partitions. In Spark Structured Streaming, exactly-once is achieved by combining checkpoint-based offset tracking with a Delta Lake ACID sink  -  Spark generates unique batch IDs and Delta's transaction log rejects duplicate writes.
            </p>
          </div>
          <KafkaEOSAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>The three delivery guarantees:</strong> At-most-once (messages may be lost, never duplicated), At-least-once (no messages lost, duplicates possible on retry  -  most common default), Exactly-once (no loss, no duplicates  -  requires idempotent producer + transactional writes + ACID sink). EOS has a performance cost; use it only when required.
            </div>
          </div>
          <CodeBlock lang="python">{`# ── Transactional Producer (Kafka EOS) ────────────────────────────────
from confluent_kafka import Producer
import json

transactional_conf = {
    'bootstrap.servers':  'broker1:9092,broker2:9092',
    'transactional.id':   'orders-producer-1',   # unique per producer instance
    'enable.idempotence': True,
    'acks':               'all',
}

producer = Producer(transactional_conf)
producer.init_transactions()

def send_with_transaction(orders: list):
    producer.begin_transaction()
    try:
        for order in orders:
            producer.produce(
                topic  = 'orders-processed',
                key    = order['order_id'].encode(),
                value  = json.dumps(order).encode(),
            )
        producer.commit_transaction()   # atomic: all messages visible at once
    except Exception as e:
        producer.abort_transaction()    # rollback: no messages visible
        raise

# ── Spark Structured Streaming + Delta Lake EOS ────────────────────────
# 1. Checkpointing: Spark records consumed Kafka offsets. On restart,
#    Spark resumes from the last committed offset  -  no message is skipped.
# 2. Delta ACID sink: Each micro-batch has a unique batchId. Delta's
#    transaction log deduplicates any batch written more than once.

from pyspark.sql import SparkSession
from delta.tables import DeltaTable
from pyspark.sql.functions import col, from_json

spark = SparkSession.builder.getOrCreate()

stream_df = spark.readStream \\
    .format("kafka") \\
    .option("kafka.bootstrap.servers", "broker1:9092") \\
    .option("subscribe", "orders") \\
    .option("startingOffsets", "latest") \\
    .load()

def process_batch(batch_df, batch_id):
    order_schema = "order_id STRING, customer_id STRING, amount DOUBLE, status STRING"
    parsed = batch_df.select(
        col("key").cast("string").alias("order_id"),
        from_json(col("value").cast("string"), order_schema).alias("d")
    ).select("order_id", "d.*")

    DeltaTable.forName(spark, "silver.orders").alias("t") \\
        .merge(parsed.alias("s"), "t.order_id = s.order_id") \\
        .whenMatchedUpdateAll() \\
        .whenNotMatchedInsertAll() \\
        .execute()

stream_df.writeStream \\
    .foreachBatch(process_batch) \\
    .option("checkpointLocation", "abfss://checkpoints@lake.dfs.core.windows.net/orders") \\
    .trigger(processingTime="1 minute") \\
    .start() \\
    .awaitTermination()

# ✅ Idempotent source:      Kafka offset checkpointing
# ✅ Idempotent transforms:  Deterministic Spark transformations
# ✅ Atomic sink:            Delta Lake ACID transactions (batch_id dedup)`}
          </CodeBlock>
          <Quiz topicId="kafka-eos" questions={[
            {
              question: "What are the three requirements for exactly-once stream processing?",
              options: [
                "Fast network, SSD storage, and low latency brokers",
                "Idempotent source reads, idempotent transformations, and atomic sink writes. Missing any one breaks exactly-once guarantees.",
                "enable.idempotence=True, acks=all, and compression",
                "Kafka transactions, Spark checkpointing, and ZooKeeper"
              ],
              correct: 1
            },
            {
              question: "How does Spark Structured Streaming achieve exactly-once with a Delta Lake sink?",
              options: [
                "By using enable.idempotence on the Kafka consumer",
                "Spark's checkpoint records the last committed Kafka offset so restarts resume exactly where they stopped. Each micro-batch has a unique batchId, and Delta Lake's transaction log deduplicates any batch written more than once  -  making foreachBatch + Delta inherently idempotent.",
                "By setting spark.sql.streaming.exactlyOnce=true",
                "Delta Lake automatically deduplicates all incoming data by primary key"
              ],
              correct: 1
            },
            {
              question: "What is the role of transactional.id in a Kafka transactional producer?",
              options: [
                "It is a human-readable label for the topic",
                "It is a unique identifier that persists across producer restarts. The broker uses it to recover or abort any in-flight transaction from a previous instance  -  ensuring no partial transaction is ever visible to consumers, even after a crash.",
                "It sets the transaction timeout duration",
                "It routes all messages to the same partition"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('kafka-eos')} style={MC_BTN(completed.has('kafka-eos'))}>{completed.has('kafka-eos') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── KAFKA CONNECT + DEBEZIUM ────────────────────────────────────── */}
        <section id="kafka-connect" ref={ref('kafka-connect')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Kafka + Streaming Internals</div>
            <h1 className="topic-title">Kafka Connect + Debezium CDC</h1>
            <p className="topic-desc">
              <strong>Kafka Connect</strong> is a scalable framework for streaming data between Kafka and external systems without writing custom producers/consumers. <strong>Source connectors</strong> pull data into Kafka (databases, object storage, APIs). <strong>Sink connectors</strong> push Kafka data to destinations (data lakes, databases, Elasticsearch). Connectors are deployed as JSON configuration  -  no custom code for standard integrations. <strong>Debezium</strong> is the leading CDC (Change Data Capture) source connector  -  it tails database transaction logs (MySQL binlog, PostgreSQL WAL, SQL Server CDC) and streams every INSERT/UPDATE/DELETE as a Kafka event. Topics follow the naming convention <code>server.database.table</code>. The <strong>dead letter queue (DLQ)</strong> captures records that fail to process, enabling debugging without blocking the main pipeline.
            </p>
          </div>
          <KafkaConnectAnimation />
          <CodeBlock lang="json">{`// ── Debezium PostgreSQL CDC Connector config ──────────────────────────
// PUT http://kafka-connect:8083/connectors/postgres-cdc/config
{
  "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
  "tasks.max": "1",
  "database.hostname": "postgres.internal",
  "database.port": "5432",
  "database.user": "debezium",
  "database.password": "secret",
  "database.dbname": "ecommerce",
  "database.server.name": "ecommerce-prod",
  "table.include.list": "public.orders,public.customers",
  "plugin.name": "pgoutput",
  "publication.name": "dbz_publication",
  "slot.name": "debezium_slot",
  "topic.prefix": "ecommerce-prod",
  "key.converter": "io.confluent.kafka.serializers.KafkaAvroSerializer",
  "key.converter.schema.registry.url": "http://schema-registry:8081",
  "value.converter": "io.confluent.kafka.serializers.KafkaAvroSerializer",
  "value.converter.schema.registry.url": "http://schema-registry:8081",
  "transforms": "unwrap",
  "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
  "transforms.unwrap.drop.tombstones": "false",
  "transforms.unwrap.delete.handling.mode": "rewrite",
  "errors.tolerance": "all",
  "errors.deadletterqueue.topic.name": "dlq.ecommerce-prod.orders",
  "errors.deadletterqueue.topic.replication.factor": "3",
  "errors.deadletterqueue.context.headers.enable": "true"
}

// ── Topics created ────────────────────────────────────────────────────
// ecommerce-prod.public.orders    ← INSERT/UPDATE/DELETE on orders
// ecommerce-prod.public.customers

// ── Debezium CDC event structure (raw envelope) ───────────────────────
// { "before": { "order_id": 1, "status": "pending" },
//   "after":  { "order_id": 1, "status": "shipped" },
//   "op": "u",   // c=create, u=update, d=delete, r=snapshot read
//   "ts_ms": 1718000000000,
//   "source": { "db": "ecommerce", "table": "orders", "lsn": 12345678 } }

// ── After ExtractNewRecordState (flattened for easy consumption) ──────
// { "order_id": 1, "status": "shipped",
//   "__op": "u", "__ts_ms": 1718000000000, "__deleted": "false" }`}
          </CodeBlock>
          <Quiz topicId="kafka-connect" questions={[
            {
              question: "How does Debezium CDC capture database changes?",
              options: [
                "It runs SELECT queries on the source table every few seconds (polling)",
                "It tails the database's transaction log (MySQL binlog, PostgreSQL WAL, SQL Server CDC)  -  capturing every change in commit order with low latency and no impact on source database performance.",
                "It uses database triggers to write changes to a staging table",
                "It compares table snapshots taken at regular intervals"
              ],
              correct: 1
            },
            {
              question: "What is the dead letter queue (DLQ) in Kafka Connect?",
              options: [
                "A topic where Kafka stores old messages past their retention period",
                "A separate topic where Kafka Connect routes messages that fail to process (e.g., deserialization errors, schema mismatches). errors.tolerance=all prevents a bad message from halting the connector  -  it goes to the DLQ instead, keeping the pipeline running.",
                "A queue for messages that were intentionally deleted",
                "The DLQ stores connector configuration backups"
              ],
              correct: 1
            },
            {
              question: "What does the Debezium ExtractNewRecordState transform do?",
              options: [
                "It extracts the schema from the Schema Registry",
                "It flattens the Debezium envelope (before/after/op/source) into a flat record with only the 'after' state plus metadata fields (__op, __ts_ms). This makes CDC events easier to consume with Spark or standard Kafka consumers.",
                "It filters out DELETE events from the CDC stream",
                "It converts Avro messages to JSON"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('kafka-connect')} style={MC_BTN(completed.has('kafka-connect'))}>{completed.has('kafka-connect') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── SCHEMA REGISTRY + AVRO ─────────────────────────────────────── */}
        <section id="kafka-schema" ref={ref('kafka-schema')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Kafka + Streaming Internals</div>
            <h1 className="topic-title">Schema Registry + Avro</h1>
            <p className="topic-desc">
              The <strong>Confluent Schema Registry</strong> is a central repository for Avro, Protobuf, and JSON Schema definitions. Producers register a schema before publishing; the Registry returns a schema ID that is embedded in each message (4 bytes). Consumers look up the schema by ID to deserialize  -  this decouples schema management from application code. Schemas are versioned by <strong>subject</strong> (typically <code>topic-value</code> or <code>topic-key</code>). <strong>Compatibility modes</strong> enforce evolution rules: <strong>BACKWARD</strong> (new schema can read data written with old schema  -  add optional fields), <strong>FORWARD</strong> (old schema can read data written with new schema  -  remove fields), <strong>FULL</strong> (both directions  -  safest). This prevents producers from breaking consumers with incompatible schema changes.
            </p>
          </div>
          <SchemaRegistryAnimation />
          <CodeBlock lang="python">{`# ── Avro Producer with Schema Registry ───────────────────────────────
from confluent_kafka import Producer
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer
from confluent_kafka.serialization import SerializationContext, MessageField

order_schema_str = """
{
  "type": "record", "name": "Order",
  "namespace": "com.company.ecommerce",
  "fields": [
    {"name": "order_id",    "type": "string"},
    {"name": "customer_id", "type": "string"},
    {"name": "amount",      "type": "double"},
    {"name": "status",      "type": "string"},
    {"name": "created_at",  "type": "long", "logicalType": "timestamp-millis"},
    {"name": "region",      "type": ["null", "string"], "default": null}
  ]
}
"""

schema_registry_client = SchemaRegistryClient({'url': 'http://schema-registry:8081'})

avro_serializer = AvroSerializer(
    schema_registry_client = schema_registry_client,
    schema_str             = order_schema_str,
    to_dict                = lambda obj, ctx: obj,
)

producer = Producer({'bootstrap.servers': 'broker1:9092'})

order = {'order_id': 'ord-001', 'customer_id': 'cust-42',
         'amount': 99.99, 'status': 'pending', 'created_at': 1718000000000, 'region': 'EU'}

producer.produce(
    topic  = 'orders',
    key    = order['order_id'],
    value  = avro_serializer(order, SerializationContext('orders', MessageField.VALUE)),
)
producer.flush()

# ── Avro Consumer with Schema Registry ───────────────────────────────
from confluent_kafka import Consumer
from confluent_kafka.schema_registry.avro import AvroDeserializer

avro_deserializer = AvroDeserializer(
    schema_registry_client = schema_registry_client,
    schema_str             = order_schema_str,
    from_dict              = lambda obj, ctx: obj,
)

consumer = Consumer({'bootstrap.servers': 'broker1:9092',
                     'group.id': 'orders-avro-consumer', 'auto.offset.reset': 'earliest'})
consumer.subscribe(['orders'])

while True:
    msg = consumer.poll(1.0)
    if msg is None: continue
    order = avro_deserializer(msg.value(), SerializationContext('orders', MessageField.VALUE))
    print(order)   # → {'order_id': 'ord-001', 'customer_id': 'cust-42', ...}

# ── Compatibility modes ────────────────────────────────────────────────
# BACKWARD  → add optional fields (with default). Consumers upgraded first.
# FORWARD   → remove fields. Producers upgraded first.
# FULL      → only add optional fields or remove fields with defaults. Safest.
# NONE      → no compatibility checking. Never use in production.

# Set compatibility: PUT http://schema-registry:8081/config/orders-value
#   {"compatibility": "FULL"}`}
          </CodeBlock>
          <Quiz topicId="kafka-schema" questions={[
            {
              question: "What does BACKWARD compatibility mean in Schema Registry?",
              options: [
                "Old schema versions can still be registered",
                "A new schema version can read data written by the old schema version. You can safely add optional fields with defaults  -  existing consumers that haven't upgraded can still deserialize messages produced with the new schema.",
                "The schema is compatible with older Kafka broker versions",
                "Consumers can read from older partition offsets"
              ],
              correct: 1
            },
            {
              question: "Why does Schema Registry store schemas centrally instead of embedding the full schema in each message?",
              options: [
                "To reduce message size  -  each message contains only a 4-byte schema ID. Consumers look up the schema by ID from the Registry. This also enforces schema governance: incompatible schema changes are rejected at registration time before any bad data is produced.",
                "Because Avro schemas are too large to fit in a message header",
                "For backward compatibility with older Kafka versions",
                "So that schemas can be automatically applied to the data lake"
              ],
              correct: 0
            },
            {
              question: "What happens when a producer tries to register a schema that violates the configured compatibility mode?",
              options: [
                "The schema is registered but flagged with a warning",
                "The Schema Registry returns a 409 Conflict error, rejecting the registration. The producer cannot publish messages with the incompatible schema  -  proactively preventing broken consumers before any bad data is produced.",
                "The incompatible messages are sent to the dead letter queue",
                "The compatibility mode is automatically updated to NONE"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('kafka-schema')} style={MC_BTN(completed.has('kafka-schema'))}>{completed.has('kafka-schema') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ─── KAFKA VS AZURE EVENT HUB ───────────────────────────────────── */}
        <section id="kafka-vs-eventhub" ref={ref('kafka-vs-eventhub')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Kafka + Streaming Internals</div>
            <h1 className="topic-title">Kafka vs Azure Event Hub</h1>
            <p className="topic-desc">
              Azure Event Hub is a fully managed, Kafka-compatible streaming service. It exposes the Kafka protocol  -  most Kafka clients work against Event Hub with only a <code>bootstrap.servers</code> change. Key differences: Event Hub has a maximum retention of 90 days (long-term retention requires Blob Capture); partitions are fixed at namespace creation and cannot be increased; Kafka protocol is available on Event Hub Premium. Event Hub integrates natively with the Azure ecosystem (Auto Loader, ADF, Stream Analytics). Self-managed Kafka offers more flexibility: unlimited retention, dynamic partition increases, the full Kafka Connect ecosystem, Kafka Streams, and multi-cloud deployments. Choose Event Hub for Azure-native low-ops platforms. Choose Kafka when you need the full ecosystem, multi-cloud, or complex routing.
            </p>
          </div>
          <KafkaVsEventHubAnimation />
          <CodeBlock lang="python">{`# ── Connecting an existing Kafka client to Azure Event Hub ────────────
# Only bootstrap.servers and security config change.
from confluent_kafka import Producer

event_hub_conf = {
    'bootstrap.servers':  'my-namespace.servicebus.windows.net:9093',
    'security.protocol':  'SASL_SSL',
    'sasl.mechanism':     'PLAIN',
    'sasl.username':      '$ConnectionString',
    'sasl.password':      ('Endpoint=sb://my-namespace.servicebus.windows.net/;'
                           'SharedAccessKeyName=RootManageSharedAccessKey;'
                           'SharedAccessKey=<key>'),
    'group.id':           'orders-consumer-group',
    'auto.offset.reset':  'earliest',
}
# All other Producer/Consumer code is identical to standard Kafka.

# ── Event Hub Capture → Auto Loader → Delta Lake ──────────────────────
# Event Hub Capture writes Avro files to ADLS Gen2.
# Auto Loader picks them up incrementally:
from pyspark.sql import SparkSession
spark = SparkSession.builder.getOrCreate()

df = spark.readStream \\
    .format("cloudFiles") \\
    .option("cloudFiles.format", "avro") \\
    .option("cloudFiles.schemaLocation", "/checkpoints/eventhub-schema") \\
    .load("abfss://eventhub-capture@mystorageaccount.dfs.core.windows.net/my-namespace/orders/")

df.writeStream \\
    .format("delta") \\
    .option("checkpointLocation", "/checkpoints/eventhub-orders") \\
    .outputMode("append") \\
    .table("bronze.orders_raw")

# ── Feature comparison ────────────────────────────────────────────────
# Feature                  Kafka (self-managed)       Azure Event Hub
# ─────────────────────────────────────────────────────────────────────
# Retention                Unlimited (disk-bound)     7 - 90 days (Capture → Blob)
# Partition change         Increase at any time       Fixed at namespace creation
# Protocol                 Kafka native               Kafka + AMQP (Premium tier)
# Kafka Connect            Full OSS ecosystem         Not natively included
# Consumer groups          Unlimited                  Up to 20 (Standard tier)
# Schema Registry          Confluent / Apicurio       Not natively included
# Ops overhead             High (self-managed)        Zero (fully managed)
# Azure integration        Requires connectors        Native (Auto Loader, ADF)
# Cost model               Infrastructure + ops       Per throughput-unit
# Multi-cloud              Yes                        Azure only`}
          </CodeBlock>
          <Quiz topicId="kafka-vs-eventhub" questions={[
            {
              question: "What is the main operational advantage of Azure Event Hub over self-managed Kafka?",
              options: [
                "Event Hub supports more partitions per topic",
                "Event Hub is fully managed  -  no brokers, ZooKeeper, or KRaft cluster to provision, monitor, or patch. The tradeoff is less flexibility: fixed partitions at creation, 90-day max retention, and no native Kafka Connect ecosystem.",
                "Event Hub is cheaper than Kafka in all scenarios",
                "Event Hub supports unlimited consumer groups"
              ],
              correct: 1
            },
            {
              question: "How does an existing Kafka application connect to Azure Event Hub?",
              options: [
                "You must rewrite the application using the Azure SDK",
                "Change only bootstrap.servers to the Event Hub namespace endpoint and add SASL_SSL authentication. Event Hub implements the Kafka protocol  -  existing confluent-kafka producers and consumers work without code changes.",
                "Install the Azure Event Hub Kafka adapter library",
                "Event Hub does not support the Kafka protocol"
              ],
              correct: 1
            },
            {
              question: "When should you choose self-managed Kafka over Azure Event Hub?",
              options: [
                "When you want to avoid infrastructure overhead",
                "When you need the full Kafka Connect ecosystem (Debezium, JDBC, S3 sink), unlimited retention, dynamic partition increases, Kafka Streams, multi-cloud streaming, or more than 20 consumer groups.",
                "When you are running entirely on Azure",
                "When your team has no Kafka expertise"
              ],
              correct: 1
            },
          ]} />
          <button onClick={mc('kafka-vs-eventhub')} style={MC_BTN(completed.has('kafka-vs-eventhub'))}>{completed.has('kafka-vs-eventhub') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

      </main>
    </div>
  )
}

// ─── ANIMATION COMPONENTS ────────────────────────────────────────────────────

function LazyEvalAnimation() {
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)
  const steps = ['filter(amount > 1000)', 'map(add tax col)', 'join(customers)', 'groupBy(merchant)', 'write(parquet)']
  useEffect(() => {
    if (!running) return
    if (step >= steps.length) return
    const t = setTimeout(() => setStep(s => s + 1), 400)
    return () => clearTimeout(t)
  }, [running, step])
  const reset = () => { setRunning(false); setStep(0) }
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Lazy Evaluation — Transformations queue until Action fires</div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ padding:'6px 12px', borderRadius:8, fontSize:13, border:'1px solid', borderColor: running && step > i ? '#22c55e' : 'var(--border)', background: running && step > i ? '#dcfce7' : 'var(--surface-1)', color: running && step > i ? '#16a34a' : 'var(--text-2)', transition:'all 0.3s' }}>{s}</div>
        ))}
      </div>
      {!running && step === 0 && <div style={{ color:'#f59e0b', fontSize:13, marginBottom:12 }}>No computation until action!</div>}
      {running && step < steps.length && <div style={{ color:'#3b82f6', fontSize:13, marginBottom:12 }}>Executing step {step + 1}/{steps.length}…</div>}
      {step >= steps.length && <div style={{ color:'#22c55e', fontSize:13, marginBottom:12 }}>Action complete — all steps executed!</div>}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => setRunning(true)} disabled={running} style={{ padding:'6px 14px', borderRadius:6, background:'#f97316', color:'#fff', border:'none', cursor:'pointer', fontSize:13 }}>Trigger Action</button>
        <button onClick={reset} style={{ padding:'6px 14px', borderRadius:6, background:'var(--surface-1)', color:'var(--text-1)', border:'1px solid var(--border)', cursor:'pointer', fontSize:13 }}>Reset</button>
      </div>
    </div>
  )
}

function RDDAnimation() {
  const [tab, setTab] = useState(0)
  const tabs = ['RDD', 'DataFrame', 'Dataset']
  const chips: Record<number, {label:string; color:string}[]> = {
    0: [{label:'No optimizer',color:'#ef4444'},{label:'Low-level API',color:'#f97316'},{label:'Java objects',color:'#eab308'},{label:'Manual schema',color:'#8b5cf6'}],
    1: [{label:'Catalyst optimizer',color:'#22c55e'},{label:'Named schema',color:'#3b82f6'},{label:'SQL support',color:'#06b6d4'},{label:'Tungsten codegen',color:'#8b5cf6'}],
    2: [{label:'Type-safe',color:'#22c55e'},{label:'Encoder-based',color:'#3b82f6'},{label:'Scala/Java only',color:'#f97316'},{label:'Compile-time checks',color:'#8b5cf6'}],
  }
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Spark Abstraction Layers</div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {tabs.map((t, i) => <button key={i} onClick={() => setTab(i)} style={{ padding:'6px 16px', borderRadius:6, border:'1px solid var(--border)', background: tab===i ? '#f97316' : 'var(--surface-1)', color: tab===i ? '#fff' : 'var(--text-1)', cursor:'pointer', fontWeight: tab===i ? 700 : 400 }}>{t}</button>)}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {chips[tab].map((c, i) => <span key={i} style={{ padding:'4px 12px', borderRadius:20, background: c.color + '22', color: c.color, border:`1px solid ${c.color}44`, fontSize:13 }}>{c.label}</span>)}
      </div>
    </div>
  )
}

function ReadingAnimation() {
  const [fmt, setFmt] = useState(0)
  const formats = ['parquet','delta','csv','json','orc']
  const data = [
    { pushdown:'Yes', schemaEvol:'No', splittable:'Yes', compression:'Snappy/Zstd', speed:95 },
    { pushdown:'Yes', schemaEvol:'Yes', splittable:'Yes', compression:'Snappy/Zstd', speed:98 },
    { pushdown:'No',  schemaEvol:'No', splittable:'Yes', compression:'None/Gzip', speed:30 },
    { pushdown:'No',  schemaEvol:'No', splittable:'No',  compression:'None/Gzip', speed:25 },
    { pushdown:'Yes', schemaEvol:'No', splittable:'Yes', compression:'Zlib', speed:80 },
  ]
  const d = data[fmt]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Format Comparison</div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {formats.map((f, i) => <button key={i} onClick={() => setFmt(i)} style={{ padding:'5px 12px', borderRadius:6, border:'1px solid var(--border)', background: fmt===i ? '#3b82f6' : 'var(--surface-1)', color: fmt===i ? '#fff' : 'var(--text-1)', cursor:'pointer' }}>{f}</button>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        {[['Predicate Pushdown', d.pushdown],['Schema Evolution', d.schemaEvol],['Splittable', d.splittable],['Compression', d.compression]].map(([k,v]) => (
          <div key={k} style={{ background:'var(--surface-1)', borderRadius:8, padding:'8px 12px' }}>
            <div style={{ fontSize:11, color:'var(--text-2)' }}>{k}</div>
            <div style={{ fontWeight:600, color: v==='Yes'?'#22c55e':v==='No'?'#ef4444':'var(--text-1)' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:4 }}>Relative Read Speed</div>
      <div style={{ background:'var(--surface-1)', borderRadius:4, height:16 }}>
        <div style={{ width:`${d.speed}%`, height:'100%', background:'#3b82f6', borderRadius:4, transition:'width 0.4s' }}/>
      </div>
    </div>
  )
}

function WritingAnimation() {
  const [mode, setMode] = useState(0)
  const modes = ['overwrite','append','ignore','errorIfExists']
  const info = [
    { icon:'🔄', desc:'Deletes ALL existing data, writes new data atomically', color:'#ef4444' },
    { icon:'➕', desc:'Adds new files without touching existing data', color:'#22c55e' },
    { icon:'⏭️', desc:'No-op if destination already has data', color:'#eab308' },
    { icon:'🚫', desc:'Raises AnalysisException if data already exists', color:'#8b5cf6' },
  ]
  const m = info[mode]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Write Modes</div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {modes.map((md, i) => <button key={i} onClick={() => setMode(i)} style={{ padding:'5px 12px', borderRadius:6, border:'1px solid var(--border)', background: mode===i ? m.color : 'var(--surface-1)', color: mode===i ? '#fff' : 'var(--text-1)', cursor:'pointer' }}>{md}</button>)}
      </div>
      <div style={{ fontSize:32, marginBottom:8 }}>{m.icon}</div>
      <div style={{ fontSize:14, color:'var(--text-1)', marginBottom:12 }}>{m.desc}</div>
      <div style={{ background:'var(--surface-1)', borderRadius:8, padding:10, fontSize:12, color:'var(--text-2)' }}>
        df.write.mode("{modes[mode]}").partitionBy("year","month").parquet("/data/output/")
      </div>
    </div>
  )
}

function TransformsAnimation() {
  const [selected, setSelected] = useState<string|null>(null)
  const narrow = ['map','filter','union','withColumn','select','dropDuplicates (single)']
  const wide   = ['groupBy','join','distinct','repartition','orderBy','dropDuplicates (multi)']
  const isWide = (t: string) => wide.includes(t)
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Narrow vs Wide Transformations — click to inspect</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div>
          <div style={{ fontWeight:600, color:'#22c55e', marginBottom:8 }}>Narrow (no shuffle)</div>
          {narrow.map(t => <div key={t} onClick={() => setSelected(t)} style={{ padding:'6px 10px', borderRadius:6, marginBottom:4, cursor:'pointer', background: selected===t ? '#dcfce7' : 'var(--surface-1)', border:`1px solid ${selected===t?'#22c55e':'var(--border)'}`, fontSize:13 }}>{t}</div>)}
        </div>
        <div>
          <div style={{ fontWeight:600, color:'#ef4444', marginBottom:8 }}>Wide (shuffle)</div>
          {wide.map(t => <div key={t} onClick={() => setSelected(t)} style={{ padding:'6px 10px', borderRadius:6, marginBottom:4, cursor:'pointer', background: selected===t ? '#fee2e2' : 'var(--surface-1)', border:`1px solid ${selected===t?'#ef4444':'var(--border)'}`, fontSize:13 }}>{t}</div>)}
        </div>
      </div>
      {selected && <div style={{ marginTop:12, padding:10, borderRadius:8, background: isWide(selected)?'#fee2e2':'#dcfce7', fontSize:13 }}>
        <strong>{selected}</strong> — Shuffle: <strong>{isWide(selected)?'YES — network transfer between executors':'NO — single partition only'}</strong>
      </div>}
    </div>
  )
}

function FunctionsAnimation() {
  const [cat, setCat] = useState(0)
  const cats = ['String','Date','Array','Math']
  const demos = [
    [['lower("Hello")','hello'],['trim("  hi  ")','hi'],['split("a,b,c",",")','["a","b","c"]'],['regexp_replace("a1b2","[0-9]","")','ab']],
    [['current_date()','2024-06-01'],['date_add("2024-01-01",7)','2024-01-08'],['datediff("2024-02-01","2024-01-01")','31'],['date_format(ts,"yyyy-MM")','2024-06']],
    [['size(array(1,2,3))','3'],['explode([1,2,3])','1 / 2 / 3'],['array_contains([1,2],1)','true'],['flatten([[1,2],[3]])','[1,2,3]']],
    [['round(3.567,2)','3.57'],['abs(-42)','42'],['sqrt(144)','12.0'],['log(2.718)','1.0']],
  ]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Built-in Functions — input → output</div>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {cats.map((c,i) => <button key={i} onClick={() => setCat(i)} style={{ padding:'5px 12px', borderRadius:6, border:'1px solid var(--border)', background: cat===i?'#8b5cf6':'var(--surface-1)', color: cat===i?'#fff':'var(--text-1)', cursor:'pointer' }}>{c}</button>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {demos[cat].map(([inp, out]) => (
          <div key={inp} style={{ background:'var(--surface-1)', borderRadius:8, padding:10 }}>
            <code style={{ fontSize:12, color:'#3b82f6' }}>{inp}</code>
            <div style={{ fontSize:11, color:'var(--text-2)', margin:'2px 0' }}>→</div>
            <code style={{ fontSize:12, color:'#22c55e' }}>{out}</code>
          </div>
        ))}
      </div>
    </div>
  )
}

function WindowAnimation() {
  const [fn, setFn] = useState(0)
  const fns = ['ROW_NUMBER','RANK','DENSE_RANK','LAG','SUM (running)']
  const rows = [
    {name:'Alice', score:90},
    {name:'Bob',   score:85},
    {name:'Carol', score:85},
    {name:'Dave',  score:70},
    {name:'Eve',   score:60},
  ]
  const calc = (i: number): string => {
    if (fn===0) return String(i+1)
    if (fn===1) { const scores=rows.map(r=>r.score); return String(scores.slice(0,i).filter(s=>s>rows[i].score).length+1) }
    if (fn===2) { const uniq=[...new Set(rows.map(r=>r.score))].sort((a,b)=>b-a); return String(uniq.indexOf(rows[i].score)+1) }
    if (fn===3) return i===0 ? 'null' : String(rows[i-1].score)
    return String(rows.slice(0,i+1).reduce((s,r)=>s+r.score,0))
  }
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Window Functions Demo</div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
        {fns.map((f,i) => <button key={i} onClick={() => setFn(i)} style={{ padding:'5px 10px', borderRadius:6, border:'1px solid var(--border)', background: fn===i?'#06b6d4':'var(--surface-1)', color: fn===i?'#fff':'var(--text-1)', cursor:'pointer', fontSize:13 }}>{f}</button>)}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead><tr>{['Name','Score',fns[fn]].map(h => <th key={h} style={{ padding:'6px 10px', background:'var(--surface-1)', textAlign:'left', borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r,i) => <tr key={i}><td style={{ padding:'5px 10px' }}>{r.name}</td><td style={{ padding:'5px 10px' }}>{r.score}</td><td style={{ padding:'5px 10px', color:'#06b6d4', fontWeight:600 }}>{calc(i)}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

function JoinStrategiesAnimation() {
  const [sel, setSel] = useState(0)
  const strategies = [
    { name:'Broadcast Hash Join', when:'Small table ≤ 10MB (autoBroadcastJoinThreshold)', cost:'Low — no shuffle', condition:'Any equi-join; small side broadcast to all executors', color:'#22c55e' },
    { name:'Sort-Merge Join', when:'Both tables large, no memory fit', cost:'High — both sides shuffled + sorted', condition:'Equi-join; default for large-large joins', color:'#3b82f6' },
    { name:'Shuffle Hash Join', when:'One side fits executor memory', cost:'Medium — one side shuffled + hashed', condition:'Equi-join; one side must fit in memory', color:'#f97316' },
    { name:'Cartesian Join', when:'No join key (cross join)', cost:'Extreme — O(N×M) rows', condition:'Must use CROSS JOIN syntax explicitly', color:'#ef4444' },
  ]
  const s = strategies[sel]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Join Strategies — click to compare</div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
        {strategies.map((st,i) => <button key={i} onClick={() => setSel(i)} style={{ padding:'5px 10px', borderRadius:6, border:`1px solid ${sel===i?st.color:'var(--border)'}`, background: sel===i?st.color+'22':'var(--surface-1)', color:'var(--text-1)', cursor:'pointer', fontSize:12 }}>{st.name.split(' ')[0]}</button>)}
      </div>
      <div style={{ padding:14, borderRadius:8, border:`1px solid ${s.color}44`, background:`${s.color}11` }}>
        <div style={{ fontWeight:700, color:s.color, marginBottom:8 }}>{s.name}</div>
        {[['When Used',s.when],['Cost',s.cost],['Condition',s.condition]].map(([k,v]) => (
          <div key={k} style={{ marginBottom:4, fontSize:13 }}><span style={{ color:'var(--text-2)' }}>{k}: </span><span style={{ color:'var(--text-1)' }}>{v}</span></div>
        ))}
      </div>
    </div>
  )
}

function PartitionsAnimation() {
  const [count, setCount] = useState(16)
  const boxes = Math.min(count, 64)
  const sizeFor = (i: number) => { const v = ((i*7+3)%10)/10; return v }
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Partition Visualizer</div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <span style={{ fontSize:13, color:'var(--text-2)' }}>Partitions: <strong style={{ color:'var(--text-1)' }}>{count}</strong></span>
        <input type="range" min={4} max={200} value={count} onChange={e => setCount(Number(e.target.value))} style={{ flex:1 }}/>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:12 }}>
        {Array.from({length:boxes}).map((_,i) => { const s=sizeFor(i); return <div key={i} title={String(i)} style={{ width:14, height:14, borderRadius:3, background:`hsl(${s*120},70%,50%)` }}/> })}
        {count > 64 && <div style={{ fontSize:12, color:'var(--text-2)', alignSelf:'center' }}>+{count-64} more</div>}
      </div>
      <div style={{ fontSize:13, color:'var(--text-2)' }}>Total tasks = {count} &nbsp;|&nbsp; {count<16?'⚠️ Too few — underutilized cores':count>400?'⚠️ Too many — scheduling overhead':'✅ Healthy range'}</div>
    </div>
  )
}

function SkewAnimation() {
  const [salted, setSalted] = useState(false)
  const before = [8, 7, 100, 6]
  const after  = [12,11,14,13,15,12,13,14]
  const tasks  = salted ? after : before
  const maxVal = Math.max(...tasks)
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Data Skew — {salted ? 'After Salting' : 'Before (Skewed)'}</div>
      <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:80, marginBottom:12 }}>
        {tasks.map((v,i) => <div key={i} style={{ flex:1, borderRadius:4, background: v===maxVal&&!salted?'#ef4444':'#3b82f6', height:`${(v/maxVal)*100}%`, transition:'height 0.4s', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <span style={{ fontSize:10, color:'#fff', paddingBottom:2 }}>{v}</span>
        </div>)}
      </div>
      <button onClick={() => setSalted(s => !s)} style={{ padding:'6px 14px', borderRadius:6, background: salted?'#22c55e':'#f97316', color:'#fff', border:'none', cursor:'pointer', fontSize:13 }}>
        {salted ? 'Show Before (Skewed)' : 'Apply Salting →'}
      </button>
    </div>
  )
}

function MemoryAnimation() {
  const [sel, setSel] = useState<number|null>(null)
  const slices = [
    { label:'Execution', pct:40, color:'#3b82f6', desc:'Joins, aggregations, sorts, shuffles. Can borrow from Storage.' },
    { label:'Storage', pct:40, color:'#22c55e', desc:'Cached DataFrames, broadcast variables. Can borrow from Execution.' },
    { label:'User', pct:10, color:'#f97316', desc:'User data structures, RDD operations outside Spark SQL.' },
    { label:'Reserved', pct:10, color:'#9ca3af', desc:'JVM overhead, OS, Spark internals (300MB fixed).' },
  ]
  let offset = 0
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Spark Executor Memory Layout — click a segment</div>
      <div style={{ display:'flex', height:32, borderRadius:8, overflow:'hidden', marginBottom:14, cursor:'pointer' }}>
        {slices.map((s,i) => { offset+=s.pct; return <div key={i} onClick={() => setSel(sel===i?null:i)} style={{ width:`${s.pct}%`, background:s.color, opacity: sel===null||sel===i?1:0.4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:600, transition:'opacity 0.2s' }}>{s.label}</div> })}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
        {slices.map((s,i) => <span key={i} style={{ fontSize:12, color:s.color }}>{s.label} {s.pct}%</span>)}
      </div>
      {sel!==null && <div style={{ padding:10, borderRadius:8, background:slices[sel].color+'22', border:`1px solid ${slices[sel].color}44`, fontSize:13 }}>{slices[sel].desc}</div>}
    </div>
  )
}

function CacheAnimation() {
  const [lvl, setLvl] = useState(0)
  const levels = [
    { name:'MEMORY_ONLY', spills:'No', serialized:'No', cost:'High RAM', useCase:'Small hot DataFrames', color:'#3b82f6' },
    { name:'MEMORY_AND_DISK', spills:'Yes', serialized:'No', cost:'Medium RAM', useCase:'Default — most workloads', color:'#22c55e' },
    { name:'DISK_ONLY', spills:'N/A', serialized:'Yes', cost:'Low RAM', useCase:'Large infrequently-accessed', color:'#f97316' },
    { name:'OFF_HEAP', spills:'No', serialized:'Yes', cost:'Managed memory', useCase:'Avoid GC on large caches', color:'#8b5cf6' },
  ]
  const l = levels[lvl]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Storage Levels</div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
        {levels.map((lv,i) => <button key={i} onClick={() => setLvl(i)} style={{ padding:'5px 10px', borderRadius:6, border:'1px solid var(--border)', background: lvl===i?lv.color:'var(--surface-1)', color: lvl===i?'#fff':'var(--text-1)', cursor:'pointer', fontSize:12 }}>{lv.name}</button>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {[['Spills to Disk',l.spills],['Serialized',l.serialized],['Memory Cost',l.cost],['Best For',l.useCase]].map(([k,v]) => (
          <div key={k} style={{ background:'var(--surface-1)', borderRadius:8, padding:'8px 12px' }}>
            <div style={{ fontSize:11, color:'var(--text-2)' }}>{k}</div>
            <div style={{ fontWeight:600, color:'var(--text-1)', fontSize:13 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BroadcastAnimation() {
  const [mode, setMode] = useState<'broadcast'|'shuffle'>('broadcast')
  const executors = [0,1,2,3]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Broadcast vs Shuffle Join</div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {(['broadcast','shuffle'] as const).map(m => <button key={m} onClick={() => setMode(m)} style={{ padding:'6px 14px', borderRadius:6, border:'1px solid var(--border)', background: mode===m?(m==='broadcast'?'#22c55e':'#ef4444'):'var(--surface-1)', color: mode===m?'#fff':'var(--text-1)', cursor:'pointer' }}>{m==='broadcast'?'Broadcast Join':'Shuffle Join'}</button>)}
      </div>
      {mode==='broadcast' ? (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <div style={{ padding:'8px 14px', borderRadius:8, background:'#dcfce7', border:'1px solid #22c55e', fontSize:13, fontWeight:600 }}>Driver</div>
            <span style={{ fontSize:20 }}>→</span>
            <div style={{ display:'flex', gap:6 }}>
              {executors.map(i => <div key={i} style={{ padding:'6px 10px', borderRadius:8, background:'#eff6ff', border:'1px solid #3b82f6', fontSize:12 }}>Exec {i+1}</div>)}
            </div>
          </div>
          <div style={{ fontSize:12, color:'#16a34a' }}>Small table sent once to each executor — NO shuffle needed</div>
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
            {[...executors,...executors].map((i,j) => <div key={j} style={{ padding:'6px 10px', borderRadius:8, background:'#fee2e2', border:'1px solid #ef4444', fontSize:12 }}>Exec {i+1}</div>)}
          </div>
          <div style={{ fontSize:12, color:'#dc2626' }}>Both sides shuffled across network — expensive!</div>
        </div>
      )}
    </div>
  )
}

function UDFAnimation() {
  const [sel, setSel] = useState(0)
  const udfs = [
    { name:'Python UDF', overhead:'Very High', batch:'No', speed:10, color:'#ef4444', note:'Row-by-row JVM↔Python serialization' },
    { name:'Pandas UDF', overhead:'Low', batch:'Yes (Arrow)', speed:80, color:'#22c55e', note:'Vectorized via Apache Arrow — 10-100x faster' },
    { name:'Built-in Function', overhead:'None', batch:'Yes', speed:100, color:'#3b82f6', note:'Runs entirely in JVM — always prefer these' },
  ]
  const u = udfs[sel]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>UDF Performance Comparison</div>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {udfs.map((u,i) => <button key={i} onClick={() => setSel(i)} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid var(--border)', background: sel===i?u.color:'var(--surface-1)', color: sel===i?'#fff':'var(--text-1)', cursor:'pointer', fontSize:13 }}>{u.name}</button>)}
      </div>
      <div style={{ marginBottom:8, fontSize:13 }}><span style={{ color:'var(--text-2)' }}>Overhead: </span><strong style={{ color:u.color }}>{u.overhead}</strong> &nbsp;|&nbsp; <span style={{ color:'var(--text-2)' }}>Batch: </span><strong>{u.batch}</strong></div>
      <div style={{ marginBottom:6, fontSize:12, color:'var(--text-2)' }}>Relative Speed</div>
      <div style={{ background:'var(--surface-1)', borderRadius:4, height:16, marginBottom:8 }}>
        <div style={{ width:`${u.speed}%`, height:'100%', background:u.color, borderRadius:4, transition:'width 0.4s' }}/>
      </div>
      <div style={{ fontSize:12, color:'var(--text-2)' }}>{u.note}</div>
    </div>
  )
}

function SparkSQLAnimation() {
  const [step, setStep] = useState(-1)
  const steps = [
    { label:'Parse SQL', desc:'Tokenize + build unresolved AST', icon:'📝' },
    { label:'Analyze', desc:'Resolve columns against catalog', icon:'🔍' },
    { label:'Optimize', desc:'Catalyst rule-based rewrites (pushdown, pruning)', icon:'⚡' },
    { label:'Physical Plan', desc:'Select join strategies, scan methods', icon:'🗺️' },
    { label:'Execute', desc:'Tungsten codegen + run on executors', icon:'🚀' },
  ]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Catalyst Pipeline — click Next to walk through</div>
      <div style={{ display:'flex', gap:4, flexWrap:'wrap', alignItems:'center', marginBottom:14 }}>
        {steps.map((s,i) => <React.Fragment key={i}>
          <div onClick={() => setStep(i)} style={{ padding:'6px 10px', borderRadius:8, cursor:'pointer', background: step>=i?'#6366f1':'var(--surface-1)', color: step>=i?'#fff':'var(--text-1)', border:`1px solid ${step>=i?'#6366f1':'var(--border)'}`, fontSize:12, transition:'all 0.2s' }}>{s.icon} {s.label}</div>
          {i<steps.length-1 && <span style={{ color:'var(--text-2)', fontSize:16 }}>→</span>}
        </React.Fragment>)}
      </div>
      {step>=0 && <div style={{ padding:10, borderRadius:8, background:'#eef2ff', border:'1px solid #a5b4fc', fontSize:13 }}>{steps[Math.min(step,steps.length-1)].desc}</div>}
      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <button onClick={() => setStep(s => Math.min(s+1, steps.length-1))} style={{ padding:'6px 12px', borderRadius:6, background:'#6366f1', color:'#fff', border:'none', cursor:'pointer', fontSize:13 }}>Next Step</button>
        <button onClick={() => setStep(-1)} style={{ padding:'6px 12px', borderRadius:6, background:'var(--surface-1)', color:'var(--text-1)', border:'1px solid var(--border)', cursor:'pointer', fontSize:13 }}>Reset</button>
      </div>
    </div>
  )
}

function StreamingAnimation() {
  const [sel, setSel] = useState(0)
  const modes = [
    { name:'Continuous', trigger:'processingTime="0 seconds"', latency:'~1ms', useCase:'Ultra-low latency; limited operations', color:'#22c55e' },
    { name:'Fixed Interval', trigger:'processingTime="30 seconds"', latency:'Seconds-minutes', useCase:'Standard streaming; most workloads', color:'#3b82f6' },
    { name:'Once / AvailableNow', trigger:'once() / availableNow()', latency:'Batch', useCase:'Incremental batch loads on schedule', color:'#f97316' },
  ]
  const m = modes[sel]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Structured Streaming Trigger Modes</div>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {modes.map((md,i) => <button key={i} onClick={() => setSel(i)} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid var(--border)', background: sel===i?md.color:'var(--surface-1)', color: sel===i?'#fff':'var(--text-1)', cursor:'pointer' }}>{md.name}</button>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {[['Trigger Code',m.trigger],['Latency',m.latency],['Use Case',m.useCase]].map(([k,v]) => (
          <div key={k} style={{ background:'var(--surface-1)', borderRadius:8, padding:'8px 12px', gridColumn: k==='Use Case'?'span 2':'auto' }}>
            <div style={{ fontSize:11, color:'var(--text-2)' }}>{k}</div>
            <div style={{ fontWeight:600, color:'var(--text-1)', fontSize:13 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatefulStreamingAnimation() {
  const [tick, setTick] = useState(0)
  const watermarkDelay = 2
  const events = [
    {t:1,name:'E1'},{t:2,name:'E2'},{t:3,name:'E3'},{t:4,name:'E4'},
    {t:5,name:'E5'},{t:1,name:'E6(late)'},{t:2,name:'E7(late)'},
  ]
  const shown = events.slice(0, Math.min(tick+1, events.length))
  const maxT  = shown.reduce((m,e) => Math.max(m,e.t), 0)
  const watermark = Math.max(0, maxT - watermarkDelay)
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Watermark — Late Event Handling</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
        {shown.map((e,i) => {
          const late = e.t <= watermark
          return <div key={i} style={{ padding:'4px 10px', borderRadius:6, fontSize:12, background: late?'#fee2e2':'#dcfce7', border:`1px solid ${late?'#ef4444':'#22c55e'}`, color: late?'#dc2626':'#16a34a' }}>{e.name} (t={e.t}){late?' ✗':' ✓'}</div>
        })}
      </div>
      <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:10 }}>Watermark: <strong style={{ color:'#f97316' }}>t={watermark}</strong> (max_event_time - {watermarkDelay}s) | Events at t≤{watermark} dropped</div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => setTick(t => Math.min(t+1, events.length-1))} style={{ padding:'6px 12px', borderRadius:6, background:'#3b82f6', color:'#fff', border:'none', cursor:'pointer', fontSize:13 }}>Next Event →</button>
        <button onClick={() => setTick(0)} style={{ padding:'6px 12px', borderRadius:6, background:'var(--surface-1)', color:'var(--text-1)', border:'1px solid var(--border)', cursor:'pointer', fontSize:13 }}>Reset</button>
      </div>
    </div>
  )
}

function CatalystAnimation() {
  const [expanded, setExpanded] = useState<number|null>(null)
  const phases = [
    { icon:'🔍', label:'Analysis', color:'#3b82f6', desc:'Resolves column names against catalog. Expands * wildcards. Resolves data types. Raises AnalysisException for unknown columns.' },
    { icon:'🧠', label:'Logical Optimization', color:'#8b5cf6', desc:'Predicate pushdown, column pruning, constant folding, filter reordering, subquery elimination — all rule-based rewrites.' },
    { icon:'⚙️', label:'Physical Planning', color:'#f97316', desc:'Selects join strategies (BHJ/SMJ/SHJ), scan methods, aggregate implementations. Cost-based optimization with statistics.' },
    { icon:'🚀', label:'Code Generation', color:'#22c55e', desc:'Whole-stage codegen: fuses operator pipeline into a single JVM method. JIT compiles to native code. 10-100x faster than interpreted execution.' },
  ]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Catalyst Optimizer Phases — click to expand</div>
      <div style={{ display:'flex', gap:4, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
        {phases.map((p,i) => <React.Fragment key={i}>
          <div onClick={() => setExpanded(expanded===i?null:i)} style={{ padding:'8px 12px', borderRadius:8, cursor:'pointer', background: expanded===i?p.color+'22':'var(--surface-1)', border:`1px solid ${expanded===i?p.color:'var(--border)'}`, fontSize:13 }}>{p.icon} {p.label}</div>
          {i<phases.length-1 && <span style={{ color:'var(--text-2)' }}>→</span>}
        </React.Fragment>)}
      </div>
      {expanded!==null && <div style={{ marginTop:12, padding:12, borderRadius:8, background:phases[expanded].color+'11', border:`1px solid ${phases[expanded].color}33`, fontSize:13, color:'var(--text-1)' }}>{phases[expanded].desc}</div>}
    </div>
  )
}

function AQEAnimation() {
  const [feat, setFeat] = useState(0)
  const features = [
    { name:'Skew Join', before:'1 task = 80% of data', after:'Split into 4 sub-tasks evenly', metric:'Partitions: 1 → 4', color:'#ef4444' },
    { name:'Coalescing', before:'500 shuffle partitions (many tiny)', after:'Coalesced to 80 meaningful partitions', metric:'Partitions: 500 → 80', color:'#3b82f6' },
    { name:'Join Strategy Switch', before:'Sort-Merge Join planned (large tables)', after:'Switched to Broadcast Join (one side was small)', metric:'No shuffle on small side', color:'#22c55e' },
  ]
  const f = features[feat]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>AQE Runtime Optimizations</div>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {features.map((fe,i) => <button key={i} onClick={() => setFeat(i)} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid var(--border)', background: feat===i?fe.color:'var(--surface-1)', color: feat===i?'#fff':'var(--text-1)', cursor:'pointer', fontSize:13 }}>{fe.name}</button>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <div style={{ background:'#fee2e2', borderRadius:8, padding:'10px 12px' }}>
          <div style={{ fontSize:11, color:'#dc2626', fontWeight:600, marginBottom:4 }}>BEFORE (Planned)</div>
          <div style={{ fontSize:13 }}>{f.before}</div>
        </div>
        <div style={{ background:'#dcfce7', borderRadius:8, padding:'10px 12px' }}>
          <div style={{ fontSize:11, color:'#16a34a', fontWeight:600, marginBottom:4 }}>AFTER (AQE Applied)</div>
          <div style={{ fontSize:13 }}>{f.after}</div>
        </div>
      </div>
      <div style={{ marginTop:10, fontSize:13, color:f.color, fontWeight:600 }}>→ {f.metric}</div>
    </div>
  )
}

function TungstenAnimation() {
  const features = [
    { icon:'💾', title:'Off-Heap Binary (UnsafeRow)', metric:'~5x less memory vs Java objects', desc:'Compact binary layout; no GC pressure; binary IS the wire format for shuffles', color:'#3b82f6' },
    { icon:'📦', title:'Cache-Aware Algorithms', metric:'~3x fewer cache misses', desc:'Sequential memory access; hash tables fit in CPU L2/L3 cache; sort-based aggregation', color:'#8b5cf6' },
    { icon:'⚡', title:'Whole-Stage Code Generation', metric:'~10x faster operator fusion', desc:'Fuses filter+project+join into one JIT-compiled method; eliminates virtual dispatch', color:'#22c55e' },
  ]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Tungsten Engine — 3 Pillars</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {features.map(f => (
          <div key={f.title} style={{ background:'var(--surface-1)', borderRadius:10, padding:12, border:`1px solid ${f.color}33` }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{f.icon}</div>
            <div style={{ fontWeight:600, fontSize:13, color:f.color, marginBottom:4 }}>{f.title}</div>
            <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:6 }}>{f.metric}</div>
            <div style={{ fontSize:11, color:'var(--text-2)' }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfigAnimation() {
  const [mem, setMem] = useState(8)
  const [cores, setCores] = useState(4)
  const [shuffle, setShuffle] = useState(200)
  const parallelism = cores * 2
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Interactive Config — tune and see impact</div>
      <div style={{ display:'grid', gap:10, marginBottom:14 }}>
        {[
          {label:'executor.memory (GB)', val:mem, set:setMem, min:2, max:64, note:`Spark memory pool ≈ ${Math.round(mem*0.6*10)/10}g`},
          {label:'executor.cores', val:cores, set:setCores, min:1, max:16, note:`Threads per executor`},
          {label:'sql.shuffle.partitions', val:shuffle, set:setShuffle, min:10, max:2000, note: shuffle<100?'⚠️ May be too few for large joins':shuffle>500?'⚠️ May cause overhead':'✅ Reasonable'},
        ].map(c => (
          <div key={c.label}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span style={{ color:'var(--text-2)' }}>{c.label}</span><strong style={{ color:'var(--text-1)' }}>{c.val}</strong></div>
            <input type="range" min={c.min} max={c.max} value={c.val} onChange={e => c.set(Number(e.target.value))} style={{ width:'100%' }}/>
            <div style={{ fontSize:11, color:'var(--text-2)' }}>{c.note}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:12, borderRadius:8, background:'var(--surface-1)', fontSize:13 }}>
        <strong>Cluster Summary:</strong> Memory {mem}g × Cores {cores} | Parallelism target {parallelism} | Shuffle partitions {shuffle}
      </div>
    </div>
  )
}

function DeltaAnimation() {
  const [mode, setMode] = useState<'acid'|'timetravel'>('acid')
  const [version, setVersion] = useState(0)
  const ttData = [{rows:1000,desc:'Initial load'},{rows:1050,desc:'Appended 50 rows'},{rows:980,desc:'Deleted 70 rows'}]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Delta Lake — ACID &amp; Time Travel</div>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {(['acid','timetravel'] as const).map(m => <button key={m} onClick={() => setMode(m)} style={{ padding:'6px 14px', borderRadius:6, border:'1px solid var(--border)', background: mode===m?'#f97316':'var(--surface-1)', color: mode===m?'#fff':'var(--text-1)', cursor:'pointer' }}>{m==='acid'?'ACID Transactions':'Time Travel'}</button>)}
      </div>
      {mode==='acid' ? (
        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          {['Writer begins','Data written','Transaction log updated','Readers see consistent snapshot'].map((s,i) => <React.Fragment key={i}>
            <div style={{ padding:'6px 10px', borderRadius:6, background:'#fff7ed', border:'1px solid #fed7aa', fontSize:12 }}>{s}</div>
            {i<3 && <span style={{ color:'#f97316' }}>→</span>}
          </React.Fragment>)}
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            {ttData.map((_,i) => <button key={i} onClick={() => setVersion(i)} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid var(--border)', background: version===i?'#3b82f6':'var(--surface-1)', color: version===i?'#fff':'var(--text-1)', cursor:'pointer' }}>v{i}</button>)}
          </div>
          <div style={{ padding:12, borderRadius:8, background:'#eff6ff', border:'1px solid #bfdbfe', fontSize:13 }}>
            <strong>Version {version}:</strong> {ttData[version].desc} — {ttData[version].rows.toLocaleString()} rows
          </div>
        </div>
      )}
    </div>
  )
}

function KafkaArchAnimation() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(x => (x+1)%8), 800)
    return () => clearInterval(t)
  }, [])
  const partitions = [0,1,2,3]
  const brokers = ['B1','B2','B3']
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Kafka Architecture — Brokers, Partitions &amp; Replication</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div>
          <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:8 }}>Topic Partitions</div>
          {partitions.map(p => (
            <div key={p} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <div style={{ fontSize:12, color:'var(--text-2)', width:24 }}>P{p}</div>
              <div style={{ flex:1, height:18, background:'var(--surface-1)', borderRadius:4, overflow:'hidden', position:'relative' }}>
                {[0,1,2,3,4].map(i => <div key={i} style={{ position:'absolute', left:`${(i*20)}%`, top:2, width:16, height:14, borderRadius:3, background: (tick+p+i)%4===0?'#f97316':'#3b82f633', transition:'background 0.3s' }}/>)}
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:8 }}>Replication (RF=2)</div>
          {brokers.map(b => (
            <div key={b} style={{ padding:'6px 10px', borderRadius:6, background:'var(--surface-1)', border:'1px solid var(--border)', marginBottom:6, fontSize:12 }}>
              {b}: {partitions.filter(p => (p+brokers.indexOf(b))%3<2).map(p => `P${p}`).join(', ')}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KafkaPythonAnimation() {
  const [mode, setMode] = useState<'producer'|'consumer'>('producer')
  const [step, setStep] = useState(0)
  const prodSteps = [['Message created','{key:"user_1", value:{...}}'],['Key hashed → partition','hash("user_1") % 4 → P2'],['Sent to broker leader','Broker 1 leader for P2'],['ack received','offset=142 committed']]
  const consSteps = [['Join consumer group','group.id="analytics-cg"'],['Partitions assigned','P0,P1 → Consumer A | P2,P3 → Consumer B'],['Poll for messages','consumer.poll(timeout=1.0)'],['Commit offset','consumer.commit() at offset 143']]
  const steps = mode==='producer' ? prodSteps : consSteps
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Kafka Python API Flow</div>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {(['producer','consumer'] as const).map(m => <button key={m} onClick={() => { setMode(m); setStep(0) }} style={{ padding:'6px 14px', borderRadius:6, border:'1px solid var(--border)', background: mode===m?'#8b5cf6':'var(--surface-1)', color: mode===m?'#fff':'var(--text-1)', cursor:'pointer' }}>{m==='producer'?'Producer':'Consumer'}</button>)}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {steps.map(([label, detail], i) => (
          <div key={i} style={{ padding:'8px 12px', borderRadius:8, background: step>=i?'#f5f3ff':'var(--surface-1)', border:`1px solid ${step>=i?'#8b5cf6':'var(--border)'}`, opacity: step>=i?1:0.5, transition:'all 0.3s', fontSize:13 }}>
            <strong>{i+1}. {label}</strong><br/><code style={{ fontSize:11, color:'var(--text-2)' }}>{detail}</code>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <button onClick={() => setStep(s => Math.min(s+1, steps.length-1))} style={{ padding:'6px 12px', borderRadius:6, background:'#8b5cf6', color:'#fff', border:'none', cursor:'pointer', fontSize:13 }}>Next →</button>
        <button onClick={() => setStep(0)} style={{ padding:'6px 12px', borderRadius:6, background:'var(--surface-1)', color:'var(--text-1)', border:'1px solid var(--border)', cursor:'pointer', fontSize:13 }}>Reset</button>
      </div>
    </div>
  )
}

function KafkaEOSAnimation() {
  const [sel, setSel] = useState(0)
  const modes = [
    { name:'At-Most-Once', guarantee:'May lose messages', duplicates:'None', useCase:'Metrics, logs where loss is OK', color:'#ef4444', icon:'📉' },
    { name:'At-Least-Once', guarantee:'No loss, duplicates possible', duplicates:'Yes — on retry', useCase:'Most default configs; needs idempotent sink', color:'#f97316', icon:'🔄' },
    { name:'Exactly-Once', guarantee:'No loss, no duplicates', duplicates:'None', useCase:'Financial transactions, billing', color:'#22c55e', icon:'✅' },
  ]
  const m = modes[sel]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Delivery Guarantees</div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
        {modes.map((md,i) => <button key={i} onClick={() => setSel(i)} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid var(--border)', background: sel===i?md.color:'var(--surface-1)', color: sel===i?'#fff':'var(--text-1)', cursor:'pointer', fontSize:13 }}>{md.name}</button>)}
      </div>
      <div style={{ padding:14, borderRadius:10, background:`${m.color}11`, border:`1px solid ${m.color}33` }}>
        <div style={{ fontSize:28, marginBottom:8 }}>{m.icon}</div>
        {[['Guarantee',m.guarantee],['Duplicates',m.duplicates],['Use Case',m.useCase]].map(([k,v]) => (
          <div key={k} style={{ marginBottom:4, fontSize:13 }}><span style={{ color:'var(--text-2)' }}>{k}: </span><strong style={{ color:'var(--text-1)' }}>{v}</strong></div>
        ))}
      </div>
    </div>
  )
}

function KafkaConnectAnimation() {
  const [dir, setDir] = useState<'source'|'sink'>('source')
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Kafka Connect — Source &amp; Sink</div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {(['source','sink'] as const).map(d => <button key={d} onClick={() => setDir(d)} style={{ padding:'6px 14px', borderRadius:6, border:'1px solid var(--border)', background: dir===d?'#06b6d4':'var(--surface-1)', color: dir===d?'#fff':'var(--text-1)', cursor:'pointer' }}>{d==='source'?'Source Connector':'Sink Connector'}</button>)}
      </div>
      {dir==='source' ? (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            {['PostgreSQL WAL','Debezium CDC','Kafka Connect Worker','Kafka Topic (ecommerce.orders)'].map((s,i,arr) => <React.Fragment key={i}>
              <div style={{ padding:'8px 12px', borderRadius:8, background:'#ecfeff', border:'1px solid #a5f3fc', fontSize:12 }}>{s}</div>
              {i<arr.length-1 && <span style={{ color:'#06b6d4', fontSize:16 }}>→</span>}
            </React.Fragment>)}
          </div>
          <div style={{ marginTop:8, fontSize:12, color:'var(--text-2)' }}>CDC event: INSERT/UPDATE/DELETE → Avro envelope with before/after fields</div>
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            {['Kafka Topic','Kafka Connect Worker','ADLS / Snowflake / Elasticsearch'].map((s,i,arr) => <React.Fragment key={i}>
              <div style={{ padding:'8px 12px', borderRadius:8, background:'#fdf4ff', border:'1px solid #e9d5ff', fontSize:12 }}>{s}</div>
              {i<arr.length-1 && <span style={{ color:'#8b5cf6', fontSize:16 }}>→</span>}
            </React.Fragment>)}
          </div>
          <div style={{ marginTop:8, fontSize:12, color:'var(--text-2)' }}>Sink handles offset commits; DLQ captures failed records</div>
        </div>
      )}
    </div>
  )
}

function SchemaRegistryAnimation() {
  const [step, setStep] = useState(0)
  const [compat, setCompat] = useState(0)
  const steps = [
    { label:'Producer registers schema', detail:'POST /subjects/orders-value → schema_id=42', icon:'📤' },
    { label:'Serialize with schema ID', detail:'[0x00][schema_id=42][avro_bytes...]', icon:'🔧' },
    { label:'Message sent to Kafka', detail:'Topic: orders | Partition: 1 | Offset: 99', icon:'📨' },
    { label:'Consumer fetches schema', detail:'GET /schemas/ids/42 → returns Avro schema', icon:'📥' },
    { label:'Deserialize message', detail:'schema_id=42 → parse Avro bytes → Python dict', icon:'✅' },
  ]
  const compats = [
    { name:'BACKWARD', desc:'New schema reads old data. Add optional fields only.', color:'#22c55e' },
    { name:'FORWARD',  desc:'Old schema reads new data. Remove fields only.', color:'#3b82f6' },
    { name:'FULL',     desc:'Both directions. Most restrictive — only add/remove optional fields.', color:'#8b5cf6' },
  ]
  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, color:'var(--text-1)' }}>Schema Registry Flow</div>
      <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
        {steps.map((s,i) => (
          <div key={i} onClick={() => setStep(i)} style={{ padding:'7px 12px', borderRadius:8, cursor:'pointer', background: step===i?'#eff6ff':'var(--surface-1)', border:`1px solid ${step===i?'#3b82f6':'var(--border)'}`, fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
            <span>{s.icon}</span><div><strong>{s.label}</strong><br/><code style={{ fontSize:11, color:'var(--text-2)' }}>{s.detail}</code></div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:6 }}>Compatibility Mode:</div>
      <div style={{ display:'flex', gap:6 }}>
        {compats.map((c,i) => <button key={i} onClick={() => setCompat(i)} style={{ padding:'5px 10px', borderRadius:6, border:'1px solid var(--border)', background: compat===i?c.color:'var(--surface-1)', color: compat===i?'#fff':'var(--text-1)', cursor:'pointer', fontSize:12 }}>{c.name}</button>)}
      </div>
      {<div style={{ marginTop:8, fontSize:12, color:compats[compat].color }}>{compats[compat].desc}</div>}
    </div>
  )
}

function KafkaVsEventHubAnimation() {
  const [sel, setSel] = useState<string|null>(null)
  const rows = [
    {feature:'Protocol',kafka:'Native Kafka protocol',hub:'Kafka-compatible (no code change!)'},
    {feature:'Partitions',kafka:'1–thousands',hub:'1–32 (Standard), 1–100 (Premium)'},
    {feature:'Retention',kafka:'Configurable (forever)',hub:'1–90 days (Standard)'},
    {feature:'Consumer groups',kafka:'Unlimited',hub:'Limited per tier'},
    {feature:'Schema Registry',kafka:'Confluent Schema Registry',hub:'Event Hub Schema Registry'},
    {feature:'Cost model',kafka:'Self-managed or Confluent',hub:'Throughput Units (pay-as-go)'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Kafka vs Azure Event Hub — Feature Comparison</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.78rem'}}>
          <thead><tr>{['Feature','Kafka','Event Hub'].map(h=><th key={h} style={{padding:'7px 10px',background:'#1e293b',color:'white',textAlign:'left',fontWeight:700}}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r,i)=>(
            <tr key={r.feature} onClick={()=>setSel(sel===r.feature?null:r.feature)} style={{background:sel===r.feature?'#eff6ff':i%2===0?'white':'#f8fafc',cursor:'pointer',transition:'background .2s'}}>
              <td style={{padding:'6px 10px',fontWeight:700,color:'#4f8ef7',borderBottom:'1px solid var(--border)'}}>{r.feature}</td>
              <td style={{padding:'6px 10px',borderBottom:'1px solid var(--border)',fontFamily:'monospace'}}>{r.kafka}</td>
              <td style={{padding:'6px 10px',borderBottom:'1px solid var(--border)',fontFamily:'monospace'}}>{r.hub}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

function SparkArchAnimation() {
  return (
    <svg viewBox="0 0 700 200" className="anim-wrap" style={{ display:'block', width: '100%', maxWidth:700, maxHeight: 200, borderRadius: 'var(--radius-xl)', background: '#fff7ed', border: '1px solid #fed7aa', marginBottom: 24 }}>
      {/* Driver box */}
      <rect x="20" y="30" width="130" height="140" rx="10" fill="white" stroke="#f97316" strokeWidth="2"/>
      <text x="85" y="52" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="700">DRIVER</text>
      <rect x="30" y="58" width="110" height="20" rx="4" fill="#fff7ed"/>
      <text x="85" y="72" textAnchor="middle" fill="#78716c" fontSize="8">SparkSession</text>
      <rect x="30" y="82" width="110" height="20" rx="4" fill="#fff7ed"/>
      <text x="85" y="96" textAnchor="middle" fill="#78716c" fontSize="8">DAG Scheduler</text>
      <rect x="30" y="106" width="110" height="20" rx="4" fill="#fff7ed"/>
      <text x="85" y="120" textAnchor="middle" fill="#78716c" fontSize="8">Task Scheduler</text>
      <rect x="30" y="130" width="110" height="20" rx="4" fill="#fff7ed"/>
      <text x="85" y="144" textAnchor="middle" fill="#78716c" fontSize="8">Block Manager</text>

      {/* Arrow: Driver → Cluster Manager */}
      <line x1="150" y1="100" x2="240" y2="100" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="5 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.2s" repeatCount="indefinite"/>
      </line>
      <text x="193" y="93" textAnchor="middle" fill="#8b5cf6" fontSize="8">resources</text>

      {/* Cluster Manager */}
      <rect x="240" y="65" width="140" height="70" rx="10" fill="white" stroke="#8b5cf6" strokeWidth="2"/>
      <text x="310" y="88" textAnchor="middle" fill="#8b5cf6" fontSize="11" fontWeight="700">CLUSTER MGR</text>
      <text x="310" y="105" textAnchor="middle" fill="#78716c" fontSize="8">YARN / K8s / Standalone</text>
      <text x="310" y="120" textAnchor="middle" fill="#78716c" fontSize="8">Allocates Containers</text>

      {/* Arrow: Cluster Manager → Executors */}
      <line x1="380" y1="100" x2="460" y2="60" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite"/>
      </line>
      <line x1="380" y1="100" x2="460" y2="100" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.1s" repeatCount="indefinite"/>
      </line>
      <line x1="380" y1="100" x2="460" y2="140" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.2s" repeatCount="indefinite"/>
      </line>

      {/* Executors */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={460} y={30 + i * 55} width={210} height={45} rx="8" fill="white" stroke="#22c55e" strokeWidth="1.5"/>
          <text x={565} y={48 + i * 55} textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">Executor {i + 1}  (Worker Node)</text>
          <rect x={468} y={54 + i * 55} width={45} height={14} rx="3" fill="#f0fdf4"/>
          <text x={491} y={64 + i * 55} textAnchor="middle" fill="#16a34a" fontSize="7">Task Slot</text>
          <rect x={518} y={54 + i * 55} width={45} height={14} rx="3" fill="#f0fdf4"/>
          <text x={541} y={64 + i * 55} textAnchor="middle" fill="#16a34a" fontSize="7">Task Slot</text>
          <rect x={568} y={54 + i * 55} width={45} height={14} rx="3" fill="#fef9c3"/>
          <text x={591} y={64 + i * 55} textAnchor="middle" fill="#ca8a04" fontSize="7">Block Cache</text>
        </g>
      ))}
    </svg>
  )
}

function DagAnimation() {
  return (
    <svg viewBox="0 0 680 160" className="anim-wrap" style={{ display:'block', width: '100%', maxWidth:700, maxHeight: 160, borderRadius: 'var(--radius-xl)', background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: 24 }}>
      {/* Stage 0 */}
      <rect x="10" y="10" width="150" height="140" rx="8" fill="white" stroke="#38bdf8" strokeWidth="1.5"/>
      <text x="85" y="28" textAnchor="middle" fill="#0284c7" fontSize="9" fontWeight="700">STAGE 0 (narrow)</text>
      {['Read Parquet','filter(amount>0)','withColumn(tax)','select(cols)'].map((t, i) => (
        <g key={i}>
          <rect x="20" y={35 + i * 28} width="130" height="20" rx="4" fill="#e0f2fe"/>
          <text x="85" y={49 + i * 28} textAnchor="middle" fill="#0369a1" fontSize="8">{t}</text>
        </g>
      ))}

      {/* Shuffle boundary arrow */}
      <line x1="160" y1="80" x2="205" y2="80" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
      </line>
      <rect x="162" y="60" width="44" height="16" rx="4" fill="#fef3c7"/>
      <text x="184" y="71" textAnchor="middle" fill="#92400e" fontSize="7" fontWeight="700">SHUFFLE</text>

      {/* Stage 1 */}
      <rect x="205" y="10" width="150" height="140" rx="8" fill="white" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="280" y="28" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="700">STAGE 1 (wide)</text>
      {['groupBy(merchant)','sum(amount)','count(*)','avg(amount)'].map((t, i) => (
        <g key={i}>
          <rect x="215" y={35 + i * 28} width="130" height="20" rx="4" fill="#fef9c3"/>
          <text x="280" y={49 + i * 28} textAnchor="middle" fill="#92400e" fontSize="8">{t}</text>
        </g>
      ))}

      {/* Shuffle boundary arrow 2 */}
      <line x1="355" y1="80" x2="400" y2="80" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.1s" repeatCount="indefinite"/>
      </line>
      <rect x="357" y="60" width="44" height="16" rx="4" fill="#fef3c7"/>
      <text x="379" y="71" textAnchor="middle" fill="#92400e" fontSize="7" fontWeight="700">SHUFFLE</text>

      {/* Stage 2 */}
      <rect x="400" y="10" width="150" height="140" rx="8" fill="white" stroke="#a78bfa" strokeWidth="1.5"/>
      <text x="475" y="28" textAnchor="middle" fill="#7c3aed" fontSize="9" fontWeight="700">STAGE 2 (join)</text>
      {['join(dim_merchant)','withColumn(rank)','orderBy(total)','limit(100)'].map((t, i) => (
        <g key={i}>
          <rect x="410" y={35 + i * 28} width="130" height="20" rx="4" fill="#f5f3ff"/>
          <text x="475" y={49 + i * 28} textAnchor="middle" fill="#6d28d9" fontSize="8">{t}</text>
        </g>
      ))}

      {/* Write arrow */}
      <line x1="550" y1="80" x2="590" y2="80" stroke="#22c55e" strokeWidth="2">
        <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="0.8s" repeatCount="indefinite"/>
      </line>
      <rect x="590" y="55" width="80" height="50" rx="8" fill="white" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="630" y="75" textAnchor="middle" fill="#15803d" fontSize="9" fontWeight="700">ACTION</text>
      <text x="630" y="90" textAnchor="middle" fill="#15803d" fontSize="8">write()</text>
      <text x="630" y="103" textAnchor="middle" fill="#78716c" fontSize="7">Triggers DAG</text>
    </svg>
  )
}

function ShuffleAnimation() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 60), 60)
    return () => clearInterval(id)
  }, [])

  const progress = (tick % 60) / 60
  const colors = ['#f97316', '#3b82f6', '#22c55e', '#a855f7']

  return (
    <svg viewBox="0 0 600 160" className="anim-wrap" style={{ display:'block', width: '100%', maxWidth:700, maxHeight: 160, borderRadius: 'var(--radius-xl)', background: '#fafafa', border: '1px solid #e2e8f0', marginBottom: 24 }}>
      <text x="300" y="18" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="700">Shuffle: data moves across partitions by hash(key)</text>

      {/* Source partitions */}
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x={20} y={30 + i * 30} width={100} height={22} rx="5" fill={colors[i]} fillOpacity="0.15" stroke={colors[i]} strokeWidth="1.5"/>
          <text x={70} y={45 + i * 30} textAnchor="middle" fill={colors[i]} fontSize="8" fontWeight="600">Partition {i} (pre-shuffle)</text>
        </g>
      ))}

      {/* Animated lines */}
      {[0,1,2,3].flatMap(src => [0,1,2,3].map(dst => {
        const x1 = 120, y1 = 41 + src * 30
        const x2 = 480, y2 = 41 + dst * 30
        const px = x1 + (x2 - x1) * progress
        const py = y1 + (y2 - y1) * progress
        return (
          <g key={`${src}-${dst}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors[src]} strokeWidth="0.5" strokeOpacity="0.2"/>
            <circle cx={px} cy={py} r="3" fill={colors[src]} fillOpacity="0.8"/>
          </g>
        )
      }))}

      {/* Shuffle label */}
      <rect x="255" y="60" width="90" height="40" rx="8" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5"/>
      <text x="300" y="76" textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="700">SHUFFLE</text>
      <text x="300" y="91" textAnchor="middle" fill="#78716c" fontSize="7">hash(key) % N</text>

      {/* Destination partitions */}
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x={480} y={30 + i * 30} width={110} height={22} rx="5" fill={colors[i]} fillOpacity="0.15" stroke={colors[i]} strokeWidth="1.5"/>
          <text x={535} y={45 + i * 30} textAnchor="middle" fill={colors[i]} fontSize="8" fontWeight="600">Partition {i} (post-shuffle)</text>
        </g>
      ))}
    </svg>
  )
}

function SparkUiAnimation() {
  return (
    <svg viewBox="0 0 680 200" className="anim-wrap" style={{ display:'block', width: '100%', maxWidth:700, maxHeight: 200, borderRadius: 'var(--radius-xl)', background: '#1e293b', border: '1px solid #334155', marginBottom: 24 }}>
      {/* Tab bar */}
      <rect x="0" y="0" width="680" height="28" rx="0" fill="#0f172a"/>
      {['Jobs', 'Stages', 'Storage', 'Environment', 'Executors', 'SQL'].map((t, i) => (
        <g key={i}>
          <rect x={8 + i * 80} y="4" width="72" height="20" rx="4" fill={i === 1 ? '#3b82f6' : '#1e293b'} stroke={i === 1 ? '#60a5fa' : '#334155'} strokeWidth="1"/>
          <text x={44 + i * 80} y="18" textAnchor="middle" fill={i === 1 ? 'white' : '#94a3b8'} fontSize="8" fontWeight={i === 1 ? '700' : '400'}>{t}</text>
        </g>
      ))}
      {/* Stage list header */}
      <text x="10" y="46" fill="#94a3b8" fontSize="8" fontWeight="700">STAGE ID</text>
      <text x="80" y="46" fill="#94a3b8" fontSize="8" fontWeight="700">DESCRIPTION</text>
      <text x="280" y="46" fill="#94a3b8" fontSize="8" fontWeight="700">TASKS</text>
      <text x="340" y="46" fill="#94a3b8" fontSize="8" fontWeight="700">INPUT</text>
      <text x="410" y="46" fill="#94a3b8" fontSize="8" fontWeight="700">SHUFFLE READ</text>
      <text x="510" y="46" fill="#94a3b8" fontSize="8" fontWeight="700">SHUFFLE WRITE</text>
      <text x="610" y="46" fill="#94a3b8" fontSize="8" fontWeight="700">DURATION</text>
      <line x1="0" y1="50" x2="680" y2="50" stroke="#334155" strokeWidth="1"/>
      {/* Stage rows */}
      {[
        { id: 2, desc: 'SortMergeJoin → write', tasks: '200/200', input: ' - ', shRead: '45.2 GB', shWrite: ' - ', dur: '8.2 min', color: '#22c55e' },
        { id: 1, desc: 'groupBy(merchant) agg', tasks: '200/200', input: ' - ', shRead: '102 GB', shWrite: '45.2 GB', dur: '12.4 min', color: '#f59e0b' },
        { id: 0, desc: 'scan Parquet + filter', tasks: '832/832', input: '102 GB', shRead: ' - ', shWrite: '102 GB', dur: '4.1 min', color: '#22c55e' },
      ].map((s, i) => (
        <g key={i}>
          <rect x="0" y={55 + i * 44} width="680" height="40" fill={i % 2 === 0 ? '#1e293b' : '#0f172a'}/>
          <circle cx="18" cy={75 + i * 44} r="6" fill={s.color}/>
          <text x="10" y={79 + i * 44} fill={s.color} fontSize="8" fontWeight="700">{s.id}</text>
          <text x="80" y={72 + i * 44} fill="#e2e8f0" fontSize="8">{s.desc}</text>
          <text x="80" y={86 + i * 44} fill="#64748b" fontSize="7">Click to see task timeline</text>
          <text x="280" y={78 + i * 44} fill="#e2e8f0" fontSize="8">{s.tasks}</text>
          <text x="340" y={78 + i * 44} fill="#e2e8f0" fontSize="8">{s.input}</text>
          <text x="410" y={78 + i * 44} fill={s.shRead !== ' - ' ? '#f59e0b' : '#64748b'} fontSize="8">{s.shRead}</text>
          <text x="510" y={78 + i * 44} fill={s.shWrite !== ' - ' ? '#f97316' : '#64748b'} fontSize="8">{s.shWrite}</text>
          <text x="610" y={78 + i * 44} fill="#e2e8f0" fontSize="8">{s.dur}</text>
        </g>
      ))}
    </svg>
  )
}
