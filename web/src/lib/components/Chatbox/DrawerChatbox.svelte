<script lang="ts">
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import type { User } from '$lib/api/api.gen'
	import { chatStore } from '$lib/stores/chatStore'
	import { userStore } from '$lib/stores/user'
	import { stringToLocalTime } from '$lib/utils/datetime'
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import { onMount } from 'svelte'
	import Avatar from '../Avatar.svelte'
	import Profile from '../Profile/UserProfile.svelte'
	import Prompt from './Prompt.svelte'
	import { getToastStore } from '@skeletonlabs/skeleton'

	export let conversationId: number | undefined = undefined // undefined if no conversation exists yet
	export let recepient: User | undefined = undefined // undefined if group chat

	const toastStore = getToastStore()

	let elemChat: HTMLElement
	let isFetching = false

	onMount(async () => {
		if (!conversationId) chatStore.reset()
		if (conversationId && $chatStore.conversationId !== conversationId) {
			chatStore.reset()
			const res = await safeFetch(
				fetchers.messageService(fetch, $page.data.session).listMessagesOfConversation({
					conversationId
				})
			)
			if (res.ok) {
				console.log('got message', res.data.messages)
				chatStore.addOldMessages(res.data.messages)
			}
		}
		// await fetchOlderMessage()
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
		const res = await safeFetch(
			fetchers
				.messageService(fetch, $page.data.session)
				.listMessagesOfConversationWithCursor({
					conversationId: conversationId!,
					cursor: chatStore.oldestMessage.sentAt
				})
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

<section class="flex h-full flex-col p-2">
	<div>
		{#if recepient}
			<div class="sm:p-4">
				<Profile user={recepient} avatarWidth="w-12" avatarHeight="h-12" />
			</div>
		{/if}
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
	</div>
	<section
		bind:this={elemChat}
		on:wheel={fetchOlderMessage}
		class="flex flex-1 flex-col overflow-y-auto sm:p-4"
	>
		{#each $chatStore.messages as msg}
			{#if msg.sender.id !== $userStore?.id}
				<!-- Got message from someone else -->
				<div id="message">
					<div id="outer" class="flex">
						<div id="avatar" class="self-end">
							<Avatar
								initials={getInitials(msg.sender.firstName, msg.sender.lastName)}
								src={msg.sender.avatarUrl}
								width="w-8"
							/>
						</div>
						<div id="inner" class="flex flex-1 items-center pl-2">
							<div
								id="bubble"
								class="wrap-bal card variant-filled-surface max-w-[75%] break-words px-2"
							>
								<header class="flex items-center justify-between gap-x-1">
									<p class="font-bold">
										{getPublicName(msg.sender.firstName, msg.sender.lastName)}
									</p>
									<small class="opacity-50">
										{stringToLocalTime(msg.sentAt)}
									</small>
								</header>
								<p>{msg.text}</p>
							</div>
							<!-- <div id="actions" class="pl-2 min-w-fit shrink-0">
										<div class="hidden sm:flex items-center space-x-2 flex-row-reverse">
											<TrippleDots />
											<ShareIcon />
											<ReactionIcon />
										</div>
										<div class="sm:hidden">
											<TrippleDots />
										</div>
									</div> -->
							<div id="spacer" class="flex-grow"></div>
						</div>
					</div>
				</div>
			{:else}
				<!-- Current User sent message -->
				<div id="message">
					<div id="outer" class="flex">
						<div id="inner" class="flex flex-1 flex-row-reverse items-center">
							<div
								id="bubble"
								class="wrap-bal card variant-filled-primary max-w-[75%] break-words px-2"
							>
								<header class="flex items-center justify-between">
									<small class="opacity-50">{stringToLocalTime(msg.sentAt)}</small
									>
								</header>
								<p>{msg.text}</p>
							</div>
							<!-- <div id="actions" class="pr-2 min-w-fit">
										<div class="hidden sm:flex items-center space-x-2">
											<TrippleDots />
											<ShareIcon />
											<ReactionIcon />
										</div>
										<div class="sm:hidden">
											<TrippleDots />
										</div>
									</div> -->
							<div id="spacer" class="flex-grow"></div>
						</div>
						<div id="status" class="flex w-5 flex-col items-center justify-center">
							<small class="opacity-50"></small>
						</div>
					</div>
				</div>
			{/if}
		{/each}
	</section>
	<div>
		{#if $chatStore.peopleTyping.length > 0}
			<p class="semi-bold pl-2">{typingString}</p>
		{/if}
		<div class=" bg-red-400">
			<Prompt {conversationId} {recepient} />
		</div>
	</div>
</section>
