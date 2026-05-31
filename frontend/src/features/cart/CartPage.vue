<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import BaseButton from '../../components/ui/BaseButton.vue'
import { Trash2, ShoppingCart, ArrowLeft, CheckSquare, Square } from 'lucide-vue-next'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const cartItems = computed(() => cartStore.items)
const isEmpty = computed(() => cartStore.isEmpty)

// Selection-based prices
const selectedSubtotal = computed(() => cartStore.selectedSubtotal)
const selectedShippingCost = computed(() => cartStore.selectedShippingCost)
const selectedTotal = computed(() => cartStore.selectedTotal)
const selectedCount = computed(() => cartStore.selectedCount)

const handleCheckoutRedirect = () => {
  if (selectedCount.value === 0) return
  if (authStore.isAuthenticated) {
    router.push({ name: 'checkout' })
  } else {
    router.push({ name: 'auth', query: { redirect: '/checkout' } })
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-12">
    
    <!-- Top banner -->
    <div class="mb-8 text-left flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
      <div>
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
          Tienes {{ cartStore.itemCount }} artículos en total.
        </p>
      </div>

      <!-- Bulk Actions -->
      <div v-if="!isEmpty" class="flex gap-3 text-xs font-bold">
        <button 
          @click="cartStore.toggleSelectAll()"
          class="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors cursor-pointer"
        >
          <component :is="cartStore.allSelected ? CheckSquare : Square" class="w-4 h-4 text-secondary" />
          {{ cartStore.allSelected ? 'Deseleccionar todos' : 'Seleccionar todos' }}
        </button>
        <span class="text-slate-200">|</span>
        <button 
          v-if="selectedCount > 0"
          @click="cartStore.removeSelected()"
          class="flex items-center gap-1 text-slate-500 hover:text-danger transition-colors cursor-pointer"
        >
          <Trash2 class="w-4 h-4 text-rose-500" />
          Eliminar seleccionados ({{ selectedCount }})
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="isEmpty" class="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white border border-slate-100 rounded-lg p-8 shadow-soft">
      <div class="p-5 bg-slate-50 rounded-full text-slate-400">
        <ShoppingCart class="w-12 h-12" />
      </div>
      <h3 class="text-lg font-bold text-primary">Tu bolsa está vacía</h3>
      <p class="text-xs text-slate-400 max-w-xs">¡No te quedes sin lucir increíble! Descubre nuestras colecciones hoy mismo.</p>
      <BaseButton variant="secondary" size="md" class="cursor-pointer mt-2" @click="router.push({ name: 'catalog' })">
        Explorar el Catálogo
      </BaseButton>
    </div>

    <!-- Cart items list & summary -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Items List -->
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white border border-slate-100 rounded-lg shadow-soft overflow-hidden">
          <div class="p-6 divide-y divide-slate-100">
            <div 
              v-for="item in cartItems" 
              :key="`${item.product.id}-${item.variant?.id || 'none'}`"
              class="flex flex-row items-center gap-4 py-5 first:pt-0 last:pb-0 text-left transition-all duration-350"
              :class="!item.selected ? 'opacity-55 scale-[0.99] border-slate-50' : ''"
            >
              <!-- Checkbox selection -->
              <button 
                @click="cartStore.toggleItemSelection(item.product.id, item.variant?.id)"
                class="text-slate-400 hover:text-secondary p-1 rounded-md transition-colors cursor-pointer"
                title="Seleccionar para comprar"
              >
                <component 
                  :is="item.selected ? CheckSquare : Square" 
                  class="w-5.5 h-5.5" 
                  :class="item.selected ? 'text-secondary animate-bounce-in' : 'text-slate-300'"
                />
              </button>

              <!-- Image -->
              <img 
                :src="item.product.images[0]?.url" 
                :alt="item.product.name" 
                class="w-16 h-20 object-cover rounded-md bg-slate-50 border border-slate-100 flex-shrink-0"
              />
              
              <!-- Description -->
              <div class="flex-grow space-y-1 min-w-0">
                <RouterLink :to="{ name: 'product', params: { slug: item.product.slug } }" class="font-bold text-primary hover:text-secondary transition-colors text-sm truncate block">
                  {{ item.product.name }}
                </RouterLink>
                <p v-if="item.variant" class="text-[11px] text-slate-400 font-semibold truncate">
                  Talla: {{ item.variant.size }} | Color: {{ item.variant.color }}
                </p>
                <p class="text-[11px] text-slate-400 leading-none">
                  Precio unitario: ${{ (item.product.price + (item.variant?.price_adjustment || 0)).toLocaleString() }}
                </p>
              </div>

              <!-- Controls and totals -->
              <div class="flex items-center gap-4 flex-shrink-0 ml-auto">
                <!-- Quantity counter -->
                <div class="flex items-center border border-slate-100 rounded-md bg-slate-50 h-8">
                  <button 
                    @click="cartStore.updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)" 
                    class="w-8 h-full flex items-center justify-center text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span class="w-7 text-center text-xs font-bold text-primary">
                    {{ item.quantity }}
                  </span>
                  <button 
                    @click="cartStore.updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)" 
                    class="w-8 h-full flex items-center justify-center text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>

                <!-- Total price -->
                <span class="text-sm font-black text-primary min-w-[70px] text-right hidden sm:inline-block">
                  ${{ ((item.product.price + (item.variant?.price_adjustment || 0)) * item.quantity).toLocaleString() }}
                </span>

                <!-- Remove button -->
                <button 
                  @click="cartStore.removeItem(item.product.id, item.variant?.id)"
                  class="p-2 text-slate-300 hover:text-danger rounded-full hover:bg-danger/5 transition-colors cursor-pointer"
                  title="Eliminar artículo"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Cart Summary card (Mercado Libre Style) -->
      <div class="lg:col-span-1">
        <div class="bg-white border border-slate-100 rounded-lg p-6 shadow-soft space-y-6 sticky top-20">
          <h3 class="text-sm font-bold uppercase tracking-wider text-primary text-left">
            Resumen de compra
          </h3>
          
          <div class="space-y-3 text-sm text-left">
            <div class="flex justify-between text-slate-500">
              <span>Productos seleccionados</span>
              <span class="font-bold text-primary">{{ selectedCount }}</span>
            </div>
            
            <div class="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span class="font-bold text-primary">${{ selectedSubtotal.toLocaleString() }}</span>
            </div>
            
            <div class="flex justify-between text-slate-500">
              <span>Envío</span>
              <span v-if="selectedShippingCost > 0" class="font-bold text-primary">${{ selectedShippingCost.toLocaleString() }}</span>
              <span v-else-if="selectedCount > 0" class="font-black text-success text-xs uppercase tracking-wide">¡Envío Gratis!</span>
              <span v-else class="font-bold text-primary">$0</span>
            </div>
            
            <div class="h-px bg-slate-100 my-2"></div>
            
            <div class="flex justify-between text-base font-black text-primary">
              <span>Total</span>
              <span>${{ selectedTotal.toLocaleString() }}</span>
            </div>
          </div>

          <BaseButton 
            variant="secondary" 
            size="lg" 
            class="w-full cursor-pointer h-12 shadow-sm flex items-center justify-center gap-1.5"
            :disabled="selectedCount === 0"
            @click="handleCheckoutRedirect"
          >
            Comprar ({{ selectedCount }} producto{{ selectedCount !== 1 ? 's' : '' }})
          </BaseButton>

          <!-- Free Shipping promotion badge -->
          <div v-if="selectedShippingCost > 0" class="p-3 bg-secondary/5 rounded-md text-[11px] text-secondary font-semibold text-center leading-normal">
            ¡Agrega <strong>${{ (2000 - selectedSubtotal).toLocaleString() }}</strong> más en productos seleccionados para obtener <strong>Envío Gratis!</strong>
          </div>
          <div v-else-if="selectedCount > 0" class="p-3 bg-emerald-50 rounded-md text-[11px] text-emerald-700 font-semibold text-center leading-normal">
            🎉 ¡Tu compra de hoy califica para <strong>Envío Gratis a todo México!</strong>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes bounceIn {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.animate-bounce-in {
  animation: bounceIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
