<script lang="ts">
	import ParticipantIcon from '$lib/icons/ParticipantIcon.svelte'
	import { Mic, MicOff, Video, VideoOff } from 'lucide-svelte'
	import { onMount } from 'svelte'

	export let audioEnabled = false
	export let videoEnabled = false
	let videoElm: HTMLVideoElement
	let audioStream: MediaStream | undefined

	onMount(async () => {
		if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
		} else {
			console.log('Camera and microphone not supported in this browser')
			alert('Camera and microphone not supported in this browser')
			return
		}
	})

	async function startStream(constraints: MediaStreamConstraints) {
		const stream = await navigator.mediaDevices.getUserMedia(constraints)
		videoElm.srcObject = stream
	}

	async function toggleAudio() {
		let text = audioEnabled ? 'closing microphone' : 'opening microphone'
		console.log(text)

		if (!audioEnabled) {
			audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
		} else {
			if (audioStream) {
				audioStream.getTracks().forEach((t) => t.stop())
			}
		}

		audioEnabled = !audioEnabled
	}

	async function toggleVideo() {
		let text = videoEnabled ? 'closing camera' : 'opening camera'
		console.log(text)

		if (!videoEnabled) {
			await startStream({ video: true })
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
			<div class="absolute bottom-4 left-0 grid aspect-video w-full place-items-center">
				<ParticipantIcon class="h-[70%] max-w-[100%]" />
			</div>
		{/if}
		<div id="devices" class="absolute bottom-3 flex w-full justify-center gap-x-4">
			<button
				on:click={toggleVideo}
				class="btn-icon h-8 w-8 {videoEnabled
					? 'variant-filled-primary'
					: 'variant-filled-surface'}"
				title="Toggle camera"
			>
				{#if videoEnabled}
					<Video />
				{:else}
					<VideoOff />
				{/if}
			</button>
			<button
				on:click={toggleAudio}
				class="btn-icon h-8 w-8 {audioEnabled
					? 'variant-filled-primary'
					: 'variant-filled-surface'}"
				title="Toggle microphone"
			>
				{#if audioEnabled}
					<Mic />
				{:else}
					<MicOff />
				{/if}
			</button>
		</div>
	</div>
	<slot />
</div>
