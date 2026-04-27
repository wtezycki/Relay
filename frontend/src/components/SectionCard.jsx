function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl font-bold text-ink">{title}</p>
          {subtitle ? <p className="text-sm text-ink/70">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export default SectionCard
