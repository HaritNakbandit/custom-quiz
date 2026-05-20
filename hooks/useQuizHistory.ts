"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { QuizAttempt } from "@/types/quizzes"
export { formatAttemptDate } from "@/lib/dateUtils"
export type { QuizAttempt } from "@/types/quizzes"

const supabase = createClient()

export function useQuizHistory() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("quiz_attempts")
      .select("id, quiz_id, quiz_title, quiz_icon, quiz_color, score, total, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setAttempts(data as QuizAttempt[])
        setLoading(false)
      })
  }, [])

  return { attempts, loading }
}
