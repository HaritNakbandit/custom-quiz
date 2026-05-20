"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

type Mode = "login" | "signup"
type Step = "form" | "verify" | "forgot" | "forgot-sent"

export function useAuthFlow(next: string) {
  const router = useRouter()

  const [mode, setMode] = useState<Mode>("login")
  const [step, setStep] = useState<Step>("form")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsVerify, setNeedsVerify] = useState(false)
  const [resent, setResent] = useState(false)

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
    setNeedsVerify(false)

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setNeedsVerify(true)
          setError("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ")
        } else {
          setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
        }
      } else {
        router.push(next)
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setError("ไม่สามารถสมัครสมาชิกได้ อาจมีบัญชีนี้อยู่แล้ว")
      } else {
        setStep("verify")
      }
    }

    setLoading(false)
  }

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    setStep("forgot-sent")
  }

  async function handleResend() {
    setLoading(true)
    setResent(false)
    await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setResent(true)
    setLoading(false)
  }

  function goToForgot() {
    setStep("forgot")
    setError("")
  }

  function switchMode() {
    setMode((m) => (m === "login" ? "signup" : "login"))
    setError("")
    setNeedsVerify(false)
  }

  return {
    mode, step,
    email, setEmail,
    password, setPassword,
    loading, error,
    needsVerify, resent,
    handleGoogleLogin,
    handleSubmit,
    handleForgotPassword,
    handleResend,
    goToForgot,
    switchMode,
  }
}
