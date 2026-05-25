import { Sk } from '@/components/Skeleton'

export default function AnalyseLoading() {
  return (
    <div className="px-4 pt-6 flex flex-col gap-5 animate-fade-in">
      {/* toggle mois/année */}
      <Sk className="h-10 w-full rounded-[14px]" />
      {/* stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <Sk className="h-[90px] rounded-[20px]" />
        <Sk className="h-[90px] rounded-[20px]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Sk className="h-[90px] rounded-[20px]" />
        <Sk className="h-[90px] rounded-[20px]" />
      </div>
      {/* graphique */}
      <div>
        <Sk className="h-3 w-24 mb-3" />
        <Sk className="h-[180px] w-full rounded-[20px]" />
      </div>
      {/* répartition */}
      <div>
        <Sk className="h-3 w-20 mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <Sk className="h-[80px] rounded-[20px]" />
          <Sk className="h-[80px] rounded-[20px]" />
        </div>
      </div>
      {/* catégories */}
      <div>
        <Sk className="h-3 w-28 mb-3" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
            <Sk className="h-9 w-9 rounded-[12px] flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Sk className="h-3.5 w-20" />
              <Sk className="h-2 w-full rounded-full" />
            </div>
            <Sk className="h-4 w-12 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
