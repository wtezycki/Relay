import { Activity, Flag, LogIn, RefreshCcw, UserCircle2 } from 'lucide-react'
import { useState } from 'react'
import ActivityList from '../components/ActivityList.jsx'
import CreateChallengeForm from '../components/CreateChallengeForm.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import SectionCard from '../components/SectionCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDashboardData } from '../hooks/useDashboardData.js'
import api from '../services/api.js'

function DashboardPage() {
  const { user, isLoading: isAuthLoading, isAuthenticated, loginWithStrava, logout } = useAuth()
  const { challenge, activities, isLoading, errorMessage, setActivities, setChallenge } =
    useDashboardData(isAuthenticated)
  const [isSyncing, setIsSyncing] = useState(false)

  async function handleManualSync() {
    setIsSyncing(true)

    try {
      await api.post('/api/admin/sync')

      const [challengeResponse, activitiesResponse] = await Promise.all([
        api.get('/api/challenge/current'),
        api.get('/api/activities'),
      ])

      setChallenge(challengeResponse.data)
      setActivities(activitiesResponse.data)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 text-ink md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-pine to-[#12313b] p-8 text-white shadow-card">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
                Relay MVP
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
                {isAuthenticated ? `Cześć, ${user.firstName}.` : 'Firmowe wyzwanie, sync ze Stravy, jeden prosty panel.'}
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/75 md:text-base">
                {isAuthenticated
                  ? 'Masz aktywną sesję Relay opartą o Stravę. Dashboard korzysta z tej samej sesji Spring Security i od razu ładuje Twoje dane oraz postęp wyzwania.'
                  : 'Frontend korzysta z istniejącej sesji Spring Security. Logowanie przekierowuje do Stravy, zapytania API wysyłają ciasteczka, a dashboard pobiera aktualne dane o wyzwaniu i aktywnościach z backendu.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isAuthLoading ? (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-semibold text-white/75">
                  Sprawdzanie sesji...
                </div>
              ) : !isAuthenticated ? (
                <button
                  className="inline-flex items-center gap-2 rounded-2xl bg-ember px-5 py-3 font-semibold text-white transition hover:bg-ember/90"
                  onClick={loginWithStrava}
                  type="button"
                >
                  <LogIn className="h-4 w-4" />
                  Zaloguj przez Stravę
                </button>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white">
                    Sesja aktywna
                  </div>
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-pine transition hover:bg-cream"
                    onClick={logout}
                    type="button"
                  >
                    Wyloguj
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            action={
              isAuthenticated ? (
                <button
                  className="inline-flex items-center gap-2 rounded-2xl border border-pine/15 bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSyncing}
                  onClick={handleManualSync}
                  type="button"
                >
                  <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Synchronizacja...' : 'Uruchom sync'}
                </button>
              ) : null
            }
            subtitle="Bieżący stan uwierzytelnionej sesji."
            title="Sesja"
          >
            {isAuthLoading ? (
              <p className="text-sm text-ink/70">Sprawdzanie sesji Spring Security...</p>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4 rounded-2xl bg-pine/5 p-4">
                {user.avatarUrl ? (
                  <img
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-12 w-12 rounded-full object-cover"
                    src={user.avatarUrl}
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-pine text-white">
                    <UserCircle2 className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-ink">{`Cześć, ${user.firstName}`}</p>
                  <p className="text-sm text-ink/65">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-ink/65">Atleta Stravy #{user.stravaAthleteId}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/70">Brak aktywnej sesji. Zaloguj się przez Stravę, aby korzystać z chronionych endpointów API.</p>
            )}
          </SectionCard>

          <SectionCard subtitle="Postęp aktualnego wyzwania po stronie backendu." title="Aktualny cel">
            {!isAuthenticated ? (
              <p className="text-sm text-ink/70">Zaloguj się, aby wczytać dane wyzwania.</p>
            ) : isLoading ? (
              <p className="text-sm text-ink/70">Ładowanie wyzwania...</p>
            ) : challenge ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl font-bold text-ink">{challenge.name}</p>
                    <p className="mt-1 text-sm text-ink/65">
                      {challenge.currentPoints} / {challenge.targetPoints} punktów zespołowych
                    </p>
                  </div>
                  <div className="rounded-full bg-ember/10 px-3 py-2 text-sm font-semibold text-ember">
                    {challenge.progressPercentage.toFixed(1)}%
                  </div>
                </div>
                <ProgressBar percentage={challenge.progressPercentage} />
              </div>
            ) : (
              <p className="text-sm text-ink/70">{errorMessage || 'Brak danych o wyzwaniu.'}</p>
            )}
          </SectionCard>
        </div>

        <SectionCard
          subtitle="Szybka akcja administracyjna do utworzenia kolejnego firmowego celu."
          title="Utwórz wyzwanie"
        >
          {isAuthenticated ? (
            <CreateChallengeForm onCreated={setChallenge} />
          ) : (
            <p className="text-sm text-ink/70">Zaloguj się, zanim utworzysz wyzwanie.</p>
          )}
        </SectionCard>

        <SectionCard
          subtitle="Najnowsze aktywności zsynchronizowane z backendu."
          title="Feed aktywności"
        >
          {!isAuthenticated ? (
            <div className="rounded-2xl border border-dashed border-pine/20 bg-pine/5 p-5 text-sm text-ink/70">
              Zaloguj się przez Stravę, aby zobaczyć zsynchronizowane aktywności.
            </div>
          ) : (
            <ActivityList activities={activities} />
          )}
        </SectionCard>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoTile
            icon={Flag}
            label="Endpoint celu"
            value="GET /api/challenge/current"
          />
          <InfoTile
            icon={Activity}
            label="Endpoint aktywności"
            value="GET /api/activities"
          />
          <InfoTile
            icon={RefreshCcw}
            label="Endpoint synchronizacji"
            value="POST /api/admin/sync"
          />
        </section>
      </div>
    </main>
  )
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur">
      <div className="mb-3 inline-flex rounded-2xl bg-pine/10 p-2 text-pine">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium text-ink/60">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}

export default DashboardPage
