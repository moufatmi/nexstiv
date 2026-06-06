import { createClient } from '@supabase/supabase-js'
import { MOCK_PRODUCTS, MockProduct, MockCollection, Order } from './products-mock'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to load products from localStorage for offline/local mode
const getLocalProducts = (): MockProduct[] => {
  if (typeof window === 'undefined') return MOCK_PRODUCTS
  const local = localStorage.getItem('nexstiv-products')
  if (!local) {
    localStorage.setItem('nexstiv-products', JSON.stringify(MOCK_PRODUCTS))
    return MOCK_PRODUCTS
  }
  try {
    return JSON.parse(local)
  } catch (e) {
    return MOCK_PRODUCTS
  }
}

const saveLocalProducts = (products: MockProduct[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexstiv-products', JSON.stringify(products))
  }
}

export async function fetchAllProducts(): Promise<MockProduct[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        return data as MockProduct[]
      }
      console.warn('Supabase fetch error, using local fallback:', error)
    } catch (e) {
      console.warn('Supabase fetch failed, using local fallback:', e)
    }
  }
  return getLocalProducts()
}

export async function fetchProductByHandle(handle: string): Promise<MockProduct | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('handle', handle)
        .maybeSingle()
      if (!error && data) {
        return data as MockProduct
      }
    } catch (e) {
      console.warn('Supabase fetch handle failed, using local fallback:', e)
    }
  }
  const local = getLocalProducts()
  return local.find((p) => p.handle === handle) || null
}

export async function addProduct(product: Omit<MockProduct, 'id'>): Promise<MockProduct> {
  const newId = 'prod_' + Math.random().toString(36).substring(2, 11)
  const newProduct = { ...product, id: newId }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single()
      if (!error && data) {
        return data as MockProduct
      }
      console.error('Supabase insert error, falling back to local:', error)
    } catch (e) {
      console.error('Supabase insert failed, falling back to local:', e)
    }
  }

  const local = getLocalProducts()
  local.unshift(newProduct)
  saveLocalProducts(local)
  return newProduct
}

export async function updateProduct(id: string, product: Partial<MockProduct>): Promise<MockProduct | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single()
      if (!error && data) {
        return data as MockProduct
      }
      console.error('Supabase update error, falling back to local:', error)
    } catch (e) {
      console.error('Supabase update failed, falling back to local:', e)
    }
  }

  const local = getLocalProducts()
  const index = local.findIndex((p) => p.id === id)
  if (index > -1) {
    local[index] = { ...local[index], ...product }
    saveLocalProducts(local)
    return local[index]
  }
  return null
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      if (!error) return true
      console.error('Supabase delete error, falling back to local:', error)
    } catch (e) {
      console.error('Supabase delete failed, falling back to local:', e)
    }
  }

  const local = getLocalProducts()
  const filtered = local.filter((p) => p.id !== id)
  if (filtered.length !== local.length) {
    saveLocalProducts(filtered)
    return true
  }
  return false
}

export async function uploadProductImage(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (!uploadError) {
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        return data.publicUrl
      }
      console.warn('Supabase storage upload error, using local Base64 fallback:', uploadError)
    } catch (e) {
      console.warn('Supabase storage upload failed, using local Base64 fallback:', e)
    }
  }

  // Fallback: convert file to Base64 data URL for offline local testing
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Collections ────────────────────────────────────────────────────────────

const COLLECTIONS_KEY = 'nexstiv-collections'

const getLocalCollections = (): MockCollection[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalCollections = (cols: MockCollection[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(cols))
  }
}

export async function fetchAllCollections(): Promise<MockCollection[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) return data as MockCollection[]
      console.warn('Supabase collections fetch error, using local fallback:', error)
    } catch (e) {
      console.warn('Supabase collections fetch failed, using local fallback:', e)
    }
  }
  return getLocalCollections()
}

export async function addCollection(col: Omit<MockCollection, 'id'>): Promise<MockCollection> {
  const newCol: MockCollection = { ...col, id: 'col_' + Math.random().toString(36).substring(2, 11) }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert([newCol])
        .select()
        .single()
      if (!error && data) return data as MockCollection
      console.error('Supabase collection insert error:', error)
    } catch (e) {
      console.error('Supabase collection insert failed:', e)
    }
  }

  const local = getLocalCollections()
  local.unshift(newCol)
  saveLocalCollections(local)
  return newCol
}

export async function updateCollection(id: string, col: Partial<MockCollection>): Promise<MockCollection | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('collections')
        .update(col)
        .eq('id', id)
        .select()
        .single()
      if (!error && data) return data as MockCollection
      console.error('Supabase collection update error:', error)
    } catch (e) {
      console.error('Supabase collection update failed:', e)
    }
  }

  const local = getLocalCollections()
  const idx = local.findIndex((c) => c.id === id)
  if (idx > -1) {
    local[idx] = { ...local[idx], ...col }
    saveLocalCollections(local)
    return local[idx]
  }
  return null
}

export async function deleteCollection(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('collections').delete().eq('id', id)
      if (!error) return true
      console.error('Supabase collection delete error:', error)
    } catch (e) {
      console.error('Supabase collection delete failed:', e)
    }
  }

  const local = getLocalCollections()
  const filtered = local.filter((c) => c.id !== id)
  if (filtered.length !== local.length) {
    saveLocalCollections(filtered)
    return true
  }
  return false
}

// ─── Orders ─────────────────────────────────────────────────────────────────

const ORDERS_KEY = 'nexstiv-orders'

const getLocalOrders = (): Order[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const saveLocalOrders = (orders: Order[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) return data as Order[]
      console.warn('Supabase orders fetch error:', error)
    } catch (e) {
      console.warn('Supabase orders fetch failed:', e)
    }
  }
  return getLocalOrders()
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: 'ord_' + Math.random().toString(36).substring(2, 11),
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single()
      if (!error && data) return data as Order
      console.error('Supabase order insert error:', error)
    } catch (e) {
      console.error('Supabase order insert failed:', e)
    }
  }

  const local = getLocalOrders()
  local.unshift(newOrder)
  saveLocalOrders(local)
  return newOrder
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
      if (!error) return true
      console.error('Supabase order status update error:', error)
    } catch (e) {
      console.error('Supabase order status update failed:', e)
    }
  }

  const local = getLocalOrders()
  const idx = local.findIndex((o) => o.id === id)
  if (idx > -1) {
    local[idx].status = status
    saveLocalOrders(local)
    return true
  }
  return false
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id)
      if (!error) return true
      console.error('Supabase order delete error:', error)
    } catch (e) {
      console.error('Supabase order delete failed:', e)
    }
  }

  const local = getLocalOrders()
  const filtered = local.filter((o) => o.id !== id)
  if (filtered.length !== local.length) {
    saveLocalOrders(filtered)
    return true
  }
  return false
}

// ─── Store Settings ──────────────────────────────────────────────────────────

export interface StoreSettings {
  taxRate: number          // percentage e.g. 10 = 10%
  shippingFee: number      // flat fee in MAD
  freeShippingThreshold: number  // order value above which shipping is free
  promoCodes: { code: string; discount: number }[]  // discount in %
}

const SETTINGS_KEY = 'nexstiv-settings'

export const DEFAULT_SETTINGS: StoreSettings = {
  taxRate: 10,
  shippingFee: 15,
  freeShippingThreshold: 100,
  promoCodes: [{ code: 'SAVE10', discount: 10 }],
}

export function loadSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: StoreSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }
}
