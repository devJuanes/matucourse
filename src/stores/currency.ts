import { defineStore } from 'pinia'

export type Currency = 'COP' | 'USD' | 'EUR'

export const useCurrencyStore = defineStore('currency', {
  state: () => ({ selected: 'COP' as Currency }),
  actions: {
    setCurrency(c: Currency) {
      this.selected = c
    },
  },
})
