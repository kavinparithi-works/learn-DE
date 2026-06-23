import { useState } from 'react'
import { saveQuizScore } from '../lib/firebase'
import type { QuizQuestion } from '../lib/types'

interface Props {
  questions: QuizQuestion[]
  topicId: string
}

export default function Quiz({ questions, topicId }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [score, setScore] = useState(0)

  const answered = (qIdx: number, chosen: number) => {
    if (answers[qIdx] !== undefined) return
    const correct = questions[qIdx].correct
    const isCorrect = chosen === correct
    const newAnswers = { ...answers, [qIdx]: chosen }
    setAnswers(newAnswers)
    const newScore = score + (isCorrect ? 1 : 0)
    setScore(prev => prev + (isCorrect ? 1 : 0))
    const totalAnswered = Object.keys(newAnswers).length
    if (totalAnswered === questions.length) {
      saveQuizScore(topicId, newScore, questions.length)
    }
  }

  const totalAnswered = Object.keys(answers).length
  const progress = Math.round((totalAnswered / questions.length) * 100)

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-title">Knowledge Check</div>
        <div className="quiz-score-badge">{score} / {questions.length}</div>
      </div>
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {questions.map((q, i) => {
        const userAnswer = answers[i]
        const isAnswered = userAnswer !== undefined

        return (
          <div key={i} className="quiz-question">
            <div className="quiz-q-text">{i + 1}. {q.question}</div>
            <div className="quiz-options">
              {q.options.map((opt, j) => {
                let cls = 'quiz-opt'
                if (isAnswered) {
                  if (j === q.correct) cls += ' correct'
                  else if (j === userAnswer) cls += ' wrong'
                }
                return (
                  <button key={j} className={cls} disabled={isAnswered} onClick={() => answered(i, j)}>
                    {String.fromCharCode(65 + j)}. {opt}
                  </button>
                )
              })}
            </div>
            {isAnswered && (
              <div className={`quiz-feedback show ${userAnswer === q.correct ? 'correct' : 'wrong'}`}>
                {userAnswer === q.correct
                  ? '✓ Correct!'
                  : `✗ Correct answer: ${String.fromCharCode(65 + q.correct)}${q.explanation ? ' - ' + q.explanation : ''}`}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
