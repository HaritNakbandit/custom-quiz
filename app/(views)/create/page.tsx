"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Check, Sparkles } from "lucide-react"
import { useCustomQuizzes } from "@/hooks/useCustomQuizzes"
import { Question } from "@/data/quizzes"
import { QuizIcon, ICON_LIST, COLOR_LIST, COLOR_MAP, ICON_MAP } from "@/lib/quizIcons"
import AIGeneratePanel from "@/components/AIGeneratePanel"
import { accentGradient, accentHover, accentShadow, accentShadowSm, accentLabel } from "@/lib/theme"

interface DraftQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

function emptyQuestion(): DraftQuestion {
  return { question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }
}

export default function CreateQuizPage() {
  const router = useRouter()
  const { saveQuiz } = useCustomQuizzes()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [icon, setIcon] = useState("BookOpen")
  const [color, setColor] = useState("violet")
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()])
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [showAI, setShowAI] = useState(false)

  function handleAIApply(result: { questions: DraftQuestion[]; suggestedTitle?: string; suggestedCategory?: string }) {
    if (result.suggestedTitle && !title) setTitle(result.suggestedTitle)
    if (result.suggestedCategory && !category) setCategory(result.suggestedCategory)
    setQuestions(result.questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
    })))
    setShowAI(false)
  }

  function updateQuestion(qi: number, field: keyof DraftQuestion, value: string | number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, [field]: value } : q))
    )
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q
      )
    )
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()])
  }

  function removeQuestion(qi: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== qi))
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!title.trim()) errs.push("กรุณาใส่ชื่อ quiz")
    if (!category.trim()) errs.push("กรุณาใส่ category")
    if (questions.length === 0) errs.push("กรุณาเพิ่มอย่างน้อย 1 คำถาม")
    questions.forEach((q, i) => {
      if (!q.question.trim()) errs.push(`คำถามที่ ${i + 1}: กรุณาใส่คำถาม`)
      if (q.options.some((o) => !o.trim())) errs.push(`คำถามที่ ${i + 1}: กรุณาใส่ตัวเลือกให้ครบ`)
    })
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setErrors([])
    setSaving(true)

    const quiz = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "Custom quiz",
      category: category.trim(),
      icon,
      color,
      questions: questions.map(
        (q, i): Question => ({
          id: i + 1,
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()),
          correctIndex: q.correctIndex,
          explanation: q.explanation.trim() || undefined,
        })
      ),
    }

    await saveQuiz(quiz)
    router.push("/")
  }

  const inputCls = "quiz-input"

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
            <ChevronLeft size={18} />
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

        {showAI && <AIGeneratePanel onApply={handleAIApply} onClose={() => setShowAI(false)} />}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 mb-6 animate-scale-in">
            <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
              {errors.map((e, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quiz Info */}
        <div className="glass rounded-2xl p-6 mb-5">
          <h2 className={`text-xs font-semibold ${accentLabel} uppercase tracking-widest mb-5`}>ข้อมูลชุดคำถาม</h2>

          {/* Icon + Color picker */}
          <div className="mb-5">
            <div className="flex items-center gap-4 mb-4">
              <QuizIcon icon={icon} color={color} size="lg" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">ไอคอนชุดคำถาม</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>เลือก icon และสีด้านล่าง</p>
              </div>
            </div>

            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>Icon</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {ICON_LIST.map((name) => {
                const Icon = ICON_MAP[name]
                const selected = icon === name
                return (
                  <button
                    key={name}
                    onClick={() => setIcon(name)}
                    title={name}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${
                      selected
                        ? `bg-linear-to-br ${COLOR_MAP[color].gradient} text-white`
                        : "bg-black/5 dark:bg-white/8 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </button>
                )
              })}
            </div>

            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>สี</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_LIST.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-xl bg-linear-to-br transition-all hover:scale-110 ${COLOR_MAP[c].gradient} ${
                    color === c ? "ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110" : ""
                  }`}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-muted)" }}>ชื่อ Quiz *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น ประวัติศาสตร์ไทย" className={inputCls} />
            </div>
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-muted)" }}>คำอธิบาย</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="อธิบายสั้นๆ เกี่ยวกับ quiz นี้" className={inputCls} />
            </div>
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-muted)" }}>Category *</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="เช่น History, Science, General" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-5">
          {questions.map((q, qi) => (
            <div key={qi} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className={`text-xs font-semibold ${accentLabel} uppercase tracking-widest`}>
                  คำถามที่ {qi + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qi)}
                    className="text-xs text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors"
                  >
                    ลบคำถามนี้
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-1.5 block" style={{ color: "var(--text-muted)" }}>คำถาม *</label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                    placeholder="ใส่คำถามที่นี่..."
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div>
                  <label className="text-sm mb-2 block" style={{ color: "var(--text-muted)" }}>
                    ตัวเลือก * — <span className="text-emerald-600 dark:text-emerald-400/80">คลิกวงกลมเพื่อระบุคำตอบที่ถูก</span>
                  </label>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuestion(qi, "correctIndex", oi)}
                          className={`w-6 h-6 rounded-full border-2 shrink-0 transition-all flex items-center justify-center ${
                            q.correctIndex === oi
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-black/20 dark:border-white/20 hover:border-emerald-500/60"
                          }`}
                        >
                          {q.correctIndex === oi && <Check size={12} className="text-white" strokeWidth={3} />}
                        </button>
                        <input
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          placeholder={`ตัวเลือก ${String.fromCharCode(65 + oi)}`}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm mb-1.5 block" style={{ color: "var(--text-muted)" }}>คำอธิบายเฉลย (ไม่บังคับ)</label>
                  <input
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qi, "explanation", e.target.value)}
                    placeholder="อธิบายเหตุผลของคำตอบที่ถูก..."
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add question */}
        <button
          onClick={addQuestion}
          className={`w-full py-3.5 rounded-2xl border border-dashed border-blue-500/40 ${accentLabel} hover:border-blue-600/70 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all font-medium mb-6 flex items-center justify-center gap-2`}
        >
          <Plus size={16} strokeWidth={2.5} />
          เพิ่มคำถาม
        </button>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={`w-full py-4 rounded-2xl bg-linear-to-r ${accentGradient} ${accentHover} disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition-all shadow-lg ${accentShadow}`}
        >
          {saving ? "กำลังบันทึก..." : "บันทึก Quiz"}
        </button>
      </div>
    </div>
  )
}
