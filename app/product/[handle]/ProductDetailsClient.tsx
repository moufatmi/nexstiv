'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Share2, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/lib/cart-context'
import { MockProduct } from '@/lib/products-mock'

interface ProductDetailsClientProps {
  product: MockProduct
}

const getColorHex = (colorName: string) => {
  switch (colorName.toLowerCase()) {
    case 'black':
      return '#1a1a1a'
    case 'white':
    case 'pure white':
      return '#ffffff'
    case 'navy':
      return '#1e293b'
    case 'gray':
      return '#64748b'
    case 'vintage grey':
      return '#4b5563'
    case 'acid black':
      return '#2d3748'
    case 'sage':
      return '#8fbc8f'
    case 'sand':
      return '#dec496'
    case 'desert sand':
      return '#edc9af'
    case 'clay':
      return '#cd7f32'
    case 'charcoal':
      return '#36454f'
    case 'olive':
      return '#556b2f'
    case 'royal blue':
      return '#4169e1'
    case 'slate':
      return '#708090'
    case 'neon green':
      return '#39ff14'
    case 'oatmeal':
      return '#eae0c8'
    case 'espresso':
      return '#3b2f2f'
    case 'forest green':
      return '#228b22'
    default:
      return '#cccccc'
  }
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const { addToCart } = useCart()

  useEffect(() => {
    setActiveImageIndex(0)
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0])
    }
  }, [product])

  const mainImage = product.images[activeImageIndex] || product.image

  const handleAddToCart = () => {
    addToCart({
      productHandle: product.handle,
      title: product.title,
      price: product.price,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.image,
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <Navbar />

      {/* Sub Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Store</span>
          </Link>
        </div>
      </div>

      {/* Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden">
              <Image
                src={mainImage}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                    activeImageIndex === idx ? 'border-primary' : 'border-transparent hover:opacity-80'
                  }`}
                >
                  <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex text-accent text-lg">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">{product.price.toFixed(2)} MAD</p>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold">Size</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 border-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold">Color: {selectedColor}</label>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: getColorHex(color) }}
                    className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'border-primary scale-110 shadow-md ring-2 ring-primary/20'
                        : 'border-border hover:scale-105'
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-muted-foreground hover:bg-secondary cursor-pointer"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-muted-foreground hover:bg-secondary cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                  isLiked
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-secondary transition-colors cursor-pointer">
                <Share2 size={20} />
              </button>
            </div>

            {/* Stock Status */}
            <div className="p-4 bg-secondary rounded-lg">
              <p className="font-semibold text-sm">
                {product.inStock ? (
                  <span className="text-green-600">✓ In Stock - Ships within 2-3 business days</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </p>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 p-4 bg-secondary rounded-lg text-sm">
              <div className="flex gap-3">
                <span className="font-semibold">Free Shipping</span>
                <span className="text-muted-foreground">On orders over 500 MAD</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold">30-Day Returns</span>
                <span className="text-muted-foreground">If you&apos;re not satisfied</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="pb-4 border-b border-border">
                  <p className="text-sm font-semibold text-muted-foreground capitalize">{key}</p>
                  <p className="text-lg font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Why Choose NEXSTIV?</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-accent font-bold">✓</span>
                <span>Premium quality cotton sourced from trusted suppliers</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">✓</span>
                <span>Ethically manufactured with attention to detail</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">✓</span>
                <span>Comfortable fit designed for all-day wear</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">✓</span>
                <span>Sustainable packaging and eco-friendly practices</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
