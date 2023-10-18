<script lang="ts">
	import { dev } from '$app/environment'
	import { page } from '$app/stores'
	import { PUBLIC_VIDEO_SDK_API_KEY } from '$env/static/public'
	import { getPublicName } from '$lib/utils/initials'
	//@ts-expect-error
	import VideoSDKMeeting from '@videosdk.live/rtc-js-prebuilt/dist/index'
	import { onMount } from 'svelte'

	export let data

	let isTeacher = data.user.role === 'teacher' && data.classDetails.teacher.id === data.user.id

	onMount(() => {
		initMeeting()
	})

	function initMeeting() {
		const config = {
			debug: dev ? true : false,
			apiKey: PUBLIC_VIDEO_SDK_API_KEY,
			meetingId: data.classDetails.class.id,
			name: getPublicName(data.user.firstName, data.user.lastName),
			containerId: 'meetingDiv',

			micEnabled: false,
			webcamEnabled: false,
			participantCanToggleSelfWebcam: true,
			participantCanToggleSelfMic: true,
			raiseHandEnabled: true,
			chatEnabled: true,
			screenShareEnabled: true,
			whiteboardEnabled: true,

			joinWithoutUserInteraction: false,
			joinScreen: {
				visible: true,
				title: data.classDetails.class.name,
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

<div class="h-full w-full" id="meetingDiv"></div>
