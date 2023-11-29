<script lang="ts">
	import { page } from '$app/stores'
	import { safeFetch } from '$lib/api'
	import { chatStore } from '$lib/stores/chatStore'
	import { isEmoji, matchEmojis } from '$lib/utils/emoji'
	import type { Message, Profile } from '@prisma/client'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'
	import type { MessagesResponse } from '~/routes/api/messages/[id]/+server'
	import UserProfile from '../Profile/UserProfile.svelte'
	import Prompt from './Prompt.svelte'

	export let chatId: string | undefined
	export let recepient: Profile

	const toastStore = getToastStore()

	let elemChat: HTMLElement
	let isFetching = false

	onMount(async () => {
		chatStore.reset()
		if (chatId) {
			const res = await safeFetch<MessagesResponse>(fetch(`/api/messages/${chatId}`))
			if (res.ok) {
				console.log('got message', res.data)
				chatStore.addOldMessages(res.data.messages)
			}
		}
		scrollChatBottom()
		chatStore.resetUnreadMessages()
	})
	$: console.log($chatStore.messages)
	$: if ($chatStore.messages.length > 0) scrollChatBottom()

	$: typingString = getTypingString($chatStore.peopleTyping)

	function scrollChatBottom(): void {
		console.log('scrolling down')
		setTimeout(() => elemChat.scrollTo({ top: elemChat.scrollHeight, behavior: 'smooth' }), 0)
	}
	$: if (elemChat) console.log('elemChat.scrollTop', elemChat.scrollTop)
	$: if (elemChat) console.log('elemChat.scrollHeight', elemChat.scrollHeight)

	async function fetchOlderMessage(e: WheelEvent) {
		if (isFetching) return
		const isUp = e.deltaY < 0
		if (!isUp) return
		if (elemChat.scrollTop !== 0 || !$chatStore.isMore) return
		console.log('there is more')
		if (!chatStore.oldestMessage) return
		isFetching = true
		const res = await safeFetch<MessagesResponse>(
			fetch(`/api/messages/${chatId}?cursor=${chatStore.oldestMessage.id}`)
		)
		if (!res.ok) {
			toastStore.trigger({
				message: 'Failed to fetch older messages',
				background: 'bg-error-500'
			})
			return
		}

		isFetching = false

		if (res.data.isMore === false) $chatStore.isMore = false
		chatStore.addOldMessages(res.data.messages)
	}

	function getTypingString(peopleFirstNames: string[]) {
		switch (peopleFirstNames.length) {
			case 1:
				return `${peopleFirstNames[0]} is typing`
			case 2:
				return `${peopleFirstNames[0]} and ${peopleFirstNames[1]} are typing`
			case 3:
				return `${peopleFirstNames[0]}, ${peopleFirstNames[1]} and ${peopleFirstNames[2]} are typing`
			default:
				return 'Several people are typing'
		}
	}
</script>

<div class="flex h-full flex-col">
	<div class="p-2 sm:p-4">
		<UserProfile profile={recepient} avatarWidth="w-12" avatarHeight="h-12" />
	</div>
	{#if !$chatStore.isMore}
		<div class="text-center">
			<p>You reached the start of the conversation</p>
		</div>
	{/if}
	{#if isFetching}
		<div class="flex items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-b-4 border-t-4 border-surface-800"
			></div>
		</div>
	{/if}
	<section class="relative flex-1 p-2">
		<ul
			bind:this={elemChat}
			on:wheel={fetchOlderMessage}
			class="absolute inset-0 flex flex-1 flex-col gap-y-1 overflow-y-scroll p-2 sm:p-4"
		>
			{#each $chatStore.messages as msg}
				{#if msg.senderId !== $page.data.user.id}
					<!-- Got message from someone else -->
					<li id="message">
						<div id="inner" class="flex flex-1 items-center pl-2">
							<div
								id="bubble"
								class="card variant-filled-surface max-w-[75%] break-words px-2 py-1"
							>
								<header class="flex items-center justify-between gap-x-1">
									<small class="opacity-50">
										{msg.createdAt.toLocaleString()}
									</small>
								</header>
								<p class="emoji">{msg.text}</p>
							</div>
							<div id="spacer" class="flex-grow" />
						</div>
					</li>
				{:else}
					<!-- Current User sent message -->
					<li id="message">
						<div id="outer" class="flex">
							<div id="inner" class="flex flex-1 flex-row-reverse items-center">
								<div
									id="bubble"
									class="card max-w-[75%] break-words bg-primary-400 px-2 py-1"
								>
									<header class="flex items-center justify-between">
										<small class="opacity-50"
											>{msg.createdAt.toLocaleString()}</small
										>
									</header>
									<p class="emoji text-right">{msg.text}</p>
								</div>
								<div id="spacer" class="flex-grow"></div>
							</div>
						</div>
					</li>
				{/if}
			{/each}
		</ul>
	</section>

	<div>
		{#if $chatStore.peopleTyping.length > 0}
			<p class="semi-bold pl-2">{typingString}</p>
		{/if}
		<div>
			<Prompt {chatId} {recepient} />
		</div>
	</div>
</div>
