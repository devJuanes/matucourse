<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import axios from 'axios'
import {
  ArrowLeft, User, BarChart2, Video, BookOpen,
  Check, ChevronDown, ChevronRight, PlayCircle,
  SearchX, Star,
} from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useCoursesStore } from '@/stores/courses'
import { useCurrencyStore } from '@/stores/currency'
import { useAuthStore } from '@/stores/auth'
import { APP } from '@/config/app'
import type { Course, CourseModule, CoursePrice, PaymentPlan } from '@/services'
import { dbService } from '@/services'
import PaymentPlanModal from '@/components/ui/PaymentPlanModal.vue'
import AppLogo from '@/components/ui/AppLogo.vue'
import { savePendingCheckout, clearPendingCheckout } from '@/utils/pendingCheckout'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const coursesStore = useCoursesStore()
const currencyStore = useCurrencyStore()
const authStore = useAuthStore()

const openModule = ref<number | null>(1)
const buying = ref(false)
const buyError = ref('')
const showPlanModal = ref(false)
const alreadyEnrolled = ref(false)
const checkingEnrollment = ref(true)

const course = computed<Course | undefined>(
  () => coursesStore.getCourseById(route.params.id as string)
)

onMounted(async () => {
  if (!authStore.sessionReady) {
    await authStore.initSession()
  }
  await coursesStore.fetchCourses()
  if (!coursesStore.loading && !course.value) {
    router.push('/courses')
    return
  }
  if (authStore.isAuthenticated && authStore.user?.id && course.value) {
    alreadyEnrolled.value = await dbService.hasEnrollment(authStore.user.id, course.value.id)
  }
  checkingEnrollment.value = false
  if (route.query.checkout === '1' && authStore.isAuthenticated && !alreadyEnrolled.value) {
    clearPendingCheckout()
    showPlanModal.value = true
  }
})

function toggleModule(id: number) {
  openModule.value = openModule.value === id ? null : id
}

function formatPrice(prices: CoursePrice, currency: string) {
  const amount = prices[currency as keyof CoursePrice]
  if (!amount) return ''
  if (currency === 'COP') return `$${amount.toLocaleString('es-CO')}`
  if (currency === 'USD') return `$${amount}`
  if (currency === 'EUR') return `€${amount}`
  return String(amount)
}

const ratings: Record<string, { stars: number; count: string; students: string }> = {
  'cpp-fundamentals':    { stars: 4.7, count: '2,341 valoraciones', students: '8,421 estudiantes' },
  'fl-studio-producer':  { stars: 4.8, count: '1,892 valoraciones', students: '5,210 estudiantes' },
  'piano-desde-cero':    { stars: 4.6, count: '987 valoraciones',   students: '3,102 estudiantes' },
  'arduino-iot':         { stars: 4.7, count: '1,205 valoraciones', students: '4,500 estudiantes' },
  'python-data-science': { stars: 4.9, count: '3,102 valoraciones', students: '12,300 estudiantes' },
  'web-fullstack':       { stars: 4.8, count: '4,567 valoraciones', students: '15,000 estudiantes' },
}

const rating = computed(
  () => ratings[route.params.id as string] ?? { stars: 4.5, count: '500 valoraciones', students: '1,000 estudiantes' }
)

function moduleTopicCount(mod: CourseModule): number {
  if (mod.topics?.length) return mod.topics.length
  return mod.lessons?.length ?? 0
}

function moduleTopics(mod: CourseModule): string[] {
  if (mod.topics?.length) return mod.topics
  return mod.lessons?.map((l) => l.title) ?? []
}

const totalTopics = computed(
  () => course.value?.modules?.reduce((acc, m) => acc + moduleTopicCount(m), 0) ?? 0
)

function openPaymentModal() {
  if (!course.value) return
  buyError.value = ''

  if (alreadyEnrolled.value) {
    buyError.value = 'Ya tienes este curso inscrito. Ve a Mis Cursos en tu dashboard.'
    return
  }

  if (!authStore.isAuthenticated) {
    const returnPath = `/courses/${course.value.id}?checkout=1`
    savePendingCheckout({ courseId: course.value.id, returnPath })
    router.push({ name: 'login', query: { redirect: returnPath } })
    return
  }

  showPlanModal.value = true
}

async function handlePlanConfirmed(plan: PaymentPlan, amount: number) {
  if (!course.value) return
  showPlanModal.value = false

  if (!authStore.isAuthenticated || !authStore.user?.id) {
    const returnPath = `/courses/${course.value.id}?checkout=1`
    savePendingCheckout({ courseId: course.value.id, returnPath })
    router.push({ name: 'login', query: { redirect: returnPath } })
    return
  }

  if (await dbService.hasEnrollment(authStore.user.id, course.value.id)) {
    alreadyEnrolled.value = true
    buyError.value = 'Ya tienes este curso inscrito.'
    return
  }

  buying.value = true
  buyError.value = ''
  try {
    cartStore.selectCourse(course.value)

    const secondDueDate = plan === 'installments'
      ? (() => { const d = new Date(); d.setDate(d.getDate() + 15); return d.toISOString() })()
      : undefined

    const userId = authStore.user.id

    const res = await axios.post(
      `${import.meta.env.VITE_PAYMATUBYTE_URL}/v1/payment`,
      {
        productId: course.value.id,
        amount,
        currency: 'COP',
        description: plan === 'installments'
          ? `Cuota 1/2: ${course.value.title}`
          : `Curso: ${course.value.title}`,
        reference: `matucourse-${course.value.id}-${userId}-${Date.now()}`,
        returnUrl: `${window.location.origin}/payment/result?courseId=${course.value.id}&plan=${plan}&uid=${userId}${secondDueDate ? `&due=${encodeURIComponent(secondDueDate)}` : ''}`,
      },
      { headers: { 'Authorization': import.meta.env.VITE_PAYMATUBYTE_API_KEY } }
    )

    const url = res.data?.url ?? res.data?.data?.url ?? res.data?.payment_url
    if (url) {
      window.location.href = url
    } else {
      buyError.value = 'No se pudo generar el enlace de pago. Intenta de nuevo.'
    }
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      buyError.value = e.response?.data?.message ?? 'Error al procesar el pago. Intenta de nuevo.'
    } else {
      buyError.value = 'Error al procesar el pago. Intenta de nuevo.'
    }
  } finally {
    buying.value = false
  }
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="coursesStore.loading" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="w-8 h-8 border-4 border-[#5624d0] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-[#6a6f73] text-sm">Cargando curso...</p>
    </div>
  </div>

  <div v-else-if="course" class="min-h-screen bg-white text-[#1c1d1f] pb-[7.5rem] lg:pb-0">

    <!-- Payment plan modal -->
    <PaymentPlanModal
      v-if="showPlanModal"
      :course="course"
      :currency="currencyStore.selected"
      @confirm="handlePlanConfirmed"
      @close="showPlanModal = false"
    />

    <!-- Navbar -->
    <nav class="sticky top-0 z-40 bg-white border-b border-[#d1d7dc] h-[56px]">
      <div class="max-w-[1340px] mx-auto px-4 h-full flex items-center gap-3">
        <AppLogo class="mr-2" />
        <RouterLink to="/courses" class="hidden md:flex items-center gap-1.5 text-sm font-semibold text-[#1c1d1f] hover:text-[#5624d0] transition-colors whitespace-nowrap border border-[#1c1d1f] hover:border-[#5624d0] px-3 py-1.5">
          <ArrowLeft :size="14" /> Cursos
        </RouterLink>
        <div class="ml-auto flex items-center gap-3">
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

    <!-- Dark hero banner -->
    <div class="bg-[#1c1d1f] text-white py-10">
      <div class="max-w-[1340px] mx-auto px-4 flex gap-8">
        <div class="flex-1 max-w-2xl">
          <div class="text-xs text-[#cec0fc] mb-3">
            <RouterLink to="/courses" class="hover:underline">Cursos</RouterLink>
            <span class="mx-1">›</span>
            <RouterLink :to="`/courses?category=${encodeURIComponent(course.category)}`" class="hover:underline">{{ course.category }}</RouterLink>
          </div>
          <h1 class="text-2xl md:text-3xl font-extrabold leading-tight mb-3">{{ course.title }}</h1>
          <p class="text-gray-300 text-sm mb-4">{{ course.description }}</p>
          <div class="flex flex-wrap items-center gap-3 text-sm mb-3">
            <span class="bg-[#eceb98] text-[#3d3c0a] text-xs font-bold px-2 py-0.5" v-if="course.featured">Bestseller</span>
            <div class="flex items-center gap-1">
              <span class="text-[#f4c430] font-bold">{{ rating.stars }}</span>
              <Star v-for="i in 5" :key="i" :size="13"
                :class="i <= Math.round(rating.stars) ? 'fill-[#f4c430] text-[#f4c430]' : 'text-[#6a6f73]'" />
              <span class="text-[#cec0fc] text-xs">({{ rating.count }})</span>
            </div>
            <span class="text-gray-300 text-xs">{{ rating.students }}</span>
          </div>
          <div class="flex flex-wrap gap-4 text-xs text-gray-300">
            <span class="flex items-center gap-1.5"><User :size="13" /> {{ course.instructor }}</span>
            <span class="flex items-center gap-1.5"><BarChart2 :size="13" /> {{ course.level }}</span>
            <span class="flex items-center gap-1.5"><Video :size="13" /> {{ course.modality }}</span>
            <span class="flex items-center gap-1.5"><BookOpen :size="13" /> {{ course.modules?.length }} módulos · {{ totalTopics }} temas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content + sticky card -->
    <div class="max-w-[1340px] mx-auto px-4 py-8 flex gap-8 items-start">

      <!-- Left: main content -->
      <div class="flex-1 min-w-0">
        <!-- What you'll learn -->
        <div class="border border-[#d1d7dc] p-6 mb-8">
          <h2 class="text-xl font-extrabold mb-4">Lo que aprenderás</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div v-for="mod in course.modules" :key="mod.id" class="flex items-start gap-2 text-sm">
              <Check :size="14" class="text-[#5624d0] mt-0.5 flex-shrink-0" />
              <span>{{ mod.title.replace(/^Módulo \d+: /, '') }}</span>
            </div>
          </div>
        </div>

        <!-- Curriculum -->
        <div class="mb-8">
          <h2 class="text-xl font-extrabold mb-4">Contenido del Curso</h2>
          <p class="text-[#6a6f73] text-sm mb-4">{{ course.modules?.length }} módulos · {{ totalTopics }} temas</p>
          <div class="border border-[#d1d7dc]">
            <div v-for="mod in course.modules" :key="mod.id" class="border-b border-[#d1d7dc] last:border-b-0">
              <button @click="toggleModule(mod.id)"
                class="w-full flex items-center justify-between px-4 py-3 text-left bg-[#f7f9fa] hover:bg-[#ede8f5] transition-colors">
                <div class="flex items-center gap-3">
                  <component :is="openModule === mod.id ? ChevronDown : ChevronRight" :size="15" class="text-[#5624d0]" />
                  <span class="font-bold text-sm">{{ mod.title }}</span>
                </div>
                <span class="text-[#6a6f73] text-xs flex-shrink-0">{{ moduleTopicCount(mod) }} temas</span>
              </button>
              <div v-if="openModule === mod.id" class="px-4 py-3 bg-white">
                <p class="text-[#6a6f73] text-sm mb-3">{{ mod.description }}</p>
                <ul class="space-y-2">
                  <li v-for="topic in moduleTopics(mod)" :key="topic" class="flex items-start gap-2 text-sm">
                    <PlayCircle :size="14" class="text-[#6a6f73] mt-0.5 flex-shrink-0" />
                    <span>{{ topic }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructor -->
        <div class="mb-8">
          <h2 class="text-xl font-extrabold mb-4">Tu Instructor</h2>
          <div class="flex gap-4 items-start">
            <div class="w-16 h-16 bg-[#5624d0] flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">JL</div>
            <div>
              <h3 class="font-bold text-[#5624d0] text-lg">{{ course.instructor }}</h3>
              <p class="text-[#6a6f73] text-sm mb-2">{{ course.instructorTitle }}</p>
              <p class="text-sm text-[#6a6f73]">Desarrollador senior full-stack con 15+ años de experiencia, fundador de MatuByte S.A.S. Cali, Colombia.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Sticky purchase card -->
      <div class="hidden lg:block w-72 xl:w-80 flex-shrink-0">
        <div class="sticky top-[72px] border border-[#d1d7dc] shadow-lg bg-white">
          <img :src="course.thumbnail" :alt="course.title" class="w-full h-40 object-cover" />
          <div class="p-5">
            <!-- Currency selector -->
            <div class="flex gap-1 mb-3">
              <button v-for="c in ['COP','USD','EUR']" :key="c"
                @click="currencyStore.setCurrency(c as 'COP'|'USD'|'EUR')"
                :class="currencyStore.selected === c
                  ? 'bg-[#5624d0] text-white border-[#5624d0]'
                  : 'bg-white text-[#1c1d1f] border-[#d1d7dc] hover:border-[#1c1d1f]'"
                class="flex-1 text-xs font-bold border py-1 transition-colors text-center">
                {{ c }}
              </button>
            </div>

            <!-- Price -->
            <div class="mb-1">
              <span class="text-3xl font-extrabold text-[#1c1d1f]">{{ formatPrice(course.price, currencyStore.selected) }}</span>
              <span class="text-sm text-[#6a6f73] ml-2">{{ currencyStore.selected }}</span>
            </div>
            <p class="text-xs text-[#6a6f73] mb-4">o 2 cuotas con pequeño recargo</p>

            <!-- Buy button -->
            <RouterLink
              v-if="alreadyEnrolled"
              to="/dashboard/my-courses"
              class="block w-full text-center bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold py-3 text-sm transition-colors mb-3"
            >
              Ir a Mis Cursos
            </RouterLink>
            <button
              v-else
              type="button"
              @click="openPaymentModal"
              :disabled="buying || checkingEnrollment"
              class="w-full bg-[#5624d0] hover:bg-[#3d1a9e] disabled:opacity-60 text-white font-bold py-3 text-sm transition-colors mb-3"
            >
              {{ buying ? 'Procesando...' : (authStore.isAuthenticated ? '¡Inscribirme ahora!' : 'Iniciar sesión para comprar') }}
            </button>

            <p v-if="buyError" class="text-red-600 text-xs text-center mb-3">{{ buyError }}</p>

            <RouterLink
              v-if="!authStore.isAuthenticated && !alreadyEnrolled"
              :to="{ path: '/register', query: { redirect: `/courses/${course.id}?checkout=1` } }"
              class="block w-full text-center border border-[#5624d0] text-[#5624d0] font-bold py-2.5 text-sm hover:bg-[#f0ebff] transition-colors mb-3"
            >
              Crear cuenta gratis
            </RouterLink>

            <ul class="text-xs text-[#6a6f73] space-y-1.5">
              <li class="flex items-center gap-1.5"><Check :size="13" class="text-[#5624d0] flex-shrink-0 mt-0.5" /> Clases en vivo con el instructor</li>
              <li class="flex items-center gap-1.5"><Check :size="13" class="text-[#5624d0] flex-shrink-0 mt-0.5" /> Acceso de por vida al material</li>
              <li class="flex items-center gap-1.5"><Check :size="13" class="text-[#5624d0] flex-shrink-0 mt-0.5" /> Certificado de finalización</li>
              <li class="flex items-center gap-1.5"><Check :size="13" class="text-[#5624d0] flex-shrink-0 mt-0.5" /> Soporte directo del instructor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile buy bar -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 border-t border-[#d1d7dc] bg-white shadow-lg z-40 safe-bottom">
      <div class="px-3 pt-3 pb-1">
        <div class="flex items-center justify-between gap-3 mb-2">
          <div class="min-w-0 flex-1">
            <p class="text-lg font-extrabold text-[#1c1d1f] leading-tight truncate">
              {{ formatPrice(course.price, currencyStore.selected) }}
              <span class="text-xs font-semibold text-[#6a6f73] ml-1">{{ currencyStore.selected }}</span>
            </p>
            <p class="text-[10px] text-[#6a6f73] mt-0.5">o 2 cuotas con pequeño recargo</p>
          </div>
          <div class="flex gap-1 flex-shrink-0">
            <button
              v-for="c in ['COP', 'USD', 'EUR']"
              :key="c"
              type="button"
              @click="currencyStore.setCurrency(c as 'COP' | 'USD' | 'EUR')"
              :class="[
                'text-[10px] font-bold px-2.5 py-1.5 min-w-[2.5rem] text-center transition-colors',
                currencyStore.selected === c
                  ? 'bg-[#5624d0] text-white'
                  : 'border border-[#d1d7dc] text-[#1c1d1f] bg-white',
              ]"
            >
              {{ c }}
            </button>
          </div>
        </div>
        <p v-if="buyError" class="text-red-600 text-[10px] mb-2 leading-snug">{{ buyError }}</p>
        <RouterLink
          v-if="alreadyEnrolled"
          to="/dashboard/my-courses"
          class="block w-full text-center bg-[#5624d0] text-white font-bold py-3 text-sm"
        >
          Ya inscrito — Ver curso
        </RouterLink>
        <button
          v-else
          type="button"
          @click="openPaymentModal"
          :disabled="buying || checkingEnrollment"
          class="w-full bg-[#5624d0] hover:bg-[#3d1a9e] disabled:opacity-60 text-white font-bold py-3 text-sm transition-colors"
        >
          {{ buying ? 'Procesando...' : (authStore.isAuthenticated ? '¡Inscribirme ahora!' : 'Iniciar sesión para comprar') }}
        </button>
      </div>
    </div>

  </div>

  <!-- Not found -->
  <div v-else-if="!coursesStore.loading" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <SearchX :size="40" class="mx-auto text-[#d1d7dc] mb-3" />
      <p class="text-[#6a6f73]">Curso no encontrado</p>
      <RouterLink to="/courses" class="mt-4 inline-block text-[#5624d0] font-semibold underline">Ver todos los cursos</RouterLink>
    </div>
  </div>
</template>
