'use client'
import { useState, useEffect } from 'react'

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

export default function DailyMessage() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const idx = Math.floor(Math.random() * MESSAGES.length)
    setMessage(MESSAGES[idx])
  }, [])

  if (!message) return null

  return (
    <p className="text-[13px] text-[#8A8A8A] italic leading-snug animate-fade-in">
      {message}
    </p>
  )
}
