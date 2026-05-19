"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, Inbox } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { QuizIcon, COLOR_MAP } from "@/lib/quizIcons"
import { getGradeInfo } from "@/lib/gradeUtils"
import ScoreBar from "@/components/ScoreBar"
import { accentGradient, accentHover } from "@/lib/theme"

interface QuizAttempt {
  id: string
  quiz_id: string
  quiz_title: string
  quiz_icon: string
  quiz_color: string
  score: number
  total: number
  created_at: string
}

const supabase = createClient()

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl glass animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 rounded-full glass animate-pulse" style={{ width: `${45 + i * 12}%` }} />
            <div className="h-1.5 w-full rounded-full glass animate-pulse" />
            <div className="h-3 w-28 rounded-full glass animate-pulse" />
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="h-6 w-12 rounded-full glass animate-pulse" />
            <div className="h-3 w-8 rounded-full glass animate-pulse" />
          </div>
          <div className="w-9 h-9 rounded-xl glass animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
  if (diffDays === 0) return `วันนี้ ${time}`
  if (diffDays === 1) return `เมื่อวาน ${time}`
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" }) + ` ${time}`
}

export default function HistoryPage() {
  const router = useRouter()
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ประวัติการทำข้อสอบ</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {loading ? "กำลังโหลด..." : attempts.length === 0 ? "ยังไม่มีประวัติ" : `${attempts.length} ครั้ง`}
            </p>
          </div>
        </div>

        {loading && <HistorySkeleton />}

        {/* Empty state */}
        {!loading && attempts.length === 0 && (
          <div className="glass rounded-3xl p-16 text-center animate-float-up">
            <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/8 flex items-center justify-center mx-auto mb-4">
              <Inbox size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">ยังไม่มีประวัติ</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>ลองทำ quiz สักชุดดูสิ!</p>
            <button
              onClick={() => router.push("/")}
              className={`px-5 py-2.5 rounded-xl bg-linear-to-r ${accentGradient} ${accentHover} text-white text-sm font-semibold transition-all`}
            >
              ไปหน้าหลัก
            </button>
          </div>
        )}

        {/* Attempt list */}
        {!loading && attempts.length > 0 && (
          <div className="space-y-3 animate-float-up">
            {attempts.map((a) => {
              const percent = Math.round((a.score / a.total) * 100)
              const grade = getGradeInfo(percent)
              const colorCls = COLOR_MAP[a.quiz_color]?.gradient ?? COLOR_MAP.violet.gradient

              return (
                <div key={a.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                  <QuizIcon icon={a.quiz_icon} color={a.quiz_color} size="md" />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate mb-1.5">
                      {a.quiz_title}
                    </p>
                    <ScoreBar percent={percent} gradient={colorCls} height="h-1.5" />
                    <p className="text-xs mt-1.5" style={{ color: "var(--text-faint)" }}>
                      {formatDate(a.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${grade.bgCls} ${grade.textCls}`}>
                      {percent}%
                    </span>
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      {a.score}/{a.total}
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/quiz/${a.quiz_id}`)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl glass hover:opacity-80 transition-opacity shrink-0"
                    style={{ color: "var(--text-muted)" }}
                    title="ทำอีกครั้ง"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
