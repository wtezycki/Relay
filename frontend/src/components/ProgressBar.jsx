function ProgressBar({ percentage }) {
  const safePercentage = Math.max(0, Math.min(100, percentage))

  return (
    <div className="h-4 overflow-hidden rounded-full bg-surface-hover shadow-inner relative">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 shadow-glow relative"
        style={{ width: `${safePercentage}%` }}
      >
        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]"></div>
      </div>
    </div>
  )
}

export default ProgressBar
