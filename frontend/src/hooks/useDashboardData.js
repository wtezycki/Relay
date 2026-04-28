import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../services/api.js'

export function useDashboardData(isAuthenticated) {
  const [challenge, setChallenge] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      setChallenge(null)
      setChallenges([])
      setActivities([])
      setIsLoading(false)
      setErrorMessage('')
      return
    }

    let isMounted = true

    async function loadDashboardData() {
      setIsLoading(true)
      setErrorMessage('')

      const [challengeResult, challengesResult, activitiesResult] = await Promise.allSettled([
        api.get('/api/challenge/current'),
        api.get('/api/challenge/active'),
        api.get('/api/activities'),
      ])

      if (!isMounted) {
        return
      }

      if (challengeResult.status === 'fulfilled') {
        setChallenge(challengeResult.value.data)
      } else {
        setChallenge(null)
      }

      if (challengesResult.status === 'fulfilled') {
        setChallenges(challengesResult.value.data)
      } else if (challengeResult.status === 'fulfilled') {
        setChallenges([challengeResult.value.data])
      } else {
        setChallenges([])
      }

      if (activitiesResult.status === 'fulfilled') {
        setActivities(activitiesResult.value.data)
      } else {
        setActivities([])
      }

      if (challengeResult.status === 'rejected') {
        setErrorMessage(
          getApiErrorMessage(challengeResult.reason, 'Nie udało się wczytać danych wyzwania.'),
        )
      } else if (challengesResult.status === 'rejected') {
        setErrorMessage(
          getApiErrorMessage(challengesResult.reason, 'Nie udało się wczytać listy wyzwań.'),
        )
      } else if (activitiesResult.status === 'rejected') {
        setErrorMessage(
          getApiErrorMessage(activitiesResult.reason, 'Nie udało się wczytać aktywności.'),
        )
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  return {
    challenge,
    challenges,
    activities,
    isLoading,
    errorMessage,
    setChallenge,
    setChallenges,
    setActivities,
  }
}
