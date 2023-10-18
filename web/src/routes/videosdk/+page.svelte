<script lang="ts">
	import { PUBLIC_VIDEO_SDK_TEMP_TOKEN } from '$env/static/public'
	import { Meeting, Participant, VideoSDK } from '@videosdk.live/js-sdk'

	let videoContainer: HTMLDivElement
	let textDiv: HTMLDivElement
	let participants: Participant[] = []
	let meeting: Meeting | null
	let localParticipantVideo: HTMLVideoElement | undefined
	let remoteParticipantId = ''

	function handleClick(joinButton: HTMLButtonElement) {
		const evv = function () {
			joinButton.style.display = 'none'
			textDiv.textContent = 'Please wait, we are joining the meeting'

			VideoSDK.config(PUBLIC_VIDEO_SDK_TEMP_TOKEN)
			meeting = VideoSDK.initMeeting({
				meetingId: 'ue0p-stx9-l8y3', // required
				name: "Eliott's Org", // required
				micEnabled: false, // optional, default: true
				webcamEnabled: false, // optional, default: true
				chatEnabled: false,
				maxResolution: 'sd'
			})

			meeting.join()

			meeting.on('meeting-joined', () => {
				textDiv.style.display = 'none'
			})

			// other participants
			meeting.on('participant-joined', (participant: Participant) => {
				participants = [...participants, participant]
				remoteParticipantId = participant.id
			})

			// participants left
			meeting.on('participant-left', (participant) => {
				participants = participants.filter((p) => p.id !== participant.id)
			})
		}

		joinButton.addEventListener('click', evv)

		return {
			destroy() {
				joinButton.removeEventListener('click', evv)
			}
		}
	}

	function handleStreamTrack(
		divContainer: HTMLDivElement,
		{ participant }: { participant: Participant }
	) {
		let audioElement = divContainer.querySelector('audio')!
		participant.on('stream-enabled', (stream) => {
			setTrack(stream, audioElement, participant, false)
		})

		return {
			destroy() {},
			update({ participant }: { participant: Participant }) {
				console.log('participant update action', participant)
			}
		}
	}

	// setting media track
	function setTrack(
		stream: any,
		audioElement: HTMLAudioElement,
		participant: Participant,
		isLocal: boolean
	) {
		if (stream.kind == 'video') {
			const mediaStream = new MediaStream()
			mediaStream.addTrack(stream.track)
			let videoElm = document.getElementById(`v-${participant.id}`)! as HTMLVideoElement
			videoElm.srcObject = mediaStream
			videoElm
				.play()
				.catch((error) => console.error('videoElem.current.play() failed', error))
		}
		if (stream.kind == 'audio' && !isLocal) {
			const mediaStream = new MediaStream()
			mediaStream.addTrack(stream.track)
			audioElement.srcObject = mediaStream
			audioElement.play().catch((error) => console.error('audioElem.play() failed', error))
		}
	}
</script>

<svelte:head>
	<script>
		var script = document.createElement('script')
		script.type = 'text/javascript'

		script.addEventListener('load', function (event) {
			const config = {
				name: 'Demo User',
				meetingId: 'milkyway',
				apiKey: 'df7979b9-fb37-41a7-b480-9ade89552f70',

				containerId: 'meetingDiv',

				micEnabled: true,
				webcamEnabled: true,
				participantCanToggleSelfWebcam: true,
				participantCanToggleSelfMic: true,

				chatEnabled: true,
				screenShareEnabled: true,
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
		})

		script.src = 'https://sdk.videosdk.live/rtc-js-prebuilt/0.3.33/rtc-js-prebuilt.js'
		document.getElementsByTagName('head')[0].appendChild(script)
	</script>
</svelte:head>

<h1 class="h1 text-center">Video SDK</h1>

<button disabled use:handleClick>Join meeting</button>

<div bind:this={textDiv} id="textDiv"></div>

<div class="h-full w-full" id="meetingDiv"></div>
{#if meeting}
	<div class="row" bind:this={videoContainer} id="videoContainer">
		<!-- Local participant -->
		{#if meeting.localParticipant}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				bind:this={localParticipantVideo}
				class="video-frame"
				playsinline
				width="300"
				id="v-{meeting.localParticipant.id}"
			>
			</video>
		{/if}
		<!-- Local participant -->

		{#each participants as participant}
			<div use:handleStreamTrack={{ participant }}>
				<!-- svelte-ignore a11y-media-has-caption -->
				<video class="video-frame" playsinline width="300" id="v-{participant.id}"> </video>
				<audio autoplay={false} playsinline controls={false} id="a-{participant.id}">
				</audio>
			</div>
		{/each}
	</div>
{/if}
