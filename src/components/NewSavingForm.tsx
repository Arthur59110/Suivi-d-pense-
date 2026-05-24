'use client'
import { useState, useTransition, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createSaving } from '@/lib/actions'
import { ChevronLeft, ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'

interface ExistingAccount {
  who: 'arthur' | 'paloma'
  account_name: string
}

export default function NewSavingForm({ existingAccounts }: { existingAccounts: ExistingAccount[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const initialType = params.get('type') === 'withdrawal' ? 'withdrawal' : 'deposit'
  const initialWho = params.get('who') === 'paloma' ? 'paloma' : 'arthur'
  const initialAccount = params.get('account') ?? ''

  useEffect(() => {
    if (sessionStorage.getItem('epg') !== '1') router.replace('/epargne')
  }, [router])

  const [type, setType] = useState<'deposit' | 'withdrawal'>(initialType)
  const [amount, setAmount] = useState('')
  const [who, setWho] = useState<'arthur' | 'paloma'>(initialWho)
  const [accountName, setAccountName] = useState(initialAccount)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isWithdrawal = type === 'withdrawal'
  const suggestions = existingAccounts.filter(a => a.who === who).map(a => a.account_name)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (!numAmount || numAmount <= 0) { setError('Montant invalide'); return }
    if (!accountName.trim()) { setError('Nom du compte requis'); return }

    startTransition(async () => {
      try {
        await createSaving({ amount: numAmount, description, who, type, account_name: accountName.trim(), date })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) throw err
        setError(msg)
      }
    })
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] px-5 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/epargne" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[28px] font-bold text-black">
          {isWithdrawal ? 'Retirer' : 'Mettre de côté'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* Type toggle */}
        <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
          <button type="button" onClick={() => setType('deposit')}
            className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
            style={{ background: !isWithdrawal ? '#ffffff' : 'transparent', color: !isWithdrawal ? '#000000' : '#8A8A8A', boxShadow: !isWithdrawal ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
            Mettre de côté
          </button>
          <button type="button" onClick={() => setType('withdrawal')}
            className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
            style={{ background: isWithdrawal ? '#ffffff' : 'transparent', color: isWithdrawal ? '#000000' : '#8A8A8A', boxShadow: isWithdrawal ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
            Retirer
          </button>
        </div>

        {/* Amount */}
        <div className="flex items-baseline justify-center gap-2 py-4 border-b-2"
          style={{ borderColor: isWithdrawal ? '#8A8A8A' : '#000' }}>
          <input type="number" step="0.01" min="0" value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0,00"
            className="text-[56px] font-bold bg-transparent outline-none text-center w-full placeholder-[#E5E5E5]"
            style={{ maxWidth: 240, color: isWithdrawal ? '#8A8A8A' : '#000' }} />
          <span className="text-[28px] font-bold text-[#8A8A8A]">€</span>
        </div>

        {/* Who */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            {isWithdrawal ? "De l'épargne de" : 'Pour'}
          </p>
          <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
            {(['arthur', 'paloma'] as const).map(w => (
              <button key={w} type="button" onClick={() => setWho(w)}
                className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
                style={{ background: who === w ? '#ffffff' : 'transparent', color: who === w ? '#000000' : '#8A8A8A', boxShadow: who === w ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                {w === 'arthur' ? 'Arthur' : 'Paloma'}
              </button>
            ))}
          </div>
        </div>

        {/* Account name */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            Compte
          </p>
          <input
            list="accounts-datalist"
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            placeholder="Ex. PEA, PEL, Livret A…"
            className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none"
          />
          <datalist id="accounts-datalist">
            {suggestions.map((name, i) => <option key={i} value={name} />)}
          </datalist>
        </div>

        {/* Description */}
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder={isWithdrawal ? 'Ex. Achat voiture, Voyage…' : 'Ex. Épargne Mai, Bonus…'}
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none" />

        {/* Date */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">Date</p>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
        </div>

        <div className="flex items-start gap-2 px-1">
          {isWithdrawal
            ? <ArrowUp size={13} color="#8A8A8A" className="mt-0.5 flex-shrink-0" />
            : <ArrowDown size={13} color="#8A8A8A" className="mt-0.5 flex-shrink-0" />
          }
          <p className="text-[12px] text-[#8A8A8A] leading-snug">
            {isWithdrawal
              ? `Retiré du compte "${accountName || '...'}" de ${who === 'arthur' ? 'Arthur' : 'Paloma'}.`
              : `Ajouté au compte "${accountName || '...'}" de ${who === 'arthur' ? 'Arthur' : 'Paloma'}.`
            }
          </p>
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <button type="submit" disabled={isPending}
          className="mt-auto h-[56px] rounded-[14px] text-white text-[16px] font-semibold disabled:opacity-40 transition-opacity"
          style={{ background: isWithdrawal ? '#8A8A8A' : '#000' }}>
          {isPending ? 'Enregistrement...' : isWithdrawal ? 'Retirer' : 'Mettre de côté'}
        </button>
      </form>
    </div>
  )
}
