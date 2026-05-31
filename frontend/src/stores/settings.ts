import { defineStore } from 'pinia'
import type { Settings, Banner } from '../types'
import { mockSettings, mockBanners } from '../api/mockData'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: mockSettings as Settings,
    banners: mockBanners as Banner[],
    loading: false,
    error: null as string | null
  }),
  getters: {
    whatsAppLink: (state) => {
      const text = encodeURIComponent('¡Hola! Me gustaría saber más sobre la ropa de El Comerciambre.')
      return `https://wa.me/${state.settings.store_whatsapp}?text=${text}`
    }
  },
  actions: {
    updateSettings(newSettings: Partial<Settings>) {
      this.settings = { ...this.settings, ...newSettings }
    },
    addBanner(banner: Banner) {
      this.banners.push(banner)
    },
    updateBanner(id: number, updatedBanner: Partial<Banner>) {
      const idx = this.banners.findIndex(b => b.id === id)
      if (idx !== -1) {
        this.banners[idx] = { ...this.banners[idx], ...updatedBanner }
      }
    },
    deleteBanner(id: number) {
      this.banners = this.banners.filter(b => b.id !== id)
    }
  }
})
