import { useMemo } from 'react'
import { User as UserIcon, Medal } from 'lucide-react'
import SectionCard from '../components/SectionCard.jsx'
import ActivityList from '../components/ActivityList.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDashboardData } from '../hooks/useDashboardData.js'
import Layout from '../components/Layout.jsx'

const TYPE_ICONS = {
  'Run': '🏃‍♂️', 'Ride': '🚴', 'Yoga': '🧘‍♀️', 'Walk': '🚶', 'Swim': '🏊',
  'Hike': '🥾', 'WeightTraining': '🏋️', 'RockClimbing': '🧗', 'Bouldering': '🧗‍♂️',
  'AlpineSki': '⛷️', 'Snowboard': '🏂', 'IceSkate': '⛸️', 'InlineSkate': '🛼',
  'Kayaking': '🛶', 'Rowing': '🚣', 'Crossfit': '💪', 'Elliptical': '🏃',
  'VirtualRide': '🚴‍♂️', 'VirtualRun': '🏃',
}

const TYPE_NAMES_PL = {
  'Run': 'Bieganie', 'Ride': 'Rower', 'Yoga': 'Joga', 'Walk': 'Spacer',
  'Swim': 'Pływanie', 'Hike': 'Wędrówka', 'WeightTraining': 'Trening siłowy',
  'Workout': 'Trening', 'RockClimbing': 'Wspinaczka', 'Bouldering': 'Bouldering',
  'AlpineSki': 'Narciarstwo', 'Snowboard': 'Snowboard', 'IceSkate': 'Łyżwy',
  'InlineSkate': 'Rolki', 'Kayaking': 'Kajakarstwo', 'Rowing': 'Wioślarstwo',
  'Crossfit': 'Crossfit', 'Elliptical': 'Orbitrek', 'VirtualRide': 'Rower wirtualny',
  'VirtualRun': 'Bieg wirtualny',
}

function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const { activities, setActivities } = useDashboardData(isAuthenticated)

  const userActivities = useMemo(() => {
    if (!activities) return []
    return activities.filter(a => a.userFirstName === user?.firstName && a.userLastName === user?.lastName)
  }, [activities, user])

  const totalUserPoints = useMemo(() => userActivities.reduce((acc, a) => acc + a.teamPoints, 0), [userActivities])

  const userTypeMap = useMemo(() => {
    const map = {}
    userActivities.forEach(a => {
      map[a.type] = (map[a.type] || 0) + a.teamPoints
    })
    return map
  }, [userActivities])

  const badges = useMemo(() => {
    const earned = []
    if (userActivities.some(a => {
      const h = new Date(a.occurredAt).getHours()
      return h >= 22 || h < 4
    })) earned.push({ icon: '🦉', name: 'Nocny Marek', desc: 'Trening po 22:00' })

    if (userActivities.some(a => {
      const h = new Date(a.occurredAt).getHours()
      return h >= 4 && h <= 7
    })) earned.push({ icon: '☕', name: 'Ranny Ptaszek', desc: 'Trening przed 7:00' })

    if (userActivities.some(a => {
      const d = new Date(a.occurredAt).getDay()
      return d === 0 || d === 6
    })) earned.push({ icon: '⛰️', name: 'Wojownik', desc: 'Aktywność w weekend' })

    if (totalUserPoints >= 100) earned.push({ icon: '💯', name: 'Setka', desc: 'Zdobyte 100 TP' })

    if (earned.length === 0) earned.push({ icon: '🌱', name: 'Początki', desc: 'Czekamy na pierwsze medale' })
    return earned
  }, [userActivities, totalUserPoints])

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col gap-8">
          <div className="mb-4">
            <h1 className="font-display text-4xl font-extrabold text-white">Mój Profil</h1>
          </div>
          <SectionCard title="Brak dostępu">
            <p className="text-gray-400">Zaloguj się, aby zobaczyć swój profil.</p>
          </SectionCard>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-6 glass-panel p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.firstName} className="w-24 h-24 rounded-full object-cover border-4 border-white/10 z-10" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-surface-hover flex items-center justify-center border-4 border-white/10 z-10">
              <span className="text-3xl text-gray-400 font-bold">{user?.firstName?.charAt(0)}</span>
            </div>
          )}
          <div className="z-10">
            <h1 className="font-display text-4xl font-extrabold text-white">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-400 mt-1">Członek zespołu Relay</p>
          </div>
        </div>

        {/* STATS & BADGES */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 grid gap-6 grid-cols-2">
            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Zdobyte TP</p>
              <p className="font-display text-5xl font-extrabold text-white">{totalUserPoints}</p>
            </div>
            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[50px] rounded-full pointer-events-none"></div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Aktywny Streak</p>
              <p className="font-display text-5xl font-extrabold text-white flex items-center gap-2">
                {user.consistencyStreak || 0} <span className="text-3xl text-orange-500">🔥</span>
              </p>
            </div>
            
            <div className="col-span-2 glass-panel p-6">
               <h3 className="font-display text-xl font-bold text-white mb-6">Twoje główne źródła punktów</h3>
               {Object.keys(userTypeMap).length === 0 ? (
                 <p className="text-gray-400 text-sm">Zrób pierwszy trening, aby zobaczyć statystyki!</p>
               ) : (
                 <div className="space-y-4">
                   {Object.entries(userTypeMap)
                     .sort((a, b) => b[1] - a[1])
                     .map(([type, points]) => {
                     const translatedType = TYPE_NAMES_PL[type] || type
                     return (
                     <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="font-semibold text-white">{TYPE_ICONS[type] || '💪'} {translatedType}</span>
                           <span className="text-gray-400">{points} TP ({Math.round(points / totalUserPoints * 100)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.round(points / totalUserPoints * 100)}%` }}></div>
                        </div>
                     </div>
                   )})}
                 </div>
               )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-500" /> Odznaki
            </h3>
            <div className="flex flex-col gap-4">
              {badges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-2xl shadow-inner">
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-white font-bold">{badge.name}</p>
                    <p className="text-xs text-gray-400">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SectionCard title="Twoja historia aktywności">
           <ActivityList activities={userActivities} setActivities={setActivities} user={user} />
        </SectionCard>
      </div>
    </Layout>
  )
}

export default ProfilePage
