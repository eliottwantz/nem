<script lang="ts">
	import { PUBLIC_VIDEO_SDK_API_KEY } from '$env/static/public'
	import { dev } from '$app/environment'
	import LocalVideo from '$lib/components/MeetingVideo/LocalVideo.svelte'
	//@ts-expect-error
	import VideoSDKMeeting from '@videosdk.live/rtc-js-prebuilt/dist/index'
	import { page } from '$app/stores'

	let hasJoined = false
	let audioEnabled = false
	let videoEnabled = false

	let isTeacher = $page.data.user.role === 'teacher'

	function initMeeting() {
		hasJoined = true
		const config = {
			debug: dev ? true : false,
			apiKey: PUBLIC_VIDEO_SDK_API_KEY,
			meetingId: 'milkyway',
			name: 'Demo User',
			containerId: 'meetingDiv',

			micEnabled: audioEnabled,
			webcamEnabled: videoEnabled,
			participantCanToggleSelfWebcam: true,
			participantCanToggleSelfMic: true,
			raiseHandEnabled: true,
			chatEnabled: true,
			screenShareEnabled: true,
			whiteboardEnabled: true,

			joinScreen: {
				visible: true,
				title: 'Daily scrum',
				meetingUrl: window.location.href
			},
			notificationSoundEnabled: false,
			leftScreen: {
				actionButton: {
					label: 'Go to classes',
					href: `${$page.url.origin}dashboad/student/classes`
				},
				rejoinButtonEnabled: true
			},
			audioConfig: {
				quality: 'high_quality' //speech_low_quality , high_quality
			},
			maxResolution: 'hd',
			videoConfig: {
				resolution: 'h720p_w1280p', //h360p_w640p, h540p_w960p, h1080p_w1920p
				optimizationMode: 'motion', // text , detail
				multiStream: false
			},
			screenShareConfig: {
				resolution: 'h720p_15fps',
				optimizationMode: 'text'
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
				changeLayout: true,
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
		meeting.init(config)
	}
</script>

<h1 class="h1 text-center">Video SDK</h1>
{#if hasJoined}
	<div class="h-full w-full" id="meetingDiv"></div>
{:else}
	<div class="grid h-full place-items-center">
		<div class="flex w-max flex-col items-center justify-center">
			<LocalVideo bind:videoEnabled bind:audioEnabled>
				<button class="variant-filled-primary btn w-full" on:click={initMeeting}>
					Join class
				</button>
			</LocalVideo>
		</div>
	</div>
{/if}
