export interface MockProduct {
  id: string
  title: string
  handle: string
  price: number
  rating: number
  reviews: number
  description: string
  image: string
  images: string[]
  sizes: string[]
  colors: string[]
  inStock: boolean
  collection_id?: string | null
  seoDescription?: string
  seoKeywords?: string
  specs: {
    material: string
    weight: string
    care: string
    fit: string
    [key: string]: string
  }
}

export interface MockCollection {
  id: string
  name: string
  description: string
  created_at?: string
}

export interface OrderItem {
  id: string
  productHandle: string
  title: string
  price: number
  quantity: number
  size: string
  color: string
  image: string
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_city: string
  customer_address: string
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at?: string
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod_1',
    title: 'Classic Premium T-Shirt',
    handle: 'classic-premium-tee',
    price: 49.99,
    rating: 4.8,
    reviews: 324,
    description:
      'Experience the perfect blend of comfort and style with our Classic Premium T-Shirt. Made from 100% premium long-staple cotton, this versatile tee is perfect for everyday wear. Features a tailored fit, premium fabric weight, and a double-stitched neckline for durability.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1512308928753-a2b06e46f8f0?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy', 'Gray', 'Forest Green'],
    inStock: true,
    specs: {
      material: '100% Premium Cotton',
      weight: '180 GSM',
      care: 'Machine wash cold, tumble dry low',
      fit: 'Regular fit, comfortable everyday wear',
    },
  },
  {
    id: 'prod_2',
    title: 'Retro Heavyweight Tee',
    handle: 'retro-heavyweight-tee',
    price: 55.00,
    rating: 4.9,
    reviews: 148,
    description:
      'Inspired by vintage styles of the 90s, our Retro Heavyweight Tee is built to last. Crafted from thick, structured cotton, it offers a boxier fit and a rugged look that gets softer with every wash.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Vintage Grey', 'Off-White', 'Acid Black'],
    inStock: true,
    specs: {
      material: '100% Ring-spun Cotton',
      weight: '240 GSM',
      care: 'Wash cold inside out, air dry recommended',
      fit: 'Relaxed boxy fit',
    },
  },
  {
    id: 'prod_3',
    title: 'Organic Minimalist Tee',
    handle: 'organic-minimalist-tee',
    price: 42.00,
    rating: 4.7,
    reviews: 92,
    description:
      'Eco-friendly meets ultra-soft comfort. The Organic Minimalist Tee is made with 100% certified organic cotton, dyed using non-toxic water-based inks. Clean lines and a subtle design make it a modern wardrobe essential.',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Sage', 'Sand', 'Clay', 'Pure White'],
    inStock: true,
    specs: {
      material: '100% Certified Organic Cotton',
      weight: '150 GSM',
      care: 'Machine wash warm, tumble dry medium',
      fit: 'Slim tailored fit',
    },
  },
  {
    id: 'prod_4',
    title: 'Urban Oversized Tee',
    handle: 'urban-oversized-tee',
    price: 59.99,
    rating: 4.6,
    reviews: 215,
    description:
      'Make a statement with our Urban Oversized Tee. Featuring dropped shoulders, a wider silhouette, and extended sleeves, this tee delivers the ultimate streetwear aesthetic without compromising on comfort.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Olive', 'Black', 'Desert Sand'],
    inStock: true,
    specs: {
      material: '80% Cotton, 20% Polyester Blend',
      weight: '210 GSM',
      care: 'Machine wash cold, tumble dry low',
      fit: 'Oversized streetwear fit',
    },
  },
  {
    id: 'prod_5',
    title: 'Performance Athletic Tee',
    handle: 'athletic-performance-tee',
    price: 45.00,
    rating: 4.8,
    reviews: 74,
    description:
      'Engineered for movement. Our Performance Athletic Tee uses a lightweight, sweat-wicking synthetic blend that keeps you cool and dry during intense workouts. Features flatlock seams to prevent chafing.',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Royal Blue', 'Slate', 'Neon Green'],
    inStock: true,
    specs: {
      material: '92% Polyester, 8% Elastane',
      weight: '140 GSM',
      care: 'Machine wash cold, air dry only',
      fit: 'Athletic slim fit',
    },
  },
  {
    id: 'prod_6',
    title: 'Cozy Waffle Knit Tee',
    handle: 'cozy-waffle-tee',
    price: 48.00,
    rating: 4.5,
    reviews: 112,
    description:
      'Add some texture to your daily outfit. The Cozy Waffle Knit Tee features a thermal waffle pattern that traps warmth while remaining highly breathable. Perfect for layering in transitional weather.',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Oatmeal', 'Espresso', 'Forest Green'],
    inStock: true,
    specs: {
      material: '60% Cotton, 40% Polyester Waffle Knit',
      weight: '190 GSM',
      care: 'Machine wash cold, reshape and dry flat',
      fit: 'Regular comfortable fit',
    },
  }
]
