<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const langs = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
]
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="lang in langs"
      :key="lang.code"
      @click="locale = lang.code"
      :class="locale === lang.code
        ? 'bg-[#5624d0] text-white border-[#5624d0]'
        : 'bg-transparent text-[#6a6f73] border-[#d1d7dc] hover:border-[#5624d0] hover:text-[#5624d0]'"
      class="text-[10px] font-bold border px-1.5 py-0.5 transition-colors">
      {{ lang.label }}
    </button>
  </div>
</template>
