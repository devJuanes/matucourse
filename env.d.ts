/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Backend switch
  readonly VITE_USE_FIREBASE: string

  // Firebase
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string

  // MatuDB
  readonly VITE_MATUDB_URL: string
  readonly VITE_MATUDB_PROJECT_ID: string
  readonly VITE_MATUDB_API_KEY: string

  // Pagos
  readonly VITE_PAYMATUBYTE_URL: string
  readonly VITE_PAYMATUBYTE_API_KEY: string

  // App
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
