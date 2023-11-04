<script lang="ts">
	import { page } from '$app/stores'
	import type { Picker } from 'emoji-picker-element'
	import type { EmojiClickEvent } from 'emoji-picker-element/shared'
	import { SmilePlus } from 'lucide-svelte'
	import { onMount } from 'svelte'

	export let promptToPasteTo: string
	let emojiPicker: Picker
	let btn: HTMLButtonElement
	let show = false

	onMount(() => {
		const emojiPickedEvent = async (event: EmojiClickEvent) => {
			promptToPasteTo += event.detail.unicode
		}
		emojiPicker.addEventListener('emoji-click', emojiPickedEvent)

		return () => {
			emojiPicker.removeEventListener('emoji-click', emojiPickedEvent)
		}
	})

	function clickOutside(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			if (!node.contains(event.target as Node) && !btn.contains(event.target as Node)) {
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
	<button
		bind:this={btn}
		type="button"
		class="variant-glass-surface btn px-1"
		on:click={() => (show = !show)}
	>
		<SmilePlus class="h-5 w-5" />
	</button>
	<emoji-picker
		use:clickOutside
		bind:this={emojiPicker}
		class="light absolute bottom-12 left-0 right-0"
		class:hidden={!show}
		class:block={show}
		emoji-version="15.0"
		locale={$page.data.user.preferedLanguage}
	>
	</emoji-picker>
</div>

<style>
	@media screen and (max-width: 320px) {
		emoji-picker {
			--num-columns: 6;
			--category-emoji-size: 1.125rem;
		}
	}
	emoji-picker {
		--emoji-font-family: 'Noto Color Emoji', sans-serif;
	}
</style>
