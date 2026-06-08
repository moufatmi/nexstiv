-- ============================================================================
-- NEXSTIV E-Commerce Store - Complete Supabase Setup
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- 1. Products Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  title text NOT NULL,
  handle text NOT NULL UNIQUE,
  price numeric NOT NULL,
  rating numeric DEFAULT 5.0,
  reviews integer DEFAULT 0,
  description text,
  image text,
  images text[] DEFAULT '{}',
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  "inStock" boolean DEFAULT true,
  collection_id text,
  specs jsonb DEFAULT '{"material": "", "weight": "", "care": "", "fit": ""}'::jsonb,
  "seoDescription" text,
  "seoKeywords" text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 2. Collections Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS collections (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE collections DISABLE ROW LEVEL SECURITY;

-- Add foreign key from products to collections (if not already added)
ALTER TABLE products 
  ADD CONSTRAINT fk_collection 
  FOREIGN KEY (collection_id) 
  REFERENCES collections(id) 
  ON DELETE SET NULL;

-- 3. Orders Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_city text,
  customer_address text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  discount numeric DEFAULT 0,
  shipping numeric DEFAULT 0,
  tax numeric NOT NULL,
  total numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- 4. Store Settings Table (NEW)
-- ============================================================================
CREATE TABLE IF NOT EXISTS store_settings (
  id integer PRIMARY KEY DEFAULT 1,
  tax_rate numeric DEFAULT 10,
  shipping_fee numeric DEFAULT 50,
  free_shipping_threshold numeric DEFAULT 500,
  promo_codes jsonb DEFAULT '[{"code": "SAVE10", "discount": 10}]'::jsonb,
  auto_discounts jsonb DEFAULT '[]'::jsonb,
  ui_content jsonb DEFAULT '{}'::jsonb,
  currency text DEFAULT 'MAD',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;

-- Insert default settings row with full schema
INSERT INTO store_settings (
  id, 
  tax_rate, 
  shipping_fee, 
  free_shipping_threshold, 
  promo_codes, 
  auto_discounts,
  ui_content,
  currency
)
VALUES (
  1, 
  10, 
  50, 
  500, 
  '[{"code": "SAVE10", "discount": 10}]'::jsonb,
  '[]'::jsonb,
  '{
    "marqueeText": "PREMIUM QUALITY, FREE SHIPPING OVER 500 MAD, NEW ARRIVALS, 30-DAY RETURNS, NEXSTIV ORIGINALS, CRAFTED WITH CARE",
    "heroBadge": "SS''26 Collection",
    "heroTitle": "Wear the\\nDifference.",
    "heroDescription": "Premium quality t-shirts engineered for those who refuse to blend in. Every stitch, intentional.",
    "heroButtonText": "Shop Collection"
  }'::jsonb,
  'MAD'
)
ON CONFLICT (id) DO UPDATE SET
  tax_rate = EXCLUDED.tax_rate,
  shipping_fee = EXCLUDED.shipping_fee,
  free_shipping_threshold = EXCLUDED.free_shipping_threshold,
  promo_codes = EXCLUDED.promo_codes,
  auto_discounts = EXCLUDED.auto_discounts,
  currency = EXCLUDED.currency;

-- 5. Product Reviews Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text NOT NULL,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE product_reviews DISABLE ROW LEVEL SECURITY;

-- 6. Newsletter Subscribers Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text NOT NULL UNIQUE,
  status text DEFAULT 'subscribed',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE newsletter_subscribers DISABLE ROW LEVEL SECURITY;

-- 7. Contact Messages Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- 8. Product Images Storage Bucket
-- ============================================================================
-- Create the bucket (run this in SQL Editor, NOT in Storage UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to upload/read/delete images in product-images bucket
CREATE POLICY IF NOT EXISTS "Allow public CRUD on product-images" 
ON storage.objects
FOR ALL 
USING (bucket_id = 'product-images') 
WITH CHECK (bucket_id = 'product-images');

-- ============================================================================
-- DONE! Your Supabase database is now fully configured.
-- ============================================================================
