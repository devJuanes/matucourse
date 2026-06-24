<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { dbService } from '@/services'
import { useCoursesStore } from '@/stores/courses'
import type { Course, AgendaSession } from '@/services'
import { useLessonProgress, countCourseLessons } from '@/composables/useLessonProgress'
import { APP } from '@/config/app'
import { BookOpen, Library, Video, Star, Users, MapPin, CalendarDays, ArrowRight, ExternalLink } from '@lucide/vue'

const authStore = useAuthStore()
const coursesStore = useCoursesStore()

interface Enrollment {
  id: string
  course_id: string
  enrolled_at: string
}

const enrollments = ref<Enrollment[]>([])
const agendaSessions = ref<AgendaSession[]>([])
const loadingEnrollments = ref(true)

onMounted(async () => {
  await coursesStore.fetchCourses()
  if (authStore.user?.id) {
    enrollments.value = await dbService.getEnrollments(authStore.user.id)
    const courseIds = enrollments.value.map((e) => e.course_id)
    agendaSessions.value = await dbService.getAgendaSessions(courseIds)
  }
  loadingEnrollments.value = false
})

function getEnrolledCourses(): Course[] {
  return enrollments.value
    .map((e) => coursesStore.getCourseById(e.course_id))
    .filter(Boolean) as Course[]
}

function courseProgress(course: Course): number {
  if (!authStore.user?.id) return 0
  return useLessonProgress(authStore.user.id, course.id).getProgressPercent(countCourseLessons(course))
}

function upcomingFromAgenda(): AgendaSession[] {
  const today = new Date()
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const todayName = dayNames[today.getDay()]
  return agendaSessions.value
    .filter((s) => s.day_of_week === todayName)
    .slice(0, 3)
}

function formatAgendaDay(session: AgendaSession) {
  return session.day_of_week.slice(0, 3)
}

const firstName = () => {
  const n = authStore.user?.name ?? authStore.user?.email ?? 'Estudiante'
  return n.split(' ')[0]
}
</script>

<template>
  <div class="p-8 max-w-[1100px]">

    <div class="mb-8 border-b border-[#d1d7dc] pb-6">
      <h2 class="text-2xl font-extrabold text-[#1c1d1f]">Hola, {{ firstName() }}.</h2>
      <p class="text-[#6a6f73] text-sm mt-1">Continúa donde lo dejaste</p>
    </div>

    <!-- Stats: solo datos reales -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
      <div class="border border-[#d1d7dc] p-5 flex items-start gap-3">
        <Library :size="20" class="text-[#5624d0] mt-0.5 flex-shrink-0" />
        <div>
          <div class="text-2xl font-extrabold text-[#5624d0]">{{ enrollments.length }}</div>
          <div class="text-xs text-[#6a6f73] font-semibold mt-0.5 uppercase tracking-wide">Mis cursos</div>
        </div>
      </div>
      <div class="border border-[#d1d7dc] p-5 flex items-start gap-3">
        <CalendarDays :size="20" class="text-[#1c1d1f] mt-0.5 flex-shrink-0" />
        <div>
          <div class="text-2xl font-extrabold text-[#1c1d1f]">{{ agendaSessions.length }}</div>
          <div class="text-xs text-[#6a6f73] font-semibold mt-0.5 uppercase tracking-wide">Clases programadas</div>
        </div>
      </div>
      <div class="border border-[#d1d7dc] p-5 flex items-start gap-3 col-span-2 lg:col-span-1">
        <BookOpen :size="20" class="text-[#1c1d1f] mt-0.5 flex-shrink-0" />
        <div>
          <div class="text-2xl font-extrabold text-[#1c1d1f]">{{ coursesStore.courses.length }}</div>
          <div class="text-xs text-[#6a6f73] font-semibold mt-0.5 uppercase tracking-wide">Cursos disponibles</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-extrabold text-[#1c1d1f]">Mis Cursos</h3>
          <RouterLink to="/dashboard/my-courses" class="text-sm font-semibold text-[#5624d0] hover:underline flex items-center gap-1">
            Ver todos <ArrowRight :size="14" />
          </RouterLink>
        </div>

        <div v-if="loadingEnrollments" class="space-y-3">
          <div v-for="i in 2" :key="i" class="border border-[#d1d7dc] p-4 flex gap-4 animate-pulse">
            <div class="w-24 h-16 bg-[#f7f9fa] flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-[#f7f9fa] w-3/4"></div>
              <div class="h-2 bg-[#f7f9fa] w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else-if="getEnrolledCourses().length === 0" class="border border-[#d1d7dc] p-12 text-center">
          <BookOpen :size="40" class="mx-auto text-[#d1d7dc] mb-3" />
          <h4 class="font-extrabold text-[#1c1d1f] mb-2">No tienes cursos aún</h4>
          <p class="text-sm text-[#6a6f73] mb-5">Inscríbete en un curso para empezar a aprender</p>
          <RouterLink to="/courses"
            class="inline-block bg-[#5624d0] text-white font-bold text-sm px-6 py-2.5 hover:bg-[#3d1a9e] transition-colors">
            Explorar Cursos
          </RouterLink>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="course in getEnrolledCourses()"
            :key="course.id"
            class="border border-[#d1d7dc] flex hover:shadow-md transition-shadow"
          >
            <img :src="course.thumbnail" :alt="course.title" class="w-28 h-20 object-cover flex-shrink-0" />
            <div class="flex-1 p-4 flex items-center justify-between gap-4 min-w-0">
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-sm text-[#1c1d1f] truncate mb-0.5">{{ course.title }}</h4>
                <p class="text-xs text-[#6a6f73]">{{ course.instructor }}</p>
                <div class="mt-2">
                  <div class="h-1.5 bg-[#d1d7dc] w-full">
                    <div class="h-1.5 bg-[#5624d0] transition-all" :style="{ width: `${courseProgress(course)}%` }"></div>
                  </div>
                  <p class="text-[10px] text-[#6a6f73] mt-0.5">{{ courseProgress(course) }}% completado</p>
                </div>
              </div>
              <RouterLink :to="`/dashboard/learn/${course.id}`"
                class="border border-[#1c1d1f] text-[#1c1d1f] font-bold text-xs px-4 py-2 hover:bg-[#1c1d1f] hover:text-white transition-colors flex-shrink-0">
                Continuar
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-if="!loadingEnrollments && getEnrolledCourses().length > 0" class="mt-6 border border-[#d1d7dc] p-5">
          <h4 class="font-extrabold text-[#1c1d1f] text-sm mb-1">¿Quieres seguir aprendiendo?</h4>
          <p class="text-xs text-[#6a6f73] mb-3">Explora más cursos en el catálogo</p>
          <RouterLink to="/courses" class="text-xs font-bold text-[#5624d0] hover:underline flex items-center gap-1">
            Ver todo el catálogo <ArrowRight :size="12" />
          </RouterLink>
        </div>
      </div>

      <div class="space-y-6">

        <!-- Próximas clases: solo si hay en BD -->
        <div class="border border-[#d1d7dc]">
          <div class="border-b border-[#d1d7dc] px-4 py-3 bg-[#f7f9fa] flex items-center gap-2">
            <CalendarDays :size="15" class="text-[#5624d0]" />
            <h3 class="font-extrabold text-[#1c1d1f] text-sm">Próximas Clases</h3>
          </div>

          <div v-if="upcomingFromAgenda().length" class="divide-y divide-[#d1d7dc]">
            <div v-for="cls in upcomingFromAgenda()" :key="cls.id" class="px-4 py-3 flex items-center gap-3">
              <div class="border border-[#d1d7dc] text-center px-2 py-1.5 flex-shrink-0 w-12">
                <div class="text-[10px] font-bold text-[#6a6f73]">{{ formatAgendaDay(cls) }}</div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-[#1c1d1f] leading-snug line-clamp-2">
                  {{ cls.course_title ?? cls.course_id }}
                </p>
                <p class="text-[10px] text-[#6a6f73] mt-0.5">{{ cls.time }} · {{ cls.duration }}</p>
              </div>
            </div>
          </div>

          <div v-else class="px-4 py-8 text-center">
            <p class="text-xs text-[#6a6f73]">No tienes clases programadas por ahora.</p>
            <p class="text-[10px] text-[#6a6f73] mt-1">Tu instructor publicará la agenda cuando esté lista.</p>
          </div>

          <div class="border-t border-[#d1d7dc] px-4 py-2.5">
            <RouterLink to="/dashboard/agenda" class="text-xs font-semibold text-[#5624d0] hover:underline flex items-center gap-1">
              Ver agenda <ArrowRight :size="11" />
            </RouterLink>
          </div>
        </div>

        <div class="border border-[#d1d7dc]">
          <div class="border-b border-[#d1d7dc] px-4 py-3 bg-[#f7f9fa]">
            <h3 class="font-extrabold text-[#1c1d1f] text-sm">Tu Instructor</h3>
          </div>
          <div class="p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-[#5624d0] flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                {{ APP.instructor.initials }}
              </div>
              <div>
                <p class="text-sm font-bold text-[#1c1d1f]">{{ APP.instructor.name }}</p>
                <p class="text-xs text-[#6a6f73]">{{ APP.instructor.title }}</p>
              </div>
            </div>
            <RouterLink to="/dashboard/chat" class="text-xs font-bold text-[#5624d0] hover:underline">
              Enviar mensaje →
            </RouterLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
