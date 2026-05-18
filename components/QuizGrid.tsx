"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { FileText, ChevronRight, MoreVertical, Pencil, Trash2, X } from "lucide-react"
import { useCustomQuizzes } from "@/hooks/useCustomQuizzes"
import { QuizIcon } from "@/lib/quizIcons"
import { accentLabel, accentMenuHover } from "@/lib/theme"

function DeleteModal({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative glass rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/30 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={15} />
        </button>

        <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-red-500 dark:text-red-400" />
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">ลบ Quiz</h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          ต้องการลบ <span className="font-semibold text-gray-700 dark:text-white/80">{title}</span> ออกจากรายการ? ไม่สามารถกู้คืนได้
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl glass font-medium text-sm transition-all text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all"
          >
            ลบเลย
          </button>
        </div>
      </div>
    </div>
  )
}

function QuizMenu({ quizId, quizTitle, onDelete }: { quizId: string; quizTitle: string; onDelete: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <>
      <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <MoreVertical size={15} />
        </button>

        {open && (
          <div className="absolute right-0 top-8 z-20 w-36 glass rounded-xl overflow-hidden shadow-xl shadow-black/20 animate-scale-in">
            <button
              onClick={() => { setOpen(false); router.push(`/quiz/${quizId}/edit`) }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-white/80 ${accentMenuHover} transition-colors`}
            >
              <Pencil size={14} />
              แก้ไข
            </button>
            <button
              onClick={() => { setOpen(false); setConfirmDelete(true) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={14} />
              ลบ
            </button>
          </div>
        )}
      </div>

      {confirmDelete && createPortal(
        <DeleteModal
          title={quizTitle}
          onConfirm={() => { setConfirmDelete(false); onDelete() }}
          onCancel={() => setConfirmDelete(false)}
        />,
        document.body
      )}
    </>
  )
}

export default function QuizGrid() {
  const router = useRouter()
  const { customQuizzes, loading, userId, deleteQuiz } = useCustomQuizzes()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 animate-pulse">
            {/* Icon + category */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-black/8 dark:bg-white/8" />
              <div className="h-3.5 w-16 rounded-full bg-black/8 dark:bg-white/8 mt-1" />
            </div>
            {/* Title */}
            <div className="h-5 w-3/4 rounded-full bg-black/8 dark:bg-white/8 mb-2" />
            {/* Description */}
            <div className="space-y-1.5 mb-5">
              <div className="h-3.5 w-full rounded-full bg-black/5 dark:bg-white/5" />
              <div className="h-3.5 w-2/3 rounded-full bg-black/5 dark:bg-white/5" />
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-16 rounded-full bg-black/8 dark:bg-white/8" />
              <div className="h-3.5 w-12 rounded-full bg-black/8 dark:bg-white/8" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {customQuizzes.map((quiz, idx) => {
        const isOwner = quiz.user_id === userId
        return (
          <div
            key={quiz.id}
            className="group animate-float-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div
              onClick={() => router.push(`/quiz/${quiz.id}`)}
              className="glass glass-hover rounded-2xl p-6 h-full cursor-pointer"
            >
              {/* Icon + badges + menu */}
              <div className="flex items-start justify-between mb-4">
                <QuizIcon icon={quiz.icon} color={quiz.color} size="md" />
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${accentLabel} uppercase tracking-widest`}>
                    {quiz.category}
                  </span>
                  {isOwner && (
                    <>
                      <span className="text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        ของฉัน
                      </span>
                      <QuizMenu
                        quizId={quiz.id}
                        quizTitle={quiz.title}
                        onDelete={() => deleteQuiz(quiz.id)}
                      />
                    </>
                  )}
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">{quiz.title}</h2>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{quiz.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-faint)" }}>
                  <FileText size={14} />
                  {quiz.questions.length} คำถาม
                </div>
                <span className={`text-xs ${accentLabel} opacity-70 group-hover:opacity-100 transition-all flex items-center gap-0.5 font-medium`}>
                  เริ่มทำ
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
