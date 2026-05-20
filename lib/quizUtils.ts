import type { DraftQuestion, Question } from "@/types/quizzes"

export function emptyQuestion(): DraftQuestion {
  return { question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }
}

export function toDraftQuestion(q: Question): DraftQuestion {
  return {
    question: q.question,
    options: [...q.options],
    correctIndex: q.correctIndex,
    explanation: q.explanation ?? "",
  }
}

export function toQuestion(q: DraftQuestion, id: number): Question {
  return {
    id,
    question: q.question.trim(),
    options: q.options.map((o) => o.trim()),
    correctIndex: q.correctIndex,
    explanation: q.explanation.trim() || undefined,
  }
}
