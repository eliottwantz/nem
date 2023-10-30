<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import UserProfile from '$lib/components/Profile/UserProfile.svelte'
	import { stringToLocalTime } from '$lib/utils/datetime'

	export let data
</script>

<Layout>
	<h1 class="h1" slot="title">Messages</h1>

	{#if data.conversations.length > 0}
		<p class="mb-8 text-2xl">Please select a conversation</p>
	{:else if data.user.role === 'teacher'}
		<p class="mb-8 text-2xl">No student have reached out to you yet</p>
	{:else}
		<p class="mb-8 text-2xl">
			You don't have any conversations yet. Start by sending a message to a <a
				href="/teachers"
				class="anchor">teacher</a
			>
		</p>
	{/if}

	<section>
		<nav class="list-nav">
			{#each data.conversations as convo}
				{@const recipient =
					convo.users[0].id !== data.user.id ? convo.users[0] : convo.users[1]}
				{@debug convo}
				<a href="/dashboard/messages/{convo.id}">
					<UserProfile user={recipient} avatarHeight="h-12" avatarWidth="w-12" />
					<small class="opacity-50">
						{stringToLocalTime(convo.lastSent)}
					</small>
				</a>
			{/each}
		</nav>
	</section>
</Layout>
