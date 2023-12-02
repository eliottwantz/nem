<script lang="ts">
	import { dev } from '$app/environment'
	import { page } from '$app/stores'
	import { PUBLIC_VIDEO_SDK_API_KEY } from '$env/static/public'
	import LocalVideo from '$lib/components/MeetingVideo/LocalVideo.svelte'
	import { getPublicName } from '$lib/utils/initials'
	//@ts-expect-error
	import VideoSDKMeeting from '@videosdk.live/rtc-js-prebuilt/dist/index'

	export let data
	let hasJoined = false
	let audioEnabled = false
	let videoEnabled = false

	let isTeacher = data.user.role === 'teacher' && data.class.teacher.id === data.user.id

	function initMeeting() {
		hasJoined = true
		const config = {
			debug: dev ? true : false,
			apiKey: PUBLIC_VIDEO_SDK_API_KEY,
			meetingId: data.class.id,
			name: getPublicName(data.user),
			containerId: 'meetingDiv',

			micEnabled: audioEnabled,
			webcamEnabled: videoEnabled,
			participantCanToggleSelfWebcam: true,
			participantCanToggleSelfMic: true,
			raiseHandEnabled: true,
			chatEnabled: true,
			screenShareEnabled: true,
			whiteboardEnabled: true,

			joinWithoutUserInteraction: true,
			joinScreen: {
				visible: false,
				title: data.class.name,
				meetingUrl: window.location.href
			},
			notificationSoundEnabled: false,
			redirectOnLeave: `${$page.url.origin}${data.disconnectUrl}`,
			audioConfig: {
				quality: 'high_quality' //speech_low_quality , high_quality
			},
			maxResolution: 'hd',
			videoConfig: {
				resolution: 'h360p_w640p', //h360p_w640p, h540p_w960p, h1080p_w1920p
				optimizationMode: 'motion', // text , detail
				multiStream: false
			},
			screenShareConfig: {
				resolution: 'h720p_15fps',
				optimizationMode: 'text'
			},
			layout: {
				type: 'GRID', // "SPOTLIGHT" | "SIDEBAR" | "GRID"
				priority: 'SPEAKER', // "SPEAKER" | "PIN",
				gridSize: 5
			},
			theme: 'LIGHT',
			branding: {
				enabled: true,
				logoURL:
					'https://prfhxmmcrvholuplxcad.supabase.co/storage/v1/object/public/assets/logo_400x400.png?t=2023-10-18T13%3A36%3A05.812Z',
				name: 'NEM',
				poweredBy: false
			},
			hls: {
				enabled: false
			},
			livestream: {
				enabled: false
			},
			recording: {
				enabled: false
			},
			permissions: {
				askToJoin: false,
				removeParticipant: isTeacher,
				canCreatePoll: isTeacher,
				endMeeting: isTeacher,
				pin: isTeacher,
				changeLayout: isTeacher,
				toggleParticipantWebcam: isTeacher,
				toggleParticipantMic: isTeacher,
				toggleParticipantScreenshare: isTeacher,
				drawOnWhiteboard: true,
				toggleWhiteboard: isTeacher,
				toggleRecording: false,
				toggleVirtualBackground: false,
				toggleLivestream: false
			}
		}

		const meeting = new VideoSDKMeeting()
		meeting.init(config).then(() => {
			console.log('Meeting Started')
		})
	}
</script>

{#if hasJoined}
	<div class="h-full w-full" id="meetingDiv"></div>
{:else}
	<div class="grid h-full place-items-center">
		<LocalVideo bind:videoEnabled bind:audioEnabled>
			<button class="variant-filled-primary btn w-full" on:click={initMeeting}>
				Join class
			</button>
		</LocalVideo>
	</div>
{/if}
