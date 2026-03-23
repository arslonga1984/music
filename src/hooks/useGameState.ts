'use client'

import { useState, useCallback } from 'react'
import type { GameState, Playlist, AnswerRecord } from '@/types'

// 정답 판정: 대소문자, 공백 무시하고 제목 또는 가수 이름 비교
function checkAnswer(input: string, title: string, artist: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/\s/g, '')
  const normalizedInput = normalize(input)
  return (
    normalizedInput === normalize(title) ||
    normalizedInput === normalize(artist)
  )
}

export function useGameState(playlist: Playlist) {
  const [state, setState] = useState<GameState>({
    playlist,
    currentRound: 0,
    totalRounds: playlist.songs.length,
    score: 0,
    answers: [],
    status: 'playing',
  })

  const currentSong = playlist.songs[state.currentRound]

  // 정답 제출
  const submitAnswer = useCallback(
    (userAnswer: string) => {
      if (state.status !== 'playing') return

      const isCorrect = checkAnswer(
        userAnswer,
        currentSong.title,
        currentSong.artist
      )

      const record: AnswerRecord = {
        song: currentSong,
        userAnswer,
        isCorrect,
      }

      setState((prev) => ({
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        answers: [...prev.answers, record],
        status: 'answered',
      }))
    },
    [state.status, currentSong]
  )

  // 스킵: 오답 처리하고 다음으로
  const skipRound = useCallback(() => {
    if (state.status !== 'playing') return

    const record: AnswerRecord = {
      song: currentSong,
      userAnswer: '',
      isCorrect: false,
      isSkipped: true,
    }

    setState((prev) => ({
      ...prev,
      answers: [...prev.answers, record],
      status: 'answered',
    }))
  }, [state.status, currentSong])

  // 다음 라운드로
  const nextRound = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentRound + 1
      if (nextIndex >= prev.totalRounds) {
        return { ...prev, status: 'finished' }
      }
      return { ...prev, currentRound: nextIndex, status: 'playing' }
    })
  }, [])

  return { state, currentSong, submitAnswer, skipRound, nextRound }
}
