import { FirebaseAuthService, FirebaseDbService } from './firebase.service'
import { MatuDBAuthService, MatuDBService, matudb } from './matudb.service'
import type { IAuthService, IDbService } from './types'

/**
 * Backend switch:
 *   VITE_USE_FIREBASE=true  (or "on")  → Firebase Auth + Firestore
 *   VITE_USE_FIREBASE=false (or "off") → MatuDB (base de datos actual)
 */
export const USE_FIREBASE =
  import.meta.env.VITE_USE_FIREBASE === 'true' ||
  import.meta.env.VITE_USE_FIREBASE === 'on'

export const authService: IAuthService = USE_FIREBASE
  ? new FirebaseAuthService()
  : new MatuDBAuthService()

export const dbService: IDbService = USE_FIREBASE
  ? new FirebaseDbService()
  : new MatuDBService()

export { matudb }
export type { IAuthService, IDbService }
export type {
  MatuUser,
  Enrollment,
  AuthResult,
  Course,
  CoursePrice,
  CourseModule,
  CourseLesson,
  AgendaSession,
  ChatMessage,
  ChatPartner,
  PaymentPlan,
  SupportTicket,
  SupportTicketCategory,
  SupportTicketStatus,
  SubmitSupportTicketInput,
} from './types'
