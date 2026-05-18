export interface GradeInfo {
  label: string
  emoji: string
  ringColor: string
  glowColor: string
  textCls: string
  bgCls: string
}

export function getGradeInfo(percent: number): GradeInfo {
  if (percent >= 80) return {
    label: "ยอดเยี่ยม!", emoji: "🏆",
    ringColor: "#f59e0b", glowColor: "rgba(245,158,11,0.15)",
    textCls: "text-amber-500", bgCls: "bg-amber-500/10 border-amber-500/20",
  }
  if (percent >= 60) return {
    label: "ดีมาก!", emoji: "🎉",
    ringColor: "#10b981", glowColor: "rgba(16,185,129,0.15)",
    textCls: "text-emerald-500", bgCls: "bg-emerald-500/10 border-emerald-500/20",
  }
  if (percent >= 40) return {
    label: "พอใช้", emoji: "👍",
    ringColor: "#6366f1", glowColor: "rgba(99,102,241,0.15)",
    textCls: "text-indigo-500", bgCls: "bg-indigo-500/10 border-indigo-500/20",
  }
  return {
    label: "ลองใหม่!", emoji: "💪",
    ringColor: "#f97316", glowColor: "rgba(249,115,22,0.15)",
    textCls: "text-orange-500", bgCls: "bg-orange-500/10 border-orange-500/20",
  }
}
