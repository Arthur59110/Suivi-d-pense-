'use client'
import { useState, useEffect } from 'react'
import { ScanFace, Hash } from 'lucide-react'
import {
  canUseBiometric, isBiometricEnrolled, registerBiometric, clearBiometric,
  isPinEnrolled, setPin, clearPin,
  getBiometricEmail, getBiometricName,
} from '@/lib/biometric'

type PinStep = 'enter' | 'confirm'

export default function BiometricSettings({ userId }: { userId: string }) {
  const [faceAvail, setFaceAvail] = useState(false)
  const [faceOn, setFaceOn]       = useState(false)
  const [pinOn, setPinOn]         = useState(false)
  const [msg, setMsg]             = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)

  // Configuration PIN
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [pinStep, setPinStep]           = useState<PinStep>('enter')
  const [pinInput, setPinInput]         = useState('')
  const [pinFirst, setPinFirst]         = useState('')
  const [pinError, setPinError]         = useState<string | null>(null)

  useEffect(() => {
    canUseBiometric().then(ok => { setFaceAvail(ok); setFaceOn(isBiometricEnrolled()) })
    setPinOn(isPinEnrolled())
  }, [])

  async function enableFace() {
    setLoading(true); setMsg(null)
    const name = getBiometricName() || getBiometricEmail()
    const ok = await registerBiometric(userId, name)
    setLoading(false)
    if (ok) { setFaceOn(true); setMsg('Face ID activé') }
    else setMsg('Activation annulée')
  }
  function disableFace() { clearBiometric(); setFaceOn(false); setMsg('Face ID désactivé') }

  function openPinSetup() {
    setShowPinSetup(true)
    setPinStep('enter')
    setPinInput('')
    setPinFirst('')
    setPinError(null)
    setMsg(null)
  }
  function closePinSetup() { setShowPinSetup(false); setPinInput(''); setPinError(null) }

  function pressKey(k: string) {
    if (k === '⌫') { setPinInput(p => p.slice(0, -1)); setPinError(null); return }
    if (pinInput.length >= 6) return
    const next = pinInput + k
    setPinInput(next)
    if (next.length === 6) handlePinComplete(next)
  }

  async function handlePinComplete(value: string) {
    if (pinStep === 'enter') {
      setPinFirst(value)
      setPinStep('confirm')
      setPinInput('')
    } else {
      if (value !== pinFirst) {
        setPinError('Les codes ne correspondent pas')
        setPinInput('')
        return
      }
      await setPin(value)
      setPinOn(true)
      setShowPinSetup(false)
      setMsg('Code configuré')
    }
  }
  function disablePin() { clearPin(); setPinOn(false); setMsg('Code supprimé') }

  const PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  if (showPinSetup) {
    return (
      <div className="rounded-[16px] bg-[#F7F7F7] p-5 flex flex-col items-center gap-5 animate-fade-in">
        <p className="text-[15px] font-semibold text-black">
          {pinStep === 'enter' ? 'Créer un code' : 'Confirmer le code'}
        </p>
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full border-2 border-black transition-all"
              style={{ background: i < pinInput.length ? '#000' : 'transparent' }} />
          ))}
        </div>
        {pinError && <p className="text-[12px] text-red-500">{pinError}</p>}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
          {PAD.map((k, i) => {
            if (k === '') return <div key={i} />
            if (k === '⌫') return (
              <button key={i} onClick={() => pressKey('⌫')}
                className="h-[58px] rounded-[14px] bg-white flex items-center justify-center active:bg-[#E5E5EA] text-[18px] font-medium text-black">
                ⌫
              </button>
            )
            return (
              <button key={i} onClick={() => pressKey(k)}
                className="h-[58px] rounded-[14px] bg-white flex items-center justify-center active:bg-[#E5E5EA] text-[24px] font-light text-black">
                {k}
              </button>
            )
          })}
        </div>
        <button onClick={closePinSetup} className="text-[13px] text-[#8A8A8A] font-medium">Annuler</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Face ID */}
      {faceAvail && (
        <div className="rounded-[16px] bg-[#F7F7F7] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center flex-shrink-0">
              <ScanFace size={18} color="#000" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-medium text-black">Face ID</p>
              <p className="text-[12px] text-[#8A8A8A] mt-0.5">
                {faceOn ? 'Actif — déverrouillage automatique' : 'Déverrouillage biométrique'}
              </p>
            </div>
            {faceOn ? (
              <button onClick={disableFace} className="text-[13px] font-semibold text-red-500 px-3 py-1.5 rounded-[8px] bg-red-50">Désactiver</button>
            ) : (
              <button onClick={enableFace} disabled={loading} className="text-[13px] font-semibold text-black px-3 py-1.5 rounded-[8px] bg-black/[0.07] disabled:opacity-40">
                {loading ? '…' : 'Activer'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Code PIN */}
      <div className="rounded-[16px] bg-[#F7F7F7] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center flex-shrink-0">
            <Hash size={18} color="#000" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-medium text-black">Code à 6 chiffres</p>
            <p className="text-[12px] text-[#8A8A8A] mt-0.5">
              {pinOn ? 'Configuré — fallback Face ID' : 'Secours si Face ID indisponible'}
            </p>
          </div>
          {pinOn ? (
            <div className="flex gap-2">
              <button onClick={openPinSetup} className="text-[13px] font-semibold text-black px-3 py-1.5 rounded-[8px] bg-black/[0.07]">Modifier</button>
              <button onClick={disablePin} className="text-[13px] font-semibold text-red-500 px-3 py-1.5 rounded-[8px] bg-red-50">Supprimer</button>
            </div>
          ) : (
            <button onClick={openPinSetup} className="text-[13px] font-semibold text-black px-3 py-1.5 rounded-[8px] bg-black/[0.07]">Configurer</button>
          )}
        </div>
      </div>

      {msg && <p className="text-[12px] text-[#8A8A8A] animate-fade-in px-1">{msg}</p>}
    </div>
  )
}
