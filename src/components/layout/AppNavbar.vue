<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Search, ChevronDown, Menu, X } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import AppLogo from '@/components/ui/AppLogo.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')
const mobileOpen = ref(false)

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
    mobileOpen.value = false
  }
}

function closeMobile() {
  mobileOpen.value = false
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-[#d1d7dc]">
    <div class="max-w-[1340px] mx-auto px-3 sm:px-4 h-[56px] flex items-center gap-2 sm:gap-3">
      <AppLogo class="flex-shrink-0" height="h-8" />

      <RouterLink
        to="/courses"
        class="hidden md:flex items-center gap-1 text-sm font-semibold text-[#1c1d1f] hover:text-[#5624d0] transition-colors whitespace-nowrap border border-[#1c1d1f] hover:border-[#5624d0] px-3 py-1.5"
      >
        {{ t('nav.explore') }} <ChevronDown :size="14" />
      </RouterLink>

      <form
        v-if="showSearch"
        @submit.prevent="searchCourses"
        class="hidden sm:flex flex-1 items-center border border-[#1c1d1f] overflow-hidden max-w-[520px] min-w-0"
      >
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="t('hero.search')"
          class="flex-1 min-w-0 px-3 sm:px-4 py-2 text-sm outline-none bg-white"
        />
        <button type="submit" class="bg-[#1c1d1f] px-3 sm:px-4 py-2 text-white hover:bg-[#3e4143] transition-colors flex items-center">
          <Search :size="15" />
        </button>
      </form>

      <div class="ml-auto flex items-center gap-1.5 sm:gap-2">
        <LanguageSwitcher class="hidden md:flex" />
        <template v-if="authStore.isAuthenticated">
          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="hidden md:block text-xs font-bold text-[#eb6a00] border border-[#eb6a00] px-2 py-1 hover:bg-orange-50 transition-colors"
          >
            Admin
          </RouterLink>
          <RouterLink
            to="/dashboard"
            class="text-xs sm:text-sm font-semibold text-[#5624d0] border border-[#5624d0] px-2.5 sm:px-3 py-1.5 hover:bg-[#f0ebff] transition-colors whitespace-nowrap"
          >
            {{ t('nav.myAccount') }}
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink
            to="/login"
            class="hidden sm:block text-sm font-semibold text-[#1c1d1f] border border-[#1c1d1f] px-3 py-1.5 hover:bg-[#f7f9fa] transition-colors"
          >
            {{ t('nav.login') }}
          </RouterLink>
          <RouterLink
            to="/register"
            class="text-xs sm:text-sm font-semibold text-white bg-[#5624d0] border border-[#5624d0] px-2.5 sm:px-3 py-1.5 hover:bg-[#3d1a9e] transition-colors whitespace-nowrap"
          >
            {{ t('nav.register') }}
          </RouterLink>
        </template>
        <button
          type="button"
          class="md:hidden p-2 text-[#1c1d1f] hover:bg-[#f7f9fa]"
          aria-label="Menú"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="mobileOpen"
      class="md:hidden border-t border-[#d1d7dc] bg-white px-4 py-4 space-y-3 shadow-lg"
    >
      <form v-if="showSearch" @submit.prevent="searchCourses" class="flex border border-[#1c1d1f] overflow-hidden">
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="t('hero.search')"
          class="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none"
        />
        <button type="submit" class="bg-[#1c1d1f] px-4 text-white">
          <Search :size="16" />
        </button>
      </form>
      <RouterLink to="/courses" class="block text-sm font-semibold py-2" @click="closeMobile">
        {{ t('nav.explore') }}
      </RouterLink>
      <RouterLink v-if="!authStore.isAuthenticated" to="/login" class="block text-sm font-semibold py-2" @click="closeMobile">
        {{ t('nav.login') }}
      </RouterLink>
      <div class="pt-2 border-t border-[#d1d7dc]">
        <LanguageSwitcher />
      </div>
    </div>
  </nav>
</template>
