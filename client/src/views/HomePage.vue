<template>
  <div>
    <HeroBanner />
    <PopularGames />
    <CategoryCards />
    <ServiceCards />
    <div class="text-center py-8 text-gray-500 text-sm">
      WW MARKET Гарантирует безопасность всех транзакций
    </div>
  </div>
</template>

<script setup>
import HeroBanner from '@/components/home/HeroBanner.vue'
import PopularGames from '@/components/home/PopularGames.vue'
import CategoryCards from '@/components/home/CategoryCards.vue'
import ServiceCards from '@/components/home/ServiceCards.vue'
</script>
