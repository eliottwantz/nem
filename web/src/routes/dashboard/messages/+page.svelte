<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import { getPublicName } from '$lib/utils/initials'

	export let data
</script>

<Layout>
	<h1 class="h1" slot="title">Messages</h1>

	<p class="mb-8 text-2xl">Please select a conversation</p>

	<section>
		<nav class="list-nav">
			{#each data.conversations as convo}
				{@const user = convo.users.find((u) => u.id !== data.user.id)}
				<a href="/dashboard/messages/{convo.id}">
					{getPublicName(user?.firstName, user?.lastName)}
				</a>
			{/each}
		</nav>
	</section>
</Layout>
