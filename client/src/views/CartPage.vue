<template>
  <div class="page-container">
    <h1 class="text-3xl font-bold mb-8">Корзина</h1>

    <div v-if="cart.loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="skeleton h-24 rounded-xl"></div>
    </div>

    <div v-else-if="cart.isEmpty" class="text-center py-20">
      <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      <p class="text-gray-400 text-xl mb-2">Корзина пуста</p>
      <router-link to="/catalog" class="text-primary hover:underline">Перейти в каталог</router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-3">
        <div v-for="item in cart.items" :key="item.id" class="bg-surface-card rounded-xl border border-border p-4 flex gap-4">
          <router-link :to="`/game/${item.slug}`" class="shrink-0">
            <img :src="item.image_url || '/img/placeholder.jpg'" :alt="item.title" class="w-20 h-20 rounded-lg object-cover" />
          </router-link>
          <div class="flex-1 min-w-0">
            <router-link :to="`/game/${item.slug}`" class="text-white font-medium hover:text-primary transition-colors">
              {{ item.title }}
            </router-link>
            <p class="text-xs text-gray-500 mt-0.5">{{ item.platform_name }}</p>
            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center gap-2">
                <button @click="updateQty(item, -1)" class="w-7 h-7 bg-surface-elevated rounded flex items-center justify-center text-gray-400 hover:text-white border border-border">−</button>
                <span class="text-sm w-6 text-center">{{ item.quantity }}</span>
                <button @click="updateQty(item, 1)" class="w-7 h-7 bg-surface-elevated rounded flex items-center justify-center text-gray-400 hover:text-white border border-border">+</button>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-primary font-bold">{{ formatPrice(item.price * item.quantity) }}</span>
                <button @click="cart.removeItem(item.id)" class="text-gray-500 hover:text-red-400 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="bg-surface-card rounded-xl border border-border p-6 sticky top-20">
          <h3 class="text-lg font-semibold mb-4">Итого</h3>
          <div class="space-y-3 text-sm mb-6">
            <div class="flex justify-between text-gray-400">
              <span>Товаров: {{ cart.itemCount }}</span>
              <span class="text-white">{{ formatPrice(cart.total) }}</span>
            </div>
            <div v-if="promoDiscount > 0" class="flex justify-between text-primary">
              <span>Скидка</span>
              <span>-{{ formatPrice(promoDiscount) }}</span>
            </div>
            <div class="border-t border-border pt-3 flex justify-between text-lg font-bold">
              <span>К оплате</span>
              <span class="text-primary">{{ formatPrice(finalTotal) }}</span>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex gap-2">
              <input v-model="promoCode" type="text" placeholder="Промокод" class="input-field text-sm flex-1" />
              <button @click="applyPromoCode" class="btn-secondary text-sm px-4" :disabled="!promoCode">ОК</button>
            </div>
            <p v-if="promoError" class="text-red-400 text-xs mt-1">{{ promoError }}</p>
            <p v-if="promoApplied" class="text-primary text-xs mt-1">Промокод применён!</p>
          </div>

          <router-link to="/checkout" class="block w-full btn-primary py-3 text-center text-base">
            Оформить заказ
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { applyPromo } from '@/api/promo'
import { formatPrice } from '@/utils/formatPrice'

const cart = useCartStore()
const promoCode = ref('')
const promoDiscount = ref(0)
const promoError = ref('')
const promoApplied = ref(false)

const finalTotal = computed(() => Math.max(0, cart.total - promoDiscount.value))

function updateQty(item, delta) {
  const newQty = item.quantity + delta
  if (newQty < 1) {
    cart.removeItem(item.id)
  } else {
    cart.updateQuantity(item.id, newQty)
  }
}

async function applyPromoCode() {
  promoError.value = ''
  promoApplied.value = false
  try {
    const { data } = await applyPromo(promoCode.value, cart.total)
    promoDiscount.value = data.promo.calculated_discount
    promoApplied.value = true
  } catch (e) {
    promoError.value = e.response?.data?.error || 'Неверный промокод'
    promoDiscount.value = 0
  }
}

onMounted(() => cart.fetchCart())
</script>
