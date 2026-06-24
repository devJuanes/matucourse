<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BookOpen, LogOut, CalendarDays, Lock, Headphones, Menu } from '@lucide/vue'
import AppLogo from '@/components/ui/AppLogo.vue'

const authStore = useAuthStore()
const router = useRouter()
const adminOpen = ref(false)

onMounted(() => {
  if (!authStore.sessionReady) {
    authStore.initSession()
  }
})

function logout() {
  authStore.logoutAndRedirect(router)
}

function closeAdmin() {
  adminOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fa] overflow-x-hidden flex flex-col lg:flex-row">
    <div
      v-if="adminOpen"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="closeAdmin()"
    />

    <!-- Mobile header -->
    <header class="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#1c1d1f] border-b border-white/10 flex items-center justify-between px-4 z-40">
      <AppLogo height="h-7" />
      <button type="button" class="text-white p-2" aria-label="Menú admin" @click="adminOpen = !adminOpen">
        <Menu :size="22" />
      </button>
    </header>

    <aside
      :class="[
        'bg-[#1c1d1f] text-white fixed top-0 left-0 h-full flex flex-col z-40 w-[min(280px,88vw)] transition-transform duration-200',
        'lg:translate-x-0 lg:w-56 lg:relative lg:flex-shrink-0',
        adminOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="px-5 py-4 border-b border-white/10 hidden lg:block">
        <AppLogo height="h-8" />
        <div class="mt-2 text-[10px] text-white/50 uppercase tracking-widest font-bold">Panel Admin</div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto lg:pt-4 pt-16">
        <RouterLink
          to="/dashboard"
          @click="closeAdmin"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          ← Volver al dashboard
        </RouterLink>
        <RouterLink
          to="/admin"
          @click="closeAdmin"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/10 text-white"
          exact-active-class="bg-white/10 text-white"
        >
          <BookOpen :size="16" /> Cursos
        </RouterLink>
        <RouterLink
          to="/admin/lessons"
          @click="closeAdmin"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/10 text-white"
        >
          <Lock :size="16" /> Lecciones C++
        </RouterLink>
        <RouterLink
          to="/admin/agenda"
          @click="closeAdmin"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/10 text-white"
        >
          <CalendarDays :size="16" /> Agenda
        </RouterLink>
        <RouterLink
          to="/admin/support"
          @click="closeAdmin"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/10 text-white"
        >
          <Headphones :size="16" /> Tickets PQR
        </RouterLink>
        <RouterLink
          to="/dashboard/chat"
          @click="closeAdmin"
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
          type="button"
          @click="logout"
          class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut :size="16" /> Cerrar sesión
        </button>
      </div>
    </aside>

    <main class="flex-1 min-h-screen pt-14 lg:pt-0 lg:ml-0 p-4 md:p-6 lg:p-8 min-w-0">
      <RouterView />
    </main>
  </div>
</template>
