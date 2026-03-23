'use client'

import { useState, useCallback } from 'react'

// 힌트 레벨: 0=없음, 1=글자 수, 2=첫 글자 공개
export type HintLevel = 0 | 1 | 2
const MAX_HINT_LEVEL: HintLevel = 2

export function useHint() {
  const [hintLevel, setHintLevel] = useState<HintLevel>(0)

  // 다음 힌트 레벨로 올리기
  const showNextHint = useCallback(() => {
    setHintLevel((prev) => (prev < MAX_HINT_LEVEL ? ((prev + 1) as HintLevel) : prev))
  }, [])

  // 라운드 넘어갈 때 힌트 초기화
  const resetHint = useCallback(() => {
    setHintLevel(0)
  }, [])

  const canShowMore = hintLevel < MAX_HINT_LEVEL

  return { hintLevel, showNextHint, resetHint, canShowMore }
}
