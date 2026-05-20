"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useCustomQuizzes } from "@/hooks/shared/useCustomQuizzes"
import { useQuizForm } from "@/hooks/useQuizForm"
import { toQuestion } from "@/lib/quizUtils"
import { Quiz } from "@/types/quizzes"

const supabase = createClient()

export function useEditQuiz(id: string) {
  const router = useRouter()
  const { updateQuiz, uploadCoverImage } = useCustomQuizzes()
  const [loaded, setLoaded] = useState(false)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const form = useQuizForm(quiz)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/login"); return }

      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single()

      if (!data || data.user_id !== user.id) {
        router.replace("/")
        return
      }

      setQuiz(data as Quiz)
      setLoaded(true)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSubmit() {
    const errs = form.validate()
    if (errs.length > 0) return
    form.setSaving(true)

    let coverUrl = form.coverUrl
    if (form.pendingCoverFile) {
      coverUrl = await uploadCoverImage(form.pendingCoverFile)
    }

    await updateQuiz({
      ...quiz!,
      title: form.title.trim(),
      description: form.description.trim() || "Custom quiz",
      category: form.category.trim(),
      icon: form.icon,
      color: form.color,
      cover_url: coverUrl,
      questions: form.questions.map((q, i) => toQuestion(q, i + 1)),
      time_limit_seconds: form.timeLimitSeconds,
    })
    router.push("/")
  }

  return { loaded, quiz, form, handleSubmit }
}
