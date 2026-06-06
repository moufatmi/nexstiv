'use client'

import { useEffect, useState } from 'react'
import { Code2, ExternalLink, X } from 'lucide-react'

export default function DeveloperSignature() {
  const [clickCount, setClickCount] = useState(0)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Beautiful DevTools console signature
    console.log(
      '%c🚀 Crafted with passion by Moussab (Moufatmi) %c| ',
      'color: #ffffff; background: #000000; padding: 6px 12px; border-radius: 4px; font-weight: bold; border: 1px solid #333;',
      'color: #10b981; font-weight: bold; background: #111; padding: 6px 12px; border-radius: 4px;'
    )

    // Keyboard shortcut easter egg: typing "dev" triggers it
    let keys = ''
    const handleKeyDown = (e: KeyboardEvent) => {
      keys += e.key.toLowerCase()
      if (keys.endsWith('dev')) {
        setShowModal(true)
        keys = ''
      }
      if (keys.length > 10) keys = keys.substring(1)
    }

    // Click handler for copyright footer texts
    const handleCopyrightClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && target.innerText && (target.innerText.includes('NEXSTIV') || target.innerText.includes('rights reserved'))) {
        setClickCount((prev) => {
          const next = prev + 1
          if (next >= 5) {
            setShowModal(true)
            return 0
          }
          return next
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleCopyrightClick)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleCopyrightClick)
    }
  }, [])

  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-sm w-full relative shadow-2xl overflow-hidden text-neutral-200">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-blue-500/20 blur-2xl" />

        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-emerald-400 mb-4 shadow-inner">
            <Code2 size={32} className="animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1 font-sans">Developer Signature</h3>
          <p className="text-xs text-neutral-400 mb-6 font-mono">Designed & Engineered by</p>

          <div className="bg-neutral-950 border border-neutral-800/80 p-4 rounded-xl mb-6 space-y-2">
            <div className="font-semibold text-emerald-400 text-lg font-sans">Moussab Moufatmi</div>
            <div className="text-xs text-neutral-400 font-mono">Software Engineer</div>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed mb-6 font-sans">
            This premium e-commerce platform is custom-engineered using Next.js 15, React 19, and Supabase database.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg text-sm transition-colors border border-neutral-750 font-sans cursor-pointer"
            >
              Close
            </button>
            <a
              href="https://github.com/moufatmi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors inline-flex items-center justify-center gap-1 shadow-lg shadow-emerald-900/20 font-sans cursor-pointer"
            >
              <span>GitHub</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
