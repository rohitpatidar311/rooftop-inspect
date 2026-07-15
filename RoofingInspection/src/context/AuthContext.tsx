import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { useMMKVObject, useMMKVString } from 'react-native-mmkv'
import { useAppDispatch } from '../redux/hooks'
import { logoutUser } from '../redux/slices/authSlice'
import type { UserProfile } from '../services/api/types'

export type AuthContextType = {
  isAuthenticated: boolean
  authToken?: string
  authEmail?: string
  userData?: UserProfile
  setAuthToken: (token?: string) => void
  setAuthEmail: (email: string) => void
  setUserData: (user?: UserProfile) => void
  logout: () => Promise<void>
  validationError: string
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [authToken, setAuthToken] = useMMKVString('AuthProvider.authToken')
  const [authEmail, setAuthEmail] = useMMKVString('AuthProvider.authEmail')
  const [userData, setUserData] = useMMKVObject<UserProfile>('AuthProvider.userData')
  const dispatch = useAppDispatch()

  const logout = useCallback(async () => {
    setAuthToken(undefined)
    setAuthEmail('')
    setUserData(undefined)
    await dispatch(logoutUser())
  }, [dispatch, setAuthEmail, setAuthToken, setUserData])

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: !!authToken,
      authToken,
      authEmail,
      userData,
      setAuthToken,
      setAuthEmail,
      setUserData,
      logout,
      validationError: '',
    }),
    [authToken, authEmail, userData, setAuthToken, setAuthEmail, setUserData, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
