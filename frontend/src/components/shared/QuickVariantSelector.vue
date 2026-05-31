<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product, ProductVariant } from '../../types'
import { useCartStore } from '../../stores/cart'
import { useNotificationsStore } from '../../stores/notifications'
import BaseButton from '../ui/BaseButton.vue'
import { X, Minus, Plus, ShoppingCart } from 'lucide-vue-next'

const props = defineProps<{
  product: Product
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'added'): void
}>()

const cartStore = useCartStore()
const notificationsStore = useNotificationsStore()

const selectedColor = ref<string>('')
const selectedSize = ref<string>('')
const quantity = ref<number>(1)

// Reset state when product changes
watch(() => props.product, (newProduct) => {
  if (newProduct && newProduct.variants.length > 0) {
    // Select first available variant's color and size
    const firstVariant = newProduct.variants[0]
    selectedColor.value = firstVariant.color
    selectedSize.value = firstVariant.size
    quantity.value = 1
  }
}, { immediate: true })

// Get unique colors available in variants
const uniqueColors = computed(() => {
  const colorsMap = new Map<string, string>()
  props.product.variants.forEach(v => {
    if (v.color && !colorsMap.has(v.color)) {
      colorsMap.set(v.color, v.color_hex || '#ccc')
    }
  })
  return Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }))
})

// Get available sizes for the currently selected color
const availableSizes = computed(() => {
  if (!selectedColor.value) return []
  return props.product.variants
    .filter(v => v.color === selectedColor.value)
    .map(v => ({
      size: v.size,
      stock: v.stock,
      variant: v
    }))
})

// Update selected size if the new color doesn't have the previously selected size
watch(selectedColor, (newColor) => {
  const sizesForColor = props.product.variants.filter(v => v.color === newColor)
  const sizeStillAvailable = sizesForColor.some(v => v.size === selectedSize.value)
  
  if (!sizeStillAvailable && sizesForColor.length > 0) {
    selectedSize.value = sizesForColor[0].size
  }
})

// Get currently selected variant
const selectedVariant = computed<ProductVariant | undefined>(() => {
  return props.product.variants.find(
    v => v.color === selectedColor.value && v.size === selectedSize.value
  )
})

// Active price considering price adjustment
const activePrice = computed(() => {
  const base = props.product.price
  const adjustment = selectedVariant.value?.price_adjustment || 0
  return base + adjustment
})

// Stock checking
const maxStock = computed(() => {
  if (selectedVariant.value) return selectedVariant.value.stock
  return props.product.stock
})

const isOutOfStock = computed(() => {
  return maxStock.value <= 0
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price)
}

const incrementQty = () => {
  if (quantity.value < maxStock.value) {
    quantity.value++
  }
}

const decrementQty = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleAddToCart = () => {
  if (isOutOfStock.value) return
  
  cartStore.addItem(props.product, quantity.value, selectedVariant.value)
  notificationsStore.showCartToast(props.product, selectedVariant.value, quantity.value)
  
  emit('added')
  emit('close')
}
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="show" 
      class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-auto"
      @click.self="emit('close')"
    >
      <div 
        class="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-hover overflow-hidden transition-all duration-300 transform max-h-[90vh] flex flex-col pointer-events-auto animate-slide-up"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="font-bold text-gray-800 text-base md:text-lg truncate pr-4">
            Selecciona opciones
          </h3>
          <button 
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 overflow-y-auto flex-grow flex flex-col gap-5">
          <!-- Product Summary -->
          <div class="flex gap-4">
            <img 
              :src="product.images && product.images.length > 0 ? product.images[0].url : '/placeholder.png'" 
              :alt="product.name" 
              class="w-20 h-20 rounded-xl object-cover border border-gray-100 bg-gray-50 flex-shrink-0"
            />
            <div class="flex flex-col justify-center min-w-0">
              <h4 class="font-bold text-gray-800 text-sm md:text-base leading-tight truncate mb-1">
                {{ product.name }}
              </h4>
              <div class="flex items-baseline gap-2">
                <span class="text-lg font-black text-secondary">
                  {{ formatPrice(activePrice) }}
                </span>
                <span 
                  v-if="product.compare_price" 
                  class="text-xs text-gray-400 line-through"
                >
                  {{ formatPrice(product.compare_price) }}
                </span>
              </div>
              <span class="text-xs text-emerald-600 font-semibold mt-1">
                Disponible en Tienda
              </span>
            </div>
          </div>

          <!-- Color Selector -->
          <div v-if="uniqueColors.length > 0" class="flex flex-col gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Color: <span class="text-gray-800 normal-case">{{ selectedColor }}</span>
            </span>
            <div class="flex flex-wrap gap-2.5">
              <button 
                v-for="color in uniqueColors" 
                :key="color.name"
                @click="selectedColor = color.name"
                class="w-8 h-8 rounded-full border-2 transition-all relative flex items-center justify-center cursor-pointer shadow-xs active:scale-90"
                :class="selectedColor === color.name ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-gray-200 hover:border-gray-400'"
                :title="color.name"
              >
                <span 
                  class="w-6 h-6 rounded-full border border-black/10" 
                  :style="{ backgroundColor: color.hex }"
                ></span>
              </button>
            </div>
          </div>

          <!-- Size Selector -->
          <div v-if="availableSizes.length > 0" class="flex flex-col gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Talla: <span class="text-gray-800 normal-case">{{ selectedSize }}</span>
            </span>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="item in availableSizes" 
                :key="item.size"
                @click="item.stock > 0 ? selectedSize = item.size : null"
                class="h-10 min-w-[2.5rem] px-3 rounded-lg border text-sm font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95"
                :class="[
                  selectedSize === item.size 
                    ? 'bg-primary text-white border-primary shadow-sm' 
                    : item.stock > 0 
                      ? 'bg-white text-gray-700 border-gray-200 hover:border-gray-400' 
                      : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                ]"
                :disabled="item.stock <= 0"
              >
                {{ item.size }}
              </button>
            </div>
          </div>

          <!-- Quantity and Stock -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-50">
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Cantidad</span>
              <span class="text-xs text-gray-500 font-medium">
                {{ isOutOfStock ? 'Agotado' : `(${maxStock} disponibles)` }}
              </span>
            </div>
            
            <div 
              v-if="!isOutOfStock" 
              class="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shadow-xs h-10"
            >
              <button 
                @click="decrementQty"
                class="w-10 h-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-30 cursor-pointer"
                :disabled="quantity <= 1"
              >
                <Minus class="w-4 h-4" />
              </button>
              <span class="w-10 text-center font-bold text-gray-800 text-sm">
                {{ quantity }}
              </span>
              <button 
                @click="incrementQty"
                class="w-10 h-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-30 cursor-pointer"
                :disabled="quantity >= maxStock"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <BaseButton 
            variant="primary"
            class="flex-grow flex items-center justify-center gap-2 h-12 text-sm font-bold shadow-md cursor-pointer"
            :disabled="isOutOfStock"
            @click="handleAddToCart"
          >
            <ShoppingCart class="w-4 h-4" />
            {{ isOutOfStock ? 'Agotado' : 'Agregar al carrito' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@media (min-width: 768px) {
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(15px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
}

.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
