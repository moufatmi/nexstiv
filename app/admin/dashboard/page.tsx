'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit3, Trash2, Plus, LogOut, UploadCloud, ArrowLeft, X, Eye, FolderOpen, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  fetchAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  isSupabaseConfigured,
  fetchAllCollections,
  addCollection,
  updateCollection,
  deleteCollection,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  loadSettings,
  saveSettings,
  StoreSettings,
  DEFAULT_SETTINGS,
} from '@/lib/db'
import { MockProduct, MockCollection, Order } from '@/lib/products-mock'

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const STANDARD_COLORS = ['Black', 'White', 'Navy', 'Gray', 'Forest Green', 'Sand', 'Oatmeal', 'Charcoal', 'Olive', 'Royal Blue']

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [products, setProducts] = useState<MockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'collections' | 'orders' | 'settings'>('products')
  const router = useRouter()

  // Collections state
  const [collections, setCollections] = useState<MockCollection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null)
  const [colName, setColName] = useState('')
  const [colDescription, setColDescription] = useState('')
  const [colErrorMsg, setColErrorMsg] = useState('')

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Settings state
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [settingsSaved, setSettingsSaved] = useState(false)
  // local editable copies
  const [taxRate, setTaxRate] = useState(DEFAULT_SETTINGS.taxRate)
  const [shippingFee, setShippingFee] = useState(DEFAULT_SETTINGS.shippingFee)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_SETTINGS.freeShippingThreshold)
  const [promoCodes, setPromoCodes] = useState(DEFAULT_SETTINGS.promoCodes)
  const [newPromoCode, setNewPromoCode] = useState('')
  const [newPromoDiscount, setNewPromoDiscount] = useState('')

  const [autoDiscounts, setAutoDiscounts] = useState(DEFAULT_SETTINGS.autoDiscounts)
  const [newAutoName, setNewAutoName] = useState('')
  const [newAutoMinItems, setNewAutoMinItems] = useState('')
  const [newAutoValue, setNewAutoValue] = useState('')
  const [newAutoType, setNewAutoType] = useState<'fixed'|'percentage'>('fixed')

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formTitle, setFormTitle] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formImages, setFormImages] = useState<string[]>([])
  const [formSizes, setFormSizes] = useState<string[]>(['S', 'M', 'L', 'XL'])
  const [formColors, setFormColors] = useState<string[]>(['Black', 'White'])
  const [formSeoDescription, setFormSeoDescription] = useState('')
  const [formSeoKeywords, setFormSeoKeywords] = useState('')
  const [formCollectionId, setFormCollectionId] = useState('')
  const [formInStock, setFormInStock] = useState(true)
  
  // Specs Form State
  const [specMaterial, setSpecMaterial] = useState('100% Premium Cotton')
  const [specWeight, setSpecWeight] = useState('180 GSM')
  const [specCare, setSpecCare] = useState('Machine wash cold, tumble dry low')
  const [specFit, setSpecFit] = useState('Regular fit, comfortable everyday wear')

  const [imageUploading, setImageUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('nexstiv-admin-theme', newTheme)
  }

  // Check auth and theme on mount
  useEffect(() => {
    const session = sessionStorage.getItem('nexstiv-admin-session')
    if (session !== 'true') {
      router.push('/admin')
    } else {
      setAuthorized(true)
      loadProducts()
      loadCollections()
      loadOrders()
      // Load store settings
      loadSettings().then(s => {
        setSettings(s)
        setTaxRate(s.taxRate)
        setShippingFee(s.shippingFee)
        setFreeShippingThreshold(s.freeShippingThreshold)
        setPromoCodes(s.promoCodes)
        setAutoDiscounts(s.autoDiscounts)
      })

      // Load theme
      const savedTheme = localStorage.getItem('nexstiv-admin-theme') as 'dark' | 'light' | null
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
  }, [router])

  const loadProducts = async () => {
    setLoading(true)
    const data = await fetchAllProducts()
    setProducts(data)
    setLoading(false)
  }

  const loadCollections = async () => {
    setCollectionsLoading(true)
    const data = await fetchAllCollections()
    setCollections(data)
    setCollectionsLoading(false)
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    const data = await fetchAllOrders()
    setOrders(data)
    setOrdersLoading(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('nexstiv-admin-session')
    router.push('/admin')
  }

  const handleOpenAddModal = () => {
    setEditingId(null)
    setFormTitle('')
    setFormPrice('')
    setFormDescription('')
    setFormImage('')
    setFormImages([])
    setFormSizes(['S', 'M', 'L', 'XL'])
    setFormColors(['Black', 'White'])
    setFormSeoDescription('')
    setFormSeoKeywords('')
    setFormCollectionId('')
    setSpecMaterial('100% Premium Cotton')
    setSpecWeight('180 GSM')
    setSpecCare('Machine wash cold, tumble dry low')
    setSpecFit('Regular fit, comfortable everyday wear')
    setErrorMsg('')
    setFormInStock(true)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (product: MockProduct) => {
    setEditingId(product.id)
    setFormTitle(product.title)
    setFormPrice(product.price.toString())
    setFormDescription(product.description)
    setFormImage(product.image)
    setFormImages(product.images || [product.image])
    setFormSizes(product.sizes)
    setFormColors(product.colors)
    setFormSeoDescription(product.seoDescription || '')
    setFormSeoKeywords(product.seoKeywords || '')
    setFormCollectionId(product.collection_id || '')
    setSpecMaterial(product.specs?.material || '100% Premium Cotton')
    setSpecWeight(product.specs?.weight || '180 GSM')
    setSpecCare(product.specs?.care || 'Machine wash cold, tumble dry low')
    setSpecFit(product.specs?.fit || 'Regular fit, comfortable everyday wear')
    setErrorMsg('')
    setFormInStock(product.inStock !== false)
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setImageUploading(true)
    setErrorMsg('')

    try {
      const uploadedUrls: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file)
        uploadedUrls.push(url)
      }
      // First uploaded image becomes main if none set yet
      if (!formImage) {
        setFormImage(uploadedUrls[0])
      }
      setFormImages((prev) => [...prev, ...uploadedUrls])
    } catch (err) {
      console.error(err)
      setErrorMsg('فشل رفع الصورة / Failed to upload image')
    } finally {
      setImageUploading(false)
      // Reset input so same file can be re-selected
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      // If we removed the main image, promote the first remaining one
      if (formImage === prev[index]) {
        setFormImage(next[0] || '')
      }
      return next
    })
  }

  const handleSetMainImage = (url: string) => {
    setFormImage(url)
  }

  const handleSizeToggle = (size: string) => {
    setFormSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const handleColorToggle = (color: string) => {
    setFormColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formTitle.trim()) {
      setErrorMsg('يرجى كتابة الاسم / Name is required')
      return
    }

    if (!formPrice || isNaN(Number(formPrice)) || Number(formPrice) <= 0) {
      setErrorMsg('سعر غير صالح / Invalid price')
      return
    }

    if (!formImage) {
      setErrorMsg('يرجى رفع صورة للمنتج / Image is required')
      return
    }

    // Generate product handle from title
    const handle = formTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const productPayload = {
      title: formTitle,
      handle,
      price: Number(formPrice),
      rating: 4.8,
      reviews: editingId ? products.find(p => p.id === editingId)?.reviews || 12 : 8,
      description: formDescription,
      image: formImage,
      images: formImages.length > 0 ? formImages : [formImage],
      sizes: formSizes,
      colors: formColors,
      inStock: formInStock,
      seoDescription: formSeoDescription,
      seoKeywords: formSeoKeywords,
      collection_id: formCollectionId || null,
      specs: {
        material: specMaterial,
        weight: specWeight,
        care: specCare,
        fit: specFit,
      },
    }

    try {
      if (editingId) {
        await updateProduct(editingId, productPayload)
      } else {
        await addProduct(productPayload)
      }
      setIsModalOpen(false)
      loadProducts()
    } catch (err) {
      console.error(err)
      setErrorMsg('خطأ أثناء الحفظ / Error saving product')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟ / Are you sure you want to delete this product?')) {
      const success = await deleteProduct(id)
      if (success) {
        loadProducts()
      } else {
        alert('فشل الحذف / Delete failed')
      }
    }
  }

  // ── Collection handlers ──────────────────────────────────────────────────

  const handleOpenAddCollection = () => {
    setEditingCollectionId(null)
    setColName('')
    setColDescription('')
    setColErrorMsg('')
    setIsCollectionModalOpen(true)
  }

  const handleOpenEditCollection = (col: MockCollection) => {
    setEditingCollectionId(col.id)
    setColName(col.name)
    setColDescription(col.description)
    setColErrorMsg('')
    setIsCollectionModalOpen(true)
  }

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setColErrorMsg('')
    if (!colName.trim()) {
      setColErrorMsg('اسم المجموعة مطلوب / Collection name is required')
      return
    }
    try {
      if (editingCollectionId) {
        await updateCollection(editingCollectionId, { name: colName, description: colDescription })
      } else {
        await addCollection({ name: colName, description: colDescription })
      }
      setIsCollectionModalOpen(false)
      loadCollections()
    } catch (err) {
      console.error(err)
      setColErrorMsg('خطأ أثناء الحفظ / Error saving collection')
    }
  }

  const handleDeleteCollection = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المجموعة؟ / Are you sure you want to delete this collection?')) {
      const success = await deleteCollection(id)
      if (success) {
        loadCollections()
      } else {
        alert('فشل الحذف / Delete failed')
      }
    }
  }

  // ── Order handlers ───────────────────────────────────────────────────────

  const STATUS_OPTIONS: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  const STATUS_STYLES: Record<Order['status'], string> = {
    pending:    'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
    processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    shipped:    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    delivered:  'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20',
    cancelled:  'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
  }

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    await updateOrderStatus(id, status)
    loadOrders()
  }

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(id)
      loadOrders()
    }
  }

  // ── Settings handlers ────────────────────────────────────────────────────

  const handleSaveSettings = () => {
    const updated: StoreSettings = {
      taxRate,
      shippingFee,
      freeShippingThreshold,
      promoCodes,
      autoDiscounts,
    }
    saveSettings(updated).then(() => {
      setSettings(updated)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 2500)
    })
  }

  const handleAddPromoCode = () => {
    const code = newPromoCode.trim().toUpperCase()
    const disc = Number(newPromoDiscount)
    if (!code || isNaN(disc) || disc <= 0 || disc > 100) return
    if (promoCodes.find(p => p.code === code)) return
    setPromoCodes(prev => [...prev, { code, discount: disc }])
    setNewPromoCode('')
    setNewPromoDiscount('')
  }

  const handleRemovePromoCode = (code: string) => {
    setPromoCodes(prev => prev.filter(p => p.code !== code))
  }

  const handleAddAutoDiscount = () => {
    const name = newAutoName.trim()
    const minItems = Number(newAutoMinItems)
    const discountValue = Number(newAutoValue)
    if (!name || isNaN(minItems) || minItems <= 0 || isNaN(discountValue) || discountValue <= 0) return
    setAutoDiscounts(prev => [...prev, { name, minItems, discountValue, type: newAutoType }])
    setNewAutoName('')
    setNewAutoMinItems('')
    setNewAutoValue('')
  }

  const handleRemoveAutoDiscount = (name: string) => {
    setAutoDiscounts(prev => prev.filter(p => p.name !== name))
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background text-foreground font-sans pb-12 transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Navbar Dashboard */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 hover:opacity-80">
              <ArrowLeft size={18} />
              <span>NEXSTIV Admin</span>
            </Link>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              isSupabaseConfigured
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              {isSupabaseConfigured ? 'مستودع Supabase متصل / Supabase Connected' : 'وضعية التجربة المحلية / Local Mode'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>خروج / Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-muted p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'products' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            المنتجات / Products
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'collections' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderOpen size={15} />
            المجموعات / Collections
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'orders' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            الطلبات / Orders
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="bg-yellow-500 text-neutral-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ⚙ الإعدادات / Settings
          </button>
        </div>

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">إدارة المنتجات / Products Management</h1>
                <p className="text-muted-foreground text-sm mt-1">تعديل، إضافة أو حذف المنتجات من واجهة متجرك</p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors font-semibold rounded-xl shadow cursor-pointer text-sm"
              >
                <Plus size={18} />
                <span>إضافة منتج جديد / Add Product</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card border border-border h-64 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-card/30 border border-border rounded-2xl">
                <p className="text-muted-foreground mb-4">لا توجد منتجات حالياً / No products found</p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors cursor-pointer text-sm"
                >
                  أضف أول منتج الآن / Add your first product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                      key={product.id}
                      className="bg-card/40 border border-border rounded-2xl overflow-hidden shadow-lg hover:border-border/80 transition-colors flex flex-col justify-between"
                  >
                    <div className="relative h-48 bg-background overflow-hidden group">
                      <Image src={product.image} alt={product.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Link
                          href={`/product/${product.handle}`}
                          target="_blank"
                          className="p-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                          title="معاينة المنتج / Preview"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">{product.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">{product.description}</p>
                        <div className="flex justify-between items-center text-sm font-semibold mb-2">
                          <span className="text-muted-foreground/80">السعر / Price:</span>
                          <span className="text-foreground text-lg font-bold">{product.price.toFixed(2)} MAD</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-border hover:bg-muted text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 size={15} />
                          <span>تعديل / Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                          <span>حذف / Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── COLLECTIONS TAB ── */}
        {activeTab === 'collections' && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">إدارة المجموعات / Collections</h1>
                <p className="text-muted-foreground text-sm mt-1">صنف منتجاتك في مجموعات لتسهيل التصفح</p>
              </div>
              <button
                onClick={handleOpenAddCollection}
                className="flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors font-semibold rounded-xl shadow cursor-pointer text-sm"
              >
                <Plus size={18} />
                <span>إضافة مجموعة / Add Collection</span>
              </button>
            </div>

            {collectionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card border border-border h-40 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-20 bg-card/30 border border-border rounded-2xl">
                <FolderOpen size={40} className="text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">لا توجد مجموعات حالياً / No collections yet</p>
                <button
                  onClick={handleOpenAddCollection}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors cursor-pointer text-sm"
                >
                  أضف أول مجموعة / Add your first collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((col) => {
                  const count = products.filter((p) => p.collection_id === col.id).length
                  return (
                    <div
                      key={col.id}
                      className="bg-card/40 border border-border rounded-2xl p-6 hover:border-border/80 transition-colors flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            <FolderOpen size={18} className="text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">{col.name}</h3>
                            <span className="text-xs text-muted-foreground/80">{count} product{count !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{col.description || 'No description'}</p>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <button
                          onClick={() => handleOpenEditCollection(col)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-border hover:bg-muted text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 size={15} />
                          <span>تعديل / Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCollection(col.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                          <span>حذف / Delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">إعدادات المتجر / Store Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">ضبط الضرائب والشحن وأكواد الخصم</p>
              </div>
              <button
                onClick={handleSaveSettings}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl cursor-pointer text-sm transition-all ${
                  settingsSaved
                    ? 'bg-green-500 text-white'
                    : 'bg-foreground text-background hover:bg-foreground/90'
                }`}
              >
                {settingsSaved ? '✓ Saved!' : 'حفظ الإعدادات / Save Settings'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Tax & Shipping */}
              <div className="bg-card/40 border border-border rounded-2xl p-6 space-y-6">
                <h2 className="text-base font-bold text-foreground">الضريبة والشحن / Tax & Shipping</h2>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                    نسبة الضريبة / Tax Rate (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number" min={0} max={100} step={0.1}
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-32 px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                    />
                    <span className="text-muted-foreground/80 text-xs">% of subtotal</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                    رسوم الشحن / Flat Shipping Fee (MAD)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number" min={0} step={0.01}
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      className="w-32 px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                    />
                    <span className="text-muted-foreground/80 text-xs">charged when below threshold</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                    حد الشحن المجاني / Free Shipping Threshold (MAD)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number" min={0} step={1}
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                      className="w-32 px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                    />
                    <span className="text-muted-foreground/80 text-xs">free shipping above this</span>
                  </div>
                </div>

                {/* Live preview */}
                <div className="bg-background/60 rounded-xl p-4 border border-border space-y-2">
                  <p className="text-muted-foreground/80 text-xs uppercase tracking-wider font-bold mb-3">Live Preview — 800 MAD order</p>
                  {[
                    { label: 'Subtotal', value: '800.00 MAD' },
                    { label: `Tax (${taxRate}%)`, value: `${(80 * taxRate / 100).toFixed(2)} MAD` },
                    { label: 'Shipping', value: 80 >= freeShippingThreshold ? 'FREE' : `${shippingFee.toFixed(2)} MAD` },
                    { label: 'Total', value: `${(80 + (80 * taxRate / 100) + (80 >= freeShippingThreshold ? 0 : shippingFee)).toFixed(2)} MAD` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Codes */}
              <div className="bg-card/40 border border-border rounded-2xl p-6 space-y-5">
                <h2 className="text-base font-bold text-foreground">أكواد الخصم / Promo Codes</h2>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                      placeholder="CODE (e.g. SUMMER20)"
                      className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm uppercase"
                    />
                    <input
                      type="number" min={1} max={100}
                      value={newPromoDiscount}
                      onChange={(e) => setNewPromoDiscount(e.target.value)}
                      placeholder="%"
                      className="w-20 px-3 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm text-center"
                    />
                    <button
                      type="button"
                      onClick={handleAddPromoCode}
                      className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-sm font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <p className="text-muted-foreground/60 text-xs">Code name + discount % (e.g. 10 = 10% off)</p>
                </div>

                {promoCodes.length === 0 ? (
                  <p className="text-muted-foreground/60 text-sm text-center py-6">No promo codes yet</p>
                ) : (
                  <div className="space-y-2">
                    {promoCodes.map(({ code, discount }) => (
                      <div key={code} className="flex items-center justify-between bg-background/60 border border-border rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-foreground tracking-widest text-sm">{code}</span>
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                            -{discount}%
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePromoCode(code)}
                          className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Automatic Discounts */}
              <div className="bg-card/40 border border-border rounded-2xl p-6 space-y-5">
                <h2 className="text-base font-bold text-foreground">الخصومات التلقائية / Auto Discounts</h2>
                <p className="text-muted-foreground/80 text-xs">يطبق الخصم تلقائيا في السلة عند تجاوز عدد القطع المطلوب.</p>

                <div className="space-y-3 border border-border rounded-xl p-4 bg-background/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Name (e.g. Buy 2 Get 50 MAD off)</label>
                      <input
                        type="text"
                        value={newAutoName}
                        onChange={(e) => setNewAutoName(e.target.value)}
                        placeholder="Discount Name"
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Minimum Items</label>
                      <input
                        type="number" min={1}
                        value={newAutoMinItems}
                        onChange={(e) => setNewAutoMinItems(e.target.value)}
                        placeholder="2"
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Discount Value</label>
                      <div className="flex gap-2">
                        <input
                          type="number" min={1}
                          value={newAutoValue}
                          onChange={(e) => setNewAutoValue(e.target.value)}
                          placeholder="50"
                          className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                        />
                        <select 
                          value={newAutoType}
                          onChange={(e) => setNewAutoType(e.target.value as 'fixed' | 'percentage')}
                          className="px-3 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                        >
                          <option value="fixed">MAD</option>
                          <option value="percentage">%</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAutoDiscount}
                      className="px-4 py-2.5 h-[42px] bg-muted hover:bg-muted/80 text-foreground text-sm font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      + Add Rule
                    </button>
                  </div>
                </div>

                {autoDiscounts.length === 0 ? (
                  <p className="text-muted-foreground/60 text-sm text-center py-6">No auto discounts yet</p>
                ) : (
                  <div className="space-y-2">
                    {autoDiscounts.map(({ name, minItems, discountValue, type }) => (
                      <div key={name} className="flex items-center justify-between bg-background/60 border border-border rounded-xl px-4 py-3">
                        <div>
                          <p className="font-bold text-foreground text-sm">{name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Buy ≥ {minItems} items : Get {discountValue}{type === 'percentage' ? '%' : ' MAD'} off
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAutoDiscount(name)}
                          className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? 'تعديل المنتج / Edit Product' : 'إضافة منتج جديد / Add Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-sm text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Title & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                    اسم المنتج / Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Classic Vintage Tee"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                    السعر / Price (MAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="49.99"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                  />
                </div>
              </div>

              {/* Stock Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-foreground">حالة المخزون / Stock Status</h4>
                  <p className="text-xs text-muted-foreground">هل هذا المنتج متوفر للطلب؟ / Is this product available for order?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormInStock(!formInStock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                    formInStock ? 'bg-green-500' : 'bg-muted border border-border'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formInStock ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                  الوصف / Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Tell customers about the materials, fit, design, and feel..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm resize-none"
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                  صور المنتج / Product Images
                  <span className="ml-2 normal-case text-muted-foreground/80 font-normal">(يمكنك إضافة أكثر من صورة / Multiple images supported)</span>
                </label>

                {/* Image Gallery Grid */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={img}
                          alt={`Image ${idx + 1}`}
                          className={`w-full h-full object-cover rounded-xl border-2 transition-all ${
                            formImage === img
                              ? 'border-white'
                              : 'border-border opacity-70 hover:opacity-100'
                          }`}
                        />
                        {/* Main badge */}
                        {formImage === img && (
                          <span className="absolute top-1 left-1 bg-white text-neutral-950 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            MAIN
                          </span>
                        )}
                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1.5">
                          {formImage !== img && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(img)}
                              className="text-[10px] bg-white text-neutral-950 font-bold px-2 py-1 rounded-lg hover:bg-neutral-200 cursor-pointer"
                            >
                              Set Main
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-[10px] bg-red-600 text-white font-bold px-2 py-1 rounded-lg hover:bg-red-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add more slot */}
                    <label className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-border/80 transition-colors">
                      <UploadCloud size={20} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Add More</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Empty state upload button */}
                {formImages.length === 0 && (
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-28 h-28 bg-background border border-border rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                      <UploadCloud size={24} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="flex items-center justify-center gap-2 w-full py-3 bg-background hover:bg-background/70 border border-border rounded-xl cursor-pointer text-sm font-semibold transition-colors">
                        <UploadCloud size={16} />
                        <span>{imageUploading ? 'جاري الرفع / Uploading...' : 'رفع صورة أو أكثر / Upload Images'}</span>
                        <input
                          type="file"
                           accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-muted-foreground text-[11px] text-center sm:text-left">
                        أو يمكنك وضع رابط صورة مباشر أدناه / Or enter direct URL below:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="url-input"
                          placeholder="https://images.unsplash.com/photo-..."
                          className="flex-1 px-4 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('url-input') as HTMLInputElement
                            const url = input?.value.trim()
                            if (url) {
                              if (!formImage) setFormImage(url)
                              setFormImages((prev) => [...prev, url])
                              input.value = ''
                            }
                          }}
                          className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-xl font-semibold cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* URL add row when images already exist */}
                {formImages.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      id="url-input-extra"
                      placeholder="أو أضف رابط صورة مباشر / Or add image URL"
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('url-input-extra') as HTMLInputElement
                        const url = input?.value.trim()
                        if (url) {
                          if (!formImage) setFormImage(url)
                          setFormImages((prev) => [...prev, url])
                          input.value = ''
                        }
                      }}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-xl font-semibold cursor-pointer whitespace-nowrap"
                    >
                      + Add URL
                    </button>
                  </div>
                )}

                {imageUploading && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin inline-block" />
                    جاري رفع الصور / Uploading...
                  </p>
                )}
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                  القياسات المتوفرة / Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZES.map((size) => {
                    const isSelected = formSizes.includes(size)
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-4 py-2 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Colors Selection */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                  الألوان المتوفرة / Available Colors
                </label>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_COLORS.map((color) => {
                    const isSelected = formColors.includes(color)
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorToggle(color)}
                        className={`px-3 py-2 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Specifications Accordion/Inputs */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-bold text-foreground mb-4">المواصفات والتفاصيل / Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">نوع القماش / Material</label>
                    <input
                      type="text"
                      value={specMaterial}
                      onChange={(e) => setSpecMaterial(e.target.value)}
                      placeholder="100% Premium Cotton"
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">الوزن والسمك / Fabric Weight</label>
                    <input
                      type="text"
                      value={specWeight}
                      onChange={(e) => setSpecWeight(e.target.value)}
                      placeholder="180 GSM"
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">طريقة الغسيل / Care Instructions</label>
                    <input
                      type="text"
                      value={specCare}
                      onChange={(e) => setSpecCare(e.target.value)}
                      placeholder="Machine wash cold, air dry"
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">شكل القصة / Fit Type</label>
                    <input
                      type="text"
                      value={specFit}
                      onChange={(e) => setSpecFit(e.target.value)}
                      placeholder="Regular comfortable fit"
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Collection Assignment */}
              <div className="border-t border-border pt-6">
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                  المجموعة / Collection
                </label>
                <select
                  value={formCollectionId}
                  onChange={(e) => setFormCollectionId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                >
                  <option value="">— بدون مجموعة / No collection —</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
                {collections.length === 0 && (
                  <p className="text-muted-foreground/60 text-xs mt-1">
                    أضف مجموعات أولاً من تبويب &quot;المجموعات&quot; / Add collections first from the Collections tab
                  </p>
                )}
              </div>

              {/* SEO Settings */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-bold text-foreground mb-4">إعدادات الـ SEO (محركات البحث) / Search Engine Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">
                      وصف الـ SEO المخصص / Custom SEO Meta Description
                    </label>
                    <textarea
                      value={formSeoDescription}
                      onChange={(e) => setFormSeoDescription(e.target.value)}
                      placeholder="صف هذا المنتج لجوجل بكلمات ممتازة (مثال: تيشرت قطني عالي الجودة للرجال، مريح وعملي...)"
                      rows={2}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-xs resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">
                      الكلمات المفتاحية / SEO Keywords (مفصولة بفاصلة)
                    </label>
                    <input
                      type="text"
                      value={formSeoKeywords}
                      onChange={(e) => setFormSeoKeywords(e.target.value)}
                      placeholder="تيشرت قطن, ملابس صيفية, تيشرت أسود, nexstiv tee"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-border pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-border hover:bg-muted text-sm font-semibold rounded-xl cursor-pointer animate-all"
                >
                  إلغاء / Cancel
                </button>
                <button
                  type="submit"
                  disabled={imageUploading}
                  className="px-5 py-2.5 bg-foreground hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground text-background font-semibold rounded-xl cursor-pointer text-sm transition-all"
                >
                  {editingId ? 'حفظ التعديلات / Save Changes' : 'إضافة المنتج / Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">الطلبات / Orders</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {orders.length} total · {orders.filter(o => o.status === 'pending').length} pending
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="flex items-center gap-2 px-4 py-2.5 border border-border hover:bg-muted text-sm font-semibold rounded-xl cursor-pointer transition-colors"
            >
              ↻ Refresh
            </button>
          </div>

          {ordersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border h-24 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-card/30 border border-border rounded-2xl">
              <p className="text-muted-foreground">No orders yet. Orders will appear here when customers checkout.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card/40 border border-border rounded-2xl overflow-hidden">
                  {/* Order header row */}
                  <div
                    className="flex flex-wrap items-center gap-3 p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{order.customer_name}</span>
                        <span className="text-muted-foreground/60 text-xs font-mono truncate">{order.id}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">{order.customer_email}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-foreground font-black text-lg">{order.total.toFixed(2)} MAD</span>

                      {/* Status dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleUpdateOrderStatus(order.id, e.target.value as Order['status'])
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border bg-transparent cursor-pointer ${STATUS_STYLES[order.status]}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s} className="bg-background text-foreground">
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id) }}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>

                      <span className="text-muted-foreground/80 text-sm">{expandedOrder === order.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-border p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground/80 text-xs uppercase tracking-wider mb-1">Shipping Address</p>
                          <p className="text-foreground whitespace-pre-line">{order.customer_address}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground/80 text-xs uppercase tracking-wider mb-1">City</p>
                          <p className="text-foreground">{order.customer_city}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground/80 text-xs uppercase tracking-wider mb-1">Phone</p>
                          <p className="text-foreground">{order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground/80 text-xs uppercase tracking-wider mb-1">Order Date</p>
                          <p className="text-foreground">
                            {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Items list */}
                      <div>
                        <p className="text-muted-foreground/80 text-xs uppercase tracking-wider mb-3">Items ({order.items.length})</p>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-background/50 rounded-xl p-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {item.image && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.size} · {item.color} · ×{item.quantity}</p>
                              </div>
                              <p className="text-sm font-bold text-foreground">{(item.price * item.quantity).toFixed(2)} MAD</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm pt-2 border-t border-border">
                        {[
                          { label: 'Subtotal', value: `${order.subtotal.toFixed(2)} MAD` },
                          { label: 'Discount', value: order.discount > 0 ? `-${order.discount.toFixed(2)} MAD` : '—' },
                          { label: 'Shipping', value: order.shipping === 0 ? 'Free' : `${order.shipping.toFixed(2)} MAD` },
                          { label: 'Total', value: `${order.total.toFixed(2)} MAD` },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-background/50 rounded-xl p-3">
                            <p className="text-muted-foreground/80 text-xs mb-1">{label}</p>
                            <p className="text-foreground font-bold">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Collection Add/Edit Modal */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                {editingCollectionId ? 'تعديل المجموعة / Edit Collection' : 'إضافة مجموعة / Add Collection'}
              </h2>
              <button onClick={() => setIsCollectionModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCollectionSubmit} className="p-6 space-y-4">
              {colErrorMsg && (
                <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-sm text-center">
                  {colErrorMsg}
                </div>
              )}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                  اسم المجموعة / Collection Name
                </label>
                <input
                  type="text"
                  required
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  placeholder="e.g. Essentials, Limited Drops..."
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                  الوصف / Description
                </label>
                <textarea
                  value={colDescription}
                  onChange={(e) => setColDescription(e.target.value)}
                  placeholder="Short description of this collection..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-neutral-500 focus:outline-none text-foreground text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="px-5 py-2.5 border border-border hover:bg-muted text-sm font-semibold rounded-xl cursor-pointer"
                >
                  إلغاء / Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-xl cursor-pointer text-sm"
                >
                  {editingCollectionId ? 'حفظ / Save' : 'إضافة / Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
