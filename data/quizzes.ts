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
  questions: Question[]
}

