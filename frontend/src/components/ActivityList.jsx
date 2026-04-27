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
          className="flex items-center justify-between rounded-2xl border border-pine/10 bg-cream/60 px-4 py-3"
        >
          <div>
            <p className="font-medium text-ink">{activity.type}</p>
            <p className="text-sm text-ink/60">Strava ID: {activity.stravaActivityId}</p>
          </div>
          <div className="rounded-full bg-ember/10 px-3 py-1 text-sm font-semibold text-ember">
            {activity.teamPoints} TP
          </div>
        </article>
      ))}
    </div>
  )
}

export default ActivityList
