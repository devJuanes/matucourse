import { useLessonProgress, countCourseLessons } from './useLessonProgress'
import type { Course } from '@/services'

const STREAK_KEY = 'mc_streak'

export function useGamification(userId: string, courseId: string) {
  const progress = useLessonProgress(userId, courseId)

  function recordVisit() {
    const today = new Date().toISOString().slice(0, 10)
    try {
      const raw = localStorage.getItem(`${STREAK_KEY}_${userId}`)
      const data = raw ? JSON.parse(raw) as { last: string; count: number } : { last: '', count: 0 }
      if (data.last === today) return data.count
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = yesterday.toISOString().slice(0, 10)
      const count = data.last === yStr ? data.count + 1 : 1
      localStorage.setItem(`${STREAK_KEY}_${userId}`, JSON.stringify({ last: today, count }))
      return count
    } catch {
      return 1
    }
  }

  function getStreak(): number {
    try {
      const raw = localStorage.getItem(`${STREAK_KEY}_${userId}`)
      if (!raw) return 0
      const data = JSON.parse(raw) as { last: string; count: number }
      const today = new Date().toISOString().slice(0, 10)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      if (data.last === today || data.last === yesterday.toISOString().slice(0, 10)) {
        return data.count
      }
      return 0
    } catch {
      return 0
    }
  }

  function getProgressPercent(course: Course): number {
    return progress.getProgressPercent(countCourseLessons(course))
  }

  function isCourseComplete(course: Course): boolean {
    return getProgressPercent(course) >= 100
  }

  function getAchievements(course: Course): { id: string; label: string; done: boolean }[] {
    const pct = getProgressPercent(course)
    const completed = progress.getCompleted().length
    return [
      { id: 'start', label: 'Primera lección', done: completed >= 1 },
      { id: 'half', label: '50% del curso', done: pct >= 50 },
      { id: 'done', label: 'Curso completado', done: pct >= 100 },
    ]
  }

  return { recordVisit, getStreak, getProgressPercent, isCourseComplete, getAchievements, progress }
}
