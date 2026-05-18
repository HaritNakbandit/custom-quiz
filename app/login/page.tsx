"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { accentGradient, accentHover, accentIconGradient, accentHeroGradient, accentHeroDark, accentShadow, accentShadowLight } from "@/lib/theme"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"

  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const supabase = createClient()

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    })
    if (error) setError("ไม่สามารถเข้าสู่ระบบด้วย Google ได้")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      } else {
        router.push(next)
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError("ไม่สามารถสมัครสมาชิกได้ อาจมีบัญชีนี้อยู่แล้ว")
      } else {
        setSuccess("ส่งอีเมลยืนยันแล้ว กรุณาตรวจสอบ inbox ของคุณ")
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 w-150 h-150 rounded-full blur-[120px]" style={{ background: "var(--page-orb-1)" }} />
      <div className="pointer-events-none absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "var(--page-orb-2)" }} />

      <div className="relative w-full max-w-sm animate-float-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br ${accentIconGradient} mb-4 shadow-lg ${accentShadowLight}`}>
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold bg-linear-to-r ${accentHeroGradient} ${accentHeroDark} bg-clip-text text-transparent`}>
            Custom Quiz
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {mode === "login" ? "เข้าสู่ระบบเพื่อจัดการ quiz ของคุณ" : "สร้างบัญชีใหม่"}
          </p>
        </div>

        <div className="glass rounded-3xl p-7 shadow-2xl shadow-black/10">
          {/* Tab */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: "var(--input-bg)" }}>
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess("") }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={mode === m
                  ? { background: "var(--glass-hover-bg)", color: "var(--foreground)", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }
                  : { color: "var(--text-muted)" }
                }
              >
                {m === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border text-sm font-medium transition-all hover:opacity-80"
            style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--input-bg)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>หรือ</span>
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="quiz-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="quiz-input"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
            {success && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm text-white bg-linear-to-r ${accentGradient} ${accentHover} disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${accentShadowLight} mt-2`}
            >
              {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
