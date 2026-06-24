import { defineStore } from 'pinia'
import type { Course } from '@/services/types'

export type { Course }
export type { CoursePrice, CourseModule } from '@/services/types'

export const useCartStore = defineStore('cart', {
  state: () => ({
    courseId: null as string | null,
    course: null as Course | null,
  }),
  actions: {
    selectCourse(course: Course) {
      this.courseId = course.id
      this.course = course
    },
    clearCourse() {
      this.courseId = null
      this.course = null
    },
  },
})
