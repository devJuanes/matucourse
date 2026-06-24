import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dbService } from '@/services'
import type { Course } from '@/services'
import coursesJson from '@/data/courses.json'

const JSON_COURSES = coursesJson.courses as unknown as Course[]
const JSON_CATEGORIES: string[] = coursesJson.categories

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref<Course[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  const categories = ref<string[]>(JSON_CATEGORIES)

  async function fetchCourses() {
    if (loaded.value) return
    loading.value = true
    try {
      const result = await dbService.getCourses()
      if (result.length > 0) {
        courses.value = result
        const cats = [...new Set(result.map((c) => c.category))]
        categories.value = cats
      } else {
        courses.value = JSON_COURSES
        categories.value = JSON_CATEGORIES
      }
    } catch {
      courses.value = JSON_COURSES
      categories.value = JSON_CATEGORIES
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  async function updateCourse(id: string, data: Partial<Course>) {
    await dbService.updateCourse(id, data)
    const idx = courses.value.findIndex((c) => c.id === id)
    if (idx !== -1) {
      courses.value[idx] = { ...courses.value[idx], ...(data as Course) }
    }
  }

  async function seedCourses() {
    await dbService.seedCourses(JSON_COURSES)
    courses.value = JSON_COURSES
    loaded.value = true
  }

  function getCourseById(id: string): Course | undefined {
    return courses.value.find((c) => c.id === id)
  }

  async function seedCppCourse() {
    await dbService.seedCppCourse()
    await fetchCourses()
    loaded.value = true
  }

  return { courses, categories, loading, loaded, fetchCourses, updateCourse, seedCourses, seedCppCourse, getCourseById }
})
