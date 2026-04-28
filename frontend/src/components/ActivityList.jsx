function ActivityList({ activities }) {
  if (!activities.length) {
    return (
      <div className="rounded-2xl border border-dashed border-pine/20 bg-pine/5 p-5 text-sm text-ink/70">
        Żadne aktywności nie zostały jeszcze zsynchronizowane.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <article
          key={activity.id}
          className="flex flex-col gap-4 rounded-[1.75rem] border border-pine/10 bg-cream/60 px-4 py-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="space-y-2">
            <div>
              <p className="font-medium text-ink flex items-center gap-1">
                {activity.userFirstName} {activity.userLastName}
                {activity.userConsistencyStreak > 0 && (
                  <span className="text-sm font-semibold text-ember ml-1">
                    🔥 {activity.userConsistencyStreak}
                  </span>
                )}
              </p>
              <p className="text-sm text-ink/60">
                {formatActivityDate(activity.occurredAt)} · {activity.type}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                {activity.activityName || formatFallbackActivityName(activity.type)}
              </p>
              <p className="text-sm text-ink/60">
                {formatActivityDetails(activity)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
              Strava #{activity.stravaActivityId}
            </div>
            <div className="rounded-full bg-ember/10 px-3 py-1 text-sm font-semibold text-ember">
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

  return details.length ? details.join(' · ') : 'Brak dodatkowych danych'
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
