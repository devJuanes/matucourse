<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  Globe, MapPin, ArrowRight, Star, Users,
  Database, CreditCard, BookOpen, Mail, Code2, Layers,
} from '@lucide/vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { APP } from '@/config/app'

const products = [
  { name: 'MatuCourse', icon: BookOpen, desc: 'Plataforma de cursos en vivo de programación, música y tecnología.', link: '/' },
  { name: 'MatuDB', icon: Database, desc: 'Motor de base de datos colombiano diseñado para aplicaciones empresariales.', link: 'https://matubyte.com' },
  { name: 'PayMatuByte', icon: CreditCard, desc: 'Pasarela de pagos integrada con PSE, Nequi y redes de tarjetas en Colombia.', link: 'https://matubyte.com' },
  { name: 'MatuCRM', icon: Layers, desc: 'Sistema CRM para gestión de clientes, ventas y pipelines de proyectos.', link: 'https://matubyte.com' },
  { name: 'MatuMailer', icon: Mail, desc: 'Servicio de envío masivo de correos transaccionales y marketing.', link: 'https://matubyte.com' },
]

const values = [
  { icon: Star, name: 'Calidad', desc: 'Cada producto y clase que ofrecemos pasa por estándares rigurosos antes de llegar al usuario.' },
  { icon: Code2, name: 'Innovación', desc: 'Construimos herramientas propias y adoptamos las mejores prácticas de la industria global.' },
  { icon: Globe, name: 'Accesibilidad', desc: 'Educación y software de calidad al alcance de cualquier persona, desde cualquier lugar.' },
  { icon: Users, name: 'Comunidad', desc: 'Creemos en el poder del aprendizaje colaborativo y el crecimiento conjunto.' },
]
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">
    <AppNavbar />

    <!-- Header -->
    <div class="bg-[#1c1d1f] text-white py-14">
      <div class="max-w-[1340px] mx-auto px-4">
        <h1 class="text-4xl font-extrabold mb-3">Quiénes Somos</h1>
        <p class="text-gray-400 text-base max-w-2xl">Conoce la empresa detrás de MatuCourse y la visión que nos mueve.</p>
      </div>
    </div>

    <!-- Mission -->
    <section class="py-12 border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <div class="max-w-3xl">
          <p class="text-xs font-bold uppercase tracking-wider text-[#5624d0] mb-3">Nuestra misión</p>
          <h2 class="text-2xl font-extrabold text-[#1c1d1f] mb-4 leading-tight">
            Democratizar la educación en programación y artes digitales en América Latina
          </h2>
          <p class="text-[#6a6f73] text-base leading-relaxed">
            Creemos que cada persona merece acceso a educación tecnológica de calidad, sin importar dónde esté. A través de clases en vivo,
            mentores reales y tecnología propia, llevamos conocimiento de clase mundial a estudiantes en Colombia, España, Estados Unidos y más.
          </p>
        </div>
      </div>
    </section>

    <!-- Company info -->
    <section class="py-12 bg-[#f7f9fa] border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-6">La empresa</h2>
        <div class="border border-[#d1d7dc] bg-white p-8 max-w-2xl">
          <div class="flex items-start gap-6">
            <div class="w-16 h-16 bg-[#5624d0] flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">MB</div>
            <div>
              <h3 class="text-xl font-extrabold text-[#1c1d1f]">{{ APP.company.name }}</h3>
              <div class="mt-3 space-y-2 text-sm text-[#6a6f73]">
                <p class="flex items-center gap-2"><MapPin :size="13" /> {{ APP.company.location }}, Colombia</p>
                <p class="flex items-center gap-2">
                  <Globe :size="13" />
                  <a :href="APP.company.website" target="_blank" class="text-[#5624d0] hover:underline font-semibold">matubyte.com</a>
                </p>
                <p class="flex items-center gap-2">
                  <Mail :size="13" />
                  <a :href="`mailto:${APP.company.email}`" class="text-[#5624d0] hover:underline font-semibold">{{ APP.company.email }}</a>
                </p>
                <p>Fundada en 2020 · NIT: 901.234.567-8</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Products -->
    <section class="py-12 border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-6">Nuestros productos</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            v-for="product in products"
            :key="product.name"
            :href="product.link"
            :target="product.link.startsWith('http') ? '_blank' : '_self'"
            class="border border-[#d1d7dc] p-6 hover:border-[#5624d0] hover:shadow-sm transition-all group">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 bg-[#ede8f5] flex items-center justify-center">
                <component :is="product.icon" :size="16" class="text-[#5624d0]" />
              </div>
              <h3 class="font-extrabold text-[#1c1d1f] group-hover:text-[#5624d0] transition-colors">{{ product.name }}</h3>
            </div>
            <p class="text-[#6a6f73] text-sm leading-relaxed">{{ product.desc }}</p>
          </a>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="py-12 bg-[#f7f9fa] border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-8">Nuestros valores</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="v in values" :key="v.name" class="text-center">
            <div class="w-12 h-12 bg-[#ede8f5] flex items-center justify-center mx-auto mb-3">
              <component :is="v.icon" :size="22" class="text-[#5624d0]" />
            </div>
            <h3 class="font-extrabold text-[#1c1d1f] mb-2">{{ v.name }}</h3>
            <p class="text-[#6a6f73] text-sm leading-relaxed">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="py-12 border-b border-[#d1d7dc]">
      <div class="max-w-[1340px] mx-auto px-4">
        <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-6">Equipo</h2>
        <div class="max-w-md">
          <div class="border border-[#d1d7dc] p-6 flex items-start gap-4">
            <div class="w-14 h-14 bg-[#5624d0] flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
              {{ APP.instructor.initials }}
            </div>
            <div class="flex-1">
              <h3 class="font-extrabold text-[#1c1d1f]">{{ APP.instructor.name }}</h3>
              <p class="text-[#5624d0] text-sm font-semibold mb-1">{{ APP.instructor.title }} · Fundador</p>
              <p class="text-[#6a6f73] text-xs leading-relaxed mb-3">{{ APP.instructor.bio }}</p>
              <RouterLink to="/instructor"
                class="inline-flex items-center gap-1.5 border border-[#5624d0] text-[#5624d0] font-bold text-xs px-4 py-1.5 hover:bg-[#5624d0] hover:text-white transition-colors">
                Ver perfil completo <ArrowRight :size="12" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
