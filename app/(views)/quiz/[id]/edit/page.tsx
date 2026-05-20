"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { useEditQuiz } from "@/hooks/useEditQuiz"
import AIGeneratePanel from "@/components/AIGeneratePanel"
import ErrorAlert from "@/components/ErrorAlert"
import QuizFormBody from "@/components/QuizFormBody"
import { accentGradient, accentHover, accentShadow, accentShadowSm, accentSkeletonLabel } from "@/lib/theme"

function EditQuizSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/4 w-125 h-125 rounded-full blur-[100px]" style={{ background: "var(--page-orb-1)" }} />
      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl glass animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-36 rounded-full glass animate-pulse" />
            <div className="h-3.5 w-48 rounded-full glass animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-xl glass animate-pulse" />
        </div>
        <div className="glass rounded-2xl p-6 mb-5">
          <div className={`h-3 w-28 rounded-full ${accentSkeletonLabel} animate-pulse mb-5`} />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl glass animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded-full glass animate-pulse" />
              <div className="h-3 w-44 rounded-full glass animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-8 rounded-full glass animate-pulse mb-2" />
          <div className="flex flex-wrap gap-2 mb-4">
            {[...Array(10)].map((_, i) => <div key={i} className="w-10 h-10 rounded-xl glass animate-pulse" />)}
          </div>
          <div className="h-3 w-4 rounded-full glass animate-pulse mb-2" />
          <div className="flex gap-2 mb-5">
            {[...Array(9)].map((_, i) => <div key={i} className="w-8 h-8 rounded-xl glass animate-pulse" />)}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-3.5 w-24 rounded-full glass animate-pulse mb-1.5" />
                <div className="h-10 w-full rounded-xl glass animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6 mb-4">
          <div className={`h-3 w-20 rounded-full ${accentSkeletonLabel} animate-pulse mb-5`} />
          <div className="space-y-4">
            <div>
              <div className="h-3.5 w-16 rounded-full glass animate-pulse mb-1.5" />
              <div className="h-16 w-full rounded-xl glass animate-pulse" />
            </div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full glass animate-pulse shrink-0" />
                  <div className="flex-1 h-10 rounded-xl glass animate-pulse" />
                </div>
              ))}
            </div>
            <div>
              <div className="h-3.5 w-40 rounded-full glass animate-pulse mb-1.5" />
              <div className="h-10 w-full rounded-xl glass animate-pulse" />
            </div>
          </div>
        </div>
        <div className="h-12 w-full rounded-2xl glass animate-pulse mb-4" />
        <div className="h-14 w-full rounded-2xl glass animate-pulse" />
      </div>
    </div>
  )
}

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { loaded, quiz, form, handleSubmit } = useEditQuiz(id)
  const [showAI, setShowAI] = useState(false)

  if (!loaded) return <EditQuizSkeleton />

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p style={{ color: "var(--text-muted)" }}>ไม่พบ quiz นี้ หรืออาจเป็น quiz ที่ไม่สามารถแก้ไขได้</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12 relative overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute -top-32 left-1/4 w-125 h-125 rounded-full blur-[100px]" style={{ background: "var(--page-orb-1)" }} />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 animate-float-up">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl glass hover:opacity-80 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">แก้ไข Quiz</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{quiz.title}</p>
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
            onApply={(result) => { form.handleAIApply(result, false); setShowAI(false) }}
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
          {form.saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </div>
    </div>
  )
}
