<script setup lang="ts">
import HeroSection from './HeroSection.vue'
import CategoryShowcase from './CategoryShowcase.vue'
import FeaturedProducts from './FeaturedProducts.vue'
import FounderAudio from './FounderAudio.vue'
</script>

<template>
  <div class="space-y-0">
    <!-- Hero -->
    <HeroSection />

    <!-- Categories Bento Grid -->
    <CategoryShowcase />

    <!-- Featured Products -->
    <FeaturedProducts />

    <!-- Audio message -->
    <FounderAudio />
  </div>
</template>
