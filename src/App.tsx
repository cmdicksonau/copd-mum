import { useMemo, useState } from 'react'
import { setDoc, doc } from 'firebase/firestore'
import { AuthGuard } from './components/AuthGuard'
import { ContactDirectoryForm, type ContactDirectoryValue } from './components/ContactDirectoryForm'
import { CustomStrategiesEditor } from './components/CustomStrategiesEditor'
import { EmergencyBar } from './components/EmergencyBar'
import { firebaseServices } from './config/firebase'
import { useAuth } from './context/AuthContext'
import type { UserMedicalProfile } from './types/domain'
import { isValidAustralianDate, isValidAustralianPhone } from './utils/validation'

const STORAGE_KEY = 'copd-medical-profile'

const initialContacts: ContactDirectoryValue['contacts'] = {
  gp: { role: 'GP', name: '', clinicOrRelationship: '', phone: '' },
  specialist: { role: 'Specialist', name: '', clinicOrRelationship: '', phone: '' },
  emergencyCarer: {
    role: 'PersonalEmergency',
    name: '',
    clinicOrRelationship: '',
    phone: '',
  },
}

const loadProfileDraft = (): {
  contactDirectory: ContactDirectoryValue
  customStrategies: string[]
  carerWebhookUrl: string
} => {
  if (typeof window === 'undefined') {
    return {
      contactDirectory: { displayName: '', dateOfBirth: '', contacts: initialContacts },
      customStrategies: [],
      carerWebhookUrl: '',
    }
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return {
      contactDirectory: { displayName: '', dateOfBirth: '', contacts: initialContacts },
      customStrategies: [],
      carerWebhookUrl: '',
    }
  }

  try {
    const parsed = JSON.parse(stored) as {
      contactDirectory?: ContactDirectoryValue
      customStrategies?: string[]
      carerWebhookUrl?: string
    }

    return {
      contactDirectory: parsed.contactDirectory || {
        displayName: '',
        dateOfBirth: '',
        contacts: initialContacts,
      },
      customStrategies: parsed.customStrategies || [],
      carerWebhookUrl: parsed.carerWebhookUrl || '',
    }
  } catch {
    return {
      contactDirectory: { displayName: '', dateOfBirth: '', contacts: initialContacts },
      customStrategies: [],
      carerWebhookUrl: '',
    }
  }
}

function App() {
  const { session, previewMode, togglePreviewMode, signOutUser } = useAuth()
  const defaults = useMemo(() => loadProfileDraft(), [])
  const [contactDirectory, setContactDirectory] = useState<ContactDirectoryValue>(defaults.contactDirectory)
  const [customStrategies, setCustomStrategies] = useState<string[]>(defaults.customStrategies)
  const [carerWebhookUrl, setCarerWebhookUrl] = useState(defaults.carerWebhookUrl)
  const [statusMessage, setStatusMessage] = useState('')

  const phoneErrors = {
    gp: contactDirectory.contacts.gp.phone && !isValidAustralianPhone(contactDirectory.contacts.gp.phone)
      ? 'Use a valid Australian phone number format.'
      : '',
    specialist:
      contactDirectory.contacts.specialist.phone &&
      !isValidAustralianPhone(contactDirectory.contacts.specialist.phone)
        ? 'Use a valid Australian phone number format.'
        : '',
    emergencyCarer:
      contactDirectory.contacts.emergencyCarer.phone &&
      !isValidAustralianPhone(contactDirectory.contacts.emergencyCarer.phone)
        ? 'Use a valid Australian phone number format.'
        : '',
  }

  const dateError =
    contactDirectory.dateOfBirth && !isValidAustralianDate(contactDirectory.dateOfBirth)
      ? 'Enter date of birth using DD/MM/YYYY.'
      : ''

  const hasValidationError = Boolean(
    dateError || phoneErrors.gp || phoneErrors.specialist || phoneErrors.emergencyCarer,
  )

  const persistDraft = () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        contactDirectory,
        customStrategies,
        carerWebhookUrl,
      }),
    )
  }

  const saveProfile = async () => {
    persistDraft()

    if (hasValidationError || !session) {
      setStatusMessage('Draft saved locally for offline recovery support.')
      return
    }

    const profile: UserMedicalProfile = {
      uid: session.uid,
      displayName: contactDirectory.displayName,
      dateOfBirth: contactDirectory.dateOfBirth,
      contacts: contactDirectory.contacts,
      carerWebhookUrl,
      customStrategies: customStrategies
        .map((entry) => entry.trim())
        .filter(Boolean),
      preferences: {
        audioChimesEnabled: true,
        voiceGuidanceEnabled: true,
        hapticsEnabled: true,
        reducedMotion: false,
        defaultBreathingPace: 'standard_3_6',
      },
      updatedAt: new Date().toISOString(),
    }

    if (!firebaseServices.firestore || previewMode) {
      setStatusMessage('Profile saved in Preview / Offline Mode and ready for live sync once enabled.')
      return
    }

    await setDoc(
      doc(firebaseServices.firestore, `users/${session.uid}/settings/medicalProfile`),
      profile,
      { merge: true },
    )
    setStatusMessage('Medical profile saved and synchronised to Cloud Firestore.')
  }

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <EmergencyBar carerPhone={contactDirectory.contacts.emergencyCarer.phone} />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6">
        <section className="rounded-2xl border-2 border-slate-900 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Session mode</p>
              <h1 className="text-2xl font-bold">COPD recovery profile setup</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="min-h-12 rounded-lg border-2 border-slate-900 px-4 text-base font-semibold"
                onClick={togglePreviewMode}
              >
                {previewMode ? 'Switch to Google Sign-In' : 'Switch to Preview / Offline Mode'}
              </button>
              {session ? (
                <button
                  type="button"
                  className="min-h-12 rounded-lg border-2 border-slate-900 px-4 text-base font-semibold"
                  onClick={() => {
                    void signOutUser()
                  }}
                >
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-base text-slate-800">
            Designed for low-stress setup before acute episodes. All profile data is saved instantly for offline use.
          </p>
        </section>

        <AuthGuard>
          <ContactDirectoryForm
            value={contactDirectory}
            onChange={setContactDirectory}
            phoneErrors={phoneErrors}
            dateError={dateError}
          />

          <CustomStrategiesEditor value={customStrategies} onChange={setCustomStrategies} />

          <section className="space-y-3 rounded-2xl border-2 border-slate-900 bg-white p-5">
            <h2 className="text-xl font-bold text-slate-950">Red Path carer webhook</h2>
            <p className="text-base text-slate-800">
              Optional endpoint notified during escalation with keepalive delivery.
            </p>
            <input
              className="min-h-12 w-full rounded-lg border-2 border-slate-400 px-3 text-base"
              placeholder="https://example.com/carer-webhook"
              value={carerWebhookUrl}
              onChange={(event) => setCarerWebhookUrl(event.target.value)}
            />
          </section>

          <button
            type="button"
            className="min-h-12 rounded-xl bg-[#2E6F40] px-5 py-3 text-base font-bold text-white"
            onClick={() => {
              void saveProfile()
            }}
          >
            Save medical profile
          </button>

          {statusMessage ? (
            <p className="rounded-xl border border-slate-400 bg-white p-3 text-base font-medium text-slate-900">
              {statusMessage}
            </p>
          ) : null}
        </AuthGuard>
      </main>
    </div>
  )
}

export default App
