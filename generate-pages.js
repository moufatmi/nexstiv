const fs = require('fs');
const path = require('path');

const pages = [
  { slug: 'about', title: 'About Us', text: 'Learn more about our company, our mission, and our values.' },
  { slug: 'contact', title: 'Contact Us', text: 'Get in touch with our team for any inquiries or support.' },
  { slug: 'faq', title: 'Frequently Asked Questions', text: 'Find answers to common questions about our products and services.' },
  { slug: 'shipping', title: 'Shipping Policy', text: 'Information about our shipping rates, methods, and delivery times.' },
  { slug: 'returns', title: 'Returns & Exchanges', text: 'Our policy for returning or exchanging items you are not satisfied with.' },
  { slug: 'careers', title: 'Careers', text: 'Join our team! Explore open positions and opportunities.' },
];

const template = (title, text) => `import Navbar from '@/components/Navbar'
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
`;

pages.forEach(p => {
  const dir = path.join(__dirname, 'app', p.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(p.title, p.text));
});

console.log('Static pages generated.');
