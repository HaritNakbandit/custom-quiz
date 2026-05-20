"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { useProfile } from "@/hooks/shared/useProfile"
import { useCustomQuizzes } from "@/hooks/shared/useCustomQuizzes"
import { accentGradient, accentHover, accentShadowLight } from "@/lib/theme"

export default function CreateQuizButton() {
  const { isAdmin, role, loading: profileLoading } = useProfile()
  const { customQuizzes, userId, loading: quizzesLoading } = useCustomQuizzes()

  if (profileLoading || quizzesLoading) return null

  const myQuizCount = customQuizzes.filter((q) => q.user_id === userId).length
  const canCreate = isAdmin || (role === "user" && myQuizCount === 0)

  if (!canCreate) return null

  return (
    <Link
      href="/create"
      className={`inline-flex items-center gap-2 bg-linear-to-r ${accentGradient} ${accentHover} text-white font-semibold px-7 py-3.5 rounded-2xl transition-all shadow-lg ${accentShadowLight} hover:-translate-y-0.5`}
    >
      <Plus size={16} strokeWidth={2.5} />
      สร้าง Quiz ใหม่
    </Link>
  )
}
