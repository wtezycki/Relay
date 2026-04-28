import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../services/api.js'

export function useDashboardData(isAuthenticated) {
  const [challenges, setChallenges] = useState([])
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
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

      try {
        const [challengesResponse, activitiesResponse] = await Promise.all([
          api.get('/api/challenge/active'),
          api.get('/api/activities'),
        ])

        if (!isMounted) {
          return
        }

        setChallenges(challengesResponse.data)
        setActivities(activitiesResponse.data)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          getApiErrorMessage(error, 'Nie udało się wczytać danych dashboardu Relay.'),
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  return {
    challenges,
    activities,
    isLoading,
    errorMessage,
    setChallenges,
    setActivities,
  }
}
