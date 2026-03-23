'use client'

import { useState, useCallback } from 'react'
import type { GameState, Playlist, Song, AnswerRecord } from '@/types'

const ROUND_COUNT = 10  // 한 게임당 문제 수

// Fisher-Yates 셔플: 배열을 랜덤하게 섞어 새 배열 반환
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 플레이리스트에서 랜덤으로 n곡 추출
function pickRandomSongs(songs: Song[], count: number): Song[] {
  const shuffled = shuffle(songs)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

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
  const [state, setState] = useState<GameState>(() => {
    // 게임 시작 시 랜덤으로 곡 선택
    const songs = pickRandomSongs(playlist.songs, ROUND_COUNT)
    return {
      playlist: { ...playlist, songs },
      currentRound: 0,
      totalRounds: songs.length,
      score: 0,
      answers: [],
      status: 'playing',
    }
  })

  const currentSong = state.playlist.songs[state.currentRound]

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
