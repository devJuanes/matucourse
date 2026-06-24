import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Router } from 'vue-router'
import { authService } from '@/services'
import type { MatuUser } from '@/services'

export type { MatuUser }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<MatuUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const sessionReady = ref(false)

  let initPromise: Promise<MatuUser | null> | null = null

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => !!user.value?.isAdmin)

  async function initSession(): Promise<MatuUser | null> {
    if (sessionReady.value) return user.value
    if (initPromise) return initPromise

    initPromise = authService.checkSession().then((u) => {
      user.value = u
      sessionReady.value = true
      return u
    })

    return initPromise
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const result = await authService.login(email, password)
      if (!result.success) throw new Error(result.error)
      user.value = result.user ?? null
      sessionReady.value = true
      initPromise = Promise.resolve(user.value)
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const result = await authService.register(name, email, password)
      if (!result.success) throw new Error(result.error)
      user.value = result.user ?? null
      sessionReady.value = true
      initPromise = Promise.resolve(user.value)
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  function clearSession() {
    user.value = null
    sessionReady.value = false
    initPromise = null
  }

  async function logout() {
    clearSession()
    try {
      await authService.logout()
    } catch {
      /* sesión local ya limpiada */
    }
  }

  async function logoutAndRedirect(router: Router) {
    clearSession()
    router.replace('/')
    authService.logout().catch(() => {})
  }

  async function checkSession() {
    return initSession()
  }

  async function refreshProfile() {
    clearSession()
    return initSession()
  }

  return {
    user,
    loading,
    error,
    sessionReady,
    isAuthenticated,
    isAdmin,
    initSession,
    login,
    register,
    logout,
    logoutAndRedirect,
    checkSession,
    refreshProfile,
  }
})
