import { Sk } from '@/components/Skeleton'

export default function EpargneLoading() {
  return (
    <div className="px-4 pt-6 flex flex-col gap-5 animate-fade-in">
      <Sk className="h-6 w-20" />
      <Sk className="h-[90px] w-full rounded-[20px]" />
      {[1, 2, 3].map(i => (
        <div key={i}>
          <Sk className="h-3 w-24 mb-3" />
          <Sk className="h-[100px] w-full rounded-[20px]" />
        </div>
      ))}
    </div>
  )
}
