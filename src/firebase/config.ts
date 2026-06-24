import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const USE_FIREBASE =
  import.meta.env.VITE_USE_FIREBASE === 'true' ||
  import.meta.env.VITE_USE_FIREBASE === 'on'

function createFirebaseApp(): FirebaseApp | null {
  if (!USE_FIREBASE) return null
  if (getApps().length > 0) return getApps()[0]!
  return initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  })
}

const app = createFirebaseApp()

export const firebaseAuth: Auth = app ? getAuth(app) : (null as unknown as Auth)
export const firestoreDb: Firestore = app ? getFirestore(app) : (null as unknown as Firestore)
