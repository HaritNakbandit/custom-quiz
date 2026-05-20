"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/shared/useProfile"
import type { UserRecord } from "@/types/user"
export { formatDate } from "@/lib/dateUtils"
export type { UserRecord } from "@/types/user"

export function useAdminUsers() {
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

  return { users, loading: profileLoading || loading, updating, toggleRole }
}
