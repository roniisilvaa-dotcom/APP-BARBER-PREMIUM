/**
 * BarberPro Premium — Auth Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, type AuthUser, saveToken, clearToken, getToken } from '../services/api'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  registro: (data: { nome: string; email: string; senha: string; nome_barbearia?: string }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isDemoMode: boolean
  enterDemoMode: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(getToken)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Validate token on mount
  useEffect(() => {
    const existingToken = getToken()
    const demoMode = localStorage.getItem('bp_demo_mode') === 'true'
    if (demoMode) {
      setIsDemoMode(true)
      setLoading(false)
      return
    }
    if (!existingToken) {
      setLoading(false)
      return
    }
    authApi.me()
      .then(u => {
        setUser(u)
        setToken(existingToken)
      })
      .catch(() => {
        clearToken()
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const res = await authApi.login(email, senha)
    saveToken(res.token)
    setToken(res.token)
    setUser(res.user)
    setIsDemoMode(false)
    localStorage.removeItem('bp_demo_mode')
  }, [])

  const registro = useCallback(async (data: { nome: string; email: string; senha: string; nome_barbearia?: string }) => {
    const res = await authApi.registro({ ...data, role: 'dono' })
    saveToken(res.token)
    setToken(res.token)
    setUser(res.user)
    setIsDemoMode(false)
    localStorage.removeItem('bp_demo_mode')
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setToken(null)
    setUser(null)
    setIsDemoMode(false)
    localStorage.removeItem('bp_demo_mode')
  }, [])

  const enterDemoMode = useCallback(() => {
    localStorage.setItem('bp_demo_mode', 'true')
    setIsDemoMode(true)
    clearToken()
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      registro,
      logout,
      isAuthenticated: !!user,
      isDemoMode,
      enterDemoMode,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
