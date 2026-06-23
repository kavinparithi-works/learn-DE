export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation?: string
}

export interface LevelCard {
  id: string
  num: string
  title: string
  desc: string
  tags: string[]
  hours: string
  color: string
  path: string
}
