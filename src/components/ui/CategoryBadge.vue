<script setup lang="ts">
defineProps<{ category: string }>()

const styles: Record<string, string> = {
  'Programación':       'bg-[#ede8f5] text-[#5624d0]',
  'Producción Musical': 'bg-[#fef3e2] text-[#92400e]',
  'Piano':              'bg-[#ecfdf5] text-[#065f46]',
}
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
    :class="styles[category] ?? 'bg-[#f7f9fa] text-[#6a6f73]'"
  >
    {{ category }}
  </span>
</template>
