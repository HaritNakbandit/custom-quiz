"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCustomQuizzes } from "@/hooks/shared/useCustomQuizzes"
import { useProfile } from "@/hooks/shared/useProfile"
import { useQuizForm } from "@/hooks/useQuizForm"
import { toQuestion } from "@/lib/quizUtils"

export function useCreateQuiz() {
  const router = useRouter()
  const { saveQuiz, uploadCoverImage, customQuizzes, userId, loading: quizzesLoading } = useCustomQuizzes()
  const { isAdmin, role, loading: profileLoading } = useProfile()
  const form = useQuizForm()

  useEffect(() => {
    if (profileLoading || quizzesLoading) return
    const myQuizCount = customQuizzes.filter((q) => q.user_id === userId).length
    if (!isAdmin && role === "user" && myQuizCount >= 1) {
      router.replace("/")
    }
  }, [profileLoading, quizzesLoading, isAdmin, role, customQuizzes, userId, router])

  async function handleSubmit() {
    const errs = form.validate()
    if (errs.length > 0) return
    form.setSaving(true)

    let coverUrl = form.coverUrl
    if (form.pendingCoverFile) {
      coverUrl = await uploadCoverImage(form.pendingCoverFile)
    }

    await saveQuiz({
      id: `custom-${Date.now()}`,
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

  return { form, handleSubmit }
}
