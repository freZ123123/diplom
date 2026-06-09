<template>
  <div class="page-container">
    <h1 class="text-3xl font-bold mb-2">Пополнение <span class="text-primary">{{ selectedService?.name || 'кошельков' }}</span> без комиссии</h1>
    <p class="text-gray-400 mb-8">Моментальное пополнение кошелька</p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="bg-surface-card rounded-xl border border-border p-6">
          <!-- Service tabs -->
          <div class="flex flex-wrap gap-2 mb-6">
            <button
              v-for="svc in services"
              :key="svc.id"
              @click="service = svc.id"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="service === svc.id ? 'bg-primary text-black' : 'bg-surface-elevated text-gray-300 hover:text-white'"
            >
              {{ svc.name }}
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Логин {{ selectedService?.name }}
                <span class="text-gray-500 cursor-help" title="Введите логин вашего аккаунта">ⓘ</span>
              </label>
              <input v-model="form.login" type="text" class="input-field" :placeholder="`Введите логин ${selectedService?.name || ''}`" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Выберите сумму</label>
              <div class="flex items-center gap-2 mb-3">
                <input v-model.number="form.amount" type="number" class="input-field flex-1" min="100" />
                <div class="flex border border-border rounded-lg overflow-hidden">
                  <button
                    v-for="cur in currencies"
                    :key="cur.value"
                    @click="form.currency = cur.value"
                    class="px-3 py-2.5 text-sm font-medium transition-colors"
                    :class="form.currency === cur.value ? 'bg-primary text-black' : 'bg-surface-elevated text-gray-300 hover:text-white'"
                  >
                    {{ cur.label }}
                  </button>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="preset in amountPresets"
                  :key="preset"
                  @click="form.amount = preset"
                  class="px-3 py-1.5 rounded border text-sm transition-colors"
                  :class="form.amount === preset ? 'border-primary text-primary' : 'border-border text-gray-400 hover:text-white hover:border-gray-500'"
                >
                  {{ preset }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Способ оплаты</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="pm in paymentMethods"
                  :key="pm.id"
                  @click="form.paymentMethod = pm.id"
                  class="px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors"
                  :class="form.paymentMethod === pm.id ? 'border-primary bg-primary/10 text-white' : 'border-border bg-surface-elevated text-gray-300'"
                >
                  {{ pm.icon }} {{ pm.name }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Регион</label>
              <select v-model="form.region" class="input-field text-sm">
                <option value="ru">Россия</option>
                <option value="kz">Казахстан</option>
                <option value="global">Другой</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="bg-surface-card rounded-xl border border-border p-6 sticky top-20">
          <div class="text-sm text-gray-400 mb-1">Итого с надмиской</div>
          <div class="text-3xl font-extrabold text-primary mb-6">{{ formatPrice(form.amount || 0, form.currency) }}</div>

          <button
            @click="handleTopUp"
            :disabled="!form.login || !form.amount || submitting"
            class="w-full btn-primary py-3 text-base mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Обработка...' : 'Оплатить и пополнить счёт' }}
          </button>

          <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>
          <p v-if="success" class="text-primary text-sm text-center">{{ success }}</p>
        </div>
      </div>
    </div>

    <!-- Service cards -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold mb-6">Пополнение кошельков сервисов</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          v-for="svc in services"
          :key="svc.id"
          @click="service = svc.id"
          class="text-left rounded-xl p-6 bg-gradient-to-br transition-transform hover:scale-[1.02] duration-200"
          :class="svc.color"
        >
          <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-1">{{ svc.name }}</h3>
          <p class="text-sm text-white/70">{{ svc.desc }}</p>
          <span class="inline-block mt-3 bg-green-500/20 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">Комиссия 0%</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { createTopUp } from '@/api/wallet'
import { formatPrice } from '@/utils/formatPrice'
import { WALLET_SERVICES } from '@/utils/constants'

const services = WALLET_SERVICES
const service = ref('steam')

const selectedService = computed(() => services.find(s => s.id === service.value))

const form = reactive({
  login: '',
  amount: 1000,
  currency: 'RUB',
  region: 'ru',
  paymentMethod: 'card'
})

const currencies = [
  { value: 'RUB', label: '₽ RUB' },
  { value: 'KZT', label: '₸ KZT' },
  { value: 'USD', label: '$ USD' }
]

const amountPresets = [500, 1000, 2000, 5000, 7000, 10000]

const paymentMethods = [
  { id: 'card', name: 'Карта', icon: '💳' },
  { id: 'sbp', name: 'СБП', icon: '🏦' }
]

const submitting = ref(false)
const error = ref('')
const success = ref('')

async function handleTopUp() {
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    await createTopUp({
      service: service.value,
      login: form.login,
      amount: form.amount,
      currency: form.currency,
      region: form.region,
      paymentMethod: form.paymentMethod
    })
    success.value = 'Запрос на пополнение отправлен! Обработка займёт несколько минут.'
    form.login = ''
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка при создании запроса'
  } finally {
    submitting.value = false
  }
}
</script>
