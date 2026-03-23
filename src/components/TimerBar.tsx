'use client'

interface TimerBarProps {
  timeLeft: number
  totalSeconds: number
  isRunning: boolean
}

// 남은 비율에 따라 색상 변경: 초록 → 노랑 → 빨강
function getColor(ratio: number) {
  if (ratio > 0.5) return { bar: 'bg-green-500', text: 'text-green-400' }
  if (ratio > 0.25) return { bar: 'bg-yellow-400', text: 'text-yellow-400' }
  return { bar: 'bg-red-500', text: 'text-red-400' }
}

export function TimerBar({ timeLeft, totalSeconds, isRunning }: TimerBarProps) {
  const ratio = timeLeft / totalSeconds
  const { bar, text } = getColor(ratio)

  return (
    <div className="w-full max-w-md flex items-center gap-3">
      {/* 숫자 */}
      <span className={`text-2xl font-black w-10 text-center tabular-nums ${text} ${timeLeft <= 5 && isRunning ? 'animate-pulse' : ''}`}>
        {timeLeft}
      </span>

      {/* 진행 바 */}
      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${bar} transition-all duration-1000 ease-linear`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      <span className="text-gray-600 text-xs w-10 text-right">/{totalSeconds}s</span>
    </div>
  )
}
