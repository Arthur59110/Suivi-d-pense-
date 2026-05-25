import { Sk } from '@/components/Skeleton'

export default function DepensesLoading() {
  return (
    <div className="px-4 pt-6 flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Sk className="h-6 w-28" />
        <Sk className="h-8 w-24 rounded-[12px]" />
      </div>
      {/* filtre catégories */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map(i => <Sk key={i} className="h-8 w-20 flex-shrink-0 rounded-full" />)}
      </div>
      {/* rows */}
      <div className="flex flex-col gap-0 mt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
            <Sk className="h-9 w-9 rounded-[12px] flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Sk className="h-3.5 w-28" />
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
  )
}
