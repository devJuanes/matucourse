<script setup lang="ts">
import { Mail, MapPin, Clock } from '@lucide/vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SupportTicketForm from '@/components/ui/SupportTicketForm.vue'
import { APP } from '@/config/app'

const infoCards = [
  { icon: Mail, title: 'Correo electrónico', value: APP.company.email, href: `mailto:${APP.company.email}` },
  { icon: MapPin, title: 'Ubicación', value: APP.company.location, href: null },
  { icon: Clock, title: 'Tiempo de respuesta', value: 'Respondemos en menos de 24 horas', href: null },
]
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">
    <AppNavbar />

    <div class="bg-[#1c1d1f] text-white py-10">
      <div class="max-w-[1340px] mx-auto px-4">
        <h1 class="text-3xl font-extrabold">Contáctanos</h1>
        <p class="text-gray-400 text-sm mt-2">Crea un ticket de soporte o escríbenos directamente.</p>
      </div>
    </div>

    <div class="max-w-[1340px] mx-auto px-4 py-10">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div
          v-for="card in infoCards"
          :key="card.title"
          class="border border-[#d1d7dc] p-6 flex items-start gap-4"
        >
          <div class="w-10 h-10 bg-[#ede8f5] flex items-center justify-center flex-shrink-0">
            <component :is="card.icon" :size="18" class="text-[#5624d0]" />
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-[#6a6f73] mb-1">{{ card.title }}</p>
            <a v-if="card.href" :href="card.href" class="text-sm font-semibold text-[#5624d0] hover:underline">{{ card.value }}</a>
            <p v-else class="text-sm font-semibold text-[#1c1d1f]">{{ card.value }}</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <div class="flex-[3] min-w-0">
          <SupportTicketForm />
        </div>

        <div class="flex-1 min-w-0">
          <div class="border border-[#d1d7dc] p-6 bg-[#f7f9fa]">
            <h3 class="font-extrabold text-[#1c1d1f] mb-3">Centro de ayuda</h3>
            <p class="text-sm text-[#6a6f73] mb-4">
              Consulta preguntas frecuentes sobre cursos, pagos y soporte técnico.
            </p>
            <RouterLink to="/support" class="text-sm font-bold text-[#5624d0] hover:underline">
              Ir al centro de ayuda →
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
