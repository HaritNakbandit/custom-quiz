import Link from "next/link"
import { Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import QuizGrid from "@/components/QuizGrid"
import ThemeToggle from "@/components/ThemeToggle"
import UserMenu from "@/components/UserMenu"
import CreateQuizButton from "@/components/CreateQuizButton"
import {
  accentGradient,
  accentHover,
  accentShadowLight,
  accentHeroGradient,
  accentHeroDark,
  accentText,
  accentDot,
} from "@/lib/theme"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden transition-colors duration-300">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-150 h-150 rounded-full blur-[120px]" style={{ background: "var(--page-orb-1)" }} />
      <div className="pointer-events-none absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "var(--page-orb-2)" }} />

      {/* Top right controls */}
      <div className="absolute top-5 right-6 z-10 flex items-center gap-2">
        {user && <UserMenu />}
        <ThemeToggle />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-16 animate-float-up">
          <div className={`inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm ${accentText} mb-6 font-medium`}>
            <span className={`w-1.5 h-1.5 rounded-full ${accentDot} animate-pulse`} />
            ทดสอบความรู้ของคุณ
          </div>
          <h1 className={`text-6xl font-bold mb-4 bg-linear-to-r ${accentHeroGradient} ${accentHeroDark} bg-clip-text text-transparent`}>
            Custom Quiz
          </h1>
          <p className="text-lg mb-10" style={{ color: "var(--text-muted)" }}>
            เลือก quiz ที่คุณต้องการ หรือสร้างชุดคำถามของตัวเอง
          </p>

          {user ? (
            <CreateQuizButton />
          ) : (
            <Link
              href="/login"
              className={`inline-flex items-center gap-2 bg-linear-to-r ${accentGradient} ${accentHover} text-white font-semibold px-8 py-3.5 rounded-2xl transition-all shadow-lg ${accentShadowLight} hover:-translate-y-0.5`}
            >
              <Sparkles size={16} />
              เริ่มเลย
            </Link>
          )}
        </div>

        {user && <QuizGrid />}
      </div>
    </div>
  )
}
