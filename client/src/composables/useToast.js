import { useUiStore } from '@/stores/ui'

export function useToast() {
  const ui = useUiStore()

  return {
    success: (msg) => ui.showToast(msg, 'success'),
    error: (msg) => ui.showToast(msg, 'error'),
    info: (msg) => ui.showToast(msg, 'info')
  }
}
