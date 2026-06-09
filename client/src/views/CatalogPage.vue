<template>
  <div class="page-container">
    <h1 class="text-3xl font-bold mb-8">{{ pageTitle }}</h1>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Filters sidebar -->
      <aside class="lg:w-64 shrink-0">
        <div class="bg-surface-card rounded-xl border border-border p-5 sticky top-20 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Сортировка</label>
            <select v-model="filters.sort" class="input-field text-sm">
              <option v-for="opt in SORT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Жанр</label>
            <select v-model="filters.genre" class="input-field text-sm">
              <option value="">Все жанры</option>
              <option v-for="(label, key) in GENRES" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Платформа</label>
            <select v-model="filters.platform" class="input-field text-sm">
              <option value="">Все платформы</option>
              <option value="steam">Steam</option>
              <option value="playstation">PlayStation</option>
              <option value="xbox">Xbox</option>
              <option value="nintendo">Nintendo</option>
              <option value="pc">PC</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Цена</label>
            <div class="flex items-center gap-2">
              <input v-model.number="filters.minPrice" type="number" placeholder="От" class="input-field text-sm" min="0" />
              <span class="text-gray-500">—</span>
              <input v-model.number="filters.maxPrice" type="number" placeholder="До" class="input-field text-sm" min="0" />
            </div>
          </div>
          <button @click="resetFilters" class="w-full text-sm text-gray-400 hover:text-white transition-colors">
            Сбросить фильтры
          </button>
        </div>
      </aside>

      <!-- Game grid -->
      <div class="flex-1">
        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="n in 8" :key="n" class="card">
            <div class="aspect-[3/4] skeleton"></div>
            <div class="p-3 space-y-2">
              <div class="skeleton h-4 w-3/4 rounded"></div>
              <div class="skeleton h-4 w-1/2 rounded"></div>
            </div>
          </div>
        </div>

        <div v-else-if="games.length === 0" class="text-center py-16">
          <p class="text-gray-400 text-lg">Ничего не найдено</p>
          <p class="text-gray-500 text-sm mt-2">Попробуйте изменить параметры поиска</p>
        </div>

        <div v-else>
          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <router-link
              v-for="game in games"
              :key="game.id"
              :to="`/game/${game.slug}`"
              class="card group"
            >
              <div class="aspect-[3/4] bg-surface-elevated relative overflow-hidden">
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-elevated to-surface-card">
                  <span class="text-4xl opacity-40">🎮</span>
                </div>
                <div v-if="game.old_price" class="absolute top-2 left-2 bg-primary text-black text-xs font-bold px-2 py-0.5 rounded">
                  -{{ Math.round((1 - game.price / game.old_price) * 100) }}%
                </div>
              </div>
              <div class="p-3">
                <p class="text-sm text-white truncate mb-1">{{ game.title }}</p>
                <p v-if="game.platform_name" class="text-xs text-gray-500 mb-1">{{ game.platform_name }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-primary">{{ formatPrice(game.price) }}</span>
                  <span v-if="game.old_price" class="text-xs text-gray-500 line-through">{{ formatPrice(game.old_price) }}</span>
                </div>
              </div>
            </router-link>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.pages > 1" class="flex items-center justify-center gap-2 mt-8">
            <button
              v-for="p in pagination.pages"
              :key="p"
              @click="filters.page = p"
              class="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
              :class="p === pagination.page ? 'bg-primary text-black' : 'bg-surface-elevated text-gray-300 hover:bg-surface-hover'"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getGames } from '@/api/games'
import { formatPrice } from '@/utils/formatPrice'
import { GENRES, SORT_OPTIONS } from '@/utils/constants'

const route = useRoute()

const games = ref([])
const loading = ref(true)
const pagination = ref({ page: 1, pages: 1, total: 0 })

const filters = reactive({
  sort: 'popular',
  genre: '',
  platform: '',
  minPrice: null,
  maxPrice: null,
  page: 1
})

const pageTitle = computed(() => {
  const cat = route.params.category
  const map = { 'games': 'Игры', 'gift-cards': 'Подарочные карты', 'currency': 'Игровая валюта', 'subscriptions': 'Подписки' }
  return map[cat] || 'Каталог'
})

async function loadGames() {
  loading.value = true
  try {
    const params = {
      sort: filters.sort,
      page: filters.page,
      limit: 20
    }
    if (route.params.category) params.category = route.params.category
    if (filters.genre) params.genre = filters.genre
    if (filters.platform) params.platform = filters.platform
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (route.query.search) params.search = route.query.search

    const { data } = await getGames(params)
    games.value = data.games
    pagination.value = data.pagination
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.sort = 'popular'
  filters.genre = ''
  filters.platform = ''
  filters.minPrice = null
  filters.maxPrice = null
  filters.page = 1
}

watch([filters, () => route.params.category, () => route.query.search], loadGames, { deep: true })
onMounted(loadGames)
</script>
