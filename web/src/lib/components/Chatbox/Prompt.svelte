<script lang="ts">
	import { fetchers, safeFetch } from '$lib/api'
	import { ws } from '$lib/api/ws'
	import AttachmentIcon from '$lib/icons/AttachmentIcon.svelte'
	import SendIcon from '$lib/icons/SendIcon.svelte'
	import { userStore } from '$lib/stores/user'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { page } from '$app/stores'
	import type { User } from '$lib/api/api.gen'

	export let conversationId: number | undefined // undefined if no conversation exists yet
	export let recepient: User | undefined // undefined if group chat

	const toastStore = getToastStore()
	const maxChars = 1000

	let prompt = ''
	let promptInput: HTMLInputElement
	let currentlyTyping = false
	let isSubmiting = false
	let attachments: FileList
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
</script>

{#if attachments}
	{#each attachments as file}
		<p>{file.name}</p>
		{@const url = URL.createObjectURL(file)}
		<img src={url} alt={file.name} class="h-32 w-32 rounded-lg object-cover" />
	{/each}
{/if}

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
		<input
			bind:this={promptInput}
			bind:value={prompt}
			on:input={handleOnInput}
			class="input border-0 px-3 outline-none ring-0"
			placeholder="Message"
		/>
		<div>
			{#if prompt}
				<button
					class="variant-filled-primary btn px-1 py-1"
					disabled={!prompt || promptToBig || isSubmiting}
					on:click={handleSubmit}
				>
					<SendIcon class="h-5 w-5" />
				</button>
			{/if}
			{#if !prompt}
				<div class="h-0 w-0 overflow-hidden">
					<input type="file" bind:this={fileInput} bind:files={attachments} on:change />
				</div>
				<button class="btn px-1" on:click={() => fileInput.click()}>
					<AttachmentIcon class="h-5 w-5" />
				</button>
			{/if}
		</div>
	</form>
</section>
