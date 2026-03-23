'use client'

interface PlayButtonProps {
  isReady: boolean
  isPlaying: boolean
  onPlay: () => void
}

// 재생 버튼 + 로딩/재생 상태 표시
export function PlayButton({ isReady, isPlaying, onPlay }: PlayButtonProps) {
  return (
    <button
      onClick={onPlay}
      disabled={!isReady || isPlaying}
      className="
        flex items-center justify-center gap-3
        w-40 h-40 rounded-full
        bg-green-500 hover:bg-green-400
        disabled:bg-gray-600 disabled:cursor-not-allowed
        text-white text-xl font-bold
        transition-all duration-200
        shadow-lg hover:shadow-green-500/30 hover:scale-105
        disabled:scale-100 disabled:shadow-none
      "
    >
      {!isReady ? (
        // 로딩 스피너
        <span className="animate-spin text-4xl">⟳</span>
      ) : isPlaying ? (
        // 재생 중 파동 애니메이션
        <span className="flex gap-1 items-end h-10">
          {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
            <span
              key={i}
              className="w-2 bg-white rounded-full animate-bounce"
              style={{
                height: `${20 + i * 6}px`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </span>
      ) : (
        // 재생 아이콘
        <span className="text-5xl ml-2">▶</span>
      )}
    </button>
  )
}
