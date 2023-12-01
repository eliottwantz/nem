<script lang="ts">
	import { page } from '$app/stores'
	import Link from '$components/Link.svelte'
	import Layout from '$lib/components/Layout.svelte'
</script>

<Layout>
	<h1 slot="title" class="h1">
		<span class="h1 text-error-500">{$page.status}</span>: {$page.error?.message}
	</h1>
	{#if $page.status === 404}
		<p>There's nothing here. <Link href="/" class="anchor">Go back home</Link></p>
	{:else}
		<p>There was an unexpected error. Please try again.</p>
	{/if}
	<p class="mt-4">
		If the problem persists, please contact us at <a
			class="anchor"
			href="mailto:contact@passnem.com">contact@passnem.com</a
		>
	</p>
</Layout>
