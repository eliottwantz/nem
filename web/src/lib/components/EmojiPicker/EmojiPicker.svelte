<script lang="ts">
	import { SmilePlus } from 'lucide-svelte'
	import { onMount } from 'svelte'
	import type { EmojiPickerElement, EmojiPickEvent } from 'unicode-emoji-picker'

	export let promptToPasteTo: string
	let emojiPicker: EmojiPickerElement
	let show = false

	onMount(() => {
		const emojiPickedEvent = async (event: EmojiPickEvent) => {
			console.log('emoji picked', event.detail.emoji)
			promptToPasteTo += event.detail.emoji
		}
		emojiPicker.addEventListener('emoji-pick', emojiPickedEvent)

		return () => {
			emojiPicker.removeEventListener('emoji-pick', emojiPickedEvent)
		}
	})

	function clickOutside(node: HTMLElement) {
		console.log('click outside')
		const handleClick = (event: MouseEvent) => {
			console.log('click emoji shit', event.target)
			if (node && !node.contains(event.target as Node)) {
				show = false
			}
		}

		document.addEventListener('click', handleClick, true)

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true)
			}
		}
	}
</script>

<div class="relative">
	<button type="button" class="variant-glass-surface btn px-1" on:click={() => (show = !show)}>
		<SmilePlus class="h-5 w-5" />
	</button>
	<div use:clickOutside class="absolute bottom-12 left-0" class:hidden={!show} class:block={show}>
		<unicode-emoji-picker version="15.0" bind:this={emojiPicker}></unicode-emoji-picker>
	</div>
</div>

<style>
	unicode-emoji-picker {
		--emoji-font-family: 'NotoColorFlags', apple color emoji, segoe ui emoji, 'Noto Color Emoji',
			android emoji, emojisymbols, emojione mozilla, twemoji mozilla, segoe ui symbol,
			sans-serif;
	}
</style>
