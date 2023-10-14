<script lang="ts">
	import { chatStore } from '$lib/stores/chatStore'
	import { userStore } from '$lib/stores/user'
	import { stringToLocalTime } from '$lib/utils/datetime'
	import { getInitials } from '$lib/utils/initials'
	import { onMount } from 'svelte'
	import Avatar from '../Avatar.svelte'
	import Prompt from './Prompt.svelte'

	export let roomId: string

	let elemChat: HTMLElement

	onMount(() => {
		scrollChatBottom()
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

<div class="grid h-full grid-rows-[1fr_auto] p-2">
	<!-- Conversation -->
	<section bind:this={elemChat} class="space-y-4 overflow-y-auto sm:p-4">
		{#each $chatStore.messages as msg}
			{#if msg.user.id !== $userStore?.id}
				<!-- Got message from someone else -->
				<div id="message">
					<div id="outer" class="flex">
						<div id="avatar" class="self-end">
							<Avatar
								initials={getInitials(msg.user.firstName, msg.user.lastName)}
								src={msg.user.avatarUrl}
								width="w-8"
							/>
						</div>
						<div id="inner" class="flex flex-1 items-center pl-2">
							<div
								id="bubble"
								class="wrap-bal card variant-filled-surface max-w-[75%] break-words px-2"
							>
								<header class="flex items-center justify-between">
									<p class="font-bold">{msg.user.firstName}</p>
									<small class="opacity-50"
										>{stringToLocalTime(msg.createdAt)}</small
									>
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
									<p class="font-bold">{msg.user.firstName}</p>
									<small class="opacity-50"
										>{stringToLocalTime(msg.createdAt)}</small
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
	<Prompt {roomId} />
</div>
