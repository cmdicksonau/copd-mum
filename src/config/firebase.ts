import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from 'firebase/firestore'

type FirebaseMode = 'live' | 'demo'

interface FirebaseServices {
  mode: FirebaseMode
  app: FirebaseApp | null
  auth: Auth | null
  firestore: Firestore | null
  googleProvider: GoogleAuthProvider | null
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: 'newmum-copd-app-1234',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.appId,
)

const initialiseServices = (): FirebaseServices => {
  if (!isConfigured) {
    return {
      mode: 'demo',
      app: null,
      auth: null,
      firestore: null,
      googleProvider: null,
    }
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

  let firestore: Firestore
  try {
    firestore = initializeFirestore(app, {
      localCache: persistentLocalCache(),
    })
  } catch {
    firestore = getFirestore(app)
  }

  const auth = getAuth(app)
  const googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })

  return {
    mode: 'live',
    app,
    auth,
    firestore,
    googleProvider,
  }
}

export const firebaseServices = initialiseServices()
export const isFirebaseDemoMode = firebaseServices.mode === 'demo'
