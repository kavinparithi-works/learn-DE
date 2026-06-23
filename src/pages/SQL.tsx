import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 3  -  SQL Foundations', items: [
    { id: 'sql-select',   label: 'SELECT Basics' },
    { id: 'sql-distinct', label: 'DISTINCT' },
    { id: 'sql-nulls',    label: 'NULL Handling' },
    { id: 'sql-case',     label: 'CASE WHEN' },
    { id: 'sql-strings',  label: 'String Functions' },
    { id: 'sql-dates',    label: 'Date & Time' },
    { id: 'sql-agg',      label: 'Aggregations' },
    { id: 'sql-groupby',  label: 'GROUP BY' },
  ]},
  { title: 'Level 4  -  SQL Intermediate', items: [
    { id: 'sql-joins',      label: 'JOINs' },
    { id: 'sql-antijoin',   label: 'Anti / Semi JOINs' },
    { id: 'sql-subqueries', label: 'Subqueries' },
    { id: 'sql-setops',     label: 'SET Ops' },
    { id: 'sql-cte',        label: 'CTEs' },
    { id: 'sql-window',     label: 'Window Functions' },
    { id: 'sql-frames',     label: 'Window Frames' },
  ]},
  { title: 'Level 5  -  SQL Mastery', items: [
    { id: 'sql-pivot',         label: 'PIVOT' },
    { id: 'sql-json',          label: 'JSON in SQL' },
    { id: 'sql-dml',           label: 'DML' },
    { id: 'sql-ddl',           label: 'DDL' },
    { id: 'sql-views',         label: 'Views' },
    { id: 'sql-transactions',  label: 'Transactions' },
    { id: 'sql-normalization', label: 'Normalization' },
    { id: 'sql-indexes',       label: 'Indexes' },
    { id: 'sql-execution',     label: 'EXPLAIN Plans' },
    { id: 'sql-patterns',      label: 'SQL Patterns' },
    { id: 'sql-performance',   label: 'Performance' },
  ]},
]

// ─── Animated Venn Diagram ───────────────────────────────────────────────────
const JOIN_TYPES = [
  { label: 'INNER JOIN',       left: false, overlap: true,  right: false, sql: 'SELECT * FROM orders o\nINNER JOIN customers c ON o.customer_id = c.id' },
  { label: 'LEFT JOIN',        left: true,  overlap: true,  right: false, sql: 'SELECT * FROM orders o\nLEFT JOIN customers c ON o.customer_id = c.id' },
  { label: 'RIGHT JOIN',       left: false, overlap: true,  right: true,  sql: 'SELECT * FROM orders o\nRIGHT JOIN customers c ON o.customer_id = c.id' },
  { label: 'FULL OUTER JOIN',  left: true,  overlap: true,  right: true,  sql: 'SELECT * FROM orders o\nFULL OUTER JOIN customers c ON o.customer_id = c.id' },
  { label: 'LEFT ANTI JOIN',   left: true,  overlap: false, right: false, sql: 'SELECT * FROM orders o\nLEFT JOIN customers c ON o.customer_id = c.id\nWHERE c.id IS NULL' },
]

function JoinVennDiagram() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const jt = JOIN_TYPES[idx]

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIdx(i => (i + 1) % JOIN_TYPES.length), 2500)
    return () => clearInterval(t)
  }, [paused])

  return (
    <div className="venn-container" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {JOIN_TYPES.map((j, i) => (
          <button key={j.label} onClick={() => { setIdx(i); setPaused(true) }}
            style={{ padding: '4px 12px', borderRadius: '999px', border: `2px solid ${i === idx ? '#6366f1' : '#e2e8f0'}`,
              background: i === idx ? '#6366f1' : 'white', color: i === idx ? 'white' : '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>
            {j.label}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 300 160" width="300" height="160" style={{ margin: '0 auto', display: 'block' }}>
        <circle cx="110" cy="80" r="60" fill={jt.left ? '#818cf880' : '#e2e8f040'} stroke="#6366f1" strokeWidth="2" />
        <circle cx="190" cy="80" r="60" fill={jt.right ? '#34d39980' : '#e2e8f040'} stroke="#10b981" strokeWidth="2" />
        {jt.overlap && (
          <ellipse cx="150" cy="80" rx="28" ry="48" fill="#f59e0b80" />
        )}
        <text x="85"  y="84" textAnchor="middle" fontSize="11" fill="#4338ca" fontWeight="600">Orders</text>
        <text x="215" y="84" textAnchor="middle" fontSize="11" fill="#059669" fontWeight="600">Customers</text>
      </svg>
      <div style={{ marginTop: '0.75rem', background: '#1e293b', borderRadius: '8px', padding: '12px', textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#e2e8f0', maxWidth: '420px', margin: '0.75rem auto 0' }}>
        {jt.sql}
      </div>
    </div>
  )
}

// ─── Index Animation ─────────────────────────────────────────────────────────
function IndexAnimation() {
  const [mode, setMode] = useState<'full' | 'btree'>('full')
  const rows = ['row 1', 'row 2', 'row 3', 'row 4', 'row 5', 'row 6', 'row 7', 'row 8']
  const highlighted = mode === 'btree' ? [2] : rows.map((_, i) => i)

  return (
    <div className="anim-wrap" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
        {(['full', 'btree'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: mode === m ? '#6366f1' : '#e2e8f0', color: mode === m ? 'white' : '#475569', cursor: 'pointer' }}>
            {m === 'full' ? 'Full Table Scan' : 'B-Tree Index Scan'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ width: '64px', height: '40px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600,
            background: highlighted.includes(i) ? '#6366f1' : '#f1f5f9', color: highlighted.includes(i) ? 'white' : '#94a3b8',
            transition: 'all 0.4s ease', border: `2px solid ${highlighted.includes(i) ? '#4f46e5' : '#e2e8f0'}` }}>
            {r}
          </div>
        ))}
      </div>
      <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
        {mode === 'full' ? 'Full scan: reads every row (O(n))' : 'Index scan: jumps directly to matching row (O(log n))'}
      </p>
    </div>
  )
}

// ─── Normalization Animation ──────────────────────────────────────────────────
function NormalizationAnimation() {
  const [step, setStep] = useState(0)
  const steps = [
    { label: 'Denormalized (0NF)', color: '#ef4444', rows: ['1 | Alice | alice@x.com | Laptop, Mouse | Electronics, Electronics'] },
    { label: '1NF  -  Atomic Values', color: '#f59e0b', rows: ['1 | Alice | alice@x.com | Laptop | Electronics', '1 | Alice | alice@x.com | Mouse | Electronics'] },
    { label: '2NF  -  Remove Partial Dependencies', color: '#3b82f6', rows: ['Orders: 1 | 1 | Laptop', 'Customers: 1 | Alice | alice@x.com'] },
    { label: '3NF  -  Remove Transitive Dependencies', color: '#10b981', rows: ['Customers: 1 | Alice | 1', 'Emails: 1 | alice@x.com', 'Orders: 1 | 1 | Laptop'] },
  ]
  const s = steps[step]
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {steps.map((st, i) => (
          <button key={i} onClick={() => setStep(i)}
            style={{ padding: '4px 12px', borderRadius: '8px', border: `2px solid ${i === step ? st.color : '#e2e8f0'}`, background: i === step ? st.color : 'white', color: i === step ? 'white' : '#64748b', cursor: 'pointer', fontSize: '0.78rem' }}>
            {st.label}
          </button>
        ))}
      </div>
      <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#e2e8f0', textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
        {s.rows.map((r, i) => <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #334155' }}>{r}</div>)}
      </div>
    </div>
  )
}

export default function SQL({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('sql-select')
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
    }, { rootMargin: '-20% 0px -60% 0px' })
    Object.values(sectionRefs.current).forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const totalTopics = SECTIONS.flatMap(s => s.items).length
  const ref = (id: string) => (el: HTMLElement | null) => { if (el) sectionRefs.current[id] = el }

  return (
    <div className="page-with-sidebar">
      <Sidebar sections={SECTIONS} activeId={activeId} completed={completed} totalTopics={totalTopics} onItemClick={scrollTo} />
      <main className="main-content">

        {/* ── SELECT ── */}
        <section id="sql-select" ref={ref('sql-select')} className="topic-section">
          <div className="topic-header">
            <span className="topic-tag">Level 3</span>
            <h2>SELECT, WHERE, ORDER BY, LIMIT</h2>
          </div>
          <p>The SELECT statement is the foundation of all SQL queries. <code>SELECT</code> chooses columns, <code>FROM</code> specifies the table, <code>WHERE</code> filters rows before aggregation, <code>ORDER BY</code> sorts results, and <code>LIMIT</code>/<code>OFFSET</code> paginates. Column aliases with <code>AS</code> rename output columns. The <code>*</code> wildcard selects all columns but should be avoided in production  -  always name columns explicitly for resilience against schema changes.</p>
          <div className="callout callout-info"><span className="callout-icon">💡</span><div className="callout-body">Logical processing order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. SELECT is evaluated late, so you cannot use a SELECT alias in WHERE.</div></div>
          <CodeBlock language="sql" code={`-- Basic SELECT with filtering and sorting
SELECT
    order_id,
    customer_id,
    order_date,
    total_amount,
    status,
    ROUND(total_amount * 0.1, 2)  AS tax
FROM   orders
WHERE  status = 'completed'
  AND  order_date >= '2024-01-01'
  AND  total_amount BETWEEN 100 AND 5000
ORDER BY order_date DESC, total_amount DESC
LIMIT  20 OFFSET 0;   -- page 1

-- Using expressions in SELECT
SELECT
    customer_id,
    UPPER(first_name) || ' ' || UPPER(last_name)  AS full_name,
    DATEDIFF('day', created_at, CURRENT_DATE)      AS days_since_signup,
    CASE WHEN is_premium THEN 'Premium' ELSE 'Free' END AS tier
FROM customers
WHERE is_active = TRUE;

-- Filtering with IN and LIKE
SELECT * FROM pipeline_runs
WHERE  status IN ('failed', 'timeout')
  AND  pipeline_name LIKE 'ingest_%'
ORDER BY started_at DESC;`} />
          <Quiz topicId="sql-select" questions={[
            { question: "In SQL's logical processing order, when is the SELECT clause evaluated?", options: ['First, before FROM', 'After FROM and WHERE, before ORDER BY', 'After ORDER BY', 'At the same time as WHERE'], correct: 1, explanation: 'SELECT is evaluated after FROM, JOIN, WHERE, GROUP BY, and HAVING  -  which is why you cannot reference a SELECT alias in the WHERE clause.' },
            { question: "Which clause filters rows AFTER aggregation?", options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], correct: 1 },
            { question: "What does OFFSET 20 LIMIT 10 return?", options: ['First 10 rows', 'Rows 1-20', 'Rows 21-30', 'Last 10 rows'], correct: 2 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-select'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── DISTINCT ── */}
        <section id="sql-distinct" ref={ref('sql-distinct')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>DISTINCT and Deduplication</h2></div>
          <p>DISTINCT eliminates duplicate rows from query results. It operates on the full selected row, not just one column. For large tables, DISTINCT is expensive  -  it requires a sort or hash operation across all selected columns. In data engineering, deduplication is often better handled with window functions (ROW_NUMBER) or QUALIFY (Spark SQL / Snowflake), which give you control over which duplicate to keep.</p>
          <CodeBlock language="sql" code={`-- Basic DISTINCT
SELECT DISTINCT customer_id FROM orders;

-- DISTINCT on multiple columns (combination must be unique)
SELECT DISTINCT customer_id, product_category FROM orders;

-- COUNT DISTINCT: how many unique customers?
SELECT COUNT(DISTINCT customer_id) AS unique_customers FROM orders;

-- Better dedup: keep the latest row per customer using ROW_NUMBER
WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn
  FROM customers_raw
)
SELECT * FROM ranked WHERE rn = 1;

-- Dedup in Spark SQL with QUALIFY (Snowflake / Spark 3.3+)
SELECT * FROM customers_raw
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1;`} />
          <Quiz topicId="sql-distinct" questions={[
            { question: "SELECT DISTINCT a, b returns rows where:", options: ['Column a is unique', 'Column b is unique', 'The combination of (a, b) is unique', 'Either a or b is unique'], correct: 2 },
            { question: "Why is ROW_NUMBER() preferred over DISTINCT for deduplication?", options: ['It is faster', 'It lets you choose which duplicate to keep based on ordering', 'It works without GROUP BY', 'DISTINCT does not work on large tables'], correct: 1 },
            { question: "COUNT(DISTINCT col) vs COUNT(col)  -  what is the difference?", options: ['No difference', 'COUNT(DISTINCT col) counts only non-NULL unique values', 'COUNT(col) also counts NULLs', 'DISTINCT applies before WHERE'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-distinct'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── NULLS ── */}
        <section id="sql-nulls" ref={ref('sql-nulls')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>NULL Handling</h2></div>
          <p>NULL represents the absence of a value  -  it is not zero, not an empty string, and not false. NULL comparisons always return UNKNOWN, not TRUE or FALSE. This means <code>col = NULL</code> never matches anything; you must use <code>IS NULL</code> or <code>IS NOT NULL</code>. Aggregate functions ignore NULLs except COUNT(*). Understanding NULL propagation is critical for correct results in joins, aggregations, and CASE expressions.</p>
          <CodeBlock language="sql" code={`-- NULL comparisons
SELECT * FROM orders WHERE discount IS NULL;       -- correct
SELECT * FROM orders WHERE discount = NULL;        -- always empty!

-- COALESCE: return first non-NULL value
SELECT
    order_id,
    COALESCE(discount, 0)         AS discount,
    COALESCE(notes, 'No notes')   AS notes
FROM orders;

-- NULLIF: return NULL if two values are equal (avoid division by zero)
SELECT
    revenue / NULLIF(orders_count, 0) AS avg_order_value
FROM daily_metrics;

-- NULL in aggregations: COUNT(*) vs COUNT(col)
SELECT
    COUNT(*)             AS total_rows,         -- includes NULLs
    COUNT(discount)      AS rows_with_discount, -- ignores NULLs
    AVG(discount)        AS avg_discount,        -- ignores NULLs
    SUM(COALESCE(discount, 0)) AS total_discount -- treat NULL as 0
FROM orders;

-- NULL in JOIN: rows with NULL keys never match
SELECT o.order_id, c.name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id   -- NULL customer_id rows appear with NULL name

-- NVL (Oracle/Spark), IFNULL (MySQL), ISNULL (SQL Server) equivalents
SELECT IFNULL(discount, 0) FROM orders;          -- MySQL
SELECT NVL(discount, 0)    FROM orders;          -- Oracle / Spark SQL`} />
          <Quiz topicId="sql-nulls" questions={[
            { question: "What does WHERE col = NULL return?", options: ['Rows where col is NULL', 'An error', 'No rows (always empty result)', 'All rows'], correct: 2, explanation: 'NULL comparisons return UNKNOWN. Use IS NULL instead.' },
            { question: "COALESCE(NULL, NULL, 5, 3) returns:", options: ['NULL', '5', '3', '0'], correct: 1 },
            { question: "Which aggregate function does NOT ignore NULLs by default?", options: ['SUM(col)', 'AVG(col)', 'COUNT(*)', 'MAX(col)'], correct: 2, explanation: 'COUNT(*) counts all rows including those with NULLs. COUNT(col) ignores NULLs.' },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-nulls'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── CASE ── */}
        <section id="sql-case" ref={ref('sql-case')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>CASE WHEN Expressions</h2></div>
          <p>CASE WHEN is SQL's conditional expression. It comes in two forms: searched CASE (evaluates boolean conditions) and simple CASE (compares a value against options). CASE is used in SELECT for derived columns, in ORDER BY for custom sort orders, in GROUP BY for custom bucketing, and inside aggregate functions for conditional aggregation (a pivot-like pattern without PIVOT syntax).</p>
          <CodeBlock language="sql" code={`-- Searched CASE WHEN
SELECT
    order_id,
    total_amount,
    CASE
        WHEN total_amount < 50   THEN 'Small'
        WHEN total_amount < 200  THEN 'Medium'
        WHEN total_amount < 1000 THEN 'Large'
        ELSE 'Enterprise'
    END AS order_size
FROM orders;

-- Simple CASE (value comparison)
SELECT
    status,
    CASE status
        WHEN 'completed' THEN 'green'
        WHEN 'failed'    THEN 'red'
        WHEN 'pending'   THEN 'yellow'
        ELSE 'grey'
    END AS color_code
FROM pipeline_runs;

-- CASE inside aggregation (conditional aggregation)
SELECT
    product_category,
    COUNT(*) AS total_orders,
    SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) AS completed_revenue,
    SUM(CASE WHEN status = 'refunded'  THEN total_amount ELSE 0 END) AS refunded_revenue,
    AVG(CASE WHEN channel = 'mobile'   THEN total_amount END)        AS avg_mobile_order
FROM orders
GROUP BY product_category;

-- CASE in ORDER BY for custom sort
SELECT * FROM tasks
ORDER BY
    CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high'     THEN 2
        WHEN 'medium'   THEN 3
        ELSE 4
    END;`} />
          <Quiz topicId="sql-case" questions={[
            { question: "In a CASE WHEN expression, what happens if no WHEN condition matches and there is no ELSE?", options: ['An error is raised', 'The row is excluded', 'NULL is returned', '0 is returned'], correct: 2 },
            { question: "SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) is an example of:", options: ['A subquery', 'Conditional aggregation', 'A window function', 'A pivot'], correct: 1 },
            { question: "Which CASE form is more flexible for complex conditions?", options: ['Simple CASE (CASE col WHEN val THEN...)', 'Searched CASE (CASE WHEN condition THEN...)', 'Both are equally flexible', 'Neither; use IF()'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-case'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── STRINGS ── */}
        <section id="sql-strings" ref={ref('sql-strings')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>String Functions</h2></div>
          <p>String manipulation is essential for data cleaning, standardization, and parsing. Different databases use slightly different function names but the logic is the same. In data engineering you frequently clean source data: trim whitespace, standardize case, extract substrings, replace characters, and parse structured strings like emails, URLs, or delimited fields.</p>
          <CodeBlock language="sql" code={`-- Case manipulation
SELECT UPPER('hello'), LOWER('WORLD'), INITCAP('john doe');
-- hello -> HELLO, WORLD -> world, john doe -> John Doe

-- Length and trimming
SELECT
    LENGTH('  hello  '),       -- 9 (with spaces)
    TRIM('  hello  '),         -- 'hello'
    LTRIM('  hello  '),        -- 'hello  '
    RTRIM('  hello  '),        -- '  hello'
    LENGTH(TRIM(email))        -- cleaned length
FROM customers;

-- Substring extraction
SELECT
    SUBSTRING(phone, 1, 3)            AS area_code,    -- first 3 chars
    SUBSTR(email, POSITION('@' IN email) + 1) AS domain,  -- after @
    LEFT(order_id, 4)                  AS prefix,
    RIGHT(order_id, 6)                 AS suffix
FROM orders;

-- Concatenation
SELECT
    first_name || ' ' || last_name     AS full_name,    -- standard SQL
    CONCAT(first_name, ' ', last_name) AS full_name2,   -- MySQL/Spark
    CONCAT_WS(', ', city, state, zip)  AS address       -- with separator
FROM customers;

-- Replace and translate
SELECT
    REPLACE(phone, '-', '')            AS clean_phone,
    REGEXP_REPLACE(text, '[^a-zA-Z0-9 ]', '') AS alphanum_only
FROM raw_data;

-- Split and parse delimited strings
SELECT
    SPLIT_PART('2024-01-15', '-', 1)   AS year,   -- '2024' (PostgreSQL)
    SPLIT_PART('2024-01-15', '-', 2)   AS month,  -- '01'
    SPLIT('2024-01-15', '-')[0]        AS year2   -- Spark SQL (0-indexed)
FROM (SELECT '2024-01-15' AS d) t;

-- Pattern matching
SELECT * FROM products WHERE name LIKE 'iphone%';        -- starts with
SELECT * FROM events  WHERE url LIKE '%/checkout%';      -- contains
SELECT * FROM logs    WHERE message RLIKE '^ERROR.*timeout'; -- regex

-- Position / index of substring
SELECT POSITION('.' IN email) AS dot_pos FROM customers;
SELECT CHARINDEX('.', email)   AS dot_pos FROM customers; -- SQL Server`} />
          <Quiz topicId="sql-strings" questions={[
            { question: "SPLIT_PART('a,b,c', ',', 2) returns:", options: ["'a'", "'b'", "'c'", "',b,'"], correct: 1 },
            { question: "Which function removes whitespace from both ends of a string?", options: ['CLEAN()', 'STRIP()', 'TRIM()', 'REMOVE()'], correct: 2 },
            { question: "LIKE 'abc%' will use an index but LIKE '%abc' will not. Why?", options: ['% at start prevents index range scan', 'LIKE never uses indexes', 'Only REGEXP uses indexes', 'Trailing % is not supported'], correct: 0 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-strings'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── DATES ── */}
        <section id="sql-dates" ref={ref('sql-dates')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>Date / Time Functions</h2></div>
          <p>Date and time handling is a core data engineering skill  -  event timestamps, partitioning by date, time-series aggregations, and SLA calculations all require mastery of date functions. Key concepts: always store timestamps in UTC, convert to local time at query time; understand the difference between DATE, TIMESTAMP, and TIMESTAMP WITH TIME ZONE; use DATE_TRUNC for period bucketing rather than extracting year/month/day separately.</p>
          <CodeBlock language="sql" code={`-- Current date and time
SELECT CURRENT_DATE, CURRENT_TIMESTAMP, NOW();

-- Date arithmetic
SELECT
    order_date + INTERVAL '7 days'     AS due_date,
    order_date - INTERVAL '1 month'    AS prev_month_same_day,
    DATEDIFF('day', order_date, CURRENT_DATE) AS days_ago  -- Spark/Snowflake
    -- DATE_DIFF(CURRENT_DATE, order_date, DAY)             -- BigQuery
FROM orders;

-- Truncate to period (great for GROUP BY time buckets)
SELECT
    DATE_TRUNC('month', event_time)    AS month,
    DATE_TRUNC('week',  event_time)    AS week,
    DATE_TRUNC('hour',  event_time)    AS hour,
    COUNT(*)                            AS events
FROM events
GROUP BY 1 ORDER BY 1;

-- Extract parts
SELECT
    EXTRACT(YEAR  FROM order_date)     AS yr,
    EXTRACT(MONTH FROM order_date)     AS mo,
    EXTRACT(DOW   FROM order_date)     AS day_of_week,  -- 0=Sun in PG
    EXTRACT(EPOCH FROM event_time)     AS unix_ts
FROM orders;

-- Format and parse
SELECT
    TO_CHAR(order_date, 'YYYY-MM-DD')    AS formatted,   -- PostgreSQL
    DATE_FORMAT(order_date, '%Y-%m-%d')  AS formatted,   -- MySQL
    DATE_FORMAT(order_date, 'yyyy-MM-dd') AS formatted,  -- Spark SQL
    TO_DATE('2024-01-15', 'yyyy-MM-dd')  AS parsed       -- Spark SQL
FROM orders;

-- Timezone handling
SELECT
    event_time AT TIME ZONE 'UTC' AT TIME ZONE 'US/Eastern' AS local_time,
    CONVERT_TIMEZONE('UTC', 'US/Eastern', event_time)       AS local_time  -- Snowflake
FROM events;

-- Business day calculations (Spark SQL + Python fallback)
-- Days between two dates excluding weekends (use a calendar dim table)
SELECT COUNT(*) AS business_days
FROM calendar_dim
WHERE cal_date BETWEEN start_date AND end_date
  AND is_business_day = TRUE;`} />
          <Quiz topicId="sql-dates" questions={[
            { question: "Which function is best for grouping events into monthly buckets?", options: ['EXTRACT(MONTH FROM ts)', 'DATE_TRUNC(\'month\', ts)', 'MONTH(ts)', 'TO_CHAR(ts, \'MM\')'], correct: 1, explanation: 'DATE_TRUNC returns the start of the period (e.g., 2024-01-01), which is better for GROUP BY than EXTRACT which loses year context.' },
            { question: "Why is YEAR(created_at) = 2024 a performance anti-pattern?", options: ['YEAR() is deprecated', 'It prevents the query optimizer from using an index on created_at', 'It returns incorrect results', 'YEAR() is not standard SQL'], correct: 1 },
            { question: "DATEDIFF('day', '2024-01-01', '2024-01-15') returns:", options: ['14', '15', '-14', '1'], correct: 0 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-dates'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── AGGREGATIONS ── */}
        <section id="sql-agg" ref={ref('sql-agg')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>Aggregations</h2></div>
          <p>Aggregate functions collapse multiple rows into a single value. The standard functions (COUNT, SUM, AVG, MIN, MAX) are available everywhere. Statistical functions (STDDEV, VARIANCE, PERCENTILE_CONT, PERCENTILE_DISC) vary by database. All aggregates except COUNT(*) ignore NULLs. Understanding the difference between PERCENTILE_CONT (interpolated) and PERCENTILE_DISC (actual data point) matters for SLA analysis.</p>
          <CodeBlock language="sql" code={`-- Standard aggregations
SELECT
    COUNT(*)                               AS total_orders,
    COUNT(DISTINCT customer_id)            AS unique_customers,
    SUM(total_amount)                      AS gross_revenue,
    AVG(total_amount)                      AS avg_order_value,
    MIN(order_date)                        AS first_order,
    MAX(order_date)                        AS last_order,
    SUM(total_amount) / COUNT(DISTINCT customer_id) AS revenue_per_customer
FROM orders
WHERE status = 'completed';

-- Statistical aggregates
SELECT
    STDDEV(response_time_ms)               AS stddev_latency,
    VARIANCE(response_time_ms)             AS variance_latency,
    PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY response_time_ms) AS p50,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) AS p95,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) AS p99,
    PERCENTILE_DISC(0.5)  WITHIN GROUP (ORDER BY response_time_ms) AS median_actual
FROM api_logs;

-- Collecting values into arrays / strings
SELECT
    customer_id,
    ARRAY_AGG(product_id ORDER BY order_date) AS product_sequence,  -- PostgreSQL
    STRING_AGG(product_name, ', ')             AS products_list,     -- PostgreSQL
    COLLECT_LIST(product_id)                   AS product_sequence   -- Spark SQL
FROM order_items
GROUP BY customer_id;

-- Filter within aggregation (SQL:2003 FILTER clause)
SELECT
    COUNT(*) FILTER (WHERE status = 'completed')  AS completed,
    COUNT(*) FILTER (WHERE status = 'failed')     AS failed,
    AVG(duration_ms) FILTER (WHERE status = 'completed') AS avg_success_duration
FROM pipeline_runs;`} />
          <Quiz topicId="sql-agg" questions={[
            { question: "PERCENTILE_CONT(0.5) vs PERCENTILE_DISC(0.5)  -  what is the key difference?", options: ['CONT is faster', 'CONT returns an interpolated value; DISC returns an actual data point', 'DISC works on strings; CONT on numbers', 'They are identical'], correct: 1 },
            { question: "AVG(col) where col has NULLs  -  what happens?", options: ['Returns NULL', 'Treats NULL as 0', 'Calculates average ignoring NULLs', 'Raises an error'], correct: 2 },
            { question: "COUNT(*) vs COUNT(col)  -  when do they give different results?", options: ['Never  -  they are identical', 'When col contains NULL values', 'When col has duplicates', 'Only on large tables'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-agg'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── GROUP BY ── */}
        <section id="sql-groupby" ref={ref('sql-groupby')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 3</span><h2>GROUP BY, HAVING, ROLLUP, CUBE, GROUPING SETS</h2></div>
          <p>GROUP BY collapses rows sharing the same key into a single group for aggregation. HAVING filters groups after aggregation (WHERE filters rows before). Advanced grouping  -  ROLLUP, CUBE, GROUPING SETS  -  produce subtotals and grand totals in a single query, replacing multiple UNION ALLs. ROLLUP generates a hierarchy of subtotals; CUBE generates all possible combinations; GROUPING SETS gives you explicit control.</p>
          <CodeBlock language="sql" code={`-- GROUP BY with HAVING
SELECT
    customer_id,
    COUNT(*)        AS order_count,
    SUM(amount)     AS total_spent
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY customer_id
HAVING COUNT(*) >= 3           -- only customers with 3+ orders
   AND SUM(amount) > 500
ORDER BY total_spent DESC;

-- ROLLUP: hierarchy subtotals (year > month > day)
SELECT
    EXTRACT(YEAR  FROM order_date) AS yr,
    EXTRACT(MONTH FROM order_date) AS mo,
    SUM(amount)                    AS revenue
FROM orders
GROUP BY ROLLUP (
    EXTRACT(YEAR FROM order_date),
    EXTRACT(MONTH FROM order_date)
);
-- Produces: (yr, mo), (yr, NULL=subtotal), (NULL, NULL=grand total)

-- CUBE: all combinations
SELECT region, product_category, SUM(revenue) AS total
FROM sales
GROUP BY CUBE (region, product_category);
-- Produces: (region, cat), (region, NULL), (NULL, cat), (NULL, NULL)

-- GROUPING SETS: explicit control
SELECT region, product_category, channel, SUM(revenue)
FROM sales
GROUP BY GROUPING SETS (
    (region, product_category),
    (region, channel),
    (region),
    ()                          -- grand total
);

-- GROUPING() function to distinguish NULL subtotal from NULL data
SELECT
    GROUPING(region) AS is_region_subtotal,
    region,
    SUM(revenue)
FROM sales
GROUP BY ROLLUP (region);`} />
          <Quiz topicId="sql-groupby" questions={[
            { question: "GROUP BY ROLLUP(a, b, c) produces how many grouping levels?", options: ['3', '4', '7', '8'], correct: 1, explanation: 'ROLLUP(a,b,c) produces (a,b,c), (a,b), (a), ()  -  4 levels.' },
            { question: "Can you use a WHERE clause to filter aggregated results?", options: ['Yes', 'No, use HAVING instead', 'Yes, if you use a subquery', 'Only with GROUP BY'], correct: 1 },
            { question: "What does GROUPING(col) return in a ROLLUP query?", options: ['The group value', '1 if the column is in a subtotal row, 0 otherwise', 'The count of rows in the group', 'NULL'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-groupby'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── JOINS ── */}
        <section id="sql-joins" ref={ref('sql-joins')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>JOINs (Animated Venn Diagrams)</h2></div>
          <p>JOINs combine rows from two or more tables based on a related column. The join type determines how non-matching rows are handled. INNER JOIN returns only matched rows. LEFT JOIN returns all rows from the left table plus matches. RIGHT JOIN is LEFT JOIN with tables swapped. FULL OUTER JOIN returns all rows from both tables. CROSS JOIN produces a Cartesian product. SELF JOIN joins a table to itself for hierarchical or comparison queries.</p>
          <JoinVennDiagram />
          <CodeBlock language="sql" code={`-- INNER JOIN: only matching rows
SELECT o.order_id, c.name, o.total_amount
FROM   orders o
INNER JOIN customers c ON o.customer_id = c.id;

-- LEFT JOIN: all orders even those with no customer record
SELECT o.order_id, c.name, o.total_amount
FROM   orders o
LEFT  JOIN customers c ON o.customer_id = c.id;

-- FULL OUTER JOIN: all rows from both tables
SELECT COALESCE(o.order_id, 'NO ORDER')  AS order_id,
       COALESCE(c.name,     'NO CUSTOMER') AS customer_name
FROM   orders o
FULL OUTER JOIN customers c ON o.customer_id = c.id;

-- CROSS JOIN: every combination (Cartesian)
SELECT d.date_val, p.product_id
FROM   date_spine d
CROSS  JOIN products p;   -- useful for filling gaps in time-series

-- SELF JOIN: find orders in same month for same customer
SELECT a.order_id, b.order_id AS other_order
FROM   orders a
JOIN   orders b
  ON   a.customer_id = b.customer_id
  AND  DATE_TRUNC('month', a.order_date) = DATE_TRUNC('month', b.order_date)
  AND  a.order_id < b.order_id;   -- avoid duplicates

-- LATERAL JOIN (correlated subquery as join)
SELECT c.customer_id, latest.order_id, latest.order_date
FROM   customers c
CROSS  JOIN LATERAL (
    SELECT order_id, order_date
    FROM   orders
    WHERE  customer_id = c.customer_id
    ORDER  BY order_date DESC
    LIMIT  1
) latest;   -- supported in PostgreSQL, BigQuery

-- Multi-table join
SELECT o.order_id, c.name, p.product_name, oi.quantity
FROM   orders o
JOIN   customers   c  ON o.customer_id = c.id
JOIN   order_items oi ON o.order_id    = oi.order_id
JOIN   products    p  ON oi.product_id = p.id
WHERE  o.status = 'completed';`} />
          <Quiz topicId="sql-joins" questions={[
            { question: "A LEFT JOIN returns NULL values for right-table columns when:", options: ['The left table has NULLs', 'No matching row exists in the right table', 'The join column is not indexed', 'Both tables have NULLs'], correct: 1 },
            { question: "CROSS JOIN between a 100-row and 50-row table produces:", options: ['100 rows', '50 rows', '150 rows', '5000 rows'], correct: 3 },
            { question: "What is a LATERAL JOIN used for?", options: ['Joining to the same table', 'A correlated subquery that references outer query columns in FROM', 'Parallel joins for performance', 'Joining three tables'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-joins'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── ANTI-JOINS ── */}
        <section id="sql-antijoin" ref={ref('sql-antijoin')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>Anti-joins and Semi-joins</h2></div>
          <p>A semi-join returns rows from the left table where a match EXISTS in the right table (but does not include right-table columns). An anti-join returns rows from the left table where NO match exists in the right table. These patterns are common in data engineering: finding unprocessed records, detecting orphaned data, and incremental load logic.</p>
          <CodeBlock language="sql" code={`-- SEMI-JOIN: orders that have at least one item (3 equivalent forms)

-- Form 1: EXISTS (most readable, good optimizer support)
SELECT o.* FROM orders o
WHERE EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.order_id
);

-- Form 2: IN (simple but can be slow with NULLs in subquery)
SELECT * FROM orders WHERE order_id IN (SELECT order_id FROM order_items);

-- Form 3: INNER JOIN + DISTINCT
SELECT DISTINCT o.* FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id;

-- ANTI-JOIN: customers who have never placed an order (3 forms)

-- Form 1: NOT EXISTS (recommended  -  handles NULLs correctly)
SELECT c.* FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);

-- Form 2: LEFT JOIN + IS NULL
SELECT c.* FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.order_id IS NULL;

-- Form 3: NOT IN (DANGER: if subquery returns any NULL, result is empty!)
SELECT * FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL);
-- Must add IS NOT NULL guard when using NOT IN

-- Practical: find pipeline_runs with no corresponding data quality check
SELECT r.run_id, r.pipeline_name, r.started_at
FROM pipeline_runs r
WHERE NOT EXISTS (
    SELECT 1 FROM dq_checks dq WHERE dq.run_id = r.run_id
)
AND r.status = 'completed';`} />
          <Quiz topicId="sql-antijoin" questions={[
            { question: "Why is NOT IN dangerous when the subquery can return NULLs?", options: ['It is slow', 'If any subquery value is NULL, the entire NOT IN returns no rows', 'It causes a syntax error', 'NOT IN does not support subqueries'], correct: 1 },
            { question: "Which anti-join pattern is generally recommended for correctness and performance?", options: ['NOT IN', 'LEFT JOIN WHERE right IS NULL', 'NOT EXISTS', 'EXCEPT'], correct: 2 },
            { question: "A semi-join returns columns from:", options: ['Both tables', 'Only the right table', 'Only the left table', 'A derived table'], correct: 2 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-antijoin'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── SUBQUERIES ── */}
        <section id="sql-subqueries" ref={ref('sql-subqueries')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>Subqueries (scalar, correlated, EXISTS)</h2></div>
          <p>A subquery is a SELECT nested inside another query. Scalar subqueries return exactly one value. Inline views (derived tables) in FROM return a set of rows. Correlated subqueries reference the outer query and re-execute for each outer row  -  they can be slow but are sometimes necessary. Understanding when to use a subquery vs a JOIN vs a CTE is key to writing maintainable, performant SQL.</p>
          <CodeBlock language="sql" code={`-- Scalar subquery in SELECT
SELECT
    order_id,
    total_amount,
    (SELECT AVG(total_amount) FROM orders) AS overall_avg,
    total_amount - (SELECT AVG(total_amount) FROM orders) AS diff_from_avg
FROM orders;

-- Scalar subquery in WHERE
SELECT * FROM orders
WHERE total_amount > (SELECT AVG(total_amount) FROM orders WHERE status = 'completed');

-- Derived table (inline view) in FROM
SELECT dept, avg_salary
FROM (
    SELECT department AS dept, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
) dept_stats
WHERE avg_salary > 80000;

-- Correlated subquery (executes once per outer row  -  potentially slow)
SELECT c.customer_id, c.name,
    (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count,
    (SELECT MAX(order_date) FROM orders o WHERE o.customer_id = c.id) AS last_order
FROM customers c;
-- Better alternative: use LEFT JOIN + GROUP BY

-- EXISTS (stops scanning as soon as first match found)
SELECT * FROM products p
WHERE EXISTS (
    SELECT 1 FROM order_items oi
    WHERE oi.product_id = p.id
      AND oi.order_date >= CURRENT_DATE - INTERVAL '30 days'
);

-- Subquery in FROM for ranking
SELECT customer_id, revenue, revenue_rank
FROM (
    SELECT
        customer_id,
        SUM(amount) AS revenue,
        RANK() OVER (ORDER BY SUM(amount) DESC) AS revenue_rank
    FROM orders
    GROUP BY customer_id
) ranked
WHERE revenue_rank <= 10;`} />
          <Quiz topicId="sql-subqueries" questions={[
            { question: "What makes a subquery 'correlated'?", options: ['It uses a JOIN', 'It references columns from the outer query', 'It is in the FROM clause', 'It returns multiple rows'], correct: 1 },
            { question: "Why is EXISTS often faster than IN for large subqueries?", options: ['EXISTS uses indexes; IN does not', 'EXISTS short-circuits after finding the first match', 'IN requires sorting', 'EXISTS is evaluated once for the whole query'], correct: 1 },
            { question: "A scalar subquery that returns more than one row will:", options: ['Return the first row', 'Raise a runtime error', 'Return NULL', 'Sum the values'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-subqueries'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── SET OPS ── */}
        <section id="sql-setops" ref={ref('sql-setops')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>SET Operations (UNION, INTERSECT, EXCEPT)</h2></div>
          <p>SET operations combine results of two queries with compatible column lists. UNION removes duplicates (expensive); UNION ALL keeps all rows (fast  -  no dedup). INTERSECT returns rows in both queries. EXCEPT (MINUS in Oracle) returns rows in the first query that are not in the second. In data engineering, UNION ALL is heavily used for combining daily partitions, EXCEPT is great for finding data discrepancies between systems.</p>
          <CodeBlock language="sql" code={`-- UNION ALL (keeps duplicates, faster  -  preferred in data engineering)
SELECT customer_id, 'web'    AS channel, amount FROM web_orders
UNION ALL
SELECT customer_id, 'mobile' AS channel, amount FROM mobile_orders
UNION ALL
SELECT customer_id, 'store'  AS channel, amount FROM store_orders;

-- UNION (removes duplicates  -  sorts/hashes all rows)
SELECT email FROM newsletter_subscribers
UNION
SELECT email FROM customers;   -- unique emails across both

-- INTERSECT: emails in BOTH lists
SELECT email FROM newsletter_subscribers
INTERSECT
SELECT email FROM customers;

-- EXCEPT: subscribers who are NOT customers
SELECT email FROM newsletter_subscribers
EXCEPT
SELECT email FROM customers;

-- Data reconciliation: find rows in source not in target
SELECT id, hash_value FROM source_system
EXCEPT
SELECT id, hash_value FROM target_system;

-- Rules: column count and types must match
-- ORDER BY only at the very end of the final query
SELECT order_id, amount FROM orders_2023
UNION ALL
SELECT order_id, amount FROM orders_2024
ORDER BY order_id;   -- applies to combined result`} />
          <Quiz topicId="sql-setops" questions={[
            { question: "UNION vs UNION ALL  -  which is faster and why?", options: ['UNION, because it deduplicates', 'UNION ALL, because it skips the deduplication step', 'They have identical performance', 'UNION ALL is slower due to extra rows'], correct: 1 },
            { question: "What must be true for two queries to be combined with UNION?", options: ['Same table', 'Same number of columns with compatible data types', 'Same WHERE clause', 'Same ORDER BY'], correct: 1 },
            { question: "EXCEPT returns:", options: ['Rows in both queries', 'Rows in the first query not in the second', 'Rows in the second query not in the first', 'All rows from both queries'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-setops'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── CTEs ── */}
        <section id="sql-cte" ref={ref('sql-cte')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>CTEs and Recursive CTEs</h2></div>
          <p>A Common Table Expression (CTE) is a named temporary result set defined with WITH. CTEs make complex queries readable by breaking them into named steps. They can be referenced multiple times in the same query. Recursive CTEs use WITH RECURSIVE to traverse hierarchical data (org charts, folder trees, bill of materials). In most databases CTEs are not materialized by default  -  they are inlined like subqueries, though some support MATERIALIZED hints.</p>
          <CodeBlock language="sql" code={`-- Basic CTE: clean up a complex subquery chain
WITH
completed_orders AS (
    SELECT customer_id, SUM(amount) AS total, COUNT(*) AS cnt
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
),
customer_segments AS (
    SELECT
        customer_id,
        total,
        CASE
            WHEN total >= 10000 THEN 'VIP'
            WHEN total >= 1000  THEN 'Regular'
            ELSE 'New'
        END AS segment
    FROM completed_orders
)
SELECT segment, COUNT(*) AS customers, AVG(total) AS avg_spend
FROM customer_segments
GROUP BY segment;

-- Multiple CTEs (comma-separated)
WITH
raw AS (SELECT * FROM events WHERE event_date = CURRENT_DATE),
deduped AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY ingested_at DESC) AS rn
    FROM raw
),
clean AS (SELECT * FROM deduped WHERE rn = 1)
SELECT COUNT(*) FROM clean;

-- RECURSIVE CTE: traverse org hierarchy
WITH RECURSIVE org_tree AS (
    -- Base case: top-level managers
    SELECT employee_id, name, manager_id, 0 AS depth, name AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive case: direct reports
    SELECT e.employee_id, e.name, e.manager_id,
           ot.depth + 1,
           ot.path || ' > ' || e.name
    FROM employees e
    JOIN org_tree ot ON e.manager_id = ot.employee_id
)
SELECT * FROM org_tree ORDER BY path;

-- Recursive CTE: generate a date spine
WITH RECURSIVE date_spine AS (
    SELECT DATE '2024-01-01' AS d
    UNION ALL
    SELECT d + INTERVAL '1 day'
    FROM date_spine
    WHERE d < DATE '2024-12-31'
)
SELECT d FROM date_spine;`} />
          <Quiz topicId="sql-cte" questions={[
            { question: "What is the key difference between a CTE and a subquery in terms of readability?", options: ['CTEs are always faster', 'CTEs are named and reusable within the query, making complex logic readable', 'Subqueries cannot be used in FROM', 'CTEs are always materialized'], correct: 1 },
            { question: "What are the two parts of a recursive CTE?", options: ['SELECT and FROM', 'Base case (anchor) and recursive case', 'WITH and WHERE', 'UNION and INTERSECT'], correct: 1 },
            { question: "Can a CTE be referenced multiple times in the same query?", options: ['No  -  it executes once only', 'Yes  -  and each reference may re-execute the CTE unless materialized', 'Yes  -  and it is always cached', 'Only if declared PERSISTENT'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-cte'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── WINDOW FUNCTIONS ── */}
        <section id="sql-window" ref={ref('sql-window')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>Window Functions</h2></div>
          <p>Window functions perform calculations across a set of rows related to the current row without collapsing them into one (unlike GROUP BY). The OVER() clause defines the window: PARTITION BY groups rows, ORDER BY determines order within the partition. Window functions are evaluated after WHERE, GROUP BY, and HAVING  -  so you can window-aggregate over filtered/grouped results.</p>
          <CodeBlock language="sql" code={`-- Ranking functions
SELECT
    customer_id,
    order_date,
    amount,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date)   AS order_seq,
    RANK()        OVER (ORDER BY amount DESC)                           AS amount_rank,
    DENSE_RANK()  OVER (ORDER BY amount DESC)                           AS dense_rank,
    NTILE(4)      OVER (ORDER BY amount DESC)                           AS quartile,
    PERCENT_RANK() OVER (ORDER BY amount)                               AS pct_rank
FROM orders;

-- ROW_NUMBER vs RANK vs DENSE_RANK for values 100, 90, 90, 80:
-- ROW_NUMBER:  1, 2, 3, 4  (always unique)
-- RANK:        1, 2, 2, 4  (gaps after ties)
-- DENSE_RANK:  1, 2, 2, 3  (no gaps)

-- Lag and Lead: access adjacent rows
SELECT
    customer_id,
    order_date,
    amount,
    LAG(amount)  OVER (PARTITION BY customer_id ORDER BY order_date)     AS prev_order_amt,
    LEAD(amount) OVER (PARTITION BY customer_id ORDER BY order_date)     AS next_order_amt,
    LAG(order_date, 1, '2000-01-01') OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_order_date,
    amount - LAG(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS change_from_prev
FROM orders;

-- First/Last value
SELECT
    order_id, customer_id, amount,
    FIRST_VALUE(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS first_order_amt,
    LAST_VALUE(amount)  OVER (
        PARTITION BY customer_id ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS last_order_amt   -- note: need full frame for LAST_VALUE
FROM orders;

-- Running total and running average
SELECT
    order_date,
    amount,
    SUM(amount)  OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_total,
    AVG(amount)  OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_avg,
    COUNT(*)     OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_count
FROM orders;

-- Top N per group (most common window pattern)
SELECT * FROM (
    SELECT
        product_category,
        product_id,
        revenue,
        ROW_NUMBER() OVER (PARTITION BY product_category ORDER BY revenue DESC) AS rn
    FROM product_revenue
) t WHERE rn <= 3;`} />
          <Quiz topicId="sql-window" questions={[
            { question: "RANK() vs DENSE_RANK()  -  for values 10, 10, 8 what does DENSE_RANK() return?", options: ['1, 1, 3', '1, 1, 2', '1, 2, 3', '2, 2, 3'], correct: 1 },
            { question: "What does LAG(col, 1) return for the first row in a partition?", options: ['The last row value', '0', 'NULL', 'An error'], correct: 2 },
            { question: "Window functions are evaluated at which stage?", options: ['Before WHERE', 'After WHERE, during GROUP BY', 'After SELECT, before ORDER BY', 'After HAVING, when computing SELECT expressions'], correct: 3 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-window'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── FRAMES ── */}
        <section id="sql-frames" ref={ref('sql-frames')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 4</span><h2>Window Frames (ROWS / RANGE BETWEEN)</h2></div>
          <p>The frame clause inside OVER() restricts which rows are included in the window calculation. ROWS mode counts physical rows; RANGE mode includes all rows with the same ORDER BY value. Common frames: UNBOUNDED PRECEDING to CURRENT ROW (running total), N PRECEDING to CURRENT ROW (rolling N-period window), UNBOUNDED PRECEDING to UNBOUNDED FOLLOWING (full partition). The default frame when ORDER BY is present is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.</p>
          <CodeBlock language="sql" code={`-- 7-day rolling average (ROWS mode: exactly 7 preceding rows)
SELECT
    event_date,
    daily_revenue,
    AVG(daily_revenue) OVER (
        ORDER BY event_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg
FROM daily_metrics;

-- RANGE mode: includes all rows with same date
SELECT
    event_date,
    daily_revenue,
    SUM(daily_revenue) OVER (
        ORDER BY event_date
        RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW
    ) AS rolling_7d_sum
FROM daily_metrics;

-- Full partition aggregate (does not collapse rows)
SELECT
    customer_id, order_date, amount,
    SUM(amount) OVER (PARTITION BY customer_id) AS customer_total,  -- full partition
    amount / SUM(amount) OVER (PARTITION BY customer_id) AS pct_of_total
FROM orders;

-- Monthly running total that resets each month
SELECT
    order_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY DATE_TRUNC('month', order_date)
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS monthly_running_total
FROM orders;

-- Frame options summary:
-- ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -> running total
-- ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING          -> centered 5-row window
-- ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING  -> reverse running
-- ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING -> full partition`} />
          <Quiz topicId="sql-frames" questions={[
            { question: "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW always includes exactly 7 rows. RANGE BETWEEN 6 PRECEDING AND CURRENT ROW:", options: ['Always includes exactly 7 rows', 'Includes rows within 6 units of ORDER BY value  -  could be more than 7', 'Includes all rows in the partition', 'Includes rows from 6 rows back to end of partition'], correct: 1 },
            { question: "What is the default frame when ORDER BY is specified in OVER()?", options: ['ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING', 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING', 'No default  -  you must specify the frame'], correct: 1 },
            { question: "To compute a 30-day rolling sum, which frame would you use?", options: ['RANGE BETWEEN 30 PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 29 PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 30 PRECEDING AND 1 FOLLOWING', 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-frames'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── PIVOT ── */}
        <section id="sql-pivot" ref={ref('sql-pivot')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>PIVOT / UNPIVOT / Conditional Aggregation</h2></div>
          <p>PIVOT rotates rows into columns  -  transforming long/narrow tables to wide/flat. UNPIVOT does the reverse. Most databases support conditional aggregation (CASE + SUM) as a portable PIVOT equivalent. Snowflake, SQL Server, and Oracle have native PIVOT syntax. Spark SQL supports PIVOT in SELECT. Knowing both approaches makes you portable across engines.</p>
          <CodeBlock language="sql" code={`-- Conditional aggregation PIVOT (portable, works everywhere)
SELECT
    customer_id,
    SUM(CASE WHEN product_category = 'Electronics'  THEN amount ELSE 0 END) AS electronics,
    SUM(CASE WHEN product_category = 'Clothing'     THEN amount ELSE 0 END) AS clothing,
    SUM(CASE WHEN product_category = 'Books'        THEN amount ELSE 0 END) AS books,
    SUM(CASE WHEN product_category = 'Home'         THEN amount ELSE 0 END) AS home
FROM orders
GROUP BY customer_id;

-- Native PIVOT (SQL Server / Snowflake)
SELECT * FROM (
    SELECT customer_id, product_category, amount FROM orders
) src
PIVOT (
    SUM(amount)
    FOR product_category IN ('Electronics', 'Clothing', 'Books', 'Home')
) pvt;

-- Spark SQL PIVOT
SELECT * FROM (
    SELECT customer_id, product_category, amount FROM orders
)
PIVOT (
    SUM(amount) AS total
    FOR product_category IN ('Electronics', 'Clothing', 'Books')
);

-- UNPIVOT: wide to long (portable version)
SELECT customer_id, 'electronics' AS category, electronics AS amount FROM pivoted_orders WHERE electronics IS NOT NULL
UNION ALL
SELECT customer_id, 'clothing',   clothing   FROM pivoted_orders WHERE clothing   IS NOT NULL
UNION ALL
SELECT customer_id, 'books',      books      FROM pivoted_orders WHERE books      IS NOT NULL;

-- Native UNPIVOT (SQL Server)
SELECT customer_id, category, amount
FROM pivoted_orders
UNPIVOT (amount FOR category IN (electronics, clothing, books)) unpvt;`} />
          <Quiz topicId="sql-pivot" questions={[
            { question: "What does a PIVOT operation do to data?", options: ['Filters columns', 'Rotates unique row values into columns', 'Sorts by multiple columns', 'Transposes all rows to columns'], correct: 1 },
            { question: "Conditional aggregation (CASE + SUM) is preferred over native PIVOT because:", options: ['It is faster', 'It is portable across all SQL engines', 'It supports more column types', 'Native PIVOT has bugs'], correct: 1 },
            { question: "UNPIVOT converts:", options: ['NULL values to 0', 'Wide tables (many columns) to long tables (many rows)', 'Long tables to wide tables', 'Rows to JSON'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-pivot'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── JSON ── */}
        <section id="sql-json" ref={ref('sql-json')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>JSON Functions in SQL</h2></div>
          <p>Modern data often arrives as semi-structured JSON. SQL engines can parse, query, and generate JSON natively. Spark SQL and Databricks handle JSON extensively  -  from_json() and to_json() are daily tools. PostgreSQL has rich JSON operators. BigQuery uses JSON_EXTRACT. Knowing how to shred JSON columns into structured data is essential for Bronze-to-Silver transformations.</p>
          <CodeBlock language="sql" code={`-- Spark SQL: parse JSON string column
SELECT
    event_id,
    from_json(payload, 'STRUCT<user_id:STRING, action:STRING, ts:TIMESTAMP>') AS parsed,
    get_json_object(payload, '$.user_id')  AS user_id,
    get_json_object(payload, '$.action')   AS action
FROM raw_events;

-- Explode JSON array into rows (Spark SQL)
SELECT
    event_id,
    explode(from_json(items_json, 'ARRAY<STRUCT<id:STRING, qty:INT>>')) AS item
FROM orders_raw;

-- Then access struct fields
SELECT event_id, item.id, item.qty
FROM (
    SELECT event_id,
           explode(from_json(items_json, 'ARRAY<STRUCT<id:STRING, qty:INT>>')) AS item
    FROM orders_raw
);

-- PostgreSQL JSON operators
SELECT
    data->>'user_id'                   AS user_id,       -- text
    (data->'metadata'->>'source')       AS source,       -- nested
    data->'tags'->>0                    AS first_tag,    -- array element
    jsonb_array_elements_text(data->'tags') AS tag       -- expand array
FROM events;

-- BigQuery JSON
SELECT
    JSON_EXTRACT_SCALAR(payload, '$.user_id')    AS user_id,
    JSON_EXTRACT(payload, '$.metadata')          AS metadata_json,
    JSON_EXTRACT_SCALAR(payload, '$.items[0].id') AS first_item_id
FROM raw_events;

-- Convert to JSON
SELECT to_json(struct(order_id, customer_id, amount)) AS json_row FROM orders; -- Spark
SELECT row_to_json(t) FROM orders t;  -- PostgreSQL`} />
          <Quiz topicId="sql-json" questions={[
            { question: "In Spark SQL, which function converts a JSON string column to a struct?", options: ['parse_json()', 'json_decode()', 'from_json()', 'json_extract()'], correct: 2 },
            { question: "get_json_object(col, '$.a.b') extracts:", options: ['Top-level key a', 'Key b nested under key a', 'Array element at position b', 'All keys'], correct: 1 },
            { question: "To expand a JSON array column into multiple rows in Spark SQL, you use:", options: ['PIVOT', 'UNNEST', 'explode(from_json(...))', 'CROSS JOIN JSON_TABLE'], correct: 2 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-json'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── DML ── */}
        <section id="sql-dml" ref={ref('sql-dml')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>DML: INSERT, UPDATE, DELETE, MERGE</h2></div>
          <p>Data Manipulation Language (DML) modifies table data. MERGE (also called UPSERT) is the most powerful  -  it conditionally inserts, updates, or deletes in a single atomic statement. In Delta Lake, MERGE is central to SCD Type 2 and incremental loads. Understanding DML atomicity and how it interacts with transactions is critical for data integrity.</p>
          <CodeBlock language="sql" code={`-- INSERT variants
INSERT INTO orders (customer_id, amount, status) VALUES (1, 99.99, 'pending');

-- INSERT from SELECT (load from staging)
INSERT INTO orders_clean
SELECT order_id, customer_id, ROUND(amount, 2), status, CURRENT_TIMESTAMP
FROM orders_staging
WHERE amount > 0;

-- INSERT ... ON CONFLICT (PostgreSQL upsert)
INSERT INTO customers (id, email, name, updated_at)
VALUES (1, 'alice@x.com', 'Alice', NOW())
ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = EXCLUDED.name,
    updated_at = EXCLUDED.updated_at;

-- UPDATE with FROM (PostgreSQL / Spark not supported natively)
UPDATE orders o
SET status = 'completed', completed_at = NOW()
FROM shipments s
WHERE o.order_id = s.order_id
  AND s.delivered_at IS NOT NULL;

-- DELETE with subquery
DELETE FROM orders_staging
WHERE order_id IN (
    SELECT order_id FROM orders WHERE status = 'completed'
);

-- MERGE (ANSI SQL:2003  -  supported in Databricks/Snowflake/SQL Server)
MERGE INTO customers_target AS t
USING customers_source AS s
ON t.customer_id = s.customer_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN
    UPDATE SET t.email = s.email, t.name = s.name, t.updated_at = s.updated_at
WHEN NOT MATCHED BY TARGET THEN
    INSERT (customer_id, email, name, created_at, updated_at)
    VALUES (s.customer_id, s.email, s.name, s.created_at, s.updated_at)
WHEN NOT MATCHED BY SOURCE THEN
    DELETE;   -- remove rows no longer in source (Delta Lake specific)

-- Delta Lake MERGE (PySpark API)
-- from delta.tables import DeltaTable
-- DeltaTable.forName(spark, "customers") \
--   .alias("t").merge(source.alias("s"), "t.id = s.id") \
--   .whenMatchedUpdateAll() \
--   .whenNotMatchedInsertAll() \
--   .execute()`} />
          <Quiz topicId="sql-dml" questions={[
            { question: "What does MERGE's WHEN NOT MATCHED BY SOURCE clause do?", options: ['Inserts new rows', 'Updates rows not in source', 'Deletes target rows that have no matching source row', 'Does nothing'], correct: 2 },
            { question: "INSERT INTO ... ON CONFLICT (id) DO UPDATE is a PostgreSQL pattern for:", options: ['Conditional insert', 'Upsert (insert or update)', 'Bulk insert', 'Insert with validation'], correct: 1 },
            { question: "DELETE with a subquery vs TRUNCATE  -  key difference:", options: ['TRUNCATE is logged; DELETE is not', 'DELETE removes specific rows and is fully logged; TRUNCATE removes all rows and is minimally logged', 'DELETE is faster than TRUNCATE', 'TRUNCATE supports WHERE clauses'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-dml'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── DDL ── */}
        <section id="sql-ddl" ref={ref('sql-ddl')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>DDL: CREATE, ALTER, DROP, TRUNCATE</h2></div>
          <p>Data Definition Language (DDL) manages table structures and schema. CREATE TABLE defines columns, types, and constraints. ALTER TABLE modifies existing structures. DROP removes objects permanently. TRUNCATE deletes all rows faster than DELETE (no row-level logging). In cloud warehouses (Databricks, Snowflake, BigQuery), DDL is mostly SQL  -  understanding CREATE TABLE AS SELECT (CTAS) and CREATE OR REPLACE TABLE is essential for pipeline work.</p>
          <CodeBlock language="sql" code={`-- CREATE TABLE with constraints
CREATE TABLE orders (
    order_id      BIGINT       PRIMARY KEY,
    customer_id   BIGINT       NOT NULL REFERENCES customers(id),
    order_date    DATE         NOT NULL DEFAULT CURRENT_DATE,
    amount        DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    status        VARCHAR(20)  NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','completed','failed','refunded')),
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CTAS: create table from query result
CREATE TABLE orders_summary AS
SELECT customer_id, COUNT(*) AS cnt, SUM(amount) AS total
FROM orders GROUP BY customer_id;

-- CREATE OR REPLACE (Databricks, Snowflake)
CREATE OR REPLACE TABLE gold.customer_metrics AS
SELECT customer_id, COUNT(*) cnt, SUM(amount) total FROM orders GROUP BY 1;

-- ALTER TABLE: add/drop/rename columns
ALTER TABLE orders ADD COLUMN channel VARCHAR(50);
ALTER TABLE orders DROP COLUMN legacy_field;
ALTER TABLE orders RENAME COLUMN amt TO amount;
ALTER TABLE orders ALTER COLUMN amount TYPE DECIMAL(14,2);  -- PostgreSQL

-- Adding constraints
ALTER TABLE orders ADD CONSTRAINT chk_positive_amount CHECK (amount > 0);
ALTER TABLE orders ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id);

-- DROP with safety check
DROP TABLE IF EXISTS orders_temp;
DROP VIEW  IF EXISTS v_active_customers;

-- TRUNCATE: fast all-rows delete (cannot WHERE)
TRUNCATE TABLE orders_staging;
TRUNCATE TABLE orders_staging RESTART IDENTITY;  -- also reset sequences

-- Delta Lake DDL
CREATE TABLE IF NOT EXISTS silver.orders (
    order_id STRING, customer_id STRING, amount DOUBLE, status STRING, order_date DATE
) USING DELTA
PARTITIONED BY (order_date)
LOCATION 'abfss://silver@datalake.dfs.core.windows.net/orders'
TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true');`} />
          <Quiz topicId="sql-ddl" questions={[
            { question: "TRUNCATE vs DELETE FROM  -  which is faster and why?", options: ['DELETE, because it processes rows individually', 'TRUNCATE, because it deallocates data pages without row-level logging', 'They have identical performance', 'TRUNCATE is slower on large tables'], correct: 1 },
            { question: "CREATE TABLE AS SELECT (CTAS) creates a table:", options: ['With no data', 'With the structure and data from the SELECT query', 'With only the structure (schema) of the SELECT', 'As a view, not a real table'], correct: 1 },
            { question: "ALTER TABLE ADD COLUMN in a live production table may cause:", options: ['An error if the table has data', 'A table lock (downtime) on some databases', 'All existing rows to be deleted', 'The column to be filled with random data'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-ddl'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── VIEWS ── */}
        <section id="sql-views" ref={ref('sql-views')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Views and Materialized Views</h2></div>
          <p>A view is a named saved query  -  it does not store data. Every time the view is queried, the underlying SQL runs. Views provide security (hide columns), abstraction (stable interface over changing schema), and reuse. Materialized views (or materialized tables in Databricks) store query results physically, dramatically speeding up expensive aggregations at the cost of staleness. They must be refreshed periodically.</p>
          <CodeBlock language="sql" code={`-- Regular view (no data stored)
CREATE OR REPLACE VIEW v_active_customers AS
SELECT
    c.id, c.name, c.email,
    COUNT(o.order_id)  AS order_count,
    SUM(o.amount)      AS lifetime_value,
    MAX(o.order_date)  AS last_order_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.email;

-- Query the view like a table
SELECT * FROM v_active_customers WHERE lifetime_value > 1000 ORDER BY lifetime_value DESC;

-- Updatable views (simple views can support INSERT/UPDATE)
CREATE VIEW v_pending_orders AS
SELECT order_id, customer_id, amount FROM orders WHERE status = 'pending';
-- UPDATE v_pending_orders SET amount = 99 WHERE order_id = 1; -- works if simple

-- Materialized view (PostgreSQL)
CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT
    DATE_TRUNC('day', order_date)  AS day,
    SUM(amount)                     AS revenue,
    COUNT(DISTINCT customer_id)     AS unique_customers
FROM orders
WHERE status = 'completed'
GROUP BY 1;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW mv_daily_revenue;                    -- blocks reads
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_revenue;       -- no lock, needs unique index

-- Create index on materialized view for fast queries
CREATE UNIQUE INDEX ON mv_daily_revenue (day);

-- Databricks: equivalent via scheduled CTAS or Delta Live Tables
-- Gold layer view
CREATE OR REPLACE VIEW gold.v_customer_360 AS
SELECT ... FROM silver.customers JOIN silver.orders USING (customer_id);`} />
          <Quiz topicId="sql-views" questions={[
            { question: "What is the key difference between a view and a materialized view?", options: ['Views can be updated; materialized views cannot', 'Materialized views store data physically; regular views execute the query at runtime', 'Views are faster than materialized views', 'Materialized views always stay up to date automatically'], correct: 1 },
            { question: "When should you prefer a materialized view over a regular view?", options: ['When the underlying data changes every second', 'When the query is expensive and slight staleness is acceptable', 'When the table has fewer than 1000 rows', 'When you need row-level security'], correct: 1 },
            { question: "REFRESH MATERIALIZED VIEW CONCURRENTLY requires:", options: ['A superuser role', 'A unique index on the materialized view', 'No active transactions', 'PostgreSQL 14+'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-views'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── TRANSACTIONS ── */}
        <section id="sql-transactions" ref={ref('sql-transactions')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Transactions, ACID, Isolation Levels</h2></div>
          <p>A transaction is a unit of work that is either fully committed or fully rolled back. ACID guarantees: Atomicity (all or nothing), Consistency (valid state before and after), Isolation (concurrent transactions do not interfere), Durability (committed data survives crashes). Isolation levels trade off between performance and correctness. Understanding concurrency anomalies (dirty read, non-repeatable read, phantom read) is critical for data engineers building reliable pipelines.</p>
          <CodeBlock language="sql" code={`-- Basic transaction
BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;
    -- If any error: ROLLBACK
COMMIT;

-- Transaction with error handling (PostgreSQL)
BEGIN;
    INSERT INTO orders (customer_id, amount) VALUES (1, 99.99);
    UPDATE inventory SET qty = qty - 1 WHERE product_id = 42;
    -- SAVEPOINT before risky operation
    SAVEPOINT before_notification;
    INSERT INTO notifications (customer_id, message) VALUES (1, 'Order placed');
    -- If notification fails, roll back only to savepoint
    RELEASE SAVEPOINT before_notification;
COMMIT;

-- Isolation levels and the anomalies they prevent
-- READ UNCOMMITTED: dirty reads allowed (see uncommitted changes)
-- READ COMMITTED:   no dirty reads (default in PostgreSQL, SQL Server)
-- REPEATABLE READ:  no dirty reads, no non-repeatable reads
-- SERIALIZABLE:     no dirty reads, no non-repeatable reads, no phantom reads

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
    SELECT COUNT(*) FROM orders WHERE status = 'pending';
    -- With SERIALIZABLE, concurrent INSERT of pending order will be blocked
COMMIT;

-- Concurrency anomalies:
-- Dirty read: reading uncommitted data from another transaction
-- Non-repeatable read: same SELECT returns different values in same transaction
-- Phantom read: new rows appear in same query within same transaction

-- Locking: explicit locks (use sparingly)
BEGIN;
    SELECT * FROM orders WHERE status = 'pending' FOR UPDATE;  -- row lock
    UPDATE orders SET status = 'processing' WHERE status = 'pending';
COMMIT;

-- Deadlock prevention: always acquire locks in the same order
-- and keep transactions short`} />
          <Quiz topicId="sql-transactions" questions={[
            { question: "Which ACID property ensures a transaction is either fully applied or fully rolled back?", options: ['Consistency', 'Isolation', 'Atomicity', 'Durability'], correct: 2 },
            { question: "READ COMMITTED isolation level prevents which anomaly?", options: ['Phantom reads', 'Non-repeatable reads', 'Dirty reads', 'Lost updates'], correct: 2 },
            { question: "A phantom read occurs when:", options: ['A row changes value between two reads in the same transaction', 'Uncommitted data is read', 'New rows appear in the same query within the same transaction', 'A transaction is rolled back'], correct: 2 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-transactions'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── NORMALIZATION ── */}
        <section id="sql-normalization" ref={ref('sql-normalization')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Normalization (1NF  -  BCNF)</h2></div>
          <p>Normalization organizes relational data to eliminate redundancy and anomalies. Each normal form adds a rule on top of the previous. In data engineering, OLTP databases are typically 3NF (minimize write anomalies), while OLAP/warehouse schemas are intentionally denormalized (star/snowflake schema) to minimize JOINs at query time. Understanding when to normalize vs denormalize is a design decision, not a rule.</p>
          <NormalizationAnimation />
          <CodeBlock language="sql" code={`-- 1NF: Each column holds atomic (indivisible) values, no repeating groups
-- VIOLATION: products column contains 'Laptop,Mouse' (multi-valued)
-- FIX: one row per product

-- 2NF: 1NF + no partial dependencies (non-key columns depend on the WHOLE key)
-- Example: composite key (order_id, product_id)
-- VIOLATION: product_name depends only on product_id (partial dependency)
-- FIX: move product_name to a Products table

-- 3NF: 2NF + no transitive dependencies (non-key col depends on another non-key col)
-- Example: zip_code -> city -> state
-- VIOLATION: city and state depend on zip_code (transitive)
-- FIX: create a ZipCodes(zip, city, state) table

-- BCNF: Every determinant is a candidate key (stronger than 3NF)

-- Denormalized star schema (data warehouse  -  intentional)
-- Fact table: orders_fact(order_id, customer_key, product_key, date_key, amount)
-- Dim tables: dim_customer, dim_product, dim_date
-- Trade-off: redundant data in dims, but fast single-join queries

-- When to denormalize in data engineering:
-- Gold layer tables for BI: pre-join dimensions to reduce query complexity
-- Parquet column pruning: wide flat tables let engines skip irrelevant columns
-- Aggregated rollup tables: pre-computed summaries for dashboards`} />
          <Quiz topicId="sql-normalization" questions={[
            { question: "1NF requires that each column contains:", options: ['Only integers', 'Atomic (indivisible) values  -  no arrays or repeated groups', 'A primary key', 'Non-null values'], correct: 1 },
            { question: "In a data warehouse (OLAP), tables are typically:", options: ['In 3NF', 'In BCNF', 'Intentionally denormalized (star/snowflake schema)', 'Not normalized at all'], correct: 2 },
            { question: "A transitive dependency means:", options: ['A column depends on the primary key via another non-key column', 'Two columns share the same value', 'A foreign key references another table', 'A column can be NULL'], correct: 0 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-normalization'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── INDEXES ── */}
        <section id="sql-indexes" ref={ref('sql-indexes')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Indexes Deep Dive</h2></div>
          <p>Indexes accelerate reads at the cost of slower writes and extra storage. The B-tree index is the default for equality and range queries. Hash indexes are only for equality. Composite indexes support queries on multiple columns  -  column order matters. A covering index includes all columns needed by a query, eliminating table lookups. Partial indexes index only a subset of rows. Understanding when the optimizer will use or skip an index is key to tuning.</p>
          <IndexAnimation />
          <CodeBlock language="sql" code={`-- B-tree index (default): equality and range queries
CREATE INDEX idx_orders_date ON orders (order_date);
CREATE INDEX idx_orders_customer ON orders (customer_id);

-- Composite index: column order matters for query matching
CREATE INDEX idx_orders_status_date ON orders (status, order_date);
-- Supports: WHERE status = 'completed' AND order_date > '2024-01-01'
-- Supports: WHERE status = 'completed'   (leading column)
-- Does NOT help: WHERE order_date > '2024-01-01' (skips leading column)

-- Covering index: includes all query columns (no table lookup)
CREATE INDEX idx_orders_covering ON orders (customer_id, order_date) INCLUDE (amount, status);
-- A query SELECT order_date, amount, status WHERE customer_id = 1 is satisfied entirely from index

-- Partial index: only indexes relevant rows (smaller, faster)
CREATE INDEX idx_pending_orders ON orders (order_date) WHERE status = 'pending';

-- Unique index: enforces uniqueness AND serves as index
CREATE UNIQUE INDEX idx_customers_email ON customers (email);

-- Hash index: equality only (fast for =, useless for <, >, BETWEEN)
CREATE INDEX idx_order_hash ON orders USING HASH (order_id);

-- Check which index a query uses
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE customer_id = 42;
-- Look for: Index Scan / Bitmap Index Scan vs Seq Scan

-- When indexes are NOT used:
-- 1. Function on indexed column: WHERE YEAR(order_date) = 2024 (use range instead)
-- 2. Implicit type cast: WHERE customer_id = '42' (int vs varchar)
-- 3. LIKE with leading wildcard: WHERE name LIKE '%smith'
-- 4. NOT IN / NOT LIKE / != (often forces full scan)
-- 5. Very low selectivity: WHERE status IN ('active','inactive') on 2-value column
-- 6. Small tables (optimizer chooses seq scan anyway)`} />
          <Quiz topicId="sql-indexes" questions={[
            { question: "A covering index means:", options: ['The index covers the entire table', 'The index contains all columns needed by the query, eliminating the table lookup', 'An index with a WHERE clause', 'An index that spans multiple tables'], correct: 1 },
            { question: "For a composite index on (a, b, c), which query CANNOT use this index?", options: ['WHERE a = 1 AND b = 2', 'WHERE a = 1', 'WHERE b = 2', 'WHERE a = 1 AND b = 2 AND c = 3'], correct: 2, explanation: 'The composite index requires the leading column (a) to be in the WHERE clause.' },
            { question: "Why does WHERE YEAR(created_at) = 2024 prevent index usage?", options: ['YEAR() is not a standard function', 'The function wraps the indexed column, making it non-sargable', 'The index does not support date columns', 'YEAR() always triggers a full table scan by design'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-indexes'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── EXECUTION PLANS ── */}
        <section id="sql-execution" ref={ref('sql-execution')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Execution Plans and EXPLAIN</h2></div>
          <p>The query optimizer converts SQL into an execution plan  -  a tree of physical operations. EXPLAIN shows the estimated plan; EXPLAIN ANALYZE actually executes the query and shows real statistics. Key nodes to understand: Seq Scan (full table scan), Index Scan (B-tree lookup), Bitmap Index Scan (multiple index ranges), Nested Loop (good for small sets), Hash Join (good for large sets with hash-able join), Merge Join (good for pre-sorted data). The optimizer makes decisions based on table statistics  -  outdated stats lead to bad plans.</p>
          <CodeBlock language="sql" code={`-- PostgreSQL EXPLAIN ANALYZE
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT c.name, SUM(o.amount)
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_date >= '2024-01-01'
GROUP BY c.name
ORDER BY 2 DESC;

-- Reading the plan output:
-- -> Hash Aggregate  (cost=450..460 rows=100 width=40) (actual time=23..24 rows=95)
--    -> Hash Join  (cost=100..400 rows=5000) (actual time=5..20 rows=4980)
--       Hash Cond: (o.customer_id = c.id)
--       -> Index Scan using idx_orders_date on orders
--            Index Cond: (order_date >= '2024-01-01')
--       -> Seq Scan on customers  (cost=0..50 rows=1000)

-- Cost numbers: (startup_cost..total_cost rows=estimated_rows width=bytes)
-- actual time: (startup_ms..total_ms rows=actual_rows loops=N)

-- Spark SQL execution plan
-- df.explain(mode='extended')  -- shows all 4 plan stages:
-- == Parsed Logical Plan ==
-- == Analyzed Logical Plan ==
-- == Optimized Logical Plan ==
-- == Physical Plan ==

-- Updating statistics for better plans
ANALYZE orders;                  -- PostgreSQL
ANALYZE TABLE orders COMPUTE STATISTICS;   -- Spark SQL
-- Databricks: stats auto-collected, or ANALYZE TABLE ... COMPUTE STATISTICS FOR COLUMNS col1, col2

-- Common plan problems:
-- 1. Seq Scan where Index Scan expected → missing index or non-sargable predicate
-- 2. Nested Loop with large tables → missing index on join column
-- 3. Rows estimate off by 10x+ → stale statistics (run ANALYZE)
-- 4. Sort in plan → adding ORDER BY index can eliminate it
-- 5. Hash Aggregate → memory spill if estimate too low (increase work_mem in PG)`} />
          <Quiz topicId="sql-execution" questions={[
            { question: "EXPLAIN vs EXPLAIN ANALYZE  -  what is the key difference?", options: ['EXPLAIN ANALYZE shows estimated plans; EXPLAIN shows actual', 'EXPLAIN ANALYZE actually executes the query and shows real row counts and timings', 'EXPLAIN ANALYZE only works on PostgreSQL', 'They are identical'], correct: 1 },
            { question: "What does a Seq Scan in an execution plan indicate?", options: ['The query is optimal', 'A full table scan  -  every row is read', 'A sequential write operation', 'An index was used in sequence'], correct: 1 },
            { question: "Why does the optimizer sometimes choose a wrong plan?", options: ['SQL is ambiguous', 'Stale table statistics lead to incorrect row count estimates', 'The optimizer ignores indexes', 'The SQL syntax was non-standard'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-execution'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── PATTERNS ── */}
        <section id="sql-patterns" ref={ref('sql-patterns')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Common SQL Patterns</h2></div>
          <p>Mastering these recurring patterns separates intermediate from senior SQL practitioners. These patterns appear in data engineering interviews and real pipeline code constantly: deduplication, running totals, year-over-year comparison, gaps and islands, top-N per group, sessionization, median, and pivoting arbitrary categories.</p>
          <CodeBlock language="sql" code={`-- 1. Top N per group (top 3 products per category)
SELECT * FROM (
    SELECT product_id, category, revenue,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) AS rn
    FROM product_revenue
) WHERE rn <= 3;

-- 2. Running total with monthly reset
SELECT order_date, amount,
    SUM(amount) OVER (
        PARTITION BY DATE_TRUNC('month', order_date)
        ORDER BY order_date
        ROWS UNBOUNDED PRECEDING
    ) AS monthly_running_total
FROM orders;

-- 3. Year-over-year comparison
SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(amount) AS revenue,
    LAG(SUM(amount), 12) OVER (ORDER BY DATE_TRUNC('month', order_date)) AS revenue_prior_year,
    SUM(amount) / NULLIF(LAG(SUM(amount), 12) OVER (ORDER BY DATE_TRUNC('month', order_date)), 0) - 1 AS yoy_growth
FROM orders GROUP BY 1;

-- 4. Gaps in a sequence (find missing order IDs)
SELECT n + 1 AS gap_start
FROM (SELECT order_id AS n FROM orders) t
WHERE n + 1 NOT IN (SELECT order_id FROM orders)
  AND n < (SELECT MAX(order_id) FROM orders);

-- 5. Islands: consecutive date ranges where status = 'active'
WITH numbered AS (
    SELECT date, ROW_NUMBER() OVER (ORDER BY date) AS rn
    FROM user_activity WHERE user_id = 42
),
grouped AS (SELECT date, date - rn * INTERVAL '1 day' AS grp FROM numbered)
SELECT MIN(date) AS island_start, MAX(date) AS island_end, COUNT(*) AS days
FROM grouped GROUP BY grp ORDER BY island_start;

-- 6. Median (PERCENTILE_CONT)
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median_amount FROM orders;

-- 7. First purchase per customer
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS rn
    FROM orders
) WHERE rn = 1;

-- 8. Sessionization: group events within 30-min gaps
WITH with_gaps AS (
    SELECT user_id, event_time,
           CASE WHEN event_time - LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time)
                     > INTERVAL '30 minutes' THEN 1 ELSE 0 END AS new_session
    FROM events
),
with_session_id AS (
    SELECT *, SUM(new_session) OVER (PARTITION BY user_id ORDER BY event_time
                                     ROWS UNBOUNDED PRECEDING) AS session_id
    FROM with_gaps
)
SELECT user_id, session_id, MIN(event_time) AS start, MAX(event_time) AS end
FROM with_session_id GROUP BY user_id, session_id;

-- 9. Deduplication: keep latest record per ID
WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) AS rn
    FROM records
)
SELECT * FROM ranked WHERE rn = 1;`} />
          <Quiz topicId="sql-patterns" questions={[
            { question: "To find gaps in a sequence of IDs, you typically:", options: ['Use a full table scan', 'Join the table to itself offset by 1, or use NOT IN/NOT EXISTS with n+1', 'Use COUNT(DISTINCT id)', 'Use ROLLUP'], correct: 1 },
            { question: "The sessionization pattern groups events into sessions by:", options: ['User ID only', 'Detecting time gaps larger than a threshold and assigning a session number', 'Counting events per hour', 'Using a pre-existing session_id column'], correct: 1 },
            { question: "Year-over-year comparison in SQL is typically done using:", options: ['YEAR() function', 'LAG() with offset 12 over monthly data', 'SELF JOIN on year', 'DATEADD(-1, year)'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-patterns'); onComplete() }}>Mark Complete ✓</button>
        </section>

        {/* ── PERFORMANCE ── */}
        <section id="sql-performance" ref={ref('sql-performance')} className="topic-section">
          <div className="topic-header"><span className="topic-tag">Level 5</span><h2>Query Performance Tuning</h2></div>
          <p>Query performance optimization is a systematic process: identify slow queries, understand the execution plan, check for missing indexes, rewrite non-sargable predicates, eliminate unnecessary work, and verify statistics are fresh. The most impactful changes are usually: adding the right index, fixing a non-sargable predicate, avoiding SELECT *, and moving filtering as early as possible.</p>
          <CodeBlock language="sql" code={`-- 1. Sargability: predicates that CAN use an index (Search ARGument ABLE)
-- SARGABLE:
WHERE order_date >= '2024-01-01'         -- range on indexed column
WHERE customer_id = 42                   -- equality on indexed column
WHERE email LIKE 'alice%'                -- prefix match (leading = ok)

-- NOT SARGABLE (forces full scan):
WHERE YEAR(order_date) = 2024            -- function wraps column → FIX: use range
WHERE LOWER(email) = 'alice@x.com'      -- function wraps column → FIX: store lowercase
WHERE email LIKE '%alice%'              -- leading wildcard
WHERE amount + 10 > 100                 -- expression → FIX: WHERE amount > 90

-- FIX for YEAR():
WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'

-- 2. Avoid SELECT *  -  list only needed columns (column pruning)
-- On Parquet/Delta, engines skip unneeded column chunks = huge I/O savings

-- 3. Filter early with partition pruning
-- Delta Lake: partition on date column, filter by date → skip entire folders
SELECT * FROM events WHERE event_date = '2024-01-15';
-- ^ Only reads 2024-01-15 partition folder if table is PARTITIONED BY (event_date)

-- 4. JOIN order: put the smallest filtered table first (for Nested Loop)
-- Most optimizers handle this automatically, but in Spark you may need hints
SELECT /*+ BROADCAST(c) */ o.order_id, c.name
FROM orders o JOIN customers c ON o.customer_id = c.id;

-- 5. Use EXISTS over IN for large subqueries
-- EXISTS stops at first match; IN evaluates the entire subquery

-- 6. Avoid DISTINCT when possible  -  use GROUP BY or window functions
-- DISTINCT forces a full sort/hash. If data is already unique, it wastes work.

-- 7. Predicate pushdown: filter before joining
SELECT o.order_id, c.name
FROM (SELECT * FROM orders WHERE status = 'completed') o   -- filter first
JOIN customers c ON o.customer_id = c.id;

-- 8. Common anti-patterns table
/*
Anti-pattern                     Fix
SELECT *                      →  List only needed columns
YEAR(col) = 2024              →  col BETWEEN '2024-01-01' AND '2024-12-31'
LOWER(col) = 'x'              →  Store data normalized; col = 'x'
NOT IN (subquery)             →  NOT EXISTS (or LEFT ANTI JOIN in Spark)
Correlated subquery in SELECT →  LEFT JOIN + GROUP BY
DISTINCT without reason       →  ROW_NUMBER() or remove duplicates at source
OR on different columns       →  UNION ALL of two queries, each using an index
*/`} />
          <Quiz topicId="sql-performance" questions={[
            { question: "What does 'sargable' mean in SQL optimization?", options: ['A query that uses stored procedures', 'A predicate that allows the optimizer to use an index (Search ARGument ABLE)', 'A query with no subqueries', 'A query that scans less than 1% of rows'], correct: 1 },
            { question: "In a Parquet/Delta table partitioned by date, which query benefits most from partition pruning?", options: ['WHERE YEAR(event_date) = 2024', 'WHERE event_date = \'2024-01-15\'', 'WHERE CAST(event_date AS STRING) = \'2024-01-15\'', 'ORDER BY event_date'], correct: 1 },
            { question: "The BROADCAST join hint in Spark tells the optimizer to:", options: ['Distribute the large table across all executors', 'Send the small table to every executor to avoid a shuffle', 'Use sort-merge join', 'Broadcast the query plan'], correct: 1 },
          ]} />
          <button className="complete-btn" onClick={() => { markTopicComplete('sql-performance'); onComplete() }}>Mark Complete ✓</button>
        </section>

      </main>
    </div>
  )
}
