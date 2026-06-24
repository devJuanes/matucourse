<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dbService } from '@/services'
import type { ChatPartner } from '@/services'
import { useCoursesStore } from '@/stores/courses'
import { Search, UserPlus, Check, AlertCircle } from '@lucide/vue'

const coursesStore = useCoursesStore()

const searchTerm = ref('')
const searchResults = ref<ChatPartner[]>([])
const selectedStudent = ref<ChatPartner | null>(null)
const selectedCourseId = ref('')
const searching = ref(false)
const assigning = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const studentEnrollments = ref<string[]>([])

onMounted(async () => {
  await coursesStore.fetchCourses()
  if (coursesStore.courses.length && !selectedCourseId.value) {
    selectedCourseId.value = coursesStore.courses[0]?.id ?? ''
  }
})

async function runSearch() {
  const term = searchTerm.value.trim()
  if (term.length < 2) {
    searchResults.value = []
    return
  }
  searching.value = true
  errorMsg.value = ''
  try {
    searchResults.value = await dbService.searchStudents(term)
  } catch {
    errorMsg.value = 'No se pudo buscar estudiantes.'
  } finally {
    searching.value = false
  }
}

async function pickStudent(student: ChatPartner) {
  selectedStudent.value = student
  searchResults.value = []
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const enrollments = await dbService.getEnrollments(student.user_id)
    studentEnrollments.value = enrollments.map((e) => e.course_id)
  } catch {
    studentEnrollments.value = []
  }
}

async function assignCourse() {
  if (!selectedStudent.value || !selectedCourseId.value) return

  assigning.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const uid = selectedStudent.value.user_id
    const courseId = selectedCourseId.value

    if (await dbService.hasEnrollment(uid, courseId)) {
      errorMsg.value = 'Este estudiante ya tiene ese curso asignado.'
      return
    }

    await dbService.addEnrollment(uid, courseId, 'full')
    studentEnrollments.value = [...studentEnrollments.value, courseId]
    const courseTitle = coursesStore.getCourseById(courseId)?.title ?? courseId
    successMsg.value = `Curso "${courseTitle}" asignado a ${selectedStudent.value.name}.`
  } catch {
    errorMsg.value = 'No se pudo asignar el curso. Revisa las reglas de Firestore (enrollments).'
  } finally {
    assigning.value = false
  }
}

function courseTitle(id: string) {
  return coursesStore.getCourseById(id)?.title ?? id
}
</script>

<template>
  <div class="max-w-[900px] mx-auto w-full">
    <div class="mb-6 border-b border-[#d1d7dc] pb-4">
      <h2 class="text-xl sm:text-2xl font-extrabold text-[#1c1d1f] flex items-center gap-2">
        <UserPlus :size="22" class="text-[#5624d0]" />
        Asignar curso a estudiante
      </h2>
      <p class="text-[#6a6f73] text-sm mt-1">
        Busca un estudiante por nombre o correo y asigna un curso manualmente (sin pago).
      </p>
    </div>

    <div class="border border-[#d1d7dc] bg-white p-4 sm:p-6 mb-6">
      <label class="block text-sm font-bold text-[#1c1d1f] mb-2">Buscar estudiante</label>
      <div class="flex gap-2">
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Nombre o correo electrónico..."
          class="flex-1 min-w-0 border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0]"
          @keyup.enter="runSearch"
        />
        <button
          type="button"
          @click="runSearch"
          :disabled="searching"
          class="bg-[#5624d0] hover:bg-[#3d1a9e] disabled:opacity-60 text-white font-bold px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Search :size="16" />
          Buscar
        </button>
      </div>

      <div v-if="searchResults.length" class="mt-3 border border-[#d1d7dc] divide-y divide-[#d1d7dc]">
        <button
          v-for="s in searchResults"
          :key="s.user_id"
          type="button"
          class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f7f9fa] transition-colors"
          @click="pickStudent(s)"
        >
          <div>
            <p class="text-sm font-bold text-[#1c1d1f]">{{ s.name }}</p>
            <p class="text-xs text-[#6a6f73]">{{ s.email }}</p>
          </div>
          <span class="text-xs text-[#5624d0] font-bold">Seleccionar</span>
        </button>
      </div>
    </div>

    <div v-if="selectedStudent" class="border border-[#d1d7dc] bg-white p-4 sm:p-6">
      <p class="text-xs font-bold uppercase text-[#6a6f73] mb-1">Estudiante seleccionado</p>
      <p class="text-lg font-extrabold text-[#1c1d1f]">{{ selectedStudent.name }}</p>
      <p class="text-sm text-[#6a6f73] mb-4">{{ selectedStudent.email }}</p>

      <div v-if="studentEnrollments.length" class="mb-4 p-3 bg-[#f7f9fa] border border-[#d1d7dc]">
        <p class="text-xs font-bold text-[#6a6f73] mb-2">Cursos que ya tiene:</p>
        <ul class="text-sm space-y-1">
          <li v-for="cid in studentEnrollments" :key="cid" class="flex items-center gap-1.5">
            <Check :size="14" class="text-green-600" />
            {{ courseTitle(cid) }}
          </li>
        </ul>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-bold text-[#1c1d1f] mb-2">Curso a asignar</label>
        <select
          v-model="selectedCourseId"
          class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] bg-white"
        >
          <option v-for="c in coursesStore.courses" :key="c.id" :value="c.id">
            {{ c.title }}
          </option>
        </select>
      </div>

      <p v-if="successMsg" class="text-green-700 text-sm mb-3 flex items-start gap-2 bg-green-50 border border-green-200 p-3">
        <Check :size="16" class="flex-shrink-0 mt-0.5" />
        {{ successMsg }}
      </p>
      <p v-if="errorMsg" class="text-red-600 text-sm mb-3 flex items-start gap-2 bg-red-50 border border-red-200 p-3">
        <AlertCircle :size="16" class="flex-shrink-0 mt-0.5" />
        {{ errorMsg }}
      </p>

      <button
        type="button"
        @click="assignCourse"
        :disabled="assigning || !selectedCourseId || studentEnrollments.includes(selectedCourseId)"
        class="bg-[#5624d0] hover:bg-[#3d1a9e] disabled:opacity-50 text-white font-bold px-6 py-3 text-sm transition-colors"
      >
        {{ assigning ? 'Asignando...' : 'Asignar curso' }}
      </button>
    </div>
  </div>
</template>
