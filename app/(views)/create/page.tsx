"use client"

import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { useCustomQuizzes } from "@/hooks/useCustomQuizzes"
import { useProfile } from "@/hooks/useProfile"
import { useQuizForm, toQuestion } from "@/hooks/useQuizForm"
import AIGeneratePanel from "@/components/AIGeneratePanel"
import ErrorAlert from "@/components/ErrorAlert"
import QuizFormBody from "@/components/QuizFormBody"
import { accentGradient, accentHover, accentShadow, accentShadowSm } from "@/lib/theme"

export default function CreateQuizPage() {
  const router = useRouter()
  const { saveQuiz, customQuizzes, userId, loading: quizzesLoading } = useCustomQuizzes()
  const { isAdmin, role, loading: profileLoading } = useProfile()
  const [showAI, setShowAI] = useState(false)
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

    await saveQuiz({
      id: `custom-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim() || "Custom quiz",
      category: form.category.trim(),
      icon: form.icon,
      color: form.color,
      questions: form.questions.map((q, i) => toQuestion(q, i + 1)),
      time_limit_seconds: form.timeLimitSeconds,
    })
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12 relative overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute -top-32 left-1/4 w-125 h-125 rounded-full blur-[100px]" style={{ background: "var(--page-orb-1)" }} />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 animate-float-up">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 flex items-center justify-center rounded-xl glass hover:opacity-80 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">สร้าง Quiz ใหม่</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>กรอกข้อมูลและเพิ่มคำถามได้เลย</p>
          </div>
          <button
            onClick={() => setShowAI(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r ${accentGradient} ${accentHover} text-white text-sm font-semibold transition-all shadow-lg ${accentShadowSm}`}
          >
            <Sparkles size={15} />
            สร้างด้วย AI
          </button>
        </div>

        {showAI && (
          <AIGeneratePanel
            onApply={(result) => { form.handleAIApply(result, true); setShowAI(false) }}
            onClose={() => setShowAI(false)}
          />
        )}

        <ErrorAlert errors={form.errors} />

        <QuizFormBody form={form} />

        <button
          onClick={handleSubmit}
          disabled={form.saving}
          className={`w-full py-4 rounded-2xl bg-linear-to-r ${accentGradient} ${accentHover} disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition-all shadow-lg ${accentShadow}`}
        >
          {form.saving ? "กำลังบันทึก..." : "บันทึก Quiz"}
        </button>
      </div>
    </div>
  )
}
