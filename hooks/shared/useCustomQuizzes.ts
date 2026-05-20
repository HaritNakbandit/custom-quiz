"use client"

import { useState, useEffect, useCallback } from "react"
import { Quiz } from "@/types/quizzes"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export function useCustomQuizzes() {
  const [customQuizzes, setCustomQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false })

      if (data) setCustomQuizzes(data as Quiz[])
      setLoading(false)
    }
    load()
  }, [])

  const saveQuiz = useCallback(async (quiz: Quiz) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("quizzes")
      .insert({ ...quiz, user_id: user.id })
      .select()
      .single()

    if (data) setCustomQuizzes((prev) => [data as Quiz, ...prev])
  }, [])

  const deleteQuiz = useCallback(async (id: string) => {
    await supabase.from("quizzes").delete().eq("id", id)
    setCustomQuizzes((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const updateQuiz = useCallback(async (quiz: Quiz) => {
    const { data } = await supabase
      .from("quizzes")
      .update(quiz)
      .eq("id", quiz.id)
      .select()
      .single()

    if (data) setCustomQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? (data as Quiz) : q)))
  }, [])

  const getQuiz = useCallback(
    (id: string): Quiz | undefined => customQuizzes.find((q) => q.id === id),
    [customQuizzes]
  )

  const uploadCoverImage = useCallback(async (file: File): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const ext = file.name.split(".").pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from("quiz-covers").upload(path, file, { upsert: true })
    if (error || !data) return null
    const { data: { publicUrl } } = supabase.storage.from("quiz-covers").getPublicUrl(data.path)
    return publicUrl
  }, [])

  return { customQuizzes, loading, userId, saveQuiz, updateQuiz, deleteQuiz, getQuiz, uploadCoverImage }
}
