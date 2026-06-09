<template>
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-green-900/30 via-surface to-surface"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
      <h1 class="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
        Экосистема для <span class="text-primary">геймеров</span>,<br>
        созданная <span class="text-primary">геймерами</span>
      </h1>
      <p class="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
        Пополняй кошельки сервисов, покупай игры, игровую валюту и не только!
      </p>
      <div class="max-w-lg mx-auto mb-8">
        <div class="relative">
          <input
            v-model="query"
            type="text"
            placeholder="Поиск"
            class="w-full bg-surface-card border border-border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
            @keydown.enter="goSearch"
          />
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div class="flex items-center justify-center gap-2 mb-2">
        <span v-for="(c, i) in bloggerColors" :key="i" class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" :class="c.bg">
          {{ c.letter }}
        </span>
      </div>
      <p class="text-gray-500 text-sm">Нас рекомендуют 1500+ блогеров</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')

const bloggerColors = [
  { letter: 'F', bg: 'bg-green-500' },
  { letter: 'V', bg: 'bg-green-600' },
  { letter: 'R', bg: 'bg-red-500' },
  { letter: 'M', bg: 'bg-yellow-500' },
  { letter: 'C', bg: 'bg-blue-500' },
  { letter: 'D', bg: 'bg-orange-500' }
]

function goSearch() {
  if (query.value.trim()) {
    router.push({ path: '/catalog', query: { search: query.value.trim() } })
  }
}
</script>
