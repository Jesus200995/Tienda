<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProductStore } from '../../stores/products'
import ProductCard from '../../components/shared/ProductCard.vue'
import ProductQuickView from '../../components/shared/ProductQuickView.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import type { Product } from '../../types'

const productStore = useProductStore()

const featuredList = computed(() => productStore.featuredProducts)

// Quick View Modal State
const isQuickViewOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

const openQuickView = (product: Product) => {
  selectedProduct.value = product
  isQuickViewOpen.value = true
}

const closeQuickView = () => {
  isQuickViewOpen.value = false
  setTimeout(() => {
    selectedProduct.value = null
  }, 300)
}
</script>

<template>
  <section class="bg-slate-50/50 border-y border-slate-100/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      
      <!-- Section Header -->
      <div class="mb-12 text-left flex items-end justify-between">
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-secondary block mb-1">
            Lo Más Vendido
          </span>
          <h2 class="text-2xl sm:text-4xl font-display font-bold text-primary">
            Productos Destacados
          </h2>
          <p class="text-sm text-slate-400 mt-2 font-medium">
            Nuestros artículos estrella elegidos por su corte y acogida insuperable.
          </p>
        </div>
        
        <RouterLink :to="{ name: 'catalog' }" class="hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary hover:text-secondary border-b border-primary/20 hover:border-secondary transition-all pb-0.5">
          Ver catálogo completo →
        </RouterLink>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <ProductCard 
          v-for="product in featuredList" 
          :key="product.id" 
          :product="product" 
          @quick-view="openQuickView"
        />
      </div>
      
      <!-- Small CTA for mobile -->
      <div class="mt-8 text-center sm:hidden">
        <RouterLink :to="{ name: 'catalog' }" class="inline-flex items-center text-xs font-bold uppercase tracking-wider text-secondary border-b border-secondary/30 pb-0.5">
          Ver todo el catálogo →
        </RouterLink>
      </div>

    </div>

    <!-- Quick View Modal wrapper -->
    <BaseModal 
      :show="isQuickViewOpen" 
      @close="closeQuickView" 
      :title="selectedProduct ? selectedProduct.name : ''" 
      size="lg"
    >
      <ProductQuickView 
        v-if="selectedProduct" 
        :product="selectedProduct" 
        @close="closeQuickView"
      />
    </BaseModal>
  </section>
</template>
