interface Props {
  errors: string[]
}

export default function ErrorAlert({ errors }: Props) {
  if (errors.length === 0) return null
  return (
    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 mb-6 animate-scale-in">
      <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
        {errors.map((e, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
            {e}
          </li>
        ))}
      </ul>
    </div>
  )
}
