"use client"

import { useState, useRef, useEffect } from "react"
import { X, Sparkles, Send, RotateCcw, Check } from "lucide-react"
import { AI_MODEL_DISPLAY } from "@/lib/config"
import { accentIconGradient, accentGradient, accentHover, accentDot } from "@/lib/theme"
import { useAIQuizGeneration, type GeneratedResult } from "@/hooks/useAIQuizGeneration"

interface Props {
  onApply: (result: GeneratedResult) => void
  onClose: () => void
}

const suggestions = [
  "สร้างคำถาม JavaScript 5 ข้อ",
  "ข้อสอบประวัติศาสตร์ไทย 3 ข้อ",
  "คำถาม React Hooks 5 ข้อ ระดับกลาง",
  "ความรู้ทั่วไปวิทยาศาสตร์ 4 ข้อ",
]

export default function AIGeneratePanel({ onApply, onClose }: Props) {
  const [input, setInput] = useState("")
  const { messages, streaming, streamBuffer, parsed, error, send, reset } = useAIQuizGeneration()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamBuffer])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  async function handleSend() {
    const text = input.trim()
    if (!text || streaming) return
    setInput("")
    await send(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg rounded-2xl flex flex-col shadow-2xl shadow-black/40 animate-scale-in border border-white/10"
        style={{ background: "rgba(18, 10, 35, 0.92)", backdropFilter: "blur(24px)", maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
          <div className={`w-8 h-8 rounded-xl bg-linear-to-br ${accentIconGradient} flex items-center justify-center`}>
            <Sparkles size={15} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">สร้างด้วย AI</p>
            <p className="text-xs text-white/55">{AI_MODEL_DISPLAY}</p>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={reset}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:bg-white/10 transition-colors"
                title="เริ่มใหม่"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:bg-white/10 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {messages.length === 0 && !streaming && (
            <div className="space-y-3">
              <p className="text-sm text-center text-white/60">
                บอก AI ว่าอยากได้ quiz เรื่องอะไร
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs text-left px-3 py-2.5 rounded-xl border border-white/15 text-white/80 hover:border-white/40 hover:bg-white/8 hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => {
            if (m.role === "user") {
              return (
                <div key={i} className="flex justify-end">
                  <div className={`max-w-[80%] bg-linear-to-br ${accentGradient} text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm`}>
                    {m.content}
                  </div>
                </div>
              )
            }
            return null
          })}

          {(streaming || streamBuffer) && (
            <div className="flex justify-start">
              <div className="max-w-full w-full bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                {streaming && !streamBuffer && (
                  <div className="flex gap-1 items-center h-5">
                    <span className={`w-1.5 h-1.5 rounded-full ${accentDot} animate-bounce`} style={{ animationDelay: "0ms" }} />
                    <span className={`w-1.5 h-1.5 rounded-full ${accentDot} animate-bounce`} style={{ animationDelay: "150ms" }} />
                    <span className={`w-1.5 h-1.5 rounded-full ${accentDot} animate-bounce`} style={{ animationDelay: "300ms" }} />
                  </div>
                )}
                {streamBuffer && (
                  <pre className="text-xs font-mono text-white/50 whitespace-pre-wrap break-all leading-relaxed max-h-40 overflow-auto">
                    {streamBuffer}
                  </pre>
                )}
              </div>
            </div>
          )}

          {parsed && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Check size={15} className="text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-400">
                  ได้ {parsed.questions.length} คำถาม
                  {parsed.suggestedTitle && ` — "${parsed.suggestedTitle}"`}
                </p>
              </div>
              <div className="space-y-1.5">
                {parsed.questions.map((q, i) => (
                  <p key={i} className="text-xs text-white/60">
                    {i + 1}. {q.question}
                  </p>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { reset() }}
                  className="flex-1 py-2 rounded-xl text-xs font-medium glass transition-all text-white/60 hover:text-white"
                >
                  สร้างใหม่
                </button>
                <button
                  onClick={() => onApply(parsed)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold bg-linear-to-r ${accentGradient} ${accentHover} text-white transition-all`}
                >
                  ใช้คำถามเหล่านี้
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-center text-red-400">{error}</p>}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/8">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="เช่น สร้างคำถาม Python 5 ข้อ ระดับง่าย..."
              rows={1}
              className="flex-1 quiz-input resize-none text-sm placeholder:text-white/40!"
              style={{
                minHeight: "42px",
                maxHeight: "120px",
                background: "rgba(255, 255, 255, 0.10)",
                border: "1px solid rgba(255, 255, 255, 0.30)",
                color: "rgba(255, 255, 255, 0.90)",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className={`w-10 h-10 shrink-0 rounded-xl bg-linear-to-br ${accentGradient} ${accentHover} disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all`}
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
