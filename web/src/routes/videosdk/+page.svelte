<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
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

			VideoSDK.config(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJkZjc5NzliOS1mYjM3LTQxYTctYjQ4MC05YWRlODk1NTJmNzAiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY5NzU3NDgzMCwiZXhwIjoxNjk3NjYxMjMwfQ.QDMLT9j6n1dvLbvmeJz9NvSbX7qAXfL1umHGlB5ynb0'
			) // required;
			meeting = VideoSDK.initMeeting({
				meetingId: 'ue0p-stx9-l8y3', // required
				name: "Eliott's Org", // required
				micEnabled: true, // optional, default: true
				webcamEnabled: true // optional, default: true
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
	<script src="https://sdk.videosdk.live/js-sdk/0.0.63/videosdk.js"></script>
</svelte:head>

<Layout>
	<h1 class="h1" slot="title">Video SDK</h1>

	<button use:handleClick>Join meeting</button>

	<div bind:this={textDiv} id="textDiv"></div>

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
					<video class="video-frame" playsinline width="300" id="v-{participant.id}">
					</video>
					<audio autoplay={false} playsinline controls={false} id="a-{participant.id}">
					</audio>
				</div>
			{/each}
		</div>
	{/if}
</Layout>
