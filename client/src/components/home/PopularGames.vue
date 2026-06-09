<template>
  <section class="py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🎮</span>
          <h2 class="text-2xl font-bold">Игры</h2>
        </div>
        <div class="flex items-center gap-2">
          <button @click="scroll(-1)" class="p-2 bg-surface-elevated rounded-lg border border-border hover:bg-surface-hover transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button @click="scroll(1)" class="p-2 bg-surface-elevated rounded-lg border border-border hover:bg-surface-hover transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div class="flex gap-2 mb-5">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="activeTab === tab.value ? 'bg-primary text-black' : 'bg-surface-elevated text-gray-300 hover:text-white'"
        >
          {{ tab.label }}
        </button>
      </div>

      <div ref="scrollContainer" class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style="scroll-behavior: smooth;">
        <router-link
          v-for="game in games"
          :key="game.id"
          :to="`/game/${game.slug}`"
          class="card shrink-0 w-48 group"
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
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-primary">{{ formatPrice(game.price) }}</span>
              <span v-if="game.old_price" class="text-xs text-gray-500 line-through">{{ formatPrice(game.old_price) }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getGames } from '@/api/games'
import { formatPrice } from '@/utils/formatPrice'

const tabs = [
  { value: 'gift', label: 'Гифтом' },
  { value: 'key', label: 'Ключом' }
]

const activeTab = ref('key')
const games = ref([])
const scrollContainer = ref(null)

async function loadGames() {
  try {
    const { data } = await getGames({ category: 'games', type: activeTab.value, limit: 12, sort: 'popular' })
    games.value = data.games
  } catch (e) {
    console.error('Не удалось загрузить игры', e)
  }
}

function scroll(direction) {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += direction * 400
  }
}

onMounted(loadGames)
watch(activeTab, loadGames)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
