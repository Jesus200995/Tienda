<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProductStore } from '../../stores/products'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import ImageUploader from '../../components/ui/ImageUploader.vue'
import { generateUniqueSlug } from '../../utils/generateUniqueSlug'
import type { Category } from '../../types'
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-vue-next'

const productStore = useProductStore()

// State
const isModalOpen = ref(false)
const editingCategory = ref<Category | null>(null)

// Form fields
const name = ref('')
const slug = ref('')
const description = ref('')
const imageUrl = ref('')
const active = ref(true)

const categories = computed(() => productStore.categories)

const openCreateModal = () => {
  editingCategory.value = null
  name.value = ''
  slug.value = generateUniqueSlug('CAT')
  description.value = ''
  imageUrl.value = ''
  active.value = true
  isModalOpen.value = true
}

const openEditModal = (cat: Category) => {
  editingCategory.value = cat
  name.value = cat.name
  slug.value = cat.slug
  description.value = cat.description || ''
  imageUrl.value = cat.image || ''
  active.value = cat.active
  isModalOpen.value = true
}

const handleDelete = (id: number) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
    productStore.deleteCategory(id)
  }
}

const handleSubmit = () => {
  if (!name.value || !slug.value) return
  
  const categoryData = {
    name: name.value,
    slug: slug.value.trim(),
    description: description.value,
    image: imageUrl.value,
    active: active.value,
    sort_order: editingCategory.value?.sort_order || 1
  }
  
  if (editingCategory.value) {
    productStore.updateCategory(editingCategory.value.id, categoryData)
  } else {
    productStore.createCategory(categoryData)
  }
  
  isModalOpen.value = false
}
</script>

<template>
  <div class="space-y-8 text-left text-slate-800">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl sm:text-3xl font-display font-black text-slate-800">
          Categorías de Ropa
        </h1>
        <p class="text-xs text-slate-500 mt-1 font-semibold">
          Administra las secciones de tu tienda de ropa.
        </p>
      </div>
      
      <BaseButton variant="secondary" size="sm" class="flex items-center gap-1.5 cursor-pointer font-bold" @click="openCreateModal">
        <Plus class="w-4.5 h-4.5 text-white" />
        Agregar categoría
      </BaseButton>
    </div>

    <!-- Table -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4 sm:p-6">
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[600px] text-xs font-semibold text-slate-600">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[9px]">
              <th class="py-3 text-left">Foto</th>
              <th class="py-3 text-left">Nombre</th>
              <th class="py-3 text-left">Slug</th>
              <th class="py-3 text-left">Descripción</th>
              <th class="py-3 text-left">Activa</th>
              <th class="py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="cat in categories" :key="cat.id">
              <td class="py-4">
                <img 
                  :src="cat.image" 
                  :alt="cat.name" 
                  class="w-10 h-10 object-cover rounded bg-slate-100 border border-slate-200"
                />
              </td>
              <td class="py-4 font-bold text-slate-800">{{ cat.name }}</td>
              <td class="py-4 text-slate-500">{{ cat.slug }}</td>
              <td class="py-4 text-slate-500 max-w-xs truncate">{{ cat.description }}</td>
              <td class="py-4">
                <CheckCircle v-if="cat.active" class="w-4 h-4 text-emerald-600" />
                <XCircle v-else class="w-4 h-4 text-rose-500" />
              </td>
              <td class="py-4 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button 
                    @click="openEditModal(cat)"
                    class="p-1.5 rounded-full hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="handleDelete(cat.id)"
                    class="p-1.5 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Stacked Cards -->
      <div class="md:hidden space-y-4">
        <div 
          v-for="cat in categories" 
          :key="`mobile-${cat.id}`"
          class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3"
        >
          <div class="flex items-center gap-4">
            <img 
              :src="cat.image" 
              :alt="cat.name" 
              class="w-16 h-16 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <h4 class="font-black text-slate-800 text-sm truncate">{{ cat.name }}</h4>
              <p class="text-[10px] text-slate-400 font-mono mb-1 truncate">{{ cat.slug }}</p>
              <div class="flex items-center gap-1.5 mt-1">
                <span v-if="cat.active" class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black uppercase tracking-wider">
                  Activa
                </span>
                <span v-else class="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-black uppercase tracking-wider">
                  Inactiva
                </span>
              </div>
            </div>
          </div>
          
          <p class="text-xs text-slate-500 line-clamp-2 leading-normal">
            {{ cat.description }}
          </p>

          <div class="grid grid-cols-2 gap-2 mt-1">
            <button 
              @click="openEditModal(cat)"
              class="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Edit2 class="w-4 h-4" /> Editar
            </button>
            <button 
              @click="handleDelete(cat.id)"
              class="py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 class="w-4 h-4" /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <BaseModal 
      :show="isModalOpen" 
      @close="isModalOpen = false"
      :title="editingCategory ? 'Editar Categoría' : 'Agregar Categoría'"
      size="md"
      class="text-slate-800"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6 text-left">
        <BaseInput 
          id="cat-name"
          v-model="name"
          label="Nombre de la categoría"
          placeholder="Sudaderas premium"
          required
        />
        
        <!-- Read-only Slug -->
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Identificador Slug (Folio Único)</label>
          <div class="flex items-center space-x-2 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-mono text-sm font-bold select-all select-none">
            <span class="text-slate-400">🔒</span>
            <span class="flex-1">{{ slug || 'CAT-XXXXXXXX' }}</span>
            <span class="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wider border border-indigo-100">Inmutable</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-1 font-semibold">Folio único e inmutable generado automáticamente por el sistema.</p>
        </div>

        <!-- Image Uploader -->
        <ImageUploader v-model="imageUrl" />

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción</label>
          <textarea
            v-model="description"
            class="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 h-20"
          ></textarea>
        </div>

        <label class="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
          <input type="checkbox" v-model="active" class="accent-indigo-600 h-4.5 w-4.5 rounded" />
          Categoría Activa / Visible
        </label>

        <div class="border-t border-slate-200 pt-4 flex gap-4 justify-end">
          <BaseButton variant="outline" class="cursor-pointer border-slate-200 text-slate-600" @click.prevent="isModalOpen = false">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="secondary" class="cursor-pointer font-bold">
            {{ editingCategory ? 'Guardar Cambios' : 'Crear Categoría' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

  </div>
</template>
