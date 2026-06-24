import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  const { user, loading, error, isAuthenticated } = storeToRefs(store)

  async function loginAndRedirect(email: string, password: string) {
    const result = await store.login(email, password)
    if (result.success) {
      await router.push('/dashboard')
    }
    return result
  }

  async function registerAndRedirect(name: string, email: string, password: string) {
    const result = await store.register(name, email, password)
    if (result.success) {
      await router.push('/dashboard')
    }
    return result
  }

  async function logoutAndRedirect() {
    await store.logout()
    await router.push('/')
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login: loginAndRedirect,
    register: registerAndRedirect,
    logout: logoutAndRedirect,
  }
}
