<script setup lang="ts">
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { APP } from '@/config/app'
import { BookOpen, Library, CalendarDays, Compass, LogOut, MessageCircle, Settings, Headphones } from '@lucide/vue'
import AppLogo from '@/components/ui/AppLogo.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { to: '/dashboard', name: 'dashboard', label: 'Mi Aprendizaje', icon: BookOpen },
  { to: '/dashboard/my-courses', name: 'my-courses', label: 'Mis Cursos', icon: Library },
  { to: '/dashboard/agenda', name: 'agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/dashboard/chat', name: 'chat', label: 'Mensajes', icon: MessageCircle },
  { to: '/dashboard/support', name: 'dashboard-support', label: 'Ayuda y Soporte', icon: Headphones },
]

function isActive(itemName: string) {
  return route.name === itemName
}

function logout() {
  authStore.logoutAndRedirect(router)
}
</script>

<template>
  <aside class="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-[#d1d7dc] flex flex-col z-40">
    <!-- Logo -->
    <div class="h-[56px] border-b border-[#d1d7dc] flex items-center px-4">
      <div class="flex items-center gap-2">
        <AppLogo height="h-8" />
        <div class="leading-tight hidden min-[1200px]:block">
          <div class="text-[10px] text-[#6a6f73]">{{ APP.company.name }}</div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-4">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors"
        :class="isActive(item.name)
          ? 'border-l-4 border-[#1c1d1f] pl-3 text-[#1c1d1f] bg-[#f7f9fa]'
          : 'border-l-4 border-transparent pl-3 text-[#6a6f73] hover:text-[#1c1d1f] hover:bg-[#f7f9fa]'"
      >
        <component :is="item.icon" :size="16" />
        {{ item.label }}
      </RouterLink>

      <div class="mx-4 my-3 border-t border-[#d1d7dc]"></div>

      <RouterLink
        to="/courses"
        class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold border-l-4 border-transparent pl-3 text-[#6a6f73] hover:text-[#5624d0] hover:bg-[#f7f9fa] transition-colors"
      >
        <Compass :size="16" />
        Explorar Cursos
      </RouterLink>

      <RouterLink
        v-if="authStore.isAdmin"
        to="/admin"
        class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold border-l-4 border-transparent pl-3 text-[#eb6a00] hover:bg-orange-50 transition-colors mt-1"
      >
        <Settings :size="16" />
        Panel Admin
      </RouterLink>
    </nav>

    <!-- User + Logout -->
    <div class="border-t border-[#d1d7dc] p-4">
      <div class="flex items-center gap-2.5 mb-3">
        <div class="w-8 h-8 bg-[#5624d0] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {{ authStore.user?.name?.[0]?.toUpperCase() ?? authStore.user?.email?.[0]?.toUpperCase() ?? 'U' }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-[#1c1d1f] truncate">
            {{ authStore.user?.name?.split(' ')[0] ?? authStore.user?.email }}
          </div>
          <div class="text-[10px] text-[#6a6f73]">
            {{ authStore.isAdmin ? 'Administrador' : 'Estudiante' }}
          </div>
        </div>
      </div>
      <button
        class="w-full text-left text-xs font-semibold text-[#6a6f73] hover:text-[#1c1d1f] transition-colors py-1.5 flex items-center gap-2"
        @click="logout()"
      >
        <LogOut :size="13" /> Cerrar Sesión
      </button>
    </div>
  </aside>
</template>
