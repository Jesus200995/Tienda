<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProductStore } from '../../stores/products'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
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
  slug.value = ''
  description.value = ''
  imageUrl.value = '/premium_hoodie.png'
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
    slug: slug.value.toLowerCase().replace(/\s+/g, '-'),
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
  <div class="space-y-8 text-left text-slate-100">
    
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-display font-black text-white">
          Categorías de Ropa
        </h1>
        <p class="text-xs text-slate-400 mt-1 font-semibold">
          Administra las secciones de tu tienda de ropa.
        </p>
      </div>
      
      <BaseButton variant="secondary" size="sm" class="flex items-center gap-1.5 cursor-pointer font-bold" @click="openCreateModal">
        <Plus class="w-4.5 h-4.5 text-white" />
        Agregar categoría
      </BaseButton>
    </div>

    <!-- Table -->
    <div class="bg-[#121324] border border-slate-800 rounded-xl overflow-hidden shadow-soft p-6">
      <div class="overflow-x-auto">
        <table class="w-full text-xs font-semibold text-slate-350">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[9px]">
              <th class="py-3 text-left">Foto</th>
              <th class="py-3 text-left">Nombre</th>
              <th class="py-3 text-left">Slug</th>
              <th class="py-3 text-left">Descripción</th>
              <th class="py-3 text-left">Activa</th>
              <th class="py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40">
            <tr v-for="cat in categories" :key="cat.id">
              <td class="py-4">
                <img 
                  :src="cat.image" 
                  :alt="cat.name" 
                  class="w-10 h-10 object-cover rounded bg-slate-800 border border-slate-850"
                />
              </td>
              <td class="py-4 font-bold text-white">{{ cat.name }}</td>
              <td class="py-4 text-slate-400">{{ cat.slug }}</td>
              <td class="py-4 text-slate-400 max-w-xs truncate">{{ cat.description }}</td>
              <td class="py-4">
                <CheckCircle v-if="cat.active" class="w-4 h-4 text-success" />
                <XCircle v-else class="w-4 h-4 text-danger" />
              </td>
              <td class="py-4 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button 
                    @click="openEditModal(cat)"
                    class="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="handleDelete(cat.id)"
                    class="p-1.5 rounded-full hover:bg-danger/10 text-slate-400 hover:text-danger transition-colors cursor-pointer"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <BaseModal 
      :show="isModalOpen" 
      @close="isModalOpen = false"
      :title="editingCategory ? 'Editar Categoría' : 'Agregar Categoría'"
      size="md"
      class="text-[#1a1a2e]"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6 text-left">
        <BaseInput 
          id="cat-name"
          v-model="name"
          label="Nombre de la categoría"
          placeholder="Sudaderas premium"
          required
        />
        
        <BaseInput 
          id="cat-slug"
          v-model="slug"
          label="Slug Identificador"
          placeholder="sudaderas-premium"
          required
        />

        <BaseInput 
          id="cat-image"
          v-model="imageUrl"
          label="Ruta de imagen / URL"
          placeholder="/premium_hoodie.png"
          required
        />

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción</label>
          <textarea
            v-model="description"
            class="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 h-20"
          ></textarea>
        </div>

        <label class="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
          <input type="checkbox" v-model="active" class="accent-secondary h-4.5 w-4.5 rounded" />
          Categoría Activa / Visible
        </label>

        <div class="border-t border-slate-100 pt-4 flex gap-4 justify-end">
          <BaseButton variant="outline" class="cursor-pointer" @click.prevent="isModalOpen = false">
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
