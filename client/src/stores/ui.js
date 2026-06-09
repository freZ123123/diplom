import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const toasts = ref([])
  const activeModal = ref(null)

  let toastId = 0

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function showToast(message, type = 'success', duration = 3000) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function openModal(name) {
    activeModal.value = name
  }

  function closeModal() {
    activeModal.value = null
  }

  return { sidebarOpen, toasts, activeModal, toggleSidebar, closeSidebar, showToast, openModal, closeModal }
})
