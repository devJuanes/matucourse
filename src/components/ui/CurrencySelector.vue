<script setup lang="ts">
import { useCurrencyStore, type Currency } from '@/stores/currency'
import { storeToRefs } from 'pinia'

const store = useCurrencyStore()
const { selected } = storeToRefs(store)
const currencies: Currency[] = ['COP', 'USD', 'EUR']
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <button
      v-for="cur in currencies"
      :key="cur"
      class="text-xs font-bold px-2 py-1 border transition-colors"
      :class="selected === cur
        ? 'bg-[#5624d0] text-white border-[#5624d0]'
        : 'bg-white text-[#1c1d1f] border-[#d1d7dc] hover:border-[#1c1d1f]'"
      @click="store.setCurrency(cur)"
    >
      {{ cur }}
    </button>
  </div>
</template>
