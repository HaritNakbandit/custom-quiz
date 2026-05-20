"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, Clock, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useProfile } from "@/hooks/shared/useProfile"
import { accentIconGradient } from "@/lib/theme"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const supabase = createClient()

export default function UserMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { isAdmin } = useProfile()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 glass rounded-xl px-3 py-2 text-sm transition-all hover:glass-hover"
      >
        <div className={`w-6 h-6 rounded-full bg-linear-to-br ${accentIconGradient} flex items-center justify-center`}>
          <User size={12} className="text-white" />
        </div>
        <span className="max-w-30 truncate" style={{ color: "var(--foreground)" }}>
          {user.email}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 glass rounded-xl shadow-xl shadow-black/20 overflow-hidden min-w-40">
            <button
              onClick={() => { setOpen(false); router.push("/history") }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--foreground)" }}
            >
              <Clock size={14} style={{ color: "var(--text-muted)" }} />
              ประวัติการทำข้อสอบ
            </button>
            {isAdmin && (
              <>
                <div className="h-px mx-3" style={{ background: "var(--glass-border)" }} />
                <button
                  onClick={() => { setOpen(false); router.push("/admin/users") }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-violet-500/8 text-violet-600 dark:text-violet-400"
                >
                  <Shield size={14} />
                  จัดการผู้ใช้
                </button>
              </>
            )}
            <div className="h-px mx-3" style={{ background: "var(--glass-border)" }} />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/8 transition-colors"
            >
              <LogOut size={14} />
              ออกจากระบบ
            </button>
          </div>
        </>
      )}
    </div>
  )
}
