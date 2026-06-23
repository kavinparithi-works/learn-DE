import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { markTopicComplete } from '../lib/firebase'

interface Props { completed: Set<string>; onComplete: () => void }

const SECTIONS = [
  { title: 'Level 9 - Apache Airflow', items: [
    { id: 'airflow-intro',          label: 'Intro' },
    { id: 'airflow-dag',            label: 'DAG Basics' },
    { id: 'airflow-operators',      label: 'Operators' },
    { id: 'airflow-spark',          label: 'Spark Operators' },
    { id: 'airflow-sensors',        label: 'Sensors' },
    { id: 'airflow-taskflow',       label: 'TaskFlow API' },
    { id: 'airflow-xcoms',          label: 'XComs' },
    { id: 'airflow-connections',    label: 'Connections' },
    { id: 'airflow-k8s',            label: 'K8s Executor' },
    { id: 'airflow-cicd',           label: 'CI/CD' },
    { id: 'airflow-monitoring',     label: 'Monitoring' },
    { id: 'airflow-vs-databricks',  label: 'Comparisons' },
  ]},
]

const MC_BTN = {
  marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-full)',
  background: 'var(--green-500)', color: 'white', border: 'none',
  fontWeight: 700, cursor: 'pointer', fontSize: '.84rem'
} as const

export default function Airflow({ completed, onComplete }: Props) {
  const [activeId, setActiveId] = useState('airflow-intro')
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
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) }) },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    Object.values(sectionRefs.current).forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const totalTopics = SECTIONS.flatMap(s => s.items).length
  const ref = (id: string) => (el: HTMLElement | null) => { if (el) sectionRefs.current[id] = el }
  const mc = (id: string) => async () => { await markTopicComplete(id); onComplete() }

  return (
    <div className="page-with-sidebar">
      <Sidebar sections={SECTIONS} activeId={activeId} completed={completed} totalTopics={totalTopics} onItemClick={scrollTo} />
      <main className="main-content">

        {/* ─── WHAT IS AIRFLOW ─── */}
        <section id="airflow-intro" ref={ref('airflow-intro')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">What is Airflow?</h1>
            <p className="topic-desc">
              Apache Airflow is an open-source workflow orchestration platform that lets you author, schedule, and monitor data pipelines as Directed Acyclic Graphs (DAGs). Airflow orchestrates  -  it does not execute compute itself. It tells other systems (Spark, dbt, Python, APIs) what to run and when. The scheduler evaluates DAGs every heartbeat, determines which tasks are ready to run based on dependencies, and queues them to an executor. Understanding this architecture is critical: Airflow is a control plane, not a data plane.
            </p>
          </div>
          <AirflowDagAnimation />
          <div className="callout callout-info">
            <span className="callout-icon">💡</span>
            <div className="callout-body">
              <strong>Orchestration vs Execution:</strong> Airflow schedules and monitors  -  it does NOT process data. A PythonOperator runs your function on the worker, but for large data volumes you should submit jobs to Spark/Databricks and wait for completion. Never run heavy pandas operations directly in Airflow tasks.
            </div>
          </div>
          <CodeBlock lang="python">{`# Airflow 2.x Architecture Components:
# ┌─────────────────────────────────────────────────────────────┐
# │  Scheduler     -  Parses DAG files, schedules DAG Runs,       │
# │                 monitors task states, triggers executors.    │
# │  Webserver     -  Flask app serving the Airflow UI.           │
# │  Worker        -  Picks up tasks from the queue (Celery/K8s). │
# │  Metadata DB   -  PostgreSQL/MySQL stores DAG runs, task      │
# │                 states, XComs, connections, variables.       │
# │  Executor      -  LocalExecutor (single machine),             │
# │                 CeleryExecutor (distributed with Redis),     │
# │                 KubernetesExecutor (pod-per-task).           │
# └─────────────────────────────────────────────────────────────┘

# Airflow 2.x vs 1.x key differences:
# Airflow 2.0: TaskFlow API (@task decorator), stable REST API,
#              full DAG serialization to DB (no DAG file access needed
#              by webserver), new UI, scheduler HA (multiple schedulers),
#              removal of SubDagOperator (use TaskGroups instead).
# Airflow 1.x: Experimental APIs, monolithic scheduler,
#              Python 2 compatible, no TaskFlow.

# Check version:
import airflow
print(airflow.__version__)  # e.g. '2.8.1'

# airflow.cfg key settings:
# [core]
# executor = KubernetesExecutor
# sql_alchemy_conn = postgresql+psycopg2://user:pass@host/airflow
# dags_folder = /opt/airflow/dags
# [scheduler]
# dag_dir_list_interval = 30   # seconds between DAG folder scans
# min_file_process_interval = 30
# [webserver]
# rbac = True`}
          </CodeBlock>
          <Quiz topicId="airflow-intro" questions={[
            {
              question: "What is the primary role of the Airflow Scheduler?",
              options: [
                "Run Python functions directly on large datasets",
                "Parse DAG files, evaluate task dependencies, and queue tasks for execution  -  it is the control plane",
                "Serve the Airflow web UI to users",
                "Store DAG run history in the metadata database",
              ],
              correct: 1,
            },
            {
              question: "What changed between Airflow 1.x and 2.x regarding the Scheduler?",
              options: [
                "The scheduler was removed in favor of triggers",
                "Airflow 2.x introduced High Availability for the scheduler  -  multiple scheduler instances can run simultaneously, eliminating the single point of failure",
                "The scheduler now runs tasks directly instead of using executors",
                "Scheduler was merged into the webserver",
              ],
              correct: 1,
            },
            {
              question: "Why should you NOT run heavy pandas data processing directly in Airflow tasks?",
              options: [
                "Airflow does not support pandas",
                "Airflow workers are orchestration nodes  -  they have limited memory and CPU. Heavy computation should be submitted to Spark/Databricks. Running large data transforms on Airflow workers causes OOM errors and blocks other tasks.",
                "Pandas is deprecated in Python 3",
                "Airflow tasks cannot import third-party libraries",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-intro')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── DAG FUNDAMENTALS ─── */}
        <section id="airflow-dag" ref={ref('airflow-dag')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">DAG Fundamentals</h1>
            <p className="topic-desc">
              A DAG (Directed Acyclic Graph) defines the workflow structure: which tasks exist, their dependencies, and their schedule. Key parameters: <code>dag_id</code> (unique name), <code>schedule_interval</code> (cron expression, <code>@daily</code>, <code>timedelta</code>, or None for manual), <code>start_date</code> (when the DAG starts  -  never use <code>datetime.now()</code>), <code>catchup</code> (False in production to prevent backfill of missed runs), <code>max_active_runs</code> (limit concurrent DAG runs), <code>tags</code> (organize in UI), <code>default_args</code> (shared task defaults like <code>retries</code>, <code>retry_delay</code>, <code>email_on_failure</code>). Use the <code>@dag</code> decorator (TaskFlow) or context manager style.
            </p>
          </div>
          <CodeBlock lang="python">{`from datetime import datetime, timedelta
from airflow.decorators import dag, task

# ── default_args: shared defaults for all tasks in this DAG ──────────
default_args = {
    'owner':            'data-engineering',
    'depends_on_past':  False,           # each run independent
    'retries':          2,
    'retry_delay':      timedelta(minutes=5),
    'email_on_failure': True,
    'email_on_retry':   False,
    'email':            ['de-alerts@company.com'],
}

# ── @dag decorator style (Airflow 2.0+ / TaskFlow API) ────────────────
@dag(
    dag_id            = 'silver_orders_daily',
    description       = 'Ingest → bronze → silver orders pipeline',
    schedule_interval = '0 2 * * *',     # 02:00 UTC daily
    start_date        = datetime(2024, 1, 1),
    catchup           = False,            # IMPORTANT: no backfill on deploy
    max_active_runs   = 1,                # prevent overlapping runs
    tags              = ['silver', 'orders', 'daily'],
    default_args      = default_args,
    doc_md            = __doc__,
)
def silver_orders_pipeline():
    ...

dag_instance = silver_orders_pipeline()

# ── Context manager style (classic) ──────────────────────────────────
from airflow import DAG
from airflow.operators.python import PythonOperator

with DAG(
    dag_id            = 'bronze_ingest',
    schedule_interval = timedelta(hours=1),
    start_date        = datetime(2024, 1, 1),
    catchup           = False,
    default_args      = default_args,
) as dag:
    ingest = PythonOperator(task_id='ingest', python_callable=ingest_fn)
    validate = PythonOperator(task_id='validate', python_callable=validate_fn)
    ingest >> validate   # set dependency: ingest must complete before validate

# ── schedule_interval examples ────────────────────────────────────────
# '@daily'           → '0 0 * * *'   midnight UTC
# '@hourly'          → '0 * * * *'
# '@weekly'          → '0 0 * * 0'
# None               → manual trigger only
# timedelta(hours=6) → every 6 hours from start_date
# '0 */4 * * *'      → every 4 hours

# ── Jinja templating (execution date macros) ──────────────────────────
# {{ ds }}           → execution date as YYYY-MM-DD
# {{ ds_nodash }}    → YYYYMMDD
# {{ execution_date }} → pendulum datetime object
# {{ prev_ds }}      → previous execution date
# {{ next_ds }}      → next execution date
# {{ run_id }}       → unique run identifier`}
          </CodeBlock>
          <Quiz topicId="airflow-dag" questions={[
            {
              question: "Why should you never use datetime.now() for start_date in a DAG?",
              options: [
                "It causes a syntax error in Airflow",
                "start_date is evaluated at import time on every scheduler heartbeat. datetime.now() produces a moving target, causing the scheduler to constantly recalculate the schedule and potentially create infinite DAG runs or miss schedules entirely. Always use a fixed past date.",
                "datetime.now() returns UTC but Airflow uses local time",
                "It is only a performance issue, not a correctness issue",
              ],
              correct: 1,
            },
            {
              question: "What does catchup=False do?",
              options: [
                "Disables automatic retries on task failure",
                "Prevents Airflow from creating historical DAG runs for all intervals between start_date and now when the DAG is first deployed or unpaused  -  avoids an accidental mass backfill that can flood your cluster",
                "Disables the webserver from showing old runs",
                "Stops the scheduler from running the DAG more than once",
              ],
              correct: 1,
            },
            {
              question: "What is the purpose of max_active_runs=1?",
              options: [
                "Limits each task to 1 retry",
                "Prevents multiple instances of the same DAG from running concurrently  -  critical for pipelines that write to the same tables to avoid race conditions and duplicate data",
                "Runs only 1 task at a time within the DAG",
                "Limits the DAG to 1 worker",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-dag')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── CORE OPERATORS ─── */}
        <section id="airflow-operators" ref={ref('airflow-operators')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">Core Operators</h1>
            <p className="topic-desc">
              Operators are the building blocks of a DAG  -  each operator becomes one task. <code>PythonOperator</code> runs a Python callable. <code>BashOperator</code> runs a shell command. <code>EmailOperator</code> sends email alerts. <code>DummyOperator</code>/<code>EmptyOperator</code> (2.4+) creates structural nodes for grouping or fanout. <code>BranchPythonOperator</code> enables conditional logic by returning the task_id(s) to execute next  -  all other branches are skipped.
            </p>
          </div>
          <CodeBlock lang="python">{`from airflow.operators.python  import PythonOperator, BranchPythonOperator
from airflow.operators.bash    import BashOperator
from airflow.operators.email   import EmailOperator
from airflow.operators.empty   import EmptyOperator   # Airflow 2.4+ (was DummyOperator)

# ── PythonOperator ────────────────────────────────────────────────────
def process_orders(**context):
    """Access execution date via context['ds'] or ti (TaskInstance)."""
    execution_date = context['ds']          # '2024-06-15'
    ti = context['ti']                      # TaskInstance object
    previous_result = ti.xcom_pull(task_ids='extract', key='row_count')
    print(f"Processing {previous_result} rows for {execution_date}")

process = PythonOperator(
    task_id         = 'process_orders',
    python_callable = process_orders,
    op_kwargs       = {'env': 'production'},   # passed as keyword args
    provide_context = True,                    # inject context dict (Airflow 1.x; auto in 2.x)
)

# ── BashOperator ──────────────────────────────────────────────────────
dbt_run = BashOperator(
    task_id      = 'dbt_run_silver',
    bash_command = 'dbt run --profiles-dir /opt/dbt --models silver.* --target prod',
    env          = {'DBT_PROFILES_DIR': '/opt/dbt'},
    cwd          = '/opt/dbt',
)

# ── BranchPythonOperator ──────────────────────────────────────────────
def choose_branch(**context):
    """Return task_id of the branch to execute."""
    day_of_week = context['execution_date'].day_of_week   # 0=Monday
    if day_of_week == 6:   # Sunday
        return 'weekly_aggregation'
    return 'daily_aggregation'

branch = BranchPythonOperator(
    task_id         = 'check_schedule_type',
    python_callable = choose_branch,
)

daily_agg  = EmptyOperator(task_id='daily_aggregation')
weekly_agg = EmptyOperator(task_id='weekly_aggregation')
join       = EmptyOperator(task_id='join', trigger_rule='none_failed_min_one_success')

branch >> [daily_agg, weekly_agg] >> join

# ── EmailOperator ─────────────────────────────────────────────────────
notify = EmailOperator(
    task_id  = 'send_completion_email',
    to       = ['stakeholders@company.com'],
    subject  = 'Pipeline {{ ds }} completed successfully',
    html_content = '<h3>Silver orders pipeline finished for {{ ds }}</h3>',
)

# ── trigger_rule options ──────────────────────────────────────────────
# 'all_success'  (default)  -  all upstream tasks succeeded
# 'all_failed'               -  all upstream tasks failed
# 'all_done'                -  all upstream tasks done (any state)
# 'one_success'             -  at least one upstream succeeded
# 'none_failed'             -  no upstream task failed (success or skipped)
# 'none_failed_min_one_success'  -  used after BranchPythonOperator joins`}
          </CodeBlock>
          <Quiz topicId="airflow-operators" questions={[
            {
              question: "What does BranchPythonOperator return to control flow?",
              options: [
                "A boolean True/False",
                "The task_id (or list of task_ids) of the downstream branch(es) to execute  -  all other downstream tasks are automatically set to 'Skipped' state",
                "An integer exit code",
                "A DAG object reference",
              ],
              correct: 1,
            },
            {
              question: "Why use EmptyOperator (DummyOperator) in a DAG?",
              options: [
                "To sleep for a specified duration",
                "To create structural fanout/fan-in points  -  e.g., a single join node after a BranchPythonOperator split, or a start/end marker. It completes immediately with no side effects.",
                "To mark tasks as optional",
                "To send a null value via XCom",
              ],
              correct: 1,
            },
            {
              question: "When using BranchPythonOperator with a join node, what trigger_rule should the join task use?",
              options: [
                "all_success  -  waits for all branches",
                "none_failed_min_one_success  -  allows the join to proceed when some branches are skipped (as they will be after branching) while ensuring at least one branch succeeded",
                "all_done  -  proceeds regardless of failures",
                "one_success  -  proceeds on first success",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-operators')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── SPARK & DATABRICKS OPERATORS ─── */}
        <section id="airflow-spark" ref={ref('airflow-spark')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">Spark &amp; Databricks Operators</h1>
            <p className="topic-desc">
              For data engineering workflows, Airflow frequently submits jobs to Spark clusters or Databricks. <code>SparkSubmitOperator</code> submits a jar/Python file to a YARN/Standalone cluster via spark-submit. <code>SparkSqlOperator</code> runs SQL on Spark Thrift Server. <code>DatabricksRunNowOperator</code> triggers an existing Databricks Job by job_id. <code>DatabricksSubmitRunOperator</code> creates and runs a one-off Databricks job run (notebook or Python script). <code>SimpleHttpOperator</code>/<code>HttpOperator</code> calls REST APIs and is useful for triggering external systems.
            </p>
          </div>
          <CodeBlock lang="python">{`from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from airflow.providers.apache.spark.operators.spark_sql   import SparkSqlOperator
from airflow.providers.databricks.operators.databricks    import (
    DatabricksRunNowOperator, DatabricksSubmitRunOperator
)
from airflow.providers.http.operators.http import SimpleHttpOperator

# ── SparkSubmitOperator ───────────────────────────────────────────────
spark_job = SparkSubmitOperator(
    task_id             = 'process_silver_orders',
    conn_id             = 'spark_default',           # Airflow connection
    application         = '/opt/spark-jobs/silver_orders.py',
    name                = 'silver_orders_{{ ds_nodash }}',
    packages            = 'io.delta:delta-core_2.12:2.4.0',
    conf                = {
        'spark.executor.memory':        '8g',
        'spark.executor.cores':         '4',
        'spark.sql.adaptive.enabled':   'true',
    },
    application_args    = ['--date', '{{ ds }}', '--env', 'production'],
    executor_cores      = 4,
    executor_memory     = '8g',
    num_executors       = 10,
)

# ── DatabricksRunNowOperator (trigger existing job) ────────────────────
trigger_databricks = DatabricksRunNowOperator(
    task_id        = 'run_databricks_job',
    databricks_conn_id = 'databricks_default',
    job_id         = 12345,                     # Databricks Job ID
    notebook_params = {'execution_date': '{{ ds }}', 'env': 'prod'},
    polling_period_seconds = 30,
)

# ── DatabricksSubmitRunOperator (one-off run) ──────────────────────────
submit_run = DatabricksSubmitRunOperator(
    task_id         = 'databricks_one_off',
    databricks_conn_id = 'databricks_default',
    new_cluster     = {
        'spark_version':  '13.3.x-scala2.12',
        'node_type_id':   'Standard_DS3_v2',
        'num_workers':    4,
    },
    notebook_task   = {
        'notebook_path':   '/Repos/prod/silver_pipeline',
        'base_parameters': {'env': 'production', 'date': '{{ ds }}'},
    },
    polling_period_seconds = 60,
)

# ── SimpleHttpOperator (REST API trigger) ─────────────────────────────
trigger_api = SimpleHttpOperator(
    task_id         = 'trigger_downstream_api',
    http_conn_id    = 'downstream_api',
    endpoint        = '/api/v1/pipeline/trigger',
    method          = 'POST',
    data            = '{"date": "{{ ds }}", "pipeline": "orders"}',
    headers         = {'Content-Type': 'application/json'},
    response_check  = lambda response: response.status_code == 202,
    log_response    = True,
)`}
          </CodeBlock>
          <Quiz topicId="airflow-spark" questions={[
            {
              question: "What is the difference between DatabricksRunNowOperator and DatabricksSubmitRunOperator?",
              options: [
                "They are identical",
                "RunNowOperator triggers an existing pre-configured Databricks Job by job_id. SubmitRunOperator creates a one-off run with a new cluster definition  -  useful for dynamic parameterization but creates a new cluster each time (slower, costlier).",
                "RunNowOperator runs on the Airflow worker, SubmitRunOperator runs on Databricks",
                "SubmitRunOperator requires Databricks Runtime 12+",
              ],
              correct: 1,
            },
            {
              question: "What does application_args do in SparkSubmitOperator?",
              options: [
                "Sets Spark executor arguments",
                "Passes command-line arguments to your PySpark script  -  accessible via sys.argv or argparse. Use Jinja templates like {{ ds }} to inject the execution date dynamically.",
                "Configures the Spark application name",
                "Sets memory and core allocations",
              ],
              correct: 1,
            },
            {
              question: "Why use response_check in SimpleHttpOperator?",
              options: [
                "It is required for all HTTP operators",
                "It validates the API response and marks the task as failed if the check returns False  -  critical for async triggers where a 200 OK might indicate 'received' but not 'succeeded'",
                "It logs the response body to the Airflow metadata DB",
                "It retries the HTTP call if the response is empty",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-spark')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── SENSORS ─── */}
        <section id="airflow-sensors" ref={ref('airflow-sensors')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">Sensors</h1>
            <p className="topic-desc">
              Sensors are special operators that wait for a condition to be true before proceeding. <code>FileSensor</code> waits for a file/directory to appear. <code>S3KeySensor</code> waits for an S3 key (exact or wildcard). <code>SqlSensor</code> runs a SQL query and waits until it returns a non-zero result. <code>ExternalTaskSensor</code> waits for a task in another DAG to succeed. Key parameters: <code>poke_interval</code> (seconds between checks), <code>timeout</code> (max seconds to wait  -  raises <code>AirflowSensorTimeout</code> if exceeded), <code>mode</code> ('poke' keeps the worker slot busy; 'reschedule' releases the slot between checks  -  always use 'reschedule' in production).
            </p>
          </div>
          <CodeBlock lang="python">{`from airflow.sensors.filesystem           import FileSensor
from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor
from airflow.sensors.sql                  import SqlSensor
from airflow.sensors.external_task        import ExternalTaskSensor

# ── FileSensor ────────────────────────────────────────────────────────
wait_for_file = FileSensor(
    task_id        = 'wait_for_landing_file',
    filepath       = '/data/landing/orders_{{ ds_nodash }}.csv',
    fs_conn_id     = 'fs_default',
    poke_interval  = 60,           # check every 60 seconds
    timeout        = 3600,         # fail after 1 hour
    mode           = 'reschedule', # ← ALWAYS use this in production!
    soft_fail      = False,        # True → skip instead of fail on timeout
)

# ── S3KeySensor ───────────────────────────────────────────────────────
wait_for_s3 = S3KeySensor(
    task_id        = 'wait_for_s3_landing',
    bucket_name    = 'my-data-lake',
    bucket_key     = 'landing/orders/{{ ds_nodash }}/_SUCCESS',
    aws_conn_id    = 'aws_default',
    poke_interval  = 120,
    timeout        = 7200,
    mode           = 'reschedule',
)

# ── SqlSensor ─────────────────────────────────────────────────────────
wait_for_upstream = SqlSensor(
    task_id        = 'wait_for_upstream_data',
    conn_id        = 'postgres_default',
    sql            = """
        SELECT COUNT(*)
        FROM pipeline_status
        WHERE pipeline_date = '{{ ds }}'
          AND status = 'completed'
          AND pipeline_name = 'bronze_ingest'
    """,
    poke_interval  = 300,    # 5 minutes
    timeout        = 14400,  # 4 hours
    mode           = 'reschedule',
)

# ── ExternalTaskSensor ────────────────────────────────────────────────
wait_for_bronze = ExternalTaskSensor(
    task_id              = 'wait_for_bronze_pipeline',
    external_dag_id      = 'bronze_ingest',
    external_task_id     = 'validate_schema',    # None → wait for whole DAG
    allowed_states       = ['success'],
    execution_delta      = timedelta(hours=0),   # same execution date
    # execution_date_fn  = lambda dt: dt         # custom mapping fn
    poke_interval        = 120,
    timeout              = 7200,
    mode                 = 'reschedule',
)

# ── mode comparison ───────────────────────────────────────────────────
# mode='poke':       Holds worker slot while waiting. Simple but wastes
#                    resources. OK for short waits (< 5 min).
# mode='reschedule': Releases worker slot between pokes. Scheduler
#                    reschedules the sensor task each interval.
#                    REQUIRED for long waits in production.`}
          </CodeBlock>
          <Quiz topicId="airflow-sensors" questions={[
            {
              question: "Why should you use mode='reschedule' for sensors in production?",
              options: [
                "It is faster than poke mode",
                "mode='poke' holds the Celery/K8s worker slot the entire time the sensor waits. With many concurrent sensors, this exhausts your worker pool. mode='reschedule' releases the slot between checks, allowing other tasks to use it.",
                "reschedule mode has lower poke_interval",
                "poke mode does not support S3KeySensor",
              ],
              correct: 1,
            },
            {
              question: "What happens when a sensor exceeds its timeout parameter?",
              options: [
                "The sensor retries indefinitely",
                "Airflow raises AirflowSensorTimeout and marks the task as failed (or skipped if soft_fail=True). Downstream tasks dependent on this sensor will not run.",
                "The sensor switches to poke mode automatically",
                "The DAG is paused",
              ],
              correct: 1,
            },
            {
              question: "When would you use ExternalTaskSensor over SqlSensor?",
              options: [
                "When the external pipeline uses a different database",
                "When you want to wait for a specific task in another Airflow DAG to succeed  -  ExternalTaskSensor uses the Airflow metadata DB directly and is aware of DAG run states. SqlSensor is for waiting on custom database conditions (e.g., a status table updated by non-Airflow processes).",
                "ExternalTaskSensor is always preferable",
                "When the external DAG runs on a different scheduler",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-sensors')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── TASKFLOW API ─── */}
        <section id="airflow-taskflow" ref={ref('airflow-taskflow')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">TaskFlow API</h1>
            <p className="topic-desc">
              The TaskFlow API (Airflow 2.0+) uses the <code>@task</code> decorator to define tasks as Python functions. XComs are passed automatically between <code>@task</code> functions  -  return values become XCom outputs, function parameters become XCom inputs. <code>@task.branch</code> replaces <code>BranchPythonOperator</code>. <code>@task_group</code> replaces <code>TaskGroup</code> context manager for grouping tasks visually. Dynamic task mapping with <code>.expand()</code> allows creating N tasks at runtime based on input data.
            </p>
          </div>
          <CodeBlock lang="python">{`from airflow.decorators import dag, task, task_group
from datetime import datetime

@dag(schedule_interval='@daily', start_date=datetime(2024, 1, 1), catchup=False)
def orders_pipeline():

    # ── @task: auto XCom passing ──────────────────────────────────────
    @task
    def extract() -> dict:
        """Return value automatically pushed to XCom."""
        return {'row_count': 1_000_000, 'source': 's3://my-bucket/orders/'}

    @task
    def validate(stats: dict) -> bool:
        """stats parameter auto-pulled from extract's XCom output."""
        if stats['row_count'] < 100:
            raise ValueError(f"Too few rows: {stats['row_count']}")
        return True

    @task
    def transform(stats: dict, is_valid: bool) -> str:
        """Multiple upstream XComs injected as parameters."""
        return f"Transformed {stats['row_count']} rows"

    # ── @task.branch: conditional routing ────────────────────────────
    @task.branch
    def choose_load_strategy(stats: dict) -> str:
        if stats['row_count'] > 500_000:
            return 'bulk_load'
        return 'incremental_load'

    @task
    def bulk_load(): print("Bulk load path")

    @task
    def incremental_load(): print("Incremental load path")

    # ── @task_group: visual grouping ──────────────────────────────────
    @task_group(group_id='data_quality_checks')
    def quality_checks(result: str):
        @task
        def check_nulls(): print("Checking nulls...")

        @task
        def check_row_counts(): print("Checking row counts...")

        @task
        def check_schema(): print("Checking schema...")

        check_nulls()
        check_row_counts()
        check_schema()

    # ── Dynamic task mapping with .expand() ───────────────────────────
    @task
    def get_tables() -> list:
        return ['orders', 'customers', 'products', 'inventory']

    @task
    def process_table(table_name: str) -> str:
        print(f"Processing {table_name}")
        return f"{table_name}_processed"

    # Wire the DAG:
    stats = extract()
    valid = validate(stats)
    result = transform(stats, valid)

    branch = choose_load_strategy(stats)
    bulk_load_task = bulk_load()
    incr_load_task = incremental_load()
    branch >> [bulk_load_task, incr_load_task]

    quality_checks(result)

    tables = get_tables()
    # Dynamically creates one process_table task per table at runtime:
    process_table.expand(table_name=tables)

dag_instance = orders_pipeline()`}
          </CodeBlock>
          <Quiz topicId="airflow-taskflow" questions={[
            {
              question: "How does XCom passing work with @task decorated functions?",
              options: [
                "You must call ti.xcom_push() and ti.xcom_pull() explicitly",
                "The return value of a @task function is automatically pushed to XCom. Downstream @task functions that accept the return value as a parameter automatically pull it from XCom  -  no explicit push/pull code needed.",
                "XComs must be serialized to JSON manually",
                "@task functions cannot share data between tasks",
              ],
              correct: 1,
            },
            {
              question: "What does .expand() do in TaskFlow API?",
              options: [
                "Expands the DAG to show all nested task groups",
                "Enables dynamic task mapping  -  creates N task instances at runtime where N is the length of the input list. Each element is processed by a separate task instance in parallel.",
                "Increases the task's memory allocation",
                "Expands XCom data from a list to individual values",
              ],
              correct: 1,
            },
            {
              question: "What replaces SubDagOperator in Airflow 2.x?",
              options: [
                "NestedDagOperator",
                "@task_group  -  groups tasks visually in the UI and logically in the DAG without the performance and debugging problems of SubDAGs. SubDagOperator was deprecated in 2.0 and removed in 2.7.",
                "ExternalTaskSensor",
                "BranchPythonOperator with EmptyOperators",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-taskflow')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── XCOMS ─── */}
        <section id="airflow-xcoms" ref={ref('airflow-xcoms')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">XComs</h1>
            <p className="topic-desc">
              XComs (Cross-Communications) allow tasks to exchange small amounts of data via the Airflow metadata database. A task pushes a value with <code>ti.xcom_push(key, value)</code> and another pulls it with <code>ti.xcom_pull(task_ids, key)</code>. With TaskFlow API, this is automatic. XComs are stored in the metadata DB  -  this creates a critical constraint: XComs are for metadata only (IDs, counts, status strings, small config dicts). Never push large DataFrames, file contents, or binary data through XComs. For large data, write to S3/ADLS/Delta and pass only the path via XCom.
            </p>
          </div>
          <CodeBlock lang="python">{`# ── Manual XCom push/pull (classic operators) ─────────────────────────
def extract_fn(**context):
    ti = context['ti']
    # ... extract data, write to S3 ...
    row_count = 1_000_000
    s3_path   = 's3://my-lake/bronze/orders/2024-06-15/'
    # Push metadata  -  NOT the data itself:
    ti.xcom_push(key='row_count',   value=row_count)
    ti.xcom_push(key='output_path', value=s3_path)

def transform_fn(**context):
    ti = context['ti']
    row_count = ti.xcom_pull(task_ids='extract', key='row_count')
    s3_path   = ti.xcom_pull(task_ids='extract', key='output_path')
    print(f"Transforming {row_count} rows from {s3_path}")

# ── XCom via return value (auto-push with key='return_value') ─────────
def get_config(**context):
    return {'date': context['ds'], 'env': 'production'}   # auto-pushed

def use_config(**context):
    ti     = context['ti']
    config = ti.xcom_pull(task_ids='get_config')   # key defaults to 'return_value'
    print(config)

# ── XCom in Jinja templates ───────────────────────────────────────────
bash_task = BashOperator(
    task_id      = 'print_count',
    bash_command = 'echo "Processed: {{ ti.xcom_pull(task_ids=\\"extract\\", key=\\"row_count\\") }}"',
)

# ── Best practices ────────────────────────────────────────────────────
# ✅ DO:    Push small metadata: IDs, counts, paths, status strings, config
# ✅ DO:    Use XComs to pass S3/ADLS paths between tasks
# ✅ DO:    Use TaskFlow @task for automatic XCom management
# ❌ DON'T: Push pandas DataFrames (can be gigabytes → crashes metadata DB)
# ❌ DON'T: Push Spark DataFrames (not serializable)
# ❌ DON'T: Push file contents or binary data
# ❌ DON'T: Use XComs as a message queue (use proper queuing systems)

# ── XCom backend alternatives ─────────────────────────────────────────
# For larger objects, configure a custom XCom backend (S3/GCS):
# airflow.cfg: [core] xcom_backend = custom_xcom_backend.S3XComBackend
# This stores the actual data in object storage and keeps only the
# reference in the metadata DB  -  but this still isn't for DataFrames.`}
          </CodeBlock>
          <Quiz topicId="airflow-xcoms" questions={[
            {
              question: "What is the fundamental rule about what to store in XComs?",
              options: [
                "XComs can store any Python-serializable object up to 1 GB",
                "XComs store only metadata  -  file paths, row counts, IDs, status strings. The metadata DB has limited capacity and XCom values are loaded into memory. Store actual data in S3/Delta/ADLS and pass only the location via XCom.",
                "XComs should store DataFrames up to 100 MB",
                "XComs are only for string values",
              ],
              correct: 1,
            },
            {
              question: "What happens when you return a value from a PythonOperator callable?",
              options: [
                "The value is discarded",
                "The return value is automatically pushed to XCom with key='return_value'. Downstream tasks can retrieve it with ti.xcom_pull(task_ids='upstream_task_id') without specifying a key.",
                "The value raises a TypeError if not serializable",
                "The value is logged but not stored",
              ],
              correct: 1,
            },
            {
              question: "Why is XCom data visible in the Airflow UI?",
              options: [
                "For debugging only  -  XCom values are stored in the metadata DB and displayed in Admin > XComs",
                "Because XComs use shared memory",
                "XComs are stored in S3 by default",
                "XComs are shown only in task logs",
              ],
              correct: 0,
            },
          ]} />
          <button onClick={mc('airflow-xcoms')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── CONNECTIONS & HOOKS ─── */}
        <section id="airflow-connections" ref={ref('airflow-connections')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">Connections &amp; Hooks</h1>
            <p className="topic-desc">
              Connections store credentials and endpoint URLs for external systems (databases, cloud storage, APIs, Spark clusters). They are managed in the Airflow UI (Admin &gt; Connections) or via environment variables (<code>AIRFLOW_CONN_{"{CONN_ID}"}</code>). Hooks are the Python interface for connections  -  they handle authentication and provide high-level methods. <code>PostgresHook</code>, <code>S3Hook</code>, <code>HttpHook</code>, <code>SparkHook</code>. When building custom integrations, create a custom Hook that extends <code>BaseHook</code>.
            </p>
          </div>
          <CodeBlock lang="python">{`from airflow.hooks.base          import BaseHook
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.providers.amazon.aws.hooks.s3     import S3Hook
from airflow.providers.http.hooks.http         import HttpHook

# ── PostgresHook ──────────────────────────────────────────────────────
def query_postgres(**context):
    hook = PostgresHook(postgres_conn_id='postgres_default')
    # Run SQL and get records:
    records = hook.get_records("SELECT order_id, amount FROM orders WHERE date = %s", [context['ds']])
    # Or get a pandas DataFrame:
    df = hook.get_pandas_df("SELECT * FROM orders LIMIT 1000")
    # Run DML:
    hook.run("UPDATE pipeline_status SET status='done' WHERE date=%s", parameters=[context['ds']])

# ── S3Hook ────────────────────────────────────────────────────────────
def upload_to_s3(**context):
    s3 = S3Hook(aws_conn_id='aws_default')
    s3.load_file(
        filename    = '/tmp/orders_processed.parquet',
        key         = f'silver/orders/{context["ds_nodash"]}/output.parquet',
        bucket_name = 'my-data-lake',
        replace     = True,
    )
    # Check key exists:
    exists = s3.check_for_key('silver/orders/_SUCCESS', bucket_name='my-data-lake')

# ── Environment variable connections (for CI/CD/secrets managers) ─────
# Instead of storing in the DB, set env vars:
# AIRFLOW_CONN_POSTGRES_DEFAULT=postgresql://user:pass@host:5432/db
# AIRFLOW_CONN_AWS_DEFAULT=aws://access_key:secret@?region_name=us-east-1
# AIRFLOW_CONN_SPARK_DEFAULT=spark://spark-master:7077

# ── Custom Hook ────────────────────────────────────────────────────────
from airflow.hooks.base import BaseHook
import requests

class DataQualityApiHook(BaseHook):
    conn_name_attr = 'dq_api_conn_id'
    default_conn_name = 'dq_api_default'
    conn_type = 'http'
    hook_name = 'Data Quality API'

    def __init__(self, dq_api_conn_id: str = default_conn_name):
        super().__init__()
        self.dq_api_conn_id = dq_api_conn_id

    def get_conn(self):
        conn = self.get_connection(self.dq_api_conn_id)
        return requests.Session()

    def run_check(self, table: str, date: str) -> dict:
        conn = self.get_connection(self.dq_api_conn_id)
        session = self.get_conn()
        response = session.post(
            f'http://{conn.host}:{conn.port}/api/check',
            json={'table': table, 'date': date},
            headers={'Authorization': f'Bearer {conn.password}'},
        )
        response.raise_for_status()
        return response.json()`}
          </CodeBlock>
          <Quiz topicId="airflow-connections" questions={[
            {
              question: "What is the recommended way to store Airflow connections in a production Kubernetes deployment?",
              options: [
                "Store credentials directly in DAG Python files",
                "Use environment variables (AIRFLOW_CONN_{CONN_ID}) or a secrets backend (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault). This keeps credentials out of the metadata DB and DAG files, and integrates with your existing secrets management.",
                "Store in the Airflow UI connections page only",
                "Hardcode in airflow.cfg",
              ],
              correct: 1,
            },
            {
              question: "What is the difference between a Connection and a Hook in Airflow?",
              options: [
                "They are the same thing",
                "A Connection is the credential/endpoint configuration (stored in DB or env vars). A Hook is the Python class that uses a Connection to provide a high-level API  -  e.g., PostgresHook.get_pandas_df() handles connection pooling, cursor management, and result serialization.",
                "Hooks are only for cloud providers",
                "Connections are only for databases",
              ],
              correct: 1,
            },
            {
              question: "What format does AIRFLOW_CONN_* environment variable use?",
              options: [
                "JSON format only",
                "URI format: scheme://user:password@host:port/schema?param=value. For example: postgresql://user:pass@localhost:5432/mydb or aws://access_key:secret@?region_name=us-east-1",
                "YAML format",
                "Python dict format",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-connections')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── KUBERNETES EXECUTOR ─── */}
        <section id="airflow-k8s" ref={ref('airflow-k8s')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">Kubernetes Executor</h1>
            <p className="topic-desc">
              The KubernetesExecutor spins up a dedicated pod for each task. No persistent workers  -  the scheduler creates a pod when a task is ready, the pod runs the task and terminates. This provides perfect isolation, independent resource allocation per task, and eliminates noisy-neighbor problems. <code>KubernetesPodOperator</code> runs an arbitrary Docker image in a pod  -  essential for tasks requiring custom dependencies. Configure resource requests/limits, secrets, volume mounts, and image pull policies.
            </p>
          </div>
          <CodeBlock lang="python">{`from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator
from kubernetes.client import models as k8s

# ── KubernetesPodOperator ─────────────────────────────────────────────
run_spark_job = KubernetesPodOperator(
    task_id             = 'run_spark_batch',
    name                = 'spark-batch-{{ ds_nodash }}',
    namespace           = 'airflow',
    image               = 'my-registry.io/spark-jobs:v1.2.3',
    image_pull_policy   = 'IfNotPresent',
    image_pull_secrets  = [k8s.V1LocalObjectReference('registry-secret')],
    cmds                = ['python', '/app/silver_orders.py'],
    arguments           = ['--date', '{{ ds }}', '--env', 'prod'],

    # Resource requests and limits:
    container_resources = k8s.V1ResourceRequirements(
        requests = {'cpu': '2', 'memory': '4Gi'},
        limits   = {'cpu': '4', 'memory': '8Gi'},
    ),

    # Mount secrets as env vars:
    env_vars = [
        k8s.V1EnvVar(
            name = 'DB_PASSWORD',
            value_from = k8s.V1EnvVarSource(
                secret_key_ref = k8s.V1SecretKeySelector(
                    name='db-secrets', key='password'
                )
            )
        )
    ],

    # Volume mount (for shared PVC or ConfigMap):
    volumes = [
        k8s.V1Volume(
            name='dbt-profiles',
            config_map=k8s.V1ConfigMapVolumeSource(name='dbt-profiles-config')
        )
    ],
    volume_mounts = [
        k8s.V1VolumeMount(mount_path='/opt/dbt', name='dbt-profiles')
    ],

    # Executor config for per-task K8s customization with CeleryExecutor:
    # (Alternative to full KubernetesExecutor)
    executor_config = {
        'pod_override': k8s.V1Pod(
            spec=k8s.V1PodSpec(
                containers=[k8s.V1Container(
                    name='base',
                    resources=k8s.V1ResourceRequirements(
                        requests={'cpu': '1', 'memory': '2Gi'}
                    )
                )]
            )
        )
    },

    get_logs          = True,
    is_delete_operator_pod = True,   # clean up pod after completion
    in_cluster        = True,        # running inside K8s cluster
    startup_timeout_seconds = 300,
)`}
          </CodeBlock>
          <Quiz topicId="airflow-k8s" questions={[
            {
              question: "What is the key advantage of KubernetesExecutor over CeleryExecutor?",
              options: [
                "KubernetesExecutor is faster",
                "KubernetesExecutor creates one pod per task  -  perfect isolation, no shared workers, independent resource allocation per task, no noisy-neighbor problems. Tasks with different dependency requirements can use different images.",
                "KubernetesExecutor uses less memory",
                "KubernetesExecutor doesn't require a metadata DB",
              ],
              correct: 1,
            },
            {
              question: "What does is_delete_operator_pod=True do in KubernetesPodOperator?",
              options: [
                "Prevents the pod from being created",
                "Automatically deletes the pod after task completion (success or failure). Without this, completed pods accumulate and consume cluster resources. Always set to True in production.",
                "Deletes the entire namespace after the task",
                "Removes the pod's logs from Kubernetes",
              ],
              correct: 1,
            },
            {
              question: "How do you pass secrets to a KubernetesPodOperator without hardcoding them?",
              options: [
                "Set them in the DAG Python file as environment variables",
                "Reference Kubernetes Secrets via V1EnvVarSource with secret_key_ref  -  the secret value is injected at pod runtime from the K8s Secret object, never appearing in the DAG code or Airflow metadata.",
                "Store secrets in XCom",
                "Pass via command-line arguments",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-k8s')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── CI/CD & TESTING ─── */}
        <section id="airflow-cicd" ref={ref('airflow-cicd')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">CI/CD &amp; Testing</h1>
            <p className="topic-desc">
              Production Airflow deployments use the DAG factory pattern to generate many similar DAGs programmatically. DAGs are tested with pytest using <code>airflow.models.DagBag</code>. CI pipelines validate DAGs on every PR: import correctly, have no cycles, meet naming conventions. DAG versioning uses <code>version</code> tags or <code>doc_md</code>. Never deploy broken DAGs  -  a parsing error in one DAG file can impact the scheduler's ability to process other DAGs.
            </p>
          </div>
          <CodeBlock lang="python">{`# ── DAG Factory Pattern ───────────────────────────────────────────────
# dag_factory.py  -  generates one DAG per table config
import yaml
from datetime import datetime
from airflow import DAG
from airflow.operators.python import PythonOperator

def create_dag(config: dict) -> DAG:
    dag = DAG(
        dag_id            = f"silver_{config['table']}_daily",
        schedule_interval = config.get('schedule', '@daily'),
        start_date        = datetime(2024, 1, 1),
        catchup           = False,
        tags              = ['silver', config['domain']],
        default_args      = {'retries': 2, 'retry_delay': timedelta(minutes=5)},
    )
    with dag:
        PythonOperator(
            task_id         = 'process',
            python_callable = process_table,
            op_kwargs       = {'table': config['table'], 'schema': config['schema']},
        )
    return dag

# Load config from YAML:
with open('/opt/airflow/dags/config/tables.yaml') as f:
    table_configs = yaml.safe_load(f)

# Register all generated DAGs in global namespace:
for cfg in table_configs['tables']:
    dag_id = f"silver_{cfg['table']}_daily"
    globals()[dag_id] = create_dag(cfg)

# ── Testing with pytest ───────────────────────────────────────────────
# tests/test_dags.py
import pytest
from airflow.models import DagBag

@pytest.fixture(scope='session')
def dagbag():
    return DagBag(dag_folder='dags/', include_examples=False)

def test_no_import_errors(dagbag):
    """All DAG files must import without errors."""
    assert dagbag.import_errors == {}, \
        f"DAG import errors: {dagbag.import_errors}"

def test_dag_ids_exist(dagbag):
    """Core DAGs must be present."""
    required_dags = ['silver_orders_daily', 'bronze_ingest', 'gold_reporting']
    for dag_id in required_dags:
        assert dag_id in dagbag.dags, f"DAG {dag_id} not found"

def test_no_cycles(dagbag):
    """All DAGs must be acyclic."""
    for dag_id, dag in dagbag.dags.items():
        assert dag.test_cycle() is False, f"Cycle detected in {dag_id}"

def test_dag_retries(dagbag):
    """All tasks must have retries configured."""
    for dag_id, dag in dagbag.dags.items():
        for task in dag.tasks:
            assert task.retries >= 1, \
                f"Task {task.task_id} in {dag_id} has no retries"

# ── CI Pipeline (GitHub Actions) ─────────────────────────────────────
# .github/workflows/dag-validation.yml:
# - Install airflow + providers
# - Run: python -c "from airflow.models import DagBag; db = DagBag('dags/'); assert not db.import_errors"
# - Run: pytest tests/test_dags.py -v
# - Check DAG naming convention with a custom linter`}
          </CodeBlock>
          <Quiz topicId="airflow-cicd" questions={[
            {
              question: "What does DagBag do in Airflow testing?",
              options: [
                "It is a container for storing XCom values",
                "DagBag loads and parses all DAG files from a directory  -  it is the same mechanism the scheduler uses. In tests, you instantiate a DagBag pointing to your dags/ folder and assert that import_errors is empty, meaning all DAG files parsed successfully.",
                "It validates DAG run history",
                "It simulates task execution",
              ],
              correct: 1,
            },
            {
              question: "Why is the DAG factory pattern useful for data platform teams?",
              options: [
                "It avoids the need for default_args",
                "It generates many similar DAGs (e.g., one per table or per environment) from a configuration file (YAML/JSON). This eliminates copy-paste DAGs, ensures consistency, and allows adding a new pipeline by only editing config  -  no new Python files needed.",
                "It automatically sets schedules based on table size",
                "It replaces the Airflow scheduler",
              ],
              correct: 1,
            },
            {
              question: "Why is a DAG import error serious in production Airflow?",
              options: [
                "It only affects the specific broken DAG",
                "The scheduler processes all DAG files in the dags/ folder. A file with a syntax error or unresolvable import can cause the scheduler to log errors, slow down DAG file processing, and potentially impact the scheduling of unrelated DAGs. Always validate DAGs in CI before deploying.",
                "Import errors are automatically fixed by Airflow",
                "Import errors only affect the webserver",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-cicd')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── MONITORING & ALERTING ─── */}
        <section id="airflow-monitoring" ref={ref('airflow-monitoring')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">Monitoring &amp; Alerting</h1>
            <p className="topic-desc">
              Production Airflow requires comprehensive monitoring. SLA misses trigger <code>sla_miss_callback</code> when a task or DAG run exceeds its declared SLA. Task-level callbacks (<code>on_success_callback</code>, <code>on_failure_callback</code>, <code>on_retry_callback</code>) execute custom Python on state changes  -  use these for Slack/PagerDuty alerts. Airflow emits StatsD metrics (task duration, success/failure counts, scheduler heartbeat) which can be forwarded to Prometheus/Datadog.
            </p>
          </div>
          <CodeBlock lang="python">{`import json, urllib.request
from datetime import timedelta
from airflow import DAG

# ── Callback functions ────────────────────────────────────────────────
def on_failure_slack(context):
    """Send Slack alert on task failure."""
    dag_id   = context['dag'].dag_id
    task_id  = context['task_instance'].task_id
    exec_dt  = context['execution_date']
    log_url  = context['task_instance'].log_url
    payload  = {
        "text": f":red_circle: *Task Failed*\\n"
                f"DAG: \`{dag_id}\`\\n"
                f"Task: \`{task_id}\`\\n"
                f"Date: \`{exec_dt}\`\\n"
                f"<{log_url}|View Logs>"
    }
    req = urllib.request.Request(
        'https://hooks.slack.com/services/YOUR/WEBHOOK',
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json'},
    )
    urllib.request.urlopen(req)

def on_retry_log(context):
    """Log retry details."""
    ti = context['task_instance']
    print(f"Retry {ti.try_number} for {ti.task_id} at {context['execution_date']}")

# ── SLA miss callback ─────────────────────────────────────────────────
def sla_miss_callback(dag, task_list, blocking_task_list, slas, blocking_tis):
    print(f"SLA MISS on {dag.dag_id}: tasks {task_list}")

# ── Apply callbacks in DAG ────────────────────────────────────────────
default_args = {
    'retries':              2,
    'retry_delay':          timedelta(minutes=5),
    'on_failure_callback':  on_failure_slack,
    'on_retry_callback':    on_retry_log,
    'sla':                  timedelta(hours=2),   # per-task SLA
}

with DAG(
    dag_id            = 'silver_orders',
    schedule_interval = '@daily',
    start_date        = datetime(2024, 1, 1),
    default_args      = default_args,
    sla_miss_callback = sla_miss_callback,        # DAG-level SLA callback
    catchup           = False,
) as dag:
    ...

# ── Airflow StatsD metrics (airflow.cfg) ──────────────────────────────
# [metrics]
# statsd_on = True
# statsd_host = localhost
# statsd_port = 8125
# statsd_prefix = airflow
#
# Key metrics emitted:
# airflow.scheduler.heartbeat             -  scheduler alive check
# airflow.task.duration                   -  per task/dag_id/task_id
# airflow.task_instance.successes         -  success counter
# airflow.task_instance.failures          -  failure counter
# airflow.dag.loading_duration_<dag_id>   -  time to parse DAG file
# airflow.scheduler.tasks.starving        -  tasks waiting for workers

# ── Prometheus with statsd_exporter ──────────────────────────────────
# Deploy prometheus/statsd-exporter sidecar → scrape statsd metrics
# Grafana dashboard: alert when airflow_task_instance_failures > 0
# or airflow_scheduler_heartbeat stops incrementing.`}
          </CodeBlock>
          <Quiz topicId="airflow-monitoring" questions={[
            {
              question: "What is the difference between on_failure_callback and sla_miss_callback?",
              options: [
                "They are identical",
                "on_failure_callback fires when a task fails (exception or exit code != 0). sla_miss_callback fires when a task or DAG run exceeds its declared SLA duration  -  it is a warning about lateness, not failure. A slow-but-successful task triggers SLA miss but not failure callback.",
                "sla_miss_callback only works with EmailOperator",
                "on_failure_callback requires a Slack webhook",
              ],
              correct: 1,
            },
            {
              question: "How do you apply an on_failure_callback to all tasks in a DAG without setting it on each task individually?",
              options: [
                "Set it in airflow.cfg",
                "Set it in default_args  -  all tasks in the DAG inherit default_args values including callbacks. This is the standard production pattern for ensuring all tasks send alerts on failure.",
                "Use a DAG-level decorator",
                "Callbacks cannot be applied globally",
              ],
              correct: 1,
            },
            {
              question: "What does the airflow.scheduler.heartbeat metric indicate?",
              options: [
                "The number of tasks completed per second",
                "That the Airflow scheduler process is alive and running  -  if this metric stops incrementing, the scheduler has crashed or stalled. Alert immediately when heartbeat stops updating.",
                "The number of active DAG runs",
                "The scheduler's CPU usage",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-monitoring')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

        {/* ─── AIRFLOW VS DATABRICKS VS ADF ─── */}
        <section id="airflow-vs-databricks" ref={ref('airflow-vs-databricks')} className="topic-section">
          <div className="topic-header">
            <div className="topic-eyebrow">Level 9 - Apache Airflow</div>
            <h1 className="topic-title">Airflow vs Databricks Workflows vs ADF</h1>
            <p className="topic-desc">
              Choosing the right orchestration tool depends on your data platform, team, and complexity. Apache Airflow is the most flexible  -  code-first, any operator, any cloud, rich ecosystem. Databricks Workflows is tightly integrated with Databricks notebooks and jobs  -  best when your entire platform is Databricks. Azure Data Factory (ADF) is Azure-native with a GUI-first approach  -  great for simple ELT and Azure service integration. In practice, many production platforms use a hybrid: Airflow for complex cross-system orchestration, Databricks Workflows for Databricks-internal compute graphs, ADF for simple Azure data movements.
            </p>
          </div>
          <CodeBlock lang="yaml">{`# ── Comparison Matrix ─────────────────────────────────────────────────
tool: Apache Airflow
  strengths:
    - Code-first Python DAGs (version-controlled, testable, reusable)
    - 700+ providers (Spark, Databricks, dbt, GCP, AWS, Azure, Kubernetes)
    - Complex branching, dynamic task mapping, cross-system orchestration
    - Full extensibility: custom operators, hooks, sensors, backends
    - Multi-cloud and on-premises
  weaknesses:
    - Operational overhead (scheduler, workers, metadata DB, upgrades)
    - Learning curve for Kubernetes/Celery executor setup
    - No native Spark execution  -  submits jobs to external clusters
  best_for: Complex multi-system pipelines, code-first teams, multi-cloud

tool: Databricks Workflows
  strengths:
    - Zero ops  -  fully managed, runs in your Databricks workspace
    - Native notebook/Python/JAR/dbt task types
    - File arrival triggers, continuous mode, repair and re-run
    - Delta Live Tables integration (declarative streaming/batch pipelines)
    - Cost-efficient (uses existing cluster pools, serverless compute)
  weaknesses:
    - Databricks-only (cannot orchestrate non-Databricks systems natively)
    - Less flexible branching logic than Airflow
    - No cross-cloud orchestration
  best_for: All-Databricks shops, data teams without DevOps support

tool: Azure Data Factory (ADF)
  strengths:
    - GUI-first (drag-and-drop pipelines  -  accessible to non-engineers)
    - Native Azure integration (Blob, ADLS, Synapse, SQL DB, CosmosDB)
    - Managed IR (Integration Runtime) for on-premises connectivity
    - Built-in monitoring and alerting in Azure portal
    - Trigger types: schedule, tumbling window, event (blob arrival)
  weaknesses:
    - Not version-controlled by default (ARM templates are verbose)
    - Limited to Azure ecosystem for native connectors
    - Complex logic (loops, branching) is awkward in GUI
    - Expensive for high-frequency runs
  best_for: Azure-native orgs, simple ELT, non-technical pipeline builders

# ── Hybrid Pattern (Production) ───────────────────────────────────────
# Airflow DAG orchestrates the overall flow:
#   1. S3KeySensor: wait for landing file
#   2. DatabricksRunNowOperator: trigger bronze notebook
#   3. DatabricksRunNowOperator: trigger silver notebook
#   4. dbt BashOperator: run dbt gold models
#   5. SimpleHttpOperator: notify downstream API
#   6. EmailOperator: send stakeholder report
#
# Databricks Workflows for internal notebook chains:
#   bronze_ingest → silver_transform → data_quality_check
#   (all within Databricks, triggered by Airflow as a single job)`}
          </CodeBlock>
          <Quiz topicId="airflow-vs-databricks" questions={[
            {
              question: "When should you choose Databricks Workflows over Airflow?",
              options: [
                "Always  -  it is simpler",
                "When your entire data platform runs on Databricks and you want zero orchestration infrastructure overhead. Workflows is a fully managed scheduler that natively understands Databricks jobs, notebooks, and DLT pipelines  -  ideal for teams without DevOps support.",
                "When you need cross-cloud orchestration",
                "When you need more than 10 tasks in a pipeline",
              ],
              correct: 1,
            },
            {
              question: "What is a hybrid Airflow + Databricks pattern?",
              options: [
                "Running Airflow inside Databricks",
                "Airflow handles the outer orchestration (waiting for files, cross-system dependencies, notifications), while Databricks Workflows or DatabricksRunNowOperator handles the Databricks-internal compute chains. Each tool does what it's best at.",
                "Using ADF to trigger Airflow DAGs",
                "Replacing Airflow sensors with Databricks triggers",
              ],
              correct: 1,
            },
            {
              question: "What is the main operational advantage of Azure Data Factory over self-managed Airflow?",
              options: [
                "ADF has better Python support",
                "ADF is a fully managed service  -  no infrastructure to provision, scale, or maintain. No scheduler process to monitor, no metadata DB to manage, no worker upgrades. The tradeoff is less flexibility and Azure-only native connectors.",
                "ADF costs less than Airflow",
                "ADF supports more operators than Airflow",
              ],
              correct: 1,
            },
          ]} />
          <button onClick={mc('airflow-vs-databricks')} style={MC_BTN}>Mark Complete ✓</button>
        </section>

      </main>
    </div>
  )
}

// ─── ANIMATION COMPONENTS ────────────────────────────────────────────────────

function AirflowDagAnimation() {
  const [tick, setTick] = useState<number>(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 800)
    return () => clearInterval(id)
  }, [])

  // States: 0=idle, 1=queued, 2=running, 3=success
  // Timeline (tick-based):
  // start:              queued@0, running@1, success@2
  // extract_orders:     queued@3, running@4, success@5
  // extract_customers:  queued@3, running@4, success@5
  // transform:          queued@6, running@7, success@8
  // load:               queued@9, running@10, success@11
  // reset at tick 14

  const phase = tick % 14

  function getState(queued: number, running: number, success: number): 0 | 1 | 2 | 3 {
    if (phase >= success) return 3
    if (phase >= running) return 2
    if (phase >= queued) return 1
    return 0
  }

  const tasks = {
    start:             getState(0, 1, 2),
    extract_orders:    getState(3, 4, 5),
    extract_customers: getState(3, 4, 5),
    transform:         getState(6, 7, 8),
    load:              getState(9, 10, 11),
  }

  function stateColor(s: 0 | 1 | 2 | 3): string {
    if (s === 0) return '#94a3b8'
    if (s === 1) return '#3b82f6'
    if (s === 2) return '#f59e0b'
    return '#22c55e'
  }

  function stateLabel(s: 0 | 1 | 2 | 3): string {
    if (s === 0) return 'idle'
    if (s === 1) return 'queued'
    if (s === 2) return 'running'
    return 'success'
  }

  function TaskNode({ x, y, label, state }: { x: number; y: number; label: string; state: 0 | 1 | 2 | 3 }) {
    const color = stateColor(state)
    const isRunning = state === 2
    return (
      <g>
        <rect
          x={x - 55} y={y - 18} width={110} height={36} rx="8"
          fill="white" stroke={color} strokeWidth={isRunning ? 2.5 : 1.5}
        >
          {isRunning && (
            <animate attributeName="stroke-opacity" values="1;0.4;1" dur="0.9s" repeatCount="indefinite" />
          )}
        </rect>
        <text x={x} y={y - 4} textAnchor="middle" fill={color} fontSize="8" fontWeight="700">
          {label}
        </text>
        <text x={x} y={y + 10} textAnchor="middle" fill={color} fontSize="7">
          {stateLabel(state)}
        </text>
      </g>
    )
  }

  // Arrow helper
  function Arrow({ x1, y1, x2, y2, active }: { x1: number; y1: number; x2: number; y2: number; active: boolean }) {
    return (
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={active ? '#22c55e' : '#cbd5e1'}
        strokeWidth={active ? 2 : 1.5}
        strokeDasharray={active ? '5 3' : undefined}
        markerEnd="url(#arrowhead)"
      >
        {active && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="0.6s" repeatCount="indefinite" />}
      </line>
    )
  }

  return (
    <svg
      viewBox="0 0 700 280"
      style={{ width: '100%', maxHeight: 280, borderRadius: 'var(--radius-xl)', background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: 24 }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Title */}
      <text x="350" y="22" textAnchor="middle" fill="#0369a1" fontSize="11" fontWeight="700">
        Airflow DAG  -  Task State Progression
      </text>

      {/* Arrows */}
      {/* start → extract_orders */}
      <Arrow x1={350} y1={68} x2={215} y2={118} active={tasks.extract_orders >= 1} />
      {/* start → extract_customers */}
      <Arrow x1={350} y1={68} x2={485} y2={118} active={tasks.extract_customers >= 1} />
      {/* extract_orders → transform */}
      <Arrow x1={215} y1={154} x2={335} y2={188} active={tasks.transform >= 1} />
      {/* extract_customers → transform */}
      <Arrow x1={485} y1={154} x2={365} y2={188} active={tasks.transform >= 1} />
      {/* transform → load */}
      <Arrow x1={350} y1={224} x2={350} y2={238} active={tasks.load >= 1} />

      {/* Task nodes */}
      {/* start  -  top center */}
      <TaskNode x={350} y={50} label="start" state={tasks.start} />
      {/* extract_orders  -  middle left */}
      <TaskNode x={200} y={136} label="extract_orders" state={tasks.extract_orders} />
      {/* extract_customers  -  middle right */}
      <TaskNode x={500} y={136} label="extract_customers" state={tasks.extract_customers} />
      {/* transform  -  center */}
      <TaskNode x={350} y={206} label="transform" state={tasks.transform} />
      {/* load  -  bottom center */}
      <TaskNode x={350} y={256} label="load" state={tasks.load} />

      {/* Legend */}
      <rect x="30" y="248" width="10" height="10" rx="2" fill="#3b82f6" />
      <text x="44" y="258" fill="#475569" fontSize="8">Queued</text>
      <rect x="100" y="248" width="10" height="10" rx="2" fill="#f59e0b" />
      <text x="114" y="258" fill="#475569" fontSize="8">Running</text>
      <rect x="170" y="248" width="10" height="10" rx="2" fill="#22c55e" />
      <text x="184" y="258" fill="#475569" fontSize="8">Success</text>
    </svg>
  )
}
