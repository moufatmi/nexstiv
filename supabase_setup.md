# إعدادات قاعدة البيانات (Supabase SQL Commands)

هذا الملف يحتوي على جميع أكواد SQL التي قمنا بإضافتها معاً في `SQL Editor` داخل لوحة تحكم Supabase. يمكنك الاحتفاظ بها كمرجع لك أو للزبون في حال احتجتم لإنشاء متجر جديد أو إعادة بناء قاعدة البيانات.

---

### 1. جدول رسائل التواصل (Contact Messages)
هذا الكود لإنشاء الجدول الخاص بصفحة "تواصل معنا" لاستقبال استفسارات الزبائن.

```sql
create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  status text default 'unread',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_messages enable row level security;
create policy "Allow public inserts" on public.contact_messages for insert with check (true);
create policy "Allow all operations" on public.contact_messages for all using (true);
```

---

### 2. جدول المراجعات والتقييمات (Product Reviews)
هذا الكود لإنشاء الجدول الخاص بتقييمات المنتجات (النجوم والتعليقات) التي يضيفها الزوار.

```sql
create table public.product_reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text not null,
  author_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.product_reviews enable row level security;
create policy "Allow public inserts" on public.product_reviews for insert with check (true);
create policy "Allow all operations" on public.product_reviews for all using (true);
```

---

### 3. جدول النشرة البريدية (Newsletter Subscribers)
هذا الكود لإنشاء الجدول الخاص بجمع الإيميلات من قسم (Stay in the loop) في الصفحة الرئيسية.

```sql
create table public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  status text default 'subscribed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.newsletter_subscribers enable row level security;
create policy "Allow public inserts" on public.newsletter_subscribers for insert with check (true);
create policy "Allow all operations" on public.newsletter_subscribers for all using (true);
```
