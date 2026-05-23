import Image from 'next/image'

interface AvatarProps {
  size?: number
}

export function AvatarArthur({ size = 48 }: AvatarProps) {
  return (
    <div
      className="rounded-full overflow-hidden bg-[#F0E0D0] flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src="/avatars/arthur.png"
        alt="Arthur"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  )
}

export function AvatarPaloma({ size = 48 }: AvatarProps) {
  return (
    <div
      className="rounded-full overflow-hidden bg-[#F5DEB8] flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src="/avatars/paloma.png"
        alt="Paloma"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  )
}
