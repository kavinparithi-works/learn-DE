import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 6 - Cloud and Azure', items: [
    { id: 'az-fundamentals', label: 'Azure Fundamentals' },
    { id: 'az-adls', label: 'ADLS Gen2' },
    { id: 'az-blob', label: 'Azure Blob Storage' },
    { id: 'az-adf', label: 'Azure Data Factory' },
    { id: 'az-synapse', label: 'Azure Synapse Analytics' },
    { id: 'az-databricks', label: 'Azure Databricks' },
    { id: 'az-eventhub', label: 'Event Hub' },
    { id: 'az-eventgrid', label: 'Event Grid' },
    { id: 'az-servicebus', label: 'Service Bus' },
    { id: 'az-functions', label: 'Azure Functions' },
    { id: 'az-streamanalytics', label: 'Stream Analytics' },
    { id: 'az-keyvault', label: 'Key Vault' },
    { id: 'az-identity', label: 'Identity and AAD' },
    { id: 'az-networking', label: 'Networking and VNet' },
    { id: 'az-monitor', label: 'Azure Monitor and KQL' },
    { id: 'az-cosmos', label: 'Cosmos DB' },
    { id: 'az-sql', label: 'Azure SQL' },
    { id: 'az-devops', label: 'Azure DevOps' },
    { id: 'az-terraform', label: 'Terraform on Azure' },
    { id: 'az-cost', label: 'Cost Management' },
  ]},
]

function AzureArchitectureAnimation() {
  return (
    <svg viewBox="0 0 820 180" className="anim-wrap" style={{ width: '100%', maxWidth: 760, display: 'block', margin: '0 0 1.5rem', borderRadius: 12, background: '#0f1923' }}>
      {/* Boxes */}
      <rect x="10" y="60" width="110" height="60" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5"/>
      <text x="65" y="86" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">Event Hub</text>
      <text x="65" y="102" textAnchor="middle" fill="#60a5fa" fontSize="9">Ingest</text>

      <rect x="160" y="60" width="110" height="60" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5"/>
      <text x="215" y="86" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">ADF</text>
      <text x="215" y="102" textAnchor="middle" fill="#60a5fa" fontSize="9">Orchestrate</text>

      <rect x="310" y="60" width="110" height="60" rx="8" fill="#1a3a2a" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="365" y="86" textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="700">ADLS Gen2</text>
      <text x="365" y="102" textAnchor="middle" fill="#4ade80" fontSize="9">Bronze/Silver</text>

      <rect x="460" y="60" width="110" height="60" rx="8" fill="#2d1b4e" stroke="#a855f7" strokeWidth="1.5"/>
      <text x="515" y="86" textAnchor="middle" fill="#d8b4fe" fontSize="11" fontWeight="700">Databricks</text>
      <text x="515" y="102" textAnchor="middle" fill="#c084fc" fontSize="9">Transform</text>

      <rect x="610" y="60" width="110" height="60" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5"/>
      <text x="665" y="86" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">Synapse</text>
      <text x="665" y="102" textAnchor="middle" fill="#60a5fa" fontSize="9">Serve / BI</text>

      <rect x="760" y="60" width="50" height="60" rx="8" fill="#1a2a3a" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="785" y="86" textAnchor="middle" fill="#fcd34d" fontSize="10" fontWeight="700">Power</text>
      <text x="785" y="100" textAnchor="middle" fill="#fcd34d" fontSize="10" fontWeight="700">BI</text>

      {/* Arrows */}
      <line x1="120" y1="90" x2="158" y2="90" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arr)"/>
      <line x1="270" y1="90" x2="308" y2="90" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arr)"/>
      <line x1="420" y1="90" x2="458" y2="90" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arr2)"/>
      <line x1="570" y1="90" x2="608" y2="90" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arr)"/>
      <line x1="720" y1="90" x2="758" y2="90" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arr3)"/>

      {/* Labels below */}
      <text x="410" y="165" textAnchor="middle" fill="#475569" fontSize="10">Azure Modern Data Platform - Medallion Architecture</text>

      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6"/>
        </marker>
        <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#a855f7"/>
        </marker>
        <marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b"/>
        </marker>
      </defs>
    </svg>
  )
}

function AzureNetworkAnimation() {
  return (
    <svg viewBox="0 0 700 220" className="anim-wrap" style={{ width: '100%', maxWidth: 760, display: 'block', margin: '0 0 1.5rem', borderRadius: 12, background: '#0f1923' }}>
      {/* VNet outer */}
      <rect x="10" y="10" width="520" height="200" rx="12" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3"/>
      <text x="20" y="28" fill="#60a5fa" fontSize="11" fontWeight="700">Virtual Network (VNet)  10.0.0.0/16</text>

      {/* Data subnet */}
      <rect x="30" y="40" width="200" height="80" rx="8" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="130" y="58" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="700">Data Subnet  10.0.1.0/24</text>
      <rect x="50" y="68" width="70" height="36" rx="6" fill="#1a3a2a" stroke="#22c55e" strokeWidth="1"/>
      <text x="85" y="86" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="700">Databricks</text>
      <text x="85" y="98" textAnchor="middle" fill="#4ade80" fontSize="8">Worker</text>
      <rect x="140" y="68" width="70" height="36" rx="6" fill="#2d1b4e" stroke="#a855f7" strokeWidth="1"/>
      <text x="175" y="86" textAnchor="middle" fill="#d8b4fe" fontSize="9" fontWeight="700">ADF</text>
      <text x="175" y="98" textAnchor="middle" fill="#c084fc" fontSize="8">Self-hosted IR</text>

      {/* Services subnet */}
      <rect x="30" y="135" width="200" height="65" rx="8" fill="#1e3a1a" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="130" y="153" textAnchor="middle" fill="#86efac" fontSize="10" fontWeight="700">Services Subnet  10.0.2.0/24</text>
      <rect x="50" y="163" width="70" height="28" rx="6" fill="#1a2a3a" stroke="#f59e0b" strokeWidth="1"/>
      <text x="85" y="181" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="700">Key Vault PE</text>
      <rect x="140" y="163" width="70" height="28" rx="6" fill="#1a2a3a" stroke="#ef4444" strokeWidth="1"/>
      <text x="175" y="181" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="700">SQL PE</text>

      {/* NSG */}
      <rect x="260" y="70" width="80" height="45" rx="8" fill="#2a1a1a" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="300" y="88" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="700">NSG</text>
      <text x="300" y="103" textAnchor="middle" fill="#ef4444" fontSize="8">Inbound Rules</text>

      {/* Private endpoint to ADLS */}
      <rect x="260" y="140" width="80" height="40" rx="8" fill="#1a3a2a" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="300" y="158" textAnchor="middle" fill="#86efac" fontSize="10" fontWeight="700">Private</text>
      <text x="300" y="172" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="700">Endpoint</text>

      {/* ADLS outside */}
      <rect x="570" y="75" width="110" height="60" rx="8" fill="#1a3a2a" stroke="#22c55e" strokeWidth="2"/>
      <text x="625" y="100" textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="700">ADLS Gen2</text>
      <text x="625" y="116" textAnchor="middle" fill="#4ade80" fontSize="9">Storage Account</text>

      {/* Connection arrows */}
      <line x1="340" y1="157" x2="568" y2="105" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,2"/>
      <text x="455" y="128" textAnchor="middle" fill="#4ade80" fontSize="9" transform="rotate(-15,455,128)">Private Link</text>
      <line x1="230" y1="160" x2="258" y2="157" stroke="#22c55e" strokeWidth="1.5"/>
    </svg>
  )
}

function ADFPipelineAnimation() {
  return (
    <svg viewBox="0 0 780 130" className="anim-wrap" style={{ width: '100%', maxWidth: 760, display: 'block', margin: '0 0 1.5rem', borderRadius: 12, background: '#0f1923' }}>
      {/* Activity boxes */}
      {[
        { x: 10,  label: 'Source',       sub: 'SQL / API',      stroke: '#3b82f6', fill: '#1e3a5f', text: '#93c5fd', sub2: '#60a5fa' },
        { x: 120, label: 'Copy',         sub: 'Activity',       stroke: '#f59e0b', fill: '#2a1f0a', text: '#fcd34d', sub2: '#f59e0b' },
        { x: 230, label: 'ADLS Bronze',  sub: 'Raw Parquet',    stroke: '#22c55e', fill: '#1a3a2a', text: '#86efac', sub2: '#4ade80' },
        { x: 340, label: 'Data Flow',    sub: 'Mapping DF',     stroke: '#a855f7', fill: '#2d1b4e', text: '#d8b4fe', sub2: '#c084fc' },
        { x: 450, label: 'ADLS Silver',  sub: 'Cleaned Delta',  stroke: '#22c55e', fill: '#1a3a2a', text: '#86efac', sub2: '#4ade80' },
        { x: 560, label: 'Databricks',   sub: 'NB Activity',    stroke: '#f97316', fill: '#2a1a0a', text: '#fdba74', sub2: '#f97316' },
        { x: 670, label: 'Gold Layer',   sub: 'Aggregated',     stroke: '#eab308', fill: '#2a2000', text: '#fde047', sub2: '#eab308' },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y="30" width="100" height="60" rx="8" fill={b.fill} stroke={b.stroke} strokeWidth="1.5"/>
          <text x={b.x + 50} y="57" textAnchor="middle" fill={b.text} fontSize="10" fontWeight="700">{b.label}</text>
          <text x={b.x + 50} y="73" textAnchor="middle" fill={b.sub2} fontSize="9">{b.sub}</text>
          {i < 6 && <line x1={b.x + 100} y1="60" x2={b.x + 118} y2="60" stroke={b.stroke} strokeWidth="1.5" markerEnd="url(#adfArr)"/>}
        </g>
      ))}
      <text x="390" y="118" textAnchor="middle" fill="#475569" fontSize="10">ADF Pipeline - Bronze to Gold Medallion Flow</text>
      <defs>
        <marker id="adfArr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="#60a5fa"/>
        </marker>
      </defs>
    </svg>
  )
}

export default function Azure({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('az-fundamentals')
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

        {/* ── az-fundamentals ───────────────────────────────────── */}
        <section id="az-fundamentals" ref={el => { if (el) sectionRefs.current['az-fundamentals'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Fundamentals</h1>
            <p className="topic-desc">Azure organizes resources in a strict hierarchy: Management Groups contain Subscriptions, Subscriptions contain Resource Groups, and Resource Groups contain Resources. RBAC is applied at any level and flows downward. Understanding this hierarchy is essential for governance, cost allocation, and access control.</p>
          </div>
          <AzureArchitectureAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">&#128161;</span>
            <div className="callout-body">
              <strong>Hierarchy: Management Groups &gt; Subscriptions &gt; Resource Groups &gt; Resources.</strong> RBAC roles assigned at a Management Group flow down to all child subscriptions and resources. Policies (Azure Policy) also cascade downward. Use resource groups as the unit of lifecycle management - resources in the same RG share the same lifecycle and are deleted together.
            </div>
          </div>
          <CodeBlock lang="bash">{`# Azure CLI fundamentals

# Show current subscription context
az account show
az account list --output table

# Switch subscription
az account set --subscription "My Subscription Name"

# Create a Resource Group
az group create \\
  --name rg-data-platform-prod \\
  --location eastus2 \\
  --tags Environment=prod Team=data-engineering

# List resource groups
az group list --output table

# Create a Service Principal for automated access
az ad sp create-for-rbac \\
  --name sp-data-platform \\
  --role Contributor \\
  --scopes /subscriptions/{subscription-id}/resourceGroups/rg-data-platform-prod

# Assign a role at subscription scope
az role assignment create \\
  --assignee {object-id-or-sp-client-id} \\
  --role "Storage Blob Data Contributor" \\
  --scope /subscriptions/{subscription-id}

# Assign role at resource group scope (narrower, preferred)
az role assignment create \\
  --assignee {sp-client-id} \\
  --role "Storage Blob Data Contributor" \\
  --scope /subscriptions/{sub-id}/resourceGroups/rg-data-platform-prod

# Assign role at specific resource scope (most granular)
az role assignment create \\
  --assignee {sp-client-id} \\
  --role "Storage Blob Data Reader" \\
  --scope /subscriptions/{sub-id}/resourceGroups/rg-data/providers/Microsoft.Storage/storageAccounts/adlsprod

# List role assignments for a principal
az role assignment list --assignee {sp-client-id} --output table

# Create management group
az account management-group create --name mg-data-platform --display-name "Data Platform"
az account management-group subscription add --name mg-data-platform --subscription {sub-id}`}</CodeBlock>
          <CodeBlock lang="python">{`# azure-mgmt-resource SDK - subscription and RG management
from azure.identity import DefaultAzureCredential, ClientSecretCredential
from azure.mgmt.resource import ResourceManagementClient, SubscriptionClient
from azure.mgmt.authorization import AuthorizationManagementClient

# Authenticate - DefaultAzureCredential tries: env vars -> managed identity -> CLI
credential = DefaultAzureCredential()

# Or explicit Service Principal auth
credential = ClientSecretCredential(
    tenant_id="your-tenant-id",
    client_id="your-client-id",
    client_secret="your-client-secret"
)

# List all subscriptions the identity has access to
sub_client = SubscriptionClient(credential)
for sub in sub_client.subscriptions.list():
    print(f"{sub.display_name}: {sub.subscription_id} ({sub.state})")

# Work with resource groups
SUBSCRIPTION_ID = "your-subscription-id"
resource_client = ResourceManagementClient(credential, SUBSCRIPTION_ID)

# List resource groups
for rg in resource_client.resource_groups.list():
    print(f"RG: {rg.name} in {rg.location}, tags={rg.tags}")

# Create resource group
rg_result = resource_client.resource_groups.create_or_update(
    "rg-data-platform-prod",
    {"location": "eastus2", "tags": {"Environment": "prod", "Team": "data-engineering"}}
)
print(f"Created: {rg_result.name}")

# List all resources in a RG
for resource in resource_client.resources.list_by_resource_group("rg-data-platform-prod"):
    print(f"  {resource.type}: {resource.name}")

# RBAC - list role assignments
auth_client = AuthorizationManagementClient(credential, SUBSCRIPTION_ID)
scope = f"/subscriptions/{SUBSCRIPTION_ID}/resourceGroups/rg-data-platform-prod"

for assignment in auth_client.role_assignments.list_for_scope(scope):
    print(f"  Principal: {assignment.principal_id}, Role: {assignment.role_definition_id}")`}</CodeBlock>
          <CodeBlock lang="bash">{`# Availability Zones and Regions

# List all Azure regions
az account list-locations --output table

# Check which services support AZs in a region
az vm list-skus --location eastus2 --zone --output table

# Resources with zone redundancy (recommended for prod)
az storage account create \\
  --name adlsprodeastus2 \\
  --resource-group rg-data-platform-prod \\
  --location eastus2 \\
  --sku Standard_ZRS \\         # Zone-redundant storage
  --kind StorageV2

# Paired regions for geo-redundancy
# eastus2 <-> centralus
# westus2 <-> westcentralus
# northeurope <-> westeurope

# Azure Policy - enforce tagging
az policy assignment create \\
  --name "require-tags" \\
  --policy "/providers/Microsoft.Authorization/policyDefinitions/{policy-id}" \\
  --scope /subscriptions/{sub-id} \\
  --params '{"tagName": {"value": "Environment"}}'`}</CodeBlock>
          <Quiz topicId="az-fundamentals" questions={[
            {
              question: "What is the correct hierarchy order in Azure from broadest to most specific scope?",
              options: [
                "Subscriptions > Management Groups > Resource Groups > Resources",
                "Management Groups > Subscriptions > Resource Groups > Resources",
                "Resource Groups > Subscriptions > Management Groups > Resources",
                "Management Groups > Resource Groups > Subscriptions > Resources"
              ],
              correct: 1
            },
            {
              question: "You assign the 'Storage Blob Data Contributor' role at the Management Group level. Which resources inherit this role?",
              options: [
                "Only storage accounts directly in that management group",
                "Only storage accounts in the root subscription",
                "All storage accounts across all child subscriptions and resource groups",
                "Only storage accounts in the same resource group as the assignment"
              ],
              correct: 2
            },
            {
              question: "Which credential type should a production Databricks cluster use to access ADLS Gen2 without storing secrets in code?",
              options: [
                "Storage account key in spark config",
                "SAS token hardcoded in notebook",
                "Managed Identity (system-assigned or user-assigned)",
                "Service Principal credentials in environment variables"
              ],
              correct: 2
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-fundamentals'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-adls ───────────────────────────────────────────── */}
        <section id="az-adls" ref={el => { if (el) sectionRefs.current['az-adls'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">ADLS Gen2</h1>
            <p className="topic-desc">Azure Data Lake Storage Gen2 combines Azure Blob Storage with a Hierarchical Namespace (HNS). HNS enables true directory semantics with atomic renames and ACL-based access control, making it the standard storage layer for Azure data platforms running Spark and Databricks.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#9889;</span>
            <div className="callout-body">
              <strong>HNS enables atomic renames - critical for Spark.</strong> Without HNS (regular Blob), renaming a directory requires copying every file then deleting originals - O(n) operations that can fail midway, corrupting your data. With HNS, rename is a single metadata operation - O(1) and atomic. This is why Spark's checkpoint and write workflows require ADLS Gen2 with HNS enabled, not plain Blob Storage.
            </div>
          </div>
          <CodeBlock lang="python">{`# azure-storage-file-datalake SDK
from azure.identity import DefaultAzureCredential
from azure.storage.filedatalake import DataLakeServiceClient, DataLakeDirectoryClient

credential = DefaultAzureCredential()

# Connect to ADLS Gen2 account
service_client = DataLakeServiceClient(
    account_url="https://adlsprod.dfs.core.windows.net",
    credential=credential
)

# Create a filesystem (container with HNS)
fs_client = service_client.create_file_system(file_system="bronze")
# Or get existing
fs_client = service_client.get_file_system_client("bronze")

# Create directory hierarchy
dir_client = fs_client.create_directory("raw/events/2024/01")

# Upload a file
file_client = dir_client.create_file("events_2024_01_01.parquet")
with open("events.parquet", "rb") as f:
    data = f.read()
    file_client.append_data(data=data, offset=0, length=len(data))
    file_client.flush_data(len(data))

# Set POSIX ACLs on a directory (requires HNS)
dir_client = fs_client.get_directory_client("raw/events")
dir_client.set_access_control(
    acl="user::rwx,group::r-x,other::---,user:oid-of-sp:rwx",
)

# Get current ACLs
acl_props = dir_client.get_access_control()
print(f"ACL: {acl_props['acl']}")
print(f"Owner: {acl_props['owner']}")
print(f"Group: {acl_props['group']}")

# Recursive ACL update (propagate to all children)
dir_client.set_access_control_recursive(
    acl="user:oid-of-sp:rwx",
    progress_hook=lambda x: print(f"Processed {x.directories_successful} dirs, {x.files_successful} files")
)

# Move/rename (atomic with HNS!)
dir_client.rename_directory("raw/events_archive/2024/01")

# List paths
for path in fs_client.get_paths("raw/events", recursive=True):
    print(f"{'D' if path.is_directory else 'F'} {path.name} ({path.content_length} bytes)")`}</CodeBlock>
          <CodeBlock lang="bash">{`# az storage fs commands for ADLS Gen2

# Create storage account with HNS (--enable-hierarchical-namespace)
az storage account create \\
  --name adlsprodeastus2 \\
  --resource-group rg-data-platform \\
  --location eastus2 \\
  --sku Standard_ZRS \\
  --kind StorageV2 \\
  --enable-hierarchical-namespace true \\
  --min-tls-version TLS1_2 \\
  --allow-blob-public-access false

# Create filesystem (container)
az storage fs create \\
  --name bronze \\
  --account-name adlsprodeastus2 \\
  --auth-mode login

# Upload file
az storage fs file upload \\
  --source ./data.parquet \\
  --path raw/events/data.parquet \\
  --file-system bronze \\
  --account-name adlsprodeastus2

# Set ACL on a directory
az storage fs access set \\
  --acl "user::rwx,group::r-x,other::---,user:{sp-object-id}:rwx" \\
  --path raw/events \\
  --file-system bronze \\
  --account-name adlsprodeastus2

# Update ACL recursively
az storage fs access update-recursive \\
  --acl "user:{sp-object-id}:r-x" \\
  --path raw \\
  --file-system bronze \\
  --account-name adlsprodeastus2

# Set blob access tier (hot/cool/cold/archive)
az storage blob set-tier \\
  --account-name adlsprodeastus2 \\
  --container-name archive \\
  --name old-data/2022/events.parquet \\
  --tier Archive

# Enable soft delete (point-in-time recovery)
az storage account blob-service-properties update \\
  --account-name adlsprodeastus2 \\
  --resource-group rg-data-platform \\
  --enable-delete-retention true \\
  --delete-retention-days 30 \\
  --enable-versioning true`}</CodeBlock>
          <CodeBlock lang="python">{`# PySpark with ADLS Gen2 via abfss:// and Service Principal OAuth
# In Databricks cluster or Spark session config

# Option 1: Service Principal OAuth (recommended for non-Unity-Catalog)
spark.conf.set("fs.azure.account.auth.type.adlsprod.dfs.core.windows.net", "OAuth")
spark.conf.set("fs.azure.account.oauth.provider.type.adlsprod.dfs.core.windows.net",
               "org.apache.hadoop.fs.azurebfs.oauth2.ClientCredsTokenProvider")
spark.conf.set("fs.azure.account.oauth2.client.id.adlsprod.dfs.core.windows.net",
               dbutils.secrets.get("kv-scope", "sp-client-id"))
spark.conf.set("fs.azure.account.oauth2.client.secret.adlsprod.dfs.core.windows.net",
               dbutils.secrets.get("kv-scope", "sp-client-secret"))
spark.conf.set("fs.azure.account.oauth2.client.endpoint.adlsprod.dfs.core.windows.net",
               f"https://login.microsoftonline.com/{tenant_id}/oauth2/token")

# Read from ADLS using abfss:// (secure, uses HNS)
# Format: abfss://{filesystem}@{account}.dfs.core.windows.net/{path}
df = spark.read.parquet(
    "abfss://bronze@adlsprod.dfs.core.windows.net/raw/events/2024/01/"
)

# Write with partition overwrite
df_transformed.write \\
    .format("delta") \\
    .mode("overwrite") \\
    .option("overwriteSchema", "true") \\
    .partitionBy("event_date") \\
    .save("abfss://silver@adlsprod.dfs.core.windows.net/events/")

# Option 2: Storage account key (dev only, never prod)
spark.conf.set(
    "fs.azure.account.key.adlsprod.dfs.core.windows.net",
    "your-storage-account-key"  # Never hardcode in prod!
)

# Option 3: Unity Catalog + Managed Identity (modern, recommended)
# No config needed - Unity Catalog manages credentials transparently
df = spark.read.parquet("abfss://bronze@adlsprod.dfs.core.windows.net/raw/events/")`}</CodeBlock>
          <CodeBlock lang="json">{`{
  "rules": [
    {
      "name": "move-to-cool-after-30-days",
      "enabled": true,
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "tierToCool": {
              "daysAfterModificationGreaterThan": 30
            },
            "tierToArchive": {
              "daysAfterModificationGreaterThan": 180,
              "daysAfterLastTierChangeGreaterThan": 7
            },
            "delete": {
              "daysAfterModificationGreaterThan": 730
            }
          },
          "snapshot": {
            "delete": {
              "daysAfterCreationGreaterThan": 90
            }
          }
        },
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["archive/", "cold/"]
        }
      }
    }
  ]
}`}</CodeBlock>
          <Quiz topicId="az-adls" questions={[
            {
              question: "Why is Hierarchical Namespace (HNS) critical for Spark workloads on ADLS Gen2?",
              options: [
                "HNS provides better compression for Parquet files",
                "HNS enables atomic directory renames (O(1)), preventing data corruption during Spark writes and checkpoints",
                "HNS is required for reading Delta Lake format",
                "HNS doubles the read throughput for large Spark jobs"
              ],
              correct: 1
            },
            {
              question: "What is the correct abfss:// URI format for ADLS Gen2?",
              options: [
                "abfss://{account}@{filesystem}.dfs.core.windows.net/{path}",
                "abfss://{filesystem}@{account}.dfs.core.windows.net/{path}",
                "abfss://{account}.blob.core.windows.net/{filesystem}/{path}",
                "abfss://{path}@{account}.dfs.core.windows.net/{filesystem}"
              ],
              correct: 1
            },
            {
              question: "Which ADLS access tier has NO storage cost but charges a high retrieval fee and requires hours to rehydrate data?",
              options: ["Hot", "Cool", "Cold", "Archive"],
              correct: 3
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-adls'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-blob ───────────────────────────────────────────── */}
        <section id="az-blob" ref={el => { if (el) sectionRefs.current['az-blob'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Blob Storage</h1>
            <p className="topic-desc">Azure Blob Storage is the foundational object storage service. It supports three blob types for different use cases, multiple replication strategies, and SAS tokens for delegated, time-limited access. ADLS Gen2 is built on Blob Storage with HNS added - they share the same underlying infrastructure.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128230;</span>
            <div className="callout-body">
              <strong>Three blob types for different workloads:</strong> Block blobs (up to 190.7 TB) are for general-purpose files - use for Parquet, JSON, images, videos. Page blobs (up to 8 TB) support random read/write access - used for Azure VM disk (VHD) backing. Append blobs are optimized for append-only operations (no overwrite/delete of existing data) - ideal for log files, audit trails, and streaming data capture.
            </div>
          </div>
          <CodeBlock lang="python">{`# azure-storage-blob SDK
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.storage.blob import generate_blob_sas, BlobSasPermissions
from datetime import datetime, timezone, timedelta

credential = DefaultAzureCredential()

# Connect to Blob Storage account
blob_service = BlobServiceClient(
    account_url="https://myblobstorage.blob.core.windows.net",
    credential=credential
)

# Create container
container_client = blob_service.create_container("raw-data")
# Or get existing
container_client = blob_service.get_container_client("raw-data")

# Upload block blob (standard file upload)
blob_client = container_client.get_blob_client("events/2024/01/events.json")
with open("events.json", "rb") as data:
    blob_client.upload_blob(data, overwrite=True)

# Upload with metadata and content type
blob_client.upload_blob(
    data=b"log data here",
    blob_type="AppendBlob",       # Use AppendBlob for logs
    overwrite=True,
    metadata={"source": "api", "date": "2024-01-01"},
    content_settings=ContentSettings(content_type="application/json")
)

# Append to append blob (log streaming)
append_blob = container_client.get_blob_client("logs/app.log")
append_blob.create_append_blob()
append_blob.append_block(b"log line 1\\n")
append_blob.append_block(b"log line 2\\n")

# Download blob
download = blob_client.download_blob()
content = download.readall()

# List blobs with prefix filter
for blob in container_client.list_blobs(name_starts_with="events/2024/"):
    print(f"{blob.name}: {blob.size} bytes, modified={blob.last_modified}")

# Copy blob between containers
source_url = blob_client.url
dest_client = container_client.get_blob_client("archive/events.json")
dest_client.start_copy_from_url(source_url)`}</CodeBlock>
          <CodeBlock lang="python">{`# Generating SAS tokens for delegated access
from azure.storage.blob import (
    generate_blob_sas, generate_container_sas,
    BlobSasPermissions, ContainerSasPermissions,
    BlobServiceClient
)
from datetime import datetime, timezone, timedelta

ACCOUNT_NAME = "myblobstorage"
ACCOUNT_KEY = "your-storage-account-key"  # Needed for account-key-based SAS

# SAS token for a single blob (read-only, expires in 1 hour)
sas_token = generate_blob_sas(
    account_name=ACCOUNT_NAME,
    container_name="raw-data",
    blob_name="events/2024/01/events.json",
    account_key=ACCOUNT_KEY,
    permission=BlobSasPermissions(read=True),
    expiry=datetime.now(timezone.utc) + timedelta(hours=1)
)
blob_url_with_sas = f"https://{ACCOUNT_NAME}.blob.core.windows.net/raw-data/events.json?{sas_token}"

# SAS token for a container (read + list, expires in 24 hours)
container_sas = generate_container_sas(
    account_name=ACCOUNT_NAME,
    container_name="raw-data",
    account_key=ACCOUNT_KEY,
    permission=ContainerSasPermissions(read=True, list=True, write=False),
    expiry=datetime.now(timezone.utc) + timedelta(hours=24),
    start=datetime.now(timezone.utc) - timedelta(minutes=5)  # slight backdate for clock skew
)

# User Delegation SAS (preferred - uses AAD, no account key needed)
# Requires Storage Blob Delegator role
blob_service = BlobServiceClient(
    account_url=f"https://{ACCOUNT_NAME}.blob.core.windows.net",
    credential=DefaultAzureCredential()
)
user_delegation_key = blob_service.get_user_delegation_key(
    key_start_time=datetime.now(timezone.utc),
    key_expiry_time=datetime.now(timezone.utc) + timedelta(hours=8)
)
user_sas = generate_blob_sas(
    account_name=ACCOUNT_NAME,
    container_name="raw-data",
    blob_name="events.json",
    user_delegation_key=user_delegation_key,
    permission=BlobSasPermissions(read=True),
    expiry=datetime.now(timezone.utc) + timedelta(hours=1)
)`}</CodeBlock>
          <CodeBlock lang="bash">{`# az storage commands for Blob Storage

# Create storage account with GRS replication
az storage account create \\
  --name myblobstorageprod \\
  --resource-group rg-data-platform \\
  --location eastus2 \\
  --sku Standard_GRS \\    # Geo-redundant: primary + secondary region
  --kind StorageV2 \\
  --access-tier Hot \\
  --min-tls-version TLS1_2

# Replication options:
# LRS  - Locally Redundant Storage (3 copies in same datacenter)
# ZRS  - Zone Redundant Storage (3 copies across AZs in same region)
# GRS  - Geo Redundant Storage (LRS + async replication to paired region)
# GZRS - Geo-Zone Redundant Storage (ZRS + async replication)
# RA-GRS / RA-GZRS = above + read access to secondary region

# Upload blob
az storage blob upload \\
  --account-name myblobstorageprod \\
  --container-name raw-data \\
  --name events/2024/01/events.json \\
  --file ./events.json \\
  --auth-mode login

# List blobs
az storage blob list \\
  --account-name myblobstorageprod \\
  --container-name raw-data \\
  --prefix "events/2024/" \\
  --output table

# Generate SAS token (account key based)
az storage blob generate-sas \\
  --account-name myblobstorageprod \\
  --container-name raw-data \\
  --name events/2024/01/events.json \\
  --permissions r \\
  --expiry 2024-12-31T23:59:59Z \\
  --https-only

# Enable versioning and soft delete
az storage account blob-service-properties update \\
  --account-name myblobstorageprod \\
  --enable-versioning true \\
  --enable-delete-retention true \\
  --delete-retention-days 14`}</CodeBlock>
          <Quiz topicId="az-blob" questions={[
            {
              question: "Which blob type is optimized for append-only workloads like log aggregation and streaming data capture?",
              options: ["Block blob", "Page blob", "Append blob", "Archive blob"],
              correct: 2
            },
            {
              question: "What is the difference between GRS and RA-GRS replication?",
              options: [
                "GRS stores 6 copies while RA-GRS stores 3 copies",
                "GRS replicates to a secondary region but secondary is only readable after failover; RA-GRS allows reading from secondary at any time",
                "GRS uses synchronous replication while RA-GRS uses asynchronous replication",
                "GRS is for blobs only while RA-GRS supports all storage types"
              ],
              correct: 1
            },
            {
              question: "Why is a User Delegation SAS preferred over an Account Key SAS?",
              options: [
                "User Delegation SAS tokens last longer",
                "User Delegation SAS uses AAD credentials and can be revoked by deleting the delegation key, without needing to rotate the account key",
                "User Delegation SAS is faster to generate",
                "User Delegation SAS tokens have no expiry requirement"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-blob'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-adf ────────────────────────────────────────────── */}
        <section id="az-adf" ref={el => { if (el) sectionRefs.current['az-adf'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Data Factory</h1>
            <p className="topic-desc">ADF is Azure's fully managed ETL and data integration service. It orchestrates data movement and transformation through pipelines composed of activities, datasets, and linked services. ADF supports 90+ connectors, mapping data flows for code-free Spark transformations, and multiple trigger types for scheduling and event-driven execution.</p>
          </div>
          <ADFPipelineAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">&#128268;</span>
            <div className="callout-body">
              <strong>Self-hosted Integration Runtime (SHIR) for on-premises connectivity.</strong> The Azure IR runs in Azure and works for cloud-to-cloud. For on-premises sources (SQL Server, Oracle, SAP), you install the SHIR on a VM in your network. It creates an outbound HTTPS tunnel to ADF - no inbound firewall rules needed. For high availability, install SHIR on 2+ machines and register them to the same logical IR.
            </div>
          </div>
          <CodeBlock lang="json">{`{
  "name": "pl_ingest_events_to_bronze",
  "properties": {
    "activities": [
      {
        "name": "ForEach_Table",
        "type": "ForEach",
        "typeProperties": {
          "items": { "value": "@pipeline().parameters.tables", "type": "Expression" },
          "isSequential": false,
          "batchCount": 5,
          "activities": [
            {
              "name": "Copy_to_Bronze",
              "type": "Copy",
              "typeProperties": {
                "source": {
                  "type": "SqlServerSource",
                  "sqlReaderQuery": {
                    "value": "@concat('SELECT * FROM ', item().schema, '.', item().name, ' WHERE updated_at >= ''', pipeline().parameters.watermark, '''')",
                    "type": "Expression"
                  },
                  "partitionOption": "DynamicRange",
                  "partitionSettings": {
                    "partitionColumnName": "id",
                    "partitionUpperBound": "1000000",
                    "partitionLowerBound": "1"
                  }
                },
                "sink": {
                  "type": "ParquetSink",
                  "storeSettings": {
                    "type": "AzureBlobFSWriteSettings",
                    "copyBehavior": "PreserveHierarchy"
                  }
                },
                "parallelCopies": 8,
                "dataIntegrationUnits": 16,
                "enableStaging": false
              },
              "inputs": [{ "referenceName": "ds_sqlserver_source", "type": "DatasetReference" }],
              "outputs": [{ "referenceName": "ds_adls_bronze_parquet", "type": "DatasetReference",
                "parameters": { "folder": { "value": "@item().name", "type": "Expression" } } }]
            },
            {
              "name": "If_Copy_Succeeded",
              "type": "IfCondition",
              "dependsOn": [{ "activity": "Copy_to_Bronze", "dependencyConditions": ["Succeeded"] }],
              "typeProperties": {
                "expression": { "value": "@greater(activity('Copy_to_Bronze').output.rowsCopied, 0)", "type": "Expression" },
                "ifTrueActivities": [
                  {
                    "name": "Databricks_Transform",
                    "type": "DatabricksNotebook",
                    "typeProperties": {
                      "notebookPath": "/Shared/transform/bronze_to_silver",
                      "baseParameters": {
                        "table_name": { "value": "@item().name", "type": "Expression" },
                        "run_date": { "value": "@pipeline().parameters.watermark", "type": "Expression" }
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        "name": "SP_Update_Watermark",
        "type": "SqlServerStoredProcedure",
        "dependsOn": [{ "activity": "ForEach_Table", "dependencyConditions": ["Succeeded"] }],
        "typeProperties": {
          "storedProcedureName": "usp_update_watermark",
          "storedProcedureParameters": {
            "last_run": { "value": "@pipeline().TriggerTime", "type": "DateTime" }
          }
        }
      }
    ],
    "parameters": {
      "tables": { "type": "Array" },
      "watermark": { "type": "String", "defaultValue": "1900-01-01" }
    }
  }
}`}</CodeBlock>
          <CodeBlock lang="json">{`// Tumbling Window Trigger - runs every hour, processes historical windows
{
  "name": "trg_hourly_tumbling",
  "properties": {
    "type": "TumblingWindowTrigger",
    "typeProperties": {
      "frequency": "Hour",
      "interval": 1,
      "startTime": "2024-01-01T00:00:00Z",
      "delay": "00:05:00",
      "maxConcurrency": 3,
      "retryPolicy": { "count": 2, "intervalInSeconds": 30 }
    },
    "pipeline": {
      "pipelineReference": { "referenceName": "pl_ingest_events_to_bronze" },
      "parameters": {
        "watermark": { "value": "@formatDateTime(trigger().outputs.windowStartTime, 'yyyy-MM-ddTHH:mm:ssZ')" }
      }
    }
  }
}

// Storage Event Trigger - fires when blob is created in ADLS
{
  "name": "trg_blob_created",
  "properties": {
    "type": "BlobEventsTrigger",
    "typeProperties": {
      "blobPathBeginsWith": "/raw-data/blobs/incoming/",
      "blobPathEndsWith": ".json",
      "events": ["Microsoft.Storage.BlobCreated"],
      "scope": "/subscriptions/{sub-id}/resourceGroups/rg-data/providers/Microsoft.Storage/storageAccounts/adlsprod"
    },
    "pipeline": {
      "pipelineReference": { "referenceName": "pl_process_incoming_file" },
      "parameters": {
        "file_path": { "value": "@triggerBody().folderPath" },
        "file_name": { "value": "@triggerBody().fileName" }
      }
    }
  }
}`}</CodeBlock>
          <CodeBlock lang="python">{`# ADF Python SDK - create pipeline run and monitor
from azure.identity import DefaultAzureCredential
from azure.mgmt.datafactory import DataFactoryManagementClient
from azure.mgmt.datafactory.models import CreateRunResponse
import time

credential = DefaultAzureCredential()
SUBSCRIPTION_ID = "your-subscription-id"
RESOURCE_GROUP = "rg-data-platform"
FACTORY_NAME = "adf-data-platform-prod"

adf_client = DataFactoryManagementClient(credential, SUBSCRIPTION_ID)

# Trigger a pipeline run with parameters
run_response: CreateRunResponse = adf_client.pipelines.create_run(
    RESOURCE_GROUP,
    FACTORY_NAME,
    "pl_ingest_events_to_bronze",
    parameters={
        "tables": [
            {"schema": "dbo", "name": "orders"},
            {"schema": "dbo", "name": "customers"}
        ],
        "watermark": "2024-01-01T00:00:00Z"
    }
)
run_id = run_response.run_id
print(f"Pipeline run started: {run_id}")

# Poll for completion
while True:
    run = adf_client.pipeline_runs.get(RESOURCE_GROUP, FACTORY_NAME, run_id)
    print(f"Status: {run.status}, Duration: {run.duration_in_ms}ms")
    if run.status in ("Succeeded", "Failed", "Cancelled"):
        break
    time.sleep(15)

# Get activity runs for debugging
activity_runs = adf_client.activity_runs.query_by_pipeline_run(
    RESOURCE_GROUP, FACTORY_NAME, run_id,
    filter_parameters={"lastUpdatedAfter": "2024-01-01T00:00:00Z", "lastUpdatedBefore": "2024-12-31T00:00:00Z"}
)
for activity in activity_runs.value:
    print(f"  Activity: {activity.activity_name}, Status: {activity.status}")
    if activity.output:
        print(f"    Rows copied: {activity.output.get('rowsCopied', 'N/A')}")
    if activity.error:
        print(f"    Error: {activity.error}")`}</CodeBlock>
          <CodeBlock lang="json">{`// Mapping Data Flow definition (code-free Spark transformation)
{
  "name": "df_bronze_to_silver_events",
  "properties": {
    "type": "MappingDataFlow",
    "typeProperties": {
      "sources": [{
        "name": "BronzeSource",
        "dataset": { "referenceName": "ds_adls_bronze_parquet", "type": "DatasetReference" },
        "typeProperties": {
          "rowUrlColumn": "file_path",
          "wildcardPaths": ["raw/events/*/*/*.parquet"]
        }
      }],
      "transformations": [
        {
          "name": "FilterNulls",
          "type": "Filter",
          "typeProperties": {
            "condition": "!isNull(event_id) && !isNull(event_timestamp)"
          }
        },
        {
          "name": "DerivedColumns",
          "type": "DerivedColumn",
          "typeProperties": {
            "columns": [
              { "name": "event_date", "expression": "toDate(event_timestamp)" },
              { "name": "event_hour", "expression": "hour(event_timestamp)" },
              { "name": "is_valid", "expression": "amount > 0 && !isNull(user_id)" },
              { "name": "ingestion_ts", "expression": "currentTimestamp()" }
            ]
          }
        },
        {
          "name": "AggByUser",
          "type": "Aggregate",
          "typeProperties": {
            "groupBy": [{ "name": "user_id" }, { "name": "event_date" }],
            "aggregates": [
              { "name": "total_amount", "expression": "sum(amount)" },
              { "name": "event_count", "expression": "count(1)" }
            ]
          }
        }
      ],
      "sinks": [{
        "name": "SilverSink",
        "dataset": { "referenceName": "ds_adls_silver_delta", "type": "DatasetReference" },
        "typeProperties": {
          "updateMethod": "upsert",
          "keys": ["user_id", "event_date"]
        }
      }]
    }
  }
}`}</CodeBlock>
          <CodeBlock lang="python">{`# ADF Dynamic Content Expressions - common patterns

# @pipeline().parameters.date          - pipeline parameter
# @activity('CopyData').output.rowsCopied   - output from upstream activity
# @trigger().outputs.windowStartTime   - tumbling window trigger time
# @utcNow()                            - current UTC time
# @formatDateTime(utcNow(),'yyyyMMdd') - formatted date string
# @concat('/data/', pipeline().parameters.env, '/events/')  - string concat
# @if(equals(pipeline().parameters.env, 'prod'), 'prod-rg', 'dev-rg')

# Real example - dynamic sink path based on date
dynamic_sink_path = "@concat('abfss://silver@adlsprod.dfs.core.windows.net/events/', formatDateTime(trigger().outputs.windowStartTime, 'yyyy/MM/dd'), '/')"

# Check rows copied before proceeding
rows_check = "@greater(activity('Copy_Events').output.rowsCopied, 0)"

# Build watermark from last successful run
watermark_expr = "@activity('Get_Watermark').output.firstRow.last_run_date"

# Iterate over array parameter
foreach_items = "@pipeline().parameters.source_tables"

# Dynamic dataset parameter
dataset_param = {
    "folder_path": {
        "value": "@concat('raw/', item().schema, '/', item().table_name)",
        "type": "Expression"
    }
}`}</CodeBlock>
          <Quiz topicId="az-adf" questions={[
            {
              question: "Which ADF trigger type is best for processing historical data gaps? It guarantees each window runs exactly once and supports backfilling.",
              options: [
                "Schedule trigger",
                "Tumbling Window trigger",
                "Storage Event trigger",
                "Custom Events trigger"
              ],
              correct: 1
            },
            {
              question: "You need to connect ADF to an on-premises Oracle database behind a corporate firewall. What Integration Runtime type should you use?",
              options: [
                "Azure Integration Runtime in the same VNet",
                "Self-hosted Integration Runtime installed on a VM in your network",
                "Azure SSIS Integration Runtime",
                "Managed Virtual Network Integration Runtime"
              ],
              correct: 1
            },
            {
              question: "In ADF, what does setting 'dataIntegrationUnits' (DIUs) on a Copy activity control?",
              options: [
                "The number of parallel ForEach iterations",
                "The amount of cloud compute power (CPU/memory/network bandwidth) allocated to the copy operation",
                "The number of retry attempts on failure",
                "The number of partitions read from the source"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-adf'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-synapse ────────────────────────────────────────── */}
        <section id="az-synapse" ref={el => { if (el) sectionRefs.current['az-synapse'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Synapse Analytics</h1>
            <p className="topic-desc">Synapse is Azure's unified analytics platform combining a dedicated SQL pool (formerly SQL DW - massively parallel processing), a serverless SQL pool (query-on-demand over data lake files), Apache Spark pools, and integration pipelines - all in one workspace. Understanding when to use each pool type is critical for exam and interviews.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#9878;</span>
            <div className="callout-body">
              <strong>Dedicated vs Serverless vs Spark: choose the right engine.</strong> Use <strong>Dedicated SQL Pool</strong> when you have consistent BI workloads, need sub-second query performance, and can justify always-on cost (pause when unused). Use <strong>Serverless SQL Pool</strong> for ad-hoc exploration of ADLS files - you pay per TB scanned, no infrastructure to manage. Use <strong>Spark Pool</strong> for complex transformations, ML, Delta Lake operations, and Python/Scala workloads.
            </div>
          </div>
          <CodeBlock lang="sql">{`-- Dedicated SQL Pool: distribution strategies and optimizations

-- CTAS with HASH distribution on the join/group key
-- This collocates rows for joins without shuffle
CREATE TABLE dbo.fact_sales
WITH (
    DISTRIBUTION = HASH(customer_id),  -- rows with same customer_id go to same node
    CLUSTERED COLUMNSTORE INDEX,        -- optimal for analytical queries
    PARTITION (sale_date RANGE RIGHT FOR VALUES (
        '2023-01-01', '2023-04-01', '2023-07-01', '2024-01-01'
    ))
)
AS
SELECT
    s.sale_id,
    s.customer_id,
    s.product_id,
    s.sale_date,
    s.amount,
    s.quantity,
    p.product_name,
    p.category
FROM staging.sales s
JOIN dbo.dim_product p ON s.product_id = p.product_id;

-- Distribution options:
-- HASH(column)     - best for large fact tables, joins on same column
-- ROUND_ROBIN      - default, good for staging/temp tables
-- REPLICATE        - copies full table to every node, best for small dims (<2GB)

-- Create statistics (critical for query optimizer)
CREATE STATISTICS stats_fact_sales_customer ON dbo.fact_sales (customer_id);
CREATE STATISTICS stats_fact_sales_date ON dbo.fact_sales (sale_date);
CREATE STATISTICS stats_fact_sales_product ON dbo.fact_sales (product_id);

-- Enable result set caching (for repeated identical queries, e.g. dashboard)
ALTER DATABASE MyDW SET RESULT_SET_CACHING ON;
-- Disable caching for a specific query
SELECT /*+ NO_RESULT_SET_CACHING */ customer_id, sum(amount)
FROM dbo.fact_sales
GROUP BY customer_id;

-- Check if result was served from cache (1=cache hit, 0=miss)
SELECT * FROM sys.dm_pdw_exec_requests
WHERE [label] = 'my_query'
ORDER BY submit_time DESC;

-- DWU scaling (pause/resume via T-SQL)
ALTER DATABASE MyDW MODIFY (SERVICE_OBJECTIVE = 'DW1000c');  -- scale up
-- Or pause: ALTER DATABASE MyDW SET AUTO_PAUSE_DELAY = 60;  -- pause after 60 min

-- Monitor skew across distributions
SELECT
    table_name,
    distribution_id,
    row_count,
    reserved_space_MB,
    data_space_MB
FROM sys.dm_pdw_nodes_db_partition_stats s
JOIN sys.tables t ON s.object_id = t.object_id
ORDER BY table_name, distribution_id;`}</CodeBlock>
          <CodeBlock lang="sql">{`-- PolyBase: EXTERNAL TABLE over ADLS Gen2 Parquet
-- Step 1: Create credential
CREATE DATABASE SCOPED CREDENTIAL adls_credential
WITH IDENTITY = 'service principal',
SECRET = 'client-id:client-secret';  -- or use Managed Identity

-- Step 2: Create external data source
CREATE EXTERNAL DATA SOURCE adls_bronze
WITH (
    TYPE = HADOOP,
    LOCATION = 'abfss://bronze@adlsprod.dfs.core.windows.net',
    CREDENTIAL = adls_credential
);

-- Step 3: Create external file format
CREATE EXTERNAL FILE FORMAT parquet_format
WITH (FORMAT_TYPE = PARQUET,
      DATA_COMPRESSION = 'org.apache.hadoop.io.compress.SnappyCodec');

-- Step 4: Create external table
CREATE EXTERNAL TABLE ext_events (
    event_id        BIGINT,
    user_id         BIGINT,
    event_type      NVARCHAR(50),
    event_timestamp DATETIME2,
    amount          DECIMAL(18,2),
    event_date      DATE
)
WITH (
    LOCATION = '/raw/events/',
    DATA_SOURCE = adls_bronze,
    FILE_FORMAT = parquet_format,
    REJECT_TYPE = VALUE,
    REJECT_VALUE = 10  -- reject query if more than 10 rows fail to parse
);

-- Query external table (data stays in ADLS, no import needed)
SELECT event_date, count(*) as event_count, sum(amount) as total_amount
FROM ext_events
WHERE event_date >= '2024-01-01'
GROUP BY event_date
ORDER BY event_date;

-- Load into dedicated pool for performance
INSERT INTO dbo.fact_events
SELECT * FROM ext_events
WHERE event_date = CAST(GETDATE() AS DATE);`}</CodeBlock>
          <CodeBlock lang="sql">{`-- Serverless SQL Pool: OPENROWSET for ad-hoc ADLS queries
-- No infrastructure needed - pay per TB scanned

-- Query a single Parquet file
SELECT TOP 100 *
FROM OPENROWSET(
    BULK 'https://adlsprod.dfs.core.windows.net/bronze/raw/events/2024/01/events.parquet',
    FORMAT = 'PARQUET'
) AS r;

-- Query with partition pruning using wildcards
SELECT
    r.event_date,
    r.event_type,
    count(*) as cnt,
    sum(r.amount) as total
FROM OPENROWSET(
    BULK 'https://adlsprod.dfs.core.windows.net/silver/events/event_date=*/part-*.parquet',
    FORMAT = 'PARQUET'
) WITH (
    event_id        BIGINT,
    user_id         BIGINT,
    event_type      VARCHAR(50),
    event_date      DATE,
    amount          DECIMAL(18,2)
) AS r
WHERE r.event_date BETWEEN '2024-01-01' AND '2024-03-31'
GROUP BY r.event_date, r.event_type;

-- Create a view over serverless for easy BI tool access
CREATE VIEW silver.vw_events AS
SELECT *
FROM OPENROWSET(
    BULK 'https://adlsprod.dfs.core.windows.net/silver/events/**',
    FORMAT = 'PARQUET'
) AS r;

-- Query Delta Lake format in serverless pool
SELECT *
FROM OPENROWSET(
    BULK 'https://adlsprod.dfs.core.windows.net/gold/customers/',
    FORMAT = 'DELTA'
) AS r
WHERE r.country = 'US';`}</CodeBlock>
          <CodeBlock lang="python">{`# Synapse Spark Pool - reading Delta Lake from ADLS
# (Runs inside a Synapse Spark pool, not standalone PySpark)

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum as spark_sum, count, to_date
from delta.tables import DeltaTable

# Spark session is pre-initialized in Synapse as 'spark'
# Configure ADLS access (via linked service - Synapse manages credentials)
spark.conf.set(
    "fs.azure.account.auth.type.adlsprod.dfs.core.windows.net",
    "SAS"  # or OAuth via managed identity - Synapse handles this automatically
)

# Read Delta table from ADLS
events_df = spark.read.format("delta").load(
    "abfss://silver@adlsprod.dfs.core.windows.net/events/"
)

# Time travel
events_yesterday = spark.read.format("delta").option("versionAsOf", 5).load(
    "abfss://silver@adlsprod.dfs.core.windows.net/events/"
)

# Z-order optimization for Synapse Spark + Delta
delta_table = DeltaTable.forPath(spark, "abfss://silver@adlsprod.dfs.core.windows.net/events/")
delta_table.optimize().executeZOrderBy("user_id", "event_date")

# Write aggregated results to Gold
gold_df = events_df.groupBy("user_id", to_date("event_timestamp").alias("event_date")) \\
    .agg(
        spark_sum("amount").alias("total_amount"),
        count("*").alias("event_count")
    )

gold_df.write.format("delta") \\
    .mode("overwrite") \\
    .option("overwriteSchema", "true") \\
    .save("abfss://gold@adlsprod.dfs.core.windows.net/user_daily_summary/")

# Register as Synapse Spark catalog table for SQL access
gold_df.write.format("delta") \\
    .mode("overwrite") \\
    .saveAsTable("gold.user_daily_summary")`}</CodeBlock>
          <Quiz topicId="az-synapse" questions={[
            {
              question: "Your BI team runs the same 5 dashboard queries hundreds of times per day on a Dedicated SQL Pool. Which feature eliminates repeated compute cost for identical queries?",
              options: [
                "Materialized views",
                "Result Set Caching",
                "Clustered Columnstore Index",
                "Workload Management"
              ],
              correct: 1
            },
            {
              question: "You have a 500 GB dimension table that is joined to a 10 TB fact table in a Dedicated SQL Pool. What distribution strategy should the dimension table use to avoid shuffle?",
              options: [
                "HASH on the join key",
                "ROUND_ROBIN",
                "REPLICATE",
                "PARTITION on the join key"
              ],
              correct: 2
            },
            {
              question: "A data analyst needs to quickly explore raw JSON files in ADLS without loading data into a dedicated pool. Which Synapse feature should they use?",
              options: [
                "Dedicated SQL Pool with external tables",
                "Serverless SQL Pool with OPENROWSET",
                "Spark Pool with DataFrames",
                "Azure Data Factory mapping data flow"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-synapse'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-databricks ─────────────────────────────────────── */}
        <section id="az-databricks" ref={el => { if (el) sectionRefs.current['az-databricks'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Databricks</h1>
            <p className="topic-desc">Azure Databricks is the managed Spark platform on Azure, jointly developed by Databricks and Microsoft. It provides workspace management, cluster lifecycle, Unity Catalog for data governance, Delta Lake integration, and deep Azure service integrations. It runs in your Azure subscription (BYOC - bring your own cloud) with Databricks managing the control plane.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128218;</span>
            <div className="callout-body">
              <strong>Unity Catalog replaces the legacy per-workspace Hive metastore.</strong> It provides a single three-level namespace (catalog.schema.table) across all workspaces in an account, centralized access control with fine-grained column and row-level security, lineage tracking, and Delta Sharing. If you are starting a new workspace today, always enable Unity Catalog. The legacy mount-based DBFS approach is deprecated in Unity Catalog - use direct abfss:// paths or external locations instead.
            </div>
          </div>
          <CodeBlock lang="python">{`# Cluster configuration - all-purpose vs job clusters
# All-purpose clusters: interactive, shared, persist between runs (expensive!)
# Job clusters: ephemeral, created for a job run, terminated after (cost-efficient)

# Cluster config JSON (used in REST API or terraform)
cluster_config = {
    "cluster_name": "data-engineering-shared",
    "spark_version": "14.3.x-scala2.12",
    "node_type_id": "Standard_DS3_v2",
    "driver_node_type_id": "Standard_DS3_v2",

    # Autoscaling - starts at 2 workers, scales to 8
    "autoscale": {
        "min_workers": 2,
        "max_workers": 8
    },

    # Spot instances via instance pool (cost reduction ~60-80%)
    "instance_pool_id": "pool-xxxx",        # pre-provisioned pool
    "driver_instance_pool_id": "pool-xxxx",

    # Auto-terminate after 30 min idle
    "autotermination_minutes": 30,

    # Spark config
    "spark_conf": {
        "spark.sql.shuffle.partitions": "auto",
        "spark.databricks.delta.optimizeWrite.enabled": "true",
        "spark.databricks.delta.autoCompact.enabled": "true",
        "spark.databricks.io.cache.enabled": "true"  # SSD caching for Parquet
    },

    # Environment variables
    "spark_env_vars": {
        "PYSPARK_PYTHON": "/databricks/python3/bin/python3"
    },

    # Custom libraries
    "libraries": [
        {"pypi": {"package": "azure-storage-file-datalake==12.14.0"}},
        {"maven": {"coordinates": "io.delta:delta-core_2.12:2.4.0"}}
    ]
}`}</CodeBlock>
          <CodeBlock lang="python">{`# Unity Catalog - three-level namespace and governance
# catalog.schema.table (e.g., prod_catalog.silver.events)

# Switch to a catalog
spark.sql("USE CATALOG prod_catalog")
spark.sql("USE SCHEMA silver")

# Create schema with managed location
spark.sql("""
    CREATE SCHEMA IF NOT EXISTS prod_catalog.silver
    MANAGED LOCATION 'abfss://silver@adlsprod.dfs.core.windows.net/'
    COMMENT 'Silver layer - cleaned and conformed data'
""")

# Create a Unity Catalog managed table
spark.sql("""
    CREATE TABLE IF NOT EXISTS prod_catalog.silver.events (
        event_id        BIGINT NOT NULL,
        user_id         BIGINT NOT NULL,
        event_type      STRING,
        event_timestamp TIMESTAMP,
        amount          DECIMAL(18,2),
        event_date      DATE
    )
    USING DELTA
    PARTITIONED BY (event_date)
    TBLPROPERTIES (
        'delta.enableChangeDataFeed' = 'true',
        'delta.autoOptimize.optimizeWrite' = 'true'
    )
""")

# Grant privileges (Unity Catalog RBAC)
spark.sql("GRANT SELECT ON TABLE prod_catalog.silver.events TO \`data-analysts-group\`")
spark.sql("GRANT MODIFY ON TABLE prod_catalog.silver.events TO \`data-engineers-group\`")
spark.sql("GRANT ALL PRIVILEGES ON SCHEMA prod_catalog.silver TO \`data-engineers-group\`")

# Row-level security with row filters
spark.sql("""
    CREATE OR REPLACE FUNCTION prod_catalog.security.events_row_filter(user_country STRING)
    RETURN IF(is_member('eu-data-group'), user_country = 'EU', TRUE)
""")
spark.sql("""
    ALTER TABLE prod_catalog.silver.events
    SET ROW FILTER prod_catalog.security.events_row_filter ON (country)
""")

# Column masking
spark.sql("""
    CREATE OR REPLACE FUNCTION prod_catalog.security.mask_pii(col STRING)
    RETURN IF(is_member('pii-access-group'), col, '***MASKED***')
""")

# Three-level namespace in Python
df = spark.read.table("prod_catalog.silver.events")
df.write.saveAsTable("prod_catalog.gold.user_metrics")`}</CodeBlock>
          <CodeBlock lang="python">{`# Secret Scopes - Azure Key Vault-backed (recommended)
# Setup: create secret scope backed by Key Vault via Databricks CLI or UI
# databricks secrets create-scope --scope kv-scope \\
#   --scope-backend-type AZURE_KEYVAULT \\
#   --resource-id /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.KeyVault/vaults/{kv-name} \\
#   --dns-name https://{kv-name}.vault.azure.net/

# Retrieve secrets in notebook (returns redacted string - never prints actual value)
sp_client_id = dbutils.secrets.get(scope="kv-scope", key="sp-client-id")
sp_client_secret = dbutils.secrets.get(scope="kv-scope", key="sp-client-secret")
tenant_id = dbutils.secrets.get(scope="kv-scope", key="tenant-id")

# Use in Spark config for ADLS access
spark.conf.set(f"fs.azure.account.oauth2.client.id.{storage_account}.dfs.core.windows.net", sp_client_id)
spark.conf.set(f"fs.azure.account.oauth2.client.secret.{storage_account}.dfs.core.windows.net", sp_client_secret)

# List available secrets (shows keys only, not values)
secrets_list = dbutils.secrets.list(scope="kv-scope")
for secret in secrets_list:
    print(secret.key)  # prints key names, never values

# Databricks-native secret scope (non-KV backed)
# databricks secrets put --scope my-scope --key my-key  (interactive)
# Or via API:
import requests
headers = {"Authorization": f"Bearer {DATABRICKS_TOKEN}"}
requests.post(f"{DATABRICKS_HOST}/api/2.0/secrets/put", headers=headers,
    json={"scope": "my-scope", "key": "api-key", "string_value": "secret-value"})`}</CodeBlock>
          <CodeBlock lang="python">{`# ADLS Mount vs Direct abfss:// access

# ---- LEGACY: Mount point (deprecated in Unity Catalog era) ----
# Mounts ADLS path as /mnt/bronze - hides credentials but is workspace-global
dbutils.fs.mount(
    source="abfss://bronze@adlsprod.dfs.core.windows.net/",
    mount_point="/mnt/bronze",
    extra_configs={
        "fs.azure.account.auth.type": "OAuth",
        "fs.azure.account.oauth.provider.type": "org.apache.hadoop.fs.azurebfs.oauth2.ClientCredsTokenProvider",
        "fs.azure.account.oauth2.client.id": dbutils.secrets.get("kv-scope", "sp-client-id"),
        "fs.azure.account.oauth2.client.secret": dbutils.secrets.get("kv-scope", "sp-client-secret"),
        "fs.azure.account.oauth2.client.endpoint": f"https://login.microsoftonline.com/{tenant_id}/oauth2/token"
    }
)
# Usage with mount: spark.read.parquet("/mnt/bronze/raw/events/")
# Problem: mount is global, bypasses Unity Catalog governance

# ---- MODERN: Direct abfss:// (recommended with Unity Catalog) ----
# Unity Catalog uses External Locations and Storage Credentials
# No per-notebook config needed - Unity Catalog manages access transparently

# Register storage credential (one-time, admin only)
spark.sql("""
    CREATE STORAGE CREDENTIAL adls_prod_cred
    WITH AZURE_MANAGED_IDENTITY
""")

# Register external location
spark.sql("""
    CREATE EXTERNAL LOCATION bronze_location
    URL 'abfss://bronze@adlsprod.dfs.core.windows.net/'
    WITH (STORAGE CREDENTIAL adls_prod_cred)
""")

# Now any table in Unity Catalog backed by this location is accessible
# with fine-grained access control
df = spark.read.parquet("abfss://bronze@adlsprod.dfs.core.windows.net/raw/events/")`}</CodeBlock>
          <Quiz topicId="az-databricks" questions={[
            {
              question: "What is the key difference between an all-purpose cluster and a job cluster in Databricks?",
              options: [
                "All-purpose clusters use Spot instances while job clusters use on-demand",
                "All-purpose clusters persist between runs (interactive use), job clusters are ephemeral and created/terminated per job run",
                "All-purpose clusters support Python while job clusters only support Scala",
                "Job clusters support autoscaling while all-purpose clusters have fixed size"
              ],
              correct: 1
            },
            {
              question: "In Unity Catalog, what is the three-level namespace format for referencing a table?",
              options: [
                "workspace.database.table",
                "subscription.schema.table",
                "catalog.schema.table",
                "environment.catalog.table"
              ],
              correct: 2
            },
            {
              question: "Why should DBFS mounts be avoided in a Unity Catalog-enabled workspace?",
              options: [
                "Mounts are slower than direct abfss:// access",
                "Mounts are workspace-global and bypass Unity Catalog governance - any user in the workspace can access mounted data regardless of UC permissions",
                "Mounts only support Parquet format",
                "Mounts are not supported in Databricks Runtime 14+"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-databricks'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-eventhub ───────────────────────────────────────── */}
        <section id="az-eventhub" ref={el => { if (el) sectionRefs.current['az-eventhub'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Event Hub</h1>
            <p className="topic-desc">Azure Event Hub is a fully managed, high-throughput event streaming service capable of ingesting millions of events per second. It is partitioned (like Kafka topics), supports consumer groups for independent reads, and is the primary Azure service for real-time data ingestion pipelines. Event Hub Premium and Dedicated tiers offer schema registry and private endpoints.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#9888;</span>
            <div className="callout-body">
              <strong>Partition count is IMMUTABLE after creation - plan ahead.</strong> Partitions determine the maximum parallelism of consumers. Event Hub Standard supports up to 32 partitions; Premium and Dedicated support up to 100. A common mistake is creating an Event Hub with the default 2 partitions, then discovering it cannot scale to match a Spark cluster with 20 workers. For high-throughput production workloads, set partitions at creation to match your expected max consumer parallelism.
            </div>
          </div>
          <CodeBlock lang="python">{`# azure-eventhub SDK - producer and consumer
import asyncio
from azure.eventhub import EventData
from azure.eventhub.aio import EventHubProducerClient, EventHubConsumerClient
from azure.identity.aio import DefaultAzureCredential

NAMESPACE = "evhns-data-platform.servicebus.windows.net"
EVENTHUB_NAME = "evh-user-events"

# ---- PRODUCER ----
async def send_events():
    credential = DefaultAzureCredential()
    producer = EventHubProducerClient(
        fully_qualified_namespace=NAMESPACE,
        eventhub_name=EVENTHUB_NAME,
        credential=credential
    )
    async with producer:
        # Send a batch (more efficient than individual sends)
        event_data_batch = await producer.create_batch(
            partition_key="user-123"  # same key always goes to same partition
        )

        for i in range(100):
            event = EventData(body=f'{{"user_id": 123, "action": "click", "seq": {i}}}')
            event.properties = {"source": "web-app", "version": "2"}

            try:
                event_data_batch.add(event)
            except ValueError:
                # Batch full - send current batch and start new one
                await producer.send_batch(event_data_batch)
                event_data_batch = await producer.create_batch(partition_key="user-123")
                event_data_batch.add(event)

        await producer.send_batch(event_data_batch)
        print("Batch sent successfully")

# ---- CONSUMER ----
async def receive_events():
    credential = DefaultAzureCredential()
    consumer = EventHubConsumerClient(
        fully_qualified_namespace=NAMESPACE,
        eventhub_name=EVENTHUB_NAME,
        consumer_group="$Default",        # use named consumer groups in prod
        credential=credential,
        checkpoint_store=BlobCheckpointStore(  # stores checkpoints in Blob Storage
            blob_account_url="https://storageaccount.blob.core.windows.net",
            container_name="checkpoints",
            credential=credential
        )
    )

    async def on_event(partition_context, event):
        print(f"Partition: {partition_context.partition_id}")
        print(f"Sequence: {event.sequence_number}")
        print(f"Body: {event.body_as_str()}")
        # Checkpoint after processing (saves offset for recovery)
        await partition_context.update_checkpoint(event)

    async with consumer:
        await consumer.receive(
            on_event=on_event,
            starting_position="-1",  # -1 = from beginning; "@latest" = only new
            max_wait_time=30
        )

asyncio.run(send_events())`}</CodeBlock>
          <CodeBlock lang="python">{`# PySpark Structured Streaming from Event Hub
# Requires: com.microsoft.azure:azure-eventhubs-spark_2.12:2.3.22 jar

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, window
from pyspark.sql.types import StructType, StructField, StringType, LongType, TimestampType

# Event Hub connection config (use Key Vault for secrets in prod!)
EH_NAMESPACE = "evhns-data-platform"
EH_NAME = "evh-user-events"
EH_CONN_STR = dbutils.secrets.get("kv-scope", "eventhub-connection-string")

eh_conf = {
    "eventhubs.connectionString": sc._jvm.org.apache.spark.eventhubs.EventHubsUtils.encrypt(EH_CONN_STR),
    "eventhubs.consumerGroup": "spark-consumer-group",
    "eventhubs.startingPosition": '{"offset": "-1", "seqNo": -1, "enqueuedTime": null, "isInclusive": true}',
    "eventhubs.maxEventsPerTrigger": 10000,   # limit batch size per trigger
    "eventhubs.useExclusiveReceiver": "false"
}

# Define schema for JSON payload
schema = StructType([
    StructField("user_id", LongType()),
    StructField("action", StringType()),
    StructField("timestamp", TimestampType()),
    StructField("amount", StringType()),
    StructField("session_id", StringType()),
])

# Read stream from Event Hub
raw_stream = spark.readStream \\
    .format("eventhubs") \\
    .options(**eh_conf) \\
    .load()

# Parse JSON body (Event Hub body is binary)
events_stream = raw_stream.select(
    col("body").cast("string").alias("json_str"),
    col("enqueuedTime").alias("event_time"),
    col("partition").alias("partition_id"),
    col("sequenceNumber")
).select(
    from_json(col("json_str"), schema).alias("data"),
    col("event_time"),
    col("partition_id")
).select("data.*", "event_time", "partition_id")

# Windowed aggregation (tumbling window, 5-minute buckets)
windowed_agg = events_stream \\
    .withWatermark("event_time", "10 minutes") \\
    .groupBy(
        window(col("event_time"), "5 minutes"),
        col("action")
    ).count()

# Write to ADLS with checkpointing for fault tolerance
query = windowed_agg.writeStream \\
    .format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "abfss://checkpoints@adlsprod.dfs.core.windows.net/eventhub/agg/") \\
    .option("path", "abfss://gold@adlsprod.dfs.core.windows.net/event_aggregations/") \\
    .trigger(processingTime="1 minute") \\
    .start()

query.awaitTermination()`}</CodeBlock>
          <CodeBlock lang="bash">{`# Create Event Hub namespace and hub with az CLI

# Create namespace (Standard tier - Kafka compatible)
az eventhubs namespace create \\
  --name evhns-data-platform \\
  --resource-group rg-data-platform \\
  --location eastus2 \\
  --sku Standard \\
  --capacity 10 \\         # throughput units: 1 TU = 1MB/s in, 2MB/s out
  --enable-kafka true \\   # Kafka protocol support
  --enable-auto-inflate true \\  # auto-scale TUs
  --maximum-throughput-units 20

# Create Event Hub with 32 partitions (set wisely - immutable!)
az eventhubs eventhub create \\
  --name evh-user-events \\
  --namespace-name evhns-data-platform \\
  --resource-group rg-data-platform \\
  --partition-count 32 \\
  --message-retention 7 \\  # days to retain messages (1-7 for Standard)
  --cleanup-policy Delete

# Create consumer group per consumer application
az eventhubs eventhub consumer-group create \\
  --name spark-consumer-group \\
  --eventhub-name evh-user-events \\
  --namespace-name evhns-data-platform \\
  --resource-group rg-data-platform

az eventhubs eventhub consumer-group create \\
  --name flink-consumer-group \\
  --eventhub-name evh-user-events \\
  --namespace-name evhns-data-platform \\
  --resource-group rg-data-platform

# Get connection string for a specific policy
az eventhubs namespace authorization-rule keys list \\
  --resource-group rg-data-platform \\
  --namespace-name evhns-data-platform \\
  --name RootManageSharedAccessKey \\
  --query primaryConnectionString`}</CodeBlock>
          <CodeBlock lang="json">{`{
  "captureDescription": {
    "enabled": true,
    "encoding": "Avro",
    "intervalInSeconds": 300,
    "sizeLimitInBytes": 314572800,
    "destination": {
      "name": "EventHubArchive.AzureBlockBlob",
      "properties": {
        "storageAccountResourceId": "/subscriptions/{sub-id}/resourceGroups/rg-data/providers/Microsoft.Storage/storageAccounts/adlsprod",
        "blobContainer": "eventhub-capture",
        "archiveNameFormat": "{Namespace}/{EventHub}/{PartitionId}/{Year}/{Month}/{Day}/{Hour}/{Minute}/{Second}"
      }
    },
    "skipEmptyArchives": true
  }
}`}</CodeBlock>
          <CodeBlock lang="python">{`# Kafka-compatible producer pointing to Event Hub
# Event Hub Standard/Premium/Dedicated supports Kafka protocol natively
# No code change needed - just update bootstrap servers and SASL config
from confluent_kafka import Producer, Consumer
import json

# Connection string from Event Hub SAS policy
# Format: endpoint=sb://{ns}.servicebus.windows.net/;SharedAccessKeyName=...;SharedAccessKey=...
CONN_STR = "Endpoint=sb://evhns-data-platform.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=yourkey"
# Extract just the SASL password: encode as base64 for Kafka PLAIN auth
import base64
SASL_PASSWORD = "$ConnectionString:" + CONN_STR

producer_config = {
    "bootstrap.servers": "evhns-data-platform.servicebus.windows.net:9093",
    "security.protocol": "SASL_SSL",
    "sasl.mechanism": "PLAIN",
    "sasl.username": "$ConnectionString",
    "sasl.password": SASL_PASSWORD,
    "client.id": "my-producer-app"
}

producer = Producer(producer_config)

def delivery_report(err, msg):
    if err:
        print(f"Message delivery failed: {err}")
    else:
        print(f"Delivered to partition {msg.partition()} offset {msg.offset()}")

for i in range(100):
    event = {"user_id": i, "action": "purchase", "amount": i * 9.99}
    producer.produce(
        topic="evh-user-events",           # Event Hub name = Kafka topic
        key=str(i % 32).encode(),          # partition key
        value=json.dumps(event).encode(),
        callback=delivery_report
    )
    producer.poll(0)

producer.flush()  # wait for all messages to be delivered`}</CodeBlock>
          <Quiz topicId="az-eventhub" questions={[
            {
              question: "Event Hub partition count cannot be changed after creation. You create an Event Hub with 4 partitions and your Spark streaming job has 20 executors. What is the maximum parallelism your Spark job will achieve reading from this Event Hub?",
              options: [
                "20 - Spark auto-splits partitions to match executor count",
                "4 - Spark creates at most one task per Event Hub partition",
                "80 - Spark multiplies partitions by a parallelism factor",
                "1 - Event Hub only allows single-threaded consumption"
              ],
              correct: 1
            },
            {
              question: "What is the purpose of a consumer group in Event Hub?",
              options: [
                "To limit the throughput of a specific consumer",
                "To allow multiple independent consumers to each read the full stream at their own pace with separate offsets",
                "To group related events from the same producer",
                "To enable message filtering on the consumer side"
              ],
              correct: 1
            },
            {
              question: "Event Hub Capture saves events to ADLS in which format by default?",
              options: ["JSON", "CSV", "Avro", "Parquet"],
              correct: 2
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-eventhub'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-eventgrid ──────────────────────────────────────── */}
        <section id="az-eventgrid" ref={el => { if (el) sectionRefs.current['az-eventgrid'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Event Grid</h1>
            <p className="topic-desc">Azure Event Grid is a fully managed event routing service built for reactive, event-driven architectures. It delivers discrete events (not streams) from sources like Azure services (Blob Storage, Resource Manager) or custom topics to handlers like Azure Functions, Logic Apps, webhooks, or Event Hub. It is the backbone of event-driven file ingestion patterns in Azure data platforms.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128260;</span>
            <div className="callout-body">
              <strong>Event Grid vs Event Hub - common interview question.</strong> Event Grid is for <em>reactive event routing</em>: discrete events (a file was created, a resource was deleted), push-based delivery, at most millions of events/day per topic, with filtering and routing to multiple subscribers. Event Hub is for <em>high-throughput streaming ingestion</em>: continuous telemetry/logs, millions of events/second, pull-based (consumers control offset), retained for days. In practice, Event Grid notifications trigger Databricks Auto Loader when new files land in ADLS.
            </div>
          </div>
          <CodeBlock lang="bash">{`# Create Event Grid topic and subscriptions

# Create a custom Event Grid topic
az eventgrid topic create \\
  --name egt-data-platform \\
  --resource-group rg-data-platform \\
  --location eastus2 \\
  --input-schema cloudeventschemav1_0  # or EventGridSchema

# Create event subscription to a webhook (Azure Function)
az eventgrid event-subscription create \\
  --name es-new-file-to-function \\
  --source-resource-id /subscriptions/{sub}/resourceGroups/rg-data/providers/Microsoft.Storage/storageAccounts/adlsprod \\
  --endpoint-type webhook \\
  --endpoint https://func-data-platform.azurewebsites.net/api/processNewFile \\
  --included-event-types "Microsoft.Storage.BlobCreated" \\
  --subject-begins-with "/blobServices/default/containers/raw-data/blobs/incoming/" \\
  --subject-ends-with ".json"

# Add dead letter destination (where undeliverable events go)
az eventgrid event-subscription create \\
  --name es-new-file-dlq \\
  --source-resource-id /subscriptions/{sub}/resourceGroups/rg-data/providers/Microsoft.Storage/storageAccounts/adlsprod \\
  --endpoint-type storagequeue \\
  --endpoint /subscriptions/{sub}/resourceGroups/rg-data/providers/Microsoft.Storage/storageAccounts/adlsprod/queueServices/default/queues/dead-letter-queue \\
  --included-event-types "Microsoft.Storage.BlobCreated" \\
  --deadletter-endpoint /subscriptions/{sub}/resourceGroups/rg-data/providers/Microsoft.Storage/storageAccounts/adlsprod/blobServices/default/containers/dead-letters

# Retry policy - max attempts and event TTL
az eventgrid event-subscription update \\
  --name es-new-file-to-function \\
  --source-resource-id /subscriptions/{sub}/resourceGroups/rg-data/providers/Microsoft.Storage/storageAccounts/adlsprod \\
  --max-delivery-attempts 30 \\
  --event-ttl 1440  # minutes = 24 hours`}</CodeBlock>
          <CodeBlock lang="python">{`# azure-eventgrid SDK - publish custom events
from azure.eventgrid import EventGridPublisherClient, EventGridEvent
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
import uuid
from datetime import datetime, timezone

# Topic endpoint and key
TOPIC_ENDPOINT = "https://egt-data-platform.eastus2-1.eventgrid.azure.net/api/events"
TOPIC_KEY = "your-topic-key"  # get from Key Vault in production

client = EventGridPublisherClient(
    endpoint=TOPIC_ENDPOINT,
    credential=AzureKeyCredential(TOPIC_KEY)
)

# Publish a batch of custom events
events = [
    EventGridEvent(
        subject=f"/data/pipeline/run/{run_id}",
        data={
            "pipeline_name": "pl_ingest_events",
            "run_id": run_id,
            "status": "Succeeded",
            "rows_processed": 150000,
            "duration_seconds": 42
        },
        event_type="DataPlatform.Pipeline.Completed",
        data_version="1.0"
    )
    for run_id in ["run-001", "run-002", "run-003"]
]

client.send(events)
print(f"Published {len(events)} events to Event Grid")`}</CodeBlock>
          <CodeBlock lang="python">{`# Auto Loader with Event Grid for efficient file discovery
# Auto Loader uses Event Grid notifications instead of listing ADLS (much faster at scale)
# Databricks manages the Event Grid subscription automatically

# cloudFiles source - Event Grid mode (recommended for large-scale ingestion)
raw_stream = spark.readStream \\
    .format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", "abfss://checkpoints@adlsprod.dfs.core.windows.net/autoloader/events/schema/") \\
    .option("cloudFiles.inferColumnTypes", "true") \\
    .option("cloudFiles.useNotifications", "true") \\    # use Event Grid (vs directory listing)
    .option("cloudFiles.validateOptions", "true") \\
    .option("header", "true") \\
    .load("abfss://raw-data@adlsprod.dfs.core.windows.net/incoming/events/")

# Auto Loader adds metadata columns automatically
processed = raw_stream.select(
    "*",
    col("_metadata.file_path").alias("source_file"),
    col("_metadata.file_modification_time").alias("file_modified_at"),
    col("_metadata.file_size").alias("file_size_bytes")
)

# Write to Bronze Delta table with checkpointing
processed.writeStream \\
    .format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "abfss://checkpoints@adlsprod.dfs.core.windows.net/autoloader/events/") \\
    .option("mergeSchema", "true") \\
    .trigger(availableNow=True) \\  # process all available files then stop (batch mode)
    .toTable("prod_catalog.bronze.raw_events")`}</CodeBlock>
          <CodeBlock lang="json">{`{
  "filter": {
    "subjectBeginsWith": "/blobServices/default/containers/raw-data/blobs/incoming/",
    "subjectEndsWith": ".parquet",
    "includedEventTypes": [
      "Microsoft.Storage.BlobCreated",
      "Microsoft.Storage.BlobRenamed"
    ],
    "advancedFilters": [
      {
        "key": "data.contentLength",
        "operatorType": "NumberGreaterThan",
        "value": 1000
      },
      {
        "key": "data.api",
        "operatorType": "StringNotIn",
        "values": ["PutBlockList"]
      }
    ]
  },
  "retryPolicy": {
    "maxDeliveryAttempts": 30,
    "eventTimeToLiveInMinutes": 1440
  },
  "deadLetterDestination": {
    "endpointType": "StorageBlob",
    "properties": {
      "resourceId": "/subscriptions/{sub}/resourceGroups/rg-data/providers/Microsoft.Storage/storageAccounts/adlsprod",
      "blobContainerName": "dead-letters"
    }
  }
}`}</CodeBlock>
          <Quiz topicId="az-eventgrid" questions={[
            {
              question: "A new Parquet file arrives in ADLS and must trigger a Databricks Auto Loader pipeline within seconds. Which Azure service provides the file creation notification?",
              options: [
                "Event Hub - it continuously streams file system events",
                "Event Grid - it routes the BlobCreated event from ADLS to Auto Loader",
                "Service Bus - it queues the file arrival message",
                "Azure Monitor - it detects the storage metric change"
              ],
              correct: 1
            },
            {
              question: "What happens to an Event Grid event that cannot be delivered after all retry attempts are exhausted?",
              options: [
                "It is silently dropped",
                "It is automatically retried indefinitely",
                "It is routed to the dead letter destination (blob/queue) if configured, otherwise dropped",
                "It is sent back to the event source"
              ],
              correct: 2
            },
            {
              question: "Event Grid delivers events in which pattern?",
              options: [
                "Pull-based: consumers poll for events",
                "Push-based: Event Grid pushes events to subscriber endpoints",
                "Streaming: consumers read from a persistent log",
                "Batch-based: events are accumulated then sent in bulk on a schedule"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-eventgrid'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-servicebus ─────────────────────────────────────── */}
        <section id="az-servicebus" ref={el => { if (el) sectionRefs.current['az-servicebus'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Service Bus</h1>
            <p className="topic-desc">Azure Service Bus is an enterprise messaging service supporting queues (point-to-point) and topics with subscriptions (pub/sub). Unlike Event Hub, Service Bus guarantees ordered delivery, supports message sessions for FIFO processing, dead letter queues for failed messages, and transactional semantics - making it the right choice for workflow orchestration and reliable command messaging.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128235;</span>
            <div className="callout-body">
              <strong>Service Bus vs Event Hub - know the difference.</strong> Service Bus: ordered delivery (with sessions), max 256KB-100MB per message, message lock (prevents duplicate processing), dead letter queue, at-most-once or at-least-once delivery semantics, supports competing consumers pattern. Event Hub: high-throughput (millions/sec), messages are a persistent log read by offset, no lock/settlement, designed for streaming analytics. Use Service Bus for order processing, workflow steps, and commands. Use Event Hub for telemetry ingestion and streaming pipelines.
            </div>
          </div>
          <CodeBlock lang="python">{`# azure-servicebus SDK - queues
from azure.servicebus import ServiceBusClient, ServiceBusMessage
from azure.identity import DefaultAzureCredential

NAMESPACE = "sbns-data-platform.servicebus.windows.net"
QUEUE_NAME = "sbq-pipeline-commands"

credential = DefaultAzureCredential()
servicebus_client = ServiceBusClient(NAMESPACE, credential)

# ---- SENDER ----
with servicebus_client:
    sender = servicebus_client.get_queue_sender(queue_name=QUEUE_NAME)
    with sender:
        # Send a single message
        msg = ServiceBusMessage(
            body='{"pipeline": "ingest_orders", "date": "2024-01-15", "env": "prod"}',
            subject="PipelineRun",
            content_type="application/json",
            session_id="pipeline-orders",  # session for ordered delivery
            time_to_live=timedelta(hours=24),  # message expires after 24h
            scheduled_enqueue_time_utc=datetime.now(timezone.utc) + timedelta(minutes=5)  # delayed send
        )
        sender.send_messages(msg)

        # Send a batch (efficient for many messages)
        msgs = [
            ServiceBusMessage(f'{{"order_id": {i}, "status": "new"}}')
            for i in range(100)
        ]
        sender.send_messages(msgs)  # batches automatically

# ---- RECEIVER (peek-lock mode - default) ----
with servicebus_client:
    receiver = servicebus_client.get_queue_receiver(
        queue_name=QUEUE_NAME,
        max_wait_time=5,
        receive_mode=ServiceBusReceiveMode.PEEK_LOCK  # locks message during processing
    )
    with receiver:
        for msg in receiver.receive_messages(max_message_count=10, max_wait_time=5):
            try:
                body = str(msg)
                print(f"Processing: {body}")
                # ... do work ...
                receiver.complete_message(msg)   # remove from queue (success)
            except Exception as e:
                print(f"Error: {e}")
                receiver.abandon_message(msg)    # return to queue for retry
                # After max_delivery_count retries -> auto dead-lettered

        # Explicitly dead-letter a message
        receiver.dead_letter_message(
            msg,
            reason="ParseError",
            error_description="Invalid JSON format in message body"
        )`}</CodeBlock>
          <CodeBlock lang="python">{`# Topic/Subscription pattern - pub/sub with filtering
from azure.servicebus import ServiceBusClient, ServiceBusMessage
from azure.identity import DefaultAzureCredential

TOPIC_NAME = "sbt-pipeline-events"

# Publisher - sends to topic (all subscriptions receive a copy)
with ServiceBusClient("sbns-data-platform.servicebus.windows.net", DefaultAzureCredential()) as client:
    sender = client.get_topic_sender(topic_name=TOPIC_NAME)
    with sender:
        msg = ServiceBusMessage(
            body='{"event": "pipeline_complete", "pipeline": "ingest_orders", "rows": 5000}',
            application_properties={
                "pipeline_type": "ingestion",
                "environment": "prod",
                "status": "success"
            }
        )
        sender.send_messages(msg)

# Subscriber 1 - only receives prod events (SQL filter on subscription)
# SQL filter set on subscription: environment = 'prod' AND status = 'success'
with ServiceBusClient("sbns-data-platform.servicebus.windows.net", DefaultAzureCredential()) as client:
    receiver = client.get_subscription_receiver(
        topic_name=TOPIC_NAME,
        subscription_name="sub-prod-success-alerts"
    )
    with receiver:
        msgs = receiver.receive_messages(max_message_count=10, max_wait_time=5)
        for msg in msgs:
            print(f"Prod success event: {str(msg)}")
            receiver.complete_message(msg)

# Subscriber 2 - receives all events (another independent subscription)
# Each subscription gets its own copy of every message that matches its filter`}</CodeBlock>
          <CodeBlock lang="bash">{`# Create Service Bus namespace and queue/topic

# Create namespace (Standard tier for topics/subscriptions)
az servicebus namespace create \\
  --name sbns-data-platform \\
  --resource-group rg-data-platform \\
  --location eastus2 \\
  --sku Standard

# Create queue with sessions enabled (for ordered per-entity processing)
az servicebus queue create \\
  --name sbq-pipeline-commands \\
  --namespace-name sbns-data-platform \\
  --resource-group rg-data-platform \\
  --enable-session true \\               # FIFO per session-id
  --max-delivery-count 5 \\             # after 5 failed deliveries -> DLQ
  --default-message-time-to-live P1D \\ # ISO 8601: 1 day TTL
  --lock-duration PT30S \\              # 30 second message lock for processing
  --enable-dead-lettering-on-message-expiration true

# Create topic (for pub/sub)
az servicebus topic create \\
  --name sbt-pipeline-events \\
  --namespace-name sbns-data-platform \\
  --resource-group rg-data-platform \\
  --max-size 5120  # MB

# Create subscription with SQL filter
az servicebus topic subscription create \\
  --name sub-prod-success-alerts \\
  --topic-name sbt-pipeline-events \\
  --namespace-name sbns-data-platform \\
  --resource-group rg-data-platform \\
  --max-delivery-count 3

az servicebus topic subscription rule create \\
  --name filter-prod-success \\
  --subscription-name sub-prod-success-alerts \\
  --topic-name sbt-pipeline-events \\
  --namespace-name sbns-data-platform \\
  --resource-group rg-data-platform \\
  --filter-sql-expression "environment = 'prod' AND status = 'success'"

# View dead letter queue messages
az servicebus queue show \\
  --name sbq-pipeline-commands \\
  --namespace-name sbns-data-platform \\
  --resource-group rg-data-platform \\
  --query "countDetails.deadLetterMessageCount"`}</CodeBlock>
          <CodeBlock lang="python">{`# Competing consumers pattern - multiple workers processing one queue
# Each message is processed by exactly ONE worker (unlike Event Hub topics)
import threading
from azure.servicebus import ServiceBusClient, ServiceBusReceiveMode
from azure.identity import DefaultAzureCredential

def worker(worker_id: int):
    """Each worker independently competes for messages on the same queue."""
    client = ServiceBusClient("sbns-data-platform.servicebus.windows.net", DefaultAzureCredential())
    with client:
        receiver = client.get_queue_receiver(
            queue_name="sbq-pipeline-commands",
            receive_mode=ServiceBusReceiveMode.PEEK_LOCK,
            max_wait_time=30
        )
        with receiver:
            # Continuously process messages
            while True:
                msgs = receiver.receive_messages(max_message_count=5, max_wait_time=10)
                if not msgs:
                    print(f"Worker {worker_id}: no messages, waiting...")
                    continue

                for msg in msgs:
                    try:
                        # Lock duration defaults to 30s - renew if processing takes longer
                        lock_renew_context = receiver.renew_message_lock(msg)
                        print(f"Worker {worker_id} processing: {str(msg)[:50]}")
                        # ... heavy processing ...
                        receiver.complete_message(msg)
                        print(f"Worker {worker_id}: completed message")
                    except Exception as e:
                        print(f"Worker {worker_id}: error - {e}")
                        receiver.abandon_message(msg)  # back to queue

# Start 5 competing consumers
threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()`}</CodeBlock>
          <Quiz topicId="az-servicebus" questions={[
            {
              question: "You have an order processing system where each customer's orders must be processed in sequence, but different customers can be processed in parallel. Which Service Bus feature enables this?",
              options: [
                "Partitioned queues",
                "Message sessions - group messages by session_id (customer_id) for FIFO per session",
                "Topic subscriptions with SQL filters",
                "Duplicate detection"
              ],
              correct: 1
            },
            {
              question: "A message fails processing 5 times (max_delivery_count = 5). What happens automatically?",
              options: [
                "The message is deleted permanently",
                "The message is retried indefinitely",
                "The message is moved to the Dead Letter Queue (DLQ)",
                "The message is returned to the sender"
              ],
              correct: 2
            },
            {
              question: "What is the key advantage of Service Bus topics over queues?",
              options: [
                "Topics support higher throughput than queues",
                "Topics allow multiple independent subscribers to each receive a copy of every message (pub/sub), while queues deliver each message to exactly one consumer",
                "Topics support message sessions while queues do not",
                "Topics have no size limits while queues are limited to 80GB"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-servicebus'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-functions ──────────────────────────────────────── */}
        <section id="az-functions" ref={el => { if (el) sectionRefs.current['az-functions'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Functions</h1>
            <p className="topic-desc">Azure Functions is a serverless compute service for event-driven code execution. Functions are triggered by events (HTTP requests, timers, blob creation, queue messages, Event Hub events) and can read/write to other services via input/output bindings - all declared in configuration, not code. For data engineering, Functions are ideal for lightweight ETL triggers, file processing, and API integrations.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#10052;</span>
            <div className="callout-body">
              <strong>Cold start on Consumption plan - use Premium for latency-sensitive workloads.</strong> Consumption plan scales to zero: the first invocation after inactivity incurs a cold start (typically 1-5 seconds for Python). For production data pipelines triggered by HTTP or Event Hub where latency matters, use the Premium plan - it keeps at least one instance warm (pre-warmed) and adds VNet integration and unlimited execution duration. Consumption plan caps execution at 10 minutes; Premium allows unlimited duration.
            </div>
          </div>
          <CodeBlock lang="python">{`# HTTP trigger with Blob Storage input and output bindings
# function_app.py (v2 programming model - recommended)
import azure.functions as func
import logging
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="processFile", methods=["POST"])
@app.blob_input(
    arg_name="inputBlob",
    path="raw-data/{fileName}",         # {fileName} comes from request body
    connection="AzureWebJobsStorage"
)
@app.blob_output(
    arg_name="outputBlob",
    path="processed-data/{fileName}",
    connection="AzureWebJobsStorage"
)
def process_file(
    req: func.HttpRequest,
    inputBlob: func.InputStream,
    outputBlob: func.Out[str]
) -> func.HttpResponse:
    logging.info("HTTP trigger - processFile called")

    file_name = req.params.get("fileName")
    if not file_name:
        try:
            body = req.get_json()
            file_name = body.get("fileName")
        except ValueError:
            return func.HttpResponse("fileName required", status_code=400)

    # Read input blob
    raw_content = inputBlob.read().decode("utf-8")
    raw_data = json.loads(raw_content)

    # Transform
    processed = [
        {k: v for k, v in record.items() if v is not None}
        for record in raw_data
        if record.get("status") == "active"
    ]

    # Write to output blob via binding
    outputBlob.set(json.dumps(processed, indent=2))

    return func.HttpResponse(
        f"Processed {len(processed)} records from {file_name}",
        status_code=200
    )`}</CodeBlock>
          <CodeBlock lang="python">{`# Event Hub trigger writing to Cosmos DB via output binding
import azure.functions as func
import logging
import json
from datetime import datetime, timezone

app = func.FunctionApp()

@app.event_hub_message_trigger(
    arg_name="events",
    event_hub_name="evh-user-events",
    connection="EventHubConnection",
    consumer_group="functions-consumer-group",
    cardinality="many"   # batch processing - more efficient
)
@app.cosmos_db_output(
    arg_name="outputDocs",
    database_name="EventsDB",
    container_name="ProcessedEvents",
    create_if_not_exists=True,
    connection="CosmosDBConnection"
)
def process_eventhub_events(
    events: list[func.EventHubEvent],
    outputDocs: func.Out[func.DocumentList]
) -> None:
    logging.info(f"Processing {len(events)} events from Event Hub")

    docs = []
    for event in events:
        try:
            body = event.get_body().decode("utf-8")
            data = json.loads(body)

            # Enrich with metadata
            doc = {
                "id": event.sequence_number,      # Cosmos DB requires 'id'
                "partitionKey": data.get("user_id"),
                "eventData": data,
                "processedAt": datetime.now(timezone.utc).isoformat(),
                "partition": event.partition_key,
                "sequenceNumber": event.sequence_number,
                "enqueuedTime": event.enqueued_time.isoformat() if event.enqueued_time else None
            }
            docs.append(doc)
        except Exception as e:
            logging.error(f"Failed to process event {event.sequence_number}: {e}")

    if docs:
        outputDocs.set(func.DocumentList(docs))
        logging.info(f"Wrote {len(docs)} documents to Cosmos DB")`}</CodeBlock>
          <CodeBlock lang="python">{`# Durable Functions - orchestrator + activity pattern
# Useful for long-running multi-step pipelines with checkpointing
import azure.functions as func
import azure.durable_functions as df
from typing import Generator

app = func.FunctionApp()
durable_app = df.DFApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Orchestrator function - drives the workflow
@durable_app.orchestration_trigger(context_name="context")
def pipeline_orchestrator(context: df.DurableOrchestrationContext) -> Generator:
    input_data = context.get_input()
    pipeline_date = input_data["date"]

    # Step 1: Extract (activity)
    extract_result = yield context.call_activity("extract_data", pipeline_date)
    if not extract_result["success"]:
        raise Exception(f"Extract failed: {extract_result['error']}")

    # Step 2: Transform (fan-out to parallel activities)
    tables = extract_result["tables"]
    transform_tasks = [
        context.call_activity("transform_table", {"table": t, "date": pipeline_date})
        for t in tables
    ]
    transform_results = yield context.task_all(transform_tasks)  # parallel!

    # Step 3: Load
    load_result = yield context.call_activity("load_to_gold", {
        "date": pipeline_date,
        "tables": tables,
        "row_counts": [r["rows"] for r in transform_results]
    })

    return {"status": "completed", "date": pipeline_date, "total_rows": sum(r["rows"] for r in transform_results)}

# Activity function - does actual work
@durable_app.activity_trigger(input_name="activity_input")
def extract_data(activity_input: dict) -> dict:
    date = activity_input  # or activity_input["date"] depending on input type
    logging.info(f"Extracting data for {date}")
    # ... actual extraction logic ...
    return {"success": True, "tables": ["orders", "customers", "products"], "rows_extracted": 50000}

@durable_app.activity_trigger(input_name="activity_input")
def transform_table(activity_input: dict) -> dict:
    table = activity_input["table"]
    date = activity_input["date"]
    logging.info(f"Transforming {table} for {date}")
    # ... transformation logic ...
    return {"table": table, "rows": 10000, "status": "success"}

# HTTP trigger to start orchestration
@durable_app.route(route="startPipeline")
@durable_app.durable_client_input(client_name="client")
async def start_pipeline(req: func.HttpRequest, client: df.DurableOrchestrationClient) -> func.HttpResponse:
    body = req.get_json()
    instance_id = await client.start_new("pipeline_orchestrator", client_input=body)
    logging.info(f"Started orchestration: {instance_id}")
    return client.create_check_status_response(req, instance_id)`}</CodeBlock>
          <CodeBlock lang="json">{`{
  "scriptFile": "__init__.py",
  "bindings": [
    {
      "name": "myTimer",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 0 2 * * *",
      "runOnStartup": false,
      "useMonitor": true
    },
    {
      "name": "inputBlob",
      "type": "blob",
      "direction": "in",
      "path": "config/pipeline-config.json",
      "connection": "AzureWebJobsStorage"
    },
    {
      "name": "outputQueue",
      "type": "queue",
      "direction": "out",
      "queueName": "pipeline-trigger-queue",
      "connection": "AzureWebJobsStorage"
    }
  ]
}`}</CodeBlock>
          <CodeBlock lang="bash">{`# Create Azure Functions - Consumption vs Premium plan

# Create storage account for Functions runtime
az storage account create \\
  --name stfuncdataplatform \\
  --resource-group rg-data-platform \\
  --location eastus2 \\
  --sku Standard_LRS

# Create Consumption plan function app (scales to zero, 10 min timeout)
az functionapp create \\
  --name func-data-platform-triggers \\
  --storage-account stfuncdataplatform \\
  --resource-group rg-data-platform \\
  --consumption-plan-location eastus2 \\
  --runtime python \\
  --runtime-version 3.11 \\
  --functions-version 4 \\
  --os-type linux

# Create Premium plan function app (always warm, VNet support, unlimited timeout)
az appservice plan create \\
  --name asp-functions-premium \\
  --resource-group rg-data-platform \\
  --location eastus2 \\
  --sku EP1 \\               # Elastic Premium 1: 1 vCPU, 3.5GB RAM
  --is-linux

az functionapp create \\
  --name func-data-platform-realtime \\
  --storage-account stfuncdataplatform \\
  --resource-group rg-data-platform \\
  --plan asp-functions-premium \\
  --runtime python \\
  --runtime-version 3.11 \\
  --functions-version 4 \\
  --os-type linux

# Configure app settings (environment variables)
az functionapp config appsettings set \\
  --name func-data-platform-realtime \\
  --resource-group rg-data-platform \\
  --settings \\
    "EventHubConnection=@Microsoft.KeyVault(SecretUri=https://kv-data.vault.azure.net/secrets/eh-conn-str/)" \\
    "CosmosDBConnection=@Microsoft.KeyVault(SecretUri=https://kv-data.vault.azure.net/secrets/cosmos-conn/)" \\
    "PYTHON_ENABLE_WORKER_EXTENSIONS=1"

# Enable VNet integration (Premium plan only)
az functionapp vnet-integration add \\
  --name func-data-platform-realtime \\
  --resource-group rg-data-platform \\
  --vnet vnet-data-platform \\
  --subnet snet-functions

# Deploy via zip
func azure functionapp publish func-data-platform-realtime --python`}</CodeBlock>
          <Quiz topicId="az-functions" questions={[
            {
              question: "Your Azure Function processes Event Hub messages and must complete within 15 minutes per batch. Which hosting plan supports this?",
              options: [
                "Consumption plan - it supports up to 60 minutes",
                "Consumption plan - it supports up to 10 minutes, which is sufficient",
                "Premium plan - it supports unlimited execution duration",
                "Both Consumption and Premium support unlimited duration"
              ],
              correct: 2
            },
            {
              question: "What is the advantage of using output bindings in Azure Functions instead of manually calling Azure SDK methods?",
              options: [
                "Output bindings are faster than SDK calls",
                "Output bindings enable declarative integration - the Functions runtime handles connection management, retry, and batching automatically",
                "Output bindings support more Azure services than the SDK",
                "Output bindings are required for Premium plan functions"
              ],
              correct: 1
            },
            {
              question: "In a Durable Functions orchestrator, what does 'yield context.task_all(tasks)' do?",
              options: [
                "Runs activities sequentially and waits for each to complete",
                "Runs all activity tasks in parallel and waits for ALL to complete before continuing",
                "Runs activities and returns the result of the first one to complete",
                "Schedules activities to run at a future time"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-functions'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-streamanalytics ── */}
        <section id="az-streamanalytics" ref={el => { if (el) sectionRefs.current['az-streamanalytics'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Stream Analytics</h1>
            <p className="topic-desc">Azure Stream Analytics (ASA) is a fully managed, serverless real-time analytics service. It uses a SQL-like query language with temporal windowing functions to process streaming data from Event Hubs, IoT Hub, or Blob Storage and route results to 20+ sinks.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128161;</span>
            <div className="callout-body">
              <strong>Four window types:</strong> <strong>Tumbling</strong>  -  fixed, non-overlapping intervals (e.g., 1-min buckets).
              <strong> Hopping</strong>  -  overlapping windows (e.g., 5-min window every 1 min).
              <strong> Sliding</strong>  -  emits when an event enters/leaves the window, always covering the last N seconds.
              <strong> Session</strong>  -  groups bursts of activity separated by idle gaps.
            </div>
          </div>
          <CodeBlock lang="sql">{`-- Azure Stream Analytics Query Language (SAQL)

-- 1. Tumbling window: count events per device every 1 minute
SELECT
    deviceId,
    System.Timestamp() AS window_end,
    COUNT(*) AS event_count,
    AVG(temperature) AS avg_temp,
    MAX(temperature) AS max_temp
INTO [adls-output]
FROM [eventhub-input] TIMESTAMP BY event_time
GROUP BY deviceId, TumblingWindow(minute, 1)

-- 2. Hopping window: 5-minute rolling average updated every 1 minute
SELECT
    deviceId,
    System.Timestamp() AS window_end,
    AVG(temperature) AS rolling_avg_5min
INTO [powerbi-output]
FROM [eventhub-input] TIMESTAMP BY event_time
GROUP BY deviceId, HoppingWindow(minute, 5, 1)

-- 3. Sliding window: alert when avg temp exceeds threshold
-- Fires whenever ANY event causes the average to cross 80 degrees
SELECT
    deviceId,
    System.Timestamp() AS alert_time,
    AVG(temperature) AS avg_temp
INTO [alert-output]
FROM [eventhub-input] TIMESTAMP BY event_time
GROUP BY deviceId, SlidingWindow(minute, 5)
HAVING AVG(temperature) > 80.0

-- 4. Session window: group user clickstream by session
-- Session ends after 30s of inactivity, max session 10 minutes
SELECT
    userId,
    System.Timestamp() AS session_end,
    COUNT(*) AS clicks_in_session
INTO [cosmos-output]
FROM [eventhub-input] TIMESTAMP BY event_time
GROUP BY userId, SessionWindow(second, 30, 600)

-- 5. Reference data join (static lookup table from Blob/ADLS)
SELECT
    e.deviceId,
    d.deviceName,
    d.location,
    e.temperature
INTO [enriched-output]
FROM [eventhub-input] e TIMESTAMP BY event_time
JOIN [device-reference] d ON e.deviceId = d.deviceId`}</CodeBlock>
          <CodeBlock lang="sql">{`-- Anomaly detection with built-in ML functions
SELECT
    deviceId,
    temperature,
    System.Timestamp() AS event_time,
    AnomalyDetection_SpikeAndDip(temperature, 95, 120, 'spikesanddips')
        OVER (PARTITION BY deviceId LIMIT DURATION(second, 120)) AS spike_score
INTO [anomaly-output]
FROM [eventhub-input] TIMESTAMP BY event_time`}</CodeBlock>
          <CodeBlock lang="bash">{`# Deploy Stream Analytics job via Azure CLI
az stream-analytics job create \
  --name "telemetry-processor" \
  --resource-group de-rg \
  --location eastus \
  --output-error-policy Drop \
  --events-outoforder-policy Adjust \
  --events-outoforder-max-delay 5 \
  --events-late-arrival-max-delay 16

# Add Event Hub input
az stream-analytics input create \
  --job-name "telemetry-processor" \
  --resource-group de-rg \
  --name "eventhub-input" \
  --type Stream \
  --datasource '{
    "type": "Microsoft.ServiceBus/EventHub",
    "properties": {
      "eventHubName": "telemetry",
      "serviceBusNamespace": "myns",
      "sharedAccessPolicyName": "RootManageSharedAccessKey",
      "consumerGroupName": "asa-consumer"
    }
  }' \
  --serialization '{"type":"Json","properties":{"encoding":"UTF8"}}'

# Scale streaming units (1 SU = 1 MB/s)
az stream-analytics job scale \
  --name "telemetry-processor" \
  --resource-group de-rg \
  --streaming-units 6

# Start job from last stopped time
az stream-analytics job start \
  --name "telemetry-processor" \
  --resource-group de-rg \
  --output-start-mode LastOutputEventTime`}</CodeBlock>
          <Quiz topicId="az-streamanalytics" questions={[
            {
              question: "Which Stream Analytics window type emits results at regular intervals even if no events arrived?",
              options: [
                "Sliding window",
                "Session window",
                "Tumbling window  -  it fires on every fixed interval regardless of event arrival",
                "Hopping window"
              ],
              correct: 2
            },
            {
              question: "What does 'TIMESTAMP BY event_time' do in a Stream Analytics query?",
              options: [
                "Filters events older than event_time",
                "Tells ASA to use the event's own timestamp field for window calculations instead of the arrival time",
                "Sets the output timestamp column name",
                "Enables late arrival handling"
              ],
              correct: 1
            },
            {
              question: "What is a Streaming Unit (SU) in Azure Stream Analytics?",
              options: [
                "A billing increment equal to 1 GB of processed data",
                "A unit of memory only, CPU scales automatically",
                "A bundle of CPU, memory, and I/O resources  -  1 SU handles roughly 1 MB/s throughput",
                "One partition of the Event Hub input"
              ],
              correct: 2
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-streamanalytics'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-keyvault ── */}
        <section id="az-keyvault" ref={el => { if (el) sectionRefs.current['az-keyvault'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Key Vault Deep Dive</h1>
            <p className="topic-desc">Azure Key Vault centralises secrets, encryption keys, and TLS certificates. It integrates natively with ADF linked services, Azure Functions app settings, Databricks secret scopes, and virtually every Azure service via managed identity.</p>
          </div>
          <div className="callout callout-danger">
            <span className="callout-icon">&#128680;</span>
            <div className="callout-body">
              <strong>Never hardcode secrets.</strong> Connection strings, storage keys, SP client secrets must live in Key Vault. Use RBAC (Key Vault Secrets User / Officer roles) rather than legacy Access Policies  -  RBAC is auditable, inheritable, and consistent with the rest of Azure IAM.
            </div>
          </div>
          <CodeBlock lang="python">{`# azure-keyvault-secrets SDK
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

# DefaultAzureCredential tries: managed identity -> env SP -> Azure CLI -> etc.
credential = DefaultAzureCredential()
client = SecretClient(
    vault_url="https://my-keyvault.vault.azure.net/",
    credential=credential
)

# CRUD operations on secrets
client.set_secret("db-password", "S3cr3tP@ss!")
secret = client.get_secret("db-password")
print(secret.value)   # S3cr3tP@ss!

# Secret properties (version, enabled, expiry)
props = client.get_secret_properties("db-password")
print(props.version, props.enabled, props.expires_on)

# List all secret names
for s in client.list_properties_of_secrets():
    print(s.name, s.created_on)

# Delete with soft-delete (recoverable for 90 days)
client.begin_delete_secret("db-password").wait()
# Recover:
client.begin_recover_deleted_secret("db-password").wait()
# Permanently purge (requires purge protection disabled):
client.purge_deleted_secret("db-password")`}</CodeBlock>
          <CodeBlock lang="python">{`# azure-keyvault-keys SDK  -  envelope encryption pattern
from azure.keyvault.keys import KeyClient
from azure.keyvault.keys.crypto import CryptographyClient, EncryptionAlgorithm

key_client = KeyClient(vault_url=VAULT_URL, credential=credential)

# Create RSA key backed by software (or HSM with key_type=KeyType.rsa_hsm)
key = key_client.create_rsa_key("data-encryption-key", size=2048)

# Encrypt/decrypt data with the key (stays in Key Vault for HSM keys)
crypto_client = CryptographyClient(key, credential=credential)

plaintext = b"sensitive PII data"
result = crypto_client.encrypt(EncryptionAlgorithm.rsa_oaep, plaintext)
ciphertext = result.ciphertext

decrypted = crypto_client.decrypt(EncryptionAlgorithm.rsa_oaep, ciphertext)
print(decrypted.plaintext)  # b"sensitive PII data"`}</CodeBlock>
          <CodeBlock lang="bash">{`# Key Vault CLI management
az keyvault create \
  --name my-keyvault \
  --resource-group de-rg \
  --location eastus \
  --enable-rbac-authorization true \
  --enable-soft-delete true \
  --soft-delete-retention-days 90 \
  --enable-purge-protection true

# Assign Key Vault Secrets User role to a managed identity
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee-object-id $(az identity show -n my-mi -g de-rg --query principalId -o tsv) \
  --assignee-principal-type ServicePrincipal \
  --scope $(az keyvault show -n my-keyvault -g de-rg --query id -o tsv)

# Store secrets
az keyvault secret set --vault-name my-keyvault --name "adls-key" --value "abc123"
az keyvault secret set --vault-name my-keyvault --name "sp-client-secret" --value "xyz789"

# Reference in ADF Linked Service (JSON fragment)
# "connectionString": {
#   "type": "AzureKeyVaultSecret",
#   "store": { "referenceName": "AzureKeyVaultLinkedService", "type": "LinkedServiceReference" },
#   "secretName": "sql-connection-string"
# }

# Key Vault reference in Azure Functions (app setting)
# @Microsoft.KeyVault(VaultName=my-keyvault;SecretName=db-password)
az functionapp config appsettings set \
  --name my-func \
  --resource-group de-rg \
  --settings "DB_PASSWORD=@Microsoft.KeyVault(VaultName=my-keyvault;SecretName=db-password)"`}</CodeBlock>
          <CodeBlock lang="python">{`# Databricks secret scope backed by Key Vault
# Create via Databricks CLI (one-time setup):
# databricks secrets create-scope \
#   --scope kv-scope \
#   --scope-backend-type AZURE_KEYVAULT \
#   --resource-id /subscriptions/.../vaults/my-keyvault \
#   --dns-name https://my-keyvault.vault.azure.net/

# Usage in notebooks - value is REDACTED in logs
storage_key = dbutils.secrets.get(scope="kv-scope", key="adls-key")
sp_secret   = dbutils.secrets.get(scope="kv-scope", key="sp-client-secret")

spark.conf.set(
    "fs.azure.account.key.mystorageaccount.dfs.core.windows.net",
    storage_key   # [REDACTED] in Spark logs
)`}</CodeBlock>
          <Quiz topicId="az-keyvault" questions={[
            {
              question: "What is the difference between Key Vault Access Policies and RBAC authorization modes?",
              options: [
                "Access Policies support more operations than RBAC",
                "RBAC uses Azure role assignments (inheritable, auditable, consistent with all Azure IAM) while Access Policies are a legacy Key Vault-specific permission model",
                "RBAC only works with keys, not secrets or certificates",
                "Access Policies are faster to evaluate than RBAC"
              ],
              correct: 1
            },
            {
              question: "What does enabling Purge Protection on a Key Vault do?",
              options: [
                "Prevents secrets from being read by non-owners",
                "Enables HSM-backed key storage",
                "Prevents permanently deleting soft-deleted secrets/keys/certificates during the retention period  -  even by admins",
                "Encrypts the Key Vault metadata at rest"
              ],
              correct: 2
            },
            {
              question: "What are the three object types stored in Azure Key Vault?",
              options: [
                "Passwords, tokens, and certificates",
                "Secrets (arbitrary strings), Keys (cryptographic keys for encrypt/decrypt/sign), and Certificates (X.509 TLS certs with lifecycle management)",
                "Secrets, configurations, and connection strings",
                "Keys, credentials, and private keys"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-keyvault'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-identity ── */}
        <section id="az-identity" ref={el => { if (el) sectionRefs.current['az-identity'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure AD / Entra ID and Identity</h1>
            <p className="topic-desc">Microsoft Entra ID (formerly Azure Active Directory) is the identity platform for Azure. For data engineering, the critical concepts are service principals, managed identities, workload identity federation, and OAuth 2.0 token flows used by SDKs and pipelines.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128161;</span>
            <div className="callout-body">
              <strong>Managed Identity vs Service Principal:</strong> A service principal is a manual app registration with a client secret or certificate you must rotate. A managed identity is Azure-managed  -  no credentials to store or rotate. Always prefer managed identity when the service supports it (ADF, Functions, Databricks cluster, etc.).
            </div>
          </div>
          <CodeBlock lang="bash">{`# Service Principal creation and role assignment
az ad sp create-for-rbac \
  --name "de-pipeline-sp" \
  --role "Storage Blob Data Contributor" \
  --scopes "/subscriptions/SUB_ID/resourceGroups/de-rg/providers/Microsoft.Storage/storageAccounts/mystorageaccount"
# Returns: appId, password (client secret), tenant

# Create SP with certificate (more secure than client secret)
az ad sp create-for-rbac \
  --name "de-pipeline-sp-cert" \
  --create-cert \
  --cert-output-path ./sp-cert.pem

# User-assigned Managed Identity
az identity create \
  --name adf-managed-identity \
  --resource-group de-rg

# Assign it to ADF
az datafactory update \
  --factory-name my-adf \
  --resource-group de-rg \
  --identity-type UserAssigned \
  --user-assigned-identities '{ "/subscriptions/SUB/resourceGroups/de-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/adf-managed-identity": {} }'

# Grant the MI access to ADLS
az role assignment create \
  --role "Storage Blob Data Contributor" \
  --assignee "$(az identity show -n adf-managed-identity -g de-rg --query principalId -o tsv)" \
  --scope "/subscriptions/SUB/resourceGroups/de-rg/providers/Microsoft.Storage/storageAccounts/mystorageaccount"`}</CodeBlock>
          <CodeBlock lang="python">{`# Python: OAuth 2.0 client credentials flow (service principal)
from azure.identity import ClientSecretCredential, ManagedIdentityCredential
from azure.storage.filedatalake import DataLakeServiceClient

# Service Principal (client credentials)
sp_credential = ClientSecretCredential(
    tenant_id="YOUR_TENANT_ID",
    client_id="YOUR_APP_ID",
    client_secret="YOUR_CLIENT_SECRET"
)

# System-assigned managed identity (no credentials needed)
mi_credential = ManagedIdentityCredential()

# User-assigned managed identity (specify client_id)
umi_credential = ManagedIdentityCredential(client_id="MI_CLIENT_ID")

# DefaultAzureCredential: tries chain in order
# 1. Environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
# 2. Workload Identity Federation
# 3. Managed Identity
# 4. Azure CLI credentials (az login)
# 5. Azure PowerShell
from azure.identity import DefaultAzureCredential
credential = DefaultAzureCredential()

# Use with any Azure SDK
adls_client = DataLakeServiceClient(
    account_url="https://mystorageaccount.dfs.core.windows.net",
    credential=credential
)

# Get raw token (for REST API calls)
token = credential.get_token("https://storage.azure.com/.default")
print(token.token[:20], "...", "expires:", token.expires_on)`}</CodeBlock>
          <CodeBlock lang="python">{`# Workload Identity Federation: GitHub Actions -> Azure (no secrets!)
# In Azure: create app registration, add federated credential for GitHub repo
# az ad app federated-credential create --id APP_ID --parameters '{
#   "name": "github-actions",
#   "issuer": "https://token.actions.githubusercontent.com",
#   "subject": "repo:myorg/myrepo:ref:refs/heads/main",
#   "audiences": ["api://AzureADTokenExchange"]
# }'

# In GitHub Actions workflow:
# permissions:
#   id-token: write
#   contents: read
# steps:
#   - uses: azure/login@v2
#     with:
#       client-id: \${{ secrets.AZURE_CLIENT_ID }}
#       tenant-id: \${{ secrets.AZURE_TENANT_ID }}
#       subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
#       # No client-secret needed! Uses OIDC token exchange

# App Registration vs Service Principal
# App Registration = global identity definition (in home tenant)
# Service Principal = local instance of the app in a specific tenant
# One App Registration can have SPs in multiple tenants (multi-tenant apps)
import subprocess
result = subprocess.run(
    ["az", "ad", "app", "show", "--id", "APP_ID", "--query", "displayName"],
    capture_output=True, text=True
)
print(result.stdout.strip())`}</CodeBlock>
          <Quiz topicId="az-identity" questions={[
            {
              question: "What is the key operational advantage of Managed Identity over a Service Principal with client secret?",
              options: [
                "Managed Identity has higher permissions by default",
                "Managed Identity credentials are Azure-managed  -  no secret rotation, no credential storage, no secret expiry risk",
                "Managed Identity works across all clouds, not just Azure",
                "Managed Identity is faster because it skips OAuth token exchange"
              ],
              correct: 1
            },
            {
              question: "What is Workload Identity Federation?",
              options: [
                "A way to federate multiple Azure AD tenants into one",
                "A mechanism to trust external OIDC tokens (e.g., GitHub Actions, Kubernetes) so workloads can authenticate to Azure without storing any Azure credentials",
                "A Databricks Unity Catalog feature for cross-workspace identity",
                "The process of assigning multiple managed identities to a single resource"
              ],
              correct: 1
            },
            {
              question: "What is the difference between a system-assigned and user-assigned managed identity?",
              options: [
                "System-assigned supports more Azure services than user-assigned",
                "System-assigned is tied to one resource's lifecycle (deleted with it); user-assigned is independent, can be shared across multiple resources",
                "User-assigned requires a client secret while system-assigned does not",
                "System-assigned identities have higher permission limits"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-identity'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-networking ── */}
        <section id="az-networking" ref={el => { if (el) sectionRefs.current['az-networking'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">VNet Deep Dive</h1>
            <p className="topic-desc">Azure networking for data engineers focuses on isolating data platform resources inside a VNet, locking down storage accounts and databases behind private endpoints, and controlling traffic with NSGs and route tables.</p>
          </div>
          <AzureNetworkAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">&#128161;</span>
            <div className="callout-body">
              <strong>Private Endpoint vs Service Endpoint:</strong> A Service Endpoint routes traffic to Azure PaaS over the Azure backbone but the service still has a public IP. A Private Endpoint injects the service directly into your VNet with a private IP  -  traffic never touches the public internet and you can disable public access entirely.
            </div>
          </div>
          <CodeBlock lang="bash">{`# Build a secure data platform VNet
az network vnet create \
  --name de-vnet \
  --resource-group de-rg \
  --address-prefix 10.0.0.0/16

# Subnets
az network vnet subnet create --vnet-name de-vnet -g de-rg \
  --name databricks-public --address-prefix 10.0.1.0/24 \
  --delegations Microsoft.Databricks/workspaces

az network vnet subnet create --vnet-name de-vnet -g de-rg \
  --name databricks-private --address-prefix 10.0.2.0/24 \
  --delegations Microsoft.Databricks/workspaces

az network vnet subnet create --vnet-name de-vnet -g de-rg \
  --name data-services --address-prefix 10.0.3.0/24 \
  --disable-private-endpoint-network-policies true

# NSG for data-services subnet
az network nsg create --name data-services-nsg -g de-rg
az network nsg rule create \
  --nsg-name data-services-nsg -g de-rg \
  --name AllowInternalOnly \
  --priority 100 \
  --source-address-prefixes 10.0.0.0/16 \
  --destination-port-ranges '*' \
  --access Allow --direction Inbound
az network nsg rule create \
  --nsg-name data-services-nsg -g de-rg \
  --name DenyPublicInternet \
  --priority 200 \
  --source-address-prefixes Internet \
  --destination-port-ranges '*' \
  --access Deny --direction Inbound

az network vnet subnet update \
  --vnet-name de-vnet -g de-rg \
  --name data-services \
  --network-security-group data-services-nsg`}</CodeBlock>
          <CodeBlock lang="bash">{`# Private Endpoints for ADLS Gen2 and Key Vault
# Private endpoint for ADLS dfs (Data Lake endpoint)
az network private-endpoint create \
  --name adls-pe \
  --resource-group de-rg \
  --vnet-name de-vnet \
  --subnet data-services \
  --private-connection-resource-id \
    "$(az storage account show -n mystorageaccount -g de-rg --query id -o tsv)" \
  --group-id dfs \
  --connection-name adls-pe-conn

# Private DNS zone for ADLS (maps *.dfs.core.windows.net -> private IP)
az network private-dns zone create -g de-rg \
  -n "privatelink.dfs.core.windows.net"
az network private-dns link vnet create -g de-rg \
  --zone-name "privatelink.dfs.core.windows.net" \
  --name de-vnet-link \
  --virtual-network de-vnet \
  --registration-enabled false

# Auto-register DNS A record from private endpoint
az network private-endpoint dns-zone-group create \
  --endpoint-name adls-pe -g de-rg \
  --name adls-dns-group \
  --private-dns-zone "privatelink.dfs.core.windows.net" \
  --zone-name adls

# Now disable public access - ALL traffic must use private endpoint
az storage account update \
  --name mystorageaccount -g de-rg \
  --public-network-access Disabled`}</CodeBlock>
          <CodeBlock lang="bash">{`# VNet Peering (connect two VNets, e.g., hub-spoke model)
az network vnet peering create \
  --name de-vnet-to-hub \
  --resource-group de-rg \
  --vnet-name de-vnet \
  --remote-vnet /subscriptions/SUB/resourceGroups/hub-rg/providers/Microsoft.Network/virtualNetworks/hub-vnet \
  --allow-vnet-access \
  --allow-forwarded-traffic

# ExpressRoute: dedicated private circuit from on-prem to Azure
# VPN Gateway: IPsec tunnel over internet to Azure
# Key difference: ExpressRoute = private, consistent bandwidth, SLA
#                VPN Gateway   = internet, variable latency, cheaper`}</CodeBlock>
          <Quiz topicId="az-networking" questions={[
            {
              question: "What is the functional difference between a Private Endpoint and a Service Endpoint for Azure Storage?",
              options: [
                "Service Endpoints are newer and more secure than Private Endpoints",
                "Private Endpoint gives Azure Storage a private IP inside your VNet (traffic stays off public internet, public access can be disabled). Service Endpoint routes traffic over Azure backbone but storage still has a public IP.",
                "Private Endpoints only work with Blob Storage, not ADLS Gen2",
                "Service Endpoints are required before creating Private Endpoints"
              ],
              correct: 1
            },
            {
              question: "Why is a Private DNS zone required when using Private Endpoints?",
              options: [
                "For load balancing across multiple private endpoints",
                "To resolve the service's public hostname (e.g., mystorageaccount.dfs.core.windows.net) to the private IP address instead of the public one",
                "To enable name resolution across VNet peers",
                "Private DNS zones are optional  -  Private Endpoints work without them"
              ],
              correct: 1
            },
            {
              question: "What does NSG (Network Security Group) operate at?",
              options: [
                "At the VNet level, filtering all traffic entering the VNet",
                "At the subnet or NIC level, filtering inbound/outbound traffic with priority-ordered allow/deny rules",
                "At the application layer (Layer 7) like a WAF",
                "Only at the resource level, not subnet level"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-networking'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-monitor ── */}
        <section id="az-monitor" ref={el => { if (el) sectionRefs.current['az-monitor'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Monitor Deep Dive</h1>
            <p className="topic-desc">Azure Monitor is the unified observability platform for Azure. It collects metrics (numerical time-series), logs (structured/unstructured text), and traces. Log Analytics workspace stores logs queryable with KQL. Application Insights adds APM for applications.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128161;</span>
            <div className="callout-body">
              <strong>KQL in 30 seconds:</strong> Data flows left-to-right through pipe operators. Start with a table, filter with <code>where</code>, shape with <code>project</code>/<code>extend</code>, aggregate with <code>summarize</code>, sort with <code>order by</code>, visualise with <code>render</code>. Every operator returns a table that feeds the next.
            </div>
          </div>
          <CodeBlock lang="kusto">{`// KQL fundamentals - Log Analytics workspace

// 1. Basic structure: table | operator | operator | ...
AzureDiagnostics
| where TimeGenerated > ago(24h)
| where ResourceType == "DATAFACTORIES"
| where Category == "PipelineRuns"
| where status_s == "Failed"
| project TimeGenerated, pipelineName_s, message_s, duration_d
| order by TimeGenerated desc
| take 20

// 2. Summarize (aggregate) - count failures per pipeline per hour
AzureDiagnostics
| where TimeGenerated > ago(7d)
| where ResourceType == "DATAFACTORIES" and status_s == "Failed"
| summarize failure_count = count() by
    pipelineName_s,
    bin(TimeGenerated, 1h)
| render timechart

// 3. Join two tables
let pipeline_runs = AzureDiagnostics
    | where ResourceType == "DATAFACTORIES"
    | project run_id = runId_g, pipeline = pipelineName_s, status = status_s;
let activity_runs = AzureDiagnostics
    | where ResourceType == "DATAFACTORIES/ACTIVITYRUNS"
    | project run_id = pipelineRunId_g, activity = activityName_s, duration = duration_d;
pipeline_runs
| join kind=inner activity_runs on run_id
| where status == "Failed"
| project pipeline, activity, duration

// 4. Percentile query (p50, p95, p99 latency)
requests
| where timestamp > ago(1h)
| summarize
    p50 = percentile(duration, 50),
    p95 = percentile(duration, 95),
    p99 = percentile(duration, 99)
    by bin(timestamp, 5m)
| render timechart`}</CodeBlock>
          <CodeBlock lang="kusto">{`// Alert query: error rate > 5% in last 5 minutes
let error_threshold = 0.05;
requests
| where timestamp > ago(5m)
| summarize
    total = count(),
    errors = countif(success == false)
    by bin(timestamp, 5m)
| extend error_rate = todouble(errors) / total
| where error_rate > error_threshold

// Databricks job monitoring via Log Analytics
// (Requires Azure Diagnostics settings on the workspace)
AzureDiagnostics
| where ResourceType == "DATABRICKS/CLUSTERS"
| where Category == "clusters"
| extend parsed = parse_json(properties_s)
| project TimeGenerated,
    cluster_id = parsed.cluster_id,
    state = parsed.state,
    driver_node = parsed.driver_node_type_id
| where state == "TERMINATED"

// Storage account metrics (via Metrics table, not Logs)
AzureMetrics
| where ResourceProvider == "MICROSOFT.STORAGE"
| where MetricName == "Transactions"
| summarize total_transactions = sum(Total) by bin(TimeGenerated, 1h), Resource
| render timechart`}</CodeBlock>
          <CodeBlock lang="bash">{`# Set up diagnostic settings to send logs to Log Analytics
az monitor diagnostic-settings create \
  --name adf-diag \
  --resource "$(az datafactory show -n my-adf -g de-rg --query id -o tsv)" \
  --workspace "$(az monitor log-analytics workspace show -n my-workspace -g de-rg --query id -o tsv)" \
  --logs '[
    {"category":"PipelineRuns","enabled":true,"retentionPolicy":{"days":30,"enabled":true}},
    {"category":"ActivityRuns","enabled":true,"retentionPolicy":{"days":30,"enabled":true}},
    {"category":"TriggerRuns","enabled":true,"retentionPolicy":{"days":30,"enabled":true}}
  ]'

# Create a metric alert (CPU > 80%)
az monitor metrics alert create \
  --name "high-cpu-alert" \
  --resource-group de-rg \
  --scopes "/subscriptions/SUB/resourceGroups/de-rg/providers/Microsoft.Compute/virtualMachines/my-vm" \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action "/subscriptions/SUB/resourceGroups/de-rg/providers/Microsoft.Insights/actionGroups/oncall-team"

# Create action group (email + webhook)
az monitor action-group create \
  --name oncall-team \
  --resource-group de-rg \
  --short-name oncall \
  --email-receiver name=lead email=lead@company.com \
  --webhook-receiver name=pagerduty \
    service-uri=https://events.pagerduty.com/integration/KEY/enqueue`}</CodeBlock>
          <Quiz topicId="az-monitor" questions={[
            {
              question: "In KQL, what does the 'summarize' operator do?",
              options: [
                "Filters rows matching a condition",
                "Sorts the result table by a column",
                "Aggregates rows using functions like count(), sum(), avg(), percentile()  -  similar to SQL GROUP BY",
                "Projects (selects) specific columns"
              ],
              correct: 2
            },
            {
              question: "What is the difference between Azure Monitor Metrics and Azure Monitor Logs?",
              options: [
                "Metrics are for applications, Logs are for infrastructure",
                "Metrics are numerical time-series (fast, cheap, 93-day retention by default) ideal for alerting. Logs are structured/unstructured text stored in Log Analytics, queryable with KQL, supporting complex analysis.",
                "Metrics require Application Insights, Logs require Log Analytics",
                "There is no difference  -  they are two names for the same service"
              ],
              correct: 1
            },
            {
              question: "What does 'bin(TimeGenerated, 1h)' do in a KQL summarize?",
              options: [
                "Filters events to the last 1 hour",
                "Rounds timestamps down to the nearest hour boundary, enabling time-bucketed aggregations",
                "Creates a 1-hour sliding window",
                "Limits the query to 1 hour of execution time"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-monitor'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-cosmos ── */}
        <section id="az-cosmos" ref={el => { if (el) sectionRefs.current['az-cosmos'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Cosmos DB Deep Dive</h1>
            <p className="topic-desc">Azure Cosmos DB is a globally distributed, multi-model NoSQL database with guaranteed single-digit millisecond latency at any scale. The partition key is the single most important design decision  -  it determines data distribution, query efficiency, and throughput consumption.</p>
          </div>
          <div className="callout callout-danger">
            <span className="callout-icon">&#9888;</span>
            <div className="callout-body">
              <strong>Partition key anti-patterns:</strong> Never use a field with low cardinality (e.g., status = active/inactive) or a monotonically increasing value (e.g., timestamp, auto-increment ID). Low cardinality creates hot partitions. High cardinality with skewed distribution also causes hot partitions. Aim for high cardinality + even distribution.
            </div>
          </div>
          <CodeBlock lang="python">{`# azure-cosmos SDK v4
from azure.cosmos import CosmosClient, PartitionKey, exceptions

client = CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY)
db = client.create_database_if_not_exists("ecommerce")

# Create container with partition key and TTL
container = db.create_container_if_not_exists(
    id="orders",
    partition_key=PartitionKey(path="/customerId"),
    offer_throughput=400,               # 400 RU/s manual
    default_time_to_live=86400 * 90     # auto-delete after 90 days
)

# Upsert document
container.upsert_item({
    "id": "order-12345",
    "customerId": "customer-456",       # partition key value
    "orderDate": "2024-01-15T10:30:00Z",
    "items": [{"sku": "ABC", "qty": 2, "price": 29.99}],
    "total": 59.98,
    "status": "shipped"
})

# Point read (O(1), uses partition key  -  cheapest possible read)
item = container.read_item(
    item="order-12345",
    partition_key="customer-456"        # 1 RU
)

# Query within partition (efficient, cross-partition avoided)
query = """
    SELECT * FROM c
    WHERE c.customerId = @cid
    AND c.orderDate > @since
    ORDER BY c.orderDate DESC
"""
results = list(container.query_items(
    query=query,
    parameters=[
        {"name": "@cid", "value": "customer-456"},
        {"name": "@since", "value": "2024-01-01"}
    ],
    partition_key="customer-456"        # stays within one partition
))

# Cross-partition query (more expensive, avoid in hot path)
all_shipped = list(container.query_items(
    query="SELECT * FROM c WHERE c.status = 'shipped'",
    enable_cross_partition_query=True   # scans all partitions
))`}</CodeBlock>
          <CodeBlock lang="python">{`# Change Feed: react to inserts/updates in real time
from azure.cosmos.aio import CosmosClient as AsyncCosmosClient

async def process_change_feed():
    async with AsyncCosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY) as client:
        container = client.get_database_client("ecommerce").get_container_client("orders")
        # Read change feed from beginning
        async for items in container.query_items_change_feed(is_start_from_beginning=True):
            for item in items:
                print(f"Changed: {item['id']} status={item.get('status')}")
                # Forward to downstream processing

# Consistency levels (tradeoff: consistency vs latency/availability)
# Strong             -  always reads latest committed write; highest latency
# Bounded Staleness  -  reads lag behind writes by at most K versions or T seconds
# Session            -  consistent within a session; DEFAULT; great for user-facing apps
# Consistent Prefix  -  no out-of-order reads; eventual with ordering guarantees
# Eventual           -  lowest latency; reads may be stale

# Custom indexing policy (exclude paths to save RU)
indexing_policy = {
    "indexingMode": "consistent",
    "automatic": True,
    "includedPaths": [{"path": "/customerId/?"}, {"path": "/status/?"}],
    "excludedPaths": [{"path": "/items/*"}, {"path": "/_etag/?"}]
}`}</CodeBlock>
          <CodeBlock lang="bash">{`# Cosmos DB CLI
az cosmosdb create \
  --name my-cosmos \
  --resource-group de-rg \
  --kind GlobalDocumentDB \
  --default-consistency-level Session \
  --enable-automatic-failover true \
  --locations regionName=eastus failoverPriority=0 isZoneRedundant=true \
  --locations regionName=westus failoverPriority=1 isZoneRedundant=false

# Enable multi-region writes
az cosmosdb update --name my-cosmos -g de-rg --enable-multiple-write-locations true

# Create database + container with autoscale (scales 100-1000 RU automatically)
az cosmosdb sql database create --account-name my-cosmos -g de-rg --name ecommerce
az cosmosdb sql container create \
  --account-name my-cosmos -g de-rg \
  --database-name ecommerce \
  --name orders \
  --partition-key-path "/customerId" \
  --max-throughput 1000   # autoscale max RU (min is max/10 = 100 RU)

# Estimate RU cost of a query
az cosmosdb sql container query-throughput \
  --account-name my-cosmos -g de-rg \
  --database-name ecommerce \
  --container-name orders \
  --query-text "SELECT * FROM c WHERE c.customerId='c-1' AND c.total > 50"`}</CodeBlock>
          <Quiz topicId="az-cosmos" questions={[
            {
              question: "Why should you avoid using a timestamp as the Cosmos DB partition key?",
              options: [
                "Timestamps are not supported as partition keys",
                "Timestamps create monotonically increasing values  -  all new writes go to the same (newest) partition, creating a hot partition with throughput throttling",
                "Timestamps consume more RUs than string partition keys",
                "Cosmos DB sorts documents by partition key, making timestamp-based queries slow"
              ],
              correct: 1
            },
            {
              question: "What consistency level provides read-your-own-writes guarantees within a single client session while allowing eventual consistency across sessions?",
              options: [
                "Bounded Staleness",
                "Consistent Prefix",
                "Session consistency  -  the default and most commonly used level for user-facing applications",
                "Strong consistency"
              ],
              correct: 2
            },
            {
              question: "What is the Cosmos DB Change Feed?",
              options: [
                "A backup mechanism that captures deletes and updates",
                "An ordered, persistent log of inserts and updates per partition that enables real-time event-driven processing, CDC pipelines, and materialized views",
                "A Kafka-compatible streaming interface for Cosmos DB",
                "The audit log for RBAC changes to the Cosmos DB account"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-cosmos'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-sql ── */}
        <section id="az-sql" ref={el => { if (el) sectionRefs.current['az-sql'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure SQL Database</h1>
            <p className="topic-desc">Azure SQL Database is a fully managed PaaS relational database built on SQL Server. Key choices: DTU vs vCore purchasing model, single database vs elastic pool vs Managed Instance, and geo-replication strategy.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128161;</span>
            <div className="callout-body">
              <strong>DTU vs vCore:</strong> DTU (Database Transaction Unit) bundles CPU+memory+IO into one number  -  simple but opaque. vCore gives you explicit control over CPU cores and RAM and is required for Hyperscale tier, Managed Instance, and reserved capacity pricing. New workloads should use vCore.
            </div>
          </div>
          <CodeBlock lang="bash">{`# Create Azure SQL Server and Database
az sql server create \
  --name my-sql-server \
  --resource-group de-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password "$(az keyvault secret show --vault-name my-kv --name sql-admin-pass --query value -o tsv)"

# Disable SQL auth, use Azure AD only (best practice)
az sql server ad-only-auth enable --resource-group de-rg --name my-sql-server

# General Purpose, 4 vCores (vCore model)
az sql db create \
  --resource-group de-rg \
  --server my-sql-server \
  --name production-db \
  --service-objective GP_Gen5_4 \
  --backup-storage-redundancy Geo \
  --zone-redundant true

# Elastic pool for multi-tenant SaaS
az sql elastic-pool create \
  --resource-group de-rg \
  --server my-sql-server \
  --name tenant-pool \
  --edition GeneralPurpose \
  --capacity 8 \
  --db-dtu-min 0 \
  --db-dtu-max 4

# Active geo-replication to secondary region
az sql db replica create \
  --resource-group de-rg \
  --server my-sql-server \
  --name production-db \
  --partner-server my-sql-server-secondary \
  --partner-resource-group de-rg-secondary`}</CodeBlock>
          <CodeBlock lang="sql">{`-- Row-Level Security: users only see their tenant's data
CREATE SCHEMA security;
GO

CREATE FUNCTION security.fn_tenant_filter(@tenantId NVARCHAR(50))
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS result
WHERE @tenantId = CAST(SESSION_CONTEXT(N'TenantId') AS NVARCHAR(50));
GO

CREATE SECURITY POLICY TenantFilter
ADD FILTER PREDICATE security.fn_tenant_filter(tenant_id)
ON dbo.Orders
WITH (STATE = ON);
GO

-- Set tenant context at connection time (in application code):
EXEC sp_set_session_context @key = N'TenantId', @value = N'tenant-123';
SELECT * FROM dbo.Orders;  -- only returns tenant-123 rows

-- Always Encrypted: client-side encryption for sensitive columns
-- Column master key stored in Key Vault, column encryption key wraps data
-- Database engine NEVER sees plaintext
ALTER TABLE Patients
ALTER COLUMN SSN NVARCHAR(11) ENCRYPTED WITH (
    COLUMN_ENCRYPTION_KEY = PatientCEK,
    ENCRYPTION_TYPE = Deterministic,   -- allows equality search
    ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256'
);

-- Temporal tables: track history of all row changes
CREATE TABLE Products (
    ProductId INT PRIMARY KEY,
    Price DECIMAL(10,2),
    Name NVARCHAR(100),
    ValidFrom DATETIME2 GENERATED ALWAYS AS ROW START,
    ValidTo   DATETIME2 GENERATED ALWAYS AS ROW END,
    PERIOD FOR SYSTEM_TIME (ValidFrom, ValidTo)
) WITH (SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.ProductsHistory));

-- Query as of a point in time
SELECT * FROM Products
FOR SYSTEM_TIME AS OF '2024-01-01T00:00:00';`}</CodeBlock>
          <CodeBlock lang="python">{`# pyodbc / sqlalchemy connection with Azure AD managed identity
import pyodbc, struct
from azure.identity import ManagedIdentityCredential

credential = ManagedIdentityCredential()
token = credential.get_token("https://database.windows.net/.default")

# Convert token to bytes for pyodbc
token_bytes = token.token.encode("UTF-16-LE")
token_struct = struct.pack(f"<I{len(token_bytes)}s", len(token_bytes), token_bytes)

conn_string = (
    "Driver={ODBC Driver 18 for SQL Server};"
    "Server=my-sql-server.database.windows.net;"
    "Database=production-db;"
    "Encrypt=yes;TrustServerCertificate=no;"
)
conn = pyodbc.connect(conn_string, attrs_before={1256: token_struct})
cursor = conn.cursor()
cursor.execute("SELECT TOP 10 * FROM dbo.Orders ORDER BY OrderDate DESC")
rows = cursor.fetchall()`}</CodeBlock>
          <Quiz topicId="az-sql" questions={[
            {
              question: "What is the primary advantage of Azure SQL vCore model over DTU model?",
              options: [
                "vCore is cheaper than DTU at all scales",
                "vCore gives explicit CPU/memory control, supports reserved capacity pricing, enables Hyperscale tier, and supports Managed Instance  -  DTU bundles resources opaquely",
                "vCore supports geo-replication while DTU does not",
                "vCore has lower latency due to dedicated hardware"
              ],
              correct: 1
            },
            {
              question: "What does Azure SQL Always Encrypted provide that Transparent Data Encryption (TDE) does not?",
              options: [
                "Always Encrypted protects data at rest and in transit; TDE only protects at rest",
                "Always Encrypted uses client-side encryption so the database engine never sees plaintext  -  protects against rogue DBAs and cloud provider access. TDE encrypts storage files but the engine processes plaintext data.",
                "Always Encrypted is faster than TDE for read-heavy workloads",
                "Always Encrypted requires no key management while TDE needs manual key rotation"
              ],
              correct: 1
            },
            {
              question: "What is a Temporal Table in Azure SQL?",
              options: [
                "A table with a TTL that automatically deletes old rows",
                "A table with system-versioning that automatically records the full change history of every row, enabling point-in-time queries with FOR SYSTEM_TIME AS OF",
                "A partitioned table optimized for time-series data",
                "A read-only snapshot table refreshed on a schedule"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-sql'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-devops ── */}
        <section id="az-devops" ref={el => { if (el) sectionRefs.current['az-devops'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure DevOps and GitHub Actions</h1>
            <p className="topic-desc">CI/CD for data engineering pipelines: automatically test, build, and deploy ADF pipelines, Databricks notebooks, Terraform infrastructure, and dbt models when code is merged. Azure DevOps and GitHub Actions are the two dominant platforms.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128161;</span>
            <div className="callout-body">
              <strong>ADF source control:</strong> Connect ADF to a Git repo (Azure Repos or GitHub). ADF JSON definitions are stored in git. Changes are made in a feature branch, published to ADF via a PR merge. The ARM template is exported from the adf_publish branch for deployment to other environments.
            </div>
          </div>
          <CodeBlock lang="yaml">{`# GitHub Actions: Deploy ADF pipelines on merge to main
name: Deploy ADF

on:
  push:
    branches: [main]
    paths: ['adf/**']

permissions:
  id-token: write    # Required for OIDC workload identity federation
  contents: read

jobs:
  deploy-adf:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC - no secrets)
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Validate ADF ARM template
        run: |
          az deployment group validate \
            --resource-group de-rg-prod \
            --template-file adf/ARMTemplateForFactory.json \
            --parameters adf/ARMTemplateParametersForFactory.json

      - name: Deploy ADF ARM template
        run: |
          az deployment group create \
            --resource-group de-rg-prod \
            --template-file adf/ARMTemplateForFactory.json \
            --parameters adf/ARMTemplateParametersForFactory.json \
            --parameters factoryName=my-adf-prod`}</CodeBlock>
          <CodeBlock lang="yaml">{`# GitHub Actions: Terraform plan + apply with approval gate
name: Terraform

on:
  pull_request:
    branches: [main]
    paths: ['terraform/**']
  push:
    branches: [main]
    paths: ['terraform/**']

jobs:
  terraform-plan:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: terraform/

    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.7.0

      - uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - run: terraform init \
          -backend-config="storage_account_name=tfstate\${{ vars.ENV }}" \
          -backend-config="container_name=tfstate" \
          -backend-config="key=de-platform.tfstate"

      - run: terraform validate
      - id: plan
        run: terraform plan -out=tfplan -no-color
        continue-on-error: true

      - name: Comment plan on PR
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: \`## Terraform Plan\n\`\`\`\n\${{ steps.plan.outputs.stdout }}\n\`\`\`\`
            })

  terraform-apply:
    needs: terraform-plan
    runs-on: ubuntu-latest
    environment: production   # requires manual approval in GitHub Environments
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    defaults:
      run:
        working-directory: terraform/
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - run: terraform init && terraform apply -auto-approve tfplan`}</CodeBlock>
          <CodeBlock lang="yaml">{`# Reusable workflow: run dbt tests (called from other workflows)
# .github/workflows/dbt-test.yml
name: dbt Test (Reusable)

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      DATABRICKS_HOST: { required: true }
      DATABRICKS_TOKEN: { required: true }

jobs:
  dbt-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }

      - run: pip install dbt-databricks

      - name: dbt deps + test
        env:
          DATABRICKS_HOST: \${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: \${{ secrets.DATABRICKS_TOKEN }}
          DBT_ENV: \${{ inputs.environment }}
        run: |
          dbt deps --project-dir ./dbt
          dbt debug --project-dir ./dbt --target \$DBT_ENV
          dbt test --project-dir ./dbt --target \$DBT_ENV --store-failures`}</CodeBlock>
          <Quiz topicId="az-devops" questions={[
            {
              question: "What is the purpose of 'permissions: id-token: write' in a GitHub Actions workflow?",
              options: [
                "It grants the workflow write access to the GitHub repository",
                "It enables the workflow to request an OIDC token from GitHub for workload identity federation with Azure  -  eliminating the need to store Azure credentials as secrets",
                "It allows the workflow to create GitHub releases",
                "It grants admin access to GitHub Actions settings"
              ],
              correct: 1
            },
            {
              question: "In Azure DevOps / GitHub Actions for ADF, what is the adf_publish branch?",
              options: [
                "The branch where developers write ADF pipeline code",
                "The branch containing compiled ARM templates exported by ADF's Publish button  -  used by CI/CD to deploy the factory to other environments",
                "The production branch that ADF reads directly",
                "A read-only mirror of the main branch for ADF"
              ],
              correct: 1
            },
            {
              question: "What is a GitHub Actions 'environment' and why is it used for production deployments?",
              options: [
                "An environment is a set of environment variables for a job",
                "An environment is a named deployment target with protection rules including required reviewers (manual approval gates), wait timers, and scoped secrets  -  preventing automated deploys to production without human sign-off",
                "An environment is a Docker container configuration for runners",
                "An environment maps to an Azure subscription"
              ],
              correct: 1
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-devops'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-terraform ── */}
        <section id="az-terraform" ref={el => { if (el) sectionRefs.current['az-terraform'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Terraform for Azure</h1>
            <p className="topic-desc">Terraform is the de-facto IaC tool for Azure data platforms. It declaratively manages all Azure resources  -  VNets, storage accounts, ADF, Databricks workspaces  -  with a state file tracking what exists, enabling plan/apply/destroy workflows.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128161;</span>
            <div className="callout-body">
              <strong>State management:</strong> Store Terraform state in Azure Blob Storage (not local). Use state locking via Azure Blob lease to prevent concurrent runs. Never edit state manually  -  use <code>terraform state mv</code> or <code>terraform import</code>.
            </div>
          </div>
          <CodeBlock lang="hcl">{`# main.tf  -  Azure data platform infrastructure

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
    databricks = {
      source  = "databricks/databricks"
      version = "~> 1.36"
    }
  }

  # Remote state in Azure Blob Storage
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "tfstatemystg"
    container_name       = "tfstate"
    key                  = "de-platform.tfstate"
    # use_azuread_auth = true  # use managed identity, not storage key
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}

# Variables
variable "environment" {
  description = "Environment: dev, staging, prod"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "location" {
  type    = string
  default = "eastus"
}

# Local values (computed)
locals {
  prefix   = "de-\${var.environment}"
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    team        = "data-engineering"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "\${local.prefix}-rg"
  location = var.location
  tags     = local.tags
}

# ADLS Gen2 storage account
resource "azurerm_storage_account" "datalake" {
  name                     = "datalake\${var.environment}stg"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "GRS" : "LRS"
  account_kind             = "StorageV2"
  is_hns_enabled           = true   # ADLS Gen2 requires HNS

  network_rules {
    default_action             = "Deny"
    bypass                     = ["AzureServices"]
    ip_rules                   = []
    virtual_network_subnet_ids = []
  }

  tags = local.tags
}

# Storage containers (filesystems)
resource "azurerm_storage_data_lake_gen2_filesystem" "bronze" {
  name               = "bronze"
  storage_account_id = azurerm_storage_account.datalake.id
}

resource "azurerm_storage_data_lake_gen2_filesystem" "silver" {
  name               = "silver"
  storage_account_id = azurerm_storage_account.datalake.id
}

resource "azurerm_storage_data_lake_gen2_filesystem" "gold" {
  name               = "gold"
  storage_account_id = azurerm_storage_account.datalake.id
}`}</CodeBlock>
          <CodeBlock lang="hcl">{`# Key Vault, ADF, and Databricks workspace
resource "azurerm_key_vault" "main" {
  name                       = "\${local.prefix}-kv"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = var.location
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  soft_delete_retention_days = 90
  purge_protection_enabled   = var.environment == "prod" ? true : false
  tags                       = local.tags
}

data "azurerm_client_config" "current" {}

# Grant current Terraform SP Key Vault Secrets Officer
resource "azurerm_role_assignment" "kv_tf_secrets_officer" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}

# Azure Data Factory with system-assigned managed identity
resource "azurerm_data_factory" "main" {
  name                = "\${local.prefix}-adf"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags

  identity { type = "SystemAssigned" }

  vsts_configuration {
    account_name    = "myorg"
    branch_name     = "main"
    project_name    = "DataPlatform"
    repository_name = "adf-repo"
    root_folder     = "/"
    tenant_id       = data.azurerm_client_config.current.tenant_id
  }
}

# Grant ADF managed identity access to ADLS
resource "azurerm_role_assignment" "adf_adls_contributor" {
  scope                = azurerm_storage_account.datalake.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_data_factory.main.identity[0].principal_id
}

# Databricks workspace (VNet injection)
resource "azurerm_databricks_workspace" "main" {
  name                        = "\${local.prefix}-dbx"
  resource_group_name         = azurerm_resource_group.main.name
  location                    = var.location
  sku                         = var.environment == "prod" ? "premium" : "standard"
  tags                        = local.tags

  custom_parameters {
    no_public_ip                                         = true
    virtual_network_id                                   = azurerm_virtual_network.main.id
    public_subnet_name                                   = azurerm_subnet.dbx_public.name
    private_subnet_name                                  = azurerm_subnet.dbx_private.name
    public_subnet_network_security_group_association_id  = azurerm_subnet_network_security_group_association.dbx_public.id
    private_subnet_network_security_group_association_id = azurerm_subnet_network_security_group_association.dbx_private.id
  }
}

# Outputs
output "adls_dfs_endpoint" {
  value = azurerm_storage_account.datalake.primary_dfs_endpoint
}

output "adf_id" {
  value = azurerm_data_factory.main.id
}

output "databricks_workspace_url" {
  value = "https://\${azurerm_databricks_workspace.main.workspace_url}"
}`}</CodeBlock>
          <CodeBlock lang="bash">{`# Terraform workflow
cd terraform/

# Initialise (download providers, configure backend)
terraform init \
  -backend-config="storage_account_name=tfstatemystg" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=de-platform-dev.tfstate"

# Format and validate
terraform fmt -recursive
terraform validate

# Plan (shows what will change, no actual changes)
terraform plan -var="environment=dev" -out=tfplan

# Apply the plan
terraform apply tfplan

# Destroy (tear down all resources - careful!)
terraform destroy -var="environment=dev" -target=azurerm_storage_account.datalake

# Import existing resource into state
terraform import azurerm_resource_group.main /subscriptions/SUB/resourceGroups/existing-rg

# Workspaces for environment isolation
terraform workspace new staging
terraform workspace select staging
terraform plan -var="environment=staging" -out=tfplan-staging
terraform apply tfplan-staging

# State manipulation (use with extreme caution)
terraform state list
terraform state show azurerm_storage_account.datalake
terraform state mv azurerm_storage_account.datalake azurerm_storage_account.adls_gen2`}</CodeBlock>
          <Quiz topicId="az-terraform" questions={[
            {
              question: "Why must Terraform state be stored in Azure Blob Storage rather than locally for team workflows?",
              options: [
                "Local state files are not supported by the Azure provider",
                "Remote state enables team sharing (everyone sees the same current infrastructure state), state locking (prevents concurrent runs from corrupting state), and state encryption at rest",
                "Azure Blob Storage provides faster state reads than local disk",
                "Terraform requires remote state to use the azurerm provider"
              ],
              correct: 1
            },
            {
              question: "What does 'terraform plan' do and why is it important before 'terraform apply'?",
              options: [
                "terraform plan applies changes in dry-run mode and rolls back automatically",
                "terraform plan generates a diff of what will be created, updated, or destroyed without making changes  -  critical for reviewing infrastructure changes before committing, especially destructive operations",
                "terraform plan validates syntax only, not actual resource changes",
                "terraform plan is only needed the first time; subsequent applies are safe without it"
              ],
              correct: 1
            },
            {
              question: "What is 'terraform import' used for?",
              options: [
                "Importing Terraform modules from a registry",
                "Importing variables from a .tfvars file",
                "Bringing an existing Azure resource that was created outside of Terraform under Terraform state management, so it can be managed going forward",
                "Importing an ARM template and converting it to HCL"
              ],
              correct: 2
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-terraform'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

        {/* ── az-cost ── */}
        <section id="az-cost" ref={el => { if (el) sectionRefs.current['az-cost'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Cost Management</h1>
            <p className="topic-desc">Cloud cost is an engineering concern. Data platforms commonly overspend on idle Databricks clusters, over-provisioned Synapse dedicated pools, and unnecessary data egress. Understanding Azure Cost Management tools lets you monitor, alert, and optimise spend proactively.</p>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">&#128161;</span>
            <div className="callout-body">
              <strong>Top cost drivers for data platforms:</strong> (1) Databricks all-purpose clusters left running  -  use job clusters, set auto-termination. (2) Synapse dedicated SQL pool always on  -  pause when not needed or switch to serverless. (3) Data egress across regions/internet. (4) Over-provisioned storage tiers  -  archive data cold after 30 days.
            </div>
          </div>
          <CodeBlock lang="bash">{`# Azure Cost Management CLI
# View costs for last 30 days by resource group
az costmanagement query \
  --type Usage \
  --scope "/subscriptions/SUB_ID" \
  --timeframe MonthToDate \
  --dataset-aggregation '{"totalCost":{"name":"PreTaxCost","function":"Sum"}}' \
  --dataset-grouping '{"name":"ResourceGroupName","type":"Dimension"}'

# Create a budget with email alert at 80% and 100% of threshold
az consumption budget create \
  --budget-name "de-platform-monthly" \
  --amount 5000 \
  --time-grain Monthly \
  --time-period start=2024-01-01T00:00:00Z \
  --resource-group de-rg \
  --notifications '[
    {
      "enabled": true,
      "operator": "GreaterThan",
      "threshold": 80,
      "contactEmails": ["team-lead@company.com"],
      "thresholdType": "Actual"
    },
    {
      "enabled": true,
      "operator": "GreaterThan",
      "threshold": 100,
      "contactEmails": ["team-lead@company.com", "finance@company.com"],
      "thresholdType": "Forecasted"
    }
  ]'

# Auto-shutdown VM at 7pm every day
az vm auto-shutdown \
  --resource-group de-rg \
  --name dev-vm \
  --time 1900 \
  --email "dev@company.com"`}</CodeBlock>
          <CodeBlock lang="python">{`# Azure Cost Management SDK  -  query and analyse costs
from azure.mgmt.costmanagement import CostManagementClient
from azure.mgmt.costmanagement.models import (
    QueryDefinition, QueryTimePeriod, QueryDataset,
    QueryAggregation, QueryGrouping, TimeframeType
)
from azure.identity import DefaultAzureCredential
from datetime import datetime, timedelta

credential = DefaultAzureCredential()
client = CostManagementClient(credential)

scope = f"/subscriptions/{SUBSCRIPTION_ID}"

# Query costs by service name for last 30 days
result = client.query.usage(
    scope=scope,
    parameters=QueryDefinition(
        type="Usage",
        timeframe=TimeframeType.MONTH_TO_DATE,
        dataset=QueryDataset(
            granularity="Daily",
            aggregation={
                "totalCost": QueryAggregation(name="PreTaxCost", function="Sum")
            },
            grouping=[
                QueryGrouping(type="Dimension", name="ServiceName"),
                QueryGrouping(type="Dimension", name="ResourceGroupName"),
            ]
        )
    )
)

# Print top spenders
rows = result.rows
columns = [c.name for c in result.columns]
import pandas as pd
df = pd.DataFrame(rows, columns=columns)
print(df.groupby("ServiceName")["PreTaxCost"].sum().sort_values(ascending=False).head(10))`}</CodeBlock>
          <CodeBlock lang="bash">{`# Reserved instances (save 30-70% vs pay-as-you-go)
# Purchase 1-year reservation for Databricks (D4s_v3 x 4 nodes)
az reservations reservation-order purchase \
  --sku-name "Standard_D4s_v3" \
  --location eastus \
  --reserved-resource-type VirtualMachines \
  --term P1Y \
  --quantity 4 \
  --display-name "databricks-job-nodes-1yr"

# Spot instances for Databricks worker nodes (up to 90% savings, preemptible)
# Set in cluster config JSON:
# "azure_attributes": {
#   "spot_bid_max_price": -1,    # -1 = current spot price
#   "availability": "SPOT_WITH_FALLBACK_AZURE",
#   "first_on_demand": 1         # keep 1 node on-demand for driver stability
# }

# ADLS Gen2 lifecycle policy: auto-tier old data to cool/cold/archive
az storage account management-policy create \
  --account-name mystorageaccount \
  --resource-group de-rg \
  --policy '{
    "rules": [
      {
        "name": "auto-tier-bronze",
        "enabled": true,
        "type": "Lifecycle",
        "definition": {
          "actions": {
            "baseBlob": {
              "tierToCool":    { "daysAfterModificationGreaterThan": 30 },
              "tierToCold":    { "daysAfterModificationGreaterThan": 90 },
              "tierToArchive": { "daysAfterModificationGreaterThan": 180 },
              "delete":        { "daysAfterModificationGreaterThan": 365 }
            }
          },
          "filters": {
            "blobTypes": ["blockBlob"],
            "prefixMatch": ["bronze/"]
          }
        }
      }
    ]
  }'

# Right-sizing: check Databricks cluster utilisation
# If max_executors_active / max_executors < 60% consistently -> downsize
# Use Azure Advisor recommendations:
az advisor recommendation list \
  --category Cost \
  --resource-group de-rg \
  --query "[].{Resource:resourceMetadata.resourceId, Impact:impact, Savings:extendedProperties.annualSavingsAmount}" \
  --output table`}</CodeBlock>
          <Quiz topicId="az-cost" questions={[
            {
              question: "What is the single biggest cost optimisation for Azure Databricks in most data platforms?",
              options: [
                "Switching to a smaller VM SKU",
                "Using job clusters (auto-created/destroyed per job) with auto-termination instead of long-running all-purpose clusters that are left running when idle",
                "Disabling autoscaling to prevent over-provisioning",
                "Moving workloads to Synapse Spark instead"
              ],
              correct: 1
            },
            {
              question: "What is the difference between a Budget alert at 'Actual' vs 'Forecasted' threshold?",
              options: [
                "Actual alerts use real-time data; Forecasted alerts use yesterday's data",
                "Actual alerts fire when you have already spent the threshold amount. Forecasted alerts fire when Azure predicts you WILL exceed the threshold by end of period  -  enabling proactive action before overspend occurs.",
                "Forecasted alerts are only available for subscriptions, not resource groups",
                "There is no difference  -  both fire at the same time"
              ],
              correct: 1
            },
            {
              question: "When are Azure Reserved Instances the most cost-effective choice vs pay-as-you-go?",
              options: [
                "For bursty, unpredictable workloads that run a few hours per week",
                "For any workload regardless of usage pattern",
                "For stable, predictable workloads running 24/7 or most of the day  -  reservations offer 30-70% savings over pay-as-you-go for 1-year or 3-year commitments",
                "Reserved Instances are only cost-effective for VMs, not PaaS services"
              ],
              correct: 2
            }
          ]} />
          <button onClick={async () => { await markTopicComplete('az-cost'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete &#10003;</button>
        </section>

      </main>
    </div>
  )
}
