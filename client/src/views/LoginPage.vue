<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-surface-card rounded-2xl border border-border p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold">Вход в аккаунт</h1>
          <p class="text-gray-400 text-sm mt-2">Введите данные для входа</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="your@email.com" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Пароль</label>
            <input v-model="form.password" type="password" class="input-field" placeholder="Минимум 6 символов" required />
          </div>

          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

          <button type="submit" :disabled="submitting" class="w-full btn-primary py-3 text-base">
            {{ submitting ? 'Вход...' : 'Войти' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-400 mt-6">
          Нет аккаунта?
          <router-link to="/register" class="text-primary hover:underline">Зарегистрироваться</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

const form = reactive({ email: '', password: '' })
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  error.value = ''
  submitting.value = true
  try {
    await auth.login(form.email, form.password)
    await cart.fetchCart()
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка входа'
  } finally {
    submitting.value = false
  }
}
</script>
