'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { unlockEpargne } from '@/lib/actions'
import { Lock, Delete } from 'lucide-react'

export default function PinGate() {
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function press(digit: string) {
    if (isPending || input.length >= 4) return
    const next = input + digit
    setInput(next)
    if (next.length === 4) {
      startTransition(async () => {
        try {
          await unlockEpargne(next)
          router.refresh()
        } catch {
          setShake(true)
          setTimeout(() => {
            setInput('')
            setShake(false)
          }, 500)
        }
      })
    }
  }

  function backspace() {
    if (isPending) return
    setInput(p => p.slice(0, -1))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] gap-10 px-5">
      {/* Icon + title */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-[72px] h-[72px] rounded-full bg-black flex items-center justify-center">
          <Lock size={30} color="white" strokeWidth={1.5} />
        </div>
        <h1 className="text-[26px] font-bold text-black">Épargne</h1>
        <p className="text-[14px] text-[#8A8A8A]">Entrez votre code pour accéder</p>
      </div>

      {/* Dot indicators */}
      <div
        className="flex gap-5"
        style={{ animation: shake ? 'pin-shake 0.45s ease' : 'none' }}
      >
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-[14px] h-[14px] rounded-full border-2 border-black transition-all duration-150"
            style={{ background: i < input.length ? '#000' : 'transparent' }}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button
            key={d}
            onClick={() => press(d)}
            disabled={isPending}
            className="h-[74px] rounded-[18px] bg-[#F7F7F7] text-[26px] font-semibold text-black active:bg-[#E5E5E5] transition-colors disabled:opacity-40"
          >
            {d}
          </button>
        ))}
        {/* Bottom row */}
        <div />
        <button
          onClick={() => press('0')}
          disabled={isPending}
          className="h-[74px] rounded-[18px] bg-[#F7F7F7] text-[26px] font-semibold text-black active:bg-[#E5E5E5] transition-colors disabled:opacity-40"
        >
          0
        </button>
        <button
          onClick={backspace}
          disabled={isPending || input.length === 0}
          className="h-[74px] rounded-[18px] bg-[#F7F7F7] flex items-center justify-center active:bg-[#E5E5E5] transition-colors disabled:opacity-30"
        >
          <Delete size={22} color="#000" />
        </button>
      </div>
    </div>
  )
}
