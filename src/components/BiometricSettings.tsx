'use client'
import { useState, useEffect } from 'react'
import { ScanFace } from 'lucide-react'
import {
  canUseBiometric, isBiometricEnrolled, registerBiometric, clearBiometric,
  getBiometricEmail, getBiometricName,
} from '@/lib/biometric'

interface Props { userId: string }

export default function BiometricSettings({ userId }: Props) {
  const [available, setAvailable]   = useState(false)
  const [enrolled, setEnrolled]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [message, setMessage]       = useState<string | null>(null)

  useEffect(() => {
    canUseBiometric().then(ok => {
      setAvailable(ok)
      setEnrolled(isBiometricEnrolled())
    })
  }, [])

  if (!available) return null

  async function handleEnable() {
    setLoading(true)
    setMessage(null)
    const name = getBiometricName() || getBiometricEmail()
    const ok = await registerBiometric(userId, name)
    setLoading(false)
    if (ok) {
      setEnrolled(true)
      setMessage('Face ID activé')
    } else {
      setMessage('Activation annulée')
    }
  }

  function handleDisable() {
    clearBiometric()
    setEnrolled(false)
    setMessage('Face ID désactivé')
  }

  return (
    <div className="rounded-[16px] bg-[#F7F7F7] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center flex-shrink-0">
          <ScanFace size={18} color="#000" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-medium text-black">Face ID</p>
          <p className="text-[12px] text-[#8A8A8A] mt-0.5">
            {enrolled ? 'Actif — déverrouillage automatique' : 'Déverrouillage biométrique'}
          </p>
        </div>
        {enrolled ? (
          <button
            onClick={handleDisable}
            className="text-[13px] font-semibold text-red-500 px-3 py-1.5 rounded-[8px] bg-red-50 active:opacity-70"
          >
            Désactiver
          </button>
        ) : (
          <button
            onClick={handleEnable}
            disabled={loading}
            className="text-[13px] font-semibold text-black px-3 py-1.5 rounded-[8px] bg-black/[0.07] active:opacity-70 disabled:opacity-40"
          >
            {loading ? '…' : 'Activer'}
          </button>
        )}
      </div>
      {message && (
        <p className="px-4 pb-3 text-[12px] text-[#8A8A8A] animate-fade-in">{message}</p>
      )}
    </div>
  )
}
