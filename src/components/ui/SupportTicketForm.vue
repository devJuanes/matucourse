<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CheckCircle, Loader2 } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { dbService } from '@/services'
import type { SupportTicketCategory } from '@/services'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    showLoginHint?: boolean
  }>(),
  { compact: false, showLoginHint: true },
)

const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  phone: '',
  category: 'soporte_tecnico' as SupportTicketCategory,
  subject: '',
  message: '',
})

const submitting = ref(false)
const submitted = ref(false)
const ticketId = ref('')
const error = ref('')

const categories: { value: SupportTicketCategory; label: string }[] = [
  { value: 'peticion', label: 'Petición' },
  { value: 'queja', label: 'Queja' },
  { value: 'reclamo', label: 'Reclamo' },
  { value: 'soporte_tecnico', label: 'Soporte técnico' },
  { value: 'facturacion', label: 'Facturación / pagos' },
  { value: 'otro', label: 'Otro' },
]

onMounted(() => {
  if (authStore.user) {
    form.value.name = authStore.user.name ?? ''
    form.value.email = authStore.user.email
  }
})

const canSubmit = computed(
  () =>
    form.value.name.trim() &&
    form.value.email.trim() &&
    form.value.subject.trim() &&
    form.value.message.trim().length >= 10,
)

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  error.value = ''
  try {
    ticketId.value = await dbService.submitSupportTicket({
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim() || undefined,
      category: form.value.category,
      subject: form.value.subject.trim(),
      message: form.value.message.trim(),
      user_id: authStore.user?.id,
    })
    submitted.value = true
    form.value.subject = ''
    form.value.message = ''
    form.value.phone = ''
  } catch {
    error.value = 'No se pudo enviar el ticket. Intenta de nuevo o escríbenos a info@matubyte.com'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  submitted.value = false
  ticketId.value = ''
}
</script>

<template>
  <div :class="compact ? '' : 'border border-[#d1d7dc] p-6 md:p-8 bg-white'">
    <div v-if="!compact" class="mb-6">
      <h2 class="text-xl font-extrabold text-[#1c1d1f]">Crear ticket de soporte</h2>
      <p class="text-[#6a6f73] text-sm mt-1">
        Peticiones, quejas, reclamos (PQR) o soporte técnico. No necesitas estar registrado.
      </p>
    </div>

    <div
      v-if="submitted"
      class="flex items-start gap-3 bg-[#f0faf0] border border-[#86c986] p-4"
    >
      <CheckCircle :size="22" class="text-green-600 flex-shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-bold text-green-800">Ticket enviado correctamente</p>
        <p class="text-sm text-green-700 mt-1">
          Referencia: <span class="font-mono font-bold">{{ ticketId }}</span>.
          Te responderemos a <strong>{{ form.email }}</strong> en menos de 24 horas.
        </p>
        <button
          type="button"
          class="text-xs font-bold text-[#5624d0] mt-3 hover:underline"
          @click="resetForm"
        >
          Enviar otro ticket
        </button>
      </div>
    </div>

    <form v-else @submit.prevent="submit" class="space-y-4">
      <div v-if="showLoginHint && !authStore.isAuthenticated" class="text-xs text-[#6a6f73] bg-[#f7f9fa] border border-[#d1d7dc] p-3">
        ¿Ya tienes cuenta?
        <RouterLink to="/login" class="font-bold text-[#5624d0] hover:underline">Inicia sesión</RouterLink>
        para vincular el ticket a tu perfil, o continúa como visitante.
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Nombre *</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0]"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Email *</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0]"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Tipo de solicitud *</label>
          <select
            v-model="form.category"
            class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] bg-white"
          >
            <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Teléfono (opcional)</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0]"
            placeholder="+57 ..."
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Asunto *</label>
        <input
          v-model="form.subject"
          type="text"
          required
          maxlength="120"
          class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0]"
          placeholder="Resume tu solicitud en una línea"
        />
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Mensaje *</label>
        <textarea
          v-model="form.message"
          required
          rows="5"
          minlength="10"
          class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] resize-y"
          placeholder="Describe tu petición, queja, reclamo o problema técnico con el mayor detalle posible..."
        />
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

      <button
        type="submit"
        :disabled="submitting || !canSubmit"
        class="w-full sm:w-auto bg-[#5624d0] hover:bg-[#3d1a9e] disabled:opacity-50 text-white font-bold text-sm px-8 py-3 transition-colors flex items-center justify-center gap-2"
      >
        <Loader2 v-if="submitting" :size="16" class="animate-spin" />
        {{ submitting ? 'Enviando...' : 'Enviar ticket' }}
      </button>
    </form>
  </div>
</template>
