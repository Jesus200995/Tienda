<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product } from '../../types'
import { useCartStore } from '../../stores/cart'
import { useNotificationsStore } from '../../stores/notifications'
import QuickVariantSelector from './QuickVariantSelector.vue'
import BaseButton from '../ui/BaseButton.vue'
import { Eye, ShoppingCart } from 'lucide-vue-next'

interface Props {
  product: Product
}

const props = defineProps<Props>()
const emit = defineEmits(['quick-view'])

const cartStore = useCartStore()
const notificationsStore = useNotificationsStore()
const hovered = ref(false)
const showSelector = ref(false)

const primaryImage = computed(() => {
  return props.product.images.find((img: any) => img.is_primary)?.url || props.product.images[0]?.url || '/placeholder.png'
})

const secondaryImage = computed(() => {
  const secondary = props.product.images.find((img: any) => !img.is_primary)
  return secondary?.url || primaryImage.value
})

const displayImage = computed(() => {
  return hovered.value ? secondaryImage.value : primaryImage.value
})

const discount = computed(() => {
  if (!props.product.compare_price || props.product.compare_price <= props.product.price) return 0
  const diff = props.product.compare_price - props.product.price
  return Math.round((diff / props.product.compare_price) * 100)
})

const handleAddToCart = (e: Event) => {
  e.stopPropagation()
  
  if (props.product.variants && props.product.variants.length > 1) {
    showSelector.value = true
  } else {
    const defaultVariant = props.product.variants?.[0]
    cartStore.addItem(props.product, 1, defaultVariant)
    notificationsStore.showCartToast(props.product, defaultVariant, 1)
  }
}
</script>


<template>
  <div 
    class="group relative flex flex-col w-full bg-white rounded-lg overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-medium hover:-translate-y-1"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Badges / Discount -->
    <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
      <span v-if="discount > 0" class="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-secondary text-white rounded-md">
        {{ discount }}% OFF
      </span>
      <span v-if="product.featured" class="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-accent text-white rounded-md">
        Destacado
      </span>
      <span v-if="product.stock <= 0" class="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-slate-500 text-white rounded-md">
        Agotado
      </span>
    </div>

    <!-- Product Image -->
    <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="relative block aspect-[3/4] overflow-hidden bg-slate-50">
      <img 
        :src="displayImage" 
        :alt="product.name"
        class="w-full h-full object-cover object-center transition-all duration-550 ease-out-expo group-hover:scale-105"
        loading="lazy"
      />
      <!-- Hover overlays / Quick actions for desktop -->
      <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
        <div class="flex gap-2 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out-expo">
          <BaseButton 
            variant="outline" 
            size="sm" 
            class="flex-1 bg-white hover:bg-slate-50 cursor-pointer"
            @click.prevent="emit('quick-view', product)"
          >
            <Eye class="w-4 h-4 mr-1.5 text-primary" />
            Ver
          </BaseButton>
          <BaseButton 
            v-if="product.stock > 0"
            variant="primary" 
            size="sm" 
            class="flex-1 cursor-pointer"
            @click.prevent="handleAddToCart"
          >
            <ShoppingCart class="w-4 h-4 mr-1.5 text-white" />
            Añadir
          </BaseButton>
        </div>
      </div>
    </RouterLink>

    <!-- Details -->
    <div class="flex flex-col flex-grow p-4 text-left">
      <h3 class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1 mb-1.5">
        El Comerciambre
      </h3>
      <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block font-medium text-slate-800 hover:text-secondary text-sm line-clamp-1 mb-2 transition-colors">
        {{ product.name }}
      </RouterLink>
      
      <!-- Price and Cart button (visible in mobile always) -->
      <div class="flex items-center justify-between mt-auto">
        <div class="flex items-baseline gap-2">
          <span class="text-base font-semibold text-primary">
            ${{ product.price.toLocaleString() }}
          </span>
          <span v-if="product.compare_price" class="text-xs text-slate-400 line-through">
            ${{ product.compare_price.toLocaleString() }}
          </span>
        </div>
        
        <!-- Mobile Add to Cart Icon -->
        <button 
          v-if="product.stock > 0"
          @click.stop="handleAddToCart"
          class="md:hidden p-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 text-primary transition-all duration-300 cursor-pointer"
          aria-label="Agregar al carrito"
        >
          <ShoppingCart class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Quick Variant Selector Popup Modal -->
    <QuickVariantSelector 
      :product="product" 
      :show="showSelector" 
      @close="showSelector = false" 
    />
  </div>
</template>
