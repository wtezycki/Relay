import { useEffect, useState } from 'react'
import api from '../services/api.js'

export function useDashboardData(isAuthenticated) {
  const [challenge, setChallenge] = useState(null)
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      setChallenge(null)
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
        const [challengeResponse, activitiesResponse] = await Promise.all([
          api.get('/api/challenge/current'),
          api.get('/api/activities'),
        ])

        if (!isMounted) {
          return
        }

        setChallenge(challengeResponse.data)
        setActivities(activitiesResponse.data)
      } catch (error) {
        if (!isMounted) {
          return
        }

        if (error.response?.status === 404) {
          setErrorMessage('No active challenge is configured yet.')
        } else {
          setErrorMessage('Failed to load Relay dashboard data.')
        }
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
    challenge,
    activities,
    isLoading,
    errorMessage,
    setChallenge,
    setActivities,
  }
}
