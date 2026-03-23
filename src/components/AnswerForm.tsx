'use client'

import { useState, useRef, useEffect } from 'react'

interface AnswerFormProps {
  onSubmit: (answer: string) => void
  disabled: boolean
}

// 정답 입력 폼 - disabled 시 잠금
export function AnswerForm({ onSubmit, disabled }: AnswerFormProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 활성화될 때 자동 포커스
  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSubmit(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? '다음 라운드를 기다리세요...' : '제목 또는 가수 이름 입력'}
        className="
          flex-1 px-4 py-3 rounded-xl
          bg-gray-800 border border-gray-600
          text-white placeholder-gray-500
          focus:outline-none focus:border-green-500
          disabled:opacity-40 disabled:cursor-not-allowed
          text-sm transition-colors
        "
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="
          px-5 py-3 rounded-xl
          bg-green-500 hover:bg-green-400
          disabled:bg-gray-700 disabled:cursor-not-allowed
          text-white font-semibold text-sm
          transition-colors
        "
      >
        제출
      </button>
    </form>
  )
}
