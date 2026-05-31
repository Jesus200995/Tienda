<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-vue-next'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

// Form States
const name = ref(authStore.user?.name || '')
const phone = ref(authStore.user?.phone || '')
const address = ref(authStore.user?.address || '')
const city = ref('Ciudad de México')
const zip = ref('')
const notes = ref('')

const localError = ref('')
const isProcessing = ref(false)
const step = ref<'form' | 'gateway' | 'success' | 'failure'>('form')

// Mock Invoice info after payment
const orderNumber = ref('')

// Cart values
const cartItems = computed(() => cartStore.selectedItems)
const cartSubtotal = computed(() => cartStore.selectedSubtotal)
const shippingCost = computed(() => cartStore.selectedShippingCost)
const cartTotal = computed(() => cartStore.selectedTotal)
const isEmpty = computed(() => cartStore.selectedCount === 0)

// Proceed to payment gateway simulation
const handleProceedToPayment = () => {
  localError.value = ''
  
  if (!name.value || !phone.value || !address.value || !zip.value) {
    localError.value = 'Por favor completa todos los campos requeridos de envío.'
    return
  }

  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    step.value = 'gateway' // Open Mercado Pago Simulator Screen!
  }, 1000)
}

// Complete payment simulator
const handleSimulatePayment = (status: 'approved' | 'rejected') => {
  isProcessing.value = true
  
  setTimeout(() => {
    isProcessing.value = false
    if (status === 'approved') {
      // Create random order number
      orderNumber.value = `EC-${Math.floor(100000 + Math.random() * 900000)}`
      
      // Update order list in localStorage (for admin panel read!)
      const existingOrders = JSON.parse(localStorage.getItem('comerciambre_orders') || '[]')
      const newOrder = {
        id: Math.floor(Math.random() * 10000) + 100,
        user_id: authStore.user?.id || 99,
        order_number: orderNumber.value,
        status: 'paid',
        subtotal: cartSubtotal.value,
        shipping_cost: shippingCost.value,
        total: cartTotal.value,
        shipping_address: {
          name: name.value,
          phone: phone.value,
          address: address.value,
          city: city.value,
          zip: zip.value,
          notes: notes.value
        },
        items: cartItems.value.map(item => ({
          id: Math.floor(Math.random() * 1000),
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price + (item.variant?.price_adjustment || 0),
          total: (item.product.price + (item.variant?.price_adjustment || 0)) * item.quantity
        })),
        created_at: new Date().toISOString()
      }
      existingOrders.unshift(newOrder)
      localStorage.setItem('comerciambre_orders', JSON.stringify(existingOrders))
      
      // Clear purchased items from Cart (Mercado Libre style)
      cartStore.removeSelected()
      step.value = 'success'
    } else {
      step.value = 'failure'
    }
  }, 1200)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-4 sm:pt-6 pb-12 selection:bg-secondary selection:text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      
      <!-- Back to shop link (Form step only) -->
      <div v-if="step === 'form'" class="mb-6 text-left">
        <button 
          @click="router.push({ name: 'cart' })"
          class="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4 mr-1.5" />
          Volver a la bolsa
        </button>
      </div>

      <!-- Main Step 1: Form and summary -->
      <div v-if="step === 'form'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left: Address Form -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white border border-slate-100 rounded-lg p-6 sm:p-8 shadow-soft text-left space-y-6">
            <h2 class="text-xl font-display font-bold text-primary border-b border-slate-50 pb-3">
              Datos de Envío
            </h2>
            
            <div v-if="localError" class="p-3 bg-danger/5 text-danger border border-danger/10 rounded-md text-xs font-semibold">
              {{ localError }}
            </div>
            
            <div class="space-y-4">
              <BaseInput 
                id="checkout-name"
                v-model="name"
                label="Nombre de quien recibe"
                placeholder="Juan Pérez"
                required
              />
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput 
                  id="checkout-phone"
                  v-model="phone"
                  label="Teléfono de contacto"
                  placeholder="5512345678"
                  required
                />
                <BaseInput 
                  id="checkout-zip"
                  v-model="zip"
                  label="Código Postal (CP)"
                  placeholder="06700"
                  required
                />
              </div>

              <BaseInput 
                id="checkout-address"
                v-model="address"
                label="Calle, número exterior/interior y colonia"
                placeholder="Av. Álvaro Obregón 150, Col. Roma"
                required
              />

              <BaseInput 
                id="checkout-city"
                v-model="city"
                label="Ciudad / Estado"
                placeholder="Ciudad de México"
                disabled
              />

              <div>
                <label for="checkout-notes" class="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Notas de entrega (Opcional)
                </label>
                <textarea
                  id="checkout-notes"
                  v-model="notes"
                  placeholder="Tocar timbre 3, dejar con portería, etc."
                  class="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 h-24"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary card -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white border border-slate-100 rounded-lg p-6 shadow-soft space-y-6 text-left">
            <h3 class="text-xs uppercase tracking-widest font-extrabold text-primary border-b border-slate-50 pb-2">
              Tu Pedido
            </h3>
            
            <!-- Items scrollable list -->
            <div class="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-2">
              <div 
                v-for="item in cartItems" 
                :key="`${item.product.id}-${item.variant?.id || 'none'}`"
                class="flex gap-3 py-3 first:pt-0 last:pb-0"
              >
                <img 
                  :src="item.product.images[0]?.url" 
                  :alt="item.product.name" 
                  class="w-11 h-14 object-cover rounded bg-slate-50 border border-slate-100 flex-shrink-0"
                />
                <div class="flex-grow min-w-0">
                  <h4 class="text-xs font-semibold text-primary truncate">
                    {{ item.product.name }}
                  </h4>
                  <p class="text-[9px] text-slate-400 font-semibold mt-0.5">
                    Cant: {{ item.quantity }} <span v-if="item.variant">| {{ item.variant.size }}</span>
                  </p>
                  <span class="block text-[10px] font-bold text-primary mt-1">
                    ${{ ((item.product.price + (item.variant?.price_adjustment || 0)) * item.quantity).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>

            <div class="h-px bg-slate-100"></div>

            <!-- Costs -->
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span class="font-bold text-primary">${{ cartSubtotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Envío</span>
                <span v-if="shippingCost > 0" class="font-bold text-primary">${{ shippingCost.toLocaleString() }}</span>
                <span v-else class="font-black text-success uppercase tracking-wide">¡Gratis!</span>
              </div>
              <div class="h-px bg-slate-100 my-1"></div>
              <div class="flex justify-between text-sm font-black text-primary">
                <span>Total</span>
                <span>${{ cartTotal.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Pay CTA -->
            <BaseButton 
              variant="secondary" 
              class="w-full cursor-pointer h-11"
              :loading="isProcessing"
              @click="handleProceedToPayment"
              :disabled="isEmpty"
            >
              Proceder al Pago
            </BaseButton>

            <div class="flex items-center gap-1.5 justify-center text-[10px] font-semibold text-slate-400 pt-1">
              <ShieldCheck class="w-4 h-4 text-success" />
              <span>Conexión cifrada de 256 bits</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Simulated Mercado Pago Payment Gateway Portal -->
      <div v-else-if="step === 'gateway'" class="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-left">
        <!-- Mercado Pago Header -->
        <div class="bg-[#009EE3] p-6 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold tracking-wider">mercado</span>
            <span class="px-2 py-0.5 border border-white text-[9px] font-extrabold uppercase rounded-sm">pago</span>
          </div>
          <span class="text-xs font-semibold opacity-90">Checkout Pro (Demo)</span>
        </div>
        
        <!-- Summary inside portal -->
        <div class="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-sm">
          <div>
            <p class="font-bold text-primary">Pagar a El Comerciambre</p>
            <p class="text-xs text-slate-400 mt-0.5">Prendas premium de colección</p>
          </div>
          <span class="text-lg font-black text-primary">${{ cartTotal.toLocaleString() }} MXN</span>
        </div>
        
        <!-- Payment Mock Body -->
        <div class="p-6 space-y-6">
          <div class="flex gap-3.5 items-start">
            <CreditCard class="w-6 h-6 text-[#009EE3] flex-shrink-0 mt-0.5" />
            <div class="space-y-1">
              <p class="text-sm font-bold text-primary">Simulador de Pasarela Segura</p>
              <p class="text-xs text-slate-400 leading-normal font-semibold">
                Estás en modo local. Puedes simular el resultado de Mercado Pago presionando cualquiera de los siguientes estados:
              </p>
            </div>
          </div>
          
          <div class="h-px bg-slate-100"></div>

          <div class="space-y-3">
            <BaseButton 
              variant="primary" 
              class="w-full bg-[#009EE3] hover:bg-[#008cc9] cursor-pointer h-11"
              :loading="isProcessing"
              @click="handleSimulatePayment('approved')"
            >
              ✅ Aprobar Pago (Simulado)
            </BaseButton>
            
            <BaseButton 
              variant="outline" 
              class="w-full border-danger/30 text-danger hover:bg-danger/5 cursor-pointer h-11"
              :loading="isProcessing"
              @click="handleSimulatePayment('rejected')"
            >
              ❌ Rechazar Pago (Simulado)
            </BaseButton>
          </div>

          <div class="text-center">
            <button 
              @click="step = 'form'" 
              class="text-xs text-slate-400 hover:text-primary underline cursor-pointer"
            >
              Cancelar y volver a la tienda
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Success Invoice View -->
      <div v-else-if="step === 'success'" class="max-w-lg mx-auto bg-white border border-slate-100 rounded-xl shadow-medium p-8 text-center space-y-6">
        <div class="flex flex-col items-center space-y-2">
          <CheckCircle2 class="w-16 h-16 text-success animate-bounce" />
          <h2 class="text-2xl font-display font-black text-primary">¡Pago Aprobado!</h2>
          <p class="text-xs text-slate-400 font-semibold">Gracias por comprar en El Comerciambre. Tu pedido ya está en camino.</p>
        </div>

        <div class="h-px bg-slate-100"></div>

        <!-- Invoice Details -->
        <div class="bg-slate-50 rounded-lg p-5 text-left text-xs space-y-3">
          <div class="flex justify-between">
            <span class="text-slate-400 font-semibold">Número de Pedido:</span>
            <span class="font-bold text-primary">{{ orderNumber }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400 font-semibold">Método de Pago:</span>
            <span class="font-bold text-primary">Mercado Pago (Crédito Simulado)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400 font-semibold">Estado de Envío:</span>
            <span class="px-2 py-0.5 bg-success/15 text-success rounded-md font-bold uppercase text-[9px] tracking-wider">Preparando</span>
          </div>
          
          <div class="h-px bg-slate-200/50 my-1"></div>
          
          <div class="space-y-1.5">
            <p class="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Dirección de Entrega:</p>
            <p class="font-bold text-primary">{{ name }}</p>
            <p class="text-slate-500">{{ address }}, CP {{ zip }}</p>
            <p class="text-slate-500">Tel: {{ phone }}</p>
          </div>
        </div>

        <div class="flex gap-4">
          <BaseButton 
            variant="outline" 
            class="flex-grow cursor-pointer"
            @click="router.push({ name: 'home' })"
          >
            Volver al Inicio
          </BaseButton>
          
          <BaseButton 
            variant="secondary" 
            class="flex-grow cursor-pointer"
            @click="router.push({ name: 'account' })"
          >
            Ver mis Pedidos
          </BaseButton>
        </div>
      </div>

      <!-- Payment Failure View -->
      <div v-else-if="step === 'failure'" class="max-w-md mx-auto bg-white border border-slate-100 rounded-xl shadow-medium p-8 text-center space-y-6">
        <div class="flex flex-col items-center space-y-2">
          <AlertCircle class="w-16 h-16 text-danger" />
          <h2 class="text-2xl font-display font-bold text-primary">Pago Rechazado</h2>
          <p class="text-xs text-slate-400 font-semibold leading-normal">
            Tu tarjeta no pudo ser procesada. Por favor verifica tus fondos o utiliza otro método de pago de Mercado Pago.
          </p>
        </div>

        <div class="flex gap-4 pt-2">
          <BaseButton 
            variant="outline" 
            class="flex-grow cursor-pointer"
            @click="step = 'form'"
          >
            Modificar Datos
          </BaseButton>
          
          <BaseButton 
            variant="secondary" 
            class="flex-grow cursor-pointer"
            @click="step = 'gateway'"
          >
            Reintentar Pago
          </BaseButton>
        </div>
      </div>

    </div>
  </div>
</template>
