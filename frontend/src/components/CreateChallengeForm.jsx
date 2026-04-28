import { useState } from 'react'
import api, { getApiErrorMessage } from '../services/api.js'

const INITIAL_FORM = {
  name: '',
  targetPoints: '',
  isActive: true,
}

function CreateChallengeForm({ onCreated }) {
  const [formState, setFormState] = useState(INITIAL_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const response = await api.post('/api/challenge', {
        name: formState.name.trim(),
        targetPoints: Number(formState.targetPoints),
        isActive: formState.isActive,
      })

      setFormState(INITIAL_FORM)
      setMessage('Wyzwanie zostało utworzone.')
      await onCreated?.(response.data)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nie udało się utworzyć wyzwania.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-[1.5fr_1fr_auto]" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-gray-400">Nazwa celu</span>
        <input
          className="rounded-xl border border-white/10 bg-surface-hover px-4 py-3 text-white outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
          placeholder="Bieg do Tokio"
          required
          value={formState.name}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-gray-400">Docelowe punkty</span>
        <input
          className="rounded-xl border border-white/10 bg-surface-hover px-4 py-3 text-white outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          min="1"
          onChange={(event) => setFormState((current) => ({ ...current, targetPoints: event.target.value }))}
          required
          type="number"
          value={formState.targetPoints}
        />
      </label>
      <button
        className="btn-primary mt-auto md:mb-[2px]"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? 'Zapisywanie...' : 'Utwórz cel'}
      </button>
      {message ? <p className="md:col-span-3 text-sm text-gray-400">{message}</p> : null}
    </form>
  )
}

export default CreateChallengeForm
