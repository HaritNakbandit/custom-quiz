"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Quiz } from "@/types/quizzes"

const supabase = createClient()

export function useQuizResults(id: string) {
  const searchParams = useSearchParams()
  const score = parseInt(searchParams.get("score") ?? "0")
  const total = parseInt(searchParams.get("total") ?? "1")
  const quizTitle = searchParams.get("title") ?? ""
  const answersParam = searchParams.get("answers") ?? ""
  const userAnswers = answersParam ? answersParam.split(",").map(Number) : []
  const percent = Math.round((score / total) * 100)

  const [quiz, setQuiz] = useState<Quiz | null>(null)

  useEffect(() => {
    supabase.from("quizzes").select("*").eq("id", id).single()
      .then(({ data }) => { if (data) setQuiz(data as Quiz) })
  }, [id])

  return { quiz, score, total, quizTitle, userAnswers, percent }
}
