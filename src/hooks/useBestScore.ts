'use client'

import { useCallback } from 'react'

export interface BestScoreRecord {
  score: number
  total: number
  date: string  // ISO 날짜 문자열
}

const storageKey = (playlistId: string) => `best-score-${playlistId}`

// localStorage에서 특정 플레이리스트의 최고 점수 읽기
export function getBestScore(playlistId: string): BestScoreRecord | null {
  try {
    const raw = localStorage.getItem(storageKey(playlistId))
    return raw ? (JSON.parse(raw) as BestScoreRecord) : null
  } catch {
    return null
  }
}

// 점수를 저장하고 신기록인지 반환
export function saveBestScore(
  playlistId: string,
  score: number,
  total: number
): { isNew: boolean; previous: BestScoreRecord | null } {
  const previous = getBestScore(playlistId)
  const isNew = previous === null || score > previous.score

  if (isNew) {
    const record: BestScoreRecord = {
      score,
      total,
      date: new Date().toISOString(),
    }
    try {
      localStorage.setItem(storageKey(playlistId), JSON.stringify(record))
    } catch {
      // localStorage 사용 불가 시 조용히 무시
    }
  }

  return { isNew, previous }
}

// 컴포넌트에서 쓸 수 있는 hook 버전
export function useBestScore(playlistId: string) {
  const save = useCallback(
    (score: number, total: number) => saveBestScore(playlistId, score, total),
    [playlistId]
  )

  const get = useCallback(() => getBestScore(playlistId), [playlistId])

  return { save, get }
}
