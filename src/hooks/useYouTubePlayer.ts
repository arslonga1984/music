'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// YouTube IFrame API 타입 선언
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          height?: string
          width?: string
          videoId?: string
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: (event: { target: YTPlayer }) => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YTPlayer {
  loadVideoById: (videoId: string, startSeconds?: number) => void
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number) => void
  destroy: () => void
}

interface UseYouTubePlayerReturn {
  isReady: boolean
  isPlaying: boolean
  playSnippet: (videoId: string, seconds: number) => void
}

// YouTube IFrame API 스크립트를 한 번만 로드하는 유틸리티
let apiLoaded = false
let apiReady = false
const readyCallbacks: (() => void)[] = []

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) {
      resolve()
      return
    }

    readyCallbacks.push(resolve)

    if (!apiLoaded) {
      apiLoaded = true
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)

      window.onYouTubeIframeAPIReady = () => {
        apiReady = true
        readyCallbacks.forEach((cb) => cb())
        readyCallbacks.length = 0
      }
    }
  })
}

export function useYouTubePlayer(containerId: string): UseYouTubePlayerReturn {
  const playerRef = useRef<YTPlayer | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    loadYouTubeApi().then(() => {
      // 숨겨진 플레이어 div가 있어야 Player를 생성할 수 있음
      const player = new window.YT.Player(containerId, {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,   // iOS 인라인 재생 필수
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            playerRef.current = player
            setIsReady(true)
          },
          onStateChange: (event) => {
            const playing = event.data === window.YT.PlayerState.PLAYING
            setIsPlaying(playing)
          },
        },
      })
    })

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      playerRef.current?.destroy()
    }
  }, [containerId])

  // videoId의 앞 seconds초만 재생하고 자동으로 멈춤
  const playSnippet = useCallback(
    (videoId: string, seconds: number) => {
      if (!playerRef.current) return

      if (timerRef.current) clearTimeout(timerRef.current)

      // loadVideoById는 자동으로 재생 시작 — 별도 playVideo() 불필요
      playerRef.current.loadVideoById(videoId, 0)
      setIsPlaying(true)

      timerRef.current = setTimeout(() => {
        playerRef.current?.pauseVideo()
        setIsPlaying(false)
      }, seconds * 1000)
    },
    []
  )

  return { isReady, isPlaying, playSnippet }
}
