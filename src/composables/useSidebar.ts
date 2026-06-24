import { ref } from 'vue'

export const sidebarOpen = ref(false)

export function useSidebar() {
  function openSidebar() {
    sidebarOpen.value = true
  }
  function closeSidebar() {
    sidebarOpen.value = false
  }
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }
  return { sidebarOpen, openSidebar, closeSidebar, toggleSidebar }
}
