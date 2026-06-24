<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  Search, Code2, Music, Music2, Database, Palette,
  Star, Users, MapPin,
  Video, Award, CalendarDays, Globe,
  BookOpen, GraduationCap,
  ArrowRight, ArrowLeft, Compass, ChevronLeft, ChevronRight,
} from '@lucide/vue'
import CourseCard from '@/components/ui/CourseCard.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import coursesData from '@/data/courses.json'
import type { Course } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { APP } from '@/config/app'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')

const allCourses = coursesData.courses as Course[]
const categories = coursesData.categories

const categoryIcons: Record<string, typeof Code2> = {
  'Programación': Code2,
  'Producción Musical': Music,
  'Piano': Music2,
  'Bases de Datos': Database,
  'Diseño': Palette,
}

function getCourseCount(cat: string) {
  return allCourses.filter(c => c.category === cat).length
}

function searchCourses() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/courses', query: { q: searchQuery.value } })
  }
}

const whyUs = [
  { icon: Video, title: 'Clases en Vivo', desc: 'Sesiones interactivas en tiempo real con el instructor' },
  { icon: GraduationCap, title: 'Experto Real', desc: `${APP.instructor.name}, 15+ años de experiencia` },
  { icon: CalendarDays, title: 'Horarios Flexibles', desc: 'Adaptados a tu zona horaria — Colombia, USA y España' },
  { icon: Award, title: 'Certificado', desc: 'Certificado de finalización para tu portafolio profesional' },
]

// ─── CAROUSEL ────────────────────────────────────────────────────────────────
interface Slide {
  badge: string
  title: string
  highlight: string
  desc: string
  cta: string
  ctaLink: string
  image: string
  bg: string
}

const slides: Slide[] = [
  {
    badge: 'Más vendido',
    title: 'Crea tu Primera App',
    highlight: 'Web con Vue.js',
    desc: 'Construye aplicaciones web reales desde cero. Sin experiencia previa. Clases 100% en vivo.',
    cta: 'Ver curso',
    ctaLink: '/courses/create-web-app-vue',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80',
    bg: 'from-[#1c1d1f] to-[#2d2f31]',
  },
  {
    badge: 'Nuevo',
    title: 'Bases de Datos con',
    highlight: 'PostgreSQL y SQL',
    desc: 'Diseña y consulta bases de datos relacionales desde cero con proyectos reales en cada clase.',
    cta: 'Ver curso',
    ctaLink: '/courses/postgresql-desde-cero',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80',
    bg: 'from-[#1a1035] to-[#2d1f5e]',
  },
  {
    badge: 'Principiantes',
    title: 'Tu Primera App Móvil',
    highlight: 'con Flutter',
    desc: 'Desarrolla apps para Android e iOS en clases en vivo. De la idea a la tienda de apps.',
    cta: 'Ver curso',
    ctaLink: '/courses/create-mobile-app',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
    bg: 'from-[#0f1923] to-[#1a3a4a]',
  },
  {
    badge: 'Bestseller',
    title: 'Domina C++',
    highlight: 'desde Cero',
    desc: 'El lenguaje más demandado en industria. 4 módulos, 26 temas, proyectos reales. En vivo.',
    cta: 'Ver curso',
    ctaLink: '/courses/cpp-fundamentals',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80',
    bg: 'from-[#1c1d1f] to-[#3e1f6e]',
  },
  {
    badge: 'Arte & Código',
    title: 'Producción Musical',
    highlight: 'con FL Studio',
    desc: 'Produce tu primer track profesional. Beatmaking, mezcla y masterización paso a paso.',
    cta: 'Ver curso',
    ctaLink: '/courses/fl-studio-producer',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',
    bg: 'from-[#1a0f2e] to-[#2d1035]',
  },
]

const currentSlide = ref(0)
const isTransitioning = ref(false)
let autoTimer: ReturnType<typeof setInterval> | null = null

function goTo(index: number) {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSlide.value = (index + slides.length) % slides.length
  setTimeout(() => { isTransitioning.value = false }, 500)
}

function next() { goTo(currentSlide.value + 1) }
function prev() { goTo(currentSlide.value - 1) }

function startAuto() {
  autoTimer = setInterval(next, 5000)
}
function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
}

onMounted(startAuto)
onUnmounted(stopAuto)
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">

    <!-- ========== NAVBAR ========== -->
    <AppNavbar :show-search="true" />

    <!-- Category pills bar — scrollbar oculto -->
    <div class="no-scrollbar border-b border-[#d1d7dc] bg-white overflow-x-auto">
      <div class="max-w-[1340px] mx-auto px-4 flex items-center gap-6 h-[44px] min-w-max md:min-w-0">
        <RouterLink to="/courses" class="text-sm font-semibold text-[#1c1d1f] whitespace-nowrap hover:text-[#5624d0] border-b-2 border-[#5624d0] pb-0.5 flex items-center gap-1.5">
          <Compass :size="14" /> Todos
        </RouterLink>
        <RouterLink v-for="cat in categories" :key="cat"
          :to="`/courses?category=${encodeURIComponent(cat)}`"
          class="text-sm font-semibold text-[#1c1d1f] whitespace-nowrap hover:text-[#5624d0] transition-colors">
          {{ cat }}
        </RouterLink>
      </div>
    </div>

    <!-- ========== HERO CAROUSEL ========== -->
    <section
      class="relative overflow-hidden text-white"
      style="height: 420px; min-height: 360px;"
      @mouseenter="stopAuto"
      @mouseleave="startAuto"
    >
      <!-- Slides -->
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="absolute inset-0 bg-gradient-to-r transition-opacity duration-500"
        :class="[slide.bg, currentSlide === i ? 'opacity-100 z-10' : 'opacity-0 z-0']"
      >
        <div class="max-w-[1340px] mx-auto px-4 h-full flex flex-col md:flex-row items-center gap-8">
          <!-- Text side -->
          <div class="flex-1 max-w-xl py-10 md:py-0">
            <span class="inline-block bg-[#5624d0] text-white text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 mb-4">
              {{ slide.badge }}
            </span>
            <h1 class="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
              {{ slide.title }}<br />
              <span class="text-[#c0a8ff]">{{ slide.highlight }}</span>
            </h1>
            <p class="text-gray-300 text-sm md:text-base mb-6 leading-relaxed">
              {{ slide.desc }}
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <RouterLink :to="slide.ctaLink"
                class="inline-flex items-center gap-2 bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-6 py-3 text-sm transition-colors">
                {{ slide.cta }} <ArrowRight :size="16" />
              </RouterLink>
              <!-- Search bar -->
              <form @submit.prevent="searchCourses" class="flex border border-white/40 overflow-hidden flex-1 max-w-xs">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('hero.search')"
                  class="flex-1 px-3 py-2.5 text-[#1c1d1f] bg-white text-sm outline-none placeholder:text-[#6a6f73] min-w-0"
                />
                <button type="submit" class="bg-white/10 border-l border-white/20 px-3 text-white hover:bg-white/20 transition-colors flex items-center">
                  <Search :size="15" />
                </button>
              </form>
            </div>
          </div>

          <!-- Image side -->
          <div class="hidden md:block w-80 h-72 flex-shrink-0 overflow-hidden relative">
            <img :src="slide.image" :alt="slide.title"
              class="w-full h-full object-cover opacity-80" />
            <div class="absolute inset-0 bg-gradient-to-l from-transparent to-[rgba(28,29,31,0.5)]"></div>
          </div>
        </div>
      </div>

      <!-- Prev / Next arrows -->
      <button
        @click="prev"
        class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft :size="22" />
      </button>
      <button
        @click="next"
        class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight :size="22" />
      </button>

      <!-- Dot indicators -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <button
          v-for="(_, i) in slides"
          :key="i"
          @click="goTo(i)"
          class="transition-all duration-300"
          :class="currentSlide === i
            ? 'w-6 h-2 bg-white'
            : 'w-2 h-2 bg-white/40 hover:bg-white/70'"
          :aria-label="`Slide ${i + 1}`"
        />
      </div>

      <!-- Slide counter -->
      <div class="absolute top-4 right-14 z-20 text-xs text-white/50 font-semibold tabular-nums">
        {{ currentSlide + 1 }} / {{ slides.length }}
      </div>
    </section>

    <!-- ========== TRUST BAR ========== -->
    <div class="bg-[#f7f9fa] border-b border-[#d1d7dc] py-3">
      <div class="max-w-[1340px] mx-auto px-4 flex flex-wrap items-center gap-6 justify-center md:justify-start">
        <span class="text-xs font-bold text-[#6a6f73] uppercase tracking-wider flex items-center gap-1.5">
          <Globe :size="13" /> Estudiantes en:
        </span>
        <span v-for="c in ['Colombia', 'Estados Unidos', 'España', 'México']" :key="c" class="text-sm text-[#1c1d1f] font-semibold">{{ c }}</span>
      </div>
    </div>

    <!-- ========== FEATURED COURSES ========== -->
    <section class="py-10 border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-extrabold text-[#1c1d1f]">Cursos Destacados</h2>
          <RouterLink to="/courses" class="text-[#5624d0] text-sm font-bold hover:underline flex items-center gap-1">
            {{ t('common.viewAll') }} <ArrowRight :size="14" />
          </RouterLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CourseCard v-for="course in allCourses.slice(0, 4)" :key="course.id" :course="(course as Course)" :featured="course.featured" />
        </div>
      </div>
    </section>

    <!-- ========== ALL COURSES ========== -->
    <section class="py-10 border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <h2 class="text-2xl font-extrabold text-[#1c1d1f] mb-6">Todos los Cursos</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <CourseCard v-for="course in allCourses" :key="course.id" :course="(course as Course)" :featured="course.featured" />
        </div>
      </div>
    </section>

    <!-- ========== CATEGORIES ========== -->
    <section class="py-10 bg-[#f7f9fa] border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <h2 class="text-2xl font-extrabold text-[#1c1d1f] mb-6">Explora por Categoría</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RouterLink v-for="cat in categories" :key="cat"
            :to="`/courses?category=${encodeURIComponent(cat)}`"
            class="border border-[#d1d7dc] bg-white p-6 hover:shadow-md hover:border-[#5624d0] transition-all group">
            <component :is="categoryIcons[cat] ?? BookOpen" :size="32" class="mb-3 text-[#6a6f73] group-hover:text-[#5624d0] transition-colors" />
            <h3 class="font-extrabold text-[#1c1d1f] text-lg group-hover:text-[#5624d0] transition-colors">{{ cat }}</h3>
            <p class="text-[#6a6f73] text-sm mt-1">{{ getCourseCount(cat) }} curso{{ getCourseCount(cat) !== 1 ? 's' : '' }}</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ========== WHY US ========== -->
    <section class="py-10 border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <h2 class="text-2xl font-extrabold text-[#1c1d1f] mb-8 text-center">¿Por qué elegir {{ APP.name }}?</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="item in whyUs" :key="item.title" class="text-center">
            <div class="w-12 h-12 bg-[#ede8f5] flex items-center justify-center mx-auto mb-3">
              <component :is="item.icon" :size="22" class="text-[#5624d0]" />
            </div>
            <h3 class="font-extrabold text-[#1c1d1f] text-sm mb-1">{{ item.title }}</h3>
            <p class="text-[#6a6f73] text-xs leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== INSTRUCTOR TEASER ========== -->
    <section class="py-10 bg-[#f7f9fa] border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center gap-8 border border-[#d1d7dc] bg-white p-8">
          <div class="w-20 h-20 bg-[#5624d0] flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
            {{ APP.instructor.initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold uppercase tracking-wider text-[#6a6f73] mb-1">Tu instructor</p>
            <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-1">{{ APP.instructor.name }}</h2>
            <p class="text-[#5624d0] font-semibold text-sm mb-2">{{ APP.instructor.title }} · {{ APP.company.name }}</p>
            <div class="flex flex-wrap gap-4 text-xs text-[#6a6f73] mb-3">
              <span class="flex items-center gap-1"><Star :size="12" class="text-[#f4c430] fill-[#f4c430]" /> {{ APP.instructor.rating }} valoración</span>
              <span class="flex items-center gap-1"><Users :size="12" /> {{ APP.instructor.students }} estudiantes</span>
              <span class="flex items-center gap-1"><MapPin :size="12" /> {{ APP.company.location }}</span>
            </div>
            <p class="text-[#6a6f73] text-sm leading-relaxed line-clamp-2">
              Desarrollador con 15+ años de experiencia, fundador de {{ APP.company.name }}. Experto en full-stack, producción musical y educación tecnológica.
            </p>
          </div>
          <RouterLink to="/instructor"
            class="flex-shrink-0 border border-[#5624d0] text-[#5624d0] font-bold text-sm px-5 py-2.5 hover:bg-[#5624d0] hover:text-white transition-colors flex items-center gap-2">
            Ver perfil <ArrowRight :size="14" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ========== CTA BANNER ========== -->
    <section class="bg-[#1c1d1f] text-white py-14">
      <div class="max-w-[1340px] mx-auto px-4 text-center">
        <h2 class="text-3xl font-extrabold mb-3">¿Listo para comenzar?</h2>
        <p class="text-gray-400 mb-6 text-sm">Únete a cientos de estudiantes que ya están aprendiendo con {{ APP.name }}</p>
        <div class="flex gap-3 justify-center flex-wrap">
          <RouterLink to="/register" class="bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-6 py-3 transition-colors flex items-center gap-2">
            <GraduationCap :size="16" /> Crear cuenta gratis
          </RouterLink>
          <RouterLink to="/courses" class="border border-white text-white font-bold px-6 py-3 hover:bg-white hover:text-[#1c1d1f] transition-colors flex items-center gap-2">
            <BookOpen :size="16" /> Ver cursos
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ========== FOOTER ========== -->
    <AppFooter />

  </div>
</template>
