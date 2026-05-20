"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export function useResetPassword() {
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
    const { error: authError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (authError) {
      setError("ไม่สามารถเปลี่ยนรหัสผ่านได้ ลิงก์อาจหมดอายุแล้ว")
    } else {
      setDone(true)
    }
  }

  return { password, setPassword, confirm, setConfirm, loading, error, done, handleSubmit }
}
