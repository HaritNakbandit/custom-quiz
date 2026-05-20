"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Quiz } from "@/types/quizzes"
import { createClient } from "@/lib/supabase/client"
export { formatTime } from "@/lib/dateUtils"

const supabase = createClient()

export function useQuizSession(id: string) {
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const timesUp = timeLeft === 0
  const submitRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    supabase.from("quizzes").select("*").eq("id", id).single()
      .then(({ data }) => {
        if (!data) return
        const q = data as Quiz
        setQuiz(q)
        setAnswers(new Array(q.questions.length).fill(null))
        if (q.time_limit_seconds) setTimeLeft(q.time_limit_seconds)
      })
  }, [id])

  useEffect(() => {
    if (timesUp) {
      submitRef.current?.()
      return
    }
    if (timeLeft === null) return
    const t = setTimeout(() => setTimeLeft((v) => (v !== null ? v - 1 : null)), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, timesUp])

  const handleSubmit = useCallback(async () => {
    if (!quiz) return
    const finalAnswers = answers.map((a) => (a === null ? 0 : a))
    const score = finalAnswers.filter((a, i) => a === quiz.questions[i].correctIndex).length

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: id,
        quiz_title: quiz.title,
        quiz_icon: quiz.icon,
        quiz_color: quiz.color,
        score,
        total: quiz.questions.length,
        answers: finalAnswers,
      })
    }

    router.push(
      `/quiz/${id}/results?score=${score}&total=${quiz.questions.length}&title=${encodeURIComponent(quiz.title)}&answers=${finalAnswers.join(",")}`
    )
  }, [answers, id, quiz, router])

  useEffect(() => { submitRef.current = handleSubmit }, [handleSubmit])

  function handleSelect(index: number) {
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = index
      return next
    })
  }

  const selectedOption = answers[currentIndex] ?? null
  const answeredCount = answers.filter((a) => a !== null).length
  const allAnswered = quiz ? answeredCount === quiz.questions.length : false

  return {
    quiz,
    currentIndex, setCurrentIndex,
    answers,
    timeLeft,
    timesUp,
    selectedOption,
    answeredCount,
    allAnswered,
    handleSelect,
    handleSubmit,
  }
}
