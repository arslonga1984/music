'use client'

interface PlayButtonProps {
  isReady: boolean
  isPlaying: boolean
  onPlay: () => void
}

export function PlayButton({ isReady, isPlaying, onPlay }: PlayButtonProps) {
  return (
    <button
      onClick={onPlay}
      disabled={!isReady || isPlaying}
      style={{ touchAction: 'manipulation' }}
      className="
        flex items-center justify-center
        w-32 h-32 sm:w-40 sm:h-40 rounded-full
        bg-green-500 active:bg-green-400
        disabled:bg-gray-600 disabled:cursor-not-allowed
        text-white text-xl font-bold
        transition-all duration-150
        shadow-lg active:shadow-green-500/30 active:scale-95
        disabled:scale-100 disabled:shadow-none
        select-none
      "
    >
      {!isReady ? (
        <span className="animate-spin text-4xl">⟳</span>
      ) : isPlaying ? (
        <span className="flex gap-1 items-end h-10">
          {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
            <span
              key={i}
              className="w-2 bg-white rounded-full animate-bounce"
              style={{ height: `${20 + i * 6}px`, animationDelay: `${delay}s` }}
            />
          ))}
        </span>
      ) : (
        <span className="text-5xl ml-2">▶</span>
      )}
    </button>
  )
}
