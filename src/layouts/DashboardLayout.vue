<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fa]">
    <AppSidebar />
    <AppTopbar />
    <main class="ml-60 pt-[56px] p-8 min-h-screen">
      <RouterView />
    </main>
  </div>
</template>
