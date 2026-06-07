import { Metadata } from 'next'
import Link from 'next/link'
import { fetchProductByHandle, loadSettings } from '@/lib/db'
import ProductDetailsClient from './ProductDetailsClient'

interface Props {
  params: Promise<{
    handle: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unwrappedParams = await params
  const product = await fetchProductByHandle(unwrappedParams.handle)

  if (!product) {
    return {
      title: 'المنتج غير موجود / Product Not Found | NEXSTIV',
      description: 'Sorry, this product does not exist in our store.',
    }
  }

  // Construct dynamic SEO keywords and description
  const description = product.seoDescription || product.description
  const keywords = product.seoKeywords || `${product.title}, premium clothing, nexstiv t-shirts`

  return {
    title: `${product.title} | NEXSTIV Premium T-Shirts`,
    description,
    keywords,
    openGraph: {
      title: product.title,
      description,
      url: `/product/${product.handle}`,
      siteName: 'NEXSTIV Store',
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: [product.image],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const unwrappedParams = await params
  const product = await fetchProductByHandle(unwrappedParams.handle)
  const settings = await loadSettings()

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center p-4 text-foreground">
        <h1 className="text-2xl font-bold">المنتج غير موجود / Product Not Found</h1>
        <Link href="/" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90">
          العودة للمتجر / Back to Store
        </Link>
      </div>
    )
  }

  return <ProductDetailsClient product={product} settings={settings} />
}


