<script lang="ts">
	import { chatStore } from '$lib/stores/chatStore'
	import { userStore } from '$lib/stores/user'
	import { stringToLocalTime } from '$lib/utils/datetime'
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import { onMount } from 'svelte'
	import Avatar from '../Avatar.svelte'
	import Prompt from './Prompt.svelte'
	import Profile from '../Profile/User.svelte'
	import type { User } from '$lib/api/api.gen'

	export let conversationId: number | undefined // undefined if no conversation exists yet
	export let recepient: User | undefined // undefined if group chat

	let elemChat: HTMLElement

	onMount(() => {
		scrollChatBottom()
		chatStore.resetUnreadMessages()
	})
	$: console.log($chatStore.messages)
	$: if ($chatStore.messages.length > 0) scrollChatBottom()
	$: typingString = getTypingString($chatStore.peopleTyping)

	function scrollChatBottom(): void {
		setTimeout(() => elemChat.scrollTo({ top: elemChat.scrollHeight, behavior: 'smooth' }), 0)
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

<div class="flex h-full flex-col p-2">
	{#if recepient}
		<div class="sm:p-4">
			<Profile user={recepient} avatarWidth="w-12" avatarHeight="h-12" />
		</div>
	{/if}
	<!-- Conversation -->
	<section bind:this={elemChat} class="flex-1 space-y-4 overflow-y-auto sm:p-4">
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

	{#if $chatStore.peopleTyping.length > 0}
		<p class="semi-bold pl-2">{typingString}</p>
	{/if}

	<!-- Prompt -->
	<Prompt {conversationId} {recepient} />
</div>
