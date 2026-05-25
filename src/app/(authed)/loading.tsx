import { Sk } from '@/components/Skeleton'

export default function HomeLoading() {
  return (
    <div className="px-4 pt-6 flex flex-col gap-5 animate-fade-in">
      {/* month selector */}
      <div className="flex items-center justify-between">
        <Sk className="h-5 w-32" />
        <Sk className="h-5 w-16" />
      </div>

      {/* budget card */}
      <Sk className="h-[120px] w-full rounded-[20px]" />

      {/* par personne */}
      <div>
        <Sk className="h-3 w-24 mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <Sk className="h-[120px] rounded-[20px]" />
          <Sk className="h-[120px] rounded-[20px]" />
        </div>
      </div>

      {/* par catégorie */}
      <div>
        <Sk className="h-3 w-24 mb-3" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Sk className="h-9 w-9 rounded-[12px] flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Sk className="h-3 w-20" />
                <Sk className="h-2 w-full rounded-full" />
              </div>
              <Sk className="h-4 w-12 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* dépenses récentes */}
      <div>
        <Sk className="h-3 w-32 mb-3" />
        <div className="flex flex-col gap-0">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
              <Sk className="h-9 w-9 rounded-[12px] flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Sk className="h-3.5 w-24" />
                <Sk className="h-3 w-16" />
              </div>
              <Sk className="h-5 w-5 rounded-full flex-shrink-0" />
              <div className="flex flex-col items-end gap-1.5">
                <Sk className="h-3.5 w-14" />
                <Sk className="h-3 w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
