'use client'
import { useState, useLayoutEffect } from 'react'

const MESSAGES = [
  "Arthur, encore un café à 5 € ? C'est noté.",
  "Paloma a dit qu'elle économisait. Arthur a des doutes.",
  "Arthur a dit qu'il économisait. Paloma vérifiera le relevé.",
  "La baguette à 1,20 € reste autorisée. Pour l'instant.",
  "Vos finances vous regardent. Elles ont l'air déçues.",
  "Rappel : les courses sont un investissement. Amazon non.",
  "Bienvenue. Le solde espère que vous avez passé une bonne journée.",
  "L'épargne, c'est maintenant. L'apéro, c'est aussi maintenant. Choisissez.",
  "Ce mois-ci, on fait attention. Comme le mois dernier. Et celui d'avant.",
  "Chaque euro dépensé est un euro qui ne reviendra jamais. Bonne journée !",
  "Paloma, Arthur surveille. Arthur, Paloma surveille. Tout va bien.",
  "Les dépenses imprévues, c'est juste des surprises avec un prix.",
  "Objectif du mois : ne pas dépasser le budget. Objectif bonus : le tenir.",
  "Vous êtes tous les deux adultes responsables. En théorie.",
  "Le futur vous dit merci pour l'épargne. Le présent, bof.",
  "Avoir un suivi de dépenses, c'est déjà 80 % du boulot. Les 20 % restants, c'est dur.",
  "Aujourd'hui est un bon jour pour ne rien acheter en ligne. Courage.",
  "Si c'est noté, c'est sous contrôle. C'est ce qu'on se dit.",
  "L'argent ne fait pas le bonheur. Mais l'épargne, un peu quand même.",
  "Ce que Paloma dépense, Arthur le sait. Et vice versa. C'est l'amour.",
]

function removeMask() {
  document.getElementById('__dm__')?.remove()
}

export default function DailyMessage() {
  const [message, setMessage] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)

  // useLayoutEffect runs synchronously before browser paint — no flash
  useLayoutEffect(() => {
    const seen = sessionStorage.getItem('daily-msg-seen')
    if (seen) {
      removeMask()
      return
    }
    const idx = Math.floor(Math.random() * MESSAGES.length)
    setMessage(MESSAGES[idx])
    // Mask stays until React overlay is rendered; remove it now that the
    // overlay div will be in the DOM after this synchronous re-render.
    removeMask()
  }, [])

  function dismiss() {
    setLeaving(true)
    sessionStorage.setItem('daily-msg-seen', '1')
    setTimeout(() => setMessage(null), 350)
  }

  if (!message) return null

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-8 bg-black"
      style={{
        opacity: leaving ? 0 : 1,
        transition: leaving ? 'opacity 0.35s ease' : 'none',
      }}
    >
      <p className="text-white text-[22px] font-semibold text-center leading-snug"
        style={{
          opacity: leaving ? 0 : 1,
          transform: leaving ? 'translateY(8px)' : 'translateY(0)',
          transition: leaving ? 'opacity 0.3s ease, transform 0.3s ease' : 'none',
        }}
      >
        {message}
      </p>
      <p className="text-[#666] text-[13px] mt-6">Appuyez pour continuer</p>
    </div>
  )
}
