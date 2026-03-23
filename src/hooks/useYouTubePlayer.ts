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
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
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
  const pendingPlayRef = useRef(false)  // 모바일: 버퍼링 후 재생 대기 여부
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    loadYouTubeApi().then(() => {
      const player = new window.YT.Player(containerId, {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,  // iOS 인라인 재생 필수
        },
        events: {
          onReady: () => {
            playerRef.current = player
            setIsReady(true)
          },
          onStateChange: (event) => {
            const { PLAYING, BUFFERING } = window.YT.PlayerState
            // 모바일에서 BUFFERING 후 playVideo() 호출
            if (event.data === BUFFERING && pendingPlayRef.current) {
              player.playVideo()
            }
            if (event.data === PLAYING) {
              pendingPlayRef.current = false
              setIsPlaying(true)
            } else {
              setIsPlaying(false)
            }
          },
        },
      })
    })

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      playerRef.current?.destroy()
    }
  }, [containerId])

  const playSnippet = useCallback(
    (videoId: string, seconds: number) => {
      if (!playerRef.current) return

      if (timerRef.current) clearTimeout(timerRef.current)

      // loadVideoById + playVideo 조합: 데스크탑/모바일 모두 대응
      pendingPlayRef.current = true
      playerRef.current.loadVideoById(videoId, 0)
      playerRef.current.playVideo()

      timerRef.current = setTimeout(() => {
        pendingPlayRef.current = false
        playerRef.current?.pauseVideo()
        setIsPlaying(false)
      }, seconds * 1000)
    },
    []
  )

  return { isReady, isPlaying, playSnippet }
}
