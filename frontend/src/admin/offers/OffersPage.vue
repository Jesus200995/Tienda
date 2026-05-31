<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOffersStore } from '../../stores/offers'
import { useProductStore } from '../../stores/products'
import { useNotificationsStore } from '../../stores/notifications'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import type { ProductOffer, Product } from '../../types'
import { Plus, Tag, Trash2, Send, Edit, AlertCircle, Sparkles } from 'lucide-vue-next'

const offersStore = useOffersStore()
const productStore = useProductStore()
const notificationsStore = useNotificationsStore()

// State
const isModalOpen = ref(false)
const editingOffer = ref<ProductOffer | null>(null)

// Form fields
const productId = ref<number | null>(null)
const offerPrice = ref(0)
const startsAt = ref('')
const endsAt = ref('')
const active = ref(true)
const isLightning = ref(false)

// Dropdown product search
const productSearch = ref('')
const showProductDropdown = ref(false)

const products = computed(() => productStore.products)
const offers = computed(() => offersStore.offers)

// Filtered products for selector
const filteredProducts = computed(() => {
  if (!productSearch.value) return products.value.slice(0, 5)
  return products.value.filter(p => 
    p.name.toLowerCase().includes(productSearch.value.toLowerCase()) ||
    p.slug.toLowerCase().includes(productSearch.value.toLowerCase())
  ).slice(0, 5)
})

const selectedProduct = computed(() => {
  if (productId.value === null) return null
  return products.value.find(p => p.id === productId.value) || null
})

// Auto percent discount
const calculatedDiscount = computed(() => {
  if (!selectedProduct.value || !offerPrice.value) return 0
  const original = selectedProduct.value.price
  if (offerPrice.value >= original) return 0
  return Math.round((1 - offerPrice.value / original) * 100)
})

const openCreateModal = () => {
  editingOffer.value = null
  productId.value = products.value[0]?.id || null
  productSearch.value = products.value[0]?.name || ''
  offerPrice.value = Math.round((products.value[0]?.price || 0) * 0.8) // 20% discount default
  
  // Default starts now, ends in 7 days
  const now = new Date()
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  startsAt.value = now.toISOString().slice(0, 16)
  endsAt.value = weekLater.toISOString().slice(0, 16)
  active.value = true
  isLightning.value = false
  
  isModalOpen.value = true
}

const openEditModal = (offer: ProductOffer) => {
  editingOffer.value = offer
  productId.value = offer.product_id
  const prod = products.value.find(p => p.id === offer.product_id)
  productSearch.value = prod?.name || ''
  offerPrice.value = offer.offer_price
  
  startsAt.value = new Date(offer.starts_at).toISOString().slice(0, 16)
  endsAt.value = new Date(offer.ends_at).toISOString().slice(0, 16)
  active.value = offer.active
  isLightning.value = offer.is_lightning || false
  
  isModalOpen.value = true
}

const selectProduct = (prod: Product) => {
  productId.value = prod.id
  productSearch.value = prod.name
  offerPrice.value = Math.round(prod.price * 0.8)
  showProductDropdown.value = false
}

const handleDelete = (id: string) => {
  if (confirm('¿Estás seguro de que quieres retirar esta oferta?')) {
    offersStore.deleteOffer(id)
    notificationsStore.showToast('Oferta eliminada correctamente.', 'success')
  }
}

const handleSubmit = () => {
  if (productId.value === null || !offerPrice.value || !startsAt.value || !endsAt.value) return
  
  const originalPrice = selectedProduct.value?.price || 0
  
  const offerData = {
    product_id: productId.value,
    offer_price: offerPrice.value,
    original_price: originalPrice,
    starts_at: new Date(startsAt.value).toISOString(),
    ends_at: new Date(endsAt.value).toISOString(),
    is_lightning: isLightning.value
  }

  if (editingOffer.value) {
    offersStore.updateOffer(editingOffer.value.id, {
      ...offerData,
      active: active.value
    })
    notificationsStore.showToast('Oferta actualizada con éxito.', 'success')
  } else {
    offersStore.createOffer(offerData)
    notificationsStore.showToast('¡Oferta programada con éxito!', 'success')
  }

  isModalOpen.value = false
}

// Offer Status check
const getOfferStatus = (offer: ProductOffer) => {
  const now = new Date().getTime()
  const start = new Date(offer.starts_at).getTime()
  const end = new Date(offer.ends_at).getTime()
  
  if (!offer.active) return { label: 'Inactiva', class: 'bg-slate-100 text-slate-650 border-slate-200' }
  if (now < start) return { label: 'Programada', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  if (now > end) return { label: 'Expirada', class: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' }
  return { label: 'Activa', class: 'bg-amber-50 text-amber-700 border-amber-200 font-extrabold' }
}

// Send Broadcast Promotion Notification to Users
const handleSendNotification = (offer: ProductOffer) => {
  const prod = products.value.find(p => p.id === offer.product_id)
  if (!prod) return

  notificationsStore.addNotification({
    type: 'offer',
    title: `¡Super Oferta! –${offer.discount_percent}% en ${prod.name}`,
    message: `¡Solo por tiempo limitado! Consigue tu ${prod.name} a tan solo $${offer.offer_price.toLocaleString()} (Precio regular $${offer.original_price.toLocaleString()}). Válido hasta el ${new Date(offer.ends_at).toLocaleDateString()}.`,
    productId: prod.id
  })

  notificationsStore.showToast('¡Notificación promocional enviada a los clientes!', 'success')
}
</script>

<template>
  <div class="space-y-8 text-left text-slate-800">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl sm:text-3xl font-display font-black text-slate-800 flex items-center gap-2">
          <Tag class="w-7 h-7 text-amber-500" /> Gestión de Ofertas
        </h1>
        <p class="text-xs text-slate-500 mt-1 font-semibold">
          Programa ofertas temporales con precios rebajados, fechas límite y alertas push para clientes.
        </p>
      </div>
      
      <BaseButton variant="secondary" size="sm" class="flex items-center gap-1.5 cursor-pointer font-bold" @click="openCreateModal">
        <Plus class="w-4.5 h-4.5 text-white" />
        Crear Oferta
      </BaseButton>
    </div>

    <!-- Empty State -->
    <div v-if="offers.length === 0" class="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-sm">
      <div class="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
        <Tag class="w-8 h-8" />
      </div>
      <div class="max-w-md mx-auto space-y-2">
        <h3 class="text-sm font-bold text-slate-850">No hay ofertas programadas</h3>
        <p class="text-xs text-slate-450 font-semibold leading-normal">
          Las ofertas aumentan las ventas. Programa descuentos en prendas seleccionadas y el sistema mostrará automáticamente un reloj de cuenta regresiva dinámico en la página de inicio.
        </p>
      </div>
      <BaseButton variant="outline" size="sm" class="font-bold border-amber-250 text-amber-700 hover:bg-amber-50" @click="openCreateModal">
        Crear mi primera oferta
      </BaseButton>
    </div>

    <!-- Active Offers List -->
    <div v-else class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4 sm:p-6">
      <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-1.5">
        <Sparkles class="w-4.5 h-4.5 text-amber-500" />
        Lista de Descuentos Programados
      </h3>

      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[900px] text-xs font-semibold text-slate-600">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[9px]">
              <th class="py-3 text-left">Prenda</th>
              <th class="py-3 text-left">Precio Original</th>
              <th class="py-3 text-left">Precio Oferta</th>
              <th class="py-3 text-left">Descuento</th>
              <th class="py-3 text-left">Vigencia</th>
              <th class="py-3 text-left">Estado</th>
              <th class="py-3 text-center">Notificar / Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="offer in offers" :key="offer.id">
              <!-- Product Info -->
              <td class="py-4">
                <div class="flex items-center space-x-3 text-left">
                  <img 
                    :src="products.find(p => p.id === offer.product_id)?.images[0]?.url" 
                    class="w-10 h-12 object-cover rounded border border-slate-200"
                  />
                  <div class="min-w-0">
                    <p class="font-bold text-slate-800 truncate">{{ products.find(p => p.id === offer.product_id)?.name }}</p>
                    <p class="text-[10px] text-slate-400 font-mono mt-0.5">{{ products.find(p => p.id === offer.product_id)?.slug }}</p>
                  </div>
                </div>
              </td>
              
              <!-- Original Price -->
              <td class="py-4 text-slate-400 line-through font-mono">
                ${{ offer.original_price.toLocaleString() }}
              </td>

              <!-- Offer Price -->
              <td class="py-4 font-black text-orange-600 font-mono text-sm">
                ${{ offer.offer_price.toLocaleString() }}
              </td>

              <!-- Discount percentage badge -->
              <td class="py-4">
                <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-md text-[10px] font-black uppercase tracking-wider animate-pulse">
                  –{{ offer.discount_percent }}%
                </span>
              </td>

              <!-- Schedule Dates -->
              <td class="py-4 text-left space-y-0.5 font-semibold text-slate-500">
                <p class="text-[10px]"><span class="font-bold text-slate-400">INICIA:</span> {{ new Date(offer.starts_at).toLocaleString() }}</p>
                <p class="text-[10px]"><span class="font-bold text-slate-400">TERMINA:</span> {{ new Date(offer.ends_at).toLocaleString() }}</p>
              </td>

              <!-- Current Offer status -->
              <td class="py-4">
                <div class="flex flex-col gap-1 items-start">
                  <span :class="['px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wide border font-bold', getOfferStatus(offer).class]">
                    {{ getOfferStatus(offer).label }}
                  </span>
                  <span v-if="offer.is_lightning" class="px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wide border font-bold bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                    <Sparkles class="w-3 h-3" /> Relámpago
                  </span>
                </div>
              </td>

              <!-- Actions and Promotion notification -->
              <td class="py-4 text-center">
                <div class="flex items-center justify-center gap-3">
                  <!-- Broadcast notification -->
                  <button 
                    v-if="getOfferStatus(offer).label === 'Activa'"
                    @click="handleSendNotification(offer)"
                    class="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 flex items-center gap-1 cursor-pointer font-bold text-[10px]"
                    title="Enviar Notificación de Oferta"
                  >
                    <Send class="w-3.5 h-3.5" />
                    Enviar Promo
                  </button>

                  <button 
                    @click="openEditModal(offer)"
                    class="p-1.5 rounded-full hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="Editar Oferta"
                  >
                    <Edit class="w-4 h-4" />
                  </button>

                  <button 
                    @click="handleDelete(offer.id)"
                    class="p-1.5 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Eliminar Oferta"
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
          v-for="offer in offers" 
          :key="`mobile-${offer.id}`"
          class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3"
        >
          <div class="flex items-start gap-4">
            <img 
              :src="products.find(p => p.id === offer.product_id)?.images[0]?.url" 
              class="w-16 h-20 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <h4 class="font-black text-slate-800 text-sm truncate">{{ products.find(p => p.id === offer.product_id)?.name }}</h4>
              
              <div class="flex items-baseline gap-2 mt-1">
                <span class="font-black text-orange-600 text-lg">${{ offer.offer_price.toLocaleString() }}</span>
                <span class="text-[10px] text-slate-400 line-through">${{ offer.original_price.toLocaleString() }}</span>
              </div>
              
              <div class="flex items-center gap-2 mt-1.5">
                <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
                  –{{ offer.discount_percent }}% OFF
                </span>
                <span :class="['px-2 py-0.5 rounded text-[9px] uppercase tracking-wide border font-bold', getOfferStatus(offer).class]">
                  {{ getOfferStatus(offer).label }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[10px] text-slate-500 font-semibold space-y-1">
            <p><span class="font-bold text-slate-400">INICIA:</span> {{ new Date(offer.starts_at).toLocaleString() }}</p>
            <p><span class="font-bold text-slate-400">TERMINA:</span> {{ new Date(offer.ends_at).toLocaleString() }}</p>
          </div>

          <div class="grid grid-cols-3 gap-2 mt-1">
            <button 
              v-if="getOfferStatus(offer).label === 'Activa'"
              @click="handleSendNotification(offer)"
              class="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center col-span-3 gap-1.5"
            >
              <Send class="w-4 h-4" /> Enviar Promo a Clientes
            </button>
            
            <button 
              @click="openEditModal(offer)"
              :class="['py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5', getOfferStatus(offer).label === 'Activa' ? 'col-span-1' : 'col-span-2']"
            >
              <Edit class="w-4 h-4" /> Editar
            </button>
            <button 
              @click="handleDelete(offer.id)"
              :class="['py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5', getOfferStatus(offer).label === 'Activa' ? 'col-span-2' : 'col-span-1']"
            >
              <Trash2 class="w-4 h-4" /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Offer Modal -->
    <BaseModal 
      :show="isModalOpen" 
      @close="isModalOpen = false"
      :title="editingOffer ? 'Editar Oferta Especial' : 'Programar Nueva Oferta'"
      size="md"
      class="text-slate-800"
    >
      <form @submit.prevent="handleSubmit" class="space-y-5 text-left">
        
        <!-- Product Dropdown Search Selector -->
        <div class="relative">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Seleccionar Producto</label>
          <div class="flex space-x-2">
            <div class="relative flex-1">
              <input
                type="text"
                v-model="productSearch"
                @focus="showProductDropdown = true"
                placeholder="Busca una prenda por nombre..."
                class="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                :disabled="editingOffer !== null"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            </div>
          </div>

          <!-- Dropdown items -->
          <div 
            v-if="showProductDropdown && editingOffer === null" 
            class="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100"
          >
            <div 
              v-for="p in filteredProducts" 
              :key="p.id"
              @click="selectProduct(p)"
              class="p-3 hover:bg-slate-50 cursor-pointer flex items-center space-x-3 transition"
            >
              <img :src="p.images[0]?.url" class="w-8 h-10 object-cover rounded" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-800 truncate">{{ p.name }}</p>
                <p class="text-[10px] text-slate-550 font-bold font-mono">${{ p.price.toLocaleString() }}</p>
              </div>
            </div>
            <div v-if="filteredProducts.length === 0" class="p-3 text-center text-xs text-slate-400 italic">
              No se encontraron coincidencias.
            </div>
          </div>
        </div>

        <!-- Price display and pricing input -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
            <span class="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mb-1">Precio Original</span>
            <span class="block text-lg font-mono font-black text-slate-500 leading-none">
              ${{ selectedProduct?.price.toLocaleString() || '0' }}
            </span>
          </div>

          <BaseInput
            id="off-price"
            v-model.number="offerPrice"
            type="number"
            label="Precio Especial de Oferta ($)"
            required
          />
        </div>

        <!-- Automatic calculated discount banner -->
        <div v-if="calculatedDiscount > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center space-x-3">
          <div class="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-sm font-black animate-pulse">
            –{{ calculatedDiscount }}%
          </div>
          <p class="text-xs text-amber-700 font-semibold">
            ¡Los clientes verán una etiqueta destacada de descuento de <strong>–{{ calculatedDiscount }}%</strong> en la Landing!
          </p>
        </div>

        <div v-else-if="selectedProduct && offerPrice >= selectedProduct.price" class="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center space-x-2 text-rose-700">
          <AlertCircle class="w-4 h-4 text-rose-500 shrink-0" />
          <p class="text-[11px] font-semibold">El precio de oferta debe ser menor al precio original.</p>
        </div>

        <!-- Active Dates scheduling -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha y Hora de Inicio</label>
            <input
              type="datetime-local"
              v-model="startsAt"
              required
              class="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha y Hora de Cierre</label>
            <input
              type="datetime-local"
              v-model="endsAt"
              required
              class="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
            />
          </div>
        </div>

        <!-- Visual Live preview simulation -->
        <div v-if="selectedProduct" class="border-t border-slate-200 pt-4 space-y-2">
          <span class="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Previsualización de Tarjeta de Descuento</span>
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-250 p-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <img :src="selectedProduct.images[0]?.url" class="w-8 h-10 object-cover rounded border" />
              <div class="text-left leading-tight">
                <p class="text-xs font-bold text-slate-800 truncate max-w-[150px]">{{ selectedProduct.name }}</p>
                <div class="flex items-baseline space-x-1.5 mt-0.5">
                  <span class="text-sm font-black text-orange-600 font-mono">${{ offerPrice.toLocaleString() }}</span>
                  <span class="text-[10px] text-slate-400 line-through font-mono">${{ selectedProduct.price.toLocaleString() }}</span>
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded text-[9px] font-black uppercase tracking-wider">
                –{{ calculatedDiscount }}% OFF
              </span>
            </div>
          </div>
        </div>

        <!-- Toggle immediate activation -->
        <div class="flex items-center justify-between border-t border-slate-200 pt-4">
          <label v-if="editingOffer" class="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer select-none">
            <input type="checkbox" v-model="active" class="accent-indigo-600 h-4.5 w-4.5 rounded" />
            Oferta Activa / Visible
          </label>
          <div v-else></div>

          <label class="flex items-center gap-2 text-xs font-bold text-orange-600 cursor-pointer select-none bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
            <input type="checkbox" v-model="isLightning" class="accent-orange-600 h-4.5 w-4.5 rounded" />
            ⚡ Oferta Relámpago
          </label>
        </div>

        <div class="border-t border-slate-200 pt-4 flex gap-4 justify-end">
          <BaseButton variant="outline" class="cursor-pointer border-slate-200 text-slate-650" @click.prevent="isModalOpen = false">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="secondary" class="cursor-pointer font-bold" :disabled="selectedProduct === null || (selectedProduct && offerPrice >= selectedProduct.price)">
            {{ editingOffer ? 'Guardar Cambios' : 'Activar Descuento' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

  </div>
</template>
