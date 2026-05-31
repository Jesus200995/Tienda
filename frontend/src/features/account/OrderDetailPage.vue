<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import OrderTimeline from '../../components/shared/OrderTimeline.vue'
import { useCartStore } from '../../stores/cart'
import { useNotificationsStore } from '../../stores/notifications'
import BaseButton from '../../components/ui/BaseButton.vue'
import { 
  ArrowLeft, 
  ShoppingCart, 
  HelpCircle, 
  MapPin, 
  CreditCard
} from 'lucide-vue-next'
import type { Order, OrderStatusEntry } from '../../types'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const cartStore = useCartStore()
const notificationsStore = useNotificationsStore()

// Fetch order from localStorage
const order = ref<Order | null>(null)

const loadOrder = () => {
  const existingOrders = JSON.parse(localStorage.getItem('comerciambre_orders') || '[]') as Order[]
  const foundOrder = existingOrders.find(o => o.id === Number(props.id) || o.order_number === props.id)
  
  if (foundOrder) {
    order.value = foundOrder
  }
}

loadOrder()

// Format Date
const formatDate = (isoString: string) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price)
}

// Compute Status History with safe fallback for legacy orders
const statusHistory = computed((): OrderStatusEntry[] => {
  if (!order.value) return []
  if (order.value.status_history && order.value.status_history.length > 0) {
    return order.value.status_history
  }
  
  // Dynamic fallback for mock orders
  const history: OrderStatusEntry[] = [
    {
      status: 'pending',
      timestamp: order.value.created_at,
      note: 'Hemos recibido tu pedido en El Comerciambre.'
    }
  ]

  if (order.value.status !== 'pending' && order.value.status !== 'cancelled') {
    history.push({
      status: 'paid',
      timestamp: order.value.created_at,
      note: 'Pago verificado mediante Mercado Pago.'
    })
  }

  if (['preparing', 'shipped', 'delivered'].includes(order.value.status)) {
    history.push({
      status: 'preparing',
      timestamp: order.value.created_at,
      note: 'Prendas seleccionadas y empaquetadas en bodega.'
    })
  }

  if (['shipped', 'delivered'].includes(order.value.status)) {
    history.push({
      status: 'shipped',
      timestamp: order.value.created_at,
      note: 'Paquete recolectado por DHL Express.'
    })
  }

  if (order.value.status === 'delivered') {
    history.push({
      status: 'delivered',
      timestamp: order.value.created_at,
      note: 'Pedido entregado en tu domicilio.'
    })
  }

  if (order.value.status === 'cancelled') {
    history.push({
      status: 'cancelled',
      timestamp: order.value.created_at,
      note: 'El pedido fue cancelado y se inició el reembolso.'
    })
  }

  return history
})

// Rebuy action: adds all items to the cart again
const handleRebuy = () => {
  if (!order.value) return
  
  // We need to fetch current products list from localStorage to match the full Product types
  const allProducts = JSON.parse(localStorage.getItem('comerciambre_products') || '[]')
  
  let addedCount = 0
  order.value.items.forEach(orderItem => {
    const matchedProduct = allProducts.find((p: any) => p.name === orderItem.product_name)
    if (matchedProduct) {
      const variant = matchedProduct.variants.find((v: any) => v.id === orderItem.product_variant_id)
      cartStore.addItem(matchedProduct, orderItem.quantity, variant)
      addedCount++
    }
  })

  if (addedCount > 0) {
    notificationsStore.showToast(`¡Se agregaron ${addedCount} prendas a tu bolsa!`, 'success')
    router.push('/cart')
  } else {
    notificationsStore.showToast('No se pudieron agregar los productos en este momento.', 'error')
  }
}

// Help WhatsApp Link
const getWhatsAppHelpLink = computed(() => {
  if (!order.value) return '#'
  const text = encodeURIComponent(
    `Hola El Comerciambre! Necesito ayuda con mi pedido número ${order.value.order_number}.`
  )
  return `https://wa.me/525512345678?text=${text}`
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12">
    
    <!-- Go back link -->
    <div class="mb-6 text-left">
      <button 
        @click="router.push({ path: '/account', query: { tab: 'orders' } })"
        class="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        Volver a Mis Compras
      </button>
    </div>

    <div v-if="order" class="space-y-8">
      <!-- Order Summary Card Header -->
      <div class="bg-white border border-slate-100 rounded-xl p-6 shadow-soft text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-secondary block mb-1">
            Pedido Realizado el {{ formatDate(order.created_at) }}
          </span>
          <h2 class="text-xl md:text-2xl font-display font-black text-primary">
            Pedido #{{ order.order_number }}
          </h2>
        </div>
        <div class="flex flex-wrap gap-2.5 w-full md:w-auto">
          <BaseButton 
            variant="outline" 
            size="sm" 
            class="flex-1 md:flex-none flex items-center justify-center gap-1.5 h-10 text-xs font-bold cursor-pointer"
            @click="handleRebuy"
          >
            <ShoppingCart class="w-4 h-4" />
            Volver a comprar
          </BaseButton>
          
          <a 
            :href="getWhatsAppHelpLink" 
            target="_blank"
            class="flex-1 md:flex-none bg-emerald-50 hover:bg-emerald-100 text-emerald-700 h-10 px-4 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 shadow-xs border border-emerald-200/50"
          >
            <HelpCircle class="w-4 h-4" />
            Necesito ayuda
          </a>
        </div>
      </div>

      <!-- Main Columns Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Left 2 Cols: Timeline and items purchased -->
        <div class="md:col-span-2 space-y-8">
          
          <!-- Stepper Timeline component -->
          <OrderTimeline 
            :status="order.status" 
            :status-history="statusHistory"
            :tracking-number="order.tracking_number"
          />

          <!-- Purchased Items -->
          <div class="bg-white border border-slate-100 rounded-xl p-5 md:p-6 shadow-soft text-left space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider text-primary">
              Prendas compradas
            </h3>
            <div class="divide-y divide-slate-100">
              <div 
                v-for="item in order.items" 
                :key="item.id"
                class="flex gap-4 py-4 first:pt-0 last:pb-0 items-center"
              >
                <!-- Fallback item layout -->
                <div class="w-14 h-18 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingCart class="w-6 h-6" />
                </div>

                <div class="flex-grow min-w-0">
                  <h4 class="text-xs font-bold text-primary truncate">
                    {{ item.product_name }}
                  </h4>
                  <p class="text-[10px] text-slate-400 font-semibold mt-1">
                    Cantidad: {{ item.quantity }} | Unitario: {{ formatPrice(item.unit_price) }}
                  </p>
                </div>
                
                <span class="text-xs font-black text-primary ml-auto text-right">
                  {{ formatPrice(item.total) }}
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Col: Shipping info and Payment Details -->
        <div class="md:col-span-1 space-y-8">
          
          <!-- Shipping detail -->
          <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-soft text-left space-y-4">
            <div class="flex items-center gap-2 text-primary">
              <MapPin class="w-4.5 h-4.5 text-secondary" />
              <h3 class="text-xs font-bold uppercase tracking-wider">
                Dirección de Envío
              </h3>
            </div>
            <div class="text-xs space-y-1 text-slate-600 font-medium leading-normal">
              <p class="font-black text-primary">{{ order.shipping_address.name }}</p>
              <p>{{ order.shipping_address.address }}</p>
              <p>{{ order.shipping_address.city }}, CP {{ order.shipping_address.zip }}</p>
              <p>Tel: {{ order.shipping_address.phone }}</p>
              <p v-if="order.shipping_address.notes" class="text-slate-400 italic mt-2.5">
                "{{ order.shipping_address.notes }}"
              </p>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-soft text-left space-y-4">
            <div class="flex items-center gap-2 text-primary">
              <CreditCard class="w-4.5 h-4.5 text-secondary" />
              <h3 class="text-xs font-bold uppercase tracking-wider">
                Detalles del Pago
              </h3>
            </div>
            
            <div class="space-y-2.5 text-xs text-slate-500 font-medium">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="font-bold text-primary">{{ formatPrice(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Costo de envío</span>
                <span v-if="order.shipping_cost > 0" class="font-bold text-primary">{{ formatPrice(order.shipping_cost) }}</span>
                <span v-else class="font-black text-success uppercase text-[10px] tracking-wider">¡Gratis!</span>
              </div>
              
              <div class="h-px bg-slate-100 my-1"></div>
              
              <div class="flex justify-between text-sm font-black text-primary">
                <span>Total pagado</span>
                <span>{{ formatPrice(order.total) }}</span>
              </div>

              <div class="h-px bg-slate-100 my-1"></div>

              <div class="space-y-1 text-[10px] pt-1">
                <div class="flex justify-between">
                  <span>Plataforma:</span>
                  <span class="font-bold text-primary">Mercado Pago</span>
                </div>
                <div class="flex justify-between">
                  <span>ID de Pago:</span>
                  <span class="font-mono font-bold text-primary">MP-SIMULATED-OK</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- Error state -->
    <div v-else class="py-20 text-center space-y-4 bg-white border border-slate-100 rounded-lg shadow-soft p-8">
      <div class="p-4 bg-slate-50 rounded-full text-slate-400 inline-block">
        <ShoppingCart class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-primary">Pedido no encontrado</h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto">No pudimos cargar la información de tu compra. Si crees que esto es un error, por favor ponte en contacto con nosotros.</p>
      <BaseButton variant="secondary" size="md" class="cursor-pointer" @click="router.push({ path: '/account', query: { tab: 'orders' } })">
        Ir a Mis Compras
      </BaseButton>
    </div>

  </div>
</template>
