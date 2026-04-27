function ProgressBar({ percentage }) {
  const safePercentage = Math.max(0, Math.min(100, percentage))

  return (
    <div className="h-4 overflow-hidden rounded-full bg-pine/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-ember via-[#f2a65a] to-moss transition-[width] duration-500"
        style={{ width: `${safePercentage}%` }}
      />
    </div>
  )
}

export default ProgressBar
