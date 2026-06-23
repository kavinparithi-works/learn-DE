import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 8 - Delta Lake', items: [
    { id: 'delta-intro', label: 'Delta Lake and Transaction Log' },
    { id: 'delta-acid', label: 'ACID Operations and MERGE' },
    { id: 'delta-time-travel', label: 'Time Travel and CDF' },
    { id: 'delta-optimize', label: 'OPTIMIZE, VACUUM, Z-ORDER' },
  ]},
  { title: 'Databricks + Unity Catalog', items: [
    { id: 'databricks-uc', label: 'Unity Catalog Governance' },
    { id: 'databricks-dlt', label: 'Delta Live Tables (DLT)' },
    { id: 'databricks-autoloader', label: 'Auto Loader (cloudFiles)' },
    { id: 'databricks-lakeflow', label: 'Lakeflow and Workflows' },
  ]},
]

export default function Delta({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('delta-intro')
  const sectionRefs = useRef<Record<string, HTMLElement>>({})
  const scrollTo = (id: string) => { setActiveId(id); sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
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

        <section id="delta-intro" ref={el => { if (el) sectionRefs.current['delta-intro'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Delta Lake and the Transaction Log</h1>
            <p className="topic-desc">Delta Lake adds ACID transactions to Parquet files stored in ADLS Gen2. The transaction log (_delta_log/) is the key innovation - every operation is recorded as a JSON commit entry.</p>
          </div>
          <DeltaLogAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>_delta_log/ directory:</strong> Each commit creates a numbered JSON file (00000.json, 00001.json...). Every 10 commits, Delta creates a Parquet checkpoint for faster reads. The transaction log enables ACID, time travel, and schema enforcement - all without a separate metastore.
            </div>
          </div>
          <CodeBlock lang="python">{`# Delta Lake basics
from delta.tables import DeltaTable
from pyspark.sql.functions import col

# Create a Delta table
df.write.format("delta").mode("overwrite").save("/data/delta/orders")

# Or using SQL
spark.sql("""
    CREATE TABLE silver.orders (
        order_id BIGINT NOT NULL,
        customer_id INT NOT NULL,
        amount DECIMAL(18,2),
        status STRING,
        created_at TIMESTAMP
    )
    USING DELTA
    PARTITIONED BY (date_trunc('day', created_at))
    LOCATION 'abfss://silver@myaccount.dfs.core.windows.net/orders'
""")

# Inspect the transaction log
spark.read.json("/data/delta/orders/_delta_log/00000000000000000000.json").show()

# Table history
DeltaTable.forName(spark, "silver.orders").history().show()
# Shows: version, timestamp, operation (WRITE, MERGE, DELETE), metrics`}</CodeBlock>
          <Quiz topicId="delta-intro" questions={[
            { question: "What is stored in the _delta_log/ directory?", options: ["The actual data files", "JSON files recording every commit - the transaction log enabling ACID and time travel", "Schema definitions", "Partition statistics"], correct: 1 },
            { question: "How often does Delta Lake create a Parquet checkpoint?", options: ["Every commit", "Every 10 commits (by default)", "Every hour", "On demand only"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-intro'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="delta-acid" ref={el => { if (el) sectionRefs.current['delta-acid'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">ACID Operations and MERGE</h1>
          </div>
          <CodeBlock lang="python">{`from delta.tables import DeltaTable
from pyspark.sql import functions as F

target = DeltaTable.forName(spark, "silver.customers")

# MERGE (upsert) - most important Delta operation
target.alias("t").merge(
    source=updates_df.alias("s"),
    condition="t.customer_id = s.customer_id"
).whenMatchedUpdate(
    condition="s.updated_at > t.updated_at",
    set={
        "name": "s.name",
        "email": "s.email",
        "updated_at": "s.updated_at"
    }
).whenNotMatchedInsert(
    values={
        "customer_id": "s.customer_id",
        "name": "s.name",
        "email": "s.email",
        "created_at": "s.created_at",
        "updated_at": "s.updated_at"
    }
).whenNotMatchedBySourceDelete() \\  # delete rows not in source (full sync)
.execute()

# DELETE
DeltaTable.forName(spark, "silver.events") \\
    .delete(condition=F.col("event_time") < "2020-01-01")

# UPDATE
DeltaTable.forName(spark, "silver.orders") \\
    .update(condition=F.col("status") == "pending",
            set={"status": F.lit("cancelled")})`}</CodeBlock>
          <Quiz topicId="delta-acid" questions={[
            { question: "What does MERGE's whenNotMatchedBySourceDelete() do?", options: ["Deletes duplicate records", "Deletes target rows that have no corresponding row in the source", "Deletes empty partitions", "Deletes the merge result"], correct: 1 },
            { question: "How does Delta Lake implement ACID at the storage level?", options: ["It locks files", "Optimistic concurrency via transaction log - commits succeed only if no conflicting operation ran", "It uses a separate database", "It copies data on every write"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-acid'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="delta-time-travel" ref={el => { if (el) sectionRefs.current['delta-time-travel'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">Time Travel and Change Data Feed</h1>
          </div>
          <CodeBlock lang="python">{`# Time Travel - query historical versions
df_v5 = spark.read.format("delta").option("versionAsOf", 5).table("silver.orders")
df_yesterday = spark.read.format("delta").option("timestampAsOf", "2024-01-14").table("silver.orders")

# SQL syntax
spark.sql("SELECT * FROM silver.orders VERSION AS OF 5")
spark.sql("SELECT * FROM silver.orders TIMESTAMP AS OF '2024-01-14'")

# Restore to previous version (dangerous! creates new version)
DeltaTable.forName(spark, "silver.orders").restoreToVersion(5)

# Change Data Feed (CDF) - track row-level changes
# Enable CDF
spark.sql("ALTER TABLE silver.customers SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')")

# Read changes between versions (for incremental processing)
changes = spark.read.format("delta") \\
    .option("readChangeFeed", "true") \\
    .option("startingVersion", 10) \\
    .option("endingVersion", 20) \\
    .table("silver.customers")

# CDF adds columns: _change_type (insert/update_preimage/update_postimage/delete)
changes.filter("_change_type = 'update_postimage'").show()`}</CodeBlock>
          <Quiz topicId="delta-time-travel" questions={[
            { question: "What enables time travel in Delta Lake?", options: ["S3 versioning", "The transaction log records all historical versions of data files", "A separate audit database", "Incremental backups"], correct: 1 },
            { question: "What does Change Data Feed (CDF) provide?", options: ["Schema evolution tracking", "Row-level change tracking (insert/update/delete) for incremental processing", "Automatic data backups", "Real-time streaming"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-time-travel'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="delta-optimize" ref={el => { if (el) sectionRefs.current['delta-optimize'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 8 - Delta Lake</div>
            <h1 className="topic-title">OPTIMIZE, VACUUM, Z-ORDER</h1>
          </div>
          <CodeBlock lang="sql">{`-- OPTIMIZE: compact small files into 1GB files (default target)
-- Small files are the #1 performance killer in data lakes
OPTIMIZE silver.events;

-- Z-ORDER: co-locate related data in the same files for query skipping
-- Use on high-cardinality columns used in WHERE clauses
OPTIMIZE silver.events ZORDER BY (user_id, event_time);

-- VACUUM: delete old data files no longer referenced by transaction log
-- Default retention = 7 days (for time travel safety)
VACUUM silver.events;
VACUUM silver.events RETAIN 168 HOURS;  -- 7 days explicitly

-- WARNING: don't set retention < 7 days if using concurrent reads
-- VACUUM with 0 hours (dangerous - breaks time travel):
SET spark.databricks.delta.retentionDurationCheck.enabled = false;
VACUUM silver.events RETAIN 0 HOURS;  -- only for one-time cleanup

-- ANALYZE TABLE: update statistics for Catalyst optimizer
ANALYZE TABLE silver.events COMPUTE STATISTICS FOR ALL COLUMNS;

-- Liquid Clustering (Databricks) - replaces partition + Z-ORDER
ALTER TABLE silver.events CLUSTER BY (user_id, event_date);`}</CodeBlock>
          <Quiz topicId="delta-optimize" questions={[
            { question: "Why is OPTIMIZE important for Delta Lake tables?", options: ["It compresses data", "It compacts many small files into fewer large files, dramatically improving read performance", "It updates statistics", "It removes duplicates"], correct: 1 },
            { question: "What is Z-ORDER in Delta Lake?", options: ["A sorting algorithm", "Multi-dimensional clustering that co-locates data with similar values in the same files, enabling data skipping", "A compression format", "A partitioning strategy"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('delta-optimize'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-uc" ref={el => { if (el) sectionRefs.current['databricks-uc'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Unity Catalog - Data Governance</h1>
            <p className="topic-desc">Unity Catalog is Databricks' unified governance layer. Three-level namespace: catalog.schema.table. Single place to manage permissions, lineage, and data discovery across all workspaces.</p>
          </div>
          <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 24, fontFamily: 'var(--font-mono)', fontSize: '.82rem' }}>
            <div style={{ marginBottom: 8, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Unity Catalog Namespace</div>
            {[
              { indent: 0, label: 'catalog: production', icon: '🏛️', color: '#4f8ef7' },
              { indent: 1, label: 'schema: bronze', icon: '🗂️', color: '#94a3b8' },
              { indent: 2, label: 'table: events_raw', icon: '📋', color: '#22c55e' },
              { indent: 2, label: 'table: users_raw', icon: '📋', color: '#22c55e' },
              { indent: 1, label: 'schema: silver', icon: '🗂️', color: '#94a3b8' },
              { indent: 2, label: 'table: events', icon: '📋', color: '#22c55e' },
              { indent: 1, label: 'schema: gold', icon: '🗂️', color: '#f59e0b' },
              { indent: 2, label: 'table: revenue_daily', icon: '📋', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} style={{ paddingLeft: item.indent * 20, color: item.color, marginBottom: 4 }}>
                {item.icon} {item.label}
              </div>
            ))}
          </div>
          <CodeBlock lang="sql">{`-- Unity Catalog permissions (fine-grained)
GRANT USE CATALOG ON CATALOG production TO group_data_engineers;
GRANT USE SCHEMA  ON SCHEMA production.bronze TO group_data_engineers;
GRANT SELECT      ON TABLE production.bronze.events_raw TO group_analysts;
GRANT MODIFY      ON TABLE production.silver.events TO group_data_engineers;

-- Row-level security (Unity Catalog)
CREATE ROW FILTER filter_by_region
    ON TABLE production.silver.orders (region STRING)
RETURN region = current_user_region();  -- each user sees only their region

-- Column masking (PII)
CREATE COLUMN MASK mask_email
ON TABLE production.silver.users (email STRING)
RETURN CASE WHEN is_account_group_member('pii_readers')
            THEN email
            ELSE regexp_replace(email, '(.+)@', '***@') END;

-- Data lineage (automatic in Unity Catalog)
-- Shows: which pipelines write to production.silver.events
-- Shows: which dashboards read from production.gold.revenue_daily`}</CodeBlock>
          <Quiz topicId="databricks-uc" questions={[
            { question: "What is the three-level namespace in Unity Catalog?", options: ["database.schema.view", "catalog.schema.table", "workspace.catalog.table", "account.database.table"], correct: 1 },
            { question: "What does Unity Catalog provide beyond table access control?", options: ["Only permissions", "Unified governance: permissions, data lineage, column masking, row filters, and discovery across all workspaces", "Only schema management", "Only audit logs"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-uc'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-dlt" ref={el => { if (el) sectionRefs.current['databricks-dlt'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Delta Live Tables (DLT)</h1>
            <p className="topic-desc">DLT is Databricks' declarative ETL framework. You declare WHAT the data should look like; DLT handles execution, retries, monitoring, and lineage automatically.</p>
          </div>
          <CodeBlock lang="python">{`import dlt
from pyspark.sql.functions import col, to_timestamp

# BRONZE - raw ingestion
@dlt.table(
    name="events_raw",
    comment="Raw events from Event Hub",
    table_properties={"quality": "bronze"}
)
def events_raw():
    return (
        spark.readStream
        .format("cloudFiles")
        .option("cloudFiles.format", "json")
        .option("cloudFiles.schemaLocation", "/checkpoints/schema/events")
        .load("abfss://raw@myaccount.dfs.core.windows.net/events/")
    )

# SILVER - clean with expectations (data quality)
@dlt.table(name="events", table_properties={"quality": "silver"})
@dlt.expect_or_drop("valid_event_id", "event_id IS NOT NULL")
@dlt.expect_or_drop("valid_amount", "amount >= 0")
@dlt.expect("valid_user", "user_id IS NOT NULL")  # warn but keep
def events():
    return (
        dlt.read_stream("events_raw")
        .withColumn("event_time", to_timestamp("event_time_str"))
        .withColumn("amount", col("amount").cast("decimal(18,2)"))
        .dropDuplicates(["event_id"])
    )

# GOLD - aggregation
@dlt.table(name="revenue_daily", table_properties={"quality": "gold"})
def revenue_daily():
    return (
        dlt.read("events")
        .groupBy(col("event_date"), col("product_id"))
        .agg(F.sum("amount").alias("revenue"), F.count("*").alias("events"))
    )`}</CodeBlock>
          <Quiz topicId="databricks-dlt" questions={[
            { question: "What is @dlt.expect_or_drop() in Delta Live Tables?", options: ["A performance hint", "A data quality constraint that drops rows violating the expectation", "A table property", "A streaming option"], correct: 1 },
            { question: "What is the key difference between DLT's declarative approach vs regular Spark?", options: ["DLT is faster", "With DLT you declare WHAT the result should be; DLT handles execution, lineage, retries, and monitoring", "DLT uses SQL only", "DLT doesn't support streaming"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-dlt'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-autoloader" ref={el => { if (el) sectionRefs.current['databricks-autoloader'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Auto Loader (cloudFiles)</h1>
          </div>
          <CodeBlock lang="python">{`# Auto Loader: incrementally ingest new files from ADLS Gen2/S3
# Uses file notifications (Event Grid) to detect new files efficiently

df = spark.readStream \\
    .format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", "/checkpoints/schema/events") \\
    .option("cloudFiles.inferColumnTypes", "true") \\
    .option("cloudFiles.maxFilesPerTrigger", 1000) \\
    .option("cloudFiles.useNotifications", "true") \\  # Event Grid (efficient)
    .load("abfss://raw@myaccount.dfs.core.windows.net/events/")

df.writeStream \\
    .format("delta") \\
    .option("checkpointLocation", "/checkpoints/autoloader-events") \\
    .option("mergeSchema", "true") \\  # schema evolution
    .trigger(availableNow=True) \\  # process all pending files once
    .table("bronze.events_raw")

# Schema evolution: Auto Loader detects new columns and adds them
# .option("cloudFiles.schemaEvolutionMode", "addNewColumns")  # default`}</CodeBlock>
          <Quiz topicId="databricks-autoloader" questions={[
            { question: "What does Auto Loader's cloudFiles.useNotifications=true do?", options: ["Sends email notifications", "Uses Azure Event Grid to get notified of new files instead of listing the entire directory", "Notifies when schema changes", "Sends Slack alerts"], correct: 1 },
            { question: "What is the benefit of trigger(availableNow=True) in Auto Loader?", options: ["Runs continuously", "Processes all currently available files then stops (batch mode)", "Runs on a schedule", "Triggers on file count threshold"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-autoloader'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="databricks-lakeflow" ref={el => { if (el) sectionRefs.current['databricks-lakeflow'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Databricks + Unity Catalog</div>
            <h1 className="topic-title">Lakeflow and Databricks Workflows</h1>
          </div>
          <CodeBlock lang="json">{`// Databricks Workflow (Lakeflow) - orchestrate DLT + Notebooks + SQL
{
  "name": "Daily Gold Layer Pipeline",
  "schedule": { "quartz_cron_expression": "0 30 2 * * ?", "timezone_id": "UTC" },
  "tasks": [
    {
      "task_key": "ingest_bronze",
      "pipeline_task": { "pipeline_id": "dlt-pipeline-id" }
    },
    {
      "task_key": "compute_gold",
      "depends_on": [{"task_key": "ingest_bronze"}],
      "notebook_task": {
        "notebook_path": "/Pipelines/Gold/ComputeRevenue",
        "base_parameters": { "date": "{{ds}}" }
      },
      "job_cluster_key": "gold-compute-cluster"
    },
    {
      "task_key": "dq_check",
      "depends_on": [{"task_key": "compute_gold"}],
      "sql_task": { "query": { "query_id": "dq-revenue-check-query-id" } }
    }
  ],
  "job_clusters": [{
    "job_cluster_key": "gold-compute-cluster",
    "new_cluster": {
      "spark_version": "14.3.x-scala2.12",
      "node_type_id": "Standard_DS4_v2",
      "num_workers": 4
    }
  }]
}`}</CodeBlock>
          <Quiz topicId="databricks-lakeflow" questions={[
            { question: "What is Lakeflow in Databricks?", options: ["A data format", "Databricks' workflow orchestration product that manages DLT pipelines, notebook jobs, and SQL tasks", "A storage layer", "A visualization tool"], correct: 1 },
            { question: "What does 'depends_on' in a Databricks Workflow task do?", options: ["Sets task priority", "Defines task ordering - the task waits for all dependencies to succeed before running", "Shares data between tasks", "Enables parallel execution"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('databricks-lakeflow'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

      </main>
    </div>
  )
}

function DeltaLogAnimation() {
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setVersion(v => (v + 1) % 5), 2000)
    return () => clearInterval(t)
  }, [])
  const commits = [
    { ver: 0, op: 'CREATE TABLE', color: '#4f8ef7' },
    { ver: 1, op: 'WRITE (batch)', color: '#22c55e' },
    { ver: 2, op: 'MERGE (upsert)', color: '#f59e0b' },
    { ver: 3, op: 'OPTIMIZE', color: '#8b5cf6' },
    { ver: 4, op: 'DELETE rows', color: '#ef4444' },
  ]
  return (
    <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>Delta Transaction Log (_delta_log/)</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {commits.map(c => (
          <div key={c.ver} style={{
            padding: '8px 14px', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${c.color}`,
            background: version >= c.ver ? c.color + '20' : 'white',
            transition: 'background .4s',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: c.color, fontWeight: 700 }}>0000{c.ver}.json</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 2 }}>{c.op}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: '.8rem', color: 'var(--text-3)' }}>
        Current version: <strong style={{ color: 'var(--blue-600)' }}>{version}</strong> - you can query any historical version with TIME TRAVEL
      </div>
    </div>
  )
}
