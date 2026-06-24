import coursesJson from './courses.json'
import type { Course, CourseLesson, CourseModule } from '@/services/types'

const WELCOME_LESSON: CourseLesson = {
  id: 'm1-welcome',
  title: 'Bienvenida al curso',
  description: 'Conoce la plataforma, el instructor y cómo aprovechar cada clase en vivo.',
  content:
    '¡Bienvenido a C++ desde Cero!\n\nAprenderás C++ paso a paso con clases en vivo. Las lecciones se habilitan progresivamente según el avance del grupo.\n\n**Qué incluye:**\n- Clases en vivo con el instructor\n- Material de apoyo y ejercicios\n- Certificado al completar el curso\n\nRevisa la agenda para ver tus próximas sesiones. Si tienes dudas, usa el chat.',
  unlocked: true,
  duration: '10 min',
}

const cppJson = coursesJson.courses.find((c) => c.id === 'cpp-fundamentals')!

function buildModulesFromJson(): CourseModule[] {
  return (cppJson.modules as CourseModule[]).map((mod) => {
    const topics = mod.topics ?? []
    const lessons: CourseLesson[] = []

    if (mod.id === 1) {
      lessons.push(WELCOME_LESSON)
    }

    topics.forEach((topic, index) => {
      lessons.push({
        id: `m${mod.id}-l${index + 1}`,
        title: topic,
        unlocked: false,
        duration: '45 min',
      })
    })

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      topics,
      lessons,
    }
  })
}

/** Curso C++ completo: topics del catálogo + lecciones con control `unlocked`. */
export const CPP_COURSE_SEED: Course = {
  id: cppJson.id,
  title: cppJson.title,
  category: cppJson.category,
  instructor: cppJson.instructor,
  instructorTitle: cppJson.instructorTitle,
  level: cppJson.level,
  modality: cppJson.modality,
  thumbnail: cppJson.thumbnail,
  price: cppJson.price,
  description: cppJson.description,
  featured: cppJson.featured,
  modules: buildModulesFromJson(),
}

/** Combina el contenido completo del seed con `unlocked` guardado en Firestore. */
export function mergeCppCourseFromFirestore(dbCourse: Course | null): Course {
  if (!dbCourse) return CPP_COURSE_SEED

  const unlockedById = new Map<string, boolean>()
  for (const mod of dbCourse.modules ?? []) {
    for (const lesson of mod.lessons ?? []) {
      unlockedById.set(lesson.id, lesson.unlocked)
    }
  }

  return {
    ...CPP_COURSE_SEED,
    ...dbCourse,
    modules: CPP_COURSE_SEED.modules.map((seedMod) => {
      const dbMod = dbCourse.modules?.find((m) => m.id === seedMod.id)
      return {
        ...seedMod,
        lessons: seedMod.lessons?.map((lesson) => ({
          ...lesson,
          unlocked: unlockedById.has(lesson.id) ? unlockedById.get(lesson.id)! : lesson.unlocked,
        })),
        // Conservar topics del seed; Firestore antiguo puede no tenerlos
        topics: seedMod.topics ?? dbMod?.topics,
      }
    }),
  }
}
