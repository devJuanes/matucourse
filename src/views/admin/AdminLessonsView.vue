<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { dbService } from '@/services'
import type { Course, CourseLesson, ChatPartner } from '@/services'
import { CPP_COURSE_SEED } from '@/data/cpp-course-seed'
import { Lock, Unlock, ChevronDown, ChevronRight, Save } from '@lucide/vue'

const COURSE_ID = 'cpp-fundamentals'

const course = ref<Course | null>(null)
const students = ref<ChatPartner[]>([])
const loading = ref(true)
const saving = ref<string | null>(null)
const expandedLessonId = ref<string | null>(null)
const openModule = ref<number | null>(1)

const editForm = ref({
  description: '',
  content: '',
  videoUrl: '',
  imageUrl: '',
  codeExample: '',
  meetingUrl: '',
  assignedUserId: '',
  agendaDay: 'Lunes',
  agendaTime: '7:00 PM',
})

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  const existing = await dbService.getCourseById(COURSE_ID)
  if (!existing) {
    await dbService.seedCppCourse()
  }
  students.value = await dbService.getEnrolledStudents(COURSE_ID)
  unsubscribe = dbService.subscribeCourse(COURSE_ID, (c) => {
    course.value = c
    loading.value = false
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

function toggleModule(id: number) {
  openModule.value = openModule.value === id ? null : id
}

function openEditor(lesson: CourseLesson) {
  expandedLessonId.value = lesson.id
  editForm.value = {
    description: lesson.description ?? '',
    content: lesson.content ?? '',
    videoUrl: lesson.videoUrl ?? '',
    imageUrl: lesson.imageUrl ?? '',
    codeExample: lesson.codeExample ?? '',
    meetingUrl: lesson.meetingUrl ?? '',
    assignedUserId: '',
    agendaDay: 'Lunes',
    agendaTime: '7:00 PM',
  }
}

async function toggleUnlock(moduleId: number, lesson: CourseLesson) {
  saving.value = lesson.id
  try {
    await dbService.updateLesson(COURSE_ID, moduleId, lesson.id, { unlocked: !lesson.unlocked })
  } finally {
    saving.value = null
  }
}

async function saveLesson(moduleId: number, lesson: CourseLesson) {
  saving.value = lesson.id
  try {
    await dbService.updateLesson(COURSE_ID, moduleId, lesson.id, {
      description: editForm.value.description.trim() || undefined,
      content: editForm.value.content.trim() || undefined,
      videoUrl: editForm.value.videoUrl.trim() || undefined,
      imageUrl: editForm.value.imageUrl.trim() || undefined,
      codeExample: editForm.value.codeExample.trim() || undefined,
      meetingUrl: editForm.value.meetingUrl.trim() || undefined,
      unlocked: lesson.unlocked,
    })

    if (editForm.value.assignedUserId && editForm.value.agendaDay) {
      await dbService.addAgendaSession({
        course_id: COURSE_ID,
        course_title: course.value?.title ?? CPP_COURSE_SEED.title,
        day_of_week: editForm.value.agendaDay,
        time: editForm.value.agendaTime,
        duration: '2h',
        user_id: editForm.value.assignedUserId,
        lesson_id: lesson.id,
      })
    }
  } finally {
    saving.value = null
  }
}
</script>

<template>
  <div class="p-8 max-w-[1100px]">
    <div class="mb-8 border-b border-[#d1d7dc] pb-6">
      <h1 class="text-2xl font-extrabold text-[#1c1d1f]">Lecciones — {{ course?.title ?? 'C++' }}</h1>
      <p class="text-[#6a6f73] text-sm mt-1">
        Habilita y edita el contenido. Los cambios se guardan en Firebase y los estudiantes los ven al instante.
      </p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="w-8 h-8 border-4 border-[#5624d0] border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>

    <div v-else-if="course" class="space-y-4">
      <div v-for="mod in course.modules" :key="mod.id" class="border border-[#d1d7dc]">
        <button
          type="button"
          @click="toggleModule(mod.id)"
          class="w-full flex items-center gap-2 bg-[#f7f9fa] px-4 py-3 border-b border-[#d1d7dc] text-left hover:bg-[#ede8f5]"
        >
          <component :is="openModule === mod.id ? ChevronDown : ChevronRight" :size="16" class="text-[#5624d0]" />
          <span class="font-bold text-sm">{{ mod.title }}</span>
        </button>

        <div v-if="openModule === mod.id" class="divide-y divide-[#d1d7dc]">
          <div v-for="lesson in mod.lessons ?? []" :key="lesson.id" class="bg-white">
            <div class="px-4 py-3 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 min-w-0">
                <component
                  :is="lesson.unlocked ? Unlock : Lock"
                  :size="16"
                  :class="lesson.unlocked ? 'text-green-600' : 'text-[#6a6f73]'"
                />
                <div>
                  <p class="font-semibold text-sm">{{ lesson.title }}</p>
                  <p v-if="lesson.duration" class="text-[10px] text-[#6a6f73]">{{ lesson.duration }}</p>
                </div>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  @click="openEditor(lesson)"
                  class="text-xs font-bold px-3 py-1.5 border border-[#d1d7dc] hover:border-[#5624d0] text-[#5624d0]"
                >
                  Editar
                </button>
                <button
                  type="button"
                  @click="toggleUnlock(mod.id, lesson)"
                  :disabled="saving === lesson.id"
                  :class="[
                    'text-xs font-bold px-3 py-1.5 border',
                    lesson.unlocked
                      ? 'border-[#d1d7dc] text-[#6a6f73]'
                      : 'border-[#5624d0] text-[#5624d0] hover:bg-[#5624d0] hover:text-white',
                  ]"
                >
                  {{ lesson.unlocked ? 'Bloquear' : 'Habilitar' }}
                </button>
              </div>
            </div>

            <div v-if="expandedLessonId === lesson.id" class="px-4 pb-4 bg-[#f7f9fa] border-t border-[#d1d7dc]">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div class="md:col-span-2">
                  <label class="text-[10px] font-bold uppercase text-[#6a6f73]">Descripción corta</label>
                  <input v-model="editForm.description" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm mt-1" />
                </div>
                <div class="md:col-span-2">
                  <label class="text-[10px] font-bold uppercase text-[#6a6f73]">Contenido (texto, **negrita**, ```código```)</label>
                  <textarea v-model="editForm.content" rows="6" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm mt-1 font-mono"></textarea>
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase text-[#6a6f73]">URL video</label>
                  <input v-model="editForm.videoUrl" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm mt-1" placeholder="https://..." />
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase text-[#6a6f73]">URL imagen</label>
                  <input v-model="editForm.imageUrl" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm mt-1" placeholder="https://..." />
                </div>
                <div class="md:col-span-2">
                  <label class="text-[10px] font-bold uppercase text-[#6a6f73]">Ejemplo de código</label>
                  <textarea v-model="editForm.codeExample" rows="4" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm mt-1 font-mono bg-[#1c1d1f] text-white"></textarea>
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase text-[#6a6f73]">Link reunión (Meet/Zoom)</label>
                  <input v-model="editForm.meetingUrl" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase text-[#6a6f73]">Agendar clase para estudiante</label>
                  <select v-model="editForm.assignedUserId" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm mt-1 bg-white">
                    <option value="">— Sin asignar —</option>
                    <option v-for="s in students" :key="s.user_id" :value="s.user_id">{{ s.name }} ({{ s.email }})</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase text-[#6a6f73]">Día clase</label>
                  <select v-model="editForm.agendaDay" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm mt-1 bg-white">
                    <option v-for="d in ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase text-[#6a6f73]">Hora</label>
                  <input v-model="editForm.agendaTime" class="w-full border border-[#d1d7dc] px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <button
                type="button"
                @click="saveLesson(mod.id, lesson)"
                :disabled="saving === lesson.id"
                class="mt-4 flex items-center gap-2 bg-[#5624d0] text-white font-bold text-sm px-5 py-2.5 hover:bg-[#3d1a9e] disabled:opacity-60"
              >
                <Save :size="15" />
                {{ saving === lesson.id ? 'Guardando...' : 'Guardar lección' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
