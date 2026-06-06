'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export default function Navbar() {
  const { cartCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="NEXSTIV"
              width={48}
              height={48}
              className="object-contain"
            />
            <span className="text-xl font-bold text-primary tracking-tight">NEXSTIV</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#collection" className="text-sm font-medium hover:text-accent transition-colors">
              Shop
            </Link>
            <Link href="/#collections" className="text-sm font-medium hover:text-accent transition-colors">
              Collections
            </Link>
            <Link href="/#about" className="text-sm font-medium hover:text-accent transition-colors">
              About
            </Link>
            <Link href="/#contact" className="text-sm font-medium hover:text-accent transition-colors">
              Contact
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
              <Search size={20} />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
              <Heart size={20} />
            </button>
            <Link
              href="/cart"
              className="relative p-2 hover:bg-secondary rounded-lg transition-colors inline-block text-foreground cursor-pointer"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2 text-foreground cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/#collection"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
            >
              Shop
            </Link>
            <Link
              href="/#collections"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
            >
              Collections
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
            >
              About
            </Link>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
