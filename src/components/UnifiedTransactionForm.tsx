'use client'
import { useState, useTransition } from 'react'
import { createExpense, createRevenue, createRevenueFromSavings } from '@/lib/actions'
import { CATEGORIES, REVENUE_SOURCES } from '@/lib/types'
import CategoryIcon from '@/components/CategoryIcon'
import RevenueIcon from '@/components/RevenueIcon'
import { ChevronLeft, PiggyBank } from 'lucide-react'
import Link from 'next/link'
import { format, startOfMonth, parseISO } from 'date-fns'

function toMonthValue(d: string) { return format(startOfMonth(parseISO(d)), 'yyyy-MM') }
function toBudgetMonthDate(m: string) { return `${m}-01` }

interface SavingsAccount { who: 'arthur' | 'paloma'; account_name: string }

export default function UnifiedTransactionForm({ savingsAccounts }: { savingsAccounts: SavingsAccount[] }) {
  const today = new Date().toISOString().split('T')[0]
  const [mode, setMode] = useState<'expense' | 'revenue'>('expense')

  // Champs communs
  const [amount, setAmount] = useState('')
  const [who, setWho] = useState<'arthur' | 'paloma'>('arthur')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today)

  // Dépense
  const [isPersonal, setIsPersonal] = useState(false)
  const [category, setCategory] = useState('')

  // Revenu
  const [source, setSource] = useState('')
  const [budgetMonthValue, setBudgetMonthValue] = useState(toMonthValue(today))
  const [fromSavings, setFromSavings] = useState(false)
  const [savingsAccount, setSavingsAccount] = useState('')
  const [savingsWho, setSavingsWho] = useState<'arthur' | 'paloma'>('arthur')

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function switchMode(m: 'expense' | 'revenue') {
    setMode(m)
    setError(null)
  }

  function handleDateChange(val: string) {
    setDate(val)
    setBudgetMonthValue(toMonthValue(val))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (!numAmount || numAmount <= 0) { setError('Montant invalide'); return }

    if (mode === 'expense') {
      if (!category) { setError('Sélectionnez une catégorie'); return }
      startTransition(async () => {
        try {
          await createExpense({ amount: numAmount, description, category, who, is_personal: isPersonal, date })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('NEXT_REDIRECT')) throw err
          setError(msg)
        }
      })
    } else {
      if (fromSavings && !savingsAccount.trim()) { setError('Sélectionne le compte d\'épargne à débiter'); return }
      startTransition(async () => {
        try {
          const revenueData = { amount: numAmount, description, source: source || 'autre', who, date, budget_month: toBudgetMonthDate(budgetMonthValue) }
          if (fromSavings) {
            await createRevenueFromSavings(revenueData, savingsWho, savingsAccount.trim())
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
  }

  const arthurAccounts = savingsAccounts.filter(a => a.who === 'arthur')
  const palomaAccounts = savingsAccounts.filter(a => a.who === 'paloma')

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] px-5 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-1"><ChevronLeft size={24} color="#000" /></Link>
        <h1 className="text-[28px] font-bold text-black">
          {mode === 'expense' ? 'Nouvelle dépense' : 'Nouveau revenu'}
        </h1>
      </div>

      {/* Toggle Dépense / Revenu */}
      <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex mb-5">
        <button type="button" onClick={() => switchMode('expense')}
          className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
          style={{ background: mode === 'expense' ? '#000' : 'transparent', color: mode === 'expense' ? '#fff' : '#8A8A8A', boxShadow: mode === 'expense' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none' }}>
          Dépense
        </button>
        <button type="button" onClick={() => switchMode('revenue')}
          className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
          style={{ background: mode === 'revenue' ? '#000' : 'transparent', color: mode === 'revenue' ? '#fff' : '#8A8A8A', boxShadow: mode === 'revenue' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none' }}>
          Revenu
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* Montant */}
        <div className="flex items-baseline justify-center gap-2 py-4 border-b-2 border-black">
          <input type="number" step="0.01" min="0" value={amount}
            onChange={e => setAmount(e.target.value)} placeholder="0,00"
            className="text-[56px] font-bold text-black bg-transparent outline-none text-center w-full placeholder-[#E5E5E5]"
            style={{ maxWidth: 240 }} />
          <span className="text-[28px] font-bold text-[#8A8A8A]">€</span>
        </div>

        {/* Qui */}
        <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
          {(['arthur', 'paloma'] as const).map(w => (
            <button key={w} type="button" onClick={() => setWho(w)}
              className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
              style={{ background: who === w ? '#fff' : 'transparent', color: who === w ? '#000' : '#8A8A8A', boxShadow: who === w ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {w === 'arthur' ? 'Arthur' : 'Paloma'}
            </button>
          ))}
        </div>

        {/* Champs spécifiques DÉPENSE */}
        {mode === 'expense' && (
          <div className="flex flex-col gap-5 animate-slide-up">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">Type</p>
              <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
                {[{ val: false, label: 'Commune' }, { val: true, label: 'Personnelle' }].map(({ val, label }) => (
                  <button key={label} type="button" onClick={() => setIsPersonal(val)}
                    className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
                    style={{ background: isPersonal === val ? '#fff' : 'transparent', color: isPersonal === val ? '#000' : '#8A8A8A', boxShadow: isPersonal === val ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">Catégorie</p>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                    className="flex flex-col items-center gap-1.5 rounded-[12px] py-3 px-1 transition-all"
                    style={{ background: category === cat.value ? '#000' : '#F7F7F7' }}>
                    <CategoryIcon category={cat.value} size={20} containerSize={36} inverted={category === cat.value} />
                    <span className="text-[10px] font-medium leading-tight text-center"
                      style={{ color: category === cat.value ? '#fff' : '#8A8A8A' }}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none" />

        {/* Date */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">Date</p>
          <input type="date" value={date} onChange={e => handleDateChange(e.target.value)}
            className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
        </div>

        {/* Type de revenu */}
        {mode === 'revenue' && (
          <div className="animate-slide-up">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">Type</p>
            <div className="grid grid-cols-4 gap-2">
              {REVENUE_SOURCES.map(src => (
                <button key={src.value} type="button" onClick={() => setSource(src.value)}
                  className="flex flex-col items-center gap-1.5 rounded-[12px] py-3 px-1 transition-all"
                  style={{ background: source === src.value ? '#000' : '#F7F7F7' }}>
                  <RevenueIcon source={src.value} size={20} containerSize={36} inverted={source === src.value} />
                  <span className="text-[10px] font-medium leading-tight text-center"
                    style={{ color: source === src.value ? '#fff' : '#8A8A8A' }}>
                    {src.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mois budget (revenu uniquement) */}
        {mode === 'revenue' && (
          <div className="flex flex-col gap-5 animate-slide-up">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
                Compte pour le mois de
              </p>
              <input type="month" value={budgetMonthValue} onChange={e => setBudgetMonthValue(e.target.value)}
                className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
            </div>

            {/* Pioché dans l'épargne */}
            <div className="rounded-[16px] border-2 overflow-hidden transition-all"
              style={{ borderColor: fromSavings ? '#000' : '#F0F0F0' }}>
              <button type="button" onClick={() => { setFromSavings(v => !v); setSavingsAccount('') }}
                className="w-full flex items-center gap-3 px-4 py-4">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: fromSavings ? '#000' : '#F7F7F7' }}>
                  <PiggyBank size={18} color={fromSavings ? '#fff' : '#8A8A8A'} strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[15px] font-semibold text-black">Pioché dans l'épargne</p>
                  <p className="text-[12px] text-[#8A8A8A] leading-snug">Le solde du compte d'épargne sera réduit automatiquement</p>
                </div>
                <div className="w-[44px] h-[26px] rounded-full flex-shrink-0 relative transition-colors"
                  style={{ background: fromSavings ? '#000' : '#E5E5E5' }}>
                  <div className="absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white transition-all"
                    style={{ left: fromSavings ? '21px' : '3px' }} />
                </div>
              </button>

              {fromSavings && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Compte à débiter</p>
                  {savingsAccounts.length === 0 ? (
                    <p className="text-[13px] text-[#8A8A8A]">Aucun compte — créez-en un dans l'onglet Épargne</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {arthurAccounts.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white">A</span>
                            </div>
                            <span className="text-[12px] font-semibold text-[#8A8A8A]">Arthur</span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {arthurAccounts.map(acc => {
                              const sel = savingsAccount === acc.account_name && savingsWho === 'arthur'
                              return (
                                <button key={acc.account_name} type="button"
                                  onClick={() => { setSavingsAccount(acc.account_name); setSavingsWho('arthur') }}
                                  className="flex items-center px-3 py-3 rounded-[10px]"
                                  style={{ background: sel ? '#000' : '#F0F0F0' }}>
                                  <span className="text-[14px] font-medium flex-1" style={{ color: sel ? '#fff' : '#000' }}>
                                    {acc.account_name}
                                  </span>
                                  {sel && <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-black" /></div>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {palomaAccounts.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-5 h-5 rounded-full bg-[#E5E5E5] flex items-center justify-center">
                              <span className="text-[9px] font-bold text-black">P</span>
                            </div>
                            <span className="text-[12px] font-semibold text-[#8A8A8A]">Paloma</span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {palomaAccounts.map(acc => {
                              const sel = savingsAccount === acc.account_name && savingsWho === 'paloma'
                              return (
                                <button key={acc.account_name} type="button"
                                  onClick={() => { setSavingsAccount(acc.account_name); setSavingsWho('paloma') }}
                                  className="flex items-center px-3 py-3 rounded-[10px]"
                                  style={{ background: sel ? '#000' : '#F0F0F0' }}>
                                  <span className="text-[14px] font-medium flex-1" style={{ color: sel ? '#fff' : '#000' }}>
                                    {acc.account_name}
                                  </span>
                                  {sel && <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-black" /></div>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-[13px] text-red-500 animate-fade-in">{error}</p>}

        <button type="submit" disabled={isPending}
          className="mt-auto h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40 transition-transform active:scale-[0.97] duration-100">
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
