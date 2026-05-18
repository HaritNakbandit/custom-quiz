import {
  Zap, Globe, Atom, BookOpen, Brain, Target, Rocket, Trophy,
  Code2, FlaskConical, Calculator, Music2, Palette, Gamepad2,
  Shield, Lightbulb, GraduationCap, Cpu, Map, Languages,
  type LucideIcon,
} from "lucide-react"

export const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Globe, Atom, BookOpen, Brain, Target, Rocket, Trophy,
  Code2, FlaskConical, Calculator, Music2, Palette, Gamepad2,
  Shield, Lightbulb, GraduationCap, Cpu, Map, Languages,
}

export const COLOR_MAP: Record<string, { gradient: string; shadow: string }> = {
  violet:  { gradient: "from-violet-500 to-purple-600",  shadow: "rgba(139,92,246,0.35)" },
  indigo:  { gradient: "from-indigo-500 to-blue-600",    shadow: "rgba(99,102,241,0.35)" },
  sky:     { gradient: "from-sky-400 to-cyan-500",       shadow: "rgba(56,189,248,0.35)" },
  teal:    { gradient: "from-teal-400 to-emerald-600",   shadow: "rgba(45,212,191,0.35)" },
  emerald: { gradient: "from-emerald-400 to-teal-500",   shadow: "rgba(52,211,153,0.35)" },
  amber:   { gradient: "from-amber-400 to-orange-500",   shadow: "rgba(251,191,36,0.35)" },
  orange:  { gradient: "from-orange-400 to-red-500",     shadow: "rgba(251,146,60,0.35)" },
  rose:    { gradient: "from-rose-500 to-pink-600",      shadow: "rgba(244,63,94,0.35)"  },
  slate:   { gradient: "from-slate-400 to-slate-600",    shadow: "rgba(100,116,139,0.35)" },
}

export const ICON_LIST = Object.keys(ICON_MAP)
export const COLOR_LIST = Object.keys(COLOR_MAP)

interface QuizIconProps {
  icon: string
  color: string
  size?: "sm" | "md" | "lg"
}

const SIZE = { sm: { box: "w-10 h-10 rounded-xl", icon: 18 }, md: { box: "w-12 h-12 rounded-2xl", icon: 22 }, lg: { box: "w-16 h-16 rounded-2xl", icon: 28 } }

export function QuizIcon({ icon, color, size = "md" }: QuizIconProps) {
  const Icon = ICON_MAP[icon] ?? Zap
  const c = COLOR_MAP[color] ?? COLOR_MAP.violet
  const s = SIZE[size]
  return (
    <div
      className={`${s.box} flex items-center justify-center bg-linear-to-br ${c.gradient} shrink-0`}
      style={{ boxShadow: `0 4px 14px ${c.shadow}` }}
    >
      <Icon size={s.icon} className="text-white" strokeWidth={1.8} />
    </div>
  )
}
