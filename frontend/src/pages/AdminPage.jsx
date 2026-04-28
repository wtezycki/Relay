import { useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import SectionCard from '../components/SectionCard.jsx'
import ChallengeAdminPanel from '../components/ChallengeAdminPanel.jsx'
import { useAuth } from '../hooks/useAuth.js'
import Layout from '../components/Layout.jsx'
import api, { getApiErrorMessage } from '../services/api.js'

function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  async function handleManualSync() {
    setIsSyncing(true)
    setSyncMessage('')

    try {
      await api.post('/api/admin/sync')
      setSyncMessage('Synchronizacja zakończona pomyślnie.')
    } catch (error) {
      setSyncMessage(getApiErrorMessage(error, 'Nie udało się uruchomić synchronizacji.'))
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <Layout>
        <SectionCard title="Brak dostępu">
          <p className="text-gray-400">Tylko administrator może uzyskać dostęp do tej strony.</p>
        </SectionCard>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-white">Panel Administratora</h1>
            <p className="mt-2 text-gray-400">Zarządzaj wyzwaniami i wymuszaj synchronizację ze Strava.</p>
          </div>
          <button
            className="btn-primary"
            disabled={isSyncing}
            onClick={handleManualSync}
            type="button"
          >
            <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronizacja...' : 'Wymuś Sync'}
          </button>
        </div>

        {syncMessage && (
           <div className="glass-panel p-4 border-primary/30 bg-primary/5 text-primary text-sm font-semibold">
             {syncMessage}
           </div>
        )}

        <SectionCard title="Zarządzanie wyzwaniami">
          <ChallengeAdminPanel onActiveChallengesChange={() => {}} />
        </SectionCard>
      </div>
    </Layout>
  )
}

export default AdminPage
