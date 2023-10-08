import type { ClassDetails } from '$lib/api/api.gen'
import type { MeetingVideoTracks } from '$lib/components/MeetingVideo'
import type { LocalAudioTrack, LocalVideoTrack, Room } from 'livekit-client'
import { writable } from 'svelte/store'

export const currentClassDetailsStore = writable<ClassDetails | null>(null)

export type LiveKitRoomInfo = {
	room: Room | null
	connected: boolean
	connectToken: string
	audioEnabled: boolean
	videoEnabled: boolean
	screenShareEnabled: boolean
	chatOpened: boolean
	videoTrack: LocalVideoTrack | null
	audioTrack: LocalAudioTrack | null
	videoDevice: MediaDeviceInfo | undefined
	audioDevice: MediaDeviceInfo | undefined
	remoteMediaTracks: Record<string, MeetingVideoTracks>
}

const defaults: LiveKitRoomInfo = {
	room: null,
	connected: false,
	connectToken: '',
	audioEnabled: false,
	videoEnabled: false,
	screenShareEnabled: false,
	chatOpened: false,
	videoTrack: null,
	audioTrack: null,
	videoDevice: undefined,
	audioDevice: undefined,
	remoteMediaTracks: {}
}

function createlikekitRoom() {
	const currentLiveKitRoom = writable<LiveKitRoomInfo>(JSON.parse(JSON.stringify(defaults)))

	function reset() {
		currentLiveKitRoom.set(JSON.parse(JSON.stringify(defaults)))
	}

	return {
		...currentLiveKitRoom,
		reset
	}
}

export const currentLiveKitRoom = createlikekitRoom()
