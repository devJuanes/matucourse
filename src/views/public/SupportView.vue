<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BookOpen, CreditCard, User, Video, Settings, MessageSquare,
  ChevronDown, ChevronRight, Search, MessageCircle,
} from '@lucide/vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SupportTicketForm from '@/components/ui/SupportTicketForm.vue'

interface FaqItem {
  q: string
  a: string
  category: string
}

const faqs: FaqItem[] = [
  // Sobre los cursos
  { category: 'Cursos', q: '¿Los cursos son en vivo o grabados?', a: 'En vivo. Todas las clases se realizan en tiempo real por videollamada con el instructor. No son cursos grabados — puedes preguntar, interactuar y recibir retroalimentación en el momento.' },
  { category: 'Cursos', q: '¿Qué pasa si no puedo asistir a una clase?', a: 'Te notificaremos con anticipación para reprogramar la clase cuando sea posible. Entendemos que tienes compromisos — trabajamos juntos para encontrar el mejor horario.' },
  { category: 'Cursos', q: '¿Cuántos módulos tiene cada curso?', a: 'Varía según el curso. Por ejemplo, el curso de C++ Fundamentals tiene 4 módulos con 26 temas en total. Puedes ver el contenido completo en la página de cada curso.' },
  { category: 'Cursos', q: '¿Recibo un certificado al terminar?', a: 'Sí. Al completar el curso recibes un certificado digital de finalización emitido por MatuByte S.A.S., válido para incluir en tu portafolio y LinkedIn.' },
  { category: 'Cursos', q: '¿Puedo acceder al material después de las clases?', a: 'Sí. Los materiales, recursos y grabaciones (cuando aplique) quedan disponibles en tu cuenta de por vida tras completar el pago.' },
  // Pagos
  { category: 'Pagos', q: '¿Cómo pago mi curso?', a: 'Mediante la pasarela de pagos Bold (con respaldo de Coltefinanciera), aceptamos tarjeta débito/crédito, PSE, Nequi y Botón Bancolombia. Todos los pagos son seguros y cifrados.' },
  { category: 'Pagos', q: '¿Aceptan pagos en dólares o euros?', a: 'El pago se procesa en pesos colombianos (COP). Los precios en USD y EUR que ves en la plataforma son valores referenciales para que puedas comparar con facilidad.' },
  { category: 'Pagos', q: '¿Puedo pedir reembolso?', a: 'Sí. Aceptamos solicitudes de reembolso dentro de los primeros 7 días si el curso aún no ha comenzado. Contáctanos a info@matubyte.com con el asunto "Solicitud de reembolso".' },
  { category: 'Pagos', q: '¿Emiten factura electrónica?', a: 'Sí, emitimos factura electrónica a nombre de MatuByte S.A.S. tras la confirmación del pago. La recibirás en el correo registrado.' },
  // Cuenta
  { category: 'Cuenta', q: '¿Cómo creo mi cuenta?', a: 'Haz clic en "Registrarse" en la barra de navegación, ingresa tu email y crea una contraseña. El registro es gratuito y no requiere tarjeta de crédito.' },
  { category: 'Cuenta', q: 'Olvidé mi contraseña, ¿qué hago?', a: 'Por ahora, escríbenos a info@matubyte.com con el asunto "Recuperar contraseña" desde el correo con el que te registraste. Estamos trabajando en un flujo automático de recuperación.' },
  // Técnico
  { category: 'Técnico', q: '¿Qué necesito para las clases en vivo?', a: 'Una conexión a internet estable (mínimo 5 Mbps), un navegador moderno actualizado, micrófono (para participar), y cámara opcional. Las clases se realizan por videollamada en plataformas como Google Meet o Zoom.' },
  { category: 'Técnico', q: 'La plataforma no carga correctamente, ¿qué hago?', a: 'Intenta limpiar la caché del navegador (Ctrl+Shift+Del) y recarga la página. Si el problema persiste, prueba en modo incógnito o en otro navegador. Si sigue fallando, escríbenos a info@matubyte.com.' },
  { category: 'Técnico', q: '¿En qué dispositivos funciona MatuCourse?', a: 'En cualquier navegador moderno: Chrome, Firefox, Safari y Edge, tanto en computador como en tablet. Para clases en vivo recomendamos usar computador para mejor experiencia.' },
  { category: 'Técnico', q: '¿La plataforma funciona desde Colombia, España y Estados Unidos?', a: 'Sí. MatuCourse está disponible en cualquier país con acceso a internet. Los horarios de clases se coordinan individualmente según tu zona horaria.' },
]

const categories = [
  { icon: BookOpen, name: 'Cursos y Contenido' },
  { icon: CreditCard, name: 'Pagos y Facturación' },
  { icon: User, name: 'Cuenta y Acceso' },
  { icon: Video, name: 'Clases en Vivo' },
  { icon: Settings, name: 'Técnico' },
  { icon: MessageSquare, name: 'Contacto' },
]

const openFaq = ref<number | null>(null)

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">
    <AppNavbar />

    <!-- Header -->
    <div class="bg-[#1c1d1f] text-white py-14">
      <div class="max-w-[1340px] mx-auto px-4 text-center">
        <h1 class="text-3xl font-extrabold mb-3">Centro de Ayuda</h1>
        <p class="text-gray-400 text-sm mb-6">Encuentra respuestas rápidas a las preguntas más frecuentes</p>
        <div class="max-w-md mx-auto flex items-center border border-[#3e4143] bg-[#2d2f31] overflow-hidden">
          <div class="px-4 py-3 text-gray-400">
            <Search :size="15" />
          </div>
          <input
            type="text"
            placeholder="Buscar en el centro de ayuda..."
            class="flex-1 px-2 py-3 text-sm bg-transparent text-white placeholder:text-gray-500 outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Category cards -->
    <div class="border-b border-[#d1d7dc] py-8 bg-[#f7f9fa]">
      <div class="max-w-[1340px] mx-auto px-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="border border-[#d1d7dc] bg-white p-4 text-center hover:border-[#5624d0] hover:shadow-sm transition-all cursor-pointer group">
            <component :is="cat.icon" :size="24" class="mx-auto mb-2 text-[#6a6f73] group-hover:text-[#5624d0] transition-colors" />
            <p class="text-xs font-semibold text-[#1c1d1f] group-hover:text-[#5624d0] transition-colors leading-tight">{{ cat.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="max-w-[1340px] mx-auto px-4 py-12">
      <!-- Ticket PQR -->
      <div class="mb-12">
        <h2 class="text-2xl font-extrabold text-[#1c1d1f] mb-2">Soporte y tickets (PQR)</h2>
        <p class="text-[#6a6f73] text-sm mb-6">
          Envía una petición, queja, reclamo o solicitud de soporte técnico. No necesitas cuenta.
        </p>
        <SupportTicketForm />
      </div>

      <h2 class="text-2xl font-extrabold text-[#1c1d1f] mb-8">Preguntas Frecuentes</h2>

      <div
        v-for="(group, groupName) in (['Cursos', 'Pagos', 'Cuenta', 'Técnico'] as const)"
        :key="groupName"
        class="mb-8">
        <h3 class="text-sm font-extrabold uppercase tracking-wider text-[#6a6f73] mb-3 pb-2 border-b border-[#d1d7dc]">
          {{ group === 'Cursos' ? 'Sobre los cursos' : group === 'Pagos' ? 'Sobre pagos' : group === 'Cuenta' ? 'Cuenta' : 'Técnico' }}
        </h3>
        <div class="border border-[#d1d7dc]">
          <template v-for="(faq, index) in faqs.filter(f => f.category === group)" :key="index">
            <div class="border-b border-[#d1d7dc] last:border-b-0">
              <button
                @click="toggleFaq(faqs.indexOf(faq))"
                class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f7f9fa] transition-colors">
                <span class="font-semibold text-sm pr-4">{{ faq.q }}</span>
                <component
                  :is="openFaq === faqs.indexOf(faq) ? ChevronDown : ChevronRight"
                  :size="16"
                  class="text-[#5624d0] flex-shrink-0"
                />
              </button>
              <div v-if="openFaq === faqs.indexOf(faq)" class="px-5 pb-4 text-sm text-[#6a6f73] leading-relaxed border-t border-[#f7f9fa]">
                {{ faq.a }}
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Contact CTA -->
      <div class="border border-[#d1d7dc] p-8 bg-[#f7f9fa] text-center mt-10">
        <MessageCircle :size="24" class="mx-auto text-[#5624d0] mb-3" />
        <h3 class="font-extrabold text-[#1c1d1f] mb-2">¿Eres estudiante?</h3>
        <p class="text-[#6a6f73] text-sm mb-4">
          Chatea en tiempo real con tu instructor desde tu dashboard.
        </p>
        <RouterLink
          to="/dashboard/chat"
          class="inline-flex items-center gap-2 bg-[#5624d0] text-white font-bold text-sm px-6 py-3 hover:bg-[#3d1a9e] transition-colors mr-3"
        >
          Ir al chat
        </RouterLink>
        <RouterLink
          to="/contact"
          class="inline-flex items-center gap-2 border border-[#5624d0] text-[#5624d0] font-bold text-sm px-6 py-3 hover:bg-[#f0ebff] transition-colors"
        >
          Contacto general
        </RouterLink>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
