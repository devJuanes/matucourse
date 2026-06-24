<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BookOpen, LogOut, CalendarDays, Lock, Headphones } from '@lucide/vue'
import AppLogo from '@/components/ui/AppLogo.vue'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (!authStore.sessionReady) {
    authStore.initSession()
  }
})

function logout() {
  authStore.logoutAndRedirect(router)
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fa] flex">

    <aside class="w-56 bg-[#1c1d1f] text-white fixed top-0 left-0 h-full flex flex-col z-40">
      <div class="px-5 py-4 border-b border-white/10">
        <AppLogo height="h-8" />
        <div class="mt-2 text-[10px] text-white/50 uppercase tracking-widest font-bold">Panel Admin</div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1">
        <RouterLink
          to="/dashboard"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          ← Volver al dashboard
        </RouterLink>
        <RouterLink
          to="/admin"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/10 text-white"
          exact-active-class="bg-white/10 text-white"
        >
          <BookOpen :size="16" /> Cursos
        </RouterLink>
        <RouterLink
          to="/admin/lessons"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/10 text-white"
        >
          <Lock :size="16" /> Lecciones C++
        </RouterLink>
        <RouterLink
          to="/admin/agenda"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/10 text-white"
        >
          <CalendarDays :size="16" /> Agenda
        </RouterLink>
        <RouterLink
          to="/admin/support"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/10 text-white"
        >
          <Headphones :size="16" /> Tickets PQR
        </RouterLink>
        <RouterLink
          to="/dashboard/chat"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/10 text-white"
        >
          Mensajes estudiantes
        </RouterLink>
      </nav>

      <div class="px-3 py-4 border-t border-white/10 space-y-2">
        <div class="px-3 py-2">
          <p class="text-xs font-bold text-white truncate">{{ authStore.user?.name ?? authStore.user?.email }}</p>
          <p class="text-[10px] text-white/50">Administrador</p>
        </div>
        <button
          @click="logout"
          class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut :size="16" /> Cerrar sesión
        </button>
      </div>
    </aside>

    <main class="ml-56 flex-1 min-h-screen">
      <RouterView />
    </main>
  </div>
</template>
