import { createContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api.js'

export const AuthContext = createContext(null)

const STRAVA_LOGIN_URL = 'http://localhost:8080/oauth2/authorization/strava'
const LOGOUT_URL = 'http://localhost:8080/logout'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadCurrentUser() {
      try {
        const response = await api.get('/api/users/me')
        if (isMounted) {
          setUser(response.data)
        }
      } catch (error) {
        if (isMounted && error.response?.status !== 401) {
          console.error('Failed to load current user.', error)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      loginWithStrava() {
        if (isLoading || user) {
          return
        }

        window.location.assign(STRAVA_LOGIN_URL)
      },
      logout() {
        window.location.assign(LOGOUT_URL)
      },
      refreshUser: async () => {
        const response = await api.get('/api/users/me')
        setUser(response.data)
        return response.data
      },
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
