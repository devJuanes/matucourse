<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Mail, MapPin, Globe, ExternalLink } from '@lucide/vue'
import { APP } from '@/config/app'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import AppLogo from '@/components/ui/AppLogo.vue'
import coursesData from '@/data/courses.json'

const { t } = useI18n()
const categories = coursesData.categories
</script>

<template>
  <footer class="bg-[#1c1d1f] border-t border-[#3e4143] text-gray-400">
    <div class="max-w-[1340px] mx-auto px-4 pt-8 sm:pt-12 pb-6 sm:pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 sm:gap-8">

      <!-- Brand column -->
      <div class="col-span-2 md:col-span-2">
        <AppLogo height="h-10" class="mb-3" />
        <p class="text-xs text-gray-400 leading-relaxed mb-4 max-w-xs">
          {{ APP.tagline }}. Una plataforma de
          <a :href="APP.company.website" target="_blank" rel="noopener noreferrer" class="text-[#c0a8ff] hover:text-white transition-colors font-semibold">
            {{ APP.company.name }}
          </a>.
        </p>
        <div class="flex flex-col gap-1.5 text-xs">
          <a :href="`mailto:${APP.company.email}`" class="flex items-center gap-2 hover:text-white transition-colors">
            <Mail :size="12" /> {{ APP.company.email }}
          </a>
          <span class="flex items-center gap-2">
            <MapPin :size="12" /> {{ APP.company.location }}
          </span>
          <a :href="APP.company.website" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-white transition-colors">
            <Globe :size="12" /> matubyte.com
          </a>
        </div>
      </div>

      <!-- MatuCourse -->
      <div>
        <h4 class="text-white font-bold mb-4 text-sm">{{ APP.name }}</h4>
        <ul class="space-y-2.5 text-xs">
          <li><RouterLink to="/courses" class="hover:text-white transition-colors">Todos los cursos</RouterLink></li>
          <li><RouterLink to="/register" class="hover:text-white transition-colors">Registrarse gratis</RouterLink></li>
          <li><RouterLink to="/login" class="hover:text-white transition-colors">Iniciar sesión</RouterLink></li>
        </ul>
      </div>

      <!-- Categorías -->
      <div>
        <h4 class="text-white font-bold mb-4 text-sm">Categorías</h4>
        <ul class="space-y-2.5 text-xs">
          <li v-for="cat in categories" :key="cat">
            <RouterLink :to="`/courses?category=${encodeURIComponent(cat)}`" class="hover:text-white transition-colors">
              {{ cat }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Comunidad -->
      <div>
        <h4 class="text-white font-bold mb-4 text-sm">Comunidad</h4>
        <ul class="space-y-2.5 text-xs">
          <li><RouterLink to="/blog" class="hover:text-white transition-colors">Blog</RouterLink></li>
          <li><RouterLink to="/support" class="hover:text-white transition-colors">Soporte</RouterLink></li>
          <li><RouterLink to="/instructor" class="hover:text-white transition-colors">Instructor</RouterLink></li>
        </ul>
      </div>

      <!-- Empresa -->
      <div>
        <h4 class="text-white font-bold mb-4 text-sm">Empresa</h4>
        <ul class="space-y-2.5 text-xs">
          <li><RouterLink to="/about" class="hover:text-white transition-colors">Quiénes Somos</RouterLink></li>
          <li><RouterLink to="/jobs" class="hover:text-white transition-colors">Trabaja con Nosotros</RouterLink></li>
          <li><RouterLink to="/privacy" class="hover:text-white transition-colors">Política de Privacidad</RouterLink></li>
          <li><RouterLink to="/contact" class="hover:text-white transition-colors">Contacto</RouterLink></li>
          <li>
            <a :href="APP.company.website" target="_blank" rel="noopener noreferrer"
              class="hover:text-white transition-colors flex items-center gap-1.5">
              {{ APP.company.name }} <ExternalLink :size="10" />
            </a>
          </li>
          <li>
            <a :href="APP.instructor.website" target="_blank" rel="noopener noreferrer"
              class="hover:text-white transition-colors flex items-center gap-1.5">
              devjuanes.com <ExternalLink :size="10" />
            </a>
          </li>
        </ul>
      </div>

    </div>

    <!-- Bottom bar -->
    <div class="border-t border-[#3e4143]">
      <div class="max-w-[1340px] mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span class="text-xs text-gray-500">
          © {{ new Date().getFullYear() }} {{ APP.company.name }} — {{ t('footer.rights') }}.
          {{ t('footer.product') }}
          <a :href="APP.company.website" target="_blank" rel="noopener noreferrer" class="text-[#c0a8ff] hover:text-white transition-colors">
            {{ APP.company.name }}
          </a>.
        </span>
        <LanguageSwitcher />
      </div>
    </div>
  </footer>
</template>
