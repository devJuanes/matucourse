<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Menu } from '@lucide/vue'
import { useSidebar } from '@/composables/useSidebar'

const route = useRoute()
const authStore = useAuthStore()
const { toggleSidebar } = useSidebar()

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
  <header class="fixed top-0 left-0 lg:left-60 right-0 h-[56px] bg-white border-b border-[#d1d7dc] flex items-center justify-between gap-2 px-3 sm:px-6 z-30">
    <div class="flex items-center gap-2 min-w-0 flex-1">
      <button
        type="button"
        class="lg:hidden p-2 -ml-1 text-[#1c1d1f] hover:bg-[#f7f9fa] border border-transparent hover:border-[#d1d7dc]"
        aria-label="Abrir menú"
        @click="toggleSidebar()"
      >
        <Menu :size="20" />
      </button>
      <h1 class="text-sm sm:text-base font-bold text-[#1c1d1f] truncate">{{ pageTitle() }}</h1>
    </div>
    <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      <RouterLink
        v-if="authStore.isAdmin"
        to="/admin"
        class="hidden sm:inline text-xs font-bold text-[#eb6a00] border border-[#eb6a00] px-2 py-1 hover:bg-orange-50 transition-colors"
      >
        Admin
      </RouterLink>
      <span class="hidden md:inline text-sm text-[#6a6f73] max-w-[140px] lg:max-w-none truncate">
        <span class="font-semibold text-[#1c1d1f]">{{ authStore.user?.name ?? authStore.user?.email }}</span>
      </span>
      <div class="w-8 h-8 bg-[#5624d0] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
        {{ authStore.user?.name?.[0]?.toUpperCase() ?? authStore.user?.email?.[0]?.toUpperCase() ?? 'U' }}
      </div>
    </div>
  </header>
</template>
