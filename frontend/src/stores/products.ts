import { defineStore } from 'pinia'
import type { Product, Category } from '../types'
import { mockProducts, mockCategories } from '../api/mockData'

interface ProductsState {
  products: Product[];
  categories: Category[];
  searchQuery: string;
  selectedCategorySlug: string;
  selectedSize: string;
  selectedColor: string;
  priceRange: [number, number];
  sortBy: string; // 'price-asc' | 'price-desc' | 'newest' | 'featured'
  loading: boolean;
  error: string | null;
}

export const useProductStore = defineStore('products', {
  state: (): ProductsState => {
    // Load from localStorage or mockData
    const localProducts = localStorage.getItem('comerciambre_products')
    const localCategories = localStorage.getItem('comerciambre_categories')
    
    return {
      products: localProducts ? JSON.parse(localProducts) : mockProducts,
      categories: localCategories ? JSON.parse(localCategories) : mockCategories,
      searchQuery: '',
      selectedCategorySlug: '',
      selectedSize: '',
      selectedColor: '',
      priceRange: [0, 10000],
      sortBy: 'featured',
      loading: false,
      error: null
    }
  },
  getters: {
    featuredProducts: (state) => state.products.filter(p => p.featured && p.active),
    
    activeCategories: (state) => state.categories.filter(c => c.active),
    
    maxProductPrice: (state) => {
      if (state.products.length === 0) return 0
      return Math.max(...state.products.map(p => p.price))
    },
    
    allSizes: (state) => {
      const sizes = new Set<string>()
      state.products.forEach(p => {
        p.variants.forEach(v => sizes.add(v.size))
      })
      return Array.from(sizes)
    },
    
    allColors: (state) => {
      const colors = new Map<string, string>() // Name -> Hex
      state.products.forEach(p => {
        p.variants.forEach(v => {
          if (v.color_hex) {
            colors.set(v.color, v.color_hex)
          }
        })
      })
      return Array.from(colors.entries()).map(([name, hex]) => ({ name, hex }))
    },

    filteredProducts: (state) => {
      let result = [...state.products].filter(p => p.active)
      
      // Filter by Category
      if (state.selectedCategorySlug) {
        const cat = state.categories.find(c => c.slug === state.selectedCategorySlug)
        if (cat) {
          result = result.filter(p => p.category_id === cat.id)
        }
      }
      
      // Filter by Search Query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase().trim()
        result = result.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        )
      }
      
      // Filter by Size
      if (state.selectedSize) {
        result = result.filter(p => 
          p.variants.some(v => v.size === state.selectedSize && v.stock > 0)
        )
      }
      
      // Filter by Color
      if (state.selectedColor) {
        result = result.filter(p => 
          p.variants.some(v => v.color === state.selectedColor && v.stock > 0)
        )
      }
      
      // Filter by Price Range
      result = result.filter(p => 
        p.price >= state.priceRange[0] && p.price <= state.priceRange[1]
      )
      
      // Sort
      if (state.sortBy === 'price-asc') {
        result.sort((a, b) => a.price - b.price)
      } else if (state.sortBy === 'price-desc') {
        result.sort((a, b) => b.price - a.price)
      } else if (state.sortBy === 'newest') {
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      } else {
        // Featured
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      }
      
      return result
    }
  },
  actions: {
    getProductBySlug(slug: string): Product | undefined {
      return this.products.find(p => p.slug === slug)
    },

    getProductById(id: number): Product | undefined {
      return this.products.find(p => p.id === id)
    },
    
    resetFilters() {
      this.searchQuery = ''
      this.selectedCategorySlug = ''
      this.selectedSize = ''
      this.selectedColor = ''
      this.priceRange = [0, this.maxProductPrice || 10000]
      this.sortBy = 'featured'
    },

    // --- ADMIN ACTIONS (Mock CRUD with LocalStorage) ---
    
    saveToLocalStorage() {
      localStorage.setItem('comerciambre_products', JSON.stringify(this.products))
      localStorage.setItem('comerciambre_categories', JSON.stringify(this.categories))
    },

    createProduct(productData: Omit<Product, 'id' | 'created_at'>) {
      const newProduct: Product = {
        ...productData,
        id: this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1,
        created_at: new Date().toISOString()
      }
      this.products.push(newProduct)
      this.saveToLocalStorage()
    },

    updateProduct(id: number, updatedFields: Partial<Product>) {
      const idx = this.products.findIndex(p => p.id === id)
      if (idx !== -1) {
        this.products[idx] = { ...this.products[idx], ...updatedFields }
        this.saveToLocalStorage()
      }
    },

    deleteProduct(id: number) {
      this.products = this.products.filter(p => p.id !== id)
      this.saveToLocalStorage()
    },

    createCategory(categoryData: Omit<Category, 'id'>) {
      const newCategory: Category = {
        ...categoryData,
        id: this.categories.length > 0 ? Math.max(...this.categories.map(c => c.id)) + 1 : 1
      }
      this.categories.push(newCategory)
      this.saveToLocalStorage()
    },

    updateCategory(id: number, updatedFields: Partial<Category>) {
      const idx = this.categories.findIndex(c => c.id === id)
      if (idx !== -1) {
        this.categories[idx] = { ...this.categories[idx], ...updatedFields }
        this.saveToLocalStorage()
      }
    },

    deleteCategory(id: number) {
      this.categories = this.categories.filter(c => c.id !== id)
      this.saveToLocalStorage()
    }
  }
})
