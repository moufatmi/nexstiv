'use client'

import Link from 'next/link'
import Image from 'next/image'
import { loadSettings, DEFAULT_SETTINGS } from '@/lib/db'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [uiContent, setUiContent] = useState(DEFAULT_SETTINGS.uiContent)

  useEffect(() => {
    loadSettings().then(s => setUiContent(s.uiContent))
  }, [])
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
            <p className="text-sm opacity-90 font-sans">{uiContent.footerDescription}</p>
          </div>
          {uiContent.footerColumns?.map((col, idx) => (
            <div key={idx}>
              <h4 className="font-semibold mb-4 font-sans">{col.title}</h4>
              <ul className="space-y-2 text-sm font-sans">
                {col.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.url} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-center sm:text-left">
          <p className="font-sans">&copy; {new Date().getFullYear()} NEXSTIV. All rights reserved.</p>

        </div>
      </div>
    </footer>
  )
}
