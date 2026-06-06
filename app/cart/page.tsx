'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ArrowLeft, Lock, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/lib/cart-context'
import { createOrder, loadSettings, DEFAULT_SETTINGS, StoreSettings } from '@/lib/db'

type Step = 'cart' | 'checkout' | 'success'

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [promoPercentage, setPromoPercentage] = useState(0)
  const [step, setStep] = useState<Step>('cart')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    loadSettings().then(setStoreSettings)
  }, [])

  // Checkout form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Calculate best auto discount
  let autoDiscountValue = 0
  let autoDiscountName = ''
  if (storeSettings.autoDiscounts) {
    for (const ad of storeSettings.autoDiscounts) {
      if (totalItems >= ad.minItems) {
        const value = ad.type === 'percentage' ? subtotal * (ad.discountValue / 100) : ad.discountValue
        if (value > autoDiscountValue) {
          autoDiscountValue = value
          autoDiscountName = ad.name
        }
      }
    }
  }

  const autoDiscountAmount = Math.min(autoDiscountValue, subtotal)
  const promoDiscountAmount = (subtotal - autoDiscountAmount) * (promoPercentage / 100)
  const totalDiscount = autoDiscountAmount + promoDiscountAmount

  const shipping = subtotal >= storeSettings.freeShippingThreshold || subtotal === 0 ? 0 : storeSettings.shippingFee
  const tax = (subtotal - totalDiscount) * (storeSettings.taxRate / 100)
  const total = subtotal - totalDiscount + tax + shipping

  const applyPromo = () => {
    const match = storeSettings.promoCodes.find(
      (p) => p.code === promoCode.toUpperCase().trim()
    )
    if (match) {
      setPromoPercentage(match.discount)
    } else {
      setPromoPercentage(0)
      alert('Invalid promo code')
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setPlacingOrder(true)
    try {
      const order = await createOrder({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_city: city,
        customer_address: address,
        items: cartItems,
        subtotal,
        discount: totalDiscount,
        shipping,
        tax,
        total,
        status: 'pending',
      })
      setOrderId(order.id)
      clearCart()
      setStep('success')
    } catch (err) {
      console.error('Order failed:', err)
      alert('Failed to place order. Please try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white text-neutral-950">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3">Order Placed!</h1>
          <p className="text-neutral-500 mb-2">Thank you, <strong>{name}</strong>.</p>
          <p className="text-neutral-400 text-sm mb-6">
            A confirmation will be sent to <strong>{email}</strong>. Your order ID is:
          </p>
          <div className="bg-neutral-100 rounded-xl px-6 py-3 font-mono text-sm font-bold mb-10 inline-block">
            {orderId}
          </div>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-neutral-950 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-neutral-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <Navbar />

      {/* Sub Header */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          {step === 'checkout' ? (
            <button
              onClick={() => setStep('cart')}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span className="font-medium text-sm">Back to Cart</span>
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-950 transition-colors">
              <ArrowLeft size={18} />
              <span className="font-medium text-sm">Continue Shopping</span>
            </Link>
          )}
          {/* Steps indicator */}
          <div className="ml-auto flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
            <span className={step === 'cart' ? 'text-neutral-950' : 'text-neutral-400'}>Cart</span>
            <span className="text-neutral-300">›</span>
            <span className={step === 'checkout' ? 'text-neutral-950' : 'text-neutral-400'}>Checkout</span>
            <span className="text-neutral-300">›</span>
            <span className="text-neutral-400">Confirmation</span>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black tracking-tight mb-12">
          {step === 'cart' ? 'Shopping Cart' : 'Checkout'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column ── */}
          <div className="lg:col-span-2">

            {/* CART STEP */}
            {step === 'cart' && (
              <div className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl">
                    <p className="text-xl text-neutral-400 mb-6">Your cart is empty</p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 bg-neutral-950 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-neutral-800 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="border border-neutral-100 rounded-2xl p-6 bg-white shadow-sm">
                      <div className="flex gap-5">
                        <Link href={`/product/${item.productHandle}`} className="relative w-28 h-28 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </Link>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <Link href={`/product/${item.productHandle}`} className="font-bold text-base hover:text-neutral-500 transition-colors block">
                                {item.title}
                              </Link>
                              <div className="flex gap-3 text-xs text-neutral-400 mt-1">
                                <span>Size: <strong className="text-neutral-700">{item.size}</strong></span>
                                <span>Color: <strong className="text-neutral-700">{item.color}</strong></span>
                              </div>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-neutral-300 hover:text-red-500 transition-colors cursor-pointer">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center border border-neutral-200 rounded-xl w-fit overflow-hidden">
                              <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-2 hover:bg-neutral-50 transition-colors cursor-pointer">
                                <Minus size={14} />
                              </button>
                              <span className="px-4 py-2 font-bold text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-2 hover:bg-neutral-50 transition-colors cursor-pointer">
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-neutral-400">{item.price.toFixed(2)} MAD each</p>
                              <p className="text-xl font-black">{(item.price * item.quantity).toFixed(2)} MAD</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CHECKOUT STEP */}
            {step === 'checkout' && (
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="border border-neutral-100 rounded-2xl p-6 space-y-4">
                  <h2 className="font-black text-lg">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-neutral-950 text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-neutral-950 text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Phone Number / رقم الهاتف</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="06 XX XX XX XX"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-neutral-950 text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">City / المدينة</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Casablanca"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-neutral-950 text-sm transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Shipping Address</label>
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address, city, postal code, country..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-neutral-950 text-sm transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Order items summary */}
                <div className="border border-neutral-100 rounded-2xl p-6">
                  <h2 className="font-black text-lg mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-50 flex-shrink-0">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.title}</p>
                          <p className="text-xs text-neutral-400">{item.size} · {item.color} · ×{item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold">{(item.price * item.quantity).toFixed(2)} MAD</p>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* ── Right column: Order summary ── */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="border border-neutral-100 rounded-2xl p-6 bg-neutral-50 sticky top-24 space-y-5">
                <h2 className="font-black text-lg">Price Details</h2>

                {/* Promo — only on cart step */}
                {step === 'cart' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Promo Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="SAVE10"
                        className="flex-1 px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-neutral-950 text-sm"
                      />
                      <button onClick={applyPromo} className="px-4 py-2.5 bg-neutral-950 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer">
                        Apply
                      </button>
                    </div>
                    {promoPercentage > 0 && <p className="text-xs text-green-600 font-semibold">✓ {promoPercentage}% discount applied</p>}
                  </div>
                )}

                {/* Breakdown */}
                <div className="space-y-2 text-sm border-t border-neutral-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-semibold">{subtotal.toFixed(2)} MAD</span>
                  </div>
                  {autoDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{autoDiscountName || 'Auto Discount'}</span>
                      <span>−{autoDiscountAmount.toFixed(2)} MAD</span>
                    </div>
                  )}
                  {promoDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount</span>
                      <span>−{promoDiscountAmount.toFixed(2)} MAD</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Shipping {shipping === 0 && <span className="text-green-600">(FREE)</span>}</span>
                    <span className="font-semibold">{shipping.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500"></span>
                    <span className="font-semibold">{tax.toFixed(2)} MAD</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-neutral-200 pt-4">
                  <span className="font-black text-lg">Total</span>
                  <span className="font-black text-2xl">{total.toFixed(2)} MAD</span>
                </div>

                {step === 'cart' ? (
                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full bg-neutral-950 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock size={16} />
                    Proceed to Checkout
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={placingOrder}
                    className="w-full bg-neutral-950 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-neutral-800 disabled:bg-neutral-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {placingOrder ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lock size={16} />
                    )}
                    {placingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>
                )}

                <div className="text-xs text-neutral-400 text-center space-y-1 border-t border-neutral-200 pt-4">
                  <p>✓ Secure Checkout</p>
                  <p>✓ 30-Day Money Back</p>
                  <p>✓ Free Returns</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
