<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dbService } from '@/services'
import type { ChatMessage, ChatPartner } from '@/services'
import { APP } from '@/config/app'
import { Send, MessageCircle, User, ChevronDown } from '@lucide/vue'

const authStore = useAuthStore()

const partners = ref<ChatPartner[]>([])
const selectedPartner = ref<ChatPartner | null>(null)
const messages = ref<ChatMessage[]>([])
const newMessage = ref('')
const loading = ref(true)
const sending = ref(false)
const chatError = ref('')
const mobilePartnerOpen = ref(false)

let unsubscribeMessages: (() => void) | null = null

const isInstructor = computed(() => authStore.isAdmin)

const ADMIN_PARTNER: ChatPartner = {
  user_id: 'admin',
  name: APP.instructor.name,
  email: APP.company.email,
}

onMounted(async () => {
  if (!authStore.user?.id) return

  loading.value = true
  chatError.value = ''

  try {
    if (isInstructor.value) {
      partners.value = await dbService.getChatPartners(authStore.user.id, true)
      if (partners.value.length > 0 && partners.value[0]) {
        selectedPartner.value = partners.value[0]
      }
    } else {
      selectedPartner.value = ADMIN_PARTNER
      startRealtimeSubscription()
    }

    if (isInstructor.value && selectedPartner.value) {
      startRealtimeSubscription()
    }
  } catch {
    chatError.value = 'Error al cargar mensajes.'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  unsubscribeMessages?.()
})

function startRealtimeSubscription() {
  unsubscribeMessages?.()
  if (!authStore.user?.id) return

  if (isInstructor.value && selectedPartner.value) {
    unsubscribeMessages = dbService.subscribeAdminStudentChat(
      authStore.user.id,
      selectedPartner.value.user_id,
      (msgs) => { messages.value = msgs },
    )
  } else if (!isInstructor.value) {
    unsubscribeMessages = dbService.subscribeStudentAdminChat(
      authStore.user.id,
      (msgs) => { messages.value = msgs },
    )
  }
}

async function selectPartner(partner: ChatPartner) {
  selectedPartner.value = partner
  messages.value = []
  mobilePartnerOpen.value = false
  startRealtimeSubscription()
}

async function send() {
  const text = newMessage.value.trim()
  if (!text || !authStore.user?.id) return

  sending.value = true
  chatError.value = ''

  try {
    if (isInstructor.value && selectedPartner.value) {
      await dbService.sendChatMessage(
        authStore.user.id,
        selectedPartner.value.user_id,
        text,
      )
    } else {
      await dbService.sendMessageToAdmin(authStore.user.id, text)
    }
    newMessage.value = ''
  } catch {
    chatError.value = 'No se pudo enviar. Revisa las reglas de Firestore (chat_messages).'
  } finally {
    sending.value = false
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isOwnMessage(msg: ChatMessage) {
  return msg.from_user_id === authStore.user?.id
}
</script>

<template>
  <div class="max-w-[1100px] mx-auto w-full min-h-[calc(100dvh-8rem)] flex flex-col">

    <div class="mb-4 sm:mb-6 border-b border-[#d1d7dc] pb-4">
      <h2 class="text-xl sm:text-2xl font-extrabold text-[#1c1d1f]">Mensajes</h2>
      <p class="text-[#6a6f73] text-sm mt-1">
        {{ isInstructor ? 'Responde a tus estudiantes' : 'Escríbele al instructor / administrador' }}
      </p>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="w-8 h-8 border-4 border-[#5624d0] border-t-transparent rounded-full animate-spin"></div>
    </div>

  <!-- Admin sin estudiantes que han escrito -->
    <div
      v-else-if="isInstructor && partners.length === 0"
      class="flex-1 border border-[#d1d7dc] flex flex-col items-center justify-center p-12 text-center bg-white"
    >
      <MessageCircle :size="48" class="text-[#5624d0] mb-4 opacity-40" />
      <p class="font-bold text-[#1c1d1f] mb-2">Sin mensajes de estudiantes</p>
      <p class="text-[#6a6f73] text-sm max-w-md">
        Cuando un estudiante te escriba desde Mensajes, aparecerá aquí para responder.
      </p>
    </div>

    <div v-else class="flex-1 flex flex-col lg:flex-row border border-[#d1d7dc] min-h-[min(70dvh,560px)] bg-white">

      <!-- Mobile partner picker (instructor) -->
      <div v-if="isInstructor" class="lg:hidden border-b border-[#d1d7dc]">
        <button
          type="button"
          class="w-full flex items-center justify-between px-4 py-3 text-left bg-[#f7f9fa]"
          @click="mobilePartnerOpen = !mobilePartnerOpen"
        >
          <div class="min-w-0">
            <p class="text-xs text-[#6a6f73]">Estudiante</p>
            <p class="text-sm font-bold truncate">{{ selectedPartner?.name ?? 'Seleccionar' }}</p>
          </div>
          <ChevronDown :size="18" class="text-[#5624d0] flex-shrink-0" />
        </button>
        <div v-if="mobilePartnerOpen" class="max-h-48 overflow-y-auto border-t border-[#d1d7dc]">
          <button
            v-for="p in partners"
            :key="p.user_id"
            type="button"
            @click="selectPartner(p)"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#d1d7dc] last:border-b-0',
              selectedPartner?.user_id === p.user_id ? 'bg-[#ede8f5]' : 'hover:bg-[#f7f9fa]',
            ]"
          >
            <div class="w-8 h-8 bg-[#5624d0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {{ p.name[0]?.toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold truncate">{{ p.name }}</p>
              <p class="text-[10px] text-[#6a6f73] truncate">{{ p.email }}</p>
            </div>
          </button>
        </div>
      </div>

      <div v-if="isInstructor" class="hidden lg:block w-64 border-r border-[#d1d7dc] overflow-y-auto flex-shrink-0">
        <button
          v-for="p in partners"
          :key="p.user_id"
          @click="selectPartner(p)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#d1d7dc] transition-colors',
            selectedPartner?.user_id === p.user_id ? 'bg-[#ede8f5]' : 'hover:bg-[#f7f9fa]',
          ]"
        >
          <div class="w-8 h-8 bg-[#5624d0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {{ p.name[0]?.toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-[#1c1d1f] truncate">{{ p.name }}</p>
            <p class="text-[10px] text-[#6a6f73] truncate">{{ p.email }}</p>
          </div>
        </button>
      </div>

      <div class="flex-1 flex flex-col min-w-0">
        <div class="border-b border-[#d1d7dc] px-4 py-3 flex items-center gap-3 bg-[#f7f9fa]">
          <div class="w-9 h-9 bg-[#5624d0] flex items-center justify-center text-white font-bold text-sm">
            <User :size="16" />
          </div>
          <div>
            <p class="font-bold text-sm text-[#1c1d1f]">
              {{ isInstructor ? selectedPartner?.name : APP.instructor.name }}
            </p>
            <p class="text-[10px] text-[#6a6f73]">
              {{ isInstructor ? 'Estudiante' : 'Instructor · en vivo' }}
            </p>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="messages.length === 0" class="text-center text-[#6a6f73] text-sm py-12">
            {{ isInstructor ? 'Selecciona un estudiante y responde.' : '¡Escríbeme! Respondo desde aquí.' }}
          </div>
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="isOwnMessage(msg) ? 'flex justify-end' : 'flex justify-start'"
          >
            <div
              :class="[
                'max-w-[75%] px-4 py-2.5 text-sm',
                isOwnMessage(msg)
                  ? 'bg-[#5624d0] text-white'
                  : 'bg-[#f7f9fa] border border-[#d1d7dc] text-[#1c1d1f]',
              ]"
            >
              <p>{{ msg.text }}</p>
              <p
                :class="[
                  'text-[10px] mt-1',
                  isOwnMessage(msg) ? 'text-white/70' : 'text-[#6a6f73]',
                ]"
              >
                {{ formatTime(msg.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <p v-if="chatError" class="text-red-600 text-xs px-4 py-2 border-t border-[#d1d7dc]">{{ chatError }}</p>

        <form @submit.prevent="send" class="border-t border-[#d1d7dc] p-3 sm:p-4 flex gap-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Escribe un mensaje..."
            class="flex-1 min-w-0 border border-[#d1d7dc] px-3 sm:px-4 py-2.5 text-sm outline-none focus:border-[#5624d0]"
          />
          <button
            type="submit"
            :disabled="sending || !newMessage.trim() || (isInstructor && !selectedPartner)"
            class="bg-[#5624d0] hover:bg-[#3d1a9e] disabled:opacity-50 text-white px-3 sm:px-5 py-2.5 flex items-center gap-2 font-bold text-sm transition-colors flex-shrink-0"
          >
            <Send :size="16" />
            <span class="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
