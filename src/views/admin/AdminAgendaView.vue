<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dbService } from '@/services'
import { useCoursesStore } from '@/stores/courses'
import type { AgendaSession } from '@/services'
import { Plus, Trash2 } from '@lucide/vue'

const coursesStore = useCoursesStore()
const sessions = ref<AgendaSession[]>([])
const loading = ref(true)
const saving = ref(false)

const form = ref({
  course_id: 'cpp-fundamentals',
  course_title: 'C++ desde Cero',
  day_of_week: 'Lunes',
  time: '7:00 PM',
  duration: '2h',
})

const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

onMounted(async () => {
  await coursesStore.fetchCourses()
  sessions.value = await dbService.getAgendaSessions()
  loading.value = false
})

async function addSession() {
  saving.value = true
  try {
    const course = coursesStore.getCourseById(form.value.course_id)
    await dbService.addAgendaSession({
      course_id: form.value.course_id,
      course_title: course?.title ?? form.value.course_title,
      day_of_week: form.value.day_of_week,
      time: form.value.time,
      duration: form.value.duration,
    })
    sessions.value = await dbService.getAgendaSessions()
  } finally {
    saving.value = false
  }
}

async function removeSession(id: string) {
  await dbService.deleteAgendaSession(id)
  sessions.value = await dbService.getAgendaSessions()
}

function onCourseChange() {
  const c = coursesStore.getCourseById(form.value.course_id)
  if (c) form.value.course_title = c.title
}
</script>

<template>
  <div class="p-8 max-w-[900px]">
    <div class="mb-8 border-b border-[#d1d7dc] pb-6">
      <h1 class="text-2xl font-extrabold text-[#1c1d1f]">Gestionar Agenda</h1>
      <p class="text-[#6a6f73] text-sm mt-1">Programa las clases en vivo que verán tus estudiantes</p>
    </div>

    <!-- Formulario nueva sesión -->
    <div class="border border-[#d1d7dc] p-5 mb-8 bg-[#f7f9fa]">
      <h2 class="font-bold text-sm text-[#1c1d1f] mb-4">Agregar sesión</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-xs font-bold mb-1">Curso</label>
          <select
            v-model="form.course_id"
            @change="onCourseChange"
            class="w-full border border-[#d1d7dc] px-3 py-2 text-sm focus:outline-none focus:border-[#5624d0]"
          >
            <option v-for="c in coursesStore.courses" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold mb-1">Día</label>
          <select v-model="form.day_of_week" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm">
            <option v-for="d in weekDays" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold mb-1">Hora</label>
          <input v-model="form.time" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm" placeholder="7:00 PM" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-1">Duración</label>
          <input v-model="form.duration" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm" placeholder="2h" />
        </div>
      </div>
      <button
        @click="addSession"
        :disabled="saving"
        class="flex items-center gap-2 bg-[#5624d0] text-white font-bold text-sm px-5 py-2.5 hover:bg-[#3d1a9e] disabled:opacity-60"
      >
        <Plus :size="16" /> {{ saving ? 'Guardando...' : 'Agregar a la agenda' }}
      </button>
    </div>

    <!-- Lista -->
    <div v-if="loading" class="text-center py-12 text-[#6a6f73] text-sm">Cargando...</div>
    <div v-else-if="sessions.length === 0" class="border border-[#d1d7dc] p-12 text-center text-[#6a6f73] text-sm">
      No hay sesiones programadas. Agrega la primera arriba.
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="border border-[#d1d7dc] p-4 flex items-center justify-between gap-4"
      >
        <div>
          <p class="font-bold text-sm text-[#1c1d1f]">{{ s.course_title ?? s.course_id }}</p>
          <p class="text-xs text-[#6a6f73]">{{ s.day_of_week }} · {{ s.time }} · {{ s.duration }}</p>
        </div>
        <button @click="removeSession(s.id)" class="text-red-600 hover:text-red-800 p-2">
          <Trash2 :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
