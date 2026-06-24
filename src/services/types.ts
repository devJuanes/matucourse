// ─── Auth ────────────────────────────────────────────────────────────────────

export interface MatuUser {
  id: string
  email: string
  name?: string
  isAdmin?: boolean
}

export interface AuthResult {
  success: boolean
  user?: MatuUser
  error?: string
}

export interface IAuthService {
  login(email: string, password: string): Promise<AuthResult>
  register(name: string, email: string, password: string): Promise<AuthResult>
  logout(): Promise<void>
  checkSession(): Promise<MatuUser | null>
}

// ─── Enrollments ─────────────────────────────────────────────────────────────

export interface Enrollment {
  id: string
  course_id: string
  user_id: string
  enrolled_at: string
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export interface CoursePrice {
  COP: number
  USD: number
  EUR: number
}

export interface CourseLesson {
  id: string
  title: string
  description?: string
  content?: string
  unlocked: boolean
  duration?: string
  videoUrl?: string
  imageUrl?: string
  codeExample?: string
  meetingUrl?: string
}

export interface CourseModule {
  id: number
  title: string
  description: string
  /** Legacy: lista simple para catálogo público */
  topics?: string[]
  /** Lecciones con control de acceso */
  lessons?: CourseLesson[]
}

export interface Course {
  id: string
  title: string
  category: string
  instructor: string
  instructorTitle: string
  level: string
  modality: string
  thumbnail: string
  price: CoursePrice
  description: string
  featured: boolean
  modules: CourseModule[]
}

// ─── Agenda ──────────────────────────────────────────────────────────────────

export interface AgendaSession {
  id: string
  course_id: string
  course_title?: string
  day_of_week: string
  time: string
  duration: string
  session_date?: string
  user_id?: string
  lesson_id?: string
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  from_user_id: string
  to_user_id?: string
  /** Mensaje del estudiante hacia cualquier admin */
  to_admin?: boolean
  text: string
  created_at: string
}

export interface ChatPartner {
  user_id: string
  name: string
  email: string
  last_message?: string
  last_at?: string
}

// ─── Support tickets (PQR / soporte) ─────────────────────────────────────────

export type SupportTicketCategory =
  | 'peticion'
  | 'queja'
  | 'reclamo'
  | 'soporte_tecnico'
  | 'facturacion'
  | 'otro'

export type SupportTicketStatus = 'open' | 'in_progress' | 'closed'

export interface SupportTicket {
  id: string
  name: string
  email: string
  category: SupportTicketCategory
  subject: string
  message: string
  phone?: string
  user_id?: string
  status: SupportTicketStatus
  created_at: string
  updated_at?: string
}

export interface SubmitSupportTicketInput {
  name: string
  email: string
  category: SupportTicketCategory
  subject: string
  message: string
  phone?: string
  user_id?: string
}

// ─── Payment plan ─────────────────────────────────────────────────────────────

export type PaymentPlan = 'full' | 'installments'

// ─── DB service interface ─────────────────────────────────────────────────────

export interface IDbService {
  getEnrollments(userId: string): Promise<Enrollment[]>
  addEnrollment(userId: string, courseId: string, plan?: PaymentPlan, secondDueDate?: string): Promise<void>
  getCourses(): Promise<Course[]>
  getCourseById(id: string): Promise<Course | null>
  updateCourse(id: string, data: Partial<Course>): Promise<void>
  seedCourses(courses: Course[]): Promise<void>
  seedCppCourse(): Promise<void>
  subscribeCourse(courseId: string, onUpdate: (course: Course | null) => void): () => void
  getEnrolledStudents(courseId: string): Promise<ChatPartner[]>

  getAgendaSessions(courseIds?: string[]): Promise<AgendaSession[]>
  addAgendaSession(session: Omit<AgendaSession, 'id'>): Promise<void>
  deleteAgendaSession(id: string): Promise<void>

  getChatPartners(userId: string, isInstructor: boolean): Promise<ChatPartner[]>
  sendMessageToAdmin(fromUserId: string, text: string): Promise<void>
  sendChatMessage(fromUserId: string, toUserId: string, text: string): Promise<void>
  subscribeStudentAdminChat(
    studentId: string,
    onUpdate: (messages: ChatMessage[]) => void,
  ): () => void
  subscribeAdminStudentChat(
    adminId: string,
    studentId: string,
    onUpdate: (messages: ChatMessage[]) => void,
  ): () => void

  submitSupportTicket(input: SubmitSupportTicketInput): Promise<string>
  getSupportTickets(): Promise<SupportTicket[]>
  subscribeSupportTickets(onUpdate: (tickets: SupportTicket[]) => void): () => void
  updateSupportTicketStatus(id: string, status: SupportTicketStatus): Promise<void>

  updateLesson(
    courseId: string,
    moduleId: number,
    lessonId: string,
    data: Partial<CourseLesson>,
  ): Promise<void>

  updateLessonUnlock(
    courseId: string,
    moduleId: number,
    lessonId: string,
    unlocked: boolean,
  ): Promise<void>
}
