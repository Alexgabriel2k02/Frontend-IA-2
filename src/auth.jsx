import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const clearSession = () => {
      sessionStorage.removeItem('nexora_access_token')
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('nexora:unauthorized', clearSession)
    if (!sessionStorage.getItem('nexora_access_token')) {
      setLoading(false)
    } else {
      api.me().then(setUser).catch(() => {
        sessionStorage.removeItem('nexora_access_token')
        setUser(null)
      }).finally(() => setLoading(false))
    }
    return () => window.removeEventListener('nexora:unauthorized', clearSession)
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const result = await api.login(credentials)
      sessionStorage.setItem('nexora_access_token', result.access_token)
      setUser(result.user)
      return result.user
    },
    async register(details) {
      await api.register(details)
      const result = await api.login({ email: details.email, password: details.password })
      sessionStorage.setItem('nexora_access_token', result.access_token)
      setUser(result.user)
      return result.user
    },
    logout() {
      sessionStorage.removeItem('nexora_access_token')
      setUser(null)
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
