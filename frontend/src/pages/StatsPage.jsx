import SectionCard from '../components/SectionCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDashboardData } from '../hooks/useDashboardData.js'
import Layout from '../components/Layout.jsx'

function StatsPage() {
  const { user, isAuthenticated } = useAuth()
  const { activities } = useDashboardData(isAuthenticated)

  // Calcluate user stats
  const userActivities = activities.filter(a => a.userFirstName === user?.firstName && a.userLastName === user?.lastName)
  const totalUserPoints = userActivities.reduce((acc, a) => acc + a.teamPoints, 0)
  
  // Calculate distribution by type
  const typeMap = {}
  userActivities.forEach(a => {
    typeMap[a.type] = (typeMap[a.type] || 0) + a.teamPoints
  })

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="mb-4">
          <h1 className="font-display text-4xl font-extrabold text-white">Twoje Statystyki</h1>
          <p className="mt-2 text-gray-400">Podsumowanie Twojego zaangażowania w wyzwania zespołu.</p>
        </div>

        {!isAuthenticated ? (
          <SectionCard title="Brak dostępu">
            <p className="text-gray-400">Zaloguj się, aby zobaczyć swoje statystyki.</p>
          </SectionCard>
        ) : (
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
               <h3 className="font-display text-xl font-bold text-white mb-6">Źródła punktów</h3>
               {Object.keys(typeMap).length === 0 ? (
                 <p className="text-gray-400 text-sm">Zrób pierwszy trening aby zobaczyć statystyki!</p>
               ) : (
                 <div className="space-y-4">
                   {Object.entries(typeMap).map(([type, points]) => (
                     <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="font-semibold text-white">{type}</span>
                           <span className="text-gray-400">{points} TP ({Math.round(points / totalUserPoints * 100)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.round(points / totalUserPoints * 100)}%` }}></div>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default StatsPage
