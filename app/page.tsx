'use client'

import { useEffect, useState, useRef } from 'react'
import { Star, ArrowRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/lib/cart-context'
import { fetchAllProducts, fetchAllCollections, loadSettings, DEFAULT_SETTINGS, supabase, isSupabaseConfigured, submitNewsletter } from '@/lib/db'

interface Product {
  id: string
  title: string
  handle: string
  collection_id: string | null
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  featuredImage: {
    url: string
    alt: string
  }
}

function Marquee({ text }: { text: string }) {
  const TICKER_ITEMS = text.split(',').map(s => s.trim()).filter(Boolean)
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="overflow-hidden bg-neutral-950 text-white py-3 border-y border-neutral-800">
      <div className="flex animate-marquee whitespace-nowrap gap-0">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 px-8 text-xs font-bold tracking-[0.2em] uppercase">
            <span className="text-neutral-500">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── 3D Tilt card ── */
function ProductCard({ product, onAddToCart }: {
  product: Product
  onAddToCart: (product: Product) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.15s ease-out', willChange: 'transform' }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-100"
    >
      <Link href={`/product/${product.handle}`}>
        {/* Image */}
        <div className="relative h-72 bg-neutral-50 overflow-hidden">
          {product.featuredImage && (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.alt || product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {/* Overlay badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-neutral-950 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase">
              New
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-neutral-500 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-bold tracking-tight">
              {product.priceRange.minVariantPrice.amount} MAD
            </span>
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="text-xs text-neutral-400 font-medium">4.8</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to cart — slides up on hover */}
      <div className="px-4 pb-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onAddToCart(product)
          }}
          className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <ShoppingBag size={15} />
          Quick Add
        </button>
      </div>
    </div>
  )
}

/* ── Page ── */
export default function Page() {
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<{ id: string; name: string; description: string }[]>([])
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uiContent, setUiContent] = useState(DEFAULT_SETTINGS.uiContent)
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProducts()
    fetchCollections()
    loadSettings().then(s => setUiContent(s.uiContent))
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await fetchAllProducts()
      setProducts(data.map((p) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        collection_id: p.collection_id ?? null,
        priceRange: { minVariantPrice: { amount: p.price.toFixed(2), currencyCode: 'MAD' } },
        featuredImage: { url: p.image, alt: p.title },
      })))
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCollections = async () => {
    try {
      const data = await fetchAllCollections()
      setCollections(data)
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      productHandle: product.handle,
      title: product.title,
      price: Number(product.priceRange.minVariantPrice.amount),
      quantity: 1,
      size: 'M',
      color: 'Default',
      image: product.featuredImage.url,
    })
  }

  // Filter products: null = show all, string = show matching collection
  const visibleProducts = activeCollection
    ? products.filter((p) => p.collection_id === activeCollection)
    : products

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative bg-neutral-950 text-white overflow-hidden min-h-[88vh] flex flex-col justify-end">
        {/* Big background text */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          <span
            className="text-[22vw] font-black tracking-tighter leading-none text-white/[0.04] whitespace-nowrap"
          >
            NEXSTIV
          </span>
        </div>

        {/* Subtle grain overlay */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20 pt-32">
          <p className="text-neutral-500 text-xs font-bold tracking-[0.3em] uppercase mb-6">
            {uiContent.heroBadge}
          </p>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 max-w-3xl whitespace-pre-line">
            {uiContent.heroTitle}
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg max-w-md leading-relaxed mb-10 whitespace-pre-line">
            {uiContent.heroDescription}
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="#collection"
              className="inline-flex items-center gap-3 bg-white text-neutral-950 px-7 py-3.5 rounded-full font-bold text-sm hover:bg-neutral-200 transition-colors"
            >
              {uiContent.heroButtonText}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/cart"
              className="text-neutral-400 hover:text-white text-sm font-medium transition-colors"
            >
              View Cart →
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ── MARQUEE ── */}
      <Marquee text={uiContent.marqueeText} />

      {/* ── COLLECTION ── */}
      <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-neutral-400 text-xs font-bold tracking-[0.25em] uppercase mb-2">{uiContent.collectionsSubtitle}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              {activeCollection
                ? (collections.find(c => c.id === activeCollection)?.name ?? uiContent.collectionsTitle)
                : uiContent.collectionsTitle}
            </h2>
          </div>
        </div>

        {/* Filter tabs */}
        {collections.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCollection(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeCollection === null
                  ? 'bg-neutral-950 text-white'
                  : 'border border-neutral-200 text-neutral-500 hover:border-neutral-950 hover:text-neutral-950'
              }`}
            >
              All
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeCollection === col.id
                    ? 'bg-neutral-950 text-white'
                    : 'border border-neutral-200 text-neutral-500 hover:border-neutral-950 hover:text-neutral-950'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-neutral-100 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-neutral-200 rounded-2xl">
            <p className="text-neutral-400 text-sm">
              {activeCollection
                ? 'No products in this collection yet. Assign products from the admin dashboard.'
                : 'No products yet. Add some from the admin dashboard.'}
            </p>
            {activeCollection && (
              <button
                onClick={() => setActiveCollection(null)}
                className="mt-4 text-xs font-bold underline text-neutral-500 hover:text-neutral-950 cursor-pointer"
              >
                View all products
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* ── BRAND STRIP ── */}
      <section className="bg-neutral-950 text-white py-20 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[18vw] font-black tracking-tighter text-white/[0.03] pointer-events-none select-none"
        >
          {uiContent.featuresBgText}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {uiContent.features.map(({ stat, label, sub }, i) => (
            <div key={i} className="space-y-2">
              <div className="text-5xl font-black tracking-tight">{stat}</div>
              <div className="text-lg font-bold">{label}</div>
              <div className="text-neutral-500 text-sm">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COLLECTIONS ── */}
      <section id="collections" className="py-20 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-neutral-400 text-xs font-bold tracking-[0.25em] uppercase mb-2">{uiContent.categoriesSubtitle}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">{uiContent.categoriesTitle}</h2>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl">
              <p className="text-neutral-400 text-sm">No collections yet. Add some from the admin dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    setActiveCollection(col.id)
                    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="group relative bg-neutral-950 text-white rounded-2xl p-8 overflow-hidden hover:bg-neutral-800 transition-colors text-left cursor-pointer"
                >
                  <div className="mt-2">
                    <h3 className="text-2xl font-black tracking-tight mb-2">{col.name}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                      {col.description || 'Explore this collection'}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase group-hover:gap-3 transition-all">
                      Shop Now <ArrowRight size={12} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="bg-neutral-950 text-white py-24 overflow-hidden relative">
        <div
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 text-[20vw] font-black tracking-tighter text-white/[0.03] pointer-events-none select-none leading-none"
        >
          NEXSTIV
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-neutral-500 text-xs font-bold tracking-[0.25em] uppercase mb-4">{uiContent.storySubtitle}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6 whitespace-pre-line">
              {uiContent.storyTitle}
            </h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              {uiContent.storyParagraph1}
            </p>
            <p className="text-neutral-400 leading-relaxed mb-8">
              {uiContent.storyParagraph2}
            </p>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-800">
              {uiContent.storyStats?.map(({ n, l }, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-black tracking-tight">{n}</div>
                  <div className="text-neutral-500 text-sm mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {uiContent.storyFeatures?.map(({ title, body }, idx) => (
              <div key={idx} className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
                <div className="w-8 h-8 bg-white/10 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-white text-xs font-black">✦</span>
                </div>
                <h4 className="font-bold text-sm mb-1">{title}</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left */}
          <div>
            <p className="text-neutral-400 text-xs font-bold tracking-[0.25em] uppercase mb-4">{uiContent.contactSubtitle}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 whitespace-pre-line">{uiContent.contactTitle}</h2>
            <p className="text-neutral-500 leading-relaxed mb-10">
              {uiContent.contactDescription}
            </p>
            <div className="space-y-5">
              {uiContent.contactDetails?.map(({ label, value }, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-xs font-bold tracking-widest uppercase text-neutral-400 w-28">{label}</span>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget
                const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement
                const formData = new FormData(form)
                const name = formData.get('name') as string
                const email = formData.get('email') as string
                const message = formData.get('message') as string

                if (btn) { btn.textContent = 'Sending...'; btn.disabled = true }

                if (isSupabaseConfigured && supabase) {
                  const { error } = await supabase.from('contact_messages').insert([{ name, email, message }])
                  if (error) {
                    alert('Error sending message. Please try again later.')
                    if (btn) { btn.textContent = 'Send Message'; btn.disabled = false }
                    return
                  }
                }

                if (btn) { btn.textContent = '✓ Message sent!'; }
                form.reset()
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-neutral-950 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-neutral-950 text-sm transition-colors"
                  />
                </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Tell us how we can help..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-neutral-950 text-sm transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-neutral-950 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-neutral-900 transition-colors disabled:opacity-50"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-20 border-t border-neutral-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <p className="text-neutral-400 text-xs font-bold tracking-[0.25em] uppercase mb-3">{uiContent.newsletterSubtitle}</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{uiContent.newsletterTitle}</h2>
          <p className="text-neutral-500 mb-8 text-sm leading-relaxed">
            {uiContent.newsletterDescription}
          </p>
          {newsletterStatus === 'success' ? (
            <div className="bg-green-500/10 text-green-600 p-4 rounded-xl text-sm font-medium border border-green-500/20 inline-block px-8">
              Thank you for subscribing to our newsletter!
            </div>
          ) : (
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                if (!newsletterEmail) return
                setNewsletterStatus('submitting')
                const success = await submitNewsletter(newsletterEmail)
                if (success) {
                  setNewsletterStatus('success')
                  setNewsletterEmail('')
                } else {
                  alert('Something went wrong. Please try again.')
                  setNewsletterStatus('idle')
                }
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-5 py-3 rounded-full border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-neutral-950 text-sm transition-colors"
              />
              <button 
                type="submit"
                disabled={newsletterStatus === 'submitting'}
                className="bg-neutral-950 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {newsletterStatus === 'submitting' ? 'Subscribing...' : uiContent.newsletterButtonText}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
