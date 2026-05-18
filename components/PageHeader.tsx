"use client"

import { ChevronLeft } from "lucide-react"

interface Props {
  onBack: () => void
  title?: string
  subtitle?: string
  trailing?: React.ReactNode
}

export default function PageHeader({ onBack, title, subtitle, trailing }: Props) {
  return (
    <div className="flex items-center gap-3 mb-10 animate-float-up">
      <button
        onClick={onBack}
        className="w-9 h-9 flex items-center justify-center rounded-xl glass hover:opacity-80 transition-opacity shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft size={18} />
      </button>
      {title && (
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
        </div>
      )}
      {trailing}
    </div>
  )
}
