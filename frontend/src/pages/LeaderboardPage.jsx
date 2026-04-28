import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Medal } from 'lucide-react'
import SectionCard from '../components/SectionCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDashboardData } from '../hooks/useDashboardData.js'
import Layout from '../components/Layout.jsx'

function LeaderboardPage() {
  const { user, isAuthenticated } = useAuth()
  const { activities } = useDashboardData(isAuthenticated)

  const leaderboard = useMemo(() => {
    if (!activities) return []
    
    const userMap = {}
    
    activities.forEach(a => {
      const key = a.userId
      if (!userMap[key]) {
        userMap[key] = {
          userId: a.userId,
          firstName: a.userFirstName,
          lastName: a.userLastName,
          points: 0,
          activitiesCount: 0,
          latestStreak: 0
        }
      }
      userMap[key].points += a.teamPoints
      userMap[key].activitiesCount += 1
      if (a.userConsistencyStreak > userMap[key].latestStreak) {
        userMap[key].latestStreak = a.userConsistencyStreak
      }
    })
    
    return Object.values(userMap).sort((a, b) => b.points - a.points)
  }, [activities])

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col gap-8">
          <div className="mb-4">
            <h1 className="font-display text-4xl font-extrabold text-white">Ranking</h1>
            <p className="mt-2 text-gray-400">Zobacz kto jest liderem naszej rywalizacji.</p>
          </div>
          <SectionCard title="Brak dostępu">
            <p className="text-gray-400">Zaloguj się, aby zobaczyć ranking.</p>
          </SectionCard>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="mb-4">
          <h1 className="font-display text-4xl font-extrabold text-white flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Ranking
          </h1>
          <p className="mt-2 text-gray-400">Tabela wszech czasów. Każdy punkt przybliża cały zespół do celu, ale kto ma ich najwięcej?</p>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="space-y-4 relative z-10">
            {leaderboard.length === 0 ? (
              <p className="text-gray-400 text-sm">Brak danych do rankingu.</p>
            ) : (
              leaderboard.map((player, index) => {
                const isCurrentUser = player.userId === user?.id
                let rankIcon = null
                if (index === 0) rankIcon = <Medal className="w-6 h-6 text-yellow-400" />
                else if (index === 1) rankIcon = <Medal className="w-6 h-6 text-gray-300" />
                else if (index === 2) rankIcon = <Medal className="w-6 h-6 text-amber-600" />
                else rankIcon = <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>

                return (
                  <Link 
                    key={player.userId} 
                    to={`/profile/${player.userId}`}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                      isCurrentUser 
                        ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(255,87,34,0.1)]' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                        {rankIcon}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-lg font-bold text-gray-300 border border-white/10 shadow-inner">
                        {player.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white flex items-center gap-2">
                          {player.firstName} {player.lastName}
                          {isCurrentUser && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Ty</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                          {player.activitiesCount} aktywności {player.latestStreak > 0 && <span className="ml-2 text-orange-400">🔥 {player.latestStreak}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-extrabold text-white">
                        {player.points}
                      </p>
                      <p className="text-xs text-primary font-bold">TP</p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default LeaderboardPage
