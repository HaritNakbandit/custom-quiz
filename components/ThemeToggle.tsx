"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  if (!mounted) return <div className="w-9 h-9" />

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="w-9 h-9 flex items-center justify-center rounded-xl glass transition-all hover:scale-105 active:scale-95"
      title={isDark ? "เปลี่ยนเป็น Light mode" : "เปลี่ยนเป็น Dark mode"}
    >
      {isDark
        ? <Sun size={16} className="text-yellow-400" />
        : <Moon size={16} className="text-blue-700" />
      }
    </button>
  )
}
