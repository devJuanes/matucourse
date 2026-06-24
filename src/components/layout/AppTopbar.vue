<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const titles: Record<string, string> = {
  dashboard: 'Mi Aprendizaje',
  'my-courses': 'Mis Cursos',
  agenda: 'Agenda',
  chat: 'Mensajes',
  'dashboard-support': 'Ayuda y Soporte',
  'course-learn': 'Mi Curso',
}

const pageTitle = () => titles[String(route.name)] ?? 'Dashboard'
</script>

<template>
  <header class="fixed top-0 left-60 right-0 h-[56px] bg-white border-b border-[#d1d7dc] flex items-center justify-between px-6 z-30">
    <h1 class="text-base font-bold text-[#1c1d1f]">{{ pageTitle() }}</h1>
    <div class="flex items-center gap-3">
      <RouterLink
        v-if="authStore.isAdmin"
        to="/admin"
        class="text-xs font-bold text-[#eb6a00] border border-[#eb6a00] px-3 py-1.5 hover:bg-orange-50 transition-colors"
      >
        Panel Admin
      </RouterLink>
      <span class="text-sm text-[#6a6f73]">
        Bienvenido,
        <span class="font-semibold text-[#1c1d1f]">{{ authStore.user?.name ?? authStore.user?.email }}</span>
      </span>
      <div class="w-8 h-8 bg-[#5624d0] flex items-center justify-center text-white font-semibold text-sm">
        {{ authStore.user?.name?.[0]?.toUpperCase() ?? authStore.user?.email?.[0]?.toUpperCase() ?? 'U' }}
      </div>
    </div>
  </header>
</template>
