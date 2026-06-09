<template>
  <div class="page-container">
    <div v-if="loading" class="text-center py-16">
      <div class="skeleton h-8 w-64 mx-auto rounded mb-4"></div>
      <div class="skeleton h-40 max-w-lg mx-auto rounded"></div>
    </div>

    <div v-else-if="order" class="max-w-2xl mx-auto text-center">
      <div class="mb-8">
        <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold mb-2">Заказ оформлен!</h1>
        <p class="text-gray-400">Заказ #{{ order.id }} от {{ formatDateTime(order.created_at) }}</p>
      </div>

      <div class="bg-surface-card rounded-xl border border-border p-6 text-left mb-6">
        <h2 class="text-lg font-semibold mb-4">Ваши ключи</h2>
        <div class="space-y-3">
          <div v-for="item in order.items" :key="item.id" class="flex items-start gap-3 p-3 bg-surface-elevated rounded-lg">
            <img :src="item.image_url || '/img/placeholder.jpg'" class="w-12 h-12 rounded object-cover" :alt="item.title" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">{{ item.title }}</p>
              <p class="text-xs text-gray-400">{{ formatPrice(item.price) }}</p>
              <div v-if="item.key_value" class="mt-2 flex items-center gap-2">
                <code class="text-sm text-primary bg-primary/10 px-3 py-1 rounded font-mono">{{ item.key_value }}</code>
                <button @click="copyKey(item.key_value)" class="text-gray-400 hover:text-white text-xs">
                  Копировать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 text-sm">
        <div class="flex justify-between text-gray-400 gap-6">
          <span>Итого оплачено:</span>
          <span class="text-primary font-bold text-base">{{ formatPrice(order.total) }}</span>
        </div>
      </div>

      <div class="flex gap-3 justify-center mt-6">
        <router-link to="/profile" class="btn-secondary">Мои заказы</router-link>
        <router-link to="/catalog" class="btn-primary">Продолжить покупки</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { getOrder } from '@/api/orders'
import { formatPrice } from '@/utils/formatPrice'
import { formatDateTime } from '@/utils/formatDate'

const route = useRoute()
const toast = useToast()
const order = ref(null)
const loading = ref(true)

async function copyKey(key) {
  try {
    await navigator.clipboard.writeText(key)
    toast.success('Ключ скопирован')
  } catch {
    toast.error('Не удалось скопировать')
  }
}

onMounted(async () => {
  try {
    const { data } = await getOrder(route.params.id)
    order.value = data.order
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
})
</script>
