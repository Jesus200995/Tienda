<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { Truck, ShieldCheck, CreditCard, Package, Tag, Clock } from 'lucide-vue-next'
import HeroSection from './HeroSection.vue'
import OffersSection from './OffersSection.vue'
import CategoryShowcase from './CategoryShowcase.vue'
import FeaturedProducts from './FeaturedProducts.vue'
import FounderAudio from './FounderAudio.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userFirstName = computed(() => {
  if (!authStore.user?.name) return 'Amigo'
  return authStore.user.name.split(' ')[0]
})
</script>

<template>
  <div class="space-y-0 bg-slate-50 min-h-screen">
    
    <!-- ============================================== -->
    <!-- VISTA INVITADO (No logueado)                   -->
    <!-- ============================================== -->
    <template v-if="!isAuthenticated">
      <!-- 1. Hero -->
      <HeroSection />

      <!-- 2. Trust Signals (Estilo ML) -->
      <section class="bg-white border-b border-slate-200 py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div class="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
              <div class="p-3 bg-blue-50 text-blue-600 rounded-full shrink-0">
                <Truck class="w-6 h-6" />
              </div>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Envíos rápidos y seguros</h4>
                <p class="text-xs text-slate-500">A todo el país con seguimiento en tiempo real.</p>
              </div>
            </div>
            <div class="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
              <div class="p-3 bg-green-50 text-green-600 rounded-full shrink-0">
                <ShieldCheck class="w-6 h-6" />
              </div>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Compra protegida</h4>
                <p class="text-xs text-slate-500">Recibe lo que esperabas o te devolvemos tu dinero.</p>
              </div>
            </div>
            <div class="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
              <div class="p-3 bg-purple-50 text-purple-600 rounded-full shrink-0">
                <CreditCard class="w-6 h-6" />
              </div>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Pago cómodo</h4>
                <p class="text-xs text-slate-500">Múltiples métodos de pago y la mayor seguridad.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Categories -->
      <div class="pt-8">
        <CategoryShowcase />
      </div>

      <!-- 4. Featured Products -->
      <div class="pt-4">
        <FeaturedProducts />
      </div>

      <!-- 5. Call to Action -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
          
          <h3 class="relative z-10 text-3xl sm:text-4xl font-display font-black text-white mb-4">
            Únete a El Comerciambre
          </h3>
          <p class="relative z-10 text-slate-300 font-medium mb-8 max-w-lg mx-auto">
            Crea tu cuenta gratuita hoy y obtén acceso inmediato a nuestras ofertas relámpago y colecciones exclusivas.
          </p>
          <div class="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
            <RouterLink :to="{ name: 'auth' }" class="px-8 py-4 bg-secondary text-white font-black rounded-xl hover:bg-orange-500 hover:scale-105 transition-all shadow-lg text-sm uppercase tracking-wider">
              Crear Cuenta
            </RouterLink>
            <RouterLink :to="{ name: 'catalog' }" class="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm uppercase tracking-wider border border-white/20">
              Ver Catálogo
            </RouterLink>
          </div>
        </div>
      </section>
    </template>

    <!-- ============================================== -->
    <!-- VISTA USUARIO REGISTRADO (Dashboard Premium)   -->
    <!-- ============================================== -->
    <template v-else>
      <!-- Saludo Personalizado (Premium Fashion Style) -->
      <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-neutral-900 pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 shadow-xl overflow-hidden">
        <!-- Subtle background pattern/glow -->
        <div class="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div class="max-w-7xl mx-auto relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="space-y-2">
            <h1 class="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
              ¡Hola, <span class="bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">{{ userFirstName }}</span>!
            </h1>
            <p class="text-slate-300 font-medium text-sm sm:text-base max-w-md">
              Tu vestidor exclusivo está listo. Descubre lo último en moda urbana y cortes premium.
            </p>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        <!-- 2. Botonera de Accesos Rápidos (Estilo Mercado Libre) -->
        <div class="grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-6 bg-white p-4 sm:p-6 rounded-3xl shadow-lg border border-slate-100">
          <RouterLink :to="{ name: 'account' }" class="flex flex-col items-center gap-2 group">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
              <Package class="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span class="text-[10px] sm:text-xs font-bold text-slate-600 text-center leading-tight">Mis<br>Compras</span>
          </RouterLink>
          
          <RouterLink :to="{ name: 'flash-sales' }" class="flex flex-col items-center gap-2 group">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm">
              <Clock class="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span class="text-[10px] sm:text-xs font-bold text-slate-600 text-center leading-tight">Ofertas<br>Relámpago</span>
          </RouterLink>

          <RouterLink :to="{ name: 'catalog' }" class="flex flex-col items-center gap-2 group">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
              <Tag class="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span class="text-[10px] sm:text-xs font-bold text-slate-600 text-center leading-tight">Ver<br>Catálogo</span>
          </RouterLink>

          <div class="flex flex-col items-center gap-2 group cursor-pointer" @click="$router.push({ name: 'cart' })">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
              <CreditCard class="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span class="text-[10px] sm:text-xs font-bold text-slate-600 text-center leading-tight">Mi<br>Carrito</span>
          </div>
        </div>
      </div>

      <!-- 3. Ofertas Dinámicas -->
      <div class="pt-8">
        <OffersSection />
      </div>

      <!-- 4. Recomendaciones / Destacados -->
      <div class="pt-4">
        <FeaturedProducts />
      </div>

      <!-- 5. Audio Message -->
      <div class="pt-4 pb-12">
        <FounderAudio />
      </div>
    </template>
  </div>
</template>
