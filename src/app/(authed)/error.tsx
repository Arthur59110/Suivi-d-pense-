'use client'

export default function AuthedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
      <h2 className="text-[20px] font-bold text-black">Une erreur est survenue</h2>
      <p className="text-[13px] text-[#8A8A8A] max-w-[320px] break-words">
        {error.message || 'Erreur inconnue'}
      </p>
      <button
        onClick={reset}
        className="mt-2 h-[48px] px-6 rounded-[12px] bg-black text-white text-[15px] font-semibold"
      >
        Réessayer
      </button>
    </div>
  )
}
