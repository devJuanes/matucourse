<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCoursesStore } from '@/stores/courses'
import { USE_FIREBASE } from '@/services'
import type { Course } from '@/services'
import { Pencil, X, Check, Upload, AlertCircle, RefreshCw } from '@lucide/vue'

const coursesStore = useCoursesStore()

const editingId = ref<string | null>(null)
const editForm = ref<Partial<Course & { price: { COP: number; USD: number; EUR: number } }>>({})
const saving = ref(false)
const seeding = ref(false)
const seedDone = ref(false)
const seedError = ref('')

onMounted(async () => {
  await coursesStore.fetchCourses()
})

function startEdit(course: Course) {
  editingId.value = course.id
  editForm.value = {
    title: course.title,
    description: course.description,
    price: { ...course.price },
    featured: course.featured,
    level: course.level,
  }
}

function cancelEdit() {
  editingId.value = null
  editForm.value = {}
}

async function saveEdit(course: Course) {
  saving.value = true
  try {
    await coursesStore.updateCourse(course.id, editForm.value)
    editingId.value = null
    editForm.value = {}
  } finally {
    saving.value = false
  }
}

async function seedFirebase() {
  seeding.value = true
  seedError.value = ''
  seedDone.value = false
  try {
    await coursesStore.seedCourses()
    seedDone.value = true
    setTimeout(() => (seedDone.value = false), 4000)
  } catch (e: unknown) {
    seedError.value = e instanceof Error ? e.message : 'Error al subir cursos'
  } finally {
    seeding.value = false
  }
}

const totalRevenueCOP = computed(() =>
  coursesStore.courses.reduce((sum, c) => sum + c.price.COP, 0)
)
</script>

<template>
  <div class="p-8 max-w-[1100px]">

    <!-- Header -->
    <div class="mb-8 border-b border-[#d1d7dc] pb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-[#1c1d1f]">Gestión de Cursos</h1>
        <p class="text-[#6a6f73] text-sm mt-1">
          {{ coursesStore.courses.length }} cursos · Valor catálogo: ${{ totalRevenueCOP.toLocaleString('es-CO') }} COP
        </p>
      </div>

      <!-- Seed button (Firebase mode only) -->
      <div v-if="USE_FIREBASE" class="flex items-center gap-3">
        <div v-if="seedDone" class="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
          <Check :size="15" /> Cursos subidos a Firebase
        </div>
        <div v-if="seedError" class="flex items-center gap-1.5 text-red-600 text-sm">
          <AlertCircle :size="15" /> {{ seedError }}
        </div>
        <button
          @click="seedFirebase"
          :disabled="seeding"
          class="flex items-center gap-2 bg-[#1c1d1f] hover:bg-[#3e4143] disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 transition-colors"
        >
          <component :is="seeding ? RefreshCw : Upload" :size="15" :class="seeding ? 'animate-spin' : ''" />
          {{ seeding ? 'Subiendo...' : 'Subir cursos a Firebase' }}
        </button>
      </div>
    </div>

    <!-- Info MatuDB mode -->
    <div v-if="!USE_FIREBASE" class="mb-6 border border-yellow-300 bg-yellow-50 p-4 flex items-start gap-3">
      <AlertCircle :size="16" class="text-yellow-600 flex-shrink-0 mt-0.5" />
      <p class="text-sm text-yellow-800">
        Estás en modo <strong>MatuDB</strong>. Activa <code>VITE_USE_FIREBASE=true</code> para editar cursos y guardar en Firestore.
      </p>
    </div>

    <!-- Course list -->
    <div class="space-y-3">
      <div
        v-for="course in coursesStore.courses"
        :key="course.id"
        class="border border-[#d1d7dc] bg-white"
      >
        <!-- Normal row -->
        <div v-if="editingId !== course.id" class="flex items-center gap-4 p-4">
          <img :src="course.thumbnail" :alt="course.title" class="w-20 h-14 object-cover flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="font-bold text-sm text-[#1c1d1f] truncate">{{ course.title }}</span>
              <span v-if="course.featured"
                class="flex-shrink-0 text-[10px] font-bold bg-[#eceb98] text-[#3d3c0a] px-1.5 py-0.5">
                FEATURED
              </span>
            </div>
            <p class="text-xs text-[#6a6f73]">{{ course.category }} · {{ course.level }}</p>
          </div>
          <div class="flex items-center gap-6 flex-shrink-0">
            <div class="text-right">
              <div class="font-extrabold text-[#1c1d1f] text-sm">${{ course.price.COP.toLocaleString('es-CO') }}</div>
              <div class="text-xs text-[#6a6f73]">${{ course.price.USD }} USD · €{{ course.price.EUR }}</div>
            </div>
            <button
              @click="startEdit(course)"
              :disabled="!USE_FIREBASE"
              class="flex items-center gap-1.5 text-xs font-bold border border-[#1c1d1f] px-3 py-1.5 hover:bg-[#1c1d1f] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Pencil :size="12" /> Editar
            </button>
          </div>
        </div>

        <!-- Edit row -->
        <div v-else class="p-4 bg-[#f8f5ff] border-l-4 border-[#5624d0]">
          <div class="flex items-center gap-2 mb-4">
            <span class="font-bold text-sm text-[#5624d0]">Editando: {{ course.title }}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Title -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-[#1c1d1f] mb-1">Título</label>
              <input
                v-model="editForm.title"
                class="w-full border border-[#d1d7dc] px-3 py-2 text-sm focus:outline-none focus:border-[#5624d0]"
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-[#1c1d1f] mb-1">Descripción</label>
              <textarea
                v-model="editForm.description"
                rows="2"
                class="w-full border border-[#d1d7dc] px-3 py-2 text-sm focus:outline-none focus:border-[#5624d0] resize-none"
              />
            </div>

            <!-- COP -->
            <div>
              <label class="block text-xs font-bold text-[#1c1d1f] mb-1">Precio COP</label>
              <input
                v-model.number="editForm.price!.COP"
                type="number"
                min="0"
                step="1000"
                class="w-full border border-[#d1d7dc] px-3 py-2 text-sm focus:outline-none focus:border-[#5624d0]"
              />
            </div>

            <!-- USD -->
            <div>
              <label class="block text-xs font-bold text-[#1c1d1f] mb-1">Precio USD</label>
              <input
                v-model.number="editForm.price!.USD"
                type="number"
                min="0"
                class="w-full border border-[#d1d7dc] px-3 py-2 text-sm focus:outline-none focus:border-[#5624d0]"
              />
            </div>

            <!-- EUR -->
            <div>
              <label class="block text-xs font-bold text-[#1c1d1f] mb-1">Precio EUR</label>
              <input
                v-model.number="editForm.price!.EUR"
                type="number"
                min="0"
                class="w-full border border-[#d1d7dc] px-3 py-2 text-sm focus:outline-none focus:border-[#5624d0]"
              />
            </div>

            <!-- Level -->
            <div>
              <label class="block text-xs font-bold text-[#1c1d1f] mb-1">Nivel</label>
              <input
                v-model="editForm.level"
                class="w-full border border-[#d1d7dc] px-3 py-2 text-sm focus:outline-none focus:border-[#5624d0]"
              />
            </div>

            <!-- Featured -->
            <div class="flex items-center gap-2 mt-5">
              <input
                :id="`featured-${course.id}`"
                v-model="editForm.featured"
                type="checkbox"
                class="w-4 h-4 accent-[#5624d0]"
              />
              <label :for="`featured-${course.id}`" class="text-sm font-semibold text-[#1c1d1f]">Marcar como Bestseller</label>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="saveEdit(course)"
              :disabled="saving"
              class="flex items-center gap-1.5 bg-[#5624d0] hover:bg-[#3d1a9e] disabled:opacity-60 text-white text-sm font-bold px-4 py-2 transition-colors"
            >
              <Check :size="14" /> {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            <button
              @click="cancelEdit"
              class="flex items-center gap-1.5 border border-[#d1d7dc] text-[#6a6f73] hover:border-[#1c1d1f] hover:text-[#1c1d1f] text-sm font-bold px-4 py-2 transition-colors"
            >
              <X :size="14" /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!coursesStore.loading && coursesStore.courses.length === 0"
      class="border border-[#d1d7dc] p-16 text-center">
      <p class="text-[#6a6f73] text-sm mb-4">No hay cursos en Firestore aún.</p>
      <button
        @click="seedFirebase"
        :disabled="seeding"
        class="bg-[#5624d0] text-white font-bold px-6 py-3 text-sm hover:bg-[#3d1a9e] transition-colors"
      >
        Subir cursos desde el JSON
      </button>
    </div>
  </div>
</template>
