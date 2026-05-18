import type { DraftQuestion } from "@/data/quizzes"

export function validateQuizForm(
  title: string,
  category: string,
  questions: DraftQuestion[]
): string[] {
  const errs: string[] = []
  if (!title.trim()) errs.push("กรุณาใส่ชื่อ quiz")
  if (!category.trim()) errs.push("กรุณาใส่ category")
  if (questions.length === 0) errs.push("กรุณาเพิ่มอย่างน้อย 1 คำถาม")
  questions.forEach((q, i) => {
    if (!q.question.trim()) errs.push(`คำถามที่ ${i + 1}: กรุณาใส่คำถาม`)
    if (q.options.some((o) => !o.trim())) errs.push(`คำถามที่ ${i + 1}: กรุณาใส่ตัวเลือกให้ครบ`)
  })
  return errs
}
