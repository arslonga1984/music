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
      <div className="min-h-dvh bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse text-xl">로딩 중...</p>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="min-h-dvh bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">플레이리스트를 찾을 수 없어요.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-green-500 rounded-xl text-white"
          style={{ touchAction: 'manipulation' }}
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

  const handleExpire = useCallback(() => {
    submitAnswer('')
  }, [submitAnswer])

  const { timeLeft, isRunning, start, stop, reset } = useTimer({
    seconds: TIMER_SECONDS,
    onExpire: handleExpire,
  })

  useEffect(() => {
    if (state.status === 'finished') {
      sessionStorage.setItem('quiz-result', JSON.stringify(state))
      router.push('/result')
    }
  }, [state, router])

  useEffect(() => {
    if (state.status === 'answered') {
      stop()
    }
  }, [state.status, stop])

  const handleSkip = useCallback(() => {
    stop()
    skipRound()
  }, [stop, skipRound])

  const handlePlay = useCallback(() => {
    playSnippet(currentSong.youtubeId, currentSong.playSeconds)
    start()
  }, [playSnippet, currentSong, start])

  const handleNextRound = useCallback(() => {
    resetHint()
    reset()
    nextRound()
  }, [resetHint, reset, nextRound])

  const lastAnswer = state.answers[state.answers.length - 1]

  return (
    <main className="min-h-dvh bg-gray-950 text-white flex flex-col overflow-y-auto">
      {/* YouTube 플레이어 컨테이너 */}
      <div
        id={playerContainerId}
        style={{ position: 'fixed', bottom: 0, left: '-2px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
      />

      {/* 상단 고정: 진행도 + 점수 */}
      <div className="w-full px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="truncate mr-2">{state.playlist.name}</span>
            <span className="shrink-0">{state.currentRound + 1} / {state.totalRounds}</span>
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
      </div>

      {/* 타이머 */}
      {state.status === 'playing' && (
        <div className="px-4">
          <div className="max-w-md mx-auto">
            <TimerBar timeLeft={timeLeft} totalSeconds={TIMER_SECONDS} isRunning={isRunning} />
          </div>
        </div>
      )}

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-6">

        {/* 재생 버튼 */}
        <div className="flex flex-col items-center gap-2">
          <PlayButton isReady={isReady} isPlaying={isPlaying} onPlay={handlePlay} />
          <p className="text-gray-500 text-sm text-center">
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
          <div className="w-full max-w-md flex flex-col gap-4">
            <AnswerForm onSubmit={submitAnswer} disabled={false} />
            <HintDisplay
              title={currentSong.title}
              hintLevel={hintLevel}
              canShowMore={canShowMore}
              onShowHint={showNextHint}
            />
            <button
              onClick={handleSkip}
              style={{ touchAction: 'manipulation' }}
              className="text-gray-500 active:text-gray-300 text-sm underline underline-offset-2 transition-colors py-2"
            >
              모르겠어요, 스킵할게요 ⏭️
            </button>
          </div>
        ) : state.status === 'answered' && lastAnswer ? (
          <div className="w-full max-w-md">
            <RoundResult
              record={lastAnswer}
              onNext={handleNextRound}
              isLast={state.currentRound + 1 >= state.totalRounds}
            />
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-gray-950 text-white flex items-center justify-center">
          <p className="text-gray-400 animate-pulse text-xl">로딩 중...</p>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  )
}
