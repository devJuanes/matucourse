<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dbService } from '@/services'
import { useCoursesStore } from '@/stores/courses'
import type { AgendaSession } from '@/services'
import { Info } from '@lucide/vue'

const authStore = useAuthStore()
const coursesStore = useCoursesStore()

const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const sessions = ref<AgendaSession[]>([])
const loading = ref(true)

const today = new Date().toLocaleDateString('es-CO', { weekday: 'long' })
const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1)

onMounted(async () => {
  await coursesStore.fetchCourses()
  if (authStore.user?.id) {
    const enrollments = await dbService.getEnrollments(authStore.user.id)
    const courseIds = enrollments.map((e) => e.course_id)
    sessions.value = await dbService.getAgendaSessions(courseIds)
  }
  loading.value = false
})

const schedule = computed(() => {
  const map: Record<string, AgendaSession[]> = {}
  for (const day of weekDays) map[day] = []
  for (const s of sessions.value) {
    const list = map[s.day_of_week]
    if (list) list.push(s)
  }
  return map
})

const todaySessions = computed(() => schedule.value[todayCapitalized] ?? [])
</script>

<template>
  <div class="p-8 max-w-[1100px]">

    <div class="mb-8 border-b border-[#d1d7dc] pb-6">
      <h2 class="text-2xl font-extrabold text-[#1c1d1f]">Agenda de Clases</h2>
      <p class="text-[#6a6f73] text-sm mt-1">Horario de tus cursos inscritos — hora Colombia (UTC-5)</p>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-4 border-[#5624d0] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Hoy -->
      <div class="border-l-4 border-[#5624d0] bg-[#f7f9fa] border border-[#d1d7dc] border-l-0 p-5 mb-8">
        <p class="text-xs font-bold uppercase tracking-wider text-[#5624d0] mb-2">Hoy — {{ todayCapitalized }}</p>
        <div v-if="todaySessions.length" class="space-y-3">
          <div v-for="cls in todaySessions" :key="cls.id" class="flex items-center justify-between gap-4">
            <div>
              <p class="font-bold text-[#1c1d1f] text-sm">{{ cls.course_title ?? cls.course_id }}</p>
              <p class="text-[#6a6f73] text-xs mt-0.5">{{ cls.time }} · {{ cls.duration }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-[#6a6f73] text-sm">No hay clases programadas para hoy.</p>
      </div>

      <!-- Sin agenda -->
      <div v-if="sessions.length === 0" class="border border-[#d1d7dc] p-16 text-center mb-8">
        <p class="text-[#6a6f73] text-sm">Tu agenda está vacía.</p>
        <p class="text-xs text-[#6a6f73] mt-2">El instructor publicará las sesiones en vivo aquí.</p>
      </div>

      <!-- Semana -->
      <div v-else>
        <h3 class="font-extrabold text-[#1c1d1f] text-base mb-4">Horario Semanal</h3>
        <div class="border border-[#d1d7dc]">
          <div class="grid grid-cols-6 border-b border-[#d1d7dc] bg-[#f7f9fa]">
            <div
              v-for="day in weekDays"
              :key="day"
              class="px-3 py-2.5 text-xs font-extrabold text-[#1c1d1f] uppercase tracking-wide border-r border-[#d1d7dc] last:border-r-0 text-center"
              :class="day === todayCapitalized ? 'bg-[#ede8f5] text-[#5624d0]' : ''"
            >
              {{ day.slice(0, 3) }}
            </div>
          </div>
          <div class="grid grid-cols-6 min-h-[120px]">
            <div
              v-for="day in weekDays"
              :key="day"
              class="px-2 py-3 border-r border-[#d1d7dc] last:border-r-0 space-y-2"
              :class="day === todayCapitalized ? 'bg-[#faf9ff]' : ''"
            >
              <div v-if="schedule[day]?.length">
                <div
                  v-for="cls in schedule[day]"
                  :key="cls.id"
                  class="border border-[#d1d7dc] p-2"
                >
                  <p class="text-[10px] font-extrabold text-[#5624d0]">{{ cls.time }}</p>
                  <p class="text-[10px] font-semibold text-[#1c1d1f] leading-tight mt-0.5">
                    {{ cls.course_title ?? cls.course_id }}
                  </p>
                  <p class="text-[9px] text-[#6a6f73] mt-0.5">{{ cls.duration }}</p>
                </div>
              </div>
              <p v-else class="text-[10px] text-[#d1d7dc] text-center pt-4">—</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 border border-[#d1d7dc] p-4 flex items-start gap-3">
        <Info :size="16" class="text-[#5624d0] flex-shrink-0 mt-0.5" />
        <p class="text-xs text-[#6a6f73] leading-relaxed">
          Las clases en vivo se programan por tu instructor. Revisa esta página o usa el chat si tienes dudas sobre horarios.
        </p>
      </div>
    </template>
  </div>
</template>
