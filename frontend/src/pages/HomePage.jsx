import { LogIn } from 'lucide-react'
import ActivityList from '../components/ActivityList.jsx'
import SectionCard from '../components/SectionCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDashboardData } from '../hooks/useDashboardData.js'
import Layout from '../components/Layout.jsx'

function HomePage() {
  const { user, isLoading: isAuthLoading, isAuthenticated, loginWithStrava } = useAuth()
  const { activities, isLoading } = useDashboardData(isAuthenticated)

  return (
    <Layout>
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
