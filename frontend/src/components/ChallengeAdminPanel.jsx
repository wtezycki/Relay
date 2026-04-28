import { Check, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../services/api.js'
import CreateChallengeForm from './CreateChallengeForm.jsx'

const INITIAL_EDIT_STATE = {
  challengeId: null,
  name: '',
  targetPoints: '',
  currentPoints: '',
  isActive: false,
}

function ChallengeAdminPanel({ onCurrentChallengeChange }) {
  const [challenges, setChallenges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editState, setEditState] = useState(INITIAL_EDIT_STATE)
  const [busyAction, setBusyAction] = useState('')

  useEffect(() => {
    loadChallenges()
  }, [])

  async function loadChallenges() {
    setIsLoading(true)

    try {
      const response = await api.get('/api/challenge')
      setChallenges(response.data)
      setMessage('')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nie udało się wczytać listy wyzwań.'))
    } finally {
      setIsLoading(false)
    }
  }

  function startEditing(challenge) {
    setEditState({
      challengeId: challenge.id,
      name: challenge.name,
      targetPoints: String(challenge.targetPoints),
      currentPoints: String(challenge.currentPoints),
      isActive: challenge.isActive,
    })
    setMessage('')
  }

  function cancelEditing() {
    setEditState(INITIAL_EDIT_STATE)
  }

  async function handleCreate() {
    await loadChallenges()
    await refreshCurrentChallenge()
    setMessage('Wyzwanie zostało zapisane i lista została odświeżona.')
  }

  async function handleActivate(challengeId) {
    setBusyAction(`activate-${challengeId}`)
    setMessage('')

    try {
      await api.patch(`/api/challenge/${challengeId}/activate`)
      await loadChallenges()
      await refreshCurrentChallenge()
      setMessage('Aktywne wyzwanie zostało zmienione.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nie udało się aktywować wyzwania.'))
    } finally {
      setBusyAction('')
    }
  }

  async function handleDelete(challengeId) {
    setBusyAction(`delete-${challengeId}`)
    setMessage('')

    try {
      await api.delete(`/api/challenge/${challengeId}`)
      await loadChallenges()
      await refreshCurrentChallenge()
      if (editState.challengeId === challengeId) {
        cancelEditing()
      }
      setMessage('Wyzwanie zostało usunięte.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nie udało się usunąć wyzwania.'))
    } finally {
      setBusyAction('')
    }
  }

  async function handleUpdate(event) {
    event.preventDefault()

    if (!editState.challengeId) {
      return
    }

    setBusyAction(`update-${editState.challengeId}`)
    setMessage('')

    try {
      await api.put(`/api/challenge/${editState.challengeId}`, {
        name: editState.name.trim(),
        targetPoints: Number(editState.targetPoints),
        currentPoints: Number(editState.currentPoints),
        isActive: editState.isActive,
      })

      await loadChallenges()
      await refreshCurrentChallenge()
      cancelEditing()
      setMessage('Wyzwanie zostało zaktualizowane.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nie udało się zaktualizować wyzwania.'))
    } finally {
      setBusyAction('')
    }
  }

  async function refreshCurrentChallenge() {
    try {
      const response = await api.get('/api/challenge/current')
      onCurrentChallengeChange(response.data)
    } catch (error) {
      if (error.response?.status === 404) {
        onCurrentChallengeChange(null)
        return
      }

      throw error
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 border-dashed border-white/20">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
          Nowe wyzwanie
        </p>
        <CreateChallengeForm onCreated={handleCreate} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Wszystkie wyzwania
          </p>
          <button
            className="btn-secondary text-sm py-2 px-4"
            onClick={loadChallenges}
            type="button"
          >
            Odśwież listę
          </button>
        </div>

        {message ? (
          <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-gray-200">
            {message}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-gray-400 text-center animate-pulse">
            Ładowanie listy wyzwań...
          </div>
        ) : !challenges.length ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-gray-400 text-center">
            Nie ma jeszcze żadnych wyzwań.
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const isEditing = editState.challengeId === challenge.id

              return (
                <article
                  key={challenge.id}
                  className="glass-card p-5"
                >
                  {isEditing ? (
                    <form className="space-y-4" onSubmit={handleUpdate}>
                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-gray-400">Nazwa</span>
                          <input
                            className="rounded-xl border border-white/10 bg-surface-hover px-4 py-3 text-white outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                            onChange={(event) =>
                              setEditState((current) => ({ ...current, name: event.target.value }))
                            }
                            required
                            value={editState.name}
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-gray-400">Target punktów</span>
                          <input
                            className="rounded-xl border border-white/10 bg-surface-hover px-4 py-3 text-white outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                            min="1"
                            onChange={(event) =>
                              setEditState((current) => ({ ...current, targetPoints: event.target.value }))
                            }
                            required
                            type="number"
                            value={editState.targetPoints}
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-gray-400">Aktualne punkty</span>
                          <input
                            className="rounded-xl border border-white/10 bg-surface-hover px-4 py-3 text-white outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                            min="0"
                            onChange={(event) =>
                              setEditState((current) => ({ ...current, currentPoints: event.target.value }))
                            }
                            required
                            type="number"
                            value={editState.currentPoints}
                          />
                        </label>
                      </div>
                      <label className="inline-flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                        <input
                          checked={editState.isActive}
                          onChange={(event) =>
                            setEditState((current) => ({ ...current, isActive: event.target.checked }))
                          }
                          type="checkbox"
                          className="w-5 h-5 rounded border-white/20 bg-surface-hover text-primary focus:ring-primary focus:ring-offset-dark"
                        />
                        Ustaw jako aktywne
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <button
                          className="btn-primary py-2 text-sm"
                          disabled={busyAction === `update-${challenge.id}`}
                          type="submit"
                        >
                          <Check className="h-4 w-4" />
                          Zapisz
                        </button>
                        <button
                          className="btn-secondary py-2 text-sm"
                          onClick={cancelEditing}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                          Anuluj
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-display text-xl font-bold text-white">{challenge.name}</p>
                          {challenge.isActive ? (
                            <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                              Aktywne
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-white/10">
                              Nieaktywne
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                          {challenge.currentPoints} <span className="opacity-50">/</span> {challenge.targetPoints} punktów <span className="mx-2">•</span> <span className="text-white">{challenge.progressPercentage.toFixed(1)}%</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {!challenge.isActive ? (
                          <button
                            className="btn-secondary py-2 text-sm hover:bg-primary hover:border-primary hover:text-white"
                            disabled={busyAction === `activate-${challenge.id}`}
                            onClick={() => handleActivate(challenge.id)}
                            type="button"
                          >
                            Aktywuj
                          </button>
                        ) : null}
                        <button
                          className="btn-secondary py-2 text-sm"
                          onClick={() => startEditing(challenge)}
                          type="button"
                        >
                          <Pencil className="h-4 w-4" />
                          Edytuj
                        </button>
                        <button
                          className="btn-secondary py-2 text-sm hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                          disabled={busyAction === `delete-${challenge.id}`}
                          onClick={() => handleDelete(challenge.id)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                          Usuń
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChallengeAdminPanel
