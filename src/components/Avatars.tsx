export function AvatarArthur({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fond cercle */}
      <circle cx="24" cy="24" r="24" fill="#1A1A1A" />

      {/* Cou */}
      <rect x="19" y="31" width="10" height="7" rx="2" fill="#E8C4A0" />

      {/* Veste noire */}
      <path d="M8 48 C8 38 14 35 24 35 C34 35 40 38 40 48 Z" fill="#1C1C1C" />
      <path d="M22 35 L20 48 L24 44 L28 48 L26 35 Z" fill="#2A2A2A" />

      {/* Visage */}
      <ellipse cx="24" cy="26" rx="10" ry="11" fill="#E8C4A0" />

      {/* Cheveux bouclés bruns foncés */}
      <path d="M14 22 C14 14 18 11 24 11 C30 11 34 14 34 22" fill="#2C1A0E" />
      <circle cx="14.5" cy="21" r="3.5" fill="#2C1A0E" />
      <circle cx="33.5" cy="21" r="3.5" fill="#2C1A0E" />
      <circle cx="16" cy="19" r="3" fill="#33200F" />
      <circle cx="20" cy="13" r="3.5" fill="#2C1A0E" />
      <circle cx="24" cy="12" r="3.5" fill="#2C1A0E" />
      <circle cx="28" cy="13" r="3.5" fill="#2C1A0E" />
      <circle cx="32" cy="19" r="3" fill="#33200F" />
      <circle cx="17" cy="17" r="2.5" fill="#2C1A0E" />
      <circle cx="31" cy="17" r="2.5" fill="#2C1A0E" />

      {/* Sourcils */}
      <path d="M17.5 23 Q20 21.5 22.5 23" stroke="#2C1A0E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25.5 23 Q28 21.5 30.5 23" stroke="#2C1A0E" strokeWidth="1.5" strokeLinecap="round" />

      {/* Yeux */}
      <ellipse cx="20.5" cy="25" rx="2" ry="2.2" fill="#2C2C2C" />
      <ellipse cx="27.5" cy="25" rx="2" ry="2.2" fill="#2C2C2C" />
      <circle cx="21.2" cy="24.3" r="0.6" fill="white" />
      <circle cx="28.2" cy="24.3" r="0.6" fill="white" />

      {/* Sourire */}
      <path d="M20 29.5 Q24 32.5 28 29.5" stroke="#C49070" strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* Légères joues */}
      <circle cx="17.5" cy="28" r="2.5" fill="#F0A080" opacity="0.25" />
      <circle cx="30.5" cy="28" r="2.5" fill="#F0A080" opacity="0.25" />
    </svg>
  )
}

export function AvatarPaloma({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fond cercle */}
      <circle cx="24" cy="24" r="24" fill="#C8A96E" />

      {/* Cou */}
      <rect x="19" y="31" width="10" height="7" rx="2" fill="#F0CCAA" />

      {/* Veste beige */}
      <path d="M8 48 C8 38 14 35 24 35 C34 35 40 38 40 48 Z" fill="#B5956A" />
      <path d="M22 35 L20 48 L24 44 L28 48 L26 35 Z" fill="#C8A97C" />

      {/* Visage */}
      <ellipse cx="24" cy="26" rx="10" ry="11" fill="#F0CCAA" />

      {/* Cheveux blonds — base */}
      <path d="M14 23 C13 13 17 9 24 9 C31 9 35 13 34 23" fill="#C9A84C" />

      {/* Côtés cheveux tombants */}
      <path d="M14 23 C13 26 12 30 13 36" stroke="#C9A84C" strokeWidth="5" strokeLinecap="round" />
      <path d="M34 23 C35 26 36 30 35 36" stroke="#C9A84C" strokeWidth="5" strokeLinecap="round" />

      {/* Mèches */}
      <path d="M15 22 C14 25 13.5 29 14.5 34" stroke="#B8962E" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M33 22 C34 25 34.5 29 33.5 34" stroke="#B8962E" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      {/* Reflets blonds */}
      <path d="M18 10 C20 9 22 8.5 24 9" stroke="#E8CC70" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

      {/* Sourcils fins */}
      <path d="M17.5 23.5 Q20 22 22.5 23" stroke="#A07830" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M25.5 23 Q28 22 30.5 23.5" stroke="#A07830" strokeWidth="1.2" strokeLinecap="round" />

      {/* Yeux avec légère couleur */}
      <ellipse cx="20.5" cy="25.5" rx="2.1" ry="2.2" fill="#6B8FA8" />
      <ellipse cx="27.5" cy="25.5" rx="2.1" ry="2.2" fill="#6B8FA8" />
      <ellipse cx="20.5" cy="25.5" rx="1.4" ry="1.5" fill="#3A5F78" />
      <ellipse cx="27.5" cy="25.5" rx="1.4" ry="1.5" fill="#3A5F78" />
      <circle cx="21.2" cy="24.7" r="0.6" fill="white" />
      <circle cx="28.2" cy="24.7" r="0.6" fill="white" />

      {/* Cils légers */}
      <path d="M18.5 23.5 L17.8 22.5" stroke="#5C4020" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M22.5 23.5 L22.8 22.4" stroke="#5C4020" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M25.5 23.5 L25.2 22.4" stroke="#5C4020" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M29.5 23.5 L30.2 22.5" stroke="#5C4020" strokeWidth="0.8" strokeLinecap="round" />

      {/* Petit sourire / moue légère */}
      <path d="M20.5 30 Q24 31.5 27.5 30" stroke="#C08060" strokeWidth="1.3" strokeLinecap="round" fill="none" />

      {/* Joues rosées */}
      <circle cx="17" cy="28.5" r="2.8" fill="#F0A090" opacity="0.3" />
      <circle cx="31" cy="28.5" r="2.8" fill="#F0A090" opacity="0.3" />

      {/* Boucle d'oreille discrète */}
      <circle cx="14" cy="28" r="1.2" fill="#D4AF60" />
    </svg>
  )
}
