"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { accentGradient, accentHover, accentShadowLight } from "@/lib/theme"

export default function CreateQuizButton() {
  const { isAdmin, loading } = useProfile()

  if (loading || !isAdmin) return null

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
