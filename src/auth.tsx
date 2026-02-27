import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface User {
  email: string
  name: string
  initials: string
  role: string
}

const USERS: User[] = [
  { email: 'ai2@islife.us', name: 'Jimmy Zhan', initials: 'JZ', role: 'Admin' },
  { email: 'ai3@islife.us', name: 'Kevin Lu', initials: 'KL', role: 'Admin' },
  { email: 'domic@islif.us', name: 'Domin Moor', initials: 'DM', role: 'Admin' },
]

interface AuthContextType {
  user: User | null
  login: (email: string) => User | null
  ssoLogin: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => null,
  ssoLogin: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('atu-med-user')
    if (saved) {
      try { return JSON.parse(saved) } catch { return null }
    }
    return null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('atu-med-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('atu-med-user')
    }
  }, [user])

  const login = (email: string): User | null => {
    const found = USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim())
    if (found) {
      setUser(found)
      return found
    }
    return null
  }

  const ssoLogin = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, ssoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
