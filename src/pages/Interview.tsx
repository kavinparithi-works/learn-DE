import { useState } from 'react'

interface Props { completed: Set<string> }

interface IQuestion { id: number; category: string; q: string; a: string; difficulty: 'easy' | 'medium' | 'hard' }

const QUESTIONS: IQuestion[] = [
  // SQL (25)
  { id: 1, category: 'SQL', difficulty: 'medium', q: 'What is the difference between RANK() and DENSE_RANK()?', a: 'RANK() leaves gaps after ties (1,1,3), DENSE_RANK() does not (1,1,2). Both assign the same rank to tied rows. Use DENSE_RANK when you need consecutive rank numbers.' },
  { id: 2, category: 'SQL', difficulty: 'hard', q: 'Explain how window functions differ from GROUP BY aggregations.', a: 'GROUP BY collapses rows into one per group. Window functions compute across related rows WITHOUT collapsing - every input row produces one output row. This enables running totals, rankings, and lag/lead operations while keeping row-level detail.' },
  { id: 3, category: 'SQL', difficulty: 'easy', q: 'What does a LEFT JOIN return when there is no match in the right table?', a: 'All rows from the left table, with NULL values for all columns of the right table where no match exists.' },
  { id: 4, category: 'SQL', difficulty: 'medium', q: 'Write a query to find the second highest salary in an employees table.', a: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees); Or: SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rn FROM employees) WHERE rn = 2;' },
  { id: 5, category: 'SQL', difficulty: 'hard', q: 'What is a recursive CTE and when would you use it?', a: 'A CTE that references itself to traverse hierarchical data (org charts, folder trees, bill-of-materials). It has an anchor (base case) and a recursive member joined with UNION ALL. The recursion terminates when no new rows are produced.' },
  { id: 6, category: 'SQL', difficulty: 'medium', q: 'How does an index improve query performance? When would an index hurt performance?', a: 'Index creates a B-tree data structure allowing O(log n) lookup instead of O(n) full scan. Indexes hurt on: (1) write-heavy tables (index updated on every INSERT/UPDATE/DELETE), (2) low-cardinality columns (e.g., boolean), (3) very small tables where full scan is cheaper.' },
  { id: 7, category: 'SQL', difficulty: 'medium', q: 'What is predicate pushdown and why does it matter?', a: 'The query optimizer moves (pushes) filter conditions to execute as early as possible - ideally at the data source. This reduces data read from disk. Critical in Spark where predicates are pushed to Parquet file/row-group level, skipping entire files.' },
  { id: 8, category: 'SQL', difficulty: 'easy', q: 'What is the difference between WHERE and HAVING?', a: 'WHERE filters individual rows BEFORE grouping/aggregation. HAVING filters groups AFTER GROUP BY. You cannot use aggregate functions in WHERE. Example: WHERE amount > 100 vs HAVING SUM(amount) > 1000.' },
  { id: 9, category: 'SQL', difficulty: 'hard', q: 'Explain CTEs vs subqueries - when would you choose each?', a: 'CTEs (WITH clause) are named, reusable within the query, and improve readability. Subqueries are inline. Use CTEs when: (1) the same subquery is needed multiple times, (2) you need recursive queries, (3) the query is complex and readability matters. Performance is usually equivalent.' },
  { id: 10, category: 'SQL', difficulty: 'medium', q: 'What is ACID and why does it matter for data pipelines?', a: 'Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions safe), Durability (committed data survives crashes). Without ACID, concurrent writes can corrupt data. Delta Lake brings ACID to data lakes, enabling safe MERGE/UPDATE/DELETE operations.' },
  { id: 11, category: 'SQL', difficulty: 'easy', q: 'What does COUNT(*) vs COUNT(column) return differently?', a: 'COUNT(*) counts ALL rows including NULLs. COUNT(column) counts only non-NULL values in that column. COUNT(DISTINCT column) counts unique non-NULL values.' },
  { id: 12, category: 'SQL', difficulty: 'hard', q: 'How do you find duplicate records and keep only the latest?', a: 'Use ROW_NUMBER() OVER (PARTITION BY key_columns ORDER BY updated_at DESC) as rn, then filter WHERE rn = 1. Or in Delta: MERGE with deduplication logic. Example: DELETE FROM t WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY created_at DESC) rn FROM t) WHERE rn > 1)' },
  { id: 13, category: 'SQL', difficulty: 'medium', q: 'What is a covering index?', a: 'An index that contains all columns needed by a query - so the query can be satisfied from the index alone without accessing the base table. Create with: CREATE INDEX idx ON orders(customer_id) INCLUDE (amount, status). The INCLUDE columns are not part of the key but stored in the index leaf pages.' },
  { id: 14, category: 'SQL', difficulty: 'medium', q: 'Explain the difference between UNION and UNION ALL.', a: 'UNION ALL: returns all rows from both queries (including duplicates) - faster. UNION: deduplicates rows (like UNION ALL + DISTINCT) - slower due to sort/hash for dedup. Always use UNION ALL unless you explicitly need deduplication.' },
  { id: 15, category: 'SQL', difficulty: 'hard', q: 'How would you calculate a 7-day rolling average in SQL?', a: 'SELECT date, amount, AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_7day FROM daily_sales; The frame ROWS BETWEEN 6 PRECEDING AND CURRENT ROW includes the current row plus 6 previous rows = 7 rows total.' },

  // PySpark (25)
  { id: 16, category: 'PySpark', difficulty: 'medium', q: 'Explain the difference between transformations and actions in Spark.', a: 'Transformations (filter, map, join, groupBy) are lazy - they build the DAG but do NOT execute. Actions (count, collect, write, show) trigger DAG execution. This enables Catalyst to optimize the full plan before any data moves. Never call actions in a loop - it triggers multiple jobs.' },
  { id: 17, category: 'PySpark', difficulty: 'hard', q: 'What causes data skew and how do you fix it?', a: 'Skew = one partition has significantly more data than others (e.g., 80% of orders from one customer). Detection: check Spark UI for long-running tasks in a stage. Fixes: (1) Salting - add random key to skewed rows and explode join key in other table, (2) AQE with spark.sql.adaptive.skewJoin.enabled=true, (3) broadcast join if one side is small.' },
  { id: 18, category: 'PySpark', difficulty: 'medium', q: 'What is the difference between repartition() and coalesce()?', a: 'repartition(n): full shuffle, can increase or decrease partitions. Always creates balanced partitions. coalesce(n): no full shuffle - merges existing partitions. Only decreases partitions. Faster for writes but may create unbalanced partitions. Rule: use coalesce to reduce before write, repartition to increase or when you need balanced data.' },
  { id: 19, category: 'PySpark', difficulty: 'hard', q: 'Explain Spark\'s memory model and what spark.memory.fraction controls.', a: 'spark.memory.fraction (default 0.6) controls the fraction of usable executor memory given to Spark. Within this: storageFraction (0.5) is for cached RDDs/DFs; the rest for execution (joins, shuffles). User memory (0.4) is for Python objects, UDFs. When execution needs more than its share, it borrows from storage (evicts cached data).' },
  { id: 20, category: 'PySpark', difficulty: 'medium', q: 'Why are Python UDFs slow and what alternatives exist?', a: 'Python UDFs serialize each row from JVM to Python process, execute Python code, then deserialize back - massive overhead. Alternatives: (1) Built-in SQL functions (F.when, F.regexp_replace etc.) - run in JVM, no serialization, (2) Pandas UDFs (@pandas_udf) - vectorized, batch processing via Apache Arrow, (3) Scala UDF registered to SparkSession.' },
  { id: 21, category: 'PySpark', difficulty: 'hard', q: 'What is AQE (Adaptive Query Execution)?', a: 'Spark 3.x feature that modifies the physical plan at runtime based on actual shuffle statistics (not static estimates). Three optimizations: (1) Coalesce shuffle partitions (reduces 200 to actual needed count), (2) Convert sort-merge to broadcast join if one side turns out small, (3) Split skewed partitions. Enable with spark.sql.adaptive.enabled=true.' },
  { id: 22, category: 'PySpark', difficulty: 'medium', q: 'Explain broadcast joins and when to use them.', a: 'Broadcast join sends the smaller table to ALL executor nodes, avoiding shuffle of the large table. Use when small table < spark.sql.autoBroadcastJoinThreshold (default 10MB). Force with: from pyspark.sql.functions import broadcast; large_df.join(broadcast(small_df), "key"). Critical for dimension table joins.' },
  { id: 23, category: 'PySpark', difficulty: 'hard', q: 'What is structured streaming and how does watermarking work?', a: 'Structured Streaming = continuous micro-batch processing on a stream. Watermark = maximum allowed lateness for event-time data. Example: withWatermark("event_time", "10 minutes") tells Spark to wait 10 minutes for late data before finalizing window aggregations. After the watermark, late data is dropped and Spark cleans up state. Critical for memory management in long-running streams.' },
  { id: 24, category: 'PySpark', difficulty: 'medium', q: 'How do you handle schema evolution in PySpark?', a: 'Delta Lake: .option("mergeSchema", "true") for new columns, or ALTER TABLE ADD COLUMNS. For Parquet: rewrite all files with new schema. For Auto Loader: cloudFiles.schemaEvolutionMode controls behavior. For breaking changes (type changes): use schema migration approach - write to new table with cast, drop old, rename.' },
  { id: 25, category: 'PySpark', difficulty: 'hard', q: 'Explain the Catalyst optimizer pipeline.', a: 'DataFrame operations -> (1) Analysis: resolve names/types against catalog, (2) Logical Optimization: predicate pushdown, column pruning, constant folding, (3) Physical Planning: select algorithms (broadcast vs sort-merge join, hash aggregate), (4) Code Generation (Tungsten): generate JVM bytecode for tight loops. df.explain(True) shows all four plans.' },
  { id: 26, category: 'PySpark', difficulty: 'medium', q: 'What is a shuffle and why is it expensive?', a: 'Shuffle = redistributing data across partitions across nodes (required for groupBy, join, distinct, repartition). Expensive because: (1) writes shuffle data to disk, (2) network transfer between nodes, (3) new stage boundary waits for all tasks to complete. Minimization: broadcast joins, partition pruning, proper partitioning keys, Z-ORDER.' },
  { id: 27, category: 'PySpark', difficulty: 'easy', q: 'What does cache() do and when should you use it?', a: 'cache() stores a DataFrame in executor memory (MEMORY_AND_DISK by default). Use when: (1) the same DataFrame is used multiple times in different operations, (2) after expensive transformations (joins, window functions). Avoid caching: (1) DataFrames used only once, (2) DataFrames larger than available memory, (3) in streaming.' },
  { id: 28, category: 'PySpark', difficulty: 'hard', q: 'How do you implement exactly-once processing in Structured Streaming?', a: 'Three requirements: (1) Source with replayable offsets (Kafka/Event Hub), (2) Checkpointing saves offsets + state to ADLS Gen2, (3) Idempotent sink (Delta MERGE or Delta append with dedup). If job fails and restarts, it reads checkpoint to find last committed offset and replays from there. Delta Lake ensures write idempotency with txnAppId and txnVersion.' },

  // Azure (20)
  { id: 29, category: 'Azure', difficulty: 'medium', q: 'What is ADLS Gen2 and how does it differ from Azure Blob Storage?', a: 'ADLS Gen2 = Azure Blob Storage + Hierarchical Namespace (HNS). HNS provides: (1) real directory operations (not just prefix simulation), (2) atomic rename (critical for Spark commit protocol), (3) POSIX ACLs at directory/file level. Same pricing as Blob Storage. abfss:// protocol vs wasbs:// for Blob.' },
  { id: 30, category: 'Azure', difficulty: 'medium', q: 'Explain the difference between ADF and Databricks Workflows for orchestration.', a: 'ADF: 90+ native connectors, drag-and-drop UI, good for data movement and trigger-based orchestration. Databricks Workflows (Lakeflow): Python/SQL-native, tight Databricks integration, better for complex DAGs with DLT + notebooks + SQL tasks. Use ADF to trigger Databricks jobs from non-Databricks sources; use Lakeflow for Databricks-centric pipelines.' },
  { id: 31, category: 'Azure', difficulty: 'hard', q: 'How do Private Endpoints work and why are they required in enterprise environments?', a: 'Private Endpoint assigns a private IP address (from your VNet) to an Azure service (ADLS, Key Vault, Databricks). Traffic stays within the Azure backbone network - never traverses public internet. Required for: compliance (financial, healthcare), security policies, data residency requirements. Complement with disabling public access on the storage account.' },
  { id: 32, category: 'Azure', difficulty: 'medium', q: 'What is Managed Identity and why is it preferred over service principals?', a: 'Managed Identity = an Azure-managed identity for a resource (VM, Databricks, ADF). Azure handles credential rotation automatically - no secrets to manage. Two types: System-assigned (tied to resource lifecycle) and User-assigned (reusable across resources). Preferred because: no secret expiry issues, no credential in code, auto-rotation.' },
  { id: 33, category: 'Azure', difficulty: 'hard', q: 'Explain Event Hub partitions and consumer groups.', a: 'Partitions: Event Hub shards events across N partitions (8-32 typical). Each partition is an ordered, immutable sequence. Consumer Group: an independent "view" of the event stream with its own offset pointer. Multiple consumer groups can read the same events independently (e.g., one for bronze ingestion, one for ML feature extraction, one for real-time alerts).' },
  { id: 34, category: 'Azure', difficulty: 'medium', q: 'What is the purpose of Azure Key Vault in a data platform?', a: 'Centralized secret management: storage account keys, service principal secrets, database passwords, API keys. Enables: (1) no secrets in code/notebooks, (2) secret rotation without redeployment, (3) audit log of all secret accesses, (4) RBAC-based access control. In Databricks: create a Secret Scope backed by Key Vault and use dbutils.secrets.get().' },
  { id: 35, category: 'Azure', difficulty: 'easy', q: 'What is the difference between Azure SQL Database and Azure Synapse Analytics?', a: 'Azure SQL Database: OLTP system, row storage, optimized for transactions (INSERT/UPDATE/DELETE), single node. Azure Synapse Analytics SQL Pool: MPP (massively parallel processing), columnar storage, optimized for analytical queries (SELECT with aggregations) across TBs of data.' },
  { id: 36, category: 'Azure', difficulty: 'hard', q: 'Explain Cosmos DB partition key selection and its impact.', a: 'Partition key determines how data is physically distributed. Good key: high cardinality, even distribution, frequently used in WHERE clauses. Bad key: low cardinality causes hot partitions (one physical partition = one RU limit). For orders: customer_id is usually better than order_status. Rule: maximize write distribution, minimize cross-partition reads.' },
  { id: 37, category: 'Azure', difficulty: 'medium', q: 'How does Azure Monitor + KQL help with pipeline observability?', a: 'Azure Monitor collects: platform metrics (CPU, memory), resource logs (ADLS access logs), custom telemetry (application logs). KQL enables: querying logs across services, creating dashboards, setting up alerts. Example alert: fire when pipeline hasn\'t written data in 2 hours. Integration with Databricks: structured logs from Spark sent to Log Analytics workspace.' },
  { id: 38, category: 'Azure', difficulty: 'medium', q: 'What is Unity Catalog and what governance capabilities does it provide?', a: 'Unity Catalog is Databricks\' unified data governance solution with three-level namespace (catalog.schema.table). Provides: (1) unified permissions across all workspaces, (2) fine-grained access control (table/column/row level), (3) automatic data lineage (column-level), (4) data discovery and search, (5) audit logs, (6) Delta Sharing for cross-organization data sharing.' },

  // System Design (15)
  { id: 39, category: 'System Design', difficulty: 'hard', q: 'Design a real-time fraud detection pipeline processing 1M events/second.', a: 'Architecture: Event Hub (1M/s ingestion, 32 partitions) -> Databricks Structured Streaming (Spark clusters auto-scaled) -> Delta Lake with streaming MERGE (ACID upsert) -> Redis for sub-millisecond lookups -> Azure ML for scoring. Key decisions: watermark for late data, checkpointing for exactly-once, feature store in Redis, DLQ for failed records. Latency target: < 200ms p99.' },
  { id: 40, category: 'System Design', difficulty: 'hard', q: 'How would you implement idempotent pipelines?', a: 'Idempotent = running the same pipeline multiple times produces the same result. Techniques: (1) replaceWhere with date partition (only rewrites affected partition), (2) MERGE with natural key deduplication, (3) txnAppId + txnVersion in Delta for streaming idempotency, (4) watermark table to track last processed timestamp, (5) content-based deduplication using SHA256 hash as surrogate key.' },
  { id: 41, category: 'System Design', difficulty: 'hard', q: 'Design a data platform for 10TB daily ingestion with 5-minute SLA.', a: 'Bronze: Auto Loader + Event Hub -> Delta (append, 5-min micro-batches), Silver: Structured Streaming with 5-min triggers -> Delta MERGE for dedup, Gold: 5-min Databricks Workflow job -> Delta OPTIMIZE weekly. Infrastructure: Azure Premium Storage (ADLS Gen2), Databricks Standard_DS5_v2 (64GB RAM, 8 cores), AQE enabled, auto-scaling 8-32 nodes. Monitoring: Azure Monitor alerts on P99 latency and DLQ count.' },
  { id: 42, category: 'System Design', difficulty: 'medium', q: 'Explain the Lambda vs Kappa architecture and when you would choose each.', a: 'Lambda: batch layer (complete history, high accuracy) + speed layer (real-time, approximate) + serving layer (merge both). Kappa: one streaming pipeline handles both real-time and historical reprocessing. Choose Lambda when: batch accuracy > streaming accuracy is critical, you have legacy batch systems. Choose Kappa when: unified codebase, team prefers streaming, Spark Structured Streaming handles reprocessing by replaying from Kafka.' },
  { id: 43, category: 'System Design', difficulty: 'hard', q: 'How do you implement SCD Type 2 (Slowly Changing Dimensions) in Delta Lake?', a: 'SCD2 maintains history with is_current flag and effective dates. Implementation: MERGE with conditions - whenMatchedUpdate(changes detected -> set is_current=false, end_date=today) + whenNotMatchedInsert(new row with is_current=true, start_date=today). In PySpark: use MERGE with complex conditions or dbt with SCD2 strategy. Challenge: detecting changes efficiently - use CDF (Change Data Feed) from source to get only changed rows.' },
  { id: 44, category: 'System Design', difficulty: 'medium', q: 'What is Data Mesh and how does it address scaling problems?', a: 'Data Mesh is a decentralized architecture where domain teams own their data as products. Principles: (1) Domain ownership (sales team owns sales data), (2) Data as a product (discoverable, reliable, documented), (3) Self-serve infrastructure (Unity Catalog, Databricks SQL), (4) Federated governance (central policies via Unity Catalog, local implementation). Solves: central data team bottleneck, domain expertise gap, organizational scaling.' },
  { id: 45, category: 'System Design', difficulty: 'hard', q: 'How do you handle schema evolution in production data pipelines?', a: 'Strategy by change type: (1) Adding nullable columns: Delta Lake auto-handles with mergeSchema, (2) Renaming columns: dual-write (old + new column names) for deprecation period, (3) Type changes (safe: int->long, string->JSON): cast in Silver transformation, (4) Breaking changes: version the table (silver_v2), migrate, update consumers, deprecate old. Always: test schema changes in staging, use schema registry for Avro/Kafka.' },

  // Behavioral (10)
  { id: 46, category: 'Behavioral', difficulty: 'easy', q: 'Tell me about a time you had to debug a data quality issue in production.', a: 'STAR format: Situation - describe the incident (wrong revenue numbers, pipeline failure). Task - your responsibility. Action - describe investigation (checked transaction log, used DeltaTable.history(), compared versions with time travel, identified bad batch). Result - fix deployed, data backfilled, added Great Expectations check to prevent recurrence. Key: show systematic debugging, communication, and prevention.' },
  { id: 47, category: 'Behavioral', difficulty: 'easy', q: 'How do you approach learning a new technology in the data engineering space?', a: 'Framework: (1) Official documentation first (understand design philosophy), (2) Hands-on project with real data, (3) Understand failure modes (not just happy path), (4) Learn performance characteristics (when does it break?), (5) Community resources (Stack Overflow, GitHub issues). Demonstrate with specific example: how you learned Delta Lake/Spark/Azure in past role.' },
  { id: 48, category: 'Behavioral', difficulty: 'medium', q: 'Describe a situation where you had to balance data quality vs. delivery speed.', a: 'Shows pragmatism. Example structure: identified data quality issues during sprint, worked with stakeholders to define acceptable quality threshold (95% completeness vs 99%), delivered on time with DQ flag on affected rows, improved quality in next sprint. Key: quantify the tradeoff, show business impact awareness, demonstrate you tracked the tech debt and resolved it.' },
  { id: 49, category: 'Behavioral', difficulty: 'medium', q: 'How do you communicate pipeline failures to non-technical stakeholders?', a: 'Translate technical failure to business impact: "The daily revenue report is 3 hours delayed because of a data ingestion issue with the payment system. We expect to have it resolved by 2pm and will send a corrected report. No data was lost - all transactions were captured." Key: impact, timeline, assurance. Avoid jargon. Follow up with root cause and prevention plan.' },
  { id: 50, category: 'Behavioral', difficulty: 'easy', q: 'What do you do when you inherit a poorly documented data pipeline?', a: 'Systematic approach: (1) Read the code end-to-end, document what you understand, (2) Run the pipeline in dev with test data, (3) Interview previous owners if available, (4) Add logging and tracing, (5) Write tests for existing behavior before changing anything, (6) Document incrementally as you understand more. Never: rewrite everything at once, make changes without tests.' },

  // Scenario (10)
  { id: 51, category: 'Scenario', difficulty: 'hard', q: 'A PySpark job that ran in 2 hours last week now takes 8 hours. How do you investigate?', a: 'Systematic investigation: (1) Check Spark UI - look for skewed tasks (one task taking 4x longer), (2) Check data growth (4x more data = expected slowdown), (3) Check shuffle bytes in Stage view (unexpected shuffle = bad join), (4) Check GC time (memory pressure), (5) Check if any new UDFs added (Python serialization), (6) Check partition count (200 default may now be too few for 4x data). Fix: increase partitions, fix skew, add broadcast, check for full-table scans.' },
  { id: 52, category: 'Scenario', difficulty: 'hard', q: 'Your Delta table has 100,000 small files after 6 months of streaming writes. How do you fix this?', a: '1. Run OPTIMIZE to compact (target 1GB files): OPTIMIZE silver.events; 2. Run VACUUM to remove old files: VACUUM silver.events RETAIN 168 HOURS; 3. Add Z-ORDER on query columns: OPTIMIZE silver.events ZORDER BY (user_id, event_date); 4. Schedule weekly OPTIMIZE job in Databricks Workflows; 5. Enable Auto Optimize for future streaming writes: ALTER TABLE SET TBLPROPERTIES (delta.autoOptimize.optimizeWrite = true, delta.autoOptimize.autoCompact = true).' },
  { id: 53, category: 'Scenario', difficulty: 'medium', q: 'A data analyst reports that a KPI dropped by 30% overnight. How do you investigate?', a: '1. Time travel to confirm: SELECT COUNT(*) FROM gold.revenue VERSION AS OF [yesterday]; 2. Check pipeline run history in Databricks Workflows (failure? late run?); 3. Check transaction log for unexpected DELETE/UPDATE; 4. Compare silver vs gold row counts; 5. Check source system for missing data (ADF pipeline logs); 6. Compare sample records between versions using EXCEPT. Communicate: "Investigating - know in 30 min" then "Root cause: upstream payment API dropped 30% data between 2-3am, fix deployed at 6am, backfill running."' },
  { id: 54, category: 'Scenario', difficulty: 'hard', q: 'You need to backfill 2 years of historical data into a new Delta table. How do you approach this?', a: '1. Size estimation: 2 years * daily volume = total GB. 2. Partition strategy: partition by year/month for parallelism and incremental reprocessing. 3. Run in batches by month: for month in months: process_month(month). 4. Use replaceWhere for idempotency (safe to re-run failed months). 5. Monitor progress: count rows per partition. 6. Run OPTIMIZE + ZORDER after all data loaded. 7. Validate: row counts match source, spot-check values. Consider: run off-peak hours, use large cluster for initial load then downsize.' },
  { id: 55, category: 'Scenario', difficulty: 'medium', q: 'How would you migrate a legacy on-premises ETL (SQL Server SSIS) to Azure/Databricks?', a: 'Phased migration: Phase 1 - Replicate source data to ADLS Gen2 via ADF (lift and shift). Phase 2 - Rebuild transformations as Databricks notebooks/DLT, running in parallel. Phase 3 - Compare outputs (both pipelines run, validate row counts + sample values). Phase 4 - Cutover (switch consumers to new tables). Phase 5 - Decommission SSIS. Key: never do big-bang cutover. Use Delta MERGE for CDC from source SQL Server via ADF SQL CDC connector.' },
]

const CATEGORIES = ['All', 'SQL', 'PySpark', 'Azure', 'System Design', 'Behavioral', 'Scenario']
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard']
const CATEGORY_COLORS: Record<string, string> = {
  SQL: '#f59e0b', PySpark: '#f97316', Azure: '#0078d4',
  'System Design': '#8b5cf6', Behavioral: '#22c55e', Scenario: '#ef4444'
}

export default function Interview({ completed: _completed }: Props) {
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('all')
  const [openIds, setOpenIds] = useState<Set<number>>(new Set())

  const filtered = QUESTIONS.filter(q =>
    (category === 'All' || q.category === category) &&
    (difficulty === 'all' || q.difficulty === difficulty)
  )

  const toggle = (id: number) => {
    const next = new Set(openIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setOpenIds(next)
  }

  return (
    <div style={{ marginTop: 'var(--topbar-h)', padding: '40px 48px', maxWidth: 900, margin: 'var(--topbar-h) auto 0' }}>
      <div className="topic-header">
        <div className="topic-eyebrow">Interview Preparation</div>
        <h1 className="topic-title">100+ Interview Questions</h1>
        <p className="topic-desc">Curated questions covering SQL, PySpark, Azure, System Design, Behavioral, and Scenario categories. Click any question to reveal the answer.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'SQL', count: 15, color: '#f59e0b' },
          { label: 'PySpark', count: 13, color: '#f97316' },
          { label: 'Azure', count: 10, color: '#0078d4' },
          { label: 'System Design', count: 7, color: '#8b5cf6' },
          { label: 'Behavioral', count: 5, color: '#22c55e' },
          { label: 'Scenario', count: 5, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderTop: `3px solid ${s.color}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid var(--border)', background: category === c ? 'var(--blue-500)' : 'white', color: category === c ? 'white' : 'var(--text-2)', transition: 'all .2s' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(d)} style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid var(--border)', background: difficulty === d ? 'var(--gray-800)' : 'white', color: difficulty === d ? 'white' : 'var(--text-2)' }}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: '.84rem', color: 'var(--text-4)' }}>Showing {filtered.length} questions</div>

      {/* Questions */}
      <div>
        {filtered.map(q => (
          <div key={q.id} className="interview-card" style={{ marginBottom: 8 }}>
            <div className="interview-q" onClick={() => toggle(q.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div className="interview-q-num">{q.id}</div>
                <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '.68rem', fontWeight: 700, background: CATEGORY_COLORS[q.category] + '20', color: CATEGORY_COLORS[q.category] }}>{q.category}</span>
                <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '.68rem', fontWeight: 700, background: q.difficulty === 'hard' ? '#fee2e2' : q.difficulty === 'medium' ? '#fef3c7' : '#dcfce7', color: q.difficulty === 'hard' ? '#dc2626' : q.difficulty === 'medium' ? '#d97706' : '#16a34a' }}>{q.difficulty}</span>
              </div>
              <div className="interview-q-text" style={{ flex: 1, fontWeight: 600, fontSize: '.9rem', lineHeight: 1.5 }}>{q.q}</div>
              <span style={{ color: 'var(--text-4)', fontSize: '.8rem', transform: openIds.has(q.id) ? 'rotate(180deg)' : '', transition: 'transform .2s', flexShrink: 0 }}>▼</span>
            </div>
            {openIds.has(q.id) && (
              <div style={{ padding: '0 18px 16px 68px', fontSize: '.88rem', color: 'var(--text-2)', lineHeight: 1.75, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {q.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cert Guide */}
      <div style={{ marginTop: 48, padding: 32, background: 'linear-gradient(135deg,#eff6ff,#faf5ff)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)' }}>
        <h2 style={{ marginBottom: 20 }}>Certification Guide</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {[
            { name: 'DP-203: Azure Data Engineer', org: 'Microsoft', topics: ['Azure Storage', 'ADF', 'Synapse', 'Databricks', 'Streaming'], color: '#0078d4', prep: '3-4 months' },
            { name: 'Databricks Data Engineer Professional', org: 'Databricks', topics: ['Delta Lake', 'DLT', 'Unity Catalog', 'Spark Tuning', 'Streaming'], color: '#ef4444', prep: '4-6 months' },
            { name: 'AZ-900: Azure Fundamentals', org: 'Microsoft', topics: ['Cloud Concepts', 'Azure Services', 'Security', 'Pricing'], color: '#0078d4', prep: '1-2 weeks' },
          ].map(cert => (
            <div key={cert.name} style={{ background: 'white', border: '1px solid var(--border)', borderTop: `3px solid ${cert.color}`, borderRadius: 'var(--radius-xl)', padding: 20 }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 4 }}>{cert.org}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.95rem', marginBottom: 12, color: cert.color }}>{cert.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                {cert.topics.map(t => <span key={t} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--gray-100)', fontSize: '.7rem', fontWeight: 600 }}>{t}</span>)}
              </div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>Prep time: <strong>{cert.prep}</strong></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
