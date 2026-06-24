import { createClient } from '@devjuanes/matuclient'
import coursesJson from '@/data/courses.json'
import { CPP_COURSE_SEED } from '@/data/cpp-course-seed'
import type {
  MatuUser,
  Enrollment,
  AuthResult,
  Course,
  CourseLesson,
  AgendaSession,
  ChatMessage,
  ChatPartner,
  PaymentPlan,
  SupportTicket,
  SupportTicketStatus,
  SubmitSupportTicketInput,
  IAuthService,
  IDbService,
} from './types'

const db = createClient({
  url: import.meta.env.VITE_MATUDB_URL,
  projectId: import.meta.env.VITE_MATUDB_PROJECT_ID,
  apiKey: import.meta.env.VITE_MATUDB_API_KEY,
})

export { db as matudb }

// ─── Auth ────────────────────────────────────────────────────────────────────

export class MatuDBAuthService implements IAuthService {
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await db.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message ?? 'Error al iniciar sesión')
      return { success: true, user: (data?.user as MatuUser) ?? undefined }
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al iniciar sesión',
      }
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await db.auth.signUp({ email, password })
      if (error) throw new Error(error.message ?? 'Error al registrarse')
      const newUser = data?.user as MatuUser
      if (newUser?.id) {
        await db.from('users_profile').insert({
          user_id: newUser.id,
          name,
          email,
          is_admin: false,
          created_at: new Date().toISOString(),
        })
      }
      return { success: true, user: newUser ? { ...newUser, name } : undefined }
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al registrarse',
      }
    }
  }

  async logout(): Promise<void> {
    await db.auth.signOut()
  }

  async checkSession(): Promise<MatuUser | null> {
    try {
      const { data } = await db.auth.getSession()
      if (!data?.session) return null
      const { data: userData } = await db.auth.getUser()
      return (userData?.user as MatuUser) ?? null
    } catch {
      return null
    }
  }
}

// ─── DB ──────────────────────────────────────────────────────────────────────

export class MatuDBService implements IDbService {
  async getEnrollments(userId: string): Promise<Enrollment[]> {
    try {
      const { data } = await db.from('enrollments').select('*').eq('user_id', userId)
      return (data as Enrollment[]) ?? []
    } catch {
      return []
    }
  }

  async addEnrollment(
    userId: string,
    courseId: string,
    plan: PaymentPlan = 'full',
    secondDueDate?: string,
  ): Promise<void> {
    await db.from('enrollments').insert({
      user_id: userId,
      course_id: courseId,
      plan,
      enrolled_at: new Date().toISOString(),
      ...(plan === 'installments' && secondDueDate
        ? { second_payment_due: secondDueDate, second_payment_status: 'pending' }
        : {}),
    })
  }

  async getCourses(): Promise<Course[]> {
    return coursesJson.courses as unknown as Course[]
  }

  async updateCourse(_id: string, _data: Partial<Course>): Promise<void> {
    // En modo MatuDB los cursos son JSON estático; edición no disponible
  }

  async seedCourses(_courses: Course[]): Promise<void> {
    // En modo MatuDB no aplica
  }

  async getCourseById(id: string): Promise<Course | null> {
    const courses = coursesJson.courses as unknown as Course[]
    return courses.find((c) => c.id === id) ?? null
  }

  async seedCppCourse(): Promise<void> {}

  subscribeCourse(_courseId: string, onUpdate: (course: Course | null) => void): () => void {
    const c = (coursesJson.courses as unknown as Course[]).find((x) => x.id === _courseId)
    onUpdate(c ?? null)
    return () => {}
  }

  async getEnrolledStudents(_courseId: string): Promise<ChatPartner[]> {
    return []
  }

  async getAgendaSessions(_courseIds?: string[]): Promise<AgendaSession[]> {
    return []
  }

  async addAgendaSession(_session: Omit<AgendaSession, 'id'>): Promise<void> {}

  async deleteAgendaSession(_id: string): Promise<void> {}

  async getChatPartners(_userId: string, _isInstructor: boolean): Promise<ChatPartner[]> {
    return []
  }

  async sendMessageToAdmin(_from: string, _text: string): Promise<void> {}

  async sendChatMessage(_from: string, _to: string, _text: string): Promise<void> {}

  subscribeStudentAdminChat(
    _studentId: string,
    onUpdate: (messages: ChatMessage[]) => void,
  ): () => void {
    onUpdate([])
    return () => {}
  }

  subscribeAdminStudentChat(
    _adminId: string,
    _studentId: string,
    onUpdate: (messages: ChatMessage[]) => void,
  ): () => void {
    onUpdate([])
    return () => {}
  }

  async submitSupportTicket(_input: SubmitSupportTicketInput): Promise<string> {
    return 'local-stub'
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    return []
  }

  subscribeSupportTickets(onUpdate: (tickets: SupportTicket[]) => void): () => void {
    onUpdate([])
    return () => {}
  }

  async updateSupportTicketStatus(_id: string, _status: SupportTicketStatus): Promise<void> {}

  async updateLesson(
    _courseId: string,
    _moduleId: number,
    _lessonId: string,
    _data: Partial<CourseLesson>,
  ): Promise<void> {}

  async updateLessonUnlock(
    _courseId: string,
    _moduleId: number,
    _lessonId: string,
    _unlocked: boolean,
  ): Promise<void> {}
}
