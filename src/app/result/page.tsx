'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GameState } from '@/types'
import { saveBestScore, getBestScore, type BestScoreRecord } from '@/hooks/useBestScore'

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<GameState | null>(null)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [bestScore, setBestScore] = useState<BestScoreRecord | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('quiz-result')
    if (!raw) {
      router.push('/')
      return
    }

    const parsed: GameState = JSON.parse(raw)
    setResult(parsed)

    // 점수 저장 후 신기록 여부 확인
    const { isNew } = saveBestScore(
      parsed.playlist.id,
      parsed.score,
      parsed.totalRounds
    )
    setIsNewRecord(isNew)
    setBestScore(getBestScore(parsed.playlist.id))
  }, [router])

  if (!result) return null

  const percentage = Math.round((result.score / result.totalRounds) * 100)

  const emoji =
    percentage === 100
      ? '🏆'
      : percentage >= 80
        ? '🎉'
        : percentage >= 50
          ? '😊'
          : '😢'

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 gap-8">

      {/* 신기록 배너 */}
      {isNewRecord && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 rounded-2xl px-6 py-3 text-center animate-bounce">
          🏅 새로운 최고 기록!
        </div>
      )}

      {/* 최종 점수 */}
      <div className="text-center">
        <div className="text-7xl mb-4">{emoji}</div>
        <h1 className="text-4xl font-black mb-2">
          {result.score} / {result.totalRounds}
        </h1>
        <p className="text-gray-400 text-lg">{percentage}% 정답률</p>
        <p className="text-gray-500 text-sm mt-1">{result.playlist.name}</p>
      </div>

      {/* 최고 기록 표시 */}
      {bestScore && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-center w-full max-w-md">
          <p className="text-gray-500 text-xs mb-1">🏆 최고 기록</p>
          <p className="text-white text-2xl font-bold">
            {bestScore.score} / {bestScore.total}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {formatDate(bestScore.date)} 달성
          </p>
        </div>
      )}

      {/* 정답 목록 */}
      <div className="w-full max-w-md flex flex-col gap-2">
        <h2 className="text-gray-400 text-sm font-semibold mb-1">정답 확인</h2>
        {result.answers.map((record, i) => (
          <div
            key={record.song.id}
            className={`
              flex items-center gap-3 p-4 rounded-xl
              ${record.isCorrect
                ? 'bg-green-900/30 border border-green-800'
                : 'bg-red-900/20 border border-red-900'
              }
            `}
          >
            <span className="text-xl">{record.isCorrect ? '✅' : '❌'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">
                {i + 1}. {record.song.title}
              </p>
              <p className="text-gray-400 text-xs">{record.song.artist}</p>
              {!record.isCorrect && record.userAnswer && (
                <p className="text-red-400 text-xs mt-0.5">
                  내 답: &ldquo;{record.userAnswer}&rdquo;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors"
        >
          다른 플레이리스트
        </button>
        <button
          onClick={() => router.push(`/game?playlist=${result.playlist.id}`)}
          className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold transition-colors"
        >
          다시 도전 🔄
        </button>
      </div>
    </main>
  )
}
