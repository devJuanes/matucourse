/** Progreso local por usuario/curso (completadas al abrir la lección). */
export function useLessonProgress(userId: string, courseId: string) {
  const key = `mc_progress_${userId}_${courseId}`

  function getCompleted(): string[] {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]') as string[]
    } catch {
      return []
    }
  }

  function markComplete(lessonId: string) {
    const list = getCompleted()
    if (!list.includes(lessonId)) {
      list.push(lessonId)
      localStorage.setItem(key, JSON.stringify(list))
    }
  }

  function getProgressPercent(totalLessons: number): number {
    if (totalLessons === 0) return 0
    return Math.min(100, Math.round((getCompleted().length / totalLessons) * 100))
  }

  return { getCompleted, markComplete, getProgressPercent }
}

export function countCourseLessons(course: { modules: { lessons?: { id: string }[]; topics?: string[] }[] }): number {
  const fromLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0)
  if (fromLessons > 0) return fromLessons
  return course.modules.reduce((acc, m) => acc + (m.topics?.length ?? 0), 0)
}
