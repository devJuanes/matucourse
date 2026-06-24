<script setup lang="ts">
import { ref } from 'vue'
import { MapPin, Clock, CheckCircle, Briefcase, ArrowDown } from '@lucide/vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { APP } from '@/config/app'

interface Position {
  id: string
  title: string
  type: string
  location: string
  description: string
  requirements: string[]
}

const positions: Position[] = [
  {
    id: 'instructor-tutor',
    title: 'Instructor / Tutor Online',
    type: 'Part-time · Remoto',
    location: 'Remoto (cualquier país hispanohablante)',
    description: 'Buscamos instructores apasionados por la enseñanza para impartir clases en vivo en MatuCourse. Ideal para desarrolladores, músicos o artistas digitales con experiencia probada y vocación pedagógica.',
    requirements: [
      'Experiencia mínima de 3 años en el área que deseas enseñar',
      'Habilidades de comunicación y pedagogía claras',
      'Disponibilidad para al menos 4 horas semanales de clases',
      'Conexión a internet estable y equipo de audio/video adecuado',
    ],
  },
  {
    id: 'fullstack-junior',
    title: 'Desarrollador Full-Stack Junior',
    type: 'Proyecto · Remoto',
    location: 'Remoto — Colombia preferido',
    description: 'Apoya el desarrollo de nuevas funcionalidades para MatuCourse y otros productos de MatuByte. Trabajarás con Vue.js, Node.js, PostgreSQL y las herramientas internas de MatuByte.',
    requirements: [
      'Conocimientos de Vue.js o React y Node.js/Express',
      'Familiaridad con bases de datos relacionales (PostgreSQL, MySQL)',
      'Portafolio con al menos 2 proyectos personales o profesionales',
      'Capacidad de trabajo autónomo y comunicación proactiva',
    ],
  },
  {
    id: 'community-manager',
    title: 'Community Manager',
    type: 'Part-time · Remoto',
    location: 'Remoto',
    description: 'Gestiona la presencia de MatuCourse en redes sociales, crea contenido de valor para la comunidad y apoya la estrategia de marketing de contenidos. Buscamos alguien con pasión por la educación y la tecnología.',
    requirements: [
      'Experiencia manejando cuentas de Instagram, LinkedIn y YouTube',
      'Habilidad para crear contenido visual y escrito (Canva, Figma o similar)',
      'Interés genuino por la tecnología, programación o música',
      'Buena redacción en español (inglés es un plus)',
    ],
  },
]

const selectedPosition = ref('')
const form = ref({
  name: '',
  email: '',
  position: '',
  portfolio: '',
  about: '',
})
const submitted = ref(false)
const submitting = ref(false)

function applyFor(positionId: string) {
  selectedPosition.value = positionId
  form.value.position = positionId
  const el = document.getElementById('application-form')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function submitApplication() {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    submitted.value = true
    form.value = { name: '', email: '', position: '', portfolio: '', about: '' }
  }, 800)
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">
    <AppNavbar />

    <!-- Header -->
    <div class="bg-[#1c1d1f] text-white py-14">
      <div class="max-w-[1340px] mx-auto px-4">
        <p class="text-xs font-bold uppercase tracking-wider text-[#cec0fc] mb-2">{{ APP.company.name }}</p>
        <h1 class="text-4xl font-extrabold mb-3">Trabaja con Nosotros</h1>
        <p class="text-gray-400 text-base">Construye el futuro de la educación tecnológica en Latinoamérica</p>
      </div>
    </div>

    <div class="max-w-[1340px] mx-auto px-4 py-12">

      <!-- Intro -->
      <div class="max-w-2xl mb-12">
        <h2 class="text-2xl font-extrabold text-[#1c1d1f] mb-4">Únete al equipo</h2>
        <p class="text-[#6a6f73] leading-relaxed">
          En MatuByte construimos productos de software y educación que impactan la vida de personas en toda América Latina.
          Si eres apasionado por la tecnología, la educación y el trabajo en equipo, queremos conocerte.
          Trabajamos de forma remota, flexible y con foco total en resultados.
        </p>
      </div>

      <!-- Open positions -->
      <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-6">Posiciones abiertas</h2>
      <div class="space-y-6 mb-16">
        <div
          v-for="pos in positions"
          :key="pos.id"
          class="border border-[#d1d7dc] p-8">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h3 class="text-lg font-extrabold text-[#1c1d1f]">{{ pos.title }}</h3>
              <div class="flex flex-wrap gap-3 mt-2 text-xs text-[#6a6f73]">
                <span class="flex items-center gap-1.5 border border-[#d1d7dc] px-2.5 py-1 font-semibold">
                  <Briefcase :size="11" /> {{ pos.type }}
                </span>
                <span class="flex items-center gap-1.5 border border-[#d1d7dc] px-2.5 py-1 font-semibold">
                  <MapPin :size="11" /> {{ pos.location }}
                </span>
              </div>
            </div>
            <button
              @click="applyFor(pos.id)"
              class="flex-shrink-0 bg-[#5624d0] hover:bg-[#3d1a9e] text-white font-bold text-sm px-5 py-2.5 transition-colors flex items-center gap-2">
              Postularme <ArrowDown :size="14" />
            </button>
          </div>
          <p class="text-[#6a6f73] text-sm leading-relaxed mb-4">{{ pos.description }}</p>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-2">Requisitos</p>
            <ul class="space-y-1.5">
              <li v-for="req in pos.requirements" :key="req" class="flex items-start gap-2 text-sm text-[#6a6f73]">
                <CheckCircle :size="13" class="text-[#5624d0] mt-0.5 flex-shrink-0" />
                {{ req }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Application form -->
      <div id="application-form" class="border border-[#d1d7dc] p-8 max-w-2xl">
        <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-6">Formulario de postulación</h2>

        <div v-if="submitted" class="flex items-center gap-3 bg-[#f0faf0] border border-[#86c986] p-4 mb-6">
          <CheckCircle :size="20" class="text-green-600 flex-shrink-0" />
          <p class="text-sm font-semibold text-green-700">¡Gracias! Revisaremos tu aplicación y te contactaremos pronto.</p>
        </div>

        <form @submit.prevent="submitApplication" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Nombre completo *</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Tu nombre"
                class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Email *</label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="tu@email.com"
                class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Posición *</label>
            <select
              v-model="form.position"
              required
              class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] transition-colors bg-white">
              <option value="" disabled>Selecciona la posición</option>
              <option v-for="pos in positions" :key="pos.id" :value="pos.id">{{ pos.title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">LinkedIn / Portafolio URL</label>
            <input
              v-model="form.portfolio"
              type="url"
              placeholder="https://linkedin.com/in/tu-perfil"
              class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#1c1d1f] mb-1.5">Cuéntanos sobre ti *</label>
            <textarea
              v-model="form.about"
              required
              rows="5"
              placeholder="¿Por qué quieres trabajar con MatuByte? ¿Qué experiencia relevante tienes?"
              class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] transition-colors resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="bg-[#5624d0] hover:bg-[#3d1a9e] disabled:opacity-60 text-white font-bold px-8 py-3 text-sm transition-colors">
            {{ submitting ? 'Enviando...' : 'Enviar postulación' }}
          </button>
        </form>
      </div>

    </div>

    <AppFooter />
  </div>
</template>
