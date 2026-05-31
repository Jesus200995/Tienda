<script setup lang="ts">
import { computed } from 'vue'
import { Flame, Zap } from 'lucide-vue-next'
import { useOffersStore } from '../../stores/offers'
import { useProductStore } from '../../stores/products'
import CountdownTimer from '../../components/ui/CountdownTimer.vue'
import type { ProductOffer } from '../../types'

const offersStore = useOffersStore()
const productStore = useProductStore()

const activeOffers = computed(() => offersStore.activeOffers)
const products = computed(() => productStore.products)

const getProductForOffer = (productId: number) => {
  return products.value.find(p => p.id === productId)
}

const validActiveOffers = computed(() => {
  return activeOffers.value.filter((offer: ProductOffer) => getProductForOffer(offer.product_id) !== undefined)
})

const lightningOffers = computed(() => validActiveOffers.value.filter((o: ProductOffer) => o.is_lightning))
const displayedLightningOffers = computed(() => lightningOffers.value.slice(0, 3))
const hasMoreLightningOffers = computed(() => lightningOffers.value.length > 3)
const regularOffers = computed(() => validActiveOffers.value.filter((o: ProductOffer) => !o.is_lightning))
</script>

<template>
  <div>
    <!-- Lightning Deals Section (Ofertas Relámpago) -->
    <section 
      v-if="lightningOffers.length > 0" 
      class="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 border-y border-red-500/20 overflow-hidden"
    >
      <!-- Background dramatic rays -->
      <div class="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wLDBMMjAsMjBWMGgtMjB6IiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPg==')] bg-cover"></div>
      
      <div class="max-w-7xl mx-auto space-y-8 relative z-10">
        <!-- Section Title Header -->
        <div class="text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="space-y-1 text-slate-900">
            <h2 class="text-3xl sm:text-4xl font-display font-black tracking-tight flex items-center justify-center sm:justify-start gap-2 text-red-600 drop-shadow-sm">
              <Zap class="w-8 h-8 text-red-600 fill-red-600 animate-pulse" /> OFERTAS RELÁMPAGO
            </h2>
            <p class="text-sm font-bold max-w-lg text-amber-900">
              Descuentos extremos por tiempo muy limitado. ¡No dejes que el reloj llegue a cero!
            </p>
          </div>
          
          <!-- View All Button (Desktop) -->
          <div v-if="hasMoreLightningOffers" class="hidden sm:block">
            <RouterLink 
              :to="{ name: 'flash-sales' }"
              class="px-5 py-2.5 bg-white/50 hover:bg-white text-red-700 font-black text-xs uppercase tracking-widest rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 border border-red-200"
            >
              Ver todas <span class="text-lg leading-none">→</span>
            </RouterLink>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="offer in displayedLightningOffers" 
            :key="offer.id"
            class="bg-white rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 relative group flex flex-col justify-between border-4 border-white hover:border-red-500"
          >
            <!-- Absolute Discount badge -->
            <div class="absolute -top-4 -left-4 z-20 px-4 py-2 bg-red-600 text-white font-black text-sm rounded-2xl shadow-lg animate-bounce transform rotate-[-5deg]">
              –{{ offer.discount_percent }}% OFF
            </div>

            <div class="space-y-4">
              <!-- Product Thumbnail Image -->
              <div class="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300">
                <img 
                  :src="getProductForOffer(offer.product_id)?.images[0]?.url" 
                  :alt="getProductForOffer(offer.product_id)?.name" 
                  class="w-full h-full object-cover"
                />
              </div>

              <!-- Meta and Prices -->
              <div class="text-center space-y-1">
                <h3 class="text-lg font-black text-slate-800 leading-snug truncate px-2">
                  {{ getProductForOffer(offer.product_id)?.name }}
                </h3>
                
                <div class="flex items-center justify-center space-x-3">
                  <span class="text-3xl font-black text-red-600 font-mono">
                    ${{ offer.offer_price.toLocaleString() }}
                  </span>
                  <span class="text-sm text-slate-400 line-through font-mono font-bold">
                    ${{ offer.original_price.toLocaleString() }}
                  </span>
                </div>
              </div>

              <!-- Countdown Timer -->
              <div class="py-3 px-4 bg-red-50 border-2 border-red-100 rounded-2xl space-y-1.5 transform group-hover:scale-105 transition-transform">
                <span class="block text-[10px] font-black text-red-500 uppercase tracking-widest text-center leading-none">Termina En:</span>
                <CountdownTimer :end-date="offer.ends_at" @expired="offersStore.deactivateExpired()" class="text-red-700" />
              </div>
            </div>

            <!-- Bottom Button -->
            <div class="mt-5">
              <RouterLink 
                :to="`/product/${getProductForOffer(offer.product_id)?.slug}`"
                class="w-full py-3.5 bg-red-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
              >
                <Zap class="w-4 h-4 fill-white" />
                <span>Comprar Ya</span>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- View All Button (Mobile) -->
        <div v-if="hasMoreLightningOffers" class="sm:hidden mt-6">
          <RouterLink 
            :to="{ name: 'flash-sales' }"
            class="w-full py-4 bg-white/50 hover:bg-white text-red-700 font-black text-sm uppercase tracking-widest rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 border border-red-200"
          >
            Ver todas <span class="text-xl leading-none">→</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Regular Offers Section -->
    <section 
      v-if="regularOffers.length > 0" 
      class="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 border-y border-slate-200/60 overflow-hidden"
    >
      <div class="max-w-7xl mx-auto space-y-8 relative z-10">
        <div class="text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="space-y-1">
            <h2 class="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-800 flex items-center justify-center sm:justify-start gap-2">
              <Flame class="w-6 h-6 text-orange-500 inline-block mr-1" /> Ofertas Exclusivas
            </h2>
            <p class="text-xs text-slate-500 font-semibold max-w-lg">
              Aprovecha nuestros descuentos imperdibles antes de que se agote el tiempo. ¡Diseños premium limitados!
            </p>
          </div>
        </div>

        <!-- Offers Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="offer in regularOffers" 
            :key="offer.id"
            class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between"
          >
            <div class="absolute top-4 left-4 z-10 px-3 py-1.5 bg-slate-800 text-white font-black text-xs rounded-2xl shadow-md">
              –{{ offer.discount_percent }}% OFF
            </div>

            <div class="space-y-4">
              <div class="relative w-full h-80 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-[1.01] transition-transform duration-300">
                <img 
                  :src="getProductForOffer(offer.product_id)?.images[0]?.url" 
                  :alt="getProductForOffer(offer.product_id)?.name" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div class="text-left space-y-1">
                <h3 class="text-base font-extrabold text-slate-800 leading-snug group-hover:text-indigo-650 transition-colors">
                  {{ getProductForOffer(offer.product_id)?.name }}
                </h3>
                
                <div class="flex items-baseline space-x-2">
                  <span class="text-2xl font-black text-orange-600 font-mono">
                    ${{ offer.offer_price.toLocaleString() }}
                  </span>
                  <span class="text-sm text-slate-400 line-through font-mono">
                    ${{ offer.original_price.toLocaleString() }}
                  </span>
                </div>
              </div>

              <div class="py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner space-y-1.5">
                <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center leading-none">Termina En:</span>
                <CountdownTimer :end-date="offer.ends_at" @expired="offersStore.deactivateExpired()" />
              </div>
            </div>

            <div class="mt-4">
              <RouterLink 
                :to="`/product/${getProductForOffer(offer.product_id)?.slug}`"
                class="w-full py-3 bg-slate-100 text-slate-800 hover:text-white font-bold text-xs rounded-xl hover:bg-indigo-650 transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Ver Oferta</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
