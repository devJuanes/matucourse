<script setup lang="ts">
import { useCurrency } from '@/composables/useCurrency'

const props = defineProps<{
  prices: { COP: number; USD: number; EUR: number }
  size?: 'sm' | 'md' | 'lg'
}>()

const { formatPrice } = useCurrency()
</script>

<template>
  <span
    class="font-bold text-[#1c1d1f]"
    :class="{
      'text-sm': props.size === 'sm',
      'text-base': !props.size || props.size === 'md',
      'text-2xl': props.size === 'lg',
    }"
  >
    {{ formatPrice(prices) }}
  </span>
</template>
