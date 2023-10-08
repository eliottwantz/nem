<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { PUBLIC_LIVEKIT_WS_URL } from '$env/static/public'
	import { fetchers, safeFetch } from '$lib/api'
	import { latestWSPayload } from '$lib/api/ws'
	import { drawerStoreIds } from '$lib/components/Drawer'
	import LocalVideo from '$lib/components/MeetingVideo/LocalVideo.svelte'
	import RemoteVideo from '$lib/components/MeetingVideo/RemoteVideo.svelte'
	import CameraIcon from '$lib/icons/CameraIcon.svelte'
	import CameraOffIcon from '$lib/icons/CameraOffIcon.svelte'
	import ChatIcon from '$lib/icons/ChatIcon.svelte'
	import ExitIcon from '$lib/icons/ExitIcon.svelte'
	import MicrophoneIcon from '$lib/icons/MicrophoneIcon.svelte'
	import MicrophoneMutedIcon from '$lib/icons/MicrophoneMutedIcon.svelte'
	import ScreenShareIcon from '$lib/icons/ScreenShareIcon.svelte'
	import UsersIcon from '$lib/icons/UsersIcon.svelte'
	import { chatStore } from '$lib/stores/chatStore'
	import { currentClassDetailsStore, currentLiveKitRoom } from '$lib/stores/currentClass'
	import { userStore } from '$lib/stores/user'
	import { getDrawerStore, getToastStore } from '@skeletonlabs/skeleton'
	import {
		LocalAudioTrack,
		LocalParticipant,
		LocalTrackPublication,
		LocalVideoTrack,
		Participant,
		RemoteAudioTrack,
		RemoteParticipant,
		RemoteTrack,
		RemoteTrackPublication,
		RemoteVideoTrack,
		Room,
		RoomEvent,
		Track,
		TrackPublication,
		createLocalAudioTrack,
		createLocalTracks,
		createLocalVideoTrack
	} from 'livekit-client'
	import { onDestroy, onMount } from 'svelte'
	import type { Unsubscriber } from 'svelte/store'

	export let data
	console.log('token', data.token)
	const toastStore = getToastStore()
	const drawerStore = getDrawerStore()
	currentClassDetailsStore.set(data.classDetails)

	let devices: MediaDeviceInfo[] = []
	let audioDevices: MediaDeviceInfo[] = []
	let videoDevices: MediaDeviceInfo[] = []
	let logs: string[] = []
	let participants = 1
	$: console.log('participants:', participants)
	$: console.log('TRACKS REMOTE;', $currentLiveKitRoom.remoteMediaTracks)
	$: if ($currentLiveKitRoom.videoDevice) selectVideoDevice($currentLiveKitRoom.videoDevice)
	$: if ($currentLiveKitRoom.audioDevice) selectAudioDevice($currentLiveKitRoom.audioDevice)
	$: console.log('video device', $currentLiveKitRoom.videoDevice)
	$: console.log('audio device', $currentLiveKitRoom.audioDevice)
	$: console.log('video enabled', $currentLiveKitRoom.videoEnabled)
	$: console.log('audio enabled', $currentLiveKitRoom.audioEnabled)
	$: console.log('unread messages', $chatStore.unreadMessages)
	$: console.log('$currentLiveKitRoom', $currentLiveKitRoom)

	let unsub: Unsubscriber
	onMount(async () => {
		if (!$currentLiveKitRoom.room) {
			console.log('onMount class')
			if (!data.token) {
				toastStore.trigger({
					message: 'Could not get sfu join token from server',
					background: 'bg-error-500'
				})
				return
			}
			currentLiveKitRoom.update((r) => ({ ...r, connectToken: data.token! }))
			const currentRoom = new Room({
				adaptiveStream: true,
				dynacast: true
			})
			currentRoom.prepareConnection(PUBLIC_LIVEKIT_WS_URL, $currentLiveKitRoom.connectToken)
			logs = [...logs, 'prepared room']
			currentLiveKitRoom.update((r) => ({ ...r, room: currentRoom }))
		}
		devices = await Room.getLocalDevices()
		devices.forEach((device) => {
			if (device.kind === 'videoinput') {
				videoDevices = [...videoDevices, device]
			} else if (device.kind === 'audioinput') {
				audioDevices = [...audioDevices, device]
			}
		})
		currentLiveKitRoom.update((r) => ({
			...r,
			videoDevice: videoDevices[0],
			audioDevice: audioDevices[0]
		}))

		// if (!$currentLiveKitRoom.videoTrack && !$currentLiveKitRoom.audioTrack) {
		// 	const tracks = await createLocalTracks()
		// 	tracks.forEach(async (t) => {
		// 		if (t instanceof LocalVideoTrack) {
		// 			// await t.mute()
		// 			console.log('video track', t)
		// 			currentLiveKitRoom.update((r) => ({ ...r, videoTrack: t, videoEnabled: true }))
		// 		} else if (t instanceof LocalAudioTrack) {
		// 			// await t.mute()
		// 			console.log('audio track', t)
		// 			currentLiveKitRoom.update((r) => ({ ...r, audioTrack: t, audioEnabled: true }))
		// 		}
		// 	})
		// }

		unsub = latestWSPayload.subscribe((p) => {
			if (p.action === 'classEnded') {
				if (data.user.role === 'student') {
					toastStore.trigger({
						message: 'The teacher has ended the class.',
						background: 'bg-success-500'
					})
				}
				goto(data.disconnectUrl)
			}
		})
	})

	onDestroy(() => {
		if (unsub) unsub()
	})

	async function joinRoom() {
		console.log('joining room')
		if (!$currentLiveKitRoom.room) {
			$currentLiveKitRoom.room = new Room({
				adaptiveStream: true,
				dynacast: true
			})
		}

		// set up event listeners
		$currentLiveKitRoom.room
			.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
			.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
			.on(RoomEvent.TrackMuted, handleTrackMuted)
			.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
			.on(RoomEvent.Disconnected, handleDisconnect)
			.on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished)
			.on(RoomEvent.ParticipantConnected, (p) => {
				console.log('participant connected', p)
				participants += 1
			})
			.on(RoomEvent.ParticipantDisconnected, (p) => {
				console.log('participant disconnected', p)
				participants -= 1
			})
			.on(RoomEvent.AudioPlaybackStatusChanged, (p) => {
				console.log('***audio playback status changed***', p)
				if (!$currentLiveKitRoom.room!.canPlaybackAudio) {
					// UI is necessary.
					const button = document.createElement('button')
					button.onclick = () => {
						// startAudio *must* be called in an click/tap handler.
						$currentLiveKitRoom.room!.startAudio().then(() => {
							console.log('started audio!!!')
							// successful, UI can be removed now
							button.remove()
						})
					}
				}
			})
		try {
			await $currentLiveKitRoom.room.connect(
				PUBLIC_LIVEKIT_WS_URL,
				$currentLiveKitRoom.connectToken
			)
			currentLiveKitRoom.update((r) => ({ ...r, connected: true }))
		} catch (error) {
			console.log(error)
			if (error instanceof Error) logs = [...logs, error.message]
			location.href = data.disconnectUrl
			return
		}
		console.log('connected to room', $currentLiveKitRoom.room.name)
		logs = [...logs, 'connected to room']
		if ($currentLiveKitRoom.room.numParticipants > 0)
			participants = $currentLiveKitRoom.room.numParticipants
		if (!$currentLiveKitRoom.videoEnabled && !$currentLiveKitRoom.audioEnabled) {
			return
		}
		const tracks = [$currentLiveKitRoom.audioTrack, $currentLiveKitRoom.videoTrack]
		for (const t of tracks) {
			if (!t) continue
			console.log('publising track:', t)
			logs = [...logs, `publising track ${t.kind}`]
			await $currentLiveKitRoom.room.localParticipant.publishTrack(t)
			logs = [...logs, `published track ${t.kind}`]
		}
		logs = [...logs, 'published tracks']
		console.log('tracks published')
	}

	function handleTrackSubscribed(
		track: RemoteTrack,
		publication: RemoteTrackPublication,
		participant: RemoteParticipant
	) {
		console.log('track subscribed')
		logs = [...logs, `got track ${track.kind}`]
		if (track.kind === Track.Kind.Video) {
			console.log('added video track to map')
			$currentLiveKitRoom.remoteMediaTracks = {
				...$currentLiveKitRoom.remoteMediaTracks,
				[participant.identity]: {
					...$currentLiveKitRoom.remoteMediaTracks[participant.identity],
					videoTrack: track as RemoteVideoTrack
				}
			}
		} else if (track.kind === Track.Kind.Audio) {
			console.log('added audio track to map')
			$currentLiveKitRoom.remoteMediaTracks = {
				...$currentLiveKitRoom.remoteMediaTracks,
				[participant.identity]: {
					...$currentLiveKitRoom.remoteMediaTracks[participant.identity],
					audioTrack: track as RemoteAudioTrack
				}
			}
		}
		logs = [...logs, `attached track`]
	}

	function handleTrackUnsubscribed(
		track: RemoteTrack,
		publication: RemoteTrackPublication,
		participant: RemoteParticipant
	) {
		console.log('track unsubscribed')
		// remove tracks from all attached elements
		track.stop()
		track.mediaStreamTrack.stop()
		delete $currentLiveKitRoom.remoteMediaTracks[participant.identity]
		$currentLiveKitRoom.remoteMediaTracks = $currentLiveKitRoom.remoteMediaTracks
	}

	function handleTrackMuted(publication: TrackPublication, participant: Participant) {}

	function handleLocalTrackUnpublished(
		track: LocalTrackPublication,
		participant: LocalParticipant
	) {
		console.log('local track unpublished')
	}

	function handleActiveSpeakerChange(speakers: Participant[]) {
		if (speakers.length > 0) console.log('someone is speaking', speakers)
		else console.log('no one is speaking')
		// show UI indicators when participant is speaking
	}

	function handleDisconnect() {
		console.log('disconnected from room')
	}

	async function setupLocalVideo() {
		$currentLiveKitRoom.videoTrack = await createLocalVideoTrack({
			deviceId: $currentLiveKitRoom.videoDevice?.deviceId
		})
	}

	async function setupLocalAudio() {
		$currentLiveKitRoom.audioTrack = await createLocalAudioTrack({
			deviceId: $currentLiveKitRoom.audioDevice?.deviceId
		})
	}

	async function selectVideoDevice(device: MediaDeviceInfo) {
		$currentLiveKitRoom.videoDevice = device
		if (!$currentLiveKitRoom.videoTrack) return
		if (
			$currentLiveKitRoom.videoTrack.mediaStreamTrack.getSettings().deviceId ===
			device.deviceId
		)
			return
		console.log('connection video device', device.label)
		$currentLiveKitRoom.videoTrack.setDeviceId(device.deviceId).then((success) => {
			if (!success)
				toastStore.trigger({
					message: 'Could not set video device',
					background: 'bg-error-500'
				})
		})
	}
	async function selectAudioDevice(device: MediaDeviceInfo) {
		$currentLiveKitRoom.audioDevice = device
		if (!$currentLiveKitRoom.audioTrack) return
		if (
			$currentLiveKitRoom.audioTrack.mediaStreamTrack.getSettings().deviceId ===
			device.deviceId
		)
			return
		console.log('connection audio device', device.label)
		$currentLiveKitRoom.audioTrack.setDeviceId(device.deviceId).then((success) => {
			if (!success)
				toastStore.trigger({
					message: 'Could not set audio device',
					background: 'bg-error-500'
				})
		})
	}

	async function toggleAudio() {
		let text = $currentLiveKitRoom.audioTrack ? 'muting' : 'unmutting'
		console.log(text)

		if (!$currentLiveKitRoom.audioTrack) {
			console.log('opening microphone with local audio track setup')
			await setupLocalAudio()
			if ($currentLiveKitRoom.connected)
				await $currentLiveKitRoom.room!.localParticipant.setMicrophoneEnabled(true)
		} else {
			$currentLiveKitRoom.audioTrack.stop()

			if ($currentLiveKitRoom.connected) {
				await $currentLiveKitRoom.room!.localParticipant.setMicrophoneEnabled(
					!$currentLiveKitRoom.audioEnabled
				)
			}

			$currentLiveKitRoom.audioTrack = null
		}
		$currentLiveKitRoom.audioEnabled = !$currentLiveKitRoom.audioEnabled
	}

	async function toggleVideo() {
		let text = $currentLiveKitRoom.videoTrack ? 'closing camera' : 'opening camera'
		console.log(text)
		if (!$currentLiveKitRoom.videoTrack) {
			console.log('opening camera with local video track setup')
			await setupLocalVideo()
			if ($currentLiveKitRoom.connected)
				await $currentLiveKitRoom.room!.localParticipant.setCameraEnabled(true)
		} else {
			$currentLiveKitRoom.videoTrack.stop()
			$currentLiveKitRoom.videoTrack.detach()

			if ($currentLiveKitRoom.connected) {
				await $currentLiveKitRoom.room!.localParticipant.setCameraEnabled(
					!$currentLiveKitRoom.videoEnabled
				)
			}

			$currentLiveKitRoom.videoTrack = null
		}
		$currentLiveKitRoom.videoEnabled = !$currentLiveKitRoom.videoEnabled
	}

	async function shareScreen() {
		if (!$currentLiveKitRoom.connected) return

		if (!$currentLiveKitRoom.screenShareEnabled) {
			console.log('sharing screen')
		} else {
			console.log('stop sharing screen')
		}
		$currentLiveKitRoom.screenShareEnabled = !$currentLiveKitRoom.screenShareEnabled
		await $currentLiveKitRoom.room!.localParticipant.setScreenShareEnabled(
			$currentLiveKitRoom.screenShareEnabled
		)
	}

	async function leaveClass() {
		$currentLiveKitRoom.videoTrack?.stop()
		$currentLiveKitRoom.videoTrack?.detach()
		$currentLiveKitRoom.audioTrack?.stop()
		$currentLiveKitRoom.audioTrack?.detach()
		if ($currentLiveKitRoom.room) {
			$currentLiveKitRoom.room.localParticipant.setCameraEnabled(false)
			$currentLiveKitRoom.room.localParticipant.setMicrophoneEnabled(false)
			for (const t of $currentLiveKitRoom.room.localParticipant.tracks.values()) {
				if (t.track) await $currentLiveKitRoom.room.localParticipant.unpublishTrack(t.track)
			}
			await $currentLiveKitRoom.room.disconnect()
		}
		if ($userStore?.role === 'teacher') {
			await safeFetch(
				fetchers.teacherService(fetch, $page.data.session!).endClass({
					classId: data.classDetails.class.id
				})
			)
		} else {
			await safeFetch(
				fetchers.studentService(fetch, $page.data.session!).leaveClass({
					classId: data.classDetails.class.id
				})
			)
		}
		currentLiveKitRoom.reset()
		currentClassDetailsStore.set(null)
		location.pathname = data.disconnectUrl
	}

	function openChat() {
		drawerStore.open({
			id: drawerStoreIds.chat,
			meta: {
				classDetails: data.classDetails
			},
			position: 'right'
		})
		chatStore.resetUnreadMessages()
	}
</script>

{#if $currentLiveKitRoom.connected}
	<div class="flex h-full flex-col">
		<div id="topBar" class="flex w-full items-center justify-center px-2 pt-2">
			<h1>Current class: {data.classDetails.class.id}</h1>
		</div>
		<div class="relative flex-1 p-2">
			<div class="absolute bottom-0 right-0 h-[auto] w-[min(100%,15rem)]">
				<LocalVideo
					tracks={{
						audioTrack: $currentLiveKitRoom.audioTrack,
						videoTrack: $currentLiveKitRoom.videoTrack
					}}
					videoEnabled={$currentLiveKitRoom.videoEnabled}
				/>
			</div>
			<div
				id="meeting"
				class="grid grid-cols-{Math.round(participants / 2)} grid-rows-{Math.round(
					participants / 2
				)}"
			>
				{#each Object.entries($currentLiveKitRoom.remoteMediaTracks) as [id, tracks]}
					<RemoteVideo {tracks} />
				{/each}
			</div>
		</div>
		<div id="controls" class="flex w-full items-center justify-center gap-2 p-2">
			<div class="flex">
				<button
					on:click={toggleVideo}
					class="variant-filled-surface btn flex select-none gap-1 p-2"
					title="Toggle camera"
				>
					{#if $currentLiveKitRoom.videoEnabled}
						<CameraIcon class="h-6 w-6" />
					{:else}
						<CameraOffIcon class="h-6 w-6" />
					{/if}
				</button>
				<select
					class="select max-w-[4rem]"
					name="video"
					bind:value={$currentLiveKitRoom.videoDevice}
				>
					{#each videoDevices as device}
						<option value={device}>{device.label}</option>
					{/each}
				</select>
			</div>
			<div class="flex">
				<button
					on:click={toggleAudio}
					class="variant-filled-surface btn flex select-none gap-1 p-2"
					title="Toggle microphone"
				>
					{#if $currentLiveKitRoom.audioEnabled}
						<MicrophoneIcon class="h-6 w-6" />
					{:else}
						<MicrophoneMutedIcon class="h-6 w-6" />
					{/if}
				</button>
				<select
					class="select max-w-[4rem]"
					name="audio"
					bind:value={$currentLiveKitRoom.audioDevice}
				>
					{#each audioDevices as device}
						<option value={device}>{device.label}</option>
					{/each}
				</select>
			</div>
			<button class="btn p-0" title="Participants in class">
				<UsersIcon class="h-6 w-6" />
			</button>
			<button class="btn relative inline-block p-0" title="Open chat box" on:click={openChat}>
				{#if chatStore.unreadMessages > 0}
					<span
						class="variant-filled-warning badge-icon absolute -top-1 left-1 z-10 h-4 w-4"
					>
						{chatStore.unreadMessages}
					</span>
				{/if}
				<ChatIcon class="h-6 w-6" />
			</button>
			<button on:click={shareScreen} class="btn p-0" title="Share screen">
				<ScreenShareIcon class="h-6 w-6" />
			</button>
			<button on:click={leaveClass} class="btn bg-error-500 text-white" title="Leave class">
				<ExitIcon class="h-6 w-6 fill-white" />
				{#if $userStore?.role === 'teacher'}
					<span>End class</span>
				{:else}
					<span>Leave</span>
				{/if}
			</button>
		</div>
	</div>
{/if}

{#if !$currentLiveKitRoom.connected}
	<div class="grid h-full place-items-center">
		<div id="prejoin" class="w-[min(100%,30rem)] space-y-2 p-2">
			<LocalVideo
				tracks={{
					audioTrack: $currentLiveKitRoom.audioTrack,
					videoTrack: $currentLiveKitRoom.videoTrack
				}}
				videoEnabled={$currentLiveKitRoom.videoEnabled}
			/>
			<div id="devices" class="flex gap-4">
				<div class="flex w-1/2">
					<button
						on:click={toggleVideo}
						class="variant-filled-surface btn flex select-none gap-1 p-2"
						title="Toggle camera"
					>
						{#if $currentLiveKitRoom.videoEnabled}
							<CameraIcon class="h-6 w-6" />
						{:else}
							<CameraOffIcon class="h-6 w-6" />
						{/if}
						Camera
					</button>
					<select
						class="select"
						name="video"
						bind:value={$currentLiveKitRoom.videoDevice}
					>
						{#each videoDevices as device}
							<option value={device}>{device.label}</option>
						{/each}
					</select>
				</div>
				<div class="flex w-1/2">
					<button
						on:click={toggleAudio}
						class="variant-filled-surface btn flex select-none gap-1 p-2"
						title="Toggle microphone"
					>
						{#if $currentLiveKitRoom.audioEnabled}
							<MicrophoneIcon class="h-6 w-6" />
						{:else}
							<MicrophoneMutedIcon class="h-6 w-6" />
						{/if}
						Microphone
					</button>
					<select
						class="select"
						name="audio"
						bind:value={$currentLiveKitRoom.audioDevice}
					>
						{#each audioDevices as device}
							<option value={device}>{device.label}</option>
						{/each}
					</select>
				</div>
			</div>
			<button class="variant-filled-primary btn w-full" on:click={joinRoom}>
				Join class
			</button>
		</div>
	</div>
{/if}

<p>Logs</p>
{#each logs as log}
	<p>{log}</p>
{/each}
