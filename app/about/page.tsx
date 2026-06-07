import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { loadSettings } from '@/lib/db'

export const revalidate = 0; // Disable caching so it updates immediately when changed in DB

export default async function Page() {
  const settings = await loadSettings();
  const content = settings.uiContent.pageAbout || '';

  return (
    <div className="min-h-screen bg-white text-neutral-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-32">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">About Us</h1>
        <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed whitespace-pre-wrap">
          {content ? (
            <p>{content}</p>
          ) : (
            <p>هذه الصفحة فارغة حالياً. يمكنك إضافة محتوى لها من خلال لوحة التحكم (Admin Panel).</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
