<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/products'
import { useCartStore } from '../../stores/cart'
import ProductCard from '../../components/shared/ProductCard.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import { ShoppingBag, Check, ArrowLeft, ShieldCheck, Truck, RefreshCcw } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

const slug = computed(() => route.params.slug as string)
const product = computed(() => productStore.getProductBySlug(slug.value))

// State
const selectedSize = ref('')
const selectedColor = ref('')
const quantity = ref(1)
const showAddedSuccess = ref(false)

// Re-fetch or re-initialize values when product slug changes
const initializeProductState = () => {
  if (!product.value) return
  
  const sizes = availableSizes.value
  const colors = availableColors.value
  
  if (sizes.length > 0) {
    selectedSize.value = sizes[0]
  }
  if (colors.length > 0) {
    selectedColor.value = colors[0].name
  }
  quantity.value = 1
}

// Computed Lists
const availableSizes = computed(() => {
  if (!product.value) return []
  const sizes = new Set<string>()
  product.value.variants.forEach(v => {
    if (v.stock > 0) sizes.add(v.size)
  })
  return Array.from(sizes)
})

const availableColors = computed(() => {
  if (!product.value) return []
  const colors = new Map<string, string>() // Name -> Hex
  product.value.variants.forEach(v => {
    if (v.stock > 0 && v.color_hex) {
      colors.set(v.color, v.color_hex)
    }
  })
  return Array.from(colors.entries()).map(([name, hex]) => ({ name, hex }))
})

// Trigger init
initializeProductState()

const selectedVariant = computed(() => {
  if (!product.value) return undefined
  return product.value.variants.find(
    v => v.size === selectedSize.value && v.color === selectedColor.value
  )
})

const currentPrice = computed(() => {
  if (!product.value) return 0
  const adjustment = selectedVariant.value?.price_adjustment || 0
  return product.value.price + adjustment
})

const maxStockAvailable = computed(() => {
  if (!product.value) return 0
  return selectedVariant.value ? selectedVariant.value.stock : product.value.stock
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return productStore.products.filter(
    p => p.category_id === product.value?.category_id && p.id !== product.value?.id && p.active
  )
})

const handleAddToCart = () => {
  if (!product.value || product.value.stock <= 0) return
  
  cartStore.addItem(product.value, quantity.value, selectedVariant.value)
  showAddedSuccess.value = true
  
  setTimeout(() => {
    showAddedSuccess.value = false
  }, 1500)
}
</script>

<template>
  <div v-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    
    <!-- Go back link -->
    <div class="mb-6 text-left">
      <button 
        @click="router.back()"
        class="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        Regresar
      </button>
    </div>

    <!-- Product Layout Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 text-left mb-20">
      
      <!-- Left: Product Image Gallery -->
      <div class="aspect-[3/4] rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shadow-soft">
        <img 
          :src="product.images[0]?.url || '/placeholder.png'" 
          :alt="product.name" 
          class="w-full h-full object-cover object-center"
        />
      </div>

      <!-- Right: Detailed Product Info & variant selectors -->
      <div class="flex flex-col">
        <div class="border-b border-slate-100 pb-5">
          <span class="inline-block px-2.5 py-0.5 bg-secondary/10 text-secondary text-[10px] font-extrabold tracking-widest uppercase rounded-md mb-2">
            El Comerciambre Originals
          </span>
          <h1 class="text-3xl lg:text-4xl font-display font-black text-primary leading-tight">
            {{ product.name }}
          </h1>
          
          <div class="flex items-baseline gap-3.5 my-4">
            <span class="text-3xl font-black text-primary">
              ${{ currentPrice.toLocaleString() }}
            </span>
            <span v-if="product.compare_price" class="text-sm text-slate-400 line-through">
              ${{ product.compare_price.toLocaleString() }}
            </span>
          </div>
        </div>

        <div class="py-5 border-b border-slate-100">
          <p class="text-sm text-slate-600 leading-relaxed">
            {{ product.description }}
          </p>
        </div>

        <!-- Variant Selectors -->
        <div class="space-y-5 py-6">
          <!-- Colors -->
          <div v-if="availableColors.length > 0">
            <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Seleccionar Color: <span class="text-primary">{{ selectedColor }}</span>
            </span>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="color in availableColors"
                :key="color.name"
                @click="selectedColor = color.name"
                :class="[
                  'w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95',
                  selectedColor === color.name 
                    ? 'border-primary ring-3 ring-primary/20 scale-105 shadow-sm' 
                    : 'border-slate-200'
                ]"
                :style="{ backgroundColor: color.hex }"
                :title="color.name"
              >
                <Check v-if="selectedColor === color.name" class="w-3.5 h-3.5 text-white mix-blend-difference" />
              </button>
            </div>
          </div>

          <!-- Sizes -->
          <div v-if="availableSizes.length > 0">
            <div class="flex justify-between items-center mb-2.5">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
                Seleccionar Talla: <span class="text-primary">{{ selectedSize }}</span>
              </span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-secondary border-b border-secondary/20 hover:border-secondary transition-all pb-0.5 cursor-pointer">
                Guía de tallas
              </span>
            </div>
            
            <div class="flex flex-wrap gap-2.5">
              <button
                v-for="size in availableSizes"
                :key="size"
                @click="selectedSize = size"
                :class="[
                  'min-w-11 h-11 px-3 border text-xs font-bold rounded-md flex items-center justify-center transition-all cursor-pointer',
                  selectedSize === size 
                    ? 'border-primary bg-primary text-white font-black shadow-sm' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                ]"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <!-- Quantity selection -->
          <div v-if="product.stock > 0">
            <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Cantidad
            </span>
            <div class="flex items-center gap-3">
              <div class="flex items-center border border-slate-200 rounded-md bg-white">
                <button 
                  @click="quantity = Math.max(1, quantity - 1)" 
                  class="w-10 h-10 flex items-center justify-center text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer font-bold"
                >
                  -
                </button>
                <span class="w-10 text-center text-sm font-bold text-primary">
                  {{ quantity }}
                </span>
                <button 
                  @click="quantity = Math.min(maxStockAvailable, quantity + 1)" 
                  class="w-10 h-10 flex items-center justify-center text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer font-bold"
                >
                  +
                </button>
              </div>
              <span class="text-xs text-slate-400 font-semibold">
                ({{ maxStockAvailable }} unidades disponibles)
              </span>
            </div>
          </div>
        </div>

        <!-- Add to cart -->
        <div class="py-5 border-t border-slate-100 flex gap-4">
          <BaseButton 
            v-if="product.stock > 0"
            :variant="showAddedSuccess ? 'success' : 'primary'" 
            class="flex-grow cursor-pointer h-12 shadow-sm"
            @click="handleAddToCart"
            :disabled="showAddedSuccess"
          >
            <template v-slot:default>
              <template v-if="showAddedSuccess">
                <Check class="w-5 h-5 mr-2" />
                ¡Artículo agregado con éxito!
              </template>
              <template v-else>
                <ShoppingBag class="w-5 h-5 mr-2" />
                Añadir a mi Bolsa
              </template>
            </template>
          </BaseButton>
          <BaseButton 
            v-else 
            variant="outline" 
            disabled 
            class="flex-grow h-12"
          >
            Agotado temporalmente
          </BaseButton>
        </div>

        <!-- Extra details checklist -->
        <div class="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-500">
          <div class="flex items-center gap-2">
            <Truck class="w-4 h-4 text-secondary" />
            <span>Envío gratis sobre $2,000</span>
          </div>
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-secondary" />
            <span>Compra 100% segura</span>
          </div>
          <div class="flex items-center gap-2">
            <RefreshCcw class="w-4 h-4 text-secondary" />
            <span>Devoluciones gratis</span>
          </div>
        </div>

      </div>

    </div>

    <!-- Related products -->
    <div v-if="relatedProducts.length > 0" class="border-t border-slate-100 pt-16">
      <div class="mb-10 text-left">
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-secondary block mb-1">
          También te puede gustar
        </span>
        <h2 class="text-xl sm:text-2xl font-display font-bold text-primary">
          Productos Relacionados
        </h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard 
          v-for="prod in relatedProducts" 
          :key="prod.id" 
          :product="prod"
        />
      </div>
    </div>

  </div>

  <div v-else class="py-20 text-center">
    <p class="text-sm text-slate-400">Cargando detalles de prenda...</p>
  </div>
</template>
