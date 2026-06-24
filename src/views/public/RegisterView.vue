<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AppLogo from '@/components/ui/AppLogo.vue'

const router = useRouter()
const { register, loading, error } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

async function handleSubmit() {
  localError.value = ''
  if (password.value !== confirmPassword.value) {
    localError.value = 'Las contraseñas no coinciden'
    return
  }
  if (password.value.length < 6) {
    localError.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  const result = await register(name.value, email.value, password.value)
  if (result.success) {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fa] flex flex-col">
    <!-- Top bar -->
    <div class="border-b border-[#d1d7dc] bg-white h-14 flex items-center px-6">
      <AppLogo />
    </div>

    <div class="flex-1 flex items-center justify-center p-4">
      <div class="bg-white border border-[#d1d7dc] w-full max-w-md p-6 sm:p-8">
        <h1 class="text-2xl font-extrabold text-[#1c1d1f] mb-6 text-center">Crear tu cuenta</h1>

        <div v-if="error || localError" class="bg-red-50 border border-red-200 text-red-700 text-sm p-3 mb-5">
          {{ error || localError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-[#1c1d1f] mb-1">Nombre completo</label>
            <input v-model="name" type="text" required placeholder="Juan Pérez"
              class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] transition-colors" />
          </div>
          <div>
            <label class="block text-sm font-bold text-[#1c1d1f] mb-1">Correo electrónico</label>
            <input v-model="email" type="email" required placeholder="ejemplo@correo.com"
              class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] transition-colors" />
          </div>
          <div>
            <label class="block text-sm font-bold text-[#1c1d1f] mb-1">Contraseña</label>
            <input v-model="password" type="password" required placeholder="••••••••"
              class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] transition-colors" />
          </div>
          <div>
            <label class="block text-sm font-bold text-[#1c1d1f] mb-1">Confirmar contraseña</label>
            <input v-model="confirmPassword" type="password" required placeholder="••••••••"
              class="w-full border border-[#d1d7dc] px-3 py-2.5 text-sm outline-none focus:border-[#5624d0] transition-colors" />
          </div>

          <button type="submit" :disabled="loading"
            class="w-full bg-[#5624d0] hover:bg-[#3d1a9e] disabled:opacity-60 text-white font-bold py-3 text-sm transition-colors">
            {{ loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis' }}
          </button>
        </form>

        <p class="text-center text-sm text-[#6a6f73] mt-6">
          ¿Ya tienes cuenta?
          <RouterLink to="/login" class="text-[#5624d0] font-bold hover:underline ml-1">Iniciar sesión</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
