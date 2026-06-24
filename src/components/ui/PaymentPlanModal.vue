<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Check, CreditCard, Calendar, ShieldCheck } from '@lucide/vue'
import type { Course, PaymentPlan } from '@/services'

const INSTALLMENT_SURCHARGE = 0.20

const props = defineProps<{
  course: Course
  currency: 'COP' | 'USD' | 'EUR'
}>()

const emit = defineEmits<{
  confirm: [plan: PaymentPlan, amount: number]
  close: []
}>()

const selected = ref<PaymentPlan>('full')

const basePrice = computed(() => props.course.price[props.currency])
const installmentsTotal = computed(() => Math.round(basePrice.value * (1 + INSTALLMENT_SURCHARGE)))
const firstInstallment = computed(() => Math.round(installmentsTotal.value / 2))
const surchargeLabel = computed(() => `${Math.round(INSTALLMENT_SURCHARGE * 100)}%`)

const secondDueDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 15)
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
})

function fmt(amount: number) {
  if (props.currency === 'COP') return `$${amount.toLocaleString('es-CO')}`
  if (props.currency === 'USD') return `$${amount}`
  return `€${amount}`
}

function confirm() {
  const amount = selected.value === 'full' ? basePrice.value : firstInstallment.value
  emit('confirm', selected.value, amount)
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white w-full max-w-md shadow-2xl">

      <!-- Header -->
      <div class="border-b border-[#d1d7dc] p-5 flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-extrabold text-[#1c1d1f]">Elige tu plan de pago</h2>
          <p class="text-sm text-[#6a6f73] mt-0.5 truncate">{{ course.title }}</p>
        </div>
        <button @click="emit('close')" class="text-[#6a6f73] hover:text-[#1c1d1f] p-1 flex-shrink-0 mt-0.5">
          <X :size="18" />
        </button>
      </div>

      <!-- Plan options -->
      <div class="p-5 space-y-3">

        <!-- Un solo pago -->
        <button
          @click="selected = 'full'"
          :class="selected === 'full'
            ? 'border-[#5624d0] bg-[#f8f5ff]'
            : 'border-[#d1d7dc] hover:border-[#5624d0]'"
          class="w-full border-2 p-4 text-left transition-all"
        >
          <div class="flex items-start gap-3">
            <div
              :class="selected === 'full'
                ? 'bg-[#5624d0] border-[#5624d0]'
                : 'border-[#d1d7dc]'"
              class="w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
            >
              <Check v-if="selected === 'full'" :size="11" class="text-white" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="font-bold text-[#1c1d1f]">Un solo pago</span>
                <span class="text-2xl font-extrabold text-[#5624d0]">{{ fmt(basePrice) }}</span>
              </div>
              <p class="text-xs text-[#6a6f73] mt-1.5 flex items-center gap-1.5">
                <CreditCard :size="12" class="flex-shrink-0" />
                Sin recargo · Pago único hoy
              </p>
            </div>
          </div>
        </button>

        <!-- Dos cuotas -->
        <button
          @click="selected = 'installments'"
          :class="selected === 'installments'
            ? 'border-[#5624d0] bg-[#f8f5ff]'
            : 'border-[#d1d7dc] hover:border-[#5624d0]'"
          class="w-full border-2 p-4 text-left transition-all"
        >
          <div class="flex items-start gap-3">
            <div
              :class="selected === 'installments'
                ? 'bg-[#5624d0] border-[#5624d0]'
                : 'border-[#d1d7dc]'"
              class="w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
            >
              <Check v-if="selected === 'installments'" :size="11" class="text-white" />
            </div>
            <div class="flex-1">
              <div class="flex items-start justify-between gap-2">
                <span class="font-bold text-[#1c1d1f]">Dos cuotas</span>
                <div class="text-right">
                  <div class="text-2xl font-extrabold text-[#1c1d1f] leading-tight">
                    2 × {{ fmt(firstInstallment) }}
                  </div>
                  <div class="text-xs text-[#6a6f73]">Total: {{ fmt(installmentsTotal) }}</div>
                </div>
              </div>
              <div class="text-xs text-[#6a6f73] mt-1.5 space-y-1">
                <p class="flex items-center gap-1.5">
                  <CreditCard :size="12" class="flex-shrink-0" />
                  Primera cuota hoy: {{ fmt(firstInstallment) }}
                </p>
                <p class="flex items-center gap-1.5">
                  <Calendar :size="12" class="flex-shrink-0" />
                  Segunda cuota el {{ secondDueDate }}: {{ fmt(firstInstallment) }}
                </p>
                <p class="text-[#eb6a00] font-semibold mt-1">
                  Incluye recargo del {{ surchargeLabel }} por pago en cuotas
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>

      <!-- CTA -->
      <div class="border-t border-[#d1d7dc] p-5">
        <button
          @click="confirm"
          class="w-full bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold py-3 text-sm transition-colors"
        >
          {{ selected === 'full' ? `Pagar ${fmt(basePrice)}` : `Pagar primera cuota ${fmt(firstInstallment)}` }}
        </button>
        <p class="text-xs text-[#6a6f73] text-center mt-3 flex items-center justify-center gap-1">
          <ShieldCheck :size="12" class="text-green-600" />
          30 días de garantía de satisfacción
        </p>
      </div>
    </div>
  </div>
</template>
