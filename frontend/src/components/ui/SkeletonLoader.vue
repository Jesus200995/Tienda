<script setup lang="ts">
interface Props {
  type?: 'card' | 'text' | 'image' | 'avatar' | 'line'
  count?: number
}

withDefaults(defineProps<Props>(), {
  type: 'line',
  count: 1
})
</script>

<template>
  <div class="w-full">
    <!-- Product Card Skeleton -->
    <div v-if="type === 'card'" class="flex flex-col gap-4 w-full">
      <div class="w-full aspect-[3/4] bg-slate-200 animate-pulse rounded-md"></div>
      <div class="h-4.5 bg-slate-200 animate-pulse rounded-md w-3/4"></div>
      <div class="h-4 bg-slate-200 animate-pulse rounded-md w-1/2"></div>
      <div class="h-9 bg-slate-200 animate-pulse rounded-md w-full mt-2"></div>
    </div>

    <!-- Text Skeleton -->
    <div v-else-if="type === 'text'" class="flex flex-col gap-2.5 w-full">
      <div class="h-6 bg-slate-200 animate-pulse rounded-md w-2/3 mb-1"></div>
      <div class="h-4.5 bg-slate-200 animate-pulse rounded-md w-full"></div>
      <div class="h-4.5 bg-slate-200 animate-pulse rounded-md w-full"></div>
      <div class="h-4.5 bg-slate-200 animate-pulse rounded-md w-5/6"></div>
    </div>

    <!-- Image Skeleton -->
    <div v-else-if="type === 'image'" class="w-full h-full min-h-[200px] bg-slate-200 animate-pulse rounded-md"></div>

    <!-- Avatar Skeleton -->
    <div v-else-if="type === 'avatar'" class="h-12 w-12 rounded-full bg-slate-200 animate-pulse"></div>

    <!-- Multi-line Skeleton -->
    <div v-else class="flex flex-col gap-3 w-full">
      <div 
        v-for="i in count" 
        :key="i" 
        class="h-4 bg-slate-200 animate-pulse rounded-md"
        :style="{ width: i === count && count > 1 ? '60%' : '100%' }"
      ></div>
    </div>
  </div>
</template>
