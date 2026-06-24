<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Search, ChevronDown } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import AppLogo from '@/components/ui/AppLogo.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')

const props = withDefaults(defineProps<{
  showSearch?: boolean
  showCategories?: boolean
}>(), {
  showSearch: false,
  showCategories: false,
})

function searchCourses() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/courses', query: { q: searchQuery.value } })
  }
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-[#d1d7dc] h-[56px]">
    <div class="max-w-[1340px] mx-auto px-4 h-full flex items-center gap-3">

      <AppLogo class="mr-2" />

      <RouterLink
        to="/courses"
        class="hidden md:flex items-center gap-1 text-sm font-semibold text-[#1c1d1f] hover:text-[#5624d0] transition-colors whitespace-nowrap border border-[#1c1d1f] hover:border-[#5624d0] px-3 py-1.5">
        {{ t('nav.explore') }} <ChevronDown :size="14" />
      </RouterLink>

      <form
        v-if="showSearch"
        @submit.prevent="searchCourses"
        class="flex-1 flex items-center border border-[#1c1d1f] overflow-hidden max-w-[520px]">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('hero.search')"
          class="flex-1 px-4 py-2 text-sm outline-none bg-white"
        />
        <button type="submit" class="bg-[#1c1d1f] px-4 py-2 text-white hover:bg-[#3e4143] transition-colors flex items-center">
          <Search :size="15" />
        </button>
      </form>

      <div class="ml-auto flex items-center gap-2">
        <LanguageSwitcher class="hidden md:flex" />
        <template v-if="authStore.isAuthenticated">
          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="hidden md:block text-xs font-bold text-[#eb6a00] border border-[#eb6a00] px-2 py-1 hover:bg-orange-50 transition-colors">
            Admin
          </RouterLink>
          <RouterLink
            to="/dashboard"
            class="text-sm font-semibold text-[#5624d0] border border-[#5624d0] px-3 py-1.5 hover:bg-[#f0ebff] transition-colors">
            {{ t('nav.myAccount') }}
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink
            to="/login"
            class="hidden md:block text-sm font-semibold text-[#1c1d1f] border border-[#1c1d1f] px-3 py-1.5 hover:bg-[#f7f9fa] transition-colors">
            {{ t('nav.login') }}
          </RouterLink>
          <RouterLink
            to="/register"
            class="text-sm font-semibold text-white bg-[#5624d0] border border-[#5624d0] px-3 py-1.5 hover:bg-[#3d1a9e] transition-colors">
            {{ t('nav.register') }}
          </RouterLink>
        </template>
      </div>
    </div>
  </nav>
</template>
