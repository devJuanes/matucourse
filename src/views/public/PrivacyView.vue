<script setup lang="ts">
import { Shield } from '@lucide/vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { APP } from '@/config/app'
</script>

<template>
  <div class="min-h-screen bg-white text-[#1c1d1f]">
    <AppNavbar />

    <!-- Header -->
    <div class="bg-[#1c1d1f] text-white py-10">
      <div class="max-w-[1340px] mx-auto px-4 flex items-center gap-4">
        <Shield :size="32" class="text-[#cec0fc]" />
        <div>
          <h1 class="text-3xl font-extrabold">Política de Privacidad</h1>
          <p class="text-gray-400 text-sm mt-1">Última actualización: Junio 2026</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-3xl mx-auto px-4 py-12">

      <p class="text-[#6a6f73] text-sm mb-8 leading-relaxed">
        En <strong class="text-[#1c1d1f]">{{ APP.company.name }}</strong> ("MatuCourse", "nosotros", "la plataforma") valoramos
        y respetamos su privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos
        sus datos personales de conformidad con la <strong class="text-[#1c1d1f]">Ley 1581 de 2012</strong> (Ley de Protección
        de Datos Personales de Colombia) y demás normas aplicables.
      </p>

      <!-- Section 1 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">1</span>
          Responsable del Tratamiento
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] space-y-1 leading-relaxed">
          <p><strong class="text-[#1c1d1f]">Razón social:</strong> {{ APP.company.name }}</p>
          <p><strong class="text-[#1c1d1f]">NIT:</strong> 901.234.567-8</p>
          <p><strong class="text-[#1c1d1f]">Domicilio:</strong> {{ APP.company.location }}</p>
          <p><strong class="text-[#1c1d1f]">Correo electrónico:</strong> {{ APP.company.email }}</p>
          <p><strong class="text-[#1c1d1f]">Sitio web:</strong> <a :href="APP.company.website" target="_blank" class="text-[#5624d0] hover:underline">matubyte.com</a></p>
        </div>
      </div>

      <!-- Section 2 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">2</span>
          Datos que Recopilamos
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] leading-relaxed">
          <p class="mb-3">Recopilamos los siguientes tipos de datos personales:</p>
          <ul class="space-y-2 list-disc list-inside">
            <li><strong class="text-[#1c1d1f]">Datos de identificación:</strong> nombre completo, correo electrónico.</li>
            <li><strong class="text-[#1c1d1f]">Información de pago:</strong> procesada de forma segura por Bold / Coltefinanciera. No almacenamos datos de tarjetas de crédito o débito.</li>
            <li><strong class="text-[#1c1d1f]">Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas, duración de la sesión.</li>
            <li><strong class="text-[#1c1d1f]">Datos de acceso a cursos:</strong> cursos adquiridos, progreso, fechas de acceso.</li>
          </ul>
        </div>
      </div>

      <!-- Section 3 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">3</span>
          Finalidad del Tratamiento
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] leading-relaxed">
          <p class="mb-3">Sus datos personales son utilizados para:</p>
          <ul class="space-y-2 list-disc list-inside">
            <li>Gestión y autenticación de cuentas de usuario en la plataforma MatuCourse.</li>
            <li>Procesamiento de pagos y emisión de comprobantes electrónicos.</li>
            <li>Envío de comunicaciones relacionadas con los cursos adquiridos (recordatorios, horarios, materiales).</li>
            <li>Notificaciones transaccionales y de seguridad de la cuenta.</li>
            <li>Mejora continua del servicio mediante análisis de uso agregado y anonimizado.</li>
            <li>Cumplimiento de obligaciones legales y fiscales.</li>
          </ul>
        </div>
      </div>

      <!-- Section 4 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">4</span>
          Bases Legales del Tratamiento
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] leading-relaxed space-y-2">
          <p><strong class="text-[#1c1d1f]">Consentimiento del titular:</strong> Al registrarse en la plataforma y aceptar esta política, usted otorga su consentimiento expreso para el tratamiento de sus datos.</p>
          <p><strong class="text-[#1c1d1f]">Ejecución de contrato:</strong> El tratamiento es necesario para la prestación del servicio de educación en línea contratado.</p>
          <p><strong class="text-[#1c1d1f]">Interés legítimo:</strong> Mejora de la plataforma, prevención de fraudes y seguridad del servicio.</p>
          <p><strong class="text-[#1c1d1f]">Obligación legal:</strong> Cumplimiento de normativa fiscal y tributaria colombiana.</p>
        </div>
      </div>

      <!-- Section 5 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">5</span>
          Derechos del Titular (Derechos ARCO)
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] leading-relaxed">
          <p class="mb-3">De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, usted tiene derecho a:</p>
          <ul class="space-y-2 list-disc list-inside">
            <li><strong class="text-[#1c1d1f]">Acceso:</strong> conocer qué datos personales suyos tratamos.</li>
            <li><strong class="text-[#1c1d1f]">Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
            <li><strong class="text-[#1c1d1f]">Cancelación/Supresión:</strong> solicitar la eliminación de sus datos cuando no sean necesarios.</li>
            <li><strong class="text-[#1c1d1f]">Oposición:</strong> oponerse al tratamiento de sus datos en determinadas circunstancias.</li>
            <li><strong class="text-[#1c1d1f]">Revocación del consentimiento:</strong> retirar su consentimiento en cualquier momento.</li>
          </ul>
          <p class="mt-3">Para ejercer sus derechos, contáctenos a <a :href="`mailto:${APP.company.email}`" class="text-[#5624d0] hover:underline">{{ APP.company.email }}</a>. Responderemos en un plazo máximo de 15 días hábiles.</p>
        </div>
      </div>

      <!-- Section 6 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">6</span>
          Transferencia Internacional de Datos
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] leading-relaxed">
          <p>La plataforma MatuCourse opera en servidores ubicados en Europa (proveedor VPS con sede en Alemania/Frankfurt). Esta transferencia internacional se realiza bajo garantías adecuadas de seguridad, incluyendo cifrado en tránsito (TLS 1.3) y en reposo (AES-256), en cumplimiento de los estándares del RGPD europeo. La transferencia es necesaria para la prestación del servicio contratado.</p>
        </div>
      </div>

      <!-- Section 7 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">7</span>
          Cookies y Tecnologías de Seguimiento
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] leading-relaxed space-y-2">
          <p>Utilizamos los siguientes tipos de cookies:</p>
          <ul class="space-y-2 list-disc list-inside">
            <li><strong class="text-[#1c1d1f]">Cookies de sesión:</strong> necesarias para mantener su sesión iniciada y el correcto funcionamiento de la plataforma.</li>
            <li><strong class="text-[#1c1d1f]">Cookies de analytics:</strong> para comprender cómo los usuarios interactúan con la plataforma (datos agregados y anonimizados).</li>
          </ul>
          <p>Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad de la plataforma.</p>
        </div>
      </div>

      <!-- Section 8 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">8</span>
          Menores de Edad
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] leading-relaxed">
          <p>MatuCourse no recopila intencionalmente datos personales de menores de 18 años sin el consentimiento verificable de sus padres o tutores legales. Si usted es padre, madre o tutor y cree que su hijo ha proporcionado datos personales sin su consentimiento, contáctenos inmediatamente a <a :href="`mailto:${APP.company.email}`" class="text-[#5624d0] hover:underline">{{ APP.company.email }}</a> para proceder con su eliminación.</p>
        </div>
      </div>

      <!-- Section 9 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">9</span>
          Cambios a esta Política
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] leading-relaxed">
          <p>Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Cuando realicemos cambios materiales, le notificaremos a través del correo electrónico registrado en su cuenta con al menos 15 días de antelación a la entrada en vigencia de los cambios. El uso continuado de la plataforma tras la notificación constituye la aceptación de la nueva política.</p>
        </div>
      </div>

      <!-- Section 10 -->
      <div class="mb-8">
        <h2 class="text-lg font-extrabold text-[#1c1d1f] mb-3 flex items-center gap-3">
          <span class="w-7 h-7 bg-[#5624d0] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">10</span>
          Contacto — Delegado de Protección de Datos (DPO)
        </h2>
        <div class="pl-10 text-sm text-[#6a6f73] leading-relaxed">
          <p>Para cualquier consulta relacionada con el tratamiento de sus datos personales o para ejercer sus derechos, puede contactar a nuestro responsable de protección de datos:</p>
          <div class="mt-3 border border-[#d1d7dc] p-4 bg-[#f7f9fa]">
            <p><strong class="text-[#1c1d1f]">{{ APP.company.name }}</strong></p>
            <p>Correo: <a :href="`mailto:${APP.company.email}`" class="text-[#5624d0] hover:underline">{{ APP.company.email }}</a></p>
            <p>Asunto: "Protección de Datos Personales"</p>
            <p>Dirección: {{ APP.company.location }}, Colombia</p>
          </div>
        </div>
      </div>

      <!-- Bottom note -->
      <div class="border-t border-[#d1d7dc] pt-6 text-xs text-[#6a6f73]">
        <p>Esta política fue elaborada de conformidad con la Ley 1581 de 2012, el Decreto 1377 de 2013 y las instrucciones impartidas por la Superintendencia de Industria y Comercio de Colombia (SIC).</p>
      </div>

    </div>

    <AppFooter />
  </div>
</template>
