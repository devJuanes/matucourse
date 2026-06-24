<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Clock, User, Tag, BookOpen, ArrowRight } from '@lucide/vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import blogData from '@/data/blog.json'

const allPosts = blogData.posts
const featuredPosts = allPosts.filter(p => p.featured)
const regularPosts = computed(() =>
  selectedCategory.value === 'Todos'
    ? allPosts.filter(p => !p.featured)
    : allPosts.filter(p => !p.featured && p.category === selectedCategory.value)
)

const categories = ['Todos', ...Array.from(new Set(allPosts.map(p => p.category)))]
const selectedCategory = ref('Todos')

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">
    <AppNavbar />

    <!-- Dark hero header -->
    <div class="bg-[#1c1d1f] text-white py-14">
      <div class="max-w-[1340px] mx-auto px-4">
        <p class="text-xs font-bold uppercase tracking-wider text-[#cec0fc] mb-2">Contenido editorial</p>
        <h1 class="text-4xl font-extrabold mb-2">Blog</h1>
        <p class="text-gray-400 text-base">Artículos sobre carreras, tecnología y música</p>
      </div>
    </div>

    <!-- Category filter pills -->
    <div class="border-b border-[#d1d7dc] bg-[#f7f9fa]">
      <div class="max-w-[1340px] mx-auto px-4 py-3 flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="selectedCategory === cat
            ? 'bg-[#5624d0] text-white border-[#5624d0]'
            : 'bg-white text-[#1c1d1f] border-[#d1d7dc] hover:border-[#5624d0] hover:text-[#5624d0]'"
          class="border px-4 py-1.5 text-sm font-semibold transition-colors">
          {{ cat }}
        </button>
      </div>
    </div>

    <div class="max-w-[1340px] mx-auto px-4 py-10">

      <!-- Featured posts hero -->
      <template v-if="selectedCategory === 'Todos'">
        <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-6">Artículos destacados</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <RouterLink
            v-for="post in featuredPosts"
            :key="post.id"
            :to="`/blog/${post.id}`"
            class="group border border-[#d1d7dc] overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div class="relative h-52 overflow-hidden">
              <img
                :src="post.image"
                :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span class="absolute top-3 left-3 bg-[#5624d0] text-white text-xs font-bold px-2 py-1">
                {{ post.category }}
              </span>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <h3 class="font-extrabold text-[#1c1d1f] text-lg mb-2 group-hover:text-[#5624d0] transition-colors leading-snug">
                {{ post.title }}
              </h3>
              <p class="text-[#6a6f73] text-sm leading-relaxed mb-4 flex-1">{{ post.excerpt }}</p>
              <div class="flex items-center gap-4 text-xs text-[#6a6f73]">
                <span class="flex items-center gap-1"><User :size="11" /> {{ post.author }}</span>
                <span class="flex items-center gap-1"><Clock :size="11" /> {{ post.readTime }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </template>

      <!-- Regular posts grid -->
      <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-6">
        {{ selectedCategory === 'Todos' ? 'Más artículos' : selectedCategory }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="post in regularPosts"
          :key="post.id"
          :to="`/blog/${post.id}`"
          class="group border border-[#d1d7dc] overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <div class="relative h-44 overflow-hidden">
            <img
              :src="post.image"
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span class="absolute top-2 left-2 bg-white border border-[#d1d7dc] text-[#5624d0] text-xs font-bold px-2 py-0.5 flex items-center gap-1">
              <Tag :size="10" /> {{ post.category }}
            </span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <h3 class="font-extrabold text-[#1c1d1f] text-sm mb-2 group-hover:text-[#5624d0] transition-colors leading-snug">
              {{ post.title }}
            </h3>
            <p class="text-[#6a6f73] text-xs leading-relaxed mb-3 flex-1">{{ post.excerpt }}</p>
            <div class="flex items-center gap-3 text-xs text-[#6a6f73]">
              <span class="flex items-center gap-1"><Clock :size="10" /> {{ post.readTime }}</span>
              <span>{{ formatDate(post.date) }}</span>
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-if="regularPosts.length === 0" class="text-center py-16">
        <BookOpen :size="32" class="mx-auto text-[#d1d7dc] mb-3" />
        <p class="text-[#6a6f73]">No hay artículos en esta categoría aún.</p>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
