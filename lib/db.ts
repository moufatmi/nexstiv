import { createClient } from '@supabase/supabase-js'
import { MOCK_PRODUCTS, MockProduct, MockCollection, Order } from './products-mock'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (url, options) => {
          return fetch(url, { ...options, cache: 'no-store' })
        }
      }
    })
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

// ── PRODUCT REVIEWS ────────────────────────────────────────────────────────

export interface ProductReview {
  id: string
  product_id: string
  author_name: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      if (!error && data) {
        return data as ProductReview[]
      }
    } catch (e) {
      console.error(e)
    }
  }
  return []
}

export async function submitReview(review: Omit<ProductReview, 'id' | 'status' | 'created_at'>): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('product_reviews').insert([review])
    if (!error) return true
  }
  return false
}

export async function fetchAllReviewsAdmin(): Promise<ProductReview[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        return data as ProductReview[]
      }
    } catch (e) {
      console.error(e)
    }
  }
  return []
}

export async function updateReviewStatus(id: string, status: ProductReview['status']): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('product_reviews').update({ status }).eq('id', id)
    if (!error) return true
  }
  return false
}

export async function deleteReview(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('product_reviews').delete().eq('id', id)
    if (!error) return true
  }
  return false
}

// ── NEWSLETTER SUBSCRIBERS ────────────────────────────────────────────────

export interface NewsletterSubscriber {
  id: string
  email: string
  status: string
  created_at: string
}

export async function submitNewsletter(email: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    // Attempt to insert; if it fails (e.g., unique constraint), we can return false.
    const { error } = await supabase.from('newsletter_subscribers').insert([{ email }])
    if (!error) return true
  }
  return false
}

export async function fetchSubscribers(): Promise<NewsletterSubscriber[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        return data as NewsletterSubscriber[]
      }
    } catch (e) {
      console.error(e)
    }
  }
  return []
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
    if (!error) return true
  }
  return false
}

// ── Orders ─────────────────────────────────────────────────────────────────

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
  autoDiscounts: { name: string; minItems: number; discountValue: number; type: 'fixed' | 'percentage' }[]
  uiContent: {
    marqueeText: string
    heroBadge: string
    heroTitle: string
    heroDescription: string
    heroButtonText: string
    collectionsTitle: string
    collectionsSubtitle: string
    footerDescription: string
    featuresBgText: string
    features: { stat: string; label: string; sub: string }[]
    categoriesTitle: string
    categoriesSubtitle: string
    footerColumns: { title: string; links: { label: string; url: string }[] }[]
    storySubtitle: string
    storyTitle: string
    storyParagraph1: string
    storyParagraph2: string
    storyStats: { n: string; l: string }[]
    storyFeatures: { title: string; body: string }[]
    contactSubtitle: string
    contactTitle: string
    contactDescription: string
    contactDetails: { label: string; value: string }[]
    newsletterSubtitle: string
    newsletterTitle: string
    newsletterDescription: string
    newsletterButtonText: string
    pageAbout: string
    pageContact: string
    pageFAQ: string
    pageShipping: string
    pageReturns: string
    pageCareers: string
    dropCountdownEnabled: boolean
    dropCountdownTitle: string
    dropCountdownDate: string
  }
}

const SETTINGS_KEY = 'nexstiv-settings'

export const DEFAULT_SETTINGS: StoreSettings = {
  taxRate: 10,
  shippingFee: 15,
  freeShippingThreshold: 100,
  promoCodes: [{ code: 'SAVE10', discount: 10 }],
  autoDiscounts: [],
  uiContent: {
    marqueeText: 'PREMIUM QUALITY, FREE SHIPPING OVER 500 MAD, NEW ARRIVALS, 30-DAY RETURNS, NEXSTIV ORIGINALS, CRAFTED WITH CARE',
    heroBadge: 'SS\'26 Collection',
    heroTitle: 'Wear the\nDifference.',
    heroDescription: 'Premium quality t-shirts engineered for those who refuse to blend in. Every stitch, intentional.',
    heroButtonText: 'Shop Collection',
    collectionsTitle: 'Trending Now',
    collectionsSubtitle: 'The Collection',
    footerDescription: 'Premium t-shirts for the modern lifestyle',
    featuresBgText: 'QUALITY',
    features: [
      { stat: '100%', label: 'Premium Cotton', sub: 'Sourced from trusted suppliers' },
      { stat: '500+', label: 'Free Shipping', sub: 'On every qualifying order' },
      { stat: '30', label: 'Day Returns', sub: 'No questions asked' },
    ],
    categoriesTitle: 'Collections',
    categoriesSubtitle: 'Browse by Category',
    footerColumns: [
      {
        title: 'Shop',
        links: [
          { label: 'All Products', url: '/#collections' },
          { label: 'New Arrivals', url: '/#collections' },
          { label: 'Best Sellers', url: '/#collections' },
        ]
      },
      {
        title: 'Company',
        links: [
          { label: 'About', url: '/about' },
          { label: 'Contact', url: '/contact' },
          { label: 'Careers', url: '/careers' },
        ]
      },
      {
        title: 'Support',
        links: [
          { label: 'FAQ', url: '/faq' },
          { label: 'Shipping', url: '/shipping' },
          { label: 'Returns', url: '/returns' },
        ]
      }
    ],
    storySubtitle: 'Our Story',
    storyTitle: 'Built for those\nwho stand out.',
    storyParagraph1: 'NEXSTIV was founded on a simple belief — that what you wear should say something about who you are without you having to say a word. We create premium t-shirts using responsibly sourced cotton, cut and sewn to last.',
    storyParagraph2: 'Every piece is designed in-house, produced in small batches, and quality-checked by hand before it reaches you. No mass production. No shortcuts.',
    storyStats: [
      { n: '2021', l: 'Founded' },
      { n: '12K+', l: 'Customers' },
      { n: '100%', l: 'Cotton' },
    ],
    storyFeatures: [
      { title: 'Ethical Production', body: 'Every garment is made in certified facilities with fair wages and safe conditions.' },
      { title: 'Premium Materials', body: 'We use 180–220 GSM ring-spun cotton for softness that lasts wash after wash.' },
      { title: 'Small Batches', body: 'Limited runs mean better quality control and less waste going to landfill.' },
      { title: 'Free Returns', body: '30-day no-questions returns on all orders. Your satisfaction is guaranteed.' },
    ],
    contactSubtitle: 'Get in Touch',
    contactTitle: 'We\'d love\nto hear from you.',
    contactDescription: 'Have a question about sizing, an order, or just want to say hello? Fill out the form and we\'ll get back to you within 24 hours.',
    contactDetails: [
      { label: 'Email', value: 'hello@nexstiv.com' },
      { label: 'Hours', value: 'Mon–Fri, 9am–6pm' },
      { label: 'Response time', value: 'Within 24 hours' },
    ],
    newsletterSubtitle: 'Stay in the loop',
    newsletterTitle: 'Get 10% Off',
    newsletterDescription: 'Join the NEXSTIV community. Be the first to hear about new drops, restocks, and exclusive offers.',
    newsletterButtonText: 'Subscribe',
    pageAbout: 'Learn more about our company, our mission, and our values.',
    pageContact: 'Get in touch with our team for any inquiries or support.',
    pageFAQ: 'Find answers to common questions about our products and services.',
    pageShipping: 'Information about our shipping rates, methods, and delivery times.',
    pageReturns: 'Our policy for returning or exchanging items you are not satisfied with.',
    pageCareers: 'Join our team! Explore open positions and opportunities.',
    dropCountdownEnabled: true,
    dropCountdownTitle: '🔥 NEXT DROP: SUMMER ESSENTIALS',
    dropCountdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  }
}

export async function loadSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()
      
      if (!error && data) {
        return {
          taxRate: data.tax_rate ?? DEFAULT_SETTINGS.taxRate,
          shippingFee: data.shipping_fee ?? DEFAULT_SETTINGS.shippingFee,
          freeShippingThreshold: data.free_shipping_threshold ?? DEFAULT_SETTINGS.freeShippingThreshold,
          promoCodes: data.promo_codes || DEFAULT_SETTINGS.promoCodes,
          autoDiscounts: data.auto_discounts || DEFAULT_SETTINGS.autoDiscounts,
          uiContent: { ...DEFAULT_SETTINGS.uiContent, ...(data.ui_content || {}) },
        }
      }
    } catch (e) {
      console.warn('Supabase settings fetch failed, using local fallback:', e)
    }
  }

  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed,
        uiContent: { ...DEFAULT_SETTINGS.uiContent, ...(parsed.uiContent || {}) }
      }
    }
    return DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function saveSettings(settings: StoreSettings): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          id: 1,
          tax_rate: settings.taxRate,
          shipping_fee: settings.shippingFee,
          free_shipping_threshold: settings.freeShippingThreshold,
          promo_codes: settings.promoCodes,
          auto_discounts: settings.autoDiscounts,
          ui_content: settings.uiContent,
          updated_at: new Date().toISOString()
        })
      if (error) console.error('Supabase settings save error:', error)
    } catch (e) {
      console.error('Supabase settings save failed:', e)
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }
}
