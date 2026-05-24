'use client'
import { useState, useLayoutEffect } from 'react'
import { Lock, Delete } from 'lucide-react'

const PIN = '1306'

export default function PinGate({ children }: { children: React.ReactNode }) {
  // 'checking' = before useLayoutEffect runs (renders nothing to avoid flash)
  const [state, setState] = useState<'checking' | 'locked' | 'unlocked'>('checking')
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)

  // useLayoutEffect runs synchronously before the browser paints — no flash
  useLayoutEffect(() => {
    setState(sessionStorage.getItem('epg') === '1' ? 'unlocked' : 'locked')
  }, [])

  function press(digit: string) {
    if (state !== 'locked' || input.length >= 4) return
    const next = input + digit
    setInput(next)
    if (next.length === 4) {
      if (next === PIN) {
        sessionStorage.setItem('epg', '1')
        setState('unlocked')
      } else {
        setShake(true)
        setTimeout(() => { setInput(''); setShake(false) }, 500)
      }
    }
  }

  function backspace() {
    setInput(p => p.slice(0, -1))
  }

  if (state === 'checking') return null
  if (state === 'unlocked') return <>{children}</>

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] gap-10 px-5">
      <div className="flex flex-col items-center gap-3">
        <div className="w-[72px] h-[72px] rounded-full bg-black flex items-center justify-center">
          <Lock size={30} color="white" strokeWidth={1.5} />
        </div>
        <h1 className="text-[26px] font-bold text-black">Épargne</h1>
        <p className="text-[14px] text-[#8A8A8A]">Entrez votre code pour accéder</p>
      </div>

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

      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button
            key={d}
            onClick={() => press(d)}
            className="h-[74px] rounded-[18px] bg-[#F7F7F7] text-[26px] font-semibold text-black active:bg-[#E5E5E5] transition-colors"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => press('0')}
          className="h-[74px] rounded-[18px] bg-[#F7F7F7] text-[26px] font-semibold text-black active:bg-[#E5E5E5] transition-colors"
        >
          0
        </button>
        <button
          onClick={backspace}
          disabled={input.length === 0}
          className="h-[74px] rounded-[18px] bg-[#F7F7F7] flex items-center justify-center active:bg-[#E5E5E5] transition-colors disabled:opacity-30"
        >
          <Delete size={22} color="#000" />
        </button>
      </div>
    </div>
  )
}
