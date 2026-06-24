<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Clock, User, Tag, ArrowLeft, BookOpen } from '@lucide/vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import blogData from '@/data/blog.json'

const route = useRoute()
const postId = computed(() => route.params.id as string)
const post = computed(() => blogData.posts.find(p => p.id === postId.value))
const relatedPosts = computed(() =>
  blogData.posts.filter(p => p.id !== postId.value).slice(0, 3)
)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}

const fullContent: Record<string, string[]> = {
  'mejores-carreras-tecnologia-2026': [
    'El panorama laboral tecnológico en 2026 es más dinámico que nunca. Con la consolidación de la inteligencia artificial, la nube y el Internet de las Cosas como pilares de la economía digital, los profesionales que dominen estas áreas tienen garantizado un lugar en el mercado laboral internacional.',
    'Entre las carreras con mayor proyección encontramos el desarrollo de software full-stack, especialmente con dominio de ecosistemas como Node.js, Vue/React y bases de datos modernas. Los salarios para desarrolladores senior con 3-5 años de experiencia oscilan entre $80,000 y $140,000 USD anuales en Estados Unidos, y entre $15,000 y $40,000 USD en Colombia.',
    'La ciencia de datos e inteligencia artificial ocupa el segundo lugar, con una demanda que creció 45% respecto a 2024. Python sigue siendo el lenguaje dominante, seguido por R y Julia. Las empresas buscan perfiles que combinen estadística, programación y comprensión del negocio.',
    'La ciberseguridad, la computación en la nube (AWS, Azure, GCP) y el diseño UX/UI completan el top 5. En Latinoamérica, el trabajo remoto ha democratizado el acceso a estas oportunidades — un desarrollador colombiano puede hoy trabajar para una startup de Silicon Valley sin salir de Cali.',
    'La conclusión es clara: invertir en educación tecnológica en 2026 no es una opción, es una necesidad. Los cursos técnicos bien estructurados, como los que ofrecemos en MatuCourse, ofrecen un camino más directo y práctico al mercado laboral que muchas carreras universitarias tradicionales.',
  ],
  'aprender-programacion-desde-cero': [
    'Aprender a programar desde cero puede parecer intimidante, pero con la ruta correcta y el acompañamiento adecuado, es completamente posible en 6-12 meses llegar a un nivel empleable. La clave está en la consistencia y en elegir los fundamentos correctos.',
    'El primer paso es siempre la lógica de programación — antes de elegir un lenguaje, debes entender cómo piensa una computadora: variables, condicionales, bucles, funciones. Este conocimiento es transferible a cualquier lenguaje. Muchos instructores recomiendan comenzar con Python por su sintaxis legible o con C++ si te interesa la computación de bajo nivel.',
    'Una vez dominados los fundamentos, el segundo paso es construir proyectos reales. Un portfolio con 3-5 proyectos tangibles (una API REST, un sitio web, una aplicación de escritorio) vale más que meses de teoría sin aplicación práctica. Esto es precisamente lo que diferencia los cursos de MatuCourse: cada módulo termina con un proyecto que puedes mostrar.',
    'El tercer paso es entrar a la comunidad. GitHub, Stack Overflow, Discord — la programación es colaborativa. Contribuir a proyectos open source, aunque sea con documentación, acelera tu crecimiento exponencialmente.',
    'Finalmente, no subestimes la importancia de un mentor. Un instructor con experiencia real en la industria puede ahorrarte meses de errores. Las clases en vivo tienen una ventaja crucial sobre los cursos grabados: puedes preguntar, obtener retroalimentación inmediata y adaptarte a tu ritmo real de aprendizaje.',
  ],
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">
    <AppNavbar />

    <template v-if="post">
      <!-- Back link -->
      <div class="border-b border-[#d1d7dc] bg-[#f7f9fa]">
        <div class="max-w-3xl mx-auto px-4 py-3">
          <RouterLink to="/blog" class="flex items-center gap-1.5 text-sm text-[#6a6f73] hover:text-[#5624d0] transition-colors font-semibold">
            <ArrowLeft :size="14" /> Volver al blog
          </RouterLink>
        </div>
      </div>

      <!-- Article content -->
      <div class="max-w-3xl mx-auto px-4 py-10">

        <!-- Article header -->
        <div class="mb-8">
          <span class="inline-flex items-center gap-1.5 bg-[#ede8f5] text-[#5624d0] text-xs font-bold px-3 py-1 mb-4">
            <Tag :size="10" /> {{ post.category }}
          </span>
          <h1 class="text-3xl font-extrabold text-[#1c1d1f] leading-tight mb-4">{{ post.title }}</h1>
          <div class="flex flex-wrap items-center gap-4 text-sm text-[#6a6f73] mb-6">
            <span class="flex items-center gap-1.5"><User :size="13" /> {{ post.author }}</span>
            <span>{{ formatDate(post.date) }}</span>
            <span class="flex items-center gap-1.5"><Clock :size="13" /> {{ post.readTime }} de lectura</span>
          </div>
        </div>

        <!-- Hero image -->
        <div class="mb-8 overflow-hidden border border-[#d1d7dc]">
          <img :src="post.image" :alt="post.title" class="w-full h-64 object-cover" />
        </div>

        <!-- Article body -->
        <div class="prose-custom">
          <template v-if="fullContent[post.id]">
            <p
              v-for="(paragraph, i) in fullContent[post.id]"
              :key="i"
              class="text-[#1c1d1f] text-base leading-relaxed mb-5">
              {{ paragraph }}
            </p>
          </template>
          <template v-else>
            <!-- Excerpt + coming soon -->
            <p class="text-[#1c1d1f] text-base leading-relaxed mb-5">{{ post.excerpt }}</p>
            <div class="border border-[#d1d7dc] p-8 text-center bg-[#f7f9fa] mt-8">
              <BookOpen :size="32" class="mx-auto text-[#d1d7dc] mb-3" />
              <p class="font-extrabold text-[#1c1d1f] mb-2">Artículo completo próximamente</p>
              <p class="text-[#6a6f73] text-sm">Estamos trabajando en el contenido completo de este artículo. ¡Vuelve pronto!</p>
            </div>
          </template>
        </div>

        <!-- Author card -->
        <div class="border border-[#d1d7dc] p-6 mt-10 flex items-start gap-4 bg-[#f7f9fa]">
          <div class="w-12 h-12 bg-[#5624d0] flex items-center justify-center text-white font-extrabold flex-shrink-0">JL</div>
          <div>
            <p class="font-extrabold text-[#1c1d1f] text-sm">{{ post.author }}</p>
            <p class="text-[#5624d0] text-xs font-semibold">Senior Full-Stack Developer · MatuByte S.A.S.</p>
            <p class="text-[#6a6f73] text-xs mt-1 leading-relaxed">Desarrollador con 15+ años de experiencia e instructor en MatuCourse. Fundador de MatuByte S.A.S., Cali Colombia.</p>
          </div>
        </div>

      </div>

      <!-- Related posts -->
      <div class="border-t border-[#d1d7dc] bg-[#f7f9fa] py-10">
        <div class="max-w-3xl mx-auto px-4">
          <h2 class="text-xl font-extrabold text-[#1c1d1f] mb-6">Más artículos</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RouterLink
              v-for="related in relatedPosts"
              :key="related.id"
              :to="`/blog/${related.id}`"
              class="group border border-[#d1d7dc] bg-white overflow-hidden hover:shadow-sm transition-shadow">
              <img :src="related.image" :alt="related.title" class="w-full h-32 object-cover group-hover:opacity-90 transition-opacity" />
              <div class="p-4">
                <span class="text-[10px] font-bold uppercase text-[#5624d0] tracking-wider">{{ related.category }}</span>
                <h3 class="font-extrabold text-[#1c1d1f] text-xs mt-1 leading-snug group-hover:text-[#5624d0] transition-colors">
                  {{ related.title }}
                </h3>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="min-h-[60vh] flex items-center justify-center">
      <div class="text-center">
        <BookOpen :size="48" class="mx-auto text-[#d1d7dc] mb-4" />
        <h2 class="font-extrabold text-[#1c1d1f] text-xl mb-2">Artículo no encontrado</h2>
        <RouterLink to="/blog" class="text-[#5624d0] font-semibold hover:underline">Ver todos los artículos</RouterLink>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
