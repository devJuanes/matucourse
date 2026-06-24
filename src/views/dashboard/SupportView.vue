<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SupportTicketForm from '@/components/ui/SupportTicketForm.vue'
import { MessageCircle, Headphones } from '@lucide/vue'
</script>

<template>
  <div class="max-w-[800px] mx-auto w-full">
    <div class="mb-8 border-b border-[#d1d7dc] pb-6">
      <h1 class="text-2xl font-extrabold text-[#1c1d1f]">Ayuda y soporte</h1>
      <p class="text-[#6a6f73] text-sm mt-1">
        Crea un ticket PQR o habla con tu instructor por chat en tiempo real.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <RouterLink
        to="/dashboard/chat"
        class="border border-[#d1d7dc] p-5 hover:border-[#5624d0] hover:shadow-sm transition-all flex items-start gap-4 group"
      >
        <MessageCircle :size="24" class="text-[#5624d0] flex-shrink-0" />
        <div>
          <p class="font-bold text-sm text-[#1c1d1f] group-hover:text-[#5624d0]">Chat con el instructor</p>
          <p class="text-xs text-[#6a6f73] mt-1">Mensajes directos en tiempo real</p>
        </div>
      </RouterLink>
      <RouterLink
        to="/support"
        class="border border-[#d1d7dc] p-5 hover:border-[#5624d0] hover:shadow-sm transition-all flex items-start gap-4 group"
      >
        <Headphones :size="24" class="text-[#5624d0] flex-shrink-0" />
        <div>
          <p class="font-bold text-sm text-[#1c1d1f] group-hover:text-[#5624d0]">Centro de ayuda</p>
          <p class="text-xs text-[#6a6f73] mt-1">Preguntas frecuentes y más opciones</p>
        </div>
      </RouterLink>
    </div>

    <SupportTicketForm :show-login-hint="false" />
  </div>
</template>
