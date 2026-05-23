import { Briefcase, Laptop, HandCoins, Gift, RotateCcw, MoreHorizontal, type LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  salaire: Briefcase,
  freelance: Laptop,
  aides: HandCoins,
  cadeau: Gift,
  remboursement: RotateCcw,
  autre: MoreHorizontal,
}

interface Props {
  source: string
  size?: number
  containerSize?: number
  inverted?: boolean
}

export default function RevenueIcon({ source, size = 20, containerSize = 40, inverted = false }: Props) {
  const Icon = ICON_MAP[source] ?? MoreHorizontal
  return (
    <div
      className="flex items-center justify-center rounded-[10px] flex-shrink-0"
      style={{
        width: containerSize,
        height: containerSize,
        background: inverted ? '#000000' : '#F7F7F7',
      }}
    >
      <Icon size={size} color={inverted ? '#ffffff' : '#000000'} strokeWidth={1.5} />
    </div>
  )
}
