<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-surface-card rounded-2xl border border-border p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold">Регистрация</h1>
          <p class="text-gray-400 text-sm mt-2">Создайте аккаунт WW Market</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="your@email.com" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Имя пользователя</label>
            <input v-model="form.username" type="text" class="input-field" placeholder="От 3 символов" required minlength="3" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Пароль</label>
            <input v-model="form.password" type="password" class="input-field" placeholder="Минимум 6 символов" required minlength="6" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Подтвердите пароль</label>
            <input v-model="form.confirmPassword" type="password" class="input-field" placeholder="Повторите пароль" required />
          </div>

          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

          <button type="submit" :disabled="submitting" class="w-full btn-primary py-3 text-base">
            {{ submitting ? 'Регистрация...' : 'Создать аккаунт' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-400 mt-6">
          Уже есть аккаунт?
          <router-link to="/login" class="text-primary hover:underline">Войти</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', username: '', password: '', confirmPassword: '' })
const error = ref('')
const submitting = ref(false)

async function handleRegister() {
  error.value = ''

  if (form.password !== form.confirmPassword) {
    error.value = 'Пароли не совпадают'
    return
  }

  submitting.value = true
  try {
    await auth.register(form.email, form.username, form.password)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка регистрации'
  } finally {
    submitting.value = false
  }
}
</script>
