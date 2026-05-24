'use client'
import { useState, useTransition } from 'react'
import { createRevenue, createRevenueFromSavings } from '@/lib/actions'
import { REVENUE_SOURCES } from '@/lib/types'
import RevenueIcon from '@/components/RevenueIcon'
import { ChevronLeft, PiggyBank } from 'lucide-react'
import Link from 'next/link'
import { format, startOfMonth, parseISO } from 'date-fns'

function toMonthValue(date: string): string {
  return format(startOfMonth(parseISO(date)), 'yyyy-MM')
}

function toBudgetMonthDate(monthValue: string): string {
  return `${monthValue}-01`
}

interface SavingsAccount {
  who: 'arthur' | 'paloma'
  account_name: string
}

export default function NewRevenueForm({ savingsAccounts }: { savingsAccounts: SavingsAccount[] }) {
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [who, setWho] = useState<'arthur' | 'paloma'>('arthur')
  const [source, setSource] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today)
  const [budgetMonthValue, setBudgetMonthValue] = useState(toMonthValue(today))

  const [fromSavings, setFromSavings] = useState(false)
  const [savingsAccount, setSavingsAccount] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDateChange(val: string) {
    setDate(val)
    setBudgetMonthValue(toMonthValue(val))
  }

  const accountSuggestions = savingsAccounts.filter(a => a.who === who).map(a => a.account_name)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (!numAmount || numAmount <= 0) { setError('Montant invalide'); return }
    if (!source) { setError('Sélectionnez une source'); return }
    if (fromSavings && !savingsAccount.trim()) { setError('Précise le compte d\'épargne utilisé'); return }

    startTransition(async () => {
      try {
        const revenueData = {
          amount: numAmount, description, source, who, date,
          budget_month: toBudgetMonthDate(budgetMonthValue),
        }
        if (fromSavings) {
          await createRevenueFromSavings(revenueData, who, savingsAccount.trim())
        } else {
          await createRevenue(revenueData)
        }
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
        <Link href="/ajouter" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[28px] font-bold text-black">Nouveau revenu</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div className="flex items-baseline justify-center gap-2 py-4 border-b-2 border-black">
          <input
            type="number" step="0.01" min="0"
            value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0,00"
            className="text-[56px] font-bold text-black bg-transparent outline-none text-center w-full placeholder-[#E5E5E5]"
            style={{ maxWidth: 240 }}
          />
          <span className="text-[28px] font-bold text-[#8A8A8A]">€</span>
        </div>

        <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
          {(['arthur', 'paloma'] as const).map(w => (
            <button key={w} type="button" onClick={() => setWho(w)}
              className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
              style={{ background: who === w ? '#ffffff' : 'transparent', color: who === w ? '#000000' : '#8A8A8A', boxShadow: who === w ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {w === 'arthur' ? 'Arthur' : 'Paloma'}
            </button>
          ))}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">Source</p>
          <div className="grid grid-cols-3 gap-2">
            {REVENUE_SOURCES.map(src => (
              <button key={src.value} type="button" onClick={() => setSource(src.value)}
                className="flex flex-col items-center gap-1.5 rounded-[12px] py-3 px-1 transition-all"
                style={{ background: source === src.value ? '#000000' : '#F7F7F7' }}>
                <RevenueIcon source={src.value} size={20} containerSize={36} inverted={source === src.value} />
                <span className="text-[10px] font-medium leading-tight text-center"
                  style={{ color: source === src.value ? '#ffffff' : '#8A8A8A' }}>
                  {src.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none" />

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            Date de réception
          </p>
          <input type="date" value={date} onChange={e => handleDateChange(e.target.value)}
            className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            Compte pour le mois de
          </p>
          <input type="month" value={budgetMonthValue} onChange={e => setBudgetMonthValue(e.target.value)}
            className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
        </div>

        {/* Toggle : provient de l'épargne */}
        <div
          className="rounded-[16px] border-2 overflow-hidden transition-all"
          style={{ borderColor: fromSavings ? '#000' : '#F0F0F0' }}
        >
          <button
            type="button"
            onClick={() => setFromSavings(v => !v)}
            className="w-full flex items-center gap-3 px-4 py-4"
          >
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: fromSavings ? '#000' : '#F7F7F7' }}
            >
              <PiggyBank size={18} color={fromSavings ? '#fff' : '#8A8A8A'} strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[15px] font-semibold text-black">Pioché dans l'épargne</p>
              <p className="text-[12px] text-[#8A8A8A] leading-snug">
                Le solde du compte d'épargne sera réduit automatiquement
              </p>
            </div>
            <div
              className="w-[44px] h-[26px] rounded-full flex-shrink-0 transition-colors relative"
              style={{ background: fromSavings ? '#000' : '#E5E5E5' }}
            >
              <div
                className="absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white transition-all"
                style={{ left: fromSavings ? '21px' : '3px' }}
              />
            </div>
          </button>

          {fromSavings && (
            <div className="px-4 pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
                Compte d'épargne débité
              </p>
              <input
                list="savings-accounts-datalist"
                value={savingsAccount}
                onChange={e => setSavingsAccount(e.target.value)}
                placeholder="Ex. PEA, PEL, Livret A…"
                className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-3.5 text-[16px] text-black placeholder-[#8A8A8A] outline-none"
              />
              <datalist id="savings-accounts-datalist">
                {accountSuggestions.map((name, i) => <option key={i} value={name} />)}
              </datalist>
              {accountSuggestions.length === 0 && (
                <p className="text-[12px] text-[#8A8A8A] mt-2 px-1">
                  Aucun compte d'épargne pour {who === 'arthur' ? 'Arthur' : 'Paloma'} — saisir le nom manuellement
                </p>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <button type="submit" disabled={isPending}
          className="mt-auto h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40">
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
