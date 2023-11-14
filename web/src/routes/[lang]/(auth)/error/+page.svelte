<script lang="ts">
	import { page } from '$app/stores'
	import Layout from '$lib/components/Layout.svelte'
	import { signOut } from '@auth/sveltekit/client'
	import { onMount } from 'svelte'
</script>

<Layout>
	<h1 class="h1" slot="title">Authentication Error</h1>

	<p class="text-xl">You might have used an expired or incorrect link</p>

	<p class="mt-4 text-xl">
		If the problem persists, please contact us at <a
			class="anchor"
			href="mailto:contact@passnem.com">contact@passnem.com</a
		>
	</p>
</Layout>
