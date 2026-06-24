<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  Code2, MapPin, Star, Globe, Briefcase, Mail,
  ExternalLink, ArrowRight, BookOpen,
} from '@lucide/vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { APP } from '@/config/app'
import coursesData from '@/data/courses.json'

const allCourses = coursesData.courses
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">

    <AppNavbar />

    <!-- Page header -->
    <div class="bg-[#1c1d1f] text-white py-10">
      <div class="max-w-[1340px] mx-auto px-4">
        <p class="text-xs font-bold uppercase tracking-wider text-[#cec0fc] mb-2">El equipo detrás de {{ APP.name }}</p>
        <h1 class="text-3xl font-extrabold">Tu Instructor</h1>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-[1340px] mx-auto px-4 py-12">
      <div class="flex flex-col lg:flex-row gap-10 items-start">

        <!-- LEFT — Author card -->
        <div class="lg:w-72 flex-shrink-0 space-y-4">

          <!-- Avatar + name card -->
          <div class="bg-white border border-[#d1d7dc]">
            <div class="bg-[#5624d0] p-10 flex items-center justify-center">
              <span class="text-white text-5xl font-extrabold">{{ APP.instructor.initials }}</span>
            </div>
            <div class="p-5">
              <h2 class="text-lg font-extrabold text-[#1c1d1f]">{{ APP.instructor.name }}</h2>
              <p class="text-[#5624d0] text-sm font-semibold mt-0.5">{{ APP.instructor.title }}</p>
              <p class="text-[#6a6f73] text-xs mt-1 flex items-center gap-1.5">
                <MapPin :size="12" /> {{ APP.company.location }}
              </p>
              <div class="mt-4 pt-4 border-t border-[#d1d7dc] grid grid-cols-3 gap-3 text-center">
                <div>
                  <div class="text-lg font-extrabold text-[#5624d0]">{{ APP.instructor.rating }}</div>
                  <div class="text-[10px] text-[#6a6f73] uppercase tracking-wide">Rating</div>
                </div>
                <div>
                  <div class="text-lg font-extrabold text-[#1c1d1f]">{{ APP.instructor.students }}</div>
                  <div class="text-[10px] text-[#6a6f73] uppercase tracking-wide">Alumnos</div>
                </div>
                <div>
                  <div class="text-lg font-extrabold text-[#1c1d1f]">{{ allCourses.length }}</div>
                  <div class="text-[10px] text-[#6a6f73] uppercase tracking-wide">Cursos</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Links card -->
          <div class="bg-white border border-[#d1d7dc] p-5 space-y-3">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#6a6f73]">Perfiles</h4>
            <a :href="APP.instructor.website" target="_blank" rel="noopener noreferrer"
              class="flex items-center justify-between text-sm font-semibold text-[#1c1d1f] hover:text-[#5624d0] transition-colors group">
              <span class="flex items-center gap-2"><Globe :size="14" /> devjuanes.com</span>
              <ExternalLink :size="12" class="text-[#d1d7dc] group-hover:text-[#5624d0]" />
            </a>
            <a :href="APP.company.website" target="_blank" rel="noopener noreferrer"
              class="flex items-center justify-between text-sm font-semibold text-[#1c1d1f] hover:text-[#5624d0] transition-colors group">
              <span class="flex items-center gap-2"><Briefcase :size="14" /> matubyte.com</span>
              <ExternalLink :size="12" class="text-[#d1d7dc] group-hover:text-[#5624d0]" />
            </a>
            <a :href="`mailto:${APP.company.email}`"
              class="flex items-center justify-between text-sm font-semibold text-[#1c1d1f] hover:text-[#5624d0] transition-colors group">
              <span class="flex items-center gap-2"><Mail :size="14" /> Contactar</span>
              <ExternalLink :size="12" class="text-[#d1d7dc] group-hover:text-[#5624d0]" />
            </a>
          </div>

          <!-- CTA -->
          <RouterLink to="/courses"
            class="block w-full text-center bg-[#5624d0] text-white font-bold text-sm px-5 py-3 hover:bg-[#3d1a9e] transition-colors flex items-center justify-center gap-2">
            <BookOpen :size="14" /> Ver mis cursos
          </RouterLink>
        </div>

        <!-- RIGHT — Article content -->
        <article class="flex-1 min-w-0">

          <!-- Intro -->
          <div class="bg-white border border-[#d1d7dc] p-8 mb-6">
            <div class="flex items-center gap-2 mb-4">
              <Star :size="14" class="text-[#f4c430] fill-[#f4c430]" />
              <span class="text-sm font-bold text-[#b4690e]">{{ APP.instructor.rating }} — Instructor Top Rated</span>
            </div>
            <h3 class="text-xl font-extrabold text-[#1c1d1f] mb-3">Sobre {{ APP.instructor.name }}</h3>
            <p class="text-[#6a6f73] leading-relaxed mb-4">
              {{ APP.instructor.bio }}
            </p>
            <p class="text-[#6a6f73] leading-relaxed">
              Fundador de
              <a :href="APP.company.website" target="_blank" class="text-[#5624d0] font-semibold hover:underline">{{ APP.company.name }}</a>,
              empresa colombiana de desarrollo de software y educación tecnológica con clientes en Colombia, Estados Unidos y España.
              Su enfoque pedagógico combina la teoría con proyectos prácticos del mundo real, asegurando que cada estudiante pueda aplicar
              lo aprendido desde la primera clase.
            </p>
          </div>

          <!-- Expertise areas -->
          <div class="bg-white border border-[#d1d7dc] p-8 mb-6">
            <h3 class="text-base font-extrabold text-[#1c1d1f] mb-5 flex items-center gap-2">
              <Code2 :size="16" class="text-[#5624d0]" /> Áreas de Expertise
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="skill in ['Desarrollo Full-Stack','Vue.js & React','Node.js & APIs REST','C++ & Algoritmos','Python & Data Science','Arduino & IoT','FL Studio & Producción','Piano & Teoría Musical','MatuDB','PostgreSQL & SQL','DevOps & Linux','Arquitectura de Software']"
                :key="skill"
                class="border border-[#d1d7dc] px-3 py-1.5 text-xs font-semibold text-[#1c1d1f] hover:border-[#5624d0] hover:text-[#5624d0] transition-colors cursor-default">
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- Timeline / Trayectoria -->
          <div class="bg-white border border-[#d1d7dc] p-8 mb-6">
            <h3 class="text-base font-extrabold text-[#1c1d1f] mb-6 flex items-center gap-2">
              <Briefcase :size="16" class="text-[#5624d0]" /> Trayectoria
            </h3>
            <div class="space-y-6">
              <div
                v-for="item in [
                  { year: '2024 — Hoy', role: 'Instructor & Fundador', company: 'MatuCourse', desc: 'Plataforma de cursos en vivo enfocada en programación, producción musical y piano. Más de 500 estudiantes en 4 países.' },
                  { year: '2020 — Hoy', role: 'CEO & Lead Developer', company: 'MatuByte S.A.S.', desc: 'Fundación de la empresa de desarrollo de software. Proyectos en Colombia, USA y España. Productos: MatuDB, PayMatuByte, MatuCourse.' },
                  { year: '2010 — 2020', role: 'Senior Full-Stack Developer', company: 'Freelance & Agencias', desc: 'Más de una década construyendo aplicaciones web y móviles para clientes internacionales. Especialización en arquitecturas escalables.' },
                ]"
                :key="item.year"
                class="flex gap-4">
                <div class="flex-shrink-0 w-24 text-right">
                  <span class="text-[10px] font-bold text-[#5624d0] uppercase tracking-wide leading-tight">{{ item.year }}</span>
                </div>
                <div class="flex-shrink-0 flex flex-col items-center">
                  <div class="w-2.5 h-2.5 bg-[#5624d0] mt-0.5 flex-shrink-0"></div>
                  <div class="w-px flex-1 bg-[#d1d7dc] mt-1"></div>
                </div>
                <div class="flex-1 pb-4">
                  <p class="font-extrabold text-[#1c1d1f] text-sm">{{ item.role }}</p>
                  <p class="text-[#5624d0] text-xs font-semibold mb-1">{{ item.company }}</p>
                  <p class="text-[#6a6f73] text-xs leading-relaxed">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quote -->
          <div class="border-l-4 border-[#5624d0] bg-[#ede8f5] px-8 py-6 mb-6">
            <blockquote class="text-[#1c1d1f] text-base font-semibold italic leading-relaxed mb-3">
              "Mi objetivo es que cada estudiante salga de mis clases con habilidades reales y aplicables desde el primer día.
              No teoría vacía — código que funciona, música que suena."
            </blockquote>
            <p class="text-[#5624d0] text-sm font-bold">— {{ APP.instructor.name }}, {{ APP.instructor.title }}</p>
          </div>

          <!-- CTA to courses -->
          <RouterLink to="/courses"
            class="inline-flex items-center gap-2 border border-[#5624d0] text-[#5624d0] font-bold text-sm px-6 py-3 hover:bg-[#5624d0] hover:text-white transition-colors">
            Ver todos los cursos <ArrowRight :size="14" />
          </RouterLink>
        </article>

      </div>
    </div>

    <AppFooter />
  </div>
</template>
