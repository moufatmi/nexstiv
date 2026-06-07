import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-white text-neutral-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-32">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">{title}</h1>
        <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed">
          <p>{text}</p>
          <p>This is a placeholder page for {title}. You can update the content of this page directly in the code.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
