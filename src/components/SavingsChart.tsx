'use client'

interface Point {
  date: string
  value: number
}

function smoothPath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return ''
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`
  let d = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1]
    const curr = coords[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
  }
  return d
}

export default function SavingsChart({ points }: { points: Point[] }) {
  if (points.length < 2) return null

  const W = 300
  const H = 80
  const PAD_X = 0
  const PAD_TOP = 6
  const PAD_BOTTOM = 4

  const minVal = Math.min(0, ...points.map(p => p.value))
  const maxVal = Math.max(...points.map(p => p.value))
  const range = maxVal - minVal || 1

  const coords = points.map((p, i) => ({
    x: PAD_X + (i / (points.length - 1)) * (W - PAD_X * 2),
    y: PAD_TOP + (1 - (p.value - minVal) / range) * (H - PAD_TOP - PAD_BOTTOM),
  }))

  const linePath = smoothPath(coords)
  const first = coords[0]
  const last = coords[coords.length - 1]
  const areaPath = `${linePath} L${last.x},${H} L${first.x},${H} Z`

  return (
    <div className="rounded-[16px] bg-[#F7F7F7] overflow-hidden px-1 pt-3 pb-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[90px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sg-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.00" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sg-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#000000"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
