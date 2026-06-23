import { useState } from 'react'
import { saveQuizScore } from '../lib/firebase'
import type { QuizQuestion } from '../lib/types'

interface Props {
  questions: QuizQuestion[]
  topicId: string
}

const CONFETTI_COLORS = ['#4f8ef7','#8b5cf6','#ec4899','#f59e0b','#22c55e','#06b6d4','#f97316']

function Confetti({ count = 28 }: { count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    left: `${(i * 3.7) % 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${(i * 0.06) % 1.4}s`,
    size: 6 + (i % 4) * 3,
    shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '4px',
  }))
  return (
    <div className="confetti-wrap">
      {pieces.map((p, i) => (
        <div key={i} className="confetti-piece" style={{
          left: p.left,
          background: p.color,
          width: p.size,
          height: p.size,
          borderRadius: p.shape,
          animationDelay: p.delay,
        }} />
      ))}
    </div>
  )
}

function getGrade(pct: number) {
  if (pct === 100) return { emoji: '🏆', label: 'Perfect Score!', msg: 'Absolutely flawless. You have mastered this topic.', stars: 5 }
  if (pct >= 80)  return { emoji: '🎯', label: 'Excellent!',      msg: 'Outstanding performance. You really know this material.', stars: 4 }
  if (pct >= 60)  return { emoji: '💪', label: 'Good Job!',       msg: 'Solid understanding. Review the missed ones to ace it.', stars: 3 }
  if (pct >= 40)  return { emoji: '📚', label: 'Keep Going!',     msg: 'You\'re building knowledge. Re-read the topic and retry.', stars: 2 }
  return          { emoji: '🔄', label: 'Try Again',              msg: 'Don\'t worry — every expert was once a beginner. Keep at it!', stars: 1 }
}

export default function Quiz({ questions, topicId }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [retryHover, setRetryHover] = useState(false)

  const answered = (qIdx: number, chosen: number) => {
    if (answers[qIdx] !== undefined) return
    const isCorrect = chosen === questions[qIdx].correct
    const newAnswers = { ...answers, [qIdx]: chosen }
    setAnswers(newAnswers)
    const newScore = score + (isCorrect ? 1 : 0)
    setScore(prev => prev + (isCorrect ? 1 : 0))
    const totalAnswered = Object.keys(newAnswers).length
    if (totalAnswered === questions.length) {
      saveQuizScore(topicId, newScore, questions.length)
      setTimeout(() => setDone(true), 700)
    }
  }

  const reset = () => {
    setAnswers({})
    setScore(0)
    setDone(false)
  }

  const totalAnswered = Object.keys(answers).length
  const progress = Math.round((totalAnswered / questions.length) * 100)
  const pct = Math.round((score / questions.length) * 100)
  const grade = getGrade(pct)

  if (done) {
    return (
      <div className="quiz-container">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: '100%' }} />
        </div>
        <div className="quiz-complete">
          {pct >= 80 && <Confetti />}
          {/* Emoji with pulsing ring behind it */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: '2px solid rgba(139,92,246,.3)',
              animation: 'glowPulse 2s ease-in-out infinite',
            }} />
            <span className="quiz-complete-emoji">{grade.emoji}</span>
          </div>
          {/* Huge gradient score number */}
          <div className="quiz-complete-grade" style={{
            fontSize: '4rem',
            fontWeight: 900,
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6,#ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-.04em',
            marginBottom: 4,
          }}>{pct}%</div>
          <div className="quiz-complete-label">{grade.label}</div>
          <div className="quiz-complete-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={`quiz-star${i < grade.stars ? ' lit' : ''}`}
                style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
            ))}
          </div>
          <div className="quiz-complete-msg">{grade.msg}</div>
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center',
            fontSize: '.84rem', color: 'rgba(255,255,255,.5)', marginBottom: 22,
          }}>
            <span style={{
              padding: '5px 14px', borderRadius: '9999px',
              background: 'rgba(34,197,94,.15)', color: '#4ade80',
              border: '1px solid rgba(34,197,94,.2)', fontWeight: 700,
            }}>✓ {score} correct</span>
            <span style={{
              padding: '5px 14px', borderRadius: '9999px',
              background: 'rgba(239,68,68,.12)', color: '#f87171',
              border: '1px solid rgba(239,68,68,.2)', fontWeight: 700,
            }}>✗ {questions.length - score} wrong</span>
          </div>
          {/* Gradient retry button */}
          <button
            className="quiz-retry-btn"
            onClick={reset}
            onMouseEnter={() => setRetryHover(true)}
            onMouseLeave={() => setRetryHover(false)}
            style={{
              background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
              border: 'none',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '.95rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              boxShadow: retryHover
                ? '0 8px 28px rgba(99,102,241,.45)'
                : '0 4px 20px rgba(99,102,241,.3)',
              transform: retryHover ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all .2s ease',
            }}
          >↺ Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-title">Knowledge Check</div>
        <div className="quiz-score-badge">{score} / {questions.length}</div>
      </div>
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="quiz-body">
        {questions.map((q, i) => {
          const userAnswer = answers[i]
          const isAnswered = userAnswer !== undefined

          return (
            <div key={i} className="quiz-question" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="quiz-q-text">
                {/* Gradient pill question number badge */}
                <span className="quiz-q-num" style={{
                  background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}>{i + 1}</span>
                {q.question}
              </div>
              <div className="quiz-options">
                {q.options.map((opt, j) => {
                  let cls = 'quiz-opt'
                  if (isAnswered) {
                    if (j === q.correct) cls += ' correct'
                    else if (j === userAnswer) cls += ' wrong'
                  }
                  return (
                    <button key={j} className={cls} disabled={isAnswered} onClick={() => answered(i, j)}>
                      {/* Colored circle letter badge */}
                      <span
                        className="quiz-opt-letter"
                        style={{
                          background: isAnswered && j === q.correct
                            ? 'rgba(34,197,94,.3)'
                            : isAnswered && j === userAnswer && j !== q.correct
                            ? 'rgba(239,68,68,.2)'
                            : 'rgba(255,255,255,.08)',
                        }}
                      >{String.fromCharCode(65 + j)}</span>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {isAnswered && (
                <div className={`quiz-feedback show ${userAnswer === q.correct ? 'correct' : 'wrong'}`}>
                  {userAnswer === q.correct
                    ? '✓ Correct! Well done.'
                    : `✗ The answer is ${String.fromCharCode(65 + q.correct)}${q.explanation ? ' — ' + q.explanation : ''}`}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
