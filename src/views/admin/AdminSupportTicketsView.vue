<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { dbService } from '@/services'
import type { SupportTicket, SupportTicketStatus } from '@/services'
import { Headphones, Loader2 } from '@lucide/vue'

const tickets = ref<SupportTicket[]>([])
const loading = ref(true)
const updating = ref<string | null>(null)

let unsubscribe: (() => void) | null = null

const categoryLabels: Record<string, string> = {
  peticion: 'Petición',
  queja: 'Queja',
  reclamo: 'Reclamo',
  soporte_tecnico: 'Soporte técnico',
  facturacion: 'Facturación',
  otro: 'Otro',
}

const statusLabels: Record<SupportTicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En proceso',
  closed: 'Cerrado',
}

onMounted(() => {
  unsubscribe = dbService.subscribeSupportTickets((list) => {
    tickets.value = list
    loading.value = false
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

async function setStatus(id: string, status: SupportTicketStatus) {
  updating.value = id
  try {
    await dbService.updateSupportTicketStatus(id, status)
  } finally {
    updating.value = null
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusClass(status: SupportTicketStatus) {
  if (status === 'open') return 'bg-orange-100 text-orange-800'
  if (status === 'in_progress') return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <div class="max-w-[1100px] mx-auto w-full">
    <div class="mb-8 border-b border-[#d1d7dc] pb-6 flex items-start gap-4">
      <Headphones :size="28" class="text-[#5624d0] flex-shrink-0" />
      <div>
        <h1 class="text-2xl font-extrabold text-[#1c1d1f]">Tickets de soporte (PQR)</h1>
        <p class="text-[#6a6f73] text-sm mt-1">
          Peticiones, quejas, reclamos y soporte técnico — se actualizan en tiempo real.
        </p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16">
      <Loader2 :size="32" class="mx-auto animate-spin text-[#5624d0]" />
    </div>

    <div v-else-if="tickets.length === 0" class="border border-[#d1d7dc] p-12 text-center text-[#6a6f73] text-sm">
      No hay tickets aún. Los usuarios pueden crear uno desde el centro de ayuda o contacto.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="ticket in tickets"
        :key="ticket.id"
        class="border border-[#d1d7dc] bg-white p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <p class="font-extrabold text-[#1c1d1f]">{{ ticket.subject }}</p>
            <p class="text-xs text-[#6a6f73] mt-1">
              {{ ticket.name }} · {{ ticket.email }}
              <span v-if="ticket.phone"> · {{ ticket.phone }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-bold uppercase px-2 py-1 bg-[#f7f9fa] border border-[#d1d7dc]">
              {{ categoryLabels[ticket.category] ?? ticket.category }}
            </span>
            <span :class="['text-[10px] font-bold uppercase px-2 py-1', statusClass(ticket.status)]">
              {{ statusLabels[ticket.status] }}
            </span>
          </div>
        </div>

        <p class="text-sm text-[#1c1d1f] leading-relaxed whitespace-pre-wrap">{{ ticket.message }}</p>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f7f9fa] pt-3">
          <p class="text-[10px] text-[#6a6f73]">
            #{{ ticket.id }} · {{ formatDate(ticket.created_at) }}
            <span v-if="ticket.user_id"> · Usuario: {{ ticket.user_id }}</span>
          </p>
          <div class="flex gap-2">
            <button
              v-if="ticket.status !== 'in_progress'"
              :disabled="updating === ticket.id"
              @click="setStatus(ticket.id, 'in_progress')"
              class="text-xs font-bold border border-[#5624d0] text-[#5624d0] px-3 py-1.5 hover:bg-[#5624d0] hover:text-white transition-colors disabled:opacity-50"
            >
              En proceso
            </button>
            <button
              v-if="ticket.status !== 'closed'"
              :disabled="updating === ticket.id"
              @click="setStatus(ticket.id, 'closed')"
              class="text-xs font-bold border border-[#d1d7dc] text-[#6a6f73] px-3 py-1.5 hover:border-[#1c1d1f] hover:text-[#1c1d1f] transition-colors disabled:opacity-50"
            >
              Cerrar
            </button>
            <button
              v-if="ticket.status === 'closed'"
              :disabled="updating === ticket.id"
              @click="setStatus(ticket.id, 'open')"
              class="text-xs font-bold border border-orange-400 text-orange-600 px-3 py-1.5 hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              Reabrir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
