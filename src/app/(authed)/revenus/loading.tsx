import { Sk } from '@/components/Skeleton'

export default function RevenusLoading() {
  return (
    <div className="px-4 pt-6 flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Sk className="h-6 w-24" />
        <Sk className="h-8 w-20 rounded-[12px]" />
      </div>
      <Sk className="h-[90px] w-full rounded-[20px]" />
      <div className="flex flex-col gap-0 mt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
            <Sk className="h-9 w-9 rounded-[12px] flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Sk className="h-3.5 w-28" />
              <Sk className="h-3 w-16" />
            </div>
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
