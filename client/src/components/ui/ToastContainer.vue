<template>
  <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
    <transition-group name="toast">
      <div
        v-for="toast in ui.toasts"
        :key="toast.id"
        class="px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[280px] max-w-sm flex items-center gap-2"
        :class="{
          'bg-green-600 text-white': toast.type === 'success',
          'bg-red-600 text-white': toast.type === 'error',
          'bg-blue-600 text-white': toast.type === 'info'
        }"
      >
        <svg v-if="toast.type === 'success'" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="toast.type === 'error'" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(80px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(80px);
}
</style>
