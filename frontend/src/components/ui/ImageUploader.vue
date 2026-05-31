<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const errorMsg = ref('')
const fileName = ref('')
const fileSize = ref('')

const triggerSelect = () => {
  fileInput.value?.click()
}

const handleFile = (file: File) => {
  errorMsg.value = ''
  if (!file.type.startsWith('image/')) {
    errorMsg.value = 'El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP, etc.)'
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    errorMsg.value = 'La imagen es demasiado grande. El límite es 5MB.'
    return
  }

  fileName.value = file.name
  fileSize.value = (file.size / 1024).toFixed(1) + ' KB'

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result && typeof e.target.result === 'string') {
      emit('update:modelValue', e.target.result)
    }
  }
  reader.readAsDataURL(file)
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0])
  }
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0])
  }
}

const clearImage = () => {
  emit('update:modelValue', '')
  fileName.value = ''
  fileSize.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="space-y-3">
    <label class="block text-sm font-medium text-slate-700">Imagen del Producto / Categoría</label>
    
    <!-- Hidden input -->
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      @change="onFileChange"
      class="hidden"
    />

    <!-- Upload Box or Preview Card -->
    <div v-if="!modelValue"
      @click="triggerSelect"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      class="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
      :class="isDragging 
        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 scale-[0.99]' 
        : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50'"
    >
      <!-- Upload Icon -->
      <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <span class="text-sm font-bold text-slate-700">Seleccionar imagen</span>
      <span class="text-xs text-slate-400 mt-1">Arrastra y suelta aquí, o haz click para explorar</span>
      <span class="text-[10px] text-slate-400 mt-1">(Formatos admitidos: JPG, PNG, WEBP. Máx: 5MB)</span>
    </div>

    <!-- Preview Container -->
    <div v-else class="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
      <div class="relative w-32 h-36 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center">
        <img
          :src="modelValue"
          alt="Vista previa de imagen"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="flex-1 text-center sm:text-left min-w-0">
        <h4 class="text-sm font-bold text-slate-800 truncate" v-if="fileName">{{ fileName }}</h4>
        <h4 class="text-sm font-bold text-slate-800 truncate" v-else>Imagen guardada</h4>
        <p class="text-xs text-slate-400 mt-0.5" v-if="fileSize">{{ fileSize }}</p>
        <p class="text-xs text-indigo-600 mt-2 font-medium flex justify-center sm:justify-start items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Archivo cargado localmente</span>
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-2">
        <button
          type="button"
          @click="triggerSelect"
          class="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
        >
          Cambiar
        </button>
        <button
          type="button"
          @click="clearImage"
          class="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition"
          title="Eliminar imagen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="errorMsg" class="text-xs text-red-500 font-semibold bg-red-50 p-2 rounded-lg border border-red-100 flex items-center space-x-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{{ errorMsg }}</span>
    </p>
  </div>
</template>
