<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { dbService } from '@/services'
import AppLogo from '@/components/ui/AppLogo.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const enrolling = ref(false)
const enrollmentDone = ref(false)
const enrollmentError = ref('')

const status = computed(() => {
  if (route.query.paid === 'true') return 'success'

  const s = String(route.query.status ?? route.query.transactionState ?? '').toLowerCase()
  if (s === 'paid' || s.includes('approved') || s.includes('aprobad') || s === '7') return 'success'
  if (s === 'declined' || s.includes('rejected') || s.includes('rechazad') || s === '6') return 'failed'
  return 'pending'
})

const courseName = computed(() => {
  const idFromQuery = route.query.courseId as string | undefined
  if (idFromQuery && cartStore.course?.id !== idFromQuery) {
    return `el curso (${idFromQuery})`
  }
  return cartStore.course?.title ?? 'tu curso'
})

async function completeEnrollment() {
  if (status.value !== 'success' || enrollmentDone.value) return

  const courseId = (route.query.courseId as string | undefined) ?? cartStore.course?.id
  if (!courseId) return

  const plan = (route.query.plan as string | undefined) === 'installments' ? 'installments' : 'full'
  const secondDue = route.query.due as string | undefined
  const expectedUid = route.query.uid as string | undefined

  if (!authStore.sessionReady) {
    await authStore.initSession()
  }

  if (!authStore.isAuthenticated) {
    router.replace({
      name: 'login',
      query: { redirect: route.fullPath },
    })
    return
  }

  const userId = authStore.user?.id
  if (!userId) return

  if (expectedUid && expectedUid !== userId) {
    enrollmentError.value =
      'El pago se realizó con otra cuenta. Inicia sesión con el correo que usaste al pagar o contacta soporte.'
    return
  }

  enrolling.value = true
  enrollmentError.value = ''

  try {
    const already = await dbService.hasEnrollment(userId, courseId)
    if (!already) {
      await dbService.addEnrollment(userId, courseId, plan as 'full' | 'installments', secondDue)
    }
    enrollmentDone.value = true
  } catch {
    enrollmentError.value =
      'El pago fue exitoso pero no pudimos activar tu curso automáticamente. Contacta soporte con tu comprobante.'
  } finally {
    enrolling.value = false
  }
}

onMounted(() => {
  completeEnrollment()
})
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fa] flex flex-col">
    <div class="border-b border-[#d1d7dc] bg-white h-14 flex items-center px-6">
      <AppLogo />
    </div>

    <div class="flex-1 flex items-center justify-center p-4">
      <div class="bg-white border border-[#d1d7dc] w-full max-w-md p-8 sm:p-10 text-center">

        <div v-if="enrolling" class="py-6">
          <div class="w-8 h-8 border-4 border-[#5624d0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p class="text-sm text-[#6a6f73]">Activando tu inscripción...</p>
        </div>

        <div v-else-if="status === 'success'">
          <div class="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-5">
            <span class="text-green-600 text-3xl font-bold">✓</span>
          </div>
          <h1 class="text-2xl font-extrabold text-[#1c1d1f] mb-2">¡Inscripción exitosa!</h1>
          <p class="text-[#6a6f73] text-sm mb-4">
            Tu compra de <strong class="text-[#1c1d1f]">{{ courseName }}</strong> fue procesada correctamente.
          </p>
          <p v-if="enrollmentError" class="text-red-600 text-xs mb-4 bg-red-50 border border-red-200 p-3">
            {{ enrollmentError }}
          </p>
          <p v-else-if="enrollmentDone" class="text-green-700 text-xs mb-4">
            Tu curso ya está disponible en tu cuenta.
          </p>
          <RouterLink
            v-if="enrollmentError"
            to="/dashboard/support"
            class="inline-block border border-[#5624d0] text-[#5624d0] font-bold px-6 py-2.5 text-sm mb-3"
          >
            Contactar soporte
          </RouterLink>
          <RouterLink
            to="/dashboard/my-courses"
            class="inline-block bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-8 py-3 text-sm transition-colors"
          >
            Ir a Mis Cursos
          </RouterLink>
        </div>

        <div v-else-if="status === 'failed'">
          <div class="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-5">
            <span class="text-red-600 text-3xl font-bold">✗</span>
          </div>
          <h1 class="text-2xl font-extrabold text-[#1c1d1f] mb-2">Pago rechazado</h1>
          <p class="text-[#6a6f73] text-sm mb-6">
            No fue posible procesar tu pago. Intenta con un método de pago diferente.
          </p>
          <RouterLink
            v-if="cartStore.course"
            :to="`/courses/${cartStore.course.id}?checkout=1`"
            class="inline-block bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-8 py-3 text-sm transition-colors"
          >
            Intentar de nuevo
          </RouterLink>
          <RouterLink
            v-else
            to="/courses"
            class="inline-block bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-8 py-3 text-sm transition-colors"
          >
            Ver cursos
          </RouterLink>
        </div>

        <div v-else>
          <div class="w-16 h-16 bg-yellow-100 flex items-center justify-center mx-auto mb-5">
            <span class="text-yellow-600 text-3xl">⏳</span>
          </div>
          <h1 class="text-2xl font-extrabold text-[#1c1d1f] mb-2">Pago en proceso</h1>
          <p class="text-[#6a6f73] text-sm mb-6">
            Tu pago está siendo verificado. Te notificaremos por correo cuando sea confirmado.
          </p>
          <RouterLink
            to="/courses"
            class="inline-block bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-8 py-3 text-sm transition-colors"
          >
            Explorar más cursos
          </RouterLink>
        </div>

      </div>
    </div>
  </div>
</template>
