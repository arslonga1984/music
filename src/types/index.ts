// 노래 한 곡 정보
export interface Song {
  id: string
  title: string       // 정답 (제목)
  artist: string      // 정답 (가수)
  youtubeId: string   // YouTube 영상 ID (예: "dQw4w9WgXcQ")
  coverImage?: string // 앨범 커버 이미지 URL
  playSeconds: number // 재생할 초 (기본 5)
}

// 플레이리스트
export interface Playlist {
  id: string
  name: string
  description: string
  songs: Song[]
}

// 정답 기록
export interface AnswerRecord {
  song: Song
  userAnswer: string
  isCorrect: boolean
  isSkipped?: boolean  // 스킵 여부
}

// 게임 상태
export interface GameState {
  playlist: Playlist
  currentRound: number  // 0-based index
  totalRounds: number
  score: number
  answers: AnswerRecord[]
  status: 'playing' | 'answered' | 'finished'
}
