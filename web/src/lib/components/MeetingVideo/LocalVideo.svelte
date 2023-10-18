<script lang="ts">
	import ParticipantIcon from '$lib/icons/ParticipantIcon.svelte'
	import { onMount } from 'svelte'
	import CameraIcon from '$lib/icons/CameraIcon.svelte'
	import CameraOffIcon from '$lib/icons/CameraOffIcon.svelte'
	import MicrophoneIcon from '$lib/icons/MicrophoneIcon.svelte'
	import MicrophoneMutedIcon from '$lib/icons/MicrophoneMutedIcon.svelte'

	export let audioEnabled = false
	export let videoEnabled = false
	let videoDevice: MediaDeviceInfo | undefined = undefined
	let audioDevice: MediaDeviceInfo | undefined = undefined

	let audioDevices: MediaDeviceInfo[] = []
	let videoDevices: MediaDeviceInfo[] = []

	let videoElm: HTMLVideoElement
	let audioElem: HTMLAudioElement

	onMount(async () => {
		if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
		} else {
			console.log('Camera and microphone not supported in this browser')
			alert('Camera and microphone not supported in this browser')
			return
		}
		const devices = await navigator.mediaDevices.enumerateDevices()
		videoDevices = devices.filter((d) => d.kind === 'videoinput')
		videoDevice = videoDevices[0]
		audioDevices = devices.filter((d) => d.kind === 'audioinput')
		audioDevice = audioDevices[0]
	})

	async function startStream(constraints: MediaStreamConstraints) {
		const stream = await navigator.mediaDevices.getUserMedia(constraints)
		videoElm.srcObject = stream
	}

	async function toggleAudio() {
		audioEnabled = !audioEnabled
	}

	async function toggleVideo() {
		let text = videoEnabled ? 'closing camera' : 'opening camera'
		console.log(text)

		if (!videoEnabled) {
			await startStream({
				video: {
					deviceId: {
						exact: videoDevice?.deviceId
					}
				}
			})
		} else {
			const stream = videoElm.srcObject
			if (stream) {
				const tracks = (stream as MediaStream).getTracks()
				tracks.forEach((t) => t.stop())
			}
			videoElm.srcObject = null
		}

		videoEnabled = !videoEnabled
	}
</script>

<div id="prejoin" class="w-[min(100%,30rem)] space-y-2 p-2">
	<div class="relative aspect-video overflow-hidden rounded-lg bg-black">
		<audio bind:this={audioElem} />
		<!-- svelte-ignore a11y-media-has-caption -->
		<video
			bind:this={videoElm}
			autoplay
			unselectable="on"
			playsinline
			disablepictureinpicture
			class="pointer-events-none aspect-video w-full object-cover"
		/>
		{#if videoEnabled === false}
			<div class="absolute left-0 top-0 grid aspect-video w-full place-items-center">
				<ParticipantIcon class="h-[70%] max-w-[100%]" />
			</div>
		{/if}
	</div>
	<div id="devices" class="flex gap-4">
		<div class="flex w-1/2">
			<button
				on:click={toggleVideo}
				class="variant-filled-surface btn flex select-none gap-1 p-2"
				title="Toggle camera"
			>
				{#if videoEnabled}
					<CameraIcon class="h-6 w-6" />
				{:else}
					<CameraOffIcon class="h-6 w-6" />
				{/if}
				Camera
			</button>
			<select
				on:change={() => startStream({ video: { deviceId: videoDevice?.deviceId } })}
				class="select"
				name="video"
				bind:value={videoDevice}
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
				{#if audioEnabled}
					<MicrophoneIcon class="h-6 w-6" />
				{:else}
					<MicrophoneMutedIcon class="h-6 w-6" />
				{/if}
				Microphone
			</button>
			<select class="select" name="audio" bind:value={audioDevice}>
				{#each audioDevices as device}
					<option value={device}>{device.label}</option>
				{/each}
			</select>
		</div>
	</div>
	<slot />
</div>
