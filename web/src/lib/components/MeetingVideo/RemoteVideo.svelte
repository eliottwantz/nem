<script lang="ts">
	import ParticipantIcon from '$lib/icons/ParticipantIcon.svelte'
	import { onMount } from 'svelte'
	import type { MeetingVideoTracks } from '.'

	export let tracks: MeetingVideoTracks
	export let videoEnabled: boolean | undefined = undefined

	let videoElm: HTMLVideoElement
	let audioElem: HTMLAudioElement

	onMount(() => {
		tracks.videoTrack?.attach(videoElm)
		tracks.audioTrack?.attach(audioElem)
		console.log('mount remote meeting video component. tracks:', tracks)

		return () => {
			console.log('destroy remote meeting video component. tracks:', tracks)
			tracks.videoTrack?.detach()
			tracks.audioTrack?.detach()
		}
	})

	$: if (tracks.videoTrack && videoElm) tracks.videoTrack.attach(videoElm)
	$: if (tracks.audioTrack && audioElem) tracks.audioTrack.attach(audioElem)

	$: console.log(tracks)

	$: if (tracks.videoTrack && videoElm) {
		if (tracks.videoTrack.isMuted) {
			console.log('muted')
			videoElm.muted = true
		} else {
			console.log('unmuted')
			videoElm.muted = false
		}
	}
</script>

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
