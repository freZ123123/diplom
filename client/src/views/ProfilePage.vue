<template>
  <div class="page-container">
    <h1 class="text-3xl font-bold mb-8">Личный кабинет</h1>

    <div class="flex gap-2 mb-8 border-b border-border">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Profile info -->
    <div v-if="activeTab === 'info'" class="max-w-lg space-y-6">
      <div class="bg-surface-card rounded-xl border border-border p-6">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            {{ auth.displayName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-lg font-semibold">{{ auth.user.username }}</p>
            <p class="text-sm text-gray-400">{{ auth.user.email }}</p>
          </div>
        </div>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-border">
            <span class="text-gray-400">Баланс</span>
            <span class="text-primary font-bold">{{ formatPrice(auth.user.balance) }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-border">
            <span class="text-gray-400">Роль</span>
            <span class="text-white">{{ auth.user.role === 'admin' ? 'Администратор' : 'Пользователь' }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-400">Дата регистрации</span>
            <span class="text-white">{{ formatDate(auth.user.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders -->
    <div v-if="activeTab === 'orders'">
      <div v-if="ordersLoading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="skeleton h-24 rounded-xl"></div>
      </div>
      <div v-else-if="orders.length === 0" class="text-center py-16 text-gray-400">
        У вас пока нет заказов
      </div>
      <div v-else class="space-y-4">
        <div v-for="order in orders" :key="order.id" class="bg-surface-card rounded-xl border border-border overflow-hidden">
          <div class="p-4 flex items-center justify-between cursor-pointer" @click="toggleOrder(order.id)">
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-white">Заказ #{{ order.id }}</span>
              <span class="text-xs text-gray-500">{{ formatDateTime(order.created_at) }}</span>
              <span class="badge-green text-xs" v-if="order.status === 'completed'">Выполнен</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-primary font-bold">{{ formatPrice(order.total) }}</span>
              <svg class="w-5 h-5 text-gray-400 transition-transform" :class="expandedOrders.has(order.id) && 'rotate-180'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div v-if="expandedOrders.has(order.id)" class="border-t border-border p-4 space-y-2">
            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-3 text-sm">
              <img :src="item.image_url || '/img/placeholder.jpg'" class="w-10 h-10 rounded object-cover" :alt="item.title" />
              <div class="flex-1">
                <p class="text-white">{{ item.title }}</p>
                <code v-if="item.key_value" class="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded mt-0.5 inline-block">{{ item.key_value }}</code>
              </div>
              <span class="text-gray-400">{{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Wishlist -->
    <div v-if="activeTab === 'wishlist'">
      <div v-if="wishlistLoading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="n in 4" :key="n" class="card"><div class="aspect-[3/4] skeleton"></div></div>
      </div>
      <div v-else-if="wishlistItems.length === 0" class="text-center py-16 text-gray-400">
        Список избранного пуст
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="item in wishlistItems" :key="item.id" class="card group relative">
          <button @click="removeWish(item.game_id)" class="absolute top-2 right-2 z-10 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          <router-link :to="`/game/${item.slug}`">
            <div class="aspect-[3/4] bg-surface-elevated overflow-hidden">
              <img v-if="item.image_url" :src="item.image_url" :alt="item.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div class="p-3">
              <p class="text-sm text-white truncate mb-1">{{ item.title }}</p>
              <span class="text-sm font-bold text-primary">{{ formatPrice(item.price) }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getOrders } from '@/api/orders'
import { getWishlist, removeFromWishlist } from '@/api/wishlist'
import { formatPrice } from '@/utils/formatPrice'
import { formatDate, formatDateTime } from '@/utils/formatDate'

const auth = useAuthStore()

const activeTab = ref('info')
const tabs = [
  { id: 'info', label: 'Профиль' },
  { id: 'orders', label: 'Мои заказы' },
  { id: 'wishlist', label: 'Избранное' }
]

const orders = ref([])
const ordersLoading = ref(false)
const expandedOrders = ref(new Set())

const wishlistItems = ref([])
const wishlistLoading = ref(false)

function toggleOrder(id) {
  if (expandedOrders.value.has(id)) {
    expandedOrders.value.delete(id)
  } else {
    expandedOrders.value.add(id)
  }
  // force reactivity
  expandedOrders.value = new Set(expandedOrders.value)
}

async function loadOrders() {
  ordersLoading.value = true
  try {
    const { data } = await getOrders()
    orders.value = data.orders
  } catch {} finally {
    ordersLoading.value = false
  }
}

async function loadWishlist() {
  wishlistLoading.value = true
  try {
    const { data } = await getWishlist()
    wishlistItems.value = data.items
  } catch {} finally {
    wishlistLoading.value = false
  }
}

async function removeWish(gameId) {
  await removeFromWishlist(gameId)
  wishlistItems.value = wishlistItems.value.filter(i => i.game_id !== gameId)
}

onMounted(() => {
  loadOrders()
  loadWishlist()
})
</script>
