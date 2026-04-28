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
        <span className="text-sm font-medium text-ink/80">Nazwa celu</span>
        <input
          className="rounded-2xl border border-pine/20 bg-white px-4 py-3 outline-none transition focus:border-ember"
          onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
          placeholder="Bieg do Tokio"
          required
          value={formState.name}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink/80">Docelowe punkty</span>
        <input
          className="rounded-2xl border border-pine/20 bg-white px-4 py-3 outline-none transition focus:border-ember"
          min="1"
          onChange={(event) => setFormState((current) => ({ ...current, targetPoints: event.target.value }))}
          required
          type="number"
          value={formState.targetPoints}
        />
      </label>
      <button
        className="mt-auto rounded-2xl bg-pine px-5 py-3 font-semibold text-white transition hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? 'Zapisywanie...' : 'Utwórz cel'}
      </button>
      {message ? <p className="md:col-span-3 text-sm text-ink/70">{message}</p> : null}
    </form>
  )
}

export default CreateChallengeForm
