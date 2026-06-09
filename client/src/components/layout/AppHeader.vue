<template>
  <header class="bg-surface-card border-b border-border sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-4">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 shrink-0">
          <span class="text-primary text-xl">⚡</span>
          <span class="text-white font-extrabold text-lg tracking-tight">WW MARKET</span>
        </router-link>

        <!-- Nav links (desktop) -->
        <nav class="hidden md:flex items-center gap-6 text-sm">
          <router-link to="/catalog" class="text-gray-300 hover:text-white transition-colors">Каталог</router-link>
          <router-link to="/wallet" class="text-gray-300 hover:text-white transition-colors">Пополнение кошельков</router-link>
        </nav>

        <!-- Search -->
        <div class="hidden sm:block relative flex-1 max-w-md" ref="searchContainer">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск игр..."
            class="input-field pl-10 py-2 text-sm"
            @focus="showResults = true"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <!-- Search results dropdown -->
          <div v-if="showResults && searchResults.length > 0" class="absolute top-full mt-1 w-full bg-surface-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
            <router-link
              v-for="game in searchResults"
              :key="game.id"
              :to="`/game/${game.slug}`"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors"
              @click="showResults = false"
            >
              <img :src="game.image_url || '/img/placeholder.jpg'" class="w-10 h-10 rounded object-cover" :alt="game.title" />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white truncate">{{ game.title }}</p>
                <p class="text-xs text-gray-400">{{ formatPrice(game.price) }}</p>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <!-- Cart -->
          <router-link v-if="auth.isLoggedIn" to="/cart" class="relative p-2 text-gray-300 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span v-if="cart.itemCount > 0" class="absolute -top-1 -right-1 bg-primary text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {{ cart.itemCount }}
            </span>
          </router-link>

          <!-- Auth -->
          <template v-if="auth.isLoggedIn">
            <div class="relative" ref="userMenu">
              <button @click="menuOpen = !menuOpen" class="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {{ auth.displayName.charAt(0).toUpperCase() }}
                </div>
                <span class="hidden lg:inline">{{ auth.displayName }}</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="menuOpen" class="absolute right-0 top-full mt-2 w-48 bg-surface-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                <router-link to="/profile" class="block px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors" @click="menuOpen = false">
                  Профиль
                </router-link>
                <router-link v-if="auth.isAdmin" to="/admin" class="block px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-primary" @click="menuOpen = false">
                  Админ-панель
                </router-link>
                <button @click="handleLogout" class="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-surface-hover transition-colors">
                  Выйти
                </button>
              </div>
            </div>
          </template>
          <router-link v-else to="/login" class="btn-primary text-sm py-2 px-4">
            Войти
          </router-link>

          <!-- Mobile menu -->
          <button @click="mobileMenu = !mobileMenu" class="md:hidden p-2 text-gray-300">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile nav -->
      <div v-if="mobileMenu" class="md:hidden pb-4 border-t border-border mt-2 pt-4">
        <div class="mb-3">
          <input v-model="searchQuery" type="text" placeholder="Поиск..." class="input-field text-sm" />
        </div>
        <router-link to="/catalog" class="block py-2 text-gray-300 hover:text-white" @click="mobileMenu = false">Каталог</router-link>
        <router-link to="/wallet" class="block py-2 text-gray-300 hover:text-white" @click="mobileMenu = false">Пополнение кошельков</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { getGames } from '@/api/games'
import { formatPrice } from '@/utils/formatPrice'
import { useDebounce } from '@/composables/useDebounce'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 350)
const searchResults = ref([])
const showResults = ref(false)
const menuOpen = ref(false)
const mobileMenu = ref(false)
const searchContainer = ref(null)
const userMenu = ref(null)

watch(debouncedQuery, async (val) => {
  if (val.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const { data } = await getGames({ search: val, limit: 5 })
    searchResults.value = data.games
  } catch {
    searchResults.value = []
  }
})

function handleLogout() {
  auth.logout()
  menuOpen.value = false
  router.push('/')
}

function handleClickOutside(e) {
  if (searchContainer.value && !searchContainer.value.contains(e.target)) {
    showResults.value = false
  }
  if (userMenu.value && !userMenu.value.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (auth.isLoggedIn) {
    cart.fetchCart()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
