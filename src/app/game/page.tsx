'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useId, Suspense, useCallback } from 'react'
import type { Playlist } from '@/types'
import { useGameState } from '@/hooks/useGameState'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { useHint } from '@/hooks/useHint'
import { useTimer } from '@/hooks/useTimer'
import { PlayButton } from '@/components/PlayButton'
import { AnswerForm } from '@/components/AnswerForm'
import { RoundResult } from '@/components/RoundResult'
import { HintDisplay } from '@/components/HintDisplay'
import { TimerBar } from '@/components/TimerBar'

const TIMER_SECONDS = 30

function GameContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const playlistId = searchParams.get('playlist') ?? ''
  const playerContainerId = useId().replace(/:/g, '-') + '-yt-player'

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/playlists.json')
      .then((r) => r.json())
      .then((data: Playlist[]) => {
        const found = data.find((p) => p.id === playlistId)
        if (found) setPlaylist(found)
        setLoading(false)
      })
  }, [playlistId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse text-xl">로딩 중...</p>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">플레이리스트를 찾을 수 없어요.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-green-500 rounded-xl text-white"
        >
          홈으로
        </button>
      </div>
    )
  }

  return <GameScreen playlist={playlist} playerContainerId={playerContainerId} />
}

function GameScreen({
  playlist,
  playerContainerId,
}: {
  playlist: Playlist
  playerContainerId: string
}) {
  const router = useRouter()
  const { state, currentSong, submitAnswer, skipRound, nextRound } = useGameState(playlist)
  const { isReady, isPlaying, playSnippet } = useYouTubePlayer(playerContainerId)
  const { hintLevel, showNextHint, resetHint, canShowMore } = useHint()

  // 시간 초과 → 빈 문자열로 오답 처리
  const handleExpire = useCallback(() => {
    submitAnswer('')
  }, [submitAnswer])

  const { timeLeft, isRunning, start, stop, reset } = useTimer({
    seconds: TIMER_SECONDS,
    onExpire: handleExpire,
  })

  // 게임 종료 시 결과 페이지로 이동
  useEffect(() => {
    if (state.status === 'finished') {
      sessionStorage.setItem('quiz-result', JSON.stringify(state))
      router.push('/result')
    }
  }, [state, router])

  // 정답 제출되면 타이머 멈춤
  useEffect(() => {
    if (state.status === 'answered') {
      stop()
    }
  }, [state.status, stop])

  // 스킵 버튼 클릭
  const handleSkip = useCallback(() => {
    stop()
    skipRound()
  }, [stop, skipRound])

  // 재생 버튼: 음악 재생 + 타이머 시작
  const handlePlay = useCallback(() => {
    playSnippet(currentSong.youtubeId, currentSong.playSeconds)
    start()
  }, [playSnippet, currentSong, start])

  // 다음 라운드: 힌트 & 타이머 초기화
  const handleNextRound = useCallback(() => {
    resetHint()
    reset()
    nextRound()
  }, [resetHint, reset, nextRound])

  const lastAnswer = state.answers[state.answers.length - 1]

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 gap-6">
      {/* YouTube 플레이어 컨테이너 - 모바일 재생을 위해 sr-only 사용 (display:none 금지) */}
      <div id={playerContainerId} className="sr-only" />

      {/* 진행도 바 */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{state.playlist.name}</span>
          <span>
            {state.currentRound + 1} / {state.totalRounds}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${((state.currentRound + (state.status === 'answered' ? 1 : 0)) / state.totalRounds) * 100}%`,
            }}
          />
        </div>
        <div className="text-right text-green-400 text-sm mt-1 font-bold">
          점수: {state.score}점
        </div>
      </div>

      {/* 타이머 - 재생 중이거나 타이머가 돌 때만 표시 */}
      {state.status === 'playing' && (
        <TimerBar
          timeLeft={timeLeft}
          totalSeconds={TIMER_SECONDS}
          isRunning={isRunning}
        />
      )}

      {/* 재생 버튼 */}
      <div className="flex flex-col items-center gap-3">
        <PlayButton
          isReady={isReady}
          isPlaying={isPlaying}
          onPlay={handlePlay}
        />
        <p className="text-gray-500 text-sm">
          {!isReady
            ? '플레이어 준비 중...'
            : isPlaying
              ? `재생 중... (${currentSong.playSeconds}초)`
              : isRunning
                ? '타이머가 돌아가고 있어요!'
                : '버튼을 눌러 노래를 들어보세요'}
        </p>
      </div>

      {/* 정답 입력 or 라운드 결과 */}
      {state.status === 'playing' ? (
        <>
          <AnswerForm onSubmit={submitAnswer} disabled={false} />
          <HintDisplay
            title={currentSong.title}
            hintLevel={hintLevel}
            canShowMore={canShowMore}
            onShowHint={showNextHint}
          />
          {/* 스킵 버튼 */}
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-300 text-sm underline underline-offset-2 transition-colors"
          >
            모르겠어요, 스킵할게요 ⏭️
          </button>
        </>
      ) : state.status === 'answered' && lastAnswer ? (
        <RoundResult
          record={lastAnswer}
          onNext={handleNextRound}
          isLast={state.currentRound + 1 >= state.totalRounds}
        />
      ) : null}
    </main>
  )
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
          <p className="text-gray-400 animate-pulse text-xl">로딩 중...</p>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  )
}
