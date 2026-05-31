<script setup lang="ts">
import { computed } from 'vue'
import { Zap, Clock } from 'lucide-vue-next'
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

const lightningOffers = computed(() => {
  return activeOffers.value.filter((offer: ProductOffer) => {
    return offer.is_lightning && getProductForOffer(offer.product_id) !== undefined
  }).sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime()) // Sort by ending soonest
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-left pb-20">
    
    <!-- Hero Banner -->
    <div class="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 overflow-hidden pt-6 pb-16 px-4 sm:px-6 lg:px-8 border-b border-red-500/20">
      <div class="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wLDBMMjAsMjBWMGgtMjB6IiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPg==')] bg-cover"></div>
      
      <!-- Back to Home link -->
      <div class="relative z-20 max-w-7xl mx-auto text-left mb-6">
        <button 
          @click="$router.back()"
          class="inline-flex items-center text-xs font-black uppercase tracking-wider text-red-700 hover:text-red-900 transition-colors cursor-pointer"
        >
          <span class="mr-1.5 font-bold text-lg leading-none">&larr;</span> Regresar
        </button>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto text-center space-y-4">
        <div class="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-2 backdrop-blur-sm border border-white/30 shadow-inner">
          <Zap class="w-10 h-10 text-red-600 fill-red-600 animate-pulse" />
        </div>
        
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-red-600 drop-shadow-md">
          OFERTAS RELÁMPAGO
        </h1>
        
        <p class="text-lg sm:text-xl font-bold max-w-2xl mx-auto text-amber-900 leading-snug">
          Los descuentos más extremos de toda la tienda. Solo por tiempo limitado. ¡Aprovecha antes de que se agoten!
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
      
      <!-- Empty State -->
      <div v-if="lightningOffers.length === 0" class="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-100 space-y-4">
        <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
          <Clock class="w-10 h-10" />
        </div>
        <h2 class="text-xl font-display font-black text-slate-800">No hay ofertas relámpago activas</h2>
        <p class="text-slate-500 font-semibold max-w-md mx-auto">
          Vuelve pronto o revisa nuestro catálogo regular para descubrir las prendas de temporada.
        </p>
        <div class="mt-6">
          <RouterLink :to="{ name: 'catalog' }" class="inline-block px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
            Explorar Catálogo
          </RouterLink>
        </div>
      </div>

      <!-- Offers Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="offer in lightningOffers" 
          :key="offer.id"
          class="bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 relative group flex flex-col justify-between border-4 border-white hover:border-red-500"
        >
          <!-- Absolute Discount badge -->
          <div class="absolute -top-4 -left-4 z-20 px-4 py-2 bg-red-600 text-white font-black text-sm rounded-2xl shadow-lg animate-bounce transform rotate-[-5deg] border border-red-500">
            –{{ offer.discount_percent }}% OFF
          </div>

          <div class="space-y-4">
            <!-- Product Thumbnail Image -->
            <div class="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300">
              <img 
                :src="getProductForOffer(offer.product_id)?.images[0]?.url" 
                :alt="getProductForOffer(offer.product_id)?.name" 
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Meta and Prices -->
            <div class="text-center space-y-1">
              <h3 class="text-base sm:text-lg font-black text-slate-800 leading-snug truncate px-2">
                {{ getProductForOffer(offer.product_id)?.name }}
              </h3>
              
              <div class="flex items-center justify-center space-x-3">
                <span class="text-2xl sm:text-3xl font-black text-red-600 font-mono">
                  ${{ offer.offer_price.toLocaleString() }}
                </span>
                <span class="text-xs sm:text-sm text-slate-400 line-through font-mono font-bold">
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

    </div>
  </div>
</template>
