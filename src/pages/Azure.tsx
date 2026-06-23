import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 6 - Azure Fundamentals', items: [
    { id: 'az-overview', label: 'Azure Overview and Regions' },
    { id: 'az-adls', label: 'ADLS Gen2 and Storage' },
    { id: 'az-adf', label: 'Azure Data Factory (ADF)' },
    { id: 'az-eventhub', label: 'Event Hub and Streaming' },
    { id: 'az-keyvault', label: 'Key Vault and Security' },
    { id: 'az-networking', label: 'VNet, Private Endpoints, NSG' },
    { id: 'az-cosmos', label: 'Cosmos DB' },
    { id: 'az-monitor', label: 'Azure Monitor and KQL' },
  ]},
]

export default function Azure({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('az-overview')
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

        <section id="az-overview" ref={el => { if (el) sectionRefs.current['az-overview'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Overview and Regions</h1>
            <p className="topic-desc">Azure is Microsoft's cloud platform with 60+ regions globally. For data engineers, you'll primarily work with storage, compute, networking, and data services.</p>
          </div>
          <AzureArchitectureAnimation />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { service: 'ADLS Gen2', category: 'Storage', icon: '🗄️', color: '#0078d4' },
              { service: 'Azure Data Factory', category: 'Orchestration', icon: '🏭', color: '#ef4444' },
              { service: 'Databricks', category: 'Compute', icon: '⚡', color: '#ef4444' },
              { service: 'Event Hub', category: 'Streaming', icon: '📡', color: '#f59e0b' },
              { service: 'Key Vault', category: 'Security', icon: '🔐', color: '#8b5cf6' },
              { service: 'Synapse', category: 'Warehouse', icon: '🏛️', color: '#22c55e' },
              { service: 'Cosmos DB', category: 'NoSQL', icon: '🌍', color: '#f97316' },
              { service: 'Azure Monitor', category: 'Observability', icon: '📊', color: '#06b6d4' },
            ].map(s => (
              <div key={s.service} style={{ background: 'white', border: '1px solid var(--border)', borderLeft: `3px solid ${s.color}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{s.service}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-4)' }}>{s.category}</div>
              </div>
            ))}
          </div>
          <Quiz topicId="az-overview" questions={[
            { question: "What is an Azure Region?", options: ["A billing boundary", "A physical location with one or more datacenters", "A virtual network", "A subscription boundary"], correct: 1 },
            { question: "Which Azure service is the primary storage for a Data Lakehouse?", options: ["Azure Blob Storage", "ADLS Gen2", "Azure Files", "Azure Queue Storage"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('az-overview'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="az-adls" ref={el => { if (el) sectionRefs.current['az-adls'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Data Lake Storage Gen2</h1>
            <p className="topic-desc">ADLS Gen2 is the foundation of the Azure Lakehouse. It combines Azure Blob Storage with a hierarchical namespace (HNS) for directory-level operations and POSIX ACLs.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Hierarchical Namespace (HNS):</strong> Unlike Blob Storage where "directories" are fake (just prefixes), ADLS Gen2 HNS has real directories. This enables atomic rename operations (critical for Spark write commits) and fine-grained POSIX ACLs.</div>
          </div>
          <CodeBlock lang="python">{`# Access ADLS Gen2 from PySpark with Service Principal
spark.conf.set(
    "fs.azure.account.auth.type.mystorageaccount.dfs.core.windows.net",
    "OAuth"
)
spark.conf.set(
    "fs.azure.account.oauth.provider.type.mystorageaccount.dfs.core.windows.net",
    "org.apache.hadoop.fs.azurebfs.oauth2.ClientCredsTokenProvider"
)
spark.conf.set(
    "fs.azure.account.oauth2.client.id.mystorageaccount.dfs.core.windows.net",
    dbutils.secrets.get(scope="kv", key="sp-client-id")
)
spark.conf.set(
    "fs.azure.account.oauth2.client.secret.mystorageaccount.dfs.core.windows.net",
    dbutils.secrets.get(scope="kv", key="sp-client-secret")
)
spark.conf.set(
    "fs.azure.account.oauth2.client.endpoint.mystorageaccount.dfs.core.windows.net",
    f"https://login.microsoftonline.com/{tenant_id}/oauth2/token"
)

# Path format: abfss://container@account.dfs.core.windows.net/path
df = spark.read.parquet(
    "abfss://bronze@mystorageaccount.dfs.core.windows.net/events/2024/"
)

# ADLS Gen2 ACL structure (storage path permissions)
# container: rwx (execute needed to traverse directory)
# /bronze/events/: rwx for data engineers
# /gold/reports/: r-x for BI team (read-only)`}</CodeBlock>
          <Quiz topicId="az-adls" questions={[
            { question: "What is the key advantage of ADLS Gen2's Hierarchical Namespace?", options: ["Cheaper storage", "Real directory operations enable atomic renames (critical for Spark) and fine-grained ACLs", "Faster reads", "Better compression"], correct: 1 },
            { question: "What URL format does ADLS Gen2 use with Spark?", options: ["wasbs://", "s3://", "abfss://", "hdfs://"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('az-adls'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="az-adf" ref={el => { if (el) sectionRefs.current['az-adf'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Data Factory</h1>
            <p className="topic-desc">ADF is Azure's cloud ETL orchestration service. It moves data between 90+ connectors and orchestrates pipeline execution with triggers, monitoring, and retry logic.</p>
          </div>
          <CodeBlock lang="json">{`// ADF Pipeline definition (ARM/JSON)
{
  "name": "IngestSalesData",
  "properties": {
    "activities": [
      {
        "name": "CopySalesFromSQL",
        "type": "Copy",
        "source": { "type": "AzureSqlSource", "sqlReaderQuery": "SELECT * FROM sales WHERE date > '@{pipeline().parameters.start_date}'" },
        "sink": { "type": "ParquetSink", "storeSettings": { "type": "AzureBlobFSWriteSettings" } }
      },
      {
        "name": "TriggerDatabricksJob",
        "type": "DatabricksNotebook",
        "dependsOn": [{ "activity": "CopySalesFromSQL", "dependencyConditions": ["Succeeded"] }],
        "settings": { "notebookPath": "/Pipelines/Silver/ProcessSales" }
      }
    ],
    "parameters": { "start_date": { "type": "String" } }
  }
}`}</CodeBlock>
          <Quiz topicId="az-adf" questions={[
            { question: "What is the primary purpose of Azure Data Factory?", options: ["Run Spark jobs", "Orchestrate data movement and ETL pipelines across 90+ connectors", "Store data in ADLS", "Query data with SQL"], correct: 1 },
            { question: "What ADF trigger runs a pipeline on a recurring schedule?", options: ["Event trigger", "Manual trigger", "Tumbling window trigger / Schedule trigger", "On-demand trigger"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('az-adf'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="az-eventhub" ref={el => { if (el) sectionRefs.current['az-eventhub'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Event Hub and Streaming</h1>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>Event Hub</strong> is Azure's managed Kafka-compatible event streaming service. It scales to millions of events/second. Consumer groups allow multiple readers to independently consume the same stream (e.g., one for bronze ingestion, one for real-time alerts).</div>
          </div>
          <CodeBlock lang="python">{`# Read from Event Hub in PySpark Structured Streaming
df_stream = spark.readStream \\
    .format("eventhubs") \\
    .options(**{
        "eventhubs.connectionString": dbutils.secrets.get("kv", "eh-conn-string"),
        "eventhubs.consumerGroup": "bronze-ingestion",
        "eventhubs.startingPosition": '{"offset": "-1", "isInclusive": true}'
    }) \\
    .load()

# Parse Event Hub body (binary -> JSON)
from pyspark.sql.functions import col, from_json, cast
from pyspark.sql.types import StructType, StructField, StringType, LongType

event_schema = StructType([
    StructField("event_id", LongType()),
    StructField("user_id", LongType()),
    StructField("event_type", StringType()),
])

parsed = df_stream \\
    .withColumn("body", col("body").cast("string")) \\
    .withColumn("data", from_json(col("body"), event_schema)) \\
    .select("data.*", col("enqueuedTime").alias("event_time"))

# Write to Delta Lake with checkpointing
parsed.writeStream \\
    .format("delta") \\
    .option("checkpointLocation", "/checkpoints/eventhub-bronze") \\
    .outputMode("append") \\
    .table("bronze.events_raw")`}</CodeBlock>
          <Quiz topicId="az-eventhub" questions={[
            { question: "What is a Consumer Group in Event Hub?", options: ["A billing group", "An independent cursor/view of the event stream for a specific reader", "A partition group", "An authentication group"], correct: 1 },
            { question: "What is the default retention period for Event Hub messages?", options: ["1 hour", "24 hours", "7 days (configurable up to 90 days)", "30 days"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('az-eventhub'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="az-keyvault" ref={el => { if (el) sectionRefs.current['az-keyvault'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Key Vault and Security</h1>
          </div>
          <div className="callout callout-danger">
            <span className="callout-icon">🚨</span>
            <div className="callout-body"><strong>Never hardcode secrets in code or notebooks.</strong> Service principals, storage keys, DB passwords must live in Azure Key Vault. In Databricks, use Secret Scopes backed by Key Vault.</div>
          </div>
          <CodeBlock lang="python">{`# CORRECT: read secrets from Key Vault via Databricks Secret Scope
storage_key = dbutils.secrets.get(scope="key-vault-scope", key="adls-storage-key")
sp_secret   = dbutils.secrets.get(scope="key-vault-scope", key="sp-client-secret")

# WRONG - never do this:
# storage_key = "abcdef1234567890..."   # hardcoded secret in notebook

# Managed Identity (no credentials needed - Azure handles it)
# Assign Storage Blob Data Contributor role to Databricks MI
# Then access ADLS without any key:
spark.conf.set(
    "fs.azure.account.auth.type.account.dfs.core.windows.net", "ManagedIdentity"
)

# Key Vault access policies vs RBAC
# Prefer RBAC (Azure role assignments) over legacy Access Policies
# Assign 'Key Vault Secrets User' role for reading secrets`}</CodeBlock>
          <Quiz topicId="az-keyvault" questions={[
            { question: "What is the correct way to use secrets in Databricks notebooks?", options: ["Hardcode them as strings", "Use dbutils.secrets.get() backed by Key Vault", "Store in a config file", "Use environment variables in the cluster"], correct: 1 },
            { question: "What is Managed Identity in Azure?", options: ["A user account", "An Azure-managed service identity with no credentials to manage - Azure handles auth automatically", "A Key Vault secret", "An RBAC role"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('az-keyvault'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="az-networking" ref={el => { if (el) sectionRefs.current['az-networking'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">VNet, Private Endpoints, NSG</h1>
          </div>
          <CodeBlock lang="bash">{`# Azure CLI: create VNet and subnet for data platform
az network vnet create \
  --name de-vnet \
  --resource-group de-rg \
  --address-prefix 10.0.0.0/16

az network vnet subnet create \
  --vnet-name de-vnet \
  --name databricks-public \
  --address-prefix 10.0.1.0/24

az network vnet subnet create \
  --vnet-name de-vnet \
  --name databricks-private \
  --address-prefix 10.0.2.0/24

# Create Private Endpoint for ADLS Gen2
# This puts ADLS Gen2 on a private IP in your VNet
az network private-endpoint create \
  --name adls-private-endpoint \
  --resource-group de-rg \
  --vnet-name de-vnet --subnet databricks-private \
  --private-connection-resource-id /subscriptions/.../storageAccounts/myaccount \
  --group-id dfs   # dfs = ADLS Gen2, blob = Blob Storage
  --connection-name adls-pe-conn

# Disable public access on storage (force private endpoint)
az storage account update \
  --name myaccount \
  --public-network-access Disabled`}</CodeBlock>
          <Quiz topicId="az-networking" questions={[
            { question: "What does a Private Endpoint do for an Azure service?", options: ["Creates a firewall rule", "Assigns a private IP in your VNet so traffic stays off the public internet", "Enables public access", "Creates a VPN connection"], correct: 1 },
            { question: "What is an NSG (Network Security Group)?", options: ["A load balancer", "A firewall for VNet subnets - controls inbound/outbound traffic with rules", "A DNS resolver", "A VPN gateway"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('az-networking'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="az-cosmos" ref={el => { if (el) sectionRefs.current['az-cosmos'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Cosmos DB</h1>
          </div>
          <CodeBlock lang="python">{`# Cosmos DB - globally distributed NoSQL database
# Partition key is the most critical design decision

# Document structure
{
  "id": "order-12345",
  "partitionKey": "customer-456",  # distribute data evenly
  "customerId": "customer-456",
  "orderDate": "2024-01-15",
  "items": [...],
  "total": 299.99
}

# Python SDK
from azure.cosmos import CosmosClient, PartitionKey

client = CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY)
db = client.get_database_client("ecommerce")
container = db.get_container_client("orders")

# Read item (O(1) with partition key)
item = container.read_item(item="order-12345", partition_key="customer-456")

# Query (add partition key to avoid cross-partition scan)
query = "SELECT * FROM c WHERE c.customerId = @customerId AND c.total > @min"
items = list(container.query_items(
    query=query,
    parameters=[{"name": "@customerId", "value": "customer-456"}, {"name": "@min", "value": 100}],
    partition_key="customer-456"  # limits scan to one partition
))`}</CodeBlock>
          <Quiz topicId="az-cosmos" questions={[
            { question: "Why is partition key choice critical in Cosmos DB?", options: ["It determines the region", "It distributes data across physical partitions - a bad key causes hot partitions and poor performance", "It controls security", "It sets the consistency level"], correct: 1 },
            { question: "What is the RU (Request Unit) in Cosmos DB?", options: ["A storage unit", "A normalized unit of throughput combining CPU, I/O, and memory costs", "A network byte", "An access policy"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('az-cosmos'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="az-monitor" ref={el => { if (el) sectionRefs.current['az-monitor'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Monitor and KQL</h1>
          </div>
          <CodeBlock lang="kusto">{`// KQL (Kusto Query Language) - used in Azure Monitor, Log Analytics, ADX

// Find all failed pipeline runs in last 24 hours
AzureDiagnostics
| where TimeGenerated > ago(24h)
| where ResourceType == "FACTORIES/PIPELINES"
| where status_s == "Failed"
| project TimeGenerated, pipelineName_s, message_s, duration_d
| order by TimeGenerated desc

// Alert on high error rate
let threshold = 0.05;  // 5% error rate
requests
| where timestamp > ago(1h)
| summarize
    total = count(),
    errors = countif(success == false)
| extend error_rate = toreal(errors) / total
| where error_rate > threshold

// Storage metrics - bytes read per container
StorageBlobLogs
| where TimeGenerated > ago(7d)
| where OperationName == "GetBlob"
| summarize TotalBytesRead = sum(ResponseBodySize) by ContainerName
| order by TotalBytesRead desc
| render piechart`}</CodeBlock>
          <Quiz topicId="az-monitor" questions={[
            { question: "What language is used to query Azure Monitor and Log Analytics?", options: ["SQL", "KQL (Kusto Query Language)", "Python", "PowerShell"], correct: 1 },
            { question: "What does 'ago(24h)' do in a KQL query?", options: ["Adds 24 hours to a timestamp", "Filters to the last 24 hours from now", "Creates a 24-hour delay", "Schedules a future query"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('az-monitor'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

      </main>
    </div>
  )
}

function AzureArchitectureAnimation() {
  return (
    <svg viewBox="0 0 600 160" style={{ width: '100%', maxHeight: 160, borderRadius: 'var(--radius-xl)', background: '#f0f9ff', border: '1px solid #bfdbfe', marginBottom: 24 }}>
      {[
        { x: 60, label: 'Event Hub', icon: '📡', color: '#f59e0b' },
        { x: 180, label: 'ADF', icon: '🏭', color: '#ef4444' },
        { x: 300, label: 'ADLS Gen2', icon: '🗄️', color: '#0078d4' },
        { x: 420, label: 'Databricks', icon: '⚡', color: '#ef4444' },
        { x: 540, label: 'Power BI', icon: '📊', color: '#f59e0b' },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy="80" r="32" fill="white" stroke={n.color} strokeWidth="2"/>
          <text x={n.x} y="76" textAnchor="middle" fontSize="16">{n.icon}</text>
          <text x={n.x} y="92" textAnchor="middle" fill={n.color} fontSize="9" fontWeight="700">{n.label}</text>
          {i < 4 && <line x1={n.x + 32} y1="80" x2={n.x + 88} y2="80" stroke="#93c5fd" strokeWidth="2" strokeDasharray="4 2">
            <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite"/>
          </line>}
        </g>
      ))}
    </svg>
  )
}
