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
      <div className="rounded-[1.75rem] border border-pine/10 bg-pine/5 p-5">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-pine/75">
          Nowe wyzwanie
        </p>
        <CreateChallengeForm onCreated={handleCreate} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">
            Wszystkie wyzwania
          </p>
          <button
            className="rounded-full border border-pine/15 px-4 py-2 text-sm font-semibold text-pine transition hover:bg-pine/5"
            onClick={loadChallenges}
            type="button"
          >
            Odśwież listę
          </button>
        </div>

        {message ? (
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-ink/75">
            {message}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-pine/20 bg-pine/5 p-5 text-sm text-ink/70">
            Ładowanie listy wyzwań...
          </div>
        ) : !challenges.length ? (
          <div className="rounded-2xl border border-dashed border-pine/20 bg-pine/5 p-5 text-sm text-ink/70">
            Nie ma jeszcze żadnych wyzwań.
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const isEditing = editState.challengeId === challenge.id

              return (
                <article
                  key={challenge.id}
                  className="rounded-[1.75rem] border border-pine/10 bg-white/70 p-5 shadow-card"
                >
                  {isEditing ? (
                    <form className="space-y-4" onSubmit={handleUpdate}>
                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-ink/75">Nazwa</span>
                          <input
                            className="rounded-2xl border border-pine/20 bg-white px-4 py-3 outline-none transition focus:border-ember"
                            onChange={(event) =>
                              setEditState((current) => ({ ...current, name: event.target.value }))
                            }
                            required
                            value={editState.name}
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-ink/75">Target punktów</span>
                          <input
                            className="rounded-2xl border border-pine/20 bg-white px-4 py-3 outline-none transition focus:border-ember"
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
                          <span className="text-sm font-medium text-ink/75">Aktualne punkty</span>
                          <input
                            className="rounded-2xl border border-pine/20 bg-white px-4 py-3 outline-none transition focus:border-ember"
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
                      <label className="inline-flex items-center gap-2 text-sm text-ink/75">
                        <input
                          checked={editState.isActive}
                          onChange={(event) =>
                            setEditState((current) => ({ ...current, isActive: event.target.checked }))
                          }
                          type="checkbox"
                        />
                        Ustaw jako aktywne
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <button
                          className="inline-flex items-center gap-2 rounded-2xl bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={busyAction === `update-${challenge.id}`}
                          type="submit"
                        >
                          <Check className="h-4 w-4" />
                          Zapisz
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-2xl border border-pine/15 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-pine/5"
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
                          <p className="font-display text-2xl font-bold text-ink">{challenge.name}</p>
                          {challenge.isActive ? (
                            <span className="rounded-full bg-ember/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ember">
                              Aktywne
                            </span>
                          ) : (
                            <span className="rounded-full bg-pine/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-pine/70">
                              Nieaktywne
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-ink/65">
                          {challenge.currentPoints} / {challenge.targetPoints} punktów · {challenge.progressPercentage.toFixed(1)}%
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {!challenge.isActive ? (
                          <button
                            className="rounded-2xl bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={busyAction === `activate-${challenge.id}`}
                            onClick={() => handleActivate(challenge.id)}
                            type="button"
                          >
                            Aktywuj
                          </button>
                        ) : null}
                        <button
                          className="inline-flex items-center gap-2 rounded-2xl border border-pine/15 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-pine/5"
                          onClick={() => startEditing(challenge)}
                          type="button"
                        >
                          <Pencil className="h-4 w-4" />
                          Edytuj
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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
