import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete, unmarkTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: (id?: string) => void; onUnmark: (id: string) => void; onSignInNeeded: () => void }

const SECTIONS = [
  { title: 'Level 6 - Cloud and Azure', items: [
    { id: 'az-fundamentals', label: 'Fundamentals' },
    { id: 'az-adls', label: 'ADLS Gen2' },
    { id: 'az-blob', label: 'Blob Storage' },
    { id: 'az-adf', label: 'Data Factory' },
    { id: 'az-synapse', label: 'Synapse' },
    { id: 'az-databricks', label: 'Databricks' },
    { id: 'az-eventhub', label: 'Event Hub' },
    { id: 'az-eventgrid', label: 'Event Grid' },
    { id: 'az-servicebus', label: 'Service Bus' },
    { id: 'az-functions', label: 'Functions' },
    { id: 'az-streamanalytics', label: 'Stream Analytics' },
    { id: 'az-keyvault', label: 'Key Vault' },
    { id: 'az-identity', label: 'Identity & AAD' },
    { id: 'az-networking', label: 'VNet' },
    { id: 'az-monitor', label: 'Monitor & KQL' },
    { id: 'az-cosmos', label: 'Cosmos DB' },
    { id: 'az-sql', label: 'Azure SQL' },
    { id: 'az-devops', label: 'DevOps' },
    { id: 'az-terraform', label: 'Terraform' },
    { id: 'az-cost', label: 'Cost' },
  ]},
]

// ─────────────────────────────────────────────── AZURE DIAGRAM COMPONENTS ───

function AzureArchitectureDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 500 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Azure Data Platform — Reference Architecture</text>
        {[
          {label:'Ingest\n(ADF / Event Hub)',color:'#4f8ef7',x:10},
          {label:'Store\n(ADLS Gen2)',color:'#22c55e',x:115},
          {label:'Process\n(Databricks / Synapse)',color:'#8b5cf6',x:220},
          {label:'Serve\n(Synapse / Power BI)',color:'#f59e0b',x:350},
          {label:'Govern\n(Purview)',color:'#ef4444',x:455},
        ].map((s,i)=>(
          <g key={s.label}>
            <rect x={s.x} y="20" width="100" height="48" rx="5" fill={s.color} opacity=".14" stroke={s.color} strokeWidth="1.5"/>
            {s.label.split('\n').map((l,j)=><text key={j} x={s.x+50} y={35+j*14} fontSize={j===0?9.5:8} fontWeight={j===0?'700':'400'} fill={j===0?s.color:'#475569'} textAnchor="middle">{l}</text>)}
            {i<4&&<polygon points={`${s.x+104},44 ${s.x+113},40 ${s.x+113},48`} fill={s.color} opacity=".6"/>}
          </g>
        ))}
      </svg>
    </div>
  )
}

function ADLSDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 85" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">ADLS Gen2 — Hierarchical Namespace</text>
        <rect x="10" y="20" width="460" height="14" rx="3" fill="#1e293b" opacity=".08" stroke="#1e293b" strokeWidth="1"/>
        <text x="16" y="31" fontSize="8.5" fontWeight="700" fill="#1e293b">Storage Account</text>
        <rect x="10" y="38" width="220" height="14" rx="3" fill="#4f8ef7" opacity=".15" stroke="#4f8ef7" strokeWidth="1"/>
        <text x="16" y="49" fontSize="8" fill="#4f8ef7">Container: raw</text>
        <rect x="240" y="38" width="230" height="14" rx="3" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1"/>
        <text x="246" y="49" fontSize="8" fill="#22c55e">Container: refined</text>
        {['bronze/','silver/','gold/'].map((d,i)=>(
          <g key={d}>
            <rect x={10+i*74} y="56" width="70" height="12" rx="2" fill="#4f8ef7" opacity=".12"/>
            <text x={45+i*74} y="66" fontSize="7.5" fill="#4f8ef7" textAnchor="middle">{d}</text>
          </g>
        ))}
        <text x="4" y="80" fontSize="8" fill="#64748b">HNS enables atomic directory ops, ACLs at folder level, 3× faster than Blob for big data analytics</text>
      </svg>
    </div>
  )
}

function BlobDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Blob Storage — Access Tiers</text>
        {[
          {tier:'Hot',cost:'High storage, Low access',lat:'< 1ms',color:'#f59e0b'},
          {tier:'Cool',cost:'Lower storage, Higher access',lat:'< 1ms',color:'#4f8ef7'},
          {tier:'Cold',cost:'Low storage, High access',lat:'< 1ms',color:'#22c55e'},
          {tier:'Archive',cost:'Lowest storage, High access',lat:'1-15 hours',color:'#8b5cf6'},
        ].map((t,i)=>(
          <g key={t.tier}>
            <rect x={4+i*114} y="18" width="108" height="48" rx="5" fill={t.color} opacity=".12" stroke={t.color} strokeWidth="1.2"/>
            <text x={58+i*114} y="32" fontSize="10" fontWeight="700" fill={t.color} textAnchor="middle">{t.tier}</text>
            <text x={58+i*114} y="44" fontSize="7" fill="#475569" textAnchor="middle">{t.cost}</text>
            <text x={58+i*114} y="56" fontSize="7.5" fontWeight="600" fill={t.color} textAnchor="middle">{t.lat}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function ADFDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 85" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Azure Data Factory — Pipeline Flow</text>
        {[
          {label:'Linked Service',sub:'Connection string',color:'#4f8ef7',x:10},
          {label:'Dataset',sub:'Schema + format',color:'#22c55e',x:125},
          {label:'Activity',sub:'Copy / Mapping DF',color:'#8b5cf6',x:240},
          {label:'Pipeline',sub:'Orchestrates activities',color:'#f59e0b',x:355},
        ].map((s,i)=>(
          <g key={s.label}>
            <rect x={s.x} y="18" width="108" height="44" rx="5" fill={s.color} opacity=".12" stroke={s.color} strokeWidth="1.5"/>
            <text x={s.x+54} y="34" fontSize="9" fontWeight="700" fill={s.color} textAnchor="middle">{s.label}</text>
            <text x={s.x+54} y="48" fontSize="7.5" fill="#475569" textAnchor="middle">{s.sub}</text>
            {i<3&&<polygon points={`${s.x+112},40 ${s.x+123},36 ${s.x+123},44`} fill={s.color} opacity=".7"/>}
          </g>
        ))}
        <text x="4" y="78" fontSize="8" fill="#64748b">Trigger (schedule / tumbling / event) → runs Pipeline → Activities → Linked Services → Datasets</text>
      </svg>
    </div>
  )
}

function SynapseDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 85" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Synapse Analytics — Compute Pools</text>
        {[
          {name:'Dedicated SQL Pool',desc:'MPP, provisioned DWU',color:'#4f8ef7'},
          {name:'Serverless SQL Pool',desc:'Pay-per-query on ADLS',color:'#22c55e'},
          {name:'Apache Spark Pool',desc:'Spark 3.x, auto-scale',color:'#8b5cf6'},
          {name:'Data Explorer Pool',desc:'Time-series, KQL',color:'#f59e0b'},
        ].map((p,i)=>(
          <g key={p.name}>
            <rect x={4+(i%2)*238} y={18+Math.floor(i/2)*30} width="228" height="22" rx="4" fill={p.color} opacity=".12" stroke={p.color} strokeWidth="1.2"/>
            <text x={14+(i%2)*238} y={28+Math.floor(i/2)*30} fontSize="9" fontWeight="700" fill={p.color}>{p.name}</text>
            <text x={14+(i%2)*238} y={37+Math.floor(i/2)*30} fontSize="7.5" fill="#475569">{p.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DatabricksDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Databricks on Azure — Cluster Types</text>
        {[
          {type:'All-Purpose',desc:'Interactive notebooks\nPersistent, billed hourly',color:'#4f8ef7'},
          {type:'Job Cluster',desc:'One-run pipelines\nTerminates on completion',color:'#22c55e'},
          {type:'SQL Warehouse',desc:'BI queries (JDBC)\nServerless or classic',color:'#8b5cf6'},
          {type:'Instance Pools',desc:'Pre-warmed VMs\nFaster cluster start',color:'#f59e0b'},
        ].map((c,i)=>(
          <g key={c.type}>
            <rect x={4+(i%2)*238} y={18+Math.floor(i/2)*36} width="228" height="28" rx="4" fill={c.color} opacity=".12" stroke={c.color} strokeWidth="1.2"/>
            <text x={14+(i%2)*238} y={30+Math.floor(i/2)*36} fontSize="9" fontWeight="700" fill={c.color}>{c.type}</text>
            {c.desc.split('\n').map((d,j)=><text key={j} x={14+(i%2)*238} y={40+j*10+Math.floor(i/2)*36} fontSize="7.5" fill="#475569">{d}</text>)}
          </g>
        ))}
      </svg>
    </div>
  )
}

function EventHubDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 90" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Event Hub — Kafka-Compatible Streaming Ingestion</text>
        {['Producer A','Producer B','Producer C'].map((p,i)=>(
          <g key={p}>
            <rect x="10" y={18+i*22} width="80" height="16" rx="3" fill="#4f8ef7" opacity=".18" stroke="#4f8ef7" strokeWidth="1"/>
            <text x="50" y={30+i*22} fontSize="8" fill="#4f8ef7" textAnchor="middle">{p}</text>
            <line x1="90" y1={26+i*22} x2="130" y2={26+i*22} stroke="#4f8ef7" strokeWidth="1"/>
          </g>
        ))}
        <rect x="132" y="16" width="100" height="68" rx="5" fill="#f59e0b" opacity=".15" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="182" y="40" fontSize="9" fontWeight="700" fill="#f59e0b" textAnchor="middle">Event Hub</text>
        <text x="182" y="52" fontSize="7.5" fill="#475569" textAnchor="middle">Namespace</text>
        <text x="182" y="62" fontSize="7.5" fill="#475569" textAnchor="middle">partitions 0–31</text>
        <text x="182" y="72" fontSize="7.5" fill="#475569" textAnchor="middle">retention: 1–7 days</text>
        {['Stream Analytics','Spark (Databricks)','Function App'].map((c,i)=>(
          <g key={c}>
            <line x1="232" y1={26+i*22} x2="270" y2={26+i*22} stroke="#22c55e" strokeWidth="1"/>
            <rect x="272" y={18+i*22} width="100" height="16" rx="3" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1"/>
            <text x="322" y={30+i*22} fontSize="7.5" fill="#22c55e" textAnchor="middle">{c}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function EventGridDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Event Grid — Reactive Event Routing</text>
        {['Blob Storage','Resource Group','Custom Topic'].map((s,i)=>(
          <g key={s}>
            <rect x="10" y={18+i*18} width="110" height="14" rx="3" fill="#4f8ef7" opacity=".15" stroke="#4f8ef7" strokeWidth="1"/>
            <text x="65" y={29+i*18} fontSize="7.5" fill="#4f8ef7" textAnchor="middle">{s}</text>
            <line x1="120" y1={25+i*18} x2="155" y2="36" stroke="#4f8ef7" strokeWidth="1" strokeDasharray="2 1"/>
          </g>
        ))}
        <rect x="157" y="24" width="80" height="24" rx="4" fill="#f59e0b" opacity=".18" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="197" y="40" fontSize="9" fontWeight="700" fill="#f59e0b" textAnchor="middle">Event Grid</text>
        {['Azure Function','Logic App','Service Bus'].map((h,i)=>(
          <g key={h}>
            <line x1="237" y1="36" x2="272" y2={25+i*18} stroke="#22c55e" strokeWidth="1" strokeDasharray="2 1"/>
            <rect x="274" y={18+i*18} width="110" height="14" rx="3" fill="#22c55e" opacity=".12" stroke="#22c55e" strokeWidth="1"/>
            <text x="329" y={29+i*18} fontSize="7.5" fill="#22c55e" textAnchor="middle">{h}</text>
          </g>
        ))}
        <text x="4" y="74" fontSize="8" fill="#64748b">Push model — near real-time event fan-out, max 1M events/s, 5-min retry SLA</text>
      </svg>
    </div>
  )
}

function ServiceBusDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Service Bus — Queue vs Topic</text>
        <rect x="10" y="20" width="200" height="44" rx="5" fill="#4f8ef7" opacity=".1" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="110" y="34" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Queue (P2P)</text>
        <text x="110" y="48" fontSize="7.5" fill="#475569" textAnchor="middle">One consumer dequeues msg</text>
        <text x="110" y="58" fontSize="7.5" fill="#94a3b8" textAnchor="middle">FIFO, dead-letter queue</text>
        <rect x="250" y="20" width="200" height="44" rx="5" fill="#8b5cf6" opacity=".1" stroke="#8b5cf6" strokeWidth="1.5"/>
        <text x="350" y="34" fontSize="9" fontWeight="700" fill="#8b5cf6" textAnchor="middle">Topic (Pub/Sub)</text>
        <text x="350" y="48" fontSize="7.5" fill="#475569" textAnchor="middle">Multiple subscriptions receive copy</text>
        <text x="350" y="58" fontSize="7.5" fill="#94a3b8" textAnchor="middle">Filter rules per subscription</text>
      </svg>
    </div>
  )
}

function FunctionsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Azure Functions — Trigger → Function → Output Binding</text>
        {[
          {trigger:'Timer Trigger',fn:'cleanup_old_blobs',out:'ADLS Delete',color:'#4f8ef7'},
          {trigger:'Event Hub Trigger',fn:'process_stream',out:'Cosmos DB upsert',color:'#22c55e'},
          {trigger:'HTTP Trigger',fn:'validate_payload',out:'Service Bus msg',color:'#8b5cf6'},
        ].map((f,i)=>(
          <g key={f.trigger}>
            <rect x="10" y={18+i*18} width="100" height="14" rx="3" fill={f.color} opacity=".2" stroke={f.color} strokeWidth="1"/>
            <text x="60" y={29+i*18} fontSize="7.5" fill={f.color} textAnchor="middle">{f.trigger}</text>
            <polygon points={`${112},${25+i*18} ${122},${21+i*18} ${122},${29+i*18}`} fill={f.color} opacity=".6"/>
            <rect x="124" y={18+i*18} width="130" height="14" rx="3" fill={f.color} opacity=".12"/>
            <text x="189" y={29+i*18} fontSize="7.5" fontFamily="monospace" fill="#1e293b" textAnchor="middle">{f.fn}()</text>
            <polygon points={`${256},${25+i*18} ${266},${21+i*18} ${266},${29+i*18}`} fill={f.color} opacity=".6"/>
            <rect x="268" y={18+i*18} width="130" height="14" rx="3" fill={f.color} opacity=".12" stroke={f.color} strokeWidth="1"/>
            <text x="333" y={29+i*18} fontSize="7.5" fill={f.color} textAnchor="middle">{f.out}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function StreamAnalyticsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Stream Analytics — Real-Time SQL on Streams</text>
        <rect x="10" y="20" width="90" height="40" rx="5" fill="#4f8ef7" opacity=".18" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="55" y="38" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Input</text>
        <text x="55" y="50" fontSize="7.5" fill="#475569" textAnchor="middle">Event Hub</text>
        <polygon points="102,40 112,36 112,44" fill="#4f8ef7"/>
        <rect x="114" y="18" width="160" height="44" rx="5" fill="#f59e0b" opacity=".12" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="194" y="34" fontSize="9" fontWeight="700" fill="#f59e0b" textAnchor="middle">ASA Job</text>
        <text x="194" y="46" fontSize="7.5" fill="#475569" textAnchor="middle">SELECT, WHERE, GROUP BY</text>
        <text x="194" y="56" fontSize="7.5" fill="#475569" textAnchor="middle">TUMBLING / HOPPING window</text>
        <polygon points="276,40 286,36 286,44" fill="#22c55e"/>
        <rect x="288" y="20" width="90" height="40" rx="5" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="333" y="38" fontSize="9" fontWeight="700" fill="#22c55e" textAnchor="middle">Output</text>
        <text x="333" y="50" fontSize="7.5" fill="#475569" textAnchor="middle">Power BI / ADLS</text>
        <text x="4" y="74" fontSize="8" fill="#64748b">SU (Streaming Units) = compute. 1 SU ≈ 1 MB/s throughput</text>
      </svg>
    </div>
  )
}

function KeyVaultDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 75" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Key Vault — Secret Management</text>
        <rect x="10" y="20" width="140" height="40" rx="5" fill="#4f8ef7" opacity=".12" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="80" y="37" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">App / Service</text>
        <text x="80" y="50" fontSize="7.5" fill="#475569" textAnchor="middle">Managed Identity</text>
        <polygon points="152,40 162,36 162,44" fill="#4f8ef7"/>
        <rect x="164" y="20" width="140" height="40" rx="5" fill="#f59e0b" opacity=".15" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="234" y="37" fontSize="9" fontWeight="700" fill="#f59e0b" textAnchor="middle">Key Vault</text>
        <text x="234" y="50" fontSize="7.5" fill="#475569" textAnchor="middle">Secrets / Keys / Certs</text>
        <polygon points="306,40 316,36 316,44" fill="#22c55e"/>
        <rect x="318" y="20" width="130" height="40" rx="5" fill="#22c55e" opacity=".12" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="383" y="37" fontSize="9" fontWeight="700" fill="#22c55e" textAnchor="middle">Secret value</text>
        <text x="383" y="50" fontSize="7.5" fill="#475569" textAnchor="middle">returned to caller</text>
        <text x="4" y="70" fontSize="8" fill="#64748b">No secrets in code — apps authenticate via Managed Identity, retrieve secrets at runtime</text>
      </svg>
    </div>
  )
}

function IdentityDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Azure Identity — RBAC Layers</text>
        {[
          {scope:'Management Group',color:'#1e293b'},
          {scope:'Subscription',color:'#4f8ef7'},
          {scope:'Resource Group',color:'#8b5cf6'},
          {scope:'Resource',color:'#22c55e'},
        ].map((s,i)=>(
          <g key={s.scope}>
            <rect x={10+i*14} y={18+i*13} width={440-i*28} height="12" rx="2" fill={s.color} opacity={.1+i*.06} stroke={s.color} strokeWidth="1"/>
            <text x={16+i*14} y={28+i*13} fontSize="8" fill={s.color}>{s.scope}</text>
          </g>
        ))}
        <text x="4" y="76" fontSize="8" fill="#64748b">Role assignment = {'{'}identity{'}'}+{'{'}role{'}'}+{'{'}scope{'}'}. Inherited downwards. Deny assignments override allow.</text>
      </svg>
    </div>
  )
}

function NetworkingDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Azure Networking — VNet Isolation</text>
        <rect x="10" y="18" width="460" height="54" rx="6" fill="#4f8ef7" opacity=".05" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="20" y="28" fontSize="8" fill="#4f8ef7">VNet: 10.0.0.0/16</text>
        <rect x="22" y="32" width="140" height="28" rx="4" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1.2"/>
        <text x="92" y="44" fontSize="8" fontWeight="600" fill="#22c55e" textAnchor="middle">Subnet: app 10.0.1.0/24</text>
        <text x="92" y="55" fontSize="7.5" fill="#475569" textAnchor="middle">NSG: allow 443</text>
        <rect x="180" y="32" width="140" height="28" rx="4" fill="#8b5cf6" opacity=".12" stroke="#8b5cf6" strokeWidth="1.2"/>
        <text x="250" y="44" fontSize="8" fontWeight="600" fill="#8b5cf6" textAnchor="middle">Subnet: data 10.0.2.0/24</text>
        <text x="250" y="55" fontSize="7.5" fill="#475569" textAnchor="middle">Private Endpoints</text>
        <rect x="338" y="32" width="120" height="28" rx="4" fill="#f59e0b" opacity=".12" stroke="#f59e0b" strokeWidth="1.2"/>
        <text x="398" y="44" fontSize="8" fontWeight="600" fill="#f59e0b" textAnchor="middle">Subnet: gateway</text>
        <text x="398" y="55" fontSize="7.5" fill="#475569" textAnchor="middle">VPN / ExpressRoute</text>
      </svg>
    </div>
  )
}

function MonitorDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Azure Monitor — Observability Stack</text>
        {[
          {name:'Metrics',desc:'Numeric time-series\n(CPU, memory, latency)',color:'#4f8ef7'},
          {name:'Logs (LA Workspace)',desc:'Structured KQL-queryable\nlog data',color:'#8b5cf6'},
          {name:'Traces (App Insights)',desc:'Distributed request tracing\nend-to-end',color:'#22c55e'},
          {name:'Alerts',desc:'Metric or log rules\n→ action group',color:'#ef4444'},
        ].map((m,i)=>(
          <g key={m.name}>
            <rect x={4+(i%2)*232} y={18+Math.floor(i/2)*30} width="222" height="22" rx="4" fill={m.color} opacity=".12" stroke={m.color} strokeWidth="1.1"/>
            <text x={14+(i%2)*232} y={27+Math.floor(i/2)*30} fontSize="8.5" fontWeight="700" fill={m.color}>{m.name}</text>
            <text x={14+(i%2)*232} y={37+Math.floor(i/2)*30} fontSize="7.5" fill="#475569">{m.desc.replace('\n',' — ')}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function CosmosDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Cosmos DB — Global Distribution + Multi-API</text>
        {[
          {api:'Core (SQL)',desc:'JSON docs + SQL queries',color:'#4f8ef7'},
          {api:'Mongo API',desc:'MongoDB-compatible wire',color:'#22c55e'},
          {api:'Cassandra API',desc:'Wide-column CQL',color:'#8b5cf6'},
          {api:'Gremlin API',desc:'Graph traversal',color:'#f59e0b'},
        ].map((a,i)=>(
          <g key={a.api}>
            <rect x={4+i*113} y="18" width="108" height="44" rx="5" fill={a.color} opacity=".12" stroke={a.color} strokeWidth="1.2"/>
            <text x={58+i*113} y="33" fontSize="9" fontWeight="700" fill={a.color} textAnchor="middle">{a.api}</text>
            <text x={58+i*113} y="45" fontSize="7.5" fill="#475569" textAnchor="middle">{a.desc}</text>
          </g>
        ))}
        <text x="4" y="74" fontSize="8" fill="#64748b">RU/s = Request Units per second. Single-digit ms P99 globally. 5 consistency levels.</text>
      </svg>
    </div>
  )
}

function AzureSQLDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 75" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Azure SQL — Deployment Options</text>
        {[
          {name:'SQL Database (single)',desc:'PaaS, built-in HA, serverless option',color:'#4f8ef7'},
          {name:'SQL Managed Instance',desc:'Full SQL Server + VNet injection',color:'#22c55e'},
          {name:'SQL Server on VM',desc:'IaaS, full control, BYOL',color:'#8b5cf6'},
          {name:'Synapse Serverless SQL',desc:'T-SQL over ADLS (no writes)',color:'#f59e0b'},
        ].map((s,i)=>(
          <g key={s.name}>
            <rect x={4+(i%2)*232} y={18+Math.floor(i/2)*26} width="222" height="20" rx="4" fill={s.color} opacity=".12" stroke={s.color} strokeWidth="1.1"/>
            <text x={14+(i%2)*232} y={27+Math.floor(i/2)*26} fontSize="8.5" fontWeight="700" fill={s.color}>{s.name}</text>
            <text x={14+(i%2)*232} y={35+Math.floor(i/2)*26} fontSize="7.5" fill="#475569">{s.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DevOpsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 75" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Azure DevOps — CI/CD Pipeline</text>
        {['Commit','Build (YAML)','Unit Tests','Artifact','Deploy Dev','Deploy Prod'].map((s,i)=>(
          <g key={s}>
            <rect x={4+i*78} y="18" width="72" height="28" rx="4" fill={i>=4?'#22c55e':i===0?'#4f8ef7':'#8b5cf6'} opacity=".15" stroke={i>=4?'#22c55e':i===0?'#4f8ef7':'#8b5cf6'} strokeWidth="1.2"/>
            <text x={40+i*78} y="36" fontSize="8" fontWeight="600" fill={i>=4?'#22c55e':i===0?'#4f8ef7':'#8b5cf6'} textAnchor="middle">{s}</text>
            {i<5&&<polygon points={`${76+i*78},32 ${82+i*78},28 ${82+i*78},36`} fill="#94a3b8"/>}
          </g>
        ))}
        <text x="4" y="56" fontSize="7.5" fill="#64748b">Pipeline as code (azure-pipelines.yml). Gates between stages. Environments with approvals.</text>
      </svg>
    </div>
  )
}

function TerraformDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Terraform IaC — Plan → Apply Cycle</text>
        {[
          {label:'Write HCL\n(.tf files)',color:'#4f8ef7',x:10},
          {label:'terraform init\n(providers)',color:'#22c55e',x:120},
          {label:'terraform plan\n(diff)',color:'#f59e0b',x:230},
          {label:'terraform apply\n(provision)',color:'#ef4444',x:340},
        ].map((s,i)=>(
          <g key={s.label}>
            <rect x={s.x} y="18" width="104" height="40" rx="5" fill={s.color} opacity=".12" stroke={s.color} strokeWidth="1.5"/>
            {s.label.split('\n').map((l,j)=><text key={j} x={s.x+52} y={34+j*14} fontSize={j===0?9:8} fontWeight={j===0?'700':'400'} fill={j===0?s.color:'#475569'} textAnchor="middle">{l}</text>)}
            {i<3&&<polygon points={`${s.x+108},38 ${s.x+118},34 ${s.x+118},42`} fill={s.color} opacity=".7"/>}
          </g>
        ))}
        <text x="4" y="74" fontSize="8" fill="#64748b">State file (.tfstate) tracks real infra. Remote state in Azure Blob for team collaboration.</text>
      </svg>
    </div>
  )
}

function CostDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Cost Optimization — Key Levers</text>
        {[
          {tip:'Reserved Instances',save:'Up to 72% vs PAYG',color:'#22c55e'},
          {tip:'Spot / Low-priority VMs',save:'Up to 90% for interruptible',color:'#4f8ef7'},
          {tip:'Auto-pause (serverless)',save:'Zero cost when idle',color:'#8b5cf6'},
          {tip:'ADLS lifecycle mgmt',save:'Auto-tier cold data',color:'#f59e0b'},
          {tip:'Right-size clusters',save:'Reduce DWU / SU',color:'#ef4444'},
          {tip:'Tags + budgets',save:'Cost allocation + alerts',color:'#ec4899'},
        ].map((t,i)=>(
          <g key={t.tip}>
            <rect x={4+(i%3)*152} y={18+Math.floor(i/3)*28} width="144" height="22" rx="4" fill={t.color} opacity=".1" stroke={t.color} strokeWidth="1.1"/>
            <text x={14+(i%3)*152} y={28+Math.floor(i/3)*28} fontSize="8" fontWeight="700" fill={t.color}>{t.tip}</text>
            <text x={14+(i%3)*152} y={37+Math.floor(i/3)*28} fontSize="7.5" fill="#475569">{t.save}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function ADLSAnimation() {
  const [tier, setTier] = useState<'hot'|'cool'|'cold'|'archive'>('hot')
  const tiers = [
    {name:'hot',color:'#ef4444',cost:'$0.018/GB',latency:'<10ms',use:'Active pipeline data'},
    {name:'cool',color:'#f59e0b',cost:'$0.01/GB',latency:'<50ms',use:'30–90 day backlog'},
    {name:'cold',color:'#8b5cf6',cost:'$0.005/GB',latency:'<100ms',use:'90–180 day archive'},
    {name:'archive',color:'#64748b',cost:'$0.00099/GB',latency:'15 hrs rehydrate',use:'Compliance/audit'},
  ]
  const sel = tiers.find(t=>t.name===tier)!
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>ADLS Gen2 Storage Tiers</div>
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {tiers.map(t=>(
          <button key={t.name} onClick={()=>setTier(t.name as typeof tier)} style={{ flex:1, padding:'6px 0', borderRadius:8, border:`2px solid ${tier===t.name?t.color:'var(--border)'}`, background:tier===t.name?`${t.color}15`:'white', fontWeight:700, cursor:'pointer', fontSize:'.78rem', color:tier===t.name?t.color:'#94a3b8', textTransform:'capitalize' }}>{t.name}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {[['Cost/GB/mo',sel.cost],['Latency',sel.latency],['Use case',sel.use],['Best for',tier==='hot'?'bronze/silver layer':tier==='cool'?'staging/temp':tier==='cold'?'near-archive':'regulatory hold']].map(([k,v])=>(
          <div key={k} style={{ padding:'8px 12px', borderRadius:8, background:'white', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:'.7rem', color:'var(--text-secondary)', marginBottom:2 }}>{k}</div>
            <div style={{ fontWeight:700, fontSize:'.82rem', color:'#1e293b' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlobAnimation() {
  const [view, setView] = useState<'types'|'lifecycle'>('types')
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Blob Storage</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['types','lifecycle'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:'.78rem', background:view===v?'#4f8ef7':'var(--surface-3)', color:view===v?'white':'var(--text-secondary)' }}>{v}</button>
          ))}
        </div>
      </div>
      {view==='types' ? (
        <div style={{ display:'flex', gap:8 }}>
          {[{type:'Block Blob',use:'Files, Parquet, CSVs — most common for DE',color:'#4f8ef7'},{type:'Append Blob',use:'Log files — append-only, never modify',color:'#22c55e'},{type:'Page Blob',use:'VM disks — random read/write',color:'#f59e0b'}].map(b=>(
            <div key={b.type} style={{ flex:1, padding:12, borderRadius:10, border:`2px solid ${b.color}33`, background:`${b.color}0d` }}>
              <div style={{ fontWeight:700, fontSize:'.8rem', color:b.color, marginBottom:6 }}>{b.type}</div>
              <div style={{ fontSize:'.72rem', color:'#475569' }}>{b.use}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[{days:'0–30',tier:'Hot',cost:'$0.018/GB',color:'#ef4444'},{days:'30–90',tier:'Cool',cost:'$0.01/GB',color:'#f59e0b'},{days:'90–365',tier:'Archive',cost:'$0.001/GB',color:'#64748b'},{days:'365+',tier:'Delete',cost:'$0',color:'#22c55e'}].map(r=>(
            <div key={r.tier} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', borderRadius:8, border:`1px solid ${r.color}33`, background:`${r.color}0d` }}>
              <span style={{ fontSize:'.8rem', fontWeight:700, color:r.color }}>{r.days} days</span>
              <span style={{ fontSize:'.82rem', fontWeight:700, color:'#1e293b' }}>{r.tier}</span>
              <span style={{ fontSize:'.8rem', fontFamily:'monospace', color:'#475569' }}>{r.cost}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SynapseAnimation() {
  const [view, setView] = useState<'dedicated'|'serverless'|'spark'>('dedicated')
  const items: Record<string,{title:string,props:string[],color:string}> = {
    dedicated:{title:'Dedicated SQL Pool',props:['Pre-allocated DWUs (100–30,000)','Massively Parallel Processing (MPP)','Best for: complex OLAP, consistent perf','$5+/hour when running — pause when idle'],color:'#4f8ef7'},
    serverless:{title:'Serverless SQL Pool',props:['Query files directly on ADLS Gen2','Pay per TB scanned','Best for: ad-hoc exploration, ELT scripts','No infrastructure management'],color:'#8b5cf6'},
    spark:{title:'Spark Pool',props:['Apache Spark — notebook-driven','Auto-scale worker nodes','Best for: ML, big data transforms','Integrates with Delta Lake natively'],color:'#22c55e'},
  }
  const sel = items[view]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Azure Synapse — Compute Engines</div>
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {Object.keys(items).map(k=>(
          <button key={k} onClick={()=>setView(k as typeof view)} style={{ flex:1, padding:'6px 0', borderRadius:8, border:`2px solid ${view===k?items[k].color:'var(--border)'}`, background:view===k?`${items[k].color}15`:'white', fontWeight:700, cursor:'pointer', fontSize:'.75rem', color:view===k?items[k].color:'#94a3b8' }}>{k}</button>
        ))}
      </div>
      <div style={{ padding:14, borderRadius:10, border:`2px solid ${sel.color}44`, background:`${sel.color}0d` }}>
        <div style={{ fontWeight:700, fontSize:'.85rem', color:sel.color, marginBottom:8 }}>{sel.title}</div>
        {sel.props.map(p=><div key={p} style={{ fontSize:'.78rem', color:'#475569', marginBottom:4 }}>• {p}</div>)}
      </div>
    </div>
  )
}

function DatabricksAnimation() {
  const [step, setStep] = useState(0)
  const steps = ['Workspace created','Cluster provisioned (DBR 14.x)','Notebook: read ADLS bronze','Transform & clean in Spark','Write Delta silver layer','Job scheduled via Workflows']
  const colors = ['#4f8ef7','#8b5cf6','#22c55e','#f59e0b','#ec4899','#06b6d4']
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Databricks Pipeline Steps</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
        {steps.slice(0,step+1).map((s,i)=>(
          <div key={s} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${colors[i]}44`, background:`${colors[i]}11`, display:'flex', alignItems:'center', gap:8, animation:'fadeIn .3s ease' }}>
            <span style={{ width:22, height:22, borderRadius:'50%', background:colors[i], display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'.7rem', fontWeight:800, flexShrink:0 }}>{i+1}</span>
            <span style={{ fontSize:'.82rem', fontWeight:600, color:'#1e293b' }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={()=>setStep(s=>Math.min(s+1,steps.length-1))} disabled={step>=steps.length-1} style={{ flex:1, padding:'8px 0', borderRadius:8, border:'none', background:step>=steps.length-1?'#e2e8f0':'#4f8ef7', color:step>=steps.length-1?'#94a3b8':'white', cursor:step>=steps.length-1?'default':'pointer', fontWeight:700, fontSize:'.85rem' }}>Next Step</button>
        <button onClick={()=>setStep(0)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontSize:'.85rem' }}>Reset</button>
      </div>
    </div>
  )
}

function EventHubAnimation() {
  const [tick, setTick] = useState(0)
  useEffect(()=>{const t=setInterval(()=>setTick(n=>n+1),600);return()=>clearInterval(t)},[])
  const partitions = 4
  const msgs = ['order.placed','user.signup','payment.done','click.event','cart.add','order.placed']
  const part = tick % partitions
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Event Hub — Partitioned Streaming</div>
      <div style={{ marginBottom:10, fontSize:'.78rem', color:'var(--text-secondary)' }}>Events hash to partitions by partition key → ordered within partition</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:12 }}>
        {Array.from({length:partitions},(_,i)=>(
          <div key={i} style={{ padding:'8px 6px', borderRadius:8, border:`2px solid ${i===part?'#4f8ef7':'var(--border)'}`, background:i===part?'#eff6ff':'white', textAlign:'center', transition:'all .3s' }}>
            <div style={{ fontSize:'.72rem', fontWeight:700, color:i===part?'#3b82f6':'#94a3b8' }}>P-{i}</div>
            {i===part&&<div style={{ fontSize:'.68rem', color:'#4f8ef7', marginTop:3 }}>{msgs[tick%msgs.length]}</div>}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:10 }}>
        {[['Throughput','1 MB/s/partition'],['Retention','1–7 days'],['Protocol','AMQP / Kafka'],['Scale','1–10000 partitions']].map(([k,v])=>(
          <div key={k} style={{ flex:1, padding:'6px 8px', borderRadius:8, background:'white', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:'.65rem', color:'var(--text-secondary)' }}>{k}</div>
            <div style={{ fontWeight:700, fontSize:'.72rem', color:'#1e293b' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventGridAnimation() {
  const [active, setActive] = useState<number|null>(null)
  const events = [
    {source:'ADLS Gen2',event:'BlobCreated',subscribers:['ADF Trigger','Azure Function','Logic App']},
    {source:'Blob Storage',event:'BlobDeleted',subscribers:['Azure Function','Event Hub']},
    {source:'Custom Topic',event:'pipeline.done',subscribers:['Teams Webhook','Service Bus']},
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Event Grid — Event Routing (Click an event)</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {events.map((e,i)=>(
          <div key={e.event} onClick={()=>setActive(active===i?null:i)} style={{ cursor:'pointer' }}>
            <div style={{ padding:'8px 12px', borderRadius:8, border:`1.5px solid ${active===i?'#4f8ef7':'var(--border)'}`, background:active===i?'#eff6ff':'white', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all .2s' }}>
              <div><span style={{ fontSize:'.72rem', color:'#94a3b8' }}>{e.source} → </span><span style={{ fontWeight:700, fontSize:'.82rem', color:'#1e293b' }}>{e.event}</span></div>
              <span style={{ fontSize:'.72rem', color:'#4f8ef7' }}>{e.subscribers.length} subscribers</span>
            </div>
            {active===i&&(
              <div style={{ marginTop:4, marginLeft:16, display:'flex', gap:6, flexWrap:'wrap' }}>
                {e.subscribers.map(s=><span key={s} style={{ padding:'3px 10px', borderRadius:12, background:'#4f8ef711', border:'1px solid #4f8ef744', fontSize:'.75rem', color:'#3b82f6' }}>→ {s}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ServiceBusAnimation() {
  const [mode, setMode] = useState<'queue'|'topic'>('queue')
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Service Bus — Queue vs Topic</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['queue','topic'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:'.8rem', background:mode===m?'#4f8ef7':'var(--surface-3)', color:mode===m?'white':'var(--text-secondary)' }}>{m}</button>
          ))}
        </div>
      </div>
      {mode==='queue' ? (
        <div>
          <div style={{ fontSize:'.8rem', color:'var(--text-secondary)', marginBottom:10 }}>One consumer receives each message (competing consumers pattern)</div>
          <div style={{ display:'flex', alignItems:'center', gap:0 }}>
            <div style={{ padding:'10px 16px', borderRadius:8, background:'#eff6ff', border:'2px solid #4f8ef7', fontSize:'.82rem', fontWeight:700, color:'#3b82f6' }}>Producer</div>
            <div style={{ flex:1, height:2, background:'#4f8ef7' }}/>
            <div style={{ padding:'10px 12px', borderRadius:8, background:'#f0fdf4', border:'2px solid #22c55e', fontSize:'.78rem', fontWeight:700, color:'#16a34a', textAlign:'center', minWidth:80 }}>Queue</div>
            <div style={{ flex:1, height:2, background:'#22c55e' }}/>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {['Consumer A','Consumer B','Consumer C'].map((c,i)=><div key={c} style={{ padding:'6px 12px', borderRadius:8, background:i===0?'#f0fdf4':'#f8fafc', border:`1px solid ${i===0?'#4ade80':'#e2e8f0'}`, fontSize:'.75rem', fontWeight:700, color:i===0?'#16a34a':'#94a3b8' }}>{c} {i===0?'(receives)':'(idle)'}</div>)}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize:'.8rem', color:'var(--text-secondary)', marginBottom:10 }}>All subscribers receive a copy (pub/sub pattern)</div>
          <div style={{ display:'flex', alignItems:'center', gap:0 }}>
            <div style={{ padding:'10px 16px', borderRadius:8, background:'#eff6ff', border:'2px solid #4f8ef7', fontSize:'.82rem', fontWeight:700, color:'#3b82f6' }}>Producer</div>
            <div style={{ flex:1, height:2, background:'#4f8ef7' }}/>
            <div style={{ padding:'10px 12px', borderRadius:8, background:'#faf5ff', border:'2px solid #8b5cf6', fontSize:'.78rem', fontWeight:700, color:'#7c3aed', textAlign:'center', minWidth:80 }}>Topic</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {['Sub: pipeline-a','Sub: reporting','Sub: audit-log'].map(s=><div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:20, height:2, background:'#8b5cf6' }}/><div style={{ padding:'6px 12px', borderRadius:8, background:'#faf5ff', border:'1px solid #c4b5fd', fontSize:'.72rem', fontWeight:700, color:'#7c3aed' }}>{s}</div></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AzureFunctionsAnimation() {
  const [trigger, setTrigger] = useState<'blob'|'timer'|'http'|'eventhub'>('blob')
  const info: Record<string,{icon:string,desc:string,example:string,color:string}> = {
    blob:{icon:'📂',desc:'Fires when a blob is created/modified in Storage',example:'New file in raw/ → validate + move to bronze/',color:'#4f8ef7'},
    timer:{icon:'⏰',desc:'Cron-based schedule — no event needed',example:'0 */1 * * * → hourly cost report email',color:'#8b5cf6'},
    http:{icon:'🌐',desc:'REST endpoint — scales to zero',example:'POST /api/ingest → queue for processing',color:'#22c55e'},
    eventhub:{icon:'⚡',desc:'Batched events from Event Hub partitions',example:'Consume telemetry → write to Cosmos DB',color:'#f59e0b'},
  }
  const sel = info[trigger]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Azure Functions — Trigger Types</div>
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {Object.keys(info).map(k=>(
          <button key={k} onClick={()=>setTrigger(k as typeof trigger)} style={{ flex:1, padding:'6px 0', borderRadius:8, border:`2px solid ${trigger===k?info[k].color:'var(--border)'}`, background:trigger===k?`${info[k].color}15`:'white', cursor:'pointer', fontWeight:700, fontSize:'.75rem', color:trigger===k?info[k].color:'#94a3b8' }}>{info[k].icon} {k}</button>
        ))}
      </div>
      <div style={{ padding:14, borderRadius:10, border:`2px solid ${sel.color}44`, background:`${sel.color}0d` }}>
        <div style={{ fontSize:'.82rem', fontWeight:700, color:sel.color, marginBottom:6 }}>{sel.desc}</div>
        <div style={{ fontFamily:'monospace', fontSize:'.78rem', color:'#475569', background:'white', padding:'6px 10px', borderRadius:6, border:'1px solid var(--border)' }}>{sel.example}</div>
      </div>
      <div style={{ marginTop:10, fontSize:'.73rem', color:'var(--text-secondary)' }}>⚡ Scales to zero — pay only for executions (first 1M/mo free)</div>
    </div>
  )
}

function StreamAnalyticsAnimation() {
  const [tick, setTick] = useState(0)
  useEffect(()=>{const t=setInterval(()=>setTick(n=>n+1),800);return()=>clearInterval(t)},[])
  const events = ['sensor:42.1°C','sensor:41.9°C','alert:SPIKE 98.5°C','sensor:42.0°C','payment:$120','payment:$85','fraud:SUSPICIOUS $9999']
  const current = events[tick%events.length]
  const isAlert = current.startsWith('alert') || current.startsWith('fraud')
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Stream Analytics — Real-time SQL Processing</div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
        <div style={{ flex:1, padding:'8px 12px', borderRadius:8, background:'#eff6ff', border:'1px solid #93c5fd', fontFamily:'monospace', fontSize:'.8rem', color:'#1e40af' }}>Event Hub → {current}</div>
        <div style={{ fontSize:1.2+'rem' }}>{isAlert?'🚨':'→'}</div>
        <div style={{ flex:1, padding:'8px 12px', borderRadius:8, background:isAlert?'#fef2f2':'#f0fdf4', border:`1px solid ${isAlert?'#f87171':'#4ade80'}`, fontFamily:'monospace', fontSize:'.8rem', color:isAlert?'#ef4444':'#16a34a' }}>{isAlert?'Alert fired → output':'Passes filter → sink'}</div>
      </div>
      <div style={{ background:'#1e293b', borderRadius:8, padding:12 }}>
        <pre style={{ margin:0, color:'#7dd3fc', fontSize:'.75rem' }}>{`SELECT sensor_id, AVG(temp) as avg_temp
INTO alert-output
FROM input TIMESTAMP BY ts
GROUP BY sensor_id, TumblingWindow(minute, 5)
HAVING AVG(temp) > 90`}</pre>
      </div>
    </div>
  )
}

function KeyVaultAnimation() {
  const [mode, setMode] = useState<'store'|'fetch'>('store')
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Azure Key Vault — Secret Management</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['store','fetch'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:'.8rem', background:mode===m?'#4f8ef7':'var(--surface-3)', color:mode===m?'white':'var(--text-secondary)' }}>{m}</button>
          ))}
        </div>
      </div>
      {mode==='store' ? (
        <div>
          {[{bad:'DB_PASSWORD=s3cr3t in .env',good:'DB_PASSWORD → Key Vault secret',color:'#ef4444'},{bad:'SAS token in Airflow config',good:'SAS token → Key Vault, ref by URI',color:'#f59e0b'},{bad:'Service principal key in code',good:'Managed Identity → no secret needed',color:'#8b5cf6'}].map(r=>(
            <div key={r.bad} style={{ display:'flex', gap:6, marginBottom:8, alignItems:'center' }}>
              <div style={{ flex:1, padding:'6px 10px', borderRadius:6, background:'#fef2f2', border:'1px solid #f87171', fontSize:'.72rem', color:'#ef4444', textDecoration:'line-through' }}>{r.bad}</div>
              <span style={{ color:'#22c55e', fontWeight:700 }}>→</span>
              <div style={{ flex:1, padding:'6px 10px', borderRadius:6, background:'#f0fdf4', border:'1px solid #4ade80', fontSize:'.72rem', color:'#16a34a' }}>{r.good}</div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {[{step:'App uses Managed Identity','detail':'No password, no key — Azure handles auth automatically'},{'step':'GET secret URI','detail':'https://myvault.vault.azure.net/secrets/db-password'},{'step':'Key Vault returns secret','detail':'AES-256 encrypted at rest, TLS in transit'},{'step':'Secret never in code/logs','detail':'Rotate in vault → app picks up automatically'}].map(s=>(
            <div key={s.step} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
              <span style={{ padding:'2px 8px', borderRadius:12, background:'#4f8ef7', color:'white', fontSize:'.7rem', fontWeight:700, whiteSpace:'nowrap' }}>{s.step}</span>
              <span style={{ fontSize:'.75rem', color:'var(--text-secondary)', paddingTop:2 }}>{s.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function IdentityAnimation() {
  const [view, setView] = useState<'rbac'|'managed'>('rbac')
  const roles = [
    {name:'Storage Blob Data Reader',perms:'Read blobs only',color:'#22c55e'},
    {name:'Storage Blob Data Contributor',perms:'Read + write blobs',color:'#4f8ef7'},
    {name:'Storage Blob Data Owner',perms:'Full access + ACL',color:'#8b5cf6'},
    {name:'Owner',perms:'Everything incl. IAM',color:'#ef4444'},
  ]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Azure Identity & RBAC</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['rbac','managed'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:'.8rem', background:view===v?'#4f8ef7':'var(--surface-3)', color:view===v?'white':'var(--text-secondary)' }}>{v==='rbac'?'RBAC Roles':'Managed Identity'}</button>
          ))}
        </div>
      </div>
      {view==='rbac' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {roles.map(r=>(
            <div key={r.name} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, border:`1px solid ${r.color}33`, background:`${r.color}0d` }}>
              <span style={{ fontWeight:700, fontSize:'.8rem', color:r.color }}>{r.name}</span>
              <span style={{ fontSize:'.75rem', color:'#475569' }}>{r.perms}</span>
            </div>
          ))}
          <div style={{ fontSize:'.72rem', color:'#64748b', marginTop:4 }}>✓ Least-privilege: assign only what the service needs</div>
        </div>
      ) : (
        <div>
          {[{type:'System-assigned',desc:'Tied to resource lifetime — deleted with resource',icon:'🔗'},{type:'User-assigned',desc:'Standalone — shared across multiple resources',icon:'👤'}].map(m=>(
            <div key={m.type} style={{ padding:12, marginBottom:8, borderRadius:10, border:'1px solid var(--border)', background:'white', display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ fontSize:'1.2rem' }}>{m.icon}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:'.82rem', color:'#1e293b', marginBottom:3 }}>{m.type}</div>
                <div style={{ fontSize:'.75rem', color:'#475569' }}>{m.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize:'.75rem', color:'#16a34a', padding:'6px 10px', borderRadius:8, background:'#f0fdf4', border:'1px solid #4ade80' }}>✓ No credentials stored — Azure handles token rotation automatically</div>
        </div>
      )}
    </div>
  )
}

function MonitorAnimation() {
  const [tab, setTab] = useState<'metrics'|'kql'>('metrics')
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Azure Monitor</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['metrics','kql'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:'.8rem', background:tab===t?'#4f8ef7':'var(--surface-3)', color:tab===t?'white':'var(--text-secondary)' }}>{t==='metrics'?'Metrics':'KQL Query'}</button>
          ))}
        </div>
      </div>
      {tab==='metrics' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {[{metric:'Pipeline Success Rate',val:'98.7%',trend:'↑',color:'#22c55e'},{metric:'Avg Run Duration',val:'4m 32s',trend:'↓',color:'#4f8ef7'},{metric:'Failed Runs (24h)',val:'3',trend:'→',color:'#ef4444'},{metric:'Data Processed',val:'847 GB',trend:'↑',color:'#8b5cf6'}].map(m=>(
            <div key={m.metric} style={{ padding:'10px 12px', borderRadius:8, border:`1px solid ${m.color}33`, background:`${m.color}0d` }}>
              <div style={{ fontSize:'.7rem', color:'#64748b', marginBottom:3 }}>{m.metric}</div>
              <div style={{ fontWeight:900, fontSize:'1.1rem', color:m.color }}>{m.val} <span style={{ fontSize:'.8rem' }}>{m.trend}</span></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background:'#1e293b', borderRadius:8, padding:12 }}>
          <pre style={{ margin:0, color:'#7dd3fc', fontSize:'.78rem' }}>{`// KQL: find slow ADF pipeline runs
ADFActivityRun
| where TimeGenerated > ago(24h)
| where Status == "Succeeded"
| summarize AvgDuration=avg(Duration)
    by PipelineName
| order by AvgDuration desc
| take 10`}</pre>
        </div>
      )}
    </div>
  )
}

function CosmosAnimation() {
  const [api, setApi] = useState<'nosql'|'mongo'|'table'>('nosql')
  const items: Record<string,{title:string,model:string,qs:string,use:string,color:string}> = {
    nosql:{title:'Core (NoSQL)',model:'JSON documents with partition key',qs:'SQL-like: SELECT * FROM c WHERE c.user_id = "42"',use:'Events, sessions, product catalog',color:'#4f8ef7'},
    mongo:{title:'MongoDB API',model:'BSON documents + Atlas-compatible',qs:'db.events.find({type:"purchase"})',use:'Lift & shift MongoDB apps',color:'#22c55e'},
    table:{title:'Table API',model:'Key-value: PartitionKey + RowKey',qs:'TableClient.get_entity(pk, rk)',use:'Simple lookups, IoT metadata',color:'#f59e0b'},
  }
  const sel = items[api]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Cosmos DB — API Selection</div>
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {Object.keys(items).map(k=>(
          <button key={k} onClick={()=>setApi(k as typeof api)} style={{ flex:1, padding:'6px 0', borderRadius:8, border:`2px solid ${api===k?items[k].color:'var(--border)'}`, background:api===k?`${items[k].color}15`:'white', cursor:'pointer', fontWeight:700, fontSize:'.75rem', color:api===k?items[k].color:'#94a3b8' }}>{items[k].title}</button>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {[['Data Model',sel.model],['Query',sel.qs],['Best for',sel.use]].map(([k,v])=>(
          <div key={k} style={{ padding:'8px 12px', borderRadius:8, background:'white', border:'1px solid var(--border)', display:'flex', gap:10 }}>
            <span style={{ fontSize:'.72rem', color:'#64748b', minWidth:70 }}>{k}</span>
            <span style={{ fontSize:'.78rem', color:'#1e293b', fontFamily:'monospace' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AzureSQLAnimation() {
  const [view, setView] = useState<'tiers'|'dtu'>('tiers')
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:'.9rem' }}>Azure SQL Database</div>
        <div style={{ display:'flex', gap:6 }}>
          {(['tiers','dtu'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'4px 12px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:'.8rem', background:view===v?'#4f8ef7':'var(--surface-3)', color:view===v?'white':'var(--text-secondary)' }}>{v==='tiers'?'Service Tiers':'DTU vs vCore'}</button>
          ))}
        </div>
      </div>
      {view==='tiers' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[{tier:'Basic',vcore:'5 DTU',storage:'2 GB',price:'$5/mo',color:'#94a3b8'},{tier:'Standard',vcore:'10–3000 DTU',storage:'250 GB',price:'$15+/mo',color:'#4f8ef7'},{tier:'Premium',vcore:'125–4000 DTU',storage:'1 TB',price:'$465+/mo',color:'#8b5cf6'},{tier:'Business Critical',vcore:'2–80 vCore',storage:'4 TB',price:'In-memory OLTP',color:'#22c55e'}].map(r=>(
            <div key={r.tier} style={{ display:'flex', gap:8, padding:'8px 12px', borderRadius:8, border:`1px solid ${r.color}33`, background:`${r.color}0d` }}>
              <span style={{ minWidth:120, fontWeight:700, fontSize:'.8rem', color:r.color }}>{r.tier}</span>
              <span style={{ fontSize:'.75rem', color:'#475569', flex:1 }}>{r.vcore} · {r.storage} · {r.price}</span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {[{model:'DTU',desc:'Blended CPU + IO + memory unit — simple, less control',use:'Dev/test, small workloads',color:'#f59e0b'},{model:'vCore',desc:'Explicit vCPUs + RAM — maps to on-prem specs',use:'Production, cost control, Azure Hybrid Benefit',color:'#4f8ef7'}].map(m=>(
            <div key={m.model} style={{ padding:12, marginBottom:8, borderRadius:10, border:`2px solid ${m.color}44`, background:`${m.color}0d` }}>
              <div style={{ fontWeight:700, fontSize:'.85rem', color:m.color, marginBottom:4 }}>{m.model} model</div>
              <div style={{ fontSize:'.75rem', color:'#475569', marginBottom:4 }}>{m.desc}</div>
              <div style={{ fontSize:'.72rem', color:'#64748b' }}>Best for: {m.use}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DevOpsAnimation() {
  const [step, setStep] = useState(0)
  const pipeline = [
    {stage:'Source',detail:'git push → triggers pipeline',color:'#4f8ef7'},
    {stage:'Build',detail:'Docker build, pytest, mypy',color:'#8b5cf6'},
    {stage:'Test',detail:'Integration tests against dev DB',color:'#22c55e'},
    {stage:'Stage',detail:'Deploy to staging AKS namespace',color:'#f59e0b'},
    {stage:'Gate',detail:'Manual approval required',color:'#f97316'},
    {stage:'Prod',detail:'Blue-green deploy to production',color:'#ec4899'},
  ]
  useEffect(()=>{
    const t = setInterval(()=>setStep(s=>(s+1)%(pipeline.length+1)),900)
    return()=>clearInterval(t)
  },[])
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Azure DevOps CI/CD Pipeline</div>
      <div style={{ display:'flex', alignItems:'center', gap:4, overflowX:'auto', paddingBottom:8 }}>
        {pipeline.map((p,i)=>(
          <div key={p.stage} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ padding:'8px 10px', borderRadius:8, border:`2px solid ${i<step?p.color:'var(--border)'}`, background:i<step?`${p.color}15`:'white', textAlign:'center', minWidth:70, transition:'all .5s' }}>
              <div style={{ fontSize:'.72rem', fontWeight:700, color:i<step?p.color:'#94a3b8' }}>{p.stage}</div>
              {i===step-1&&<div style={{ fontSize:'.6rem', color:p.color, marginTop:2 }}>▶ running</div>}
              {i<step-1&&<div style={{ fontSize:'.65rem', color:'#22c55e', marginTop:2 }}>✓</div>}
            </div>
            {i<pipeline.length-1&&<div style={{ width:12, height:2, background:i<step?pipeline[i+1].color:'#e2e8f0', transition:'background .5s', flexShrink:0 }}/>}
          </div>
        ))}
      </div>
    </div>
  )
}

function TerraformAnimation() {
  const [step, setStep] = useState<'init'|'plan'|'apply'|'destroy'>('init')
  const steps = ['init','plan','apply','destroy'] as const
  const info: Record<string,{desc:string,output:string,color:string}> = {
    init:{desc:'Download providers, initialize backend',output:'Initializing provider plugins...\n✓ Installed azurerm v3.85.0\n✓ Terraform initialized',color:'#4f8ef7'},
    plan:{desc:'Show what will be created/changed/destroyed',output:'Plan: 3 to add, 1 to change, 0 to destroy\n+ azurerm_resource_group.de_rg\n+ azurerm_storage_account.adls\n~ azurerm_databricks_workspace.ws',color:'#8b5cf6'},
    apply:{desc:'Execute the plan — create/update resources',output:'azurerm_resource_group.de_rg: Creating...\nazurerm_storage_account.adls: Creating...\nApply complete! Resources: 3 added',color:'#22c55e'},
    destroy:{desc:'Tear down all managed resources',output:'Plan: 0 to add, 0 to change, 3 to destroy\nDestroy complete! Resources: 3 destroyed',color:'#ef4444'},
  }
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Terraform Lifecycle</div>
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {steps.map(s=>(
          <button key={s} onClick={()=>setStep(s)} style={{ flex:1, padding:'6px 0', borderRadius:8, border:`2px solid ${step===s?info[s].color:'var(--border)'}`, background:step===s?`${info[s].color}15`:'white', cursor:'pointer', fontWeight:700, fontSize:'.82rem', color:step===s?info[s].color:'#94a3b8' }}>terraform {s}</button>
        ))}
      </div>
      <div style={{ fontSize:'.78rem', color:'var(--text-secondary)', marginBottom:8 }}>{info[step].desc}</div>
      <div style={{ background:'#0f172a', borderRadius:8, padding:12 }}>
        <pre style={{ margin:0, color:info[step].color, fontSize:'.75rem', whiteSpace:'pre-wrap' }}>{info[step].output}</pre>
      </div>
    </div>
  )
}

function CostAnimation() {
  const [resource, setResource] = useState('databricks')
  const costs: Record<string,{monthly:string,tips:string[],color:string}> = {
    databricks:{monthly:'$500–$5000+',tips:['Auto-terminate clusters after 30m idle','Use spot instances for non-critical jobs','Cluster pools reuse warm VMs','Reserved instances: up to 63% discount'],color:'#f59e0b'},
    synapse:{monthly:'$200–$3000+',tips:['Pause dedicated pool when not running','Use serverless for ad-hoc queries','Compression reduces data scanned cost','Auto-pause: saves 70%+ in dev envs'],color:'#4f8ef7'},
    eventhub:{monthly:'$10–$500+',tips:['Choose right throughput units','Capture to ADLS to avoid re-reads','Standard vs Premium: 10x price difference','Delete old consumer groups'],color:'#22c55e'},
    adls:{monthly:'$20–$500+',tips:['Lifecycle policies tier old data to archive','ZRS vs LRS: 3x price for redundancy','Soft delete has a retention cost','Minimize cross-region egress'],color:'#8b5cf6'},
  }
  const sel = costs[resource]
  return (
    <div className="anim-wrap" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:20, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12, fontSize:'.9rem' }}>Azure Cost Optimization</div>
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {Object.keys(costs).map(r=>(
          <button key={r} onClick={()=>setResource(r)} style={{ flex:1, padding:'6px 0', borderRadius:8, border:`2px solid ${resource===r?costs[r].color:'var(--border)'}`, background:resource===r?`${costs[r].color}15`:'white', cursor:'pointer', fontWeight:700, fontSize:'.72rem', color:resource===r?costs[r].color:'#94a3b8', textTransform:'capitalize' }}>{r}</button>
        ))}
      </div>
      <div style={{ padding:'8px 14px', borderRadius:8, background:`${sel.color}11`, border:`1px solid ${sel.color}44`, marginBottom:10 }}>
        <span style={{ fontSize:'.72rem', color:'#64748b' }}>Typical monthly cost: </span>
        <span style={{ fontWeight:800, fontSize:'.9rem', color:sel.color }}>{sel.monthly}</span>
      </div>
      {sel.tips.map(t=>(
        <div key={t} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'flex-start' }}>
          <span style={{ color:'#22c55e', flexShrink:0 }}>💡</span>
          <span style={{ fontSize:'.78rem', color:'#1e293b' }}>{t}</span>
        </div>
      ))}
    </div>
  )
}

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

export default function Azure({ completed, onComplete, onUnmark, onSignInNeeded }: Props) {
  const [activeId, setActiveId] = useState('az-fundamentals')
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
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
            • "Walk me through the Azure resource hierarchy"<br/>
            • "How does RBAC inheritance work in Azure?"<br/>
            • "What is the difference between a subscription and a resource group?"<br/>
            • "How would you enforce tagging across all Azure resources in an org?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
            Does the candidate understand governance at scale — scoping RBAC tightly, using Policy for enforcement, structuring subscriptions for cost isolation — or do they just recite "Management Group → Subscription → Resource Group → Resource"?
            </div>
          </div>

          <p>In production, the resource hierarchy is how you implement governance at scale. The reason most cloud platforms have runaway costs or security gaps is that RBAC assignments are made too broadly — at subscription level — and no one enforces tagging. The right pattern is: Management Groups for org-wide policy (e.g., "no public internet for storage accounts"), Subscriptions as cost and blast-radius boundaries per team or environment, Resource Groups as the unit of lifecycle (everything in the same RG is deployed and deleted together). Azure Policy enforces standards automatically; RBAC assigns least-privilege roles at the narrowest scope possible.</p>

          <AzureArchitectureDiagram />
          <AzureArchitectureAnimation />

          <table>
            <thead><tr><th>Step</th><th>What to say in 60 seconds</th></tr></thead>
            <tbody>
              <tr><td>1. Define the hierarchy</td><td>"Azure has four levels: Management Groups contain Subscriptions, Subscriptions contain Resource Groups, Resource Groups contain Resources. RBAC and Policy flow downward."</td></tr>
              <tr><td>2. Explain inheritance</td><td>"A role assigned at Management Group level is inherited by every Subscription, Resource Group, and Resource beneath it. Deny assignments override Allow."</td></tr>
              <tr><td>3. Production concern</td><td>"In prod we assign RBAC at the Resource Group or individual Resource scope, not Subscription, to enforce least privilege. We use Azure Policy at Management Group level to enforce tags and prevent misconfigurations."</td></tr>
              <tr><td>4. Cost isolation</td><td>"Each environment — dev, staging, prod — gets its own Subscription so cost and blast radius are isolated. Cost alerts are set per Subscription."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
            • ASOS (UK fashion): 200+ Azure subscriptions organised into Management Groups by brand/region; enforcing 40+ Azure Policy definitions centrally reduced misconfigured storage accounts by 90%.<br/>
            • Shell: uses Landing Zone architecture with dedicated subscriptions per business unit; RBAC at Resource Group scope ensures data teams cannot accidentally modify networking infrastructure.<br/>
            • NHS England: Management Group hierarchy separates clinical from non-clinical workloads with deny-by-default policies blocking public IPs on any storage account across all 80+ subscriptions.
            </div>
          </div>

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
              question: "You need to block creation of storage accounts with public internet access across all 50 subscriptions in your organisation. What is the most scalable approach?",
              options: [
                "Assign a deny RBAC role to each subscription individually",
                "Manually audit each subscription weekly with az CLI scripts",
                "Apply an Azure Policy deny effect at the Management Group level — it propagates to all child subscriptions automatically",
                "Set a Resource Lock on each storage account after creation"
              ],
              correct: 2
            },
            {
              question: "Which credential type should a production Databricks cluster use to access ADLS Gen2 without storing secrets in code?",
              options: [
                "Storage account key in spark config",
                "Managed Identity (system-assigned or user-assigned)",
                "SAS token hardcoded in notebook",
                "Service Principal credentials in environment variables"
              ],
              correct: 1
            }
          ]} />

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I create resource groups to organise resources"</td><td>"Resource groups are lifecycle boundaries — everything in a group is deployed, managed, and deleted together. I structure them around application components, not team names."</td></tr>
              <tr><td>"I assign the Contributor role at subscription level for convenience"</td><td>"Contributor at subscription scope is too broad. I assign the minimum required built-in role at Resource Group or Resource scope and use custom roles only when built-in roles grant excess permissions."</td></tr>
              <tr><td>"I use Azure Policy to check compliance reports"</td><td>"Azure Policy in deny mode is a guardrail, not an audit tool — it prevents misconfigurations from being created at all. Audit mode is only for visibility; deny mode is what enforces standards."</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Assign RBAC at the narrowest scope needed (Resource Group or Resource)</li>
                <li>Use Management Groups and Azure Policy for org-wide guardrails</li>
                <li>Use separate Subscriptions per environment for cost and blast-radius isolation</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Assign Owner or Contributor at Subscription scope for everyday work</li>
                <li>Store credentials in code — use Managed Identity or Key Vault references</li>
                <li>Mix prod and dev resources in the same Resource Group</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-fundamentals')) { await unmarkTopicComplete('az-fundamentals'); onUnmark('az-fundamentals') } else { await markTopicComplete('az-fundamentals'); onComplete('az-fundamentals') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-fundamentals') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-fundamentals') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-adls ───────────────────────────────────────────── */}
        <section id="az-adls" ref={el => { if (el) sectionRefs.current['az-adls'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">ADLS Gen2</h1>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
            • "Why use ADLS Gen2 instead of plain Blob Storage for a data lake?"<br/>
            • "What is Hierarchical Namespace and why does it matter for Spark?"<br/>
            • "How do you control access to folders in ADLS?"<br/>
            • "Walk me through the Bronze/Silver/Gold layer structure on ADLS"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
            Does the candidate understand why HNS makes ADLS Gen2 a proper data lake (not just object storage) — specifically the atomic rename semantics that Spark depends on — or do they just say "it's like S3 on Azure"?
            </div>
          </div>

          <p>In production, the choice of ADLS Gen2 over plain Blob Storage is not cosmetic — it is architectural. The reason is Hierarchical Namespace. Without HNS, "renaming a directory" in Blob Storage is a multi-step copy-then-delete operation. If it fails halfway, your data is partially corrupted. Spark relies on atomic directory renames for its commit protocol: it writes output to a staging directory, then atomically renames it into the final path to ensure either all data is there or none of it is. With HNS, that rename is a single metadata operation. At scale, HNS is also 3× faster for directory-level operations. Add POSIX-style ACLs for folder-level permissions and you have a proper multi-team data lake.</p>

          <ADLSDiagram />
          <ADLSAnimation />

          <table>
            <thead><tr><th>Step</th><th>What to say in 60 seconds</th></tr></thead>
            <tbody>
              <tr><td>1. Distinguish from Blob</td><td>"ADLS Gen2 is Blob Storage with Hierarchical Namespace enabled. Without HNS you get flat object storage. With HNS you get true directories with atomic renames — which is what Spark needs."</td></tr>
              <tr><td>2. Explain the critical property</td><td>"HNS makes directory rename an O(1) atomic metadata operation. Without it, Spark's write-commit protocol is unreliable at scale."</td></tr>
              <tr><td>3. Access control</td><td>"ADLS supports both RBAC at the container level and POSIX ACLs at the folder/file level. In practice we use RBAC for coarse access and ACLs for fine-grained per-folder permissions."</td></tr>
              <tr><td>4. Storage tiers</td><td>"We put hot active pipeline data in the hot tier, move data older than 30 days to cool automatically via lifecycle policies, and archive compliance data after 180 days."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
            • Booking.com: ADLS Gen2 with HNS stores 3+ petabytes of clickstream data partitioned by date/event_type; atomic renames allow 500+ daily Spark jobs to write concurrently without data corruption.<br/>
            • Vodafone UK: medallion architecture (bronze/silver/gold) on ADLS Gen2 with POSIX ACLs — data science teams have read access to silver, only data engineers write to bronze, reducing data governance incidents by 70%.<br/>
            • ASOS: lifecycle management policies automatically tier 18-month-old order data to Archive tier, saving £200k/year in storage costs vs keeping everything hot.
            </div>
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
              question: "A Spark job writes output to a staging directory then atomically renames it to the final path. Which ADLS Gen2 capability makes this safe and O(1)?",
              options: [
                "Hierarchical Namespace (HNS) makes directory rename a single metadata operation",
                "Blob versioning tracks each write and rolls back on failure",
                "Soft-delete protects against accidental overwrites",
                "Zone-redundant storage ensures the rename survives datacenter failure"
              ],
              correct: 0
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

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I use Blob Storage for my data lake"</td><td>"Blob Storage without HNS doesn't support atomic directory renames, which breaks Spark's commit protocol. For a real data lake with Spark or Databricks, ADLS Gen2 with HNS is non-negotiable."</td></tr>
              <tr><td>"I control access with the storage account key"</td><td>"Storage account keys grant full access to everything. In prod I use RBAC roles (Storage Blob Data Contributor) for coarse-grained access and POSIX ACLs at the folder level for fine-grained per-team permissions."</td></tr>
              <tr><td>"I keep all data in hot tier to avoid retrieval delays"</td><td>"Hot tier at scale is expensive. I use lifecycle policies to auto-tier: hot for the last 30 days, cool for 30–90 days, archive beyond 180 days. The cost difference is 18× between hot and archive."</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Always enable HNS when creating storage accounts for Spark/Databricks</li>
                <li>Use abfss:// (secure) protocol, not wasbs://</li>
                <li>Set lifecycle policies to auto-tier aging data</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use plain Blob Storage (no HNS) for Spark workloads</li>
                <li>Authenticate with storage account keys in production code</li>
                <li>Store all data in hot tier without lifecycle management</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-adls')) { await unmarkTopicComplete('az-adls'); onUnmark('az-adls') } else { await markTopicComplete('az-adls'); onComplete('az-adls') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-adls') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-adls') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-blob ───────────────────────────────────────────── */}
        <section id="az-blob" ref={el => { if (el) sectionRefs.current['az-blob'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Blob Storage</h1>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
            • "What are the different blob types and when would you use each?"<br/>
            • "How do SAS tokens work and what's the risk with them?"<br/>
            • "What's the difference between GRS and RA-GRS?"<br/>
            • "How would you give a partner company time-limited read access to your blob data?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
            Does the candidate understand the security tradeoffs of SAS tokens (hard to revoke account-key SAS without rotating the key, user-delegation SAS is revocable) or do they just know "SAS is a temporary URL"?
            </div>
          </div>

          <p>In production, SAS tokens are a necessary evil for delegated access — a partner needs to upload files, an external app needs to read blobs. The reason account-key-based SAS tokens are dangerous is that revoking them requires rotating the storage account key, which breaks everything else using that key. The modern approach is User Delegation SAS: backed by AAD credentials, scoped to specific permissions, and revocable by deleting the delegation key. The three blob types matter for different workloads: block blobs for normal files, append blobs for log streams (append-only), page blobs for VM disks (random read/write).</p>

          <BlobDiagram />
          <BlobAnimation />

          <table>
            <thead><tr><th>Step</th><th>What to say in 60 seconds</th></tr></thead>
            <tbody>
              <tr><td>1. Name the blob types</td><td>"Block blobs for general files (Parquet, JSON, images). Append blobs for log streams — they only support appending, not overwriting. Page blobs for VM disks — support random read/write."</td></tr>
              <tr><td>2. Explain SAS</td><td>"SAS tokens grant time-limited, scoped access without sharing credentials. Account-key SAS is hard to revoke. User Delegation SAS uses AAD and can be revoked by deleting the delegation key."</td></tr>
              <tr><td>3. Replication</td><td>"LRS = 3 copies in one datacenter. ZRS = 3 copies across AZs. GRS = LRS plus async replication to a paired region. RA-GRS = GRS plus read access to the secondary before failover."</td></tr>
              <tr><td>4. Access tiers</td><td>"Hot for active data, Cool for infrequently accessed (saves 40% storage cost, higher read cost), Archive for long-term retention (requires 1–15 hours to rehydrate before reading)."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
            • Unilever: uses GRS-replicated blob storage for 5TB+ daily marketing image assets; RA-GRS enables failover reads from secondary region within 30 minutes of a regional outage.<br/>
            • NHS Digital: append blobs capture audit trails from 50+ clinical systems; append-only semantics provide tamper-evident logs required for NHS compliance frameworks.<br/>
            • Booking.com: user-delegation SAS tokens with 1-hour expiry are generated per API request for partner hotel chains uploading property images; no storage account key is ever exposed.
            </div>
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
                "GRS uses synchronous replication while RA-GRS uses asynchronous replication",
                "GRS replicates to a secondary region but secondary is only readable after failover; RA-GRS allows reading from secondary at any time",
                "GRS is for blobs only while RA-GRS supports all storage types"
              ],
              correct: 2
            },
            {
              question: "Why is a User Delegation SAS preferred over an Account Key SAS for giving partners temporary blob access?",
              options: [
                "User Delegation SAS tokens last longer by default",
                "User Delegation SAS uses AAD credentials — revoking the delegation key invalidates all tokens derived from it, without rotating the storage account key which would break all other consumers",
                "User Delegation SAS is faster to generate at scale",
                "User Delegation SAS tokens have no expiry and self-expire on access revocation"
              ],
              correct: 1
            }
          ]} />

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I generate a SAS token for external access"</td><td>"I generate a User Delegation SAS backed by AAD, scoped to read-only on the specific container, with a 1-hour expiry and IP restriction. Account-key SAS is only used in dev because revoking it requires rotating the storage key."</td></tr>
              <tr><td>"I use LRS because it's cheaper"</td><td>"LRS is fine for dev/staging. Production data that must survive a regional outage needs ZRS (within-region AZ failure) or GRS (full region failure). The cost premium for ZRS is ~25% — worth it for any data that would be expensive to reconstruct."</td></tr>
              <tr><td>"I use block blobs for everything"</td><td>"Block blobs for data files, yes. But for log streaming where you're appending millions of lines, append blobs are semantically correct and prevent accidental overwrites — which is important for compliance audit trails."</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use User Delegation SAS for external partners; restrict by IP and expiry</li>
                <li>Use ZRS or GRS for production data that cannot be reconstructed</li>
                <li>Use append blobs for streaming log capture and audit trails</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use account-key-based SAS in production — revocation requires key rotation</li>
                <li>Grant container-level write SAS when only blob-level read is needed</li>
                <li>Use LRS for production data without understanding the recovery implications</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-blob')) { await unmarkTopicComplete('az-blob'); onUnmark('az-blob') } else { await markTopicComplete('az-blob'); onComplete('az-blob') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-blob') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-blob') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-adf ────────────────────────────────────────────── */}
        <section id="az-adf" ref={el => { if (el) sectionRefs.current['az-adf'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Data Factory</h1>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
            • "How would you ingest data from an on-premises SQL Server into Azure?"<br/>
            • "What's the difference between ADF triggers — when would you use each?"<br/>
            • "How do you handle incremental loads in ADF?"<br/>
            • "When would you use a Mapping Data Flow vs calling Databricks from ADF?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
            Does the candidate understand the integration runtime architecture (Azure IR vs Self-hosted IR vs SSIS IR) and how triggers affect backfill and exactly-once semantics — or do they just say "ADF is a drag-and-drop ETL tool"?
            </div>
          </div>

          <p>In production, ADF is the glue layer between systems — not the compute engine. The reason we use ADF for orchestration and Databricks for heavy transformation is that ADF excels at connectivity (90+ connectors), scheduling, dependency management, and monitoring, while Databricks excels at distributed compute. The Tumbling Window trigger is the most important concept to understand: unlike a schedule trigger, it has a definite window start/end time, guarantees exactly-once execution per window, and enables backfill — you can re-run historical windows without re-running everything. For on-premises connectivity, the Self-hosted Integration Runtime creates an outbound HTTPS tunnel from your network to ADF, meaning zero inbound firewall rules needed.</p>

          <ADFDiagram />
          <ADFPipelineAnimation />

          <table>
            <thead><tr><th>Step</th><th>What to say in 60 seconds</th></tr></thead>
            <tbody>
              <tr><td>1. Explain the components</td><td>"ADF has Linked Services (connection strings), Datasets (schema + format), Activities (copy, transform, call), and Pipelines (orchestrate activities). Triggers fire pipelines."</td></tr>
              <tr><td>2. Distinguish trigger types</td><td>"Schedule runs at a fixed time but has no concept of a processing window. Tumbling Window has explicit window start/end — enabling exactly-once semantics and historical backfill. Event trigger fires on blob creation."</td></tr>
              <tr><td>3. Integration Runtime</td><td>"Azure IR for cloud-to-cloud. Self-hosted IR for on-premises — install on a VM in your network, it makes outbound HTTPS to ADF, no inbound firewall rules. For HA, run SHIR on 2+ nodes."</td></tr>
              <tr><td>4. ADF vs Databricks</td><td>"ADF for orchestration and data movement. Databricks or Synapse Spark for heavy transformations. Mapping Data Flows are code-free Spark but have limited expressiveness — use them for simple ELT, not complex ML pipelines."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
            • Shell: ADF orchestrates 200+ pipelines per day ingesting data from 40 on-premises Oracle and SAP systems via Self-hosted IR; Tumbling Window triggers with 1-hour windows allow backfilling 6 months of missed data in under 4 hours.<br/>
            • HSBC: ADF Copy activity with 32 DIUs achieves 2.4 GB/s ingestion from Azure SQL into ADLS; ForEach activity parallelises across 120 tables simultaneously.<br/>
            • Marks & Spencer: ADF blob event trigger fires within 15 seconds of new POS data landing in raw storage, triggering Databricks bronze processing — reducing daily batch processing latency from 4 hours to 20 minutes.
            </div>
          </div>

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
              question: "Your daily pipeline missed 3 days of data due to a bug. Which ADF trigger type lets you reprocess those specific 3 days without re-running all other days?",
              options: [
                "Schedule trigger — rerun by adjusting the schedule start time",
                "Custom Events trigger — publish a manual event for each missed day",
                "Storage Event trigger — re-land the source files to trigger the pipeline",
                "Tumbling Window trigger — it has explicit window boundaries and supports targeted backfill of specific windows"
              ],
              correct: 3
            },
            {
              question: "You need to connect ADF to an on-premises Oracle database behind a corporate firewall. The security team prohibits inbound connections. What Integration Runtime type should you use?",
              options: [
                "Self-hosted Integration Runtime — installed on-premises, makes outbound HTTPS to ADF, requires no inbound firewall rules",
                "Azure Integration Runtime in the same VNet",
                "Azure SSIS Integration Runtime",
                "Managed Virtual Network Integration Runtime"
              ],
              correct: 0
            },
            {
              question: "In ADF, what does setting 'dataIntegrationUnits' (DIUs) on a Copy activity control?",
              options: [
                "The number of parallel ForEach iterations",
                "The number of retry attempts on failure",
                "The number of partitions read from the source",
                "The amount of cloud compute power (CPU/memory/network bandwidth) allocated to the copy operation — more DIUs means faster throughput at higher cost"
              ],
              correct: 3
            }
          ]} />

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I use ADF for all my data transformations"</td><td>"ADF is the orchestrator, not the compute engine. I use Copy activities and Mapping Data Flows for simple ELT, but for complex business logic, ML feature engineering, or large-scale transforms I call Databricks notebooks or Synapse Spark from ADF as an activity."</td></tr>
              <tr><td>"I use a schedule trigger to run my pipeline daily"</td><td>"Schedule triggers have no concept of a processing window — if they fail, you don't know which data was missed. Tumbling Window triggers give each run an explicit window start/end, guarantee exactly-once execution, and enable precise backfill."</td></tr>
              <tr><td>"I store the connection string in the linked service"</td><td>"Linked services should reference Key Vault for credentials — never store connection strings in plaintext in ADF. I use the Key Vault reference syntax in linked service definitions and give ADF's managed identity Key Vault Secrets User role."</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use Tumbling Window triggers for batch pipelines needing backfill capability</li>
                <li>Reference Key Vault secrets in Linked Services rather than storing them inline</li>
                <li>Use Self-hosted IR for on-premises sources; run 2+ nodes for HA</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use ADF Mapping Data Flows for complex Python/ML logic — use Databricks instead</li>
                <li>Use Schedule triggers for data pipelines that need exactly-once guarantees</li>
                <li>Store credentials directly in Linked Service JSON definitions</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-adf')) { await unmarkTopicComplete('az-adf'); onUnmark('az-adf') } else { await markTopicComplete('az-adf'); onComplete('az-adf') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-adf') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-adf') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-synapse ────────────────────────────────────────── */}
        <section id="az-synapse" ref={el => { if (el) sectionRefs.current['az-synapse'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Synapse Analytics</h1>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
            • "When would you use Synapse Dedicated SQL Pool vs Serverless SQL Pool?"<br/>
            • "What is DWU and how does it affect query performance?"<br/>
            • "How does data distribution work in a Dedicated SQL Pool?"<br/>
            • "We have a Power BI team running heavy aggregation queries — what Synapse feature helps?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
            Does the candidate understand when Dedicated SQL Pool is worth its always-on cost vs when Serverless is more appropriate — and can they explain distribution strategies (HASH vs REPLICATE vs ROUND_ROBIN) and why the wrong choice causes data skew?
            </div>
          </div>

          <p>In production, the single most common Synapse mistake is using Dedicated SQL Pool for everything. The reason Dedicated Pool is expensive ($5+/hour for DW100c) is that it provisions a fixed MPP cluster whether you query or not. The correct pattern: Dedicated Pool for consistent, high-frequency BI workloads where sub-second latency matters; Serverless Pool for ad-hoc exploration (you pay per TB scanned, ~$5/TB); Spark Pool for complex transformations and Delta Lake. For Dedicated Pool, distribution strategy is critical — wrong distribution (ROUND_ROBIN on a join column) causes data shuffle across all 60 nodes, turning a 10-second query into a 5-minute one.</p>

          <SynapseDiagram />
          <SynapseAnimation />

          <table>
            <thead><tr><th>Step</th><th>What to say in 60 seconds</th></tr></thead>
            <tbody>
              <tr><td>1. Name the three engines</td><td>"Dedicated SQL Pool = MPP with provisioned DWUs, always-on cost. Serverless SQL Pool = pay-per-TB-scanned, query ADLS directly. Spark Pool = Apache Spark for complex transforms and ML."</td></tr>
              <tr><td>2. Distribution strategies</td><td>"HASH distributes rows by a column value to the same node — enables co-located joins without shuffle. REPLICATE copies a small table to every node. ROUND_ROBIN spreads rows evenly — use for staging only."</td></tr>
              <tr><td>3. When to use Dedicated</td><td>"Dedicated Pool is only worth it for consistent workloads — 100+ users running structured BI queries daily. Pause it when not in use to avoid idle cost. One DWU ≈ 60 compute nodes, scales from 100 to 30,000."</td></tr>
              <tr><td>4. Result set caching</td><td>"For repeated identical dashboard queries, enable result set caching on the database — subsequent identical queries return in milliseconds from cache at zero DWU cost."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
            • Telefónica: Synapse Dedicated SQL Pool at DW2000c serves 300+ Power BI users with sub-2-second P99 query latency on a 10TB fact table; HASH distribution on customer_id reduced shuffle-heavy queries by 80%.<br/>
            • Rolls-Royce: Serverless SQL Pool with OPENROWSET queries 500GB+ of IoT sensor data in ADLS daily; cost is $2.50/day vs $200+/day for equivalent Dedicated Pool — 98% cost saving for ad-hoc analysis.<br/>
            • Nationwide Building Society: result set caching on their top 50 regulatory dashboard queries reduced Dedicated Pool DWU consumption by 40%, saving £15k/month.
            </div>
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
                "Result Set Caching — stores query results; subsequent identical queries return from cache at zero DWU cost",
                "Clustered Columnstore Index",
                "Workload Management"
              ],
              correct: 1
            },
            {
              question: "You have a 200 GB dimension table joined to a 10 TB fact table in a Dedicated SQL Pool. The join key is customer_id. Which distribution strategy on the dimension table avoids all data shuffle?",
              options: [
                "HASH on customer_id — same key goes to same node as the fact table",
                "ROUND_ROBIN — spreads data evenly across nodes",
                "REPLICATE — copies the full dimension table to every compute node, eliminating cross-node shuffle entirely",
                "PARTITION on customer_id — creates physical partitions matching fact table"
              ],
              correct: 2
            },
            {
              question: "A data analyst needs to explore raw Parquet files in ADLS without provisioning infrastructure. Cost must be proportional to data scanned. Which Synapse option is correct?",
              options: [
                "Dedicated SQL Pool with external tables — fixed DWU cost regardless of query volume",
                "Serverless SQL Pool with OPENROWSET — pay ~$5/TB scanned, zero infrastructure",
                "Spark Pool with DataFrames — requires cluster provisioning and startup time",
                "Azure Data Factory mapping data flow — not a query interface"
              ],
              correct: 1
            }
          ]} />

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I provision a Dedicated SQL Pool for all analytics"</td><td>"Dedicated Pool at DW1000c costs $120+/day whether you query or not. I use Dedicated Pool only for consistent BI workloads with SLA requirements, and Serverless Pool for ad-hoc exploration at $5/TB. I always pause Dedicated Pool on a schedule when unused."</td></tr>
              <tr><td>"I use ROUND_ROBIN distribution by default"</td><td>"ROUND_ROBIN is only for staging tables with no join requirements. For fact tables I use HASH on the join key to co-locate rows — this eliminates the MPP data shuffle that causes 90% of Dedicated Pool query performance problems."</td></tr>
              <tr><td>"I create statistics manually when needed"</td><td>"Synapse query optimizer is statistics-driven. I create statistics on every join key and filter column at table creation time, and auto-update them after large loads. Missing statistics is the second most common cause of poor Dedicated Pool query plans."</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use HASH distribution on join keys for large fact tables; REPLICATE for small dims</li>
                <li>Pause Dedicated SQL Pool outside business hours to eliminate idle cost</li>
                <li>Create statistics on join and filter columns immediately after table creation</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use Dedicated SQL Pool for ad-hoc exploration — serverless is 98% cheaper</li>
                <li>Use ROUND_ROBIN distribution on fact tables that are frequently joined</li>
                <li>Leave Dedicated Pool running 24/7 during development or testing</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-synapse')) { await unmarkTopicComplete('az-synapse'); onUnmark('az-synapse') } else { await markTopicComplete('az-synapse'); onComplete('az-synapse') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-synapse') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-synapse') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-databricks ─────────────────────────────────────── */}
        <section id="az-databricks" ref={el => { if (el) sectionRefs.current['az-databricks'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Databricks</h1>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
            • "What's the difference between all-purpose and job clusters in Databricks?"<br/>
            • "How does Unity Catalog improve governance over the legacy Hive metastore?"<br/>
            • "How do you access ADLS securely from Databricks without storing credentials in notebooks?"<br/>
            • "Why should you avoid DBFS mounts in a Unity Catalog workspace?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
            Does the candidate understand the cost implications of cluster types (all-purpose clusters left running are the #1 Databricks cost driver) and the Unity Catalog governance model — or do they just know "Databricks runs Spark notebooks"?
            </div>
          </div>

          <p>In production, the single biggest Databricks cost mistake is using all-purpose clusters for everything. The reason job clusters exist is that they are ephemeral — created when a job starts, terminated when it finishes. An all-purpose cluster kept running overnight costs the same as 10 job runs. Unity Catalog is the modern governance layer: a single three-level namespace (catalog.schema.table) across all workspaces, with column-level security, row filters, and data lineage. The old pattern of mounting ADLS with dbutils.fs.mount bypasses Unity Catalog governance entirely — any workspace user can access the mount, regardless of UC permissions.</p>

          <DatabricksDiagram />
          <DatabricksAnimation />

          <table>
            <thead><tr><th>Step</th><th>What to say in 60 seconds</th></tr></thead>
            <tbody>
              <tr><td>1. Cluster types</td><td>"All-purpose clusters are for interactive notebooks — shared by multiple users, persistent. Job clusters are ephemeral — created per job run, terminated after, 60–80% cheaper for production pipelines."</td></tr>
              <tr><td>2. Unity Catalog</td><td>"Unity Catalog gives a three-level namespace: catalog.schema.table. It centralises permissions across all workspaces, supports column masking, row filters, and tracks lineage. DBFS mounts bypass UC — use direct abfss:// paths or external locations instead."</td></tr>
              <tr><td>3. Secret management</td><td>"Credentials go in Key Vault-backed secret scopes. dbutils.secrets.get() retrieves them — the value is redacted in logs. Never use spark.conf.set() with hardcoded credentials, even in notebooks."</td></tr>
              <tr><td>4. Cost optimisation</td><td>"Instance pools pre-provision VMs so job clusters start in 30 seconds instead of 5 minutes. Spot instances reduce worker node cost by 60–80%. Auto-termination on all-purpose clusters prevents idle cost."</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
            • Condé Nast: migrated 200 all-purpose clusters to job clusters; reduced monthly Databricks DBU cost by 65% ($180k/month saving) while improving pipeline reliability through better isolation.<br/>
            • ING Bank: Unity Catalog with column masking on PII fields (SSN, IBAN) — data scientists run models on masked data, only approved roles see plaintext; complies with GDPR without duplicating datasets.<br/>
            • Deliveroo: instance pools reduce job cluster startup from 6 minutes to 45 seconds; 500+ daily job runs benefit, reducing end-to-end pipeline latency by 35 minutes per day.
            </div>
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
              question: "Your team has 50 daily production pipelines running overnight. What cluster type reduces cost while maintaining reliability?",
              options: [
                "One large all-purpose cluster shared across all 50 pipelines",
                "Job clusters — ephemeral, created per run, auto-terminated; 60–80% cheaper than equivalent all-purpose clusters that persist between runs",
                "SQL Warehouses for all pipelines regardless of workload type",
                "One all-purpose cluster per pipeline with 30-minute auto-termination"
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
                "Mounts are workspace-global and bypass Unity Catalog governance — any user in the workspace can read mounted ADLS paths regardless of their UC permissions",
                "Mounts are slower than direct abfss:// access by 3×",
                "Mounts only support Parquet and CSV formats",
                "Mounts are deprecated in Databricks Runtime 14+ and will cause errors"
              ],
              correct: 0
            }
          ]} />

          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"I keep an all-purpose cluster running for production jobs"</td><td>"All-purpose clusters are billed per DBU per hour regardless of workload. For production jobs I use job clusters — they start fresh per run, are automatically terminated, and cost 60–80% less. I only use all-purpose clusters for interactive development, with 30-minute auto-termination."</td></tr>
              <tr><td>"I mount ADLS in my notebooks with dbutils.fs.mount()"</td><td>"Mounts are workspace-global and bypass Unity Catalog — any user can access the mount path regardless of UC permissions. In UC-enabled workspaces I use external locations and direct abfss:// paths so access is governed by Unity Catalog RBAC and audit-logged."</td></tr>
              <tr><td>"I read secrets with dbutils.secrets.get() from a Databricks-native scope"</td><td>"I use Key Vault-backed secret scopes so secrets are managed centrally in Key Vault and not duplicated in Databricks. This means secret rotation in Key Vault is immediately reflected in all notebooks without any Databricks changes."</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use job clusters for production pipelines; all-purpose only for interactive dev</li>
                <li>Enable Unity Catalog on all new workspaces; use catalog.schema.table namespacing</li>
                <li>Use Key Vault-backed secret scopes for credential management</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Leave all-purpose clusters running overnight — set auto-termination to 30–60 min</li>
                <li>Use DBFS mounts in Unity Catalog workspaces — they bypass UC governance</li>
                <li>Store credentials in spark.conf or notebook variables — use secret scopes</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-databricks')) { await unmarkTopicComplete('az-databricks'); onUnmark('az-databricks') } else { await markTopicComplete('az-databricks'); onComplete('az-databricks') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-databricks') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-databricks') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-eventhub ───────────────────────────────────────── */}
        <section id="az-eventhub" ref={el => { if (el) sectionRefs.current['az-eventhub'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Event Hub</h1>
            <p className="topic-desc">Azure Event Hub is a fully managed, high-throughput event streaming service capable of ingesting millions of events per second. It is partitioned (like Kafka topics), supports consumer groups for independent reads, and is the primary Azure service for real-time data ingestion pipelines. Event Hub Premium and Dedicated tiers offer schema registry and private endpoints.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "How many partitions should you create for 1M events/sec?" / "Event Hub vs Kafka — when do you choose Azure?" / "What happens when a consumer is slower than the producer?" / "How does Event Hub Capture work?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know partition immutability, throughput unit limits, consumer group isolation, and Capture Avro format — or do they just say "it's like Kafka"?
            </div>
          </div>

          <p>In production, Event Hub is sized by two independent axes: <strong>partition count</strong> (determines max consumer parallelism, immutable after creation) and <strong>throughput units / processing units</strong> (1 TU = 1 MB/s ingress, 2 MB/s egress). The reason partition count matters so much is that Spark Structured Streaming creates exactly one task per partition — a 4-partition Event Hub feeding a 20-executor Spark cluster caps you at 4× parallelism. In Premium/Dedicated tiers, throughput scales independently of partition count, but partition count is still fixed at creation.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Managed Kafka-compatible event streaming service ingesting millions of events/second with partitioned consumer groups</td></tr>
              <tr><td>2. Architecture</td><td>Producers → Event Hub Namespace → partitions → consumer groups → Spark/Functions/ASA; Capture → ADLS (Avro)</td></tr>
              <tr><td>3. Key limits</td><td>Standard: 32 partitions max, 1 MB/s per TU ingress, 7-day retention; Premium: 100 partitions, unlimited retention</td></tr>
              <tr><td>4. Trade-off</td><td>Don't use Event Hub when you need message settlement (ACK/NACK), ordering guarantees, or sub-1-second latency SLAs — use Service Bus instead</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Booking.com ingests 2M events/sec from 200+ microservices using Event Hub with 128 partitions and 100 throughput units per namespace. Siemens Healthineers uses Event Hub Capture to land IoT device telemetry into ADLS Gen2 in Avro format every 5 minutes, feeding a Databricks Delta Live Tables pipeline.
            </div>
          </div>

          <EventHubDiagram />
          <EventHubAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use Event Hub to ingest events"</td><td>"We chose Event Hub over Service Bus because we need 500K events/sec with no settlement — we set 32 partitions at creation to match our Spark cluster's max parallelism"</td></tr>
              <tr><td>"It's like a message queue in the cloud"</td><td>"The critical config is partition count — it's immutable after creation and must match consumer parallelism; get it wrong and you hit a hard ceiling with no fix short of recreation"</td></tr>
              <tr><td>"It scales automatically"</td><td>"Auto-inflate scales TUs up to the configured max, but it doesn't scale partitions — for a 20-executor Spark job reading a 4-partition hub, we're capped at 4× parallelism regardless of TU count"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Set partition count at creation to match expected max consumer parallelism</li>
                <li>Use named consumer groups (not $Default) for each independent reader</li>
                <li>Enable Event Hub Capture to ADLS for durability beyond 7-day retention</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't create Event Hub with default 2 partitions for high-throughput pipelines — you cannot change it later</li>
                <li>Don't share a consumer group across multiple independent consumers — offsets will conflict</li>
                <li>Don't use Event Hub when you need FIFO ordering or message ACK/NACK — use Service Bus</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-eventhub')) { await unmarkTopicComplete('az-eventhub'); onUnmark('az-eventhub') } else { await markTopicComplete('az-eventhub'); onComplete('az-eventhub') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-eventhub') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-eventhub') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-eventgrid ──────────────────────────────────────── */}
        <section id="az-eventgrid" ref={el => { if (el) sectionRefs.current['az-eventgrid'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Event Grid</h1>
            <p className="topic-desc">Azure Event Grid is a fully managed event routing service built for reactive, event-driven architectures. It delivers discrete events (not streams) from sources like Azure services (Blob Storage, Resource Manager) or custom topics to handlers like Azure Functions, Logic Apps, webhooks, or Event Hub. It is the backbone of event-driven file ingestion patterns in Azure data platforms.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "How would you trigger a Databricks job when a file lands in ADLS?" / "Event Grid vs Event Hub — which for file arrival notifications?" / "What happens if an Event Grid endpoint is down for 10 minutes?" / "How do you filter Event Grid events by subject?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the retry policy (24-hour TTL, exponential backoff), dead letter configuration, subject filtering syntax, and Event Grid vs Event Hub vs Service Bus decision matrix — or do they just know "it routes events"?
            </div>
          </div>

          <p>In production, Event Grid is the glue layer for file-arrival-driven pipelines: a BlobCreated event fires when data lands in ADLS, Event Grid routes it to an Azure Function or ADF trigger within milliseconds. The reason Event Grid beats polling is latency and cost — instead of a scheduler checking every minute (wasted API calls when there's nothing new), Event Grid delivers the notification within 1 second of the write completing. The critical production config is the dead letter destination: without it, undeliverable events after 24 hours of retries are silently dropped.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Push-based event router that delivers discrete "something happened" notifications from Azure services or custom sources to subscribers</td></tr>
              <tr><td>2. Architecture</td><td>Event source (ADLS, Blob, ARM) → Event Grid topic → subscriptions with filters → handlers (Functions, Logic Apps, webhooks, Event Hub)</td></tr>
              <tr><td>3. Key limits</td><td>10M events/sec per topic, 64KB max event size, 24h retry window with exponential backoff, at-least-once delivery</td></tr>
              <tr><td>4. Trade-off</td><td>Don't use Event Grid for high-throughput streaming (use Event Hub) or reliable message queuing with settlement semantics (use Service Bus)</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              ASOS uses Event Grid to trigger Databricks Auto Loader within 2 seconds of order files landing in ADLS, replacing a 5-minute polling loop and reducing ingestion latency by 98%. Rolls-Royce uses Event Grid BlobCreated events from IoT Hub to fan out engine telemetry to 4 independent processing pipelines simultaneously via subscription filtering.
            </div>
          </div>

          <EventGridDiagram />
          <EventGridAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use Event Grid to trigger functions when files arrive"</td><td>"We chose Event Grid over polling because it delivers BlobCreated notifications within 1 second; we configured subject filtering to only route /containers/raw/blobs/*.parquet to our Function, reducing invocations by 80%"</td></tr>
              <tr><td>"It retries automatically"</td><td>"The default retry policy is 30 attempts over 24 hours with exponential backoff — without a dead letter destination configured, events that exhaust retries are silently dropped, which we discovered the hard way in prod"</td></tr>
              <tr><td>"It scales automatically"</td><td>"Event Grid scales to 10M events/sec per topic, but each subscription has independent retry state — for fan-out to 5 handlers we create 5 subscriptions, not one, so a slow handler doesn't block others"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Always configure a dead letter destination (blob container or storage queue) to capture undeliverable events</li>
                <li>Use subject filtering (subjectBeginsWith/EndsWith) to scope subscriptions to specific containers or file patterns</li>
                <li>Use CloudEvents schema (v1.0) for new topics — it's the open standard and supported by all major platforms</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't use Event Grid for high-throughput streaming (millions/sec continuous) — use Event Hub instead</li>
                <li>Don't skip endpoint validation — Event Grid sends a validation handshake before delivering events; unauthenticated webhooks will receive no events</li>
                <li>Don't use $Default consumer group for Event Grid → Event Hub subscriptions under load — create a dedicated consumer group</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-eventgrid')) { await unmarkTopicComplete('az-eventgrid'); onUnmark('az-eventgrid') } else { await markTopicComplete('az-eventgrid'); onComplete('az-eventgrid') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-eventgrid') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-eventgrid') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-servicebus ─────────────────────────────────────── */}
        <section id="az-servicebus" ref={el => { if (el) sectionRefs.current['az-servicebus'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Service Bus</h1>
            <p className="topic-desc">Azure Service Bus is an enterprise messaging service supporting queues (point-to-point) and topics with subscriptions (pub/sub). Unlike Event Hub, Service Bus guarantees ordered delivery, supports message sessions for FIFO processing, dead letter queues for failed messages, and transactional semantics - making it the right choice for workflow orchestration and reliable command messaging.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "How would you guarantee ordered processing of pipeline commands?" / "Service Bus vs Event Hub vs Event Grid — when do you pick each?" / "What is a message session and when is it needed?" / "How does the dead letter queue work?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know message lock duration, max_delivery_count, session-based FIFO, the 256KB Standard / 100MB Premium message size limit, and exactly when to choose Service Bus over Event Hub — or do they just say "it's a message broker"?
            </div>
          </div>

          <p>In production, Service Bus is the right tool when messages are <strong>commands</strong> (not telemetry): start this pipeline, process this order, send this notification. The reason it beats a simple queue is the lock mechanism — when a consumer receives a message, it is locked for up to 5 minutes (configurable). If the consumer crashes, the lock expires and another consumer retries it. After max_delivery_count failures (default 10), the message moves to the Dead Letter Queue for investigation. This at-least-once + DLQ pattern is the foundation of reliable distributed workflows on Azure.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Enterprise message broker with queues (point-to-point) and topics/subscriptions (pub/sub), supporting settlement semantics and FIFO sessions</td></tr>
              <tr><td>2. Architecture</td><td>Producer → Queue/Topic → lock + process → complete/abandon/dead-letter; Sessions group related messages for ordered FIFO processing</td></tr>
              <tr><td>3. Key limits</td><td>Standard: 256KB max message size, 80GB queue; Premium: 100MB max message size, dedicated capacity, VNet integration</td></tr>
              <tr><td>4. Trade-off</td><td>Don't use Service Bus for high-throughput event streaming (1M+/sec) — the per-message lock overhead caps throughput; use Event Hub instead</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Maersk uses Service Bus Premium with message sessions to guarantee FIFO processing of shipping container state transitions — each container ID is a session key, ensuring events like "loaded" → "departed" → "arrived" are never reordered. BMW Group uses Service Bus topics with 12 subscriptions to fan out vehicle telematics commands to regional processing microservices.
            </div>
          </div>

          <ServiceBusDiagram />
          <ServiceBusAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use Service Bus to send messages between services"</td><td>"We chose Service Bus Premium over Standard because we have 1MB+ messages (payloads with embedded JSON arrays); Standard caps at 256KB and we hit that within a week of go-live"</td></tr>
              <tr><td>"Failed messages go to a dead letter queue"</td><td>"The critical config is max_delivery_count (default 10) and lock_duration (default 1 min) — if processing takes 3 minutes and lock_duration is 1 minute, the message unlocks and gets reprocessed by another consumer, causing duplicates; we set lock_duration to 10 minutes"</td></tr>
              <tr><td>"It scales automatically"</td><td>"Service Bus Premium uses messaging units (1/2/4/8/16 MUs); we pre-provision 4 MUs for peak pipeline orchestration loads rather than relying on auto-scale, which has a 20-second ramp-up lag"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Set lock_duration longer than your worst-case processing time to prevent duplicate delivery</li>
                <li>Use message sessions for strict FIFO ordering per entity (e.g., per customer ID, per order ID)</li>
                <li>Monitor Dead Letter Queue depth as a KPI — a growing DLQ means processing failures need investigation</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't use Service Bus for high-throughput streaming (millions/sec) — per-message lock overhead creates a hard throughput ceiling</li>
                <li>Don't ignore the DLQ — unmonitored dead letter queues silently swallow failed messages</li>
                <li>Don't use Standard tier for large messages or VNet-isolated architectures — upgrade to Premium</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-servicebus')) { await unmarkTopicComplete('az-servicebus'); onUnmark('az-servicebus') } else { await markTopicComplete('az-servicebus'); onComplete('az-servicebus') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-servicebus') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-servicebus') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-functions ──────────────────────────────────────── */}
        <section id="az-functions" ref={el => { if (el) sectionRefs.current['az-functions'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Functions</h1>
            <p className="topic-desc">Azure Functions is a serverless compute service for event-driven code execution. Functions are triggered by events (HTTP requests, timers, blob creation, queue messages, Event Hub events) and can read/write to other services via input/output bindings - all declared in configuration, not code. For data engineering, Functions are ideal for lightweight ETL triggers, file processing, and API integrations.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "How would you handle cold start for a latency-sensitive data pipeline trigger?" / "Consumption vs Premium plan — when does it matter?" / "How do Durable Functions solve the fan-out/fan-in pattern?" / "What is the execution timeout limit on Consumption plan?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the 10-minute Consumption timeout, Premium pre-warmed instances, VNet integration requirements, binding vs SDK trade-offs, and Durable Functions orchestrator replay semantics — or do they just say "serverless functions in Azure"?
            </div>
          </div>

          <p>In production, the hosting plan choice is the most consequential Azure Functions decision. Consumption plan scales to zero: great for cost, terrible for latency-sensitive triggers. The cold start penalty for Python functions is typically 3–8 seconds. For data pipeline triggers where a file lands and must be processed within 2 seconds, use the Premium plan with always-ready instances (pre-warmed). The reason is that Premium keeps N instances warm at all times — the first invocation hits a warm instance with 50ms cold start instead of 5 seconds. Premium also adds VNet integration (required for private endpoint architectures) and removes the 10-minute execution cap.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Serverless event-driven compute with declarative bindings for 30+ Azure services, triggered by HTTP/timer/queue/blob/Event Hub events</td></tr>
              <tr><td>2. Architecture</td><td>Trigger fires → Function processes → output bindings write to sinks; Durable Functions add stateful orchestration with checkpointing</td></tr>
              <tr><td>3. Key limits</td><td>Consumption: 10-min timeout, cold start 3–8s (Python), scale to 200 instances; Premium: unlimited timeout, pre-warmed, VNet integration</td></tr>
              <tr><td>4. Trade-off</td><td>Don't use Functions for long-running batch jobs (30+ min) — use Databricks Jobs or ADF instead; Functions excel at sub-10-minute event-driven processing</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Heineken uses Azure Functions Premium with 5 always-ready instances to process POS transaction files within 3 seconds of landing in ADLS, feeding a real-time inventory dashboard. Vodafone uses Durable Functions fan-out orchestration to parallelize CDR (call detail record) enrichment across 50 activity functions, reducing processing time from 4 hours to 12 minutes.
            </div>
          </div>

          <FunctionsDiagram />
          <AzureFunctionsAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use Azure Functions to trigger our data pipeline"</td><td>"We use Functions Premium with 3 always-ready instances — Consumption cold starts were causing 5-second delays on file arrival triggers, which violated our 2-second SLA for downstream dashboards"</td></tr>
              <tr><td>"It's serverless so it scales automatically"</td><td>"The critical config is FUNCTIONS_WORKER_PROCESS_COUNT — Python defaults to 1 worker process per instance; we set it to 4 to handle concurrent Event Hub partition processing without provisioning more instances"</td></tr>
              <tr><td>"Durable Functions handle long-running workflows"</td><td>"Durable Functions orchestrators must be deterministic — no DateTime.now(), no random calls, no external I/O directly in the orchestrator; replay will re-execute orchestrator code and non-deterministic calls break the replay invariant"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use Premium plan with always-ready instances for latency-sensitive triggers (&lt;2s SLA)</li>
                <li>Use output bindings instead of SDK calls for standard sinks — the runtime handles retry and connection pooling</li>
                <li>Store all secrets in Key Vault and reference via @Microsoft.KeyVault() syntax in app settings</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't use Consumption plan for Python functions with cold-start SLAs under 5 seconds</li>
                <li>Don't put non-deterministic code (DateTime.now, random) directly in Durable Functions orchestrators — it breaks replay</li>
                <li>Don't exceed the 10-minute Consumption timeout for batch processing — switch to Premium or use ADF/Databricks</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-functions')) { await unmarkTopicComplete('az-functions'); onUnmark('az-functions') } else { await markTopicComplete('az-functions'); onComplete('az-functions') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-functions') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-functions') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-streamanalytics ── */}
        <section id="az-streamanalytics" ref={el => { if (el) sectionRefs.current['az-streamanalytics'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Stream Analytics</h1>
            <p className="topic-desc">Azure Stream Analytics (ASA) is a fully managed, serverless real-time analytics service. It uses a SQL-like query language with temporal windowing functions to process streaming data from Event Hubs, IoT Hub, or Blob Storage and route results to 20+ sinks.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "Explain the difference between Tumbling, Hopping, and Sliding windows with examples" / "How do you handle late-arriving events in Stream Analytics?" / "ASA vs Spark Structured Streaming — when do you choose ASA?" / "What is a Streaming Unit and how do you size a job?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the four window types, late arrival tolerance configuration, Streaming Unit sizing (1 SU ≈ 1 MB/s), the 6-SU-per-partition parallelism rule, and when ASA beats Spark — or do they just say "it's a streaming SQL service"?
            </div>
          </div>

          <p>In production, Stream Analytics is the right choice when your streaming logic is expressible in SQL with window functions and you want zero infrastructure management. The reason teams choose ASA over Spark Structured Streaming for IoT/telemetry use cases is operational simplicity: no cluster to size, no Spark version to manage, autoscale SUs up to 192. The critical sizing rule is 6 SUs per input partition for maximum throughput — a 32-partition Event Hub needs at least 192 SUs for a fully parallel ASA job. The late arrival tolerance (TIMESTAMP BY with WITHIN clause) is essential in production: IoT devices with clock skew or network buffers regularly deliver events 30–120 seconds late.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Managed serverless streaming analytics with SQL-like SAQL, 4 window types, and 20+ built-in output sinks</td></tr>
              <tr><td>2. Architecture</td><td>Event Hub / IoT Hub → ASA job (SAQL query) → outputs (ADLS, Power BI, SQL DB, Event Hub, Cosmos DB)</td></tr>
              <tr><td>3. Key limits</td><td>1 SU ≈ 1 MB/s throughput, max 192 SUs, 6 SUs needed per input partition for full parallelism, 21-day late arrival window max</td></tr>
              <tr><td>4. Trade-off</td><td>Don't use ASA for complex ML inference, Python UDFs requiring heavy libraries, or joins across more than 3 streams — use Spark Structured Streaming instead</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              ThyssenKrupp uses Azure Stream Analytics with 96 SUs to process 800K elevator sensor events/minute, detecting anomalies in real-time with a 30-second Tumbling window and routing alerts to Service Bus within 500ms. Shell uses ASA Hopping windows (5-min window, 1-min hop) on 32-partition Event Hub to compute rolling average pipeline pressure metrics feeding Power BI dashboards.
            </div>
          </div>

          <StreamAnalyticsDiagram />
          <StreamAnalyticsAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use Stream Analytics for real-time processing"</td><td>"We chose ASA over Spark Streaming because our logic is pure windowed aggregations — no ML, no Python UDFs. ASA at 48 SUs costs 40% less than an equivalent Databricks cluster and requires zero cluster management"</td></tr>
              <tr><td>"It has different window types"</td><td>"The critical distinction: Tumbling windows fire once per interval (non-overlapping); Hopping windows fire every hop even if the window overlaps the previous; Sliding windows fire on every event entry/exit — Sliding is the most expensive because it emits a result for every single event"</td></tr>
              <tr><td>"It scales automatically"</td><td>"Auto-scale between 3–192 SUs has a ~2 minute scale-out lag — for bursty workloads with sudden 10× spikes (e.g., Black Friday), we pre-scale to max SUs 30 minutes before the event rather than relying on auto-scale"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Always use TIMESTAMP BY with a late arrival tolerance to handle clock skew from IoT devices and network buffers</li>
                <li>Size at 6 SUs per input partition for full parallelism — under-sizing creates a processing backlog that grows silently</li>
                <li>Use Tumbling windows for fixed-interval aggregations and Hopping for rolling metrics — avoid Sliding unless you need per-event output</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't use ASA for Python ML inference or complex multi-stream joins — switch to Spark Structured Streaming</li>
                <li>Don't omit TIMESTAMP BY — without it ASA uses arrival time, which causes incorrect window assignments for late events</li>
                <li>Don't under-provision SUs and ignore the watermark delay metric — a growing delay means the job is falling behind and needs more SUs</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-streamanalytics')) { await unmarkTopicComplete('az-streamanalytics'); onUnmark('az-streamanalytics') } else { await markTopicComplete('az-streamanalytics'); onComplete('az-streamanalytics') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-streamanalytics') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-streamanalytics') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-keyvault ── */}
        <section id="az-keyvault" ref={el => { if (el) sectionRefs.current['az-keyvault'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Key Vault Deep Dive</h1>
            <p className="topic-desc">Azure Key Vault centralises secrets, encryption keys, and TLS certificates. It integrates natively with ADF linked services, Azure Functions app settings, Databricks secret scopes, and virtually every Azure service via managed identity.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "How do you rotate a database password without downtime in Azure?" / "Key Vault Access Policies vs RBAC — which do you use and why?" / "What is Soft Delete and Purge Protection and when would you enable them?" / "How does Databricks read secrets from Key Vault?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the RBAC role names (Key Vault Secrets User, Secrets Officer), soft-delete retention window, Databricks secret scope types, and the Key Vault reference syntax for Functions/App Service — or do they just say "store secrets in Key Vault"?
            </div>
          </div>

          <p>In production, Key Vault is not just a secret store — it is the <strong>rotation orchestration hub</strong>. When a storage account key is regenerated, an Event Grid event triggers a Function that updates the Key Vault secret version; all services referencing the secret via @Microsoft.KeyVault() syntax pick up the new version automatically on the next request. The reason RBAC beats Access Policies is auditability: RBAC assignments appear in Azure Activity Log with the principal, action, and timestamp, while Access Policy changes are harder to trace. Always use RBAC authorization mode for new Key Vaults.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Managed HSM-backed store for secrets (strings), keys (cryptographic), and certificates (X.509 TLS) with RBAC access control</td></tr>
              <tr><td>2. Architecture</td><td>Services authenticate via managed identity → Key Vault RBAC check → secret returned; ADF/Functions reference via @Microsoft.KeyVault(SecretUri=...) in linked service / app settings</td></tr>
              <tr><td>3. Key limits</td><td>25,000 transactions/10s per vault (Standard), soft-delete retention 7–90 days, purge protection locks deletion for the full retention period</td></tr>
              <tr><td>4. Trade-off</td><td>Don't use Key Vault for high-volume per-request secret lookups (&gt;1000 req/s) without caching — throttling at 25K TPS per vault is a hard limit; cache secrets in memory with a 5-minute TTL</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              ING Bank uses Azure Key Vault with RBAC and purge protection enabled across 200+ microservices, achieving automated 90-day secret rotation with zero-downtime via Event Grid-triggered Functions. Lufthansa Systems uses Databricks Key Vault-backed secret scopes to inject ADLS access keys into 50+ notebooks with secrets redacted in all Spark logs.
            </div>
          </div>

          <KeyVaultDiagram />
          <KeyVaultAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We store our secrets in Key Vault"</td><td>"We use Key Vault RBAC mode with Key Vault Secrets User role on managed identities — no client secrets to rotate, and every access is logged in Activity Log for compliance audit"</td></tr>
              <tr><td>"It's integrated with everything"</td><td>"The critical config is enabling RBAC authorization mode at vault creation — legacy Access Policies mode can't be audited at the operation level and isn't inheritable via management group policies"</td></tr>
              <tr><td>"Secrets are secure and auto-rotated"</td><td>"Auto-rotation requires an Event Grid subscription on the vault plus a rotation Function; without that wiring, secrets only rotate if someone manually triggers it — we've seen 3-year-old secrets in 'automated' pipelines"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Enable RBAC authorization mode (not Access Policies) for all new Key Vaults for consistent IAM governance</li>
                <li>Enable soft-delete with 90-day retention and purge protection for production vaults to prevent accidental permanent deletion</li>
                <li>Cache secrets client-side with a 5-minute TTL to avoid Key Vault throttling at high request rates</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't call Key Vault on every single request in a hot path — you'll hit the 25K TPS throttle and trigger 429 errors in production</li>
                <li>Don't store secrets in environment variables, config files, or code comments — always reference Key Vault by URI</li>
                <li>Don't use a single vault for all environments — maintain separate Key Vaults per environment (dev/staging/prod) with different RBAC assignments</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-keyvault')) { await unmarkTopicComplete('az-keyvault'); onUnmark('az-keyvault') } else { await markTopicComplete('az-keyvault'); onComplete('az-keyvault') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-keyvault') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-keyvault') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-identity ── */}
        <section id="az-identity" ref={el => { if (el) sectionRefs.current['az-identity'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure AD / Entra ID and Identity</h1>
            <p className="topic-desc">Microsoft Entra ID (formerly Azure Active Directory) is the identity platform for Azure. For data engineering, the critical concepts are service principals, managed identities, workload identity federation, and OAuth 2.0 token flows used by SDKs and pipelines.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "Managed identity vs service principal — when do you use each?" / "How does GitHub Actions authenticate to Azure without storing credentials?" / "What is workload identity federation?" / "System-assigned vs user-assigned managed identity — what's the trade-off?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the OAuth 2.0 client credentials flow, DefaultAzureCredential chain order, the difference between system/user-assigned managed identity lifecycles, and OIDC workload identity federation for CI/CD — or do they just say "use managed identity"?
            </div>
          </div>

          <p>In production, the identity hierarchy for data platforms is: <strong>managed identity first</strong> (for Azure-to-Azure auth), <strong>workload identity federation second</strong> (for GitHub Actions / Kubernetes), <strong>service principal with certificate third</strong>, and client secrets as a last resort. The reason managed identity beats service principals is that there are no credentials to store, rotate, or accidentally commit to git. DefaultAzureCredential in the Azure SDK tries: managed identity → environment variables (SP) → Azure CLI → Visual Studio — this chain means the same code works in production (managed identity) and locally (Azure CLI login) without any code change.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Entra ID provides OAuth 2.0 / OIDC identity for Azure resources; managed identities eliminate credential management entirely</td></tr>
              <tr><td>2. Architecture</td><td>Resource → IMDS (169.254.169.254) → token → RBAC check on target resource; WIF: external OIDC token → Entra federated credential → Azure token</td></tr>
              <tr><td>3. Key limits</td><td>Token lifetime: 1 hour (access), up to 24h (refresh); SP client secret max 2 years; managed identity tokens cached by IMDS until 5 min before expiry</td></tr>
              <tr><td>4. Trade-off</td><td>User-assigned managed identity adds complexity but enables reuse across resources and survives resource deletion; system-assigned is simpler but dies with the resource</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Unilever eliminated 340 service principal client secrets across their Azure data platform by migrating to user-assigned managed identities, reducing secret rotation toil by 100% and eliminating 3 security incidents per year caused by expired secrets. HSBC uses workload identity federation for all GitHub Actions deployments to Azure, achieving zero stored Azure credentials in their CI/CD system.
            </div>
          </div>

          <IdentityDiagram />
          <IdentityAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use a service principal to authenticate our pipelines"</td><td>"We migrated from service principals to user-assigned managed identity — no client secret to rotate, no risk of accidental git commit, and the token is auto-refreshed by IMDS 5 minutes before expiry"</td></tr>
              <tr><td>"Managed identity is more secure"</td><td>"The critical choice is system-assigned vs user-assigned: system-assigned is 1:1 with the resource and auto-deleted, but you lose audit history; user-assigned persists independently, so we use it for shared identities (e.g., one identity for all ADF pipelines across 3 linked services)"</td></tr>
              <tr><td>"GitHub Actions can use Azure credentials"</td><td>"We use OIDC workload identity federation — GitHub Actions requests a JWT from GitHub's OIDC provider, Entra ID validates the issuer/subject claim, and issues an Azure access token. Zero secrets stored in GitHub, and the token is valid for 1 hour per workflow run"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use user-assigned managed identity for shared resources (ADF, Databricks cluster) so the identity survives resource recreation</li>
                <li>Use workload identity federation for GitHub Actions and Kubernetes workloads — eliminates all stored Azure credentials</li>
                <li>Assign the minimum required RBAC role at the narrowest scope (resource &gt; resource group &gt; subscription)</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't create service principal client secrets with 2-year expiry and no rotation plan — secrets get forgotten and expire in production</li>
                <li>Don't assign Owner or Contributor at subscription scope to a pipeline identity — use the minimum role at resource scope</li>
                <li>Don't hardcode tenant ID or client ID in code — use DefaultAzureCredential which reads from environment / managed identity automatically</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-identity')) { await unmarkTopicComplete('az-identity'); onUnmark('az-identity') } else { await markTopicComplete('az-identity'); onComplete('az-identity') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-identity') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-identity') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-networking ── */}
        <section id="az-networking" ref={el => { if (el) sectionRefs.current['az-networking'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">VNet Deep Dive</h1>
            <p className="topic-desc">Azure networking for data engineers focuses on isolating data platform resources inside a VNet, locking down storage accounts and databases behind private endpoints, and controlling traffic with NSGs and route tables.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "Private Endpoint vs Service Endpoint — what's the actual difference?" / "How do you lock down an ADLS account so only your Databricks cluster can access it?" / "What is a Private DNS zone and why is it required with Private Endpoints?" / "How does VNet injection work for Databricks?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know that Private Endpoints give the service a private IP (public access can be disabled), that Private DNS zones are mandatory for hostname resolution, and that Databricks VNet injection requires two dedicated subnets with specific delegations — or do they just say "use private endpoints"?
            </div>
          </div>

          <p>In production, the network security baseline for a data platform is: all PaaS services (ADLS, Key Vault, SQL, Synapse) behind private endpoints with public access disabled, Databricks workspace VNet-injected into dedicated subnets, and NSGs allowing only intra-VNet traffic. The reason private endpoints beat service endpoints is that service endpoints still expose a public IP — a misconfigured firewall rule can expose data. With private endpoints, the storage account has a private IP (e.g., 10.0.3.5) and public access is disabled entirely. The mandatory companion is a Private DNS zone (privatelink.dfs.core.windows.net) — without it, DNS resolves the storage hostname to the old public IP, causing connection failures even though the private endpoint exists.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>VNet isolates the data platform; Private Endpoints inject PaaS services with private IPs; NSGs filter traffic; Private DNS zones resolve internal hostnames</td></tr>
              <tr><td>2. Architecture</td><td>Databricks (VNet-injected) → private endpoint → ADLS/Key Vault/SQL; NSG on each subnet; Private DNS zone linked to VNet for name resolution</td></tr>
              <tr><td>3. Key limits</td><td>1000 private endpoints per VNet, /26 subnet minimum for Databricks (64 IPs), NSG rules evaluated by priority (100–4096, lower = first)</td></tr>
              <tr><td>4. Trade-off</td><td>Private endpoints add complexity (DNS zones, NIC in subnet) and cost (~$7.30/month/endpoint + data processing); for dev environments, service endpoints may be sufficient</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Barclays deployed private endpoints for all 45 PaaS services in their Azure data platform with public access disabled, passing PCI-DSS audit with zero firewall exceptions. NatWest uses Databricks VNet injection with a /24 public subnet and /24 private subnet, routing all cluster traffic through an Azure Firewall with application rules allowing only approved outbound destinations.
            </div>
          </div>

          <NetworkingDiagram />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use private endpoints to secure our storage"</td><td>"We use private endpoints with public access disabled and a Private DNS zone (privatelink.dfs.core.windows.net) linked to the VNet — without the DNS zone, the storage hostname resolves to the public IP even though the private endpoint exists, causing intermittent connection failures"</td></tr>
              <tr><td>"We have NSG rules to block public internet"</td><td>"The critical NSG rule is a Deny Internet inbound at priority 4096 with an Allow VNet inbound at priority 100 — NSGs are stateful so you only need inbound rules; return traffic is automatically allowed"</td></tr>
              <tr><td>"Databricks is in our VNet"</td><td>"Databricks VNet injection requires two dedicated subnets with Microsoft.Databricks/workspaces delegation and specific NSG rules (DatabricksControlPlane allow) — missing the delegation or wrong CIDR causes workspace creation to fail silently"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Always create a Private DNS zone and link it to the VNet when deploying private endpoints — hostname resolution fails without it</li>
                <li>Disable public network access on ADLS, Key Vault, and SQL after creating private endpoints to prevent bypass via public IP</li>
                <li>Size Databricks subnets at /23 or larger (512 IPs each) for clusters that may scale to 50+ workers</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't create private endpoints without immediately disabling public access — the endpoint provides no security if the public IP is still reachable</li>
                <li>Don't use overlapping CIDR ranges between peered VNets — Azure blocks peering with overlapping address spaces and the only fix is recreation</li>
                <li>Don't forget to update DNS when adding new private endpoint sub-resources (e.g., adding blob endpoint to a storage account that already has dfs endpoint)</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-networking')) { await unmarkTopicComplete('az-networking'); onUnmark('az-networking') } else { await markTopicComplete('az-networking'); onComplete('az-networking') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-networking') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-networking') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-monitor ── */}
        <section id="az-monitor" ref={el => { if (el) sectionRefs.current['az-monitor'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Monitor Deep Dive</h1>
            <p className="topic-desc">Azure Monitor is the unified observability platform for Azure. It collects metrics (numerical time-series), logs (structured/unstructured text), and traces. Log Analytics workspace stores logs queryable with KQL. Application Insights adds APM for applications.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "How would you alert when an ADF pipeline fails?" / "Metrics vs Logs — when do you use each for alerting?" / "Write a KQL query to find the slowest ADF activities in the last 7 days" / "What is the retention period for Log Analytics and how do you control cost?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know KQL pipe syntax (where, summarize, project, render), the difference between metric alerts (near real-time) and log query alerts (5-min minimum), Log Analytics pricing tiers, and Diagnostic Settings as the ingestion mechanism — or do they just say "use Azure Monitor"?
            </div>
          </div>

          <p>In production, observability for a data platform requires three layers: <strong>metrics</strong> for fast alerting (ADF pipeline failure count, Event Hub consumer lag, Databricks job duration — evaluated every 1 minute), <strong>logs</strong> for root cause analysis (KQL queries over AzureDiagnostics table in Log Analytics), and <strong>dashboards</strong> (Azure Workbooks or Grafana over Azure Monitor data source). The reason metrics beat logs for alerting is latency: metric alerts evaluate every 1 minute with near real-time data, while log query alerts have a 5-minute minimum evaluation window. The critical infrastructure piece is Diagnostic Settings — every Azure service must have a diagnostic setting configured to ship logs to Log Analytics, otherwise the AzureDiagnostics table has no data.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Unified observability: metrics (1-min granularity, 93-day retention), logs (KQL-queryable in Log Analytics), traces (Application Insights), and alerts/dashboards</td></tr>
              <tr><td>2. Architecture</td><td>Azure service → Diagnostic Settings → Log Analytics workspace; Azure Monitor Metrics → metric alerts; Log Analytics → log query alerts → Action Groups (email/PagerDuty/webhook)</td></tr>
              <tr><td>3. Key limits</td><td>Log Analytics: 30-day interactive retention (default), up to 7 years archive; ingestion &lt;500MB/day free then ~$2.30/GB; metric alert min eval: 1 min; log alert min eval: 5 min</td></tr>
              <tr><td>4. Trade-off</td><td>Log Analytics cost scales with ingestion volume — enable table-level retention and exclude noisy diagnostic categories (e.g., AzureMetrics table if you're not using it) to reduce spend</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Vodafone monitors 2,000+ ADF pipeline runs/day using Azure Monitor log query alerts on the AzureDiagnostics table, with KQL queries detecting p95 activity duration regressions and alerting PagerDuty within 5 minutes of a slowdown. BP uses Azure Workbooks with KQL over Log Analytics to build a real-time data platform health dashboard tracking Databricks job success rates, Event Hub consumer lag, and Synapse query queue depth.
            </div>
          </div>

          <MonitorDiagram />
          <MonitorAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We have alerting set up in Azure Monitor"</td><td>"We use metric alerts for SLA-critical failures (ADF pipeline failure rate &gt;1% triggers PagerDuty within 1 minute) and log query alerts for trend-based detection (p95 Databricks job duration 2× baseline, evaluated every 5 minutes)"</td></tr>
              <tr><td>"We query logs with KQL"</td><td>"The critical KQL pattern for data engineering is: AzureDiagnostics | where Category == 'PipelineRuns' | summarize failures = countif(status_s == 'Failed') by bin(TimeGenerated, 1h), pipelineName_s | where failures &gt; 0 | order by TimeGenerated desc — this gives hourly failure trends per pipeline"</td></tr>
              <tr><td>"Log Analytics stores all our logs"</td><td>"Log Analytics cost is dominated by ingestion volume — we use Commitment Tiers (100GB/day tier saves 30% vs pay-as-you-go) and set 30-day interactive retention with 90-day archive on high-volume tables like AzureMetrics that we rarely query interactively"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Configure Diagnostic Settings on every data platform resource to ship logs to Log Analytics at deployment time (Terraform/Bicep)</li>
                <li>Use metric alerts for real-time failure detection (1-min eval) and log alerts for trend/anomaly detection (5-min eval)</li>
                <li>Set up Action Groups with multiple notification channels (email + PagerDuty webhook) and test them quarterly</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't ingest all diagnostic categories to Log Analytics without reviewing volume — AzureMetrics alone can be thousands of rows/minute per resource</li>
                <li>Don't use the default 30-day retention for compliance-sensitive audit logs — configure 90+ day retention or archive to Azure Storage</li>
                <li>Don't rely solely on Azure Portal for KQL queries at scale — use workbooks for repeatable dashboards and share them via Azure Monitor Workbook Gallery</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-monitor')) { await unmarkTopicComplete('az-monitor'); onUnmark('az-monitor') } else { await markTopicComplete('az-monitor'); onComplete('az-monitor') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-monitor') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-monitor') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-cosmos ── */}
        <section id="az-cosmos" ref={el => { if (el) sectionRefs.current['az-cosmos'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Cosmos DB Deep Dive</h1>
            <p className="topic-desc">Azure Cosmos DB is a globally distributed, multi-model NoSQL database with guaranteed single-digit millisecond latency at any scale. The partition key is the single most important design decision  -  it determines data distribution, query efficiency, and throughput consumption.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "How do you choose a partition key for a 1-billion-document orders collection?" / "What is a hot partition and how do you fix it?" / "Cosmos DB consistency levels — when do you use Session vs Strong?" / "How does the Change Feed work and what can you build with it?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the 20GB logical partition limit, the RU cost difference between point reads (1 RU) vs cross-partition queries (N×RU), the 5 consistency levels and their trade-offs, and Change Feed as a CDC mechanism — or do they just say "it's a NoSQL database that scales globally"?
            </div>
          </div>

          <p>In production, Cosmos DB's performance is almost entirely determined by partition key choice. A point read (item ID + partition key) costs 1 RU regardless of document size. A cross-partition query (no partition key in filter) fans out to every partition and costs N × per-partition RU — on a 100-partition container, a cross-partition query costs 100× more than a partition-scoped query. The reason this matters in production is RU throttling: exceed your provisioned RU/s and Cosmos returns HTTP 429, causing retries and latency spikes. The fix is either increase RU/s (cost), redesign the partition key (requires data migration), or use autoscale RU/s with a max cap.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Globally distributed multi-model NoSQL DB with SLA-backed &lt;10ms p99 latency, 5 consistency levels, and RU-based throughput model</td></tr>
              <tr><td>2. Architecture</td><td>Partition key → logical partitions (max 20GB each) → physical partitions (managed by Cosmos); Change Feed → Functions/Spark for CDC; autoscale RU/s scales 10×–1× of max</td></tr>
              <tr><td>3. Key limits</td><td>20GB max per logical partition, 1 RU point read, 2.5MB max document size, 400 RU/s min (manual), 100 RU/s min (autoscale), 10,000 RU/s per physical partition</td></tr>
              <tr><td>4. Trade-off</td><td>Don't use Cosmos for complex joins, aggregations over full datasets, or ACID transactions spanning many partitions — use Azure SQL or Synapse instead</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Coca-Cola uses Cosmos DB with customerId as partition key for 2B+ loyalty records, achieving 2ms p99 point reads at 500K RU/s across 3 regions. Xbox Live uses Cosmos DB Change Feed to process 10M+ player state updates/hour, feeding a Spark Structured Streaming job that maintains real-time leaderboards with sub-5-second latency.
            </div>
          </div>

          <CosmosDiagram />
          <CosmosAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use Cosmos DB for low-latency reads"</td><td>"We chose customerId as partition key over orderId — 80% of queries filter by customer, so partition-scoped queries cost 1–5 RU vs 100+ RU for cross-partition fan-out on a 50-partition container"</td></tr>
              <tr><td>"It has hot partition issues sometimes"</td><td>"Hot partitions happen when a partition key has low cardinality (e.g., status = active/inactive) or skewed distribution (one customer has 10M orders). The fix is a synthetic partition key: customerId + '_' + year creates 10× more partitions with even distribution"</td></tr>
              <tr><td>"It scales automatically with autoscale"</td><td>"Autoscale scales between 10% and 100% of max RU/s — if max is 10,000 RU/s, min cost is 1,000 RU/s (10%). For idle containers that must stay available, this is 10× more expensive than manual at 400 RU/s; we use manual throughput for dev/test containers"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Choose a partition key with high cardinality and even write distribution — this is the most impactful Cosmos DB design decision</li>
                <li>Use point reads (item ID + partition key) for single-document lookups — 1 RU vs potentially hundreds for queries</li>
                <li>Enable autoscale RU/s for production containers with variable traffic; use manual for dev/test to minimize idle cost</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't use low-cardinality fields (status, region, type) as partition keys — they create hot partitions that cannot be rebalanced</li>
                <li>Don't run cross-partition queries on large containers without a partition key filter — costs scale linearly with partition count</li>
                <li>Don't use Strong consistency for globally distributed reads unless absolutely required — it doubles read latency and halves read throughput</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-cosmos')) { await unmarkTopicComplete('az-cosmos'); onUnmark('az-cosmos') } else { await markTopicComplete('az-cosmos'); onComplete('az-cosmos') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-cosmos') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-cosmos') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-sql ── */}
        <section id="az-sql" ref={el => { if (el) sectionRefs.current['az-sql'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure SQL Database</h1>
            <p className="topic-desc">Azure SQL Database is a fully managed PaaS relational database built on SQL Server. Key choices: DTU vs vCore purchasing model, single database vs elastic pool vs Managed Instance, and geo-replication strategy.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "DTU vs vCore — when does the choice matter?" / "How would you design Azure SQL for a multi-tenant SaaS application?" / "What is the difference between Active Geo-Replication and Auto-Failover Groups?" / "How do Temporal Tables work and when would you use them?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the GP vs BC vs Hyperscale tier differences, elastic pool eDTU sharing mechanics, Always Encrypted vs TDE distinction, and Temporal Table FOR SYSTEM_TIME AS OF syntax — or do they just say "it's a managed SQL Server"?
            </div>
          </div>

          <p>In production, the three most important Azure SQL decisions are: <strong>tier</strong> (General Purpose for typical OLTP, Business Critical for in-memory OLTP + readable secondary at no extra cost, Hyperscale for 100TB+ with 100ms backup regardless of size), <strong>purchasing model</strong> (vCore for reserved capacity discounts and explicit CPU/memory control), and <strong>HA strategy</strong> (Auto-Failover Groups for automatic DNS-based failover to secondary region vs Active Geo-Replication for manual failover with custom read routing). The reason Business Critical beats General Purpose for read-heavy workloads is the free built-in readable secondary — offload reporting queries there without extra cost.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Fully managed PaaS SQL Server with 3 service tiers (General Purpose, Business Critical, Hyperscale), vCore/DTU purchasing, and built-in HA</td></tr>
              <tr><td>2. Architecture</td><td>Primary replica + HA secondary (zone-redundant); BC tier adds free readable secondary; Auto-Failover Group provides DNS-based geo-failover; elastic pool shares eDTUs across databases</td></tr>
              <tr><td>3. Key limits</td><td>GP: 4TB max, 7000 IOPS; BC: 4TB max, 200K+ IOPS (local SSD); Hyperscale: 100TB max, 15-min restore SLA; elastic pool max 500 databases</td></tr>
              <tr><td>4. Trade-off</td><td>Don't use Azure SQL for data warehouse queries scanning billions of rows — use Synapse Dedicated SQL Pool or Synapse Serverless; Azure SQL is optimized for OLTP, not OLAP</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Stack Overflow uses Azure SQL Hyperscale (32 vCores, 170GB RAM) for their primary database, achieving 15-minute restore time for a 4TB database that previously took 8 hours on standard tiers. Sage Group uses Azure SQL elastic pools with 800 eDTUs shared across 200 SMB customer databases, reducing per-database cost by 60% vs individual database provisioning.
            </div>
          </div>

          <AzureSQLDiagram />
          <AzureSQLAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use Azure SQL for our production database"</td><td>"We use Azure SQL Business Critical (8 vCores) because our reporting team runs heavy read queries — BC's free built-in readable secondary offloads those queries with zero additional cost vs a separate read replica on General Purpose"</td></tr>
              <tr><td>"We have geo-replication for disaster recovery"</td><td>"Active Geo-Replication requires manual failover (you call the failover API); Auto-Failover Group adds a listener endpoint (server.database.windows.net) that auto-updates DNS on failover — apps reconnect without any connection string change"</td></tr>
              <tr><td>"We use DTU pricing because it's simpler"</td><td>"DTU pricing is opaque — you can't see CPU vs IO utilization separately. We use vCore so we can right-size based on actual CPU (Query Performance Insight) and qualify for Azure Hybrid Benefit, saving 30–55% with existing SQL Server licenses"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use vCore model for new databases — it enables reserved capacity pricing, Azure Hybrid Benefit, and explicit resource control</li>
                <li>Use Auto-Failover Groups (not just Active Geo-Replication) for automatic DNS-based failover without connection string changes</li>
                <li>Enable Azure AD-only authentication and disable SQL authentication for compliance and to eliminate password-based attack vectors</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't use Azure SQL for analytical queries scanning billions of rows — it's OLTP-optimized; use Synapse Analytics for OLAP workloads</li>
                <li>Don't leave the DTU model for high-value workloads — you can't qualify for reserved capacity pricing or Azure Hybrid Benefit</li>
                <li>Don't skip Query Performance Insight after sizing — a single missing index on a hot query can account for 80% of DTU/vCore consumption</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-sql')) { await unmarkTopicComplete('az-sql'); onUnmark('az-sql') } else { await markTopicComplete('az-sql'); onComplete('az-sql') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-sql') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-sql') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-devops ── */}
        <section id="az-devops" ref={el => { if (el) sectionRefs.current['az-devops'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure DevOps and GitHub Actions</h1>
            <p className="topic-desc">CI/CD for data engineering pipelines: automatically test, build, and deploy ADF pipelines, Databricks notebooks, Terraform infrastructure, and dbt models when code is merged. Azure DevOps and GitHub Actions are the two dominant platforms.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "How do you deploy ADF pipelines without downtime?" / "How does GitHub Actions authenticate to Azure without storing credentials?" / "What is the adf_publish branch and how does it work?" / "How would you structure a CI/CD pipeline for a Databricks + dbt + ADF data platform?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the ADF publish → adf_publish → ARM template deploy workflow, OIDC workload identity federation for GitHub Actions, GitHub Environments as manual approval gates, and the pre/post-deployment stop/start linked triggers pattern — or do they just say "we use CI/CD for deployments"?
            </div>
          </div>

          <p>In production, ADF CI/CD has a specific workflow that trips up most candidates: developers work in a feature branch connected to ADF, hit "Publish" in the ADF UI which exports ARM templates to the adf_publish branch, then CI/CD deploys those ARM templates to other environments. The reason you stop ADF triggers before deployment and restart after is that deploying while triggers are active can cause duplicate pipeline runs or mid-run schema changes. The pre-deployment script (stop triggers) + ARM template deploy + post-deployment script (start triggers) is the production-proven pattern from Microsoft's own ADF CI/CD documentation.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>CI/CD automates testing and deployment of data platform components (ADF, Databricks, dbt, Terraform) from code commit to production</td></tr>
              <tr><td>2. Architecture</td><td>Feature branch → PR → merge to main → GitHub Actions/Azure DevOps pipeline → validate → deploy to staging → manual approval → deploy to prod</td></tr>
              <tr><td>3. Key limits</td><td>GitHub Actions: 6h job timeout, 20 concurrent jobs (free), 500MB artifact storage; ADF: ARM template deploy replaces entire factory — always stop triggers first</td></tr>
              <tr><td>4. Trade-off</td><td>ADF's ARM-based deployment replaces the whole factory atomically — it cannot do rolling deploys of individual pipelines; plan maintenance windows for major ADF changes</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Marks &amp; Spencer deploys 300+ ADF pipelines via GitHub Actions using OIDC workload identity federation with zero stored Azure credentials, achieving 4-minute deploy-to-production cycles with automated pre/post-deployment trigger management. Heineken uses Azure DevOps multi-stage pipelines with manual approval gates between staging and production, requiring 2 data engineering leads to approve before any ADF or Databricks production deployment.
            </div>
          </div>

          <DevOpsDiagram />
          <DevOpsAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use GitHub Actions to deploy our ADF pipelines"</td><td>"We use OIDC workload identity federation — no Azure credentials stored in GitHub. The workflow requests a JWT, Entra ID validates the github.com OIDC issuer and repo/environment subject claim, then issues a 1-hour Azure access token"</td></tr>
              <tr><td>"We deploy ADF from the adf_publish branch"</td><td>"The critical sequence is: (1) run pre-deployment script to stop all triggers, (2) deploy ARM template from adf_publish to target factory, (3) run post-deployment script to restart triggers with environment-specific overrides — skip step 1 and you get duplicate pipeline runs mid-deploy"</td></tr>
              <tr><td>"We have staging and production environments"</td><td>"GitHub Environments add required reviewers (manual approval gates) and environment-scoped secrets — production secrets are only accessible after 2 reviewers approve, preventing accidental or unauthorized production deploys"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Use OIDC workload identity federation for GitHub Actions — eliminates all stored Azure credentials and associated rotation toil</li>
                <li>Always stop ADF triggers before ARM template deployment and restart after — prevents duplicate runs and mid-deploy schema conflicts</li>
                <li>Use GitHub Environments with required reviewers for production deployments — human approval gates for production changes</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't store Azure client secrets in GitHub Actions secrets — use OIDC workload identity federation instead</li>
                <li>Don't deploy ADF ARM templates while triggers are running — this causes duplicate pipeline executions and potential data duplication</li>
                <li>Don't deploy directly to production from feature branches — always go through a PR review + staging environment + manual approval gate</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-devops')) { await unmarkTopicComplete('az-devops'); onUnmark('az-devops') } else { await markTopicComplete('az-devops'); onComplete('az-devops') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-devops') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-devops') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-terraform ── */}
        <section id="az-terraform" ref={el => { if (el) sectionRefs.current['az-terraform'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Terraform for Azure</h1>
            <p className="topic-desc">Terraform is the de-facto IaC tool for Azure data platforms. It declaratively manages all Azure resources  -  VNets, storage accounts, ADF, Databricks workspaces  -  with a state file tracking what exists, enabling plan/apply/destroy workflows.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "Why must Terraform state be stored remotely for team workflows?" / "What happens if two engineers run terraform apply simultaneously?" / "How do you import an existing Azure resource into Terraform?" / "What is terraform taint and when would you use it?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the Azure Blob Storage backend with lease-based state locking, the plan/apply/destroy workflow, terraform import vs terraform state mv, and the azurerm provider ~&gt; version pinning pattern — or do they just say "we use Terraform for infrastructure"?
            </div>
          </div>

          <p>In production, the two most critical Terraform practices are: <strong>remote state with locking</strong> (Azure Blob Storage backend uses blob lease to prevent concurrent applies — two engineers running apply simultaneously without locking will corrupt the state file), and <strong>always running plan before apply</strong> in CI/CD (the plan output shows exactly what will be created, modified, or destroyed — reviewing it catches accidental deletions before they hit production). The reason azurerm provider version is pinned (~&gt; 3.90 not ~&gt; 3) is that minor versions occasionally introduce breaking changes to resource schema, and an unpinned upgrade during a production apply can fail mid-way, leaving partial state.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Declarative IaC tool with a state file tracking actual vs desired Azure infrastructure, enabling idempotent plan/apply/destroy workflows</td></tr>
              <tr><td>2. Architecture</td><td>HCL config → terraform plan (diff) → terraform apply (create/update/delete) → state updated in Azure Blob; CI/CD runs plan on PR, apply on merge</td></tr>
              <tr><td>3. Key limits</td><td>Blob Storage backend state locking via lease (15s lock acquisition timeout), state file size up to 100MB practical limit, azurerm provider 3.x has 1000+ resources</td></tr>
              <tr><td>4. Trade-off</td><td>Terraform manages infrastructure lifecycle; it does not manage ADF pipeline JSON content or Databricks notebook code — use ADF CI/CD and Databricks Repos for those layers</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Expedia manages 2,000+ Azure resources across 5 environments with Terraform, using Azure Blob Storage remote state with Entra ID authentication (no storage keys) and workspace-per-environment isolation. Société Générale uses Terraform modules for their data platform blueprint (VNet + ADLS + ADF + Databricks + Key Vault) that spins up a complete compliant environment in 12 minutes.
            </div>
          </div>

          <TerraformDiagram />
          <TerraformAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We use Terraform to manage our Azure infrastructure"</td><td>"We use Azure Blob Storage backend with use_azuread_auth = true so the service principal authenticates via managed identity — no storage account key stored anywhere, and state access is audited via Entra ID"</td></tr>
              <tr><td>"We run terraform plan before apply"</td><td>"The critical CI/CD pattern is: plan on PR (save plan file with -out=tfplan), apply on merge using the saved plan — this guarantees exactly what was reviewed gets applied, not a re-plan that might differ due to drift"</td></tr>
              <tr><td>"We use modules to reuse infrastructure code"</td><td>"We pin module versions with git tags (source = git::https://...?ref=v2.3.1) and provider versions with ~&gt; (azurerm ~&gt; 3.90 means &gt;=3.90.0 &lt;4.0.0) — unpinned versions caused a production apply failure when azurerm 3.95 changed the ADLS hierarchical namespace attribute schema"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Store state in Azure Blob Storage with use_azuread_auth = true — no storage keys to rotate, access is auditable via Entra ID</li>
                <li>Pin provider versions with ~&gt; (pessimistic constraint) and module versions with exact git tags to prevent surprise breaking changes</li>
                <li>Run terraform plan in CI on every PR and require review of the plan output before merging — catches accidental deletions</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't store Terraform state locally for team workflows — concurrent applies without locking corrupt the state file irreversibly</li>
                <li>Don't run terraform apply without reviewing plan output — a single resource rename in HCL causes destroy + recreate, which deletes production data</li>
                <li>Don't use terraform state edit manually — use terraform state mv and terraform import for state manipulations to preserve history</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-terraform')) { await unmarkTopicComplete('az-terraform'); onUnmark('az-terraform') } else { await markTopicComplete('az-terraform'); onComplete('az-terraform') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-terraform') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-terraform') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

        {/* ── az-cost ── */}
        <section id="az-cost" ref={el => { if (el) sectionRefs.current['az-cost'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 6 - Cloud and Azure</div>
            <h1 className="topic-title">Azure Cost Management</h1>
            <p className="topic-desc">Cloud cost is an engineering concern. Data platforms commonly overspend on idle Databricks clusters, over-provisioned Synapse dedicated pools, and unnecessary data egress. Understanding Azure Cost Management tools lets you monitor, alert, and optimise spend proactively.</p>
          </div>

          <div className="callout callout-warning">
            <span className="callout-icon">🎯</span>
            <div className="callout-body"><strong>Interview Triggers</strong><br/>
              "How do you identify the biggest cost drivers in a $100K/month Azure data platform?" / "Reserved Instances vs Savings Plans — what's the difference?" / "How would you cut Databricks costs by 40% without reducing capacity?" / "What is the difference between an Actual and Forecasted budget alert?"
            </div>
          </div>

          <div className="callout callout-info">
            <span className="callout-icon">🔍</span>
            <div className="callout-body"><strong>What Interviewers Want</strong><br/>
              Does the candidate know the top Azure data platform cost drivers (Databricks DBU, Synapse DWU, egress), the 30–70% Reserved Instance discount range, auto-termination vs job cluster cost difference, and the lifecycle management policy for ADLS tiering — or do they just say "use cost alerts"?
            </div>
          </div>

          <p>In production, the top three Azure data platform cost drivers are: (1) <strong>Databricks all-purpose clusters left running</strong> — an 8-node Standard_DS3_v2 cluster running 24/7 costs ~$3,200/month; the same workload on job clusters (auto-created/destroyed per job run) costs ~$400/month, an 87% reduction. (2) <strong>Synapse Dedicated SQL Pool always-on</strong> — a DW1000c running 24/7 costs ~$14,000/month; pausing overnight and weekends cuts this to ~$5,000/month. (3) <strong>Data egress across regions</strong> — $0.08/GB adds up quickly when Databricks in East US reads data from West Europe ADLS. The reason Reserved Instances beat pay-as-you-go for stable workloads is simple math: 1-year reservations save 30–40%, 3-year reservations save 50–70% on the same VM SKU.</p>

          <table>
            <thead><tr><th>Step</th><th>60-Second Framework</th></tr></thead>
            <tbody>
              <tr><td>1. Define</td><td>Azure Cost Management provides cost analysis, budgets with alerts, and recommendations via Azure Advisor to monitor and optimize cloud spend</td></tr>
              <tr><td>2. Architecture</td><td>Cost data → Cost Management → budgets (Actual + Forecasted alerts) → Action Groups; Advisor recommendations → right-sizing + reserved capacity opportunities</td></tr>
              <tr><td>3. Key limits</td><td>Reserved Instances: 1-year (30–40% savings) or 3-year (50–70% savings), instance size flexibility within VM family, cancelable within 12 months with 12% early termination fee</td></tr>
              <tr><td>4. Trade-off</td><td>Reserved Instances only make sense for stable 24/7 workloads — for bursty workloads (&lt;50% utilization), pay-as-you-go + auto-scale is cheaper than reservations for underutilized capacity</td></tr>
            </tbody>
          </table>

          <div className="callout callout-example">
            <span className="callout-icon">🏢</span>
            <div className="callout-body"><strong>In Production</strong><br/>
              Zalando reduced their Azure Databricks spend by $180K/year by converting all-purpose clusters to job clusters with auto-termination (30-min timeout) and purchasing 3-year Reserved Instances for their always-on Standard_DS5_v2 driver nodes. Santander cut ADLS Gen2 storage costs by 45% by implementing a lifecycle management policy that moves Bronze layer data to Cool tier after 30 days and Archive tier after 365 days.
            </div>
          </div>

          <CostDiagram />
          <CostAnimation />
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
          <table>
            <thead><tr><th>Junior Says</th><th>Senior Says</th></tr></thead>
            <tbody>
              <tr><td>"We have cost alerts set up"</td><td>"We use both Actual (fires when spend crosses threshold) and Forecasted alerts (fires when Azure predicts we'll exceed threshold by month-end) — Forecasted gives us 2 weeks of lead time to react before we actually overspend"</td></tr>
              <tr><td>"We use job clusters to save money"</td><td>"Job clusters save 80%+ vs always-on all-purpose clusters, but cold start takes 4–7 minutes — for SLA-sensitive jobs we use instance pools (pre-provisioned idle VMs at low DBU rate) to cut cold start to under 60 seconds while still auto-terminating"</td></tr>
              <tr><td>"We bought Reserved Instances for savings"</td><td>"We reserved 3-year Standard_DS5_v2 for driver nodes (always running) and Standard_DS3_v2 for a baseline worker count (80% utilization) — the remaining 20% peak capacity runs on pay-as-you-go spot VMs, saving 58% overall vs full pay-as-you-go"</td></tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div className="card-success">
              <strong>✓ Do</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Convert all-purpose Databricks clusters to job clusters — the single biggest cost optimization for most data platforms</li>
                <li>Pause Synapse Dedicated SQL Pool outside business hours and weekends — saves 60–70% of pool cost</li>
                <li>Implement ADLS lifecycle management: Hot → Cool after 30 days, Cool → Archive after 365 days for raw/bronze layer data</li>
              </ul>
            </div>
            <div className="card-danger" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:14,padding:'18px 22px'}}>
              <strong>✗ Don't</strong>
              <ul style={{marginTop:8,paddingLeft:18}}>
                <li>Don't buy Reserved Instances for bursty or experimental workloads — reservations are 1–3 year commitments, and underutilized reservations waste money</li>
                <li>Don't store all data in Hot access tier — ADLS Cool tier costs 50% less for storage (higher access cost) and Archive is 90% less for rarely accessed data</li>
                <li>Don't ignore data egress costs when designing multi-region architectures — $0.08/GB adds up to thousands per month for large cross-region pipelines</li>
              </ul>
            </div>
          </div>

          <button onClick={async () => { try { if (completed.has('az-cost')) { await unmarkTopicComplete('az-cost'); onUnmark('az-cost') } else { await markTopicComplete('az-cost'); onComplete('az-cost') } } catch (e: any) { if (e.message === 'Not signed in') { onSignInNeeded() } } }} className={`complete-btn-inline${completed.has('az-cost') ? ' complete-btn-inline-done' : ''}`} style={{ marginTop: 16 }}>{completed.has('az-cost') ? 'Undo ✕' : 'Mark Complete ✓'}</button>
        </section>

      </main>
    </div>
  )
}
