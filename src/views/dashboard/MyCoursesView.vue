<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { dbService } from '@/services'
import { useCoursesStore } from '@/stores/courses'
import type { Course } from '@/stores/cart'
import { useLessonProgress, countCourseLessons } from '@/composables/useLessonProgress'
import { BookOpen } from '@lucide/vue'

const authStore = useAuthStore()
const coursesStore = useCoursesStore()

interface Enrollment {
  id: string
  course_id: string
  enrolled_at: string
}

const enrollments = ref<Enrollment[]>([])
const loading = ref(true)

onMounted(async () => {
  await coursesStore.fetchCourses()
  if (authStore.user?.id) {
    enrollments.value = await dbService.getEnrollments(authStore.user.id)
  }
  loading.value = false
})

function getCourse(id: string): Course | undefined {
  return coursesStore.getCourseById(id)
}

function courseProgress(course: Course): number {
  if (!authStore.user?.id) return 0
  return useLessonProgress(authStore.user.id, course.id).getProgressPercent(countCourseLessons(course))
}
</script>

<template>
  <div class="p-8 max-w-[1100px]">

    <!-- Header -->
    <div class="mb-8 border-b border-[#d1d7dc] pb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-extrabold text-[#1c1d1f]">Mis Cursos</h2>
        <p class="text-[#6a6f73] text-sm mt-1">
          {{ enrollments.length }} curso{{ enrollments.length !== 1 ? 's' : '' }} inscrito{{ enrollments.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <RouterLink to="/courses"
        class="text-sm font-bold border border-[#1c1d1f] text-[#1c1d1f] px-4 py-2 hover:bg-[#1c1d1f] hover:text-white transition-colors">
        + Explorar más cursos
      </RouterLink>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="border border-[#d1d7dc] animate-pulse">
        <div class="h-36 bg-[#f7f9fa]"></div>
        <div class="p-4 space-y-2">
          <div class="h-3 bg-[#f7f9fa] w-3/4"></div>
          <div class="h-2 bg-[#f7f9fa] w-1/2"></div>
          <div class="h-1.5 bg-[#f7f9fa] w-full mt-3"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="enrollments.length === 0" class="border border-[#d1d7dc] p-16 text-center">
      <BookOpen :size="48" class="mx-auto text-[#d1d7dc] mb-4" />
      <h3 class="text-xl font-extrabold text-[#1c1d1f] mb-2">Empieza a aprender</h3>
      <p class="text-[#6a6f73] text-sm mb-6 max-w-sm mx-auto">
        Cuando te inscribas en un curso, aparecerá aquí. Explora nuestro catálogo y elige el tuyo.
      </p>
      <RouterLink to="/courses"
        class="inline-block bg-[#5624d0] text-white font-bold px-8 py-3 hover:bg-[#3d1a9e] transition-colors">
        Explorar Cursos
      </RouterLink>
    </div>

    <!-- Course grid (Udemy card style) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <template v-for="enrollment in enrollments" :key="enrollment.id">
        <div v-if="getCourse(enrollment.course_id)"
          class="border border-[#d1d7dc] hover:shadow-md transition-shadow flex flex-col">
          <img :src="getCourse(enrollment.course_id)!.thumbnail" :alt="getCourse(enrollment.course_id)!.title" class="w-full h-36 object-cover" />
          <div class="p-4 flex flex-col flex-1">
            <h3 class="font-bold text-sm text-[#1c1d1f] leading-snug mb-1">{{ getCourse(enrollment.course_id)!.title }}</h3>
            <p class="text-xs text-[#6a6f73] mb-1">{{ getCourse(enrollment.course_id)!.instructor }}</p>
            <p class="text-xs text-[#6a6f73] mb-3">{{ getCourse(enrollment.course_id)!.level }}</p>

            <!-- Progress bar -->
            <div class="mb-3">
              <div class="flex items-center justify-between text-[10px] text-[#6a6f73] mb-1">
                <span>Progreso</span><span>{{ courseProgress(getCourse(enrollment.course_id)!) }}%</span>
              </div>
              <div class="h-1.5 bg-[#d1d7dc]">
                <div
                  class="h-1.5 bg-[#5624d0] transition-all"
                  :style="{ width: `${courseProgress(getCourse(enrollment.course_id)!)}%` }"
                ></div>
              </div>
            </div>

            <div class="mt-auto flex items-center justify-between">
              <span class="text-[10px] text-[#6a6f73]">
                Inscrito {{ new Date(enrollment.enrolled_at).toLocaleDateString('es-CO') }}
              </span>
              <RouterLink :to="`/dashboard/learn/${getCourse(enrollment.course_id)!.id}`"
                class="text-xs font-bold border border-[#1c1d1f] text-[#1c1d1f] px-3 py-1.5 hover:bg-[#1c1d1f] hover:text-white transition-colors">
                Continuar →
              </RouterLink>
            </div>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>
