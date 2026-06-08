# 📚 شرح أكواد Supabase - NEXSTIV Store
# Supabase SQL Codes Explanation

---

## 🎯 نظرة عامة / Overview

كل ما تحتاجه هو نسخ محتوى ملف `supabase-setup.sql` ولصقه في **Supabase SQL Editor** والضغط على Run.

**All you need to do**: Copy `supabase-setup.sql` content → Paste in Supabase SQL Editor → Click Run

---

## 📦 الجداول التي أضفناها / Tables We Added

### 1️⃣ جدول المنتجات / Products Table

```sql
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
```

**📝 الشرح / Explanation:**
- `id` - معرف فريد لكل منتج / Unique product ID
- `title` - اسم المنتج / Product name
- `handle` - رابط URL للمنتج (مثال: classic-tee) / URL-friendly product slug
- `price` - السعر بالدرهم / Price in MAD
- `rating` - التقييم من 5 / Rating out of 5
- `reviews` - عدد المراجعات / Number of reviews
- `description` - وصف المنتج / Product description
- `image` - الصورة الرئيسية / Main image URL
- `images` - مصفوفة من الصور / Array of multiple images
- `sizes` - المقاسات المتوفرة (S, M, L, XL) / Available sizes
- `colors` - الألوان المتوفرة / Available colors
- `inStock` - متوفر أم لا / In stock status
- `collection_id` - معرف المجموعة التابع لها / Collection it belongs to
- `specs` - مواصفات المنتج (قماش، وزن، عناية) / Product specifications (material, weight, care)
- `seoDescription` - وصف لمحركات البحث / SEO description
- `seoKeywords` - كلمات مفتاحية / SEO keywords

**🔒 DISABLE ROW LEVEL SECURITY** - يسمح بالوصول الكامل للإدارة / Allows full admin access

---

### 2️⃣ جدول المجموعات / Collections Table

```sql
CREATE TABLE IF NOT EXISTS collections (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE collections DISABLE ROW LEVEL SECURITY;

-- ربط المنتجات بالمجموعات / Link products to collections
ALTER TABLE products 
  ADD CONSTRAINT fk_collection 
  FOREIGN KEY (collection_id) 
  REFERENCES collections(id) 
  ON DELETE SET NULL;
```

**📝 الشرح / Explanation:**
- `id` - معرف فريد للمجموعة / Unique collection ID
- `name` - اسم المجموعة (مثال: "New Arrivals") / Collection name
- `description` - وصف المجموعة / Collection description
- `created_at` - تاريخ الإنشاء / Creation date

**🔗 Foreign Key** - يربط كل منتج بمجموعة / Links each product to a collection
**ON DELETE SET NULL** - إذا حذفت المجموعة، المنتجات تبقى بدون مجموعة / If collection deleted, products remain without collection

---

### 3️⃣ جدول الطلبات / Orders Table

```sql
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
```

**📝 الشرح / Explanation:**
- `id` - معرف فريد للطلب / Unique order ID
- `customer_name` - اسم الزبون / Customer name
- `customer_email` - البريد الإلكتروني / Customer email
- `customer_phone` - رقم الهاتف / Phone number (NEW)
- `customer_city` - المدينة / City (NEW)
- `customer_address` - العنوان الكامل / Full address
- `items` - المنتجات المطلوبة (JSON) / Ordered items as JSON array
- `subtotal` - المجموع قبل الضرائب والشحن / Subtotal before tax/shipping
- `discount` - الخصم المطبق / Applied discount
- `shipping` - رسوم الشحن / Shipping fee
- `tax` - الضريبة / Tax amount
- `total` - المجموع النهائي / Final total
- `status` - حالة الطلب / Order status:
  - `pending` - قيد الانتظار / Waiting
  - `processing` - قيد المعالجة / Being processed
  - `shipped` - تم الشحن / Shipped
  - `delivered` - تم التسليم / Delivered
  - `cancelled` - ملغى / Cancelled

---

### 4️⃣ جدول إعدادات المتجر / Store Settings Table

```sql
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

-- إضافة الإعدادات الافتراضية / Insert default settings
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
```

**📝 الشرح / Explanation:**

هذا الجدول **مهم جداً** - يحفظ كل إعدادات المتجر!
This table is **very important** - it saves all store settings!

- `id` - دائماً 1 (سطر واحد فقط) / Always 1 (single row)
- `tax_rate` - نسبة الضريبة (%) / Tax percentage (default: 10%)
- `shipping_fee` - رسوم الشحن بالدرهم / Shipping fee in MAD (default: 50 MAD)
- `free_shipping_threshold` - شحن مجاني فوق هذا المبلغ / Free shipping above this amount (default: 500 MAD)
- `promo_codes` - أكواد الخصم / Promo codes:
  ```json
  [
    {"code": "SAVE10", "discount": 10},
    {"code": "SUMMER20", "discount": 20}
  ]
  ```
- `auto_discounts` - خصومات تلقائية / Auto discounts:
  ```json
  [
    {
      "name": "Buy 3 Get 10% Off",
      "minItems": 3,
      "discountValue": 10,
      "type": "percentage"
    }
  ]
  ```
- `ui_content` - محتوى الواجهة (نصوص، عناوين) / UI content (texts, titles)
- `currency` - العملة (MAD) / Currency

**ON CONFLICT DO UPDATE** - إذا السطر موجود، يحدثه بدلاً من إضافة سطر جديد / If row exists, update it instead of inserting new

---

### 5️⃣ جدول المراجعات / Product Reviews Table

```sql
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
```

**📝 الشرح / Explanation:**
- `id` - معرف فريد (يولد تلقائياً) / Unique ID (auto-generated)
- `product_id` - معرف المنتج المراجع / Product being reviewed
- `author_name` - اسم الكاتب / Reviewer name
- `rating` - التقييم من 1 إلى 5 / Rating from 1 to 5
- `comment` - نص المراجعة / Review text
- `status` - حالة المراجعة / Review status:
  - `pending` - قيد الانتظار / Waiting for approval
  - `approved` - موافق عليها / Approved (shows on site)
  - `rejected` - مرفوضة / Rejected (hidden)

---

### 6️⃣ جدول المشتركين / Newsletter Subscribers Table

```sql
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text NOT NULL UNIQUE,
  status text DEFAULT 'subscribed',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE newsletter_subscribers DISABLE ROW LEVEL SECURITY;
```

**📝 الشرح / Explanation:**
- `id` - معرف فريد / Unique ID
- `email` - البريد الإلكتروني (فريد) / Email (unique)
- `status` - الحالة (subscribed, unsubscribed) / Status
- `created_at` - تاريخ الاشتراك / Subscription date

**UNIQUE** - كل إيميل يسجل مرة واحدة فقط / Each email can only subscribe once

---

### 7️⃣ جدول رسائل الاتصال / Contact Messages Table

```sql
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
```

**📝 الشرح / Explanation:**
- `id` - معرف فريد / Unique ID
- `name` - اسم المرسل / Sender name
- `email` - إيميل المرسل / Sender email
- `subject` - الموضوع / Subject
- `message` - نص الرسالة / Message text
- `status` - حالة الرسالة / Message status:
  - `unread` - غير مقروءة / Unread
  - `read` - مقروءة / Read
  - `replied` - تم الرد عليها / Replied

---

### 8️⃣ مساحة تخزين الصور / Product Images Storage Bucket

```sql
-- إنشاء Bucket للصور / Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- السماح بالوصول العام / Allow public access
CREATE POLICY IF NOT EXISTS "Allow public CRUD on product-images" 
ON storage.objects
FOR ALL 
USING (bucket_id = 'product-images') 
WITH CHECK (bucket_id = 'product-images');
```

**📝 الشرح / Explanation:**
- `bucket_id = 'product-images'` - مجلد لحفظ صور المنتجات / Folder for product images
- `public = true` - الصور متاحة للجميع / Images are publicly accessible
- `POLICY` - يسمح برفع، قراءة، وحذف الصور / Allows upload, read, and delete of images

**لماذا نحتاجه؟** / **Why do we need it?**
- عند رفع صورة في Admin Dashboard، تُحفظ هنا
- When you upload an image in Admin Dashboard, it's saved here

---

## 🎬 كيف تستخدم الكود / How to Use

### الخطوات / Steps:

1. **افتح Supabase Dashboard** / **Open Supabase Dashboard**
   - اذهب إلى مشروعك / Go to your project
   - من القائمة الجانبية اختر **SQL Editor** / From sidebar, choose **SQL Editor**

2. **انسخ الكود** / **Copy the Code**
   - افتح ملف `supabase-setup.sql` / Open `supabase-setup.sql` file
   - انسخ **كل المحتوى** / Copy **all content**

3. **الصق واضغط Run** / **Paste and Click Run**
   - الصق في SQL Editor / Paste into SQL Editor
   - اضغط على زر **Run** (أو Ctrl+Enter) / Click **Run** button (or Ctrl+Enter)

4. **تحقق من النتائج** / **Verify Results**
   - اذهب إلى **Table Editor** / Go to **Table Editor**
   - يجب أن ترى 7 جداول جديدة / You should see 7 new tables:
     - ✅ products
     - ✅ collections
     - ✅ orders
     - ✅ store_settings
     - ✅ product_reviews
     - ✅ newsletter_subscribers
     - ✅ contact_messages

---

## 🔍 كيف تتحقق أن كل شيء يعمل؟ / How to Verify Everything Works?

### في Supabase:

1. **Table Editor** → تحقق من وجود الجداول / Check tables exist
2. **Storage** → تحقق من bucket اسمه `product-images` / Check bucket named `product-images`
3. **Table: store_settings** → يجب أن يكون فيه سطر واحد (id=1) / Should have 1 row (id=1)

### في موقعك:

1. **Admin Dashboard** → Settings Tab
   - يجب أن ترى: Tax Rate, Shipping Fee, Free Shipping Threshold
   - يجب أن ترى: Promo Codes section مع SAVE10

2. **غير الإعدادات واحفظ** / **Change settings and save**
   - غير Tax Rate من 10% إلى 15%
   - اضغط Save
   - أعد تحميل الصفحة (F5)
   - يجب أن تبقى 15% ✅ / Should remain 15% ✅

3. **اذهب إلى السلة (Cart)** / **Go to Cart**
   - أضف منتج
   - يجب أن ترى: Tax, Shipping Fee, Free Shipping message
   - كل شيء بالدرهم MAD ✅ / Everything in MAD ✅

---

## 💡 أسئلة شائعة / FAQ

### ❓ ماذا يحدث إذا نفذت الكود مرتين؟
**الجواب**: لا مشكلة! `IF NOT EXISTS` يمنع التكرار / No problem! `IF NOT EXISTS` prevents duplication

### ❓ هل يمكنني تعديل القيم الافتراضية؟
**الجواب**: نعم! عدل في الكود قبل تشغيله أو من Admin Dashboard بعد ذلك / Yes! Edit in code before running or in Admin Dashboard later

### ❓ ماذا لو حذفت جدول عن طريق الخطأ؟
**الجواب**: شغل الكود من جديد، سيعيد إنشاءه / Run the code again, it will recreate it

### ❓ كيف أحذف كل شيء وأبدأ من جديد؟
**الجواب**: / **Answer**:
```sql
-- احذف كل الجداول / Delete all tables
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;

-- ثم شغل supabase-setup.sql من جديد
-- Then run supabase-setup.sql again
```

---

## 📊 علاقات الجداول / Table Relationships

```
collections (المجموعات)
    ↓ (collection_id)
products (المنتجات)
    ↓ (product_id)
product_reviews (المراجعات)

orders (الطلبات) - مستقل / Independent

store_settings (الإعدادات) - سطر واحد / Single row

newsletter_subscribers (المشتركون) - مستقل / Independent

contact_messages (الرسائل) - مستقل / Independent

product-images (Bucket) - لحفظ الصور / For storing images
```

---

## ✅ خلاصة / Summary

**ما تحتاج تعرفه:** / **What you need to know:**

1. 📦 **7 جداول** - تحفظ المنتجات، الطلبات، الإعدادات، إلخ / 7 tables - store products, orders, settings, etc.
2. 🖼️ **Storage Bucket** - لحفظ صور المنتجات / For product images
3. 💰 **كل الأسعار بالدرهم MAD** / All prices in MAD
4. ⚙️ **الإعدادات تحفظ في Supabase** وليس localStorage فقط / Settings save to Supabase, not just localStorage
5. 🔒 **RLS معطل** للإدارة السهلة / RLS disabled for easy admin access

**ملف واحد لتشغيله:** `supabase-setup.sql`  
**One file to run:** `supabase-setup.sql`

---

**🎉 كل شيء جاهز! / Everything is ready!**

إذا عندك أي سؤال، تحقق من `SETUP-VERIFICATION.md` للمزيد من التفاصيل.  
If you have any questions, check `SETUP-VERIFICATION.md` for more details.

**Developer**: Moussab Moufatmi (LexBridge)
