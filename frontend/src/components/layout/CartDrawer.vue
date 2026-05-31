<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import { X, Trash2, ShoppingBag } from 'lucide-vue-next'

interface Props {
  show: boolean
}

defineProps<Props>()
const emit = defineEmits(['close'])

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const cartItems = computed(() => cartStore.items)
const cartSubtotal = computed(() => cartStore.cartSubtotal)
const shippingCost = computed(() => cartStore.shippingCost)
const cartTotal = computed(() => cartStore.cartTotal)
const isEmpty = computed(() => cartStore.isEmpty)

const handleCheckoutRedirect = () => {
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
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
        @click.self="emit('close')"
      >
        <!-- Slide Panel -->
        <Transition
          enter-active-class="transition duration-400 ease-out-expo"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition duration-300 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div 
            v-if="show"
            class="w-full max-w-md h-full bg-white shadow-xl flex flex-col justify-between"
          >
            <!-- Drawer Header -->
            <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 class="text-base font-bold font-display uppercase tracking-wider text-primary flex items-center gap-2">
                <ShoppingBag class="w-5 h-5 text-secondary" />
                Mi Carrito
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
            <div class="flex-grow overflow-y-auto px-6 py-4">
              
              <!-- Empty state -->
              <div v-if="isEmpty" class="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div class="p-4 bg-slate-50 rounded-full text-slate-400">
                  <ShoppingBag class="w-10 h-10" />
                </div>
                <p class="text-sm font-semibold text-primary">Tu carrito está vacío</p>
                <p class="text-xs text-slate-400 max-w-xs">¡Agrega prendas de nuestro catálogo para comenzar a lucir un estilo increíble!</p>
                <BaseButton variant="outline" size="sm" class="cursor-pointer mt-2" @click="() => { emit('close'); router.push({ name: 'catalog' }) }">
                  Explorar catálogo
                </BaseButton>
              </div>
              
              <!-- Items list -->
              <div v-else class="space-y-4">
                <div 
                  v-for="item in cartItems" 
                  :key="`${item.product.id}-${item.variant?.id || 'none'}`"
                  class="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0 text-left"
                >
                  <img 
                    :src="item.product.images[0]?.url" 
                    :alt="item.product.name" 
                    class="w-16 h-20 object-cover rounded-md bg-slate-50 border border-slate-100"
                  />
                  
                  <div class="flex-grow">
                    <h4 class="text-xs font-semibold text-primary truncate max-w-[200px]">
                      {{ item.product.name }}
                    </h4>
                    <p v-if="item.variant" class="text-[10px] text-slate-400 mt-0.5">
                      Talla: {{ item.variant.size }} | Color: {{ item.variant.color }}
                    </p>
                    
                    <div class="flex items-center justify-between mt-2.5">
                      <!-- Quantity selector -->
                      <div class="flex items-center border border-slate-100 rounded-md bg-slate-50">
                        <button 
                          @click="cartStore.updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)" 
                          class="w-7 h-7 flex items-center justify-center text-xs text-slate-500 hover:text-primary transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span class="w-6 text-center text-xs font-bold text-primary">
                          {{ item.quantity }}
                        </span>
                        <button 
                          @click="cartStore.updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)" 
                          class="w-7 h-7 flex items-center justify-center text-xs text-slate-500 hover:text-primary transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      
                      <!-- Price -->
                      <span class="text-xs font-bold text-primary">
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
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
            </div>
            
            <!-- Drawer Footer (Subtotal and Checkout) -->
            <div v-if="!isEmpty" class="px-6 py-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div class="space-y-2 text-sm text-left">
                <div class="flex items-center justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span class="font-semibold text-primary">${{ cartSubtotal.toLocaleString() }}</span>
                </div>
                <div class="flex items-center justify-between text-slate-500">
                  <span>Costo de envío</span>
                  <span v-if="shippingCost > 0" class="font-semibold text-primary">${{ shippingCost.toLocaleString() }}</span>
                  <span v-else class="font-bold text-success text-xs uppercase tracking-wide">¡Envío Gratis!</span>
                </div>
                <div class="h-px bg-slate-100 my-1"></div>
                <div class="flex items-center justify-between text-base font-bold text-primary">
                  <span>Total</span>
                  <span>${{ cartTotal.toLocaleString() }}</span>
                </div>
              </div>
              
              <BaseButton 
                variant="secondary" 
                class="w-full cursor-pointer h-11"
                @click="handleCheckoutRedirect"
              >
                Proceder al pago
              </BaseButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
