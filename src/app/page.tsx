import type { Playlist } from '@/types'
import { PlaylistCard } from '@/components/PlaylistCard'

async function getPlaylists(): Promise<Playlist[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/data/playlists.json`,
    { cache: 'no-store' }
  )
  return res.json()
}

export default async function HomePage() {
  const playlists = await getPlaylists()

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
          🎵 뮤직 퀴즈
        </h1>
        <p className="text-gray-400 text-lg">
          노래 첫 <span className="text-green-400 font-bold">5초</span>를 듣고 제목을 맞춰보세요!
        </p>
      </div>

      {/* 플레이리스트 카드 목록 */}
      <div className="grid gap-4 w-full max-w-lg">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </main>
  )
}
