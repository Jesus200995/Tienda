<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProductStore } from '../../stores/products'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import type { Product, ProductVariant } from '../../types'
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-vue-next'

const productStore = useProductStore()

// State
const isModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)

// Form fields
const name = ref('')
const slug = ref('')
const description = ref('')
const price = ref(0)
const comparePrice = ref(0)
const stock = ref(0)
const categoryId = ref(1)
const imageUrl = ref('')
const featured = ref(false)
const active = ref(true)

// Variants List
const sizeInput = ref('M')
const colorInput = ref('Negro')
const colorHexInput = ref('#000000')
const variantStockInput = ref(10)
const variants = ref<ProductVariant[]>([])

const products = computed(() => productStore.products)
const categories = computed(() => productStore.categories)

const openCreateModal = () => {
  editingProduct.value = null
  name.value = ''
  slug.value = ''
  description.value = ''
  price.value = 0
  comparePrice.value = 0
  stock.value = 10
  categoryId.value = categories.value[0]?.id || 1
  imageUrl.value = '/premium_hoodie.png'
  featured.value = false
  active.value = true
  variants.value = []
  
  isModalOpen.value = true
}

const openEditModal = (product: Product) => {
  editingProduct.value = product
  name.value = product.name
  slug.value = product.slug
  description.value = product.description
  price.value = product.price
  comparePrice.value = product.compare_price || 0
  stock.value = product.stock
  categoryId.value = product.category_id
  imageUrl.value = product.images[0]?.url || ''
  featured.value = product.featured
  active.value = product.active
  variants.value = [...product.variants]
  
  isModalOpen.value = true
}

const addVariant = () => {
  if (!sizeInput.value || !colorInput.value) return
  
  const newVar: ProductVariant = {
    id: Math.floor(Math.random() * 10000),
    product_id: editingProduct.value?.id || 0,
    size: sizeInput.value,
    color: colorInput.value,
    color_hex: colorHexInput.value,
    stock: variantStockInput.value,
    price_adjustment: 0,
    sku: `JK-MOCK-${sizeInput.value}-${colorInput.value.toUpperCase()}`
  }
  variants.value.push(newVar)
}

const removeVariant = (id: number) => {
  variants.value = variants.value.filter(v => v.id !== id)
}

const handleDelete = (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta prenda?')) {
    productStore.deleteProduct(id)
  }
}

const handleSubmit = () => {
  if (!name.value || !slug.value || !price.value) return
  
  const productData = {
    category_id: categoryId.value,
    name: name.value,
    slug: slug.value.toLowerCase().replace(/\s+/g, '-'),
    description: description.value,
    price: price.value,
    compare_price: comparePrice.value || undefined,
    stock: stock.value,
    featured: featured.value,
    active: active.value,
    images: [
      {
        id: Math.floor(Math.random() * 1000),
        product_id: editingProduct.value?.id || 0,
        url: imageUrl.value,
        alt: name.value,
        sort_order: 1,
        is_primary: true
      }
    ],
    variants: variants.value
  }
  
  if (editingProduct.value) {
    productStore.updateProduct(editingProduct.value.id, productData)
  } else {
    productStore.createProduct(productData)
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
          Catálogo de Prendas
        </h1>
        <p class="text-xs text-slate-400 mt-1 font-semibold">
          Administra la lista de prendas, variantes de stock y precios de venta.
        </p>
      </div>
      
      <BaseButton variant="secondary" size="sm" class="flex items-center gap-1.5 cursor-pointer font-bold" @click="openCreateModal">
        <Plus class="w-4.5 h-4.5 text-white" />
        Agregar prenda
      </BaseButton>
    </div>

    <!-- Table content -->
    <div class="bg-[#121324] border border-slate-800 rounded-xl overflow-hidden shadow-soft p-6">
      <div class="overflow-x-auto">
        <table class="w-full text-xs font-semibold text-slate-350">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[9px]">
              <th class="py-3 text-left">Foto</th>
              <th class="py-3 text-left">Nombre</th>
              <th class="py-3 text-left">Categoría</th>
              <th class="py-3 text-left">Precio</th>
              <th class="py-3 text-left">Existencias</th>
              <th class="py-3 text-left">Destacado</th>
              <th class="py-3 text-left">Activo</th>
              <th class="py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40">
            <tr v-for="product in products" :key="product.id">
              <!-- Photo -->
              <td class="py-4">
                <img 
                  :src="product.images[0]?.url" 
                  :alt="product.name" 
                  class="w-10 h-12 object-cover rounded bg-slate-800 border border-slate-850"
                />
              </td>
              <!-- Name -->
              <td class="py-4 font-bold text-white max-w-xs truncate">{{ product.name }}</td>
              <!-- Category -->
              <td class="py-4 text-slate-400">
                {{ categories.find(c => c.id === product.category_id)?.name || 'Sin Categoría' }}
              </td>
              <!-- Price -->
              <td class="py-4 font-bold text-white">${{ product.price.toLocaleString() }}</td>
              <!-- Stock -->
              <td class="py-4">
                <span :class="[product.stock <= 5 ? 'text-secondary font-black' : 'text-slate-400']">
                  {{ product.stock }} pzas
                </span>
              </td>
              <!-- Featured -->
              <td class="py-4">
                <CheckCircle v-if="product.featured" class="w-4 h-4 text-success" />
                <XCircle v-else class="w-4 h-4 text-slate-700" />
              </td>
              <!-- Active -->
              <td class="py-4">
                <CheckCircle v-if="product.active" class="w-4 h-4 text-success" />
                <XCircle v-else class="w-4 h-4 text-danger" />
              </td>
              <!-- Actions -->
              <td class="py-4 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button 
                    @click="openEditModal(product)"
                    class="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="handleDelete(product.id)"
                    class="p-1.5 rounded-full hover:bg-danger/10 text-slate-400 hover:text-danger transition-colors cursor-pointer"
                    title="Eliminar"
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
      :title="editingProduct ? 'Editar Prenda' : 'Agregar Nueva Prenda'"
      size="lg"
      class="text-[#1a1a2e]"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6 text-left">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput 
            id="form-name"
            v-model="name"
            label="Nombre de la prenda"
            placeholder="Chaqueta Bomber Premium"
            required
          />
          <BaseInput 
            id="form-slug"
            v-model="slug"
            label="Identificador Slug"
            placeholder="chaqueta-bomber-premium"
            required
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoría</label>
            <select 
              v-model="categoryId"
              class="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
            >
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <BaseInput 
            id="form-price"
            v-model.number="price"
            type="number"
            label="Precio de venta ($)"
            required
          />
          <BaseInput 
            id="form-compare-price"
            v-model.number="comparePrice"
            type="number"
            label="Precio de comparación ($)"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput 
            id="form-stock"
            v-model.number="stock"
            type="number"
            label="Existencias totales"
            required
          />
          <BaseInput 
            id="form-image"
            v-model="imageUrl"
            label="Ruta de imagen / URL"
            placeholder="/premium_hoodie.png"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción corta</label>
          <textarea
            v-model="description"
            required
            class="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 h-20"
          ></textarea>
        </div>

        <!-- Add Variants section -->
        <div class="border-t border-slate-100 pt-4 space-y-4">
          <span class="block text-xs font-bold uppercase tracking-wider text-slate-400">Variantes de Talla / Color</span>
          
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Talla</label>
              <select v-model="sizeInput" class="w-full px-3 py-2 text-xs border border-slate-200 rounded bg-white outline-none">
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>
            <div>
              <BaseInput id="var-color" v-model="colorInput" label="Nombre Color" placeholder="Negro" />
            </div>
            <div>
              <BaseInput id="var-color-hex" v-model="colorHexInput" label="Hex Color" placeholder="#000000" />
            </div>
            <BaseButton variant="outline" size="sm" class="cursor-pointer font-bold h-9" @click.prevent="addVariant">
              Agregar Variante
            </BaseButton>
          </div>

          <!-- Active variants tags -->
          <div class="flex flex-wrap gap-2 pt-2">
            <span 
              v-for="v in variants" 
              :key="v.id"
              class="px-2.5 py-1.5 bg-slate-100 rounded border border-slate-200 text-xs font-bold flex items-center gap-2"
            >
              <span class="w-3 h-3 rounded-full border border-white" :style="{ backgroundColor: v.color_hex }"></span>
              {{ v.size }} - {{ v.color }} ({{ v.stock }} pzs)
              <button @click.prevent="removeVariant(v.id)" class="text-danger hover:text-red-700 cursor-pointer font-black text-xs">×</button>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-6 border-t border-slate-100 pt-4">
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
            <input type="checkbox" v-model="featured" class="accent-secondary h-4.5 w-4.5 rounded" />
            Marcar como Destacado
          </label>
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
            <input type="checkbox" v-model="active" class="accent-secondary h-4.5 w-4.5 rounded" />
            Artículo Activo / Visible
          </label>
        </div>

        <div class="border-t border-slate-100 pt-4 flex gap-4 justify-end">
          <BaseButton variant="outline" class="cursor-pointer" @click.prevent="isModalOpen = false">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="secondary" class="cursor-pointer font-bold">
            {{ editingProduct ? 'Guardar Cambios' : 'Crear Prenda' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

  </div>
</template>
