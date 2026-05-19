"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import { ChevronLeft, ChevronRight, Send, Timer } from "lucide-react"
import { Quiz } from "@/data/quizzes"
import { createClient } from "@/lib/supabase/client"
import { QuizIcon } from "@/lib/quizIcons"
import { accentGradient, accentOptionSelected, accentOptionHover, accentOptionText, accentSkeletonLabel } from "@/lib/theme"

const supabase = createClient()

function QuizSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full blur-[100px]" style={{ background: "var(--page-orb-1)" }} />
      <div className="w-full max-w-xl relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl glass animate-pulse shrink-0" />
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-10 h-10 rounded-2xl glass animate-pulse shrink-0" />
            <div className="h-4 w-36 rounded-full glass animate-pulse" />
          </div>
          <div className="h-7 w-14 rounded-full glass animate-pulse" />
        </div>
        <div className="mb-6">
          <div className="w-full rounded-full h-1 glass animate-pulse mb-3" />
          <div className="flex gap-1.5 justify-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full glass animate-pulse" />
            ))}
          </div>
        </div>
        <div className="glass rounded-3xl p-7 mb-4">
          <div className={`h-3 w-24 rounded-full ${accentSkeletonLabel} animate-pulse mb-4`} />
          <div className="space-y-2 mb-7">
            <div className="h-5 w-full rounded-full glass animate-pulse" />
            <div className="h-5 w-4/5 rounded-full glass animate-pulse" />
          </div>
          <div className="space-y-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-xl glass animate-pulse shrink-0" />
                <div className="h-4 rounded-full glass animate-pulse" style={{ width: `${55 + i * 10}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-2xl glass animate-pulse shrink-0" />
          <div className="w-12 h-12 rounded-2xl glass animate-pulse shrink-0" />
          <div className="flex-1 h-12 rounded-2xl glass animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [timesUp, setTimesUp] = useState(false)
  const submitRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    async function loadQuiz() {
      const { data } = await supabase.from("quizzes").select("*").eq("id", id).single()
      if (data) {
        setQuiz(data as Quiz)
        setAnswers(new Array((data as Quiz).questions.length).fill(null))
        if ((data as Quiz).time_limit_seconds) {
          setTimeLeft((data as Quiz).time_limit_seconds!)
        }
      }
    }
    loadQuiz()
  }, [id])

  useEffect(() => {
    if (timeLeft === null || timesUp) return
    if (timeLeft === 0) {
      setTimesUp(true)
      submitRef.current?.()
      return
    }
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

  if (!quiz) return <QuizSkeleton />

  const question = quiz.questions[currentIndex]
  const navyCls = accentGradient
  const selectedOption = answers[currentIndex]
  const answeredCount = answers.filter((a) => a !== null).length
  const allAnswered = answeredCount === quiz.questions.length
  const progress = (answeredCount / quiz.questions.length) * 100

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    return `${m}:${String(s % 60).padStart(2, "0")}`
  }

  function handleSelect(index: number) {
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = index
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full blur-[100px]" style={{ background: "var(--page-orb-1)" }} />

      <div className="w-full max-w-xl relative animate-float-up">
        {/* Nav */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 flex items-center justify-center rounded-xl glass hover:opacity-80 transition-opacity shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <QuizIcon icon={quiz.icon} color={quiz.color} size="sm" />
            <span className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{quiz.title}</span>
          </div>
          <span className="glass text-xs font-semibold px-3 py-1.5 rounded-full shrink-0" style={{ color: "var(--text-muted)" }}>
            {answeredCount} <span style={{ color: "var(--text-faint)" }}>/ {quiz.questions.length}</span>
          </span>
        </div>

        {/* Timer card */}
        {timeLeft !== null && quiz.time_limit_seconds && (
          <div className={`rounded-2xl px-4 py-3 mb-4 transition-colors ${
            timesUp || timeLeft < 30
              ? "bg-red-500/10 border border-red-500/20"
              : "glass"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Timer size={14} className={timesUp || timeLeft < 30 ? "text-red-500 dark:text-red-400" : ""} style={!(timesUp || timeLeft < 30) ? { color: "var(--text-muted)" } : undefined} />
                <span className={`text-xs font-medium ${timesUp || timeLeft < 30 ? "text-red-500 dark:text-red-400" : ""}`} style={!(timesUp || timeLeft < 30) ? { color: "var(--text-muted)" } : undefined}>
                  {timesUp ? "หมดเวลา!" : "เวลาที่เหลือ"}
                </span>
              </div>
              <span className={`text-xl font-mono font-bold ${timesUp || timeLeft < 30 ? "text-red-500 dark:text-red-400" : ""}`} style={!(timesUp || timeLeft < 30) ? { color: "var(--foreground)" } : undefined}>
                {timesUp ? "0:00" : formatTime(timeLeft)}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--input-bg)" }}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  timesUp || timeLeft < 30 ? "bg-red-500" : timeLeft < quiz.time_limit_seconds * 0.25 ? "bg-amber-500" : `bg-linear-to-r ${navyCls}`
                }`}
                style={{ width: `${Math.max(0, (timeLeft / quiz.time_limit_seconds) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Progress bar + clickable step dots */}
        <div className="mb-6">
          <div className="w-full rounded-full h-1 overflow-hidden mb-3" style={{ background: "var(--input-bg)" }}>
            <div
              className={`bg-linear-to-r ${navyCls} h-full rounded-full transition-all duration-700`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-1.5 justify-center">
            {quiz.questions.map((_, i) => {
              const isAnswered = answers[i] !== null
              const isCurrent = i === currentIndex
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    isCurrent
                      ? `h-1.5 w-7 bg-linear-to-r ${navyCls}`
                      : isAnswered
                      ? `h-1.5 w-4 bg-linear-to-r ${navyCls} opacity-50`
                      : "h-1.5 w-1.5 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Question card */}
        <div className="glass rounded-3xl p-7 mb-4">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 bg-linear-to-r ${navyCls} bg-clip-text text-transparent`}>
            คำถามที่ {currentIndex + 1}
          </p>
          <h2 className="text-lg font-bold mb-6 leading-relaxed" style={{ color: "var(--foreground)" }}>
            {question.question}
          </h2>

          <div className="space-y-2.5">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === index
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 cursor-pointer ${
                    isSelected
                      ? accentOptionSelected
                      : `border-black/8 dark:border-white/8 ${accentOptionHover}`
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${
                    isSelected
                      ? `bg-linear-to-br ${navyCls} text-white`
                      : "bg-black/8 dark:bg-white/12 text-gray-500 dark:text-white/60"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span
                    className={`leading-snug text-sm font-medium ${isSelected ? accentOptionText : ""}`}
                    style={!isSelected ? { color: "var(--foreground)" } : {}}
                  >
                    {option}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setCurrentIndex((i) => i - 1)}
            disabled={currentIndex === 0}
            className="w-12 h-12 flex items-center justify-center rounded-2xl glass transition-all hover:opacity-80 disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={currentIndex === quiz.questions.length - 1}
            className="w-12 h-12 flex items-center justify-center rounded-2xl glass transition-all hover:opacity-80 disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`flex-1 h-12 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              allAnswered
                ? `bg-linear-to-r ${navyCls} text-white shadow-lg hover:opacity-90`
                : "glass opacity-40 cursor-not-allowed"
            }`}
            style={!allAnswered ? { color: "var(--text-muted)" } : {}}
          >
            <Send size={15} />
            {allAnswered ? "ส่งคำตอบ" : `ยังขาดอีก ${quiz.questions.length - answeredCount} ข้อ`}
          </button>
        </div>
      </div>
    </div>
  )
}
