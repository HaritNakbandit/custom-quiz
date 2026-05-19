"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { accentGradient, accentHover, accentIconGradient, accentHeroGradient, accentHeroDark, accentShadowLight } from "@/lib/theme"

const supabase = createClient()

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password !== confirm) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError("ไม่สามารถเปลี่ยนรหัสผ่านได้ ลิงก์อาจหมดอายุแล้ว")
    } else {
      setDone(true)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 w-150 h-150 rounded-full blur-[120px]" style={{ background: "var(--page-orb-1)" }} />
      <div className="pointer-events-none absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "var(--page-orb-2)" }} />

      <div className="relative w-full max-w-sm animate-float-up">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br ${accentIconGradient} mb-4 shadow-lg ${accentShadowLight}`}>
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold bg-linear-to-r ${accentHeroGradient} ${accentHeroDark} bg-clip-text text-transparent`}>
            Custom Quiz
          </h1>
        </div>

        <div className="glass rounded-3xl p-7 shadow-2xl shadow-black/10">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={26} className="text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">เปลี่ยนรหัสผ่านสำเร็จ</h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว
              </p>
              <button
                onClick={() => router.push("/")}
                className={`w-full py-3 rounded-xl font-semibold text-sm text-white bg-linear-to-r ${accentGradient} ${accentHover} transition-all shadow-lg ${accentShadowLight}`}
              >
                ไปหน้าหลัก
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">ตั้งรหัสผ่านใหม่</h2>
              <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                กรอกรหัสผ่านใหม่ที่ต้องการใช้
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    รหัสผ่านใหม่
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
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    ยืนยันรหัสผ่าน
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="quiz-input"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                  />
                </div>
                {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-semibold text-sm text-white bg-linear-to-r ${accentGradient} ${accentHover} disabled:opacity-50 transition-all shadow-lg ${accentShadowLight} mt-2`}
                >
                  {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
