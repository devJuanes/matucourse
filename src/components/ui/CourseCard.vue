<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useCurrencyStore } from '@/stores/currency'
import { Star, Radio } from '@lucide/vue'
import type { Course, CoursePrice } from '@/stores/cart'

const props = defineProps<{ course: Course; featured?: boolean }>()
const currencyStore = useCurrencyStore()

function formatPrice(prices: CoursePrice, currency: string) {
  const amount = prices[currency as keyof CoursePrice]
  if (!amount) return ''
  if (currency === 'COP') return `$${amount.toLocaleString('es-CO')} COP`
  if (currency === 'USD') return `$${amount} USD`
  if (currency === 'EUR') return `€${amount}`
  return String(amount)
}

const ratings: Record<string, { stars: number; count: string }> = {
  'cpp-fundamentals':    { stars: 4.7, count: '2,341' },
  'fl-studio-producer':  { stars: 4.8, count: '1,892' },
  'piano-desde-cero':    { stars: 4.6, count: '987'   },
  'arduino-iot':         { stars: 4.7, count: '1,205' },
  'python-data-science': { stars: 4.9, count: '3,102' },
  'web-fullstack':       { stars: 4.8, count: '4,567' },
}

function getRating(id: string) {
  return ratings[id] ?? { stars: 4.5, count: '500' }
}
</script>

<template>
  <RouterLink :to="`/courses/${course.id}`" class="block">
    <div class="border border-[#d1d7dc] bg-white hover:shadow-[0_2px_16px_rgba(0,0,0,0.18)] hover:border-transparent transition-all duration-150 flex flex-col h-full cursor-pointer">
      <!-- Thumbnail -->
      <div class="relative overflow-hidden" style="height:180px">
        <img :src="course.thumbnail" :alt="course.title" class="w-full h-full object-cover" />
        <span v-if="course.modality === 'En Vivo'"
          class="absolute top-2 left-2 bg-[#eb6a00] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide flex items-center gap-1">
          <Radio :size="10" /> EN VIVO
        </span>
      </div>

      <!-- Body -->
      <div class="p-3 flex flex-col flex-1">
        <h3 class="font-bold text-[#1c1d1f] text-sm leading-snug line-clamp-2 mb-1">{{ course.title }}</h3>
        <p class="text-[#6a6f73] text-xs mb-1">{{ course.instructor }}</p>
        <p class="text-[#6a6f73] text-xs mb-2">{{ course.level }}</p>

        <!-- Stars -->
        <div class="flex items-center gap-1 mb-2">
          <span class="text-xs font-bold text-[#b4690e]">{{ getRating(course.id).stars }}</span>
          <div class="flex">
            <Star
              v-for="i in 5" :key="i"
              :size="11"
              :class="i <= Math.round(getRating(course.id).stars) ? 'text-[#f4c430] fill-[#f4c430]' : 'text-[#d1d7dc]'"
            />
          </div>
          <span class="text-[#6a6f73] text-xs">({{ getRating(course.id).count }})</span>
        </div>

        <!-- Price + badge -->
        <div class="mt-auto flex items-center gap-2">
          <span class="text-base font-bold text-[#1c1d1f]">
            {{ formatPrice(course.price, currencyStore.selected) }}
          </span>
          <span v-if="featured"
            class="text-[10px] font-bold bg-[#eceb98] text-[#3d3c0a] px-1.5 py-0.5">
            Bestseller
          </span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
