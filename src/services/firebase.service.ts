import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  writeBatch,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { firebaseAuth, firestoreDb } from '@/firebase/config'
import { CPP_COURSE_SEED, mergeCppCourseFromFirestore } from '@/data/cpp-course-seed'
import { stripUndefined } from '@/utils/firestoreSanitize'
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

// ─── Auth ────────────────────────────────────────────────────────────────────

export class FirebaseAuthService implements IAuthService {
  private parseIsAdmin(value: unknown): boolean {
    if (value === true || value === 1) return true
    if (typeof value === 'string' && value.toLowerCase() === 'true') return true
    return false
  }

  private async fetchProfile(uid: string): Promise<{ name?: string; isAdmin?: boolean }> {
    try {
      const snap = await getDoc(doc(firestoreDb, 'users_profile', uid))
      if (snap.exists()) {
        const d = snap.data()
        return {
          name: d.name as string | undefined,
          isAdmin: this.parseIsAdmin(d.is_admin),
        }
      }
    } catch {}
    return {}
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password)
      const { name, isAdmin } = await this.fetchProfile(cred.user.uid)
      return {
        success: true,
        user: {
          id: cred.user.uid,
          email: cred.user.email!,
          name: name ?? cred.user.displayName ?? undefined,
          isAdmin,
        },
      }
    } catch (err: unknown) {
      return { success: false, error: this.mapError(err) }
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      const uid = cred.user.uid
      await updateProfile(cred.user, { displayName: name })
      await setDoc(doc(firestoreDb, 'users_profile', uid), {
        user_id: uid,
        name,
        email,
        is_admin: false,
        created_at: new Date().toISOString(),
      })
      return {
        success: true,
        user: { id: uid, email: cred.user.email!, name, isAdmin: false },
      }
    } catch (err: unknown) {
      return { success: false, error: this.mapError(err) }
    }
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth)
  }

  async checkSession(): Promise<MatuUser | null> {
    const current = firebaseAuth.currentUser
    if (current) {
      return this.buildUser(current)
    }
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(firebaseAuth, async (u) => {
        unsub()
        if (!u) {
          resolve(null)
          return
        }
        resolve(await this.buildUser(u))
      })
    })
  }

  private async buildUser(u: { uid: string; email: string | null; displayName: string | null }): Promise<MatuUser> {
    const { name, isAdmin } = await this.fetchProfile(u.uid)
    return {
      id: u.uid,
      email: u.email!,
      name: name ?? u.displayName ?? undefined,
      isAdmin,
    }
  }

  private mapError(err: unknown): string {
    if (!(err instanceof Error)) return 'Error desconocido'
    const code = (err as Error & { code?: string }).code ?? ''
    const map: Record<string, string> = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/email-already-in-use': 'El correo ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Correo inválido',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    }
    return map[code] ?? err.message
  }
}

// ─── DB ──────────────────────────────────────────────────────────────────────

export class FirebaseDbService implements IDbService {
  async getEnrollments(userId: string): Promise<Enrollment[]> {
    try {
      const q = query(collection(firestoreDb, 'enrollments'), where('user_id', '==', userId))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Enrollment, 'id'>) }))
    } catch {
      return []
    }
  }

  async hasEnrollment(userId: string, courseId: string): Promise<boolean> {
    try {
      const q = query(
        collection(firestoreDb, 'enrollments'),
        where('user_id', '==', userId),
        where('course_id', '==', courseId),
      )
      const snap = await getDocs(q)
      return !snap.empty
    } catch {
      return false
    }
  }

  async addEnrollment(
    userId: string,
    courseId: string,
    plan: PaymentPlan = 'full',
    secondDueDate?: string,
  ): Promise<void> {
    if (await this.hasEnrollment(userId, courseId)) return
    await addDoc(collection(firestoreDb, 'enrollments'), {
      user_id: userId,
      course_id: courseId,
      plan,
      enrolled_at: new Date().toISOString(),
      ...(plan === 'installments' && secondDueDate
        ? { second_payment_due: secondDueDate, second_payment_status: 'pending' }
        : {}),
    })
  }

  async searchStudents(term: string): Promise<ChatPartner[]> {
    try {
      const snap = await getDocs(collection(firestoreDb, 'users_profile'))
      const lower = term.toLowerCase().trim()
      const students: ChatPartner[] = []
      for (const d of snap.docs) {
        const data = d.data()
        if (this.parseIsAdmin(data.is_admin)) continue
        const name = (data.name as string) ?? ''
        const email = (data.email as string) ?? ''
        if (
          !lower ||
          name.toLowerCase().includes(lower) ||
          email.toLowerCase().includes(lower)
        ) {
          students.push({
            user_id: d.id,
            name: name || email || 'Estudiante',
            email,
          })
        }
      }
      return students
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 25)
    } catch {
      return []
    }
  }

  private parseIsAdmin(value: unknown): boolean {
    if (value === true || value === 1) return true
    if (typeof value === 'string' && value.toLowerCase() === 'true') return true
    return false
  }

  private normalizeCourse(id: string, data: Omit<Course, 'id'>): Course {
    const course = { id, ...data }
    if (id === CPP_COURSE_SEED.id) return mergeCppCourseFromFirestore(course)
    return course
  }

  async getCourses(): Promise<Course[]> {
    try {
      const snap = await getDocs(collection(firestoreDb, 'courses'))
      return snap.docs.map((d) =>
        this.normalizeCourse(d.id, d.data() as Omit<Course, 'id'>),
      )
    } catch {
      return []
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const snap = await getDoc(doc(firestoreDb, 'courses', id))
      if (!snap.exists()) {
        if (id === CPP_COURSE_SEED.id) return CPP_COURSE_SEED
        return null
      }
      return this.normalizeCourse(snap.id, snap.data() as Omit<Course, 'id'>)
    } catch {
      if (id === CPP_COURSE_SEED.id) return CPP_COURSE_SEED
      return null
    }
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<void> {
    await updateDoc(
      doc(firestoreDb, 'courses', id),
      stripUndefined(data) as Record<string, unknown>,
    )
  }

  async seedCourses(courses: Course[]): Promise<void> {
    const batch = writeBatch(firestoreDb)
    for (const course of courses) {
      batch.set(doc(firestoreDb, 'courses', course.id), course)
    }
    await batch.commit()
  }

  async seedCppCourse(): Promise<void> {
    await setDoc(doc(firestoreDb, 'courses', CPP_COURSE_SEED.id), CPP_COURSE_SEED)
  }

  subscribeCourse(courseId: string, onUpdate: (course: Course | null) => void): () => void {
    return onSnapshot(
      doc(firestoreDb, 'courses', courseId),
      (snap) => {
        if (!snap.exists()) {
          onUpdate(courseId === CPP_COURSE_SEED.id ? CPP_COURSE_SEED : null)
          return
        }
        onUpdate(this.normalizeCourse(snap.id, snap.data() as Omit<Course, 'id'>))
      },
      () => onUpdate(courseId === CPP_COURSE_SEED.id ? CPP_COURSE_SEED : null),
    )
  }

  async getEnrolledStudents(courseId: string): Promise<ChatPartner[]> {
    try {
      const enrollSnap = await getDocs(
        query(collection(firestoreDb, 'enrollments'), where('course_id', '==', courseId)),
      )
      const partners: ChatPartner[] = []
      for (const d of enrollSnap.docs) {
        const uid = d.data().user_id as string
        if (!uid) continue
        try {
          const profile = await getDoc(doc(firestoreDb, 'users_profile', uid))
          if (profile.exists()) {
            const p = profile.data()
            partners.push({
              user_id: uid,
              name: (p.name as string) ?? (p.email as string) ?? 'Estudiante',
              email: (p.email as string) ?? '',
            })
          } else {
            partners.push({ user_id: uid, name: 'Estudiante', email: '' })
          }
        } catch {
          partners.push({ user_id: uid, name: 'Estudiante', email: '' })
        }
      }
      return partners.sort((a, b) => a.name.localeCompare(b.name))
    } catch {
      return []
    }
  }

  async getAgendaSessions(courseIds?: string[]): Promise<AgendaSession[]> {
    try {
      const snap = await getDocs(collection(firestoreDb, 'agenda_sessions'))
      let sessions = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AgendaSession, 'id'>),
      }))
      if (courseIds && courseIds.length > 0) {
        sessions = sessions.filter((s) => courseIds.includes(s.course_id))
      }
      return sessions
    } catch {
      return []
    }
  }

  async addAgendaSession(session: Omit<AgendaSession, 'id'>): Promise<void> {
    await addDoc(collection(firestoreDb, 'agenda_sessions'), session)
  }

  async deleteAgendaSession(id: string): Promise<void> {
    await deleteDoc(doc(firestoreDb, 'agenda_sessions', id))
  }

  async sendMessageToAdmin(fromUserId: string, text: string): Promise<void> {
    await addDoc(collection(firestoreDb, 'chat_messages'), {
      from_user_id: fromUserId,
      to_admin: true,
      text,
      created_at: new Date().toISOString(),
    })
  }

  async sendChatMessage(fromUserId: string, toUserId: string, text: string): Promise<void> {
    await addDoc(collection(firestoreDb, 'chat_messages'), {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      text,
      created_at: new Date().toISOString(),
    })
  }

  subscribeStudentAdminChat(
    studentId: string,
    onUpdate: (messages: ChatMessage[]) => void,
  ): () => void {
    const qOut = query(
      collection(firestoreDb, 'chat_messages'),
      where('from_user_id', '==', studentId),
      where('to_admin', '==', true),
    )
    const qIn = query(
      collection(firestoreDb, 'chat_messages'),
      where('to_user_id', '==', studentId),
    )

    let out: ChatMessage[] = []
    let inMsgs: ChatMessage[] = []

    const emit = () => {
      const merged = [...out, ...inMsgs].sort((a, b) => a.created_at.localeCompare(b.created_at))
      onUpdate(merged)
    }

    const unsub1 = onSnapshot(qOut, (snap) => {
      out = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) }))
      emit()
    }, () => onUpdate([]))

    const unsub2 = onSnapshot(qIn, (snap) => {
      inMsgs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) }))
      emit()
    }, () => onUpdate([]))

    return () => { unsub1(); unsub2() }
  }

  subscribeAdminStudentChat(
    adminId: string,
    studentId: string,
    onUpdate: (messages: ChatMessage[]) => void,
  ): () => void {
    const qFromStudent = query(
      collection(firestoreDb, 'chat_messages'),
      where('from_user_id', '==', studentId),
      where('to_admin', '==', true),
    )
    const qFromAdmin = query(
      collection(firestoreDb, 'chat_messages'),
      where('from_user_id', '==', adminId),
      where('to_user_id', '==', studentId),
    )

    let fromStudent: ChatMessage[] = []
    let fromAdmin: ChatMessage[] = []

    const emit = () => {
      const merged = [...fromStudent, ...fromAdmin].sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      )
      onUpdate(merged)
    }

    const unsub1 = onSnapshot(qFromStudent, (snap) => {
      fromStudent = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) }))
      emit()
    }, () => onUpdate([]))

    const unsub2 = onSnapshot(qFromAdmin, (snap) => {
      fromAdmin = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) }))
      emit()
    }, () => onUpdate([]))

    return () => { unsub1(); unsub2() }
  }

  async getChatPartners(userId: string, isInstructor: boolean): Promise<ChatPartner[]> {
    if (!isInstructor) return []

    try {
      const snap = await getDocs(
        query(collection(firestoreDb, 'chat_messages'), where('to_admin', '==', true)),
      )
      const studentIds = [...new Set(
        snap.docs.map((d) => d.data().from_user_id as string).filter((id) => id && id !== userId),
      )]

      const partners: ChatPartner[] = []
      for (const sid of studentIds) {
        try {
          const profile = await getDoc(doc(firestoreDb, 'users_profile', sid))
          if (profile.exists()) {
            const d = profile.data()
            partners.push({
              user_id: sid,
              name: (d.name as string) ?? (d.email as string) ?? 'Estudiante',
              email: (d.email as string) ?? '',
            })
          } else {
            partners.push({ user_id: sid, name: 'Estudiante', email: '' })
          }
        } catch {
          partners.push({ user_id: sid, name: 'Estudiante', email: '' })
        }
      }
      return partners.sort((a, b) => a.name.localeCompare(b.name))
    } catch {
      return []
    }
  }

  async submitSupportTicket(input: SubmitSupportTicketInput): Promise<string> {
    const now = new Date().toISOString()
    const ref = await addDoc(collection(firestoreDb, 'support_tickets'), {
      ...input,
      status: 'open',
      created_at: now,
      updated_at: now,
    })
    return ref.id
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    try {
      const q = query(collection(firestoreDb, 'support_tickets'), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SupportTicket, 'id'>),
      }))
    } catch {
      return []
    }
  }

  subscribeSupportTickets(onUpdate: (tickets: SupportTicket[]) => void): () => void {
    const q = query(collection(firestoreDb, 'support_tickets'), orderBy('created_at', 'desc'))
    return onSnapshot(
      q,
      (snap) => {
        onUpdate(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<SupportTicket, 'id'>),
          })),
        )
      },
      () => onUpdate([]),
    )
  }

  async updateSupportTicketStatus(id: string, status: SupportTicketStatus): Promise<void> {
    await updateDoc(doc(firestoreDb, 'support_tickets', id), {
      status,
      updated_at: new Date().toISOString(),
    })
  }

  async updateLesson(
    courseId: string,
    moduleId: number,
    lessonId: string,
    data: Partial<CourseLesson>,
  ): Promise<void> {
    const course = await this.getCourseById(courseId)
    if (!course) throw new Error('Curso no encontrado')

    const cleanData = stripUndefined(data)
    const modules = course.modules.map((m) => {
      if (m.id !== moduleId) return m
      const lessons = (m.lessons ?? []).map((l) =>
        l.id === lessonId ? stripUndefined({ ...l, ...cleanData }) : l,
      )
      return { ...m, lessons }
    })

    await updateDoc(
      doc(firestoreDb, 'courses', courseId),
      stripUndefined({ modules }) as Record<string, unknown>,
    )
  }

  async updateLessonUnlock(
    courseId: string,
    moduleId: number,
    lessonId: string,
    unlocked: boolean,
  ): Promise<void> {
    await this.updateLesson(courseId, moduleId, lessonId, { unlocked })
  }
}
