import { Home, ShoppingCart, Smile, UtensilsCrossed, Car, Wifi, Heart, ShoppingBag, Plane, MoreHorizontal, type LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  loyer: Home,
  courses: ShoppingCart,
  loisirs: Smile,
  restaurants: UtensilsCrossed,
  transport: Car,
  factures: Wifi,
  sante: Heart,
  shopping: ShoppingBag,
  voyages: Plane,
  autre: MoreHorizontal,
}

interface Props {
  category: string
  size?: number
  containerSize?: number
  inverted?: boolean
}

export default function CategoryIcon({ category, size = 20, containerSize = 40, inverted = false }: Props) {
  const Icon = ICON_MAP[category] ?? MoreHorizontal
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
