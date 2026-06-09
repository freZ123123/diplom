<template>
  <section class="py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔑</span>
          <h2 class="text-2xl font-bold">Магазин цифровых товаров</h2>
        </div>
        <div class="flex items-center gap-2">
          <button @click="scrollRow(-1)" class="p-2 bg-surface-elevated rounded-lg border border-border hover:bg-surface-hover transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button @click="scrollRow(1)" class="p-2 bg-surface-elevated rounded-lg border border-border hover:bg-surface-hover transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div class="flex gap-2 mb-6">
        <router-link
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/catalog/${cat.slug}`"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="activeCategory === cat.slug ? 'bg-primary text-black' : 'bg-surface-elevated text-gray-300 hover:text-white'"
          @click.prevent="activeCategory = cat.slug"
        >
          {{ cat.name }}
        </router-link>
      </div>

      <div ref="row" class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style="scroll-behavior: smooth;">
        <router-link
          v-for="item in platformItems"
          :key="item.slug"
          :to="`/catalog/${activeCategory}?platform=${item.slug}`"
          class="shrink-0 flex flex-col items-center gap-2 group"
        >
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110" :class="item.color">
            {{ item.name.charAt(0) }}
          </div>
          <span class="text-xs text-gray-400 group-hover:text-white transition-colors">{{ item.name }}</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const categories = ref([
  { name: 'Игры', slug: 'games' },
  { name: 'Подарочные карты', slug: 'gift-cards' },
  { name: 'Игровая валюта', slug: 'currency' },
  { name: 'Подписки', slug: 'subscriptions' }
])

const activeCategory = ref('games')
const row = ref(null)

const platformItems = [
  { name: 'Распродажа', slug: 'sale', color: 'bg-yellow-500' },
  { name: 'Steam', slug: 'steam', color: 'bg-blue-700' },
  { name: 'Steam', slug: 'steam-2', color: 'bg-blue-800' },
  { name: 'Roblox', slug: 'roblox', color: 'bg-red-600' },
  { name: 'PS Store', slug: 'playstation', color: 'bg-blue-600' },
  { name: 'AppStore & iTunes', slug: 'appstore', color: 'bg-pink-500' },
  { name: 'Nintendo eShop', slug: 'nintendo', color: 'bg-red-500' },
  { name: 'Valorant', slug: 'valorant', color: 'bg-rose-600' },
  { name: 'PUBG Mobile', slug: 'pubg', color: 'bg-yellow-600' },
  { name: 'Blizzard', slug: 'blizzard', color: 'bg-blue-500' },
  { name: 'GTA 5', slug: 'gta', color: 'bg-green-600' },
  { name: 'Xbox', slug: 'xbox', color: 'bg-green-500' }
]

function scrollRow(dir) {
  if (row.value) {
    row.value.scrollLeft += dir * 300
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
