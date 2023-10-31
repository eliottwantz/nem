<script lang="ts">
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import type { User } from '$lib/api/api.gen'
	import { ws } from '$lib/api/ws'
	import AttachmentIcon from '$lib/icons/AttachmentIcon.svelte'
	import SendIcon from '$lib/icons/SendIcon.svelte'
	import { userStore } from '$lib/stores/user'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { Plus, X } from 'lucide-svelte'
	import EmojiPicker from '../EmojiPicker/EmojiPicker.svelte'

	export let conversationId: number | undefined // undefined if no conversation exists yet
	export let recepient: User | undefined // undefined if group chat

	const toastStore = getToastStore()
	const maxChars = 1000

	let prompt = ''
	let promptInput: HTMLInputElement
	let currentlyTyping = false
	let isSubmiting = false
	// let files: FileList
	// let attachments: File[] = []
	// $: console.log('-------------> attachments', attachments)
	let fileInput: HTMLInputElement

	$: promptToBig = remainingChars < 0
	$: remainingChars = maxChars - prompt.length

	async function handleSubmit() {
		if (!prompt || !prompt.trim()) return
		isSubmiting = true

		if (!conversationId) {
			const res = await safeFetch(
				fetchers.messageService(fetch, $page.data.session).createOneToOneConversation({
					recepientId: recepient!.id
				})
			)
			if (!res.ok) {
				toastStore.trigger({
					message: res.cause,
					background: 'bg-error-500'
				})
				return
			}
			conversationId = res.data.conversationId
		}

		ws.send({
			action: 'stopTyping',
			roomId: conversationId,
			data: $userStore?.firstName
		})
		currentlyTyping = false

		const res = recepient
			? await safeFetch(
					fetchers.messageService(fetch, $page.data.session!).sendMessageToUser({
						message: {
							conversationId: conversationId,
							text: prompt.trim()
						}
					})
			  )
			: await safeFetch(
					fetchers.messageService(fetch, $page.data.session!).sendMessageToClass({
						message: {
							conversationId: conversationId,
							text: prompt.trim()
						}
					})
			  )

		isSubmiting = false
		if (!res.ok) {
			toastStore.trigger({
				message: res.cause,
				background: 'variant-filled-error'
			})
			return
		}

		console.log('SUCESS:\n', res)
		prompt = ''
		promptInput.focus()
	}

	function handleOnInput(): void {
		if (!conversationId) return
		if (prompt.length === 1 && !currentlyTyping) {
			ws.send({
				action: 'startTyping',
				roomId: conversationId,
				data: $userStore?.firstName
			})
			currentlyTyping = true
		} else if (prompt.length === 0) {
			ws.send({
				action: 'stopTyping',
				roomId: conversationId,
				data: $userStore?.firstName
			})
			currentlyTyping = false
		}
	}

	// function handleFileInputChange(e: Event) {
	// 	const newFiles = (<HTMLInputElement>e.target).files
	// 	if (!newFiles) return
	// 	attachments = [...attachments, ...Array.from(newFiles)]
	// }
</script>

<!-- {#if attachments.length}
	<div class="flex w-full flex-wrap gap-2">
		{#each attachments as file}
			{@const url = URL.createObjectURL(file)}
			<div class="relative">
				<img src={url} alt={file.name} class="peer h-32 w-32 rounded-lg object-cover" />
				<div
					class="invisible absolute inset-0 h-1/4 bg-gradient-to-b from-black to-transparent opacity-25 peer-hover:visible"
				></div>
				<span
					class="absolute right-2 top-0 cursor-pointer"
					on:click={() => {
						URL.revokeObjectURL(url)
						attachments = attachments.filter((f) => f !== file)
					}}><X class="text-white" /></span
				>
			</div>
		{/each}
		<div
			title="Add file"
			class="cursor-pointer border border-surface-500 p-12 hover:bg-surface-400"
			on:click={() => fileInput.click()}
		>
			<Plus class="h-6 w-6" />
		</div>
	</div>
{/if} -->

<section class="sm:px-1 sm:py-2">
	<div class="sm:px-3">
		{#if remainingChars >= 0 && remainingChars <= 100}
			<span class="text-warning-500">{remainingChars}/1000</span>
		{/if}
		{#if promptToBig}
			<span class="text-error-500">{remainingChars}/1000</span>
		{/if}
		{#if promptToBig}
			<span class="text-red-500">You cannot write more than 1000 characters</span>
		{/if}
	</div>

	<form class="flex w-full items-center space-x-1">
		<EmojiPicker bind:promptToPasteTo={prompt} />
		<input
			bind:this={promptInput}
			bind:value={prompt}
			on:input={handleOnInput}
			class="input border-0 px-3 outline-none ring-0"
			placeholder="Message"
		/>
		<div class="flex items-center gap-x-1">
			{#if prompt}
				<button
					class="variant-filled-primary btn px-1 py-1"
					disabled={!prompt || promptToBig || isSubmiting}
					on:click={handleSubmit}
				>
					<SendIcon class="h-5 w-5" />
				</button>
			{/if}
			<!-- <div class="h-0 w-0 overflow-hidden">
				<input
					type="file"
					multiple
					bind:this={fileInput}
					bind:files
					on:change={handleFileInputChange}
				/>
			</div>
			<button class="variant-glass-surface btn px-1" on:click={() => fileInput.click()}>
				<AttachmentIcon class="h-5 w-5" />
			</button> -->
		</div>
	</form>
</section>
