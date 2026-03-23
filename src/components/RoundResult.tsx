'use client'

import type { AnswerRecord } from '@/types'

interface RoundResultProps {
  record: AnswerRecord
  onNext: () => void
  isLast: boolean
}

// 라운드 정답/오답 결과 표시
export function RoundResult({ record, onNext, isLast }: RoundResultProps) {
  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      {/* 정답/오답 뱃지 */}
      <div
        className={`
          text-4xl font-bold px-6 py-2 rounded-full
          ${record.isCorrect
            ? 'text-green-400 bg-green-400/10'
            : record.isSkipped
              ? 'text-yellow-400 bg-yellow-400/10'
              : 'text-red-400 bg-red-400/10'
          }
        `}
      >
        {record.isCorrect ? '🎉 정답!' : record.isSkipped ? '⏭️ 스킵' : '😢 오답'}
      </div>

      {/* 정답 공개 */}
      <div className="text-center bg-gray-800 rounded-2xl p-5 w-full max-w-md">
        <p className="text-gray-400 text-sm mb-1">정답</p>
        <p className="text-white text-2xl font-bold">{record.song.title}</p>
        <p className="text-gray-400 text-lg">{record.song.artist}</p>
        {!record.isCorrect && record.userAnswer && (
          <p className="text-red-400 text-sm mt-2">
            내 답: <span className="italic">&ldquo;{record.userAnswer}&rdquo;</span>
          </p>
        )}
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={onNext}
        className="
          px-8 py-3 rounded-xl
          bg-green-500 hover:bg-green-400
          text-white font-bold text-lg
          transition-all hover:scale-105
        "
      >
        {isLast ? '결과 보기 →' : '다음 문제 →'}
      </button>
    </div>
  )
}
