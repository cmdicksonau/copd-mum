import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { firebaseServices, isFirebaseDemoMode } from '../config/firebase'

interface AuthSession {
  uid: string
  displayName: string
  email?: string
  isPreviewMode: boolean
}

interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  previewMode: boolean
  isFirebaseDemoMode: boolean
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
  togglePreviewMode: () => void
}

const PREVIEW_MODE_KEY = 'copd.previewMode'

const AuthContext = createContext<AuthContextValue | null>(null)

const createPreviewSession = (): AuthSession => ({
  uid: 'preview-offline-user',
  displayName: 'Preview Patient',
  isPreviewMode: true,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [previewMode, setPreviewMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true
    }

    const stored = window.localStorage.getItem(PREVIEW_MODE_KEY)
    if (stored !== null) {
      return stored === 'true'
    }

    return isFirebaseDemoMode
  })
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.localStorage.setItem(PREVIEW_MODE_KEY, String(previewMode))
  }, [previewMode])

  useEffect(() => {
    if (previewMode || !firebaseServices.auth || !firebaseServices.googleProvider) {
      setSession(createPreviewSession())
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseServices.auth, (user) => {
      if (!user) {
        setSession(null)
        setLoading(false)
        return
      }

      setSession({
        uid: user.uid,
        displayName: user.displayName || 'COPD Patient',
        email: user.email || undefined,
        isPreviewMode: false,
      })
      setLoading(false)
    })

    return unsubscribe
  }, [previewMode])

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseServices.auth || !firebaseServices.googleProvider) {
      setPreviewMode(true)
      setSession(createPreviewSession())
      return
    }

    await signInWithPopup(firebaseServices.auth, firebaseServices.googleProvider)
  }, [])

  const signOutUser = useCallback(async () => {
    if (previewMode || !firebaseServices.auth) {
      setSession(null)
      return
    }

    await signOut(firebaseServices.auth)
  }, [previewMode])

  const togglePreviewMode = useCallback(() => {
    setLoading(true)
    setPreviewMode((current) => !current)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      previewMode,
      isFirebaseDemoMode,
      signInWithGoogle,
      signOutUser,
      togglePreviewMode,
    }),
    [loading, previewMode, session, signInWithGoogle, signOutUser, togglePreviewMode],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
