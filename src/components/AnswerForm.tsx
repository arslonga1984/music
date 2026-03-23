'use client'

import { useState, useRef } from 'react'

interface AnswerFormProps {
  onSubmit: (answer: string) => void
  disabled: boolean
}

export function AnswerForm({ onSubmit, disabled }: AnswerFormProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSubmit(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        enterKeyHint="send"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="제목 또는 가수 이름 입력"
        className="
          flex-1 px-4 py-3 rounded-xl
          bg-gray-800 border border-gray-600
          text-white placeholder-gray-500
          focus:outline-none focus:border-green-500
          disabled:opacity-40 disabled:cursor-not-allowed
          text-base transition-colors
        "
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        style={{ touchAction: 'manipulation' }}
        className="
          px-5 py-3 rounded-xl
          bg-green-500 active:bg-green-400
          disabled:bg-gray-700 disabled:cursor-not-allowed
          text-white font-semibold text-sm
          transition-colors shrink-0
        "
      >
        제출
      </button>
    </form>
  )
}
