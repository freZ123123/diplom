<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-[90] flex items-center justify-center p-4" @click.self="close">
        <div class="fixed inset-0 bg-black/70" @click="close"></div>
        <div class="relative bg-surface-card border border-border rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto" :class="maxWidthClass">
          <button @click="close" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="p-6">
            <h3 v-if="title" class="text-xl font-bold mb-4 pr-8">{{ title }}</h3>
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  maxWidth: { type: String, default: 'md' }
})

const emit = defineEmits(['update:modelValue'])

const maxWidthClass = computed(() => {
  const map = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' }
  return map[props.maxWidth] || 'max-w-md'
})

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active { transition: all 0.25s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative, .modal-leave-to .relative { transform: scale(0.95); }
</style>
