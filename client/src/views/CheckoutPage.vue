<template>
  <div class="page-container">
    <h1 class="text-3xl font-bold mb-8">Оформление заказа</h1>

    <div v-if="cart.isEmpty" class="text-center py-16">
      <p class="text-gray-400 text-lg">Корзина пуста</p>
      <router-link to="/catalog" class="text-primary hover:underline mt-2 inline-block">В каталог</router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-surface-card rounded-xl border border-border p-6">
          <h2 class="text-lg font-semibold mb-4">Способ оплаты</h2>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="method in paymentMethods"
              :key="method.id"
              @click="selectedMethod = method.id"
              class="p-4 rounded-lg border-2 text-left transition-colors"
              :class="selectedMethod === method.id ? 'border-primary bg-primary/10' : 'border-border bg-surface-elevated hover:border-gray-500'"
            >
              <p class="text-sm font-medium text-white">{{ method.icon }} {{ method.name }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ method.desc }}</p>
            </button>
          </div>
        </div>

        <div class="bg-surface-card rounded-xl border border-border p-6">
          <h2 class="text-lg font-semibold mb-4">Товары в заказе</h2>
          <div class="space-y-3">
            <div v-for="item in cart.items" :key="item.id" class="flex items-center gap-3 text-sm">
              <img :src="item.image_url || '/img/placeholder.jpg'" class="w-12 h-12 rounded object-cover" :alt="item.title" />
              <div class="flex-1">
                <p class="text-white">{{ item.title }} <span class="text-gray-500">x{{ item.quantity }}</span></p>
              </div>
              <span class="text-primary font-medium">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="bg-surface-card rounded-xl border border-border p-6 sticky top-20">
          <h3 class="text-lg font-semibold mb-4">Итого</h3>
          <div class="space-y-2 text-sm mb-6">
            <div class="flex justify-between text-gray-400">
              <span>Товаров</span>
              <span class="text-white">{{ cart.itemCount }}</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span>Сумма</span>
              <span class="text-white">{{ formatPrice(cart.total) }}</span>
            </div>
            <div v-if="selectedMethod === 'balance'" class="flex justify-between text-gray-400">
              <span>Баланс</span>
              <span :class="auth.user.balance >= cart.total ? 'text-primary' : 'text-red-400'">
                {{ formatPrice(auth.user.balance) }}
              </span>
            </div>
            <div class="border-t border-border pt-3 flex justify-between text-xl font-bold">
              <span>К оплате</span>
              <span class="text-primary">{{ formatPrice(cart.total) }}</span>
            </div>
          </div>

          <button
            @click="placeOrder"
            :disabled="ordering || (selectedMethod === 'balance' && auth.user.balance < cart.total)"
            class="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ ordering ? 'Оформляем...' : 'Оплатить' }}
          </button>

          <p v-if="orderError" class="text-red-400 text-sm mt-3 text-center">{{ orderError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { createOrder } from '@/api/orders'
import { formatPrice } from '@/utils/formatPrice'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()

const selectedMethod = ref('balance')
const ordering = ref(false)
const orderError = ref('')

const paymentMethods = [
  { id: 'balance', name: 'Баланс', icon: '💰', desc: 'Оплата с баланса аккаунта' },
  { id: 'card', name: 'Карта', icon: '💳', desc: 'Банковская карта' },
  { id: 'sbp', name: 'СБП', icon: '🏦', desc: 'Система быстрых платежей' },
  { id: 'qiwi', name: 'QIWI', icon: '🟠', desc: 'QIWI Кошелёк' }
]

async function placeOrder() {
  ordering.value = true
  orderError.value = ''
  try {
    const { data } = await createOrder(selectedMethod.value)
    toast.success('Заказ оформлен!')
    router.push(`/order/success/${data.order.id}`)
  } catch (e) {
    orderError.value = e.response?.data?.error || 'Ошибка оформления заказа'
  } finally {
    ordering.value = false
  }
}

onMounted(() => {
  if (cart.isEmpty) cart.fetchCart()
})
</script>
