<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import BaseButton from '../../components/ui/BaseButton.vue'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-vue-next'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const cartItems = computed(() => cartStore.items)
const cartSubtotal = computed(() => cartStore.cartSubtotal)
const shippingCost = computed(() => cartStore.shippingCost)
const cartTotal = computed(() => cartStore.cartTotal)
const isEmpty = computed(() => cartStore.isEmpty)

const handleCheckoutRedirect = () => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'checkout' })
  } else {
    router.push({ name: 'auth', query: { redirect: '/checkout' } })
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    
    <!-- Top banner -->
    <div class="mb-8 text-left">
      <button 
        @click="router.back()"
        class="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors cursor-pointer mb-2"
      >
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        Seguir comprando
      </button>
      <h1 class="text-3xl font-display font-black text-primary">
        Bolsa de Compras
      </h1>
      <p class="text-xs text-slate-400 mt-1 font-semibold">
        Tienes {{ cartStore.itemCount }} artículos en tu bolsa.
      </p>
    </div>

    <!-- Empty state -->
    <div v-if="isEmpty" class="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white border border-slate-100 rounded-lg p-8 shadow-soft">
      <div class="p-5 bg-slate-50 rounded-full text-slate-400">
        <ShoppingBag class="w-12 h-12" />
      </div>
      <h3 class="text-lg font-bold text-primary">Tu bolsa está vacía</h3>
      <p class="text-xs text-slate-400 max-w-xs">¡No te quedes sin lucir increíble! Descubre nuestras colecciones hoy mismo.</p>
      <BaseButton variant="secondary" size="md" class="cursor-pointer mt-2" @click="router.push({ name: 'catalog' })">
        Explorar el Catálogo
      </BaseButton>
    </div>

    <!-- Cart items table & details -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Items List -->
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white border border-slate-100 rounded-lg shadow-soft overflow-hidden">
          <div class="p-6 divide-y divide-slate-100">
            <div 
              v-for="item in cartItems" 
              :key="`${item.product.id}-${item.variant?.id || 'none'}`"
              class="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5 first:pt-0 last:pb-0 text-left"
            >
              <!-- Image -->
              <img 
                :src="item.product.images[0]?.url" 
                :alt="item.product.name" 
                class="w-20 h-24 object-cover rounded-md bg-slate-50 border border-slate-100 flex-shrink-0"
              />
              
              <!-- Description -->
              <div class="flex-grow space-y-1">
                <RouterLink :to="{ name: 'product', params: { slug: item.product.slug } }" class="font-bold text-primary hover:text-secondary transition-colors text-sm sm:text-base">
                  {{ item.product.name }}
                </RouterLink>
                <p v-if="item.variant" class="text-xs text-slate-400 font-semibold">
                  Talla: {{ item.variant.size }} | Color: {{ item.variant.color }}
                </p>
                <p class="text-xs text-slate-400 leading-none">
                  Precio unitario: ${{ (item.product.price + (item.variant?.price_adjustment || 0)).toLocaleString() }}
                </p>
              </div>

              <!-- Controls and totals -->
              <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-3 sm:mt-0">
                <!-- Quantity counter -->
                <div class="flex items-center border border-slate-100 rounded-md bg-slate-50">
                  <button 
                    @click="cartStore.updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)" 
                    class="w-8 h-8 flex items-center justify-center text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span class="w-8 text-center text-xs font-bold text-primary">
                    {{ item.quantity }}
                  </span>
                  <button 
                    @click="cartStore.updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)" 
                    class="w-8 h-8 flex items-center justify-center text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <!-- Total price -->
                <span class="text-sm font-black text-primary min-w-[70px] text-right">
                  ${{ ((item.product.price + (item.variant?.price_adjustment || 0)) * item.quantity).toLocaleString() }}
                </span>

                <!-- Remove button -->
                <button 
                  @click="cartStore.removeItem(item.product.id, item.variant?.id)"
                  class="p-2 text-slate-300 hover:text-danger rounded-full hover:bg-danger/5 transition-colors cursor-pointer"
                  title="Eliminar artículo"
                >
                  <Trash2 class="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Cart Summary card -->
      <div class="lg:col-span-1">
        <div class="bg-white border border-slate-100 rounded-lg p-6 shadow-soft space-y-6">
          <h3 class="text-sm font-bold uppercase tracking-wider text-primary text-left">
            Resumen de compra
          </h3>
          
          <div class="space-y-3 text-sm text-left">
            <div class="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span class="font-bold text-primary">${{ cartSubtotal.toLocaleString() }}</span>
            </div>
            
            <div class="flex justify-between text-slate-500">
              <span>Envío</span>
              <span v-if="shippingCost > 0" class="font-bold text-primary">${{ shippingCost.toLocaleString() }}</span>
              <span v-else class="font-black text-success text-xs uppercase tracking-wide">¡Envío Gratis!</span>
            </div>
            
            <div class="h-px bg-slate-100 my-2"></div>
            
            <div class="flex justify-between text-base font-black text-primary">
              <span>Total</span>
              <span>${{ cartTotal.toLocaleString() }}</span>
            </div>
          </div>

          <BaseButton 
            variant="secondary" 
            size="lg" 
            class="w-full cursor-pointer h-12 shadow-sm"
            @click="handleCheckoutRedirect"
          >
            Proceder al pago
          </BaseButton>

          <!-- Free Shipping promotion badge -->
          <div v-if="shippingCost > 0" class="p-3 bg-secondary/5 rounded-md text-[11px] text-secondary font-semibold text-center leading-relaxed">
            ¡Agrega <strong>${{ (2000 - cartSubtotal).toLocaleString() }}</strong> más en productos para obtener <strong>Envío Gratis!</strong>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
