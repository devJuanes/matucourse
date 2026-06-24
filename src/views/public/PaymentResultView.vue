<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { dbService } from '@/services'
import AppLogo from '@/components/ui/AppLogo.vue'

const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()

const status = computed(() => {
  // PayMatuByte/Bold envía: ?status=PAID&paid=true
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

onMounted(async () => {
  if (status.value !== 'success') return
  const courseId = (route.query.courseId as string | undefined) ?? cartStore.course?.id
  const plan = (route.query.plan as string | undefined) === 'installments' ? 'installments' : 'full'
  const secondDue = route.query.due as string | undefined
  if (courseId && authStore.isAuthenticated && authStore.user?.id) {
    try {
      await dbService.addEnrollment(authStore.user.id, courseId, plan as 'full' | 'installments', secondDue)
    } catch {
      // El pago fue exitoso aunque el registro de inscripción falle
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fa] flex flex-col">
    <!-- Top bar -->
    <div class="border-b border-[#d1d7dc] bg-white h-14 flex items-center px-6">
      <AppLogo />
    </div>

    <div class="flex-1 flex items-center justify-center p-4">
      <div class="bg-white border border-[#d1d7dc] w-full max-w-md p-10 text-center">

        <!-- SUCCESS -->
        <div v-if="status === 'success'">
          <div class="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-5">
            <span class="text-green-600 text-3xl font-bold">✓</span>
          </div>
          <h1 class="text-2xl font-extrabold text-[#1c1d1f] mb-2">¡Inscripción exitosa!</h1>
          <p class="text-[#6a6f73] text-sm mb-6">
            Tu compra de <strong class="text-[#1c1d1f]">{{ courseName }}</strong> fue procesada correctamente.
            Recibirás un correo con los detalles de tu inscripción.
          </p>
          <RouterLink
            to="/dashboard"
            class="inline-block bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-8 py-3 text-sm transition-colors">
            Ir a Mi Dashboard
          </RouterLink>
        </div>

        <!-- FAILED -->
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
            :to="`/courses/${cartStore.course.id}`"
            class="inline-block bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-8 py-3 text-sm transition-colors">
            Intentar de nuevo
          </RouterLink>
          <RouterLink v-else to="/courses"
            class="inline-block bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-8 py-3 text-sm transition-colors">
            Ver cursos
          </RouterLink>
        </div>

        <!-- PENDING -->
        <div v-else>
          <div class="w-16 h-16 bg-yellow-100 flex items-center justify-center mx-auto mb-5">
            <span class="text-yellow-600 text-3xl">⏳</span>
          </div>
          <h1 class="text-2xl font-extrabold text-[#1c1d1f] mb-2">Pago en proceso</h1>
          <p class="text-[#6a6f73] text-sm mb-6">
            Tu pago está siendo verificado. Te notificaremos por correo cuando sea confirmado.
          </p>
          <RouterLink to="/courses"
            class="inline-block bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold px-8 py-3 text-sm transition-colors">
            Explorar más cursos
          </RouterLink>
        </div>

      </div>
    </div>
  </div>
</template>
