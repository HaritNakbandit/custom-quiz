"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

type Role = "admin" | "user" | null

export function useProfile() {
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      setRole((data?.role as Role) ?? "user")
      setLoading(false)
    }
    load()
  }, [])

  return { role, isAdmin: role === "admin", loading }
}
