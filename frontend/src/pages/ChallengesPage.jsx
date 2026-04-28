import ProgressBar from '../components/ProgressBar.jsx'
import SectionCard from '../components/SectionCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDashboardData } from '../hooks/useDashboardData.js'
import Layout from '../components/Layout.jsx'

function ChallengesPage() {
  const { isAuthenticated } = useAuth()
  const { challenges, isLoading, errorMessage } = useDashboardData(isAuthenticated)

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="mb-4">
          <h1 className="font-display text-4xl font-extrabold text-white">Aktywne Wyzwania</h1>
          <p className="mt-2 text-gray-400">Śledź nasz wspólny postęp w bieżących celach zespołowych.</p>
        </div>

        <SectionCard title="Bieżące Cele">
          {!isAuthenticated ? (
            <p className="text-sm text-gray-400">Zaloguj się, aby wczytać dane wyzwań.</p>
          ) : isLoading ? (
            <p className="text-sm text-gray-400">Ładowanie wyzwań...</p>
          ) : challenges && challenges.length > 0 ? (
            <div className="space-y-8">
              {challenges.map(challenge => (
                <div key={challenge.id} className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl font-bold text-white flex items-center gap-3">
                        {challenge.name}
                        <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                          AKTYWNE
                        </span>
                      </p>
                      <p className="mt-2 text-sm text-gray-400 font-medium">
                        {challenge.currentPoints} <span className="opacity-50">/</span> {challenge.targetPoints} Punktów Zespołowych (TP)
                      </p>
                    </div>
                    <div className="text-4xl font-display font-extrabold text-white text-gradient">
                      {challenge.progressPercentage.toFixed(1)}<span className="text-2xl text-primary">%</span>
                    </div>
                  </div>
                  <ProgressBar percentage={challenge.progressPercentage} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{errorMessage || 'Brak aktywnych wyzwań.'}</p>
          )}
        </SectionCard>
      </div>
    </Layout>
  )
}

export default ChallengesPage
