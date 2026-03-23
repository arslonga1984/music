'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTimerOptions {
  seconds: number          // 시작 초
  onExpire: () => void     // 0이 됐을 때 콜백
  autoStart?: boolean      // 마운트 즉시 시작 여부
}

export function useTimer({ seconds, onExpire, autoStart = false }: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const onExpireRef = useRef(onExpire)

  // 콜백이 바뀌어도 항상 최신 함수 참조 유지
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!isRunning) return

    if (timeLeft <= 0) {
      setIsRunning(false)
      onExpireRef.current()
      return
    }

    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [isRunning, timeLeft])

  const start = useCallback(() => {
    setTimeLeft(seconds)
    setIsRunning(true)
  }, [seconds])

  const stop = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(seconds)
  }, [seconds])

  return { timeLeft, isRunning, start, stop, reset }
}
