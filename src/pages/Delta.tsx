import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 8 - Delta Lake', items: [
    { id: 'delta-intro', label: 'Fundamentals' },
    { id: 'delta-acid', label: 'ACID' },
    { id: 'delta-write-modes', label: 'Write Ops' },
    { id: 'delta-merge', label: 'MERGE' },
    { id: 'delta-schema', label: 'Schema Evolution' },
    { id: 'delta-time-travel', label: 'Time Travel' },
    { id: 'delta-cdf', label: 'Change Data Feed' },
    { id: 'delta-optimize', label: 'OPTIMIZE' },
    { id: 'delta-zorder', label: 'Z-ORDER' },
    { id: 'delta-vacuum', label: 'VACUUM' },
    { id: 'delta-liquid', label: 'Liquid Cluster' },
    { id: 'delta-constraints', label: 'Constraints' },
    { id: 'delta-props', label: 'Properties' },
    { id: 'delta-partitioning', label: 'Partitioning' },
    { id: 'delta-performance', label: 'Performance' },
  ]},
  { title: 'Databricks + Unity Catalog', items: [
    { id: 'databricks-platform', label: 'Platform' },
    { id: 'databricks-uc', label: 'Unity Catalog' },
    { id: 'databricks-uc-permissions', label: 'Permissions' },
    { id: 'databricks-uc-rowcol', label: 'Row & Col Filters' },
    { id: 'databricks-dlt', label: 'DLT' },
    { id: 'databricks-autoloader', label: 'Auto Loader' },
    { id: 'databricks-workflows', label: 'Workflows' },
    { id: 'databricks-dab', label: 'DAB' },
    { id: 'databricks-sql', label: 'DB SQL' },
    { id: 'databricks-sharing', label: 'Delta Sharing' },
  ]},
  { title: 'Table Formats Comparison', items: [
    { id: 'iceberg-intro', label: 'Iceberg Arch' },
    { id: 'iceberg-features', label: 'Iceberg Features' },
    { id: 'hudi-intro', label: 'Apache Hudi' },
    { id: 'format-comparison', label: 'Format Comparison' },
  ]},
]

export default function Delta({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('delta-intro')
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
    const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) }) }, { rootMargin: '-30% 0px -60% 0px' })
    Object.values(sectionRefs.current).forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  const totalTopics = SECTIONS.flatMap(s => s.items).length

  return (
    <div className="page-with-sidebar">
      <Sidebar sections={SECTIONS} activeId={activeId} completed={completed} totalTopics={totalTopics} onItemClick={scrollTo} />
      <main className="main-content">

        {/* ── 1. DELTA INTRO ─────────────────────────────────────────── */}
        <section id="delta-intro" ref={el => { if (el) sectionRefs.current['delta-intro'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Delta Lake Fundamentals</h1>
            <p className="topic-desc">Delta Lake is an open-source storage layer that brings ACID transactions, scalable metadata handling, and unified streaming/batch processing to data lakes. Built on top of Parquet files, Delta adds a transaction log that makes your data lake reliable and queryable.</p>
          </div>
          <DeltaLogAnimation />

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Delta vs Parquet vs Hive:</strong> Raw Parquet has no transaction log  -  concurrent writes corrupt data. Hive Metastore tracks table metadata but not file-level changes. Delta tracks every operation in <code>_delta_log/</code>, enabling rollback, time travel, and optimistic concurrency.</div>
          </div>

          <CodeBlock lang="python">{`# ── Delta Lake: _delta_log/ structure ───────────────────────────────────────
#
# my_table/
# ├── _delta_log/
# │   ├── 00000000000000000000.json   ← initial commit (version 0)
# │   ├── 00000000000000000001.json   ← version 1
# │   ├── 00000000000000000002.json   ← version 2
# │   ├── ...
# │   ├── 00000000000000000010.checkpoint.parquet  ← checkpoint every 10 commits
# │   └── _last_checkpoint             ← pointer to latest checkpoint
# ├── part-00000-abc123.snappy.parquet
# ├── part-00001-def456.snappy.parquet
# └── ...

# ── What a JSON commit file looks like ──────────────────────────────────────
# 00000000000000000001.json (pretty-printed  -  real file is newline-delimited JSON)

{
  "commitInfo": {
    "timestamp": 1700000000000,
    "operation": "WRITE",
    "operationParameters": { "mode": "Append", "partitionBy": "[\"date\"]" },
    "readVersion": 0,
    "isBlindAppend": true,
    "operationMetrics": {
      "numFiles": "2",
      "numOutputRows": "50000",
      "numOutputBytes": "4194304"
    }
  }
}
{
  "add": {
    "path": "date=2024-01-15/part-00000-7f3a1b2c.snappy.parquet",
    "partitionValues": { "date": "2024-01-15" },
    "size": 2097152,
    "modificationTime": 1700000001000,
    "dataChange": true,
    "stats": "{\"numRecords\":25000,\"minValues\":{\"id\":1},\"maxValues\":{\"id\":25000},\"nullCount\":{\"id\":0}}"
  }
}
{
  "add": {
    "path": "date=2024-01-15/part-00001-9d4e5f6a.snappy.parquet",
    "partitionValues": { "date": "2024-01-15" },
    "size": 2097152,
    "modificationTime": 1700000001500,
    "dataChange": true,
    "stats": "{\"numRecords\":25000,\"minValues\":{\"id\":25001},\"maxValues\":{\"id\":50000},\"nullCount\":{\"id\":0}}"
  }
}

# ── Reading Delta metadata programmatically ──────────────────────────────────
from delta.tables import DeltaTable
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("DeltaFundamentals") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog") \
    .getOrCreate()

# Create a Delta table
spark.range(100_000) \
    .withColumnRenamed("id", "user_id") \
    .write \
    .format("delta") \
    .mode("overwrite") \
    .save("/mnt/datalake/bronze/users")

# Inspect the transaction log
dt = DeltaTable.forPath(spark, "/mnt/datalake/bronze/users")

# DESCRIBE HISTORY shows all commits
dt.history().select(
    "version", "timestamp", "operation", "operationParameters", "operationMetrics"
).show(truncate=False)

# Log compaction: every 10 commits Delta writes a Parquet checkpoint
# that encodes the full table state  -  no need to replay all JSON logs
# You can force a checkpoint:
dt.toDF()  # triggers a read; checkpoint is written automatically by Delta engine

# Check current snapshot details
spark.sql("DESCRIBE DETAIL delta.\`/mnt/datalake/bronze/users\`").show(vertical=True)
# Returns: format, id, name, description, location, createdAt,
#          lastModified, partitionColumns, numFiles, sizeInBytes, properties, minReaderVersion, minWriterVersion`}</CodeBlock>

          <Quiz topicId="delta-intro" questions={[
            { question: "Where does Delta Lake store its transaction log?", options: ["In the Hive Metastore only", "In a _delta_log/ directory alongside the Parquet files", "In a separate RDBMS sidecar database", "Embedded inside each Parquet file footer"], correct: 1 },
            { question: "Delta Lake writes a Parquet checkpoint file after how many JSON commit files by default?", options: ["Every 5 commits", "Every 10 commits", "Every 100 commits", "Only on explicit OPTIMIZE"], correct: 1 },
            { question: "What key advantage does Delta Lake provide over raw Parquet on a data lake?", options: ["Columnar compression", "ACID transactions and a transaction log enabling rollback and time travel", "Automatic schema inference", "Faster Parquet encoding"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-intro'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── 2. DELTA ACID ──────────────────────────────────────────────── */}
        <section id="delta-acid" ref={el => { if (el) sectionRefs.current['delta-acid'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">ACID Transactions</h1>
            <p className="topic-desc">Delta Lake provides full ACID guarantees on cloud object stores. Understanding how each property is implemented helps you reason about concurrent workloads, failure modes, and data consistency in production pipelines.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Optimistic Concurrency Control:</strong> Delta uses optimistic locking  -  writers proceed without acquiring locks, then verify at commit time that no conflicting operation occurred. Conflicts are rare in typical pipelines, making this highly efficient at scale.</div>
          </div>

          <CodeBlock lang="python">{`# ── ACID in Delta Lake ────────────────────────────────────────────────────────
#
# A  Atomicity   -  a write either commits all files or none
# C  Consistency  -  schema is enforced; bad writes are rejected entirely
# I  Isolation   -  optimistic concurrency control; readers never see partial writes
# D  Durability   -  committed data is in S3/ADLS/GCS + WAL in _delta_log/

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, current_timestamp
from delta.tables import DeltaTable

spark = SparkSession.builder.appName("DeltaACID").getOrCreate()

# ── ATOMICITY: atomic commits via rename-on-write ────────────────────────────
# Delta writes all Parquet files to a staging location first,
# then atomically adds a single JSON commit to _delta_log/.
# If the job fails mid-write, the JSON commit is never written
# → the partial Parquet files are invisible to readers.

spark.range(1_000_000) \
    .withColumn("event_ts", current_timestamp()) \
    .write.format("delta").mode("append") \
    .save("/mnt/datalake/bronze/events")
# Either ALL 1M rows are visible, or NONE are.

# ── CONSISTENCY: schema enforcement rejects mismatched writes ─────────────────
from pyspark.sql.types import StructType, StructField, StringType, LongType

# Table has schema: id BIGINT, name STRING
events = spark.createDataFrame(
    [(1, "Alice"), (2, "Bob")],
    ["id", "name"]
)
events.write.format("delta").mode("overwrite") \
    .save("/mnt/datalake/bronze/users")

# Attempt to append a DataFrame with an extra column → AnalysisException
bad_df = spark.createDataFrame(
    [(3, "Charlie", "admin")],
    ["id", "name", "role"]    # 'role' column doesn't exist in table
)
try:
    bad_df.write.format("delta").mode("append") \
        .save("/mnt/datalake/bronze/users")
except Exception as e:
    print(f"Blocked by schema enforcement: {e}")
# Output: A schema mismatch detected when writing to the Delta table...

# ── ISOLATION: optimistic concurrency control ─────────────────────────────────
# Writer 1 reads version N, writes files, attempts commit at version N+1
# Writer 2 also read version N, writes files, attempts commit at version N+1
#
# Delta's conflict detection rules:
#   - Two APPEND-only writers: BOTH succeed (isBlindAppend=true)
#   - UPDATE + UPDATE on overlapping files: one retries or fails
#   - INSERT OVERWRITE (partition) + reader: reader gets consistent snapshot

# Simulate concurrent appends (both succeed  -  no conflict)
from concurrent.futures import ThreadPoolExecutor

def append_batch(batch_id):
    spark.range(batch_id * 10_000, (batch_id + 1) * 10_000) \
        .write.format("delta").mode("append") \
        .save("/mnt/datalake/bronze/events")

with ThreadPoolExecutor(max_workers=4) as pool:
    pool.map(append_batch, range(4))
# All 4 appends succeed; no data loss

# ── DURABILITY: WAL + cloud storage guarantee ─────────────────────────────────
# Once the JSON commit file is written to S3/ADLS:
#   - The write is durable even if the Spark driver crashes
#   - Cloud object stores provide 11-nines durability
#   - _delta_log/ acts as a Write-Ahead Log (WAL)

# Verify all versions committed
dt = DeltaTable.forPath(spark, "/mnt/datalake/bronze/events")
dt.history().select("version", "operation", "timestamp").show()

# Check isolation level (Delta supports Serializable and WriteSerializable)
spark.sql("""
  ALTER TABLE delta.\`/mnt/datalake/bronze/events\`
  SET TBLPROPERTIES ('delta.isolationLevel' = 'Serializable')
""")
# Serializable = strongest; WriteSerializable = default (read-your-own-writes)`}</CodeBlock>

          <Quiz topicId="delta-acid" questions={[
            { question: "How does Delta Lake achieve Atomicity on cloud object storage?", options: ["Using distributed locks on S3", "Writing all Parquet files first, then atomically appending a single JSON commit to _delta_log/", "Using two-phase commit across all Parquet files simultaneously", "Wrapping each file write in a database transaction"], correct: 1 },
            { question: "What concurrency control mechanism does Delta Lake use?", options: ["Pessimistic locking (writers acquire exclusive locks)", "Multi-version concurrency control (MVCC) with row-level locks", "Optimistic concurrency control (writers proceed, then validate at commit time)", "Serializable snapshot isolation with row-level locking"], correct: 2 },
            { question: "Two concurrent append-only writers target the same Delta table. What happens?", options: ["Both fail and must retry", "The second writer overwrites the first", "Both succeed because blind appends do not conflict", "Delta serializes them so only one runs at a time"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-acid'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── 3. DELTA WRITE MODES ──────────────────────────────────────── */}
        <section id="delta-write-modes" ref={el => { if (el) sectionRefs.current['delta-write-modes'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Write Operations</h1>
            <p className="topic-desc">Delta Lake supports a rich set of write patterns  -  from simple appends to selective partition overwrites. Choosing the right write mode avoids data duplication, minimises file churn, and keeps downstream consumers consistent.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>replaceWhere is your friend:</strong> Instead of overwriting the whole table to refresh one partition, use <code>replaceWhere</code> to atomically replace only the matching rows  -  all other partitions remain untouched and readable.</div>
          </div>

          <CodeBlock lang="python">{`# ── Delta Write Modes: complete reference ────────────────────────────────────
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, current_date
from delta.tables import DeltaTable

spark = SparkSession.builder.appName("DeltaWrites").getOrCreate()

# ── 1. APPEND ────────────────────────────────────────────────────────────────
# Adds new data without touching existing files.
new_events = spark.read.parquet("/mnt/landing/events/2024-01-16/")

new_events.write \
    .format("delta") \
    .mode("append") \
    .save("/mnt/datalake/silver/events")

# SQL equivalent
spark.sql("""
  INSERT INTO silver.events
  SELECT * FROM parquet.\`/mnt/landing/events/2024-01-16/\`
""")

# ── 2. OVERWRITE (full table replace) ────────────────────────────────────────
# Replaces ALL data in the table. All existing files are logically deleted
# (added as 'remove' actions in the transaction log).
full_refresh = spark.read.parquet("/mnt/landing/dim_customer_full/")

full_refresh.write \
    .format("delta") \
    .mode("overwrite") \
    .save("/mnt/datalake/silver/dim_customer")

# SQL equivalent
spark.sql("""
  INSERT OVERWRITE silver.dim_customer
  SELECT * FROM parquet.\`/mnt/landing/dim_customer_full/\`
""")

# ── 3. replaceWhere (selective partition overwrite) ───────────────────────────
# Only overwrites rows matching the predicate  -  other partitions untouched.
# This is the preferred pattern for incremental loads on partitioned tables.
todays_data = spark.read.parquet("/mnt/landing/events/2024-01-16/") \
    .withColumn("event_date", lit("2024-01-16"))

todays_data.write \
    .format("delta") \
    .mode("overwrite") \
    .option("replaceWhere", "event_date = '2024-01-16'") \
    .save("/mnt/datalake/silver/events")

# replaceWhere with a non-partition column (requires dynamic overwrite)
spark.conf.set("spark.sql.sources.partitionOverwriteMode", "dynamic")
todays_data.write \
    .format("delta") \
    .mode("overwrite") \
    .option("replaceWhere", "event_date >= '2024-01-01' AND event_date <= '2024-01-31'") \
    .save("/mnt/datalake/silver/events")

# ── 4. insertInto ────────────────────────────────────────────────────────────
# Appends to a table registered in the catalog by name.
# Column order must match  -  uses positional binding, NOT name binding.
spark.sql("CREATE DATABASE IF NOT EXISTS silver")
spark.sql("""
  CREATE TABLE IF NOT EXISTS silver.orders (
    order_id    BIGINT,
    customer_id BIGINT,
    amount      DOUBLE,
    order_date  DATE
  ) USING DELTA LOCATION '/mnt/datalake/silver/orders'
""")

new_orders = spark.createDataFrame(
    [(1001, 42, 299.99, "2024-01-16"), (1002, 43, 149.50, "2024-01-16")],
    ["order_id", "customer_id", "amount", "order_date"]
)
new_orders.write.insertInto("silver.orders")

# ── 5. saveAsTable (create or overwrite catalog table) ───────────────────────
df = spark.read.parquet("/mnt/landing/products/")

df.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable("silver.products")
# Creates the table in the Hive Metastore / Unity Catalog if it doesn't exist.

# ── 6. CTAS  -  CREATE TABLE AS SELECT ─────────────────────────────────────────
spark.sql("""
  CREATE TABLE gold.monthly_revenue
  USING DELTA
  PARTITIONED BY (year, month)
  LOCATION '/mnt/datalake/gold/monthly_revenue'
  AS
  SELECT
    YEAR(order_date)  AS year,
    MONTH(order_date) AS month,
    SUM(amount)       AS total_revenue,
    COUNT(*)          AS order_count
  FROM silver.orders
  GROUP BY 1, 2
""")

# ── 7. CREATE OR REPLACE TABLE ───────────────────────────────────────────────
# Atomically replaces table definition AND data in a single transaction.
# Unlike DROP + CREATE, this is safe for concurrent readers.
spark.sql("""
  CREATE OR REPLACE TABLE gold.top_customers
  USING DELTA
  AS
  SELECT
    customer_id,
    SUM(amount) AS lifetime_value,
    COUNT(*)    AS order_count
  FROM silver.orders
  GROUP BY customer_id
  ORDER BY lifetime_value DESC
  LIMIT 1000
""")

# ── Write performance tips ────────────────────────────────────────────────────
# Coalesce before writing to avoid thousands of tiny files
spark.read.parquet("/mnt/landing/raw_logs/") \
    .coalesce(16) \
    .write.format("delta").mode("append") \
    .save("/mnt/datalake/bronze/logs")

# Use partitionBy only when partition columns have low-medium cardinality
new_events.write \
    .format("delta") \
    .mode("append") \
    .partitionBy("event_date", "region") \
    .save("/mnt/datalake/silver/events")`}</CodeBlock>

          <Quiz topicId="delta-write-modes" questions={[
            { question: "You need to refresh only the data for 2024-01-16 in a partitioned Delta table without touching other dates. Which write option should you use?", options: ["mode('overwrite') with no extra options", "mode('append')", "mode('overwrite').option('replaceWhere', \"event_date = '2024-01-16'\")", "DROP PARTITION then INSERT"], correct: 2 },
            { question: "What is the key difference between insertInto() and append mode write()?", options: ["insertInto() uses name-based column binding; append uses positional", "insertInto() uses positional column binding and targets a catalog table by name", "insertInto() can overwrite data; append cannot", "They are functionally identical"], correct: 1 },
            { question: "CREATE OR REPLACE TABLE differs from DROP TABLE + CREATE TABLE because:", options: ["CREATE OR REPLACE is faster", "CREATE OR REPLACE is atomic  -  concurrent readers get a consistent view throughout", "DROP + CREATE preserves the transaction log; CREATE OR REPLACE does not", "They are equivalent in Delta Lake"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-write-modes'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── 4. DELTA MERGE ────────────────────────────────────────────── */}
        <section id="delta-merge" ref={el => { if (el) sectionRefs.current['delta-merge'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">MERGE Deep Dive</h1>
            <p className="topic-desc">MERGE is Delta Lake's most powerful DML operation  -  it upserts, deletes, and inserts in a single atomic pass. Mastering MERGE is essential for CDC ingestion, SCD Type 1/2 patterns, and efficient Silver layer refreshes.</p>
          </div>
          <MergeAnimation />

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>MERGE Performance:</strong> Delta's MERGE scans the target only for files that may match the join condition, using column stats for file skipping. Always include a partition column in the match predicate to enable partition pruning and avoid full-table scans.</div>
          </div>

          <CodeBlock lang="python">{`# ── Delta MERGE: complete reference ──────────────────────────────────────────
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, current_timestamp, lit
from delta.tables import DeltaTable

spark = SparkSession.builder.appName("DeltaMerge").getOrCreate()

# ── 1. Basic upsert (SCD Type 1  -  overwrite on match) ────────────────────────
target = DeltaTable.forName(spark, "silver.customers")

source_df = spark.read.table("bronze.customers_cdc") \
    .filter("_change_type != 'delete'")

target.alias("t").merge(
    source_df.alias("s"),
    "t.customer_id = s.customer_id"
) \
.whenMatchedUpdateAll() \
.whenNotMatchedInsertAll() \
.execute()

# ── 2. Full syntax with multiple WHEN clauses ─────────────────────────────────
# whenMatchedUpdate with condition, whenMatchedDelete, whenNotMatchedInsert,
# whenNotMatchedBySourceUpdate (Delta 2.0+ / DBR 12.1+)

target.alias("t").merge(
    source_df.alias("s"),
    "t.customer_id = s.customer_id"
) \
.whenMatchedUpdate(
    condition="s._change_type = 'update'",
    set={
        "email":      "s.email",
        "phone":      "s.phone",
        "updated_at": "current_timestamp()"
    }
) \
.whenMatchedDelete(
    condition="s._change_type = 'delete'"
) \
.whenNotMatchedInsert(
    condition="s._change_type = 'insert'",
    values={
        "customer_id": "s.customer_id",
        "name":        "s.name",
        "email":       "s.email",
        "phone":       "s.phone",
        "created_at":  "current_timestamp()",
        "updated_at":  "current_timestamp()"
    }
) \
.whenNotMatchedBySourceUpdate(
    # Rows in target with no match in source  -  mark as inactive
    condition="t.is_active = true",
    set={ "is_active": "false", "deactivated_at": "current_timestamp()" }
) \
.execute()

# ── 3. SQL MERGE syntax ───────────────────────────────────────────────────────
spark.sql("""
  MERGE INTO silver.customers AS t
  USING (
    SELECT *
    FROM bronze.customers_cdc
    WHERE event_date = current_date()
  ) AS s
  ON t.customer_id = s.customer_id
  WHEN MATCHED AND s._change_type = 'update' THEN
    UPDATE SET
      t.email      = s.email,
      t.phone      = s.phone,
      t.updated_at = current_timestamp()
  WHEN MATCHED AND s._change_type = 'delete' THEN
    DELETE
  WHEN NOT MATCHED AND s._change_type = 'insert' THEN
    INSERT (customer_id, name, email, phone, created_at, updated_at)
    VALUES (s.customer_id, s.name, s.email, s.phone, current_timestamp(), current_timestamp())
""")

# ── 4. SCD Type 2 with MERGE ──────────────────────────────────────────────────
# Type 2: keep history  -  close old row, insert new row with new effective dates

spark.sql("""
  MERGE INTO silver.dim_customer AS t
  USING (
    -- New/changed records from CDC
    SELECT
      s.customer_id,
      s.name,
      s.email,
      s.address,
      current_date() AS effective_start_date,
      date('9999-12-31') AS effective_end_date,
      true AS is_current
    FROM bronze.customers_cdc s
    JOIN silver.dim_customer  c
      ON s.customer_id = c.customer_id AND c.is_current = true
    WHERE s.email != c.email OR s.address != c.address
    UNION ALL
    -- Truly new customers (no match in target)
    SELECT
      s.customer_id, s.name, s.email, s.address,
      current_date(), date('9999-12-31'), true
    FROM bronze.customers_cdc s
    LEFT ANTI JOIN silver.dim_customer c ON s.customer_id = c.customer_id
  ) AS s
  ON t.customer_id = s.customer_id AND t.is_current = true
  WHEN MATCHED THEN
    -- Close the existing current row
    UPDATE SET
      t.effective_end_date = date_sub(s.effective_start_date, 1),
      t.is_current         = false
  WHEN NOT MATCHED THEN
    -- Insert the new current row
    INSERT *
""")
# Note: this pattern requires two passes or use of foreachBatch in Structured Streaming

# ── 5. Insert-only MERGE (deduplication pattern) ─────────────────────────────
# Efficiently insert only rows that don't already exist  -  avoids duplicates
# without reading the whole target table.

dedup_source = spark.read.table("bronze.raw_events") \
    .filter("event_date = current_date()")

DeltaTable.forName(spark, "silver.events").alias("t").merge(
    dedup_source.alias("s"),
    "t.event_id = s.event_id AND t.event_date = s.event_date"   # partition pruning
) \
.whenNotMatchedInsertAll() \
.execute()

# ── 6. MERGE performance tuning ───────────────────────────────────────────────
# a) Include partition column in the join predicate → partition pruning
# b) Broadcast small source DataFrames
from pyspark.sql.functions import broadcast

small_source = spark.read.table("bronze.dim_updates")  # < 200 MB

DeltaTable.forName(spark, "silver.dim_product").alias("t").merge(
    broadcast(small_source).alias("s"),
    "t.product_id = s.product_id"
) \
.whenMatchedUpdateAll() \
.whenNotMatchedInsertAll() \
.execute()

# c) Low-shuffle merge (Delta 2.1+ / DBR 12.2+)
spark.conf.set("spark.databricks.delta.merge.enableLowShuffle", "true")

# d) Check metrics after MERGE
spark.sql("""
  DESCRIBE HISTORY silver.customers LIMIT 1
""").select("operationMetrics").show(truncate=False)
# numTargetRowsInserted, numTargetRowsUpdated, numTargetRowsDeleted,
# numSourceRows, numTargetFilesAdded, numTargetFilesRemoved`}</CodeBlock>

          <Quiz topicId="delta-merge" questions={[
            { question: "Which MERGE clause handles rows that exist in the target table but have NO match in the source (requires Delta 2.0+ / DBR 12.1+)?", options: ["WHEN NOT MATCHED THEN INSERT", "WHEN MATCHED THEN DELETE", "WHEN NOT MATCHED BY SOURCE THEN UPDATE", "WHEN UNMATCHED THEN UPDATE"], correct: 2 },
            { question: "What is the most important performance tip when writing a MERGE against a large partitioned Delta table?", options: ["Always use broadcast joins on the target", "Include a partition column in the ON join predicate to enable partition pruning", "Set parallelism to 1 to avoid conflicts", "Use mode('overwrite') instead of MERGE for tables over 1 TB"], correct: 1 },
            { question: "In a SCD Type 2 MERGE pattern, what happens to the existing current row when a changed record arrives?", options: ["It is deleted from the table", "It is updated to close the effective_end_date and set is_current = false", "It is left unchanged; only a new row is inserted", "It is moved to an archive table"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-merge'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── 5. DELTA SCHEMA ───────────────────────────────────────────── */}
        <section id="delta-schema" ref={el => { if (el) sectionRefs.current['delta-schema'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Schema Enforcement &amp; Evolution</h1>
            <p className="topic-desc">Delta Lake enforces schema on write by default  -  mismatched columns raise an error before any data lands. Schema evolution options let you safely add columns and adapt to upstream changes without rewriting the entire table.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>mergeSchema vs overwriteSchema:</strong> <code>mergeSchema</code> adds new columns but keeps existing ones intact. <code>overwriteSchema</code> replaces the entire schema  -  use with caution as it rewrites the table definition and may break downstream consumers.</div>
          </div>

          <CodeBlock lang="python">{`# ── Delta Schema: enforcement and evolution ──────────────────────────────────
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, LongType, StringType, DoubleType
from delta.tables import DeltaTable

spark = SparkSession.builder.appName("DeltaSchema").getOrCreate()

# ── 1. Schema enforcement (default) ──────────────────────────────────────────
# Creating the table establishes the authoritative schema
spark.sql("""
  CREATE TABLE IF NOT EXISTS silver.orders (
    order_id    BIGINT    NOT NULL,
    customer_id BIGINT    NOT NULL,
    amount      DOUBLE,
    order_date  DATE
  ) USING DELTA LOCATION '/mnt/datalake/silver/orders'
""")

# Attempting to write a DF with an extra column → AnalysisException
from pyspark.sql.functions import lit, current_timestamp
bad_df = spark.createDataFrame(
    [(9001, 42, 150.0, "2024-01-16", "web")],
    ["order_id", "customer_id", "amount", "order_date", "channel"]  # extra: channel
)
try:
    bad_df.write.format("delta").mode("append").saveAsTable("silver.orders")
except Exception as e:
    print(f"Schema enforcement blocked write: {e}")

# ── 2. mergeSchema  -  add new columns on write ─────────────────────────────────
# Only safe additive changes: new nullable columns at the end of the schema.
df_with_channel = spark.createDataFrame(
    [(9001, 42, 150.0, "2024-01-16", "web"), (9002, 43, 200.0, "2024-01-17", "mobile")],
    ["order_id", "customer_id", "amount", "order_date", "channel"]
)

df_with_channel.write \
    .format("delta") \
    .mode("append") \
    .option("mergeSchema", "true") \
    .saveAsTable("silver.orders")
# Schema is now: order_id, customer_id, amount, order_date, channel (nullable)
# Old rows have NULL for the new 'channel' column

# Equivalent SQL session-level setting
spark.conf.set("spark.databricks.delta.schema.autoMerge.enabled", "true")

# ── 3. overwriteSchema  -  full schema replacement ──────────────────────────────
# Use only for complete reloads where schema changed incompatibly.
completely_new_df = spark.createDataFrame(
    [(9001, 42, 150.0, "2024-01-16", "web", True)],
    ["order_id", "customer_id", "amount", "order_date", "channel", "is_first_order"]
)

completely_new_df.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable("silver.orders")

# ── 4. ALTER TABLE ADD COLUMN ─────────────────────────────────────────────────
spark.sql("ALTER TABLE silver.orders ADD COLUMN discount DOUBLE AFTER amount")
spark.sql("ALTER TABLE silver.orders ADD COLUMNS (promo_code STRING, is_gift BOOLEAN)")

# Add column with a position (DBR 10.4+)
spark.sql("""
  ALTER TABLE silver.orders
  ADD COLUMN loyalty_points INT
  AFTER order_date
""")

# ── 5. ALTER TABLE CHANGE COLUMN ──────────────────────────────────────────────
# Rename a column (requires column mapping mode)
spark.sql("""
  ALTER TABLE silver.orders
  SET TBLPROPERTIES ('delta.columnMapping.mode' = 'name')
""")
spark.sql("ALTER TABLE silver.orders RENAME COLUMN amount TO order_amount")

# Change comment / nullability
spark.sql("""
  ALTER TABLE silver.orders
  ALTER COLUMN order_amount COMMENT 'Total order value in USD before discounts'
""")

# ── 6. Column Mapping Mode ────────────────────────────────────────────────────
# Without column mapping: column names are embedded in Parquet file metadata.
# Rename = rewrite all Parquet files (expensive).
# With 'name' mapping: logical names in Delta log are decoupled from physical names.
# Rename = update only the transaction log (instant, zero file rewrites).

spark.sql("""
  ALTER TABLE silver.orders
  SET TBLPROPERTIES (
    'delta.columnMapping.mode'  = 'name',
    'delta.minReaderVersion'    = '2',
    'delta.minWriterVersion'    = '5'
  )
""")
# After enabling, column renames and drops are metadata-only operations.
spark.sql("ALTER TABLE silver.orders DROP COLUMN promo_code")

# ── 7. Inspect current schema ─────────────────────────────────────────────────
spark.sql("DESCRIBE TABLE silver.orders").show(truncate=False)
spark.sql("DESCRIBE TABLE EXTENDED silver.orders").show(truncate=False)

dt = DeltaTable.forName(spark, "silver.orders")
print(dt.toDF().schema.simpleString())`}</CodeBlock>

          <Quiz topicId="delta-schema" questions={[
            { question: "You want to add a new nullable column 'channel' to an existing Delta table during an append write, without touching existing data. Which option should you use?", options: [".option('overwriteSchema', 'true')", ".option('mergeSchema', 'true')", "ALTER TABLE ADD COLUMN only  -  it cannot be done during a write", "mode('overwrite') automatically merges schemas"], correct: 1 },
            { question: "What must you enable on a Delta table before you can perform a metadata-only column rename (without rewriting Parquet files)?", options: ["delta.enableChangeDataFeed = true", "delta.columnMapping.mode = 'name'", "spark.sql.sources.partitionOverwriteMode = dynamic", "delta.autoOptimize.optimizeWrite = true"], correct: 1 },
            { question: "Schema enforcement in Delta Lake fires at which point?", options: ["When the table is queried (read time)", "When data is written  -  before any files are committed to storage", "Only during OPTIMIZE operations", "Only when explicitly invoked with ANALYZE TABLE"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-schema'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── 6. DELTA TIME TRAVEL ──────────────────────────────────────── */}
        <section id="delta-time-travel" ref={el => { if (el) sectionRefs.current['delta-time-travel'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Time Travel</h1>
            <p className="topic-desc">Delta Lake retains the full history of your table through its transaction log. Time travel lets you query, compare, or restore any previous version  -  invaluable for auditing, debugging bad pipelines, and disaster recovery.</p>
          </div>
          <TimelineAnimation />

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Time Travel vs VACUUM:</strong> Time travel works only for versions whose underlying Parquet files still exist. Once VACUUM removes old files, those versions become unreadable. Default retention is 7 days  -  increase <code>delta.deletedFileRetentionDuration</code> if you need longer audit windows.</div>
          </div>

          <CodeBlock lang="python">{`# ── Delta Time Travel: complete reference ────────────────────────────────────
from pyspark.sql import SparkSession
from delta.tables import DeltaTable

spark = SparkSession.builder.appName("DeltaTimeTravel").getOrCreate()

# ── 1. DESCRIBE HISTORY ───────────────────────────────────────────────────────
spark.sql("""
  DESCRIBE HISTORY silver.orders
""").select(
    "version", "timestamp", "operation",
    "operationParameters", "operationMetrics", "userName"
).show(truncate=False)

# PySpark API
dt = DeltaTable.forName(spark, "silver.orders")
dt.history(20).show(truncate=False)  # last 20 versions

# ── 2. Query by VERSION AS OF ─────────────────────────────────────────────────
# SQL
spark.sql("SELECT COUNT(*) FROM silver.orders VERSION AS OF 0").show()
spark.sql("SELECT COUNT(*) FROM silver.orders VERSION AS OF 5").show()

# PySpark
v0_df = spark.read.format("delta") \
    .option("versionAsOf", 0) \
    .table("silver.orders")

v5_df = spark.read.format("delta") \
    .option("versionAsOf", 5) \
    .table("silver.orders")

# Path-based
v3_df = spark.read.format("delta") \
    .option("versionAsOf", 3) \
    .load("/mnt/datalake/silver/orders")

# ── 3. Query by TIMESTAMP AS OF ───────────────────────────────────────────────
# SQL  -  ISO 8601 or castable string
spark.sql("""
  SELECT *
  FROM silver.orders
  TIMESTAMP AS OF '2024-01-15T10:00:00'
""").show()

spark.sql("""
  SELECT *
  FROM silver.orders
  TIMESTAMP AS OF '2024-01-15'
""").show()

# PySpark
from_ts_df = spark.read.format("delta") \
    .option("timestampAsOf", "2024-01-15 10:00:00") \
    .table("silver.orders")

# ── 4. Diff between versions ──────────────────────────────────────────────────
current_df = spark.read.table("silver.orders")
yesterday_df = spark.read.format("delta") \
    .option("timestampAsOf", "2024-01-15") \
    .table("silver.orders")

# Find orders added since yesterday
new_orders = current_df.join(
    yesterday_df.select("order_id"),
    on="order_id",
    how="left_anti"
)
new_orders.show()

# Find orders that were updated
from pyspark.sql.functions import col
updated_orders = current_df.alias("cur").join(
    yesterday_df.alias("yest"),
    on="order_id"
).filter(col("cur.amount") != col("yest.amount")) \
 .select("order_id", col("yest.amount").alias("old_amount"), col("cur.amount").alias("new_amount"))
updated_orders.show()

# ── 5. RESTORE TABLE ──────────────────────────────────────────────────────────
# Restore to a previous version (creates a new commit  -  history is preserved)
spark.sql("RESTORE TABLE silver.orders TO VERSION AS OF 3")
spark.sql("RESTORE TABLE silver.orders TO TIMESTAMP AS OF '2024-01-14T23:59:59'")

# PySpark DeltaTable API
dt.restoreToVersion(3)
dt.restoreToTimestamp("2024-01-14 23:59:59")

# Verify the restore
dt.history(3).select("version", "operation", "operationParameters").show(truncate=False)

# ── 6. Audit trail use cases ──────────────────────────────────────────────────
# a) Who deleted records?
spark.sql("""
  SELECT version, timestamp, userName, operation, operationParameters
  FROM (DESCRIBE HISTORY silver.orders)
  WHERE operation IN ('DELETE', 'MERGE', 'UPDATE')
  ORDER BY version DESC
""").show(truncate=False)

# b) Reproduce a point-in-time report
spark.sql("""
  SELECT
    YEAR(order_date) AS year,
    MONTH(order_date) AS month,
    SUM(amount) AS total_revenue
  FROM silver.orders TIMESTAMP AS OF '2024-01-01T00:00:00'
  GROUP BY 1, 2
  ORDER BY 1, 2
""").show()

# ── 7. Retention configuration ────────────────────────────────────────────────
spark.sql("""
  ALTER TABLE silver.orders
  SET TBLPROPERTIES (
    'delta.logRetentionDuration'         = 'interval 30 days',
    'delta.deletedFileRetentionDuration' = 'interval 30 days'
  )
""")`}</CodeBlock>

          <Quiz topicId="delta-time-travel" questions={[
            { question: "Which SQL syntax queries a Delta table as it existed at a specific past transaction?", options: ["SELECT * FROM t AT VERSION 5", "SELECT * FROM t VERSION AS OF 5", "SELECT * FROM t SNAPSHOT VERSION = 5", "SELECT * FROM t HISTORY VERSION 5"], correct: 1 },
            { question: "After running RESTORE TABLE silver.orders TO VERSION AS OF 3, what happens to the table history?", options: ["All versions after 3 are permanently deleted", "A new commit is created that reflects version 3 state; prior history is preserved", "The transaction log is rewritten to remove versions 4 and above", "The table is locked until the next OPTIMIZE run"], correct: 1 },
            { question: "Time travel to version 2 fails with 'No file found'. What is the most likely cause?", options: ["VERSION AS OF syntax is incorrect", "VACUUM was run and removed the Parquet files for that version", "The table was not partitioned", "DESCRIBE HISTORY was not run first"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-time-travel'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── 7. DELTA CDF ──────────────────────────────────────────────── */}
        <section id="delta-cdf" ref={el => { if (el) sectionRefs.current['delta-cdf'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Change Data Feed</h1>
            <p className="topic-desc">Change Data Feed (CDF) lets you efficiently read only the rows that changed between two versions of a Delta table  -  inserts, updates, and deletes. This powers incremental propagation patterns from Bronze all the way to Gold without full table scans.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>CDF vs Time Travel:</strong> Time travel gives you the full table state at a version. CDF gives you only the changed rows between versions  -  exactly what downstream consumers need for incremental refreshes. CDF is ideal for propagating Silver updates to Gold aggregations.</div>
          </div>

          <CodeBlock lang="python">{`# ── Delta Change Data Feed (CDF): complete reference ──────────────────────────
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, current_timestamp
from delta.tables import DeltaTable

spark = SparkSession.builder.appName("DeltaCDF").getOrCreate()

# ── 1. Enable CDF on a table ──────────────────────────────────────────────────
# Option A: at table creation
spark.sql("""
  CREATE TABLE IF NOT EXISTS silver.customers (
    customer_id BIGINT,
    name        STRING,
    email       STRING,
    tier        STRING,
    updated_at  TIMESTAMP
  ) USING DELTA
  TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')
  LOCATION '/mnt/datalake/silver/customers'
""")

# Option B: ALTER TABLE on existing table
spark.sql("""
  ALTER TABLE silver.customers
  SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')
""")
# Note: CDF data is only available from the version when CDF was enabled onwards.

# Option C: session-level default for new tables
spark.conf.set("spark.databricks.delta.properties.defaults.enableChangeDataFeed", "true")

# ── 2. Reading CDF changes ────────────────────────────────────────────────────
# By version range
changes_df = spark.read.format("delta") \
    .option("readChangeFeed", "true") \
    .option("startingVersion", 5) \
    .option("endingVersion", 10) \
    .table("silver.customers")

changes_df.show(truncate=False)
# Extra columns added by CDF:
# _change_type : insert | update_preimage | update_postimage | delete
# _commit_version : BIGINT  -  which version this change belongs to
# _commit_timestamp : TIMESTAMP  -  when the commit was made

# By timestamp range
changes_from_ts = spark.read.format("delta") \
    .option("readChangeFeed", "true") \
    .option("startingTimestamp", "2024-01-15 00:00:00") \
    .option("endingTimestamp",   "2024-01-15 23:59:59") \
    .table("silver.customers")

# From a version to latest
incremental_df = spark.read.format("delta") \
    .option("readChangeFeed", "true") \
    .option("startingVersion", 12) \
    .table("silver.customers")

# ── 3. _change_type values ────────────────────────────────────────────────────
# insert            → new row inserted
# update_preimage   → the row's state BEFORE the update
# update_postimage  → the row's state AFTER the update
# delete            → row was deleted

# Filter to only inserts and post-update states (latest values)
latest_changes = changes_df.filter(
    col("_change_type").isin(["insert", "update_postimage"])
)

# Filter deletes only
deletes = changes_df.filter(col("_change_type") == "delete") \
    .select("customer_id", "_commit_timestamp")

# ── 4. Incremental propagation: Silver → Gold ─────────────────────────────────
# Gold table tracks customer tier counts.
# Instead of recomputing the whole Silver table, apply only the changes.

# Step 1: read changes since last checkpoint version
last_processed_version = spark.sql("""
  SELECT COALESCE(MAX(last_version), 0)
  FROM gold.cdf_checkpoints
  WHERE source_table = 'silver.customers'
""").collect()[0][0]

new_changes = spark.read.format("delta") \
    .option("readChangeFeed", "true") \
    .option("startingVersion", last_processed_version + 1) \
    .table("silver.customers")

# Step 2: compute net changes (post-images minus pre-images)
net_inserts = new_changes.filter(col("_change_type") == "insert") \
    .groupBy("tier").count().withColumnRenamed("count", "delta_count")

net_updates_add = new_changes.filter(col("_change_type") == "update_postimage") \
    .groupBy("tier").count().withColumnRenamed("count", "delta_count")

net_updates_sub = new_changes.filter(col("_change_type") == "update_preimage") \
    .groupBy("tier").count().withColumnRenamed("count", "minus_count")

net_deletes = new_changes.filter(col("_change_type") == "delete") \
    .groupBy("tier").count().withColumnRenamed("count", "minus_count")

# Step 3: MERGE incremental deltas into Gold
from delta.tables import DeltaTable
from pyspark.sql.functions import lit

gold = DeltaTable.forName(spark, "gold.tier_summary")
gold.alias("g").merge(
    net_inserts.union(net_updates_add).alias("s"),
    "g.tier = s.tier"
).whenMatchedUpdate(set={"customer_count": "g.customer_count + s.delta_count"}) \
 .whenNotMatchedInsert(values={"tier": "s.tier", "customer_count": "s.delta_count"}) \
 .execute()

# Step 4: save checkpoint
current_version = spark.sql("SELECT MAX(version) FROM (DESCRIBE HISTORY silver.customers)").collect()[0][0]
spark.sql(f"""
  MERGE INTO gold.cdf_checkpoints AS t
  USING (SELECT 'silver.customers' AS source_table, {current_version} AS last_version) AS s
  ON t.source_table = s.source_table
  WHEN MATCHED THEN UPDATE SET t.last_version = s.last_version
  WHEN NOT MATCHED THEN INSERT *
""")

# ── 5. CDF in Structured Streaming ───────────────────────────────────────────
# CDF works as a streaming source  -  new changes flow as micro-batches
cdf_stream = spark.readStream.format("delta") \
    .option("readChangeFeed", "true") \
    .option("startingVersion", 0) \
    .table("silver.customers")

query = cdf_stream \
    .filter(col("_change_type").isin(["insert", "update_postimage"])) \
    .writeStream \
    .format("delta") \
    .option("checkpointLocation", "/mnt/checkpoints/silver_to_gold_customers") \
    .outputMode("append") \
    .table("gold.customers_stream_sink")

query.awaitTermination()`}</CodeBlock>

          <Quiz topicId="delta-cdf" questions={[
            { question: "When a row is updated in a Delta table with CDF enabled, how many CDF records are emitted?", options: ["One record with _change_type = 'update'", "Two records: update_preimage (before state) and update_postimage (after state)", "Three records: delete, insert, and update", "One record per changed column"], correct: 1 },
            { question: "You enable CDF on a Delta table at version 15. What is the earliest version you can read changes from?", options: ["Version 0  -  CDF retroactively covers all history", "Version 14  -  one version before enabling", "Version 15  -  CDF data is only available from when it was enabled", "Version 16  -  the first commit after enabling"], correct: 2 },
            { question: "Which read option starts reading CDF changes from a specific transaction log version?", options: [".option('versionAsOf', N)", ".option('startingVersion', N)", ".option('startFrom', N)", ".option('changeVersion', N)"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-cdf'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── 8. DELTA OPTIMIZE ─────────────────────────────────────────── */}
        <section id="delta-optimize" ref={el => { if (el) sectionRefs.current['delta-optimize'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">OPTIMIZE</h1>
            <p className="topic-desc">Frequent writes  -  especially streaming micro-batches  -  create many small Parquet files that degrade read performance. OPTIMIZE compacts them into larger files through bin-packing, dramatically reducing file-open overhead and improving query speed.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Target file size:</strong> Delta's default target is 1 GB per file after OPTIMIZE (configurable via <code>delta.targetFileSize</code>). Databricks also offers Auto Optimize  -  <code>optimizeWrite</code> and <code>autoCompact</code>  -  which applies OPTIMIZE automatically after each write.</div>
          </div>

          <CodeBlock lang="python">{`# ── Delta OPTIMIZE: bin-packing and auto-optimization ─────────────────────────
from pyspark.sql import SparkSession
from delta.tables import DeltaTable

spark = SparkSession.builder.appName("DeltaOptimize").getOrCreate()

# ── 1. Basic OPTIMIZE ─────────────────────────────────────────────────────────
# Compacts small files into ~1 GB target files using bin-packing.
spark.sql("OPTIMIZE silver.orders")

# Python DeltaTable API
dt = DeltaTable.forName(spark, "silver.orders")
dt.optimize().executeCompaction()

# ── 2. OPTIMIZE with a partition predicate ────────────────────────────────────
# Only compact files in the specified partition(s)  -  much faster for large tables.
spark.sql("""
  OPTIMIZE silver.orders
  WHERE order_date >= '2024-01-01' AND order_date < '2024-02-01'
""")

# Python API
dt.optimize() \
    .where("order_date >= '2024-01-01' AND order_date < '2024-02-01'") \
    .executeCompaction()

# ── 3. Check file statistics before and after ─────────────────────────────────
# Before OPTIMIZE  -  many small files
spark.sql("""
  SELECT
    COUNT(*)                       AS num_files,
    SUM(size) / 1024 / 1024 / 1024 AS total_gb,
    MIN(size) / 1024 / 1024        AS min_file_mb,
    MAX(size) / 1024 / 1024        AS max_file_mb,
    AVG(size) / 1024 / 1024        AS avg_file_mb
  FROM (DESCRIBE DETAIL silver.orders)
  LATERAL VIEW OUTER explode(files) AS f
""").show()

# Post-OPTIMIZE metrics from DESCRIBE HISTORY
spark.sql("""
  SELECT operationMetrics
  FROM (DESCRIBE HISTORY silver.orders LIMIT 1)
""").show(truncate=False)
# operationMetrics contains:
#   numAddedFiles, numRemovedFiles, numAddedBytes,
#   numRemovedBytes, minFileSize, maxFileSize, p50FileSize, p75FileSize, p95FileSize

# ── 4. Target file size configuration ────────────────────────────────────────
# Default: 1073741824 bytes (1 GB)
spark.sql("""
  ALTER TABLE silver.orders
  SET TBLPROPERTIES ('delta.targetFileSize' = '134217728')  -- 128 MB (for streaming tables)
""")

# ── 5. Auto Optimize (Databricks-specific) ────────────────────────────────────
# optimizeWrite: coalesces output files before writing (fewer small files created)
# autoCompact:   runs a background OPTIMIZE after each DML operation

spark.sql("""
  ALTER TABLE silver.orders
  SET TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact'   = 'true'
  )
""")

# Session-level defaults (applies to all new tables in the session)
spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
spark.conf.set("spark.databricks.delta.autoCompact.enabled", "true")

# ── 6. How often to run OPTIMIZE ─────────────────────────────────────────────
# Pattern A: after each batch load (small tables < 100 GB)
#   → run OPTIMIZE with WHERE partition = today
# Pattern B: scheduled job nightly (large tables)
#   → OPTIMIZE on partitions updated in last 24 hours
# Pattern C: use Liquid Clustering (Delta 3.0+) for auto-clustering without OPTIMIZE

# Typical Databricks job schedule
# 1. Run the ETL pipeline
# 2. Run OPTIMIZE on partitions touched
# 3. Run VACUUM to clean up old files

spark.sql("""
  OPTIMIZE silver.events
  WHERE event_date = current_date() - INTERVAL 1 DAY
""")

# ── 7. OPTIMIZE does not block reads or writes ───────────────────────────────
# OPTIMIZE uses optimistic concurrency  -  readers get a consistent snapshot
# while compaction is running. New writes during OPTIMIZE are not blocked.
print("OPTIMIZE is safe to run in production on live tables.")`}</CodeBlock>

          <Quiz topicId="delta-optimize" questions={[
            { question: "What is the default target file size that Delta OPTIMIZE aims to produce?", options: ["128 MB", "512 MB", "1 GB", "2 GB"], correct: 2 },
            { question: "You have a partitioned table with 500 partitions. You only want to OPTIMIZE last month's data. Which syntax achieves this?", options: ["OPTIMIZE silver.orders LIMIT PARTITION order_date = '2024-01'", "OPTIMIZE silver.orders WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31'", "OPTIMIZE silver.orders PARTITION (order_date = '2024-01')", "REBUILD INDEX ON silver.orders WHERE order_date = '2024-01'"], correct: 1 },
            { question: "What does delta.autoOptimize.optimizeWrite do?", options: ["Runs a full OPTIMIZE after every write", "Coalesces output files during the write phase to produce fewer, larger files", "Automatically tunes the targetFileSize based on cluster size", "Replaces VACUUM with automatic file deletion"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-optimize'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── 9. DELTA ZORDER ───────────────────────────────────────────── */}
        <section id="delta-zorder" ref={el => { if (el) sectionRefs.current['delta-zorder'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Z-ORDER Clustering</h1>
            <p className="topic-desc">Z-ORDER co-locates related rows in the same Parquet files based on the values of one or more columns. Combined with Delta's column statistics in the transaction log, this enables aggressive data skipping  -  reading only the files that could contain your query's rows.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Z-ORDER vs Partitioning:</strong> Partitioning physically separates data into directories  -  great for high-selectivity columns like date. Z-ORDER clusters within files  -  ideal for high-cardinality columns like user_id or product_id where partitioning would create millions of tiny directories.</div>
          </div>

          <CodeBlock lang="python">{`# ── Z-ORDER Clustering: multi-dimensional data skipping ──────────────────────
from pyspark.sql import SparkSession
from delta.tables import DeltaTable

spark = SparkSession.builder.appName("DeltaZOrder").getOrCreate()

# ── 1. Basic Z-ORDER ─────────────────────────────────────────────────────────
# Z-ORDER on a single column
spark.sql("OPTIMIZE silver.orders ZORDER BY (customer_id)")

# Z-ORDER on multiple columns (space-filling curve across all columns)
spark.sql("OPTIMIZE silver.orders ZORDER BY (customer_id, order_date)")

# With partition predicate + Z-ORDER
spark.sql("""
  OPTIMIZE silver.orders
  WHERE event_year = 2024
  ZORDER BY (customer_id, product_id)
""")

# Python DeltaTable API
dt = DeltaTable.forName(spark, "silver.orders")
dt.optimize() \
    .where("event_year = 2024") \
    .executeZOrderBy("customer_id", "product_id")

# ── 2. How Z-ORDER works ─────────────────────────────────────────────────────
# During OPTIMIZE, Delta:
# 1. Reads all current data files for the specified predicate
# 2. Sorts rows by a Z-order (Morton curve) of the specified columns
#    → rows with similar (customer_id, product_id) values end up in the same file
# 3. Writes ~1 GB target-size Parquet files with tight column statistics
# 4. Records min/max/nullCount for each column per file in the transaction log

# The transaction log entry for a Z-ORDER'd file looks like:
# {
#   "add": {
#     "path": "part-00000-abc.snappy.parquet",
#     "stats": {
#       "numRecords": 500000,
#       "minValues": { "customer_id": 1001, "product_id": "P-001" },
#       "maxValues": { "customer_id": 2000, "product_id": "P-199" },
#       "nullCount": { "customer_id": 0, "product_id": 0 }
#     }
#   }
# }
# A query for customer_id = 5000 can skip this file entirely.

# ── 3. Data skipping metrics ──────────────────────────────────────────────────
# After running a query, check the Spark UI → SQL tab → scan metrics
# Or use EXPLAIN to see partitions/files pruned

spark.sql("""
  EXPLAIN COST
  SELECT *
  FROM silver.orders
  WHERE customer_id = 12345
    AND order_date >= '2024-01-01'
""")

# Programmatically: check _delta_log stats
import json

log_df = spark.read.json("/mnt/datalake/silver/orders/_delta_log/*.json")
add_df = log_df.select("add.*").filter("path IS NOT NULL")
add_df.select("path", "stats").show(5, truncate=False)

# ── 4. Choosing Z-ORDER columns ───────────────────────────────────────────────
# Good candidates:
#   - Columns frequently used in WHERE / JOIN / GROUP BY
#   - High cardinality (many distinct values)  -  e.g., user_id, session_id
#   - NOT already used as partition columns
#
# Bad candidates:
#   - Low cardinality (e.g., status = 'active'/'inactive')  -  tiny data-skipping benefit
#   - Columns that are never filtered

# Practical example: event log table partitioned by date, Z-ORDERed by user_id
spark.sql("""
  OPTIMIZE silver.events
  WHERE event_date >= current_date() - INTERVAL 30 DAYS
  ZORDER BY (user_id, session_id)
""")
# Queries like: WHERE event_date = '2024-01-15' AND user_id = 999
# First prune partitions by event_date (partition pruning),
# then skip files by user_id range (Z-ORDER data skipping).

# ── 5. Z-ORDER vs partitioning: decision guide ───────────────────────────────
# Use PARTITION BY when:
#   → cardinality is low-medium (< 10,000 distinct values)
#   → queries almost always filter on this column
#   → the column is a date or coarse category

# Use ZORDER BY when:
#   → cardinality is very high (millions of distinct values)
#   → the column appears in SOME but not all queries
#   → partitioning would create too many small directories

# Example: a 10 TB clickstream table
spark.sql("""
  CREATE TABLE IF NOT EXISTS silver.clickstream (
    event_id    BIGINT,
    user_id     BIGINT,
    session_id  STRING,
    url         STRING,
    event_ts    TIMESTAMP,
    event_date  DATE
  ) USING DELTA
  PARTITIONED BY (event_date)               -- low cardinality: ~365 partitions/year
  LOCATION '/mnt/datalake/silver/clickstream'
""")

# Then Z-ORDER within each partition on high-cardinality columns
spark.sql("""
  OPTIMIZE silver.clickstream
  WHERE event_date = current_date() - INTERVAL 1 DAY
  ZORDER BY (user_id, session_id)
""")`}</CodeBlock>

          <Quiz topicId="delta-zorder" questions={[
            { question: "What mechanism allows Delta to skip files during a query on a Z-ORDERed column?", options: ["Bloom filter indexes stored in Parquet footers", "Min/max column statistics per file recorded in the Delta transaction log", "A separate B-tree index table maintained by Databricks", "Hive Metastore partition statistics"], correct: 1 },
            { question: "You have a table partitioned by event_date (365 partitions/year) and need to optimize queries filtering by user_id (50 million distinct users). What should you do?", options: ["Partition by user_id instead of event_date", "Z-ORDER by user_id within each date partition", "Create a separate index table keyed by user_id", "Increase the number of Parquet row groups"], correct: 1 },
            { question: "Z-ORDER clustering is applied during which operation?", options: ["Automatically on every write", "During OPTIMIZE (must be explicitly triggered)", "During VACUUM", "During the first read after a write"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-zorder'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── 10. DELTA VACUUM ──────────────────────────────────────────── */}
        <section id="delta-vacuum" ref={el => { if (el) sectionRefs.current['delta-vacuum'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">VACUUM</h1>
            <p className="topic-desc">Delta Lake accumulates obsolete Parquet files over time  -  files removed by UPDATE, DELETE, MERGE, OPTIMIZE, or overwrites. VACUUM permanently deletes these unreferenced files to reclaim storage. It is safe for concurrent readers because Delta's snapshot isolation guarantees they always see a consistent version.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Retention &amp; Time Travel trade-off:</strong> VACUUM's default retention is 7 days. Files younger than this are never deleted, preserving time travel for that window. Reducing retention below 7 days requires disabling the safety check  -  only do this if you are certain no long-running query or streaming job is reading old snapshots.</div>
          </div>

          <CodeBlock lang="python">{`# ── Delta VACUUM: file cleanup and retention ─────────────────────────────────
from pyspark.sql import SparkSession
from delta.tables import DeltaTable

spark = SparkSession.builder.appName("DeltaVacuum").getOrCreate()

# ── 1. Basic VACUUM ───────────────────────────────────────────────────────────
# Deletes Parquet files NOT referenced by any version in the last 7 days (default).
spark.sql("VACUUM silver.orders")

# Python DeltaTable API
dt = DeltaTable.forName(spark, "silver.orders")
dt.vacuum()          # uses default 168-hour (7-day) retention
dt.vacuum(168)       # explicit 168-hour retention

# ── 2. Dry run  -  see what WOULD be deleted ────────────────────────────────────
spark.sql("VACUUM silver.orders DRY RUN")
# Returns a DataFrame listing all files that would be removed  -  no actual deletion.

dt.vacuum(168, dryRun=True)  # Python equivalent

# ── 3. Custom retention period ───────────────────────────────────────────────
# Increase to 30 days to support longer time travel / audit windows
spark.sql("VACUUM silver.orders RETAIN 720 HOURS")   # 30 days

# Set retention in table properties (permanent default)
spark.sql("""
  ALTER TABLE silver.orders
  SET TBLPROPERTIES ('delta.deletedFileRetentionDuration' = 'interval 30 days')
""")

# ── 4. Lowering retention below 7 days (DANGEROUS) ───────────────────────────
# By default Delta refuses retention < 168 hours. To override:
spark.conf.set("spark.databricks.delta.retentionDurationCheck.enabled", "false")
spark.sql("VACUUM silver.orders RETAIN 24 HOURS")   # risky! only in dev/test
# Re-enable immediately after
spark.conf.set("spark.databricks.delta.retentionDurationCheck.enabled", "true")

# ── 5. What gets deleted ─────────────────────────────────────────────────────
# VACUUM removes:
#   - Parquet data files written by past write operations and later overwritten
#   - Parquet files produced by OPTIMIZE that have been superseded
#   - Files created by failed/aborted write operations
#
# VACUUM does NOT delete:
#   - _delta_log/ transaction log files (managed by logRetentionDuration)
#   - Files referenced by the current table snapshot
#   - Files newer than the retention threshold (even if unreferenced)

# ── 6. Log retention ──────────────────────────────────────────────────────────
# Transaction log JSON/checkpoint files are cleaned up separately.
spark.sql("""
  ALTER TABLE silver.orders
  SET TBLPROPERTIES (
    'delta.logRetentionDuration'         = 'interval 30 days',
    'delta.deletedFileRetentionDuration' = 'interval 30 days'
  )
""")

# ── 7. Concurrent reader safety ───────────────────────────────────────────────
# Q: If a long-running query started 2 hours ago reads a snapshot from version N,
#    and VACUUM removes files that version N references  -  does the query fail?
#
# A: YES  -  if the file has already been deleted by VACUUM.
#    The default 7-day retention window exists precisely to prevent this.
#    For streaming jobs with long checkpoints, ensure VACUUM retention >=
#    the maximum lag of any consumer.

# Best practice: check for long-running queries before VACUUM
spark.sql("""
  SELECT processId, userName, statement, startTime,
         DATEDIFF(NOW(), startTime) AS running_days
  FROM system.access.queries
  WHERE status = 'RUNNING'
    AND DATEDIFF(NOW(), startTime) > 1
  ORDER BY running_days DESC
""")

# ── 8. Automate VACUUM in a Databricks Job ────────────────────────────────────
# Notebook cell  -  runs nightly after ETL + OPTIMIZE
tables_to_vacuum = [
    "silver.orders",
    "silver.customers",
    "silver.events",
    "gold.monthly_revenue",
]

for table in tables_to_vacuum:
    print(f"Vacuuming {table}...")
    spark.sql(f"VACUUM {table} RETAIN 168 HOURS")
    print(f"  Done.")

# ── 9. Impact on time travel ──────────────────────────────────────────────────
# Before VACUUM: can time-travel to any version in the last 7 days
spark.sql("SELECT COUNT(*) FROM silver.orders VERSION AS OF 5").show()  # works

# After VACUUM (if version 5's files were older than retention):
try:
    spark.sql("SELECT COUNT(*) FROM silver.orders VERSION AS OF 5").show()
except Exception as e:
    print(f"Time travel unavailable: {e}")
# Error: No file found for path ... It may have been deleted by VACUUM.`}</CodeBlock>

          <Quiz topicId="delta-vacuum" questions={[
            { question: "What is Delta Lake's default retention period for VACUUM?", options: ["24 hours", "72 hours", "168 hours (7 days)", "30 days"], correct: 2 },
            { question: "You run VACUUM silver.orders DRY RUN. What happens?", options: ["Files are deleted and a report is returned", "A list of files that WOULD be deleted is returned, but nothing is deleted", "OPTIMIZE is run first, then files are listed", "The transaction log is compacted"], correct: 1 },
            { question: "Which Spark configuration must you disable to allow VACUUM with a retention period shorter than 7 days?", options: ["spark.databricks.delta.timeTravel.enabled", "spark.databricks.delta.retentionDurationCheck.enabled", "spark.sql.delta.vacuumProtection.enabled", "delta.deletedFileRetentionDuration"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-vacuum'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="delta-liquid" ref={el => { if (el) sectionRefs.current['delta-liquid'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Liquid Clustering</h1>
            <p className="topic-desc">Liquid Clustering is the next-generation replacement for Hive-style partitioning and Z-ORDER. It uses flexible, incremental clustering without rewriting the entire table. Available in Databricks Runtime 13.3+.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Why Liquid?</strong> Traditional partitioning requires knowing cardinality upfront and can cause small-file problems. Z-ORDER rewrites all files. Liquid Clustering clusters incrementally  -  only new/changed files are clustered when you run OPTIMIZE.
            </div>
          </div>
          <CodeBlock lang="sql">{`-- Create a table with Liquid Clustering
CREATE TABLE production.silver.events (
  event_id     BIGINT NOT NULL,
  user_id      BIGINT,
  event_type   STRING,
  event_date   DATE,
  region       STRING,
  amount       DECIMAL(18,2),
  created_at   TIMESTAMP
)
USING DELTA
CLUSTER BY (user_id, event_date)   -- multi-column clustering key
LOCATION 'abfss://silver@myaccount.dfs.core.windows.net/events';

-- Incrementally cluster only new/changed files (run on a schedule)
OPTIMIZE production.silver.events;
-- Liquid OPTIMIZE only rewrites unclustered files  -  much cheaper than Z-ORDER OPTIMIZE

-- Change the clustering key without rewriting (metadata-only change)
ALTER TABLE production.silver.events CLUSTER BY (region, event_date);

-- Remove clustering entirely
ALTER TABLE production.silver.events CLUSTER BY NONE;

-- Check clustering info
DESCRIBE TABLE EXTENDED production.silver.events;
-- Look for: clusteringColumns, numClusteredFiles, numUnclusteredFiles

-- Python API
from delta.tables import DeltaTable
dt = DeltaTable.forName(spark, "production.silver.events")
dt.optimize().executeCompaction()  # incremental clustering

-- Liquid vs Z-ORDER vs Partitioning decision:
-- Liquid Clustering:  best for new tables, evolving access patterns, high-cardinality columns
-- Z-ORDER:            good for existing tables that cannot be recreated
-- Partitioning:       only for very low cardinality (e.g., date with ~365 partitions/year)`}</CodeBlock>
          <Quiz topicId="delta-liquid" questions={[
            { question: "What is the main advantage of Liquid Clustering over Z-ORDER?", options: ["Liquid uses less storage", "Liquid clusters incrementally  -  only new/changed files are clustered, not the entire table", "Liquid supports more columns", "Liquid works without OPTIMIZE"], correct: 1 },
            { question: "How do you change the clustering columns in a Liquid Clustered table?", options: ["Drop and recreate the table", "ALTER TABLE ... CLUSTER BY (...)  -  it is a metadata-only operation", "Run OPTIMIZE with new columns", "Use REORG TABLE"], correct: 1 },
            { question: "When should you choose partitioning over Liquid Clustering?", options: ["Always  -  partitioning is faster", "For very low-cardinality columns like date (hundreds of distinct values), where partition pruning eliminates entire directories", "For string columns", "When using Auto Loader"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-liquid'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="delta-constraints" ref={el => { if (el) sectionRefs.current['delta-constraints'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Table Constraints</h1>
            <p className="topic-desc">Delta Lake supports NOT NULL and CHECK constraints that enforce data quality at write time. Any write that violates a constraint is rejected with an error before data lands in the table.</p>
          </div>
          <CodeBlock lang="sql">{`-- NOT NULL constraint (defined at column level)
CREATE TABLE production.silver.orders (
  order_id    BIGINT NOT NULL,
  customer_id INT    NOT NULL,
  amount      DECIMAL(18,2),
  status      STRING,
  created_at  TIMESTAMP NOT NULL
)
USING DELTA;

-- CHECK constraint (named, arbitrary boolean expression)
ALTER TABLE production.silver.orders
  ADD CONSTRAINT valid_amount CHECK (amount > 0);

ALTER TABLE production.silver.orders
  ADD CONSTRAINT valid_status CHECK (status IN ('pending','processing','shipped','delivered','cancelled'));

ALTER TABLE production.silver.orders
  ADD CONSTRAINT valid_date CHECK (created_at >= '2020-01-01');

-- List all constraints on a table
SHOW TBLPROPERTIES production.silver.orders;
-- delta.constraints.valid_amount = amount > 0
-- delta.constraints.valid_status = status IN (...)

-- Drop a constraint (does NOT delete existing rows that would violate it)
ALTER TABLE production.silver.orders
  DROP CONSTRAINT valid_status;

-- What happens on a violation:
-- INSERT INTO production.silver.orders VALUES (1, 100, -50.00, 'pending', current_timestamp())
-- Error: CHECK constraint valid_amount (amount > 0) violated by row with values: amount = -50.00

-- Constraints are stored as table properties in the transaction log
-- They are enforced on INSERT, UPDATE, and MERGE operations
-- They do NOT retroactively validate existing data (add constraint = future writes only)`}</CodeBlock>
          <Quiz topicId="delta-constraints" questions={[
            { question: "When is a CHECK constraint enforced in Delta Lake?", options: ["When you run ANALYZE TABLE", "On every INSERT, UPDATE, and MERGE  -  bad rows are rejected before writing", "Only on INSERT, not on UPDATE or MERGE", "Only when explicitly called"], correct: 1 },
            { question: "What happens to existing data when you ADD CONSTRAINT to a Delta table?", options: ["Existing rows that violate the constraint are deleted", "Existing rows are NOT validated  -  the constraint applies only to future writes", "The operation fails if any existing row violates the constraint", "A warning is logged for violating rows"], correct: 1 },
            { question: "Where are Delta Lake constraints stored?", options: ["In a separate constraints catalog", "As table properties in the transaction log (_delta_log/)", "In the Hive metastore", "In a separate schema registry"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-constraints'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="delta-props" ref={el => { if (el) sectionRefs.current['delta-props'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Table Properties</h1>
            <p className="topic-desc">Delta table properties control retention, automatic optimization, change data feed, and column mapping. They are stored in the transaction log and can be set at table creation or altered later.</p>
          </div>
          <CodeBlock lang="sql">{`-- Set properties at CREATE time
CREATE TABLE production.silver.events
USING DELTA
TBLPROPERTIES (
  'delta.logRetentionDuration'          = 'interval 30 days',   -- keep transaction log 30 days
  'delta.deletedFileRetentionDuration'  = 'interval 7 days',    -- VACUUM retention (default 7d)
  'delta.autoOptimize.optimizeWrite'    = 'true',               -- coalesce small writes automatically
  'delta.autoOptimize.autoCompact'      = 'true',               -- auto compact after writes
  'delta.enableChangeDataFeed'          = 'true',               -- enable CDF
  'delta.columnMapping.mode'            = 'name',               -- enable rename/drop columns
  'delta.minReaderVersion'              = '2',
  'delta.minWriterVersion'              = '5'
);

-- Alter existing table properties
ALTER TABLE production.silver.events
SET TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.enableChangeDataFeed'       = 'true'
);

-- Read current properties
SHOW TBLPROPERTIES production.silver.events;

-- Key properties explained:
-- logRetentionDuration:         how long to keep _delta_log/ JSON files (affects DESCRIBE HISTORY depth)
-- deletedFileRetentionDuration: minimum age of deleted data files before VACUUM can remove them
-- autoOptimize.optimizeWrite:   Databricks auto-coalesces output files during streaming writes
-- autoOptimize.autoCompact:     after a write, Databricks checks if compaction is needed and runs it
-- enableChangeDataFeed:         writes extra _change_data/ files tracking row-level changes
-- columnMapping.mode = 'name':  decouples physical Parquet field names from logical column names
--                               enables ALTER TABLE ... RENAME COLUMN and DROP COLUMN

-- Unset a property (revert to default)
ALTER TABLE production.silver.events
UNSET TBLPROPERTIES ('delta.autoOptimize.autoCompact');`}</CodeBlock>
          <Quiz topicId="delta-props" questions={[
            { question: "What does delta.autoOptimize.optimizeWrite do?", options: ["Runs OPTIMIZE on a schedule", "Automatically coalesces small write output files into larger files during the write operation itself", "Removes duplicate rows", "Compresses Parquet files"], correct: 1 },
            { question: "What must you enable before you can rename or drop a column in a Delta table?", options: ["delta.enableSchemaEvolution = true", "delta.columnMapping.mode = 'name'", "delta.schemaEvolution.dropColumns = true", "mergeSchema = true"], correct: 1 },
            { question: "What is the difference between logRetentionDuration and deletedFileRetentionDuration?", options: ["They are the same setting", "logRetentionDuration controls how long JSON commit files are kept; deletedFileRetentionDuration controls how long deleted Parquet data files are kept before VACUUM removes them", "logRetentionDuration is for VACUUM; deletedFileRetentionDuration is for time travel", "Both control VACUUM behavior"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-props'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="delta-partitioning" ref={el => { if (el) sectionRefs.current['delta-partitioning'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Partitioning Strategy</h1>
            <p className="topic-desc">Partitioning physically organizes data into subdirectories by column value. Good partition design dramatically improves query performance by eliminating entire directory scans. Bad partition design creates thousands of tiny files and slows everything down.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Rule of thumb:</strong> Partition only on columns with LOW cardinality (date, region, status). Target at least 1 GB of data per partition. Tables under 1 TB typically should NOT be partitioned at all  -  use Z-ORDER or Liquid Clustering instead.
            </div>
          </div>
          <CodeBlock lang="python">{`# Good partition column selection
# - date: ~365 partitions/year, each partition ~100MB-10GB = GOOD
# - year_month: ~12 partitions/year = GOOD for huge tables
# - region: 5-20 partitions = GOOD
# - status: 3-10 distinct values = GOOD
# - user_id (millions of values): terrible over-partitioning
# - event_type (100+ values): likely too many small partitions

# Create partitioned Delta table
spark.sql("""
    CREATE TABLE production.silver.events (
        event_id    BIGINT NOT NULL,
        user_id     BIGINT,
        event_type  STRING,
        amount      DECIMAL(18,2),
        event_date  DATE,
        region      STRING
    )
    USING DELTA
    PARTITIONED BY (event_date, region)
    LOCATION 'abfss://silver@myaccount.dfs.core.windows.net/events'
""")

# DataFrame write with partitioning
df.write \\
  .format("delta") \\
  .mode("append") \\
  .partitionBy("event_date", "region") \\
  .save("abfss://silver@myaccount.dfs.core.windows.net/events")

# Partition pruning: Spark skips entire directories when filter matches partition column
spark.sql("""
    SELECT user_id, SUM(amount) as total
    FROM production.silver.events
    WHERE event_date = '2024-01-15'    -- prunes to 1 partition directory
      AND region = 'EMEA'               -- prunes further within date
    GROUP BY user_id
""")

# EXPLAIN shows partition pruning:
# PartitionFilters: [isnotnull(event_date), (event_date = 2024-01-15)]
# PushedFilters: [IsNotNull(region), EqualTo(region, EMEA)]

# Replace data for one partition efficiently (without touching others)
df_new.write \\
  .format("delta") \\
  .mode("overwrite") \\
  .option("replaceWhere", "event_date = '2024-01-15' AND region = 'EMEA'") \\
  .save("abfss://silver@myaccount.dfs.core.windows.net/events")

# List partitions
spark.sql("SHOW PARTITIONS production.silver.events").show()

# Warning signs of over-partitioning:
# - Thousands of partition directories in storage explorer
# - Query plan shows millions of files being opened
# - OPTIMIZE takes very long
# - File sizes average < 10MB
# Solution: CONVERT to Liquid Clustering (repartition on next write)
spark.sql("ALTER TABLE production.silver.events CLUSTER BY (event_date, region)")`}</CodeBlock>
          <Quiz topicId="delta-partitioning" questions={[
            { question: "What is the minimum recommended data volume per partition in a Delta table?", options: ["10 MB", "100 MB", "At least 1 GB to avoid the small-file problem", "10 GB"], correct: 2 },
            { question: "Which column is a BAD choice for partitioning?", options: ["event_date (daily, ~365/year)", "region (5 distinct values)", "user_id (millions of distinct values  -  extreme over-partitioning)", "year_month (12/year)"], correct: 2 },
            { question: "What does partition pruning do at query time?", options: ["Compresses partitions before reading", "Skips entire partition directories that do not match the WHERE clause filter, reducing I/O", "Merges small partitions automatically", "Sorts data within each partition"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-partitioning'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="delta-performance" ref={el => { if (el) sectionRefs.current['delta-performance'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Delta Performance Tuning</h1>
            <p className="topic-desc">Delta Lake has multiple performance levers beyond OPTIMIZE and Z-ORDER: column statistics for data skipping, Bloom filters for high-cardinality lookups, disk caching on Databricks, and the Photon vectorized engine.</p>
          </div>
          <CodeBlock lang="python">{`# 1. DATA SKIPPING with column statistics
# Delta auto-collects min/max/null counts for the first 32 columns
# These stats live in the transaction log JSON files  -  no extra scan needed
# Control which columns get stats:
spark.sql("""
    ALTER TABLE production.silver.events
    ALTER COLUMN user_id SET STATISTICS COLUMN_STATS_TYPE FULL
""")
# Or set the number of indexed columns (default 32):
spark.conf.set("spark.databricks.delta.dataSkippingNumIndexedCols", 32)

# View data skipping effectiveness in query plan
df = spark.sql("SELECT * FROM production.silver.events WHERE user_id = 12345")
df.explain("cost")
# Look for: numFiles read vs total files  -  high skip ratio = good Z-ORDER

# 2. BLOOM FILTERS for high-cardinality exact match lookups (e.g., UUID, email)
spark.sql("""
    CREATE BLOOMFILTER INDEX ON TABLE production.silver.events
    FOR COLUMNS (transaction_id OPTIONS (fpp=0.1, numItems=100000000))
""")
# fpp = false positive probability (0.1 = 10%  -  lower = bigger index, fewer false positives)
# numItems = expected distinct values

# 3. DISK CACHE (Databricks)  -  caches Parquet/Delta files in SSD of worker nodes
spark.conf.set("spark.databricks.io.cache.enabled", "true")
spark.conf.set("spark.databricks.io.cache.maxDiskUsage", "50g")
spark.conf.set("spark.databricks.io.cache.maxMetaDataCache", "1g")
# Best for: tables queried repeatedly within a cluster session
# Cache is warm across queries  -  not cleared between jobs on same cluster

# 4. PHOTON ENGINE (Databricks vectorized execution)
# Enabled at cluster level: select "Use Photon Acceleration" in cluster config
# Photon benefits: vectorized Parquet reads, faster aggregations, faster sort-merge joins
# Incompatible with: Python UDFs (use pandas UDFs instead), some RDD operations

# 5. FILE SIZE TUNING
spark.conf.set("spark.databricks.delta.targetFileSize", 134217728)  # 128 MB for streaming
# Default for OPTIMIZE = 1 GB (1073741824)
# Streaming writes: smaller targets (128MB) reduce latency
# Batch OPTIMIZE: 1 GB target minimizes file count for large tables

# 6. ADAPTIVE QUERY EXECUTION (AQE) with Delta
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
# AQE re-plans queries at runtime using actual cardinality stats from Delta logs

# 7. STATISTICS for Catalyst optimizer
spark.sql("ANALYZE TABLE production.silver.events COMPUTE STATISTICS FOR ALL COLUMNS")
# Provides row counts and column histograms to Catalyst for better join ordering`}</CodeBlock>
          <Quiz topicId="delta-performance" questions={[
            { question: "What are Bloom filters used for in Delta Lake?", options: ["Compressing Parquet files", "Fast existence checks for high-cardinality columns like UUIDs  -  probabilistically skip files that cannot contain a value", "Tracking schema changes", "Enabling time travel"], correct: 1 },
            { question: "Where are Delta Lake column statistics (min/max/null counts) stored?", options: ["In a separate stats table", "Inside the transaction log JSON commit files  -  read without scanning data files", "In the Hive metastore", "In a Bloom filter index"], correct: 1 },
            { question: "What is the Photon engine in Databricks?", options: ["A streaming protocol", "A vectorized query engine written in C++ that accelerates Spark SQL and DataFrame operations on Databricks clusters", "A file compression algorithm", "A cluster auto-scaling feature"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-performance'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-platform" ref={el => { if (el) sectionRefs.current['databricks-platform'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Databricks Platform Overview</h1>
            <p className="topic-desc">Databricks is the lakehouse platform built on Apache Spark. It provides managed clusters, notebooks, workflows, SQL warehouses, and Unity Catalog  -  all on top of customer cloud storage (ADLS Gen2, S3, GCS).</p>
          </div>
          <CodeBlock lang="python">{`# Databricks Runtime (DBR) version controls Spark version + optimizations
# DBR 14.3 LTS = Spark 3.5, Python 3.11, long-term support (recommended for production)
# DBR 15.x = Spark 3.5 + latest Databricks features (cutting edge)
# DBR ML editions add MLflow, sklearn, PyTorch pre-installed

# CLUSTER TYPES:
# 1. All-Purpose Clusters  -  interactive notebooks and ad-hoc work
#    - Persistent, shared, manually started/stopped
#    - More expensive per hour (billed while idle)
#    - Support notebooks + jobs

# 2. Job Clusters  -  created per job run, terminated when done
#    - No idle cost  -  only pay while running
#    - Best for scheduled production pipelines
#    - Cannot run interactive notebooks

# 3. SQL Warehouses  -  for Databricks SQL queries only
#    - Serverless or classic
#    - Auto-start, auto-stop, auto-scale
#    - No Spark executor management needed

# INSTANCE POOLS: pre-warmed VMs reduce cluster startup time
# Create a pool of idle VMs; clusters allocate from pool (2-3 min -> 30 sec startup)

# CLUSTER POLICIES: enforce cost/config controls
# Example: maximum workers = 10, specific instance type, auto-termination required
# Policy JSON (simplified):
policy_example = {
  "autotermination_minutes": {"type": "fixed", "value": 60},
  "num_workers": {"type": "range", "minValue": 1, "maxValue": 8},
  "node_type_id": {"type": "allowlist", "values": ["Standard_DS3_v2", "Standard_DS4_v2"]},
  "spark_version": {"type": "regex", "pattern": "14\\\\.[0-9]+.*"}
}

# RUNTIME CHANNEL: LTS vs Current
# LTS (Long Term Support): stable, 2-year support, production recommended
# Current: latest features, less stable, good for development

# PHOTON: vectorized C++ execution engine
# Enabled per cluster  -  checkbox "Use Photon Acceleration"
# Benefits: 2-10x faster SQL queries, faster Delta reads/writes
# Cost: Photon DBUs are priced higher than standard DBUs`}</CodeBlock>
          <Quiz topicId="databricks-platform" questions={[
            { question: "What is the key cost difference between All-Purpose and Job clusters?", options: ["Job clusters are always more expensive", "All-Purpose clusters are billed while idle; Job clusters are created per run and terminated when done  -  no idle cost", "There is no cost difference", "Job clusters use more workers"], correct: 1 },
            { question: "What is the purpose of Instance Pools in Databricks?", options: ["To share data between clusters", "To maintain pre-warmed VMs so clusters start faster (seconds instead of minutes)", "To reduce storage costs", "To enable cross-workspace access"], correct: 1 },
            { question: "Which DBR version should you use for production workloads?", options: ["Always the latest version", "An LTS (Long Term Support) version like DBR 14.3 LTS  -  stable, 2-year support window", "The lowest version for compatibility", "ML edition only"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-platform'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-uc" ref={el => { if (el) sectionRefs.current['databricks-uc'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Unity Catalog Deep Dive</h1>
            <p className="topic-desc">Unity Catalog (UC) is Databricks' unified governance layer. A single metastore per region governs all workspaces. The three-level namespace (catalog.schema.table) replaces the old two-level (database.table) model.</p>
          </div>
          <UCNamespaceAnimation />
          <CodeBlock lang="sql">{`-- Unity Catalog three-level namespace
-- metastore (1 per region, spans all workspaces)
--   catalog (e.g., production, development, sandbox)
--     schema (e.g., bronze, silver, gold)
--       table / view / volume / function / model

-- Create catalog (workspace admin required)
CREATE CATALOG IF NOT EXISTS production
  COMMENT 'Production data  -  all teams';

-- Create schema (database)
CREATE SCHEMA IF NOT EXISTS production.silver
  MANAGED LOCATION 'abfss://silver@myaccount.dfs.core.windows.net/'
  COMMENT 'Cleansed and validated data';

-- Create managed table (UC owns lifecycle  -  DELETE TABLE deletes files)
CREATE TABLE production.silver.customers (
  customer_id  BIGINT  NOT NULL,
  email        STRING,
  region       STRING,
  created_at   TIMESTAMP
)
USING DELTA;

-- Create external table (UC records location but does NOT own files)
CREATE TABLE production.bronze.events_raw
USING DELTA
LOCATION 'abfss://raw@myaccount.dfs.core.windows.net/events/';

-- VOLUMES: access non-tabular files (CSV, JSON, images) through UC
CREATE VOLUME production.bronze.raw_files
  LOCATION 'abfss://raw@myaccount.dfs.core.windows.net/files/';
-- Read a file from a volume:
df = spark.read.csv('/Volumes/production/bronze/raw_files/2024/data.csv')

-- EXTERNAL LOCATIONS: pre-approved storage paths
CREATE EXTERNAL LOCATION my_adls_raw
  URL 'abfss://raw@myaccount.dfs.core.windows.net/'
  WITH (STORAGE CREDENTIAL my_storage_cred);

-- SYSTEM TABLES (audit, lineage, billing)
SELECT * FROM system.access.audit             -- all access events
LIMIT 100;
SELECT * FROM system.lineage.table_lineage    -- upstream/downstream tables
WHERE target_table_full_name = 'production.silver.customers';`}</CodeBlock>
          <Quiz topicId="databricks-uc" questions={[
            { question: "What is the difference between a Managed and External table in Unity Catalog?", options: ["No difference in behavior", "Managed: UC owns files  -  DROP TABLE deletes data. External: UC tracks location but files survive DROP TABLE", "External tables are read-only", "Managed tables cannot be partitioned"], correct: 1 },
            { question: "What are Unity Catalog Volumes used for?", options: ["Storing Delta tables only", "Accessing non-tabular files (CSV, JSON, images, ML models) under UC governance via /Volumes/ path", "Replacing schemas", "Storing cluster logs"], correct: 1 },
            { question: "How many Unity Catalog metastores exist per cloud region in Databricks?", options: ["One per workspace", "One per region  -  shared across all workspaces in that region", "One per catalog", "One per account"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-uc'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-uc-permissions" ref={el => { if (el) sectionRefs.current['databricks-uc-permissions'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Unity Catalog Permissions</h1>
            <p className="topic-desc">Unity Catalog uses an additive permission model  -  there is no DENY. Permissions cascade down the hierarchy (catalog → schema → table). Groups are the recommended way to manage access at scale.</p>
          </div>
          <CodeBlock lang="sql">{`-- GRANT syntax: GRANT <privilege> ON <securable_type> <name> TO <principal>
-- Principals: user email, group name, service principal app ID

-- To query a table, user needs ALL THREE:
GRANT USE CATALOG ON CATALOG production              TO \`data-engineers\`;
GRANT USE SCHEMA  ON SCHEMA production.silver        TO \`data-engineers\`;
GRANT SELECT      ON TABLE production.silver.orders  TO \`data-engineers\`;

-- MODIFY privilege: INSERT, UPDATE, DELETE, MERGE
GRANT MODIFY      ON TABLE production.silver.orders  TO \`etl-service-principal\`;

-- CREATE privilege: create new objects in a schema
GRANT CREATE TABLE ON SCHEMA production.silver        TO \`data-engineers\`;
GRANT CREATE SCHEMA ON CATALOG production             TO \`catalog-admins\`;

-- ALL PRIVILEGES on a schema
GRANT ALL PRIVILEGES ON SCHEMA production.gold        TO \`gold-owners\`;

-- Grant on VOLUME (for file access)
GRANT READ VOLUME  ON VOLUME production.bronze.raw_files TO \`analysts\`;
GRANT WRITE VOLUME ON VOLUME production.bronze.raw_files TO \`data-engineers\`;

-- REVOKE
REVOKE SELECT ON TABLE production.silver.customers FROM \`contractors\`;

-- SHOW grants
SHOW GRANTS ON TABLE production.silver.orders;
SHOW GRANTS TO \`data-engineers\`;

-- Service principals (used for jobs and pipelines)
GRANT SELECT  ON TABLE production.silver.events  TO \`job-sp-app-id-12345\`;

-- Key privilege types:
-- SELECT:          read table data
-- MODIFY:          insert/update/delete/merge
-- CREATE TABLE:    create tables in a schema
-- CREATE SCHEMA:   create schemas in a catalog
-- USE CATALOG:     required to access any object in catalog
-- USE SCHEMA:      required to access any object in schema
-- EXECUTE:         call a function
-- READ VOLUME:     read files from a volume
-- WRITE VOLUME:    write files to a volume

-- NOTE: No DENY exists in UC. Permissions are purely additive.
-- If a user is in two groups where one has SELECT and the other does not,
-- they CAN read the table (additive wins).`}</CodeBlock>
          <Quiz topicId="databricks-uc-permissions" questions={[
            { question: "A user needs to query production.silver.orders. What is the minimum set of grants required?", options: ["Only SELECT on the table", "USE CATALOG on production, USE SCHEMA on production.silver, and SELECT on the table  -  all three are required", "SELECT on production.silver.orders and USE CATALOG on production", "MODIFY on the table"], correct: 1 },
            { question: "In Unity Catalog, what happens if a user is in Group A (has SELECT) and Group B (no SELECT on a table)?", options: ["The user cannot access the table  -  most restrictive wins", "The user CAN access the table  -  UC is additive only, there is no DENY", "An error is thrown due to conflicting permissions", "The user must explicitly be granted access"], correct: 1 },
            { question: "What privilege is required for a job service principal to INSERT data into a Delta table?", options: ["SELECT", "CREATE TABLE", "MODIFY  -  covers INSERT, UPDATE, DELETE, and MERGE", "WRITE VOLUME"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-uc-permissions'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-uc-rowcol" ref={el => { if (el) sectionRefs.current['databricks-uc-rowcol'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Row Filters and Column Masking</h1>
            <p className="topic-desc">Unity Catalog row filters restrict which rows a user can see. Column masks dynamically transform column values (e.g., mask PII for non-privileged users). Both are implemented as SQL functions and attached to tables.</p>
          </div>
          <CodeBlock lang="sql">{`-- ROW FILTERS: restrict rows visible to each user/group
-- Step 1: Create the filter function
CREATE FUNCTION production.silver.filter_by_region(region STRING)
  RETURN is_account_group_member('global-analysts')   -- global analysts see all
      OR region = current_user()                       -- others see only their region
      OR is_account_group_member('data-stewards');    -- stewards see all

-- Step 2: Attach the filter to the table
ALTER TABLE production.silver.orders
  SET ROW FILTER production.silver.filter_by_region ON (region);

-- Now: SELECT * FROM production.silver.orders
-- Returns only rows where filter_by_region(region) = TRUE for the calling user

-- COLUMN MASKS: dynamically transform column values
-- Step 1: Create the mask function
CREATE FUNCTION production.silver.mask_email(email STRING)
  RETURN CASE
    WHEN is_account_group_member('pii-readers') THEN email
    WHEN is_account_group_member('data-engineers') THEN
      concat(left(split(email,'@')[0], 2), '***@', split(email,'@')[1])
    ELSE regexp_replace(email, '.+@', '***@')  -- analysts see ***@domain.com
  END;

-- Step 2: Attach mask to the column
ALTER TABLE production.silver.customers
  ALTER COLUMN email SET MASK production.silver.mask_email;

-- Now: SELECT email FROM production.silver.customers
-- pii-readers group: returns full email
-- data-engineers: returns ka***@company.com
-- others: returns ***@company.com

-- Remove a row filter or column mask
ALTER TABLE production.silver.orders DROP ROW FILTER;
ALTER TABLE production.silver.customers ALTER COLUMN email DROP MASK;

-- Test as another user (requires IS_MEMBER or impersonation)
SELECT is_account_group_member('pii-readers');  -- check your own group membership

-- View current filters/masks on a table
DESCRIBE TABLE EXTENDED production.silver.customers;
-- Row Filter: production.silver.filter_by_region
-- Column Masks: email -> production.silver.mask_email`}</CodeBlock>
          <Quiz topicId="databricks-uc-rowcol" questions={[
            { question: "What is the two-step process to implement a row filter in Unity Catalog?", options: ["Write a VIEW and grant SELECT on it", "Create a SQL function that returns a boolean, then ALTER TABLE ... SET ROW FILTER to attach it", "Add a WHERE clause in the table definition", "Use GRANT ROW FILTER syntax"], correct: 1 },
            { question: "How does a column mask differ from a row filter?", options: ["Column masks delete columns; row filters delete rows", "Column masks transform the VALUE of a column for unauthorized users; row filters control which ROWS are visible", "They are the same concept", "Column masks are enforced client-side"], correct: 1 },
            { question: "Which built-in function checks if the current user belongs to a Databricks group inside a mask/filter function?", options: ["current_user_group()", "is_account_group_member()", "user_in_role()", "has_permission()"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-uc-rowcol'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-dlt" ref={el => { if (el) sectionRefs.current['databricks-dlt'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Delta Live Tables (DLT)</h1>
            <p className="topic-desc">DLT is Databricks' declarative ETL framework. You declare WHAT the data should look like; DLT handles execution order, retries, monitoring, lineage, and schema evolution. Pipelines run in Triggered (batch) or Continuous (streaming) mode.</p>
          </div>
          <DLTPipelineAnimation />
          <CodeBlock lang="python">{`import dlt
from pyspark.sql import functions as F
from pyspark.sql.functions import col, to_timestamp, current_timestamp

# ============================================================
# BRONZE LAYER  -  Raw ingestion via Auto Loader
# ============================================================
@dlt.table(
    name="orders_raw",
    comment="Raw orders ingested from ADLS landing zone",
    table_properties={
        "quality": "bronze",
        "pipelines.autoOptimize.managed": "true"
    }
)
def orders_raw():
    return (
        spark.readStream
        .format("cloudFiles")
        .option("cloudFiles.format", "json")
        .option("cloudFiles.schemaLocation", "/pipelines/schemas/orders")
        .option("cloudFiles.inferColumnTypes", "true")
        .option("cloudFiles.rescuedDataColumn", "_rescued_data")  # capture schema mismatches
        .load("abfss://landing@myaccount.dfs.core.windows.net/orders/")
        .withColumn("_ingested_at", current_timestamp())
        .withColumn("_source_file", col("_metadata.file_path"))
    )

# ============================================================
# SILVER LAYER  -  Cleaned + validated with expectations
# ============================================================
@dlt.table(
    name="orders",
    comment="Validated orders with business rules enforced",
    table_properties={"quality": "silver"},
    partition_cols=["order_date"]
)
@dlt.expect_or_drop("valid_order_id",   "order_id IS NOT NULL")
@dlt.expect_or_drop("valid_amount",     "amount > 0")
@dlt.expect_or_drop("valid_customer",   "customer_id IS NOT NULL")
@dlt.expect("complete_address",         "shipping_address IS NOT NULL")  # warn, keep row
@dlt.expect_or_fail("no_future_orders", "order_timestamp <= current_timestamp()")  # halt pipeline
def orders():
    return (
        dlt.read_stream("orders_raw")
        .withColumn("order_timestamp", to_timestamp("order_timestamp_str", "yyyy-MM-dd HH:mm:ss"))
        .withColumn("order_date", F.to_date("order_timestamp"))
        .withColumn("amount", col("amount").cast("decimal(18,2)"))
        .withColumn("status", F.upper(F.trim(col("status"))))
        .dropDuplicates(["order_id"])
        .select("order_id","customer_id","amount","status","order_date","order_timestamp","shipping_address")
    )

# ============================================================
# GOLD LAYER  -  Business aggregation (batch read, not stream)
# ============================================================
@dlt.table(
    name="revenue_by_day",
    comment="Daily revenue aggregation for BI dashboards",
    table_properties={"quality": "gold"}
)
def revenue_by_day():
    return (
        dlt.read("orders")   # batch read (not stream) from silver
        .where(col("status") != "cancelled")
        .groupBy("order_date")
        .agg(
            F.sum("amount").alias("gross_revenue"),
            F.count("order_id").alias("order_count"),
            F.countDistinct("customer_id").alias("unique_customers"),
            F.avg("amount").alias("avg_order_value")
        )
        .orderBy("order_date")
    )

# ============================================================
# DLT VIEWS  -  Temporary, not materialized as Delta tables
# ============================================================
@dlt.view(name="cancelled_orders_v")
def cancelled_orders_view():
    return dlt.read("orders").where(col("status") == "cancelled")

# DLT PIPELINE MODES:
# - Triggered: runs once (like a batch job), then stops. Good for scheduled pipelines.
# - Continuous: runs forever, micro-batching new data. Low latency but higher cost.

# DLT EVENT LOG (for monitoring):
# SELECT * FROM event_log('<pipeline_id>')
# WHERE event_type = 'flow_progress'  -- metrics per table per update
# SELECT details:flow_progress:metrics:num_output_rows, details:flow_progress:status
# FROM event_log('<pipeline_id>')
# ORDER BY timestamp DESC LIMIT 100`}</CodeBlock>
          <Quiz topicId="databricks-dlt" questions={[
            { question: "What is the difference between @dlt.expect_or_drop and @dlt.expect_or_fail?", options: ["They are identical", "expect_or_drop silently removes violating rows and continues; expect_or_fail halts the entire pipeline on any violation", "expect_or_fail sends an alert; expect_or_drop logs to the event log", "expect_or_drop is for streaming; expect_or_fail is for batch"], correct: 1 },
            { question: "When should you use dlt.read() vs dlt.read_stream()?", options: ["They are interchangeable", "dlt.read_stream() for incremental/streaming sources (Bronze→Silver); dlt.read() for batch aggregations where you want to reprocess all data (Silver→Gold)", "dlt.read() is deprecated", "dlt.read_stream() only works with Auto Loader"], correct: 1 },
            { question: "What is the DLT Event Log used for?", options: ["Storing raw data files", "Monitoring pipeline health  -  query it to see row counts, expectation failures, data quality metrics, and pipeline status per update", "Replacing the Delta transaction log", "Storing cluster logs"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-dlt'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-autoloader" ref={el => { if (el) sectionRefs.current['databricks-autoloader'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Auto Loader (cloudFiles)</h1>
            <p className="topic-desc">Auto Loader incrementally and efficiently processes new files from cloud storage. It tracks which files have been processed using a checkpoint, supports two file discovery modes, and handles schema inference and evolution automatically.</p>
          </div>
          <CodeBlock lang="python">{`# Auto Loader  -  production-ready configuration
from pyspark.sql import functions as F

df_stream = (
    spark.readStream
    .format("cloudFiles")

    # File format and location
    .option("cloudFiles.format", "json")                     # json, csv, parquet, avro, text, binaryFile
    .option("cloudFiles.schemaLocation", "/checkpoints/schema/orders")  # inferred schema storage

    # File discovery mode
    # "directory" (default): lists the folder on each trigger  -  works everywhere
    # "notification": uses Azure Event Grid / SNS for instant file detection (set up in cloud)
    .option("cloudFiles.useNotifications", "true")
    # For Azure: requires Event Grid subscription + storage queue configured

    # Schema inference
    .option("cloudFiles.inferColumnTypes", "true")           # infer int/double instead of all-string
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")  # auto-add new columns
    .option("cloudFiles.rescuedDataColumn", "_rescued_data") # capture unexpected columns/types in JSON
    .option("cloudFiles.allowOverwrites", "false")           # ignore re-uploaded files (default)

    # Rate limiting (avoid overloading downstream)
    .option("maxFilesPerTrigger", 1000)                      # process max 1000 files per micro-batch
    .option("maxBytesPerTrigger", "10g")                     # or max 10 GB per micro-batch

    # Backfill: periodically re-scan for files missed by notifications
    .option("cloudFiles.backfillInterval", "1 day")          # hourly/daily re-scan for safety

    .load("abfss://landing@myaccount.dfs.core.windows.net/orders/")
    .withColumn("_ingested_at", F.current_timestamp())
    .withColumn("_source_file", F.col("_metadata.file_path"))
    .withColumn("_file_modification_time", F.col("_metadata.file_modification_time"))
)

# Write stream to Delta table
query = (
    df_stream.writeStream
    .format("delta")
    .option("checkpointLocation", "/checkpoints/autoloader/orders")
    .option("mergeSchema", "true")          # allow schema evolution on write
    .trigger(availableNow=True)             # batch mode: process all pending, then stop
    # .trigger(processingTime="5 minutes")  # micro-batch every 5 min
    # .trigger(continuous="1 second")       # low-latency continuous mode
    .toTable("production.bronze.orders_raw")
)
query.awaitTermination()

# FILE NOTIFICATION MODE SETUP (Azure):
# 1. In Azure portal: Storage Account > Events > Create Event Subscription
# 2. Event type: Microsoft.Storage.BlobCreated
# 3. Endpoint: Azure Event Grid Queue or Service Bus
# 4. Grant Storage Blob Data Contributor to Databricks managed identity
# Result: files detected in milliseconds instead of listing every minute

# SCHEMA EVOLUTION example:
# Week 1: {"order_id": 1, "amount": 99.99}
# Week 2: {"order_id": 2, "amount": 49.99, "discount_code": "SUMMER10"}  <- new column
# Auto Loader: detects new column, updates schema in schemaLocation, adds to Delta table
# _rescued_data: null for week 1 rows, null for week 2 (new column handled cleanly)`}</CodeBlock>
          <Quiz topicId="databricks-autoloader" questions={[
            { question: "What is the purpose of cloudFiles.rescuedDataColumn in Auto Loader?", options: ["It rescues corrupted files", "It captures unexpected columns or type mismatches into a separate JSON column, so data is never silently dropped", "It recovers files from a failed checkpoint", "It stores schema history"], correct: 1 },
            { question: "What is the difference between maxFilesPerTrigger and cloudFiles.backfillInterval?", options: ["They control the same thing", "maxFilesPerTrigger limits files per micro-batch (rate control); backfillInterval triggers periodic full directory re-scans to catch any files missed by event notifications", "maxFilesPerTrigger is for batch; backfillInterval is for streaming", "backfillInterval replaces the checkpoint"], correct: 1 },
            { question: "What does trigger(availableNow=True) do in Auto Loader?", options: ["Runs continuously until stopped", "Processes all files currently in the landing zone in one or more micro-batches, then terminates the stream  -  useful for scheduled batch ingestion", "Triggers on file count exceeding a threshold", "Runs only on the most recently added file"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-autoloader'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-workflows" ref={el => { if (el) sectionRefs.current['databricks-workflows'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Databricks Workflows / Lakeflow</h1>
            <p className="topic-desc">Databricks Workflows (branded as Lakeflow Orchestration) is the native orchestration engine. It supports complex DAGs of tasks with dependencies, retry policies, alerting, and dynamic parameter passing.</p>
          </div>
          <CodeBlock lang="json">{`{
  "name": "Production Gold Layer  -  Daily",
  "schedule": {
    "quartz_cron_expression": "0 30 2 * * ?",
    "timezone_id": "UTC",
    "pause_status": "UNPAUSED"
  },
  "max_concurrent_runs": 1,
  "tasks": [
    {
      "task_key": "ingest_bronze",
      "description": "Auto Loader ingestion via DLT pipeline",
      "pipeline_task": {
        "pipeline_id": "dlt-pipeline-id-abc123",
        "full_refresh": false
      },
      "timeout_seconds": 3600,
      "retry_on_timeout": false
    },
    {
      "task_key": "validate_bronze",
      "depends_on": [{"task_key": "ingest_bronze"}],
      "notebook_task": {
        "notebook_path": "/Pipelines/Validation/BronzeQualityCheck",
        "base_parameters": {
          "run_date": "{{ds}}",
          "catalog": "{{job.parameters.catalog}}"
        }
      },
      "job_cluster_key": "validation-cluster"
    },
    {
      "task_key": "compute_silver",
      "depends_on": [{"task_key": "validate_bronze"}],
      "notebook_task": {
        "notebook_path": "/Pipelines/Silver/ComputeSilver",
        "base_parameters": {"run_date": "{{ds}}"}
      },
      "job_cluster_key": "transform-cluster"
    },
    {
      "task_key": "compute_gold_revenue",
      "depends_on": [{"task_key": "compute_silver"}],
      "notebook_task": {
        "notebook_path": "/Pipelines/Gold/ComputeRevenue",
        "base_parameters": {"run_date": "{{ds}}"}
      },
      "job_cluster_key": "transform-cluster"
    },
    {
      "task_key": "compute_gold_users",
      "depends_on": [{"task_key": "compute_silver"}],
      "notebook_task": {
        "notebook_path": "/Pipelines/Gold/ComputeUsers",
        "base_parameters": {"run_date": "{{ds}}"}
      },
      "job_cluster_key": "transform-cluster"
    },
    {
      "task_key": "dq_checks",
      "depends_on": [
        {"task_key": "compute_gold_revenue"},
        {"task_key": "compute_gold_users"}
      ],
      "sql_task": {
        "query": {"query_id": "dq-check-query-id"},
        "warehouse_id": "sql-warehouse-id"
      }
    },
    {
      "task_key": "notify_success",
      "depends_on": [{"task_key": "dq_checks"}],
      "python_wheel_task": {
        "package_name": "pipeline_notifier",
        "entry_point": "send_success_alert",
        "parameters": ["--run-date", "{{ds}}"]
      }
    }
  ],
  "job_clusters": [
    {
      "job_cluster_key": "transform-cluster",
      "new_cluster": {
        "spark_version": "14.3.x-scala2.12",
        "node_type_id": "Standard_DS4_v2",
        "num_workers": 4,
        "spark_conf": {
          "spark.sql.adaptive.enabled": "true",
          "spark.databricks.delta.optimizeWrite.enabled": "true"
        },
        "custom_tags": {"Team": "DataEngineering", "Env": "Production"}
      }
    }
  ],
  "parameters": [
    {"name": "catalog", "default": "production"}
  ],
  "email_notifications": {
    "on_failure": ["data-alerts@company.com"],
    "on_start": [],
    "on_success": []
  },
  "webhook_notifications": {
    "on_failure": [{"id": "pagerduty-webhook-id"}]
  }
}`}</CodeBlock>
          <Quiz topicId="databricks-workflows" questions={[
            { question: "What does {{ds}} represent in a Databricks Workflow task parameter?", options: ["Data source name", "The scheduled run date in YYYY-MM-DD format  -  a dynamic value substituted at runtime", "Dataset size", "The Databricks SQL warehouse ID"], correct: 1 },
            { question: "When two tasks both depend on compute_silver and have no dependency between each other, how does Databricks execute them?", options: ["Sequentially in alphabetical order", "In parallel  -  Databricks executes tasks as soon as all their dependencies succeed", "The first task defined in JSON runs first", "User must manually trigger each task"], correct: 1 },
            { question: "What is a Repair Run in Databricks Workflows?", options: ["Re-runs the entire job from scratch", "Re-runs only the failed tasks (and their downstream dependents) without re-running successful tasks", "Fixes syntax errors in notebooks", "Restores Delta tables to a previous version"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-workflows'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-dab" ref={el => { if (el) sectionRefs.current['databricks-dab'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Databricks Asset Bundles (DAB)</h1>
            <p className="topic-desc">Databricks Asset Bundles (DAB) is the Infrastructure-as-Code solution for Databricks. Define jobs, pipelines, notebooks, and cluster configs in YAML, then deploy to dev/staging/prod with a single CLI command.</p>
          </div>
          <CodeBlock lang="yaml">{`# bundle.yml  -  root configuration file
bundle:
  name: gold-layer-pipeline

# Shared variable definitions
variables:
  catalog:
    description: Target Unity Catalog catalog name
    default: development
  schema:
    description: Target schema
    default: silver

# Deployment targets
targets:
  dev:
    mode: development          # adds dev_ prefix to resource names, runs as user
    default: true
    workspace:
      host: https://adb-dev-1234567890.12.azuredatabricks.net
    variables:
      catalog: development
      schema: silver

  staging:
    mode: development
    workspace:
      host: https://adb-staging-9876543210.12.azuredatabricks.net
    variables:
      catalog: staging
      schema: silver

  prod:
    mode: production           # no prefix, runs as service principal
    workspace:
      host: https://adb-prod-1234567890.12.azuredatabricks.net
    variables:
      catalog: production
      schema: silver
    run_as:
      service_principal_name: prod-etl-sp@mycompany.com

# Resource definitions
resources:
  pipelines:
    bronze_ingestion:
      name: Bronze Ingestion - \${var.catalog}
      target: \${var.catalog}.bronze
      catalog: \${var.catalog}
      libraries:
        - notebook:
            path: ./src/pipelines/bronze_ingestion.py
      configuration:
        catalog: \${var.catalog}
      development: \${bundle.target == "dev"}

  jobs:
    gold_pipeline:
      name: Gold Pipeline - \${var.catalog}
      schedule:
        quartz_cron_expression: "0 30 2 * * ?"
        timezone_id: UTC
      tasks:
        - task_key: run_bronze_dlt
          pipeline_task:
            pipeline_id: \${resources.pipelines.bronze_ingestion.id}
        - task_key: compute_gold
          depends_on:
            - task_key: run_bronze_dlt
          notebook_task:
            notebook_path: ./src/notebooks/compute_gold.py
            base_parameters:
              catalog: \${var.catalog}
              schema: \${var.schema}
          job_cluster_key: default_cluster
      job_clusters:
        - job_cluster_key: default_cluster
          new_cluster:
            spark_version: 14.3.x-scala2.12
            node_type_id: Standard_DS4_v2
            num_workers: 4`}</CodeBlock>
          <CodeBlock lang="bash">{`# DAB CLI commands
# Install Databricks CLI
pip install databricks-cli
# or: brew install databricks

# Authenticate
databricks configure --token
# Enter host and personal access token (or use OAuth)

# Validate bundle configuration
databricks bundle validate

# Deploy to default target (dev)
databricks bundle deploy

# Deploy to specific target
databricks bundle deploy --target staging
databricks bundle deploy --target prod

# Run a job after deploying
databricks bundle run gold_pipeline

# Run with parameter overrides
databricks bundle run gold_pipeline --python-params '["--date", "2024-01-15"]'

# Destroy resources (careful in prod!)
databricks bundle destroy --target dev

# CI/CD GitHub Actions integration:
# .github/workflows/deploy.yml:
# on: push to main branch
# steps:
#   1. pip install databricks-cli
#   2. databricks bundle deploy --target prod
#      env: DATABRICKS_HOST, DATABRICKS_TOKEN (from GitHub secrets)`}</CodeBlock>
          <Quiz topicId="databricks-dab" questions={[
            { question: "What is the purpose of mode: development vs mode: production in a DAB target?", options: ["No functional difference", "development mode adds a prefix to resource names and runs as the deploying user; production mode uses exact names and runs as the configured service principal", "development mode disables scheduling", "production mode automatically enables Photon"], correct: 1 },
            { question: "What does databricks bundle deploy do?", options: ["Runs the job immediately", "Creates or updates all Databricks resources (jobs, pipelines, clusters) defined in bundle.yml in the target workspace", "Only validates the YAML syntax", "Destroys and recreates all resources"], correct: 1 },
            { question: "How does DAB enable CI/CD for Databricks pipelines?", options: ["By integrating with Databricks notebooks only", "Bundle YAML is version-controlled in git; CI/CD pipelines run databricks bundle deploy to promote changes across dev/staging/prod environments", "By exporting notebooks to Python files", "By using Databricks Repos only"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-dab'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-sql" ref={el => { if (el) sectionRefs.current['databricks-sql'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Databricks SQL</h1>
            <p className="topic-desc">Databricks SQL is the SQL analytics layer  -  SQL warehouses for BI tools, query history and profiling, alerts, and dashboards. Serverless warehouses start instantly and auto-scale with zero management.</p>
          </div>
          <CodeBlock lang="sql">{`-- SQL WAREHOUSES: two types
-- 1. Serverless: instant start (<5 sec), auto-scale, fully managed, higher cost/DBU
-- 2. Classic (Pro/Standard): manual cluster management, slower start, lower cost/DBU
-- Choose Serverless for interactive BI workloads; Classic for cost-sensitive batch SQL

-- QUERY HISTORY: view in Databricks SQL > Query History
-- Shows: duration, rows read, bytes scanned, warehouse used, user, query text
-- Filter by user, warehouse, duration, date range

-- QUERY PROFILES: click any query in history to see:
-- - Execution timeline (parse, plan, execute phases)
-- - Operator tree (like Spark's physical plan)
-- - Bottleneck identification (wide operators, spill to disk)

-- ALERTS: notify when a query result meets a condition
-- Example: alert if row count from a DQ check = 0
CREATE ALERT revenue_drop_alert
  ON SCHEDULE '0 9 * * *'            -- 9am UTC daily
  QUERY "SELECT SUM(revenue) FROM production.gold.revenue_by_day WHERE order_date = current_date()"
  CONDITION "value < 100000"          -- alert if revenue < 100k
  NOTIFY "data-alerts@company.com";

-- QUERY FEDERATION: query external databases directly
-- Requires external connection (MySQL, PostgreSQL, Redshift, Snowflake)
CREATE CONNECTION mysql_prod
  TYPE mysql
  OPTIONS (
    host 'mysql.company.com',
    port '3306',
    user 'readonly_user',
    password secret('my_scope', 'mysql_password')
  );

-- Query federated table
SELECT * FROM mysql_prod.orders_db.orders
WHERE created_at >= current_date() - INTERVAL 7 DAYS;

-- CONNECTED BI TOOLS (native connectors, no data movement):
-- Power BI: Databricks Connector in Power BI Desktop
-- Tableau: Databricks JDBC connector
-- Looker: native Databricks dialect
-- Mode, Sigma, Hex, Preset: native support
-- All connect to SQL warehouses, run SQL, leverage Unity Catalog permissions

-- MATERIALIZED VIEWS (Databricks SQL):
CREATE MATERIALIZED VIEW production.gold.revenue_summary_mv AS
SELECT
  order_date,
  region,
  SUM(amount)         AS revenue,
  COUNT(order_id)     AS order_count
FROM production.silver.orders
WHERE status != 'cancelled'
GROUP BY order_date, region;
-- Refreshed automatically when underlying tables change (serverless warehouse)

-- STREAMING TABLES (Databricks SQL):
CREATE STREAMING TABLE production.bronze.events_rt
AS SELECT * FROM STREAM(production.bronze.events_landing);
-- Declarative, managed incremental ingestion without DLT notebook`}</CodeBlock>
          <Quiz topicId="databricks-sql" questions={[
            { question: "What is the key operational difference between Serverless and Classic SQL warehouses?", options: ["Serverless only supports small queries", "Serverless starts in under 5 seconds and auto-scales with no cluster management; Classic requires manual configuration and has slower startup", "Classic is always faster", "Serverless does not support Unity Catalog"], correct: 1 },
            { question: "What does the Query Profile in Databricks SQL show?", options: ["The user who ran the query", "A detailed operator tree showing execution phases, bottlenecks, spill-to-disk, and row counts per operator  -  like Spark's physical plan UI for SQL", "Query cost estimates only", "The SQL warehouse configuration"], correct: 1 },
            { question: "What is a Materialized View in Databricks SQL?", options: ["A view that materializes once and never updates", "A precomputed query result stored as a Delta table, automatically refreshed when upstream tables change", "A view stored in the client browser cache", "A synonym for a regular CREATE VIEW"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-sql'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-sharing" ref={el => { if (el) sectionRefs.current['databricks-sharing'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Delta Sharing</h1>
            <p className="topic-desc">Delta Sharing is an open protocol for sharing live data securely across organizations without copying or moving data. Recipients can access shared tables using any supported platform (Databricks, Spark, pandas, Power BI, etc.).</p>
          </div>
          <CodeBlock lang="sql">{`-- Delta Sharing: provider side (you share data FROM this side)

-- Step 1: Create a share (logical container for shared objects)
CREATE SHARE partner_analytics_share
  COMMENT 'Aggregated data shared with Partner Corp';

-- Step 2: Add tables to the share (with optional partitioning/filtering)
ALTER SHARE partner_analytics_share
  ADD TABLE production.gold.revenue_by_day
  PARTITION BY (region)        -- recipient only gets rows matching their region
  COMMENT 'Daily revenue aggregation';

-- Add table with row-level filtering (share only non-PII columns)
ALTER SHARE partner_analytics_share
  ADD TABLE production.gold.product_metrics
  COLUMN MASK production.silver.mask_sensitive_fields;

-- Add schema (share all current + future tables in a schema)
ALTER SHARE partner_analytics_share
  ADD SCHEMA production.gold
  COMMENT 'All gold tables for partner analytics';

-- Step 3: Create a recipient
CREATE RECIPIENT partner_corp_recipient
  COMMENT 'Partner Corporation data science team';
-- Returns: activation_link (one-time URL for recipient to download credentials)

-- Or: recipient with IP allow-list
CREATE RECIPIENT partner_corp_recipient
  IP_ACCESS_LIST ("203.0.113.0/24", "198.51.100.10/32");

-- Step 4: Grant recipient access to share
GRANT SELECT ON SHARE partner_analytics_share TO RECIPIENT partner_corp_recipient;

-- View what has been granted
SHOW GRANT ON SHARE partner_analytics_share;
SHOW ALL IN SHARE partner_analytics_share;

-- RECIPIENT side (receiving organization):
-- Option A: Databricks-to-Databricks (same account)
-- Just use the table directly: SELECT * FROM production.gold.revenue_by_day

-- Option B: Open Sharing  -  any platform via credential file
-- 1. Recipient activates link -> downloads credentials JSON
-- 2. Connect from PySpark:
from delta_sharing import SharingClient
client = SharingClient("config.share")       # credentials file path
tables = client.list_all_tables()            # discover available tables
df = delta_sharing.load_as_spark(
    f"config.share#partner_analytics_share.gold.revenue_by_day"
)

-- Option C: Read in pandas (no Spark needed)
import delta_sharing
df = delta_sharing.load_as_pandas(
    "config.share#partner_analytics_share.gold.revenue_by_day"
)

-- MONITORING: track recipient access
SELECT * FROM system.delta_sharing.recipient_data_access
WHERE share_name = 'partner_analytics_share'
ORDER BY event_time DESC;`}</CodeBlock>
          <Quiz topicId="databricks-sharing" questions={[
            { question: "What is the key advantage of Delta Sharing over traditional data export for partner sharing?", options: ["Delta Sharing is faster to query", "Recipients access live data directly from the provider's storage with no data copying or movement  -  always fresh, no ETL pipeline needed", "Delta Sharing compresses data automatically", "Recipients get full write access"], correct: 1 },
            { question: "What is the difference between a Share and a Recipient in Delta Sharing?", options: ["They are the same concept", "A Share is a named collection of tables/schemas being offered; a Recipient is an identity (organization/team) that is granted access to one or more Shares", "A Recipient can modify the Share definition", "A Share belongs to a single workspace only"], correct: 1 },
            { question: "Can a non-Databricks organization receive shared Delta data?", options: ["No  -  Delta Sharing requires both sides to be Databricks", "Yes  -  via the open sharing protocol using a credential file, recipients can query shared data from Spark, pandas, Power BI, or any Delta Sharing client", "Only if they use Apache Spark", "Only via REST API"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-sharing'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>


        {/* ── ICEBERG INTRO ─────────────────────────────────────────────── */}
        <section id="iceberg-intro" ref={el => { if (el) sectionRefs.current['iceberg-intro'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Table Formats Comparison</div>
            <h1 className="topic-title">Apache Iceberg Architecture</h1>
            <p className="topic-desc">Apache Iceberg is an open table format for huge analytic datasets. Unlike Hive which tracks data at the partition directory level, Iceberg tracks files at the table level  -  enabling hidden partitioning, partition evolution, and snapshot isolation. The metadata layer (manifest files → manifest lists → table metadata JSON) is completely decoupled from the data files (Parquet/ORC/Avro), and a catalog (Hive/Glue/REST/Nessie) stores just a pointer to the current metadata file.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Iceberg Spec Versions:</strong> v1 provides basic snapshot isolation and schema evolution. v2 (current standard) adds row-level deletes via delete files (position deletes and equality deletes), enabling efficient UPDATE/DELETE without full file rewrites. Most modern engines (Spark 3.x, Trino, Flink) support v2.</div>
          </div>

          <CodeBlock lang="python">{`# ── Apache Iceberg: architecture and metadata layer ──────────────────────────
#
# my_table/
# ├── data/
# │   ├── 00000-0-abc123.parquet          ← actual data files (Parquet/ORC/Avro)
# │   └── 00001-1-def456.parquet
# └── metadata/
#     ├── v1.metadata.json                ← table metadata (schema, partition spec, snapshot list)
#     ├── v2.metadata.json                ← updated after each commit
#     ├── snap-1234567890.avro            ← snapshot manifest list (points to manifest files)
#     ├── 0000-abc.avro                   ← manifest file (list of data files + stats)
#     └── version-hint.text              ← catalog hint for latest metadata version
#
# Catalog (Hive/Glue/REST/Nessie) stores:
#   table_name → pointer to latest metadata.json
#
# Read path:
#   Catalog → current metadata.json → manifest list → manifest files → data files

# ── Iceberg table metadata.json structure (simplified) ───────────────────────
# {
#   "format-version": 2,
#   "table-uuid": "9c12d441-...",
#   "location": "s3://bucket/warehouse/db/my_table",
#   "schema": { "type": "struct", "fields": [...] },
#   "partition-spec": { "fields": [{"name": "event_day", "transform": "day", "source-id": 3}] },
#   "current-snapshot-id": 1234567890,
#   "snapshots": [
#     { "snapshot-id": 1234567890, "manifest-list": "snap-1234567890.avro", ... }
#   ]
# }

# ── Working with Iceberg in PySpark ──────────────────────────────────────────
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("IcebergDemo") \
    .config("spark.sql.extensions", "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions") \
    .config("spark.sql.catalog.glue_catalog", "org.apache.iceberg.spark.SparkCatalog") \
    .config("spark.sql.catalog.glue_catalog.warehouse", "s3://my-bucket/warehouse") \
    .config("spark.sql.catalog.glue_catalog.catalog-impl", "org.apache.iceberg.aws.glue.GlueCatalog") \
    .getOrCreate()

# Create an Iceberg table
spark.sql("""
  CREATE TABLE glue_catalog.db.events (
    event_id   BIGINT,
    user_id    BIGINT,
    event_type STRING,
    amount     DOUBLE,
    event_ts   TIMESTAMP
  ) USING iceberg
  PARTITIONED BY (days(event_ts))
  TBLPROPERTIES (
    'format-version' = '2',
    'write.target-file-size-bytes' = '134217728'
  )
""")

# Write data
df = spark.read.parquet("s3://landing/events/")
df.writeTo("glue_catalog.db.events").append()

# Inspect metadata
spark.sql("SELECT * FROM glue_catalog.db.events.snapshots").show()
spark.sql("SELECT * FROM glue_catalog.db.events.history").show()
spark.sql("SELECT * FROM glue_catalog.db.events.manifests").show()
spark.sql("SELECT * FROM glue_catalog.db.events.files").show(5)

# Inspect partitions (Iceberg tracks these in metadata  -  no directory scan needed)
spark.sql("SELECT * FROM glue_catalog.db.events.partitions").show()

# ── Iceberg spec v2: row-level deletes ────────────────────────────────────────
# Equality delete file: records matching delete predicates
# Position delete file: specific (file_path, row_position) pairs to delete
# Both approaches avoid rewriting large data files for small deletes.

spark.sql("""
  DELETE FROM glue_catalog.db.events
  WHERE event_type = 'test_event' AND event_ts < '2024-01-01'
""")
# Under the hood: Iceberg writes an equality delete file pointing to matching rows.
# Next compaction (rewrite_data_files) physically removes them.

# Trigger compaction to rewrite files and remove delete files
spark.sql("""
  CALL glue_catalog.system.rewrite_data_files(
    table => 'db.events',
    options => map('min-input-files', '5')
  )
""")

# Expire old snapshots to reclaim storage
spark.sql("""
  CALL glue_catalog.system.expire_snapshots(
    table => 'db.events',
    older_than => TIMESTAMP '2024-01-01 00:00:00',
    retain_last => 5
  )
""")`}</CodeBlock>

          <Quiz topicId="iceberg-intro" questions={[
            { question: "How does Apache Iceberg track table data differently from Apache Hive?", options: ["Iceberg stores data in HDFS only; Hive works on S3", "Iceberg tracks files at the table level via a metadata layer (manifest files/lists); Hive tracks at the partition directory level  -  Iceberg enables hidden partitioning and partition evolution without directory scans", "They track data identically  -  Iceberg just adds ACID on top", "Iceberg uses a RDBMS sidecar for file tracking; Hive does not"], correct: 1 },
            { question: "What was added in Iceberg spec version 2 that spec v1 lacked?", options: ["Snapshot isolation", "Hidden partitioning", "Row-level deletes via position delete files and equality delete files", "Schema evolution"], correct: 2 },
            { question: "In the Iceberg metadata hierarchy, what is the correct order from outermost to innermost?", options: ["Manifest file → Manifest list → Table metadata JSON", "Data files → Manifest files → Manifest list → Table metadata JSON", "Table metadata JSON → Manifest list → Manifest files → Data files", "Catalog → Table metadata JSON → Snapshot → Manifest list → Manifest files"], correct: 3 },
          ]} />
          <button onClick={async () => { await markTopicComplete('iceberg-intro'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── ICEBERG FEATURES ──────────────────────────────────────────── */}
        <section id="iceberg-features" ref={el => { if (el) sectionRefs.current['iceberg-features'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Table Formats Comparison</div>
            <h1 className="topic-title">Iceberg: Hidden Partitioning + Time Travel</h1>
            <p className="topic-desc">Iceberg's hidden partitioning is one of its most powerful innovations  -  partition transforms (identity, bucket, truncate, year/month/day/hour) are applied automatically by the engine. Queries never need to know the physical partition layout. Combined with schema evolution, partition evolution, and time travel, Iceberg provides a full table management lifecycle without ever rewriting all your data.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Partition Evolution:</strong> In Hive, changing the partition column requires rewriting all data. In Iceberg, you simply add a new partition spec  -  old files keep the old partitioning, new files use the new spec. Both coexist transparently. This is a zero-copy operation that takes milliseconds.</div>
          </div>

          <CodeBlock lang="python">{`# ── Iceberg Hidden Partitioning ──────────────────────────────────────────────
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("IcebergFeatures").getOrCreate()

# ── Partition transforms ──────────────────────────────────────────────────────
# identity(col)    -  exact value (same as Hive partitioning)
# bucket(N, col)   -  hash into N buckets (hides high-cardinality from users)
# truncate(W, col) -  truncate string to W chars or integer to W multiples
# year(col)        -  extract year from timestamp/date
# month(col)       -  extract year-month
# day(col)         -  extract year-month-day
# hour(col)        -  extract year-month-day-hour

spark.sql("""
  CREATE TABLE glue_catalog.db.events (
    event_id   BIGINT,
    user_id    BIGINT,
    event_type STRING,
    amount     DOUBLE,
    event_ts   TIMESTAMP
  ) USING iceberg
  PARTITIONED BY (
    days(event_ts),        -- hidden: no 'event_day' column needed in schema
    bucket(16, user_id)    -- hash user_id into 16 buckets
  )
""")

# Query WITHOUT specifying partition column  -  Iceberg applies transform automatically
spark.sql("""
  SELECT * FROM glue_catalog.db.events
  WHERE event_ts >= '2024-01-15' AND event_ts < '2024-01-16'
""")
# Iceberg translates event_ts filter → partition pruning on days(event_ts) = 2024-01-15
# No need to add WHERE event_day = '2024-01-15' like in Hive

# ── Schema evolution ──────────────────────────────────────────────────────────
# ADD  -  add a new column (safe, nullable by default)
spark.sql("ALTER TABLE glue_catalog.db.events ADD COLUMN channel STRING")
spark.sql("ALTER TABLE glue_catalog.db.events ADD COLUMN metadata MAP<STRING,STRING> AFTER channel")

# DROP  -  logically removed from schema; old files still have the physical column but readers skip it
spark.sql("ALTER TABLE glue_catalog.db.events DROP COLUMN channel")

# RENAME  -  metadata-only, zero file rewrites
spark.sql("ALTER TABLE glue_catalog.db.events RENAME COLUMN amount TO order_amount")

# REORDER  -  change column position in schema
spark.sql("ALTER TABLE glue_catalog.db.events ALTER COLUMN metadata FIRST")

# TYPE PROMOTION  -  safe widening only (int → long, float → double)
spark.sql("ALTER TABLE glue_catalog.db.events ALTER COLUMN user_id TYPE BIGINT")

# ── Partition evolution ───────────────────────────────────────────────────────
# Old partitioning: by day
# New requirement: partition by hour for higher granularity

# Add new partition field  -  old files keep day partitioning, new files use hour
spark.sql("""
  ALTER TABLE glue_catalog.db.events
  ADD PARTITION FIELD hours(event_ts)
""")

# Drop old day partition (still compatible with old files)
spark.sql("""
  ALTER TABLE glue_catalog.db.events
  DROP PARTITION FIELD days(event_ts)
""")

# ── Time travel ───────────────────────────────────────────────────────────────
# By snapshot ID
spark.sql("""
  SELECT COUNT(*) FROM glue_catalog.db.events
  VERSION AS OF 1234567890
""")

# By timestamp
spark.sql("""
  SELECT * FROM glue_catalog.db.events
  TIMESTAMP AS OF '2024-01-15T10:00:00'
""")

# PySpark API
snapshot_df = spark.read \
    .option("snapshot-id", "1234567890") \
    .table("glue_catalog.db.events")

ts_df = spark.read \
    .option("as-of-timestamp", "1705312800000") \  # epoch milliseconds
    .table("glue_catalog.db.events")

# ── Incremental reads: changes between snapshots ──────────────────────────────
incremental_df = spark.read \
    .option("start-snapshot-id", "1000000000") \
    .option("end-snapshot-id",   "1234567890") \
    .format("iceberg") \
    .load("glue_catalog.db.events")

# ── Branching and tagging (Iceberg v2) ────────────────────────────────────────
# Create a branch for data quality validation before promoting to main
spark.sql("ALTER TABLE glue_catalog.db.events CREATE BRANCH dq_validation")

# Write to the branch
df.writeTo("glue_catalog.db.events.branch_dq_validation").append()

# Read from a specific branch
spark.read.option("branch", "dq_validation").table("glue_catalog.db.events")

# Tag a known-good snapshot for auditing
spark.sql("""
  ALTER TABLE glue_catalog.db.events
  CREATE TAG monthly_snapshot_jan_2024
  AS OF VERSION 1234567890
""")

# Read from a tag
spark.read.option("tag", "monthly_snapshot_jan_2024").table("glue_catalog.db.events")`}</CodeBlock>

          <Quiz topicId="iceberg-features" questions={[
            { question: "With Iceberg hidden partitioning using PARTITIONED BY (days(event_ts)), what must the user include in their query to benefit from partition pruning?", options: ["They must add WHERE event_day = '...' using the derived partition column", "They must use a special PARTITION FILTER clause", "Nothing extra  -  Iceberg automatically applies the transform when filtering on event_ts, so a normal WHERE event_ts = '...' filter is enough", "They must call REFRESH TABLE first"], correct: 2 },
            { question: "You change a table's partition spec from days(event_ts) to hours(event_ts). What happens to existing data files?", options: ["All existing files are rewritten with the new hourly partition structure", "The operation fails  -  partition specs cannot be changed in Iceberg", "Existing files retain their day-based partitioning; only new files use the hour-based spec  -  both coexist transparently", "Existing files are moved to an archive location"], correct: 2 },
            { question: "Iceberg branching allows you to:", options: ["Create read replicas of a table for performance", "Isolate writes to a named branch (snapshot lineage) so you can validate changes before merging to main  -  similar to Git branches for table data", "Partition a table across multiple storage accounts", "Create materialized view snapshots"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('iceberg-features'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── HUDI INTRO ────────────────────────────────────────────────── */}
        <section id="hudi-intro" ref={el => { if (el) sectionRefs.current['hudi-intro'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Table Formats Comparison</div>
            <h1 className="topic-title">Apache Hudi (COW vs MOR)</h1>
            <p className="topic-desc">Apache Hudi (Hadoop Upserts and Incremental Deletes) was built by Uber for record-level upserts on data lakes  -  a problem Delta and Iceberg solve differently. Hudi's defining architectural choice is its two table types: Copy-On-Write (COW) rewrites Parquet files on every write, while Merge-On-Read (MOR) appends delta log files and merges at read time. Every Hudi operation is recorded on the Hudi Timeline, providing a complete operational history.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>COW vs MOR trade-off:</strong> COW has fast reads (no merge needed) but slow writes (full Parquet file rewrite per update). MOR has fast writes (appends to delta log) but slower reads (must merge base + log files). Choose COW for read-heavy analytical workloads; choose MOR for high-frequency upsert pipelines (CDC, streaming ingestion).</div>
          </div>

          <CodeBlock lang="python">{`# ── Apache Hudi: COW vs MOR and key concepts ─────────────────────────────────
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("HudiDemo") \
    .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer") \
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.hudi.catalog.HoodieCatalog") \
    .config("spark.sql.extensions", "org.apache.spark.sql.hudi.HoodieSparkSessionExtension") \
    .getOrCreate()

# ── 1. Copy-On-Write (COW) table ──────────────────────────────────────────────
# On every upsert: reads affected Parquet files, merges new records, rewrites
# Reads always get latest data from clean Parquet files  -  no merge at read time.

hudi_options_cow = {
    "hoodie.table.name": "orders",
    "hoodie.datasource.write.table.type": "COPY_ON_WRITE",
    "hoodie.datasource.write.operation": "upsert",          # upsert | insert | bulk_insert | delete
    "hoodie.datasource.write.recordkey.field": "order_id",  # unique key field
    "hoodie.datasource.write.precombine.field": "updated_at",  # tie-break: higher value wins
    "hoodie.datasource.write.partitionpath.field": "order_date",
    "hoodie.datasource.hive_sync.enable": "true",
    "hoodie.datasource.hive_sync.table": "orders",
    "hoodie.datasource.hive_sync.database": "silver",
    "hoodie.cleaner.commits.retained": "10",
}

df = spark.read.parquet("s3://landing/orders/")
df.write \
    .format("hudi") \
    .options(**hudi_options_cow) \
    .mode("append") \
    .save("s3://warehouse/silver/orders/")

# ── 2. Merge-On-Read (MOR) table ──────────────────────────────────────────────
# Writes append a delta log file (.log)  -  very fast writes.
# Reads: merge base Parquet file + delta log files for latest view.
# Periodic compaction rewrites base files to absorb the logs.

hudi_options_mor = {
    "hoodie.table.name": "events",
    "hoodie.datasource.write.table.type": "MERGE_ON_READ",  # key difference
    "hoodie.datasource.write.operation": "upsert",
    "hoodie.datasource.write.recordkey.field": "event_id",
    "hoodie.datasource.write.precombine.field": "event_ts",
    "hoodie.datasource.write.partitionpath.field": "event_date",
    "hoodie.compact.inline": "false",       # manual compaction (better for streaming)
    "hoodie.compact.inline.max.delta.commits": "5",
}

# Streaming upsert (foreachBatch pattern)
def upsert_to_hudi(batch_df, batch_id):
    batch_df.write \
        .format("hudi") \
        .options(**hudi_options_mor) \
        .mode("append") \
        .save("s3://warehouse/silver/events/")

streaming_query = spark.readStream \
    .format("delta") \
    .table("bronze.events_cdc") \
    .writeStream \
    .foreachBatch(upsert_to_hudi) \
    .option("checkpointLocation", "/checkpoints/events_hudi") \
    .start()

# ── 3. Hudi Timeline ──────────────────────────────────────────────────────────
# Every operation creates an instant on the timeline:
# .hoodie/
#   20240115143000000.commit         ← completed commit
#   20240115143000000.commit.request ← in-flight (incomplete)
#   20240115143000000.rollback       ← rolled back commit
#   20240115143000000.compaction     ← compaction instant
#   20240115143000000.clean          ← cleaner instant

# Read timeline programmatically
from pyspark.sql.functions import col
timeline = spark.read.format("hudi").load("s3://warehouse/silver/orders/") \
    .select("_hoodie_commit_time", "_hoodie_commit_seqno", "_hoodie_record_key", "_hoodie_partition_path")
timeline.show(5)

# ── 4. Three query types ──────────────────────────────────────────────────────
# Snapshot Query  -  latest state (default)  -  for COW: clean Parquet; for MOR: merges base+log
snapshot_df = spark.read.format("hudi").load("s3://warehouse/silver/events/")

# Incremental Query  -  changes since a commit time (like CDF in Delta)
incremental_df = spark.read.format("hudi") \
    .option("hoodie.datasource.query.type", "incremental") \
    .option("hoodie.datasource.read.begin.instanttime", "20240115000000000") \
    .load("s3://warehouse/silver/events/")

# Read Optimized Query (MOR only)  -  reads only base Parquet files, skips delta logs
# Fast but may not have the very latest records
ro_df = spark.read.format("hudi") \
    .option("hoodie.datasource.query.type", "read_optimized") \
    .load("s3://warehouse/silver/events/")

# ── 5. Compaction (MOR only) ──────────────────────────────────────────────────
# Merges delta log files into base Parquet files
# Can run inline (during write) or as a separate scheduled job
spark.sql("CALL run_compaction(table => 'silver.events')")

# ── 6. Delete a record ────────────────────────────────────────────────────────
delete_df = spark.createDataFrame([("ORDER-9999",)], ["order_id"])
delete_df.write \
    .format("hudi") \
    .options(**{**hudi_options_cow, "hoodie.datasource.write.operation": "delete"}) \
    .mode("append") \
    .save("s3://warehouse/silver/orders/")`}</CodeBlock>

          <Quiz topicId="hudi-intro" questions={[
            { question: "You have a high-frequency CDC pipeline ingesting 50,000 upserts/second. Which Hudi table type should you choose?", options: ["Copy-On-Write (COW)  -  rewrites Parquet files immediately for fast reads", "Merge-On-Read (MOR)  -  appends delta log files for fast writes, merges at read time", "Both are equivalent for streaming CDC", "Neither  -  use Delta Lake for streaming"], correct: 1 },
            { question: "What is hoodie.datasource.write.precombine.field used for?", options: ["It defines the partition column for the table", "When multiple records share the same record key in a batch, the precombine field is used to pick the winner  -  the record with the higher value is kept", "It sets the sort order for Parquet files", "It controls the compaction trigger interval"], correct: 1 },
            { question: "What does an Incremental Query in Hudi return?", options: ["A snapshot of the table at a historical timestamp", "Only the records that changed (inserted/updated/deleted) since a specified commit time  -  useful for propagating changes downstream", "All records sorted by commit time", "Records that failed validation"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('hudi-intro'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        {/* ── FORMAT COMPARISON ─────────────────────────────────────────── */}
        <section id="format-comparison" ref={el => { if (el) sectionRefs.current['format-comparison'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Table Formats Comparison</div>
            <h1 className="topic-title">Delta vs Iceberg vs Hudi Comparison</h1>
            <p className="topic-desc">Delta Lake, Apache Iceberg, and Apache Hudi all solve the same core problem  -  ACID transactions and reliable upserts on cloud data lakes  -  but with different architectural trade-offs, ecosystem alignments, and strengths. Understanding when to choose each format is critical for modern data platform design.</p>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Vendor alignment:</strong> Delta Lake = Databricks + Azure (native on Databricks; excellent on ADLS). Iceberg = AWS + Snowflake + Dremio (native on AWS Glue, S3Tables, Snowflake). Hudi = Uber origin, strong on AWS EMR + S3. In practice, multi-cloud platforms are moving toward supporting all three  -  but your primary cloud/vendor choice often dictates the default.</div>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'var(--gray-100)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-1)' }}>Feature</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>Delta Lake</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#7c3aed' }}>Apache Iceberg</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>Apache Hudi</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'ACID Transactions', delta: 'Yes (OCC)', iceberg: 'Yes (OCC)', hudi: 'Yes (OCC)' },
                  { feature: 'Row-level Upsert', delta: 'MERGE (rewrite)', iceberg: 'MERGE + delete files (v2)', hudi: 'Native (COW/MOR)' },
                  { feature: 'Time Travel', delta: 'Yes (version/timestamp)', iceberg: 'Yes (snapshot/timestamp)', hudi: 'Yes (commit timeline)' },
                  { feature: 'Schema Evolution', delta: 'Yes (add/rename/drop)', iceberg: 'Yes (add/drop/rename/reorder/promote)', hudi: 'Yes (add/rename)' },
                  { feature: 'Partition Evolution', delta: 'No (requires rewrite)', iceberg: 'Yes (zero-copy, backward compatible)', hudi: 'Limited' },
                  { feature: 'Hidden Partitioning', delta: 'No', iceberg: 'Yes (transforms: day/month/bucket/truncate)', hudi: 'No' },
                  { feature: 'Streaming Support', delta: 'Yes (Structured Streaming)', iceberg: 'Yes (Flink + Spark Streaming)', hudi: 'Yes (Spark Streaming, native)' },
                  { feature: 'Incremental Reads', delta: 'CDF (Change Data Feed)', iceberg: 'Incremental scan between snapshots', hudi: 'Incremental query type' },
                  { feature: 'Catalog Support', delta: 'Hive, Unity, Glue, Nessie', iceberg: 'Hive, Glue, REST, Nessie, JDBC', hudi: 'Hive, Glue, Alluxio' },
                  { feature: 'Spark Support', delta: 'Excellent (native)', iceberg: 'Excellent', hudi: 'Good' },
                  { feature: 'Flink Support', delta: 'Good', iceberg: 'Excellent (first-class)', hudi: 'Good' },
                  { feature: 'Trino/Presto Support', delta: 'Good', iceberg: 'Excellent (native)', hudi: 'Good' },
                  { feature: 'Concurrency Model', delta: 'Optimistic (S3/ADLS)', iceberg: 'Optimistic (pluggable)', hudi: 'Optimistic (file-level)' },
                  { feature: 'Cloud Alignment', delta: 'Databricks, Azure', iceberg: 'AWS, Snowflake, Dremio', hudi: 'AWS EMR, Uber' },
                  { feature: 'Write Amplification', delta: 'Medium (COW always)', iceberg: 'Low (v2 delete files)', hudi: 'Low (MOR log append)' },
                ].map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '7px 12px', fontWeight: 600, color: 'var(--text-1)' }}>{row.feature}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'center', color: '#2563eb' }}>{row.delta}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'center', color: '#7c3aed' }}>{row.iceberg}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'center', color: '#059669' }}>{row.hudi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CodeBlock lang="python">{`# ── Reading and writing each format in PySpark ───────────────────────────────
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("FormatComparison").getOrCreate()

# ── Delta Lake ────────────────────────────────────────────────────────────────
# Write
df.write.format("delta").mode("overwrite").save("s3://bucket/delta/orders/")

# Read
delta_df = spark.read.format("delta").load("s3://bucket/delta/orders/")

# MERGE upsert
from delta.tables import DeltaTable
DeltaTable.forPath(spark, "s3://bucket/delta/orders/").alias("t").merge(
    df.alias("s"), "t.order_id = s.order_id"
).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()

# Time travel
spark.read.format("delta").option("versionAsOf", 3).load("s3://bucket/delta/orders/")

# ── Apache Iceberg ────────────────────────────────────────────────────────────
# Write (requires Iceberg catalog configured in SparkSession)
df.writeTo("catalog.db.orders").append()

# Alternative: write via DataFrameWriter
df.write.format("iceberg").mode("append").save("catalog.db.orders")

# Read
iceberg_df = spark.table("catalog.db.orders")
iceberg_df = spark.read.format("iceberg").load("s3://bucket/iceberg/orders/")

# Time travel by snapshot
spark.read.option("snapshot-id", "1234567890").table("catalog.db.orders")

# Time travel by timestamp
spark.sql("SELECT * FROM catalog.db.orders TIMESTAMP AS OF '2024-01-15 10:00:00'")

# ── Apache Hudi ───────────────────────────────────────────────────────────────
hudi_opts = {
    "hoodie.table.name": "orders",
    "hoodie.datasource.write.table.type": "COPY_ON_WRITE",
    "hoodie.datasource.write.operation": "upsert",
    "hoodie.datasource.write.recordkey.field": "order_id",
    "hoodie.datasource.write.precombine.field": "updated_at",
    "hoodie.datasource.write.partitionpath.field": "order_date",
}

# Write
df.write.format("hudi").options(**hudi_opts).mode("append").save("s3://bucket/hudi/orders/")

# Read (snapshot  -  latest)
hudi_df = spark.read.format("hudi").load("s3://bucket/hudi/orders/")

# Incremental read (changes since a commit time)
hudi_df_incr = spark.read.format("hudi") \
    .option("hoodie.datasource.query.type", "incremental") \
    .option("hoodie.datasource.read.begin.instanttime", "20240115000000000") \
    .load("s3://bucket/hudi/orders/")

# ── Decision guide: when to choose each ──────────────────────────────────────
# Choose DELTA LAKE when:
#   - Your primary platform is Databricks or Azure Synapse
#   - You need tight integration with Unity Catalog / Delta Sharing
#   - Your team is already Spark-centric; you want the simplest ACID story
#   - DLT (Delta Live Tables) pipelines are part of your architecture

# Choose APACHE ICEBERG when:
#   - You're on AWS (native on Glue, S3 Tables, Athena, EMR)
#   - You need partition evolution without data rewrites
#   - You want multi-engine support: Spark + Trino + Flink + Snowflake + Dremio
#   - You're building an open lakehouse that must work across cloud vendors
#   - Hidden partitioning is important for your use cases

# Choose APACHE HUDI when:
#   - You need the lowest write latency for high-frequency upserts (MOR)
#   - You're on AWS EMR and following Uber's patterns
#   - Your primary use case is near-real-time CDC ingestion
#   - You need incremental processing built into the table format natively`}</CodeBlock>

          <Quiz topicId="format-comparison" questions={[
            { question: "Which table format offers partition evolution (changing the partition spec without rewriting data) as a first-class zero-copy operation?", options: ["Delta Lake  -  via OPTIMIZE + ZORDER", "Apache Iceberg  -  add/drop partition fields in metadata only; old and new files coexist transparently", "Apache Hudi  -  via timeline compaction", "All three support zero-copy partition evolution"], correct: 1 },
            { question: "You are building a data platform on AWS that must be queryable from Spark, Trino, Flink, and Snowflake without vendor lock-in. Which format is the best fit?", options: ["Delta Lake  -  best multi-engine support overall", "Apache Hudi  -  native AWS support via EMR", "Apache Iceberg  -  excellent multi-engine support on AWS (Glue, Athena, EMR) with first-class Trino and Snowflake integration", "All three are equally suited for this scenario"], correct: 2 },
            { question: "What is the key architectural reason Apache Hudi MOR has faster write performance than Delta Lake or Iceberg for high-frequency upserts?", options: ["Hudi uses in-memory storage for recent writes", "MOR appends only a small delta log file per write batch without rewriting existing Parquet files  -  the merge cost is deferred to read time or periodic compaction", "Hudi skips ACID validation for speed", "Hudi uses columnar compression that is faster to write"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('format-comparison'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

      </main>
    </div>
  )
}

// ============================================================
// ANIMATION COMPONENTS
// ============================================================

function DeltaLogAnimation() {
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setVersion(v => (v + 1) % 6), 2000)
    return () => clearInterval(t)
  }, [])
  const commits = [
    { ver: 0, op: 'CREATE TABLE', color: '#4f8ef7', detail: 'metaData + protocol' },
    { ver: 1, op: 'WRITE (batch)', color: '#22c55e', detail: 'add: 4 parquet files' },
    { ver: 2, op: 'MERGE (upsert)', color: '#f59e0b', detail: 'add: 2 files, remove: 1' },
    { ver: 3, op: 'OPTIMIZE', color: '#8b5cf6', detail: 'add: 1 GB file, remove: 200 small' },
    { ver: 4, op: 'DELETE rows', color: '#ef4444', detail: 'add: 1 file, remove: 1 file' },
    { ver: 5, op: 'CHECKPOINT', color: '#64748b', detail: '0000000000000005.checkpoint.parquet' },
  ]
  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4, fontSize: '.9rem' }}>Delta Transaction Log (_delta_log/)</div>
      <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: 12 }}>Each operation appends a numbered JSON commit. Every 10 commits creates a Parquet checkpoint.</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {commits.map(c => (
          <div key={c.ver} style={{
            padding: '8px 12px', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${c.color}`,
            background: version >= c.ver ? c.color + '18' : 'white',
            transition: 'background .4s', minWidth: 120,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: c.color, fontWeight: 700 }}>0000{c.ver}.json</div>
            <div style={{ fontSize: '.72rem', fontWeight: 600, marginTop: 2 }}>{c.op}</div>
            <div style={{ fontSize: '.68rem', color: 'var(--text-3)', marginTop: 2 }}>{c.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: '.8rem', color: 'var(--text-3)' }}>
        Current version: <strong style={{ color: 'var(--blue-600)' }}>{version}</strong>  -  query any version with <code>VERSION AS OF {version}</code>
      </div>
    </div>
  )
}

function MergeAnimation() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 2200)
    return () => clearInterval(t)
  }, [])
  const sourceRows = [
    { id: 1, name: 'Alice (updated)', match: true, action: 'UPDATE' },
    { id: 3, name: 'Charlie (new)', match: false, action: 'INSERT' },
    { id: 4, name: 'Diana (new)', match: false, action: 'INSERT' },
  ]
  const targetRows = [
    { id: 1, name: 'Alice (old)', active: step >= 2 },
    { id: 2, name: 'Bob (no source)', active: false },
  ]
  const labels = ['Source & Target', 'Match on ID', 'Apply MATCHED update', 'Apply NOT MATCHED insert']
  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4, fontSize: '.9rem' }}>MERGE Operation  -  Step {step + 1}: {labels[step]}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--blue-600)', marginBottom: 8 }}>SOURCE (updates_df)</div>
          {sourceRows.map(r => (
            <div key={r.id} style={{ padding: '6px 10px', borderRadius: 8, marginBottom: 4, fontSize: '.75rem', background: step >= 1 ? (r.match ? '#fef3c720' : '#dcfce720') : 'white', border: `1px solid ${r.match ? '#f59e0b' : '#22c55e'}`, display: 'flex', justifyContent: 'space-between' }}>
              <span>id={r.id}: {r.name}</span>
              {step >= 1 && <span style={{ fontWeight: 700, color: r.match ? '#f59e0b' : '#22c55e', fontSize: '.68rem' }}>{r.action}</span>}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--purple-600, #7c3aed)', marginBottom: 8 }}>TARGET (delta table)</div>
          {targetRows.map(r => (
            <div key={r.id} style={{ padding: '6px 10px', borderRadius: 8, marginBottom: 4, fontSize: '.75rem', background: r.active ? '#fef3c740' : 'white', border: `1px solid ${r.active ? '#f59e0b' : 'var(--border)'}`, opacity: step >= 2 && r.id === 1 ? 0.4 : 1, transition: 'all .3s' }}>
              id={r.id}: {step >= 2 && r.id === 1 ? 'Alice (updated) ✓' : r.name}
            </div>
          ))}
          {step >= 3 && sourceRows.filter(r => !r.match).map(r => (
            <div key={r.id} style={{ padding: '6px 10px', borderRadius: 8, marginBottom: 4, fontSize: '.75rem', background: '#dcfce740', border: '1px solid #22c55e' }}>
              id={r.id}: {r.name} ✓ (inserted)
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimelineAnimation() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCurrent(v => (v + 1) % 5), 1800)
    return () => clearInterval(t)
  }, [])
  const versions = [
    { v: 0, op: 'Initial WRITE', time: '2024-01-10 09:00', rows: '1M rows', color: '#4f8ef7' },
    { v: 1, op: 'MERGE upsert', time: '2024-01-11 14:30', rows: '+50K rows', color: '#22c55e' },
    { v: 2, op: 'DELETE expired', time: '2024-01-12 02:00', rows: '-10K rows', color: '#ef4444' },
    { v: 3, op: 'OPTIMIZE', time: '2024-01-12 03:00', rows: 'no row change', color: '#8b5cf6' },
    { v: 4, op: 'MERGE upsert', time: '2024-01-13 15:00', rows: '+25K rows', color: '#f59e0b' },
  ]
  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4, fontSize: '.9rem' }}>Time Travel  -  Table Version Timeline</div>
      <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: 12 }}>Click any version to time-travel. Current active: v{current}</div>
      <div style={{ display: 'flex', gap: 0, alignItems: 'center', flexWrap: 'wrap' }}>
        {versions.map((v, i) => (
          <div key={v.v} style={{ display: 'flex', alignItems: 'center' }}>
            <div onClick={() => setCurrent(v.v)} style={{ padding: '8px 10px', borderRadius: 8, border: `2px solid ${current === v.v ? v.color : 'var(--border)'}`, background: current === v.v ? v.color + '20' : 'white', cursor: 'pointer', transition: 'all .3s', minWidth: 110, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: v.color, fontWeight: 700 }}>v{v.v}</div>
              <div style={{ fontSize: '.7rem', fontWeight: 600 }}>{v.op}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>{v.time}</div>
              <div style={{ fontSize: '.65rem', color: v.color }}>{v.rows}</div>
            </div>
            {i < versions.length - 1 && <div style={{ width: 16, height: 2, background: 'var(--border)', margin: '0 2px' }} />}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: '.8rem', color: 'var(--text-3)' }}>
        Viewing: <code style={{ color: 'var(--blue-600)' }}>SELECT * FROM table VERSION AS OF {current}</code>
        {' '}  -  {versions[current].op} at {versions[current].time}
      </div>
    </div>
  )
}

function UCNamespaceAnimation() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['production', 'production.silver']))
  const toggle = (key: string) => setExpanded(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })
  const tree = [
    { key: 'production', label: 'catalog: production', icon: '🏛️', color: '#4f8ef7', depth: 0, children: [
      { key: 'production.bronze', label: 'schema: bronze', icon: '🗂️', color: '#92400e', depth: 1, children: [
        { key: 'production.bronze.events_raw', label: 'table: events_raw (external)', icon: '📋', color: '#78350f', depth: 2 },
        { key: 'production.bronze.users_raw', label: 'table: users_raw (external)', icon: '📋', color: '#78350f', depth: 2 },
      ]},
      { key: 'production.silver', label: 'schema: silver', icon: '🗂️', color: '#475569', depth: 1, children: [
        { key: 'production.silver.events', label: 'table: events (managed)', icon: '📋', color: '#334155', depth: 2 },
        { key: 'production.silver.customers', label: 'table: customers (managed)', icon: '📋', color: '#334155', depth: 2 },
        { key: 'production.silver.raw_files', label: 'volume: raw_files', icon: '📦', color: '#0891b2', depth: 2 },
      ]},
      { key: 'production.gold', label: 'schema: gold', icon: '🗂️', color: '#92400e', depth: 1, children: [
        { key: 'production.gold.revenue_daily', label: 'table: revenue_daily', icon: '📋', color: '#b45309', depth: 2 },
        { key: 'production.gold.revenue_mv', label: 'mat. view: revenue_mv', icon: '👁️', color: '#b45309', depth: 2 },
      ]},
    ]},
  ]
  const renderNode = (node: typeof tree[0] & { children?: typeof tree }): React.ReactNode => {
    const hasChildren = 'children' in node && node.children && node.children.length > 0
    const isExpanded = expanded.has(node.key)
    return (
      <div key={node.key}>
        <div onClick={() => hasChildren && toggle(node.key)} style={{ paddingLeft: node.depth * 20, display: 'flex', alignItems: 'center', gap: 6, cursor: hasChildren ? 'pointer' : 'default', padding: `3px 4px 3px ${node.depth * 20 + 4}px`, borderRadius: 4, marginBottom: 2, transition: 'background .15s' }}>
          <span style={{ fontSize: '.8rem' }}>{hasChildren ? (isExpanded ? '▾' : '▸') : '  '}</span>
          <span style={{ fontSize: '.8rem' }}>{node.icon}</span>
          <span style={{ fontSize: '.77rem', color: node.color, fontFamily: 'var(--font-mono)' }}>{node.label}</span>
        </div>
        {hasChildren && isExpanded && node.children!.map(child => renderNode(child as typeof tree[0] & { children?: typeof tree }))}
      </div>
    )
  }
  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4, fontSize: '.9rem' }}>Unity Catalog Namespace (click to expand)</div>
      <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: 12 }}>metastore (1 per region) → catalog → schema → table/view/volume</div>
      {tree.map(node => renderNode(node as typeof tree[0] & { children?: typeof tree }))}
    </div>
  )
}

function DLTPipelineAnimation() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % 3), 2000)
    return () => clearInterval(t)
  }, [])
  const layers = [
    { label: 'BRONZE', sublabel: 'orders_raw', desc: '@dlt.table + Auto Loader', color: '#92400e', bg: '#fef3c7', expectations: null },
    { label: 'SILVER', sublabel: 'orders', desc: '@dlt.expect_or_drop(valid_order_id)\n@dlt.expect_or_drop(valid_amount)', color: '#1e40af', bg: '#dbeafe', expectations: '2 expectations enforced' },
    { label: 'GOLD', sublabel: 'revenue_by_day', desc: 'dlt.read("orders")\n.groupBy("order_date").agg(...)', color: '#92400e', bg: '#fef9c3', expectations: null },
  ]
  return (
    <div className="anim-wrap" style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4, fontSize: '.9rem' }}>DLT Pipeline  -  Bronze → Silver → Gold</div>
      <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: 12 }}>DLT manages execution order, retries, and lineage automatically.</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {layers.map((l, i) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-lg)', background: active === i ? l.bg : 'white', border: `2px solid ${active === i ? l.color : 'var(--border)'}`, transition: 'all .4s' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 800, color: l.color, letterSpacing: '.05em' }}>{l.label}</div>
              <div style={{ fontSize: '.72rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{l.sublabel}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--text-3)', marginTop: 4, whiteSpace: 'pre-line' }}>{l.desc}</div>
              {l.expectations && <div style={{ fontSize: '.62rem', marginTop: 4, padding: '2px 6px', background: '#dcfce7', color: '#166534', borderRadius: 4, display: 'inline-block' }}>{l.expectations}</div>}
            </div>
            {i < layers.length - 1 && <div style={{ fontSize: '1.2rem', margin: '0 4px', color: active > i ? '#22c55e' : 'var(--border)' }}>→</div>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: '.75rem', color: 'var(--text-3)' }}>
        Active layer: <strong style={{ color: layers[active].color }}>{layers[active].label}  -  {layers[active].sublabel}</strong>
      </div>
    </div>
  )
}
