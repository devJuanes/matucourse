<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { APP } from '@/config/app'

const props = withDefaults(
  defineProps<{
    to?: string | null
    height?: string
  }>(),
  {
    to: '/',
    height: 'h-9',
  },
)
</script>

<template>
  <RouterLink v-if="props.to" :to="props.to" class="flex-shrink-0 inline-flex items-center">
    <img :src="APP.logo" :alt="APP.name" :class="[props.height, 'w-auto object-contain']" />
  </RouterLink>
  <span v-else class="flex-shrink-0 inline-flex items-center">
    <img :src="APP.logo" :alt="APP.name" :class="[props.height, 'w-auto object-contain']" />
  </span>
</template>
