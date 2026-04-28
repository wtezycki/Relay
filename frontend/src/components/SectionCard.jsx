function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="glass-panel p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  )
}

export default SectionCard
