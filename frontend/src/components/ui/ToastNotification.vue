<script setup lang="ts">
import { useNotificationsStore } from '../../stores/notifications'
import { useRouter } from 'vue-router'
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  ShoppingCart 
} from 'lucide-vue-next'

const notificationsStore = useNotificationsStore()
const router = useRouter()

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle2
    case 'error': return XCircle
    case 'warning': return AlertTriangle
    case 'info': return Info
    default: return CheckCircle2
  }
}

const getStyles = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'error':
      return 'bg-rose-50 text-rose-800 border-rose-200'
    case 'warning':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'info':
      return 'bg-blue-50 text-blue-800 border-blue-200'
    default:
      return 'bg-white text-gray-800 border-gray-100'
  }
}

const getIconColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-emerald-500'
    case 'error': return 'text-rose-500'
    case 'warning': return 'text-amber-500'
    case 'info': return 'text-blue-500'
    default: return 'text-primary'
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price)
}

const navigateToCart = () => {
  router.push('/cart')
  // Also clear cart toasts
  notificationsStore.toasts = notificationsStore.toasts.filter(t => t.type !== 'cart')
}
</script>

<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-50 flex flex-col gap-3 w-[90%] max-w-md pointer-events-none">
    <TransitionGroup 
      name="toast" 
      tag="div" 
      class="flex flex-col gap-3 w-full"
    >
      <div 
        v-for="toast in notificationsStore.toasts" 
        :key="toast.id" 
        class="pointer-events-auto w-full rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 relative overflow-hidden"
        :class="toast.type === 'cart' ? 'bg-primary text-white border-primary/20' : getStyles(toast.type)"
      >
        <!-- Standard Toast Layout -->
        <div v-if="toast.type !== 'cart'" class="flex gap-3 items-start">
          <component 
            :is="getIcon(toast.type)" 
            class="w-5 h-5 flex-shrink-0 mt-0.5" 
            :class="getIconColor(toast.type)"
          />
          <div class="flex-grow text-sm font-medium pr-4">
            {{ toast.message }}
          </div>
          <button 
            @click="notificationsStore.dismissToast(toast.id)"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Add To Cart Special Toast Layout (Mercado Libre Style) -->
        <div v-else class="flex flex-col gap-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5 text-emerald-400" />
              <span class="text-sm font-semibold tracking-wide">¡Añadido al carrito!</span>
            </div>
            <button 
              @click="notificationsStore.dismissToast(toast.id)"
              class="text-white/60 hover:text-white transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <div v-if="toast.product" class="flex gap-3 items-center">
            <img 
              :src="toast.product.image" 
              :alt="toast.product.name" 
              class="w-12 h-12 rounded-lg object-cover bg-white"
            />
            <div class="flex-grow min-w-0">
              <h4 class="text-sm font-bold truncate">{{ toast.product.name }}</h4>
              <p v-if="toast.product.variantText" class="text-xs text-white/70 truncate mt-0.5">
                {{ toast.product.variantText }}
              </p>
              <p class="text-sm font-semibold text-secondary mt-0.5">
                {{ formatPrice(toast.product.price) }}
              </p>
            </div>
          </div>

          <div class="flex gap-2 mt-1">
            <button 
              @click="navigateToCart"
              class="flex-grow bg-white text-primary hover:bg-white/90 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ShoppingCart class="w-3.5 h-3.5" />
              Ir al carrito
            </button>
            <button 
              @click="notificationsStore.dismissToast(toast.id)"
              class="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              Seguir comprando
            </button>
          </div>
        </div>

        <!-- Progress Indicator -->
        <div 
          v-if="toast.duration && toast.duration > 0"
          class="absolute bottom-0 left-0 h-[3px] bg-current opacity-20 animate-progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
.toast-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.toast-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

.animate-progress {
  animation-name: progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>
