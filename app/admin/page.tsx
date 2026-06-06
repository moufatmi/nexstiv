'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Delay slightly to simulate server authentication animation
    setTimeout(() => {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin124'

      if (password === adminPassword) {
        sessionStorage.setItem('nexstiv-admin-session', 'true')
        router.push('/admin/dashboard')
      } else {
        setError('الرمز السري غير صحيح / Incorrect passcode')
        setIsLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between text-neutral-200 font-sans">
      {/* Header Back Button */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group text-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>الرجوع للمتجر / Back to Store</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Gradient Ring */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />

          {/* Form Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-neutral-800 border border-neutral-700 text-accent mb-4">
              <Lock size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">لوحة التحكم / Admin Area</h1>
            <p className="text-sm text-neutral-400">أدخل الرمز السري للدخول / Enter passcode to access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="passcode" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                الرمز السري / Passcode
              </label>
              <input
                id="passcode"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-neutral-500 focus:outline-none transition-colors text-center text-lg tracking-widest font-mono text-white"
              />
              {error && (
                <p className="text-red-500 text-xs font-medium mt-2 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-semibold rounded-xl transition-all shadow-lg hover:shadow-white/5 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                'تسجيل الدخول / Authenticate'
              )}
            </button>
          </form>

          {/* Default hint for user */}
          <div className="mt-6 text-center text-xs text-neutral-500 relative z-10">
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs text-neutral-600">
        <p>&copy; {new Date().getFullYear()} NEXSTIV Admin Access Gate.</p>
      </div>
    </div>
  )
}
