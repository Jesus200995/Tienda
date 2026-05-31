import type { Product, Category, Banner, Settings } from '../types'

export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Abrigos y Chaquetas',
    slug: 'abrigos-y-chaquetas',
    description: 'Estilo sofisticado y protección para cualquier clima.',
    image: '/premium_jacket.png',
    active: true,
    sort_order: 1
  },
  {
    id: 2,
    name: 'Sudadera & Hoodies',
    slug: 'sudaderas-y-hoodies',
    description: 'Comodidad urbana y cortes oversize premium.',
    image: '/premium_hoodie.png',
    active: true,
    sort_order: 2
  },
  {
    id: 3,
    name: 'Camisas & Tops',
    slug: 'camisas-y-tops',
    description: 'Elegancia casual con tejidos transpirables de alta calidad.',
    image: '/premium_shirt.png',
    active: true,
    sort_order: 3
  }
]

export const mockProducts: Product[] = [
  {
    id: 1,
    category_id: 1,
    name: 'Chaqueta de Cuero Premium "Ares"',
    slug: 'chaqueta-de-cuero-premium-ares',
    description: 'Chaqueta de cuero genuino 100% corte slim. Un diseño clásico con cremalleras metálicas resistentes de alta calidad, forro interno satinado extremadamente cómodo y costuras reforzadas. Ideal para un look rebelde pero elegante.',
    price: 3499,
    compare_price: 4500,
    stock: 12,
    featured: true,
    active: true,
    images: [
      {
        id: 101,
        product_id: 1,
        url: '/premium_jacket.png',
        alt: 'Chaqueta Ares frente',
        sort_order: 1,
        is_primary: true
      }
    ],
    variants: [
      { id: 11, product_id: 1, size: 'S', color: 'Negro', color_hex: '#111111', stock: 3, price_adjustment: 0, sku: 'JK-ARES-BLK-S' },
      { id: 12, product_id: 1, size: 'M', color: 'Negro', color_hex: '#111111', stock: 4, price_adjustment: 0, sku: 'JK-ARES-BLK-M' },
      { id: 13, product_id: 1, size: 'L', color: 'Negro', color_hex: '#111111', stock: 3, price_adjustment: 0, sku: 'JK-ARES-BLK-L' },
      { id: 14, product_id: 1, size: 'XL', color: 'Negro', color_hex: '#111111', stock: 2, price_adjustment: 150, sku: 'JK-ARES-BLK-XL' }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    category_id: 2,
    name: 'Hoodie Oversize Streetwear "Chronos"',
    slug: 'hoodie-oversize-streetwear-chronos',
    description: 'Sudadera con capucha corte oversize hecha con algodón de felpa pesada de 400g. Calidez insuperable, tacto ultra suave y una caída de hombros caída perfecta. Cuenta con un bolsillo canguro espacioso y puños acanalados de alta resistencia.',
    price: 1599,
    compare_price: 1999,
    stock: 25,
    featured: true,
    active: true,
    images: [
      {
        id: 201,
        product_id: 2,
        url: '/premium_hoodie.png',
        alt: 'Hoodie Chronos Beige',
        sort_order: 1,
        is_primary: true
      }
    ],
    variants: [
      { id: 21, product_id: 2, size: 'S', color: 'Beige', color_hex: '#dfd5c6', stock: 8, price_adjustment: 0, sku: 'HD-CHRN-BGE-S' },
      { id: 22, product_id: 2, size: 'M', color: 'Beige', color_hex: '#dfd5c6', stock: 10, price_adjustment: 0, sku: 'HD-CHRN-BGE-M' },
      { id: 23, product_id: 2, size: 'L', color: 'Beige', color_hex: '#dfd5c6', stock: 7, price_adjustment: 0, sku: 'HD-CHRN-BGE-L' }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    category_id: 3,
    name: 'Camisa de Lino Casual "Aether"',
    slug: 'camisa-de-lino-casual-aether',
    description: 'Camisa manga larga confeccionada en lino 100% orgánico. Ofrece un flujo de aire óptimo, perfecta para climas cálidos o para vestir casual-formal de manera cómoda. Cuello camisero clásico y botones de madera orgánica que acentúan su look natural.',
    price: 1299,
    stock: 18,
    featured: true,
    active: true,
    images: [
      {
        id: 301,
        product_id: 3,
        url: '/premium_shirt.png',
        alt: 'Camisa Aether Sage',
        sort_order: 1,
        is_primary: true
      }
    ],
    variants: [
      { id: 31, product_id: 3, size: 'M', color: 'Verde Salvia', color_hex: '#8f9779', stock: 8, price_adjustment: 0, sku: 'SH-AETH-SGE-M' },
      { id: 32, product_id: 3, size: 'L', color: 'Verde Salvia', color_hex: '#8f9779', stock: 10, price_adjustment: 0, sku: 'SH-AETH-SGE-L' }
    ],
    created_at: new Date().toISOString()
  }
]

export const mockBanners: Banner[] = [
  {
    id: 1,
    title: 'Nueva Colección Urbana 2026',
    subtitle: 'Viste la diferencia con prendas premium diseñadas para el día a día.',
    image: '/hero_banner_fashion.png',
    link: '/catalog',
    active: true,
    sort_order: 1
  }
]

export const mockSettings: Settings = {
  store_name: 'El Comerciambre',
  store_email: 'contacto@elcomerciambre.com',
  store_phone: '+52 55 1234 5678',
  store_whatsapp: '525512345678',
  facebook_url: 'https://facebook.com/elcomerciambre',
  instagram_url: 'https://instagram.com/elcomerciambre',
  tiktok_url: 'https://tiktok.com/@elcomerciambre',
  founder_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Audio demo
  founder_audio_title: 'Un mensaje del fundador, El Comerciambre',
  free_shipping_min: 2000,
  shipping_cost: 150
}
