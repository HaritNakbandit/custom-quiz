"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Check, ChevronDown, Timer, ImageIcon, X } from "lucide-react"
import { QuizIcon, ICON_LIST, COLOR_LIST, COLOR_MAP, ICON_MAP } from "@/lib/quizIcons"
import { accentLabel, accentDashedBorder } from "@/lib/theme"
import type { useQuizForm } from "@/hooks/useQuizForm"

const CATEGORIES = [
  "General", "Programming", "Science", "Math",
  "History", "Language", "Geography", "Business",
  "Technology", "Sports", "Art", "Entertainment",
]

type FormState = ReturnType<typeof useQuizForm>

interface Props {
  form: FormState
}

export default function QuizFormBody({ form }: Props) {
  const {
    title, setTitle,
    description, setDescription,
    category, setCategory,
    icon, setIcon,
    color, setColor,
    questions,
    timeLimitSeconds, setTimeLimitSeconds,
    coverUrl, setCoverUrl,
    pendingCoverFile, setPendingCoverFile,
    updateQuestion, updateOption, addQuestion, removeQuestion,
  } = form

  const inputCls = "quiz-input"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setSizeError(true); return }
    setSizeError(false)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
    setPendingCoverFile(file)
  }

  function handleRemoveCover() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPendingCoverFile(null)
    setCoverUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const displayUrl = previewUrl ?? coverUrl

  return (
    <>
      {/* Quiz Info */}
      <div className="glass rounded-2xl p-6 mb-5">
        <h2 className={`text-xs font-semibold ${accentLabel} uppercase tracking-widest mb-5`}>ข้อมูลชุดคำถาม</h2>

        {/* Cover Image */}
        <div className="mb-5">
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>Cover Image</label>
          {displayUrl ? (
            <div className="relative rounded-2xl overflow-hidden h-36">
              <img src={displayUrl} alt="cover" className="w-full h-full object-cover" />
              <button
                onClick={handleRemoveCover}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-lg flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
              {pendingCoverFile && (
                <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
                  รอ save
                </span>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-black/15 dark:border-white/15 cursor-pointer hover:bg-black/3 dark:hover:bg-white/5 transition-colors">
              <ImageIcon size={20} style={{ color: "var(--text-faint)" }} />
              <span className="text-xs mt-2" style={{ color: "var(--text-faint)" }}>คลิกเพื่อเลือกรูป cover</span>
              <span className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>PNG, JPG, WebP · สูงสุด 5MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
          {sizeError && (
            <p className="text-xs mt-2 text-red-500 dark:text-red-400">ไฟล์ต้องมีขนาดไม่เกิน 5MB</p>
          )}
        </div>

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
            <div className="relative">
              <select
                value={CATEGORIES.includes(category) ? category : category ? "__custom__" : ""}
                onChange={(e) => {
                  if (e.target.value === "__custom__") setCategory("")
                  else setCategory(e.target.value)
                }}
                className={`${inputCls} appearance-none pr-9`}
              >
                <option value="" disabled>เลือก category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">กำหนดเอง...</option>
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-faint)" }} />
            </div>
            {!CATEGORIES.includes(category) && (
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="พิมพ์ category..."
                className={`${inputCls} mt-2`}
                autoFocus
              />
            )}
          </div>

          {/* Timer */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <Timer size={14} />
                จำกัดเวลา
              </label>
              <button
                type="button"
                onClick={() => setTimeLimitSeconds(timeLimitSeconds !== null ? null : 300)}
                className="w-11 h-6 rounded-full transition-colors relative shrink-0"
                style={{ background: timeLimitSeconds !== null ? "#3b82f6" : "var(--input-bg)", border: "1px solid var(--glass-border)" }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                  style={{ left: timeLimitSeconds !== null ? "calc(100% - 1.375rem)" : "0.125rem" }}
                />
              </button>
            </div>
            {timeLimitSeconds !== null && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={Math.round(timeLimitSeconds / 60)}
                  onChange={(e) => setTimeLimitSeconds(Math.max(1, Number(e.target.value)) * 60)}
                  className={`${inputCls} w-24 text-center`}
                />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>นาที</span>
              </div>
            )}
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
        className={`w-full py-3.5 rounded-2xl border border-dashed ${accentDashedBorder} ${accentLabel} transition-all font-medium mb-6 flex items-center justify-center gap-2`}
      >
        <Plus size={16} strokeWidth={2.5} />
        เพิ่มคำถาม
      </button>
    </>
  )
}
