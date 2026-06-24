import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete, unmarkTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: (id?: string) => void; onUnmark: (id: string) => void }

// ── Animation Components ──────────────────────────────────────────────────────
// ─────────────────────────────────────────────── PRODUCTION DIAGRAM COMPONENTS ───

function ArchitectureDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 75" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Data Architecture Patterns</text>
        {[
          {name:'Lambda',layers:'Batch + Speed + Serving',note:'2 codebases',color:'#4f8ef7'},
          {name:'Kappa',layers:'Stream-only + Serving',note:'1 codebase',color:'#8b5cf6'},
          {name:'Lakehouse',layers:'ADLS + Delta + Compute',note:'Best practice',color:'#f59e0b'},
        ].map((a,i)=>(
          <g key={a.name}>
            <rect x={4+i*158} y="18" width="152" height="44" rx="5" fill={a.color} opacity=".13" stroke={a.color} strokeWidth="1.5"/>
            <text x={80+i*158} y="32" fontSize="9.5" fontWeight="700" fill={a.color} textAnchor="middle">{a.name}</text>
            <text x={80+i*158} y="44" fontSize="7.5" fill="#475569" textAnchor="middle">{a.layers}</text>
            <text x={80+i*158} y="55" fontSize="7.5" fontStyle="italic" fill="#94a3b8" textAnchor="middle">{a.note}</text>
          </g>
        ))}
        <text x="4" y="70" fontSize="8" fill="#64748b">Lakehouse = open formats + ACID + direct BI queries — replaces Lambda/Kappa for most orgs</text>
      </svg>
    </div>
  )
}

function SystemDesignDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 75" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Production System Design Pillars</text>
        {[
          {name:'Scalability',desc:'Horizontal sharding,\npartitioning',color:'#4f8ef7'},
          {name:'Reliability',desc:'Retries, idempotency,\ncircuit breakers',color:'#22c55e'},
          {name:'Maintainability',desc:'Modular DAGs,\nIaC, docs',color:'#8b5cf6'},
          {name:'Observability',desc:'Logs, metrics,\ntraces, alerts',color:'#f59e0b'},
        ].map((p,i)=>(
          <g key={p.name}>
            <rect x={4+i*118} y="18" width="112" height="44" rx="5" fill={p.color} opacity=".12" stroke={p.color} strokeWidth="1.5"/>
            <text x={60+i*118} y="32" fontSize="9" fontWeight="700" fill={p.color} textAnchor="middle">{p.name}</text>
            {p.desc.split('\n').map((l,j)=><text key={j} x={60+i*118} y={44+j*11} fontSize="7.5" fill="#475569" textAnchor="middle">{l}</text>)}
          </g>
        ))}
      </svg>
    </div>
  )
}

function PipelinePatternsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 70" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Pipeline Patterns</text>
        {[
          {name:'Bronze/Silver/Gold',desc:'Medallion layering — raw → clean → agg',color:'#f59e0b'},
          {name:'Event-driven',desc:'Trigger on file arrival or Kafka event',color:'#22c55e'},
          {name:'Backfill',desc:'Reprocess historical partitions idempotently',color:'#4f8ef7'},
          {name:'Fan-out',desc:'One source → multiple domain datasets',color:'#8b5cf6'},
        ].map((p,i)=>(
          <g key={p.name}>
            <rect x={4+i*118} y="18" width="112" height="38" rx="4" fill={p.color} opacity=".12" stroke={p.color} strokeWidth="1.2"/>
            <text x={60+i*118} y="30" fontSize="8.5" fontWeight="700" fill={p.color} textAnchor="middle">{p.name}</text>
            <text x={60+i*118} y="42" fontSize="7" fill="#475569" textAnchor="middle">{p.desc}</text>
          </g>
        ))}
        <text x="4" y="66" fontSize="8" fill="#64748b">Write idempotent pipelines: same input → same output regardless of retries.</text>
      </svg>
    </div>
  )
}

function SCDTypesDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 70" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Slowly Changing Dimensions (SCD)</text>
        {[
          {type:'Type 0',desc:'Never update',color:'#64748b'},
          {type:'Type 1',desc:'Overwrite old value',color:'#ef4444'},
          {type:'Type 2',desc:'New row, eff/exp dates',color:'#22c55e'},
          {type:'Type 3',desc:'Add prev_value column',color:'#4f8ef7'},
          {type:'Type 4',desc:'History in mini-dim',color:'#8b5cf6'},
          {type:'Type 6',desc:'1+2+3 hybrid',color:'#f59e0b'},
        ].map((s,i)=>(
          <g key={s.type}>
            <rect x={4+(i%3)*158} y={18+Math.floor(i/3)*22} width="152" height="18" rx="3" fill={s.color} opacity=".12" stroke={s.color} strokeWidth="1"/>
            <text x={14+(i%3)*158} y={30+Math.floor(i/3)*22} fontSize="8.5" fontWeight="700" fill={s.color}>{s.type}:</text>
            <text x={66+(i%3)*158} y={30+Math.floor(i/3)*22} fontSize="8" fill="#475569">{s.desc}</text>
          </g>
        ))}
        <text x="4" y="66" fontSize="8" fill="#64748b">Type 2 most common. Use is_current flag or surrogate key for point-in-time joins.</text>
      </svg>
    </div>
  )
}

function CiCdDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 65" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">DE CI/CD Pipeline</text>
        {['PR Lint\n+ Tests','Build\nImage','Deploy Dev\n(preview)','Integration\nTests','Deploy Prod\n(Helm/DABs)'].map((s,i)=>(
          <g key={s}>
            <rect x={4+i*94} y="18" width="88" height="30" rx="4" fill="#4f8ef7" opacity={.1+i*.04} stroke="#4f8ef7" strokeWidth="1.2"/>
            {s.split('\n').map((l,j)=><text key={j} x={48+i*94} y={29+j*11} fontSize="8" fontWeight="700" fill="#4f8ef7" textAnchor="middle">{l}</text>)}
            {i<4&&<polygon points={`${94+i*94},33 ${98+i*94},29 ${98+i*94},37`} fill="#4f8ef7" opacity=".6"/>}
          </g>
        ))}
        <text x="4" y="60" fontSize="8" fill="#64748b">Gate on data quality checks. Environment-specific configs via Terraform workspace / DAB targets.</text>
      </svg>
    </div>
  )
}

function TestingDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 74" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Data Engineering Testing Pyramid</text>
        <polygon points="230,16 430,54 30,54" fill="#1e293b" opacity=".04" stroke="#1e293b" strokeWidth="1"/>
        <text x="230" y="28" fontSize="8" fontWeight="700" fill="#ef4444" textAnchor="middle">E2E / Integration</text>
        <text x="230" y="39" fontSize="8" fontWeight="700" fill="#f59e0b" textAnchor="middle">Component / Contract Tests</text>
        <text x="230" y="50" fontSize="8.5" fontWeight="700" fill="#22c55e" textAnchor="middle">Unit Tests (transformations, helpers)</text>
        <text x="4" y="70" fontSize="8" fill="#64748b">pytest + great_expectations / soda for DQ. Mock external connections in unit tests.</text>
      </svg>
    </div>
  )
}

function DBTDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 70" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">dbt Core Concepts</text>
        {[
          {name:'Sources',desc:'Raw tables, freshness tests',color:'#64748b'},
          {name:'Models',desc:'SQL SELECT → materialization',color:'#4f8ef7'},
          {name:'Tests',desc:'not_null, unique, refs',color:'#22c55e'},
          {name:'Macros',desc:'Jinja templating helpers',color:'#8b5cf6'},
          {name:'Docs',desc:'Auto-generated lineage',color:'#f59e0b'},
        ].map((d,i)=>(
          <g key={d.name}>
            <rect x={4+i*94} y="18" width="88" height="36" rx="4" fill={d.color} opacity=".12" stroke={d.color} strokeWidth="1.2"/>
            <text x={48+i*94} y="30" fontSize="9" fontWeight="700" fill={d.color} textAnchor="middle">{d.name}</text>
            <text x={48+i*94} y="42" fontSize="7.5" fill="#475569" textAnchor="middle">{d.desc}</text>
            {i<4&&<polygon points={`${94+i*94},36 ${98+i*94},32 ${98+i*94},40`} fill={d.color} opacity=".5"/>}
          </g>
        ))}
        <text x="4" y="64" fontSize="8" fill="#64748b">dbt run → compile SQL, execute. dbt test → run assertions. dbt docs generate → lineage graph.</text>
      </svg>
    </div>
  )
}

function TerraformDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 65" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Terraform for Data Infrastructure (IaC)</text>
        {['Write\n.tf files','terraform\ninit','terraform\nplan','terraform\napply','State in\nremote backend'].map((s,i)=>(
          <g key={s}>
            <rect x={4+i*90} y="18" width="84" height="30" rx="4" fill="#8b5cf6" opacity={.1+i*.04} stroke="#8b5cf6" strokeWidth="1.2"/>
            {s.split('\n').map((l,j)=><text key={j} x={46+i*90} y={29+j*10} fontSize="8" fontWeight="700" fill="#8b5cf6" textAnchor="middle">{l}</text>)}
            {i<4&&<polygon points={`${90+i*90},33 ${94+i*90},29 ${94+i*90},37`} fill="#8b5cf6" opacity=".6"/>}
          </g>
        ))}
        <text x="4" y="60" fontSize="8" fill="#64748b">Resources: azurerm_data_factory, databricks_job, azurerm_storage_account — all version-controlled.</text>
      </svg>
    </div>
  )
}

function SecurityDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 65" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Data Security Layers</text>
        {[
          {layer:'Encryption at Rest',desc:'AES-256, customer-managed keys',color:'#ef4444'},
          {layer:'Encryption in Transit',desc:'TLS 1.2+, HTTPS endpoints',color:'#f59e0b'},
          {layer:'Access Control',desc:'RBAC, Unity Catalog, ABAC',color:'#4f8ef7'},
          {layer:'Auditing',desc:'Activity logs, query history',color:'#22c55e'},
        ].map((s,i)=>(
          <g key={s.layer}>
            <rect x={4+i*113} y="18" width="107" height="32" rx="4" fill={s.color} opacity=".12" stroke={s.color} strokeWidth="1.2"/>
            <text x={57+i*113} y="30" fontSize="8.5" fontWeight="700" fill={s.color} textAnchor="middle">{s.layer}</text>
            <text x={57+i*113} y="42" fontSize="7" fill="#475569" textAnchor="middle">{s.desc}</text>
          </g>
        ))}
        <text x="4" y="60" fontSize="8" fill="#64748b">PII → column masking + row filters. Manage secrets via Key Vault / AWS SSM, not env vars.</text>
      </svg>
    </div>
  )
}

function ObservabilityDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 65" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Observability — Three Pillars</text>
        <rect x="10" y="18" width="130" height="36" rx="5" fill="#4f8ef7" opacity=".14" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="75" y="32" fontSize="10" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Logs</text>
        <text x="75" y="46" fontSize="7.5" fill="#475569" textAnchor="middle">Structured JSON events</text>
        <rect x="165" y="18" width="130" height="36" rx="5" fill="#22c55e" opacity=".14" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="230" y="32" fontSize="10" fontWeight="700" fill="#22c55e" textAnchor="middle">Metrics</text>
        <text x="230" y="46" fontSize="7.5" fill="#475569" textAnchor="middle">Counters, gauges, histograms</text>
        <rect x="320" y="18" width="130" height="36" rx="5" fill="#8b5cf6" opacity=".14" stroke="#8b5cf6" strokeWidth="1.5"/>
        <text x="385" y="32" fontSize="10" fontWeight="700" fill="#8b5cf6" textAnchor="middle">Traces</text>
        <text x="385" y="46" fontSize="7.5" fill="#475569" textAnchor="middle">Distributed span timings</text>
        <text x="4" y="60" fontSize="8" fill="#64748b">Stack: OpenTelemetry → Prometheus → Grafana. Correlate with trace_id across services.</text>
      </svg>
    </div>
  )
}

function MonitoringProdDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 65" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Production Pipeline Monitoring</text>
        {[
          {kpi:'Data Freshness',target:'&lt; 30 min lag',color:'#4f8ef7'},
          {kpi:'Row Count Δ',target:'±10% vs yesterday',color:'#22c55e'},
          {kpi:'Schema Drift',target:'0 unexpected changes',color:'#ef4444'},
          {kpi:'Pipeline SLA',target:'≤ 6 AM delivery',color:'#f59e0b'},
        ].map((m,i)=>(
          <g key={m.kpi}>
            <rect x={4+i*113} y="18" width="107" height="32" rx="4" fill={m.color} opacity=".12" stroke={m.color} strokeWidth="1.2"/>
            <text x={57+i*113} y="30" fontSize="8.5" fontWeight="700" fill={m.color} textAnchor="middle">{m.kpi}</text>
            <text x={57+i*113} y="42" fontSize="7.5" fill="#475569" textAnchor="middle">{m.target}</text>
          </g>
        ))}
        <text x="4" y="60" fontSize="8" fill="#64748b">Alert → PagerDuty/Slack. Runbook per alert. On-call rotation. Auto-remediation for known failures.</text>
      </svg>
    </div>
  )
}

function DisasterRecoveryDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 65" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Disaster Recovery Strategy</text>
        {[
          {metric:'RTO',full:'Recovery Time Objective',example:'Target: &lt; 4 hours',color:'#ef4444'},
          {metric:'RPO',full:'Recovery Point Objective',example:'Target: &lt; 1 hour data loss',color:'#f59e0b'},
          {metric:'DR Strategy',full:'Backup / Warm standby / Hot',example:'Choose by cost vs risk',color:'#22c55e'},
          {metric:'Runbooks',full:'Step-by-step recovery docs',example:'Tested quarterly',color:'#4f8ef7'},
        ].map((d,i)=>(
          <g key={d.metric}>
            <rect x={4+i*113} y="18" width="107" height="34" rx="4" fill={d.color} opacity=".12" stroke={d.color} strokeWidth="1.2"/>
            <text x={57+i*113} y="30" fontSize="9" fontWeight="700" fill={d.color} textAnchor="middle">{d.metric}</text>
            <text x={57+i*113} y="40" fontSize="7" fill="#475569" textAnchor="middle">{d.example}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function CostDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 65" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Cloud Data Cost Optimisation</text>
        {[
          {tip:'Right-size clusters',impact:'30-50% savings',color:'#22c55e'},
          {tip:'Spot/preemptible nodes',impact:'60-80% compute savings',color:'#4f8ef7'},
          {tip:'Lifecycle policies on storage',impact:'~40% storage savings',color:'#8b5cf6'},
          {tip:'OPTIMIZE + VACUUM Delta',impact:'Reduce query & scan cost',color:'#f59e0b'},
        ].map((c,i)=>(
          <g key={c.tip}>
            <rect x={4+i*113} y="18" width="107" height="32" rx="4" fill={c.color} opacity=".12" stroke={c.color} strokeWidth="1.2"/>
            <text x={57+i*113} y="29" fontSize="8" fontWeight="700" fill={c.color} textAnchor="middle">{c.tip}</text>
            <text x={57+i*113} y="41" fontSize="7.5" fill="#475569" textAnchor="middle">{c.impact}</text>
          </g>
        ))}
        <text x="4" y="60" fontSize="8" fill="#64748b">Tag resources by team/project. Budget alerts at 80%. Review Databricks DBU cost breakdown weekly.</text>
      </svg>
    </div>
  )
}

function PerformanceDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 65" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Pipeline Performance Tuning</text>
        {[
          {area:'Spark',tips:'Partition pruning, broadcast joins, AQE',color:'#4f8ef7'},
          {area:'Delta',tips:'OPTIMIZE + ZORDER before reads',color:'#f59e0b'},
          {area:'SQL',tips:'Predicate pushdown, column pruning',color:'#22c55e'},
          {area:'Infra',tips:'Network colocation, SSD caches',color:'#8b5cf6'},
        ].map((p,i)=>(
          <g key={p.area}>
            <rect x={4+i*113} y="18" width="107" height="32" rx="4" fill={p.color} opacity=".12" stroke={p.color} strokeWidth="1.2"/>
            <text x={57+i*113} y="29" fontSize="9" fontWeight="700" fill={p.color} textAnchor="middle">{p.area}</text>
            <text x={57+i*113} y="40" fontSize="7" fill="#475569" textAnchor="middle">{p.tips}</text>
          </g>
        ))}
        <text x="4" y="60" fontSize="8" fill="#64748b">Profile before optimizing. Spark UI → stage timeline, task skew. Identify the bottleneck first.</text>
      </svg>
    </div>
  )
}

function DataContractDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 70" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Data Contracts</text>
        <rect x="10" y="18" width="200" height="40" rx="5" fill="#4f8ef7" opacity=".12" stroke="#4f8ef7" strokeWidth="1.5"/>
        <text x="110" y="30" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Producer (Data Team)</text>
        <text x="110" y="42" fontSize="7.5" fill="#475569" textAnchor="middle">Guarantees: schema, SLA, semantics</text>
        <text x="110" y="52" fontSize="7.5" fill="#94a3b8" textAnchor="middle">Versioned YAML contract</text>
        <rect x="250" y="18" width="200" height="40" rx="5" fill="#22c55e" opacity=".12" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="350" y="30" fontSize="9" fontWeight="700" fill="#22c55e" textAnchor="middle">Consumer (Analytics/ML)</text>
        <text x="350" y="42" fontSize="7.5" fill="#475569" textAnchor="middle">Depends on: fields, freshness</text>
        <text x="350" y="52" fontSize="7.5" fill="#94a3b8" textAnchor="middle">Tests validate contract compliance</text>
        <text x="4" y="66" fontSize="8" fill="#64748b">Contract = schema + quality rules + SLAs + ownership. Break = producer notifies consumers.</text>
      </svg>
    </div>
  )
}

function AdvancedPatternsDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 65" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Advanced DE Patterns</text>
        {[
          {name:'Data Mesh',desc:'Decentralised domain ownership',color:'#4f8ef7'},
          {name:'Data Fabric',desc:'Unified metadata + AI discov.',color:'#8b5cf6'},
          {name:'Event Sourcing',desc:'Immutable event log as truth',color:'#22c55e'},
          {name:'CQRS',desc:'Separate read/write models',color:'#f59e0b'},
        ].map((p,i)=>(
          <g key={p.name}>
            <rect x={4+i*113} y="18" width="107" height="30" rx="4" fill={p.color} opacity=".12" stroke={p.color} strokeWidth="1.2"/>
            <text x={57+i*113} y="29" fontSize="8.5" fontWeight="700" fill={p.color} textAnchor="middle">{p.name}</text>
            <text x={57+i*113} y="40" fontSize="7" fill="#475569" textAnchor="middle">{p.desc}</text>
          </g>
        ))}
        <text x="4" y="60" fontSize="8" fill="#64748b">Data Mesh = federated governance + product thinking. Domain teams own their data products end-to-end.</text>
      </svg>
    </div>
  )
}

function InterviewProjectDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 480 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">End-to-End DE Project Blueprint</text>
        {[
          {phase:'Ingest',desc:'Autoloader / Kafka',color:'#4f8ef7'},
          {phase:'Bronze',desc:'Raw Delta table',color:'#f59e0b'},
          {phase:'Silver',desc:'Clean + DQ checks',color:'#22c55e'},
          {phase:'Gold',desc:'Agg / star schema',color:'#8b5cf6'},
          {phase:'Serve',desc:'SQL WH / API',color:'#ef4444'},
        ].map((s,i)=>(
          <g key={s.phase}>
            <rect x={4+i*94} y="18" width="88" height="44" rx="4" fill={s.color} opacity=".12" stroke={s.color} strokeWidth="1.5"/>
            <text x={48+i*94} y="34" fontSize="9.5" fontWeight="700" fill={s.color} textAnchor="middle">{s.phase}</text>
            <text x={48+i*94} y="47" fontSize="7.5" fill="#475569" textAnchor="middle">{s.desc}</text>
            {i<4&&<polygon points={`${94+i*94},40 ${98+i*94},36 ${98+i*94},44`} fill={s.color} opacity=".6"/>}
          </g>
        ))}
        <text x="4" y="74" fontSize="8" fill="#64748b">Add: CI/CD (GitHub Actions), IaC (Terraform), monitoring (Grafana), data contracts for full project.</text>
      </svg>
    </div>
  )
}

function StarSchemaDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 92" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Star Schema</text>
        <rect x="175" y="26" width="110" height="28" rx="4" fill="#4f8ef7" opacity=".2" stroke="#4f8ef7" strokeWidth="2"/>
        <text x="230" y="44" fontSize="9.5" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Fact Table</text>
        {[{name:'dim_date',x:10,y:16},{name:'dim_customer',x:10,y:52},{name:'dim_product',x:340,y:16},{name:'dim_store',x:340,y:52}].map(d=>(
          <g key={d.name}>
            <rect x={d.x} y={d.y} width="110" height="22" rx="3" fill="#22c55e" opacity=".14" stroke="#22c55e" strokeWidth="1.2"/>
            <text x={d.x+55} y={d.y+14} fontSize="8.5" fill="#22c55e" textAnchor="middle">{d.name}</text>
            <line x1={d.x>200?d.x:d.x+110} y1={d.y+11} x2={d.x>200?340:175} y2="40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2"/>
          </g>
        ))}
        <text x="4" y="88" fontSize="8" fill="#64748b">Fact = FK refs + measures. Dim = descriptive attributes. Simple joins, fast BI queries.</text>
      </svg>
    </div>
  )
}

function SnowflakeSchemaDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Snowflake Schema — Normalised Dims</text>
        <rect x="175" y="26" width="110" height="24" rx="4" fill="#4f8ef7" opacity=".2" stroke="#4f8ef7" strokeWidth="2"/>
        <text x="230" y="42" fontSize="9" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Fact Table</text>
        <rect x="10" y="20" width="120" height="18" rx="3" fill="#22c55e" opacity=".14" stroke="#22c55e" strokeWidth="1.2"/>
        <text x="70" y="32" fontSize="8.5" fill="#22c55e" textAnchor="middle">dim_date</text>
        <rect x="10" y="46" width="120" height="18" rx="3" fill="#22c55e" opacity=".14" stroke="#22c55e" strokeWidth="1.2"/>
        <text x="70" y="58" fontSize="8.5" fill="#22c55e" textAnchor="middle">dim_customer</text>
        <rect x="330" y="20" width="120" height="18" rx="3" fill="#8b5cf6" opacity=".14" stroke="#8b5cf6" strokeWidth="1.2"/>
        <text x="390" y="32" fontSize="8.5" fill="#8b5cf6" textAnchor="middle">dim_product</text>
        <rect x="330" y="46" width="120" height="18" rx="3" fill="#8b5cf6" opacity=".14" stroke="#8b5cf6" strokeWidth="1.2"/>
        <text x="390" y="58" fontSize="8.5" fill="#8b5cf6" textAnchor="middle">dim_category</text>
        <line x1="130" y1="29" x2="175" y2="38" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2"/>
        <line x1="130" y1="55" x2="175" y2="42" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2"/>
        <line x1="330" y1="29" x2="285" y2="38" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2"/>
        <line x1="330" y1="55" x2="390" y2="35" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2"/>
        <text x="4" y="76" fontSize="8" fill="#64748b">Snowflaked dims are normalised (3NF). More joins, less storage redundancy. Less common in DWH.</text>
      </svg>
    </div>
  )
}

function DataVaultDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 80" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">Data Vault 2.0 — Hub / Link / Satellite</text>
        <rect x="170" y="18" width="120" height="28" rx="4" fill="#4f8ef7" opacity=".18" stroke="#4f8ef7" strokeWidth="2"/>
        <text x="230" y="36" fontSize="9.5" fontWeight="700" fill="#4f8ef7" textAnchor="middle">Hub (business key)</text>
        <rect x="10" y="40" width="140" height="28" rx="4" fill="#22c55e" opacity=".14" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="80" y="58" fontSize="9" fill="#22c55e" textAnchor="middle">Link (relationship)</text>
        <rect x="310" y="40" width="140" height="28" rx="4" fill="#8b5cf6" opacity=".14" stroke="#8b5cf6" strokeWidth="1.5"/>
        <text x="380" y="58" fontSize="9" fill="#8b5cf6" textAnchor="middle">Satellite (attributes)</text>
        <line x1="170" y1="32" x2="150" y2="40" stroke="#94a3b8" strokeWidth="1.2"/>
        <line x1="290" y1="32" x2="310" y2="40" stroke="#94a3b8" strokeWidth="1.2"/>
        <text x="4" y="76" fontSize="8" fill="#64748b">Hubs = distinct business keys. Links = M:M relations. Satellites = history + context. Fully auditable.</text>
      </svg>
    </div>
  )
}

function SCDCodeDiagram() {
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:16,marginBottom:20}}>
      <svg viewBox="0 0 460 70" width="100%" style={{display:'block'}}>
        <text x="4" y="12" fontSize="10" fontWeight="700" fill="#1e293b">SCD Type 2 — MERGE Pattern</text>
        {[['Step','Action','Detail'],['1','Expire current row','SET effective_end = today, is_current = false WHERE key matches AND is_current = true'],['2','Insert new row','INSERT with new values, effective_start = today, is_current = true'],['3','Skip unchanged','WHERE hash(cols) = hash(source_cols)']].map((r,i)=>(
          <g key={r[0]+i}>
            <rect x="4" y={14+i*13} width="452" height="11" rx="1" fill={i===0?'#1e293b':i%2===0?'#f8fafc':'white'} opacity={i===0?.08:.4}/>
            <text x="10" y={24+i*13} fontSize="7.5" fontWeight={i===0?'700':'400'} fill={i===0?'#64748b':'#64748b'}>{r[0]}</text>
            <text x="50" y={24+i*13} fontSize="7.5" fontWeight={i===0?'700':'500'} fill={i===0?'#64748b':i===1?'#ef4444':i===2?'#22c55e':'#4f8ef7'}>{r[1]}</text>
            <text x="180" y={24+i*13} fontSize="7" fill="#64748b">{r[2]}</text>
          </g>
        ))}
        <text x="4" y="66" fontSize="8" fill="#64748b">Delta MERGE INTO handles SCD2 atomically. Add hash column for change detection efficiency.</text>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function ArchitectureAnimation() {
  const archs = [
    { name: 'Lambda', color: '#4f8ef7', layers: ['Batch Layer (Spark)', 'Speed Layer (Kafka)', 'Serving Layer (Redis)'], note: 'Two codebases to maintain' },
    { name: 'Kappa', color: '#8b5cf6', layers: ['Stream Layer (Kafka+Flink)', 'Serving Layer (Delta)'], note: 'One unified codebase' },
    { name: 'Lakehouse', color: '#f59e0b', layers: ['ADLS Gen2 (storage)', 'Delta Lake (format)', 'Databricks (compute)'], note: 'Current best practice' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24, padding: 20, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      {archs.map(a => (
        <div key={a.name} style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: a.color, marginBottom: 8, fontSize: '.9rem' }}>{a.name}</div>
          {a.layers.map((l, i) => (
            <div key={i} style={{ background: a.color + '18', border: `1px solid ${a.color}40`, borderRadius: 6, padding: '6px 8px', fontSize: '.75rem', marginBottom: 4, color: 'var(--text-2)' }}>{l}</div>
          ))}
          <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 6, fontStyle: 'italic' }}>{a.note}</div>
        </div>
      ))}
    </div>
  )
}

function CiCdAnimation() {
  const steps = ['PR Opened', 'CI Tests', 'Staging Deploy', 'Smoke Tests', 'Prod Deploy']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24, padding: 20, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflowX: 'auto' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <div style={{ background: '#22c55e18', border: '1px solid #22c55e40', borderRadius: 6, padding: '8px 12px', fontSize: '.78rem', fontWeight: 600, color: '#16a34a', textAlign: 'center', minWidth: 90 }}>{s}</div>
          {i < steps.length - 1 && <div style={{ color: 'var(--text-3)', fontSize: '1.2rem' }}>→</div>}
        </div>
      ))}
    </div>
  )
}

function DataContractAnimation() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 24, padding: 20, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <div style={{ background: '#4f8ef718', border: '1px solid #4f8ef740', borderRadius: 8, padding: 16, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, color: '#4f8ef7', marginBottom: 8 }}>Producer</div>
        <div style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>orders_events topic</div>
        <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 4 }}>Owns schema definition</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ background: '#f59e0b18', border: '1px solid #f59e0b', borderRadius: 8, padding: '8px 12px', fontSize: '.75rem', fontWeight: 700, color: '#d97706', marginBottom: 4 }}>Data Contract</div>
        <div style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>Avro Schema v2.1</div>
        <div style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>SLA: 99.9% uptime</div>
      </div>
      <div style={{ background: '#8b5cf618', border: '1px solid #8b5cf640', borderRadius: 8, padding: 16, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Consumer</div>
        <div style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>analytics pipeline</div>
        <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 4 }}>Subscribes to contract</div>
      </div>
    </div>
  )
}

function ObservabilityAnimation() {
  const pillars = [
    { name: 'Metrics', color: '#4f8ef7', items: ['row_count', 'latency_p99', 'error_rate'] },
    { name: 'Logs', color: '#22c55e', items: ['batch_started', 'batch_complete', 'batch_failed'] },
    { name: 'Traces', color: '#f59e0b', items: ['ingest→transform', 'transform→write', 'end-to-end'] },
  ]
  return (
    <div style={{ marginBottom: 24, padding: 20, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
        {pillars.map(p => (
          <div key={p.name} style={{ background: p.color + '12', border: `1px solid ${p.color}40`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 700, color: p.color, marginBottom: 8, fontSize: '.85rem' }}>{p.name}</div>
            {p.items.map(item => <div key={item} style={{ fontSize: '.75rem', color: 'var(--text-2)', marginBottom: 3 }}>• {item}</div>)}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--text-3)' }}>↓ all signals flow to →</div>
      <div style={{ background: '#ef444418', border: '1px solid #ef444440', borderRadius: 8, padding: 10, textAlign: 'center', marginTop: 8, fontSize: '.82rem', fontWeight: 600, color: '#dc2626' }}>Azure Monitor Dashboard + PagerDuty Alerts</div>
    </div>
  )
}

function SystemDesignAnimation() {
  const [scenario, setScenario] = useState<'batch'|'stream'|'hybrid'>('batch')
  const designs: Record<string,{flow:string[],latency:string,use:string,color:string}> = {
    batch:{flow:['Source DB → Blob landing zone','ADF/Airflow triggers at 02:00','Spark reads + transforms','Writes to Delta Gold','BI refreshes at 06:00'],latency:'Hours',use:'Daily reporting, historical analysis',color:'#4f8ef7'},
    stream:{flow:['App events → Kafka topic','Spark Structured Streaming','Aggregations every 30s','Write to Delta (streaming)','Dashboard auto-refreshes'],latency:'Seconds',use:'Real-time dashboards, fraud detection',color:'#22c55e'},
    hybrid:{flow:['Batch backfill → Delta Gold','Streaming layer patches latest partition','Lambda pattern: merge at serving time','Cache layer for sub-second reads'],latency:'Mixed',use:'Near-real-time + historical blend',color:'#8b5cf6'},
  }
  const sel = designs[scenario]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>System Design — Batch vs Stream vs Hybrid</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['batch','stream','hybrid'] as const).map(k=>(
          <button key={k} onClick={()=>setScenario(k)} style={{flex:1,padding:'7px 0',borderRadius:8,border:`2px solid ${scenario===k?designs[k].color:'var(--border)'}`,background:scenario===k?`${designs[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.82rem',color:scenario===k?designs[k].color:'#94a3b8',textTransform:'capitalize'}}>{k}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:8}}>
        {sel.flow.map((s,i)=>(
          <div key={s} style={{display:'flex',gap:8,alignItems:'center',fontSize:'.78rem',color:'#1e293b'}}>
            <span style={{width:18,height:18,borderRadius:'50%',background:sel.color,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.62rem',fontWeight:800,flexShrink:0}}>{i+1}</span>
            {s}
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8}}>
        {[['Latency',sel.latency],['Best for',sel.use]].map(([k,v])=>(
          <div key={k} style={{flex:1,padding:'7px 10px',borderRadius:8,background:'white',border:'1px solid var(--border)'}}>
            <div style={{fontSize:'.68rem',color:'#64748b'}}>{k}</div>
            <div style={{fontWeight:700,fontSize:'.78rem',color:'#1e293b'}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PipelinePatternsAnimation() {
  const [pat, setPat] = useState<'medallion'|'event'|'cqrs'>('medallion')
  const patterns: Record<string,{desc:string,stages:string[],pro:string,con:string,color:string}> = {
    medallion:{desc:'Bronze → Silver → Gold layered quality zones',stages:['Bronze: raw ingestion, immutable','Silver: cleaned, joined, deduplicated','Gold: business aggregations, ML features'],pro:'Simple, auditable, widely adopted',con:'Latency through each layer',color:'#f59e0b'},
    event:{desc:'Event-driven pipeline triggered by data arrival',stages:['File lands → S3 Event → Lambda','Lambda triggers Glue/ADF job','Job writes to next stage'],pro:'No polling, near-real-time, cost-efficient',con:'Error handling complexity',color:'#4f8ef7'},
    cqrs:{desc:'Command/Query Responsibility Segregation',stages:['Write model: optimized for ingestion (MoR)','Read model: optimized for queries (CoW)','Sync via compaction or materialized view'],pro:'Independent read/write scaling',con:'Eventual consistency between models',color:'#8b5cf6'},
  }
  const sel = patterns[pat]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Pipeline Patterns</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['medallion','event','cqrs'] as const).map(k=>(
          <button key={k} onClick={()=>setPat(k)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`2px solid ${pat===k?patterns[k].color:'var(--border)'}`,background:pat===k?`${patterns[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.78rem',color:pat===k?patterns[k].color:'#94a3b8',textTransform:'capitalize'}}>{k}</button>
        ))}
      </div>
      <div style={{fontSize:'.78rem',color:'#1e293b',marginBottom:8}}>{sel.desc}</div>
      {sel.stages.map(s=><div key={s} style={{padding:'5px 10px',marginBottom:4,borderRadius:6,background:'white',border:'1px solid var(--border)',fontSize:'.75rem',color:'#475569'}}>→ {s}</div>)}
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <div style={{flex:1,padding:'6px 10px',borderRadius:7,background:'#f0fdf4',border:'1px solid #4ade80',fontSize:'.72rem',color:'#166534'}}>✓ {sel.pro}</div>
        <div style={{flex:1,padding:'6px 10px',borderRadius:7,background:'#fef2f2',border:'1px solid #f87171',fontSize:'.72rem',color:'#991b1b'}}>✗ {sel.con}</div>
      </div>
    </div>
  )
}

function SCDTypesAnimation() {
  const [type, setType] = useState<1|2|3>(2)
  const rows: Record<number,{headers:string[],data:string[][]}>= {
    1:{headers:['customer_id','name','city'],data:[['101','Alice','New York'],['→ UPDATE city',' ',' '],['101','Alice','Boston']]},
    2:{headers:['sk','customer_id','name','city','valid_from','valid_to','is_current'],data:[['1','101','Alice','New York','2023-01-01','2024-03-15','false'],['2','101','Alice','Boston','2024-03-15','9999-12-31','true']]},
    3:{headers:['customer_id','name','city_current','city_prev'],data:[['101','Alice','Boston','New York']]},
  }
  const notes: Record<number,string> = {
    1:'Overwrites old value — no history retained',
    2:'New row per change — full history, most common in DE',
    3:'One extra column for previous value — limited to one prior state',
  }
  const sel = rows[type]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>SCD Types — Live Table</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {([1,2,3] as const).map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:'7px 0',borderRadius:8,border:`2px solid ${type===t?'#4f8ef7':'var(--border)'}`,background:type===t?'#eff6ff':'white',cursor:'pointer',fontWeight:800,fontSize:'.9rem',color:type===t?'#3b82f6':'#94a3b8'}}>Type {t}</button>
        ))}
      </div>
      <div style={{overflowX:'auto',marginBottom:8}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.72rem',fontFamily:'monospace'}}>
          <thead><tr>{sel.headers.map(h=><th key={h} style={{padding:'5px 8px',background:'#1e293b',color:'white',textAlign:'left',fontWeight:700,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
          <tbody>{sel.data.map((row,i)=><tr key={i} style={{background:i===sel.data.length-1?'#eff6ff':i%2===0?'white':'#f8fafc'}}>{row.map((cell,j)=><td key={j} style={{padding:'4px 8px',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div style={{fontSize:'.75rem',color:'#64748b'}}>{notes[type]}</div>
    </div>
  )
}

function TestingAnimation() {
  const [layer, setLayer] = useState<'unit'|'integration'|'e2e'>('unit')
  const layers: Record<string,{tools:string[],what:string,speed:string,color:string}> = {
    unit:{tools:['pytest','pyspark local mode','pandas assert','dbt test'],what:'Individual functions, SQL logic, schema checks',speed:'Fast (<1 min)',color:'#22c55e'},
    integration:{tools:['docker-compose','testcontainers','Delta local','Airflow dag.test()'],what:'End-to-end data flow through component boundaries',speed:'Medium (1–10 min)',color:'#4f8ef7'},
    e2e:{tools:['Databricks Jobs','ADF pipeline runs','dbt build --profiles-dir'],what:'Full pipeline on production-like data',speed:'Slow (10 min–hours)',color:'#8b5cf6'},
  }
  const sel = layers[layer]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Testing Pyramid for DE</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['unit','integration','e2e'] as const).map(k=>(
          <button key={k} onClick={()=>setLayer(k)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`2px solid ${layer===k?layers[k].color:'var(--border)'}`,background:layer===k?`${layers[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.82rem',color:layer===k?layers[k].color:'#94a3b8',textTransform:'capitalize'}}>{k}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {[['Tools',sel.tools.join(', ')],['What',sel.what],['Speed',sel.speed]].map(([k,v])=>(
          <div key={k} style={{padding:'7px 12px',borderRadius:8,background:'white',border:'1px solid var(--border)',display:'flex',gap:8}}>
            <span style={{minWidth:60,fontSize:'.72rem',color:'#64748b'}}>{k}</span>
            <span style={{fontSize:'.78rem',color:'#1e293b'}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DBTAnimation() {
  const [node, setNode] = useState<'source'|'staging'|'intermediate'|'mart'>('staging')
  const nodes: Record<string,{layer:string,materializ:string,tests:string[],color:string}> = {
    source:{layer:'Raw schema',materializ:'External (no build)',tests:['not_null','unique','relationships'],color:'#94a3b8'},
    staging:{layer:'stg_*: renamed + typed',materializ:'view (default)',tests:['not_null','unique'],color:'#4f8ef7'},
    intermediate:{layer:'int_*: joins + business logic',materializ:'ephemeral or table',tests:['accepted_values','expression_is_true'],color:'#8b5cf6'},
    mart:{layer:'dim_* / fct_*: final models',materializ:'table or incremental',tests:['not_null','unique','relationships'],color:'#f59e0b'},
  }
  const sel = nodes[node]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>dbt — Layer Explorer</div>
      <div style={{display:'flex',gap:4,marginBottom:12}}>
        {(['source','staging','intermediate','mart'] as const).map(k=>(
          <button key={k} onClick={()=>setNode(k)} style={{flex:1,padding:'5px 0',borderRadius:8,border:`2px solid ${node===k?nodes[k].color:'var(--border)'}`,background:node===k?`${nodes[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.72rem',color:node===k?nodes[k].color:'#94a3b8',textTransform:'capitalize'}}>{k}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {[['Layer',sel.layer],['Materialization',sel.materializ],['Tests',sel.tests.join(', ')]].map(([k,v])=>(
          <div key={k} style={{padding:'7px 12px',borderRadius:8,background:'white',border:'1px solid var(--border)',display:'flex',gap:8}}>
            <span style={{minWidth:80,fontSize:'.72rem',color:'#64748b'}}>{k}</span>
            <span style={{fontSize:'.78rem',color:'#1e293b',fontFamily:k==='Materialization'?'monospace':undefined}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TerraformAnimation() {
  const [cmd, setCmd] = useState<'plan'|'apply'|'destroy'|'import'>('plan')
  const cmds: Record<string,{desc:string,safe:boolean,output:string,color:string}> = {
    plan:{desc:'Preview changes without applying — dry run',safe:true,output:'Plan: 3 to add, 1 to change, 0 to destroy',color:'#4f8ef7'},
    apply:{desc:'Apply planned changes to real infrastructure',safe:true,output:'Apply complete! Resources: 3 added, 1 changed',color:'#22c55e'},
    destroy:{desc:'Tear down all managed infrastructure',safe:false,output:'Destroy complete! Resources: 4 destroyed',color:'#ef4444'},
    import:{desc:'Bring existing resource under Terraform state',safe:true,output:'Import successful! Resource state written.',color:'#8b5cf6'},
  }
  const sel = cmds[cmd]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Terraform Commands</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['plan','apply','destroy','import'] as const).map(k=>(
          <button key={k} onClick={()=>setCmd(k)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`2px solid ${cmd===k?cmds[k].color:'var(--border)'}`,background:cmd===k?`${cmds[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.78rem',color:cmd===k?cmds[k].color:'#94a3b8'}}>{k}</button>
        ))}
      </div>
      <div style={{marginBottom:8,fontSize:'.8rem',color:'#1e293b'}}>{sel.desc}</div>
      <code style={{display:'block',padding:'8px 12px',borderRadius:8,background:'#1e293b',color:sel.safe?'#86efac':'#f87171',fontSize:'.78rem',marginBottom:8}}>$ terraform {cmd} → {sel.output}</code>
      {!sel.safe&&<div style={{padding:'6px 12px',borderRadius:6,background:'#fef2f2',border:'1px solid #f87171',fontSize:'.75rem',color:'#991b1b'}}>⚠️ Destructive — always run plan first and confirm state matches expectations</div>}
    </div>
  )
}

function SecurityAnimation() {
  const [domain, setDomain] = useState<'authn'|'authz'|'encrypt'|'audit'>('authz')
  const domains: Record<string,{title:string,controls:string[],color:string}> = {
    authn:{title:'Authentication',controls:['Azure AD / Entra ID — SSO for all Databricks/ADF/ADLS','Service principals for pipeline-to-service auth','Managed Identity — no secret rotation needed','MFA enforced for human users'],color:'#4f8ef7'},
    authz:{title:'Authorization',controls:['Unity Catalog RBAC — object-level grants','ADLS POSIX ACLs on container/folder level','Databricks workspace permissions (Can Use / Can Manage)','ADF linked service + Key Vault for credential isolation'],color:'#8b5cf6'},
    encrypt:{title:'Encryption',controls:['ADLS: AES-256 at rest (default), CMK for compliance','TLS 1.2+ in transit — all Azure services','Column-level encryption for PII in Delta tables','Azure Key Vault — rotate keys without app changes'],color:'#22c55e'},
    audit:{title:'Audit & Compliance',controls:['Azure Monitor + Log Analytics — all control plane ops','Databricks audit logs — who ran what query when','Unity Catalog: table access audit trail','Data classification tags (PII, Confidential) via Purview'],color:'#f59e0b'},
  }
  const sel = domains[domain]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Security — Control Domains</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['authn','authz','encrypt','audit'] as const).map(k=>(
          <button key={k} onClick={()=>setDomain(k)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`2px solid ${domain===k?domains[k].color:'var(--border)'}`,background:domain===k?`${domains[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.72rem',color:domain===k?domains[k].color:'#94a3b8'}}>{domains[k].title}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {sel.controls.map(c=><div key={c} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${sel.color}33`,background:`${sel.color}0d`,fontSize:'.78rem',color:'#1e293b'}}>• {c}</div>)}
      </div>
    </div>
  )
}

function MonitoringProdAnimation() {
  const [tab, setTab] = useState<'sla'|'alert'|'dashboard'>('sla')
  const content: Record<string,string[]> = {
    sla:['Define SLA: "Gold table refreshed by 07:00 daily"','Track: pipeline_run_end_time < 07:00','Alert: page on-call if 06:45 and still running','Escalate: data consumers notified if SLA missed'],
    alert:['Data freshness > 2h → WARN','Row count deviation > 20% → CRITICAL','Schema change detected → BLOCK downstream','Null rate > 5% on key columns → WARN'],
    dashboard:['Pipeline health: last run status + duration trend','Data freshness per table: time since last update','Cost dashboard: compute spend by pipeline/team','Backfill tracker: which tables need re-runs'],
  }
  const color: Record<string,string> = {sla:'#f59e0b',alert:'#ef4444',dashboard:'#4f8ef7'}
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Monitoring — Production Data Platform</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['sla','alert','dashboard'] as const).map(k=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`2px solid ${tab===k?color[k]:'var(--border)'}`,background:tab===k?`${color[k]}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.82rem',color:tab===k?color[k]:'#94a3b8',textTransform:'capitalize'}}>{k==='sla'?'SLA':k==='alert'?'Alerts':'Dashboards'}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {content[tab].map(c=><div key={c} style={{padding:'7px 12px',borderRadius:8,border:`1px solid ${color[tab]}33`,background:`${color[tab]}0d`,fontSize:'.78rem',color:'#1e293b'}}>→ {c}</div>)}
      </div>
    </div>
  )
}

function DisasterRecoveryAnimation() {
  const [strategy, setStrategy] = useState<'backup'|'geo'|'rpo'>('rpo')
  const strats: Record<string,{desc:string,detail:string,color:string}> = {
    rpo:{desc:'RPO / RTO targets drive your DR design',detail:'RPO 0 → geo-replication active-active (expensive)\nRPO 1h → ADLS cross-region replication\nRPO 24h → daily Delta table backups to secondary region',color:'#4f8ef7'},
    backup:{desc:'Delta table backup strategies',detail:'Option 1: DEEP CLONE to secondary storage account\nOption 2: COPY INTO from bronze → cold tier\nOption 3: Delta Sharing to isolated read replica\nAlways test restore — a backup you have not restored is not a backup',color:'#8b5cf6'},
    geo:{desc:'Geo-redundant setup on Azure',detail:'ADLS RA-GRS: async replication to secondary region\nDatabricks: replicate workspace + cluster policies\nKey Vault: soft-delete + purge protection\nAirflow: active/passive setup with shared metadata DB',color:'#22c55e'},
  }
  const sel = strats[strategy]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Disaster Recovery</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['rpo','backup','geo'] as const).map(k=>(
          <button key={k} onClick={()=>setStrategy(k)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`2px solid ${strategy===k?strats[k].color:'var(--border)'}`,background:strategy===k?`${strats[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.82rem',color:strategy===k?strats[k].color:'#94a3b8',textTransform:'uppercase'}}>{k==='rpo'?'RPO/RTO':k==='geo'?'Geo-HA':'Backup'}</button>
        ))}
      </div>
      <div style={{fontWeight:700,color:sel.color,marginBottom:6,fontSize:'.82rem'}}>{sel.desc}</div>
      {sel.detail.split('\n').map(line=><div key={line} style={{padding:'5px 10px',marginBottom:3,borderRadius:6,background:'white',border:'1px solid var(--border)',fontSize:'.76rem',color:'#475569'}}>→ {line}</div>)}
    </div>
  )
}

function CostAnimation() {
  const [resource, setResource] = useState<'compute'|'storage'|'network'>('compute')
  const tips: Record<string,{items:string[],color:string}> = {
    compute:{color:'#4f8ef7',items:['Use spot/preemptible instances for batch (60–80% cheaper)','Auto-terminate clusters after 30 min idle','Right-size: start with 4-8 workers, scale with data','Photon: fewer DBUs per query on large tables','SQL Warehouses: serverless stops billing immediately']},
    storage:{color:'#22c55e',items:['Tier cold data to cool/archive (80% cheaper than hot)','VACUUM regularly: orphan files cost real money','Use Delta OPTIMIZE: fewer files = fewer list API calls','Compress well: Parquet+Zstd ~3-10x smaller than CSV','Delete dev/test tables regularly']},
    network:{color:'#f59e0b',items:['Same-region traffic is free; cross-region costs ~$0.02/GB','Use Private Endpoints to avoid internet egress','Collocate compute and storage in same region','Batch small writes: many small PUT calls vs few large ones','Monitor egress in Azure Cost Management']},
  }
  const sel = tips[resource]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Cost Optimization Tips</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['compute','storage','network'] as const).map(k=>(
          <button key={k} onClick={()=>setResource(k)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`2px solid ${resource===k?tips[k].color:'var(--border)'}`,background:resource===k?`${tips[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.82rem',color:resource===k?tips[k].color:'#94a3b8',textTransform:'capitalize'}}>{k}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {sel.items.map(item=><div key={item} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${sel.color}33`,background:`${sel.color}0d`,fontSize:'.76rem',color:'#1e293b'}}>💡 {item}</div>)}
      </div>
    </div>
  )
}

function PerformanceAnimation() {
  const [area, setArea] = useState<'read'|'write'|'query'>('query')
  const areas: Record<string,{tips:string[],color:string}> = {
    read:{color:'#4f8ef7',tips:['Partition pruning: filter on partition column → skip entire folders','Predicate pushdown: push filters to Parquet row-group level','Column pruning: SELECT only needed columns','Z-ORDER by common filter columns','Broadcast small lookup tables (<10MB)']},
    write:{color:'#22c55e',tips:['Target 128–256MB files: fewer files = faster metadata','replaceWhere instead of full overwrite','Enable Deletion Vectors for fast UPDATE/DELETE','Auto Optimize (Databricks): auto-compacts on write','Tune spark.sql.shuffle.partitions to data size']},
    query:{color:'#8b5cf6',tips:['AQE: enable spark.sql.adaptive.enabled=true (default in DBR)','CBO: ANALYZE TABLE for better join ordering','Avoid explode() on large arrays without filtering first','Use approx_count_distinct instead of count(distinct)','Cache DataFrames accessed multiple times in same job']},
  }
  const sel = areas[area]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Performance — Tuning Tips</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['read','write','query'] as const).map(k=>(
          <button key={k} onClick={()=>setArea(k)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`2px solid ${area===k?areas[k].color:'var(--border)'}`,background:area===k?`${areas[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.82rem',color:area===k?areas[k].color:'#94a3b8',textTransform:'capitalize'}}>{k}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {sel.tips.map(t=><div key={t} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${sel.color}33`,background:`${sel.color}0d`,fontSize:'.76rem',color:'#1e293b'}}>• {t}</div>)}
      </div>
    </div>
  )
}

function AdvancedPatternsAnimation() {
  const [pat2, setPat2] = useState<'idempotent'|'exactly_once'|'late_data'>('idempotent')
  const pats: Record<string,{desc:string,impl:string,color:string}> = {
    idempotent:{desc:'Running a pipeline N times produces the same result as running it once',impl:'Use replaceWhere to overwrite the same partition\nDELETE + INSERT in a transaction\nMERGE with upsert on natural key',color:'#4f8ef7'},
    exactly_once:{desc:'Each event processed exactly once — no duplicates, no loss',impl:'Kafka consumer: commit offset only after write success\nDelta MERGE with dedup on message_id\nCheckpoint dir in Structured Streaming',color:'#22c55e'},
    late_data:{desc:'Events arrive after their event_time window has closed',impl:'Watermark: drop events older than threshold\nLate window: accumulate for N minutes extra\nReprocessing: daily late-data catch-up job',color:'#8b5cf6'},
  }
  const sel = pats[pat2]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Advanced Production Patterns</div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:12}}>
        {(['idempotent','exactly_once','late_data'] as const).map(k=>(
          <button key={k} onClick={()=>setPat2(k)} style={{padding:'5px 12px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:700,fontSize:'.78rem',background:pat2===k?pats[k].color:'var(--surface-3)',color:pat2===k?'white':'var(--text-secondary)'}}>{k.replace('_',' ')}</button>
        ))}
      </div>
      <div style={{fontWeight:600,fontSize:'.82rem',color:'#1e293b',marginBottom:8}}>{sel.desc}</div>
      {sel.impl.split('\n').map(line=><div key={line} style={{padding:'5px 10px',marginBottom:3,borderRadius:6,background:'white',border:`1px solid ${sel.color}33`,fontSize:'.75rem',color:'#475569'}}>→ {line}</div>)}
    </div>
  )
}

function InterviewProjectAnimation() {
  const [phase, setPhase] = useState(0)
  const phases = [
    {name:'Ingest',desc:'Land raw data in Bronze (ADLS) via ADF/Autoloader. Schema-on-read, immutable.'},
    {name:'Transform',desc:'Spark/dbt: clean, deduplicate, join in Silver. Enforce schema, add row hashes.'},
    {name:'Model',desc:'Gold: star schema or Delta tables. dbt models with tests and documentation.'},
    {name:'Orchestrate',desc:'Airflow or Databricks Workflows DAG. Handle failures with retries + alerts.'},
    {name:'Quality',desc:'Great Expectations or dbt tests. Block pipeline if DQ checks fail.'},
    {name:'Observe',desc:'Azure Monitor dashboards. SLA tracking. Cost alerts.'},
  ]
  const colors = ['#4f8ef7','#8b5cf6','#f59e0b','#22c55e','#ec4899','#ef4444']
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>End-to-End Project Blueprint</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:12}}>
        {phases.map((p,i)=>(
          <button key={p.name} onClick={()=>setPhase(i)} style={{padding:'5px 12px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:700,fontSize:'.78rem',background:phase===i?colors[i]:'var(--surface-3)',color:phase===i?'white':'var(--text-secondary)'}}>{i+1}. {p.name}</button>
        ))}
      </div>
      <div style={{padding:14,borderRadius:10,border:`2px solid ${colors[phase]}44`,background:`${colors[phase]}0d`}}>
        <div style={{fontWeight:700,color:colors[phase],marginBottom:6,fontSize:'.9rem'}}>{phases[phase].name}</div>
        <div style={{fontSize:'.82rem',color:'#1e293b'}}>{phases[phase].desc}</div>
      </div>
    </div>
  )
}

function StarSchemaAnimation() {
  const [sel4, setSel4] = useState<string|null>(null)
  const tables = [
    {name:'fct_sales',type:'Fact',cols:['sale_sk (PK)','date_fk','product_fk','customer_fk','amount','quantity'],color:'#4f8ef7'},
    {name:'dim_date',type:'Dim',cols:['date_sk (PK)','date','year','month','quarter','is_weekend'],color:'#22c55e'},
    {name:'dim_product',type:'Dim',cols:['product_sk (PK)','product_id','name','category','subcategory'],color:'#f59e0b'},
    {name:'dim_customer',type:'Dim',cols:['customer_sk (PK)','customer_id','name','region','segment'],color:'#8b5cf6'},
  ]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Star Schema — Click a Table</div>
      <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
        {tables.map(t=>(
          <button key={t.name} onClick={()=>setSel4(sel4===t.name?null:t.name)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`2px solid ${sel4===t.name?t.color:'var(--border)'}`,background:sel4===t.name?`${t.color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.75rem',color:sel4===t.name?t.color:'#94a3b8'}}>{t.name}</button>
        ))}
      </div>
      {sel4&&(() => {
        const t = tables.find(x=>x.name===sel4)!
        return (
          <div style={{padding:12,borderRadius:8,border:`2px solid ${t.color}44`,background:`${t.color}0d`}}>
            <div style={{fontWeight:700,color:t.color,marginBottom:6,fontSize:'.85rem'}}>{t.name} ({t.type} table)</div>
            {t.cols.map(c=><div key={c} style={{fontSize:'.76rem',color:'#1e293b',padding:'2px 0',fontFamily:'monospace'}}>• {c}</div>)}
          </div>
        )
      })()}
    </div>
  )
}

function SnowflakeSchemaAnimation() {
  const [view2, setView2] = useState<'star'|'snowflake'>('snowflake')
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:'.9rem'}}>Snowflake vs Star Schema</div>
        <div style={{display:'flex',gap:6}}>
          {(['star','snowflake'] as const).map(v=>(
            <button key={v} onClick={()=>setView2(v)} style={{padding:'4px 12px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:700,fontSize:'.8rem',background:view2===v?'#4f8ef7':'var(--surface-3)',color:view2===v?'white':'var(--text-secondary)'}}>{v}</button>
          ))}
        </div>
      </div>
      {view2==='star' ? (
        <div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {['fct_orders → dim_customer (denormalized: region, country in same table)','fct_orders → dim_product (denormalized: category, subcategory, brand in same table)','Fewer joins → simpler queries → faster BI tools','More storage → redundant data → harder to maintain'].map(l=><div key={l} style={{fontSize:'.76rem',color:'#1e293b',padding:'5px 10px',borderRadius:6,background:'white',border:'1px solid var(--border)'}}>→ {l}</div>)}
          </div>
        </div>
      ) : (
        <div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {['fct_orders → dim_customer → dim_region → dim_country (normalized)','fct_orders → dim_product → dim_category → dim_brand (3 hops)','More joins → complex queries → slower ad-hoc BI','Less storage → easier attribute updates → stricter normalization'].map(l=><div key={l} style={{fontSize:'.76rem',color:'#1e293b',padding:'5px 10px',borderRadius:6,background:'white',border:'1px solid var(--border)'}}>→ {l}</div>)}
          </div>
        </div>
      )}
    </div>
  )
}

function DataVaultAnimation() {
  const [entity, setEntity] = useState<'hub'|'link'|'satellite'>('hub')
  const entities: Record<string,{desc:string,cols:string[],use:string,color:string}> = {
    hub:{desc:'Unique business keys — the "nouns" of your business',cols:['hub_sk (hash PK)','business_key','load_date','record_source'],use:'hub_customer, hub_product, hub_order',color:'#4f8ef7'},
    link:{desc:'Relationships between hubs — the "verbs"',cols:['link_sk (hash PK)','hub_a_fk','hub_b_fk','load_date','record_source'],use:'link_customer_order, link_order_product',color:'#8b5cf6'},
    satellite:{desc:'Descriptive attributes that change over time',cols:['hub_fk or link_fk','load_date','load_end_date','record_source','attribute_1..N'],use:'sat_customer_details, sat_product_desc',color:'#22c55e'},
  }
  const sel = entities[entity]
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Data Vault 2.0 — Building Blocks</div>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {(['hub','link','satellite'] as const).map(k=>(
          <button key={k} onClick={()=>setEntity(k)} style={{flex:1,padding:'7px 0',borderRadius:8,border:`2px solid ${entity===k?entities[k].color:'var(--border)'}`,background:entity===k?`${entities[k].color}15`:'white',cursor:'pointer',fontWeight:700,fontSize:'.82rem',color:entity===k?entities[k].color:'#94a3b8',textTransform:'capitalize'}}>{k}</button>
        ))}
      </div>
      <div style={{padding:12,borderRadius:8,border:`2px solid ${sel.color}44`,background:`${sel.color}0d`}}>
        <div style={{fontWeight:700,color:sel.color,marginBottom:6,fontSize:'.82rem'}}>{sel.desc}</div>
        <div style={{display:'flex',flexDirection:'column',gap:3,marginBottom:6}}>
          {sel.cols.map(c=><div key={c} style={{fontSize:'.74rem',fontFamily:'monospace',color:'#1e293b'}}>• {c}</div>)}
        </div>
        <div style={{fontSize:'.72rem',color:'#64748b',fontStyle:'italic'}}>Examples: {sel.use}</div>
      </div>
    </div>
  )
}

function SCDCodeAnimation() {
  const [impl, setImpl] = useState<'merge'|'scd2_delta'>('merge')
  return (
    <div className="anim-wrap" style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:20,marginBottom:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:'.9rem'}}>SCD Implementation</div>
        <div style={{display:'flex',gap:6}}>
          {(['merge','scd2_delta'] as const).map(v=>(
            <button key={v} onClick={()=>setImpl(v)} style={{padding:'4px 12px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:700,fontSize:'.8rem',background:impl===v?'#4f8ef7':'var(--surface-3)',color:impl===v?'white':'var(--text-secondary)'}}>{v==='merge'?'Type 1 (MERGE)':'Type 2 (Delta)'}</button>
          ))}
        </div>
      </div>
      {impl==='merge' ? (
        <pre style={{background:'#1e293b',color:'#a5f3fc',padding:12,borderRadius:8,fontSize:'.7rem',overflow:'auto',margin:0}}>{`-- SCD Type 1: overwrite current value
MERGE INTO dim_customer t
USING staging_customer s
  ON t.customer_id = s.customer_id
WHEN MATCHED THEN
  UPDATE SET t.city = s.city,
             t.updated_at = current_timestamp()
WHEN NOT MATCHED THEN
  INSERT (customer_id, name, city, updated_at)
  VALUES (s.customer_id, s.name, s.city, now())`}</pre>
      ) : (
        <pre style={{background:'#1e293b',color:'#86efac',padding:12,borderRadius:8,fontSize:'.7rem',overflow:'auto',margin:0}}>{`-- SCD Type 2: new row per change
MERGE INTO dim_customer t
USING (
  SELECT s.*, current_timestamp() AS valid_from,
         '9999-12-31' AS valid_to, true AS is_current
  FROM staging s
) s ON t.customer_id = s.customer_id
     AND t.is_current = true
WHEN MATCHED AND t.city != s.city THEN
  UPDATE SET t.valid_to = s.valid_from,
             t.is_current = false
WHEN NOT MATCHED THEN
  INSERT *`}</pre>
      )}
    </div>
  )
}

// ── SECTIONS ──────────────────────────────────────────────────────────────────

const SECTIONS = [
  { title: 'Level 9 - Production DE', items: [
    { id: 'prod-architecture', label: 'Architecture' },
    { id: 'prod-system-design', label: 'System Design' },
    { id: 'prod-pipeline-patterns', label: 'Pipeline Patterns' },
    { id: 'prod-scd', label: 'SCD' },
    { id: 'prod-cicd', label: 'CI/CD' },
    { id: 'prod-testing', label: 'Testing Strategy' },
    { id: 'prod-dbt', label: 'dbt' },
    { id: 'prod-terraform', label: 'IaC / Terraform' },
    { id: 'prod-security', label: 'Security' },
    { id: 'prod-observability', label: 'Observability' },
    { id: 'prod-monitoring', label: 'Monitoring' },
    { id: 'prod-disaster-recovery', label: 'Disaster Recovery' },
    { id: 'prod-cost', label: 'Cost Opt' },
    { id: 'prod-performance', label: 'Performance' },
    { id: 'prod-data-contracts', label: 'Data Contracts' },
    { id: 'prod-patterns', label: 'Enterprise' },
    { id: 'prod-interview-project', label: 'Capstone' },
  ]},
  { title: 'Data Modeling Mastery', items: [
    { id: 'model-star', label: 'Star Schema' },
    { id: 'model-snowflake', label: 'Snowflake Schema' },
    { id: 'model-datavault', label: 'Data Vault' },
    { id: 'model-scd-code', label: 'SCD Code' },
  ]},
]

export default function Production({ completed, onComplete, onUnmark }: Props) {
  const [activeId, setActiveId] = useState('prod-architecture')
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
  const completeBtn = (id: string) => (
    <button
      onClick={async () => { if (completed.has(id)) { await unmarkTopicComplete(id); onUnmark(id) } else { await markTopicComplete(id); onComplete(id) } }}
      style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: completed.has(id) ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}
    >{completed.has(id) ? 'Undo ✕' : 'Mark Complete ✓'}</button>
  )

  return (
    <div className="page-with-sidebar">
      <Sidebar sections={SECTIONS} activeId={activeId} completed={completed} totalTopics={totalTopics} onItemClick={scrollTo} />
      <main className="main-content">

        {/* ── prod-architecture ── */}
        <section id="prod-architecture" ref={el => { if (el) sectionRefs.current['prod-architecture'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Data Architecture Patterns</h1>
            <p className="topic-desc">Lambda, Kappa, Data Mesh, Lakehouse, and Data Fabric  -  knowing when to choose each architecture is one of the most important senior DE skills. Each solves a different problem at a different cost.</p>
          </div>
          <ArchitectureDiagram />
          <ArchitectureAnimation />
          <CodeBlock lang="text">{`ARCHITECTURE COMPARISON

Lambda Architecture
  Batch layer:  Spark jobs on HDFS/ADLS  -  full historical reprocessing
  Speed layer:  Kafka Streams / Flink  -  low-latency recent data
  Serving layer: Merged view (Redis + HBase / Cassandra)
  Pro: Handles late data naturally; historical accuracy guaranteed
  Con: Two codebases (batch + stream) that must produce identical results
  When to use: Legacy systems; teams already invested in separate batch+stream

Kappa Architecture (Jay Kreps, 2014)
  Everything is a stream. Replay historical data by rewinding Kafka offset.
  Single processing engine (Flink or Spark Structured Streaming) for all data.
  Pro: One codebase, simpler operations, unified semantics
  Con: Replay of years of data is expensive; stream processing harder to debug
  When to use: New greenfield; event-sourced systems; Kafka-first orgs

Data Mesh (Zhamak Dehghani, 2019)
  Domain-oriented: each business domain owns its data products
  Self-serve platform: central team provides infrastructure (Unity Catalog)
  Federated governance: global policies + domain autonomy
  Pro: Scales with org size; domain teams have context to build quality data
  Con: Requires org maturity; data product quality varies; coordination overhead
  When to use: Large orgs (500+ engineers); multiple domains with different needs

Lakehouse (Databricks, 2020) ← Current best practice
  ADLS Gen2 (cheap storage) + Delta Lake (ACID/MVCC) + Databricks (compute)
  Combines data lake economics with data warehouse performance + governance
  Pro: One copy of data; SQL + ML + streaming; Unity Catalog governance
  Con: Vendor lock-in risk; Databricks DBU costs; not truly real-time (<5min)
  When to use: Almost all new Azure data platform builds

Data Fabric
  Metadata-driven; AI/ML discovers and connects data across heterogeneous sources
  Not a storage pattern  -  it's a management layer on top of existing systems
  Pro: Works with existing investments; AI-assisted discovery
  Con: Still maturing; vendor-heavy; complex to implement
  When to use: Enterprise with many legacy systems needing unified discovery`}</CodeBlock>
          <Quiz topicId="prod-architecture" questions={[
            { question: "What is the main advantage of Kappa over Lambda architecture?", options: ["Better performance for batch jobs", "Single unified codebase  -  no duplicate batch/streaming logic to maintain", "Lower storage costs", "Better handling of late-arriving data"], correct: 1 },
            { question: "In a Data Mesh, who owns the data products?", options: ["The central data platform team", "Domain teams who have business context for that data", "The data governance committee", "The infrastructure team"], correct: 1 },
            { question: "What makes the Lakehouse architecture different from a traditional data warehouse?", options: ["It uses SQL instead of Python", "Open file format (Delta/Parquet) on cheap object storage  -  supports BI, ML, and streaming from one copy of data", "It requires no schema definition", "It only works with real-time data"], correct: 1 },
          ]} />
          {completeBtn('prod-architecture')}
        </section>

        {/* ── prod-system-design ── */}
        <section id="prod-system-design" ref={el => { if (el) sectionRefs.current['prod-system-design'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">System Design for Data Platforms</h1>
            <p className="topic-desc">Capacity planning, scalability, fault tolerance, CAP theorem applied to data systems, eventual consistency, backpressure handling, and rate limiting  -  the building blocks of resilient data platforms.</p>
          </div>
          <SystemDesignDiagram />
          <SystemDesignAnimation />
          <CodeBlock lang="text">{`CAP THEOREM FOR DATA SYSTEMS
═══════════════════════════════════════════════════════════════
Pick 2 of 3: Consistency · Availability · Partition Tolerance

Network partitions ALWAYS happen in distributed systems → you choose C or A.

CP (Consistency + Partition Tolerance)  -  data is always correct, may be unavailable
  Examples: HBase, Zookeeper, etcd
  Data use case: Financial ledgers, inventory counts, user balances
  Trade-off: Writes blocked during partition; replica lag unacceptable

AP (Availability + Partition Tolerance)  -  always responds, may return stale data
  Examples: Cassandra (tunable), DynamoDB, Kafka consumer offsets
  Data use case: User activity feeds, event streams, recommendation counts
  Trade-off: Eventual consistency; reads may return old values

PACELC Extension: Even without partition, choose between Latency and Consistency
  Delta Lake with OPTIMIZE: PA/EL  -  available + low latency
  Delta Lake with strong isolation: PC/EC  -  consistent + higher latency

EVENTUAL CONSISTENCY PATTERNS
═══════════════════════════════════════════════════════════════
Read-your-writes: after a write, the same user always reads their own write
  Implementation: route user reads to same shard or add version check

Monotonic reads: user never sees older data after seeing newer
  Implementation: sticky sessions or version vectors

Causal consistency: causally related operations seen in order
  Implementation: vector clocks or Kafka partition ordering`}</CodeBlock>
          <CodeBlock lang="python">{`# BACKPRESSURE HANDLING in Spark Structured Streaming
# Without backpressure: Kafka lag grows → OOM on executors

spark.conf.set("spark.streaming.kafka.maxRatePerPartition", "1000")  # Spark Streaming
# For Structured Streaming  -  use maxOffsetsPerTrigger:
query = (
    df.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "broker:9092")
    .option("subscribe", "orders")
    .option("maxOffsetsPerTrigger", 50_000)      # backpressure: cap batch size
    .option("startingOffsets", "latest")
    .load()
    .writeStream
    .trigger(processingTime="30 seconds")         # micro-batch every 30s
    .option("checkpointLocation", "/checkpoints/orders")
    .toTable("silver.orders_stream")
)

# RATE LIMITING for REST API ingestion
import time
from functools import wraps

class RateLimiter:
    def __init__(self, calls_per_second: float):
        self.min_interval = 1.0 / calls_per_second
        self.last_call = 0.0

    def __call__(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.monotonic() - self.last_call
            if elapsed < self.min_interval:
                time.sleep(self.min_interval - elapsed)
            self.last_call = time.monotonic()
            return func(*args, **kwargs)
        return wrapper

@RateLimiter(calls_per_second=10)   # max 10 API calls/sec
def fetch_page(url: str, session) -> dict:
    resp = session.get(url, timeout=30)
    resp.raise_for_status()
    return resp.json()

# CAPACITY PLANNING  -  cluster sizing formula
# Required cores = (daily_records / seconds_in_day) * processing_time_per_record * safety_factor
# Example: 10M records/day, 0.1ms/record, 2x safety
cores_needed = (10_000_000 / 86_400) * 0.0001 * 2   # ≈ 23 cores
# Round up to next instance size: 4 x Standard_DS4_v2 (8 cores each) = 32 cores

# FAULT TOLERANCE: idempotent writes + checkpointing
spark.sparkContext.setCheckpointDir("/checkpoints")  # RDD checkpointing
# Delta Lake: use foreachBatch with idempotent MERGE for exactly-once semantics`}</CodeBlock>
          <Quiz topicId="prod-system-design" questions={[
            { question: "In CAP theorem, why can't you have all three  -  Consistency, Availability, and Partition Tolerance?", options: ["It's a hardware limitation", "Network partitions always occur in distributed systems, so you must choose between consistency and availability when a partition happens", "You need a license for all three", "CAP only applies to databases, not data pipelines"], correct: 1 },
            { question: "What does setting maxOffsetsPerTrigger in Spark Structured Streaming accomplish?", options: ["It sets the maximum number of partitions", "It implements backpressure  -  caps how many Kafka messages are processed per micro-batch, preventing executor OOM", "It limits the number of concurrent queries", "It controls the checkpoint frequency"], correct: 1 },
            { question: "What is the key formula for cluster capacity planning?", options: ["Cores = RAM / 4", "Required cores = (records/second) × (processing_time_per_record) × safety_factor", "Cores = number of partitions", "Cores = daily_records / 1,000,000"], correct: 1 },
          ]} />
          {completeBtn('prod-system-design')}
        </section>

        {/* ── prod-pipeline-patterns ── */}
        <section id="prod-pipeline-patterns" ref={el => { if (el) sectionRefs.current['prod-pipeline-patterns'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Pipeline Design Patterns</h1>
            <p className="topic-desc">Medallion architecture, idempotency, exactly-once semantics, fan-out/fan-in, and event-driven triggers  -  patterns that separate amateur pipelines from production-grade ones.</p>
          </div>
          <PipelinePatternsDiagram />
          <PipelinePatternsAnimation />
          <CodeBlock lang="text">{`MEDALLION ARCHITECTURE (Bronze → Silver → Gold)
═══════════════════════════════════════════════════════════════
Bronze (Raw): Exact copy of source data, immutable, append-only
  - No transformations; preserve all source columns including bad data
  - Partition by ingest_date; retain forever (cheap ADLS storage)
  - Schema: source columns + _ingest_ts, _source_file, _batch_id

Silver (Cleaned): Validated, deduplicated, typed, enriched
  - Apply data quality rules; reject/quarantine bad records
  - Join lookup tables; standardize enums; cast data types
  - Deduplicate using window functions or MERGE INTO
  - Schema: clean business columns + _silver_ts, _is_valid, _dq_flags

Gold (Aggregated): Business-ready aggregates and dimensional models
  - Fact tables, dimension tables, wide denormalized tables for BI
  - Optimized for query performance (Z-ORDER, bloom filters)
  - Updated on business schedule (daily/hourly); SLA-governed

IDEMPOTENCY PATTERNS
═══════════════════════════════════════════════════════════════
A pipeline is idempotent if running it N times = running it once (same result).
Critical for safe retries  -  ADF retries failed activities automatically.

Pattern 1: Overwrite by partition
  spark.write.mode("overwrite").option("partitionOverwriteMode","dynamic").save(path)
  Replaces only the partitions being written; safe to re-run for same date.

Pattern 2: MERGE INTO (upsert)
  Match on natural key; update if changed; insert if new.
  Guarantees no duplicates even if pipeline runs twice.

Pattern 3: Truncate + reload (for small dimensions)
  DELETE FROM gold.dim_product; INSERT INTO gold.dim_product SELECT ...
  Simple, predictable, works well for tables < 10M rows.

FAN-OUT / FAN-IN
═══════════════════════════════════════════════════════════════
Fan-out: one upstream table → multiple downstream pipelines in parallel
  ADF: ForEach activity with parallel execution
  Use case: daily order snapshot → feed 5 different business unit reports

Fan-in: multiple upstream sources → one downstream aggregate
  ADF: Wait activity after parallel branches
  Use case: sales + returns + adjustments → net revenue fact table
  Risk: slowest upstream blocks all; add timeout + partial-load logic`}</CodeBlock>
          <CodeBlock lang="python">{`# IDEMPOTENT BRONZE LOAD  -  safe to re-run for same batch
from delta.tables import DeltaTable
from pyspark.sql import functions as F

def load_bronze_idempotent(source_path: str, batch_id: str, target_table: str):
    df = (spark.read.format("json").load(source_path)
          .withColumn("_ingest_ts", F.current_timestamp())
          .withColumn("_batch_id", F.lit(batch_id))
          .withColumn("_source_file", F.input_file_name()))

    # Delete existing records for this batch_id first (idempotent)
    if DeltaTable.isDeltaTable(spark, target_table):
        spark.sql(f"DELETE FROM {target_table} WHERE _batch_id = '{batch_id}'")

    df.write.format("delta").mode("append").saveAsTable(target_table)

# SILVER DEDUP + QUALITY  -  MERGE pattern
def silver_upsert(bronze_df, target_table: str, key_cols: list[str]):
    # Quality check
    valid = bronze_df.filter(F.col("order_id").isNotNull() & (F.col("amount") > 0))
    invalid = bronze_df.subtract(valid).withColumn("_dq_flag", F.lit("null_key_or_negative_amount"))

    # Write quarantine
    invalid.write.format("delta").mode("append").saveAsTable(f"{target_table}_quarantine")

    # Upsert valid records
    if DeltaTable.isDeltaTable(spark, target_table):
        target = DeltaTable.forName(spark, target_table)
        merge_cond = " AND ".join([f"t.{c} = s.{c}" for c in key_cols])
        (target.alias("t")
         .merge(valid.alias("s"), merge_cond)
         .whenMatchedUpdateAll()
         .whenNotMatchedInsertAll()
         .execute())
    else:
        valid.write.format("delta").saveAsTable(target_table)

# EVENT-DRIVEN TRIGGER using Azure Event Grid + ADF
# Storage account fires event when new file lands in Bronze container
# Event Grid routes to ADF webhook trigger → pipeline starts automatically
# No polling; near-zero latency; pay per execution only`}</CodeBlock>
          <Quiz topicId="prod-pipeline-patterns" questions={[
            { question: "Why is idempotency critical for production data pipelines?", options: ["It makes pipelines faster", "It ensures pipelines can be safely retried without creating duplicate or incorrect data", "It reduces storage costs", "It enables parallel execution"], correct: 1 },
            { question: "What is the key difference between Bronze and Silver layers in the Medallion architecture?", options: ["Bronze uses Parquet, Silver uses Delta", "Bronze is raw/immutable source data; Silver is validated, deduplicated, and typed", "Bronze is for batch data, Silver is for streaming", "Bronze is compressed, Silver is uncompressed"], correct: 1 },
            { question: "In a fan-in pattern, what is the main risk?", options: ["Data duplication", "The slowest upstream source blocks the entire downstream pipeline", "Too many parallel connections", "Schema conflicts"], correct: 1 },
          ]} />
          {completeBtn('prod-pipeline-patterns')}
        </section>

        {/* ── prod-scd ── */}
        <section id="prod-scd" ref={el => { if (el) sectionRefs.current['prod-scd'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Slowly Changing Dimensions</h1>
            <p className="topic-desc">SCD Types 1 - 6, implementation patterns in Delta Lake, and how to choose the right type based on business requirements for historical tracking.</p>
          </div>
          <SCDTypesDiagram />
          <SCDTypesAnimation />
          <CodeBlock lang="text">{`SLOWLY CHANGING DIMENSIONS (SCD)  -  DECISION GUIDE
═══════════════════════════════════════════════════════════════
SCD Type 0  -  Retain Original
  Never update; keep the original value forever.
  Use: date of birth, original signup source

SCD Type 1  -  Overwrite (no history)
  Update in place; old value is lost.
  Use: fixing typos, correcting obvious errors, current-state-only reporting
  Implementation: MERGE INTO ... WHEN MATCHED THEN UPDATE SET ...

SCD Type 2  -  Add New Row (full history) ← most common
  Add new row with new values; mark old row as expired.
  Columns needed: is_current BOOLEAN, effective_from DATE, effective_to DATE
  Surrogate key links fact table to correct dimension version at event time.
  Use: customer address, product category, employee department

SCD Type 3  -  Add New Column (limited history)
  Keep current AND previous value in separate columns.
  Use: when you only ever need one previous value (current_region, prev_region)
  Limitation: only 1 level of history; schema change for each tracked attribute

SCD Type 4  -  History Table
  Current values in main table; all changes in separate history table.
  Use: high-change-frequency dims where you rarely query history

SCD Type 6  -  Hybrid (1+2+3)
  Combines: overwrite current cols (Type 1) + new row per change (Type 2)
           + add current value column to historical rows (Type 3)
  Allows: "what was customer's current address when they ordered?" +
          "what is their address today?"  -  answered from same row
  Use: customer dim in large enterprise DW`}</CodeBlock>
          <CodeBlock lang="python">{`# SCD TYPE 2 IMPLEMENTATION WITH DELTA LAKE
from delta.tables import DeltaTable
from pyspark.sql import functions as F, Window

def apply_scd2(updates_df, target_table: str, key_col: str, track_cols: list[str]):
    """
    updates_df: latest snapshot from source (one row per key)
    target_table: Delta table with SCD2 structure
    key_col: natural key (e.g. customer_id)
    track_cols: columns that trigger a new version when changed
    """
    today = F.current_date()

    if not DeltaTable.isDeltaTable(spark, target_table):
        # Initial load
        (updates_df
         .withColumn("is_current", F.lit(True))
         .withColumn("effective_from", today)
         .withColumn("effective_to", F.lit("9999-12-31").cast("date"))
         .withColumn("surrogate_key", F.monotonically_increasing_id())
         .write.format("delta").saveAsTable(target_table))
        return

    target = DeltaTable.forName(spark, target_table)
    target_df = target.toDF().filter("is_current = true")

    # Find records that changed
    join_cond = target_df[key_col] == updates_df[key_col]
    change_filter = F.expr(" OR ".join([f"t.{c} != s.{c}" for c in track_cols]))

    changed = (target_df.alias("t")
               .join(updates_df.alias("s"), join_cond)
               .filter(change_filter)
               .select("t.*"))

    new_records = (target_df.alias("t")
                   .join(updates_df.alias("s"), join_cond, "right")
                   .filter(F.col(f"t.{key_col}").isNull())
                   .select("s.*"))

    # Expire old rows
    expired_keys = [row[key_col] for row in changed.select(key_col).collect()]
    if expired_keys:
        (target.update(
            condition=f"{key_col} IN ({','.join(map(str, expired_keys))}) AND is_current = true",
            set={"is_current": "false", "effective_to": str(today)}
        ))

    # Insert new versions for changed + new records
    inserts = (updates_df
               .filter(F.col(key_col).isin(expired_keys) | F.col(key_col).isin(
                   [r[key_col] for r in new_records.select(key_col).collect()]))
               .withColumn("is_current", F.lit(True))
               .withColumn("effective_from", today)
               .withColumn("effective_to", F.lit("9999-12-31").cast("date"))
               .withColumn("surrogate_key", F.monotonically_increasing_id()))

    inserts.write.format("delta").mode("append").saveAsTable(target_table)

# QUERY: what was the customer's region when they placed order on 2024-03-15?
spark.sql("""
  SELECT o.order_id, c.region
  FROM gold.fact_orders o
  JOIN gold.dim_customer c
    ON o.customer_surrogate_key = c.surrogate_key
  -- OR with date range join (slower but natural-key-based):
  -- ON o.customer_id = c.customer_id
  -- AND o.order_date BETWEEN c.effective_from AND c.effective_to
""")`}</CodeBlock>
          <Quiz topicId="prod-scd" questions={[
            { question: "Which SCD type should you use when you need to track the full history of customer address changes over time?", options: ["SCD Type 1  -  overwrite in place", "SCD Type 2  -  add a new row per change with effective dates", "SCD Type 3  -  add a previous_address column", "SCD Type 0  -  never update"], correct: 1 },
            { question: "What columns are typically added to a dimension table to support SCD Type 2?", options: ["version_number only", "is_current, effective_from, effective_to, and a surrogate key", "created_at and updated_at", "delta_version and snapshot_date"], correct: 1 },
            { question: "What is the trade-off of SCD Type 1 vs Type 2?", options: ["Type 1 is slower but more accurate", "Type 1 is simple but loses history; Type 2 preserves full history but doubles rows and requires surrogate key joins", "Type 1 requires more storage than Type 2", "They are equivalent  -  just different naming conventions"], correct: 1 },
          ]} />
          {completeBtn('prod-scd')}
        </section>

        {/* ── prod-cicd ── */}
        <section id="prod-cicd" ref={el => { if (el) sectionRefs.current['prod-cicd'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">CI/CD for Data Pipelines</h1>
            <p className="topic-desc">Automating deployment of ADF pipelines, Databricks notebooks, and dbt models with Azure DevOps. Blue/green deployments, feature flags, and safe rollback strategies.</p>
          </div>
          <CiCdDiagram />
          <CiCdAnimation />
          <CodeBlock lang="yaml">{`# azure-pipelines.yml  -  CI/CD for Databricks + ADF
trigger:
  branches:
    include: [main, release/*]
  paths:
    include: [databricks/**, adf/**, dbt/**]

variables:
  - group: data-platform-secrets   # Key Vault linked variable group
  - name: databricksHost
    value: "https://adb-xxx.azuredatabricks.net"

stages:
  # ─── CI Stage ───────────────────────────────────────────────────
  - stage: CI
    jobs:
      - job: UnitTests
        pool: { vmImage: ubuntu-latest }
        steps:
          - task: UsePythonVersion@0
            inputs: { versionSpec: '3.11' }
          - script: pip install pytest pyspark delta-spark great-expectations
          - script: pytest tests/unit/ -v --tb=short --junitxml=test-results.xml
          - task: PublishTestResults@2
            inputs: { testResultsFiles: test-results.xml }

      - job: LintAndTypeCheck
        pool: { vmImage: ubuntu-latest }
        steps:
          - script: pip install ruff mypy
          - script: ruff check databricks/ dbt/
          - script: mypy databricks/ --ignore-missing-imports

      - job: DbtCompile
        pool: { vmImage: ubuntu-latest }
        steps:
          - script: pip install dbt-databricks
          - script: dbt compile --profiles-dir .dbt --target ci

  # ─── Deploy to Staging ──────────────────────────────────────────
  - stage: Staging
    dependsOn: CI
    condition: succeeded()
    jobs:
      - deployment: DeployDatabricks
        environment: staging
        strategy:
          runOnce:
            deploy:
              steps:
                - script: |
                    # Upload notebooks via Databricks CLI
                    databricks workspace import_dir databricks/notebooks /Shared/pipelines \
                      --host $(databricksHost) --token $(DATABRICKS_TOKEN) --overwrite
                    # Deploy job definitions
                    databricks jobs reset --job-id $(STAGING_JOB_ID) \
                      --json @databricks/jobs/silver_orders.json

      - deployment: DeployADF
        environment: staging
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureResourceManagerTemplateDeployment@3
                  inputs:
                    deploymentScope: Resource Group
                    azureResourceManagerConnection: svc-adf-staging
                    resourceGroupName: rg-data-staging
                    location: eastus
                    templateLocation: Linked artifact
                    csmFile: adf/ARMTemplateForFactory.json
                    csmParametersFile: adf/ARMTemplateParametersForFactory.staging.json

  # ─── Integration Tests ──────────────────────────────────────────
  - stage: IntegrationTests
    dependsOn: Staging
    jobs:
      - job: SmokeTest
        steps:
          - script: pytest tests/integration/ -v --env=staging

  # ─── Deploy to Production ───────────────────────────────────────
  - stage: Production
    dependsOn: IntegrationTests
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployProd
        environment: production    # requires manual approval gate
        strategy:
          runOnce:
            deploy:
              steps:
                - script: databricks jobs reset --job-id $(PROD_JOB_ID) --json @databricks/jobs/silver_orders.json`}</CodeBlock>
          <CodeBlock lang="python">{`# BLUE/GREEN DEPLOYMENT for Delta tables
# Blue = current production; Green = new version being validated

# Step 1: Write new version to green table
spark.sql("""
  CREATE OR REPLACE TABLE gold.fact_orders_green
  AS SELECT * FROM silver.orders_cleaned
  WHERE processing_version = 'v2'
""")

# Step 2: Run validation
row_count_diff = spark.sql("""
  SELECT
    (SELECT COUNT(*) FROM gold.fact_orders_green) AS green,
    (SELECT COUNT(*) FROM gold.fact_orders) AS blue
""").collect()[0]

if abs(row_count_diff.green - row_count_diff.blue) / row_count_diff.blue > 0.01:
    raise ValueError("Row count divergence > 1%  -  aborting cutover")

# Step 3: Atomic cutover using Delta table clone + rename
spark.sql("ALTER TABLE gold.fact_orders RENAME TO gold.fact_orders_blue_backup")
spark.sql("ALTER TABLE gold.fact_orders_green RENAME TO gold.fact_orders")
# Rollback: ALTER TABLE gold.fact_orders RENAME TO gold.fact_orders_green_failed
#           ALTER TABLE gold.fact_orders_blue_backup RENAME TO gold.fact_orders

# FEATURE FLAGS for gradual rollout
import os

FEATURE_FLAGS = {
    "use_v2_dedup_logic": os.getenv("FF_V2_DEDUP", "false").lower() == "true",
    "enable_streaming_silver": os.getenv("FF_STREAMING_SILVER", "false").lower() == "true",
}

def process_orders(df):
    if FEATURE_FLAGS["use_v2_dedup_logic"]:
        return dedup_v2(df)   # new logic, tested on 10% of traffic
    return dedup_v1(df)        # stable production logic`}</CodeBlock>
          <Quiz topicId="prod-cicd" questions={[
            { question: "What is the purpose of a manual approval gate in a CI/CD pipeline?", options: ["To slow down deployments deliberately", "To require a human to explicitly approve before deploying to production, preventing accidental releases", "To run additional automated tests", "To notify stakeholders via email"], correct: 1 },
            { question: "What is blue/green deployment in the context of data pipelines?", options: ["Using two different cloud providers", "Maintaining two versions of a table simultaneously  -  validating the new (green) before atomically switching production traffic to it", "Coloring code by environment", "Running batch and streaming in parallel"], correct: 1 },
            { question: "Why should CI/CD pipelines for data include integration tests against staging, not just unit tests?", options: ["Unit tests are not useful for data pipelines", "Integration tests catch issues like schema mismatches, connectivity failures, and data quality problems that only appear with real infrastructure", "Staging tests are faster than unit tests", "Unit tests cannot test Python code"], correct: 1 },
          ]} />
          {completeBtn('prod-cicd')}
        </section>

        {/* ── prod-testing ── */}
        <section id="prod-testing" ref={el => { if (el) sectionRefs.current['prod-testing'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Testing Strategy</h1>
            <p className="topic-desc">Unit tests with PySpark, data quality validation with Great Expectations, contract testing, and the testing pyramid for data pipelines  -  how to ship with confidence.</p>
          </div>
          <TestingDiagram />
          <TestingAnimation />
          <CodeBlock lang="text">{`TESTING PYRAMID FOR DATA PIPELINES
═══════════════════════════════════════════════════════════════
          [E2E Tests]         ← few, slow, expensive
         [Integration]        ← moderate, catch real env issues
        [Unit Tests]          ← many, fast, cheap, run on every PR
       [Data Quality]         ← continuous, run in production

Unit Tests (pytest + PySpark local mode)
  Test transformation logic in isolation
  Use small DataFrames created in code; no external dependencies
  Fast: < 30 seconds for full suite
  Examples: dedup logic, null handling, column derivations, edge cases

Integration Tests (pytest + real Databricks/staging)
  Test full pipeline end-to-end against staging data
  Verify: schema, row counts, referential integrity, SLA timing
  Run on PR merge to main; gate production deployment

Data Quality (Great Expectations / dbt tests)
  Run after every pipeline execution in production
  Alert on: null rates, range violations, referential integrity, freshness
  Log results to Delta table for trend analysis

Contract Tests
  Verify producer schema hasn't broken consumer expectations
  Automate with Schema Registry (Confluent) or custom checks
  Fail CI if producer removes/renames columns consumers depend on`}</CodeBlock>
          <CodeBlock lang="python">{`# UNIT TESTS with pytest + PySpark
import pytest
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from your_pipeline.transforms import clean_orders, dedup_orders

@pytest.fixture(scope="session")
def spark():
    return (SparkSession.builder
            .master("local[2]")
            .appName("unit-tests")
            .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
            .getOrCreate())

def test_clean_orders_drops_null_order_id(spark):
    raw = spark.createDataFrame([
        {"order_id": "A1", "amount": 100.0},
        {"order_id": None, "amount": 50.0},   # should be dropped
        {"order_id": "A3", "amount": 0.0},    # zero amount  -  keep but flag
    ])
    result = clean_orders(raw)
    assert result.filter(F.col("order_id").isNull()).count() == 0
    assert result.count() == 2  # null row removed

def test_dedup_orders_keeps_latest(spark):
    dupes = spark.createDataFrame([
        {"order_id": "A1", "updated_at": "2024-01-01", "status": "pending"},
        {"order_id": "A1", "updated_at": "2024-01-02", "status": "shipped"},  # latest
        {"order_id": "A2", "updated_at": "2024-01-01", "status": "pending"},
    ])
    result = dedup_orders(dupes, key="order_id", ts_col="updated_at")
    a1 = result.filter(F.col("order_id") == "A1").collect()[0]
    assert a1["status"] == "shipped"
    assert result.count() == 2

def test_clean_orders_casts_amount_to_decimal(spark):
    raw = spark.createDataFrame([{"order_id": "A1", "amount": "99.99"}])
    result = clean_orders(raw)
    assert dict(result.dtypes)["amount"] in ("decimal(18,2)", "double")

# DATA QUALITY with Great Expectations
import great_expectations as gx

context = gx.get_context()
batch = context.sources.pandas_default.read_dataframe(df.toPandas())

results = batch.validate(
    expectation_suite=gx.ExpectationSuite(
        expectations=[
            gx.expectations.ExpectColumnValuesToNotBeNull(column="order_id"),
            gx.expectations.ExpectColumnValuesToBeBetween(column="amount", min_value=0, max_value=1_000_000),
            gx.expectations.ExpectColumnValuesToBeUnique(column="order_id"),
            gx.expectations.ExpectTableRowCountToBeBetween(min_value=1000, max_value=10_000_000),
        ]
    )
)

if not results.success:
    failed = [r for r in results.results if not r.success]
    raise ValueError(f"Data quality check failed: {[r.expectation_config.type for r in failed]}")`}</CodeBlock>
          <Quiz topicId="prod-testing" questions={[
            { question: "Why should unit tests for Spark transformations use small DataFrames created in code rather than reading from files?", options: ["File reads are not supported in test environments", "In-memory DataFrames make tests fast, deterministic, and independent of external data sources", "Spark cannot read files in local mode", "Files are too large for unit tests"], correct: 1 },
            { question: "What is the purpose of data quality tests that run in production (not just CI)?", options: ["To replace unit tests", "To continuously validate that production data meets business rules  -  catching upstream changes, schema drift, and data corruption that CI cannot simulate", "To test the CI pipeline itself", "To measure pipeline performance"], correct: 1 },
            { question: "What does a contract test verify?", options: ["That the pipeline completes within SLA", "That a producer's schema changes haven't broken downstream consumers who depend on specific columns/types", "That unit tests pass", "That data is encrypted"], correct: 1 },
          ]} />
          {completeBtn('prod-testing')}
        </section>

        {/* ── prod-dbt ── */}
        <section id="prod-dbt" ref={el => { if (el) sectionRefs.current['prod-dbt'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">dbt (data build tool)</h1>
            <p className="topic-desc">dbt transforms raw data in your warehouse using SQL. It handles dependency resolution, testing, documentation, and lineage  -  the backbone of the modern data stack's transformation layer.</p>
          </div>
          <DBTDiagram />
          <DBTAnimation />
          <CodeBlock lang="yaml">{`# dbt project structure
my_project/
  dbt_project.yml          # project config
  profiles.yml             # connection config (gitignored)
  models/
    staging/               # 1:1 with source tables, light cleaning
      stg_orders.sql
      stg_customers.sql
      schema.yml           # column descriptions + tests
    intermediate/          # business logic, joins
      int_orders_with_customer.sql
    marts/                 # final business-ready tables
      finance/
        fct_revenue.sql
        dim_customer.sql
  tests/                   # custom data tests (singular tests)
  macros/                  # reusable SQL functions
  seeds/                   # static CSV data (lookup tables)
  snapshots/               # SCD Type 2 via dbt snapshot

# dbt_project.yml
name: my_project
version: '1.0.0'
config-version: 2
profile: databricks_prod

models:
  my_project:
    staging:
      +materialized: view          # staging = views (no storage cost)
      +schema: staging
    intermediate:
      +materialized: ephemeral     # compiled inline, no table created
    marts:
      +materialized: table         # gold layer = physical tables
      finance:
        +materialized: incremental # large fact tables = incremental`}</CodeBlock>
          <CodeBlock lang="sql">{`-- models/staging/stg_orders.sql
-- Staging: rename, cast, add _loaded_at
WITH source AS (
    SELECT * FROM {{ source('raw', 'orders') }}   -- ref to source definition
),
renamed AS (
    SELECT
        order_id::VARCHAR       AS order_id,
        customer_id::VARCHAR    AS customer_id,
        order_date::DATE        AS order_date,
        total_amount::DECIMAL(18,2) AS total_amount,
        status::VARCHAR         AS status,
        _ingest_ts              AS _loaded_at
    FROM source
)
SELECT * FROM renamed

-- models/marts/finance/fct_revenue.sql (incremental)
{{
  config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='merge',
    on_schema_change='append_new_columns'
  )
}}

WITH orders AS (
    SELECT * FROM {{ ref('stg_orders') }}
    {% if is_incremental() %}
        WHERE order_date >= (SELECT MAX(order_date) FROM {{ this }}) - INTERVAL 3 DAYS
    {% endif %}
),
customers AS (SELECT * FROM {{ ref('dim_customer') }}),
final AS (
    SELECT
        o.order_id,
        o.order_date,
        o.total_amount,
        c.customer_segment,
        c.region,
        CURRENT_TIMESTAMP() AS _dbt_updated_at
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id
)
SELECT * FROM final

-- schema.yml  -  column documentation + built-in tests
version: 2
models:
  - name: stg_orders
    description: "Cleaned orders from the source OLTP system"
    columns:
      - name: order_id
        description: "Unique order identifier"
        tests:
          - not_null
          - unique
      - name: total_amount
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              max_value: 1000000
      - name: status
        tests:
          - accepted_values:
              values: ['pending', 'shipped', 'delivered', 'cancelled']`}</CodeBlock>
          <Quiz topicId="prod-dbt" questions={[
            { question: "What does the is_incremental() macro do in a dbt model?", options: ["It creates an index on the table", "It filters the query to only process new/changed records when the table already exists  -  enabling efficient incremental loads without full refreshes", "It enables parallel execution", "It partitions the output table"], correct: 1 },
            { question: "What is the difference between dbt ref() and source()?", options: ["They are identical", "ref() points to another dbt model (creates DAG dependency); source() points to raw upstream tables outside dbt's control", "source() is for streaming data, ref() is for batch", "ref() is deprecated in favor of source()"], correct: 1 },
            { question: "Why use materialized: view for staging models instead of table?", options: ["Views are faster than tables", "Staging models are simple transformations  -  views avoid duplicating storage and always reflect the latest source data without running a job", "Tables don't support staging data", "Views have better test coverage"], correct: 1 },
          ]} />
          {completeBtn('prod-dbt')}
        </section>

        {/* ── prod-terraform ── */}
        <section id="prod-terraform" ref={el => { if (el) sectionRefs.current['prod-terraform'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Infrastructure as Code (Terraform)</h1>
            <p className="topic-desc">Provisioning Azure data platform resources with Terraform  -  ADLS Gen2, Databricks workspaces, ADF, Key Vault, and networking. State management, modules, and workspace patterns.</p>
          </div>
          <TerraformDiagram />
          <TerraformAnimation />
          <CodeBlock lang="hcl">{`# terraform/main.tf  -  Azure Data Platform
terraform {
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.90" }
    databricks = { source = "databricks/databricks", version = "~> 1.40" }
  }
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "sttfstatedataplatform"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"   # remote state  -  team safe
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# ── Resource Group ───────────────────────────────────────────────
resource "azurerm_resource_group" "data" {
  name     = "rg-data-\${var.environment}"
  location = var.location
  tags     = local.common_tags
}

# ── ADLS Gen2 ────────────────────────────────────────────────────
resource "azurerm_storage_account" "datalake" {
  name                     = "adls\${var.environment}\${var.suffix}"
  resource_group_name      = azurerm_resource_group.data.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "ZRS"        # zone-redundant
  account_kind             = "StorageV2"
  is_hns_enabled           = true         # hierarchical namespace = Gen2
  min_tls_version          = "TLS1_2"
  blob_properties {
    delete_retention_policy { days = 30 }
  }
}

resource "azurerm_storage_container" "layers" {
  for_each             = toset(["bronze", "silver", "gold", "checkpoints"])
  name                 = each.value
  storage_account_name = azurerm_storage_account.datalake.name
}

# ── Databricks Workspace ─────────────────────────────────────────
resource "azurerm_databricks_workspace" "main" {
  name                = "dbw-data-\${var.environment}"
  resource_group_name = azurerm_resource_group.data.name
  location            = var.location
  sku                 = "premium"          # required for Unity Catalog
  managed_resource_group_name = "rg-databricks-managed-\${var.environment}"
}

resource "databricks_cluster" "shared" {
  cluster_name            = "shared-\${var.environment}"
  spark_version           = "14.3.x-scala2.12"
  node_type_id            = "Standard_DS4_v2"
  autotermination_minutes = 30
  autoscale {
    min_workers = 2
    max_workers = 8
  }
  spark_conf = {
    "spark.databricks.delta.preview.enabled" = "true"
  }
}

# ── Key Vault ────────────────────────────────────────────────────
resource "azurerm_key_vault" "main" {
  name                = "kv-data-\${var.environment}-\${var.suffix}"
  resource_group_name = azurerm_resource_group.data.name
  location            = var.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
  purge_protection_enabled = true
}

locals {
  common_tags = {
    environment = var.environment
    managed_by  = "terraform"
    team        = "data-platform"
    cost_center = var.cost_center
  }
}`}</CodeBlock>
          <CodeBlock lang="bash">{`# Terraform workflow with workspaces for environment isolation
terraform workspace new staging
terraform workspace new production

# Plan  -  see what will change before applying
terraform plan -var-file=environments/staging.tfvars -out=staging.plan

# Apply  -  provision infrastructure
terraform apply staging.plan

# Destroy (careful  -  use workspace isolation!)
terraform workspace select staging
terraform destroy -var-file=environments/staging.tfvars

# Module pattern  -  reuse across environments
# modules/databricks-job/main.tf defines a parameterized Databricks job
# Call it from root:
module "silver_orders_job" {
  source         = "./modules/databricks-job"
  job_name       = "silver-orders-\${var.environment}"
  notebook_path  = "/Shared/pipelines/silver_orders"
  cluster_id     = databricks_cluster.shared.id
  schedule_cron  = "0 0 * * * ?"  # every hour
  environment    = var.environment
}`}</CodeBlock>
          <Quiz topicId="prod-terraform" questions={[
            { question: "Why store Terraform state in Azure Blob Storage (remote backend) instead of locally?", options: ["Local state files are too large", "Remote state enables team collaboration  -  multiple engineers can run Terraform safely with state locking to prevent concurrent conflicts", "Local state doesn't support variables", "Azure requires remote state for compliance"], correct: 1 },
            { question: "What does terraform plan do and why is it important before applying?", options: ["It runs unit tests", "It shows exactly what resources will be created, modified, or destroyed  -  lets you verify changes before touching production infrastructure", "It validates HCL syntax only", "It deploys to staging automatically"], correct: 1 },
            { question: "What is the purpose of Terraform workspaces?", options: ["They store secret variables", "They allow isolated state per environment (dev/staging/prod) from a single configuration, preventing accidental cross-environment changes", "They replace modules", "They enable parallel resource creation"], correct: 1 },
          ]} />
          {completeBtn('prod-terraform')}
        </section>

        {/* ── prod-security ── */}
        <section id="prod-security" ref={el => { if (el) sectionRefs.current['prod-security'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Security for Data Platforms</h1>
            <p className="topic-desc">RBAC, column-level security, row-level security, encryption at rest and in transit, PII handling, managed identities, Key Vault integration, and Unity Catalog permissions.</p>
          </div>
          <SecurityDiagram />
          <SecurityAnimation />
          <CodeBlock lang="text">{`SECURITY LAYERS FOR AZURE DATA PLATFORMS
═══════════════════════════════════════════════════════════════
Network Security
  Private endpoints: ADLS, Databricks, ADF  -  no public internet exposure
  VNet injection: Databricks clusters in your VNet
  NSG rules: deny all inbound; allow only required outbound
  Private DNS zones: resolve storage/databricks privately

Identity & Access (use Managed Identities  -  never store secrets!)
  System-assigned MI: ADF instance → ADLS RBAC (Storage Blob Data Contributor)
  User-assigned MI: shared across multiple services; easier rotation
  Service Principal: for CI/CD pipelines; rotate secrets every 90 days
  Never: connection strings in notebooks, passwords in config files

Data Access Control (Unity Catalog)
  Catalog → Schema → Table → Column hierarchy
  GRANT SELECT ON TABLE catalog.schema.table TO user@company.com
  Row filters: automatically applied at query time based on user attributes
  Column masks: PII columns return masked values for non-privileged users

Encryption
  At rest: Azure Storage Service Encryption (AES-256)  -  on by default
  Customer-managed keys (CMK): bring your own key to Key Vault
  In transit: TLS 1.2 minimum enforced on all endpoints
  Column-level: encrypt before storing (application-level) for highest sensitivity

PII Handling Strategy
  Classify: tag PII columns in Unity Catalog (system tags or custom)
  Minimize: collect only what's needed; delete on retention schedule
  Pseudonymize: hash or tokenize PII at Bronze layer; keep mapping in secure table
  Mask: dynamic data masking in Unity Catalog for analytics consumers
  Audit: log all access to PII tables (Diagnostic Settings → Log Analytics)`}</CodeBlock>
          <CodeBlock lang="python">{`# MANAGED IDENTITY  -  ADF reading from ADLS (no credentials)
# In ADF linked service: Authentication = Managed Identity
# In ADLS IAM: assign "Storage Blob Data Contributor" to ADF's MI
# No passwords stored anywhere  -  MI token is auto-rotated by Azure

# KEY VAULT INTEGRATION in Databricks
# 1. Create Key Vault-backed secret scope in Databricks:
#    databricks secrets create-scope --scope kv-scope --scope-backend-type AZURE_KEYVAULT
#    --resource-id /subscriptions/.../resourceGroups/.../providers/Microsoft.KeyVault/vaults/kv-data-prod
#    --dns-name https://kv-data-prod.vault.azure.net/

# 2. Use in notebooks  -  secret never appears in logs or outputs
db_password = dbutils.secrets.get(scope="kv-scope", key="sql-db-password")
jdbc_url = f"jdbc:sqlserver://server.database.windows.net;password={db_password}"

# UNITY CATALOG  -  ROW LEVEL SECURITY
# Row filter: each user only sees their own region's data
spark.sql("""
  CREATE OR REPLACE ROW FILTER region_filter ON gold.fact_sales
  USING (region = CURRENT_USER_ATTRIBUTE('region') OR IS_MEMBER('data-admins'))
""")

spark.sql("""
  ALTER TABLE gold.fact_sales
  SET ROW FILTER region_filter ON ()
""")

# COLUMN MASKING  -  PII fields masked for non-privileged users
spark.sql("""
  CREATE OR REPLACE FUNCTION mask_email(email STRING)
  RETURNS STRING
  RETURN CASE
    WHEN IS_MEMBER('pii-access') THEN email
    ELSE CONCAT(LEFT(email, 2), '***@***.com')
  END
""")

spark.sql("""
  ALTER TABLE gold.dim_customer
  ALTER COLUMN email SET MASK mask_email
""")

# PII PSEUDONYMIZATION at Bronze layer
import hashlib

def pseudonymize(df, pii_cols: list[str], salt: str):
    """Replace PII with deterministic hash  -  reversible only with mapping table"""
    for col in pii_cols:
        df = df.withColumn(col,
            F.sha2(F.concat(F.col(col), F.lit(salt)), 256))
    return df

bronze_df = pseudonymize(raw_df, ["email", "phone", "ssn"], salt=dbutils.secrets.get("kv-scope", "pii-salt"))`}</CodeBlock>
          <Quiz topicId="prod-security" questions={[
            { question: "Why should you use Managed Identities instead of service principal client secrets for ADF to ADLS access?", options: ["Managed identities are faster", "Managed identities have no credentials to steal, rotate, or accidentally commit to Git  -  Azure handles the token lifecycle automatically", "Service principals don't work with ADLS", "Managed identities have more permissions"], correct: 1 },
            { question: "What is the difference between column masking and column encryption?", options: ["They are the same thing", "Masking hides data at query time based on user role (data still stored in plain text); encryption stores data in encrypted form  -  requires key to read", "Masking is for strings, encryption is for numbers", "Column encryption is not supported in Databricks"], correct: 1 },
            { question: "What is PII pseudonymization and when is it used?", options: ["Deleting PII columns entirely", "Replacing PII with a deterministic hash  -  data remains useful for analysis (same customer = same hash) but cannot be reversed without the mapping table", "Encrypting the entire Delta table", "Adding a watermark to data exports"], correct: 1 },
          ]} />
          {completeBtn('prod-security')}
        </section>

        {/* ── prod-observability ── */}
        <section id="prod-observability" ref={el => { if (el) sectionRefs.current['prod-observability'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Observability</h1>
            <p className="topic-desc">The three pillars of observability  -  metrics, logs, and traces  -  applied to data pipelines. OpenTelemetry, Azure Monitor, Log Analytics, and distributed tracing across ADF and Databricks.</p>
          </div>
          <ObservabilityDiagram />
          <ObservabilityAnimation />
          <CodeBlock lang="python">{`# STRUCTURED LOGGING  -  machine-readable, queryable in Log Analytics
import logging
import json
from datetime import datetime

class PipelineLogger:
    def __init__(self, pipeline_name: str, run_id: str):
        self.pipeline_name = pipeline_name
        self.run_id = run_id
        self.logger = logging.getLogger(pipeline_name)

    def log(self, level: str, event: str, **kwargs):
        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "pipeline": self.pipeline_name,
            "run_id": self.run_id,
            "event": event,
            **kwargs
        }
        self.logger.info(json.dumps(record))

# Usage
log = PipelineLogger("silver_orders", run_id=dbutils.widgets.get("run_id"))
log.log("INFO", "batch_started", source_path="/bronze/orders/2024-01-15/")

df = spark.read.format("delta").load("/bronze/orders/2024-01-15/")
row_count = df.count()

log.log("INFO", "batch_complete",
    input_rows=row_count,
    output_rows=result_df.count(),
    duration_seconds=42.3,
    bad_records=quarantine_count)

# METRICS  -  write to Delta table for dashboarding
from pyspark.sql.types import StructType, StructField, StringType, LongType, DoubleType, TimestampType

metrics_schema = StructType([
    StructField("pipeline_name", StringType()),
    StructField("run_id", StringType()),
    StructField("metric_name", StringType()),
    StructField("metric_value", DoubleType()),
    StructField("recorded_at", TimestampType()),
])

def emit_metric(pipeline: str, run_id: str, name: str, value: float):
    metrics_df = spark.createDataFrame(
        [(pipeline, run_id, name, float(value), datetime.utcnow())],
        schema=metrics_schema
    )
    metrics_df.write.format("delta").mode("append").saveAsTable("ops.pipeline_metrics")

emit_metric("silver_orders", run_id, "row_count", row_count)
emit_metric("silver_orders", run_id, "bad_record_rate", quarantine_count / row_count)

# AZURE MONITOR  -  send custom metrics via REST API
import requests

def send_azure_metric(metric_name: str, value: float, resource_id: str, token: str):
    url = f"https://monitoring.azure.com{resource_id}/metrics"
    payload = {
        "time": datetime.utcnow().isoformat(),
        "data": {"baseData": {"metric": metric_name, "namespace": "DataPipeline",
                              "dimNames": [], "series": [{"dimValues": [], "min": value, "max": value, "sum": value, "count": 1}]}}
    }
    requests.post(url, json=payload, headers={"Authorization": f"Bearer {token}"})`}</CodeBlock>
          <CodeBlock lang="sql">{`-- OBSERVABILITY DASHBOARD QUERIES (Log Analytics / Databricks SQL)

-- Pipeline health trend  -  last 7 days
SELECT
    date(recorded_at)           AS run_date,
    pipeline_name,
    AVG(CASE WHEN metric_name = 'row_count' THEN metric_value END) AS avg_rows,
    AVG(CASE WHEN metric_name = 'bad_record_rate' THEN metric_value END) AS avg_bad_rate,
    COUNT(*) AS run_count
FROM ops.pipeline_metrics
WHERE recorded_at >= current_date() - INTERVAL 7 DAYS
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

-- Alert: bad record rate > 5% in last run
SELECT pipeline_name, run_id, metric_value AS bad_record_rate, recorded_at
FROM ops.pipeline_metrics
WHERE metric_name = 'bad_record_rate'
  AND metric_value > 0.05
  AND recorded_at >= current_timestamp() - INTERVAL 1 HOUR
ORDER BY recorded_at DESC;

-- SLA breach: pipeline hasn't run in expected window
SELECT p.pipeline_name
FROM ops.pipeline_registry p
LEFT JOIN (
    SELECT pipeline_name, MAX(recorded_at) AS last_run
    FROM ops.pipeline_metrics GROUP BY 1
) r ON p.pipeline_name = r.pipeline_name
WHERE r.last_run IS NULL
   OR r.last_run < current_timestamp() - MAKE_INTERVAL(hours => p.expected_frequency_hours + 1);`}</CodeBlock>
          <Quiz topicId="prod-observability" questions={[
            { question: "What are the three pillars of observability and how do they differ?", options: ["CPU, Memory, Disk  -  hardware metrics", "Metrics (aggregated numbers over time), Logs (discrete events with context), Traces (request flow across services)  -  together they answer 'what, why, where'", "Input, Process, Output  -  pipeline stages", "Bronze, Silver, Gold  -  data quality layers"], correct: 1 },
            { question: "Why use structured (JSON) logging instead of plain text messages?", options: ["JSON is smaller than plain text", "Structured logs are machine-parseable  -  Log Analytics, Splunk, and dashboards can query specific fields without regex parsing", "Plain text logging is deprecated", "JSON logs are automatically encrypted"], correct: 1 },
            { question: "What is the value of writing pipeline metrics to a Delta table?", options: ["Delta tables compress metrics better", "It enables SQL-based trend analysis, anomaly detection, and SLA monitoring over historical runs  -  the same tools used for business data", "Metrics must be in Delta format for Azure Monitor", "Delta tables automatically alert on thresholds"], correct: 1 },
          ]} />
          {completeBtn('prod-observability')}
        </section>

        {/* ── prod-monitoring ── */}
        <section id="prod-monitoring" ref={el => { if (el) sectionRefs.current['prod-monitoring'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Pipeline Monitoring</h1>
            <p className="topic-desc">SLA management, alerting strategies, Kafka consumer lag monitoring, ADF activity monitoring, data freshness checks, and on-call runbook patterns for data engineers.</p>
          </div>
          <MonitoringProdDiagram />
          <MonitoringProdAnimation />
          <CodeBlock lang="python">{`# SLA MONITORING  -  alert if pipeline is late
from datetime import datetime, timedelta
import pytz

def check_pipeline_sla(pipeline_name: str, expected_completion_utc: str, tolerance_minutes: int = 15):
    """
    expected_completion_utc: "06:00"  -  pipeline should finish by 6am UTC daily
    tolerance_minutes: grace period before alerting
    """
    now = datetime.utcnow()
    expected = datetime.strptime(
        f"{now.date()} {expected_completion_utc}", "%Y-%m-%d %H:%M"
    ).replace(tzinfo=pytz.UTC)
    deadline = expected + timedelta(minutes=tolerance_minutes)

    last_success = spark.sql(f"""
        SELECT MAX(recorded_at) as last_run
        FROM ops.pipeline_metrics
        WHERE pipeline_name = '{pipeline_name}'
          AND metric_name = 'batch_complete'
          AND DATE(recorded_at) = CURRENT_DATE()
    """).collect()[0].last_run

    if last_success is None or last_success < expected:
        if now > deadline:
            send_pagerduty_alert(
                title=f"SLA BREACH: {pipeline_name} did not complete by {expected_completion_utc} UTC",
                severity="critical",
                details={"last_success": str(last_success), "deadline": str(deadline)}
            )

# KAFKA LAG MONITORING
def get_consumer_lag(bootstrap_servers: str, group_id: str, topic: str) -> dict:
    from kafka import KafkaAdminClient, KafkaConsumer
    from kafka.structs import TopicPartition

    consumer = KafkaConsumer(
        bootstrap_servers=bootstrap_servers,
        group_id=group_id,
        enable_auto_commit=False
    )
    partitions = consumer.partitions_for_topic(topic)
    tps = [TopicPartition(topic, p) for p in partitions]
    end_offsets = consumer.end_offsets(tps)
    committed = {tp: consumer.committed(tp) or 0 for tp in tps}
    consumer.close()

    lag_per_partition = {tp.partition: end_offsets[tp] - committed[tp] for tp in tps}
    total_lag = sum(lag_per_partition.values())

    if total_lag > 100_000:
        send_pagerduty_alert(f"Kafka lag critical: {group_id}/{topic} lag={total_lag:,}", "warning")

    return {"total_lag": total_lag, "per_partition": lag_per_partition}

# DATA FRESHNESS CHECK
def check_data_freshness(table: str, ts_col: str, max_age_hours: int):
    result = spark.sql(f"""
        SELECT MAX({ts_col}) AS latest_record,
               TIMESTAMPDIFF(HOUR, MAX({ts_col}), CURRENT_TIMESTAMP()) AS age_hours
        FROM {table}
    """).collect()[0]

    if result.age_hours > max_age_hours:
        send_pagerduty_alert(
            title=f"STALE DATA: {table}.{ts_col} is {result.age_hours}h old (max {max_age_hours}h)",
            severity="warning",
            details={"latest_record": str(result.latest_record)}
        )`}</CodeBlock>
          <CodeBlock lang="text">{`ON-CALL RUNBOOK  -  Pipeline Failure Response
═══════════════════════════════════════════════════════════════
1. TRIAGE (first 5 min)
   - Check ADF Monitor: which activity failed? What is the error message?
   - Check Databricks job run: driver logs → stderr for Python stack trace
   - Check upstream: did source system have an outage? (check ops.pipeline_metrics)
   - Classify: Data issue? Code bug? Infrastructure? Upstream failure?

2. IMMEDIATE ACTIONS
   Data issue (malformed records, schema change):
     → Check bronze quarantine table; determine blast radius
     → If < 1% bad records: allow to continue with quarantine; notify data owner
     → If > 5% bad: halt pipeline; escalate to source system team

   Code bug (NullPointerException, logic error):
     → Identify last-good run via Delta DESCRIBE HISTORY
     → Roll back gold table: RESTORE TABLE gold.fact_orders TO VERSION AS OF <n>
     → Fix code in hotfix branch; deploy via fast-track CI/CD

   Infrastructure failure (cluster OOM, network timeout):
     → Check Databricks cluster events; scale up if OOM
     → Re-trigger ADF pipeline from failed activity (not from scratch)
     → If persistent: failover to backup cluster defined in job config

3. RECOVERY
   - Re-run pipeline for affected date range (idempotent by design)
   - Verify row counts match expected range
   - Confirm downstream gold tables refreshed correctly
   - Update stakeholders via data ops Slack channel

4. POST-MORTEM
   - Document in ops.incident_log table
   - Root cause + contributing factors + timeline
   - Action items: add monitoring, improve error handling, alert earlier`}</CodeBlock>
          <Quiz topicId="prod-monitoring" questions={[
            { question: "What is SLA tolerance in pipeline monitoring and why does it matter?", options: ["The maximum data size the pipeline can handle", "A grace period after the expected completion time before firing an alert  -  prevents false alarms from minor delays while still catching real breaches", "The percentage of records that can be invalid", "The minimum uptime percentage"], correct: 1 },
            { question: "What does Kafka consumer lag measure?", options: ["Network latency between brokers", "The number of unprocessed messages between what the producer has written and what the consumer has committed  -  high lag means the consumer is falling behind", "The size of Kafka partitions", "The time to serialize messages"], correct: 1 },
            { question: "How do you safely recover a Delta table after a bad pipeline run?", options: ["Delete all data and reload from source", "Use RESTORE TABLE gold.fact TO VERSION AS OF <n> to roll back to the last-known-good version using Delta's transaction log", "Drop and recreate the table", "Manually delete bad partitions"], correct: 1 },
          ]} />
          {completeBtn('prod-monitoring')}
        </section>

        {/* ── prod-disaster-recovery ── */}
        <section id="prod-disaster-recovery" ref={el => { if (el) sectionRefs.current['prod-disaster-recovery'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Disaster Recovery</h1>
            <p className="topic-desc">RTO/RPO targets, backup strategies for Delta Lake, cross-region replication, ADF pipeline export, geo-redundant storage, and tested failover procedures.</p>
          </div>
          <DisasterRecoveryDiagram />
          <DisasterRecoveryAnimation />
          <CodeBlock lang="text">{`DISASTER RECOVERY CONCEPTS
═══════════════════════════════════════════════════════════════
RTO (Recovery Time Objective)
  Maximum acceptable downtime after a disaster
  Example: "The gold layer must be restored within 4 hours of an outage"
  Drives: how fast your recovery procedure must execute

RPO (Recovery Point Objective)
  Maximum acceptable data loss (measured in time)
  Example: "We can afford to lose at most 1 hour of data"
  Drives: backup frequency  -  if RPO=1h, take snapshots at least hourly

Tier examples for data platforms:
  Critical (financial reporting): RTO 2h, RPO 15min
  Standard (analytics dashboards): RTO 8h, RPO 1h
  Non-critical (ML feature store): RTO 24h, RPO 4h

AZURE STORAGE REDUNDANCY OPTIONS
═══════════════════════════════════════════════════════════════
LRS  (Locally Redundant):     3 copies, 1 datacenter  -  cheapest, no regional DR
ZRS  (Zone Redundant):        3 copies, 3 zones  -  survives datacenter failure
GRS  (Geo Redundant):         LRS + async copy to paired region  -  regional DR
GZRS (Geo+Zone Redundant):    ZRS + async copy to paired region  -  highest durability
RA-GZRS:                      GZRS + READ access to secondary  -  active-passive DR

Recommendation for production data platforms:
  Gold/Silver: GZRS (critical data, regional failover)
  Bronze: ZRS (raw data, can re-ingest from source if needed)
  Checkpoints: ZRS minimum (losing checkpoints = replay entire stream)

DELTA LAKE BACKUP STRATEGIES
═══════════════════════════════════════════════════════════════
Strategy 1: DEEP CLONE to backup storage account
  Daily: DEEP CLONE gold.fact_orders TO 'abfss://backup@adls-dr.dfs.core.windows.net/gold/fact_orders'
  Copies data + transaction log; fully independent clone
  Restore: point Databricks external location to backup path

Strategy 2: azcopy scheduled sync (cheaper, metadata-level)
  azcopy sync 'https://adls-prod.blob.core.windows.net/gold' 'https://adls-dr.blob.core.windows.net/gold' --recursive

Strategy 3: Geo-replication (automatic, Azure-managed)
  Enable GZRS on storage account; Azure continuously replicates
  Failover: update ADLS endpoint in Key Vault → all services pick up new URL`}</CodeBlock>
          <CodeBlock lang="python">{`# DEEP CLONE BACKUP  -  scheduled daily via Databricks Job
from pyspark.sql import SparkSession
from delta.tables import DeltaTable
import logging

BACKUP_STORAGE = "abfss://backup@adlsdatadr.dfs.core.windows.net"
PROD_TABLES = [
    ("gold.fact_orders", f"{BACKUP_STORAGE}/gold/fact_orders"),
    ("gold.fact_revenue", f"{BACKUP_STORAGE}/gold/fact_revenue"),
    ("gold.dim_customer", f"{BACKUP_STORAGE}/gold/dim_customer"),
]

def backup_table(source_table: str, backup_path: str):
    logging.info(f"Starting backup: {source_table} → {backup_path}")
    spark.sql(f"""
        CREATE OR REPLACE TABLE delta.\`{backup_path}\`
        DEEP CLONE {source_table}
        TBLPROPERTIES ('backup_source' = '{source_table}', 'backup_ts' = '{datetime.utcnow().isoformat()}')
    """)
    # Verify
    prod_count = spark.table(source_table).count()
    backup_count = spark.read.format("delta").load(backup_path).count()
    if prod_count != backup_count:
        raise ValueError(f"Backup verification failed: {prod_count} vs {backup_count}")
    logging.info(f"Backup verified: {backup_count:,} rows")

for table, path in PROD_TABLES:
    backup_table(table, path)

# RESTORE PROCEDURE  -  run during DR event
def restore_from_backup(backup_path: str, restore_table: str):
    """Restore from backup  -  run when primary region is unavailable"""
    spark.sql(f"""
        CREATE OR REPLACE TABLE {restore_table}
        DEEP CLONE delta.\`{backup_path}\`
    """)
    print(f"Restored {restore_table} from {backup_path}")
    print(f"Row count: {spark.table(restore_table).count():,}")

# ADF PIPELINE EXPORT for DR (ARM template backup)
# az datafactory export --resource-group rg-data-prod --factory-name adf-data-prod \
#   --output-folder ./adf-backup/$(date +%Y%m%d)
# Store in Git repo  -  can redeploy entire ADF from ARM template in < 30 min`}</CodeBlock>
          <Quiz topicId="prod-disaster-recovery" questions={[
            { question: "What is the difference between RTO and RPO?", options: ["They are the same metric with different names", "RTO is the maximum acceptable downtime (how fast you recover); RPO is the maximum acceptable data loss (how much data can be lost)", "RTO applies to batch pipelines; RPO applies to streaming", "RTO is measured in rows; RPO is measured in hours"], correct: 1 },
            { question: "Why use DEEP CLONE instead of azcopy for Delta table backups?", options: ["azcopy doesn't work with Azure", "DEEP CLONE copies both data files AND the Delta transaction log  -  the restored table is fully functional with history; azcopy copies raw files but may miss transaction log consistency", "DEEP CLONE is faster", "azcopy doesn't support scheduled runs"], correct: 1 },
            { question: "For a production gold layer with RTO=4h and RPO=15min, which storage redundancy should you use?", options: ["LRS  -  cheapest and sufficient", "GZRS  -  zone-redundant with geo-replication, supports regional failover within the RTO window", "ZRS  -  zone redundant is sufficient", "LRS with manual backups every 15 minutes"], correct: 1 },
          ]} />
          {completeBtn('prod-disaster-recovery')}
        </section>

        {/* ── prod-cost ── */}
        <section id="prod-cost" ref={el => { if (el) sectionRefs.current['prod-cost'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Cost Optimization</h1>
            <p className="topic-desc">Databricks DBU optimization, Delta OPTIMIZE/VACUUM, storage lifecycle policies, spot instances, cluster auto-termination, and cost tagging strategies for Azure data platforms.</p>
          </div>
          <CostDiagram />
          <CostAnimation />
          <CodeBlock lang="text">{`COST LEVERS FOR AZURE DATA PLATFORMS
═══════════════════════════════════════════════════════════════
Databricks Compute (typically 60-70% of total cost)
  ✓ Auto-termination: set 30min idle timeout on all interactive clusters
  ✓ Spot/preemptible workers: 70-90% cheaper for non-critical batch jobs
  ✓ Right-sizing: profile job memory/CPU; don't over-provision
  ✓ Serverless SQL: for ad-hoc queries  -  pay per query, no idle cluster cost
  ✓ Photon engine: faster = less runtime = fewer DBUs (break-even ~2x cost per DBU)
  ✓ Job clusters vs all-purpose: jobs use cheaper job cluster DBU rates
  ✗ Avoid: large all-purpose clusters left running overnight

Azure Storage (typically 15-20% of cost)
  ✓ Lifecycle policies: auto-tier Bronze > 90 days old to Cool storage (40% cheaper)
  ✓ VACUUM Delta: remove old file versions (default = keep 7 days of history)
  ✓ OPTIMIZE + Z-ORDER: fewer, larger files = less scan cost + faster queries
  ✓ Compression: Delta auto-compresses Parquet; avoid uncompressed formats
  ✗ Avoid: keeping unlimited retention on high-volume Bronze tables

Data Transfer
  ✓ Keep compute co-located with storage (same region)
  ✗ Avoid: cross-region reads; ADLS in East US + Databricks in West US = $$$

Cost Visibility
  ✓ Tag every resource: team, environment, pipeline_name, cost_center
  ✓ Azure Cost Management: set budget alerts at 80% and 100%
  ✓ Databricks Cost Management: per-cluster cost attribution
  ✓ Chargeback: query ops.pipeline_metrics to allocate DBU cost to teams`}</CodeBlock>
          <CodeBlock lang="python">{`# DELTA MAINTENANCE  -  run weekly to control storage costs
def optimize_and_vacuum(tables: list[str], vacuum_retain_hours: int = 168):
    """
    OPTIMIZE: compacts small files into target file size (1GB default)
    Z-ORDER: co-locate related data for faster predicate pushdown
    VACUUM: delete files older than retention period
    """
    for table in tables:
        print(f"Optimizing {table}...")
        # OPTIMIZE with Z-ORDER on most common filter columns
        spark.sql(f"OPTIMIZE {table} ZORDER BY (order_date, customer_id)")
        # VACUUM  -  removes orphaned and old version files
        spark.sql(f"VACUUM {table} RETAIN {vacuum_retain_hours} HOURS")
        print(f"  Done. Table size: {get_table_size_gb(table):.1f} GB")

def get_table_size_gb(table: str) -> float:
    details = spark.sql(f"DESCRIBE DETAIL {table}").collect()[0]
    return details.sizeInBytes / (1024**3)

# STORAGE LIFECYCLE  -  tier old Bronze to Cool storage
# ARM template / Terraform
lifecycle_policy = {
    "rules": [{
        "name": "bronze-to-cool",
        "type": "Lifecycle",
        "definition": {
            "filters": {"blobTypes": ["blockBlob"], "prefixMatch": ["bronze/"]},
            "actions": {
                "baseBlob": {
                    "tierToCool": {"daysAfterModificationGreaterThan": 90},
                    "tierToArchive": {"daysAfterModificationGreaterThan": 365},
                    "delete": {"daysAfterModificationGreaterThan": 2555}  # 7 years
                }
            }
        }
    }]
}

# SPOT INSTANCE JOB CLUSTER for batch pipelines
# In Databricks job cluster config:
spot_cluster_config = {
    "spark_version": "14.3.x-scala2.12",
    "node_type_id": "Standard_DS4_v2",
    "num_workers": 4,
    "azure_attributes": {
        "availability": "SPOT_WITH_FALLBACK_AZURE",  # spot first, on-demand fallback
        "spot_bid_max_price": 100,   # max % of on-demand price to bid
        "first_on_demand": 1         # keep 1 on-demand driver; workers on spot
    }
}

# COST ATTRIBUTION QUERY
spark.sql("""
  SELECT
    p.pipeline_name,
    p.team,
    SUM(m.metric_value) AS total_dbus,
    SUM(m.metric_value) * 0.55 AS estimated_cost_usd  -- $0.55/DBU jobs compute
  FROM ops.pipeline_metrics m
  JOIN ops.pipeline_registry p ON m.pipeline_name = p.pipeline_name
  WHERE m.metric_name = 'dbu_consumed'
    AND DATE(m.recorded_at) >= DATE_TRUNC('month', CURRENT_DATE())
  GROUP BY 1, 2
  ORDER BY 4 DESC
""")`}</CodeBlock>
          <Quiz topicId="prod-cost" questions={[
            { question: "What is the primary purpose of running OPTIMIZE on a Delta table?", options: ["To improve data security", "To compact many small files into fewer large files  -  reducing storage overhead and improving query scan performance (less file listing overhead)", "To validate data quality", "To encrypt the table"], correct: 1 },
            { question: "Why should batch Databricks jobs use job clusters instead of all-purpose clusters?", options: ["Job clusters support more workers", "Job clusters are billed at a lower DBU rate, auto-terminate when the job finishes, and don't accumulate idle time costs", "All-purpose clusters don't support batch jobs", "Job clusters have faster startup times"], correct: 1 },
            { question: "What is the value of tagging Azure resources with team, pipeline_name, and cost_center?", options: ["Tags improve resource performance", "Tags enable cost attribution  -  you can query Azure Cost Management to see exactly which team or pipeline is driving costs, enabling chargeback and optimization", "Tags are required for Databricks to work", "Tags reduce storage costs automatically"], correct: 1 },
          ]} />
          {completeBtn('prod-cost')}
        </section>

        {/* ── prod-performance ── */}
        <section id="prod-performance" ref={el => { if (el) sectionRefs.current['prod-performance'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Performance Engineering</h1>
            <p className="topic-desc">Spark query optimization, partition tuning, broadcast joins, Z-ordering, bloom filters, caching strategies, and reading the Spark UI to diagnose bottlenecks.</p>
          </div>
          <PerformanceDiagram />
          <PerformanceAnimation />
          <CodeBlock lang="text">{`SPARK PERFORMANCE MENTAL MODEL
═══════════════════════════════════════════════════════════════
The goal: minimize data movement (shuffles) and data scanned (predicate pushdown)

SHUFFLE is the #1 performance killer
  Every groupBy, join (except broadcast), distinct triggers a shuffle
  Shuffle writes intermediate data to disk → expensive
  Target: 200 shuffle partitions default; tune with spark.sql.shuffle.partitions

PARTITION STRATEGY
  Too few partitions: cores sit idle; memory pressure per task
  Too many partitions: scheduling overhead; many tiny files
  Rule of thumb: target 100-200MB per partition
  Formula: partitions = max(numCores * 2, shuffleBytes / 200MB)

PREDICATE PUSHDOWN  -  filter as early as possible
  Delta: stats in transaction log → skip entire files before reading
  Parquet: row group statistics → skip row groups
  Must filter on partition columns AND Z-ORDER columns for max benefit

FILE SIZE  -  aim for ~1GB Parquet files in Delta
  Too small (<128MB): file listing overhead dominates read time
  Too large (>2GB): spill to disk during reads; slow GC
  Fix: OPTIMIZE compacts; auto-optimize in Databricks cluster config

BROADCAST JOIN  -  avoid shuffle for small tables
  If one side < spark.sql.autoBroadcastJoinThreshold (default 10MB)
    → Spark auto-broadcasts; no shuffle
  Force with hint: df.join(broadcast(dim_df), ...)
  Rule: always broadcast dims < 100MB; never broadcast tables > 500MB`}</CodeBlock>
          <CodeBlock lang="python">{`# READING THE SPARK UI  -  what to look for
# Access at: https://<cluster-id>.azuredatabricks.net/spark-ui (or :4040 locally)

# Red flags in Spark UI:
# 1. Skewed tasks: one task takes 10x longer than others
#    Fix: add salt to skewed key, or use AQE skew join hint
# 2. GC time > 10% of task time: memory pressure
#    Fix: increase executor memory, reduce partition size
# 3. Spill to disk: tasks processing more than executor memory
#    Fix: increase spark.executor.memory or reduce data per partition
# 4. Input/Output ratio: small input producing massive shuffle output
#    Fix: push filters earlier; use columnar pruning

# ADAPTIVE QUERY EXECUTION (AQE)  -  enable in all production jobs
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")

# PARTITION TUNING
spark.conf.set("spark.sql.shuffle.partitions", "400")  # tune per job size
# Or let AQE set it dynamically  -  preferred

# BROADCAST JOIN  -  explicit hint for joins just over auto-threshold
from pyspark.sql.functions import broadcast

result = large_fact.join(
    broadcast(small_dim),  # forces broadcast regardless of size threshold
    "customer_id"
)

# SALTING  -  fix skewed joins (one key has 80% of data)
import pyspark.sql.functions as F

N_SALT = 20
salted_fact = (large_df
    .withColumn("salt", (F.rand() * N_SALT).cast("int"))
    .withColumn("salted_key", F.concat("join_key", F.lit("_"), "salt")))

exploded_dim = (small_dim
    .withColumn("salt", F.explode(F.array([F.lit(i) for i in range(N_SALT)])))
    .withColumn("salted_key", F.concat("join_key", F.lit("_"), "salt")))

result = salted_fact.join(exploded_dim, "salted_key").drop("salt", "salted_key")

# DELTA Z-ORDER  -  co-locate data for common query patterns
# Run after OPTIMIZE; statistics guide file skipping
spark.sql("""
    OPTIMIZE gold.fact_orders
    ZORDER BY (order_date, customer_id)
    -- Now queries filtering by order_date AND/OR customer_id skip most files
""")

# BLOOM FILTER  -  probabilistic index for high-cardinality string columns
spark.sql("""
    CREATE BLOOMFILTER INDEX ON TABLE gold.fact_orders
    FOR COLUMNS(transaction_id OPTIONS (fpr=0.01, numItems=10000000))
    -- fpr: false positive rate (1%); trade-off: index size vs effectiveness
""")`}</CodeBlock>
          <Quiz topicId="prod-performance" questions={[
            { question: "What causes data skew in Spark and how do you fix it?", options: ["Too many executors processing the same data", "One or a few keys (e.g., 'NULL' or a large customer) containing a disproportionate share of records  -  causes one task to run 10x longer; fix with salting (add random prefix to keys) or AQE skew join hint", "Using the wrong file format", "Having too many small files"], correct: 1 },
            { question: "When should you use a broadcast join?", options: ["Always  -  broadcast joins are always faster", "When one side of the join is small (< ~100-200MB)  -  broadcasting it to all executors eliminates the shuffle, which is the most expensive operation", "Only for outer joins", "When both tables are large"], correct: 1 },
            { question: "What does Z-ORDER do and what are its limitations?", options: ["It sorts the Delta table by row count", "It co-locates related rows in the same files so Delta can skip more files when filtering  -  only effective on columns you frequently filter on, and must be re-run after new data arrives (not automatic)", "It creates a B-tree index on specified columns", "It compresses Delta files more aggressively"], correct: 1 },
          ]} />
          {completeBtn('prod-performance')}
        </section>

        {/* ── prod-data-contracts ── */}
        <section id="prod-data-contracts" ref={el => { if (el) sectionRefs.current['prod-data-contracts'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Data Contracts</h1>
            <p className="topic-desc">Formal agreements between data producers and consumers  -  defining schema, SLAs, quality expectations, and versioning. The tool that prevents silent data breakage at scale.</p>
          </div>
          <DataContractDiagram />
          <DataContractAnimation />
          <CodeBlock lang="yaml">{`# data-contract.yaml  -  orders_events topic contract
# Follows the Data Contract Specification (datacontract.com)
dataContractSpecification: 0.9.3
id: urn:datacontract:orders:events:v2
info:
  title: Orders Events
  version: 2.1.0
  status: active
  owner: orders-team@company.com
  description: "Real-time order lifecycle events from the order management system"
  slaDuration: P1D          # data must be available within 1 day
  slaIntervalOfChange: PT1H # updated at least every hour during business hours

servers:
  production:
    type: kafka
    host: kafka-prod.company.com:9092
    topic: orders.events.v2
    format: avro
    schemaRegistry: https://schema-registry.company.com

models:
  OrderEvent:
    description: "A single order lifecycle event"
    fields:
      order_id:
        type: string
        required: true
        description: "Unique order identifier (UUID)"
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
      event_type:
        type: string
        required: true
        enum: [order_created, order_shipped, order_delivered, order_cancelled]
      event_timestamp:
        type: timestamp
        required: true
      customer_id:
        type: string
        required: true
      total_amount:
        type: number
        minimum: 0
        maximum: 1000000
      currency:
        type: string
        enum: [USD, EUR, GBP, CAD]

quality:
  - type: text
    specification: "order_id must be unique within a 1-hour window"
  - type: text
    specification: "event_timestamp must not be more than 5 minutes in the future"
  - type: text
    specification: "total_amount must be >= 0 for all event types"
  - type: sql
    query: "SELECT COUNT(*) FROM orders_events WHERE total_amount < 0"
    mustBe: 0`}</CodeBlock>
          <CodeBlock lang="python">{`# CONTRACT VALIDATION  -  run in producer CI/CD
import yaml
import json
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroDeserializer

def validate_schema_compatibility(contract_path: str, schema_registry_url: str):
    """Ensure new schema version doesn't break consumers"""
    with open(contract_path) as f:
        contract = yaml.safe_load(f)

    sr_client = SchemaRegistryClient({"url": schema_registry_url})
    subject = f"{contract['servers']['production']['topic']}-value"
    current_schema = sr_client.get_latest_version(subject)

    # Check compatibility  -  FULL_TRANSITIVE means backward + forward compatible
    compatibility = sr_client.test_compatibility(
        subject_name=subject,
        schema=AvroSchema(json.dumps(contract_to_avro(contract)))
    )
    if not compatibility:
        raise ValueError(f"Schema change breaks compatibility! Subject: {subject}")

    print(f"Schema compatible. Current version: {current_schema.version}")

def contract_to_avro(contract: dict) -> dict:
    """Convert data contract YAML to Avro schema JSON"""
    fields = []
    for name, field in contract['models']['OrderEvent']['fields'].items():
        avro_type = {"string": "string", "number": "double", "timestamp": "long"}.get(field['type'], "string")
        if not field.get('required', False):
            avro_type = ["null", avro_type]
        fields.append({"name": name, "type": avro_type})
    return {"type": "record", "name": "OrderEvent", "fields": fields}

# CONSUMER-SIDE CONTRACT ENFORCEMENT
def read_with_contract_validation(topic: str, contract_path: str, spark):
    """Read Kafka topic and fail if schema doesn't match contract"""
    with open(contract_path) as f:
        contract = yaml.safe_load(f)

    df = spark.readStream.format("kafka").option("subscribe", topic).load()
    expected_fields = set(contract['models']['OrderEvent']['fields'].keys())
    actual_fields = set(df.schema.fieldNames())

    missing = expected_fields - actual_fields
    if missing:
        raise ValueError(f"Contract violation: missing fields {missing}")

    return df`}</CodeBlock>
          <Quiz topicId="prod-data-contracts" questions={[
            { question: "What problem do data contracts solve in large data platforms?", options: ["They improve query performance", "They formalize the agreement between producers and consumers  -  preventing silent schema changes, SLA violations, and quality regressions from propagating to downstream analytics", "They replace unit tests", "They are a storage format"], correct: 1 },
            { question: "What does FULL_TRANSITIVE schema compatibility mean in Confluent Schema Registry?", options: ["All schemas must be identical", "New schema versions must be both backward-compatible (old consumers can read new data) AND forward-compatible (new consumers can read old data)", "Only the latest version is kept", "Schemas are automatically generated"], correct: 1 },
            { question: "At what stage of the pipeline should contract validation ideally run?", options: ["Only in production after data has been processed", "In the producer's CI/CD pipeline BEFORE deployment  -  catching contract violations before they reach production consumers", "Only when a consumer reports a problem", "During the nightly data quality batch"], correct: 1 },
          ]} />
          {completeBtn('prod-data-contracts')}
        </section>

        {/* ── prod-patterns ── */}
        <section id="prod-patterns" ref={el => { if (el) sectionRefs.current['prod-patterns'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">Enterprise Patterns</h1>
            <p className="topic-desc">Data catalog integration, master data management, data lineage, governance frameworks, data product thinking, and operating a data platform at enterprise scale.</p>
          </div>
          <AdvancedPatternsDiagram />
          <AdvancedPatternsAnimation />
          <CodeBlock lang="text">{`ENTERPRISE DATA PLATFORM OPERATING MODEL
═══════════════════════════════════════════════════════════════
Data Platform Team (central, enabling)
  Provides: infrastructure, Unity Catalog, CI/CD tooling, standards
  Does NOT own: business data products  -  that's domain teams' job
  SLA to domains: <4h P1 incident response; 99.5% platform uptime

Domain Data Teams (distributed, owning)
  Own: data products for their domain (orders, customers, finance)
  Accountable: freshness, quality, documentation, consumer SLAs
  Consume: platform infrastructure + self-serve tooling

DATA PRODUCT THINKING
═══════════════════════════════════════════════════════════════
A data product is a curated, governed, documented dataset that:
  ✓ Has a clear owner (team + individual)
  ✓ Publishes an SLA (freshness, uptime, quality)
  ✓ Has a schema contract (data contract YAML)
  ✓ Is discoverable (Unity Catalog tags + descriptions)
  ✓ Is tested (dbt tests + Great Expectations)
  ✓ Versioned (breaking changes increment major version)

Anti-patterns to avoid:
  ✗ Undocumented tables with no owner
  ✗ "shadow" pipelines built by analysts directly on Bronze
  ✗ Gold tables that only one dashboard uses and nobody maintains
  ✗ Schema changes deployed without consumer notification

MASTER DATA MANAGEMENT (MDM)
═══════════════════════════════════════════════════════════════
Problem: "customer" means different things in CRM, ERP, and web analytics
  CRM: customer = account; ERP: customer = billing entity; web: customer = cookie
  Without MDM: 3 different customer counts in 3 different dashboards

MDM Solution:
  Golden record: authoritative master record per entity (customer, product, location)
  Match & merge: probabilistic matching to link records across systems
  Master ID: synthetic key that links all source system IDs
  Implementation: Azure Purview (data catalog) + custom matching pipeline

DATA LINEAGE
  Track: where did this column come from? What's downstream of this table?
  Unity Catalog: auto-captures SQL-based lineage at column level
  ADF: pipeline-level lineage to Azure Purview
  dbt: full DAG lineage built-in (dbt docs serve)
  Value: impact analysis before breaking changes; root cause for bad data`}</CodeBlock>
          <CodeBlock lang="python">{`# DATA CATALOG  -  Unity Catalog tagging for discoverability
spark.sql("""
  ALTER TABLE gold.fact_orders
  SET TAGS (
    'domain' = 'orders',
    'owner' = 'orders-team@company.com',
    'sla_freshness' = '1h',
    'contains_pii' = 'false',
    'data_product_version' = '3.2.0',
    'consumer_count' = '14'
  )
""")

# Column-level tags for PII governance
spark.sql("""
  ALTER TABLE silver.customer_profiles
  ALTER COLUMN email SET TAGS ('pii_type' = 'email', 'gdpr_subject' = 'true')
""")

# DATA LINEAGE  -  track custom lineage for non-SQL pipelines
from pyapacheatlas.auth import ServicePrincipalAuthentication
from pyapacheatlas.core import PurviewClient

# Register lineage when Bronze → Silver pipeline runs
def register_pipeline_lineage(adf_run_id: str, source_table: str, target_table: str):
    auth = ServicePrincipalAuthentication(
        tenant_id=TENANT_ID, client_id=CLIENT_ID, client_secret=CLIENT_SECRET
    )
    client = PurviewClient(account_name=PURVIEW_ACCOUNT, authentication=auth)
    client.upload_entities(entities=[{
        "typeName": "Process",
        "attributes": {
            "name": f"silver_orders_{adf_run_id}",
            "inputs": [{"typeName": "azure_datalake_gen2_path", "uniqueAttributes": {"qualifiedName": source_table}}],
            "outputs": [{"typeName": "azure_datalake_gen2_path", "uniqueAttributes": {"qualifiedName": target_table}}],
        }
    }])

# IMPACT ANALYSIS  -  find all downstream tables before changing a schema
downstream_query = spark.sql("""
  SELECT DISTINCT target_table, pipeline_name, team, owner_email
  FROM ops.lineage_graph
  WHERE source_table = 'silver.orders_cleaned'
  ORDER BY team, target_table
""")
# Output: notify owners of all 14 downstream tables before schema change`}</CodeBlock>
          <Quiz topicId="prod-patterns" questions={[
            { question: "What is the core principle of the Data Product thinking model?", options: ["Every table should be owned by the central data team", "Each dataset has a clear owner, published SLA, schema contract, and is treated with the same accountability as a software product  -  discoverable, tested, versioned", "Data products are only for Gold layer tables", "All data products must be in Parquet format"], correct: 1 },
            { question: "What problem does Master Data Management (MDM) solve?", options: ["It compresses data for cheaper storage", "It resolves conflicting definitions of the same entity across source systems  -  creating a golden record so 'customer' means the same thing across CRM, ERP, and analytics", "It manages Terraform state", "It replaces dbt for SQL transformations"], correct: 1 },
            { question: "Why is data lineage critical before making schema changes?", options: ["Lineage is required by GDPR", "Lineage shows all downstream tables and pipelines that depend on a column  -  enabling impact analysis so you can notify all affected teams before breaking their pipelines", "It improves query performance", "Lineage is only needed for compliance tables"], correct: 1 },
          ]} />
          {completeBtn('prod-patterns')}
        </section>

        {/* ── prod-interview-project ── */}
        <section id="prod-interview-project" ref={el => { if (el) sectionRefs.current['prod-interview-project'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Production Data Engineering</div>
            <h1 className="topic-title">End-to-End Capstone Project</h1>
            <p className="topic-desc">Design and implement a production-grade data platform for a fictional e-commerce company. This project ties together every concept from Level 9 into a cohesive system design and working implementation.</p>
          </div>
          <InterviewProjectDiagram />
          <InterviewProjectAnimation />
          <CodeBlock lang="text">{`CAPSTONE: E-COMMERCE DATA PLATFORM
═══════════════════════════════════════════════════════════════
Company: ShopFast  -  50M orders/month, 8M customers, 200 analysts
Requirements:
  - Daily financial reporting by 7am UTC (RTO 2h, RPO 15min)
  - Near-real-time fraud detection feed (< 5min latency)
  - Self-serve analytics for 200 analysts
  - GDPR compliance (right-to-erasure, data minimization)
  - 3-year data retention for financial data
  - $50k/month infrastructure budget

ARCHITECTURE DECISION
═══════════════════════════════════════════════════════════════
Chosen: Lakehouse (Azure) + Kappa for streaming
Rationale:
  - Lakehouse: single copy of data; SQL + ML; Unity Catalog governance
  - Kappa: Kafka-first org; unify batch + stream in one Flink/Spark codebase
  - Rejected Lambda: two codebases too expensive to maintain at this scale
  - Rejected Data Mesh: team not large enough yet (15 DE team)

INFRASTRUCTURE (Terraform)
  - ADLS Gen2 GZRS: bronze/silver/gold containers
  - Databricks Premium (Unity Catalog): shared + job clusters
  - ADF: orchestration for batch pipelines
  - Kafka (Event Hubs Premium): orders.events, fraud.signals
  - Key Vault: all secrets; managed identities for service-to-service
  - Azure Monitor + Log Analytics: observability
  - Azure DevOps: CI/CD

DATA ARCHITECTURE
  Bronze:  Raw events + daily DB snapshots, append-only, 7-year retention
  Silver:  Validated orders, deduplicated customers, SCD2 dimensions
  Gold:    fct_orders, fct_revenue_daily, dim_customer (SCD2), agg_fraud_signals

SLAs
  Gold tables ready by: 06:30 UTC daily
  Fraud signal lag: < 5 minutes
  Bad record tolerance: < 0.1% before pipeline halt
  Dashboard p95 query time: < 3 seconds`}</CodeBlock>
          <CodeBlock lang="python">{`# CAPSTONE IMPLEMENTATION  -  key components

# 1. BRONZE INGEST  -  idempotent, event-driven
def ingest_orders_bronze(event: dict):
    batch_id = event["batch_id"]
    source_path = event["source_path"]

    df = (spark.read.format("avro")
          .load(source_path)
          .withColumn("_batch_id", F.lit(batch_id))
          .withColumn("_ingest_ts", F.current_timestamp())
          .withColumn("_source", F.lit("orders_events_kafka")))

    # Idempotent: delete + reinsert for this batch_id
    spark.sql(f"DELETE FROM bronze.orders_events WHERE _batch_id = '{batch_id}'")
    df.write.format("delta").mode("append").saveAsTable("bronze.orders_events")

# 2. SILVER PROCESSING  -  quality + SCD2
def process_silver_orders():
    new_orders = spark.sql("""
        SELECT * FROM bronze.orders_events
        WHERE _ingest_ts >= (SELECT COALESCE(MAX(_silver_ts), '1900-01-01') FROM silver.orders)
    """)

    # Quality gates
    valid = new_orders.filter(
        F.col("order_id").isNotNull() &
        F.col("amount").between(0, 1_000_000) &
        F.col("event_type").isin("order_created","order_shipped","order_delivered","order_cancelled")
    )
    bad_rate = (new_orders.count() - valid.count()) / max(new_orders.count(), 1)
    if bad_rate > 0.001:
        raise ValueError(f"Bad record rate {bad_rate:.2%} exceeds 0.1% threshold  -  halting")

    # Upsert to silver
    silver_upsert(valid, "silver.orders", key_cols=["order_id"])

# 3. GOLD  -  daily revenue fact table
def build_gold_revenue():
    spark.sql("""
        CREATE OR REPLACE TABLE gold.fct_revenue_daily AS
        SELECT
            o.order_date,
            c.customer_segment,
            c.region,
            p.category,
            COUNT(DISTINCT o.order_id)  AS order_count,
            SUM(o.amount)               AS gross_revenue,
            SUM(o.amount * (1 - o.discount_rate)) AS net_revenue,
            CURRENT_TIMESTAMP()         AS _gold_ts
        FROM silver.orders o
        JOIN gold.dim_customer c ON o.customer_surrogate_key = c.surrogate_key
        JOIN gold.dim_product p  ON o.product_id = p.product_id
        WHERE o.status = 'delivered'
        GROUP BY 1, 2, 3, 4
    """)

# 4. FRAUD STREAMING  -  < 5min latency
fraud_stream = (
    spark.readStream
    .format("kafka")
    .option("subscribe", "orders.events.v2")
    .option("maxOffsetsPerTrigger", 10_000)
    .load()
    .select(F.from_avro("value", orders_schema).alias("e"))
    .select("e.*")
    .filter("amount > 5000 OR (country != billing_country)")
    .withColumn("fraud_score", F.expr("amount / 1000 + IF(country != billing_country, 50, 0)"))
    .writeStream
    .trigger(processingTime="1 minute")
    .option("checkpointLocation", "/checkpoints/fraud")
    .toTable("gold.agg_fraud_signals")
)

# 5. GDPR ERASURE
def erase_customer(customer_id: str):
    """Right-to-erasure: pseudonymize PII across all layers"""
    tombstone = f"ERASED_{hashlib.sha256(customer_id.encode()).hexdigest()[:8]}"
    for table in ["bronze.orders_events", "silver.orders", "gold.dim_customer"]:
        spark.sql(f"""
            UPDATE {table}
            SET email = '{tombstone}', phone = '{tombstone}', name = '{tombstone}'
            WHERE customer_id = '{customer_id}'
        """)`}</CodeBlock>
          <Quiz topicId="prod-interview-project" questions={[
            { question: "In the capstone, why was Data Mesh rejected despite the company having 50M orders/month?", options: ["Data Mesh doesn't scale to that volume", "The engineering team size (15 DEs) is too small  -  Data Mesh requires domain teams mature enough to own data products independently; the overhead exceeds the benefit at this org size", "Data Mesh doesn't support GDPR", "Data Mesh requires a different cloud provider"], correct: 1 },
            { question: "Why does the fraud pipeline use maxOffsetsPerTrigger=10,000 and a 1-minute trigger instead of continuous processing?", options: ["Continuous processing is not supported", "Micro-batch with bounded offsets implements backpressure  -  prevents executor OOM on traffic spikes while still meeting the 5-minute SLA; continuous processing provides no benefit here", "1-minute trigger is cheaper", "Kafka requires micro-batch mode"], correct: 1 },
            { question: "What happens when the GDPR erasure function runs on a customer who made 3 years of purchases?", options: ["Their orders are deleted from all tables", "Their PII columns (email, phone, name) are replaced with a tombstone hash across bronze/silver/gold  -  order history is preserved for financial compliance but the customer is no longer identifiable", "Only the customer dimension table is updated", "The pipeline stops and waits for manual review"], correct: 1 },
          ]} />
          {completeBtn('prod-interview-project')}
        </section>

        {/* ── model-star ── */}
        <section id="model-star" ref={el => { if (el) sectionRefs.current['model-star'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Data Modeling Mastery</div>
            <h1 className="topic-title">Star Schema Deep Dive</h1>
            <p className="topic-desc">The star schema is the foundation of dimensional modeling in data warehousing. Its center is the grain  -  the single most important design decision, defining exactly what one row in your fact table represents. Everything else flows from the grain.</p>
          </div>
          <StarSchemaDiagram />
          <StarSchemaAnimation />
          <CodeBlock lang="text">{`THE GRAIN  -  MOST IMPORTANT DECISION IN DATA MODELING
═══════════════════════════════════════════════════════════════
The grain = "what does one row in the fact table represent?"
  Too fine:  one row per order line item  → high cardinality, flexible analytics
  Too coarse: one row per customer per month → less flexible, pre-aggregated

Define grain first, then identify dimensions and measures.
Example: "One row per order line item per store per day"

FACT TABLE TYPES
═══════════════════════════════════════════════════════════════
Transaction Fact (most common)
  One row per business event (order placed, item scanned, payment made)
  Grain is at the event level; append-only; highest granularity
  Example: fact_sales  -  one row per product sold per transaction

Periodic Snapshot
  One row per period (day/month) per entity, regardless of activity
  Used for: account balances, inventory levels, headcount
  Example: fact_inventory_daily  -  one row per SKU per day

Accumulating Snapshot
  One row per business process lifecycle (tracks stages over time)
  Row is UPDATED as the process progresses (multiple date stamps)
  Example: fact_order_lifecycle  -  one row per order, columns for order_date,
           ship_date, deliver_date, return_date (filled as they occur)

MEASURE TYPES
═══════════════════════════════════════════════════════════════
Additive:      Can SUM across all dimensions  → revenue, quantity, cost
Semi-additive: Can SUM across some dims only  → account_balance (sum by account,
               NOT by date  -  would double-count)
Non-additive:  Cannot SUM at all             → ratios, percentages, margins
               (store margin% + store margin% ≠ total margin%)
               Strategy: store numerator + denominator; compute ratio at query time

DIMENSION TABLE DESIGN
═══════════════════════════════════════════════════════════════
Wide and denormalized: all attributes in one flat table (no sub-tables)
Surrogate key: system-generated integer (not the business key)
  Why: source system keys change, merge, or contain nulls; surrogates are stable
Natural/business key: original source identifier (preserved for traceability)
Slowly changing attributes: handled with SCD patterns (Type 1/2/3)

SPECIAL DIMENSION PATTERNS
═══════════════════════════════════════════════════════════════
Conformed Dimensions
  Same dimension table shared across multiple fact tables
  Example: dim_date used by fact_sales, fact_inventory, fact_hr
  Benefit: consistent date labels, fiscal periods, holidays across all reports

Role-Playing Dimensions
  Same physical dimension table used multiple times in a query with different roles
  Example: dim_date used as OrderDate, ShipDate, DeliveryDate in fact_orders
  Implementation: create views  -  vw_order_date, vw_ship_date → point to dim_date

Degenerate Dimensions
  A dimension with no attributes beyond its key  -  stored on the fact table
  Example: order_id, invoice_number, transaction_number on fact_sales
  No separate dimension table needed; acts as a grouping/drill-through key

Junk Dimensions
  Low-cardinality flags and indicators grouped into one dimension table
  Example: is_gift_wrap (Y/N), is_express (Y/N), payment_type (credit/debit/cash)
  Avoids cluttering fact table with many boolean columns; reduces cardinality`}</CodeBlock>
          <CodeBlock lang="sql">{`-- RETAIL STAR SCHEMA  -  Full DDL
-- Grain: one row per product sold per transaction (line item level)

-- ── Dimension Tables ─────────────────────────────────────────────

CREATE TABLE dim_date (
    date_key          INT           NOT NULL,   -- surrogate key: YYYYMMDD format
    full_date         DATE          NOT NULL,
    day_of_week       VARCHAR(10)   NOT NULL,   -- 'Monday', 'Tuesday', ...
    day_of_month      TINYINT       NOT NULL,
    month_number      TINYINT       NOT NULL,
    month_name        VARCHAR(10)   NOT NULL,
    quarter           TINYINT       NOT NULL,
    year              SMALLINT      NOT NULL,
    is_weekend        BOOLEAN       NOT NULL,
    is_holiday        BOOLEAN       NOT NULL,
    fiscal_period     VARCHAR(10)   NOT NULL,   -- e.g., 'FY2024-Q3'
    PRIMARY KEY (date_key)
);

CREATE TABLE dim_customer (
    customer_key      BIGINT        NOT NULL,   -- surrogate key (SCD2)
    customer_id       VARCHAR(50)   NOT NULL,   -- natural/business key
    first_name        VARCHAR(100),
    last_name         VARCHAR(100),
    email             VARCHAR(255),
    city              VARCHAR(100),
    state             VARCHAR(50),
    country           VARCHAR(50),
    customer_segment  VARCHAR(50),             -- 'Gold', 'Silver', 'Bronze'
    acquisition_channel VARCHAR(50),
    is_current        BOOLEAN       NOT NULL DEFAULT TRUE,
    effective_from    DATE          NOT NULL,
    effective_to      DATE          NOT NULL DEFAULT '9999-12-31',
    PRIMARY KEY (customer_key)
);

CREATE TABLE dim_product (
    product_key       BIGINT        NOT NULL,   -- surrogate key
    product_id        VARCHAR(50)   NOT NULL,   -- natural key / SKU
    product_name      VARCHAR(255)  NOT NULL,
    category          VARCHAR(100)  NOT NULL,
    sub_category      VARCHAR(100),
    brand             VARCHAR(100),
    unit_cost         DECIMAL(10,2),
    is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
    PRIMARY KEY (product_key)
);

CREATE TABLE dim_store (
    store_key         INT           NOT NULL,   -- surrogate key
    store_id          VARCHAR(50)   NOT NULL,   -- natural key
    store_name        VARCHAR(255)  NOT NULL,
    city              VARCHAR(100),
    state             VARCHAR(50),
    country           VARCHAR(50),
    store_type        VARCHAR(50),             -- 'Flagship', 'Outlet', 'Online'
    open_date         DATE,
    PRIMARY KEY (store_key)
);

-- ── Fact Table ───────────────────────────────────────────────────

CREATE TABLE fact_sales (
    sale_key          BIGINT        NOT NULL,   -- surrogate key for the fact row
    -- Foreign keys to all dimensions
    order_date_key    INT           NOT NULL REFERENCES dim_date(date_key),
    ship_date_key     INT                    REFERENCES dim_date(date_key),  -- role-playing
    customer_key      BIGINT        NOT NULL REFERENCES dim_customer(customer_key),
    product_key       BIGINT        NOT NULL REFERENCES dim_product(product_key),
    store_key         INT           NOT NULL REFERENCES dim_store(store_key),
    -- Degenerate dimension (no separate table needed)
    order_id          VARCHAR(50)   NOT NULL,
    order_line_number SMALLINT      NOT NULL,
    -- Additive measures
    quantity          INT           NOT NULL,
    unit_price        DECIMAL(10,2) NOT NULL,
    discount_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
    gross_revenue     DECIMAL(12,2) NOT NULL,   -- quantity * unit_price
    net_revenue       DECIMAL(12,2) NOT NULL,   -- gross_revenue - discount_amount
    cost_of_goods     DECIMAL(12,2),            -- additive: can SUM across all dims
    -- Non-additive (store numerator/denominator; compute margin at query time)
    -- margin_pct: do NOT store here; compute as (net_revenue - cost_of_goods) / net_revenue
    PRIMARY KEY (sale_key)
);

-- ── Query Example: Role-playing dimensions ───────────────────────
SELECT
    od.year             AS order_year,
    od.month_name       AS order_month,
    sd.month_name       AS ship_month,      -- ship_date role
    p.category,
    SUM(f.net_revenue)  AS total_net_revenue,
    SUM(f.net_revenue - f.cost_of_goods) / NULLIF(SUM(f.net_revenue), 0) AS margin_pct
FROM fact_sales f
JOIN dim_date    od ON f.order_date_key = od.date_key   -- OrderDate role
JOIN dim_date    sd ON f.ship_date_key  = sd.date_key   -- ShipDate role
JOIN dim_product p  ON f.product_key    = p.product_key
WHERE od.year = 2024
GROUP BY 1, 2, 3, 4
ORDER BY total_net_revenue DESC;`}</CodeBlock>
          <Quiz topicId="model-star" questions={[
            { question: "What is the 'grain' of a fact table and why is it the most important design decision?", options: ["The number of rows in the table", "The exact definition of what one row represents  -  it determines which dimensions are valid, which measures are additive, and whether queries will double-count data", "The primary key column type", "The partition column chosen for performance"], correct: 1 },
            { question: "What is a role-playing dimension?", options: ["A dimension used only in staging tables", "The same physical dimension table used multiple times in one fact table under different aliases  -  e.g., dim_date used as order_date, ship_date, and deliver_date all in fact_orders", "A dimension that changes slowly over time", "A dimension with boolean flags grouped together"], correct: 1 },
            { question: "Why are account balances considered semi-additive measures (not fully additive)?", options: ["They are stored as text, not numbers", "You can SUM balances across accounts (valid) but not across time periods  -  adding Jan balance + Feb balance double-counts the same money", "They require a separate fact table", "Semi-additive measures cannot be aggregated at all"], correct: 1 },
          ]} />
          {completeBtn('model-star')}
        </section>

        {/* ── model-snowflake ── */}
        <section id="model-snowflake" ref={el => { if (el) sectionRefs.current['model-snowflake'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Data Modeling Mastery</div>
            <h1 className="topic-title">Snowflake Schema vs Star Schema</h1>
            <p className="topic-desc">The snowflake schema normalizes dimension tables into sub-dimensions. Understanding when to use star, snowflake, or galaxy (fact constellation) schemas  -  and the foundational Kimball vs Inmon debate  -  is essential for senior data modeling interviews.</p>
          </div>
          <SnowflakeSchemaDiagram />
          <SnowflakeSchemaAnimation />
          <CodeBlock lang="text">{`SNOWFLAKE SCHEMA  -  NORMALIZED DIMENSIONS
═══════════════════════════════════════════════════════════════
Snowflake: dimension tables are further normalized into sub-dimension tables.
  dim_product → dim_category → dim_department
  dim_customer → dim_city → dim_state → dim_country

Example: instead of dim_product with category_name + department_name columns,
  you have dim_product (product_key, category_key)
           dim_category (category_key, category_name, dept_key)
           dim_department (dept_key, dept_name)

STAR vs SNOWFLAKE  -  COMPARISON TABLE
═══════════════════════════════════════════════════════════════
Dimension         Star Schema              Snowflake Schema
──────────────    ──────────────────────   ──────────────────────────────
Query complexity  Simple (few JOINs)       Complex (many JOINs per query)
Query speed       Faster (fewer JOINs)     Slower (more JOINs, more I/O)
Storage           More (denormalized)      Less (normalized, no redundancy)
ETL complexity    Simpler to load          More complex (load in order)
BI tool support   Excellent                Moderate (tools handle extra JOINs)
Maintainability   Easy                     Harder (changes cascade through layers)
When to use       BI / ad-hoc queries      Storage-constrained; ETL normalizes naturally

GALAXY SCHEMA (Fact Constellation)
═══════════════════════════════════════════════════════════════
Multiple fact tables sharing conformed dimension tables.
Example:
  fact_sales   uses → dim_date, dim_customer, dim_product, dim_store
  fact_returns uses → dim_date, dim_customer, dim_product (no dim_store)
  fact_budget  uses → dim_date, dim_product, dim_department

This is the real-world state of mature data warehouses  -  not one clean star,
but a constellation of fact tables sharing conformed dimensions.

KIMBALL vs INMON DEBATE
═══════════════════════════════════════════════════════════════
Kimball (Ralph Kimball)  -  Dimensional Modeling
  Bottom-up: build data marts first; integrated via conformed dimensions
  Schema: star schemas in each data mart
  Philosophy: design for analytics users (business-friendly, fast queries)
  Process: identify business process → declare grain → choose dimensions → facts
  Adopted by: most BI-driven teams, dbt shops, Databricks Gold layer

Inmon (Bill Inmon)  -  Corporate Information Factory
  Top-down: build enterprise 3NF DW first; then dependent data marts
  Schema: 3rd Normal Form (3NF) in the central DW; star schemas in marts
  Philosophy: single source of truth first; marts are derived
  Adopted by: large enterprises with complex operational reporting needs

Modern Consensus (2024)
  Cloud DW teams almost universally use Kimball-style star schemas in the Gold layer.
  Why: columnar storage (Parquet/Delta) makes denormalization cheap  -  storage costs
  are negligible; query speed with denormalized dims is dramatically better.
  The "3NF wastes storage" argument that drove Kimball is even less relevant on ADLS.
  Inmon's top-down governance model is still influential for enterprise DW programs.`}</CodeBlock>
          <CodeBlock lang="sql">{`-- STAR vs SNOWFLAKE SCHEMA  -  side by side DDL

-- ── STAR: dim_product (fully denormalized) ───────────────────────
CREATE TABLE star.dim_product (
    product_key       BIGINT        NOT NULL,
    product_id        VARCHAR(50)   NOT NULL,
    product_name      VARCHAR(255)  NOT NULL,
    -- Category attributes denormalized directly onto product
    category_id       VARCHAR(50),
    category_name     VARCHAR(100),
    -- Department attributes also denormalized here
    department_id     VARCHAR(50),
    department_name   VARCHAR(100),
    PRIMARY KEY (product_key)
);
-- One JOIN to get product + category + department in any query

-- ── SNOWFLAKE: normalized sub-dimensions ─────────────────────────
CREATE TABLE snowflake.dim_department (
    dept_key          INT           NOT NULL,
    dept_id           VARCHAR(50)   NOT NULL,
    dept_name         VARCHAR(100)  NOT NULL,
    PRIMARY KEY (dept_key)
);

CREATE TABLE snowflake.dim_category (
    category_key      INT           NOT NULL,
    category_id       VARCHAR(50)   NOT NULL,
    category_name     VARCHAR(100)  NOT NULL,
    dept_key          INT           NOT NULL REFERENCES snowflake.dim_department(dept_key),
    PRIMARY KEY (category_key)
);

CREATE TABLE snowflake.dim_product (
    product_key       BIGINT        NOT NULL,
    product_id        VARCHAR(50)   NOT NULL,
    product_name      VARCHAR(255)  NOT NULL,
    category_key      INT           NOT NULL REFERENCES snowflake.dim_category(category_key),
    -- No category_name or dept_name here  -  they live in sub-dimensions
    PRIMARY KEY (product_key)
);
-- Three JOINs (fact → dim_product → dim_category → dim_department)
-- to get the same result as one JOIN in the star schema

-- ── GALAXY SCHEMA  -  shared conformed dimensions ───────────────────
-- fact_sales and fact_returns both use the same dim_date, dim_product
SELECT
    d.year,
    p.category_name,
    SUM(s.net_revenue)   AS gross_sales,
    SUM(r.refund_amount) AS total_returns,
    SUM(s.net_revenue) - SUM(r.refund_amount) AS net_revenue
FROM fact_sales s
JOIN fact_returns r  ON s.product_key = r.product_key
                    AND s.order_date_key = r.return_date_key
JOIN star.dim_date    d ON s.order_date_key = d.date_key
JOIN star.dim_product p ON s.product_key    = p.product_key
WHERE d.year = 2024
GROUP BY 1, 2
ORDER BY net_revenue DESC;

-- ── dbt Kimball-style Gold layer (modern practice) ────────────────
-- models/marts/sales/fct_sales.sql
{{
  config(
    materialized='incremental',
    unique_key='sale_key',
    incremental_strategy='merge'
  )
}}
SELECT
    {{ dbt_utils.generate_surrogate_key(['order_id', 'line_number']) }} AS sale_key,
    s.order_id,
    s.line_number,
    dd.date_key              AS order_date_key,
    dc.customer_key,
    dp.product_key,
    s.quantity,
    s.unit_price,
    s.quantity * s.unit_price AS gross_revenue
FROM {{ ref('stg_orders') }} s
JOIN {{ ref('dim_date') }}     dd ON s.order_date = dd.full_date
JOIN {{ ref('dim_customer') }} dc ON s.customer_id = dc.customer_id AND dc.is_current
JOIN {{ ref('dim_product') }}  dp ON s.product_id  = dp.product_id
{% if is_incremental() %}
WHERE s.order_date >= (SELECT MAX(order_date) FROM {{ this }}) - INTERVAL 3 DAYS
{% endif %}`}</CodeBlock>
          <Quiz topicId="model-snowflake" questions={[
            { question: "What is the main trade-off of snowflake schema vs star schema?", options: ["Snowflake is always better  -  it is newer", "Star schema has faster queries with fewer JOINs and is simpler for BI tools; snowflake schema reduces storage redundancy but requires more JOINs and is harder to maintain", "Snowflake schema only works with the Snowflake cloud database", "Star schema only works for small datasets"], correct: 1 },
            { question: "What is a galaxy (fact constellation) schema?", options: ["A schema with more than 100 dimension tables", "Multiple fact tables that share conformed dimension tables  -  the natural evolution of a mature data warehouse with multiple business processes", "A proprietary Snowflake Inc. data model", "A schema pattern only used in streaming pipelines"], correct: 1 },
            { question: "What is the core difference between Kimball and Inmon's approach to data warehousing?", options: ["Kimball uses SQL; Inmon uses NoSQL", "Kimball builds data marts first (bottom-up, star schemas, designed for analytics); Inmon builds an enterprise 3NF DW first (top-down, single source of truth), then derives marts", "Kimball is for batch; Inmon is for streaming", "They are the same methodology with different branding"], correct: 1 },
          ]} />
          {completeBtn('model-snowflake')}
        </section>

        {/* ── model-datavault ── */}
        <section id="model-datavault" ref={el => { if (el) sectionRefs.current['model-datavault'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Data Modeling Mastery</div>
            <h1 className="topic-title">Data Vault 2.0</h1>
            <p className="topic-desc">Data Vault 2.0 is a modeling methodology built for enterprise data warehouse agility and auditability. Unlike star schemas, it handles multiple source systems naturally and provides a full, immutable audit trail  -  every row ever loaded is preserved forever.</p>
          </div>
          <DataVaultDiagram />
          <DataVaultAnimation />
          <CodeBlock lang="text">{`DATA VAULT 2.0  -  THREE ENTITY TYPES
═══════════════════════════════════════════════════════════════
Hubs  -  Business Keys
  One Hub per business concept: HUB_CUSTOMER, HUB_ORDER, HUB_PRODUCT
  Contains ONLY the business key (natural key from source system)
  No descriptive attributes  -  just the key + metadata columns
  Columns: hash_key (PK), business_key, load_date, record_source
  Rule: never update or delete; append-only

Links  -  Relationships Between Hubs
  One Link per relationship: LINK_ORDER_CUSTOMER, LINK_ORDER_PRODUCT
  Models the many-to-many relationships between business concepts
  Columns: hash_key (PK), hub_A_hash_key (FK), hub_B_hash_key (FK),
           load_date, record_source
  Rule: relationships are facts  -  once a link exists, it's preserved

Satellites  -  Descriptive Attributes
  One Satellite per source system + attribute group, per Hub or Link
  Contains all context/descriptive data with full history
  Example: SAT_CUSTOMER_CRM (from CRM), SAT_CUSTOMER_ERP (from ERP)
  Columns: parent_hash_key (FK), load_date (PK composite), record_source,
           hash_diff (hash of all payload columns  -  change detection),
           + all descriptive attributes
  Rule: append-only; new row when hash_diff changes

ALWAYS APPEND-ONLY  -  THE CORE PRINCIPLE
═══════════════════════════════════════════════════════════════
Never UPDATE or DELETE in a raw Data Vault.
Every change produces a new row with a new load_date.
The latest row per parent_hash_key in a Satellite = current state.
Full history is always preserved  -  perfect audit trail.

HASH KEYS  -  MD5 / SHA-256 of business key
  Purpose: consistent surrogate key across source systems; enables parallel loading
  Pattern: UPPER(MD5(TRIM(COALESCE(business_key, '^^'))))
  SHA-256 preferred for collision resistance in large volumes

WHY DATA VAULT?
═══════════════════════════════════════════════════════════════
  Multiple source systems: each system gets its own Satellite  -  no schema conflicts
  Full audit trail: every version of every record preserved; regulators love this
  No historization gaps: unlike SCD2 which requires careful MERGE logic
  Agile: add new source system by adding a new Satellite  -  no restructuring Hubs/Links
  Parallel loading: Hubs, Links, Satellites can all load independently

LIMITATIONS
═══════════════════════════════════════════════════════════════
  Complex queries: answering "what is customer's current address?" requires
    3+ JOINs (Hub → Satellite; find latest row in Satellite)
  Not BI-friendly: analysts cannot query raw Data Vault directly
  Requires Business Vault: computed fields, soft rules applied on top of raw vault
  Requires Information Mart: star schema layer for BI tools (Kimball-style on top of DV)
  Overhead: more tables to load and maintain vs direct star schema approach`}</CodeBlock>
          <CodeBlock lang="sql">{`-- DATA VAULT 2.0  -  Full DDL for HUB_CUSTOMER, LINK_ORDER_CUSTOMER, SAT_CUSTOMER_CRM

-- ── Hub: HUB_CUSTOMER ────────────────────────────────────────────
CREATE TABLE raw_vault.HUB_CUSTOMER (
    customer_hash_key  CHAR(32)      NOT NULL,   -- MD5 of customer_id
    customer_id        VARCHAR(50)   NOT NULL,   -- business key from source
    load_date          TIMESTAMP     NOT NULL,   -- when row was loaded into DV
    record_source      VARCHAR(100)  NOT NULL,   -- 'CRM', 'ERP', 'WEB'
    PRIMARY KEY (customer_hash_key)
);

-- ── Hub: HUB_ORDER ───────────────────────────────────────────────
CREATE TABLE raw_vault.HUB_ORDER (
    order_hash_key     CHAR(32)      NOT NULL,
    order_id           VARCHAR(50)   NOT NULL,
    load_date          TIMESTAMP     NOT NULL,
    record_source      VARCHAR(100)  NOT NULL,
    PRIMARY KEY (order_hash_key)
);

-- ── Link: LINK_ORDER_CUSTOMER ────────────────────────────────────
CREATE TABLE raw_vault.LINK_ORDER_CUSTOMER (
    link_order_customer_hash_key  CHAR(32)  NOT NULL,  -- MD5 of order_id + customer_id
    order_hash_key                CHAR(32)  NOT NULL REFERENCES raw_vault.HUB_ORDER(order_hash_key),
    customer_hash_key             CHAR(32)  NOT NULL REFERENCES raw_vault.HUB_CUSTOMER(customer_hash_key),
    load_date                     TIMESTAMP NOT NULL,
    record_source                 VARCHAR(100) NOT NULL,
    PRIMARY KEY (link_order_customer_hash_key)
);

-- ── Satellite: SAT_CUSTOMER_CRM (CRM source system attributes) ───
CREATE TABLE raw_vault.SAT_CUSTOMER_CRM (
    customer_hash_key  CHAR(32)      NOT NULL REFERENCES raw_vault.HUB_CUSTOMER(customer_hash_key),
    load_date          TIMESTAMP     NOT NULL,
    -- composite PK  -  one row per customer per load_date
    PRIMARY KEY (customer_hash_key, load_date),
    record_source      VARCHAR(100)  NOT NULL,
    hash_diff          CHAR(32)      NOT NULL,   -- MD5 of all payload columns; new row only when changed
    load_end_date      TIMESTAMP,               -- NULL = current; populated when superseded
    -- Payload (all CRM attributes)
    first_name         VARCHAR(100),
    last_name          VARCHAR(100),
    email              VARCHAR(255),
    phone              VARCHAR(50),
    crm_segment        VARCHAR(50),
    crm_status         VARCHAR(50)
);

-- ── Satellite: SAT_CUSTOMER_ERP (ERP source  -  different attributes) ──
CREATE TABLE raw_vault.SAT_CUSTOMER_ERP (
    customer_hash_key  CHAR(32)      NOT NULL REFERENCES raw_vault.HUB_CUSTOMER(customer_hash_key),
    load_date          TIMESTAMP     NOT NULL,
    PRIMARY KEY (customer_hash_key, load_date),
    record_source      VARCHAR(100)  NOT NULL,
    hash_diff          CHAR(32)      NOT NULL,
    -- ERP-specific attributes (different system, different columns)
    billing_address    VARCHAR(255),
    payment_terms      VARCHAR(50),
    credit_limit       DECIMAL(12,2),
    erp_account_type   VARCHAR(50)
);

-- ── Query: Current customer profile (join Hub + latest Satellite row) ──
SELECT
    h.customer_id,
    s.first_name,
    s.last_name,
    s.email,
    s.crm_segment
FROM raw_vault.HUB_CUSTOMER h
JOIN raw_vault.SAT_CUSTOMER_CRM s
    ON h.customer_hash_key = s.customer_hash_key
   AND s.load_end_date IS NULL   -- NULL end date = current row
WHERE h.customer_id = 'CUST-12345';`}</CodeBlock>
          <CodeBlock lang="python">{`# DATA VAULT PYSPARK LOAD PATTERNS
import hashlib
from pyspark.sql import functions as F
from pyspark.sql.types import StringType

# ── Hash Key UDF ─────────────────────────────────────────────────
def make_hash_key(*keys):
    """MD5 of concatenated business keys  -  consistent surrogate"""
    combined = "||".join([str(k).strip().upper() if k else "^^" for k in keys])
    return hashlib.md5(combined.encode()).hexdigest().upper()

hash_key_udf = F.udf(make_hash_key, StringType())

# ── Load Hub ─────────────────────────────────────────────────────
def load_hub(source_df, hub_table: str, business_key_col: str, record_source: str):
    """
    Insert only NEW business keys  -  never update a hub.
    Hub is the first entity loaded; satellites depend on it.
    """
    hub_df = (source_df
              .withColumn("customer_hash_key",
                          hash_key_udf(F.col(business_key_col)))
              .withColumn("load_date", F.current_timestamp())
              .withColumn("record_source", F.lit(record_source))
              .select("customer_hash_key", business_key_col, "load_date", "record_source")
              .dropDuplicates(["customer_hash_key"]))

    # Insert only keys not already in the hub
    if spark.catalog.tableExists(hub_table):
        existing_keys = spark.table(hub_table).select("customer_hash_key")
        hub_df = hub_df.join(existing_keys, "customer_hash_key", "left_anti")

    if hub_df.count() > 0:
        hub_df.write.format("delta").mode("append").saveAsTable(hub_table)
    print(f"Hub {hub_table}: {hub_df.count()} new keys inserted")

# ── Load Link ─────────────────────────────────────────────────────
def load_link(source_df, link_table: str, hub_keys: list[str], record_source: str):
    """
    Links connect hubs. Insert only NEW combinations.
    Must be loaded AFTER all referenced hubs are populated.
    """
    # Build composite hash key from all hub keys
    link_df = (source_df
               .withColumn("link_hash_key",
                           hash_key_udf(*[F.col(k) for k in hub_keys]))
               .withColumn("load_date", F.current_timestamp())
               .withColumn("record_source", F.lit(record_source))
               .dropDuplicates(["link_hash_key"]))

    if spark.catalog.tableExists(link_table):
        existing = spark.table(link_table).select("link_hash_key")
        link_df = link_df.join(existing, "link_hash_key", "left_anti")

    if link_df.count() > 0:
        link_df.write.format("delta").mode("append").saveAsTable(link_table)

# ── Load Satellite ────────────────────────────────────────────────
def load_satellite(source_df, sat_table: str, parent_hash_key_col: str,
                   payload_cols: list[str], record_source: str):
    """
    Load only CHANGED rows  -  detect changes via hash_diff.
    New row inserted only when payload columns change.
    Previous row's load_end_date is set to new load_date (optional pattern).
    """
    payload_hash = F.md5(F.concat_ws("||", *[F.coalesce(F.col(c).cast("string"), F.lit(""))
                                               for c in payload_cols]))
    new_df = (source_df
              .withColumn("hash_diff", payload_hash)
              .withColumn("load_date", F.current_timestamp())
              .withColumn("record_source", F.lit(record_source))
              .withColumn("load_end_date", F.lit(None).cast("timestamp")))

    if spark.catalog.tableExists(sat_table):
        # Get latest hash_diff per parent key
        latest = (spark.table(sat_table)
                  .filter(F.col("load_end_date").isNull())
                  .select(parent_hash_key_col, "hash_diff"))

        # Only insert rows where hash_diff changed
        changed = (new_df.alias("n")
                   .join(latest.alias("l"), parent_hash_key_col, "left_outer")
                   .filter(F.col("l.hash_diff").isNull() |
                           (F.col("n.hash_diff") != F.col("l.hash_diff")))
                   .select("n.*"))
    else:
        changed = new_df

    if changed.count() > 0:
        changed.write.format("delta").mode("append").saveAsTable(sat_table)
    print(f"Satellite {sat_table}: {changed.count()} changed rows inserted")`}</CodeBlock>
          <Quiz topicId="model-datavault" questions={[
            { question: "In Data Vault 2.0, what does a Hub represent and what does it contain?", options: ["A fact table with measures and foreign keys", "The business key for one business concept  -  no descriptive attributes, just the natural key, load_date, and record_source. It is the anchor that Links and Satellites attach to", "A normalized dimension table with all attributes", "A temporary staging table for raw data"], correct: 1 },
            { question: "Why does Data Vault use hash keys instead of sequential surrogate integers?", options: ["Hash keys are smaller than integers", "Hash keys are deterministic  -  the same business key always produces the same hash regardless of which system or pipeline generates it, enabling parallel loads across multiple source systems without coordination", "Hash keys are required by GDPR", "Sequential integers don't work in distributed systems"], correct: 1 },
            { question: "What is the main limitation of querying a raw Data Vault for BI reporting?", options: ["Data Vault doesn't support SQL queries", "Answering a simple question like 'what is a customer's current address' requires multiple JOINs across Hub + Satellite + filtering for the latest row  -  BI tools need a simpler Information Mart (star schema) layer built on top", "Data Vault tables are too large to query", "Raw Vault tables are write-only"], correct: 1 },
          ]} />
          {completeBtn('model-datavault')}
        </section>

        {/* ── model-scd-code ── */}
        <section id="model-scd-code" ref={el => { if (el) sectionRefs.current['model-scd-code'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Data Modeling Mastery</div>
            <h1 className="topic-title">SCD Implementation Code (All Types)</h1>
            <p className="topic-desc">Full implementation of all SCD types using Delta Lake and PySpark. SCD Type 2 is the most common in production  -  mastering the MERGE pattern for slowly changing history is a core senior data engineering skill.</p>
          </div>
          <SCDCodeDiagram />
          <SCDCodeAnimation />
          <CodeBlock lang="text">{`SCD TYPE DECISION TABLE
═══════════════════════════════════════════════════════════════
Type  History?  Storage  Complexity  Best For
────  ────────  ───────  ──────────  ────────────────────────────────────────
0     None      Low      Trivial     Static reference data (country codes, units)
1     None      Low      Low         Fixing errors; current-state-only reporting
2     Full      High     High        Customer address, employee dept, product category
3     Limited   Medium   Medium      Only need one previous value; simple rollback view
4     Full      Medium   Medium      High-churn dimensions; rarely query history
6     Full      High     Very High   Enterprise dims needing current + historical in one row

SCD TYPE 1  -  Overwrite (no history)
  MERGE INTO target WHEN MATCHED AND source differs THEN UPDATE SET all columns
  Simple. Fast. History is lost  -  previous value is gone forever.

SCD TYPE 2  -  Add New Row (full history)
  On change: expire old row (is_current=False, valid_to=now)
             insert new row (is_current=True, valid_from=now, valid_to=9999-12-31)
  Surrogate key on fact table points to correct dimension version at event time.
  Query current:      WHERE is_current = True
  Query point-in-time: WHERE valid_from <= '2024-03-15' AND valid_to > '2024-03-15'

SCD TYPE 3  -  Previous Value Column
  Add column: prev_email, prev_region alongside current_email, current_region
  On change: UPDATE SET prev_col = current_col, current_col = new_value
  Limitation: only 1 level of history per tracked column

SCD TYPE 4  -  History Table
  Main table: current record only (fast lookups)
  History table: all previous versions with valid_from / valid_to
  On change: copy current row to history table, then UPDATE main table

SCD TYPE 6  -  Hybrid (Type 1 + 2 + 3 combined)
  Each historical row has:
    - Surrogate key (Type 2) for point-in-time accuracy
    - is_current flag (Type 2) for current record filtering
    - current_value column (Type 1 overwrite on ALL rows) for current comparison
    - prev_value column (Type 3) for one-step-back lookup
  Advantage: "What was customer's region when they ordered AND what is it today?"
             Both answered from one row without extra JOINs`}</CodeBlock>
          <CodeBlock lang="python">{`# SCD TYPE 1  -  Overwrite, no history
from delta.tables import DeltaTable
from pyspark.sql import functions as F

def scd1_merge(updates_df, target_table: str, key_col: str):
    """Simple overwrite  -  no history preserved"""
    target = DeltaTable.forName(spark, target_table)
    (target.alias("t")
     .merge(updates_df.alias("s"), f"t.{key_col} = s.{key_col}")
     .whenMatchedUpdateAll()       # overwrite all columns on match
     .whenNotMatchedInsertAll()    # insert new records
     .execute())

# SCD TYPE 3  -  Previous value column
def scd3_update(updates_df, target_table: str, key_col: str, tracked_col: str):
    """Keep current and one previous value only"""
    target = DeltaTable.forName(spark, target_table)
    (target.alias("t")
     .merge(updates_df.alias("s"), f"t.{key_col} = s.{key_col}")
     .whenMatchedUpdate(
         condition=f"t.{tracked_col} != s.{tracked_col}",
         set={
             f"prev_{tracked_col}": f"t.{tracked_col}",   # shift current to prev
             f"{tracked_col}": f"s.{tracked_col}",        # overwrite current
             "updated_at": "current_timestamp()"
         })
     .whenNotMatchedInsertAll()
     .execute())

# SCD TYPE 4  -  History table pattern
def scd4_update(updates_df, main_table: str, history_table: str, key_col: str):
    """Archive old version to history table, update main table"""
    # Step 1: copy current records that will change to history
    changed_keys = (updates_df.alias("s")
                    .join(spark.table(main_table).alias("t"), key_col)
                    .filter(" OR ".join([f"t.{c} != s.{c}"
                                         for c in updates_df.columns if c != key_col]))
                    .select("t.*")
                    .withColumn("valid_to", F.current_timestamp()))
    changed_keys.write.format("delta").mode("append").saveAsTable(history_table)

    # Step 2: update main table with new values (Type 1 overwrite)
    target = DeltaTable.forName(spark, main_table)
    (target.alias("t")
     .merge(updates_df.alias("s"), f"t.{key_col} = s.{key_col}")
     .whenMatchedUpdateAll()
     .whenNotMatchedInsertAll()
     .execute())`}</CodeBlock>
          <CodeBlock lang="python">{`# SCD TYPE 2  -  Full Delta Lake MERGE implementation
from delta.tables import DeltaTable
from pyspark.sql import functions as F
from pyspark.sql import DataFrame
from datetime import date

def scd2_merge(
    spark,
    updates_df: DataFrame,
    target_table: str,
    key_col: str,
    tracked_cols: list[str]
) -> None:
    """
    Full SCD Type 2 implementation with Delta Lake.

    Args:
        updates_df:    Latest snapshot from source (one row per natural key)
        target_table:  Delta table name with SCD2 columns
        key_col:       Natural/business key column name (e.g. 'customer_id')
        tracked_cols:  Columns that trigger a new version when changed
    """
    today_str = str(date.today())
    FAR_FUTURE = "9999-12-31"

    # ── STEP 1: Identify changed records ─────────────────────────
    current_target = (spark.table(target_table)
                      .filter(F.col("is_current") == True))

    # Build condition: any tracked column differs between source and target
    change_condition = " OR ".join([f"t.{c} != s.{c}" for c in tracked_cols])

    # Records that CHANGED (exist in target + at least one tracked col differs)
    changed_keys = (current_target.alias("t")
                    .join(updates_df.alias("s"),
                          F.col(f"t.{key_col}") == F.col(f"s.{key_col}"))
                    .filter(change_condition)
                    .select(F.col(f"t.{key_col}").alias(key_col))
                    .distinct())

    # ── STEP 2: Expire old rows for changed records ───────────────
    if changed_keys.count() > 0:
        target = DeltaTable.forName(spark, target_table)
        expire_condition = (
            f"{key_col} IN ({','.join([repr(r[key_col]) for r in changed_keys.collect()])})"
            f" AND is_current = true"
        )
        target.update(
            condition=expire_condition,
            set={
                "is_current": F.lit(False),
                "valid_to": F.lit(today_str).cast("date")
            }
        )

    # ── STEP 3: Insert new versions for changed + new records ─────
    # Records that are NEW (not in target at all)
    new_keys = (updates_df.alias("s")
                .join(current_target.alias("t"),
                      F.col(f"t.{key_col}") == F.col(f"s.{key_col}"),
                      "left_anti")
                .select(F.col(f"s.{key_col}").alias(key_col))
                .distinct())

    all_insert_keys = (changed_keys.union(new_keys).distinct()
                       .select(key_col))

    inserts = (updates_df
               .join(all_insert_keys, key_col, "inner")
               .withColumn("surrogate_key", F.expr("uuid()"))   # generate surrogate
               .withColumn("is_current", F.lit(True))
               .withColumn("valid_from", F.lit(today_str).cast("date"))
               .withColumn("valid_to", F.lit(FAR_FUTURE).cast("date")))

    if inserts.count() > 0:
        inserts.write.format("delta").mode("append").saveAsTable(target_table)
        print(f"SCD2: {changed_keys.count()} expired + {new_keys.count()} new → "
              f"{inserts.count()} rows inserted")

# ── USAGE ─────────────────────────────────────────────────────────
# Initial load (first run)  -  just write with SCD2 columns
def scd2_initial_load(source_df: DataFrame, target_table: str):
    (source_df
     .withColumn("surrogate_key", F.expr("uuid()"))
     .withColumn("is_current", F.lit(True))
     .withColumn("valid_from", F.current_date())
     .withColumn("valid_to", F.lit("9999-12-31").cast("date"))
     .write.format("delta")
     .saveAsTable(target_table))

# ── QUERY PATTERNS ────────────────────────────────────────────────
# Current record
spark.sql("""
    SELECT * FROM gold.dim_customer
    WHERE customer_id = 'CUST-001' AND is_current = TRUE
""")

# Point-in-time: what was the customer's region on 2024-03-15?
spark.sql("""
    SELECT c.customer_id, c.region, c.customer_segment
    FROM gold.dim_customer c
    WHERE c.customer_id = 'CUST-001'
      AND c.valid_from <= DATE '2024-03-15'
      AND c.valid_to   >  DATE '2024-03-15'
""")

# Join fact table to correct dimension version using surrogate key
spark.sql("""
    SELECT
        o.order_id,
        o.order_date,
        c.region            AS customer_region_at_order_time,
        c.customer_segment  AS segment_at_order_time
    FROM gold.fact_orders o
    JOIN gold.dim_customer c
        ON o.customer_surrogate_key = c.surrogate_key
    -- surrogate key on fact row was stamped at load time → always correct version
    LIMIT 100
""")`}</CodeBlock>
          <CodeBlock lang="python">{`# SCD TYPE 6  -  Hybrid (Type 1 + 2 + 3)
# Each historical row gets updated with the CURRENT value (Type 1 overwrite)
# so you can answer both "what was it then?" and "what is it now?" from one row.

def scd6_merge(
    spark,
    updates_df: DataFrame,
    target_table: str,
    key_col: str,
    tracked_col: str   # e.g., 'region'
) -> None:
    """
    SCD Type 6 pattern:
      - surrogate_key + valid_from/valid_to + is_current  (Type 2: full history)
      - current_{col} updated on ALL rows including historical  (Type 1: overwrite)
      - prev_{col} on current row                              (Type 3: one lookback)
    """
    today_str = str(date.today())

    # Step 1: Same as SCD2  -  expire old row, insert new
    scd2_merge(spark, updates_df, target_table, key_col, [tracked_col])

    # Step 2: Type 1 overwrite  -  update current_{col} on ALL rows for this key
    # including historical rows  -  so any row can tell you "what is it today?"
    target = DeltaTable.forName(spark, target_table)
    for row in updates_df.collect():
        bk = row[key_col]
        current_val = row[tracked_col]
        target.update(
            condition=f"{key_col} = '{bk}'",  # update ALL versions, not just current
            set={f"current_{tracked_col}": F.lit(current_val)}
        )

# SCD6 table structure:
# surrogate_key    (Type 2  -  unique per version)
# customer_id      (natural key)
# region           (value AT THIS VERSION's time)
# current_region   (Type 1  -  always the latest region, even on old rows)
# prev_region      (Type 3  -  one step back from is_current row)
# is_current       (Type 2)
# valid_from       (Type 2)
# valid_to         (Type 2)

# QUERY  -  "was the customer in the same region when they ordered vs now?"
spark.sql("""
    SELECT
        o.order_id,
        c.region           AS region_when_ordered,   -- Type 2: historical value
        c.current_region   AS region_today,           -- Type 1: current value
        c.prev_region      AS previous_region,        -- Type 3: one-back
        CASE WHEN c.region = c.current_region
             THEN 'same' ELSE 'moved' END AS customer_moved
    FROM gold.fact_orders o
    JOIN gold.dim_customer c
        ON o.customer_surrogate_key = c.surrogate_key
    WHERE o.order_date = '2023-06-01'
""")`}</CodeBlock>
          <Quiz topicId="model-scd-code" questions={[
            { question: "In SCD Type 2, when a tracked attribute changes, what two operations must happen atomically?", options: ["Delete the old row and insert the new row", "Expire the old row (set is_current=False, valid_to=today) AND insert a new row (is_current=True, valid_from=today, valid_to=9999-12-31)  -  both must succeed or neither should", "Update the existing row and create a backup", "Archive the old row to a history table and truncate the main table"], correct: 1 },
            { question: "How do you query a fact table to get the dimension attribute value AS IT WAS at the time of the event (not the current value)?", options: ["Filter the dimension on is_current=True", "Store the surrogate key on the fact table at load time  -  join fact to dimension on surrogate_key, which always points to the exact dimension version that was current when the fact was loaded", "Use BETWEEN on the fact table's event date", "Always query the latest dimension version  -  history is not needed for facts"], correct: 1 },
            { question: "What unique capability does SCD Type 6 provide that neither Type 2 alone nor Type 3 alone can offer?", options: ["It stores unlimited previous values", "From a single joined row you can see both the dimension value AS IT WAS at the historical event time (Type 2) AND the dimension's current value today (Type 1)  -  enabling change-over-time analysis without extra JOINs", "It eliminates the need for surrogate keys", "It reduces storage by removing duplicate rows"], correct: 1 },
          ]} />
          {completeBtn('model-scd-code')}
        </section>

      </main>
    </div>
  )
}
