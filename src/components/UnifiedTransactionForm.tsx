'use client'
import { useState, useTransition, useRef } from 'react'
import { createExpense, createRevenue, createRevenueFromSavings, createSavingFromBudget } from '@/lib/actions'
import { CATEGORIES, REVENUE_SOURCES } from '@/lib/types'
import CategoryIcon from '@/components/CategoryIcon'
import RevenueIcon from '@/components/RevenueIcon'
import { ChevronLeft, PiggyBank, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { format, startOfMonth, parseISO, isSameMonth } from 'date-fns'

function toMonthValue(d: string) { return format(startOfMonth(parseISO(d)), 'yyyy-MM') }
function toBudgetMonthDate(m: string) { return `${m}-01` }

interface SavingsAccount { who: 'arthur' | 'paloma'; account_name: string }

type Mode = 'expense' | 'revenue' | 'saving'

export default function UnifiedTransactionForm({
  savingsAccounts,
  monthBalance,
}: {
  savingsAccounts: SavingsAccount[]
  monthBalance: { arthur: number; paloma: number }
}) {
  const today = new Date().toISOString().split('T')[0]
  const [mode, setMode] = useState<Mode>('expense')

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

  // Épargne
  const [savingAccountName, setSavingAccountName] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const submittingRef = useRef(false)

  function switchMode(m: Mode) { setMode(m); setError(null) }

  function handleDateChange(val: string) {
    setDate(val)
    setBudgetMonthValue(toMonthValue(val))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setError(null)
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (!numAmount || numAmount <= 0) { submittingRef.current = false; setError('Montant invalide'); return }

    if (mode === 'expense') {
      if (!category) { submittingRef.current = false; setError('Sélectionnez une catégorie'); return }
      startTransition(async () => {
        try {
          await createExpense({ amount: numAmount, description, category, who, is_personal: isPersonal, date })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('NEXT_REDIRECT')) throw err
          setError(msg)
        } finally {
          submittingRef.current = false
        }
      })
    } else if (mode === 'saving') {
      if (!savingAccountName.trim()) { submittingRef.current = false; setError('Sélectionne ou saisis un compte'); return }
      startTransition(async () => {
        try {
          await createSavingFromBudget({ amount: numAmount, description, who, type: 'deposit', account_name: savingAccountName.trim(), date })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('NEXT_REDIRECT')) throw err
          setError(msg)
        } finally {
          submittingRef.current = false
        }
      })
    } else {
      if (fromSavings && !savingsAccount.trim()) { submittingRef.current = false; setError('Sélectionne le compte d\'épargne à débiter'); return }
      startTransition(async () => {
        try {
          const revenueData = { amount: numAmount, description, source: source || 'autre', who, date, budget_month: toBudgetMonthDate(budgetMonthValue) }
          if (fromSavings) {
            await createRevenueFromSavings(savingsWho, savingsAccount.trim(), numAmount, description, date)
          } else {
            await createRevenue(revenueData)
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('NEXT_REDIRECT')) throw err
          setError(msg)
        } finally {
          submittingRef.current = false
        }
      })
    }
  }

  const arthurAccounts = savingsAccounts.filter(a => a.who === 'arthur')
  const palomaAccounts = savingsAccounts.filter(a => a.who === 'paloma')
  const accountSuggestions = savingsAccounts.filter(a => a.who === who).map(a => a.account_name)

  const numAmount = parseFloat(amount.replace(',', '.')) || 0
  const dateIsCurrentMonth = isSameMonth(new Date(date), new Date())
  const currentBalance = monthBalance[who]
  const isBalanceInsufficient =
    (mode === 'expense' || mode === 'saving') &&
    dateIsCurrentMonth &&
    numAmount > 0 &&
    numAmount > currentBalance

  const titles: Record<Mode, string> = {
    expense: 'Nouvelle dépense',
    revenue: 'Nouveau revenu',
    saving: 'Mettre de côté',
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] px-5 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-1"><ChevronLeft size={24} color="#000" /></Link>
        <h1 className="text-[28px] font-bold text-black">{titles[mode]}</h1>
      </div>

      {/* Toggle Dépense / Revenu / Épargne */}
      <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex mb-5 gap-1">
        {([
          { m: 'expense', label: 'Dépense' },
          { m: 'revenue', label: 'Revenu' },
          { m: 'saving', label: 'Épargne' },
        ] as { m: Mode; label: string }[]).map(({ m, label }) => (
          <button key={m} type="button" onClick={() => switchMode(m)}
            className="flex-1 py-3 rounded-[10px] text-[14px] font-semibold transition-all"
            style={{
              background: mode === m ? '#000' : 'transparent',
              color: mode === m ? '#fff' : '#8A8A8A',
              boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}>
            {label}
          </button>
        ))}
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

        {/* ÉPARGNE */}
        {mode === 'saving' && (
          <div className="flex flex-col gap-5 animate-slide-up">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">Compte</p>
              <input
                list="saving-accounts-datalist"
                value={savingAccountName}
                onChange={e => setSavingAccountName(e.target.value)}
                placeholder="Ex. PEA, PEL, Livret A…"
                className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none"
              />
              <datalist id="saving-accounts-datalist">
                {accountSuggestions.map((name, i) => <option key={i} value={name} />)}
              </datalist>
            </div>
            <div className="rounded-[12px] bg-[#F7F7F7] px-4 py-3 flex items-center gap-2">
              <PiggyBank size={15} color="#8A8A8A" strokeWidth={1.5} />
              <p className="text-[12px] text-[#8A8A8A] leading-snug">
                Ce montant sera déduit du solde de {who === 'arthur' ? 'Arthur' : 'Paloma'} et ajouté au compte épargne.
              </p>
            </div>
          </div>
        )}

        {/* DÉPENSE */}
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
                {CATEGORIES.filter(c => c.value !== 'epargne').map(cat => (
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

        {/* REVENU : type + mois + pioché dans épargne */}
        {mode === 'revenue' && (
          <div className="flex flex-col gap-5 animate-slide-up">
            {!fromSavings && (
              <div>
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
            {!fromSavings && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">Compte pour le mois de</p>
                <input type="month" value={budgetMonthValue} onChange={e => setBudgetMonthValue(e.target.value)}
                  className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
              </div>
            )}
            <div className="rounded-[16px] border-2 overflow-hidden transition-all"
              style={{ borderColor: fromSavings ? '#000' : '#F0F0F0' }}>
              <button type="button" onClick={() => { setFromSavings(v => !v); setSavingsAccount('') }}
                className="w-full flex items-center gap-3 px-4 py-4">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: fromSavings ? '#000' : '#F7F7F7' }}>
                  <PiggyBank size={18} color={fromSavings ? '#fff' : '#8A8A8A'} strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[15px] font-semibold text-black">Pioché dans l&apos;épargne</p>
                  <p className="text-[12px] text-[#8A8A8A] leading-snug">Le solde du compte d&apos;épargne sera réduit automatiquement</p>
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
                    <p className="text-[13px] text-[#8A8A8A]">Aucun compte — créez-en un dans l&apos;onglet Épargne</p>
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
                                  <span className="text-[14px] font-medium flex-1" style={{ color: sel ? '#fff' : '#000' }}>{acc.account_name}</span>
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
                                  <span className="text-[14px] font-medium flex-1" style={{ color: sel ? '#fff' : '#000' }}>{acc.account_name}</span>
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

        {isBalanceInsufficient && (
          <div className="rounded-[14px] bg-[#FFF3CD] border border-[#F0C040] px-4 py-4 flex gap-3 items-start">
            <AlertTriangle size={18} color="#B8860B" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#7A5C00] leading-snug">
                Solde insuffisant ce mois
              </p>
              <p className="text-[12px] text-[#7A5C00] mt-1 leading-snug">
                Il reste{' '}
                <span className="font-semibold">
                  {currentBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>{' '}
                sur le solde de {who === 'arthur' ? 'Arthur' : 'Paloma'} ce mois.
                Retirez d&apos;abord de l&apos;épargne avant d&apos;enregistrer cette{' '}
                {mode === 'saving' ? 'mise de côté' : 'dépense'}.
              </p>
              <Link href="/epargne" className="inline-block mt-2 text-[12px] font-semibold text-[#7A5C00] underline underline-offset-2">
                Aller à l&apos;épargne
              </Link>
            </div>
          </div>
        )}

        <button type="submit" disabled={isPending || isBalanceInsufficient}
          className="mt-auto h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40 transition-transform active:scale-[0.97] duration-100">
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
