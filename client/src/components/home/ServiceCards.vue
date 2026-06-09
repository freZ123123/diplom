<template>
  <section class="py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl font-bold mb-6">Пополнение кошельков сервисов</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link
          v-for="service in services"
          :key="service.id"
          to="/wallet"
          class="block rounded-xl p-6 bg-gradient-to-br transition-transform hover:scale-[1.02] duration-200"
          :class="service.color"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-1">{{ service.name }}</h3>
              <p class="text-sm text-white/70">{{ service.desc }}</p>
            </div>
          </div>
          <span class="inline-block mt-4 badge-green text-xs">Комиссия 0%</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
const services = [
  { id: 'steam', name: 'Steam', desc: 'Моментально и безопасно', color: 'from-blue-600 to-blue-800' },
  { id: 'playstation', name: 'PlayStation', desc: 'Комиссия 0%', color: 'from-blue-500 to-indigo-700' },
  { id: 'roblox', name: 'Roblox Superpass', desc: 'Получи гейпасс в 100+ игр Roblox по низкой цене моментально', color: 'from-amber-600 to-orange-800' }
]
</script>
