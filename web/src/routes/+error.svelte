<script lang="ts">
	import { page } from '$app/stores'
	import Layout from '$lib/components/Layout.svelte'
</script>

<Layout>
	<h1 slot="title" class="h1">
		<span class="text-error-500">{$page.status}</span>: {$page.error?.message}
	</h1>
	{#if $page.status === 404}
		<a href="/" class="anchor">There's nothing here. Go back home</a>
	{:else}
		<p>
			There was an unexpected error. Please try again. If the problem persists, please contact
			us at <a class="anchor" href="mailto:contact@passnem.com">contact@passnem.com</a>
		</p>
	{/if}
</Layout>
