export interface QuizAttempt {
  id: string
  quiz_id: string
  quiz_title: string
  quiz_icon: string
  quiz_color: string
  score: number
  total: number
  created_at: string
}

export interface DraftQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Question {
  id: number
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export interface Quiz {
  id: string
  user_id?: string
  title: string
  description: string
  category: string
  icon: string
  color: string
  cover_url?: string | null
  questions: Question[]
  time_limit_seconds?: number | null
}

