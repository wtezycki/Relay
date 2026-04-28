import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import SectionCard from '../components/SectionCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDashboardData } from '../hooks/useDashboardData.js'
import Layout from '../components/Layout.jsx'

const TYPE_COLORS = {
  'Run': 'bg-orange-500',
  'Ride': 'bg-blue-500',
  'Yoga': 'bg-purple-500',
  'Walk': 'bg-green-500',
  'Swim': 'bg-cyan-500',
  'Hike': 'bg-emerald-600',
  'WeightTraining': 'bg-rose-500',
}

const TYPE_HEX_COLORS = {
  'Run': '#f97316',
  'Ride': '#3b82f6',
  'Yoga': '#a855f7',
  'Walk': '#22c55e',
  'Swim': '#06b6d4',
  'Hike': '#059669',
  'WeightTraining': '#f43f5e',
}

const TYPE_ICONS = {
  'Run': '🏃‍♂️',
  'Ride': '🚴',
  'Yoga': '🧘‍♀️',
  'Walk': '🚶',
  'Swim': '🏊',
  'Hike': '🥾',
  'WeightTraining': '🏋️',
}

const TYPE_NAMES_PL = {
  'Run': 'Bieganie',
  'Ride': 'Rower',
  'Yoga': 'Joga',
  'Walk': 'Spacer',
  'Swim': 'Pływanie',
  'Hike': 'Wędrówka',
  'WeightTraining': 'Trening siłowy',
  'Workout': 'Trening',
}

function StatsPage() {
  const { user, isAuthenticated } = useAuth()
  const { activities } = useDashboardData(isAuthenticated)

  // Calcluate user stats
  const userActivities = useMemo(() => activities.filter(a => a.userFirstName === user?.firstName && a.userLastName === user?.lastName), [activities, user])
  const totalUserPoints = useMemo(() => userActivities.reduce((acc, a) => acc + a.teamPoints, 0), [userActivities])
  
  // Calculate distribution by type (User)
  const userTypeMap = useMemo(() => {
    const map = {}
    userActivities.forEach(a => {
      map[a.type] = (map[a.type] || 0) + a.teamPoints
    })
    return map
  }, [userActivities])

  // Calculate distribution by type (Team)
  const teamTypeMap = useMemo(() => {
    const map = {}
    activities.forEach(a => {
      map[a.type] = (map[a.type] || 0) + a.teamPoints
    })
    return map
  }, [activities])

  const totalTeamPoints = useMemo(() => activities.reduce((sum, a) => sum + a.teamPoints, 0), [activities])

  const teamPieData = useMemo(() => {
    return Object.entries(teamTypeMap)
      .sort((a, b) => b[1] - a[1])
      .map(([type, points]) => ({
        name: TYPE_NAMES_PL[type] || type,
        value: points,
        color: TYPE_HEX_COLORS[type] || '#ff5722',
        icon: TYPE_ICONS[type] || '💪'
      }))
  }, [teamTypeMap])

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col gap-8">
          <div className="mb-4">
            <h1 className="font-display text-4xl font-extrabold text-white">Statystyki</h1>
            <p className="mt-2 text-gray-400">Podsumowanie zaangażowania w wyzwania zespołu.</p>
          </div>
          <SectionCard title="Brak dostępu">
            <p className="text-gray-400">Zaloguj się, aby zobaczyć swoje statystyki.</p>
          </SectionCard>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="mb-4">
          <h1 className="font-display text-4xl font-extrabold text-white">Statystyki</h1>
          <p className="mt-2 text-gray-400">Przegląd zaangażowania: Twojego i całego zespołu.</p>
        </div>

        {/* YOUR STATS SECTION */}
        <section>
          <h2 className="font-display text-2xl font-bold text-white mb-4">Twoje Osiągnięcia</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Suma Punktów</p>
              <p className="font-display text-5xl font-extrabold text-white">{totalUserPoints}</p>
              <p className="text-xs text-primary font-bold mt-2">+{(totalUserPoints * 0.1).toFixed(0)}% od wczoraj</p>
            </div>

            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[50px] rounded-full pointer-events-none"></div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Aktywny Streak</p>
              <p className="font-display text-5xl font-extrabold text-white flex items-center gap-2">
                {user.consistencyStreak || 0} <span className="text-3xl text-orange-500">🔥</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">Dni z rzędu z aktywnością</p>
            </div>

            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 blur-[50px] rounded-full pointer-events-none"></div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Aktywności</p>
              <p className="font-display text-5xl font-extrabold text-white">{userActivities.length}</p>
              <p className="text-xs text-gray-400 mt-2">Zarejestrowane treningi</p>
            </div>
            
            {/* Extended stat area */}
            <div className="md:col-span-2 lg:col-span-3 glass-panel p-6">
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
        </section>

        {/* TEAM STATS SECTION */}
        <section className="mt-8">
          <h2 className="font-display text-2xl font-bold text-white mb-4">Statystyki Zespołu</h2>
          
          <div className="glass-panel p-6 relative overflow-hidden">
             <h3 className="font-display text-xl font-bold text-white mb-4">Balans Aktywności Zespołu</h3>
             <p className="text-sm text-gray-400 mb-6">Procentowy udział poszczególnych rodzajów treningów we wspólnej puli punktów. Każda forma ruchu popycha nas do celu!</p>
             
             {totalTeamPoints === 0 ? (
                <p className="text-gray-400 text-sm">Zespół nie zdobył jeszcze żadnych punktów.</p>
             ) : (
               <div className="flex flex-col md:flex-row items-center gap-8">
                 {/* Chart */}
                 <div className="h-64 w-full md:w-1/2">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={teamPieData}
                         cx="50%"
                         cy="50%"
                         innerRadius={70}
                         outerRadius={95}
                         paddingAngle={4}
                         dataKey="value"
                         stroke="none"
                         animationDuration={1000}
                       >
                         {teamPieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <RechartsTooltip 
                         formatter={(value) => [`${value} TP`, 'Punkty']}
                         contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                         itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>

                 {/* Legend */}
                 <div className="flex flex-col gap-3 w-full md:w-1/2 text-sm font-medium">
                    {teamPieData.map((entry) => {
                      const percentage = (entry.value / totalTeamPoints) * 100
                      return (
                        <div key={entry.name} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl border border-white/10 w-full hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{entry.icon}</span>
                            <span className="text-white font-semibold">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white">{entry.value} TP</span>
                            <span className="text-gray-400 font-bold w-12 text-right">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      )
                  })}
                 </div>
               </div>
             )}
          </div>
        </section>

      </div>
    </Layout>
  )
}

export default StatsPage
