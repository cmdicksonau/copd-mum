import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { loading, previewMode, isFirebaseDemoMode, session, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-300 bg-white p-6 text-slate-900">
        <p>Loading secure session…</p>
      </div>
    )
  }

  if (session || previewMode) {
    return <>{children}</>
  }

  return (
    <section className="rounded-2xl border-2 border-slate-900 bg-white p-6">
      <h1 className="text-2xl font-bold text-slate-950">Sign in to continue</h1>
      <p className="mt-3 text-base text-slate-800">
        Use Google Sign-In to access your clinical profile or switch to Preview / Offline Mode for sandbox testing.
      </p>
      {isFirebaseDemoMode ? (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Firebase keys are not configured, so Preview / Offline Mode is enabled automatically.
        </p>
      ) : null}
      <button
        type="button"
        className="mt-6 min-h-12 w-full rounded-xl bg-[#2E6F40] px-6 py-3 text-base font-semibold text-white"
        onClick={() => {
          void signInWithGoogle()
        }}
      >
        Continue with Google
      </button>
    </section>
  )
}
