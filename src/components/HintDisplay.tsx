'use client'

import type { HintLevel } from '@/hooks/useHint'

interface HintDisplayProps {
  title: string
  hintLevel: HintLevel
  canShowMore: boolean
  onShowHint: () => void
}

// 제목을 힌트 레벨에 맞게 변환
// 레벨 1: 글자 수만 보여줌  → "_ _ _ _ _"
// 레벨 2: 첫 글자 공개      → "D _ _ _ _"
function buildHintText(title: string, level: HintLevel): string {
  return title
    .split('')
    .map((char, i) => {
      // 공백은 그대로 유지
      if (char === ' ') return ' '
      // 레벨 2: 첫 글자 공개
      if (level >= 2 && i === 0) return char
      // 레벨 1 이상: 나머지는 _
      return '_'
    })
    .join(' ')
    .replace(/  /g, '   ') // 공백 구분 개선
}

export function HintDisplay({
  title,
  hintLevel,
  canShowMore,
  onShowHint,
}: HintDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* 힌트 텍스트 */}
      {hintLevel > 0 && (
        <div className="bg-gray-800 rounded-2xl px-6 py-4 text-center">
          <p className="text-gray-500 text-xs mb-2">
            {hintLevel === 1 ? '💡 힌트 1: 글자 수' : '💡 힌트 2: 첫 글자'}
          </p>
          <p className="text-white text-2xl font-mono tracking-widest">
            {buildHintText(title, hintLevel)}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            {title.replace(/ /g, '').length}글자
          </p>
        </div>
      )}

      {/* 힌트 버튼 */}
      <button
        onClick={onShowHint}
        disabled={!canShowMore}
        className="
          px-4 py-2 rounded-xl text-sm font-medium
          border border-yellow-600 text-yellow-400
          hover:bg-yellow-600/20
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all
        "
      >
        {hintLevel === 0
          ? '💡 힌트 보기'
          : hintLevel === 1
            ? '💡 힌트 더 보기 (첫 글자)'
            : '✅ 힌트 최대'}
      </button>
    </div>
  )
}
