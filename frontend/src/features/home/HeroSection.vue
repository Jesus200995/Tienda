<script setup lang="ts">
import BaseButton from '../../components/ui/BaseButton.vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <section class="relative w-full h-[70vh] sm:h-[80vh] bg-primary overflow-hidden flex items-center">
    
    <!-- Background Image with Parallax Overlay -->
    <div class="absolute inset-0 z-0">
      <img 
        src="/hero_banner_fashion.png" 
        alt="Nueva Colección El Comerciambre" 
        class="w-full h-full object-cover object-center opacity-70 scale-102"
      />
      <!-- Gradient Fade Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
    </div>
    
    <!-- Hero Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 text-left text-white">
      <div 
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 800, ease: 'easeOut' } }"
        class="max-w-xl space-y-4 sm:space-y-6"
      >
        <span class="inline-block px-3 py-1 bg-secondary text-[10px] font-extrabold tracking-widest uppercase rounded-md shadow-sm">
          Lanzamiento Exclusivo
        </span>
        
        <h1 class="text-4xl sm:text-6xl font-display font-black leading-tight tracking-wide">
          ESTILO URBANO <br class="hidden sm:block" />
          <span class="text-secondary font-light italic">SIN ESFUERZO</span>
        </h1>
        
        <p class="text-sm sm:text-base text-slate-300 font-medium max-w-sm leading-relaxed">
          Descubre prendas de corte premium diseñadas para resistir el día a día y expresar tu verdadera identidad urbana.
        </p>
        
        <div class="pt-4 flex flex-wrap gap-4">
          <BaseButton 
            variant="secondary" 
            size="lg" 
            class="flex items-center gap-2 group cursor-pointer shadow-md"
            @click="router.push({ name: 'catalog' })"
          >
            Comprar Ahora
            <ArrowRight class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </BaseButton>
          <BaseButton 
            variant="outline" 
            size="lg" 
            class="border-white/30 text-white hover:bg-white/10 hover:text-white cursor-pointer"
            @click="router.push({ name: 'catalog', query: { category: 'sudaderas-y-hoodies' } })"
          >
            Ver Sudaderas
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- Decorative bottom slope -->
    <div class="absolute bottom-0 left-0 right-0 h-10 bg-surface" style="clip-path: polygon(0 100%, 100% 100%, 100% 0);"></div>
  </section>
</template>
