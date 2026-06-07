'use client'

import { useEffect, useState } from 'react'
import { loadSettings } from '@/lib/db'

export default function CountdownBanner() {
  const [enabled, setEnabled] = useState(false)
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    loadSettings().then((settings) => {
      const ui = settings.uiContent
      if (ui.dropCountdownEnabled && ui.dropCountdownDate) {
        setEnabled(true)
        setTitle(ui.dropCountdownTitle || 'NEXT DROP')
        setTargetDate(new Date(ui.dropCountdownDate))
      }
    })
  }, [])

  useEffect(() => {
    if (!enabled || !targetDate) return

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        // Countdown finished
        setEnabled(false)
      }
    }

    calculateTimeLeft() // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [enabled, targetDate])

  if (!isClient || !enabled) return null

  return (
    <div className="bg-neutral-950 text-white py-2 px-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm font-bold tracking-widest uppercase z-50 relative border-b border-white/10">
      <span className="flex items-center gap-2">
        <span className="animate-pulse">🔴</span>
        {title}
      </span>
      <div className="flex items-center gap-1.5 font-mono bg-white/10 px-3 py-1 rounded-md">
        <div className="flex flex-col items-center">
          <span className="text-sm">{String(timeLeft.days).padStart(2, '0')}</span>
        </div>
        <span className="opacity-50">:</span>
        <div className="flex flex-col items-center">
          <span className="text-sm">{String(timeLeft.hours).padStart(2, '0')}</span>
        </div>
        <span className="opacity-50">:</span>
        <div className="flex flex-col items-center">
          <span className="text-sm">{String(timeLeft.minutes).padStart(2, '0')}</span>
        </div>
        <span className="opacity-50">:</span>
        <div className="flex flex-col items-center">
          <span className="text-sm text-neutral-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  )
}
