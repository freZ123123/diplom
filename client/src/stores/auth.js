import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getProfile } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('ww_token') || null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const displayName = computed(() => user.value?.username || 'Гость')

  async function initAuth() {
    if (!token.value) return
    try {
      loading.value = true
      const { data } = await getProfile()
      user.value = data.user
    } catch {
      logout()
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    const { data } = await apiLogin(email, password)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('ww_token', data.token)
    return data
  }

  async function register(email, username, password) {
    const { data } = await apiRegister(email, username, password)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('ww_token', data.token)
    return data
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('ww_token')
  }

  function updateUser(newData) {
    if (user.value) {
      Object.assign(user.value, newData)
    }
  }

  return { user, token, loading, isLoggedIn, isAdmin, displayName, initAuth, login, register, logout, updateUser }
})
