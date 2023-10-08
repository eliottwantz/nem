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
		console.log('mount local meeting video component. tracks:', tracks)

		return () => {
			console.log('destroy local meeting video component. tracks:', tracks)
			tracks.videoTrack?.detach()
		}
	})

	$: if (tracks.videoTrack && videoElm) {
		console.log('attaching video track')
		tracks.videoTrack.attach(videoElm)
	}

	$: console.log(tracks)
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
