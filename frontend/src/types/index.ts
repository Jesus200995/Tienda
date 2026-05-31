export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size: string; // e.g. S, M, L, XL
  color: string; // e.g. Negro, Blanco, Coral
  color_hex?: string; // e.g. #000000, #ffffff, #e94560
  stock: number;
  price_adjustment: number;
  sku: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number; // Precio tachado si hay descuento
  stock: number;
  featured: boolean;
  active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  active: boolean;
  sort_order: number;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant; // variant selected (if any)
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_variant_id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Payment {
  id: number;
  order_id: number;
  mp_payment_id?: string;
  mp_preference_id?: string;
  status: string;
  amount: number;
  payment_method?: string;
  paid_at?: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    zip: string;
    phone: string;
    notes?: string;
  };
  tracking_number?: string;
  notes?: string;
  items: OrderItem[];
  payment?: Payment;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  active: boolean;
  sort_order: number;
}

export interface Settings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_whatsapp: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  founder_audio_url?: string;
  founder_audio_title?: string;
  free_shipping_min?: number;
  shipping_cost?: number;
}
