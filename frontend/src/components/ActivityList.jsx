function ActivityList({ activities }) {
  if (!activities.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400">
        Żadne aktywności nie zostały jeszcze zsynchronizowane.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <article
          key={activity.id}
          className="glass-card p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between group"
        >
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-white flex items-center gap-2">
                {activity.userFirstName} {activity.userLastName}
                {activity.userConsistencyStreak > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-400 border border-orange-500/20">
                    🔥 {activity.userConsistencyStreak}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                {formatActivityDate(activity.occurredAt)} <span className="mx-1 opacity-50">•</span> {activity.type}
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors">
                {activity.activityName || formatFallbackActivityName(activity.type)}
              </p>
              <p className="text-xs text-gray-400">
                {formatActivityDetails(activity)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-surface-hover border border-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Strava #{activity.stravaActivityId}
            </div>
            <div className="rounded-full bg-primary/20 border border-primary/30 px-4 py-1.5 text-sm font-bold text-primary shadow-glow">
              {activity.teamPoints} TP
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function formatActivityDate(occurredAt) {
  if (!occurredAt) {
    return 'Brak daty'
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(occurredAt))
}

function formatFallbackActivityName(type) {
  return type ? `${type} bez nazwy` : 'Aktywność bez nazwy'
}

function formatActivityDetails(activity) {
  const details = []

  if (typeof activity.distanceMeters === 'number') {
    details.push(`${(activity.distanceMeters / 1000).toFixed(1)} km`)
  }

  if (typeof activity.movingTimeSeconds === 'number') {
    details.push(formatDuration(activity.movingTimeSeconds))
  }

  return details.length ? details.join(' • ') : 'Brak dodatkowych danych'
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} godz. ${minutes} min`
  }

  return `${minutes} min`
}

export default ActivityList
