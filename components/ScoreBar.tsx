interface Props {
  percent: number
  gradient: string
  height?: string
  transition?: boolean
}

export default function ScoreBar({ percent, gradient, height = "h-1.5", transition = false }: Props) {
  return (
    <div className={`w-full rounded-full ${height} overflow-hidden`} style={{ background: "var(--input-bg)" }}>
      <div
        className={`bg-linear-to-r ${gradient} h-full rounded-full ${transition ? "transition-all duration-700" : ""}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
