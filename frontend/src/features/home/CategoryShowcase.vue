<script setup lang="ts">
import { computed } from 'vue'
import { useProductStore } from '../../stores/products'
import { useRouter } from 'vue-router'
import { ArrowUpRight } from 'lucide-vue-next'

const productStore = useProductStore()
const router = useRouter()

const categories = computed(() => productStore.activeCategories)

const navigateToCategory = (slug: string) => {
  productStore.selectedCategorySlug = slug
  router.push({ name: 'catalog' })
}
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
    <div class="mb-12 text-left">
      <span class="text-[10px] font-extrabold uppercase tracking-widest text-secondary block mb-1">
        Colecciones
      </span>
      <h2 class="text-2xl sm:text-4xl font-display font-bold text-primary">
        Nuestras Categorías
      </h2>
      <p class="text-sm text-slate-400 mt-2 font-medium">
        Explora cortes seleccionados y diseños pensados en la máxima versatilidad.
      </p>
    </div>

    <!-- Bento Grid Layout -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[480px]">
      
      <!-- Box 1: Jackets (Takes larger width/height if needed, or simple grid columns) -->
      <div 
        v-if="categories[0]"
        @click="navigateToCategory(categories[0].slug)"
        class="group relative overflow-hidden rounded-lg bg-slate-100 border border-slate-100/50 shadow-soft cursor-pointer md:col-span-2 h-[260px] md:h-full flex items-end p-6 md:p-8"
      >
        <img 
          :src="categories[0].image" 
          :alt="categories[0].name" 
          class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out-expo"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent"></div>
        
        <div class="relative z-10 text-left text-white max-w-md">
          <h3 class="text-xl sm:text-2xl font-display font-bold mb-1 sm:mb-2 flex items-center gap-1">
            {{ categories[0].name }}
            <ArrowUpRight class="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300" />
          </h3>
          <p class="text-xs text-slate-300 leading-relaxed font-medium">
            {{ categories[0].description }}
          </p>
        </div>
      </div>

      <!-- Right Column Stack for smaller items -->
      <div class="grid grid-cols-1 gap-6 md:col-span-1 h-auto md:h-full">
        
        <!-- Box 2: Hoodies -->
        <div 
          v-if="categories[1]"
          @click="navigateToCategory(categories[1].slug)"
          class="group relative overflow-hidden rounded-lg bg-slate-100 border border-slate-100/50 shadow-soft cursor-pointer h-[200px] md:h-[calc(50%-12px)] flex items-end p-6"
        >
          <img 
            :src="categories[1].image" 
            :alt="categories[1].name" 
            class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out-expo"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
          
          <div class="relative z-10 text-left text-white">
            <h3 class="text-lg font-display font-bold mb-1 flex items-center gap-1">
              {{ categories[1].name }}
              <ArrowUpRight class="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300" />
            </h3>
            <p class="text-[10px] text-slate-300 font-medium">
              {{ categories[1].description }}
            </p>
          </div>
        </div>

        <!-- Box 3: Shirts -->
        <div 
          v-if="categories[2]"
          @click="navigateToCategory(categories[2].slug)"
          class="group relative overflow-hidden rounded-lg bg-slate-100 border border-slate-100/50 shadow-soft cursor-pointer h-[200px] md:h-[calc(50%-12px)] flex items-end p-6"
        >
          <img 
            :src="categories[2].image" 
            :alt="categories[2].name" 
            class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out-expo"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
          
          <div class="relative z-10 text-left text-white">
            <h3 class="text-lg font-display font-bold mb-1 flex items-center gap-1">
              {{ categories[2].name }}
              <ArrowUpRight class="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300" />
            </h3>
            <p class="text-[10px] text-slate-300 font-medium">
              {{ categories[2].description }}
            </p>
          </div>
        </div>

      </div>

    </div>
  </section>
</template>
