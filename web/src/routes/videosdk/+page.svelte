<script lang="ts">
	import { PUBLIC_VIDEO_SDK_API_KEY } from '$env/static/public'
	import { dev } from '$app/environment'
	//@ts-expect-error
	import VideoSDKMeeting from '@videosdk.live/rtc-js-prebuilt/dist/index'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	console.log(`${$page.url.origin}/dashboad/student/classes`)

	let isTeacher = $page.data.user.role === 'teacher'

	onMount(() => {
		initMeeting()
	})

	function initMeeting() {
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
			redirectOnLeave: `${$page.url.origin}/dashboard/student/classes`,
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
		meeting.init(config)
	}
</script>

<div class="h-full w-full" id="meetingDiv"></div>
