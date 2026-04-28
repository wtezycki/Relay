import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
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
  'RockClimbing': 'bg-slate-500',
  'Bouldering': 'bg-slate-600',
  'AlpineSki': 'bg-sky-400',
  'Snowboard': 'bg-sky-500',
  'IceSkate': 'bg-sky-300',
  'InlineSkate': 'bg-indigo-500',
  'Kayaking': 'bg-blue-400',
  'Rowing': 'bg-blue-600',
  'Crossfit': 'bg-rose-600',
  'Elliptical': 'bg-rose-400',
  'VirtualRide': 'bg-blue-300',
  'VirtualRun': 'bg-orange-300',
}

const TYPE_HEX_COLORS = {
  'Run': '#f97316',
  'Ride': '#3b82f6',
  'Yoga': '#a855f7',
  'Walk': '#22c55e',
  'Swim': '#06b6d4',
  'Hike': '#059669',
  'WeightTraining': '#f43f5e',
  'RockClimbing': '#64748b',
  'Bouldering': '#475569',
  'AlpineSki': '#38bdf8',
  'Snowboard': '#0ea5e9',
  'IceSkate': '#7dd3fc',
  'InlineSkate': '#6366f1',
  'Kayaking': '#60a5fa',
  'Rowing': '#2563eb',
  'Crossfit': '#e11d48',
  'Elliptical': '#fb7185',
  'VirtualRide': '#93c5fd',
  'VirtualRun': '#fdba74',
}

const TYPE_ICONS = {
  'Run': '🏃‍♂️',
  'Ride': '🚴',
  'Yoga': '🧘‍♀️',
  'Walk': '🚶',
  'Swim': '🏊',
  'Hike': '🥾',
  'WeightTraining': '🏋️',
  'RockClimbing': '🧗',
  'Bouldering': '🧗‍♂️',
  'AlpineSki': '⛷️',
  'Snowboard': '🏂',
  'IceSkate': '⛸️',
  'InlineSkate': '🛼',
  'Kayaking': '🛶',
  'Rowing': '🚣',
  'Crossfit': '💪',
  'Elliptical': '🏃',
  'VirtualRide': '🚴‍♂️',
  'VirtualRun': '🏃',
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

function StatsPage() {
  const { user, isAuthenticated } = useAuth()
  const { activities } = useDashboardData(isAuthenticated)

  const teamTypeMap = useMemo(() => {
    const map = {}
    activities.forEach(a => {
      map[a.type] = (map[a.type] || 0) + a.teamPoints
    })
    return map
  }, [activities])

  const totalTeamPoints = useMemo(() => activities.reduce((sum, a) => sum + a.teamPoints, 0), [activities])

  const totalDistanceKm = useMemo(() => {
    return (activities.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000).toFixed(0)
  }, [activities])

  const totalTimeHours = useMemo(() => {
    return (activities.reduce((sum, a) => sum + (a.movingTimeSeconds || 0), 0) / 3600).toFixed(0)
  }, [activities])

  const last7DaysData = useMemo(() => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-CA')

      const dayPoints = activities
        .filter(a => a.occurredAt && new Date(a.occurredAt).toLocaleDateString('en-CA') === dateStr)
        .reduce((sum, a) => sum + a.teamPoints, 0)

      data.push({
        name: d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
        TP: dayPoints
      })
    }
    return data
  }, [activities])

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

        {/* TEAM STATS SECTION */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-white mb-4">Statystyki Zespołu</h2>

          { }
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Razem Punktów</p>
              <p className="font-display text-5xl font-extrabold text-white">{totalTeamPoints} <span className="text-2xl text-primary">TP</span></p>
            </div>
            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none"></div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Pokonany Dystans</p>
              <p className="font-display text-5xl font-extrabold text-white">{totalDistanceKm} <span className="text-2xl text-blue-400">km</span></p>
            </div>
            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 blur-[50px] rounded-full pointer-events-none"></div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Czas w Ruchu</p>
              <p className="font-display text-5xl font-extrabold text-white">{totalTimeHours} <span className="text-2xl text-green-400">godz.</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            { }
            <div className="glass-panel p-6 relative overflow-hidden">
              <h3 className="font-display text-xl font-bold text-white mb-2">Aktywność (Ostatnie 7 dni)</h3>
              <p className="text-sm text-gray-400 mb-6">Suma zdobytych punktów przez cały zespół dzień po dniu.</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} interval={0} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.75rem', color: '#fff' }}
                    />
                    <Bar dataKey="TP" fill="#ff5722" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            { }
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
                        <div key={entry.name} className="flex items-center justify-between bg-white/5 px-3 py-2.5 rounded-xl border border-white/10 w-full hover:bg-white/10 transition-colors gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-base shrink-0">{entry.icon}</span>
                            <span className="text-white font-semibold text-sm truncate" title={entry.name}>{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-white text-sm whitespace-nowrap">{entry.value} TP</span>
                            <span className="text-gray-400 font-bold w-10 text-right text-sm">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </Layout>
  )
}

export default StatsPage
