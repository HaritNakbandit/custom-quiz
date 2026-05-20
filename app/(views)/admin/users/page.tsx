"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, CheckCircle, XCircle } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { accentGradient, accentHover, accentShadowSm } from "@/lib/theme"

interface UserRecord {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
  role: "admin" | "user"
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
}

function AdminUsersSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/4 w-125 h-125 rounded-full blur-[100px]" style={{ background: "var(--page-orb-1)" }} />
      <div className="relative max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl glass animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-7 w-48 rounded-full glass animate-pulse" />
            <div className="h-3.5 w-32 rounded-full glass animate-pulse" />
          </div>
        </div>
        <div className="glass rounded-2xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 rounded-full glass animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 rounded-full glass animate-pulse" style={{ width: `${40 + i * 10}%` }} />
                <div className="h-3 w-28 rounded-full glass animate-pulse" />
              </div>
              <div className="h-6 w-16 rounded-full glass animate-pulse" />
              <div className="h-8 w-24 rounded-xl glass animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { isAdmin, loading: profileLoading } = useProfile()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (profileLoading) return
    if (!isAdmin) { router.replace("/"); return }

    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false) })
  }, [isAdmin, profileLoading, router])

  async function toggleRole(user: UserRecord) {
    const newRole = user.role === "admin" ? "user" : "admin"
    setUpdating(user.id)
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, role: newRole }),
    })
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u))
    }
    setUpdating(null)
  }

  if (profileLoading || loading) return <AdminUsersSkeleton />

  const adminCount = users.filter((u) => u.role === "admin").length

  return (
    <div className="min-h-screen bg-background px-4 py-12 relative overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute -top-32 left-1/4 w-125 h-125 rounded-full blur-[100px]" style={{ background: "var(--page-orb-1)" }} />

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 animate-float-up">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 flex items-center justify-center rounded-xl glass hover:opacity-80 transition-opacity shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการผู้ใช้</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {users.length} ผู้ใช้ · {adminCount} admin
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-linear-to-r ${accentGradient} shadow-lg ${accentShadowSm}`}>
            <Shield size={13} className="text-white" />
            <span className="text-xs font-semibold text-white">Admin Panel</span>
          </div>
        </div>

        {/* User list */}
        <div className="glass rounded-2xl overflow-hidden animate-float-up">
          {users.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>ไม่พบผู้ใช้</p>
          )}
          {users.map((u, i) => (
            <div
              key={u.id}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-black/3 dark:hover:bg-white/3"
              style={{ borderBottom: i < users.length - 1 ? "1px solid var(--glass-border)" : "none" }}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white bg-linear-to-br ${accentGradient}`}>
                {u.email[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                    สมัคร {formatDate(u.created_at)}
                  </span>
                  {u.email_confirmed_at ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle size={11} />
                      ยืนยันแล้ว
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-500 dark:text-amber-400">
                      <XCircle size={11} />
                      ยังไม่ยืนยัน
                    </span>
                  )}
                </div>
              </div>

              {/* Role badge */}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                u.role === "admin"
                  ? "bg-violet-500/10 border border-violet-500/25 text-violet-600 dark:text-violet-400"
                  : "bg-black/5 dark:bg-white/8 text-gray-500 dark:text-white/50 border border-transparent"
              }`}>
                {u.role === "admin" ? "Admin" : "User"}
              </span>

              {/* Toggle button */}
              <button
                onClick={() => toggleRole(u)}
                disabled={updating === u.id}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  u.role === "admin"
                    ? "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                    : `bg-linear-to-r ${accentGradient} ${accentHover} text-white shadow-sm`
                }`}
              >
                {updating === u.id
                  ? "..."
                  : u.role === "admin"
                  ? "ถอด Admin"
                  : "ตั้งเป็น Admin"
                }
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-center mt-4" style={{ color: "var(--text-faint)" }}>
          ไม่สามารถเปลี่ยน role ของตัวเองได้
        </p>
      </div>
    </div>
  )
}
