import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="NEXSTIV"
                width={40}
                height={40}
                className="object-contain"
              />
              <h3 className="text-lg font-bold font-sans">NEXSTIV</h3>
            </div>
            <p className="text-sm opacity-90 font-sans">Premium t-shirts for the modern lifestyle</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 font-sans">Shop</h4>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <Link href="/" className="hover:underline">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 font-sans">Company</h4>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <Link href="#" className="hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 font-sans">Support</h4>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <Link href="#" className="hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-center sm:text-left">
          <p className="font-sans">&copy; {new Date().getFullYear()} NEXSTIV. All rights reserved.</p>
          <p className="text-xs opacity-75 font-mono">
            Designed & Developed by{' '}
            <a
              href="https://github.com/moufatmi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-accent underline decoration-dotted transition-colors font-bold cursor-pointer"
            >
              Moussab Moufatmi
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
