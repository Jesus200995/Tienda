<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useProductStore } from '../../stores/products'
import ProductCard from '../../components/shared/ProductCard.vue'
import ProductQuickView from '../../components/shared/ProductQuickView.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import type { Product } from '../../types'
import { Filter, SlidersHorizontal, Search, RefreshCw, X } from 'lucide-vue-next'

const productStore = useProductStore()

// Local UI state
const isMobileFilterOpen = ref(false)
const isQuickViewOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

// Computed bindings to Pinia
const products = computed(() => productStore.filteredProducts)
const categories = computed(() => productStore.categories)
const activeCategorySlug = computed({
  get: () => productStore.selectedCategorySlug,
  set: (val) => { productStore.selectedCategorySlug = val }
})
const searchQuery = computed({
  get: () => productStore.searchQuery,
  set: (val) => { productStore.searchQuery = val }
})
const selectedSize = computed({
  get: () => productStore.selectedSize,
  set: (val) => { productStore.selectedSize = val }
})
const selectedColor = computed({
  get: () => productStore.selectedColor,
  set: (val) => { productStore.selectedColor = val }
})
const sortBy = computed({
  get: () => productStore.sortBy,
  set: (val) => { productStore.sortBy = val }
})
const priceRange = computed({
  get: () => productStore.priceRange,
  set: (val) => { productStore.priceRange = val }
})

// Max price limit
const maxPriceLimit = computed(() => productStore.maxProductPrice || 10000)

// Unique sizes and colors
const availableSizes = computed(() => productStore.allSizes)
const availableColors = computed(() => productStore.allColors)

onMounted(() => {
  // Ensure price range represents full scale on initial load
  if (productStore.priceRange[1] === 10000) {
    productStore.priceRange[1] = maxPriceLimit.value
  }
})

// Modal controls
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

const handleResetFilters = () => {
  productStore.resetFilters()
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12">
    
    <!-- Top banner / Breadcrumb -->
    <div class="mb-8 text-left">
      <button 
        @click="$router.back()"
        class="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors cursor-pointer mb-4"
      >
        <span class="mr-1.5 font-bold text-lg leading-none">&larr;</span> Regresar
      </button>
      <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
        Colección Permanente
      </span>
      <h1 class="text-3xl sm:text-4xl font-display font-bold text-primary">
        Catálogo Completo
      </h1>
      <p class="text-xs text-slate-400 mt-1 font-semibold">
        Mostrando {{ products.length }} prendas de alta calidad disponibles.
      </p>
    </div>

    <!-- Filters Bar & Search -->
    <div class="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-white p-4 rounded-lg border border-slate-100 shadow-soft w-full">
      <!-- Search Input -->
      <div class="relative w-full md:max-w-xs text-left">
        <BaseInput 
          id="catalog-search"
          v-model="searchQuery" 
          placeholder="Buscar prendas..."
          class="pl-10"
        />
        <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
      </div>

      <!-- Sorting & Mobile trigger -->
      <div class="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        <!-- Mobile Filters Button -->
        <button 
          @click="isMobileFilterOpen = true"
          class="md:hidden flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-xs font-semibold rounded-md text-primary hover:bg-slate-50 cursor-pointer"
        >
          <SlidersHorizontal class="w-4 h-4 text-secondary" />
          Filtros
        </button>

        <!-- Sorting dropdown -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Ordenar:</span>
          <select 
            v-model="sortBy"
            class="px-3.5 py-2 border border-slate-200 text-xs font-bold rounded-md bg-white text-primary outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="featured">Destacado</option>
            <option value="newest">Lo más nuevo</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      
      <!-- Left: Sidebar Filters (Desktop) -->
      <aside class="hidden md:block col-span-1 space-y-6 text-left border-r border-slate-100 pr-6">
        
        <!-- Clear Filters button -->
        <div class="flex justify-between items-center">
          <h3 class="text-xs uppercase tracking-widest font-extrabold text-primary">
            Filtros
          </h3>
          <button 
            @click="handleResetFilters"
            class="text-[10px] uppercase tracking-wider font-bold text-secondary flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RefreshCw class="w-3 h-3" />
            Limpiar
          </button>
        </div>

        <!-- Categories -->
        <div class="border-t border-slate-100 pt-4">
          <span class="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Categorías</span>
          <div class="space-y-2">
            <label class="flex items-center gap-2.5 text-xs text-primary font-semibold cursor-pointer">
              <input 
                type="radio" 
                v-model="activeCategorySlug" 
                value="" 
                class="accent-secondary h-4 w-4"
              />
              Todas las colecciones
            </label>
            <label 
              v-for="cat in categories" 
              :key="cat.id" 
              class="flex items-center gap-2.5 text-xs text-primary font-semibold cursor-pointer"
            >
              <input 
                type="radio" 
                v-model="activeCategorySlug" 
                :value="cat.slug" 
                class="accent-secondary h-4 w-4"
              />
              {{ cat.name }}
            </label>
          </div>
        </div>

        <!-- Sizes -->
        <div class="border-t border-slate-100 pt-4" v-if="availableSizes.length > 0">
          <span class="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Tallas</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in availableSizes"
              :key="size"
              @click="selectedSize = selectedSize === size ? '' : size"
              :class="[
                'w-9 h-9 border text-xs font-bold rounded-md flex items-center justify-center transition-all cursor-pointer',
                selectedSize === size 
                  ? 'border-primary bg-primary text-white font-black' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Colors -->
        <div class="border-t border-slate-100 pt-4" v-if="availableColors.length > 0">
          <span class="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Colores</span>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="color in availableColors"
              :key="color.name"
              @click="selectedColor = selectedColor === color.name ? '' : color.name"
              :class="[
                'w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95',
                selectedColor === color.name 
                  ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-sm' 
                  : 'border-slate-200'
              ]"
              :style="{ backgroundColor: color.hex }"
              :title="color.name"
            >
              <span v-if="selectedColor === color.name" class="w-2.5 h-2.5 rounded-full bg-white mix-blend-difference"></span>
            </button>
          </div>
        </div>

        <!-- Price Range -->
        <div class="border-t border-slate-100 pt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Rango de precio</span>
            <span class="text-xs font-bold text-primary">${{ priceRange[0] }} - ${{ priceRange[1] }}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            :max="maxPriceLimit" 
            step="100"
            v-model.number="priceRange[1]"
            class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary focus:outline-none"
          />
        </div>

      </aside>

      <!-- Right: Products Grid -->
      <section class="col-span-1 md:col-span-3">
        <!-- Empty state -->
        <div v-if="products.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div class="p-5 bg-slate-50 rounded-full text-slate-400">
            <SlidersHorizontal class="w-12 h-12" />
          </div>
          <h3 class="text-lg font-bold text-primary">No encontramos prendas</h3>
          <p class="text-xs text-slate-400 max-w-xs">Intenta limpiando los filtros activos o modificando la búsqueda.</p>
          <BaseButton variant="secondary" size="sm" class="cursor-pointer" @click="handleResetFilters">
            Restablecer Catálogo
          </BaseButton>
        </div>

        <!-- Products Grid Layout -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard 
            v-for="product in products" 
            :key="product.id" 
            :product="product" 
            @quick-view="openQuickView"
          />
        </div>
      </section>

    </div>

    <!-- Mobile Slide-Up Filters Drawer -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="isMobileFilterOpen" 
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center"
          @click.self="isMobileFilterOpen = false"
        >
          <!-- Bottom Sheet -->
          <Transition
            enter-active-class="transition duration-350 ease-out-expo"
            enter-from-class="translate-y-full"
            enter-to-class="translate-y-0"
            leave-active-class="transition duration-250 ease-in"
            leave-from-class="translate-y-0"
            leave-to-class="translate-y-full"
          >
            <div 
              v-if="isMobileFilterOpen"
              class="w-full max-h-[85vh] bg-white rounded-t-xl shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              <!-- Drawer Header -->
              <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Filter class="w-4 h-4 text-secondary" />
                  Filtrar Artículos
                </h3>
                <button 
                  @click="isMobileFilterOpen = false" 
                  class="p-1 rounded-full text-slate-400 hover:text-primary transition-colors cursor-pointer hover:bg-slate-50"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- Drawer Body -->
              <div class="flex-grow overflow-y-auto px-6 py-5 space-y-6 text-left">
                <!-- Categories -->
                <div>
                  <span class="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Categorías</span>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2.5 text-xs text-primary font-semibold cursor-pointer">
                      <input 
                        type="radio" 
                        v-model="activeCategorySlug" 
                        value="" 
                        @change="isMobileFilterOpen = false"
                        class="accent-secondary h-4 w-4"
                      />
                      Todas las colecciones
                    </label>
                    <label 
                      v-for="cat in categories" 
                      :key="cat.id" 
                      class="flex items-center gap-2.5 text-xs text-primary font-semibold cursor-pointer"
                    >
                      <input 
                        type="radio" 
                        v-model="activeCategorySlug" 
                        :value="cat.slug" 
                        @change="isMobileFilterOpen = false"
                        class="accent-secondary h-4 w-4"
                      />
                      {{ cat.name }}
                    </label>
                  </div>
                </div>

                <!-- Sizes -->
                <div v-if="availableSizes.length > 0">
                  <span class="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Tallas</span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="size in availableSizes"
                      :key="size"
                      @click="selectedSize = selectedSize === size ? '' : size"
                      :class="[
                        'w-9 h-9 border text-xs font-bold rounded-md flex items-center justify-center transition-all cursor-pointer',
                        selectedSize === size 
                          ? 'border-primary bg-primary text-white font-black' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      ]"
                    >
                      {{ size }}
                    </button>
                  </div>
                </div>

                <!-- Colors -->
                <div v-if="availableColors.length > 0">
                  <span class="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Colores</span>
                  <div class="flex flex-wrap gap-2.5">
                    <button
                      v-for="color in availableColors"
                      :key="color.name"
                      @click="selectedColor = selectedColor === color.name ? '' : color.name"
                      :class="[
                        'w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95',
                        selectedColor === color.name 
                          ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-sm' 
                          : 'border-slate-200'
                      ]"
                      :style="{ backgroundColor: color.hex }"
                    >
                      <span v-if="selectedColor === color.name" class="w-2.5 h-2.5 rounded-full bg-white mix-blend-difference"></span>
                    </button>
                  </div>
                </div>

                <!-- Price Range -->
                <div>
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Precio máximo</span>
                    <span class="text-xs font-bold text-primary">${{ priceRange[1] }}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    :max="maxPriceLimit" 
                    step="100"
                    v-model.number="priceRange[1]"
                    class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary focus:outline-none"
                  />
                </div>
              </div>

              <!-- Drawer Footer -->
              <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-4">
                <BaseButton variant="outline" class="flex-1 cursor-pointer" @click="() => { handleResetFilters(); isMobileFilterOpen = false }">
                  Limpiar
                </BaseButton>
                <BaseButton variant="secondary" class="flex-1 cursor-pointer" @click="isMobileFilterOpen = false">
                  Aplicar
                </BaseButton>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Global Quick View modal -->
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

  </div>
</template>
