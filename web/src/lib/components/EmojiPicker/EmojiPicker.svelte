<script lang="ts">
	import { onMount } from 'svelte'
	import type { EmojiPickerElement, EmojiPickEvent } from 'unicode-emoji-picker'

	let emojiPicker: EmojiPickerElement
	let emojiModal: HTMLDialogElement

	onMount(() => {
		const emojiPickedEvent = async (event: EmojiPickEvent) => {
			console.log('emoji picked', event.detail.emoji)
			await navigator.clipboard.writeText(event.detail.emoji)
			emojiModal.close()
		}
		emojiPicker.addEventListener('emoji-pick', emojiPickedEvent)

		return () => {
			emojiPicker.removeEventListener('emoji-pick', emojiPickedEvent)
		}
	})
</script>

<button on:click={() => emojiModal.showModal()}>Show emojis</button>
<dialog bind:this={emojiModal}>
	<div>
		<unicode-emoji-picker version="15.0" bind:this={emojiPicker}></unicode-emoji-picker>
	</div>
</dialog>

<style>
	unicode-emoji-picker {
		--emoji-font-family: 'NotoColorFlags', apple color emoji, segoe ui emoji, 'Noto Color Emoji',
			android emoji, emojisymbols, emojione mozilla, twemoji mozilla, segoe ui symbol,
			sans-serif;
	}
</style>
