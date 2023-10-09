import type { AudioTrack, VideoTrack } from 'livekit-client'

export type MeetingVideoTracks = { videoTrack: VideoTrack | null; audioTrack: AudioTrack | null }
