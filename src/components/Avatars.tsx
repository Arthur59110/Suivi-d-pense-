export function AvatarArthur({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#D4956A" />

      {/* Veste varsity verte */}
      <path d="M10 80 C10 62 22 56 40 56 C58 56 70 62 70 80 Z" fill="#2D6B3F" />
      {/* Col blanc */}
      <path d="M32 56 L36 68 L40 62 L44 68 L48 56 C45 54 42 53 40 53 C38 53 35 54 32 56 Z" fill="#FFFFFF" />
      {/* Lettres B sur la veste */}
      <text x="40" y="76" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="serif">B</text>

      {/* Cou */}
      <rect x="33" y="47" width="14" height="10" rx="3" fill="#F0C090" />

      {/* Visage */}
      <ellipse cx="40" cy="38" rx="16" ry="17" fill="#F2C28A" />

      {/* Oreilles */}
      <ellipse cx="24" cy="38" rx="3.5" ry="4" fill="#F0C090" />
      <ellipse cx="56" cy="38" rx="3.5" ry="4" fill="#F0C090" />

      {/* Cheveux bruns — volume sur le dessus et côtés */}
      <path d="M24 30 C24 16 30 11 40 11 C50 11 56 16 56 30" fill="#3D1F0A" />
      {/* Mèches du dessus légèrement dressées */}
      <path d="M30 15 C32 10 35 8 40 8 C45 8 48 10 50 15" fill="#4A2510" />
      <path d="M32 12 C34 8 37 6 40 6 C43 6 46 8 48 12" fill="#3D1F0A" />
      {/* Côtés */}
      <path d="M24 30 C23 25 23 20 25 17" stroke="#3D1F0A" strokeWidth="4" strokeLinecap="round" />
      <path d="M56 30 C57 25 57 20 55 17" stroke="#3D1F0A" strokeWidth="4" strokeLinecap="round" />

      {/* Sourcils bruns */}
      <path d="M28 30 Q33 27.5 37 29.5" stroke="#3D1F0A" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 29.5 Q47 27.5 52 30" stroke="#3D1F0A" strokeWidth="2" strokeLinecap="round" />

      {/* Yeux bruns */}
      <ellipse cx="33" cy="35" rx="3.5" ry="3.8" fill="#fff" />
      <ellipse cx="47" cy="35" rx="3.5" ry="3.8" fill="#fff" />
      <ellipse cx="33" cy="35.5" rx="2.4" ry="2.6" fill="#6B3A1F" />
      <ellipse cx="47" cy="35.5" rx="2.4" ry="2.6" fill="#6B3A1F" />
      <ellipse cx="33" cy="35.5" rx="1.4" ry="1.6" fill="#2A1008" />
      <ellipse cx="47" cy="35.5" rx="1.4" ry="1.6" fill="#2A1008" />
      <circle cx="34" cy="34.2" r="0.9" fill="white" />
      <circle cx="48" cy="34.2" r="0.9" fill="white" />

      {/* Nez */}
      <path d="M38 40 Q40 43 42 40" stroke="#D4956A" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Grand sourire */}
      <path d="M30 46 Q40 54 50 46" stroke="#C07050" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M31 47 Q40 53 49 47 Q40 56 31 47 Z" fill="#E8806A" />
      <path d="M32 48 Q40 52 48 48" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Joues rosées */}
      <circle cx="26" cy="40" r="4" fill="#F09070" opacity="0.3" />
      <circle cx="54" cy="40" r="4" fill="#F09070" opacity="0.3" />
    </svg>
  )
}

export function AvatarPaloma({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#C8A97A" />

      {/* Veste noire */}
      <path d="M10 80 C10 62 22 56 40 56 C58 56 70 62 70 80 Z" fill="#1A1A1A" />
      {/* Col blanc */}
      <path d="M33 56 L36 66 L40 61 L44 66 L47 56 C44 54 42 53 40 53 C38 53 36 54 33 56 Z" fill="#F0F0F0" />

      {/* Cou */}
      <rect x="33" y="47" width="14" height="10" rx="3" fill="#F2C09A" />

      {/* Cheveux blonds — derrière (couche du bas) */}
      <path d="M22 35 C20 45 19 55 20 65" stroke="#C8A030" strokeWidth="8" strokeLinecap="round" />
      <path d="M58 35 C60 45 61 55 60 65" stroke="#C8A030" strokeWidth="8" strokeLinecap="round" />

      {/* Visage */}
      <ellipse cx="40" cy="38" rx="16" ry="17" fill="#F5C89A" />

      {/* Oreilles */}
      <ellipse cx="24" cy="38" rx="3.5" ry="4" fill="#F2C09A" />
      <ellipse cx="56" cy="38" rx="3.5" ry="4" fill="#F2C09A" />

      {/* Boucles d'oreilles dorées */}
      <circle cx="21.5" cy="41" r="3" fill="none" stroke="#D4AF37" strokeWidth="1.8" />
      <circle cx="58.5" cy="41" r="3" fill="none" stroke="#D4AF37" strokeWidth="1.8" />

      {/* Cheveux blonds — dessus */}
      <path d="M24 32 C24 16 30 10 40 10 C50 10 56 16 56 32" fill="#D4A830" />
      <path d="M28 14 C31 9 35 7 40 7 C45 7 49 9 52 14" fill="#E0B840" />
      {/* Raie au milieu */}
      <path d="M40 7 L40 16" stroke="#C09820" strokeWidth="1.5" />
      {/* Mèches */}
      <path d="M24 32 C23 28 22.5 22 24 18" stroke="#C09820" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M56 32 C57 28 57.5 22 56 18" stroke="#C09820" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Reflets */}
      <path d="M30 12 C33 9 37 8 40 8" stroke="#F0D060" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />

      {/* Sourcils fins et bien dessinés */}
      <path d="M27 29 Q32 26.5 36.5 28.5" stroke="#8B6520" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M43.5 28.5 Q48 26.5 53 29" stroke="#8B6520" strokeWidth="1.8" strokeLinecap="round" />

      {/* Yeux bleus avec cils */}
      <ellipse cx="33" cy="35" rx="3.8" ry="4" fill="#fff" />
      <ellipse cx="47" cy="35" rx="3.8" ry="4" fill="#fff" />
      <ellipse cx="33" cy="35.5" rx="2.6" ry="2.8" fill="#5B8DB8" />
      <ellipse cx="47" cy="35.5" rx="2.6" ry="2.8" fill="#5B8DB8" />
      <ellipse cx="33" cy="35.5" rx="1.5" ry="1.6" fill="#1A3D5C" />
      <ellipse cx="47" cy="35.5" rx="1.5" ry="1.6" fill="#1A3D5C" />
      <circle cx="34.2" cy="34" r="1" fill="white" />
      <circle cx="48.2" cy="34" r="1" fill="white" />
      {/* Cils */}
      <path d="M29.5 31.5 L28.2 29.8" stroke="#2A1A0A" strokeWidth="1" strokeLinecap="round" />
      <path d="M33 31 L33 29.2" stroke="#2A1A0A" strokeWidth="1" strokeLinecap="round" />
      <path d="M36.2 31.5 L37.5 29.8" stroke="#2A1A0A" strokeWidth="1" strokeLinecap="round" />
      <path d="M43.8 31.5 L42.5 29.8" stroke="#2A1A0A" strokeWidth="1" strokeLinecap="round" />
      <path d="M47 31 L47 29.2" stroke="#2A1A0A" strokeWidth="1" strokeLinecap="round" />
      <path d="M50.2 31.5 L51.5 29.8" stroke="#2A1A0A" strokeWidth="1" strokeLinecap="round" />

      {/* Nez */}
      <path d="M38 41 Q40 44 42 41" stroke="#D4906A" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Lèvres roses */}
      <path d="M31 47 Q40 55 49 47" fill="#E87090" />
      <path d="M31 47 Q35 44 40 44.5 Q45 44 49 47 Q40 49 31 47 Z" fill="#F08090" />
      <path d="M33 47 Q40 49 47 47" stroke="#D05070" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <path d="M35 44.8 Q40 43.5 45 44.8" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />

      {/* Joues rosées */}
      <circle cx="26" cy="40" r="4.5" fill="#F090A0" opacity="0.28" />
      <circle cx="54" cy="40" r="4.5" fill="#F090A0" opacity="0.28" />
    </svg>
  )
}
