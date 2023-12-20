<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import Layout from '$lib/components/Layout.svelte'
	import UserProfile from '$lib/components/Profile/UserProfile.svelte'

	export let data

	const recipients = data.chats.map((c) => {
		if (c.users[0].id !== data.user.id) return c.users[0].profile!
		else return c.users[1].profile!
	})
	$: console.log('recipients', recipients)
</script>

<Layout>
	<h1 slot="title">Messages</h1>

	{#if data.chats.length > 0}
		<p class="mb-8 text-2xl">Please select a conversation</p>
	{:else if data.user.role === 'teacher'}
		<p class="mb-8 text-2xl">No student have reached out to you yet</p>
	{:else}
		<p class="mb-8 text-2xl">
			You don't have any conversations yet. Start by sending a message to a
			<a href={route('/teachers', langParams())} class="anchor"> teacher </a>
		</p>
	{/if}

	<section>
		<nav class="list-nav">
			{#each data.chats as chat, i}
				<a
					href={route('/dashboard/messages/[id]', {
						id: chat.id,
						lang: langParams().lang
					})}
				>
					<UserProfile profile={recipients[i]} avatarHeight="h-12" avatarWidth="w-12" />
					<small class="opacity-50">
						{new Date(chat.createdAt).toLocaleString()}
					</small>
				</a>
			{/each}
		</nav>
	</section>
</Layout>
