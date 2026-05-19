"use client"

import { useState, useEffect } from "react"
import { Quiz, Question, DraftQuestion } from "@/data/quizzes"
import { validateQuizForm } from "@/lib/quizValidation"
import type { GeneratedResult } from "@/hooks/useAIQuizGeneration"

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

export function useQuizForm(initial?: Quiz | null) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [category, setCategory] = useState(initial?.category ?? "")
  const [icon, setIcon] = useState(initial?.icon ?? "BookOpen")
  const [color, setColor] = useState(initial?.color ?? "violet")
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    initial ? initial.questions.map(toDraftQuestion) : [emptyQuestion()]
  )
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | null>(initial?.time_limit_seconds ?? null)
  const [coverUrl, setCoverUrl] = useState<string | null>(initial?.cover_url ?? null)
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!initial) return
    setTitle(initial.title)
    setDescription(initial.description)
    setCategory(initial.category)
    setIcon(initial.icon)
    setColor(initial.color)
    setQuestions(initial.questions.map(toDraftQuestion))
    setTimeLimitSeconds(initial.time_limit_seconds ?? null)
    setCoverUrl(initial.cover_url ?? null)
    setPendingCoverFile(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id])

  function updateQuestion(qi: number, field: keyof DraftQuestion, value: string | number) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, [field]: value } : q)))
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q
      )
    )
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()])
  }

  function removeQuestion(qi: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== qi))
  }

  function handleAIApply(result: GeneratedResult, applyMeta = true) {
    if (applyMeta) {
      if (result.suggestedTitle && !title) setTitle(result.suggestedTitle)
      if (result.suggestedCategory && !category) setCategory(result.suggestedCategory)
    }
    setQuestions(result.questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
    })))
  }

  function validate(): string[] {
    const errs = validateQuizForm(title, category, questions)
    setErrors(errs)
    return errs
  }

  return {
    title, setTitle,
    description, setDescription,
    category, setCategory,
    icon, setIcon,
    color, setColor,
    questions,
    timeLimitSeconds, setTimeLimitSeconds,
    coverUrl, setCoverUrl,
    pendingCoverFile, setPendingCoverFile,
    errors, setErrors,
    saving, setSaving,
    updateQuestion, updateOption, addQuestion, removeQuestion,
    handleAIApply, validate,
  }
}
