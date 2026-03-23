'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Playlist } from '@/types'
import { getBestScore, type BestScoreRecord } from '@/hooks/useBestScore'

interface PlaylistCardProps {
  playlist: Playlist
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const [best, setBest] = useState<BestScoreRecord | null>(null)

  useEffect(() => {
    setBest(getBestScore(playlist.id))
  }, [playlist.id])

  const isPerfect = best?.score === best?.total

  return (
    <Link
      href={`/game?playlist=${playlist.id}`}
      className="
        block bg-gray-900 border border-gray-800
        hover:border-green-500 hover:bg-gray-800
        rounded-2xl p-6 transition-all duration-200
        group hover:scale-[1.02]
      "
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold group-hover:text-green-400 transition-colors">
            {playlist.name}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{playlist.description}</p>

          {/* 최고 기록 뱃지 */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-600 text-xs">{playlist.songs.length}곡</span>
            {best ? (
              <span
                className={`
                  text-xs px-2 py-0.5 rounded-full font-medium
                  ${isPerfect
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-600'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }
                `}
              >
                {isPerfect ? '🏆' : '🏅'} 최고 {best.score}/{best.total}
              </span>
            ) : (
              <span className="text-xs text-gray-700">아직 기록 없음</span>
            )}
          </div>
        </div>
        <span className="text-3xl ml-4 group-hover:translate-x-1 transition-transform">▶</span>
      </div>
    </Link>
  )
}
