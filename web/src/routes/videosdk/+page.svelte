<script lang="ts">
	import { PUBLIC_VIDEO_SDK_API_KEY } from '$env/static/public'
	import { dev } from '$app/environment'
	import LocalVideo from '$lib/components/MeetingVideo/LocalVideo.svelte'
	//@ts-expect-error
	import VideoSDKMeeting from '@videosdk.live/rtc-js-prebuilt/dist/index'

	let hasJoined = false

	function initMeeting() {
		hasJoined = true
		const config = {
			debug: dev ? true : false,
			apiKey: PUBLIC_VIDEO_SDK_API_KEY,
			meetingId: 'milkyway',
			name: 'Demo User',
			containerId: 'meetingDiv',

			micEnabled: false,
			webcamEnabled: false,
			participantCanToggleSelfWebcam: true,
			participantCanToggleSelfMic: true,

			chatEnabled: true,
			screenShareEnabled: true,
			screenShareConfig: {
				resolution: 'h720p_15fps',
				optimizationMode: 'text'
			},
			canCreatePoll: true,
			whiteboardEnabled: true,

			theme: 'LIGHT',
			branding: {
				enabled: true,
				logoURL:
					'https://prfhxmmcrvholuplxcad.supabase.co/storage/v1/object/public/assets/logo_400x400.png?t=2023-10-18T13%3A36%3A05.812Z',
				name: 'NEM',
				poweredBy: false
			}
		}

		const meeting = new VideoSDKMeeting()
		meeting.init(config)
	}
</script>

<h1 class="h1 text-center">Video SDK</h1>
{#if hasJoined}
	<div class="h-full w-full" id="meetingDiv"></div>
{:else}
	<div class="grid h-full place-items-center">
		<div class="flex w-max flex-col items-center justify-center">
			<LocalVideo>
				<button class="variant-filled-primary btn w-full" on:click={initMeeting}>
					Join class
				</button>
			</LocalVideo>
		</div>
	</div>
{/if}
