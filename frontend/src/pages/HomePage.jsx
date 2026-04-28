import { LogIn } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import Confetti from 'react-confetti'
import ActivityList from '../components/ActivityList.jsx'
import SectionCard from '../components/SectionCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDashboardData } from '../hooks/useDashboardData.js'
import Layout from '../components/Layout.jsx'

function HomePage() {
  const { user, isLoading: isAuthLoading, isAuthenticated, loginWithStrava } = useAuth()
  const { activities, isLoading } = useDashboardData(isAuthenticated)
  const [showConfetti, setShowConfetti] = useState(false)

  const DAILY_TARGET = 50

  const todaysPoints = useMemo(() => {
    if (!activities) return 0

    const today = new Date().toLocaleDateString('en-CA')
    return activities
      .filter(a => a.occurredAt && new Date(a.occurredAt).toLocaleDateString('en-CA') === today)
      .reduce((sum, a) => sum + a.teamPoints, 0)
  }, [activities])

  useEffect(() => {
    if (todaysPoints >= DAILY_TARGET && isAuthenticated) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [todaysPoints, isAuthenticated])

  return (
    <Layout>
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} gravity={0.15} />}
      <div className="flex flex-col gap-8">
        <header className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between relative z-10">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl text-white">
                {isAuthenticated ? (
                  <>
                    Witaj w Relay, <span className="text-gradient">{user.firstName}</span>
                  </>
                ) : (
                  <>
                    Zbudujmy coś <span className="text-gradient">Wielkiego</span> Razem.
                  </>
                )}
              </h1>
              <p className="mt-4 max-w-xl text-base text-gray-400">
                {isAuthenticated
                  ? 'Biegaj, spaceruj, ćwicz. Każdy Twój ruch przybliża cały zespół do wspólnego celu.'
                  : 'Połącz swoje konto Strava i dołącz do firmowego wyzwania sportowego. Twoje kilometry i minuty przeliczamy na wspólne punkty!'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isAuthLoading ? (
                <div className="btn-secondary animate-pulse">Ładowanie...</div>
              ) : !isAuthenticated ? (
                <button className="btn-primary" onClick={loginWithStrava}>
                  <LogIn className="h-5 w-5" />
                  Zaloguj przez Stravę
                </button>
              ) : null}
            </div>
          </div>
        </header>

        {isAuthenticated && (
          <div className="glass-panel p-6 relative overflow-hidden border-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  🎯 Dzienny Cel Zespołu
                  {todaysPoints >= DAILY_TARGET && <span className="text-green-400 text-sm bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">✓ Wykonany!</span>}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Zbierzmy razem {DAILY_TARGET} TP każdego dnia, aby utrzymać tempo!</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-display text-4xl font-extrabold text-white">{todaysPoints}</span>
                <span className="text-gray-400 mb-1">/ {DAILY_TARGET} TP</span>
              </div>
            </div>
            <div className="mt-5 h-3 w-full bg-surface-hover rounded-full overflow-hidden relative z-10 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 relative ${todaysPoints >= DAILY_TARGET ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-primary to-accent shadow-glow'}`}
                style={{ width: `${Math.min(100, (todaysPoints / DAILY_TARGET) * 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]"></div>
              </div>
            </div>
          </div>
        )}

        <SectionCard
          title="Najnowsze Aktywności"
          subtitle="Co dzisiaj zrobił Twój zespół?"
        >
          {!isAuthenticated ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400">
              Zaloguj się przez Stravę, aby zobaczyć zsynchronizowane aktywności.
            </div>
          ) : isLoading ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400 animate-pulse">
              Ładowanie feedu aktywności...
            </div>
          ) : (
            <ActivityList activities={activities} />
          )}
        </SectionCard>
      </div>
    </Layout>
  )
}

export default HomePage
