"use client"

import { useRouter } from "next/navigation"
import { use, Suspense } from "react"
import { Check, X, Lightbulb } from "lucide-react"
import { getGradeInfo } from "@/lib/gradeUtils"
import { accentGradient, accentHover, accentShadow, accentLabel } from "@/lib/theme"
import { useQuizResults } from "@/hooks/useQuizResults"

function ResultsContent({ id }: { id: string }) {
  const router = useRouter()
  const { quiz, score, total, quizTitle, userAnswers, percent } = useQuizResults(id)

  const grade = getGradeInfo(percent)
  const circumference = 2 * Math.PI * 15.9

  return (
    <div className="min-h-screen bg-background px-4 py-12 relative overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-150 h-150 rounded-full blur-[140px] -translate-y-1/3" style={{ background: grade.glowColor }} />
      </div>

      <div className="relative max-w-xl mx-auto animate-float-up">
        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 flex items-center justify-center rounded-xl glass hover:opacity-80 transition-opacity mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        {/* Score card */}
        <div className="glass rounded-3xl p-10 text-center mb-6">
          <div className="text-5xl mb-5">{grade.emoji}</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{grade.label}</h1>
          {quizTitle && <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>{quizTitle}</p>}

          <div className="relative w-40 h-40 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke={grade.ringColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {score}<span className="text-gray-300 dark:text-white/30 text-2xl">/{total}</span>
              </span>
              <span className="text-sm font-medium mt-0.5" style={{ color: grade.ringColor }}>{percent}%</span>
            </div>
          </div>

          <div className="flex gap-2 justify-center mb-8">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              ถูก {score} ข้อ
            </div>
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              ผิด {total - score} ข้อ
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/quiz/${id}`)}
              className="flex-1 py-3 rounded-2xl glass font-semibold transition-all text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
            >
              ลองอีกครั้ง
            </button>
            <button
              onClick={() => router.push("/")}
              className={`flex-1 py-3 rounded-2xl bg-linear-to-r ${accentGradient} ${accentHover} text-white font-semibold transition-all shadow-lg ${accentShadow}`}
            >
              หน้าหลัก
            </button>
          </div>
        </div>

        {/* Review section */}
        {quiz && userAnswers.length > 0 && (
          <div>
            <h2 className={`text-xs font-bold ${accentLabel} uppercase tracking-widest mb-4 px-1`}>
              เฉลยคำถาม
            </h2>
            <div className="space-y-4">
              {quiz.questions.map((q, qi) => {
                const selected = userAnswers[qi]
                const correct = q.correctIndex
                const isRight = selected === correct
                return (
                  <div key={qi} className="glass rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isRight ? "bg-emerald-500" : "bg-red-500"
                      }`}>
                        {isRight
                          ? <Check size={14} className="text-white" strokeWidth={3} />
                          : <X size={14} className="text-white" strokeWidth={3} />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-faint)" }}>
                          ข้อ {qi + 1}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                          {q.question}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      {q.options.map((opt, oi) => {
                        const isCorrectOpt = oi === correct
                        const isSelectedOpt = oi === selected
                        const isWrongSelected = isSelectedOpt && !isCorrectOpt

                        let rowCls = "border-black/5 dark:border-white/5 opacity-40"
                        let badgeCls = "bg-black/8 dark:bg-white/8 text-gray-400 dark:text-white/25"
                        let textCls = "text-gray-400 dark:text-white/30"

                        if (isCorrectOpt) {
                          rowCls = "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10"
                          badgeCls = "bg-emerald-500 text-white"
                          textCls = "text-emerald-700 dark:text-emerald-300"
                        } else if (isWrongSelected) {
                          rowCls = "border-red-400/40 bg-red-50 dark:bg-red-500/10"
                          badgeCls = "bg-red-500 text-white"
                          textCls = "text-red-600 dark:text-red-300"
                        }

                        return (
                          <div key={oi} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${rowCls}`}>
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${badgeCls}`}>
                              {isCorrectOpt
                                ? <Check size={12} strokeWidth={3} />
                                : isWrongSelected
                                ? <X size={12} strokeWidth={3} />
                                : String.fromCharCode(65 + oi)
                              }
                            </span>
                            <span className={`text-sm font-medium leading-snug ${textCls}`}>{opt}</span>
                            {isCorrectOpt && (
                              <span className="ml-auto text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                                เฉลย
                              </span>
                            )}
                            {isWrongSelected && (
                              <span className="ml-auto text-xs font-semibold text-red-500 dark:text-red-400 shrink-0">
                                คำตอบคุณ
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {q.explanation && (
                      <div className="flex gap-2.5 bg-indigo-50 dark:bg-indigo-500/8 border border-indigo-200 dark:border-indigo-500/15 rounded-xl px-3 py-2.5">
                        <Lightbulb size={14} className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => router.push(`/quiz/${id}`)}
                className="flex-1 py-3.5 rounded-2xl glass font-semibold transition-all text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
              >
                ลองอีกครั้ง
              </button>
              <button
                onClick={() => router.push("/")}
                className={`flex-1 py-3.5 rounded-2xl bg-linear-to-r ${accentGradient} ${accentHover} text-white font-semibold transition-all shadow-lg ${accentShadow}`}
              >
                หน้าหลัก
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <Suspense>
      <ResultsContent id={id} />
    </Suspense>
  )
}
