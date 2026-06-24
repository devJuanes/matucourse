<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { RouterView } from 'vue-router'
import { useSidebar } from '@/composables/useSidebar'

const { sidebarOpen, closeSidebar } = useSidebar()
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fa] overflow-x-hidden">
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/40 z-30 lg:hidden"
      aria-hidden="true"
      @click="closeSidebar()"
    />
    <AppSidebar />
    <AppTopbar />
    <main class="pt-[56px] min-h-screen p-4 md:p-6 lg:p-8 lg:ml-60 transition-[margin]">
      <RouterView />
    </main>
  </div>
</template>
