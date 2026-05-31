<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product, ProductVariant } from '../../types'
import { useCartStore } from '../../stores/cart'
import { useNotificationsStore } from '../../stores/notifications'
import BaseButton from '../ui/BaseButton.vue'
import { ShoppingCart, Check } from 'lucide-vue-next'

interface Props {
  product: Product
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const cartStore = useCartStore()
const notificationsStore = useNotificationsStore()

// State
const selectedSize = ref('')
const selectedColor = ref('')
const quantity = ref(1)
const showAddedSuccess = ref(false)

// Computed Lists
const availableSizes = computed(() => {
  const sizes = new Set<string>()
  props.product.variants.forEach(v => {
    if (v.stock > 0) sizes.add(v.size)
  })
  return Array.from(sizes)
})

const availableColors = computed(() => {
  const colors = new Map<string, string>() // Name -> Hex
  props.product.variants.forEach(v => {
    if (v.stock > 0 && v.color_hex) {
      colors.set(v.color, v.color_hex)
    }
  })
  return Array.from(colors.entries()).map(([name, hex]) => ({ name, hex }))
})

// Auto-select first available variants
if (availableSizes.value.length > 0) {
  selectedSize.value = availableSizes.value[0]
}
if (availableColors.value.length > 0) {
  selectedColor.value = availableColors.value[0].name
}

const selectedVariant = computed((): ProductVariant | undefined => {
  return props.product.variants.find(
    v => v.size === selectedSize.value && v.color === selectedColor.value
  )
})

const currentPrice = computed(() => {
  const adjustment = selectedVariant.value?.price_adjustment || 0
  return props.product.price + adjustment
})

const maxStockAvailable = computed(() => {
  return selectedVariant.value ? selectedVariant.value.stock : props.product.stock
})

const handleAddToCart = () => {
  if (props.product.stock <= 0) return
  
  cartStore.addItem(props.product, quantity.value, selectedVariant.value)
  notificationsStore.showCartToast(props.product, selectedVariant.value, quantity.value)
  showAddedSuccess.value = true
  
  setTimeout(() => {
    showAddedSuccess.value = false
    emit('close')
  }, 1000)
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
    <!-- Left: Image -->
    <div class="aspect-[3/4] rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
      <img 
        :src="product.images[0]?.url || '/placeholder.png'" 
        :alt="product.name" 
        class="w-full h-full object-cover object-center"
      />
    </div>
    
    <!-- Right: Info -->
    <div class="flex flex-col">
      <div class="mb-4">
        <h4 class="text-xs uppercase tracking-wider font-bold text-secondary mb-1">
          El Comerciambre
        </h4>
        <h2 class="text-xl md:text-2xl font-display font-bold text-primary mb-2">
          {{ product.name }}
        </h2>
        
        <div class="flex items-baseline gap-3 my-3">
          <span class="text-2xl font-bold text-primary">
            ${{ currentPrice.toLocaleString() }}
          </span>
          <span v-if="product.compare_price" class="text-sm text-slate-400 line-through">
            ${{ product.compare_price.toLocaleString() }}
          </span>
        </div>
        
        <p class="text-sm text-slate-600 leading-normal mt-4">
          {{ product.description }}
        </p>
      </div>
      
      <!-- Variant Selectors -->
      <div class="space-y-4 my-6">
        <!-- Colors -->
        <div v-if="availableColors.length > 0">
          <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Color: <span class="text-primary">{{ selectedColor }}</span>
          </span>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="color in availableColors"
              :key="color.name"
              @click="selectedColor = color.name"
              :class="[
                'w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95',
                selectedColor === color.name 
                  ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-sm' 
                  : 'border-slate-200'
              ]"
              :style="{ backgroundColor: color.hex }"
              :title="color.name"
            >
              <Check v-if="selectedColor === color.name" class="w-3 h-3 text-white mix-blend-difference" />
            </button>
          </div>
        </div>

        <!-- Sizes -->
        <div v-if="availableSizes.length > 0">
          <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Talla: <span class="text-primary">{{ selectedSize }}</span>
          </span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in availableSizes"
              :key="size"
              @click="selectedSize = size"
              :class="[
                'min-w-10 h-10 px-3 border text-xs font-semibold rounded-md flex items-center justify-center transition-all cursor-pointer',
                selectedSize === size 
                  ? 'border-primary bg-primary text-white font-bold' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div v-if="product.stock > 0">
          <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Cantidad
          </span>
          <div class="flex items-center gap-3">
            <div class="flex items-center border border-slate-200 rounded-md">
              <button 
                @click="quantity = Math.max(1, quantity - 1)" 
                class="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-primary transition-colors cursor-pointer"
              >
                -
              </button>
              <span class="w-10 text-center text-sm font-semibold text-primary">
                {{ quantity }}
              </span>
              <button 
                @click="quantity = Math.min(maxStockAvailable, quantity + 1)" 
                class="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-primary transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
            <span class="text-xs text-slate-400">
              ({{ maxStockAvailable }} disponibles)
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-auto pt-4 border-t border-slate-100 flex gap-4">
        <BaseButton 
          v-if="product.stock > 0"
          :variant="showAddedSuccess ? 'success' : 'primary'" 
          class="w-full cursor-pointer h-12"
          @click="handleAddToCart"
          :disabled="showAddedSuccess"
        >
          <template v-if="showAddedSuccess">
            <Check class="w-5 h-5 mr-2" />
            ¡Agregado con éxito!
          </template>
          <template v-else>
            <ShoppingCart class="w-5 h-5 mr-2" />
            Añadir al carrito
          </template>
        </BaseButton>
        <BaseButton 
          v-else 
          variant="outline" 
          disabled 
          class="w-full h-12"
        >
          Agotado temporalmente
        </BaseButton>
      </div>
    </div>
  </div>
</template>
