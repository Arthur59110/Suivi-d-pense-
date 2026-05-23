export function AvatarArthur({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgArthur" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#5C5C5C" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </radialGradient>
        <linearGradient id="skinArthur" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0C49A" />
          <stop offset="100%" stopColor="#D9A878" />
        </linearGradient>
        <linearGradient id="hairArthur" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A1F0E" />
          <stop offset="100%" stopColor="#2A1408" />
        </linearGradient>
        <clipPath id="circleArthur">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>

      <circle cx="50" cy="50" r="50" fill="url(#bgArthur)" />

      <g clipPath="url(#circleArthur)">
        {/* Veste varsity verte avec manches blanches */}
        {/* Manches blanches */}
        <path d="M0 100 C0 78 8 70 22 68 L28 100 Z" fill="#E8E5DC" />
        <path d="M100 100 C100 78 92 70 78 68 L72 100 Z" fill="#E8E5DC" />
        {/* Corps de la veste vert */}
        <path d="M22 68 C26 64 35 62 50 62 C65 62 74 64 78 68 L78 100 L22 100 Z" fill="#1F4D2E" />
        {/* Col blanc en V */}
        <path d="M38 62 L46 76 L50 70 L54 76 L62 62 C58 60 54 59 50 59 C46 59 42 60 38 62 Z" fill="#F2EFE5" />
        {/* Bordures vertes du col */}
        <path d="M38 62 L40 65" stroke="#1F4D2E" strokeWidth="0.8" />
        <path d="M62 62 L60 65" stroke="#1F4D2E" strokeWidth="0.8" />
        {/* Liseré blanc sur les manches */}
        <path d="M22 68 L20 75" stroke="#FFFFFF" strokeWidth="0.5" />
        {/* Lettre B */}
        <text x="38" y="83" fontSize="11" fontWeight="900" fill="#F2EFE5" fontFamily="Georgia, serif">B</text>

        {/* Cou */}
        <rect x="42" y="55" width="16" height="10" rx="3" fill="url(#skinArthur)" />
        {/* Ombre du cou */}
        <ellipse cx="50" cy="58" rx="9" ry="2" fill="#C49060" opacity="0.4" />

        {/* Cheveux arrière (couche du bas, derrière les oreilles) */}
        <path d="M28 36 C26 30 26 24 30 20 L70 20 C74 24 74 30 72 36 L72 48 L28 48 Z" fill="url(#hairArthur)" />

        {/* Visage */}
        <ellipse cx="50" cy="42" rx="19" ry="20" fill="url(#skinArthur)" />

        {/* Oreilles */}
        <ellipse cx="30" cy="44" rx="3.5" ry="5" fill="url(#skinArthur)" />
        <ellipse cx="70" cy="44" rx="3.5" ry="5" fill="url(#skinArthur)" />
        <ellipse cx="30" cy="44.5" rx="1.5" ry="2.5" fill="#B07850" opacity="0.5" />
        <ellipse cx="70" cy="44.5" rx="1.5" ry="2.5" fill="#B07850" opacity="0.5" />

        {/* Cheveux dessus — quiff texturé avec mèches */}
        {/* Base du quiff */}
        <path d="M31 32 C31 18 38 12 50 12 C62 12 69 18 69 32 C66 28 60 26 55 28 C52 24 48 24 45 28 C40 26 34 28 31 32 Z" fill="url(#hairArthur)" />
        {/* Mèches du haut, volume */}
        <path d="M36 18 C40 10 46 9 52 11" stroke="#3A1F0E" strokeWidth="6" strokeLinecap="round" />
        <path d="M48 10 C52 8 58 10 62 16" stroke="#3A1F0E" strokeWidth="6" strokeLinecap="round" />
        <path d="M40 14 C44 11 50 11 56 13" stroke="#4A2814" strokeWidth="4" strokeLinecap="round" />
        {/* Mèches individuelles pour texture */}
        <path d="M42 12 C44 9 48 9 49 11" stroke="#2A1408" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M51 11 C53 9 57 10 58 13" stroke="#2A1408" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M38 16 C40 14 42 14 43 16" stroke="#2A1408" strokeWidth="2" strokeLinecap="round" />
        <path d="M58 14 C60 12 63 14 64 17" stroke="#2A1408" strokeWidth="2" strokeLinecap="round" />
        {/* Tempes courtes */}
        <path d="M31 32 C30 36 30 40 31 44" stroke="url(#hairArthur)" strokeWidth="3" strokeLinecap="round" />
        <path d="M69 32 C70 36 70 40 69 44" stroke="url(#hairArthur)" strokeWidth="3" strokeLinecap="round" />
        {/* Highlight sur les cheveux */}
        <path d="M44 13 C47 11 52 11 55 13" stroke="#5A3018" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

        {/* Sourcils épais bruns */}
        <path d="M34 33 Q40 30 45 32.5" stroke="#2A1408" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M55 32.5 Q60 30 66 33" stroke="#2A1408" strokeWidth="2.8" strokeLinecap="round" />

        {/* Yeux */}
        {/* Sclera (blanc) */}
        <ellipse cx="40" cy="40" rx="4" ry="4.2" fill="#FFFFFF" />
        <ellipse cx="60" cy="40" rx="4" ry="4.2" fill="#FFFFFF" />
        {/* Iris brun */}
        <circle cx="40" cy="40.5" r="3" fill="#6B3818" />
        <circle cx="60" cy="40.5" r="3" fill="#6B3818" />
        {/* Pupille */}
        <circle cx="40" cy="40.5" r="1.6" fill="#1A0A04" />
        <circle cx="60" cy="40.5" r="1.6" fill="#1A0A04" />
        {/* Highlight */}
        <circle cx="41" cy="39" r="1" fill="white" />
        <circle cx="61" cy="39" r="1" fill="white" />
        {/* Paupière supérieure */}
        <path d="M35.5 38 Q40 35.8 44.5 38" stroke="#3A2010" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M55.5 38 Q60 35.8 64.5 38" stroke="#3A2010" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Nez */}
        <path d="M48 46 Q50 50 52 46" stroke="#C09060" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <ellipse cx="48.5" cy="48" rx="0.6" ry="0.4" fill="#B07A50" opacity="0.5" />
        <ellipse cx="51.5" cy="48" rx="0.6" ry="0.4" fill="#B07A50" opacity="0.5" />

        {/* Bouche — sourire fermé large */}
        <path d="M40 55 Q50 60 60 55" stroke="#A05238" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Légère lèvre */}
        <path d="M41 55 Q50 57.5 59 55 Q50 56.5 41 55" fill="#C87060" opacity="0.6" />

        {/* Joues rosées */}
        <ellipse cx="34" cy="46" rx="4" ry="3" fill="#E89070" opacity="0.4" />
        <ellipse cx="66" cy="46" rx="4" ry="3" fill="#E89070" opacity="0.4" />
      </g>
    </svg>
  )
}

export function AvatarPaloma({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgPaloma" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#5C5C5C" />
          <stop offset="100%" stopColor="#1A1A1A" />
        </radialGradient>
        <linearGradient id="skinPaloma" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5CCA2" />
          <stop offset="100%" stopColor="#E0B080" />
        </linearGradient>
        <linearGradient id="hairPaloma" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D9B344" />
          <stop offset="50%" stopColor="#C99A2E" />
          <stop offset="100%" stopColor="#B58420" />
        </linearGradient>
        <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EFC960" />
          <stop offset="100%" stopColor="#D4A930" />
        </linearGradient>
        <clipPath id="circlePaloma">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>

      <circle cx="50" cy="50" r="50" fill="url(#bgPaloma)" />

      <g clipPath="url(#circlePaloma)">
        {/* Cheveux longs derrière (couche arrière) */}
        <path d="M22 32 C18 50 17 75 22 100 L42 100 C40 80 38 55 36 38 Z" fill="url(#hairPaloma)" />
        <path d="M78 32 C82 50 83 75 78 100 L58 100 C60 80 62 55 64 38 Z" fill="url(#hairPaloma)" />
        {/* Mèches détaillées sur les côtés */}
        <path d="M24 50 C23 65 23 80 25 95" stroke="#B58420" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M28 55 C27 70 27 85 28 98" stroke="#EFC960" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M76 50 C77 65 77 80 75 95" stroke="#B58420" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M72 55 C73 70 73 85 72 98" stroke="#EFC960" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

        {/* Veste noire structurée */}
        <path d="M28 70 C32 66 40 64 50 64 C60 64 68 66 72 70 L72 100 L28 100 Z" fill="#0A0A0A" />
        {/* Col / revers de la veste */}
        <path d="M38 64 L45 78 L50 72 L55 78 L62 64 C58 62 54 61 50 61 C46 61 42 62 38 64 Z" fill="#F0E8DC" />
        <path d="M38 64 L42 72" stroke="#0A0A0A" strokeWidth="0.8" />
        <path d="M62 64 L58 72" stroke="#0A0A0A" strokeWidth="0.8" />

        {/* Cou */}
        <rect x="42" y="56" width="16" height="11" rx="3" fill="url(#skinPaloma)" />
        <ellipse cx="50" cy="60" rx="9" ry="2" fill="#C8945E" opacity="0.4" />

        {/* Visage */}
        <ellipse cx="50" cy="42" rx="18.5" ry="20" fill="url(#skinPaloma)" />

        {/* Oreilles */}
        <ellipse cx="31" cy="44" rx="3.5" ry="5" fill="url(#skinPaloma)" />
        <ellipse cx="69" cy="44" rx="3.5" ry="5" fill="url(#skinPaloma)" />
        <ellipse cx="31" cy="44.5" rx="1.5" ry="2.5" fill="#C8945E" opacity="0.5" />
        <ellipse cx="69" cy="44.5" rx="1.5" ry="2.5" fill="#C8945E" opacity="0.5" />

        {/* Boucles d'oreilles dorées - petits anneaux */}
        <circle cx="28.5" cy="47.5" r="2.5" fill="none" stroke="#D4AF37" strokeWidth="1.4" />
        <circle cx="71.5" cy="47.5" r="2.5" fill="none" stroke="#D4AF37" strokeWidth="1.4" />
        <circle cx="28.5" cy="46" r="0.4" fill="#D4AF37" />
        <circle cx="71.5" cy="46" r="0.4" fill="#D4AF37" />

        {/* Cheveux dessus avec raie au milieu et volume */}
        <path d="M30 32 C28 18 36 10 50 10 C64 10 72 18 70 32 C66 26 60 24 50 24 C40 24 34 26 30 32 Z" fill="url(#hairPaloma)" />
        {/* Mèches frontales tombant */}
        <path d="M32 25 C34 22 38 21 42 24 L40 38 C36 36 32 34 31 32 Z" fill="url(#hairPaloma)" />
        <path d="M68 25 C66 22 62 21 58 24 L60 38 C64 36 68 34 69 32 Z" fill="url(#hairPaloma)" />
        {/* Raie au milieu */}
        <path d="M50 12 L50 22" stroke="#A07820" strokeWidth="0.8" />
        {/* Highlights blonds clairs */}
        <path d="M36 16 C40 12 46 11 50 12" stroke="url(#hairHighlight)" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <path d="M50 12 C54 11 60 12 64 16" stroke="url(#hairHighlight)" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        {/* Mèches individuelles sur le front */}
        <path d="M38 22 C40 20 42 20 43 22" stroke="#B58420" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M57 22 C58 20 60 20 62 22" stroke="#B58420" strokeWidth="1.5" strokeLinecap="round" />

        {/* Sourcils définis bruns */}
        <path d="M34 32 Q40 28.5 45 31.5" stroke="#7A5520" strokeWidth="2" strokeLinecap="round" />
        <path d="M55 31.5 Q60 28.5 66 32" stroke="#7A5520" strokeWidth="2" strokeLinecap="round" />

        {/* Yeux bleus avec cils marqués */}
        {/* Sclera */}
        <ellipse cx="39" cy="40" rx="4.5" ry="4.5" fill="#FFFFFF" />
        <ellipse cx="61" cy="40" rx="4.5" ry="4.5" fill="#FFFFFF" />
        {/* Iris bleu */}
        <circle cx="39" cy="40.5" r="3.3" fill="#5A8CB8" />
        <circle cx="61" cy="40.5" r="3.3" fill="#5A8CB8" />
        {/* Cercle plus foncé autour de l'iris */}
        <circle cx="39" cy="40.5" r="3.3" fill="none" stroke="#2F5C82" strokeWidth="0.5" />
        <circle cx="61" cy="40.5" r="3.3" fill="none" stroke="#2F5C82" strokeWidth="0.5" />
        {/* Pupille */}
        <circle cx="39" cy="40.5" r="1.6" fill="#0A1F3A" />
        <circle cx="61" cy="40.5" r="1.6" fill="#0A1F3A" />
        {/* Highlight */}
        <circle cx="40.2" cy="39" r="1.1" fill="white" />
        <circle cx="62.2" cy="39" r="1.1" fill="white" />

        {/* Paupière supérieure très marquée (eyeliner + cils) */}
        <path d="M33.5 37.5 Q39 34 44.5 37.5" stroke="#1A0A04" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M55.5 37.5 Q61 34 66.5 37.5" stroke="#1A0A04" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Cils individuels */}
        <path d="M34 37 L33 34.5" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M36.5 35.5 L36 33" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M39 35 L39 32.5" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M41.5 35.5 L42 33" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M44 37 L45 34.5" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M56 37 L55 34.5" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M58.5 35.5 L58 33" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M61 35 L61 32.5" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M63.5 35.5 L64 33" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M66 37 L67 34.5" stroke="#1A0A04" strokeWidth="0.9" strokeLinecap="round" />
        {/* Cils inférieurs subtils */}
        <path d="M37 43 L36.5 44.5" stroke="#2A150A" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M41 43 L41.5 44.5" stroke="#2A150A" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M59 43 L58.5 44.5" stroke="#2A150A" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M63 43 L63.5 44.5" stroke="#2A150A" strokeWidth="0.5" strokeLinecap="round" />

        {/* Nez petit et fin */}
        <path d="M48 47 Q50 50 52 47" stroke="#C08858" strokeWidth="1" strokeLinecap="round" fill="none" />
        <ellipse cx="48.5" cy="49" rx="0.5" ry="0.3" fill="#A87440" opacity="0.5" />
        <ellipse cx="51.5" cy="49" rx="0.5" ry="0.3" fill="#A87440" opacity="0.5" />

        {/* Lèvres pleines roses */}
        {/* Forme générale */}
        <path d="M42 55 Q50 57 58 55 Q50 60.5 42 55 Z" fill="#E07088" />
        {/* Lèvre supérieure plus définie */}
        <path d="M42 55 Q44 53 47 54 Q50 53 53 54 Q56 53 58 55" stroke="#C04868" strokeWidth="0.8" strokeLinecap="round" fill="#E47596" />
        {/* Cupidon */}
        <path d="M48 54 Q50 52.5 52 54" stroke="#C04868" strokeWidth="0.6" strokeLinecap="round" fill="none" />
        {/* Brillant */}
        <path d="M45 55 Q50 56 55 55" stroke="#F8B8C8" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
        {/* Séparation des lèvres */}
        <path d="M44 57 Q50 58 56 57" stroke="#9A3050" strokeWidth="0.5" strokeLinecap="round" />

        {/* Joues rosées */}
        <ellipse cx="34" cy="46" rx="4.5" ry="3.5" fill="#F09098" opacity="0.45" />
        <ellipse cx="66" cy="46" rx="4.5" ry="3.5" fill="#F09098" opacity="0.45" />
      </g>
    </svg>
  )
}
