import { defineStore } from 'pinia'
import type { ProductOffer } from '../types'
import { useProductStore } from './products'

export const useOffersStore = defineStore('offers', {
  state: () => {
    const localOffers = localStorage.getItem('comerciambre_offers')
    let parsedOffers: ProductOffer[] = localOffers ? JSON.parse(localOffers) : []
    
    // Inyectar oferta relámpago de demostración si no hay ninguna para que el usuario pueda ver el diseño
    if (!parsedOffers.some(o => o.is_lightning && o.active)) {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      parsedOffers.push({
        id: 'demo-lightning-2',
        product_id: 1,
        offer_price: 599,
        original_price: 1299,
        discount_percent: 54,
        starts_at: new Date(now.getTime() - 100000).toISOString(),
        ends_at: tomorrow.toISOString(),
        active: true,
        is_lightning: true,
        created_at: now.toISOString()
      })
      
      // Inyectar más de 3 para forzar la aparición del botón "Ver Todas"
      for(let i=2; i<=5; i++) {
        parsedOffers.push({
          id: `demo-lightning-${i+1}`,
          product_id: i,
          offer_price: 499,
          original_price: 899,
          discount_percent: 44,
          starts_at: new Date(now.getTime() - 100000).toISOString(),
          ends_at: tomorrow.toISOString(),
          active: true,
          is_lightning: true,
          created_at: now.toISOString()
        })
      }
      
      localStorage.setItem('comerciambre_offers', JSON.stringify(parsedOffers))
    }

    return {
      offers: parsedOffers
    }
  },
  getters: {
    activeOffers: (state) => {
      const now = new Date().getTime()
      return state.offers.filter((o: ProductOffer) => 
        o.active && 
        new Date(o.starts_at).getTime() <= now && 
        new Date(o.ends_at).getTime() > now
      )
    },
    getOfferByProductId: (state) => (productId: number) => {
      const now = new Date().getTime()
      return state.offers.find((o: ProductOffer) => 
        o.product_id === productId && 
        o.active && 
        new Date(o.starts_at).getTime() <= now && 
        new Date(o.ends_at).getTime() > now
      )
    }
  },
  actions: {
    saveToLocalStorage() {
      localStorage.setItem('comerciambre_offers', JSON.stringify(this.offers))
    },
    syncOffersWithProducts() {
      const productStore = useProductStore()
      productStore.products.forEach(p => {
        const activeOffer = this.getOfferByProductId(p.id)
        p.current_offer = activeOffer || undefined
      })
      productStore.saveToLocalStorage()
    },
    createOffer(offerData: Omit<ProductOffer, 'id' | 'created_at' | 'discount_percent' | 'active'>) {
      const discount = Math.round((1 - offerData.offer_price / offerData.original_price) * 100)
      const newOffer: ProductOffer = {
        ...offerData,
        id: crypto.randomUUID(),
        discount_percent: discount,
        active: true,
        created_at: new Date().toISOString()
      }
      this.offers.push(newOffer)
      this.saveToLocalStorage()
      this.syncOffersWithProducts()
      return newOffer
    },
    updateOffer(id: string, updatedFields: Partial<ProductOffer>) {
      const idx = this.offers.findIndex((o: ProductOffer) => o.id === id)
      if (idx !== -1) {
        const offer = { ...this.offers[idx], ...updatedFields }
        if (updatedFields.offer_price !== undefined || updatedFields.original_price !== undefined) {
          offer.discount_percent = Math.round((1 - offer.offer_price / offer.original_price) * 100)
        }
        this.offers[idx] = offer
        this.saveToLocalStorage()
        this.syncOffersWithProducts()
      }
    },
    deleteOffer(id: string) {
      this.offers = this.offers.filter((o: ProductOffer) => o.id !== id)
      this.saveToLocalStorage()
      this.syncOffersWithProducts()
    },
    deactivateExpired() {
      const now = new Date().getTime()
      let updated = false
      this.offers.forEach((o: ProductOffer) => {
        if (o.active && new Date(o.ends_at).getTime() <= now) {
          o.active = false
          updated = true
        }
      })
      if (updated) {
        this.saveToLocalStorage()
        this.syncOffersWithProducts()
      }
    }
  }
})
