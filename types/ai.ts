export interface GeneratedQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface GeneratedResult {
  questions: GeneratedQuestion[]
  suggestedTitle?: string
  suggestedCategory?: string
}
