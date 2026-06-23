import { useState } from 'react'

interface Props { completed: Set<string> }

interface IQuestion { id: number; category: string; q: string; a: string; difficulty: 'easy' | 'medium' | 'hard' }

interface ICodingProblem { id: number; title: string; description: string; solution: string }

const QUESTIONS: IQuestion[] = [
  // ─── SQL (25): easy:8, medium:10, hard:7 ────────────────────────────────────
  { id: 1, category: 'SQL', difficulty: 'easy', q: 'What is the difference between WHERE and HAVING?', a: 'WHERE filters individual rows BEFORE grouping/aggregation. HAVING filters groups AFTER GROUP BY. You cannot use aggregate functions in WHERE. Example: WHERE amount > 100 vs HAVING SUM(amount) > 1000. Rule of thumb: if you need to filter on an aggregated value, use HAVING; for raw column values, use WHERE.' },
  { id: 2, category: 'SQL', difficulty: 'easy', q: 'What does COUNT(*) vs COUNT(column) return differently?', a: 'COUNT(*) counts ALL rows including NULLs. COUNT(column) counts only non-NULL values in that column. COUNT(DISTINCT column) counts unique non-NULL values. Example: a column with 10 rows but 3 NULLs → COUNT(*) = 10, COUNT(col) = 7, COUNT(DISTINCT col) depends on uniqueness.' },
  { id: 3, category: 'SQL', difficulty: 'easy', q: 'What does a LEFT JOIN return when there is no match in the right table?', a: 'All rows from the left table, with NULL values for all columns of the right table where no match exists. This is the most commonly used join type in analytics to preserve all records from the primary/fact table. Contrast: INNER JOIN drops unmatched rows from both sides; RIGHT JOIN preserves all right-table rows.' },
  { id: 4, category: 'SQL', difficulty: 'easy', q: 'Explain the difference between UNION and UNION ALL.', a: 'UNION ALL: returns all rows from both queries including duplicates  -  faster, no extra sort/hash pass. UNION: deduplicates rows (semantically UNION ALL + DISTINCT)  -  slower. Rule: always use UNION ALL unless you explicitly need deduplication. UNION can be 2-5x slower on large datasets due to the dedup sort.' },
  { id: 5, category: 'SQL', difficulty: 'easy', q: 'What is the difference between DELETE, TRUNCATE, and DROP?', a: 'DELETE: removes rows one-by-one with a WHERE clause, logged, can be rolled back, triggers fire. TRUNCATE: removes ALL rows at once, minimally logged, cannot use WHERE, no triggers, resets identity. DROP: removes the entire table/object. In Azure Synapse/Delta: TRUNCATE is faster but cannot be filtered; DELETE with WHERE is for selective removal.' },
  { id: 6, category: 'SQL', difficulty: 'easy', q: 'What is a primary key vs a foreign key?', a: 'Primary key: uniquely identifies each row in a table  -  must be NOT NULL and unique. Only one PK per table. Foreign key: column(s) in one table that reference the PK in another table, enforcing referential integrity. In analytical systems (Synapse, Databricks), FK constraints are often declared but NOT ENFORCED (for performance), relying on the ETL pipeline to maintain integrity.' },
  { id: 7, category: 'SQL', difficulty: 'easy', q: 'What is a NULL value and how does NULL behave in comparisons?', a: 'NULL represents an unknown/missing value  -  it is NOT equal to zero or empty string. NULL compared to anything returns UNKNOWN (not TRUE or FALSE). Therefore: WHERE col = NULL never matches rows; use WHERE col IS NULL. NULL + any value = NULL. COUNT(*) includes NULLs; SUM/AVG ignore NULLs. Use COALESCE(col, default) to substitute NULLs.' },
  { id: 8, category: 'SQL', difficulty: 'easy', q: 'What is a CTE (Common Table Expression)?', a: 'A CTE is a named temporary result set defined with the WITH clause, scoped to a single query. Syntax: WITH cte_name AS (SELECT ...) SELECT * FROM cte_name. Benefits: readability (replace complex subqueries), reusability (same CTE referenced multiple times), and enabler of recursion. Performance is usually equivalent to subqueries  -  the optimizer inlines them.' },

  { id: 9, category: 'SQL', difficulty: 'medium', q: 'What is the difference between RANK() and DENSE_RANK()?', a: 'RANK() leaves gaps after ties  -  if two rows tie for rank 1, the next rank is 3 (1,1,3). DENSE_RANK() does not leave gaps  -  the next rank after two ties is 2 (1,1,2). ROW_NUMBER() assigns a unique sequential number with no ties. Use DENSE_RANK when you want "top N" without gaps; use RANK to match competition-style rankings.' },
  { id: 10, category: 'SQL', difficulty: 'medium', q: 'Write a query to find the second highest salary in an employees table.', a: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);\nOr using window functions (handles ties correctly):\nSELECT DISTINCT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rn FROM employees) t WHERE rn = 2;\nThe window function approach is more robust and generalizes to "Nth highest" by changing the filter.' },
  { id: 11, category: 'SQL', difficulty: 'medium', q: 'What is predicate pushdown and why does it matter?', a: 'Predicate pushdown is a query optimizer technique that moves (pushes) filter conditions as close to the data source as possible  -  ideally applied before reading/joining data. This drastically reduces data movement. In Spark: predicates are pushed to Parquet file/row-group level via statistics, skipping entire files. In SQL Server: pushed to storage engine before returning rows to the query layer. Always filter early, never late.' },
  { id: 12, category: 'SQL', difficulty: 'medium', q: 'How does an index improve query performance? When would an index hurt performance?', a: 'Index creates a B-tree data structure enabling O(log n) lookup instead of O(n) full table scan. Indexes hurt on: (1) write-heavy tables  -  every INSERT/UPDATE/DELETE must update all indexes, (2) low-cardinality columns like booleans (full scan may be faster), (3) very small tables where the optimizer prefers a scan, (4) columns never used in WHERE/JOIN/ORDER BY. Rule: index columns used in WHERE, JOIN conditions, and ORDER BY.' },
  { id: 13, category: 'SQL', difficulty: 'medium', q: 'What is ACID and why does it matter for data pipelines?', a: 'Atomicity: all operations succeed or all are rolled back. Consistency: only valid data is written (constraints enforced). Isolation: concurrent transactions do not interfere. Durability: committed data survives crashes. Without ACID, concurrent pipeline writes can produce partial writes, phantom reads, or dirty reads. Delta Lake brings ACID to data lakes via transaction logs, enabling safe MERGE/UPDATE/DELETE on Parquet files.' },
  { id: 14, category: 'SQL', difficulty: 'medium', q: 'What is GROUPING SETS and how does it differ from ROLLUP and CUBE?', a: 'GROUPING SETS: explicitly specifies which combinations of GROUP BY columns to compute. ROLLUP: generates a hierarchy of subtotals from most specific to grand total (e.g., year→month→day→total). CUBE: generates all possible combinations (2^n groups). Example: GROUPING SETS ((region, product), (region), ()) computes three aggregations in one pass  -  more efficient than three separate queries. Useful for dashboards needing multiple aggregation levels.' },
  { id: 15, category: 'SQL', difficulty: 'medium', q: 'Write a query to find gaps in a sequence of IDs.', a: 'SELECT a.id + 1 AS gap_start, MIN(b.id) - 1 AS gap_end\nFROM sequence_table a\nJOIN sequence_table b ON a.id < b.id\nGROUP BY a.id\nHAVING a.id + 1 < MIN(b.id);\nAlternatively with window functions:\nSELECT id + 1 AS gap_start, next_id - 1 AS gap_end\nFROM (SELECT id, LEAD(id,1) OVER (ORDER BY id) AS next_id FROM sequence_table) t\nWHERE next_id - id > 1;\nThe LEAD approach is cleaner and performs better on large tables.' },
  { id: 16, category: 'SQL', difficulty: 'medium', q: 'How do you implement a running total that resets every month?', a: 'SELECT order_date, amount,\n  SUM(amount) OVER (\n    PARTITION BY DATE_TRUNC(\'month\', order_date)\n    ORDER BY order_date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS monthly_running_total\nFROM orders;\nThe key is PARTITION BY the month  -  the window resets at each new month boundary. The ROWS BETWEEN clause makes it a cumulative sum within the partition.' },
  { id: 17, category: 'SQL', difficulty: 'medium', q: 'What is a lateral join / CROSS APPLY and when do you use it?', a: 'LATERAL (PostgreSQL/BigQuery) or CROSS APPLY (SQL Server/Synapse) allows a subquery to reference columns from the preceding FROM clause  -  it is like a correlated subquery in the FROM clause. Use cases: (1) unnesting arrays (CROSS APPLY json_parse(tags)), (2) calling a table-valued function per row, (3) top-N per group without window functions. OUTER APPLY = LEFT JOIN equivalent (includes rows where the subquery returns no rows).' },
  { id: 18, category: 'SQL', difficulty: 'medium', q: 'Explain the difference between correlated and non-correlated subqueries with performance implications.', a: 'Non-correlated subquery: executes once independently, result is reused. Example: WHERE salary > (SELECT AVG(salary) FROM employees)  -  AVG is computed once. Correlated subquery: references the outer query, executes ONCE PER ROW. Example: WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e1.dept_id)  -  AVG recomputed for each row. Correlated subqueries are often 10-100x slower on large tables. Replace with a JOIN to a pre-aggregated CTE for performance.' },

  { id: 19, category: 'SQL', difficulty: 'hard', q: 'How do you detect and fix data skew in a SQL aggregation?', a: 'Detection: EXPLAIN shows one partition handling 80%+ of data; query time dominated by one task. In Azure Synapse: sys.dm_pdw_nodes_db_table_stats shows row distribution per node. Fix strategies: (1) Change distribution key: CREATE TABLE orders WITH (DISTRIBUTION = HASH(customer_id))  -  choose a high-cardinality evenly-distributed column, (2) ROUND_ROBIN distribution for staging tables, (3) REPLICATE for small dimension tables (<2GB), (4) Salting for Spark: add random salt to hot keys. Monitor with DBCC PDW_SHOWSPACEUSED.' },
  { id: 20, category: 'SQL', difficulty: 'hard', q: 'What is a sargable predicate? Why does LIKE \'prefix%\' use an index but LIKE \'%suffix\' doesn\'t?', a: 'Sargable (Search ARGument ABLE): predicates that allow the query engine to use an index range scan. LIKE \'prefix%\' is sargable because the B-tree index can seek to the first key >= "prefix" and scan forward  -  bounded range. LIKE \'%suffix\' is NOT sargable because there is no starting point in the B-tree; the engine must examine every entry. Non-sargable patterns: LIKE \'%value%\', functions on indexed columns (YEAR(date_col) = 2024 → use date_col BETWEEN), NOT IN with nulls, type mismatches. Fix: computed columns with persisted indexes, full-text search, or reverse the string for suffix matching.' },
  { id: 21, category: 'SQL', difficulty: 'hard', q: 'Explain covering indexes vs clustered vs non-clustered indexes.', a: 'Clustered index: determines physical row storage order (B-tree leaf = data rows). Only one per table. Optimal for range queries on the clustering key. Non-clustered index: separate B-tree with pointers back to heap/clustered index. Covering index: a non-clustered index that includes ALL columns needed by a query, so no lookup to the base table is needed. CREATE INDEX idx ON orders(customer_id) INCLUDE (amount, status)  -  queries filtering on customer_id and selecting amount/status never touch the base table. Covering indexes are the most impactful optimization for read-heavy analytical queries.' },
  { id: 22, category: 'SQL', difficulty: 'hard', q: 'What causes a hash join vs nested loop join vs merge join in query optimizer?', a: 'Nested Loop Join: iterate outer rows, probe inner for each. Best when: outer set is small, inner has an index on join key. O(n*m) worst case. Hash Join: build hash table from smaller side, probe with larger side. Best when: large unsorted tables, no indexes. O(n+m) but memory-intensive. Merge Join: both inputs sorted on join key, scan in parallel. Best when: both sides pre-sorted (clustered index, ORDER BY). Most efficient for large sorted datasets. Optimizer chooses based on: table statistics (row count, cardinality), available indexes, available memory. Force with hints: OPTION (LOOP JOIN), HASH JOIN, MERGE JOIN.' },
  { id: 23, category: 'SQL', difficulty: 'hard', q: 'Explain CTEs vs subqueries  -  when would you choose each?', a: 'CTEs (WITH clause) are named, reusable within the query, and improve readability. Subqueries are inline and can only be used once at that position. Use CTEs when: (1) the same derived table is referenced multiple times in the same query  -  avoids repeated execution, (2) recursive queries (hierarchical traversal), (3) multi-step transformations that read like code. Subqueries are fine for simple one-off filters. Performance: in most databases, the optimizer inlines both equivalently. However, materialized CTEs (SQL Server WITH (MATERIALIZED)) force evaluation once, which can help or hurt performance depending on context.' },
  { id: 24, category: 'SQL', difficulty: 'hard', q: 'How do you find duplicate records and keep only the latest?', a: 'Standard approach using window functions:\nDELETE FROM orders\nWHERE order_id NOT IN (\n  SELECT order_id FROM (\n    SELECT order_id,\n      ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY updated_at DESC) AS rn\n    FROM orders\n  ) t WHERE rn = 1\n);\nIn Delta Lake (preferred for large tables):\nCREATE OR REPLACE TABLE orders AS\nSELECT * FROM (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY updated_at DESC) AS rn\n  FROM orders\n) WHERE rn = 1;\nUse PARTITION BY the natural/business key and ORDER BY the timestamp descending.' },
  { id: 25, category: 'SQL', difficulty: 'hard', q: 'What is a recursive CTE and when would you use it?', a: 'A recursive CTE references itself to traverse hierarchical or graph data. Structure:\nWITH RECURSIVE org_hierarchy AS (\n  -- Anchor: start with root nodes\n  SELECT employee_id, manager_id, name, 0 AS depth\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  -- Recursive: join to find direct reports\n  SELECT e.employee_id, e.manager_id, e.name, h.depth + 1\n  FROM employees e\n  JOIN org_hierarchy h ON e.manager_id = h.employee_id\n)\nSELECT * FROM org_hierarchy ORDER BY depth;\nUse cases: org charts, folder/file trees, bill-of-materials, network traversal, computing transitive closure. Add MAXRECURSION hint to prevent infinite loops on cyclic graphs.' },

  // ─── PySpark (25): easy:7, medium:10, hard:8 ─────────────────────────────────
  { id: 26, category: 'PySpark', difficulty: 'easy', q: 'What is the difference between transformations and actions in Spark?', a: 'Transformations (filter, map, select, join, groupBy) are lazy  -  they build the logical DAG but execute NO computation. Actions (count, collect, show, write, save) trigger DAG compilation and execution. This enables the Catalyst optimizer to see the full plan before any data moves, enabling predicate pushdown, column pruning, and join reordering. Never call actions in a loop  -  each call launches a new Spark job.' },
  { id: 27, category: 'PySpark', difficulty: 'easy', q: 'What does cache() do and when should you use it?', a: 'cache() stores a DataFrame in executor memory (MEMORY_AND_DISK level by default). Use when: (1) the same DataFrame is used multiple times in different downstream operations, (2) after expensive transformations (joins, window functions) that you do not want re-executed. Avoid caching: DataFrames used only once, DataFrames larger than available memory (causes disk spill), in streaming pipelines. persist(StorageLevel.DISK_ONLY) for very large DataFrames.' },
  { id: 28, category: 'PySpark', difficulty: 'easy', q: 'What is the difference between a DataFrame and an RDD?', a: 'RDD (Resilient Distributed Dataset): low-level API, untyped, no schema, no optimizer  -  all computation is Python/Java lambda functions. DataFrame: high-level structured API with schema, processed by the Catalyst optimizer and Tungsten code generation. DataFrames are 5-100x faster than RDDs for typical workloads. Use DataFrames always; fall back to RDD only for operations that cannot be expressed in DataFrame API (e.g., custom partitioner).' },
  { id: 29, category: 'PySpark', difficulty: 'easy', q: 'Why are Python UDFs slow and what alternatives exist?', a: 'Python UDFs serialize each row from JVM → Python process (via Pickle), execute Python code, then deserialize back  -  row-by-row, massive overhead (~10x slower than built-in functions). Alternatives in order of performance: (1) Built-in SQL functions (F.when, F.regexp_replace, F.split)  -  run in JVM, no serialization, (2) Pandas UDFs (@pandas_udf)  -  vectorized, process micro-batches via Apache Arrow, 5-10x faster than Python UDFs, (3) Scala UDF compiled as JAR and registered to SparkSession.' },
  { id: 30, category: 'PySpark', difficulty: 'easy', q: 'What is a partition in Spark and how many should you have?', a: 'A partition is a logical chunk of data processed by a single task on a single executor core. Too few partitions: underutilizes cluster (some cores idle). Too many partitions: task scheduling overhead dominates. Rule of thumb: aim for 100-200MB per partition after shuffle (spark.sql.shuffle.partitions, default 200). For input: each Parquet file or HDFS block = one partition. For optimal parallelism: 2-4x the number of CPU cores in your cluster.' },
  { id: 31, category: 'PySpark', difficulty: 'easy', q: 'What is the difference between narrow and wide transformations?', a: 'Narrow transformation: each output partition depends on at most one input partition. No shuffle needed. Examples: filter, select, map, withColumn, union. Wide transformation: output partitions may depend on multiple input partitions. Requires shuffle (data redistribution across network). Examples: groupBy, join, distinct, repartition, sort. Wide transformations create stage boundaries in the DAG. Minimize wide transformations to reduce shuffle cost.' },
  { id: 32, category: 'PySpark', difficulty: 'easy', q: 'How do you read a Delta table in PySpark?', a: 'spark.read.format("delta").load("abfss://container@account.dfs.core.windows.net/path/to/table")\nOr via the catalog (Unity Catalog / Hive metastore):\ndf = spark.read.table("catalog.schema.table_name")\nOr with SQL:\ndf = spark.sql("SELECT * FROM catalog.schema.table_name")\nTime travel: spark.read.format("delta").option("versionAsOf", 5).load(path)\nOr: .option("timestampAsOf", "2024-01-15")' },

  { id: 33, category: 'PySpark', difficulty: 'medium', q: 'What is the difference between repartition() and coalesce()?', a: 'repartition(n): performs a full shuffle, can increase or decrease partition count, always produces balanced partitions. coalesce(n): avoids a full shuffle by merging existing partitions  -  only decreases partition count, may produce unbalanced partitions. Rule: use coalesce(n) before writing to reduce output file count (no shuffle cost), use repartition(n) to increase partitions or when you need balanced distribution. repartition(n, col) also hash-partitions by column, useful before joins.' },
  { id: 34, category: 'PySpark', difficulty: 'medium', q: 'What is a shuffle and why is it expensive?', a: 'Shuffle redistributes data across partitions across nodes (required for groupBy, join, distinct, repartition, sort). Expensive because: (1) map tasks write shuffle files to local disk, (2) reduce tasks read over the network from all nodes, (3) stage boundary  -  all map tasks must complete before any reduce task starts. Minimization strategies: broadcast joins for small tables, bucket tables (pre-partitioned on join key), Z-ORDER to colocate related data, use AQE to auto-coalesce small shuffle partitions.' },
  { id: 35, category: 'PySpark', difficulty: 'medium', q: 'Explain broadcast joins and when to use them.', a: 'Broadcast join sends the smaller table to ALL executor nodes, avoiding the shuffle of the large table. Triggered automatically when small table < spark.sql.autoBroadcastJoinThreshold (default 10MB). Force manually: from pyspark.sql.functions import broadcast; large_df.join(broadcast(small_df), "key"). Best for: dimension table joins (customers, products, lookup tables). Avoid if: small table is actually large (> 100MB)  -  serialization and broadcast cost exceeds shuffle savings. Disable: spark.conf.set("spark.sql.autoBroadcastJoinThreshold", -1).' },
  { id: 36, category: 'PySpark', difficulty: 'medium', q: 'How do you handle schema evolution in PySpark with Delta Lake?', a: 'Adding new nullable columns: .option("mergeSchema", "true") on write, or set spark.databricks.delta.schema.autoMerge.enabled=true. Adding non-nullable columns: requires explicit ALTER TABLE ADD COLUMNS with DEFAULT or a full rewrite. Type changes (safe: int→long): use .withColumn("col", col("col").cast(LongType())). Breaking changes: write to a new versioned table (silver_v2), migrate consumers, deprecate old. For Kafka/Event Hub: use Schema Registry with Avro to version schemas independently of the Delta table.' },
  { id: 37, category: 'PySpark', difficulty: 'medium', q: 'What is the difference between mapPartitions and map  -  when is mapPartitions better?', a: 'map(f): applies function f to each row individually. Function called once per row. mapPartitions(f): applies function f to an entire partition (iterator of rows). Function called once per partition. mapPartitions is better when: (1) the operation has a per-partition setup cost (DB connection, ML model load)  -  setup happens once per partition not once per row, (2) vectorized operations on the partition data. Example: loading a scikit-learn model once per partition for batch inference instead of reloading for each row.' },
  { id: 38, category: 'PySpark', difficulty: 'medium', q: 'Explain the difference between spark.sql.shuffle.partitions and spark.default.parallelism.', a: 'spark.sql.shuffle.partitions (default 200): controls the number of partitions created after a shuffle in DataFrame/SQL operations (groupBy, join, sort). spark.default.parallelism: controls the default parallelism for RDD operations (parallelize, reduceByKey) and is set to the total number of cores by default. For most DataFrame workloads, only tune shuffle.partitions. Rule: set shuffle.partitions to 2-4x your total CPU cores, or let AQE auto-tune it (spark.sql.adaptive.enabled=true will coalesce small post-shuffle partitions).' },
  { id: 39, category: 'PySpark', difficulty: 'medium', q: 'How do you read from multiple Kafka topics in a single Spark streaming job?', a: 'Use the "subscribe" option with comma-separated topics:\ndf = spark.readStream.format("kafka")\n  .option("kafka.bootstrap.servers", "host:9092")\n  .option("subscribe", "topic1,topic2,topic3")\n  .option("startingOffsets", "earliest")\n  .load()\nOr use "subscribePattern" for regex:\n  .option("subscribePattern", "events.*")\nThe resulting DataFrame has columns: key, value, topic, partition, offset, timestamp. Use the "topic" column in downstream logic to route different schemas. Each topic can have different schemas  -  parse value separately per topic using when(col("topic") == "events", ...) branches.' },
  { id: 40, category: 'PySpark', difficulty: 'medium', q: 'What is the difference between foreachBatch and foreach in Structured Streaming?', a: 'foreach(writer): applies a custom function to EACH ROW in each micro-batch. Row-by-row processing, good for writing individual records to external systems. foreachBatch(f): applies function f to the ENTIRE MICRO-BATCH as a DataFrame. Enables: (1) arbitrary DataFrame operations on the batch (joins, dedup), (2) writing to multiple sinks in one batch, (3) using Delta MERGE (not possible with foreach), (4) complex transformations before writing. foreachBatch is almost always preferred  -  it is more efficient and expressive. Example: def process_batch(df, epoch_id): df.write.format("delta").mode("append").save(path)' },
  { id: 41, category: 'PySpark', difficulty: 'medium', q: 'What is the difference between repartition(n, col) and repartition(col)?', a: 'repartition(n, col): shuffles data into exactly n partitions using hash(col) to determine placement. Good when you know the target partition count. repartition(col): shuffles data using hash(col) but uses the default number of shuffle partitions (spark.sql.shuffle.partitions = 200). Use repartition(n, col) before a join to pre-partition both sides on the join key  -  if both DataFrames are partitioned the same way, Spark can do a partition-local join without an additional shuffle. This is the foundation of bucketing in Delta Lake.' },
  { id: 42, category: 'PySpark', difficulty: 'medium', q: 'What causes OOM errors in Spark and how do you fix each type?', a: 'Executor OOM: (1) Data skew  -  one task gets too much data → salt the skewed key or enable AQE skew join optimization, (2) Collecting too much data  -  avoid collect() on large DataFrames, (3) Broadcast of large table  -  increase autoBroadcastJoinThreshold threshold check or disable broadcast, (4) UDF memory leak  -  check Python UDF for in-memory accumulation. Driver OOM: (1) collect() or toPandas() on large DF  -  stream results instead, (2) Too many small tasks  -  increase partition size. Fix: spark.executor.memoryOverhead for off-heap needs, increase executor memory, reduce spark.sql.shuffle.partitions.' },

  { id: 43, category: 'PySpark', difficulty: 'hard', q: 'What is AQE (Adaptive Query Execution) and what does it optimize?', a: 'AQE (Spark 3.x) modifies the physical execution plan at runtime using actual shuffle statistics rather than static estimates. Three automatic optimizations: (1) Coalescing shuffle partitions  -  post-shuffle, small partitions are merged (e.g., 200 default down to 30 actual needed), (2) Converting sort-merge join to broadcast join  -  if one side turns out smaller than expected at runtime, (3) Skew join optimization  -  automatically splits oversized partitions. Enable: spark.sql.adaptive.enabled=true (default true in Spark 3.2+). AQE is the single biggest performance improvement in Spark 3.x for ad-hoc queries.' },
  { id: 44, category: 'PySpark', difficulty: 'hard', q: 'Explain Spark\'s memory model and what spark.memory.fraction controls.', a: 'Total executor memory is split: spark.memory.fraction (default 0.6) is managed memory; the rest (0.4) is user memory (Python objects, metadata, UDF state). Within managed memory: spark.memory.storageFraction (default 0.5) is the "soft" boundary for storage (RDD cache, broadcast). Execution memory (joins, aggregations, sorts) can borrow from storage and evict cached data. On-heap vs off-heap: off-heap (spark.memory.offHeap.enabled) avoids GC pressure for cache-heavy workloads. When you see GC overhead > 10% in Spark UI, increase spark.executor.memory or reduce cache size.' },
  { id: 45, category: 'PySpark', difficulty: 'hard', q: 'Explain the Catalyst optimizer pipeline.', a: 'DataFrame API → four-phase optimization: (1) Analysis: resolves column names and types against the catalog/schema, validates the logical plan, (2) Logical Optimization: applies rule-based optimizations  -  predicate pushdown, column pruning, constant folding, null propagation, Boolean simplification, (3) Physical Planning: generates multiple physical plans (hash join vs sort-merge join vs broadcast join), selects the cheapest via cost model, (4) Code Generation (Tungsten): generates JVM bytecode for tight loops eliminating virtual function calls and interpreter overhead. Inspect: df.explain(True) shows all four plans (parsed → analyzed → optimized → physical).' },
  { id: 46, category: 'PySpark', difficulty: 'hard', q: 'How do you implement exactly-once processing in Structured Streaming?', a: 'Three requirements: (1) Source with replayable offsets (Kafka/Event Hub stores offsets, Auto Loader tracks file list in RocksDB checkpoint), (2) Checkpointing  -  .option("checkpointLocation", path) saves committed offsets and operator state to ADLS Gen2 after every successful micro-batch, (3) Idempotent sink  -  Delta MERGE with natural key deduplication, or Delta append with txnAppId/txnVersion for streaming idempotency. If the job fails and restarts, it reads the checkpoint to find the last committed offset and replays from there. The combination of Kafka (replayable) + Delta Lake (idempotent write) + checkpointing provides end-to-end exactly-once semantics.' },
  { id: 47, category: 'PySpark', difficulty: 'hard', q: 'What is dynamic partition pruning in Spark 3.x?', a: 'DPP allows Spark to push a runtime filter from a small dimension table into the scan of a large fact table. Without DPP: Spark scans all partitions of the fact table then joins. With DPP: Spark first collects the distinct values from the dimension side, then creates a broadcast filter and applies it as a predicate during the fact table scan  -  skipping irrelevant partitions entirely. Example: SELECT * FROM orders o JOIN date_dim d ON o.date_id = d.date_id WHERE d.quarter = \'Q1\'. DPP requires: the join key must be a partition column on the fact table; enable with spark.sql.optimizer.dynamicPartitionPruning.enabled=true (default true).' },
  { id: 48, category: 'PySpark', difficulty: 'hard', q: 'Explain whole-stage code generation (Tungsten) and why it matters.', a: 'Tungsten\'s whole-stage code generation (WSCG) compiles entire pipeline stages into a single JVM bytecode function, eliminating virtual function calls between operators and enabling CPU cache-friendly tight loops. Without WSCG: each row passes through a chain of operator objects (filter.next() → project.next() → aggregate.next()). With WSCG: the entire chain for each stage is compiled into one tight loop  -  data stays in CPU registers across operators. Result: 10-100x better CPU efficiency for compute-intensive operations. Check: df.explain() shows "*(n)" prefix on nodes where WSCG is active. Falls back gracefully for unsupported operations (Python UDFs disable WSCG for that stage).' },
  { id: 49, category: 'PySpark', difficulty: 'hard', q: 'How does Spark\'s speculative execution work?', a: 'Speculative execution launches duplicate copies of slow tasks (stragglers) on different executors, and uses whichever completes first. Enable: spark.speculation=true (default false). Parameters: spark.speculation.multiplier (default 1.5)  -  a task is a straggler if it runs 1.5x longer than the median; spark.speculation.quantile (default 0.75)  -  wait until 75% of tasks complete before speculating. Important caveats: (1) Do not enable with non-idempotent sinks (can produce duplicate writes), (2) Works best for map-stage stragglers, not shuffle reducers, (3) Does NOT help skew  -  it only replaces slow tasks with identical inputs on faster nodes.' },
  { id: 50, category: 'PySpark', difficulty: 'hard', q: 'How do you implement watermark in Structured Streaming and what happens to late data after the watermark?', a: 'Watermark defines the maximum allowed lateness for event-time aggregations:\ndf.withWatermark("event_time", "10 minutes")\n  .groupBy(window("event_time", "5 minutes"))\n  .count()\nSpark tracks: max_event_time_seen - watermark_delay = current watermark. Any event with event_time < current_watermark is considered "late" and is DROPPED. Before the watermark passes, intermediate state is kept in memory. After the watermark passes, Spark finalizes the window result, emits it to the sink, and purges the state from memory. Critical: without watermark, state grows unboundedly and causes OOM on long-running jobs. Tune the delay to balance lateness tolerance vs state memory usage.' },

  // ─── Azure (20): easy:7, medium:8, hard:5 ────────────────────────────────────
  { id: 51, category: 'Azure', difficulty: 'easy', q: 'What is ADLS Gen2 and how does it differ from Azure Blob Storage?', a: 'ADLS Gen2 = Azure Blob Storage + Hierarchical Namespace (HNS). HNS provides: (1) real directory operations (not just prefix simulation) enabling atomic rename, (2) POSIX-compatible ACLs at directory and file level, (3) atomic rename  -  critical for Spark\'s rename-based commit protocol. Same pricing as Blob Storage. Use abfss:// protocol (not wasbs://). Without HNS, Spark must simulate directories with prefixes, making atomic rename impossible and causing correctness issues on job failure.' },
  { id: 52, category: 'Azure', difficulty: 'easy', q: 'What is the purpose of Azure Key Vault in a data platform?', a: 'Centralized secret management: storage account keys, service principal client secrets, database passwords, API keys, certificates. Key benefits: (1) No secrets in code, notebooks, or config files, (2) Secret rotation without redeployment, (3) Full audit log of every secret access, (4) RBAC-based access control. In Databricks: create a Secret Scope backed by Key Vault and access with dbutils.secrets.get(scope="kv-scope", key="storage-key"). In ADF: use Linked Services with Key Vault reference  -  ADF fetches the secret at runtime.' },
  { id: 53, category: 'Azure', difficulty: 'easy', q: 'What is the difference between Azure SQL Database and Azure Synapse Analytics?', a: 'Azure SQL Database: row-store OLTP system optimized for transactions (INSERT/UPDATE/DELETE). Single node, high concurrency for small operations. Azure Synapse Analytics (Dedicated SQL Pool): MPP (Massively Parallel Processing), columnar storage (clustered columnstore index), optimized for analytical queries across TBs of data. 60 compute nodes each with local storage. Use SQL DB for operational queries; use Synapse for analytical reporting and aggregations over large datasets.' },
  { id: 54, category: 'Azure', difficulty: 'easy', q: 'What is Managed Identity and why is it preferred over service principals with secrets?', a: 'Managed Identity is an Azure AD identity automatically created and managed for an Azure resource (VM, Databricks workspace, ADF, Function App). Key advantages: (1) No secret to manage  -  Azure handles credential rotation automatically, (2) No expiry issues  -  secrets expire, Managed Identities do not, (3) No credential in code or config, (4) Audit trail in Azure AD. Two types: System-assigned (tied to resource lifecycle, deleted with the resource) and User-assigned (standalone, reusable across multiple resources). Use User-assigned MI when multiple resources need the same permissions.' },
  { id: 55, category: 'Azure', difficulty: 'easy', q: 'What is Azure Data Factory and what are its main components?', a: 'ADF is a cloud ETL/data integration service with 90+ native connectors. Main components: Pipeline (logical grouping of activities), Activity (a single operation: Copy Data, Execute Databricks Notebook, Execute SQL, Web), Linked Service (connection string/credential to a data source), Dataset (pointer to data in a Linked Service), Trigger (schedule, event-based, or tumbling window for pipeline execution), Integration Runtime (compute engine  -  Azure IR, Self-hosted IR for on-prem, Azure-SSIS IR).' },
  { id: 56, category: 'Azure', difficulty: 'easy', q: 'What is the Medallion Architecture (Bronze/Silver/Gold)?', a: 'A data organization pattern for Data Lakehouses: Bronze (Raw): exact copy of source data, no transformations, append-only. Preserved for reprocessing and audit. Silver (Cleansed): deduplicated, validated, schema-enforced, enriched with lookups. Business logic lives here. Gold (Aggregated/Business): optimized for specific business domains and reporting  -  pre-aggregated facts, dimensional models, feature stores. Each layer is stored as Delta tables. The pattern enables: reprocessing from Bronze when Silver logic changes, separate access control per layer, and incremental processing.' },
  { id: 57, category: 'Azure', difficulty: 'easy', q: 'What is Delta Lake and why is it used instead of raw Parquet?', a: 'Delta Lake adds a transaction log (_delta_log) on top of Parquet files, providing: (1) ACID transactions  -  safe concurrent reads/writes, (2) Schema enforcement  -  rejects writes with wrong schema, (3) Schema evolution  -  opt-in with mergeSchema, (4) Time travel  -  query any previous version with VERSION AS OF or TIMESTAMP AS OF, (5) MERGE/UPDATE/DELETE  -  not possible with raw Parquet, (6) Streaming + batch unified (same table, same API), (7) Compaction (OPTIMIZE) and indexing (Z-ORDER). Delta is the default table format in Databricks and Azure Synapse.' },

  { id: 58, category: 'Azure', difficulty: 'medium', q: 'Explain the difference between ADF and Databricks Workflows for orchestration.', a: 'ADF: 90+ native connectors, drag-and-drop UI, built-in monitoring, good for data movement and trigger-based orchestration with external systems (on-prem, SaaS, SQL). Databricks Workflows (Lakeflow): Python/SQL/notebook-native, tight Databricks integration, better for complex DAGs mixing DLT pipelines, SQL queries, and notebooks. Dependency graph with retries, alerts, and SLA tracking. Use ADF to ingest data from external sources into Bronze, then trigger Databricks Workflows for Silver/Gold transformations. Use Lakeflow when your entire pipeline lives in Databricks.' },
  { id: 59, category: 'Azure', difficulty: 'medium', q: 'What is Unity Catalog and what governance capabilities does it provide?', a: 'Unity Catalog is Databricks\' unified data governance solution with a three-level namespace (catalog.schema.table). Capabilities: (1) Unified permissions across all workspaces in an account, (2) Fine-grained access control at table/column/row level, (3) Automatic data lineage tracking at column level, (4) Data discovery  -  search tables and understand what data exists, (5) Audit logs of all data accesses, (6) Delta Sharing for cross-organization data sharing without data copying, (7) External location management (ADLS Gen2 paths registered and access-controlled). Unity Catalog is the Microsoft/Databricks answer to enterprise data governance.' },
  { id: 60, category: 'Azure', difficulty: 'medium', q: 'What is Azure Monitor + KQL and how does it help with pipeline observability?', a: 'Azure Monitor collects: platform metrics (CPU, memory, throughput), resource logs (ADLS access logs, ADF run logs), and custom application logs. KQL (Kusto Query Language) enables querying these logs across services in Log Analytics workspaces. Example alert KQL: AzureDiagnostics | where Category == "PipelineRuns" | where Status == "Failed" | where TimeGenerated > ago(1h). Set up metric alerts (pipeline duration > SLA threshold) and log-based alerts (DLQ count > 0). In Databricks: use structured logging with log4j → Azure Monitor Logs Forwarder → Log Analytics workspace for centralized observability.' },
  { id: 61, category: 'Azure', difficulty: 'medium', q: 'How does ADF\'s Tumbling Window trigger differ from a Schedule trigger?', a: 'Schedule trigger: fires at a fixed interval (e.g., every day at 2am). If a run fails and is skipped, the schedule simply continues  -  no backfill, no dependency tracking. Tumbling Window trigger: partitions time into fixed, non-overlapping windows with a defined start time. Each window is an independent, rerunnable unit with a guaranteed start/end time available as @trigger().outputs.windowStartTime. Supports: (1) dependency between windows (window N+1 waits for N), (2) automatic backfill (run all missed windows sequentially), (3) concurrency control, (4) retry policies per window. Use Tumbling Window for incremental data processing; use Schedule for simple daily runs.' },
  { id: 62, category: 'Azure', difficulty: 'medium', q: 'Explain ADLS Gen2 ACL inheritance and how it differs from Azure RBAC.', a: 'POSIX ACLs (Access Control Lists) in ADLS Gen2 operate at the individual file and directory level with three principal types: owning user, owning group, and "other." Default ACLs on a directory are inherited by new children. Execute (X) permission is required to traverse a directory hierarchy  -  commonly missed when granting read access to a nested file. Azure RBAC (Role-Based Access Control) applies at the storage account or container scope (Storage Blob Data Reader, Storage Blob Data Contributor). ACLs and RBAC coexist: RBAC Owner can bypass ACLs. Best practice: use RBAC for broad access (Databricks service principal gets Contributor), use ACLs for fine-grained row/folder-level access within the container.' },
  { id: 63, category: 'Azure', difficulty: 'medium', q: 'Explain Cosmos DB consistency levels with real-world examples.', a: 'Strong: linearizable reads  -  reads always see the latest write. Use for: financial balances, inventory counts where stale reads cause real money loss. Bounded Staleness: reads lag by at most K versions or T seconds. Use for: leaderboards, dashboards where slight staleness is ok. Session (default): consistent within a single client session (your writes visible to your reads). Use for: user profile data, shopping cart. Consistent Prefix: reads never see out-of-order writes. Use for: social media feeds. Eventual: lowest latency, highest availability, reads may be stale. Use for: like counts, view counters. Performance trade-off: Strong has 2x write latency; Eventual is fastest.' },
  { id: 64, category: 'Azure', difficulty: 'medium', q: 'What is the difference between Event Hub Standard and Premium?', a: 'Standard: up to 40 consumer groups, 32 partitions, 1-day retention (up to 7 days extra cost), ~100 publishers per namespace. Premium: 100 consumer groups, 100 partitions, up to 90-day retention, event replication (geo-DR), dynamic partition scaling, higher throughput units (Processing Units). Use Standard for: typical streaming ingestion with Spark/ADF. Use Premium for: enterprise-grade compliance (longer retention), high-fan-out architectures (many consumer groups), or when you need event replication across regions for disaster recovery.' },
  { id: 65, category: 'Azure', difficulty: 'medium', q: 'What is the difference between Service Endpoint and Private Endpoint in Azure networking?', a: 'Service Endpoint: enables traffic from a VNet to an Azure service to flow over the Microsoft backbone instead of the public internet. The service still has a public IP  -  you just restrict which VNets can reach it. Traffic leaves your VNet but stays on Microsoft network. Private Endpoint: assigns a private IP address FROM your VNet to an Azure service (storage, Key Vault, Databricks). Traffic never leaves your VNet  -  the service is treated as a resource within your virtual network. Exfiltration prevention: with Private Endpoint + disabled public access, data cannot be sent to an external network. Enterprise security requires Private Endpoints for ADLS, Key Vault, and Databricks in regulated environments.' },

  { id: 66, category: 'Azure', difficulty: 'hard', q: 'How do Private Endpoints work and why are they required in enterprise environments?', a: 'Private Endpoint creates a Network Interface Card (NIC) in your VNet with a private IP mapped to the Azure PaaS service via Private Link. DNS is updated (Private DNS Zone) so the service FQDN resolves to the private IP inside the VNet. Traffic path: client → VNet NIC → Private Link service backbone → target service. No public internet exposure. To complete the lockdown: (1) Disable public network access on the storage/KV/DBX workspace, (2) Set up Private DNS Zones (.blob.core.windows.net, .dfs.core.windows.net) with A records pointing to private IPs, (3) Link DNS zones to all VNets. Required for: PCI-DSS, HIPAA, SOC2 compliance environments where regulatory requirements mandate data does not traverse public networks.' },
  { id: 67, category: 'Azure', difficulty: 'hard', q: 'Explain Event Hub partitions and consumer groups in depth.', a: 'Partitions: events are hash-distributed across N partitions (8-32 typical). Each partition is an ordered, append-only, immutable sequence of events with its own offset. Throughput: each partition handles ~1MB/s in, ~2MB/s out. Consumer Group: an independent cursor/pointer into the event stream  -  each group maintains its own offset per partition. Multiple consumer groups read the same events independently (e.g., Spark Bronze ingestion, ML feature pipeline, real-time alerts  -  three groups, three independent reads). Partition assignment: Spark assigns one task per partition per trigger. Critical: cannot decrease partition count after creation; plan capacity upfront. Use EventProcessorClient for exactly-once semantics with checkpointing in Azure Blob Storage.' },
  { id: 68, category: 'Azure', difficulty: 'hard', q: 'Explain Cosmos DB partition key selection and its impact on performance and cost.', a: 'Partition key determines physical data distribution across logical and physical partitions (max 20GB per logical partition, max 50,000 RU/s per physical partition). Good partition key: high cardinality, even write distribution, frequently used in WHERE clauses (avoids fan-out queries). Bad partition key: order_status (only a few values → hot partition hitting RU limits → 429 throttling). For orders: /customer_id is usually better than /order_status. Synthetic partition keys: for time-series data with low cardinality, combine fields: /region+date. Cross-partition queries: scatter-gather across all partitions  -  expensive. Rule: design queries around partition key first, then secondary indexes. Monitor: Azure Monitor metric "Hot Partition" alert.' },
  { id: 69, category: 'Azure', difficulty: 'hard', q: 'What is the difference between Azure Data Factory\'s Mapping Data Flow and Databricks for transformations?', a: 'ADF Mapping Data Flow: visual drag-and-drop transformation canvas, runs on auto-provisioned Spark clusters under the hood, code-free, strong Azure connector support, integrated debugging with data preview. Best for: non-developer teams, standard ETL patterns, projects where visual development is required by stakeholders. Databricks Notebooks/DLT: code-first (Python/Scala/SQL), full Spark API access, Delta Live Tables for declarative pipelines, richer ML integration, better for complex custom logic, advanced Spark optimizations (custom partitioning, cache, etc.). Cost: Data Flow has a higher per-hour cost than equivalent Databricks compute. Choose Data Flow for simplicity; choose Databricks for complex transformations, performance-critical pipelines, and engineering-led teams.' },
  { id: 70, category: 'Azure', difficulty: 'hard', q: 'How does Azure Databricks Auto Loader work and why is it better than COPY INTO for streaming ingestion?', a: 'Auto Loader (cloudFiles) uses Azure Event Grid and Blob Storage change notifications to detect new files incrementally  -  avoiding the need to list all files on every trigger (expensive for millions of files). Under the hood: Auto Loader maintains a RocksDB-based checkpoint of processed files in the streaming checkpoint location. Exactly-once: each file is processed exactly once  -  if a file is detected but the job fails before committing, it is reprocessed on restart. Supports: schema inference and evolution with cloudFiles.inferColumnTypes, cloudFiles.schemaEvolutionMode. vs COPY INTO: COPY INTO is a batch operation that rescans the directory; Auto Loader is streaming with efficient notification-based discovery. Use Auto Loader for streaming (Structured Streaming); use COPY INTO for one-time or infrequent batch loads.' },

  // ─── System Design (15): medium:8, hard:7 ──────────────────────────────────
  { id: 71, category: 'System Design', difficulty: 'medium', q: 'Explain the Lambda vs Kappa architecture and when you would choose each.', a: 'Lambda: batch layer (complete history, accurate reprocessing overnight) + speed layer (real-time, approximate) + serving layer (merges both views). Kappa: single streaming pipeline handles both real-time and historical reprocessing by replaying from Kafka. Choose Lambda: when batch accuracy is meaningfully higher than streaming accuracy, or you have significant legacy batch infrastructure. Choose Kappa: unified codebase (no duplicate logic in batch and streaming), when your streaming system can handle historical replay (Kafka retention or re-reading from object storage), and when your team prefers Spark Structured Streaming for everything. Modern trend: Kappa wins with Delta Lake + Structured Streaming enabling efficient reprocessing.' },
  { id: 72, category: 'System Design', difficulty: 'medium', q: 'What is Data Mesh and how does it address scaling problems?', a: 'Data Mesh decentralizes ownership: domain teams own their data as products rather than a central data team owning everything. Four principles: (1) Domain ownership  -  sales team owns sales data end-to-end, (2) Data as a product  -  discoverable, documented, with SLAs, (3) Self-serve platform  -  Unity Catalog, Databricks SQL, shared infrastructure with guardrails, (4) Federated governance  -  central policies (security, privacy), local implementation. Solves: central team bottleneck, domain expertise gap (central team cannot know every domain\'s data). Challenges: organizational change, duplicated infrastructure cost, data contract enforcement between domains.' },
  { id: 73, category: 'System Design', difficulty: 'medium', q: 'How do you implement SCD Type 2 (Slowly Changing Dimensions) in Delta Lake?', a: 'SCD2 tracks historical changes with is_current flag and effective dates. Delta MERGE approach:\nMERGE INTO dim_customer AS target\nUSING (\n  SELECT * FROM source_updates\n) AS source ON target.customer_id = source.customer_id AND target.is_current = true\nWHEN MATCHED AND source.address != target.address THEN\n  UPDATE SET is_current = false, end_date = current_date()\nWHEN NOT MATCHED THEN\n  INSERT (customer_id, address, is_current, start_date, end_date)\n  VALUES (source.customer_id, source.address, true, current_date(), null);\nChallenge: detecting changes efficiently at scale  -  use Change Data Feed from the source Delta table to get only modified rows.' },
  { id: 74, category: 'System Design', difficulty: 'medium', q: 'How would you design a data pipeline monitoring and alerting system?', a: 'Four pillars: (1) Pipeline health metrics  -  job duration, row count, bytes written, SLA adherence  -  emit as structured logs from notebooks to Azure Monitor, (2) Data quality metrics  -  completeness, uniqueness, freshness  -  use Great Expectations or dbt tests, emit results to a quality_metrics Delta table, (3) Alerting  -  Azure Monitor metric alerts for duration SLA, log-based alerts for job failures, Databricks Workflows email/Slack notifications on failure, (4) Observability dashboard  -  Azure Monitor Workbook or Power BI showing pipeline execution timeline, data volumes per table, quality scores over time. Critical: alert on DATA anomalies (volume drop), not just job failures  -  a pipeline can succeed and still produce wrong data.' },
  { id: 75, category: 'System Design', difficulty: 'medium', q: 'How do you implement incremental loading vs full refresh? When do you choose each?', a: 'Full refresh: truncate and reload entire table each run. Simple, always consistent. Use when: table is small (< 1GB), no natural watermark, source supports full export. Incremental: only process new/changed records since last run. Use when: table is large, source has a watermark (updated_at, created_at), or data is append-only. Implementation: store last_run_timestamp in a control table, query source WHERE updated_at > last_run_timestamp. Risk: missed updates (if updated_at is not indexed or updates are backdated). For Delta Lake: use CDF (Change Data Feed) for CDC-based incrementals. Hybrid: full refresh daily for small dimensions, incremental hourly for large fact tables.' },
  { id: 76, category: 'System Design', difficulty: 'medium', q: 'What are the different types of slowly changing dimensions and when do you use each?', a: 'SCD0: no history  -  overwrite. Use for: stable attributes (date of birth, SSN). SCD1: overwrite current value. Use for: correcting errors where history is not needed. SCD2: add new row with version dates/flags. Use for: tracking history (customer address changes, price changes). SCD3: add a "previous value" column. Use for: only the most recent change matters and you only need one prior value. SCD4: separate history table. Use for: very high change frequency where the main table should not grow. SCD6 (hybrid 1+2+3): most flexible. In practice: SCD2 is the industry standard for slowly changing dimensions in data warehouses; SCD1 for simple attribute corrections.' },
  { id: 77, category: 'System Design', difficulty: 'medium', q: 'How would you design a cost optimization strategy for a cloud data platform on Azure?', a: 'Compute: (1) Databricks auto-scaling (min/max nodes), (2) Spot/preemptible instances for batch (60-80% discount), (3) Auto-terminate idle clusters, (4) Use Photon for query acceleration on columnar data (reduces compute hours), (5) Right-size clusters per workload (ETL vs BI queries need different specs). Storage: (1) Delta OPTIMIZE + VACUUM to remove old files, (2) ADLS lifecycle policies (move old Bronze to Cool/Archive tier), (3) Compression (Parquet Snappy/ZSTD). Orchestration: (1) Use Serverless Databricks for short-running SQL queries, (2) ADF has consumption-based pricing. Monitoring: Azure Cost Management + custom chargeback dashboards per team/pipeline.' },
  { id: 78, category: 'System Design', difficulty: 'medium', q: 'Explain the concept of a Feature Store and why it matters for ML pipelines.', a: 'A Feature Store is a centralized repository for ML features that: (1) defines features once, reuses across training and serving, (2) provides point-in-time correct feature lookups (avoids leakage), (3) serves features with low latency (<10ms) for online inference via Redis/Cosmos DB, (4) supports batch serving for offline training. Architecture: offline store (Delta tables, precomputed features) + online store (Redis, Cosmos DB, DynamoDB). Databricks Feature Store integrates with MLflow for automatic feature lineage  -  you can trace which features a model was trained on and reproduce it. Prevents training-serving skew (same pipeline computes features for training and inference).' },

  { id: 79, category: 'System Design', difficulty: 'hard', q: 'Design a real-time fraud detection pipeline processing 1M events/second.', a: 'Architecture: Event Hub (32 partitions, 1M/s throughput) → Databricks Structured Streaming (auto-scaled 16-64 nodes, Standard_DS5_v2, 64GB RAM each) → Feature computation (rolling window aggregations over 1hr, 24hr, 7-day) stored in Redis (< 1ms lookup) → Azure ML real-time endpoint for model scoring → Delta Lake Bronze (all events) + Silver (scored events with fraud probability). Key decisions: (1) Watermark for late event handling, (2) Checkpointing to ADLS for exactly-once, (3) Redis feature store for sub-millisecond feature serving, (4) Dead-letter queue for malformed events, (5) AQE for dynamic partition management. SLA: < 200ms P99 end-to-end, < 100ms for model scoring. Monitor: Event Hub lag, Spark processing time, Redis p99 latency.' },
  { id: 80, category: 'System Design', difficulty: 'hard', q: 'How do you implement idempotent pipelines?', a: 'Idempotent = running the same pipeline N times produces the same result as running it once. Techniques: (1) replaceWhere with date partition: df.write.option("replaceWhere", "date = \'2024-01-15\'").mode("overwrite")  -  overwrites only the affected partition, (2) MERGE with natural key: merges upsert  -  if duplicate source rows arrive, the WHEN MATCHED condition handles idempotency, (3) Delta streaming idempotency: txnAppId + txnVersion header ensures each micro-batch is written at most once even on retry, (4) Content-based dedup: compute SHA256 hash of row content as surrogate key, (5) Watermark table: track last processed batch_id, skip if already processed. Test by running the same pipeline twice and asserting identical output row counts and values.' },
  { id: 81, category: 'System Design', difficulty: 'hard', q: 'Design a pipeline to process 100TB of daily log data with exactly-once guarantees.', a: 'Ingestion: Event Hub Premium (90-day retention, 100 partitions) for streaming logs + ADF for batch file drops. Bronze: Databricks Auto Loader with Structured Streaming  -  cloudFiles format with checkpointing, writes to Delta partitioned by (date, source_system). Throughput calc: 100TB / 86400s ≈ 1.2GB/s → need ~20 nodes Standard_DS14_v2 (56GB RAM, 16 cores each). Silver: Structured Streaming MERGE for dedup using log_id as natural key; foreachBatch pattern to batch-merge 1000-row micro-batches. Gold: hourly Databricks Workflow aggregation job. Exactly-once: Kafka/Event Hub offsets + checkpointing + Delta idempotent writes. File compaction: OPTIMIZE ZORDER BY (service_name, timestamp) nightly. Cost: use ADLS lifecycle to move logs older than 90 days to Archive tier.' },
  { id: 82, category: 'System Design', difficulty: 'hard', q: 'Design a feature store for a recommendation system with < 10ms online serving.', a: 'Dual-store architecture: Offline store (Delta tables in Databricks Feature Store) for training and batch inference, Online store (Azure Cache for Redis, Standard C3 = 6GB, sub-1ms) for real-time serving. Pipeline: (1) Batch job (hourly) computes features (user activity counts, item embeddings, recency scores) from Silver Delta tables → writes to both offline Delta and online Redis, (2) Real-time job (1-min streaming) updates near-real-time signals (session-level features)  -  writes directly to Redis with TTL, (3) Serving layer: recommendation API reads from Redis (90% of features) with fallback to Delta for cold-start users. Point-in-time correctness: offline training uses Delta time travel to get feature values as they existed at training time, preventing leakage.' },
  { id: 83, category: 'System Design', difficulty: 'hard', q: 'How would you implement data versioning and rollback for a production Gold table?', a: 'Delta Lake provides built-in versioning via the transaction log. Strategies: (1) Time travel query: SELECT * FROM gold.revenue VERSION AS OF 10 to inspect previous state, (2) Restore: RESTORE TABLE gold.revenue TO VERSION AS OF 10  -  atomic restore to any prior version, (3) VACUUM control: set delta.deletedFileRetentionDuration = interval 30 days to keep history for 30 days, (4) Clone for safe experimentation: CREATE TABLE gold.revenue_test CLONE gold.revenue  -  full copy with independent history. Rollback procedure: (a) Identify bad version via DeltaTable.history(), (b) RESTORE to last good version, (c) Notify consumers, (d) Investigate root cause, (e) Re-run pipeline from corrected source. Add runId and pipeline_version columns to Gold for lineage.' },
  { id: 84, category: 'System Design', difficulty: 'hard', q: 'Design a multi-tenant data platform where each tenant\'s data is isolated.', a: 'Storage isolation: one ADLS Gen2 container per tenant (tenantA/bronze/silver/gold) with separate Managed Identity or Service Principal per tenant  -  no shared credentials. Compute isolation: separate Databricks clusters per tenant with cluster-level permissions (cluster-per-tenant or separate workspaces for strong isolation). Unity Catalog: separate catalog per tenant (tenant_a.silver.events) with column-level security for cross-tenant analytical queries. Network: Private Endpoints per tenant storage account, NSG rules to prevent cross-tenant traffic. Key challenges: (1) Noisy neighbor on shared compute  -  use cluster policies with max node limits per tenant, (2) Cost attribution  -  tag resources with tenant_id and use Azure Cost Management, (3) Schema management  -  tenant-specific schema evolution needs careful versioning. Compliance: log all cross-tenant access attempts.' },
  { id: 85, category: 'System Design', difficulty: 'hard', q: 'How do you implement CDC (Change Data Capture) from SQL Server OLTP to a Data Lake?', a: 'Architecture: SQL Server CDC enabled (tracks INSERT/UPDATE/DELETE in change tables) → ADF CDC connector reads cdc.fn_cdc_get_all_changes → writes to Bronze Delta (append, includes __$operation: 1=DELETE, 2=INSERT, 4=UPDATE). Silver layer applies changes via MERGE: (1) For UPDATEs (op=4): MERGE ON primary key → UPDATE matching rows, (2) For INSERTs (op=2): INSERT new rows, (3) For DELETEs (op=1): soft delete or hard DELETE. ADF Tumbling Window trigger ensures ordered, idempotent processing of change batches. Alternative: Debezium (open source) captures CDC events to Kafka → Structured Streaming to Delta. Latency: ADF CDC = minutes; Debezium = seconds. For sub-minute latency, use Debezium + Event Hub + Auto Loader.' },

  // ─── Behavioral (10): easy:5, medium:5 ────────────────────────────────────
  { id: 86, category: 'Behavioral', difficulty: 'easy', q: 'Tell me about a time you had to debug a data quality issue in production.', a: 'STAR framework: Situation  -  describe a specific incident (revenue numbers dropped 15%, pipeline appeared to succeed). Task  -  you were responsible for investigating and fixing it. Action  -  systematic debugging: (1) Checked Spark UI for job errors, (2) Used Delta time travel to compare yesterday vs today row counts, (3) Traced data lineage to Silver → found a filter condition introduced in a recent PR was too aggressive and dropped valid records, (4) Fixed the filter, reran the pipeline with replaceWhere. Result  -  data corrected within 2 hours, zero stakeholder data loss, added a dbt/Great Expectations test to assert minimum row count per day. Show: systematic thinking, communication during incident, prevention.' },
  { id: 87, category: 'Behavioral', difficulty: 'easy', q: 'How do you approach learning a new technology in the data engineering space?', a: 'My framework: (1) Official documentation for design philosophy (understand why it was built, not just how), (2) Hands-on: build a small project with real data  -  reading is not learning, (3) Understand failure modes: what breaks it? What are the known anti-patterns?, (4) Performance characteristics: when does it scale well? When does it fall over?, (5) Community resources: GitHub issues reveal real-world problems, Stack Overflow for common pitfalls. Example: learning Spark Structured Streaming  -  started with Databricks docs, built a small Kafka → Delta pipeline, then specifically tested what happens when the job crashes mid-batch, then read the GitHub issues for known watermark bugs. Learning means knowing when NOT to use a technology.' },
  { id: 88, category: 'Behavioral', difficulty: 'easy', q: 'What do you do when you inherit a poorly documented data pipeline?', a: 'Systematic approach: (1) Read the code end-to-end before touching anything, write down what you understand, (2) Run it in a dev environment with a small sample to see actual behavior, (3) Interview previous owners/stakeholders if available, (4) Add logging and observability before making changes, (5) Write tests capturing existing behavior before modifying  -  tests define "correct" behavior, (6) Document incrementally as you understand each piece. Never: rewrite everything at once (high risk), make changes without tests, assume it works correctly just because it\'s in production. Create a CLAUDE.md or wiki documenting: inputs, outputs, assumptions, known issues, dependency map.' },
  { id: 89, category: 'Behavioral', difficulty: 'easy', q: 'Tell me about a time you had to prioritize competing deadlines.', a: 'STAR: Situation  -  two high-priority asks at once: a data quality incident in production and a new feature request from a VP. Task  -  had to decide which to handle and how to communicate. Action  -  (1) Immediately communicated status to both stakeholders with honest ETAs, (2) Triaged the incident first (production data quality > new feature velocity  -  this is almost always the right call), (3) Got a colleague to do a first-pass on the new feature with my guidance while I fixed the incident, (4) Delivered the incident fix + delivered the feature 1 day later than originally committed. Result  -  incident resolved in 4 hours, feature delivered next day, stakeholders appreciated the proactive communication. Key message: show you can make priority decisions AND communicate them.' },
  { id: 90, category: 'Behavioral', difficulty: 'easy', q: 'How do you ensure the quality of your data pipelines before releasing to production?', a: 'Multi-layer quality strategy: (1) Unit tests  -  test transformation logic in isolation with small DataFrames (pytest + Chispa for PySpark), (2) Integration tests  -  run end-to-end against dev environment with production-schema test data, (3) Data quality assertions  -  Great Expectations or dbt tests on output tables (row count bounds, null rate, unique keys, referential integrity), (4) Peer code review  -  focus on business logic correctness and performance, (5) Parallel run  -  new and old pipelines run in parallel for 1-2 weeks, compare output row counts and sampled values, (6) Rollback plan  -  ensure Delta RESTORE can revert within 15 minutes if something goes wrong in production. Never release on Fridays.' },

  { id: 91, category: 'Behavioral', difficulty: 'medium', q: 'Describe a situation where you had to balance data quality vs. delivery speed.', a: 'STAR: Situation  -  sprint deadline with a partially validated dataset. Task  -  deliver a dashboard by Friday but data had 3% null rate in a key dimension. Action  -  (1) Quantified impact: 3% nulls in product_category affected 3% of revenue rows, (2) Proposed to stakeholders: ship with null-flagged rows and a data quality indicator visible in the dashboard, (3) Filed a tech debt ticket with P1 priority to investigate the null source in the upstream system, (4) Delivered on time with clear communication of the limitation. Result  -  dashboard shipped Friday, nulls fixed in 2 weeks via upstream fix. Key: quantify the tradeoff, do not silently hide data quality issues, track and resolve the debt. Shows pragmatism + accountability.' },
  { id: 92, category: 'Behavioral', difficulty: 'medium', q: 'How do you communicate pipeline failures to non-technical stakeholders?', a: 'Template: translate technical failure to business impact. Example: "The daily sales report for today is delayed by approximately 3 hours. This is because the payment processing system sent us data in an unexpected format this morning  -  no transactions were lost, they are just waiting to be processed. We expect the corrected report by 2pm EST and will send a notification when it\'s available." Key principles: (1) State the business impact first (not the technical error), (2) Give a concrete ETA, (3) Reassure on data integrity  -  was data lost? (4) Avoid jargon (no "Kafka lag", "schema mismatch"). Follow up with: root cause summary and what was put in place to prevent recurrence.' },
  { id: 93, category: 'Behavioral', difficulty: 'medium', q: 'Tell me about a time you significantly improved a pipeline\'s performance.', a: 'STAR: Situation  -  a daily pipeline taking 4 hours was approaching the 6-hour SLA window. Task  -  optimize to < 2 hours. Action  -  profiling first (Spark UI): (1) Found 80% of time was in one join stage with severe skew  -  one customer_id had 40% of all orders, (2) Applied salting to the skewed key (10 random salt values, exploded in dimension table), (3) Enabled AQE (spark.sql.adaptive.enabled=true) to auto-tune shuffle partitions, (4) Changed default 200 shuffle partitions to 800 (proportional to cluster size), (5) Added Z-ORDER on frequently filtered columns. Result  -  pipeline went from 4 hours to 45 minutes (5x improvement). The lesson: always profile before optimizing  -  skew is the most common root cause of slow Spark jobs.' },
  { id: 94, category: 'Behavioral', difficulty: 'medium', q: 'Describe how you\'ve worked with data scientists or analysts to deliver a data product.', a: 'Key theme: data engineers enable others, not just build pipelines. Example: working with a data scientist building a churn model. (1) Discovery meeting: understood their feature requirements (recency, frequency, monetary value + product usage metrics), (2) Built a feature pipeline writing to the Databricks Feature Store so features are reusable and versioned, (3) Used Delta change data feed so the data scientist always had the latest features without re-running the full pipeline, (4) Set up Great Expectations tests on the feature table so they knew the data was trustworthy, (5) Created documentation (data dictionary + lineage diagram). Result  -  model training time reduced from 3 hours to 20 minutes (pre-computed features). Lesson: understand the downstream use case, not just the technical spec.' },
  { id: 95, category: 'Behavioral', difficulty: 'medium', q: 'How do you handle disagreements with teammates on technical decisions?', a: 'Framework: disagree and commit with evidence. (1) First, make sure I fully understand their position  -  ask clarifying questions, restate their argument, (2) Present my alternative with concrete data: benchmarks, POC results, cost estimates  -  not just preference, (3) Identify the key trade-off: "Your approach is simpler to implement; mine is 3x faster but takes 2 more days to build  -  given our deadline, maybe yours is right," (4) If still disagreed: propose a time-boxed experiment (2-day POC) to let data decide, (5) Once a decision is made, fully commit regardless of whose view prevailed  -  no passive undermining. The goal is the best outcome for the team, not being right. I\'ve changed my position when teammates provided compelling evidence  -  that\'s a feature, not a bug.' },

  // ─── Scenario (10): medium:4, hard:6 ─────────────────────────────────────
  { id: 96, category: 'Scenario', difficulty: 'hard', q: 'You inherited a pipeline that takes 8 hours. Walk me through how you\'d diagnose and fix it.', a: 'Step 1  -  Gather baseline metrics: check Spark UI for the last N runs. Which stage is the bottleneck? What is the task distribution within that stage? Step 2  -  Identify root cause from Spark UI: (a) Skew: one task takes 4x longer than median → salt the join key or enable AQE skew join, (b) Shuffle size explosion: check "Shuffle Read/Write" bytes per stage  -  unexpected large shuffle means a missing broadcast or bad join order, (c) GC time > 10%: memory pressure → increase executor memory or reduce cache, (d) Too many small tasks (200 default on 100TB): increase shuffle.partitions, (e) Python UDFs: serialization overhead → replace with built-in functions or Pandas UDFs. Step 3  -  Apply fixes in order of expected impact. Step 4  -  Validate in dev: run on 10% sample, confirm 10x speedup expected. Step 5  -  Deploy with monitoring.' },
  { id: 97, category: 'Scenario', difficulty: 'hard', q: 'Your Delta table has 500,000 small files after months of streaming writes. How do you fix this?', a: '1. Compact with OPTIMIZE (target 1GB Parquet files):\n   OPTIMIZE silver.events;\n2. Add Z-ORDER on frequently filtered columns:\n   OPTIMIZE silver.events ZORDER BY (user_id, event_date);\n3. Remove obsolete files:\n   VACUUM silver.events RETAIN 168 HOURS; -- 7 days minimum\n4. Prevent recurrence:\n   ALTER TABLE silver.events SET TBLPROPERTIES (\n     "delta.autoOptimize.optimizeWrite" = "true",\n     "delta.autoOptimize.autoCompact" = "true"\n   );\n5. Schedule a weekly OPTIMIZE job in Databricks Workflows.\n6. For streaming: write with trigger(availableNow=True) for micro-batch instead of continuous triggers to reduce file creation frequency.\nResult: 500K files → ~500 1GB files. Query times typically improve 5-20x on small-file tables.' },
  { id: 98, category: 'Scenario', difficulty: 'medium', q: 'A data analyst reports that a KPI dropped by 30% overnight. How do you investigate?', a: '1. Confirm the drop with time travel:\n   SELECT COUNT(*), SUM(revenue)\n   FROM gold.revenue VERSION AS OF [yesterday version];\n   Compare with current values.\n2. Check pipeline run history (Databricks Workflows)  -  did the pipeline fail or run late?\n3. Inspect the Delta transaction log:\n   DESCRIBE HISTORY gold.revenue; -- look for unexpected DELETE or MERGE\n4. Compare Silver → Gold row counts for today vs yesterday to find where rows are lost.\n5. Check ADF pipeline logs for the upstream source  -  did the payment API or source system drop data?\n6. Sample comparison:\n   SELECT * FROM gold.revenue EXCEPT SELECT * FROM gold.revenue VERSION AS OF [yesterday];\nCommunicate immediately: "Investigating  -  will update in 30 minutes." Then: root cause + fix timeline + prevention measure (add row count alert: fire if today < yesterday * 0.8).' },
  { id: 99, category: 'Scenario', difficulty: 'hard', q: 'You need to backfill 2 years of historical data into a new Delta table. How do you approach this?', a: '1. Size estimation: 2 years * average daily volume = total GB. Size your cluster accordingly (general rule: 1 executor core per 10GB RAM).\n2. Partition strategy: partition by year/month to enable parallel monthly batches and incremental reruns.\n3. Batch processing loop (idempotent with replaceWhere):\n   for month in months:\n     df = spark.read.parquet(f"source/{month}")\n     df.write.format("delta").option("replaceWhere", f"year_month = \'{month}\'").save(path)\n4. Validate each batch: assert row count matches source.\n5. Monitor progress: count rows per partition after each batch.\n6. After all data loaded: OPTIMIZE + ZORDER for query performance.\n7. Run off-peak hours; use a large cluster for the initial load, then downsize for incremental.\n8. Validate completeness: row count comparison source vs Delta, spot-check 5 random records per month.\nDo not run all months in parallel  -  risk of overwhelming the source system and hard to debug failures.' },
  { id: 100, category: 'Scenario', difficulty: 'medium', q: 'How would you migrate a legacy on-premises ETL (SQL Server SSIS) to Azure/Databricks?', a: 'Phased migration (never big-bang): Phase 1  -  Replicate source data to ADLS Gen2 via ADF (lift existing data to cloud without changing transformations). Phase 2  -  Rebuild transformations as Databricks notebooks or DLT, targeting the same output schema. Run both pipelines in parallel. Phase 3  -  Validation: compare SSIS output vs Databricks output row counts + sample values for 2-4 weeks. Phase 4  -  Cutover: redirect consumers (Power BI, reports) to the new Delta tables. Phase 5  -  Decommission SSIS. Key principles: (1) Never do big-bang cutover, (2) The comparison/validation phase is the most important, (3) Use Delta MERGE for CDC from SQL Server via ADF SQL Server CDC connector, (4) Maintain same output table names/schemas initially to minimize consumer changes.' },
  { id: 101, category: 'Scenario', difficulty: 'hard', q: 'A streaming job has been running for 3 days. You notice memory usage is growing linearly. What\'s causing it and how do you fix it?', a: 'Root cause  -  unbounded state accumulation. Most common causes: (1) Streaming aggregations WITHOUT watermark: Spark keeps state for every key seen forever (open-ended windows grow unboundedly), (2) Streaming deduplication without watermark: stores all seen IDs in state, (3) mapGroupsWithState or flatMapGroupsWithState with state that is never expired, (4) Accumulating variables in the driver (e.g., growing list in foreachBatch function), (5) Cache/persist on a growing streaming DataFrame without unpersisting. Fix: (1) Add withWatermark("event_time", "2 hours") to all streaming aggregations  -  state older than watermark is purged, (2) For dedup: .withWatermark().dropDuplicatesWithinWatermark("id"), (3) Implement timeout in mapGroupsWithState, (4) Use GroupStateTimeout.EventTimeTimeout. Monitor: Structured Streaming UI → State Operators tab shows state size per operator.' },
  { id: 102, category: 'Scenario', difficulty: 'hard', q: 'Design a system to detect duplicate payments in real-time with < 100ms latency.', a: 'Architecture: Payment service → Event Hub (32 partitions, ordered per account_id) → Databricks Structured Streaming (micro-batch trigger 10s) → Redis dedup cache (sub-1ms TTL-based) → Delta Lake (idempotent MERGE). Dedup logic: compute a hash(payment_id + amount + merchant_id + timestamp_bucket_5min) as the idempotency key. Check Redis: if key exists → duplicate → route to DLQ; if not → set key with 24h TTL → write to Delta. Redis cluster: Azure Cache for Redis Enterprise P1 (6GB, 12K ops/sec). For exactly-once: checkpoint Kafka offsets + Delta txnAppId/txnVersion. For < 100ms: use foreachBatch → Redis check in bulk (pipeline 1000 keys at once → Redis MGET) → filter duplicates → write non-duplicates to Delta. Monitoring: alert if DLQ count > 0 in 5 minutes, alert if dedup rate > 5% (upstream bug).' },
  { id: 103, category: 'Scenario', difficulty: 'medium', q: 'Your pipeline is failing with a java.lang.OutOfMemoryError: GC overhead limit exceeded. How do you fix this?', a: 'This error means the JVM is spending > 98% of time on garbage collection with < 2% progress  -  typically caused by too much data in executor memory. Diagnostic steps: (1) Check Spark UI Executors tab for GC time per executor (> 10% is problematic), (2) Check if any operation collects large amounts of data (collect(), broadcast of large table), (3) Check for memory-intensive joins (sort-merge joins on large datasets). Fixes: (1) Increase executor memory: --executor-memory 16g or increase cluster VM size, (2) Reduce spark.sql.shuffle.partitions to have larger but fewer partitions (less per-partition memory pressure), (3) Enable AQE: auto-tunes partition sizes, (4) Replace sort-merge joins with broadcast joins for small dimensions, (5) Spill to disk: spark.memory.fraction 0.6 → 0.5 to leave more user memory, (6) Avoid Python UDFs  -  they put objects in Python memory space outside JVM management.' },
  { id: 104, category: 'Scenario', difficulty: 'hard', q: 'You have a Gold table used by 50 dashboards. A new requirement changes the schema in a breaking way. How do you handle this migration?', a: 'Zero-downtime breaking schema migration strategy: Phase 1  -  Dual-write period: update the pipeline to write BOTH old and new schemas simultaneously. New table: gold.revenue_v2 with new schema; old table gold.revenue continues unchanged. Phase 2  -  Consumer migration: work with dashboard owners to migrate dashboards to the new table one by one. Create a registry of consumers and track migration status. Phase 3  -  Deprecation notice: set a deprecation deadline (e.g., 30 days). Add a COMMENT on the old table: ALTER TABLE gold.revenue SET TBLPROPERTIES ("deprecation.note" = "Migrate to gold.revenue_v2 by 2024-03-01"). Phase 4  -  Cutover: once all 50 consumers are on v2, stop writing to old table. Phase 5  -  Cleanup: VACUUM old table, drop after 90 days. Key principle: never rename/drop a table used by consumers without a migration period. Automate monitoring: alert if old table is still being queried after deprecation deadline.' },
  { id: 105, category: 'Scenario', difficulty: 'hard', q: 'You\'re asked to build a pipeline that must meet a 5-minute SLA from event to dashboard refresh. How do you architect it?', a: 'SLA breakdown: Event Hub ingestion (< 30s) + Bronze write (< 60s) + Silver transformation (< 90s) + Gold aggregation (< 60s) + Dashboard refresh (< 60s) = ~5 minutes total. Architecture: (1) Bronze: Auto Loader with processingTime trigger of "60 seconds"  -  append to Delta partitioned by minute, (2) Silver: Structured Streaming with foreachBatch, 60s trigger, MERGE for dedup  -  write to Delta, (3) Gold: 3-minute tumbling window Databricks Workflow job (not streaming  -  simpler and cheaper), uses incremental MERGE reading only last 10 minutes of Silver data. Dashboard: Power BI Direct Query on Databricks SQL with 5-min auto-refresh. Cluster: always-on SQL warehouse (no startup time). Critical path: each step must complete in its time budget. Monitor: end-to-end latency metric from event_time to gold write_time stored in a latency_metrics Delta table. Alert if P95 > 4 minutes.' },
]

// ─── Coding Problems ─────────────────────────────────────────────────────────
const CODING_PROBLEMS: ICodingProblem[] = [
  {
    id: 1,
    title: 'Remove Duplicates  -  Keep Latest Record',
    description: 'Given a DataFrame with duplicate rows keyed on customer_id, keep only the most recent record based on updated_at.',
    solution: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Window partitioned by the natural key, ordered by recency
window = Window.partitionBy("customer_id").orderBy(F.desc("updated_at"))

deduplicated = (
    df
    .withColumn("_rn", F.row_number().over(window))
    .filter(F.col("_rn") == 1)
    .drop("_rn")
)

# Production approach: use Delta MERGE instead of overwriting
# to avoid rewriting the entire table on every run`
  },
  {
    id: 2,
    title: 'SCD Type 2 with Delta MERGE',
    description: 'Implement Slowly Changing Dimension Type 2  -  expire old rows and insert new versions when a customer\'s address changes.',
    solution: `from delta.tables import DeltaTable
from pyspark.sql import functions as F

delta_table = DeltaTable.forName(spark, "dim_customer")
updates = spark.table("source_customer_updates")

# Step 1: Expire changed rows
delta_table.alias("target").merge(
    updates.alias("source"),
    "target.customer_id = source.customer_id AND target.is_current = true"
).whenMatchedUpdate(
    condition="target.address != source.address",
    set={
        "is_current": "false",
        "end_date": "current_date()"
    }
).execute()

# Step 2: Insert new version of changed + net-new rows
new_rows = updates.join(
    spark.table("dim_customer").filter("is_current = true"),
    ["customer_id"], "left_anti"  # new customers
).union(
    updates.join(
        spark.table("dim_customer").filter("is_current = false AND end_date = current_date()"),
        ["customer_id"]  # customers whose row was just expired
    ).select(updates["*"])
).withColumn("is_current", F.lit(True)) \
 .withColumn("start_date", F.current_date()) \
 .withColumn("end_date", F.lit(None).cast("date"))

new_rows.write.format("delta").mode("append").saveAsTable("dim_customer")`
  },
  {
    id: 3,
    title: 'Rolling 7-Day Active Users',
    description: 'Calculate the number of distinct active users in the rolling 7-day window ending on each date.',
    solution: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Generate a calendar spine so every date has a row
dates = spark.sql("""
    SELECT sequence(
        date('2024-01-01'), date('2024-12-31'), interval 1 day
    ) AS dates
""").select(F.explode("dates").alias("date"))

# Daily active users
daily_active = (
    df.withColumn("date", F.to_date("event_time"))
      .groupBy("date", "user_id")
      .agg(F.lit(1).alias("active"))
)

# Join calendar × DAU data within 7-day window
# Using RANGE BETWEEN with date-as-long trick
dau_with_ts = daily_active.withColumn("ts", F.unix_timestamp("date"))

window_7d = (
    Window.partitionBy()   # no partition = global
          .orderBy("ts")
          .rangeBetween(-6 * 86400, 0)   # 7 days in seconds
)

rolling_7d = (
    dau_with_ts
    .withColumn("dau_7d", F.approx_count_distinct("user_id").over(window_7d))
    .groupBy("date")
    .agg(F.first("dau_7d").alias("rolling_7d_active_users"))
    .orderBy("date")
)
# Note: for exact counts use a daily join approach with explode + distinct`
  },
  {
    id: 4,
    title: 'First Purchase Per User',
    description: 'Find the first purchase (by timestamp) for each user from an orders table.',
    solution: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

window = Window.partitionBy("user_id").orderBy("purchased_at")

first_purchases = (
    orders
    .withColumn("rn", F.row_number().over(window))
    .filter(F.col("rn") == 1)
    .drop("rn")
    .select("user_id", "order_id", "amount", "purchased_at")
)

# Alternative: aggregation approach (faster when you only need the min date)
first_purchases_v2 = (
    orders
    .groupBy("user_id")
    .agg(F.min("purchased_at").alias("first_purchase_at"))
    .join(orders, ["user_id"])
    .filter(F.col("purchased_at") == F.col("first_purchase_at"))
    # handles ties by keeping all rows with the min timestamp
)`
  },
  {
    id: 5,
    title: 'Sessionization  -  Group Events Within 30-Min Windows',
    description: 'Assign a session_id to groups of user events where each event is within 30 minutes of the previous one.',
    solution: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

window = Window.partitionBy("user_id").orderBy("event_time")

sessions = (
    df
    # Time since the previous event for this user
    .withColumn("prev_event_time", F.lag("event_time").over(window))
    .withColumn(
        "seconds_since_prev",
        F.unix_timestamp("event_time") - F.unix_timestamp("prev_event_time")
    )
    # A new session starts if gap > 30 min OR it's the user's first event
    .withColumn(
        "is_session_start",
        F.when(
            F.col("seconds_since_prev").isNull() |
            (F.col("seconds_since_prev") > 30 * 60),
            1
        ).otherwise(0)
    )
    # Cumulative sum of session starts = session number per user
    .withColumn(
        "session_number",
        F.sum("is_session_start").over(window.rowsBetween(Window.unboundedPreceding, 0))
    )
    # Create globally unique session ID
    .withColumn("session_id", F.concat_ws("_", "user_id", "session_number"))
    .drop("prev_event_time", "seconds_since_prev", "is_session_start", "session_number")
)`
  },
  {
    id: 6,
    title: 'Year-over-Year Revenue Change by Product Category',
    description: 'Calculate the YoY revenue change (absolute and percentage) for each product category.',
    solution: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Aggregate revenue by year and category
yearly_revenue = (
    orders
    .withColumn("year", F.year("order_date"))
    .groupBy("year", "product_category")
    .agg(F.sum("amount").alias("revenue"))
)

window = Window.partitionBy("product_category").orderBy("year")

yoy = (
    yearly_revenue
    .withColumn("prev_year_revenue", F.lag("revenue", 1).over(window))
    .withColumn(
        "yoy_change_abs",
        F.col("revenue") - F.col("prev_year_revenue")
    )
    .withColumn(
        "yoy_change_pct",
        F.round(
            (F.col("revenue") - F.col("prev_year_revenue")) /
            F.col("prev_year_revenue") * 100,
            2
        )
    )
    .filter(F.col("prev_year_revenue").isNotNull())
    .orderBy("product_category", "year")
)`
  },
  {
    id: 7,
    title: 'Customers Who Bought A but NOT B',
    description: 'Find all customers who purchased product category A but have never purchased product category B.',
    solution: `from pyspark.sql import functions as F

bought_a = (
    orders
    .filter(F.col("product_category") == "A")
    .select("customer_id")
    .distinct()
)

bought_b = (
    orders
    .filter(F.col("product_category") == "B")
    .select("customer_id")
    .distinct()
)

# LEFT ANTI JOIN: keep rows from bought_a with NO match in bought_b
customers_a_not_b = bought_a.join(bought_b, "customer_id", "left_anti")

# Alternative using EXCEPT:
customers_a_not_b_v2 = bought_a.exceptAll(bought_b)

# SQL equivalent:
result_sql = spark.sql("""
    SELECT DISTINCT customer_id FROM orders WHERE product_category = 'A'
    EXCEPT
    SELECT DISTINCT customer_id FROM orders WHERE product_category = 'B'
""")`
  },
  {
    id: 8,
    title: 'Anomaly Detection Using Z-Score in PySpark',
    description: 'Flag transactions as anomalies when the amount is more than 3 standard deviations from the mean for that merchant.',
    solution: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

window = Window.partitionBy("merchant_id")

anomalies = (
    transactions
    .withColumn("mean_amount", F.avg("amount").over(window))
    .withColumn("std_amount", F.stddev("amount").over(window))
    .withColumn(
        "z_score",
        F.abs(
            (F.col("amount") - F.col("mean_amount")) /
            F.col("std_amount")
        )
    )
    .withColumn(
        "is_anomaly",
        F.when(F.col("z_score") > 3.0, True).otherwise(False)
    )
)

anomaly_summary = (
    anomalies
    .filter("is_anomaly = true")
    .groupBy("merchant_id")
    .agg(
        F.count("*").alias("anomaly_count"),
        F.sum("amount").alias("anomaly_amount"),
        F.avg("z_score").alias("avg_z_score")
    )
    .orderBy(F.desc("anomaly_count"))
)`
  },
  {
    id: 9,
    title: 'Kafka → Deduplicate → Delta with Exactly-Once',
    description: 'Read from Kafka, parse JSON events, deduplicate on event_id within the watermark window, and write to Delta Lake with exactly-once semantics.',
    solution: `from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, LongType, TimestampType

schema = StructType([
    StructField("event_id", StringType()),
    StructField("user_id", StringType()),
    StructField("event_type", StringType()),
    StructField("amount", LongType()),
    StructField("event_time", TimestampType()),
])

# 1. Read from Kafka
raw = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "eh-namespace.servicebus.windows.net:9093")
    .option("subscribe", "payments-topic")
    .option("startingOffsets", "earliest")
    .option("kafka.security.protocol", "SASL_SSL")
    .load()
)

# 2. Parse JSON payload
parsed = (
    raw
    .select(F.from_json(F.col("value").cast("string"), schema).alias("data"))
    .select("data.*")
)

# 3. Apply watermark + deduplicate (exactly-once dedup within watermark window)
deduped = (
    parsed
    .withWatermark("event_time", "10 minutes")        # allow 10-min late data
    .dropDuplicatesWithinWatermark(["event_id"])       # Spark 3.5+ API
)

# 4. Write to Delta with checkpointing (provides exactly-once end-to-end)
query = (
    deduped
    .writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "abfss://checkpoints@account.dfs.core.windows.net/payments/")
    .trigger(processingTime="60 seconds")
    .toTable("silver.payments")
)

query.awaitTermination()`
  },
  {
    id: 10,
    title: 'YoY Revenue with Running Total  -  Combined Window Functions',
    description: 'For each month, compute: total revenue, cumulative YTD revenue, and YoY revenue growth percentage. A common senior-level coding challenge.',
    solution: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Monthly revenue aggregation
monthly = (
    orders
    .withColumn("year", F.year("order_date"))
    .withColumn("month", F.month("order_date"))
    .groupBy("year", "month")
    .agg(F.sum("amount").alias("monthly_revenue"))
)

# Window for YTD cumulative (reset at start of each year)
ytd_window = (
    Window.partitionBy("year")
    .orderBy("month")
    .rowsBetween(Window.unboundedPreceding, 0)
)

# Window for YoY comparison (previous year's same month)
yoy_window = Window.partitionBy("month").orderBy("year")

result = (
    monthly
    .withColumn("ytd_revenue", F.sum("monthly_revenue").over(ytd_window))
    .withColumn("prev_year_revenue", F.lag("monthly_revenue", 1).over(yoy_window))
    .withColumn(
        "yoy_growth_pct",
        F.round(
            (F.col("monthly_revenue") - F.col("prev_year_revenue")) /
            F.col("prev_year_revenue") * 100, 2
        )
    )
    .select("year", "month", "monthly_revenue", "ytd_revenue",
            "prev_year_revenue", "yoy_growth_pct")
    .orderBy("year", "month")
)`
  },
]

const CATEGORIES = ['All', 'SQL', 'PySpark', 'Azure', 'System Design', 'Behavioral', 'Scenario']
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard']
const CATEGORY_COLORS: Record<string, string> = {
  SQL: '#f59e0b', PySpark: '#f97316', Azure: '#0078d4',
  'System Design': '#8b5cf6', Behavioral: '#22c55e', Scenario: '#ef4444'
}

const STATS = [
  { label: 'SQL', count: 25, color: '#f59e0b' },
  { label: 'PySpark', count: 25, color: '#f97316' },
  { label: 'Azure', count: 20, color: '#0078d4' },
  { label: 'System Design', count: 15, color: '#8b5cf6' },
  { label: 'Behavioral', count: 10, color: '#22c55e' },
  { label: 'Scenario', count: 10, color: '#ef4444' },
]

const CERTIFICATIONS = [
  {
    name: 'DP-203: Azure Data Engineer Associate',
    org: 'Microsoft',
    topics: ['Azure Storage', 'ADF', 'Synapse', 'Databricks', 'Streaming', 'Security'],
    color: '#0078d4',
    prep: '3-4 months',
    resources: ['Microsoft Learn DP-203 path', 'John Savill Azure Study Cram', 'Whizlabs practice exams'],
  },
  {
    name: 'Databricks Data Engineer Professional',
    org: 'Databricks',
    topics: ['Delta Lake', 'DLT', 'Unity Catalog', 'Spark Tuning', 'Streaming', 'Security'],
    color: '#ef4444',
    prep: '4-6 months',
    resources: ['Databricks Academy DE Pro course', 'Official practice exam', 'Delta Lake docs'],
  },
  {
    name: 'AZ-900: Azure Fundamentals',
    org: 'Microsoft',
    topics: ['Cloud Concepts', 'Azure Services', 'Security', 'Pricing', 'SLAs'],
    color: '#0078d4',
    prep: '1-2 weeks',
    resources: ['Microsoft Learn AZ-900 path', 'Andrew Brown free course (YouTube)', 'MeasureUp practice tests'],
  },
  {
    name: 'AWS Data Engineer Associate (DEA-C01)',
    org: 'Amazon Web Services',
    topics: ['S3', 'Glue', 'Redshift', 'Kinesis', 'Athena', 'Lake Formation'],
    color: '#f97316',
    prep: '2-3 months',
    resources: ['AWS Skill Builder', 'Stéphane Maarek Udemy course', 'TutorialsDojo practice tests'],
  },
]

export default function Interview({ completed: _completed }: Props) {
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('all')
  const [openIds, setOpenIds] = useState<Set<number>>(new Set())
  const [openCodingIds, setOpenCodingIds] = useState<Set<number>>(new Set())
  const [activeSection, setActiveSection] = useState<'questions' | 'coding'>('questions')

  const filtered = QUESTIONS.filter(q =>
    (category === 'All' || q.category === category) &&
    (difficulty === 'all' || q.difficulty === difficulty)
  )

  const toggle = (id: number) => {
    const next = new Set(openIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setOpenIds(next)
  }

  const toggleCoding = (id: number) => {
    const next = new Set(openCodingIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setOpenCodingIds(next)
  }

  const expandAll = () => setOpenIds(new Set(filtered.map(q => q.id)))
  const collapseAll = () => setOpenIds(new Set())

  return (
    <div style={{ marginTop: 'var(--topbar-h)', padding: '40px 48px', maxWidth: 960, margin: 'var(--topbar-h) auto 0' }}>
      {/* Header */}
      <div className="topic-header">
        <div className="topic-eyebrow">Interview Preparation</div>
        <h1 className="topic-title">105+ Interview Questions</h1>
        <p className="topic-desc">
          Curated questions for Data Engineer / Azure Data Engineer roles at Microsoft, Databricks, Google, Meta, and Amazon.
          Covers SQL, PySpark, Azure, System Design, Behavioral, and Scenario categories with 10 PySpark coding problems.
          Click any question to reveal the detailed answer.
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12, marginBottom: 32 }}>
        {STATS.map(s => (
          <div
            key={s.label}
            onClick={() => { setCategory(s.label); setActiveSection('questions') }}
            style={{
              background: 'white', border: '1px solid var(--border)', borderTop: `3px solid ${s.color}`,
              borderRadius: 'var(--radius-lg)', padding: '12px 14px', cursor: 'pointer',
              transition: 'box-shadow .15s', boxShadow: category === s.label ? `0 0 0 2px ${s.color}40` : undefined,
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
        <div
          onClick={() => setActiveSection('coding')}
          style={{
            background: 'white', border: '1px solid var(--border)', borderTop: '3px solid #06b6d4',
            borderRadius: 'var(--radius-lg)', padding: '12px 14px', cursor: 'pointer',
            boxShadow: activeSection === 'coding' ? '0 0 0 2px #06b6d440' : undefined,
          }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#06b6d4' }}>10</div>
          <div style={{ fontSize: '.78rem', color: 'var(--text-3)', fontWeight: 600 }}>Coding Problems</div>
        </div>
      </div>

      {/* Section Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['questions', 'coding'] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            style={{
              padding: '7px 20px', borderRadius: 'var(--radius-full)', fontSize: '.85rem', fontWeight: 700,
              cursor: 'pointer', border: '1.5px solid var(--border)',
              background: activeSection === s ? 'var(--gray-900)' : 'white',
              color: activeSection === s ? 'white' : 'var(--text-2)',
            }}
          >
            {s === 'questions' ? 'Interview Questions' : 'Coding Problems'}
          </button>
        ))}
      </div>

      {/* ── INTERVIEW QUESTIONS SECTION ── */}
      {activeSection === 'questions' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: '.8rem', fontWeight: 700,
                    cursor: 'pointer', border: '1.5px solid var(--border)',
                    background: category === c ? (CATEGORY_COLORS[c] ?? 'var(--blue-500)') : 'white',
                    color: category === c ? 'white' : 'var(--text-2)', transition: 'all .15s',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '.78rem', fontWeight: 700,
                    cursor: 'pointer', border: '1.5px solid var(--border)',
                    background: difficulty === d ? 'var(--gray-800)' : 'white',
                    color: difficulty === d ? 'white' : 'var(--text-2)',
                  }}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '.84rem', color: 'var(--text-4)' }}>
              Showing <strong>{filtered.length}</strong> questions
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={expandAll}
                style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-2)' }}
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-2)' }}
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Question Cards */}
          <div>
            {filtered.map(q => (
              <div key={q.id} className="interview-card" style={{ marginBottom: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white' }}>
                <div
                  className="interview-q"
                  onClick={() => toggle(q.id)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
                    <div className="interview-q-num" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: 'var(--text-3)' }}>{q.id}</div>
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '.68rem', fontWeight: 700, background: CATEGORY_COLORS[q.category] + '20', color: CATEGORY_COLORS[q.category] }}>{q.category}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '.68rem', fontWeight: 700,
                      background: q.difficulty === 'hard' ? '#fee2e2' : q.difficulty === 'medium' ? '#fef3c7' : '#dcfce7',
                      color: q.difficulty === 'hard' ? '#dc2626' : q.difficulty === 'medium' ? '#d97706' : '#16a34a',
                    }}>{q.difficulty}</span>
                  </div>
                  <div className="interview-q-text" style={{ flex: 1, fontWeight: 600, fontSize: '.9rem', lineHeight: 1.55 }}>{q.q}</div>
                  <span style={{ color: 'var(--text-4)', fontSize: '.8rem', transform: openIds.has(q.id) ? 'rotate(180deg)' : '', transition: 'transform .2s', flexShrink: 0, paddingTop: 4 }}>▼</span>
                </div>
                {openIds.has(q.id) && (
                  <div style={{ padding: '12px 18px 16px 72px', fontSize: '.87rem', color: 'var(--text-2)', lineHeight: 1.8, borderTop: '1px solid var(--border)', whiteSpace: 'pre-line' }}>
                    {q.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CODING PROBLEMS SECTION ── */}
      {activeSection === 'coding' && (
        <div>
          <div style={{ marginBottom: 24, padding: '16px 20px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-xl)', fontSize: '.88rem', color: '#0369a1', lineHeight: 1.65 }}>
            <strong>About these problems:</strong> These are the most common PySpark coding patterns tested in senior Data Engineer interviews at Microsoft, Databricks, and Amazon. Each problem tests your ability to write production-quality code using window functions, Delta MERGE, and Structured Streaming.
          </div>
          {CODING_PROBLEMS.map(p => (
            <div key={p.id} style={{ marginBottom: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white' }}>
              <div
                onClick={() => toggleCoding(p.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 18px', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#06b6d420', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: '#0891b2', flexShrink: 0 }}>{p.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.92rem', marginBottom: 4, color: 'var(--text-1)' }}>{p.title}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{p.description}</div>
                </div>
                <span style={{ color: 'var(--text-4)', fontSize: '.8rem', transform: openCodingIds.has(p.id) ? 'rotate(180deg)' : '', transition: 'transform .2s', flexShrink: 0, paddingTop: 4 }}>▼</span>
              </div>
              {openCodingIds.has(p.id) && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px' }}>
                  <pre style={{
                    background: '#0f172a', color: '#e2e8f0', padding: '20px 22px', borderRadius: 'var(--radius-lg)',
                    fontSize: '.78rem', lineHeight: 1.7, overflow: 'auto', margin: 0,
                    fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace', whiteSpace: 'pre',
                  }}>
                    {p.solution}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── CERTIFICATION GUIDE ── */}
      <div style={{ marginTop: 56, padding: 32, background: 'linear-gradient(135deg,#eff6ff,#faf5ff)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)' }}>
        <h2 style={{ marginBottom: 8 }}>Certification Guide</h2>
        <p style={{ fontSize: '.88rem', color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>
          Recommended certifications for Data Engineer / Azure Data Engineer roles, ordered by career impact.
          Complete DP-203 + Databricks DE Professional for the strongest Azure Data Engineer profile.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {CERTIFICATIONS.map(cert => (
            <div key={cert.name} style={{ background: 'white', border: '1px solid var(--border)', borderTop: `3px solid ${cert.color}`, borderRadius: 'var(--radius-xl)', padding: 20 }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.05em' }}>{cert.org}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.93rem', marginBottom: 12, color: cert.color, lineHeight: 1.35 }}>{cert.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                {cert.topics.map(t => (
                  <span key={t} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--gray-100)', fontSize: '.68rem', fontWeight: 600, color: 'var(--text-2)' }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginBottom: 10 }}>
                Prep time: <strong style={{ color: 'var(--text-1)' }}>{cert.prep}</strong>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '.04em' }}>Study Resources</div>
                <ul style={{ margin: 0, paddingLeft: 14 }}>
                  {cert.resources.map(r => (
                    <li key={r} style={{ fontSize: '.76rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STUDY TIPS ── */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {[
          { title: 'SQL Study Path', color: '#f59e0b', tips: ['Master window functions (RANK, LEAD, LAG, SUM OVER)', 'Practice recursive CTEs for hierarchy problems', 'Understand query execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY', 'Learn query plan reading (EXPLAIN ANALYZE)'] },
          { title: 'PySpark Study Path', color: '#f97316', tips: ['Build 3 end-to-end streaming pipelines with checkpointing', 'Read Spark UI: understand stage/task view, GC time, shuffle bytes', 'Benchmark: UDF vs Pandas UDF vs built-in functions', 'Learn AQE, DPP, and Tungsten code generation'] },
          { title: 'System Design Study Path', color: '#8b5cf6', tips: ['Design a Lambda vs Kappa pipeline for the same use case', 'Build a full Bronze/Silver/Gold Medallion pipeline', 'Study the papers: Spark (Zaharia), Delta Lake (Armbrust)', 'Practice out loud: 45-min mock design sessions'] },
        ].map(section => (
          <div key={section.title} style={{ background: 'white', border: '1px solid var(--border)', borderTop: `3px solid ${section.color}`, borderRadius: 'var(--radius-xl)', padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.92rem', marginBottom: 14, color: section.color }}>{section.title}</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {section.tips.map(tip => (
                <li key={tip} style={{ fontSize: '.78rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 2 }}>{tip}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
