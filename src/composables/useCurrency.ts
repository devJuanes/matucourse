import { useCurrencyStore, type Currency } from '@/stores/currency'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export function useCurrency() {
  const store = useCurrencyStore()
  const { selected } = storeToRefs(store)

  function formatPrice(prices: { COP: number; USD: number; EUR: number }, currency?: Currency) {
    const cur = currency ?? selected.value
    const amount = prices[cur]
    if (cur === 'COP') {
      return '$' + amount.toLocaleString('es-CO')
    }
    if (cur === 'USD') {
      return '$' + amount.toLocaleString('en-US')
    }
    if (cur === 'EUR') {
      return '€' + amount.toLocaleString('de-DE')
    }
    return String(amount)
  }

  const currencySymbol = computed(() => {
    if (selected.value === 'EUR') return '€'
    return '$'
  })

  return {
    selected,
    setCurrency: store.setCurrency,
    formatPrice,
    currencySymbol,
  }
}
