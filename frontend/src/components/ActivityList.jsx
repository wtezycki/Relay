import { ThumbsUp } from 'lucide-react'
import api from '../services/api.js'

const TYPE_NAMES_PL = {
  'Run': 'Bieganie',
  'Ride': 'Rower',
  'Yoga': 'Joga',
  'Walk': 'Spacer',
  'Swim': 'Pływanie',
  'Hike': 'Wędrówka',
  'WeightTraining': 'Trening siłowy',
  'Workout': 'Trening',
  'RockClimbing': 'Wspinaczka',
  'Bouldering': 'Bouldering',
  'AlpineSki': 'Narciarstwo',
  'Snowboard': 'Snowboard',
  'IceSkate': 'Łyżwy',
  'InlineSkate': 'Rolki',
  'Kayaking': 'Kajakarstwo',
  'Rowing': 'Wioślarstwo',
  'Crossfit': 'Crossfit',
  'Elliptical': 'Orbitrek',
  'VirtualRide': 'Rower wirtualny',
  'VirtualRun': 'Bieg wirtualny',
}

function ActivityList({ activities, setActivities, user }) {
  if (!activities.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400">
        Żadne aktywności nie zostały jeszcze zsynchronizowane.
      </div>
    )
  }

  const handleLike = async (activityId) => {
    if (!user) return
    try {
      setActivities(current => current.map(a => {
        if (a.id === activityId) {
          const likedUserIds = a.likedUserIds || []
          const hasLikedActivity = likedUserIds.includes(user.id)
          const nextLikedUserIds = hasLikedActivity
            ? likedUserIds.filter(id => id !== user.id)
            : [...likedUserIds, user.id]
          return { ...a, likedUserIds: nextLikedUserIds }
        }
        return a
      }))

      await api.post(`/api/activities/${activityId}/likes`)
    } catch (error) {
      console.error('Failed to toggle like', error)
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const translatedType = TYPE_NAMES_PL[activity.type] || activity.type
        const likedUserIds = activity.likedUserIds || []
        const likesCount = likedUserIds.length
        const hasLiked = user && likedUserIds.includes(user.id)

        return (
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
                  {formatActivityDate(activity.occurredAt)} <span className="mx-1 opacity-50">•</span> {translatedType}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors">
                  {activity.activityName || formatFallbackActivityName(translatedType)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatActivityDetails(activity)}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={() => handleLike(activity.id)}
                disabled={!user}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${hasLiked
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(255,87,34,0.2)]'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-primary' : ''}`} />
                {likesCount > 0 ? likesCount : null}
              </button>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-surface-hover border border-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  #{activity.stravaActivityId}
                </div>
                <div className="rounded-full bg-primary/20 border border-primary/30 px-3 py-1.5 text-sm font-bold text-primary shadow-glow">
                  {activity.teamPoints} TP
                </div>
              </div>
            </div>
          </article>
        )
      })}
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
