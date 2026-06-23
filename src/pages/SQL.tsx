import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 3 - SQL Foundations', items: [
    { id: 'sql-select', label: 'SELECT, WHERE, ORDER BY' },
    { id: 'sql-agg', label: 'Aggregations and GROUP BY' },
    { id: 'sql-joins', label: 'JOINs (Animated Venn Diagrams)' },
    { id: 'sql-subqueries', label: 'Subqueries and EXISTS' },
  ]},
  { title: 'Level 4 - SQL Mastery', items: [
    { id: 'sql-window', label: 'Window Functions' },
    { id: 'sql-cte', label: 'CTEs and Recursive Queries' },
    { id: 'sql-transactions', label: 'Transactions and ACID' },
    { id: 'sql-ddl', label: 'DDL: CREATE, ALTER, DROP' },
    { id: 'sql-performance', label: 'Query Performance and Indexes' },
  ]},
]

export default function SQL({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('sql-select')
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

        <section id="sql-select" ref={el => { if (el) sectionRefs.current['sql-select'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 3 - SQL Foundations</div>
            <h1 className="topic-title">SELECT, WHERE, ORDER BY</h1>
            <p className="topic-desc">The backbone of every SQL query. Master filtering, sorting, and selecting before anything else.</p>
          </div>

          <CodeBlock lang="sql">{`-- Basic SELECT
SELECT
    customer_id,
    first_name,
    last_name,
    email,
    UPPER(city) AS city_upper,
    DATEDIFF(CURRENT_DATE, created_at) AS days_since_signup
FROM customers
WHERE
    country = 'US'
    AND created_at >= '2024-01-01'
    AND email IS NOT NULL
    AND status IN ('active', 'trial')
    AND revenue BETWEEN 100 AND 10000
ORDER BY revenue DESC, last_name ASC
LIMIT 100;

-- Pattern matching
SELECT * FROM products WHERE name LIKE 'Azure%';   -- starts with
SELECT * FROM logs   WHERE message LIKE '%ERROR%'; -- contains
SELECT * FROM codes  WHERE code ~ '^[A-Z]{3}$';   -- regex (PostgreSQL)`}</CodeBlock>

          <Quiz topicId="sql-select" questions={[
            { question: "What does LIKE '%error%' match?", options: ["Strings starting with 'error'", "Strings ending with 'error'", "Strings containing 'error' anywhere", "Exact match of 'error'"], correct: 2 },
            { question: "What is the difference between WHERE and HAVING?", options: ["WHERE filters rows before aggregation; HAVING filters after GROUP BY", "HAVING is faster than WHERE", "WHERE is used with JOINs only", "They are the same"], correct: 0 },
            { question: "Which clause defines the result ordering?", options: ["GROUP BY", "WHERE", "ORDER BY", "PARTITION BY"], correct: 2 },
          ]} />
          <button onClick={async () => { await markTopicComplete('sql-select'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="sql-agg" ref={el => { if (el) sectionRefs.current['sql-agg'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 3 - SQL Foundations</div>
            <h1 className="topic-title">Aggregations and GROUP BY</h1>
            <p className="topic-desc">Aggregation functions collapse multiple rows into summary values. GROUP BY splits data into groups before aggregating.</p>
          </div>

          <CodeBlock lang="sql">{`-- Core aggregate functions
SELECT
    department,
    COUNT(*)                          AS total_employees,
    COUNT(DISTINCT manager_id)        AS unique_managers,
    SUM(salary)                       AS total_salary,
    AVG(salary)                       AS avg_salary,
    MIN(salary)                       AS min_salary,
    MAX(salary)                       AS max_salary,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) AS median_salary
FROM employees
WHERE hire_date >= '2020-01-01'
GROUP BY department
HAVING COUNT(*) > 5              -- filter AFTER aggregation
ORDER BY total_salary DESC;

-- ROLLUP for subtotals
SELECT year, month, SUM(revenue)
FROM sales
GROUP BY ROLLUP(year, month);

-- CUBE for all combinations
SELECT product, region, SUM(sales)
FROM orders
GROUP BY CUBE(product, region);`}</CodeBlock>

          <Quiz topicId="sql-agg" questions={[
            { question: "What is the difference between COUNT(*) and COUNT(column)?", options: ["No difference", "COUNT(*) counts all rows including NULLs; COUNT(column) skips NULLs", "COUNT(column) is faster", "COUNT(*) only counts distinct values"], correct: 1 },
            { question: "Where do you filter aggregated results?", options: ["WHERE clause", "HAVING clause", "ON clause", "SELECT clause"], correct: 1 },
            { question: "What does GROUP BY ROLLUP(year, month) produce?", options: ["Only year totals", "Subtotals for each year/month plus grand total", "A recursive grouping", "Random grouping"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('sql-agg'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="sql-joins" ref={el => { if (el) sectionRefs.current['sql-joins'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 3 - SQL Foundations</div>
            <h1 className="topic-title">JOINs - Animated Venn Diagrams</h1>
            <p className="topic-desc">JOINs combine rows from multiple tables. Understanding exactly which rows each JOIN returns is critical for correct data pipelines.</p>
          </div>

          <JoinVennDiagram />

          <CodeBlock lang="sql">{`-- INNER JOIN - only matching rows in both tables
SELECT o.order_id, c.customer_name, o.amount
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id;

-- LEFT JOIN - all rows from left, NULLs for non-matching right
SELECT c.customer_name, o.order_id, o.amount
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id;
-- Customers with no orders will show: customer_name, NULL, NULL

-- RIGHT JOIN - all rows from right (rarely used, use LEFT JOIN instead)
SELECT c.customer_name, o.order_id
FROM orders o
RIGHT JOIN customers c ON o.customer_id = c.customer_id;

-- FULL OUTER JOIN - all rows from both, NULLs where no match
SELECT c.customer_name, o.order_id
FROM customers c
FULL OUTER JOIN orders o ON c.customer_id = o.customer_id;

-- CROSS JOIN - cartesian product (every row with every row)
SELECT c.color, s.size FROM colors c CROSS JOIN sizes s;
-- 5 colors x 3 sizes = 15 rows

-- SELF JOIN - join table to itself
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id;`}</CodeBlock>

          <Quiz topicId="sql-joins" questions={[
            { question: "A LEFT JOIN between customers (10 rows) and orders returns 15 rows. Why?", options: ["Some customers have multiple orders", "There's a bug in the query", "LEFT JOIN always multiplies rows", "The tables have duplicate keys"], correct: 0 },
            { question: "Which JOIN returns only rows where the condition matches in BOTH tables?", options: ["LEFT JOIN", "FULL OUTER JOIN", "INNER JOIN", "CROSS JOIN"], correct: 2 },
            { question: "What is a CROSS JOIN?", options: ["A JOIN that fails on errors", "Cartesian product - every row of left combined with every row of right", "A JOIN with multiple conditions", "A self-referencing JOIN"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('sql-joins'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="sql-subqueries" ref={el => { if (el) sectionRefs.current['sql-subqueries'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 3 - SQL Foundations</div>
            <h1 className="topic-title">Subqueries and EXISTS</h1>
          </div>
          <CodeBlock lang="sql">{`-- Scalar subquery (returns single value)
SELECT name, salary,
  salary - (SELECT AVG(salary) FROM employees) AS diff_from_avg
FROM employees;

-- Correlated subquery (references outer query)
SELECT c.name
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.customer_id
    AND o.amount > 1000
);

-- IN vs EXISTS
-- IN: loads all matching values into memory (bad for large sets)
SELECT name FROM employees WHERE dept_id IN (SELECT id FROM departments WHERE active = 1);
-- EXISTS: stops at first match (better for large subqueries)
SELECT name FROM employees e WHERE EXISTS (SELECT 1 FROM departments d WHERE d.id = e.dept_id AND d.active = 1);`}</CodeBlock>
          <Quiz topicId="sql-subqueries" questions={[
            { question: "When should you use EXISTS instead of IN?", options: ["Always", "When the subquery might return NULL values or is large", "When the subquery returns exactly one row", "Never - IN is always better"], correct: 1 },
            { question: "What does a correlated subquery do?", options: ["Returns a fixed value", "References columns from the outer query, running once per outer row", "Runs faster than regular subqueries", "Creates a temporary table"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('sql-subqueries'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="sql-window" ref={el => { if (el) sectionRefs.current['sql-window'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 4 - SQL Mastery</div>
            <h1 className="topic-title">Window Functions</h1>
            <p className="topic-desc">Window functions perform calculations across a set of rows related to the current row WITHOUT collapsing them into groups. Essential for ranking, running totals, and moving averages.</p>
          </div>

          <CodeBlock lang="sql">{`-- Anatomy of a window function
SELECT
    column,
    FUNCTION() OVER (
        PARTITION BY column1, column2  -- split into windows (optional)
        ORDER BY column3               -- order within window
        ROWS BETWEEN ...               -- frame (optional)
    )
FROM table;

-- RANKING functions
SELECT
    employee_id, department, salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
    RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rank,      -- gaps for ties
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rank, -- no gaps
    NTILE(4)     OVER (PARTITION BY department ORDER BY salary DESC) AS quartile
FROM employees;

-- RUNNING TOTALS and MOVING AVERAGES
SELECT
    date, amount,
    SUM(amount)  OVER (ORDER BY date ROWS UNBOUNDED PRECEDING)     AS running_total,
    AVG(amount)  OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7day_avg,
    LAG(amount,  1) OVER (ORDER BY date)  AS prev_day,
    LEAD(amount, 1) OVER (ORDER BY date)  AS next_day,
    amount - LAG(amount, 1) OVER (ORDER BY date) AS day_over_day_change
FROM daily_sales;

-- TOP-N per group (common interview question)
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
    FROM employees
) WHERE rn <= 3;  -- top 3 earners per department`}</CodeBlock>

          <Quiz topicId="sql-window" questions={[
            { question: "What is the difference between RANK() and DENSE_RANK()?", options: ["No difference", "RANK() leaves gaps after ties; DENSE_RANK() has no gaps", "DENSE_RANK() is slower", "RANK() only works with integers"], correct: 1 },
            { question: "What does PARTITION BY do in a window function?", options: ["Splits data into physical partitions on disk", "Divides rows into groups; window function resets for each group", "Filters out NULL values", "Orders the results"], correct: 1 },
            { question: "What does ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW compute?", options: ["A 7-day rolling average", "A running total from the first row to the current row", "The previous row's value", "The next row's value"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('sql-window'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="sql-cte" ref={el => { if (el) sectionRefs.current['sql-cte'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 4 - SQL Mastery</div>
            <h1 className="topic-title">CTEs and Recursive Queries</h1>
          </div>
          <CodeBlock lang="sql">{`-- CTE (Common Table Expression) - named temporary result set
WITH
monthly_sales AS (
    SELECT DATE_TRUNC('month', order_date) AS month, SUM(amount) AS revenue
    FROM orders GROUP BY 1
),
monthly_avg AS (
    SELECT AVG(revenue) AS avg_rev FROM monthly_sales
)
SELECT month, revenue,
       revenue - avg_rev AS diff_from_avg
FROM monthly_sales, monthly_avg
ORDER BY month;

-- RECURSIVE CTE - traverse hierarchies (org charts, categories)
WITH RECURSIVE org_tree AS (
    -- Anchor: start with CEO (no manager)
    SELECT employee_id, name, manager_id, 0 AS level
    FROM employees WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: join employees to already-found rows
    SELECT e.employee_id, e.name, e.manager_id, ot.level + 1
    FROM employees e
    JOIN org_tree ot ON e.manager_id = ot.employee_id
)
SELECT level, name FROM org_tree ORDER BY level, name;`}</CodeBlock>
          <Quiz topicId="sql-cte" questions={[
            { question: "What is the advantage of CTEs over subqueries?", options: ["CTEs are faster", "CTEs are reusable and improve readability; they can be referenced multiple times", "CTEs use less memory", "CTEs auto-create indexes"], correct: 1 },
            { question: "What is the 'anchor' in a recursive CTE?", options: ["The ORDER BY clause", "The base case that starts the recursion (non-recursive SELECT)", "The table being recursed", "The termination condition"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('sql-cte'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="sql-transactions" ref={el => { if (el) sectionRefs.current['sql-transactions'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 4 - SQL Mastery</div>
            <h1 className="topic-title">Transactions and ACID</h1>
          </div>
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body"><strong>ACID:</strong> Atomicity (all or nothing), Consistency (valid state always), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes). Delta Lake brings ACID to data lakes.</div>
          </div>
          <CodeBlock lang="sql">{`BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;

-- If either UPDATE fails, ROLLBACK undoes both
COMMIT;  -- or ROLLBACK;

-- Isolation levels
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;  -- default in most DBs
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;    -- strictest, safest`}</CodeBlock>
          <Quiz topicId="sql-transactions" questions={[
            { question: "What does Atomicity mean in ACID?", options: ["Transactions are fast", "Either all operations succeed or all are rolled back", "Data is consistent", "Transactions are isolated"], correct: 1 },
            { question: "Which ACID property ensures committed data survives a system crash?", options: ["Atomicity", "Consistency", "Isolation", "Durability"], correct: 3 },
          ]} />
          <button onClick={async () => { await markTopicComplete('sql-transactions'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="sql-ddl" ref={el => { if (el) sectionRefs.current['sql-ddl'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 4 - SQL Mastery</div>
            <h1 className="topic-title">DDL: CREATE, ALTER, DROP</h1>
          </div>
          <CodeBlock lang="sql">{`-- CREATE TABLE with constraints
CREATE TABLE orders (
    order_id    BIGINT      PRIMARY KEY,
    customer_id INTEGER     NOT NULL REFERENCES customers(id),
    amount      DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    status      VARCHAR(20) DEFAULT 'pending',
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ALTER TABLE
ALTER TABLE orders ADD COLUMN discount DECIMAL(5,2);
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
ALTER TABLE orders ADD CONSTRAINT uq_order_ref UNIQUE (order_ref);

-- CREATE INDEX (critical for query performance)
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_date     ON orders(created_at DESC);
CREATE UNIQUE INDEX idx_orders_ref ON orders(order_ref);`}</CodeBlock>
          <Quiz topicId="sql-ddl" questions={[
            { question: "What does a FOREIGN KEY constraint enforce?", options: ["Uniqueness", "Referential integrity - referenced row must exist in the parent table", "Not null", "Performance"], correct: 1 },
            { question: "When should you create a database index?", options: ["On every column", "On columns frequently used in WHERE, JOIN, and ORDER BY clauses", "Only on primary keys", "Only on string columns"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('sql-ddl'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

        <section id="sql-performance" ref={el => { if (el) sectionRefs.current['sql-performance'] = el }} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 4 - SQL Mastery</div>
            <h1 className="topic-title">Query Performance and Indexes</h1>
          </div>
          <CodeBlock lang="sql">{`-- EXPLAIN ANALYZE to see query plan
EXPLAIN ANALYZE
SELECT c.name, SUM(o.amount)
FROM customers c JOIN orders o ON c.id = o.customer_id
WHERE c.country = 'US'
GROUP BY c.name;
-- Look for: Seq Scan (bad on large tables) vs Index Scan (good)

-- Common performance anti-patterns
-- BAD: function on indexed column disables the index
SELECT * FROM orders WHERE YEAR(created_at) = 2024;
-- GOOD: range on the raw column uses index
SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- BAD: SELECT * (reads all columns from disk)
SELECT * FROM orders;
-- GOOD: select only needed columns
SELECT order_id, amount, status FROM orders;

-- Covering index (all needed columns in the index)
CREATE INDEX idx_orders_covering ON orders(customer_id, created_at) INCLUDE (amount, status);
-- Query below never touches the table - all data in the index
SELECT created_at, amount, status FROM orders WHERE customer_id = 123;`}</CodeBlock>
          <Quiz topicId="sql-performance" questions={[
            { question: "Why does putting a function on an indexed column hurt performance?", options: ["Functions are slow", "The index was built on the raw column value, not the function result - index can't be used", "Functions consume more memory", "Indexes don't support functions"], correct: 1 },
            { question: "What is a covering index?", options: ["An index that covers the entire table", "An index containing all columns needed by a query, avoiding table lookups", "A clustered index", "An index on NULL values"], correct: 1 },
          ]} />
          <button onClick={async () => { await markTopicComplete('sql-performance'); onComplete() }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--green-500)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>Mark Complete ✓</button>
        </section>

      </main>
    </div>
  )
}

function JoinVennDiagram() {
  const [active, setActive] = useState(0)
  const joins = [
    { name: 'INNER JOIN', desc: 'Only rows matching in BOTH tables', leftFill: '#bfdbfe40', rightFill: '#bfdbfe40', centerFill: '#3b82f6' },
    { name: 'LEFT JOIN', desc: 'All rows from left + matching from right', leftFill: '#3b82f6', rightFill: '#bfdbfe40', centerFill: '#3b82f6' },
    { name: 'RIGHT JOIN', desc: 'All rows from right + matching from left', leftFill: '#bfdbfe40', rightFill: '#3b82f6', centerFill: '#3b82f6' },
    { name: 'FULL OUTER JOIN', desc: 'All rows from both tables', leftFill: '#3b82f6', rightFill: '#3b82f6', centerFill: '#3b82f6' },
    { name: 'LEFT ANTI JOIN', desc: 'Only rows in left NOT in right', leftFill: '#ef4444', rightFill: 'transparent', centerFill: 'transparent' },
  ]
  const j = joins[active]

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % joins.length), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {joins.map((jn, i) => (
          <button key={jn.name} onClick={() => setActive(i)} style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid var(--border)', background: active === i ? 'var(--blue-500)' : 'white', color: active === i ? 'white' : 'var(--text-2)' }}>{jn.name}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)', padding: 24, border: '1px solid var(--border)' }}>
        <svg viewBox="0 0 200 100" style={{ width: 200, height: 100, flexShrink: 0 }}>
          <circle cx="75" cy="50" r="40" fill={j.leftFill} stroke="#3b82f6" strokeWidth="2" opacity=".9" style={{ transition: 'fill .5s' }}/>
          <circle cx="125" cy="50" r="40" fill={j.rightFill} stroke="#8b5cf6" strokeWidth="2" opacity=".9" style={{ transition: 'fill .5s' }}/>
          <text x="55" y="54" textAnchor="middle" fill={j.leftFill === 'transparent' ? '#94a3b8' : 'white'} fontSize="11" fontWeight="700">A</text>
          <text x="145" y="54" textAnchor="middle" fill={j.rightFill === 'transparent' ? '#94a3b8' : 'white'} fontSize="11" fontWeight="700">B</text>
          <text x="100" y="54" textAnchor="middle" fill={j.centerFill === 'transparent' ? '#94a3b8' : 'white'} fontSize="9" fontWeight="700">A∩B</text>
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{j.name}</div>
          <div style={{ fontSize: '.88rem', color: 'var(--text-3)' }}>{j.desc}</div>
        </div>
      </div>
    </div>
  )
}
