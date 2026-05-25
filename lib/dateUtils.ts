export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
}

export function formatAttemptDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
  // Compare calendar dates (local time) — not raw millisecond difference
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((nowDay.getTime() - dDay.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return `วันนี้ ${time}`
  if (diffDays === 1) return `เมื่อวาน ${time}`
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" }) + ` ${time}`
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  return `${m}:${String(seconds % 60).padStart(2, "0")}`
}
