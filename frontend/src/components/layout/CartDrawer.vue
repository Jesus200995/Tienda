<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import { X, Trash2, ShoppingCart, CheckSquare, Square } from 'lucide-vue-next'

interface Props {
  show: boolean
}

defineProps<Props>()
const emit = defineEmits(['close'])

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const cartItems = computed(() => cartStore.items)
const selectedSubtotal = computed(() => cartStore.selectedSubtotal)
const selectedShippingCost = computed(() => cartStore.selectedShippingCost)
const selectedTotal = computed(() => cartStore.selectedTotal)
const selectedCount = computed(() => cartStore.selectedCount)
const isEmpty = computed(() => cartStore.isEmpty)

const handleCheckoutRedirect = () => {
  if (selectedCount.value === 0) return
  emit('close')
  if (authStore.isAuthenticated) {
    router.push({ name: 'checkout' })
  } else {
    router.push({ name: 'auth', query: { redirect: '/checkout' } })
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="show" 
        class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex flex-col justify-end sm:flex-row sm:justify-end"
        @click.self="emit('close')"
      >
        <!-- Slide Panel -->
        <Transition
          enter-active-class="transition duration-400 ease-out-expo"
          enter-from-class="translate-y-full sm:translate-y-0 sm:translate-x-full"
          enter-to-class="translate-y-0 sm:translate-x-0"
          leave-active-class="transition duration-300 ease-in"
          leave-from-class="translate-y-0 sm:translate-x-0"
          leave-to-class="translate-y-full sm:translate-y-0 sm:translate-x-full"
        >
          <div 
            v-if="show"
            class="w-full sm:max-w-md h-[85dvh] sm:h-full bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] sm:shadow-xl flex flex-col justify-between rounded-t-3xl sm:rounded-none overflow-hidden"
          >
            <!-- Drawer Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white relative">
              <!-- Mobile grab handle indicator -->
              <div class="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-200 rounded-full sm:hidden"></div>
              <h3 class="text-base font-bold font-display uppercase tracking-wider text-primary flex items-center gap-2 mt-2 sm:mt-0">
                <ShoppingCart class="w-5 h-5 text-secondary" />
                Mi Carrito ({{ cartStore.itemCount }})
              </h3>
              <button 
                @click="emit('close')" 
                class="p-1 rounded-full text-slate-400 hover:text-primary transition-colors cursor-pointer hover:bg-slate-50"
                aria-label="Cerrar carrito"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            
            <!-- Drawer Content (Scrollable list) -->
            <div class="flex-grow overflow-y-auto px-4 py-4">
              
              <!-- Empty state -->
              <div v-if="isEmpty" class="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div class="p-4 bg-slate-50 rounded-full text-slate-400">
                  <ShoppingCart class="w-10 h-10" />
                </div>
                <p class="text-sm font-semibold text-primary">Tu carrito está vacío</p>
                <p class="text-xs text-slate-400 max-w-xs">¡Agrega prendas de nuestro catálogo para comenzar a lucir un estilo increíble!</p>
                <BaseButton variant="outline" size="sm" class="cursor-pointer mt-2" @click="() => { emit('close'); router.push({ name: 'catalog' }) }">
                  Explorar catálogo
                </BaseButton>
              </div>
              
              <!-- Items list -->
              <div v-else class="space-y-3">
                <div 
                  v-for="item in cartItems" 
                  :key="`${item.product.id}-${item.variant?.id || 'none'}`"
                  class="flex items-center gap-2.5 py-3 border-b border-slate-100 last:border-0 text-left transition-all duration-300"
                  :class="!item.selected ? 'opacity-55 scale-[0.98]' : ''"
                >
                  <!-- Checkbox Selection -->
                  <button 
                    @click="cartStore.toggleItemSelection(item.product.id, item.variant?.id)"
                    class="text-slate-400 hover:text-secondary p-1 rounded transition-colors cursor-pointer"
                    title="Seleccionar artículo"
                  >
                    <component 
                      :is="item.selected ? CheckSquare : Square" 
                      class="w-5 h-5" 
                      :class="item.selected ? 'text-secondary' : 'text-slate-300'"
                    />
                  </button>

                  <img 
                    :src="item.product.images[0]?.url" 
                    :alt="item.product.name" 
                    class="w-12 h-16 object-cover rounded-md bg-slate-50 border border-slate-100 flex-shrink-0"
                  />
                  
                  <div class="flex-grow min-w-0">
                    <h4 class="text-xs font-bold text-primary truncate">
                      {{ item.product.name }}
                    </h4>
                    <p v-if="item.variant" class="text-[10px] text-slate-400 mt-0.5 truncate">
                      Talla: {{ item.variant.size }} | {{ item.variant.color }}
                    </p>
                    
                    <div class="flex items-center justify-between mt-2">
                      <!-- Quantity selector -->
                      <div class="flex items-center border border-slate-100 rounded-md bg-slate-50 h-6">
                        <button 
                          @click="cartStore.updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)" 
                          class="w-6 h-full flex items-center justify-center text-xs text-slate-500 hover:text-primary transition-colors cursor-pointer font-bold"
                        >
                          -
                        </button>
                        <span class="w-5 text-center text-[10px] font-bold text-primary">
                          {{ item.quantity }}
                        </span>
                        <button 
                          @click="cartStore.updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)" 
                          class="w-6 h-full flex items-center justify-center text-xs text-slate-500 hover:text-primary transition-colors cursor-pointer font-bold"
                        >
                          +
                        </button>
                      </div>
                      
                      <!-- Price -->
                      <span class="text-xs font-black text-primary">
                        ${{ ((item.product.price + (item.variant?.price_adjustment || 0)) * item.quantity).toLocaleString() }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Trash remove button -->
                  <button 
                    @click="cartStore.removeItem(item.product.id, item.variant?.id)"
                    class="p-1.5 text-slate-300 hover:text-danger rounded-full hover:bg-danger/5 transition-colors cursor-pointer self-start"
                    title="Eliminar artículo"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
            </div>
            
            <!-- Drawer Footer (Subtotal and Checkout) -->
            <div v-if="!isEmpty" class="px-6 py-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div class="space-y-2 text-sm text-left">
                <div class="flex items-center justify-between text-slate-500">
                  <span class="text-xs font-semibold">Subtotal seleccionados</span>
                  <span class="font-bold text-primary">${{ selectedSubtotal.toLocaleString() }}</span>
                </div>
                <div class="flex items-center justify-between text-slate-500">
                  <span class="text-xs font-semibold">Costo de envío</span>
                  <span v-if="selectedShippingCost > 0" class="font-bold text-primary">${{ selectedShippingCost.toLocaleString() }}</span>
                  <span v-else-if="selectedCount > 0" class="font-black text-success text-xs uppercase tracking-wide">¡Envío Gratis!</span>
                  <span v-else class="font-bold text-primary">$0</span>
                </div>
                <div class="h-px bg-slate-100 my-1"></div>
                <div class="flex items-center justify-between text-base font-black text-primary">
                  <span>Total compra</span>
                  <span>${{ selectedTotal.toLocaleString() }}</span>
                </div>
              </div>
              
              <BaseButton 
                variant="secondary" 
                class="w-full cursor-pointer h-11 text-xs font-bold"
                :disabled="selectedCount === 0"
                @click="handleCheckoutRedirect"
              >
                Comprar ({{ selectedCount }} producto{{ selectedCount !== 1 ? 's' : '' }})
              </BaseButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
