<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import CourseCard from '@/components/ui/CourseCard.vue'
import { useCurrencyStore } from '@/stores/currency'
import { useAuthStore } from '@/stores/auth'
import { useCoursesStore } from '@/stores/courses'
import type { Course } from '@/stores/cart'
import AppLogo from '@/components/ui/AppLogo.vue'

const route = useRoute()
const currencyStore = useCurrencyStore()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()

onMounted(() => coursesStore.fetchCourses())

const searchQuery = ref((route.query.q as string) ?? '')
const selectedCategory = ref((route.query.category as string) ?? 'Todos')

const categories = computed(() => ['Todos', ...coursesStore.categories])

watch(() => route.query, (q) => {
  if (q.q) searchQuery.value = String(q.q)
  if (q.category) selectedCategory.value = String(q.category)
})

const filtered = computed(() => {
  let list = coursesStore.courses
  if (selectedCategory.value !== 'Todos') {
    list = list.filter(c => c.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    )
  }
  return list
})
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">

    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-white border-b border-[#d1d7dc] h-[56px]">
      <div class="max-w-[1340px] mx-auto px-4 h-full flex items-center gap-3">
        <AppLogo class="mr-2" />

        <div class="flex-1 flex items-center">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar cursos..."
            class="w-full max-w-[400px] border border-[#1c1d1f] px-4 py-2 text-sm outline-none focus:border-[#5624d0]"
          />
        </div>

        <div class="ml-auto flex items-center gap-3">
          <div class="hidden md:flex items-center gap-1">
            <button v-for="c in ['COP','USD','EUR']" :key="c"
              @click="currencyStore.setCurrency(c as 'COP'|'USD'|'EUR')"
              :class="currencyStore.selected === c
                ? 'bg-[#5624d0] text-white px-2 py-1'
                : 'border border-[#d1d7dc] text-[#6a6f73] px-2 py-1 hover:border-[#1c1d1f]'"
              class="font-semibold transition-colors text-[11px]">
              {{ c }}
            </button>
          </div>
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/dashboard" class="text-sm font-semibold text-[#5624d0] border border-[#5624d0] px-3 py-1.5 hover:bg-[#f0ebff] transition-colors">
              Mi Cuenta
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/login" class="hidden md:block text-sm font-semibold text-[#1c1d1f] border border-[#1c1d1f] px-3 py-1.5 hover:bg-[#f7f9fa] transition-colors">
              Iniciar Sesión
            </RouterLink>
            <RouterLink to="/register" class="text-sm font-semibold text-white bg-[#5624d0] border border-[#5624d0] px-3 py-1.5 hover:bg-[#3d1a9e] transition-colors">
              Registrarse
            </RouterLink>
          </template>
        </div>
      </div>
    </nav>

    <!-- Top bar -->
    <div class="border-b border-[#d1d7dc] bg-[#f7f9fa]">
      <div class="max-w-[1340px] mx-auto px-4 py-8">
        <h1 class="text-3xl font-extrabold text-[#1c1d1f] mb-1">Todos los Cursos</h1>
        <p class="text-[#6a6f73] text-sm">{{ filtered.length }} resultado{{ filtered.length !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <div class="max-w-[1340px] mx-auto px-4 py-6">
      <!-- Filter row -->
      <div class="flex flex-wrap gap-3 mb-6 items-center">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories" :key="cat"
            @click="selectedCategory = cat"
            :class="selectedCategory === cat
              ? 'bg-[#1c1d1f] text-white border-[#1c1d1f]'
              : 'bg-white text-[#1c1d1f] border-[#d1d7dc] hover:border-[#1c1d1f]'"
            class="text-xs font-semibold border px-3 py-1.5 transition-colors">
            {{ cat }}
          </button>
        </div>

        <!-- Currency selector -->
        <div class="ml-auto flex items-center gap-1">
          <span class="text-xs text-[#6a6f73] mr-1">Moneda:</span>
          <button v-for="c in ['COP','USD','EUR']" :key="c"
            @click="currencyStore.setCurrency(c as 'COP'|'USD'|'EUR')"
            :class="currencyStore.selected === c
              ? 'bg-[#5624d0] text-white border-[#5624d0]'
              : 'bg-white text-[#1c1d1f] border-[#d1d7dc] hover:border-[#1c1d1f]'"
            class="text-xs font-bold border px-2 py-1 transition-colors">
            {{ c }}
          </button>
        </div>
      </div>

      <!-- Grid -->
      <div v-if="filtered.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <CourseCard v-for="course in filtered" :key="course.id" :course="(course as Course)" :featured="course.featured" />
      </div>
      <div v-else class="py-20 text-center">
        <p class="text-2xl mb-2">🔍</p>
        <p class="text-[#6a6f73]">No se encontraron cursos para "{{ searchQuery }}"</p>
        <button @click="searchQuery = ''; selectedCategory = 'Todos'" class="mt-4 text-[#5624d0] font-semibold underline text-sm">
          Limpiar búsqueda
        </button>
      </div>
    </div>
  </div>
</template>
