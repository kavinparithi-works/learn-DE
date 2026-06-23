import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 9 - Production DE', items: [
    { id: 'prod-architecture', label: 'Data Architecture Patterns' },
    { id: 'prod-cicd', label: 'CI/CD for Data Pipelines' },
    { id: 'prod-terraform', label: 'Infrastructure as Code (Terraform)' },
    { id: 'prod-testing', label: 'Testing Data Pipelines' },
    { id: 'prod-observability', label: 'Observability and Monitoring' },
    { id: 'prod-cost', label: 'Cost Optimization' },
    { id: 'prod-patterns', label: 'Enterprise Patterns' },
  ]},
]

export default function Production({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('prod-architecture')
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

        <section id="prod-architecture" ref={el => { if (el) sectionRefs.current['prod-architecture'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Data Architecture Patterns</h1>
            <p className="topic-desc">Choosing the right architecture pattern depends on scale, latency requirements, team size, and organizational structure.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { name: 'Lambda Architecture', desc: 'Batch layer (historical) + Speed layer (real-time) + Serving layer. Complex to maintain two codebases.', pro: 'Low latency + history', con: 'Duplicate logic', color: '#4f8ef7' },
              { name: 'Kappa Architecture', desc: 'Everything is a stream. Replay historical data through streaming pipeline. Simpler - one codebase.', pro: 'Unified codebase', con: 'Streaming cost', color: '#8b5cf6' },
              { name: 'Data Mesh', desc: 'Decentralized - domain teams own their data products. Central governance via Unity Catalog.', pro: 'Scales with org', con: 'Coordination overhead', color: '#22c55e' },
              { name: 'Lakehouse (preferred)', desc: 'ADLS Gen2 + Delta Lake + Databricks. Combines data lake economics with warehouse performance. Current best practice.', pro: 'Best of both worlds', con: 'Databricks costs', color: '#f59e0b' },
            ].map(p => (
              <div key={p.name} style={{ background: 'white', border: `1.5px solid ${p.color}30`, borderTop: `3px solid ${p.color}`, borderRadius: 'var(--radius-lg)', padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: p.color, marginBottom: 8 }}>{p.name}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 10 }}>{p.desc}</div>
                <div style={{ fontSize: '.75rem' }}>
                  <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>+ {p.pro}</span><br/>
                  <span style={{ color: 'var(--red-500)', fontWeight: 600 }}>- {p.con}</span>
                </div>
              </div>
            ))}
          </div>
          <Quiz topicId="prod-architecture" questions={[
            { question: "What is the main advantage of Kappa over Lambda architecture?", options: ["Better performance", "Single unified codebase - no duplicate batch/streaming logic to maintain", "Lower cost", "Better data quality"], correct: 1 },
            { question: "What is Data Mesh's core principle?", options: ["Centralized data team owns everything", "Domain teams own their data products; governance is federated", "One big data warehouse", "Real-time only processing"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('prod-architecture'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="prod-cicd" ref={el => { if (el) sectionRefs.current['prod-cicd'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">CI/CD for Data Pipelines</h1>
          </div>
          <CodeBlock lang="yaml">{`# .github/workflows/deploy-pipeline.yml
name: Deploy Data Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install pyspark pytest great_expectations
      - run: pytest tests/ -v --tb=short
      - run: python -m py_compile src/**/*.py

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install ruff mypy
      - run: ruff check src/
      - run: mypy src/ --ignore-missing-imports

  deploy-staging:
    needs: [test, lint]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Databricks Staging
        run: |
          pip install databricks-cli
          databricks workspace import-dir notebooks/ /Pipelines/ --overwrite
          databricks jobs reset --job-id $STAGING_JOB_ID --json @job_config.json
        env:
          DATABRICKS_HOST: \$\{\{ secrets.DATABRICKS_HOST_STAGING \}\}
          DATABRICKS_TOKEN: \$\{\{ secrets.DATABRICKS_TOKEN_STAGING \}\}`}</CodeBlock>
          <Quiz topicId="prod-cicd" questions={[
            { question: "In a CI/CD pipeline, what should run on every Pull Request?", options: ["Deploy to production", "Tests, linting, and type checking to catch issues before merge", "Only documentation builds", "Performance benchmarks only"], correct: 1 },
            { question: "Why should secrets like Databricks tokens not be in GitHub workflow files?", options: ["They make files too large", "They would be exposed in git history - use GitHub Secrets instead", "GitHub doesn't support tokens", "They slow down CI"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('prod-cicd'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="prod-terraform" ref={el => { if (el) sectionRefs.current['prod-terraform'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Infrastructure as Code with Terraform</h1>
          </div>
          <CodeBlock lang="hcl">{`# main.tf - Azure Data Platform infrastructure
terraform {
  required_providers {
    azurerm    = { source = "hashicorp/azurerm",    version = "~> 3.80" }
    databricks = { source = "databricks/databricks", version = "~> 1.30" }
  }
  backend "azurerm" {
    resource_group_name  = "tf-state-rg"
    storage_account_name = "tfstateaccount"
    container_name       = "tfstate"
    key                  = "de-platform.tfstate"
  }
}

# ADLS Gen2 Storage Account
resource "azurerm_storage_account" "datalake" {
  name                     = "dedatalake\${var.env}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  is_hns_enabled           = true  # REQUIRED for ADLS Gen2

  network_rules {
    default_action = "Deny"
    virtual_network_subnet_ids = [azurerm_subnet.databricks_private.id]
  }
}

# Databricks Workspace
resource "azurerm_databricks_workspace" "main" {
  name                = "databricks-\${var.env}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  sku                 = "premium"

  custom_parameters {
    virtual_network_id                                   = azurerm_virtual_network.main.id
    public_subnet_name                                   = azurerm_subnet.databricks_public.name
    private_subnet_name                                  = azurerm_subnet.databricks_private.name
    no_public_ip                                         = true  # secure cluster connectivity
  }
}`}</CodeBlock>
          <Quiz topicId="prod-terraform" questions={[
            { question: "Why use Terraform remote state (backend) instead of local state?", options: ["It's faster", "Team members share state file; prevents concurrent modifications; survives local machine loss", "Required by Azure", "It enables plan mode"], correct: 1 },
            { question: "What does is_hns_enabled = true do in an Azure storage account?", options: ["Enables HTTPS", "Enables Hierarchical Namespace (required for ADLS Gen2 features)", "Enables hot storage tier", "Enables network rules"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('prod-terraform'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="prod-testing" ref={el => { if (el) sectionRefs.current['prod-testing'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Testing Data Pipelines</h1>
          </div>
          <CodeBlock lang="python">{`import pytest
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, LongType, StringType, DecimalType
from decimal import Decimal

@pytest.fixture(scope="session")
def spark():
    return SparkSession.builder.master("local[2]").appName("test").getOrCreate()

def test_silver_deduplication(spark):
    """Verify deduplication removes exact duplicates."""
    schema = StructType([
        StructField("event_id", LongType()),
        StructField("user_id", LongType()),
        StructField("amount", DecimalType(18, 2))
    ])
    input_data = [(1, 100, Decimal("50.00")), (1, 100, Decimal("50.00")), (2, 101, Decimal("100.00"))]
    df = spark.createDataFrame(input_data, schema)

    result = deduplicate_events(df)

    assert result.count() == 2, f"Expected 2 rows after dedup, got {result.count()}"
    assert result.filter("event_id = 1").count() == 1

def test_null_amount_rejected(spark):
    """Verify null amounts fail the DQ expectation."""
    data = [(1, 100, None), (2, 101, Decimal("50.00"))]
    df = spark.createDataFrame(data, ["event_id", "user_id", "amount"])
    result = apply_data_quality(df)
    assert result.filter("amount IS NULL").count() == 0

# Great Expectations for production DQ
import great_expectations as gx

context = gx.get_context()
batch = context.sources.pandas_default.read_dataframe(df.toPandas())
suite = context.add_expectation_suite("silver.events")
suite.expect_column_values_to_not_be_null("event_id")
suite.expect_column_values_to_be_between("amount", 0, 1_000_000)
suite.expect_column_values_to_be_in_set("status", {"pending", "complete", "cancelled"})`}</CodeBlock>
          <Quiz topicId="prod-testing" questions={[
            { question: "Why use scope='session' for the Spark fixture in pytest?", options: ["Required by PySpark", "Create one SparkSession shared across all tests, avoiding expensive startup per test", "Enables parallel tests", "For fixture cleanup"], correct: 1 },
            { question: "What is Great Expectations used for?", options: ["Unit testing business logic", "Declarative data quality validation - define expectations, run against data, generate reports", "Load testing pipelines", "Schema migration"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('prod-testing'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="prod-observability" ref={el => { if (el) sectionRefs.current['prod-observability'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Observability and Monitoring</h1>
          </div>
          <CodeBlock lang="python">{`# Three pillars of observability: Metrics, Logs, Traces

import logging, time
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# 1. STRUCTURED LOGGING
logger = logging.getLogger("pipeline.silver")

def process_batch(batch_id: int, df):
    start = time.perf_counter()
    row_count = df.count()
    logger.info("batch_started", extra={"batch_id": batch_id, "input_rows": row_count})
    try:
        result = transform(df)
        duration = time.perf_counter() - start
        logger.info("batch_complete", extra={
            "batch_id": batch_id,
            "input_rows": row_count,
            "output_rows": result.count(),
            "duration_seconds": round(duration, 2),
        })
        return result
    except Exception as e:
        logger.error("batch_failed", extra={"batch_id": batch_id, "error": str(e)}, exc_info=True)
        raise

# 2. DATA QUALITY METRICS (publish to Azure Monitor)
from azure.monitor.opentelemetry import configure_azure_monitor
configure_azure_monitor(connection_string="InstrumentationKey=...")

meter = metrics.get_meter("pipeline.dq")
null_counter  = meter.create_counter("dq.null_records")
late_counter  = meter.create_counter("dq.late_arrivals")
row_gauge     = meter.create_gauge("pipeline.row_count")

# 3. SLA ALERTS (KQL in Azure Monitor)
# Alert: pipeline hasn't written in 2 hours
# customEvents | where name == "batch_complete" | where timestamp > ago(2h) | count`}</CodeBlock>
          <Quiz topicId="prod-observability" questions={[
            { question: "What are the three pillars of observability?", options: ["Input, Processing, Output", "Metrics, Logs, Traces", "CPU, Memory, Network", "Development, Staging, Production"], correct: 1 },
            { question: "Why use structured logging (extra={...} dicts) instead of string interpolation?", options: ["It's faster", "Structured fields are queryable in log analytics tools (Azure Monitor, Splunk)", "It uses less storage", "Required by Python 3.10+"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('prod-observability'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="prod-cost" ref={el => { if (el) sectionRefs.current['prod-cost'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Cost Optimization</h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {[
              { area: 'Databricks Compute', tips: ['Use Spot instances for non-critical batch workloads (70-90% cheaper)', 'Right-size clusters - monitor CPU/memory utilization', 'Use Serverless compute for interactive workloads', 'Auto-terminate idle clusters (default 30-60 min)'], color: '#ef4444' },
              { area: 'ADLS Gen2 Storage', tips: ['Lifecycle policies: hot -> cool (30d) -> archive (90d)', 'OPTIMIZE Delta tables to reduce file count (fewer API calls)', 'VACUUM regularly to remove unreferenced files', 'Use Parquet with Snappy compression (2-5x smaller than CSV)'], color: '#3b82f6' },
              { area: 'Data Transfer', tips: ['Keep compute and storage in the same region', 'Use VNet peering instead of public internet routing', 'Batch small writes into larger partitions', 'Enable columnar compression to reduce network bytes'], color: '#8b5cf6' },
            ].map(c => (
              <div key={c.area} style={{ background: 'white', border: '1px solid var(--border)', borderLeft: `3px solid ${c.color}`, borderRadius: 'var(--radius-lg)', padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: c.color, marginBottom: 8 }}>{c.area}</div>
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {c.tips.map(t => <li key={t} style={{ fontSize: '.84rem', color: 'var(--text-2)', marginBottom: 4 }}>{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <Quiz topicId="prod-cost" questions={[
            { question: "What is the biggest cost driver for most Databricks deployments?", options: ["Storage", "Compute (DBUs) - especially when clusters are idle or over-provisioned", "Network egress", "License fees"], correct: 1 },
            { question: "Why should you run OPTIMIZE regularly on Delta tables?", options: ["Improves data quality", "Compacts small files reducing API call costs and improving query performance", "Required for time travel", "Updates table statistics"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('prod-cost'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="prod-patterns" ref={el => { if (el) sectionRefs.current['prod-patterns'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Enterprise Patterns</h1>
          </div>
          <CodeBlock lang="python">{`# Pattern 1: Idempotent pipelines (safe to re-run)
# Use replaceWhere instead of overwrite (faster, safer)
df.write.format("delta") \\
    .option("replaceWhere", "date = '2024-01-15'") \\
    .mode("overwrite") \\
    .table("gold.revenue")

# Pattern 2: Watermark-based incremental processing
last_watermark = spark.sql(
    "SELECT MAX(processed_at) FROM control.pipeline_watermarks WHERE pipeline = 'events'"
).collect()[0][0] or "1970-01-01"

new_data = spark.read.table("silver.events") \\
    .filter(f"updated_at > '{last_watermark}'")

process_and_write(new_data)

spark.sql(f"""
    MERGE INTO control.pipeline_watermarks t USING
    (SELECT 'events' as pipeline, current_timestamp() as processed_at) s
    ON t.pipeline = s.pipeline
    WHENMATCHED THEN UPDATE SET t.processed_at = s.processed_at
    WHENNOTMATCHED THEN INSERT *
""")

# Pattern 3: Dead letter queue for bad records
good_records, bad_records = df.filter("amount IS NOT NULL"), df.filter("amount IS NULL")
bad_records.withColumn("error_reason", lit("null_amount")) \\
    .withColumn("failed_at", current_timestamp()) \\
    .write.format("delta").mode("append").table("bronze.dead_letter")

# Pattern 4: Schema evolution with backwards compatibility
spark.sql("ALTER TABLE silver.events ADD COLUMNS (new_field STRING)")`}</CodeBlock>
          <Quiz topicId="prod-patterns" questions={[
            { question: "Why use replaceWhere instead of mode('overwrite') for partition updates?", options: ["replaceWhere is atomic and only rewrites the matching partition, not the entire table", "replaceWhere is faster to type", "overwrite is deprecated", "replaceWhere supports multiple tables"], correct: 0 },
            { question: "What is a Dead Letter Queue in data engineering?", options: ["A queue for low-priority messages", "A storage location for records that failed processing, for later inspection/reprocessing", "A performance optimization queue", "A backup storage tier"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('prod-patterns'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

      </main>
    </div>
  )
}
